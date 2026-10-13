"""Frame the README captures (qa/out/readme/*.png) into
.github/assets/desktop-sections.jpg (browser windows, 2 x 3 grid) and
.github/assets/mobile-screens.jpg (phones). Run after scripts/readme-assets.mjs:
~/anaconda3/bin/python3 scripts/readme-composite.py
"""
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'qa', 'out', 'readme')
OUT = os.path.join(ROOT, '.github', 'assets')
PAPER = (244, 237, 222)
DEEP = (16, 62, 73)


def shadow(canvas, box, radius, blur=26, offset=14, alpha=70):
    sh = Image.new('L', canvas.size, 0)
    d = ImageDraw.Draw(sh)
    x0, y0, x1, y1 = box
    d.rounded_rectangle((x0, y0 + offset, x1, y1 + offset), radius, fill=alpha)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas.paste(Image.new('RGB', canvas.size, (20, 30, 32)), (0, 0), sh)


def browser(img, width):
    """Screenshot in a light browser chrome, scaled to width."""
    bar = 34
    w = width
    h = round(img.height * w / img.width)
    win = Image.new('RGB', (w, h + bar), (236, 231, 220))
    d = ImageDraw.Draw(win)
    for i, c in enumerate([(236, 106, 94), (244, 191, 79), (98, 197, 84)]):
        d.ellipse((14 + i * 20, 12, 25 + i * 20, 23), fill=c)
    d.rounded_rectangle((w * .3, 8, w * .7, 26), 9, fill=(250, 247, 240))
    win.paste(img.resize((w, h), Image.LANCZOS), (0, bar))
    mask = Image.new('L', win.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, win.width - 1, win.height - 1), 10, fill=255)
    return win, mask


def phone(img, width):
    bezel = 14
    w = width
    h = round(img.height * (w - 2 * bezel) / img.width) + 2 * bezel
    body = Image.new('RGB', (w, h), (24, 24, 26))
    screen = img.resize((w - 2 * bezel, h - 2 * bezel), Image.LANCZOS)
    smask = Image.new('L', screen.size, 0)
    ImageDraw.Draw(smask).rounded_rectangle((0, 0, screen.width - 1, screen.height - 1), 34, fill=255)
    body.paste(screen, (bezel, bezel), smask)
    mask = Image.new('L', body.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), 48, fill=255)
    return body, mask


def desktop():
    names = ['d1-favourites', 'd2-menu', 'd7-dialog', 'd3-story', 'd4-club', 'd5-find']
    cw, gap, pad = 860, 56, 70
    tiles = [browser(Image.open(os.path.join(RAW, f'{n}.png')).convert('RGB'), cw) for n in names]
    th = tiles[0][0].height
    W = pad * 2 + cw * 2 + gap
    H = pad * 2 + th * 3 + gap * 2
    canvas = Image.new('RGB', (W, H), PAPER)
    for i, (t, m) in enumerate(tiles):
        x = pad + (i % 2) * (cw + gap)
        y = pad + (i // 2) * (th + gap)
        shadow(canvas, (x, y, x + t.width, y + t.height), 10)
        canvas.paste(t, (x, y), m)
    canvas.save(os.path.join(OUT, 'desktop-sections.jpg'), quality=84, optimize=True, progressive=True)
    print('desktop-sections.jpg', canvas.size)


def mobile():
    names = ['m1-hero', 'm2-place', 'm3-menu', 'm5-dialog', 'm4-club']
    pw, gap, pad = 330, 44, 70
    tiles = [phone(Image.open(os.path.join(RAW, f'{n}.png')).convert('RGB'), pw) for n in names]
    th = max(t.height for t, _ in tiles)
    W = pad * 2 + pw * len(tiles) + gap * (len(tiles) - 1)
    H = pad * 2 + th
    canvas = Image.new('RGB', (W, H), DEEP)
    for i, (t, m) in enumerate(tiles):
        x = pad + i * (pw + gap)
        shadow(canvas, (x, pad, x + t.width, pad + t.height), 48, alpha=110)
        canvas.paste(t, (x, pad), m)
    canvas.save(os.path.join(OUT, 'mobile-screens.jpg'), quality=84, optimize=True, progressive=True)
    print('mobile-screens.jpg', canvas.size)


if __name__ == '__main__':
    desktop()
    mobile()
