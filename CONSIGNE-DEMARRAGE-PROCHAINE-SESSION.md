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

---

## ÉTAT MESURÉ — 8 SEPTEMBRE 2026, DÉBUT D'APRÈS-MIDI

▣ **Ce qui suit est la mesure de COWORK, en lecture seule.** La règle 4 veut que l'état qui fait foi
soit celui que Claude Code écrit lui-même dans `SESSION.md` — **et c'est justement ce qui manque** :
son dernier bloc s'arrête à `1.123.12`, trois versions en arrière. Le combler est le temps 1 du
ménage. **Jusque-là, traite ce qui suit comme une indication, pas comme la mesure de référence.**

- **`main` = `b8ccd67b`**, version `1.124.3`, build `0907-1325` (`git log --oneline -1`,
  `cat version.json`).
- **`origin` non mesurable depuis le poste de Cowork** : `git fetch` échoue sur « Host key
  verification failed ». L'égalité `main` = `origin/main` **n'est pas vérifiée** ici.
- **Arbre** : `plans de travail/CONSIGNE-DU-JOUR.md` et `plans de travail/00-CADRAGES-OUVERTS.md`
  modifiés, non commités — **fichiers de Cowork, à commettre tels quels** avec le premier commit.
  Non suivis, décision de Grégoire toujours en attente : `Retours des testeurs/jean-françois/`,
  `ignorés/`, `docs/projet de développement/`, `Modèle de consigne de démarrage à froid.txt`,
  `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`,
  `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-06-six-correctifs-sous-onglets.md`,
  `scripts/diagnostic785presencesdeuxinstances.js`.
- **`RELAIS.md`, `BACKLOG.md` et `OU-EN-EST-ON.md` sont à jour** (constat de Claude Code, 7 au soir).
- **Suite de tests : non exécutée par Cowork.** Aucun verdict à reprendre d'ici.

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
