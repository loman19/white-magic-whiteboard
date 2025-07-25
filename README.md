# Collaborative Whiteboard App

A real-time, multi-user whiteboard built with Next.js (frontend), Node.js/Express (backend), Socket.IO, and Supabase/Postgres for persistent storage.

---

## Project Structure

```
Canvas-master/
│
├── frontend/                # Next.js app (UI, real-time client)
│   ├── app/                 # Next.js app directory (routing, pages)
│   ├── components/          # React components (UI, whiteboard, toolbar, forms)
│   │   └── whiteboard/      # Whiteboard and toolbar components
│   ├── hooks/               # Custom React hooks (drawing, socket, etc.)
│   ├── lib/                 # Utility libraries (API, Supabase client)
│   ├── types/               # TypeScript types
│   ├── tailwind.config.ts   # Tailwind CSS config
│   └── ...                  # Other config and support files
│
├── backend/                 # Node.js/Express backend (API, Socket.IO)
│   ├── src/                 # Source code (index.ts: main server, db.ts)
│   ├── package.json         # Backend dependencies
│   └── ...                  # Build, config, and node_modules
│
├── docs/                    # Project documentation
│   └── blueprint.md         # Feature and style blueprint
│
├── README.md                # Project overview and instructions
└── ...
```

---

## Setup Instructions

### 1. **Install dependencies**

```bash
# In both frontend/ and backend/ directories:
npm install
```

### 2. **Configure environment variables**

- Set up your Supabase project and copy the API keys to `.env.local` in `frontend/` and `.env` in `backend/`.
- Example variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_URL=...
  SUPABASE_ANON_KEY=...
  DATABASE_URL=...
  ```

### 3. **Run the backend server**

```bash
cd backend
npx ts-node src/index.ts
# or if you have a dev script:
npm run dev
```

### 4. **Run the frontend (Next.js) server**

```bash
cd frontend
npx next dev
```

### 5. **Open the app**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Features

- **Create/Join Rooms:** Use a room ID and a 5-character name to join or create a whiteboard session.
- **Real-Time Drawing:** All participants see updates instantly via Socket.IO.
- **Drawing Tools:** Color picker, eraser, adjustable stroke width, undo, and clear.
- **Host Controls:** Host can pass/revoke drawing rights; only one can draw at a time.
- **Save/Load:** Only logged-in users can save whiteboards. Guests are prompted to log in before saving.
- **Share:** Copy room link to invite others.
- **Responsive UI:** Works on desktop and mobile.

---

## Documentation

- **API Reference, Features, and Troubleshooting:** See the [README.md](./README.md)
- **Feature Blueprint and Style Guide:** See [docs/blueprint.md](./docs/blueprint.md)

---

## Troubleshooting

- **CORS errors:** Ensure backend CORS is enabled for frontend origin.
- **404 on /auth:** Login page is `/auth`, not `/auth/page`.
- **500 errors:** Ensure all React hooks are used in client components and, if needed, inside `<Suspense>`.
- **Canvas zoom issues:** Canvas size is now synchronized for real-time updates.

---

For more details, see the full documentation in the `docs/` folder.
