import React from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ onChoice }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>Чи хочете ви оцінити роботу нашого чат-бота перед виходом?</p>
        <div className="modal-buttons">
          <button onClick={() => onChoice(true)}>Так, оцінити</button>
          <button onClick={() => onChoice(false)}>Ні, повернутися</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;