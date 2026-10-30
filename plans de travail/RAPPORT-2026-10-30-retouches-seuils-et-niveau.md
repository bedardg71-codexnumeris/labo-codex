# Rapport des retouches des lots 1 et 2 (30 oct. 2026)

Consigne : `CONSIGNE-LOT-2026-10-30-retouches-seuils-et-niveau.md`, § 4 compris. Commits : `27423ff9` (verdicts et consigne), `d20bd5f5` (retouches), `73622888` (build, pour le pack de démo ; la version ne change pas). Aucun résultat sur données réelles ici. Pas de push, pas de bump, pas de verdict complet.

## Vérifications d'ensemble

| Quoi | Résultat | Comment |
|---|---|---|
| Vitest | 854 fichiers, 10 425 essais verts | `cd tests && npx vitest run`, sur `d20bd5f5` |
| Le code redonne le modèle accepté, sur le codex | 0 écart sur 47 dates ; même stabilité | `regles-1-et-2.mjs` sur `73622888`, comparé à l'agrégat accepté |
| « Tous les groupes » et groupe-cours | 0 écart sur 46 élèves | `temoin-tous-les-groupes.mjs` |
| WebKit | 28 essais verts, specs touchées seulement | `seuils-une-source`, `profil-etudiant-chargement`, `lot-e3-creer-ou-modifier`, `lot-a-anonymisation-enregistre` |
| Mutations | 13 de plus, toutes rouges | journal en fin de `sentinelle-niveau-compare-au-groupe-2026-10-30.test.js` |

⚠ Le rejeu à 0 écart ne prouve rien sur le § 4 : aucun des trois trimestres du codex n'est passé par le changement de cette décision. Le § 4 n'est vérifié que par le banc.

Non vérifié : Safari, iPad, le verdict Playwright complet.

## § 4. Les repères dans toutes les pratiques (L1-3, L2-4) : fait

| Point | État | Vérifié comment |
|---|---|---|
| Exclusion par famille retirée de `_echelleDeLaPerformance` | Fait | Mutation « exclusion remise » : 3 rouges |
| Copies en points : rien ne change | Fait, avec une garde | Mutation « garde retirée » : 1 rouge |
| Lecteurs de `raison` audités | Aucun écran ne lit `note-chiffree` ni `pratique-sans-methode` venant de ce module | `grep` ; plus aucune de ces chaînes dans `contexte-qualification.js`, verrouillé par la sentinelle |
| Ce qui en découle : pastille, filtre P, barre P, répartition, pattern, condition de maîtrise, lettre du bilan d'intervention | Suivent `reperesPerformance`, sans autre changement | Lecture des appels ; banc : filtre P (F1), pattern (B2, B3, C4, lot-A), niveau (cas ci-dessous). Répartition et lettre du bilan : lecture seulement |
| `lireEchelleNoteGlobale` et la note du cours | Non touchés | Diff ; sentinelle |
| B2, B3, C4, F1, `sentinelle-lot-A-737` rebasculés | Fait, chacun avec sa décision nommée en commentaire | Valeurs prévues à la main avant le rejeu, toutes justes |
| Sommative, élève à 80 % dans un groupe à 94 | Niveau 1 avec repère de maîtrise, niveau 3 en points | Sentinelle, vrai chemin ; mutation « repère coupé » : 2 rouges |

**Supposition 1, à relire.** La consigne dit de retirer l'exclusion par famille ; il reste un test de famille, volontaire. `obtenirEchelleResolue(null)` prête à une copie sans échelle la seule échelle de la bibliothèque. En sommative et en spécifications, une copie sans `echelleId` n'a donc pas d'échelle. Standards et dénotation gardent leur lecture de toujours : leurs vieilles copies sans `echelleId` en dépendent.

**Supposition 2.** Copies en points et copies sur échelle mêlées : les repères de l'échelle se lisent, et les copies en points ne font pas de divergence.

**Supposition 3.** Sans pratique assignée : toujours pas d'échelle, comme avant.

## § 1. Le lot 1

