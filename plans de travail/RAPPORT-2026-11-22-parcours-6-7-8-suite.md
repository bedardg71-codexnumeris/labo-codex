# RAPPORT — la suite des parcours 6, 7 et 8 (session du cloud, 22 nov. 2026, après 15 h)

> Consigne : `plans de travail/CONSIGNE-2026-11-22-parcours-6-7-8-suite.md` (copiée telle quelle, premier commit `3aa7abcf4`).
> Branche `claude/relaxed-feynman-0vcwct`, PR n° 54 en brouillon « APERÇU, ne pas fusionner ».
> **Aperçu (Deploy Preview)** : https://deploy-preview-54--codexnumeris-051225.netlify.app
> Ni fusion dans `main`, ni release, ni bump, ni changelog. Aucun nom réel (les élèves de l'exemple sont fictifs).

Les neuf points sont faits, dans l'ordre demandé. Ce qui suit distingue ce qui est **mesuré** (au banc, dans un vrai
Chromium contre le vrai `index.html`), **lu dans le code**, **supposé** ou **décidé par la session**, et **non vérifié**.

## 0. La base

`origin/main` est resté à `d0dd74205` : rien à réunir. Commits de ce lot, après la consigne :

| Commit | Points |
|---|---|
| `fe0ba015f` | 1 (parcours 7, « Je regarde » : six phrases, le refus, 1.8) |
| `a729b4e30` | 2 (BACKLOG #1304, M6 à l'écran) |
| `002e27f0b` | 3 et 4 (l'échelle de départ ; la phrase « Par standards » du parcours 4) |
| `54c0420bc` | 5, 6 et 7 (le banc du « Nous faisons » du parcours 8 ; les « Je regarde » des parcours 8 et 6) |
| (ce commit) | 9 (ce rapport, la porte terrain) |

Jetons anticache : `parcours-moteur.js`, `parcours-commentaires.js` et `parcours-donnees.js` à `20261122v` ; les autres
fichiers touchés l'avaient été plus tôt dans la journée (`20261122u`).

## 1. Parcours 7, « Je regarde » (1.1 à 1.8) : FAIT

Les six phrases et le refus 1.7, mot pour mot. La sentinelle lit les retouches dans la consigne de la suite et les
applique aux bulles de la précédente ; chaque retouche doit trouver sa ligne.

**1.8, ce que le banc juge à l'écran (mesuré, aux deux tailles)** : avant l'évaluation, le point de Tapir Doux est gris
(`barre-etudiant-sans-eval`) et à moins de 5 % du bord gauche de la bande ; après « Remplir », c'est le plus bas des
points évalués ; la carte RàI dit « Niveau 2 - Préventif » et « Défi principal : Nuance » ; la fiche propose le niveau 2
et coche les quatre critères.

**Pourquoi « Nuance » (mesuré, rien changé)** : Tapir Doux a trois critères à égalité (Rigueur, Plausibilité, Nuance, à
I). `diagnostiquerForcesChallenges` trie par score, puis par la pondération la plus forte **dans la grille de
dépistage** : Nuance 25, Rigueur 20, Plausibilité 15. La carte nomme donc celui qui pèse le plus, pas le premier de la
grille.

## 2. Parcours 7, « Nous faisons », bulle 8 : M6 à l'écran : FAIT, et la promesse est fausse

Mesuré dans la démo (Yack Amical, absent à la séance saisie du 22 août, A = 0 %), case cochée, intervention complétée :
datée du jour de la séance, la présence n'est **pas ajoutée** (le report refuse d'écrire là où une fiche existe) ; datée
d'un autre jour, une présence facultative est ajoutée, mais ce jour n'est pas une séance saisie : elle n'entre pas dans
l'assiduité. **A reste à 0 % dans les deux cas.** Inscrit au BACKLOG : **#1304**. Ni la case ni la bulle n'ont été
touchées.

## 3. L'échelle de départ (IDME) : FAIT

- 3.1 : « I » dit « Préstructurel, unistructurel », dans l'échelle semée et dans la rangée « I » de la carte d'aide.
  **`niveauSOLO` de « I » : GARDÉ** (`unistructurel`). Lu dans le code : l'interprétation SOLO du profil le lit
  (`interpreterNiveauAtteint`, par la résolution d'échelle de `profil-etudiant-calculs.js`) et l'export au format
  recherche le porte (`import-export.js`). Le retirer changerait un affichage hors de la description ; le garder ne
  change aucun calcul. Une échelle déjà semée n'est pas réécrite.
- 3.2 : la phrase qui présente le tableau, mot pour mot.

## 4. Parcours 4, la phrase « Par standards » : FAIT

À la première bulle des deux temps, après la phrase des données. Le banc du « Nous faisons » de « Recevoir » attendait
l'ancienne bulle : la ligne y est ajoutée, rien d'autre. Rien d'autre n'a changé dans ce parcours.

## 5. Parcours 8, « Nous faisons » : le banc rouge : FAIT

Trois causes, mesurées une à une, réglées dans le moteur, **sans changer un mot** :

1. **1180 × 820, bulle 1** : haute de 745 px, elle ne tenait nulle part sans couvrir la rangée du menu, et couvrait
   « + Nouvelle grille ». Option `serrer` : l'étape qui la déclare, quand aucune place ne laisse libre ce qu'elle évite,
   limite la bulle à la bande libre la plus haute (au-dessus ou au-dessous de ce qu'il faut toucher) et y cherche sa
   place comme d'habitude ; son texte y défile.
2. **820 × 1180, bulle 8** : la colonne « Actions » de la Liste débordait à droite (814 à 964 px, dans un tableau qui
   défile de côté) ; sur une bulle qui dit le lieu, le moteur ne faisait pas défiler : la pulsation restait cachée.
   Le tableau défile maintenant **de côté seulement** ; la page ne bouge pas.
3. **820 × 1180, palette « Codes »** : la bulle collait la palette et couvrait 5 px du halo de la pulsation. La bulle
   évite maintenant le halo (5 px) autour de ce qu'il faut toucher.

La carte du panneau a désormais deux temps : « Nous faisons » reprend (son bouton garde son nom, l'état dit l'étape),
comme au parcours 7 ; le banc suit.

## 6. Parcours 8, « Je regarde » : FAIT

Huit bulles mot pour mot (§ 4.1), « [nombre] » remplacé par 300 comme la suite le cite. Dans la démo, sur le deuxième
groupe, après les modèles des parcours 2, 3 et 4.

**Ce qui fait avancer chaque bulle** : 1, le critère ajouté devient algorithmique (son atelier s'ouvre) ; 2, l'étape
« Ce que tu relèves et comptes » réglée ; 3, 4 et 5, « Continuer » (la bulle 5 a deux formes) ; 6, le mode « Évaluer »
ouvert sur la copie d'Antilope Vaillante ; 7, son évaluation verrouillée ; 8, les trois boutons de la fin.

**Ce que « Remplir » pose (mesuré au banc)** : bulle 1, le nom « Français écrit » ; bulle 2, « erreur », « erreurs »,
« mot », « mots » ; bulle 4, les pondérations 20 % (« Français écrit »), 16, 24, 12, 28 ; bulle 5, la limite de 30 erreurs
pour 900 mots ; bulle 7, Structure M, Rigueur M, Plausibilité E, Nuance M. La personne écrit elle-même les 300 mots et
pose les six codes (le banc : trois fois le 1, deux fois le 4, une fois le 10).

- **Bulle 2, mesuré** : pour un critère nommé « Français écrit », l'application ne préremplit **aucune** des quatre
  formes (les quatre champs sont vides). Le « Remplir » reste.
- **La grille** : ajout direct, comme décidé. **Mesuré** : les huit évaluations déjà posées sur la grille gardent leur
  note et leur niveau.
- **Le confinement (mesuré)** : le contexte du modèle reste en mémoire ; aucune clé hors de la démo ne change, à une
  exception près, qui n'est pas le code du parcours (trouvaille A, § 10).
- **« Refaire »** retire le cinquième critère (les quatre autres retrouvent 20, 30, 15, 35), les codes et l'évaluation
  d'Antilope Vaillante ; les huit autres évaluations et la copie de Tapir Doux restent. Il referme aussi la fiche de la
  grille restée ouverte (sinon les bulles 1 et 2 se croyaient faites : mesuré).
- **DÉCIDÉ par la session** : le modèle ne reprend pas au milieu. Un passage interrompu (« Plus tard ») repart de la
  bulle 1, après avoir retiré de la démo ce que ce modèle y avait posé ; sinon un second « Français écrit »
  s'ajouterait. Fini, il repart de sa dernière bulle.
- **Corrigé en chemin (issue 1 : ça cassait le parcours livré)** : le modèle de « Recevoir » laisse la visionneuse en
  mode « Évaluer » sur la copie de Loutre Enjouée (même production) ; la bulle 6 se croyait dans l'évaluation et
  n'allait pas à la Liste. Le parcours 8 exige maintenant que la page d'annotation soit visible (`evaluationOuverte`).

**Le refus PROPOSÉ** (sans le « Je regarde » de « Recevoir », le panneau le dit et la pulsation va à ce modèle) :

> « Commence par le « Je regarde » de « Recevoir les productions, rendre tes rétroactions » : c'est là qu'on importe la
> production d'Antilope Vaillante, que ce parcours évalue. »

**« 20 % » de la bulle 4** : écrit avec l'espace insécable devant « % », la règle des nombres à la française du projet
(sa sentinelle l'exige). Aucun mot ne change ; la sentinelle des textes compare après l'avoir ramenée à une espace.

### Les mots qui ne tiennent pas à l'écran (codés tels quels, mesurés)

1. **Bulle 6** : « Cette grille est celle de la production « Artefact 1 ». » La Liste nomme la production par son nom :
   « Appliquer des stratégies de lecture variées (Deux-Rives) - Appliquer des stratégies de lecture variées
   (Deux-Rives) ». « Artefact 1 » n'apparaît nulle part sur la ligne (le modèle d'« Évaluer » donne ce nom-là à la
   production ; « Artefact » est son type).
2. **Bulle 5** : « La première donne le compte : « Ta production contient… ». » La rétroaction écrite pour Antilope
   Vaillante dit : « **Ta rédaction contient 6 erreurs de français pour 300 mots.** Tu fais en moyenne 1 erreur à chaque
   50 mots. Ce rapport est risqué : il approche de la limite. […] » L'atelier, à l'étape « Ce que l'étudiant·e lit »,
   règle « Modèle des phrases : Français écrit », qui parle du français écrit (« erreurs de français »).
3. Le reste se vérifie à l'écran : « Ses quatre critères s'évaluent par niveaux » ; « 6 erreurs » dans la palette avant
   les 300 mots ; la phrase du compte et celle du palier sous « Français écrit » ; les codes 1, 4 et 10 avec leur
   observation dans la vue « Spécifique ».

## 7. Parcours 6, « Je regarde » : FAIT

La visite du menu « Codex », cinq bulles mot pour mot (§ 5). Le « Nous faisons » ne change pas.

- **Ce qui fait avancer** : bulle 1, le menu ouvert par « Codex » (le seul geste, avec sa pulsation) ; bulles 2 à 4,
  « Continuer » ; bulle 5, les trois boutons de la fin.
- **Rien ne répond dans le menu (mesuré)** : « Mettre à jour le codex », « Mettre à jour dans un autre fichier… »,
  « Ouvrir un codex… », « Nouveau codex » et, à 820 × 1180 (un codex existe), le renommage par le nom en haut du menu.
  La garde du « Nous faisons » (« Ouvrir un codex… ») est étendue, pour la visite, au menu entier. Aucune action du
  codex n'est atteinte, aucun fichier ne s'écrit, aucun aperçu ne s'ouvre.
- **Le menu reste ouvert des bulles 2 à 5 (mesuré)**, quand on touche la bulle, sa poignée, « Continuer », ou un
  article du menu.
- **Les flèches (mesuré)** : bulles 2 et 3 à « Mettre à jour le codex », 4 au haut du menu, 5 à « Ouvrir un codex… » ;
  aucune pulsation.
- **« Même dans la démo » (bulle 4, mesuré)** : sans codex, le haut du menu dit « Pas encore de codex : « Mettre à
  jour le codex » en crée un avec tes données. » ; avec un codex écrit avant la visite, il dit son nom, « Ton codex est
  à jour » et le dernier fichier ; la pastille paraît à côté de « Codex ». La phrase tient.
- **Le rappel (bulle 4, lu dans le code)** : 14 jours par défaut, 7 ou 30 au choix (`modal-backup-reminder.js`). La
  phrase tient.
- « Refaire » relance la visite sans rien remettre à neuf (elle ne pose rien).

**Les mots qui ne tiennent pas à l'écran** : en **vue simple**, le bouton de l'en-tête s'appelle « Sauvegarder », pas
« Codex » (mesuré), et son menu s'ouvre sur une autre phrase (lu dans le code, `vue-simple.js`). Mesuré aussi
(Chromium) : en vue simple, le banc n'a pas pu toucher l'entrée « Assistance » du menu de l'en-tête (le clic n'a pas
abouti en 120 s ; la raison n'est pas établie). Si les parcours ne s'y lancent pas, la bulle 1 tient partout où ils se
lancent. Le « Nous faisons » est dans le même cas.

## 8. Tests

- **Vitest complet** : 952 fichiers, 12 317 tests, tous verts (après le dernier changement de code).
- **Sentinelles** : parcours 7 (la suite, 1.1 à 1.7), parcours 8 (§ 4.1, « [nombre] » → 300, le refus dans le moule
  de 1.7, ce que « Remplir » pose lu dans la consigne), parcours 6 (§ 5, neuve), parcours 4 (la phrase). Toutes lisent
  la consigne elle-même, dans les deux sens. Le découpeur de la consigne prenait « (des erreurs) », au milieu d'une
  ligne, pour une note : seule une parenthèse qui finit la ligne en est une.
- **Bancs neufs, Chromium, aux deux tailles** : `je-regarde-commentaires-2026-11-22` (A, le refus ; B, les huit bulles,
  le confinement, « Refaire ») et `je-regarde-donnees-2026-11-22` (sans codex à 1180 × 820, avec un codex à 820 × 1180).
- **Break-tests (22 nov.), chacun rougit puis le code est rétabli à l'identique (`cmp`)** :

| Rupture | Ce qui rougit |
|---|---|
| Parcours 6 : la garde du menu retirée | « bulle 2 : aucune action du codex atteinte » |
| Parcours 6 : le menu n'est plus rouvert | « bulle 2 : le menu reste ouvert, la bulle touchée » |
| Parcours 6 : un mot de la bulle 3 | la sentinelle, bulle 3 |
| Parcours 8 : le contexte du modèle écrit dans la préférence réelle | « aucune autre clé hors de la démo ne change » |
| Parcours 8 : « Refaire » ne retire plus le critère | les critères de la grille après « Refaire » |
| Parcours 8 : un mot de la bulle 8 ; le refus hors du moule | la sentinelle, bulle 8 ; le refus |

- **La batterie des parcours** (34 fichiers, 190 tests : tous les parcours, les deux temps, le moteur, le panneau) :
  aucun rouge propre à ce lot ; 17 rouges de la base, marqués au § 8 bis.

## 8 bis. La batterie des parcours, et les rouges de la base

**La batterie** : les 34 fichiers de bancs des parcours, du moteur et du panneau (190 tests), sous Chromium.

**Premier passage** (après `54c0420bc`) : 150 verts, 21 rouges, 19 sautés. Les 10 fichiers rouges ont été rejoués sur
**l'arbre de la base** (`ec5f31167`, le point de départ de cette consigne) : **17 des 21 rouges y sont déjà**, avec les
mêmes erreurs. Ce sont les **rouges de la base**, non touchés :

| Fichier (base `ec5f31167`) | Rouges | Erreur |
|---|---|---|
| `bulle-sur-telephone-2026-11-09` | 1 | 390 px : la bulle repliée n'est pas à 8 / 382 |
| `bulles-au-doigt-540` | 3 | le toucher ne saisit aucune bulle du graphique (Chromium) |
| `parcours-1-et-2-2026-11-08` | 1 | une largeur à 430,00006 au lieu de 430 |
| `parcours-2-ma-classe-2026-11-09` | 3 | la bulle couvre la session du trimestre ; le compte des flèches ; une flèche didactique |
| `parcours-4-recevoir-et-rendre-2026-11-09` | 2 | la bulle couvre « Importer », puis les colonnes à 820 px (déjà notés au rapport précédent) |
| `parcours-6-donnees-a-l-abri-2026-11-09` | 5 | la bulle 3 hors de la fenêtre, à droite de l'aperçu |
| `pied-de-page-et-assistance-2026-11-10` | 2 | la version et « Nouveautés » pas sur la même ligne à 820 px |

**Les 4 autres venaient de ce lot**, et sont réglés :

- `nous-faisons-donnees` (2) : l'entrée de la bulle 1 nomme maintenant le temps (« … · Nous faisons »), la carte du
  parcours 6 ayant deux temps ; le banc suit (comme aux parcours 2, 7 et 8).
- `parcours-je-regarde-2026-11-16`, « Découvrir » (1) : un triangle saisi en pleine rotation ; vert rejoué seul (la
  batterie avait démarré pendant le Vitest du pré-envoi). **Supposé** : un minutage sous charge.
- `je-regarde-recevoir`, B (1, puis 2 rejoué seul) : « Importe-les » couvrait 1 % de plus que le minimum du relevé.
  Cause : le moteur évite désormais le halo de la pulsation, le relevé de la bulle (`harness/releve-bulle.js`) ne le
  comptait pas. Le moteur expose son halo (`placement().halo`) et le relevé l'applique au contour : 4 sur 4.

**Second passage** (avec le relevé corrigé, la batterie entière) : **152 verts, 19 rouges, 19 sautés**. Les 17 rouges
de la base, et deux de `parcours-fleches-2026-11-10`, verts au premier passage :

- « la poignée : 46 px… » : la bulle glissée de 10 px de moins que le geste. **Instable sur la base aussi** (rejoué deux
  fois sur chaque arbre : 1 rouge sur 4 sur `ec5f31167`, 4 verts sur 4 sur cette branche).
- « sous le zoom au pincement… » : vert rejoué seul (8 sur 9 du fichier, la poignée exceptée).

**Bilan** : aucun rouge propre à ce lot. Les bancs neufs (`je-regarde-commentaires`, `je-regarde-donnees`) et ceux des
parcours 4, 7 et 8 (les deux temps), du panneau et de la fin des parcours sont verts dans les deux passages.

## 9. Ce qui n'est pas vérifié

- **Safari et l'iPad** : WebKit n'existe pas dans le conteneur ; le toucher, l'iPad couché et debout, le défilement de
  côté de la Liste au doigt. C'est l'objet de la porte terrain.
- Le parcours 6 en vue simple, au-delà de ce qui est dit au § 7.
- La note du critère « Français écrit » calculée « aussitôt » (bulle 7) : le banc lit le compte, la phrase du compte et
  le verrou, pas l'instant du calcul.

## 10. Trouvailles, et leur issue

- **A. `dernieresSelectionsEvaluation` écrite hors de la démo** (parcours 8, « Je regarde ») : quitter la démo pendant
  que le mode « Évaluer » est ouvert (la fin du modèle le laisse ouvert sur la copie verrouillée) fait écrire à
  l'application, hors de la démo, la clé globale des dernières sélections d'évaluation (`sauvegarderSelectionsEvaluation`,
  `js/travaux-ui.js`), avec la production et la grille de la démo. Ce n'est pas le code du parcours. **Issue 3**
  (commentée dans le banc, tolérée par son nom et à condition de ne porter que la production de l'exemple) : aucune
  conséquence observée ; non mesuré, ce que ces identifiants feraient au prochain formulaire d'évaluation réel.
- **B. La visionneuse garde son mode hors de la page** (parcours 8) : **issue 1**, corrigée dans le parcours (§ 6).
- **C. En vue simple, le banc n'a pas pu toucher « Assistance » dans le menu de l'en-tête** (§ 7) : hors de ce lot,
  peut-être voulu, raison non établie. **Issue 3**, rapportée ici.
