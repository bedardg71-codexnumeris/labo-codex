---
serie : Revue des onglets par audit cadré
onglet : Suivi — les six sous-onglets (Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels, Interventions, Animation)
destinataire : Fable 5 (accès complet au dépôt)
executant_des_correctifs : Claude Code, un lot à la fois, après arbitrage de Grégoire
type : audit de vérité de la chaîne de dépistage et de protection de ce qu'elle sait
livrable_attendu : rapport de constats, chaque constat portant sa disposition proposée ; AUCUN correctif appliqué
rapport_a_produire : Rapports/AUDIT-onglet-suivi-2026-09-XX.md (date du jour de l'exécution)
prerequis : Rapports/AUDIT-moteur-evaluation-2026-09-05.md (déposé) et Rapports/AUDIT-pratique-de-notation-2026-09-XX.md (à déposer avant) — l'onglet Suivi lit ce que ces deux moteurs produisent
cadre_par : Cowork, 5 septembre 2026, avec Grégoire
statut : à exécuter, en troisième, après l'audit de la pratique de notation
---

# Audit — l'onglet Suivi (Labo Codex)

## Pourquoi, et pourquoi en troisième

L'onglet Suivi n'a **jamais été pris pour objet par un audit** (mesuré le 5 septembre en parcourant `Rapports/`, `plans de travail/` et `docs/`). Ce qui existe le touche par la bande : une revue automatique de mai a balayé `saisie-presences.js` et rendu six constats sans disposition (`Rapports/ultrareview-lot-6-travaux-saisie.md`, N1 à N6) ; l'audit adverse du 27 août a vérifié le chantier de découplage du dépistage (`AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`, §5.3, §8, §9), un lot de trois jours, pas l'onglet, et son fichier ne porte aucune disposition ; le rapport du 31 août (`RAPPORT-depistage-etat-et-orthopedagogie-2026-08-31.md`) est un état des lieux en lecture, pas une inspection. Les profils individuels, les interventions, le suivi du groupe et l'animation n'ont jamais été parcourus comme chemins.

C'est pourtant l'onglet **qui lit tout ce que les autres produisent** — présences, évaluations, niveaux, notes, indices — et celui que **l'orthopédagogue de la cohorte 1** utilisera à l'automne 2026. Les indices A (assiduité) et C (complétion) y vivent, et ils sont hors périmètre des deux premiers audits : personne ne les regarde. Il passe en troisième parce qu'il consomme ce que les deux moteurs écrivent : un défaut trouvé ici peut venir d'eux, et les deux premiers rapports te diront lesquels sont déjà connus.

## La question directrice, en deux moitiés qui n'en font qu'une

**Ce que l'onglet Suivi dit d'un élève — son assiduité, sa complétion, son niveau, son risque, son palier d'intervention — découle-t-il fidèlement de ce qui a été saisi et évalué, selon des règles que l'enseignant peut voir ; et ce que l'onglet sait de l'élève, le protège-t-il partout où il le fait sortir ?**

La première moitié est la vérité de la chaîne. La seconde est la confidentialité : le volet confidentiel du profil porte des informations sensibles (services adaptés, sous-catégories médicales, notes de présences, portraits qualitatifs — `js/profil-etudiant-confidentiel.js`, en-tête), et le profil s'imprime, s'exporte et se photographie en snapshot.

## Périmètre

Lignes comptées le 5 septembre (`wc -l`), à recompter :

  js/saisie-presences.js               2187   présences, séances, congés, motifs
  js/indices.js                         616   assiduité (A), complétion (C), assemblage A-C-P
  js/etudiants.js                      1602   liste des étudiant·es
  js/trimestre-v2-etudiants.js         1019
  js/profil-etudiant-calculs.js        2185   IPB, patterns, palier RàI, seuils
  js/profil-etudiant-diagnostics.js     896   diagnostic croisé
  js/profil-etudiant-helpers.js        1176   conversions (dont `obtenirNiveauIDMEDepuisPourcentage`, le site de #541)
  js/profil-etudiant-sections-affichage.js 4753   ce que l'écran montre
  js/profil-etudiant-actions.js         772   ce que le profil écrit
  js/profil-etudiant-rapport.js         401   ce qui sort du profil
  js/profil-etudiant-confidentiel.js    325   le volet sensible
  js/interventions.js                  1557   planification, bilan, cible
  js/consolidation.js                   769   matrice de consolidation
  js/graphiques-progression.js         4773   les courbes (Chart.js)
  js/interpretation-config.js                 les seuils 0,85 / 0,75 / 0,64 sans interface de réglage

Frontières, pour la concordance seulement : `snapshots.js` (ce qui part aux archives), `synthese-retroaction-data.js` (le bilan de l'élève sur le PDF lit les mêmes calculs ?), `modes.js` (anonymisation). **Les modules du « Suivi du groupe » et de l'« Animation » ne sont pas identifiés ici** : pars des `data-action` des sections `suivi-groupe` et `suivi-animation` d'`index.html`, et nomme-les dans le rapport.

## Hors périmètre — décisions explicites

- **La pédagogie du dépistage** : les trois paliers, la taxonomie SOLO, ce qu'un IPB mesure, si 0,85 est le bon seuil de maîtrise. Ce sont des positions (skill `depistage-rai`, plan `PLAN-SOLO-echelle-et-depistage.md`), et #551 et #677 disent déjà que ces constantes ne sont pas réglables : **ne rejuge pas les valeurs, mesure ce que le code fait quand l'échelle de l'enseignant ne se convertit pas naturellement en pourcentage.**
- **Les deux moteurs** (la note d'une copie, la note du cours) : audités. Ce qui est recevable : ce que le Suivi LIT d'eux et ce qu'il en fait.
- **La création d'un trimestre, d'un groupe-cours, la prise de présences comme geste** : éprouvés par Grégoire (geste 1). Ce qui est recevable : ce que la saisie produit ensuite dans les indices.
- **Le design** des écrans, sauf quand la mise en page cache ou déforme une information (un chiffre tronqué, une couleur qui dit le contraire du nombre).
- **Les notes d'A2025 et d'H2026 ne se rouvrent pas**, et **tu ne lis aucune donnée réelle** : des élèves de banc seulement. Le volet confidentiel se teste avec des valeurs inventées.

## Méthode attendue

**Trace un élève de banc de bout en bout**, de la saisie à chaque écran qui parle de lui :

  présences saisies (séances, congés, absences motivées, ajout en cours de trimestre)
    → assiduité (A)
  évaluations enregistrées (normale, reprise, brouillon à portée incomplète, zéro #674, verrouillée)
    → complétion (C) · performance (P, lue de la pratique)
    → niveau par critère, IPB, patterns, direction
    → diagnostic croisé, palier RàI, cible d'intervention
    → profil (sections, volet confidentiel, rapport), liste, suivi du groupe, consolidation, graphiques
    → interventions (planification, bilan, clôture)
    → ce qui sort : rapport du profil, snapshot d'archivage, bilan PDF de l'élève

**Quatre élèves de banc** : l'assidu qui progresse ; l'absent qui régresse ; celui qui n'a **aucune** évaluation (que dit le dépistage de quelqu'un dont il ne sait rien ?) ; celui dont les données sont incohérentes (DA absent du groupe, présences dans un autre groupe-cours, évaluation sans production). **Le palier et les indices attendus se calculent à la main avant le code**, et le rapport porte les deux nombres côte à côte.

**Exécute en bac à sable**, patron des sentinelles du dépôt (fonctions réelles chargées dans un faux `window`) ; un verdict `[lecture]` se dit. Reproduis avant de conclure : le 26 août, le dépistage classait tout le monde « Étendu » depuis trois mois (#541) sans qu'aucun test ne le voie — deux unités comparées sans conversion.

Lis d'abord, et rien d'autre en entier :
  .claude/skills/depistage-rai/SKILL.md
  docs/modules/depistage-et-suivi.md (daté d'avril : l'écart avec le code est une donnée)
  Rapports/RAPPORT-depistage-etat-et-orthopedagogie-2026-08-31.md (§3 surtout : les deux définitions de la maîtrise)
  Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md (§5.3, §8, §9)
  Rapports/ultrareview-lot-6-travaux-saisie.md (N1 à N6, à fermer, voir Livrable)
  les flux H des deux premiers audits
  docs/DATA-OWNERSHIP.md · .claude/skills/securite-donnees/SKILL.md (§ données sensibles)

⚠ `SESSION.md` et `BACKLOG.md` : en-tête, puis `grep`. Jamais un `Read` nu.

## Ce qu'il faut vérifier

### A. Présences → assiduité
Remesure les six constats de mai sur la base courante (N1 l'accumulateur écrasé par le repli, N2 les jours à plusieurs séances sous-comptés, N3 la classe d'absence motivée perdue, N4 `etudiants` nul, N5 `modifierNotesPresence` qui ignore `coursId` — fuite entre cours —, N6 le motif de congé non échappé) : tenu, corrigé, périmé. Puis : un élève ajouté au groupe en semaine 6 (son assiduité compte-t-elle les séances d'avant ?), un congé collectif, une séance annulée, une date limite dans le futur, deux groupes-cours le même jour, un trimestre archivé consulté. `calculerEtSauvegarderIndicesAssiduite` écrit : où, sous quelle clé, et qui le relit sans recalculer ?

### B. Complétion et performance — la frontière avec les évaluations
Qu'est-ce qu'une évaluation « remise » pour C ? Une reprise et son originale comptent-elles deux fois ? Un brouillon non verrouillé ? Un `0` à portée incomplète (#674, depuis le 2 septembre) ? Une évaluation dont la production n'a pas de pondération ? P vient de la pratique (`obtenirIndicesCP`, `calculerPerformancePAN`) : le Suivi affiche-t-il le même P que le profil, le portfolio et l'export des résultats, pour le même élève, au même instant ?

### C. Niveau, IPB, patterns, palier — les deux définitions de la maîtrise
Le rapport du 31 août (§3) le nomme : depuis #555, la consolidation lit les repères de maîtrise de l'échelle ; `determinerNiveauRaiPedagogique`, `identifierPatternActuel` (`profil-etudiant-calculs.js`) et `interventions.js` lisent encore `idme.maitrise` 0,85 / `idme.developpement` 0,75 / `idme.insuffisant` 0,64 depuis `interpretation-config.js`, sans interface. **#551 est ouvert ; ne le redémontre pas, mesure ses conséquences** : une échelle à trois niveaux, une échelle dont les valeurs sont 60/75/90, une échelle en points sur 30 (grille analytique, lot 2) — quel palier sortent-elles, et le même sur tous les écrans ? Recense **toutes** les comparaisons pourcentage-contre-fraction dans ces trois fichiers (le motif de #541 : `grep -n "0\.[0-9]\+\|/ *100\|\* *100"`) et dis pour chacune l'unité de chaque côté. Un critère SOLO « Aucun » (lot 4, 4 septembre) : le dépistage ne le surveille pas — vérifie que tous les lecteurs le savent, pas seulement le tableau de bord.

### D. Diagnostic croisé et cible d'intervention
`determinerCibleIntervention` ne reçoit jamais le statut de décrochage (#554, ouvert) ; le « jugement suspendu » n'est plus saisissable (#546, ouvert). Mesure : l'élève sans aucune évaluation, l'élève avec une seule, l'élève dont toutes les évaluations sont des reprises. Quel palier, quelle cible, quel texte ? Un palier 3 attribué faute de données est un constat critique : il enverrait quelqu'un en intervention intensive parce qu'on ne sait rien de lui.

### E. Interventions
Le cycle : planifier, suivre, dresser le bilan, clore. Les clés sont-elles namespacées par trimestre ? Une intervention survit-elle au changement de groupe-cours, au retrait de l'élève du groupe, à la suppression d'une évaluation qui l'avait motivée ? Le formulaire unifié écrit quoi, et par quelle porte (`sauvegarderDonneesSelonMode` ou `db.setSync` direct — la règle des modes) ?

### F. Suivi du groupe et Liste — les agrégats
Les nombres du groupe (moyennes, comptes par palier, alertes) sont-ils la somme des profils, calculés par le même code ? Un élève retiré, un élève de l'autre groupe-cours du même trimestre : contamination ? Le tri et les filtres survivent-ils au rechargement ? Nomme les modules que tu as dû identifier depuis `index.html`.

### G. Ce qui sort — et ce qui ne doit pas sortir
Le rapport du profil (`profil-etudiant-rapport.js`), le snapshot d'archivage (`snapshots.js`), le bilan de l'élève sur le PDF, la matrice de consolidation, l'export Codex : chacun lit-il les mêmes calculs que l'écran ? **Puis la seconde moitié de la question** : le volet confidentiel (services adaptés, sous-catégories médicales, notes de présences, portraits) — sort-il dans l'un de ces flux, dans un `console.*`, dans un snapshot, dans un partage, en mode anonymisation ? Toute interpolation de ces champs dans du HTML passe-t-elle par `echapperHtml` (règle 1, sans exception) ? Le champ confidentiel porte-t-il encore des identifiants disciplinaires (#539, ouvert) ?

### H. Les graphiques
`graphiques-progression.js` fait 4 773 lignes et le backlog dit « graphique lui-même (Chart.js), non auditées ». Les courbes lisent-elles la même source que les nombres du profil ? Une échelle non convertible en pourcentage donne quelle courbe ? Un élève sans donnée : axe vide, zéro, ou courbe inventée ? Cinq mesures suffisent ; ce n'est pas le cœur.

## Ce qui est déjà su — ne le redécouvre pas comme une trouvaille

- Ouverts au backlog : #551 (seuils calibrés sur les bornes de Grégoire), #542 (SOLO et l'échelle), #546, #554, #575 (le reste du codé-en-dur du plan SOLO), #677 (seuil de « force » et couleurs non réglables), #683 (semis par trimestre), #539 (identifiants du volet confidentiel), #474.
- Livrés : #541 (tout le monde « Étendu », 26 août), #555 (consolidation sur les repères de l'échelle, 30 août), #529.
- Les écarts pédagogiques entre le code et la recherche sont nommés dans le skill `depistage-rai` et le rapport du 31 août : hors périmètre.
- Écrire dans les données de quelqu'un remonte à Grégoire ; tu mesures, tu ne proposes pas de script.

## Livrable

Un seul fichier, `Rapports/AUDIT-onglet-suivi-2026-09-XX.md`, au format des deux premiers : en-tête mesuré (`git rev-parse --short HEAD`, `version.json`, Vitest re-roulé depuis `tests/`) ; constats par flux A à H et par gravité, avec le `grep` qui les retrouve, le verdict `[exécuté]` ou `[lecture]`, le nombre attendu et le nombre obtenu, **ce que l'enseignant, l'élève ou l'orthopédagogue verrait**, et la disposition proposée (*corriger maintenant* seulement si un palier ou un indice affiché peut être faux, ou si une donnée sensible sort ; *inscrire et continuer* par défaut ; *commenter et oublier*) ; ce qui fonctionne, avec la preuve ; **ce que tu n'as pas regardé**, nommément ; rien d'appliqué dans `js/`.

**En plus, transcription** : écrire les dispositions manquantes DANS `Rapports/ultrareview-lot-6-travaux-saisie.md` (N1 à N6) et, pour ses constats du §5.3, §8 et §9, DANS `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`, d'après ta remesure.

## Fini quand

Les quatre élèves de banc ont chacun leur palier et leurs indices attendus et obtenus sur chaque écran, écart nommé ; chaque flux A à H porte au moins un verdict `[exécuté]` ; toutes les comparaisons pourcentage-contre-fraction des trois fichiers de calcul sont recensées avec leurs unités ; la sortie du volet confidentiel a été cherchée dans chaque flux de G et le résultat est écrit, même quand il est « rien » ; les deux rapports antérieurs portent leurs dispositions ; la section « non regardé » existe.
