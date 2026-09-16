# Consigne du jour – ouvrir une copie : un drapeau mort à retirer (#890), un timeout à diagnostiquer (#652)

> Écrite le 16 septembre 2026, 15 h 52 (Toronto), sur `26d4347f` (`main` = `origin/main`, `1.142.15` en ligne).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-651-700-annoter-et-compte-erreurs.md`.
> Choisie par Grégoire vers 15 h 50 : même endroit que le lot d'avant (Évaluations, ouvrir une copie). Aucun arbitrage attendu de lui, sauf au point 2 c si la mesure y mène.

---

## 1 · #890 – RETIRER `window._resterEnModeAnnoter` (code mort, zéro-dette)

**Mesuré par Cowork sur `26d4347f` (`grep -rn` sur `js/`, `tests/unit`, `tests/integration`, `docs`)** : aucune ligne ne le met à vrai depuis `59690542` (29 mars). Il reste **trois lectures/écritures, aucune dans les tests ni la doc** :
- `js/travaux-ui.js` ~3301 : la remise à faux dans `ouvrirFichier` ;
- `js/travaux-ui.js` ~3452 : `&& !window._resterEnModeAnnoter` dans la condition de restauration du mode ;
- `js/evaluation.js` ~1316-1322 : la garde `if (!enModeEvaluer && window._resterEnModeAnnoter) { … return; }` et son commentaire du 29 mars.

**Geste** : retirer les trois, par SYMBOLE. La condition de ~3452 perd un terme toujours vrai ; la garde de `evaluation.js` est une branche jamais prise. **Rien ne change à l'écran.**

⚠ **Ne touche pas à la zone morte elle-même** (mode d'avant `evaluer` + rappel posé ⮕ aucune branche) : ta mesure du lot d'avant dit qu'aucun trajet ne l'atteint, et la retoucher sans symptôme serait élargir. Dis-le dans #890 au moment de la cocher.

**Preuve** : `grep -rn _resterEnModeAnnoter` ⮕ 0 hors archives ; une sentinelle de non-retour qui rougit si le symbole revient dans `js/` (break-test à montrer) ; les specs `liste-651-…` et `profil-travaux-761-…` restent vertes.

## 2 · #652 – LE TIMEOUT DU 31 AOÛT : DIAGNOSTIC D'ABORD

### a) Ce que Cowork a cru, et ce que la mesure a réfuté

J'ai dit à Grégoire à 15 h 50 que #652 était « vraisemblablement déjà corrigée » par `f485ea34` (4 sept.). **C'est faux** : ce correctif faisait accepter le champ de points `eval_pts_` d'un premier critère analytique, et **ce champ n'existe que depuis `37660b76` (3 sept.)**. Le timeout du 31 août a donc **une autre cause**.

### b) Ce qui est mesuré, et l'hypothèse

- Rapport : `Retours des testeurs/gregoire/BUG__grégoire__2026-08-31_14-13-51.txt`, erreurs de 13 h 57 : l'attente échoue **alors que `listeCriteresGrille1` contient des cartes de critères**. Le journal de clics ne remonte qu'à 14 h 06 : la grille ouverte à 13 h 57 n'y est pas nommée. Vers 14 h 06, Grégoire modifiait des grilles (« Grille-1 FR-ALGO seul A26 »).
- Aujourd'hui, `_attendreSaisiePremierCritereModif` (`js/evaluation.js` ~1667) guette **`eval_<criteres[0].critereId>`** ou `eval_pts_<…>`, 3 s, puis **rejette : l'évaluation ne s'ouvre pas**. Les critères holistiques et algorithmiques rendent bien `eval_<id>` (`evaluation-chargement.js` ~1067, ~1102, ~1122).
- ⮕ **Hypothèse de Cowork, non vérifiée** : le premier critère **enregistré dans l'évaluation** n'existe plus (ou plus sous cet id) dans la grille **rendue** – grille modifiée après l'évaluation, critère retiré ou renuméroté. Les cartes sont là, mais pas celle qu'on attend. Si c'est ça, **le défaut vit encore** : une évaluation dont le premier critère a quitté sa grille ne s'ouvre plus du tout.

### c) Ce qui est attendu

1. **Mesure la cause** : reproduis au banc l'hypothèse (évaluation dont `criteres[0].critereId` n'est pas dans la grille). Rouge = la copie ne s'ouvre pas. Si la sonde sur les données réelles de Grégoire t'est utile : **lecture seule**, et dis-le.
2. **Si l'hypothèse tient** : le remède étroit est technique – que l'ouverture ne dépende pas d'UN critère précis (attendre la grille rendue, ou le premier critère commun à l'évaluation et à la grille). ⛔ **Mais ce que l'écran doit MONTRER d'un critère évalué qui n'est plus dans la grille** (le taire, le signaler, le garder dans la note) **est une question de didactique** : famille de #705 (« modifier une grille rend incomplètes des évaluations déjà remises », à trier). **Si le remède t'oblige à trancher ça, arrête-toi et rapporte** : la question monte à Grégoire, avec une recommandation.
3. **Si l'hypothèse tombe** : dis-le, nomme ce que tu as mesuré, et laisse #652 ouverte avec la mesure écrite. **Ne code rien sans rouge.**
4. **Stock** : aucune écriture dans les données, dans aucun cas.

## 3 · APRÈS

- **Version** : le point 1 seul ne change rien à l'écran (`release.mjs` au jugement du skill, sans « Nouvelles »). Si le point 2 livre un correctif : patch, et **toute phrase de « Nouvelles » est proposée à Grégoire avant le push**.
- **Porte terrain** : aucune pour le point 1 ; pour le point 2, une machine voit une copie qui s'ouvre ou pas. Si ta mesure dit le contraire, dis-le.
- **BACKLOG** : #890 cochée (avec la zone morte laissée en l'état, motif écrit) ; #652 cochée seulement si un rouge a été vu puis corrigé, sinon mise à jour avec la mesure.
- **Commite aussi** (écrits par Cowork, non commités) : cette consigne, son archive `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-651-700-annoter-et-compte-erreurs.md`, `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` et `CONSIGNE-DEMARRAGE-COWORK.md` (tri reporté à 15 h 50).
- ⚠ **Le verdict Playwright se prend Cowork FERMÉ** : dis à Grégoire quand tu es prêt.
