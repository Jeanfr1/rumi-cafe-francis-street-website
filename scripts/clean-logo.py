"""Clean the kit's gold logo reconstruction (01-identidade/rumi-logo-dourada-
transparente.png): its edges carry yellow/pink fringes and its counters hold
low-alpha specks that glow on the dark teal header.

Recipe: binary mask from alpha, drop components smaller than MIN_AREA,
anti-alias by supersampled blur, flat gold fill (median of the solid pixels),
tight crop with a margin. The kit master stays untouched; the result goes to
assets-src/logo/rumi-logo-gold.png and feeds scripts/build-images.mjs.

Run: ~/anaconda3/bin/python3 scripts/clean-logo.py
"""
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '01-identidade', 'rumi-logo-dourada-transparente.png')
OUT_DIR = os.path.join(ROOT, 'assets-src', 'logo')
MIN_AREA = 900
MARGIN = 24

im = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)
bgr, a = im[..., :3], im[..., 3]
solid = a > 250
gold = np.median(bgr[solid], axis=0).astype(np.uint8)

mask = (a > 140).astype(np.uint8)
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
keep = np.zeros_like(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] >= MIN_AREA:
        keep[labels == i] = 1

# anti-alias: upsample the binary shape, blur, downsample
big = cv2.resize(keep * 255, None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST)
big = cv2.GaussianBlur(big, (0, 0), 2.2)
alpha = cv2.resize(big, (keep.shape[1], keep.shape[0]), interpolation=cv2.INTER_AREA)

ys, xs = np.where(alpha > 8)
y0, y1 = max(ys.min() - MARGIN, 0), min(ys.max() + MARGIN + 1, alpha.shape[0])
x0, x1 = max(xs.min() - MARGIN, 0), min(xs.max() + MARGIN + 1, alpha.shape[1])

out = np.zeros((alpha.shape[0], alpha.shape[1], 4), np.uint8)
out[..., :3] = gold
out[..., 3] = alpha
out = out[y0:y1, x0:x1]

os.makedirs(OUT_DIR, exist_ok=True)
cv2.imwrite(os.path.join(OUT_DIR, 'rumi-logo-gold.png'), out)
print('gold BGR', gold.tolist(), 'components kept', int(keep.max() and len(np.unique(labels[keep == 1]))), 'size', out.shape[1], 'x', out.shape[0])

# ---- vector trace for the hero signature -------------------------------
# Contours of the cleaned mask (outer + holes, even-odd) as SVG paths in a
# 0 0 W H viewBox. The opening animation strokes these outlines (the real
# letter edges) and then fills them, so the drawn signature lands exactly on
# the logo instead of an approximation. -> src/data/logo-trace.json
import json

trace_mask = (out[..., 3] > 127).astype(np.uint8)
contours, hierarchy = cv2.findContours(trace_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
groups = {}
for i, cnt in enumerate(contours):
    parent = hierarchy[0][i][3]
    root = i if parent < 0 else parent
    approx = cv2.approxPolyDP(cnt, 0.9, True).reshape(-1, 2)
    if len(approx) < 3:
        continue
    d = 'M' + ' '.join(f'{x} {y}' for x, y in approx) + 'Z'
    groups.setdefault(root, []).append(d)
parts = []
for root, ds in groups.items():
    x, y, w, h = cv2.boundingRect(contours[root])
    parts.append({'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h), 'd': ''.join(ds)})
parts.sort(key=lambda p: (p['y'] > 580, p['x']))  # RUMI left to right, then CAFE
trace = {'w': int(out.shape[1]), 'h': int(out.shape[0]), 'parts': parts}
with open(os.path.join(ROOT, 'src', 'data', 'logo-trace.json'), 'w') as f:
    json.dump(trace, f, separators=(',', ':'))
print('trace parts', len(parts), 'chars', sum(len(p['d']) for p in parts))
