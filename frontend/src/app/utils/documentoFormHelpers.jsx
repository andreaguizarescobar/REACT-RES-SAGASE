import Swal from "sweetalert2";

export const Toggle = ({ checked, onChange, disabled = false, activeColor = "#8B1538" }) => {
  const style = checked ? { backgroundColor: activeColor } : {};

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      style={style}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${checked ? "" : "bg-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`}
      />
    </button>
  );
};

export const handleChangeForm = (e, setForm, setErrores, options = {}) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));

  if (!setErrores) {
    return;
  }

  if (options.validateOnChange) {
    setErrores((prev) => ({ ...prev, [name]: !value.trim() }));
  } else if (options.clearOnChange) {
    setErrores((prev) => ({ ...prev, [name]: false }));
  }
};

export const validarDocumentoForm = (
  form,
  setErrores,
  { required = [], conditional = [] } = {}
) => {
  const nuevosErrores = {};

  required.forEach((field) => {
    if (!form[field]) {
      nuevosErrores[field] = true;
    }
  });

  conditional.forEach((validator) => {
    if (typeof validator === "function") {
      validator(form, nuevosErrores);
    }
  });

  setErrores(nuevosErrores);

  return Object.keys(nuevosErrores).length === 0;
};

export const handleToggleFaltaInformacion = (value, setForm, setFolioGenerado) => {
  setForm((prev) => ({ ...prev, faltaInformacion: value }));

  if (value) {
    const anioActual = new Date().getFullYear();
    const numeroAleatorio = Math.floor(Math.random() * 900) + 100;
    setFolioGenerado(`Folio ${numeroAleatorio}-${anioActual}`);
  } else {
    setFolioGenerado("");
  }
};

export const showValidationError = () => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: "Faltan campos obligatorios",
    showConfirmButton: false,
    timer: 2500,
  });
};
