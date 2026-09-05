# Consigne de démarrage à froid — les sessions qui prennent le relais

> **Réécrite le 5 septembre 2026 en soirée, par Cowork, à la clôture de la séance.**
> **Elle REMPLACE la version du 4 septembre au soir.** Tout ce que celle-ci portait (le lot 3, la
> release 1.116, le coup d'œil sur les lots 2 et 3) est exécuté et poussé depuis ; `OU-EN-EST-ON.md`
> en porte les preuves. Le tableau du tri du 2 septembre est gardé en fin de fichier.
>
> ⚠ **Nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Ce fichier ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — comment nous trois travaillons ensemble. Sept règles.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur. Sa section « L'ÉVALUATION » porte
   la journée du 5 : deux audits, deux lots, tout vu par Grégoire.
3. **`plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`** — **le mandat de cette séance**, écrit le
   5 septembre au soir. **À promouvoir en `CONSIGNE-DU-JOUR.md`** selon son en-tête. Une seule
   consigne à la fois ; c'est celle-là.
4. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés — tous parcourus et vus).

Puis le rituel : skill `debut-de-session-labo-codex`.

---

## ÉTAT MESURÉ — 5 SEPTEMBRE 2026 EN SOIRÉE

▣ **L'état qui fait foi est celui que Claude Code a écrit lui-même** à la clôture, bloc
« SESSION 28 » de `SESSION.md` et `RELAIS.md` (règle 4 : c'est lui qui rend l'état mesuré, Cowork
écrit le mandat). Ce qui suit est la mesure de Cowork, en lecture seule, au même moment.

- **En ligne : `1.122.0`**, build `0905-1722` — la note du cours ne compte plus les brouillons (#706),
  les spécifications calculent (#708), un cache d'indices vide rend `null` (#709).
- **`main` = `origin/main` = `12df341a`**, arbre propre hors les fichiers de Cowork (ci-dessous).
- **Run GitHub 33994473211 : `success`**, Vitest et Playwright WebKit — **premier run complet vert
  depuis 1.120.0** ; il juge aussi le lot #697-#699 (1.121.0), dont le run avait été annulé.
  Quatre specs instables hors du lot, vertes au second essai (#685, à surveiller).
- **Vitest** : 477 fichiers / 5 332 cas.
- **Arbre** : `plans de travail/00-CADRAGES-OUVERTS.md` modifié (index du cadrage « non remis »),
  `plans de travail/CADRAGE-2026-09-05-non-remis-par-famille.md` et
  `plans de travail/CONSIGNE-PROCHAINE-SEANCE.md` non suivis — **tous de Cowork, contenu de leur
  auteur, à commettre tels quels avec le premier commit.** Non suivis, décision de Grégoire en
  attente : `Retours des testeurs/jean-françois/`, `ignorés/`, `docs/projet de développement/`,
  `Modèle de consigne de démarrage à froid.txt`.

### La série d'audits cadrés — où elle en est

Tenue dans `plans de travail/00-CADRAGES-OUVERTS.md`, section « La série d'audits cadrés ».
**1. Le moteur d'évaluation** : exécuté, fermé, trois correctifs livrés (1.121.0), vus par Grégoire.
**2. La pratique de notation** : exécuté, fermé, trois correctifs livrés (1.122.0), à voir par Grégoire.
**3. L'onglet Suivi** : **c'est le mandat de cette séance.** Douze constats moyens du 2 (#710-#721)
et cinq du 1 (#700-#705) attendent l'arbitrage de Grégoire **après le 14**.

---

## LE MANDAT — dans `plans de travail/CONSIGNE-PROCHAINE-SEANCE.md`

Deux temps, le premier court : **un mot** dans une des deux phrases sous la note du cours (patch,
verdict CI lu avant tout autre push) ; puis **l'audit de l'onglet Suivi**, lecture seule, sur
branche, rapport déposé, dispositions PROPOSÉES — **aucun correctif avant l'arbitrage de Grégoire.**

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`, priorité
absolue). Sinon, les cadrages ouverts sont dans `plans de travail/00-CADRAGES-OUVERTS.md` — aucun
n'est une consigne ; **Cowork en écrit une avant qu'on y touche.**

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

↻ **Remesuré le 5 septembre au soir.** Réglés depuis le 4 et retirés d'ici : le facteur 500 → 600 (vu
à l'écran, 600 sur sa grille), la règle de #560, le nom du service d'aide, les identifiants à prénom,
les attributions Voisard (source publiée, se citent), le message Teams (fait le 3).

- **Deux gestes à l'écran sur 1.122.0** : le profil d'un élève avec une copie en brouillon (la note du
  cours sans elle, la ligne « N évaluation(s) en brouillon, non comptée(s) » dessous) ; une pratique
  créée depuis « Partir d'un modèle » › « Modèle simple » — deux projets et un examen au-dessus de
  75 % donnent 90, un projet et un examen 70 ; avant 1.122.0, toute la classe était à 0.
- **L'arbitrage des dispositions** #700-#705 (audit 1) et #710-#721 (audit 2), **après le 14**, plus le
  cadrage « non remis par famille » (règle par famille, dans ses mots).
- **Le renommage de la page « Les huit gestes »** en « Ce qu'il reste à faire » — proposé, non tranché.
- **Recueillir ce qui sortira du 14** : un gabarit de retour et un canal ; le canal est sa décision.
- **Repris tel quel, rien n'est réglé** : le test manuel de #612 (bandeau AVANT / « Non associé »
  APRÈS ; import sans groupe-cours refusé) ; effacer `_to_delete/` ; les portes terrain jamais
  relevées (#568 cibles tactiles iPad, #572 hiérarchie des titres, #660 / #661 zoom iPad) ;
  #598 volet B, la balance des blancs.

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
