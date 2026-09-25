update public.rooms
set layout = jsonb_set(
  jsonb_set(layout, '{depth}', '14'::jsonb),
  '{spawn}', '[0,0,5.2]'::jsonb
)
where slug = 'neuro';

update public.portals
set position = '[0,0,6.8]'::jsonb
where from_room_id = (select id from public.rooms where slug = 'neuro')
  and to_room_id = (select id from public.rooms where slug = 'home');