# Consigne – réécrire l'historique de `labo-codex` une seconde fois : les noms de collègues restants et l'adresse Gmail

> Écrite par Cowork le 16 octobre 2026 à 9 h 20 (Toronto, mesuré par `date`). Décision de Grégoire à 9 h 19 : « il faut retirer les noms en effet ». Source : `plans de travail/BALAYAGE-2026-10-16-phase-C.md` (points 4, 7 et 8, et la relecture de Cowork en fin de fichier).
> ⛔ Aucun nom de collègue ou d'élève, aucune adresse courriel dans ce que tu écris au dépôt ou dans tes rapports : désigne les collègues par leur rang, comme le balayage.
> Skills : `securite-donnees`, `verification-adverse`.

## La règle

Du début de la réécriture jusqu'au poussé, personne ne commite dans `labo-codex`. La session « Apporter mon matériel » (`CONSIGNE-DU-JOUR.md`) ne démarre qu'après.

## Ce qui part

1. **Collègue n° 9** : son adresse courriel, où le nom est collé, dans tout l'historique (`js/pratiques/pratique-pan-objectifs.js` et ses copies d'`Archives/`). Même traitement que la règle des collègues : l'initiale.
2. **Collègue n° 3** : l'identifiant `creerEnsemble‹Prénom›‹Nom›`, remplacé par un identifiant neutre, le même dans tout l'historique ; les 2 fichiers actuels suivent par la réécriture elle-même. Le nom est un choix technique, le tien ; les tests restent verts.
3. **Les 8 chemins `dist/*.zip`** de l'historique (bêtas de 2025), ajoutés à `chemins-a-retirer.txt`. Les 8, pas seulement les 7 porteurs : ce sont des paquets de distribution, et la sauvegarde complète les garde (décision technique de Cowork).
4. **L'adresse Gmail** du champ `email` de `.claude-plugin/marketplace.json`, remplacée par `labo@codexnumeris.org` dans tout l'historique. Retenue par Cowork comme le choix prudent, puisque l'inverse ne se reprend pas une fois le dépôt public ; Grégoire peut revenir dessus.
5. Toute autre forme collée ou tout autre nom de collègue que tes outils trouveraient en élargissant la recherche à tous les rangs de la liste part dans la même réécriture. Rapporte-les par rang.

Ce qui reste, décidé : l'adresse institutionnelle de Grégoire dans les exports de janvier et dans une image d'aide (signature d'auteur) ; les noms d'auteurs publiés dans leurs contextes de citation (décision du 15 octobre).

## La méthode

0. **Mesure d'abord, côté GitHub** : `gh pr list --state all` sur `labo-codex`, les branches distantes, les releases. Rapporte-le dans ton rapport final.
1. **Sauvegarde** du `labo-codex` actuel : `git bundle` dans `~/purge-travail/`, hors iCloud, vérifiée par `git bundle verify`.
2. **Réécriture sur un clone miroir neuf**, dans `~/purge-travail/`, jamais dans le dossier de travail, avec l'outillage de la purge (`plans de travail/CHANTIER-historique-git-donnees-personnelles.md`, § 4).
3. **Vérifications, chacune avec son témoin sur la copie non réécrite** : le balayage complet relancé (`balayage.py`, `binaires.py`, `colles.py`) rend 0 pour les points 1 à 5 ; les 17 vérifications de la purge restent vertes ; l'arbre de `main` réécrit ne diffère de `efffe795` que par les lignes attendues (l'identifiant, l'adresse).
4. **Arrête-toi avant de pousser**, et rapporte les vérifications et la voie de poussé :
   - aucune demande de fusion : poussé forcé de `main` et des 22 étiquettes, puis suppression des 9 branches Dependabot ;
   - au moins une demande de fusion : GitHub garde leurs commits (`refs/pull/*`) malgré un poussé forcé. Grégoire supprime alors `labo-codex` sur GitHub et le recrée vide, privé, sous le même nom ; tu y pousses `main` et les étiquettes ; Grégoire relie de nouveau Netlify au dépôt.
   Cowork relit ce rapport avant le poussé (`PROTOCOLE.md`, règle 2).
5. **Après le poussé** : le dossier de travail suit le nouvel historique, fichiers non suivis préservés, `core.hooksPath` en place ; `cd tests && npm run test:unit` vert. Mets à jour la fin de `BALAYAGE-2026-10-16-phase-C.md` (dispositions faites) et le plan (`PLAN-2026-10-15-nouveau-depot-labo-codex.md`).

## Ensuite, avant le passage en public : des commits ordinaires dans l'arbre

- `README.md` : les 4 liens vers l'ancien dépôt pointent vers `labo-codex` ; les statistiques du 22 mai sont mises à jour ou retirées.
- `LICENSE.md` : le titre de la section 2 dit « BY-NC-SA », comme le reste (lignes 34 et 184-185) ; il dit quels dossiers relèvent de quelle licence, et que `libs/` garde les licences de ses bibliothèques (`libs/VERSIONS.md`). Ajoute le texte complet de l'AGPL v3 dans un fichier que GitHub reconnaît, pour que la page du dépôt affiche la licence. **Aucune licence ne change** : AGPL v3 pour le code, CC BY-NC-SA 4.0 pour le contenu.
- Commit, Vitest, demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-16-accueil-depot-public.md` ; poussé après la relecture de Cowork. Rapport court à Grégoire, en gestes. Le passage en public reste son geste.
