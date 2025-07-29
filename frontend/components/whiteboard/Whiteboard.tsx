'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Users, Brush } from 'lucide-react';

import { useDraw } from '../../hooks/useDraw';
import type { Draw, Point } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { saveWhiteboard, loadWhiteboard } from '../../lib/whiteboardApi';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

import { Toolbar } from './Toolbar';
import { Logo } from '../Logo';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Whiteboard({ roomId, myParticipantId }: { roomId: string, myParticipantId: string }) {
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [palette, setPalette] = useState([
    '#000000',
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#eab308',
    '#a855f7',
  ]);
  const [isLoadingPalette, setIsLoadingPalette] = useState(false);
  const drawingHistory = useRef<string[]>([]);
  const { toast } = useToast();
  const socketRef = useSocket(roomId);
  const [userName, setUserName] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentDrawer, setCurrentDrawer] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tool, setTool] = useState<'draw' | 'eraser'>('draw');
  const [justRequestedCanvas, setJustRequestedCanvas] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .single();
        setUserName(profile?.name || user.email || user.id);
        setUserInfo({ name: profile?.name, email: user.email });
      } else {
        setUserName(null);
        setUserInfo(null);
      }
    });
  }, []);

  // Move fetchSession outside useEffect so it can be called from anywhere
    const fetchSession = async () => {
      const res = await fetch(`http://localhost:3001/api/whiteboard/${roomId}/session`);
      if (res.ok) {
        const { participants, current_drawer, owner_id } = await res.json();
        setParticipants(participants);
        setCurrentDrawer(current_drawer);
        setIsHost(myParticipantId === owner_id);
      }
    };

  useEffect(() => {
    fetchSession();
  }, [roomId, myParticipantId]);

  // Listen for real-time drawer changes
  useEffect(() => {
    const handler = (data: any) => {
      setCurrentDrawer(data.drawerId);
    };
    socketRef.current.on('drawer-changed', handler);
    return () => {
      socketRef.current?.off('drawer-changed', handler);
    };
  }, [socketRef]);

  // When current drawer changes, request canvas state if we're the new drawer
  useEffect(() => {
    if (currentDrawer === myParticipantId && socketRef.current) {
      // Request current canvas state from other participants
      setJustRequestedCanvas(true);
      socketRef.current.emit('request-canvas-state', { roomId });
      // Reset flag after a short delay
      setTimeout(() => setJustRequestedCanvas(false), 1000);
    }
  }, [currentDrawer, myParticipantId, roomId, socketRef]);

  // Pass drawing permission (host only)
  const passDrawingPermission = async (participantId: string) => {
    await fetch('http://localhost:3001/api/whiteboard/set-drawer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, drawerId: participantId }),
    });
    
    // Sync current canvas state to the new drawer
    if (canvasRef.current && socketRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      socketRef.current.emit('whiteboard-update', {
        roomId,
        data: dataUrl,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
      });
    }
  };

  // Only current drawer can draw
  const canDraw = myParticipantId === currentDrawer;

  const drawLine = useCallback(
    ({ prevPoint, currentPoint, ctx }: Omit<Draw, 'color' | 'strokeWidth'>) => {
      const startPoint = prevPoint ?? currentPoint;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    },
    [color, strokeWidth, tool]
  );

  const { canvasRef, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd } = useDraw(drawLine);

  useEffect(() => {
    loadWhiteboard(roomId)
      .then((data) => {
        if (data && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          const img = new Image();
          img.src = data;
          img.onload = () => {
            // Don't resize the canvas, just draw the image at its natural size
            ctx?.drawImage(img, 0, 0);
          };
        }
      })
      .catch(() => {});
  }, [roomId, canvasRef]);

  // Emit whiteboard update to server (send width and height)
  const emitWhiteboardUpdate = () => {
    if (canvasRef.current && socketRef.current && canDraw) {
      const dataUrl = canvasRef.current.toDataURL();
      console.log('Emitting whiteboard update:', { roomId, canDraw, myParticipantId });
      socketRef.current.emit('whiteboard-update', {
        roomId,
        data: dataUrl,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
      });
    }
  };

  // Update canvas with received data, resizing to match sender
  async function updateCanvasWithData({ data, width, height }: { data: string, width: number, height: number }) {
    if (canvasRef.current) {
      // Only update if we're not the current drawer (to avoid clearing our own work)
      // But allow updates when we just became the current drawer (requested canvas state)
      if (canDraw && currentDrawer === myParticipantId && !justRequestedCanvas) {
        console.log('Skipping update - we are the current drawer');
        return;
      }
      
      console.log('Updating canvas with data:', { canDraw, currentDrawer, myParticipantId, justRequestedCanvas });
      
      // Only resize if the difference is significant (more than 10px)
      const currentWidth = canvasRef.current.width;
      const currentHeight = canvasRef.current.height;
      const widthDiff = Math.abs(currentWidth - width);
      const heightDiff = Math.abs(currentHeight - height);
      
      if (widthDiff > 10 || heightDiff > 10) {
        console.log('Resizing canvas:', { currentWidth, currentHeight, width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.src = data;
      img.onload = () => {
        // Clear the canvas before drawing the new image to avoid overlapping
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      };
    }
  }

  useEffect(() => {
    const handler = (payload: any) => {
      console.log('Received whiteboard-update:', payload);
      updateCanvasWithData(payload);
    };
    socketRef.current.on('whiteboard-update', handler);

    const userJoinedHandler = (data: any) => {
      console.log('User joined:', data);
      // Fetch session to get the updated participant list and show the actual name
      fetchSession();
      toast({
        title: 'A new user joined!',
        description: data.participantName ? `${data.participantName} joined the room.` : 'Check the participants list to see who joined.',
      });
    };
    socketRef.current.on('user-joined', userJoinedHandler);

    const requestCanvasStateHandler = () => {
      console.log('Received request-canvas-state');
      // Send current canvas state when requested
      if (canvasRef.current && socketRef.current) {
        const dataUrl = canvasRef.current.toDataURL();
        socketRef.current.emit('whiteboard-update', {
          roomId,
          data: dataUrl,
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });
      }
    };
    socketRef.current.on('request-canvas-state', requestCanvasStateHandler);

    return () => {
      socketRef.current?.off('whiteboard-update', handler);
      socketRef.current?.off('user-joined', userJoinedHandler);
      socketRef.current?.off('request-canvas-state', requestCanvasStateHandler);
    };
  }, [socketRef]);

  // On mount, if autosave=1 and logged in, auto-save and show toast
  useEffect(() => {
    const autoSaveIfNeeded = async () => {
      if (searchParams.get('autosave') === '1') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL();
          try {
            await saveWhiteboard(roomId, dataUrl, user.id);
            toast({
              title: 'Success',
              description: 'You have successfully logged in and your whiteboard has been saved.',
            });
            // Remove autosave param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('autosave');
            window.history.replaceState({}, '', url.pathname + url.search);
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to save whiteboard.',
            });
          }
        }
      }
    };
    autoSaveIfNeeded();
  }, [roomId, searchParams, canvasRef]);

  const saveState = () => {
    if (canvasRef.current) {
      drawingHistory.current.push(canvasRef.current.toDataURL());
    }
  };

  const handleInteractionStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    saveState();
    onMouseDown(e);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    saveState();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const undoLast = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    if (drawingHistory.current.length > 0) {
      const lastState = drawingHistory.current.pop();
      const img = new Image();
      img.src = lastState!;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const handleShare = () => {
    // Copy the current URL without any user parameter, so new users will be prompted for their name
    const shareUrl = `${window.location.origin}/whiteboard/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now share the link with others.',
    });
  };

  const handleSave = async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with redirect and autosave
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&autosave=1`;
        return;
      }
      try {
        await saveWhiteboard(roomId, dataUrl, user.id);
        toast({
          title: 'Saved!',
          description: 'Your whiteboard has been saved.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save whiteboard.',
        });
      }
    }
  };

  const handleMouseUp = () => {
    onMouseUp();
    emitWhiteboardUpdate();
  };
  const handleTouchEnd = () => {
    onTouchEnd();
    emitWhiteboardUpdate();
  };

  // Navbar with logo, room id, share, and save
  // Place this above the main flex container in the return
  return (
    <div className="h-full w-full flex flex-col">
      <nav className="w-full flex items-center justify-between p-2 bg-gray-100 rounded mb-2 shadow">
        <div className="flex items-center gap-2">
          <Logo />
          {userInfo && (
            <Button 
              onClick={() => window.open('/saved', '_blank')}
              variant="secondary"
              size="sm"
              className="cursor-pointer hover:bg-indigo-100 transition-colors"
              title="Click to view your saved whiteboards"
            >
              {userInfo.name || userInfo.email}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Room ID: {roomId}
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-1" /> Share
          </Button>
          <Button onClick={handleSave} variant="outline" size="sm">
            Save
          </Button>
        </div>
      </nav>
      <div className="relative h-full w-full flex flex-row p-4 gap-4">
        {/* Sidebar for participants */}
        <aside className="w-48 bg-muted rounded-lg p-4 flex flex-col gap-2">
          <h2 className="font-semibold mb-2">Participants</h2>
          {participants.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span>{p}</span>
              {currentDrawer === p && <Brush className="w-4 h-4 text-blue-500" />}
              {isHost && p !== myParticipantId && (
                currentDrawer === p ? (
                  <button
                    className="ml-auto text-xs text-red-600 underline"
                    onClick={() => passDrawingPermission(myParticipantId)}
                  >
                    Revoke drawing
                  </button>
                ) : (
                  <button
                    className="ml-auto text-xs text-blue-600 underline"
                    onClick={() => passDrawingPermission(p)}
                  >
                    Allow to draw
                  </button>
                )
              )}
            </div>
          ))}
        </aside>
        {/* Main whiteboard area */}
        <div className="relative flex-1 rounded-lg shadow-inner bg-card">
          <Toolbar
            color={color}
            setColor={setColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            clearCanvas={clearCanvas}
            undoLast={undoLast}
            isLoadingPalette={isLoadingPalette}
            palette={palette}
            tool={tool}
            setTool={setTool}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={canDraw ? handleInteractionStart : undefined}
            onMouseMove={canDraw ? onMouseMove : undefined}
            onMouseUp={canDraw ? handleMouseUp : undefined}
            onTouchStart={canDraw ? onTouchStart : undefined}
            onTouchMove={canDraw ? onTouchMove : undefined}
            onTouchEnd={canDraw ? handleTouchEnd : undefined}
            className={`h-full w-full rounded-lg cursor-${canDraw ? 'crosshair' : 'not-allowed'} touch-none`}
          />
        </div>
      </div>
    </div>
  );
}