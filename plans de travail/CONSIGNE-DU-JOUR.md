# Consigne du jour – préparer la clôture de l'hiver 2026 et l'archivage de ses copies

> Écrite par Cowork le 14 octobre 2026 à 10 h 41 (Toronto, mesurée par `date`). L'ancienne consigne (le texte « À propos », avec le verdict de Cowork de 10 h 37) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-14-accueil-a-propos.md`. Commite ce fichier et le déplacement avec ton lot.

## Où on en est

`main` à `92f63708` au moment de l'écriture : le lot « À propos », relu par Cowork, conforme, non poussé ; le rouge Vitest de la sentinelle anti-cache est attendu jusqu'à la release du soir. **Remesure avant de toucher.** Une autre session écrit en parallèle le temps 3 de l'observation (`plans de travail/observation/`) : n'y touche pas.

## La décision de Grégoire (14 oct. 2026, 10 h 39)

Question 1 du groupe 1 des décisions (`plans de travail/DECISIONS-A-PRENDRE-2026-10-11.md`, resté sur la branche `origin/claude/inspiring-mccarthy-99htj8`, absent de `main`) : son codex approche la limite de 2 Go (#992 : 1,33 Go le 29 sept. ; borne estimée début à mi-novembre, sur deux points). **Il clôt l'hiver 2026 pour pouvoir en archiver les copies** (#1028, en ligne depuis 1.186.0), en gardant toutes les données du trimestre. C'est une levée du moratoire sur la clôture (#622) **pour ce trimestre-là seulement** ; les autres trimestres restent sous moratoire tant que #622 n'est pas traité.

**Les gestes sur ses vraies données sont les siens** : mettre à jour son codex, clore, archiver le trimestre, vérifier, archiver les copies. Ton lot les prépare et les éprouve ailleurs ; il n'en fait aucun.

## Le mandat : un lot, trois parties

### 1. Mesure en lecture seule : ce que pèsent les copies de l'hiver 2026

- Dans son dernier codex : le poids des copies de l'hiver 2026, celui des autres trimestres, le total. Lecture seule de l'archive (liste des entrées et de leurs tailles) : jamais d'ouverture dans l'application, jamais de copie du fichier. Si tu ne trouves pas le fichier, demande-lui où il est, en une seule question.
- ⚠ Confidentialité : le rapport ne cite aucun nom de fichier ni d'élève, seulement des sommes par trimestre (règle 6 de `CLAUDE.md`).
- Où vivent ces copies : dans le navigateur, ou dans son dossier sur disque ? Ce que le codex en emporte dans chaque cas, donc ce que l'archivage des copies allégera réellement.
- La marge qui restera après : en Mo, et en semaines au rythme mesuré (dis sur combien de points repose le rythme).

### 2. Le chemin complet, éprouvé au banc sur un trimestre fictif

Dans l'ordre que l'écran impose : codex à jour → « Clore » → « Archiver le trimestre » → « Vérifier » → « Archiver les copies » → codex mis à jour, plus léger → « Rouvrir », puis « Clore » de nouveau, pour prouver que la clôture se reprend. Pour chaque étape : ce qui s'écrit (clés, champs), ce qui est refusé et pourquoi (`creerSnapshotRessources` qui refuse sur des cartouches non migrées, `refusImmediat`, trimestre actif…), ce que l'écran dit. Noms manifestement fictifs.

- Au passage : `archiverTrimestre` (`js/trimestres.js`) écrit `dateFin` à la date du jour. Cowork a lu que le calendrier se sert de `cadreCalendrier.dateFin`, pas de ce champ ; confirme qu'aucun écran ni calcul ne lit `trimestre.dateFin` comme la fin du trimestre.
- Ce qui pourrait empêcher la clôture de l'hiver 2026 chez lui et se lit dans le code sans ses données : liste-le, avec le geste qui le lève.

### 3. Ce qui se corrige sans lui, dans le même lot

- « Clore » et « Rouvrir » parlent encore par `confirm()` et `alert()` (`js/trimestre-v2-liste.js`, `confirmerArchivage`, `confirmerDesarchivage`), laissés tels quels « à cause du moratoire » (#1037). Passe-les aux fenêtres et notifications de l'application, **avec les mots d'aujourd'hui, sans retouche** : un mot changé remonterait à Grégoire.
- « La copie de sauvegarde que rien ne relit » (#622, selon la remesure du 11 oct.) : mesure ce qu'elle est ; si elle est morte, applique les trois issues de `CLAUDE.md`.
- Rien d'autre. Toute trouvaille hors de ce chemin : issue 2, inscrire et continuer.

### Source ou stock

Source seulement : aucune donnée déjà écrite n'est réécrite. Les gestes sur l'hiver 2026 viendront après, de sa main.

## Le livrable pour Grégoire : une porte terrain

Skill `portes-terrain` : le markdown `plans de travail/PORTE-2026-10-14-clore-et-alleger-l-hiver-2026.md`, en gestes d'utilisateur, dans l'ordre, chacun avec ce qu'il doit voir et ce qui l'arrête (un refus, une différence à la vérification). Première rangée : mettre à jour son codex avant de toucher à quoi que ce soit. Dis sur quel appareil et dans quel navigateur la porte se passe (là où vit son espace réel). Cowork publie l'artefact jumeau.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-14-clore-l-hiver-2026.md`. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Rapport court à Grégoire en gestes d'utilisateur : ce qu'il aura à faire, combien de temps cela prend, et combien de marge cela lui donne.
