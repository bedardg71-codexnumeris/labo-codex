# Consigne de lot – les décisions des groupes 4 et 5 : mesures d'intervention, un seul moteur de note, et ce qui se pose au BACKLOG

> Écrite par Cowork (la session qui tient les décisions avec Grégoire) le 15 octobre 2026, réécrite à 11 h 43 (Toronto, mesurée par `date`) : la première version reprenait #683 et #684, que `CONSIGNE-DU-JOUR.md` (11 h 36, l'autre session Cowork) t'a déjà confiés.
> ⚠ **À exécuter APRÈS le lot de `CONSIGNE-DU-JOUR.md` (le matériel de départ), une fois celui-ci commité et relu.** Ce fichier ne remplace pas `CONSIGNE-DU-JOUR.md` : n'y touche pas. Commite ce fichier avec ton lot.

## Où on en est

Le lot du matériel de départ (#683, #684) est commité et relu par l'autre session Cowork (13 h 10). **Remesure avant de toucher.** L'observation s'écrit sous `plans de travail/observation/` : n'y touche pas.

Les décisions sont dans `plans de travail/DECISIONS-2026-10-15-groupe-4.md` et `plans de travail/DECISIONS-2026-10-15-groupe-5.md`, mots compris, avec les lignes à poser au BACKLOG. Commite ces deux fichiers.

Ce qui suivra, chacun en son lot, dans cet ordre (ne les commence pas ici) : les mots des bandes de couleur (#821), le calendrier (#378), la réunion de deux grilles identiques (#291).

## Le mandat

### 1. #777 – les mesures d'intervention ne disent plus 0 pour « non calculable »

Groupe 4, question 1.
- Source : les captures (d'intervention et hebdomadaires) portent le drapeau « note constructible » ; un P non calculable s'écrit et s'affiche « non calculable », jamais 0. Relève tous les lecteurs (trajectoires, courbes, bilans) ; un « non calculable » n'entre jamais dans une moyenne ni dans un écart avant/après.
- Stock : **rien d'office.** Un bouton « Recalculer les mesures des interventions » refait, au clic, chaque mesure avant et après **à sa propre date** par `calculerIndicesHistoriques(da, dateLimite)`. Son emplacement et ses mots (écran enseignant) : propose-les dans la demande de relecture. La fenêtre qui le précède propose le codex, comme toute écriture dans les données.
- Porte terrain : le premier clic sur ses vraies données est le sien. Écris le markdown (skill `portes-terrain`) : mettre à jour le codex, cliquer, voir une intervention de septembre dont la mesure « avant » dit « non calculable ». Cowork publie l'artefact.

### 2. #836 – vérifier seulement

Groupe 4, question 2 (voir la correction de Cowork de 11 h 36 dans le fichier de décisions) : depuis #743, un élève de service sans séance a une présence inconnue. Mesure qu'aucun écran ne lui montre 100 % ni 0 (profil, Suivi, palier RàI, Rencontres). Si un écran le fait, c'est une perte de vérité à corriger dans ce lot ; sinon, une ligne dans la demande de relecture.

### 3. #339 – un seul moteur pour la note hybride, et le zéro fantôme

Groupe 5, question 3, et la mesure de Cowork (`DECISIONS-2026-10-15-groupe-5.md`, « La mesure, faite par Cowork »). Décision de Grégoire (13 h 04) : les réglages du portfolio RESTENT sur les productions ; pas de migration, pas de version majeure.
- Retire `calculerNoteAvecCategories` (`js/portfolio.js` ~772) et son appel (`js/pratiques/pratique-pan-standards.js` ~145) **après avoir prouvé au banc, avant/après, qu'aucun chiffre visible ne change** (démo, toutes pratiques, notes provisoires et finales : P stocké, snapshots, profil, Comparateur, export). Si un chiffre bouge, arrête-toi et remonte à Cowork.
- Corrige le zéro fantôme : une terminale marquée « obligatoire » (`pratiques-gestion.js` ~2698) ne compte plus au dénominateur des obligatoires du portfolio en notes finales (`profil-etudiant-actions.js` ~244, ~476) ; elle garde sa propre pondération (~536). Banc : la configuration S1 de la mesure (démo, DEMO007 : 85,53 en provisoire ne doit plus tomber à 66,65 en final par ce seul effet). Notes de cet automne : seules les notes finales d'une pratique ainsi réglée changent, vers le haut ; dis-le dans le rapport.
- Ligne des Nouvelles si le second point change un écran.

### 4. #1016 et #935 – deux corrections courtes

- #1016 : l'aide de `js/accompagnement-contenu-popup.js` (~991), les mots de Grégoire tels quels (fichier du groupe 5, question 1). Vérifie que « courbes de progression » est le nom que l'écran donne au P historique ; sinon, remonte à Cowork.
- #935 : le seuil par défaut d'une pratique par spécifications sans seuil devient 100 % partout ; un seuil écrit à 0 n'est plus lu comme 60 (fichier du groupe 5, question 2, avec sa garde : si une pratique existante n'a aucun seuil, remonte avant de toucher le moteur).

### 5. Le BACKLOG

Les lignes « à poser » de `DECISIONS-2026-10-15-groupe-4.md`, telles quelles, sous leur fiche : #777, #836, #821, #742, #36, #35. Coche #742, #36, #35 ; coche #777 si tout son périmètre est fait. #836 et #821 restent ouvertes (#821 attend son lot). Et celles de `DECISIONS-2026-10-15-groupe-5.md` : #1016, #935, #339 ; coche-les si leur partie est faite entière.

## Source ou stock

#777 : source réparée ; le stock reste tel quel jusqu'au clic de l'enseignant. #339 : aucune donnée réécrite ; seules les notes finales calculées d'une pratique à terminale « obligatoire » changent.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-groupes-4-et-5.md`, avec les mots proposés pour #777. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Propose une ligne des Nouvelles. Rapport court à Grégoire en gestes d'utilisateur.

## Verdict de Cowork, 15 oct. 2026 à 13 h 31 (Toronto, mesuré par `date`)

**Relu sur `d69115d3` et `0c61e614` : accepté. Les trois points qui t'attendaient sont tranchés ci-dessous ; fais-les en un commit court.** Vitest non relancé par Cowork (ta suite verte, 8 814 sur 8 814, et les break-tests décrits font foi). Le banc avant/après de #339 (0 différence au retrait seul ; au zéro fantôme, 61 valeurs qui montent, toutes en H2 final, aucune qui baisse) est accepté comme preuve.

### 1. #777 : option A, pas de bouton

Remesuré par Cowork : le seul lecteur d'affichage de `snapshotAvant` (`js/interventions.js` ~1157-1170) lit `snap.criteres`, jamais `snap.P` ; les autres lecteurs (`correction-da.js`, `reserve.js`) le déplacent ou le filtrent sans l'afficher. Un bouton réécrirait dans les données de Grégoire un nombre qu'aucun écran ne montre. La décision de Grégoire de 11 h 30 reposait sur une mesure visible qui n'existe pas ; Cowork le lui dit. Pose sous #777 la ligne suivante, telle quelle, et coche la fiche :

`**15 oct. 2026 (Cowork) : pas de bouton.** Une nouvelle mesure « avant » écrit « non calculable » au lieu de 0. Le bouton prévu par la décision de 11 h 30 n'est pas construit : le seul écran qui lit la mesure « avant » (le bilan) lit les critères, jamais le P ; les captures hebdomadaires se refont déjà par « Recalculer les captures ». Détail : plans de travail/DEMANDE-RELECTURE-2026-10-15-groupes-4-et-5.md, question 1.`

### 2. #1016 : les mots de Grégoire, tels quels

« Courbes de progression » est le mot que l'application emploie déjà pour la même case, au même moment : le bandeau des consignes non transmises (`js/evaluation.js` ~2407, « ses copies ne comptent pas dans les courbes de progression »). L'aide et le bandeau parlent ensemble ; le titre de section « Progression temporelle ACP » n'a pas à être cité. Corrige l'aide avec la phrase du fichier du groupe 5, question 1, telle quelle ; pose sa ligne sous #1016 et coche-la.

### 3. L'écran des catégories : la terminale sort des obligatoires cochables

Choix de Cowork : la première des deux voies, sans mot neuf. La terminale n'est plus proposée parmi les obligatoires (même logique que l'exclusivité qui existe déjà entre les deux listes, `chargerProductionsPourCategories`), et `recalculerPonderationsUnitaires` (`js/pratiques-gestion.js` ~2768) l'écarte de son compte, y compris quand une configuration existante la porte cochée. La terminale se reconnaît par la même source que `_selectionnerArtefactsHybride`. **Rien n'est réécrit** : la marque déjà posée sur la production reste, inerte pour le calcul comme pour l'écran. Motif : l'écran affichait « 35 % ÷ N » pour un calcul qui divise désormais par N − 1, en provisoire comme en final. Un essai, rougi par sa mutation.

### Le reste

- Commite aussi `plans de travail/CONSIGNE-DU-JOUR.md` (verdict de 13 h 10) et ce fichier. `DECISIONS-2026-10-15-groupe-6.md` n'est pas à toi : laisse-le.
- Les deux lignes des Nouvelles proposées seront soumises à Grégoire avec la version du soir. Si le point 3 change l'écran, ajoute-le à la première (« … elle n'est plus proposée parmi les obligatoires »), proposé, non posé.
- Pas de nouvelle demande de relecture : rapport court à Grégoire, et le hash du commit.

### Relecture de `bb7cc770` (Cowork, 13 h 38) : conforme, lot clos

Lu au diff : l'aide porte la phrase de Grégoire ; la terminale sort de la liste des obligatoires et du compte de l'écran, par la même source que la note (`identifierProductionTerminale`) ; rien n'est réécrit. **Issue 3, sans fiche** : la terminale reste proposée dans la liste « Sélection », où elle est tout aussi inerte (sa copie n'entre jamais dans le pool) ; le seul effet visible serait un « (N dans le pool) » qui compte un de trop si on l'y coche. La pondération unitaire de la Sélection, elle, ne dépend pas de ce compte.
