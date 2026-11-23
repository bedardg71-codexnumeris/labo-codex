# Rapport — verdict WebKit complet de la 1.258.0 (23 novembre 2026)

> **Branche** `lot/verdict-1.258`, partie de `origin/main` à `4d1043cce` (1.258.0, build `1122-2306`). **Une mesure,
> rien d'autre** : aucun code corrigé, aucun essai retouché, aucun bump, rien sur `main`.
> **Verdict : ROUGE.** 1 869 essais joués sous WebKit sur le Mac : 1 822 verts, 18 verts au second essai, **29 rouges**,
> 65 sautés. Les 29 rouges, rejoués seuls, restent rouges : aucun n'est une instabilité.
> **Lecture en une phrase** : aucun des 29 n'a été établi comme un défaut propre à Safari ; 12 tiennent à
> l'application sur tout navigateur (la bulle des parcours, le bandeau de version), 14 à des essais (9 qui butent sur
> une limite connue du WebKit du banc, 5 en retard sur la 1.255–1.258), 3 ne sont pas classés.
> **Reste à faire, par d'autres** : décider des correctifs du § 4 ; les gestes de l'iPad du § 7.

Ce rapport distingue **mesuré** (au banc ou par une sonde), **lu** (dans le code ou un rapport) et **inféré**.
Mandat : session coordonnatrice de Cowork (« Gestion des pratiques de notation 4 »), 23 nov. 2026.

## 1. Le compte

| | |
|---|---|
| Commit jugé | `4d1043cce`, `version.json` : `{"build":"1122-2306","beta":"1.258.0"}` (mesuré) |
| Vitest (depuis `tests/`) | 957 fichiers, 12 327 essais, tous verts, 50 s (mesuré) |
| Playwright WebKit | 430 fichiers, **1 869 essais : 1 822 verts, 18 au second essai, 29 rouges, 65 sautés** (mesuré) |
| Rouges rejoués seuls, une fois, sans reprise | **29 rouges sur 29** (mesuré) ; un des 29 (`parcours-4` 155) y finit par dépassement de délai au lieu de son erreur d'origine |
| Durée | de 10 h 34 à 13 h 43, soit 3 h 09 d'horloge ; 2 h 16 de jeu (8 140 s) ; le reste : gardes, et 40 min perdues (voir § 6) |
| Conditions | secteur, `caffeinate`, un worker, un passage à la fois, Cowork et navigateurs fermés (dit par Grégoire) ; mémoire libre entre 74 % et 79 % du début à la fin, garde à 60 % jamais approchée |
| Jeton | `scripts/.verdict-playwright.json` : `4d1043cc`, code 1 (non versionné) |

Par rapport au dernier verdict WebKit conservé sur ce Mac (`bad001143`, 1.254.0, 22 nov. au matin, 1 845 essais) :
**14 des 29 rouges y étaient verts** (ils ont rougi en 152 commits) ; **15 n'avaient jamais été joués sous WebKit**.

Les deux rouges connus de la base (`pied-de-page-et-assistance`, 820 px, clair et sombre) sont **verts** : la base
`scripts/playwright-baseline.json` les nomme encore. Non retouchée (hors mandat).

## 2. Ce que le § 10.6 du rapport du 22 nov. demandait de regarder en premier

| Point | Banc | État sous WebKit (mesuré) |
|---|---|---|
| 1. Le parcours 9 | `je-regarde-cibles-2026-11-23` | **vert** (3 essais) |
| 2. « Je regarde » des parcours 6, 7, 8 | `je-regarde-donnees` | **vert** (2) |
| | `je-regarde-lire-ta-classe` | **rouge** (2), famille A |
| | `je-regarde-commentaires` | **rouge** (2), famille A |
| 3. La référence fusionnée à la main | `vue-simple-modeles-actuels-epingles` | **vert** (2) ; `vue-simple` : vert (61) |
| 4. Le pied de page à 820 px | `pied-de-page-et-assistance` | **vert** (4) |
| 5. La démo déjà ouverte | `demo-deja-ouverte-troisieme-groupe` | **rouge** (2), non classé (§ 3, E) |
| 6. Les rouges de la base Chromium | `codex-de-depart` (3), `parcours-2` (2), `parcours-4` (2), `parcours-6` (5) | **rouges** aussi sous WebKit |
| 7. Les dates au premier du mois | `par-standards-lots-3-4` | **vert** (7) |

