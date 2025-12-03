// src/utils/api.js

import axios from 'axios';


const API = axios.create({
  baseURL: 'http://localhost:8000/api/',  
});

export default API 


export const testAPI = async () => {
  try {
    const response = await API.get('test/');
    console.log('✓ Backend API connection successful:', response.data); 
  } catch (error) {
    console.warn('⚠️ Backend API not available yet. This is normal during development.');
    console.warn('Make sure your Django backend is running on http://localhost:8000');
  }
};
