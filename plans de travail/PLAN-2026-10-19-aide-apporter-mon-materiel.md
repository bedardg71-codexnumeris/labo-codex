# Plan – l'aide et l'accompagnement d'« Apporter mon matériel »

> Écrit par Cowork le lundi 19 octobre 2026 à 16 h 32 (Toronto, mesuré par `date`). Demande de Grégoire (16 h 06) ; plan accepté à 16 h 28 (« oui »). Les textes attendent sa validation sur la page « L'aide d'Apporter mon matériel » (https://claude.ai/artifact/VTgsAQLNYmtemQVVtxQtHB, réponses lues par Cowork dans sa base, collection `reponses`). **Rien ne se code avant ses réponses.**

## Mesuré avant d'écrire (bâtir sur l'existant)

- L'application a déjà six outils d'aide : les bulles au survol (`data-tooltip`, `js/accompagnement-contenu-hover.js`), l'aide « i » (`btn-aide-contextuelle` + `data-aide`, `js/accompagnement-contenu-popup.js`), la primo-aide (`.primo-aide[data-target]`), le lexique (`js/accompagnement-contenu-terme.js`), la visite guidée (`ETAPES_TOUR`, `js/accompagnement.js`) et l'onglet Aide (six sous-sections statiques dans `index.html`, avec recherche).
- L'onglet n'en emploie presque aucun : aucune aide « i », aucune bulle sur ses boutons, aucune section de l'onglet Aide, aucune étape de visite (#1092). Sa bulle de menu (`nav-conception-materiel`) décrit encore l'assistant retiré le 19.
- Le lexique n'a ni critère, ni élément observable, ni descripteur, ni niveau (seulement `niveau-rai`).
- Les étiquettes de la palette ont déjà leur phrase (`materiel-dissection-lecture.js`, validées le 18) : on n'y touche pas.

## Les six pièces (en gestes d'utilisateur)

1. **La bulle du menu** : réécrite (A1).
2. **L'aide « i »** à côté du titre de l'onglet, sur le modèle de `construction-grilles` : titre, deux paragraphes, un conseil, « Voir aussi » vers `construction-grilles`, `construction-echelles` et `grille-type-critere-detail` (B1 à B5).
3. **Les bulles au survol** des boutons et des deux outils (C1 à C11).
4. **Une section de l'onglet Aide**, dans « Configuration » : « Apporter une grille que tu as déjà » (D1 à D10), trouvable par la recherche de l'onglet.
5. **Le lexique** : critère, élément observable, descripteur, niveau, points, pondération, avec les définitions de D4 mot pour mot (une seule source).
6. **La visite guidée** : l'étape « Conception » reçoit une phrase et correspond aussi à `conception-materiel` (E1), ce qui clôt #1092.

## Pour le lot de Claude Code (après les réponses de Grégoire)

- Les textes tels que validés, sans retouche ; aucun « dissection » à l'écran.
- Un banc qui verrouille : chaque `data-tooltip` et `data-aide` neufs ont leur entrée au catalogue ; les termes du lexique existent ; l'étape de visite correspond à `conception-materiel`.
- Jetons d'`index.html` pour chaque fichier touché ; pas de verdict complet dans le lot.
