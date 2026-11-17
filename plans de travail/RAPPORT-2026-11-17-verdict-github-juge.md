# Rapport — lot « Le verdict de GitHub peut juger » (fiche 37)

**Dernier relais (17 nov. 2026, 02 h 20 UTC ; 16 nov. vers 21 h 20 à Québec).** Branche `lot/verdict-github-juge`, partie de `origin/main` (`e5ad10f90`), poussée, **non fusionnée**, sans PR, sans release, rien au changelog. Les dates de ce rapport et de la liste Linux sont celles de GitHub (UTC) : « 17 nov. » y désigne la soirée du 16 à Québec.

- **Fait** : deux passages de `main` sur le même commit ; classement sur quatre passages ; liste Linux retouchée, chaque geste daté ; #1115 ; #1116 mesuré ; `en-tete-epure` tranché ; documents.
- **La preuve n'est PAS faite** : sur le même commit `1a21eaed5`, le verdict est **vert** (run 43993803396) puis **rouge** (run 43997218400, 5 intermittents neufs). Je m'arrête là : voir « Pourquoi je m'arrête ».
- **État poussé non jugé** : les 5 essais du second verdict ont été versés à la liste après coup ; aucun passage n'a jugé cet état.
- **Rien n'est inscrit au BACKLOG** : #1285 n'est pas pris, l'en-tête du BACKLOG n'est pas touché.
- **Reste à décider (Cowork)** : fusionner `lot/verdict-nuage` (PR n° 25) et ce lot se recoupent largement ; voir « Recoupement ».

## Le relais de Cowork, recopié

