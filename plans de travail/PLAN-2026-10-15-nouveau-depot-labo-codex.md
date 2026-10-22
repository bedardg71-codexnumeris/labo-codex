# Plan : un nouveau dépôt « labo-codex » à partir de l'historique purgé

> Écrit par Cowork le 15 octobre 2026 à 21 h 20 (Toronto, mesuré par `date`), à la demande de Grégoire. Ce fichier ne contient aucun nom d'élève ni de collègue, et doit rester ainsi : il ira dans le dépôt public. Au moment de l'écriture, il est **non suivi** dans l'ancien dossier ; il suit la bascule (phase B, étape 3).

## Pour la page du tri

Chantier « Un dépôt public sans données personnelles ». Cinq gestes, dans l'ordre :

1. **L'historique est purgé et vérifié.** Fait le 16 octobre au matin (17 vérifications sur 17, chacune avec son témoin).
2. **Je travaille dans le nouveau dépôt `labo-codex`, et l'application se met en ligne depuis lui.** Fait le 16 octobre à 8 h 02. La sauvegarde complète est copiée par Grégoire sur le disque externe « CODEX USB » et relue vers 8 h 20.
3. **Netlify ne publie plus que l'application, pas les documents de travail.** Fait le 16 octobre : efffe795 poussé par Claude Code, en production à 8 h 39 (déploiement 6ad21ae5, 1.202.0), sans verdict Playwright (décision de Cowork : le commit ne touche pas l'application). Vérifié par Cowork vers 8 h 52 dans le Chrome de Grégoire : les 214 fichiers qu'`index.html` appelle répondent 200 ; `DEPLOY.md`, `CLAUDE.md`, `BACKLOG.md`, `README.md`, `netlify.toml`, `design-system.html`, `OU-EN-EST-ON.md`, un plan, un script, `tests/`, `docs/` et `.claude-plugin/` répondent 404 ; l'adresse `codexnumeris-051225.netlify.app` renvoie vers app.codexnumeris.org. Le scan de secrets de Netlify sur ce déploiement : 0 trouvaille. Cloudflare Access vérifié par Grégoire à 8 h 54 dans une fenêtre de navigation privée : l'adresse courriel et le code sont demandés, puis l'application s'ouvre en 1.202.0.
4. **Le dépôt est public.** Fait le 16 octobre vers 14 h 10, par Grégoire. Vérifié par Cowork depuis l'extérieur (lecture anonyme) : la page de `labo-codex` répond, « Public », licence AGPL-3.0 reconnue, branche `main`.
5. **Les anciennes copies ont disparu : l'ancien dépôt n'est plus sur GitHub, l'ancien site n'est plus chez Netlify.** Vers le 30 octobre 2026.

## État au 16 octobre 2026, 8 h 05 (mesuré par Cowork et Claude Code)

