# Consigne du jour — Suivi du groupe : la liste suivie ne s'efface plus en changeant de groupe, et le tri de l'écran (lot 1 du cadrage 11)

> **Écrite le 11 septembre 2026 à 12 h 35 (Toronto, `TZ=America/Toronto date`) par Cowork**, sur la décision de Grégoire de 12 h 31
> (« tout l'onglet, 35 constats de l'audit ») et son « oui » pour ce premier lot. Application au moment de l'écriture : **`1.130.2`**,
> build `0911-1139`, `main` = `origin/main` = `2280aa0d`. Elle remplace la consigne de l'ouverture immuable (livrée en `1.130.2`,
> vue), archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-ouverture-immuable.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`, `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** L'audit qui fonde ce lot date du 6 sur `1.123.5` ; les numéros de
> ligne ci-dessous ont été **remesurés aujourd'hui sur `1.130.2`**, mais un constat périmé se dit périmé, pas corrigé.
>
> **Préalables** : `plans de travail/CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md` (§ 7 : la décision, les sept lots) ;
> `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 1 seulement** (l. 34-105 : G-1 à G-8, le tableau des gestes, les écritures) ;
> `BACKLOG.md`, item `#749` (grep ciblé). Skills : `labo-codex` (clés nues / namespacées), `design-interface` (microcopy),
> `verification-adverse` § 4, `portes-terrain`.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés ou neufs, non commis, de Cowork : le cadrage 11 (`CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md`), l'entrée 10 de
`00-CADRAGES-OUVERTS.md`, la porte de l'ouverture immuable (note « vue, non chiffrée »), l'archivage de l'ancienne consigne et la
présente. **Commets-les d'abord, seuls, `git add` ciblé.** ⚠ Le `D` sur la capture du 9 septembre reste hors de tes commits (à
Grégoire) ; les quatre `Formation/*.html` aussi.

**Et une disposition à écrire en tête du rapport du 6** (`Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`, sous « Verdicts ») :
*« ↻ 11 sept. 2026 — décision de Grégoire (12 h 31) : les 35 « inscrire » et 7 « commenter » sont versés au cadrage 11, lot par lot,
un par sous-onglet. Lot 1 (§ 1, Suivi du groupe) : consigne du 11. »* C'est ce qui clôt l'audit au sens de `CLAUDE.md`.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE — deux groupes-cours cet automne

**Aujourd'hui** (mesuré le 6, G-2, `[exécuté]` ; code inchangé au 11 : `tableau-bord-apercu.js:108-118`) : la liste des élèves
suivis (au plus cinq, les pilules colorées du Suivi du groupe) vit sous **une clé nue**, `etudiantsSuivis` (`:34`), partagée entre
trimestres et groupes-cours. `nettoyerEtudiantsSuivis` filtre par les DA du groupe actif **et réécrit** si la longueur a changé
(`:114-116`). Conséquence : ouvrir « Détails » sous le groupe B **efface en base** les suivis du groupe A. **Grégoire a deux groupes
cet automne** : il perdra ses suivis à chaque bascule, et il ne le saura pas.

**Après** : une liste **par trimestre et par groupe-cours**, jamais purgée en écriture ; ce qui n'est pas du groupe est **ignoré à la
lecture**, pas effacé. Le reste du lot est du tri sur le même écran, invisible ou presque.

---

## 1 · LE LOT — six gestes sur `js/tableau-bord-apercu.js` (et le HTML mort d'`index.html`)

### A. La liste suivie par groupe-cours (G-2, G-3, `#749`) — la SOURCE, et ce qui est décidé sur le STOCK

1. La clé devient une clé composée par trimestre ET groupe-cours — **mesure le patron existant** (`grep -n "_gc_" js/*.js`,
   `seancesCompletes_gc_<id>` en est un) et suis-le ; l'inscrire là où vivent ses pareilles (`CLES_NAMESPACEES` de `trimestres.js` ?
   mesure) et dans `docs/DATA-OWNERSHIP.md`.
2. `nettoyerEtudiantsSuivis` **ne réécrit plus** : elle filtre à la lecture (DA du groupe actif, et `estEtudiantExclu` — G-3, l'élève
   en abandon libère son siège). Une seule écriture reste : le geste explicite (ajouter, retirer, réinitialiser).
