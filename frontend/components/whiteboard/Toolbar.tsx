'use client';

import { Eraser, Palette, Sparkles, Trash2, Minus, Plus, Undo2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { Separator } from '../ui/separator';

type ToolbarProps = {
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  clearCanvas: () => void;
  undoLast: () => void;
  isLoadingPalette: boolean;
  palette: string[];
};

export function Toolbar({
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  clearCanvas,
  undoLast,
  isLoadingPalette,
  palette,
}: ToolbarProps) {
  const eraserColor = '#F0F0F0';

  return (
    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-lg border bg-card p-2 shadow-lg">
        <div className="flex items-center gap-2">
          {palette.map((c) => (
            <Tooltip key={c}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-all duration-200 ${
                    color === c && 'ring-2 ring-primary ring-offset-2'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{c}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />
        
        <div className="flex items-center gap-3">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <Slider
              min={1}
              max={50}
              step={1}
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              className="w-32"
              aria-label="Stroke width"
            />
            <Plus className="h-4 w-4 text-muted-foreground" />
        </div>

        <Separator orientation="vertical" className="h-8" />
        
        <div className="flex items-center gap-2">
           <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={color === eraserColor ? 'secondary' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setColor(eraserColor)}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eraser</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={undoLast}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
