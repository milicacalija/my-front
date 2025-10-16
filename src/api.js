//Za kompjliranje i povezivanje backenda javno moramo promeniti putanje axios poziva
// src/api.js
// src/api.js
import axios from 'axios';

const api = axios.create({
//baseURL: 'https://helpful-quietude-production.up.railway.app', // javni backend, ✅ Povećava timeout —moda.
    baseURL: 'http://localhost:3016', // lokalni backend
  timeout: 20000, // povećaj timeout na 20 sekundi zbog Railway latency-ja,  Railway često zna kasniti 12–15s kad “probudi” backend iz sleep 
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// ⏱ Dodaj timestamp u svaki zahtev da razbije cache
api.interceptors.request.use(config => {
  config.params = config.params || {};
  config.params._t = Date.now();
  return config;
});

export default api;