3. **Le stock — tranché par Cowork, nommé, réversible** : à la première lecture d'un groupe-cours dont la clé n'existe pas encore, si
   la clé nue `etudiantsSuivis` existe, **ses entrées dont le DA appartient à ce groupe** deviennent la liste du groupe (semis).
   **La clé nue n'est ni effacée ni réécrite** : rien n'est détruit chez personne, et si le semis est faux, la valeur d'origine est
   encore là. Elle devient une orpheline (`scripts/diagnostic-353-cles-orphelines.js` la connaît ? mesure, et inscris-la sinon).
   ⚠ **C'est une lecture qui écrit une fois** : dis-le dans le code, en une phrase datée.
4. **Sentinelle Vitest, break-testée** : (a) deux groupes, deux listes, ouvrir « Détails » sous B ne change pas la liste de A (le cas
   mesuré de l'audit : `['2000001','2000002']` doit survivre) ; (b) le semis lit la clé nue et ne l'écrit pas (valeur nue identique
   avant/après) ; (c) un élève en abandon ne compte pas dans `(n/5)`. Retire le filtre à la lecture → (a) rouge ; fais écrire la clé
   nue → (b) rouge. Montre les rouges.

### B. Le sixième ajout dit pourquoi il refuse (G-1)
`ajouterEtudiantSuivi` rend `false` sans un mot (`:122-123`). Une notification (`notifications.info`, le patron du module) avec
**le texte validé par Grégoire** (§ 3). Et la porte : un DA hors du groupe actif est refusé à l'ajout (aujourd'hui accepté puis purgé).

### C. « Filtrer » filtre sur ce qui est montré (G-4)
Le filtre `P < 65 %` teste `e.P` (`:174` à remesurer) alors que l'écran affiche « — » quand `noteConstructible === false` (`:434`) :
exclure ces élèves du filtre P. Renommer les vestiges `prioritaire-tri-*` / `trierEtudiantsPrioritaires` (`:278`) en « filtre »
**seulement si** c'est un renommage interne sans effet sur le CSS ni le HTML généré (`grep -rn "prioritaire-tri" styles.css index.html
js/`) ; sinon, commente et passe. Le critère « M → (A+C)/2 < 65 » filtre sur une valeur affichée nulle part : **inscrire, ne pas
toucher** — c'est une position didactique, elle remonte à Grégoire avec le lot 7 s'il le veut.

### D. Le panneau mort et le mot qui manque (G-5)
`#panneau-prioritaire` (`index.html:7554-7562`) n'est jamais ouvert : seul le bouton `#btn-toggle-panneau-prioritaire` (`:7529`)
vit — il ouvre `#panneau-suivi-etudiants` filtré (`tableau-bord-apercu.js:1113-1130`). ⚠ **Leçon du 10 : un mort se mesure par chaque
lecteur.** Lecteurs mesurés aujourd'hui : `:1353` (`compteur-prioritaire`, mis à jour dans un conteneur invisible), `:1769` / `:1779`
(sauvegarde et restauration du HTML au re-rendu), `styles.css:11857-11870` et `:24562`. Retire le HTML mort, ses lecteurs et son CSS ;
garde le bouton et son compteur **s'il est lisible ailleurs** (mesure : où `compteur-prioritaire` s'affiche-t-il ? nulle part → il part
avec le panneau). Puis **le mot qui manque** : le chemin vivant vers le profil (les badges A / C / P d'une pilule, en mode Détails)
n'est écrit nulle part — une ligne de microcopy à la place du « Cliquer → profil » retiré, **texte validé par Grégoire** (§ 3).

### E. Sans pratique de notation, dire qu'il n'y en a pas (G-7)
`genererBadgePratique` (`:867`) et `genererBadgeSourceDonnees` (`:910`) rendent « Alternative - Maîtrise (IDME) » / « Source :
PAN » pour `config === null`. Un seul badge à la place : **texte validé par Grégoire** (§ 3). Ne touche pas au calcul.

### F. Une lecture n'écrit pas deux fois (G-8) — et la démo exerce ce que la carte montre
`calculerEtStockerIndicesCP` est appelé à `:1240` alors que `calculerEtSauvegarderIndicesAssiduite` (`:1235`) le chaîne déjà
(`indices.js:281`, à remesurer) : retire l'appel `:1240` **après avoir prouvé la chaîne** (un essai qui compte les écritures de
`<trim>_indicesCP` à l'ouverture : 2 avant, 1 après). **Et le pack de démonstration ne pose pas `grilleReferenceDepistage`**
(`grep -c` = 0 dans `demo-namespace.js`, `demo-activation.js`, `pack-demo-20.js`) : 520 avertissements console à l'ouverture et
« Défi spécifique » à 0 en démo — **c'est ce que vingt collègues verront le 14**. Pose la grille de référence de la démo à
l'activation (`demo-activation.js`, skill `integrite-globaux` : une clé namespacée du trimestre démo, pas une globale ; mesure avant
d'écrire). Si ça déborde le lot (plus d'une dizaine de lignes, ou une décision de forme), **inscris et continue** — le 14 passe avant,
mais pas au prix d'un correctif de correctif.

