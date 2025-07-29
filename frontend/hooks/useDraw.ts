"use client";

import { useRef, useState, useEffect } from 'react';
import type { Draw, Point } from '../types';

export const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPointRef = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        // Set canvas size to match its display size (no scaling)
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  const computePointInCanvas = (clientX: number, clientY: number): Point | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handleInteractionStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = computePointInCanvas(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    );
    prevPointRef.current = point || null;
  };

  const handleInteractionMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const currentPoint = computePointInCanvas(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    );

    if (!canvasRef.current || !currentPoint) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    onDraw({ ctx, currentPoint, prevPoint: prevPointRef.current });
    prevPointRef.current = currentPoint;
  };

  const handleInteractionEnd = () => {
    setIsDrawing(false);
    prevPointRef.current = null;
  };

  return { 
    canvasRef, 
    onMouseDown: handleInteractionStart, 
    onMouseMove: handleInteractionMove, 
    onMouseUp: handleInteractionEnd,
    onTouchStart: handleInteractionStart,
    onTouchMove: handleInteractionMove,
    onTouchEnd: handleInteractionEnd,
  };
};
