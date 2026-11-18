"""Copie de Tapir : la page posée sur un bureau de bois, photographiée de biais (17 nov. 2026).

Reprend la page rendue par `fabrique_hd.py` (brut-hd2.png, 3264 × 4224) et la place, en perspective,
sur un bureau de bois dessiné ici (aucune image de tiers). Photo de téléphone : 3024 × 4032 px.
L'appareil penché vers l'avant : le haut de la page est plus loin, donc plus étroit ; un léger tour en plus.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageChops

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, 'sortie-2025')
NOM = 'Doux_9900005_Artefact-1_Remis_le_2025-09-09_07h58m03s'

W, H = 3024, 4032                       # photo de téléphone, debout
RESSERRE = float(os.environ.get('RESSERRE', '0.085'))   # le haut de la page, plus étroit que le bas
ROTATION = float(os.environ.get('ROTATION', '-3.2'))    # degrés
QUALITE = 85
rng = np.random.default_rng(777)


def bruit_doux(w, h, gw, gh, graine):
    r = np.random.default_rng(graine).random((gh, gw)).astype(np.float32)
    im = Image.fromarray((r * 255).astype(np.uint8), 'L').resize((w, h), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255.0


def bois():
    """Un bureau de chêne blanc clair, en planches posées à l'horizontale, veine fine et quelques arcs."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    HAUT_PLANCHE = 760.0
    decale = 140.0
    n = np.floor((y + decale) / HAUT_PLANCHE)                      # numéro de planche
    yl = (y + decale) - n * HAUT_PLANCHE                             # hauteur dans la planche
    graines = np.random.default_rng(31)
    nb = int(n.max()) + 2
    centre = graines.uniform(0.2, 0.8, nb) * W                        # le sommet des arcs, propre à chaque planche
    force = graines.uniform(260, 520, nb)
    teinte_planche = graines.uniform(-0.05, 0.05, nb)
    ni = n.astype(int)
    # les arcs du débit sur dosse : la veine se courbe autour d'un centre, puis s'aplatit
    arc = force[ni] * np.exp(-((x - centre[ni]) / (W * 0.16)) ** 2) - 0.25 * force[ni] * np.exp(-((x - centre[ni]) / (W * 0.45)) ** 2)
    ondule = bruit_doux(W, H, 5, 14, 5) * 40 + bruit_doux(W, H, 30, 60, 6) * 6
    phase = (yl + arc + ondule) / (17.0 * (0.55 + 1.1 * bruit_doux(W, H, 3, 10, 7)))
    frac = phase - np.floor(phase)
    largeur = 0.06 + 0.12 * bruit_doux(W, H, 6, 16, 9)
    veine = np.exp(-((frac - 0.5) / largeur) ** 2)                  # le bois d'été, en lignes d'épaisseur inégale
    bandes = 0.5 + 0.5 * np.sin((yl + arc * 0.9 + ondule) / 70.0)   # des bandes plus larges, claires et foncées
    fibres = graines.random((H, W // 48 + 2)).astype(np.float32)
    fibres = np.asarray(Image.fromarray((fibres * 255).astype(np.uint8), 'L').resize((W, H), Image.BICUBIC), dtype=np.float32) / 255.0
    clarte = 1.0 - 0.10 * veine - 0.06 * bandes + 0.05 * (fibres - 0.5) + teinte_planche[ni] + 0.04 * (bruit_doux(W, H, 4, 6, 8) - 0.5)
    joint = np.exp(-(yl ** 2) / (2 * 2.2 ** 2)) + np.exp(-((yl - HAUT_PLANCHE) ** 2) / (2 * 2.2 ** 2))
    clarte = clarte * (1 - 0.30 * joint)
    base = np.array([201, 166, 120], dtype=np.float32)               # chêne blanc, verni mat
    rgb = base[None, None, :] * clarte[:, :, None]
    rgb[:, :, 2] -= 10 * veine                                        # la veine un peu plus chaude
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')


def coefficients(sortie, entree):
    """Coefficients de Image.PERSPECTIVE : pour chaque point de la photo, le point de la page."""
    A, b = [], []
    for (x, y), (u, v) in zip(sortie, entree):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, dtype=np.float64), np.array(b, dtype=np.float64)).tolist()


