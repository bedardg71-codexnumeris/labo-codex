# Portes terrain – les palettes d'annotation (31 octobre 2026)

> **La trace.** L'opération (cases à cocher, bouton « Copier mes résultats ») est l'artefact jumeau, publié par Cowork.
> Lot : `plans de travail/CONSIGNE-LOT-2026-10-31-palette-annotation.md`, rapport `RAPPORT-2026-10-31-palettes-annotation.md`.
> **État : pas encore due.** Le lot est commité sur `main`, pas poussé : à l'adresse en ligne, rien de tout ça n'existe encore. Cette liste attend la mise en ligne de la prochaine release.
> Ce qui échoue devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

Tout se fait sur **l'iPad, sur `https://app.codexnumeris.org`**, sauf 2.6 (Mac ou clavier de l'iPad). Aucune console, aucun Terminal.

## §0 · Préalable

- [ ] Ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
  ⮕ Attendu : le numéro annoncé par la release du lot (à inscrire ici à la mise en ligne). Un numéro plus ancien : arrête-toi, tu jugerais l'état d'avant.
- [ ] Ouvre une copie en mode Annoter, de préférence une copie d'essai.

## §1 · ⚠⚠ Données

Aucun geste de cette liste n'écrit autre chose que des annotations sur la copie que tu choisis. Aucune migration. Tes raccourcis de codes enregistrés ne sont ni lus ni effacés.

## §2 · Interface

### 2.1 Le tampon se pose du premier coup `iPad`

Pourquoi : à l'ouverture d'une copie, tu choisissais un tampon, tu touchais la copie, et rien ne se posait ; il fallait passer par un autre outil.

- [ ] Rouvre la copie, choisis un tampon sans toucher d'autre outil, puis touche la copie.
  ⮕ Attendu : le tampon se pose du premier coup.
- [ ] Regarde sa tuile dans la palette.
  ⮕ Attendu : elle est sur fond bleu. Avant, rien ne la distinguait.

### 2.2 Le bloc de texte se corrige sans le perdre `iPad`

Pourquoi : toucher un long bloc ouvrait une petite zone, et la fin du texte devenait inaccessible ; une lettre dictée remplaçait tout.

- [ ] Choisis l'outil Texte, puis touche un long bloc.
  ⮕ Attendu : tout le texte est visible, et rien n'est sélectionné.
- [ ] Touche le milieu du texte, puis dicte un mot.
  ⮕ Attendu : le mot s'insère à cet endroit, et le reste du bloc ne bouge pas.
- [ ] Un bloc **déjà rétréci** par l'ancienne version : ouvre-le.
  ⮕ Attendu : il garde sa largeur actuelle, et tu peux l'élargir à la poignée. Il n'est pas réparé d'office.

### 2.3 Deux doigts déplacent la page `iPad`

Pourquoi : avec le stylo actif, il fallait changer d'outil pour déplacer la page. Le banc fabrique ses événements de toucher : seul l'iPad juge le vrai geste.

- [ ] Stylo actif, fais glisser deux doigts sur la copie.
  ⮕ Attendu : la page suit les doigts, le zoom ne bouge pas, et rien ne se trace.
- [ ] Stylo actif, fais glisser un seul doigt.
  ⮕ Attendu : rien ne se trace et la page ne bouge pas.
- [ ] Pince pour zoomer en déplaçant les doigts.
  ⮕ Attendu : les deux se font dans le même geste, et le document ne saute pas au relâcher.
- [ ] Écris au Pencil, la paume posée sur l'écran.
  ⮕ Attendu : la page ne bouge pas pendant que tu écris.

### 2.4 La palette d'annotation `iPad`

Pourquoi : elle prenait de la place sur la copie, et ses boutons étaient en vrac.

- [ ] Regarde-la en mode clair, puis en mode sombre.
  ⮕ Attendu : la disposition de l'ébauche, sans rien qui déborde ni qui soit coupé.
- [ ] Si elle te paraît plus large que les autres fois, touche deux fois sa barre de titre.
  ⮕ Attendu : elle revient à sa largeur par défaut. Une largeur donnée à la poignée est mémorisée, et elle l'emporte.

### 2.5 Une nouvelle ligne n'a pas de pointe `iPad`

