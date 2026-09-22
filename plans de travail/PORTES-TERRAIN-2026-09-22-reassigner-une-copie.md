# Portes terrain — réassigner une copie (1.154.0)

> Écrit le 22 septembre 2026, fin d'après-midi, pour la version **1.154.0**, build **0922-1455**.
> Trois portes, pas plus : ce que ni un test ni un navigateur de session ne peut juger — ton iPad, ta vue de la copie, tes vraies données. Tout le reste est mesuré par 45 essais et une passe WebKit (voir `Rapports/RAPPORT-lot-reassigner-2026-09-22.md`).
> **Ce qui échoue devient un item de backlog, pas une note mentale.** Aucun nom d'élève réel dans ce fichier : les portes parlent de « l'élève A » et « l'élève B ».

---

## §0 · Préalable

- [ ] **0.1** Ouvre `https://app.codexnumeris.org`, recharge (sur Mac : ⇧ + bouton recharger ; sur iPad : ferme l'onglet et rouvre), et lis le numéro en bas de page.
  ⮕ Attendu : **1.154.0**. Si tu lis 1.153.x, le lot n'est pas encore déployé : attends une minute et recharge. Rien d'autre à faire au §0.
- [ ] **0.2** Avant la porte 1.1 seulement : une sauvegarde Codex (Exporter et archiver › Sauvegarde). La réassignation en masse écrit dans tes copies ; un fichier remplacé va à la corbeille, récupérable 30 jours, mais la sauvegarde est le filet.

---

## §1 · ⚠⚠ Données — la réassignation en masse sur tes vraies copies

**1.1 Réassigner plusieurs copies d'un coup** · #934 · le geste du 22 sept. au matin, en un coup au lieu de 23

┌ POURQUOI ─────────────────────────────────────────────────────────┐
│ Le 22 au matin, 24 copies sont arrivées sous la mauvaise production │
│ et tu les as déplacées une par une. Maintenant : cocher, choisir la  │
│ cible, lire une seule question, confirmer.                           │
└──────────────────────────────────────────────────────────────────────┘

- [ ] Sur le Mac, Évaluations › Liste des évaluations. Filtre « Production » sur une production où plusieurs élèves ont une copie.
  ⮕ Attendu : une case à cocher au début de chaque ligne qui porte une copie ; **aucune case** sur une ligne « Non reçu ».
- [ ] Coche deux ou trois lignes.
  ⮕ Attendu : une barre apparaît au-dessus du tableau : « N copies sélectionnées · Réassigner la sélection (N) · Tout décocher ».
- [ ] Clique « Réassigner la sélection (N) », choisis une production cible où **l'un des élèves cochés a déjà une copie** (par exemple sa production « (rév) »).
  ⮕ Attendu : la fenêtre compte les copies, nomme chaque élève **avec le nom de son fichier**, et un bloc « 1 conflit » nomme le fichier existant (qui ira à la corbeille) et celui qui le remplace. Le bouton dit « Réassigner N copies ».
- [ ] Clique **Annuler**.
  ⮕ Attendu : rien n'a bougé dans la liste ni dans Annoter et évaluer. `[⚠⚠ Données]`
- [ ] Refais le geste et **confirme** cette fois, sur des copies que tu veux vraiment déplacer (ou sur une seule copie de test).
  ⮕ Attendu : la liste se rafraîchit, les copies sont sous la cible, la notification dit « N copies réassignées vers « … » », et le fichier en conflit est dans la corbeille de la liste (bouton « Corbeille »). Note ici le nombre déplacé : ______ `[⚠⚠ Données]`

---

## §2 · Interface

**2.1 La copie qu'on déplace se voit dans Propriétés** · #932 · la fenêtre était aveugle

┌ POURQUOI ────────────────────────────────────────────────────────────┐
│ « Réassocier » ouvrait un seul menu, sans dire de quel fichier il      │
│ s'agissait : c'est ainsi qu'un Artefact 1 annoté a pris la place d'un  │
│ Artefact 2 importé le matin même.                                      │
└────────────────────────────────────────────────────────────────────────┘

- [ ] Sur le Mac, dans la Liste, menu « Actions… » d'une ligne avec copie › **Réassigner**.
  ⮕ Attendu : la fenêtre « Propriétés du fichier » s'ouvre avec, en haut, la **vignette de la première page** et le **nom du fichier**, puis les champs Nom, Étudiant·e, Production, Évaluation liée. Si la vignette met une seconde à arriver, c'est normal (elle vient de la base) ; si elle reste un rectangle avec « PDF » ou « JPG » après quelques secondes, note-le.
- [ ] Change la production vers une où cet élève a déjà une copie, puis Sauvegarder.
  ⮕ Attendu : la question « Un fichier existe déjà pour cette production (…) : [fichier existant] / Le remplacer par : [ce fichier] ». Réponds **Annuler** : la fenêtre reste ouverte et rien n'est écrit (notification « Réassignation annulée »).
- [ ] Même fenêtre, mode **anonymisation** activé (Réglages) : rouvre Propriétés et refais la question.
  ⮕ Attendu : ni le vrai nom d'élève ni le vrai nom de fichier n'apparaissent ; la question et le nom en haut de la fenêtre disent le nom anonymisé (le même que la liste) et un nom de fichier générique.

**2.2 La case de sélection sur l'iPad** · #934 · seul ton doigt peut trancher `[iPad]`

┌ POURQUOI ─────────────────────────────────────────────────────┐
│ La case fait 18 px dans une colonne de 36 px. Sur Mac, la     │
│ souris s'en accommode ; au doigt, elle peut être trop petite.  │
└───────────────────────────────────────────────────────────────┘

- [ ] Sur l'iPad, Safari, même liste filtrée. Tape sur la case de trois lignes de suite, sans zoomer.
  ⮕ Attendu : chaque tape coche la bonne ligne du premier coup, et la barre monte à 3. Si tu dois t'y reprendre, ou si la tape ouvre autre chose, note-le : c'est une taille à changer, pas une erreur de ta part.
- [ ] Tape la case « tout sélectionner » de l'en-tête, puis « Tout décocher » dans la barre.
  ⮕ Attendu : toutes les lignes affichées se cochent, puis se décochent ; la barre disparaît.

---

## §3 · Décisions — ce qui attend ton verdict (pas des vérifications)

- **3.1** La porte du geste unitaire, quand l'ancienne production garde une évaluation, dit encore « L'évaluation pour l'ancienne production perdra son fichier associé. Continuer ? » (mot d'avant le lot). Le récapitulatif du geste en masse dit ta phrase validée. Faut-il aligner la porte sur ta phrase ? Ta réponse : ____________________
- **3.2** Le tableau d'« Annoter et évaluer » n'affiche toujours pas le nom du fichier (#933 refusé sur ton mot). À rouvrir seulement si un testeur s'y trompe. Rien à faire aujourd'hui, sauf si tu changes d'avis : ____________________

---

## §4 · Ce que je n'ai pas pu vérifier

- Safari et l'iPad : aucun navigateur WebKit réel en session. La spec WebKit de Playwright juge la logique et le DOM, pas le doigt ni la taille rendue.
- Tes vraies données : la réassignation en masse a été jouée sur une fixture de trois copies, jamais sur ton corpus. Les copies non identifiées (sans élève) ne se remplacent plus entre elles : mesuré sur le vrai stockage en banc, pas chez toi.
- L'anonymisation : prouvée sur des doublures des deux fonctions de `modes.js` (même contrat), pas sur le vrai mode à l'écran — d'où la troisième rangée de 2.1.
- Erreur de session, rattrapée par Cowork : la première version de la mesure comparait deux DA vides comme un conflit, et disait les vrais noms en mode anonymisation. Les deux sont corrigés avant cette release ; ce sont les rangées 1.1 (conflit) et 2.1 (anonymisation) qui en portent la preuve terrain.
