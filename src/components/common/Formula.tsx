import React, { useEffect, useState } from 'react';

type Katex = typeof import('katex');
let katexPromise: Promise<Katex> | null = null;
/** KaTeX (+ its CSS and fonts) is ~300 KB, so it loads the first time a formula is shown. */
const loadKatex = () =>
  (katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([k]) => (k as any).default ?? k));

/** Renders a LaTeX formula with KaTeX; shows the raw source until KaTeX arrives (or if it cannot parse). */
export const Formula: React.FC<{ tex: string; display?: boolean; className?: string }> = ({ tex, display = true, className }) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadKatex()
      .then((katex) => {
        if (!alive) return;
        try {
          setHtml(katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' }));
        } catch {
          setHtml(null);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [tex, display]);

  if (!html) return <code className={`block font-mono text-[12px] opacity-80 ${className ?? ''}`}>{tex}</code>;
  return <div className={`overflow-x-auto overflow-y-hidden ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
