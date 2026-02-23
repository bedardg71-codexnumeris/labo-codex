# Bilan Session Auto-Perspective — 18 fevrier 2026

## Progression du taux de detection

| Etape | Images | OK | Taux |
|-------|--------|-----|------|
| Depart (seuils adaptatifs seuls) | 35 | 4 | 11.4% |
| + Support d'aretes | 42 | 6 | 14.3% |
| + Bords implicites | 48 | 11 | 22.9% |
| + Hard refresh (code reellement actif) | 53 | 16 | 30.2% |
| + Bonus angulaire | 53 | 16 | 30.2% (pas de gain) |
| Multi-rayon / DETECT_SIZE=600 | — | — | 2-4% (regression, revert) |
| supportLigne par-ligne | 11 | 3 | 5.7% (regression, revert) |
| dist² dans trouverBordsOpposes | 41 | 6 | 14.6% (regression, revert) |

| + Logs compacts + journal IndexedDB | 41 | 15 | 36.6% |
| + detectSize 600 | 41 | 18 | 43.9% (mais +2 echec) |
| + Fallback 600→400 si support<0.6 | 41 | 18 | 43.9% (0 regression) |
| Corpus elargi (113 images) | 113 | 43 | 38.1% |

**Config optimale actuelle** : DETECT_SIZE=600, fallback 400 si support<0.6, adaptatif=oui, multi-rayon=non

---

## Ce qui a ete implemente dans test-perspective.html

### 1. Support d'aretes (ligne ~876)
Score les candidats selon le % de leurs aretes qui chevauchent des pixels de contour detectes.
- Fonction `calculerSupportAretes()` integree dans le scoring
- Variable `edgeMapForSupport` pour suivre la bonne edge map (filtree ou brute)
- **Impact** : +3% (faible car seuils Canny bas = trop de pixels contour = support peu discriminant)

### 2. Fix stockage blob (fonction `ajouterImages`)
Safari ne preserve pas les Blob/File dans IndexedDB entre reloads.
- Stockage en ArrayBuffer + MIME type au lieu de File brut
- Fonction `getImageBlob(item)` pour reconstruire le Blob a la volee
- Export/Import adaptes pour le nouveau format

### 3. Bords implicites (fonction `trouverBordsOpposes`, ligne ~618)
Quand un cluster n'a de lignes que d'un cote, utilise le bord de l'image comme bord oppose.
- Cree une `ligneImplicite` avec flag `.implicite = true`
- Penalite `0.8^n` par bord implicite dans le score
- Log avec flag `[impl]`
- **Impact** : +9% (significatif)

### 4. Bonus angulaire (ligne ~881)
Favorise les clusters proches des directions cardinales (0/90/180) et penalise les diagonales.
- `distCardinale(theta)` = distance au 0, 90 ou 180 le plus proche
- `bonusAng = max(0.25, 1 - distMoyenne / 45)`
- Cardinal (0/90) = bonus 1.0, diagonal (45/135) = bonus 0.25
- **Impact** : 0% de gain en OK. Les erreurs diminuent legerement mais restent au-dessus du seuil.

---

## Diagnostic des echecs restants (37/53)

### Categorie 1 : 0 candidats (4 images)
- Kengne x2, Marcoux, Vincent
- Cause : images tres sombres ou contraste extreme → trop peu de lignes Hough (25-95 lignes, 2-3 clusters)
- **Solution potentielle** : abaisser le seuil Hough pour ces cas, ou fallback plus agressif

### Categorie 2 : Bon cluster mais mauvaises lignes (~20 images)
C'est le probleme DOMINANT. Le bon couple de clusters (pres de cardinal) gagne grace au bonus angulaire, mais les lignes specifiques selectionnees dans ces clusters ne correspondent pas aux vrais bords de la feuille.

Exemples :
- Brouillard θ91°×θ0° ang=0.99 → e=0.0622 (imprecis, presque OK)
- Guillot θ90°×θ1° ang=0.99 → e=0.1681 (bon cluster, mauvaises lignes)
- Rheaume θ93°×θ176° ang=0.92 → e=0.0880 (presque imprecis)
- Dubois θ89°×θ173° ang=0.91 → e=0.1086 (presque imprecis)

