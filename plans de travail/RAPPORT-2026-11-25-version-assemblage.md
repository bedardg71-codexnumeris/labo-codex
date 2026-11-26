# Rapport — assemblage de la version du 25 novembre 2026 (`lot/version-2026-11-25`)

> **Branche** `lot/version-2026-11-25`, arbre `../labo-codex-version-1125`, partie de `origin/main` à `57f759ceb` (1.258.1).
> **Fait** : deux fusions, le nettoyage, Vitest complet, le verdict WebKit complet, l'aperçu. **Pas fait, par consigne** :
> ni bump, ni entrée de Nouvelles, ni push sur `main`, ni entrée de `RELAIS.md` sur `main`.
> **Verdict WebKit, pris sur `f4f436d81` : ROUGE au sens du jeton (19 rouges), mais aucun rouge ne tient à cette
> version** : 17 sont les familles A, D et E du 23 nov., 1 est rouge aussi sur `main`, 1 est vert rejoué seul.
> **Reste, au second message** : le bump, la ligne de Nouvelles, le report de `SAISIE_A` dans le pack, la reprise de
> `ace7308ea` (#1311 → #1319), et la décision sur le crochet de push (§ 6).

Mandat : consigne de la session coordonnatrice de Cowork, 25 nov. 2026, 20 h. Ce rapport distingue **mesuré**, **lu** et **inféré**.

## 1. Ce que la branche porte

| Commit | Contenu |
|---|---|
| `b48bd9dac` | fusion d'`origin/correctif/copie-exportee-annotee` à `0e08762a` (sans `ace7308ea`, son bump local) |
| `a462f8e40` | fusion d'`origin/lot/parcours-9-tampons` à `c45c8f42` (elle contient `lot/tampons-observation-3-production` à `677a8a1f`) |
| `f4f436d81` | le nettoyage : cinq pièces d'essai retirées, #1318 inscrit, compteur du BACKLOG |

**Conflits** (mesuré) : un seul, `RELAIS.md`. Les deux apports sont gardés : l'entrée du 25 nov. de la branche en tête,
les cinq entrées du 24 nov. de `main` à la suite. `index.html`, `BACKLOG.md` et `js/travaux-outils.js` se sont fusionnés
seuls ; le jeton du correctif (`travaux-archivage.js?v=20261123r`) et ceux des tampons sont tous présents.

**Pièces retirées** : `departs/ESSAI-tampons-observation-lot-3.zip`, la section `data-essai="tampons-observation"` de
`departs.html`, `tests/departs-de-parcours/essai-tampons-observation.js` et `.spec.js`,
`tests/integration/essai-tampons-observation-depart.spec.js`. `git ls-files | grep -i 'codes-en-lettres'` : rien
(témoin : `grep -i 'lettres'` rend `js/date-en-lettres.js`). Les rapports du lot 3 citent encore le fichier : daté au § 9.

**`SAISIE_A`** : restée dans `js/parcours-cibles.js`. Le pack de la démo est chargé sous le jeton du build
(`js/demo-namespace.js`, `jetonAntiCache()`) : le changer sans bump servirait l'ancien pack depuis le cache. À faire au bump.

**BACKLOG** : #1318 inscrit ; « Dernier ID utilisé : #1318 » ; #1319 réservé au bug de la copie exportée (#1311 sur sa
branche, numéro déjà pris ici par la fiche de la navigation privée de Safari).

## 2. Vitest

962 fichiers, 12 461 essais, tous verts, 50 s (mesuré, depuis `tests/`, sur `f4f436d81`).
La garde des noms réels du dépôt est `tests/unit/sentinelle-noms-reels-retires-2026-10-24.test.js` : verte. **Elle ne
cherche que deux noms connus** ; aucune garde générale n'existe. Je n'ai pas relu à l'œil les 2 200 lignes de bancs neufs.

## 3. Le verdict WebKit complet

