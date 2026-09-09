# Consigne de démarrage à froid — les sessions qui prennent le relais

> **Réécrite le 8 septembre 2026, en début d'après-midi, par Cowork.**
> **Elle REMPLACE la version du 5 septembre au soir**, qui annonçait `1.122.0` et renvoyait vers
> `plans de travail/CONSIGNE-PROCHAINE-SEANCE.md` — **un fichier qui n'existe plus** : son contenu a
> été promu en `CONSIGNE-DU-JOUR.md`, comme son en-tête le prescrivait, et le renvoi est resté
> pendant trois jours à pointer dans le vide. Le tableau du tri du 2 septembre est gardé en fin de
> fichier.
>
> ⚠ **Nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Ce fichier ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû.
>
> ↻ **État mesuré remplacé le 9 septembre 2026 au soir par Claude Code**, à la demande de Grégoire,
> après un rituel de début de session qui a trouvé ce fichier périmé de trois versions. Seul l'ÉTAT
> MESURÉ a changé de main : **le mandat et la séquence restent à Cowork** (`PROTOCOLE.md`, « Qui écrit
> quoi dans la consigne de démarrage »). Ce qui a périmé dans la séquence est signalé où il l'est,
> **sans être réécrit**.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — comment nous trois travaillons ensemble. Sept règles.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur. Sa tête porte `1.124.3`.
3. **`plans de travail/CONSIGNE-SUIVANTE-menage-documentaire.md`** — **court, et il passe en
   premier** : deux traces manquantes dans `SESSION.md`, une branche à retirer. Aucun code touché.
4. **`plans de travail/CONSIGNE-DU-JOUR.md`** — **le vrai chantier de la journée** : le dépistage du
   français en première semaine. Écrite le 7 au soir, maintenue par Grégoire le 8. Une seule consigne
   du jour à la fois ; c'est celle-là.
5. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés).

Puis le rituel : skill `debut-de-session-labo-codex`.

⚠ **Mesuré le 9 septembre au soir — deux entrées de cette liste ont périmé.** Le point 2 annonce une
tête d'`OU-EN-EST-ON.md` à `1.124.3` : elle est à **`1.127.2`**. Le point 3 (`CONSIGNE-SUIVANTE-menage-
documentaire.md`) est **livré** — le bloc `SESSION.md` manquant a été écrit le 8 (`f5334e86`), et la
branche `claude/consigne-du-jour-wybfs0` **existe toujours sur `origin`**, sa suppression revenant à
l'instance qui l'a poussée. Le point 4 renvoie à la consigne du dépistage du français : elle a été
**archivée le 9 au soir sans avoir été exécutée**, remplacée par la consigne du jour du 9 à 19 h 05
(le texte d'accueil de l'Aide), elle-même **exécutée et livrée en 1.127.2**. Il n'y a donc, ce soir,
**aucune consigne du jour en attente** : la suivante revient à Cowork.

---

## ÉTAT MESURÉ — 9 SEPTEMBRE 2026, 19 H 30 (TORONTO)

▣ **Mesure de CLAUDE CODE, dans l'arbre, chaque ligne avec la commande qui la produit.** Elle remplace
celle du 8 septembre, périmée de trois versions mineures. ⚠ Un état mesuré vieillit en heures : sept
versions sont sorties le 9. **Remesure, ne recopie pas.**

- **`main` = `c8b7fc5d`**, version `1.127.2`, build `0909-1912` (`git log --oneline -1`,
  `cat version.json`). Sept livraisons le 9 : `1.125.1`, `1.125.2`, `1.126.0`, `1.126.1`, `1.127.0`,
  `1.127.1`, `1.127.2`.
- **`origin/main` = `main`** après le push du soir (`git fetch && git rev-list --count origin/main..HEAD`
  rend `0` ; témoin : le même compte rendait `1` avant le push, un commit de porte terrain attendait
  depuis 18 h 52).
- **Arbre propre** : aucun fichier modifié, **aucun fichier non suivi** (`git status --short -uall` ne
  rend rien). La liste des non-suivis de la version du 8 est donc entièrement épuisée. `_to_delete/`
  existe toujours, **douze fichiers**, mais il est dans `.gitignore` (l. 134) : il ne remonte plus au
  statut, il attend toujours le geste de Grégoire.
- **Tests** : Vitest **518 fichiers / 5703 essais, 0 échec** (`cd tests && npm run test:unit`) ; verdict
  Playwright local pris sur le SHA poussé, baseline des rougeurs connues **à 0** depuis le 9 en fin
  d'après-midi (elle déclarait faussement zéro depuis le 26 août, corrigée le 8, puis vidée pour de
  vrai quand les quatre essais menteurs ont été réparés).
- **`RELAIS.md`, `SESSION.md` et `OU-EN-EST-ON.md` sont à jour au 9 au soir** — les trois ont été
  remis à niveau ce soir-là ; `SESSION.md` portait **vingt-trois commits sans trace** (bloc SESSION 37).
- **Une branche vivante sur `origin`** : `claude/consigne-du-jour-wybfs0`, absorbée dans `main` mais non
  supprimée (sa suppression revient à l'instance qui l'a poussée).
- ⚠ **`.git/` porte treize verrous résiduels renommés depuis le 27 août**, et un `HEAD.lock` vide daté
  de 18 h 52 a bloqué un commit le 9 au soir. Défaut récurrent, jamais traité : si un commit échoue sur
  « Unable to create … .lock », vérifier l'horodatage et l'absence de processus git avant de l'écarter.

### Le retour testeur du 7 septembre : ce n'était pas un bug

**« L'enregistrement semble instable. J'ai dû saisir et enregistrer les présences à plusieurs
reprises. »** ⮕ **REQUALIFIÉ le 8 septembre, et ce n'est pas un défaut du code.** Grégoire a ouvert
l'application à DEUX adresses cet automne — son fichier local (`file://`) et
`https://app.codexnumeris.org`. Ce sont deux **origines** au sens du navigateur : `localStorage` et
IndexedDB y sont cloisonnés, rien ne passe de l'une à l'autre. Il saisissait d'un côté et cherchait
de l'autre. Deux séances d'automne (21 août, 1er septembre) ne vivaient que dans le local ; elles
ont été ressaisies depuis.

