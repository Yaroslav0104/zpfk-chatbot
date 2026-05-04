import React from 'react';
import './RatingModal.css';

const RatingModal = ({ onRate, setComment, comment }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Оцініть нас</h3>
        <div className="stars" style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => onRate(star)}
              style={{ fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none' }}
            >
              {star}⭐
            </button>
          ))}
        </div>
        <textarea
          placeholder="Ваш коментар (необов'язково)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>
    </div>
  );
};

export default RatingModal;