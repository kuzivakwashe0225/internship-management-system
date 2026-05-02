import axios from 'axios';

const api = axios.create();

api.interceptors.request.use(config => {
    try {
        const userStr = localStorage.getItem('intrahub_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
    } catch (error) {
        console.error('Error reading auth token:', error);
    }
    return config;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) {
        localStorage.removeItem('intrahub_user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
