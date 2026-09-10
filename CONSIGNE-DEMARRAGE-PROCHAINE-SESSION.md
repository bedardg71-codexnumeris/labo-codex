# Consigne de démarrage à froid — les sessions qui prennent le relais

> ↻ **ÉTAT MESURÉ et MANDAT réécrits le 10 septembre 2026, en début d'après-midi, par Claude Code**,
> à la demande explicite de Grégoire. Ils remplacent la version du 9 au soir, périmée de six versions
> mineures, **et dont les deux fichiers du mandat étaient entièrement consommés**.
>
> ⚠ **Exception nommée à `PROTOCOLE.md` § « Qui écrit quoi »**, qui réserve le MANDAT à Cowork.
> Motif de la règle : *une session qui rédige sa propre consigne se relit elle-même — elle transmet
> ce qu'elle a vu, pas ce qu'elle a manqué.* Le risque est réel ici. ⮕ **Cowork peut et devrait
> reprendre le mandat à froid** ; ce qui suit est une proposition, pas un mandat arrêté.
>
> ⚠ **Nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Ce fichier ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — comment nous trois travaillons ensemble. Sept règles.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur. Sa tête porte `1.128.3`.
3. **`plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`** — la proposition d'analyse
   du jour (voir LE MANDAT plus bas).
4. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés).

Puis le rituel : skill `debut-de-session-labo-codex`, **délégué au subagent `audit-debut-session`**.

⚠ Les trois entrées périmées de la version précédente ont été retirées, pas corrigées : le ménage
documentaire est livré, la consigne du dépistage du français est archivée sans avoir été exécutée
(son cadrage vit dans `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`), et
il n'y avait **aucune consigne du jour en attente** au matin du 10.

---

## ÉTAT MESURÉ — 10 SEPTEMBRE 2026, DÉBUT D'APRÈS-MIDI (TORONTO)

▣ **Mesure de Claude Code, dans l'arbre, chaque ligne avec la commande qui la produit.**
⚠ **Un état mesuré vieillit en heures. Remesure, ne recopie pas.**

- **Version `1.128.3`, build `0910-1147`** (`cat version.json`). **Une seule release le 10**
  (`git log --format=%s origin/main --since='2026-09-10 00:00' | grep -c '^release '` rend `1`),
  après les quatre du 9 au soir et du 10 au matin livrées par d'autres instances.
- **`origin/main` = `main`**, et **la branche de travail est fusionnée** :
  `git rev-list --count main ^claude/continuation-travail-qpdgka` rend `0`.
  ⚠ **Le SHA n'est pas écrit ici, exprès** — il périme avant d'être lu. `git log --oneline -1`.
- **Arbre propre au moment de la mesure** (`git status --porcelain -uall`).
- **Vitest : 529 fichiers / 5760 essais, 0 échec** (`cd tests && npm run test:unit`, ~65 s).
  ⛔ **PAS `npm test`** : il enchaîne Playwright, plus de dix minutes, et la connexion se ferme.
- **Playwright : AUCUN verdict local, et aucun n'est obtenable en session cloud.** Mesuré le 10 :
  la config `playwright.chromium.config.js` dit elle-même que la suite entière rougit à moitié en
  Chromium (motifs d'erreurs console rédigés pour WebKit), et **aucune spec ne touche le code livré
  aujourd'hui** (`grep -rln "portfoliosEleves\|seuilsInterpretation\|distribution-legende" tests/integration/`
  ne rend rien). Le verdict WebKit vient de la CI ; le verdict Safari/iPad reste sur le Mac.

**Ce que le 10 septembre a livré, et ce qu'il a CORRIGÉ DES FICHES ELLES-MÊMES** — c'est le fait
le plus utile au relais :

| Fiche | Livré | ⚠ Ce que la mesure a corrigé de la fiche |
|---|---|---|
| `#816` | les quatre modes de sélection du portfolio parlent la langue de l'écran | « le seul des trois qui touche une note » était **faux** : `pratique-pan-standards.js` ne lit jamais `portfoliosEleves` (0 occurrence) |
| `#817` | le seuil force/défi n'a plus qu'une source | six occurrences de `0.7125` dans **trois** fichiers, la fiche en citait deux ; et c'était la COULEUR qui contredisait le CLASSEMENT |
| `#818` | la légende du tableau de bord calcule ses bornes | il n'y a **pas** « deux échelles » : le tableau de bord ne classe rien, c'est un dégradé continu |
| *(trouvé en chemin)* | les trois seuils d'interprétation atteignent enfin les calculs | ils écrivaient des clés PLATES que personne ne lisait ; il a fallu réparer AVANT d'écrire la prose du glossaire |

⮕ **La leçon à retenir pour le relais** : sur trois fiches parquées, **deux se trompaient sur leur
propre constat**, et la mesure l'a montré AVANT de coder. Une fiche est une piste, pas un fait.

---

## LE MANDAT — une proposition, à reprendre à froid

**`plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`** — revoir la nomenclature des
zones de couleur (« fragile / modéré / favorable / très favorable »), que Grégoire ne reconnaît plus :
« je ne sais pas sur quoi ils s'appuient ». Inscrit au backlog en **`#821`**.

Le document porte : ce qui est **déjà mesuré et qu'il ne faut pas refaire** (notamment que ces mots
**ne sortent pas vers les élèves** — dix fichiers, tous côté enseignant), l'analyse en quatre temps,
le livrable attendu, et deux garde-fous. **Le quatrième temps est un arbitrage de Grégoire : rien ne
se renomme avant.**

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`, priorité absolue).
Sinon, les cadrages ouverts sont dans `plans de travail/00-CADRAGES-OUVERTS.md` — aucun n'est une
consigne ; **Cowork en écrit une avant qu'on y touche.**

⏸ **Deux points restent dus à l'écran avant la CoP du 14**, qu'aucune session ne peut faire : la
carte « Prendre en main l'application » (hauteur d'accordéon) et **la visite guidée de bout en bout**,
dont le lot C de l'audit de l'Aide a changé le parcours. S'y ajoute, depuis le 10 : **la légende du
tableau de bord porte maintenant des décimales** (« 47,5 % ») dans quatre colonnes serrées — c'est le
premier endroit à regarder sur iPad.

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
