import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, 
  TableCell, TableHead, TableRow, TextField, CircularProgress, 
  Chip, useMediaQuery, useTheme, Divider
} from "@mui/material";

// Шлях до твого файлу steps.js
import defaultSteps from './data/steps.js'; 

const API_URL = "http://localhost/backend"; 

export default function BotSettings({ isDarkMode, setSnackbar }) {
  const [botTexts, setBotTexts] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  
  const [editPlainText, setEditPlainText] = useState("");
  const [editLinkText, setEditLinkText] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  
  const [loading, setLoading] = useState(true);

  // Адаптивність
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const topRef = useRef(null);

  useEffect(() => {
    fetchTexts();
  }, []);

  // Додано параметр silent, щоб не показувати "крутилку" при фоновому оновленні
  const fetchTexts = async (silent = false) => {
    if (!silent) setLoading(true);
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
    if (!silent) setLoading(false);
  };

  const handleSaveText = async () => {
    let finalMessage = editPlainText.replace(/\n/g, '<br/>');

    if (editLinkUrl.trim() !== "" && editLinkText.trim() !== "") {
      const linkHtml = `<a target="_blank" rel="noopener noreferrer" href="${editLinkUrl.trim()}">${editLinkText.trim()}</a>`;
      
      if (finalMessage.includes('[ПОСИЛАННЯ]')) {
        finalMessage = finalMessage.replace('[ПОСИЛАННЯ]', linkHtml);
      } else {
        finalMessage += ` ${linkHtml}`;
      }
    } else {
      finalMessage = finalMessage.replace(/\[ПОСИЛАННЯ\]/g, '');
    }

    try {
      const res = await fetch(`${API_URL}/update-step.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_id: editingItem.id, message: finalMessage })
      });
      const result = await res.json();
      
      if (result.success) {
        setSnackbar({ open: true, message: "Текст успішно оновлено!", type: "success" });
        
        setEditingItem(null); // Миттєво закриваємо вікно редактора
        
        // МАГІЯ ТУТ: Тихо оновлюємо дані з БД без перезавантаження сторінки
        fetchTexts(true); 
        
      } else {
        setSnackbar({ open: true, message: "Помилка: " + result.error, type: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Помилка з'єднання", type: "error" });
    }
  };

  const startEditing = (textItem) => {
    const rawHtml = textItem.message;
    let tempText = rawHtml.replace(/<br\s*\/?>/gi, '\n');
    
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["'](.*?)["'][^>]*>(.*?)<\/a>/i;
    const match = tempText.match(linkRegex);

    if (match) {
      setEditLinkUrl(match[1]); 
      setEditLinkText(match[2].replace(/<[^>]*>?/gm, '')); 
      tempText = tempText.replace(match[0], '[ПОСИЛАННЯ]'); 
    } else {
      setEditLinkUrl("");
      setEditLinkText("");
    }

    tempText = tempText.replace(/<[^>]*>?/gm, '');
    
    setEditPlainText(tempText);
    setEditingItem(textItem);
    setTimeout(() => { topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  };

  const stripHtml = (htmlString) => {
    return htmlString.replace(/<[^>]*>?/gm, ''); 
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#38bdf8" }} /></Box>;
  }

  // Кольори для UI
  const tableHeaderBg = isDarkMode ? '#1e293b' : '#f8fafc';
  const tableRowBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tableRowHoverBg = isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const inputBg = isDarkMode ? '#0f172a' : '#f8fafc';
  const inputTextColor = isDarkMode ? '#f1f5f9' : '#0f172a';

  return (
    <Box sx={{ pb: 4 }}>
      <div ref={topRef} style={{ position: 'absolute', top: 0 }} />

      {/* ПАНЕЛЬ РЕДАГУВАННЯ */}
      {editingItem && (
        <Paper elevation={0} sx={{ 
          bgcolor: isDarkMode ? '#1e293b' : '#ffffff', 
          p: isMobile ? 2 : 3, 
          borderRadius: 2, mb: 4, 
          border: `1px solid ${borderColor}` 
        }}>
          <Typography variant="subtitle2" sx={{ color: '#38bdf8', mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
            ✏️ Редагування блоку: {editingItem.id}
          </Typography>
          
          <TextField 
            label="Текст повідомлення (Залиште [ПОСИЛАННЯ] там, де має бути кнопка)"
            fullWidth multiline rows={isMobile ? 6 : 4} variant="outlined"
            value={editPlainText}
            onChange={(e) => setEditPlainText(e.target.value)}
            InputLabelProps={{ style: { color: isDarkMode ? '#94a3b8' : '#64748b' } }}
            sx={{ 
              mb: 3, bgcolor: inputBg, 
              '& .MuiInputBase-input': { color: inputTextColor, lineHeight: 1.6 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: borderColor }
            }}
          />

          <Divider sx={{ mb: 3, borderColor: borderColor }} />
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 'bold' }}>
            🔗 Налаштування посилання (необов'язково)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
            <TextField 
              label="Текст посилання (наприклад: 'тут', 'сюди')"
              fullWidth variant="outlined"
              value={editLinkText}
              onChange={(e) => setEditLinkText(e.target.value)}
              InputLabelProps={{ style: { color: isDarkMode ? '#94a3b8' : '#64748b' } }}
              sx={{ bgcolor: inputBg, '& .MuiInputBase-input': { color: inputTextColor }, '& .MuiOutlinedInput-notchedOutline': { borderColor: borderColor } }}
            />
            <TextField 
              label="URL посилання (https://...)"
              fullWidth variant="outlined"
              value={editLinkUrl}
              onChange={(e) => setEditLinkUrl(e.target.value)}
              InputLabelProps={{ style: { color: isDarkMode ? '#94a3b8' : '#64748b' } }}
              sx={{ bgcolor: inputBg, '& .MuiInputBase-input': { color: inputTextColor }, '& .MuiOutlinedInput-notchedOutline': { borderColor: borderColor } }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Button variant="contained" color="success" onClick={handleSaveText} size="large" fullWidth={isMobile} sx={{ fontWeight: 'bold' }}>
              Зберегти зміни
            </Button>
            <Button variant="outlined" color="error" onClick={() => setEditingItem(null)} size="large" fullWidth={isMobile} sx={{ fontWeight: 'bold' }}>
              Скасувати
            </Button>
          </Box>
        </Paper>
      )}

      {isMobile ? (
        // МОБІЛЬНИЙ ВИГЛЯД
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {botTexts.map((textItem) => (
            <Paper key={textItem.id} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: tableRowBg, border: `1px solid ${borderColor}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography sx={{ color: isDarkMode ? '#e2e8f0' : '#0f172a', fontWeight: 'bold', fontSize: '15px' }}>{textItem.id}</Typography>
                {textItem.isModified ? <Chip label="ЗМІНЕНО" sx={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px' }} size="small" variant="outlined" /> : <Chip label="ОРИГІНАЛ" sx={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px' }} size="small" variant="outlined" />}
              </Box>
              <Typography sx={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: '14px', mb: 2.5, lineHeight: 1.5 }}>
                {stripHtml(textItem.message).substring(0, 100)}...
              </Typography>
              <Button fullWidth variant="contained" sx={{ bgcolor: '#3b82f6', fontWeight: 600, letterSpacing: '0.5px' }} onClick={() => startEditing(textItem)}>
                РЕДАГУВАТИ
              </Button>
            </Paper>
          ))}
        </Box>
      ) : (
        // ДЕСКТОПНИЙ ВИГЛЯД
        <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 150px)', overflow: 'auto', borderRadius: 2, border: `1px solid ${borderColor}`, bgcolor: tableHeaderBg }}>
          <Table stickyHeader sx={{ minWidth: 800, tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '15%', bgcolor: tableHeaderBg, color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>ID Кроку</TableCell>
                <TableCell sx={{ width: '55%', bgcolor: tableHeaderBg, color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>Попередній перегляд</TableCell>
                <TableCell align="center" sx={{ width: '15%', bgcolor: tableHeaderBg, color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>Статус</TableCell>
                <TableCell align="center" sx={{ width: '15%', bgcolor: tableHeaderBg, color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600 }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botTexts.map((textItem) => {
                const cleanText = stripHtml(textItem.message);

                return (
                  <TableRow key={textItem.id} sx={{ bgcolor: tableRowBg, '&:hover': { bgcolor: tableRowHoverBg }, transition: 'background-color 0.2s ease', '& td': { borderBottom: `1px solid ${isDarkMode ? '#1e293b' : '#f1f5f9'}` } }}>
                    <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 600, verticalAlign: 'top', pt: 2.5 }}>{textItem.id}</TableCell>
                    <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                      <Box sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: '14px', lineHeight: 1.6 }}>
                        {cleanText}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: 'top', pt: 2.5 }}>
                      {textItem.isModified ? <Chip label="ЗМІНЕНО" sx={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }} size="small" variant="outlined" /> : <Chip label="ОРИГІНАЛ" sx={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }} size="small" variant="outlined" />}
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: 'top', pt: 2 }}>
                      <Button variant="contained" size="small" sx={{ bgcolor: '#3b82f6', color: '#ffffff', fontWeight: 600, letterSpacing: '0.5px', borderRadius: '6px', px: 2, boxShadow: 'none', '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' } }} onClick={() => startEditing(textItem)}>
                        РЕДАГУВАТИ
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
    );
}