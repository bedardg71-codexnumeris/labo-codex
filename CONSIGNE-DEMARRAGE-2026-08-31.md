# Consigne de démarrage à froid — 31 août 2026

> Écrite le 30 août 2026 à 19 h 50 par la session `kuekatsheu-0d`, sur le modèle
> de `Modèle de consigne de démarrage à froid.txt`. À coller telle quelle dans
> une session fraîche. Les chiffres qu'elle contient ont été mesurés, pas repris.

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis la section « POUR LA SESSION QUI PREND
LE RELAIS — 30 AOÛT 2026, 19 h 50 » en tête de RELAIS.md. On est à la 1.106.11
(build 0830-1525), mais **le dépôt est à trois commits d'avance sur `origin/main`
et la release qui les couvre n'est pas lancée** — c'est le premier point ci-dessous,
pas un oubli.

TU N'ES PAS SEUL DANS L'ARBRE — VÉRIFIE AVANT D'ÉCRIRE
Deux sessions travaillaient hier soir : `kuekatsheu-ff` sur S5 (#611,
`js/travaux-import.js`) et `kuekatsheu-00` sur S6 (#612, `js/liste-evaluations.js`,
`js/evaluation-jetons.js`, `js/travaux-ui.js`). Lance `ListAgents` AVANT tout : si
elles sont vivantes, tu tiens les fichiers partagés (BACKLOG, SESSION, RELAIS, le
plan) et tu ne touches à aucun `js/` sans le leur dire. Si elles sont mortes,
commence par vérifier que leur travail est commité — trois sessions sont mortes le
30 août à 19 h 05 avec leur travail dans l'index et dans l'arbre, et c'est ce qui a
occupé toute la session `0d`. Le découpage index / arbre porte de l'information :
ne l'aplatis jamais par un `git add -A`.

PREMIER POINT — LA RELEASE GROUPÉE, QUI N'ATTEND QUE MON GO
Trois commits locaux non poussés : `f2d661dd` (S7 / #613), `9dac5f49` (S4 / #610),
`f419c467` (tableau d'état). Ils sont vérifiés — Vitest 410 fichiers / 4307 tests
et Playwright WebKit 210/210, code de sortie 0 pour les deux, mesurés sur
`f419c467` arbre propre. Ne les re-teste pas si l'arbre n'a pas bougé.
J'ai décidé UNE SEULE release groupée pour S4 + S7 + S8, motif mesuré :
`release.mjs:189-214` réunit l'arbre ET tout ce qui a changé depuis la release
précédente, donc une release lancée trop tôt bumpe les `?v=` de fichiers que les
autres sessions n'ont pas commités. Demande-moi le go, et attends que S5 et S6
soient commitées. Ordre imposé : `release.mjs` → changelog → commit → sentinelle
anti-cache (jamais la sentinelle avant le commit de release, elle rend 13 faux
rouges).
⚠ Le hook `pre-push` teste l'ARBRE, pas les commits envoyés : tant qu'une session
sœur est entre son rouge et son vert, son rouge n'a aucun rapport avec ce qu'on
pousse.

PRIORITÉ DATÉE — À TRAITER AVANT TOUT AUTRE CHANTIER
#427 + #508, échéance DEMAIN le 1er septembre, décision déjà prise (option A, je
tiens la date). Deux versants : ce qui est dû par moi dans la console Cloudflare
(les trois noms, la durée de session, la règle Include), et ce qui est dû côté code
le jour même — réécrire le paragraphe d'accueil au présent dans js/accueil.js. Les
deux textes sont écrits d'avance au §7 de
`plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md` ; le choix se fait le
jour même. Le bandeau s'éteint seul, il n'y a rien à retirer à la main.

CE QUI N'EST DÛ QUE PAR MOI — RAPPELLE-LE-MOI, NE LE CONTOURNE PAS
Six tests manuels s'accumulent depuis hier, un par session livrée. Aucune session
ne peut les faire à ma place, et ils gardent six correctifs à l'état « non vérifié
sur l'appareil » :
· S1 — retirer un jeton : la ligne de l'originale doit rouvrir le fichier ORIGINAL.
· S2 — `maxParProduction = 1` puis un troisième fichier : plus de bouton « jeton ».
· S3 — lot de photos iPad avec deux homonymes : chaque élève reçoit SA copie.
· S4 — recharger en cours d'import, re-déposer deux homonymes de tailles
  différentes : aucun doublon muet, aucun blob sous le mauvais DA.
· S7 — importer un ZIP dont un blob est corrompu : « Import partiel » avec le
  compte, la visionneuse dit « manquant », jamais « Import réussi ».
· S8 — ouvrir un codex contenant un fichier piégé : la fusion doit le refuser.
Mac ET iPad pour ceux qui touchent une modale ou le stockage.

ENSUITE — propose-moi un choix fermé entre :
(a) S9 / #615 — le lot des mineurs de l'audit d'importation (M1 à M4, M10). Sept
    tâches, aucune décision à prendre, D3 déjà tranchée (option A : « Renommer pour
    distinguer » part avec `renommerDoublon` et `renommerFichierDansFile`). Ferme le
    plan d'importation côté code. ⚠ Touche `travaux-ui.js` et `travaux-import.js` :
    ne l'ouvre pas tant que S5 et S6 courent.
(b) S10 — les sept tests sur appareil, avec moi. C'est le seul lot qui traite les
    angles morts de l'audit (ordre de la FileList au re-dépôt, veille de l'iPad en
    cours de lot, quota IndexedDB à 100 %, 450 fichiers dans la liste). À faire
    quand j'ai l'iPad sous la main, pas à la fin d'une journée.
