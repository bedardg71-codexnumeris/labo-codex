# Verdict de relecture – #1007, lot 2b : le codex proposé avant de retirer une ligne qui porte des notes

> Écrit par Cowork le 4 oct. à 0 h 05 (Toronto, mesurée par `date`), sur `8a222108` (branche locale `claude/1007-lignes-notes`) et la demande `DEMANDE-RELECTURE-2026-10-03-1007-lignes-notes.md` (lue sur la branche).
> Lu : le diff entier de `js/` (sept fichiers) ; les appelants de `EditeurCibles.confirmerRetraits` (grep : deux, tous deux attendus) ; l'écriture de `echelleId` dans les évaluations (`evaluation-calcul.js:1246`). Non rejoué : les bancs.

## Verdict

**Vert, aucune correction de code.** Le test « déjà employé » est en lecture seule, au bon endroit, et lit le même trimestre que l'éditeur. Les relectures après l'attente contrôlent l'identité de la ligne (id, nom ou code) avant le `splice`. La cible garde sa lecture existante, relue après la fenêtre. Les grilles et échelles neuves ne passent pas par ces portes.

**Tes trois suppositions sont acceptées** : les brouillons comptent ; une évaluation sans `echelleId` ne compte pour aucun niveau (la note relit le niveau dans l'échelle désignée par `ev.echelleId`, `echelles.js:3277`) ; une ligne déplacée pendant l'attente n'est pas retirée, sans message (fenêtre modale).

## Une retouche technique, tranchée par Cowork

**Le pluriel de la cible.** Dans l'assistant, plusieurs cibles cochées peuvent partir d'un coup ; la phrase au singulier dirait faux. Passe le nombre de cibles retirées cochées à la fenêtre : une → « Retirer cette cible l'efface pour de bon. » (pronom « la ») ; plusieurs → « Retirer ces cibles les efface pour de bon. » (pronom « les »). Mots soumis à Grégoire avec les autres.

## Les trois lignes que la décision ne nomme pas, classées par Cowork

- **Palier de projection** : aucune évaluation ne le cite ; côté « rien » (décision § 3). Rien à faire.
- **Résultat ultérieur du registre** : nommé dans la famille c de l'inventaire, côté « rien » (décision § 3). Rien à faire.
- **Type de travail et forfait PAN** : la décision § 3 couvre déjà toute ligne qui porte des notes ; ce qui manque est une mesure (une évaluation les cite-t-elle ?). Garde-les inscrits sous #1007 comme mesure à faire ; si la mesure dit oui, le même branchement s'applique sans repasser par Grégoire. #1007 peut se clore avec ce lot ; cette mesure devient une fiche à part si elle reste ouverte.

## Le push des documents de `main`

Oui, seuls (règle de relais) : c'est autorisé par la consigne suivante.

## Les mots

Acceptés par Grégoire (« oui sans le nombre », 4 oct. à 0 h 07) : les quatre phrases du § 4 de la demande, avec le pluriel de la cible (« Retirer ces cibles les efface pour de bon. », pronom « les ») ; **sans** la variante du nombre d'évaluations ; la ligne des Nouvelles telle quelle.
