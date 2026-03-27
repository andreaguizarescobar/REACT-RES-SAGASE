import { fetchAPI } from "./api";

export const getUsers = () => {
    return fetchAPI('/users/getAll', {
        method: 'GET',
    });
}

export const createUser = (data) => {
    return fetchAPI('/users/create', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const updateUser = (id, data) => {
    return fetchAPI(`/users/update/${id}`, {
        method: 'PUT',
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
