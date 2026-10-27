# Consigne – L'Aide, lot 2a : Commencer et Cadre disent vrai, en moins de mots (#1152)

> Écrite par Cowork le mardi 27 octobre 2026 à 14 h 55 (Toronto, mesuré par `date`), sur `main` = `2fef338a` (1.221.0 en ligne). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Plan : `PLAN-2026-10-24-refonte-de-l-aide.md` (lis son « État au 27 octobre »). Sources, **dans cet ordre** : `audit-aide-2026-10-24/REMESURE-2026-10-27.md` (l'écran d'aujourd'hui ; elle l'emporte sur le dossier pour les entrées qu'elle nomme), puis `audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md` (les décisions D1 à D13 et le tableau des verdicts finals, qui l'emporte sur le « Verdict proposé » des fichiers de lot), puis le détail des entrées dans `lot-1-introduction.md`, `lot-2-configuration.md`, `lot-3-formation-utilisation-1.md` et `lot-5-consultation.md`.
> **Découpage décidé par Cowork** (remesure du 27 oct.) : l'ancien lot 2a est coupé en deux. Ce lot fait Commencer et le Cadre, et les deux entrées neuves ; la Conception est le lot 2b.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork ne sont pas un obstacle.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `plans de travail/PLAN-2026-10-24-refonte-de-l-aide.md`, `plans de travail/audit-aide-2026-10-24/REMESURE-2026-10-27.md`. Rien d'autre (`CONSIGNE-DEMARRAGE-COWORK.md` est modifié par une autre session de Cowork : laisse-le).

## 1. Le mandat

Les 15 entrées de Commencer et du Cadre deviennent 11, plus 2 entrées neuves. Chacune dit ce que fait l'écran d'aujourd'hui, sans redire ce qu'il affiche déjà. Environ 2 500 mots aujourd'hui, environ 1 300 visés (estimation ; mesure et dis le chiffre réel).

**Ce qui ne change pas** : aucun comportement de l'application. Aucun fichier de `js/` n'est touché, sauf s'il faut une ligne pour l'Aide (dis-le). `js/config.js` et `js/navigation.js` : non.

## 2. Les entrées, une par une

Repère chaque entrée par son id (préfixe `accordeon-aide-`), jamais par une ligne du dossier. Les cibles de mots sont celles du tableau des verdicts finals.

### Commencer, dans cet ordre

