# Demande de relecture – Le banc du critère algorithmique (#1131), rouge depuis la présentation en étapes

> Claude Code, dimanche 25 octobre 2026, vers 12 h 45 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-banc-critere-algo-1131.md`, commitée seule avec le verdict de la retouche du statut incomplet (`aef0751e`). Sur `main` : le dossier de travail était sur `bibliotheques-deux-colonnes` (lot 2 commité à 12 h 32, `115747e1`). Je l'ai basculé sur `main` sans conflit, et les fichiers non commités de Cowork ont suivi tels quels. Pas de release, pas de verdict, pas de push.

## Verdict de la mesure : c'est le banc, pas le code

Un enseignant atteint le bouton « Partir de la liste du français écrit (codes 1 à 10) » **d'un seul clic**. Aucun code n'a changé.

## Comment je l'ai établi

J'ai mesuré avec une sonde Playwright (WebKit), puis je l'ai retirée. Elle suit les vrais gestes de l'enseignant : Conception › Grilles, « Nouvelle grille », un nom, puis le type « Algorithmique » sur le premier critère.

| Moment | Étapes de l'atelier (`*` = ouverte) | Le bouton |
|---|---|---|
| Juste après le choix « Algorithmique » | compte, codes, note, paliers, **eleve*** | présent dans l'étape « Codes », mais son corps est `hidden` : rectangle 0 × 0, invisible |
| Après un vrai clic sur l'en-tête « Codes » (visible) | compte, **codes***, note, paliers, eleve | visible (332 × 28 px) ; un vrai clic pose les 10 sous-critères |

La capture montre l'en-tête « Codes · 0 code » dans la chaîne des étapes, juste sous la ligne du critère. Depuis `9b70e1b1` (#1150, lot 4), l'atelier s'ouvre sur « Ce que l'élève lit », avec une seule étape ouverte à la fois. C'est le comportement voulu. Le banc cliquait sur un bouton qu'il ne voyait plus.

**Ce que je n'ai pas tranché, parce que ce n'est pas mesurable par la machine** : un enseignant devine-t-il que les sous-critères se trouvent sous « Codes » ? L'étape dit « 0 code », et son but annonce « Ce que tu poses sur la copie dans Annoter ». La question relève de la présentation (#1150), pas de ce banc. Je la signale, je ne l'inscris pas.

## Le changement

`critere-algorithmique-dit-vrai.spec.js`, essai #1131, trois lignes ajoutées avant le clic :

- le bouton est caché ;
- un vrai clic sur l'en-tête de l'étape « Codes » ;
- le bouton devient visible.

Le reste de l'essai est inchangé : 10 sous-critères, puis 11, rien en base avant « Créer la grille », puis les codes 1 à 11 enregistrés. L'essai fixe donc aussi le chemin de l'enseignant. Si l'étape « Codes » cessait de s'ouvrir, ou si le bouton en sortait, il rougirait.

## Les bancs

| Banc | Résultat |
|---|---|
| `critere-algorithmique-dit-vrai.spec.js`, WebKit | 3 sur 3 (l'essai #1131 était rouge avant, deux fois sur deux) |
| Les 11 specs qui ouvrent l'atelier (`grep -lE "atelier\|critere-algo" tests/integration/`), WebKit | 33 verts, 3 sautés. Les trois sautés sont des essais de captures, lancés seulement sur demande (`CAPTURES_PALETTE`, `CAPTURES_RETOUCHES`, `CAPTURES_PRESENTATION`). Aucun autre rouge |

Vitest n'a pas été relancé : aucun fichier de `js/` n'a changé.

## Geste à vérifier à l'écran

Aucun : c'est le banc.
