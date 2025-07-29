# Collaborative Whiteboard App

A real-time, multi-user whiteboard built with Next.js (frontend), Node.js/Express (backend), Socket.IO, and Supabase/Postgres for persistent storage.

---

## Project Structure

```
Canvas-master/
│
├── frontend/                # Next.js app (UI, real-time client)
│   ├── app/                 # Next.js app directory (routing, pages)
│   │   ├── auth/           # Authentication pages (login/signup)
│   │   ├── whiteboard/     # Whiteboard pages
│   │   └── saved/          # Saved whiteboards page
│   ├── components/          # React components (UI, whiteboard, toolbar, forms)
│   │   ├── whiteboard/     # Whiteboard and toolbar components
│   │   └── ui/             # Reusable UI components (shadcn/ui)
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

### **Authentication & User Management**
- **Character Name System:** All users (logged-in or guest) must provide a unique 5-character alphanumeric name
- **Login/Signup Flow:** Clean authentication pages with character name field in signup
- **Guest Users:** Can participate without accounts but must provide a character name
- **Save Authentication:** Only logged-in users can save whiteboards; guests are redirected to login

### **Whiteboard Features**
- **Create/Join Rooms:** Use a room ID and a 5-character name to join or create a whiteboard session
- **Real-Time Drawing:** All participants see updates instantly via Socket.IO with synchronized canvas sizes
- **Drawing Tools:** Color picker, eraser, adjustable stroke width, undo, and clear
- **Drawing Rights Management:** Host can pass/revoke drawing rights; only one can draw at a time
- **Canvas State Sync:** New drawers automatically receive the current canvas state
- **Coordinate Alignment:** Fixed drawing coordinate misalignment issues

### **Navigation & UI**
- **Landing Page:** Always shows "My Saved Whiteboards" button, redirects to login/signup then saved whiteboards
- **Whiteboard Navbar:** Shows user's name/email as clickable button (redirects to saved whiteboards)
- **Share Functionality:** Clean room links without user parameters
- **User Notifications:** Shows participant names instead of socket IDs when users join

### **Save & Load System**
- **Automatic Save:** After login, whiteboard is automatically saved with success notification
- **Saved Whiteboards Page:** View and manage all saved whiteboards
- **Robust Save Logic:** Update-then-insert approach prevents save conflicts

### **Real-Time Collaboration**
- **Participant Management:** Real-time participant list with drawing rights indicators
- **Canvas Synchronization:** Canvas size and content synchronized across all participants
- **User Join Notifications:** Toast notifications when new users join with their names
- **Drawing Permission Flow:** Smooth handoff of drawing rights with canvas state preservation

---

## API Reference

### **Backend Endpoints**

#### `POST /api/whiteboard/create`
Creates a new whiteboard session.
- **Body:** `{ userId: string }`
- **Response:** `{ roomId: string }`

#### `POST /api/whiteboard/join`
Joins an existing whiteboard session.
- **Body:** `{ roomId: string, userId: string }`
- **Response:** `{ participantId: string }`

#### `GET /api/whiteboard/:roomId`
Loads whiteboard data for a room.
- **Response:** `{ data: string }` (canvas data URL)

#### `POST /api/whiteboard/save`
Saves whiteboard data (requires authentication).
- **Body:** `{ roomId: string, data: string, userId: string }`
- **Response:** `{ success: boolean }`

#### `POST /api/whiteboard/set-drawer`
Sets the current drawer for a room.
- **Body:** `{ roomId: string, drawerId: string }`
- **Response:** `{ success: boolean }`

#### `GET /api/whiteboard/user/:userId/saved`
Gets all saved whiteboards for a user.
- **Response:** `{ whiteboards: Array }`

### **Socket.IO Events**

#### Client → Server
- `join-room`: Join a whiteboard room
- `whiteboard-update`: Send canvas updates with width/height
- `request-canvas-state`: Request current canvas state from other users

#### Server → Client
- `whiteboard-update`: Receive canvas updates from other users
- `user-joined`: Notification when a new user joins
- `request-canvas-state`: Request to send current canvas state

---

## Troubleshooting

### **Common Issues**

- **CORS errors:** Ensure backend CORS is enabled for frontend origin (`http://localhost:3000`)
- **404 on /auth:** Login page is `/auth`, not `/auth/page`
- **500 errors:** Ensure all React hooks are used in client components and, if needed, inside `<Suspense>`
- **Canvas zoom issues:** Canvas size is now synchronized for real-time updates
- **Duplicate signup links:** Built-in Supabase Auth links are hidden, only custom links shown
- **Drawing coordinate misalignment:** Fixed with proper canvas size synchronization
- **Save 500 errors:** Robust upsert logic prevents conflicts

### **Database Schema**

#### `whiteboard_sessions`
- `id`: Primary key
- `room_id`: Unique room identifier
- `owner_id`: User ID of room creator
- `participants`: Array of participant IDs
- `current_drawer`: Current drawer's participant ID
- `created_at`, `updated_at`: Timestamps

#### `whiteboard_data`
- `id`: Primary key
- `session_id`: Foreign key to whiteboard_sessions
- `data`: Canvas data URL
- `created_at`, `updated_at`: Timestamps

#### `profiles`
- `user_id`: Supabase user ID
- `name`: User's display name
- `created_at`, `updated_at`: Timestamps

---

For more details, see the full documentation in the `docs/` folder.
