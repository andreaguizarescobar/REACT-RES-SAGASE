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
