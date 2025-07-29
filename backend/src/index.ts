import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

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
    // Notify others in the room - we'll get the actual participant name from the join endpoint
    socket.to(roomId).emit('user-joined', { roomId });
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on('whiteboard-update', ({ roomId, data, width, height }) => {
    // Broadcast to all other users in the room with complete data object
    console.log('Broadcasting whiteboard update to room:', roomId);
    socket.to(roomId).emit('whiteboard-update', { data, width, height });
  });

  socket.on('request-canvas-state', ({ roomId }) => {
    // Broadcast request to other users in the room
    console.log('Broadcasting canvas state request to room:', roomId);
    socket.to(roomId).emit('request-canvas-state', { roomId });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Save whiteboard session
app.post('/api/whiteboard/save', async (req, res) => {
  try {
    const { roomId, data, userId } = req.body;
    console.log('Save request:', { roomId, userId, dataLength: data?.length });
    
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
      console.error('Session upsert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Get session id
    const { data: sessionData, error: sessionError } = await supabase
      .from('whiteboard_sessions')
      .select('id')
      .eq('room_id', roomId)
      .single();
    if (sessionError || !sessionData) {
      console.error('Session fetch error:', sessionError);
      return res.status(500).json({ error: sessionError?.message || 'Session not found' });
    }
    
    // Upsert whiteboard data - try update first, then insert if not exists
    let dataError = null;
    
    // First try to update existing data
    const { error: updateError } = await supabase
      .from('whiteboard_data')
      .update({ data, updated_at: new Date().toISOString() })
      .eq('session_id', sessionData.id);
    
    if (updateError) {
      console.log('Update failed, trying insert:', updateError.message);
      // If update fails (no record exists), try insert
      const { error: insertError } = await supabase
        .from('whiteboard_data')
        .insert([{ session_id: sessionData.id, data, updated_at: new Date().toISOString() }]);
      dataError = insertError;
    }
    
    if (dataError) {
      console.error('Data save error:', dataError);
      return res.status(500).json({ error: dataError.message });
    }
    
    console.log('Save successful for room:', roomId);
    res.json({ success: true });
  } catch (error) {
    console.error('Save endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    // Instead of 404, return empty data for new boards
    return res.json({ data: [] });
  }
  res.json({ data: whiteboardData.data });
});

// Create a new whiteboard room (host is guest1 by default)
app.post('/api/whiteboard/create', async (req, res) => {
  const { userId } = req.body;
  const roomId = crypto.randomUUID().slice(0, 8);
  const host = userId || 'guest1';
  const participants = [host];
  const { error } = await supabase
    .from('whiteboard_sessions')
    .insert([{ room_id: roomId, owner_id: host, participants, current_drawer: host, created_at: new Date().toISOString() }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ roomId, guestName: host });
});

// Set the current drawer
app.post('/api/whiteboard/set-drawer', async (req, res) => {
  const { roomId, drawerId } = req.body;
  if (!roomId || !drawerId) return res.status(400).json({ error: 'Missing roomId or drawerId' });

  const { error } = await supabase
    .from('whiteboard_sessions')
    .update({ current_drawer: drawerId })
    .eq('room_id', roomId);

  if (error) return res.status(500).json({ error: error.message });

  io.to(roomId).emit('drawer-changed', { drawerId });

  res.json({ success: true });
});

// Join a whiteboard room (assign guestN or use userId)
app.post('/api/whiteboard/join', async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'Missing roomId' });

  // Fetch current participants
  const { data: session, error: fetchError } = await supabase
    .from('whiteboard_sessions')
    .select('participants')
    .eq('room_id', roomId)
    .single();

  if (fetchError || !session) return res.status(404).json({ error: 'Room not found' });

  let participantId = userId;
  let participants = session.participants || [];

  if (!participantId) {
    // Assign next guest name
    const guestNumbers = participants
      .filter((p: string) => typeof p === 'string' && p.startsWith('guest'))
      .map((p: string) => parseInt(p.replace('guest', ''), 10))
      .filter((n: number) => !isNaN(n));
    const nextGuestNum = guestNumbers.length > 0 ? Math.max(...guestNumbers) + 1 : 2;
    participantId = `guest${nextGuestNum}`;
  }

  if (!participants.includes(participantId)) {
    participants.push(participantId);
    const { error: updateError } = await supabase
      .from('whiteboard_sessions')
      .update({ participants })
      .eq('room_id', roomId);
    if (updateError) return res.status(500).json({ error: updateError.message });
    
    // Emit user-joined event with the actual participant name
    io.to(roomId).emit('user-joined', { participantName: participantId });
  }

  res.json({ participantId });
});

// Update host after login
app.post('/api/whiteboard/update-host', async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId) return res.status(400).json({ error: 'Missing roomId or userId' });

  // Update owner_id from guest1 to userId
  const { error } = await supabase
    .from('whiteboard_sessions')
    .update({ owner_id: userId })
    .eq('room_id', roomId)
    .eq('owner_id', 'guest1');
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

// Get session info for a room
app.get('/api/whiteboard/:roomId/session', async (req, res) => {
  const { roomId } = req.params;
  const { data: session, error } = await supabase
    .from('whiteboard_sessions')
    .select('participants, current_drawer, owner_id')
    .eq('room_id', roomId)
    .single();
  if (error || !session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// Get all saved whiteboards for a user
app.get('/api/whiteboard/user/:userId/saved', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('whiteboard_sessions')
      .select(`
        id,
        room_id,
        owner_id,
        created_at,
        updated_at,
        whiteboard_data(data)
      `)
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved whiteboards:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ whiteboards: data || [] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 