---

## 2 · CE QUI NE SE FAIT PAS ICI

- **Les cibles tactiles** (9 contrôles sous 44 px dans cette sous-section) : lot 7, transversal, sur maquette.
- **L'état perdu au rechargement** (G-6 : mode Détails, filtres, indice) : une position, pas un défaut — commenter l'asymétrie ACP /
  trajectoires (`graphiques-progression.js:2056` vs `:4562`), rien d'autre.
- **Les deux « moyenne A »** (`#750`), **le filtre M** (§ C), **les règles `#735`-`#754`** : cités, pas rejugés.
- **Rien n'écrit dans les données de personne** hors le semis nommé au § A.3 — et lui n'efface rien.

---

## 3 · CE QUI REMONTE À GRÉGOIRE — trois textes que ses collègues liront (proposés par Cowork dans la conversation)

| Où | Proposition | Sa réponse |
|---|---|---|
| B — le refus du sixième ajout | « Cinq élèves suivis au maximum. Retires-en un pour en ajouter un autre. » | _______ |
| D — le chemin vers le profil | « Pour ouvrir un profil : clique sur A, C ou P d'un élève suivi. » | _______ |
| E — sans pratique de notation | « Aucune pratique de notation configurée » | _______ |

⛔ **Pas de release avant ses trois réponses** (ou son « ok » global). S'il corrige un mot, sa version.

---

## 4 · LIVRER — `patch` ou `minor`, tranche et dis-le

C'est un correctif (une perte de données) plus du tri ; mais la liste par groupe-cours est un **comportement nouveau** que les
collègues verront. **Recommandation de Cowork : `minor` (`1.131.0`)** — le changelog le dira en une phrase : « Tes élèves suivis sont
maintenant gardés par groupe-cours : changer de groupe ne les efface plus. » (à valider avec les trois textes du § 3). Rituel :
`release.mjs`, `cd tests && npm run test:unit`, relecture croisée sur le diff (règle 2 : ce lot écrit une fois chez les gens — le
semis), verdict, `pousser.sh`.

---

## 5 · LA PORTE TERRAIN — sur SES données réelles, en lecture, deux groupes-cours

Tu écris le markdown (`plans de travail/PORTES-TERRAIN-2026-09-11-suivi-du-groupe.md`, modèle du skill) ; Cowork publie l'artefact.
Rangées, sur `app.codexnumeris.org`, `1.131.0` lue en bas de page :

| # | Geste | Attendu |
|---|---|---|
| 1 | Groupe-cours A, Suivi du groupe : suivre deux élèves (clic sur leur nom). Basculer sur le groupe B, ouvrir « Détails ». Revenir sur A. | **Les deux élèves sont toujours suivis.** Et B a sa propre liste (vide ou la sienne). |
| 2 | Sur A, ajouter un sixième élève | le message du § 3 (B), l'ajout refusé |
| 3 | Sur A, filtre « P » du panneau Détails | aucun élève dont le P affiche « — » |
| 4 | Sous le titre du panneau : le mot qui dit où cliquer (§ 3 D) ; cliquer sur le A d'un élève suivi | le profil s'ouvre, section Engagement |
| 5 | Mode démonstration (Labo › Démo), Suivi du groupe | la famille « Défi spécifique » n'est plus à 0 (0 %) ; **aucun** avertissement rouge dans la console |

⚠ La rangée 1 est le cas réel de l'audit : elle vaut plus que la sentinelle. **Rien de ce lot n'écrit dans ses données** hors le semis
(sa liste actuelle, s'il en a une, devient celle du groupe où sont ces élèves ; la valeur d'origine reste en base, intacte).

---

## 6 · TROUVAILLES ET RAPPORT

Trois issues de `CLAUDE.md`, nommées dans ton rapport. Ce que tu viens d'écrire n'est pas une trouvaille. Rapport : tête
d'`OU-EN-EST-ON.md` (ce qu'il verra : la rangée 1 en une phrase ; « vérifié comment » ; « pas vérifié » : ses deux groupes réels),
`#749` clos, l'ÉTAT MESURÉ de `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, l'entrée 10 de `00-CADRAGES-OUVERTS.md` (lot 1 livré, lot 2
suivant : la Liste), la présente consigne commise avec le lot.
