import type { StructureId } from './structures';

export type Domain = 'Óptica' | 'Anatomía' | 'Fisiología' | 'Procesamiento cerebral';

export interface LightStep {
  n: number;
  title: string;
  text: string;
  detail: string;
  domain: Domain;
  emphasis: StructureId[];
  /** Hasta dónde llegan los rayos (coordenada x del esquema). */
  reachX: number;
}

export const LIGHT_STEPS: LightStep[] = [
  {
    n: 1,
    title: 'La luz entra por la córnea',
    text: 'La luz reflejada por los objetos llega al ojo y atraviesa primero la película lagrimal y la córnea.',
    detail: 'Al pasar del aire a la córnea, la luz cambia de velocidad y se desvía (refracción). Por su curvatura, la córnea hace cerca de dos tercios del enfoque total del ojo.',
    domain: 'Óptica',
    emphasis: ['cornea'],
    reachX: 280,
  },
  {
    n: 2,
    title: 'Atraviesa el humor acuoso',
    text: 'Detrás de la córnea, la luz cruza la cámara anterior, llena de humor acuoso transparente.',
    detail: 'Su índice de refracción (≈ 1,336) es muy parecido al de la córnea, por eso aquí la luz casi no se desvía: solo avanza por un medio transparente.',
    domain: 'Anatomía',
    emphasis: ['acuoso'],
    reachX: 316,
  },
  {
    n: 3,
    title: 'Pasa por la pupila',
    text: 'Solo la luz que coincide con la abertura del iris continúa; el resto es bloqueada por el iris pigmentado.',
    detail: 'El iris ajusta el diámetro pupilar (≈ 2–8 mm) según la luz ambiente. Fíjate en los rayos exteriores: chocan con el iris y no llegan a la retina.',
    domain: 'Fisiología',
    emphasis: ['pupila', 'iris'],
    reachX: 334,
  },
  {
    n: 4,
    title: 'El cristalino ajusta el enfoque',
    text: 'El cristalino desvía de nuevo la luz y completa el enfoque.',
    detail: 'Aporta cerca de un tercio del poder de enfoque, pero es la única lente que puede cambiar de forma: así ajusta el foco para objetos lejanos o cercanos (acomodación).',
    domain: 'Óptica',
    emphasis: ['cristalino'],
    reachX: 382,
  },
  {
    n: 5,
    title: 'Atraviesa el humor vítreo',
    text: 'Los rayos, ya convergentes, cruzan el gel transparente que llena la cavidad posterior.',
    detail: 'El vítreo no enfoca: mantiene la forma del ojo para que la retina quede justo a la distancia en la que se forma la imagen nítida.',
    domain: 'Anatomía',
    emphasis: ['vitreo'],
    reachX: 600,
  },
  {
    n: 6,
    title: 'Llega a la retina',
    text: 'La luz se concentra sobre la retina y forma allí una imagen pequeña e invertida del mundo.',
    detail: 'Cuando miramos algo directamente, su imagen cae en la fóvea, la zona de máxima agudeza. Si el foco quedara delante o detrás de la retina, la imagen se vería borrosa (miopía o hipermetropía).',
    domain: 'Óptica',
    emphasis: ['retina'],
    reachX: 900,
  },
  {
    n: 7,
    title: 'Los fotorreceptores convierten la luz',
    text: 'Conos y bastones absorben la luz con sus pigmentos visuales y la transforman en señales eléctricas: es la fototransducción.',
    detail: 'La luz atraviesa primero las capas de neuronas de la retina y llega a los fotorreceptores, en la capa más profunda. Su señal pasa a las células bipolares y luego a las ganglionares, que generan impulsos nerviosos.',
    domain: 'Fisiología',
    emphasis: ['retina'],
    reachX: 900,
  },
  {
    n: 8,
    title: 'El nervio óptico transmite la información',
    text: 'Los axones de las células ganglionares se reúnen en el disco óptico y forman el nervio óptico.',
    detail: 'En el quiasma óptico, las fibras de la mitad nasal de cada retina cruzan al lado opuesto. La información pasa por el núcleo geniculado lateral del tálamo y, por las radiaciones ópticas, llega a la corteza.',
    domain: 'Fisiología',
    emphasis: ['nervio'],
    reachX: 900,
  },
  {
    n: 9,
    title: 'El cerebro construye la imagen',
    text: 'La corteza visual primaria (lóbulo occipital) y otras áreas analizan bordes, color, movimiento y profundidad, y combinan la información de ambos ojos.',
    detail: 'El cerebro no «da vuelta» una foto: interpreta un mapa ordenado de la retina. Lo que percibimos es una construcción que también usa la experiencia y el contexto (por eso existen las ilusiones ópticas).',
    domain: 'Procesamiento cerebral',
    emphasis: [],
    reachX: 900,
  },
];
