"""Prepara la figura a partir de render-original.png (fondo blanco).

1. Quita el fondo: todas las zonas blancas conectadas al borde y también
   las islas blancas encerradas (entre mechones, entre brazo y cuerpo),
   protegiendo los blancos que son parte del personaje (ojos, reloj,
   zapatillas).
2. Limpia el borde: los píxeles semitransparentes toman el color del
   interior más cercano, así no queda halo blanco.
3. Separa capas para animar: cuerpo, cabeza, brazo izquierdo,
   brazo derecho y párpados.

Parte de render-x4.webp: el render ampliado x4 con Real-ESRGAN (x4plus),
que da bordes y facetas nítidos en vez de píxeles al hacer zoom
(modelos ncnn de github.com/xinntao/Real-ESRGAN; ver esrgan.py).

Uso: python3 scripts/figura/preparar.py   (pip install numpy pillow scipy)
Salida: public/figura/*.webp
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "public" / "figura"
OUT.mkdir(parents=True, exist_ok=True)

S = 4  # escala de render-x4 respecto al original 640x853
src = np.asarray(Image.open(HERE / "render-x4.webp").convert("RGB")).astype(float)
H0, W0, _ = src.shape


def u(v):
    """medida pensada para la imagen x2 -> escala de trabajo"""
    return int(round(v * S / 2))

mn = src.min(2)

# ---------------------------------------------------------------- 1. fondo
white = mn >= 244
lab, n = nd.label(white)
yy, xx = np.mgrid[0:H0, 0:W0]


def box(x0, y0, x1, y1):
    return (xx >= x0 * S) & (xx <= x1 * S) & (yy >= y0 * S) & (yy <= y1 * S)


# zonas donde el blanco es del personaje (coordenadas del original 640x853)
protect = box(280, 65, 345, 95) | box(140, 385, 180, 420) | box(185, 780, 440, 840)
bg = np.zeros_like(white)
sizes = nd.sum(white, lab, range(1, n + 1))
for i in range(1, n + 1):
    comp = lab == i
    touches_border = comp[0].any() or comp[-1].any() or comp[:, 0].any() or comp[:, -1].any()
    if touches_border or (sizes[i - 1] >= 6 * S * S and not (comp & protect).any()):
        bg |= comp
# also near-white pixels hugging the background (anti-aliased rim)
rim = nd.binary_dilation(bg, iterations=S // 2) & (mn >= 232) & ~protect
bg |= rim
fg = ~bg
fg = nd.binary_opening(fg, iterations=S // 2)

# ---------------------------------------------------------------- 2. borde
alpha = nd.gaussian_filter(fg.astype(float), 0.35 * S)
alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
core = nd.binary_erosion(fg, iterations=S)
_, (iy, ix) = nd.distance_transform_edt(~core, return_indices=True)
rgb = src.copy()
edge = ~core
rgb[edge] = src[iy[edge], ix[edge]]

img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
ys, xs = np.nonzero(alpha > 0.02)
crop = (xs.min() - 3 * S, ys.min() - 3 * S, xs.max() + 3 * S, ys.max() + 3 * S)
full = np.asarray(img.crop(crop)).astype(float)
H, W, _ = full.shape
print("tamaño", W, H, "recorte", crop)
Y, X = np.mgrid[0:H, 0:W]
A = full[..., 3] > 8


# coordenadas de aquí en adelante: imagen ampliada
def save(arr, name):
    Image.fromarray(arr.astype(np.uint8), "RGBA").save(OUT / name, quality=86, method=6)


def layer(mask):
    out = full.copy()
    out[..., 3] = np.where(mask, out[..., 3], 0)
    return out


ox, oy = crop[0], crop[1]


def P(x, y):
    """punto del original 640x853 -> punto de la imagen de trabajo"""
    return x * S - ox, y * S - oy


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
near_L = (X - pvL[0]) ** 2 + (Y - pvL[1]) ** 2 < u(62) ** 2
near_R = (X - pvR[0]) ** 2 + (Y - pvR[1]) ** 2 < u(62) ** 2
body = A & ~(armL & ~near_L) & ~(armR & ~near_R) & ~(Y < neck_overlap)
# trocitos del borde interior del brazo que quedaron sueltos en el cuerpo:
# pasan a la capa del brazo para que se muevan con él
# tiras finas pegadas al costado (de 1-4 px) también van con el brazo
disk = (lambda r: (np.add.outer(np.arange(-r, r + 1) ** 2, np.arange(-r, r + 1) ** 2) <= r * r))(u(7))
thin = body & ~nd.binary_opening(body, structure=disk) & (Y > neck_overlap + u(40))
thin &= (X < left_of(Y, armL_line) + u(6)) | (X > left_of(Y, armR_line) - u(6))
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

# costado del torso bajo los brazos: donde la foto deja ver el hueco entre
# brazo y torso, el borde real; donde el brazo lo tapa, una línea suave que
# une ese borde con la axila. Lo que falta se rellena copiando el tejido
# vecino de la misma fila, así conserva el sombreado.
y_top, y_bot = int(P(0, 200)[1]), int(P(0, 362)[1])
base = layer(body)
alpha_b = base[..., 3]
for side in ("L", "R"):
    line = armL_line if side == "L" else armR_line
    edge_x = np.full(H, np.nan)
    for yy_ in range(y_top, y_bot):
        lx = left_of(yy_, line)
        if side == "L":
            xs_ = np.arange(int(lx) - u(14), int(W / 2))
        else:
            xs_ = np.arange(int(lx) + u(14), int(W / 2), -1)
        row_a = A[yy_, xs_]
        gap = ~row_a[: u(16)]
        if gap.any() and row_a.any():
            edge_x[yy_] = xs_[np.argmax(row_a)]
    rows = np.arange(y_top, y_bot)
    known = ~np.isnan(edge_x[rows])
    start_x = left_of(y_top, line)
    if known.any():
        ky, kx = rows[known], edge_x[rows][known]
        e = np.interp(rows, np.r_[y_top, ky], np.r_[start_x, kx])
    else:
        e = left_of(rows, line)
    e = nd.uniform_filter1d(e, u(24), mode="nearest")
    for j, yy_ in enumerate(rows):
        ex = int(round(e[j]))
        if side == "L":
            seg = slice(ex, int(W / 2))
        else:
            seg = slice(int(W / 2), ex + 1)
        row = base[yy_, seg]
        a = row[:, 3] > 200
        if not a.any():
            continue
        # torso pixels: from the contour inward
        idx = np.arange(row.shape[0])
        if side == "L":
            first = np.argmax(a)
            src_px = row[min(first + u(3), row.shape[0] - 1), :3]
            fillm = idx < first
        else:
            last = row.shape[0] - 1 - np.argmax(a[::-1])
            src_px = row[max(last - u(3), 0), :3]
            fillm = idx > last
        row[fillm, :3] = src_px
        row[fillm, 3] = 255
        base[yy_, seg] = row
        # anything of the body outside the contour (but not the shoulder cap) goes
        out = slice(0, ex) if side == "L" else slice(ex + 1, W)
        cap = near_L if side == "L" else near_R
        kill = ~cap[yy_, out]
        base[yy_, out, 3] = np.where(kill, 0, base[yy_, out, 3])
fillc = np.median(full[A & (Y > P(0, 250)[1]) & (Y < P(0, 330)[1]) & (np.abs(X - W / 2) < u(40))][:, :3], 0)
# el borde del costado que daba al hueco blanco queda claro: oscurecerlo
solid = base[..., 3] > 0
edge = solid & ~nd.binary_erosion(solid, iterations=u(4)) & (Y > P(0, 180)[1]) & (Y < P(0, 400)[1])
edge &= (np.abs(X - W / 2) > u(90)) & (np.abs(X - W / 2) < u(180))
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
skin = tuple(int(c) for c in np.median(full[cy0 - u(2) : cy0 + u(2), x0:x1, :3].reshape(-1, 3), 0))
for ex in (294, 325):
    cx, cy = P(ex, 79)
    d.ellipse([cx - u(18), cy - u(9), cx + u(18), cy + u(8)], fill=skin + (255,))
    d.arc([cx - u(18), cy - u(12), cx + u(18), cy + u(8)], 25, 155, fill=(40, 30, 28, 255), width=u(3))
lids.save(OUT / "parpados.webp", quality=86, method=6)

print("pivotes (imagen ampliada):")
print("  cabeza", P(309, 150), "hombro izq", P(236, 197), "hombro der", P(389, 197))
print("  ojos", P(294, 79), P(325, 79), "suelo y", P(0, 834)[1], "eje x", P(310, 0)[0], "tamaño", W, H)
