import axios from 'axios';
import { account } from './appwriteClient';

// Si se accede desde la red local (ej. 192.168.x.x), forzará al frontend a buscar el API en esa misma IP en el puerto 5000.
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_URL = `http://${hostname}:5000/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const response = await account.createJWT();
    if (response && response.jwt) {
      config.headers['Authorization'] = `Bearer ${response.jwt}`;
    }
  } catch (error) {
    // No hay sesión activa, continúa sin header
  }
  return config;
});

export default apiClient;
