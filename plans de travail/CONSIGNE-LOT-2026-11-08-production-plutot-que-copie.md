# Consigne : lot « « Production » plutôt que « copie », dans l’interface »

**Recopiée par Cowork le 8 nov. 2026 vers 20 h 50 (heure de Montréal), mot pour mot, depuis la page du tri** (« Tri du chantier Labo Codex »), où elle vivait seule. En ligne : 1.237.2.

**Quand le lancer (page du tri)** : à lancer bientôt (ta demande de 12 h 56), sur une branche à part ; relevé et proposition d’abord, sans code

**Ce que Grégoire verra (page du tri)** : Tes décisions de 12 h 48 à 12 h 53, en concevant le sixième parcours. Ce que l’étudiant·e remet est une production, pas une copie : un travail étudiant n’est pas toujours écrit. Les bulles de l’assistance sont réécrites en ce sens ; l’interface doit suivre, sinon une bulle cite un bouton qui dit encore « copie » (« Réunir en une copie », « Copie de référence »…). Ce que tu verras d’abord : un tableau de toutes les occurrences, avec le texte actuel et le texte proposé. Rien ne change à l’écran avant ton accord. Ajouté à 14 h 12 : la page Conception › Productions, telle que tu l’as revue de 13 h 51 à 14 h 09. Ce qu’est une production (glossaire, infobulles) ; le menu « Type » par formes de production, de l’écrit à la création ; ta banque de types (« + Nouveau type… », retenue d’un trimestre à l’autre) ; les définitions réduites aux trois types qui changent le calcul. Les textes sont à poser tels quels ; la banque se mesure et se propose d’abord.

**Références (page du tri)** : (document « Parcours d’assistance : production plutôt que copie » ; js/modal-backup-reminder.js, js/codex.js)

---

Lot « Production plutôt que copie, dans l'interface ». Indépendant des autres lots ; sur une branche à part. Mêmes règles : pas de fusion vers main ni de publication sans l'accord de Grégoire, rien au changelog. Aucun texte lu par l'utilisateur ne change sans être soumis à Grégoire, le libellé d'un bouton ou d'une infobulle compris.

POURQUOI
Décisions de Grégoire (8 nov., 12 h 48 à 12 h 53) :
- Ce que l'étudiant·e remet s'appelle une « production » (ou une « activité d'apprentissage »), jamais une « copie » : un travail étudiant n'est pas toujours écrit (un stage, un film, un enregistrement, une entrevue, un labo…).
- Le possessif distingue : « ta production », c'est ce que l'enseignant·e demande (la fiche de Conception › Productions) ; « sa production », « leurs productions », « la production de ton étudiant·e », c'est ce que chacun·e remet.
- Production et évaluation ne se confondent pas : l'étudiant·e produit, l'enseignant·e évalue. La note, le niveau et la rétroaction sont ceux de l'évaluation, pas de la production.
- « Copie » ne reste qu'au sens de sauvegarde ou de double (« une copie complète », pour le codex).
Les bulles de l'assistance sont réécrites selon ces règles (Cowork, 8 nov.). L'interface doit suivre : une bulle cite un bouton tel qu'il s'affiche.

EXEMPLES REPÉRÉS PAR COWORK (8 nov., en lisant, liste non exhaustive)
- Évaluation › Préparer, étape « Optimisation » : le bouton « Réunir en une copie ».
- Annoter : « Actions › Copie de référence ».
- Le rappel « Mets ton codex à jour » (modal-backup-reminder.js) : « Ton codex en garde une copie complète, copies de tes étudiant·es comprises ». Texte validé par Grégoire (12 h 48) : « Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. » C'est le seul remplacement déjà décidé : pose-le mot pour mot, sans attendre la proposition.
- Les messages du codex (codex.js) sur les copies qui manquent dans un codex.

EN DEUX TEMPS
1. Inscris l'entrée au BACKLOG. Relève toutes les occurrences de « copie » et « copies » dans les textes que l'utilisateur lit : libellés, infobulles, aide, messages, fenêtres, guides, et ce que reçoivent les étudiant·es (synthèse de rétroaction, noms de fichiers). Les Nouvelles déjà publiées restent telles quelles. Range chaque occurrence : (a) ce que l'étudiant·e remet ; (b) une sauvegarde ou un double, à garder ; (c) autre chose. Pour chaque occurrence de (a), propose un remplacement selon les règles ; signale les phrases où « production » prendrait deux sens (ta production et la sienne), et celles où « copie » désigne en fait l'évaluation. Rends à Grégoire un tableau : où, texte actuel, texte proposé. Attends son accord avant de coder.
2. Code ce qu'il aura accepté. Seuls les mots affichés changent : les identifiants du code et les clés de stockage restent.

À RESPECTER
- Ce que lisent les étudiant·es ne change pas sans l'accord de Grégoire.
- Aucune donnée d'utilisateur n'est réécrite.
- Si une bulle de l'assistance déjà posée cite un libellé que tu changes, dis-le : la bulle suivra.

PARTIE 2, CE QU'EST UNE PRODUCTION : LA PAGE CONCEPTION › PRODUCTIONS (décisions de Grégoire, 8 nov., 13 h 51 à 14 h 09 ; lu par Cowork sur main cafc89f, 1.236.0, le Mac ne répondant pas)
Grégoire : « production » est un terme général, ce que l'élève fait dans une activité d'apprentissage. Ce n'est pas toujours un objet tangible : c'est ce que l'élève fait quand il apprend, et c'est cet apprentissage qui est évalué à travers la production. Il faut imaginer plusieurs disciplines et laisser nommer ce que l'application ne nomme pas : « On ne peut pas tout imaginer, mais on peut offrir de le faire et de le retenir. » Les textes ci-dessous sont validés : pose-les mot pour mot.

1. Le glossaire, terme « Production » (accompagnement-contenu-terme.js), nouvelle définition : « Ce que tes étudiant·es font dans une activité d'apprentissage : un texte, mais aussi un stage, un film, un enregistrement, une entrevue, un labo. Ce n'est pas toujours un objet qu'on remet : c'est ce que l'étudiant·e fait quand il ou elle apprend, et c'est cet apprentissage que tu évalues à travers elle. Dans Conception › Productions, tu décris celle que tu demandes, avec sa grille ; ce que chaque étudiant·e fait s'y rattache, et sa pondération dit ce qu'elle pèse dans la note du cours. Un artefact de portfolio n'a pas de pondération propre : c'est le portfolio qui la porte. Dans la carte d'alignement, les productions sont d'abord des mises en pratique liées aux objectifs d'apprentissage. »

2. Le menu « Type » (index.html, productionType ; TYPES_PRODUCTION, productions.js ; la sentinelle types-production-source-unique suit) :
- Le groupe « Évaluations » devient « Productions ». Ses exemples, dans cet ordre : Examen, Travail écrit, Quiz/Test, Présentation, Entrevue, Laboratoire, Démonstration pratique, Stage, Projet, Œuvre, Maquette, Photographie, Film, Enregistrement. Sont nouveaux : Démonstration pratique, Œuvre, Maquette, Photographie, Film, Enregistrement.
- Le groupe « Portfolio » ne change pas.
- « Évaluation terminale », groupe et type, devient « Épreuve terminale ».
- Ce sont des libellés : les identifiants des types existants ne changent pas, et les productions qui les portent ne sont pas réécrites. « Autre » sort du menu, remplacé par la banque (point 3) ; les productions déjà de type « Autre » restent lisibles sous « Autre ».

3. La banque de types (nouveau) :
- En bas du menu, « + Nouveau type… » : la personne écrit son type (exemple de Grégoire : « Prise de sang »). Il entre dans sa banque, revient d'un trimestre à l'autre (comme les tampons, hors trimestre), et s'affiche partout où le type s'affiche : la liste des productions, la carte d'alignement, le plan de cours, les exports.
- Le menu montre d'abord les exemples, puis les types de la banque.
- La banque se modifie : renommer, retirer. Retirer un type ne touche aucune production qui le porte ; rien n'est effacé. La personne peut aussi retirer de sa vue les exemples qui ne lui servent pas.
- Une production partagée ou importée emporte le nom de son type. Propose comment il apparaît chez un·e collègue : dans sa banque, ou seulement sur la production.
- Mesure d'abord, puis propose à Grégoire, en quelques lignes : où vit la banque, ce qui voyage (partage, import, codex, reprise d'un trimestre à l'autre), le stock, et le geste de gestion (où l'on renomme et retire). Attends son accord avant de coder la banque.

