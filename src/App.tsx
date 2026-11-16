import { Nav } from '@/components/Nav';
import { Hero } from '@/sections/Hero';
import { Anatomy } from '@/sections/Anatomy';
import { LightPath } from '@/sections/LightPath';
import { Pupil } from '@/sections/Pupil';
import { Accommodation } from '@/sections/Accommodation';
import { Retina } from '@/sections/Retina';
import { Experiments } from '@/sections/Experiments';
import { Quiz } from '@/sections/Quiz';
import { Summary } from '@/sections/Summary';
import { Final } from '@/sections/Final';

export function App() {
  return (
    <>
      <Nav />
      <main id="contenido">
        <Hero />
        <Anatomy />
        <LightPath />
        <Pupil />
        <Accommodation />
        <Retina />
        <Experiments />
        <Quiz />
        <Summary />
        <Final />
      </main>
    </>
  );
}
