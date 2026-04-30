import { supabase } from "./supabase.js";
import * as dom from "./dom.js";

// Funciones CRUD
// Consultar y renderizar historial en la tabla
 export async function consultarHistorial() {
  try {
    const search = dom.txtSearch ? dom.txtSearch.value.trim() : ""; // texto de búsqueda
    // Consulta Ingresos
    let qIngreso = supabase
      .from("ingreso")
      .select("*")
      .order("id", { ascending: false }); // orden descendente por id

    if (search) {
      // aplica filtro OR sobre varias columnas usando ilike (case-insensitive)
      qIngreso = qIngreso.or(
        `descripcion.ilike.%${search}%,patrimonio.ilike.%${search}%`
      );
    }

    const { data: ingresos, error: errorIngreso } = await qIngreso; // ejecuta la consulta
    if (errorIngreso) {
      Swal.fire("Error cargando ingresos", errorIngreso.message || "", "error"); // muestra error
      return;
    }
    // Consulta Salidas
    let qSalida = supabase
      .from("salida")
      .select("*")
      .order("id", { ascending: false }); // orden descendente por id

    if (search) {
      // aplica filtro OR sobre varias columnas usando ilike (case-insensitive)
      qSalida = qSalida.or(
        `descripcion_activo.ilike.%${search}%,patrimonio_salida.ilike.%${search}%`
      );
    }

    const { data: salidas, error: errorSalida } = await qSalida; // ejecuta la consulta
    if (errorSalida) {
      Swal.fire("Error cargando salidas", errorSalida.message || "", "error"); // muestra error
      return;
    }

    if (!dom.tbodyHistorial) return; // si no existe la tabla, salir
    dom.tbodyHistorial.innerHTML = ""; // limpia filas previas

    // Por cada registro crea una fila con botones de acción
    ingresos.forEach((r, i) => {
      const tr = document.createElement("tr"); // crea fila
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.descripcion || ""}</td>
        <td>${r.patrimonio || ""}</td>
        <td>${r.movimiento || ""}</td>
        <td>${r.fecha_ingreso || ""}</td>
        <td>
          <div class="detalle-buttons">
           <button class="btnEditar" data-id="${r.id}" data-tipo="Ingreso">Editar</button>
           <button class="btnEliminar" data-id="${r.id}" data-tipo="Ingreso">Eliminar</button>
           <button class="btnConsultar" data-id="${r.id}" data-tipo="Ingreso">Consultar</button>
          </div>
        </td>
      `; // inserta columnas y botones
      dom.tbodyHistorial.appendChild(tr); // añade fila a la tabla
    });

    salidas.forEach((r, i) => {
      const tr = document.createElement("tr"); // crea fila
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${r.descripcion_activo || ""}</td>
        <td>${r.patrimonio_salida || ""}</td>
        <td>${r.movimiento || ""}</td>
        <td>${r.fecha_salida || ""}</td>
        <td>
          <div class="detalle-buttons">
           <button class="btnEditar" data-id="${r.id}" data-tipo="Salida">Editar</button>
           <button class="btnEliminar" data-id="${r.id}" data-tipo="Salida">Eliminar</button>
           <button class="btnConsultar" data-id="${r.id}" data-tipo="Salida">Consultar</button>
          </div>
        </td>
      `; // inserta columnas y botones
      dom.tbodyHistorial.appendChild(tr); // añade fila a la tabla
    });
  } catch (err) {
    Swal.fire("Error inesperado al cargar historial", err.message || "", "error"); // error genérico
  }
}

