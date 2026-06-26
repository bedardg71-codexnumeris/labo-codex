# Auto-detection des coins du document — Correction de perspective

> **Fichier labo** : `test-perspective.html` (developpement + banc de test 146 images)
> **Fichier production** : `js/travaux-preparation.js` (portage differe, voir Phase 5)
> **Derniere mise a jour** : 19 fevrier 2026

---

## Contexte du probleme

Quand un enseignant photographie les travaux d'eleves sur un bureau, la photo presente :

- **Document incline** (5-20° de rotation)
- **Perspective trapezoidale** (camera non perpendiculaire)
- **Coins hors cadre** : souvent 1-3 coins du document sont hors de l'image
- **Bruit visuel** : grain du bureau, texte imprime, annotations, surlignages colores, trous de perforation

L'objectif : detecter les **4 bords droits** du document, extrapoler les **coins par intersection**, puis corriger la perspective.

---

## Pipeline actuel (v5 — fevrier 2026)

```
Image source
  |
  v
1. Downscale (max 600px)            — resolution de travail
  |
  v
2. Grayscale (BT.601)               — luminance perceptuelle
  |
  v
3. Gaussian blur 5x5 (1 passe)      — "blurred" pour gradients
  |
  v
3b. Seuils adaptatifs               — Canny, luminosite, contraste
  |
  v
4. Canny edge detection             — garde pour fallback + support
  |
  v
5. Heavy blur (6 passes Gauss 5x5)  — sigma effectif ~12
  |
  v
5b. Masque binaire papier/fond      — seuil luminosite adaptatif
  |
  v
5c. Pixels boundary                 — papier adjacent a fond (8-voisins)
  |
  v
6. **Detection par profils** (NOUVEAU)  — Theil-Sen sur premier/dernier pixel papier
   OU fallback Hough si profils echouent
  |
  v
7. Raffinement gradient (3 passes) — P1 coarse, P2 fine, P3 micro
  |
  v
12. Coins finaux (coordonnees 0-1)
```

---

## Etapes cles

### 5. Heavy blur segmentation (innovation v5)

Le changement majeur vs v4 : au lieu de filtrer les aretes Canny par contraste (fragile),
on utilise un **flou tres lourd** (6 passes de Gaussian 5x5, sigma effectif ~12) pour
effacer toute texture interne (texte, grain) et ne garder que les grandes zones
papier/fond. Les pixels frontiere de ce masque sont les bords du document.

**Avantage** : insensible au texte, aux surlignages, aux annotations.
**Limitation** : echoue quand le fond a une luminosite proche du papier (ex: Élève-010, fond gris clair).

### 8. Selection de paires

`trouverBordsOpposes(cluster, distMin, cx, cy, topN, dw, dh)`

Score :
```
score = distance × (log(votesA) + log(votesB))
```

