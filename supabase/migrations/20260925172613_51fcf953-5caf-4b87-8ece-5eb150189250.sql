INSERT INTO public.rooms (slug, title, description, is_home, theme, layout, source)
VALUES (
  'warehouse',
  'WarehouseRoom',
  'Ein leerer, heller Lagerraum für zukünftige Erinnerungsobjekte.',
  false,
  '{"floorColor":"#707477","wallColor":"#c7c9c8","accentColor":"#d49b35","skyColor":"#9da2a3"}'::jsonb,
  '{"width":8,"depth":12,"height":4,"spawn":[0,0,4]}'::jsonb,
  'manual'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_home = EXCLUDED.is_home,
  theme = EXCLUDED.theme,
  layout = EXCLUDED.layout,
  source = EXCLUDED.source;

INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT source_room.id, target_room.id, '[-3,0,6.8]'::jsonb, '[0,3.1416,0]'::jsonb, 'Zum Lagerraum'
FROM public.rooms source_room
JOIN public.rooms target_room ON target_room.slug = 'warehouse'
WHERE source_room.slug = 'home'
  AND NOT EXISTS (
    SELECT 1 FROM public.portals p
    WHERE p.from_room_id = source_room.id AND p.to_room_id = target_room.id
  );

INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT source_room.id, target_room.id, '[0,0,5.8]'::jsonb, '[0,3.1416,0]'::jsonb, 'Zurück zur Eingangshalle'
FROM public.rooms source_room
JOIN public.rooms target_room ON target_room.slug = 'home'
WHERE source_room.slug = 'warehouse'
  AND NOT EXISTS (
    SELECT 1 FROM public.portals p
    WHERE p.from_room_id = source_room.id AND p.to_room_id = target_room.id
  );