---
serie : Revue des onglets par audit cadré
onglet : Évaluations — le moteur de la pratique de notation (la note du cours)
destinataire : Fable 5 (accès complet au dépôt)
executant_des_correctifs : Claude Code, un lot à la fois, après arbitrage de Grégoire
type : audit de vérité du calcul et de concordance
livrable_attendu : rapport de constats, chaque constat portant sa disposition ; AUCUN correctif appliqué
rapport_a_produire : Rapports/AUDIT-pratique-de-notation-2026-09-XX.md (date du jour de l'exécution)
prerequis : Rapports/AUDIT-moteur-evaluation-2026-09-XX.md déposé — ce second audit part de son flux H
cadre_par : Cowork, 5 septembre 2026, avec Grégoire
statut : à exécuter, APRÈS l'audit du moteur d'évaluation
---

# Audit — le moteur de la pratique de notation (Labo Codex)

## Pourquoi, et pourquoi en second

L'audit du moteur d'évaluation (`PROMPT-AUDIT-moteur-evaluation-2026-09-05.md`) s'arrête à ce que `js/pratiques/` LIT d'une évaluation. Celui-ci prend le relais : **ce que le moteur de la pratique FAIT de ces évaluations pour produire la note du cours**, celle que l'enseignant remet et que l'élève voit dans son profil, sur la synthèse PDF et dans l'export des résultats.

Ce moteur (15 fichiers, 8 236 lignes le 5 septembre, plus `indices.js` 616 et `pratiques-bibliotheque.js` 862) est antérieur à tout ce que l'évaluation écrit depuis le 2 septembre. Il a été revu une fois par une passe automatique en mai (`Rapports/ultrareview-lot-3-indices.md`), sans qu'aucune disposition n'ait été écrite dans le fichier ; les jetons qui décident quelle évaluation compte ont eu la même passe (`ultrareview-lot-4a-evaluation.md`, onze constats, aucune disposition). Il porte des golden masters (`tests/unit/golden-master-calcul-sessionC.test.js`, `golden-master-hybride-indiceP-339.test.js`, les récits `sentinelle-recit-calcul-c2*`), dont personne n'a vérifié récemment ce qu'ils protègent encore.

Il passe en second parce qu'il dépend du premier : si l'évaluation écrit faux, la pratique calcule faux sans être en cause. Lis le flux H du premier rapport avant de commencer ; ce qu'il a mesuré à la frontière, tu ne le remesures pas, tu le suis à l'intérieur.

## La question directrice, une seule

**La note du cours reflète-t-elle exactement les évaluations enregistrées, selon la règle de la pratique que l'enseignant a configurée, et le dit-elle quand elle ne peut pas ?**

Trois mots y pèsent. *Exactement* : la même évaluation, lue par deux chemins, donne-t-elle la même note ? *Configurée* : le calcul lit-il ce que l'écran de configuration a écrit, ou autre chose ? *Le dit-elle* : une note non calculable sort-elle comme un vide nommé, ou comme un chiffre ?

## Périmètre

  js/pratiques/pratique-registre.js        788   résolution d'une pratique, normalisation des identifiants
  js/pratiques/pratique-manager.js         324
  js/pratiques/pratique-configurable.js    969   le schéma exécutable des configs
  js/pratiques/pratique-sommative.js       878   SOM — moyenne pondérée
  js/pratiques/pratique-pan-standards.js  1516   STD — portfolio (N retenus) + terminale
  js/pratiques/pratique-pan-specifications.js 794   SPE — bundles tout-ou-rien
  js/pratiques/denotation-jugements.js     139   DEN — jugement saisi, gardé par les cibles
  js/pratiques/denotation-saisie-ui.js     251
  js/pratiques/modalites-evaluation.js     165
  js/pratiques/construction-attributs.js   266
  js/indices.js                            616   l'indice P (A et C : hors périmètre)
  js/profil-etudiant-actions.js                  `calculerDetailsNoteFinale` — le SECOND système de calcul
  js/evaluation-jetons.js                  943   délai, reprise : quelle évaluation compte
  js/impact-jetons.js

Les écrans qui lisent la note du cours, pour la concordance seulement : profil étudiant (`profil-etudiant-sections-affichage.js`), portfolio (`portfolio.js`), synthèse PDF (`synthese-retroaction-data.js`), export des résultats finaux (`export-resultats-finaux.js`), comparateur (`comparateur-pratiques.js`).

## Hors périmètre — décisions explicites

- **La doctrine des quatre familles**, leur pluralisme, la pertinence de l'une ou l'autre : c'est la didactique de Grégoire et des collègues. Le skill `pratiques-notation` §2 bis nomme déjà les écarts entre le code et la recherche : ne les rejuge pas, ne les augmente pas.
- **L'assistant de configuration** (`wizard-pratique-v2.js`, refonte #319) et l'**interface du comparateur** : tu vérifies ce qu'ils écrivent et lisent, pas leur ergonomie.
- **Les indices A (assiduité) et C (complétion)** et le dépistage qui les lit : rapport du 31 août.
- **Le moteur d'évaluation** (ce qui produit `noteFinale` d'une copie) : premier audit.
- **Les notes d'A2025 et d'H2026 ne se rouvrent pas.** Tu ne sondes que le trimestre courant et des données de banc.

