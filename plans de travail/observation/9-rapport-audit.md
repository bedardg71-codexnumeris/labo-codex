# Rapport d'audit : observer ce que fait réellement l'application

*Labo Codex 1.199.0. Audit mené du 12 au 15 octobre 2026. Rapport rédigé le 15 octobre 2026 par Claude Code, à partir des documents de l'audit et des commits du dépôt ; Grégoire en est le commanditaire et l'interprète.*

## 1. En bref

- **But** : décrire ce que l'application fait réellement, indépendamment de ce que Grégoire voulait qu'elle fasse, en se protégeant du biais de confirmation (cadrage du 12 octobre).
- **Méthode** : les intentions sont scellées avant toute observation ; une session isolée observe une copie de l'application sans commentaires ni documentation ; une troisième met les deux textes côte à côte. Deux lectures indépendantes en déduisent la finalité ; Grégoire réagit à chaud, avant de voir la suite ; une vérification croisée isole les conclusions solides ; Grégoire les confronte à ses intentions.
- **Résultat principal** : les deux lectures décrivent un poste de travail enseignant, local et fermé, qui convertit des saisies par élève en notes, rétroactions et indices de besoin, et qui conserve plus qu'il ne fait circuler. Grégoire reconnaît les deux formulations et les onze autres finalités proposées. Sur les 122 conclusions solides, il en classe **103 « voulu et fait »**, **11 « fait sans être voulu »** (toutes des bugs) et **aucune « voulu mais invisible »** ; 8 décrivent ce que l'observation ne permet pas de savoir.
- **Suites** : 32 fiches créées au BACKLOG : #1055 à #1067 au temps 3, #1068 à #1074 à l'interprétation, #1075 à #1086 à la confrontation des « prévu mais pas fait ». S'y ajoute #1054, qui existait déjà et a été élargie. L'interprétation a aussi réutilisé six de ces fiches : #1054, #1057, #1060, #1061, #1064 et #1065.
- **Ce qui reste ouvert** : voir §8. L'audit n'est pas fermé au sens de CLAUDE.md tant que ces points n'ont pas reçu leur disposition.

## 2. Principe

Le cadrage reprend un principe de Stafford Beer : la finalité d'un système, c'est ce qu'il fait. Le danger visé est le biais de confirmation, c'est-à-dire voir dans le résultat ce qu'on souhaite y voir. La réponse retenue est celle du pré-enregistrement : fixer ce qu'on attend avant de regarder, et confier l'observation à quelqu'un qui ne connaît pas l'attente.

## 3. Déroulement

| Étape | Ce qui a été fait | Document | Commit (dépôt principal) | Date |
|---|---|---|---|---|
| Cadrage | Trois temps, limites assumées | `CADRAGE-2026-10-12-observer-ce-que-fait-l-application.md` | `b709f2aa` | 12 oct. |
| Temps 2, préparation | Copie aveugle : commentaires retirés par analyseurs syntaxiques, changelog vidé, données réelles vérifiées, 33 essais Playwright identiques sur l'original et la copie ; recette d'isolement | `0-preparation.md` | `b4beeeb3` | 12 oct. |
| Temps 1 | Intentions rédigées d'après les documents, corrigées par Grégoire partie par partie, puis scellées | `1-intentions-scellees.md` | `9ce4970a` à `47fbbc71` | 12-13 oct. |
| Temps 2 | Observation à l'aveugle (12 modules, données fictives, Chromium), par une session isolée (compte séparé : inféré, §4) | `2-observation-aveugle.md` | `95f857e0` (copie de `eac065e`, dépôt `programme-a-observer`) | 13-14 oct. |
| Temps 3 | Comparaison sans interprétation : 2 000 unités, 1 673 entrées d'écart | `3-ecarts.md` | `9caefeb4` | 14 oct. |
| Temps 3, suites | Tri des 199 « fait autrement » ; 13 fiches inscrites | `4-dispositions.md` | `8cea5da9` | 14 oct. |
| Temps 4, préparation | Version de l'observation établie, nettoyage (aucun retrait), paquet de lecture | `4-preparation-lecture.md` | `0ea697af` | 14 oct. |
| Temps 4 | Deux lectures indépendantes de la finalité (deux modèles demandés) | `5-finalite-A.md`, `5-finalite-B.md` | `ece19ca9` | 14 oct. |
| Interprétation, méthode | Six étapes adoptées par Grégoire | `6-parcours-interpretation.md` | `6c5450fb` | 14 oct. |
| Étape 1 | Réaction de Grégoire en entrevue, scellée avant toute suite | `6-reaction-scellee.md` | `29c802ca` | 14 oct. |
| Étapes 2 et 3 | Convergence et appuis (session C) ; contrepoids (session D) | `7-convergence.md`, `7-contrepoids.md` | `3d896612` | 14 oct. |
| Étapes 5 et 6 | Confrontation avec les intentions et dispositions, en entrevue | `8-interpretation.md` | `3c8bfb2e`, corrigé ensuite | 15 oct. |
| Synthèse | Ce rapport ; la description consolidée | `9-rapport-audit.md`, `10-description-application.md` | `a393b30e` | 15 oct. |
| Temps 3, catégorie 2 | Les 710 « prévu mais pas fait » triés au code par dix sous-agents, contre-vérifiés à l'aveugle ; entrevue, puis tri de Claude Code approuvé ; 12 fiches inscrites | `11-confrontation-prevu-pas-fait.md` | `878627cb`, puis le commit des dispositions | 15 oct. |

