import React, { useEffect, useState } from 'react';

const StreamingConsole = ({ rawText, active }) => {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!rawText) return;

    let index = typedText.length;
    const interval = setInterval(() => {
      if (index < rawText.length) {
        setTypedText((prev) => prev + rawText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Fast typing simulation

    return () => clearInterval(interval);
  }, [rawText]);

  return (
    <div
      style={{
        background: '#090d16',
        border: '1px solid var(--primary)',
        borderRadius: '8px',
        padding: '1.2rem',
        fontFamily: 'monospace',
        color: '#6ee7b7',
        fontSize: '0.88rem',
        minHeight: '120px',
        maxHeight: '300px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '10px' }}>
        <span>🤖 AI Mentorship Stream Engine</span>
        <span style={{ color: active ? '#ef4444' : '#10b981' }}>{active ? '● Streaming Chunks' : '● Completed'}</span>
      </div>
      <div>
        {typedText}
        {active && <span className="typing-cursor">_</span>}
      </div>
    </div>
  );
};

export default StreamingConsole;
