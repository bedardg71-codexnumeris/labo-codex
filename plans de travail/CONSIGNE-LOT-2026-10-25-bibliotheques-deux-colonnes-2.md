# Consigne – Les bibliothèques en deux colonnes, lot 2 : les échelles et les cartouches (#1155)

> Écrite par Cowork le dimanche 25 octobre 2026 à 9 h 40 (Toronto). Branche `bibliotheques-deux-colonnes` = `f43b6e44` (lot 1 clos) ; `main` = `b616c40f` (un autre lot y tourne : « le statut Incomplet ; travail en cours »).
> Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md` (lot 2, « Inscrit en chemin », « Les règles qui valent pour tous les lots »). **La consigne du lot 1 fait partie de celle-ci** : `CONSIGNE-LOT-2026-10-24-bibliotheques-deux-colonnes-1.md`, § 1 à § 5, et son verdict, `VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-1.md`. Ce qui suit ne dit que ce qui change pour ces deux fenêtres.

## 0. Avant tout

- **Sur la branche `bibliotheques-deux-colonnes`.** Ne commence qu'une fois le lot de `main` commité et aucune suite en cours. Pas de `git stash`.
- Rituel de début de session. Un commit de docs seul : ce fichier.
- Le composant du lot 1 (`BibliothequeUI.creerFenetreDeuxColonnes`) sert tel quel ; s'il lui manque une option, ajoute-la sans changer ce qu'il rend pour les grilles (leur banc reste vert sans retouche).

## 1. Les échelles : comme les grilles

Conception › Échelles de performance › « Consulter la bibliothèque ». Mesuré par Cowork : la fenêtre a les mêmes gestes que celle des grilles (`js/echelles.js`, `preparerDonneesBibliothequeEchelles` l. ~981, `afficherBibliothequeEchelles` l. ~1069) :

| Aujourd'hui | Dans la nouvelle fenêtre |
|---|---|
| « Ajouter à ma sélection » (`ajouterEchelleIndividuelle`) | « ← Utiliser dans ce trimestre » ; « ✓ Déjà dans ce trimestre » |
| (rien, une à une) | « Garder dans ma bibliothèque → » = `importerEchellesDansBibliotheque([echelle])`, l'écriture du geste groupé ; « ✓ Aussi dans ta bibliothèque » |
| « Ajouter mes échelles à la bibliothèque » | « Tout garder dans ma bibliothèque » |
| Dupliquer, Exporter pour partager, Retirer, Supprimer (trimestre) | ⋮ : « Dupliquer », « Exporter pour partager », « Retirer de ce trimestre », « Supprimer définitivement » |
| Classer dans, Retirer du dossier, Supprimer (bibliothèque) | ⋮ : les mêmes, « Supprimer de ma bibliothèque » |
| Dossiers, « Importer depuis un autre trimestre », « Partagés par des collègues », les boutons de fichier | comme au lot 1 |

- **La ligne en clair** : le nombre de niveaux (« 4 niveaux »), puis « par <auteur> » comme au lot 1. **L'aperçu** : les niveaux dans l'ordre (nom, code, bornes s'il y en a).
- **Les phrases de colonne** : celles du lot 1, « grilles » devenu « échelles », et sans « C'est d'ici que tu peux les partager. » (même raison qu'au lot 1).

## 2. Les cartouches : deux différences

Conception › Cartouches de rétroaction › « Consulter la bibliothèque » (`js/cartouches.js`, `preparerDonneesBibliothequeCartouches` l. ~3762, `afficherBibliothequeCartouches` l. ~3866).

1. **Le regroupement par grille reste** (plan) : dans chaque colonne, les cartouches sous l'intertitre de leur grille, comme les `<h4>` d'aujourd'hui, en classes. « Filtrer par grille » (`filtrerCartouchesParGrille`) passe dans la barre de la bibliothèque, à côté de « Masquer ».
2. **Pas de « Garder dans ma bibliothèque → » pour une cartouche.** Mesuré : la fenêtre d'aujourd'hui n'a aucun geste qui verse une cartouche du trimestre dans la bibliothèque ; `ajouterCartoucheALaBibliotheque` (`js/cartouches-bibliotheque.js` l. 45) n'a aucun appelant. Le créer serait un geste neuf **et** une question de données : une cartouche de la bibliothèque nomme sa grille par son `grilleId`, et celle du trimestre nomme une grille du trimestre (`id` neuf, `idOriginal`). Les rangées du trimestre n'ont donc ni passage ni « Tout garder » ; leur état « ✓ Aussi dans ta bibliothèque » paraît quand la relation le dit. **Inscris** « Garder une cartouche dans ma bibliothèque » (fiche, issue 2), avec cette question de grille.
- La phrase de « Dans ce trimestre » : mesure si « ← Utiliser » crée un objet séparé (l. ~4409 le suggère : `idOriginal`) ; garde la seconde phrase seulement si c'est vrai.
- Pas de dossiers pour les cartouches : il n'y en a pas aujourd'hui.
- Les trois boutons de fichier (« Exporter toutes mes cartouches (JSON) », « Importer des cartouches (JSON) », « Importer un partage (.lcz) ») vont dans « Importer ou exporter ▾ », avec les mots du lot 1 (« Importer des cartouches », « Importer le partage d'une ou d'un collègue », « Exporter les cartouches de ce trimestre ») ; l'action de chacun ne change pas.

## 3. Ce que le lot 1 a appris, pour les deux fenêtres

1. **Une seule relation entre un élément du trimestre et son exemplaire de bibliothèque**, lue par les deux colonnes et par la confirmation : même `id`, ou `idOriginal` qui nomme l'exemplaire (le `grilleLieeAExemplaire` du lot 1). Si la relation se partage entre les trois modules, place-la une fois.
2. **« Supprimer définitivement » garde l'exemplaire de la bibliothèque, et la confirmation le dit** : la décision de Grégoire du 25 oct. à 8 h 22 pour les grilles, **étendue par Cowork aux échelles et aux cartouches pour les mêmes motifs** (deux exemplaires séparés ; la bibliothèque est ce qu'il garde pour tous ses trimestres ; un élément effacé par erreur se ramène par « ← Utiliser »). Aujourd'hui, `supprimerEchelleDefinitivement` (l. ~1308) et `supprimerCartoucheDefinitivement` (l. ~4551) retirent l'exemplaire. Retire cet appel ; ajoute la phrase « Son exemplaire de ta bibliothèque reste. » à leurs confirmations, quand la relation le dit, par tous les chemins qui les affichent. Stock : rien.
3. **« ta sélection » devient « ce trimestre »** dans ce que ces deux fenêtres disent : notifications d'ajout, refus de la garde #476 (`echelles.js` l. ~1237, `cartouches.js` l. ~4439), lieux du bandeau des doublons (option `mots`), case « Masquer ».
4. **« Tout garder »** (échelles) : mesure s'il verse un second exemplaire d'une échelle venue de la bibliothèque, comme #1161 pour les grilles. Si oui : rattache-le à #1161, ne corrige pas.
5. **Les éléments retirés introuvables** (#1160) : mesure si une échelle ou une cartouche retirée, absente de la bibliothèque, devient introuvable. Si oui : rattache-la à #1160, ne corrige pas.

## 4. La preuve

Celle du lot 1 (§ 5), pour chaque fenêtre : un banc neuf dans le vrai `index.html` depuis la démonstration, à 1440 et à 820 px ; break-test par famille d'assertions ; les bancs des deux fenêtres réancrés, motif écrit (`grep -rlE "afficherBibliothequeEchelles|afficherBibliothequeCartouches|modalBibliothequeEchelles|modalBibliothequeCartouches" tests/`) ; ceux des grilles inchangés et verts. En plus :
- échelles : une échelle ramenée par « ← Utiliser » montre « ✓ Aussi dans ta bibliothèque » et « ✓ Déjà dans ce trimestre », sans « Garder → » ; sa suppression garde l'exemplaire et affiche la phrase ;
- cartouches : les intertitres de grille dans les deux colonnes ; « Filtrer par grille » filtre la bibliothèque ; aucune rangée du trimestre ne porte de passage ; la suppression garde l'exemplaire et affiche la phrase.
- **Captures** : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-2/`, échelles et cartouches, Mac 1440 clair et sombre, iPad 820 clair.

## 5. Ce qui n'entre pas

Les productions et les pratiques (lot 3) ; tout geste neuf (dont « Garder » pour une cartouche, § 2.2) ; #1160 et #1161 ; l'export depuis la bibliothèque ; les données, clés et règles d'identité, hors le retrait du § 3.2.

## 6. Clôture

- Un commit `feat(bibliotheques)` qui nomme #1155 ; la ligne du lot 2 au plan.
- **Pas de release, ni verdict complet, ni push** (fin du lot 3, au signal de Grégoire).
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-2.md` : mesuré et supposé ; la correspondance des gestes de ⋮ pour chaque fenêtre ; les phrases gardées ou retirées ; § 3.4 et § 3.5 ; chaque banc réancré, avec son motif ; tes écarts ; les trouvailles et leur issue.
