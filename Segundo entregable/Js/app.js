// Importa el cliente de Supabase configurado (URL + clave)
import { supabase } from "./supabase.js";

// Referencias al DOM
// Botones
const btnIngreso = document.getElementById("btnIngreso"); // botón Registrar Ingreso
const btnCancelarIngreso = document.getElementById("btnCancelarIngreso"); // botón Cancelar Ingreso
const btnSalida = document.getElementById("btnSalida"); // botón Registrar Salida
const btnCancelarSalida = document.getElementById("btnCancelarSalida"); // botón Cancelar Salida
const btnLoad = document.getElementById("btnLoad"); // botón Cargar Historial
const btnClear = document.getElementById("btnClear"); // botón Limpiar Búsqueda
// Búsqueda
const txtSearch = document.getElementById("txtSearch"); // campo de búsqueda

// Formularios y campo id oculto
const formIngreso = document.getElementById("formIngreso"); // formulario de ingreso
const formSalida = document.getElementById("formSalida"); // formulario de salida
const txtId = document.getElementById("txtId"); // id oculto para edición

// Campos del formulario de ingreso
const Num_Oficio = document.getElementById("Num_Oficio"); // número de oficio
const Descripcion = document.getElementById("Descripcion"); // descripción del activo
const Marca = document.getElementById("Marca"); // marca
const Serie = document.getElementById("Serie"); // serie
const Modelo = document.getElementById("Modelo"); // modelo
const Patrimonio = document.getElementById("Patrimonio"); // patrimonio
const Licencia = document.getElementById("Licencia"); // licencia
const Ubicacion = document.getElementById("Ubicacion"); // ubicación en bodega
const Estado = document.getElementById("Estado"); // estado del activo
const Fecha_Ingreso = document.getElementById("Fecha_Ingreso"); // fecha ingreso
const Tecnico_Registra = document.getElementById("Tecnico_Registra"); // técnico que registra
const Tecnico_Entrega = document.getElementById("Tecnico_Entrega"); // técnico que entrega
const Observaciones_Ingreso = document.getElementById("Observaciones_Ingreso"); // observaciones ingreso

// Campos del formulario de salida
const Caso = document.getElementById("Caso"); // caso asignado
const Tecnico_Solicita = document.getElementById("Tecnico_Solicita"); // técnico que solicita
const Tecnico_Salida = document.getElementById("Tecnico_Salida"); // técnico que entrega en salida
const Patrimonio_Salida = document.getElementById("Patrimonio_Salida"); // patrimonio en salida
const Descripcion_Activo = document.getElementById("Descripcion_Activo"); // descripción en salida
const Marca_Activo = document.getElementById("Marca_Activo"); // marca en salida
const Modelo_Activo = document.getElementById("Modelo_Activo"); // modelo en salida
const Fecha_Salida = document.getElementById("Fecha_Salida"); // fecha salida
const Condicion_Activo = document.getElementById("Condicion_Activo"); // condición al entregar
const Observaciones_Salida = document.getElementById("Observaciones_Salida"); // observaciones salida

// Tabla y título
const tbodyHistorial = document.getElementById("tbodyHistorial"); // cuerpo de la tabla donde se insertan filas
const tituloForm = document.getElementById("tituloForm"); // título del formulario

// Inicialización
// Al cargar la ventana, ejecuta consultarHistorial para llenar la tabla con los datos actuales de Supabase
window.onload = () => {
  consultarHistorial(); // carga inicial de datos
};
// Eventos 
// Recarga la tabla al hacer clic en el botón de cargar historial
if (btnLoad) btnLoad.addEventListener("click", () => consultarHistorial());

// Limpia la búsqueda y recarga la tabla
if (btnClear) {
  btnClear.addEventListener("click", async () => {
    if (txtSearch) txtSearch.value = ""; // borra texto de búsqueda
    await consultarHistorial(); // recarga tabla sin filtro
    Swal.fire("Búsqueda limpiada"); // notifica al usuario (SweetAlert)
  });
}

// Resetea formulario de ingreso
if (btnCancelarIngreso) { 
  btnCancelarIngreso.addEventListener("click", () => { // limpia formulario y notifica
    if (formIngreso) formIngreso.reset(); 
    if (txtId) txtId.value = ""; 
    Swal.fire("Formulario de ingreso cancelado"); // notifica al usuario (SweetAlert)
  });
}