(c) #616 — les sentinelles qui bornent par DISTANCE et non par branche. Mesuré le
    30 août : 32 fichiers de `tests/unit/` portent un `{0,NNN}`, dont 31 lisent de la
    source. Verts aujourd'hui, faux demain au premier commentaire ajouté ou retiré.
    Le helper `corpsSansCommentaires(src, signature)` existe déjà, écrit pour #613.
(d) La divergence fail-open de `js/codex.js`, laissée ouverte par la session e8 :
    la FUSION est passée fail-closed (un blob sans magic bytes est refusé), le chemin
    « ouvrir » ne l'est pas. C'est un arbitrage que tu dois me demander, pas trancher.

DEUX ITEMS À NE PAS OUVRIR SANS MESURER D'ABORD
#618 : `supprimerEvaluation` traite `'quota'` comme un succès —
`sauvegarderDonneesSelonMode` rend `false`, `true` OU la chaîne `'quota'`, et
`liste-evaluations.js:2081` teste en truthy. Avant d'ouvrir : compte les autres
appelants qui font le même test. Le nombre décide de la taille du chantier.
#596 : l'énoncé dit « 6 clés, 5 fichiers » ; la mesure du 30 août donne 11 fichiers
et ~17 clés. Tranche le périmètre avant de commencer.

PIÈGES DÉJÀ PAYÉS — ne les réapprends pas
· Les diffs de `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md` sont des
  ESQUISSES, pas des spécifications. Quatre appliqués, quatre corrigés à
  l'application. Ouvre le code de référence que le diff invoque, et grep TOUS les
  `return` avant de changer une forme de retour.
· Un refus RENDU n'est pas une exception. Lis la valeur rendue AVANT tout geste
  destructeur — inverser l'ordre ne suffit pas, il faut le test explicite.
· getSync ne protège d'aucune course : dans db.set, l'écriture IndexedDB est
  attendue AVANT le rafraîchissement de localStorage.
· Un banc Vitest ne voit pas une course d'écriture : Node n'a pas d'IndexedDB.
  Force db.useIndexedDB avec une fausse connexion, sinon le test est vert sur du
  code cassé. Patron dans sentinelle-522-pratiques-serialisees.
· Vitest ne voit pas le rendu : il tourne dans node. Une modale se teste par sa
  DÉCISION au banc, et par Playwright ou un test manuel pour son affichage.
· Vitest se lance depuis tests/. Lis le CODE DE SORTIE, pas « passed » : `vitest run`
  sort en 1 sur une erreur non gérée, tests verts compris.
· Ferme GitHub Desktop avant Playwright, et n'ÉCRIS pas dans js/, index.html ou
  tests/ pendant qu'il tourne — les specs lisent l'arbre en direct. En revanche
  `git status`, `git log` et `git diff` ne modifient rien : ils sont sans danger.
· Sur BACKLOG.md, SESSION.md, RELAIS.md et les plans, `git diff --cached --stat`
  repère un fichier étranger, PAS un bloc étranger dans un fichier attendu. Lis le
  diff stagé ENTIER avant de committer, et `git commit` SANS nommer de chemin quand
  tu commites un index préparé — tout chemin passé au commit reprend l'ARBRE.
· `git commit -m "…"` : zsh exécute les backticks et efface les noms de symboles en
  silence. Toujours `-F -` avec `<<'EOF'`.
· Inscris un #NNN dans BACKLOG.md AVANT de l'employer. Dernier utilisé au 30 août au
  soir : #618 (#617 et #618 attribués à kuekatsheu-00 pour ses trouvailles).
