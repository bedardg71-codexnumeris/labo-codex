# Auto-detection des coins du document — Guide d'amelioration v5

> **Contexte** : ce document est destine a Claude Code pour l'implementation des ameliorations
> de la pipeline de detection des coins de pages photographiees.
> **Fichier cible** : `js/travaux-preparation.js`
> **Fonction d'entree** : `detecterCoinsAuto()`
> **Document de reference** : `auto-perspective.md` (pipeline v4 actuelle)

---

## Objectif general

L'application Monitorage Pedagogique permet aux enseignants de photographier les travaux
d'eleves et de les integrer numeriquement. La pipeline de detection des coins doit :

1. Detecter les **4 coins** de chaque page visible dans une photo
2. Supporter la detection de **plusieurs pages** dans une meme photo (typiquement 2)
3. Fonctionner dans des **conditions photographiques variees** : eclairage inegal,
   angles de prise varies, fonds complexes (bureau en bois, pupitre gris, etc.)
4. S'ameliorer progressivement grace a un **banc de test etiquete**

La pipeline actuelle (v4) fonctionne correctement sur des photos bien eclairees avec
un fond uni. Les ameliorations ci-dessous visent a la rendre robuste aux conditions reelles.

---

## Architecture de la strategie d'amelioration

La strategie repose sur trois piliers :

```
1. Seuils adaptatifs          — l'algorithme s'ajuste a chaque image
2. Banc de test etiquete      — mesure objective de la performance
3. Iteration guidee           — chaque changement est valide sur le corpus
```

Ce n'est pas du machine learning. C'est de l'**optimisation de parametres supervisee** :
on dispose d'images avec leurs coins corrects (etiquetes par l'enseignant), et on ajuste
l'algorithme pour maximiser la precision sur l'ensemble du corpus.

---

## Pilier 1 — Seuils adaptatifs

### Probleme

La pipeline v4 utilise des seuils fixes qui supposent implicitement une photo bien eclairee
d'une feuille blanche. Ces seuils cassent dans les conditions suivantes :

