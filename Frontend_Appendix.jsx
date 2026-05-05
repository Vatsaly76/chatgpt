/* =====================================================================
   FRONTEND CORE LOGIC IMPLEMENTATION
===================================================================== */

/* =====================================================================
===================================================================== */
Module: Frontend/src/components/chat/ChatApp.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiSidebar } from 'react-icons/fi';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { AuthContext } from '../../contexts/AuthContext';

const createId = () => Math.random().toString(36).slice(2);

const ChatApp = () => {
  // State variables as requested
  const [previousChats, setPreviousChats] = useState([]); // stores previous chats
  const [messages, setMessages] = useState([]); // current chat messages
  const [input, setInput] = useState(''); // user input
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  // Additional internal state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleAiResponse = (message) => {
        const aiMsg = {
          id: createId(),
          role: 'ai',
          content: message.content,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, aiMsg]);
        updateChat(message.chat, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: [...(c.messages || []), aiMsg]
        }));
        setIsSending(false);
      };

      const handleAiError = (error) => {
        console.error("Received AI error from server:", error);
        setIsSending(false);

        const errorMsg = {
          id: createId(),
          role: 'ai',
          content: `⚠️ **Error**: ${error.message || "An unexpected error occurred."}`,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, errorMsg]);
      };

      socket.on("ai-response", handleAiResponse);
      socket.on("ai-error", handleAiError);

      return () => {
        socket.off("ai-response", handleAiResponse);
        socket.off("ai-error", handleAiError);
      };
    }
  }, [socket]);

  useEffect(() => {
    const getChats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chat", { withCredentials: true });
        const sortedChats = response.data.chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setPreviousChats(sortedChats);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
    };
    if (user) {
      getChats();
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateChat = (chatId, updater) => {
    setPreviousChats((prev) => prev.map((c) => (c._id === chatId ? updater(c) : c)));
  };

  const handleNewChat = async () => {
    console.log('New chat button clicked - creating new chat');
    
    try {
      // Create a new chat on the backend
      const response = await axios.post("http://localhost:5000/chat", {
        title: "New Chat",
      }, { withCredentials: true });

      const newChat = response.data.chat;
      console.log('New chat created:', newChat);
      
      // Add the new chat to the beginning of the chats list
      setPreviousChats((prev) => [newChat, ...prev]);
      
      // Set this as the current chat
      setCurrentChatId(newChat._id);
      setMessages([]);
      
      console.log('New chat set as current:', newChat._id);
    } catch (error) {
      console.error("Failed to create new chat", error);
      // Fallback to just clearing the current chat if API fails
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleSelectChat = async (id) => {
    setCurrentChatId(id);
    try {
      const response = await axios.get(`http://localhost:5000/chat/${id}`, { withCredentials: true });
      const fetchedChat = response.data.chat;
      
      // Transform messages to ensure they have proper IDs and structure
      const transformedMessages = (fetchedChat.messages || []).map((msg) => ({
        id: msg._id || createId(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || msg.createdAt || new Date()
      }));
      
      setMessages(transformedMessages);
      updateChat(id, (c) => ({ ...c, messages: transformedMessages }));
    } catch (error) {
      console.error("Failed to fetch chat messages", error);
      setMessages([]);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      // Call the backend API to delete the chat
      await axios.delete(`http://localhost:5000/chat/${chatId}`, { withCredentials: true });
      
      // Remove the chat from the local state
      setPreviousChats((prev) => prev.filter(chat => chat._id !== chatId));
      
      // If this was the current chat, clear it
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      
      console.log('Chat deleted successfully:', chatId);
    } catch (error) {
      console.error("Failed to delete chat", error);
      // You could add a toast notification here for better UX
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleSend = async (text) => {
    let chatId = currentChatId;
    
    // Only create a new chat if we don't have a current one
    if (!chatId) {
      try {
        const response = await axios.post("http://localhost:5000/chat", {
          title: text.slice(0, 30) || "New Chat",
        }, { withCredentials: true });

        const newChat = response.data.chat;
        setPreviousChats((prev) => [newChat, ...prev]);
        chatId = newChat._id;
        setCurrentChatId(newChat._id);
      } catch (error) {
        console.error("Failed to create new chat", error);
        return;
      }
    }

    const userMsg = { id: createId(), role: 'user', content: text, timestamp: new Date() };

    // update local messages state (for current chat view)
    setMessages((prev) => [...prev, userMsg]);

    // update the corresponding chat in history
    updateChat(chatId, (c) => {
      // Update title if this is the first message and the title is still "New Chat"
      const newTitle = ((c.messages || []).length === 0 && c.title === "New Chat") 
        ? text.slice(0, 30) || 'New Chat' 
        : c.title;
      
      // Update title on server if it changed
      if (newTitle !== c.title) {
        axios.put(`http://localhost:5000/chat/${chatId}`, { title: newTitle }, { withCredentials: true })
          .catch(error => console.error('Failed to update chat title:', error));
      }
      
      return {
        ...c,
        title: newTitle,
        updatedAt: Date.now(),
        messages: [...(c.messages || []), userMsg],
      };
    });

    setInput('');
    setIsSending(true);

    if (socket) {
      socket.emit('ai-message', { content: text, chat: chatId });
    }
  };

  return (
    <div className={`chat-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <ChatSidebar
        chats={previousChats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <main className="chat-main" role="main">
        {!isSidebarOpen && (
          <button className="sidebar-open-button" onClick={toggleSidebar} aria-label="Open sidebar">
            <FiSidebar size={20} />
          </button>
        )}
        <ChatWindow messages={messages} />
        <ChatInput input={input} setInput={setInput} onSend={handleSend} isSending={isSending} />
      </main>
    </div>
  );
};

export default ChatApp;



Module: Frontend/src/components/chat/ChatWindow.jsx

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



 Module: Frontend/src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Attempt to load user data from storage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


