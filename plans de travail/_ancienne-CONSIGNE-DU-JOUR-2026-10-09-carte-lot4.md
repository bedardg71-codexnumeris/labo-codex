# Consigne du jour – carte d'alignement, lot 4 : l'export du plan dit vrai, et quatre fiches sans geste

> Écrite par Cowork le 9 octobre 2026 à 06 h 44 (Toronto, mesurée par `date`). Remplace la consigne du verdict de 1.192.1, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-carte-verdict-1921.md`.

## Où on en est

1.192.1 en ligne depuis le 8 oct. à 22 h 30 (3fa07963). Lots 0, 1 et 2 du chantier livrés. **Ordre décidé par Grégoire le 9 à 6 h 42 : le lot 4 avant le lot 3**, parce qu'il remet « Exporter le plan… » tel quel et que l'export écrit du faux. Le lot 3 (le reste de la barre, une icône à la fois) suit.

Grégoire t'autorise, en te transmettant cette consigne, à commiter cette consigne et son archive, et à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md` (cocher, inscrire). Avant chaque fiche : vérifie qu'elle vit encore là où elle le dit.

## 0 · Avant tout

Si le résultat de la sonde de Mathieu (#1038) est arrivé dans `Retours des testeurs/`, arrête-toi et dis-le en une ligne.

## 1 · L'export du plan

- **#974 – décision de Grégoire (6 h 44, recommandation de Cowork)** : la règle « la leçon parente fait foi » est gardée. `objectifsServisPar` ne change pas, l'écran non plus. Là où l'export du plan laisse aujourd'hui « Objectifs servis » vide pour un bloc, il écrit **« Aucun objectif de cette leçon »**, dans chacune de ses sorties (colonne du tableau et liste du texte, `planification-export.js` l. ~911 et ~2142 ; vérifie s'il y en a d'autres). Mots arrêtés.
- **#969** : l'export dit l'échelle réelle de chaque production. L'échelle vit sur la production (`production.echelleId`), pas sur la grille ; `afficherDetailsProduction` la cherche par `grille.echelleId`, que rien n'écrit. Lis-la là où elle vit, comme le modèle #963. Une production sans échelle garde « Aucune échelle ». Vérifie si d'autres lecteurs font la même erreur (inscrire, pas corriger, s'ils sont hors de la carte).
- **#968 hors lot** (décision de Cowork) : sans effet visible mesuré, l'export et l'écran écartent déjà la référence morte ; réparer le stock reviendrait à écrire dans les cartes des gens. Il reste inscrit tel quel.

## 2 · Les fiches sans geste à l'écran

- **#970** : la carte démo n'enseigne plus « se vérifie par ». Remplace les deux liens `se_verifie_par` du pack (`js/demo-namespace.js` l. ~86 et ~90) par ce que fait aujourd'hui l'utilisateur : l'évaluation coche ses objectifs. Le pack démo ne touche que le démo, jamais les données réelles. Vérifie que la pastille de l'évaluation (#965) rend un état sensé sur la carte démo, et dis lequel.
- **#971** : l'index des objectifs se calcule une fois par passe de `mettreAJourTousLesBadges`, pas par évaluation. Mesure avant / après sur une carte de 720 nœuds (fictive).
- **#972** : `role="img"` (ou équivalent) sur les deux pastilles qui portent un `aria-label`.
- **#973** : un essai au navigateur garde la semaine présélectionnée de « Télécharger un modèle ».

## 3 · Tests

Un banc par fiche, break-test pour chacun. Pour #974 et #969 : l'export d'une carte fictive où un clone sert l'objectif d'une autre leçon, et une production rattachée à une échelle autre que la générique. Specs `planif-*` sous WebKit, Vitest complet. Noms manifestement fictifs.

## 4 · Puis arrête-toi

Commits séparés (export ; fiches sans geste). **Pas de release** : rapport à Grégoire, relecture de Cowork, ligne des Nouvelles, release, verdict (Chrome et Safari fermés), push. Choisis l'intention de version et dis-la.

## Ton rapport à Grégoire

En gestes d'utilisateur : ce que l'export dit maintenant (une phrase pour chacune des deux corrections) ; l'état de la pastille sur la carte démo. La ligne des Nouvelles proposée, non écrite dans `js/changelog-data.js`. Ce que tu as supposé, une ligne par supposition.
