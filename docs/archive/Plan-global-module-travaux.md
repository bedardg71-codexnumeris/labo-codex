# Plan global — Module Travaux : de l'import Lea au retour a l'eleve

> **Destinataire** : Claude Code
> **Contexte** : Application Monitorage Pedagogique (~50 000 lignes JS, hors ligne, IndexedDB)
> **Contrainte** : 1 developpeur (Gregoire), temps partiel
> **Objectif** : Remplacer le trio Lea (annotation) + GoodNotes (stylet) + Word (assemblage)
> par un flux unique dans l'application web
> **Date** : 18 fevrier 2026

---

## Vue d'ensemble du flux cible

```
Lea (depot)                                    Lea (retour)
    │                                              ▲
    ▼                                              │
┌──────────────────── APPLICATION ────────────────────┐
│                                                     │
│  A. IMPORT         B. PREPARATION    C. ANNOTATION  │
│  ─────────         ───────────────   ────────────── │
│  Dossier Lea  →    Detection coins → Annoter        │
│  Parsing noms      Perspective       Texte, formes  │
│  Formats varies    Rotation          Autocollants    │
│  Doublons          Rognage           (Stylet v2)    │
│                    Assemblage PDF                    │
│                    Insertion grille                  │
│                                                     │
│  D. EVALUATION     E. EXPORT                        │
│  ─────────────     ──────────                       │
│  Grille criteriee  PDF annote        →  Retour Lea  │
│  Cartouches        + grille evaluee                 │
│  Note finale       Noms Lea intacts                 │
│  (deja fonctionnel)  Export par lots                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Etat actuel et references

| Maillon | Etat | Reference |
|---|---|---|
| A. Import | Partiel — parsing DA fonctionne, pas d'import dossier complet | Captures Beta 97 |
| B. Preparation | En cours — rotation, decoupe, perspective fonctionnels ; auto-detection en developpement | `auto-perspective.md`, `auto-perspective-v5.md` |
| C. Annotation | Partiel — stylet, formes, gomme fonctionnels ; autocollants planifies | `Plan - Module Travaux.md` |
| D. Evaluation | Fonctionnel — grilles, criteres, echelles, cartouches operationnels | Module Evaluations existant |
| E. Export | Planifie — pas encore implemente | `Plan - Module Travaux.md` section 3-4 |

---

## A. Import du dossier Lea

### A1. Import par dossier complet

**Probleme** : actuellement l'enseignant importe les fichiers un par un ou par selection.
Le flux reel est de telecharger un dossier complet depuis Lea, qui contient tous les
travaux d'un groupe pour une production donnee.

**Comportement attendu** :
1. L'enseignant pointe vers le dossier telecharge de Lea
2. L'application lit le nom du dossier pour extraire les metadonnees :
   - Format : `Nom_du_travail_Numerodecours_Numerodegroupe`
   - Exemple : `Analyse_litteraire_601101_12345`
3. L'application scanne tous les fichiers du dossier
4. Chaque fichier est parse selon la convention Lea :
   - Format : `Nomdefamille_DA_Nom_du_travail_Remis_le_AAAA-MM-JJ_HHhMMmSSs`
   - Le DA (numero d'admission a 7 chiffres) identifie l'eleve
5. L'application associe automatiquement chaque fichier a l'eleve correspondant
   (via le DA, deja present dans les donnees du groupe)

**Gestion des doublons** :
- Un meme eleve peut avoir depose plusieurs versions
- L'application garde le depot le plus recent (horodatage le plus tardif)
- Les depots anterieurs sont accessibles mais marques comme « version precedente »
- L'enseignant peut choisir manuellement une version anterieure si necessaire

**Gestion des formats** :
| Format d'entree | Traitement |
|---|---|
| JPG / PNG (photo) | Pipeline de preparation visuelle (section B) |
| PDF | Ouverture directe, pas de preparation visuelle necessaire |
| DOCX / ODT | Conversion en PDF cote client (voir A2) |
| Plusieurs images | Assemblage en PDF multi-pages (voir A3) |

### A2. Conversion DOCX/ODT en PDF

**Contrainte** : l'application est 100% hors ligne, pas de serveur.

**Options techniques** (a evaluer par Claude Code) :
- **docx-preview** ou **mammoth.js** : conversion DOCX → HTML → rendu dans un canvas → PDF
  - Avantage : pas de dependance serveur
  - Limite : mise en page approximative (pas de pagination Word native)
- **Approche pragmatique** : afficher le DOCX rendu en HTML dans la visionneuse,
  et ne generer le PDF qu'a l'export final
- Les formats ODT sont rares dans le contexte collegial ; un message « format non
  supporte, veuillez convertir en PDF avant de deposer » est acceptable en v1

**Decision a prendre** : quel niveau de fidelite est acceptable pour la conversion
DOCX ? La mise en page Word exacte n'est pas critique — c'est le contenu textuel
et les annotations qui comptent. Un rendu HTML lisible suffit probablement.

### A3. Assemblage multi-images en document

Quand un eleve depose plusieurs images (ex: 3 photos de 3 pages), elles doivent etre
assemblees en un seul document multi-pages dans l'application.

**Comportement attendu** :
1. Detecter les fichiers multiples d'un meme eleve (meme DA, meme production)
2. Les ordonner par nom de fichier ou horodatage
3. Les assembler en un document consultable page par page
4. Chaque page passe individuellement par la pipeline de preparation (section B)

Le stockage interne peut rester en images individuelles — l'assemblage en PDF reel
n'a lieu qu'a l'export (section E).

---

## B. Preparation visuelle

### Etat actuel

La preparation visuelle est le maillon le plus avance. Les outils de rotation,
decoupe manuelle, correction de perspective manuelle, et ajustements d'image
(luminosite, contraste, saturation, niveaux de gris, inversion) sont fonctionnels.

### En cours de developpement

La detection automatique des coins (auto-perspective) est en developpement actif
dans une application independante de test. Voir :
- `auto-perspective.md` — documentation de la pipeline v4 actuelle
- `auto-perspective-v5.md` — guide d'amelioration (seuils adaptatifs, multi-pages, banc de test)

### B1. Integration de l'auto-detection amelioree

Une fois la pipeline v5 validee dans l'appli de test, l'integrer dans
`travaux-preparation.js` en remplacement de la pipeline v4.

**Points d'attention** :
- La pipeline v5 retourne un tableau de quadrilateres (multi-pages)
- L'interface doit permettre de valider/corriger chaque page individuellement
- Les corrections alimentent le banc de test (boucle d'amelioration)

### B2. Insertion automatique de la grille d'evaluation

Apres la preparation visuelle, la grille d'evaluation correspondant a la production
doit etre ajoutee a la fin du document.

**Comportement attendu** :
1. L'application connait deja la grille associee a la production (via le module Evaluations)
2. La grille est rendue visuellement (HTML → canvas ou SVG)
3. Elle est ajoutee comme derniere(s) page(s) du document
4. L'enseignant peut ensuite annoter directement sur la grille (remplir les niveaux)

**Question ouverte** : est-ce que la grille est inseree comme image fixe (snapshot
de la grille vierge) ou comme couche interactive (l'enseignant coche les niveaux
directement) ? La version interactive est plus ambitieuse mais elimine la double
saisie (annoter la grille + remplir l'ecran Evaluation).

---

## C. Annotation

### Etat actuel (Beta 97)

Deja fonctionnel :
- Stylo (epaisseur, couleur)
- Surligneur
- Gomme
- Formes : cercle, fleche, rectangle
- Symboles : crochet, croix
- Annuler/Retablir (50 niveaux)

### C1. Panneau retractable

Planifie dans `Plan - Module Travaux.md` section 1.
Le panneau de fichiers se replie automatiquement en mode annotation.
Priorite haute — ameliore directement l'espace de travail sur iPad.

### C2. Palette d'autocollants

Planifie dans `Plan - Module Travaux.md` section 2.
12 autocollants de retroaction visuelle en deux categories (qualite + diagnostic).
Phase 1 : PNG existants. Phase 2 : SVG uniformes.
Le code doit charger depuis un dossier configurable pour le passage PNG → SVG.

### C3. Annotation texte

**Pas encore planifie** — mais mentionne dans le flux de Gregoire.

L'enseignant doit pouvoir taper du texte directement sur le document
(commentaires, corrections de formulation). C'est distinct du stylet.

**Comportement attendu** :
- Outil « texte » dans la barre d'outils
- Clic sur le document → zone de saisie clavier
- Texte ancre a la position, redimensionnable
- Police lisible (sans-serif, taille configurable)
- Couleur configurable (par defaut : rouge pour les corrections)

### C4. Annotation manuscrite avancee (v2, peut attendre)

L'annotation au stylet de base fonctionne deja. Les ameliorations futures incluent :
- Lissage des traits (anti-aliasing, interpolation bezier)
- Pression du stylet (epaisseur variable)
- Palm rejection ameliore (sur iPad)

Ces ameliorations ne sont pas prioritaires pour le flux minimum viable.

---

## D. Evaluation

### Etat actuel

Le module Evaluations est fonctionnel :
- Grilles de criteres avec echelles
- Cartouches de retroaction par critere
- Jetons de reprise/delai
- Portfolio (selection, ponderation)
- Note finale

### D1. Lien annotation ↔ evaluation (nouveau)

**Probleme** : actuellement, l'annotation (sur le document) et l'evaluation
(dans le module Evaluations) sont deux actions separees. L'enseignant doit
naviguer entre les deux.

**Amelioration** : le bouton « Voir le travail » existe deja dans l'ecran
Evaluations (cote a cote avec la grille). L'objectif est de rendre ce flux
bidirectionnel et fluide :

1. Depuis l'annotation → acceder directement a l'evaluation de cet eleve
2. Depuis l'evaluation → acceder directement au document annote
3. Les deux vues peuvent etre affichees cote a cote (split view)

### D2. Inscription du resultat dans le PDF de la grille

L'enseignant veut que le resultat (niveaux atteints par critere, note) soit
inscrit directement dans la page de grille ajoutee au document (voir B2).

**Deux approches possibles** :
- **Passive** : a l'export, la page de grille est regeneree avec les resultats remplis
- **Active** : l'enseignant coche/annote directement la grille dans le document,
  et ces annotations sont synchronisees avec le module Evaluations

La premiere approche est beaucoup plus simple et suffit pour le flux decrit.

---

## E. Export et retour a l'eleve

### E1. Generation du PDF final

Planifie dans `Plan - Module Travaux.md` section 3.

**Contenu du PDF exporte** :
1. Pages du travail original
2. Annotations aplaties (traits, formes, texte, autocollants)
3. Page(s) de synthese :
   - Identification eleve + production
   - Grille de criteres avec niveaux atteints
   - Cartouches de retroaction
   - Note finale

**Contrainte critique** : le nom du fichier PDF exporte doit correspondre au
nom original Lea (`Nomdefamille_DA_Nom_du_travail_...`) pour que le depot
par lots sur Lea fonctionne.

**Bibliotheque** : pdf-lib ou jsPDF (cote client, hors ligne).

### E2. Ecran de revision avant export

Planifie dans `Plan - Module Travaux.md` section 4.
Verification finale avant generation : apercu des annotations, cartouches,
page de synthese.

### E3. Export par lots

**Pas encore planifie** — mais essentiel pour le flux reel.

L'enseignant doit pouvoir exporter tous les travaux d'un groupe en une seule
operation, prets pour le depot par lots sur Lea (max 200 Mo).

**Comportement attendu** :
1. Bouton « Exporter tout le groupe » dans l'onglet Export
2. Generation de tous les PDF (travaux annotes + synthese)
3. Chaque PDF garde son nom Lea original
4. Regroupement dans un dossier (ou ZIP si la taille depasse 200 Mo)
5. Estimation de la taille totale avant export
6. Barre de progression (la generation peut prendre du temps)

### E4. Retroaction textuelle integree au PDF

Dans le flux actuel, Gregoire copie-colle la retroaction de l'application vers Lea.
L'objectif est d'integrer cette retroaction directement dans le PDF exporte
(section synthese), eliminant le copier-coller.

C'est deja couvert par E1 (la page de synthese contient les cartouches de
retroaction). Il faut simplement s'assurer que le texte est lisible, bien
formate, et inclut tous les criteres evalues.

---

## Ordre d'implementation recommande

L'ordre tient compte des dependances techniques et de l'impact sur le flux.
Chaque phase est utilisable independamment — pas besoin d'attendre la fin
pour beneficier des phases precedentes.

L'application n'est pas qu'un outil de suivi et de construction de la note.
C'est un **hub de soutien aux taches de l'enseignant**. Chaque phase renforce
cette vision : l'import intelligent elimine le tri manuel, l'annotation remplace
GoodNotes, l'export PDF remplace les allers-retours avec Lea. L'ensemble doit
etre operationnel pour le colloque AQPC (3-5 juin 2026).

```
Phase 0 — En cours (fevrier 2026)
  [EN COURS] Auto-detection des coins (appli de test independante)
  Voir auto-perspective-v5.md pour le detail

