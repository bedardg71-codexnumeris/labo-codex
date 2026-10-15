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
