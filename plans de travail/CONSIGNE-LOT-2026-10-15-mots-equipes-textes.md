# Consigne de lot – les mots décidés (#821, #1017), les équipes (#1041), et les textes à faire relire

> Écrite par Cowork (la session qui tient les décisions avec Grégoire) le 15 octobre 2026 à 13 h 43 (Toronto, mesurée par `date`).
> Ce fichier ne remplace pas `CONSIGNE-DU-JOUR.md` (tenue par l'autre session Cowork) : n'y touche pas. Commite ce fichier avec ton lot.

## Où on en est

`main` à `bb7cc770` au moment de l'écriture : les lots du jour (groupes 1-2, matériel de départ, groupes 4-5) sont commités et relus, **non poussés**. **Remesure avant de toucher.** L'observation s'écrit sous `plans de travail/observation/` : n'y touche pas.

Les décisions sont dans `plans de travail/DECISIONS-2026-10-15-groupe-4.md` (question 3), `-groupe-6.md`, `-groupe-7.md`, `-groupe-8.md`, et `-groupe-5.md` (questions 4 et 5). Commite ceux qui ne le sont pas encore.

Pas dans ce lot : le calendrier (#378) et la réunion de deux grilles identiques (#291), chacun en son lot ; le plan de la note par cibles (#810), que Cowork écrit.

## Partie A – le code, sans Grégoire

### A1. #821 – des mots qui décrivent, pas qui jugent

Décision (groupe 4, question 3) : les mots adoptés par Grégoire à 11 h 38, **tels quels**. Tout est dans `js/contexte-qualification.js` (les quatre mécanismes), plus leurs lecteurs.
- **Mécanisme 2** (`interpreterAssiduite`, `interpreterCompletion`, cinq paliers, du plus régulier au moins régulier) : présence « Aucune absence ou presque » · « Absences rares » · « Quelques absences » · « Absences fréquentes » · « Absences très fréquentes » ; remise « Aucun travail manquant ou presque » · « Travaux manquants rares » · « Quelques travaux manquants » · « Travaux manquants fréquents » · « Travaux manquants très fréquents ». Les `description` qui jugent (« engagement soutenu », « situation d'urgence », « intervention nécessaire »…) ne sont pas réécrites par toi : retire-les, ou propose une phrase factuelle dans la partie B (elle sera relue).
- **Mécanismes 3 et 4** (contexte d'apprentissage, mobilisation) : plus de mot propre (« Très favorable », « Fragile », « Mobilisation fragile »…). Ils se disent par les deux descriptions du mécanisme 2 (« Absences rares, quelques travaux manquants »). « Décrochage », statut posé par l'enseignant, reste. Les recommandations attachées : liste-les dans la demande de relecture, sans les réécrire.
- **Mécanisme 1** (dégradé de l'Aperçu) : aucun mot.
- ⛔ **Aucune borne ne bouge** (gel d'octobre, #742 close) ; aucune couleur ne change ; rien ne sort vers les élèves (mesuré le 10 sept. : à remesurer).

### A2. #1017 – « archiver » ne sert plus qu'aux Archives

Décision (groupe 8, question 1). « Exporter et archiver » devient « Exporter les travaux » ; l'évaluation d'origine « archivée » après un jeton de reprise et « Garder en archive » deviennent « l'original » et « Garder l'original ». ⚠ **Zone protégée : autorisation de Grégoire (13 h 34) pour le libellé de `js/config.js` (~l. 77), et rien d'autre dans `config.js` ni `navigation.js`.** Remesure l'inventaire (grep « archiv » : `js/`, `index.html`, aides) ; les phrases s'accordent ; une phrase dont le sens change au-delà du mot remonte à Cowork. Aucune clé ni aucun champ renommé.

### A3. #1041 – les équipes dans un très petit groupe

Décision (groupe 6, question 1) : en mode « plus grandes », au plus une personne de plus par équipe ; sinon, une équipe plus petite, dite en une ligne (mots proposés dans la demande de relecture). Bancs : 7 en 4 → 4 et 3 ; 11 → 4, 4, 3 ; 10 → 5 et 5.

## Partie B – les textes à faire relire par Grégoire (aucun code)

Un seul fichier, `plans de travail/TEXTES-A-RELIRE-2026-10-15.md`, que Cowork lui soumettra sur une page. Pour chaque texte : où il s'affiche, le texte proposé, et pourquoi. Mots simples, tutoiement de l'application, guillemets français, pas de tiret cadratin.
1. **L'aide du Comparateur de pratiques** (#364, T3) : la fenêtre d'aide et les trois termes du glossaire (« comparateur de pratiques », « maquette (de pratique) », « dériver une maquette »). Lis le Comparateur pour dire vrai.
2. **L'aide de l'import d'un trimestre à l'autre** (#364, T4) : le terme, la fenêtre, les deux infobulles de « Tout importer » ; l'idée centrale : importer crée une copie locale, les originaux restent intacts.
3. **Les bulles de « Construction de la note »** (#18) : une par étape.
4. **L'encadré de l'épreuve uniforme dans le PDF de l'élève** (#668, lot 6, décision du groupe 2, question 3) : la mesure, la rangée des paliers, la phrase de cadrage, le service d'aide, le palier « zéro erreur ». Lis `evaluation-projection.js` (paliers, textes d'aujourd'hui) avant d'écrire.
5. **Les mots du bulletin d'une page** (#333, décision du groupe 2, question 5) : titres et libellés (pratique en vigueur, note finale, phrase de construction).
6. Les phrases factuelles de A1 et la ligne de A3, s'il y en a.
Les textes 4 et 5 sont lus par les élèves : écris-les pour un élève de cégep.

## Partie C – le BACKLOG

Les lignes « à poser » des fichiers de décisions, telles quelles, sous leur fiche, si elles n'y sont pas déjà : groupe 5 (#810, #33), groupe 6 (#1041, #837), groupe 7 (#781, #591, #840, #273, #2), groupe 8 (#1017, #364, #18), et #821 (groupe 4, si elle n'y est pas). Coche celles que les fichiers disent de cocher, et #821, #1017, #1041 si la partie A les achève.

## La méthode

Commit (A puis B), Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-mots-equipes-textes.md`. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Propose la ligne des Nouvelles pour A. Rapport court à Grégoire, en gestes d'utilisateur.