Aussi verts : `modele-fourni-non-supprimable` (6), `echelle-de-depart-aucun` (2).

## 3. Les 29 rouges, par famille

Les captures sont dans `plans de travail/captures-2026-11-23-verdict-webkit-1.258.0/` (29 fichiers, réduits ; données
fictives de la démo). Elles montrent l'écran au moment de l'échec, au rejeu.

### A. Neuf rouges : l'essai est fautif (limite connue du WebKit du banc), et ces gestes ne sont donc PAS jugés

| Banc | Essais | Erreur |
|---|---|---|
| `perspective-coins-2026-11-17` 81 (A2) | 1 | l'import ne se termine pas en 60 s |
| `je-regarde-recevoir-2026-11-17` 99 (B, deux tailles) | 2 | `page.evaluate: null` dès `poserUnBlobReel` (`harness/recevoir-modele-de-banc.js:183`) |
| `je-regarde-commentaires-2026-11-22` 79 (B, deux tailles) | 2 | la bulle reste à « 4 sur 10 » (« Importe-les ») |
| `je-regarde-lire-ta-classe-2026-11-22` 62 (B, deux tailles) | 2 | idem, ou « Oui, importer » introuvable |
| `nous-faisons-recevoir-2026-11-19` 130 (deux tailles) | 2 | la bulle reste à « 2 sur 9 » après « Importer » |

- **Mesuré** (sonde hors dépôt sur `perspective-coins` A2, console de la page écoutée) : à l'import,
  `[DB] Erreur storeBlob … UnknownError: Error preparing Blob/File data to be stored in object store`, puis
  `[Travaux-Import] Erreur import …`. La copie n'est pas rangée, la file ne se vide pas.
- **Lu** : c'est une limite déjà connue et déjà contournée dans le dépôt. `parcours-4-recevoir-et-rendre` (l. 95-108) et
  `etats-vides-preparer-copies` (l. 21-36) le disent : « le WebKit éphémère de Playwright refuse un Blob en IndexedDB
  sous `file://` », et ils posent un magasin de remplacement sous WebKit seulement. Les cinq bancs ci-dessus, écrits
  dans le nuage sous Chromium, ne le posent pas.
