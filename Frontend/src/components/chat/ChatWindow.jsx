import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ messages }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window" ref={scrollRef} aria-live="polite">
      {messages.length === 0 ? (
        <div className="chat-window__empty">Start the conversation by saying hello 👋</div>
      ) : (
        messages.map((m) => <ChatMessage key={m.id} message={m} />)
      )}
    </div>
  );
};

export default ChatWindow;
