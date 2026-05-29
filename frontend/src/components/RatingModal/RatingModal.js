import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';

export default function RatingModal({ onRate, setComment, comment, onClose }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  const handleSubmit = () => {
    if (selectedStar > 0) {
      onRate(selectedStar);
    }
  };

  return (
    <div className="bot-modal-overlay">
      <div className="bot-modal-content" style={{ padding: '30px 24px', textAlign: 'center', maxWidth: '400px', position: 'relative' }}>
        
        {/* Кнопка виходу */}
        {onClose && (
          <IconButton 
            onClick={onClose} 
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: 'inherit', // Колір підлаштується під тему
              opacity: 0.6,
              '&:hover': { color: '#f87171', opacity: 1, bgcolor: 'rgba(248, 113, 113, 0.1)' } 
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'inherit' }}>
          Оцініть нас
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              onClick={() => setSelectedStar(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              sx={{
                // Якщо зірка активна - золота, якщо ні - напівпрозора (підходить для обох тем)
                color: (hoveredStar || selectedStar) >= star ? '#fbbf24' : 'rgba(156, 163, 175, 0.4)', 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.15)' },
                padding: 1
              }}
            >
              {(hoveredStar || selectedStar) >= star ? (
                <StarIcon sx={{ fontSize: '44px' }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: '44px' }} />
              )}
            </IconButton>
          ))}
        </Box>

        <Box sx={{ height: '24px', mb: 3 }}>
          {selectedStar > 0 ? (
            <Typography variant="subtitle1" sx={{ color: '#10b981', fontWeight: 600 }}>
              Ви оцінюєте на {selectedStar} {selectedStar === 1 ? 'зірку' : selectedStar >= 2 && selectedStar <= 4 ? 'зірки' : 'зірок'}!
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.6 }}>
              Натисніть на зірочку, щоб оцінити
            </Typography>
          )}
        </Box>

        {/* Використовуємо твій CSS-клас замість TextField */}
        <textarea
          placeholder="Ваш коментар (необов'язково)"
          className="bot-glass-input modal-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}
        />

        {selectedStar > 0 && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              py: 1.5,
              borderRadius: 2,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            ЗАЛИШИТИ ВІДГУК
          </Button>
        )}
      </div>
    </div>
  );
}