# La relève : structure du canon

> **Écrit le 12 octobre 2026** par Claude Code, en discussion avec Grégoire.
> **Arrêté par Grégoire le même jour** : la carte des lecteurs, les tâches-témoins, la
> pluralité des pratiques comme position du répondant pédagogique, l'ordre de réalisation.
> Ce qui est marqué « décidé par Claude Code » reste corrigeable d'un mot.
>
> **Base mesurée** : les analyses ont été faites sur `304c3b58` (1.198.0). `main` est depuis à
> `bd533702` (1.199.0, lots 8 à 19). Aucun chiffre ci-dessous n'est repris tel quel dans le
> canon : ceux qui y entreront seront régénérés (principe 5).
>
> **Ce fichier est un plan, pas le canon.** Il dit quoi écrire, pour qui, dans quel ordre, et
> ce que chaque document retire. Aucun document du canon n'est encore écrit.

---

## 1. L'objectif

Grégoire a présenté Labo Codex à la régie pédagogique le 8 octobre 2026, et au service
informatique une semaine plus tôt. Le cégep pourrait un jour héberger l'application et en
assurer la survie. Le service informatique n'a pas les moyens d'en assurer la maintenance :
elle passerait vraisemblablement par un tiers, un sous-contractant externe.

**On prépare le pire scénario** : quelqu'un reprend le projet sans Grégoire, sans sa mémoire
du projet, et sans présumer de ses outils. Le sous-contractant utilisera probablement
l'intelligence artificielle ; **on ne le prend pas pour acquis**.

Ce qu'il faut transmettre : le projet, son architecture, sa logique, et sa politique (ses
principes et sa gouvernance).

---

## 2. Le diagnostic, en cinq constats (mesurés le 12 oct. sur `304c3b58`)

1. **Deux portes d'entrée qui ne se croisent pas.** La porte « humaine » (`README` →
   `docs/00-START-HERE` → `01-MEMORY-PINS` → `02-ARCHITECTURE-OVERVIEW`) est figée entre janvier
   et juillet 2026. La porte vivante (`CLAUDE.md` → `OU-EN-EST-ON` → `CONSIGNE-…` → `PROTOCOLE` →
   `RELAIS`) est écrite comme des consignes à des agents et des journaux datés (`RELAIS` 1,08 Mo,
   `BACKLOG` 1,77 Mo, `SESSION` 1,64 Mo).
2. **La porte humaine contient des erreurs vérifiables.** Le README annonce « 97/97 » tests
   (711 fichiers Vitest et 229 specs Playwright) et 158 fichiers JS (208) ; `01-MEMORY-PINS` et
   `docs/modules` décrivent `indices-cp.js`, qui n'existe pas ; `ETAT-PROJET` était resté à 1.65.2
   avant sa §00 du 12 octobre.
3. **Couverture** : 43 des 208 fichiers JS sont décrits dans `docs/modules` ; 45 ne sont cités
   nulle part.
4. **Des savoirs opératoires n'existent que du côté des agents** : la release et ses points de
   vérité, la convention anti-cache (qui bloque pourtant les commits), le verdict Playwright pris
   seulement sur le Mac de Grégoire, les portes terrain, la relecture croisée faite par Cowork.
5. **D'autres sont hors du dépôt** : la configuration Cloudflare, le dossier Cowork. La seule
   procédure de passation (`DEPLOY.md` §6.4) tient en trois lignes et renvoie à un
   `GOVERNANCE.md` qui n'existe pas.

Le test d'arrivée d'un nouveau contributeur du 14 mai 2026 (15/15) ne vaut plus : il a été
passé sur des documents aujourd'hui en partie faux. Il mesurait la compréhension à une date,
pas la durabilité.

---

## 3. Les lecteurs

Trois lecteurs, chacun avec sa porte. La machine n'est pas un lecteur à part : elle lit la
porte du développeur.

### D : le développeur qui ne connaît pas la pédagogie

Un sous-contractant, avec ou sans IA.

- **Il sait** : le web, JavaScript.
- **Il ignore** : IDME, SOLO, les pratiques de notation, le RàI, l'historique du projet, les
  contraintes Safari et iPad, la philosophie des données.