*Le fichier `4-dispositions.md` porte « temps 4 » dans son titre, mais il traite les suites du temps 3 ; le temps 4 proprement dit commence avec `4-preparation-lecture.md`.*

## 4. Garde-fous, et ce qu'ils ont vérifié

- **Scellement.** Les intentions (temps 1) et la réaction de Grégoire (étape 1) ont été commitées avant toute lecture de ce qui pouvait les influencer ; ni l'une ni l'autre n'a été modifiée ensuite.
- **Copie aveugle.** 32 109 commentaires JS, 924 commentaires HTML, 1 918 commentaires CSS et 198 commentaires HTML logés dans des chaînes ont été retirés par des analyseurs syntaxiques. Le résultat a été vérifié par deux scripts et par une recherche brute. Les noms, les textes d'écran et les messages console restent visibles (limite assumée).
- **Isolement.** Mesuré le 12 octobre : sur le compte de Grégoire, une session peut lire la liste des autres sessions et leurs transcriptions. La recette retenue : un compte claude.ai séparé et un réglage du dépôt aveugle qui refuse la recherche web et les outils de session. Constat indirect : la session d'observation du temps 2 est introuvable depuis le compte de Grégoire. L'isolement n'est donc pas prouvé, mais il est cohérent avec la recette ; les autres sessions isolées (A, B, C, D) n'ont pas été recherchées.
- **Indépendance des lectures.** A, B, C et D sont quatre sessions distinctes. A et B sont parties du même commit, C et D aussi, et chacune n'a ajouté que son propre fichier. La consigne demandait deux modèles différents pour A et B ; je ne peux pas le vérifier depuis le dépôt. Chaque copie dans le dépôt principal a été vérifiée identique à son original (empreintes git).
- **Neutralité des entrevues.** Questions fixes, réponses recopiées telles quelles, précisions de l'intervieweur notées entre crochets. Quatre tensions avec la réaction scellée ont été signalées à Grégoire, comme ses préférences le demandent ; il en a reclassé deux et maintenu deux.

## 5. Résultats

### 5.1 Temps 3 : les écarts entre l'intention et l'observation

Sur 2 000 unités de l'intention, 775 concordent ; les 1 225 autres donnent 1 673 entrées d'écart, réparties ainsi :
- 351 « fait sans être prévu » ;
- 710 « prévu mais pas fait », dont 690 sans aucune mention dans l'observation ;
- 199 « fait autrement » ;
- 413 « non comparable ».

