import React, { useState, useRef, useEffect } from "react";
import "./App.css"; 
import staticSteps from "./data/steps";
import ChatBox from "./components/ChatBox/ChatBox";
import ButtonGroup from "./components/ButtonGroup/ButtonGroup";
import AdminDashboard from "./AdminDashboard";
import FeedbackModal from "./components/FeedbackModal/FeedbackModal";
import RatingModal from "./components/RatingModal/RatingModal";
import { Drawer, Button, Typography, Box, Divider, IconButton, CircularProgress } from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu'; 
import CloseIcon from '@mui/icons-material/Close'; 
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import StarOutlineIcon from '@mui/icons-material/StarOutline'; 

const API_URL = "http://172.20.10.3/backend";

function App() {
  const [messages, setMessages] = useState([]);
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

  // === СТАНИ ДЛЯ ВІКОН ОЦІНЮВАННЯ ТА ПЕРЕХОДУ ===
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingComment, setRatingComment] = useState("");
  const [pendingRedirect, setPendingRedirect] = useState(null); // Зберігає URL для переходу після оцінки

  const [complaintData, setComplaintData] = useState({
    full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", 
    urgency: "medium", 
    message: "", is_anonymous: 1, contact_type: "none", contact_value: ""
  });

  const chatEndRef = useRef(null);

  const fetchDynamicSteps = async () => {
    try {
      const res = await fetch(`${API_URL}/get-steps.php`);
      const dbTexts = await res.json();

      if (Array.isArray(dbTexts)) {
        setBotSteps(prevSteps => {
          const newSteps = { ...staticSteps };
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

  useEffect(() => {
    if (!showAdminDashboard) {
      fetchDynamicSteps();
    }
  }, [showAdminDashboard]);

  useEffect(() => {
    if (!isAdmin) {
      const isVisited = sessionStorage.getItem('zpfk_session_active');

      if (!isVisited) {
        fetch(`${API_URL}/track-visit.php`, { method: "POST" })
          .then(res => res.json())
          .then(data => {
             if (data.success) {
               sessionStorage.setItem('zpfk_session_active', 'true');
               console.log("Новий візит зараховано!");
             }
          })
          .catch(err => console.error("Помилка запису відвідування:", err));
      } else {
        console.log("Оновлення сторінки: візит проігноровано.");
      }
    }
  }, [isAdmin]);

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

  const [toast, setToast] = useState({ open: false, closing: false, type: '', message: '', details: '' });

  const closeToast = () => {
    setToast(prev => ({ ...prev, closing: true })); 
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false, closing: false })); 
    }, 400); 
  };

  const showToast = (type, message, details = '') => {
    setToast({ open: true, closing: false, type, message, details });
    setTimeout(() => {
      closeToast();
    }, 5000); 
  };

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) return showToast('error', 'Введіть логін та пароль');

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      
      const result = await response.json();

      if (result.success) {
        setIsAdmin(true);
        sessionStorage.setItem("jwt_token", result.token); 
        sessionStorage.setItem("isAdmin", "true"); 
        sessionStorage.setItem("userRole", result.role);
        
        setShowAdminDashboard(true);
        setLoginUsername(""); 
        setLoginPassword("");
        setIsSidebarOpen(false); 
        setIsMobileMenuOpen(false);
        
        showToast('success', 'Вхід виконано успішно!');
      } else {
        showToast('error', 'Помилка входу', result.error);
      }
    } catch (error) {
      showToast('error', 'Помилка з\'єднання з сервером');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
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
    if (!complaintData.message.trim()) return showToast('error', 'Будь ласка, опишіть проблему.');
    setIsSending(true);
    const formData = new FormData();
    Object.keys(complaintData).forEach(key => formData.append(key, complaintData[key]));
    
    try {
      const response = await fetch(`${API_URL}/create-complaint.php`, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (result.success) {
        showToast('success', <>Звернення <span className="text-green">успішно</span> відправлено</>);
        setShowComplaintForm(false);
        setShowPersonalFields(false);
        setComplaintData({ full_name: "", student_group: "", appeal_type: "complaint", category: "Навчальний процес", urgency: "medium", message: "", is_anonymous: 1, contact_type: "none", contact_value: "" });
      } else {
        showToast('error', <>Звернення <span className="text-red">не</span> відправлено</>, result.error || 'Невідома помилка сервера');
      }
    } catch (error) { 
      showToast('error', 'Помилка з\'єднання з сервером'); 
    } 
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

  // === ЛОГІКА ПЕРЕХОДУ ТА ОЦІНЮВАННЯ ===
  const handleExitClick = (url) => {
    const hasSeenRatingPrompt = sessionStorage.getItem("hasSeenRatingPrompt");

    // Якщо це звичайний користувач і йому ще не пропонували оцінити бота в цій сесії
    if (!hasSeenRatingPrompt && !isAdmin) {
      const randomChance = Math.random();
      
      if (randomChance <= 0.25) { // 25% ймовірність
        sessionStorage.setItem("hasSeenRatingPrompt", "true");
        setPendingRedirect(url); // Запам'ятовуємо, куди користувач хотів перейти
        setShowFeedbackModal(true); // Показуємо модалку
        return; // Зупиняємо миттєвий перехід на сайт
      }
    }
    
    // Якщо шанс не випав, або вікно вже показували — переходимо одразу
    window.location.href = url;
  };

  const handleFeedbackChoice = (wantsToRate) => {
    setShowFeedbackModal(false);
    if (wantsToRate) {
      setShowRatingModal(true);
    } else {
      // Якщо відмовився оцінювати — перекидаємо на збережений URL (або просто ховаємо)
      if (pendingRedirect) {
        window.location.href = pendingRedirect;
      } else {
        showToast('success', 'Дякуємо за використання бота!');
      }
    }
  };

  const handleRate = async (stars) => {
    try {
        await fetch(`${API_URL}/save-rating.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stars: stars, comment: ratingComment })
        });
        // Ми не чекаємо success для переходу, щоб не затримувати користувача
    } catch (error) {
        console.error('Помилка збереження оцінки', error);
    }

    setShowRatingModal(false);
    setRatingComment(""); 
    
    // Після оцінки перекидаємо на сайт (якщо перехід був ініційований кнопкою виходу)
    if (pendingRedirect) {
      window.location.href = pendingRedirect;
    } else {
      showToast('success', 'Дякуємо за вашу оцінку!');
    }
  };

  if (isAdmin && showAdminDashboard) {
    return <AdminDashboard userRole={userRole} onLogout={handleLogout} onReturnToBot={() => setShowAdminDashboard(false)} />;
  }

  if (loadingSteps) return <Box className="loading-container"><CircularProgress /></Box>;

  return (
    <div className={`bot-layout ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <div className={`bot-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Typography variant="h5" className="sidebar-brand-title">ZPFK</Typography>
          <Typography variant="caption" className="brand-sub">Помічник студента</Typography>
        </div>
        <Box className="sidebar-bottom-actions">
          {isAdmin ? (
            <>
              <Button className="btn-dashboard-sidebar" startIcon={<SettingsIcon />} fullWidth onClick={() => setShowAdminDashboard(true)}>АДМІНПАНЕЛЬ</Button>
              <Button className="btn-logout-sidebar" startIcon={<LogoutIcon />} fullWidth onClick={handleLogout}>ВИХІД</Button>
            </>
          ) : (
            <Button className="btn-login-sidebar" startIcon={<LoginIcon />} fullWidth onClick={() => { setIsSidebarOpen(true); setIsMobileMenuOpen(false); }}>ВХІД В АКАУНТ</Button>
          )}

          {/* === ОНОВЛЕНА КНОПКА ПЕРЕХОДУ НА САЙТ === */}
          <Button 
            className="btn-back-college"
            startIcon={<ArrowBackIcon />}
            fullWidth
            onClick={() => handleExitClick("http://nvpet.novograd.info")}
          >
            Сайт коледжу
          </Button>
        </Box>
      </div>

      <div className="bot-content">
        <div className="bot-header-simple">
          <IconButton className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} sx={{ color: isDarkMode ? '#f3f4f6' : '#0f172a' }}>
            <MenuIcon />
          </IconButton>
          <span className="header-title">Твій бот-консультант</span>
          
          <IconButton 
            onClick={() => { setPendingRedirect(null); setShowFeedbackModal(true); }} 
            sx={{ color: isDarkMode ? '#10b981' : '#059669', ml: 'auto', mr: 1 }}
            title="Оцінити бота"
          >
            <StarOutlineIcon />
          </IconButton>

          <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? '#fbbf24' : '#64748b' }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </div>

        <div className="bot-chat-area">
          <ChatBox messages={messages} chatEndRef={chatEndRef} startMessage={botSteps.start.message} />
          {isTyping && <div className="typing-msg">Бот пише...</div>}
        </div>
        <div className="bot-controls">
          <Box className="bot-controls-box"> 
            <ButtonGroup options={botSteps[currentStep]?.options || []} handleClick={handleClick} />
          </Box>
        </div>
      </div>

      <Drawer anchor="right" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} PaperProps={{ className: "login-drawer" }}>
        <Typography variant="h5" className="drawer-title-main">Вхід для адміністратора</Typography>
        <input type="text" placeholder="Логін" className="bot-input-field" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" className="bot-input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
        <Button variant="contained" fullWidth className="btn-login-submit" onClick={handleLogin}>УВІЙТИ</Button>
      </Drawer>

      {showComplaintForm && (
        <div className="bot-modal-overlay">
          <div className="bot-modal-content">
            <IconButton className="modal-close-btn" onClick={() => setShowComplaintForm(false)} sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
              <CloseIcon />
            </IconButton>

            <Box className="modal-header-wrapper">
              <MoveToInboxIcon className="modal-header-icon" />
              <Typography variant="h5" className="modal-header-title">Скринька довіри</Typography>
              <Typography variant="body2" className="modal-subtitle" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                За замовчуванням звернення є повністю анонімним.
              </Typography>
            </Box>

            <Box className="modal-form-body">
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
                <label>Терміновість:</label>
                <select className="bot-glass-input" value={complaintData.urgency} onChange={e => handleChange('urgency', e.target.value)}>
                  <option value="low">🟢 Низька (може почекати)</option>
                  <option value="medium">🟡 Середня (стандартна)</option>
                  <option value="high">🔴 Висока (потребує швидкої реакції)</option>
                </select>
              </div>

              <textarea placeholder="Опишіть ситуацію..." className="bot-glass-input modal-textarea" value={complaintData.message} onChange={e => handleChange('message', e.target.value)} />
              
              <Divider className="modal-divider" sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

              <label className="bot-checkbox-label">
                <input type="checkbox" checked={showPersonalFields} onChange={e => handleTogglePersonalData(e.target.checked)} /> 
                <span className="checkbox-text" style={{ color: showPersonalFields ? '#38bdf8' : (isDarkMode ? '#e2e8f0' : '#1e293b'), fontWeight: showPersonalFields ? 600 : 400 }}>
                  Вказати мої дані для зворотного зв'язку
                </span>
              </label>

              {showPersonalFields && (
                <Box className="personal-data-container" sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
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

              <div className="bot-modal-buttons">
                <button onClick={handleComplaintSubmit} className="bot-btn-success" disabled={isSending}>
                  {isSending ? "Надсилаємо..." : "НАДІСЛАТИ"}
                </button>
              </div>
            </Box>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <FeedbackModal onChoice={handleFeedbackChoice} />
      )}

      {showRatingModal && (
        <RatingModal 
          onRate={handleRate} 
          setComment={setRatingComment} 
          comment={ratingComment} 
        />
      )}

      {toast.open && (
        <div className="custom-toast-overlay">
          <div className={`custom-toast ${toast.closing ? 'closing' : ''}`} data-type={toast.type}>
            <div className="toast-content">
              <span className="toast-title">
                {toast.type === 'success' ? 'Готово 😉' : 'От халепа 😥'}
              </span>
              <p className="toast-message">
                {toast.message}
                {toast.details && (
                  <>
                    <br/>
                    <span className="toast-details">{toast.details}</span>
                  </>
                )}
              </p>
            </div>
            <button className="toast-close-btn" onClick={closeToast}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;