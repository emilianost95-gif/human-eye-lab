export interface QuizQuestion {
  id: string;
  topic: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Función de la córnea',
    q: 'Una persona tiene una córnea con una curvatura irregular, pero su cristalino es normal. ¿Qué es lo más probable?',
    options: [
      'Verá con menos nitidez, porque la córnea aporta la mayor parte del enfoque del ojo.',
      'No notará ningún cambio, porque el enfoque depende solo del cristalino.',
      'Dejará de ver los colores, porque la córnea contiene los conos.',
      'Tendrá la pupila siempre dilatada.',
    ],
    answer: 0,
    explain: 'La córnea aporta cerca de dos tercios del poder de enfoque. Si su forma es irregular, los rayos no convergen bien y la imagen se ve borrosa o deformada (por ejemplo, en el astigmatismo). Los conos están en la retina, no en la córnea.',
  },
  {
    id: 'q2',
    topic: 'Iris y pupila',
    q: 'Sales de un cine oscuro a la calle soleada. ¿Qué ocurre en tus ojos en los primeros segundos?',
    options: [
      'Se contrae el músculo dilatador y la pupila se agranda.',
      'Se contrae el esfínter de la pupila y la pupila se achica.',
      'El cristalino se vuelve opaco para filtrar la luz.',
      'La retina deja de enviar señales hasta adaptarse.',
    ],
    answer: 1,
    explain: 'Ante el aumento de luz, el reflejo fotomotor activa (vía parasimpática) el esfínter de la pupila, de fibras circulares: la pupila se achica (miosis) y entra menos luz.',
  },
  {
    id: 'q3',
    topic: 'Pupila',
    q: '¿Cuál de estas afirmaciones sobre la pupila es correcta?',
    options: [
      'Es una lente que enfoca la luz sobre la retina.',
      'Es un tejido negro que absorbe la luz sobrante.',
      'Es una abertura en el iris cuyo tamaño regula la cantidad de luz que entra.',
      'Es la parte de la retina donde se forman las imágenes.',
    ],
    answer: 2,
    explain: 'La pupila no es un tejido ni una lente: es el orificio del iris. Se ve negra porque la luz que entra se absorbe dentro del ojo.',
  },
  {
    id: 'q4',
    topic: 'Cristalino y acomodación',
    q: 'Estabas mirando una montaña lejana y pasas a leer un mensaje en el celular. ¿Qué cambio permite enfocar el texto?',
    options: [
      'El músculo ciliar se relaja, las zónulas se tensan y el cristalino se aplana.',
      'La córnea se curva más gracias al humor acuoso.',
      'El ojo se alarga para que la retina se aleje del cristalino.',
      'El músculo ciliar se contrae, las zónulas se aflojan y el cristalino se vuelve más curvo.',
    ],
    answer: 3,
    explain: 'Para ver de cerca hace falta más potencia. Al contraerse el músculo ciliar, las fibras zonulares dejan de tirar y el cristalino, elástico, se redondea. La córnea no cambia su curvatura y la longitud del ojo tampoco.',
  },
  {
    id: 'q5',
    topic: 'Bastones y conos',
    q: 'En una noche sin luna te cuesta distinguir el color de un auto estacionado, aunque ves su forma. ¿Por qué?',
    options: [
      'Porque con tan poca luz solo funcionan los bastones, que no distinguen colores.',
      'Porque la pupila se cierra y no deja pasar los colores.',
      'Porque los conos funcionan mejor con poca luz pero se cansan rápido.',
      'Porque el cristalino filtra los colores durante la noche.',
    ],
    answer: 0,
    explain: 'Los bastones son muy sensibles y permiten ver con poca luz, pero tienen un único pigmento (rodopsina), por lo que no distinguen colores. Los conos, responsables del color, necesitan más luz.',
  },
  {
    id: 'q6',
    topic: 'Retina',
    q: 'Para leer letras pequeñas, giras los ojos hasta que la imagen de las letras cae sobre…',
    options: ['el disco óptico, donde hay más fibras nerviosas.', 'la fóvea, donde hay más conos y mayor agudeza.', 'la periferia de la retina, donde abundan los bastones.', 'el humor vítreo, que amplía la imagen.'],
    answer: 1,
    explain: 'La fóvea, en el centro de la mácula, tiene la mayor densidad de conos y casi ninguna capa celular por delante: es la zona de máxima agudeza. El disco óptico, en cambio, no tiene fotorreceptores.',
  },
  {
    id: 'q7',
    topic: 'Nervio óptico',
    q: 'El punto ciego existe porque…',
    options: [
      'allí la córnea es más gruesa y no deja pasar la luz.',
      'en ese lugar sale el nervio óptico y no hay fotorreceptores.',
      'el iris tapa siempre esa parte de la retina.',
      'los bastones de esa zona solo funcionan de noche.',
    ],
    answer: 1,
    explain: 'En el disco óptico se reúnen los axones de las células ganglionares para formar el nervio óptico. No hay conos ni bastones, así que la luz que llega allí no se detecta.',
  },
  {
    id: 'q8',
    topic: 'Recorrido de la luz',
    q: '¿Cuál es el orden correcto de las estructuras que atraviesa la luz?',
    options: [
      'Pupila → córnea → cristalino → humor acuoso → retina',
      'Córnea → cristalino → humor acuoso → humor vítreo → retina',
      'Córnea → humor acuoso → pupila → cristalino → humor vítreo → retina',
      'Córnea → humor vítreo → pupila → cristalino → retina',
    ],
    answer: 2,
    explain: 'La luz entra por la córnea, cruza el humor acuoso de la cámara anterior, pasa por la pupila, es enfocada por el cristalino, atraviesa el humor vítreo y llega a la retina.',
  },
  {
    id: 'q9',
    topic: 'Fototransducción y cerebro',
    q: '¿Dónde se convierte la luz en señales eléctricas y dónde se interpreta la imagen?',
    options: [
      'Ambas cosas ocurren en el cristalino.',
      'La luz se convierte en el nervio óptico y se interpreta en la retina.',
      'La luz se convierte en la córnea y se interpreta en el tálamo.',
      'La luz se convierte en los fotorreceptores de la retina; la imagen se construye en el cerebro, sobre todo en la corteza visual del lóbulo occipital.',
    ],
    answer: 3,
    explain: 'Los conos y bastones realizan la fototransducción. El nervio óptico solo transmite la información, que pasa por el tálamo y llega a la corteza visual, donde, junto con otras áreas, se interpreta lo que vemos.',
  },
  {
    id: 'q10',
    topic: 'Anatomía ocular',
    q: 'Si el humor acuoso no pudiera drenarse correctamente, ¿qué sería lo esperable?',
    options: [
      'Que aumente la presión dentro del ojo, lo que puede dañar el nervio óptico.',
      'Que la pupila deje de responder a la luz.',
      'Que el cristalino ya no pueda cambiar de forma.',
      'Que la retina produzca más bastones.',
    ],
    answer: 0,
    explain: 'El humor acuoso se produce y drena constantemente. Si el drenaje falla, la presión intraocular sube; una presión elevada sostenida es un factor de riesgo del glaucoma, que daña el nervio óptico.',
  },
];

export interface Badge {
  min: number;
  name: string;
  message: string;
}

export const BADGES: Badge[] = [
  { min: 100, name: 'Especialista en visión', message: '¡Perfecto! Dominas el recorrido completo, de la córnea a la corteza visual.' },
  { min: 80, name: 'Analista retinal', message: 'Excelente comprensión. Repasa las explicaciones de los errores y llegarás al 100 %.' },
  { min: 60, name: 'Explorador óptico', message: 'Buen trabajo: tienes las bases claras. Vuelve a la sección que más te costó.' },
  { min: 0, name: 'Aprendiz de laboratorio', message: 'Cada error es información. Revisa la anatomía y el recorrido de la luz, y vuelve a intentarlo.' },
];

export const badgeFor = (pct: number) => BADGES.find((b) => pct >= b.min) ?? BADGES[BADGES.length - 1]!;
