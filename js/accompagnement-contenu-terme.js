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
        categorie: 'Réglages',
        etape: 'numerisation',
        definition: 'Période de 15 semaines qui structure le calendrier de ton cours. Tu définis les dates de début et de fin, les congés et les journées de reprise. L\'application génère automatiquement les séances à partir de ces informations et de ton horaire.',
        voir: 'Cadre > Trimestre'
    },

    'cours': {
        cle: 'cours',
        terme: 'Cours',
        categorie: 'Réglages',
        etape: 'numerisation',
        definition: 'Le cours tel qu\'il apparaît dans ton plan de cours. Le code suit le format 000-000-XX (discipline-cours-lettres). Un seul cours peut être actif à la fois dans l\'application. Tu peux dupliquer un cours pour créer rapidement une nouvelle session.',
        voir: 'Cadre > Trimestre > Cours'
    },

    'groupe-d-etudiant-es': {
        cle: 'groupe-d-etudiant-es',
        terme: 'Groupe d\'étudiant·es',
        categorie: 'Réglages',
        etape: 'numerisation',
        definition: 'La liste de tes étudiant·es pour un cours donné. Tu peux les ajouter individuellement ou importer une liste depuis un tableur ou le système de gestion institutionnel. Cette liste est la référence unique utilisée partout dans l\'application.',
        voir: 'Cadre'
    },

    'horaire': {
        cle: 'horaire',
        terme: 'Horaire',
        categorie: 'Réglages',
        etape: 'numerisation',
        definition: 'Tes séances de cours dans la semaine : pour chacune, le jour, les heures et le nombre de périodes. L\'horaire, combiné au trimestre, génère automatiquement le calendrier de tes séances.',
        voir: 'Cadre'
    },

    'groupe-cours': {
        cle: 'groupe-cours',
        terme: 'Groupe-cours',
        categorie: 'Réglages',
        etape: 'numerisation',
        definition: 'L\'assemblage qui relie ton trimestre, ton cours, ton groupe d\'étudiant·es, ton horaire et ta pratique de notation. C\'est lui qui détermine ce que tu vois partout dans l\'application. Il faut au minimum un trimestre, un cours, un groupe et un horaire pour l\'assembler.',
        voir: 'Cadre'
    },

    'production': {
        cle: 'production',
        terme: 'Production',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Une occasion pour tes étudiant·es de mettre en pratique ce qu\'ils et elles apprennent — un exercice, un travail, un examen. Chaque production a une pondération et une échéance. L\'ensemble des productions totalise 100\u00a0% de la note finale. Dans le module Planification, les productions sont d\'abord des mises en pratique liées aux objectifs d\'apprentissage.',
        voir: 'Conception > Productions'
    },

    'portfolio': {
        cle: 'portfolio',
        terme: 'Portfolio',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Un type de production qui regroupe plusieurs artefacts. Tu définis combien d\'artefacts seront retenus (ex. : les 3 meilleurs sur 9) — ce sont les N meilleures démonstrations de compétence qui comptent. Les artefacts individuels n\'ont pas de pondération propre : c\'est le portfolio conteneur qui porte le poids dans la note finale.',
        voir: 'Conception > Productions'
    },

    'artefact': {
        cle: 'artefact',
        terme: 'Artefact',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Une pièce individuelle à l\'intérieur d\'un portfolio — un travail, un exercice, une démonstration. Plusieurs artefacts composent un portfolio, mais seuls les meilleurs sont retenus pour la note.',
        voir: 'Conception > Productions'
    },

    'grille-de-criteres': {
        cle: 'grille-de-criteres',
        terme: 'Grille de critères',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'L\'outil qui définit comment tu évalues une production. Tu nommes tes critères, tu choisis leur type (holistique, analytique ou algorithmique) et tu répartis les pondérations pour totaliser 100\u00a0%. C\'est le même principe qu\'une grille papier, mais réutilisable d\'une production à l\'autre.',
        voir: 'Conception > Grilles'
    },

    'type-de-critere': {
        cle: 'type-de-critere',
        terme: 'Type de critère',
        categorie: 'Structure',
        etape: 'numerisation',
        // A4, validé G. 20 oct. 2026, 9 h 23 : ce que fait l'application (un niveau, ou des points que décrit un barème).
        definition: 'La méthode d’évaluation d’un critère dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau de l’échelle de performance), analytique (tu attribues des points, que son barème décrit) et algorithmique (une formule calcule la note à partir de ce que tu comptes sur la copie).',
        voir: 'Conception > Grilles'
    },

    'echelle-de-performance': {
        cle: 'echelle-de-performance',
        terme: 'Échelle de performance',
        categorie: 'Structure',
        etape: 'numerisation',
        // A3, validé G. 20 oct. 2026, 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md) : les critères holistiques seuls.
        definition: 'Les niveaux que tu attribues aux critères holistiques lors de l’évaluation ; une seule échelle par évaluation. Par défaut, quatre niveaux alignés sur IDME : Incomplet, Développement, Maîtrise, Étendu. Tu configures les seuils, les valeurs ponctuelles et les couleurs selon ton jugement professionnel.',
        voir: 'Conception > Échelles'
    },

    // Les six étiquettes d'« Apporter mon matériel » : définitions de la section « Apporter une grille que
    // tu as déjà » de l'onglet Aide (D4, validées par Grégoire le 19 oct. 2026, 19 h 01), mot pour mot —
    // un banc les compare. « Niveau (de performance) » ne se confond pas avec « Niveau RàI ».
    'critere': {
        cle: 'critere',
        terme: 'Critère',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ce qui est attendu ; la question que tu te poses devant la copie.',
        voir: 'Conception > Grilles'
    },

    'element-observable': {
        cle: 'element-observable',
        terme: 'Élément observable',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ce que tu regardes dans toutes les copies pour juger d’un critère. On dit aussi sous-critère.',
        voir: 'Conception > Grilles'
    },

    'descripteur': {
        cle: 'descripteur',
        terme: 'Descripteur',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ce que tu observes dans une copie, à un niveau donné ; une réponse possible à la question du critère. Une seule vaut pour une copie.',
        voir: 'Conception > Grilles'
    },

    'niveau-de-performance': {
        cle: 'niveau-de-performance',
        terme: 'Niveau (de performance)',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Le nom d’un stade de qualité du travail observé, par exemple « Sommaire » ou « Efficace ».',
        voir: 'Conception > Échelles'
    },

    'points': {
        cle: 'points',
        terme: 'Points',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ce que vaut une réponse, en chiffres.',
        voir: 'Conception > Grilles'
    },

    // #1120, lot 2 (20 oct. 2026) : A1 et A2, validés G. 20 oct. 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md),
    // la source unique des deux définitions.
    'bareme': {
        cle: 'bareme',
        terme: 'Barème',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Pour un critère noté en points, ce que valent ces points : une suite de tranches, chacune avec ses points et ce qu’on attend d’une copie qui les obtient. Chaque critère analytique a son propre barème.',
        voir: 'Conception > Grilles'
    },

    'tranche': {
        cle: 'tranche',
        terme: 'Tranche',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Une partie d’un barème : des points (un nombre, comme 2, ou deux bornes, comme 3 à 4), ce qu’on attend d’une copie qui les obtient et, si tu veux, un nom, comme « Partiel ».',
        voir: 'Conception > Grilles'
    },

    'ponderation': {
        cle: 'ponderation',
        terme: 'Pondération',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Le poids d’un critère dans la grille.',
        voir: 'Conception > Grilles'
    },

    'cartouche-de-retroaction': {
        cle: 'cartouche-de-retroaction',
        terme: 'Cartouche de rétroaction',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Matrice de commentaires généraux automatiques que tu prépares une fois : un commentaire par combinaison critère × niveau de performance. Lors de l\'évaluation, l\'application assemble automatiquement une rétroaction personnalisée à partir de ces commentaires. Pour être efficaces, les commentaires doivent être lus et compris — idéalement entre 50 et 75 mots.',
        voir: 'Conception > Cartouches'
    },

    'pratique-de-notation': {
        cle: 'pratique-de-notation',
        terme: 'Pratique de notation',
        categorie: 'Structure',
        etape: 'numerisation',
        definition: 'Ta recette complète pour construire la note. Quatre pratiques sont disponibles : sommative (SOM), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). La pratique détermine comment les résultats de tes évaluations se transforment en note finale. Tu peux toujours la changer.',
        voir: 'Conception > Pratiques de notation'
    },

    'evaluation': {
        cle: 'evaluation',
        terme: 'Évaluation',
        categorie: 'Évaluations',
        etape: 'croisement',
        definition: 'Le geste d\'attribuer un niveau de performance à chaque critère d\'une grille pour une production donnée et un·e étudiant·e donné·e. La rétroaction se construit au fur et à mesure que tu attribues les niveaux.',
        voir: 'Évaluations > Saisie'
    },

    'retroaction': {
        cle: 'retroaction',
        terme: 'Rétroaction',
        categorie: 'Évaluations',
        etape: 'croisement',
        definition: 'Le commentaire personnalisé que l\'application assemble automatiquement à partir des cartouches. Chaque critère évalué contribue un fragment de texte ; l\'ensemble forme un retour structuré que tu peux copier, exporter ou transmettre à l\'étudiant·e.',
        voir: 'Évaluations > Saisie'
    },

    'jeton': {
        cle: 'jeton',
        terme: 'Jeton',
        categorie: 'Évaluations',
        etape: 'croisement',
        definition: 'Une occasion supplémentaire offerte à l\'étudiant·e de démontrer sa compétence ou son habileté. Trois types disponibles : Délai (temps supplémentaire selon une entente convenue), Reprise (nouvelle tentative complète — le résultat remplace le précédent) et Reprise ciblée (nouvelle tentative sur des critères spécifiques). Les jetons favorisent la motivation intrinsèque et l\'apprentissage profond plutôt que la simple amélioration d\'une note.',
        voir: 'Évaluations > Jetons'
    },

    'tampon-estampe': {
        cle: 'tampon-estampe',
        terme: 'Tampon / Estampe',
        categorie: 'Travaux',
        etape: 'croisement',
        definition: 'Marques visuelles que tu apposes sur les copies importées pour annoter le travail de l\'étudiant·e. Ils permettent d\'identifier des éléments précis (erreurs, réussites, points d\'attention) directement sur le document, comme tu le ferais avec un stylo sur une copie papier.',
        voir: 'Travaux > Annoter'
    },

    'presence-assiduite-saisie': {
        cle: 'presence-assiduite-saisie',
        terme: 'Présence / Assiduité (saisie)',
        categorie: 'Présences',
        etape: 'croisement',
        definition: 'La saisie des présences et absences pour chaque séance. Les séances sont générées automatiquement à partir du calendrier et de l\'horaire. Cette donnée alimente l\'indice A (Assiduité) du tableau de bord.',
        voir: 'Présences > Saisie'
    },

    'indice-a-assiduite': {
        cle: 'indice-a-assiduite',
        guide: 'acp',
        terme: 'Indice A — Assiduité',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure l\'exposition de l\'étudiant·e aux situations d\'apprentissage : sa présence en classe, sa disponibilité à recevoir l\'enseignement. Ce n\'est pas un jugement sur la qualité de sa participation — c\'est le constat qu\'il ou elle était là, exposé·e au contenu. Un·e étudiant·e absent·e ne peut pas apprendre ce qui a été enseigné ce jour-là, quelle que soit sa compétence.',
        voir: 'Tableau de bord > Aperçu'
    },

    'indice-c-completion': {
        cle: 'indice-c-completion',
        guide: 'acp',
        terme: 'Indice C — Complétion',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure la régularité de la mise en pratique : l\'étudiant·e remet-il ou elle ses productions ? Ce n\'est pas la qualité du travail qui est observée ici, mais le fait qu\'il ou elle s\'exerce. La complétion reflète l\'engagement dans le processus d\'apprentissage — un·e étudiant·e qui ne remet rien ne se pratique pas, indépendamment de son potentiel.',
        voir: 'Tableau de bord > Aperçu'
    },

    'indice-p-performance': {
        cle: 'indice-p-performance',
        guide: 'acp',
        terme: 'Indice P — Performance',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Mesure la compétence démontrée au moment T : le résultat obtenu aux évaluations, exprimé en chiffre ou en lettre selon la pratique de notation. C\'est une photographie, pas un pronostic. Un P faible avec un C élevé signale un·e étudiant·e qui fournit l\'effort sans obtenir les résultats — c\'est un signal pour intervenir et regarder plus précisément sur quel critère ou habileté se situe la difficulté.',
        voir: 'Tableau de bord > Aperçu'
    },

    'indices-a-c-p-ensemble': {
        cle: 'indices-a-c-p-ensemble',
        terme: 'Indices A-C-P (ensemble)',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Les trois indices résument le contexte d\'apprentissage observé de chaque étudiant·e. Ensemble, ils forment un portrait : A dit «est-ce que l\'étudiant·e est exposé·e à l\'apprentissage ?», C dit «est-ce qu\'il ou elle se pratique ?», P dit «est-ce que ça se traduit en compétence ?». Les zones de couleur aident à repérer rapidement qui a besoin d\'attention. Cette lecture est subjective : elle est relative non seulement aux traces que laisse l\'étudiant·e, mais aussi à la lecture qu\'en fait l\'enseignant·e.',
        voir: 'Tableau de bord > Aperçu'
    },

    'pattern-d-apprentissage': {
        cle: 'pattern-d-apprentissage',
        guide: 'rai',
        terme: 'Pattern d\'apprentissage',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Un signal récurrent dans la mobilisation observée d\'un·e étudiant·e — par exemple, une tendance à la baisse de complétion, une performance stable malgré des absences, ou un désengagement progressif. Les patterns aident à repérer des dynamiques qui ne seraient pas visibles sur une seule évaluation.',
        voir: 'Tableau de bord > Aperçu / Liste'
    },

    'zone-de-couleur': {
        cle: 'zone-de-couleur',
        terme: 'Zone de couleur',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Les paliers de couleur qui traduisent chaque indice A-C-P dans la liste des étudiant·es. Trois seuils découpent quatre bandes : fragile sous le premier, acceptable jusqu’au deuxième, bon jusqu’au troisième, excellent au-delà — chaque curseur ferme la bande qu’il nomme. Les trois se règlent dans Labo > Outils d’observation > Micro-données ACP > Seuils d’interprétation (70 / 80 / 85\u00a0% par défaut) et valent pour A, C, P et M. La barre de l’Aperçu, elle, ne suit pas ces paliers : c’est un dégradé continu, dont la couleur est interpolée.',
        voir: 'Tableau de bord > Liste · Labo > Outils d’observation'
    },

    'rai-reponse-a-l-intervention': {
        cle: 'rai-reponse-a-l-intervention',
        guide: 'rai',
        terme: 'RàI — Réponse à l\'Intervention',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Modèle de soutien en trois niveaux, du plus large au plus ciblé. Niveau 1 (universel) : les pratiques pédagogiques pour tout le groupe. Niveau 2 (préventif) : interventions ciblées pour les étudiant·es montrant des difficultés émergentes. Niveau 3 (intensif) : accompagnement individualisé pour les difficultés persistantes. Le tableau de bord identifie les signaux ; c\'est l\'enseignant·e qui décide de l\'intervention.',
        voir: 'Tableau de bord > Interventions'
    },

    'niveau-rai': {
        cle: 'niveau-rai',
        guide: 'rai',
        terme: 'Niveau RàI',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Le niveau de soutien attribué à un·e étudiant·e selon les signaux du tableau de bord. Niveau 1 : aucune intervention spécifique nécessaire. Niveau 2 : difficultés émergentes détectées — intervention préventive recommandée. Niveau 3 : difficultés persistantes — accompagnement intensif recommandé. Le niveau se décide d’après la performance P, quand la note existe, et d’après le pattern des derniers artefacts (3 par défaut), qui lit tous les critères de la grille de référence sauf ceux marqués « Aucun ». L’indice de persistance (IPB) nomme la cible de l’intervention ; il ne fixe pas le niveau.',
        voir: 'Tableau de bord > Interventions'
    },

    'seuils-de-depistage': {
        cle: 'seuils-de-depistage',
        terme: 'Seuils de dépistage',
        categorie: 'Réglages',
        etape: 'observation',
        definition: 'Les valeurs qui déterminent les couleurs et les alertes dans le tableau de bord. Valeurs par défaut : Progression 5 points (%), Sensibilité des flèches par critère 5 points (%), Défi ≤70\u00a0%. Toute modification s\'applique immédiatement à tous les calculs — diagnostics RàI, patterns et recommandations.',
        voir: 'Labo > Outils d’observation'
    },

    'idme': {
        cle: 'idme',
        guide: 'solo',
        terme: 'IDME',
        categorie: 'Structure / Tableau de bord',
        etape: 'observation',
        definition: 'Quatre niveaux de performance alignés sur la taxonomie SOLO : Incomplet, Développement, Maîtrise, Étendu. Ces niveaux servent de référence dans les échelles, les grilles et les cartouches. Ils décrivent la qualité de la démonstration de compétence à un moment donné.',
        voir: 'Conception > Échelles'
    },

    'solo': {
        cle: 'solo',
        guide: 'solo',
        terme: 'SOLO',
        categorie: 'Cadre théorique',
        etape: 'observation',
        definition: 'Structure of Observed Learning Outcomes, développée par Biggs and Collis (1982). Taxonomie qui décrit la complexité croissante des réponses d\'apprentissage : préstructurel, unistructurel, multistructurel, relationnel, abstrait étendu. Dans Labo Codex, la taxonomie SOLO fonde les niveaux IDME et le dépistage des actions cognitives.',
        voir: 'Labo > Outils d’observation'
    },

    'aco-actions-cognitives-observees': {
        cle: 'aco-actions-cognitives-observees',
        terme: 'ACO — Actions Cognitives Observées',
        categorie: 'Tableau de bord / Travaux',
        etape: 'observation',
        definition: 'Trois actions cognitives observables que tu peux repérer sur les copies de tes étudiant·es à l\'aide de tampons ou estampes : Repérage (identifier un élément), Liaison (relier des éléments entre eux) et Ouverture (transférer, généraliser, critiquer). Les résultats alimentent le profil ACO et l\'export de recherche. Cette mesure est subjective — elle dépend des traces que laisse l\'étudiant·e et de la lecture qu\'en fait l\'enseignant·e. La dynamique ressemble à une mycorrhization : des connexions cognitives invisibles se forment en profondeur, et ce n\'est que plus tard qu\'on voit l\'émergence des fruits à la surface.',
        voir: 'Travaux > Annoter / Tableau de bord > Profil'
    },

    'rlo-reperage-liaison-ouverture': {
        cle: 'rlo-reperage-liaison-ouverture',
        terme: 'RLO — Repérage, Liaison, Ouverture',
        categorie: 'Cadre théorique',
        etape: 'observation',
        definition: 'Les trois actions cognitives qui composent l\'ACO. Le Repérage consiste à identifier un élément pertinent. La Liaison consiste à relier des éléments entre eux (comparer, organiser, expliquer les relations). L\'Ouverture consiste à aller au-delà du donné (transférer, généraliser, émettre des hypothèses, critiquer). Ces trois actions correspondent aux niveaux de complexité croissante de la taxonomie SOLO.',
        voir: 'Travaux > Annoter'
    },

    'profil-aco': {
        cle: 'profil-aco',
        terme: 'Profil ACO',
        categorie: 'Tableau de bord',
        etape: 'observation',
        definition: 'Le portrait des actions cognitives observées chez un·e étudiant·e, construit à partir des annotations RLO sur ses copies. Le profil ACO montre la répartition entre repérage, liaison et ouverture — il rend visible le type de pensée que l\'étudiant·e mobilise, pas seulement le résultat obtenu. C\'est un outil d\'observation, pas une note.',
        voir: 'Tableau de bord > Profil'
    },

    'engagement-cognitif': {
        cle: 'engagement-cognitif',
        terme: 'Engagement cognitif',
        categorie: 'Cadre théorique',
        etape: 'observation',
        definition: 'La qualité de la mobilisation intellectuelle de l\'étudiant·e — pas seulement sa présence ou sa participation visible. L\'engagement cognitif est difficile à mesurer directement : on l\'observe à travers les questions posées, les réponses aux sollicitations (tirage au sort, questions flash) et surtout les traces écrites (annotations RLO). Les évaluations en sont le proxy le plus proche, mais elles restent ponctuelles. Cette mesure est fondamentalement subjective.',
        voir: 'Tableau de bord > Profil'
    },

    'alignement-pedagogique': {
        cle: 'alignement-pedagogique',
        terme: 'Alignement pédagogique',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Le lien de cohérence entre ce que tu vises (compétence, connaissances), comment tu l\'enseignes (activités, soutien) et comment tu le vérifies (évaluations). La carte mentale de Labo Codex rend ces liens visibles et signale les incohérences — un objectif sans production liée, une connaissance sans évaluation prévue. Ces alertes sont des pistes de réflexion, pas des erreurs à corriger.',
        voir: 'Conception > Carte d\'alignement'
    },

    'carte-mentale': {
        cle: 'carte-mentale',
        terme: 'Carte mentale',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'L\'outil visuel interactif qui représente l\'alignement pédagogique de ton cours. Tu y places des nœuds (compétence, connaissances, activités, évaluations) et tu les relies pour rendre visibles les connexions. La compétence du devis ministériel ou du plan-cadre est un bon point de départ.',
        voir: 'Conception > Carte d\'alignement'
    },

    'noeud': {
        cle: 'noeud',
        terme: 'Nœud',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un élément cognitif dans la carte mentale : compétence, connaissance, activité d\'apprentissage, évaluation, soutien, etc. Chaque nœud peut être relié à d\'autres pour matérialiser l\'alignement pédagogique.',
        voir: 'Conception > Carte d\'alignement'
    },

    'sequence': {
        cle: 'sequence',
        terme: 'Séquence',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un regroupement de leçons qui poursuivent les mêmes idées maîtresses. La séquence est un regroupement LOGIQUE, pas une case du calendrier : c\'est chaque leçon qui porte sa semaine. Une séquence peut en contenir une autre.',
        voir: 'Conception > Carte d\'alignement'
    },

    'lecon': {
        cle: 'lecon',
        terme: 'Leçon',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Un bloc pédagogique à l\'intérieur d\'une séquence, porteur de ses objectifs et de sa semaine. Une leçon peut s\'étaler sur plusieurs séances. Elle accueille des connaissances, des activités et des évaluations — dont, si tu le veux, les cinq blocs d\'enseignement explicite.',
        voir: 'Conception > Carte d\'alignement'
    },

    'enseignement-explicite-5-phases': {
        cle: 'enseignement-explicite-5-phases',
        terme: 'Enseignement explicite (5 phases)',
        categorie: 'Planification',
        etape: 'competence',
        definition: 'Structure pédagogique en cinq étapes pour organiser une leçon : Ouverture (capter l\'attention, justifier l\'objectif, vérifier les préalables), Modélisation (démontrer), Pratique guidée (accompagner), Pratique autonome (laisser faire seul·e), Clôture (synthétiser). Les cinq blocs sont dans la palette de la carte, dans leur propre zone — ce sont des activités à part entière, et rien ne t\'oblige à les utiliser.',
        voir: 'Conception > Carte d\'alignement'
    },

    'som-sommative': {
        cle: 'som-sommative',
        terme: 'SOM — Sommative',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique de notation traditionnelle qui calcule une moyenne pondérée des résultats. Chaque production contribue à la note finale selon sa pondération.',
        voir: 'Conception > Pratiques'
    },

    'std-pan-par-standards': {
        cle: 'std-pan-par-standards',
        terme: 'STD — PAN par standards',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique alternative de notation qui retient les meilleures démonstrations de compétence. L\'étudiant·e progresse en montrant sa maîtrise, pas en accumulant des points. Le résultat le plus récent ou le meilleur peut remplacer les précédents, selon la configuration.',
        voir: 'Conception > Pratiques'
    },

    'spe-pan-par-specifications': {
        cle: 'spe-pan-par-specifications',
        terme: 'SPE — PAN par spécifications',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique alternative de notation qui fonctionne par contrat : chaque production est réussie ou non selon des critères prédéfinis. C\'est l\'ensemble des cibles atteintes qui détermine la note finale, pas une moyenne.',
        voir: 'Conception > Pratiques'
    },

    'den-denotation': {
        cle: 'den-denotation',
        terme: 'DEN — Dénotation',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Pratique (PRÉN) qui retire la note chiffrée des travaux en cours de route au profit d\'une rétroaction qualitative appuyée sur des cibles et des critères explicites (grille, échelle). La note certificative (RREC : 60 réussite / 59 échec) est posée par jugement à la fin — jamais « pas de note ».',
        voir: 'Conception > Pratiques'
    },

    'pan-pratique-alternative-de-notation': {
        cle: 'pan-pratique-alternative-de-notation',
        terme: 'PAN — Pratique Alternative de Notation',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). La Dénotation (DEN) est une PRÉN ; l\'application lui donne aussi le badge « PAN » par commodité. Dans le contexte PAN, les productions sont d\'abord des occasions d\'apprentissage et de mise en pratique, pas des épreuves évaluatives.',
        voir: 'Conception > Pratiques'
    },

    'mode-assistance-icones': {
        cle: 'mode-assistance-icones',
        terme: 'Mode assistance (icônes 📍)',
        categorie: 'Préférences',
        etape: 'interface',
        definition: 'Quand ce mode est activé dans les Préférences, des icônes 📍 apparaissent à côté des éléments de l\'interface. En cliquant dessus, tu obtiens une explication contextuelle de la section ou du champ concerné. Ce mode est indépendant du parcours guidé.',
        voir: 'Réglages > Préférences'
    },

    'parcours-guide-tour': {
        cle: 'parcours-guide-tour',
        terme: 'Parcours guidé (tour)',
        categorie: 'Aide',
        etape: 'interface',
        definition: 'Un parcours en 7 étapes, de l’accueil au Labo, qui te guide à travers les sections essentielles de l\'application. Tu peux le quitter à tout moment et le relancer depuis le bouton « Visite guidée » de l’en-tête. Le parcours est complémentaire au mode assistance.',
        voir: 'En-tête > Visite guidée'
    },

    'bilan-reflexif': {
        cle: 'bilan-reflexif',
        terme: 'Bilan réflexif',
        categorie: 'Réglages',
        etape: 'interface',
        definition: 'Un outil du Labo pour recueillir l’expérience vécue : un questionnaire que tu distribues à tes étudiant·es, l’import de leurs réponses, un rapport d’analyse (score moyen sur 4, signaux forts), et ton auto-réflexion d’enseignant·e. C\'est un outil de pratique réflexive, pas un formulaire obligatoire.',
        voir: 'Labo > Bilan réflexif'
    },

    // Bloc 2 des textes relus (15 oct. 2026, #364 T4) : ex-« Namespacing (préfixe trimestre) ».
    'trimestres-separes': {
        cle: 'trimestres-separes',
        terme: 'Trimestres séparés',
        categorie: 'Réglages',
        etape: 'interface',
        definition: 'Chaque trimestre garde ses propres grilles, pratiques et évaluations. Ce que tu changes cet automne ne touche pas l’hiver dernier. Pour reprendre un modèle d’un autre trimestre, importe-le : l’application en crée une copie dans ton trimestre actif, et l’original reste intact là où il était.',
        voir: 'Réglages > Données'
    },

    // Bloc 1 des textes relus (15 oct. 2026, #364 T3) : le Comparateur et ses maquettes.
    'comparateur-pratiques': {
        cle: 'comparateur-pratiques',
        terme: 'Comparateur de pratiques',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Un écran du Labo qui montre, côte à côte, la note que deux ou trois pratiques donneraient aux mêmes parcours d’élèves. Il sert à choisir ou à ajuster une pratique avant de l’adopter. Il ne modifie aucune note.',
        voir: 'Labo > Comparateur de pratiques'
    },

    'maquette-pratique': {
        cle: 'maquette-pratique',
        terme: 'Maquette (de pratique)',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Une copie d’essai d’une de tes pratiques, faite pour être comparée. Elle reste dans le Comparateur : tu ne peux pas l’appliquer à un groupe tant que tu ne l’as pas adoptée. Une maquette dont tu ne te sers pas depuis 30 jours porte la mention « dormant ».',
        voir: 'Labo > Comparateur de pratiques'
    },

    'deriver-maquette': {
        cle: 'deriver-maquette',
        terme: 'Dériver une maquette',
        categorie: 'Pratiques de notation',
        etape: 'transversal',
        definition: 'Créer une maquette à partir d’une de tes pratiques. La pratique d’origine n’est pas modifiée. On dérive d’une pratique, jamais d’une autre maquette.',
        voir: 'Labo > Comparateur de pratiques'
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
