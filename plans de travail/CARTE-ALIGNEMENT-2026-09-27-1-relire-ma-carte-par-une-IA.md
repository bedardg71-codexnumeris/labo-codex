# Carte d'alignement, lot 1 – « Je fais relire ma carte par une IA »

> Consigne de lot rédigée par Grégoire et Cowork (projet claude.ai), validée par Grégoire le 27 sept. 2026 ; déposée dans le dépôt par Cowork le 27 sept. 2026. Texte reproduit tel quel sous la ligne.
> Fiche : **#963** (proposée ; voir `CARTE-ALIGNEMENT-2026-09-27-0-plan-des-lots.md`, § « À inscrire au BACKLOG »). Ordre et garde-fous communs : même fichier.

---

Lot « Je fais relire ma carte par une IA » (carte d'alignement). Origine : retour testeur de Grégoire du 27 sept. 2026 à 07 h 44 (conception > carte d'alignement). Inscris-le au suivi des retours avant de commencer.

INTENTION. Comme pour la cartouche de rétroaction, l'enseignant·e télécharge un fichier .md qui contient des consignes et sa carte en l'état ; il ou elle le colle dans l'IA de son choix et lit la réponse. Aller simple : aucune réimportation, rien n'est modifié dans la carte.

AVANT DE CODER. Lis comment est produit le modèle téléchargé de la cartouche de rétroaction et reprends le même esprit (consignes en blockquote en tête, puis données). Relis ton fichier mesure-carte-alignement.md pour la forme des nœuds, des liens et des objectifs servis.

CE QUE L'INTERFACE AJOUTE.
1. Un bouton « Télécharger un modèle » dans la carte d'alignement (emplacement cohérent avec les autres exports ; propose-le à Grégoire).
2. Au téléchargement, l'enseignant·e choisit son étape parmi trois : « Construire les séances », « Relier », « Vérifier », et la semaine jusqu'où sa carte est bâtie (par défaut : la dernière semaine qui contient une leçon).
3. Le principe affiché dans le module Alignement, texte exact : « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » Emplacement à proposer à Grégoire.

CONSIGNES DU MODÈLE, texte validé par Grégoire, à reproduire tel quel (les crochets sont remplis à l'export) :

# Carte d'alignement : [nom de la carte]

> CONSIGNES : à lire par l'assistant, puis à laisser telles quelles.
>
> Tu reçois ci-dessous la carte d'alignement d'un cours, telle que l'enseignant·e l'a construite dans Labo Codex. Tu en fais la lecture critique ; tu ne la réécris pas. L'enseignant·e décidera seul·e de ce qu'il faut modifier.
>
> LE PRINCIPE
> Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence.
>
> OÙ EN EST L'ENSEIGNANT·E
> Étape : [étape choisie]. Carte bâtie jusqu'à la semaine [N] sur [nombre de semaines du trimestre].
> - Construire les séances : les objectifs et les liens ne sont pas encore posés. Ne signale ni leur absence ni ce qui suit la semaine [N] ; lis les séances déjà bâties par leurs titres et leur ordre.
> - Relier : signale aussi les objectifs sans lien et les évaluations qui ne vérifient aucun objectif.
> - Vérifier : lis la carte comme terminée.
>
> CE QUE TU VÉRIFIES
> La carte calcule déjà les liens manquants. Ton rôle est ce qu'un calcul ne voit pas : le sens de ces liens.
> - Ce qui est évalué a-t-il été enseigné ? Pour chaque évaluation, pars des objectifs qu'elle vérifie (à défaut, de son titre) et repère où la carte les enseigne et les fait pratiquer. Signale ce qu'elle exige sans que la carte montre où cela a été appris.
> - Ce qui est enseigné est-il évalué ? Signale ce qui est enseigné sans être évalué nulle part, en admettant que ce puisse être voulu (un préalable, une mise en route).
> - L'ordre : ce qui est évalué a-t-il été enseigné avant l'évaluation ?
> - Le verbe : repère le verbe de chaque objectif (identifier, expliquer, concevoir…). Vérifie que les activités font exercer ce verbe et que l'évaluation exige ce même verbe, pas un verbe plus exigeant. Compare aussi ce verbe au niveau cognitif indiqué sur l'évaluation.
> - Les liens eux-mêmes : un lien posé ne prouve pas l'alignement. Signale un objectif coché par une activité ou une évaluation qui, d'après son titre, ne le travaille pas.
> - La démarche : si la carte montre une progression (des étapes, des types d'activités), vérifie qu'elle suit la sienne. Ne lui impose aucune démarche qu'elle ne montre pas.
>
> CE QUE TU RENDS
> 1. Les trous : ce qui manque, en nommant les blocs concernés.
> 2. Les incohérences : ce qui se contredit, en nommant les blocs et le lien en cause.
> 3. Les questions : ce que la carte ne permet pas de trancher.
> 4. Au plus trois suggestions, classées par importance.
>
> ANCRAGE
> - Tu ne connais pas la discipline de ce cours et tu n'en juges pas le contenu. Emploie uniquement les termes de la carte ; suis-les d'un bloc à l'autre pour vérifier que ce qui est évalué a été enseigné, et que ce qui est enseigné est évalué. N'introduis aucun concept qui n'y figure pas.
> - Appuie chaque remarque sur un bloc ou un lien présent dans la carte, cité par son nom et sa semaine.
> - Distingue ce que la carte montre de ce que tu en infères.
> - Aucune note, aucune félicitation.

DONNÉES APRÈS LES CONSIGNES (forme à ton choix, lisible par un humain, sans identifiants techniques) : cours ; compétence et ses éléments s'il y en a ; idées maîtresses avec leur niveau cognitif et leurs liens (écrits en phrases) ; puis, semaine par semaine et séance par séance, chaque leçon avec ses objectifs, ses idées maîtresses et ses blocs enfants (type tel qu'affiché, titre, durée, niveau cognitif, objectifs servis écrits en texte même quand l'objectif appartient à une autre leçon) ; chaque évaluation avec les objectifs qu'elle vérifie, son niveau cognitif, sa visée, sa production, sa grille, son échelle et son échéance ; enfin les blocs rattachés à aucune leçon. L'export JSON de la carte porte les liens mais pas les grilles ni les échéances ; l'export du plan porte l'inverse : le modèle réunit les deux.

GARDE-FOUS. Aucun contenu disciplinaire codé en dur (ni littérature, ni ELLAC, ni enseignement explicite comme norme) : tout le vocabulaire des données vient de la carte. Aucune écriture dans les données de l'utilisateur. Tests et exemples avec des noms manifestement fictifs.

CONSTATS À VÉRIFIER EN PASSANT (relevés par Cowork dans les exports de la carte « Écriture et littérature (A26) v3 » ; mesure-les dans le code et inscris au suivi des bugs ce qui se confirme, sans les corriger dans ce lot) :
1. L'export du plan laisse vide « Objectifs servis » quand une activité sert l'objectif d'une autre leçon (le JSON les porte).
2. L'activité « Faire son portrait de lecteur / lectrice » sert un objectif qui n'existe plus dans la carte.
3. L'évaluation « Artefact n°2 » porte un identifiant de production, mais l'export du plan ne lui trouve aucune production.
4. Toutes les productions affichent « Aucune échelle » dans l'export du plan, alors que l'export de cartouche rattache la grille G5H à l'échelle 0-IDME.

LIVRAISON. Teste, puis rends-moi : où se trouve le bouton, un exemple de fichier téléchargé sur une carte fictive, et ce que tu as constaté pour les quatre points. Pas de version publique sans l'accord de Grégoire.