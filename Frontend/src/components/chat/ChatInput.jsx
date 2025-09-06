import React from 'react';

const ChatInput = ({ input, setInput, onSend, isSending }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSend(input.trim());
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input__field"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Chat message input"
      />
      <button className="chat-input__send" type="submit" disabled={isSending || !input.trim()} aria-label="Send message">
        {isSending ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;
