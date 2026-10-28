# Textes – Les sept trous de l'Aide (lot 4 du plan, #1152)

> Proposés par Cowork, corrigés et validés par Grégoire le 28 oct. 2026, un trou à la fois. **À intégrer mot pour mot** par Claude Code (consigne du lot 4, à venir). Chaque texte est mesuré au code avant d'être proposé ; les preuves sont à côté.
> Déjà comblés par les lots 2 (aucun texte ici) : le panneau « Détails » (trou 4, `tableau-bord`, mots validés le 28 oct. à 12 h 07) ; les archives de fin de trimestre (trou 7, `codex` et le glossaire : Archive, Faire revenir, Trimestre clos).

## Trou 3 – Les présences (`saisie-presences`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 22** (« oui, c'est bon »), après deux corrections de sa part (« par défaut, tous présents » ; « sans fiche » mal compris). Remplace, dans l'entrée, les deux phrases sur « Mettre tout le monde présent », « Verrouiller la saisie » et « Confirmer la séance » qui disaient la même chose ; les autres phrases de l'entrée restent.

> Par défaut, tous les étudiant·es sont présent·es. S'il y a des absences, saisis-les à la main : la séance s'enregistre dès ton premier changement. Si personne n'est absent, « Confirmer la séance » l'enregistre telle quelle. « Verrouiller la saisie » la fige. Dans une séance déjà enregistrée, un·e étudiant·e dont la présence n'y figure pas (ajouté·e au groupe après coup, par exemple) compte absent·e, et sa ligne l'indique : « Non saisi·e : compté·e absent·e ».

Preuves : `js/saisie-presences.js:1531-1534` (présent par défaut), `:916-935` (le premier geste écrit les lignes non touchées ; une ligne sans fiche dans une séance saisie compte absente), `:850-858` (le verrou enregistre la séance), `:1161` (« Confirmer la séance »), `:944` (la mention). « ajouté·e au groupe après coup » : inféré, d'où « par exemple ».

## Trou 1 – Supprimer (`codex`, paragraphe « Avant une suppression »)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 23** (« on garde »). **Remplace** le paragraphe « Avant une suppression » de l'entrée `codex` (lot 2d).

> **Avant une suppression.** Avant d'effacer quelque chose pour de bon (une grille, une échelle, une cartouche, un cours, un critère déjà évalué…), l'application te propose de mettre ton codex à jour s'il ne l'est pas : « Mettre à jour, puis supprimer », « Supprimer sans mettre à jour » ou « Annuler ». Supprimer un trimestre, un groupe-cours ou des étudiant·es, ou tout réinitialiser, commence plutôt par « Écrire le codex à part » : un autre fichier, sous un autre nom, que tes prochaines mises à jour ne touchent pas. Si tu annules, rien n'est supprimé. Pour un trimestre, tu dois en plus retaper son nom, et le trimestre actif ne se supprime pas. Un cours qui porte encore des données ne se supprime pas : l'application te dit ce qui s'y rattache.

