"""Copies fictives de « Deux-Rives », en photo haute définition (17 nov. 2026).

Même page, mêmes annotations, même hasard que la fabrique du 12 nov. (`claude/copie-fictive-fabrique.md`) ;
seule la définition change : capture Chrome à l'échelle 4, photo de 2550 × 3300 px (300 ppp sur une page lettre),
effets mis à l'échelle (×2), JPEG seul, sans PDF. Copies 1 et 2 seulement (prises au téléphone) ;
la copie 3, numérisée, reste en PDF.
"""
import json, os, subprocess, sys
from PIL import Image, ImageFilter, ImageChops

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, 'sortie-2025')
os.makedirs(SORTIE, exist_ok=True)

ECHELLE = 2            # 1275 × 1650 -> 2550 × 3300
QUALITE = int(os.environ.get('QUALITE', '85'))


def F(cle, phrase, geste='fluo', **k):
    return dict(cle=cle, phrase=phrase, geste=geste, **k)


def N(encre, phrase, texte, **k):
    return dict(encre=encre, phrase=phrase, texte=texte, **k)


TOUS_NOV = dict(toutes=True, casse=False, mot=True)

COPIE1 = dict(
    nom='Enjouee_9900002_Artefact-1_Remis_le_2025-09-08_23h41m12s',
    police='Caveat.ttf', graine=20261112,
    ecriture=dict(poids=500, taille=[15.5, 16.8], saut=0.7, rot=3, incl=2.2, interligne=0.95),
    encres=dict(p='#1c3a9e', t='#13693a', m='#a3176f', noir='#1b1b2e', crayon='#5b5b5b'),
    fluo=dict(p='rgba(70,185,255,0.50)', t='rgba(110,230,80,0.50)', m='rgba(255,105,200,0.46)'),
    photo=dict(rotation=-0.8, flou=0.45, lumiere=0.13, grain=0.35, fond=(88, 82, 74), qualite=72),
    marques=[
        F('p', 'Aurore-Délia', toutes=True),
        F('t', 'montre encore novembre. Novembre 2011.'),
        F('m', "Les saisons ont beau défiler dans la fenêtre au-dessus de l'évier, les outardes ont beau partir pis revenir, ici, c'est novembre."),
        F('t', 'On beurre ses toasts en novembre. On lave la vaisselle en novembre.'),
        F('t', 'dès cinq heures du matin'),
        F('p', 'soixante-dix-huit ans, des mains pleines de farine et un rire qui fait trembler les tasses'),
        F('p', "Les chasseurs l'appellent « la mère ». Les camionneurs aussi."),
        F('p', 'passe le balai autour. Jamais dessous.'),
        F('t', 'depuis douze ans'),
        F('p', "C'étaient celles de Bébert."),
        F('t', 'Elle le revoit, le premier hiver'),
        F('p', 'Il riait fort.'),
        F('m', "Il a eu raison pour le monde. Pour le silence, il s'est trompé"),
        F('t', 'Le soir'),
        F('m', 'la maison change de voix'),
        F('t', 'Le poêle à bois ronronne comme un vieux chat.'),
        F('p', "un jeune camionneur d'Edmundston"),
        F('p', "C'est à mon homme. Y est parti au bois."),
        F('m', 'novembre', 'cercle', **TOUS_NOV),
        F('m', 'deux', 'cercle', **TOUS_NOV),
        F('m', 'bottes', 'cercle', **TOUS_NOV),
        F('m', 'balai autour', 'souligne', traits=2),
        F('m', 'balaie autour', 'souligne', traits=2),
    ],
    libres=[
        dict(texte='Stratégies :', x=66, y=56, encre='noir', taille=19, incl=-1.5),
        dict(texte='personnages', x=150, y=54, encre='p', taille=19, incl=-1, fluo='p', largeur=120),
        dict(texte='temporalité', x=252, y=55, encre='t', taille=19, incl=0.5, fluo='t', largeur=120),
        dict(texte='motifs + contrastes', x=352, y=53, encre='m', taille=19, incl=-0.8, fluo='m', largeur=170),
        dict(texte='Lecture analytique', x=82, y=836, encre='noir', taille=22, incl=-0.6, largeur=300, souligne=150),
        dict(texte="Thèmes : le deuil, le temps arrêté, la solitude, l'accueil", x=86, y=870, encre='noir', taille=19, incl=-0.4, largeur=680),
        dict(texte='Propos : Une personne en deuil peut rester prise dans ses souvenirs.', x=86, y=900, encre='noir', taille=19, incl=0.3, largeur=680),
        dict(texte="HOC : Le deuil peut garder quelqu'un prisonnier du passé, même quand la vie continue autour de lui.", x=86, y=932, encre='noir', taille=19, incl=-0.3, largeur=640),
    ],
    notes=[
        N('p', 'soixante-dix-huit ans', 'traits : vieille, travaillante, joyeuse', lien='trait'),
        N('p', "Les chasseurs l'appellent", 'ce que les autres disent : une mère pour les clients', lien='trait'),
        N('p', 'passe le balai autour', 'action : touche jamais aux bottes', lien='trait'),
        N('p', "C'étaient celles de Bébert.", 'Bébert = son mari. mort ?', lien='trait'),
        N('p', 'Il riait fort.', 'Bébert : joyeux, travaillant'),
        N('p', "C'est à mon homme.", "parole : elle fait comme s'il était vivant → refuse qu'il soit mort", lien='trait'),
        N('p', "un jeune camionneur d'Edmundston", 'perso secondaire'),
        N('t', 'montre encore novembre', 'marqueur : novembre 2011 → le temps est arrêté chez elle', lien='trait'),
        N('t', 'On beurre ses toasts', "c'est toujours novembre, même en juillet", lien='accolade'),
        N('t', 'dès cinq heures du matin', 'marqueur : la routine du matin'),
        N('t', 'depuis douze ans', 'durée : 12 ans', lien='trait'),
        N('t', 'Elle le revoit, le premier hiver', 'analepse (souvenir)', lien='trait'),
        N('t', 'Le soir', 'marqueur'),
        N('t', 'Le poêle à bois', 'pause ?'),
        N('m', 'novembre', 'motif : novembre x6'),
        N('m', 'Les saisons ont beau défiler', 'contraste : dehors le temps passe / dedans non', lien='accolade'),
        N('m', 'deux vieilles', 'motif : deux (x6)'),
        N('m', 'paire de bottes', 'motif : les bottes x4'),
        N('m', 'balai autour', 'répétition : début et fin', lien='fleche'),
        N('m', 'Il a eu raison pour le monde', 'contraste : monde / silence', lien='trait'),
        N('m', 'la maison change de voix', 'contraste jour / soir'),
        N('crayon', 'Le poêle à bois', 'personnification', dy=2),
        N('crayon', 'Le plancher craque', 'personnification', dy=4),
    ],
)

