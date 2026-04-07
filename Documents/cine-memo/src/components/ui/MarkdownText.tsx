"use client";

// Rendu minimal du markdown généré par les LLMs :
// **gras**, *italique*, et sauts de ligne
interface MarkdownTextProps {
  text: string;
  className?: string;
}

export default function MarkdownText({ text, className }: MarkdownTextProps) {
  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((line, i) => (
        <p key={i} className={line.trim() === "" ? "mt-3" : "leading-relaxed"}>
          {renderInline(line)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  // Découpe sur **gras** et *italique*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
