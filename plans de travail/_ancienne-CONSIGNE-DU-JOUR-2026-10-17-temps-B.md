# Consigne du jour – « Apporter mon matériel », prêt pour lundi : la mise en ligne (temps B)

> Écrite par Cowork le samedi 17 octobre 2026 à 17 h 49 (Toronto, mesuré par `date`). Elle remplace celle de 16 h 25 (temps A : fait, relu, accepté avec une correction), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-17-etape-8-temps-A.md`. **Commite avec ton premier commit** ce fichier, ce déplacement, `VERDICT-RELECTURE-2026-10-17-version-1.203.0.md` et la porte terrain que Cowork a corrigée (`PORTE-TERRAIN-2026-10-19-apporter-mon-materiel.md`). `CONSIGNE-DEMARRAGE-COWORK.md` : laisse-le.

## Où on en est (mesuré par Cowork à 17 h 49)

- En ligne : `4a972d13` (1.202.0). `main` local : `071b6a0b`, au-dessus de la release `6cf60f70` (1.203.0), rien de poussé. Vitest complet vert sur `071b6a0b` (771 fichiers, 9 132 essais).

## Le mandat : le temps B de `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-8-version.md`, précédé de C1

Grégoire ne relaie que Chrome, Safari et Cowork fermés, Mac sur secteur.

1. Vérifie le secteur et la pression mémoire ; dis-le s'ils ne conviennent pas.
2. **C1** du verdict de relecture : les délais fixes des huit specs du matériel. Les huit seules dans WebKit, vertes, et le témoin `grep` ; puis un commit, avec les fichiers de l'en-tête. Aucune ligne de `js/` : la version reste 1.203.0, aucun jeton ne bouge. Si C1 ne passe pas au vert en deux essais, abandonne-la comme le dit le verdict, et commite les seuls documents.
3. Verdict complet sur **ce dernier commit**, qui contient la release. Cela remplace l'étape 2 du temps B de la consigne de lot (« sur le commit de release »).
4. **Vert** : push. **Rouge** : pas de push ; nomme le lot en cause d'après les commits, et arrête-toi.
5. Rapport court à Grégoire, pour son réveil : vert ou rouge, poussé ou non, et ce que C1 est devenue. Le constat chez Netlify se fait le matin.
