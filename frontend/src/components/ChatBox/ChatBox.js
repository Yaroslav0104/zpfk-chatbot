import React from 'react';
import './ChatBox.css';

const ChatBox = ({ messages, chatEndRef, startMessage }) => {
  return (
    <div className="chatbox">
      {/* Перше привітання бота */}
      <div className="bot">
        <strong>Бот:</strong>
        {/* Використовуємо dangerouslySetInnerHTML для підтримки посилань та HTML */}
        <div dangerouslySetInnerHTML={{ __html: startMessage }} />
      </div>

      {/* Список повідомлень */}
      {messages.map((msg, index) => (
        <div key={index} className={msg.sender}>
          <strong>{msg.sender === "bot" ? "Бот:" : "Ви:"}</strong>
          {/* Якщо повідомлення від бота — рендеримо HTML, якщо від користувача — звичайний текст */}
          {msg.sender === "bot" ? (
            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
          ) : (
            <p>{msg.text}</p>
          )}
        </div>
      ))}

      {/* Якір для автоматичного скролу вниз */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;