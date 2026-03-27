import { fetchAPI } from './api.js';

export const loginRequest = (data) => {
    console.log('Login data:', data); // Agrega este log para verificar los datos enviados
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
        body: JSON.stringify(data),
    });
}