| Condition | Seuil affecte | Symptome |
|---|---|---|
| Photo sous-exposee (lumiere faible) | Luminosite > 130 | Bords du papier elimines par le filtre |
| Photo surexposee (flash direct) | Contraste > 25 | Bruit du fond passe le filtre |
| Eclairage lateral (ombre d'un cote) | Canny 30/90 | Un bord ne produit pas assez de votes Hough |
| Page loin de la camera | DETECT_SIZE = 400 | Trop peu de pixels pour les bords |
| Bord flou (defocalisation) | Rayon = 3px | Le contraste papier/fond est dilue |

### Amelioration 1a — Seuils Canny dynamiques

**Priorite : haute. Complexite : faible.**

Remplacer les seuils fixes `CANNY_LOW = 30` et `CANNY_HIGH = 90` par des seuils
calcules a partir de la distribution des gradients de l'image.

```
Principe :
  1. Calculer les magnitudes de gradient Sobel sur l'image en niveaux de gris
  2. Calculer la mediane des magnitudes non-nulles
  3. CANNY_LOW  = max(10, mediane × 0.33)
     CANNY_HIGH = max(30, mediane × 1.0)
```

Pourquoi ca marche : sur une image sombre, les gradients sont faibles, donc la mediane
est basse, donc les seuils descendent et captent les aretes faibles. Sur une image a
fort contraste, la mediane monte et le seuil filtre le bruit.

```javascript
// Pseudo-code d'implementation
function seuilsCannyAdaptatifs(grayData, w, h) {
    // Calculer les magnitudes de gradient Sobel (deja fait dans cannyEdgeDetection)
    // Extraire la mediane des valeurs > 0
    const magnitudes = []; // collecter les magnitudes non-nulles
    // ... Sobel 3x3 sur grayData ...
    magnitudes.sort((a, b) => a - b);
    const mediane = magnitudes[Math.floor(magnitudes.length / 2)];
    return {
        low: Math.max(10, Math.round(mediane * 0.33)),
        high: Math.max(30, Math.round(mediane * 1.0))
    };
}
```

**Impact attendu** : recupere les bords perdus sur les photos sombres, elimine le bruit
sur les photos flash. C'est le changement avec le meilleur ratio impact/effort.

### Amelioration 1b — Seuil de luminosite adaptatif dans le filtre contraste

**Priorite : haute. Complexite : moyenne.**

Remplacer le seuil fixe `max(sideA, sideB) > 130` par un seuil relatif base sur
l'histogramme de luminosite de l'image.

```
Principe :
  1. Calculer l'histogramme de luminosite (256 bins) sur l'image grayscale
  2. Trouver le pic dominant dans le quartile superieur (bins 192-255)
     — c'est la luminosite typique du papier dans cette image
  3. Si aucun pic dans le quartile superieur, prendre le pic global
  4. Seuil de luminosite = pic_papier × 0.55
```

Pourquoi : sur une photo sous-exposee, le papier blanc peut apparaitre a 100-120 de
luminosite. Le seuil fixe de 130 elimine ces bords. Avec le seuil adaptatif, si le
papier est a 110, le seuil descend a ~60, ce qui conserve les bords papier/fond.

```javascript
// Pseudo-code
function seuilLuminositeAdaptatif(grayData, w, h) {
    const histo = new Uint32Array(256);
    for (let i = 0; i < w * h; i++) {
        histo[Math.round(grayData[i])] += 1;
    }
    // Chercher le pic dans le quartile superieur
    let picVal = 0, picIdx = 192;
    for (let i = 192; i < 256; i++) {
        if (histo[i] > picVal) { picVal = histo[i]; picIdx = i; }
    }
    // Fallback : pic global si rien de significatif en haut
    if (picVal < (w * h) * 0.02) {
        for (let i = 0; i < 256; i++) {
            if (histo[i] > picVal) { picVal = histo[i]; picIdx = i; }
        }
    }
    return Math.round(picIdx * 0.55);
}
```

### Amelioration 1c — Seuil de contraste proportionnel

**Priorite : moyenne. Complexite : faible.**

Remplacer le seuil fixe `contrast > 25` par un seuil proportionnel a l'ecart-type
de la luminosite de l'image.

```
Principe :
  ecartType = ecart-type de la luminosite sur toute l'image
  seuilContraste = max(12, ecartType × 0.4)
```

Pourquoi : une image a faible contraste global (sous-exposee, eclairage diffus)
compresse toute la dynamique dans une plage etroite. Un contraste de 15 entre papier
et fond est significatif dans ce contexte. A l'inverse, une image flash a un ecart-type
eleve, et un seuil de 25 laisse passer trop de bruit.

### Amelioration 1d — Echantillonnage multi-rayon dans le filtre contraste

**Priorite : moyenne. Complexite : faible.**

Au lieu d'echantillonner a un seul rayon de 3 pixels, echantillonner a plusieurs
rayons et retenir le contraste maximal.

```
Rayons a tester : [2, 4, 7] pixels (sur l'image reduite a 400px)
Pour chaque pixel d'arete :
  contrast = max(contrast_rayon2, contrast_rayon4, contrast_rayon7)
  luminosite = max(lum_rayon2, lum_rayon4, lum_rayon7)
```

Pourquoi : un rayon de 3px est trop court pour les bords flous (le degraded
ombre couvre plus de 3px) et trop long pour les bords nets ou le texte commence
pres du bord. Le multi-rayon couvre les deux cas.

### Amelioration 1e — CLAHE (optionnel, si 1b ne suffit pas)

**Priorite : basse (a evaluer apres 1a-1d). Complexite : elevee.**

CLAHE (Contrast Limited Adaptive Histogram Equalization) normalise la luminosite
localement. C'est utile quand l'eclairage est tres inegal (ombre portee d'un cote).

```
Principe :
  1. Decouper l'image en tuiles (8x8 = 64 tuiles sur l'image 400px)
  2. Calculer l'histogramme de chaque tuile
  3. Limiter l'amplitude de l'histogramme (clip limit = 2.0)
  4. Egaliser chaque tuile independamment
  5. Interpoler bilineairement aux frontieres des tuiles (evite les artefacts)
```

L'implementation en JS pur est faisable (~100 lignes) mais ajoute du temps de calcul.
A utiliser uniquement si les seuils adaptatifs (1a-1d) ne suffisent pas pour les cas
d'eclairage lateral fort.

### Amelioration 1f — Resolution adaptative

**Priorite : basse. Complexite : moyenne.**

Pour les photos ou la page est petite dans le cadre (photo de loin, grand bureau) :

```
Passe 1 : DETECT_SIZE = 400 (rapide)
Si le quadrilatere detecte couvre < 15% de la surface de l'image :
  Passe 2 : DETECT_SIZE = 700 (plus de detail)
```

---

## Pilier 2 — Detection multi-pages

### Probleme

La pipeline v4 retourne le **meilleur** quadrilatere. Pour detecter 2 pages (ou plus)
dans une meme photo, il faut retourner les N meilleurs candidats non-chevauchants.

### Modification de l'etape 9 (scoring)

```
Ancien comportement :
  retourner le candidat avec le meilleur score

Nouveau comportement :
  1. Trier tous les candidats par score decroissant
  2. Pour chaque candidat, du meilleur au pire :
     a. Calculer le chevauchement (IoU) avec chaque candidat deja retenu
     b. Si IoU < 0.15 avec tous les candidats retenus : le retenir
     c. Sinon : le rejeter (c'est un doublon du meme document)
  3. Retourner la liste des candidats retenus (max N, typiquement 4)
```

### Calcul de l'IoU (Intersection over Union) pour des quadrilateres

Pour deux quadrilateres Q1 et Q2 :

```
IoU = aire(Q1 inter Q2) / aire(Q1 union Q2)
    = aire(Q1 inter Q2) / (aire(Q1) + aire(Q2) - aire(Q1 inter Q2))
```

L'intersection de deux quadrilateres convexes peut etre calculee par l'algorithme
de Sutherland-Hodgman (clipping de polygone). C'est l'approche la plus robuste.

Alternative simplifiee : utiliser les bounding boxes alignees aux axes comme
approximation. Moins precis mais beaucoup plus simple a implementer.

```javascript
// Approximation par bounding box
function iouApprox(quad1, quad2) {
    const bb1 = boundingBox(quad1); // {xMin, xMax, yMin, yMax}
    const bb2 = boundingBox(quad2);
    const interX = Math.max(0, Math.min(bb1.xMax, bb2.xMax) - Math.max(bb1.xMin, bb2.xMin));
    const interY = Math.max(0, Math.min(bb1.yMax, bb2.yMax) - Math.max(bb1.yMin, bb2.yMin));
    const inter = interX * interY;
    const union = aireRect(bb1) + aireRect(bb2) - inter;
    return union > 0 ? inter / union : 0;
}
```

### Modification de l'interface de retour

`detecterCoinsDocument()` (ligne ~1074 dans `travaux-preparation.js`) retourne
actuellement un objet a 4 coins ou `null`. Elle doit etre modifiee pour retourner
un **tableau** de quadrilateres (chacun avec ses 4 coins + un flag `bordImplicite`).
L'appelant (`detecterCoinsAuto`, ligne ~1045) gere ensuite l'affichage des controles
de correction pour chaque page detectee.

**Important** : les quadrilateres issus du mecanisme de "bords implicites" (voir plus bas)
doivent etre marques. Leur participation au calcul d'IoU doit utiliser uniquement
les bords reellement detectes, pas les bords implicites — sinon un bord implicite
d'une page (= bord de l'image) pourrait chevaucher artificiellement une autre page.

---

## Pilier 3 — Banc de test et iteration

### Structure de donnees pour les etiquettes

Chaque image testee est associee a ses coins corrects. Ces donnees sont stockees
dans IndexedDB (coherent avec l'architecture existante de l'application).

```javascript
// Schema d'une entree du banc de test
{
    id: "test-001",                    // identifiant unique
    imageBlob: Blob,                   // l'image JPEG originale
    imageMeta: {
        width: 3024,                   // dimensions originales
        height: 4032,
        source: "iphone-13",          // optionnel : appareil
        conditions: ["sous-expose", "angle-fort", "2-pages"]  // tags
    },
    pages: [                           // une entree par page detectee
        {
            coinsCorrects: {           // coordonnees en fractions (0-1)
                tl: { x: 0.05, y: 0.08 },
                tr: { x: 0.52, y: 0.06 },
                br: { x: 0.53, y: 0.94 },
                bl: { x: 0.04, y: 0.95 }
            },
            coinsDetectes: {           // rempli par le banc de test
                tl: { x: 0.06, y: 0.09 },
                tr: { x: 0.51, y: 0.07 },
                br: { x: 0.52, y: 0.93 },
                bl: { x: 0.05, y: 0.96 }
            },
            erreurMoyenne: 0.012,      // distance moyenne entre detecte et correct
            statut: "ok"               // "ok" | "imprecis" | "echec"
        }
    ],
    dateAjout: "2026-02-18",
    parametresUtilises: { ... }        // snapshot des parametres au moment du test
}
```

### Metriques du banc de test

Pour chaque execution du banc de test sur le corpus complet :

```javascript
{
    date: "2026-02-18T15:30:00",
    versionPipeline: "v5.1",
    parametres: {
        cannyMode: "adaptatif",        // "fixe" | "adaptatif"
        luminositeMode: "adaptatif",
        contrasteMode: "proportionnel",
        multiRayon: true,
        detectSize: 400,
        // ... tous les parametres
    },
    resultats: {
        totalImages: 150,
        pagesAttendu: 220,             // certaines images ont 2 pages
        pagesDetectees: 198,
        detectionCorrecte: 185,        // erreur < 0.03
        detectionImprecise: 13,        // erreur entre 0.03 et 0.08
        detectionEchouee: 22,          // erreur > 0.08 ou page manquee
        tauxReussite: 0.841,           // 185/220
        erreurMoyenne: 0.018,
        tempsTotal: 4200               // ms pour tout le corpus
    },
    // Detail par categorie de conditions
    parCondition: {
        "bien-eclaire": { taux: 0.96, n: 80 },
        "sous-expose": { taux: 0.72, n: 40 },
        "angle-fort": { taux: 0.78, n: 35 },
        "2-pages": { taux: 0.81, n: 30 },
        "fond-complexe": { taux: 0.85, n: 35 }
    }
}
```

### Workflow d'iteration

```
1. Implementer une amelioration (ex: seuils Canny adaptatifs)
2. Executer le banc de test → score global et scores par categorie
3. Comparer avec le score precedent :
   - Score global augmente → conserver le changement
   - Score global stable mais une categorie s'ameliore sans regression → conserver
   - Regression sur une categorie → analyser pourquoi, ajuster
4. Si le score est satisfaisant → committer et passer a l'amelioration suivante
5. Si le score regresse → revenir a la version precedente
```

### Comment un enseignant alimente le banc de test

Le mecanisme de correction manuelle existant (l'enseignant repositionne les coins)
peut etre etendu pour alimenter le banc de test :

```
1. L'algorithme detecte les coins automatiquement
2. L'enseignant voit le resultat et :
   a. Valide (les coins sont corrects) → sauvegarde comme "etiquette correcte"
   b. Corrige (deplace un ou plusieurs coins) → sauvegarde la correction
3. L'image + coins corrects sont ajoutes au corpus de test
4. Optionnel : l'enseignant ajoute des tags de conditions
```

Cela cree un flux naturel ou chaque utilisation de l'application enrichit le corpus
de test. Apres quelques semaines d'utilisation, le corpus couvre naturellement les
conditions reelles rencontrees par les enseignants.

---

## Detection d'un seul bord par direction

### Probleme

Si un cluster de lignes Hough ne contient qu'une seule droite (un seul bord visible
d'un cote du document), `trouverBordsOpposes` ne peut pas trouver de paire. La
detection echoue completement.

### Solution : bords implicites

Quand un cluster ne produit qu'une seule droite :
1. Determiner de quel cote de l'image cette droite se trouve (par sa distance au centre)
2. Utiliser le bord oppose de l'image comme droite implicite

```javascript
// Pseudo-code
if (cluster a une seule droite) {
    const distCentre = droite.rho - (cx * cos(droite.theta) + cy * sin(droite.theta));
    if (distCentre > 0) {
        // La droite est "au-dessus" du centre → utiliser le bord inferieur
        droiteImplicite = bordImage("bas", w, h);
    } else {
        // La droite est "en-dessous" → utiliser le bord superieur
        droiteImplicite = bordImage("haut", w, h);
    }
}
```

Ce mecanisme doit etre marque comme "un bord est implicite" dans le resultat,
pour que l'interface puisse signaler a l'utilisateur que la correction manuelle
est peut-etre necessaire pour ce cote.

**Integration** : ce mecanisme s'ajoute comme fallback conditionnel dans
`trouverBordsOpposes()` (ligne ~1288). Si la fonction ne trouve pas de paire
de droites suffisamment separees, elle retourne la droite unique + la droite
implicite, avec un flag `{ implicite: true }` sur la droite synthetique.
Le comportement actuel (echec si pas de paire) est preserve quand le fallback
n'est pas active.

---

## Ordre d'implementation recommande

Chaque amelioration doit etre implementee, testee, et validee individuellement.
Ne pas tout changer en meme temps — le banc de test ne sert a rien si on ne peut
pas isoler l'effet de chaque changement.

```
Phase 1 — Infrastructure
  [ ] Mettre en place le banc de test (structure de donnees + script d'execution)
  [ ] Etiqueter 20-30 images couvrant les conditions variees
  [ ] Etablir le score de base de la pipeline v4 sur ce corpus

Phase 2 — Seuils adaptatifs (impact maximal)
  [ ] 1a. Seuils Canny dynamiques (basee sur la mediane des gradients)
  [ ] 1b. Seuil de luminosite adaptatif (base sur l'histogramme)
  [ ] 1c. Seuil de contraste proportionnel (base sur l'ecart-type)
  Valider chaque changement sur le banc de test avant de passer au suivant.

Phase 3 — Robustesse supplementaire
  [ ] 1d. Echantillonnage multi-rayon
  [ ] Detection d'un seul bord (bords implicites)
  Valider sur le banc de test.

Phase 4 — Multi-pages
  [ ] Modifier le scoring pour retourner N candidats
  [ ] Implementer le filtrage par IoU
  [ ] Adapter l'interface d'appel
  Etiqueter des images a 2 pages et valider.

Phase 5 — Optionnel
  [ ] 1e. CLAHE (si les scores par condition montrent encore des faiblesses
        sur l'eclairage inegal apres les phases 2-3)
  [ ] 1f. Resolution adaptative (si les images a page petite restent problematiques)
```

---

## Constantes et seuils — recapitulatif v4 vs v5

| Parametre | v4 (fixe) | v5 (adaptatif) | Calcul |
|---|---|---|---|
| CANNY_LOW | 30 | dynamique | `max(10, mediane_gradients × 0.33)` |
| CANNY_HIGH | 90 | dynamique | `max(30, mediane_gradients × 1.0)` |
| Luminosite min | 130 | dynamique | `pic_papier_histogramme × 0.55` |
| Contraste min | 25 | dynamique | `max(12, ecart_type_luminosite × 0.4)` |
| Rayon echantillonnage | 3 | multi | `[2, 4, 7]` — max des 3 |
| DETECT_SIZE | 400 | adaptatif | 400, puis 700 si page < 15% surface |
| Bords opposes | requis | optionnel | bord image comme fallback |

Les coefficients (0.33, 1.0, 0.55, 0.4, etc.) sont des **valeurs de depart** issues
d'heuristiques classiques en vision par ordinateur. Leur derivation :
- Canny 0.33/1.0 : ratio standard propose par John Canny (seuil bas = 1/3 du haut)
- Luminosite 0.55 : le seuil v4 (130) correspond a ~0.55 × 235 (pic typique du blanc)
- Contraste 0.4 : le seuil v4 (25) correspond a ~0.4 × ecart-type d'une image typique (~60)

Ces coefficients doivent etre affines sur le banc de test. C'est exactement pour cela
que le banc de test est la premiere chose a mettre en place. Les phases 2-3 (seuils
adaptatifs) sont entierement independantes de la phase 4 (multi-pages) : elles modifient
le preprocessing, pas le scoring. On peut les implementer et valider separement.

---

## Glossaire pour Claude Code

| Terme | Signification dans ce contexte |
|---|---|
| Pipeline | Sequence d'operations de traitement d'image |
| Canny | Algorithme de detection d'aretes (bords) dans une image |
| Hough | Transformee qui detecte des droites dans une image binaire |
| Cluster | Groupe de droites quasi-paralleles |
| IoU | Intersection over Union — mesure de chevauchement entre deux formes |
| CLAHE | Egalisation adaptative d'histogramme a contraste limite |
| Banc de test | Ensemble d'images etiquetees pour mesurer la performance |
| Etiquette | Coordonnees des coins corrects validees par un humain |
| Seuil adaptatif | Valeur calculee a partir des proprietes de l'image, pas fixe |
| Quadrilatere | Polygone a 4 cotes representant le contour d'une page |
| Fallback | Mecanisme de secours quand la methode principale echoue |