COPIE2 = dict(
    nom='Doux_9900005_Artefact-1_Remis_le_2025-09-09_07h58m03s',
    police='ShadowsIntoLight.ttf', graine=777, trier=True,
    ecriture=dict(poids=400, taille=[17, 18.5], saut=1.1, rot=4.5, incl=4, interligne=0.95),
    encres=dict(noir='#222226', crayon='#5b5b5b'),
    fluo=dict(j='rgba(255,236,40,0.55)', o='rgba(255,150,40,0.48)'),
    marges=dict(g=118, d=150),
    photo=dict(rotation=-1.7, flou=0.75, lumiere=0.24, grain=0.45, fond=(70, 58, 46), qualite=64,
               teinte=(1.0, 0.95, 0.84), sens=270, perspective=18),
    marques=[
        F('j', 'Aurore-Délia', toutes=True, seulement=[0, 1]),
        F('o', 'Aurore-Délia', toutes=True, seulement=[2, 3]),
        F('j', "Aurore-Délia a soixante-dix-huit ans, des mains pleines de farine et un rire qui fait trembler les tasses. Les chasseurs l'appellent « la mère ». Les camionneurs aussi. Elle les laisse faire."),
        F('o', 'novembre', toutes=True, casse=False, mot=True, seulement=[0, 1, 2]),
        F('o', 'Les bottes ont pas bougé depuis douze ans'),
        F('j', "C'étaient celles de Bébert. Elle le revoit, le premier hiver, à genoux sur le perron, à clouer des planches d'épinette en sacrant contre le frette."),
        F('o', "Il a eu raison pour le monde. Pour le silence, il s'est trompé : c'est lui qui l'a amené en partant."),
        F('j', 'Le poêle à bois ronronne comme un vieux chat.'),
        F('j', "C'est à mon homme. Y est parti au bois."),
        F('noir', 'maringouins', 'souligne'),
        F('noir', "cap d'acier", 'souligne'),
    ],
    libres=[
        dict(texte='Stratégie 1 : personnages', x=70, y=50, encre='noir', taille=19, incl=-2, fluo='j', largeur=230),
        dict(texte='Stratégie 2 : motifs et contrastes', x=300, y=54, encre='noir', taille=19, incl=-1, fluo='o', largeur=300),
        dict(texte='Thèmes : deuil, vieillesse, la mort', x=92, y=846, encre='noir', taille=21, incl=-1.5, largeur=600),
        dict(texte="HOC : la tristesse de perdre quelqu'un", x=96, y=884, encre='noir', taille=21, incl=-2, largeur=600),
    ],
    notes=[
        N('noir', 'novembre', 'beaucoup de novembre !!', cote='d'),
        N('noir', 'maringouins', 'lol', cote='g', lien='trait'),
        N('noir', 'soixante-dix-huit ans', 'elle est vieille', lien='trait'),
        N('noir', "cap d'acier", 'c quoi ?', cote='g', lien='trait'),
        N('noir', "C'étaient celles de Bébert.", 'son mari est mort ?', lien='trait'),
        N('noir', 'Il a eu raison pour le monde', 'contraste ?'),
        N('noir', 'Personne en pose', 'triste :(', cote='d'),
    ],
)

