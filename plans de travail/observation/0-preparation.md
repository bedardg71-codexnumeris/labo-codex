# Observation, temps 2 : préparation de la copie aveugle

*12 octobre 2026. Session de préparation, distincte de celle qui analysera. Base : `b709f2a` (`origin/main`, version 1.199.0, build 1011-1808). Cadrage : `plans de travail/CADRAGE-2026-10-12-observer-ce-que-fait-l-application.md`.*

> Ce rapport ne va jamais dans la copie. Il décrit ce qui a été retiré, pas ce que fait l'application.

## 1. Ce que contient la copie

408 fichiers, 14 Mo, dans un dépôt git d'un seul commit (§7) :

| Emplacement | Fichiers | Pourquoi |
|---|---|---|
| racine | `index.html`, `styles.css`, `version.js`, `version.json` | la page, sa feuille de style, la version (lue par `<script>` et par `fetch`) |
| `js/` | 204 | les 202 scripts que charge `index.html`, plus `js/heic-worker.js` (lancé comme Worker) et `js/pack-demo-10.js` (chargé à la demande par `js/demo-namespace.js`) |
| `libs/` | 9 | 7 chargées par `index.html` ; `libheif-bundle.js` (chargée par le Worker) ; `pdf.worker.min.js` (chargée par `fetch`) |
| `css/` | 1 | `accompagnement.css` |
| `icons/`, `img/`, `autocollants/` | 136, 1, 53 | dossiers copiés entiers (voir plus bas) |

**Choix de périmètre que j'ai tranchés** (à corriger au besoin) :

- **Seuls les scripts réellement chargés.** Exclus, parce que rien ne les charge : `js/_archives/entites-ui.js` et `js/pratiques/pratique-interface.js` (ce dernier se déclare lui-même « documentation »). Mesure : la liste des `<script src>` de `index.html`, plus une recherche de `new Worker`, `importScripts`, `fetch` et `script.src`.
- **Images : dossiers entiers.** Certains chemins sont construits à l'exécution (par exemple `'icons/outils-token' + n + '-100.png'`) : trier image par image risquait de casser un écran. Conséquence : 63 icônes sur 136 et 24 autocollants sur 53, que le code ne nomme pas en toutes lettres, sont présents. Une image ne s'exécute pas ; ses noms de fichiers restent visibles.
- **`design-system.html` exclu** : aucun lien depuis l'application ; c'est la référence visuelle du projet, donc de la documentation.
- **Exclus aussi, parce que non chargés** : `Logo/`, `netlify.toml`, le PDF du calendrier, `libs/VERSIONS.md`. Conséquence pour `netlify.toml` : les en-têtes HTTP du site en ligne ne sont pas dans la copie. La politique de sécurité (CSP) inscrite dans la balise `<meta>` de `index.html` y est.
- **Exclus comme prévu par le cadrage** : `.git`, `.github`, `.claude`, `.claude-plugin`, `plugins/`, `CLAUDE.md`, `PROTOCOLE.md`, tous les `.md` (dont `docs/guide/01-ce-que-fait-labo-codex.md`, arrivé le 12 octobre), `plans de travail/`, `docs/`, `scripts/`, `tests/` et leurs fixtures, `node_modules`, `Rapports/`, `audit/`, `audit annuel/`, `Retours des testeurs/`, `références tableur/`, `Design system - Modules/`, `design_handoff_synthese_B/`, `Plan Accompagnement/`.
- Vérifié dans la copie : zéro fichier `.md`, zéro `.txt`, zéro `.pdf`. Extensions présentes : `.js` (214), `.svg` (156), `.png` (34), `.css` (2), `.html` (1), `.json` (1).

## 2. Ce qui a été retiré

Aucun nom n'a été changé. Les retraits s'appuient sur des analyseurs syntaxiques, pas sur des expressions régulières :

| Quoi | Outil | Retirés |
|---|---|---|
| Commentaires JS (214 fichiers) | acorn 8.19, analyse complète de chaque fichier | 32 109 |
| Commentaires HTML logés dans des chaînes JS (15 fichiers) | acorn, jetons « chaîne » et « gabarit » | 198 |
| Commentaires CSS (`styles.css`, `css/accompagnement.css`) | tokeniseur de postcss 8 | 1 683 |
| Commentaires HTML de `index.html` | parse5 7 | 924 |
| Commentaires CSS des deux blocs `<style>` de `index.html` | tokeniseur de postcss 8 | 235 |
| En-têtes de logiciel de dessin dans 7 SVG | expat (Python) | 7 |
| Contenu du changelog (§3) | acorn, modification de l'arbre syntaxique | 175 entrées |

Précisions :

