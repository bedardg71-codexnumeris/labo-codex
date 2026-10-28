# Décisions de Grégoire – Les écarts de la mesure de la construction de la note (28 oct. 2026)

> Tenu par Cowork. Source : `RAPPORT-2026-10-28-construction-de-la-note.md` (§ 8, les écarts E1 à E13), mesure de Claude Code (`958d11ea`, banc `tests/unit/sentinelle-construction-de-la-note-2026-10-28.test.js`). Une décision à la fois, sur la recommandation de Cowork. Ces décisions nourrissent (1) un lot de correctifs, (2) les textes du trou 2 de l'Aide.

## E1 – En sommative, une production à pondération 0 (un artefact)

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 43** (« oui », après une question de clarification) : **une pondération de 0 vaut 0** : la production n'entre pas dans la note sommative. Une production **sans** pondération (champ absent) garde le poids de 1 par défaut.

- Aujourd'hui : `production?.ponderation || 1` (`js/pratiques/pratique-sommative.js:101`, et `:151` pour le récit) lit 0 comme absent (SOM-2, SOM-4 : 85,64 au lieu de 86).
- Correctif : la source se corrige à la lecture (le stock suit sans écriture) ; la FAQ et le glossaire (« seul le portfolio compte ») deviennent vrais en sommative.

## E2 – « Portfolio de progression » (sommative configurable)

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 44** (« oui ») : **retirée** de l'assistant (`js/wizard-pratique-v2.js:~559-567`, la case et son texte) et de l'Aide (`accordeon-aide-pratique`, « À régler : une règle spéciale… »), comme « remplacement » et « plafonnement » en septembre (#903). Une pratique qui la porte déjà garde sa clé (`reglesSpeciales`), tue à l'affichage (`REGLES_RETIREES`, `js/pratiques/construction-attributs.js:~253`), sans écriture. Lui donner un calcul : un chantier de conception, seulement si le besoin se présente.

## E3 – Le nombre retenu en mode « Hybride (N meilleures + Obligatoires) »

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 45** (« oui ») : la réponse de l'assistant « Nombre d'artefacts retenus pour la note finale » (`js/wizard-pratique-v2.js:670-671`) **est le N des meilleures**, auquel s'ajoutent les obligatoires. Elle alimente `categories.selection.nombreARetenir` (aujourd'hui tiré des modalités du trimestre, sinon 4, `:2592-2594`). Une pratique hybride déjà créée garde son nombre actuel, sans réécriture. L'Aide (`pratique`, « À régler ») le dit.

## E4 – La reprise, entre son octroi et sa réévaluation

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 45** (« oui ») : **l'originale continue de compter** jusqu'à ce que la reprise soit réévaluée et verrouillée ; la reprise la remplace alors. Si la pratique est réglée sur « Supprimer » l'originale (`evaluation-jetons.js:643`), rien ne reste à compter : la production reste hors de la note d'ici là, comme aujourd'hui. Vaut pour les trois familles qui calculent (SOM-C7, SPE-C4, STD-C5). Se lit au calcul (`evaluationEntreDansLaNote` et ce qui marque l'originale « remplacée », `remplaceeParId`) : le stock suit sans écriture.

## E7 – Le statut de l'export des résultats finaux (« final » ou « provisoire »)

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 46** (« oui ») : une seule règle, **« provisoire » tant que « Notes finalisées » n'est pas cochée**, pour toutes les familles ; en standards, une terminale qui ne compte pas encore garde aussi « provisoire ». Aujourd'hui : « final » pour toute sommative, spécification ou dénotation (`js/export-resultats-finaux.js:101`), alors que le PDF de la sommative titre « Note provisoire » (`js/synthese-retroaction-data.js:1357`) ; en standards, la case n'y change rien (STD-6). Grégoire cochera la case avant de reporter ses notes dans Léa.

## Les autres écarts (dispositions de Cowork)

- **Textes du trou 2** (Cowork rédige, Grégoire corrige) : E5 (standards : une moyenne de notes en %, pas un niveau), E6 (spécifications : des travaux satisfaisants par type contre des forfaits), E9 (le « Minimum d'artefacts avant calcul formatif » n'est pas un seuil de calcul), E11 (une production facultative évaluée entre dans la note sommative), E13 (l'entier va à Léa ; le profil et le PDF montrent une décimale), et E1, E3, E4 tels que décidés.
- **Commenter dans le code** : E8 (une copie « Non reçu » qui porte une note), E9 (au site du minimum), E10 (`note_max || 55`), E12 (les défauts de l'instance standards que `calculerNoteDuCours` n'atteint pas).
