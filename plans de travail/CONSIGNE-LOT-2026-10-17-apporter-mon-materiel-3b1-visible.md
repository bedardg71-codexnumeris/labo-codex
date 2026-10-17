# Consigne – « Apporter mon matériel », étape 2 du plan : ce que l'assistant écrit se voit dans l'application

> Écrite par Cowork le samedi 17 octobre 2026 à 9 h 40 (Toronto, mesuré par `date`). Étape 2 de `PLAN-2026-10-17-pret-pour-lundi.md`. Après l'étape 1 (verdict du lot 3a appliqué et commité).
> ⛔ Aucun nom d'élève ni de collègue, aucun texte d'une grille réelle de Grégoire dans le dépôt.
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `verification-adverse`.

## Ce que Grégoire verra à la fin de l'étape

Il crée une grille avec l'assistant, clique « La voir dans Grilles de critères » : la grille s'ouvre, sélectionnée. Sous chaque critère, en lecture, ce qui est attendu à chaque niveau (le nom du niveau, puis son texte) et, s'il y en a, la liste des sous-critères. « La voir dans Échelles de performance » et « dans Cartouches de rétroaction » ouvrent de même l'objet créé. À l'accueil d'« Apporter mon matériel » et quand aucun tableau n'est trouvé, deux textes l'invitent à copier le tableau depuis son fichier d'origine plutôt que depuis un PDF.

## Le mandat

### 1. Les descripteurs et les sous-critères, en lecture, dans Grilles de critères

- Sur la carte de chaque critère (`grilles.js`, rendu des critères d'une grille, ~4740-4775), sous le champ de la description, **seulement si le critère en porte** : un bloc en lecture avec, pour chaque niveau de `descripteurs.parNiveau`, le nom du niveau (lu dans l'échelle `descripteurs.echelleId` du trimestre ; si elle n'existe plus, le code seul) puis son texte, retours à la ligne gardés ; puis la liste des `sousCriteres` (leurs `nom`), dans l'ordre.
- **Aucune modification** dans ce bloc : la modification vient après lundi. Un critère sans descripteurs ni sous-critères s'affiche **exactement** comme avant (même HTML : un banc le fige).
- Tout texte échappé. Bloc replié ou non : à toi de choisir selon la hauteur ; Grégoire a dit le 11 sept. : pas trop d'accordéons qui se referment, l'information passe inaperçue.
- Titre du bloc, provisoire : « Ce qui est attendu à chaque niveau » ; liste : « Sous-critères ». ⚠ Le champ de la description d'un critère s'appelle « Descripteur » dans cet écran (vocabulaire du 4 sept.) : **ne le renomme pas**, la question de vocabulaire ira à Grégoire à l'étape 7. N'emploie pas le mot « descripteur » dans ton bloc.
- Les mêmes données dans l'**aperçu** de la grille, s'il en existe un hors de l'éditeur (mesure-le ; sinon, rien).

### 2. Les boutons de la confirmation ouvrent l'objet créé

« La voir dans … » ouvre la sous-section avec l'objet créé **sélectionné** dans sa barre latérale (grille, échelle, cartouche), par le chemin que chaque outil emploie déjà pour ouvrir un objet de sa bibliothèque. Mesure ce chemin pour chacun ; aucune fonction neuve s'il en existe une.

### 3. Les deux textes « fichier d'origine »

Exactement ceux de `plans de travail/A-INCLURE-3b-apporter-mon-materiel.md`, § 1 (validés par Grégoire à 8 h 53) : l'étape 1 de l'accueil (`index.html` ~4180) et `L.MESSAGE_SANS_TABLEAU`.

### 4. Ce qui survit — mesure, sans correction sauf trivial

Pour une grille créée par l'assistant (descripteurs et sous-critères) : modifier le nom ou la pondération d'un critère dans Grilles de critères ; dupliquer la grille ; codex écrit puis rouvert ; export puis import d'une sélection ; partage. Pour chaque chemin : les descripteurs et les sous-critères sont-ils intacts ? Un chemin qui les perd : **trouvaille, inscrire et continuer** (corrige seulement si c'est une ligne évidente, et dis-le).

## Les bancs

- Vitest : le bloc (présent seulement s'il y a des données ; niveau nommé ; échelle disparue → code ; retours gardés ; échappement d'un `<img onerror>` dans un texte) ; HTML inchangé d'un critère sans données ; mutation par essai.
- Playwright, lancée seule dans WebKit : créer avec l'exemple, « La voir dans Grilles de critères », la grille sélectionnée, le bloc visible ; même chose pour l'échelle.
- Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-3b1.md`, avec la liste des textes provisoires neufs. Bump du bloc de jetons. **Aucun push, aucune release, aucun verdict complet** : c'est l'étape 3, au signal de Grégoire. Rapport court à Grégoire, en gestes d'utilisateur.
