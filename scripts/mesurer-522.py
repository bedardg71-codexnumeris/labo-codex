#!/usr/bin/env python3
"""mesurer-522.py — recenser les courses lecture-modification-ecriture.

POURQUOI CET OUTIL EXISTE (30 aout 2026)
Le rapport `Rapports/AUDIT-522-courses-lecture-ecriture-2026-08-30.md` rend le
CRITERE et le decoupage en lots, mais il n'a laisse AUCUN outil. Chaque lot a
donc du remesurer — et les trois lots mesures l'ont ete au-dessus de leur
annonce : lot 2 (39 annonces, 54 mesures, +38 %), lot 3 (21 / 31, +48 %),
lot 5 (15 / 29, +93 %). #599 n'etait meme pas compte : la ligne
« bibliotheques, 14 sites » du rapport ne decrivait que les appelants du helper.
⮕ NE JAMAIS PARTIR DU CHIFFRE DE L'AUDIT. Relancer ce script.

USAGE
    python3 scripts/mesurer-522.py ""              # tout le depot (motif vide)
    python3 scripts/mesurer-522.py                 # SANS argument : les cles du lot 3 seulement
    python3 scripts/mesurer-522.py cartouches_     # les cles contenant ce motif
    python3 scripts/mesurer-522.py "cle('productions')"

CE QU'IL FAIT, ET LES TROIS PIEGES QU'IL A FALLU PAYER POUR L'ECRIRE

1. IL APPARIE SUR L'EXPRESSION DE CLE, PAS SUR UNE CHAINE. Les cles ne sont pas
   toutes des litteraux : `cartouches_${grilleId}` est un GABARIT,
   `CLE_BIBLIOTHEQUE_GRILLES` une CONSTANTE, `getCleProductions()` un APPEL. Un
   balayage par chaine ne voit ni le premier ni le troisieme.

2. IL CANONISE LES ALIAS (table ALIAS ci-dessous). `getCleProductions()` REND
   `cle('productions')`, et `cleProductions` est une locale qui vaut la meme
   chose. Sans canonisation, une lecture par l'une et une ecriture par l'autre
   dans la MEME fonction passent pour deux cles differentes — et la course est
   invisible. ⮕ TOUT LOT SUIVANT DOIT VERIFIER SES ALIAS AVANT DE COMPTER, et
   les ajouter ici.

3. IL A DES FAUX POSITIFS, ET IL FAUT LES LIRE. Une fonction qui LIT une cle
   pour chiffrer une question, puis y ECRIT une CONSTANTE, est signalee alors
   qu'elle n'est pas en course : la valeur ecrite ne derive pas de la lecture.
   Cas connu : `reinitialiserEtudiantsV2` (`db.set(cleEtud, [])`). ⮕ Le script
   dit ou regarder, il ne dit pas quoi faire. Lire chaque site.

LES TROIS REGIMES (section 2 du rapport, et R2 est le contre-intuitif)
  R1  lecture `await db.get(...)`            -> course, la lecture rend la main
  R2  `db.getSync(...)` puis `await db.set`  -> course AUSSI : dans `db.set`,
      l'ecriture IndexedDB est attendue AVANT le rafraichissement de
      localStorage, et `getSync` rend l'ancienne valeur pendant tout
      l'aller-retour. « Lecture synchrone » ne veut pas dire « atomique ».
  R3  getSync -> setSync, sans suspension    -> sur, le mono-thread suffit

METHODE : commentaires et chaines neutralises A LONGUEUR CONSTANTE (les offsets
restent valides, et une cle citee dans un commentaire ne compte pas) ; bornes de
fonction par appariement d'accolades ; appariement lecture/ecriture sur la meme
cle, dans la meme fonction, la lecture RETENUE etant la derniere avant l'ecriture.
"""

import re, sys, os

def neutraliser(src):
    """Commentaires retires A LONGUEUR CONSTANTE ; le contenu des chaines est
    GARDE (les cles y vivent), mais les echappements sont sautes."""
    out = list(src)
    i, n, etat = 0, len(src), None
    while i < n:
        c = src[i]
        suivant = src[i+1] if i + 1 < n else ''
        if etat is None:
            if c == '/' and suivant == '/':
                etat = 'ligne'; out[i] = out[i+1] = ' '; i += 2; continue
            if c == '/' and suivant == '*':
                etat = 'bloc'; out[i] = out[i+1] = ' '; i += 2; continue
            if c in '"\'`':
                etat = c; i += 1; continue
            i += 1; continue
        if etat == 'ligne':
            if c == '\n': etat = None
            else: out[i] = ' '
            i += 1; continue
        if etat == 'bloc':
            if c == '*' and suivant == '/':
                out[i] = out[i+1] = ' '; etat = None; i += 2; continue
            if c != '\n': out[i] = ' '
            i += 1; continue
        if c == '\\':
            i += 2; continue
        if c == etat:
            etat = None
        i += 1
    return ''.join(out)

