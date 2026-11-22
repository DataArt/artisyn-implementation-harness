'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyError(false);
      setCopied(true);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  };

  return (
    <>
      <div className="start-panel">
        <div className="mono command-line">
          <span>$</span> {command}
        </div>
        <button
          type="button"
          className="copy-btn"
          onClick={copy}
          aria-label="Copy bootstrap command"
        >
          {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {copyError && (
        <div className="copy-hint" role="status">
          Automatic copy was unavailable. Select the command above to copy it manually.
        </div>
      )}
    </>
  );
}
