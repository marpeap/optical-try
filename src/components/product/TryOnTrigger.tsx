import type { Frame } from "@/lib/types";

export function TryOnTrigger({
  frame,
  onOpen,
}: {
  frame: Frame;
  onOpen: () => void;
}) {
  const disponible = Boolean(frame.modele3dUrl);

  return (
    <div>
      <button type="button" disabled={!disponible} onClick={onOpen}>
        Essayer virtuellement
      </button>
      {!disponible && <p>Essayage bientôt disponible pour cette monture</p>}
    </div>
  );
}
