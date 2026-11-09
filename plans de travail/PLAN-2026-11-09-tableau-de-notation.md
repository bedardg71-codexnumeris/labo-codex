# Tableau de notation : plan (9 nov. 2026)

> Écrit par Cowork le 9 nov. 2026, après la troisième rencontre de la CoP. Les constats « mesurés » l'ont été ce jour-là dans le dépôt (commits `8d43b86f` puis `6c8dd5bc5`) ; ce qui est inféré est dit comme tel. Ébauches : le canevas « Labo Codex – Le tableau de notation » (sept planches : les deux chemins, puis les cinq écrans de l'entrée directe) ; les deux tableaux sont aussi dans `plans de travail/EBAUCHE-2026-11-09-tableau-*.dc.html`. Consigne du premier lot : `plans de travail/CONSIGNE-LOT-2026-11-09-tableau-de-notation-1.md`.

## Pourquoi

À la rencontre de la CoP du 9 nov., un besoin est ressorti : une entrée légère dans Labo Codex, centrée sur la gestion de la pratique alternative de notation, sans avoir à monter grille, critères, échelle et productions.

Le principe retenu : **récupérer ce qui existe déjà dans Labo Codex et le simplifier**, pour qu'un enseignant arrive directement à sa pratique de notation, sans le parcours qui la précède aujourd'hui. Le tableau est aussi un pont avec les utilisateurs d'Excel et de Numbers : c'est là que sont les enseignants.

**Le chemin complet ne change pas.** On découple le parcours de la notation alternative pour qu'on puisse s'y insérer sans passer par les étapes précédentes (Grégoire, 9 nov.).

**Le principe général** (Grégoire, 9 nov.) : rendre l'utilisation de Labo Codex plus modulaire ; les utilisateurs se servent de l'application « à la carte ». Le tableau de notation en est la première application.

## Le parcours visé (l'entrée directe)

1. **Ta classe** : coller sa liste d'élèves (DA, nom, prénom).
2. **Ta pratique** : choisir un modèle, parmi ceux de l'assistant.
3. **Ta structure** : la règle qui construit la note (la carte « Structure des évaluations » de la fiche).
4. **Tes résultats** : le tableau, élèves en lignes, productions en colonnes.
5. **Ta note chiffrée** : arrêter les notes (« Notes finalisées »), puis l'export CSV. Point d'arrivée ; la synthèse que lit l'étudiant·e devient facultative.

Plus tard : importer des résultats depuis un CSV (Excel, Numbers), les traiter, les renvoyer.

## Décisions de Grégoire (9 nov.)

- **Un tableau, pas le formulaire un élève à la fois.** Pour reporter trente résultats évalués ailleurs, le formulaire actuel est trop lent.
- **Ce qu'on saisit suit la pratique.** Standards : un niveau de l'échelle. Spécifications : acceptable ou non acceptable. Pas de pourcentage.
- **Les réglages de la pratique restent la règle commune**, appliquée à tous de la même façon (retenir les meilleures, les plus récentes, un mélange des deux, des productions obligatoires). Des ajustements manuels, par l'enseignant ou par l'élève, pourront venir plus tard.
- **Le cadre du trimestre se réduit à la liste des élèves.** Ni horaire, ni congés, ni nom de groupe exigé. Il faut pouvoir gérer plusieurs groupes.
- **Deux groupes d'un même cours partagent les productions** (même plan de cours). Une production propre à un seul groupe est un cas rare.
- **Le point d'arrivée est la note chiffrée**, pas la synthèse.
- **Le chemin complet reste**, intact.

## Ce que dit le code (mesuré)

