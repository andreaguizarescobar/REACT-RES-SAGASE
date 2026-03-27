import { fetchAPI } from './api.js';

export const loginRequest = (data) => {
  return fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });   
};

export const registerRequest = (data) => {
    return fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const cambiarPasswordRequest = (userId, data) => {
    return fetchAPI(`/users/cambiar-password/${userId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}