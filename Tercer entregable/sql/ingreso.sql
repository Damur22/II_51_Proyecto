create table public.ingreso (
  id bigint generated always as identity not null,
  movimiento text null,
  num_oficio text null,
  descripcion text null,
  marca text null,
  modelo text null,
  serie text null,
  patrimonio text null,
  licencia text null,
  ubicacion text null,
  estado text null,
  fecha_ingreso date null,
  tecnico_registra text null,
  tecnico_entrega text null,
  observaciones_ingreso text null,
  fecha_registro timestamp without time zone null default now(),
  constraint ingreso_pkey primary key (id)
) TABLESPACE pg_default;