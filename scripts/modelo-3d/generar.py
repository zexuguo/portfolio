"""Genera public/models/zexu.glb: la minifigura low-poly de Zexu.

Modelado "a mano" por código: cada parte es un loft de anillos (elipses de
pocos vértices) con las medidas sacadas del vídeo 360 (fotograma de frente
y de perfil, escala 1,75 m / 690 px). Caras planas = estilo low-poly.

Uso:  python3 scripts/modelo-3d/generar.py
Requisitos: pip install numpy trimesh
Ejes: y arriba (pies en y=0), +z hacia delante (mira a la cámara).
"""

from pathlib import Path

import numpy as np
import trimesh

OUT = Path(__file__).resolve().parents[2] / "public" / "models" / "zexu.glb"
rng = np.random.default_rng(42)

COLORS = {
    "skin": "#d7a487",
    "skin_dark": "#b8806a",
    "hair": "#2a221c",
    "top": "#2b3038",
    "collar": "#232830",
    "pants": "#1f2126",
    "shoe": "#efeeea",
    "sole": "#b5b2aa",
    "eye": "#1b1714",
    "white": "#f4f1ec",
}

parts: list[trimesh.Trimesh] = []


def srgb_to_linear(hex_color: str) -> list[float]:
    c = np.array([int(hex_color[i : i + 2], 16) for i in (1, 3, 5)]) / 255
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return [*lin, 1.0]


def add(mesh: trimesh.Trimesh, color: str) -> None:
    rgba = (np.array(srgb_to_linear(color)) * 255).round().astype(np.uint8)
    mesh.visual = trimesh.visual.ColorVisuals(mesh, face_colors=np.tile(rgba, (len(mesh.faces), 1)))
    parts.append(mesh)


def loft(rings, n=8, cap_bottom=True, cap_top=True, phase=0.0, jitter=0.0, arc=None):
    """rings: lista de (y, ancho, fondo, cx, cz). Devuelve un Trimesh.

    arc=(a0, a1) hace un loft parcial (abierto) entre esos ángulos, en
    radianes, medidos desde +z (delante) girando hacia +x.
    """
    verts, faces = [], []
    closed = arc is None
    count = n if closed else n + 1
    for (y, w, d, cx, cz) in rings:
        for k in range(count):
            if closed:
                a = phase + 2 * np.pi * k / n
            else:
                a = arc[0] + (arc[1] - arc[0]) * k / n
            j = 1 + (rng.uniform(-jitter, jitter) if jitter else 0)
            verts.append((cx + np.sin(a) * w / 2 * j, y, cz + np.cos(a) * d / 2 * j))
    for r in range(len(rings) - 1):
        for k in range(count if closed else n):
            a = r * count + k
            b = r * count + (k + 1) % count
            c = (r + 1) * count + k
            e = (r + 1) * count + (k + 1) % count
            faces += [(a, c, b), (b, c, e)]
    if closed and cap_bottom:
        y, w, d, cx, cz = rings[0]
        verts.append((cx, y, cz))
        ci = len(verts) - 1
        faces += [(ci, k, (k + 1) % n) for k in range(n)]
    if closed and cap_top:
        y, w, d, cx, cz = rings[-1]
        verts.append((cx, y, cz))
        ci = len(verts) - 1
        base = (len(rings) - 1) * n
        faces += [(ci, base + (k + 1) % n, base + k) for k in range(n)]
    m = trimesh.Trimesh(np.array(verts), np.array(faces), process=False)
    m.fix_normals() if closed else None
    return m


def hull(points) -> trimesh.Trimesh:
    return trimesh.convex.convex_hull(np.array(points, dtype=float))


def mirror_x(m: trimesh.Trimesh) -> trimesh.Trimesh:
    c = m.copy()
    c.vertices[:, 0] *= -1
    c.faces = c.faces[:, ::-1]
    return c


def both(m: trimesh.Trimesh, color: str) -> None:
    add(m, color)
    add(mirror_x(m), color)


