import React, { useEffect, useRef, useContext } from 'react';
import ChatMessage from './ChatMessage';
import { AuthContext } from '../../contexts/AuthContext';

const ChatWindow = ({ messages }) => {
  const scrollRef = useRef(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window" style={{ flex: 1 }}>
      <div className="chat-window-content" ref={scrollRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-window__empty">
            <h1>How can I help, {user?.fullName?.firstName || 'User'}?</h1>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