> Pour une session de Claude Code DANS LE CLOUD (pas la session du Mac). Relais de Cowork, 16 nov. 2026, 19 h 05, envoyé par Grégoire. Si tu es la session du Mac, ne l'exécute pas : dis-le.
>
> LOT « Le verdict de GitHub peut juger » : la fiche 37 de « plans de travail/FILE-DES-CORRECTIFS.md », avec #1246 et #1256 qu'elle absorbe, #1115 et #1116.
>
> POURQUOI
> Le job « Playwright — verdict » de GitHub est rouge à chaque passage de main depuis au moins le 29 oct. (24ca0dde7) : sa liste de référence sous Linux (scripts/playwright-baseline-linux.json) est périmée dans les deux sens. Tant qu'il ne juge pas, chaque mise en ligne coûte environ deux heures du Mac de Grégoire. Grégoire a décidé le 14 nov. que GitHub jugera ; ce lot rend cette décision tenable.
>
> RÈGLES
> - Ta branche : lot/verdict-github-juge, partie de origin/main (e5ad10f90 ou plus récent). Jamais main. Ni fusion, ni release, ni PR, rien au changelog.
> - Tu ne touches à AUCUN fichier de l'application (js/, css/, styles.css, index.html), ni aux zones protégées de CLAUDE.md.
> - Tu ne touches ni au moteur des parcours ni aux specs des parcours ni à leurs textes : lot/deux-temps-modeles (448283ee8) les réécrit en ce moment. Tu peux lire leurs résultats et les classer, pas les modifier.
> - Le juge de ce lot est GitHub (WebKit sous Linux), pas le Chromium de ta machine.
> - Une chose à la fois ; rien en arrière-plan à la fin d'un tour.
>
> ÉTAPES
> 0. Lis la fiche 37 en entier (ses mesures du 16 nov. : runs 43942432518 sur bfa3402d3 et 43853967604 sur 5735b41e3), scripts/juger-rapport-playwright.mjs, scripts/playwright-baseline-linux.json, et l'en-tête de .github/workflows/tests.yml. Lis aussi ce que origin/lot/verdict-nuage (ab557ac0e, PR n° 25) change dans ces mêmes fichiers : dis dans ton rapport ce qui se recoupe avec ton lot. Ne fusionne pas cette branche.
> 1. Lance deux passages du MÊME commit de main : « gh workflow run tests.yml --ref main », deux fois. Si le droit te manque, arrête-toi ici et dis-le en une ligne : Grégoire les lancera lui-même et te donnera les deux numéros de run. Ne contourne pas.
> 2. Avec ces deux passages et les deux du 16 nov., classe chaque essai rouge absent de la liste Linux : rouge aux quatre passages, ou variable. Classe de même les essais de la liste redevenus verts aux quatre. Donne le tableau dans ton rapport.
> 3. Tranche d'abord en-tete-epure-2026-11-07 › « une rangée d'onglets qui déborde au bureau défile, avec un fondu au bord » : seul rouge propre à bfa3402d3 sur une spec que lot/menu-demo a modifiée. Établis si ce lot y est pour quelque chose. Si c'est un défaut de l'écran, ne le corrige pas : inscris-le et dis-le.
> 4. Retouche scripts/playwright-baseline-linux.json à la main, avec une note datée par geste : retire les essais verts aux quatre passages ; passe aux intermittentes ceux qui varient ; pour chaque rouge stable, dis si c'est le banc qui est faux sous Linux (il entre aux connus, avec sa raison) ou un défaut réel (il s'inscrit au BACKLOG et tu le nommes ; ne le masque pas sans le dire). Les bancs de parcours (parcours-2, parcours-4, parcours-7, parcours-9, bulle-largeur-ipad) vont aux intermittentes avec la note « à revoir au retour des parcours », sans toucher à leurs specs.
> 5. #1115 : tests/integration/planif-menu-vue.spec.js attend ⌘ (vers les lignes 447 et 574). Fais lire la plateforme à l'essai, puis retire ses deux entrées de la liste Linux une fois vertes. C'est un essai, pas l'application.
> 6. #1116 : mesure si les neuf essais d'« Apporter mon matériel » rougissent encore sous Linux sur les quatre passages. Dis-le ; ne corrige rien dans l'application.
> 7. La preuve : pousse ta branche, puis lance le verdict dessus deux fois (« gh workflow run tests.yml --ref lot/verdict-github-juge »). Attendu : le job « Playwright — verdict » vert deux fois de suite. S'il ne l'est pas, dis exactement ce qui reste rouge et pourquoi tu t'arrêtes là.
> 8. Documents : dans FILE-DES-CORRECTIFS.md, passe la fiche 37 à « Fait » avec ce qui reste ouvert, ou laisse-la « À faire » avec l'étape atteinte. Dans BACKLOG.md, ajoute à #1246 et #1256 une ligne datée qui renvoie à la fiche 37 ; coche-les seulement si ta mesure le justifie ; coche #1115 si l'essai est vert. Si tu inscris une fiche, prends #1285 (#1284 est pris sur lot/deux-temps-modeles, pas encore sur main) et dis-le dans l'en-tête du BACKLOG.
> 9. Avant le push : « cd tests && npm ci --ignore-scripts && npx vitest run » (des sentinelles lisent tests.yml et les listes). Si le hook refuse le push pour une raison hors de ce mandat, ne contourne pas : dis-le.
>
> DÉCIDÉ PAR COWORK (ne le redemande pas à Grégoire)
> - Ce lot se fait dans le cloud, parce qu'il tourne sur GitHub et que le Mac est pris.
> - La branche part de main, pas de lot/verdict-nuage.
> - Un banc de parcours rouge se met de côté, il ne se corrige pas ici.
> - Le Mac reste le juge du push jusqu'à ce que Grégoire dise autrement : ne change ni le hook ni PROTOCOLE.md.
>
> CE QUI REMONTE À GRÉGOIRE
> Rien, sauf le droit de lancer les passages s'il te manque.
>
> RAPPORT
> « plans de travail/RAPPORT-<date du jour>-verdict-github-juge.md » sur ta branche, ce relais recopié en tête. Sépare ce qui est mesuré, ce qui est inféré, ce qui n'est pas vérifié. Donne les numéros de run, le tableau de l'étape 2, le diff de la liste Linux résumé en nombres (retirés, passés aux intermittentes, ajoutés aux connus), et le verdict des deux passages de l'étape 7.

**Correction de l'étape 1 (Cowork, 19 h 15)** : la concurrence de `tests.yml` (`tests-<ref>-<événement>`, `cancel-in-progress`) fait qu'un passage lancé à la main sur `main` annule le précédent. Grégoire a lancé Tests 198 à 202 depuis son iPad ; seul le 202 est allé au bout et sert de premier passage. Le second se lance quand le premier est fini ; même règle à l'étape 7.

**Information versée par Grégoire pendant le lot** (non mesurée ici) : le 16 nov. à 18 h 58, WindowServer a planté sur le Mac pendant une capture demandée par Playwright. Versée à la fiche 37.

## Les passages

| Rôle | Run | Tests n° | Commit | Joués | Rouges | Au second essai | Verdict |
|---|---|---|---|---|---|---|---|
| 16 nov., `main` | 43853967604 | – | `5735b41e3` | 1 686 | 36 | 10 | rouge, 16 hors liste |
| 16 nov., `main` | 43942432518 | – | `bfa3402d3` | 1 690 | 33 | 7 | rouge, 14 hors liste |
| Étape 1, `main` | 43985499691 | 202 | `e5ad10f90` | 1 690 | 38 | 12 | rouge, 15 hors liste |
| Étape 1, `main` | 43989702254 | 203 | `e5ad10f90` | 1 690 | 32 | 8 | rouge, 13 hors liste |
| Étape 7, branche | 43993803396 | 206 | `1a21eaed5` | 1 690 | 30 | 10 | **vert** |
| Étape 7, branche | 43997218400 | 207 | `1a21eaed5` | 1 690 | 39 | 9 | **rouge, 5 hors liste** |

