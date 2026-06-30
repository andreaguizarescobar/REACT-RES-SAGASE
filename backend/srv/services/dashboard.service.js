import User from "../models/user.model.js";
import Rol from "../models/rol.model.js";
import Solicitud from "../models/solicitud.model.js";

const getDashboard = async () => {
    try {
        const [usuarios, solicitudes, validadores, ejecutores, registradores] = await Promise.all([

            // usuarios sin admin
            User.countDocuments({
                "roles.rol": { $ne: "ADMIN" }
            }),

            // solicitudes pendientes
            Solicitud.countDocuments({
                status: "Pendiente"
            }),

            // conteo por rol REAL (según tu estructura)
            User.countDocuments({
                "roles.rol": "VALIDADOR"
            }),

            User.countDocuments({
                "roles.rol": "EJECUTOR"
            }),

            User.countDocuments({
                "roles.rol": "REGISTRADOR"
            })
        ]);

        return {
            usuarios,
            solicitudes,
            roles: {
                totalTipos: 3,
                validadores,
                ejecutores,
                registradores
            },
            proyectos: 0
        };

    } catch (error) {
        console.error("🔥 ERROR DASHBOARD:", error);
        throw error;
    }
};

export default {
    getDashboard
};