def premier_argument(src, ouvrante):
    """Texte du premier argument, depuis la parenthese ouvrante donnee."""
    prof, i, debut = 0, ouvrante, ouvrante + 1
    while i < len(src):
        c = src[i]
        if c in '([{': prof += 1
        elif c in ')]}':
            prof -= 1
            if prof == 0:
                return src[debut:i].strip(), i
        elif c == ',' and prof == 1:
            return src[debut:i].strip(), i
        i += 1
    return None, ouvrante

# Deux ECRITURES pour une seule cle : `getCleProductions()` REND `cle('productions')`,
# et `cleProductions` est une locale qui vaut la meme chose. Sans cette table,
# une lecture par l'une et une ecriture par l'autre, dans la meme fonction,
# passeraient pour deux cles differentes — et la course serait invisible.
ALIAS = {
    "getCleProductions()": "cle('productions')",
    "cleProductions": "cle('productions')",
}

def normaliser(expr):
    e = re.sub(r'\s+', '', expr)
    return ALIAS.get(e, e)

def fonctions(src):
    res = []
    motif = re.compile(r'\b(?:async\s+)?function\s*(\*?\s*[A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{'
                       r'|(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{'
                       r'|\b([A-Za-z0-9_$.]+)\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*\{'
                       r'|\b([A-Za-z0-9_$]+)\s*:\s*(?:async\s*)?function\s*\([^)]*\)\s*\{')
    for m in motif.finditer(src):
        nom = m.group(1) or m.group(2) or m.group(3) or m.group(4) or '(anonyme)'
        ouvre = src.index('{', m.end() - 1)
        prof, j = 0, ouvre
        while j < len(src):
            if src[j] == '{': prof += 1
            elif src[j] == '}':
                prof -= 1
                if prof == 0: break
            j += 1
        res.append((ouvre, j, nom.strip().replace('window.', '')))
    return res

def enclosante(fns, pos):
    cands = [f for f in fns if f[0] <= pos <= f[1]]
    return min(cands, key=lambda f: f[1] - f[0]) if cands else (0, 0, '(hors fonction)')

APPEL = re.compile(r'db\.(get|getSync|set|setSync|modifier)\s*\(')

def analyser(chemin, filtre):
    brut = open(chemin, encoding='utf-8').read()
    src = neutraliser(brut)
    fns = fonctions(src)
    debuts_lignes = [0] + [i + 1 for i, c in enumerate(brut) if c == '\n']
    def num(pos):
        lo, hi = 0, len(debuts_lignes) - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if debuts_lignes[mid] <= pos: lo = mid
            else: hi = mid - 1
        return lo + 1

    appels = []
    for m in APPEL.finditer(src):
        arg, _ = premier_argument(src, m.end() - 1)
        if arg is None: continue
        appels.append((m.start(), m.group(1), normaliser(arg)))

    trouves = []
    for pos, methode, cle in appels:
        if methode not in ('set', 'setSync'): continue
        if not filtre(cle): continue
        d, f, nom = enclosante(fns, pos)
        lectures = [a for a in appels
                    if d <= a[0] < pos and a[1] in ('get', 'getSync') and a[2] == cle]
        if not lectures: continue
        derniere = lectures[-1]
        entre = src[derniere[0]:pos]
        if derniere[1] == 'get':          regime = 'R1'
        elif methode == 'set':            regime = 'R2'
        elif 'await' in entre:            regime = 'R2'
        else:                             regime = 'R3'
        trouves.append((num(pos), nom, cle, derniere[1], methode, regime))
    return trouves

if __name__ == '__main__':
    motifs = sys.argv[1:] or ['cartouches_', 'roductions', 'CLE_BIBLIOTHEQUE']
    filtre = lambda cle: any(m in cle for m in motifs)
    racine = '/Users/kuekatsheu/Documents/GitHub/Monitorage_v6'
    total = {'R1': 0, 'R2': 0, 'R3': 0}
    for f in sorted(os.listdir(os.path.join(racine, 'js'))):
        if not f.endswith('.js') or f == 'db.js': continue
        r = analyser(os.path.join(racine, 'js', f), filtre)
        chauds = [x for x in r if x[5] != 'R3']
        if chauds:
            print('\n=== js/%s — %d en course, %d sûr(s) ===' % (f, len(chauds), len(r) - len(chauds)))
            for ligne, nom, cle, l, e, reg in r:
                print('%s%s:%d  %-34s %-34s %s->%s  %s'
                      % ('  ' if reg == 'R3' else '⚠ ', f, ligne, nom[:34], cle[:34], l, e, reg))
        for x in r: total[x[5]] += 1
    print('\nTOTAL  R1=%d  R2=%d  (en course : %d)   R3=%d (sûrs)'
          % (total['R1'], total['R2'], total['R1'] + total['R2'], total['R3']))