| Point | État | Vérifié comment |
|---|---|---|
| L1-1 Barre P : deux cas séparés | Fait (`phraseSansRepartition`) | Sentinelle ; mutation : 1 rouge. Le chemin complet de la carte n'est vu que par lecture de source |
| L1-2 Bouton lit les défauts à la source ; textes alignés | Fait | Sentinelle ; lu dans WebKit : « Remettre les valeurs par défaut (85 % · 90 % · 95 %) » |
| L1-6 Pack de démo 21.3 | Fait, build suivi (sentinelle #825) | Sentinelle ; `73622888` |
| L1-7 Dégradé retiré | Fait | Sentinelle |
| L1-7 Repères lus une fois par rendu (Liste) | Fait | Sentinelle : un seul `reperesPerformance()` dans `etudiants.js` |
| L1-7 `sentinelle-lot-F-860` A4 capable d'échouer | Fait : 59 passe, 60 non | La sentinelle tourne ; non muté à part |

## § 2. Le lot 2

| Point | État | Vérifié comment |
|---|---|---|
| L2-1 Deux motifs ; l'Aide dit le minimum de 5 | Fait | Sentinelle |
| L2-3 « Progression favorable » : le seul `pattern === 'Stable'` | Fait | Sentinelle ; mutation : 1 rouge |
| L2-5 Références sur tout le cours, par numéro de groupe | Fait ; `indicesPatternsRaI` juste pour tous les groupes par construction | Sentinelle : même niveau quelle que soit la vue ; mutation : 1 rouge. Le signal ne parle que du groupe à l'écran ; mutation : 1 rouge. Le contenu écrit dans `indicesPatternsRaI` n'est pas lu par un test |
| L2-5 « Rien n'est écrit » corrigé au rapport | Fait | Rapport du lot 2 |
| L2-6 Cas qui départagent | Fait : n et n−1, 5 et 6, repère sur le vrai chemin, remplacée, diagnostique, non recevable | Une mutation par cas, toutes rouges |
| L2-7 Garde de la cible alignée ; phrase corrigée au rapport | Fait | Sentinelle ; mutation : 1 rouge |
| L2-8 Passages hors lot encadrés | Fait | Sentinelle ; chrono ci-dessous |
| L2-10 `signalGroupe` retiré | Fait | Sentinelle |

**Chrono, H2026, 46 élèves, un groupe à l'écran, avant `5b154aeb` et après `73622888` (médiane de 5, une seule machine) :**

| Passage | Avant | Après |
|---|---|---|
| Rendu de la Liste (`afficherListeEtudiantsConsultation`) | 262 ms | 63 ms |
| `calculerEtStockerPatternsGroupe` | 213 ms | 32 ms |

## § 4 bis. Non touché

L2-2 (niveau 1 avec « Difficulté persistante ») : en attente de Grégoire, avec les questions 2 à 5.

## § 5. Inscrit

#1197 (défi principal sans `echapperHtml`), #1198 (L1-4), #1199 (L1-5), #1200 (`SEUIL_POINTS_PRIORITE`).

## Écart avec la consigne

- `node scripts/release.mjs --build-only` lancé, parce que le pack de démo a changé (sentinelle #825) : ce n'est pas un bump, le numéro de version reste le même.
- `temoin-tous-les-groupes.mjs` chronomètre maintenant les deux écrans ci-dessus.
- La bulle `tdb-rai` et le glossaire nomment aussi le minimum de 5 élèves, au-delà de l'Aide demandée.

## Les mots à valider (§ 3)

Rien n'est posé comme validé. Grégoire les reçoit un écran à la fois, après ce lot.

**Carte du profil, sous le niveau**
- « Plus d'un écart-type sous la moyenne de son groupe. »
- « Entre un demi et un écart-type sous la moyenne de son groupe. »
- « Sous la note de passage, alors que la moyenne de son groupe est au-dessus. »
- « Sous la note de passage, comme la moyenne de son groupe : un signal pour l'enseignement universel. »
- « Une seule copie corrigée : pas encore de comparaison au groupe. »
- « Moins de 5 étudiant·es ont une copie corrigée dans son groupe : pas de comparaison possible. »
- « Sous la note de passage. Moins de 5 étudiant·es ont une copie corrigée dans son groupe : pas de comparaison possible. » (neuve, constat 2)
- « Au repère de maîtrise de l'échelle ou au-dessus, même si sa note est sous la moyenne de son groupe. »
- « Dans la moyenne de son groupe. Suivi régulier en classe. »
- « Aucune note à comparer pour l'instant. »

**Aperçu**
- Sous la barre RàI : « La moyenne du groupe (X %) est sous la note de passage (60 %) : c'est l'enseignement universel qu'il faut renforcer, pour tous. »
- Sous la barre P, échelles divergentes : « Les copies de ce groupe n'ont pas d'échelle unique : pas de répartition par niveaux. » ; sans échelle : « Les copies de ce groupe sont notées sans échelle : pas de répartition par niveaux. » (neuve, constat 5) ; suivi au besoin de « N étudiant·es sans note constructible ne sont pas compté·es. »

**Labo › Outils d'observation**
- Étiquette : « Liste des étudiant·es › couleur des colonnes A et C »
- Bouton : « Remettre les valeurs par défaut (85 % · 90 % · 95 %) »
- Paragraphe : « Ces trois seuils colorent les colonnes Assiduité et Complétion de la liste des étudiant·es, et choisissent les mots… »
- Bulle : « Seuils de couleur pour les indices A et C, en quatre paliers. P suit les repères de ton échelle. Détermine les alertes du tableau de bord. »

**Le niveau expliqué (les quatre surfaces du lot 2, avec le minimum de 5)** : la section RàI de l'Aide (`index.html`), le guide RàI (`guides-pedagogiques.js`), le glossaire (`accompagnement-contenu-terme.js`), la bulle `tdb-rai` et les listes de niveaux des fenêtres d'aide (`accompagnement-contenu-popup.js`). Plus les deux phrases d'`index.html` et de la bulle du suivi : « qui compare la moyenne des copies au groupe-cours ».

**Aide, « Repérer les patterns »** (neuve, constat 1) : « Le pattern nomme le besoin sans fixer le niveau : le niveau compare la moyenne des copies au groupe-cours (voir la carte juste au-dessus). »

**Du lot 1, déjà au rapport du lot 1** : ils restent à valider. Aucune phrase de l'Aide ne disait que la sommative n'a pas d'échelle pour ses signaux : rien à ajouter pour le § 4.

## Retouche 2 (consigne `CONSIGNE-LOT-2026-10-30-retouches-seuils-et-niveau-2.md`, verdict de Cowork du même jour)

Commit `1aa8393c`. **Écart demandé par Grégoire (30 oct., vers 12 h 15)** : « je voudrais qu'on fasse la release maintenant » ; la consigne disait pas de push, pas de bump, pas de verdict complet, et Cowork relira. Cette retouche part donc en ligne **sans relecture de Cowork**, et ses mots **sans validation** : ils restent à valider après coup.

| Point | État | Vérifié comment |
|---|---|---|
| Constat 1, Aide « Repérer les patterns » | Fait ; phrase périmée retirée, moitié « texte » de la sentinelle recalée | Mutation « ancienne phrase » : 1 rouge |
| Constat 2, sans référence de groupe | Fait : motif `sous-la-note-sans-groupe`, sa phrase | Mutation « motif retiré » : 2 rouges |
| Constat 3, garde par famille | Inscrit : #1201 | `BACKLOG.md` |
| Constat 4, le test sans échelle en bibliothèque | Fait : échelle à repères en bibliothèque, témoin en standards | Mutation « garde retirée » : 1 rouge |
| Constat 5, barre P selon `raison` | Fait | Mutations « raison ignorée » et « raison non transmise » : 1 rouge chacune |
| Constat 6, « élèves » → « étudiant·es » | Fait, aux cinq endroits | Mutation sur la carte du profil : 1 rouge ; les quatre autres : `grep`, plus aucun « 5 élèves » |
| Constat 7, service d'orthopédagogie sans banc | Inscrit : #1202 | `BACKLOG.md` |
| Constat 10, commentaire de l'audit | Fait | Diff |
| Paire « niveau 1 / Difficulté persistante » | Non touchée, en attente de Grégoire | Diff |
| Vitest entier | 854 fichiers, 10 425 essais verts | `cd tests && npx vitest run`, avant le commit |

**Supposition** : sous la barre P, « notées sans échelle » couvre toute `raison` autre que `echelles-divergentes`, donc aussi `sans-pratique`, sans phrase à part : le verdict demandait la phrase selon `raison`, et une note construite sans pratique assignée n'a pas été observée. Non vérifié ici : Safari, iPad, ce rendu à l'écran.
