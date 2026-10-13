"""Draw the "Find us" map from real OpenStreetMap geometry.

Input: assets-src/osm/area.osm (OSM API /map call, gitignored; refetch with
  curl 'https://api.openstreetmap.org/api/0.6/map?bbox=-6.2800,53.3390,-6.2595,53.3478')
  -> filtered to assets-src/osm/area.json (committed) on first run.
Output: src/data/map.svg, inlined by src/render.js. Both pins are drawn
inside the SVG, so they stay exact at any size (container keeps the viewBox
aspect). Credit "© OpenStreetMap contributors" is printed next to the map.

Run: ~/anaconda3/bin/python3 scripts/build-map.py
"""
import json
import math
import os
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OSM = os.path.join(ROOT, 'assets-src', 'osm', 'area.osm')
CACHE = os.path.join(ROOT, 'assets-src', 'osm', 'area.json')
OUT = os.path.join(ROOT, 'src', 'data', 'map.svg')

PINS = {  # same as src/data/site.js locations
    'francis': (53.34186, -6.27499),
    'templebar': (53.34549, -6.26312),
}
CENTER = ((PINS['francis'][0] + PINS['templebar'][0]) / 2, (PINS['francis'][1] + PINS['templebar'][1]) / 2)
W, H = 1000, 600          # viewBox
METERS_W = 1500           # ground width shown
SCALE = W / METERS_W      # px per metre

ROAD_W = {
    'primary': 9, 'secondary': 8, 'tertiary': 7, 'unclassified': 5, 'residential': 5,
    'living_street': 4.5, 'pedestrian': 4.5, 'service': 2.6, 'footway': 1.6, 'path': 1.6,
    'steps': 1.4, 'cycleway': 1.6, 'primary_link': 6, 'secondary_link': 6, 'tertiary_link': 5,
}
LABELS = ['Francis Street', 'Thomas Street', 'High Street', 'Dame Street', 'Patrick Street',
          'Lord Edward Street', 'Christchurch Place', 'Wood Quay', "Merchant's Quay", 'Bridge Street Lower',
          'Cornmarket', 'The Coombe', 'Meath Street', 'Essex Street West', 'Fishamble Street', 'Parliament Street',
          'Wellington Quay', "Usher's Quay", 'Back Lane', 'Nicholas Street', 'Werburgh Street', 'Crane Lane']