- **Purge** : rejouée sur une copie neuve après un premier passage qui laissait quatre formes de paires ; 17 vérifications sur 17. L'adresse courriel d'auteur des commits est remplacée par l'adresse anonyme de GitHub (décision de Grégoire, 16 oct. vers 7 h), pour qu'elle ne soit pas lisible une fois le dépôt public.
- **Sauvegarde complète de l'ancien dépôt** : `~/purge-travail/sauvegarde-monitorage-2026-10-16.bundle`, vérifiée. Copiée par Grégoire sur le disque externe « CODEX USB » (copie, l'original reste sur le Mac) ; la copie du disque relue par Cowork le 16 vers 8 h 20 : `git bundle verify` répond « is okay », puis un clone miroir et `git fsck --full` sans erreur (6 511 commits, 293 références, 157 499 624 octets). Le clone temporaire a été effacé aussitôt. Non fait : la comparaison octet par octet avec l'original du Mac (pas d'accès à `~/purge-travail`).
- **labo-codex** : privé, `main` et les 22 étiquettes. Le dossier de travail habituel en est un clone ; l'ancien dossier s'appelle `Monitorage_v6-ancien`. Le dossier de travail est renommé `~/Documents/GitHub/labo-codex` par Grégoire le 16 vers 8 h 27, pour éviter la confusion ; mesuré par Cowork à 8 h 29 : le dépôt s'y ouvre, `origin` pointe vers `labo-codex`, les crochets suivent (`core.hooksPath`), rien dans le code ni les tests ne dépend de l'ancien nom. Les sessions de Claude Code s'ouvrent désormais depuis ce chemin.
- **Netlify** : l'ancien site est relié à `labo-codex` ; la production est construite depuis a3a0de0e (déploiement 6ad2124d, 8 h 02).
- **Trouvé en chemin** : Netlify publiait la racine entière du dépôt, documents compris, et les aperçus de pull requests (hors de Cloudflare Access, adresse devinable) gardaient chacun une copie complète du dépôt de leur époque. La purge de Git n'y touchait pas.
- **Fermé** : la protection par mot de passe des déploiements hors production est active (posée par Cowork avec le connecteur Netlify, le 16 oct. vers 7 h 40). Vérifié par curl à 8 h 03 : les aperçus et les anciens permaliens, dont celui de la production du 15 octobre, répondent 401.
- **Fermé le 16 à 8 h 39** : les documents de travail ne sont plus servis, ni par le domaine ni par le permalien de la production courante (liste blanche, geste 3). Reste, assumé : le permalien de la production courante sert l'application hors de Cloudflare Access (adresse longue, non devinée) ; il disparaîtra avec l'ancien site (phase D).
- **Seconde réécriture et dépôt recréé (16 oct.)** : balayage de la phase C (trois fuites de noms de collègues, l'adresse Gmail), décision de Grégoire à 9 h 19 ; réécriture vérifiée (`RAPPORT-2026-10-16-reecriture-noms-collegues.md`, relu par Cowork) ; `labo-codex` supprimé puis recréé vide et privé par Grégoire vers 10 h 34 (9 demandes de fusion Dependabot rendaient le poussé forcé insuffisant) ; `main` (1f46a2ce) et les 22 étiquettes poussés par Claude Code. Netlify relié au dépôt recréé par Cowork dans le Chrome de Grégoire, après que Grégoire a ouvert à l'application Netlify l'accès GitHub à `labo-codex` ; répertoire de publication aligné sur `publication` dans le tableau de bord ; production publiée depuis `main@1f46a2c` à 11 h 01. Vérifié par Cowork : 1.202.0, les fichiers de l'application répondent, les documents de travail répondent 404.
- **Accueil du dépôt public (16 oct.)** : README et licences corrigés (5cb01273, becfc977, 4ca2ac67 ; relus par Cowork, verdict `VERDICT-RELECTURE-2026-10-16-accueil-depot-public.md`), logos et noms réservés (décision de Grégoire, 11 h 37), poussés jusqu'à eb6dd86e ; GitHub reconnaît l'AGPL-3.0. Netlify a publié eb6dd86e tout seul à 11 h 42 : la publication automatique depuis le dépôt recréé fonctionne. Vérifié par Cowork vers 13 h 55 : 1.202.0, les fichiers de l'application répondent, `LICENSE`, `README.md`, `Logo/` et les plans répondent 404. Reste de la phase C : le passage en public, geste de Grégoire.
- **À traiter au balayage de la phase C** : une adresse Gmail dans `.claude-plugin/marketplace.json`.
- **Seconde réécriture (16 oct., 9 h 25 à 10 h 45)** : le balayage de la phase C a trouvé des noms de collègues sous des formes collées, une adresse et un identifiant, ainsi que 8 zip de bêtas, et le Gmail. Tout est retiré de l'historique (`RAPPORT-2026-10-16-reecriture-noms-collegues.md`). Des demandes de fusion Dependabot étaient ouvertes : `labo-codex` a donc été recréé vide et privé par Grégoire, puis `main` et les 22 étiquettes y ont été poussés vers 10 h 40. 17 vérifications sur 17 sont vertes. Le dossier de travail suit le nouvel historique : l'ancien est purgé du `.git` local, les fichiers non suivis sont préservés, et Vitest compte 8 917 réussites sur 8 917. **Reste à Grégoire** : relier de nouveau Netlify au dépôt recréé.
- **Gestes de Grégoire qui restent** : fermer sans y commiter les deux anciennes sessions de Claude Code qui travaillent dans `Monitorage_v6-ancien` ; décider d'effacer les copies de travail de `~/purge-travail` qui portent encore des données d'élèves (`copie-2026-10-15`, `copie-2026-10-16-essai1`, `nouveaux-2026-10-15`, `ocr`), la sauvegarde complète restant.

## Décisions de Grégoire (15 octobre 2026)

- Le dépôt public naît d'un historique purgé ; l'ancien dépôt n'est jamais rendu public.
- Son nom : `labo-codex` (21 h 03).
- L'ancien dépôt sera supprimé de GitHub environ deux semaines après la bascule, une fois la sauvegarde vérifiée sur deux supports (vers 21 h). Cela remplace la décision de 13 h 40, qui le gardait privé.
- Noms de collègues : initiale ; les références à des travaux publiés, les attributions et les remerciements sont épargnés ; les prénoms seuls restent.
- Noms d'élèves : les paires prénom-nom et les DA sont remplacés ; les noms de famille seuls ne le sont pas (trop de collisions avec des mots courants).
- Les cinq chemins qui portent une cohorte entière sont retirés de tout l'historique.

## La règle qui tient tout le plan

**Entre la réécriture et la bascule, personne ne commite dans l'ancien dépôt, et rien n'y est poussé.** La réécriture change l'identifiant de tous les commits : un commit fait dans l'ancien dépôt après le clone devrait être reporté à la main dans le nouveau. L'historique réécrit ne retourne jamais vers l'ancien dépôt ; il va au nouveau.

## Phase A : la purge (faite le 16 octobre au matin)

État mesuré par Cowork à 21 h 20, trois commits ordinaires faits dans l'ancien dépôt, **non poussés** :

- la ligne de version d'`OU-EN-EST-ON.md` (9b568332) ;
- les initiales des collègues dans les fichiers actuels (56dea21a) ;
- la règle des élèves appliquée à l'arbre actuel (7fe55de3). La vérification A comparera l'arbre purgé à ce commit-là.

Sauvegarde complète de l'ancien dépôt : `~/purge-travail/sauvegarde-monitorage-2026-10-15.bundle` (150 Mo, vérifiée par Claude Code, hors du dépôt et hors iCloud).

Reste, dans l'ordre, selon `CHANTIER-historique-git-donnees-personnelles.md` § 0 :

1. Les trois mesures demandées par Cowork avant la réécriture : les fichiers binaires et compressés (PDF, images, docx, xlsx, zip, codex) hors des chemins retirés, qu'une règle de texte n'atteint pas ; les noms d'élèves dans les chemins ; la tolérance des paires (casse, accents, formes décomposées, ordre « Prénom Nom » comme « Nom, Prénom »).
2. Le clone, la réécriture, les vérifications A et B avec leurs témoins.

## Phase B : la bascule (faite le 16 octobre, 8 h 02 ; disque externe vers 8 h 20)

Conditions d'entrée : les vérifications de la phase A sont vertes ; aucun commit dans l'ancien dépôt depuis le clone.

1. **Claude Code** crée le dépôt `labo-codex` sur GitHub, **privé** pour l'instant, et y pousse `main` et les étiquettes de version, s'il y en a. Les autres branches (`archive/stash-*`, `claude/*`) ne suivent pas : elles restent dans la sauvegarde.
2. **Grégoire** copie la sauvegarde sur un disque externe, et non sur un service en ligne (iCloud compris) : sinon les données d'élèves changeraient seulement de fournisseur.
3. **Claude Code** remplace le dossier de travail :
   - l'ancien dossier est renommé `Monitorage_v6-ancien` ; le clone purgé prend le chemin habituel, pour que les sessions de Claude Code et le dossier relié à Cowork le retrouvent sans réglage (renommer le dossier local pourra se faire plus tard, à part) ;
   - `origin` pointe vers `labo-codex` ;
   - `git config core.hooksPath scripts/hooks` : mesuré le 15 octobre, les crochets pre-commit et pre-push sont versionnés, mais ce réglage est local et une copie ne l'emporte pas ;
   - les fichiers non suivis et les fichiers ignorés restent dans l'ancien dossier, sauf ceux qu'il faut reporter, remesurés au moment de la bascule. Mesuré à 21 h 20 : une trentaine de non suivis, dont le cadrage et la consigne du chantier « Apporter mon matériel » et ce plan-ci, et parmi les ignorés les réglages locaux de Claude Code ;
   - **ne jamais reporter les dossiers de retours de collègues**, suivis ou non : ils sont dans la liste de la purge ;
   - les dépendances de tests sont réinstallées.
4. **Netlify.** Le site est relié à GitHub : c'est une déduction, `netlify.toml` mentionne les aperçus de pull requests, que seule la liaison avec le dépôt produit. **Grégoire** relie le site au nouveau dépôt dans les réglages de déploiement continu de Netlify (branche de production : `main`), puis recharge app.codexnumeris.org et vérifie la version au bas de la page.
5. **GitHub, côté nouveau dépôt.** Le workflow de tests suit avec le code ; mesuré le 15 octobre, `tests.yml` n'utilise aucun secret. À refaire à la main s'il y a lieu : l'accès de l'application Claude au nouveau dépôt (séances dans le nuage), les protections de branche.
6. **Témoin** : le premier lot du chantier suivant est poussé sur `labo-codex` et mis en ligne par Netlify.

Durée estimée : trois quarts d'heure, dont un quart d'heure pour Grégoire (disque externe, Netlify).

## Phase C : rendre le dépôt public (quand Grégoire le décide)

1. **Claude Code** fait un dernier balayage de l'historique : secrets (clés, jetons), DA, paires prénom-nom, courriels, avec la même tolérance que la vérification de la purge.
2. **Claude Code** vérifie les fichiers d'accueil : README, licence AGPL v3 du code, CC BY-NC-SA 4.0 des ressources (corrigé par Cowork le 16 oct. : « CC BY-SA » était une erreur de transcription ; le dépôt, le README et l'application disent BY-NC-SA depuis novembre 2025, et aucune décision de Grégoire ne l'a changé).
3. **Grégoire** passe le dépôt en public. C'est un geste public : l'annoncer ou non lui revient.

## Phase D : supprimer l'ancien dépôt de GitHub (vers le 30 octobre 2026)

Conditions d'entrée, toutes vraies :

- au moins une version mise en ligne depuis `labo-codex`, avec un verdict complet vert ;
- la sauvegarde relue (`git bundle verify`) sur le Mac **et** sur le disque externe ; le disque externe : fait le 16 octobre vers 8 h 20 ;
- plus aucune session, locale ou dans le nuage, ne pointe vers l'ancien dépôt ;
- les issues et pull requests de l'ancien dépôt, s'il y en a, relues : rien à garder.

Puis **Grégoire** supprime l'ancien dépôt dans ses réglages GitHub. GitHub peut parfois le restaurer pendant 90 jours ; ensuite, c'est définitif. Supprimer un dépôt privé supprime aussi ses forks. Le dossier `Monitorage_v6-ancien` et la sauvegarde restent : rien n'est détruit, l'historique complet quitte seulement GitHub.

### Ajouté le 16 octobre : l'ancien site Netlify suit le même sort

Décision de Grégoire (16 oct., 7 h 14) : un nouveau site Netlify, puis la suppression de l'ancien, avec un répertoire de publication en liste blanche. Supprimer l'ancien site efface d'un coup tous ses aperçus et permaliens ; c'est la seule façon de prouver qu'il ne reste rien.

1. Le lot de la liste blanche (efffe795) est poussé après un verdict vert.
2. Un nouveau site Netlify est construit depuis `labo-codex`.
3. app.codexnumeris.org est déplacé vers lui (cible du CNAME chez Cloudflare, certificat, les deux hôtes de `netlify.toml`, réglages du tableau de bord).
4. L'ancien site est supprimé.
5. Témoin : chaque adresse mesurée le 16 octobre (aperçus, permaliens) répond « Not Found ».

## Hors du dépôt, à suivre sur la même page

- **Les conversations Claude qui ont porté des données d'élèves** : à supprimer une fois la purge vérifiée, dont la conversation Cowork du 15 octobre au soir. Effacées des serveurs d'Anthropic dans les 30 jours ; le réglage qui permet l'entraînement sur ses conversations est désactivé (vérifié par Grégoire le 15 octobre).
- **La liste des élèves vit dans le dossier Documents**, que macOS synchronise souvent avec iCloud (signalé par Claude Code le 15 octobre) : vérifier ce réglage.
