#!/usr/bin/env python3
"""Embed assets/bows.jpg and assets/lilies.jpg into user.css as base64 data URIs.

Spicetify only reliably serves user.css, so images are inlined between the
PGLP-ASSETS markers. Re-run after changing an image:  python3 scripts/embed_assets.py
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEME = os.path.join(ROOT, "pretty-girls-love-pink")


def data_uri(name):
    with open(os.path.join(THEME, "assets", name), "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")


block = (
    "/* PGLP-ASSETS-START */\n"
    ":root {\n"
    '  --pglp-img-bows: url("%s");\n'
    '  --pglp-img-lilies: url("%s");\n'
    "}\n"
    "/* PGLP-ASSETS-END */"
) % (data_uri("bows.jpg"), data_uri("lilies.jpg"))

path = os.path.join(THEME, "user.css")
with open(path, encoding="utf-8") as f:
    css = f.read()
new, n = re.subn(r"/\* PGLP-ASSETS-START \*/.*?/\* PGLP-ASSETS-END \*/",
                 lambda m: block, css, flags=re.S)
assert n == 1, "asset markers not found"
with open(path, "w", encoding="utf-8") as f:
    f.write(new)
print("embedded", len(block) // 1024, "KB of images")
