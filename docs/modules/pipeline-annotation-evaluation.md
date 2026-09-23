# Pipeline Import → Annotation → Evaluation → Export

> **Date** : 22 fevrier 2026 (Beta 97.9)
> **Objectif** : Etat des lieux complet du flux de travail Evaluations, prealable au chantier d'assistance utilisateur (infobulles, aide contextuelle, section Aide).

---

## Vue d'ensemble

La section **Evaluations** est structuree en **5 onglets IPO** (Input-Process-Output) :

| # | Onglet | ID sous-section | Role |
|---|--------|----------------|------|
| 1 | Apercu | `evaluations-apercu` | Tableau de bord des statistiques d'evaluation |
| 2 | Liste des evaluations | `evaluations-liste` | Consulter, filtrer, modifier les evaluations sauvegardees |
| 3 | Preparer et importer | `evaluations-importer` | Pipeline d'importation et preparation des travaux |
| 4 | Annoter et evaluer | `evaluations-annoter` | Visionneuse avec annotation et evaluation |
| 5 | Exporter et archiver | `evaluations-exporter` | Export PDF, ZIP, allegement |

---

## Onglet 1 — Apercu

Tableau de bord des evaluations : taux de completion, distributions, activites recentes.

**Fichiers** : `evaluations-apercu.js`

---

## Onglet 2 — Liste des evaluations

Liste filtree et recherchable de toutes les evaluations sauvegardees. Colonnes : etudiant, production, note, niveau, statut, date. Permet de consulter, modifier ou supprimer.

**Fichiers** : `liste-evaluations.js`

---

## Onglet 3 — Preparer et importer

Pipeline en **2 etapes** avec layout 3 colonnes.

### Etape 1 — Depot des fichiers

- **Zone** : `#travaux-drop-zone` (glisser-deposer ou selecteur de fichiers)
- **Formats** : PDF, JPEG, PNG, HEIC, HEIF, WebP
- **Auto-identification** :
  - DA 7 chiffres dans le nom de fichier (`\b(\d{7})\b`, `DA[_-]?\d{7}`)
  - Format LEA : `NOM_DA_Production_Remis_le_YYYY-MM-JJ_HHhMMmSSs.ext`
  - Correspondance Nom/Prenom si DA absent
  - Association automatique a la production si une seule est selectionnee

### Etape 2 — Optimisation (3 colonnes)

| Colonne | Contenu |
|---------|---------|
| **Originaux** (gauche) | Thumbnail, resolution, taille, nom du fichier |
| **Traitement** (centre) | Options : balance des blancs, uniformisation 200 DPI, detection doublons, assemblage auto. Selecteur de production. Boutons : Reglages specifiques, Appliquer et importer, Annuler |
| **Apercu** (droite) | Image apres traitement, resolution cible, taille estimee |

### Poste de preparation (optionnel)

Accessible via le bouton « Reglages specifiques ». Workspace zoomable avec outils non-destructifs :

- **Recadrage** : Poignees draggables, coordonnees normalisees (0-1)
- **Perspective** : Auto-detection (Canny + Hough) ou 4 poignees manuelles, remplissage fond (aucun/blanc/auto)
- **Rotation** : Fine (-15 a +15 degres)
- **Ajustements** : Luminosite, contraste, exposition (EV), balance des blancs
- **Assemblage** : Regroupement multi-pages par similarite

Rendu apercu a 1600px, rendu final en pleine resolution.

### Stockage a l'import

- **Primaire** : File System Access API (Chrome/Edge Mac) ou IndexedDB (fallback)
- **Compression** : Max 1400px, JPEG qualite 0.80
- **Metadonnees** : `etudiantDA`, `productionId`, `nomFichier`, `typeMIME`, `dateImport`, `blobStatut: 'initial'`

**Fichiers** : `travaux-import.js`, `travaux-ui.js` (lignes 116-247), `travaux-stockage.js`, `travaux-preparation.js`

---

## Onglet 4 — Annoter et evaluer

Coeur de l'outil. Deux modes exclusifs sur la meme visionneuse.

### Grille de badges

A l'ouverture de l'onglet, l'utilisateur voit une grille de thumbnails par etudiant/production. Chaque badge affiche un statut dynamique :

```
Importe → Annote → Evalue → Remis
```

Cliquer sur un badge ouvre le fichier dans la visionneuse.

### Visionneuse

**3 couches de canvas superposees** dans `#travaux-canvas-container` :

1. `#travaux-canvas-document` — Image ou PDF (rendu via PDF.js)
2. `#travaux-canvas-surligneur` — Surligneur (`mix-blend-mode: multiply`, opacite 50%)
3. `#travaux-canvas-annotation` — Dessins principaux