# ---------------------------------------------------------------- jersey
add(
    loft(
        [
            (0.95, 0.335, 0.215, 0, 0.0),
            (1.05, 0.325, 0.215, 0, 0.0),
            (1.17, 0.335, 0.225, 0, 0.005),
            (1.27, 0.355, 0.225, 0, 0.01),
            (1.345, 0.385, 0.215, 0, 0.0),
            (1.395, 0.30, 0.18, 0, -0.005),
            (1.43, 0.15, 0.125, 0, 0.0),
        ],
        n=8,
        phase=np.pi / 8,
    ),
    COLORS["top"],
)
# cuello del polo: dos solapas en V
both(hull([(0.0, 1.405, 0.068), (0.05, 1.45, 0.045), (0.075, 1.425, 0.03), (0.035, 1.39, 0.07), (0.02, 1.44, 0.05)]), COLORS["collar"])

# ---------------------------------------------------------------- cuello y cabeza
add(loft([(1.40, 0.105, 0.105, 0, 0.0), (1.50, 0.098, 0.1, 0, 0.0)], n=6), COLORS["skin"])
add(
    loft(
        [
            (1.462, 0.055, 0.05, 0, 0.035),
            (1.495, 0.118, 0.14, 0, 0.012),
            (1.545, 0.143, 0.185, 0, 0.0),
            (1.605, 0.152, 0.198, 0, -0.002),
            (1.665, 0.147, 0.195, 0, -0.006),
            (1.715, 0.112, 0.152, 0, -0.008),
            (1.742, 0.045, 0.06, 0, -0.008),
        ],
        n=10,
    ),
    COLORS["skin"],
)
FACE_Z = 0.097  # superficie de la cara a la altura de los ojos
# nariz
add(hull([(0, 1.598, FACE_Z), (-0.014, 1.566, FACE_Z - 0.004), (0.014, 1.566, FACE_Z - 0.004), (0, 1.568, FACE_Z + 0.022)]), COLORS["skin"])
# ojos: lentes oscuras planas
both(hull([(0.022, 1.607, FACE_Z), (0.044, 1.607, FACE_Z - 0.006), (0.033, 1.614, FACE_Z), (0.033, 1.601, FACE_Z), (0.033, 1.607, FACE_Z + 0.006)]), COLORS["eye"])
# cejas
both(hull([(0.018, 1.628, FACE_Z), (0.05, 1.63, FACE_Z - 0.008), (0.05, 1.636, FACE_Z - 0.008), (0.02, 1.635, FACE_Z), (0.034, 1.633, FACE_Z + 0.006)]), COLORS["hair"])
# boca
add(hull([(-0.02, 1.522, 0.084), (0.02, 1.522, 0.084), (0, 1.518, 0.09), (0, 1.526, 0.088), (0, 1.522, 0.078)]), COLORS["skin_dark"])
# orejas
both(hull([(0.07, 1.575, 0.0), (0.085, 1.585, -0.005), (0.085, 1.62, -0.012), (0.072, 1.625, 0.0), (0.078, 1.6, -0.02)]), COLORS["skin"])

# ---------------------------------------------------------------- pelo
# casquete con mucho volumen y picos irregulares (pelo despeinado, estilizado)
add(
    loft(
        [
            (1.648, 0.172, 0.222, 0, -0.008),
            (1.69, 0.2, 0.24, 0, -0.012),
            (1.735, 0.196, 0.232, 0, -0.014),
            (1.768, 0.15, 0.185, 0, -0.014),
            (1.786, 0.06, 0.07, 0, -0.016),
        ],
        n=13,
        jitter=0.09,
    ),
    COLORS["hair"],
)
# nuca y laterales (abierto por delante para no tapar la cara)
add(
    loft(
        [
            (1.53, 0.15, 0.19, 0, -0.022),
            (1.59, 0.178, 0.218, 0, -0.016),
            (1.655, 0.185, 0.228, 0, -0.01),
        ],
        n=9,
        jitter=0.05,
        arc=(np.radians(62), np.radians(298)),
    ),
    COLORS["hair"],
)
# flequillo: mechones que caen sobre la frente
for x, drop, w in [(-0.05, 0.03, 0.05), (-0.012, 0.042, 0.055), (0.03, 0.035, 0.05), (0.062, 0.022, 0.04)]:
    add(hull([(x - w / 2, 1.675, 0.088), (x + w / 2, 1.678, 0.086), (x, 1.672 - drop, 0.098), (x, 1.69, 0.06)]), COLORS["hair"])