1. **`presentation`** (~120 mots). Ne garde que « Où vont tes données ? » (verdict final, D1 : l'exposé et la théorie sortent). Ajoute la phrase que l'audit a fait passer de l'entrée coupée `monitorage` (« Grilles, échelles et pratique sont les tiennes ; SRPNF et IDME sont des exemples », à vérifier contre ce que l'application sème aujourd'hui). « étudiant·e » partout.
2. **`prise-en-main`** (~80 mots). Une phrase par outil. Le renvoi « la carte « Étapes de configuration », plus haut » est faux depuis le lot 1 : cette carte est dans le Cadre. Les mots « Données démo », « Assistance », « Visite guidée » restent (`sentinelle-audit-aide-lot-A`).
3. **`demo`** (~110 mots). Les corrections du dossier (`lot-3`), **remesurées au HEAD** (le pack démo a pu changer depuis le 23 oct. : compte ce qu'il sème). Le caractère provisoire de la démo et « Retirer les copies (N) » : reprends le texte validé de la popup « Données démo » (`js/accompagnement-contenu-popup.js`, l. ~1258-1268), mot pour mot. Les phrases épinglées par `sentinelle-audit-aide-lot-A` restent si elles sont encore vraies ; sinon arrête-toi sur ce point et dis-le.
4. **`modes`** absorbe **`modes-formation`** : une seule entrée, « Le mode anonymisé » (~80 mots ; fusion confirmée par Grégoire le 24 oct., 18 h 25). Où est le bouton : **mesure-le à l'écran** (capture à 1 440 et 820 px ; le dossier le place dans les utilitaires de la première ligne de l'en-tête, menu ⋯ › « Anonymisation » sur téléphone). Ce qu'il masque, « Afficher DA réels », et qu'il écrit dans les vraies données. La démo n'est pas un mode. **Les pseudonymes restent « Élève 1 », « Élève 2 »**, comme l'écran : D6 attend la décision de Grégoire.
5. **Entrée neuve `bibliotheque`**, « La bibliothèque ». Ses quatre listes reprennent **mot pour mot** le texte validé par Grégoire le 25 oct. à 16 h 53 : la popup `bibliotheque-fonctionnement` (`js/accompagnement-contenu-popup.js`, l. ~404-445). Une sentinelle compare les deux côtés (§4). Ajoute, en phrases neuves : les tampons (« Dans ta palette » au lieu de « Dans ce trimestre », « ← Utiliser dans ma palette ») ; les trois listes simples, cours, trimestres et groupes-cours (une seule liste ; « Mettre de côté », le repli « Mis de côté (n) », « Remettre dans mes cours » ou « Remettre dans le menu » ; les trimestres clos dans « Clos (n) », avec « Rouvrir »). Remesure n° 1 et 2.
6. **Entrée neuve `chaines-etapes`**, « Les chaînes d'étapes » (~80 mots, toutes neuves). Ce qu'est une chaîne (les étapes qui rendent un outil prêt à servir, cochées quand elles sont réglées) ; les écrans qui en ont une ; ce que fait un clic (il mène à l'endroit où l'on règle, sans rien modifier ; « Méthode » rouvre l'assistant d'une pratique ; sur la Carte d'alignement, il ouvre le guide à la page de l'étape) ; la case « Afficher les chaînes d'étapes » de Préférences › Expérience visuelle, qui les masque toutes. **Mesure** ce que la case fait de la chaîne du critère algorithmique (`js/atelier-algo.js` dessine aussi une `.barre-convergence`) et dis-le juste. Ne liste pas les étapes de chaque outil : l'écran les montre. Remesure n° 3.
7. **`preferences`** (~70 mots). Les corrections du dossier (`lot-2`), remesurées au HEAD, plus la case des chaînes. La note qui renvoie à Labo › Outils d'observation reste.

### Cadre, dans cet ordre

8. **`etapes-config`** absorbe **`trimestre`** et la définition de **`groupe-cours`** : une entrée d'ensemble sur Cadre › Trimestre (~150 mots, plus ~20 pour la définition). Les six accordéons dans l'ordre de l'écran, et la chaîne qui montre leur état ; la rangée qui ouvre chaque accordéon ; les trois résumés qui restent (remesure, `trimestre`). Le groupe-cours en une définition juste : les éléments obligatoires que l'écran nomme, la pratique facultative, un seul actif, son menu dans l'en-tête ; et la question posée quand le groupe n'a aucun·e étudiant·e dans le cours choisi (#1038, phrase neuve). L'astuce « La carte suivante… » part. Pas de « Workflow », « dropdown » ni « modal ».
9. **`cours`** (~45 mots). Les corrections du dossier ; les deux lignes sur l'horaire et les périodes passent dans `horaire`.
10. **`horaire`** (~55 mots). La reprise n'est pas automatique : elle se déclare dans « Journées sans cours » ; le « Groupe associé » obligatoire ; les périodes de chaque séance, venues de `cours`. Le motif « 2×2h » reste interdit (`sentinelle-audit-aide-15-oct`).
11. **`etudiants`** absorbe **`groupe`** (~110 mots). Les trois façons d'ajouter, la ligne « Mesure d'aide » de `groupe` (sans l'historique « CAF », retiré au lot 1), l'écran d'aujourd'hui (remesure, `etudiants` : la bande sous la rangée, les trois boutons en tête de liste). « Groupe » est le numéro du groupe, pas le groupe-cours.
12. **`presences-calendrier`** (~35 mots), titre « Lire le calendrier scolaire ». Les couleurs disent le type de journée et les échéances, pas les présences ; tous les mois d'un coup ; un clic sur un jour de cours ouvre la saisie des présences à cette date.
13. **`archivage`** (~120 mots). Le chemin d'aujourd'hui (remesure) ; le trimestre actif ne se clôt pas, il faut en activer un autre d'abord ; « Clos (n) » et « Rouvrir » ; « Permission d'écriture ». La ligne sur la capture des ressources (mécanique interne) et l'encadré « Important » (il redit la fenêtre) partent ; « Quand clore ? » reste. **La première phrase, acceptée par Grégoire le 4 oct. et épinglée, ne change pas** ; mais elle inverse l'ordre du code (« tu peux ensuite en commencer un nouveau ») : propose une reformulation dans la demande de relecture, Cowork la soumet à Grégoire. L'archive hors du navigateur n'entre pas ici (trou n° 7, lot 4) : le banc y interdit tout mot en « archiv ».

### Les ids

- Les entrées absorbées (`modes-formation`, `trimestre`, `groupe-cours`, `groupe`) disparaissent ; les survivantes gardent leur id. **Mesure d'abord leurs lecteurs.** Mesuré par Cowork : aucun dans `js/` (seul le commentaire de `allerVersAide`, une fonction sans appelant, cite `aide-archivage` : `js/trimestre-v2.js:512`) ; dans `tests/`, à toi de compter.
- Les deux entrées neuves : `accordeon-aide-bibliotheque` et `accordeon-aide-chaines-etapes` ; vérifie qu'aucun id ne les porte déjà. La recherche de l'Aide doit les trouver (essai au §4).

## 3. Les règles de mots

- **Une phrase qui dit quelque chose que l'Aide ne disait pas** (les entrées neuves, les ajouts de la remesure, la phrase venue de `monitorage`, celle de #1038) : écris-la, puis recopie-la dans la demande de relecture, dans une section à part « Pour Grégoire », entrée par entrée. Cowork les lui soumet ; ses corrections feront une retouche.
- Corriger une affirmation fausse, couper une redite ou resserrer n'est pas une phrase neuve.
- « étudiant·e » dans tout texte affiché ; le conditionnel, jamais une prescription ; aucun nom de personne réelle ; aucun exemple propre à une discipline.
- Chaque fait que tu écris est mesuré au HEAD (`fichier:ligne` dans la demande de relecture). **Un texte d'aide est une affirmation à vérifier, pas une description de l'écran** : ni l'ancien texte, ni le dossier, ni ce fichier ne valent une mesure.
- Les libellés entre « » sont ceux de l'écran, recopiés du code.

## 4. Les tests

- Fais tourner les sentinelles de l'Aide avant de toucher (`tests/unit/sentinelle-*aide*`, `sentinelle-1002-mots-clos`, `critere-algorithmique-mots`, `bareme-2-pieces-d-aide`, et les specs `aide-forme-1152`, `materiel-aide-accompagnement`, `bareme-2-aide`, `aide-exporter-archiver-893`).
- Une assertion qui tombe parce qu'une entrée est fusionnée, corrigée ou resserrée par décision : adapte-la, en citant dans le test l'audit du 24 oct., la remesure du 27 oct. et la décision. Une assertion qui tombe pour une autre raison : arrête-toi et dis-le. Cas connus : `sentinelle-1002-mots-clos` exige une tranche HTML d'au moins 1 500 caractères pour `archivage` (une garde de découpe, pas de contenu : si le resserrement passe dessous, ajuste la garde en le justifiant) et aucun mot en « archiv » ; `sentinelle-aide-2026-10-24-forme` et `aide-forme-1152` comptent peut-être les entrées.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-27-lot-2a.test.js`, calculée des deux côtés, jamais recopiée : le texte des quatre listes de `bibliotheque` égale celui de la popup `bibliotheque-fonctionnement` (lu dans le module, pas dans une copie) ; aucune entrée de Commencer ni du Cadre ne dit « sidebar », « barre latérale », « colonne de gauche », « dropdown », « Workflow » ou « modal » ; les quatre ids absorbés n'existent plus ; Commencer et le Cadre ont les entrées du §2, dans cet ordre. Break-test : chaque assertion rougit sous ablation, arbre restauré par sha256.
- **Un essai Playwright ciblé** (pas la suite complète) : la recherche de l'Aide trouve « bibliothèque » et « chaînes d'étapes » ; la popup « Comment fonctionne la bibliothèque » et l'entrée de l'Aide montrent le même texte.
- Vitest se lance depuis `tests/`. Bloc de jetons d'`index.html` à jour seulement si un fichier `js/` est touché.

## 5. Trouvé en chemin par Cowork (issue 2 : inscrire, ne pas toucher)

Deux fonctions sans appelant (grep sur `js/` et `index.html`) : `allerVersAide` (`js/trimestre-v2.js:514`) et `ouvrirAideGroupeCours` (`js/trimestre-v2-groupes-cours.js:125`, exportée sur `window`), dont l'`alert` décrit un groupe-cours périmé (« 4 éléments », « 4 menus déroulants »). Ajoute-les au tableau « Trouvé hors de la section Aide » de `AUDIT-AIDE-2026-10-24.md`, disposition « inscrit #1152, lot 5 (code mort) ».

## 6. Ce qui n'entre pas

La Conception (lot 2b), l'Évaluation et le Suivi (lot 2c), le Labo, le codex et la Référence (lot 2d) ; le glossaire unique (lot 3) ; les sept trous, dont l'archive hors du navigateur (lot 4) ; les textes d'écran hors de l'Aide (lot 5) ; D6.

## 7. Clôture

- `BACKLOG.md` : sous #1152, le lot 2a fait ; le plan dit « 2a : codé, en relecture ».
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-aide-lot-2a.md` : ce qui a changé, entrée par entrée, avec le nombre de mots avant et après ; les preuves `fichier:ligne` ; les tests modifiés et pourquoi ; la section « Pour Grégoire » (les phrases neuves, la reformulation proposée de la première phrase d'`archivage`) ; les captures du bouton du mode anonymisé et des deux entrées neuves, à 1 440 et 820 px.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à vérifier à l'écran après la mise en ligne : ouvrir l'Aide › Commencer, lire « La bibliothèque » et « Les chaînes d'étapes » ; chercher « Clore » trouve le chemin d'aujourd'hui.
