# Figura low-poly

Scripts que generan `src/data/figure.ts` a partir del vídeo 360 (el vídeo no
está en el repo).

1. Sacar dos fotogramas a una carpeta de trabajo `DIR`:
   - `front.png`: cuerpo entero de frente (`ffmpeg -ss 3.0 -i video.mp4 -frames:v 1 front.png`)
   - `face.png`: primer plano de la cara (`ffmpeg -ss 22.75 -i video.mp4 -frames:v 1 face.png`)
2. `python3 1_mascara.py DIR` recorta el cuerpo (`mask.npy`).
3. `python3 2_lowpoly.py DIR` triangula y escribe `DIR/tris.json`.
4. Convertir `tris.json` en `src/data/figure.ts` (formato `[color, "x,y x,y x,y"]` por zona).

Las coordenadas de recorte y de las zonas están ajustadas a mano para ese
vídeo; con otro vídeo hay que revisarlas.

Requisitos: `pip install numpy pillow scipy scikit-image`.
