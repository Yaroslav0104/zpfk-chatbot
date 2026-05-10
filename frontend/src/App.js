import React, { useState, useRef, useEffect } from "react";
import "./App.css"; 
// Імпортуємо як staticSteps, щоб не було конфлікту назв
import staticSteps from "./data/steps";
import ChatBox from "./components/ChatBox/ChatBox";
import ButtonGroup from "./components/ButtonGroup/ButtonGroup";
import AdminDashboard from "./AdminDashboard";
import { Drawer, Button, Typography, Box, Divider, IconButton, CircularProgress } from '@mui/material';

// === ІКОНКИ ===
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

const API_URL = "http://localhost/backend";

function App() {
  const [messages, setMessages] = useState([]);
  // Стан для кроків бота (спочатку завантажуємо статичні)
  const [botSteps, setBotSteps] = useState(staticSteps);
  const [currentStep, setCurrentStep] = useState("start");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [loadingSteps, setLoadingSteps] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("appTheme");
    return saved !== null ? saved === "dark" : true; 
  });

  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("isAdmin") === "true"); 
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem("userRole") || null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); 

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showPersonalFields, setShowPersonalFields] = useState(false);

  const [complaintData, setComplaintData] = useState({
    full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", 
    message: "", is_anonymous: 1, contact_type: "none", contact_value: ""
  });

  const chatEndRef = useRef(null);

  // === ЛОГІКА ЗАВАНТАЖЕННЯ ТЕКСТІВ З БД ===
  useEffect(() => {
    const fetchDynamicSteps = async () => {
      try {
        const res = await fetch(`${API_URL}/get-steps.php`);
        const dbTexts = await res.json();

        if (Array.isArray(dbTexts)) {
          setBotSteps(prevSteps => {
            const newSteps = { ...prevSteps };
            dbTexts.forEach(item => {
              if (newSteps[item.id]) {
                newSteps[item.id] = { ...newSteps[item.id], message: item.message };
              }
            });
            return newSteps;
          });
        }
      } catch (err) {
        console.error("Не вдалося завантажити динамічні тексти:", err);
      } finally {
        setLoadingSteps(false);
      }
    };

    fetchDynamicSteps();
  }, []);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isTyping]);
  
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("appTheme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) return alert("Введіть логін та пароль");

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      
      const result = await response.json();

      if (result.success) {
        setIsAdmin(true);
        
        // ЗБЕРІГАЄМО JWT ТОКЕН
        sessionStorage.setItem("jwt_token", result.token); 
        sessionStorage.setItem("isAdmin", "true"); 
        sessionStorage.setItem("userRole", result.role);
        
        setShowAdminDashboard(true);
        setLoginUsername(""); 
        setLoginPassword("");
        setIsSidebarOpen(false); 
        setIsMobileMenuOpen(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Помилка з'єднання з сервером.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    // ОЧИЩАЄМО ТОКЕН ПРИ ВИХОДІ
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("isAdmin"); 
    sessionStorage.removeItem("userRole"); 
    setShowAdminDashboard(false);
    setIsMobileMenuOpen(false);
  };

  const handleChange = (field, value) => {
    setComplaintData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'contact_type') {
        if (value === 'none') newData.contact_value = "";
        else if (value === 'phone') newData.contact_value = "+380";
      }
      return newData;
    });
  };

  const handleTogglePersonalData = (checked) => {
    setShowPersonalFields(checked);
    if (checked) {
      handleChange('is_anonymous', 0);
    } else {
      setComplaintData(prev => ({
        ...prev, is_anonymous: 1, full_name: "", student_group: "", contact_type: "none", contact_value: ""
      }));
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintData.message.trim()) return alert("Будь ласка, опишіть проблему.");
    setIsSending(true);
    const formData = new FormData();
    Object.keys(complaintData).forEach(key => formData.append(key, complaintData[key]));
    
    try {
      const response = await fetch(`${API_URL}/create-complaint.php`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        alert(`Звернення ${result.tracking_code} відправлено!`);
        setShowComplaintForm(false);
        setShowPersonalFields(false);
        setComplaintData({ full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", message: "", is_anonymous: 1, contact_type: "none", contact_value: "" }); 
      }
    } catch (error) { alert('Помилка з\'єднання.'); } 
    finally { setIsSending(false); }
  };

  const handleClick = (label, next) => {
    if (next === "open_complaint_form") { setShowComplaintForm(true); return; }
    if (!botSteps[next]) return;
    
    setMessages((prev) => [...prev, { sender: "user", text: label }]);
    setCurrentStep(""); 
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: botSteps[next].message }]);
      setCurrentStep(next);
    }, 600);
  };

  if (isAdmin && showAdminDashboard) {
    return <AdminDashboard userRole={userRole} onLogout={handleLogout} onReturnToBot={() => setShowAdminDashboard(false)} />;
  }

  if (loadingSteps) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;

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
          <ChatBox messages={messages} chatEndRef={chatEndRef} startMessage={botSteps.start.message} />
          {isTyping && <div className="typing-msg">Бот пише...</div>}
        </div>
        <div className="bot-controls">
          <Box sx={{ px: 2, pb: 2 }}> 
            <ButtonGroup options={botSteps[currentStep]?.options || []} handleClick={handleClick} />
          </Box>
        </div>
      </div>

      <Drawer anchor="right" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} PaperProps={{ className: "login-drawer" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Вхід для адміністратора</Typography>
        <input type="text" placeholder="Логін" className="bot-input-field" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" className="bot-input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
        <Button variant="contained" fullWidth className="btn-login-submit" onClick={handleLogin}>УВІЙТИ</Button>
      </Drawer>

      {/* === ПОВНІСТЮ ВІДНОВЛЕНА СКРИНЬКА ДОВІРИ === */}
      {showComplaintForm && (
        <div className="bot-modal-overlay">
          <div className="bot-modal-content" style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <IconButton onClick={() => setShowComplaintForm(false)} sx={{ position: 'absolute', top: 12, right: 12, color: isDarkMode ? '#9ca3af' : '#64748b' }}>
              <CloseIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <MoveToInboxIcon sx={{ fontSize: 40, color: '#38bdf8', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }} className="modal-header-title">Скринька довіри</Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', mt: 0.5 }}>
                За замовчуванням звернення є повністю анонімним.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
              
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

              <textarea placeholder="Опишіть ситуацію..." className="bot-glass-input" style={{ minHeight: '120px' }} value={complaintData.message} onChange={e => handleChange('message', e.target.value)} />
              
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

              {/* Чекбокс для відкриття додаткових полів */}
              <label className="bot-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 0' }}>
                <input type="checkbox" checked={showPersonalFields} onChange={e => handleTogglePersonalData(e.target.checked)} /> 
                <span style={{ fontSize: '15px', color: showPersonalFields ? '#38bdf8' : (isDarkMode ? '#e2e8f0' : '#1e293b'), fontWeight: showPersonalFields ? 600 : 400 }}>
                  Вказати мої дані для зворотного зв'язку
                </span>
              </label>

              {/* Поля, що випадають тільки якщо стоїть галочка */}
              {showPersonalFields && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '12px', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                  <input type="text" placeholder="ПІБ" className="bot-glass-input" value={complaintData.full_name} onChange={e => handleChange('full_name', e.target.value)} />
                  <input type="text" placeholder="Група (напр. КН-21)" className="bot-glass-input" value={complaintData.student_group} onChange={e => handleChange('student_group', e.target.value)} />
                  
                  <div className="bot-modal-field">
                    <label>Зв'язок:</label>
                    <select className="bot-glass-input" value={complaintData.contact_type} onChange={e => handleChange('contact_type', e.target.value)}>
                      <option value="none">Обрати спосіб зв'язку...</option>
                      <option value="phone">📞 Телефон</option>
                      <option value="email">📧 Email</option>
                    </select>
                  </div>
                  
                  {/* ШАБЛОН ДЛЯ ТЕЛЕФОНУ */}
                  {complaintData.contact_type === "phone" && (
                    <input 
                      type="tel" 
                      placeholder="+380 (XX) XXX-XX-XX" 
                      maxLength="19"
                      className="bot-glass-input" 
                      value={complaintData.contact_value} 
                      onChange={e => {
                        const numbers = e.target.value.replace(/\D/g, ''); 
                        let formatted = '';
                        if (numbers.length > 0) formatted += '+' + numbers.substring(0, 3);
                        if (numbers.length > 3) formatted += ' (' + numbers.substring(3, 5);
                        if (numbers.length > 5) formatted += ') ' + numbers.substring(5, 8);
                        if (numbers.length > 8) formatted += '-' + numbers.substring(8, 10);
                        if (numbers.length > 10) formatted += '-' + numbers.substring(10, 12);
                        handleChange('contact_value', formatted);
                      }} 
                    />
                  )}

                  {/* ШАБЛОН ДЛЯ EMAIL */}
                  {complaintData.contact_type === "email" && (
                    <input 
                      type="email" 
                      placeholder="student@example.com" 
                      className="bot-glass-input" 
                      value={complaintData.contact_value} 
                      onChange={e => handleChange('contact_value', e.target.value)} 
                    />
                  )}
                </Box>
              )}

              <div className="bot-modal-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={handleComplaintSubmit} className="bot-btn-success" style={{ flex: 1 }} disabled={isSending}>
                  {isSending ? "Надсилаємо..." : "НАДІСЛАТИ"}
                </button>
              </div>
            </Box>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;