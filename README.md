# Portfolio — Zexu Guo

Portfolio interactivo: una historia contada haciendo scroll sobre una silueta. Cada parte del cuerpo abre una sección:

| Parte | Sección |
|---|---|
| Corazón | Quién soy |
| Cerebro | Lo que sé (formación y tecnologías) |
| Manos | Proyectos |
| Piernas | Constancia (triatlón) |
| Ojos | Hacia dónde voy y contacto |

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS y GSAP ScrollTrigger. En móvil las secciones se apilan sin zoom.

## Editar el contenido

Todo el texto vive en `src/data/sections.ts`. La silueta está en `src/components/Silhouette.tsx`.

Los botones de llamada a la acción sin `href` no se muestran, así que se puede dejar uno preparado sin que aparezca un enlace roto.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```
