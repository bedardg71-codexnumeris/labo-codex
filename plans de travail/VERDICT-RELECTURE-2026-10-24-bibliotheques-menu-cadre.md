# Verdict de relecture – le Cadre : la rangée de sélection en tête des six accordéons (lot 2, #1148)

> Cowork, samedi 24 octobre 2026, 17 h 05 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-cadre.md`, `27056905` (par la demande et ses mesures), les captures Trimestre (1440 px, accordéons Cours et Élèves ouverts) et Carte d'alignement (1440 px).

## Verdict : **accepté, avec une retouche** (§ 2)

Les six accordéons ont la rangée du lot 1, la fiche prend la largeur, et la page du Trimestre se lit maintenant comme les écrans de la Conception. Les retraits sont mesurés (aucun appelant, `grep` avant chaque retrait), la régression de l'horaire à 820 px a été trouvée par les bancs et corrigée par une requête de conteneur, et la faille d'échappement du résumé des élèves est fermée avec son break-test.

## 1. Les écarts à la consigne : acceptés

| Écart | Décision de Cowork |
|---|---|
| Aucun des six menus ne passe par `MenuSelection` | **Accepté.** La mesure contredit le § 2.1 : la valeur vide est lue ailleurs (licence, PDF, mots du Cadre) ; le composant en changerait le sens. Même apparence, gestionnaires d'origine : c'est la bonne frontière. |
| Groupe-cours rangé avec ceux qui ouvrent une fiche | Accepté (mesuré : il n'active pas). |
| Cartes résumé : Cours, Profil, Horaire partent ; Trimestre, Élèves, Groupe-cours restent en bande | Accepté : c'est la règle du § 2.3 appliquée carte par carte. |
| L'horaire en deux lignes en iPad portrait | Accepté : une ligne qui débordait n'était pas une ligne. |

## 2. La retouche : la bande de la Carte d'alignement sur le couple seul

La supposition de Claude Code (la bande entoure aussi « Actions ▾ », « Annuler », « Rétablir ») est tranchée par Cowork : **la bande entoure le bouton et le menu seuls**. Au lot 1, la bande bleu pâle veut dire « ta sélection » (la bibliothèque, le menu, et la création) ; les outils qui agissent sur la carte ouverte restent hors de la bande, comme Dupliquer, Supprimer et Fermer dans la Conception. Le `div` d'une ligne que Claude Code propose ; un essai qui vérifie qu'« Actions ▾ » est hors de la bande.

## 3. La trouvaille laissée ouverte

« Exporter CSV » et « Vider la liste » cachés après un premier import sans rechargement : la question est posée à Grégoire (24 oct., 17 h 05). S'il l'a vu, la fiche entre au backlog ; sinon, elle reste notée ici.

## 4. Portes terrain

D'accord : aucune porte due. Rien à publier.

## 5. Suite

Lot 3 (les chaînes d'étapes et leur option) : Cowork propose d'abord à Grégoire les étapes de chaque outil, à corriger, avant d'écrire la consigne.
