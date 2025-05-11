import axios from 'axios';

const host = import.meta.env.VITE_BACKEND_HOST;
const port = import.meta.env.VITE_BACKEND_PORT;

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