▣ **DÉCISION DE GRÉGOIRE, 8 septembre — `https://app.codexnumeris.org` est désormais sa SOURCE
UNIQUE DE VÉRITÉ.** L'instance locale ne sert plus à ses vraies données.

⚠ **Conséquence pour les sessions** : plusieurs documents décrivent encore le dépôt comme « la source
`file://` de l'application ouverte de Grégoire » (`ETAT-PROJET.md`, `plans de travail/PORTES-TERRAIN-2026-08-28.md`,
entre autres). **Ces mentions sont périmées.** Une porte terrain qui demande une vérification à
l'écran vise maintenant le site web, pas le fichier local.

⚠ Le diagnostic qui a établi tout ceci est `scripts/diagnostic785presencesdeuxinstances.js`, **non
suivi par git au 8 septembre**. En lecture seule, sans donnée personnelle en sortie. À commettre.

↻ **Mesuré le 9 septembre au soir : ce script n'existe plus.** Il n'est ni dans l'arbre, ni dans
l'historique (`git log -- scripts/diagnostic785presencesdeuxinstances.js` rend vide ; témoin : la même
commande sur un fichier voisin rend ses commits). Il a été supprimé sans être commis. **La conclusion,
elle, tient** — elle est écrite ci-dessus et dans `SUIVI-BUGS.md` ; c'est la preuve rejouable qui est
perdue. Si la question des deux origines revient, le diagnostic est à réécrire.

---

## LE MANDAT — deux fichiers, dans cet ordre

**1. `plans de travail/CONSIGNE-SUIVANTE-menage-documentaire.md`** — le bloc manquant de `SESSION.md`
pour `1.124.0` → `1.124.3` et `#781` ; la branche `claude/consigne-du-jour-wybfs0` à retirer si elle
est bien identique à `main`. Un commit `docs`, pas de bump.

