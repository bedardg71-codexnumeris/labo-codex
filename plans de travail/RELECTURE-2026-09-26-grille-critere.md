# Relecture croisée de Cowork – lot #957 (une grille ne perd plus le critère ajouté à l'« Enregistrer »)

> Écrite le 26 septembre 2026, vers 12 h 14 (Toronto), par Cowork. Branche `lot-957-grille-critere`, commits `3428894a` (code) et `609f42b8` (demande), sur `9b575769`.

## Verdict : VERT, sans retouche demandée avant la fusion

## Ce que Cowork a fait (lecture ; aucune exécution de navigateur de ce côté)

- Lu le diff de `js/grilles.js` et `js/echelles.js`.
- **Le risque principal d'un correctif « l'écriture part de la base »** : un geste qui modifiait l'objet mémoire SANS écrire, en comptant sur « Enregistrer » pour l'emporter plus tard, perdrait désormais son changement. Recherché sur la branche :
  - tous les appels de `sauvegarderGrilleTemplate` : cinq passent un `appliquer` ; les trois sans (`sauvegarderNomGrille`, `enregistrerCommeGrille`, `sauvegarderGrilleComplete`) ne portent que le nom et la description, que la fonction pose elle-même ;
  - les mutations de `grilleTemplateActuelle` (directes, par alias, par méthode de tableau) : **aucune** hors des chemins convertis ; l'alias de `appliquerTypeGrilleAuxCriteresSansType` (l. 3422) ne sert plus qu'à lire ;
  - les écrivains partiels (≈ l. 4576, 5010, 5295, 5718) remplacent l'objet mémoire par ce qu'ils ont écrit, sans le muter ;
  - hors de `grilles.js`, `grilleTemplateActuelle` n'est que lue (`export-pdf.js`, aperçu et export) ;
  - `modifierParamFormuleGrilleHandler` écrit par son propre chemin, en base.
  ⮕ Aucun changement « en attente d'Enregistrer » ne se perd avec ce correctif.
- **Échelles** : `echelleTemplateActuelle` n'est mutée nulle part hors de `sauvegarderNomEchelle` (ton grep, conforme à la lecture) ; la garde retirée ne protégeait que le cas « nombre de niveaux différent ».

## Réponses aux trois questions (§ 6)

1. **`appliquer` avant `ajouterContributeurSiNecessaire`** : sans effet ; le contributeur dépend de l'utilisateur actif et de l'auteur, pas du nom ni des critères.
2. **L'id tiré avant l'appel** : sans conséquence ; un id perdu n'est écrit nulle part.
3. **Un retour anticipé ne mute plus rien** : c'est un gain. Avant, l'écran montrait un changement que la base n'avait pas, et il partait au prochain enregistrement sans qu'on le sache.

**Les trois gestes injoignables** : garde leur conversion. Elle ne coûte rien et empêche qu'un geste rebranché un jour réintroduise le défaut ; leur retrait éventuel relève d'un autre lot (code mort).

## Observations

- **O1 – note, non vécue** (tu l'as notée dans la fiche) : l'aperçu et l'export PDF lisent l'objet mémoire, qui peut être en retard sur la base entre une écriture partielle et le prochain « Enregistrer » ; depuis ce lot, le retard se résorbe à chaque « Enregistrer » au lieu de s'imposer à la base. Pas de fiche sans symptôme.
- ⚠ **Non exécuté par Cowork** : les six essais et les trois mutations reposent sur ton exécution (WebKit).

## Suite

Fusion après l'accord de Grégoire sur la ligne des « Nouvelles », puis verdict Playwright complet, release et push dans l'ordre du `PROTOCOLE.md`.
