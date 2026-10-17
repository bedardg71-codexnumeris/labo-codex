# Consigne pour une session Cowork – analyser les douze échantillons de grilles

> Écrite par Cowork (la session du plan de match) le samedi 17 octobre 2026 à 11 h 32 (Toronto), à la demande de Grégoire. Pour une **nouvelle session Cowork**, qui ne sait rien de ce qui précède : tout ce qu'il te faut est ici et dans les fichiers nommés. Tu ne parles ni à Claude Code ni à l'autre session Cowork ; Grégoire est le seul lien.

## Ton mandat

Grégoire a fouillé ses anciennes grilles d'évaluation (littérature et cinéma, de 1995 à aujourd'hui) pour réunir des mises en page variées. Pour **douze échantillons**, il a fait une image de la grille originale et une capture de ce que l'application en a lu. **Analyse-les pour améliorer la reconnaissance des grilles par l'application**, et rends un compte rendu qui servira à un lot de travail. But de fond (cadrage, « Posture arrêtée le 17 octobre ») : l'application accepte la grille de l'enseignant·e **telle quelle**, sans rien inventer, puis lui propose d'aller plus loin. **L'objectif n'est pas de reconnaître la grille de Grégoire, mais n'importe quelle grille** : ne te règle pas sur ses habitudes.

## Les dossiers (connectés à ta session par Grégoire)

- **Les échantillons** : `/Users/kuekatsheu/Documents/Cowork H26 App Labo Codex/Données de grilles`. Paires : `Échantillon N.jpeg` (ou `.jpg`) = l'original ; `Échantillon N.png` (ou `Na.png`, `Nb.png` quand la lecture tient sur deux captures) = ce que l'application a lu. `Échantillon 10` n'a pas d'original en image ; `Échantillon 7 (partiel).png` est partiel. ⚠ Les noms de fichiers sont en Unicode décomposé (NFD) : liste-les par programme plutôt que de taper le nom.
- **Le dépôt** : `/Users/kuekatsheu/Documents/GitHub/labo-codex` (public sur GitHub). **Lecture seule.**

## ⚠ Ce que montrent les captures

Prises de 10 h 32 à 11 h 24 dans le Chrome de Grégoire, elles montrent **la version du lot 1** (écran « Aperçu de ta grille ») : la nouvelle version a été mise en ligne à 11 h 08, mais l'onglet n'avait pas été rechargé (vérifié par Cowork sur les captures de 11 h 22). Or la lecture a beaucoup changé depuis : cases fusionnées dépliées, retours à la ligne gardés, menu de rôle sur chaque rangée et chaque colonne (lot 3a) ; les grilles en points sans niveaux arrivent à l'étape 5, en cours chez Claude Code. **Les captures disent ce que lisait l'ancienne version ; ton travail est de dire ce que lit la version actuelle, et ce qu'il lui manque.**

## Lis d'abord (règle de Grégoire : connaître l'existant avant de proposer)

Dans `plans de travail/` : `CADRAGE-2026-10-15-apporter-mon-materiel.md` (surtout la « Posture arrêtée le 17 octobre »), `PLAN-2026-10-17-pret-pour-lundi.md`, `MESURE-2026-10-17-grilles-en-points.md`, `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3a-roles.md`, `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md`. Dans `js/` : `materiel-lecture.js` (lecture, dépliage, `proposerRoles`, `modeleDepuisRoles`), `materiel-assistant.js` (étapes, manques, création). Le type de critère « analytique » et #941 (une grille entièrement en points se note sans échelle) sont résumés dans la mesure.

## La méthode, pour chaque échantillon

1. **La structure de l'original** : en-têtes (combien de rangées), niveaux (noms, codes, plages, points par niveau), critères (où, sur une ou plusieurs rangées), pondérations ou points (où, sous quelle forme), sous-critères ou listes, regroupements (parties), cases fusionnées, colonnes vides, textes hors du tableau.
2. **Ce que l'ancienne version a lu** (la capture) : ce qui est juste, ce qui est faux.
3. **Ce que lit la version actuelle — mesuré, pas supposé.** Clone le dépôt (`git clone --shared --quiet --branch main "$HOME/mnt/labo-codex" "$HOME/banc-analyse"`, note le SHA ; jamais `git worktree`, jamais `git status` nu dans le dépôt de Grégoire), installe les tests (`cd "$HOME/banc-analyse/tests" && npm install --silent --no-audit --no-fund`), et écris, **hors de tout commit**, un essai Vitest jetable qui construit un tableau HTML **de la même forme avec des textes inventés** et le passe par `lireHtml` → `proposerRoles` → `modeleDepuisRoles` (inspire-toi de l'en-tête de `tests/unit/materiel-lot3a-roles.test.js`). Rapporte le modèle obtenu : critères, niveaux, codes, plages, points, sous-critères, « À classer ». ⚠ Claude Code travaille en même temps sur `main` (étape 5) : mesure sur ton clone, à un SHA nommé.
4. **Le menu de rôle suffit-il ?** Un utilisateur peut-il corriger la lecture à la main, et en combien de gestes ?
5. **Ce qui manque**, et l'amélioration proposée : règle de proposition, rôle neuf, étape, texte d'aide. Dis pour chacune si l'étape 5 (grilles en points) la couvre déjà.
6. **La forme de la grille fictive** à verser aux bancs : la structure seule, textes inventés.

Exemple de ce que tu chercheras (vu par Cowork sur l'échantillon 11) : des niveaux dont l'en-tête porte des **points** (« La plupart 7-8 », « Tous 9-10 »), lus comme des pourcentages ; et un **barème propre à chaque critère** (« Quelquefois 3 », « Fréquemment 4 », « De façon continue 5 » sur une autre rangée). L'échantillon 1 montre des puces de liste (« ↳ ») collées dans le nom du critère.

## Le compte rendu

1. **`Données de grilles/ANALYSE-12-ECHANTILLONS-2026-10-17.md`** (hors du dépôt : tu peux y citer les originaux) : une section par échantillon (les six points ci-dessus), puis la synthèse : les **familles de mises en page**, combien d'échantillons dans chacune ; les améliorations **classées** par effet pour un·e enseignant·e qui essaie sa grille lundi et par coût ; ce que l'étape 5 couvre ; ce qui demande une étape neuve ; les questions qui reviennent à Grégoire (didactique seulement : tout ce qui est technique, tranche-le et dis ce que tu as supposé).
2. **`plans de travail/PROPOSITION-2026-10-17-reconnaissance-des-grilles.md`** (dans le dépôt, **public**) : les améliorations proposées et les grilles fictives, **sans aucun texte des grilles de Grégoire** (structure seulement), sans aucun nom d'élève ni de collègue. C'est une proposition, pas une consigne : la session du plan de match en tirera la consigne d'un lot.
3. **Ton dernier message à Grégoire** : cinq lignes au plus, en gestes d'utilisateur, sans numéro de fiche ; la ou les questions qui lui reviennent, une à la fois.

## Interdits

- Rien dans `js/`, `index.html`, `styles.css`, `tests/` du dépôt ; aucun commit ; aucune commande git qui touche l'index (`git status`, `git add`) : ton montage laisse un `.git/index.lock` impossible à effacer qui bloquerait Claude Code. `git --no-optional-locks log/show/rev-parse` sont sûrs.
- Aucun texte d'une grille de Grégoire dans le dépôt. Aucun nom d'élève ni de collègue nulle part.
- L'horloge de ton montage est en UTC : toute heure écrite se lit par `TZ=America/Toronto date`.
- Efface ton banc à la fin (`rm -rf "$HOME/banc-analyse"`).