Phase 1 — Import intelligent (mars 2026)
  [ ] A1. Import par dossier complet + parsing noms Lea
  [ ] A3. Assemblage multi-images par eleve
  [ ] Association automatique eleve ↔ fichier via DA
  Resultat : l'enseignant charge un dossier et tout est trie.
  C'est le point d'entree de la chaine — ce qui fait de l'application
  le hub central plutot qu'un outil parmi d'autres.

Phase 2 — Annotation complete (mars-avril 2026)
  [ ] C1. Panneau retractable
  [ ] C3. Annotation texte (nouveau)
  [ ] C2. Palette d'autocollants (PNG d'abord)
  [ ] D1. Navigation fluide annotation ↔ evaluation (split view)
  Resultat : l'enseignant peut annoter comme dans GoodNotes (sauf stylet avance)

Phase 3 — Export PDF (avril-mai 2026)
  [ ] E1. Generation du PDF annote + synthese (grille = image fixe avec resultats)
  [ ] B2. Insertion de la grille evaluee dans le PDF
  [ ] E2. Ecran de revision
  [ ] E3. Export par lots avec noms Lea
  Resultat : l'enseignant genere les PDF prets pour Lea

Phase 4 — Integration et polish (mai 2026)
  [ ] Integration auto-detection v5 (multi-pages, decoupe automatique)
  [ ] A2. Conversion DOCX (fidelite requise — evaluer faisabilite cote client)
  [ ] C4. Ameliorations stylet (v2, optionnel)
  Resultat : le flux est complet et fluide de bout en bout
