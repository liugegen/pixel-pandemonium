import React, { useState, useEffect, useRef } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useAccount } from 'wagmi';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const session = useMultisynq();
  const { address } = useAccount();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!session) return;

    const handleNewMessage = (messageData) => {
      setMessages(prev => [...prev, messageData]);
    };

    session.view.subscribe("chatScope", "newMessage", handleNewMessage);
    
    if (session.model.chatMessages) {
      setMessages(session.model.chatMessages);
    }

    return () => session.view.unsubscribe("chatScope", "newMessage", handleNewMessage);
  }, [session]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !session || !address) return;

    const messageData = {
      id: Date.now() + Math.random(),
      text: inputMessage.trim(),
      sender: address,
      timestamp: Date.now()
    };

    session.view.publish("chatScope", "sendMessage", messageData);
    setInputMessage('');
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session) return null;

  return (
    <div className="chat-container">
      <h3>Chat</h3>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.sender === address ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <span className="sender">{formatAddress(msg.sender)}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={address ? "Type a message..." : "Connect wallet to chat"}
          maxLength={100}
          disabled={!address}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim() || !address}
          className="chat-send-btn"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat;
