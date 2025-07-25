# **App Name**: CollabCanvas

> For setup instructions, API reference, and troubleshooting, see the main [README.md](../README.md).

## Core Features:

- Session Management: Create or join a shared whiteboard session using a unique room ID.
- Real-Time Drawing: Real-time sketching on the whiteboard with various drawing tools.
- Real-Time Collaboration: Collaborative viewing of changes in real-time with other users.
- Color Picker: Basic color palette selection for drawing.
- AI Palette Assistant: AI-powered tool to suggest color palettes for drawing sessions, based on the current canvas content.
- **Authentication & Save Flow:** Only logged-in users can save whiteboards. Guests are redirected to login when saving, and after login, their whiteboard is automatically saved and a success message is shown.
- **Navbar:** The whiteboard page features a navbar with the app logo, room ID, share button (copies the link), and save button.
- **Drawing Rights:** The host can pass drawing rights to any participant and can always take them back (revoke drawing). Only one participant can draw at a time, indicated by a brush icon in the sidebar.
- **Participant Names:** When creating or joining a room, users must enter a unique 5-character alphanumeric name (unless logged in).
- **Shareable Rooms:** Use the share button to copy the room link and invite others.

## Style Guidelines:

- Primary color: Indigo (#4B0082), suggesting focus and collaboration.
- Background color: Very light gray (#F0F0F0), to provide a neutral, distraction-free canvas.
- Accent color: Soft lavender (#E6E6FA), for a calm but visually distinct secondary element.
- Body and headline font: 'Inter' (sans-serif), providing a clean, modern, and readable text.
- Simple, minimalist icons for drawing tools and collaboration features.
- Clean, intuitive layout with whiteboard as central focus.
- Subtle animations to indicate real-time updates.

## Troubleshooting

- **CORS Errors:** Ensure the backend uses the CORS middleware and allows requests from the frontend origin.
- **404 on /auth or /auth/page:** The login page route is `/auth`, not `/auth/page`.
- **500 Internal Server Error on /auth:** Make sure all hooks (useRouter, useSearchParams, useToast) are used inside a client component and, if needed, inside a `<Suspense>` boundary.
- **Suspense Boundary Error:** Wrap any component using `useSearchParams` or `useRouter` in a `<Suspense>` boundary in the App Router.