4. L'infobulle « Type » (cn-prod-type, accompagnement-contenu-hover.js) : « La forme que prend la production : un texte, un examen, un stage, une œuvre… Choisis un exemple, ou crée ton propre type avec « + Nouveau type… » : il restera dans ta banque, d'un trimestre à l'autre. Trois types ont un rôle à part dans la note : le portfolio, qui regroupe des artefacts dont ta pratique choisit ceux qui comptent ; l'artefact, qui n'a pas de pondération propre ; l'épreuve terminale, une seule par trimestre. »

5. L'infobulle du titre (cn-prod-titre) : « Décris ici les productions que tu demandes : ce que tes étudiant·es feront dans tes activités d'apprentissage (un texte, un stage, une œuvre…), avec leur grille, leur pondération et leur échéance. »

6. L'infobulle de la grille (cn-prod-grille) : « Associe une grille à cette production : ses critères sont ceux de ton évaluation. »

7. Les définitions affichées sous le menu au choix d'un type (gererChangementTypeProduction, productions.js) : retirées pour tous les types, sauf les trois qui changent le calcul. Chacune garde son nom en gras devant, comme aujourd'hui.
- Portfolio : « Regroupe les artefacts de tes étudiant·es pour montrer leur progression. Toutes les productions de type « Artefact » y entrent d'elles-mêmes, et ta pratique de notation choisit celles qui comptent. Le portfolio ne compte pas dans l'indice de complétion (C). »
- Artefact : « Une production rattachée au portfolio, centrée sur une tâche. Elle n'a pas de pondération propre : c'est le portfolio qui porte le poids dans la note. Pour régler la valeur des artefacts, va dans « Structure des évaluations », dans Conception › Pratiques. »
- Épreuve terminale : « La production qui clôt le trimestre ; une seule par trimestre, et facultative. En notation par standards, elle entre dans le calcul avec sa pondération (par exemple 40 %) ; le reste va aux artefacts du portfolio ou, sans artefact, aux productions retenues (par exemple 60 %). »
  Vérifie que « Structure des évaluations » est bien le nom affiché dans Conception › Pratiques ; sinon, dis-le, sans retoucher le texte toi-même.

LIVRAISON
- Étape 1 : l'entrée au BACKLOG, le tableau de la partie 1, et ta proposition pour la banque de la partie 2.
- Étape 2 : un test qui échoue avant ton code pour le rappel du codex ; un autre pour la banque : un type créé revient dans un autre trimestre, et une production qui le porte garde son nom après qu'on l'a retiré de la banque ; captures WebKit à 1180 px des écrans touchés, dont le menu « Type », « + Nouveau type… » et la définition d'un portfolio ; tes vérifications habituelles.
