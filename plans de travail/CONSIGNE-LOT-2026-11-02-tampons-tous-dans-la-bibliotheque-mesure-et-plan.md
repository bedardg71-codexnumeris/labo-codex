# Consigne – Tous les tampons dans la bibliothèque, aucun perdu sur une copie : mesure et plan (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 4 h 46 (Toronto, mesuré par `date`). **À lancer après `CONSIGNE-LOT-2026-11-02-copie-garde-sa-taille.md`**, une seule session à la fois. **Ce lot-ci ne touche pas au code** : il mesure et écrit un plan, que Cowork relit avant le code.
> **Demande de Grégoire** (2 nov., 4 h 42 à 4 h 45), ses mots : « je voudrais m'assurer que les tampons qui ont été utilisés sur les artefacts que j'ai évalués jusqu'à maintenant demeurent sur la copie de l'élève, même s'ils ont été retirés de la palette. Et je voudrais aussi qu'ils demeurent dans la bibliothèque, de sorte que je pourrais éventuellement les restaurer au besoin. » ; « les nouveaux tampons que j'ai créés hier » y entrent aussi ; « il y avait des tampons par défaut qui étaient fournis à l'utilisateur. Je voudrais que ces tampons soient en réalité dans la bibliothèque et l'utilisateur décidera ou non de les utiliser. » **Une règle pour tous**, pas une réparation de ses seules données (sa réponse de 4 h 45).
> Ses tampons créés hier l'ont été **sur l'iPad, dans la 1.229** (avant le correctif #1216), pendant le verdict du soir. Ni Cowork ni toi ne lisez ses données : tout se reproduit au banc, noms fictifs.

## Les gestes visés

1. **Un tampon posé sur une copie y reste** : à l'écran, dans le PDF de l'élève et dans sa rétroaction écrite, qu'il soit intégré ou créé, retiré de la palette ou non.
2. **La bibliothèque contient tous les tampons** : les intégrés, chaque tampon créé (sans « Garder »), et ceux qu'on y a importés. La palette, c'est ce qu'on a choisi d'utiliser.
3. **Retirer un tampon de la palette ne le supprime jamais** : il reste dans la bibliothèque, d'où « Utiliser dans ma palette » le remet, avec son nom, son image, son texte et sa catégorie.
4. **Ses tampons d'hier y entrent d'eux-mêmes**, au premier chargement de la nouvelle version, sur l'iPad.

## La règle du verrouillage (Grégoire, 4 h 49 à 4 h 52 — elle gouverne tout le plan)

Ses mots : « L'idée est de faire passer les tampons déjà utilisés dans la bibliothèque et de les laisser tels quels sur la copie de l'élève. […] Ma manipulation des tampons de ma palette vers la bibliothèque ne devrait pas affecter les copies qui sont déjà évaluées. » Puis : « lorsque la copie est verrouillée, tous les commentaires, tous les tampons, tous les codes sont préservés avec cette évaluation et ce verrouillage. Si de nouveaux tampons sont créés, les copies déjà évaluées et verrouillées ne devraient pas subir le changement. Seulement les nouvelles copies. »

- **Copie verrouillée** : ses tampons (nom, image, texte), ses codes (nom, couleur, texte) et ses commentaires restent tels qu'au verrouillage, à l'écran, dans le PDF de l'élève et dans sa rétroaction. Même principe que la note remise (27 oct.).
- **Copie non verrouillée** : elle suit les réglages actuels, comme aujourd'hui (sa décision du 24 sept., « les observations reposent sur les paramètres actualisés », vaut pour elles).
- **Pourquoi c'est urgent pour lui** : son export d'hier soir (`EXPORT-TAMPONS-GREGOIRE-2026-11-01-22h21.json`, dans ce dossier, données à lui, pas d'élève) montre des tampons fournis **repris sous un autre nom et un autre sens** : `obs-relation` porte « Transition », `action-liaison` « Relation », `action-reperage` « Identification », `action-ouverture` « Déduction » ; « Attention » et « Soupçon IA » y sont des tampons créés, les intégrés du même nom étant retirés. Une copie annotée avant hier, qui lit ses tampons par leur `id` dans les réglages actuels, afficherait déjà les nouveaux (inférence de Cowork, à mesurer).

À mesurer en plus (§ 1) : ce que le verrouillage enregistre aujourd'hui (la note remise seule ?) ; ce qu'affiche une copie verrouillée après qu'un tampon de même `id` a changé de nom, d'image et de texte, et après qu'un code a changé. **Le stock** : pour les copies déjà verrouillées, d'où viendraient le nom, l'image et le texte d'avant (les valeurs fournies sont dans le code ; ses personnalisations d'avant hier, peut-être dans un codex ou la Réserve). Le plan propose ; **la décision sur ses copies déjà verrouillées remonte à Grégoire** (ses données réelles).

## Décisions de Cowork (à garder dans le plan)

- **Un utilisateur existant ne voit pas sa palette changer** ; **un nouvel utilisateur** part, pour l'instant, comme aujourd'hui (les intégrés dans sa palette, et aussi dans la bibliothèque). Partir d'une palette vide relève du chantier de simplification ; Cowork l'a dit à Grégoire.
- **Aucune suppression définitive d'un tampon posé sur une copie** (sa règle du 20 sept. : rien d'irréversible sur ses données). Ailleurs, la suppression existante de la bibliothèque reste.
- **Une seule source par donnée** (skill `integrite-globaux`) : la bibliothèque ne recopie pas ce qui existe déjà ; elle lit les intégrés dans le code, les tampons créés là où ils vivent, les tampons importés dans `bibliothequeTampons`.

## 1. Mesure (sur `main`, WebKit et Chromium)

- Le geste 1, aujourd'hui, pour : un intégré retiré de la palette ; un tampon créé, posé sur une copie, puis supprimé dans la fenêtre des tampons, avant et après un rechargement. Écran, PDF de l'élève, rétroaction écrite (#760, « Autres tampons »).
- **Le stock** : après la suppression d'un tampon créé, ce qui reste en base de lui (`personnalisationObservations`, `retroactionsObservations`, les annotations) et ce qui manque pour le reconstruire.
- **Ce qui voyage** : quelles de ces clés passent par le codex (`js/codex.js` vers 2156), la Réserve (`js/reserve-ouvrir.js`), l'export et l'import des tampons ; ce que le plan y change.

## 2. Le plan

`PLAN-2026-11-02-tampons-tous-dans-la-bibliotheque.md` : le modèle des données retenu (où vit un tampon créé, ce qui marque « retiré de la palette », ce que le verrouillage fige et où), la réparation du stock au premier chargement (ce qu'elle écrit, pourquoi c'est sans perte, ce qu'elle fait si une définition manque), les écrans touchés et leurs mots (ceux que l'enseignant·e lit : à soumettre, pas à figer), les lots, les tests. Puis le rapport `RAPPORT-2026-11-02-tampons-mesure.md` à Cowork.

Commit de docs seul : cette consigne, le rapport et le plan. **Aucun code, aucune release.**
