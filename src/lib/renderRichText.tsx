import React from "react";

export function renderRichText(text?: string | null): React.ReactNode {
  if (!text) return null;

  // Split lines to preserve paragraphs
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    // Regex matching markdown link: [label](url) OR raw url: https?://...
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        elements.push(line.substring(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // Markdown [label](url)
        elements.push(
          <a
            key={`md-${lineIndex}-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        // Raw URL
        elements.push(
          <a
            key={`raw-${lineIndex}-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "underline",
              wordBreak: "break-all",
            }}
          >
            {match[3]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(line.substring(lastIndex));
    }

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {elements}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
