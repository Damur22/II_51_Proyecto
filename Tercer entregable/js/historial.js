import { supabase } from "./supabase.js";
import * as dom from "./dom.js";
import { consultarHistorial } from "./crud.js";

// Delegación en la tabla de historial para Editar, Eliminar y Consultar detalle
if (dom.tbodyHistorial) {
  dom.tbodyHistorial.addEventListener("click", async (event) => {
    const target = event.target; 
    const id = target.getAttribute("data-id"); // id del registro (si existe)
    const tipo = target.getAttribute("data-tipo"); 
    if (!id || !tipo) return; // si no hay id, no hacemos nada
    const tabla = tipo === "Ingreso" ? "ingreso" : "salida"; // determina tabla según tipo

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
      const { error } = await supabase.from(tabla).delete().eq("id", id); // delete en Supabase
      if (error) {
        Swal.fire("Error al eliminar", error.message || "", "error"); // notifica al usuario
        return;
      }
      Swal.fire("Movimiento eliminado"); // notifica éxito
      consultarHistorial(); // recarga tabla
      return;
    }
   // Consultar detalle: trae el registro y muestra un modal con la info
    if (target.classList.contains("btnConsultar")) {
      const { data, error } = await supabase.from(tabla).select("*").eq("id", id).single(); // consulta por id
      if (error) {
        Swal.fire("Error al consultar detalle", error.message || "", "error");
        return;
      }

      // Construye el contenido del modal según el tipo de movimiento (Ingreso o Salida)
      let contenido = "";
      if (tipo === "Ingreso") {
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
      } else {
        contenido = `<p><b>Caso Asignado:</b> ${data.caso || ""}</p>
                <p><b>Técnico que Solicita:</b> ${data.tecnico_salida || ""}</p>
                <p><b>Técnico que Entrega en Salida:</b> ${data.tecnico_entrega || ""}</p>
                <p><b>Marca del Activo:</b> ${data.marca_activo || ""}</p>
                <p><b>Modelo:</b> ${data.modelo || ""}</p>
                <p><b>Condición al Entregar:</b> ${data.condicion_activo || ""}</p>
               <p><b>Observaciones:</b> ${data.observaciones_salida || ""}</p>`;
    }
      Swal.fire({  // muestra modal con detalle
        title: `Detalle - ${tipo}`,
        html: contenido
      });
      return;
    }
    // Editar: carga los datos en el formulario y cambia el botón a "Actualizar"
    if (target.classList.contains("btnEditar")) {
      const { data, error } = await supabase.from(tabla).select("*").eq("id", id).single(); // trae registro
      if (error) {
        Swal.fire("Error al cargar para editar", error.message || "", "error"); // notifica error
        return;
      }

      // Rellenar campos según el tipo de movimiento
        const campos = tipo === "Ingreso" ? {
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
          Tecnico_Salida: "tecnico_salida",
          Tecnico_Entrega: "tecnico_entrega",
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
          title: `Editar - ${tipo}`,
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
            const tabla = tipo === "Ingreso" ? "ingreso" : "salida"; // determina tabla según tipo
            const { error: updateError } = await supabase.from(tabla).update(updateData).eq("id", id); // actualiza en Supabase
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
