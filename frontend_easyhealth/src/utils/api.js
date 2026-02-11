// src/utils/api.js
import axios from 'axios';
import { API_URL } from '../api/config';

const API = axios.create({
  baseURL: API_URL,
});

export default API;
