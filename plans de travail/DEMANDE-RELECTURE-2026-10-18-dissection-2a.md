# Demande de relecture – la dissection, lot 2a : créer sa grille en points

> Claude Code, dimanche 18 octobre 2026. Consigne : `CONSIGNE-LOT-2026-10-18-dissection-2a-creer-en-points.md`. Pas de version, pas de push.

## Ce qui est livré, et comment c'est vérifié

L'enseignant étiquette sa grille ; sous « Ta grille, telle que l'application la comprendrait », « Créer ma grille » la range dans Grilles de critères, puis la confirmation existante s'affiche.

- **Vitest complet** : 9 166/9 166, 773 fichiers. Banc neuf `tests/unit/materiel-dissection-2a-creer.test.js` (15 tests) : M (grilles (a), (b), (c), « Réponse N », « (2) »), R (chaque refus), U (la « Suite »), S (collage piégé).
- **WebKit** : la spec neuve `tests/integration/materiel-dissection-2a.spec.js` (2 tests) et celle du lot 1 sont vertes. Toutes les specs `materiel-*` le sont aussi (9).
  - L'exemple est étiqueté par des événements de pointeur.
  - Sans Titre, la création est refusée et la raison est écrite à côté du bouton.
  - À 820 px, le bouton mesure au moins 44 px et la page ne défile pas de côté. Capture prise.
  - Un échec simulé affiche son message, laisse les étiquettes en place et rend le focus au bouton.
  - Au second essai, la grille est créée, puis retrouvée dans Grilles de critères : noms, pondérations, niveaux, points sur une ligne à part.
- **Break-tests**, faits et rouges :
  - garde du « sans place » retirée → R.b rouge ;
  - ligne des points retirée → M.a et M.c rouges ;
  - `x.suite = null` remis pour tous les types → U.a et U.b rouges.
- **Sécurité** : tout texte collé s'écrit par `textContent` ; aucun `innerHTML` neuf, aucun handler inline.

## Réutilisé, étendu

- **Réutilisé tel quel** : `materielCreation.creer`, seul chemin d'écriture, et `calculs(m).manquants`, dont les mots sont repris tels quels. La confirmation `confirmationPointsHtml` est réutilisée, avec « Aller plus loin ».
- **`materielAssistant.construireGrilleEnPoints`**, deux ajouts :
  - un critère qui porte `parCle` (les réponses sans niveaux) les range telles quelles ;
  - `m.description` va dans `description` de la grille, comme dans l'éditeur.

  Les modèles de l'assistant n'ont ni l'un ni l'autre, et ses bancs restent verts sans retouche.
- **`materielDissectionLecture`** :
  - `comprendre` garde les points tels qu'écrits (`ecrits`) à côté de leurs nombres ;
  - la « Suite » n'est plus remise à zéro par Points ni par Pondération ;
  - deux fonctions pures neuves : `modele(R)` et `creation(R, contexte)`.

  Deux attentes du banc du lot 1 sont complétées du champ `ecrits` (`toEqual` sur une case de niveau) ; rien n'y est affaibli.
- **`materiel.montrerCreee(resume)`** ferme la dissection et affiche la confirmation. Venue de la dissection, le lien du bas s'appelle « Coller une autre grille » (même geste que « Apporter autre chose »).

## Textes d'écran neufs (pour l'inventaire de l'étape 3), tous provisoires

| Où | Texte |
|---|---|
| Bouton | Créer ma grille · pendant l'écriture : Création… |
| Au-dessus des raisons | Avant de créer, il reste : (celui de la 1.203) |
| Raison, sans Titre | le titre de ta grille : surligne-le avec l'étiquette « Titre » |
| Raison, morceaux sans place | une place pour le morceau étiqueté listé plus bas / pour les N morceaux étiquetés listés plus bas |
| Raison, aucun point | des points : surligne ce que vaut chaque réponse avec l'étiquette « Points » |
| Raison, trop de réponses | au plus 20 réponses par critère (« Nom » en a N) |
| Raison, clé en « _ » | des points qui ne commencent pas par « _ » (« Nom ») |
| Raison, réponse trop longue | des réponses plus courtes (5 000 caractères au plus) |
| Grille seulement en niveaux | La création des grilles en niveaux arrive bientôt. Pour l'instant, l'application crée les grilles qui ont des points. |
| Confirmation venue de la dissection | Coller une autre grille |
| Clés provisoires | « Critère N », « Réponse N », « (2) » |

## Ce que j'ai supposé

1. **Les descripteurs d'un même niveau sont joints par une espace**, comme la lecture les montre à l'écran. Les points suivent après un saut de ligne, et Grilles de critères l'affiche (`pre-line`, vérifié dans WebKit).
2. **La limite de 20 niveaux** est déjà refusée par `calculs`, avec ses mots. Je n'ai ajouté la limite de 20 que pour les **réponses** d'un critère.
3. **Une clé de réponse qui commencerait par « _ »** est refusée, car le partage la rejetterait. Le cas est improbable, mais rien ne doit disparaître en silence.
4. **Les niveaux du modèle portent des plages vides** (`min`, `max`). `resumer` les lit, et elles ne s'écrivent nulle part en points.
5. **« Coller une autre grille » sur la confirmation** : c'est ma lecture de « y reste ».

## Trouvailles

1. **L'ordre des réponses change à l'affichage quand leurs clés sont des nombres seuls.** En JavaScript, les clés « 0 », « 1 », « 3 » se rangent avant les autres, par ordre croissant. Les réponses « 1 », « 0,5 », « 0 » de la grille (b) s'affichent donc « 0 », « 1 », « 0,5 » dans Grilles de critères. La grille de la collègue est de cette forme.
   - Le problème porte sur les mots des clés : j'ai gardé ceux de la consigne. Une piste : suffixer « pt(s) » quand les points écrits sont un nombre seul.
   - *À trancher à l'étape 3.*
   - Le même effet touche des niveaux nommés « 1 », « 2 », « 3 », dans l'assistant (5b) comme ici.
2. **Grilles de critères affiche le total d'une grille en points en pourcentage** : « Pondération totale des critères : 30% », colonnes « Pond. (%) ».
   - C'est un comportement existant, présent depuis la 1.203 (étape 5), dans du code étranger au lot.
   - Il se verra lundi si l'on ouvre la grille créée.
   - *Inscrit ici* ; à porter au BACKLOG si Grégoire le juge vécu.
3. **Un nom déjà pris bloque la création, sans moyen de renommer dans la dissection.** Si l'on crée l'exemple deux fois, le second essai est refusé : « un autre nom de grille : « Journal de lecture » existe déjà dans ce trimestre ». La seule issue est de renommer l'ancienne grille.
   - Le nom d'une grille s'imprime sur le PDF des étudiant·es. *À trancher par Grégoire* avant la porte terrain.
4. **La description de la grille ne voyage pas au partage** : le schéma `grille` n'a pas de `description`. C'est déjà vrai des grilles de l'éditeur. *Commenté ici et laissé de côté* : aucune conséquence observée.
5. **La confirmation dit « 4 critères, sur 30. » et non « sur 30 points ».** La consigne écrivait « sur N points ». J'ai gardé le texte existant de la 1.203. *À l'étape 3.*
