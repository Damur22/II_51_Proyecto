import { supabase } from "./supabase.js";

// Registro de login
const registroForm = document.getElementById("registroForm");
if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cedula = document.getElementById("cedula").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!cedula || !contraseña) {
      Swal.fire("Complete todos los campos", "", "warning");
      return;
    }
    try {
      console.log("Intentando registrar usuario:", { cedula, contraseña }); // log para depuración
      const { data, error } = await supabase.from("usuarios").insert([{ cedula, contraseña }]);
      console.log("Respuesta de Supabase:", { data, error }); // log para depuración
      if (error) {
        Swal.fire("Error al registrar usuario", error.message || "", "error");
        return;
      }
      Swal.fire ({
        icon: "success",
        title: "Usuario registrado",
        text: "Ahora puede iniciar sesión"})
      .then(() => {
        window.location.href = "login.html";
      });
    } catch (err) {
      Swal.fire("Error inesperado", err.message, "error");
    }
  });
}

// Captura el formulario de login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim(); // aquí usas la cédula
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!usuario || !contraseña) {
      Swal.fire("Complete todos los campos", "", "warning");
      return;
    }

    try {
      // Buscar usuario en la tabla 'usuarios' de Supabase
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("cedula", usuario) // usamos la cédula como identificador
        .single();

      if (error || !data) {
        Swal.fire("Acceso denegado", "Usuario no encontrado", "error");
        return;
      }

      // Validar contraseña
      if (data.contraseña === contraseña) {
        // Guardar sesión
        sessionStorage.setItem("usuario", usuario);

        Swal.fire({
          icon: "success",
          title: "Acceso concedido",
          text: "Bienvenido al sistema"
        }).then(() => {
          window.location.href = "index.html";
        });
      } else {
        Swal.fire("Acceso denegado", "Contraseña incorrecta", "error");
      }
    } catch (err) {
      Swal.fire("Error inesperado", err.message, "error");
    }
  });
}

//  Botón de salir en el menú del index //
// Busca el enlace que apunta a login.html (el botón "Salir")
const salirLink = document.querySelector('a[href="login.html"]');
if (salirLink) {
  salirLink.addEventListener("click", function () {
    sessionStorage.clear(); // borra la sesión al salir
  });
}