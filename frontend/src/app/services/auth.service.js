import { fetchAPI } from './api.js';

export const loginRequest = (data) => {
  return fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });   
};

export const registerRequest = (data, token) => {
    return fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const cambiarPasswordRequest = (userId, data) => {
    return fetchAPI(`/users/cambiar-password/${userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export const verifyTokenRequest = (token) => {
    return fetchAPI('/users/verificar-token', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}