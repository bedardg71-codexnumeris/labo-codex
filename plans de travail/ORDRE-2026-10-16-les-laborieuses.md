# L'ordre des laborieuses — pour la journée du 16 octobre 2026

> ⚠ **Remplacé pour le 16, le 17 et le 18 octobre** (décision de Grégoire, 15 oct. 2026, 16 h 19) : ces trois jours vont à « Apporter mon matériel » pour la rencontre CoP du 19 oct. (`CADRAGE-2026-10-15-apporter-mon-materiel.md`, première consigne `CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md`). **La purge (#781) et les laborieuses reprennent après le 19.**

> Écrit par Cowork le 15 octobre 2026, 16 h 02 (Toronto), à la demande de Grégoire : « demain, la purge, puis les 73 laborieuses » (une fiche laborieuse : données déjà écrites, zone protégée, ou trois modules et plus).
> Source : la page du tri (filtre « Laborieuses »), version du 15 oct. à 16 h ; chaque fiche est à **remesurer** au backlog avant d'écrire sa consigne, pas à recopier d'ici.
> Règles appliquées, de Grégoire : d'abord ce qui se fait sans lui ; ensuite la qualité de l'application (robustesse, logique) ; un chantier clos avant d'ouvrir le suivant ; une seule session écrit dans `js/` ; les vérifications complètes le soir.

## Le matin, avant tout le reste
1. La version du soir du 15 est en ligne (à vérifier).
2. La purge de l'historique (#781), avec ce que le lot « avant la purge » y a ajouté (#694). Signal de Grégoire avant l'envoi final.
3. Puis seulement, les chantiers ci-dessous.

## Sur les 73, trente et une ne sont plus à ordonner (la purge, #781, comprise)
- **Déjà dans les lots écrits le 15** (`LOTS-2026-10-15-fiches-a-toi.md`) : #694, #1071, #1043, #551, #579, #646, #628, #393, #476, #978.
- **Déjà dans la file de l'autre session Cowork le 15** (page du tri, « Ce qui s'enclenche ») : #1075, #1055, #378, #291, #668, #333, #364, #810.
- **Fermées, à cocher au backlog avec leur motif** : #548, #854, #838 (15 oct.) ; #336 (règle du 20 sept.) ; #463 (« on ne change rien », 15 oct.) ; #992 (codex à 254,7 Mo le 14 oct.) ; **#47** (mot de passe sur une sauvegarde : fermée par cohérence avec #1071, pas de chiffrement, une clé perdue rendrait la sauvegarde illisible ; décidée par Cowork, à dire à Grégoire en une ligne).
- **Attendent l'extérieur** : #591, #835, #836 (Loi 25 ; rencontre du 19 oct.).
- **Rangées dans leur chantier** : #840 (partage), #425 (carte d'alignement).

**Restent 42 fiches, en sept chantiers et une séance sur ses données, dans cet ordre.**

## Chantier 1 — Les données qui se croisent ou se perdent (sans Grégoire, sauf le stock)
Robustesse d'abord : ce sont des écritures fausses qui continuent chaque jour.
- #1063 : des gestes du Cadre réécrivent le cours actif sans son groupe-cours (interventions dans les deux groupes, captures de C et de P vides).
- #1062 : une présence d'intervention notée sur une séance pas encore saisie marque toute la séance « saisie » pour le sous-groupe.
- #721 : les jetons se mélangent entre trimestres et échappent aux archives (à prendre avec le lot F, #1043, même famille de clés).
- #346 : une fiche de cours ré-identifiée laisse ses productions derrière.
- #272 : ouvrir une évaluation échoue par intermittence.
- #707 : le programme d'un élève s'affiche vide sur sa fiche.
- #1077 : supprimer un trimestre laisse les fichiers de ses copies (décision de Grégoire du 15 : ils partent avec le trimestre ; ceux qui restent, l'application propose de les retirer, à son geste, codex proposé avant).
- #690 : des pratiques inventées aux prénoms de collègues dans `pratiques-predefines.js` : à RETIRER, pas à réparer (sa règle sur le matériel fictif). Juste après la purge.
⮕ Pour chacune : la source corrigée ; le stock déjà écrit chez Grégoire mesuré, nommé, jamais réparé d'office (« tarir n'est pas réparer ») ; ce qui toucherait ses données lui remonte.

