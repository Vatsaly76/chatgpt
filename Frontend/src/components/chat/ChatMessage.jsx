import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`message ${isUser ? 'message--user' : 'message--ai'}`}>
      <div className="message__bubble">
        {!isUser && <span className="message__avatar" aria-hidden>🤖</span>}
        <p className="message__text">{message.content}</p>
      </div>
      <span className="message__time" aria-label="timestamp">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatMessage;
