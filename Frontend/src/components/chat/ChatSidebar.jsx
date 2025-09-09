import React, { useState } from 'react';
import { FiSidebar, FiTrash2, FiLogOut, FiPlus } from 'react-icons/fi';
import { TbHexagon } from 'react-icons/tb';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

const ChatSidebar = ({ chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, isSidebarOpen, onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isFooterHovered, setIsFooterHovered] = useState(false);

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setShowDeleteConfirm(chatId);
  };

  const handleConfirmDelete = async (chatId) => {
    await onDeleteChat(chatId);
    setShowDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout to clear HTTP-only cookie
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and update context (this will trigger redirect)
      logout();
    }
  };

  return (
    <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} aria-label="Chat history sidebar">
      <div className="chat-sidebar__header">
        <div className="chat-sidebar__title-container">
          <TbHexagon size={28} />
        </div>
        <div className="chat-sidebar__actions">
          <button className="chat-sidebar__new" onClick={onNewChat} aria-label="Start new chat">
            <FiPlus size={20} />
          </button>
          <button className="chat-sidebar__toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <FiSidebar size={20} />
          </button>
        </div>
      </div>
      <ul className="chat-sidebar__list">
        {chats.length === 0 && <li className="chat-sidebar__empty">No previous chats</li>}
        {chats.map((c) => (
          <li key={c._id}>
            {showDeleteConfirm === c._id ? (
              <div className="chat-sidebar__delete-confirm">
                <span className="delete-confirm__message">Delete chat?</span>
                <div className="delete-confirm__actions">
                  <button 
                    className="delete-confirm__button delete-confirm__button--confirm"
                    onClick={() => handleConfirmDelete(c._id)}
                  >
                    Delete
                  </button>
                  <button 
                    className="delete-confirm__button delete-confirm__button--cancel"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`chat-sidebar__item-container ${currentChatId === c._id ? 'is-active' : ''}`}
                onMouseEnter={() => setHoveredChatId(c._id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <button
                  className="chat-sidebar__item"
                  onClick={() => onSelectChat(c._id)}
                  title={c.title}
                >
                  <span className="chat-sidebar__item-title">{c.title}</span>
                </button>
                {(hoveredChatId === c._id || currentChatId === c._id) && (
                  <button
                    className="chat-sidebar__delete"
                    onClick={(e) => handleDeleteClick(e, c._id)}
                    aria-label="Delete chat"
                    title="Delete chat"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div 
        className="chat-sidebar__footer"
        onMouseEnter={() => setIsFooterHovered(true)}
        onMouseLeave={() => setIsFooterHovered(false)}
      >
        <div className="user-profile">
          <div className="user-profile__avatar">
            <span>{user?.fullName?.firstName?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="user-profile__name">{user?.fullName?.firstName || 'User'}</span>
        </div>
        <div className="user-profile__plan-container">
          <span className="user-profile__plan">Logout</span>
          {isFooterHovered && (
            <button 
              className="user-profile__logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <FiLogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
