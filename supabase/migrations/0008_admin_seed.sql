-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Administración — datos sembrados (RD$, NCF, etc.)
--  Idempotente: limpia las tablas admin y reinserta.
-- ════════════════════════════════════════════════════════════════

truncate table public.employees, public.inventory_items, public.expenses,
  public.invoices, public.whatsapp_log, public.audit_log, public.backups;

-- ───────────────── Empleados ─────────────────
insert into public.employees (full_name, role, area, cedula, phone, email, salary, hired_on, vacation_total, vacation_taken) values
('Dra. Carolina Polanco','Veterinaria','Clínica','031-0112233-4','809-555-2001','c.polanco@clinicanido.do',95000,'2019-04-01',14,4),
('Dr. Manuel Castillo','Veterinario','Clínica','001-2233445-6','829-555-2002','m.castillo@clinicanido.do',90000,'2020-02-15',14,2),
('Yardel Jiménez','Groomer','Peluquería','402-1122334-5','849-555-2003','y.jimenez@clinicanido.do',38000,'2021-06-10',14,6),
('Massiel Reyes','Groomer','Peluquería','031-5566778-9','809-555-2004','m.reyes@clinicanido.do',36000,'2022-01-20',14,3),
('Pedro Encarnación','Cuidador','Hotel','001-9988776-5','829-555-2005','p.encarnacion@clinicanido.do',32000,'2021-09-05',14,8),
('Rosanna Méndez','Recepción','General','402-3344556-7','849-555-2006','r.mendez@clinicanido.do',30000,'2020-11-11',14,5),
('Frank Disla','Administración','General','001-1212121-2','809-555-2007','f.disla@clinicanido.do',70000,'2019-03-01',14,0);

-- ───────────────── Inventario (medicamentos, vacunas, productos, insumos) ─────────────────
insert into public.inventory_items (name, category, unit, stock, min_stock, price, expiry_date, supplier) values
('Amoxicilina 250mg','Medicamento','tableta',40,20,18,'2026-12-15','FarmaVet RD'),
('Meloxicam 1.5mg','Medicamento','tableta',8,15,25,'2026-09-10','FarmaVet RD'),
('Metoclopramida iny.','Medicamento','ampolla',25,10,40,'2027-01-20','Distribuidora Canina'),
('Ivermectina','Medicamento','frasco',12,10,160,'2026-08-05','FarmaVet RD'),
('Vacuna Rabia','Vacuna','dosis',30,15,250,'2026-07-10','Zoetis RD'),
('Vacuna Parvovirus','Vacuna','dosis',6,12,300,'2026-10-01','Zoetis RD'),
('Vacuna Moquillo','Vacuna','dosis',18,12,300,'2026-11-15','Zoetis RD'),
('Vacuna Séxtuple','Vacuna','dosis',22,15,450,'2027-02-01','Zoetis RD'),
('Shampoo hipoalergénico','Producto','botella',14,8,650,null,'PetCare SRL'),
('Antipulgas (pipeta)','Producto','pipeta',9,10,520,'2027-03-01','PetCare SRL'),
('Shampoo blanco brillo','Producto','botella',20,8,580,null,'PetCare SRL'),
('Jeringas 5ml','Insumo','unidad',200,100,12,null,'MediSupply'),
('Gasas estériles','Insumo','paquete',50,60,90,null,'MediSupply'),
('Guantes nitrilo','Insumo','caja',35,20,420,null,'MediSupply');

-- ───────────────── Facturas con NCF (B01/B02, ITBIS 18%) ─────────────────
insert into public.invoices (ncf, ncf_type, customer_name, customer_rnc, area, subtotal, itbis, total, status, items, issued_at)
select
  (case when g % 5 = 0 then 'B01' else 'B02' end) || lpad((10000 + g)::text, 8, '0'),
  case when g % 5 = 0 then 'B01' else 'B02' end,
  (array['Carlos Rodríguez','María Pérez','José Santos','Ana Díaz','Rosa Fernández','Luis Mateo','Cliente de Contado'])[1 + (g % 7)],
  case when g % 5 = 0 then '1-30-' || lpad((10000 + g)::text,5,'0') || '-1' else null end,
  area,
  sub,
  round(sub * 0.18, 2),
  round(sub * 1.18, 2),
  'pagada',
  jsonb_build_array(jsonb_build_object('descripcion', label, 'cantidad', 1, 'precio', sub)),
  now() - ((g % 34) || ' days')::interval - ((g * 5 % 9) || ' hours')::interval