Annulés, non lus : 43984694768 (le mien, Tests 198), 43985146747, 43985159890, 43985470875. Le droit de lancer ne manquait pas : les lancements sont passés par l'outil GitHub de la session (la commande `gh` n'y a pas de jeton valide).

## Mesuré

**Méthode.** Le résultat de chaque essai est lu dans les journaux des 20 morceaux de chaque passage (reporter `list`), dernier résultat retenu, identité « fichier › blocs › titre ». Sur les six passages, le lecteur rend exactement les comptes du job verdict (joués, verts, au second essai, rouges, sautés). Les numéros de « hors liste » ci-dessus sont ceux du juge.

**Étape 3, `en-tete-epure-2026-11-07` › « une rangée d'onglets qui déborde… ».** Signature sur six passages : vert, rouge, rouge, rouge, vert, vert.
- Mesuré : le commit de `lot/menu-demo` (`7ccb5ff`) n'a changé dans cette spec que l'essai qui énumère le menu ; il n'a touché ni cet essai ni `js/chrome-unifie.js`, qui pose le fondu.
- Mesuré (par `lot/verdict-nuage`, repris de sa liste) : la même erreur, `expect(d.fondu).not.toBeNull()` reçu `null`, était déjà rouge 2 fois sur 7 du 10 au 14 nov., avant `lot/menu-demo`.
- **Conclusion : `lot/menu-demo` n'y est pour rien.**
- Inféré, non démontré : c'est le banc. L'essai rétrécit la fenêtre et lit `data-fondu` aussitôt, sans attendre ; l'écran pose l'attribut par un `ResizeObserver`, donc un instant plus tard. Je n'ai pas reproduit la course (pas de WebKit sur cette machine). Classé aux intermittentes ; l'essai n'est pas corrigé (un `expect.poll` suffirait probablement : trouvaille de niveau 2, non inscrite faute de symptôme vécu).

**Étape 5, #1115.** Les deux essais lisent la plateforme comme la carte (`claviersMac`) : ⌘ sur un Mac, Ctrl ailleurs, et l'absence de l'autre. Verts sous WebKit Linux aux deux verdicts de la branche. Retirés de la liste. Les titres des essais sont gardés tels quels (ils disent encore « sur un Mac ») pour ne pas changer leur identité ni heurter la PR n° 25.

**Étape 6, #1116.** Sur les quatre passages de `main`, des neuf essais nommés par la fiche : sept verts aux quatre (2a « C1 » et « l'exemple étiqueté », 2b × 2, 5, 7, 12) ; deux varient encore : `materiel-aide-accompagnement` (rouge, rouge, vert au second essai, vert au second essai) et 2a « C3 » (rouge, vert, rouge, vert). Rien de corrigé. #1116 reste ouverte pour ces deux.

**Le diff de la liste Linux, en nombres.**

| Geste | Connus | Intermittentes |
|---|---|---|
| Avant (`main`) | 35 | 30 |
| Retirés, verts aux quatre | −10 | −26 |
| Retirés, #1115 | −2 | |
| Passés des connus aux intermittentes | −11 | +11 |
| Ajoutés, hors liste variables (dont 8 bancs de parcours) | | +18 |
| Ajoutés, bancs de parcours rouges aux quatre (mis de côté) | | +5 |
| Ajoutés aux connus, avec leur raison | +2 | |
| **État jugé à l'étape 7 (`1a21eaed5`)** | **14** | **38** |
| Après le second verdict : 5 rouges neufs | | +5 |
| Après le second verdict : « la bulle » de la palette, jouée verte | −1 | +1 |
| **État poussé, non jugé** | **13** | **44** |

Au total : 38 retirés, 12 passés aux intermittentes, 2 ajoutés aux connus (dont 1 reparti aux intermittentes), 28 ajoutés aux intermittentes.