def tourner(pts, deg, cx, cy):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]


def principal():
    page = Image.open(os.path.join(ICI, 'brut-hd2.png')).convert('RGB')
    PW, PH = page.size                                         # 3264 × 4224
    page = page.filter(ImageFilter.GaussianBlur(1.2))

    # où tombent les quatre coins : une feuille lettre (8,5 × 11 po) vue par un appareil à 14 po,
    # penché de INCLINE degrés (le haut de la feuille plus loin), puis tournée de ROTATION degrés
    INCLINE = float(os.environ.get('INCLINE', '7.0'))
    t = np.radians(INCLINE)
    D = 14.0
    def projeter(X, Y):                         # Y vers le haut de la feuille
        z = D + Y * np.sin(t)
        return (X / z, -Y * np.cos(t) / z)
    brut = [projeter(-4.25, 5.5), projeter(4.25, 5.5), projeter(4.25, -5.5), projeter(-4.25, -5.5)]
    brut = tourner(brut, ROTATION, 0.0, 0.0)
    xs, ys = [p[0] for p in brut], [p[1] for p in brut]
    MARGE = 150.0
    echelle = min((W - 2 * MARGE) / (max(xs) - min(xs)), (H - 2 * MARGE) / (max(ys) - min(ys)))
    cx0, cy0 = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    coins = [(W / 2 + (x - cx0) * echelle, H / 2 - 20 + (y - cy0) * echelle) for x, y in brut]
    for x, y in coins:
        assert 100 < x < W - 100 and 100 < y < H - 100, ('coin hors de la photo', x, y)
    k = coefficients(coins, [(0, 0), (PW, 0), (PW, PH), (0, PH)])

    scene = bois()
    posee = page.transform((W, H), Image.PERSPECTIVE, k, resample=Image.BICUBIC)
    # les trois trous de la feuille laissent voir le bois (centres et rayon de gabarit.html, à l'échelle 4)
    from PIL import ImageDraw
    plein = Image.new('L', (PW, PH), 255)
    dessin = ImageDraw.Draw(plein)
    for cy_trou in (153, 528, 903):
        dessin.ellipse((4 * (35 - 13), 4 * (cy_trou - 13), 4 * (35 + 13), 4 * (cy_trou + 13)), fill=0)
    masque = plein.transform((W, H), Image.PERSPECTIVE, k, resample=Image.BICUBIC)
    # l'ombre de la feuille sur le bois, douce, décalée vers le bas à droite
    ombre = ImageChops.offset(masque, 14, 22).filter(ImageFilter.GaussianBlur(26))
    scene = Image.composite(Image.new('RGB', (W, H), (40, 26, 16)), scene, ombre.point(lambda v: int(v * 0.55)))
    scene = Image.composite(posee, scene, masque.filter(ImageFilter.GaussianBlur(1.0)))

    # la lampe chaude du matin : plus claire en haut à gauche, teinte jaune, un peu de vignettage
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    lum = 1.0 - 0.20 * (0.55 * yy / H + 0.45 * xx / W)
    r2 = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    lum *= 1.0 - 0.10 * np.clip(r2 - 0.35, 0, None)
    teinte = np.array([1.0, 0.95, 0.84], dtype=np.float32)
    arr = np.asarray(scene, dtype=np.float32) * lum[:, :, None] * teinte[None, None, :]
    # le grain du capteur
    grain = rng.normal(0, 4.5, (H // 2, W // 2)).astype(np.float32)
    grain = np.asarray(Image.fromarray(np.clip(grain + 128, 0, 255).astype(np.uint8), 'L').resize((W, H), Image.BICUBIC), dtype=np.float32) - 128
    arr += grain[:, :, None]
    photo = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB').filter(ImageFilter.GaussianBlur(0.9))

    sortie = os.path.join(SORTIE, NOM + '.jpg')
    photo.save(sortie, quality=QUALITE, optimize=True)
    photo.resize((W // 4, H // 4), Image.LANCZOS).save(os.path.join(ICI, 'apercu-tapir-bureau.jpg'), quality=85)
    print(NOM + '.jpg', photo.size, os.path.getsize(sortie), 'octets ; coins :', [tuple(round(v) for v in c) for c in coins])


if __name__ == '__main__':
    principal()