from (
  select g,
    (array['Clínica','Hotel','Peluquería'])[1 + (g % 3)] as area,
    (array['Consulta y tratamiento','Estadía en hotel','Servicio de peluquería'])[1 + (g % 3)] as label,
    (700 + (g * 137 % 19) * 250)::numeric as sub
  from generate_series(0, 41) as g
) s;

-- ───────────────── Gastos ─────────────────
-- Fijos del mes
insert into public.expenses (category, area, description, amount, spent_on) values
('Nómina','General','Nómina quincenal del equipo',196000, current_date - 15),
('Nómina','General','Nómina quincenal del equipo',196000, current_date - 1),
('Alquiler','General','Alquiler del local',85000, current_date - 5),
('Servicios','General','Electricidad (EDE)',28000, current_date - 7),
('Servicios','General','Agua y basura',6500, current_date - 7),
('Marketing','General','Campaña en redes sociales',15000, current_date - 12);
-- Insumos variables
insert into public.expenses (category, area, description, amount, spent_on)
select 'Insumos',
  (array['Clínica','Hotel','Peluquería'])[1 + (g % 3)],
  (array['Compra de medicamentos','Alimento para huéspedes','Productos de grooming','Material médico'])[1 + (g % 4)],
  (1500 + (g * 211 % 12) * 600)::numeric,
  current_date - (g * 3 % 30)
from generate_series(0, 11) as g;

-- ───────────────── Bitácora WhatsApp ─────────────────
insert into public.whatsapp_log (to_name, to_phone, message, kind, sent_at) values
('María Pérez','829-555-0173','Recordatorio: cita de Luna para baño mañana 1:00 PM','recordatorio', now() - interval '2 hour'),
('Rosa Fernández','829-555-0156','Reporte del día de Bella: comió bien y jugó toda la tarde 🐕','reporte', now() - interval '5 hour'),
('Ana Díaz','809-555-0188','Su factura B0200010002 por RD$ 1,416 está disponible','factura', now() - interval '1 day'),
('Luis Mateo','849-555-0134','¡Feliz cumpleaños a Toby! 🎂 De parte de Clínica Nido','cumpleaños', now() - interval '1 day'),
('Carlos Rodríguez','809-555-0142','Recordatorio: vacuna de Max (refuerzo) próxima semana','recordatorio', now() - interval '2 day'),
('José Santos','849-555-0119','Rocky terminó su grooming, ya puede pasar a recogerlo ✂️','reporte', now() - interval '2 day'),
('María Pérez','829-555-0173','Reporte del día de Luna en el hotel 🏨','reporte', now() - interval '3 day'),
('Rosa Fernández','829-555-0156','Recordatorio: control post-operatorio de Bella','recordatorio', now() - interval '4 day');

-- ───────────────── Auditoría ─────────────────
insert into public.audit_log (actor, action, entity, detail, created_at) values
('Dra. Polanco','Registró consulta','Clínica','Bella · herida en pata', now() - interval '40 minute'),
('Rosanna Méndez','Creó cliente','CRM','Nuevo dueño registrado', now() - interval '2 hour'),
('Yardel Jiménez','Inició servicio','Peluquería','Coco · corte de raza', now() - interval '3 hour'),
('Pedro Encarnación','Check-in hotel','Hotel','Toby · Estándar 2', now() - interval '5 hour'),
('Frank Disla','Generó factura','Facturación','B0200010005', now() - interval '6 hour'),
('Admin Nido','Forzó respaldo','Sistema','Respaldo manual completado', now() - interval '8 hour'),
('Rosanna Méndez','Editó inventario','Inventario','Ajuste de stock: Vacuna Rabia', now() - interval '1 day'),
('Dr. Castillo','Registró hospitalización','Clínica','Luna · gastroenteritis', now() - interval '1 day'),
('Massiel Reyes','Subió antes/después','Peluquería','Toby · transformación', now() - interval '1 day'),
('Frank Disla','Procesó nómina','Nómina','Quincena pagada', now() - interval '1 day');

-- ───────────────── Respaldos ─────────────────
insert into public.backups (status, size_mb, created_at) values
('completado', 48.2, now() - interval '8 hour'),
('completado', 47.9, now() - interval '1 day 8 hour'),
('completado', 47.1, now() - interval '2 day 8 hour');
