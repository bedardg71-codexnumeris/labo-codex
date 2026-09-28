# Portes terrain – carte d'alignement (1.165.0) : objectifs vérifiés, pastille de l'évaluation

> Écrite le 28 septembre 2026 par Claude Code. **Artefact jumeau : à publier par Cowork** (bouton « Copier mes résultats » ; les rangées du §3 prennent un champ de saisie, pas une case).
> ⚠ **Cette porte attend le push** : tant que `https://app.codexnumeris.org` n'affiche pas **1.165.0**, elle jugerait la version d'avant.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.
> **Rien de fictif à créer** : tout se fait sur ta carte réelle, et chaque geste qui la modifie a sa rangée de retour.

## §0 · Préalable

- [ ] Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
      ⮕ Attendu : **1.165.0**. Sinon, s'arrêter là : la carte n'est pas encore en ligne. `iPad`

## §1 · ⚠⚠ Données — ta carte réelle

> **POURQUOI** — Avant 1.165.0, une évaluation se reliait par des flèches « se vérifie par ». Maintenant, elle coche dans son Inspecteur les objectifs qu'elle vérifie. Tes flèches déjà tracées doivent rester là et compter comme avant. Les tests le prouvent sur une carte inventée ; seule ta carte « Écriture et littérature (A26) v3 » dit que ça tient sur la vraie.

- [ ] Ouvre la carte « Écriture et littérature (A26) v3 » et regarde une évaluation que tu avais reliée par une flèche « se vérifie par ».
      ⮕ Attendu : la flèche est toujours là. `iPad` `⚠⚠ Données`
- [ ] Touche deux fois cette évaluation pour ouvrir son Inspecteur.
      ⮕ Attendu : une rubrique **« Objectifs vérifiés »**, avec « Cette leçon », puis les leçons placées avant elle. `iPad`
- [ ] Coche au doigt un objectif qui n'était pas coché.
      ⮕ Attendu : la case se coche, et la pastille de l'évaluation, dans son en-tête, change ou reste selon ce que cet objectif ajoute. `iPad` `⚠⚠ Données`
- [ ] Décoche ce même objectif.
      ⮕ Attendu : la case se décoche, la pastille revient à ce qu'elle montrait avant. C'est le retour à l'état d'origine. `iPad` `⚠⚠ Données`

## §2 · Interface

Rien. Ces gestes sont tenus par les bancs WebKit `planif-modele-ia-963`, `planif-badges-objectifs-964`, `planif-pastille-evaluation-965` et `planif-guide-966` (6 essais, sur la carte démo), et 27 essais `planif-*` en tout :
- « Télécharger un modèle… » produit le fichier et n'écrit rien dans la carte ;
- l'Inspecteur d'une évaluation propose sa leçon puis les précédentes ; un objectif coché d'une leçon devenue postérieure survit quand on coche une autre case ;
- la pastille passe par ses cinq états sans reconstruire la carte ; la légende est dans l'Inspecteur ;
- le guide a neuf pages ; la page 8 montre la légende à cinq pastilles.

## §3 · Décisions

> Ce ne sont pas des vérifications : des choix posés faute de pouvoir les trancher à ta place.

- **Les couleurs des cinq pastilles d'une évaluation**, en mode sombre puis en mode clair (tu les vois toutes ensemble dans la légende de l'Inspecteur d'une évaluation, ou à la page 8 du guide) :

  | Pastille | Couleur proposée |
  |---|---|
  | **!** aucun objectif coché | contour pointillé, couleur de l'évaluation, pâle |
  | **✕** jamais enseigné | rouge d'erreur |
  | **⚠** enseigné seulement après | orange |
  | **?** impossible de le dire | gris, trait plein |
  | **✓** enseigné avant | contour de la couleur de l'évaluation |

  Écris « gardées », ou ce que tu veux changer (quelle pastille, dans quel mode) : ________

## §4 · Ce que je n'ai pas pu vérifier

- **Ta vraie carte** : ni tes objectifs ni tes évaluations ne sont dans le dépôt. Ce qui change à la lecture, sans rien écrire (§ 6 de la demande #964) : une évaluation qui cochait déjà un objectif peut gagner son ✓ ; tout **Exposé** non relié à une connaissance passe de ✓ à « ! » ; une évaluation **clonée, déplacée ou hors leçon** compte l'objectif qu'elle cochait. Si l'une de ces lectures te surprend sur ta carte, c'est une fiche.
- **« Télécharger un modèle… » sur l'iPad** : le banc l'éprouve dans WebKit sur le Mac, pas le téléchargement de Safari sur iPad (où le fichier atterrit, s'il s'ouvre). Pas de porte : rien ne s'écrit dans ta carte. Si le fichier ne vient pas, c'est une fiche.
- **Les couleurs** : proposées, contraste mesuré par Cowork pour le gris (6,5:1 en sombre, 5,6:1 en clair) ; les autres reprennent celles des pastilles d'objectif.
- **Fiches inscrites, non corrigées** : #970 (la carte démo montre encore l'ancien geste), #971 (coût de la pastille sur une grande carte), #972 (lecteur d'écran), #973 (semaine par défaut du panneau modèle), #974 (l'export du plan tait l'objectif servi dans une autre leçon).
- **Erreurs de la session** : au rebase, le numéro #967 était pris deux fois (renuméroté #974) ; la relecture versée par la session infonuagique n'était qu'un résumé (texte intégral versé) ; un essai de la pastille « ? » que j'avais écrit ne prouvait pas son titre (retiré) ; et une demande de relecture a cité l'empreinte d'un commit amendé (corrigé).
