"""Prepara la figura a partir de render-original.png (fondo blanco).

1. Quita el fondo: todas las zonas blancas conectadas al borde y también
   las islas blancas encerradas (entre mechones, entre brazo y cuerpo),
   protegiendo los blancos que son parte del personaje (ojos, reloj,
   zapatillas).
2. Limpia el borde: los píxeles semitransparentes toman el color del
   interior más cercano, así no queda halo blanco.
3. Amplía x2 y separa capas para animar: cuerpo, cabeza, brazo izquierdo,
   brazo derecho y párpados.

Uso: python3 scripts/figura/preparar.py   (pip install numpy pillow scipy)
Salida: public/figura/*.webp
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "public" / "figura"
OUT.mkdir(parents=True, exist_ok=True)

src = np.asarray(Image.open(HERE / "render-original.png").convert("RGB")).astype(float)
H0, W0, _ = src.shape
mn = src.min(2)

# ---------------------------------------------------------------- 1. fondo
white = mn >= 244
lab, n = nd.label(white)
yy, xx = np.mgrid[0:H0, 0:W0]


def box(x0, y0, x1, y1):
    return (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)


# zonas donde el blanco es del personaje (coordenadas del original 640x853)
protect = box(280, 65, 345, 95) | box(140, 385, 180, 420) | box(185, 780, 440, 840)
bg = np.zeros_like(white)
sizes = nd.sum(white, lab, range(1, n + 1))
for i in range(1, n + 1):
    comp = lab == i
    touches_border = comp[0].any() or comp[-1].any() or comp[:, 0].any() or comp[:, -1].any()
    if touches_border or (sizes[i - 1] >= 6 and not (comp & protect).any()):
        bg |= comp
# also near-white pixels hugging the background (anti-aliased rim)
rim = nd.binary_dilation(bg, iterations=1) & (mn >= 232) & ~protect
bg |= rim
fg = ~bg
fg = nd.binary_opening(fg, iterations=1)

# ---------------------------------------------------------------- 2. borde
alpha = nd.gaussian_filter(fg.astype(float), 0.7)
alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
core = nd.binary_erosion(fg, iterations=2)
_, (iy, ix) = nd.distance_transform_edt(~core, return_indices=True)
rgb = src.copy()
edge = ~core
rgb[edge] = src[iy[edge], ix[edge]]

img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
ys, xs = np.nonzero(alpha > 0.02)
crop = (xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7)
img = img.crop(crop)
big = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
sharp = big.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
sharp.putalpha(big.getchannel("A"))
full = np.asarray(sharp).astype(float)
H, W, _ = full.shape
print("tamaño", W, H, "recorte", crop)
Y, X = np.mgrid[0:H, 0:W]
A = full[..., 3] > 8


# coordenadas de aquí en adelante: imagen ampliada
def save(arr, name):
    Image.fromarray(arr.astype(np.uint8), "RGBA").save(OUT / name, quality=90, method=6)


def layer(mask):
    out = full.copy()
    out[..., 3] = np.where(mask, out[..., 3], 0)
    return out


ox, oy = (crop[0] * 2, crop[1] * 2)  # by how much the crop shifted (x2)


def P(x, y):
    """original-scale point -> enlarged image point"""
    return x * 2 - ox, y * 2 - oy


# ---------------------------------------------------------------- 3. capas
# brazos: separados del torso por una línea hombro-axila
def left_of(y, pts):
    return np.interp(y, [p[1] for p in pts], [p[0] for p in pts])


armL_line = [P(242, 165), P(240, 180), P(236, 357), P(234, 385), P(208, 388), P(208, 520)]
armR_line = [P(381, 165), P(383, 180), P(386, 357), P(388, 385), P(418, 388), P(418, 520)]
yL0 = P(0, 165)[1]
y_hand_end = P(0, 505)[1]
armL = A & (Y > yL0) & (Y < y_hand_end) & (X < left_of(Y, armL_line))
armR = A & (Y > yL0) & (Y < y_hand_end) & (X > left_of(Y, armR_line))
# cabeza: por encima de la barbilla (con margen en la capa del cuerpo)
chin = P(0, 132)[1]
neck_overlap = P(0, 122)[1]
head = A & (Y < chin)
shoulder_keep = P(0, 242)[1]  # el cuerpo conserva el hombro para tapar huecos al girar
# el cuerpo conserva solo una franja del hombro pegada al torso
pvL, pvR = P(236, 197), P(389, 197)
near_L = (X - pvL[0]) ** 2 + (Y - pvL[1]) ** 2 < 62**2
near_R = (X - pvR[0]) ** 2 + (Y - pvR[1]) ** 2 < 62**2
body = A & ~(armL & ~near_L) & ~(armR & ~near_R) & ~(Y < neck_overlap)
# trocitos del borde interior del brazo que quedaron sueltos en el cuerpo:
# pasan a la capa del brazo para que se muevan con él
# tiras finas pegadas al costado (de 1-4 px) también van con el brazo
disk = (lambda r: (np.add.outer(np.arange(-r, r + 1) ** 2, np.arange(-r, r + 1) ** 2) <= r * r))(7)
thin = body & ~nd.binary_opening(body, structure=disk) & (Y > neck_overlap + 40)
thin &= (X < left_of(Y, armL_line) + 6) | (X > left_of(Y, armR_line) - 6)
armL |= thin & (X < W / 2)
armR |= thin & (X >= W / 2)
body &= ~thin
lab_b, nb = nd.label(body)
if nb > 1:
    keep = lab_b == (1 + np.argmax(nd.sum(body, lab_b, range(1, nb + 1))))
    loose = body & ~keep
    armL |= loose & (X < W / 2)
    armR |= loose & (X >= W / 2)
    body = keep

# cada brazo se queda con su pieza principal: las motas sueltas flotarían al girar
def largest(m):
    lab, n = nd.label(m)
    if n <= 1:
        return m
    return lab == (1 + np.argmax(nd.sum(m, lab, range(1, n + 1))))


armL, armR = largest(armL), largest(armR)

# relleno de torso donde el brazo tapaba el costado
torso_fill = np.zeros_like(A)
band = (Y > P(0, 200)[1]) & (Y < P(0, 362)[1])
torso_fill |= band & ~body & (X >= left_of(Y, armL_line) - 2) & (X < W / 2)
torso_fill |= band & ~body & (X <= left_of(Y, armR_line) + 2) & (X > W / 2)
# solo donde el brazo tapaba el torso: si en la fila hay un hueco de fondo
# entre brazo y torso (el blanco de la foto), el costado ya es el borde real
gapL = ~A & (X > left_of(Y, armL_line) - 14) & (X < W / 2) & band
gapR = ~A & (X < left_of(Y, armR_line) + 14) & (X > W / 2) & band
rowsL = gapL.any(1)[:, None]
rowsR = gapR.any(1)[:, None]
torso_fill &= ~((X < W / 2) & rowsL) & ~((X >= W / 2) & rowsR)
base = layer(body)
fillc = np.median(full[A & (Y > P(0, 250)[1]) & (Y < P(0, 330)[1]) & (np.abs(X - W / 2) < 40)][:, :3], 0)
base[torso_fill, :3] = fillc
base[torso_fill, 3] = 255
# el borde del costado que daba al hueco blanco queda claro: oscurecerlo
solid = base[..., 3] > 0
edge = solid & ~nd.binary_erosion(solid, iterations=4) & (Y > P(0, 180)[1]) & (Y < P(0, 400)[1])
edge &= (np.abs(X - W / 2) > 90) & (np.abs(X - W / 2) < 180)
lum = base[..., :3].astype(float).mean(-1)
light = edge & (lum > fillc.mean() + 18)
base[light, :3] = fillc

save(base, "cuerpo.webp")
save(layer(head), "cabeza.webp")
save(layer(armL), "brazo-izq.webp")
save(layer(armR), "brazo-der.webp")

# párpados: elipses del color de la piel sobre cada ojo
lids = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(lids)
cy0 = int(P(0, 92)[1])
x0, x1 = int(P(300, 0)[0]), int(P(320, 0)[0])
skin = tuple(int(c) for c in np.median(full[cy0 - 2 : cy0 + 2, x0:x1, :3].reshape(-1, 3), 0))
for ex in (294, 325):
    cx, cy = P(ex, 79)
    d.ellipse([cx - 18, cy - 9, cx + 18, cy + 8], fill=skin + (255,))
    d.arc([cx - 18, cy - 12, cx + 18, cy + 8], 25, 155, fill=(40, 30, 28, 255), width=3)
lids.save(OUT / "parpados.webp", quality=90, method=6)

print("pivotes (imagen ampliada):")
print("  cabeza", P(309, 150), "hombro izq", P(236, 197), "hombro der", P(389, 197))
print("  ojos", P(294, 79), P(325, 79), "suelo y", P(0, 834)[1], "eje x", P(310, 0)[0], "tamaño", W, H)
