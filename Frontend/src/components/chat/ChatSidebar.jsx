import React from 'react';

const ChatSidebar = ({ chats, currentChatId, onSelectChat, onNewChat }) => {
  return (
    <aside className="chat-sidebar" aria-label="Chat history sidebar">
      <div className="chat-sidebar__header">
        <h2 className="chat-sidebar__title">Chats</h2>
        <button className="chat-sidebar__new" onClick={onNewChat} aria-label="Start new chat">+ New</button>
      </div>
      <ul className="chat-sidebar__list">
        {chats.length === 0 && <li className="chat-sidebar__empty">No previous chats</li>}
        {chats.map((c) => (
          <li key={c.id}>
            <button
              className={`chat-sidebar__item ${currentChatId === c.id ? 'is-active' : ''}`}
              onClick={() => onSelectChat(c.id)}
              title={c.title}
            >
              <span className="chat-sidebar__item-title">{c.title}</span>
              <span className="chat-sidebar__item-time">{new Date(c.updatedAt).toLocaleDateString()}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ChatSidebar;
