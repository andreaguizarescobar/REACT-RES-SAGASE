import { fetchAPI } from "./api";

export const getUsers = (token) => {
    return fetchAPI('/users/getAll', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const updateUser = (id, data, token) => {
    return fetchAPI(`/users/update/${id}`, {
        method: 'PATCH',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
    });
}

export const deleteUser = (id) => {
    return fetchAPI(`/users/delete/${id}`, {
        method: 'DELETE',
    });
}

export const getUserById = (id) => {
    return fetchAPI(`/users/getUser/${id}`, {
        method: 'GET',
    });
}

export const forgot = (email) => {
    return fetchAPI(`/users/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email })
    })
}

export const reset = (token, password) => {
    return fetchAPI(`/users/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, password })
    })
}

export const getTareas = (userId, token) => {
    return fetchAPI(`/users/tareas/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const concluirTarea = (tareaId, token, notas) => {
    return fetchAPI(`/users/concluir-tarea/${tareaId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notas })
    });
}

export const moveTarea = (tareaId, token) => {
    return fetchAPI(`/users/move-tarea/${tareaId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}