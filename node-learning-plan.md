# Node.js + ImageKit DAM Workflow — Master Plan
> Mar 5 – Apr 4 · 1–2 hrs weekdays · 3–4 hrs weekends  
> Study + watch videos · Write your own JS · Understand how things work  
> Final Project: Asset Review Workflow Automation in ImageKit DAM

---

## ⚠️ First Thing Before You Write Any Code

Check which SDK version your project uses:

```bash
npm list @imagekit/nodejs   # new SDK (v7+)
npm list imagekit           # old SDK
```

| Package | Init syntax | Upload syntax |
|---|---|---|
| `imagekit` (old) | `new ImageKit({...})` | `imagekit.upload()` |
| `@imagekit/nodejs` (new v7+) | `new ImageKit({...})` | `client.files.upload()` |

The project plan uses old SDK syntax. The GitHub README uses new SDK syntax. **Do not mix them.**

---

## What You're Building

An **Asset Review Workflow** — a realistic DAM automation tool:

1. User uploads a file → ImageKit AI auto-tags it, sets Status = "Pending"
2. Reviewer sees a queue of Pending assets with AI-suggested tags
3. Reviewer clicks Approve / Reject / Revert → backend updates custom metadata in ImageKit
4. Webhooks notify the backend in real time when AI tasks complete
5. Advanced: move rejected assets to /archive, generate signed URLs, bulk enrich old assets

### Current State (already built)
- Express server on port 8000, ImageKit SDK initialized via env vars
- `GET /ik-auth` → returns auth params for client-side upload
- `GET /api/search` → lists files by folder using `imagekit.listFiles()`
- `mapItem()` → trims raw IK file response to UI-safe shape
- Review queue UI with thumbnail, name, folder, status badge
- Detail panel with metadata grid + Approve / Reject / Revert buttons (not wired yet)

### Gaps to fill
- No POST routes for approve / reject / revert
- No frontend JS calling the backend
- No custom metadata fields defined in ImageKit yet
- AI Tasks not integrated
- Upload flow not wired to the "New Upload" button

---

## SDK Methods — Full Checklist

### Auth & Setup
- [x] `new ImageKit({ publicKey, privateKey, urlEndpoint })`
- [x] `imagekit.getAuthenticationParameters()` ← understand this deeper in Phase 2

### File Listing & Search
- [x] `imagekit.listFiles({ searchQuery, limit, skip, sort })`
- [ ] `imagekit.getFileDetails(fileId)`
- [ ] `imagekit.getFileVersions(fileId)`

### File Upload
- [ ] `imagekit.upload({ file, fileName, folder, tags, customMetadata, extensions })`

### File Update
- [ ] `imagekit.updateFileDetails(fileId, { tags, customMetadata, extensions })`
- [ ] `imagekit.bulkAddTags({ fileIds, tags })`
- [ ] `imagekit.bulkRemoveTags({ fileIds, tags })`

### File Move / Copy / Delete
- [ ] `imagekit.moveFile({ sourceFilePath, destinationPath })`
- [ ] `imagekit.copyFile({ sourceFilePath, destinationPath })`
- [ ] `imagekit.deleteFile(fileId)`
- [ ] `imagekit.bulkDeleteFiles([fileId1, fileId2])`

### Folder Operations
- [ ] `imagekit.createFolder({ folderName, parentFolderPath })`
- [ ] `imagekit.deleteFolder(folderPath)`
- [ ] `imagekit.moveFolder({ sourceFolderPath, destinationPath })`

### URL Generation
- [ ] `imagekit.url({ path, transformation: [...] })`
- [ ] `imagekit.url({ path, signed: true, expireSeconds })`

### Webhooks
- [ ] `imagekit.verifyWebhookSignature(rawBody, signature, secret)`

### AI Tasks (via extensions param)
- [ ] `select_tags` task in `upload()`
- [ ] `select_metadata` task in `upload()`
- [ ] `yes_no` task in `upload()`
- [ ] AI task via `updateFileDetails()` on existing files

---

## Phase 1 — Node Core + Express · Mar 5–9