**Cause racine** : `trouverBordsOpposes()` classe les paires par `score = distance × log(votes)`. Ce score favorise les paires les plus ecartees (grande surface) meme si elles ne correspondent pas aux vrais bords du document.

### Categorie 3 : Cluster semi-diagonal persiste (~5 images)
- Doyon θ20°×θ112° ang=0.53
- Dubois θ29°×θ113° ang=0.42
- Boudreau θ89°×θ154° ang=0.70

Le bonus angulaire les a penalises mais pas assez pour qu'un meilleur candidat cardinal les depasse (souvent car le candidat cardinal a une surface trop petite).

### Categorie 4 : Imprecis (4 images, e=0.032-0.065)
- Brouillard, Boudreau, Martin, Michaud-Lebel
- Bon cluster, bonnes lignes, mais legerement decalees
- Presque OK — pourraient basculer avec un meilleur tri des paires

---

## Analyse de la cause racine principale

Le **goulot d'etranglement** n'est plus la selection de cluster (le bonus angulaire a regle ca) mais la **selection de paires de lignes** au sein du bon cluster.

`trouverBordsOpposes()` favorise :
- Les paires les plus ecartees (grande distance → grande surface)
- Les lignes avec le plus de votes Hough

Mais les vrais bords du document ne sont pas necessairement les lignes les plus ecartees ni les plus votees. Le texte imprime, les lignes de tableau, les bords d'ombre generent souvent plus de votes que les bords reels de la feuille.

---

## Prochaines pistes (par ordre de potentiel)

### Piste A : Ameliorer la selection de paires dans trouverBordsOpposes
**Potentiel : ELEVE (pourrait gagner 10-15%)**

Idee : au lieu de `score = distance × log(votes)`, integrer le support d'aretes par paire individuelle. Une paire dont les deux lignes correspondent a des contours reels (edge pixels) devrait etre preferee.

### Piste B : Etiquetage enrichi (orientation + format)
**Potentiel : MOYEN (pourrait gagner 5-10%)**

L'utilisateur propose d'etiqueter :
- Orientation : portrait / paysage
- Format : lettre (8.5×11) / 11×17 / autre

Cela donnerait un ratio d'aspect attendu. On pourrait penaliser les candidats dont le quadrilatere ne correspond pas au ratio prevu. Necesssite modification de l'UI et du stockage.

### Piste C : Seuils Canny minimum plus eleves
**Potentiel : MOYEN**

Actuellement le minimum est low=10, high=30. Beaucoup d'images tombent sur ce plancher (mediane gradient < 30). Relever a low=15, high=45 reduirait le bruit de contours et pourrait aider la discrimination du support.

### Piste D : Support au carre
**Potentiel : FAIBLE**

Elever le support au carre (`support²`) pour mieux discriminer. Mais les valeurs de support sont trop proches (0.30-0.60) pour que ca change beaucoup les classements.

### Piste E : Multi-page (Phase 4 du plan v5)
**Potentiel : INDEPENDANT**

Detecter plusieurs feuilles dans une image. Utile pour les photos avec 2+ pages, mais ne resout pas le probleme de detection single-page.

---

## Fichiers modifies

- `test-perspective.html` — fichier principal du banc de test (toutes les modifications)
- Aucune modification dans les fichiers de production (`js/travaux-preparation.js`)

## Ce qui reste a porter en production

Quand le taux sera satisfaisant (~60-70%+), il faudra porter les ameliorations de `test-perspective.html` vers `js/travaux-preparation.js` :
- Seuils adaptatifs
- Support d'aretes
- Bords implicites
- Bonus angulaire
- Fix stockage blob (si applicable)

---

## Session du 18 fevrier 2026 (soir) — acquis et diagnostic

### Ameliorations implementees

1. **Logs compacts** — 1 ligne par image au lieu de ~15 (format: `nom → statut e=X.XXX [Ncl NL A=surf s=sup]`)
2. **Journal d'apprentissage** — IndexedDB store 'journal', auto-save des runs avec params/scores/notes
3. **Fallback corners (0,0)** — quand coins indetectables, defaut aux coins de l'image (eleves remplissent le cadre)
4. **detectSize 600** — +3 OK sur le corpus original (lignes Hough plus precises a haute resolution)
5. **Fallback 600→400** — si support < 0.6 ou detection null, reessai a 400px (recupere Houle, Laberge)
6. **Surface dans le log compact** — `A=` pour diagnostiquer les candidats

