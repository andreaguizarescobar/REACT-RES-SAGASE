import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Minus } from "lucide-react";
import nayaritLogo from "../../assets/images/nayaritLogo.png";
import bgNayarit from "../../assets/images/personajenayarit.jpg";

import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { loginRequest, cambiarPasswordRequest } from "../../services/auth.service";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginRequest({ username: username, password });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        if (data.user.firstLogin) {
          setShowModal(true);
        } else {
          const isAdmin = data.user.roles.some(role => role.rol === 'ADMIN');
          localStorage.setItem('user', JSON.stringify(data.user));
          if (isAdmin) {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        const errorData = await response.json();
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: errorData.message || "Credenciales incorrectas",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error de conexión",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const validarPassword = (pass) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{1,8}$/;

    return regex.test(pass);
  };

  const handleGuardarPassword = async () => {
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Las contraseñas no coinciden",
        confirmButtonColor: "#8B1538",
      });
      return;
    }

    if (!validarPassword(newPassword)) {
      Swal.fire({
        icon: "info",
        title: "Contraseña inválida",
        text: "Debe tener una mayúscula, un número, un carácter especial y máximo 8 caracteres",
        confirmButtonColor: "#8B1538",
      });
      return;
    }

    try {
      const response = await cambiarPasswordRequest(user.userId, { newPassword: newPassword, currentPassword: password });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Contraseña actualizada!",
          text: "Ahora puedes continuar",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#8B1538",
          timer: 3000,
          background: "#fff",
          customClass: {
            popup: "rounded-xl",
          },
        });
        setShowModal(false);
        const isAdmin = user.roles && user.roles.some(role => role.rol === 'ADMIN');
        if (isAdmin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.message || "Error al cambiar la contraseña",
          confirmButtonColor: "#8B1538",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo cambiar la contraseña",
        confirmButtonColor: "#8B1538",
      });
    }
  };

  const isPasswordValid =
  validarPassword(newPassword) &&
  newPassword === confirmPassword &&
  newPassword.length > 0;

  const cumpleRegex = validarPassword(newPassword);
  const coincide = newPassword === confirmPassword && confirmPassword.length > 0;

  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [email, setEmail] = useState("");

  const handleRecuperarPassword = async () => {
    if (!email) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Ingrese su correo electrónico",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

     // Simulación de envío
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Correo enviado correctamente",
      text: "Revise su bandeja de entrada",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    setShowRecoverModal(false);

    // Redirigir a pantalla de reset (simulada)
    setTimeout(() => {
      navigate("/reset-password");
    }, 2000);
    // try {
    //   const response = await fetch("/api/auth/recuperar-password", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email }),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     Swal.fire({
    //       toast: true,
    //       position: "top-end",
    //       icon: "success",
    //       title: "Correo enviado correctamente",
    //       showConfirmButton: false,
    //       timer: 3000,
    //       timerProgressBar: true,
    //     });

    //     setShowRecoverModal(false);
    //     setEmail("");
    //   } else {
    //     Swal.fire({
    //       toast: true,
    //       position: "top-end",
    //       icon: "error",
    //       title: data.message || "No se pudo enviar el correo",
    //       showConfirmButton: false,
    //       timer: 3000,
    //       timerProgressBar: true,
    //     });
    //   }
    // } catch (error) {
    //   Swal.fire({
    //     toast: true,
    //     position: "top-end",
    //     icon: "error",
    //     title: "Error de conexión",
    //     showConfirmButton: false,
    //     timer: 3000,
    //     timerProgressBar: true,
    //   });
    // }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    
    <div className="min-h-screen flex">

      {/* IZQUIERDA (LOGIN) */}
      <div className="w-full md:w-[35%] bg-gray-100 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-4 text-center">
            <img
              src={nayaritLogo}
              alt="Nayarit Secretaría de Educación"
              className="h-16 mx-auto mb-4"
            />
            <h2 className="text-4xl font-semibold text-[#8B1538] tracking-widest">
              SAGASE
            </h2>
          </motion.div>

          <h2 className="text-2xl mb-2 text-gray-800 text-center">
            Iniciar Sesión
          </h2>

          <p className="text-sm text-gray-500 mb-8 text-center">
            ¿No tiene una cuenta?{" "}
            <a href="#" className="text-[#8B1538] hover:underline">
              Contacte al administrador
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Usuario */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
              required
            />

            {/* Contraseña */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowRecoverModal(true)}
                className="text-sm text-[#8B1538] hover:underline"
              >
                ¿Olvidó su contraseña?
              </button>

            </div>

            <button
              type="submit"
              className="w-full bg-[#8B1538] text-white py-3 rounded-lg hover:bg-[#6B0F2A] transition-colors"
            >
              Iniciar Sesión
            </button>

            <div className="relative my-2">
              <div className="w-full border-t border-gray-300"></div>
            </div>

            <p className="text-xs text-center text-gray-400 mt-6">
              Sujeto a la Política de Privacidad y Términos de Servicio.
            </p>

          </form>
        </motion.div>
      </div>

      {/* DERECHA (FONDO + CARD CON TU TEXTO) */}
      <div
        className="hidden md:block md:w-[65%] relative"
        style={{
          backgroundImage: `url(${bgNayarit})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#79142A]/40"></div>

        {/* CARD FLOTANTE CON TU CONTENIDO ORIGINAL */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white w-[470px] p-10 rounded-2xl shadow-xl"
          >

            <h1 className="text-3xl mb-3 text-gray-800">
              Bienvenido a <br /> 
              <h1 className="text-4xl font-semibold text-[#8B1538] tracking-widest">
              SAGASE
              </h1>
            </h1>

            <p className="text-gray-500 leading-relaxed">
              Sistema Automatizado de Gestión y Archivos para la Secretaría de
              Educación del Estado de Nayarit. <br/> Esta plataforma permite el
              registro, seguimiento, validación y administración de documentos
              institucionales de manera digital, segura y organizada.
            </p>

          </motion.div>
        </div>
      </div>

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-[500px] rounded shadow-lg relative"
              >
                {/* HEADER */}
                <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
                  <h3>Nuevo Usuario</h3>
                  Es necesario modificar su contraseña...
                </div>

                <div className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 leading-relaxed">
                  🔒 Debe incluir <span className="font-medium">una mayúscula</span>, 
                  <span className="font-medium"> un número</span>, 
                  <span className="font-medium"> un carácter especial</span> y 
                  tener un máximo de <span className="font-medium">8 caracteres</span>.
                </div>

                {/* BOTÓN CERRAR */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>

                {/* CONTENIDO */}
                <div className="p-6 space-y-4">
                  {/* NUEVA CONTRASEÑA */}
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Ingrese su nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* CONFIRMAR CONTRASEÑA */}
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme su nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="px-1">
                      {newPassword.length > 0 && (
                        <p
                          className={`text-xs mt-1 ${
                            cumpleRegex && coincide ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {cumpleRegex
                            ? coincide
                              ? "✔ Contraseña válida y coincide"
                              : "✔ Contraseña válida"
                            : "La contraseña no cumple con los requisitos"}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end px-6 pb-4">
                      <button
                        onClick={handleGuardarPassword}
                        disabled={!isPasswordValid}
                        className={`px-4 py-2 rounded text-white text-sm transition
                          ${
                            isPasswordValid
                              ? "bg-[#8B1538] hover:bg-[#6B0F2A]"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                      >
                        Confirmar
                      </button>
                    </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRecoverModal && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-[500px] rounded shadow-lg relative"
              >
                {/* HEADER */}
                <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">
                  <h1>Restablecer contraseña</h1>
                  Ingrese el correo electrónico relacionado con su cuenta.
                </div>

                {/* BOTÓN CERRAR */}
                <button
                  onClick={() => setShowRecoverModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8B1538] text-white absolute top-2 right-3 hover:opacity-90"
                >
                  <Minus size={14} />
                </button>

                {/* CONTENIDO */}
                <div className="p-6 space-y-4">
                  
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1538]"
                  />

                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Nota:</span> Se enviará un correo con instrucciones para restablecer su contraseña. Asegúrese de revisar su bandeja de entrada y la carpeta de spam.
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleRecuperarPassword}
                      className="bg-[#8B1538] text-white px-4 py-2 rounded text-sm hover:bg-[#6B0F2A] transition"
                    >
                      Enviar
                    </button>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
  );
}