**Toolbar** : Navigation de pages (si PDF), controles de zoom (−, +, 100%, largeur, hauteur), bouton Recentrer, boutons de mode (Annoter / Evaluer), badge etudiant actif.

**Navigation** : Fleches gauche/droite pour passer d'un etudiant a l'autre.

### Mode Annoter

**Palette flottante draggable** (`#travaux-palette-flottante`) :

| Categorie | Outils |
|-----------|--------|
| **Selection** | Selection (Shift+clic = multi), Position (main/hand pan) |
| **Dessin** | Stylo (sensible a la pression, epaisseur 1-8px), Surligneur (10-40px, multiply), Gomme (efface le trait entier) |
| **Texte** | Texte multiligne (modale, taille 10-32px) |
| **Formes** | Rectangle, Cercle, Ligne, Fleche, Crochet (vert), Croix (rouge), Interrogation (orange) |
| **Codes** | Codes d'erreur numerotes, comptes pour le critere algorithmique. Liste rendue par `js/codes-annotation.js` (3 sept. 2026) : les dix codes de depart (REPLI, regles par Annoter > palette Codes > Personnaliser : noms, couleurs, ordre, textes — quatre cles globales) ou, si la grille de la production porte `codesDepuisSousCriteres: true` sur son critere algorithmique, ses SOUS-CRITERES (id `errfr_<code>`, numero = code, nom, `couleur`, retroaction ; ponderation 0 exclue). Resolution copie -> production -> grille a `travaux-fichier-ouvert` (`grilleDeCopie`). Un code pose que la liste ne connait plus garde son numero, jamais efface. Les TAMPONS (ci-dessous) sont une autre palette : ils commentent, le code identifie. |
| **Couleurs** | 12 couleurs predefinies (bleu par defaut) |
| **Epaisseur** | Reglable |
| **Annuler/Retablir** | Pile de 50 etats max |

**Palette Tampons** (`#travaux-palette-tampons`, separee) :
12 autocollants de retroaction : Bien, Tres bien, Brillant, Bon lien, Manque de lien, Confusion, Repetitif, Preuve absente, Citation, Approfondir, Procedes, Attention.

**Raccourcis** : Space+clic = pan, molette milieu = pan, Ctrl+Z = annuler, Ctrl+Shift+Z = retablir.

**Persistance** : Sauvegarde auto-debounced (2s) dans IndexedDB. Annotations stockees en coordonnees normalisees (0-1) pour adaptation a toute resolution.

### Mode Evaluer

Active des palettes supplementaires autour du canvas :

**Palette Parametres** (gauche, `#travaux-eval-gauche`) :
- Selecteur etudiant
- Selecteur production
- Selecteur grille de criteres
- Selecteur echelle de performance
- Selecteur cartouche de retroaction
- Statut de remise (Non recu → Recu → Importe → Annote → Evalue → Remis)

**Palette Criteres** (droite, `#travaux-eval-droite`) :
- Affiche chaque critere de la grille selectionnee
- Boutons de niveau (1-5) par critere
- Raccourcis clavier : 1-5 pour noter, Tab/Shift+Tab pour naviguer
- Calcul en temps reel de la note

**Zone Retroaction** (sous le canvas, `#travaux-eval-retroaction`) :
- Texte auto-genere depuis le cartouche (concatenation des commentaires par critere × niveau selectionne)
- Textarea editable manuellement
- Bouton Copier
- Checkboxes d'options

**Palette Jetons** (optionnelle, bas gauche) :
- Systeme de jetons bonus/malus pour les pratiques PAN
- Checkboxes par type de jeton (assiduite, completion, etc.)
- Modifie la note finale

Les annotations du mode Annoter restent visibles en mode Evaluer.

**Fichiers** : `travaux-annotation.js`, `travaux-outils.js`, `travaux-visionneuse.js`, `travaux-ui.js`, `evaluation.js`

---

## Onglet 5 — Exporter et archiver

### Deux cartes d'export (#893, puis #895 le 23 septembre 2026)