## Chantier 2 — La note juste (logique)
Avec les lots C et D du 15 (#483, #1076, #579, #551), même module.
- #465 : la note calculée ne correspond pas à la pratique configurée.
- #738 : un « non remis » noté 0 compté comme remis (la note ; la complétion est livrée).
⮕ Grégoire : seulement si une note de l'automne 2026 bouge (lui montrer combien, sans nom).

## Chantier 3 — La zone protégée et le verrouillage
Avec le lot E du 15 (#1052, #1053, #646, #628 ; accord de Grégoire, relecture croisée).
- #1064 : trois défauts du verrouillage, dont la cause du premier passe par #646.
- #587 : les deux enveloppes de la navigation (c'est #1053).

## Chantier 4 — Les huit parties de l'observation du 15 (ses intentions, écran par écran)
#1078 (entrée, codex, témoin, Nouveautés, aide), #1079 (Cadre ; dont « Dupliquer » un cours, sa décision du 15), #1080 (Productions, Grilles, Échelles), #1081 (Rétroactions, Pratiques, Carte, bibliothèques, partage), #1082 (Évaluation), #1083 (Suivi, profils, présences ; un point à lui avant d'y toucher : ce que la note différée doit cacher), #1084 (Dépistage, interventions, rencontres), #1085 (Labo).
⮕ Ordre : d'abord les écarts de comportement (écritures silencieuses, éditeurs qui restent ouverts au changement de trimestre), puis les mots. **Les mots d'écran et ceux que lisent les élèves vont à Grégoire sur une seule page par partie**, pas un à un dans la conversation. C'est le chantier qui lui demande le plus : à placer quand il est disponible.

## Chantier 5 — Contenir la complexité (sans Grégoire)
Volet entré dans les lots le 12 oct. (sa décision). Avec le lot H du 15.
- #469 : les 21 fonctions mortes des anciens systèmes.
- #615 : retirer « Renommer pour distinguer » et son ancien code.
- #1051 : second lot du garde-fou (dépendances circulaires, couplage).
- #616 : 41 lignes de sentinelles qui rougissent sur un commentaire.
- #487 : une liste recopiée 36 fois dans la configuration des tests.

## Chantier 6 — L'apparence (une seule séance d'écran avec Grégoire, à la fin)
#595 (78 variables jamais définies), #813 (112 couleurs vers une variable absente), #286 (emojis sur iPad), #598 (balance des blancs sans aperçu).
⮕ Le rendu change : captures avant / après réunies sur une page, qu'il regarde en une fois, Mac et iPad.

## Chantier 7 — Les fonctions à finir (après les six autres)
#326 (le banc de comparaison, zone protégée), #307 (comparer la note selon plusieurs pratiques), #329 (pilote de partage par fichiers signés), #402 (restes du portfolio), #584 (l'export recherche ne dit pas où sont suffisance et maîtrise), #470 (tous les onglets redessinés au démarrage), #481 (quatre fragilités éparses), #602 (un fichier périmé servi par un worker), #678 (les alertes bloquantes des chroniques 2 et 3).
⮕ À reclasser au début du chantier : certaines sont des envies plus que des défauts vécus (règle du 24 août : une fiche entre au backlog sur un symptôme vécu).

## Ses données réelles (une séance à part, avec lui)
#453 (rendre aux artefacts la grille, l'échelle et la cartouche effacées), #454 (repointer les productions vers les grilles renumérotées), #682 (le nouveau nom n'atteint que les espaces neufs), #342 (des pratiques à son nom portent celui d'un autre enseignant).
⮕ Des scripts qui écrivent dans ses données : rien ne tourne sans lui, son codex fait d'abord.
