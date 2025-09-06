import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ messages }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-window-content" ref={scrollRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-window__empty">
            <h1>How can I help, vatsaly?</h1>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