- **Pas de JS en ligne** : `index.html` n'a aucun `<script>` à contenu ni aucun gestionnaire `on…=` (vérifié par parse5). Il n'y avait donc pas de JS en ligne à traiter.
- **Les commentaires HTML dans les chaînes JS** sont des fragments de HTML que le code injecte dans la page ; plusieurs citaient des numéros de fiche. Aucun code ne lit de nœud commentaire (recherche de `COMMENT_NODE`, `nodeType === 8`, `createComment`, `SHOW_COMMENT` : zéro) ; les retirer ne change donc rien à ce que fait le programme. Un `<!--` sans fermeture dans la même chaîne aurait été laissé et signalé : il n'y en a eu aucun.
- **Conservés : 37 en-têtes de licence** des bibliothèques tierces de `libs/` (Chart.js, jsPDF, html2canvas, etc.). Décision prise pour une raison de droit : leurs licences (MIT et autres) exigent que l'avis accompagne toute copie. Ils décrivent les bibliothèques, pas l'application. Les autres commentaires de `libs/` sont retirés.
- **Forme** : un commentaire qui occupait une ligne disparaît avec sa ligne ; un commentaire sur plusieurs lignes est remplacé par un saut de ligne, pour ne pas changer l'insertion automatique des points-virgules. Les numéros de ligne ne correspondent donc plus à ceux de l'original.

**Vérifications** :

1. **Par l'outil de retrait, fichier par fichier.** La sortie est ré-analysée : zéro commentaire ; pour le JS, flux de jetons identique jeton à jeton (type et texte), seules les chaînes ayant perdu un commentaire HTML pouvant différer, et présence d'un saut de ligne entre deux jetons conservée ; pour le CSS, flux de jetons identique aux blancs près ; pour le HTML, même arbre (éléments, attributs, texte aux blancs près).
2. **Contre-vérification indépendante sur la copie entière**, par un second script : JS 0 commentaire (hors les 37 licences de `libs/`), CSS 0, HTML 0, `<style>` 0, chaînes JS contenant `<!--` : 0, SVG 0.
3. **Recherche textuelle brute** (`grep`) de `<!--`, `/*` et `//` hors adresses web : zéro `<!--` ; deux `/*`, tous deux dans `accept="image/*"` à l'intérieur d'une chaîne ; un `//`, à l'intérieur d'une image encodée en base64. Aucun n'est un commentaire.

Outils et scripts de retrait : dans le bloc-notes de la session (non versionnés, comme la copie elle-même).

## 3. Changelog

`js/changelog-data.js` : la liste `CHANGELOG` est vidée (175 entrées retirées). Seul consommateur : `genererChangelogHTML`, dans le même fichier, appelée par `js/init-inline.js` ; sur une liste vide, elle rend une chaîne vide. L'application le tolère : la fenêtre « Nouveautés » s'ouvre, vide (essai `bandeau-maj-chargement`, §5).

Reste visible : le bandeau de version, le bouton qui ouvre la fenêtre, et le numéro de version.

## 4. Données réelles d'élèves

**Aucun nom d'élève réel trouvé.** Méthode : relevé des champs nominatifs (`prenom`, `nom`, `da`, courriels), des nombres à 7 chiffres (forme d'un DA), des paires de mots à majuscule dans tout le code et le HTML, et des mots à majuscule dans tous les textes libres du pack de démonstration.

**Doutes signalés** (sans recopier de nom) :

- **`js/pack-demo-10.js`, ligne 12** : la métadonnée du pack déclare comme source des « Données réelles A2025 anonymisées ». Les dix élèves (à partir de la ligne 64) portent des noms de personnalités et des DA « DEMO0xx » ; les textes libres (100 rétroactions finales, 42 rétroactions) les nomment par ces pseudonymes ; les seuls autres noms propres sont des auteurs étudiés et le nom de l'assistant. Inférence : les notes, présences et rétroactions sont dérivées de vrais élèves, puis pseudonymisées. Fait : ce fichier est déjà servi par le site en ligne (`netlify.toml` : `publish = "."`). **Décision qui revient à Grégoire** : le garder (l'application le charge en mode démonstration) ou le retirer. Je ne l'ai pas modifié.
- **`js/config.js` de la copie, lignes 98 à 104** : sept élèves d'exemple aux noms plausibles, en ordre alphabétique, DA séquentiels à partir de 1234567. Jugés fabriqués (inférence), à confirmer.
- Les autres noms propres sont des chercheurs cités dans les crédits, des exemples de partage entre enseignants, des exemples de saisie et le nom de l'auteur de l'application. Aucun n'est un élève.

