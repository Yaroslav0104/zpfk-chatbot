import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, 
  TableCell, TableHead, TableRow, TextField, CircularProgress, 
  Chip, useMediaQuery, useTheme, Divider
} from "@mui/material";

// Підключаємо файл текстів та наш новий CSS
import defaultSteps from './data/steps.js'; 
import './BotSettings.css'; 

const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost/backend" 
  : "/backend";

export default function BotSettings({ isDarkMode, setSnackbar }) {
  const [botTexts, setBotTexts] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  
  const [editPlainText, setEditPlainText] = useState("");
  const [editLinkText, setEditLinkText] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const topRef = useRef(null);

  const themeMode = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    fetchTexts();
  }, []);

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
            isModified: !!dbMatch,
            updated_at: dbMatch ? dbMatch.updated_at : null 
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
        setEditingItem(null); 
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

  const isRecentlyUpdated = (updatedAtStr) => {
    if (!updatedAtStr) return false;
    const updateTime = new Date(updatedAtStr.replace(/-/g, '/')).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - updateTime) <= hours24;
  };

  const renderStatusChip = (textItem) => {
    if (!textItem.isModified) {
      return <Chip label="ОРИГІНАЛ" sx={{ color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }} size="small" variant="outlined" />;
    }
    
    if (isRecentlyUpdated(textItem.updated_at)) {
      return <Chip label="ЩОЙНО ЗМІНЕНО" sx={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }} size="small" variant="outlined" />;
    }

    return <Chip label="КАСТОМНИЙ" sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', borderRadius: 1.5, fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }} size="small" variant="outlined" />;
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#38bdf8" }} /></Box>;
  }

  // Залишаємо мінімальні кольори для інпутів (оскільки Material-UI інпути краще стилізувати через sx)
  const inputBg = isDarkMode ? '#0f172a' : '#f8fafc';
  const inputTextColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <Box className="bot-settings-container">
      <div ref={topRef} style={{ position: 'absolute', top: 0 }} />

      {/* ПАНЕЛЬ РЕДАГУВАННЯ */}
      {editingItem && (
        <Paper elevation={0} className={`editor-panel ${themeMode}`}>
          <Typography variant="subtitle2" className="editor-title">
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
          <Typography variant="body2" className="editor-subtitle">
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
            <Paper key={textItem.id} elevation={0} className={`mobile-step-card ${themeMode}`}>
              <Box className="mobile-card-header">
                <Typography className={`mobile-step-id ${themeMode}`}>{textItem.id}</Typography>
                {renderStatusChip(textItem)}
              </Box>
              <Typography className={`mobile-step-preview ${themeMode}`}>
                {stripHtml(textItem.message).substring(0, 100)}...
              </Typography>
              <Button fullWidth variant="contained" className="btn-edit-step" onClick={() => startEditing(textItem)}>
                РЕДАГУВАТИ
              </Button>
            </Paper>
          ))}
        </Box>
      ) : (
        // ДЕСКТОПНИЙ ВИГЛЯД
        <Box className={`desktop-table-container ${themeMode}`}>
          <Table stickyHeader sx={{ minWidth: 800, tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '15%', color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, bgcolor: isDarkMode ? '#1e293b' : '#f8fafc' }}>ID Кроку</TableCell>
                <TableCell sx={{ width: '55%', color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, bgcolor: isDarkMode ? '#1e293b' : '#f8fafc' }}>Попередній перегляд</TableCell>
                <TableCell align="center" sx={{ width: '15%', color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, bgcolor: isDarkMode ? '#1e293b' : '#f8fafc' }}>Статус</TableCell>
                <TableCell align="center" sx={{ width: '15%', color: '#94a3b8', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, bgcolor: isDarkMode ? '#1e293b' : '#f8fafc' }}>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botTexts.map((textItem) => {
                const cleanText = stripHtml(textItem.message);

                return (
                  <TableRow key={textItem.id} className={`table-row-custom ${themeMode}`}>
                    <TableCell className="table-cell-id" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{textItem.id}</TableCell>
                    <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                      <Box className="table-cell-preview" sx={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                        {cleanText}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: 'top', pt: 2.5 }}>
                      {renderStatusChip(textItem)}
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: 'top', pt: 2 }}>
                      <Button variant="contained" size="small" className="btn-edit-step" onClick={() => startEditing(textItem)}>
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