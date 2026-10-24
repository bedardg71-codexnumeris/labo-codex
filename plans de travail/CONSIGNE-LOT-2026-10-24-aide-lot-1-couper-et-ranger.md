# Consigne de lot – l'Aide, lot 1 : couper et ranger (samedi 24 octobre 2026)

> Écrite par Cowork (session dans le nuage) le samedi 24 octobre 2026 à 18 h 40 (Toronto, mesuré par `date` sur le Mac), sur `main` = `dc39bff2`. Ce fichier ne remplace ni `CONSIGNE-DU-JOUR.md` ni les autres consignes de lot : n'y touche pas.
> **Quand l'exécuter.** Une seule session écrit à la fois. `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` a encore ses lots 3 et 4 : ce lot passe entre deux de ses lots ou après lui, **jamais pendant qu'un autre lot a des fichiers modifiés non commités**. Si c'est le cas, arrête-toi et dis-le.
> **Autorisation de Grégoire** (24 oct., 18 h 38, mot pour mot : « Je t'autorise ») : modifier `js/config.js` pour les sous-onglets de l'Aide, avec les huit libellés du §2. Rien d'autre dans `config.js` ; `js/navigation.js` n'est pas touché (mesuré : il n'a aucune entrée pour l'Aide).

## Où on en est

- L'audit de l'Aide est fait et ses décisions rendues : `plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md` (lis-le en entier : méthode, décisions, tableau des 75 entrées). Le détail de chaque entrée, avec ses preuves : `lot-1-*.md` à `lot-7-*.md` du même dossier. Le plan : `plans de travail/PLAN-2026-10-24-refonte-de-l-aide.md`.
- ⚠ Les numéros de ligne du dossier sont ceux de `35745bd` : repère chaque entrée par son id (`accordeon-aide-…`).
- Ces fichiers ne sont pas encore commités : commite-les avec cette consigne, dans un commit de docs à part, avant ton lot.

## Le mandat : l'Aide prend sa nouvelle forme, sans encore réécrire ses textes

Ce lot coupe, range et retire. **Il ne resserre ni ne fusionne aucun texte** : c'est le travail des lots 2a à 2c. Aucun comportement de l'application ne change, sauf le libellé du mode anonymisé (§6, D6).

### 1. Inscrire

- Une fiche au BACKLOG pour le chantier (le prochain numéro libre après #1151) : « Refonte de l'Aide (audit du 24 oct.) », avec le chemin de l'audit et du plan. Remplace partout `#FICHE-AIDE` dans `AUDIT-AIDE-2026-10-24.md` par son numéro.
- La question de Grégoire sur les bornes du niveau RàI (64 % et 75 %, fixes, `js/interpretation-config.js:43-46` à `35745bd`) : une fiche à part, « en attente de Grégoire », sans code. Cherche d'abord si elle existe déjà.

### 2. Les sous-onglets de l'Aide (`js/config.js`, autorisé)

Remplace le tableau `'aide'` de `configurationsOnglets` par, dans cet ordre :

| id | label |
|---|---|
| `commencer` | Commencer |
| `cadre` | Cadre |
| `conception` | Conception |
| `evaluation` | Évaluation |
| `suivi` | Suivi |
| `labo` | Labo |
| `codex-archives` | Codex et archives |
| `reference` | Référence |

- Les `div.sous-section` de la section Aide prennent les ids `aide-commencer` … `aide-reference` (garde `aide-reference` : `js/accompagnement.js` l'écoute pour rendre le glossaire). `js/init-inline.js` (`reafficherToutesLesCartes`) retombe sur `aide-introduction` : remplace par `aide-commencer`.
- **Mesure d'abord** tout lecteur des six anciens ids (`aide-introduction`, `aide-configuration`, `aide-formation`, `aide-utilisation`, `aide-consultation`, `aide-reference`) dans `js/`, `index.html`, `styles.css` et `tests/`.
- Huit sous-onglets au lieu de six : regarde la barre à 768 et à 1024 px de large (capture). S'ils passent mal, ne redessine rien : dis-le dans la demande de relecture, avec la capture.

### 3. Couper quatorze entrées

`monitorage`, `srpnf`, `ssot`, `checklist`, `parcours`, `validation-grille`, `flux-travail`, `gerer-jetons`, `verification-hebdo`, `temps-estimes`, `presences-apercu`, `seuils-critiques`, `architecture`, `apropos` (toutes avec le préfixe `accordeon-aide-`).

Pour `apropos` seulement : une ligne à la fin de Référence, qui renvoie à Réglages › À propos. Lis d'abord ce que cet écran montre (`#reglages-a-propos`) et écris la ligne d'après lui, par exemple : « La version, la licence et les crédits de l'application sont dans Réglages › À propos. »

### 4. Ranger les 61 autres

Chaque sous-section a pour `h2` son libellé du §2, et contient ces entrées, dans cet ordre :

- **Commencer** : `presentation`, `prise-en-main`, `demo`, `modes`, `modes-formation`, `preferences`
- **Cadre** : `etapes-config`, `trimestre`, `groupe-cours`, `cours`, `horaire`, `groupe`, `etudiants`, `presences-calendrier`, `archivage`
- **Conception** : `pratique`, `creer-productions`, `lecons`, `creer-grilles`, `apporter-grille`, `bareme`, `sous-criteres`, `creer-echelles`, `solo`, `idme`, `creer-cartouches`
- **Évaluation** : `preparer-importer`, `annoter-evaluer`, `evaluer-productions`, `jetons-reprise`, `irrecevables`, `exporter-archiver`
- **Suivi** : `saisie-presences`, `tableau-bord`, `profil-etudiant`, `guide-profil`, `acp`, `diagnostics`, `rai`, `suivi-apprentissage`, `patterns`, `planifier-rai`, `rai-absences`, `snapshots`, `tirage-sort`
- **Labo** : `labo`, `modelisation`, `pan`, `grille-depistage`, `criteres`, `rai-solo`, `bilan-reflexif`
- **Codex et archives** : `codex`, `export-import`, `partage`, `collaboration`
- **Référence** : `glossaire`, `glossaire-statique`, `faq`, `problemes`, `ressources`, puis la ligne de renvoi du §3

Règles du rangement :

- Les ids des entrées ne changent pas. Les entrées voisines qui fusionneront au lot 2 (par ex. `modes` et `modes-formation`) restent deux entrées pour l'instant.
- Les titres perdent leur numéro de tête (« 1. », « 2c. », « 5b. », « 8. »…) ; le reste du titre ne change pas dans ce lot.
- Seule `presentation` reste ouverte par défaut (classe `ouvert`).
- Les paragraphes d'introduction des anciennes sous-sections (sous leurs `h2`) partent ; recopie leur texte dans la demande de relecture, au cas où une phrase n'existerait nulle part ailleurs.

### 5. Quatre retraits, sans rien réécrire

Mesure chaque passage au texte actuel, retire-le, et laisse à sa place un commentaire HTML daté qui dit pourquoi.

- **`groupe`** : la phrase sur l'ancienne colonne « CAF » dont les fichiers « restent lisibles ». L'import ne le fait pas (intention 2.92, non faite).
- **`rai-absences`** : la promesse que les présences suivent toute modification de l'intervention (intention 7.65, non faite). Le reste du mécanisme, faux aussi, se réécrit au lot 2b.
- **`bilan-reflexif`** : la partie « Importer les résultats », tant que #1054 n'est pas corrigée (l'import s'arrête sur `genId is not defined`, vérifié au code le 24 oct.).
- **`lecons`** : le geste « supprimer un bloc par la corbeille », tant que #1070 n'est pas corrigée.

### 6. Les décisions de mots de Grégoire (24 oct., 18 h 24)

- **D6, « Étudiant·e 1 »** : le mode anonymisé affiche « Étudiant·e N » au lieu de « Élève N » (`js/modes.js`, l. ~307-348), et les entrées `modes` et `modes-formation` le disent. ⚠ **Mesure d'abord le stock** : `modes.js` garde une table de pseudonymes et reconnaît « l'ancien format » à ce qu'un prénom ne commence pas par « Élève ». Si le nouveau libellé oblige à réécrire des tables déjà enregistrées chez les utilisateurs, **ne réécris rien** (écrire dans les données de quelqu'un remonte à Grégoire) : arrête-toi sur ce point, décris le stock et sa conséquence (les numéros changeraient-ils ?) dans la demande de relecture. Cowork le soumettra à Grégoire ; le reste du lot continue.
- **D7, l'encadré Loi 25** (`export-import`) : « les données de tes élèves » devient « les données de tes étudiant·es ». Rien d'autre ne change dans l'encadré ; `sentinelle-862-aide-loi-25` suit, en citant la décision.
- **D8, le courriel** : la FAQ (et toute autre entrée qui le fait) ne propose plus le courriel pour transférer le codex ; les autres moyens restent tels quels.
- **D9** : `temps-estimes` est coupée (§3).
- **D10, des noms manifestement fictifs** dans tous les exemples : le prénom de l'anecdote de la « séance fantôme » (`snapshots`) ; les trois noms complets de l'exemple d'attribution (`collaboration`) ; les deux noms de famille des noms de fichiers d'exemple de la popup `evaluations-annoter` (`js/accompagnement-contenu-popup.js`, l. ~509 et ~513). Par exemple : « Ada Exemple », « Bruno Modèle », « Chloé Essai » ; « Exemple_Ada_1234567.pdf ». Ne recopie jamais les anciens noms, ni dans un commit, ni dans un rapport.

### 7. Les tests

- Fais tourner les sentinelles de l'Aide avant de toucher (elles lisent toute la section ; le dossier d'audit les liste, notamment `sentinelle-audit-aide-lot-{A..E}-*`, `sentinelle-audit-aide-15-oct-*`, `sentinelle-803-*`, `sentinelle-862-*`, `sentinelle-878-*`, `sentinelle-893-*`, `sentinelle-1002-mots-clos`, `critere-algorithmique-mots`, `bareme-2-pieces-d-aide`, `sentinelle-aide-apporter-mon-materiel`, et les specs `materiel-aide-accompagnement`, `bareme-2-aide`, `critere-algorithmique-mots`, `aide-exporter-archiver-893`).
- Une assertion qui tombe parce qu'un texte est coupé ou déplacé par décision : adapte-la et cite, dans le test, l'audit et la décision du 24 oct. Une assertion qui tombe pour une autre raison : arrête-toi et dis-le. Deux cas connus : le titre « 5c. Les critères algorithmiques » est épinglé tel quel (il perd son numéro) ; `sentinelle-audit-aide-15-oct` exige au moins trois occurrences d'une phrase RàI, dont certaines sont dans des entrées coupées (compte ce qui reste ; si c'est moins de trois, abaisse le seuil en le justifiant). Profites-en pour fermer le faux vert relevé par l'audit : `sentinelle-audit-aide-lot-A` trouve « Régénérer » sur le bouton de la rétroaction, pas sur le calendrier.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-24-forme.test.js`, calculée des deux côtés, jamais recopiée : les huit sous-sections de l'Aide, dans l'ordre, ont les ids et les `h2` du tableau `'aide'` de `config.js` ; aucun des quatorze ids coupés n'existe ; aucun titre d'entrée ne commence par un chiffre ; les quatre passages du §5 sont absents (motifs mesurés au texte d'avant) ; aucun nom d'exemple d'avant ne reste. Break-test : chaque assertion rougit sous ablation, arbre restauré par sha256.
- **Un essai Playwright ciblé** (pas la suite complète) : la barre de l'Aide montre huit sous-onglets ; « Référence » rend le glossaire ; la recherche « codex » trouve des cartes et affiche le titre de leur sous-section.
- Vitest se lance depuis `tests/`. Bloc de jetons d'`index.html` à jour pour chaque fichier `js/` touché.

## Ce qui n'entre pas dans ce lot

Resserrer, fusionner, retirer la théorie, corriger une affirmation fausse (lots 2a à 2c) ; le glossaire unique (lot 3) ; les sept trous (lot 4) ; les textes d'écran hors de l'Aide (lot 5). Si tu vois en chemin une erreur dans un texte que tu déplaces, **laisse-la** : elle est au dossier d'audit, avec sa preuve.

## Clôture

- **Pas de release, ni verdict, ni push** : une release et un verdict par jour, au signal de Grégoire.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-24-aide-lot-1.md` (ce qui a changé, les sentinelles modifiées et pourquoi, les introductions retirées, le point D6 si tu t'y es arrêté, la capture des huit sous-onglets).
- Termine par le geste à vérifier à l'écran après la prochaine mise en ligne : ouvrir l'Aide ; huit sous-onglets nommés comme l'application ; « Référence » montre le glossaire ; chercher « codex » trouve le Codex et ses voisines.
