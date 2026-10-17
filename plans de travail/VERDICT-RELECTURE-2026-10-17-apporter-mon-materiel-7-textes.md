# Verdict de relecture – « Apporter mon matériel », étape 7 (les textes de Grégoire)

> Cowork, samedi 17 octobre 2026, 16 h 25 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-7-textes.md` (`e87f5ad7`, `963cc15f`, `af1fbe99`, demande `d2e0bf66`). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté sans correction.** Tes suppositions tiennent : la lettre élidée et « À » ne sont pas des lettres seules ; 10.2 s'arrête à « à ce niveau. » ; l'item 1.117 des Nouvelles reste de l'histoire. La limite « IL Y A » → « Il Y A » est acceptée : un nom de partie se corrige à la Vérification.

## Ce que Cowork a mesuré lui-même

- Banc : clone de `d2e0bf66`. **Vitest complet : 771 fichiers, 9 132 essais, verts par exécution.**
- **Les onze textes, mot pour mot** : chacun cherché tel que Grégoire l'a écrit (sa copie de 15 h 00), trouvé dans un seul fichier ; les huit anciens textes ne sont plus nulle part (« sans souligné » ne reste que dans un commentaire, `materiel-assistant.js` ~143). Bandeau : l'emoji dans `<span aria-hidden="true">`, plus de `<strong>`. D1 : les deux libellés de `grilles.js` disent « Description ».
- **Les Nouvelles 1.203** : titre et sept items identiques à la version de Grégoire, espaces insécables mises à part.
- **`casseDePartie`** lue : capitales seulement (aucune minuscule), `\p{L}+` sans groupe (le 2e argument est bien la position), chiffres romains jusqu'à XXXIX, élision vue par le caractère suivant, `toLocaleLowerCase('fr')`. **Mutation reposée** (la garde « une partie qui porte des minuscules garde sa casse » retirée) : **P.a rouge**, restaurée.

## L'écart de compte de l'inventaire : il n'y en a pas

La page de Cowork portait 89 fiches : **86 lignes de l'inventaire et 3 qui n'en sont pas** (R1, le nom recollé ; D1 ; N1). Trois lignes de l'inventaire n'y avaient pas de fiche à elles, parce que leur texte était dans une autre : 20.7 (« Partie », dans le menu 8.8), 20.8 (« selon les puces… », dans 8.15), 20.12 (= 13.11). D'où tes 89 lignes : **86 + 3 = 89**, dont 12 au texte neuf et 77 telles quelles (74 de la page, plus ces trois). Les 14 changements de la consigne sont tes 12, plus D1 et N1. Rien n'a été oublié de part et d'autre.

## La suite

Étape 7 finie. L'étape 8 (la version et la vérification complète) attend le signal de Grégoire : sa consigne est `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-8-version.md`.
