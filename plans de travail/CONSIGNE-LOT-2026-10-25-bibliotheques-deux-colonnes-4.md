# Consigne – Les bibliothèques en deux colonnes, lot 4 : la Carte d'alignement, puis ce qui prépare la mise en ligne (#1157)

> Écrite par Cowork le dimanche 25 octobre 2026 à 16 h 35 (Toronto). Branche `bibliotheques-deux-colonnes` = `deef36ff` ; `main` = `ccc02ccc`.
> Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md` (lot 4, tel que réécrit au lot 3, § 6 de sa consigne). **Font partie de cette consigne** : celles des lots 1 à 3 et leurs verdicts. Ce qui suit ne dit que ce qui change.

## 0. Avant tout

- **Sur la branche.** Ne commence qu'une fois `main` au repos : aucun lot en cours, aucune vérification complète en cours. Si la version du soir de `main` est en train de partir, attends qu'elle soit poussée. Pas de `git stash`.
- Rituel de début de session.
- **La retouche du lot 3 est acceptée** (Cowork, 25 oct., 16 h 30, relu sur `6a2bc864`) : « PAN-Dénotation » sans alias pour `denombrement` (accepté : `TABLE_NORMALISATION_PRATIQUE` ne l'a jamais connu, et le garder aurait été un alias « au cas où ») ; les phrases de colonne vide ; pas de banc pour elles, comme les trois autres fenêtres. **Un commit de docs seul** : ce fichier ; au plan, la ligne du lot 3 (« codé, relu, accepté », `1c854369`, retouche `6a2bc864`).

## 1. La Carte d'alignement : deux colonnes, sans relation entre elles

Conception › Carte d'alignement › « Consulter la bibliothèque » (`js/planification-bibliotheque.js`, `afficherBibliothequeAlignements` l. ~121). Mesuré par Cowork sur la branche :

| Aujourd'hui | Dans la nouvelle fenêtre |
|---|---|
| « Partager » (`partagerAlignement`) : copie la carte dans la bibliothèque sous un `id` neuf, après la fenêtre des métadonnées CC | **« Garder dans ma bibliothèque → »**, même action, fenêtre des métadonnées comprise. C'est le même geste : le plan l'avait prévu. |
| « Ajouter » (`ajouterAlignementDepuisBibliotheque`) : copie dans ce trimestre sous un `id` neuf | **« ← Utiliser dans ce trimestre »**, même action |
| ⋮ du trimestre : Dupliquer, Exporter, Supprimer (`supprimerAlignementDuTrimestre`, codex proposé, refusé pour la dernière carte) | ⋮ : « Dupliquer », « Exporter » (libellés d'aujourd'hui), « Supprimer définitivement », en rouge |
| ⋮ de la bibliothèque : Supprimer (`supprimerAlignementDeBibliotheque`) | ⋮ : « Supprimer de ma bibliothèque » |
| « Importer une carte (JSON) » sous la première section | « Importer ou exporter ▾ » : **« Importer une carte »**, et la note « Fichier .json » |
| « Importer depuis un autre trimestre », avec « Même cours » et « Reprendre » | au pied de « Dans ce trimestre » (l'import écrit dans ce trimestre : `importerCarteTrimestreVersActif`), ses mots d'aujourd'hui |

1. **Aucune relation n'est enregistrée entre une carte et son exemplaire** : les deux passages donnent un `id` neuf sans nommer la source. Il n'y a donc **ni « ✓ Aussi dans ta bibliothèque », ni « ✓ Déjà dans ce trimestre », ni « Tout garder »**, et la phrase « Son exemplaire de ta bibliothèque reste. » ne s'ajoute pas à la suppression. Le passage reste offert sur chaque rangée, comme « Partager » aujourd'hui. **N'ajoute aucun champ de lien** : ce serait écrire des données autrement. Inscris-le (issue 2) : « Cartes d'alignement : relier une carte à son exemplaire, pour dire qu'elle est déjà gardée ».
2. **Les phrases de colonne** : celles des autres fenêtres, « cartes d'alignement » ; la seconde phrase de « Dans ce trimestre » est vraie (deux copies séparées, mesuré).
3. **La ligne en clair** : « 17 nœuds · 12 liens » (au pluriel réel, « nœud » avec son œ ; plus de « noeud(s) »), puis « par <auteur> » comme ailleurs. Plus d'étiquettes « Trimestre actif » ni « Bibliothèque ». **L'aperçu** : ce que la rangée d'aujourd'hui montre en plus (la description courte, l'auteur, la licence) ; une carte qui n'a rien de plus n'a pas d'aperçu, et son nom n'est pas un bouton.
4. **La colonne vide de la bibliothèque** dit aujourd'hui « Partage une carte d'alignement depuis la section ci-dessus. » : elle prend le patron des autres (« Ta bibliothèque est vide. Garde-y une carte de ce trimestre pour la retrouver plus tard. »).

## 2. L'aide « Comment fonctionne la bibliothèque »

`js/accompagnement-contenu-popup.js` l. ~404 (`bibliotheque-fonctionnement`). Elle parle de badges de source, de « ta sélection » et de « Disponibles » : faux pour les six fenêtres en deux colonnes.

- **Propose un texte neuf dans la demande de relecture, ne le code pas avant** : Cowork le soumet à Grégoire, puis tu le poses en retouche. Il dit, au plus court : les deux colonnes et ce qu'elles sont ; le passage dans les deux sens ; que chaque colonne garde son propre exemplaire ; « Retirer de ce trimestre » (les données restent ; l'élément revient par « ← Utiliser » s'il est dans ta bibliothèque) et « Supprimer définitivement » (l'exemplaire de ta bibliothèque reste) ; les dossiers. Pas de mot que l'écran n'emploie pas.
- Les quatre fenêtres pas encore migrées (cours, tampons, trimestres, groupes-cours) mènent aussi à cette aide. Elle leur sera fausse jusqu'aux lots 5 et 6 : **c'est assumé**, et le plan le dit.

## 3. Le spécimen dans `design-system.html`

Le composant entre dans la source de vérité visuelle avant que les utilisateurs le voient (verdict du lot 1) : une section « Fenêtre de bibliothèque en deux colonnes », avec un exemple statique (deux colonnes, une rangée avec passage, une avec état calme, un aperçu ouvert, un ⋮), les classes du composant et les jetons, dans les deux modes. Des noms fictifs.

## 4. Ce qui prépare la mise en ligne

1. **Le texte des Nouvelles**, proposé dans la demande, pour les quatre lots ensemble (skill `release-et-changelog`) : ce que l'enseignant voit, en gestes, dans les mots de l'écran. Grégoire le valide avant la release.
2. **La porte terrain** (skill `portes-terrain`) : écris le markdown `plans de travail/PORTES-TERRAIN-<date>-bibliotheques-deux-colonnes.md`. Ce que la session ne peut pas éprouver : l'iPad au doigt (le passage, ⋮, l'aperçu, le défilement après un passage, l'empilement en portrait) et Safari au Mac, sur les six fenêtres. **Sur les vraies données de Grégoire, la porte ne fait que regarder** (ouvrir chaque fenêtre, déplier un aperçu, ouvrir ⋮ sans rien choisir, faire défiler) : ses grilles, échelles, cartouches, productions et pratiques de l'automne 2026 doivent s'y reconnaître. **Les gestes qui écrivent** (les deux passages, « Tout garder », retirer, supprimer) **se font en mode démonstration.** Cowork publie l'artefact jumeau.
3. **Pas de fusion ni de release dans ce lot.** Après le verdict de Cowork et la validation des mots par Grégoire : la fusion dans `main` (la ligne « Dernier ID utilisé » du BACKLOG prend le plus grand des deux compteurs, aucun numéro ne resert), puis la vérification complète et la release, au signal de Grégoire. Écris ces étapes au plan, sous « La livraison ».

## 5. La preuve

Celle des lots précédents pour la Carte : banc neuf dans le vrai `index.html`, depuis la démonstration, à 1 440 et à 820 px ; break-tests ; bancs réancrés, motif écrit (`grep -rlE "afficherBibliothequeAlignements|modalBibliothequeAlignements|Mes cartes d'alignement|partagerAlignement" tests/`) ; ceux des cinq autres fenêtres inchangés et verts. En plus : « Garder → » ouvre la fenêtre des métadonnées puis ajoute un exemplaire ; « ← Utiliser » ajoute une carte au trimestre ; la dernière carte du trimestre ne se supprime toujours pas ; aucun état calme n'est affiché. Le spécimen : la page s'ouvre sans erreur de console. **Captures** : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-4/`, la Carte, Mac 1 440 clair et sombre, iPad 820 clair ; et le spécimen.

## 6. Ce qui n'entre pas

Les cours, tampons, trimestres et groupes-cours (lots 5 et 6) ; tout champ de lien pour les cartes ; tout geste neuf ; #1160, #1161, #1163, #1164 ; le texte de l'aide avant sa validation ; la fusion et la release.

## 7. Clôture

- Un commit `feat(bibliotheques)` qui nomme #1157 ; la ligne du lot 4 au plan.
- **Pas de release, ni verdict complet, ni push.** La copie de travail revient sur `main` à la fin, `RELAIS.md` à jour sur `main` (commit de docs seul).
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-4.md` : le mesuré et le supposé ; la correspondance des gestes ; **à part, pour Grégoire : le texte proposé de l'aide, le texte proposé des Nouvelles, tout mot neuf** ; les bancs réancrés ; tes écarts ; les trouvailles et leur issue.
