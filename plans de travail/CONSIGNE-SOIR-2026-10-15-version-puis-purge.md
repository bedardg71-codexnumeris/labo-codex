# Consigne du soir – la version 1.202.0, puis la purge (15 octobre 2026)

> Écrite par Cowork le 15 octobre 2026 à 16 h 36 (Toronto, mesurée par `date`). Commite ce fichier avec la release. Ne modifie pas les autres consignes.

## Décision de Grégoire (16 h 34) : la purge se fait CE SOIR, après la version du soir

Motif : demain s'ouvre un nouveau chantier. Détail : `DECISIONS-2026-10-15-groupe-7.md`, dernière section. L'ordre ne change pas : commit → relecture → verdict → push ; la purge vient après la mise en ligne.

## 1. D'abord, finir « avant la purge »

Si le décompte des noms de collègues n'est pas fini, finis-le et rends-le à Grégoire dans la conversation (trois familles ; aucune règle de remplacement écrite avant son accord). Rien de ce décompte n'entre dans un fichier suivi.

## 2. La version 1.202.0 (minor)

Skills `release-et-changelog` puis `fin-de-session-labo-codex`. Tous les lots du 15 sont relus et acceptés par Cowork (verdicts dans les `CONSIGNE-LOT-2026-10-15-*`).

**L'entrée des Nouvelles, approuvée par Grégoire « tel quel » à 16 h 35** (version `1.202`, une entrée, ces six items dans cet ordre ; mets les espaces insécables et les guillemets comme dans les entrées voisines, sans changer un mot) :

- Titre : « Le diagnostic à part, des mots qui décrivent »
- Une production « Diagnostique » porte maintenant cette étiquette et ne compte plus nulle part : ni dans la note, ni dans la complétion, ni dans les courbes du profil. Une nouvelle production ne reprend plus la case de la précédente ; jette un œil à tes productions marquées.
- Au profil, la présence et la remise se disent en mots qui décrivent (« Absences rares, quelques travaux manquants ») ; les pistes d'intervention sont au conditionnel, sans juger. Le réglage des seuils prend les mêmes mots.
- L'Aide dit ce que fait l'application, dont ce que vaut une copie plagiée selon ta pratique. Le Comparateur de pratiques et l'import d'un trimestre à l'autre ont leur aide, et l'assistant de pratique une bulle par étape.
- En spécifications, une copie est satisfaisante par défaut quand toutes ses spécifications sont respectées (100 %). En portfolio hybride, une terminale cochée parmi les obligatoires ne compte plus pour zéro dans les notes finales.
- Le matériel de départ porte ses nouveaux noms partout ; un nom que tu as modifié n'est pas touché. Le supprimer ne vaut plus que pour son trimestre.
- Les tailles de fichier s'affichent comme sur ton appareil. « Exporter et archiver » devient « Exporter les travaux », et « Des équipes plus grandes » n'ajoute plus qu'une personne par équipe.

Puis : release (`scripts/release.mjs`), **verdict complet** (`cd tests && npm test`, Vitest puis Playwright), et seulement s'il est vert, push. Avant de lancer le verdict, dis à Grégoire qu'il dure environ une heure et occupe son Mac. Si un essai rougit : arrête, rapporte, ne pousse pas ; la purge attend.

Après le push : constate la version chez Netlify (numéro en bas de page), remplis la ligne de version d'`OU-EN-EST-ON.md`, et dis à Grégoire qu'il peut passer la porte « Les productions diagnostiques » (trois rangées).

## 3. La purge, dans une séance À PART

Ne la commence pas dans cette séance. Termine-la ici par ton rapport. La purge se fait dans une nouvelle séance de Claude Code, sur un clone complet sur le Mac, selon `CHANTIER-historique-git-donnees-personnelles.md` § 0, en entier : les cinq arrêts durs, l'ordre, et les questions à reposer à Grégoire avant de déclencher, même s'il y a déjà répondu.

Préalables à vérifier au début de cette séance-là, et à dire à Grégoire :
- la version 1.202.0 en ligne et poussée ; aucune autre session n'écrit dans le dépôt ; la session d'observation dans le nuage a tout poussé et est en pause ;
- la liste des noms est HORS du dépôt : `/Users/kuekatsheu/Documents/Cowork H26 App Labo Codex/purge-identites/` (dix fichiers par classe) ; ne la copie nulle part, ne la cite dans aucun fichier suivi ;
- les règles pour les noms de collègues, approuvées par Grégoire à partir du décompte ;
- les ajouts du 15 au plan (§ 4.4) : les sept dossiers de retours de collègues, l'ancien emplacement sous `Archives/`, « Autres pratiques de notation », les copies de configuration nommées d'après un collègue, la capture d'écran du dossier de Grégoire (décision de 16 h 27).

Le nouveau dépôt public (décision de 13 h 40) n'est pas de ce soir, sauf si Grégoire le demande : la purge d'abord, vérifiée.
