# Portes terrain — Grille imprimable des présences (#485, 1.90.0)

> **Créées le** : 21 août 2026 (session cloud, branche fusionnée dans `main`)
> **Artefact interactif (l'opération — cocher, mesurer, copier le relevé)** :
> <https://claude.ai/code/artifact/8f29a55c-76ef-4e8d-8c0f-66d9ea1c2011>
> **État** : ✅ RELEVÉ REÇU le 21 août (même jour) — **14 passées · 1 échec ·
> 0 non traitée**. L'échec (2.14, épreuve du papier : dates d'en-tête
> tronquées « 21… » + police trop grande) est **corrigé en 1.91.0** ; les
> verdicts 3.1 (réduire la police des cases — appliqué) et 3.2 (nom « Grille
> imprimable » gardé) sont actés. 1.91.0 livre aussi les deux retouches
> demandées au retour du relevé : **bouton « Grille imprimable » dans
> l'en-tête d'Enregistrement + modale** (l'accordéon du bas est retiré) et
> **notation des cases en 4 choix radio** (crochets ✓/✗ · X absences
> seulement · périodes de présence 2/1/0 · périodes d'absence).
> ⏳ **REPRISE DUE — voir « Reprise 1.91.0 » ci-dessous** (aussi ajoutée à
> l'artefact).
> **Règle** : ce qui échoue devient un item de backlog avec son numéro de
> porte, pas une note mentale.

Le chantier : une grille « élèves × séances » en PDF lettre paysage, à double
usage — rapport de saisie (crochet = présence complète, croix = absence,
chiffre = périodes partielles) et formulaire papier (cases vides = séances à
saisir au crayon, reportées ensuite dans l'écran de saisie). Modelée sur la
feuille réelle H2026 (codes 1a…15b, colonnes Prog./SA), dates imprimées,
1 feuille par groupe.

---

## §0 · Préalable

Aucun backup requis : la grille ne fait que **lire** les données et produire
un PDF — elle n'écrit rien. ⚠ L'app tourne en `file://` : elle est à la
version du **dernier `git pull`** — un oubli ici fabrique des faux échecs
indétectables (deux des quatre échecs des 81 portes venaient de là).

- [ ] **0.1 Mettre le build à jour** — `git pull`, ouvrir l'app, bas de page.
  ⮕ Attendu : version **1.90.0** (build 0821-1139) ou plus récente.

## §1 · Données

Aucun geste : ce chantier n'écrit aucune donnée.

## §2 · Interface

- [ ] **2.1 La carte existe** — Suivi → Saisie des présences, ne toucher à
  rien d'autre. ⮕ Sous le tableau de saisie, une carte repliée « Grille
  imprimable » avec chevron. (Avant : rien — la grille papier se maintenait
  entièrement à la main.)
- [ ] **2.2 Les options au premier regard** — déplier la carte. ⮕ Cinq cases
  (Numéro de DA, Sous-groupe, Programme (code), Nom du programme, Services
  adaptés), sélecteur « Groupes », bouton « Générer le PDF ». **Programme
  (code) et Services adaptés cochés d'office** (les colonnes de la feuille
  actuelle).
- [ ] **2.3 Les deux modes** — sombre puis clair. ⮕ Carte lisible dans les deux.
- [ ] **2.4 Le PDF se génère** — « Groupe actif », cliquer « Générer le
  PDF ». ⮕ `grille-presences-….pdf` se télécharge, aucun message d'erreur
  sous le bouton.
- [ ] **2.5 L'en-tête de la feuille** — ouvrir le PDF. ⮕ Paysage ; « Grille
  des présences — [cours] » ; « groupe … · [trimestre] · générée le
  [aujourd'hui] » ; « p. X/Y » en bas à droite. (Avant : « 101-00-groupe
  00002 H2026 » écrit à la main.)
- [ ] **2.6 Les colonnes de séances** — comparer l'en-tête des colonnes à
  l'horaire réel. ⮕ Code (1a, 1b, 2a…) au-dessus de la date jj/mm ; congés
  sans colonne ; reprises à leur vraie date.
- [ ] **2.7 MESURE — la grille tient-elle ?** — compter les pages pour UN
  groupe, juger la lisibilité écran. **Mesure d'entrée : aucun chiffre n'est
  un échec.** → noter : `____________________`
- [ ] **2.8 Les cases disent vrai** — une séance déjà saisie, 3 élèves,
  comparer PDF ↔ écran de saisie. ⮕ Complète → crochet ; absence → petite
  croix ; partielle → le chiffre. Concordance exacte.
- [ ] **2.9 Les cases vides sont les bonnes** — colonnes des séances à venir
  ou jamais saisies. ⮕ Entièrement vides, prêtes pour le crayon.
- [ ] **2.10 Une option change la feuille** — cocher « Numéro de DA »,
  regénérer, décocher. ⮕ Colonne DA avec les vrais numéros.
- [ ] **2.11 Les choix sont mémorisés** — Cmd+R, revenir, déplier. ⮕ Les
  cases sont restées telles quelles.
- [ ] **2.12 Tous les groupes d'un coup** — si plusieurs groupes-cours :
  « Tous mes groupes-cours », générer. ⮕ Un PDF, une feuille par groupe,
  chaque en-tête avec son numéro ; un groupe sans horaire est **nommé dans un
  message sous le bouton**, jamais imprimé faux.
- [ ] **2.13 Depuis l'iPad** `[iPad]` — Safari iPad : carte au doigt, générer.
  ⮕ Cases cochables sans viser, PDF s'ouvre ou se partage.
- [ ] **2.14 MESURE — l'épreuve du papier** — imprimer (8,5 × 11, paysage),
  écrire au crayon dans quelques cases. → lisible ? cases assez grandes ? :
  `____________________`

## §3 · Décisions — ce qui attend un verdict

**Ce ne sont pas des vérifications** : des choix posés faute de pouvoir les
trancher à sa place. Un verdict s'écrit, il ne se coche pas.

- **3.1 Si l'impression est trop serrée, que sacrifier ?** (a) colonne Nom
  plus étroite · (b) trimestre coupé en 2 pages · (c) rien, c'est bien ainsi.
  → verdict : `____________________`
- **3.2 Le nom de la carte** — « Grille imprimable » convient-il, ou autre
  chose (ex. « Liste de présences papier ») ? → verdict : `____________________`

## §4 · Ce que je n'ai pas pu vérifier

- **Aucun PDF n'a jamais été OUVERT.** La logique des cases (états, codes
  1a…15b, exclusion des rattrapages RàI, legacy heures) est prouvée par
  9 tests Vitest ; le **rendu visuel** — crochets tracés au trait, largeurs,
  découpage en pages — n'a été vu par personne. Portes 2.5-2.9 = la preuve.
- **Safari et iPad** : structurellement absents du conteneur.
- **« Tous mes groupes-cours »** jamais exécuté sur un vrai trimestre
  multi-groupes.
- **Erreurs de session, rattrapées avant commit** : un commentaire cassé
  (`/` au lieu de `//`) dans preferences.js, corrigé avant les tests ; la
  note d'ordre de chargement du script preferences.js effacée par une
  édition d'index.html, restaurée dans la minute. Aucune n'a atteint le dépôt.

---

## Reprise 1.91.0 — après les retouches du 21 août

- [ ] **R1 Build à jour** — `git pull`, bas de page. ⮕ **1.91.0** (build
  0821-1238) ou plus récent.
- [ ] **R2 Le bouton et la modale** — Suivi → Saisie des présences. ⮕ Un
  bouton « Grille imprimable » dans l'en-tête de la carte Enregistrement (à
  côté du compteur d'étudiants) ; il ouvre une fenêtre avec les cases, les
  4 notations et le choix de groupes ; le X la referme. L'ancien panneau
  replié du bas de page a disparu.
- [ ] **R3 Les quatre notations** — générer 4 PDF, un par notation. ⮕
  crochets : ✓/✗/chiffre partiel · X : croix sur absences seulement ·
  périodes de présence : 2/1/0 partout · périodes d'absence : chiffre
  seulement quand il manque du temps. La légende du bas suit chaque choix.
- [ ] **R4 MESURE — l'épreuve du papier, reprise** — imprimer (8,5 × 11,
  paysage). ⮕ Dates d'en-tête complètes (« 21/08 », plus de « 21… »),
  police plus petite, écriture au crayon confortable. → noter :
  `____________________`
- **R5 DÉCISION — l'unité des chiffres** : tu as demandé « le nombre
  d'HEURES de présence/absence » ; j'ai livré des **périodes** (l'unité de
  ta saisie et de ta feuille : « 2 » = séance complète ; en heures d'horloge,
  2 périodes de 55 min feraient « 1,8 »). Garder les périodes, ou vraiment
  les heures ? → verdict : `____________________`

---

## Au retour du terrain

1. Trier les échecs : défaut réel ou build en retard ?
2. Verser chaque échec réel au BACKLOG avec son numéro de porte.
3. Mettre à jour CE fichier — état, date, ce qui reste.
4. Aucune porte « probablement passée » : cochée, ou due.


## Signaux console observés en usage réel (21 août, 15 h 05 — session locale, hors porte)

Relevés sur la capture de Grégoire pendant l'usage de la grille (données réelles, file://) :

- **« ⚠️ Format de séance non reconnu » ×6** (`saisie-presences.js:338`) — PRÉ-EXISTANT à #485
  (code de 1.31.x) : 6 séances de l'horaire réel ont un format que le calcul d'heures ne
  reconnaît pas → repli 2 h avec warn. À recouper avec le cluster horaire legacy (lot L7/#469) ;
  le repli lit en outre la clé NUE `formatHoraire` (famille #464, notée pour L7).
- **« Unsafe attempt to load URL file://… from frame »** (`index.html:1`) — vraisemblablement
  l'aperçu/impression de la grille dans un iframe sous `file:` (origines uniques). À vérifier
  par la porte d'impression de cette liste : si le PDF sort correctement, message bénin ;
  sinon, c'est le symptôme à verser.
