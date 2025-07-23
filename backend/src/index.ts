import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST']
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

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
app.post('/api/whiteboard/save', async (req, res) => {
  const { roomId, data, userId } = req.body;
  if (!roomId || !data) {
    return res.status(400).json({ error: 'roomId and data are required' });
  }
  if (!userId) {
    // Anonymous users cannot save
    return res.status(401).json({ error: 'You must be logged in to save your whiteboard.' });
  }
  // Upsert session by roomId and owner_id
  const { error } = await supabase
    .from('whiteboard_sessions')
    .upsert([{ room_id: roomId, owner_id: userId, updated_at: new Date().toISOString() }], { onConflict: 'room_id' });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  // Get session id
  const { data: sessionData, error: sessionError } = await supabase
    .from('whiteboard_sessions')
    .select('id')
    .eq('room_id', roomId)
    .single();
  if (sessionError || !sessionData) {
    return res.status(500).json({ error: sessionError?.message || 'Session not found' });
  }
  // Upsert whiteboard data
  const { error: dataError } = await supabase
    .from('whiteboard_data')
    .upsert([{ session_id: sessionData.id, data, updated_at: new Date().toISOString() }], { onConflict: 'session_id' });
  if (dataError) {
    return res.status(500).json({ error: dataError.message });
  }
  res.json({ success: true });
});

// Load whiteboard session
app.get('/api/whiteboard/:roomId', async (req, res) => {
  const { roomId } = req.params;
  // Get session id
  const { data: sessionData, error: sessionError } = await supabase
    .from('whiteboard_sessions')
    .select('id')
    .eq('room_id', roomId)
    .single();
  if (sessionError || !sessionData) {
    return res.status(404).json({ error: 'Session not found' });
  }
  // Get whiteboard data
  const { data: whiteboardData, error: dataError } = await supabase
    .from('whiteboard_data')
    .select('data')
    .eq('session_id', sessionData.id)
    .single();
  if (dataError || !whiteboardData) {
    return res.status(404).json({ error: 'Whiteboard data not found' });
  }
  res.json({ data: whiteboardData.data });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 