Limite : sans liste de référence des vrais élèves, la méthode est heuristique ; elle attrape une fuite de prénom dans un texte libre, pas une donnée réelle sans nom (une note, une date d'absence).

## 5. Fonctionnement

**Sélection** : 13 fichiers d'essais Playwright, 33 essais : `setup`, `accueil-porte-entree-640`, `ouverture-sans-geste-981-983`, `bandeau-maj-chargement` (ouvre la fenêtre « Nouveautés »), `evaluation-rendu`, `profil-etudiant-rendu`, `productions-rendu`, `trimestre-v2-rendu`, `parcours-neuf-saisie-presences`, `partage-import-rendu`, `e1-archiver-trimestre`, `sandbox-isolation`, `t3-retirer-les-copies-du-demo`. Écartés d'office : les essais qui lisent le code source comme du texte (ils jugent les commentaires, pas le comportement).

**Banc** : les essais restent dans le dépôt principal. Pour la copie, un dossier temporaire réunit la copie et un double du dossier `tests/` du dépôt principal (même `node_modules`) ; la copie elle-même ne reçoit aucun test. Même configuration des deux côtés : `tests/playwright.chromium.config.js`.

**Résultat** :

| | Original (`b709f2a`) | Copie |
|---|---|---|
| Essais réussis | 33 sur 33 (3,3 min) | 33 sur 33 (3,5 min) |
| Échecs, essais instables | 0 | 0 |
| Liste des essais passés | identique (comparée titre par titre) | identique |

Contrôle de plus, pour le changelog (un essai écrit pour l'occasion, dans le dossier temporaire seulement) : chargement de la page, puis ouverture de la fenêtre « Nouveautés ». Original : 175 entrées, zéro erreur console ou JavaScript. Copie : 0 entrée, zéro erreur.

**Limite** : Chromium, pas WebKit (absent du conteneur) ; un vert Chromium n'est pas un verdict Safari. Sélection courte : elle montre que la copie s'ouvre et que les gestes de base répondent comme l'original, pas que tout se comporte à l'identique.

## 6. Isolement de la session d'analyse

**Verdict : je ne peux pas garantir l'isolement sur le compte claude.ai actuel de Grégoire.** Raisons mesurées dans cette session, ouverte dans le nuage sur ce compte :

- **Reçus sans rien demander** : les préférences personnelles du compte claude.ai (injectées en bloc) ; l'adresse courriel du compte ; la liste des skills du compte, dont `release-et-changelog`, dont la description nomme Labo Codex ; les connecteurs Netlify et Claude Docs ; les outils `claude-code-remote`.
- **Lecture des autres sessions** : l'outil `list_sessions` m'a rendu les sessions du compte, titres compris, dont celle du temps 1 en cours. Selon sa description, l'outil `list_events` lit la transcription d'une autre session. Une session d'analyse ouverte sur ce compte pourrait donc lire les intentions en cours de rédaction, et cette préparation-ci.

Ce que dit la documentation (relevée par un sous-agent, sources ci-dessous) :

- Le `CLAUDE.md` personnel (`~/.claude/CLAUDE.md`) n'existe pas dans le nuage, sauf si un script d'installation l'écrit.
- La mémoire automatique est locale à la machine ; on la coupe par la variable d'environnement `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
- Les skills du compte claude.ai sont chargés dans les sessions du nuage.
- Les connecteurs du compte sont transmis par l'hôte.
- La documentation ne dit rien des préférences personnelles, de la mémoire de claude.ai ni des outils `claude-code-remote` : aucun interrupteur documenté.

**Recette recommandée** (elle ferme tous les accès que j'ai mesurés ; je n'ai pas pu l'éprouver, le dépôt n'existant pas encore) :

1. **Un second compte claude.ai**, ouvert avec une autre adresse courriel et qui donne accès à Claude Code sur le Web, et qui ne sert qu'à l'analyse : ni préférences, ni skills, ni connecteurs, ni mémoire, ni autres sessions.
2. **Un second compte GitHub** (gratuit), invité comme collaborateur sur `programme-a-observer` seulement. Le second compte claude.ai se connecte à GitHub avec ce compte-là. Sur le compte GitHub de Grégoire, l'application Claude doit compter `programme-a-observer` parmi ses dépôts autorisés. Le second compte GitHub ne voit pas `Monitorage_v6` (dépôt privé : vérifié) ; la session ne devrait donc pas pouvoir l'ajouter (inférence tirée du fonctionnement des applications GitHub, qui n'ouvrent que les dépôts accessibles à la fois à l'application et à l'utilisateur ; non éprouvée).
3. **Un environnement neuf** dans ce second compte : aucun script d'installation ; variable `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` ; réseau « Trusted » (l'analyste devra installer Playwright depuis npm ; Chromium est déjà dans le conteneur).
4. **Contrôle avant la consigne** : dans la session d'analyse, demander la liste textuelle de ses instructions reçues, fichiers de mémoire, skills, serveurs et outils MCP, et lancer `list_repos`. Attendu : aucune préférence, aucun skill, aucun connecteur, un seul dépôt. Ne donner la consigne neutre qu'ensuite.

**Ce qu'aucune recette ne ferme** : la recherche web. Le nom « Labo Codex » s'affiche à l'écran ; une session qui cherche ce nom sur le web trouvera le site et ce qui est publié sur l'application. Deux moyens, aucun garanti : le dire dans la consigne (une instruction, pas une barrière), ou ajouter à la copie un `.claude/settings.json` qui refuse les outils de recherche (`{"permissions": {"deny": ["WebSearch", "WebFetch"]}}`). La documentation dit que ces règles s'appliquent aux sessions à un seul dépôt ; je ne l'ai pas ajouté, parce que la consigne de copie disait « seulement ce qui s'exécute dans le navigateur ».

**Sur le compte actuel**, même en vidant les préférences, en coupant les skills et en débranchant les connecteurs le temps de l'analyse, la lecture des autres sessions reste ouverte : aucun interrupteur documenté. Une règle de refus `mcp__claude-code-remote` dans un `.claude/settings.json` de la copie est une piste non éprouvée.

Sources (documentation Claude Code, consultée le 12 octobre 2026) : `code.claude.com/docs/en/claude-code-on-the-web`, `…/cloud-environments`, `…/memory`, `…/skills`, `…/mcp`, `…/permissions`, `…/settings`, `…/security`.

## 7. Dépôt de la copie

- Dans la copie : `git init`, branche `main`, **un seul commit** (`a93ce1f11e52c9c79e1c175867e469997cc671df`), message « Programme à observer », 408 fichiers. Le lien vers cette session-ci, que porte d'habitude un commit, n'y figure pas : il mène à la transcription de la préparation.
- La copie vit dans un conteneur éphémère : elle est remise à Grégoire sous forme d'un paquet git, `programme-a-observer.bundle` (3,4 Mo), joint à la conversation. Éprouvé ici : `git bundle verify` passe ; un clone du paquet donne la branche `main`, le commit ci-dessus seul, et des fichiers identiques à la copie (`diff -r`).
- **Sur le Mac**, une fois le paquet dans Téléchargements (outil `gh` installé et connecté) :

```sh
git clone ~/Downloads/programme-a-observer.bundle ~/programme-a-observer && cd ~/programme-a-observer && git remote remove origin
gh repo create programme-a-observer --private --source=. --remote=origin --push
```

- Sans `gh` : créer un dépôt privé vide nommé `programme-a-observer` sur github.com/new (sans README), puis, après la première ligne ci-dessus :
  `git remote add origin https://github.com/bedardg71-codexnumeris/programme-a-observer.git && git push -u origin main`
- Contrôle : `git log --oneline` affiche une seule ligne.

## 8. Ce qui reste visible à l'analyste (limites)

- **Les noms** : fonctions, variables, fichiers, clés de stockage, identifiants et classes HTML/CSS, en français et souvent parlants (limite assumée par le cadrage).
- **Les textes d'écran**, dont l'aide intégrée, les guides pédagogiques (`js/guides-pedagogiques.js`), les crédits (auteur, cégep, « assisté par Claude Code »), le courriel de contact, le nom de l'application (« Labo Codex » : 114 occurrences dans 30 fichiers). Le cadrage les traite comme des sorties.
- **Les messages de la console et d'erreur**, qui citent des numéros de fiche (par exemple une étiquette de la forme « [DB][GARDE #nnn] »), et quelques textes de code qui mentionnent une décision ou un objectif. Ce sont des chaînes du code, pas des commentaires : elles restent.
- **Le pack de démonstration** et sa métadonnée qui dit l'origine des données (§4).
- **La version** (1.199.0) et le build.
- **Les bibliothèques tierces** et leurs 37 en-têtes de licence.
- **Ce qui manque à la copie** et qui pourrait faire différer une observation du site en ligne : les en-têtes HTTP de production, les fichiers que rien ne charge.
- **La préparation elle-même** a été faite par une session qui connaît les intentions ; les choix du §1 sont les siens.

## 9. Ce qui revient à Grégoire

1. Le pack de démonstration (§4) : le garder dans la copie ou le retirer.
2. La recette d'isolement (§6) : second compte claude.ai et second compte GitHub, ou accepter les trous mesurés sur le compte actuel.
3. La recherche web (§6) : l'interdire par la consigne, par un fichier de réglages dans la copie, ou les deux.