```

### Estimation de complexite

| Phase | Complexite | Dependances | Echeance |
|---|---|---|---|
| Phase 0 | Moyenne-elevee | Aucune (appli independante) | Fevrier-mars 2026 |
| Phase 1 | Moyenne | File System Access API (deja utilisee) | Mars 2026 |
| Phase 2 | Moyenne | Phase 1 pas requise mais logique dans le flux | Mars-avril 2026 |
| Phase 3 | Elevee | Phase 2 (annotations a aplatir dans le PDF) | Avril-mai 2026 |
| Phase 4 | Variable | Phases 0-3 | Mai 2026 |

---

## Decisions prises (18 fevrier 2026)

1. **Grille dans le document** : **image fixe** regeneree a l'export avec les
   resultats remplis. Pas de couche interactive. La grille est un snapshot
   genere au moment de l'export a partir des donnees du module Evaluations.

2. **Conversion DOCX** : **fidelite requise**. Le rendu doit etre proche de Word.
   Cela implique d'evaluer des bibliotheques plus robustes que mammoth.js
   (qui produit du HTML simplifie). Pistes : libreoffice-convert via WASM,
   ou accepter une dependance ponctuelle a un service local.
   Si aucune solution cote client n'offre une fidelite suffisante, documenter
   la limite et recommander a l'eleve de convertir en PDF avant depot.

3. **Multi-pages dans une photo** : **decoupe automatique**. L'auto-detection
   identifie les N pages, extrait chaque quadrilatere, corrige la perspective
   de chacun, et produit N images separees automatiquement. L'enseignant
   peut corriger les coins avant la decoupe si la detection est imprecise.

4. **Priorite pour le colloque AQPC** : **toute la chaine**. L'annotation et
   l'evaluation sont en bonne partie en place (stylet, formes, grilles,
   cartouches). Le focus est sur la completion du flux complet : import
   intelligent, autocollants, export PDF, et le lien fluide annotation ↔
   evaluation. Quatre mois (fevrier-mai) suffisent pour les 4 phases.
   L'application doit etre presentable comme un hub complet, pas comme
   un outil partiel.

---

## Architecture technique — notes pour Claude Code

- **Stockage** : IndexedDB (avec option File System Access API sur Mac)
- **Pas de serveur** : tout le traitement est cote client (JS dans le navigateur)
- **Cibles** : MacBook (Safari/Chrome) + iPad Air M1 (Safari + Apple Pencil)
- **Code existant** : ~50 000 lignes, monolithique, fichiers JS par module
- **Fichier cle** : `js/travaux-preparation.js` (preparation visuelle)
- **Fichier cle** : `js/travaux.js` (module principal travaux)
- **Style** : theme sombre, en-tete navy, Design System v7 (variables CSS)
- **Licence** : AGPL v3.0, code sur GitHub
- **Donnees** : 100% locales, aucun appel reseau

---

*Plan redige le 18 fevrier 2026*
*Base sur le flux de travail decrit par Gregoire et les documents existants*
*Documents connexes : `auto-perspective.md`, `auto-perspective-v5.md`, `Plan - Module Travaux.md`, `ROADMAP_H2026.md`*
