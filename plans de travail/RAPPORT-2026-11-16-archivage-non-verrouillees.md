# Rapport — les copies non verrouillées se voient avant l'export (16 nov. 2026)

**Branche** : `lot/archivage-non-verrouillees`, partie de `origin/main` à `baddec78f`.
**État** : livré sur la branche, non fusionné (Grégoire fusionne). Voie « nouveauté » : aucune release dans ce lot.
**Reste** : la relecture de la capture par Cowork ; un regard sur iPad (toucher du cadenas ouvert, largeur de la
pastille « NON VERROUILLÉE » dans une grille de 20 copies) ; les trois écarts du §3, à trancher par Grégoire.

## 1. Ce qui change

Constat de Grégoire (iPad, 1.248.2, « Exporter et archiver ») : le compteur de l'Export Léa dit « 1 évaluation non
verrouillée laissée de côté », la grille du haut ne dit pas laquelle.

En vue Archivage seulement (action `ouvrirPreviewInline`) :

- la case d'une copie que l'export laisse de côté porte la pastille « Non verrouillée » (classe `non-enregistree`,
  celle de la liste des évaluations) et le cadenas ouvert (`icon-open-lock.svg`, bulle « Évaluation non
  verrouillée : laissée de côté par l'export ») ; elle garde sa place dans la grille ;
- l'en-tête du groupe la sort du compte « évalués » et lui donne sa pastille, « N non verrouillée(s) » ;
- « Incomplet » garde la priorité, sur la case comme à l'en-tête.

Fichiers : `js/travaux-ui.js` (`_dasLaissesDeCoteLea`, `_copieLaisseeDeCote`, `_statutPastilleArchivage`, un
troisième paramètre à `genererBadgeFichierImporte` et à `genererResumeStatuts`), `styles.css` (la pastille d'en-tête
a sa règle, sur les jetons de la famille « attention »), `tests/integration/archivage-non-verrouillees.spec.js`.

## 2. Une seule source

La grille ne rejuge pas le verrou. Pour chaque production, elle demande à
`travauxArchivage.selectionnerEvaluationsLea(productionId, null, false)` ses `nonVerrouillees` (la sélection du
compteur et de l'export) et marque les copies des élèves qui s'y trouvent.

Le carrousel d'annotation n'est pas touché : `statutPastilleFichier`, `afficherPastilleActive` et
`dataset.origClasse` sont inchangés, et hors de la vue Archivage l'ensemble des élèves laissés de côté est nul.
Source ou stock : le lot n'écrit aucune donnée, il n'y a pas de stock à reprendre.

## 3. Où la grille et l'export ne disent pas la même chose — dit, pas tranché

1. **Doublon divergent, la non verrouillée plus récente.** L'export envoie la verrouillée : la case n'est pas
   marquée, pastille « Évalué ». Mais `trouverEvaluationPourFichier` rend la plus récente, donc la non verrouillée :
   la case n'a **aucun cadenas**, ni ouvert ni fermé, alors que l'élève part. C'était déjà le cas avant le lot.
2. **« Incomplet » non verrouillée.** L'export la compte parmi les laissées de côté. La case garde la pastille
   « Incomplet » (priorité demandée) et porte le cadenas ouvert ; l'en-tête la compte « incomplet ». Le nombre de
   l'en-tête peut donc être inférieur à celui du compteur ; le nombre de cadenas ouverts, lui, concorde.
3. **L'en-tête compte des copies, le compteur des évaluations.** Un élève laissé de côté qui a deux copies (une
   originale et sa reprise) donne deux cases marquées et « 2 non verrouillées », pour « 1 évaluation » au compteur.

Trois suppositions de la session, nommées :

- une évaluation active sans critère noté (un jeton de délai seul), non verrouillée, est laissée de côté par
  l'export ; sa case passe de « Annoté » ou « Importé » à « Non verrouillée », pour que les cases marquées restent
  celles de l'export ;
- la grille marque d'après l'export de tout le groupe ; les réglages « Étudiant·e » et « Reprises seulement » de
  la carte Export Léa changent le compteur, pas la grille ;
- les copies « Non associées » (sans production) ne sont jamais marquées : l'export ne les considère pas.

## 4. Preuve

Passage sous WebKit, `tests/integration/archivage-non-verrouillees.spec.js`, 4 essais verts ; l'essai voisin
`export-lea-verrouillees.spec.js`, 5 essais verts. Vitest : 11 817 essais verts
(un premier passage a rendu la sentinelle #1162 rouge : la règle CSS d'« incomplet » avait été regroupée ; séparée depuis).

| Essai | Ce qu'il établit |
|---|---|
| une seule non verrouillée | pastille orange et cadenas ouvert sur sa case, ordre des cases inchangé, « 2 évalués » et « 1 non verrouillée », le compteur dit « 1 évaluation non verrouillée laissée de côté » ; verrouillée, la case redevient verte, cadenas fermé, « 3 évalués » |
| « Incomplet » | la pastille reste « Incomplet », l'en-tête dit « 1 incomplet » et « 1 non verrouillée » |
| reprise et doublon | les cases au cadenas ouvert sont exactement `nonVerrouillees` (la reprise marquée, le doublon non) |
| carrousel | la copie non verrouillée y reste `evalue`, aucun cadenas ouvert, aucune pastille orange |

Break-test : sans le lot, les trois premiers essais sont rouges et le quatrième vert ; avec la marque posée hors de
la vue Archivage, le quatrième est rouge et les trois premiers verts.

Limite de la preuve : le verrouillage est écrit en base puis la vue rouverte ; le geste « Verrouiller » lui-même
n'est pas rejoué. Rien n'a été éprouvé sur iPad.
