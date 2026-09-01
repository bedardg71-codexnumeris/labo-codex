# Consigne de démarrage à froid — les sessions qui prennent le relais

> Écrite le **31 août 2026, en soirée**, par `kuekatsheu-14`, qui a coordonné un trio
> (`80`, `f2`) sur les **plans de travail issus des audits Fable 5**, plus une quatrième
> session (`c6`) pilotée directement par Grégoire sur un retour terrain de zoom.
> Elle **REMPLACE** celle du troisième trio.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ;
> c'est elle qui fait foi. Un nom qui ne peut pas rôtir vaut mieux qu'une date qu'on
> oublie de retirer.
>
> **↻ MISE À JOUR le 1er septembre 2026, FIN D'APRÈS-MIDI, depuis Claude Code.**
> (Troisième passe de la journée : Cowork au matin, Claude Code en fin de matinée,
> celle-ci après une session longue — #668 Lot 4 + #669, le Lot A, la release
> 1.106.15, puis #612.)
> **Trois sections refaites** : l'**état mesuré**, le **mandat**, et ce qui est **dû
> par Grégoire**. Tout le reste — les pièges, le moratoire, le protocole de créneaux,
> le bump à quatre emplacements — date du 31 août et **reste valable**. Ne pas le
> relire en diagonale sous prétexte qu'il est ancien : c'est la partie chère.
>
> ⚠ **Deux choses ont CHANGÉ depuis le 31 août et priment sur ce fichier** :
> `CLAUDE.md` (la règle de ce qui remonte à Grégoire) et `OBJECTIF-COHORTE-1.md`
> (les huit énoncés, désormais ARRÊTÉS). **Les lire tous les deux avant de coder.**

---

Ouvre le dépôt Monitorage_v6. Rituel d'abord : audit git + tests **avant** de croire la
moindre prémisse de ce fichier, puis lis le bloc en tête de `RELAIS.md`.

⚠ **Piège de démarrage payé six jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/` ne se
chargent PAS, en silence**. Lis leur fichier à la main.

---

## ⛔ AVANT TOUT — DEUX MESURES QUE PERSONNE N'AVAIT FAITES DEPUIS CINQ JOURS

**Elles prennent dix secondes et elles ont trouvé deux retards ce soir.**

```bash
git log --oneline origin/main..HEAD | wc -l    # doit rendre 0
```
⮕ À l'ouverture de ce cycle, il rendait **8** : tout le travail du troisième trio, **son
propre relais compris**, ne vivait que sur cette machine. Personne ne l'avait vu. Soldé.

```bash
cd tests && node ../scripts/verifier-playwright.mjs
```
⮕ **La suite Playwright n'avait pas tourné depuis le 26 août** — 299 commits, dont 35
touchant `tests/integration/`. Quand on l'a enfin lancée, elle était **rouge à deux**.
↻ **CORRIGÉ le 1er septembre : elle est VERTE, code 0, zéro échec.** Les deux spécs
incriminées passent en 6,9 s. ⚠ Et le mot juste est « passent », pas « ont été réparées » :
**personne ne les a touchées**. Même arbre, verdicts opposés à quelques heures d'écart —
leur diagnostic « ni contention ni flaky » du 31 août ne tient donc pas.

⚠⚠ **ET VOICI POURQUOI PERSONNE NE L'AVAIT VU — la chose la plus importante de ce
fichier. « PUSH RÉUSSI » NE SIGNIFIE PAS « SUITE COMPLÈTE VERTE », ET NE LE SIGNIFIERA
JAMAIS.** Le hook pre-push lance **Vitest seulement**. Pour Playwright, il constate
qu'aucun verdict local n'existe **et laisse passer**. Ce n'est pas une prudence, c'est
une **impossibilité structurelle** : la suite dure **plus de dix minutes** sur cette
machine — pas les « ~4 min » annoncés — et six minutes de silence ferment la connexion au
serveur (#533). **Le hook ne PEUT pas la lancer.**
⮕ Depuis le 26 août, **aucun push n'a été bloqué par un rouge Playwright, parce qu'aucun
push ne l'a jamais consultée.**
⮕ **Un spec seul se lance en secondes** et départage mieux qu'une suite complète :
`cd tests && npx playwright test integration/<spec>.js`. C'est ce geste qui a tranché ce
soir, après qu'un run de dix minutes eut été lancé pour rien.

↻ **1er SEPTEMBRE — LA MÉTHODE QUI FERME CE TROU, vérifiée quatre fois aujourd'hui.**
Le hook ne peut pas lancer la suite, mais **il sait lire un verdict**. L'ordre qui marche :
**committer d'abord**, puis `cd tests && node ../scripts/verifier-playwright.mjs`, puis
pousser. Le jeton porte alors le SHA du commit, et le hook affiche
« ✓ Sentinelle Playwright : **verdict vert à jour pour ce commit** » au lieu de
« aucun verdict local ». C'est la seule façon qu'un push soit réellement jugé.
⚠ **Un commit APRÈS le verdict le périme** : refaire dans cet ordre, ou accepter que le
push passe sans jugement. ⚠ Et `echo "CODE=$?"` après un `| tail` rend le code de `tail`,
pas celui du script : lire le **jeton** (`scripts/.verdict-playwright.json`), pas un code
de sortie tuyauté.

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF

Les trois gestes de l'écran Trimestres restent interdits. **La levée est une décision de
Grégoire, et il ne l'a pas prise.** Rien ce soir ne l'a approchée.

⮕ Toujours pas réparé, et à ne pas croire réparé :
- **le fichier « Exporter » n'a aucun chemin de restauration** ;
- **le snapshot d'archivage n'a aucun lecteur.**

**Le corpus de `file://` est le corpus RÉEL de Grégoire.** La bonne question n'est jamais
« puis-je me permettre de détruire » mais « **ai-je besoin de détruire pour prouver** ».

---

## ⚠⚠ LE PIÈGE QUI A COÛTÉ LE PLUS — LE BUMP A QUATRE EMPLACEMENTS, PAS TROIS

**`version.js` (RACINE) est le seul que l'application lise en `file://`.** C'est un
jumeau généré de `version.json`, créé parce qu'en `file://` **`fetch` et XHR sont refusés
par WebKit** (#495). Il est chargé par `index.html`, et `js/init-inline.js:235-237` lui
donne la **PRIORITÉ** :

```js
if (window.__VERSION__.build) BUILD_ID = window.__VERSION__.build;
```

⮕ **Les trois emplacements habituels (`version.json`, `init-inline.js`, `main.js`) sont
un REPLI. `version.js` décide de ce que Grégoire voit à l'écran.**

Ce soir, un bump `1.106.13 → 1.106.14` fait à la main sur trois emplacements a laissé
`version.js` en arrière : **l'application a continué d'afficher `1.106.13`**, et quatre
cas de `bandeau-maj-chargement.spec.js` ont rougi. Corrigé — **#665**, `e373bd8a`.

⚠ **Le bump MANUEL est le seul chemin qui puisse les désynchroniser** : `release.mjs`
écrit `version.json` et `version.js` ensemble et documente lui-même les 4 endroits. Or le
bump manuel est exactement ce qu'on fait quand plusieurs sessions partagent le dépôt et
qu'on refuse `release.mjs`, qui recalcule les jetons de tout l'arbre.

⮕ **RÈGLE : après tout bump manuel, `grep` l'ANCIEN build dans tout le dépôt et exiger
ZÉRO.** Vérifier « les quatre » ne suffit pas si on ne sait pas qu'il y en a quatre.
⚠ Le jeton de `version.js` suit un AUTRE format : **`MMJJHHMM`** (le build sans tiret),
pas le `AAAAMMJJ`+lettre des autres.
⚠ Et le hook pre-commit **refuse** un bump qui n'a pas bumpé les jetons de
`js/init-inline.js` et `js/main.js` — les deux fichiers que le bump lui-même modifie.

---

## ÉTAT MESURÉ — 1er SEPTEMBRE 2026, SOIRÉE

*↻ Réécrit en soirée, depuis Claude Code, après le chantier du matériel semé
(§1 à §4 du `PLAN-2026-09-01`, plus #681). Le bloc de fin d'après-midi qui suit
reste sous celui-ci : ce qu'il dit du build et des pièges vaut toujours.*

**Branche `main`. `HEAD` = `origin/main`, ZÉRO commit non poussé.** Mesuré après
le dernier push, pas supposé.

**Vitest : VERT — 431 fichiers / 4628 tests, code de sortie 0**, lancé DEPUIS
`tests/`, lu APRÈS le dernier changement.
**Playwright WebKit : VERT — code 0, aucune rougeur nouvelle**, suite complète
passée trois fois dans la soirée sur trois états successifs.

⚠ **Jetons anti-cache : jusqu'à `20260901e`.** Quatre lots ont bumpé dans la
soirée (`c`, `d`, puis `e`). Une session `file://` ouverte avant doit recharger.

**Dernier ID utilisé : #681.** Prochain libre : **#682**.
IDs consommés en soirée : **#680** (le canal de partage laisse des champs
d'échelle en chemin — INSCRIT, non traité), **#681** (`js/spe-specifications.js`
retiré — LIVRÉ et vérifié à l'écran).

### Ce que la soirée a livré, et ce qu'elle laisse

✅ **§4-1 et §4-2** — l'écran d'évaluation nomme ses trois pièces, et choisir une
grille sans échelle DIT ce qui manque (il ne produisait RIEN auparavant).
✅ **§1** — le versement des huit échelles « disciplinaires » est retiré : leurs
32 niveaux portaient `valeur:` et rendaient 0,0 % sans un mot.
✅ **§2** — `ECHELLE_IDME_DEPART` est semée, avec ses `valeurCalcul`. Mesuré de
bout en bout : espace vide → 79,5 % · niveau M, sans rien créer.
✅ **§3** — les trois pièces semées se disent « de départ » et non plus
« générique (exemple) ».
✅ **#681** — le module SPE autonome retiré (1009 lignes, zéro consommateur
vivant), vérifié à l'écran par Grégoire : cinq gabarits supprimés, deux
rechargements, aucun retour.
✅ **Le canal de partage** ne déshabille plus une échelle à `valeur:` (énoncé 6).

⏳ **CE QUI RESTE DÛ, et qui n'est PAS du code** :
· **la porte terrain du §3** — `plans de travail/PORTES-TERRAIN-2026-09-01-materiel-seme.md`,
  neuf portes, Mac **et** iPad. C'est la condition de fin de ce lot, et elle ne
  peut pas être remplie par un banc : un lot de libellés ne se prouve pas par un
  vert. ⮕ Si les neuf passent, le **geste 2** de `OBJECTIF-COHORTE-1.md` passe
  d'« éprouvé par Grégoire » à « fait ».
· **une décision de Grégoire** : le nom « Grille de départ » s'imprime sur le PDF
  de l'élève, sous « Évaluation : … ». C'est un mot que ses élèves lisent.

⚠⚠ **#674 A CHANGÉ DE POIDS, et c'est le fait le plus important de la soirée.**
Les deux sondes ont rendu ZÉRO sur le corpus de Grégoire — mais ce zéro ne couvre
que le sien. Un enseignant qui a ouvert l'application avant aujourd'hui a pu
ajouter l'échelle « Chimie » à sa sélection : **sa copie reste muette et rend
0,0 % sans un mot.** Il n'est ni sondable, ni joignable, et on ne sait pas
combien ils sont. ⮕ #674 n'est plus une prévention pour la cohorte qui arrive,
c'est une **réparation pour des utilisateurs déjà en place**. Le correctif devra
valoir RÉTROACTIVEMENT.

---

### Bloc précédent — fin d'après-midi (conservé)

**Version `1.106.15`, build `0901-1354`.** Release patch livrée
aujourd'hui — ⚠ ce n'est PAS le `minor` que le §4.3 de la consigne de #668 attend
à la FIN de ce chantier : les lots 5b et 6 restent dus, ce patch ne le consomme pas.

**`HEAD` = `origin/main` = `7a0b11e3`. ZÉRO commit non poussé.** Mesuré.

**Vitest : VERT** — 426 fichiers / 4601 tests, code de sortie 0, lancé DEPUIS
`tests/`, lu APRÈS le dernier changement.

**Playwright WebKit : VERT** — code 0, **baseline vide** (`echecsConnus: []`, donc
le vert veut bien dire zéro échec, aucune tolérance ne masque rien), et le jeton
porte `7a0b11e3`, le SHA exact de `HEAD`.

⚠ **Les jetons anti-cache sont à `20260901a`** (31 fichiers) **et `20260901b`**
(3 fichiers : `liste-evaluations.js`, `travaux-ui.js`, `styles.css`). Jour du BUILD.

**Dernier ID utilisé : #679.** Prochain libre : **#680**.
⚠ **#662 est toujours RÉSERVÉ** — les 4 gardes `IDS_GABARITS_HARDCODES` de `js/echelles.js`.
IDs consommés aujourd'hui : **#675** (anti-cache, deux bases de comparaison), **#676**
(CI, deux pannes), **#677** (le seuil 0,7125), **#678** (les `alert()` du parcours),
**#679** (aucune vérification des classes CSS employées).

**Backlog : 160 cases ouvertes** (hors blocs de code), toutes porteuses d'un `#NNN`.
Le Lot A du 1er septembre en a retourné 16 et fermé le doublon #427.

### ⛔⛔ LES DEUX DÉCISIONS À CONNAÎTRE AVANT TOUT LE RESTE

**1. Les notes d'A2025 et d'H2026 ne sont PAS rouvertes.** Décision pédagogique de
Grégoire, explicitement sans retour. Quatre notes faussées et déjà remises ont été
trouvées sur A2025 : **ne pas les rouvrir, ne pas proposer de les recompter, ne pas
les signaler.** Seul l'automne 2026 compte, et il est mesuré SAIN.

**2. `CLAUDE.md` A CHANGÉ AUJOURD'HUI, et c'est la règle qui te concerne le plus.**
Le défaut n'est plus « pose la question » — c'est **DÉCIDE, puis DIS-LE en une
ligne**. Tranche toi-même le technique et tout ce qui est **mesurable** : un doute
qui se lève par un `grep` n'est pas une question, c'est une mesure que tu n'as pas
faite. Ne remontent à Grégoire que : la pédagogie, ses données réelles, les mots que
ses élèves liront, ce qui l'engage publiquement.
⮕ **Lis `CLAUDE.md` en entier avant de coder.** Il porte aussi les TROIS ISSUES
d'une trouvaille (corriger / **inscrire — c'est le défaut** / commenter) et la
précision du 1er septembre : ces trois niveaux arbitrent du code **ÉTRANGER**. Une
classe que tu viens d'écrire sans la définir n'est pas une trouvaille, **c'est ton
lot qui n'est pas fini**. Le test : *est-ce que je viens de l'écrire ?*

**Puis `OBJECTIF-COHORTE-1.md`** : les huit énoncés sont **ARRÊTÉS** par Grégoire.
Liste FERMÉE. Toute trouvaille reçoit une seule question — est-ce que ça empêche un
des huit ? Non → inscrire et continuer.

### ⚠ CE QUE LA JOURNÉE A APPRIS, ET QUI COÛTERA CHER À QUI L'IGNORE

**UN BANC VERT PEUT COUVRIR UN ÉCRAN CASSÉ.** Le bandeau de #612 T6.4 portait une
classe CSS **définie nulle part** — il s'affichait sans encadré ni couleur. **Les
quatre specs Playwright de ce même lot étaient VERTS** : ils lisent le DOM et le
`textContent`, jamais le RENDU. Ni Vitest ni Playwright ne pouvaient le voir ; c'est
un `grep` qui l'a trouvé. ⮕ Inscrit en **#679**, non traité.

**TROIS CIBLES PÉRIMÉES DANS DES DOCUMENTS DU DÉPÔT, LE MÊME JOUR.**
`evaluation-calcul.js:869` (vraie ligne : **992**) · `sections-affichage.js` (vrai
nom : **`profil-etudiant-sections-affichage.js`**) · `confirmerImportPipeline`
(**n'existe pas** — c'est `executerImportPipeline`, `travaux-ui.js:3838`).
⮕ **RÈGLE, désormais inscrite en tête du plan de la chaîne d'importation** : `grep`
la cible AVANT de planifier le geste. Un plan est une intention datée, pas un état du
code. **Et corriger le document dans le MÊME commit que le code** — sinon la session
suivante cherche la même fonction inexistante.

**UN CADRAGE SE VÉRIFIE, MÊME QUAND IL EST BON.** Celui du 1er septembre annonçait
17 cases livrées : **#599 ne l'était pas**. Aucun commit ne le nomme, et le « LIVRÉ »
de sa fiche désigne le lot 4 de #522. ⮕ Une case retournée à tort coûte plus cher
qu'une case oubliée. **Le cadrage porte cinq marques ↻** là où le code l'a corrigé.

**UN EXTRACTEUR TROP LARGE MENT COMME UN ZÉRO SANS TÉMOIN.** Le premier break-test
du spec Playwright lisait la sortie TEXTE : il rendait « les quatre cas rouges » à
chaque mutation. Repris sur le reporter JSON, chaque mutation tue exactement son cas.
⮕ **Le pendant du zéro sans témoin : un rouge rassurant pour la mauvaise raison.**

**UN TÉMOIN VAUT PLUS QUE TROIS CAS POSITIFS.** Le cas 4 de `import-bandeaux-612`
(« un import normal n'affiche AUCUN bandeau ») est le SEUL que tue la mutation
`if (true)`. Sans lui, trois tests « le bandeau apparaît » passeraient au vert sur un
code qui avertit à chaque import.

---
## LES DEUX LOTS PRÊTS, SAUVÉS HORS DÉPÔT, NON DÉPOSÉS

⚠ **Aucun n'a obtenu son rouge d'abord sous vitest. Ils sont PRÊTS, pas FAITS.**
Les deux vivent dans `/Users/kuekatsheu/Documents/GitHub/lots-en-attente-2026-08-31/`,
**hors du dépôt**, empreintes vérifiées une par une. Chacun porte son propre fichier de
reprise — **lis-le avant de toucher au lot**.

- **`S9a-627/`** — unification des quatre remaps d'import. 16 fichiers, 408 Ko, patch de
  845 lignes, `git apply --check` code 0. Contient un **break-test rejouable** qui valide
  le témoin de chaque mutation avant de l'appliquer.
- **`S10a-628-659/`** — legacy des échelles, en deux gestes. **Le geste 1 (#659) est le
  seul correctif préparé qui arrête quelque chose d'ACTIF** : entrer dans la section
  Échelles écrit en base **à chaque visite, sans aucune action de l'utilisateur**.

---

## TRAVAILLER À PLUSIEURS SESSIONS — sept règles

*↻ Réécrit le 1er septembre 2026. L'ancien protocole de créneaux était tiré des
incidents ; celui-ci part des contraintes mécaniques de la pile, qui ne se
négocient pas.*

⮕ **Le test préalable, avant même de constituer une équipe** : *peut-on nommer
trois mandats dont les ENSEMBLES DE FICHIERS ne se croisent pas ?* Si non, une
seule session. Le travail du 1er septembre (#612 : `travaux-ui.js`, `styles.css`,
`index.html`, `tests/`) n'était pas séparable — trois sessions s'y seraient
piétinées toute la journée.

**1. Une seule session écrit dans `js/`.** Tout changement dans `js/` oblige à
bumper le bloc de jetons d'`index.html` (le hook l'exige) : deux sessions s'y
heurtent mécaniquement, quel que soit leur soin.

**2. Une seule session lance une suite.** Toutes les specs ouvrent le même
`index.html` en `file://` et partagent le `localStorage` de cette origine. Deux
suites concurrentes se polluent comme deux workers.

**3. La coordinatrice ne code pas.** Elle alloue les identifiants, tient
`BACKLOG.md`, fait transiter les patches d'une session à l'autre, écrit le
relais. Si elle code, elle devient une quatrième source de collision et plus
personne ne tient la carte.

**4. Chaque mandat NOMME ses fichiers.** Pas « fais #595 » — « tu touches
`styles.css`, rien d'autre ». Un mandat qui ne nomme pas ses fichiers ne peut
pas être vérifié disjoint.

**5. Aucune session ne pousse. La coordinatrice pousse.** C'est le 8 août en une
ligne : deux sessions parties du même commit, deux « 1.55.0 », les mêmes
identifiants.

**6. Une trouvaille hors de ses fichiers ne se corrige JAMAIS** — elle remonte à
la coordinatrice, qui l'inscrit. C'est l'issue 2 de `CLAUDE.md` appliquée au
parallélisme.

**7. Grégoire ne parle qu'à la coordinatrice.**
⚠ **C'est la règle qui cassera en premier**, et c'est prévisible : il répondra
naturellement à la session qui l'interpelle. Dès qu'il le fait, la coordinatrice
perd la carte et redevient un intermédiaire de plus. Si une session a besoin de
lui, elle passe par elle.

⮕ **Et la règle qui vaut toujours** : *parallélise la LECTURE, sérialise
l'ÉCRITURE.* Deux balayages en lecture seule menés en parallèle le 1er septembre
(carte des audits, mesure du chemin d'entrée) n'ont demandé aucune coordination
et n'ont couru aucun risque. Le triage des rapports orphelins, #595, la
documentation se séparent proprement. L'écriture dans `js/`, non.

---

## LA RELECTURE CROISÉE — à refaire, et voici la condition

Née d'une attente : Grégoire pilotait l'écran, le trio ne pouvait ni écrire ni rouler.
Chacune a relu le lot de l'autre. **Quatre défauts réels trouvés**, dont un `id:`
inconditionnel qui écrasait une valeur assainie sur un fichier sous surveillance sécurité.

⚠ **LA CONDITION, mesurée** : la relectrice avait **cartographié l'état AVANT** plutôt que
de lire le patch seul. *Lire un patch seul, c'est lire ce que l'auteur a décidé de
montrer.* Sa cartographie disait **où le risque naîtrait s'il naissait**.
⚠ **Piège** : un patch qui vit dans le scratchpad d'une session n'est pas relisible par
une autre. **Le faire transiter explicitement.**

⮕ **Et l'argument qui justifie tout le dispositif**, donné par la session qui en a fait
les frais : *on ne voit pas dans son propre code ce qu'on vient d'écrire, même quand on
sait exactement quoi chercher.* Elle avait nommé le risque en désignant la cible à sa
relectrice — **dix minutes après l'avoir commis**.

---

## ⚠ LES PIÈGES DE MESURE — ils ont frappé les trois sessions

**UN ZÉRO SANS TÉMOIN.** Cinq occurrences en une soirée. Un motif trop étroit rend un zéro
rassurant pour la mauvaise raison : `grep -c "config'"` qui n'attrape que ce qui est suivi
d'une apostrophe · `^/\*\*$` ancré sans tolérer l'indentation (2 au lieu de 6) ·
`grep -c 'configuration'` sur le mot NU, qui compte la prose des commentaires (**157 au
lieu de 45**).
⮕ **Le témoin d'un zéro, c'est LE MÊME MOTIF RENDANT NON-ZÉRO AILLEURS.** Publier les deux
comptes côte à côte.
⚠ À chaque fois le raisonnement tenait ; **le risque est pour l'ÉCRIT**. Un item qui porte
un nombre obtenu par un motif non dit est invérifiable dans six mois. **Inscrire la
MÉTHODE avec le nombre.**

**UNE ASSERTION PEUT ÊTRE VRAIE ET NE TUER AUCUNE MUTATION.** `toBeGreaterThanOrEqual(2)`
sur quatre appels : en retirer un en laisse trois, et `3 >= 2` reste vrai. ⮕ **Toute
assertion qui porte une borne : demander quelle mutation elle laisse passer.**

**UN BREAK-TEST VERT PEUT VENIR D'UNE MUTATION JAMAIS APPLIQUÉE.** ⮕ **Un témoin par
mutation, ciblé sur ce que CETTE mutation change**, lu AVANT de lancer.

**`head -n -1` N'EXISTE PAS SUR CE MAC** : il échoue, et sa redirection produit un fichier
de **0 octet** que `node --check` valide. ⮕ `sed '$d'`, et **mesurer l'EFFET après toute
réécriture**.

**`js/pratiques/` EST CITÉ À PLAT — trois fois en 24 h.** Le fait est juste, le chemin est
faux : personne ne remet le fait en cause, et personne ne peut le recouper. ⮕ `ls` avant
d'écrire un chemin.

**UN JSDoc N'EST RELIÉ À SA FONCTION QUE PAR LA POSITION.** Une extraction déplace le
corps ; la doc reste et change de sujet sans bouger. ⮕ **À quelle fonction ce bloc est-il
collé MAINTENANT ?**

**LE GARDE ANTI-CACHE NE SURVEILLE QUE `main.js`.** Tout autre fichier corrigé peut
arriver **périmé** dans un navigateur sans aucun signal — Grégoire a jugé Safari sur du
code qui n'était pas celui du disque. ⮕ **Une porte terrain rendue sans bump vérifié porte
sur du code inconnu.**

---

## LE MANDAT DE LA PROCHAINE SESSION — Lot B, le mot « français » dans le PDF

> ↻ **CONFIRMÉ le 1er septembre au soir par Grégoire, depuis Cowork.** Ce mandat
> tient : il n'a PAS été fait. La journée du 1er est passée par le plan du semis
> (§1, §2, §4-1, §4-2 livrés, plus `js/spe-specifications.js` retiré en #681), et
> le §3 de ce même plan est en cours au moment où ceci s'écrit. **Le Lot B est le
> premier geste de la session suivante**, avant tout le reste.
>
> ⚠ Cette section est tenue par Cowork (règle de `CLAUDE.md`, « qui écrit quoi
> dans la consigne de démarrage »). Une session qui rend son état mesuré ne la
> réécrit pas : elle réécrit l'ÉTAT, au-dessus.

⮕ **Lis d'abord, dans cet ordre** : `CLAUDE.md` (il a changé), `OBJECTIF-COHORTE-1.md`
(les huit énoncés arrêtés), puis
`plans de travail/CONSIGNE-2026-09-01-pret-pour-les-nouveaux-utilisateurs.md` §2.
La séquence y est fixée par Grégoire ; **ne la réordonne pas**.

**Le critère, dans ses mots** : « je veux que l'application fonctionne, qu'il n'y ait
pas d'erreurs, et que rien ne soit codé en dur » — *codé en dur* = sa pratique
d'enseignant de littérature gravée dans le code que d'autres disciplines utiliseront.

**Le défaut, en une phrase** : `synthese-retroaction-rendu.js:510` imprime
« **Français écrit** · 2 catégories les plus fréquentes » **dans le PDF remis à
l'élève**. Un enseignant de chimie qui compte des erreurs voit son critère rebaptisé
« français » dans la copie de son élève.

**Huit littéraux, VÉRIFIÉS LIGNE À LIGNE le 1er septembre** — deux natures, à ne pas
traiter pareil. Le détail est dans #581, réécrit aujourd'hui, et au §2 de la consigne.
· **(A) En-têtes et libellés** → doivent porter le **nom du critère tel qu'il est dans
la grille**, déjà disponible. Aucun registre à créer.
· **(B) Phrases engendrées** → même geste que #667 et #668 : un modèle réglable depuis
le gabarit. ⚠ « **rédaction** » est aussi faux que « français » pour qui compte autre
chose. ⮕ Réutilise le patron de `js/evaluation-projection.js` — registre pur, testable
en Node, migration à la lecture **au caractère près**, schémas FERMÉS pour le transport.

⛔ **NE PROPOSE AUCUNE RÉGÉNÉRATION DE MASSE.** Changer une phrase engendrée ne change
QUE les évaluations à venir ; les anciennes portent leur texte **gelé** dans
`donneesAlgorithmiques[id].retroaction`, et régénérer écraserait le paragraphe de
catégorie dominante. Leçon du 31 août.

**Fini quand** : un critère algorithmique nommé autrement que « Français écrit »
produit un PDF où le mot « français » n'apparaît nulle part, sauf si l'utilisateur l'a
écrit lui-même.

⚠ **Le périmètre inclut le bloc des balises d'`index.html`** — tout lot touchant un
`js/` l'exige (le hook réclame un jeton neuf). L'inscrire dès le mandat.

---

## SI GRÉGOIRE VEUT AUTRE CHOSE — choix fermé

**(a)** **#651** — depuis la Liste, « annoter » ouvre la page **sans aucune palette**
quand on vient du mode Évaluer. Retour terrain avec capture, cause LUE mais **jamais
mesurée**, aucun commit correctif. *C'est le geste le plus fréquent de son travail
réel.* **Mesurer avant de corriger.**
**(b)** **#674** — la note qui monte en silence quand un critère reste sans niveau.
⚠ **REQUALIFIÉ le 1er septembre : ce n'est PLUS de la prévention.** La sonde rend zéro
écart sur le corpus de Grégoire, mais un enseignant qui découvre l'interface oubliera
un niveau bien plus souvent que lui. Improbable pour lui, **probable pour la cohorte**.
La forme est déjà tranchée : persister `ponderationTotal` à côté de `noteFinale` — pas
un état « brouillon / conclue », explicitement écarté. Le §3 de la consigne porte le
raisonnement complet : **ne pas le reclasser**.
**(c)** **Déposer les deux lots préparés hors dépôt** (`S9a-627`, `S10a-628-659`). Le
geste 1 de S10a est le seul correctif prêt qui **arrête quelque chose d'ACTIF** :
entrer dans la section Échelles écrit en base à chaque visite, sans aucune action.
**(d)** **#668 lot 5b** (sentinelles du branchement). Le lot 6 est ⛔ **BLOQUÉ** sur la
décision du doublon ; le lot 3b est du confort, sans échéance.

⮕ **Une seule décision principale par session.**

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

- **Le test manuel de #612** : (1) `12345678_devoir.pdf` dans un groupe où ce DA
  n'existe pas → bandeau AVANT, ligne « Non associé » APRÈS ; (2) sans groupe-cours
  actif, tenter un import → refus dit, aucun fichier écrit. *(Les quatre cas sont
  désormais des specs Playwright — ce test manuel ne vérifie plus que le rendu réel.)*
- **Effacer `_to_delete/`** à la racine (déjà dans `.gitignore`).
- **Le facteur de normalisation 500 → 600** sur *Grille-1 FR-ALGO seul A26*.
  ⚠ **Entre deux évaluations, jamais au milieu d'une correction** : deux copies notées
  sous deux facteurs différents ne sont pas comparables.
- **La règle métier de #560** : que doit emporter la suppression d'un fichier ?
- **Les portes terrain jamais relevées** : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- **Le nom du service d'aide** pendant la transition CAF → Passerelle +.
