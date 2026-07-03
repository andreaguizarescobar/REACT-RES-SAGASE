
const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333';

export const fetchAPI = async (endpoint, options = {}) => {
    try {
        const isFormData = options.body instanceof FormData;
        const headers = isFormData
            ? { ...(options.headers || {}) }
            : { 'Content-Type': 'application/json', ...(options.headers || {}) };

        const response = await fetch(`${API}${endpoint}`, {
            ...options,
            headers,
        });
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};