- **Inféré** pour les quatre autres bancs : même cause (ils s'arrêtent tous au geste qui range une copie), non sondés
  un à un.
- **Ce qu'un utilisateur verrait sous Safari** : rien de cela, si l'inférence tient. La limite est celle du banc
  (session éphémère, `file://`), pas celle de Safari en ligne. **Non mesuré ici** : l'import d'une copie dans le vrai
  Safari sur la 1.258.0.
- **Conséquence** : sous WebKit, **ne sont pas jugés** les modèles « Je regarde » des parcours 4, 7 et 8 au-delà de
  l'import, la Pratique guidée de « Recevoir » par la voie des fichiers, et le réglage de lumière à l'import.

### B. Neuf rouges : l'application est fautive, mais pas seulement sous Safari (la bulle des parcours)

| Banc | Essais | Ce que la personne voit | Capture |
|---|---|---|---|
| `parcours-2-ma-classe` 248, 563 | 2 | Parcours 2, étape 1 « Ton trimestre », à 1180 px : la bulle est posée sur le formulaire et couvre « Session », l'année et le début des dates qu'elle demande de remplir ; 3 flèches au lieu de 6 | `parcours-2-ma-classe-2026--51165.jpg`, `-f1812.jpg` |
| `parcours-4-recevoir-et-rendre` 155, 396 | 2 | Parcours 4, étape 2 « Vérifie avant d'importer », à 1180 et 820 px : la bulle recouvre le bouton « Importer » qu'elle demande de toucher | `parcours-4-recevoir-et-ren-949c8.jpg`, `-c3348.jpg` |
| `parcours-6-donnees-a-l-abri` 343 (clair, sombre), 422, 510, 519 | 5 | Parcours 6, étape 3 « Range ton fichier » : la bulle, à droite de l'aperçu, dépasse le bas de la fenêtre (« Quitter le parcours » coupé) ; à 1179 px elle n'est plus au-dessus de « Mettre à jour » | `parcours-6-donnees-a-l-abr-*.jpg` (5) |

- **Mesuré** : les erreurs (« la bulle ne couvre pas … » : reçu vrai ; « la bulle dans la fenêtre » : reçu faux ;
  « nombre de flèches » : 3 pour 6). Ces 9 essais étaient verts sous WebKit le 22 nov. au matin.
- **Lu** : le rapport du 22 nov. (§ 6) les compte déjà rouges sous Chromium (« les 17 de la base »). Ce n'est donc pas
  un défaut de Safari.
- **Inféré** : la bulle a grandi depuis. La capture du parcours 2 montre en tête deux lignes neuves, « Parcours 2 ·
  Mettre ta classe en place · Nous faisons » et « Tu peux déplacer cette bulle par sa poignée et faire défiler la page
  pour mieux voir. » (`PHRASE_DE_LA_POIGNEE`, `js/parcours-moteur.js:251`, entrée avec `e6b3cd6ad`), et les textes des
  parcours 4 et 6 ont été récrits le 22 nov. Plus haute, la bulle ne trouve plus de place libre. Non vérifié par un
  essai avec et sans ces lignes.
- La personne peut déplacer la bulle par sa poignée : le parcours n'est pas bloqué, il est gêné.

### C. Trois rouges : l'application est fautive, mais pas seulement sous Safari (le bandeau de version)

`codex-de-depart-2026-11-20` 51, trois départs (« Mettre tes données à l'abri », « Monter ton cours », « Recevoir les
productions »).

- **Ce que la personne voit** (capture `codex-de-depart-2026-11-20-fe9b3.jpg`) : après l'ouverture d'un codex fait sur
  un autre build, le bandeau orange « Bêta publique 1.258.0 … Nouvelle version chargée. Tes données persistent. »
  couvre le coin droit de l'en-tête : « Codex », le sélecteur de thème et le menu. Il faut le fermer par son × pour
  atteindre le menu.
- **Mesuré** : le clic sur `#entete-menu-bouton` n'aboutit pas en 20 s (`harness/classe-de-banc.js:54`).
- **Lu** : rouge aussi sous Chromium sur la base (rapport du 22 nov., § 6, même cause dite). Texte du bandeau :
  `js/init-inline.js:417`.

### D. Cinq rouges : l'essai est en retard sur la 1.255–1.258 (pas Safari)

| Banc | Erreur (mesurée) | Cause | Statut |
|---|---|---|---|
| `pratiques-898-echelle-a-l-adoption` 25 | la question d'adoption offre trois échelles ; l'essai en attend deux. La troisième : « Échelle de départ – Par standards » | l'échelle de départ, livrée depuis | lu dans l'erreur |
| `groupe-nomme-son-cours-872b` 22 | « 00003 · sans cours » attendu, « Tous les groupes » reçu | la démo porte maintenant un groupe « 00003 » (`js/pack-demo-10.js:45`, `:10061`) : l'ancienne valeur de l'essai devient ambiguë | lu |
| `lot-a-anonymisation-enregistre` 402 (R5) | 20 rangées de présences, 10 attendues | la démo à trois groupes | inféré |
| `aide-lot-2c-bis-1152` 38 | la recherche « report » ne trouve plus la fiche `planifier-rai` | le paragraphe de l'aide qui décrivait le report des présences a été retiré d'`index.html` depuis le 22 nov. | lu (diff) |
| `profil-942-lecon-manquee` 122 | la sonde « prénom » ne se lit pas au profil en mode normal | non trouvée ; le profil affiché est celui d'une démo à dix élèves | inféré, faible |

Deux de ces cinq portent une question qui n'est pas technique : l'échelle de départ doit-elle être offerte à
l'adoption d'une pratique (`pratiques-898`) ? L'aide doit-elle encore répondre à « report » (`aide-1152`) ?

### E. Trois rouges non classés

- **`demo-deja-ouverte-troisieme-groupe-2026-11-23`** 56, deux tailles. **Mesuré** : après le rechargement d'une démo
  ouverte avant la 1.258.0, le troisième groupe arrive, et **une seule clé de la démo a changé :
  `demo_indicesAssiduite`** ; toutes les autres sont gardées item pour item. **Lu** : vert sous Chromium (rapport du
  22 nov.). **Inféré** : c'est un indice calculé, pas une saisie ; qu'il soit recalculé au démarrage sous WebKit et pas
  sous Chromium n'est pas expliqué. Ni « application fautive », ni « essai fautif » établi.
- **`parcours-8-commentaires-2026-11-09`** 623 (820 px). **Mesuré** : le contour n'est jamais posé sur le champ
  « mots de référence » ; la capture (`parcours-8-commentaires-20-00d12.jpg`) montre la bulle arrêtée à « 5 sur 10 »,
  avec « Pour continuer, écris la longueur de référence et la tolérance, ou touche "Retirer la limite". » Cause non
  trouvée par lecture. Vert le 22 nov. au matin ; le banc et `js/parcours-commentaires.js` ont changé depuis.

## 4. Correctifs proposés, non posés

Pour les rouges de l'application seulement (familles B et C).

1. **La bulle qui ne trouve plus sa place (B, 9 rouges).** Trois voies, de la moins à la plus large :
   a) ne dire la phrase de la poignée qu'à la première étape d'un parcours, ou la replier ensuite — toucherait
   `js/parcours-moteur.js` (le rendu de l'en-tête) et les bancs qui lisent la bulle mot pour mot
   (`harness/bulle-du-22-nov.js`) ; les mots sont lus par les enseignant·es : **à valider par Grégoire** ;
   b) plafonner la hauteur de la bulle à la fenêtre, avec un défilement intérieur — toucherait `css/parcours.css` et
   le placement dans `js/parcours-moteur.js` ; règle le parcours 6, pas forcément les parcours 2 et 4 ;
   c) revoir la place déclarée de la bulle aux trois étapes en cause (parcours 2 étape 1, parcours 4 étape 2,
   parcours 6 étape 3) — toucherait `js/parcours-classe.js`, `js/parcours-recevoir.js`, `js/parcours-donnees.js`.
   La cause étant inférée, **la première étape serait de la mesurer** (un essai avec et sans les deux lignes de tête).
