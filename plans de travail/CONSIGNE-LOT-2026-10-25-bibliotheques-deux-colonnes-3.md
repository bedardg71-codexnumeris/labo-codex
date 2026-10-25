# Consigne – Les bibliothèques en deux colonnes, lot 3 : les productions et les pratiques (#1156)

> Écrite par Cowork le dimanche 25 octobre 2026 à 12 h 50 (Toronto). Branche `bibliotheques-deux-colonnes` = `115747e1` (lot 2, accepté) ; `main` = `e89c73e5`.
> Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`. **Font partie de cette consigne** : celle du lot 1 (§ 1 à § 5) et celle du lot 2 (§ 3), avec leurs verdicts : `VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-1.md` et `-2.md`. Ce qui suit ne dit que ce qui change pour ces deux fenêtres.

## 0. Avant tout

- **Sur la branche `bibliotheques-deux-colonnes`.** Ne commence qu'une fois le lot de `main` commité et aucune suite en cours. Pas de `git stash`.
- Rituel de début de session.
- **Un commit de docs seul** : ce fichier ; le verdict du lot 2 (`VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-2.md`, écrit sur le Mac hors de la branche) ; au plan, la ligne du lot 2 (« codé, relu, accepté », `115747e1`), la ligne « Inscrit en chemin » du verdict du lot 2 (§ 3, le chemin 2 de la suppression d'une cartouche), et **le nouveau partage des lots 3 et 4** (§ 6 ci-dessous).

## 1. Les productions : comme les grilles, avec l'import du côté de la bibliothèque

Conception › Productions étudiantes › « Consulter la bibliothèque » (`js/productions-bibliotheque-ui.js`, `preparerDonneesBibliothequeProductions` l. ~38, `afficherBibliothequeProductions` l. ~158). Mesuré par Cowork sur la branche :

| Aujourd'hui | Dans la nouvelle fenêtre |
|---|---|
| « Ajouter à ma sélection » (`ajouterProductionIndividuelle`) | « ← Utiliser dans ce trimestre » ; « ✓ Déjà dans ce trimestre » |
| (rien, une à une) | « Garder dans ma bibliothèque → » : l'écriture du geste groupé pour une seule production (`importerDansBibliotheque([prod])`, comme `ajouterMesProductionsALaBibliotheque` l. ~408) ; « ✓ Aussi dans ta bibliothèque » |
| « Ajouter mes productions à la bibliothèque » | « Tout garder dans ma bibliothèque » |
| « Dupliquer » ; ⋮ : Exporter pour partager, Retirer, Supprimer | ⋮ : « Dupliquer », « Exporter pour partager », « Retirer de ce trimestre » (`retirerProductionDeBibliotheque`), « Supprimer définitivement » (`supprimerProductionDefinitivement`) |
| ⋮ : Classer dans, Retirer du dossier, Supprimer | ⋮ : les mêmes, « Supprimer de ma bibliothèque » (`supprimerProductionDeBibliothequePartagee`) |

- **« Supprimer définitivement » garde l'exemplaire** : `supprimerProductionDefinitivement` (l. ~697) appelle aujourd'hui `retirerDeLaBibliotheque` ; retire cet appel et ajoute « Son exemplaire de ta bibliothèque reste. » à sa confirmation, quand `lieeAExemplaire` le dit, par tous les chemins qui l'affichent (même décision étendue qu'au lot 2). Stock : rien.
- **« Importer depuis un autre trimestre » écrit dans la bibliothèque** (`importerUneProductionTrimestre` → `ajouterALaBibliotheque`, l. ~636) : sa ligne va au pied de « Dans ta bibliothèque », comme pour les échelles. Confirme-le par la mesure avant.
- **La ligne en clair** : ce que la rangée dit aujourd'hui, en mots et sans emoji : le type (« Portfolio », « Artefact d'un portfolio », « Évaluation terminale »…, les libellés existants) et la pondération (« 6,67 % », à la française) ; puis « par <auteur> » comme aux lots 1 et 2. **L'aperçu** : l'objectif en entier, puis ce que la fiche nomme déjà (la grille, l'échelle, la cartouche s'il y en a), avec leurs libellés existants. Aucun mot neuf : s'il t'en faut un, propose-le dans la demande.

## 2. Les pratiques : comme les cartouches, sans passage vers la bibliothèque

Conception › Pratiques de notation › « Consulter la bibliothèque » (`js/pratiques-gestion.js`, `afficherBibliothequePratiques` l. ~240). Mesuré par Cowork :

1. **Aucun geste d'aujourd'hui ne verse une pratique du trimestre dans la bibliothèque.** `importerPratiquesDansBibliotheque` (`js/pratiques-bibliotheque.js` l. ~543) n'a pas d'appelant dans l'interface. Comme pour les cartouches : **ni « Garder → » ni « Tout garder »** ; « ✓ Aussi dans ta bibliothèque » quand la relation le dit. **Inscris** « Garder une pratique dans ma bibliothèque » (une fiche, issue 2 ; l'écriture existe, il manque le geste).
2. **Le passage de la bibliothèque** : « ← Utiliser dans ce trimestre » (`ajouterPratiqueALaSelection`, aujourd'hui « Ajouter », bouton marine) ; « ✓ Déjà dans ce trimestre ».
3. **⋮ du trimestre** : « Dupliquer » (`dupliquerPratiqueBibliotheque`), « Exporter pour partager », « Exporter (JSON) » (libellé d'aujourd'hui, `partagerPratiqueMateriel` : aucun geste perdu), « Retirer de ce trimestre » (`retirerPratiqueDeBibliothequeMateriel`), « Supprimer définitivement » (`supprimerPratiqueDefinitivement`). **⋮ de la bibliothèque** : « Classer dans : … », « Retirer du dossier », « Supprimer de ma bibliothèque ».
4. **« Supprimer définitivement »** n'efface déjà pas l'exemplaire de la bibliothèque (mesuré, l. ~891) : n'y change rien, mais ajoute la phrase « Son exemplaire de ta bibliothèque reste. » à sa confirmation, aux mêmes conditions. Garde la confirmation actuelle (`confirm`) ; si tu la fais passer par la fenêtre de l'app, dis-le.
5. **L'encadré « Pour éditer une pratique, transfère-la… » disparaît** (plan) : les deux colonnes le disent.
6. **« Importer depuis un autre trimestre »** écrit dans ce trimestre (`copierPratiqueDepuisTrimestre`, `cle('pratiquesConfigurables')`) : sa ligne reste au pied de « Dans ce trimestre ».
7. **La ligne en clair** : la famille de la pratique en mots, avec les libellés existants de l'app (« Sommative », « PAN-Standards », « PAN-Spécifications », « Dénombrement » : la partie française de `obtenirDescriptionCourtePratique`), à la place des badges SOM, STD, SPE, DEN et « Gabarit » ; puis « par <auteur> ». **L'aperçu** : la description de la pratique (ou la description taxonomique, sans la parenthèse anglaise), puis l'échelle et la grille qu'elle emploie, s'il y en a.
8. **Les maquettes** (`estMaquette`) restent filtrées des deux colonnes, comme aujourd'hui.
9. **La phrase de « Dans ce trimestre »** : mesure si « ← Utiliser » crée un objet séparé (`ajouterPratiqueALaSelection`) ; garde la seconde phrase seulement si c'est vrai, comme aux lots 1 et 2.

## 3. Ce que Grégoire a décidé (25 oct., 12 h 40 : « oui »)

1. **« Retirée de ce trimestre »**, sur une cartouche retirée : **gardée**. Si une production ou une pratique retirée doit rester visible pour ne pas devenir introuvable, même ligne, même place que les cartouches ; sinon, mesure et rattache à #1160.
2. **La bulle de « Tout importer » des échelles** (`js/accompagnement-contenu-hover.js` l. ~458) devient : **« Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes. »**
   - **Même défaut pour les productions** si la mesure du § 1 confirme que leur import écrit dans la bibliothèque : leur bulle (`import-trimestre-tout-productions`) prend la même phrase, « productions » au lieu d'« échelles » (décidé par Cowork, la phrase de Grégoire appliquée au même cas). Les trois autres bulles (grilles, cartouches, pratiques) disent vrai : n'y touche pas.
   - Le banc qui garde ces textes (`unit/sentinelle-textes-relus-15-oct` ou celui qui les lit) se réancre, motif écrit : « texte corrigé par Grégoire le 25 oct. ».

## 4. Le chemin 2 de la suppression d'une cartouche (verdict du lot 2, § 3)

`supprimerCartoucheConfirm` (`js/cartouches.js` l. ~1640) : « Elle reste dans la Bibliothèque. » devient **« Son exemplaire de ta bibliothèque reste. »**, et la condition passe de l'`id` seul à `BibliothequeUI.lieeAExemplaire`. Rien d'autre ne change dans cette fonction. La sentinelle #647 (chemin 2) se réancre, break-test.

## 5. La preuve

Celle des lots 1 et 2, pour chaque fenêtre : banc neuf dans le vrai `index.html` depuis la démonstration, à 1 440 et à 820 px ; break-test par famille d'assertions ; bancs des deux fenêtres réancrés, motif écrit (`grep -rlE "afficherBibliothequeProductions|afficherBibliothequePratiques|modalBibliothequeProductions|modalBibliothequePratiques|Pratiques dans ta sélection|Productions dans ta sélection" tests/`) ; ceux des grilles, échelles et cartouches inchangés et verts. En plus :

- productions : une production ramenée par « ← Utiliser » montre « ✓ Aussi dans ta bibliothèque » et « ✓ Déjà dans ce trimestre », sans « Garder → » ; sa suppression garde l'exemplaire et affiche la phrase ; la ligne d'import est au pied de la bibliothèque ;
- pratiques : aucune rangée du trimestre ne porte de passage ; l'encadré n'existe plus ; une maquette n'apparaît dans aucune colonne ; la phrase dans la confirmation avec un exemplaire, absente sans ;
- les deux bulles : le texte exact.
- **Captures** : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-3/`, productions et pratiques, Mac 1 440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair.

