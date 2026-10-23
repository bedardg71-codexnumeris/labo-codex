# Verdict de relecture – #1142 : le compte d'erreurs d'une copie écrit dans l'évaluation d'une autre

> Cowork, vendredi 23 octobre 2026, 9 h 32 (Toronto, mesuré par `date`). Relu : `3ebcd4ae` (non poussé) et `DEMANDE-RELECTURE-2026-10-23-compte-erreurs-autre-copie.md` ; lus dans le code : les copies profondes (`evaluation.js`, `evaluation-sauvegarde.js`, `evaluation-chargement.js`), `compteDeLaPhrase` et `codesDeLaCopie` (`comptes-erreurs-stock.js`), `Codex.estAJour`, l'invariant du banc (l. 183-217). Rien rejoué : les verts sont ceux de Claude Code.

## Verdict : accepté, avec une retouche ; #1143 à régler avant la version

- **La reproduction d'abord**, et le symptôme vécu retrouvé à l'identique (`erreurs` 11, phrase « 1 erreur », note et verrou intacts) : c'est ce qui rend le correctif croyable. La seconde cause (l'objet du pivot rangé tel quel dans la base, puis réécrit en place au-delà de 25 Ki) explique ce que l'hypothèse de Cowork n'expliquait pas : une copie **verrouillée** réécrite. Bien vu.
- **La garde** compare des identités (élève, production, les deux pivots), pas des délais : même famille que #671.
- **La mesure du stock** n'écrit rien (témoin sur `db.setSync`, base identique à l'octet) ; la réparation exige un codex à jour, n'écrit que `donneesAlgorithmiques` des copies proposées, et refuse A2025 et H2026.
- **La règle de proposition** (phrase et codes posés s'accordent, niveau **et** note la redonnent) : retenue. Elle est prudente au bon endroit : un nombre de mots lui-même faussé ferait échouer la relecture de la phrase et l'accord niveau-note, et la copie tomberait « sans proposition » (lu dans `compteDeLaPhrase`, qui relit la phrase avec les mots enregistrés).
- **La sortie de la console** ne porte que des identifiants d'évaluation et des nombres : aucun nom.

## La retouche – l'invariant « aucun objet partagé », pour toute l'évaluation

Le banc ne vérifie que `donneesAlgorithmiques` et `pointsAnalytiques`. Le défaut est d'une classe : tout objet de la base que le pivot tient par référence peut être réécrit en place. Mesuré dans le code : les autres champs posés depuis l'évaluation existante sont des valeurs simples (`evaluation.js` l. 671-676), et `criteres` est reconstruit. Mais un banc qui le garantit vaut mieux qu'une lecture : **l'invariant parcourt tous les objets imbriqués du pivot et de l'évaluation enregistrée** (`criteres`, `optionsAffichage`, `journal`… compris) et rougit si l'un est partagé, à l'ouverture et après le verrouillage. S'il trouve un autre partage, le copier comme les deux autres.

## #1143 – la spec de la palette sur iPad, instable : à régler avant la version

Elle bloquerait le verdict de la version qui porte #1142. Elle mesure « la zone ne saute pas » : avant de toucher au banc, établir si c'est le **banc** (une mesure prise trop tôt) ou **le code** (la compensation du défilement qui manque une fois sur deux, donc un saut réel sous le doigt de Grégoire). Si c'est le code, le corriger dans ce lot ; c'est l'étape 2b qui n'était pas finie.

## Pour Grégoire, d'ici la version

Le défaut reste en ligne : ne pas modifier d'évaluation en passant d'une copie à l'autre dans Annoter. La version sera prise à son signal ; la mesure puis la réparation de ses copies ensuite, sur son accord.

## Ensuite

`CONSIGNE-DU-JOUR.md` (9 h 32) : la retouche et #1143. Puis la relecture, les Nouvelles soumises à Grégoire, la version (étape 2b et #1142) à son signal.
