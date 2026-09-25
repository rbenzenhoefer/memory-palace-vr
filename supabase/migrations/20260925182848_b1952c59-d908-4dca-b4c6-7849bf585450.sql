INSERT INTO public.rooms (slug,title,description,is_home,theme,layout,source) VALUES
('scanned','ScannedRoom','Echter Polycam-Raumscan',false,
 '{"floorColor":"#6b6b6b","wallColor":"#bdbdbd","accentColor":"#7fd1ff","skyColor":"#101418","scanUrl":"https://ssyfeuywwtfqcahhaupn.supabase.co/storage/v1/object/public/room-scans/25.9.2026.glb"}',
 '{"width":4.3,"depth":5.8,"height":2.75,"spawn":[0,0,1.6]}','manual')
ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, theme=EXCLUDED.theme, layout=EXCLUDED.layout;

INSERT INTO public.portals (from_room_id,to_room_id,position,rotation,label)
SELECT f.id,t.id,'[0,0,-5.85]','[0,0,0]','Zum gescannten Raum'
FROM public.rooms f, public.rooms t WHERE f.slug='warehouse' AND t.slug='scanned'
AND NOT EXISTS (SELECT 1 FROM public.portals p WHERE p.from_room_id=f.id AND p.to_room_id=t.id);

INSERT INTO public.portals (from_room_id,to_room_id,position,rotation,label)
SELECT f.id,t.id,'[0,0,2.6]','[0,3.1416,0]','Zurück zum Lagerraum'
FROM public.rooms f, public.rooms t WHERE f.slug='scanned' AND t.slug='warehouse'
AND NOT EXISTS (SELECT 1 FROM public.portals p WHERE p.from_room_id=f.id AND p.to_room_id=t.id);