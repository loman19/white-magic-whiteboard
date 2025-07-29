# **App Name**: CollabCanvas

> For setup instructions, API reference, and troubleshooting, see the main [README.md](../README.md).

## Core Features:

### **Authentication & User Management**
- **Character Name System:** All users (logged-in or guest) must provide a unique 5-character alphanumeric name
- **Login/Signup Flow:** Clean authentication pages with character name field in signup form
- **Guest Users:** Can participate without accounts but must provide a character name
- **Save Authentication:** Only logged-in users can save whiteboards; guests are redirected to login when saving
- **Automatic Save Flow:** After login, whiteboard is automatically saved with success notification

### **Whiteboard Features**
- **Session Management:** Create or join a shared whiteboard session using a unique room ID
- **Real-Time Drawing:** Real-time sketching on the whiteboard with various drawing tools
- **Real-Time Collaboration:** Collaborative viewing of changes in real-time with other users
- **Drawing Tools:** Color picker, eraser, adjustable stroke width, undo, and clear
- **Drawing Rights Management:** Host can pass/revoke drawing rights; only one can draw at a time
- **Canvas State Sync:** New drawers automatically receive the current canvas state
- **Coordinate Alignment:** Fixed drawing coordinate misalignment issues

### **Navigation & User Experience**
- **Landing Page:** Always shows "My Saved Whiteboards" button, redirects to login/signup then saved whiteboards
- **Whiteboard Navbar:** Shows user's name/email as clickable button (redirects to saved whiteboards)
- **Share Functionality:** Clean room links without user parameters
- **User Notifications:** Shows participant names instead of socket IDs when users join
- **Saved Whiteboards Page:** View and manage all saved whiteboards

### **Technical Features**
- **Canvas Synchronization:** Canvas size and content synchronized across all participants
- **Robust Save Logic:** Update-then-insert approach prevents save conflicts
- **Real-Time Updates:** Socket.IO with synchronized canvas sizes for accurate drawing
- **Participant Management:** Real-time participant list with drawing rights indicators

## Style Guidelines:

- **Primary color:** Indigo (#4B0082), suggesting focus and collaboration
- **Background color:** Very light gray (#F0F0F0), to provide a neutral, distraction-free canvas
- **Accent color:** Soft lavender (#E6E6FA), for a calm but visually distinct secondary element
- **Body and headline font:** 'Inter' (sans-serif), providing a clean, modern, and readable text
- **Simple, minimalist icons** for drawing tools and collaboration features
- **Clean, intuitive layout** with whiteboard as central focus
- **Subtle animations** to indicate real-time updates
- **Modern UI components** using shadcn/ui for consistent design

## Technical Implementation:

### **Frontend Architecture**
- **Next.js App Router:** Modern routing with app directory structure
- **React Hooks:** Custom hooks for drawing, socket management, and mobile detection
- **TypeScript:** Full type safety throughout the application
- **Tailwind CSS:** Utility-first styling with custom configuration
- **Socket.IO Client:** Real-time communication with the backend

### **Backend Architecture**
- **Node.js/Express:** RESTful API endpoints for whiteboard operations
- **Socket.IO Server:** Real-time bidirectional communication
- **Supabase Integration:** Authentication and database management
- **CORS Configuration:** Proper cross-origin resource sharing setup

### **Database Design**
- **whiteboard_sessions:** Stores room information and participant management
- **whiteboard_data:** Stores canvas data with session relationships
- **profiles:** User profile information for authentication
- **Row Level Security:** Supabase RLS for data protection

## Troubleshooting

### **Common Issues & Solutions**

- **CORS Errors:** Ensure the backend uses the CORS middleware and allows requests from the frontend origin (`http://localhost:3000`)
- **404 on /auth or /auth/page:** The login page route is `/auth`, not `/auth/page`
- **500 Internal Server Error on /auth:** Make sure all hooks (useRouter, useSearchParams, useToast) are used inside a client component and, if needed, inside a `<Suspense>` boundary
- **Suspense Boundary Error:** Wrap any component using `useSearchParams` or `useRouter` in a `<Suspense>` boundary in the App Router
- **Canvas zoom issues:** Canvas size is now synchronized for real-time updates
- **Duplicate signup links:** Built-in Supabase Auth links are hidden, only custom links shown
- **Drawing coordinate misalignment:** Fixed with proper canvas size synchronization
- **Save 500 errors:** Robust upsert logic prevents conflicts
- **Real-time collaboration issues:** Canvas state is properly synchronized between participants

### **Development Best Practices**

- **Character Name Validation:** Always enforce 5-character minimum with alphanumeric validation
- **Authentication Flow:** Redirect guests to login when saving, with automatic save after login
- **Canvas State Management:** Always include width/height in whiteboard updates for proper synchronization
- **Error Handling:** Comprehensive error logging and user-friendly error messages
- **Performance:** Optimize canvas operations and minimize unnecessary re-renders