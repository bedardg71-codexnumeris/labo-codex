# Verdict de relecture – Les bibliothèques en deux colonnes, lot 4 : la Carte d'alignement (#1157)

> Cowork, dimanche 25 octobre 2026, 17 h 05 (Toronto). Relu sur la branche `bibliotheques-deux-colonnes` = `d331c3fa` (lot : `63c324c6`) : le rapport relayé par Grégoire ; `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-4.md`, § 5 en entier ; dans le code, les libellés et les mots de `js/planification-bibliotheque.js`, « Nouvelle carte » dans `index.html` (l. ~4287).
> **Méthode** : lecture, et le tri des lignes du diff qui écrivent des données (`git show 63c324c6 -- js/ | grep -nE "^[+-].*(db\.(set|setSync|modifier|remove)|sauvegarderBibliotheque|ajouterAlignementALaBibliotheque|retirerAlignement|importerDepuisBibliotheque|supprimerCarte|dupliquerCarte)"`) : **aucune**. Le lot ne change que la présentation. **Pas relancé par Cowork** : Vitest, WebKit.

## Verdict : **accepté, avec une retouche** (§ 2), à faire avant le lot 5, dans la même session

## 1. Les décisions de Claude Code

| Décision | Cowork |
|---|---|
| Lot ouvert sans attendre la version du soir de `main` | **Accepté** : rien ne tournait, et c'est la condition que posait la consigne. |
| « Importer depuis un autre trimestre » ouvert d'emblée quand « Même cours » a des cartes | **Accepté** : c'était visible avant, et c'est le geste de la rentrée. |
| « Reprendre » et « Importer » sans vert | **Accepté** : une seule couleur forte par fenêtre. |
| #1165, relier une carte à son exemplaire | **D'accord : inscrite.** |
| « Importer une carte », « Auteur », « Licence », les bulles | **Acceptés** (libellés existants ou patron des autres fenêtres). |

## 2. La retouche

### 2.1 L'aide « Comment fonctionne la bibliothèque » : validée par Grégoire (25 oct., 16 h 53, « Oui »)

Pose-la **mot pour mot** comme au § 5.1 de ta demande, dans `js/accompagnement-contenu-popup.js` (`bibliotheque-fonctionnement`), avec la forme de sections existante, **et « le ramène »** (pas « en remet un exemplaire ») : mesuré par Cowork dans `ajouterGrilleIndividuelle`, « ← Utiliser » remet en service la grille retirée elle-même (par `id` ou `idOriginal`). Vérifie que c'est vrai aussi pour les échelles, les productions et les pratiques ; **si l'une d'elles crée une copie au lieu de remettre l'élément, ne change pas le texte** : dis-le dans la demande. Un essai qui lit le titre et deux phrases de l'aide ; break-test.

### 2.2 La Carte : « ce trimestre » partout dans la fenêtre, et le bouton qu'on trouve

1. La question de « Supprimer définitivement » (l. ~405) : « … du trimestre actif ? » devient **« … de ce trimestre ? »** ; la notification (l. ~398) : **« Impossible de supprimer la dernière carte de ce trimestre. »** (le patron « ta sélection » → « ce trimestre » des lots 1 à 3).
2. La colonne vide de « Dans ce trimestre » : « Nouvelle carte » est dans un menu, pas sur un bouton visible comme « + Nouvelle grille ». La phrase devient : **« Aucune carte d'alignement dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la avec « Nouvelle carte », dans le menu « Actions ». »** (vérifie le libellé exact du menu à l'écran et reprends-le).

### 2.3 Le plan, réécrit (décisions de Grégoire et de Cowork du 25 oct.)

Dans `PLAN-2026-10-24-bibliotheques-deux-colonnes.md` :

1. **« La livraison »** : la fusion, la vérification complète et la release se font **après le lot 6**, pas après le lot 4 (Grégoire, 16 h 53 : « Je voudrais qu'on finisse le travail sur les bibliothèques avant de lancer le test Playwright parce qu'il est très long »). Les Nouvelles et la porte terrain se refont à la fin du lot 6, pour les dix fenêtres ; le texte des Nouvelles du § 5.2 reste un brouillon, **non soumis à Grégoire**.
2. **Lot 5 : les tampons**, deux colonnes. Mots validés par Grégoire (16 h 55) : « Dans ta palette », « Dans ta bibliothèque », « Garder dans ma bibliothèque → », « ← Utiliser dans ma palette ». Et sa phrase validée (16 h 47), sous « + Ajouter une catégorie » de la gestion des tampons : « Tu enseignes plus d'un cours ? Crée une catégorie par cours pour y ranger ses tampons. »
3. **Lot 6 : les trois listes simples** (cours, trimestres, groupes-cours), puis le retrait de l'ancien composant. Pour les cours, mots et forme validés par Grégoire (16 h 56) : une seule liste ; « Reprendre dans ce trimestre » sur chaque rangée ; les fiches cachées regroupées en bas sous « Mis de côté (n) », replié ; « Mettre de côté » dans ⋮ (il remplace « Retirer de ma sélection » et « Déposer dans les cours disponibles ») ; « Remettre dans mes cours » ; « Supprimer la fiche » inchangé. Le partage lots 5 et 6 est décidé par Cowork (les cours ont la forme des trimestres).
4. Sous « Hors du plan » : les tampons restent communs à tous les trimestres (Grégoire, 16 h 44) ; une palette par cours reste une piste pour la communauté de pratique.

## 3. Portes terrain

Le markdown du lot 4 est gardé ; il se complète à la fin du lot 6 (dix fenêtres), et Cowork publie alors l'artefact.
