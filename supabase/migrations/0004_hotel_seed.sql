-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Hotel — datos sembrados (realismo dominicano)
--  Idempotente: borra habitaciones demo (cascada a estadías/reportes).
-- ════════════════════════════════════════════════════════════════

delete from public.rooms where id in (
  'c0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000002',
  'c0000000-0000-4000-8000-000000000003',
  'c0000000-0000-4000-8000-000000000004',
  'c0000000-0000-4000-8000-000000000005',
  'c0000000-0000-4000-8000-000000000006',
  'c0000000-0000-4000-8000-000000000007',
  'c0000000-0000-4000-8000-000000000008'
);
-- Limpia eventos de hotel sembrados (para no duplicar en re-ejecución)
delete from public.pet_events where kind in ('hotel_checkin','hotel_checkout')
  and title like 'Llegada al hotel ·%';

-- ───────────────── Habitaciones ─────────────────
insert into public.rooms (id, name, type, capacity, price_per_night, notes) values
('c0000000-0000-4000-8000-000000000001','Suite Premium A','Suite',1,2400,'Climatizada, cámara en vivo'),
('c0000000-0000-4000-8000-000000000002','Suite Premium B','Suite',1,2400,'Climatizada, cámara en vivo'),
('c0000000-0000-4000-8000-000000000003','Suite Familiar','Familiar',2,3000,'Para dos mascotas de la misma familia'),
('c0000000-0000-4000-8000-000000000004','Estándar 1','Estándar',1,1200,null),
('c0000000-0000-4000-8000-000000000005','Estándar 2','Estándar',1,1200,null),
('c0000000-0000-4000-8000-000000000006','Estándar 3','Estándar',1,1200,null),
('c0000000-0000-4000-8000-000000000007','Estándar 4','Estándar',1,1200,null),
('c0000000-0000-4000-8000-000000000008','Estándar 5','Estándar',1,1200,'Cerca del área de juego');

-- ───────────────── Estadías ─────────────────
-- Activas hoy (alimentan "huéspedes en el hotel hoy")
insert into public.stays (id, pet_id, room_id, check_in, check_out, status, price_per_night, notes) values
('5a000000-0000-4000-8000-000000000001','0e000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001', current_date - 1, current_date + 2,'en_curso',2400,'Le encanta el aire acondicionado'),
('5a000000-0000-4000-8000-000000000002','0e000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000004', current_date - 2, current_date + 1,'en_curso',1200,null),
('5a000000-0000-4000-8000-000000000003','0e000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000005', current_date,     current_date + 3,'en_curso',1200,'Check-in hoy'),
('5a000000-0000-4000-8000-000000000004','0e000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000003', current_date - 1, current_date + 4,'en_curso',3000,'Suite familiar'),
-- Reserva futura
('5a000000-0000-4000-8000-000000000005','0e000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000006', current_date + 6, current_date + 9,'reservada',1200,'Tras recuperación post-operatoria'),
-- Historial (finalizadas)
('5a000000-0000-4000-8000-000000000006','0e000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000002', current_date - 120, current_date - 118,'finalizada',2400,null),
('5a000000-0000-4000-8000-000000000007','0e000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000004', current_date - 15,  current_date - 8,'finalizada',1200,null),
('5a000000-0000-4000-8000-000000000008','0e000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000005', current_date - 40,  current_date - 37,'finalizada',1200,null);

-- ───────────────── Eventos en la línea de tiempo (organismo) ─────────────────
insert into public.pet_events (pet_id, kind, title, description, amount, occurred_at) values
('0e000000-0000-4000-8000-000000000003','hotel_checkin','Llegada al hotel · Suite Premium A','Estadía de 3 noches',7200, current_date - 1),
('0e000000-0000-4000-8000-000000000004','hotel_checkin','Llegada al hotel · Estándar 1','Estadía de 3 noches',3600, current_date - 2),
('0e000000-0000-4000-8000-000000000006','hotel_checkin','Llegada al hotel · Estándar 2','Estadía de 3 noches',3600, current_date),
('0e000000-0000-4000-8000-000000000007','hotel_checkin','Llegada al hotel · Suite Familiar','Estadía de 5 noches',15000, current_date - 1);

-- ───────────────── Reportes diarios (tarjetas postales de hoy) ─────────────────
insert into public.daily_reports (stay_id, pet_id, report_date, mood, message, activities) values
('5a000000-0000-4000-8000-000000000001','0e000000-0000-4000-8000-000000000003', current_date,
 'Feliz y juguetón 🐕','¡Rocky comió excelente y jugó toda la tarde en el área verde! Se portó como todo un campeón.',
 '["Paseo matutino","Juego en el área de juego","Premio por buen comportamiento","Siesta en su suite"]'::jsonb),
('5a000000-0000-4000-8000-000000000002','0e000000-0000-4000-8000-000000000004', current_date,
 'Tranquila y consentida 🛁','Coco durmió plácidamente y disfrutó muchísimo su baño de la tarde. Está relajada y feliz.',
 '["Baño aromático","Cepillado","Paseo corto","Mucho cariño"]'::jsonb),
('5a000000-0000-4000-8000-000000000003','0e000000-0000-4000-8000-000000000006', current_date,
 'Adaptándose con cariño 🐶','Toby llegó un poco tímido, pero ya hizo amigos y comió muy bien. ¡Mañana jugará aún más!',
 '["Recibimiento","Reconocimiento del área","Primera comida","Juego suave"]'::jsonb),
('5a000000-0000-4000-8000-000000000004','0e000000-0000-4000-8000-000000000007', current_date,
 'Pequeña con mucha energía ⚡','Nina no paró de jugar en todo el día. Pequeña pero valiente, ya es la consentida del personal.',
 '["Paseo","Juego con pelota","Sesión de fotos","Descanso en suite familiar"]'::jsonb);
