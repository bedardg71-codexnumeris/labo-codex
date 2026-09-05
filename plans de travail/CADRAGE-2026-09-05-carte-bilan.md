# Cadrage — la carte « Observation » devient « Bilan », et ne porte que le bilan

> **Écrit le 5 septembre 2026 à 8 h 01 (Toronto), par Cowork, sur décision de Grégoire (7 h 55).**
> Application au moment de l'écriture : **1.118.0** en ligne (build `0905-0744`, `d6c4b3fc`).
> **Pas dans 1.119 sauf décision contraire** : inscrit « pour la prochaine fois », après la journée du 5.

## Le constat (mesuré le 5 au matin)

Depuis 1.118, la carte « Observation » du gabarit algorithmique porte le menu « Modèle d'observation » et trois
énoncés. Deux vont dans le **bilan** de l'élève (application et PDF de synthèse) : « Défi prioritaire »
(`evaluation-retroaction.js:842`, quand le critère est effondré) et « Quand tout est maîtrisé » (`:920` et
`synthese-retroaction-data.js:820`). Le troisième, « Aucune annotation », ne s'affiche **qu'à l'enseignant·e**, dans
le panneau de correction, quand la copie ne porte ni tampon ni erreur (`:507`). Le titre « Observation » ne désigne
rien que l'élève ou l'enseignant·e voit à l'écran ; la carte mélange deux publics.

Et la description du modèle « Français écrit (formulations d'origine) » porte un numéro de fiche lu par les
collègues (`evaluation-enonces.js:248`, « Les phrases d'avant #581 ») — proposé le 5 à 7 h 50, **pas encore
corrigé** (1.118 est partie avec).

## Ce qui est arrêté (Grégoire, 5 septembre, 7 h 55)

1. **La carte s'appelle « Bilan »** — le mot que l'élève et l'enseignant·e voient déjà dans l'application et le PDF.
2. **Elle ne contient que ce qui va dans le bilan** : « Défi prioritaire » et « Quand tout est maîtrisé ».
3. **« Aucune annotation » déménage sous la case « Utiliser ces sous-critères comme codes d'annotation »**, dans la liste
   « Sous-critères » — ↻ corrigé à 11 h 53 : la carte « Codes d'annotation » **n'existe plus depuis le lot A** (1.119, `a3deac63`) ;
   la case est maintenant l'endroit où vivent les codes (`rendreActivationCodes`, appelé dans `rendreSousCriteresAlgo`,
   `grilles.js:~4314`). La phrase s'y rend par le même helper (`rendreChampEnonceAlgo`, clé `aucune`), sous un pli fermé
   « Quand la copie ne porte aucun code ». ⚠ Réserve nommée : la case n'est rendue qu'en édition d'une grille enregistrée
   (`grilleId`), pas à la création ; la phrase suivra — acceptable pour un texte qu'on ne touche pas avant d'avoir corrigé.
   Une seule maison : elle n'apparaît plus dans « Bilan », ni en édition ni en création.
4. **Le menu « Modèle d'observation » reste dans « Bilan »** et se renomme pour dire les deux choses qu'il fait,
   texte de départ à reprendre par Grégoire : « Modèle des phrases (bilan et décompte) » — il fournit aussi le texte
   de départ du décompte, qui vit dans « Ce que l'élève lit » depuis 1.118 (`enoncesAlgo.normaliser`). Le découpler
   est hors de ce cadrage.
5. **Le modèle « Français écrit (formulations d'origine) » devient « Français écrit »** — nom ET description, mots arrêtés
   par Grégoire le 5 à 11 h 41 (à écrire au caractère, `evaluation-enonces.js:247-248`) :
   - nom : `Français écrit`
   - description : `Les phrases parlent du français écrit (« erreurs de français », « la qualité du français »). Pour un
     critère d'une autre discipline, choisis « Générique », qui nomme le critère tel qu'il est écrit dans la grille.`
   Motif, dans ses mots : « On ne conserve pas les formulations pour les élèves qui ont déjà reçu leur rétroaction. Elle est
   imprimée de toute façon dans leur PDF, de façon permanente. » ⮕ La raison d'être « formulations d'origine » tombe ; le modèle
   reste comme LE modèle du français écrit. L'identifiant enregistré dans les grilles (`discipline_francais`) ne change pas ;
   `_nomDitFrancais` (le choix par défaut) non plus. Rendu seul.

## Ce qui ne change pas

Aucune clé de données (`enonces.priorite`, `enonces.concentre`, `enonces.aucune`, `modeleEnonces`), aucun handler,
aucun format qui voyage. Rendu seul : `rendreBlocEnoncesAlgo`, `rendreBlocCodesAlgo`, `rendreCartesGabaritAlgo`,
la clé de pli `commentaire` (mémoire seulement — peut rester).

## Fini quand

Grégoire ouvre un critère algorithmique : une carte « Bilan » à deux phrases, « Aucune annotation » sous la case des codes,
dans la liste « Sous-critères », le menu renommé, le modèle « Français écrit » sans parenthèse et sa description neuve ; la sentinelle « une seule carte » (étape 2) adaptée,
une sentinelle qui rougit si « aucune » revient dans « Bilan ».
