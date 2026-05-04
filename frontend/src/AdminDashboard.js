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


// === ГРАФІКИ ТА ЕКСПОРТ ===
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Document, Packer, Paragraph, TextRun, Table as WordTable, TableRow as WordRow, TableCell as WordCell, WidthType, AlignmentType, VerticalAlign, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = "http://localhost/backend"; 
const PIE_COLORS = ['#38bdf8', '#fbbf24', '#4ade80', '#f87171', '#c084fc', '#f472b6'];

// 1. ПРОСТИЙ СЛОВНИК СТАТУСІВ (Замість довгих перевірок)
const STATUS_LABELS = {
  new: "Нове",
  in_progress: "В роботі",
  resolved: "Виконано",
  rejected: "Відхилено",
  archived: "Архів",
  spam: "Спам"
};

// 2. ПРОСТА ФУНКЦІЯ ДЛЯ КОЛЬОРІВ СТАТУСУ В ТАБЛИЦІ
const getStatusStyle = (status, isDark) => {
  if (status === 'archived') return { bgcolor: isDark ? 'rgba(156, 163, 175, 0.2)' : '#e2e8f0', color: '#64748b' };
  if (status === 'spam') return { bgcolor: isDark ? 'rgba(248, 113, 113, 0.2)' : '#fee2e2', color: '#f87171' };
  return { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "white" : "#0f172a" };
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
        <Button startIcon={<DashboardIcon />} fullWidth className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>Дашборд</Button>
        <Button startIcon={<ListIcon />} fullWidth className={`nav-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>Активні звернення</Button>
        <Button startIcon={<ArchiveIcon />} fullWidth className={`nav-btn ${view === "archive" ? "active" : ""}`} onClick={() => setView("archive")}>Архів</Button>
        <Button startIcon={<ReportIcon />} fullWidth className={`nav-btn ${view === "spam" ? "active" : ""}`} onClick={() => setView("spam")}>Спам</Button>
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
      if (res.ok) setComplaints((await res.json()).data || []);
    } catch (err) { setSnackbar({ open: true, message: "Помилка завантаження скарг", type: "error" }); } 

    try {
      const visitsRes = await fetch(`${API_URL}/get-visits.php?t=${new Date().getTime()}`);
      if (visitsRes.ok) setDailyVisitors((await visitsRes.json()).today_visits || 0);
    } catch (err) { console.error("Помилка відвідувачів:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

// === ЕКСПОРТ В WORD ===
  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children: [
          new WordTable({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: {style: 'none'}, bottom: {style: 'none'}, left: {style: 'none'}, right: {style: 'none'}, insideHorizontal: {style: 'none'}, insideVertical: {style: 'none'} },
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
                          ...(item.student_group ? [new TextRun({ text: `Група: ${item.student_group}`, size: 20, font: "Arial", color: "666666", break: 1 })] : []),
                          ...(item.contact_type !== 'none' && item.contact_value ? [new TextRun({ text: `${item.contact_type === 'phone' ? 'Тел' : 'Email'}: ${item.contact_value}`, size: 20, font: "Arial", color: "0066cc", break: 1 })] : [])
                        ] 
                      })
                    ] 
                  }),
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
      setSnackbar({ open: true, message: "Звіт Word згенеровано!", type: "success" });
    });
  };

  // === ЕКСПОРТ В EXCEL (БЕЗ ФІЛЬТРІВ - ПОВНА БАЗА) ===
  const exportToExcel = () => {
    // Зверни увагу: тут ми використовуємо complaints (усю базу) замість displayedComplaints
    const dataForExcel = complaints.map(item => ({
      "Відправник": Number(item.is_anonymous) === 1 || !item.full_name ? "Анонімно" : item.full_name,
      "Група": item.student_group || "-",
      "Контакти": item.contact_type !== 'none' && item.contact_value ? `${item.contact_type === 'phone' ? '📞' : '📧'} ${item.contact_value}` : "-",
      "Дата": new Date(item.created_at).toLocaleDateString(),
      "Категорія": item.category || "-",
      "Повідомлення": item.message || "-",
      "Статус": STATUS_LABELS[item.status] || "Нове"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Всі Звернення");
    
    // Робимо колонки красивими і широкими
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 15 }];

    XLSX.writeFile(workbook, `Full_Report_ZPFK_${new Date().toLocaleDateString()}.xlsx`);
    setSnackbar({ open: true, message: "Повний звіт Excel згенеровано!", type: "success" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Назавжди видалити звернення?")) return;
    try {
      await fetch(`${API_URL}/delete-complaint.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setComplaints(prev => prev.filter(c => c.id !== id));
      setSnackbar({ open: true, message: "Видалено успішно", type: "success" });
    } catch { setSnackbar({ open: true, message: "Помилка видалення", type: "error" }); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/update-status.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
      setSnackbar({ open: true, message: "Статус оновлено", type: "success" });
    } catch { setSnackbar({ open: true, message: "Помилка оновлення", type: "error" }); }
  };

  // === ОБРОБКА ДАНИХ (Фільтри, сортування, статистика) ===
  const stats = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam");
    return {
      total: active.length,
      newC: active.filter(c => c.status === "new" || !c.status).length,
      anon: active.filter(c => Number(c.is_anonymous) === 1).length,
      tech: active.filter(c => c.category === "Технічна проблема").length
    };
  }, [complaints]);

  const pieData = useMemo(() => {
    const map = {};
    complaints.filter(c => c.status !== "archived" && c.status !== "spam").forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  }, [complaints]);

  const barData = useMemo(() => {
    const active = complaints.filter(c => c.status !== "archived" && c.status !== "spam");
    return [
      { name: "Нові", кількість: active.filter(c => c.status === "new" || !c.status).length },
      { name: "В роботі", кількість: active.filter(c => c.status === "in_progress").length },
      { name: "Готово", кількість: active.filter(c => c.status === "resolved").length },
      { name: "Відмова", кількість: active.filter(c => c.status === "rejected").length }
    ];
  }, [complaints]);

  const displayedComplaints = useMemo(() => {
    let result = [...complaints];
    
    // Фільтр за розділом адмінки
    if (view === "table") result = result.filter(c => c.status !== "archived" && c.status !== "spam");
    else if (view === "archive") result = result.filter(c => c.status === "archived");
    else if (view === "spam") result = result.filter(c => c.status === "spam");

    // Фільтр швидких кнопок
    if (tableFilter !== "all" && view === "table") {
      if (tableFilter === "new") result = result.filter(c => c.status === 'new' || !c.status);
      else if (tableFilter === "anonymous") result = result.filter(c => Number(c.is_anonymous) === 1);
      else if (tableFilter === "tech") result = result.filter(c => c.category === 'Технічна проблема');
    }

    // Живий пошук
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(c => (c.message?.toLowerCase().includes(q)) || (c.tracking_code?.toLowerCase().includes(q)) || (c.full_name?.toLowerCase().includes(q)));
    }

    // Сортування
    result.sort((a, b) => {
      const timeDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "desc" ? timeDiff : -timeDiff;
    });
    return result;
  }, [complaints, view, tableFilter, search, sortOrder]);

  const customTooltipStyle = { 
    borderRadius: '12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', color: isDarkMode ? '#fff' : '#0f172a', backdropFilter: 'blur(10px)', fontSize: '13px'
  };

  const dropdownMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#0f172a', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderRadius: '8px', mt: 0.5,
        '& .MuiMenuItem-root:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        '& .Mui-selected': { bgcolor: isDarkMode ? 'rgba(56, 189, 248, 0.15) !important' : 'rgba(56, 189, 248, 0.1) !important' }
      }
    }
  };

  const handleViewChange = (newView) => { setView(newView); setIsMobileMenuOpen(false); };

  return (
    <Box className={`dashboard-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <Sidebar view={view} setView={handleViewChange} onLogout={onLogout} onReturnToBot={onReturnToBot} isMobileMenuOpen={isMobileMenuOpen} />
      
      <Box className="main-content">
        <AppBar position="static" className="topbar">
          <Toolbar>
            <IconButton edge="start" onClick={() => setIsMobileMenuOpen(true)} sx={{ mr: 2, display: { md: 'none' }, color: isDarkMode ? '#9ca3af' : '#64748b' }}><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ color: isDarkMode ? "#f3f4f6" : "#0f172a", fontWeight: 700, letterSpacing: '-0.02em', flexGrow: 1 }}>
              {view === "dashboard" ? "Аналітика системи" : view === "archive" ? "Архів звернень" : view === "spam" ? "Спам" : "Активні звернення"}
            </Typography>
            <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? '#fbbf24' : '#64748b' }}>{isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 1, md: 3 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#38bdf8" }} /></Box>
          ) : (
            <>
              {view === "dashboard" && (
                <> 
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={6}><StatCard title="Відвідувачі" value={dailyVisitors} color="#c084fc" icon={<GroupIcon/>} /></Grid>
                    <Grid item xs={6} md={6}><StatCard title="Нові скарги" value={stats.newC} color="#4ade80" icon={<CheckCircleIcon/>} onClick={() => { setView("table"); setTableFilter("new"); }} /></Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={4} md={4}><StatCard title="Активні" value={stats.total} color="#38bdf8" icon={<AssessmentIcon/>} onClick={() => { setView("table"); setTableFilter("all"); }} /></Grid>
                    <Grid item xs={4} md={4}><StatCard title="Анонімні" value={stats.anon} color="#fbbf24" icon={<BugReportIcon/>} onClick={() => { setView("table"); setTableFilter("anonymous"); }} /></Grid>
                    <Grid item xs={4} md={4}><StatCard title="Технічні" value={stats.tech} color="#f87171" icon={<SettingsIcon/>} onClick={() => { setView("table"); setTableFilter("tech"); }} /></Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}> 
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Звернення за категоріями</Typography>
                        <Box className="chart-container" style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={8} cornerRadius={12} dataKey="value" stroke="none">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={customTooltipStyle} />
                              <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper className="glass-panel">
                        <Typography className="panel-title">Статус обробки</Typography>
                        <Box className="chart-container" style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={1}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                              <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0} tickMargin={5} tick={{ fontSize: 12, fill: isDarkMode ? "#9ca3af" : "#64748b" }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
                              <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} contentStyle={customTooltipStyle} />
                              <Bar dataKey="кількість" fill="url(#colorCount)" maxBarSize={50} radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              )}

              {(view === "table" || view === "archive" || view === "spam") && (
                 <>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center" }}>
                    <TextField placeholder="Пошук за кодом..." className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flexGrow: 1, minWidth: '250px' }} />
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                      <Button variant="contained" startIcon={<DescriptionIcon />} onClick={exportToWord} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1, px: 2 }}>Word</Button>
                      <Button variant="contained" startIcon={<TableViewIcon />} onClick={exportToExcel} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1, px: 2 }}>Excel</Button>
                    </Box>
                    <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} size="small" startAdornment={<SortIcon sx={{ ml: 1, mr: 1, color: '#9ca3af' }} />} MenuProps={dropdownMenuProps} sx={{ color: isDarkMode ? "white" : "#0f172a", bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#ffffff", borderRadius: 2, '.MuiOutlinedInput-notchedOutline': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }}>
                      <MenuItem value="desc">Спочатку нові</MenuItem>
                      <MenuItem value="asc">Спочатку старі</MenuItem>
                    </Select>
                    {tableFilter !== "all" && view === "table" && <Button variant="contained" color="error" onClick={() => setTableFilter("all")}>Скинути фільтр</Button>}
                  </Box>

                  <Paper className="glass-panel" sx={{ p: 0, overflow: 'hidden' }}>
                    <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <Table className="custom-table" sx={{ minWidth: 900 }}>
                        <TableHead>
                          <TableRow>
                            {/* 1. ЗМІНИЛИ ЗАГОЛОВОК З "Код" НА "Відправник" */}
                            <TableCell sx={{ color: '#9ca3af', minWidth: '150px' }}>Відправник</TableCell>
                            <TableCell sx={{ color: '#9ca3af', minWidth: '100px' }}>Дата</TableCell>
                            <TableCell sx={{ color: '#9ca3af', minWidth: '150px' }}>Категорія</TableCell>
                            <TableCell sx={{ color: '#9ca3af', minWidth: '250px' }}>Повідомлення</TableCell>
                            <TableCell sx={{ color: '#9ca3af', minWidth: '150px' }}>Статус</TableCell>
                            <TableCell align="center" sx={{ color: '#9ca3af', minWidth: '100px' }}>Дії</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedComplaints.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ color: isDarkMode ? "#9ca3af" : "#64748b", py: 10 }}>Звернень не знайдено</TableCell></TableRow>
                          ) : (
                            // 2. ДОДАЛИ НОВІ ЗМІННІ (full_name, student_group, contact_type, contact_value) В ДЕСТРУКТУРИЗАЦІЮ
                            displayedComplaints.map(({ id, tracking_code, is_anonymous, created_at, category, message, status, photo_path, full_name, student_group, contact_type, contact_value }) => (
                              <TableRow key={id} className="table-row">
                                
                                {/* 3. НОВИЙ БЛОК ВІДПРАВНИКА ЗАМІСТЬ КОДУ */}
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: 'bold', color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: '15px' }}>
                                      {Number(is_anonymous) === 1 || !full_name ? "👻 Анонімно" : full_name}
                                    </span>
                                    
                                    {student_group && (
                                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        Група: {student_group}
                                      </span>
                                    )}
                                    
                                    {contact_type !== 'none' && contact_value && (
                                      <span style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px' }}>
                                        {contact_type === 'phone' ? '📞 ' : '📧 '}
                                        {contact_value}
                                      </span>
                                    )}
                                  </Box>
                                </TableCell>

                                <TableCell sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{new Date(created_at).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 600 }}>{category}</TableCell>
                                <TableCell sx={{ maxWidth: 350, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{message}</TableCell>
                                <TableCell>
                                  <Select
                                    value={status || "new"} 
                                    onChange={(e) => handleStatusChange(id, e.target.value)} 
                                    size="small" MenuProps={dropdownMenuProps}
                                    sx={{ 
                                      minWidth: 130, fontSize: '13px', borderRadius: 2, 
                                      '.MuiOutlinedInput-notchedOutline': { border: 'none' }, 
                                      '& .MuiSvgIcon-root': { color: isDarkMode ? 'white' : '#0f172a' },
                                      ...getStatusStyle(status, isDarkMode) 
                                    }}
                                  >
                                    <MenuItem value="new">Нове</MenuItem>
                                    <MenuItem value="in_progress">В роботі</MenuItem>
                                    <MenuItem value="resolved">Виконано</MenuItem>
                                    <MenuItem value="rejected">Відхилено</MenuItem>
                                    <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                                    <MenuItem value="archived" sx={{ color: '#64748b' }}>📦 В архів</MenuItem>
                                    <MenuItem value="spam" sx={{ color: '#f87171' }}>🚫 У спам</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    {photo_path && (
                                      <IconButton size="small" sx={{ color: '#38bdf8', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }} component="a" href={`${API_URL}/${photo_path}`} target="_blank" rel="noreferrer"><VisibilityIcon /></IconButton>
                                    )}
                                    <IconButton size="small" sx={{ color: '#f87171', '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } }} onClick={() => handleDelete(id)}><DeleteIcon /></IconButton>
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
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type} variant="filled" sx={{ borderRadius: 3 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}