import axios from 'axios';

const api = axios.create(); // We can keep baseUrl default if we are proxying in Vite

api.interceptors.request.use(config => {
    const userStr = localStorage.getItem('intrahub_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
