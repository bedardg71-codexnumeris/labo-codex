# Consigne du jour – masquer ce qui reste d'un élève supprimé (#1013)

> Écrite par Cowork le 4 octobre 2026 à 10 h 36 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 9 h 28, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1010-mise-en-ligne.md`.

## Où on en est

1.179.0 est en ligne (#1010 close, relais 3907d4e7), relu par Cowork à 10 h 35. Ce lot est le dernier avant le chantier des archives.

Lis la fiche #1013 au BACKLOG en entier, et le § 5 de `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-eleve-desinscrit.md`. **Ce qui est tranché** (Grégoire, 2 oct., 15 h 08) : supprimer un élève dans le Cadre, c'est une désinscription ; ce qui reste de lui doit disparaître de l'écran « avec son dossier », **sans rien effacer** (sa limite du 20 sept.). Le codex garde tout, et doit continuer.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/1013-eleve-supprime`. **Ne pousse pas le lot et ne fais pas de release** avant le retour de Cowork : tu t'arrêtes au point 5.

## Les décisions de Cowork (techniques, prises seul ; dis-moi si une mesure les dément)

1. **Une seule lecture** : une fonction qui dit si un DA est celui d'un élève supprimé, lue dans `<trim>_elevesDesinscrits` (1.174.4), et que toutes les vues appellent. Pas de seconde liste.
2. **Masquer, c'est filtrer à l'affichage** : aucune écriture, aucune clé retirée, aucune copie touchée. Un élève réinscrit (s'il existe un tel geste ; mesure-le) réapparaît avec tout.
3. **Les vues à masquer**, d'après la fiche : ses copies dans la Liste des évaluations et les comptes « N résultat(s) » / « N productions » ; la liste des copies du module Travaux ; le PDF d'une copie (s'il ne s'atteint plus que par ces vues, il suit ; sinon, dis par où). Remesure d'abord que chacune vit encore là où la fiche le dit.
4. **Rien ne change dans les mots** : on retire des lignes, on n'en écrit pas. Si une vue a besoin d'une phrase (une liste qui devient vide, par exemple), arrête-toi et rends-la : elle reviendra à Grégoire.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure** : les vues du point 3 sur la démo, après avoir supprimé un élève qui a des copies et des évaluations ; et **ce que font aujourd'hui l'export recherche et les seuils « en attente » du tableau de bord** pour cet élève (ce qu'ils contiennent ou comptent de lui, exactement).
3. **Code** les points 1 à 3 sur la branche. Ne touche **ni l'export recherche ni les seuils du tableau de bord** : ce sont des questions sur ses données, elles reviennent à Grégoire.
4. **Tests** : un essai Playwright (élève supprimé → absent de chaque vue masquée, ses données toujours présentes en base, et le codex les écrit encore) ; la mutation démontrée rouge (la lecture du point 1 neutralisée). Vitest complet.
5. **Arrête-toi et rends** : le commit sur la branche ; les vues masquées et le chemin de chacune ; et, pour l'export recherche et les seuils du tableau de bord, **ce qu'ils font aujourd'hui de cet élève, en une phrase chacun, avec la sortie que tu recommandes et pourquoi**, pour que Cowork les porte à Grégoire. Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce qui ne montre plus l'élève supprimé, et ce qui le montre encore. Les deux questions dans un bloc à part, chacune avec ta recommandation. Ce que tu as supposé, en une ligne.
