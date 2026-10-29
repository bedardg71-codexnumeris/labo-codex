# Consigne – Les jetons par défaut : l'écran dit ce que fait l'application (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 7 h 51 (Toronto, mesuré par `date`), sur `main` = `8ecdcb70` (non poussé). Ne remplace aucune autre consigne. **À lancer après le lot 2 des standards** (un seul lot qui écrit à la fois).
> Origine : la demande de relecture du lot 5 de l'Aide (`DEMANDE-RELECTURE-2026-10-28-aide-lot-5.md`, « Pour Grégoire », point 3).

## La décision de Grégoire (29 oct. 2026, 7 h 51, « oui » à la recommandation de Cowork)

- **Une pratique neuve n'offre les jetons que si l'enseignant·e coche « Activer le système de jetons »** (son principe du 19 oct. : on ajoute les fonctions au fil de sa pratique).
- **Les pratiques existantes gardent ce qu'elles font aujourd'hui** : une pratique sans réglage de jetons continue de les offrir (défaut du moteur, `evaluation-jetons.js:~142-147`), **et sa case s'affiche cochée** pour le dire. Personne ne perd ses jetons en plein trimestre.
- **Décision de Cowork, dite à Grégoire** : un « non » explicite est respecté. Aujourd'hui, une pratique de l'assistant qui a répondu « non » (`configuration.jetons = { activer: false }`, `wizard-pratique-v2.js:~2597`) n'est reconnue par aucune forme de `_normaliserConfigJetons` (`:45`) : `null`, donc le défaut, actif. Et `pratique-pan-specifications.js:214-215` étale `{ activer: false }` sur un défaut `actif: true`, que la forme imbriquée lit en premier.

## 1. Le mandat

1. **Le moteur** : dans `_normaliserConfigJetons`, un `actif === false` ou un `activer === false` explicite donne une configuration inactive, quelle que soit la forme (plate, imbriquée, ou ce seul drapeau). Rien d'autre ne change dans la résolution (`obtenirConfigJetonsPratique`, le repli `configurationJetons`, le défaut).
2. **Le formulaire** (`js/pratiques-gestion.js:~1346`, `setCheckbox('mat-jetons-actif', jetons.actif || false)` ne lit que la forme plate) : la case et les valeurs affichées disent **ce que le moteur résout** pour la pratique, une seule source. Une pratique sans aucun réglage de jetons s'affiche cochée, avec les valeurs du défaut. Le message « réglés à sa création » (`mat-jetons-regles-ailleurs`) garde son rôle.
3. **Une pratique neuve porte un choix explicite.** Mesure d'abord **tous les chemins qui créent une pratique** (le formulaire, l'assistant, dupliquer, l'import ou le partage, les pratiques fournies par l'application, la démo) et liste-les dans la demande. Puis :
   - le formulaire : à la création, le bloc de jetons s'écrit avec la case telle qu'elle est (décochée par défaut, donc inactif) ;
   - l'assistant : il écrit déjà la réponse ; le point 1 la fait respecter ;
   - dupliquer, importer, partager : la copie garde ce que porte la source (un format qui voyage ne change pas) ;
   - les pratiques fournies par l'application, installées à partir de maintenant : celles qui n'ont pas de réglage de jetons reçoivent un `actif: false` explicite ; celles qui en ont un (la Spécifications de référence, `pratique-pan-specifications.js:152`) le gardent ;
   - la démo : inchangée.
4. **Aucune donnée réécrite.** Une pratique déjà enregistrée n'est pas touchée ; les jetons déjà appliqués restent appliqués. **À mesurer et à dire** : une pratique de l'assistant « non » qui avait quand même reçu un jeton, une fois inactive, garde la même note (la reprise se lit dans les copies, `remplaceeParId`, pas dans la configuration) ; ce qui change pour elle à l'écran (Annoter, le profil, la liste des évaluations).
5. **Les mots** : aucun mot neuf. Si l'Aide (entrée des jetons) dit un défaut, une phrase vraie le remplace, et elle va dans la demande (avant → après) ; sinon rien.
6. Les trouvailles : les trois issues de `CLAUDE.md`, « inscrire » par défaut.

## 2. Les tests

- Un banc (données fictives) : (a) une pratique sans réglage → le moteur actif, la case cochée ; (b) l'assistant « non » → inactive, Annoter ne propose plus « Jeton de reprise » (`travaux-ui.js:1969, 2076`) ; (c) une Spécifications de l'assistant « non », par le chemin de la classe (`:214-215`) → inactive ; (d) une pratique neuve par le formulaire → bloc explicite, inactive ; cochée → active ; (e) une copie avec un jeton appliqué, sa pratique devenue inactive → même note.
- **Break-test** (arbre restauré par sha256) : l'ancien `_normaliserConfigJetons` → (b) et (c) rougissent ; l'ancienne lecture du formulaire → (a) rougit.
- Vitest depuis `tests/` ; Playwright ciblé sur le formulaire de la pratique et Annoter (WebKit) ; on attend l'élément, jamais `waitForTimeout`.

## 3. Clôture

`BACKLOG.md` (une fiche : « Les jetons par défaut », avec la décision de Grégoire) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-jetons-par-defaut.md` : les chemins de création mesurés, avant → après pour chaque cas du banc, ce qui change à l'écran pour une pratique « non », la phrase de l'Aide s'il y en a une. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