B, V, R = 'p', 't', 'm'
COPIE3 = dict(
    nom='Vaillante_9900006_Artefact-1_Remis_le_2025-09-08_19h22m47s',
    police='Kalam.ttf', graine=4242, trier=True,
    ecriture=dict(poids=400, taille=[12.6, 13.4], saut=0.4, rot=1.5, incl=1.2, interligne=1.08),
    encres=dict(p='#1f3a8f', t='#17703f', m='#c0185a', noir='#1d1d24', crayon='#5b5b5b'),
    fluo=dict(),
    trait=1.0,
    marges=dict(g=128, d=162),
    photo=dict(scan=True, rotation=0.25, qualite=70),
    marques=[
        F(B, 'soixante-dix-huit ans, des mains pleines de farine et un rire qui fait trembler les tasses', 'souligne', droit=True),
        F(B, "Les chasseurs l'appellent « la mère ».", 'souligne', droit=True),
        F(B, 'Jamais dessous.', 'souligne', droit=True),
        F(B, 'Elle le revoit', 'souligne', droit=True),
        F(B, "« Quand y aura du monde plein les chambres, ma belle, tu vas t'ennuyer du silence. »", 'souligne', droit=True),
        F(B, "C'est à mon homme. Y est parti au bois.", 'souligne', droit=True),
        F(B, "Le jeune a pas posé d'autre question. Personne en pose", 'souligne', droit=True),
        F(V, 'Novembre 2011.', 'souligne', droit=True),
        F(V, 'Même en juillet', 'souligne', droit=True),
        F(V, 'depuis douze ans', 'souligne', droit=True),
        F(V, 'le premier hiver', 'souligne', droit=True),
        F(V, "Le soir, quand le dernier client a monté l'escalier", 'souligne', droit=True),
        F(V, "Un matin, un jeune camionneur d'Edmundston", 'souligne', droit=True),
        F(V, "Un jour, quelqu'un va décrocher le calendrier.", 'souligne', droit=True),
        F(R, "Il a eu raison pour le monde. Pour le silence, il s'est trompé", 'souligne', droit=True),
        F(R, 'la maison change de voix', 'souligne', droit=True),
        F(R, 'novembre', 'cadre', **TOUS_NOV),
        F(R, 'deux', 'cadre', **TOUS_NOV),
        F(R, 'bottes', 'cadre', **TOUS_NOV),
        F(R, 'balai autour', 'souligne', traits=2),
        F(R, 'balaie autour', 'souligne', traits=2),
    ],
    libres=[
        dict(texte='Stratégies :', x=70, y=58, encre='noir', taille=16, incl=-0.5, largeur=100),
        dict(texte='● Personnages', x=160, y=58, encre=B, taille=16, incl=0, largeur=140),
        dict(texte='◆ Temporalité', x=282, y=58, encre=V, taille=16, incl=0, largeur=140),
        dict(texte='★ Motifs et contrastes', x=402, y=58, encre=R, taille=16, incl=0, largeur=200),
        dict(texte='Lecture analytique', x=78, y=822, encre='noir', taille=17, incl=-0.3, largeur=300, souligne=140),
        dict(texte="Thèmes : le deuil, le temps figé, la mémoire, l'accueil", x=82, y=848, encre='noir', taille=14, incl=0, largeur=690),
        dict(texte="Propos : On peut garder quelqu'un vivant à travers les gestes de tous les jours.", x=82, y=868, encre='noir', taille=14, incl=0.2, largeur=690),
        dict(texte='HOC 1 : L\'auteur cherche à montrer que le deuil enferme une personne dans le passé.', x=82, y=890, encre='noir', taille=14, incl=0, largeur=690, rature=True),
        dict(texte="→ Mais elle rit et nourrit les clients (« la mère ») : elle n'est pas enfermée, seulement sa cuisine l'est. Je garde le deuil, je change l'angle.", x=96, y=911, encre='noir', taille=14, incl=0.2, largeur=670),
        dict(texte="HOC 2 : L'auteur cherche à faire ressentir comment une femme garde son mari vivant dans ses gestes de tous les jours, en refusant que le temps l'efface, tout en restant ouverte aux autres.", x=82, y=952, encre='noir', taille=14, incl=0, largeur=690),
    ],
    notes=[
        N(B, 'soixante-dix-huit ans', '● traits : âgée mais pleine de vie (le rire ; la farine = elle travaille fort)', lien='trait'),
        N('noir', 'un rire qui fait trembler', '? contredit ma HOC 1 → voir en bas', cote='g'),
        N(B, "Les chasseurs l'appellent", "● ce qu'on dit d'elle : « la mère » → elle prend soin d'inconnus", lien='trait'),
        N(B, 'Jamais dessous.', '● geste répété chaque matin : elle protège les bottes comme une relique', lien='trait'),
        N(B, 'Elle le revoit', '● pensée : Bébert est encore là, dans sa tête'),
        N(B, '« Quand y aura du monde', "● Bébert (ses paroles) : taquin, confiant ; le gîte, c'était son rêve", lien='trait'),
        N(B, "C'est à mon homme.", "● parole au présent : « Y est parti » → pour elle, il n'est pas mort, juste absent", lien='trait'),
        N(B, "Le jeune a pas posé", '● les clients respectent son silence : le village protège sa façon de vivre le deuil', lien='trait'),
        N(V, 'Novembre 2011.', '◆ marqueur : le calendrier arrête le temps', lien='trait'),
        N(V, 'Même en juillet', '◆ les saisons passent dehors, pas dans la cuisine'),
        N(V, 'depuis douze ans', "◆ 2011 + 12 ans : le calendrier s'est arrêté au départ de Bébert", lien='trait'),
        N(V, 'le premier hiver', '◆ analepse : seul retour en arrière, au début du gîte', lien='trait'),
        N(V, 'Le soir, quand', '◆ pause : le récit ralentit quand elle est seule'),
        N(V, 'Un matin, un jeune', '◆ scène (dialogue) : temps du récit = temps de l\'histoire', lien='trait'),
        N(V, "Un jour, quelqu'un va", '◆ prolepse : on annonce la fin du deuil… mais pas par elle', lien='trait'),
        N(R, 'novembre', "★ motif : novembre x6, jusqu'à la dernière ligne → le mois devient un lieu où elle vit"),
        N(R, 'deux vieilles', '★ motif : deux (x6) : Deux-Rives, deux vieilles, deux tasses → le couple existe encore dans ses gestes'),
        N(R, 'paire de bottes', '★ bottes x4 : la présence de Bébert'),
        N(R, 'Il a eu raison pour le monde', "★ contraste monde / silence : ironie, c'est son absence à lui qui fait le silence", lien='trait'),
        N(R, 'la maison change de voix', "★ contraste : le jour elle rit avec les clients / le soir c'est la maison qui parle"),
        N(R, 'balaie autour', "★ le geste du début revient à la fin : rien n'a bougé", lien='fleche'),
    ],
)

