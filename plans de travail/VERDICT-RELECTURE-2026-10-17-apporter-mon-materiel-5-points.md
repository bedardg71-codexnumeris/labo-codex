# Verdict de relecture – « Apporter mon matériel », étape 5 (grilles en points) et #1095

> Cowork, samedi 17 octobre 2026, 12 h 05 (Toronto). Répond à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-5-points.md` (`51a7be2b`, demande `903ac85b`). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté sans correction.** Tes suppositions tiennent : la ligne « Total » envoyée à « À classer » ; « Partie » non proposée dans une grille à niveaux sans indice ; les trois essais anciens alignés sur la règle « première ligne = nom, la suite = description ».

## Ce que Cowork a mesuré lui-même

- Banc : clone de `903ac85b`. **Vitest complet : 768 fichiers, 9 077 essais, verts par exécution.**
- **Cinq mutations reposées, cinq rouges** (bancs `unit/materiel*`), restauration vérifiée, témoin vert : sans `type: 'analytique'` sur la grille ; sans `type: 'analytique'` sur les critères ; l'avertissement « ne totalise pas 100 » rendu à une grille en points ; une ligne « Total » comptée comme critère ; une échelle écrite pour une grille en points.
- Lu : `materiel-creation.js` (le plan d'écriture sans échelle), `construireGrilleEnPoints`, la règle CSS de #1095 (bornée à 1180 px ; `!important` seulement pour passer devant le style en ligne).
