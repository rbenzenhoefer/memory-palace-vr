alter table public.loci add column is_portable boolean not null default false;

insert into public.loci (room_id, order_index, label, position, primitive, is_portable)
select r.id, v.o, v.label, v.pos::jsonb, v.prim::jsonb, true
from public.rooms r,
(values
 (0,'Neuron','[-3,0,-4]','{"shape":"sphere","color":"#5ec8ff"}'),
 (1,'Synapse','[3,0,-4]','{"shape":"torus","color":"#ff8a5e"}'),
 (2,'Hippocampus','[-3,0,1]','{"shape":"cylinder","color":"#9be15d"}'),
 (3,'Kortex','[3,0,1]','{"shape":"box","color":"#c58cff"}')
) as v(o,label,pos,prim)
where r.slug='neuro';

insert into public.cards (locus_id, front, back, extra)
select l.id, v.front, v.back, v.extra from public.loci l join public.rooms r on r.id=l.room_id
join (values
 ('Neuron','Was ist ein Neuron?','Eine Nervenzelle, die elektrische und chemische Signale weiterleitet.','Ca. 86 Mrd. im menschlichen Gehirn'),
 ('Synapse','Was ist eine Synapse?','Die Kontaktstelle zwischen zwei Neuronen, an der Signale übertragen werden.','Chemisch oder elektrisch'),
 ('Hippocampus','Funktion des Hippocampus?','Überführung von Kurzzeit- in Langzeitgedächtnis und räumliche Orientierung.',null),
 ('Kortex','Was ist der Kortex?','Die äußere Schicht des Großhirns, zuständig für höhere kognitive Funktionen.','2–4 mm dick')
) as v(label,front,back,extra) on v.label=l.label
where r.slug='neuro';

update public.loci set is_portable = true where room_id = (select id from public.rooms where slug='neuro');