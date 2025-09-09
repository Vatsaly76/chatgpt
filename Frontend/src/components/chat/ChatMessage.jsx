import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Debug: Check if message content exists
  if (!message || !message.content) {
    console.warn('ChatMessage received invalid message:', message);
    return null;
  }

  return (
    <div className={`message-wrapper message-wrapper--${isUser ? 'user' : 'ai'}`}>
      <div className={`message message--${isUser ? 'user' : 'ai'}`}>
        <div className="message__content">
          <div className="message__bubble">
            <div className="message__text">
              {isUser ? (
                <span>{message.content}</span>
              ) : (
                <ReactMarkdown>{message.content || ''}</ReactMarkdown>
              )}
            </div>
          </div>
          <time className="message__time">{formatTime(message.timestamp)}</time>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