| | |
|---|---|
| Commit jugé | `f4f436d81` |
| Compte | **1 949 essais : 1 907 verts, 23 verts au second essai, 19 rouges, 65 sautés** ; `nonJouees` : 0 |
| Durée | de 20 h 11 à 22 h 29 ; 40 demi-morceaux, aucun tué par le chien de garde |
| Conditions | secteur, `caffeinate`, un worker, un passage à la fois ; mémoire libre de 75 % à 80 %, garde à 60 % jamais approchée ; charge sous 4 |
| Outil | copie hors dépôt, `~/Library/Caches/labo-codex-verdict-1125/` (jugement, rejeux, relevé des passages) |
| Jeton | `scripts/.verdict-playwright.json` : `f4f436d8`, code 1 (non versionné) |

**Regardés d'abord, en deux passages ciblés avant la batterie** (mesuré) : 87 verts sur 87. `je-regarde-cibles` (parcours 9),
`jeu-fourni-operations` (fenêtre « Tampons et rétroactions », palette d'Annoter), `copie-exportee-annotee`,
`tampons-observation-lot-1-regler`, `-lot-2-observer`, `-lot-3-production`, `par-standards-lot-2-inscrire`,
`par-standards-lots-3-4` (section « Cibles » du profil).

### Les 19 rouges

| Famille (rapport du 23 nov.) | Essais | Rejoués seuls, sans reprise |
|---|---|---|
| **A**, le WebKit du banc ne range pas une copie : `perspective-coins` 81 ; `je-regarde-recevoir` 99 (2) ; `je-regarde-commentaires` 79 (2) ; `je-regarde-lire-ta-classe` 62 (2) ; `nous-faisons-recevoir` 130 (2) | 9 | 9 rouges |
| **D**, essais en retard : `pratiques-898` 25 ; `groupe-nomme-son-cours-872b` 22 ; `lot-a-anonymisation-enregistre` 402 ; `aide-lot-2c-bis-1152` 38 ; `profil-942-lecon-manquee` 122 | 5 | 5 rouges |
| **E**, non classés : `demo-deja-ouverte-troisieme-groupe` 56 (2) ; `parcours-8-commentaires` 623 | 3 | 3 rouges |
| **Hors de la liste du 23 nov.** : `carte-aide-materiel-2026-11-13` 218 (1180 × 820), « le texte de la carte ne défile pas » : 132 reçu pour 1 au plus | 1 | rouge ; **rouge aussi sur `main`** (`57f759ceb`, arbre témoin `../labo-codex-version-1125-temoin-main`, même erreur, même chiffre) |
| **Hors de la liste** : `bareme-3-evaluer` 262, « page fermée » deux fois dans la batterie | 1 | **vert** : une instabilité |

**Rouges neufs qui tiennent à cette version : aucun.** Les mêmes erreurs qu'au 23 nov. pour les 17 (lu dans le rapport,
comparé aux messages d'aujourd'hui). `carte-aide-materiel` n'était pas rouge sur la 1.258.0 (lu) : inféré, il a rougi
avec la 1.258.1 (le bandeau de version déplacé sous l'en-tête prend de la hauteur à l'accueil) ; non vérifié. **Issue :
rapporté, ni corrigé ni inscrit** (rouge ancien, étranger à la version).

Les familles B et C du 23 nov. (12 rouges) sont vertes, comme les deux rouges de la base (`pied-de-page-et-assistance`).

### Les 23 verts au second essai

`codex-1012-avertissement`, `comptes-erreurs-stock-1142` (2), `copie-demo-bibliotheque-31-oct`,
`critere-algorithmique-dit-vrai`, `critere-algorithmique-palette`, `en-tete-epure-2026-11-07`,
`evaluer-868-avec-ou-sans-copie`, `grilles-sous-criteres-condense`, `lot-i-bis-la-case-ouvre-un-codex`,
`nous-faisons-evaluer-2026-11-20`, `palette-evaluation-compacte` (2), `palette-evaluation-un-defilement-1214`,
`palette-retroaction-compacte`, `parcours-1-et-2-2026-11-08`, `parcours-5-monter-ton-cours`, `parcours-fleches-2026-11-10`,
`parcours-je-regarde-2026-11-16`, `presences-lot-d-enregistrement`, `registre-longitudinal-915`,
`tampons-masques-bibliotheque-1216`, `texte-troue-reperes-enonces`. Non rejoués seuls. Aucun n'est un banc neuf de cette
version ; `tampons-masques-bibliotheque-1216` est du module des tampons et était déjà instable le 23 et le 24 nov. (lu).

