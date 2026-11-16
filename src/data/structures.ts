export type StructureId =
  | 'cornea'
  | 'iris'
  | 'pupila'
  | 'cristalino'
  | 'retina'
  | 'esclerotica'
  | 'coroides'
  | 'nervio'
  | 'acuoso'
  | 'vitreo';

export type StructureKind = 'Capa externa' | 'Capa media (úvea)' | 'Capa interna' | 'Medio transparente' | 'Abertura' | 'Vía nerviosa';

export interface EyeStructure {
  id: StructureId;
  n: number;
  name: string;
  kind: StructureKind;
  description: string;
  func: string;
  location: string;
  role: string; // importancia en el proceso visual
  fact: string;
}

export const STRUCTURES: EyeStructure[] = [
  {
    id: 'cornea',
    n: 1,
    name: 'Córnea',
    kind: 'Capa externa',
    description:
      'Tejido transparente y sin vasos sanguíneos, con forma de cúpula, que continúa a la esclerótica en la parte delantera del ojo. Se nutre del humor acuoso y de la película lagrimal.',
    func: 'Deja pasar la luz y la desvía (refracta) con fuerza, porque su superficie curva separa el aire de un tejido con mayor índice de refracción.',
    location: 'Frente del ojo, delante del iris y la pupila. Su borde con la esclerótica se llama limbo.',
    role: 'Es la lente más potente del ojo: aporta cerca de dos tercios del poder de enfoque total (~43 de ~60 dioptrías). A diferencia del cristalino, su potencia es fija.',
    fact: 'Mide unos 0,5 mm de espesor en el centro y es uno de los tejidos con más terminaciones nerviosas del cuerpo.',
  },
  {
    id: 'acuoso',
    n: 2,
    name: 'Humor acuoso',
    kind: 'Medio transparente',
    description:
      'Líquido transparente producido de forma continua por los procesos ciliares. Circula desde la cámara posterior a la anterior a través de la pupila y se drena por el ángulo iridocorneal.',
    func: 'Nutre a la córnea y al cristalino (que no tienen vasos) y mantiene la presión intraocular que conserva la forma del globo.',
    location: 'Llena las cámaras anterior (entre córnea e iris) y posterior (entre iris y cristalino).',
    role: 'Es un medio transparente que la luz atraviesa después de la córnea. Su presión estable mantiene la geometría óptica del ojo.',
    fact: 'Se renueva aproximadamente cada 90–100 minutos. Si su drenaje se dificulta, la presión puede aumentar (relacionado con el glaucoma).',
  },
  {
    id: 'iris',
    n: 3,
    name: 'Iris',
    kind: 'Capa media (úvea)',
    description:
      'Disco muscular y pigmentado que da color al ojo. Contiene dos músculos lisos: el esfínter de la pupila (fibras circulares) y el dilatador de la pupila (fibras radiales).',
    func: 'Regula cuánta luz entra al ojo cambiando el tamaño de la pupila, como el diafragma de una cámara.',
    location: 'Entre la córnea y el cristalino, sumergido en el humor acuoso. Su raíz se une al cuerpo ciliar.',
    role: 'Controla la cantidad de luz y, al cerrar la pupila, aumenta la profundidad de campo y reduce aberraciones ópticas.',
    fact: 'El color del iris depende sobre todo de la cantidad de melanina y de cómo dispersa la luz el tejido, no de pigmentos azules o verdes.',
  },
  {
    id: 'pupila',
    n: 4,
    name: 'Pupila',
    kind: 'Abertura',
    description:
      'No es un tejido: es el orificio circular en el centro del iris. Se ve negra porque la luz que entra es absorbida casi por completo dentro del ojo.',
    func: 'Es la puerta de entrada de la luz al interior del ojo. Su diámetro varía entre ~2 mm (luz intensa) y ~8 mm (oscuridad).',
    location: 'Centro del iris, delante del cristalino.',
    role: 'Su tamaño determina cuánta luz llega a la retina. Entre 2 y 8 mm de diámetro el área cambia unas 16 veces.',
    fact: 'Las dos pupilas reaccionan a la vez aunque la luz llegue a un solo ojo (reflejo consensual).',
  },
  {
    id: 'cristalino',
    n: 5,
    name: 'Cristalino',
    kind: 'Medio transparente',
    description:
      'Lente biconvexa, transparente y elástica, formada por células alargadas (fibras) llenas de proteínas llamadas cristalinas. Está suspendida por las fibras zonulares del cuerpo ciliar.',
    func: 'Ajusta el enfoque cambiando su curvatura (acomodación): se vuelve más curvo para ver de cerca y más plano para ver de lejos.',
    location: 'Detrás del iris y la pupila, delante del humor vítreo.',
    role: 'Aporta cerca de un tercio del poder de enfoque y, sobre todo, el ajuste fino variable que permite enfocar a distintas distancias.',
    fact: 'Con la edad pierde elasticidad y cuesta enfocar de cerca (presbicia). Si pierde transparencia se habla de catarata.',
  },
  {
    id: 'vitreo',
    n: 6,
    name: 'Humor vítreo',
    kind: 'Medio transparente',
    description: 'Gel transparente compuesto en ~99 % por agua, con fibras de colágeno y ácido hialurónico.',
    func: 'Mantiene la forma del globo ocular y sostiene la retina contra la pared del ojo.',
    location: 'Ocupa la cavidad posterior, entre el cristalino y la retina: cerca del 80 % del volumen del ojo.',
    role: 'Es el último medio que la luz atraviesa antes de llegar a la retina; debe ser transparente para no dispersarla.',
    fact: 'Las «moscas volantes» que a veces vemos son sombras que pequeñas condensaciones del vítreo proyectan sobre la retina.',
  },
  {
    id: 'retina',
    n: 7,
    name: 'Retina',
    kind: 'Capa interna',
    description:
      'Tejido nervioso de ~0,2 mm de espesor organizado en capas. Contiene los fotorreceptores (conos y bastones) y las neuronas que procesan sus señales: bipolares, horizontales, amacrinas y ganglionares.',
    func: 'Transforma la luz en señales eléctricas (fototransducción) y realiza un primer procesamiento antes de enviarlas al cerebro.',
    location: 'Recubre el interior de la parte posterior del ojo. En su centro está la mácula, con la fóvea; donde sale el nervio está el disco óptico.',
    role: 'Es donde comienza la visión propiamente dicha: sin fotorreceptores, la luz no se convierte en información nerviosa.',
    fact: 'La luz atraviesa casi todas las capas de la retina antes de llegar a los fotorreceptores, que están en la capa más profunda.',
  },
  {
    id: 'coroides',
    n: 8,
    name: 'Coroides',
    kind: 'Capa media (úvea)',
    description: 'Capa muy vascularizada y pigmentada situada entre la esclerótica y la retina. Junto con el iris y el cuerpo ciliar forma la úvea.',
    func: 'Aporta oxígeno y nutrientes a las capas externas de la retina (incluidos los fotorreceptores). Su pigmento absorbe la luz sobrante.',
    location: 'Entre la esclerótica (por fuera) y la retina (por dentro), en la parte posterior del ojo.',
    role: 'Mantiene vivos y activos a los fotorreceptores, que consumen mucha energía, y evita reflejos internos que empeorarían la imagen.',
    fact: 'Es uno de los tejidos con mayor flujo sanguíneo del cuerpo en relación con su tamaño.',
  },
  {
    id: 'esclerotica',
    n: 9,
    name: 'Esclerótica',
    kind: 'Capa externa',
    description: 'Capa fibrosa, opaca y resistente, formada principalmente por colágeno. Es «lo blanco del ojo».',
    func: 'Protege el interior del ojo y mantiene su forma. En ella se insertan los músculos que mueven el ojo.',
    location: 'Envuelve casi todo el globo ocular; por delante se continúa con la córnea y por detrás con la vaina del nervio óptico.',
    role: 'Da un soporte rígido para que las distancias ópticas internas (por ejemplo, córnea–retina) se mantengan estables.',
    fact: 'Por donde sale el nervio óptico forma una red perforada llamada lámina cribosa.',
  },
  {
    id: 'nervio',
    n: 10,
    name: 'Nervio óptico',
    kind: 'Vía nerviosa',
    description: 'Haz de alrededor de 1 millón de axones de las células ganglionares de la retina, envuelto por meninges.',
    func: 'Transmite las señales visuales desde la retina hacia el cerebro.',
    location: 'Sale por la parte posterior del ojo, ligeramente hacia el lado nasal de la fóvea, en el disco óptico.',
    role: 'Es el cable de salida del ojo. Las fibras de ambos ojos se cruzan parcialmente en el quiasma óptico antes de llegar al tálamo y la corteza visual.',
    fact: 'El disco óptico no tiene fotorreceptores: es el punto ciego de cada ojo.',
  },
];

export const STRUCTURE_BY_ID = Object.fromEntries(STRUCTURES.map((s) => [s.id, s])) as Record<StructureId, EyeStructure>;
