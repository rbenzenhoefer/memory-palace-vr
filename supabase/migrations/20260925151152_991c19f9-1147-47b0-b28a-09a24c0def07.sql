WITH a AS (
  INSERT INTO public.assets (name, url, source, status, default_scale)
  VALUES ('Pyramidenneuron', 'https://ssyfeuywwtfqcahhaupn.supabase.co/storage/v1/object/public/models/Meshy_AI_pyramidal_neuron_3d_0925150550_image-to-3d-texture.glb', 'meshy', 'ready', 1)
  RETURNING id
), l AS (
  INSERT INTO public.loci (room_id, order_index, label, position, rotation, scale, asset_id, primitive, is_portable)
  SELECT r.id, 4, 'Pyramidenneuron', '[0,0,-2]'::jsonb, '[0,0,0]'::jsonb, 0.8, a.id, '{"shape":"sphere","color":"#5ec8ff"}'::jsonb, true
  FROM public.rooms r, a WHERE r.slug = 'neuro'
  RETURNING id
)
INSERT INTO public.cards (locus_id, front, back, extra, source)
SELECT l.id, 'Pyramidenzelle', 'Häufigster erregender Nervenzelltyp im Kortex, benannt nach dem pyramidenförmigen Zellkörper.', 'Apikaler Dendrit reicht bis in Schicht I.', 'manual' FROM l
UNION ALL
SELECT l.id, 'Wo findet man Pyramidenzellen?', 'Vor allem in Großhirnrinde, Hippocampus und Amygdala.', NULL, 'manual' FROM l;