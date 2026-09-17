# Consigne suivante – la synthèse de rétroaction sans copie (#912)

> Écrite le 17 septembre 2026, 15 h 08 (Toronto), par Cowork, après le commit de 1.142.32 (#911) et AVANT son push.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer **1.142.32** (le correctif du bug #911, `554f9bb3`) ; sinon, arrête-toi et signale-le — le verdict Playwright de ce commit doit être rendu et le push fait. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-evaluations-sans-copie.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-synthese-sans-copie.md` en `CONSIGNE-DU-JOUR.md`.
> ⚠ `CONSIGNE-SUIVANTE-date-d-arrivee.md` (le champ « Date d'arrivée », #735) reste en file DERRIÈRE celle-ci. Ne la renomme pas.
> **Identifiant** : relis la ligne « Dernier ID utilisé » sur `main` (elle était à #912) avant d'en prendre un ; `grep` les deux registres.

Mandat : **#912**, tranché par Grégoire le 17 sept. vers 15 h. **Aucune question ne l'attend**, sauf la phrase de « Nouvelles » et toute phrase de l'Aide que tu réécrirais.

## 1 · La règle (#912)

- **Sans copie, « Dossier PDF » rend la synthèse seule** : un PDF d'une page, **la même synthèse** que celle remise avec une copie, **sans section d'annotations**. **Aucun bouton neuf**, aucune entrée de menu neuve.
- Écartés par Grégoire : une entrée distincte « Synthèse (PDF) » ; une synthèse à l'écran sans fichier ; inscrire et attendre.
- **Pourquoi maintenant** : symptôme vécu — tout l'Automne 2025 de Grégoire, **303 évaluations sans aucune copie** (mesuré par sonde le 17 sept. : `avecFichier: 0`). Ce trimestre est le cas d'usage d'origine de l'application : évaluer avec les grilles et les échelles, puis recopier la rétroaction dans Léa à la main.

## 2 · Ce que Cowork a lu `[lecture]`, à REMESURER avant de coder

- **La porte unique** : « Dossier PDF » (`liste-evaluations.js:1262`, `value="dossier|<da>|<prodId>"`) passe par l'export de `travaux-archivage.js`, qui filtre les FICHIERS du groupe et **lève « Aucun fichier trouvé pour ces critères. » quand la liste est vide** (`:179`). Une évaluation sans copie n'a donc aucun chemin vers sa synthèse.
- **La synthèse elle-même** : `syntheseRetroactionData.construireFeedback(evaluation, fichier, annotation)` (`synthese-retroaction-data.js:85`) part de l'ÉVALUATION ; le fichier et l'annotation ne servent qu'au compte d'annotations et à ce qui les entoure. **Mesure d'abord** ce qu'elle rend avec `fichier = null` et `annotation = null` : si elle rend déjà un objet complet, le lot est un chemin à ouvrir, pas un calcul à écrire. Dis-le dans ces mots.
- **Le rendu** : `synthese-retroaction-rendu.js` — mesure ce qu'il fait de la section d'annotations quand il n'y en a aucune (section vide, ou absente ?). La règle est : **section absente**, pas une section vide.

## 3 · Ce que le lot doit tenir

1. **Ce PDF part vers l'élève.** Les gardes qui valent pour une copie valent ici : la porte de **#674** (une note qui ne porte pas sur toute la grille refuse de conclure) et le filtre enseignant → élève (rien de ce qui est réservé à l'enseignant ne doit paraître). Prouve-les, ne les suppose pas.
2. **Sur un trimestre archivé, RIEN ne s'écrit.** Contrôle comme au lot #911 : `evaluationsSauvegardees` identique octet pour octet après l'ouverture ET après la génération.
3. **Le nom du fichier produit** : à toi, et **nomme-le comme une supposition** dans ton rapport (aucun mot de Grégoire là-dessus).
4. **Les sept évaluations sans critère d'A2025** : dis ce que la page rend pour elles. Ne les répare pas dans ce lot.

⛔ **Arrêt** : si la synthèse sans copie exige de reconstruire le PDF par un autre moteur que celui qui sert déjà (autre bibliothèque, autre gabarit), arrête-toi et rapporte le périmètre avant de coder — la promesse est « la même synthèse », pas « une autre page ».

## 4 · Preuve attendue

- **Un banc WebKit** sur le parcours réel : une évaluation enregistrée **sans aucun fichier**, « Dossier PDF » depuis la liste, un PDF d'une page rendu, sans section d'annotations. **Rouge sur le code d'avant** (« Aucun fichier trouvé »), vert après.
- **Un essai sur la parité** : avec copie, la synthèse ne change pas d'un mot (témoin).
- **Des mutations qui changent le comportement**, une clause à la fois, dont une qui laisse passer une note incomplète (#674) et une qui fait paraître la section d'annotations vide.
- **Mesuré à 768 px** si un écran change.

## 5 · Mots et traces

- **Phrase de « Nouvelles »** : à proposer à Grégoire par Cowork avant la release.
- **Aide** : si une phrase décrit « Dossier PDF » comme le PDF d'une copie, elle devient fausse — propose les mots, ne les pose pas.
- **Fichiers de Cowork à commiter avec le lot** : cette consigne renommée, son archive, `plans de travail/DECISIONS-2026-09-17-apres-midi.md` (dix décisions rendues le 17 après-midi, chacune avec la ligne exacte à poser sous sa fiche — dont **#909**, le texte pour « aucune échelle dans ce trimestre ») et `plans de travail/CONSIGNE-SUIVANTE-date-d-arrivee.md` (lot en file).
