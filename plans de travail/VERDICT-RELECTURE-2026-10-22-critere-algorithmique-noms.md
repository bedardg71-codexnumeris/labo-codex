# Verdict de relecture – Le critère algorithmique, étape 2a : les deux noms de l'enseignant

> Cowork, jeudi 22 octobre 2026, 17 h 40 (Toronto, mesuré par `date`). Relu : `365b5364` (non poussé), comparé à `10e42815` ; la demande `DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-noms.md` ; les textes `TEXTES-2026-10-22-noms-critere-algorithmique.md`. Cartographié avant le patch : la marque des critères neufs (`codesAnnotation`, `grilles.js` `avecProjectionNeuve`), les versions en ligne depuis le 21 oct., et tout « erreur » / « mots » encore écrit en dur dans `js/`. Vitest ne tourne pas dans le shell Linux du montage (module natif de rollup) : un seul calcul rejoué, par `node` sur `js/evaluation-enonces.js` ; les verts sont ceux que Claude Code rapporte.

## Verdict : accepté, avec trois retouches avant la version

Vérifié :

- **Le modèle.** Trois lectures par paire ; une paire à moitié écrite se lit absente ; `appliquerNoms` n'écrit qu'au geste ; rien au chargement, aucune migration.
- **Une seule règle du pluriel** (`estPluriel`), lue par `{s}`, la ligne du PDF, le miroir, le total d'Annoter et la copie fictive d'un palier.
- **La parenthèse** sans accord partout ; les Nouvelles 1.213 intactes.
- **Sécurité.** Chaque nom passe par `echapperHtml` ou `esc` : l'éditeur, les champs de l'évaluation, la ligne du PDF, le miroir (`rendreMiroirAlgo` échappe tous ses libellés, y compris ceux qui portent maintenant un nom tapé). Le total d'Annoter passe par `textContent`. Schémas fermés à 40 caractères. Aucun handler inline, aucun `console.log`.
- **Les deux repères ajoutés à la palette** : retenu. Sans eux, le composeur montrait un jeton nu : c'est le lot qui n'était pas fini, pas un élargissement.
- **Aucun refus d'enregistrer**, comme pour les sous-critères : retenu.

## Retouche 1 – Le stock de la 1.213 et de la 1.214 change sans geste (corriger maintenant)

La marque `codesSousCriteresSeulement` est posée sur tout critère qui devient algorithmique depuis `a32bdb41`, **en ligne depuis la 1.213.0 (21 oct., 12 h 25)**. Elle veut dire « né depuis le 21 oct. », pas « né depuis les noms ». Le lot la lit comme « neuf » : un critère créé hier ou aujourd'hui dans l'application en ligne, sans noms, change ce que l'élève lit. Mesuré par `node` sur `365b5364` :

- critère sans la marque : « Ta production contient 5 erreurs pour 400 mots. »
- critère marqué, né en 1.213 ou 1.214 : « Ta production contient 5 éléments relevés pour 400 unités. », et `nomsManquants` rend `['erreurs', 'mots']` (l'invitation paraît dans l'éditeur et dans Annoter).

C'est contraire à la décision 1 de Grégoire (« un critère existant se lit « erreur » et « mot » ») et à « tarir n'est pas réparer ». La sentinelle S ne le voit pas : elle ne fabrique que des critères sans la marque. **L'erreur vient de la consigne de Cowork** (§ 2.3 : « Un critère neuf (marque `codesSousCriteresSeulement`) ») ; Claude Code l'a suivie.

Tranché par Cowork : **une marque propre aux noms, posée à la naissance à partir de ce lot.**

