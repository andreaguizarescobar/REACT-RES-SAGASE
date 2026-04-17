import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import bgNayarit from "../../assets/images/personajenayarit2.jpg";
import nayaritLogo from "../../assets/images/nayaritLogo.png";

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const validarPassword = (pass) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{1,8}$/.test(pass);
  };

  const isPasswordValid =
    validarPassword(newPassword) &&
    newPassword === confirmPassword &&
    newPassword.length > 0;

    const cumpleRegex = validarPassword(newPassword);
    const coincide =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Las contraseñas no coinciden",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    if (!validarPassword(newPassword)) {
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Contraseña inválida",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Contraseña restablecida",
      text: "Inicie sesión con su nueva contraseña",
      showConfirmButton: false,
      timer: 4000,
    });

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
   <div className="h-screen flex flex-col bg-gray-100">

    <div className="flex-1 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-[500px] p-6 rounded-xl shadow-lg"
      >
        {/* HEADER SUPERIOR */}
        <div className="text-center pt-1">
            <img
                src={nayaritLogo}
                alt="Nayarit Secretaría de Educación"
                className="h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-semibold text-[#8B1538] tracking-widest">
            SAGASE
            </h1>

        </div>

         {/* CONTENIDO CENTRAL */}
        <h2 className="pt-3 text-xl text-center mb-4 text-gray-800">
          Restablecer contraseña
        </h2>

        <div className="space-y-4">

        <div className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 leading-relaxed">
        🔒 Recuerde que su contraseña debe incluir <span className="font-medium">una mayúscula</span>, 
        <span className="font-medium"> un número</span>, 
        <span className="font-medium"> un carácter especial</span> y 
        ser de máximo <span className="font-medium">8 caracteres</span>.
        </div>

          {/* Nueva */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirmar */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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

          <button
            onClick={handleReset}
            disabled={!isPasswordValid}
            className={`w-full py-2 rounded text-white transition
                ${
                isPasswordValid
                    ? "bg-[#8B1538] hover:bg-[#6B0F2A]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
            Guardar nueva contraseña
            </button>

        </div>
      </motion.div>
    </div>
    
    {/* IMAGEN INFERIOR */}
    <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="w-full h-[120px] overflow-hidden"
    >
    <img
        src={bgNayarit}
        alt="Decoración"
        className="w-full h-full object-cover"
    />
    </motion.div>

    
    </div>
    
  );
}
