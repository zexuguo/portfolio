# Modelo 3D de la figura

`generar.py` crea `public/models/zexu.glb`, la minifigura low-poly que muestra
`src/components/Figure3D.tsx`.

```bash
pip install numpy trimesh
python3 scripts/modelo-3d/generar.py
```

- Cada parte (cabeza, pelo, jersey, brazos, manos, pantalón, zapatillas) es un
  loft de anillos de pocos vértices o un casco convexo. Las medidas salen del
  vídeo 360 de Zexu (frente y perfil, escala 1,75 m / 690 px).
- Unidades en metros, y arriba, pies en y=0, +z mirando a la cámara.
- Los colores están en `COLORS`. Las caras planas las aplica Three.js
  (`flatShading`).
- Para usar un modelo hecho en otra herramienta (Blender, Meshy, Tripo…),
  basta con exportarlo como `public/models/zexu.glb`: `Figure3D` lo centra y lo
  pone de pie solo.
