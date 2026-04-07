create table Inventario (
  id bigint generated always as identity primary key,
  movimiento text not null,          -- 'Ingreso' o 'Salida'

  -- Campos de Ingreso
  num_oficio text,
  descripcion text,
  marca text,
  modelo text,
  serie text,
  patrimonio text,
  licencia text,
  ubicacion text,
  estado text,
  fecha_ingreso date,
  tecnico_registra text,
  tecnico_entrega_ingreso text,
  observaciones_ingreso text,

  -- Campos de Salida
  caso text,
  tecnico_solicita text,
  tecnico_entrega_salida text,
  patrimonio_salida text,
  descripcion_activo text,
  marca_activo text,
  modelo_activo text,
  fecha_salida date,
  condicion_activo text,
  observaciones_salida text,

  -- Control general
  fecha_registro timestamp default now()
);