- **Tâches-témoins** :
  1. installer le projet, ouvrir l'application en local, lancer les deux suites de tests ;
  2. trouver dans le code l'écran qu'on lui signale ;
  3. corriger un bogue sans briser un invariant, et lire le test qui rougit ;
  4. ajouter une donnée stockée : clé, propriétaire, rangement par trimestre, migration ;
  5. publier une version, la déployer, revenir en arrière.
- **Ne tranche jamais seul** : le sens d'une note, les mots que les élèves liront, ce qui touche
  les données déjà chez les gens.

### P : le pédagogue qui ne connaît pas le développement

Le répondant pédagogique de l'application. **Il défend la pluralité des pratiques que
l'application accueille, pas un modèle particulier** (décision de Grégoire, 12 oct.).

- **Il sait** : enseigner, évaluer.
- **Il ignore** : le code, et ce qu'un changement fait aux données des utilisateurs.
- **Tâches-témoins** :
  1. expliquer ce que l'application calcule et pourquoi : une note, les indices A-C-P, le
     dépistage ;
  2. trier un retour d'utilisateur : bogue, souhait ou malentendu ;
  3. rédiger une commande au développeur, avec son critère de réussite ;
  4. recetter une livraison sur Mac et sur iPad ;
  5. trancher une question pédagogique à partir des principes du projet.

### C : le cégep, donneur d'ordre

Le service informatique et la direction.