## 4. Ce qui change pour tout le monde (hors de l'étiquette « À l'essai »)

- La fenêtre « Rétroactions — Observations » s'intitule **« Tampons et rétroactions »** ; un jeu exporté s'intitule **« Tampons »** (c'était « Tampons d'observation »).
- La catégorie fournie « Action » s'appelle **« Opérations »**, six tampons : **Identification**, **Relation**, **Déduction** (les anciens Repérage, Liaison, Ouverture, avec des dessins neufs), **Interprétation**, **Comparaison**, **Induction**.
- **Incertain**, **Incomplet**, **Inexact** passent sous « Observations ».
- Les six phrases fournies d'« Opérations » (`js/travaux-outils.js`, l. 759 à 764), de Grégoire.
- La version annotée d'une copie reçue en image porte ses annotations à l'export ; le bilan de l'export nomme une copie dont la version annotée n'a pas pu être produite.
- Le stock : un espace qui a déjà enregistré ses tampons garde ses anciens noms (#1315, décidé par Grégoire).

Lu dans les rapports des lots et dans `js/travaux-outils.js` ; **je n'ai pas dressé moi-même l'inventaire complet des
chaînes d'écran des 1 485 lignes ajoutées à `js/` et aux styles.**

## 5. À reprendre au second message

- La ligne de Nouvelles d'`ace7308ea` (acceptée par Grégoire le 25 nov., 8 h 18), ses entrées de `RELAIS.md` et de
  `SUIVI-BUGS.md`, avec **#1311 → #1319**. Copie hors dépôt : le diff du commit, relu avant reprise.
- La ligne de Nouvelles des tampons « Opérations » (acceptée à 19 h 44).
- Le report de `SAISIE_A` dans `js/pack-demo-10.js` et son retrait de `js/parcours-cibles.js` (avec la sentinelle du parcours, qui lit `saisieA`).
- La ligne « complexité » du relais de release.

## 6. Ce que j'ai tranché au-delà de la consigne, et ce qui attend une décision

| | Décision | Ce que j'ai supposé |
|---|---|---|
| T1 | Un arbre témoin de `main`, `../labo-codex-version-1125-temoin-main` (détaché), pour savoir si un rouge est ancien | Que créer un arbre est permis ; il n'est pas supprimé (consigne) |
| T2 | Deux passages ciblés (87 essais) avant la batterie | Qu'un rouge neuf valait d'être su en 7 min plutôt qu'en 2 h |
| T3 | Le § 9 du rapport du lot 3 est daté, pas réécrit | La consigne du lot offrait les deux |
| T4 | `RELAIS.md` : aucune entrée écrite | Elle vit sur `main`, que ce relais ne touche pas ; elle viendra avec la release |
| T5 | Ce rapport est commité APRÈS le verdict, sur un commit qui ne porte que lui | Voir ci-dessous |

**⚠ Le crochet de push.** Le jeton est rouge pour `f4f436d81` : la base `scripts/playwright-baseline.json` ne connaît que
deux rouges (verts aujourd'hui), donc les 19 comptent comme « nouveaux » et le crochet refuse de pousser ce commit. La
branche d'aperçu part sur le commit du rapport, qu'aucun jeton ne couvre (le crochet avertit et laisse passer, comme
pour la 1.258.1). **Pour le push sur `main`, la question reste entière** : le commit de release demandera soit une base
mise à jour avec les 18 rouges anciens, soit un passage sans jeton, dit en clair. Je n'ai pas touché à la base : ce
qu'elle admet décide de ce qui entre sur `main`.

**Écart de conduite** : un rejeu (trois rouges de la famille A) a dépassé le délai de l'outil et fini en arrière-plan,
à cause d'un `sleep` orphelin du chien de garde du script de rejeu ; aucun autre passage n'a tourné pendant ce temps ;
script corrigé (hors dépôt).

## 7. Non vérifié

Safari réel et l'iPad ; Chromium ; les données réelles de Grégoire ; `app.codexnumeris.org` ; un PDF ouvert dans un
lecteur ; le mode sombre de la fenêtre des tampons ; les 23 instables rejoués seuls ; la cause de `carte-aide-materiel`.