// Guardar o actualizar movimiento (si txtId tiene valor actualiza, si no, inserta nuevo)
export async function guardarMovimiento(tipo, formElement = null) {
  // Construye el objeto movimiento según el tipo (Ingreso o Salida)
  const movimiento =
    tipo === "Ingreso"
      ? {
          movimiento: "Ingreso",
          num_oficio: dom.Num_Oficio ?.value.trim() || "",
          descripcion: dom.Descripcion ?.value.trim() || "",
          marca: dom.Marca ?.value.trim() || "",
          serie: dom.Serie ?.value.trim() || "",
          modelo: dom.Modelo ?.value.trim() || "",
          patrimonio: dom.Patrimonio ?.value.trim() || "",
          licencia: dom.Licencia ?.value.trim() || "",
          ubicacion: dom.Ubicacion ?.value.trim() || "",
          estado: dom.Estado ?.value || "",
          fecha_ingreso: dom.Fecha_Ingreso ?.value || "",
          tecnico_registra: dom.Tecnico_Registra ?.value || "",
          tecnico_entrega: dom.Tecnico_Entrega ?.value || "",
          observaciones_ingreso: dom.Observaciones_Ingreso ?.value.trim() || ""
        }
      : {
          movimiento: "Salida",
          caso: dom.Caso ?.value.trim() || "",
          tecnico_salida: dom.Tecnico_Salida ?.value || "",
          tecnico_entrega: dom.Tecnico_Entrega ?.value || "",
          patrimonio_salida: dom.Patrimonio_Salida ?.value.trim() || "",
          descripcion_activo: dom.Descripcion_Activo ?.value.trim() || "",
          marca_activo: dom.Marca_Activo ?.value.trim() || "",
          modelo_activo: dom.Modelo_Activo ?.value.trim() || "",
          fecha_salida: dom.Fecha_Salida ?.value || "",
          condicion_activo: dom.Condicion_Activo ?.value || "",
          observaciones_salida: dom.Observaciones_Salida ?.value.trim() || ""
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
  const tabla = tipo === "Ingreso" ? "ingreso" : "salida"; // determina tabla según tipo

  try {
    if (dom.txtId && dom.txtId.value) {
      // Si txtId tiene valor, actualizamos el registro existente
      const id = dom.txtId.value;
      const { error } = await supabase.from(tabla).update(movimiento).eq("id", id);
      if (error) {
        Swal.fire("Error actualizando movimiento", error.message || "", "error");
        return;
      }
      Swal.fire("Movimiento actualizado correctamente"); // notifica éxito
      formElement.reset(); // limpia formulario
      dom.txtId.value = ""; // borra id oculto
      consultarHistorial(); // recarga tabla
    } else {
      // Si no hay txtId, insertamos un nuevo registro
      const { error } = await supabase.from(tabla).insert([movimiento]);
      if (error) {
        Swal.fire("Error guardando movimiento", error.message || "", "error");
        return;
      }
      Swal.fire("Movimiento registrado correctamente"); // notifica éxito
      formElement.reset(); // limpia formulario
      consultarHistorial(); // recarga tabla
    }
  } catch (err) {
    Swal.fire("Error inesperado al guardar", err.message || "", "error"); // notifica error
  }
}

// Exponer funciones globales
// Permite llamar a estas funciones desde la consola
export async function consultarDetalle(id, tipo) {
    const tabla = tipo === "Ingreso" ? "ingreso" : "salida"; // determina tabla según tipo
    const { data, error } = await supabase.from(tabla).select("*").eq("id", id).single(); // consulta el registro por id
    if (error) {
        Swal.fire("Error consultando detalle", error.message || "", "error"); // notifica error
        return;
    }
  let activo,patrimonio,fecha,obs;
  if (tipo === "Ingreso") {
    activo = data.descripcion || "";
    patrimonio = data.patrimonio || "";
    fecha = data.fecha_ingreso || "";
    obs = data.observaciones_ingreso || "";
  } else if (tipo === "Salida") {
    activo = data.descripcion_activo || "";
    patrimonio = data.patrimonio_salida || "";
    fecha = data.fecha_salida || "";
    obs = data.observaciones_salida || "";
  }
  Swal.fire({
    title: `Detalle - ${data.movimiento}`,
    html: `<p><b>Activo:</b> ${activo || ""}</p>
           <p><b>Patrimonio:</b> ${patrimonio || ""}</p>
           <p><b>Fecha:</b> ${fecha || ""}</p>
           <p><b>Observaciones:</b> ${obs || ""}</p>`
  });
};