- **Tâches-témoins** :
  1. héberger l'application (des fichiers statiques) et reprendre le domaine et les comptes :
     GitHub, Netlify, Cloudflare ;
  2. connaître la posture de confidentialité et les licences ;
  3. définir le profil et le périmètre d'un contrat de maintenance ;
  4. évaluer le risque de ne rien faire. *(Inférence : l'application continue de fonctionner
     tant qu'elle est hébergée, jusqu'à ce qu'un changement de navigateur la brise.)*

---

## 4. Les principes de construction

1. **Le sommaire découle des tâches-témoins, pas des documents existants.** Les mêmes tâches
   servent de test au lecteur neuf : le canon est fini quand un lecteur neuf les accomplit avec
   lui seul.
2. **Écrire pour le lecteur le plus démuni ; la machine suit.** Rien ne doit exiger Claude pour
   être compris. Une doc pensée pour un humain sans contexte sert aussi un agent ; l'inverse est
   faux.
3. **Le canon n'est pas le journal.** Le canon dit ce qui est vrai maintenant, et pourquoi ; il
   est court, versionné avec le code, et mis à jour dans le même commit que le changement qu'il
   décrit. Tout ce qui est daté est du journal.
4. **Zéro dette appliquée à la doc.** Chaque document du canon nomme ce qu'il remplace, et ce qui
   est remplacé est retiré. Chaque document du canon a une seule source, comme une donnée.
5. **Aucun chiffre écrit à la main dans le canon** : il est généré à partir du code, ou il n'est
   pas écrit.
6. **Le pourquoi d'abord.** Le code dit ce qu'il fait ; il ne dit pas pourquoi. Quatre sortes de
   pourquoi à transmettre : pédagogique, éthique et politique, technique, et les voies
   abandonnées.
7. **Pluralité des pratiques et neutralité disciplinaire.** Le canon décrit ce que l'application
   accueille (familles SOM, STD, SPE, DEN) et ce qu'elle garantit à chacune. Le modèle de Grégoire
   (ELLAC, SOLO, PAN) y figure comme exemple documenté, pas comme norme.

---

## 5. Le sommaire du canon

| # | Document | Pour | Puise dans | Retire |
|---|---|---|---|---|
| 0 | **README** : ce qu'est Labo Codex, les trois portes | tous | README actuel | `docs/00-START-HERE`, `docs/01-MEMORY-PINS` |
| | ***Tronc commun*** | | | |
| 1 | Ce que fait l'application : trimestre → cours → groupe → élèves → productions → évaluations ; les grands parcours | tous | README, skill `labo-codex`, `OBJECTIF-COHORTE-1` | |
| 2 | Principes et politique : données sur le poste, source unique, zéro dette, ne pas réécrire le stock, vocabulaire descriptif, pluralité des pratiques et neutralité disciplinaire, confidentialité, licences | tous | `CLAUDE.md`, ADR, `PRIVACY`, `LICENSE` | |
| 3 | Glossaire pédagogie ↔ code | D, P | skills `ecosysteme-classe`, `pratiques-notation`, `depistage-rai` ; `noms_stables.json` | |
| 4 | Invariants : énoncés vérifiables, chacun lié au test qui le garde | D, P | `OBJECTIF-COHORTE-1`, sentinelles, règles de sécurité de `CLAUDE.md` | |
| 5 | Erreurs raisonnables, côté D et côté P | D, P | entretiens avec Grégoire | |
| 6 | Décisions (ADR) : les 13 existantes, plus celles prises depuis mai | tous | `docs/adr`, `CLAUDE.md`, `PROTOCOLE` | `docs/decisions` (janvier) |
| | ***Porte D*** | | | |
| 7 | Démarrer et tester : poste, hooks, Vitest, Playwright WebKit, lire un test rouge, sentinelles | D | `tests/README`, `docs/securite/HOOKS-PRE-COMMIT`, `docs/securite/TESTS-AUTOMATISES`, skill `verification-adverse` | `tests/README` actuel |
| 8 | Architecture : chargement des scripts, globaux et dispatcher `data-action`, `db.js` et `cle()`, migrations, événements, CSP | D | `02-ARCHITECTURE-OVERVIEW`, `docs/architecture/ECOSYSTEME-DONNEES`, `docs/DATA-OWNERSHIP` (régénéré) | `02-ARCHITECTURE-OVERVIEW`, `js/ordre-chargement.txt` |
| 9 | Carte des modules : groupe fonctionnel → fichiers → écran (générée en partie) | D | `docs/modules`, cartographie du 12 oct. | `docs/modules` périmés |
| 10 | Moteur de notation | D (P en lecture) | skill `pratiques-notation`, `docs/modules/indices-cp.md`, `docs/modules/pratiques.md` | ces deux fichiers |
| 11 | Données chez les utilisateurs : formats qui voyagent (Codex, Archives, Voûte, partage), migrations, rétro-compatibilité | D | `ECOSYSTEME-DONNEES`, `docs/architecture/SPEC-RESERVE-V1`, skill `integrite-globaux` | `docs/operations/migration-checklist` |
| 12 | Livrer et déployer : `scripts/release.mjs`, anti-cache, changelog, Netlify, retour arrière, bibliothèques embarquées | D, C | `DEPLOY`, skill `release-et-changelog`, `docs/CONVENTION-VERSIONNAGE`, `libs/VERSIONS.md` | `NOTES-DE-VERSION` (figé à Beta 99.48) |
| | ***Porte P*** | | | |
| 13 | Les pratiques que l'application accueille, et ce qu'elle garantit à chacune ; le modèle de Grégoire comme exemple | P (D en lecture) | skills `ecosysteme-classe`, `pratiques-notation`, `depistage-rai`, `alignement` ; guides de l'application ; `docs/utilisateur` | |
| 14 | Piloter les changements : commander, exiger la preuve, recetter (Mac, iPad), trier les retours | P, D | `PROTOCOLE`, « ce qui remonte » de `CLAUDE.md`, skill `portes-terrain`, `Retours des testeurs/` | |
| | ***Porte C*** | | | |
| 15 | Exploitation et gouvernance : hébergement, domaine, comptes, coûts, confidentialité, licences, continuité, profil d'un contrat de maintenance | C | `DEPLOY`, `PRIVACY`, `SECURITY`, `INCIDENTS`, `AUDIT`, ADR-008, ADR-009 | `DEPLOY` §6.4 |
| | ***État*** | | | |
| 16 | État et dettes connues : ce qui marche, dettes, décisions ouvertes ; daté, refait à chaque version | tous | `ETAT-PROJET` §00 (source de la complexité, avec ses commandes), `OU-EN-EST-ON`, `BACKLOG`, `DECISIONS-A-PRENDRE-2026-10-11` | `ETAT-PROJET` §0 à §11 (vers les archives) |

### Ce qui reste hors du canon

- **Outils de pilotage vivants**, consultés par quiconque travaille : `BACKLOG`, `SUIVI-BUGS`,
  `OU-EN-EST-ON`.
- **Références détaillées**, citées par le canon sans y être recopiées : `docs/securite`,
  `docs/utilisateur`, `design-system.html`.
- **Archives**, étiquetées comme telles et jamais présentées comme porte d'entrée : `SESSION`,
  `RELAIS`, `plans de travail/`, `Rapports/`, `audit/`, `audit annuel/`.

---

## 6. L'ordre de réalisation (arrêté par Grégoire le 12 oct.)

Le chantier « contrôler la complexité » (`ETAT-PROJET` §00) peut restructurer des modules
(`reserve.js`, `planification-carte.js`…). Une doc d'architecture écrite à la main maintenant
serait à refaire. D'où l'ordre :

- **Phase 1 : ce qui ne dépend pas de la forme du code.** Le tronc commun (1 à 6), la porte P
  (13, 14), la porte C (15), et le squelette du README (0).
- **Phase 2 : ce qui en dépend, généré plutôt qu'écrit.** La porte D (7 à 12) et l'état (16).
  La carte des modules (9), le registre des clés (8) et les chiffres (16) sont produits par
  script, pour suivre la simplification au lieu de la contredire. *(Le placement des documents
  7, 10, 11 et 12 en phase 2 est décidé par Claude Code : ils dépendent moins de la forme du
  code, mais servent le même lecteur.)*
- **Phase 3 : retraits et vérification.** Retrait des documents remplacés ; `CLAUDE.md` et les
  skills deviennent des renvois au canon (**avec l'accord de Grégoire**, puisque ça touche sa
  façon de travailler) ; sentinelles sur la doc ; test du lecteur neuf.

**Ouverture de la phase 1** (approuvée par Grégoire le 12 oct.) : Claude Code rédige 1, 2 et 3
en brouillon à partir des sources existantes, et Grégoire corrige. Les documents 5 (erreurs
raisonnables) et 13 (pratiques) passent par des entretiens courts, un thème à la fois, parce
qu'une partie de leur contenu n'existe que dans la tête de Grégoire.

**Avancement au 12 oct. au soir** : brouillons de 1, 2 et 3 écrits dans `docs/guide/`, avec un
index (`docs/guide/README.md`). Emplacement et nommage fixés : `docs/guide/NN-titre.md`. Le
document 2 pose à Grégoire une question pédagogique de fond (P6 : le socle SOLO, IDME, RàI, A-C-P
est-il assumé ou à rendre configurable ?) et une proposition de gouvernance après l'auteur.

---

## 7. La vérification : une doc qui ne pourrit pas

1. **Génération** : liste des modules à partir d'`index.html`, registre des clés à partir de
   `CLES_NAMESPACEES` et `CLES_GLOBALES` (`js/trimestres.js`), chiffres de complexité par les
   commandes d'`ETAT-PROJET` §00.5.
2. **Sentinelles sur la doc** : tout chemin cité existe ; tout fichier JS est rattaché à la
   carte ; toute version citée est celle de `version.json`.
3. **Tests nommés par l'invariant, pas par la fiche.** Mesuré : 303 des 630 fichiers
   `sentinelle-*` portent un numéro de fiche dans leur nom, et leurs `describe` commencent par
   « #529 Lot 1 · ». Pour D, un test rouge doit dire la règle qu'il vient de briser. On ne
   renommera pas tout : priorité aux tests qui gardent un invariant pédagogique *(inférence)*.
4. **Le lecteur neuf** : un agent limité au canon, peu coûteux et répétable, rejoue les
   tâches-témoins ; un vrai humain une fois, seule preuve réelle. L'audit annuel le prévoit déjà
   (sous-audit 4.3).

**Définition de fini du chantier** : les tâches-témoins des trois lecteurs sont réussies par un
lecteur neuf avec le seul canon ; les sentinelles sur la doc sont vertes ; les documents
remplacés sont retirés.

---

## 8. Préalables et dépendances hors de ce chantier

Tous à la décision de Grégoire ou d'un tiers ; ce chantier ne les tranche pas.

- **#781 : renseignements personnels dans l'historique git.** Purge préparée, en attente de son
  signal. Donner le dépôt à un sous-contractant, c'est lui donner tout l'historique : **la purge
  précède tout accès externe.**
- **Confidentialité institutionnelle.** Avis du responsable PRP non reçu ; ÉFVP non faite
  (`ETAT-PROJET` §00.2, 5.4). *Inférence* : un hébergement par le cégep la rendra probablement
  nécessaire.
- **Questions juridiques**, hors de la compétence de Claude Code, à soumettre au cégep ou à un
  juriste : à qui appartient le code (l'auteur ou l'employeur) ; l'obligation de l'AGPL (quiconque
  héberge une version modifiée doit en offrir le source) alors que le dépôt est privé ;
  l'articulation entre la clause « NC » du contenu pédagogique et une maintenance rémunérée.
- **Le chantier « contrôler la complexité »** : la phase 2 en dépend (voir §6).

---

## 9. Décidé par Claude Code (corrigeable)

- **Le canon vit dans le dépôt, en Markdown**, sans quoi il ne peut pas changer dans le même
  commit que le code. Le cégep et le pédagogue le liront tel quel ou en PDF.
- **Emplacement proposé : `docs/guide/`**, un dossier neuf, pour que la frontière entre le canon et
  l'ancien reste visible pendant la transition. Le nommage des fichiers sera fixé à l'ouverture
  de la phase 1.
- **Aucun fichier existant n'est déplacé ni modifié à cette étape.**

---

## 10. Dispositions des constats

Règle de `CLAUDE.md` : un audit n'est terminé que lorsque chaque constat porte une disposition.

### Confiés à ce chantier par l'audit du 12 oct. (`ETAT-PROJET` §00.6)

| Constat | Disposition |
|---|---|
| `libs/VERSIONS.md` ne recense pas `libheif-bundle.js` | **Absorbé** : document 12, phase 2 |
| Titre de `LICENSE.md` « CC BY-SA » alors que le texte dit NC-SA | **Remonte à Grégoire** : texte de licence, engagement public (catégorie 4 de `CLAUDE.md`). Traité avec le document 2, phase 1 |
| `docs/modules/depistage-et-suivi.md` renvoie à `profil-etudiant.js`, disparu | **Absorbé** : documents 9 et 10, phase 2 ; le fichier sera retiré |
| `docs/DATA-OWNERSHIP` donne encore #328 comme ouvert | **Absorbé** : registre régénéré, document 8, phase 2 |

### Trouvés par cette session

| Constat | Disposition |
|---|---|
| `scripts/hooks/pre-push` (l. 197-204) affirme que « la CI lance Vitest ET Playwright WebKit à CHAQUE push » et affiche « Push laissé passer — la CI le jugera ». Faux depuis le 10 oct. (`fd1338a1`, #1048) : un push de code observable sans verdict local n'est jugé par personne, et le message dit le contraire | **N'entre pas au BACKLOG** (aucun symptôme vécu, règle du 24 août) ; **candidat « assainir »** au sens d'`ETAT-PROJET` §00.6. Il bloquera le document 7 (phase 2), qui devra le trancher pour dire vrai |
| `netlify.toml` publie tout le dépôt (`publish = "."`) : plans, journaux et backlog seraient servis en ligne | **À mesurer** avec le document 15, phase 1. Inférence non vérifiée : aucune requête faite |
| `.claude/commands/creer-nouveau-module.md` propose un gabarit contraire aux règles (`console.log`, modification de `navigation.js`, sans IIFE ni jeton `?v=`) | **Absorbé** : phase 3, avec les renvois des outils Claude au canon |

### Remontés à Grégoire par l'audit du 12 oct.

`PRIVACY.md` « dépôt public », l'Aide qui décrit l'indice R retiré, les contradictions d'`AUDIT.md` :
déjà disposés dans `ETAT-PROJET` §00.6. Pas repris ici.

### Trouvés pendant la rédaction de la phase 1 (12 oct., soir)

Relevés par trois explorations en lecture seule (application, principes, glossaire), vérifiés
au code sur les points cités.

| Constat | Disposition |
|---|---|
| **L'Aide intégrée se contredit et contredit le code** : deux glossaires sur la même page (définitions de A et de C, noms IDME, grille définie par SRPNF, indice de risque, mécanisme de la démo, « retourne 0 ») ; « Mode sombre (par défaut) » ; règle de calcul du palier RàI différente du code (#744) ; guide SOM qui dit la sommative « par défaut » alors que sans pratique il n'y a pas de note (#710) ; FAQ qui renvoie à un export JSON retiré ; info-bulle d'« Exporter et archiver » qui promet un allègement retiré | **Remonte à Grégoire** : textes lus par les utilisateurs. Les écarts principaux sont nommés au document 1, §1.9, et au document 3 |
| **Textes publics démentis** : codex data dit « anonymisé » (`PRIVACY.md`, `README.md`, `INFO-ELEVES.md`) ; « les outils d'IA ne voient que des données fictives » (`INFO-ELEVES.md`) ; « en-têtes durcis via `netlify.toml` » (`SECURITY.md`) ; « code sous CC BY-NC-SA » (`PRIVACY.md`, `INFO-ELEVES.md`) ; registre `INCIDENTS.md` vide alors que sa propre définition couvre les données identifiantes trouvées le 22 sept. | **Remonte à Grégoire** : engagement public (catégorie 4). Tableau au document 2, §2.6 |
| `LICENSE.md` exige une autorisation écrite pour tout usage commercial, ce qui semble contredire l'AGPL | **Question juridique**, ajoutée au document 2, §2.4 et au §8 de ce plan |
| Le socle présenté comme commun (SOLO, IDME, RàI, A-C-P, fenêtre de trois productions, pratique par défaut `standards`) est un choix de l'auteur | **Remonte à Grégoire** : pédagogie (catégorie 1). Question posée au document 2, P6 |
| La privatisation du dépôt (23 juin) n'a aucun motif écrit | **Remonte à Grégoire**, pour l'ADR correspondant (document 6) |
| `docs/architecture/CONVENTIONS-NOMMAGE.md` §5 traduit faussement le domaine (« PAN » = « Plan d'Aide à l'Apprentissage Numérique », SPE « spécifique », DEN « dénombrement », niveau « R pour Réussite ») | **Absorbé** : le glossaire (document 3) fait foi ; retrait ou renvoi en phase 3 |
| Skills périmés : fichiers inexistants, formule d'indice obsolète et affirmation empirique que `ecosysteme-classe` interdit (`labo-codex`) ; indice E encore cité (`depistage-rai`, `securite-donnees`, `alignement`) ; « Réserve » au lieu d'« Archives » ; cartouches dites communes (`integrite-globaux`) ; description du skill `alignement` | **Absorbé** : phase 3, quand les skills deviennent des renvois au canon |
| ADR : renvois croisés faux (002 → 011, 005 et 006 → 001, 009 → un ADR inexistant) ; ADR-011 non réaligné sur « Archives » ; ADR-010 non révisé depuis « décide puis dis-le » ; statuts de l'index différents des fichiers | **Absorbé** : document 6 |
| `noms_stables.json` : numéros de ligne périmés ; la commande `.claude/commands/verifier-noms-stables.md` vérifie des noms absents du registre | **Absorbé** : document 8 (phase 2) et phase 3 |
| `docs/DATA-OWNERSHIP.md` : clés hors registre (`jetonsEtudiants`, `seancesCompletes_gc_*`, `bibliothequeTampons`) ; clés dites par trimestre mais communes de fait (`infoCours`, `jugementsDenotation`) | **Absorbé** : registre régénéré, document 8 (phase 2). Pièges nommés au document 3, §H |
| `docs/utilisateur/README_DONNEES_DEMO.md` et `PACK_DEMARRAGE_README.md` décrivent une démo et un fichier qui n'existent plus ; `POUR-LE-PROJET-CLAUDE.md` définit faussement la cartouche | **Absorbé** : phase 3 (retrait ou correction) |
| Préférence « Ouvrir directement sur le tableau de bord » : la valeur `modeExpert` est écrite mais lue nulle part (case sans effet) | **N'entre pas au BACKLOG** (aucun symptôme vécu) ; **candidat « assainir »** |
| `copierCriteresSRPNF` sans appelant ; `js/pratiques/pratiques-predefines.js` déclaré mort mais exporté | **Candidat « simplifier »** (code mort) |
| Commentaire de `js/evaluation-jetons.js` : « da - Code permanent » (faux) | **Refusé** : sans conséquence observable ; la bonne définition est au document 3 |
