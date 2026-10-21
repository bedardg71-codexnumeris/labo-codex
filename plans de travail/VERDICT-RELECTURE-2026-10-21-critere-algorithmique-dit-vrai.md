# Verdict de relecture – Le critère algorithmique fait ce que son écran dit (#1134, #1131 ; inscrits #1132, #1133)

> Cowork, mercredi 21 octobre 2026, 9 h 16 (Toronto, mesuré par `date`). Commit relu : `6992bec4` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-dit-vrai.md`.

## Verdict : accepté, sans correction

- Une seule paire d'écrivains pour le champ (`poserErreursDuChamp`, `erreursPourLaFormule`) ; les six sites y passent, vérifié au diff (Annoter, les deux vidages, `chargerGrilleSelectionnee`, `verifierEtChargerEvaluationExistante`, `_restaurerDonneesAlgorithmiquesModif`). Une seule source pour la parenthèse (`mentionPonderee`), où la mention « (3.5 points) » du mode Catégories est ramenée. Zéro-dette tenue.
- Copie suivante dans Annoter : `preRemplirEvaluation` passe par `chargerEvaluationsEtudiant`, qui vide le champ et sa garde avant que les compteurs arrivent (`travaux-ui.js`, l. 5651 ; compteurs à 2 s, l. 5190). Une garde restée d'une copie évaluée ne s'applique donc pas à la copie suivante. Lu, pas exécuté.
- Captures regardées. Poids 1 et 0,5 : la ligne et la phrase disent « 7 erreurs (5 une fois pondérées) », 13,75/20, niveau D. Poids à 1 : aucune parenthèse, 11,25/20, niveau I. La projection reste au nombre brut dans les deux (« 1 erreur à chaque 57 mots »), conforme à #668.

## Les trois questions de la demande

1. **La parenthèse dans le repère `{points}` : retenue.** Sa limite est bénigne. La ligne du PDF n'est pas un modèle rédigé : elle porte toujours la parenthèse. Une phrase réécrite sans le repère dit le nombre brut, qui est vrai, et la ligne juste au-dessus dit la somme. Le nom du repère (« points pondérés ») et son aide vont au lot de mots.
2. **La garde du stock : retenue.** Conséquence nommée, voulue par K.b : sur une évaluation enregistrée avant qu'un poids change, le premier code ajouté fait passer tout le décompte aux poids, et la note peut alors monter après une erreur ajoutée (5 brutes, puis 6 codes qui font 4 une fois pondérés). Cas rare : les sous-critères par défaut pèsent tous 1 (mesuré : dix à 1, un à 0, `initialiserSousCriteresParDefaut`), ceux de Grégoire aussi. Disposition : *commenter et oublier* côté code ; la page « critères algorithmiques » du guide dira de régler les poids avant de corriger, une copie déjà évaluée gardant sa note jusqu'à ce qu'on y change un code. Antérieur au lot, sans suite : une évaluation enregistrée AVEC sa somme se recalcule à la réouverture si les poids ont changé depuis, comme pour tout autre changement de la grille (facteur, formule).
3. **« Niveau de l'échelle « X » » : retenu.** Texte lu par l'enseignant, pas par l'élève : la règle laisse Cowork trancher. Les mots existent déjà dans l'application. `echelleSelectionnee` est bien définie dans la portée des deux sites (l. 1067).

## Les suppositions

1. Un code inconnu pèse 1 : retenue, c'est hier.
2. Dix-millième au calcul, deux décimales à l'affichage : retenue.

## Pour le lot de mots (ce que l'élève lit : revient à Grégoire)

Deux défauts antérieurs au lot, sur la ligne du PDF que ce lot touche. Disposition : *inscrits au lot de mots*, sans fiche, puisque ce lot suit.
- La note et le pourcentage s'écrivent avec un point (« 13.75/20 (68.8 %) ») ; la parenthèse, avec une virgule (« 3,5 »). La même ligne mêle les deux dès qu'un poids diffère de 1.
- « erreurs » est écrit en dur : « 1 erreurs », « 0 erreurs ».
- Avec eux : l'infobulle « Niveau IDME : I = Incomplet… » (`accompagnement-contenu-hover.js`, l. 354), sous le libellé qui ne dit plus IDME.

## Hors relecture

`MESURE-2026-10-21-critere-algorithmique.md` porte cinq lignes de Cowork écrites après le commit (les classeurs Numbers, 9 h 11) : à verser au prochain commit, avec ce verdict.

À la release : ce lot part avec la prochaine version, au signal de Grégoire.
