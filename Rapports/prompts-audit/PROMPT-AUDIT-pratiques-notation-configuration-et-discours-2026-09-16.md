---
serie : Revue des onglets par audit cadré
onglet : Conception › Pratiques de notation — la configuration, le discours de l'application, le parcours « how to »
destinataire : Fable 5 (accès complet au dépôt, navigateur WebKit + Chrome de Grégoire pour le flux E)
executant_des_correctifs : Claude Code, un lot à la fois, après arbitrage de Grégoire
type : audit de concordance entre ce que l'utilisateur configure, ce que l'application lui dit, et ce que le moteur fait
livrable_attendu : rapport de constats, chaque constat portant sa disposition ; AUCUN correctif appliqué ; en plus, le tableau « geste → écran → écrit → lu → test » par famille, matériau du labo
rapport_a_produire : Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-XX.md (date du jour de l'exécution)
rapport_produit : Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md (8 mesures au banc tests/unit/audit-pratiques-notation-config-2026-09-16.test.js ; 4 parcours WebKit tests/integration/audit-pratiques-notation-parcours-2026-09-16.spec.js ; STD dans le Chrome de Grégoire ; 8 break-tests) + Rapports/TABLEAU-LABO-pratiques-notation-2026-09-16.md
prerequis : Rapports/AUDIT-pratique-de-notation-2026-09-05.md (fermé, dispositions livrées en 1.122.0) — cet audit-ci ne remesure PAS le calcul ; Rapports/COMPTE-RENDU-documentation-pratiques-notation-2026-09-16.md (l'état de la doc, les contradictions, les fiches ouvertes)
cadre_par : Claude Code, 16 septembre 2026, à la demande de Grégoire (labo « comment ça marche, comment l'utiliser » à préparer) — à valider par Grégoire avant lancement
statut : exécuté le 16 septembre 2026 (Claude Code, branche audit/pratiques-notation-2026-09-16, non poussée — Grégoire arbitre les dispositions)
---

# Audit — les pratiques de notation : ce que l'on configure, ce que l'on lit, ce que l'on obtient

## Pourquoi, et pourquoi maintenant

Le 5 septembre, le calcul de la note a été audité : sur le nombre principal, les quatre familles sont justes, et les trois trous qui pouvaient faire remettre un chiffre faux sont fermés (1.122.0). Ce rapport dit lui-même ce qu'il n'a pas regardé : **aucun navigateur, aucune donnée réelle, ni l'assistant ni le formulaire de configuration, ni les textes de l'Aide**.

Grégoire prépare un labo qui explique aux collègues comment une pratique fonctionne et comment s'en servir. Un tel labo décrit trois choses que le 5 septembre n'a pas mesurées : **le geste** (créer une pratique, l'appliquer à un groupe, la modifier), **la phrase** (ce que l'assistant, le récapitulatif, l'Aide et le Comparateur disent que la pratique fait) et **le résultat vu à l'écran** (profil, export). Un labo qui décrit un geste que l'application trahit (#854 : le formulaire des jetons affiche des valeurs que le moteur n'utilise pas) ou une phrase que le code ne tient pas (le Comparateur dit « Artefacts », l'Aide dit « cibles ») fait mentir Grégoire devant ses collègues. C'est ce qu'on veut savoir avant d'écrire le labo, pas après.

Ce module a aussi une surface de configuration aussi lourde que son moteur — 7 276 lignes pour trois écrivains (`wizard-pratique-v2.js`, `pratiques-gestion.js`, `pratique-notation-v2.js`) contre 8 760 pour quinze fichiers de moteur et un seul lecteur (`construireConfigComplete`). Trois écrivains, un lecteur : c'est la forme de #854, et rien ne dit que les jetons soient le seul champ dans ce cas.

## La question directrice, une seule

**Une personne qui suit le labo pas à pas obtient-elle, pour chaque famille, la note que l'application lui a dit qu'elle obtiendrait — et quand ce n'est pas le cas, est-ce la phrase ou le code qui ment ?**

Trois mots y pèsent. *Pas à pas* : le geste est celui de l'écran, dans un navigateur, pas un appel de fonction. *Lui a dit* : chaque phrase de l'application qui décrit un calcul a une ligne de code en face, ou elle est un constat. *Chaque famille* : SOM, STD, SPE, DEN, sans hiérarchie ; DEN se juge sur le geste de saisie du jugement, pas sur un calcul.

## Périmètre

  js/wizard-pratique-v2.js               3168   l'assistant : ce qu'il écrit (calcul_note, configuration.*), ce qu'il relit (chargerPratiqueExistante)
  js/pratiques-gestion.js                2973   le formulaire de gestion : second écrivain de la même pratique
  js/pratique-notation-v2.js             1135   troisième écrivain (#592 : en partie mort ; mesurer ce qui vit)
  js/pratiques.js                        2397   bibliothèque, duplication, dérivation, application au groupe-cours
  js/pratiques-bibliotheque.js            ~860  ce qui est offert (gabarits + pratiquesConfigurables)
  js/pratiques/pratiques-predefines.js     821  les modèles « Partir d'un modèle » (#690)
  js/pratiques/pratique-configurable.js   1019  construireConfigComplete, valider() — le SEUL lecteur
  js/pratiques/construction-attributs.js   484  les lignes « Construction de la note » du Comparateur (phrases)
  js/pratiques/pratique-registre.js        862  résolution, normalisation, diagnostic
  js/pratiques/modalites-evaluation.js     165  la pratique active d'un groupe-cours (SSOT groupesCours[].pratiqueId)
  js/guides-pedagogiques.js, js/accompagnement-contenu-{popup,terme,hover}.js — l'Aide (1.126.0, 1.127.0)
  js/comparateur-pratiques.js             1161  pour ses phrases seulement

Les écrans où le résultat se lit, pour la concordance seulement : profil (`profil-etudiant-sections-affichage.js`, section Portfolio / Jugement), export des résultats finaux (`export-resultats-finaux.js`), Comparateur (colonne « Construction de la note »).

## Hors périmètre — décisions explicites

- **Le calcul de la note.** Audité le 5 septembre, fermé. Tu prends ses nombres (SOM 87,43 · STD 79,45 · SPE 80 · DEN 78 sous #706) comme acquis. Si un geste de configuration produit un nombre différent de celui que l'écran de configuration annonce, le constat est ici ; si le nombre est faux à configuration donnée, c'est une réouverture du 5 septembre, à signaler à part, pas à mesurer.
- **La doctrine des familles et le chantier #810.** La question didactique est **réglée** (9 sept. : la cible prime, portée par le critère, seuil M ou E) ; ce qui n'est pas livré, c'est le chemin de note qui agrège par critère. Tu **mesures** l'écart entre ce que l'application dit et ce que le code fait aujourd'hui (flux C), avec la décision du 9 sept. comme référence ; tu ne le corriges pas, tu n'ouvres pas le chantier, et tu ne touches pas au libellé du Comparateur (⛔ dans la fiche).
- **L'ergonomie de l'assistant** (refonte #319) et **le banc de décision** (#326-T1, T3, T4, T5, terrain en attente). Tu vérifies ce qu'ils écrivent et disent, pas leur forme.
- **Les indices A et C**, le dépistage, les jetons dans l'évaluation (flux G du 5 sept., #720-#725).
- **Les notes d'A2025 et d'H2026 ne se rouvrent pas.** Trimestre courant, pack démo, données de banc.

## Méthode attendue

**Par famille, un tour complet, dans l'ordre du futur labo :**

  1. partir d'un modèle offert (ou de rien)
    → 2. l'assistant écrit une pratique          [quelle forme, quels champs]
    → 3. l'appliquer à un groupe-cours            [groupesCours[].pratiqueId, ce qui est recalculé]
    → 4. lire ce que l'application en DIT         [récapitulatif, formulaire, Aide, Comparateur, diagnostic]
    → 5. la modifier par le formulaire, puis par l'assistant   [ce qui survit, ce qui est perdu]
    → 6. évaluer deux copies, lire la note        [profil, export]
    → 7. changer de pratique en cours de route    [ce qui reste, ce qui bouge]

**Chaque étape a un verdict** : `[exécuté]` (bac à sable Vitest sur les modules réels, patron du banc du 5 sept., OU navigateur pour le flux E) ; `[lecture]` ; `[grep]`. Pour le flux E, le navigateur est obligatoire : WebKit (Playwright) et, pour au moins un tour complet, le Chrome de Grégoire (mémoire « vérifier un rendu dans le Chrome de Grégoire »). **Ce qui est attendu se dit avant de cliquer**, et il est écrit à côté de ce qui est obtenu.

Lis d'abord, et rien d'autre en entier :
  .claude/skills/pratiques-notation/SKILL.md (§3 les trois niveaux de pratique, §5 le schéma exécutable, §9 le diagnostic, §10 les pièges — tu mesures s'ils tiennent depuis la surface de configuration, pas depuis le moteur)
  Rapports/COMPTE-RENDU-documentation-pratiques-notation-2026-09-16.md (§3 fiches ouvertes, §4 contradictions)
  Rapports/AUDIT-pratique-de-notation-2026-09-05.md — en-tête, table des dispositions, flux A et F
  Rapports/AUDIT-assistant-configuration-2026-06-05.md (verdicts A1-F4 : lesquels tiennent encore ?)
  plans de travail/AUDIT-AIDE-CONFORMITE-2026-09-10.md
  docs/DATA-OWNERSHIP.md, lignes pratiquesConfigurables / modalitesEvaluation / jugementsDenotation

⚠ `SESSION.md`, `BACKLOG.md`, `RELAIS.md` : en-tête, puis `grep`. Jamais un `Read` nu.

## Ce qu'il faut vérifier

### A. Trois écrivains, un lecteur — le tour complet d'une configuration
Pour chaque famille, énumère les champs que l'assistant écrit (`grep -n "pratique\.\|configuration\." js/wizard-pratique-v2.js` autour de `calcul_note`), ceux que le formulaire de gestion écrit, ceux que `pratique-notation-v2.js` écrit encore, et ceux que `construireConfigComplete` lit. Un champ écrit par l'un et non lu par le lecteur est un constat (c'est #854 pour les jetons SPE : y en a-t-il d'autres ? `portfolio.reglesConformite`, `categories`, `notesFinales`, `seuils`, `objectifs`, `echelleId`/`grilleId` DEN, les règles spéciales SOM). Puis le retour : rééditer par l'assistant (`chargerPratiqueExistante`) — quelle réponse n'est pas restaurée et sera réécrite à sa valeur par défaut ? #854 (b) le mesure pour les jetons SPE ; mesure-le pour chaque réponse de chaque famille. Puis par le formulaire : écrit-il sous `.configuration` (la forme lue) ou à plat ?

### B. Ce qui est offert au départ
« Partir d'un modèle » lit `MODELES_PRATIQUES_PREDEFINIS` (skill §3 : schéma descriptif, non exécutable tel quel ; #690). Pour chaque modèle offert en 1.142.15 : une fois choisi et enregistré par l'assistant, la pratique produite passe-t-elle `valider()` et calcule-t-elle sur les quatre élèves de banc ? Quel id porte-t-elle (`pan-objectifs-ponderes` à `pratiques-predefines.js:475` a un préfixe `pan-` que `TABLE_NORMALISATION_PRATIQUE` ne connaît pas — sans effet ou pas ?). Même question pour les deux pratiques du pack démo (`demo-std-litt`, `demo-spe-litt`) : c'est par elles qu'un collègue découvre l'app. La pratique `test` enregistrée par `pratique-test.js` (chargé par `index.html:14408`) est-elle atteignable par un geste d'écran ? (#469 le porte ; mesure, n'inscris pas.)

### C. Ce que l'application DIT contre ce que le code FAIT
Relève **chaque phrase** qui décrit un calcul ou une règle : récapitulatif de l'assistant, bannière de type, lignes de `construction-attributs.js` (Comparateur), cartes de l'Aide (« Les pratiques alternatives de notation (PAN) », « Choisir ta pratique », six paramètres), termes et infobulles, messages de `_diagnostiquerNoteNonCalculable`. Pour chacune, la fonction qui la tient. Les écarts connus, à mesurer et non à trancher : « artefacts » / « cibles » (#810) ; « N meilleurs » quand `methodeSelection` vaut `recents` ou `tous` ; la reprise (« dernier essai » au code, « meilleure tentative » dans la recherche, skill §2 bis — que dit l'Aide ?) ; SPE « seuil d'acceptabilité » (approximation, skill §2 bis) ; DEN « jugement gardé par les cibles » ; le badge famille « PAN » de DEN (approximation assumée). Un écart où **la phrase est plus juste que le code** se note comme tel : il ne se corrige pas en réécrivant la phrase.

### D. Appliquer, changer, retirer
Appliquer une pratique à un groupe-cours (#762, #763) : qu'est-ce qui est recalculé (`indicesCP`), qu'est-ce qui reste (`portfoliosEleves` #816, `jugementsDenotation[pratiqueId]`) ? Changer de pratique en cours de trimestre, STD → SOM puis SOM → STD : les sélections de portfolio survivent-elles, et le profil le dit-il ? Retirer la pratique : le groupe retombe sur quel repli, et lequel des deux (#710) l'écran nomme-t-il ? Un service sans pratique (#839) : recouper, ne pas redémontrer.

### E. Le parcours du labo, dans un navigateur
Le tour complet du § Méthode, **en Playwright WebKit** pour les quatre familles, et **dans le Chrome de Grégoire** pour STD au moins (serveur local, mémoire « vérifier un rendu CSS dans le Chrome de Grégoire »). Attendu écrit avant chaque geste. Mesure aussi ce que les 9 specs Playwright existantes couvrent déjà de ce parcours (`import-pratiques-inter-trimestre-briqueC`, `comparateur-pratiques-rendu`, `pratique-edition-preserve-enveloppe`, `pratiques-762-appliquer-au-cours-actif`, `cadre-763-pratique-appliquee-visible`, `denotation-creation-DEN3`, `denotation-saisie-DEN2`, `pratiques-compatibles-retirees`, `depistage-542-niveau-global-selon-pratique`) : chaque étape du parcours sans spec est une donnée pour « non regardé » et pour le labo (Grégoire vérifiera cette étape lui-même, porte terrain).

### F. La documentation
Une disposition par document du compte-rendu §2.2 : `docs/modules/pratiques.md` (#804 — proposer retrait + renvoi, ou réécriture : dis laquelle et pourquoi), `labo-codex` §5 (14 → 15, ids legacy présentés comme identifiants, « Seuils critiques » retiré par #435), skill `pratiques-notation` (#805 ; §5 ne dit pas que la forme SPE écrite est `forfaits` ; §12 journal à compacter), docs obsolètes à archiver. Tu **proposes**, tu n'écris pas dans `.claude/skills/` ni `docs/` pendant l'audit.

### G. Ce que les tests protègent du tour complet
`sentinelle-522-pratiques-serialisees`, `sentinelle-816-modalites-de-selection-portfolio`, `sentinelle-wizard-denotation-319`, `sentinelle-853-delai-sur-reprise`, `sentinelle-jetons-derivation-L2c`, `pratique-edition-preserve-enveloppe.spec` : pour chacun, quelles étapes du tour (A) il verrouille, et un break-test (muter l'écriture de l'assistant d'un champ, voir si un test rougit). Le champ dont la mutation ne rougit rien est le prochain #854.

## Ce qui est déjà su — ne le redécouvre pas comme une trouvaille

- Fermé le 5 septembre, dispositions livrées : #706, #708, #709. Inscrits, ouverts : #710 à #725.
- Ouverts au backlog, à recouper : #465, #469, #579, #592, #634, #663, #664, #690, #712, #714, #719, #804, #805, #810, #839, #854 ; terrain #326-T1/T3/T4/T5, #343-T5.
- Le compte-rendu du 16 sept. §4 liste six contradictions documentaires : recoupe, n'ajoute que ce qui est neuf.
- « Tarir n'est pas réparer » : une pratique déjà écrite chez un collègue sous une forme que le moteur ne lit pas est un **stock** ; on le mesure (à la manière de `scripts/diagnostic-708-spe-forfaits.js`), on ne propose pas de script qui l'écrit.
- La réparation de données remonte à Grégoire ; les mots que les collègues liront (Aide, récapitulatif) aussi : tu proposes une phrase, tu ne la livres pas.

## Livrable

Un seul fichier, `Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-XX.md`, au format des audits de septembre : en-tête mesuré (`git rev-parse --short HEAD`, `version.json`, Vitest re-roulé depuis `tests/`) ; constats par flux A à G et par gravité, avec le `grep` qui les retrouve, le verdict, l'attendu et l'obtenu, ce que l'enseignant verrait, et la disposition proposée (*corriger maintenant* seulement si un collègue qui suit le labo obtient une note différente de celle annoncée, ou si une pratique déjà appliquée par un testeur est touchée ; *inscrire et continuer* par défaut ; *commenter et oublier*) ; ce qui fonctionne, avec la preuve ; **ce que tu n'as pas regardé**, nommément ; rien d'appliqué dans `js/`, `docs/`, `.claude/`.

**En plus, matériau du labo — c'est le second livrable, pas une annexe** : un tableau par famille, une ligne par geste du parcours (§ Méthode, étapes 1 à 7) : *geste à l'écran · écran/bouton · ce que l'app écrit (clé, champ) · ce que le moteur lit · ce que l'app en dit (phrase) · test qui le couvre · verdict*. Grégoire écrira le labo depuis ce tableau ; chaque ligne sans test devient une porte terrain (skill `portes-terrain`), à lui.

## Ce qui est réglé, et ce qui ne l'est pas — pour ne pas rouvrir la question

**Réglé** (BACKLOG #810, arbitré par Grégoire le 9 sept. 2026 au soir) : la note par standards doit se rapporter aux **cibles d'apprentissage** ; la cible est portée par le **critère**, un seul objet d'apprentissage dont les manifestations changent avec le genre ; seuil = niveau M ou E ; la trace conserve la cartouche qui a servi. Le préalable de vocabulaire est livré (1.127.3 : « Complexité SOLO du critère », « Palier SOLO du niveau »). **Tu ne poses aucune question là-dessus.**

**Pas livré** : le chemin de note qui agrège par critère. Le code construit la note STD sur le portfolio (`nombreARetenir`, `methodeSelection`). Le chantier de fond n'ouvre qu'après la CoP du 14 sept. ; au 16 sept., ni `OU-EN-EST-ON.md` ni `RELAIS.md` n'enregistre ce qui en est sorti, et le tri du 13 sept. le classe « trois modules et plus ».

**Conséquence pour cet audit et pour le labo** : le tableau du labo décrit l'application **telle qu'elle calcule** (portfolio), et chaque phrase de l'application qui dit « cibles » sans que le code le fasse est un constat du flux C, disposition par défaut *inscrire sous #810* (pas une fiche neuve). La ligne du Comparateur « Alignement sur des cibles d'apprentissage ⮕ Non couvert » est la référence de ce que l'application peut dire honnêtement aujourd'hui.

## Fini quand

Les quatre familles ont chacune leur tour complet (étapes 1 à 7) avec un verdict par étape, dont au moins un `[exécuté]` en navigateur ; chaque phrase de l'application qui décrit un calcul a une ligne de code en face ou un constat ; chaque champ écrit par l'assistant ou le formulaire a un lecteur nommé ou un constat ; chaque document du compte-rendu §2.2 porte une disposition ; le tableau du labo existe pour les quatre familles ; la section « non regardé » existe.
