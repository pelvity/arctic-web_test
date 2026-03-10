import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for generic error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // We could toast errors here if we had a toast system
        // Prevent 404 errors from cluttering the console, since components handle them
        if (error.response?.status !== 404) {
            console.error('API Error:', error.response?.data?.message || error.message);
        }
        return Promise.reject(error);
    }
);
