# Loom Video Script: Collaborative Whiteboard App

## **Video Title:** "CollabCanvas - Real-Time Collaborative Whiteboard Demo"

## **Duration:** 8-10 minutes

---

## **SCRIPT**

### **INTRO (0:00 - 0:30)**
*[Screen: Show the landing page]*

"Hey everyone! Today I'm excited to show you **CollabCanvas**, a real-time collaborative whiteboard app I built with Next.js, Node.js, and Socket.IO. This app allows multiple users to draw together in real-time, with features like drawing rights management, automatic saving, and a clean modern UI.

Let me walk you through how it works and demonstrate the key features."

---

### **SETUP & ARCHITECTURE (0:30 - 1:30)**
*[Screen: Show project structure in VS Code]*

"First, let me show you the project structure. We have a **frontend** built with Next.js that handles the UI and real-time client connections, and a **backend** with Node.js/Express that manages the API endpoints and Socket.IO server for real-time communication.

The app uses **Supabase** for authentication and database storage, with PostgreSQL handling our whiteboard sessions and canvas data. The frontend communicates with the backend via REST APIs and Socket.IO for real-time updates.

Let me start both servers and show you how it works."

*[Screen: Terminal showing npm install and server startup]*

---

### **LANDING PAGE & AUTHENTICATION (1:30 - 2:30)**
*[Screen: Navigate to localhost:3000]*

"Here's our landing page. Notice that it always shows the 'My Saved Whiteboards' button prominently - this encourages users to create accounts and save their work. When you click it, you're redirected to the login page if you're not authenticated.

Let me show you the authentication flow. We have clean, modern login and signup pages built with Supabase Auth. The signup form includes a **character name field** - every user, whether logged in or guest, must provide a unique 5-character alphanumeric name for collaboration."

*[Screen: Show login/signup pages]*

"Notice how we've hidden the built-in Supabase Auth signup link and only show our custom 'Sign up here' link. This ensures users go through our character name requirement."

---

### **CREATING A ROOM (2:30 - 3:30)**
*[Screen: Click "Create Room" button]*

"Let me create a new whiteboard room. Since I'm not logged in, the app prompts me for a guest name. I need to enter at least 5 characters - let me use 'DemoUser'."

*[Screen: Show name prompt and room creation]*

"Perfect! The room is created and I'm automatically redirected to the whiteboard. Notice the URL includes my user ID as a query parameter - this helps track who I am in the session."

---

### **WHITEBOARD INTERFACE (3:30 - 4:30)**
*[Screen: Show whiteboard with navbar]*

"Here's the main whiteboard interface. At the top, we have a navbar with the app logo, room ID, share button, and save button. Since I'm not logged in, the save button will redirect me to login when clicked.

On the left, we have the **toolbar** with drawing tools: color picker, eraser, stroke width slider, undo, and clear. The drawing area is the main canvas where all the magic happens.

On the right, we have the **participants panel** showing who's in the room. Since I'm the first one here, I'm the host and have drawing rights - notice the brush icon next to my name."

---

### **REAL-TIME COLLABORATION (4:30 - 6:00)**
*[Screen: Open new browser tab/window]*

"Now let me demonstrate the real-time collaboration. I'll open the app in another browser window and join the same room."

*[Screen: Show joining process with character name prompt]*

"I need to enter another 5-character name - let me use 'Guest01'. Now I'm joining the same room."

*[Screen: Show both windows side by side]*

"Watch this! As I draw on one window, you can see the drawing appears instantly in the other window. This is powered by Socket.IO for real-time communication.

Notice how the canvas size and coordinates are perfectly synchronized - we fixed the coordinate misalignment issues that can happen with different screen sizes."

*[Screen: Demonstrate drawing on both windows]*

"Now let me show you the **drawing rights management**. As the host, I can pass drawing rights to any participant. When I click 'Allow to draw' next to Guest01, they get the brush icon and can start drawing, while I lose the ability to draw.

The host can always take back drawing rights by clicking 'Revoke drawing'. Only one person can draw at a time, which prevents conflicts and ensures smooth collaboration."

---

### **SAVING & AUTHENTICATION FLOW (6:00 - 7:00)**
*[Screen: Click save button]*

"Let me show you the save functionality. Since I'm not logged in, clicking save redirects me to the login page with special parameters that will automatically save my whiteboard after login."

*[Screen: Show login page with redirect parameters]*

"After I log in, the app automatically saves my whiteboard and shows a success notification. This seamless flow ensures users don't lose their work."

*[Screen: Show saved whiteboards page]*

"Now I can see all my saved whiteboards. The navbar also shows my name/email as a clickable button that takes me to this saved whiteboards page."

---

### **SHARING & ROOM MANAGEMENT (7:00 - 7:30)**
*[Screen: Click share button]*

"The share button copies a clean room link without user parameters, making it easy to share with others. When someone joins using this link, they'll be prompted for their character name and can start collaborating immediately."

---

### **TECHNICAL HIGHLIGHTS (7:30 - 8:30)**
*[Screen: Show code snippets]*

"Let me quickly highlight some technical features:

- **Canvas Synchronization**: We include width and height in all whiteboard updates to ensure perfect alignment
- **Robust Save Logic**: Uses update-then-insert approach to prevent conflicts
- **Real-time Updates**: Socket.IO with proper event handling for instant collaboration
- **Character Name System**: Enforces 5-character minimum with validation
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application"

---

### **CONCLUSION (8:30 - 9:00)**
*[Screen: Show app in action with multiple users]*

"CollabCanvas is a fully functional collaborative whiteboard that handles real-time drawing, user management, authentication, and data persistence. It's perfect for remote collaboration, online teaching, or brainstorming sessions.

The app is built with modern web technologies and follows best practices for real-time applications. All the code is open source and well-documented for anyone who wants to contribute or build something similar.

Thanks for watching! If you're interested in the technical details, check out the README and documentation in the project repository."

---

## **PRODUCTION NOTES**

### **Recording Tips:**
1. **Use a high-quality microphone** for clear audio
2. **Record in 1080p** for crisp visuals
3. **Use screen recording software** that can capture multiple windows
4. **Have both servers running** before starting the recording
5. **Prepare test data** (saved whiteboards, user accounts) beforehand

### **Key Demonstrations:**
- ✅ Landing page and authentication flow
- ✅ Character name system (5-character requirement)
- ✅ Real-time drawing collaboration
- ✅ Drawing rights management
- ✅ Save/authentication flow
- ✅ Share functionality
- ✅ Responsive design

### **Technical Points to Highlight:**
- ✅ Socket.IO real-time communication
- ✅ Canvas synchronization
- ✅ Modern React/Next.js architecture
- ✅ Supabase integration
- ✅ TypeScript type safety
- ✅ Clean, modern UI design

### **Call-to-Action:**
- Mention the GitHub repository
- Encourage contributions and feedback
- Highlight the comprehensive documentation
- Suggest potential use cases (education, remote work, etc.) 