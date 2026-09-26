# Demande de relecture croisée, AVANT fusion – lot #957 « une grille ne perd plus le critère qu'on vient d'ajouter quand on clique « Enregistrer » »

> Écrite le 26 septembre 2026, vers 12 h 30 (Toronto), par Claude Code. Branche `lot-957-grille-critere` (arbre principal), base `9b575769` (poussée, Vitest vert). Commit du correctif : `3428894a`. **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-grille-critere.md`. Un texte attend l'accord de Grégoire (§ 5).
>
> Pour lire le code sans changer de branche : `git diff 9b575769..lot-957-grille-critere -- js/ index.html tests/`.

## 1 · Le mécanisme choisi, et pourquoi

**L'écriture part de la base** (ta préférence, consigne § 2.1), pour deux raisons mesurées.

- **Tenir l'objet mémoire à jour ne suffisait pas** : 23 écrivains de `grillesTemplates` ne touchent pas `grilleTemplateActuelle`. On en compte 18 dans `grilles.js`, dont les cinq des critères et sous-critères, les catégories d'erreurs, la bibliothèque et `importerDansGrilleActive`. Il y en a 5 ailleurs : `cartouches.js:4753`, `donnees-v2.js:1727`, `import-export.js:2614`, `2954` et `wizard-pratique-v2.js:1827`. Recensement fait par un grep de `db.modifier(cle('grillesTemplates')` et de `setSync(cle('grillesTemplates')`, puis en cherchant, jusqu'à la fonction suivante, une ligne `grilleTemplateActuelle = `.
- **Mais `sauvegarderGrilleTemplate` ne sert pas qu'au bouton.** Des gestes vivants modifiaient l'objet mémoire, puis l'appelaient pour qu'il l'écrive entier. Si l'écriture partait de la base sans rien de plus, leur changement était perdu. Ces gestes sont :
  - le type de la grille (`modifierTypeGrilleHandler`) ;
  - « appliquer le type aux critères sans type » (#703) ;
  - le verrouillage d'un critère ;
  - la suppression d'un critère par la liste ;
  - le formulaire d'ajout (`sauvegarderCritere`).

  D'où le paramètre `sauvegarderGrilleTemplate(silencieux, appliquer)`. Dans la file, la fonction relit la grille en base, pose dessus le nom et la description du formulaire, puis applique `appliquer(grille)`, et `grilleTemplateActuelle` devient ce qui a été écrit. Chacun des cinq gestes passe désormais son changement par `appliquer`.

**Échelles** : même patron dans `sauvegarderNomEchelle`. Il réécrivait `{ ...echelleTemplateActuelle }` et ne resynchronisait que si le **nombre** de niveaux différait. Même correctif, sans paramètre : aucun geste ne passe par l'objet mémoire (grep des mutations de `echelleTemplateActuelle` : aucune hors de cette fonction). La garde de resynchronisation est retirée, puisqu'elle devient inutile.

## 2 · Ce que je n'ai PAS couvert au navigateur

- **Trois gestes convertis semblent injoignables** : le verrouillage, la suppression par `afficherListeCriteres` et `sauvegarderCritere`.
  - `sauvegarderCritere` lit `#critereNom`, absent d'`index.html`, et `#formAjoutCritere` est vide.
  - Je les ai convertis par cohérence, sans banc. Lecture seulement `[lu]`.
  - À toi de dire s'il vaut mieux les laisser tels quels, puisqu'ils relèvent du code mort, de l'issue 3.
- **Le reste, non vécu, noté dans la fiche** : l'aperçu et l'export PDF d'une grille lisent `grilleTemplateActuelle`, périmé entre une écriture partielle et le prochain « Enregistrer ». Ce n'est pas inscrit comme fiche séparée, faute de symptôme vécu.

## 3 · Preuves

**Banc** : `tests/integration/grille-critere-ajoute-enregistrer-957.spec.js`, 6 essais. Les gestes sont les vrais boutons (`data-action`) ; ce qu'on lit, c'est la base.

1. critère ajouté, puis « Enregistrer » → 6 en base ;
2. sous-critère ajouté, modifié (vrai champ, au `change`), supprimé, avec « Enregistrer » après chaque geste ;
3. sous-critères par défaut (0-10), puis « Enregistrer » → 11 ;
4. **témoin** : le nom est posé sans `change`, puis « Enregistrer » → le nom est écrit ;
5. critère ajouté, puis changement du type de la grille → 6 critères et le nouveau type ;
6. **principe** : une écriture inconnue directe en base survit à « Enregistrer », pour la grille **et** pour l'échelle, dont le nom tapé est écrit.

**Rouge avant, vert après** :
- sur le code d'avant, 5 rouges et 1 vert, le témoin, comme attendu. La perte d'un sous-critère ajouté est donc **mesurée**, et non plus seulement lue ;
- sur le code corrigé, 6 verts sur 6.

**Mutations, 3 sur 3 rouges** (restauration par copie, empreinte vérifiée) :

| Mutation | Effet |
|---|---|
| M1 : la grille repart de `grilleTemplateActuelle` | 5 rouges |
| M2 : l'échelle repart de `echelleTemplateActuelle` | 1 rouge, l'échelle |
| M3 : `appliquer` ignoré | 1 rouge, le type |

**Autres vérifications** :
- Vitest complet : 641 fichiers, **7 443 / 7 443**, sans aucune ligne « Errors » ni « Unhandled ».
- Verdict Playwright complet : **pas encore**, il viendra après ta relecture.

## 4 · Stock

Une grille qui a déjà perdu un critère ne le retrouvera pas, et rien n'est réécrit. Je n'ai pas mesuré les données réelles de Grégoire.

## 5 · Le texte que Grégoire doit accepter avant le push

**Nouvelles** (ta proposition) : « Grilles : un critère ajouté n'est plus perdu quand on clique « Enregistrer » ensuite. » Les échelles sont entrées au lot, mais je n'ai pas vu de perte vécue pour elles : je ne les ajoute pas au texte, sauf avis contraire.

## 6 · Ce que je te demande de regarder en particulier

1. **L'ordre dans la file** : `appliquer` s'exécute **après** que le nom et la description ont été posés, et **avant** `ajouterContributeurSiNecessaire`. Un geste qui dépendrait de l'ancien nom ?
2. **`sauvegarderCritere` et l'id** : l'id du critère est désormais tiré **avant** l'appel. Avant, il était tiré au moment de l'ajout en mémoire. Si le mutateur ne s'exécute pas (nom de grille vide, doublon annulé), l'id est perdu, sans effet de mon côté.
3. **Un retour anticipé ne mute plus rien.** Si `sauvegarderGrilleTemplate` sort avant la file (nom vide, doublon annulé), les gestes ne mutent plus rien. Avant, la mutation restait dans l'objet mémoire et partait au prochain enregistrement. Je juge que c'est un gain ; dis-le si tu y vois une perte.
