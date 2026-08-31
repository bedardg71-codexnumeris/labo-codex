# Consigne de démarrage à froid — les sessions qui prennent le relais

> Écrite le **31 août 2026, en fin de journée**, par `kuekatsheu-c8`, qui a coordonné
> deux sessions parallèles (`kuekatsheu-4c`, `kuekatsheu-67`) sur les correctifs
> d'audit. Elle **REMPLACE** la consigne du matin, qui décrivait S5 comme BLOQUÉ.
> Il ne l'est plus. Tous les chiffres ci-dessous ont été mesurés.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête,
> c'est elle qui fait foi. Un nom qui ne peut pas rôtir vaut mieux qu'une date qu'on
> oublie de retirer.
>
> ▣ **Vous êtes TROIS sessions, dont une COORDINATRICE.** Lisez le §« Comment se
> coordonner » avant d'écrire une ligne : ce qui a fonctionné aujourd'hui y est écrit,
> et ce qui a coûté du temps aussi.

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis le bloc en tête de `RELAIS.md`.
On est à la **1.106.13** (build `0831-0734`) — **aucune release aujourd'hui**, mais
des jetons `?v=` ont bougé : **recharge ta session `file://`**.

⚠ **Piège de démarrage payé trois jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/`
ne se chargent PAS, en silence**. Lis leur fichier à la main.

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF, ET CE N'EST PAS UN OUBLI

Les trois gestes de l'écran Trimestres restent interdits. Le code de S4 / #622 est
livré depuis le 31 août au matin, et **S5 a refermé le régime des cartouches** — mais
**la LEVÉE est une décision de Grégoire, et il ne l'a pas prise.** Ne la présente pas
comme une formalité et ne la prends pas à sa place.

⮕ Ce que S5 n'a PAS réparé, et qu'il ne faut pas croire réparé :
- **le fichier « Exporter » n'a toujours aucun chemin de restauration** ;
- **le snapshot d'archivage n'a toujours aucun lecteur.**

---

## OÙ EN EST S5 / #623 — LE GROS DU TRAVAIL EST FAIT

Le régime des cartouches est passé de GLOBAL à NAMESPACÉ par trimestre. Quatre volets,
tous écrits, tous dans le même commit :

| Volet | Ce qui a été fait |
|---|---|
| **(a) Routage** | `cartouches_<grilleId>` retirée des deux disjonctions « clé globale » de `cle()` et `cleSource()` ; deux branches explicites la namespacent. Le bloc « Cas 2 » et son **repli silencieux** vers la clé globale sont retirés. |
| **(b) Migration au boot** | `migrerCartouchesVersNamespace()` — copie vers **chaque** trimestre, drainage, **relecture de chaque copie**, et suppression des clés nues seulement si tout se relit. Appelée dans `js/main.js` **après** `migration_modeles_namespacees_done` (ordre contraint). |
| **(c) Archivage** | Le snapshot lit la clé namespacée par `cleSource(..., trimestreId)` et n'écrit plus rien. La branche cartouches de `purgerCopiesModelesArchive` est **retirée** — namespacée, elle détruisait la seule donnée du trimestre désarchivé. |
| **(d) Les sites** | **54 sites routés** sur les 64 réellement nus. |

### ⚠ LE FIL DE DÉTENTE — la pièce à ne pas retirer

Si des cartouches vivent **encore sous la clé nue**, `creerSnapshotRessources` **REFUSE
d'archiver** et **NOMME les grilles** concernées, au lieu d'écrire un snapshot amputé.
Et `archiverTrimestre` **lit ce refus AVANT** de poser le moindre drapeau.

⮕ **Les deux moitiés comptent.** La première version du garde était décorative :
l'appelant ne lisait pas son retour et archivait quand même. Un refus RENDU n'est pas
une exception — rien ne l'attrape tout seul.
⮕ Verrouillé par deux break-tests DISTINCTS. Si tu n'en vois qu'un rougir en mutant,
c'est que tu as muté la mauvaise moitié.

### CE QUI RESTE DE S5, ET RIEN N'EST BLOQUÉ

1. **Une spec WebKit dédiée.** ⚠⚠ **Ne crois pas ce lot couvert par ses 4452 tests
   Vitest : il ne l'était pas.** Le push a été refusé par la sentinelle Playwright,
   8 specs rouges, dont une perte fonctionnelle réelle — le matériel démo posé sous la
   clé nue, et une prémisse morte qui rendait l'import inter-trimestre invisible. La
   suite est verte depuis, mais **aucune spec ne vise S5 nommément**.
   Dix sites peuplent des `<select>`, et l'annonce de partage
   est un `<p>` dans une modale : **Vitest ne voit rien de tout ça**. ⚠ Pour que la
   phrase d'annonce s'affiche, il faut une grille présente dans **deux** trimestres —
   sans quoi le test ne mesure rien.
2. **Les 15 sites de `scripts/` (#636).** ⚠ **Deux familles, deux remèdes** : les 6 de
   `restaurer-isoler-cartouches-A25.mjs` adressent un objet en mémoire et **ne doivent
   PAS être routés** ; les autres adressent le magasin et **mentiront par ZÉRO** — et
   un diagnostic qui rend zéro se lit « rien à réparer ». `cle()` n'existe pas en
   console : c'est une question de conception, pas un geste de routage.
3. **Le manifeste du fichier `.lcz` ne porte pas le trimestre source.** Le schéma est
   **fermé** (`partage-schemas.js:22` : champ inconnu = rejet) : l'y ajouter ferait
   rejeter le paquet par notre propre auto-contrôle. L'utilisateur le voit avant
   d'envoyer, le fichier ne le porte pas. **Item à ouvrir si Grégoire le veut.**

---

## ⏳ DÉCISION DE GRÉGOIRE DÉJÀ PRISE — NE LA REDEMANDE PAS

**Une grille partagée qui vit dans deux trimestres : les cartouches envoyées sont
celles du TRIMESTRE ACTIF**, et l'export **le dit** dans `confirmerExport`.
Tranché le 31 août. La phrase n'apparaît que si la grille existe réellement dans
plusieurs trimestres.

---

## PIÈGES DÉJÀ PAYÉS — ne les réapprends pas

· ⚠⚠ **NOS COMMANDES NE VOIENT PAS TROIS FORMES, et le dossier a sous-compté CINQ
  fois à cause d'elles.** Un grep raisonne par ligne ; le code, non.
  **(1) frontière de PORTÉE** — `function f(cle)` masque `cle()` ; aucune de nos
  commandes ne cherchait la forme « paramètre ».
  **(2) frontière de LIGNE** — composition en N, routage en N+1.
  **(3) suffixe FIXE** — `'cartouches_GRILLE_GENERIQUE'`, invisible à qui cherche
  `${` ou `+`.
  ⮕ **Le remède n'est pas un meilleur motif : c'est de changer d'outil** dès que la
  question porte sur une portée ou sur le trajet d'une variable.
  ⚠ **Et ce ne sont pas des faux positifs : ce sont des ANGLES MORTS.** La nuance
  décide. Un faux positif se remarque et se corrige ; un angle mort laisse passer.
  Le cliquet statique de `sentinelle-522-lot3b` ne VOIT pas la forme « composition en
  N, routage en N+1 » — un site de cette forme qui OUBLIERAIT de router lui serait
  tout aussi invisible. Sans conséquence aujourd'hui (il ne lit que `cartouches.js`
  et `import-export.js`), mais **étendre son périmètre à `partage-*.js` exige
  d'élargir son motif DANS LE MÊME GESTE** — sinon on se croit couvert là où on ne
  l'est pas. Les deux emplacements de la forme : `js/partage-export.js:64` et
  `js/partage-format.js:170`.
· ⚠⚠ **UN TÉMOIN RESTÉ VERT VAUT PLUS QU'UN ROUGE OBTENU.** Trois dispositifs se sont
  révélés sans effet aujourd'hui, **tous démasqués par une mutation, jamais par une
  relecture** : une clause de recensement morte, le forçage IndexedDB (qui ne
  discrimine RIEN sur un routage de clé — il ne vaut que pour une COURSE), et un refus
  que personne ne lisait. **Une garde à qui on prête un mérite qu'elle n'a pas finit
  par servir d'alibi.**
· ⚠ **`cle()` route par le trimestre ACTIF.** Une fonction qui reçoit un `trimestreId`
  en paramètre doit employer `cleSource(..., trimestreId)`. J'ai failli remplir un
  snapshot avec les cartouches d'un autre trimestre — dans une fonction dont le fichier
  **documentait déjà ce piège dix lignes plus haut**. Un piège écrit en commentaire
  n'arrête personne ; une sentinelle si.
· ⚠ **ASSERTE LE RÉSULTAT, JAMAIS LE MOYEN.** Une assertion branchée sur le mécanisme
  meurt avec lui au premier refactor. Celles qui portent sur l'effet ont survécu.
· ⚠ **À trois sessions, un rouge VOLONTAIRE posé sur disque bloque tout le monde** :
  le hook pre-push teste l'ARBRE. Développe un banc rouge **hors** de `tests/`, lance-le
  par chemin absolu, et ne le déplace qu'une fois vert. `playwright.config.js:8`
  collecte `tests/integration/` en entier — le préfixe `_tmp-` ne protège de rien.
· ⚠ **Deux runs Playwright concurrents partagent le `localStorage` de l'origine
  `file://`** et faussent les deux verdicts. Un seul à la fois, annoncé.
· ⚠ **Un run Vitest lancé pendant qu'une autre session écrit un fichier de test rend
  des `ReferenceError` fantômes.** Relance avant de conclure.
· **Lis le CODE DE SORTIE, jamais « N passed »** — et **jamais `$?` après un pipe** :
  en zsh il rend le code de `tail`, pas celui de `vitest`. Erreur commise trois fois
  aujourd'hui, par deux sessions.
· **Vitest se lance depuis `tests/`.** Node n'a pas d'IndexedDB. Ferme GitHub Desktop
  avant Playwright.
· `git commit -m "…"` : zsh exécute les backticks. Toujours `-F -` avec `<<'EOF'`.
· **Le jeton anti-cache voyage dans le MÊME commit que son `js/`**, et il porte le jour
  du BUILD. Ignore le conseil affiché par le hook.

---

## COMMENT SE COORDONNER — ce qui a marché aujourd'hui

· **La coordinatrice tient trois choses, et elle seule** : les identifiants de backlog,
  les commits, et le jeton anti-cache. Zéro collision d'index en une journée à trois.
· **Un périmètre de FICHIERS par session**, jamais un périmètre de sujet. Aucun fichier
  partagé — c'est ce qui a permis d'écrire en parallèle sans staging acrobatique.
· **La coordinatrice lit le diff ENTIER avant de committer.** À trois sessions, un
  `--stat` repère un fichier étranger, pas un bloc étranger.
· ⚠ **Toute consigne d'attente doit avoir une fin explicite.** J'ai écrit « n'exécute
  rien tant que je ne te signale pas la fin » et j'ai oublié le signal : une session est
  restée bloquée longtemps, correctement. **Dis toujours « cycle fini ».**
· **Exige un rouge OBTENU par cas, et demande ce qu'il accuse** — pas « c'est rouge ».
· **Ne prends aucune mesure de seconde main pour un fait.** Deux fois aujourd'hui, une
  session a rapporté un chiffre qu'une contre-mesure a corrigé — dans les deux sens.

---

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

**(a)** **Fermer S5** — la spec Playwright (le rendu n'est prouvé par rien) puis
**#636**, les 15 sites de `scripts/`. C'est le seul lot dont une partie est
**mesurément fausse** après aujourd'hui : ces outils mentiront par zéro.
**(b)** **S6 / #624** — débloqué, S5 étant livré. `donnees-v2.js` devient correct tout
seul. L'écart le plus actionnable est vérifié : `supprimerGrilleActive`
(`js/grilles.js`) ne vérifie AUCUNE dépendance, alors que son jumeau délègue en deux
lignes au chemin gardé — **le patron existe six lignes plus haut**.
**(c)** **S9 / #627** — libre. ⚠ **Plus petit qu'annoncé sur trois implémentations sur
quatre** : le remède tient dans `fusionnerParIdentite`, un helper partagé par **cinq**
collections, qui connaît la paire `ancienId → nouvelId`, la DIT en `console.warn`, puis
la jette. Voir la correction additive du 31 août dans le rapport Z2.
**(d)** **#639** — retirer l'entrée `avis-identification-2026-09-01`, devenue du code
mort au message faux. ⚠ **Aucun rouge ne viendra le rappeler** : sa spec a été mise
sous date simulée pour cesser d'être une sentinelle à retardement. Le retrait sera
volontaire, ou il n'aura pas lieu.

⮕ **Une seule décision principale par session.** S5 et S6 ne se mènent jamais en
parallèle : mêmes fichiers.