Le tri des 199 « fait autrement » a été vérifié au code : 24 confirmés, 4 non confirmés, 1 résolu. Il a donné 13 fiches (#1055 à #1067), dont une de priorité haute (#1055, la case « diagnostique » qui se reporte), et 8 écarts notés sans fiche.

### 5.2 Temps 4 : la finalité

- **A** : « Labo Codex fait du poste de l'enseignant·e le lieu, seul et fermé, où ce que l'enseignant·e saisit sur chaque étudiant·e […] se convertit sans cesse en notes et rétroactions à rendre et en indices qui classent chaque étudiant·e selon un besoin d'intervention. Ce dossier est conservé et protégé bien plus qu'il n'est mis en circulation. »
- **B** : « Le programme sert à une personne enseignante, seule, à tenir étudiant·e par étudiant·e un dossier de présences, de notes et de rétroactions, et à en dériver automatiquement des indices et un classement de niveau de besoin qui orientent ses décisions de notation et d'intervention. »
- **Contrepoids (D)** : la borne la moins flatteuse décrit une fiche par élève, une note et un classement automatiques, gardés d'un trimestre à l'autre, sans écran destiné aux personnes classées. La borne la plus flatteuse décrit un poste local sous contrôle de l'enseignant·e, où seul le matériel pédagogique circule. D juge les deux bornes également ancrées dans les faits. Il note une dissymétrie : la borne basse s'énonce par des actions du programme, la borne haute par des propriétés de l'outil. Il situe A entre les deux bornes, et B plus près de la borne basse.

### 5.3 Étape 1 : la réaction scellée de Grégoire

- **Finalités.** Les 13 finalités proposées sont toutes « reconnues ». Grégoire nuance le vocabulaire : il dit « dépistage de difficultés » plutôt que « classer les élèves », « classement de niveau de besoins » plutôt que classement d'élèves, et « soutenir » plutôt que « faire changer » les pratiques. Il lit plusieurs des « limites » relevées par les lectures comme des choix voulus : aucune transmission, autonomie professionnelle, volontariat de la communauté.
- **Contradictions relevées par A et B.** Il en reconnaît la plupart comme des bugs ou du développement en cours, et il conteste l'interprétation de deux d'entre elles : l'infolettre (« un test Cloudflare ») et les courbes, dont les valeurs sont selon lui « indicatives », non « brouillées au hasard ».
- **Prédiction.** À la question « Quel résultat te ferait modifier l'application ou ta pratique ? », il répond : « Pas grand-chose. Je vois surtout des priorités de développement à terminer. »

### 5.4 Étapes 2 et 3 : convergence et appuis

- 142 affirmations sont dites par les deux lectures, 113 par une seule, et une seule est contradictoire.
- Sur les 142 affirmations communes, l'appui est jugé « soutient » pour 122, « en partie » pour 18 et « introuvable » pour 2.
- C précise qu'un accord entre A et B n'est pas une preuve : les deux lectures ont lu le même document.

### 5.5 Étapes 5 et 6 : confrontation et dispositions

- 103 conclusions solides sont classées « voulu et fait ».
- 11 sont « fait sans être voulu », toutes des bugs. Elles nuisent à l'utilisateur et, pour quatre d'entre elles, aussi aux élèves : export non chiffré, licence, CSV et export « anonymisé ».
- Aucune n'est « voulu mais invisible ».
- Les 8 conclusions de Q9, qui disent ce que l'observation ne permet pas de savoir, n'appellent pas de suite.
- Dispositions : toutes inscrites. Six fiches existantes les couvrent en partie (#1054, #1057, #1060, #1061, #1064, #1065), et sept fiches ont été créées (#1068 à #1074).
- Grégoire juge sa prédiction confirmée : « ce sont surtout des bugs à corriger ».

## 6. Ce que l'audit permet de dire, et ce qu'il ne permet pas

- **Le noyau descriptif est solide.** Il y a 103 conclusions observées, tirées indépendamment par deux lectures, appuyées par l'observation et reconnues par l'auteur. C'est la base de `10-description-application.md`.
- **La reconnaissance est presque totale, et c'est un fait à interpréter avec prudence.** Elle peut signifier que l'application fait ce qu'elle doit faire. Elle peut aussi tenir à ce que le dispositif voulait contenir, le biais de confirmation, dans les étapes que Grégoire mène lui-même (5 et 6). L'audit ne permet pas de trancher entre les deux. Il montre seulement que l'ordre des étapes a été respecté et que la prédiction a été écrite avant de voir la suite.
- **Une tension de sens demeure, maintenue par Grégoire.**
  - Les lectures, comme la conclusion solide Q5-28, disent que le programme classe des personnes (bandes, patterns, niveaux RàI, priorités).
  - Grégoire tient à « classement de niveau de besoins » et refuse « classer les élèves », tout en classant Q5-28 « voulu et fait ».
  - Les deux énoncés ne portent pas sur la même chose : l'un décrit ce que le calcul range, l'autre ce que l'enseignant·e en fait. Le rapport ne les concilie pas.
- **Aucun « voulu mais invisible » ne veut pas dire que tout ce qui était voulu est fait.** Par construction, les conclusions solides décrivent des comportements observés : elles ne peuvent guère révéler une intention absente du comportement. C'est le temps 3 qui mesure ce manque : 710 « prévu mais pas fait », dont 690 sans aucune mention dans l'observation. Confrontées au code le 15 oct. (`11-confrontation-prevu-pas-fait.md`), 569 s'y trouvent : l'observation ne les avait pas vues. 130 manquent en tout ou en partie (29 pas faites, 101 en partie). Des 131 soumises à Grégoire (ces 130 et une indécidable), retirées les intentions qu'il déclare périmées et les entrées refusées, 113 restent voulues : ce sont les « voulu mais invisible » que les conclusions solides ne pouvaient pas montrer.
- **Le dispositif a changé la description de la finalité, sans en changer le noyau.** Les deux lectures et le contrepoids nomment ce que les intentions mettent moins en avant : la conservation plus que la circulation, et le classement automatique de personnes. Grégoire les reconnaît en corrigeant les mots.

## 7. Limites

- **Version.** Seule la version 1.199.0 a été observée, dans Chromium et avec des données fictives : ni iPad, ni Safari, ni données réelles. Certains comportements tiennent peut-être au banc d'essai (sélecteurs de fichiers natifs).
- **Aveuglement partiel.** Les noms, les textes d'écran et les messages console de la copie portent des traces de l'histoire du projet. La copie a été préparée par une session qui connaissait les intentions.
- **Isolement.** Il n'est garanti qu'en partie (§4).
- **Lectures liées.** A, B, C et D lisent le même document : une erreur de l'observation se propage à toutes.
- **Usage réel inconnu.** Qui utilise l'application, comment, et avec quels effets sur les élèves et les enseignant·es : l'observation ne le dit pas, et Grégoire assume que l'application n'en garde aucune trace.
- **Fiches non revérifiées.** Les fiches #1068 à #1074 n'ont pas été revérifiées dans le code de `main` ; chacune le dit. Celles de #1075 à #1086 citent la 1.199.0 : leurs « pas fait » sont revérifiés en 1.201.0, pas leurs « en partie ».
- **Tri des « prévu mais pas fait » au code.** Il repose sur des sous-agents ; la contre-vérification à l'aveugle accorde 87 %, et ses 15 « fait » confirmés laissent possible jusqu'à environ 20 % d'erreur parmi les 569 « fait ».
- **Approbation par fatigue.** Pour les 131 entrées qui lui revenaient, Grégoire a répondu d'abord par défaut, de son propre aveu, puis il a approuvé en bloc le tri de Claude Code. Une approbation globale valide une méthode et une liste, pas chaque entrée : le biais que l'audit voulait contenir y trouve une porte (`11-confrontation-prevu-pas-fait.md`, « Déroulement »).
- **Rangement de la description.** Il est mécanique : chaque conclusion est rangée sous l'écran de son premier appui.

## 8. Ce qui reste ouvert

Chaque point appelle une disposition (inscrit, refusé ou périmé) que l'audit n'a pas encore reçue.

1. **Temps 3, catégorie 1** : les 351 « fait sans être prévu » n'ont pas été triées (`4-dispositions.md`). *Ouvert, à Grégoire.*
2. **Temps 3, catégorie 2** : les 710 « prévu mais pas fait », dont 690 sans aucune mention. *Fait le 15 oct. 2026, sauf 10 entrées* (`11-confrontation-prevu-pas-fait.md`) : triées au code de la 1.199.0, 569 sont faites (périmé), 101 en partie, 29 pas faites, 11 indécidables. Des 131 soumises à Grégoire, 111 sont inscrites (#1075 à #1086), une en partie, une l'était déjà (#291), 14 sont périmées et 4 refusées. Grégoire, épuisé par l'entrevue entrée par entrée, a approuvé le tri de Claude Code et répondu à cinq questions. *Reste ouvert, à Grégoire* : la destination des 10 indécidables (porte terrain ou mise de côté).
3. **Temps 3, questions de règle** : environ 13 entrées « question de règle », et les lots sans fiche (cohérence de l'interface, lot des mots). *Ouvert, à Grégoire (`4-dispositions.md`, « Ce qui reste à faire »).*
4. **Conclusions non confrontées** : les 19 « en partie », les 2 « introuvables », les 113 affirmations d'une seule lecture et la contradiction entre A et B. *Ouvert : à confronter ou à déclarer hors de portée.*
5. **#1074** : décider ce que l'export « anonymisé » doit retirer. Cela touche les données des élèves, donc *à Grégoire*.
6. **Observation sur iPad et dans Safari** : non faite. *Ouvert, à Grégoire* (porte terrain possible).

## 9. Les documents

Tous les documents de l'audit sont dans `plans de travail/observation/`. Le dossier d'archive, `plans de travail/observation/archive/`, ajoute les annexes : les consignes données aux sessions isolées, les notes brutes des entrevues, le paquet git de la copie aveugle et les versions HTML de lecture. Son `INDEX.md` décrit chaque fichier.
