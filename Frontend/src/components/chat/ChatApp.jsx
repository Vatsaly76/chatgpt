import React, { useState } from 'react';
import { FiSidebar } from 'react-icons/fi';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

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

// Example dummy chat history
const initialChats = [
  {
    id: createId(),
    title: 'Getting Started',
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    messages: [
      { id: createId(), role: 'ai', content: 'Hi! I\'m your assistant. How can I help today?', timestamp: Date.now() - 1000 * 60 * 60 * 12 },
      { id: createId(), role: 'user', content: 'Show me how this works.', timestamp: Date.now() - 1000 * 60 * 60 * 12 + 10000 },
      { id: createId(), role: 'ai', content: 'Just type a message below and press Send.', timestamp: Date.now() - 1000 * 60 * 60 * 12 + 20000 },
    ],
  },
  {
    id: createId(),
    title: 'Design Ideas',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    messages: [
      { id: createId(), role: 'user', content: 'Suggest a color palette for a modern app.', timestamp: Date.now() - 1000 * 60 * 60 * 24 },
      { id: createId(), role: 'ai', content: 'Try blue-gray with vibrant accents like teal or coral.', timestamp: Date.now() - 1000 * 60 * 60 * 24 + 15000 },
    ],
  },
];

const ChatApp = () => {
  // State variables as requested
  const [previousChats, setPreviousChats] = useState(initialChats); // stores previous chats
  const [messages, setMessages] = useState([]); // current chat messages
  const [input, setInput] = useState(''); // user input

  // Additional internal state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateChat = (chatId, updater) => {
    setPreviousChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)));
  };

  const handleNewChat = () => {
    const id = createId();
    const newChat = { id, title: 'New Chat', updatedAt: Date.now(), messages: [] };
    setPreviousChats((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setMessages([]);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    const chat = previousChats.find((c) => c.id === id);
    setMessages(chat ? chat.messages : []);
  };

  const handleSend = async (text) => {
    let chatId = currentChatId;
    if (!chatId) {
      // create a new chat synchronously
      chatId = createId();
      const newChat = { id: chatId, title: 'New Chat', updatedAt: Date.now(), messages: [] };
      setPreviousChats((prev) => [newChat, ...prev]);
      setCurrentChatId(chatId);
      setMessages([]);
    }

    const userMsg = { id: createId(), role: 'user', content: text, timestamp: Date.now() };

    // update local messages state (for current chat view)
    setMessages((prev) => [...prev, userMsg]);

    // update the corresponding chat in history
    updateChat(chatId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 30) || 'New Chat' : c.title,
      updatedAt: Date.now(),
      messages: [...c.messages, userMsg],
    }));

    setInput('');

    setIsSending(true);
    try {
      const aiText = await fetchAIResponse(text);
      const aiMsg = { id: createId(), role: 'ai', content: aiText, timestamp: Date.now() };

      // reflect in both states
      setMessages((prev) => [...prev, aiMsg]);
      updateChat(chatId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...c.messages, aiMsg] }));
    } catch {
      const aiMsg = { id: createId(), role: 'ai', content: 'Sorry, something went wrong.', timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
      updateChat(chatId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...c.messages, aiMsg] }));
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
