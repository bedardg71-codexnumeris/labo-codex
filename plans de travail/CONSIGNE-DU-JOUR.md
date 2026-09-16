# Consigne du jour – #651 : « Annoter » depuis la liste des évaluations ouvre la copie AVEC sa palette

> Écrite le 16 septembre 2026, 15 h 07 (Toronto), sur `a989bfdf` (`main` = `origin/main`, `1.142.14` en ligne).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-14-864-verrouillage-cartouches.md`.
> Choisie par Grégoire le 16 sept. : il travaille en ce moment dans la section Évaluations. Symptôme VÉCU (sa capture, 31 août). Aucun arbitrage attendu de lui.

---

## 1 · LE SYMPTÔME

Dans Évaluations › liste, menu d'actions d'une ligne › « Annoter », **quand le mode courant de la visionneuse est Évaluer** : la copie s'ouvre **sans aucune palette** (ni celles d'annotation, ni celles d'évaluation), et le bouton d'actions reste libellé « Évaluer ».

## 2 · CE QUE COWORK A MESURÉ SUR `a989bfdf` – par lecture, pas par exécution

Travaille par SYMBOLE ; les lignes sont indicatives.

- **La cause écrite dans la fiche tient toujours.** `ouvrirFichier` (`js/travaux-ui.js` ~3452) : `if (modeAvantNavigation === 'evaluer' && !window._apresOuvertureFichier && …)` puis `else if (modeAvantNavigation !== 'evaluer')`. Mode d'avant = `evaluer` **et** un rappel posé ⮕ **aucune des deux branches**. `ouvrirAnnotationDepuisListe` (`js/liste-evaluations.js` ~1403) pose un rappel **no-op** ; son appelant est vivant (le `switch` du menu d'actions, `case 'annoter'`, ~1346).
- ⚠ **NOUVEAU depuis l'inscription de la fiche : la zone morte s'est élargie.** Le 6 sept., #761 (`ddc94fcf`) a fait poser par `ouvrirFichier` LUI-MÊME un rappel no-op (~3337) quand on arrive hors de la sous-section (vignette de « Travaux soumis » dans le profil), puis se rappeler à +500 ms. Au second passage, le rappel est posé ⮕ si le mode d'avant est `evaluer`, **même zone morte**, alors qu'avant #761 ce chemin restaurait le mode Évaluer. **Non reproduit par Cowork** : à mesurer.
- ⮕ **Le drapeau sert donc à DEUX usages que la branche ne distingue pas** : « ne restaure pas la session » (les deux no-op, qui n'installent aucun mode), et « l'appelant installera Évaluer lui-même » (`evaluation.js` ~229, `liste-evaluations.js` ~1859, `profil-etudiant-actions.js` ~78). Les no-op bloquent la branche sans rien installer à sa place.
- **La fiche est périmée sur un point** : `_majLabelBtnActions`, qu'elle nomme pour le libellé, **n'existe plus nulle part dans `js/`** (voir plutôt ce qu'a posé #798, `sentinelle-798-libelle-mode-annoter-evaluer`).
- **Trouvaille, code étranger** : `window._resterEnModeAnnoter` est LU (`travaux-ui.js` ~3452, `evaluation.js` ~1319) et remis à faux (~3301), mais **aucune ligne de `js/` ne le met à vrai**. Ne t'en sers pas comme remède sans l'avoir vérifié ; issue à nommer (défaut : inscrire).

## 3 · CE QUI EST ATTENDU

1. **« Annoter » depuis la liste, mode d'avant = Évaluer** ⮕ la copie s'ouvre en mode Annoter : palettes d'annotation visibles (`afficherPalettesAnnotation`), palettes d'évaluation fermées, bouton Annoter actif, libellé juste.
2. **La vignette du profil (chemin #761), mode d'avant = Évaluer** ⮕ le comportement d'avant #761 : le mode Évaluer est restauré si la copie a un DA. *Supposition de Cowork, dite à Grégoire : c'est ce que ce chemin faisait avant le 6 sept., et #761 ne visait que l'arrivée sur la page, pas le mode.* **Mesure d'abord** : si le rouge ne se reproduit pas, ce point sort du lot et s'inscrit.
3. **Inchangés** : les trois appelants dont le rappel bascule VERS Évaluer (Consulter depuis la liste, Évaluer, le profil). La fiche l'avait vu : élargir le `else` leur installerait une annotation aussitôt écrasée.
4. **Hors lot** : #700 (le compte d'erreurs qui ne retombe pas à 0), même parcours, autre fichier.

La forme du remède est à toi : faire honorer au rappel ce qu'il déclare, ou distinguer les sens du drapeau. **Le plus étroit qui tienne les points 1 à 3.**

## 4 · LA PREUVE EXIGÉE

1. **Le rouge AVANT la ligne de code** (condition posée par la fiche) : Playwright, mode Évaluer installé sur une copie, puis « Annoter » depuis la liste ⮕ rouge sur `1.142.14` sur l'absence de palette. Modèle de harnais : `tests/integration/profil-travaux-761-vignette-mene-a-la-visionneuse.spec.js` (il n'éprouve pas le mode Évaluer : 0 occurrence). Même chose pour le point 2 si tu le retiens.
2. **Une garde pour le point 3** : Consulter depuis la liste arrive toujours en Évaluer avec l'évaluation chargée.
3. **Break-test à montrer** : le remède retiré ⮕ rouge en le nommant ; le `else` élargi à la place ⮕ la garde du point 3 rougit.
4. **Si le rouge est trop coûteux à monter, dis-le** plutôt que livrer un correctif non éprouvé.
5. Vitest depuis `tests/`, jamais depuis la racine.

## 5 · APRÈS

- **Release patch** par `scripts/release.mjs` ; « Nouvelles » selon le skill `release-et-changelog`, tranche seul et dis-le en une ligne.
- **Stock : aucun.** Rien n'est écrit en base ; c'est un enchaînement d'écran. Dis-le quand même dans le rapport.
- **Pas de porte terrain** : Playwright voit les palettes, et ce n'est pas une mise en page ; rien de propre à l'iPad ou à Safari. Si ta mesure dit le contraire, dis-le.
- **Au BACKLOG** : cocher #651 avec sa phrase « vérifié comment » ; corriger la mention de `_majLabelBtnActions` ; nommer l'issue de la trouvaille `_resterEnModeAnnoter` (et du point 2 s'il sort du lot) – si tu inscris, prends le numéro sur la ligne « Dernier ID » de `main` (**#889** à l'écriture) et mets-la à jour dans le même commit.
- **Commite aussi**, ils sont à Cowork et non commités : `plans de travail/CONSIGNE-DU-JOUR.md`, l'archive `_ancienne-CONSIGNE-DU-JOUR-2026-09-14-864-verrouillage-cartouches.md`, et `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` (mis à jour à 15 h).
- ⚠ **Le verdict Playwright se prend Cowork FERMÉ** : Grégoire le ferme quand tu es prêt.
