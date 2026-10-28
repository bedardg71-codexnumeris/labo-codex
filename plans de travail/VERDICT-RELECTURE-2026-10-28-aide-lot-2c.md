# Verdict de relecture – L'Aide, lot 2c : l'Évaluation (#1152)

> Cowork, mercredi 28 octobre 2026, 5 h 49 (Toronto, mesuré par `date`), sur `main` = `3888dd55`. Lu : la demande de relecture, le texte visible des six entrées au HEAD, et les affirmations neuves contre le code (les sites ci-dessous). Rejoué sur une copie du dépôt (Linux) : la sentinelle neuve, la sentinelle de la forme, 878, 893 et celle du 15 oct. (77 sur 77) ; deux mutations de Cowork (« 30 jours » → 20 ; « Stylo » → « Crayon ») rougissent la sentinelle neuve (1 et 2 échecs), `index.html` restauré à l'identique. Playwright non rejoué.

## Verdict

**Accepté, avec une retouche.** Les corrections du dossier et de la remesure sont faites, les textes validés (H1 à H4, la ligne de la note remise, les quatre lignes par famille, le paragraphe des remises) sont posés mot pour mot, et la mesure du badge « Évalué » à l'écran tranche bien le point que l'ancienne Aide disait faux. Vérifié au code par Cowork : « Supprimer » d'une rangée passe par « Déplacer à la corbeille ? » (`js/liste-evaluations.js:1788, 1853, 2207`) ; une évaluation non verrouillée n'entre dans aucune note (`js/pratiques/pratique-registre.js:868`) ; « Corbeille (N) » est posé dans la zone des filtres (`js/liste-evaluations.js:2918-2925`) ; les libellés des jetons (`index.html:6060-6130`) et du menu « Intégrité académique » (`8480-8512`) ; « Actions ▾ » et ses trois choix (`js/travaux-ui.js:1184-1189`) ; les dix codes de départ (`js/codes-annotation.js:89`).

## La retouche (Claude Code)

1. **L'ordre : une erreur de la consigne de Cowork.** L'ordre des sous-onglets est celui de `js/config.js:80-83` : « Préparer et importer », « Liste des évaluations », « Annoter et évaluer », « Exporter les travaux ». La consigne l'avait lu dans l'ordre des `div` d'`index.html` (`8192, 8364`), qui n'est pas celui de l'écran. `liste-evaluations` passe en **deuxième**, après `preparer-importer`. La sentinelle neuve, celle de la forme et la spec suivent, en citant ce verdict.
2. **« tous les critères passent à « 0 - Aucun » »** (`irrecevables`, la procédure) : **mesure d'abord**. Les choix d'un critère sont les niveaux de l'échelle (`js/evaluation-chargement.js:1110-1112, 1187`) ; l'Échelle de départ n'a pas de niveau « 0 » (`js/echelles.js:94-140`) ; le code pose `select.value = '0'` (`js/evaluation-sauvegarde.js:610`). Sur une copie évaluée avec l'Échelle de départ, rends non recevable : ce que montrent les critères, la note enregistrée (`noteFinale`), et ce que la copie vaut dans une pratique sommative. Le même message dit aussi « Cette évaluation sera exclue des calculs de moyenne. » (`:624`), ce qui ne s'accorde pas avec « en sommative, elle vaut 0 » : c'est la mesure qui départage.
   - Si la copie vaut 0 : écris ce que l'écran montre, d'après son message (« Les critères sont automatiquement à 0 », `js/evaluation-sauvegarde.js:624`), sans « 0 - Aucun » si ce libellé n'y paraît pas.
   - **Si elle ne vaut pas 0** (exclue de la note, ou autre) : la ligne « en sommative, elle vaut 0 » serait fausse avec l'échelle par défaut. **Arrête-toi et dis-le** : c'est un défaut du calcul, hors de ce lot, qui peut toucher des notes du trimestre en cours ; il remonte à Grégoire.
