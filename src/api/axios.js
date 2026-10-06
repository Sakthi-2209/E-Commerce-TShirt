import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to the MERN backend
  withCredentials: true,
});

export default api;
