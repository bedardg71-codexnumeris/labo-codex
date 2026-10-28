# Consigne – La note suit les décisions de Grégoire (E1, E2, E3, E4, E7 ; #1152, trou 2)

> Écrite par Cowork le mercredi 28 octobre 2026 à 14 h 47 (Toronto, mesuré par `date`), sur `main` = `958d11ea`. Ce fichier ne remplace aucune autre consigne : n'y touche pas. **Ordre** : ce lot passe **avant** les lots 4 et 5 de l'Aide (il change ce que leurs textes décrivent).
> Sources : `RAPPORT-2026-10-28-construction-de-la-note.md` (ta mesure) et `DECISIONS-2026-10-28-construction-de-la-note.md` (les décisions de Grégoire, 14 h 43 à 14 h 46, mot pour mot ; les dispositions de Cowork pour le reste).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier, `DECISIONS-2026-10-28-construction-de-la-note.md`, `TEXTES-2026-10-28-aide-sept-trous.md`, `TEXTES-2026-10-28-textes-d-ecran.md`, `CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md`, `CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md`, `VERDICT-RELECTURE-2026-10-28-aide-lot-3.md`. Rien d'autre.
- **Tarir et stock** : chaque correctif se lit **au calcul** ; aucune écriture dans les données de personne ; les captures déjà prises gardent leurs valeurs (écris-le). Des notes vont changer chez les utilisateurs : dis lesquelles, famille par famille, dans la demande (elles iront aux Nouvelles).

## 1. Le mandat

1. **E1** : en sommative, une pondération de 0 vaut 0 ; une pondération absente garde 1 (`js/pratiques/pratique-sommative.js:101, 151` ; cherche les autres `ponderation || 1` qui font la note, et dis ce que tu fais de chacun). Toutes les productions à 0 : la note n'est pas constructible (jamais `NaN` ni 0).
2. **E2** : « Portfolio de progression » sort de l'assistant ; `'portfolio'` rejoint `REGLES_RETIREES` (tu, pas réécrit) ; la ligne « À régler » de l'Aide (`accordeon-aide-pratique`) ne le nomme plus (« une règle spéciale, s'il y a lieu (« Verrou sur une évaluation ») »).
3. **E3** : en hybride, la réponse « Nombre d'artefacts retenus pour la note finale » alimente `categories.selection.nombreARetenir` à la création d'une pratique ; une pratique déjà créée garde son nombre (aucune migration).
4. **E4** : une originale gardée compte jusqu'à ce que sa reprise **entre dans la note** (évaluée et verrouillée) ; alors la reprise la remplace. Une originale supprimée (réglage « Supprimer ») : la production reste hors de la note d'ici là. Une seule règle, au registre (`evaluationEntreDansLaNote`), pour les trois familles ; mesure d'abord qui d'autre lit `remplaceeParId` (affichage, badges « Remplacée », Liste, PDF) et dis ce que chacun doit montrer pendant la fenêtre (rien ne change à l'écran sans le dire).
5. **E7** : le « Statut » de l'export (`js/export-resultats-finaux.js:101`) dit « provisoire » tant que « Notes finalisées » n'est pas cochée, toutes familles ; en standards, une terminale **prévue** (une production de type « Évaluation terminale » existe) qui ne compte pas encore garde « provisoire ». ⚠ Ajout de Cowork (28 oct., 14 h 55, après une remarque de Grégoire : une pratique Standards peut n'avoir ni portfolio ni terminale, en chimie par exemple) : **une pratique sans production terminale ne reste pas « provisoire » pour cette raison, ni à l'export ni au profil** (STD-4, STD-C4 : mesure, puis corrige s'il le faut ; dis-le) ; ne code rien qui suppose un portfolio ou une terminale au-delà de ce que le calcul fait déjà.
6. **Commenter** (issue 3) : E8, E9, E10, E12, aux sites du rapport.

## 2. Les tests

- Le banc de la mesure (`sentinelle-construction-de-la-note-2026-10-28`) suit les décisions : chaque cas qui change dit **avant → après** et cite la décision (E1 à E7) ; aucun autre cas ne bouge (si un autre bouge, arrête-toi et dis-le).
- Un essai par décision qui rougit sans son correctif (break-test, arbre restauré par sha256) ; le stock : une copie déjà verrouillée suit sans écriture.
- Vitest depuis `tests/` ; Playwright ciblé : une reprise accordée en sommative (la note ne bouge pas avant la réévaluation), et l'export d'une pratique sans « Notes finalisées » (« provisoire »).

## 3. Clôture

`BACKLOG.md` : une fiche pour ce lot (E1 à E7), cochée s'il est fait ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-28-construction-de-la-note-correctifs.md` (décision par décision : avant, après, preuve, test ; les notes qui changent). Pas de release, de verdict ni de push sans le signal de Grégoire.
