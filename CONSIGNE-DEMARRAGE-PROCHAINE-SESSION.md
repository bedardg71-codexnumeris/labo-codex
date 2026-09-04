# Consigne de démarrage à froid — les sessions qui prennent le relais

> **Réécrite le 4 septembre 2026 au soir, par Cowork, à la clôture de la séance.**
> **Elle REMPLACE toutes les versions précédentes.** Elle est passée de 622 lignes à celles-ci :
> tout ce qui portait l'état du 2 septembre (#674, la 1.109.2, le moratoire, les deux lots hors
> dépôt, le mandat « finir l'énoncé 4 ») est **exécuté et poussé depuis** — `OU-EN-EST-ON.md` en
> porte les preuves. Le tableau du tri du 2 septembre est gardé en fin de fichier.
>
> ⚠ **Nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Ce fichier ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — comment nous trois travaillons ensemble. Sept règles.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur.
3. **`plans de travail/CONSIGNE-DU-JOUR.md`** — **le mandat de cette séance**, écrit le 4 septembre
   au soir. Une seule consigne à la fois ; c'est celle-là.
4. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés — tous parcourus et vus).

Puis le rituel : skill `debut-de-session-labo-codex`.

---

## ÉTAT MESURÉ — 4 SEPTEMBRE 2026 AU SOIR

▣ **L'état qui fait foi est celui que Claude Code a écrit lui-même** à la clôture, bloc
« ↻ CLÔTURE — 4 SEPTEMBRE 2026 AU SOIR » de `SESSION.md` (règle 4 : c'est lui qui rend l'état
mesuré, Cowork écrit le mandat). Ce qui suit est la mesure de Cowork, en lecture seule, au même
moment ; les deux concordent.

- **En ligne : `1.115.0`**, build `0903-2103` — le lot 1 des trois types de grille (le type monte
  à la grille) et sa retouche (le menu dit ce qui est enregistré, la déduction se dit à côté).
- **`HEAD` = `37660b76` = le lot 2** (l'analytique se saisit en points), **un commit devant
  `origin/main` (`16dfc5eb`), 0 derrière.** Témoin : `git rev-list --left-right --count
  origin/main...HEAD` → `0 1`. **Non poussé, EXPRÈS** (décision de Grégoire, voir le mandat).
- **Jeton Playwright** : vert sur `1228837a`, **périmé pour `HEAD`**. Il se rend à la fin de la
  prochaine séance, par `scripts/pousser.sh`, sur le commit qui part.
- **Arbre** : quatre fichiers modifiés non commités, tous à Cowork ou de clôture
  (`CONSIGNE-DEMARRAGE-COWORK.md`, `OU-EN-EST-ON.md`, `SESSION.md`, la consigne des lots) — ils
  partent avec le commit du lot 3. Non suivis, décision de Grégoire en attente :
  `Retours des testeurs/jean-françois/`, `ignorés/`, `docs/projet de développement/`.

---

## LE MANDAT — dans `plans de travail/CONSIGNE-DU-JOUR.md`

**Le lot 3** (le chiffre trouve son niveau, le niveau ouvre la cartouche) **avec une exigence
ajoutée** par la relecture croisée du lot 2 : le critère analytique entre dans
`evaluation.criteres[]`, et le PDF de l'élève imprime son chiffre, pas son niveau. Puis **une seule
publication, 1.116, pour les lots 2 et 3**, après le coup d'œil de Grégoire sur les deux.
⛔ **Rien ne part avant son coup d'œil.**

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`, priorité
absolue). Sinon, les cadrages ouverts sont listés dans `plans de travail/00-CADRAGES-OUVERTS.md`
— aucun n'est une consigne ; **Cowork en écrit une avant qu'on y touche.**

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

⚠ **Repris du 2 septembre SANS remesure le 4 septembre** (sauf la release 1.109.2, retirée :
1.115.0 est en ligne). Ce qui est réglé depuis se voit dans `OU-EN-EST-ON.md`, pas ici.

**Neuf, ou remis à jour le 2 septembre :**

- **Le message Teams à la communauté de pratique** sur l'adresse unique. Le
  changelog s'affiche DANS l'application, donc derrière la porte : quelqu'un qui a
  un vieux signet rencontre l'écran de code AVANT de pouvoir le lire. *(Rédigé,
  attend sa correction.)*
- ✅ **Les identifiants qui portent un prénom de collègue** *(#690b)* : **tranché le
  2 septembre — ils partent tous, et le retrait ne coûte rien.** Mesuré : les huit
  identifiants d'échelles sont inertes. Plus rien ne lui est dû sur ce point ; la
  consigne du jour porte le geste.
- **Deux attributions d'idée** (« l'algorithme propose, le jugement tranche —
  Voisard ») : si la formule vient d'une source publiée, elle se cite en règle au
  lieu de disparaître ; sinon elle part. **Question d'honnêteté intellectuelle, pas
  de code** — elle lui sera posée avec les deux lignes exactes sous les yeux.
- **Une porte terrain** sur « Partir d'un modèle » : cinq modèles fournis, aucun
  nommé par discipline. *Fait le 2 septembre pour la liste ; le contenu du modèle
  sommatif reste à ouvrir.*

**Repris tel quel, rien n'est réglé :**

- **Le test manuel de #612** : (1) `12345678_devoir.pdf` dans un groupe où ce DA
  n'existe pas → bandeau AVANT, ligne « Non associé » APRÈS ; (2) sans groupe-cours
  actif, tenter un import → refus dit, aucun fichier écrit.
- **Effacer `_to_delete/`** à la racine (déjà dans `.gitignore`).
- **Le facteur de normalisation 500 → 600** sur *Grille-1 FR-ALGO seul A26*.
  ⚠ **Entre deux évaluations, jamais au milieu d'une correction** : deux copies
  notées sous deux facteurs différents ne sont pas comparables.
- **La règle métier de #560** : que doit emporter la suppression d'un fichier ?
- **Les portes terrain jamais relevées** : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- **Le nom du service d'aide** pendant la transition CAF → Passerelle +.
  ⮕ **Le mandat ci-dessus en dépend.**

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
