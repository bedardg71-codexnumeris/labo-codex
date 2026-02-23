# Plan de travail — Auto-perspective : de 38% a 65%+

**Date** : 20 fevrier 2026

---

## Contexte

Le taux de detection OK est a 38.1% (43/113 images). Le taux d'utilite (OK + imprecis) est a 86.7%.
L'objectif est d'atteindre 60-70% OK avant d'integrer en production pour la demo AQPC (3-5 juin 2026).

Trois modes d'echec ont ete identifies. Le plan les adresse par ordre d'impact decroissant.

**Fichier principal** : `test-perspective.html` (toutes les modifications)
**Fichier production** : `js/travaux-preparation.js` (portage Phase 5)

**Config optimale actuelle** : DETECT_SIZE=600, fallback 400 si support<0.6, adaptatif=oui, multi-rayon=non

---

## Etat des lieux — ce qui est deja implemente

- Seuils Canny adaptatifs (mediane des gradients)
- Seuil de luminosite adaptatif (pic papier dans histogramme)
- Seuil de contraste adaptatif (ecart-type)
- Support d'aretes dans le scoring (`calculerSupportAretes`)
- Bords implicites (bord de l'image comme fallback)
- Bonus angulaire (favorise les directions cardinales)
- Heavy blur segmentation (6 passes gaussiennes)
- detectSize 600 + fallback a 400px
- Logs compacts + journal IndexedDB
- Banc de test avec 113 images etiquetees

## Tentatives echouees (a ne pas repeter)

- Multi-rayon dans filtrerAretesDocument : trop de lignes parasites
- surface^1.5 dans scoring : la surface n'est PAS un discriminant
- Heavy blur 8 passes : detruit la frontiere papier/fond
- Raffinement coins par gradient (raffinerCoins) : le gradient du texte > bord papier
- PCA moindres carres sur boundary : le heavy blur decale la frontiere de ~2px
- supportLigne par-ligne (remplacement de la formule) : regression 37% -> 5.7%

---

## Phase 1 — Support d'aretes dans la selection de paires (Mode 3 : ~20 images)

**Impact attendu : +10-14% (38% -> 48-52%)**
**STATUT : ECHEC — REVERT (19 fev 2026)**
**Resultat : 69/146 → 67/146 avec regressions catastrophiques (Rheaume 0.013→0.527)**

Le probleme dominant : `trouverBordsOpposes()` score les paires par `distance x log(votes)`. Les vrais bords du document ne sont pas forcement les plus ecartees ni les plus votees.

### Ce qui a ete fait

1. ✅ **`calculerSupportLigne(line, edgeMap, dw, dh)`** — 40 echantillons, rayon 1.5%
2. ✅ **Score modifie** : `voteScore × (0.3 + 0.7 × supportMoyen)` avec plancher 0.3
3. ✅ **topN augmente de 3 a 5**
4. ✅ **edgeMapForSupport propage aux appels**

### Aussi implemente (hors plan original)

- ✅ **Raffinement gradient 3 passes** (P1 coarse + P2 fine + P3 micro)
- ✅ **Interpolation sub-pixel** (parabole sur 3 voisins)
- ✅ **PCA ponderee** (poids = gradient × centre)
- ✅ **Centre-poids conditionnel** (P2/P3 seulement, pas P1)
- ✅ **Corpus elargi a 146 images**

### Resultat : REVERT a 69/146 (47.3%)

Le support multiplicatif dans les paires cause des regressions catastrophiques malgre le plancher 0.3.
**CONFIRME : aucune modification au scoring des paires n'est sure.**
Le code de `calculerSupportLigne` et le support dans `trouverBordsOpposes` restent mais ne sont PAS appeles.

---

## Phase 2 — Filtrage par variance locale des pixels boundary (Mode 1 : Lafleur)

**Impact attendu : +3-6% (52% -> 55-58%)**

Probleme : les surlignages colores et bandes survivent au heavy blur → pixels boundary internes → trop de clusters (5-7 au lieu de 2-3).

### Etapes

1. **Creer `filtrerBoundaryParVariance(boundary, heavyBlur, dw, dh, seuilVariance)`**
   - Pour chaque pixel boundary, calculer le gradient local (sur heavyBlur) pour trouver la normale
   - Echantillonner la variance sur R=5 pixels de chaque cote de la normale
   - Garder le pixel seulement si `max(varA, varB) < seuilVariance`
   - Un vrai bord papier/fond a une variance faible des deux cotes (regions uniformes)
   - Un bord interne (surlignage) a une variance elevee d'au moins un cote

2. **Inserer dans le pipeline** (apres ligne ~914, avant Hough)
   - `boundary = filtrerBoundaryParVariance(boundary, heavyBlur, dw, dh, P.seuilVariance)`

3. **Ajouter parametre UI** : `seuilVariance` (defaut : 150)

4. **Tuner** : tester valeurs 50 a 300, pas de 50

### Validation
- Cible : 3-4 images Lafleur passent de echec a imprecis/OK
- Les images "faciles" (Desfosses, Dionne, Funk) ne doivent pas regresser

---

## Phase 3 — Segmentation assistee par saturation (Mode 2 : Hurtubise)

**Impact attendu : +2-4% (58% -> 60-62%)**

Probleme : fond gris clair ≈ luminosite papier (delta ~30). Le seuil `picPapier x 0.55` inclut tout le fond.

### Etapes

1. **Creer `extraireSaturation(pixels, w, h)`**
   - Calculer la saturation HSV pour chaque pixel : `(max-min)/max * 255`
   - Le papier blanc a une saturation ~0, le fond gris a souvent une legere teinte

2. **Activation conditionnelle** : seulement si le delta luminosite est faible
   - Detecter : si >80% de l'image est classee "papier" par le masque luminosite seul
   - Dans ce cas, ajouter un critere saturation : `mask[i] = bright ET saturation < seuilSat`

3. **Ajouter parametre** : `seuilSaturation` (defaut : 25)

### Validation
- Cible : 2-3 images Hurtubise passent de echec a imprecis/OK
- Activation conditionnelle = zero risque de regression sur les images normales

---

## Phase 4 — Recolte des quasi-OK et ajustements fins

**Impact attendu : +4-6% (62% -> 66-68%)**

### Etapes

1. ✅ **Augmenter `topN` de 3 a 5** — fait dans Phase 1

2. **Union boundary + Canny filtre pour le support**
   - Combiner les deux edge maps pour le calcul de support (plus de pixels = meilleure discrimination)

3. **Analyser les images a e=0.031-0.050**
   - Identifier les quasi-OK et comprendre pourquoi elles echouent de peu
   - Ajustements cibles si un pattern emerge

### Validation
- Banc complet apres chaque ajustement
- Cible globale : 65%+ OK

---

## Phase 5 — Integration en production (#176)

**Prerequis : taux stable a 60-70%+ confirme sur le banc**

### Etapes

1. **Ajouter les nouvelles fonctions** dans `js/travaux-preparation.js` :
   - `seuilsCannyAdaptatifs`, `seuilLuminositeAdaptatif`, `seuilContrasteAdaptatif`
   - `calculerSupportAretes`, `calculerSupportLigne`
   - `filtrerBoundaryParVariance`, `extraireSaturation` (si valide)

2. **Remplacer le pipeline** dans `detecterCoinsDocument()` (ligne ~1074) :
   - Heavy blur segmentation au lieu de `filtrerAretesDocument` en chemin principal
   - Nouveau scoring : `surface * penalite * support * penaliteImpl * bonusAng`

3. **Ajouter le fallback 600→400** dans `detecterCoinsAuto()` (ligne ~1045)

4. **Ajouter la detection de confiance** :
   - Si support < 0.3 → ne pas appliquer, montrer l'outil perspective manuel

5. **Tester sur iPad Safari** : performance < 2 secondes

---

## Phase 6 — Preparation demo AQPC (mai 2026)

1. Indicateur de confiance dans l'UI
2. Degradation gracieuse si detection echoue
3. Selection de 10-15 images representatives pour la demo

---

## Calendrier

| Phase | Contenu | Statut | Taux OK apres |
|-------|---------|--------|---------------|
| 1 | Support paires (Mode 3) | ❌ ECHEC (revert) | Regression catastrophique |
| 2 | Variance boundary (Mode 1) | A faire | ~56% |
| 3 | Saturation (Mode 2) | A faire | ~60% |
| 4 | Ajustements fins | A faire | ~66% |
| 5 | Portage production | Differe | idem |
| 6 | Polish AQPC | Differe | idem |

**Total restant : ~5-7 sessions, sur ~14 semaines disponibles.**

---

*Derniere mise a jour : 19 fevrier 2026*
