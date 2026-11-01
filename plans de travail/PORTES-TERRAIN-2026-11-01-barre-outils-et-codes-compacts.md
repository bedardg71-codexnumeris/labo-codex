# Portes terrain – la barre d'outils et la palette Codes compactes (1er novembre 2026)

> **La trace.** L'opération (cases à cocher, bouton « Copier mes résultats ») est l'artefact jumeau, à publier par Cowork.
> Lot : `plans de travail/CONSIGNE-LOT-2026-11-01-barre-outils-et-codes-compacts.md`, rapport `RAPPORT-2026-11-01-barre-outils-et-codes-compacts.md`.
> **État : pas encore due.** Le lot est commité sur `main`, pas poussé : à l'adresse en ligne, rien de tout ça n'existe encore. Cette liste attend la mise en ligne.
> Ce qui échoue devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

Tout se fait sur **l'iPad, sur `https://app.codexnumeris.org`**. Aucune console, aucun Terminal.

## §0 · Préalable

- [ ] Ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
  ⮕ Attendu : le numéro annoncé par la release du lot (à inscrire ici à la mise en ligne). Un numéro plus ancien : arrête-toi, tu jugerais l'état d'avant.
- [ ] Ouvre une production avec plusieurs copies, en mode Annoter.

## §1 · ⚠⚠ Données

Aucun geste de cette liste ne touche tes copies ou tes évaluations. Seul ton choix de disposition de la palette Codes est retenu.

## §2 · Interface

### 2.1 Plus de noms dans le carrousel `iPad`

Pourquoi : tu voyais un nom complet et deux coupés.

- [ ] Regarde le carrousel en haut de l'écran.
  ⮕ Attendu : au moins trois noms complets.
- [ ] Regarde le symbole devant chaque nom : copie ouverte, copie évaluée, copie importée.
  ⮕ Attendu : tu les distingues d'un coup d'œil, sans lire de mot. Le mot revient dans la bulle.
- [ ] Touche le symbole d'une autre copie.
  ⮕ Attendu : cette copie s'ouvre, et rien d'autre ne se passe.

### 2.2 Le titre d'une production longue `iPad`

- [ ] Choisis une production au titre long et regarde le menu de la production.
  ⮕ Attendu : le titre se coupe par « … », sans pousser les autres boutons.

### 2.3 Les autres boutons de la barre `iPad`

Pourquoi : ils ont rétréci et se sont soudés ; ils doivent répondre comme avant.

- [ ] Change de page avec ‹ et ›.
  ⮕ Attendu : la page change et le compteur suit, écrit « 1/3 ».
- [ ] Touche le pourcentage du zoom, puis le plein écran.
  ⮕ Attendu : les deux répondent comme avant.
- [ ] Ouvre et ferme chacune des palettes.
  ⮕ Attendu : comme avant.

### 2.4 La page ne défile plus `iPad`

Pourquoi : la page entière défilait sous les palettes.

- [ ] Hors plein écran, en Annoter, glisse un doigt sur une palette qui a beaucoup de contenu.
  ⮕ Attendu : seule cette palette défile ; la page ne bouge pas.
- [ ] Refais le même geste en Évaluer.
  ⮕ Attendu : pareil.
- [ ] Hors plein écran, en Évaluer, écris dans le champ de la palette Rétroaction.
  ⮕ Attendu : tu peux écrire. Il est plus bas qu'avant (environ quatre lignes) ; le plein écran lui rend la hauteur.

### 2.5 La palette Codes compacte `iPad`

Pourquoi : quand tu connais tes codes, leurs noms prennent la place de la copie.

- [ ] Dans l'en-tête de la palette Codes, touche le bouton aux quatre carrés.
  ⮕ Attendu : des tuiles de couleur numérotées, et le bouton marqué.
- [ ] Touche une tuile.
  ⮕ Attendu : le nom du code paraît sous la grille, et la palette ne change pas de hauteur.
- [ ] Ouvre la copie suivante.
  ⮕ Attendu : la palette reste compacte.
- [ ] Recharge la page.
  ⮕ Attendu : la palette reste compacte.
- [ ] Passe en mode clair, puis en mode sombre.
  ⮕ Attendu : les numéros et les noms se lisent dans les deux.

## §3 · Décisions

Ce ne sont pas des vérifications : ce choix t'appartient.

- **La hauteur hors plein écran te convient-elle à l'usage, pour la copie et le champ de rétroaction ?** Verdict écrit : ______

## §4 · Ce que je n'ai pas pu vérifier

- Le vrai Safari de l'iPad : les tests tournent sur WebKit de bureau, et la barre d'adresse qui se replie n'y existe pas.
- Le rendu à l'œil des symboles et des deux modes : aucun test ne le juge.
- Ce que voit une fenêtre d'iPad plus courte, avec la barre d'onglets.
- Erreur de la session : les trois parties ont d'abord été commitées avec trois tests de garde rouges, corrigés avant ce rapport.