def load():
    if os.path.exists(CACHE):
        with open(CACHE) as f:
            return json.load(f)
    tree = ET.parse(OSM)
    nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in tree.iter('node')}
    roads, water, green, squares = [], [], [], []
    for w in tree.iter('way'):
        tags = {t.get('k'): t.get('v') for t in w.iter('tag')}
        pts = [nodes[nd.get('ref')] for nd in w.iter('nd') if nd.get('ref') in nodes]
        if len(pts) < 2:
            continue
        pts = [[round(a, 6), round(b, 6)] for a, b in pts]
        hw = tags.get('highway')
        if hw in ROAD_W and tags.get('area') != 'yes':
            if hw in ('footway', 'path', 'steps', 'cycleway') and tags.get('footway') in ('sidewalk', 'crossing'):
                continue  # sidewalks and crossings double every street
            roads.append({'k': hw, 'name': tags.get('name', ''), 'p': pts})
        elif hw == 'pedestrian' and tags.get('area') == 'yes':
            squares.append({'name': tags.get('name', ''), 'p': pts})
        elif tags.get('waterway') == 'river' or tags.get('natural') == 'water' or tags.get('water') == 'river':
            water.append({'k': 'line' if tags.get('waterway') else 'area', 'p': pts})
        elif tags.get('leisure') in ('park', 'garden') or tags.get('landuse') in ('grass', 'recreation_ground') or tags.get('amenity') == 'grave_yard':
            green.append({'p': pts})
    data = {'roads': roads, 'water': water, 'green': green, 'squares': squares}
    with open(CACHE, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    return data


def proj(lat, lon):
    k = math.cos(math.radians(CENTER[0]))
    x = (lon - CENTER[1]) * 111320 * k * SCALE + W / 2
    y = (CENTER[0] - lat) * 110574 * SCALE + H / 2
    return x, y


def simplify(pts, tol=0.7):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            dmax, idx = d, i
    if dmax > tol:
        return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
    return [pts[0], pts[-1]]


def path(pts, close=False, tol=0.7):
    xy = simplify([proj(a, b) for a, b in pts], tol)
    d = 'M' + ' '.join(f'{round(x)} {round(y)}' for x, y in xy)
    return d + ('Z' if close else '')


def visible(pts, pad=60):
    return any(-pad <= x <= W + pad and -pad <= y <= H + pad for x, y in (proj(a, b) for a, b in pts))


def main():
    data = load()
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="map-title map-desc" class="map-svg">',
           '<title id="map-title">Map of Rumi Cafe on Francis Street and the Temple Bar pop-up</title>',
           '<desc id="map-desc">Street map of Dublin 8 and Temple Bar. Rumi Cafe is on Francis Street in the Liberties; the pop-up treat counter is on Temple Bar Square, north-east, about ten minutes on foot.</desc>',
           f'<rect width="{W}" height="{H}" class="m-ground"/>']
    out.append('<g class="m-green">' + ''.join(f'<path d="{path(g["p"], True)}"/>' for g in data['green'] if visible(g['p'])) + '</g>')
    areas = [w for w in data['water'] if w['k'] == 'area' and visible(w['p'])]
    lines = [w for w in data['water'] if w['k'] == 'line' and visible(w['p'])]
    out.append('<g class="m-water">' + ''.join(f'<path d="{path(w["p"], True)}"/>' for w in areas) + '</g>')
    out.append('<g class="m-river">' + ''.join(f'<path d="{path(w["p"])}"/>' for w in lines) + '</g>')
    out.append('<g class="m-squares">' + ''.join(f'<path d="{path(s["p"], True)}"/>' for s in data['squares'] if visible(s['p'])) + '</g>')

    by_class = {}
    for r in data['roads']:
        if visible(r['p']):
            by_class.setdefault(r['k'], []).append(r)
    order = sorted(by_class, key=lambda k: ROAD_W[k])
    # one path per road class (casing then fill, minor roads first): far
    # fewer elements and attributes than one path per way
    joined = {k: ''.join(path(r['p'], tol=0.9) for r in by_class[k]) for k in order}
    out.append('<g class="m-casing">' + ''.join(
        f'<path d="{joined[k]}" stroke-width="{ROAD_W[k] + 2.2:g}"/>' for k in order if ROAD_W[k] >= 4) + '</g>')
    out.append('<g class="m-roads">' + ''.join(
        f'<path d="{joined[k]}" stroke-width="{ROAD_W[k]:g}" class="m-{"minor" if ROAD_W[k] < 4 else "road"}"/>' for k in order) + '</g>')

    # labels on the longest visible way of each named street
    defs, labels = [], []
    for i, name in enumerate(LABELS):
        ways = [r for r in data['roads'] if r['name'] == name and visible(r['p'], 0)]
        if not ways:
            continue
        def length(r):
            xy = [proj(a, b) for a, b in r['p']]
            return sum(math.dist(xy[j], xy[j + 1]) for j in range(len(xy) - 1))
        best = max(ways, key=length)
        if length(best) < 70:
            continue
        xy = [proj(a, b) for a, b in best['p']]
        if xy[0][0] > xy[-1][0]:
            xy = xy[::-1]
        d = 'M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in simplify(xy, 1.5))
        defs.append(f'<path id="st{i}" d="{d}"/>')
        labels.append(f'<text class="m-label{" m-label-key" if name == "Francis Street" else ""}" dy="3.4"><textPath href="#st{i}" startOffset="50%" text-anchor="middle">{name.replace("&", "&amp;").replace(chr(39), "&#39;")}</textPath></text>')
    out.append('<defs>' + ''.join(defs) + '</defs>')
    out.append('<text class="m-river-label" x="{:.0f}" y="{:.0f}">River Liffey</text>'.format(*proj(53.34605, -6.2735)))
    out.append('<g class="m-labels">' + ''.join(labels) + '</g>')

    # walking line between the two spots + pins (tip at the coordinate)
    (fx, fy), (tx, ty) = proj(*PINS['francis']), proj(*PINS['templebar'])
    out.append(f'<path class="m-walk" d="M{fx:.1f} {fy:.1f} Q{(fx + tx) / 2 + 30:.1f} {(fy + ty) / 2 + 60:.1f} {tx:.1f} {ty:.1f}"/>')
    for key, (lat, lon) in PINS.items():
        x, y = proj(lat, lon)
        cls = 'm-pin m-pin-main' if key == 'francis' else 'm-pin'
        out.append(f'<g class="{cls}" data-pin="{key}" transform="translate({x:.1f} {y:.1f})">'
                   '<circle class="m-pin-halo" r="22" cy="-3"/>'
                   '<path d="M0 0C-4-9-15-15-15-26a15 15 0 0 1 30 0C15-15 4-9 0 0Z"/>'
                   '<circle class="m-pin-dot" cy="-26" r="5.5"/></g>')
    out.append('</svg>')
    svg = ''.join(out)
    with open(OUT, 'w') as f:
        f.write(svg)
    print(f'map.svg {len(svg) // 1024} KB, roads {sum(len(v) for v in by_class.values())}, labels {len(labels)}')
    for key, (lat, lon) in PINS.items():
        x, y = proj(lat, lon)
        print(key, f'{x / W * 100:.2f}% {y / H * 100:.2f}%')


if __name__ == '__main__':
    main()
