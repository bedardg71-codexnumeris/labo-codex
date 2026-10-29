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

✅ **Décidé par Grégoire le 28 oct. 2026 à 14 h 46** (« oui ») : une seule règle, **« provisoire » tant que « Notes finalisées » n'est pas cochée**, pour toutes les familles ; en standards, une terminale **prévue** qui ne compte pas encore garde aussi « provisoire » (précision de Cowork, 14 h 55 : une pratique sans terminale ne reste pas provisoire pour cette raison). Aujourd'hui : « final » pour toute sommative, spécification ou dénotation (`js/export-resultats-finaux.js:101`), alors que le PDF de la sommative titre « Note provisoire » (`js/synthese-retroaction-data.js:1357`) ; en standards, la case n'y change rien (STD-6). Grégoire cochera la case avant de reporter ses notes dans Léa.

## Les autres écarts (dispositions de Cowork)

- **Textes du trou 2** (Cowork rédige, Grégoire corrige) : E5 (standards : une moyenne de notes en %, pas un niveau), E6 (spécifications : des travaux satisfaisants par type contre des forfaits), E9 (le « Minimum d'artefacts avant calcul formatif » n'est pas un seuil de calcul), E11 (une production facultative évaluée entre dans la note sommative), E13 (l'entier va à Léa ; le profil et le PDF montrent une décimale), et E1, E3, E4 tels que décidés.
- **Commenter dans le code** : E8 (une copie « Non reçu » qui porte une note), E9 (au site du minimum), E10 (`note_max || 55`), E12 (les défauts de l'instance standards que `calculerNoteDuCours` n'atteint pas).


## Chantier de Grégoire (28 oct. 2026, 14 h 54) : des standards sans portfolio ni terminale

Dans ses mots : « Les « artefacts du portfolio » et la « production terminale » sont en fait ma pratique qui semble codée en dur ici. La [PAN] standard peut ne pas avoir de portfolio dans d'autres disciplines que la littérature, par exemple en chimie. » Mesuré : le calcul Standards ne lit que deux types de production, « Artefact d'un portfolio » et « Évaluation terminale » (`obtenirArtefactsIdsPoolStd`, `pratique-registre.js:796` ; `js/productions.js:118-120`). **Urgent, selon Grégoire (28 oct., 14 h 55).** À inscrire au BACKLOG comme chantier de conception, à faire avec Grégoire, de la famille de #1176 (ne pas coder en dur sa pratique). D'ici là, l'Aide dit ce que fait l'application aujourd'hui, sans le présenter comme la nature d'une pratique Standards.

### Le point de départ (décidé par Grégoire le 28 oct. 2026 à 14 h 56, « oui », sur la recommandation de Cowork)

- Le calcul Standards prend **les productions que la pratique désigne, quel que soit leur type**, au lieu des seuls « Artefact d'un portfolio ». **Par défaut** : toutes les productions évaluées, sauf les diagnostiques.
- **L'évaluation terminale devient facultative** : une production désignée terminale garde son poids ; sans elle, la note est celle des productions retenues.
- On bâtit sur un geste existant : la désignation des productions du mode hybride (`production.categorie`, « sélection » / « obligatoire », réglée dans les cases des catégories de la pratique, `js/pratiques-gestion.js` ; lue par `_selectionnerArtefactsHybride`, `js/profil-etudiant-actions.js:225-262`).
- **La pratique de Grégoire ne change pas** : ses artefacts et son évaluation terminale restent désignés comme aujourd'hui (aucune réécriture de ses données ; une pratique existante garde son comportement).
- Exemple de Grégoire : une enseignante de chimie fait des standards avec ses laboratoires et ses examens, sans portfolio.

## E14 – En dénotation, un jugement enregistré sans note (trouvé par Cowork en rédigeant le texte Dénotation, 28 oct.)

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 11** (« oui », sur la recommandation de Cowork) : **un jugement enregistré avec un champ « Note finale » vide donne une note non calculable**, comme quand aucun jugement n'est enregistré ; jamais 0.

- Aujourd'hui (lu, non mesuré au banc) : « Enregistrer le jugement » accepte un champ vide et écrit `noteFinale: null` (`js/pratiques/denotation-jugements.js:121`) ; `_calculerPerformanceDenotation` lit alors 0 (`js/pratiques/pratique-configurable.js:~396`, `: 0`), contre son propre contrat (« pas encore jugé, pas un zéro »). Une enseignante qui coche les cibles en cours de trimestre sans note enverrait 0 à l'export.
- Correctif : se lit au calcul (le stock suit sans écriture). Consigne : `CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md`, à relayer **après** le lot des correctifs E1-E7 (même fichier, `pratique-configurable.js`, modifié en ce moment).
- Le texte Dénotation du trou 2, validé à 15 h 11, reste vrai tel quel (il ne parle pas de ce cas) : il ne change pas.

## Le plan « des standards sans portfolio ni terminale » : les questions de didactique (`PLAN-2026-10-28-standards-sans-portfolio.md`, § 5)

Relu par Cowork le 28 oct. à 15 h 14 : les deux constats porteurs vérifiés dans le code (`productions.js:1857`, la pondération exigée hors « Artefact » ; `pratique-registre.js:796`, le repli sur les seules productions non pondérées). Le lot 1 (le calcul) n'attend aucune décision ; il part après le lot des correctifs E1-E7.

### Q3 – Une évaluation terminale seule

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 15** (« oui », sur la recommandation de Cowork) : un·e étudiant·e dont **seule l'évaluation terminale compte** (aucune autre production retenue qui compte pour lui ou elle) **n'a pas de note calculable**, comme aujourd'hui ; l'application **dit pourquoi** la note manque. Vaut pour toute pratique Standards, celle de Grégoire comprise (lu dans le code : `_calculerNoteFinaleAggregee`, `profil-etudiant-actions.js:~362`, rend `null` quand la moyenne des retenues est `null`). Motif : en standards, la note repose sur plusieurs productions ; une terminale seule est une sommative, et l'application ne le décide pas à la place de l'enseignant·e. Aucune note ne change. Le prix, accepté : l'enseignant·e saisit elle-même la note dans Léa pour cet·te étudiant·e. Pour le lot 1 : CHIM-4 reste « non constructible » ; la cause dite fait partie du lot (« un pool vide dit sa cause »).

### Q1 – Ce que devient « portfolio »

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 16** (« oui », sur la recommandation de Cowork) : **deux vocabulaires, chacun selon la pratique.** Une pratique Standards qui a au moins une production de type « Artefact » garde « portfolio » et « artefact » (celle de Grégoire : ses élèves lisent les mêmes mots) ; une pratique qui n'en a aucune dit « productions » partout (assistant, zone « À vérifier », profil, PDF : « Productions à venir » au lieu d'« Artefacts à venir »). La règle des mots est celle du calcul (l'invariant du plan : dès qu'un « Artefact » existe, le pool d'aujourd'hui). Écarté : un nom général (« productions retenues ») partout. Pour les lots 3 à 5 : `obtenirTermeProduction` suit la présence d'un « Artefact » ; chaque mot neuf du § 4 revient encore à Grégoire, un par tour.

