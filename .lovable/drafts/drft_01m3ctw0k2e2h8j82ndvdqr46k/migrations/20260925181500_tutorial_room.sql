INSERT INTO public.rooms (slug, title, description, is_home, theme, layout, source)
VALUES ('tutorial', 'Akademie der Erinnerung', 'Ein geführter Trainingsraum für Loci und mentale Routen.', false,
  '{"floorColor":"#17242d","wallColor":"#243842","accentColor":"#55d6d0","skyColor":"#0d171f"}'::jsonb,
  '{"width":12,"depth":12,"height":4.5,"spawn":[0,0,4.8]}'::jsonb, 'manual')
ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, theme=EXCLUDED.theme, layout=EXCLUDED.layout;

INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT a.id, b.id, '[3,0,6.8]'::jsonb, '[0,3.1416,0]'::jsonb, 'Zur Akademie'
FROM public.rooms a JOIN public.rooms b ON b.slug='tutorial' WHERE a.slug='home'
AND NOT EXISTS (SELECT 1 FROM public.portals p WHERE p.from_room_id=a.id AND p.to_room_id=b.id);

INSERT INTO public.portals (from_room_id, to_room_id, position, rotation, label)
SELECT a.id, b.id, '[0,0,5.8]'::jsonb, '[0,3.1416,0]'::jsonb, 'Zurück ins Wohnzimmer'
FROM public.rooms a JOIN public.rooms b ON b.slug='home' WHERE a.slug='tutorial'
AND NOT EXISTS (SELECT 1 FROM public.portals p WHERE p.from_room_id=a.id AND p.to_room_id=b.id);

INSERT INTO public.loci (room_id, order_index, label, position, rotation, scale, asset_id, primitive, is_portable)
SELECT tutorial.id, source.order_index, source.label,
  CASE source.label WHEN 'Neuron' THEN '[-4.2,0,-4.6]'::jsonb WHEN 'Synapse' THEN '[-1.4,0,-4.6]'::jsonb WHEN 'Hippocampus' THEN '[1.4,0,-4.6]'::jsonb ELSE '[4.2,0,-4.6]'::jsonb END,
  source.rotation, source.scale, source.asset_id, source.primitive, true
FROM public.loci source JOIN public.rooms neuro ON neuro.id=source.room_id AND neuro.slug='neuro' CROSS JOIN public.rooms tutorial
WHERE tutorial.slug='tutorial' AND source.label IN ('Neuron','Synapse','Hippocampus','Kortex')
AND NOT EXISTS (SELECT 1 FROM public.loci existing WHERE existing.room_id=tutorial.id AND existing.label=source.label);

INSERT INTO public.cards (locus_id, front, back, extra, source, external_id)
SELECT target.id, source_card.front, source_card.back, source_card.extra, source_card.source, source_card.external_id
FROM public.loci target JOIN public.rooms tutorial ON tutorial.id=target.room_id AND tutorial.slug='tutorial'
JOIN public.loci source_locus ON source_locus.label=target.label JOIN public.rooms neuro ON neuro.id=source_locus.room_id AND neuro.slug='neuro'
JOIN public.cards source_card ON source_card.locus_id=source_locus.id
WHERE target.label IN ('Neuron','Synapse','Hippocampus','Kortex')
AND NOT EXISTS (SELECT 1 FROM public.cards existing WHERE existing.locus_id=target.id AND existing.front=source_card.front);