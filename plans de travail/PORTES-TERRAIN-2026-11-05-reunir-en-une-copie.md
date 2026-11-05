# Portes terrain – Réunir les fichiers d'une copie avant l'import (5 novembre 2026)

> Lot #1231 (et la porte iPad de #1229, en ligne depuis la 1.233.2), branche `lot/reunir-en-une-copie`, à livrer dans la 1.234.0 (pas encore en ligne : la porte attend le push).
> Écrites par Claude Code. **L'artefact interactif est à publier par Cowork** (bouton « Copier mes résultats » obligatoire).
> Ce qui échoue devient un item de BACKLOG, pas une note mentale.

**Pourquoi si peu de portes.** Le parcours entier est rejoué par une machine dans WebKit (le moteur de Safari) : trois photos sans DA, « Réunir en une copie », l'élève et le « Jeton de reprise », la pipette, la confirmation, l'import, puis le stock relu (un seul fichier, rattaché à l'évaluation de reprise, aucun orphelin, un PDF de trois pages dans l'ordre réglé, la pipette dedans). Même chose pour une production habituelle et pour un rechargement de la page (`tests/integration/reunir-en-une-copie-1231.spec.js`). Restent ce qu'aucune machine ne tient : ton doigt sur l'iPad, ta vraie prochaine reprise, et tes mots.

## §0 · Préalable

- [ ] Ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
  ⮕ Attendu : **1.234.0**. Un autre numéro : arrête-toi, la version n'est pas encore en ligne.

## §2 · Interface

### 2.1 Réunir trois photos au doigt (iPad)

> **Pourquoi** : le 5 nov., les trois photos d'une reprise sont devenues trois copies séparées, et deux sont restées sans évaluation. Les cases à cocher sont neuves ; leur taille au doigt ne se mesure que sur ton iPad.

- [ ] Sur l'iPad, dans « Préparer et importer », dépose trois photos sans DA dans leur nom. `iPad`
  ⮕ Attendu : chaque ligne de « Originaux » a une case à gauche, et le bouton « Réunir en une copie » est grisé.
- [ ] Coche les trois cases du doigt. `iPad`
  ⮕ Attendu : chaque case se coche du premier coup, sans ouvrir le fichier à côté ; le bouton devient actif.
- [ ] Touche « Réunir en une copie ». `iPad`
  ⮕ Attendu : les trois photos s'encadrent ensemble, et l'inspecteur dit « Copie de 3 fichiers ».
- [ ] Ouvre les Réglages spécifiques d'une photo et touche « Balance des blancs ». `iPad`
  ⮕ Attendu : la ligne « Touche une zone blanche de la feuille. » paraît sous le bouton ; elle disparaît quand tu touches la feuille.

### 2.2 Ta prochaine reprise en plusieurs photos (Mac)

> **Pourquoi** : c'est le cas vécu du 5 nov. Critère : après l'import, aucun passage par « Modifier ».

- [ ] Réunis les photos, choisis l'élève et « Jeton de reprise » de la production, puis importe.
  ⮕ Attendu : la confirmation annonce une ligne « [Élève] – [production], reprise – N pages », sans doublon ni conseil d'ajouter le DA.
- [ ] Ouvre Annoter sur l'élève.
  ⮕ Attendu : une seule copie de reprise, avec toutes ses pages dans l'ordre, sans passer par « Modifier ».

### 2.3 L'original de plusieurs pages dans la copie de référence (iPad)

> **Pourquoi** : le 5 nov. à 8 h 41, la copie de référence n'affichait que la première page de l'original, même quand il en avait plusieurs. Corrigé dans la 1.233.2 (#1229) et vérifié dans WebKit ; l'écran partagé de l'iPad reste à toi.

- [ ] Sur l'iPad, ouvre une reprise dont l'original est un PDF de plusieurs pages, puis la copie de référence. `iPad`
  ⮕ Attendu : l'indicateur dit « 1/N » (N, le nombre de pages), et « page suivante » mène à la page 2. Avant : « 1/1 », bouton grisé. S'il dit encore « 1/1 », l'original a sans doute été importé en photos séparées : c'est ce que la case « Réunir en une copie » évite désormais.

## §3 · Décisions (ce ne sont pas des vérifications)

Tranchées le 5 nov. 2026, avant la release.

1. **Les mots de l'écran.** « Réunir en une copie » (bouton) ; « Copie de 3 fichiers » (inspecteur) ; « Production de cette copie » (inspecteur, au lieu de « Production de ce fichier ») ; à la confirmation : « 1 copie(s) seront créées dans le groupe …, à partir de 3 fichiers : » suivi de « [Élève] – Artefact 6, reprise – 3 pages » (« élève non choisi », « sans production » quand il en manque) ; le bandeau « sans DA » : « Ces fichiers ne portent pas de DA et aucun·e étudiant·e ne leur est associé·e : ils seront importés sans élève. Choisis l'étudiant·e dans l'inspecteur ; pour une copie en plusieurs fichiers, coche-les dans « Originaux », puis « Réunir en une copie ». » ; un conseil ajouté à l'Aide de l'import : « Sans DA dans le nom (des photos prises au téléphone, par exemple), coche dans « Originaux » les fichiers d'une même copie, puis « Réunir en une copie » : ils deviennent un seul document, dans l'ordre réglé aux flèches, et tu choisis l'étudiant·e et la production une seule fois. » — Verdict : **validés tels quels par Grégoire (5 nov. 2026).**
2. **La licence des deux icônes** (pipette, cible), venues de SVG Repo : la page d'origine n'est pas dans les fichiers, la licence n'était pas vérifiée. — Verdict : **licence vérifiée par Grégoire (5 nov. 2026).**

## §4 · Ce que je n'ai pas pu vérifier

- **Chrome** : le banc n'a tourné que dans WebKit (Chromium n'est pas installé pour les tests locaux). Le code ne contient rien de propre à un moteur, mais Chrome, ton navigateur du rapport du 5 nov., n'a pas été éprouvé.
- **La cible comme curseur dans Safari** : le banc vérifie qu'elle est demandée, pas qu'elle s'affiche ; sinon Safari montre la croix habituelle (repli prévu).
- **Les flèches de réordonnancement restent petites au doigt** (20 × 16 px, d'avant ce lot) : elles servent à régler l'ordre des pages d'une copie réunie. Rien de changé, à signaler si ça gêne.
- **Le stock** : rien n'est réparé dans tes données (la reprise du 5 nov. a été remise en ordre à la main).
