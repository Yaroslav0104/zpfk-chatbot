import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, 
  TableCell, TableHead, TableRow, TextField, CircularProgress, 
  Chip, useMediaQuery, useTheme 
} from "@mui/material";

// Шлях до твого файлу steps.js
import defaultSteps from './data/steps.js'; 

const API_URL = "http://localhost/backend"; 

export default function BotSettings({ isDarkMode, setSnackbar }) {
  const [botTexts, setBotTexts] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Адаптивність
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const topRef = useRef(null);

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/get-steps.php`);
      let dbTexts = [];
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          dbTexts = data;
        }
      }

      const allAvailableTexts = Object.keys(defaultSteps)
        .map(key => {
          const step = defaultSteps[key];
          const dbMatch = dbTexts.find(dbItem => dbItem.id === key);
          
          return {
            id: key,
            message: dbMatch ? dbMatch.message : step.message,
            isModified: !!dbMatch 
          };
        })
        .filter(item => item.message);

      setBotTexts(allAvailableTexts);
    } catch (err) {
      setSnackbar({ open: true, message: "Помилка завантаження текстів", type: "error" });
    }
    setLoading(false);
  };

  const handleSaveText = async () => {
    const htmlFormattedMessage = editMessage.replace(/\n/g, '<br/>');

    try {
      const res = await fetch(`${API_URL}/update-step.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_id: editingItem.id, message: htmlFormattedMessage })
      });
      const result = await res.json();
      
      if (result.success) {
        setSnackbar({ open: true, message: "Текст успішно оновлено!", type: "success" });
        setBotTexts(prev => prev.map(t => t.id === editingItem.id ? { ...t, message: htmlFormattedMessage, isModified: true } : t));
        setEditingItem(null);
      } else {
        setSnackbar({ open: true, message: "Помилка: " + result.error, type: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Помилка з'єднання", type: "error" });
    }
  };

  const stripHtml = (htmlString) => {
    return htmlString.replace(/<[^>]*>?/gm, ''); 
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#38bdf8" }} /></Box>;
  }

  return (
    <Paper className="glass-panel" sx={{ p: isMobile ? 2 : 3 }}>
      <div ref={topRef} style={{ position: 'absolute', top: 0 }} />

      <Typography variant="h5" sx={{ color: isDarkMode ? "#f3f4f6" : "#0f172a", fontWeight: 700, mb: 3 }}>
        Управління текстами бота
      </Typography>
      
      {editingItem && (
        <Box sx={{ 
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', 
          p: isMobile ? 2 : 3, 
          borderRadius: 2, mb: 4, 
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` 
        }}>
          <Typography variant="subtitle2" sx={{ color: '#38bdf8', mb: 2, fontWeight: 'bold' }}>
            ✏️ Редагування блоку: {editingItem.id}
          </Typography>
          <TextField 
            fullWidth multiline rows={isMobile ? 12 : 8} variant="outlined"
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            sx={{ mb: 2, bgcolor: isDarkMode ? '#1e293b' : '#fff', '& .MuiInputBase-input': { color: isDarkMode ? '#fff' : '#000' } }}
          />
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Button variant="contained" color="success" onClick={handleSaveText} size="large" fullWidth={isMobile}>
              Зберегти зміни
            </Button>
            <Button variant="outlined" color="error" onClick={() => setEditingItem(null)} size="large" fullWidth={isMobile}>
              Скасувати
            </Button>
          </Box>
        </Box>
      )}

      {isMobile ? (
        // МОБІЛЬНИЙ ВИГЛЯД (КАРТКИ)
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {botTexts.map((textItem) => (
            <Box 
              key={textItem.id} 
              sx={{ 
                p: 2, borderRadius: 2, 
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fff',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '14px' }}>
                  {textItem.id}
                </Typography>
                {textItem.isModified ? (
                  <Chip label="Змінено" color="success" size="small" variant="outlined" />
                ) : (
                  <Chip label="Оригінал" size="small" variant="outlined" />
                )}
              </Box>
              <Typography sx={{ color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '14px', mb: 2 }}>
                {stripHtml(textItem.message).substring(0, 100)}...
              </Typography>
              <Button 
                fullWidth variant="contained" sx={{ bgcolor: '#3b82f6' }}
                onClick={() => {
                  const plainTextForEditor = textItem.message.replace(/<br\s*\/?>/gi, '\n');
                  setEditingItem(textItem);
                  setEditMessage(plainTextForEditor);
                  setTimeout(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 50);
                }}
              >
                Редагувати
              </Button>
            </Box>
          ))}
        </Box>
      ) : (
        // ДЕСКТОПНИЙ ВИГЛЯД (ТАБЛИЦЯ)
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table className="custom-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#9ca3af', width: '15%' }}>ID Кроку</TableCell>
                <TableCell sx={{ color: '#9ca3af', width: '55%' }}>Попередній перегляд</TableCell>
                <TableCell sx={{ color: '#9ca3af', width: '15%', textAlign: 'center' }}>Статус</TableCell>
                <TableCell sx={{ color: '#9ca3af', width: '15%', textAlign: 'center' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botTexts.map((textItem) => {
                const cleanText = stripHtml(textItem.message);
                const shortPreview = cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText;

                return (
                  <TableRow key={textItem.id} sx={{ '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' } }}>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 'bold' }}>{textItem.id}</TableCell>
                    <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#475569', fontSize: '14px' }}>
                      {shortPreview}
                    </TableCell>
                    <TableCell align="center">
                      {textItem.isModified ? (
                        <Chip label="Змінено" color="success" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Оригінал" sx={{ color: '#9ca3af', borderColor: '#9ca3af' }} size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="contained" size="small" sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        onClick={() => {
                          const plainTextForEditor = textItem.message.replace(/<br\s*\/?>/gi, '\n');
                          setEditingItem(textItem);
                          setEditMessage(plainTextForEditor);
                          setTimeout(() => {
                            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }}
                      >
                        Редагувати
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}