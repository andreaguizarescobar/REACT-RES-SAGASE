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

export const deleteUser = (id, token) => {
    return fetchAPI(`/users/delete/${id}`, {
        method: 'DELETE',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
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

export const validarTarea = (tareaId, token) => {
    return fetchAPI(`/users/validar-tarea/${tareaId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const devolverTarea = (tareaId, token) => {
    return fetchAPI(`/users/devolver-tarea/${tareaId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const createSolicitud = (data) => {
    return fetchAPI('/users/solicitud', {
        method: 'POST',
        body: JSON.stringify(data) // data
    });
}

export const getSolicitudes = (token) => {
    return fetchAPI('/users/solicitudes', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const approveSolicitud = (id, ROL, token) => {
    return fetchAPI(`/users/solicitudes/approve/${id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify( ROL )
    });
}

export const rejectSolicitud = (id, token) => {
    return fetchAPI(`/users/solicitudes/reject/${id}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const getNotificaciones = (userId, token) => {
    return fetchAPI(`/users/notificaciones/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const marcarNotificacionLeida = (notifId, userId, token) => {
    return fetchAPI(`/users/marcar-leida/${notifId}/${userId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const marcarTodasNotificacionesLeidas = (userId, token) => {
    return fetchAPI(`/users/marcar-todas-leidas/${userId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const clearNotificaciones = (userId, token) => {
    return fetchAPI(`/users/clear-notificaciones/${userId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const getCopias = (userId, token) => {
    return fetchAPI(`/users/copias/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}