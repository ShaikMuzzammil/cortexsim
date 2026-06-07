import { useCursor } from "../hooks/useCursor";

export default function Cursor() {
  const { dotRef, ringRef } = useCursor();
  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