### Day 1 · Thu Mar 5 — Module Systems + Project Setup
- CommonJS (`require`) vs ESM (`import/export`) — you've already hit this with the SDK
- `package.json` → `"type": "module"` and when to use it
- `dotenv` — how `process.env` works, why secrets never go in code
- `path` and `fs` — `readFile`, `writeFile` async versions
- Project structure: `routes/` `controllers/` `config/` `middleware/`
- 📺 Piyush Garg: Node modules + project setup

### Day 2 · Fri Mar 6 — Express Server + Routing
- How Express sits on top of Node's `http` module
- `app.get()`, `app.post()` — defining routes
- `req` and `res` — what they contain and how they flow
- `express.json()` — why you need it to read a request body
- 📺 Piyush Garg: Express basics

### Weekend · Mar 7–8 — Middleware + File Uploads *(3–4 hrs)*
- Middleware concept — every request passes through a chain, `next()` moves it forward
- Error handling middleware — 4 arguments `(err, req, res, next)`
- `multer` — memory storage (gives `req.file.buffer`) vs disk storage
- Why memory storage matters: ImageKit SDK takes a `Buffer` or `ReadStream`
- 📺 Piyush Garg: Middleware + Multer

### Day 3 · Mon Mar 9 — 🟢 ImageKit SDK: First Upload
- Install + initialize SDK with credentials from `.env`
- `imagekit.upload({ file: req.file.buffer, fileName, folder })`
- Understand the response: `fileId`, `url`, `name`, `filePath`, `size`
- 4 ways to pass a file: `fs.createReadStream`, `File`, `fetch Response`, `toFile(Buffer)`
- 📺 ImageKit docs: File upload

### 🔨 Mini Project 1: Image Upload API *(done by Mar 9)*
> Express API with `POST /upload`  
> → Receives a file via multer → uploads to ImageKit → returns the URL  
> **Explain:** Why multer memory storage? What does `fileId` mean and why save it?

---

## Phase 2 — MongoDB + Auth · Mar 10–16

### Day 4 · Tue Mar 10 — MongoDB + Mongoose Basics
- How MongoDB differs from SQL — documents, collections, no fixed schema
- Connect Mongoose to MongoDB Atlas (free tier)
- `Schema` and `Model` — defining shape of your data
- Create a `File` model: `{ filename, ikFileId, url, filePath, size, uploadedAt, uploadedBy }`
- 📺 Piyush Garg: Mongoose intro

### Day 5 · Wed Mar 11 — Mongoose CRUD
- `doc.save()`, `Model.find()`, `Model.findById()`, `findByIdAndUpdate()`, `deleteOne()`
- After every successful ImageKit upload → save metadata to MongoDB
- 📺 Piyush Garg: Mongoose CRUD

### Day 6 · Thu Mar 12 — JWT Auth — Register + Login
- `bcrypt` — why we hash passwords, how `hash()` and `compare()` work
- `jsonwebtoken` — `sign()` creates a token, `verify()` validates it
- Build `/register` and `/login` routes, login returns a JWT
- 📺 Piyush Garg: JWT auth

### Day 7 · Fri Mar 13 — Auth Middleware + Protected Routes
- Read JWT from `Authorization: Bearer <token>` header
- Verify token inside middleware, attach decoded user to `req.user`
- Protect `/upload` — unauthorized requests get 401
- 📺 Piyush Garg: Auth middleware

### Weekend · Mar 14–15 — Wire Everything End-to-End *(3–4 hrs)*
- Full flow: Register → Login → JWT → upload file → saved to MongoDB
- Also wire the 3 project POST routes — this is your first real project work:
  - `POST /api/approve` → `imagekit.updateFileDetails(fileId, { customMetadata: { Status: "Approved", Reviewer, ReviewedAt } })`
  - `POST /api/reject` → `imagekit.updateFileDetails(fileId, { customMetadata: { Status: "Rejected", Reason, Reviewer } })`
  - `POST /api/revert` → `imagekit.updateFileDetails(fileId, { customMetadata: { Status: "Pending" } })`
- Pre-req: define these custom metadata fields in ImageKit dashboard first:
  - `Status` (SingleSelect — Pending, Approved, Rejected)
  - `Reviewer` (Text), `Reason` (Text), `ReviewedAt` (Date)

