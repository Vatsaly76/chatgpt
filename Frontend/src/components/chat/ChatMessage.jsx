import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-wrapper message-wrapper--${isUser ? 'user' : 'ai'}`}>
      <div className={`message message--${isUser ? 'user' : 'ai'}`}>
        <div className="message__content">
          <div className="message__bubble">
            <p className="message__text">{message.content}</p>
          </div>
          <time className="message__time">{formatTime(message.timestamp)}</time>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
