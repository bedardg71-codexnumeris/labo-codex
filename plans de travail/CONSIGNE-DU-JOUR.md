# Consigne du jour – archives, lot A3 : faire revenir des copies (#1000)

> Écrite par Cowork le 4 octobre 2026 à 12 h 19 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 11 h 04, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1013-mise-en-ligne.md`.

## Où on en est

1.180.0 est en ligne (#1013 close, relais bceeb2a6), relu par Cowork à 12 h 18. Le chantier des quatre lots isolés est clos ; **le chantier des archives est ouvert**, à mener jusqu'au chantier clos : ce lot (A3), puis les mots « clos » (A5), puis alléger (A4). Ordre de Grégoire.

Lis en entier : la fiche #1000 et la fiche #997 au BACKLOG ; `plans de travail/PLAN-2026-09-30-chantier-archives.md` (§ 2, les quatre règles de Grégoire ; § 4, lot A3) ; les verdicts de relecture des lots A1 et A2 (`VERDICT-RELECTURE-2026-09-30-lot-A1-archive.md`, `…-A2-verifier.md`). Ce lot **écrit des copies dans les données de l'utilisateur** : il passe par la relecture croisée (règle 2 de `PROTOCOLE.md`).

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/1000-faire-revenir`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 6.

## Les décisions de Cowork (techniques, ou conséquences directes de décisions de Grégoire ; dis-moi si une mesure les dément)

1. **Où** : dans Réglages › Données › Archives, sur la ligne d'une archive, à côté de « Vérifier ». Le geste n'est offert que pour une archive **vérifiée dans ce navigateur** (lot A2).
2. **Il ne remplace rien et n'efface rien.** Pour chaque copie de l'archive, **son empreinte est recomparée au moment du geste**, en lisant (pas de confiance dans la vérification d'hier, cf. #1001), puis :
   - la fiche existe et le navigateur n'a pas le fichier, ou la fiche le dit « manquant » → la copie est écrite, et la fiche redevient présente (c'est ce qui répare #997, **par le geste de l'utilisateur, jamais d'office**) ;
   - le navigateur a déjà le fichier, même empreinte → rien ;
   - le navigateur a un fichier d'empreinte différente → **rien**, la copie est comptée « changée depuis l'archive » ;
   - aucune fiche dans l'application → rien, comptée ;
   - la copie d'un élève supprimé (`dasElevesSupprimes()`) → rien, comptée. C'est la décision de Grégoire du 2 oct. : un ancien fichier ne ramène plus rien de lui.
   - une copie dont l'empreinte ne correspond pas à celle de l'archive (archive abîmée depuis la vérification) → rien, comptée, et le bilan le dit en tête.
3. **Mémoire** : lecture par morceaux, comme « Vérifier » (lot A2) ; jamais l'archive entière ni toutes les copies en mémoire. Visé : le plus gros groupe de Grégoire (205 copies, ~1,1 Go pour l'hiver 2026), sur le Mac **et** l'iPad.
4. **Un bilan à la fin**, en nombres : revenues, déjà là, changées, sans fiche, d'élèves supprimés, abîmées. Ses mots sont à Grégoire ; les tiens sont provisoires.
5. **Le codex** : une copie revenue est une copie ordinaire ; mesure que la fenêtre « Ce codex n'aura pas toutes tes copies » (#1012) ne s'ouvre pas à tort après un retour.
6. **Hors du lot** : « Exporter les données » d'un trimestre (#1006) et les mots « clos » (#1002). N'y touche pas.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure avant de coder** : ce que fait aujourd'hui « Ouvrir une archive… » (il compte sans rendre, lu au plan) ; le rapprochement copie ↔ fiche par identifiant (lu au code, à remesurer) ; où vit l'état « vérifiée ». Dis si une de ces mesures dément une décision ci-dessus.
3. **Code** sur `claude/1000-faire-revenir`, mots provisoires.
4. **Tests** : un banc sur le pack démo. Archiver un groupe, retirer au banc le fichier de quelques copies (au banc seulement), marquer une fiche « manquant », changer une copie, supprimer un élève, puis faire revenir : chaque cas du point 2 donne ce qu'il doit, les octets revenus sont identiques à l'archive, rien d'autre n'a bougé dans l'espace. Mutations démontrées rouges : la recomparaison d'empreinte retirée ; le cas « empreinte différente » qui remplace. Un essai à la largeur de l'iPad (768 px). Vitest complet.
5. **La mémoire, mesurée** : un retour sur une archive de taille réelle fabriquée au banc (au moins quelques centaines de Mo), pic de mémoire relevé.
6. **Arrête-toi et rends** : le commit sur la branche et une `DEMANDE-RELECTURE-2026-10-04-1000-faire-revenir.md` dans `plans de travail/` (ce que fait le geste, cas par cas, avec le témoin du banc ; le pic de mémoire ; ce qui reste) ; et, pour Grégoire, **les mots exacts** du bouton, de la fenêtre et du bilan, tels qu'ils s'affichent. Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce que fait « faire revenir », et ce qu'il ne fait jamais. Les mots exacts dans un bloc à part. Ce que tu as supposé, en une ligne.
