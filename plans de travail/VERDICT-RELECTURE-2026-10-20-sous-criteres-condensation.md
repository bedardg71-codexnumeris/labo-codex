# Verdict de relecture – Sous-critères modifiables, espace vertical condensé

> Cowork, mardi 20 octobre 2026, 14 h 30 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-20-sous-criteres-condensation.md` (`353834f3`, branche `feat/sous-criteres-condensation`, non poussé). Pour Claude Code. **Commite ce fichier avec ta finition.**

## Verdict

**Accepté. Une finition (F1) dans la même branche avant la fusion. Les trois textes d'écran sont validés par Grégoire.**

Relu sur le diff de `353834f3` (`main...feat/sous-criteres-condensation`) :
- `rendreSousCriteresCritere` ne passe que par les gestes existants (`ajouterSousCritere`, `modifierSousCritere`, `supprimerSousCritere` et sa garde codex, `_deplacerSousCritere`). `boutonsReordonnerBloc` porte bien `param3` (`ui-blocs.js`).
- Sans `ctx`, rien n'est rendu : l'éditeur de création n'est pas touché.
- L'hypothèse « pas de codes d'annotation » est vérifiée dans le code et pas seulement par le test. Hors algorithmique, aucun lecteur ne lit `sc.code` : `codes-annotation.js` ne lit que le critère algorithmique activé, et `ligneEmployeeParUneEvaluation` ne lit que `donneesAlgorithmiques`.
- L'objet mémoire `grilleTemplateActuelle` n'est pas resynchronisé par l'ajout ni par le retrait (le déplacement, si). C'est antérieur, et sans effet depuis #957 : l'écriture part de la base.
- Tous les chemins de rendu passent par `afficherCriteresGrille`, donc par `ajusterHauteursAuto`, y compris l'ajout et le retrait d'une tranche. Le `ResizeObserver` unique par liste, jamais déconnecté, convient : la liste vit autant que la page.
- `.grille-sous-criteres:empty` : la liste vide est bien vide (aucun espace), la règle s'applique.

## La finition

- **F1** – `ajouterSousCritere` : le code d'un sous-critère neuf est `sousCriteres.length`. Après un retrait, il peut doubler un code existant (codes 0, 1, 2 ; on retire 0 ; on ajoute : « 2 » une deuxième fois). Hors algorithmique, c'est inerte. Mais si le critère passe ensuite à algorithmique, le second « 2 » n'est pas posable (`_depuisSousCriteres` : « le premier gagne »). Le défaut est antérieur ; ce lot le rend courant, puisqu'on ajoute et retire désormais partout. Correctif : prendre le plus grand code numérique existant, plus un (`length` si aucun). Ajoute un cas à `sentinelle-sous-criteres-editables` : retrait puis ajout, aucun code en double. Fais le break-test.

## À inscrire (pas dans ce lot)

- **I1** – Le champ « Nom du critère » de la rangée du critère est trop étroit à 1 440 px, comme tu l'as relevé. Grégoire le vit : sa capture de 13 h 54 montre « Partie A : compréhension – » coupé. Inscris une fiche. Le gabarit de colonnes est en style en ligne (`2fr 140px 90px 150px 3fr`).

## Les textes d'écran

**Validés par Grégoire le 20 oct. à 14 h 35, tels quels :** « Nom du sous-critère 1 » (et la suite), « Au plus 30 sous-critères par critère », « Le nom d’un sous-critère fait 200 caractères au plus ». Dans le commentaire de `TEXTES_SOUS_CRITERES` et `REFUS_SOUS_CRITERES`, remplace « Textes de Claude Code (20 oct.) » par « Textes de Claude Code, validés G. 20 oct. 14 h 35 ».
