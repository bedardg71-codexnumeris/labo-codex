# Inventaire des gestes qui suppriment pour de bon (#1007, lot de mesure)

> Écrit par Claude Code le 2 octobre 2026, 17 h (Toronto, mesuré par `date`), sur `main` à `65f1f8e4` (1.174.5). Consigne de Cowork de 16 h 45. **Aucun changement dans `js/`.** Un seul banc jetable, retiré après la mesure (§ 5).

## 1. En bref

**73 gestes** qu'un usager peut faire à l'écran effacent quelque chose pour de bon (une même action atteinte par deux portes compte une fois ; les portes sont nommées). Ma proposition de côté :

| Côté | Gestes | Qui |
|---|---|---|
| **Exige** un codex à jour | **5** | trimestre (déjà), groupe-cours, « Supprimer un groupe… » (élèves), « Vider la liste », « Réinitialiser toutes les données » |
| **Propose** un codex | **38** | les données de classe et le matériel pédagogique |
| **À Grégoire** | **30** | réglages, lignes isolées d'un éditeur enregistré, classements, et **trois gestes que le codex ne sait pas rendre** |

S'y ajoutent **5 effacements automatiques** (§ 4), sans geste de l'usager, et une vingtaine de fonctions qui effacent **sans aucun bouton pour y mener** (§ 4).

**Aujourd'hui, un seul geste consulte le codex** : supprimer un trimestre (`js/trimestre-v2-liste.js:443`, `etatDuCodexPourSuppression`). Mesuré par grep : aucun autre appel de `Codex.etat` sur un chemin de suppression. La colonne « Codex aujourd'hui » vaut donc « rien » partout ailleurs ; elle est omise des tableaux.

**Ce qu'un codex à jour, rouvert, rend** (lu, `js/codex.js:332-420`, `:1987`) : toutes les clés de `db` sauf `_codex_*`, et les fichiers des copies **actives** (`*fichiersTravaux`). Il **ne contient pas** les fichiers des copies à la corbeille ni ceux de la modélisation (mesuré pour la corbeille, § 5). Rouvrir remplace l'espace entier : ce qui est effacé revient, **et tout ce qui a été fait depuis la mise à jour est perdu**. Dans les tableaux, « oui » veut dire « oui, à ce prix ».

**Paliers.** *Mesuré* : vu par un banc. *Lu* : chemin lu du bouton jusqu'à l'écriture. *Inféré* : déduit sans avoir lu le chemin complet. Les relevés de code sont de trois lectures parallèles (structure, évaluation et copies, matériel) ; j'ai relu moi-même, contre le code, les points qui pèsent (garde du trimestre, groupe-cours, corbeille, pratique, injection HTML).

---

## 2. Les gestes, rangée par rangée

### 2.1 Exige (5)