L'ecran rend DEUX cartes (`afficherArchivage`, `travaux-ui.js`). « Trimestre complet » a ete
fondu dans « Exporter des travaux » (#895, decision de Gregoire du 17 sept.) avec son moteur :
`exporterTravaux(options, onProgression)` est le seul moteur ZIP de l'ecran. Les copies annotees
et les evaluations sont toujours incluses : aucune case « Inclure ... » n'existe.

| Carte | Contenu | Filtres et options | Format |
|-------|---------|---------|--------|
| **Exporter des travaux** | Originaux + versions annotees + `_evaluations.json` + `_resume.json` | Production, etudiant·e (« Toutes / Tous » = tout le groupe) ; Dossiers ; « Compresser l'archive » | ZIP avec barre de progression |
| **Export Lea** | Copie annotee + page de synthese (note et retroaction) | Production, etudiant·e, case « Reprises seulement » | PDF pret pour Lea |

Tout fichier reellement mis dans l'archive est marque « exporte » (#891, etendu a l'export
complet par #895) : il devient eligible a « Proposer un nettoyage » (#892).

### Structure ZIP (carte « Exporter des travaux »)

Par defaut « Par etudiant·e et production » ; « Par etudiant·e » retire le niveau production.

```
Nom_Prenom_DA/
  Titre de la production/
    fichier1.pdf
    fichier1_annote.pdf
_evaluations.json
_resume.json        (nbFichiers, nbEchecs, echecs nommes — #565)
```

La structure a sous-dossiers `originaux/` et `annotes/` est celle de `exporterParEtudiant`,
appele depuis le profil de l'etudiant·e, pas depuis cet ecran.

### PDF genere

Pour chaque fichier :
1. Rendu de l'original (PDF.js ou image) a 2× pour qualite d'impression
2. Superposition des annotations (traits, tampons, texte)
3. Conversion en JPEG (qualite 0.92)
4. Page de synthese si evaluation existante (nom, production, note, retroaction)

### Allegement — RETIRE le 28 aout 2026

La conversion en fac-simile (800px, niveaux de gris) a ete retiree le 28 aout 2026 (decision de
Gregoire). Le statut `facsimile` subsiste en lecture pour les fichiers deja alleges ; plus aucun
geste de l'ecran ne le produit.

### Cycle de vie des fichiers

```
initial → annote → exporte → archive
```

(`fac-simile` : etat herite, lu mais plus produit depuis le 28 aout 2026.)

**Fichiers** : `travaux-export-pdf.js`, `travaux-archivage.js`, `travaux-ui.js`

---

## La chaine de la retroaction par critere (ajoute le 1er septembre 2026, #672 / #673)

> Documente ici parce que **personne ne pouvait la voir** : deux defauts de donnees ont
> vecu des mois dans cette chaine, et aucun test ne les couvrait.

**Le porteur est un `<div>`, pas un champ.** Pour chaque critere, le gabarit rend
`comm_<critereId>` — un `<div>` **masque** (`display:none` sur le chemin cartouche,
`u-hide` sur le chemin sans cartouche). Il n'est donc jamais lu a l'ecran : c'est un
porteur de donnee, pas un affichage.

**Deux ecrivains, un seul element.**

| mode | fonction | ce qu'elle ecrit |
|---|---|---|
| categories | `calculerNoteAlgorithmiqueAvecCategories` | `commDiv.textContent = retroaction` |
| simple | `calculerNoteAlgorithmiqueSimple` | `champCommentaire.textContent = …` (**etait `.value`** avant #672) |

⚠ `.value` sur un `<div>` pose une propriete JS parasite et laisse `textContent` intact.
C'est ce qui a fait vivre #672 sans que rien ne rougisse : le mode categories, lui, ecrivait
correctement — **la dissymetrie entre deux ecrivains du meme element est ce qui cache le
defaut**.

**Trois lecteurs, et ils lisent `textContent`.**
`_collecterCriteresAutoSave` (`evaluation-chargement.js`), `_collecterCriteresMod`
(`evaluation.js`) et `_collecterCriteresSauv` (`evaluation-sauvegarde.js`) poussent ce texte
dans `criteres[].retroaction` de l'evaluation enregistree.
⚠ **Ils ne poussent un critere que `if (niveau)`** : un critere sans niveau est ABSENT du
tableau enregistre, donc absent du PDF (voir #674).

**La cascade du PDF**, `synthese-retroaction-data.js`, `construireCriteres` :

```
(retroaction persistee, si ce n'est pas une amorce de saisie)   ← #672
  || donneesAlgorithmiques[id].retroaction                       (le repli)
  || cartouche.commentaires[critereId_niveau]
  || ''
```

⚠ **Le repli ne protege pas d'un texte parasite non vide.** Avant #672, l'amorce du gabarit
(« Saisissez les erreurs et le nombre de mots ») arrivait par le PREMIER terme, non vide donc
gagnant : le repli ecrit pour l'empecher ne pouvait jamais s'executer. La liste des amorces
reconnues vit dans `synthese-retroaction-data.js` (`AMORCES_DE_SAISIE`) et n'est recopiee
NULLE PART — l'ecran d'evaluation appelle le meme predicat via
`window.syntheseRetroactionData.estAmorceDeSaisie`.

**Ce qui s'efface, et ce qui ne s'efface pas** (#673). Quand un calcul redevient
inapplicable, `_effacerRetroactionMachine` retire du div **uniquement** ce que le code a
lui-meme ecrit : egalite EXACTE avec le dernier texte engendre, ou une amorce. Un
commentaire ecrit a la main n'est jamais touche — y compris quand l'enseignant·e a GARDE la
phrase engendree et ajoute la sienne a la suite (le div CONTIENT alors le texte machine sans
lui etre egal).
⚠ Le texte perime vit a **deux** endroits : le div, et `donneesAlgorithmiques[id].retroaction`
d'ou la cascade le reprendrait en repli. Les deux sont nettoyes.

**Tests** : `tests/unit/sentinelle-672-retroaction-mode-simple.test.js` (la cascade, banc
Node) et `tests/integration/retroaction-mode-simple-672.spec.js` +
`retroaction-perimee-673.spec.js` (le div, WebKit — un banc Node ne peut pas juger la
semantique reelle d'un `<div>`).

## Donnees et stockage

### Cles localStorage (namespacees via `cle()`)

| Cle | Contenu |
|-----|---------|
| `evaluationsSauvegardees` | Tableau des evaluations |
| `productions` | Liste des productions pedagogiques |
| `grillesTemplates` | Grilles de criteres |
| `echellesTemplates` | Echelles de performance |
| `cartouches_*` | Cartouches de retroaction (par grille) |
| `modalitesEvaluation` | Configuration de la pratique (jetons, etc.) |

### IndexedDB

| Store | Contenu |
|-------|---------|
| `fichiers` | Blobs des fichiers importes + metadonnees |
| `annotations` | Donnees d'annotation par fichierId |

---

## Systeme d'aide existant (etat au 22 fev 2026)

### Tooltips (survol)

- **Mecanisme** : Attribut `data-tooltip="cle"` → bulle au survol (400ms)
- **Contenu** : `tooltips-contenu.js` (texte simple, tutoiement)
- **Couverture Annotation/Evaluation** : 3 cles de navigation seulement (`nav-eval-importer`, `nav-eval-annoter`, `nav-eval-exporter`)
- **Lacune** : Aucun tooltip sur les outils, palettes, formulaires, criteres, jetons

### Aide contextuelle (modale)

- **Mecanisme** : Bouton `btn-aide-contextuelle` + `data-aide="cle"` → modale riche
- **Contenu** : `aide-contextuelle-contenu.js` (texte, listes, conseils, exemples, alertes, voir aussi)
- **Couverture** : `evaluations-annoter` (minimal), `evaluations-proceder` (basique)
- **Lacune** : Aucun bouton d'aide deploye dans l'interface d'annotation/evaluation elle-meme

### Section Aide

- **Lacune** : Pas de contenu dedie a l'annotation et l'evaluation dans la section Aide de l'application

---

## Fichiers source du pipeline

| Fichier | Lignes | Role |
|---------|--------|------|
| `travaux-import.js` | ~200+ | Detection fichiers, parsing DA, correspondance etudiants |
| `travaux-preparation.js` | ~500+ | Poste de preparation (crop, perspective, ajustements) |
| `travaux-stockage.js` | ~300+ | Abstraction IndexedDB/FSAPI, gestion quota |
| `travaux-visionneuse.js` | ~400+ | Rendu PDF.js + images, zoom, navigation pages |
| `travaux-annotation.js` | ~450+ | Moteur de dessin canvas, evenements, modele de donnees |
| `codes-annotation.js` | ~290 | La liste des codes d'annotation d'une copie : repli (dix codes + quatre cles globales) ou sous-critères de la grille activee ; `listeCodes`, `code` (jamais null), `estActive`, `apercuCodes`, `grilleDeCopie` |
| `travaux-outils.js` | ~3700 | Definitions outils, couleurs, autocollants, palettes ; la grille courante d'une copie (`_poserGrilleCourante`) et l'ecran de reglage des dix codes du repli |
| `travaux-ui.js` | ~2500+ | Coordinateur UI : import, fichiers, visionneuse, modes, archivage |
| `travaux-export-pdf.js` | ~300+ | Generation PDF avec annotations superposees |
| `travaux-archivage.js` | ~150+ | Export ZIP, organisation par dossiers, allegement |
| `evaluation.js` | ~3500+ | Module d'evaluation : chargement, notation, sauvegarde |

---

## Prochaine etape

Chantier d'assistance utilisateur :
1. Correctifs en suspens (Import + Annoter)
2. Tooltips sur tous les elements d'interface
3. Pins d'aide contextuelle (modales riches)
4. Contenu de la section Aide
