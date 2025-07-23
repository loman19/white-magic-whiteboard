import { Whiteboard } from '../../../components/whiteboard/Whiteboard';
import { TooltipProvider } from "../../../components/ui/tooltip";

type WhiteboardPageProps = {
  params: {
    roomId: string;
  };
};

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  return (
    <div className="h-svh w-full overflow-hidden">
      <TooltipProvider>
        <Whiteboard roomId={params.roomId} />
      </TooltipProvider>
    </div>
  );
}
