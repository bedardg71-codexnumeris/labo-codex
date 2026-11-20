# Consigne — assembler la release d'avant lundi (19 nov. 2026, 19 h 55)

> Relais de Cowork, reçu le 19 nov. 2026 (19 h 55), recopié tel quel. Branche neuve `lot/assemblage-release`,
> partie de `origin/main` (`ade09e93`, la 1.250.0). Décision de Grégoire, 19 h 37. Rapport du lot :
> `plans de travail/RAPPORT-2026-11-19-assemblage-release.md`.

Pour Claude Code, à relayer — assembler la release d'avant lundi (19 nov. 2026, 19 h 55)

Nouvelle session du cloud. Décidé par Grégoire à 19 h 37 : une release sans attendre lundi, avec quatre lots. Tu assembles et tu testes ; le verdict complet, release.mjs et le push de main se feront ensuite sur le Mac. Écris cette consigne dans le dépôt avant de coder (plans de travail/). Rapport en français.

Branche lot/assemblage-release depuis origin/main (ade09e9, la 1.250.0). Fusionne en --no-ff, dans cet ordre : origin/lot/dupliquer-copie-profonde (145a9b7), origin/lot/glisser-alignement (29e30e4), origin/lot/autoevaluation-consignes (9fc5747 : l'autoévaluation, ses retouches, les noms des seuils). Si une tête a bougé, prends la nouvelle et dis-le.

Hors release, à ne pas fusionner : lot/journees-reprise (la porte de Grégoire est due), lot/glisser-alignement-nuit-b (doublon du même correctif), toutes les branches de parcours (nous-faisons-*, je-regarde-*). Vérifie à la fin que PARCOURS_OUVERTS est identique à celui de main.

Conflits mesurés par Cowork dans une fusion à blanc : BACKLOG.md (deux fois : garde toutes les fiches, vérifie qu'aucun numéro ne sert deux fois, #1296 à #1298 compris, et que « Dernier ID » est juste) ; index.html, trois endroits, tous des jetons de cache (styles.css, grilles.js, echelles.js, pratiques.js, wizard-pratique-v2.js : garde les deux descriptions et un jeton plus récent que les deux). js/grilles.js, js/echelles.js et styles.css fusionnent seuls : relis quand même ces trois fichiers, deux lots les touchent.

Retouche tranchée par Cowork (les identifiants de critères : on les garde à la duplication, parce que le report d'une évaluation qui change de grille et le rattachement des cartouches passent par eux). (1) CartouchesDecalees (js/cartouches-decalees.js, _grillesDeSesCriteres) ne conclut pas quand la grille trouvée est une copie de celle de la cartouche (inspireDe.sourceId, dans un sens ou dans l'autre) : il le liste comme ambigu et ne propose rien ; un test. (2) Mesure si dupliquerGrille (js/grilles.js, l. 1105, qui régénère les identifiants) est encore atteignable depuis un écran ; si oui, dis par quel geste et arrête-toi là, sans l'aligner ; si non, dis-le. (3) Corrige le commentaire de js/cartouches.js vers la l. 4186, qui affirme qu'une grille dupliquée reçoit des identifiants neufs.

Un banc croisé, que les lots ne pouvaient pas avoir chacun de son côté : dupliquer une grille qui porte des descripteurs et un « Pour vérifier » ; la copie les garde ; changer l'un ou l'autre dans la copie ne change pas la source, avant et après rechargement ; les étiquettes « Seuil minimal de réussite » et « Seuil de maîtrise » paraissent dans la copie. Break-test.

Tests : Vitest complet ; Chromium portrait et paysage sur les bancs des quatre lots et sur ceux des modules touchés (grilles, échelles, cartouches, productions, alignement, export PDF, import-export) ; WebKit par GitHub si tu peux, en disant ce qui varie. Liste tout rouge, connu ou neuf.

Les Nouvelles : n'écris rien dans js/changelog-data.js. Propose dans ton rapport une entrée pour une version mineure : un titre et quatre lignes au plus, en mots d'utilisateur, à partir des lignes déjà proposées par les lots (« Dupliquer », le glisser d'Alignement) et de deux lignes à toi pour la grille d'autoévaluation dans le PDF des consignes et pour les noms des deux seuils. Grégoire les approuvera avant le verdict.

PR « APERÇU, ne pas fusionner » ; ni push de main ni release. Rapport : plans de travail/RAPPORT-2026-11-19-assemblage-release.md, avec ce que tu as supposé et ce que la session du Mac doit savoir avant le verdict.
