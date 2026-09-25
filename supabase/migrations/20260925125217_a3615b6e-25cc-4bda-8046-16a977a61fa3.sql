-- Seed rooms
INSERT INTO public.rooms (slug, title, description, is_home, theme, layout, source) VALUES
  ('home', 'Eingangshalle', 'Die zentrale Eingangshalle des Memory Palace.', true,
   '{"floorColor":"#d8cfc0","wallColor":"#f3efe6","accentColor":"#c9a227","skyColor":"#1b2233"}'::jsonb,
   '{"width":14,"depth":14,"height":5,"spawn":[0,0,4]}'::jsonb,
   'manual'),
  ('neuro', 'Neuro-Raum', 'Der Raum für Neurowissenschaft-Loci.', false,
   '{"floorColor":"#1e2433","wallColor":"#2b3350","accentColor":"#5ec8ff","skyColor":"#0b0f1a"}'::jsonb,
   '{"width":12,"depth":16,"height":4.5,"spawn":[0,0,6]}'::jsonb,
   'manual')
ON CONFLICT (slug) DO NOTHING;

-- Seed portals (home -> neuro, neuro -> home)
INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT r1.id, r2.id,
       '[-6.8,0,0]'::jsonb,
       '[0,1.5708,0]'::jsonb,
       'Neurowissenschaft'
FROM public.rooms r1, public.rooms r2
WHERE r1.slug = 'home' AND r2.slug = 'neuro'
ON CONFLICT DO NOTHING;

INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT r1.id, r2.id,
       '[0,0,7.8]'::jsonb,
       '[0,3.1416,0]'::jsonb,
       'Zurück zur Halle'
FROM public.rooms r1, public.rooms r2
WHERE r1.slug = 'neuro' AND r2.slug = 'home'
ON CONFLICT DO NOTHING;