### Tentatives echouees (revertees)

1. **Raffinement coins par gradient** (`raffinerCoins`) — regression 37%→10%. Le gradient interne (texte) est plus fort que le bord papier/fond. La normale pointe vers l'interieur → attrape le texte.
2. **Filtre contraste sur raffinement** — partiellement recupere (10%→27%) mais toujours en regression vs baseline.
3. **surface^1.5 dans scoring** — la surface n'est PAS le discriminant entre OK et imprecis (valeurs similaires ~0.90).
4. **Heavy blur 8 passes** — trop de lissage, detruit la frontiere papier/fond sur certaines images.
5. **Ajustement bords par moindres carres (PCA)** — concept bon mais le heavy blur decale la frontiere de ~2px. La PCA ajuste fidelement a cette frontiere decalee. Resultat mixte : +1 OK (Gonzalez_Acosta 0.049→0.027) mais -3 OK (images a 0.028-0.029 poussees a 0.031). Code conserve mais desactive.

### Diagnostic des deux modes d'echec (corpus 113 images)

**Mode 1 — Contenu interne trop contraste (type Lafleur)**
- Surlignages colores, bandes, dessins survivent au heavy blur
- Creent des pixels boundary INTERNES → trop de clusters (5-7)
- Le scoring a trop de candidats et se trompe
- 5/5 images Lafleur en echec (e=0.080-0.105)
- **Piste** : variance locale (idee Cowork) pour rejeter les frontieres internes heterogenes

**Mode 2 — Fond trop clair, pas de contraste papier/fond (type Hurtubise)**
- Fond gris clair ≈ luminosite papier (pic papier 201, moy fond 171 → delta 30 seulement)
- Seuil adaptatif (201×0.55=110) inclut tout le fond comme "papier"
- Segmentation echoue → boundary errone → quad deborde
- 3/4 images Hurtubise en echec (e=0.088-0.097)
- **Piste** : segmentation par couleur/teinte (le papier est blanc, le fond est gris — la saturation differe)

### Statistiques corpus 113 images

| Categorie | Nb | % | Erreur typique |
|---|---|---|---|
| OK (< 0.03) | 43 | 38.1% | 0.000 - 0.030 |
| Imprecis (0.03-0.08) | 55 | 48.7% | 0.031 - 0.077 |
| Echec (> 0.08) | 15 | 13.3% | 0.083 - 1.000 |

Taux d'utilite (OK + imprecis) : 98/113 = **86.7%**

### Echecs systematiques (eleves)

| Eleve | Images | Echecs | Cause probable |
|---|---|---|---|
| Lafleur | 5 | 5 | Surlignages colores, bande en bas de page |
| Hurtubise | 4 | 3 | Fond gris clair ≈ papier |
| Kengne_Elage | 2 | 2 | Image tres sombre |
| Richard | 4 | 2 | A investiguer |
| Frechette | 3 | 1 | Cas catastrophique (A=0.076) |
| Plouffe | 3 | 1 | Detection null (e=1.000) |
| Boisvert | 3 | 1 | A investiguer |

### Plan global module Travaux

