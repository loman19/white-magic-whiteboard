# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## API Reference

### Frontend API Calls
- `POST http://localhost:3001/api/whiteboard/save` — Save whiteboard data
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
- `POST /api/whiteboard/save` — Save whiteboard data
- `POST /api/whiteboard/create` — Create a new whiteboard room
- `POST /api/whiteboard/set-drawer` — Set the current drawer
- `POST /api/whiteboard/join` — Join a whiteboard room
- `POST /api/whiteboard/update-host` — Update host after login
