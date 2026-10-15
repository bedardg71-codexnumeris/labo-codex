# Décisions du 15 octobre 2026 – groupe 7 (partager avec un collègue, et ce qui l'engage publiquement)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 13 h 33 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 7.

## Question 1 (#781) – purger l'historique du dépôt – décidée par Grégoire à 13 h 27 : « on la fait après le groupe 8 »

- **Décision** : la purge se fait aujourd'hui, après la fin du tri (groupe 8), dans une séance dédiée, selon `plans de travail/CHANTIER-historique-git-donnees-personnelles.md` § 0 (cinq arrêts durs, douze gestes), sur un clone complet sur son Mac (pas un conteneur cloud).
- **Préalables à réunir à ce moment-là** : aucune autre session n'écrit dans le dépôt (Claude Code a fini et poussé son lot, la session d'observation est en pause) ; la liste des noms (DA ⇥ Nom ⇥ Prénom) fournie par Grégoire HORS du dépôt ; les quatre décisions en attente de la porte du 7 sept. (`PORTES-TERRAIN-2026-09-07-purge-historique.md`) ; le bundle de sauvegarde sur son Mac ; son signal explicite, dans la séance, avant le `push --force`.
- Les branches non fusionnées seront perdues : 65 acceptées le 7 sept., 67 mesurées le 15 oct. (`git branch -r --no-merged origin/main`).
- Dépôt privé (vérifié le 7 sept.) : le risque est confiné, rien ne se bâcle.

### Déplacée à 13 h 37 : demain matin, 16 octobre

- **Motif (Cowork)** : la purge réécrit tout l'historique et l'envoie d'un coup (`push --force`) ; faite aujourd'hui, elle publierait les lots du jour avant le verdict complet du soir, contre la règle « commit → relecture → verdict → push ». **Accepté par Grégoire (« ok ») : demain matin, après la version du soir, avant toute autre session.**
- Grégoire : « Les listes sont déjà prêtes. » (le fichier DA ⇥ Nom ⇥ Prénom, hors du dépôt).
- **Son but, dit à 13 h 37** : « Cette opération devrait permettre d'ouvrir le dépôt au public à nouveau. »
- ⚠ **Ce que Cowork a vérifié (doc GitHub, 15 oct.)** : après une réécriture et un `push --force`, les anciens commits restent joignables sur GitHub par les références des pull requests (`refs/pull/*`, en lecture seule, que le `push --force` ne peut pas modifier) et par les vues en cache (accès par SHA). Seul le support GitHub peut les retirer (il supprime les PR touchées, lance le ramasse-miettes, efface les vues en cache). La doc ne parle ni de rendre public un dépôt privé ensuite, ni de créer un nouveau dépôt. ⮕ La purge est nécessaire, pas suffisante, pour rendre CE dépôt public.

