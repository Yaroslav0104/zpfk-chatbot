import React, { useEffect, useState, useMemo } from "react";
import './AdminDashboard.css';
import {
  Box, Typography, Grid, Paper, Button, AppBar, Toolbar, IconButton, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Select, MenuItem, Snackbar, Alert, CircularProgress, TextField, Divider, Card, CardContent
} from "@mui/material";

// === ІКОНКИ ===
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListIcon from "@mui/icons-material/List";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from '@mui/icons-material/Assessment';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';
import ReportIcon from '@mui/icons-material/Report';
import SortIcon from '@mui/icons-material/Sort';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';

// === НОВА БІБЛІОТЕКА ГРАФІКІВ ===
import Chart from "react-apexcharts";
import BotSettings from './BotSettings'; 

// === ЕКСПОРТ ===
import { Document, Packer, Paragraph, TextRun, Table as WordTable, TableRow as WordRow, TableCell as WordCell, WidthType, AlignmentType, VerticalAlign, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = "http://localhost/backend"; 
const PIE_COLORS = ['#38bdf8', '#fbbf24', '#4ade80', '#f87171', '#c084fc', '#f472b6'];

// === СЛОВНИКИ ТА СТИЛІ ===
const STATUS_LABELS = {
  new: "Нове",
  in_progress: "В роботі",
  resolved: "Виконано",
  rejected: "Відхилено",
  archived: "Архів",
  spam: "Спам"
};

const APPEAL_LABELS = {
  complaint: { text: "Скарга", color: "#f87171", icon: "🔴" },
  proposal: { text: "Пропозиція", color: "#4ade80", icon: "🟢" },
  inquiry: { text: "Звернення", color: "#38bdf8", icon: "🔵" }
};

const getStatusStyle = (status, isDark) => {
  if (status === 'archived') return { bgcolor: isDark ? 'rgba(156, 163, 175, 0.2)' : '#e2e8f0', color: '#64748b' };
  if (status === 'spam') return { bgcolor: isDark ? 'rgba(248, 113, 113, 0.2)' : '#fee2e2', color: '#f87171' };
  return { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "white" : "#0f172a" };
};

const TonalityBadge = ({ tonality, isDark }) => {
  const styles = {
    positive: { bg: isDark ? 'rgba(74, 222, 128, 0.15)' : '#dcfce7', color: '#4ade80', text: 'Позитивне', icon: '😊' },
    neutral:  { bg: isDark ? 'rgba(250, 204, 21, 0.15)' : '#fef9c3', color: '#facc15', text: 'Нейтральне', icon: '😐' },
    negative: { bg: isDark ? 'rgba(248, 113, 113, 0.15)' : '#fee2e2', color: '#f87171', text: 'Негативне', icon: '😠' }
  };
  const current = styles[tonality] || styles.neutral;

  return (
    <span className="tonality-badge" style={{ backgroundColor: current.bg, color: current.color }}>
      {current.icon} {current.text}
    </span>
  );
};

const UrgencyBadge = ({ urgency }) => {
  const styles = {
    low: { bg: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', text: 'Низька' },
    medium: { bg: 'rgba(250, 204, 21, 0.15)', color: '#facc15', text: 'Середня' },
    high: { bg: 'rgba(248, 113, 113, 0.25)', color: '#f87171', text: 'Висока', border: '1px solid rgba(248, 113, 113, 0.5)' }
  };
  const current = styles[urgency] || styles.medium;

  return (
    <span className="urgency-badge" style={{ backgroundColor: current.bg, color: current.color, border: current.border || 'none' }}>
      ⚡ {current.text}
    </span>
  );
};

// === КОМПОНЕНТИ ІНТЕРФЕЙСУ ===
function StatCard({ title, value, color, icon, onClick }) {
  return (
    <Card onClick={onClick} className="stat-card" sx={{ borderLeft: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}>
      <CardContent className="stat-card-content">
        <Typography className="stat-card-title">{title}</Typography>
        <Typography variant="h3" className="stat-card-value">{value}</Typography>
      </CardContent>
      {icon && <Box className="stat-card-icon" sx={{ color: color }}>{icon}</Box>}
    </Card>
  );
}

function Sidebar({ view, setView, onLogout, onReturnToBot, isMobileMenuOpen }) {
  return (
    <Box className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      <Box sx={{ padding: '24px 24px 16px 24px' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, mb: 0.5 }}>ZPFK</Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>Адміністративна панель</Typography>
      </Box>
      <Box sx={{ px: 2 }}>
        <Button startIcon={<DashboardIcon />} fullWidth className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>Аналітика системи</Button>
        <Button startIcon={<ListIcon />} fullWidth className={`nav-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>Активні звернення</Button>
        <Button startIcon={<ArchiveIcon />} fullWidth className={`nav-btn ${view === "archive" ? "active" : ""}`} onClick={() => setView("archive")}>Архів звернень</Button>
        <Button startIcon={<ReportIcon />} fullWidth className={`nav-btn ${view === "spam" ? "active" : ""}`} onClick={() => setView("spam")}>Спам</Button>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Button startIcon={<SettingsIcon />} fullWidth className={`nav-btn ${view === "bot_settings" ? "active" : ""}`} onClick={() => setView("bot_settings")}>Налаштування бота</Button>
      </Box>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Button startIcon={<ChatIcon />} fullWidth className="nav-btn" onClick={onReturnToBot} sx={{ mb: 1, color: '#38bdf8 !important' }}>До чат-бота</Button>
        <Button startIcon={<LogoutIcon />} color="error" fullWidth className="nav-btn" onClick={onLogout}>Вийти</Button>
      </Box>
    </Box>
  );
}

export default function AdminDashboard({ onLogout, onReturnToBot }) {
  const [complaints, setComplaints] = useState([]);
  const [view, setView] = useState("dashboard");
  const [tableFilter, setTableFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("appTheme");
    return saved !== null ? saved === "dark" : true; 
  });

  const toggleTheme = () => setIsDarkMode((prev) => {
    const newTheme = !prev;
    localStorage.setItem("appTheme", newTheme ? "dark" : "light");
    return newTheme;
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/get-complaints.php`);
      if (res.ok) {
        const jsonData = await res.json();
        setComplaints(Array.isArray(jsonData) ? jsonData : []);
      }
    } catch (err) { setSnackbar({ open: true, message: "Помилка завантаження скарг", type: "error" }); } 

    try {
      const visitsRes = await fetch(`${API_URL}/get-visits.php?t=${new Date().getTime()}`);
      if (visitsRes.ok) setDailyVisitors((await visitsRes.json()).today_visits || 0);
    } catch (err) { console.error("Помилка відвідувачів:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Фільтрація даних для відображення в таблиці та експорту
  const displayedComplaints = useMemo(() => {
    let result = [...complaints];
    
    // ФІЛЬТРАЦІЯ СПАМУ ДЛЯ РІЗНИХ ВКЛАДОК
    if (view === "table") {
        result = result.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    } else if (view === "archive") {
        result = result.filter(c => c.status === "archived" && Number(c.is_spam) !== 1);
    } else if (view === "spam") {
        result = result.filter(c => c.status === "spam" || Number(c.is_spam) === 1);
    }

    if (tableFilter !== "all" && view === "table") {
      if (tableFilter === "new") result = result.filter(c => c.status === 'new' || !c.status);
      else if (tableFilter === "anonymous") result = result.filter(c => Number(c.is_anonymous) === 1);
      else if (tableFilter === "tech") result = result.filter(c => c.category === 'Технічна проблема');
    }

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(c => (c.message?.toLowerCase().includes(q)) || (c.tracking_code?.toLowerCase().includes(q)) || (c.full_name?.toLowerCase().includes(q)));
    }
    result.sort((a, b) => {
      const timeDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "desc" ? timeDiff : -timeDiff;
    });
    return result;
  }, [complaints, view, tableFilter, search, sortOrder]);


  // === ВІДНОВЛЕНИЙ ЕКСПОРТ (Word / Excel) ===
  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children: [
          new WordTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new WordRow({
                children: [
                  new WordCell({ shading: { fill: "E8F5E9" }, verticalAlign: VerticalAlign.CENTER, margins: { top: 600, bottom: 600, left: 400, right: 400 }, children: [new Paragraph({ children: [new TextRun({ text: "ZPFK", bold: true, size: 56, font: "Arial" })] })] }),
                  new WordCell({ shading: { fill: "E8F5E9" }, verticalAlign: VerticalAlign.CENTER, margins: { top: 600, bottom: 600, left: 400, right: 400 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Звягельський політехнічний фаховий коледж", bold: true, size: 28, font: "Arial" }), new TextRun({ text: "м.Звягель, вул. Шевченка, 38", size: 24, font: "Arial", break: 1 })] })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "ЗВІТ ПО ЗВЕРНЕННЯХ СТУДЕНТІВ", bold: true, size: 32, font: "Arial" }), new TextRun({ text: `\nДата формування: ${new Date().toLocaleDateString()}`, size: 22, font: "Arial" })], spacing: { after: 400 } }),
          new WordTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
            rows: [
              new WordRow({
                children: [
                  new WordCell({ shading: { fill: "F3F4F6" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Відправник", bold: true, size: 24, font: "Arial" })] })] }),
                  new WordCell({ shading: { fill: "F3F4F6" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Тип", bold: true, size: 24, font: "Arial" })] })] }),
                  new WordCell({ shading: { fill: "F3F4F6" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Категорія", bold: true, size: 24, font: "Arial" })] })] }),
                  new WordCell({ shading: { fill: "F3F4F6" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Повідомлення", bold: true, size: 24, font: "Arial" })] })] }),
                  new WordCell({ shading: { fill: "F3F4F6" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Статус", bold: true, size: 24, font: "Arial" })] })] }),
                ],
              }),
              ...displayedComplaints.map(item => new WordRow({
                children: [
                  new WordCell({ 
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }, 
                    children: [
                      new Paragraph({ 
                        children: [
                          new TextRun({ text: Number(item.is_anonymous) === 1 || !item.full_name ? "Анонімно" : item.full_name, bold: true, size: 22, font: "Arial" }),
                          ...(item.student_group ? [new TextRun({ text: `\nГрупа: ${item.student_group}`, size: 18, font: "Arial", color: "666666", break: 1 })] : []),
                          ...(item.contact_type !== 'none' && item.contact_value ? [
                            new TextRun({ text: `\n${item.contact_type === 'phone' ? 'Тел' : 'Email'}: ${item.contact_value}`, size: 18, font: "Arial", color: "0066cc", bold: true, break: 1 })
                          ] : [])
                        ] 
                      })
                    ] 
                  }),
                  new WordCell({ margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: APPEAL_LABELS[item.appeal_type]?.text || "Скарга", size: 22, font: "Arial" })] })] }),
                  new WordCell({ margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: item.category || "-", size: 22, font: "Arial" })] })] }),
                  new WordCell({ margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: item.message || "-", size: 22, font: "Arial" })] })] }),
                  new WordCell({ margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: STATUS_LABELS[item.status] || "Нове", size: 22, font: "Arial" })] })] }),
                ],
              })),
            ],
          }),
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Report_ZPFK_${new Date().toLocaleDateString()}.docx`);
    });
  };

  const exportToExcel = () => {
    const excelData = [
      ["ЗВЯГЕЛЬСЬКИЙ ПОЛІТЕХНІЧНИЙ ФАХОВИЙ КОЛЕДЖ (ZPFK)"], 
      ["ЗВІТ ПО ЗВЕРНЕННЯХ СТУДЕНТІВ"],                      
      [`Дата формування: ${new Date().toLocaleDateString()}`], 
      [],                                                      
      ["Відправник", "Група", "Контактні дані", "Тип", "Категорія", "Терміновість", "Повідомлення", "Статус"]
    ];

    displayedComplaints.forEach(item => {
      excelData.push([
        Number(item.is_anonymous) === 1 || !item.full_name ? "Анонімно" : item.full_name,
        item.student_group || "-",
        item.contact_type !== 'none' && item.contact_value ? `${item.contact_type === 'phone' ? 'Тел: ' : 'Email: '}${item.contact_value}` : "Не вказано",
        APPEAL_LABELS[item.appeal_type]?.text || "Скарга",
        item.category || "-",
        item.urgency === 'high' ? "Висока" : item.urgency === 'low' ? "Низька" : "Середня",
        item.message || "-",
        STATUS_LABELS[item.status] || "Нове"
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, 
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, 
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }  
    ];

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 10 }, { wch: 22 }, { wch: 15 }, 
      { wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 15 }  
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Звіти ZPFK");
    
    XLSX.writeFile(workbook, `Report_ZPFK_${new Date().toLocaleDateString()}.xlsx`);
    setSnackbar({ open: true, message: "Звіт Excel згенеровано!", type: "success" });
  };

  // Розділяємо функції, щоб оновлювати їх з різною частотою
  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/get-complaints.php`);
      if (res.ok) {
        const jsonData = await res.json();
        setComplaints(Array.isArray(jsonData) ? jsonData : []);
      }
    } catch (err) { console.error("Помилка оновлення скарг:", err); }
  };

  const fetchVisits = async () => {
    try {
      const visitsRes = await fetch(`${API_URL}/get-visits.php?t=${new Date().getTime()}`);
      if (visitsRes.ok) setDailyVisitors((await visitsRes.json()).today_visits || 0);
    } catch (err) { console.error("Помилка відвідувачів:", err); }
  };

  useEffect(() => {
    // 1. Перше завантаження при відкритті дашборду
    const loadInitialData = async () => {
      setLoading(true);
      await fetchComplaints();
      await fetchVisits();
      setLoading(false);
    };
    loadInitialData();

    // 2. АВТОМАТИЧНЕ ОНОВЛЕННЯ В РЕАЛЬНОМУ ЧАСІ
    const visitsTimer = setInterval(fetchVisits, 5000); // Оновлюємо відвідувачів кожні 5 секунд
    const complaintsTimer = setInterval(fetchComplaints, 15000); // Перевіряємо нові скарги кожні 15 секунд

    // 3. Зупиняємо таймери, якщо адмін закрив дашборд
    return () => {
      clearInterval(visitsTimer);
      clearInterval(complaintsTimer);
    };
  }, []);
  
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/update-status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
          // РОЗУМНЕ ОНОВЛЕННЯ СТЕЙТУ У REACT
          setComplaints(prev => prev.map(c => {
            if (c.id === id) {
              if (newStatus === 'spam') {
                return { ...c, status: newStatus, is_spam: 1 }; // Примусово вішаємо мітку спаму
              } else {
                return { ...c, status: newStatus, is_spam: 0 }; // Знімаємо мітку спаму
              }
            }
            return c;
          }));
          
          setSnackbar({ open: true, message: "Статус успішно оновлено", type: "success" });
      } else {
          throw new Error(data.error || "Невідома помилка оновлення статусу");
      }
    } catch (error) { 
      console.error("Помилка зміни статусу:", error);
      setSnackbar({ open: true, message: "Помилка оновлення статусу", type: "error" }); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Назавжди видалити звернення?")) return;

    try {
      const response = await fetch(`${API_URL}/delete-complaint.php`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id }) 
      });

      if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
          setComplaints(prev => prev.filter(c => c.id !== id));
          setSnackbar({ open: true, message: "Видалено успішно", type: "success" });
      } else {
          throw new Error(data.error || "Невідома помилка");
      }
    } catch (error) { 
      console.error("Деталі помилки видалення:", error);
      setSnackbar({ open: true, message: "Помилка видалення. Див. консоль (F12)", type: "error" }); 
    }
  };

  const handleCorrectAI = async (id, message, correctSentimentWord) => {
    const mapToNum = { "positive": 0, "neutral": 1, "negative": 2 };
    const correct_label = mapToNum[correctSentimentWord];

    try {
      const response = await fetch(`${API_URL}/save-correction.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ТЕПЕР МИ ПЕРЕДАЄМО ЩЕ Й ID ТА СЛОВО ТОНАЛЬНОСТІ (positive/neutral/negative)
        body: JSON.stringify({ id: id, text: message, correct_label: correct_label, sentiment: correctSentimentWord })
      });

      if (!response.ok) throw new Error("Помилка сервера: " + response.status);
      const data = await response.json();

      if (data.success) {
        // МАГІЯ ТУТ: Миттєво оновлюємо бейджик у таблиці!
        setComplaints(prev => prev.map(c => 
          c.id === id ? { ...c, sentiment: correctSentimentWord } : c
        ));
        
        setSnackbar({ open: true, message: "🤖 Дякуємо! Тональність оновлено, ШІ запам'ятав фразу.", type: "success" });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("❌ ПОМИЛКА під час відправки:", error);
      setSnackbar({ open: true, message: "Помилка збереження виправлення", type: "error" });
    }
  };

  // === ОБРОБКА ДАНИХ ДЛЯ АНАЛІТИКИ ===
  const stats = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    return {
      total: active.length,
      newC: active.filter(c => c.status === "new" || !c.status).length,
      anon: active.filter(c => Number(c.is_anonymous) === 1).length,
      tech: active.filter(c => c.category === "Технічна проблема").length
    };
  }, [complaints]);

  const appealTypeData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    const map = { complaint: 0, proposal: 0, inquiry: 0 };
    active.forEach(c => { if (map.hasOwnProperty(c.appeal_type)) map[c.appeal_type]++; });
    return {
      series: [map.complaint, map.proposal, map.inquiry],
      labels: ["Скарги", "Пропозиції", "Звернення"]
    };
  }, [complaints]);

  const categoryData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    const map = {};
    active.forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
    const keys = Object.keys(map);
    return { series: keys.map(k => map[k]), labels: keys };
  }, [complaints]);

  const sentimentData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    let pos = 0, neu = 0, neg = 0;
    active.forEach(c => {
      if (c.sentiment === 'positive') pos++;
      else if (c.sentiment === 'negative') neg++;
      else neu++; 
    });

    const rawData = [
      { label: "Позитивні", value: pos, color: '#4ade80' },
      { label: "Нейтральні", value: neu, color: '#facc15' },
      { label: "Негативні", value: neg, color: '#f87171' }
    ].filter(item => item.value > 0);

    return { 
      series: rawData.map(item => item.value), 
      labels: rawData.map(item => item.label), 
      colors: rawData.map(item => item.color) 
    };
  }, [complaints]);

  // НОВІ ДАНІ: Графік терміновості
  const urgencyData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    const map = { low: 0, medium: 0, high: 0 };
    active.forEach(c => { 
      const u = c.urgency || 'medium';
      if (map.hasOwnProperty(u)) map[u]++; 
    });
    
    const rawData = [
      { label: "Висока", value: map.high, color: '#f87171' },
      { label: "Середня", value: map.medium, color: '#facc15' },
      { label: "Низька", value: map.low, color: '#4ade80' }
    ].filter(item => item.value > 0);

    return {
      series: rawData.map(item => item.value),
      labels: rawData.map(item => item.label),
      colors: rawData.map(item => item.color)
    };
  }, [complaints]);

  const barData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam" && Number(c.is_spam) !== 1);
    const data = [
      { name: "Нові", value: active.filter(c => c.status === "new" || !c.status).length },
      { name: "В роботі", value: active.filter(c => c.status === "in_progress").length },
      { name: "Готово", value: active.filter(c => c.status === "resolved").length },
      { name: "Відмова", value: active.filter(c => c.status === "rejected").length }
    ];
    return { series: [{ name: 'Кількість', data: data.map(d => d.value) }], categories: data.map(d => d.name) };
  }, [complaints]);

  // === КОНФІГУРАЦІЯ APEXCHARTS ===
  const chartThemeColor = isDarkMode ? '#e2e8f0' : '#0f172a';
  const defaultPieOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { position: 'bottom', fontSize: '12px', labels: { colors: chartThemeColor } },
    plotOptions: { 
      pie: { donut: { size: '70%', labels: { show: true, name: { show: false }, value: { show: true, fontSize: '22px', fontWeight: 700, color: chartThemeColor, offsetY: 8, formatter: (val) => val }, total: { show: true, label: 'Всього', color: chartThemeColor, fontSize: '14px', formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } 
    }
  };

  const apexAppealOptions = { ...defaultPieOptions, labels: appealTypeData.labels, colors: ['#f87171', '#4ade80', '#38bdf8'] };
  const apexCategoryOptions = { ...defaultPieOptions, labels: categoryData.labels, colors: PIE_COLORS, tooltip: { y: { formatter: (val) => `${val} звернень` } } };
  const apexSentimentOptions = { ...defaultPieOptions, labels: sentimentData.labels, colors: sentimentData.colors };
  // НОВІ ОПЦІЇ ДЛЯ ТЕРМІНОВОСТІ
  const apexUrgencyOptions = { ...defaultPieOptions, labels: urgencyData.labels, colors: urgencyData.colors };

  const apexBarOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    xaxis: { categories: barData.categories, labels: { style: { colors: chartThemeColor } } },
    yaxis: { labels: { style: { colors: chartThemeColor } } },
    colors: ['#38bdf8'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }
  };

  const dropdownMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#0f172a',
        '& .MuiMenuItem-root:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
      }
    }
  };

  return (
    <Box className={`dashboard-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <Sidebar view={view} setView={(v) => { setView(v); setIsMobileMenuOpen(false); }} onLogout={onLogout} onReturnToBot={onReturnToBot} isMobileMenuOpen={isMobileMenuOpen} />
      
      <Box className="main-content">
        <AppBar 
          elevation={0} 
          className="topbar" 
          sx={{ 
            position: { xs: 'fixed', md: 'sticky' },
            width: { xs: '100%', md: 'auto' },
            top: 0, 
            zIndex: 1030, 
            pt: { xs: 'env(safe-area-inset-top)', md: 0 },
            background: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setIsMobileMenuOpen(true)} sx={{ mr: 2, display: { md: 'none' }, color: isDarkMode ? '#9ca3af' : '#64748b' }}><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ color: isDarkMode ? "#f3f4f6" : "#0f172a", fontWeight: 700, flexGrow: 1 }}>
              {view === "dashboard" ? "Аналітика системи" : 
               view === "archive" ? "Архів звернень" : 
               view === "spam" ? "Спам" : 
               view === "bot_settings" ? "Налаштування бота" : "Активні звернення"}
            </Typography>
            <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? '#fbbf24' : '#64748b' }}>{isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 1, md: 3 }, mt: { xs: 'calc(64px + env(safe-area-inset-top))', md: 0 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#38bdf8" }} /></Box>
          ) : (
            <>
              {view === "dashboard" && (
                <> 
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6} md><StatCard title="Відвідувачі" value={dailyVisitors} color="#c084fc" icon={<GroupIcon/>} /></Grid>
                    <Grid item xs={6} md><StatCard title="Нові скарги" value={stats.newC} color="#4ade80" icon={<CheckCircleIcon/>} onClick={() => { setView("table"); setTableFilter("new"); }} /></Grid>
                    <Grid item xs={6} md><StatCard title="Активні" value={stats.total} color="#38bdf8" icon={<AssessmentIcon/>} onClick={() => { setView("table"); setTableFilter("all"); }} /></Grid>
                    <Grid item xs={6} md><StatCard title="Анонімні" value={stats.anon} color="#fbbf24" icon={<BugReportIcon/>} onClick={() => { setView("table"); setTableFilter("anonymous"); }} /></Grid>
                    <Grid item xs={6} md><StatCard title="Технічні" value={stats.tech} color="#f87171" icon={<SettingsIcon/>} onClick={() => { setView("table"); setTableFilter("tech"); }} /></Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={4}> 
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Типи звернень</Typography>
                        <Box sx={{ height: 320, mt: 2 }}><Chart options={apexAppealOptions} series={appealTypeData.series} type="donut" height="100%" /></Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}> 
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Категорії звернень</Typography>
                        <Box sx={{ height: 320, mt: 2 }}>
                            {categoryData.series.length > 0 ? <Chart options={apexCategoryOptions} series={categoryData.series} type="donut" height="100%" /> : <Typography sx={{ textAlign: 'center', color: '#9ca3af', mt: 10 }}>Немає даних</Typography>}
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}> 
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Тональність</Typography>
                        <Box sx={{ height: 320, mt: 2 }}>
                            {sentimentData.series.length > 0 ? <Chart options={apexSentimentOptions} series={sentimentData.series} type="donut" height="100%" /> : <Typography sx={{ textAlign: 'center', color: '#9ca3af', mt: 10 }}>Немає даних</Typography>}
                        </Box>
                      </Paper>
                    </Grid>
                    
                    {/* НОВИЙ ГРАФІК ТЕРМІНОВОСТІ */}
                    <Grid item xs={12} md={6} lg={4}> 
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Терміновість</Typography>
                        <Box sx={{ height: 320, mt: 2 }}>
                            {urgencyData.series.length > 0 ? <Chart options={apexUrgencyOptions} series={urgencyData.series} type="donut" height="100%" /> : <Typography sx={{ textAlign: 'center', color: '#9ca3af', mt: 10 }}>Немає даних</Typography>}
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={12} lg={8}>
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Статус обробки</Typography>
                        <Box sx={{ height: 320, mt: 2 }}><Chart options={apexBarOptions} series={barData.series} type="bar" height="100%" /></Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              )}

              {view === "bot_settings" && (
                <BotSettings isDarkMode={isDarkMode} setSnackbar={setSnackbar} />
              )}

              {(view === "table" || view === "archive" || view === "spam") && (
                 <>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center" }}>
                    <TextField placeholder="Пошук за текстом..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flexGrow: 1, minWidth: '250px' }} />
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                      <Button variant="contained" startIcon={<DescriptionIcon />} onClick={exportToWord} sx={{ bgcolor: '#3b82f6' }}>Word</Button>
                      <Button variant="contained" startIcon={<TableViewIcon />} onClick={exportToExcel} sx={{ bgcolor: '#10b981' }}>Excel</Button>
                    </Box>
                    <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} size="small" startAdornment={<SortIcon sx={{ mx: 1, color: '#9ca3af' }} />} MenuProps={dropdownMenuProps} sx={{ color: isDarkMode ? "white" : "#0f172a", bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 2 }}>
                      <MenuItem value="desc">Спочатку нові</MenuItem>
                      <MenuItem value="asc">Спочатку старі</MenuItem>
                    </Select>
                  </Box>

                  <Paper className="glass-panel" sx={{ p: 0, overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
                    <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'block' }}>
                       <Table className="custom-table" sx={{ minWidth: 900 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#9ca3af' }}>Відправник</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>Дата</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>Тип, Категорія та Терміновість</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>Повідомлення</TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>Статус</TableCell>
                            <TableCell align="center" sx={{ color: '#9ca3af' }}>Дії</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedComplaints.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ color: "#9ca3af", py: 10 }}>Звернень не знайдено</TableCell></TableRow>
                          ) : (
                            displayedComplaints.map((item) => (
                              <TableRow key={item.id} className="table-row">
                                <TableCell data-label="Відправник">
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className="table-user-name">
                                      {Number(item.is_anonymous) === 1 || !item.full_name ? "👻 Анонімно" : item.full_name}
                                    </span>
                                    {item.student_group && <span className="table-user-group">Група: {item.student_group}</span>}
                                    {item.contact_type !== 'none' && item.contact_value && (
                                      <span className="table-user-contact">
                                        {item.contact_type === 'phone' ? '📞 ' : '📧 '} {item.contact_value}
                                      </span>
                                    )}
                                  </Box>
                                </TableCell>
                                
                                <TableCell data-label="Дата" sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                  {new Date(item.created_at).toLocaleDateString()}
                                </TableCell>
                                
                                <TableCell data-label="Інфо">
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span className="table-appeal-type" style={{ color: APPEAL_LABELS[item.appeal_type]?.color || '#f87171' }}>
                                      {APPEAL_LABELS[item.appeal_type]?.icon} {APPEAL_LABELS[item.appeal_type]?.text}
                                    </span>
                                    <span className="table-category-text">{item.category}</span>
                                    
                                    <UrgencyBadge urgency={item.urgency} />
                                  </Box>
                                </TableCell>
                                
                                <TableCell data-label="Повідомлення" sx={{ maxWidth: 350, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                  <Box sx={{ mb: 1 }}>{item.message}</Box>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <TonalityBadge tonality={item.sentiment} isDark={isDarkMode} />
                                    <Select
                                      size="small"
                                      displayEmpty
                                      defaultValue="" 
                                      onChange={(e) => {
                                        if(e.target.value) handleCorrectAI(item.id, item.message, e.target.value);
                                      }}
                                      sx={{ 
                                        height: 28, fontSize: '12px', ml: 1,
                                        color: '#94a3b8', 
                                        bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc"
                                      }}
                                    >
                                      <MenuItem value="" disabled>Виправити</MenuItem>
                                      <MenuItem value="positive">Вказати як Позитив</MenuItem>
                                      <MenuItem value="neutral">Вказати як Нейтраль</MenuItem>
                                      <MenuItem value="negative">Вказати як Негатив</MenuItem>
                                    </Select>
                                  </Box>
                                </TableCell>
                                
                                <TableCell data-label="Статус">
                                  <Select 
                                    value={item.status || "new"} 
                                    onChange={(e) => handleStatusChange(item.id, e.target.value)} 
                                    size="small" 
                                    MenuProps={dropdownMenuProps} 
                                    sx={{ minWidth: 130, borderRadius: 2, ...getStatusStyle(item.status, isDarkMode) }}
                                  >
                                    <MenuItem value="new">Нове</MenuItem>
                                    <MenuItem value="in_progress">В роботі</MenuItem>
                                    <MenuItem value="resolved">Виконано</MenuItem>
                                    <MenuItem value="rejected">Відхилено</MenuItem>
                                    <MenuItem value="archived" sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', mt: 1, pt: 1 }}>
                                      📦 В архів
                                    </MenuItem>
                                    <MenuItem value="spam">🚫 У спам</MenuItem>
                                  </Select>
                                </TableCell>
                                
                                <TableCell data-label="Дії" align="center">
                                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {item.photo_path && <IconButton size="small" color="primary" href={`${API_URL}/${item.photo_path}`} target="_blank"><VisibilityIcon /></IconButton>}
                                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                 </>
              )}
            </>
          )}
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.type} variant="filled">{snackbar.message}</Alert></Snackbar>
    </Box>
  );
}