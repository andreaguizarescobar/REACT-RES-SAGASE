import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import nayaritLogo from "../assets/nayaritLogo.png";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de login
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Left side */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="mb-8">
              <img
                src={nayaritLogo}
                alt="Nayarit Secretaría de Educación"
                className="h-16 mb-6"
              />
              <h2 className="text-4xl text-[#8B1538] tracking-wide text-center">
                SAGASE
              </h2>
            </div>

            <h1 className="text-2xl mb-2 text-gray-800">
              Bienvenido a
              <br />
              SAGASE
            </h1>

            <p className="text-gray-500 leading-relaxed">
              Sistema Automatizado de Gestión y Archivos para la Secretaría de
              Educación del Estado de Nayarit. Esta plataforma permite el
              registro, seguimiento, validación y administración de documentos
              institucionales de manera digital, segura y organizada.
            </p>
          </div>

          {/* Right side */}
          <div className="flex-1 p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">

              <h2 className="text-2xl mb-2 text-gray-800 text-center">
                Iniciar Sesión
              </h2>

              <p className="text-sm text-gray-500 mb-8">
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
                  <a href="#" className="text-sm text-[#8B1538] hover:underline">
                    ¿Olvidó su contraseña?
                  </a>
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
