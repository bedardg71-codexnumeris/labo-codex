# Portes terrain — Registre longitudinal, lots 1 et 2 (#915), 1.144.0

> **Trace versionnée.** Le jumeau interactif (cases, compteur, bouton « Copier mes
> résultats ») est publié par Cowork. Ce qui échoue devient une fiche du BACKLOG
> avec son numéro de porte, pas une note mentale.
>
> **Peu de portes, exprès** (règles de tête du skill `portes-terrain`) : tout ce
> qu'une machine pouvait juger l'a été — 22 essais Vitest, 16 mutations rouges,
> un banc WebKit à 768 px sur un trimestre actif archivé (stock identique octet
> pour octet, cibles ≥ 44 px, champ ouvert sous la garde du mode archive). Il reste
> ce que seul ton corpus réel peut dire : **des mesures**, pas des vérifications.

---

## §0 · Préalable

- [ ] **0.1** Ouvre `https://app.codexnumeris.org`, recharge (avec vidage de cache
  si l'onglet était déjà ouvert), et lis le numéro en bas de page.
  ⮕ Attendu : **1.144.0**. Si c'est 1.143.0 ou moins, le lot n'est pas encore
  déployé : tout le reste attend.
- [ ] **0.2** Aucun geste de cette liste n'écrit dans tes trimestres. Un backup
  Codex reste le réflexe avant toute première utilisation d'un écran neuf.

---

## §1 · ⚠⚠ Données — ce que tu exécutes sur ton corpus

**Ce que tu vivais** : pour suivre un élève après ton cours, il fallait rouvrir
son trimestre, et ce trimestre ne peut pas être retiré sans perdre le suivi.

**Ce qui change** : Labo › Suivi longitudinal. Tu cherches un élève par nom, tu
l'inscris, et une copie datée de son dossier (sans les copies numériques) est
rangée dans un registre à part, hors trimestre.

- [ ] **1.1** Labo › Suivi longitudinal. Tape les trois premières lettres du nom
  d'un élève que tu as eu dans **deux** trimestres.
  ⮕ Attendu : une seule ligne pour lui, avec ses deux trimestres en suffixe
  (« Automne 2024 (601-101-MQ, gr. 00001) · Hiver 2026 (…) »). Une ligne par
  trimestre = ✗, note son nom.
- [ ] **1.2** Choisis-le, puis « Inscrire au registre ».
  ⮕ Attendu : sous le bouton, une ligne « N évaluation·s · N séance·s · N grille·s :
  … · 2 dossier·s, N Ko — Capturé le AAAA-MM-JJ », et l'élève apparaît dans la
  liste du bas avec ses deux trimestres et la date.
  `⚠⚠ Données` (le registre seulement : tes trimestres ne bougent pas)
- [ ] **1.3 — MESURE, pas une vérification.** Recopie ici la ligne du résumé
  de 1.2 (surtout le nombre d'évaluations et les Ko) : ______________________
  ⮕ Aucun chiffre n'est un échec. Sur le pack démo, un dossier de 10 évaluations
  pèse 43 Ko ; ton A2025 (303 évaluations pour tout le groupe) donnerait environ
  1,1 Mo si tout le monde était inscrit. **C'est cette mesure qui tranche le
  budget du § 4.1 bis du cadrage** : un trimestre sans copies importées ne libère
  rien à la suppression, registre ou pas — c'est un fait sur tes données, pas
  un défaut du lot.
- [ ] **1.4** Reviens dans ce trimestre (Calendrier › Trimestre, ou une évaluation
  de cet élève) : rien n'a changé.
  ⮕ Attendu : ses évaluations, ses présences, ses indices sont tels qu'avant.
  (Prouvé par banc sur un trimestre archivé ; ici c'est ton corpus.)
- [ ] **1.5** Fais « Inscrire » une seconde fois sur le même élève.
  ⮕ Attendu : le bouton dit maintenant « Re-capturer » et demande confirmation ;
  après, la date de capture est celle d'aujourd'hui, et il n'y a toujours qu'une
  ligne pour lui dans la liste.

---

## §2 · Interface — sur l'iPad seulement si tu y es

Pas de porte : mise en page vérifiée à 768 px sous WebKit (champ et boutons à
44 px et plus, champ de recherche ouvert même quand le trimestre actif est
archivé). Si quelque chose déborde ou ne répond pas sur l'iPad, dis-le, on
corrige — rien d'irréversible ici.

---

## §3 · Décisions — ce qui attend ton verdict (champ de saisie, pas une case)

**Ce ne sont pas des vérifications** : des choix posés faute de pouvoir trancher
à ta place.

- **3.1 Un élève inscrit ne peut pas encore être retiré du registre.** Le lot 2
  ne pose que l'inscription ; le retrait n'est dans aucun lot du cadrage. Deux
  options : (a) un bouton « Retirer du registre » au lot 3, avec les résultats
  ultérieurs ; (b) rien, on retire par l'export complet. Ton choix : ________
- **3.2 Les mots de l'écran** (sous-titre, phrase de sauvegarde, « Inscrire au
  registre », « Re-capturer », la ligne de résumé) sont de Claude Code, pas
  relus. Un mot à changer : ________

---

## §4 · Ce que je n'ai pas pu vérifier

- **Ton corpus réel** : le nombre d'élèves distincts dans tous tes trimestres,
  le poids réel d'un dossier (porte 1.3), et si un même élève porte bien le
  même DA d'un trimestre à l'autre (un DA fabriqué par l'application, #914,
  ferait deux lignes).
- **L'iPad et Safari** : mesuré sous WebKit seulement.
- **Trouvé en chemin, non corrigé, hors lot** : au démarrage, l'application
  recalcule les indices du trimestre actif **même archivé** (semé P = 0,8 dans
  le banc, relu 0 après le rechargement). La capture copie ce que le stock porte
  à ce moment ; le banc le fige ainsi. C'est du code étranger sans symptôme vécu :
  commenté dans le banc, pas inscrit.
- **Une erreur de la session, rattrapée** : la première forme copiait les grilles
  et échelles dans chaque dossier (15,5 Ko sur 58 par élève, répétés). La mesure
  sur le pack démo l'a montrée avant la livraison ; les modèles sont maintenant
  rangés une fois par trimestre.