**Rouges stables : banc ou défaut réel ?**
- `tableau-de-notation-1` › « standards : un bord estompé… » : rouge aux six passages, `noteFixee: 2` reçu pour 1 attendu. Entré aux connus comme banc faux sous Linux (géométrie du rendu), parce qu'il est vert sous le WebKit du Mac. **Non démontré** que l'écart soit sans effet visible sous Linux.
- `palette-evaluation-compacte` › « la bulle : toucher un nom… » : rouge cinq fois, verte la sixième. Intermittente.
- Les cinq bancs de parcours rouges aux six passages (parcours-2 × 3, parcours-7, parcours-9 « étape 3 ») : mis aux intermittentes sur décision de Cowork. **Ils ne varient pas** : la liste les met de côté, elle ne les explique pas. Je n'ai pas cherché s'ils cachent un défaut réel.
- Les 13 connus restants sont rouges aux six passages (familles codex, #892, #895, #929, #1224, etc.) : inchangés, non relus.
- **Aucun défaut réel n'est établi, donc aucune fiche inscrite.** Ce n'est pas la preuve qu'il n'y en a pas.

**Étape 7, ce qui reste rouge exactement (run 43997218400).** Cinq essais hors liste, signature sur les six passages :

| Signature | Essai |
|---|---|
| `VVFVVR` | `aide-cp-suit-la-case-1086` › une seule aide « C et P » visible |
| `VVFFVR` | `annotation-formes-fermees-polygone` › Le polygone › sélection sur son tracé, déplacement, duplication et suppression |
| `FVVVVR` | `bulle-largeur-ipad-2026-11-12` › L1 · 1180 × 820 · mouse |
| `VVVVVR` | `bulle-largeur-ipad-2026-11-12` › L1 · 1180 × 820 · touch |
| `VVVVVR` | `parcours-3-evaluer-2026-11-09` › grille en points : la bulle du choix |

Trois des cinq n'avaient jamais rougi mais avaient déjà passé au second essai : j'avais choisi de ne pas verser à la liste les essais « seulement verts au second essai » (17 sur les quatre passages). Ce choix a coûté au moins trois de ces cinq rouges. Je le maintiens (voir plus bas), mais il se discute.

## Pourquoi je m'arrête

Sur six passages, **40 essais ont rougi au moins une fois sans rougir toujours**, et 23 autres n'ont passé qu'au second essai au moins une fois. Chaque passage en amène de nouveaux : 5 au sixième. La liste court après une source qu'elle ne tarit pas. Relancer jusqu'à obtenir deux verts de suite prouverait la chance, pas la tenue.

Verser aussi les 23 « second essai » rendrait deux verts plus probables, au prix d'une liste d'environ 80 essais que Linux ne juge plus. Je ne l'ai pas fait : c'est masquer davantage pour un résultat qui resterait probabiliste.

## Recoupement avec `origin/lot/verdict-nuage` (`ab557ac0e`, PR n° 25)

Lu, non fusionné. Il recoupe presque tout ce lot :
- **La liste Linux** : reclassée le 14 nov. sur sept passages, avec une cause par entrée (`causes`) ; 15 connus, 46 intermittentes. Les deux reclassements convergent largement (mêmes retraits de #1116, des critères algorithmiques, des témoins ; mêmes entrées de parcours et de `bulle-largeur-ipad`). Les deux fichiers se heurteront à la fusion : il faudra en choisir un et y reporter les constats de l'autre.
- **#1115** : réglé là-bas autrement. Il force la plateforme à « MacIntel » dans les deux essais (`surUnMac`) ; ici, l'essai lit la plateforme et juge les deux côtés, comme le relais le demande. Même fichier, mêmes lignes : conflit certain.
- **Le juge** (`juger-rapport-playwright.mjs`) : là-bas, il refuse une liste dont une entrée n'a pas sa cause. Ma liste porte `gestes` et `raisons`, pas `causes` : elle ne déclenche pas cette règle, mais ne la satisfait pas non plus.
- **`tests.yml`** : là-bas, un champ `branche`, un nom de run, un groupe de concurrence par référence. Je n'ai pas touché à ce fichier.
- **Ce que ce lot n'a pas et qui répond au fond** : les délais par défaut de Playwright × 2,5 sous Linux (`tests/playwright.config.js`), mesurés là-bas comme ce qui a rendu le premier vert (runs 43647118579 et 43650508547). Mes six passages disent la même chose que ses quatre du 14 nov. : sans cela, la liste ne suffit pas. À noter : son dernier passage (43712516135, 15 nov., sur `ab557ac0e`) est rouge lui aussi, je ne l'ai pas lu.

## Inféré

- Les rouges variables sont des minutages du runner Linux, pas des régressions : ils changent d'un passage à l'autre sur un même commit (mesuré), et le Mac est vert (rapporté par la fiche 37, non remesuré ici).
- La course de `en-tete-epure` (ci-dessus).

## Non vérifié

- Le côté Mac des deux essais de #1115, et tout verdict du Mac.
- Qu'aucun des 18 rouges permanents sous Linux ne cache un défaut réel de l'écran sous Linux.
- L'état poussé de la liste (13 et 44) : aucun passage ne l'a jugé.
- Les 26 intermittentes retirées étaient vertes aux six passages lus ; rien ne dit qu'elles le resteront.
- Ce que le hook pre-push (`scripts/hooks`) a fait exactement : il n'a refusé aucun push, je n'ai pas lu sa sortie en entier. Vitest a été lancé à la main avant chaque push (928 fichiers, 11 817 essais, verts).

## Fichiers touchés

`tests/integration/planif-menu-vue.spec.js` (un essai, pas l'application), `scripts/playwright-baseline-linux.json`, `plans de travail/FILE-DES-CORRECTIFS.md` (fiche 37 laissée « À faire » avec l'étape atteinte ; fiche 30 passée à « Fait »), `BACKLOG.md` (#1115 cochée ; #1246, #1256 et #1116 datées, non cochées), ce rapport. Aucun fichier de l'application, aucune spec de parcours, ni le hook ni `PROTOCOLE.md`.

## Le tableau de l'étape 2 (quatre passages de `main`)

Signature : une lettre par passage, dans l'ordre 43853967604, 43942432518, 43985499691, 43989702254. R rouge, F vert au second essai, V vert.

**Hors liste, rouges aux quatre passages (7)**

| Signature | Essai | Geste |
|---|---|---|
| `RRRR` | `palette-evaluation-compacte` › La palette Évaluation compacte › la bulle : toucher un nom ouvre sa description, toucher ailleu… | connus, avec sa raison |
| `RRRR` | `parcours-2-ma-classe-2026-11-09` › de « Découvrir » à sa propre classe : « Commencer avec ma classe », le Cadre bloc par bloc, « P… | intermittentes, « à revoir au retour des parcours » |
| `RRRR` | `parcours-2-ma-classe-2026-11-09` › la porte de l’accueil commence à la première étape non faite ; avant le premier cours, l’étape … | intermittentes, « à revoir au retour des parcours » |
| `RRRR` | `parcours-2-ma-classe-2026-11-09` › les formulaires du Cadre : une flèche par champ obligatoire vide, qui part quand il est rempli,… | intermittentes, « à revoir au retour des parcours » |
| `RRRR` | `parcours-7-lire-ta-classe-2026-11-09` › les neuf étapes en faisant les gestes, sans grille de dépistage désignée (1180 px, sombre) | intermittentes, « à revoir au retour des parcours » |
| `RRRR` | `parcours-9-notation-alternative-2026-11-09` › étape 3, standards, 1180 × 820 : la bulle laisse le nombre à retenir, le mode et le minimum lib… | intermittentes, « à revoir au retour des parcours » |
| `RRRR` | `tableau-de-notation-1` › Tableau de notation · le débordement à 820 px › standards : un bord estompé du côté où il reste… | connus, avec sa raison |

**Hors liste, variables (35)**

| Signature | Essai | Geste |
|---|---|---|
| `VVFV` | `aide-cp-suit-la-case-1086` › une seule aide « C et P » visible : sur la ligne de la case, pas à la date | aucun (jamais rouge, vert au second essai) |
| `FVVV` | `ajouter-pages-photo-droite` › « + Ajouter des pages » : une photo de téléphone s'enregistre droite › deux photos, « Balance d… | aucun (jamais rouge, vert au second essai) |
| `FVVV` | `ajouter-pages-photo-droite` › « + Ajouter des pages » : une photo de téléphone s'enregistre droite › une copie d'une photo en… | aucun (jamais rouge, vert au second essai) |
| `FVVV` | `annotation-formes-fermees-polygone` › Le polygone, sommet par sommet › moins de trois sommets ne crée rien | aucun (jamais rouge, vert au second essai) |
| `VVFF` | `annotation-formes-fermees-polygone` › Le polygone, sommet par sommet › sélection sur son tracé, déplacement, duplication et suppressi… | aucun (jamais rouge, vert au second essai) |
| `VRRR` | `annotation-formes-fermees-polygone` › Le trait des formes fermées › dupliquer et déplacer une forme ondulée gardent son trait | intermittentes |
| `FVVV` | `bulle-largeur-ipad-2026-11-12` › L1 · 1180 × 820 · mouse : la bulle se pose à droite de la grille quand elle y a la place, et va… | aucun (jamais rouge, vert au second essai) |
| `RVVV` | `bulle-largeur-ipad-2026-11-12` › L1 · 820 × 1180 · mouse : la bulle se pose à droite de la grille quand elle y a la place, et va… | intermittentes (parcours) |
| `RVVV` | `bulle-largeur-ipad-2026-11-12` › L1 · 820 × 1180 · touch : la bulle se pose à droite de la grille quand elle y a la place, et va… | intermittentes (parcours) |
| `RVVV` | `bulle-largeur-ipad-2026-11-12` › L2 · au doigt (contexte tactile) › L2 · 1180 × 820 : innerWidth faux et deux doigts « restés po… | intermittentes (parcours) |
| `VVFV` | `codex-1184-copies-aux-archives` › #1184 — le codex et les copies aux archives › ouvrir un codex sans marque (d'avant #1028) ne to… | aucun (jamais rouge, vert au second essai) |
| `VVFV` | `comptes-erreurs-stock-1142` › #1142 stock · H2026 (et A2025) ne sont pas mesurés : refus, rien lu ni écrit | aucun (jamais rouge, vert au second essai) |
| `VVFV` | `comptes-erreurs-stock-1142` › #1142 stock · la réparation n'écrit que `donneesAlgorithmiques` des copies proposées, par le ca… | aucun (jamais rouge, vert au second essai) |
| `VVVF` | `copie-demo-bibliotheque-31-oct` › le parcours : copie en démo, Garder, sortie, nouveau pack, rechargement, Utiliser dans ce trime… | aucun (jamais rouge, vert au second essai) |
| `FVVV` | `cours-actif-hors-bibliotheque-916` › #916 · cours actif hors bibliothèque : le sélecteur de trimestre se remplit, rien ne boucle | aucun (jamais rouge, vert au second essai) |
| `VRRR` | `en-tete-epure-2026-11-07` › une rangée d'onglets qui déborde au bureau défile, avec un fondu au bord | intermittentes |
| `VFVV` | `evaluation-911-relire-sans-copie` › Porte #911 · S2 · une copie évaluée, puis bascule vers un trimestre sans copie : « Consulter » … | aucun (jamais rouge, vert au second essai) |
| `RRVV` | `evaluer-868-avec-ou-sans-copie` › Porte #868 · avec copie : « Évaluer » ouvre la copie de l'élève, en mode Évaluer | intermittentes |
| `VRFV` | `evaluer-868-avec-ou-sans-copie` › Porte #868 · sans copie, puis avec, puis sans : un seul verrou, une seule sous-barre, chaque fo… | intermittentes |
| `VVVF` | `grilles-sous-criteres-condense` › iPad › sous-critères · créer le premier, nommer, recharger, réordonner, retirer ; aucun code d’… | aucun (jamais rouge, vert au second essai) |
| `VVFV` | `pages-sans-doublons-2026-11-07` › un titre qui répète son onglet n'occupe plus l'écran, mais reste le titre de la page pour les l… | aucun (jamais rouge, vert au second essai) |
| `RVRV` | `pages-sans-emboitement-2026-11-07` › Préparer (clair) : la zone de dépôt pose sur le fond de la page, sur toute la largeur du conten… | intermittentes |
| `RFFV` | `pages-sans-emboitement-2026-11-07` › Préparer (sombre) : la zone de dépôt pose sur le fond de la page, sur toute la largeur du conte… | intermittentes |
| `VRRR` | `parcours-2-ma-classe-2026-11-09` › une flèche didactique ouverte avant le parcours se retire au lancement, sans être marquée vue, … | intermittentes (parcours) |
| `FVFF` | `parcours-3-evaluer-2026-11-09` › « Évaluer une première production », étape 8 à 820 px (l’iPad en portrait) : le menu « Cartouch… | aucun (jamais rouge, vert au second essai) |
| `RFVF` | `parcours-4-recevoir-et-rendre-2026-11-09` › « Recevoir les productions, rendre tes rétroactions », la voie des fichiers : deux remises (une… | intermittentes (parcours) |
| `VRFF` | `parcours-4-recevoir-et-rendre-2026-11-09` › « Recevoir les productions, rendre tes rétroactions », la voie sans fichier : « Rien à importer… | intermittentes (parcours) |
| `FVVV` | `parcours-5-monter-ton-cours-2026-11-09` › capture 25 : une leçon neuve tombée sous le « Planificateur » est amenée dans le canevas libre … | aucun (jamais rouge, vert au second essai) |
| `VVRF` | `parcours-5-monter-ton-cours-2026-11-09` › « Monter ton cours » : les sept étapes, la variante ⚠, « Plus tard » et « Reprendre » à l’étape… | intermittentes |
| `VVVR` | `parcours-8-commentaires-2026-11-09` › 1180 × 820 : aucun avis ne couvre la bulle, même quand aucun coin ne la laisse libre | intermittentes |
| `VRRR` | `parcours-9-notation-alternative-2026-11-09` › le parcours entier en spécifications, de « + Nouvelle pratique » à « Terminer » (1180 px) | intermittentes (parcours) |
| `RFRR` | `parcours-9-notation-alternative-2026-11-09` › le parcours entier en standards, l’échelle demandée par l’assistant (1180 px) | intermittentes (parcours) |
| `VFVV` | `tampons-masques-bibliotheque-1216` › #1216 — sa personnalisation survit au chargement › un tampon de catégorie masquée ou inconnue n… | aucun (jamais rouge, vert au second essai) |
| `VVRV` | `vue-simple` › Vue simple · elle ne nomme rien qui n'existe pas › novice : aucun écran atteignable ne porte un… | intermittentes |
| `RVVV` | `vue-simple` › Vue simple · le passage vers la vue étendue › après le parcours, chaque section de la vue étend… | intermittentes |

**Connus, verts aux quatre (10)**

| Signature | Essai | Geste |
|---|---|---|
| `VVVV` | `critere-algorithmique-calculs-4b` › composer de zéro « Pondération du critère − Compte pondéré des X × 3 », le garder ; « Modifier … | retiré |
| `VVVV` | `critere-algorithmique-calculs-4b` › « Retirer » : refusé pour le calcul de la note ; confirmé pour un autre, « Annuler » n’écrit ri… | retiré |
| `VVVV` | `lot-a-anonymisation-enregistre` › (c)(d) intervention en anonymisation : description, observations et notes masquées ; l'enregist… | retiré |
| `VVVV` | `lot-e3-creer-ou-modifier` › (I-a) intervention complétée modifiée : écrite sans bouton, aucune présence écrite | retiré |
| `VVVV` | `lot-e3-creer-ou-modifier` › (I-b) passage à « Complétée » : la question et sa case DÉCOCHÉE ; « Annuler » n'écrit rien ; sa… | retiré |
| `VVVV` | `materiel-dissection-5` › dissection 5 · « Couper » : (d) refusée en nommant, coupée au pointeur, annulée, créée en point… | retiré |
| `VVVV` | `materiel-dissection-7` › dissection 7 · « Rattacher » : deux touchers au pointeur, marque et flèche, groupe de trois, no… | retiré |
| `VVVV` | `planif-corbeille-fixe-1070` › #1070 — glissé jusqu'à la corbeille et relâché, le bloc est supprimé | retiré |
| `VVVV` | `planif-modele-ia-963` › #963 · faire relire sa carte par une IA › Actions ▸ Télécharger un modèle : le fichier porte le… | retiré |
| `VVVV` | `temoin-enregistrement-lot-b` › lot B · placement 1024 px, clair : aucun bouton des présences ni de la barre d'Annoter sous le … | retiré |

**Connus, variables (11)**

| Signature | Essai | Geste |
|---|---|---|
| `RFVR` | `1007-propose-codex-avant-suppression` › #1007, second lot — avant de supprimer, le codex proposé › P8 (évaluation) : sans codex, à jour… | passé aux intermittentes |
| `RVVR` | `1007-propose-codex-avant-suppression` › #1007, second lot — avant de supprimer, le codex proposé › P8 : une écriture de la même clé PEN… | passé aux intermittentes |
| `RVVR` | `1007-propose-codex-avant-suppression` › #1007, second lot — avant de supprimer, le codex proposé › Une porte par famille : élève (P2), … | passé aux intermittentes |
| `FVVV` | `bibliotheque-liste-1159` › à 1440 px › les trois fenêtres tiennent dans la largeur ; cibles de 44 px ; Échap ferme | passé aux intermittentes |
| `VVRV` | `codex-991-selection-aller-retour` › #991 — « Exporter une sélection » passe par assemblerZip › les copies sont rangées, et le fichi… | passé aux intermittentes |
| `FVRV` | `exporter-des-travaux-une-carte-895` › #895 · un filtre sans fichier ne télécharge rien et le dit dans la carte, sans dialogue | passé aux intermittentes |
| `VFRV` | `exporter-des-travaux-une-carte-895` › #895 · « Toutes / Tous » + « Télécharger » : l'archive de tout le groupe, par élève et par prod… | passé aux intermittentes |
| `RRFF` | `materiel-aide-accompagnement` › aide d’« Apporter mon matériel » · l’aide « i » aux deux écrans, les bulles, y compris celles d… | passé aux intermittentes |
| `RVRV` | `materiel-dissection-2a` › dissection 2a · C3 : l’exemple recréé est refusé (nom pris), renommé dans le champ, créé ; les … | passé aux intermittentes |
| `VRRV` | `palette-retroaction-compacte` › La palette Rétroaction compacte › les couleurs se lisent en mode sombre | passé aux intermittentes |
| `VVRV` | `tampons-masques-bibliotheque-1216` › #1216 — sa personnalisation survit au chargement › le cycle : enregistrer, recharger, relire, r… | passé aux intermittentes |

**Connus, rouges aux quatre (14)**

| Signature | Essai | Geste |
|---|---|---|
| `RRRR` | `1007-codex-a-part-avant-suppression` › #1007 — avant de supprimer, un codex à part › X1, fenêtre de choix (Chrome) : « Annuler » à cha… | reste aux connus |
| `RRRR` | `codex-1011-ouvert-sans-espace` › #1011 — un codex ouvert sans assez d'espace va jusqu'à son bilan › (5) les mots du refus du pré… | reste aux connus |
| `RRRR` | `codex-1011-ouvert-sans-espace` › #1011 — un codex ouvert sans assez d'espace va jusqu'à son bilan › (5) les mots du refus du pré… | reste aux connus |
| `RRRR` | `codex-1012-fichier-d-origine` › #1012 — le fichier d'origine n'est tenu qu'après une ouverture complète › (1) annulation ou ref… | reste aux connus |
| `RRRR` | `exporter-des-travaux-une-carte-895` › #895 · « Par étudiant·e », sans compression, un·e élève : l'autre forme, l'archive plus lourde | reste aux connus |
| `RRRR` | `lot-j0-bis-partage-apres-preparation` › Lot J0 bis (#988) — le partage du codex après une préparation longue › réel : vrais clics, vrai… | reste aux connus |
| `RRRR` | `nettoyage-sans-perte-892` › #892 · aucune copie exportée : l'écran n'offre aucun retrait et mène à l'exportation | reste aux connus |
| `RRRR` | `nettoyage-sans-perte-892` › #892 · la liste est vue ; annuler ne retire rien ; seules les copies exportées partent | reste aux connus |
| `RRRR` | `notifications-pile-1224` › #1224 · quinze rouges et un vert : la pile reste dans l'écran et défile | reste aux connus |
| `RRRR` | `palette-evaluation-compacte` › La palette Évaluation compacte › la bulle d’aide générale du nom : elle reste en descriptions, … | reste aux connus |
| `RRRR` | `planif-menu-vue` › chaque raccourci affiché a son essai, et chaque essai son raccourci affiché | retiré (#1115, l'essai lit la plateforme) |
| `RRRR` | `planif-menu-vue` › le bouton « Annuler » annonce ⌘Z sur un Mac, plus « Ctrl+Z » | retiré (#1115, l'essai lit la plateforme) |
| `RRRR` | `planif-zone-non-planifie-929` › #929 · zone « Non planifié » toujours rendue › tout planifié → zone vide visible ; une leçon gl… | reste aux connus |
| `RRRR` | `standards-sans-portfolio-lot-4` › CHIM-1 · sans « Artefact » : la liste paraît, toutes cochées ; décocher le Laboratoire 1 change… | reste aux connus |

**Intermittentes, variables (4)**

| Signature | Essai | Geste |
|---|---|---|
| `FRRR` | `annotation-formes-fermees-polygone` › Le trait des formes fermées › témoin : une ligne pointillée se sélectionne toujours sur son tra… | reste |
| `VRFV` | `evaluer-un-doigt-ne-ramene-pas-1217` › #1217 · en Évaluer, un doigt parcourt la copie sans revenir en Annoter › sous Sélection, un déf… | reste |
| `RVRR` | `palette-evaluation-compacte` › La palette Évaluation compacte › les trois trouvailles du lot du défilement : la largeur, le ba… | reste |
| `VRRV` | `statut-incomplet-travail-en-cours` › statut incomplet · remplacer la copie garde le statut ; décocher la rend ordinaire, et elle ent… | reste |

**Intermittentes, vertes aux quatre (26)** : retirées. Par fichier : `annotation-deux-doigts-page` × 1, `bareme-1` × 3, `comptes-erreurs-stock-1142` × 1, `critere-algorithmique-calculs-4b` × 3, `critere-algorithmique-calculs-4c` × 7, `lot-i-bis-la-case-ouvre-un-codex` × 2, `materiel-dissection-11` × 1, `materiel-dissection-12` × 1, `materiel-dissection-2a` × 2, `materiel-dissection-2b` × 2, `temoin-enregistrement-lot-b` × 3.
