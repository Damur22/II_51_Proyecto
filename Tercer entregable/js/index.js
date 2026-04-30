// index.js
// Archivo principal del sistema
// Aquí se importan Supabase y los módulos separados (DOM, CRUD, eventos, autenticación,historial)

// Importa el cliente de Supabase (configurado en supabase.js)
import { supabase } from "./supabase.js";

// Importa todas las referencias al DOM centralizadas en dom.js
import * as dom from "./dom.js";

// Importa las funciones principales de CRUD (consultar, guardar, etc.)
import { consultarHistorial, guardarMovimiento } from "./crud.js";

// Importa la delegación de la tabla historial
import "./historial.js";


// Importa el manejo de eventos (botones, formularios, etc.)
import "./eventos.js";

// Importa el módulo de autenticación (registro y login)
import "./auth.js";

// Inicialización del sistema
// Al cargar la ventana, se ejecuta la consulta inicial del historial
window.onload = () => {
  consultarHistorial();
};