### 🔨 Mini Project 2: Image Vault *(done by Mar 15)*
> Authenticated image store — register/login, upload images, browse your uploads  
> `GET /my-files` returns all files uploaded by the logged-in user from MongoDB  
> **Explain:** How does auth middleware know who the user is? What's stored in the JWT payload?

> **Project milestone:** Approve / Reject / Revert routes working ✅  
> SDK methods ticked off: `updateFileDetails()`, `getFileDetails()`

---

## Phase 3 — ImageKit SDK Deep Dive · Mar 17–23

### Day 8 · Mon Mar 17 — URL Generation + Transformations
- `imagekit.url({ path, transformation: [{ width, height, crop, quality, format }] })`
- How ImageKit builds the `?tr=` query string from your transformation object
- Build `GET /api/files/:id/transform` → returns optimized thumbnail URL
- 📺 ImageKit docs: URL transformations

### Day 9 · Tue Mar 18 — Overlays + Signed URLs
- Image overlays: watermarks, logos — `overlay.type: 'image'`, position with `x`, `y`, `focus`
- Text overlays: `fontSize`, `fontFamily`, `fontColor`, `typography`
- `imagekit.url({ path, signed: true, expireSeconds: 3600 })` — how `ik-t` and `ik-s` params work
- Build `GET /api/files/:id/signed-url` → returns a URL expiring in 1 hour
- 📺 ImageKit docs: Signed URLs

### Day 10 · Wed Mar 19 — Auth Parameters + Client-Side Upload
- Understand `imagekit.getAuthenticationParameters()` deeply — `token`, `expire`, `signature`
- Why the frontend needs these to upload directly without exposing your private key
- Wire the "New Upload" button: frontend calls `GET /ik-auth` → uses params with ImageKit JS SDK
- On success → prepend new row to the review queue

### Day 11 · Thu Mar 20 — SDK Error Handling + Resilience
- `ImageKit.APIError` — catch and handle 400, 401, 403, 404, 429, 500
- `maxRetries` — SDK auto-retries on 429 and 5xx, configure or disable it
- `timeout` — prevent your API from hanging if ImageKit is slow
- Wrap all SDK calls in `try/catch`, return consistent error responses

### Weekend · Mar 21–22 — AI Tasks Integration *(3–4 hrs)*
- What AI Tasks are — `select_tags`, `select_metadata`, `yes_no`
- Pass `extensions` in `upload()` to auto-tag on every new upload:
  ```js
  extensions: [{
    name: "ai-task",
    options: {
      tasks: [
        { type: "select_tags", instruction: "...", vocabulary: [...], actions: { addTags: { minCount: 1, maxCount: 3 } } },
        { type: "yes_no", instruction: "Does this image contain people?", actions: { yes: { addTags: ["contains-people"] }, no: { addTags: ["no-people"] } } },
        { type: "select_metadata", instruction: "...", field: "ColorPalette", vocabulary: ["warm","cool","neutral"] }
      ]
    }
  }]
  ```
- Create a Saved Extension in the ImageKit dashboard with this config
- Add `POST /api/enrich` — runs AI Task on a single file on demand via `updateFileDetails()` with extensions
- Add `POST /api/bulk-enrich` — `listFiles({ searchQuery: 'customMetadata.Status = "Pending"' })` → loop → enrich each

### 🔨 Mini Project 3: DAM API *(done by Mar 22)*
> API that manages a mini DAM:  
> → Upload files into named folders with tags  
> → `GET /files` filtered by tag using `searchQuery`  
> → `GET /files/:id/transform` returns a transformed + watermarked URL  
> → `GET /files/:id/signed-url` returns a signed URL expiring in 1 hour  
> → `POST /api/enrich` triggers AI tagging on demand  
> **This is 80% of the final project already.**  
> SDK methods ticked off: `url()`, `getAuthenticationParameters()`, `upload()` with extensions, `listFiles()` with advanced searchQuery

---

## Phase 4 — Workflow Automation + Polish · Mar 23–30

### Day 12 · Mon Mar 23 — Webhooks
- What ImageKit webhooks fire: `FILE_UPLOADED`, `FILE_UPDATED`, `EXTENSION_STATUS_UPDATED`
- `imagekit.verifyWebhookSignature(rawBody, signature, secret)` — prevent fake requests
- Build `POST /webhook`: verify → log event to MongoDB → on `EXTENSION_STATUS_UPDATED` read AI task result
- 📺 ImageKit docs: Webhooks