// Resetea formulario de salida
if (btnCancelarSalida) { // limpia formulario y notifica
  btnCancelarSalida.addEventListener("click", () => {
    if (formSalida) formSalida.reset();
    if (txtId) txtId.value = "";
    Swal.fire("Formulario de salida cancelado"); // notifica al usuario (SweetAlert)
  });
}

// Guarda movimiento de ingreso
if (formIngreso) { // al enviar el formulario de ingreso, guarda el movimiento
  formIngreso.addEventListener("submit", async (e) => { // previene recarga de página
    e.preventDefault(); 
    await guardarMovimiento("Ingreso", formIngreso); 
  });
}

// Guarda movimiento de salida
if (formSalida) { // al enviar el formulario de salida, guarda el movimiento
  formSalida.addEventListener("submit", async (e) => { // previene recarga de página
    e.preventDefault();
    await guardarMovimiento("Salida", formSalida);
  });
}

// Al llenar el campo de patrimonio en salida, busca el activo en Supabase y completa descripción, marca y modelo
if (Patrimonio_Salida) {  
  Patrimonio_Salida.addEventListener("blur", async (e) => {
    const patrimonio = e.target.value.trim(); 
    if (!patrimonio) return; // si el campo está vacío, no hace nada
    const { data, error } = await supabase.from("historial").select("descripcion,marca,modelo").eq("patrimonio", patrimonio).single(); 
    if (error || !data) {
      console.error(error);
      Swal.fire("Error al buscar patrimonio", error.message || "No se encontró el patrimonio", "error"); // notifica error
      return;
    }
    Descripcion_Activo.value = data.descripcion || "";
    Marca_Activo.value = data.marca || "";
    Modelo_Activo.value = data.modelo || "";
  });
}

