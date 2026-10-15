# Décisions du 15 octobre 2026 – groupe 8 (découvrir l'application et trouver de l'aide)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 13 h 36 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 8.
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le lot qui exécute la décision.

## Question 1 (#1017) – les deux autres sens du mot « archiver » – décidée par Grégoire à 13 h 34 : « oui »

- **Décision** : « archiver » ne sert plus qu'aux Archives (dépôt d'un trimestre). 
  - « Exporter et archiver » (Travaux : copies en PDF, évaluations en JSON ; ~23 textes, inventaire du 30 sept. remesuré le 4 oct.) devient **« Exporter les travaux »**.
  - L'évaluation d'origine « archivée » après un jeton de reprise, et « Garder en archive » dans la pratique (~9 textes), deviennent **« Garder l'original »** (et « l'original » pour l'évaluation gardée).
- **Zone protégée : autorisation de Grégoire, du même « oui »** (13 h 34) : modifier le libellé de `js/config.js` (~l. 77). Rien d'autre dans `config.js` ni `navigation.js`.
- Au lot : remesurer l'inventaire (grep « archiv » dans `js/`, `index.html`, aides) ; les phrases qui contiennent ces mots s'accordent (« l'évaluation archivée » → « l'original ») ; toute phrase dont le sens change au-delà du mot remonte à Cowork. Rien dans les données (ni clé, ni champ renommé) : seuls les mots d'écran.

**Ligne à poser sous #1017, et cocher quand c'est fait :** `**Décidé par Grégoire le 15 oct. 2026 à 13 h 34 : « Exporter les travaux » et « Garder l'original » ;** « archiver » ne sert plus qu'aux Archives. Autorisation donnée pour le libellé de js/config.js. Détail : plans de travail/DECISIONS-2026-10-15-groupe-8.md.`

## Questions 2 et 3 (#364, #18) – de l'aide là où il n'y en a pas – décidées par Grégoire à 13 h 35 : « oui »

- **Décision** : Claude Code rédige l'aide manquante de trois endroits ; Cowork la soumet à Grégoire sur une seule page (environ 15 min de relecture) ; ses corrections faites, l'aide est posée et les deux fiches se ferment.
  1. Le Comparateur de pratiques (aucune aide aujourd'hui) : fenêtre d'aide, termes du glossaire (« comparateur de pratiques », « maquette (de pratique) », « dériver une maquette »), bouton d'aide. ⚠ Piège connu (#364, T3) : `rendreComparateur()` réécrit tout son `innerHTML` ; le bouton s'injecte au rendu, pas dans le HTML statique.
  2. L'import d'un trimestre à l'autre : le terme `namespacing-prefixe-trimestre` dit en mots d'usager « importer crée une copie locale ; les originaux restent intacts », plus une fenêtre dédiée et deux infobulles sur « Tout importer » (grilles, pratiques) (#364, T4).
  3. La « Construction de la note » : des bulles courtes, une par étape (#18). La section Aide sort de la fiche (des bulles y seraient sans objet).
- Les mots sont lus par les collègues : rien n'est posé avant la relecture de Grégoire. Le premier livrable est un fichier de textes proposés, pas du code.

**Ligne à poser sous #364 :** `**Décidé par Grégoire le 15 oct. 2026 à 13 h 35 :** l'aide du Comparateur et de l'import d'un trimestre à l'autre est rédigée, soumise à sa relecture sur une page, puis posée ; la fiche se ferme ensuite. Détail : plans de travail/DECISIONS-2026-10-15-groupe-8.md.`

**Ligne à poser sous #18 :** `**Décidé par Grégoire le 15 oct. 2026 à 13 h 35 :** les bulles de « Construction de la note » sont rédigées, relues par lui avec celles de #364, puis posées ; la section Aide sort de la fiche ; la fiche se ferme ensuite. Détail : plans de travail/DECISIONS-2026-10-15-groupe-8.md.`
