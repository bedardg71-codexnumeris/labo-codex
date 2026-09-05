---
serie : Revue des onglets par audit cadré
onglet : Évaluations — le moteur (la chaîne de calcul de la note d'une copie)
destinataire : Fable 5 (accès complet au dépôt)
executant_des_correctifs : Claude Code, un lot à la fois, après arbitrage de Grégoire
type : audit de robustesse et de vérité du calcul
livrable_attendu : rapport de constats, chaque constat portant sa disposition ; AUCUN correctif appliqué
rapport_a_produire : Rapports/AUDIT-moteur-evaluation-2026-09-XX.md (date du jour de l'exécution)
cadre_par : Cowork, 5 septembre 2026, avec Grégoire
statut : exécuté (5 septembre 2026, 15 h, branche audit/moteur-evaluation-2026-09-05, base 7a40949b / 1.120.0)
rapport_produit : Rapports/AUDIT-moteur-evaluation-2026-09-05.md
---

# Audit — le moteur d'évaluation (Labo Codex)

## Pourquoi maintenant

L'onglet Évaluations a été audité le 25 août 2026 (`Rapports/AUDIT-evaluation-onglet-2026-08-25.md`) : enregistrements, PDF, design. **Le calcul de la note n'était pas dans son périmètre**, et son en-tête le dit. Le défaut le plus lourd trouvé depuis (une pondération incomplète qui MONTAIT la note en silence, #674) n'était dans aucun de ses vingt constats : un audit propre ne dit rien de ce qu'il n'a pas regardé.

Le plan du 2 septembre (`plans de travail/PLAN-2026-09-02-evaluation-avant-la-chronique.md`, temps 2 d) prévoyait cet audit. Il n'a pas eu lieu. Entre-temps, du 3 au 5 septembre, la chaîne a reçu les trois types de grille (holistique, analytique, algorithmique), les paliers analytiques, le texte troué en trois étapes, les collections de paramètres et la carte « Bilan » : **la zone jamais inspectée est aussi celle qui a le plus bougé.** Une vingtaine d'enseignants s'en serviront à partir de la mi-septembre ; ce qui sort de cette chaîne s'imprime sur le PDF d'un élève.

## La question directrice, une seule

**Par quels chemins une note ou un niveau peut-il atteindre le stockage, l'écran ou le PDF sans avoir été calculé, ou calculé sur autre chose que ce que l'enseignant a saisi ?**

Tout le reste en découle. Un constat qui ne se rattache pas à cette question est probablement hors périmètre : inscris-le en une ligne et continue.

## Périmètre

Le cœur (lignes comptées le 5 septembre par `wc -l`, à recompter) :

  js/evaluation-calcul.js        1450   calculerNote, calculerPortee, verifierPorteeAvantSauvegarde,
                                        les trois calculs algorithmiques, les points analytiques
  js/evaluation-formules.js       362   les formules du critère algorithmique
  js/evaluation-projection.js     887   la projection à l'EUF et ses paliers
  js/evaluation-enonces.js        643   les énoncés que l'élève lit (texte troué, repères)
  js/evaluation-retroaction.js   1237   la rétroaction engendrée et le bilan

Les portes d'écriture et de lecture qui encadrent le cœur :

  js/evaluation-sauvegarde.js    1013   création, auto-save
  js/evaluation-chargement.js    1763   chargement d'une copie, second chemin d'écriture
  js/evaluation.js               3219   modification d'une évaluation existante, reprise
  js/codes-annotation.js          316   les codes par grille que lit le critère algorithmique
  js/collections-projection.js    149   neuf, 5 septembre
  js/composeur-badges.js          500   neuf, 5 septembre

Élargis si le flux te mène ailleurs (`grilles.js`, `echelles-*.js`, `travaux-annotation.js` pour le décompte des codes), mais dis-le.

## Hors périmètre — décisions explicites

- **L'intérieur de la note finale du cours** (`js/pratiques/`, `calculerDetailsNoteFinale`, indices A-C-P) : autre moteur, 8 236 lignes, couvert par le skill `pratiques-notation` et des golden masters ; il aura son propre audit, avec sa propre question, après celui-ci. **Sa frontière, elle, est dans le périmètre** : c'est le flux H.
- **Le rendu du PDF** (`synthese-retroaction-*`, `travaux-export-pdf.js`) : audité le 25 août. Ce qui est recevable : que le PDF lise la même valeur que l'écran et le stockage.
- **L'interface d'annotation** (dessin, visionneuse, gestes) : seul compte le décompte des codes qui entre dans la formule.
- **La pédagogie.** Ne juge pas si une pondération incomplète devrait bloquer, si « 0 stocké avec sa portée » vaut mieux qu'un état brouillon, si un critère SOLO « Aucun » doit compter dans la note, si l'arrondi doit être au dixième. **Ces choix ont été tranchés avec Grégoire.** Si l'un d'eux te paraît techniquement intenable, dis-le comme un fait technique, jamais comme un avis pédagogique.
- **Les notes d'A2025 et d'H2026 ne se rouvrent pas** (`CLAUDE.md`, zones protégées). Tu ne les sondes pas, tu ne les recomptes pas, tu ne les signales pas.

## Méthode attendue

**Ne procède pas fichier par fichier. Trace les flux**, un par type de grille :

  saisie de l'enseignant (niveau au menu · points « sur N » · codes d'annotation)
    → résolution de la grille, de l'échelle, de la cartouche du trimestre
    → valeur du critère (valeurCalcul, bornes min/max, points → pourcentage → niveau déduit, formule)
    → pondération et portée (calculerPortee)
    → note et niveau de la copie (calculerNote, noteCalculeeCourante)
    → énoncés, projection, bilan (ce que l'élève lira)
    → écriture (les quatre sites qui posent noteFinale) et relecture (rouvrir, modifier, réenregistrer)
    → lecteurs aval : liste, portfolio, profil, dépistage, PDF

Pour chaque étape : que se passe-t-il quand l'entrée n'est pas celle attendue ? Échelle sans `valeurCalcul`, échelle à trous, critère sans identifiant, grille dont le type déclaré diffère de ses critères, points hors bornes, formule sans codes, palier sans phrase, grille importée d'un collègue, trimestre archivé.

**Exécute, ne lis pas seulement.** Les sentinelles du dépôt chargent la vraie fonction en bac à sable (`tests/unit/sentinelle-674-la-note-dit-sur-quoi-elle-porte.test.js`, `sentinelle-lot2-analytique-points.test.js`, `sentinelle-lot3-analytique-niveau.test.js`) : c'est le patron. Un constat sur une valeur calculée porte la valeur obtenue, pas une déduction. Un verdict `[lecture]` reste recevable, mais il se dit.

**Reproduis avant de conclure.** Le 2 septembre, quatre mille sept cents tests verts couvraient deux vrais défauts ; c'est le regard à l'écran qui les a trouvés. Un test vert n'est pas une preuve d'absence.

Lis d'abord, dans cet ordre, et rien d'autre en entier :
  OU-EN-EST-ON.md (§ « L'ÉVALUATION — ce que l'audit du 25 août a déjà réglé »)
  PROTOCOLE.md
  docs/architecture/ECOSYSTEME-DONNEES.md
  docs/DATA-OWNERSHIP.md
  docs/modules/pipeline-annotation-evaluation.md (daté de février : l'écart avec le code est lui-même une donnée)
  plans de travail/PLAN-2026-09-03-les-trois-types-de-grille.md
  plans de travail/CADRAGE-2026-09-04-lot-4-gabarit-algorithmique-et-paliers-analytiques.md

⚠ `SESSION.md` et `BACKLOG.md` pèsent des centaines de milliers d'octets : en-tête, puis `grep`, jamais un `Read` nu.

## Ce qu'il faut vérifier

### A. Les quatre sites d'écriture de la note
`grep -rn "noteFinale:" js/ --include=*.js` rend, le 5 septembre, trois sites qui posent `noteCalculeeCourante` ou `0` (`evaluation.js`, `evaluation-chargement.js`, `evaluation-sauvegarde.js`), un site de reprise qui recopie (`evaluation.js`, `_traiterPostRepriseMod`), et des écritures hors écran d'évaluation (`profil-etudiant-actions.js`, `liste-evaluations.js`, `journal.js`). Pour chacun : d'où vient la valeur, est-elle calculée ou recopiée, la portée (`ponderationCouverte`) voyage-t-elle avec elle, et un `0` peut-il y atterrir par-dessus une vraie note ?

### B. La résolution de l'échelle
`valeurCalcul`, `min`/`max`, milieu de bornes en repli (`evaluation-calcul.js`, environ l. 876 et 1222 le 5 septembre). Une échelle importée d'un collègue, une échelle remplacée le 3 septembre (#648), une échelle dont les niveaux n'ont pas de valeur : chaque cas donne-t-il un niveau, un « -- » nommé, ou un chiffre qui a l'air d'un résultat ?

### C. Les trois types de grille et leurs frontières
Le type déclaré (lot 1) est-il lu par le calcul, ou seulement par l'éditeur ? Une grille « Non précisé » dont les critères sont mixtes calcule-t-elle comme une grille déclarée ? Les points analytiques sans niveau déductible (échelle à trous) : la note compte leurs points mais le critère n'entre pas dans `criteres[]` — **c'est inscrit et assumé par un test** ; mesure ce que les dix-huit lecteurs aval en font, ne rejuge pas la décision.
⚠ **Le moteur est antérieur au chantier des trois types, et il ne lit pas le type déclaré de la grille.** Mesuré le 5 septembre : `typeGrille` n'est lu que par `grilles.js` et `cartouches.js` ; `evaluation-calcul.js` lit `critere.type` à trois endroits (`grep -n "\.type" js/evaluation-calcul.js`), `evaluation-chargement.js` et `evaluation-sauvegarde.js` à une dizaine, chacun avec sa propre comparaison, et **le défaut implicite est holistique** : un critère qui n'est ni `'analytique'` ni `'algorithmique'` calcule comme avant le chantier. C'est le même mécanisme que les critères sans identifiant du 2 septembre — un champ manquant, et le moteur se replie sans le dire. À mesurer sur trois grilles : une grille d'avant le chantier (critères sans type écrit) ; une grille importée d'un collègue ou restaurée d'un partage ; une grille dont le type déclaré et le type de ses critères divergent (« Analytique » déclaré, un critère sans type). Dans chaque cas : l'enseignant a saisi quoi, le moteur a calculé sur quoi, l'écran l'a-t-il dit ?

### D. Le critère algorithmique
Décompte des codes (`codes-annotation.js`, `_parserCodesAlgoCategories`) → formule (`evaluation-formules.js`) → niveau IDME (`_determinerNiveauIDMEAlgo`). Une copie sans annotation, une copie dont les codes ont été fusionnés dans la liste des sous-critères le 5 septembre (lot A), le facteur de normalisation dont le passage de 500 à 600 a été tranché le 3 septembre (livré ou non : mesure-le) : qu'obtient-on ? La formule est-elle recalculée avant la sauvegarde (`_forcerRecalculAlgorithmiqueAvantSauvegarde`) sur tous les chemins ?

### E. La pondération et la portée
#674 est livré : un critère sans niveau retient la note. Vérifie ses angles morts : pondérations dont la somme n'est pas 100 (#483, ouvert), critère SOLO « Aucun », sous-critères, critère supprimé de la grille après des évaluations, grille rééditée après coup. La règle de #674 est-elle la même aux quatre sites, ou existe-t-il un cinquième chemin qui ne la connaît pas ?

### F. Ce que l'élève lit contre ce qui est calculé
Énoncés (texte troué, repères, badges du 4-5 septembre), paliers de projection, carte « Bilan », rétroaction engendrée : les nombres qu'ils affichent (« 24 / 30 », « 79,5 % », moyenne, seuil) sont-ils lus de la même source que la note stockée, ou recalculés à part ? Un badge inconnu, un palier sans phrase, une collection de paramètres appliquée à une autre grille : que rend le texte ? **Ne juge pas les mots ; juge que les chiffres dans les mots sont les bons.**

### G. Rouvrir, modifier, réenregistrer
Le quatrième site (#572) est corrigé depuis 1.111.0. Rejoue le parcours au complet : ouvrir une copie évaluée, ne rien changer, réenregistrer, comparer au centième. Puis changer un seul niveau, puis retirer un niveau, puis changer la grille. Le double emplacement d'`evaluationEnCours` (#646, constat ouvert : un `let` de `config.js` et une propriété `window`) : y a-t-il un chemin où le calcul lit l'un pendant que l'écriture lit l'autre ?

### H. Les lecteurs aval — et la frontière avec la pratique de notation
`grep -rl "\.noteFinale" js/` rend une vingtaine de fichiers. Lesquels lisent `ponderationCouverte` ? Le 2 septembre, portfolio et liste ne la lisaient pas (inscrit, non corrigé). Un `0` stocké avec une portée incomplète est-il traité comme un zéro par le portfolio, le profil, le dépistage, les indices ?
**La frontière qui compte le plus est celle de `js/pratiques/`** (15 fichiers, 8 236 lignes le 5 septembre), le moteur de la note finale du cours. Mesuré : il lit `noteFinale` 53 fois, `productionId` 27, `remplaceeParId` 23, `niveauFinal` 9, `criteres` 5 — et **`ponderationCouverte` zéro fois**. Ce moteur est antérieur à tout ce que l'évaluation écrit depuis le 2 septembre : la portée, les points analytiques, le niveau déduit, le critère SOLO « Aucun ». Pour chacun de ces champs neufs, réponds : la pratique de notation l'ignore-t-elle sans dommage, ou le lit-elle de travers ? Le cas concret à exécuter : une évaluation retenue par #674 (note `0`, portée incomplète) entre-t-elle dans la note du cours comme un zéro ? Sur les quatre familles (SOM, STD, SPE, DEN), pas seulement celle de Grégoire. **Tu t'arrêtes à ce que `pratiques/` LIT ; son calcul interne fera l'objet d'un second audit, avec sa propre question.**

## Ce qui est déjà su — ne le redécouvre pas comme une trouvaille

- #674 livré et clos par Grégoire (1.111.0) ; trois trouvailles nées du lot sont inscrites, non corrigées : portfolio et liste ne lisent pas la portée ; l'export unitaire ignorait la raison de #565 ; un repli mort dans `calculerNote` contredit #527 sans effet en production.
- #572 : quatre sites, tous corrigés ; la sentinelle lit désormais tout `js/`.
- #646 : constat ouvert, raisonné et non mesuré — le mesurer ferme le constat.
- #483 (pondérations ≠ 100 % non bloquantes) et #465 (DEN « configuré ≠ calculé ») sont ouverts au backlog.
- La réparation automatique des grilles créées sans identifiant de critère chez d'autres enseignants **est une décision de Grégoire, à froid** : écrire dans les données de quelqu'un remonte à lui. Tu mesures, tu ne proposes pas de script.
- « Tarir n'est pas réparer » : un défaut de source et un stock déjà écrit chez les gens sont deux constats, pas un.

## Livrable

Un seul fichier, `Rapports/AUDIT-moteur-evaluation-2026-09-XX.md`, avec :

1. **En-tête** : base auditée mesurée par `git rev-parse --short HEAD` et `cat version.json`, état de l'arbre, Vitest re-roulé depuis `tests/` (`npm run test:unit`, compte de fichiers et de tests).
2. **Constats**, par flux et par gravité, chacun avec : fichier et symptôme (le `grep` qui le retrouve, pas seulement un numéro de ligne), verdict `[exécuté]` ou `[lecture]`, ce que l'enseignant ou l'élève verrait, et **la disposition proposée** parmi les trois de `CLAUDE.md` — *corriger maintenant* (seulement si un élève peut lire un chiffre faux), *inscrire et continuer* (le défaut), *commenter et oublier*. C'est Grégoire qui arbitre ; toi, tu proposes et tu motives.
3. **Ce qui fonctionne**, avec la preuve (le test qui le tient, ou la commande).
4. **Ce que tu n'as pas regardé**, nommément. C'est la section qui a manqué le 25 août.
5. **Rien d'appliqué dans `js/`.** Lecture, exécution en bac à sable, branche d'audit si tu écris des tests de reproduction — jamais `main`.

## Fini quand

Chaque flux A à H porte au moins un verdict `[exécuté]` ; chaque constat porte une disposition proposée ; la section « non regardé » existe et n'est pas vide ; et un lecteur qui n'a que ce rapport peut rejouer chaque mesure par sa commande.
