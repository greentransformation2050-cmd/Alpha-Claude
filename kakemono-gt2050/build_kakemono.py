#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kakémono GT2050 — « Ligne de Crue » — 85x200 cm (ratio 17:40)."""

from PIL import Image, ImageDraw, ImageFont, ImageOps

import os
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
FONTS = "/root/.claude/skills/canvas-design/canvas-fonts"

W, H = 1700, 4000
MARGIN = 85

CREAM = (246, 243, 236)
WHITE = (255, 255, 255)
GREEN = (22, 113, 58)          # vert GT2050
GREEN_DEEP = (15, 61, 35)      # vert profond (titres)
GREEN_SOFT = (22, 113, 58, 40)
GRAPHITE = (58, 58, 54)
GREY = (120, 120, 112)
HAIR = (22, 113, 58)

def F(name, size):
    return ImageFont.truetype(f"{FONTS}/{name}", size)

kicker_f   = F("DMMono-Regular.ttf", 30)
title1_f   = F("BricolageGrotesque-Bold.ttf", 108)
title2_f   = F("BricolageGrotesque-Regular.ttf", 54)
num_f      = F("DMMono-Regular.ttf", 44)
head_f     = F("BricolageGrotesque-Bold.ttf", 44)
body_f     = F("WorkSans-Regular.ttf", 33)
micro_f    = F("DMMono-Regular.ttf", 22)

img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)

def text_w(s, f):
    return d.textbbox((0, 0), s, font=f)[2]

def center(s, f, y, fill, tracking=0):
    if tracking:
        widths = [text_w(c, f) + tracking for c in s]
        total = sum(widths) - tracking
        x = (W - total) / 2
        for c, w in zip(s, widths):
            d.text((x, y), c, font=f, fill=fill)
            x += w
    else:
        d.text(((W - text_w(s, f)) / 2, y), s, font=f, fill=fill)

# ---------------------------------------------------------------- bandeau haut
d.rectangle([0, 0, W, 26], fill=GREEN)

# --------------------------------------------------------------------- en-tête
center("GT2050 · CHANGEMENT CLIMATIQUE · TÉMOIGNAGE CÔTIER", kicker_f, 118, GREEN, tracking=4)

center("IMPACTS DU CHANGEMENT", title1_f, 196, GREEN_DEEP)
center("CLIMATIQUE", title1_f, 318, GREEN_DEEP)
center("sur les communautés côtières", title2_f, 462, GRAPHITE)

# filet court sous le titre
d.rectangle([(W - 140) / 2, 566, (W + 140) / 2, 572], fill=GREEN)

# ------------------------------------------------------------------ étiquettes
LABELS = [
    ("01", "IMPACTS HUMAINS", "Menaces sur la sécurité alimentaire"),
    ("02", "VULNÉRABILITÉ\nDISPROPORTIONNÉE", "Les zones côtières sont exposées"),
    ("03", "DÉPLACEMENT INTERNE", "Augmentation des migrations internes"),
    ("04", "PERTES IMPORTANTES", "Pertes de terres et de ressources"),
]

GAP = 44
CARD_W = (W - 2 * MARGIN - GAP) // 2      # 743
CARD_H = 330

def card(x, y, num, head, body):
    d.rectangle([x, y, x + CARD_W, y + CARD_H], fill=WHITE, outline=(215, 210, 198), width=2)
    d.rectangle([x, y, x + 8, y + CARD_H], fill=GREEN)
    pad = 38
    d.text((x + pad, y + 30), num, font=num_f, fill=(139, 178, 152))
    d.line([x + pad + 78, y + 52, x + CARD_W - pad, y + 52], fill=(215, 210, 198), width=2)
    hy = y + 96
    for line in head.split("\n"):
        d.text((x + pad, hy), line, font=head_f, fill=GREEN_DEEP)
        hy += 52
    # corps sur deux lignes max
    words, lines, cur = body.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if text_w(t, body_f) <= CARD_W - 2 * pad:
            cur = t
        else:
            lines.append(cur); cur = w_
    lines.append(cur)
    by = y + CARD_H - 30 - 42 * len(lines)
    for line in lines:
        d.text((x + pad, by), line, font=body_f, fill=GRAPHITE)
        by += 42

BAND_A = 648
card(MARGIN, BAND_A, *LABELS[0])
card(MARGIN + CARD_W + GAP, BAND_A, *LABELS[1])

# ----------------------------------------------------------------------- photo
photo = Image.open(f"{BASE}/photo-communaute-cotiere.webp").convert("RGB")
PW = 1360
PH = round(PW * photo.height / photo.width)          # 2041
PX = (W - PW) // 2                                   # 170
photo = photo.resize((PW, PH), Image.LANCZOS)
PY = 1040
img.paste(photo, (PX, PY))
d = ImageDraw.Draw(img)
d.rectangle([PX - 3, PY - 3, PX + PW + 2, PY + PH + 2], outline=GREEN_DEEP, width=3)

# filets d'indexation cartes -> photo
for cx in (MARGIN + CARD_W // 2, MARGIN + CARD_W + GAP + CARD_W // 2):
    d.line([cx, BAND_A + CARD_H + 2, cx, PY - 14], fill=GREEN, width=2)
    d.rectangle([cx - 5, PY - 14, cx + 5, PY - 4], fill=GREEN)

# repère mono sous la photo
d.text((PX, PY + PH + 22), "FIG. 1 — LIGNE DE CÔTE, AFRIQUE DE L'OUEST",
       font=micro_f, fill=GREY)
rt = "RELEVÉ GT2050 / 2026"
d.text((PX + PW - text_w(rt, micro_f), PY + PH + 22), rt, font=micro_f, fill=GREY)

# ------------------------------------------------------------- bande B (cartes)
BAND_B = PY + PH + 88
card(MARGIN, BAND_B, *LABELS[2])
card(MARGIN + CARD_W + GAP, BAND_B, *LABELS[3])
cap_bottom = PY + PH + 60          # sous la ligne de repères mono
for cx in (MARGIN + CARD_W // 2, MARGIN + CARD_W + GAP + CARD_W // 2):
    d.line([cx, cap_bottom + 10, cx, BAND_B - 2], fill=GREEN, width=2)
    d.rectangle([cx - 5, cap_bottom, cx + 5, cap_bottom + 10], fill=GREEN)

# -------------------------------------------------------------------- pied de page
FOOT = BAND_B + CARD_H + 70
d.rectangle([0, FOOT, W, H], fill=WHITE)
d.line([0, FOOT, W, FOOT], fill=GREEN, width=4)

logo = Image.open(f"{BASE}/logo-gt2050.png").convert("RGB")
bg = Image.new("RGB", logo.size, (255, 255, 255))
from PIL import ImageChops
diff = ImageChops.difference(logo, bg)
bbox = diff.getbbox()
if bbox:
    logo = logo.crop(bbox)
LH = 190
LW = round(LH * logo.width / logo.height)
logo = logo.resize((LW, LH), Image.LANCZOS)
foot_h = H - FOOT
img.paste(logo, ((W - LW) // 2, FOOT + (foot_h - LH) // 2 - 30))
d = ImageDraw.Draw(img)
center("GREEN TRANSFORMATION 2050", micro_f, H - 66, GREY, tracking=6)
d.rectangle([0, H - 16, W, H], fill=GREEN)

out = f"{os.path.dirname(BASE)}/kakemono-gt2050-impacts-climatiques.png"
img.save(out)
print("saved", out, img.size, "band_b_end", BAND_B + CARD_H, "foot", FOOT)
