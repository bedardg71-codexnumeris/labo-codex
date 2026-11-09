# Consigne : lot « Deux liens vers la carte d’alignement : l’objectif de la production, la compétence du cours »

**Recopiée par Cowork le 8 nov. 2026 vers 20 h 50 (heure de Montréal), mot pour mot, depuis la page du tri** (« Tri du chantier Labo Codex »), où elle vivait seule. En ligne : 1.237.2.

**Quand le lancer (page du tri)** : à lancer quand tu veux, sur une branche à part ; mesure et proposition d’abord, sans code

**Ce que Grégoire verra (page du tri)** : Tes décisions de 10 h 35 et 10 h 43, en concevant le cinquième parcours. Aujourd’hui, deux choses s’écrivent en double sans lien : l’« Objectif d’apprentissage » d’une production et l’objectif de leçon de la carte ; la compétence de la fiche du cours (Cadre › Trimestre) et le bloc Compétence de la carte. Ce que tu verras : chaque paire est reliée, et on n’écrit plus la même chose deux fois. Claude Code mesure d’abord et te propose sa solution pour chacune (ce qui fait foi, le geste qui crée le lien, ce que deviennent les données déjà remplies) avant de coder.

**Références (page du tri)** : (document « Parcours d’assistance : cinquième parcours », section « Backlog et trouvailles » ; js/productions.js, js/trimestre-v2-cours.js, js/planification-carte.js)

---

Lot « Deux liens vers la carte d'alignement : l'objectif de la production, la compétence du cours ». Indépendant des autres lots ; sur une branche à part. Mêmes règles : pas de fusion vers main ni de publication sans l'accord de Grégoire, rien au changelog. Aucun texte lu par l'utilisateur ne change sans être soumis à Grégoire, le libellé d'un bouton ou d'une infobulle compris.

POURQUOI
La carte d'alignement montre comment les leçons et les productions mènent à la compétence d'un cours. Deux choses s'y écrivent aujourd'hui en double, sans lien entre les deux exemplaires : l'enseignant·e les tape deux fois, et les deux textes peuvent diverger.
1. L'objectif : une production porte son « Objectif d'apprentissage » (Conception › Productions) ; la carte a ses objectifs de leçon, que les activités servent et que les évaluations vérifient. Décision de Grégoire (8 nov., 10 h 35) : « les deux éléments devraient être reliés ».
2. La compétence : la fiche du cours (Cadre › Trimestre) porte le numéro, l'énoncé et les éléments de la compétence ; la carte a son bloc Compétence. Décision de Grégoire (8 nov., 10 h 43) : les relier « de la même façon ».
Dans les deux cas : un lien, pas une copie.

LE CONSTAT (lu dans le code par Cowork le 8 nov., sur main cafc89ff2, sans l'exécuter ; à confirmer par ta mesure)
Partie 1, l'objectif
- La production : bloc « Objectif d'apprentissage » (clé objectif, BLOCS_ANCRES, productions.js), un seul champ texte, marqué recommandé, invite « À la fin de cette activité, l'étudiant·e sera capable de... ». Il s'imprime sur la feuille de consignes (« Préparer le PDF ») et en tête de la synthèse de rétroaction (« Objectif : … »).
- La carte : les objectifs vivent dans la leçon (metadata.objectifs, chacun avec un id et un texte ; badge 🎯 de l'en-tête). Les blocs qui servent un objectif portent metadata.objectifsServis, limités aux objectifs de leur propre leçon ; une évaluation coche les objectifs qu'elle vérifie (#964) ; le bloc Évaluation porte metadata.productionId (sélecteur « Production » de son Inspecteur).
- Aucune lecture de l'objectif d'une production dans planification-carte.js ni dans planification-export.js.
Partie 2, la compétence
- La fiche du cours : « N° de la compétence » (numeroCompetence, ex. 4EF0), « Compétence » (competence), « Éléments de compétence » (elementsCompetence, une zone de texte, un élément par ligne) ; trimestre-v2-cours.js, index.html. Lus par l'aperçu du cours (cours.js) et par le modèle de relecture par IA de la carte (construireDonneesModele, planification-export.js).
- La carte : le bloc Compétence (type competence) n'a qu'un titre et une description libres ; il ne lit pas la fiche du cours. Une carte est déjà rattachée à un cours (coursId de son entrée d'index, posé à la création, « Rattacher » dans la bibliothèque) : le pont existe au niveau de la carte, pas du bloc.
- Grégoire : un cours vise en général une seule compétence, parfois plusieurs. La fiche n'en porte qu'une.

EN DEUX TEMPS
1. Inscris les deux entrées au BACKLOG. Mesure, puis rends à Grégoire, en quelques lignes pour chaque partie, ta proposition :
   - ce qui fait foi : la production ou la leçon ; la fiche du cours ou le bloc ; ou un texte partagé par les deux ;
   - le sens du lien et le geste qui le crée (par exemple : une évaluation reliée à une production propose l'objectif de cette production ; un bloc Compétence créé dans une carte rattachée à un cours reprend la compétence de sa fiche) ;
   - ce que l'enseignant·e voit dans chacun des deux écrans, et ce qui se passe quand il ou elle modifie l'un des deux textes ;
   - les cas multiples : un objectif de production qui en contient plusieurs (texte libre) ; un cours qui vise plusieurs compétences ;
   - ce qui voyage : productions, cartes et cours partagés, importés, repris d'un trimestre à l'autre ;
   - le stock : productions, cartes et fiches de cours déjà remplies chez les gens, parfois avec deux textes déjà différents. Tarir n'est pas réparer : dis ce que ta solution leur fait ; rien n'est écrit dans leurs données sans l'accord de Grégoire.
   Attends son accord avant de coder.
2. Code, sur la même branche, ce qu'il aura accepté.

À RESPECTER
- La feuille de consignes et la synthèse de rétroaction impriment l'objectif de la production : ce que lisent les étudiant·es ne change pas sans l'accord de Grégoire.
- Ne retire aucune donnée d'utilisateur.

POUR LA SUITE
Le cinquième parcours de l'assistance (« Planifier tes leçons », en conception avec Cowork) en dépend à deux endroits. Ta solution changera ces phrases : dis comment, Grégoire les reverra. Ne les pose nulle part toi-même.
- Étape 1 : « … touche « Compétence » dans la palette « Nœuds », puis écris son énoncé, tel que le devis ministériel décrit la compétence et ses éléments. »
- Étape 4 : « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, reprends-le ici. »

LIVRAISON
- Étape 1 : les deux entrées au BACKLOG et ta proposition.
- Étape 2 : pour chaque partie, un test qui échoue avant ton code ; captures WebKit à 1180 px de la fiche de production, de la fiche du cours et de la carte, avant et après le lien ; tes vérifications habituelles.
