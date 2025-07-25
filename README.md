# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## API Reference

### Frontend API Calls
- `POST http://localhost:3001/api/whiteboard/save` — Save whiteboard data (only for logged-in users)
- `GET http://localhost:3001/api/whiteboard/:roomId` — Load whiteboard data
- `POST http://localhost:3001/api/whiteboard/join` — Join a whiteboard room
- `GET http://localhost:3001/api/whiteboard/:roomId/session` — Get session info for a room
- `POST http://localhost:3001/api/whiteboard/set-drawer` — Set the current drawer
- `POST http://localhost:3001/api/whiteboard/create` — Create a new whiteboard room

### Backend API Endpoints
- `GET /` — Root, test endpoint
- `GET /api/hello` — Test endpoint
- `GET /api/whiteboard/:roomId` — Load whiteboard data
- `GET /api/whiteboard/:roomId/session` — Get session info for a room
- `POST /api/whiteboard/save` — Save whiteboard data (only for logged-in users)
- `POST /api/whiteboard/create` — Create a new whiteboard room
- `POST /api/whiteboard/set-drawer` — Set the current drawer
- `POST /api/whiteboard/join` — Join a whiteboard room
- `POST /api/whiteboard/update-host` — Update host after login

---

## Features & Usage

- **Authentication & Save Flow:**
  - Only logged-in users can save whiteboards.
  - If a guest clicks "Save", they are redirected to the login page. After successful login, their whiteboard is automatically saved and a success message is shown.
- **Navbar:**
  - The whiteboard page features a navbar with the app logo, room ID, share button (copies the link), and save button.
- **Drawing Rights:**
  - The host can pass drawing rights to any participant and can always take them back (revoke drawing).
  - Only one participant can draw at a time, indicated by a brush icon in the sidebar.
- **Participant Names:**
  - When creating or joining a room, users must enter a unique 5-character alphanumeric name (unless logged in).
- **Shareable Rooms:**
  - Use the share button to copy the room link and invite others.

---

## Troubleshooting

- **CORS Errors:**
  - Ensure the backend uses the CORS middleware and allows requests from the frontend origin.
- **404 on /auth or /auth/page:**
  - The login page route is `/auth`, not `/auth/page`.
- **500 Internal Server Error on /auth:**
  - Make sure all hooks (useRouter, useSearchParams, useToast) are used inside a client component and, if needed, inside a `<Suspense>` boundary.
- **Suspense Boundary Error:**
  - Wrap any component using `useSearchParams` or `useRouter` in a `<Suspense>` boundary in the App Router.

---

For more details, see the `docs/blueprint.md` file.
