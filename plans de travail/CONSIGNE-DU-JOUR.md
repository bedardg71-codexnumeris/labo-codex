# Consigne du jour — l'application met 30 à 45 s à s'ouvrir : ne plus redemander au serveur ce qui n'a pas changé (#825, temps 1)

> **Écrite le 11 septembre 2026 à 11 h 29 (Toronto, `TZ=America/Toronto date`) par Cowork**, sur le retour de Grégoire du
> 11 sept. à 7 h 08 (« entre 30 et 45 secondes à charger… améliorer la vitesse ou, à tout le moins, rassurer l'utilisateur »)
> et sa décision de 7 h 25 : **à régler dans la journée, après la clôture de l'écran de réglage** — qui est livrée et vue
> (`1.130.1`). Application au moment de l'écriture : **`1.130.1`**, build `0911-1103`, `main` = `origin/main` = `7130d0db`.
> Elle remplace la consigne de clôture (livrée en `1.130.1`, porte relevée 4/4), archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-cloture-ecran-de-reglage.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`, `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Chaque chiffre ci-dessous porte sa commande.
>
> **Retour de testeur : il passe avant le backlog** (`CLAUDE.md`, priorité absolue). **Préalable** : `BACKLOG.md`, item `#825`
> (grep ciblé, le fichier fait 930 Ko) ; `netlify.toml` en entier (les commentaires y sont un journal de décisions) ;
> `scripts/release.mjs` l. 112-230 ; `scripts/verifier-anticache-stage.mjs` en entier.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés, non commis, de Cowork (11 h 22) : la porte terrain des liens (relevée 4/4, décision « Régler »), l'entrée 10 de
`00-CADRAGES-OUVERTS.md` (l'écran de réglage est FINI), le cadrage 10, `CONSIGNE-DEMARRAGE-COWORK.md`, l'archivage de
l'ancienne consigne, et la présente. **Commets-les d'abord, seuls, `git add` ciblé.** ⚠ Le `D` sur la capture du 9 septembre
(`Retours des testeurs/grégoire/BUG_…journal-de-bord-sans-fond.png`) **reste hors de tes commits** : il est à Grégoire. Les
quatre `Formation/*.html` non suivis aussi (chantier à part).

---

## 0 · CE QUI EST MESURÉ, ET LA PRÉMISSE QUE LA MESURE CORRIGE

**Le symptôme, mesuré par Grégoire dans Chrome (onglet Network, 7 h 17-7 h 20)** : rechargement forcé sans cache — 313 requêtes,
3,8 Mo, Load **50,9 s** ; rechargement forcé avec cache — 301 requêtes, Load **34 s** ; rechargement simple — 300 requêtes, 199 Ko,
Load **0,92 s**, tout servi du cache.

**La cause retenue (inférence de Cowork, à confirmer par la porte terrain, pas par un banc)** : `netlify.toml` sert `/js/*`,
`/css/*` et `/styles.css` en `Cache-Control: public, max-age=0, must-revalidate`. Chaque **ouverture** de l'application (nouvel
onglet, le matin, l'iPad) revalide donc **199 scripts** (`grep -c '<script[^>]*src=' index.html`) et 2 feuilles de style, un
aller-retour chacun derrière Cloudflare Access. Le rechargement simple ne le montre pas : sur un reload, Chrome ne revalide que le
document principal. **Ce que le lot va prouver ou réfuter** : si, après livraison, une ouverture dans un nouvel onglet descend sous
quelques secondes, l'inférence tenait ; sinon, la cause est ailleurs et on remesure avant de toucher à autre chose.

**⚠ PRÉMISSE CORRIGÉE — le « préalable » de #825 est déjà en place, pour l'essentiel.** L'item et le skill `portes-terrain`
(§ « LE GARDE ANTI-CACHE NE SURVEILLE QUE `main.js` », l. 373) disent que le garde ne surveille que `main.js`. **C'est faux depuis
#547** : `scripts/verifier-anticache-stage.mjs` (hook pre-commit, bloquant) refuse tout commit où un fichier stagé garde le `?v=`
qu'il avait à HEAD, pour **tout** fichier qu'`index.html` référence avec un jeton ; et `scripts/release.mjs` (`fichiersModifies`)
bumpe le jeton de **tout** `js/` ou `.css` modifié depuis la release précédente, arbre de travail compris. Mesure-le toi-même :
`sed -n 60,95p scripts/verifier-anticache-stage.mjs` et `sed -n 195,230p scripts/release.mjs`. **Le mécanisme existe ; ce qui
manque, ce sont trois fichiers qui lui échappent** — et ils ne sont un défaut QUE si l'on rend `/js/*` immuable, ce que ce lot fait :

| Fichier | Pourquoi il échappe | Témoin |
|---|---|---|
| `js/repertoires-bibliotheque.js` | référencé **sans `?v=`** dans `index.html` — le garde l'ignore explicitement (« un fichier sans `?v=` n'a pas d'URL à rafraîchir ») | `grep -n 'src="js/[^"]*"' index.html \| grep -v '?v='` rend **1** ligne (l. 14452) |
| `js/pack-demo-20.js` (1,1 Mo) | chargé à la demande par `js/demo-namespace.js:115` (`script.src = 'js/pack-demo-20.js'`), **sans jeton**, hors d'`index.html` | `grep -n "pack-demo-20" js/demo-namespace.js` |
| `js/heic-worker.js` | `new Worker('js/heic-worker.js?v=20260830b')` dans `js/heic-decodeur.js:98` — un jeton **figé à la main**, que ni `release.mjs` ni le garde ne voient (ils ne lisent qu'`index.html`) | `grep -n "heic-worker" js/heic-decodeur.js` |

Les quatre bibliothèques sans jeton (`libs/chart.min.js`, `chartjs-plugin-annotation`, `jspdf.umd`, `jspdf-autotable`) sont
**hors périmètre** : `libs/` n'est couvert par aucune règle d'en-tête et le reste — elles continuent d'être revalidées, quatre
requêtes, pas deux cents. Ne pas y toucher.

---

## 1 · LE LOT — trois gestes, dans cet ordre, une seule release

### A. Boucher les trois trous (la SOURCE), avant de toucher aux en-têtes

1. **`js/repertoires-bibliotheque.js`** : lui donner un `?v=20260911a` dans `index.html`. À partir de là, le garde et
   `release.mjs` le tiennent comme les autres.
2. **`js/pack-demo-20.js` et `js/heic-worker.js`** : leur jeton devient **le build courant**, lu dans `window.__VERSION__.build`
   (`version.js`, chargé en premier, l. 14382 d'`index.html`, réécrit à chaque release par `release.mjs`) :
   `'js/pack-demo-20.js?v=' + build` et `'js/heic-worker.js?v=' + build`. **Décision de Cowork, et ce qu'elle suppose** : un jeton
   de build change à chaque release même si le fichier n'a pas bougé — ça coûte un téléchargement du pack de démo (1,1 Mo) par
   release, **seulement chez qui active la démo**, et zéro nouveau mécanisme dans `release.mjs`. L'alternative (étendre `release.mjs`
   à des porteurs hors `index.html`) ajoute un régime de lecture pour deux fichiers ; refusée. Si `window.__VERSION__` peut être
   absent au moment de l'appel (mesure-le : `version.js` est-il chargé dans tous les chemins qui mènent à ces deux appels ?), replier
   sur `Date.now()` — jamais sur une URL nue.
3. **Sentinelle Vitest (`tests/unit/`), break-testée** : tout `js/…` chargé dynamiquement dans `js/` (`createElement('script')`,
   `new Worker(`) porte un `?v=` ; et tout `src="js/…"`, `href="css/…"`, `href="styles.css"` d'`index.html` porte un `?v=`
   (**zéro exception**, témoin : le compte total des références). Elle doit rougir si l'on retire le jeton de `repertoires-bibliotheque.js`
   — fais-le, montre le rouge, remets.

### B. Les en-têtes (`netlify.toml`) — immuables un an, parce que chaque URL change avec son contenu

- `/js/*`, `/css/*`, `/styles.css` → `Cache-Control: public, max-age=31536000, immutable`.
- **Ne bougent pas** : `/*.html` et `/` (`max-age=0` — c'est `index.html` qui porte les jetons, il DOIT être revalidé),
  `/version.json` (`no-store` — la détection de mise à jour en dépend, `init-inline.js:448`, `rechargement-sur.js:40`),
  `/*.json`, `/icons/*`, `/img/*`, et `libs/` (aucune règle, aucun jeton, voir § 0).
- **Écris dans le fichier, en commentaire, l'invariant qui rend « immuable » sûr** : *une URL ne sert jamais deux contenus, parce que
  le garde #547 refuse un commit sans bump, `release.mjs` bumpe tout `js/`/`css` modifié, et la sentinelle de A.3 refuse une
  référence sans jeton.* Datée. Et pourquoi `index.html` reste à zéro.
- **Sentinelle Vitest, break-testée** : lit `netlify.toml` et exige que `/js/*` et `/css/*` portent `immutable` ET que la règle
  `/*.html` ne le porte PAS (le cas où quelqu'un « uniformise » et fige la porte d'entrée un an chez tout le monde — c'est le seul raté
  irréversible de ce lot : un `index.html` immuable ne se rattrape plus). Elle rougit si tu retires `immutable` de `/js/*`, et si tu
  l'ajoutes à `/*.html`. Montre les deux rouges.

### C. Livrer — `patch` (`1.130.2`), c'est un défaut signalé par un testeur, rien de neuf à l'écran

- `scripts/release.mjs` (les quatre points de vérité) ; `cd tests && npm run test:unit` (pas `npm test`) ; relecture croisée sur
  le diff réel (règle 2 : un déploiement, c'est dans le périmètre) ; verdict ; `scripts/pousser.sh`.
- **Changelog (mots lus par les collègues — texte de Cowork, validé par Grégoire dans la conversation avant la release ; s'il l'a
  corrigé, sa version)** : « L'application s'ouvre plus vite : ce qui a déjà été téléchargé n'est plus redemandé au serveur à chaque
  ouverture. La première ouverture après une mise à jour reste plus longue, le temps de recevoir ce qui a changé. »
- **Corrige la prémisse là où elle vit** : le § « LE GARDE ANTI-CACHE NE SURVEILLE QUE `main.js` » du skill `portes-terrain` (l. 373)
  dit le contraire de ce que `verifier-anticache-stage.mjs` fait depuis #547. Réécris le titre et le premier paragraphe avec la
  mesure ; garde les quatre gestes « avant d'envoyer une porte terrain », qui restent vrais.

---

## 2 · LA PORTE TERRAIN — deux livrables jumeaux, c'est elle qui juge ce lot

**Aucun banc ne peut mesurer ceci** : les en-têtes n'existent qu'une fois déployés, derrière Cloudflare Access, et `file://` n'a
pas d'en-têtes. **Tu écris le markdown** (`plans de travail/PORTES-TERRAIN-2026-09-11-ouverture-immuable.md`, modèle du skill
`portes-terrain`) ; **Cowork publie l'artefact**. Quatre rangées, sur `app.codexnumeris.org`, **dans un NOUVEL ONGLET à chaque
fois, jamais un rechargement** (un reload ne revalide que le document principal — c'est ce qui a caché la cause ce matin) :

| # | Où | Geste | Attendu |
|---|---|---|---|
| 1 | Chrome, Mac | **Avant de relayer la consigne** (encore `1.130.1`) : nouvel onglet, Network ouvert, taper l'adresse. Noter Load et le nombre de requêtes en **304** | le chiffre de référence — Cowork l'inscrit dans #825 |
| 2 | Chrome, Mac | Après le déploiement : nouvel onglet, taper l'adresse (première ouverture : elle reçoit ce qui a changé). **Fermer l'onglet. Nouvel onglet, taper l'adresse.** Noter Load | seconde ouverture **sous 3 s** ; colonne Size : « (memory cache) » / « (disk cache) » pour `js/…`, **zéro 304** sur `js/` |
| 3 | Chrome, Mac | Dans Network, cliquer un `js/…`, onglet Headers, lire `cache-control` | `public, max-age=31536000, immutable` — si Cloudflare l'a réécrit, la rangée 2 est fausse pour une autre raison, et Cowork la mesure |
| 4 | Safari, iPad | Ouvrir l'application ; la fermer complètement ; la rouvrir. Compter les secondes à la montre | seconde ouverture sous 5 s ; et **le bas de page dit `1.130.2`** (le témoin que l'immuable n'a pas figé l'ancienne version) |

⚠ **La rangée 1 se fait AVANT le relais** : c'est le seul « avant » qui existera. Cowork le demande à Grégoire dans la phrase
au-dessus du bloc de relais.

---

## 3 · CE QUI NE SE FAIT PAS DANS CE LOT, ET POURQUOI

- **`defer` sur les 199 scripts (temps 2 de #825)** — pas avant la rangée 2. Mesuré : les scripts sont **déjà en fin de `<body>`**
  (l. 14382-14672, `</head>` à l. 3794), donc la page est lue avant qu'ils s'exécutent, et un navigateur moderne les télécharge
  déjà en parallèle. Le gain attendu de `defer` est faible ; le risque (un script qui compte sur `document.readyState === 'loading'`)
  est réel. **On ne le fait que si la rangée 2 reste au-dessus de quelques secondes** — décision de Grégoire, à froid, sur le chiffre.
- **L'écran d'attente (« à tout le moins, rassurer »)** — même condition : s'il n'y a plus d'attente, il n'a plus d'objet.
- **Un bundle, une étape de build** — contraire à la pile servie telle quelle.
- **Rien n'est écrit dans les données de personne** : source seulement (des en-têtes et trois URL) ; il n'y a pas de stock.

---

## 4 · TROUVAILLES ET RAPPORT

Toute trouvaille en chemin reçoit l'une des trois issues de `CLAUDE.md` et tu la NOMMES. Une référence sans jeton que tu viens
d'écrire n'est pas une trouvaille, c'est ton lot. Le rapport : la tête d'`OU-EN-EST-ON.md` (ce que Grégoire verra : rien à l'écran,
une ouverture plus courte — et « vérifié comment » dit honnêtement que le chiffre attend sa porte), `#825` (temps 1 livré, temps 2
et 3 conditionnels à la rangée 2, référence de la rangée 1), l'ÉTAT MESURÉ de `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, et la
présente consigne commise avec le lot. **Ce qui remonte à Grégoire** : les mots du changelog (déjà dans la conversation Cowork),
rien d'autre — tout le reste se tranche et se dit en une ligne.