# mechones sueltos arriba y a los lados (despeinado, pero sin parecer una corona)
for (cx, cz, dx, dy, dz) in [
    (-0.05, 0.02, -0.03, 0.022, 0.01),
    (0.03, -0.04, 0.02, 0.026, -0.02),
    (0.065, 0.03, 0.03, 0.012, 0.012),
    (-0.075, -0.03, -0.028, 0.008, -0.01),
]:
    y0 = 1.745
    add(hull([(cx - 0.035, y0, cz), (cx + 0.035, y0, cz), (cx, y0, cz + 0.035), (cx, y0, cz - 0.035), (cx + dx, y0 + dy, cz + dz)]), COLORS["hair"])

# ---------------------------------------------------------------- brazos y manos
both(
    loft(
        [
            (1.365, 0.105, 0.105, 0.172, 0.0),
            (1.25, 0.088, 0.092, 0.19, 0.0),
            (1.10, 0.078, 0.085, 0.2, 0.012),
            (0.975, 0.074, 0.08, 0.206, 0.02),
            (0.955, 0.07, 0.076, 0.207, 0.022),
        ],
        n=6,
    ),
    COLORS["top"],
)
both(
    loft(
        [
            (0.958, 0.048, 0.066, 0.207, 0.022),
            (0.91, 0.052, 0.098, 0.208, 0.028),
            (0.85, 0.046, 0.094, 0.206, 0.032),
            (0.795, 0.036, 0.066, 0.203, 0.036),
            (0.772, 0.018, 0.03, 0.202, 0.036),
        ],
        n=6,
    ),
    COLORS["skin"],
)
# pulgar
both(hull([(0.2, 0.93, 0.06), (0.2, 0.88, 0.075), (0.188, 0.885, 0.07), (0.192, 0.925, 0.05), (0.205, 0.9, 0.08)]), COLORS["skin"])

# ---------------------------------------------------------------- pantalón ancho
add(
    loft(
        [
            (0.45, 0.30, 0.2, 0, 0.0),
            (0.62, 0.36, 0.24, 0, 0.0),
            (0.84, 0.37, 0.245, 0, 0.0),
            (0.98, 0.34, 0.228, 0, 0.0),
        ],
        n=8,
        phase=np.pi / 8,
    ),
    COLORS["pants"],
)
both(
    loft(
        [
            (0.042, 0.182, 0.232, 0.096, 0.02),
            (0.2, 0.186, 0.236, 0.095, 0.015),
            (0.42, 0.19, 0.242, 0.094, 0.008),
            (0.64, 0.192, 0.245, 0.093, 0.0),
        ],
        n=8,
        phase=np.pi / 8,
    ),
    COLORS["pants"],
)

# ---------------------------------------------------------------- zapatillas
shoe = [
    (0.045, 0.0, -0.06), (0.135, 0.0, -0.06), (0.04, 0.0, 0.12), (0.14, 0.0, 0.12),
    (0.05, 0.0, 0.17), (0.13, 0.0, 0.17), (0.09, 0.0, 0.185),
    (0.05, 0.07, -0.055), (0.13, 0.07, -0.055), (0.05, 0.065, 0.06), (0.13, 0.065, 0.06),
    (0.06, 0.04, 0.165), (0.12, 0.04, 0.165), (0.09, 0.045, 0.18),
]
both(hull([(x, y + 0.012, z) for x, y, z in shoe]), COLORS["shoe"])
both(hull([(x, y, z) for x, y, z in shoe if y == 0.0] + [(x, 0.014, z) for x, y, z in shoe if y == 0.0]), COLORS["sole"])

# ---------------------------------------------------------------- export
scene = trimesh.Scene()
merged = trimesh.util.concatenate(parts)
scene.add_geometry(merged, node_name="zexu")
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_bytes(scene.export(file_type="glb"))
print(f"{OUT}  {len(merged.faces)} caras, {OUT.stat().st_size / 1024:.0f} KB")
