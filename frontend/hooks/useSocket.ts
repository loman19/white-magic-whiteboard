import { useEffect, useRef } from "react";
import io from "socket.io-client";

export function useSocket(roomId: string) {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("join-room", roomId);
    return () => {
      socketRef.current?.emit("leave-room", roomId);
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  return socketRef;
} 