import * as dom from "./dom.js";
import { consultarHistorial, guardarMovimiento } from "./crud.js";
import { supabase } from "./supabase.js";



// Eventos 
// Recarga la tabla al hacer clic en el botón de cargar historial
if (dom.btnLoad) dom.btnLoad.addEventListener("click", () => consultarHistorial());

// Limpia la búsqueda y recarga la tabla
if (dom.btnClear) {
  dom.btnClear.addEventListener("click", async () => {
    if (dom.txtSearch) dom.txtSearch.value = ""; // borra texto de búsqueda
    await consultarHistorial(); // recarga tabla sin filtro
    Swal.fire("Búsqueda limpiada"); // notifica al usuario (SweetAlert)
  });
}

// Resetea formulario de ingreso
if (dom.btnCancelarIngreso) { 
  dom.btnCancelarIngreso.addEventListener("click", () => { // limpia formulario y notifica
    if (dom.formIngreso) dom.formIngreso.reset(); 
    if (dom.txtId) dom.txtId.value = ""; 
    Swal.fire("Formulario de ingreso cancelado"); // notifica al usuario (SweetAlert)
  });
}

// Resetea formulario de salida
if (dom.btnCancelarSalida) { // limpia formulario y notifica
  dom.btnCancelarSalida.addEventListener("click", () => {
    if (dom.formSalida) dom.formSalida.reset();
    if (dom.txtId) dom.txtId.value = "";
    Swal.fire("Formulario de salida cancelado"); // notifica al usuario (SweetAlert)
  });
}

// Guarda movimiento de ingreso
if (dom.formIngreso) { // al enviar el formulario de ingreso, guarda el movimiento
  dom.formIngreso.addEventListener("submit", async (e) => { // previene recarga de página
    e.preventDefault(); 
    await guardarMovimiento("Ingreso", dom.formIngreso); 
  });
}

// Guarda movimiento de salida
if (dom.formSalida) { // al enviar el formulario de salida, guarda el movimiento
  dom.formSalida.addEventListener("submit", async (e) => { // previene recarga de página
    e.preventDefault();
    await guardarMovimiento("Salida", dom.formSalida);
  });
}

// Al llenar el campo de patrimonio en salida, busca el activo en Supabase y completa descripción, marca y modelo
if (dom.Patrimonio_Salida) {  
  dom.Patrimonio_Salida.addEventListener("blur", async (e) => {
    const patrimonio = e.target.value.trim(); 
    if (!patrimonio) return; // si el campo está vacío, no hace nada
    const { data, error } = await supabase.from("ingreso").select("descripcion,marca,modelo").eq("patrimonio", patrimonio).single(); 
    if (error || !data) {
      Swal.fire("Error al buscar patrimonio", error.message || "No se encontró el patrimonio", "error"); // notifica error
      return;
    }
    dom.Descripcion_Activo.value = data.descripcion || "";
    dom.Marca_Activo.value = data.marca || "";
    dom.Modelo_Activo.value = data.modelo || "";
  });
}