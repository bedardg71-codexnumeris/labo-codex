# Consigne du jour – les décisions des groupes 1 et 2 : ce qui se fait sans Grégoire

> Écrite par Cowork le 15 octobre 2026 à 11 h 01 (Toronto, mesurée par `date`). L'ancienne consigne (« Ton codex dit vrai », avec le verdict de Cowork de 9 h 46) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-15-ton-codex-dit-vrai.md`. Commite ce fichier et ce déplacement avec ton lot, ainsi que les trois fichiers neufs de `plans de travail/` nommés plus bas.

## Où on en est

`main` à `962f1214` au moment de l'écriture : le lot « Ton codex dit vrai » (`69fdd026`) est relu et accepté, non poussé. **Remesure avant de toucher.** Une autre session écrit l'observation sous `plans de travail/observation/` : n'y touche pas.

Grégoire tranche ce matin, une à une, les 42 questions de `DECISIONS-A-PRENDRE-2026-10-11.md`. Ce lot exécute ce qui, dans ses décisions des groupes 1 et 2, ne demande plus rien de lui. Le bulletin (#333) et l'encadré de l'épreuve uniforme (#668) n'y sont pas : leurs mots lui seront soumis d'abord.

## Les fichiers neufs à commiter (écrits par Cowork)

- `plans de travail/DECISIONS-A-PRENDRE-2026-10-11.md` : copie conforme du fichier resté sur `origin/claude/inspiring-mccarthy-99htj8` (commit `50919a92`), pour qu'il soit enfin sur `main`.
- `plans de travail/DECISIONS-2026-10-15-groupe-1-fin.md`
- `plans de travail/DECISIONS-2026-10-15-groupe-2.md`

## Le mandat : un lot, trois parties

### 1. En tête, le commentaire du verdict de 9 h 46

Dans `js/codex.js`, à l'endroit où l'erreur d'écriture d'un fichier tenu est avalée avant d'ouvrir la fenêtre de choix : un commentaire de deux lignes qui dit que la cause du premier échec ne parvient pas au message, que le second échec (par la fenêtre de choix) porte la sienne, et que c'est une issue 3 assumée (15 oct.).

### 2. #489 – retirer le verrou d'une production entière

Décision de Grégoire à 10 h 51 (`DECISIONS-2026-10-15-groupe-2.md`, question 1).

- Retirer `verrouillerEvaluation` (`js/productions.js`, définition, export `window.`, mention dans l'en-tête du module) et son entrée dans `noms_stables.json`. ⚠ **Zone protégée : l'autorisation de Grégoire est donnée** (15 oct. 2026, 10 h 51, dans le même « oui ») ; cite-la dans le message de commit.
- Retirer `verrouillerEvaluationIndividuelle` et `deverrouillerEvaluationIndividuelle` (`js/evaluation.js`), sans appelant vivant depuis l'inventaire A7 du 27 sept.
- Le commentaire de `basculerVerrouillageEvaluationCourante` dit que « les fonctions de la Banque et du verrouillage en lot » n'ont aucun appelant vivant : **remesure** ; retire celles qui le confirment, et liste-les dans la demande de relecture.
- Le drapeau `verrouille` **des productions** : s'il n'a plus aucun lecteur, les créateurs cessent de l'écrire (`productions.js`, `productions-liste.js`). Les schémas d'import continuent de le tolérer (ce qui voyage). ⚠ Ne pas confondre avec le `verrouille` des grilles, échelles et cartouches, qui vit.
- Rien à l'écran. Le verrou d'une copie (« Verrouiller l'évaluation », le cadenas) ne change pas : le banc le prouve.
- Source ou stock : source seulement. Le champ déjà écrit dans les productions existantes reste, inerte ; il n'est pas réécrit.

### 3. Les lignes à poser au BACKLOG

Chacune est écrite, telle quelle, dans les fichiers de décisions (« Ligne à poser sous #… ») : recopie-les sous leur fiche.

- Depuis `DECISIONS-2026-10-15-groupe-1-fin.md` : #463, #336, #544. Coche #544 (sortie).
- Depuis `DECISIONS-2026-10-15-groupe-2.md` : #489 (coche-la quand la partie 2 est faite), #835, #668, #275 (coche-la), #333.
- Les fiches restent ouvertes sauf celles nommées ici.

## Pas de porte terrain

Rien ne change à l'écran. Les bancs suffisent : un verrou statique (plus aucune occurrence des trois fonctions retirées hors des fichiers d'historique), et le verrou d'une copie toujours vivant. Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-groupes-1-et-2.md`. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Pas de ligne des Nouvelles : rien de visible. Rapport court à Grégoire.
