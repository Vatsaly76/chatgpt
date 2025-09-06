import React from 'react';
import { FiPlus, FiSend } from 'react-icons/fi';

const ChatInput = ({ input, setInput, onSend, isSending }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSend(input.trim());
  };

  return (
    <div className="chat-input-container">
      <form className="chat-input" onSubmit={handleSubmit}>
        <button type="button" className="chat-input__button" aria-label="Attach file">
          <FiPlus size={20} />
        </button>
        <input
          type="text"
          className="chat-input__field"
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Chat message input"
        />
        <button className="chat-input__send" type="submit" disabled={isSending || !input.trim()} aria-label="Send message">
          {isSending ? '...' : <FiSend size={20} />}
        </button>
      </form>
      <p className="chat-input__info">
        I store memory in a vector database and use it to answer your questions.
      </p>
    </div>
  );
};

export default ChatInput;
