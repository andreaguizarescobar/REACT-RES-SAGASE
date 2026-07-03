import { fetchAPI } from "./api";

export const getDashboard = async () => {

    const response = await fetchAPI("/dashboard/admin", {
        method: "GET"
    });

    if (!response.ok) {
        throw new Error("Error al obtener las estadísticas");
    }

    return await response.json();
};