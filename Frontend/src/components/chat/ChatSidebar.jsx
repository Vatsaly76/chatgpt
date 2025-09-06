import React from 'react';
import { VscNewFile } from 'react-icons/vsc';
import { FiSidebar } from 'react-icons/fi';
import { TbHexagon } from 'react-icons/tb';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

const ChatSidebar = ({ chats, currentChatId, onSelectChat, onNewChat, isSidebarOpen, onToggleSidebar }) => {
  const { user } = useContext(AuthContext);

  return (
    <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} aria-label="Chat history sidebar">
      <div className="chat-sidebar__header">
        <div className="chat-sidebar__title-container">
          <TbHexagon size={28} />
        </div>
        <div className="chat-sidebar__actions">
          <button className="chat-sidebar__new" onClick={onNewChat} aria-label="Start new chat">
            <VscNewFile size={20} />
          </button>
          <button className="chat-sidebar__toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <FiSidebar size={20} />
          </button>
        </div>
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
            </button>
          </li>
        ))}
      </ul>
      <div className="chat-sidebar__footer">
        <div className="user-profile">
          <div className="user-profile__avatar">
            <span>{user?.fullName?.firstName?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="user-profile__name">{user?.fullName?.firstName || 'User'}</span>
        </div>
        <span className="user-profile__plan">Free</span>
      </div>
    </aside>
  );
};

export default ChatSidebar;
