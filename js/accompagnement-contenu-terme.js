/**
 * accompagnement-contenu-terme.js
 * Catalogue de contenu pour le mode `terme` (glossaire — 48 termes validés).
 * Source : docs/refonte-textes/glossaire-bloc6.md (19 avril 2026).
 *
 * Structure d'un terme : { cle, terme, categorie, etape, definition, voir }
 * Étapes : numerisation | croisement | observation | competence | transversal | interface
 *
 * Pousse les entrées dans CATALOGUE_ACCOMPAGNEMENT sous la clé
 * `terme-<cle>` via window.accompagnement.ajouterEntrees(). DOIT être
 * chargé APRÈS js/accompagnement.js.
 */
(function() {
'use strict';

const GLOSSAIRE = {

    'trimestre': {
        cle: 'trimestre',
        terme: 'Trimestre',
        categorie: 'R\u00e9glages',
        etape: 'numerisation',
        definition: 'P\u00e9riode de 15 semaines qui structure le calendrier de ton cours. Tu d\u00e9finis les dates de d\u00e9but et de fin, les cong\u00e9s et les journ\u00e9es de reprise. L\'application g\u00e9n\u00e8re automatiquement les s\u00e9ances \u00e0 partir de ces informations et de ton horaire.',
        voir: 'R\u00e9glages > Trimestre'
    },

    'cours': {
        cle: 'cours',
        terme: 'Cours',
        categorie: 'R\u00e9glages',
        etape: 'numerisation',
        definition: 'Le cours tel qu\'il appara\u00eet dans ton plan de cours. Le code suit le format 000-000-XX (discipline-cours-lettres). Un seul cours peut \u00eatre actif \u00e0 la fois dans l\'application. Tu peux dupliquer un cours pour cr\u00e9er rapidement une nouvelle session.',
        voir: 'R\u00e9glages > Cours'
    },

    'groupe-d-etudiant-es': {
        cle: 'groupe-d-etudiant-es',
        terme: 'Groupe d\'\u00e9tudiant\u00b7es',
        categorie: 'R\u00e9glages',
        etape: 'numerisation',
        definition: 'La liste de tes \u00e9tudiant\u00b7es pour un cours donn\u00e9. Tu peux les ajouter individuellement ou importer une liste depuis un tableur ou le syst\u00e8me de gestion institutionnel. Cette liste est la r\u00e9f\u00e9rence unique utilis\u00e9e partout dans l\'application.',
        voir: 'R\u00e9glages > Groupe'
    },

    'horaire': {
        cle: 'horaire',
        terme: 'Horaire',
        categorie: 'R\u00e9glages',
        etape: 'numerisation',
        definition: 'Le format de tes p\u00e9riodes de cours dans la semaine : 2\u00d72h (deux p\u00e9riodes s\u00e9par\u00e9es), 1\u00d74h (cours intensif en une seule p\u00e9riode) ou 1\u00d73h (une seule p\u00e9riode). L\'horaire, combin\u00e9 au trimestre, g\u00e9n\u00e8re automatiquement le calendrier de tes s\u00e9ances.',
        voir: 'R\u00e9glages > Horaire'
    },

    'groupe-cours': {
        cle: 'groupe-cours',
        terme: 'Groupe-cours',
        categorie: 'R\u00e9glages',
        etape: 'numerisation',
        definition: 'L\'assemblage qui relie ton trimestre, ton cours, ton groupe d\'\u00e9tudiant\u00b7es, ton horaire et ta pratique de notation. C\'est lui qui d\u00e9termine ce que tu vois partout dans l\'application. Il faut au minimum un trimestre, un cours, un groupe et un horaire pour l\'assembler.',
        voir: 'R\u00e9glages > Groupe-cours'
    },

    'production': {
        cle: 'production',
        terme: 'Production',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Une occasion pour tes \u00e9tudiant\u00b7es de mettre en pratique ce qu\'ils et elles apprennent \u2014 un exercice, un travail, un examen. Chaque production a une pond\u00e9ration et une \u00e9ch\u00e9ance. L\'ensemble des productions totalise 100 % de la note finale. Dans le module Planification, les productions sont d\'abord des mises en pratique li\u00e9es aux objectifs d\'apprentissage.',
        voir: 'Structure > Productions'
    },

    'portfolio': {
        cle: 'portfolio',
        terme: 'Portfolio',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Un type de production qui regroupe plusieurs artefacts. Tu d\u00e9finis combien d\'artefacts seront retenus (ex. : les 3 meilleurs sur 9) \u2014 ce sont les N meilleures d\u00e9monstrations de comp\u00e9tence qui comptent. Les artefacts individuels n\'ont pas de pond\u00e9ration propre : c\'est le portfolio conteneur qui porte le poids dans la note finale.',
        voir: 'Structure > Productions'
    },

    'artefact': {
        cle: 'artefact',
        terme: 'Artefact',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Une pi\u00e8ce individuelle \u00e0 l\'int\u00e9rieur d\'un portfolio \u2014 un travail, un exercice, une d\u00e9monstration. Plusieurs artefacts composent un portfolio, mais seuls les meilleurs sont retenus pour la note.',
        voir: 'Structure > Productions'
    },

    'grille-de-criteres': {
        cle: 'grille-de-criteres',
        terme: 'Grille de crit\u00e8res',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'L\'outil qui d\u00e9finit comment tu \u00e9values une production. Tu nommes tes crit\u00e8res, tu choisis leur type (holistique, analytique ou algorithmique) et tu r\u00e9partis les pond\u00e9rations pour totaliser 100 %. C\'est le m\u00eame principe qu\'une grille papier, mais r\u00e9utilisable d\'une production \u00e0 l\'autre.',
        voir: 'Structure > Grilles'
    },

    'type-de-critere': {
        cle: 'type-de-critere',
        terme: 'Type de crit\u00e8re',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'La m\u00e9thode d\'\u00e9valuation d\'un crit\u00e8re dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau global), analytique (tu attribues des points par \u00e9l\u00e9ment ou micro-t\u00e2che) et algorithmique (calcul automatique selon une formule, ex. : nombre d\'erreurs / nombre de mots \u00d7 100 pour le fran\u00e7ais \u00e9crit).',
        voir: 'Structure > Grilles'
    },

    'echelle-de-performance': {
        cle: 'echelle-de-performance',
        terme: '\u00c9chelle de performance',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Les niveaux que tu attribues \u00e0 chaque crit\u00e8re lors de l\'\u00e9valuation. Par d\u00e9faut, quatre niveaux align\u00e9s sur IDME : Insuffisant, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu. Tu configures les seuils, les valeurs ponctuelles et les couleurs selon ton jugement professionnel.',
        voir: 'Structure > \u00c9chelles'
    },

    'cartouche-de-retroaction': {
        cle: 'cartouche-de-retroaction',
        terme: 'Cartouche de r\u00e9troaction',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Matrice de commentaires g\u00e9n\u00e9raux automatiques que tu pr\u00e9pares une fois : un commentaire par combinaison crit\u00e8re \u00d7 niveau de performance. Lors de l\'\u00e9valuation, l\'application assemble automatiquement une r\u00e9troaction personnalis\u00e9e \u00e0 partir de ces commentaires. Pour \u00eatre efficaces, les commentaires doivent \u00eatre lus et compris \u2014 id\u00e9alement entre 50 et 75 mots.',
        voir: 'Structure > Cartouches'
    },

    'pratique-de-notation': {
        cle: 'pratique-de-notation',
        terme: 'Pratique de notation',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ta recette compl\u00e8te pour construire la note. Quatre pratiques sont disponibles : sommative (SOM), PAN par standards (STD), PAN par sp\u00e9cifications (SPE) et d\u00e9notation (DEN). La pratique d\u00e9termine comment les r\u00e9sultats de tes \u00e9valuations se transforment en note finale. Tu peux toujours la changer.',
        voir: 'Structure > Pratiques / R\u00e9glages > Pratiques'
    },

    'evaluation': {
        cle: 'evaluation',
        terme: '\u00c9valuation',
        categorie: '\u00c9valuations',
        etape: 'croisement',
        definition: 'Le geste d\'attribuer un niveau de performance \u00e0 chaque crit\u00e8re d\'une grille pour une production donn\u00e9e et un\u00b7e \u00e9tudiant\u00b7e donn\u00e9\u00b7e. La r\u00e9troaction se construit au fur et \u00e0 mesure que tu attribues les niveaux.',
        voir: '\u00c9valuations > Saisie'
    },

    'retroaction': {
        cle: 'retroaction',
        terme: 'R\u00e9troaction',
        categorie: '\u00c9valuations',
        etape: 'croisement',
        definition: 'Le commentaire personnalis\u00e9 que l\'application assemble automatiquement \u00e0 partir des cartouches. Chaque crit\u00e8re \u00e9valu\u00e9 contribue un fragment de texte ; l\'ensemble forme un retour structur\u00e9 que tu peux copier, exporter ou transmettre \u00e0 l\'\u00e9tudiant\u00b7e.',
        voir: '\u00c9valuations > Saisie'
    },

    'jeton': {
        cle: 'jeton',
        terme: 'Jeton',
        categorie: '\u00c9valuations',
        etape: 'croisement',
        definition: 'Une occasion suppl\u00e9mentaire offerte \u00e0 l\'\u00e9tudiant\u00b7e de d\u00e9montrer sa comp\u00e9tence ou son habilet\u00e9. Trois types disponibles : D\u00e9lai (temps suppl\u00e9mentaire selon une entente convenue), Reprise (nouvelle tentative compl\u00e8te \u2014 le r\u00e9sultat remplace le pr\u00e9c\u00e9dent) et Reprise cibl\u00e9e (nouvelle tentative sur des crit\u00e8res sp\u00e9cifiques). Les jetons favorisent la motivation intrins\u00e8que et l\'apprentissage profond plut\u00f4t que la simple am\u00e9lioration d\'une note.',
        voir: '\u00c9valuations > Jetons'
    },

    'tampon-estampe': {
        cle: 'tampon-estampe',
        terme: 'Tampon / Estampe',
        categorie: 'Travaux',
        etape: 'croisement',
        definition: 'Marques visuelles que tu apposes sur les copies import\u00e9es pour annoter le travail de l\'\u00e9tudiant\u00b7e. Ils permettent d\'identifier des \u00e9l\u00e9ments pr\u00e9cis (erreurs, r\u00e9ussites, points d\'attention) directement sur le document, comme tu le ferais avec un stylo sur une copie papier.',
        voir: 'Travaux > Annoter'
    },

    'presence-assiduite-saisie': {
        cle: 'presence-assiduite-saisie',
        terme: 'Pr\u00e9sence / Assiduit\u00e9 (saisie)',
        categorie: 'Pr\u00e9sences',
        etape: 'croisement',
        definition: 'La saisie des pr\u00e9sences et absences pour chaque s\u00e9ance. Les s\u00e9ances sont g\u00e9n\u00e9r\u00e9es automatiquement \u00e0 partir du calendrier et de l\'horaire. Cette donn\u00e9e alimente l\'indice A (Assiduit\u00e9) du tableau de bord.',
        voir: 'Pr\u00e9sences > Saisie'
    },

    'indice-a-assiduite': {
        cle: 'indice-a-assiduite',
        terme: 'Indice A \u2014 Assiduit\u00e9',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure l\'exposition de l\'\u00e9tudiant\u00b7e aux situations d\'apprentissage : sa pr\u00e9sence en classe, sa disponibilit\u00e9 \u00e0 recevoir l\'enseignement. Ce n\'est pas un jugement sur la qualit\u00e9 de sa participation \u2014 c\'est le constat qu\'il ou elle \u00e9tait l\u00e0, expos\u00e9\u00b7e au contenu. Un\u00b7e \u00e9tudiant\u00b7e absent\u00b7e ne peut pas apprendre ce qui a \u00e9t\u00e9 enseign\u00e9 ce jour-l\u00e0, quelle que soit sa comp\u00e9tence.',
        voir: 'Tableau de bord > Aper\u00e7u'
    },

    'indice-c-completion': {
        cle: 'indice-c-completion',
        terme: 'Indice C \u2014 Compl\u00e9tion',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure la r\u00e9gularit\u00e9 de la mise en pratique : l\'\u00e9tudiant\u00b7e remet-il ou elle ses productions ? Ce n\'est pas la qualit\u00e9 du travail qui est observ\u00e9e ici, mais le fait qu\'il ou elle s\'exerce. La compl\u00e9tion refl\u00e8te l\'engagement dans le processus d\'apprentissage \u2014 un\u00b7e \u00e9tudiant\u00b7e qui ne remet rien ne se pratique pas, ind\u00e9pendamment de son potentiel.',
        voir: 'Tableau de bord > Aper\u00e7u'
    },

    'indice-p-performance': {
        cle: 'indice-p-performance',
        terme: 'Indice P \u2014 Performance',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure la comp\u00e9tence d\u00e9montr\u00e9e au moment T : le r\u00e9sultat obtenu aux \u00e9valuations, exprim\u00e9 en chiffre ou en lettre selon la pratique de notation. C\'est une photographie, pas un pronostic. Un P faible avec un C \u00e9lev\u00e9 signale un\u00b7e \u00e9tudiant\u00b7e qui fournit l\'effort sans obtenir les r\u00e9sultats \u2014 c\'est un signal pour intervenir et regarder plus pr\u00e9cis\u00e9ment sur quel crit\u00e8re ou habilet\u00e9 se situe la difficult\u00e9.',
        voir: 'Tableau de bord > Aper\u00e7u'
    },

    'indices-a-c-p-ensemble': {
        cle: 'indices-a-c-p-ensemble',
        terme: 'Indices A-C-P (ensemble)',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Les trois indices r\u00e9sument le contexte d\'apprentissage observ\u00e9 de chaque \u00e9tudiant\u00b7e. Ensemble, ils forment un portrait : A dit \u00abest-ce que l\'\u00e9tudiant\u00b7e est expos\u00e9\u00b7e \u00e0 l\'apprentissage ?\u00bb, C dit \u00abest-ce qu\'il ou elle se pratique ?\u00bb, P dit \u00abest-ce que \u00e7a se traduit en comp\u00e9tence ?\u00bb. Les zones de couleur \u2014 Fragile, Mod\u00e9r\u00e9, Favorable, Tr\u00e8s favorable \u2014 aident \u00e0 rep\u00e9rer rapidement qui a besoin d\'attention. Cette lecture est subjective : elle est relative non seulement aux traces que laisse l\'\u00e9tudiant\u00b7e, mais aussi \u00e0 la lecture qu\'en fait l\'enseignant\u00b7e.',
        voir: 'Tableau de bord > Aper\u00e7u'
    },

    'pattern-d-apprentissage': {
        cle: 'pattern-d-apprentissage',
        terme: 'Pattern d\'apprentissage',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Un signal r\u00e9current dans la mobilisation observ\u00e9e d\'un\u00b7e \u00e9tudiant\u00b7e \u2014 par exemple, une tendance \u00e0 la baisse de compl\u00e9tion, une performance stable malgr\u00e9 des absences, ou un d\u00e9sengagement progressif. Les patterns aident \u00e0 rep\u00e9rer des dynamiques qui ne seraient pas visibles sur une seule \u00e9valuation.',
        voir: 'Tableau de bord > Aper\u00e7u / Liste'
    },

    'zone-de-couleur': {
        cle: 'zone-de-couleur',
        terme: 'Zone de couleur',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Le code visuel qui traduit chaque indice A-C-P en signal lisible : Fragile (attention requise), Mod\u00e9r\u00e9 (\u00e0 surveiller), Favorable (progression normale), Tr\u00e8s favorable (r\u00e9sultats solides). Les seuils sont configurables dans R\u00e9glages > D\u00e9pistage.',
        voir: 'Tableau de bord > Aper\u00e7u'
    },

    'rai-reponse-a-l-intervention': {
        cle: 'rai-reponse-a-l-intervention',
        terme: 'R\u00e0I \u2014 R\u00e9ponse \u00e0 l\'Intervention',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mod\u00e8le de soutien en trois niveaux, du plus large au plus cibl\u00e9. Niveau 1 (universel) : les pratiques p\u00e9dagogiques pour tout le groupe. Niveau 2 (pr\u00e9ventif) : interventions cibl\u00e9es pour les \u00e9tudiant\u00b7es montrant des difficult\u00e9s \u00e9mergentes. Niveau 3 (intensif) : accompagnement individualis\u00e9 pour les difficult\u00e9s persistantes. Le tableau de bord identifie les signaux ; c\'est l\'enseignant\u00b7e qui d\u00e9cide de l\'intervention.',
        voir: 'Tableau de bord > Interventions'
    },

    'niveau-rai': {
        cle: 'niveau-rai',
        terme: 'Niveau R\u00e0I',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Le niveau de soutien attribu\u00e9 \u00e0 un\u00b7e \u00e9tudiant\u00b7e selon les signaux du tableau de bord. Niveau 1 : aucune intervention sp\u00e9cifique n\u00e9cessaire. Niveau 2 : difficult\u00e9s \u00e9mergentes d\u00e9tect\u00e9es \u2014 intervention pr\u00e9ventive recommand\u00e9e. Niveau 3 : difficult\u00e9s persistantes \u2014 accompagnement intensif recommand\u00e9. Le niveau est calcul\u00e9 uniquement \u00e0 partir des crit\u00e8res multistructurels.',
        voir: 'Tableau de bord > Interventions'
    },

    'seuils-de-depistage': {
        cle: 'seuils-de-depistage',
        terme: 'Seuils de d\u00e9pistage',
        categorie: 'R\u00e9glages',
        etape: 'observation',
        definition: 'Les valeurs qui d\u00e9terminent les couleurs et les alertes dans le tableau de bord. Valeurs par d\u00e9faut : Progression 5 points (%), Direction du risque 5 points (%), D\u00e9fi \u226470 %. Toute modification s\'applique imm\u00e9diatement \u00e0 tous les calculs \u2014 diagnostics R\u00e0I, patterns et recommandations.',
        voir: 'R\u00e9glages > D\u00e9pistage'
    },

    'idme': {
        cle: 'idme',
        terme: 'IDME',
        categorie: 'Structure / Tableau de bord',
        etape: 'observation',
        definition: 'Quatre niveaux de performance align\u00e9s sur la taxonomie SOLO : Insuffisant, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu. Ces niveaux servent de r\u00e9f\u00e9rence dans les \u00e9chelles, les grilles et les cartouches. Ils d\u00e9crivent la qualit\u00e9 de la d\u00e9monstration de comp\u00e9tence \u00e0 un moment donn\u00e9.',
        voir: 'Structure > \u00c9chelles'
    },

    'solo': {
        cle: 'solo',
        terme: 'SOLO',
        categorie: 'Cadre th\u00e9orique',
        etape: 'observation',
        definition: 'Structure of Observed Learning Outcomes, d\u00e9velopp\u00e9e par Biggs and Collis (1982). Taxonomie qui d\u00e9crit la complexit\u00e9 croissante des r\u00e9ponses d\'apprentissage : pr\u00e9structurel, unistructurel, multistructurel, relationnel, abstrait \u00e9tendu. Dans Labo Codex, la taxonomie SOLO fonde les niveaux IDME et le d\u00e9pistage des actions cognitives.',
        voir: 'R\u00e9glages > D\u00e9pistage'
    },

    'aco-actions-cognitives-observees': {
        cle: 'aco-actions-cognitives-observees',
        terme: 'ACO \u2014 Actions Cognitives Observ\u00e9es',
        categorie: 'Tableau de bord / Travaux',
        etape: 'observation',
        definition: 'Trois actions cognitives observables que tu peux rep\u00e9rer sur les copies de tes \u00e9tudiant\u00b7es \u00e0 l\'aide de tampons ou estampes : Rep\u00e9rage (identifier un \u00e9l\u00e9ment), Liaison (relier des \u00e9l\u00e9ments entre eux) et Ouverture (transf\u00e9rer, g\u00e9n\u00e9raliser, critiquer). Les r\u00e9sultats alimentent le profil ACO et l\'export de recherche. Cette mesure est subjective \u2014 elle d\u00e9pend des traces que laisse l\'\u00e9tudiant\u00b7e et de la lecture qu\'en fait l\'enseignant\u00b7e. La dynamique ressemble \u00e0 une mycorrhization : des connexions cognitives invisibles se forment en profondeur, et ce n\'est que plus tard qu\'on voit l\'\u00e9mergence des fruits \u00e0 la surface.',
        voir: 'Travaux > Annoter / Tableau de bord > Profil'
    },

    'rlo-reperage-liaison-ouverture': {
        cle: 'rlo-reperage-liaison-ouverture',
        terme: 'RLO \u2014 Rep\u00e9rage, Liaison, Ouverture',
        categorie: 'Cadre th\u00e9orique',
        etape: 'observation',
        definition: 'Les trois actions cognitives qui composent l\'ACO. Le Rep\u00e9rage consiste \u00e0 identifier un \u00e9l\u00e9ment pertinent. La Liaison consiste \u00e0 relier des \u00e9l\u00e9ments entre eux (comparer, organiser, expliquer les relations). L\'Ouverture consiste \u00e0 aller au-del\u00e0 du donn\u00e9 (transf\u00e9rer, g\u00e9n\u00e9raliser, \u00e9mettre des hypoth\u00e8ses, critiquer). Ces trois actions correspondent aux niveaux de complexit\u00e9 croissante de la taxonomie SOLO.',
        voir: 'Travaux > Annoter'
    },

    'profil-aco': {
        cle: 'profil-aco',
        terme: 'Profil ACO',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Le portrait des actions cognitives observ\u00e9es chez un\u00b7e \u00e9tudiant\u00b7e, construit \u00e0 partir des annotations RLO sur ses copies. Le profil ACO montre la r\u00e9partition entre rep\u00e9rage, liaison et ouverture \u2014 il rend visible le type de pens\u00e9e que l\'\u00e9tudiant\u00b7e mobilise, pas seulement le r\u00e9sultat obtenu. C\'est un outil d\'observation, pas une note.',
        voir: 'Tableau de bord > Profil'
    },

    'engagement-cognitif': {
        cle: 'engagement-cognitif',
        terme: 'Engagement cognitif',
        categorie: 'Cadre th\u00e9orique',
        etape: 'observation',
        definition: 'La qualit\u00e9 de la mobilisation intellectuelle de l\'\u00e9tudiant\u00b7e \u2014 pas seulement sa pr\u00e9sence ou sa participation visible. L\'engagement cognitif est difficile \u00e0 mesurer directement : on l\'observe \u00e0 travers les questions pos\u00e9es, les r\u00e9ponses aux sollicitations (tirage au sort, questions flash) et surtout les traces \u00e9crites (annotations RLO). Les \u00e9valuations en sont le proxy le plus proche, mais elles restent ponctuelles. Cette mesure est fondamentalement subjective.',
        voir: 'Tableau de bord > Profil'
    },

    'alignement-pedagogique': {
        cle: 'alignement-pedagogique',
        terme: 'Alignement p\u00e9dagogique',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Le lien de coh\u00e9rence entre ce que tu vises (comp\u00e9tence, connaissances), comment tu l\'enseignes (activit\u00e9s, soutien) et comment tu le v\u00e9rifies (\u00e9valuations). La carte mentale de Labo Codex rend ces liens visibles et signale les incoh\u00e9rences \u2014 un objectif sans production li\u00e9e, une connaissance sans \u00e9valuation pr\u00e9vue. Ces alertes sont des pistes de r\u00e9flexion, pas des erreurs \u00e0 corriger.',
        voir: 'Planification > Alignement'
    },

    'carte-mentale': {
        cle: 'carte-mentale',
        terme: 'Carte mentale',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'L\'outil visuel interactif qui repr\u00e9sente l\'alignement p\u00e9dagogique de ton cours. Tu y places des n\u0153uds (comp\u00e9tence, connaissances, activit\u00e9s, \u00e9valuations) et tu les relies pour rendre visibles les connexions. La comp\u00e9tence du devis minist\u00e9riel ou du plan-cadre est un bon point de d\u00e9part.',
        voir: 'Planification > Alignement'
    },

    'noeud': {
        cle: 'noeud',
        terme: 'N\u0153ud',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un \u00e9l\u00e9ment cognitif dans la carte mentale : comp\u00e9tence, connaissance, activit\u00e9 d\'apprentissage, \u00e9valuation, soutien, etc. Chaque n\u0153ud peut \u00eatre reli\u00e9 \u00e0 d\'autres pour mat\u00e9rialiser l\'alignement p\u00e9dagogique.',
        voir: 'Planification > Alignement'
    },

    'sequence': {
        cle: 'sequence',
        terme: 'S\u00e9quence',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un regroupement de le\u00e7ons dans l\'organisateur. Les s\u00e9quences organisent tes le\u00e7ons sur les 15 semaines du trimestre. Une s\u00e9quence peut contenir plusieurs le\u00e7ons et couvrir plusieurs s\u00e9ances.',
        voir: 'Planification > Organisateur'
    },

    'lecon': {
        cle: 'lecon',
        terme: 'Le\u00e7on',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un plan p\u00e9dagogique structur\u00e9 \u00e0 l\'int\u00e9rieur d\'une s\u00e9quence. Chaque le\u00e7on peut suivre le canevas d\'enseignement explicite en 5 phases : ouverture, modelage, pratique guid\u00e9e, pratique autonome, objectivation.',
        voir: 'Planification > Organisateur'
    },

    'enseignement-explicite-5-phases': {
        cle: 'enseignement-explicite-5-phases',
        terme: 'Enseignement explicite (5 phases)',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Structure p\u00e9dagogique en cinq \u00e9tapes pour organiser une le\u00e7on : ouverture (activer les connaissances ant\u00e9rieures), modelage (d\u00e9montrer), pratique guid\u00e9e (accompagner), pratique autonome (laisser faire seul\u00b7e), objectivation (consolider). L\'option est disponible dans l\'organisateur mais n\'est pas impos\u00e9e.',
        voir: 'Planification > Organisateur'
    },

    'som-sommative': {
        cle: 'som-sommative',
        terme: 'SOM \u2014 Sommative',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique de notation traditionnelle qui calcule une moyenne pond\u00e9r\u00e9e des r\u00e9sultats. Chaque production contribue \u00e0 la note finale selon sa pond\u00e9ration.',
        voir: 'Structure > Pratiques'
    },

    'std-pan-par-standards': {
        cle: 'std-pan-par-standards',
        terme: 'STD \u2014 PAN par standards',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique alternative de notation qui retient les meilleures d\u00e9monstrations de comp\u00e9tence. L\'\u00e9tudiant\u00b7e progresse en montrant sa ma\u00eetrise, pas en accumulant des points. Le r\u00e9sultat le plus r\u00e9cent ou le meilleur peut remplacer les pr\u00e9c\u00e9dents, selon la configuration.',
        voir: 'Structure > Pratiques'
    },

    'spe-pan-par-specifications': {
        cle: 'spe-pan-par-specifications',
        terme: 'SPE \u2014 PAN par sp\u00e9cifications',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique alternative de notation qui fonctionne par contrat : chaque production est r\u00e9ussie ou non selon des crit\u00e8res pr\u00e9d\u00e9finis. C\'est l\'ensemble des cibles atteintes qui d\u00e9termine la note finale, pas une moyenne.',
        voir: 'Structure > Pratiques'
    },

    'den-denotation': {
        cle: 'den-denotation',
        terme: 'DEN \u2014 D\u00e9notation',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique qui r\u00e9duit ou \u00e9limine la notation chiffr\u00e9e au profit de la r\u00e9troaction qualitative. L\'accent est mis sur le commentaire et l\'accompagnement plut\u00f4t que sur le score.',
        voir: 'Structure > Pratiques'
    },

    'pan-pratique-alternative-de-notation': {
        cle: 'pan-pratique-alternative-de-notation',
        terme: 'PAN \u2014 Pratique Alternative de Notation',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Terme g\u00e9n\u00e9rique qui regroupe les pratiques STD, SPE et DEN \u2014 toutes les approches qui s\'\u00e9loignent de la sommative traditionnelle. Dans le contexte PAN, les productions sont d\'abord des occasions d\'apprentissage et de mise en pratique, pas des \u00e9preuves \u00e9valuatives.',
        voir: 'Structure > Pratiques'
    },

    'mode-assistance-icones': {
        cle: 'mode-assistance-icones',
        terme: 'Mode assistance (ic\u00f4nes \ud83d\udccd)',
        categorie: 'Pr\u00e9f\u00e9rences',
        etape: 'interface',
        definition: 'Quand ce mode est activ\u00e9 dans les Pr\u00e9f\u00e9rences, des ic\u00f4nes \ud83d\udccd apparaissent \u00e0 c\u00f4t\u00e9 des \u00e9l\u00e9ments de l\'interface. En cliquant dessus, tu obtiens une explication contextuelle de la section ou du champ concern\u00e9. Ce mode est ind\u00e9pendant du parcours guid\u00e9.',
        voir: 'R\u00e9glages > Pr\u00e9f\u00e9rences'
    },

    'parcours-guide-tour': {
        cle: 'parcours-guide-tour',
        terme: 'Parcours guid\u00e9 (tour)',
        categorie: 'Aide',
        etape: 'interface',
        definition: 'Un parcours en 6 \u00e9tapes qui te guide \u00e0 travers les sections essentielles de l\'application lors de ta premi\u00e8re utilisation. Tu peux le quitter \u00e0 tout moment, sauter une \u00e9tape ou y revenir depuis les Pr\u00e9f\u00e9rences. Le parcours est compl\u00e9mentaire au mode assistance.',
        voir: 'R\u00e9glages > Pr\u00e9f\u00e9rences'
    },

    'bilan-reflexif': {
        cle: 'bilan-reflexif',
        terme: 'Bilan r\u00e9flexif',
        categorie: 'R\u00e9glages',
        etape: 'interface',
        definition: 'Un espace dans les R\u00e9glages pour consigner tes observations sur ta d\u00e9marche p\u00e9dagogique : forces, d\u00e9fis et pistes d\'am\u00e9lioration. C\'est un outil de pratique r\u00e9flexive, pas un formulaire obligatoire.',
        voir: 'R\u00e9glages > Bilan'
    },

    'namespacing-prefixe-trimestre': {
        cle: 'namespacing-prefixe-trimestre',
        terme: 'Namespacing (pr\u00e9fixe trimestre)',
        categorie: 'Technique',
        etape: 'interface',
        definition: 'Les donn\u00e9es de l\'application sont pr\u00e9fix\u00e9es par le trimestre actif (ex. : `h2026_`, `a2025_`). Ce m\u00e9canisme permet de conserver les donn\u00e9es de plusieurs trimestres sans conflit et de basculer entre eux.',
        voir: 'R\u00e9glages > Donn\u00e9es'
    }

};

// Chaque terme { cle, terme, categorie, etape, definition, voir } devient
// une entrée { terme: {...} } dans CATALOGUE_ACCOMPAGNEMENT sous la clé
// `terme-<cle>` pour éviter tout conflit avec d'autres modes.
const entrees = {};
for (const cle in GLOSSAIRE) {
    if (Object.prototype.hasOwnProperty.call(GLOSSAIRE, cle)) {
        entrees['terme-' + cle] = { terme: GLOSSAIRE[cle] };
    }
}
window.accompagnement.ajouterEntrees(entrees);

})();
