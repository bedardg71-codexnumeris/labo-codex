# Consigne suivante — l'import d'élèves nomme le cours de rattachement (#887, suite de #872 ; #923 ; DA à l'import)

> Écrite le 19 septembre 2026 à 14 h 01 (Toronto), par Cowork. **Forme tranchée par Grégoire le 17 sept. 2026, 13 h 38** (`plans de travail/DECISIONS-2026-09-17-apres-midi.md`, #887). La règle des DA à l'import : voir §3, décision de Grégoire du 19 sept.
> **Condition de départ** : `main` porte `a73c88b2` (1.147.2, #914) ou plus récent ; 1.147.2 part avec ce lot ou avant, sur « pousse » de Grégoire. Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-da-jamais-invente.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : les quatre fichiers de l'autre travail restent hors de l'index ; jeton d'`interpretation-config.js` à `20260910c`.
> **Identifiant** : « Dernier ID utilisé » = #923 à l'écriture ; relis-le et `grep` les deux registres.

---

## 1 · Ce que Grégoire verra

Cadre › Groupe d'étudiant·es › « Importer des étudiant·es » : avant de confirmer, la zone dit **à quel cours** la liste sera rattachée, et un menu des cours du trimestre permet d'en choisir un autre, sur place. Aujourd'hui, les élèves vont au cours actif sans que rien ne le dise (Mathieu a importé son 2e groupe « dans son 2e cours », les élèves ont rejoint le premier).

## 2 · La forme tranchée (17 sept., 13 h 38)

« La zone d'import NOMME le cours de rattachement et laisse en changer sur place » ; forme proposée, **à ajuster aux mots de l'écran** : « Ces étudiant·es seront rattaché·es à : <code du cours> », plus un menu des cours du trimestre. Écartés : nommer le cours sans menu ; autres variantes de la fiche.

**Décisions techniques de Cowork, à tenir sauf mesure contraire (dis-le alors)** :
- Le menu choisit la **cible de cet import seulement** ; il ne change pas le cours actif de l'application (changer d'écran actif en plein import surprendrait). Valeur initiale : le cours actif.
- L'ajout un par un (`soumettreEtudiantV2`, même `coursId = infoCours`) : même phrase nommant le cours au-dessus du formulaire d'ajout, **sans** menu (un élève ajouté à la main l'est dans la liste qu'on regarde). Si la mesure montre que ça ne tient pas, dis-le.
- Un trimestre sans aucun cours : la zone le dit et l'import reste possible comme aujourd'hui (`coursId` vide) – ne bloque pas un premier trimestre.

## 3 · Les DA à l'import – ✅ Tranché par Grégoire : « oui » à la recommandation de Cowork (19 sept. 2026, 14 h 02). Applique.

Mesuré par toi au lot #914 : l'import laisse tout entrer (« 123456 », « ABC-99 », deux lignes sans DA → deux fiches au DA vide, jamais dédoublonnées ; message « 5 étudiant·es ajouté·es »).
**Recommandation de Cowork** : même règle qu'au formulaire. Une ligne dont le DA n'a pas sept chiffres (après retrait des espaces) **n'est pas importée** ; l'aperçu la montre marquée « DA manquant » / « DA invalide », le bouton dit combien de lignes seront importées, et le message final nomme les lignes écartées. Les autres lignes entrent. Un DA déjà présent dans le trimestre est traité comme aujourd'hui (mesure et dis ce qu'il fait).
➡ **Ligne à lire ici au démarrage** : si ce paragraphe porte « ✅ Tranché par Grégoire : … », applique ; sinon, arrête-toi avant de coder ce volet et fais le reste du lot.

## 4 · Dans la même zone

- **#923** (inscrit par toi) : l'aperçu de l'import pose les colonnes collées sans `echapperHtml` – règle de sécurité n° 1. Corrige-le dans ce lot : c'est la zone que tu réécris.
- **Mécanisme B de #872** : la liste du Cadre filtre par numéro de groupe seulement ; deux cours qui ont chacun « 00001 » s'affichent comme un seul groupe. **Mesure et dis** si la liste montre les élèves des deux cours sous le même groupe (cas de Mathieu : un groupe par cours). Ne le change pas dans ce lot ; si c'est vrai, propose la phrase de fiche, Cowork la portera à Grégoire.

## 5 · Arrêts

- Si le rattachement au cours sert ailleurs sous un autre nom (`coursId` lu par le groupe-cours, l'horaire, les présences) et que le menu risque d'écrire un cours incohérent avec le groupe : arrête-toi et dis-le.
- Stock : aucun élève déjà rattaché n'est déplacé (écrire dans les données d'un·e enseignant·e remonte à Grégoire).

## 6 · Preuve

- Banc WebKit par le vrai geste : deux cours au trimestre, coller une liste, lire la phrase avec le cours actif, choisir l'autre cours au menu, confirmer ; les élèves portent le `coursId` choisi et le cours actif n'a pas changé.
- #923 : un nom collé `<img src=x onerror=…>` s'affiche en texte dans l'aperçu.
- DA (si tranché) : aperçu et message nomment les lignes écartées ; aucune fiche au DA vide.
- Mutations : cible forcée au cours actif ; menu qui change le cours actif ; échappement retiré ; garde des DA retirée. Chacune rouge.
- Vitest complet depuis `tests/` ; verdict Playwright par `pousser.sh`, Cowork fermé. Porte terrain probable (le menu sur iPad) : markdown du skill `portes-terrain`, Cowork publie l'artefact.
- Version : `minor` si le menu est une fonction, à ton jugement ; entrée de « Nouvelles » proposée, elle remonte à Grégoire par Cowork.

## 7 · Rapport

En gestes d'utilisateur : les mots posés et ce que tu as supposé (les mots de la zone sont lus par des enseignant·es : propose, pose, nomme), la mesure du mécanisme B, ce qui n'est pas mesuré, les chemins à commiter. `OU-EN-EST-ON.md`, `RELAIS.md` ; coche #887 et #923 avec leur « vérifié comment ».