3. **« Quatre situations sortent une copie du cours ordinaire »** : la copie soupçonnée « s'évalue normalement » (la même carte). Remplace par : « Une copie peut être non remise, non recevable, soupçonnée ou incomplète. »
4. **Le non-remis** : « en sommative, il n'y entre pas ; en standards hybride, […] » se lit comme la liste complète, alors que deux familles sur quatre sont nommées. Écris : « La note dépend de ta pratique ; par exemple, en sommative, il n'y entre pas ; en standards hybride, […] » (décision de Cowork).
5. **Le bloc « Travail INCOMPLET »** : « sans note, hors de la note, sans jeton » se répète. Écris : « La case « Incomplet ; travail en cours » du panneau Paramètres met de côté une copie inachevée, sans note ni jeton : elle n'entre pas dans la note, et compte comme remise dans la complétion (C) jusqu'à ce que tu décoches la case pour évaluer la copie terminée. » (Mots de l'écran : « Sans note ni jeton ; compte comme remis. », `index.html:8506`.)
6. **Les mots de Grégoire** (§ ci-dessous) : validés tels quels ; seule la note de validation s'ajoute aux commentaires.

Le geste à vérifier après la mise en ligne devient : Aide › Évaluation, « La liste des évaluations » vient après « Préparer et importer les travaux » ; chercher « barème » mène au geste des tranches.

## Les autres phrases neuves (décision de Cowork)

Les huit phrases d'`annoter-evaluer`, d'`irrecevables` et de `preparer-importer` disent un comportement mesuré au code, sans choix pédagogique : elles restent, avec les corrections 3 à 5, sauf objection de Grégoire. Le sens d'« Incomplet » (le niveau I et le statut d'une copie) reste ouvert, pour le Suivi.

## Les mots de Grégoire

**Validés par Grégoire le 28 oct. 2026 à 5 h 49** (« on garde »), tels que la demande de relecture les donne, mot pour mot : les trois titres neufs (« La liste des évaluations », « Utiliser les jetons », « Copies non remises, non recevables, soupçonnées ou incomplètes ») et les trois phrases de `liste-evaluations`. Rien à changer dans ces textes ; note la validation dans le commentaire HTML de chaque entrée.

## Trouvailles

- Les deux de la demande : conformes (lot 5 ; « Jeton de reprise ciblée » déjà inscrit).
- L'instable `presences-lot-d-enregistrement` (g) : au tri de Cowork, hors de ce lot.

## Clôture

Un commit pour la retouche, un pour les docs ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.

## Suite de la retouche 2 (Cowork, 28 oct., 6 h 09)

- **Le défaut, confirmé au code par Cowork** : `js/evaluation-sauvegarde.js:606-607` cherche `select[id^="critere"]` sous `#listeCriteresGrille1`, alors que les menus des critères s'appellent `eval_…` (`js/evaluation-chargement.js:421`) : rien n'est mis à 0, et la copie garde sa note calculée (mesure de Claude Code : 87,5, comptée telle quelle dans P en sommative).
- **Une nuance à la lecture de Claude Code** (lu, non éprouvé) : en standards, la note du portfolio écarte déjà une copie non recevable (`js/profil-etudiant-actions.js:211-213`, appelée par `calculerDetailsNoteFinale`, `:474`) ; l'indice P de `pratique-pan-standards.js` ne lit que `evaluationEntreDansLaNote`, qui ne regarde pas l'intégrité (`js/pratiques/pratique-registre.js:863-871`).
- **La règle existe déjà** : décision de Grégoire du 15 oct. 2026, 13 h 47 (`CONSIGNE-LOT-2026-10-15-aide-face-a-l-audit.md:10`) : « Une copie non recevable vaut 0 dans la note, sauf si une reprise la remplace ou si la pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie. » L'Aide dit vrai ; le calcul et le message de l'écran (« Cette évaluation sera exclue des calculs de moyenne. », `js/evaluation-sauvegarde.js:624`) ne la suivent pas. Les deux phrases de l'Aide restent telles quelles.
- **Ce qui reste à Grégoire** : le stock, les copies non recevables déjà verrouillées de l'automne 2026. Question posée le 28 oct. Le correctif du calcul fera l'objet d'une consigne à part (issue 1 : il touche des notes que des étudiant·es ont en main), écrite après sa réponse.
- Le reste de la retouche (`2692fd48`) : à relire par Cowork avec ce correctif.