- [ ] Trace une ligne.
  ⮕ Attendu : sans pointe.
- [ ] Rouvre une copie qui porte déjà une flèche.
  ⮕ Attendu : la flèche garde sa pointe.

### 2.6 La palette Tampons et les touches des codes `iPad`

- [ ] Touche le titre « Observations », puis ouvre la copie suivante.
  ⮕ Attendu : la catégorie est repliée, une ligne dit « N tampons », et elle reste repliée à la copie suivante.
- [ ] Palette Codes : regarde les items.
  ⮕ Attendu : plus de badge gris.
- [ ] Au clavier (Mac, ou clavier de l'iPad), appuie sur la touche 4.
  ⮕ Attendu : le code 4 est choisi. Avant, tes raccourcis désaccordés choisissaient le code 6.

### 2.7 Les trois en-têtes `iPad`

Pourquoi : sur l'iPad, ↕ s'affichait comme un carré bleu. Seul l'iPad peut dire si le correctif tient.

- [ ] Regarde les en-têtes Annotation, Tampons et Codes.
  ⮕ Attendu : poignée, nom et engrenage à gauche ; ↔ ↕ − à droite (− seul pour Annotation).
- [ ] Regarde ↔ et ↕, et la double pointe de « Extrémités ».
  ⮕ Attendu : des flèches simples, pas un carré bleu. Si le carré reste, dis-le : le repli est une petite icône.

### 2.8 Le carrousel et la barre d'outils `iPad`

- [ ] Regarde une étiquette d'élève évalué.
  ⮕ Attendu : plus d'icône d'aperçu ; un bouton de profil, le cadenas s'il y a lieu.
- [ ] Touche le bouton de profil d'un élève **autre** que la copie ouverte.
  ⮕ Attendu : c'est son profil qui s'ouvre. Reviens : la copie ouverte n'a pas changé.
- [ ] Touche tour à tour les boutons Codes et Tampons, après le carrousel.
  ⮕ Attendu : leur palette s'ouvre et se ferme ; le bouton est enfoncé quand elle est ouverte.
- [ ] Avec beaucoup de copies, regarde la place du carrousel.
  ⮕ Attendu : il défile, et les noms restent lisibles. Mesuré au banc à 820 px : 276 px pour lui, avec une seule étiquette.

### 2.9 Le trait des formes fermées et le polygone `iPad`

- [ ] Touche Pointillé, puis Cercle, puis trace un cercle.
  ⮕ Attendu : un cercle pointillé ; le segment Pointillé reste marqué pendant que Cercle est actif.
- [ ] Touche Vague, puis Rectangle, puis trace un rectangle.
  ⮕ Attendu : un rectangle ondulé, aux coins nets.
- [ ] Touche Polygone, pose quatre sommets au Pencil, puis touche le premier.
  ⮕ Attendu : un quadrilatère se ferme.
- [ ] Refais-en un, en touchant Annuler après le troisième sommet.
  ⮕ Attendu : seul le dernier sommet disparaît.
- [ ] Prévisualise le PDF de cette copie.
  ⮕ Attendu : le cercle pointillé, le rectangle ondulé et les polygones y sont, comme à l'écran.

## §3 · Décisions

Ce ne sont pas des vérifications : ce sont des choix posés à ta place, faute de pouvoir les trancher. Écris ton verdict.

- Les mots que je n'ai pas reçus de toi, listés au rapport (§ « Les mots ») : ______
- La phrase du codex, devenue « « Effacer la page » efface pour de bon les annotations de cette page. » : ______

## §4 · Ce que je n'ai pas pu vérifier

- **Le toucher réel** : deux doigts, le Pencil et la paume ne se simulent pas ; le banc fabrique ses événements.
- **Le carré bleu de ↕** : le WebKit du Mac ne le reproduit pas. Le correctif est lu au code, pas vu sur l'iPad.
- **La dictée** dans la zone de texte, et le clavier de l'iPad qui peut recouvrir le bas d'un long bloc.
- **Ton vrai codex** : combien de blocs ont déjà été rétrécis ou doublés, et pourquoi la fenêtre d'aperçu s'affichait vide chez toi.
- **La vérification complète du navigateur** n'a pas tourné : seules les specs touchées l'ont été.