- `evaluation-enonces.js` : une clé neuve (par ex. `nomsAttendus: true`) et la fonction qui la pose ; `_estNeuf`, donc `noms`, `nomsManquants` et `estNeuf`, lit cette clé et elle seule.
- `grilles.js`, `avecProjectionNeuve` : posée au même geste et sous la même condition que `codesAnnotation.marquerNeuf`.
- Les deux schémas (import, partage) : la clé, booléenne. Une version qui ne la connaît pas la laisse tomber, et la grille se lit « erreur » et « mot » : la dégradation sûre.
- Sentinelle S : un critère qui porte `codesSousCriteresSeulement` sans la clé neuve ni noms rend les chaînes de `5bd643c3` (sauf la parenthèse), et `nomsManquants` rend `[]`. Break-test : `_estNeuf` qui relit l'ancienne marque doit la rougir.
- Les bancs N, D, E, A, X qui fabriquent un critère « neuf » par `codesSousCriteresSeulement` passent à la clé neuve.
- Rien à écrire dans le stock : les critères marqués d'hier se lisent « erreur » et « mot », ce que l'aide D3 dit déjà.

## Retouche 2 – Trois surfaces que l'élève lit disent encore « erreur » et « mots » (le lot n'est pas fini)

La consigne disait « partout » ; sa liste les omettait. Mesuré par `grep` :

1. `js/evaluation-retroaction.js` l. 1036, le bilan d'un critère effondré : « (Langue : 5 erreurs sur 400 mots, Incomplet) ». ⮕ les deux noms du critère (`algoA0.critere`), par `accorder`. Même structure : aucune question.
2. `js/evaluation-retroaction.js` l. 1109 : « Tous les critères sont maîtrisés. … (3 erreurs annotées). »
3. `js/synthese-retroaction-data.js` l. 903 : la même phrase, dans le PDF de synthèse.

Les sites 2 et 3 portent **un participe qui s'accorde avec le nom** (« annotée(s) »). Le genre d'un nom donné par l'enseignant est inconnu (« 3 calculs faux annotées »). C'est le problème de la parenthèse, réglé à 17 h par une forme qui ne s'accorde pas. **Ce sont des mots que l'élève lit : la question va à Grégoire** (voir plus bas).

Les trois sites passent à la règle unique du pluriel (`> 1` aujourd'hui). Le banc D reçoit la chimie sur ces trois surfaces ; la sentinelle S, les chaînes d'aujourd'hui pour un critère sans noms, sauf ce que Grégoire décidera pour les sites 2 et 3.

## Retouche 3 – Les textes à soumettre

`TEXTES-2026-10-22-noms-critere-algorithmique.md` reçoit les phrases des sites 1 à 3 (§ 1), et le refus « Un nom fait 40 caractères au plus » (`appliquerNoms`), texte de l'enseignant absent de la liste.

## Les points de la demande : dispositions

- **Les deux écarts au stock** (« 5 erreurs sur 0 mot » ; le singulier entre 1 et 2) : acceptés. C'est la règle du 21 oct. (« 0 erreur », « 1 erreur »), étendue aux deux noms par la consigne.
- **`{nomErreurs}` lu par une version antérieure** : refusé, sans suite. Une version nouvelle ne peut pas corriger une ancienne ; le cas ne naît que d'un décompte réécrit à la main, ouvert par une copie de l'application restée en arrière.
- **Les textes de la projection** (étape 3) et **la formule** (étape 4) : inscrits au plan, à leur étape. D'accord.
- **L'amorce `Saisissez les erreurs et le nombre de mots`** : commentée et oubliée. D'accord : texte caché, reconnu par `estAmorceDeSaisie`.

## Pour Grégoire

« (3 erreurs annotées) », sites 2 et 3. Recommandation de Cowork : **retirer le participe** : « (3 erreurs) », « (3 unités manquantes) ». Juste avec tout nom ; la phrase dit déjà de quoi il s'agit. Prix : les critères existants perdent « annotées », comme ils ont perdu « une fois pondérées » à 17 h.

⮕ **Réponse de Grégoire, 22 oct. 2026, 17 h 43 : « oui ».** Le participe part : « (3 erreurs) », « (3 unités manquantes) », pour tous les critères.

## Ensuite

La consigne des trois retouches est dans `CONSIGNE-DU-JOUR.md` (17 h 44). Commit sur `main`, non poussé ; relecture des retouches ; puis les textes soumis à Grégoire, le verdict complet et la version, à son signal.
