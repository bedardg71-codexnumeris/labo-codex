# Verdict de relecture – l'Aide, lot 1 : couper et ranger (#1152)

> Relu par Cowork (session dans le nuage) le samedi 24 octobre 2026 à 19 h 05 (Toronto, mesuré sur le Mac), sur `main` = `c320a977`. Demande : `DEMANDE-RELECTURE-2026-10-24-aide-lot-1.md`.

## Verdict : accepté

## Ce que Cowork a vérifié lui-même (pas seulement lu)

- **Comparaison indépendante, carte par carte**, `dc39bff2` contre `c320a977` (script qui extrait chaque `accordeon-aide-*` et compare le texte normalisé, commentaires retirés) : 75 entrées avant, 61 après ; exactement les 14 coupes de la consigne ; aucune entrée neuve. Les seules différences dans les 61 gardées sont celles que la consigne demande : les numéros de titre, l'ouverture de `modes-formation`, les quatre retraits du §5, D7, D8, D10. Rien d'autre.
- **Équilibre des balises** des six entrées touchées par un retrait ou un remplacement (`ul`, `li`, `p`, `div`, `strong`) : équilibré partout.
- **Ordre et titres** des huit sous-sections : `aide-commencer` … `aide-reference`, chacune avec son libellé, dans l'ordre du tableau `'aide'` de `config.js`.
- **`js/config.js`** : seul le tableau `'aide'` change, avec un commentaire qui cite l'audit et l'autorisation de Grégoire (18 h 38).
- **`js/accompagnement-contenu-popup.js`** : seuls les deux noms de fichiers d'exemple changent.

## Sur les choix de Claude Code

- La sentinelle qui porte elle-même la décision (les 14 coupes, les 61 places) plutôt que de lire `plans de travail/` : accepté, le cliquet de la CI l'impose et la sentinelle cite l'audit.
- #551 annotée plutôt qu'une fiche neuve pour les bornes RàI : accepté.
- Le faux vert du lot A fermé, avec la dette nommée (deux mentions fausses de « Régénérer », à réécrire au lot 2c) : accepté.
- La phrase de `collaboration` qui propose le courriel pour les `.lcz` (pas pour le codex) laissée : accepté, D8 ne vise que le codex.
- « 5 onglets » et « 5. Rapport d'analyse » laissés dans `bilan-reflexif` : accepté, c'est le lot 2c.

## Ce qui reste ouvert

- **D6** (« Étudiant·e N ») : arrêtée à bon droit (le changement réécrirait les tables de pseudonymes et changerait les numéros). Soumise à Grégoire avec la voie qui n'écrit rien.
- **Le menu principal qui affiche « Accueil » pendant que l'Aide est ouverte, à 1024 px et moins** : antérieur au lot, aucun symptôme vécu. Issue : noté ici, sans fiche.
- **Le commentaire de `sentinelle-603-604`** (et des fixtures de huit autres fichiers de tests, et une ligne de `RELAIS.md`) porte, selon ce commentaire, des noms de famille d'étudiant·es réel·les de l'import du 30 août. **Corrigé le 24 oct. à 19 h 18 : Grégoire n'a pas d'élèves de ces noms ; ils étaient fictifs.** Issue : **corriger maintenant** (règle n° 6 de `CLAUDE.md`, dépôt public ; décision de Grégoire du 22 sept. de retirer les noms réels des fichiers actuels). Consigne : `CONSIGNE-LOT-2026-10-24-noms-reels-tests.md`. L'historique du dépôt est soumis à Grégoire.

## Le geste à vérifier à l'écran

Inchangé : après la prochaine mise en ligne, l'Aide a huit sous-onglets aux noms de l'application ; « Référence » montre le glossaire ; « codex » trouve le Codex sous « Codex et archives ».
