# Consigne du jour – Lot N2 : le P historique suit la note du cours (#716)

> Écrite le 22 septembre 2026, 22 h 10 (Toronto), par Cowork, sur `origin/main` = `4a0cd22b` (application en 1.155.1, en production chez Netlify depuis 19 h 40, déploiement mesuré). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N3, #714, livrée en 1.155.1) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-22-habiletes.md` (déplacée par Cowork, à commiter avec ce lot).
> **La fiche fait foi** : `BACKLOG.md`, #716 (≈ l. 792). Premier lot de l'ordre dans `plans de travail/FILE-DES-LOTS.md` (N2, N4, N5, N6). **Aucune question à Grégoire en entrée** ; deux arrêts prévus au §4.

## 0 · Conditions de départ

- `origin/main` porte `4a0cd22b` ou un commit de journal après. Aucune autre session n'écrit dans `js/`.
- Branche `lot-n2-p-historique` partie de `main`. Rien ne se fusionne ni ne se pousse avant la relecture de Cowork (PROTOCOLE, règle 2).
- Skills `pratiques-notation` (le moteur), `labo-codex`, `verification-adverse`.

## 1 · Ce que Cowork a remesuré (lecture seule, 22 h 05) – la fiche est vraie, et N1 a déjà fait une partie du chemin

