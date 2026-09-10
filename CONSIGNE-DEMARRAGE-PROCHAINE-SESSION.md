# Consigne de démarrage à froid — les sessions qui prennent le relais

> ↻ **ÉTAT MESURÉ remesuré le 10 septembre 2026 en fin de soirée par Claude Code** (le MANDAT, lui,
> reste tel que Cowork l'a repris en fin d'après-midi — voir la note en tête de sa section).
> Version précédente de cet en-tête : **ÉTAT MESURÉ et MANDAT réécrits le 10 septembre 2026, en début d'après-midi, par Claude Code**,
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
3. **`Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`**, puis
   **`plans de travail/CONSIGNE-DU-JOUR.md`** — le chantier de la journée (voir LE MANDAT plus bas).
   La proposition d'origine, `plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`, est
   **consommée** : ses temps 1 et 2 sont faits, son temps 4 est tranché.
4. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés).

Puis le rituel : skill `debut-de-session-labo-codex`, **délégué au subagent `audit-debut-session`**.

⚠ Les trois entrées périmées de la version précédente ont été retirées, pas corrigées : le ménage
documentaire est livré, la consigne du dépistage du français est archivée sans avoir été exécutée
(son cadrage vit dans `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`), et
il n'y avait **aucune consigne du jour en attente** au matin du 10.

---

## ÉTAT MESURÉ — 10 SEPTEMBRE 2026, FIN DE SOIRÉE (TORONTO)

▣ **Remesuré par Claude Code au rituel de la session du soir, puis à sa clôture — chaque ligne
avec la commande qui la produit.** La version précédente de ce bloc (début d'après-midi, 1.128.3)
est remplacée, pas corrigée. ⚠ **Un état mesuré vieillit en heures. Remesure, ne recopie pas.**

- **Version `1.128.4`, build `0910-1531`** (`cat version.json`). **Deux releases le 10**
  (`git log --format=%s origin/main --since='2026-09-10 00:00' | grep -c '^release '` rend `2`) :
  1.128.3 (quatre réglages qui n'atteignaient pas leur calcul) et 1.128.4 (#821 lot A, un seul
  endroit pour les quatre règles qui qualifient un contexte, **rien de visible à l'écran**).
- **`origin/main` = `main`** au rituel (`git fetch && git rev-list --count origin/main..HEAD` = 0),
  puis **poussé** en fin de session avec les commits documentaires du soir. Aucune branche ne porte
  de travail, sauf `claude/formation-session-setup-4181r0` (chantier Formation, à part).
  ⚠ **Le SHA n'est pas écrit ici, exprès.** `git log --oneline -1`.
- **Arbre : trois `Formation/*.html` non suivis** (chantier Formation, pas à commettre avec un lot
  du dépistage). Rien d'autre (`git status --porcelain -uall`).
- **Vitest : 530 fichiers / 5785 essais, 0 échec** (`cd tests && npm run test:unit`, ~26 s).
  ⛔ **PAS `npm test`** : il enchaîne Playwright, plus de dix minutes.
- **Playwright : verdict local VERT sur le SHA de 1.128.4** (`scripts/.verdict-playwright.json`,
  `code: 0`, rendu par `scripts/pousser.sh` avant le push du soir). Les commits suivants sont
  documentaires : le hook laisse passer sans relancer la suite. **Le verdict Safari/iPad reste sur
  le Mac de Grégoire** ; le CI WebKit sur `main` est à relire (`gh run list --branch main -L 1`).

**Ce que le 10 septembre au soir a livré, et ce que la mesure a corrigé des fiches** :

| Lot | Livré | ⚠ Ce que la mesure a corrigé |
|---|---|---|
| `#821` lot A (1.128.4) | `js/contexte-qualification.js` : les quatre règles, bornes nommées et datées ; harnais AVANT/APRÈS 1630 cas / 0 différence ; sentinelle 24 essais, 8 break-tests rouges | l'inventaire disait « indice composite » pour l'Aperçu : c'est **un indice par barre** ; le mécanisme 2 a une **4e borne fixe à 60 %** ; « Assiduité critique » vit sous deux bornes ; le palier « Insuffisant » est inatteignable (`#822`) |
| `#821` lot B | le tableau des divergences, en points, § 8 de `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md` | — |
| cadrage 10, temps 1 (docs seulement) | **la carte des effets** de `Labo › Outils d'observation`, § 4 de `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md` : 20 contrôles, l'écran où chacun agit, en gestes d'utilisateur | **aucun réglage n'agit sur une note** (l'exception de la consigne ne se déclenche pas) ; **quatre contrôles n'agissent nulle part** (`#823`) ; quatre agissent **hors de Suivi** ; cinq chemins morts (`#824`) ; l'ancien § 4 disait « lus par `pratique-pan-standards.js` » — vrai, mais par des chemins morts |

⮕ **La leçon qui se répète** : sur trois consignes de la journée, chacune portait au moins une
affirmation fausse que la mesure a corrigée AVANT d'écrire. Une consigne est une piste, pas un fait.

---

## LE MANDAT — repris par Cowork le 10 septembre en fin d'après-midi

⏸ **CE MANDAT EST CONSOMMÉ** (note d'état, Claude Code, 10 sept. fin de soirée) : le lot A qu'il
annonce est livré en `1.128.4`, et la consigne suivante (la carte des effets de l'écran de réglage du
dépistage) est livrée aussi, le même soir. **Cowork écrit le mandat suivant** ; les cadrages ouverts
sont dans `plans de travail/00-CADRAGES-OUVERTS.md`, et le cadrage 10 attend l'arbitrage de Grégoire
sur la forme (déplacer, scinder, ou garder dans Labo) — les faits sont au § 4 du cadrage.

↻ **La proposition de Claude Code a été reprise à froid, comme son en-tête y invitait.** Ses temps 1
(inventaire) et 2 (archéologie) sont **faits** — résultats dans
`Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`. Son temps 4 est **tranché par Grégoire**.
Deux de ses affirmations étaient fausses et sont corrigées dans le rapport (« dix fichiers » : 27
bruts, 13 dans le périmètre ; « zéro occurrence dans `bilan*.js` » : il y en a dix — la conclusion
tient, mais pour une autre raison).

**Ce que l'inventaire a trouvé et qu'aucune fiche ne portait** : le mot « Favorable » a **trois
définitions** dans l'app, et « Fragile » aussi. Un étudiant à A = 80 %, C = 80 % est « Favorable » et
« Acceptable » sur le même écran.

▣ **Arbitrage de Grégoire, 10 septembre** : « Peu importe le chiffre, cette incohérence est à
corriger. Il faut unifier les définitions. » ⮕ Le renommage, lui, **attend le travail d'automne avec
l'orthopédagogue** (`#821`).

⮕ **`plans de travail/CONSIGNE-DU-JOUR.md`** porte le chantier : un seul ENDROIT où les quatre règles
sont écrites, **pas** une seule règle. Livrable invisible à l'écran ; si un pixel bouge, c'est un
défaut.

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