// Delegación en la tabla de historial para Editar, Eliminar y Consultar detalle
if (tbodyHistorial) {
  tbodyHistorial.addEventListener("click", async (event) => {
    const target = event.target; 
    const id = target.getAttribute("data-id"); // id del registro (si existe)
    if (!id) return; // si no hay id, no hacemos nada

    // Eliminar: confirma y borra el registro en Supabase
    if (target.classList.contains("btnEliminar")) {
      const result = await Swal.fire({  // confirma eliminación con SweetAlert
        title: "¿Está seguro de eliminar este movimiento?",
        text: "Esta acción eliminara el movimiento",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });
      if (!result.isConfirmed) return; // si el usuario cancela, no hace nada
      const { error } = await supabase.from("historial").delete().eq("id", id); // delete en Supabase
      if (error) {
        console.error(error); // muestra error en consola
        Swal.fire("Error al eliminar", error.message || "", "error"); // notifica al usuario
        return;
      }
      Swal.fire("Movimiento eliminado"); // notifica éxito
      consultarHistorial(); // recarga tabla
      return;
    }
   // Consultar detalle: trae el registro y muestra un modal con la info
    if (target.classList.contains("btnConsultar")) {
      const { data, error } = await supabase.from("historial").select("*").eq("id", id).single(); // consulta por id
      if (error) {
        console.error(error);
        Swal.fire("Error al consultar detalle", error.message || "", "error");
        return;
      }

      // Construye el contenido del modal según el tipo de movimiento (Ingreso o Salida)
      let contenido = "";
      if (data.movimiento === "Ingreso") {
        contenido = `<p><b>Número de Oficio:</b> ${data.num_oficio || ""}</p>
                     <p><b>Marca:</b> ${data.marca || ""}</p>
                      <p><b>Modelo:</b> ${data.modelo || ""}</p>
                      <p><b>Serie:</b> ${data.serie || ""}</p>
                      <p><b>Licencia:</b> ${data.licencia || ""}</p>
                      <p><b>Ubicación:</b> ${data.ubicacion || ""}</p>
                      <p><b>Estado:</b> ${data.estado || ""}</p>
                      <p><b>Técnico que Registra:</b> ${data.tecnico_registra || ""}</p>
                      <p><b>Técnico que Entrega:</b> ${data.tecnico_entrega || ""}</p>
                      <p><b>Observaciones:</b> ${data.observaciones_ingreso || ""}</p>`;
      } else if (data.movimiento === "Salida") {
        contenido = `<p><b>Caso Asignado:</b> ${data.caso || ""}</p>
                <p><b>Técnico que Solicita:</b> ${data.tecnico_solicita || ""}</p>
                <p><b>Técnico que Entrega en Salida:</b> ${data.tecnico_salida || ""}</p>
                <p><b>Marca del Activo:</b> ${data.marca_activo || ""}</p>
                <p><b>Modelo:</b> ${data.modelo || ""}</p>
                <p><b>Condición al Entregar:</b> ${data.condicion_activo || ""}</p>
               <p><b>Observaciones:</b> ${data.observaciones_salida || ""}</p>`;
    }
      Swal.fire({  // muestra modal con detalle
        title: `Detalle - ${data.movimiento}`,
        html: contenido
      });
      return;
    }
    // Editar: carga los datos en el formulario y cambia el botón a "Actualizar"
    if (target.classList.contains("btnEditar")) {
      const { data, error } = await supabase.from("historial").select("*").eq("id", id).single(); // trae registro
      if (error) {
        console.error(error);
        Swal.fire("Error al cargar para editar", error.message || "", "error"); // notifica error
        return;
      }

      // Rellenar campos según el tipo de movimiento
        const campos = data.movimiento === "Ingreso" ? {
          Num_Oficio : "num_oficio",
          Descripcion: "descripcion",
          Marca: "marca",
          Serie: "serie",
          Modelo: "modelo",
          Patrimonio: "patrimonio",
          Licencia: "licencia",
          Ubicacion: "ubicacion",
          Estado: "estado",
          Fecha_Ingreso: "fecha_ingreso",
          Tecnico_Registra: "tecnico_registra",
          Tecnico_Entrega: "tecnico_entrega",
          Observaciones_Ingreso: "observaciones_ingreso"
        } : {
          Caso: "caso",
          Tecnico_Solicita: "tecnico_solicita",
          Tecnico_Salida: "tecnico_salida",
          Patrimonio_Salida: "patrimonio_salida",
          Descripcion_Activo: "descripcion_activo",
          Marca_Activo: "marca_activo",
          Modelo_Activo: "modelo_activo",
          Fecha_Salida: "fecha_salida",
          Condicion_Activo: "condicion_activo",
          Observaciones_Salida: "observaciones_salida"
        };

        // Construir el formulario dinámicamente para editar
        let htmlform = "";
        for (const [idCampo,campoBD] of Object.entries(campos)) {
          const valor = data[campoBD] || "";
          if (campoBD.includes("observaciones")) {
            htmlform += `<label for="${idCampo}">${campoBD}:</label><textarea id="${idCampo}" name="${idCampo}">${valor}</textarea>`;
            } else if (campoBD.includes("fecha")) {
              htmlform += `<label for="${idCampo}">${campoBD}:</label><input type="date" id="${idCampo}" name="${idCampo}" value="${valor}">`;
            } else {
              htmlform += `<label for="${idCampo}">${campoBD}:</label><input type="text" id="${idCampo}" name="${idCampo}" value="${valor}">`;
            }
        }

        // Muestra el modal con el formulario para editar
        Swal.fire({
          title: `Editar - ${data.movimiento}`,
          html: htmlform,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Actualizar",
          confirmButtonColor: "#28a745",
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Construir objeto con los nuevos valores
            const updateData = {};
            for (const [idCampo, campoBD] of Object.entries(campos)) {
              updateData[campoBD] = document.getElementById(idCampo).value.trim();
            }
            const { error: updateError } = await supabase.from("historial").update(updateData).eq("id", id); // actualiza en Supabase
            if (updateError) {
              Swal.fire("Error al actualizar", updateError.message || "", "error");
            } else {
              Swal.fire("Movimiento actualizado");  
            }
          }
          consultarHistorial(); // recarga tabla después de editar
        });
    }
  });
}

