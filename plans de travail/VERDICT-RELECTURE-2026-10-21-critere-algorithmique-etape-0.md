# Verdict de relecture – Le critère algorithmique, étape 0 (#1135)

> Cowork, mercredi 21 octobre 2026, 9 h 58 (Toronto, mesuré par `date`). Commit relu : `a32bdb41` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-etape-0.md`.

## Verdict : accepté, sans correction

- **La clé neuve `codesSousCriteresSeulement` : retenue.** La raison est mesurée : `codesDepuisSousCriteres` sur une liste vide retombe sur le repli, le réutiliser changeait ce stock. Les deux schémas fermés la déclarent dans leur propre vocabulaire (`'boolean'` dans `import-export.js`, 39 entrées de ce type ; `'booleen'` dans `partage-schemas.js`), et le break-test des schémas rougit. Lu au diff : `marquerNeuf` ne pose la marque que sur un critère `algorithmique` ; `estActive` lit la marque avant le drapeau, le repli reste intact pour tout critère sans elle.
- **La case retirée pour un critère marqué : retenue.** Conséquence pour les mots : le texte D6 réglé par Grégoire à 9 h 51 disait « Coche « Utiliser ces sous-critères comme codes d'annotation » ». Cowork l'ajuste dans `TEXTES-2026-10-21-critere-algorithmique.md` (texte lu par l'enseignant : tranché par Cowork).
- **La condition de marque, celle du gabarit neuf : retenue.** Un très ancien critère qu'on ferait passer par un autre type puis revenir serait marqué : c'est un geste de l'enseignant, le même que pour sa projection.
- **La démo en mode Catégories, sans ligne de calcul** : *inscrit* (#1133), accepté.

## Les deux écarts

1. **`import-export.js` touché sans `npm test` complet avant le commit** (`CLAUDE.md`, règles de sécurité). Accepté pour le commit, parce que l'ordre de `fin-de-session` (§4.5) met le verdict avant le push et que rien n'est poussé. ⚠ Le verdict complet de ce soir est donc **obligatoire avant le push**, sans exception.
2. **`/fin-de-session` non lancé, ses étapes faites à la main.** Accepté cette fois. Au prochain lot : lance la commande, ou dis pourquoi elle n'a pas pu l'être.

## Pour le lot de mots

La description du modèle « Pénalité normalisée » (`evaluation-formules.js`, l. 90) : *inscrite* au lot de mots (F1 de `TEXTES-2026-10-21-critere-algorithmique.md`), tranchée par Cowork.

À la release : ce lot part avec la prochaine version, au signal de Grégoire, après le verdict complet.