2. **Le bandeau de version sur le menu (C, 3 rouges).** Le poser sous l'en-tête plutôt que dessus, ou le faire céder
   quand le menu est visé — toucherait le style du bandeau et `js/init-inline.js` ; à juger aussi à 820 px.

Pour les essais (familles A et D), ce ne sont pas des correctifs de l'application : poser le magasin de remplacement
WebKit dans les cinq bancs de la famille A (le sortir de `parcours-4` vers `harness/` servirait les sept), et mettre
à jour les attentes de la famille D une fois les deux questions tranchées.

## 5. Les 18 verts au second essai

Rouges au premier essai, verts à la reprise, dans le passage complet : `comptes-erreurs-stock-1142` (2),
`copie-demo-bibliotheque-31-oct`, `erreurs-palette-codes-fermee`, `evaluer-868-avec-ou-sans-copie`,
`lot-i-bis-la-case-ouvre-un-codex` (4), `palette-evaluation-compacte` (2), `palette-retroaction-compacte`,
`parcours-1-et-2-2026-11-08` (panneau), `parcours-5-monter-ton-cours` (capture 25), `parcours-5-nous-faisons`
(820 × 1180), `parcours-7-lire-ta-classe` (neuf étapes, sombre), `parcours-fleches-2026-11-10` (zoom au pincement),
`presences-lot-d-enregistrement` (b)(a), `tampons-masques-bibliotheque-1216`, `texte-troue-badges-dans-la-phrase`,
`texte-troue-reperes-enonces`. La liste exacte est dans le jeton (`instables`). Non rejoués seuls : le mandat ne le
demandait que pour les rouges.