### Q2 – Des artefacts ET d'autres productions

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 17** (« oui », sur la recommandation de Cowork) : **l'invariant reste** : dès qu'une pratique a au moins un « Artefact », seuls les artefacts forment le pool, comme aujourd'hui. Un examen y entre comme évaluation terminale. Motif : aucune note existante ne bouge (stock intact, chez Grégoire comme ailleurs). On ne lève l'invariant que sur un besoin vécu par un utilisateur (règle du BACKLOG du 24 août) ; rien n'est inscrit d'ici là.

### Q6 – Une obligatoire non remise, une fois les notes finalisées

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 17** (« oui », sur la recommandation de Cowork) : **la même règle quel que soit le type de production** : en « Hybride », une production cochée « obligatoire » et non remise est laissée de côté en cours de trimestre, puis vaut 0 une fois « Notes finalisées » cochée (STD-H3), qu'elle soit un artefact, un laboratoire ou un examen. Motif : « obligatoire » est le choix de l'enseignant·e ; une règle par type coderait en dur ce qu'est un laboratoire. Aucune note existante ne change.

### Q4 – « N meilleures » sur un pool qui mêle laboratoires et examens

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 18** (« ok », sur la recommandation de Cowork) : **rien n'est ajouté** : ni avertissement, ni règle propre aux examens. L'enseignant·e pour qui un examen doit toujours compter le coche « obligatoire » en « Hybride » (le geste existe et marche sur des examens, CHIM-3 bis). Motif : un avertissement supposerait qu'un examen doit compter, jugement qui revient à l'enseignant·e. Au plus, une phrase de l'Aide sur le rôle des obligatoires, à soumettre à Grégoire avec les textes du chantier.

