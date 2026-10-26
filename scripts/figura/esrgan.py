"""Amplía una imagen x4 con Real-ESRGAN en CPU (ncnn, sin GPU), por teselas.

Modelos: carpeta models/ del zip realesrgan-ncnn-vulkan de
github.com/xinntao/Real-ESRGAN/releases (v0.2.5.0). pip install ncnn numpy pillow

Uso: python3 esrgan.py models/realesrgan-x4plus render-original.png render-x4.png
"""
import sys, ncnn, numpy as np
from PIL import Image
model, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
net = ncnn.Net(); net.opt.use_vulkan_compute = False; net.opt.num_threads = 4
net.load_param(model + ".param"); net.load_model(model + ".bin")
img = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255.0
H, W, _ = img.shape; T, P, S = 160, 12, 4
out = np.zeros((H * S, W * S, 3), np.float32)
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0 = max(0, y - P), max(0, x - P); y1, x1 = min(H, y + T + P), min(W, x + T + P)
        tile = np.ascontiguousarray(img[y0:y1, x0:x1].transpose(2, 0, 1))
        ex = net.create_extractor(); ex.input("data", ncnn.Mat(tile))
        _, o = ex.extract("output"); o = np.array(o).transpose(1, 2, 0)
        ty, tx = (y - y0) * S, (x - x0) * S
        h, w = min(T, H - y) * S, min(T, W - x) * S
        out[y * S:y * S + h, x * S:x * S + w] = o[ty:ty + h, tx:tx + w]
    print("row", y, flush=True)
Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst)
