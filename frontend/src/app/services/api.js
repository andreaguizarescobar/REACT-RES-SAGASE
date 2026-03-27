
const API = 'http://localhost:3333/api/v1';

export const fetchAPI = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};