## Méthode attendue

**Trace la note du cours d'un élève de banc, par famille**, depuis les évaluations jusqu'à chaque écran qui l'affiche :

  évaluations enregistrées (avec jetons, reprises, zéro à portée incomplète, niveau sans note)
    → pratique résolue (quel id, quel trimestre, quel groupe-cours, archivé ou non)
    → configuration lue (pondérations, N retenus, terminale, cibles, seuils)
    → calcul par famille
    → échelle de la note globale (chiffre → niveau, niveau → chiffre)
    → indice P
    → profil · portfolio · synthèse PDF · export des résultats · comparateur

**Exécute en bac à sable, comme les golden masters le font**, avec quatre élèves de banc, un par famille, et pour chacun un jeu d'évaluations qui contient au moins : une évaluation normale, une reprise avec `remplaceeParId`, une évaluation à `noteFinale = 0` avec `ponderationCouverte` incomplète (ce que #674 écrit depuis le 2 septembre), une évaluation dont un critère est analytique en points, une évaluation verrouillée. **Le nombre attendu se calcule à la main avant de lancer le code**, et il est écrit dans le rapport à côté du nombre obtenu.

Lis d'abord, et rien d'autre en entier :
  .claude/skills/pratiques-notation/SKILL.md (§3, §4, §6, §7 bis, §9, §10 — les pièges y sont déjà nommés ; ton travail est de mesurer s'ils sont toujours vrais)
  Rapports/AUDIT-moteur-evaluation-2026-09-XX.md, flux H
  Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md
  Rapports/ultrareview-lot-3-indices.md et ultrareview-lot-4a-evaluation.md (à fermer, voir Livrable)
  docs/DATA-OWNERSHIP.md

⚠ `SESSION.md` et `BACKLOG.md` : en-tête, puis `grep`. Jamais un `Read` nu.

## Ce qu'il faut vérifier

### A. La résolution de la pratique
Quelle pratique calcule pour cet élève : celle du groupe-cours, celle du trimestre, la « pratique actuelle » de repli (#542) ? Un identifiant legacy (`pan-standards`) résout-il encore partout, ou seulement là où `normaliserIdPratique` passe ? Un trimestre archivé lit-il SES pratiques ou celles du trimestre actif (#482, ouvert, jamais recoupé) ? Une pratique importée d'un collègue (remap `.config` contre `.configuration`, #663, #664) résout-elle ?

### B. Les deux systèmes de calcul — le nœud
Le skill le dit : `calculerDetailsNoteFinale(da)` (dans `profil-etudiant-actions.js`, ne répond que pour STD) et `pratique.calculerPerformance(da)` (chaque `pratique-*.js`) coexistent, et « c'est la source de la plupart des surprises ». Mesure, pour chaque écran de la liste, LEQUEL il appelle ; puis, pour les quatre élèves de banc, si les deux chemins rendent le même nombre. `simulerIndices(da, pratiqueId)` (#307, lecture seule) est-il un troisième chemin ou une façade sur l'un des deux ? Un écart entre deux écrans du même élève est un constat critique, quelle qu'en soit la taille.

### C. Ce que la pratique fait des champs neufs de l'évaluation
Le flux H du premier audit a mesuré ce qu'elle LIT. Ici : ce qu'elle en FAIT. Le `0` à portée incomplète entre-t-il dans la moyenne SOM, dans la sélection des N meilleurs de STD, dans un bundle SPE, dans les cibles DEN ? Une évaluation dont un critère est en points, sans niveau déductible, compte-t-elle comme les autres ? Une évaluation dont le critère SOLO est « Aucun » ? La réponse « la pratique ignore le champ » n'est un constat bénin que si tu montres que le résultat est le bon quand même.

### D. Par famille, la règle configurée contre la règle calculée
- **SOM** : pondérations dont la somme n'est pas 100 (#483, ouvert : confirmation non bloquante) ; évaluations orphelines d'une production sans pondération (le « poids 1 » du même item) ; production évaluée deux fois.
- **STD** : `nombreARetenir` supérieur au nombre d'évaluations ; terminale absente ; égalité de notes à la coupure ; reprise qui remplace une évaluation déjà retenue.
- **SPE** : bundle dont une pièce manque ; palier atteint puis perdu par une reprise plus faible.
- **DEN** : aucun jugement saisi doit rendre `null`, pas `0` ni la moyenne (#465, ouvert : « configuré ≠ calculé ») ; cibles dont les identifiants ont changé.
Pour chaque cas : le nombre à la main, le nombre obtenu, et ce que l'écran affiche.

### E. L'échelle de la note globale
Le skill §7 bis nomme deux conversions inverses et deux champs obligatoires ; #590 (ouvert) nomme trois résolveurs d'échelle qui ne reconnaissent pas les mêmes identifiants ; #577 et #579 (ouverts) disent que les repères de maîtrise ne sont pas lus partout. Mesure : une note globale de 79,46 rend quel niveau, par quel résolveur, sur chaque écran ? Une échelle remplacée le 3 septembre (#648) est-elle suivie par la note du cours ?

### F. Non calculable
Le skill §9 décrit le diagnostic. Pour chaque famille : quand la note du cours ne peut pas être calculée (aucune évaluation, pratique non résolue, échelle absente, DEN sans jugement), qu'écrit chaque écran — `null`, `0`, `--`, vide, ou un chiffre qui a l'air d'un résultat ? L'export des résultats finaux et la synthèse PDF, en particulier : c'est ce qui sort de l'application.

### G. Les jetons décident quelle évaluation compte
Délai, reprise, `remplaceeParId` (lu 23 fois par `pratiques/`), `archivee`. Les onze constats de `ultrareview-lot-4a-evaluation.md` (1er mai) portent tous sur `evaluation-jetons.js` et n'ont jamais reçu de disposition ; #617 (ouvert) en ajoute un. Remesure chacun sur la base courante : tenu, corrigé depuis, ou périmé. Puis le cas qui compte pour la note du cours : une reprise retirée (`retirerJetonReprise`) laisse-t-elle l'originale « remplacée » et donc absente du calcul ?

### H. Ce que les golden masters protègent encore
`golden-master-calcul-sessionC`, `golden-master-hybride-indiceP-339`, `sentinelle-recit-calcul-c2a` à `c2d0`. Pour chacun : quelles familles, quels cas, et un break-test (muter le calcul d'un point, voir si le test rougit). Ce qu'ils ne couvrent pas est une donnée pour la section « non regardé ».

## Ce qui est déjà su — ne le redécouvre pas comme une trouvaille

- Ouverts au backlog, à recouper et non à redémontrer : #465, #482, #483, #577, #579, #590, #592, #617, #634, #663, #664, #690.
- `pratiques-predefines.js` est un fichier sans lecteur vivant (mesuré le 2 septembre, OU-EN-EST-ON.md) ; #690 le porte.
- Le premier audit a mesuré la frontière (flux H) : repars de ses nombres.
- La réparation de données chez d'autres enseignants remonte à Grégoire ; tu mesures, tu ne proposes pas de script.
- « Tarir n'est pas réparer » : un défaut de source et un stock déjà écrit sont deux constats.

## Livrable

Un seul fichier, `Rapports/AUDIT-pratique-de-notation-2026-09-XX.md`, au même format que le premier : en-tête mesuré (`git rev-parse --short HEAD`, `version.json`, Vitest re-roulé depuis `tests/`) ; constats par flux et par gravité, avec le `grep` qui les retrouve, le verdict `[exécuté]` ou `[lecture]`, le nombre attendu et le nombre obtenu, ce que l'enseignant ou l'élève verrait, et la disposition proposée (*corriger maintenant* seulement si une note remise peut être fausse ; *inscrire et continuer* par défaut ; *commenter et oublier*) ; ce qui fonctionne, avec la preuve ; **ce que tu n'as pas regardé**, nommément ; rien d'appliqué dans `js/`.

**En plus, et c'est de la transcription** : écrire les dispositions manquantes DANS `ultrareview-lot-3-indices.md` et `ultrareview-lot-4a-evaluation.md`, constat par constat (*inscrit* n°, *refusé* motif, *périmé*), d'après ta remesure du flux G et de l'indice P. Deux des « 22 rapports sans suite » du 1er septembre se ferment ainsi.

## Fini quand

Les quatre élèves de banc ont chacun leur nombre à la main et leur nombre obtenu sur chaque écran, avec l'écart nommé ; chaque flux A à H porte au moins un verdict `[exécuté]` ; chaque constat porte une disposition proposée ; les deux ultrareviews portent leurs dispositions ; la section « non regardé » existe.
