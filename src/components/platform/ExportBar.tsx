interface Props {
  onPng: () => void;
  onCsv: () => void;
  onJson: () => void;
  onPdf: () => void;
}

const BTN =
  "hot glass flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:text-white hover:border-white/25";

export default function ExportBar({ onPng, onCsv, onJson, onPdf }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className={BTN} onClick={onPng}>
        ⬇ PNG
      </button>
      <button className={BTN} onClick={onCsv}>
        ⬇ CSV
      </button>
      <button className={BTN} onClick={onJson}>
        ⬇ JSON
      </button>
      <button className={BTN} onClick={onPdf}>
        ⎙ PDF report
      </button>
    </div>
  );
}
