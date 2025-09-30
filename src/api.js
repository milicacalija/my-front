//Za kompjliranje i povezivanje backenda javno moramo promeniti putanje axios poziva
// src/api.js
// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 10000,
});

export default api;