### Q5 (E5) – La note Standards et les niveaux

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 19** (« oui », sur la recommandation de Cowork) : **la note Standards reste une moyenne des notes en %** ; la question n'est pas ouverte dans ce chantier. Motif : la moyenne marche pour toute copie (points, niveaux, critère algorithmique) ; un calcul par niveaux écarterait les copies en points, soit imposer une évaluation par niveaux. La pratique de Grégoire garde sa note (ses valeurs ponctuelles I 40, D 65, M 75, E 100 font déjà passer ses niveaux dans la moyenne).

**Les six questions du § 5 sont tranchées.** Restent les mots neufs (§ 4), un par tour, en commençant par ceux du lot 1 (le récit sans terminale ; la cause d'une note qui manque). Déjà tranchés par Q1 : le terme « production » au profil et « Productions à venir » au PDF, pour une pratique sans « Artefact ».

### Mot neuf 1 (lot 1) – La formule du récit Standards

✅ **Validé par Grégoire le 28 oct. 2026 à 15 h 20** (« oui »), proposé par Cowork : une partie absente ne s'écrit pas.
- Avec une évaluation terminale : « portfolio × 60 % + terminale × 40 % » (inchangé) ; sans « Artefact » : « productions retenues × 70 % + terminale × 30 % ».
- Sans évaluation terminale : « moyenne du portfolio » ; sans « Artefact » : « moyenne des productions retenues ».
(`formuleTexte`, `profil-etudiant-actions.js:~647` ; affichée au Comparateur, `comparateur-pratiques.js:990` ; au profil et au PDF selon le plan, non vérifié par Cowork.)

### Mot neuf 2 (lot 1) – La cause d'une note qui manque, en standards

✅ **Validé par Grégoire le 28 oct. 2026 à 20 h 13** (« ok »), proposé par Cowork. Lu à trois endroits : l'encadré « Note finale non calculable » du profil, le rapport de bilan (« Performance : non constructible (…) »), l'export des résultats finaux (« non constructible – … »).
- **Aucune production du pool n'a de note** : « Aucune production retenue pour la note n'est encore évaluée. » Avec un « Artefact » : « Aucun artefact du portfolio n'est encore évalué. »
- **Seule la terminale a une note** (Q3) : « Seule l'évaluation terminale a une note. En standards, la note du cours s'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule. » Avec un « Artefact » : « … s'appuie aussi sur les artefacts du portfolio : … »
- La variante suit la règle de Q1 (la présence d'un « Artefact », l'invariant du calcul) ; elle n'est pas un mot neuf.

**Erratum de Cowork (28 oct., 20 h 15)** : Q3 écrit « Pour le lot 1 : CHIM-4 reste « non constructible » ». C'est faux au sens du plan : CHIM-4 (X2 terminale à 30 %, le reste pondéré, tout évalué) a un pool non vide après le lot 1 et rend 78, comme le plan le prévoit (§ 3, lot 1). Le cas de Q3, un·e étudiant·e dont **seule** la terminale a une note, est un cas neuf de la sentinelle (CHIM-6 dans la consigne du lot 1) ; c'est lui qui reste non constructible. La décision de Grégoire ne change pas.

## E15 – L'indice C pendant la fenêtre de reprise (question 1 de la relecture des correctifs)

✅ **Décidé par Grégoire le 28 oct. 2026 à 15 h 22** (« oui », sur la recommandation de Cowork) : **l'originale qui compte dans la note (E4) compte aussi comme remise** dans l'indice C, jusqu'à ce que la reprise la remplace. Motif : l'étudiant·e a remis ce travail ; même logique que « Incomplet ; travail en cours » (remise pour C, 25 oct.), à distinguer de la copie non recevable (non remise : ce n'est pas le travail de l'élève, 28 oct.). Se lit au calcul (`evaluationCompteCommeRemise`, avec la règle d'E4 du registre) : le stock suit sans écriture. Va à la retouche des correctifs.

## E16 – Le badge de l'originale pendant la fenêtre de reprise (question 2 de la relecture des correctifs)

✅ **Validé par Grégoire le 28 oct. 2026 à 15 h 23** (« oui »), proposé par Cowork : pendant la fenêtre (l'originale compte, E4), l'originale **n'est plus grisée** et porte **« Compte jusqu'à sa reprise »** ; une fois la reprise réévaluée et verrouillée, elle redevient grisée avec « Remplacée » (inchangé). La copie de reprise garde « Jeton de reprise appliqué ». Lu par l'enseignant·e seulement (Liste des évaluations, `liste-evaluations.js:~1497` ; profil, `profil-etudiant-sections-affichage.js:~2717`). Va à la retouche des correctifs.
