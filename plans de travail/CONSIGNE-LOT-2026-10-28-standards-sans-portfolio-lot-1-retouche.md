# Consigne – Des standards sans portfolio, lot 1 : la retouche (28 octobre 2026)

> Écrite par Cowork le mercredi 28 octobre 2026 à 21 h 32 (Toronto), sur `main` = `4a72843b` (non poussé). Ne remplace aucune autre consigne.
> Source : `VERDICT-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1.md` (accepté avec une retouche : R1, R2, R3). Décisions : `DECISIONS-2026-10-28-construction-de-la-note.md`, mot neuf 3.

## 0. Avant tout

- Même session ou session neuve : `main` à jour, aucune suite qui tourne.
- Commit de docs seul, fichiers nommés : ce fichier, le verdict ci-dessus, `DECISIONS-2026-10-28-construction-de-la-note.md`.

## 1. Le mandat

1. **R1 – Une catégorie ne compte qu'en hybride.** Dans `obtenirArtefactsIdsPoolStd` (`js/pratiques/pratique-registre.js`), retire la restriction aux productions qui portent une `categorie` : sans « Artefact », le pool est fait de toutes les productions hors conteneur et terminale. `_selectionnerArtefactsHybride` lit déjà les catégories en hybride. Rends vrais le commentaire de la fonction et l'en-tête du bloc (`:777-780`). Le cas de ton banc (une catégorie restée après le retrait de l'hybride) revient de 70 à 77 ; CHIM-3 reste 80,63.
2. **R2 – Une cause propre à l'étudiant·e n'est pas une erreur de configuration.** Quand `causeNoteAbsente` est posée, le profil garde la carte qu'il montrait avant pour cet·te étudiant·e (son titre d'aujourd'hui), sans note, avec la phrase à la place du nombre. Ni l'alerte « Note finale non calculable », ni le bouton « Réglages de la pratique », ni son infobulle : ils restent pour une erreur de configuration (`js/profil-etudiant-sections-affichage.js:2842-2853`). Aucun mot neuf. Si la carte ne peut pas recevoir la phrase sans changer ce qu'elle dit ailleurs, arrête-toi et dis-le.
3. **R3 – Le libellé du doublon** (mot neuf 3, validé par Grégoire à 21 h 31), au caractère près : « en double · comptée une seule fois », au récit Standards (`js/profil-etudiant-actions.js:658`, au lieu de « doublon note-égale ») et au récit sommatif (`js/pratiques/pratique-sommative.js:261`, au lieu de « doublon note-égale · exclu de la moyenne »). Cherche tout autre endroit où l'élève lit ce libellé (PDF, Comparateur) et dis-le.

## 2. Les tests

- La sentinelle `sentinelle-standards-sans-portfolio` : le cas de la catégorie restée → 77 ; CHIM-3 → 80,63 ; tout le reste inchangé. Le libellé du doublon, aux deux récits.
- Break-test (arbre restauré par sha256) : remettre la restriction rougit le cas de la catégorie ; l'ancien libellé rougit les deux récits.
- Playwright ciblé, WebKit : CHIM-6 et GREG-3 montrent la carte et la phrase, aucun bouton « Réglages de la pratique » ; une erreur de configuration garde l'alerte. On attend l'élément, jamais `waitForTimeout`.
- Vitest depuis `tests/`.

## 3. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1-retouche.md` (avant → après de R1, ce que montre la carte pour CHIM-6 et GREG-3, les endroits du libellé, les tests).
- Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
