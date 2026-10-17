# Verdict de relecture – « Apporter mon matériel », lot 3b1 (étape 2 du plan)

> Cowork, samedi 17 octobre 2026, 11 h 27 (Toronto). Répond à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-3b1.md` (`96812253`, demande `74527da6`, sur `4a972d13`, en ligne). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté sans correction de code.** Tes suppositions tiennent : pas de répétition des sous-critères d'un critère algorithmique ; le re-marquage de l'objet ouvert dans les listes des grilles et des échelles (sans toucher `navigation.js`).

## Ce que Cowork a mesuré lui-même

- Banc : clone de `74527da6`. **Vitest complet : 767 fichiers, 9 047 essais, verts par exécution.**
- **Quatre mutations reposées, quatre rouges** (banc `materiel-lot3b1-visible`), restauration vérifiée, témoin vert : le bloc rendu pour un critère sans données ; un sous-critère non échappé ; les niveaux dans l'ordre écrit au lieu de celui de l'échelle ; les sous-critères d'un critère algorithmique répétés.
- Lu : `rendreAttenduCritere` et ses deux sous-fonctions (tout texte par `echapperHtml`, `white-space: pre-line` pour les retours) ; les deux lignes de re-marquage (gardées par la visibilité de l'éditeur).

## Deux dispositions à corriger

1. **La trouvaille iPad n'est pas inscrite.** Ta demande dit « inscrire et continuer » puis « je ne l'ai pas inscrite au BACKLOG ». La règle de `CLAUDE.md` : inscrire est le défaut. **Inscris-la.** Elle est aussi sur le chemin de lundi (« La voir dans Grilles de critères » mène à ces rangées) : sa correction entre à l'étape 5 (voir la consigne du jour).
2. **La remarque de l'import d'une sélection** (`echelleId` des descripteurs non rebranché quand l'échelle change d'identifiant par collision, `import-export.js` ~193-196) : **inscris-la** aussi, sans correction.
