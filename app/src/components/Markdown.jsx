// Tiny, safe markdown renderer for AI replies (no innerHTML).
// Supports: ``` code blocks ```, # headings, - / 1. lists, **bold**, *italic*, `code`.

function inline(text, keyBase) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={k} className="md-code">{tok.slice(1, -1)}</code>);
    else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ text }) {
  const parts = text.split(/```/);
  return parts.map((part, pi) => {
    if (pi % 2 === 1) {
      const body = part.replace(/^[\w+-]*\n/, '');
      return <pre key={pi} className="md-pre"><code>{body.replace(/\n$/, '')}</code></pre>;
    }
    const lines = part.split('\n');
    return lines.map((line, li) => {
      const k = `${pi}-${li}`;
      const nl = li < lines.length - 1 ? '\n' : '';
      const h = line.match(/^#{1,4}\s+(.*)/);
      if (h) return <strong key={k} className="md-h">{inline(h[1], k)}{nl}</strong>;
      const b = line.match(/^(\s*)[-*•]\s+(.*)/);
      if (b) return <span key={k}>{b[1]}• {inline(b[2], k)}{nl}</span>;
      if (/^\s*(---|\*\*\*)\s*$/.test(line)) return <span key={k}>{nl}</span>;
      return <span key={k}>{inline(line, k)}{nl}</span>;
    });
  });
}
