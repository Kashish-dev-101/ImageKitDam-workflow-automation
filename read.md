# ImageKit DAM Asset Review Workflow

This project is a prototype **Digital Asset Management (DAM) workflow tool** built on top of the [ImageKit API & SDK](https://docs.imagekit.io/).  
It provides a simple **review queue** where uploaded assets enter with `status = "pending"`, and reviewers can **approve** or **reject** them via a clean UI.

---

## 🚀 Features (MVP)

- **Upload Flow**

  - Assets uploaded via the frontend or client-side SDK are tagged with custom metadata `status = "pending"`.
  - New uploads appear instantly at the top of the review queue.

- **Review Queue**

  - Lists all assets with `status = "pending"` (default).
  - Supports filters by folder, type, and search (name or tags).
  - Displays file thumbnail, name, folder, size, uploader, and status badge.

- **Review Actions**

  - **Approve** → sets `status = "approved"`, records reviewer and timestamp.
  - **Reject** → sets `status = "rejected"`, records reason, reviewer, and timestamp.
  - **Revert** → sends an asset back to `status = "pending"`.

- **Frontend UI**

  - Minimal HTML + CSS styled dashboard.
  - Event-driven JavaScript (`fetch` + `addEventListener`) to interact with backend.
  - Detail panel with metadata and action buttons.

- **Backend API (Node + Express)**
  - `GET /api/queue` → list pending/approved/rejected assets (with filters).
  - `POST /api/approve` → update file status to approved.
  - `POST /api/reject` → update file status to rejected.
  - `POST /api/revert` → move file back to pending.

---

## 📋 Project Plan

### Phase 1: Core Workflow (MVP)

- [x] Define custom metadata fields in ImageKit:
  - `status` (enum: pending, approved, rejected)
  - `reviewer`, `reason`, `reviewedAt`
- [x] Build backend routes for queue, approve, reject, revert.
- [x] Build frontend queue UI with approve/reject actions.
- [x] Connect frontend → backend with `fetch`.

### Phase 2: Enhancements

- [ ] Add **batch actions** (approve all / reject all).
- [ ] Show rejection reasons in the UI.
- [ ] Implement **search + filters** on frontend.
- [ ] Add **refresh** + auto-polling.

### Phase 3: Advanced DAM Features

- [ ] Add **multi-step workflows** (e.g., Pending → Legal → Brand → Approved).
- [ ] Add **upload notifications** via webhook (Slack/Discord/email).
- [ ] Add **usage dashboard** (storage, bandwidth, asset counts).
- [ ] Integrate **AI tagging / enrichment** for new uploads.
- [ ] Add **audit history** of approvals/rejections.

---

## ⚙️ Setup & Run

1. Clone this repo.

2. Install dependencies:
   ```bash
   npm install express cors imagekit
   ```
