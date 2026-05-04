import React, { useState, useRef, useEffect } from "react";
import "./App.css"; 
import steps from "./data/steps";
import ChatBox from "./components/ChatBox/ChatBox";
import ButtonGroup from "./components/ButtonGroup/ButtonGroup";
import AdminDashboard from "./AdminDashboard";
import { Drawer, Button, Typography, Box, Divider, IconButton } from '@mui/material';

// === ІКОНКИ ===
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 

function App() {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState("start");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("appTheme");
    return saved !== null ? saved === "dark" : true; 
  });

  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("isAdmin") === "true"); 
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); 

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [complaintData, setComplaintData] = useState({
    full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", 
    message: "", is_anonymous: 0, contact_type: "none", contact_value: "", photo: null
  });

  const chatEndRef = useRef(null);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isTyping]);
  
  // useEffect(() => {
  //   fetch('http://localhost/backend/track_visit.php')
  //     .then(res => res.json())
  //     .then(data => console.log("Відвідувача зараховано успішно:", data))
  //     .catch(err => console.error('Помилка лічильника:', err));
  // }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("appTheme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const handleLogin = () => {
    if (loginUsername === "admin" && loginPassword === "admin") {
      setIsAdmin(true);
      sessionStorage.setItem("isAdmin", "true"); 
      setShowAdminDashboard(true);
      setLoginUsername(""); setLoginPassword(""); setIsSidebarOpen(false); 
      setIsMobileMenuOpen(false);
    } else { alert("Невірний логін або пароль"); }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("isAdmin"); 
    setShowAdminDashboard(false);
    setIsMobileMenuOpen(false);
  };

  // === ОПТИМІЗАЦІЯ: Єдиний обробник для всіх текстових полів форми ===
  const handleChange = (field, value) => {
    setComplaintData(prev => {
      const newData = { ...prev, [field]: value };
      // Логіка: якщо ввели ПІБ, автоматично знімаємо галочку "Анонімно"
      if (field === 'full_name') {
        newData.is_anonymous = value.length > 0 ? 0 : 1;
      }
      // Логіка: якщо змінили тип контакту на "Без контакту", очищаємо значення
      if (field === 'contact_type' && value === 'none') {
        newData.contact_value = "";
      }
      return newData;
    });
  };

  const handleComplaintSubmit = async () => {
    if (!complaintData.message.trim()) return alert("Будь ласка, опишіть проблему.");
    setIsSending(true);
    const formData = new FormData();
    Object.keys(complaintData).forEach(key => formData.append(key, complaintData[key]));
    
    try {
      const response = await fetch('http://localhost/backend/create-complaint.php', { method: 'POST', body: formData });
      const result = await response.json();
      
      if (result.success) {
        alert(`Звернення ${result.tracking_code} відправлено!`);
        setShowComplaintForm(false);
        setComplaintData({ full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", message: "", is_anonymous: 0, contact_type: "none", contact_value: "", photo: null }); 
      } else {
        // ДОДАНО ОБРОБКУ ПОМИЛОК ВІД PHP:
        alert(`Помилка бази даних: ${result.message}\nДеталі: ${result.error || ''}`);
        console.error("Детальна відповідь сервера:", result);
      }
      
    } catch (error) { 
      alert('Помилка з\'єднання з сервером.'); 
      console.error("Помилка fetch:", error);
    } finally { 
      setIsSending(false); 
    }
  };

  const handleClick = (label, next) => {
    if (next === "open_complaint_form") { setShowComplaintForm(true); return; }
    if (!steps[next]) return;
    setMessages((prev) => [...prev, { sender: "user", text: label }]);
    setCurrentStep(""); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: steps[next].message }]);
      setCurrentStep(next);
    }, 600);
  };

  if (isAdmin && showAdminDashboard) {
    return <AdminDashboard onLogout={handleLogout} onReturnToBot={() => setShowAdminDashboard(false)} />;
  }

  return (
    <div className={`bot-layout ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <div className={`bot-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Typography variant="h5" sx={{ fontWeight: 800 }}>ZPFK</Typography>
          <Typography variant="caption" className="brand-sub">Помічник студента</Typography>
        </div>
        <Box sx={{ mt: "auto", p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isAdmin ? (
            <>
              <Button className="btn-dashboard-sidebar" startIcon={<SettingsIcon />} fullWidth onClick={() => setShowAdminDashboard(true)}>ДАШБОРД</Button>
              <Button className="btn-logout-sidebar" startIcon={<LogoutIcon />} fullWidth onClick={handleLogout}>ВИХІД</Button>
            </>
          ) : (
            <Button className="btn-login-sidebar" startIcon={<LoginIcon />} fullWidth onClick={() => { setIsSidebarOpen(true); setIsMobileMenuOpen(false); }}>ВХІД В АКАУНТ</Button>
          )}
        </Box>
      </div>

      <div className="bot-content">
        <div className="bot-header-simple">
          <IconButton className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} sx={{ display: { md: 'none' }, color: isDarkMode ? '#f3f4f6' : '#0f172a', mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <span className="header-title">Твій бот-консультант</span>
          <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? '#fbbf24' : '#64748b', ml: 'auto' }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </div>

        <div className="bot-chat-area">
          <ChatBox messages={messages} chatEndRef={chatEndRef} startMessage={steps.start.message} />
          {isTyping && <div className="typing-msg">Бот пише...</div>}
        </div>
        <div className="bot-controls">
          <Box sx={{ px: 2, pb: 2 }}> 
            <ButtonGroup options={steps[currentStep]?.options || []} handleClick={handleClick} />
          </Box>
        </div>
      </div>

      <Drawer anchor="right" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} PaperProps={{ className: "login-drawer" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Вхід для адміністратора</Typography>
        <input type="text" placeholder="Логін" className="bot-input-field" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" className="bot-input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
        <Button variant="contained" fullWidth className="btn-login-submit" onClick={handleLogin}>УВІЙТИ</Button>
      </Drawer>

      {showComplaintForm && (
        <div className="bot-modal-overlay">
          <div className="bot-modal-content" style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <IconButton onClick={() => setShowComplaintForm(false)} sx={{ position: 'absolute', top: 12, right: 12, color: isDarkMode ? '#9ca3af' : '#64748b' }}>
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, textAlign: 'center' }} className="modal-header-title">Нове звернення</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
              
              <input type="text" placeholder="ПІБ (за бажанням)" className="bot-glass-input" value={complaintData.full_name} onChange={e => handleChange('full_name', e.target.value)} />
              <input type="text" placeholder="Група (напр. КН-21)" className="bot-glass-input" value={complaintData.student_group} onChange={e => handleChange('student_group', e.target.value)} />
              <Divider className="modal-divider" sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <div className="bot-modal-field">
                <label>Тип звернення:</label>
                <select className="bot-glass-input" value={complaintData.appeal_type} onChange={e => handleChange('appeal_type', e.target.value)}>
                  <option value="complaint">🔴 Скарга</option>
                  <option value="proposal">🟢 Пропозиція</option>
                  <option value="inquiry">🔵 Звичайне звернення</option>
                </select>
              </div>
              
              <div className="bot-modal-field">
                <label>Категорія:</label>
                <select className="bot-glass-input" value={complaintData.category} onChange={e => handleChange('category', e.target.value)}>
                  <option value="Навчальний процес">Навчальний процес</option>
                  <option value="Гуртожиток">Гуртожиток</option>
                  <option value="Технічна проблема">Технічна проблема</option>
                  <option value="Інше">Інше</option>
                </select>
              </div>
              
              <div className="bot-modal-field">
                <label>Зв'язок:</label>
                <select className="bot-glass-input" value={complaintData.contact_type} onChange={e => handleChange('contact_type', e.target.value)}>
                  <option value="none">Без контакту</option>
                  <option value="phone">📞 Телефон</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>
              
              {complaintData.contact_type !== "none" && (
                <input type="text" placeholder="Контактні дані..." className="bot-glass-input" value={complaintData.contact_value} onChange={e => handleChange('contact_value', e.target.value)} />
              )}
              
              <textarea placeholder="Опишіть ситуацію..." className="bot-glass-input" style={{ minHeight: '120px' }} value={complaintData.message} onChange={e => handleChange('message', e.target.value)} />
              
              <div className="bot-modal-field">
                <label>Додати файл:</label>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} className="upload-btn" sx={{ width: '100%', borderRadius: '12px', py: 1.5, color: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {complaintData.photo ? complaintData.photo.name : "Завантажити фото"}
                  <input type="file" accept="image/*" hidden onChange={(e) => handleChange('photo', e.target.files[0])} />
                </Button>
              </div>
              
              <label className="bot-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={Number(complaintData.is_anonymous) === 1} onChange={e => handleChange('is_anonymous', e.target.checked ? 1 : 0)} /> 
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>Надіслати анонімно</span>
              </label>
              
              <div className="bot-modal-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleComplaintSubmit} className="bot-btn-success" style={{ flex: 1 }} disabled={isSending}>{isSending ? "Надсилаємо..." : "НАДІСЛАТИ"}</button>
                <button onClick={() => setShowComplaintForm(false)} className="bot-btn-danger" style={{ flex: 1 }}>СКАСУВАТИ</button>
              </div>
            </Box>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;