### Day 13 · Tue Mar 24 — Folder Management + File Move
- `imagekit.createFolder({ folderName, parentFolderPath })`
- `imagekit.moveFile({ sourceFilePath, destinationPath })` — move rejected assets to `/archive`
- Add this to your reject flow: reject → update metadata → move to `/archive`
- 📺 ImageKit docs: Folder operations

### Day 14 · Wed Mar 25 — Bulk Operations + Stats
- `imagekit.bulkAddTags({ fileIds, tags })` / `imagekit.bulkRemoveTags()`
- `imagekit.bulkDeleteFiles([...])`
- `imagekit.getFileVersions(fileId)`
- Add `GET /api/stats` → counts of Pending / Approved / Rejected assets using `listFiles()` + `searchQuery`

### Day 15 · Thu Mar 26 — Wire Frontend JS
- Vanilla JS `fetch()` for all POST routes
- Event delegation on dynamic lists
- Detail panel populates on row click via `GET /api/file/:fileId`
- Show AI-generated tags in the detail panel

### Weekend · Mar 28–29 — Polish + Test *(3–4 hrs)*
- Full end-to-end test of the entire workflow
- Input validation on all routes
- Remove debug logs, clean up code
- Write README: what the project does, setup steps, all API routes

### Day 16 · Mon Mar 30 — Buffer Day
- Fix anything remaining
- Run through the full demo flow yourself

### 🔨 Final Project: ImageKit DAM Workflow Automation *(demo Apr 4)*
> Authenticated Node/Express API + ImageKit SDK (all methods) + MongoDB  
> Upload → AI auto-tag → Review queue → Approve/Reject → Archive  
> Webhooks for real-time updates · Signed URLs · Bulk operations  
> **Manager demo ready ✅**

---

## Mini Projects + Project Phases — Combined Timeline

| Date | Mini Project / Phase | SDK Methods Covered |
|---|---|---|
| Mar 9 | Mini Project 1: Image Upload API | `upload()` |
| Mar 15 | Mini Project 2: Image Vault + **Project Phase 1** (approve/reject/revert routes) | `updateFileDetails()`, `getFileDetails()` |
| Mar 22 | Mini Project 3: DAM API + **Project Phase 2+3** (upload flow + AI Tasks) | `url()`, `getAuthenticationParameters()`, `upload()` with extensions, advanced `listFiles()` |
| Apr 4 | **Final Project** — Project Phase 4 complete | All remaining SDK methods |

---

## What You Learn (Skill Map)

**Node.js / Backend**
- Express routing, middleware, error handling
- Environment variable management with dotenv
- Multipart file upload parsing with multer
- JWT authentication pattern
- Async/await patterns, consistent error responses

**ImageKit SDK**
- SDK init and auth flow
- `searchQuery` Lucene-like syntax for filtering files
- Custom metadata: defining fields, reading, writing
- Tags vs custom metadata — when to use each
- Upload parameters and how `extensions` hook in
- URL transformation chains
- Signed URL generation

**ImageKit AI Tasks**
- Three task types and when to use each
- Vocabulary lists for consistent tagging
- Saved Extension vs inline config
- Triggering AI enrichment on existing assets
- Reading AI task results from file response and webhooks

**DAM Concepts**
- Asset lifecycle: Upload → Review → Approve/Reject → Archive
- Metadata schemas and why structure matters at scale
- Webhook-driven real-time updates
- AI-assisted tagging to reduce manual effort

---

## Reference Links

- ImageKit Node SDK: https://github.com/imagekit-developer/imagekit-nodejs
- ImageKit AI Tasks: https://imagekit.io/docs/dam/ai-tasks
- ImageKit API reference: https://docs.imagekit.io/api-reference
- SDK npm package: https://www.npmjs.com/package/imagekit
- Piyush Garg YouTube: search "Piyush Garg Node.js"

## One Rule
> Before moving to the next day — make sure you can explain  
> **what the code does and why** without looking at it.  
> That's your check.
