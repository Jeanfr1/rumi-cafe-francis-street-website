"""Subset the URW faces to the characters the site uses and save woff2.

Sources (assets-src/fonts): the kit's RumiDisplay (URW Bookman Demi),
RumiEditorial-Italic (URW Bookman Light Italic), RumiSans (Nimbus Sans) and
NimbusSans-Bold.otf from github.com/ArtifexSoftware/urw-base35-fonts (same
AGPL-3 + font exception licence, see 08-estudo/fonts/LICENCAS.txt).

Run: ~/anaconda3/bin/python3 scripts/subset-fonts.py
"""
import os

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets-src', 'fonts')
OUT = os.path.join(ROOT, 'src', 'fonts')

# Basic Latin + Latin-1 + Latin Extended-A (Irish/Turkish names), general
# punctuation, euro, arrows used in links.
UNICODES = 'U+0020-007E,U+00A0-00FF,U+0100-017F,U+2010-2027,U+2030-203A,U+20AC,U+2190-2199,U+2197,U+2122,U+00D7'

FACES = {
    'RumiDisplay.woff': 'rumi-display.woff2',
    'RumiEditorial-Italic.woff': 'rumi-editorial-italic.woff2',
    'RumiSans.woff': 'rumi-sans.woff2',
    'NimbusSans-Bold.otf': 'rumi-sans-bold.woff2',
}

os.makedirs(OUT, exist_ok=True)
for src, dest in FACES.items():
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'onum', 'lnum', 'tnum']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    font = subset.load_font(os.path.join(SRC, src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(UNICODES))
    sub.subset(font)
    path = os.path.join(OUT, dest)
    subset.save_font(font, path, opts)
    print(f'{dest}: {os.path.getsize(path) // 1024} KB')
