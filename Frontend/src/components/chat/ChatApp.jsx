import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FiSidebar } from 'react-icons/fi';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { AuthContext } from '../../contexts/AuthContext';

// Simulated AI response function
const fetchAIResponse = async (message) => {
  await new Promise((res) => setTimeout(res, 700));
  const prefixes = [
    "AI:",
    "Here's a thought:",
    "Interesting!",
    "Let me help:",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} You said: "${message}"`;
};

const createId = () => Math.random().toString(36).slice(2);

const ChatApp = () => {
  // State variables as requested
  const [previousChats, setPreviousChats] = useState([]); // stores previous chats
  const [messages, setMessages] = useState([]); // current chat messages
  const [input, setInput] = useState(''); // user input
  const { user } = useContext(AuthContext);

  // Additional internal state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    try {
      const response = await axios.post("http://localhost:5000/chat", {
        title: "New Chat",
      }, { withCredentials: true });

      const newChat = response.data.chat;
      setPreviousChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat._id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new chat", error);
    }
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    const chat = previousChats.find((c) => c._id === id);
    setMessages(chat?.messages || []);
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
        setMessages([]);
      } catch (error) {
        console.error("Failed to create new chat", error);
        return;
      }
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date() };

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

    try {
      // Save user message to backend
      await axios.post(`http://localhost:5000/chat/${chatId}/messages`, userMsg, { withCredentials: true });

      const aiText = await fetchAIResponse(text);
      const aiMsg = { role: 'ai', content: aiText, timestamp: new Date() };

      // Save AI message to backend
      await axios.post(`http://localhost:5000/chat/${chatId}/messages`, aiMsg, { withCredentials: true });

      // reflect in both states
      setMessages((prev) => [...prev, aiMsg]);
      updateChat(chatId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...(c.messages || []), aiMsg] }));
    } catch (error) {
      console.error("Failed to send message", error);
      const aiMsg = { id: createId(), role: 'ai', content: 'Sorry, something went wrong.', timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
      updateChat(chatId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...(c.messages || []), aiMsg] }));
    } finally {
      setIsSending(false);
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
