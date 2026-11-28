# Rapport – numériser un devis ministériel dans « Apporter mon matériel »

> Dernier relais : 28 novembre 2026, 10 h 20 (Toronto), session du nuage. Il remplace les relais de 8 h 45 et de 9 h 15.
> Branche : `claude/devis-ministeriel-8vylul`. Base : `main` à `574bb60`, la 1.260.0. PR #67, en brouillon.
> **Décision de Grégoire (10 h 03) : le devis ne part pas en ligne seul.** Il partira avec le lot « Cadre » (la création d'un cours puise dans les devis rangés). Cette branche reste sur sa branche, sans bump ni changelog. Le lot « Cadre » n'est PAS commencé : sa consigne viendra à part.
> Fait : le lot du relais de 8 h 02, sa refonte selon le correctif de 8 h 08, puis le second amendement de 10 h 03 (section ci-dessous).
> Reste : la relecture des mots 40 à 50 ; le verdict WebKit (aucun WebKit dans le conteneur) ; l'essai avec un vrai geste de copie (Aperçu, Safari, iPad).

## Second amendement (28 nov., 10 h 03)

### 1. La démonstration a sa propre réserve

**Le moyen.** Dans la démonstration, l'écran lit et écrit `demo_devisMinisteriels` au lieu de `devisMinisteriels` (une seule fonction, `cleReserve`, dans `js/materiel-devis.js`). C'est le préfixe de tout ce que la démo range.

- **À l'entrée** : rien n'est copié ni écrit. La liste « Tes devis rangés » montre la réserve de la démo, vide à la première visite ; les devis réels n'y paraissent pas. Une phrase le dit sous le titre de la liste.
- **Pendant** : ranger, rouvrir, recoller, importer et exporter des devis portent tous sur la réserve de la démo.
- **À la sortie** : rien n'est effacé ni recopié. La liste remontre la réserve réelle. Le devis rangé dans la démo reste dans la démo : il se retrouve à la visite suivante, comme les cours qu'on y crée, et il part quand la démo est remise à neuf (ce geste efface toutes les clés `demo_*`, lu dans `js/demo-namespace.js`, `reinstallerDemoDuPack`).
- Les clés `demo_*` ne partent pas dans le codex (lu dans `js/codex.js`, non exécuté).

**La preuve** (essai au navigateur, « amendement 2 · la démonstration ») : un devis réel est rangé ; on entre dans la démo, on y range 4EF0, on sort. La réserve réelle est comparée octet pour octet avant la visite, pendant et après : identique. L'essai rougit si `cleReserve` rend toujours la clé réelle (cassé puis rétabli).

Supposition nommée : « disparaît avec elle » est lu comme « n'existe que dans la démo et part quand la démo est remise à neuf », pas comme « effacé à chaque sortie ». C'est la règle des autres créations de la démo. Si tu veux un effacement à chaque sortie, c'est une ligne dans la sortie de la démo.

### 2. Le bouton vers les devis depuis l'étiquetage

Un bouton « Mes devis ministériels » dans l'en-tête de l'étiquetage d'une grille. Il ferme l'étiquetage sans toucher son brouillon et ouvre l'écran des devis. Deux choses suivent :

- l'écran des devis montre maintenant lui aussi la liste des devis rangés, sous la zone de collage : l'accueil reste caché tant qu'une grille est en brouillon, et sans cela on n'aurait pas pu rouvrir un devis ;
- le bouton de sortie dit « Revenir à mon étiquetage » quand un brouillon existe, et il y ramène : la grille se rouvre telle qu'elle était.

Preuve (essai « amendement 2 · depuis un étiquetage en brouillon ») : le brouillon lu en base est identique avant le bouton, sur l'écran des devis et après le retour ; la grille revient avec ses huit rangées. Le banc de l'étiquetage sur iPad (`dissection-ipad-2026-11-12.spec.js`, 7 essais) reste vert avec le bouton de plus, sous Chromium.

### 3. Les devis dans l'import par cases

**Ce qui est branché.** `js/import-export.js` reçoit trois accroches, sans branche neuve dans ses fonctions (la garde de complexité l'exigeait) : les devis du fichier comptent parmi les ressources ; la fenêtre affiche une section « Devis ministériels » ; « Importer la sélection » range les devis cochés. La section et le rangement vivent dans `js/materiel-devis.js` (`devisImport`).

**Ce que fait l'import, devis par devis :**

| Le devis du fichier | Ce que la fenêtre montre | Ce qui se passe |
|---|---|---|
| son code n'est pas rangé | « nouveau », case cochée | il entre dans la réserve |
| même code, même contenu | « déjà rangé chez toi, identique : rien à importer », pas de case | rien |
| **même code, contenu différent** | un avertissement, un volet « Comparer les deux devis » (l'ancien et le nouveau côte à côte), case **non cochée** | rien, sauf si la case est cochée : alors il remplace le devis d'ici, à sa place et sous l'`id` d'ici |

Cocher la case est l'accord. Un devis sans code, ou un second devis du même code dans le même fichier, n'est pas proposé. La réserve est relue au moment d'écrire. Aucun cours n'est touché.

Preuve (essai « amendement 2 · l'import par cases », par la vraie fenêtre « Importer ») : un fichier porte 4EF0 identique, 000Z différent et 01FB neuf. Importé tel que proposé, seul 01FB entre et 000Z garde son contenu. Rouvert, la case de 000Z cochée, 000Z est remplacé. L'essai rougit si la case d'un devis différent est cochée d'office (cassé puis rétabli).

**Ajout de ma part : « Exporter mes devis ».** Rien ne produisait un fichier qui ne porte que les devis ; sans lui, le collègue aurait dû donner son codex. Le bouton est sous la liste des devis rangés et produit `devis-ministeriels-AAAA-MM-JJ.json`. La fenêtre « Importer » le reconnaît. Je n'ai pas exécuté le téléchargement lui-même, seulement l'import d'un fichier de cette forme. À retirer si tu n'en veux pas.

Limite : la fenêtre d'import est une vieille fenêtre, ses messages de fin passent par des boîtes du navigateur ; je ne les ai pas refaites.

### 4. Les mots

Les textes 14, 17, 19 et 28 sont posés mot pour mot. Les textes neufs sont au fichier TEXTES, numéros 40 à 50. « Composer le devis à la main » est gardé.

### Ce qui a changé dans ce rapport

Les sections plus bas datent de 9 h 15. Deux de leurs affirmations sont périmées par cet amendement : l'import par cases EST maintenant branché, et la démonstration n'écrit plus dans les vraies données. Les quatre questions sont répondues.

## Ce que le correctif de 8 h 08 a fait retirer

Le correctif est arrivé après la première livraison. J'avais construit le choix du cours et l'écriture dans la fiche. **Retiré** :

- le choix du cours (l'ancien geste 2), son menu et ses messages ;
- l'écriture dans la fiche : `numeroCompetence`, `competence`, `elementsCompetence` ne sont plus ni lus ni écrits ;
- le champ `devisCompetence` de l'entité cours : `js/entites/cours-entite.js` est revenu, octet pour octet, à celui de `main` (seul son `?v=` dans `index.html` a dû changer, la garde anti-cache l'exige pour un fichier touché puis rétabli) ;
- les fonctions `versFiche` et `depuisFiche`, et leurs essais ;
- la ligne ajoutée à `cours` dans `docs/DATA-OWNERSHIP.md`.

Un essai le verrouille : aucun des deux fichiers du lot ne nomme `CoursEntite`, `'cours'` ni un champ de compétence de la fiche. Au navigateur, la collection `cours` est comparée avant et après chaque parcours : identique.

## Ce qui est livré

L'accueil d'« Apporter mon matériel » a une seconde entrée, « Tes devis ministériels ». Le parcours : coller, voir la lecture, corriger, ranger. Le devis accepté entre dans une réserve de devis. L'accueil montre les devis rangés ; chacun se rouvre pour être relu et corrigé.

| Fichier | Rôle |
|---|---|
| `js/devis-lecture.js` (neuf) | lire par repères ; les gestes de correction ; la réserve (où un devis irait, le ranger). Fonctions pures |
| `js/materiel-devis.js` (neuf) | l'écran. Une seule écriture, `modifierEtAnnoncer('devisMinisteriels', …)`, derrière le bouton « Ranger ce devis » |
| `js/trimestres.js` | `devisMinisteriels` inscrite à `CLES_GLOBALES` |
| `js/codex.js` | le nom lisible de la réserve dans la fenêtre de fusion |
| `js/import-export.js` | trois accroches pour les devis dans l'import par cases (second amendement) |
| `js/materiel.js` | une garde : la dissection en brouillon ne se rouvre pas par-dessus le devis |
| `index.html`, `styles.css` | l'entrée de l'accueil, la liste des devis rangés, la feuille |
| `docs/DATA-OWNERSHIP.md` | la ligne de `devisMinisteriels` |

### Ce qu'un devis rangé porte

```
{ id: 'DEVIS_…', code, enonce,
  contexte: [texte],
  elements: [{ texte, criteres: [texte] }],
  activites: { discipline, ponderation, unites, heures, precisions },
  dateCreation, dateModification }
```

Un devis par code. Les cinq champs d'`activites` sont des textes, tels que le devis les écrit (« 2-2-3 ou 1-3-3 », « 2⅓ », « 45 »).

### Les règles de la réserve

- Recoller un devis dont le code est déjà rangé : l'ancien et le nouveau côte à côte, puis « Remplacer le devis déjà rangé ». Il est remplacé à sa place, sous le même `id` ; les autres ne bougent pas.
- Rouvrir un devis et le ranger de nouveau passe par la même comparaison. S'il reçoit le numéro d'un AUTRE devis rangé, c'est refusé, avec un message.
- Sans numéro de compétence, rien ne se range.
- Aucun geste ne supprime un devis.
- La réserve est relue au moment d'écrire, pas à l'ouverture de l'écran.

## Où la réserve est branchée

| Endroit | État | Preuve |
|---|---|---|
| Clé globale, hors trimestre | **branché** : `CLES_GLOBALES`, `js/trimestres.js` | essai Vitest R |
| Suppression d'un trimestre | la réserve survit (son nom ne porte aucun identifiant de trimestre) | lu, `trimestres.js` l. 1504 |
| Codex, sauvegarde complète | **rien à brancher** : l'export prend toutes les clés (`db.keys()`, `codex.js` l. 481), l'ouverture les réécrit telles quelles | lu dans le code, **non exécuté** : mon essai au navigateur restait bloqué sur l'appel de l'export, je l'ai retiré |
| Codex, fusion de deux appareils | la réserve est une liste à `id`, la fusion la traite devis par devis ; **branché** : son nom lisible (`LIBELLES_DES_CLES`) | lu, non exécuté |
| Migrations | **aucune** : pas de version de schéma à incrémenter, pas de semis, pas d'écriture au démarrage | lu, `js/migrations.js` |
| Réserve (archive d'un groupe-cours) | **non branché, par choix** : comme `registreLongitudinal`. L'archive d'un groupe n'emporte pas les devis | lu, `reserve.js` l. 58 |
| Import par cases | **branché au second amendement** (voir plus haut) | essai au navigateur |
| Mode démonstration | **réserve propre à la démo au second amendement** (voir plus haut) | essai au navigateur |

Ce relevé vient d'une lecture déléguée à un agent ; j'ai revérifié moi-même les lignes de `codex.js` et de `trimestres.js`, pas les autres.

## Mesures : les cinq devis

Faits mesurés par `tests/unit/devis-lecture.test.js` (28 essais), sur les textes extraits par `pdftotext` (`tests/fixtures/devis/`).

| Devis | Lu | Activités d'apprentissage |
|---|---|---|
| 4EF0 | 6 éléments, **17** critères (1, 2, 1, 3, 8, 2), pas de contexte | discipline, pondération, unités, précision |
| 01FB | 2 éléments, 8 critères, contexte de 2 phrases | aucune |
| 0013 | 3 éléments, 3 critères, contexte de 3 puces | libellés sans leur valeur : rien n'est deviné |
| 01FL | 6 éléments, 17 critères, contexte de 4 phrases | aucune |
| 000Z | 4 éléments, 23 critères mal répartis (0, 3, 14, 6), pas de contexte | périodes (45), unités (2), précisions |

**Écart avec le mandat** : il annonçait 16 critères pour 4EF0. Le texte en porte 17.

**0013** : `pdftotext` rend « Nombre d'heures-contact : », « Nombre d'unités : », puis « 48 », « 45 », « 2 » en vrac. Rien ne rattache un nombre à son libellé : les trois nombres vont de côté, les champs restent vides, l'enseignant·e les remplit.

**000Z se corrige en DEUX gestes**, comme avant le correctif : « Cette ligne et les suivantes » vers le contexte de réalisation, puis sous l'élément 1. Réserve inchangée : les trois critères de l'élément 1 et ceux de l'élément 2 sont mot pour mot les mêmes dans ce devis.

## Ce que j'ai tranché

1. **La branche** : celle de la session du nuage.
2. **Le nom de la clé** : `devisMinisteriels`.
3. **L'identité d'un devis** : son code pour un collage, son `id` pour un devis rouvert.
4. **Rouvrir puis ranger passe par la comparaison**, même pour une simple retouche : « rien ne s'efface sans accord explicite » lu au sens large.
5. **« Retirer », c'est mettre de côté.** Le tiroir « Lignes mises de côté » reçoit aussi ce que la lecture ne sait pas ranger. Il n'est PAS gardé dans la réserve : un devis rouvert n'a plus ses lignes mises de côté.
6. **Le pied de page d'un devis d'une page** : pas deviné. Une seule règle de structure : une ligne sans repère, après un vide, sous une phrase finie par un point, va de côté.
7. **Le menu « Déplacer » a deux portées**, « Cette ligne seulement » et « Cette ligne et les suivantes ».
8. **Ajouts hors mandat, petits** : « Annuler le dernier geste » ; monter ou descendre un élément ; « Composer le devis à la main ».
9. **Aucun brouillon** : une lecture non acceptée se perd au rechargement ; une question du navigateur protège la sortie.
10. **La Réserve et l'import par cases ne sont pas branchés** (tableau ci-dessus).
11. **Les `?v=`** portent le jour du build (27 nov.), comme l'exigent la garde anti-cache et son hook sans bump.

## Ce que j'ai supposé

- **Le geste de copie réel** peut donner un autre ordre, d'autres puces ou aucune ligne vide. Non éprouvé sur un vrai collage.
- **Les activités d'apprentissage** n'existent qu'en formation générale, d'après les cinq devis.
- **En démonstration**, laisser un devis entrer dans les vraies données est sans danger : c'est un document public du ministère. C'est une supposition, et la question 3 plus bas.

## Source ou stock

- **Source** : rien n'est tari, c'est un ajout.
- **Stock** : aucune donnée existante n'est touchée. La clé `devisMinisteriels` n'existe chez personne avant le premier devis rangé.
- **Ce qui voyage** : la réserve part dans le codex. Une version antérieure qui ouvre ce codex garde la clé sans la lire. Une réserve reçue mal formée est lue sans casser (essai R), et ses textes sont échappés à l'affichage (essai S, et essai du piège au navigateur).

## Ce que j'ai lu de l'onglet « Cadre » et de la création d'un cours

Pour le lot suivant (les champs liés au devis proposés en listes déroulantes, avec « Autre »). Lecture déléguée, non revérifiée ligne à ligne.

**Ce qui aidera**
- Un seul point de lecture du formulaire (`_lireChampsInfosCoursDOM`, `js/trimestre-v2-cours.js`) et un seul point de remplissage (`_remplirChampsInfosCours`).
- Un seul écrivain, `sauvegarderCoursV2`, avec ses vérifications.
- En création, rien n'est écrit avant « Créer le cours » : la confirmation de chaque choix a une place naturelle.
- Un trimestre porte déjà plusieurs cours, par ses groupes-cours (`<trimestre>_groupesCours`, chacun avec son `coursId`).

**Ce qui gênera**
- **La discipline** est un menu fermé d'environ 128 options, du type « 601 Français (langue et littérature) », sans « Autre ». Le devis dit « Français, langue d'enseignement et littérature » : les deux textes ne se correspondent pas. Il faudra un rapprochement, et il n'est pas mécanique.
- **Les heures** sont un nombre dans la fiche ; dans le devis c'est un texte, parfois des périodes.
- **La pondération** du devis peut en porter deux (« 2-2-3 ou 1-3-3 ») ; la fiche en veut une, au format « n-n-n », et s'en sert pour proposer les heures.
- **Une fiche modifiée s'enregistre champ par champ** en relisant tout le formulaire : basculer vers « Autre » ne devra pas écrire une valeur vide.
- **L'entité cours n'accepte que des champs nommés** (`champsModifiables`) : un lien vers le devis d'origine, si tu en veux un, devra y être ajouté.
- **Une compétence par cours** : la fiche n'a qu'un numéro, un énoncé, une liste d'éléments.
- **Les critères de performance et le contexte de réalisation n'ont aucune place dans la fiche du cours** aujourd'hui.

## Trouvailles, et leur issue

1. **L'accueil est caché quand une dissection est en brouillon** (comportement d'avant le lot). L'entrée des devis et la liste des devis rangés ne sont alors atteignables que par « Coller une autre grille », qui efface le brouillon. Issue à 9 h 15 : inscrire et continuer. **Réglé au second amendement** par le bouton de l'en-tête de l'étiquetage (réponse de Grégoire).
2. **`carte-aide-materiel-2026-11-13.spec.js`, essai I1, rouge sous Chromium**, rouge aussi sur `main` sans le lot. Réglé pour WebKit, non jugé ici. Issue : **commenter et oublier**.

## Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : les quatre essais Playwright du lot sont verts sous Chromium seulement.
- **L'export et l'ouverture d'un codex** avec la réserve : lus, non exécutés.
- **Le mode sombre** : dans mes captures de la première version, les menus « Déplacer » et le champ du numéro sortaient sur fond gris. J'avais basculé le mode par un raccourci, pas par le bouton de l'application. À regarder sur ton écran.

## Le parcours joué à l'écran, sur l'aperçu Netlify

Aperçu : https://deploy-preview-67--codexnumeris-051225.netlify.app (commit `cf4c86f`). Joué par moi sous Chromium (pas Safari), avec un cours fictif créé pour servir de témoin, puis 4EF0 et 000Z collés depuis les jeux d'essai, puis 4EF0 recollé.

Mesuré pendant ce jeu, en lisant la base à chaque étape : avant « Ranger », la réserve ne change pas ; après, elle porte `4EF0`, puis `4EF0` et `000Z` ; recoller 4EF0 passe par la comparaison et laisse deux devis ; la collection `cours` est identique du début à la fin.

Captures dans `plans de travail/captures-2026-11-28-devis-ministeriel/` (celles de la première version, avec le choix du cours, sont retirées) :

| Geste | 4EF0 | 000Z |
|---|---|---|
| L'accueil, deux entrées | `1-accueil-deux-entrees.jpg` | |
| Le devis collé | `4EF0-2-colle.jpg` | `000Z-2-colle.jpg` |
| La lecture | `4EF0-3-lecture.jpg` | `000Z-3-lecture.jpg` (sort mélangé) |
| La correction | `4EF0-4-corrige.jpg` | `000Z-4a-geste-1-vers-le-contexte.jpg`, `000Z-4b-geste-2-vers-l-element-1.jpg` |
| Le devis rangé | `4EF0-5-range.jpg` | `000Z-5-range.jpg` |
| L'accueil avec les devis rangés | `6-accueil-devis-ranges.jpg` | |
| Recoller un code déjà rangé | `recolle-4EF0-5a-comparaison.jpg`, `recolle-4EF0-5-range.jpg` | |
| Rouvrir, iPad debout (820 × 1180, aucun débord mesuré) | | `7-ipad-debout-000Z-rouvert.jpg` |

## Ce qui remonte à Grégoire

Les quatre questions de 9 h 15 sont répondues (second amendement). Il reste :

1. **Les mots 40 à 50** du fichier TEXTES.
2. **« Exporter mes devis »**, mon ajout : gardé ou retiré ?
3. **La démonstration** : le devis reste dans la démo jusqu'à sa remise à neuf. Est-ce bien « disparaît avec elle », ou veux-tu qu'il s'efface à chaque sortie ?

## Gestes d'essai pour Grégoire

Aucun de ces gestes n'écrit avant ton accord, et aucun ne touche un cours. Ils se font sur l'aperçu : rien de ceci n'est en ligne.

1. **Copie ton propre devis depuis ton PDF et colle-le.** Dans Aperçu sur le Mac : ouvre le PDF, sélectionne tout le devis de la compétence, copie. Dans Labo Codex : Conception › Mon matériel › « Numériser un devis », colle, « Lire mon devis ». Dis ce que tu vois : le bon nombre d'éléments ? les critères sous le bon élément ? un pied de page collé à un critère ? la pondération et les unités dans leurs champs ?
2. **Refais-le depuis Safari**, puis **depuis l'iPad**, avec le même PDF. L'ordre du texte copié peut changer d'un outil à l'autre : c'est ce que je n'ai pas pu mesurer.
3. **Corrige une ligne mal rangée** par son menu « Déplacer », puis « Annuler le dernier geste ».
4. **Range le devis**, reviens à l'accueil : il doit paraître sous « Tes devis rangés ». **Rouvre-le**, puis **recolle le même devis** : l'ancien et le nouveau doivent paraître côte à côte avant de remplacer.
5. **Depuis un étiquetage.** Colle une grille (ou « Étiqueter l'exemple moi-même »), pose une étiquette, puis touche « Mes devis ministériels » dans l'en-tête. Rouvre un devis, puis « Revenir à mon étiquetage » : ta grille doit revenir avec ton étiquette.
6. **La démonstration.** Note tes devis rangés. Entre dans la démonstration, va dans Conception › Mon matériel : la liste doit être vide. Range un devis, sors de la démonstration : tu dois retrouver tes devis d'avant, et pas celui de la démo.
7. **Le passage à un collègue.** « Exporter mes devis » sous la liste. Puis Réglages › « Importer », choisis ce fichier : tes devis doivent paraître « identique ». Corrige l'énoncé d'un de tes devis, rouvre le même fichier : ce devis doit paraître avec l'avertissement et le volet « Comparer les deux devis », sa case non cochée.

Si un collage sort mal, garde le texte collé tel quel et envoie-le : il devient un jeu d'essai.