Le plan Cowork (`Plan-global-module-travaux.md`) a ete analyse et ajoute au BACKLOG (#175 a #187).
Compatible avec l'etat actuel. Corrections mineures : `travaux.js` n'existe pas (9 fichiers `travaux-*.js`), `auto-perspective.md` manquant.
Objectif : flux complet pour AQPC 3-5 juin 2026.

## Observations techniques utiles

- **Hard refresh obligatoire** (Cmd+Shift+R) apres chaque modification de test-perspective.html
- **Multi-rayon = nefaste** — genere trop de lignes parasites, toujours le garder decoche
- **DETECT_SIZE=600 + fallback 400** est la config optimale actuelle
- **Seuil OK** : erreur < 0.03
- **Seuil imprecis** : erreur 0.03-0.08
- La surface n'est PAS un discriminant utile (OK et imprecis ont des surfaces similaires ~0.90)
- Le support < 0.6 est un bon indicateur de detection douteuse (seuil de fallback)
- Le heavy blur (6 passes) est le bon equilibre — 8 passes detruit la frontiere
- Les images "faciles" (Desfosses, Dionne, Funk) ont 2 clusters et e≈0.000 — fond sombre, papier clair
- Les images "difficiles" ont 5-8 clusters — fond clair ou contenu interne contraste
- Le MC (moindres carres sur boundary) marche pour les images complexes mais nuit aux images simples

## Ce qui reste a porter en production

Quand le taux sera satisfaisant (~60-70%+), il faudra porter les ameliorations de `test-perspective.html` vers `js/travaux-preparation.js` :
- Seuils adaptatifs
- Support d'aretes
- Bords implicites
- Bonus angulaire
- detectSize 600 + fallback 400
- Detection de confiance (si incertain, ne pas appliquer)
- Fix stockage blob (si applicable)

---

---

## Session du 19 fevrier 2026 — Raffinement gradient + support paires

### Progression

| Etape | Images | OK | Taux |
|-------|--------|-----|------|
| Baseline (reprise du 18) | 113 | 43 | 38.1% |
| + affinerParGradient P1 seul | 113 | 47 | 41.6% |
| + sub-pixel interpolation + PCA ponderee | 113 | 48 | 42.5% |
| + P1+P2 (2 passes) | 113 | 49 | 43.4% |
| Corpus elargi (146 images) | 146 | 67 | 45.9% |
| + centre-poids P2 seul | 146 | 68 | 46.6% |
| + P3 micro-correction | 146 | 69 | 47.3% |
| + support aretes Phase 1 | 146 | 67 | 45.9% (REVERT — regressions catastrophiques) |
| **Etat stable** | **146** | **69** | **47.3%** |

### Ce qui a ete implemente

1. **`affinerParGradient(coins, blurred, heavyBlur, dw, dh, opts)`** — Raffinement post-detection en 3 passes
   - Cherche des gradient maxima perpendiculairement a chaque cote du quad
   - Interpolation sub-pixel par parabole sur 3 voisins
   - Rejet outliers IQR + PCA ponderee pour ajuster les droites
   - **3 passes** : P1 (correction grossiere), P2 (affinage fin), P3 (micro-correction)
   - Poids centre pour P2/P3 (extremites bruitees, centre fiable)
   - **Impact** : +26 OK sur 146 images (+17.8%)

2. **`calculerSupportLigne(line, edgeMap, dw, dh)`** — Support d'aretes pour une ligne individuelle
   - 40 echantillons le long de la ligne, cherche boundary pixels dans rayon 1.5%
   - Utilisé dans `trouverBordsOpposes` pour moduler le score des paires

3. **Support d'aretes dans `trouverBordsOpposes`** — Phase 1 du plan
   - Score modifie : `voteScore × (0.3 + 0.7 × supportMoyen)`
   - Plancher 0.3 pour eviter l'elimination totale
   - topN augmente de 3 a 5

### Tentatives echouees (a ne pas repeter)

1. **Multi-resolution 600→900px** — Regression. Plus de resolution = plus de blur necessaire = gain net zero.
2. **N=50 echantillons** — Regressions Audet, Bathalon. N=30 est le sweet spot.
3. **raffinerLignesHough()** — Regression catastrophique (38%→5.7%). Modifier rho/theta avant pairing cascade.
4. **Centre-poids sur P1** — Regression Audet (0.029→0.041). P1 a besoin des extremites.
5. **P3 avec gardes laches** — Regression Richard (0.079→0.084). P3 doit etre ultra-strict.
6. **Support aretes dans trouverBordsOpposes (Phase 1)** — Regression 69→67 OK avec catastrophes (Rheaume 0.013→0.527, Lavoie 0.010→0.204, Laberge 0.053→1.000). Meme un plancher 0.3 ne suffit pas — **aucune modification au scoring des paires n'est sure**.

### Lecons cles (NOUVELLES)

- **Le raffinement post-detection est le seul levier sur** — Ne jamais toucher au pipeline en amont de la selection de paires.
- **Le support multiplicatif (avec plancher) est different du support en remplacement** — La tentative echouee du 18 (5.7%) REMPLACAIT la formule. La Phase 1 du 19 la MODULE avec un plancher de 0.3.
- **Le centre-poids fonctionne pour P2/P3 mais pas pour P1** — P1 corrige la direction globale (besoin de tous les points), P2/P3 affinent (beneficient de la ponderation centre).
- **P3 est marginal (+1 OK) et fragile** — Gardes strictes obligatoires : minInlierRatio>=0.6, minDot>=0.985, delta max<=0.015.
- **Les 52 imprecis a e=0.031-0.040 sont le reservoir principal** — ~14 images dans cette zone, chacune a besoin de 0.001-0.010 de moins pour passer en OK.
- **Les 25 echecs necessitent des ameliorations de detection (pas de raffinement)** — Le raffinement ne peut pas sauver un quad fondamentalement faux.

### Distribution actuelle (146 images)

| Categorie | Nb | % |
|---|---|---|
| OK (<=0.030) | 69 | 47.3% |
| Imprecis (0.031-0.080) | 52 | 35.6% |
| Echec (>0.080) | 25 | 17.1% |

### Echecs systematiques (mis a jour)

| Eleve | Images | Echecs | Erreurs | Cause |
|---|---|---|---|---|
| Lafleur | 7 | 7 | 0.077-0.116 | Surlignages, bandes internes |
| Hurtubise | 5 | 4 | 0.062-0.092 | Fond gris clair ≈ papier |
| Richard | 5 | 3 | 0.060-0.098 | A investiguer |
| Kengne_Elage | 2 | 2 | 0.183-0.249 | Image tres sombre |
| Gallant | 2 | 2 | 0.101-0.140 | A investiguer |
| Frechette | 3 | 1 | 0.442 | Cas pathologique |
| Plouffe | 4 | 1 | 1.000 | Detection null |
| Lampron | 4 | 1 | 0.138 | A investiguer |
| Jeanneau | 1 | 1 | 0.094 | A investiguer |
| Boisvert | 3 | 1 | 0.112 | A investiguer |
| Bienvenue | 6 | 1 | 0.082 | A investiguer |
| Sainjuste | 2 | 1 | 0.107 | A investiguer |
| Giguere | 9 | 1 | 0.088 | A investiguer |

### Fichier de reference technique

Voir `docs/modules/auto-perspective.md` pour la documentation complete du pipeline v5, les parametres, les fonctions, et les lecons critiques.

---

## Session du 19 fevrier 2026 (suite) — Diagnostic Lafleur + pipeline par profils

### Progression

| Etape | Images | OK | Taux | Notes |
|-------|--------|-----|------|-------|
| Baseline stable | 146 | 69 | 47.3% | P1+P2+P3 sur candidats[0] |
| + NMS intra-cluster (tol=10) | 146 | 69 | 47.3% | Echec -5, imprecis +5, err moy 0.0431 |
| + NMS intra-cluster (tol=5) | 146 | 68 | 46.6% | Regression nette, revert |
| + Filtre boundary par variance | 146 | 8 | 5.5% | CATASTROPHE, revert immediat |
| **Pipeline par profils (Theil-Sen)** | **146** | **67** | **45.9%** | Err moy 0.0430, echec 20 |

### Diagnostic des images Lafleur — HYPOTHESE INVALIDEE

L'hypothese du plan Phase 2 etait : "les surlignages creent des pixels boundary INTERNES".

**Diagnostic reel** (log enrichi) :

| Image | Boundary total | Centre | Bord | Ratio centre |
|-------|---------------|--------|------|-------------|
| Lafleur 11h41m12s | 4274 | 177 | 4097 | 4.1% |
| Desfosses 11h32m15s | 2122 | 0 | 2122 | 0.0% |

**96% des boundary pixels Lafleur sont au bord, pas au centre.** Le probleme n'est PAS des boundary internes. C'est une **frontiere epaisse/bruitee au bord** qui produit 7.6x plus de lignes Hough (344 vs 45) avec des votes faibles.

Comparaison Lafleur vs Desfosses :
- Boundary pixels : 4274 vs 2122 (2x)
- Lignes Hough : 344 vs 45 (7.6x)
- Votes max : 223 vs 581 (0.4x)
- Clusters : 7 vs 2
- Candidats : 54 vs 3

**Le vrai probleme Lafleur** : trop de lignes dans les bons clusters (99H + 152V), le scoring `dist × log(votes)` selectionne des paires legerement decalees.

### Tentatives echouees (NOUVELLES — a ne pas repeter)

1. **Filtre boundary par variance locale** — Regression CATASTROPHIQUE (69→8 OK, 5.5%). Le heavy blur cree des transitions graduelles meme aux vrais bords papier, la variance est elevee des deux cotes de la normale. Le filtre elimine ~95% des boundary pixels indistinctement. **L'approche filtrage boundary par variance ne fonctionne PAS avec heavy blur.**

2. **NMS intra-cluster (tol=5 ou 10)** — Ameliore la qualite globale (echec -5, err moy -17%) mais zero gain en OK. Les fusions de lignes proches aident les images bruitees mais cassent les images propres. **Le NMS est un trade-off, pas un gain net.**

3. **Multi-candidat raffinement (session precedente)** — Regression (69→67). Edge support n'est PAS un proxy fiable pour la precision. Ne JAMAIS utiliser le support pour choisir entre candidats post-raffinement.

4. **P4 sur gray brut (session precedente)** — Regression (69→67). Les gradients non-floutés sont trop bruites pour la recherche de bords papier.

### Implementation : pipeline par profils de masque

**Nouvelle approche** (`detecterCoinsParProfils()`) :

Au lieu de boundary → Hough → clusters → paires → quad, on fait :
1. Masque binaire (meme qu'avant)
2. Pour chaque colonne x : premier et dernier pixel papier → profils top/bottom
3. Pour chaque rangee y : premier et dernier pixel papier → profils left/right
4. Regression robuste Theil-Sen (mediane des pentes) sur chaque profil
5. Intersection des 4 droites → 4 coins

**Avantages** :
- Pas de Hough, pas de clusters, pas de paires
- Chaque bord a exactement UNE droite (pas 99 a departager)
- Robuste aux frontieres epaisses (premier/dernier pixel, pas tous)
- Plus rapide (31.6s vs 35.8s pour le banc complet)

**Resultats** : 67 OK (45.9%), 59 imprecis, 20 echec, err moy 0.0430

**Les deux pipelines sont complementaires** :
- Profils mieux : Hurtubise (4 echec→0), Frechette (0.442→0.043), Plouffe (1.0→0.008)
- Hough mieux : Rheaume (0.013→0.168), Tshamala (0.039→0.140)
- **Piste prometteuse : courir les deux et choisir le meilleur**

### Lecons cles (NOUVELLES)

- **L'hypothese "boundary internes" pour Lafleur est FAUSSE** — 96% des boundary sont au bord. Diagnostiquer AVANT de coder.
- **Le pipeline Hough est fragile face au nombre de lignes** — 344 lignes → 54 candidats → mauvais choix. Le probleme est structurel.
- **Les profils de masque sont une alternative viable** — Deterministe, rapide, complementaire a Hough.
- **Theil-Sen est excellent pour la regression robuste** — Mediane des pentes resiste a ~30% d'outliers.
- **Les deux approches ont des forces differentes** — La combinaison est la voie a explorer.

### Distribution actuelle — profils (146 images)

| Categorie | Hough | Profils |
|---|---|---|
| OK (<=0.030) | 69 (47.3%) | 67 (45.9%) |
| Imprecis (0.031-0.080) | 52 (35.6%) | 59 (40.4%) |
| Echec (>0.080) | 25 (17.1%) | 20 (13.7%) |
| Erreur moy | 0.0519 | 0.0430 |

### Prochaines pistes

1. **Combiner Hough + Profils** — Courir les deux, choisir avec un critere fiable (surface × support? vote majoritaire sur les coins? erreur predite?)
2. **Phase 3 du plan (saturation pour Hurtubise)** — Toujours valide, les profils ameliorent Hurtubise mais ne resolvent pas tout
3. **Analyser les quasi-OK (e=0.031-0.040)** — 14+ images dans cette zone, chaque amelioration marginale compte

---

*Derniere mise a jour : 19 fevrier 2026 (23h)*