- **Le calcul** : `calculerIndicesHistoriques` (`js/snapshots.js:190`) ; le P est aux l. 292-360. Depuis N1a, **sans pratique assignée, aucun P n'est écrit** (l. 296-305) : cette partie est faite, elle doit rester.
- **Avec une pratique**, P vient de `obtenirPratiqueActuelle().calculerPerformanceHistorique(...)` (l. 308-317). `obtenirPratiqueActuelle` (`js/profil-etudiant-helpers.js:692`) rend l'instance du **registre** pour standards / sommative / spécifications, la pratique résolue pour la dénotation.
- **Deux méthodes seulement** : `pratique-sommative.js:283` et `pratique-pan-standards.js:293`. Spécifications et dénotation n'en ont pas.
- **La sommative ne trouve jamais rien** : elle filtre sur `e.da` et `e.note` (≈ l. 318-320), alors que les évaluations portent `etudiantDA` et `noteFinale`. Elle rend `null`.
- **Le repli prend alors la main** (l. 319-352 et la branche `else` qui suit) : une table I 40 / D 65 / M 75 / E 100 codée en dur, et une conversion 0-4 → 0-100. C'est ce que reçoivent aujourd'hui la sommative, les spécifications et la dénotation.
- **La Standards a sa propre copie de la sélection** (`calculerPerformanceHistorique`, ≈ 80 lignes) à côté de `calculerDetailsNoteFinale` : deux définitions de « la note » qui partagent des aides (#394), pas le calcul.
- **La note du cours, elle, a une seule définition** : dans `js/portfolio.js` (≈ l. 770-790, sous `calculerEtStockerIndicesCP`, l. 680), `calculerDetailsNoteFinale(da)` pour une Standards, sinon `pratique.calculerPerformance(da)` de la pratique résolue (`resoudrePratiqueActive`, ≈ l. 625).
- **Le stock** : un snapshot hebdomadaire s'écrit une fois par semaine et n'est plus recalculé (`verifierEtCapturerSnapshotHebdomadaire`, l. 420 : « déjà capturé, on sort »). Les semaines déjà écrites chez Grégoire gardent leur P. Le bouton « Reconstruire » existe dans l'application (`lancerReconstructionRetroactive`, `index.html` ≈ l. 9608), et l'Aide dit déjà de s'en servir après une correction (≈ l. 12112).
- **Lecteurs du P historique** : trajectoires et courbes du Suivi, corrélations, impact des jetons. Bancs existants qui touchent ce calcul : `sentinelle-734-snapshots-p-de-l-eleve`, `sentinelle-lot-A-737-741-718-738`, `sentinelle-lot-D-735-743-750`, `sentinelle-745`, `audit-onglet-suivi-2026-09-05`.

## 2 · Ce que fait le lot

**2a. Le P d'un snapshot à la date X est la note du cours telle qu'elle se calculait ce jour-là.** Même fonction que celle qui écrit l'indice P aujourd'hui (§1, `portfolio.js`), appliquée aux seules évaluations de l'élève dont l'échéance de la production est au plus tard X. C'est la règle de filtrage qu'utilisent déjà les deux méthodes historiques (échéance effective par `obtenirEcheanceEffective`, groupe-cours actif) : garde-la. **Une seule définition de la note** : extrais-la de `calculerEtStockerIndicesCP` si c'est nécessaire, mais n'en écris pas une seconde. Le mécanisme qui fait passer « la date X » jusqu'aux lecteurs d'évaluations (`_lireEvaluations` de chaque pratique, `calculerDetailsNoteFinale`) relève de toi. **Décidé par Cowork (technique)**.

**2b. Ce qui part (zéro-dette).** Les deux `calculerPerformanceHistorique` (sommative, Standards), la table I/D/M/E et la conversion 0-4 du repli, et la branche `else` qui la répète. Sans note calculable à la date X, le snapshot porte `null` : **aucun P fabriqué**. Si `obtenirPratiqueActuelle` ne sert plus qu'à lire le niveau de la note globale, mets son commentaire à jour : il annonce que N2 réunit les deux instances, ce que ce lot ne fait plus (voir 2d).

**2c. Rien d'autre ne bouge dans le snapshot.** A et C historiques, les snapshots d'intervention, la capture hebdomadaire, le bouton « Reconstruire » : hors lot.

**2d. Hors lot, décidé par Cowork** : la question de l'échelle dans laquelle se lit le niveau de la note globale d'une Standards (constat de didactique laissé par N1, « deux échelles selon l'écran »). Ce lot n'a plus besoin de réunir les deux instances pour faire son travail. La question reste à Grégoire ; elle aura son propre lot.

**2e. Le stock.** Rien n'est réécrit dans les données de Grégoire. Les semaines déjà capturées gardent leur ancien P jusqu'à ce que **lui** clique « Reconstruire ». Écris-le dans le rapport, avec ce que tu mesures sur les données d'essai : combien de points de courbe changent après une reconstruction, et de combien au plus.

## 3 · Ce qui pourrait surprendre, à mesurer avant de coder

- **« Aujourd'hui » dans le moteur.** Si le calcul de la note du cours juge quelque chose d'après la date réelle (une production « due », un minimum requis, un non-remis), alors à la date X il doit la juger d'après X, pas d'après aujourd'hui. Cherche ces lectures de date (`dateLocaleYMD`, `new Date()`, `obtenirEcheanceEffective`, `evaluationNonRemise`, `minimumRequis`) dans tout ce que la note traverse.
- **Le coût.** La reconstruction appelle ce calcul pour chaque élève à chaque séance (≈ 30 × 30). Mesure le temps d'une reconstruction sur les données d'essai avant et après. Si c'est plus du double, choisis toi-même le remède (lecture des évaluations une fois par séance, cache de lecture comme `demarrerCacheLecture`) et dis-le.

## 4 · Deux arrêts prévus

1. **Si, à la date X, la note du cours dirait quelque chose que la note courante ne disait pas ce jour-là** (un échec automatique ou un plafonnement pour des productions pas encore dues, par exemple), et que 3 · « Aujourd'hui » ne se règle pas proprement : **arrête-toi et dis-le.** Ce que veut dire une note en cours de trimestre relève de la didactique.
2. **Si une famille ne peut pas calculer sa note à partir d'évaluations limitées à une date** sans toucher à son moteur au-delà de la lecture des évaluations : arrête-toi et dis quelle famille, et pourquoi.

## 5 · Tests

- **L'identité, pour chaque famille** (Standards « meilleurs », « récents », hybride, avec terminale ; sommative ; spécifications ; dénotation) : à une date postérieure à toutes les échéances, le P du snapshot égale l'indice P stocké par `calculerEtStockerIndicesCP`. C'est la preuve centrale.
- **Une date intermédiaire** : le P égale la note du cours recalculée sur les seules évaluations échues à cette date, et une évaluation échue après X ne le change pas.
- **Sommative** : le P historique n'est plus `null` quand l'élève a des évaluations (le défaut `e.da` / `e.note`).
- **Sans pratique assignée** : `null`, comme depuis N1a.
- **Sans note calculable à la date X** : `null`, jamais une valeur de la table I/D/M/E.
- **Sentinelle statique** : ni `calculerPerformanceHistorique`, ni la table `'I'` → 40, ni la conversion `/ 4) * 100` ne subsistent dans `js/`.
- Les cinq bancs du §1 repassés ; toute valeur figée qui change est expliquée dans le rapport, pas seulement remise à jour.
- Break-test sur chaque assertion ; suite Vitest complète verte avant le commit ; garde de non-vide (règle 10).

## 6 · Livraison

- Commits : le lot (code, tests) ; `BACKLOG.md` (#716 cochée) et le déplacement de l'ancienne consigne.
- Version **patch** par `scripts/release.mjs` : les courbes disent la note du cours, sans geste neuf. Item de « Nouvelles » **proposé, à valider par Grégoire avant le push** ; s'il mentionne « Reconstruire », il le fait en une phrase.
- Commit, relecture de Cowork, corrections, verdict, push.

## 7 · Le geste que Grégoire vérifiera à l'écran

Après un clic sur « Reconstruire » (s'il le décide), dans le Suivi d'un de ses élèves : le dernier point de la courbe de performance égale la note affichée dans son profil. Sans reconstruction, c'est le point de la semaine prochaine qui le montrera.