## 6. Ce qui n'a pas pu être jugé, et les écarts de la session

- **Les gestes de la famille A** sous WebKit (§ 3, A) : le banc ne peut pas ranger une copie.
- **Safari réel et l'iPad** : le banc est le WebKit de Playwright sur le Mac, en `file://`. Rien ici ne dit ce que fait
  la page servie par `app.codexnumeris.org`.
- **La cause de trois rouges** (§ 3, E) et celle de `profil-942`.
- **Le demi-morceau 8b** (11 fichiers, 562 s) dépasse le chien de garde de 8 minutes de l'outil de verdict : il a été
  tué cinq fois avant d'être joué en quatre parts (8b1 à 8b4), toutes reçues. **Écart de ma part** : quatre de ces
  cinq relances étaient identiques et inutiles (32 min perdues) ; le 6a a aussi été tué une fois, puis rejoué entier.
  Aucun essai n'a été sauté : `nonJouees` vaut 0 au jugement.
- **L'outil** : une copie de l'outil hors dépôt (`~/Library/Caches/labo-codex-verdict-1.258/`), pointée sur cet arbre,
  avec le jeu par quarts ajouté. Les rejeux et la sonde ont leur propre config hors dépôt (sans reprise, sans trace,
  capture à l'échec). Rien du dépôt n'a été modifié pour jouer.
- **Les captures des lots A et B du rejeu** avaient été écrasées par le lot suivant : ces deux lots ont été rejoués une
  seconde fois pour les captures seulement (mêmes 18 rouges).
- **La PR n° 56** : GitHub la donne déjà à l'état « fusionnée » (`MERGED`, encore marquée brouillon). Une PR fusionnée
  ne se ferme pas : rien fait, aucun commentaire posté.
- `tests/node_modules` de cet arbre est un lien vers celui du dossier principal (lecture seule, comme les autres
  arbres ; `package-lock.json` identique).

## 7. Ce que seul l'iPad peut juger

Le verdict n'est pas vert ; la liste est donnée quand même, pour l'écran d'observation et la vue simple, que le banc a
trouvés verts à la souris.

**Écran d'observation (parcours 9 et hors parcours)**
- toucher une case de la grille d'observation : la cible est-elle assez grande au doigt, sans toucher la voisine ;
- la fenêtre « Inscrire un niveau » : le clavier à l'écran monte-t-il quand « Remplir » pose un texte, et cache-t-il
  le bouton d'enregistrement ;
- la bulle du parcours 9 par-dessus l'écran et par-dessus la fenêtre, iPad couché puis debout : couvre-t-elle un
  bouton à toucher ; se déplace-t-elle au doigt par sa poignée ;
- le défilement au doigt du tableau des cibles, dans les deux sens, la bulle affichée.

**Vue simple**
- la porte d'entrée : toucher chaque choix, sans double toucher ni survol resté collé ;
- les critères : cocher, décocher, faire défiler la liste au doigt sans cocher par accident ;
- saisir dans un champ : le clavier à l'écran ne cache pas le champ, et la page revient à sa place quand il se ferme ;
- passer de la vue simple à la vue étendue et revenir, iPad couché puis debout.

**À ajouter, vu ce verdict**
- importer une copie (une photo) dans le vrai Safari et sur l'iPad : c'est le geste que le banc ne juge pas (famille A) ;
- parcours 2 étape 1, parcours 4 étape 2, parcours 6 étape 3 : la bulle couvre-t-elle ce qu'elle demande de toucher ;
- après une mise à jour : le bandeau orange couvre-t-il le menu.
