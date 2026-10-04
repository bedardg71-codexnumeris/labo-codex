# Consigne du jour – le signal au début de l'évaluation (#1010)

> Écrite par Cowork le 4 octobre 2026 à 8 h 18 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 7 h 04, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1008-garde-eveil.md`.

## Où on en est

#1008 est close, sur `main` (56684d55, relais b43abfb6) ; relu par Cowork à 8 h 17. Ordre du jour, confirmé par Grégoire : ce lot, puis masquer ce qui reste d'un élève supprimé (#1013), puis les archives, l'enregistrement, la carte d'alignement.

Lis la fiche #1010 au BACKLOG en entier. **Ce qui est tranché** (Grégoire, 1er oct.) : quand la case « Consignes transmises » d'une production est décochée pour un groupe et qu'il commence à évaluer une copie de ce groupe, l'application lui signale que la consigne ne semble pas avoir été transmise. Pas de coche automatique. **Ce qui lui revient** : les mots de l'écran. Rien d'autre.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/1010-signal-consigne`. **Ne pousse pas le lot et ne fais pas de release avant que ses mots soient acceptés** : tu t'arrêtes au point 5.

## Les décisions de Cowork (techniques, prises seul ; dis-moi si une mesure les dément)

1. **Un bandeau dans l'écran d'évaluation, pas une fenêtre** : il informe, il ne bloque rien. Il paraît à chaque ouverture d'une évaluation sur une copie dont le groupe a la case décochée pour cette production, et disparaît dès que la case est cochée. Pas de mémoire « déjà vu » : tant que la case est décochée, c'est vrai.
2. **Un bouton dans le bandeau qui coche la case** pour ce groupe-cours, sur son clic seulement ; c'est son geste, pas une écriture d'office. Il passe par l'écriture existante de `js/productions.js` (l. ~1435-1460), pas par une seconde.
3. **La règle de lecture est celle de `obtenirEcheanceEffective`** (`js/productions.js` l. ~150-160, `assignee !== false`) : une seule lecture, pas une nouvelle.
4. **Tous les chemins qui ouvrent une évaluation** : mesure-les d'abord (au moins l'évaluation depuis la Liste, et depuis la copie dans Annoter / la visionneuse). Le bandeau est posé à un seul endroit que ces chemins traversent ; s'il n'y en a pas, dis-le et pose-le dans chacun.
5. **Le bandeau ne nomme personne** (mode anonymisation compris) et passe `echapperHtml()` pour le titre de la production.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure** : les chemins d'ouverture d'une évaluation ; et ce que la case décochée retire réellement (indices, graphiques, PAN, calendrier ; la fiche le lit au code, ne l'a pas mesuré). Le texte du bandeau ne dira que ce qui est mesuré.
3. **Code** sur `claude/1010-signal-consigne`, avec ces mots provisoires, à remplacer par les siens :
   - texte : « Les consignes de « {titre} » ne semblent pas avoir été transmises à ce groupe : la case « Consignes transmises » est décochée. » ; puis, seulement si ta mesure le prouve, une phrase sur ce que cela retire (« Tant qu'elle l'est, … »).
   - bouton : « Cocher « Consignes transmises » ».
4. **Tests** : un essai Playwright (case décochée → bandeau ; clic → case cochée et bandeau parti ; case cochée → aucun bandeau ; un autre groupe de la même production, coché → aucun bandeau), et la mutation démontrée rouge (le bandeau retiré). Mac et iPad : la largeur du bandeau à 768 px.
5. **Arrête-toi et rends** : le commit sur la branche, les chemins mesurés, ce que la case retire réellement, et **les mots exacts du bandeau, tels qu'ils s'affichent**, pour que Cowork les porte à Grégoire. Pas de verdict complet, pas de push du lot, pas de release : ils viendront après ses mots, sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, deux lignes : où le bandeau paraît, et ce que la case décochée retire réellement. Les mots exacts dans un bloc à part. Ce que tu as supposé, en une ligne.
