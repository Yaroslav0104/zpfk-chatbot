export const API_URL = process.env.NODE_ENV === 'production' 
    ? "/backend" // Якщо сайт на реальному домені
    : "http://192.168.1.18/backend"; // Ваша поточна адреса для розробки