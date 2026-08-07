import React from 'react';

export function formatTextWithBadges(text) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <span key={index} className="inline-flex items-center gap-1 font-mono text-cyber-accent bg-cyber-accent/[0.08] px-1.5 py-0.2 rounded text-[11px] mx-0.5 font-bold">
          <span>{codeText}</span>
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-cyber-accent font-bold tracking-tight bg-cyber-accent/[0.08] px-1.5 py-0.2 rounded">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function formatCodeWithTheme(code) {
  if (!code) return '';
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="text-[#5c6370] italic">$1</span>');
  html = html.replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`|&apos;.*?&apos;|".*?"|'.*?')/g, '<span class="text-[#98c379]">$1</span>');
  html = html.replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|new|this|async|await|try|catch|switch|case|default|break)\b/g, '<span class="text-[#c678dd] font-bold">$1</span>');
  html = html.replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#d19a66]">$1</span>');
  html = html.replace(/\b(\d+)\b/g, '<span class="text-[#d19a66]">$1</span>');
  html = html.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g, '<span class="text-[#61afef]">$1</span>');
  
  return html;
}
