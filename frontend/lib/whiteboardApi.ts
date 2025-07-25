export async function saveWhiteboard(roomId: string, data: any, userId?: string) {
  const res = await fetch("http://localhost:3001/api/whiteboard/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, data, userId }),
  });
  if (!res.ok) throw new Error("Failed to save whiteboard");
  return res.json();
}

export async function loadWhiteboard(roomId: string) {
  const res = await fetch(`http://localhost:3001/api/whiteboard/${roomId}`);
  if (!res.ok) throw new Error("Failed to load whiteboard");
  const { data } = await res.json();
  return data;
} 