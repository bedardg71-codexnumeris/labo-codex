# Consigne – l'aide et l'accompagnement d'« Apporter mon matériel »

> Écrite par Cowork le lundi 19 octobre 2026 à 19 h 02 (Toronto, mesuré par `date`). Demande de Grégoire (16 h 06), plan accepté (16 h 28), textes validés (19 h 01). Le plan et ce qui a été mesuré : `PLAN-2026-10-19-aide-apporter-mon-materiel.md`. Les textes : `TEXTES-2026-10-19-aide-apporter-mon-materiel.md`, **à recopier tels quels**. Règles 2 et 7 de `PROTOCOLE.md`. Pas de verdict complet, pas de version.

## Ce que l'enseignant voit à la fin

Dans Conception › Apporter mon matériel : une bulle juste dans le menu ; une aide « i » à côté du titre, à l'accueil comme dans l'écran d'étiquetage ; une bulle au survol (ou à l'appui long) sur chaque bouton et sur « Couper » et « Rattacher ». Dans l'onglet Aide › Configuration, une section « Apporter une grille que tu as déjà », que la recherche trouve. Dans le lexique, six termes neufs. La visite guidée passe par l'onglet.

## Ce qu'il faut

1. **Bâtir sur l'existant** : les catalogues en place (bulles, aides « i », lexique, `ETAPES_TOUR`), leurs formats et leurs déclencheurs ; la section de l'onglet Aide sur le modèle de ses voisines. Aucun mécanisme neuf. Les boutons de la palette naissent en JavaScript : vérifie que les bulles s'y attachent (sinon, la façon de le faire est ton choix technique, dite dans la demande).
2. **Le lexique** : six termes (critère, élément observable, descripteur, niveau, points, pondération), définitions de D4 mot pour mot. « Niveau » existe déjà sous la forme « Niveau RàI » : choisis une clé et un libellé qui ne se confondent pas avec lui, et dis lesquels.
3. **L2** : la seule phrase d'écran existante qui change, dans `materiel-dissection.js`.
4. **Sécurité** : aucun gestionnaire en ligne ; tout texte par les catalogues ou `textContent`.
5. **Les bancs** : chaque clé `data-tooltip` et `data-aide` neuve a son entrée ; les six termes existent ; l'étape « Conception » correspond à `conception-materiel` ; aucun texte neuf ne contient « dissection ». Un break-test : une clé retirée du catalogue fait rougir le banc.
6. **Le BACKLOG** : #1092 (la visite guidée ignore l'onglet) se coche avec ce lot.
7. Les jetons d'`index.html` pour chaque fichier touché.

## Livrer

Un commit sur `main`, avec : cette consigne, `TEXTES-…`, `PLAN-…`, la consigne du jour et son archive, `VERDICT-RELECTURE-2026-10-19-retrait-ancien-assistant.md`. Vitest complet vert ; les specs `materiel-*` et celles de l'accompagnement touchées vertes dans WebKit. La demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-aide-apporter-mon-materiel.md`. **Puis arrête-toi** : pas de verdict complet, pas de version, pas de push.