## 6. Le nouveau partage des lots 3 et 4 (décidé par Cowork)

Le plan mettait au lot 3 la réécriture de l'aide « Comment fonctionne la bibliothèque », et la mise en ligne après le lot 3. Mais la Carte d'alignement est aussi dans l'onglet Conception, et l'aide sert les dix fenêtres. **Décidé** : la mise en ligne groupée se fait **après le lot 4**, pour que tout l'onglet Conception change en une fois. Le lot 4 porte donc : la Carte d'alignement ; la réécriture de l'aide (texte proposé par Claude Code, validé par Grégoire) ; le spécimen du composant dans `design-system.html` (verdict du lot 1) ; le texte des Nouvelles (proposé, validé par Grégoire) ; le markdown de la porte terrain (iPad, Safari). Puis la fusion dans `main`, la réconciliation des compteurs du BACKLOG, la vérification complète et la release, au signal de Grégoire. **Écris ce partage au plan** (§ 0), dans les lignes des lots 3 et 4 et dans « La livraison ».

## 7. Ce qui n'entre pas

La Carte d'alignement et l'aide (lot 4) ; tout geste neuf (dont « Garder » pour une pratique) ; #1160, #1161, #1163 ; l'export depuis la bibliothèque ; les données, clés et règles d'identité, hors le retrait du § 1 ; la fusion et la release.

## 8. Clôture

- Un commit `feat(bibliotheques)` qui nomme #1156 ; la ligne du lot 3 au plan.
- **Pas de release, ni verdict complet, ni push.**
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-3.md` : mesuré et supposé ; la correspondance des gestes de ⋮ pour chaque fenêtre ; les phrases gardées ou retirées ; les deux bulles ; le chemin 2 ; chaque banc réancré, avec son motif ; tes écarts ; les trouvailles et leur issue ; **tout mot neuf, à part, pour que Cowork le soumette à Grégoire**.