// Funciones CRUD
// Consultar y renderizar historial en la tabla
async function consultarHistorial() {
  try {
    const search = txtSearch ? txtSearch.value.trim() : ""; // texto de búsqueda
    let q = supabase
      .from("historial")
      .select(
        "id,movimiento,descripcion,descripcion_activo,patrimonio,patrimonio_salida,fecha_ingreso,fecha_salida,marca,marca_activo,modelo,modelo_activo,serie,licencia,ubicacion,estado,tecnico_registra,tecnico_entrega,observaciones_ingreso,caso,tecnico_solicita,tecnico_salida,condicion_activo,observaciones_salida"
      )
      .order("id", { ascending: false }); // orden descendente por id

    if (search) {
      // aplica filtro OR sobre varias columnas usando ilike (case-insensitive)
      q = q.or(
        `descripcion.ilike.%${search}%,descripcion_activo.ilike.%${search}%,patrimonio.ilike.%${search}%,patrimonio_salida.ilike.%${search}%`
      );
    }

    const { data, error } = await q; // ejecuta la consulta
    if (error) {
      console.error(error);
      Swal.fire("Error cargando historial", error.message || "", "error"); // muestra error
      return;
    }

    if (!tbodyHistorial) return; // si no existe la tabla, salir
    tbodyHistorial.innerHTML = ""; // limpia filas previas

    // Por cada registro crea una fila con botones de acción
    data.forEach((r, i) => {
      const activo = r.movimiento === "Ingreso" ? r.descripcion || "" : r.descripcion_activo || "";
      const fecha = r.movimiento === "Ingreso" ? r.fecha_ingreso || "" : r.fecha_salida || "";
      const patrimonio = r.patrimonio || r.patrimonio_salida || "";
      const marcaModelo = `${r.marca || r.marca_activo || ""} ${r.modelo || r.modelo_activo || ""}`.trim();

      const tr = document.createElement("tr"); // crea fila
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${activo}</td>
        <td>${patrimonio}</td>
        <td>${r.movimiento || ""}</td>
        <td>${fecha}</td>
        <td>
          <div class="detalle-buttons">
           <button class="btnEditar" data-id="${r.id}">Editar</button>
           <button class="btnEliminar" data-id="${r.id}">Eliminar</button>
           <button class="btnConsultar" data-id="${r.id}">Consultar</button>
          </div>
        </td>
      `; // inserta columnas y botones
      tbodyHistorial.appendChild(tr); // añade fila a la tabla
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Error inesperado al cargar historial", err.message || "", "error"); // error genérico
  }
}

// Guardar o actualizar movimiento (si txtId tiene valor actualiza, si no, inserta nuevo)
async function guardarMovimiento(tipo, formElement = null) {
  // Construye el objeto movimiento según el tipo (Ingreso o Salida)
  const movimiento =
    tipo === "Ingreso"
      ? {
          movimiento: "Ingreso",
          num_oficio: Num_Oficio ?.value.trim() ||"",
          descripcion: Descripcion ?.value.trim() || "",
          marca: Marca ?.value.trim() || "",
          serie: Serie ?.value.trim() || "",
          modelo: Modelo ?.value.trim() || "",
          patrimonio: Patrimonio ?.value.trim() || "",
          licencia: Licencia ?.value.trim() || "",
          ubicacion: Ubicacion ?.value.trim() || "",
          estado: Estado ?.value || "",
          fecha_ingreso: Fecha_Ingreso ?.value || "",
          tecnico_registra: Tecnico_Registra ?.value || "",
          tecnico_entrega: Tecnico_Entrega ?.value || "",
          observaciones_ingreso: Observaciones_Ingreso ?.value.trim() || ""
        }
      : {
          movimiento: "Salida",
          caso: Caso ?.value.trim() || "",
          tecnico_solicita: Tecnico_Solicita ?.value || "",
          tecnico_salida: Tecnico_Salida ?.value || "",
          patrimonio_salida: Patrimonio_Salida ?.value.trim() || "",
          descripcion_activo: Descripcion_Activo ?.value.trim() || "",
          marca_activo: Marca_Activo ?.value.trim() || "",
          modelo_activo: Modelo_Activo ?.value.trim() || "",
          fecha_salida: Fecha_Salida ?.value || "",
          condicion_activo: Condicion_Activo ?.value || "",
          observaciones_salida: Observaciones_Salida ?.value.trim() || ""
        };

  // Validaciones mínimas para evitar insertar datos incompletos
  if (tipo === "Ingreso" && !movimiento.descripcion) {
    Swal.fire("Complete la descripción del ingreso", "", "warning");
    return;
  }
  if (tipo === "Salida" && !movimiento.patrimonio_salida) {
    Swal.fire("Complete el patrimonio para la salida", "", "warning");
    return;
  }

  try {
    if (txtId && txtId.value) {
      // Si txtId tiene valor, actualizamos el registro existente
      const id = txtId.value;
      const { error } = await supabase.from("historial").update(movimiento).eq("id", id);
      if (error) {
        console.error(error);
        Swal.fire("Error actualizando movimiento", error.message || "", "error");
        return;
      }
      Swal.fire("Movimiento actualizado correctamente"); // notifica éxito
      formElement.reset(); // limpia formulario
      txtId.value = ""; // borra id oculto
      if (tipo === "Ingreso") {
        btnIngreso.textContent = "Registrar";
        formIngreso.querySelector(".form-title").textContent = "Agregar Ingreso"; // restaura texto del botón
      } else {
        btnSalida.textContent = "Registrar";
        formSalida.querySelector(".form-title").textContent = "Agregar Salida"; // restaura texto del botón
      }
      consultarHistorial(); // recarga tabla
    } else {
      // Si no hay txtId, insertamos un nuevo registro
      const { error } = await supabase.from("historial").insert([movimiento]);
      if (error) {
        console.error(error);
        Swal.fire("Error guardando movimiento", error.message || "", "error");
        return;
      }
      Swal.fire("Movimiento registrado correctamente"); // notifica éxito
      formElement.reset(); // limpia formulario
      consultarHistorial(); // recarga tabla
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error inesperado al guardar", err.message || "", "error"); // notifica error
  }
}

// Exponer funciones globales
// Permite llamar a estas funciones desde la consola
window.consultarHistorial = consultarHistorial;
window.guardarMovimiento = guardarMovimiento;
window.eliminarMovimiento = async (id) => {
  const result = await Swal.fire({
    title: "¿Está seguro de eliminar este movimiento?",
    text: "Esta acción eliminara el movimiento",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });
  if (!result.isConfirmed) return; // si el usuario cancela, no hace nada
  const { error } = await supabase.from("historial").delete().eq("id", id);
  if (error) {
    console.error(error);
    Swal.fire("Error al eliminar", error.message || "", "error"); // notifica error
    return;
  }
  Swal.fire("Movimiento eliminado"); // notifica éxito
  consultarHistorial();
};
window.consultarDetalle = async (id) => {
  const { data, error } = await supabase.from("historial").select("*").eq("id", id).single();
  if (error) {
    console.error(error);
    Swal.fire("Error al consultar detalle", error.message || "", "error"); // notifica error
    return;
  }
  const activo = data.movimiento === "Ingreso" ? data.descripcion : data.descripcion_activo;
  const patrimonio = data.movimiento === "Ingreso" ? data.patrimonio : data.patrimonio_salida;
  const fecha = data.movimiento === "Ingreso" ? data.fecha_ingreso : data.fecha_salida;
  const obs = data.movimiento === "Ingreso" ? data.observaciones_ingreso : data.observaciones_salida;
  Swal.fire({
    title: `Detalle - ${data.movimiento}`,
    html: `<p><b>Activo:</b> ${activo || ""}</p>
           <p><b>Patrimonio:</b> ${patrimonio || ""}</p>
           <p><b>Fecha:</b> ${fecha || ""}</p>
           <p><b>Observaciones:</b> ${obs || ""}</p>`
  });
};

// Manejo de sesión y login //
// Verifica si existe un usuario guardado en la sesión
const usuarioLogueado = sessionStorage.getItem("usuario");

// Si NO hay usuario redirige al login
if (!usuarioLogueado && window.location.pathname.includes("index.html")) {
  window.location.href = "login.html";
}

// Captura el formulario de login 
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // evita recargar la página

    const usuario = document.getElementById("usuario").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    // Credenciales únicas
    const USER = "SoporteBodega";
    const PASS = "Bodega2026";

    if (usuario === USER && contraseña === PASS) {
      // Guarda el usuario en la sesión
      sessionStorage.setItem("usuario", usuario);

      // Mensaje de éxito y redirección al sistema
      Swal.fire({
        icon: "success",
        title: "Acceso concedido",
        text: "Bienvenido al sistema"
      }).then(() => {
        window.location.href = "index.html";
      });
    } else {
      // Mensaje de error si las credenciales no coinciden
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Usuario o contraseña incorrectos"
      });
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