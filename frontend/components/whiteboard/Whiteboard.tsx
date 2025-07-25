'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Users, Brush } from 'lucide-react';

import { useDraw } from '../../hooks/useDraw';
import type { Draw, Point } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { saveWhiteboard, loadWhiteboard } from '../../lib/whiteboardApi';
import { createClient } from '@supabase/supabase-js';

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

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .single();
        setUserName(profile?.name || user.email || user.id);
      } else {
        setUserName(null);
      }
    });
  }, []);

  // Fetch participants and current drawer
  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch(`http://localhost:3001/api/whiteboard/${roomId}/session`);
      if (res.ok) {
        const { participants, current_drawer, owner_id } = await res.json();
        setParticipants(participants);
        setCurrentDrawer(current_drawer);
        setIsHost(myParticipantId === owner_id);
      }
    };
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

  // Pass drawing permission (host only)
  const passDrawingPermission = async (participantId: string) => {
    await fetch('http://localhost:3001/api/whiteboard/set-drawer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, drawerId: participantId }),
    });
  };

  // Only current drawer can draw
  const canDraw = myParticipantId === currentDrawer;

  const drawLine = useCallback(
    ({ prevPoint, currentPoint, ctx }: Omit<Draw, 'color' | 'strokeWidth'>) => {
      const startPoint = prevPoint ?? currentPoint;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    },
    [color, strokeWidth]
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
            ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx?.drawImage(img, 0, 0);
          };
        }
      })
      .catch(() => {});
  }, [roomId, canvasRef]);

  async function updateCanvasWithData(data: string) {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.src = data;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  useEffect(() => {
    const handler = (data: any) => {
      updateCanvasWithData(data);
    };
    socketRef.current.on('whiteboard-update', handler);

    const userJoinedHandler = (data: any) => {
      toast({
        title: 'A new user joined!',
        description: `User ID: ${data.userId}`,
      });
    };
    socketRef.current.on('user-joined', userJoinedHandler);

    return () => {
      socketRef.current?.off('whiteboard-update', handler);
      socketRef.current?.off('user-joined', userJoinedHandler);
    };
  }, [socketRef]);

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
    navigator.clipboard.writeText(window.location.href);
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
        toast({
          title: 'Not logged in',
          description: 'You must be logged in to save your whiteboard.',
        });
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
    handleSave();
  };
  const handleTouchEnd = () => {
    onTouchEnd();
    handleSave();
  };

  return (
    <div className="relative h-full w-full flex flex-row p-4 gap-4">
      {/* Sidebar for participants */}
      <aside className="w-48 bg-muted rounded-lg p-4 flex flex-col gap-2">
        <h2 className="font-semibold mb-2">Participants</h2>
        {participants.map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span>{p}</span>
            {currentDrawer === p && <Brush className="w-4 h-4 text-blue-500" />}
            {isHost && myParticipantId === currentDrawer && p !== myParticipantId && (
              <button
                className="ml-auto text-xs text-blue-600 underline"
                onClick={() => passDrawingPermission(p)}
              >
                Allow to draw
              </button>
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
  );
}