// src/utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',  // your Django backend
});

export default API;