- **Décision de Grégoire à 13 h 40 : la seconde voie.** Après la purge, un NOUVEAU dépôt public est créé à partir de l'historique purgé ; l'ancien dépôt reste privé (ses références de PR et ses vues en cache n'y sont jamais exposées). Technique (Claude Code) : rebrancher Netlify sur le nouveau dépôt, changer l'adresse des copies de travail. Avant de le rendre public : relire les fichiers actuels pour d'autres renseignements personnels (noms de collègues, de testeurs, dossiers de retours encore suivis).
- **Idée de Grégoire à 13 h 40** : en profiter pour passer de app.codexnumeris.org à app.labocodex.org. ⚠ Cowork : c'est une décision à part, sans lien technique avec le dépôt. Le navigateur range les données de chaque utilisateur par ADRESSE (origine) : sur une nouvelle adresse, l'application s'ouvre VIDE pour tout le monde. Il faudrait un passage par le codex (mettre à jour son codex sur l'ancienne adresse, l'ouvrir sur la nouvelle) et garder l'ancienne adresse en service un temps. **Décision de Grégoire à 13 h 42 : pour plus tard, comme chantier à part, peut-être pour une version 2.0 vers juin 2027** (entre l'hiver et l'automne, quand les collègues ont le moins à perdre). Rien n'est lié à la purge.

**Ligne à poser sous #781 :** `**15 oct. 2026, décision de Grégoire (13 h 27) : la purge se fait le 16 oct. au matin, après la version du 15 au soir**, en séance dédiée, selon le § 0 du chantier. 67 branches non fusionnées (65 acceptées le 7 sept.). Détail : plans de travail/DECISIONS-2026-10-15-groupe-7.md.`

## Question 2 (#591) – la question Loi 25 à son cégep – décidée par Grégoire à 13 h 29 : « le texte est bon »

- **Décision** : Grégoire écrit aux responsables de la Loi 25 de son cégep ; sa position du 28 août (pseudonymisation réversible, table chiffrée sur sa machine) reste une hypothèse ; **rien ne se code avant leur réponse**.
- Le courriel, accepté tel quel, est noté dans la page du tri (section « Les décisions qui t'attendent », groupe 7) pour qu'il ne l'oublie pas. (Apple Notes refusé par macOS : envoi d'événements Apple non autorisé.)

> **Objet : Pseudonymisation de données d'élèves dans un outil d'enseignement**
>
> Bonjour,
>
> Je développe Labo Codex, une application qui m'aide à suivre mes élèves (présences, remises, résultats). Des collègues de la communauté de pratique de l'AQPC commencent à l'utiliser. Les données restent dans le navigateur de l'enseignant ; aucun serveur ne les reçoit.
>
> Je prévois de remplacer les noms des élèves par des codes (« Étudiant-007 ») dans ce qui sort de l'application, par exemple pour montrer un exemple à un collègue. La table qui relie chaque code au vrai nom resterait chiffrée sur ma machine, et moi seul pourrais m'en servir, pour retrouver un élève et corriger une erreur.
>
> Cette façon de faire est-elle acceptable au regard de la Loi 25 ? Sinon, quelles conditions faudrait-il respecter : où garder la table, comment la protéger, et que devient un fichier ainsi codé quand il est transmis à quelqu'un d'autre ?
>
> Merci,
> Grégoire

**Ligne à poser sous #591 :** `**15 oct. 2026 : Grégoire écrit aux responsables de la Loi 25 de son cégep** (texte accepté à 13 h 29, dans plans de travail/DECISIONS-2026-10-15-groupe-7.md) ; sa position du 28 août reste une hypothèse ; rien ne se code avant leur réponse.`

## Question 3 (#840) – retrouver le matériel d'orthopédagogie dans le partage – décidée par Grégoire à 13 h 31 : « oui », un second repère, la nature

- **Décision** : l'orthopédagogie n'entre pas dans la liste des disciplines (registre du collégial, commun à tous). Le matériel partagé porte un second repère, sa **nature** (enseignement / orthopédagogie), à côté de la discipline ; on cherche par l'un ou par l'autre. L'orthopédagogue coche aussi les vraies disciplines de ses élèves (le partage en accepte déjà plusieurs, `js/cc-license.js` ~1445).
- Quand : dans le chantier du partage, après le mois d'usage de l'orthopédagogue. À noter au cadrage : une grille ou une échelle créée dans un service naît sans discipline (`js/grilles.js` ~714, `js/echelles.js` ~4683).

**Ligne à poser sous #840 :** `**Décidé par Grégoire le 15 oct. 2026 à 13 h 31 : un second repère, la nature** (enseignement / orthopédagogie), à côté de la discipline ; l'orthopédagogie n'entre pas dans la liste des disciplines. Au chantier du partage. Détail : plans de travail/DECISIONS-2026-10-15-groupe-7.md.`

## Question 4 (#273) – de vraies copies d'élèves dans la démo – décidée par Grégoire à 13 h 32 : « on ferme »

- **Décision** : la fiche se ferme. Sa décision du 5 oct. y répond autrement : un pack à part de trente travaux aux noms, DA et fichiers fictifs, pour ses présentations, jamais intégré à l'application ni au dépôt ; le pack démo livré reste tel quel. Aucune vraie copie d'élève ne circule (règle du 22 sept.).

**Ligne à poser sous #273, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (13 h 32) :** remplacée par sa décision du 5 oct. (pack à part de trente travaux fictifs, hors de l'application et du dépôt) ; aucune vraie copie d'élève n'entre dans la démo. Détail : plans de travail/DECISIONS-2026-10-15-groupe-7.md.`

## Question 5 (#2) – un guide papier pour les utilisateurs – décidée par Grégoire à 13 h 33 : « on ferme »

- **Décision** : ni guide papier, ni fiche à imprimer comme tâche de développement. La CoP est faite de rencontres informelles (pas une formation) ; Grégoire y arrive avec une note par rencontre (dossier de la CoP) ; le guide qu'on donne à une IA pour se faire accompagner dans l'application (« skill d'accompagnement », objectif d'automne) couvre l'accompagnement.

**Ligne à poser sous #2, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (13 h 33) :** pas de guide papier ; ses notes de rencontre de la CoP et le guide d'accompagnement pour une IA en tiennent lieu. Détail : plans de travail/DECISIONS-2026-10-15-groupe-7.md.`

### Avancée à 16 h 35 : la purge se fait CE SOIR, après la version du soir

- **Décision de Grégoire (16 h 34)** : « Nous allons faire la purge ce soir », parce que demain s'ouvre un nouveau chantier (un nouveau sous-onglet de Conception).
- **Ce qui ne change pas (Cowork)** : l'ordre « commit → relecture → verdict → push » ; la purge vient APRÈS la version du soir (verdict complet vert, push, envoi en ligne constaté), dans une séance dédiée de Claude Code, selon le § 0 du chantier (cinq arrêts durs, questions à reposer avant de déclencher), aucune autre session n'écrivant dans le dépôt (la session d'observation dans le nuage en pause, tout poussé). La liste des noms est hors du dépôt : `/Users/kuekatsheu/Documents/Cowork H26 App Labo Codex/purge-identites/`.