COPIES = {1: COPIE1, 2: COPIE2, 3: COPIE3}


def rendre(num):
    c = COPIES[num]
    gab = open(os.path.join(ICI, 'gabarit.html'), encoding='utf-8').read()
    cfg = {k: v for k, v in c.items() if k not in ('photo', 'nom', 'police')}
    page = gab.replace('/*CONFIG*/', json.dumps(cfg, ensure_ascii=False)).replace('__POLICE__', c['police'])
    chemin = os.path.join(ICI, f'copie{num}.html')
    open(chemin, 'w', encoding='utf-8').write(page)
    brut = os.path.join(ICI, f'brut-hd{num}.png')
    if os.path.exists(brut):
        os.remove(brut)
    r = subprocess.run(['google-chrome', '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
                        '--allow-file-access-from-files', '--force-device-scale-factor=4', '--window-size=816,1056',
                        '--virtual-time-budget=9000', f'--screenshot={brut}', 'file://' + chemin],
                       capture_output=True, text=True, timeout=120)
    if not os.path.exists(brut):
        print(r.stderr[-2000:]); sys.exit(1)
    return brut


def photo(num, brut):
    c = COPIES[num]; p = c['photo']; S = ECHELLE
    W, H = 1275 * S, 1650 * S
    im = Image.open(brut).convert('RGB').resize((W, H), Image.LANCZOS)
    if p.get('scan'):
        # Numérisée par une application : papier blanchi, contraste relevé, à plat ; reste un PDF (300 ppp)
        from PIL import ImageEnhance
        im = ImageEnhance.Brightness(im).enhance(1.06)
        im = ImageEnhance.Contrast(im).enhance(1.18)
        im = ImageEnhance.Color(im).enhance(1.05)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2 * S, percent=40, threshold=2))
        im = im.rotate(p.get('rotation', 0), resample=Image.BICUBIC, expand=False, fillcolor=(250, 250, 250))
        base = os.path.join(SORTIE, c['nom'])
        im.save(base + '.jpg', quality=QUALITE, optimize=True, dpi=(300, 300))
        Image.open(base + '.jpg').save(base + '.pdf', 'PDF', resolution=300)
        os.remove(base + '.jpg')
        print(c['nom'] + '.pdf', im.size, os.path.getsize(base + '.pdf'), 'octets')
        return base + '.pdf'
    im = im.filter(ImageFilter.GaussianBlur(p['flou'] * S))
    haut_bas = Image.linear_gradient('L').resize((W, H))
    gauche_droite = Image.linear_gradient('L').rotate(p.get('sens', 90), expand=True).resize((W, H))
    lum = ImageChops.add(haut_bas.point(lambda v: v * 0.5), gauche_droite.point(lambda v: v * 0.5))
    lum = lum.point(lambda v, k=p['lumiere']: int(255 - v * k)).filter(ImageFilter.GaussianBlur(40 * S))
    teinte = p.get('teinte', (1.0, 1.0, 0.985))
    im = ImageChops.multiply(im, Image.merge('RGB', [lum.point(lambda v, t=t: int(v * t)) for t in teinte]))
    # Le grain, tiré à la définition d'avant puis agrandi : même aspect qu'avant, à l'échelle de la page
    bruit = Image.effect_noise((W // S, H // S), 9).resize((W, H), Image.BICUBIC)
    bruit = bruit.point(lambda v: int(128 + (v - 128) * p['grain']))
    im = Image.blend(im, ImageChops.multiply(im, Image.merge('RGB', [bruit.point(lambda v: min(255, v + 120))] * 3)), 0.5)
    if p.get('perspective'):
        d = p['perspective'] * S
        im = im.transform((W, H), Image.QUAD, (d, 0, 0, H, W, H - d * 0.4, W - d * 0.6, d * 0.3), resample=Image.BICUBIC, fillcolor=p['fond'])
    im = im.rotate(p['rotation'], resample=Image.BICUBIC, expand=True, fillcolor=p['fond'])
    cx, cy = im.size[0] // 2, im.size[1] // 2
    im = im.crop((cx - W // 2, cy - H // 2, cx + W // 2, cy + H // 2))
    sortie = os.path.join(SORTIE, c['nom'] + '.jpg')
    im.save(sortie, quality=QUALITE, optimize=True, dpi=(300, 300))
    print(c['nom'] + '.jpg', im.size, os.path.getsize(sortie), 'octets')
    return sortie


if __name__ == '__main__':
    for n in [int(a) for a in sys.argv[1:]] or sorted(COPIES):
        photo(n, rendre(n))