- Favorise les paires eloignees (grande surface) avec beaucoup de votes (lignes fortes)
- **topN = 3** paires par cluster
- Fallback bords implicites si aucune paire trouvee (bord de l'image)

**NE PAS MODIFIER CE SCORING** — voir Lecon #1. Le code contient `calculerSupportLigne`
et un support multiplicatif avec plancher 0.3, mais ils ne sont PAS actives (pas de
edgeMap passe). Tentative du 19 fev : regression catastrophique (Rheaume 0.013→0.527).

### 11. Raffinement par gradient (3 passes)

`affinerParGradient(coins, blurred, heavyBlur, dw, dh, opts)`

Pour chaque cote du quad :
1. Echantillonne N=30 points le long du cote (zone parametrable)
2. A chaque point, cherche le gradient maximum perpendiculairement (sur `blurred`)
3. Valide par contraste (sur `heavyBlur`) et alignement du gradient
4. **Interpolation sub-pixel** : parabole sur 3 voisins pour trouver le pic fractionnaire
5. **Rejet IQR** : elimine les outliers par ecart interquartile
6. **PCA ponderee** : ajuste une droite (poids = score gradient x poids centre)
7. Intersecte les 4 droites raffineres → nouveaux coins

| Parametre | P1 (coarse) | P2 (fine) | P3 (micro) |
|-----------|-------------|-----------|------------|
| rayon | 2.5% | 1.5% | 1.0% |
| minShift | 0.8px | 0.4px | 0.15px |
| minInlierRatio | 0.4 | 0.5 | 0.6 |
| minDot | 0.95 | 0.97 | 0.985 |
| centerWeight | non | oui | oui |
| zone echantillon | 10%-90% | 15%-85% | 15%-85% |
| delta accept | 0.001-0.10 | 0.0005-0.05 | 0.0002-0.015 |

**Centre-poids** (P2/P3 seulement) : les points proches du centre du cote recoivent
un poids plus eleve (`0.5 + 0.5 * sin(pi * tNorm)`). Aide pour les cotes bruites aux
extremites. **NE PAS activer pour P1** — cause des regressions sur les images simples
(ex: Élève-030 0.029 → 0.041 quand P1 utilise le centre-poids).

---

## Performances (banc de 146 images)

| Version | OK (<=0.030) | Imprecis (0.031-0.080) | Echec (>0.080) | Taux OK |
|---------|-------------|----------------------|---------------|---------|
| Baseline v5 sans raffinement | ~45 | ~70 | ~31 | ~31% |
| + P1 raffinement | ~49 | ~68 | ~29 | ~34% |
| + P1+P2 (2 passes) | ~49 | ~66 | ~31 | ~34% |
| + sub-pixel + PCA ponderee | ~65 | ~57 | ~24 | ~45% |
| + P3 micro | 69 | 52 | 25 | 47.3% |
| + support aretes Phase 1 | **a tester** | | | |

**Objectif** : 65%+ OK pour la demo AQPC (3-5 juin 2026).

---

## LECONS CRITIQUES — A LIRE ABSOLUMENT

### 1. NE JAMAIS modifier le pipeline en amont de la selection de paires

**C'est la regle la plus importante du projet.**

Tout changement aux etapes 1-8 (parametres Hough, clustering, scoring des paires,
raffinement des lignes Hough) cause des **regressions catastrophiques et imprevisibles**.

**Exemples de tentatives echouees :**

| Tentative | Resultat | Explication |
|-----------|----------|-------------|
| `raffinerLignesHough()` — ajuster rho/theta avant pairing | 38% → 5.7% | Modifier rho de ±2px change quelles paires sont formees, cascade totale |
| Remplacer la formule de score des paires (support pur) | 38% → 5.7% | Meme probleme — le ranking change, tout s'effondre |
| Support multiplicatif (plancher 0.3) dans paires | 69→67 OK, Rheaume 0.013→0.527 | Meme avec un plancher, le ranking change assez pour des cascades |
| topN de 3 a 5 (plus de paires candidates) | Teste avec le support, regression | Plus de paires = plus de combinaisons = plus de chances de choisir la mauvaise |
| Changer le seuil Hough | Variable | Nombre de lignes change → clusters differents → paires differentes |

**Pourquoi c'est si fragile** : le pipeline est une cascade de decisions discretes.
Une ligne en plus ou en moins change les clusters. Un cluster different change les
paires disponibles. Une paire differente change le quad. Le score du quad change.
Un autre candidat gagne. L'erreur peut passer de 0.01 a 0.50.

**Tentative Phase 1 (19 fev 2026)** : support d'aretes multiplicatif avec plancher 0.3
dans `trouverBordsOpposes`. Resultat : **regression 69/146 → 67/146** avec des echecs
catastrophiques (Rheaume 0.013→0.527, Élève-026 0.010→0.204, Élève-023 0.053→1.000).
Meme un facteur multiplicatif avec plancher change suffisamment le ranking des paires
pour declencher des cascades. **CONFIRME : aucune modification au scoring des paires
n'est sure.** Le code de support reste dans le fichier mais n'est PAS appele.

### 2. Le raffinement post-detection est le seul levier sur

Le raffinement par gradient (`affinerParGradient`) est un post-processing qui ne
modifie pas le pipeline de detection. Il ne peut que **corriger un quad deja proche**,
pas sauver un quad fondamentalement faux.

**Plafond estime** : le raffinement peut convertir ~15-20 images imprecis → OK,
mais ne peut rien pour les ~25 images echec (quad initial trop loin).

### 3. Multi-resolution ne fonctionne pas

Tentative : detecter a 600px, raffiner a 900px.
- Sans ajustement du blur : regression (features internes survivent a 900px)
- Avec blur scale (r^2) : neutre (plus de blur = meme precision nette)

Le gain de resolution est annule par le besoin de plus de flou. Abandonner.

### 4. N=30 echantillons est le sweet spot

- N=50 : regressions sur Élève-030, Élève-014 (surechantillonnage capture du bruit)
- N=30 : stable
- N<20 : pas teste, probablement insuffisant

### 5. Le centre-poids aide P2 mais nuit a P1

- P1 sans centre-poids : correction stable sur les cas faciles
- P2 avec centre-poids : aide les images complexes (Élève-022 0.042 → 0.003)
- P1 avec centre-poids : regression Élève-030 (0.029 → 0.041)

Le P1 a besoin de TOUS les points le long du cote (y compris les extremites)
pour estimer correctement la direction globale. Le P2, operant sur un quad deja
proche, beneficie de la ponderation centre qui ignore les coins bruites.

### 6. P3 est marginal mais fragile

P3 gagne ~1 OK (micro-corrections sur les quasi-OK) mais peut degrader
les images borderline echec si les gardes sont trop laches.

**Gardes strictes obligatoires** : `minInlierRatio >= 0.6, minDot >= 0.985, delta max <= 0.015`.

### 7. Le filtrage boundary par variance NE FONCTIONNE PAS avec heavy blur

Tentative Phase 2 du plan : filtrer les pixels boundary par la variance locale
le long de la normale au gradient. Regression CATASTROPHIQUE (69→8 OK, 5.5%).

**Cause** : le heavy blur (6 passes) cree des transitions graduelles de 10-20 pixels.
La variance est elevee des deux cotes de la normale MEME aux vrais bords papier.
Le filtre elimine indistinctement bons et mauvais pixels.

### 8. Le NMS intra-cluster est un trade-off, pas un gain net

Fusionner les lignes Hough de rho similaire (±5-10px) dans chaque cluster reduit
les echecs (-5) et l'erreur moyenne (-17%) mais cause des regressions sur les
images propres. **Le NMS n'augmente pas le taux de OK.**

### 9. Le support d'aretes n'est PAS un proxy fiable pour la precision

Tentative multi-candidat : raffiner les top-3 candidats, garder celui avec le
meilleur support post-raffinement. Regression (69→67). Les candidats avec
meilleur support ne sont pas plus precis. **Ne JAMAIS utiliser le support
pour choisir entre candidats.**

### 10. Le pipeline par profils est complementaire a Hough

Les profils de masque (Theil-Sen) et Hough ont des forces differentes :
- Profils : mieux pour les images bruitees (Élève-019, Élève-010, cas pathologiques)
- Hough : mieux pour les images avec contours nets (Rheaume, Élève-016)
- **La combinaison des deux est la voie a explorer.**

---

## Modes d'echec identifies

### Mode 1 — Frontiere epaisse/bruitee (Élève-019, ~7 images)

**DIAGNOSTIC CORRIGE (19 fev 2026)** : L'hypothese initiale ("boundary internes
depuis les surlignages") est **FAUSSE**. Mesure : 96% des boundary pixels sont au
bord de l'image, seulement 4% au centre. Le vrai probleme : la frontiere papier/fond
est epaisse et bruitee (4274 pixels vs 2122 pour une image propre), produisant 7.6x
plus de lignes Hough (344 vs 45) avec des votes faibles. Le scoring `dist × log(votes)`
sélectionne des paires legerement decalees parmi 54 candidats.

**Tentative echouee** : filtrage boundary par variance locale — regression catastrophique
(69→8 OK) car le heavy blur cree des transitions graduelles meme aux vrais bords.

**Piste actuelle** : le pipeline par profils (Theil-Sen) contourne le probleme en
n'utilisant pas Hough du tout. Mais ne resout pas completement les Élève-019 (e=0.073-0.113).

### Mode 2 — Faible contraste fond/papier (Élève-010, ~5 images)

Fond gris clair ≈ luminosite du papier (delta ~30). Le seuil `picPapier × 0.55`
inclut tout le fond → pas de bords detectes correctement. Erreurs 0.088-0.092.

**Piste** : segmentation assistee par saturation HSV (papier blanc = saturation ~0,
fond gris = legere teinte).

### Mode 3 — Mauvaise selection de paires (general, ~15 images)

Les vrais bords du document ne sont pas les lignes les plus ecartees ni les plus
votees. Le score `distance × log(votes)` favorise les grandes paires bien votees,
pas necessairement les vrais bords.

**Phase 1 du plan : ECHEC CONFIRME** — Le support d'aretes dans `trouverBordsOpposes`
cause des regressions catastrophiques meme avec un plancher. Aucune modification au
scoring des paires n'est sure.

**Piste actuelle** : le pipeline par profils contourne le scoring de paires entierement.

### Mode 4 — Cas pathologiques (Frechette 0.442, Élève-020 1.000)

Image tres sombre, cadrage extreme, ou quasi-absence de contraste.
Le pipeline par profils recupere certains de ces cas (Frechette 0.442→0.043,
Élève-020 1.000→0.008) car il ne depend pas du nombre de lignes Hough.

---

## Seuils adaptatifs

Trois fonctions calculent les seuils automatiquement a partir de l'image :

| Fonction | Entree | Sortie | Methode |
|----------|--------|--------|---------|
| `seuilsCannyAdaptatifs(blurred, dw, dh)` | gradient | `{low, high, mediane}` | Mediane du gradient × facteurs |
| `seuilLuminositeAdaptatif(gray, dw, dh)` | luminosite | `{seuil, picPapier}` | Histogramme → pic papier × 0.55 |
| `seuilContrasteAdaptatif(gray, dw, dh)` | luminosite | `{seuil, ecartType, moyenne}` | Ecart-type × facteur |

Le mode adaptatif (`P.adaptatif = true`) est le mode par defaut du banc.

---

## Constantes et seuils (v5)

| Constante | Valeur | Role |
|-----------|--------|------|
| `detectSize` | 600 | Taille max detection (px) — etait 400 en v4 |
| `cannyLow/High` | adaptatif | Seuils Canny |
| `luminositeMin` | adaptatif | Seuil masque papier/fond (heavy blur) |
| `contrasteMin` | adaptatif | Seuil contraste aretes |
| `clusterTol` | 8° | Tolerance clustering Hough |
| `fusionTol` | 10° | Tolerance fusion wraparound |
| Perpendicularite | 60°-120° | Ecart angulaire entre clusters |
| `PERSPECTIVE_MARGE` | 1.0 | Coins hors cadre autorises a 100% |
| Seuil Hough boundary | `max(15, 6% × min(dw,dh))` | Votes min (boundary) |
| topN paires | 3 | Paires candidates par cluster (5 teste, regression) |

---

## Fonctions (reference, dans test-perspective.html)

| Fonction | Role |
|----------|------|
| `detecterCoinsDocument(source, P)` | Pipeline complete |
| `seuilsCannyAdaptatifs(blurred, dw, dh)` | Seuils Canny adaptatifs |
| `seuilLuminositeAdaptatif(gray, dw, dh)` | Seuil luminosite adaptatif |
| `seuilContrasteAdaptatif(gray, dw, dh)` | Seuil contraste adaptatif |
| `calculerSupportAretes(coins, edgeMap, dw, dh)` | Support d'aretes pour un quad |
| `calculerSupportLigne(line, edgeMap, dw, dh)` | Support d'aretes pour une ligne |
| `trouverBordsOpposes(cluster, ..., edgeMap)` | Paires de bords opposes (avec support) |
| `affinerParGradient(coins, blurred, heavyBlur, dw, dh, opts)` | Raffinement gradient (3 passes) |
| `erreurMoyennePixels(a, b, dw, dh)` | Distance moyenne entre deux quads |
| `gaussianBlur5x5(src, w, h)` | Flou gaussien 5x5 |
| `cannyEdgeDetection(src, w, h, P)` | Detection d'aretes Canny |
| `filtrerAretesDocument(edges, blurred, dw, dh, P)` | Filtre contraste (fallback) |
| `houghLines(edges, dw, dh, seuil)` | Transformee de Hough + NMS |
| `clusteriserLignesParAngle(lines, tol)` | Clustering angulaire |
| `intersectionLignes(l1, l2)` | Intersection de 2 droites Hough |
| `ordonnerCoins(points)` | Ordonnancement TL, TR, BR, BL |
| `surfaceQuad(pts)` | Aire (formule du lacet) |

### Fonctions legacy (non utilisees, a supprimer)

- `raffinerLignesHough()` — tentative echouee de raffinement des lignes avant pairing
- `seuilOtsu()`, `fermetureMorphologique()`, `extraireBordure()` — ancienne approche v2

---

## Plan de travail restant

Voir le fichier plan detaille pour les phases completes. Resume :

| Phase | Statut | Description |
|-------|--------|-------------|
| 1 — Support aretes paires | **ECHEC (revert)** | Regression catastrophique meme avec plancher 0.3 |
| 2 — Variance boundary | A faire | Filtrer boundary par variance locale (Mode 1) |
| 3 — Saturation HSV | A faire | Segmentation assistee par saturation (Mode 2) |
| 4 — Ajustements fins | A faire | Quasi-OK + parametres fins |
| 5 — Portage production | Differe | Copier dans `js/travaux-preparation.js` |
| 6 — Demo AQPC | Differe | Indicateur confiance + degradation gracieuse |

**Prerequis portage** : taux stable a 60-70%+ sur le banc de 146 images.

---

## Historique des approches

### v1 — Canny + Hough direct (echec)
Canny → Hough → 2 clusters les plus votes → coins.
Texte imprime domine les votes Hough.

### v2 — Otsu + morphologie (echec)
Segmentation Otsu → fermeture morphologique → bordure → Hough.
Artefacts en escalier faussent les angles.

### v3 — Multi-candidats par surface (partiel)
Toutes les paires de clusters, scoring par surface.
Paires non-rectangulaires produisent des quads geants.

### v4 — Filtre contraste + perpendicularite (fevrier 2026 debut)
Detection a 400px, filtre contraste papier/fond, perpendicularite 60-120°.
Fonctionne sur les cas faciles mais fragile sur les images reelles.

### v5 — Heavy blur segmentation + raffinement gradient (fevrier 2026)
Detection a 600px, heavy blur 6 passes, boundary pixels, seuils adaptatifs,
scoring avec support d'aretes, raffinement gradient 3 passes.
**47.3% OK sur 146 images** (en progression).