- **Le calcul de la note.** En standards, il part d'un résultat par élève et par production, et retient selon les réglages (meilleures, plus récentes, un mélange, toutes ; un nombre N ; une production terminale). En spécifications, une production est acceptable quand sa note atteint le seuil ; la note vient du forfait atteint, ou d'un palier d'échec. La dénotation (note finale saisie par l'enseignant) existe aussi.
- **Le verrou.** Une évaluation ne s'enregistre pas sans grille : la sauvegarde refuse sans grille choisie. C'est la seule pièce qui empêche aujourd'hui de gérer sa PAN sans grille.
- **L'échelle.** Une échelle de départ IDME est créée d'office dans chaque trimestre, modifiable : PS 0, I 40, D 65, M 75, E 100.
- **Le groupe-cours.** La pratique y est rattachée. Son formulaire exige cinq choses : trimestre, cours, groupe d'élèves, horaire (sauf pour un service), enseignant (prénom, nom, courriel, établissement).
- **La liste d'élèves.** L'import d'un fichier et la liste collée existent. **Chaque étudiant·e exige un DA à sept chiffres** ; l'application n'en invente aucun (règle de Grégoire, 19 sept.).
- **Les productions par groupe.** Une production peut déjà être assignée à un groupe et pas à l'autre : le cas rare est couvert.
- **L'export.** L'export CSV des résultats finaux existe (onze colonnes, une ligne par élève, la note arrondie à l'entier, un statut ; protégé contre les formules malveillantes dans le tableur).
- **Le neuvième parcours** (« Mettre en place ta notation alternative ») n'est pas encore dans le code : seule sa consigne existe.

**Inféré, à confirmer par Claude Code avec un test :** le calcul de la note des deux pratiques ne lit ni l'horaire, ni l'enseignant, ni les dates du trimestre (aucune trace dans les fichiers de calcul). Ces exigences viendraient seulement du formulaire.

## Ce qu'il reste à construire

1. **Une évaluation qui porte un résultat sans grille.** Elle doit être tolérée par tous les lecteurs d'évaluations (PDF de synthèse, profil, liste des évaluations, suivi). Elle voyage dans le codex : la rétrocompatibilité compte.
2. **Le tableau lui-même**, d'après les ébauches.
3. **Une création allégée du groupe** : trimestre, cours et groupe-cours créés en coulisse ; horaire et enseignant facultatifs dans cette voie ; la pratique appliquée d'office.
4. **Une seconde porte au neuvième parcours** : entrée sur une liste (plus besoin d'une production et de sa grille), « L'appliquer à ton cours » sautée, « Évaluer une production » remplacée par le tableau, arrivée sur la note chiffrée.
5. **Plus tard, l'import CSV des résultats.**

## Ordre des lots (décidé par Cowork)

1. **L'évaluation sans grille et le tableau**, sur un groupe-cours existant (session du cloud). C'est là qu'est le verrou, et c'est le geste qui donne sa valeur à tout le reste ; il sert aussi aux utilisateurs actuels.
2. **L'entrée allégée** : nommer le groupe, coller la liste, choisir la pratique, arriver au tableau ; « + Production » depuis le tableau ; la seconde porte du neuvième parcours.
3. **L'import CSV des résultats.**

Le neuvième parcours part tel quel, selon sa consigne : il accompagne le chemin complet, qui reste.

Supposé : un enseignant qui arrive par le tableau pourra plus tard ajouter des grilles et des productions complètes au même groupe, sans rien perdre. Le tableau mène à l'application complète ; il n'en est pas coupé.

## Décidé par Cowork

- **Où vit le tableau** : dans Évaluation › Liste, comme une seconde vue des mêmes évaluations. Aucune entrée de navigation neuve, donc rien dans les zones protégées (`config.js`, `navigation.js`).
- **Une évaluation faite avec une grille** s'affiche au tableau mais ne s'y modifie pas : la toucher ouvre l'évaluation.

## Ce que le résultat sans grille ne donnera pas

Sans critères, pas de forces ni de défis par critère, pas de rétroaction par critère, pas de dépistage par critère. Le suivi qui lit la performance globale continuera de fonctionner. À dire clairement à l'enseignant qui choisit cette voie.

## Points encore ouverts

- **Les mots de l'écran** (le nom de la vue, les libellés, l'aide, les bulles d'assistance) : à faire valider par Grégoire.
- **En spécifications, le seuil d'acceptabilité** : proposé, pas de seuil dans cette voie, puisqu'on juge chaque production acceptable ou non.
- **La dénotation** : sa place dans le tableau n'est pas réglée.
- **Ajustements manuels** des productions retenues : plus tard, s'il en est besoin.
