# Pedinno Website Builder — MERN

Drag & drop website builder — non-technical user apni business website khud bana sake,
customise kare aur publish kare. WordPress ya kisi plugin ke bina, poora **MERN** stack pe.

```
MernStack/
├─ client/     React + Tailwind builder (UI, widgets, templates, editor)
├─ server/     Express + MongoDB (save, upload, publish, auth)
├─ docs/       analysis + architecture notes
└─ package.json  root — ek command se dono chalte hain
```

## Chalane ka tarika

```bash
npm run install:all      # root + client + server, teeno ke dependencies
npm run dev              # client (5173) + server (4000) — dono ek saath
```

Alag-alag chalane ke liye:
```bash
npm run dev:client
npm run dev:server
```

## Client (React)

| | |
|---|---|
| Widgets | 33 widgets, 89 layout variants, 119 fields |
| Templates | 61 (1 blank + 60 generated), 20 palettes, 14 font pairings |
| Editing | click to select, double-click inline edit, drag & drop sections, list items ka reorder |
| Pages | multi-page, shared header/footer, page/section/URL/phone/WhatsApp/email links |
| Export | per-page HTML + single-file browser preview, SEO meta + JSON-LD |
| Tests | 8 suites — `npm test` |

Detail: [`client/README.md`](client/README.md)

## Server (Express + MongoDB)

| Route | Kaam |
|---|---|
| `POST /api/auth/register` · `/login` | JWT |
| `GET /api/sites` · `POST /api/sites` | project list / naya project |
| `GET  /api/sites/:id` · `PATCH /api/sites/:id` | load / autosave |
| `POST /api/upload` | image → URL (base64 nahi) |
| `POST /api/sites/:id/publish` | HTML banao + save |
| `GET  /s/:slug` | **live website** |

## Docs

- [`docs/elementor-analysis.md`](docs/elementor-analysis.md) — Elementor ke widgets, drag & drop aur editing ka analysis
- [`docs/without-wordpress.md`](docs/without-wordpress.md) — WordPress/PHP ke bina wahi cheez kaise banti hai, code ke saath

## Environment

`server/.env` banao (`server/.env.example` se copy karke):
```
PORT=4000
MONGODB_URI=mongodb+srv://...        # MongoDB Atlas ka connection string
JWT_SECRET=koi-lamba-random-string
CLIENT_URL=http://localhost:5173
```
`.env` kabhi commit mat karna — `.gitignore` me pehle se hai.
