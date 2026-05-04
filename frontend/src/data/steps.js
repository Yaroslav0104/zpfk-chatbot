const steps = {
  // Цей блок обов'язковий, бо App.js шукає саме "start" для першого повідомлення
  start: {
    message: "👋 Вітаю! Я - ZPFK Assistant. Щоб розпочати спілкування, натисніть кнопку «Привіт» нижче або напишіть своє питання.",
    options: [
      { label: "Привіт! 😊", next: "main_menu" }
    ],
  },

  main_menu: {
    message: "Чим я можу вам допомогти? Оберіть потрібний розділ:",
    options: [
      { label: "Розклад занять 📅", next: "schedule" },
      { label: "Контакти коледжу 📞", next: "contacts" },
      { label: "Спеціальності 🎓", next: "specialties" },
      { label: "Про нас 🏫", next: "about" },
      { label: "Залишити звернення ✍️", next: "open_complaint_form" }
    ],
  },

  schedule: {
    message: "Розклад занять можна переглянути на офіційному сайті коледжу або в нашому Telegram-каналі. Бажаєте посилання?",
    options: [
      { label: "Так, посилання 🔗", next: "links" },
      { label: "Назад в меню ⬅️", next: "main_menu" }
    ],
  },

  contacts: {
    message: "📍 Адреса: м. Звягель, вул. Шевченка, 38. <br/>📧 Email: zpfk@example.com <br/>📞 Телефон: (04141) X-XX-XX",
    options: [
      { label: "Назад в меню ⬅️", next: "main_menu" }
    ],
  },

  specialties: {
    message: "Наш коледж готує фахівців за напрямками: <br/>1. Інженерія програмного забезпечення <br/>2. Автомобільний транспорт <br/>3. Електроенергетика <br/>4. Будівництво",
    options: [
      { label: "Назад в меню ⬅️", next: "main_menu" }
    ],
  },

  about: {
    message: "Звягельський політехнічний фаховий коледж — це сучасний навчальний заклад з багаторічною історією!",
    options: [
      { label: "Назад в меню ⬅️", next: "main_menu" }
    ],
  },

  links: {
    message: "Ось корисні посилання: <br/>🌐 Сайт: <a href='http://nvpet.novograd.info' target='_blank' rel='noopener noreferrer'>nvpet.novograd.info</a> <br/>📱 Telegram: <a href='https://t.me/zpfk_info' target='_blank' rel='noopener noreferrer'>t.me/zpfk_info</a>",
    options: [
      { label: "Назад в меню ⬅️", next: "main_menu" }
    ],
  }
};

// ВАЖЛИВО: цей рядок дозволяє App.js бачити об'єкт steps
export default steps;