| # | Geste | Écran | Efface / reste | Ce que l'écran dit avant (mot pour mot) | Codex rouvert rend | Palier |
|---|---|---|---|---|---|---|
| X1 | Supprimer un trimestre | Cadre › Trimestre › Bibliothèque des trimestres › « Supprimer… » (quatre boutons, une fonction) | Efface toutes les clés du trimestre et ses copies. | Refus sans codex à jour : « Supprimer un trimestre efface ses données pour de bon. Ton codex n'a pas tes derniers changements : mets-le à jour, puis recommence. » Puis `confirm` : « Supprimer définitivement le trimestre « {nom} » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. Ton codex à jour les contient encore, jusqu'à ta prochaine mise à jour : pour pouvoir revenir en arrière, fais d'abord une copie de ce fichier. » Puis il faut retaper le nom. | oui, sauf les copies à la corbeille | lu (garde mesurée par `lot-i-bis-suppression-trimestre-codex-a-jour.spec.js`) |
| X2 | Supprimer un groupe-cours | Cadre › Trimestre › Groupe-cours › « Supprimer » (`index.html:7330`) ; ou Bibliothèque › ⋮ › « Supprimer » | Seule l'entrée de `groupesCours` part (`trimestre-v2-groupes-cours.js:867`). **Restent, sans accès par l'écran** : les élèves, évaluations, présences, copies et captures hebdomadaires du groupe. | « Supprimer le groupe-cours "{nom}" ?\n\nCette action est irréversible. » | oui | lu (effacement) ; inféré (orphelins) |
| X3 | « Supprimer un groupe… » (les élèves d'un groupe) | Cadre › Trimestre › Groupe d'étudiant·es › « Supprimer un groupe… » (`index.html:6965`) | Les fiches des élèves du groupe. Leurs évaluations, présences et copies restent. N'écrit pas `elevesDesinscrits`. | « Supprimer les {n} étudiant(s) du groupe {libellé} ? Cette action est irréversible. » | oui | lu |
| X4 | « Vider la liste » | même écran, « Vider la liste » (`index.html:6968`) | Les fiches de **tous** les élèves du trimestre, tous groupes confondus. Le reste demeure. | « Supprimer les {n} étudiant(s) ? Cette action est irréversible. » (ne dit pas « tous les groupes ») | oui | lu |
| X5 | Réinitialiser toutes les données | Réglages › Données › Maintenance › « Réinitialiser toutes les données » (`index.html:9588`) | Tout `db`, tout le localStorage, tous les fichiers (copies, corbeille, modélisation). Restent le lien vers le dossier des Archives et le fichier de codex lui-même. | Trois étapes : « ATTENTION : Cette action va effacer TOUTES les données de l'application.\n\nEs-tu sûr de vouloir continuer ? » ; « Cette action est IRRÉVERSIBLE.\n\nAs-tu exporté tes données avant de continuer ? » ; taper « EFFACER ». | en partie : ni la corbeille, ni la modélisation, ni les clés tenues seulement en localStorage | lu |

Motifs. X2 est la règle de Grégoire. X3 et X4 sont des **suppressions de groupe d'élèves** : j'ai lu « groupe » comme couvrant aussi ces deux gestes (supposition, § 6). X5 contient tout ce que contient X1.

### 2.2 Propose (38)

**Structure et données de classe (6)**

| # | Geste | Écran | Efface / reste | Avant (mot pour mot) | Rouvert rend | Palier |
|---|---|---|---|---|---|---|
| P1 | Supprimer une fiche de cours | Cadre › Cours et services › « Supprimer » ; ou Bibliothèque › ⋮ › « Supprimer la fiche » | Refusé si le cours porte des données (#449). Sinon, la fiche **dans tous les trimestres** et les groupes-cours vides. | « Supprimer la fiche « {nom} » ?\n\nLe cours est global : la fiche disparaît de TOUS les trimestres.\n[…]\nCette action est irréversible (filet : ton backup Codex). » | oui | lu |
| P2 | Supprimer un·e élève | Groupe d'étudiant·es › menu de la ligne › « Supprimer » | La fiche seule (depuis 1.174.4) ; ses données restent (#1013, cité, pas refait). | « Supprimer {prénom nom} ? » | oui | lu |
| P3 | Supprimer un profil enseignant | Cadre › Enseignant·e › « Supprimer » | Le profil ; l'`enseignantId` des groupes-cours pend. | « Veux-tu vraiment supprimer le profil de {nom} ?\n\nCette action est irréversible. » | oui | lu |
| P4 | Supprimer un horaire | Cadre › Horaire › « Supprimer » | L'horaire et ses séances ; le calendrier est régénéré. Les présences aux dates de ces séances restent. | « Supprimer l'horaire "{nom}" ?\n\nCette action est irréversible. » | oui | lu ; inféré (présences) |
| P5 | Réinitialiser la séance de présences (↻) | Suivi › Saisie des présences › « ↻ » | Tout le monde passe absent, les notes de la séance sont vidées. | Si la séance est en base : « Réinitialiser la séance » / « Mettre tout le monde absent et vider les notes de cette séance ? » ; sinon aucune question. | oui | lu |
| P6 | Retirer un élève du registre longitudinal | Labo › Suivi longitudinal › « Retirer du registre » | Sa copie capturée, ses résultats ultérieurs, les modèles devenus orphelins. | « Retirer {nom} du registre ? Sa copie du {date} ({N dossiers}) sera effacée et ne pourra pas être retrouvée. […] Tes trimestres ne sont pas modifiés. » | oui (le texte dit le contraire) | lu |

**Évaluation et copies (11)**

| # | Geste | Écran | Efface / reste | Avant (mot pour mot) | Rouvert rend | Palier |
|---|---|---|---|---|---|---|
| P7 | Supprimer une production | Conception › Productions étudiantes › « Supprimer » (`index.html:4586`) | La production seule ; ses évaluations et copies restent. | « Es-tu sûr de vouloir supprimer cette production ? » | oui | lu ; inféré (orphelins) |
| P8 | Supprimer une évaluation sans copie | Évaluations › Liste › « Actions… » › « Supprimer l'évaluation » | L'évaluation ; si c'était une reprise, l'originale revient et les copies de la reprise vont à la corbeille. | « Veux-tu vraiment supprimer l'évaluation de {nom} pour {production} ?{…}\n\nCette action est irréversible. » | oui | lu |
| P9 | « Proposer un nettoyage » | Évaluations › Exporter et archiver › Espace de stockage (quota en alerte seulement) | Les copies exportées après le 16 sept. et non annotées depuis : fichier, vignette, fiche. L'évaluation reste ; les annotations restent, orphelines. | « Libérer de l'espace » : « Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur. Les retirer d'ici libère de l'espace tout de suite. Les copies qui n'ont pas encore été exportées ne sont jamais proposées. » | oui | lu |
| P10 | Supprimer une page dans l'éditeur, puis « Enregistrer » | Évaluations › Préparer et importer › éditeur de pages | Le fichier est réécrit sans la page. Les annotations sont rangées par numéro de page : elles peuvent glisser. | aucune question | oui | lu ; inféré (glissement) |
| P11 | Fusionner des copies, puis « Enregistrer » | Préparer et importer › « Fusionner (N) » ou éditeur › « Fusionner » | Les copies absorbées sont effacées **sans passer par la corbeille**. Il suffit du même élève, pas de la même production. | aucune question sur les copies absorbées | oui | lu |
| P12 | Jeton de reprise, pratique « supprimer l'originale » | Annoter et évaluer › panneau › case « Reprise » | L'évaluation originale (note, critères, rétroaction). | « Appliquer un jeton de reprise créera une nouvelle évaluation qui remplacera celle-ci.\n\nVeux-tu continuer ? » (ne dit pas « supprimée ») | oui | lu |
| P13 | Retirer un jeton de reprise | panneau › décocher « Reprise » ou corbeille du badge | L'évaluation de reprise ; ses copies vont à la corbeille. | « Retirer le jeton de reprise ?\n\nLa reprise ({x}%) sera supprimée et l'originale ({y}%) sera restaurée.{…} » | oui | lu |
| P14 | « Effacer tout » (annotations de la page) | palette d'annotation › « Effacer tout » | Tout ce qui est posé sur la page ; annulable pendant la séance seulement. | aucune question | oui | lu |
| P15 | Supprimer une intervention ou une rencontre | Suivi › Interventions (ou Rencontres) › « Supprimer » | L'intervention, son analyse, ses notes et présences internes. | « Supprimer cette intervention ? » / « Supprimer cette rencontre ? » | oui | lu |
| P16 | Bilan réflexif : supprimer les résultats | Labo › Bilan réflexif › « Supprimer les résultats » | Les résultats importés ; le CSV source reste chez l'usager. | « Supprimer les résultats importés ? » | oui | lu |
| P17 | Bilan réflexif : réinitialiser ou importer le questionnaire | Labo › Bilan réflexif › éditeur | Le questionnaire personnalisé est remplacé. | « Remplacer le questionnaire actuel par le modèle d'origine ? » / « Remplacer le questionnaire actuel par celui importé ?\n\n• N bloc(s)[…] » | oui | lu |

**Matériel pédagogique et bibliothèques (21)**

« Section 1 » : les modèles du trimestre, dans une modale de bibliothèque. « Section 2 » : la bibliothèque partagée. « Retirer » (section 1) ne change qu'un statut : hors compte.

| # | Geste | Efface | Avant (mot pour mot) | Palier |
|---|---|---|---|---|
| P18 | Grille ouverte › « Supprimer » (`index.html:4918`) | la grille du trimestre ; **ne vérifie ni évaluations ni productions** | « Supprimer la grille « {nom} » ? » ; avec cartouches : « La grille « {nom} » porte N cartouche(s) : … Veux-tu les déplacer vers une autre grille ? » | lu |
| P19 | Bibliothèque des grilles, section 1 › « Supprimer » | la grille du trimestre **et** sa copie de bibliothèque | mêmes textes que P18 (ne disent pas que la bibliothèque perd sa copie) | lu |
| P20 | Bibliothèque des grilles, section 2 › « Supprimer » | l'entrée de la bibliothèque partagée | « Supprimer définitivement «{nom}» de la Bibliothèque ?\n\nCette action est irréversible. » | lu |
| P21 | « Remplacer l'existante » (conflit de nom : grilles, échelles, cartouches) | l'homonyme, **avec son id** : ses cartouches et les évaluations qui le pointent deviennent orphelines | « La ressource existante sera ecrasee par la nouvelle. Cette action est irreversible. » (sans accents à l'écran) | lu (grilles) ; inféré (échelles, cartouches) |
| P22 | Collection de projection › corbeille | la collection | « Supprimer la collection « {nom} » ? Les grilles qui l'ont copiée ne changent pas. » | lu |
| P23 | Échelle ouverte › « Supprimer » (`index.html:5114`) | l'échelle ; s'il y a des porteurs, elle est d'abord remplacée partout | « Supprimer cette échelle ? » ; ou « Supprimer l'échelle «{nom}», c'est la remplacer : {porteurs} suivront.[…] » | lu |
| P24 | Bibliothèque des échelles, section 1 › « Supprimer » | trimestre **et** bibliothèque | « Supprimer définitivement l'échelle «{nom}» ?\n\nCette action est irréversible. » | lu |
| P25 | Bibliothèque des échelles, section 2 › « Supprimer » | bibliothèque partagée | « Supprimer définitivement «{nom}» de la Bibliothèque ?\n\nCette action est irréversible. » | lu |
| P26 | Cartouche ouverte › « Supprimer » (`index.html:5243`) | la cartouche de sa grille ; la rétroaction déjà rédigée reste | « Supprimer la cartouche «{nom}» de sa grille « {grille} » ?\n\n[Elle reste dans la Bibliothèque.][N évaluation(s) l'emploient : leur rétroaction déjà rédigée est conservée.]\n\nCette action est irréversible. » | lu |
| P27 | Bibliothèque des cartouches, section 1 › « Supprimer » | grille **et** bibliothèque | « Supprimer définitivement la cartouche «{nom}» de sa grille « {grille} » ?\n\n[Elle part aussi de la Bibliothèque.][…]\n\nCette action est irréversible. » | lu |
| P28 | Bibliothèque des cartouches, section 2 › « Supprimer » | bibliothèque partagée | « Supprimer définitivement «{nom}» de la Bibliothèque ?\n\nCette action est irréversible. » (ou « Retirer… ? » si encore ancrée) | lu |
| P29 | Pratique ouverte › « Supprimer » (`index.html:5483`) | la pratique, **sans garde** : un groupe-cours qui l'emploie n'a plus de note (règle N1a) | « Es-tu sûr de vouloir supprimer cette pratique ? » | lu (relu) |
| P30 | Bibliothèque des pratiques, section 1 › « Supprimer » | la pratique du trimestre seulement, **sans garde** | « Supprimer définitivement la pratique «{nom}» ?\n\nCette action est irréversible. » | lu |
| P31 | Bibliothèque des pratiques, section 2 › « Supprimer » | bibliothèque partagée | « Supprimer définitivement la pratique « {nom} » de la bibliothèque ?\n\nCette action est irréversible. » | lu |
| P32 | Labo › Exploration des pratiques › « Jeter » une maquette | la maquette (la pratique active est refusée) | « Jeter la maquette » / « Supprimer définitivement cette maquette ? Cette action est irréversible. » | lu |
| P33 | Réglages › Données › Gestion avancée des ressources › « Supprimer » (pratique, grille, cartouche, échelle, production, alignement) | selon le type ; **gardé** (bloqué s'il y a des dépendances) ; une grille emporte ses cartouches | « Tu es sur le point de supprimer définitivement la {type} : {nom} — Cette action est irréversible. » puis retaper le nom | lu |
| P34 | Bibliothèque des productions, section 1 › « Supprimer » | la production du trimestre **et** sa copie ; **aucune vérification des évaluations** (Réglages, lui, bloque) | « Supprimer définitivement » / « Supprimer définitivement la production «{titre}» ? Cette action est irréversible. » | lu |
| P35 | Bibliothèque des productions, section 2 › « Supprimer » | bibliothèque partagée | « Supprimer définitivement «{titre}» de la Bibliothèque ? Cette action est irréversible. » | lu |
| P36 | Bibliothèque de tampons › ⋮ › « Supprimer » | l'entrée, image comprise | aucune question | lu |
| P37 | Supprimer une carte d'alignement (menu Actions, ou bibliothèque › section du trimestre) | nœuds et liens ; les notes de leçon restent, invisibles | « Supprimer la carte « {nom} » ? » / « Supprimer définitivement la carte « {nom} » du trimestre actif ? » | lu |
| P38 | Bibliothèque des alignements › section partagée › « Supprimer » | l'entrée (la démo se recrée) | « Supprimer cette carte d'alignement de la Bibliothèque ? Cette action est irréversible. » | lu |

Pour P18 à P38, un codex à jour rouvert rend **oui** partout (toutes ces clés passent par `db`).

### 2.3 À Grégoire (30)

Par famille, avec, entre crochets, ce que je suggérerais. C'est à lui de trancher.

**a. Ce que le codex ne sait pas rendre (3)** [*ni exige ni propose avant que le codex emporte ces fichiers : proposer un codex qui ne contient pas la chose serait promettre un filet qui n'existe pas* ; § 5]

| # | Geste | Efface | Avant (mot pour mot) | Rouvert rend | Palier |
|---|---|---|---|---|---|
| G1 | Corbeille › ligne › « Supprimer » | fichier, vignette, annotations, ligne, **et toutes les évaluations élève × production** | « Supprimer définitivement ? » : « Le fichier, ses annotations et toutes les évaluations de cet élève pour cette production seront effacés. » (ou « Le fichier sera supprimé de façon permanente. ») puis « Cette action est irréversible. » | en partie : pas le fichier | mesuré (le fichier) ; lu (le reste) |
| G2 | Corbeille › « Vider la corbeille » | les fichiers du groupe-cours actif et les évaluations de leurs couples ; les annotations restent, orphelines | « Vider la corbeille ? » : « Supprimer définitivement les N fichier(s) de la corbeille ? » [« N évaluation(s) liée(s) à ces fichiers partira/partiront avec eux. »] « Cette action est irréversible. » | en partie : pas les fichiers | mesuré (les fichiers) ; lu |
| G3 | Labo › Modélisation › corbeille du badge | fichier, annotations, fiche | « Supprimer ce fichier et ses annotations ? » | en partie : pas le fichier | lu |

**b. Réglages et état d'outil (11)** [*rien*]

Les bornes du trimestre (« Veux-tu vraiment réinitialiser les bornes du trimestre ? ») ; les semaines spéciales (« Veux-tu vraiment réinitialiser les semaines spéciales ? ») ; un paramètre de configuration, Réglages › Gestion avancée (« Supprimer le paramètre « {label} » ({cle}) ?\n\nCette action est irréversible. ») ; réinitialiser les tampons (« Réinitialiser tous les tampons, catégories, couleurs et rétroactions ?\n\nCette action est irréversible. Pense à exporter tes tampons avant si tu veux les conserver. ») ; importer des tampons, qui remplace (« Importer cette bibliothèque de tampons ? … Les tampons actuels seront remplacés. ») ; réinitialiser les codes d'erreurs (« Réinitialiser tous les codes d'erreurs et rétroactions ?\n\nCette action est irréversible. ») ; un gabarit d'export de la carte (aucune question) ; « Réinitialiser » le tirage et « Réinitialiser les tirages » des questions (aucune question ; un geste) ; les élèves suivis du tableau de bord, par retrait ou par « Réinitialiser » (aucune question) ; quitter le mode démo, qui n'efface que la démo (aucune question) ; retirer un jeton de délai (aucune question).

Tous : un codex rouvert les rend ; palier lu. **Exception à peser** : un paramètre de configuration peut être `enseignants` ou `modalitesEvaluation`, qui sont des données. Je le classerais « propose » pour ces deux clés.

**c. Une ligne d'un éditeur enregistré (11)** [*rien, sauf là où la ligne porte des notes d'élèves (critère, niveau, cible) : question pédagogique*]

Une journée sans cours (« Veux-tu vraiment supprimer cette journée sans cours ? ») ; un critère d'une grille (« Es-tu sûr de vouloir supprimer ce critère ? ») ou un sous-critère (« Supprimer ce sous-critère ? ») ; un palier de projection (aucune question) ; un niveau d'échelle (« Supprimer ce niveau ? ») ; un type de travail ou un forfait PAN (aucune question) ; une cible de dénotation (« Tu retires une cible déjà cochée.[…] La note de ces étudiant·es sera recalculée sans elle. Les coches restent enregistrées, mais ne comptent plus.\n\nRetirer quand même ? ») ; un nœud ou un lien de la carte (aucune question ; « Annuler » ne rend pas la note de leçon) ; une question flash (« Supprimer cette question ? ») ; une sélection d'annotations (aucune question) ; un résultat ultérieur du registre (aucune question) ; les lignes isolées du bilan réflexif : questions, options, énoncés, activités (« Supprimer cette question ? », « Supprimer cette activité ? », « Supprimer ? »), émotions (aucune question).

Compte : la ligne critère / sous-critère et la ligne bilan réflexif valent chacune un geste.

**d. Classements et index (5)** [*rien*]

Un dossier de bibliothèque (« Supprimer ce dossier ? Son contenu n'est pas supprimé : les {pluriel} repassent en « non classées ». ») ; une catégorie de questions flash (« Supprimer cette catégorie ? Les questions seront déplacées vers «Sans catégorie». ») ; une entrée du manifeste des Archives (« Retirer cette entrée du manifeste local ? Les fichiers sur disque ne sont pas supprimés. ») ; les rapports de bug archivés, un à un (aucune question) ou « Tout supprimer » (« Supprimer tous les rapports archivés ? »).

Compte : a = 3, b = 11, c = 11, d = 5 (les rapports un à un et « Tout supprimer » comptent pour deux), soit 30.

---

## 3. Ce que je propose de lui demander

### 3.1 Les cas qui lui reviennent

Quatre questions fermées suffisent à classer les 30 :

1. **Corbeille et modélisation (G1-G3)** : (a) on attend que le codex emporte ces fichiers ; (b) on propose le codex quand même, en disant ce qu'il ne contient pas ; (c) rien.
2. **Réglages (b)** : rien, sauf `enseignants` et `modalitesEvaluation` qu'on propose ? oui / non.
3. **Lignes d'éditeur (c)** : rien ? Et pour une ligne qui porte des notes d'élèves (critère, niveau, cible) : propose ? oui / non.
4. **Classements (d)** : rien ? oui / non.

Et une précision sur sa règle : **« groupe » couvre-t-il aussi « Supprimer un groupe… » et « Vider la liste »** (X3, X4) ? Et « Réinitialiser toutes les données » (X5), qu'il n'a pas nommé ?

### 3.2 Codex habituel mis à jour, ou fichier à part ?

| | Codex habituel mis à jour | Fichier à part, sous un autre nom (proposition d'origine) |
|---|---|---|
| À l'écran | Rien de neuf. Le refus du trimestre existe déjà et se réemploie. | Un fichier d'environ 1 Go écrit à chaque suppression gardée, puis la fenêtre « Il y est ». Sur l'iPad, du temps et de l'espace à chaque fois. |
| Dans le code | Une garde réemployée (`etatDuCodexPourSuppression` et le refus) sur chaque geste ; quelques lignes par geste. | `genererCodex`, puis l'écriture **sans adoption** (`sansAdoption`, #1012) et `FichierSortant.confirmerTelechargement` : les pièces existent ; il reste à les assembler en un parcours. |
| Ce que vaut le filet | Dans Chrome et Edge, il expire à la mise à jour suivante (même fichier réécrit, lu, #1007). | Durable : le fichier survit aux mises à jour. |

**Ma recommandation.** Je mélangerais les deux selon le côté :
- Pour les **5 gestes qui exigent** : un **fichier à part**. Ils sont rares et touchent un trimestre ou un groupe entier : le filet doit survivre à la mise à jour suivante, et le coût d'un gros fichier est acceptable.
- Pour les **38 qui proposent** : le **codex habituel**. Écrire un fichier d'1 Go pour supprimer une évaluation serait disproportionné, et la mise à jour normale suffit à ces gestes.

C'est une lecture argumentée, pas une mesure de l'usage réel.

---

## 4. Hors compte, mais à savoir

**Effacements automatiques (5), sans geste.**
- La corbeille se purge seule après 30 jours, à la première ouverture des Évaluations ou de la Modélisation (`travaux-stockage.js:1081`). Partent les fichiers, les annotations et les lignes. Les évaluations du couple **restent**, alors que le vidage manuel les efface. Aucun message.
- Les rapports de bug archivés sont tronqués au-delà de 20 (`rapport-bug.js:83`).
- Le démarrage purge les champs hérités des modalités (`purgerLegacy`).
- La migration `proto_cm_*` ne s'exécute qu'une fois, après copie.
- La préférence de persistance efface le lien des Archives.

**Changements de statut (hors compte)** : mise à la corbeille, « Retirer » de la sélection d'une bibliothèque, retrait d'un cours de la bibliothèque, « Effacer la liaison » vers le dossier des Archives.

**Sans bouton qui y mène** : `supprimerEtudiant` (groupe.js), `supprimerSeance*`, les `*Entite.supprimer`, `supprimerEnsembleObjectifs`, `supprimerProduction` (productions.js, boutons cachés), `supprimerFichierImporte` (copie **et** évaluation, sans corbeille), `nettoyerDoublonsExacts`, `supprimerEvaluationBanque`, `retirerJeton*`, `confirmerSuppressionEvaluationSidebar`, `supprimerGrille`, `supprimerGrilleDepuisSidebar`, `supprimerEchelle`, `importerDans*Active`, les anciennes fonctions de `pratiques.js` et de `pratique-notation-v2.js`, `reinitialiserSeuilsInterpretation`, `reinitialiserMappingAnonyme`. Issue 3 (code mort, sans conséquence observable). Ce n'est pas l'objet de ce lot.

---

## 5. La mesure : la corbeille ne voyage pas dans le codex

**Banc jetable** (WebKit, `tests/integration/_jetable-1007-corbeille.spec.js`, retiré après la mesure). Le montage : une copie active et une copie à la corbeille, toutes deux avec leur fichier dans l'application. On écrit le codex par le vrai `Codex.generer`, puis on le rouvre par le menu dans un espace neuf.

- **Génération** : le fichier de la copie active est le seul demandé, et le seul écrit (`travaux/FT_actif.png`). La ligne de la corbeille est dans les données, sans son fichier.
- **Réouverture** : la corbeille liste la copie, mais l'application ne la contient pas. Elle se présente comme restaurable, sans fichier.

Ce qui en découle :
- **Lu** : sur le même appareil, rouvrir le codex garde le fichier local de la corbeille, car le plan de purge le compte comme référencé (`codex.js:2008`). L'écart mord donc **après un vidage** (G1, G2) ou **sur un autre appareil**.
- **Lu, non mesuré** : la même règle exclut les fichiers de la modélisation (G3).

Issue 2. C'est **inscrit** sous #1014 (§ 7), parce que cela touche le filet même de #1007.

---

## 6. Ce que j'ai supposé

- J'ai lu « groupe », dans la règle de Grégoire, comme couvrant le groupe-cours **et** les deux suppressions d'élèves par groupe (X3, X4).
- J'ai placé « Réinitialiser toutes les données » du côté « exige », parce qu'elle contient tout ce que contient la suppression d'un trimestre.
- Une même action atteinte par deux portes compte pour un seul geste.

---

## 7. Trouvé de cassé en chemin

Chaque constat porte sa disposition. La règle d'entrée du BACKLOG (24 août : un symptôme vécu, ou un chantier bloqué) laisse **un seul** de ces constats entrer. Les autres restent consignés ici ; Grégoire peut en faire inscrire.

| # | Constat | Preuve | Disposition |
|---|---|---|---|
| C1 | Le codex n'emporte ni les fichiers de la corbeille ni ceux de la modélisation | § 5 ; `codex.js:384` | **inscrit : #1014** (bloque #1007 : G1-G3) |
| C2 | Les rapports de bug archivés s'insèrent dans `innerHTML` sans `echapperHtml` (prénom, description, id) ; la clé voyage dans le codex | `rapport-bug.js:158-171` (relu) | non inscrit : **règle de sécurité n° 1**. Je le signale en tête à Grégoire. |
| C3 | Supprimer un groupe-cours laisse ses élèves, évaluations et copies sans accès | `trimestre-v2-groupes-cours.js:867` (relu) | non inscrit : sera porté par la garde « exige » de X2 |
| C4 | Supprimer la pratique ouverte (et la section 1) se fait sans garde ; un groupe qui l'emploie perd sa note | `pratiques-gestion.js:2197` (relu), `:971` | non inscrit, non vécu |
| C5 | Supprimer une grille depuis Conception ne vérifie ni évaluations ni productions ; « Remplacer l'existante » efface l'homonyme avec son id | `grilles.js:2969`, `:689` | non inscrit ; même classe que « grilles h2026 désappariées » |
| C6 | Vider la corbeille et `supprimerFichierTravail` laissent les annotations orphelines (#572 a manqué deux chemins) | `travaux-stockage.js:1133`, `:369` (relu) | non inscrit (issue 3 de fait : invisible) |
| C7 | Vider la corbeille efface les évaluations du couple, même quand la copie vivante du couple est évaluée ; la purge automatique, elle, les garde | `liste-evaluations.js:2882`, `travaux-stockage.js:1081` | non inscrit, inféré ; question pédagogique pour Grégoire |
| C8 | Des textes qui disent faux ou moins que vrai : le jeton de reprise (« remplacera » quand l'originale est supprimée), « Vider la liste » (tous les groupes), le registre (« ne pourra pas être retrouvée »), la bibliothèque des grilles et des échelles (la copie part aussi), « ecrasee » sans accents | voir rangées P12, X4, P6, P19, P24, P21 | non inscrits : des mots que l'usager lit, à Grégoire |
| C9 | Le profil enseignant se supprime sans la garde qui existe (`verifierSuppressionEnseignant`, jamais appelée) | `trimestre-v2-enseignants.js:388` | non inscrit |
| C10 | La fusion de copies efface sans question et sans exiger la même production | `travaux-ui.js:6604`, `:6942` | non inscrit |
