create table public.salida (
  id bigint generated always as identity not null,
  movimiento text null,
  caso text null,
  tecnico_salida text null,
  tecnico_entrega text null,
  patrimonio_salida text null,
  descripcion_activo text null,
  marca_activo text null,
  modelo_activo text null,
  fecha_salida date null,
  condicion_activo text null,
  observaciones_salida text null,
  fecha_registro timestamp without time zone null default now(),
  constraint salida_pkey primary key (id)
) TABLESPACE pg_default;