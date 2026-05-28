import React from 'react';
import './ChatBox.css';

const ChatBox = ({ messages, chatEndRef, startMessage }) => {
  return (
    <div className="chatbox">
      <div className="bot">
        <strong>Бот:</strong>
        <div dangerouslySetInnerHTML={{ __html: startMessage }} />
      </div>

      {messages.map((msg, index) => (
        <div key={index} className={msg.sender}>
          <strong>{msg.sender === "bot" ? "Бот:" : "Ви:"}</strong>
          {msg.sender === "bot" ? (
            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
          ) : (
            <p>{msg.text}</p>
          )}
        </div>
      ))}

      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;