Preuves : `js/codex.js` (`proposerCodexAvantSuppression`, le registre `PROPOSITIONS_AVANT_SUPPRESSION`, ~l. 4560-4610 : rien ne s'affiche si le codex est à jour ; sans codex, les boutons disent « Écrire un codex, puis supprimer » et « Supprimer sans codex ») ; `ecrireAPartAvantSuppression` appelé par `js/trimestre-v2-liste.js:313`, `js/trimestre-v2-groupes-cours.js:971`, `js/trimestre-v2-etudiants.js:1530`, `js/import-export.js:2093` ; le nom à retaper : `js/trimestre-v2-liste.js:328-335` (le groupe-cours n'a qu'une confirmation, `js/trimestre-v2-groupes-cours.js:~996`) ; le trimestre actif : `js/trimestre-v2-liste.js:302-308` ; le cours qui porte des données : `js/cours.js:491-516`. Le trou 1 du dossier disait « le nom à ressaisir pour un groupe ou un trimestre » : mesuré, le trimestre seulement.

## Trou 5 – Les rencontres (entrée neuve, `rencontres`, dans le Suivi entre `planifier-rai` et `tirage-sort`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 25** (« on garde »). Les libellés « élèves » sont ceux des écrans du service (`js/rencontres.js`), gardés.

> **Les rencontres d'un service d'orthopédagogie**
> Navigation : Suivi → Rencontres, ou « Tu es orthopédagogue ? » sur la page d'accueil
>
> Les rencontres se tiennent dans un service d'orthopédagogie : dans Cadre, un cours de nature « Orthopédagogie », sans code ni horaire. Pour en créer un, l'écran pose trois questions : les dates de ton trimestre (s'il n'en existe pas encore), le nom du service et la liste de tes élèves, une ligne par élève (« Prénom Nom », « DA ; Nom ; Prénom », ou la liste Omnivox collée telle quelle). Une ligne sans DA reçoit un numéro provisoire qui commence par 9. « Créer mon service d'orthopédagogie » crée le tout, visible dans Cadre.
>
> Quand le service est actif, l'onglet liste ses rencontres : « + Nouvelle rencontre », les présences et tes observations pour chaque élève, puis le « Bilan de la rencontre ». Sur un groupe-cours ordinaire, l'onglet propose plutôt de créer un service ou d'activer celui du trimestre.

Preuves : `js/rencontres.js:1-25` (les trois questions, la porte, la liste), `:115-191` (les mots de l'écran : « Début : », « Fin : », « Nom du service », « Tes élèves », « Créer mon service d'orthopédagogie »), `:207-212` (le DA provisoire en « 9 »), `js/mots-nature.js:60-63` (« Orthopédagogie », « service d'orthopédagogie ») ; `js/interventions.js:131-156` (« + Nouvelle rencontre », « Bilan de la rencontre », l'aide des présences) ; `js/accueil.js:79, 178-182` (« Tu es orthopédagogue ? »). À mesurer à l'intégration : le libellé exact du bouton (« Créer mon ${mots.objetLong} » rend « Créer mon service d'orthopédagogie », apostrophe typographique de `mots-nature.js`).

## Trou 6 – Ce qui sort de l'application (entrée neuve, `ce-qui-sort`, dans Codex et archives, après `export-import`)

✅ **Validé par Grégoire le 28 oct. 2026 à 14 h 27** (« on garde »).

> **Ce qui sort de l'application**
>
> Rien ne quitte ton appareil sans un geste de ta part. En plus du codex et des archives, trois gestes font sortir des données.
>
> « Exporter la synthèse (CSV) », dans Suivi › Suivi du groupe, carte « Résultats finaux » : une ligne par étudiant·e du groupe-cours actif (DA, nom, groupe, pratique, note finale arrondie à l'entier), pour reporter les notes dans Léa. Le fichier est nominatif : garde-le sur ton appareil.
>
> « Générer l'export anonymisé », dans Réglages › Données, pour la recherche en éducation : deux fichiers. Le premier ne porte ni nom ni DA ; chaque DA y devient un code tiré d'une clé secrète. Le second, la table de correspondance (« …_PRIVE_… »), garde cette clé et le DA de chaque code : il est nominatif et ne se partage pas. Chaque export tire une nouvelle clé.
>
> « Signaler un bug ou donner ton avis », dans l'en-tête : le rapport contient ta description, ton prénom, la version, ton navigateur, la section ouverte, des comptes (étudiant·es, productions, évaluations), l'état du stockage et tes 20 derniers gestes, sans le texte de ce que tu as cliqué. Tu le relis avant de l'envoyer par courriel, de le copier ou de le télécharger.

Preuves : `index.html:7568-7585` (carte « Résultats finaux », « Exporter la synthèse (CSV) ») et `js/export-resultats-finaux.js:66-77` (colonnes, note arrondie à l'entier « pour reporter les notes dans Léa », #723) ; `index.html:9594-9605` (« Générer l'export anonymisé ») et `js/trimestres.js:1904-1960` (clé tirée à chaque export, `anonymiserDA` : SHA-256 tronqué), `:2330-2362` (les deux fichiers, `…_anonyme_….json` et `table_correspondance_…_PRIVE_….json`) ; `js/rapport-bug.js:375-413` (#1075 point 10 : l'élément cliqué, jamais son texte), `:464-593, 647-730` (le contenu), `:1010, 1091, 1122, 1192-1240` (copier, télécharger, courriel). **À mesurer à l'intégration** : le bouton d'en-tête porte `title="Signaler un bug ou donner ton avis"` ; « Chaque export tire une nouvelle clé » suppose que le dispatcher ne passe pas de `cleSecrete` (vérifié à la lecture, `data-action="exporterFormatRecherche"` sans paramètre).
