# Consigne – préparer les 69 décisions de Grégoire, en lecture seule

> Écrite par Cowork le 11 octobre 2026 à 8 h 49 (Toronto, mesurée par `date`). Pour une session Claude Code **distincte** de celle qui tient la file des lots (`CONSIGNE-DU-JOUR.md`). Les deux peuvent tourner en même temps parce que celle-ci **ne touche à rien**.

## Pourquoi

Grégoire veut avancer dans la page du tri sans s'ajouter de décisions dans la journée. 69 fiches attendent une de ses décisions (mesure du 9 oct. : `plans de travail/MESURE-2026-10-09-fiches-a-trier.md`, § 1). Il les tranchera par petits paquets, une question à la fois, les jours où il est disponible. Ton travail : les lui rendre **prêtes à décider**.

## Règles de lecture seule (non négociables)

- **Aucune modification** de `js/`, `index.html`, `tests/`, `BACKLOG.md`, `CLAUDE.md`, `PROTOCOLE.md`, ni d'aucun fichier suivi par git.
- **Aucune commande git qui écrit** : ni `commit`, ni `add`, ni `status`, ni `checkout`, ni `stash` (l'autre session commite dans ce dépôt ; un `.git/index.lock` la bloquerait). `git log`, `git show`, `git log -S`, `git grep` sont permis.
- **Aucune suite de tests** (ni Vitest ni Playwright : elles partagent l'état avec l'autre session).
- Un seul fichier écrit : `plans de travail/DECISIONS-A-PRENDRE-2026-10-11.md` (non suivi ; Cowork le relit et le fera commiter).
- Délègue les relectures longues à des sous-agents en lecture seule, en parallèle. `BACKLOG.md` est énorme : greps ciblés.

## Ce que tu fais

1. **Remesure** chaque fiche du § 1 au code actuel (`HEAD`, après les lots 1 à 7 de la file, dont 1.196.0 et 1.197.0) : vivante, morte (corrigée en chemin ou sans objet), ou changée. Une morte sort de la liste, avec sa preuve.
2. **Écris la décision en une question**, dans les mots d'un enseignant, sans jargon de code : ce que Grégoire doit trancher, et pourquoi c'est à lui (pédagogie, ses données réelles, des mots que ses élèves ou collègues lisent, ou un engagement public). Si une fiche ne demande en fait **aucune** décision de sa part (une question technique, ou tranchable par une mesure), dis-le : elle rejoindra la file sans lui.
3. **Propose une recommandation argumentée** pour chaque question (Grégoire veut toujours une recommandation, pas un exposé d'options neutre), avec ce qu'elle coûte. Distingue ce qui est mesuré de ce qui est inféré.
4. **Regroupe par geste d'utilisateur** (« évaluer une copie », « suivre un élève », « préparer son trimestre », « partager avec un collègue », etc.), pas par numéro. Dans chaque groupe, ordonne par **qualité de l'application** (robustesse et logique d'abord, confort ensuite).
5. **Estime le coût** de chaque fiche une fois décidée : rapide, intermédiaire, laborieuse (critères de la page du tri).

## Forme du rapport

`DECISIONS-A-PRENDRE-2026-10-11.md` : en tête, le compte (vivantes, mortes, sans décision réelle) ; puis un bloc par geste ; dans chaque bloc, une entrée par fiche : la question, la recommandation et son motif, le coût, le numéro **entre parenthèses en fin de ligne**. Noms d'élèves : aucun, ou manifestement fictifs.

## Puis arrête-toi

Rapport court à Grégoire : combien de décisions réelles restent, en combien de groupes, et le groupe que tu proposes de trancher en premier, avec pourquoi.
