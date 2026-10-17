# Mesure – une grille sans niveaux devient une grille en points (étape 4 du plan)

> Cowork, samedi 17 octobre 2026, 9 h 43 (Toronto), en lecture seule sur `751d1eed`. Étape 4 de `PLAN-2026-10-17-pret-pour-lundi.md`. Sert à écrire la consigne de l'étape 5.

## Ce qui est mesuré dans le code

1. **Le type « analytique » existe** (lots du 3-4 sept. 2026) : sur la grille, `type` est le défaut de ses critères (`grilles.js` ~1736) ; sur le critère, `type: 'analytique'`.
2. **Les points se saisissent sur le maximum du critère, et le maximum EST la pondération** (« décision de Grégoire », `evaluation-calcul.js` ~1313-1336) : points dans `evaluation.pointsAnalytiques[critereId]`, pourcentage = points / pondération × 100.
3. **La note se fait par les points seuls.** Le niveau déduit des points (par les bornes de l'échelle de l'évaluation, `niveauDeduitDesPoints` ~1366) n'ouvre que la cartouche et n'entre pas dans la note (commentaire ~1350 : « il n'entre PAS dans la note, que les points font seuls »).
4. **La note est normalisée par le total des pondérations** (`calculerNote` ~1540-1557 : `pourcentage = noteTotal / ponderationTotal`). Une grille sur 20 ou sur 50 rend donc un pourcentage juste sans être ramenée à 100.

## Ce que ça veut dire pour une grille comme celle de 1995

- Elle entre **telle quelle** : un critère analytique par rangée, sa pondération = ses points (« /4 » → 4, « /18 » → 18), aucun niveau, aucun descripteur, **aucune échelle créée** : rien d'inventé. L'évaluation emploiera l'échelle que l'enseignant·e choisit déjà pour sa production ; elle ne sert qu'à déduire un niveau et ouvrir une cartouche, pas à la note.
- **« Ramener à 100 % » ne doit pas être proposé** pour une grille en points : il changerait le maximum sur lequel l'enseignant·e saisit (son « /4 » deviendrait autre chose). Avertissement au conditionnel seulement si le total est nul.
- La colonne « Commentaires » vide (à remplir copie par copie) : rôle « À ignorer » proposé.
- Les regroupements (« Introduction », « Développement », « Conclusion », en case fusionnée verticale) : préfixe du nom du critère ou description ? À trancher à l'étape 5 (technique : Cowork).

## Ce qui reste à mesurer ou à régler à l'étape 5

- **Les pondérations décimales** (« /2,5 ») : l'éditeur lit la pondération par `parseInt` (~311) ; le lot 2 bloque déjà une pondération non entière. À garder.
- **Le message de l'éditeur** « ses critères totalisent N %, pas 100 % » (`grilles.js` ~829) parle en pourcentage à une grille en points : mots à soumettre à Grégoire (étape 7), pas à changer en silence.
- ~~Une production sans échelle~~ **Réglé par la mesure (9 h 48)** : #941 (24 sept. 2026) — une grille entièrement en points (badge « ANALY », `grilleEntierementEnPoints`, `gabarits-utils.js` ~100) se note SANS échelle ; aucune échelle n'est glissée d'office ; aucun nom de niveau ne s'affiche (décision A). L'assistant ne crée donc ni échelle ni cartouche pour une grille en points.
- La reconnaissance : une colonne dont l'en-tête est « Note », « Points », « Pts », « /N » et dont les cases sont « /4 », « 4 pts », « sur 18 » → rôle « Pondération » (ou un rôle neuf « Points ») ; une grille sans colonne de niveau devient analytique au lieu d'être refusée.
