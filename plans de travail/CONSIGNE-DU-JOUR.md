# Consigne du jour – #1142, la retouche de la relecture, et #1143 avant la version (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 9 h 32 (Toronto, mesuré par `date`), sur `main` à `3ebcd4ae` (non poussé). Elle remplace la consigne urgente de 8 h 24, exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-compte-erreurs-autre-copie.md`. Source : `VERDICT-RELECTURE-2026-10-23-compte-erreurs-autre-copie.md` (accepté), **à lire d'abord**.

## 0. Avant tout

`git status` : le verdict, cette consigne et son archive viennent de Cowork. **Commit de docs seul, d'abord**, fichiers nommés.

## 1. La retouche – l'invariant, pour toute l'évaluation

Le banc « le pivot et la base ne partagent aucun objet » parcourt **tous** les objets imbriqués du pivot et de l'évaluation enregistrée, à l'ouverture et après le verrouillage, et rougit sur le premier partagé (chemin nommé dans le message). S'il en trouve un autre que les deux déjà copiés, le copier comme eux. Break-test : une des copies retirée le rougit.

## 2. #1143 – la spec de la palette sur iPad

1. Établir d'abord si l'instabilité vient du **banc** (mesure trop tôt, défilement pas encore rendu) ou du **code** (la compensation du saut qui manque) : instrumenter, rejouer au moins dix fois, et dire ce qu'on a vu.
2. Si c'est le code : le corriger ; c'est un saut réel sous le doigt de Grégoire. Si c'est le banc : attendre ce que le code garantit, sans relâcher le seuil.
3. Preuve : dix passages verts de suite, portrait et paysage.

## 3. Tests

Vitest depuis `tests/`, puis les specs WebKit d'Annoter, de l'évaluation, du critère algorithmique et du texte troué. **Ni verdict complet, ni release** : ils se prennent au signal de Grégoire, avec ses Nouvelles.

## 4. Clôture

- Commit sur `main`, non poussé, fichiers nommés ; demande de relecture courte, `DEMANDE-RELECTURE-2026-10-23-1142-retouche-et-1143.md`.
- **Propose dans ton rapport les items des Nouvelles** de la prochaine version (l'étape 2b, la palette ; #1142), pas écrits : Cowork les soumettra à Grégoire.
- #1143 coché au BACKLOG avec sa phrase « vérifié comment ».
