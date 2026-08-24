import React from 'react';

export function formatTextWithBadges(text) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-amber-200 border border-white/10 font-mono text-[11px] font-medium mx-0.5 select-all"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-white font-bold tracking-tight">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function formatCodeWithTheme(code) {
  if (!code) return '';
  const tokens = [];
  const addToken = (value, className) => {
    const id = `__AICP_TOK_${tokens.length}__`;
    tokens.push({ id, value, className });
    return id;
  };

  let text = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Extract comments & strings to safe placeholder tokens
  text = text.replace(/(\/\/.*$|#.*$)/gm, m => addToken(m, 'text-[#5c6370] italic'));
  text = text.replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`|&apos;.*?&apos;|".*?"|'.*?')/g, m => addToken(m, 'text-[#98c379]'));

  // 2. Safely highlight keywords, numbers, and functions on pure code text
  text = text.replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|new|this|async|await|try|catch|switch|case|default|break)\b/g, '<span class="text-[#c678dd] font-bold">$1</span>');
  text = text.replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#d19a66]">$1</span>');
  text = text.replace(/\b(\d+)\b/g, '<span class="text-[#d19a66]">$1</span>');
  text = text.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g, '<span class="text-[#61afef]">$1</span>');

  // 3. Restore all protected tokens with their respective styling spans
  for (const t of tokens) {
    text = text.replace(t.id, `<span class="${t.className}">${t.value}</span>`);
  }

  return text;
}