**2. `plans de travail/CONSIGNE-DU-JOUR.md`** — le dépistage du français en première semaine : une
production marquée « diagnostique », qui ne pèse sur rien, et qui lève « Aide en français
recommandée » dès le palier « Risqué ». **Quatre portes à fermer**, dont la quatrième est le piège
(`depistagePeutJugerLaNonParticipation`). Un seul lot, une seule livraison, à la fin.

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`, priorité absolue).
Sinon, les cadrages ouverts sont dans `plans de travail/00-CADRAGES-OUVERTS.md` — aucun n'est une
consigne ; **Cowork en écrit une avant qu'on y touche.**

↻ **ÉTAT DE CE MANDAT AU 9 SEPTEMBRE AU SOIR — fait mesuré, le mandat suivant reste à Cowork.**
Le **fichier 1 est livré** : le bloc `SESSION.md` manquant a été écrit le 8 (`f5334e86`), et la branche
`claude/consigne-du-jour-wybfs0` n'a pas été supprimée — décision assumée, elle avait été poussée le
jour même par une autre instance possiblement encore au travail dessus. Le **fichier 2 n'a jamais été
exécuté** : la consigne du dépistage du français a été archivée le 9 au soir
(`plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-07-depistage-francais-semaine-1.md`) sur une
décision de Grégoire, au profit du texte d'accueil de l'Aide — livré en `1.127.2`.
⮕ **Il n'y a aucune consigne du jour en attente ce soir.** Ce que le dépistage du français prévoyait
n'est pas perdu : le cadrage vit dans `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`,
et le travail diagnostique lui-même est livré depuis `1.125.0`.

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

⚠ **Cette liste date du 5 septembre au soir et N'A PAS été remesurée depuis.** Trois jours de travail
la séparent d'aujourd'hui ; certaines lignes sont probablement réglées. **Ne l'oppose pas à Grégoire
comme un constat** — demande-lui plutôt ce qui est tombé, et retire d'ici ce qu'il te confirme.
Seule exception, mesurée le 8 : `_to_delete/` **existe toujours** (douze fichiers).

- **Deux gestes à l'écran** sur les versions en ligne : le profil d'un élève avec une copie en
  brouillon ; une pratique créée depuis « Partir d'un modèle » › « Modèle simple ».
- **L'arbitrage des dispositions** `#700`-`#705` (audit 1) et `#710`-`#721` (audit 2), **après le
  14**, plus le cadrage « non remis par famille » (règle par famille, dans ses mots).
- **Le renommage de la page « Les huit gestes »** en « Ce qu'il reste à faire » — proposé, non
  tranché.
- **Recueillir ce qui sortira du 14** : un gabarit de retour et un canal ; le canal est sa décision.
- **Le test manuel de `#612`** (bandeau AVANT / « Non associé » APRÈS ; import sans groupe-cours
  refusé) ; **effacer `_to_delete/`** ; les portes terrain jamais relevées (`#568` cibles tactiles
  iPad, `#572` hiérarchie des titres, `#660`/`#661` zoom iPad) ; `#598` volet B, la balance des
  blancs.

---

## LE TRI DU 2 SEPTEMBRE — où sont parties les leçons

*Règle 3 de `PROTOCOLE.md`. Rien n'a été jeté : tout ce qui a quitté ce fichier est
arrivé quelque part, et huit fichiers en portent la trace (`181d608a`, `a4b58eda`).*

| Ce qui a quitté ce fichier | Où c'est maintenant |
|---|---|
| Le piège du répertoire de démarrage (session hors dépôt → skills muets) | skill `debut-de-session-labo-codex` §0.5 |
| Les deux mesures d'ouverture (`rev-list`, verdict Playwright) | skill `debut-de-session-labo-codex` §2 |
| « Push réussi ≠ suite verte » | `CLAUDE.md`, §Avant chaque commit |
| L'ordre `commit → relecture → verdict → push`, et pourquoi le hook ne peut pas lancer la suite | skill `fin-de-session-labo-codex` §4.5 |
| **Le bump à quatre emplacements**, et `version.js` qui n'y était pas nommé | skill `release-et-changelog` §3 |
| Les sept règles du travail à plusieurs sessions | `PROTOCOLE.md`, règle 5 |
| La condition de la relecture croisée (cartographier AVANT) | `PROTOCOLE.md`, règle 2 |
| Un banc vert peut couvrir un écran cassé · `grep` la cible avant de planifier · l'assertion à borne · le break-test sans mutation · le JSDoc relié par la position · `ls` avant d'écrire un chemin | skill `verification-adverse` §8 |
| `head -n -1` n'existe pas sur ce Mac | skill `debug-labo-codex` |
| Le garde anti-cache ne surveille que `main.js` | skill `portes-terrain` |
| Les notes d'A2025 et H2026 ne sont pas rouvertes | `CLAUDE.md`, §Zones protégées |

⚠ **Deux destinations étaient PÉRIMÉES et ont été corrigées au passage** :
`release-et-changelog` prescrivait `npm test` (qui enchaîne Playwright, plus de dix
minutes) et n'énumérait pas `version.js` parmi les quatre points de vérité.
`debut-de-session` prescrivait `npm test` aussi. **La règle 3 ne déplace pas du
texte : elle répare les endroits qui donnaient de mauvaises instructions.**

⚠ **`CLAUDE.md` est à 250 lignes, EXACTEMENT au plafond.** La prochaine promotion
vers lui exigera un retrait délibéré, pas une compression.
