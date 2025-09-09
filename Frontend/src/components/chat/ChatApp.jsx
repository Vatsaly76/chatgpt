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
        console.log("Received ai-response:", message); // For debugging
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

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSelectChat = async (id) => {
    setCurrentChatId(id);
    try {
      const response = await axios.get(`http://localhost:5000/chat/${id}`, { withCredentials: true });
      const fetchedChat = response.data.chat;
      setMessages(fetchedChat.messages || []);
      updateChat(id, (c) => ({ ...c, messages: fetchedChat.messages || [] }));
    } catch (error) {
      console.error("Failed to fetch chat messages", error);
      setMessages([]);
    }
  };

  const handleSend = async (text) => {
    let chatId = currentChatId;
    if (!chatId) {
      try {
        const response = await axios.post("http://localhost:5000/chat", {
          title: text.slice(0, 30) || "New Chat",
        }, { withCredentials: true });

        const newChat = response.data.chat;
        setPreviousChats((prev) => [newChat, ...prev]);
        chatId = newChat._id;
        setCurrentChatId(newChat._id);
        // No longer clearing messages here, as it's handled by handleNewChat
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
      const newTitle = (c.messages || []).length === 0 ? text.slice(0, 30) || 'New Chat' : c.title;
      if (newTitle !== c.title) {
        axios.put(`http://localhost:5000/chat/${chatId}`, { title: newTitle }, { withCredentials: true });
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
