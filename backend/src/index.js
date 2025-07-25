"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const pg_1 = require("pg");
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Adjust as needed for production
        methods: ['GET', 'POST']
    }
});
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    }
    else {
        console.log('Database connected:', res.rows[0]);
    }
});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello from Express backend!');
});
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});
// Socket.IO logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        // Notify others in the room
        socket.to(roomId).emit('user-joined', { userId: socket.id });
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });
    socket.on('whiteboard-update', ({ roomId, data }) => {
        // Broadcast to all other users in the room
        socket.to(roomId).emit('whiteboard-update', data);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});
// Save whiteboard session
app.post('/api/whiteboard/save', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, data, userId } = req.body;
    if (!roomId || !data) {
        return res.status(400).json({ error: 'roomId and data are required' });
    }
    if (!userId) {
        // Anonymous users cannot save
        return res.status(401).json({ error: 'You must be logged in to save your whiteboard.' });
    }
    // Upsert session by roomId and owner_id
    const { error } = yield supabase
        .from('whiteboard_sessions')
        .upsert([{ room_id: roomId, owner_id: userId, updated_at: new Date().toISOString() }], { onConflict: 'room_id' });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    // Get session id
    const { data: sessionData, error: sessionError } = yield supabase
        .from('whiteboard_sessions')
        .select('id')
        .eq('room_id', roomId)
        .single();
    if (sessionError || !sessionData) {
        return res.status(500).json({ error: (sessionError === null || sessionError === void 0 ? void 0 : sessionError.message) || 'Session not found' });
    }
    // Upsert whiteboard data
    const { error: dataError } = yield supabase
        .from('whiteboard_data')
        .upsert([{ session_id: sessionData.id, data, updated_at: new Date().toISOString() }], { onConflict: 'session_id' });
    if (dataError) {
        return res.status(500).json({ error: dataError.message });
    }
    res.json({ success: true });
}));
// Load whiteboard session
app.get('/api/whiteboard/:roomId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    // Get session id
    const { data: sessionData, error: sessionError } = yield supabase
        .from('whiteboard_sessions')
        .select('id')
        .eq('room_id', roomId)
        .single();
    if (sessionError || !sessionData) {
        return res.status(404).json({ error: 'Session not found' });
    }
    // Get whiteboard data
    const { data: whiteboardData, error: dataError } = yield supabase
        .from('whiteboard_data')
        .select('data')
        .eq('session_id', sessionData.id)
        .single();
    if (dataError || !whiteboardData) {
        return res.status(404).json({ error: 'Whiteboard data not found' });
    }
    res.json({ data: whiteboardData.data });
}));
// Create a new whiteboard room (host is guest1 by default)
app.post('/api/whiteboard/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = crypto_1.default.randomUUID().slice(0, 8);
    const host = 'guest1';
    const participants = [host];
    const { error } = yield supabase
        .from('whiteboard_sessions')
        .insert([{ room_id: roomId, owner_id: host, participants, current_drawer: host, created_at: new Date().toISOString() }]);
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ roomId, guestName: host });
}));
// Set the current drawer
app.post('/api/whiteboard/set-drawer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, drawerId } = req.body;
    if (!roomId || !drawerId)
        return res.status(400).json({ error: 'Missing roomId or drawerId' });
    const { error } = yield supabase
        .from('whiteboard_sessions')
        .update({ current_drawer: drawerId })
        .eq('room_id', roomId);
    if (error)
        return res.status(500).json({ error: error.message });
    io.to(roomId).emit('drawer-changed', { drawerId });
    res.json({ success: true });
}));
// Join a whiteboard room (assign guestN or use userId)
app.post('/api/whiteboard/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, userId } = req.body;
    if (!roomId)
        return res.status(400).json({ error: 'Missing roomId' });
    // Fetch current participants
    const { data: session, error: fetchError } = yield supabase
        .from('whiteboard_sessions')
        .select('participants')
        .eq('room_id', roomId)
        .single();
    if (fetchError || !session)
        return res.status(404).json({ error: 'Room not found' });
    let participantId = userId;
    let participants = session.participants || [];
    if (!participantId) {
        // Assign next guest name
        const guestNumbers = participants
            .filter((p) => typeof p === 'string' && p.startsWith('guest'))
            .map((p) => parseInt(p.replace('guest', ''), 10))
            .filter((n) => !isNaN(n));
        const nextGuestNum = guestNumbers.length > 0 ? Math.max(...guestNumbers) + 1 : 2;
        participantId = `guest${nextGuestNum}`;
    }
    if (!participants.includes(participantId)) {
        participants.push(participantId);
        const { error: updateError } = yield supabase
            .from('whiteboard_sessions')
            .update({ participants })
            .eq('room_id', roomId);
        if (updateError)
            return res.status(500).json({ error: updateError.message });
    }
    res.json({ participantId });
}));
// Update host after login
app.post('/api/whiteboard/update-host', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, userId } = req.body;
    if (!roomId || !userId)
        return res.status(400).json({ error: 'Missing roomId or userId' });
    // Update owner_id from guest1 to userId
    const { error } = yield supabase
        .from('whiteboard_sessions')
        .update({ owner_id: userId })
        .eq('room_id', roomId)
        .eq('owner_id', 'guest1');
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ success: true });
}));
// Get session info for a room
app.get('/api/whiteboard/:roomId/session', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const { data: session, error } = yield supabase
        .from('whiteboard_sessions')
        .select('participants, current_drawer, owner_id')
        .eq('room_id', roomId)
        .single();
    if (error || !session)
        return res.status(404).json({ error: 'Session not found' });
    res.json(session);
}));
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
