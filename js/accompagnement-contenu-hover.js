/**
 * accompagnement-contenu-hover.js
 * Catalogue de contenu pour le mode `hover` (info-bulles au survol/long-press/focus).
 * Source : docs/refonte-textes/infobulles-T1-*.md à T11-*.md (validé 19 avril 2026).
 * Convention : tutoiement, guillemets français, apostrophes typographiques.
 *
 * Pousse les ~283 entrées dans CATALOGUE_ACCOMPAGNEMENT via
 * window.accompagnement.ajouterEntrees(). DOIT être chargé APRÈS
 * js/accompagnement.js.
 */
(function() {
'use strict';

const TOOLTIPS = {

    // =================================================================
    // T1 — EN-TÊTE
    // =================================================================

    // --- Bandeau d'identification ---

    'entete-logo':
        'codexnumeris.org \u2014 Le blog du projet Labo Codex. R\u00e9flexions, exp\u00e9rimentations et partage autour de l\'\u00e9valuation et du suivi des apprentissages au coll\u00e9gial.',
    'entete-version':
        'Ta version de Labo Codex. Note ce num\u00e9ro si tu signales un bogue \u2014 \u00e7a aide au diagnostic.',
    'entete-mode-affichage':
        'Masque les noms r\u00e9els de tes \u00e9tudiant\u00b7es (noms fictifs ou num\u00e9ros). Utile quand tu pr\u00e9sentes ton \u00e9cran en r\u00e9union ou en formation.',
    'entete-signaler-bug':
        'Signale un probl\u00e8me technique. Pense \u00e0 inclure le num\u00e9ro de build (dans le bandeau) pour faciliter le diagnostic.',

    // --- Contexte de travail ---

    'entete-pratique':
        'Ta fa\u00e7on de calculer la note finale pour ce cours (par exemple : moyenne sommative traditionnelle ou meilleurs r\u00e9sultats retenus). Le code r\u00e9sume la m\u00e9thode, le cours et la session.',
    'entete-semaine':
        'Semaine en cours dans ton trimestre. Te situe dans la progression de la session.',

    // --- Groupe-cours ---

    'entete-groupe-cours':
        'Choisis le groupe sur lequel tu travailles. Tout l\'\u00e9cran (pr\u00e9sences, \u00e9valuations, tableau de bord) s\'ajuste au groupe s\u00e9lectionn\u00e9.',

    // --- Codex ---

    'entete-codex':
        'Ton cahier de travail portable sur cl\u00e9 USB \u2014 toutes tes donn\u00e9es dans un fichier que tu enregistres et ouvres manuellement. Pastille verte = enregistr\u00e9, orange = modifications non enregistr\u00e9es.',

    // --- Réglages ---

    'entete-reglages':
        'Configure ici ton trimestre, ton cours, tes groupes et ton horaire \u2014 les m\u00eames informations que dans ton plan de cours.',

    // =================================================================
    // T2 — RÉGLAGES — Configuration de base
    // =================================================================

    // --- Panneaux ---

    'reglages-gestion-trimestres':
        'Ton calendrier du trimestre. Les dates que tu entres ici (d\u00e9but, fin, cong\u00e9s, impr\u00e9vus) g\u00e9n\u00e8rent automatiquement la grille de toutes tes s\u00e9ances.',
    'reglages-cours':
        'Ton cours : code, comp\u00e9tence et \u00e9l\u00e9ments de comp\u00e9tence \u2014 les m\u00eames informations que sur le devis minist\u00e9riel ou le plan-cadre.',
    'reglages-enseignant':
        'Ton profil. Ton nom appara\u00eetra dans le s\u00e9lecteur de groupe-cours et sur les ressources que tu partages.',
    'reglages-groupe-etudiants':
        'Ta liste d\'\u00e9tudiant\u00b7es. Tu peux les ajouter s\u00e9par\u00e9ment ou les importer depuis un tableur ou Omnivox. Le marqueur SA identifie ceux et celles qui sont inscrit\u00b7es aux Services adapt\u00e9s.',
    'reglages-horaire':
        'L\'horaire de ton groupe : jours, heures, locaux. Combin\u00e9 au calendrier du trimestre, il g\u00e9n\u00e8re automatiquement la grille de tes s\u00e9ances.',
    'reglages-groupe-cours':
        'Ton espace de travail pour le trimestre \u2014 tu relies ici ton cours, ton groupe, ton horaire et ta fa\u00e7on de construire la note. C\'est le groupe-cours actif qui d\u00e9termine ce que tu vois partout dans l\'application.',

    // --- Champs Trimestre ---

    'reglages-trim-identification':
        'Le nom et la p\u00e9riode de ton trimestre (ex. : Hiver 2026). Sert de rep\u00e8re dans toute l\'application.',
    'reglages-trim-bornes':
        'Les dates cl\u00e9s de ton trimestre : d\u00e9but, fin des cours, remise des notes. Le calendrier des s\u00e9ances se calcule \u00e0 partir de ces dates.',
    'reglages-trim-semaines-speciales':
        'Semaines de planification et d\'examens. Ces semaines sont exclues du d\u00e9compte des s\u00e9ances r\u00e9guli\u00e8res.',
    'reglages-trim-conges':
        'Tes cong\u00e9s f\u00e9ri\u00e9s et leurs reprises. Le calendrier des s\u00e9ances s\'ajuste automatiquement.',
    'reglages-trim-imprevus':
        'Annulations, fermetures, maladie, m\u00e9t\u00e9o \u2014 tout ce qui n\'\u00e9tait pas pr\u00e9vu. Le calendrier des s\u00e9ances s\'ajuste.',

    // --- Champs Cours ---

    'reglages-cours-competence':
        'La comp\u00e9tence de ton cours \u2014 le code et l\'\u00e9nonc\u00e9 qu\'on retrouve dans le devis minist\u00e9riel ou le plan-cadre.',
    'reglages-cours-elements':
        'Les \u00e9l\u00e9ments de comp\u00e9tence de ton cours \u2014 les sous-objectifs que tes \u00e9tudiant\u00b7es doivent atteindre. Servent de r\u00e9f\u00e9rence pour tes \u00e9valuations.',

    // --- Champs Groupe ---

    'reglages-etudiants-sa':
        'Coche les \u00e9tudiant\u00b7es inscrit\u00b7es aux Services adapt\u00e9s (diagnostic pos\u00e9 par un\u00b7e professionnel\u00b7le). Ce marqueur est visible dans le suivi et les interventions.',
    'reglages-etudiants-import':
        'Importe ta liste d\'\u00e9tudiant\u00b7es en lot : colle depuis le syst\u00e8me de gestion institutionnel ou un tableur, ou charge un fichier CSV. Le format attendu est affich\u00e9 dans le panneau d\'import.',

    // --- Champs Horaire ---

    'reglages-horaire-periodes':
        'Combien de p\u00e9riodes par s\u00e9ance et combien de temps dure chaque p\u00e9riode. Le volume hebdomadaire se calcule automatiquement.',

    // --- Champs Groupe-cours ---

    'reglages-gc-nom-genere':
        'Nom g\u00e9n\u00e9r\u00e9 \u00e0 partir de ton trimestre, cours, groupe, horaire et profil. C\'est ce nom qui appara\u00eet dans le s\u00e9lecteur en haut de l\'\u00e9cran.',
    'reglages-gc-pratique':
        'Ta fa\u00e7on de calculer la note finale pour ce groupe : moyenne sommative traditionnelle ou pratique alternative (meilleurs r\u00e9sultats retenus dans un portfolio, par exemple).',

    // --- Bibliothèque ---

    'reglages-bibliotheque':
        'Tes ressources r\u00e9utilisables d\'un trimestre \u00e0 l\'autre (trimestres, cours, horaires, grilles\u2026). Choisis une ressource existante ou cr\u00e9es-en une nouvelle.',

    // =================================================================
    // T3 — RÉGLAGES — Avancés (préférences, dépistage, données)
    // =================================================================

    // --- Préférences ---

    'pref-actions-rlo':
        'Active trois tampons ou estampes (Rep\u00e9rage, Liaison, Ouverture) que tu poses sur les copies pour observer les gestes cognitifs de tes \u00e9tudiant\u00b7es. Les r\u00e9sultats alimentent le profil ACO et l\'export de recherche anonymis\u00e9.',
    'pref-affichage-assiduite':
        'Choisis l\'unit\u00e9 d\'affichage des totaux de pr\u00e9sence et d\'assiduit\u00e9 (ex. : en p\u00e9riodes).',
    'pref-affichage-comparatif':
        'Mode exp\u00e9rimental. Affiche la notation sommative traditionnelle et la notation alternative c\u00f4te \u00e0 c\u00f4te dans les aper\u00e7us et le profil individuel.',
    'pref-affichage-developpement':
        'Affiche le tableau de progression des crit\u00e8res et les graphiques 0-100 % dans la section \u00abD\u00e9veloppement des habilet\u00e9s\u00bb du profil individuel.',
    'pref-affichage-graphiques':
        'Affiche les graphiques de progression dans le temps dans la section \u00abProgression temporelle ACP\u00bb du profil individuel.',
    'pref-affichage-solo':
        'Affiche une carte avec les descriptions des niveaux cognitifs (taxonomie SOLO de Biggs & Collis). Utile pour interpr\u00e9ter la complexit\u00e9 des r\u00e9ponses de tes \u00e9tudiant\u00b7es.',
    'pref-navigation':
        'Ouvre directement sur le tableau de bord au d\u00e9marrage, sans passer par la page d\'accueil.',
    'pref-outils':
        'Outils disponibles pendant l\'\u00e9valuation d\'une production.',
    'pref-outils-acp':
        'Affiche les indices Assiduit\u00e9 (A), Compl\u00e9tion (C) et Performance (P) dans la section \u00abEngagement ACP\u00bb du profil individuel.',
    'pref-outils-rai':
        'Active les niveaux d\'intervention R\u00e0I et les recommandations personnalis\u00e9es. Structure le soutien \u00e0 tes \u00e9tudiant\u00b7es en trois niveaux d\'intensit\u00e9 : universel, cibl\u00e9, intensif.',
    'pref-tooltips':
        'Affiche ces descriptions contextuelles au survol. D\u00e9sactive si tu ma\u00eetrises d\u00e9j\u00e0 l\'application.',
    'pref-visuel':
        'Effets visuels de l\'interface. L\'animation des points du tableau de bord peut \u00eatre d\u00e9sactiv\u00e9e pour r\u00e9duire les distractions.',

    // --- Dépistage ---

    'depist-decoupler-pr':
        'S\u00e9pare le calcul de la note (P, selon ta pratique) du calcul de risque (R, bas\u00e9 sur les N derni\u00e8res productions). Recommand\u00e9 avec la pratique \u00abN meilleurs\u00bb.',
    'depist-fenetre':
        'Nombre de derni\u00e8res productions analys\u00e9es pour d\u00e9tecter les tendances. Valeur basse = d\u00e9tection pr\u00e9coce. Valeur \u00e9lev\u00e9e = d\u00e9tection plus fiable, mais plus tardive.',
    'depist-grille':
        'La grille de d\u00e9pistage utilis\u00e9e pour identifier les forces et les d\u00e9fis. Doit \u00eatre la m\u00eame pour toutes les productions du trimestre.',
    'depist-restaurer':
        'R\u00e9initialise tous les seuils de d\u00e9tection \u00e0 leurs valeurs par d\u00e9faut.',
    'depist-seuil-acceptable':
        'Indice sous lequel la situation est en zone de vigilance (jaune). \u00c0 surveiller.',
    'depist-seuil-bon':
        'Indice au-dessus duquel la situation est satisfaisante (vert).',
    'depist-seuil-defi':
        'Score (%) sous lequel un crit\u00e8re est identifi\u00e9 comme un d\u00e9fi n\u00e9cessitant attention. Seuil bas = plus exigeant, seuil \u00e9lev\u00e9 = moins exigeant.',
    'depist-seuil-direction':
        'Variation minimale (%) pour afficher une tendance du risque. Contr\u00f4le la sensibilit\u00e9 de l\'indicateur directionnel.',
    'depist-seuil-fragile':
        'Indice sous lequel la situation est pr\u00e9occupante (rouge). N\u00e9cessite une intervention.',
    'depist-seuil-progression':
        'Diff\u00e9rence minimale (%) pour signaler une progression ou une r\u00e9gression entre deux productions. Seuil bas = sensible, seuil \u00e9lev\u00e9 = moins sensible.',
    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). D\u00e9termine les alertes du tableau de bord.',
    'depist-seuils-restaurer':
        'R\u00e9initialise les seuils d\'interpr\u00e9tation \u00e0 leurs valeurs par d\u00e9faut (65 / 70 / 75 %).',
    'depist-seuils-visuels':
        'Lignes pointill\u00e9es et \u00e9tiquettes des zones (ex. : Insuffisant, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu) sur les graphiques de la section \u00abProgression temporelle ACP\u00bb du profil individuel.',

    // --- Données ---

    'donnees-capturer':
        'Capture imm\u00e9diate de l\'\u00e9tat actuel des indices A-C-P. Comme prendre une photo de la situation de ton groupe \u00e0 cet instant.',
    'donnees-captures':
        'Tes captures de suivi longitudinal et l\'export anonymis\u00e9 pour la recherche en \u00e9ducation.',
    'donnees-codex':
        'Le Codex est ton espace de travail trimestriel. Exporte-le, ouvre un Codex existant, ou exporte ta configuration p\u00e9dagogique pour la partager.',
    'donnees-codex-export':
        'ZIP complet de ton trimestre actif : donn\u00e9es, biblioth\u00e8ques et fichiers \u00e9tudiants. Pour transporter sur cl\u00e9 USB ou restaurer ailleurs.',
    'donnees-codex-ouvrir':
        'Importe un Codex complet ou une configuration partag\u00e9e. Le type est d\u00e9tect\u00e9 automatiquement.',
    'donnees-codex-data':
        'Format l\u00e9ger sans blobs (5\u201330 Mo), multi-trimestres, pour la recherche longitudinale au Labo. \u00c0 venir : extraction depuis tes Archives.',
    'donnees-voute':
        'Biblioth\u00e8que partag\u00e9e entre enseignants pour mutualiser grilles, \u00e9chelles, productions et cartouches. \u00c0 venir.',
    'donnees-config-export':
        'ZIP l\u00e9ger sans donn\u00e9es \u00e9tudiants : grilles, \u00e9chelles, productions, cartouches. Pour partager avec un\u00b7e coll\u00e8gue (CC BY-NC-SA).',
    'donnees-export-recherche':
        'Export anonymis\u00e9 des indices A-C-P et statistiques agr\u00e9g\u00e9es pour la recherche. Aucune donn\u00e9e nominative incluse.',
    'donnees-gestion-ressources':
        'Audite et nettoie les ressources p\u00e9dagogiques accumul\u00e9es. S\u00e9lectionne un type pour afficher la liste.',
    'donnees-info-techniques':
        'Tes donn\u00e9es restent sur ton appareil (stockage local). Aucune donn\u00e9e n\'est envoy\u00e9e sur internet.',
    'donnees-maintenance':
        'Outils techniques : r\u00e9initialisation, informations de stockage et gestion avanc\u00e9e des ressources.',
    'donnees-reconstruire':
        'Recalcule l\'historique des captures depuis le d\u00e9but. Utile apr\u00e8s un changement de param\u00e8tres de d\u00e9pistage.',
    'donnees-reinitialiser':
        'Efface toutes les donn\u00e9es et revient \u00e0 l\'\u00e9tat initial. Triple confirmation et mot de passe requis. Irr\u00e9versible.',
    'donnees-snapshots':
        'Enregistre l\'\u00e9tat des indices A-C-P \u00e0 des moments cl\u00e9s pour suivre l\'\u00e9volution de ton groupe dans le temps.',
    'donnees-supprimer-captures':
        'Efface toutes les captures enregistr\u00e9es. Action irr\u00e9versible.',

    // =================================================================
    // T4 — CONSTRUCTION DE LA NOTE
    // =================================================================

    // --- Vue d'ensemble ---

    'cn-apercu':
        'Tes ressources configur\u00e9es : productions, grilles, \u00e9chelles, pratiques et cartouches.',
    'cn-bibliotheque':
        'G\u00e8re tes ressources : cr\u00e9e, importe depuis la biblioth\u00e8que communautaire, duplique, exporte ou supprime.',
    'cn-ressources':
        'Nombre total de ressources disponibles (locales et biblioth\u00e8que) pour chaque type.',
    'cn-preparer-pdf':
        'G\u00e9n\u00e8re un PDF de la ressource. Choisis la grille et l\'\u00e9chelle, puis pr\u00e9visualise avant d\'imprimer.',

    // --- Productions ---

    'cn-prod-titre':
        'D\u00e9finis les productions de tes \u00e9tudiant\u00b7es : travaux et exercices avec pond\u00e9rations et \u00e9ch\u00e9ances.',
    'cn-prod-tableau':
        'Tableau r\u00e9capitulatif de toutes tes productions : titre, type, pond\u00e9ration et \u00e9ch\u00e9ance.',
    'cn-prod-type':
        'Portfolio (conteneur d\'artefacts pond\u00e9r\u00e9 \u2014 les N meilleurs r\u00e9sultats sont retenus), Artefact (production \u00e0 l\'int\u00e9rieur d\'un portfolio) ou Travail (\u00e9valuation ind\u00e9pendante).',
    'cn-prod-activite':
        'Nom de l\'activit\u00e9 p\u00e9dagogique associ\u00e9e \u00e0 cette production. Clique sur \u270f\ufe0f pour modifier.',
    'cn-prod-grille':
        'Associe une grille d\'\u00e9valuation \u00e0 cette production. D\u00e9finit les crit\u00e8res utilis\u00e9s lors de la correction.',
    'cn-prod-objectif':
        'Ce que l\'\u00e9tudiant\u00b7e sera capable de faire. Appara\u00eet dans la r\u00e9troaction et le dossier PDF.',
    'cn-prod-tache':
        'Ce qui est demand\u00e9 concr\u00e8tement \u00e0 l\'\u00e9tudiant\u00b7e. Appara\u00eet dans le dossier PDF de r\u00e9troaction.',
    'cn-prod-ponderation':
        'Poids dans la note finale. L\'ensemble des productions se partage le 100 %.',

    // --- Grilles de critères ---

    'cn-grille-titre':
        'Grilles r\u00e9utilisables avec crit\u00e8res pond\u00e9r\u00e9s. Chaque grille d\u00e9finit les crit\u00e8res d\'\u00e9valuation d\'une production \u2014 comme la grille papier que tu utilises d\u00e9j\u00e0 pour \u00e9valuer.',
    'cn-grille-critere':
        'Crit\u00e8res avec nom, type, pond\u00e9ration et description. La pond\u00e9ration totale doit atteindre 100 %.',
    'cn-grille-type-critere':
        'M\u00e9thode d\'\u00e9valuation du crit\u00e8re : holistique (tu attribues un niveau global), analytique (tu attribues des points par \u00e9l\u00e9ment ou micro-t\u00e2che) ou algorithmique (calcul automatique, ex. : fran\u00e7ais \u00e9crit).',
    'cn-grille-ponderation-totale':
        'Somme des pond\u00e9rations de tous les crit\u00e8res. Doit atteindre 100 % pour que la grille soit valide.',

    // --- Échelles de performance ---

    'cn-echelle-titre':
        '\u00c9chelles de conversion pourcentage \u2192 niveaux de performance. Configure les seuils et les couleurs pour chaque niveau (ex. : Insuffisant, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu).',
    'cn-echelle-niveau':
        'Niveaux avec code, nom, plages de pourcentage, valeur ponctuelle et couleur.',
    'cn-echelle-apercu':
        'Barre color\u00e9e montrant les plages de chaque niveau. V\u00e9rifie visuellement la coh\u00e9rence de tes seuils.',
    'cn-echelle-valeur-ponctuelle':
        'Valeur num\u00e9rique fixe attribu\u00e9e \u00e0 ce niveau pour les calculs de note.',

    // --- Cartouches de rétroaction ---

    'cn-cartouche-titre':
        'Matrices de commentaires automatiques. Chaque cartouche g\u00e9n\u00e8re une r\u00e9troaction par combinaison crit\u00e8re \u00d7 niveau \u2014 un gabarit de commentaires que tu pr\u00e9pares une fois et qui s\'assemble \u00e0 chaque \u00e9valuation.',
    'cn-cartouche-matrice':
        'Tableau crit\u00e8res \u00d7 niveaux. Chaque cellule contient un commentaire de r\u00e9troaction. L\'application assemble automatiquement les commentaires lors de l\'\u00e9valuation.',
    'cn-cartouche-selectors':
        'La grille d\u00e9termine les crit\u00e8res (lignes), l\'\u00e9chelle d\u00e9termine les niveaux (colonnes) de la matrice.',
    'cn-cartouche-contexte':
        'Texte introductif optionnel affich\u00e9 au d\u00e9but de la r\u00e9troaction si l\'option \u00abContexte\u00bb est coch\u00e9e. Permet de situer la production dans la progression du cours.',

    // --- Pratiques de notation ---

    'cn-pratique-titre':
        'Assemblage final de ta pratique : type de notation, \u00e9chelle, structure des \u00e9valuations et syst\u00e8me de jetons. C\'est la recette compl\u00e8te de ta fa\u00e7on de construire la note.',
    'cn-pratique-type':
        'SOM = sommative (moyenne pond\u00e9r\u00e9e traditionnelle), STD = PAN bas\u00e9e sur des standards (par ma\u00eetrise), SPE = PAN bas\u00e9e sur des sp\u00e9cifications (contrat), DEN = d\u00e9notation (pratiques r\u00e9duisant ou \u00e9liminant la notation).',
    'cn-pratique-echelle':
        '\u00c9chelle utilis\u00e9e pour convertir les pourcentages en niveaux (ex. : I-D-M-E). Configurable dans \u00c9chelles de performance.',
    'cn-pratique-jetons':
        'Ressources limit\u00e9es que tu accordes \u00e0 tes \u00e9tudiant\u00b7es : D\u00e9lai (prolonger l\'\u00e9ch\u00e9ance), Reprise (refaire la production) ou Reprise cibl\u00e9e (reprendre un aspect sp\u00e9cifique).',
    'cn-pratique-discipline':
        'Discipline acad\u00e9mique associ\u00e9e. Filtre les ressources de la biblioth\u00e8que par pertinence.',
    'cn-pratique-appliquer':
        'D\u00e9finit cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et d\'indices.',
    'cn-pratiques-compat':
        'Pratiques compatibles avec cette ressource : SOM (sommative), STD (PAN-standards), SPE (sp\u00e9cification), DEN (d\u00e9notation).',

    // =================================================================
    // T5 — ÉVALUATIONS
    // =================================================================

    // --- Aperçu et statistiques ---

    'eval-apercu':
        'Statistiques synth\u00e9tiques du groupe : taux de compl\u00e9tion moyen, productions r\u00e9alis\u00e9es et productions configur\u00e9es.',
    'eval-stats-groupe':
        'Indicateurs cl\u00e9s du groupe-cours : compl\u00e9tion, productions r\u00e9alis\u00e9es et nombre de productions configur\u00e9es.',
    'eval-taux-completion':
        'Moyenne des taux de remise individuels. Correspond \u00e0 l\'indice C (Compl\u00e9tion) du tableau de bord.',
    'eval-productions-configurees':
        'Nombre total de productions d\u00e9finies dans la construction de la note. Inclut portfolios, artefacts et travaux.',
    'eval-productions-realisees':
        'Nombre de productions pour lesquelles au moins une \u00e9valuation a \u00e9t\u00e9 enregistr\u00e9e dans le groupe.',
    'eval-travaux-importes':
        'Nombre de fichiers de travaux stock\u00e9s et pr\u00eats \u00e0 \u00eatre annot\u00e9s ou \u00e9valu\u00e9s.',
    'eval-travaux-preparation':
        'Nombre de fichiers en attente d\'importation, pr\u00eats \u00e0 \u00eatre trait\u00e9s.',

    // --- Liste des évaluations ---

    'eval-liste':
        'Toutes les \u00e9valuations du groupe : r\u00e9sultats, niveaux IDME, jetons et acc\u00e8s aux dossiers PDF.',
    'eval-liste-resume':
        'R\u00e9sultats totaux, \u00e9valuations recevables (les non-recevables sont exclues), moyenne du groupe et nombre de productions.',
    'eval-filtre-production':
        'Filtre les \u00e9valuations par production. Permet de voir les r\u00e9sultats d\'un seul travail \u00e0 la fois.',
    'eval-filtre-statut':
        'Filtre par statut de progression : non re\u00e7u, re\u00e7u, import\u00e9, annot\u00e9, \u00e9valu\u00e9 \u2014 ou par type de jeton.',

    // --- Interface d'évaluation ---

    'eval-page':
        'Interface d\'\u00e9valuation crit\u00e9ri\u00e9e. S\u00e9lectionne les param\u00e8tres \u00e0 gauche, \u00e9value et pr\u00e9visualise la r\u00e9troaction \u00e0 droite.',
    'eval-panneau-criteres':
        'Liste des crit\u00e8res de la grille s\u00e9lectionn\u00e9e. Attribue un niveau \u00e0 chaque crit\u00e8re pour calculer la note finale.',
    'eval-grille':
        'Grille crit\u00e9ri\u00e9e avec pond\u00e9rations. D\u00e9termine les crit\u00e8res affich\u00e9s pour cette \u00e9valuation.',
    'eval-echelle':
        '\u00c9chelle de conversion pourcentage \u2192 niveau IDME. Seuils configurables dans les \u00e9chelles de performance.',
    'eval-cartouche':
        'Cartouche de r\u00e9troaction associ\u00e9e \u00e0 cette production. D\u00e9termine le vocabulaire et le ton des commentaires g\u00e9n\u00e9r\u00e9s automatiquement.',
    'eval-critere':
        '\u00c9value ce crit\u00e8re en attribuant un niveau. La r\u00e9troaction est g\u00e9n\u00e9r\u00e9e automatiquement selon la cartouche.',
    'eval-note-finale':
        'R\u00e9sultat calcul\u00e9 en temps r\u00e9el : pourcentage pond\u00e9r\u00e9 et niveau IDME correspondant.',
    'eval-niveau-idme':
        'Niveau calcul\u00e9 automatiquement. Modifie uniquement si n\u00e9cessaire (ex. : reprise cibl\u00e9e).',
    'eval-col-niveau':
        'Niveau IDME : I = Insuffisant ou incomplet, D = en D\u00e9veloppement, M = Ma\u00eetris\u00e9, E = \u00c9tendu.',
    'eval-statut-remise':
        'Indique si la production a \u00e9t\u00e9 remise. Conditionne le calcul de l\'indice de compl\u00e9tion (C).',
    'eval-integrite':
        'Recevable ou non. Les travaux non recevables (plagiat, IA non autoris\u00e9e) sont exclus des calculs de moyenne et de l\'indice P.',
    'eval-francais-ecrit':
        '\u00c9valuation algorithmique du fran\u00e7ais \u00e9crit : saisis les codes d\'erreurs et le nombre de mots. Le calcul et la r\u00e9troaction sont g\u00e9n\u00e9r\u00e9s automatiquement \u00e0 partir de tes formulations.',
    'eval-codes-erreurs':
        'Codes num\u00e9riques des erreurs, s\u00e9par\u00e9s par points-virgules. Consulte la grille pour la correspondance codes \u2192 cat\u00e9gories.',
    'eval-modifier-attribution':
        'Corrige l\'attribution automatique : change l\'\u00e9tudiant\u00b7e ou la production associ\u00e9e \u00e0 ce fichier.',
    'eval-btn-reinitialiser':
        'Efface le formulaire d\'\u00e9valuation en cours et restaure les valeurs par d\u00e9faut. Tes s\u00e9lections de grille et d\'\u00e9chelle sont conserv\u00e9es.',
    'eval-btn-supprimer':
        'Supprime d\u00e9finitivement cette \u00e9valuation. La production reviendra au statut pr\u00e9c\u00e9dent. Irr\u00e9versible.',

    // --- Jetons ---

    'eval-jetons':
        'D\u00e9lai (orange), Reprise (vert) ou Reprise cibl\u00e9e (violet). Permet \u00e0 l\'\u00e9tudiant\u00b7e de d\u00e9montrer \u00e0 nouveau sa comp\u00e9tence ou son habilet\u00e9.',
    'eval-col-jeton':
        'Type de jeton : D = D\u00e9lai, R = Reprise, RC = Reprise cibl\u00e9e. Permet \u00e0 l\'\u00e9tudiant\u00b7e de d\u00e9montrer \u00e0 nouveau sa comp\u00e9tence ou son habilet\u00e9.',
    'eval-jeton-delai':
        'Prolonge l\'\u00e9ch\u00e9ance de remise. L\'\u00e9valuation porte sur la m\u00eame production, remise plus tard selon une entente convenue.',
    'eval-jeton-reprise':
        'L\'\u00e9tudiant\u00b7e reprend enti\u00e8rement la production pour d\u00e9montrer \u00e0 nouveau sa comp\u00e9tence. La nouvelle \u00e9valuation remplace la pr\u00e9c\u00e9dente.',
    'eval-jeton-reprise-ciblee':
        'L\'\u00e9tudiant\u00b7e reprend un aspect sp\u00e9cifique que tu as cibl\u00e9 pour d\u00e9montrer sa ma\u00eetrise. Le niveau IDME peut \u00eatre ajust\u00e9 et plafonn\u00e9.',

    // --- Rétroaction ---

    'eval-retroaction':
        'R\u00e9troaction g\u00e9n\u00e9r\u00e9e automatiquement. Modifie le texte au besoin, puis copie dans le presse-papier.',
    'eval-retroaction-options':
        'Sections \u00e0 inclure dans la r\u00e9troaction : Description, Objectif, T\u00e2che, Adresse (interpellation) et Contexte d\'apprentissage.',
    'eval-retro-adresse':
        'Ajoute une interpellation personnalis\u00e9e au d\u00e9but de la r\u00e9troaction (ex. : \u00abBonjour [Pr\u00e9nom]\u00bb). Humanise le commentaire \u00e9crit.',
    'eval-retro-contexte':
        'Inclut le texte de contexte d\'apprentissage d\u00e9fini dans la cartouche. Situe la r\u00e9troaction dans la progression du cours.',
    'eval-retro-description':
        'Inclut un rappel du contexte de la production (titre et description) dans la r\u00e9troaction remise \u00e0 l\'\u00e9tudiant\u00b7e.',
    'eval-retro-objectif':
        'Inclut l\'objectif d\'apprentissage vis\u00e9 par la production. Rappelle \u00e0 l\'\u00e9tudiant\u00b7e ce qui devait \u00eatre d\u00e9montr\u00e9.',
    'eval-retro-tache':
        'Inclut le rappel de la t\u00e2che demand\u00e9e. Situe la r\u00e9troaction par rapport aux consignes initiales.',

    // =================================================================
    // T6 — TRAVAUX (import, annotation, archivage)
    // =================================================================

    // --- Import et pipeline ---

    'travaux-production':
        'S\u00e9lectionne la production (travail, examen) que tu es en train d\'\u00e9valuer. Les fichiers import\u00e9s seront associ\u00e9s \u00e0 cette production.',
    'travaux-pipeline-optimisation':
        'Traitements automatiques appliqu\u00e9s aux images : balance des blancs, uniformisation DPI selon le s\u00e9lecteur, compression JPEG. Les fichiers d\'un m\u00eame \u00e9tudiant pour une m\u00eame production sont regroup\u00e9s (multi-pages). Les PDF sont import\u00e9s tels quels.',
    'travaux-fsapi-config':
        'Stocke les fichiers import\u00e9s directement sur le disque local au lieu d\'IndexedDB. Recommand\u00e9 sur ordinateur pour \u00e9viter les limites de stockage du navigateur.',

    // --- Actions sur les travaux ---

    'travaux-btn-annoter':
        'Mode annotation : surligne, \u00e9cris et appose des tampons / estampes ou des codes sp\u00e9cifiques directement sur la copie de l\'\u00e9tudiant\u00b7e.',
    'travaux-btn-evaluer':
        'Mode \u00e9valuation : ouvre les panneaux de crit\u00e8res et de param\u00e8tres pour \u00e9valuer cette production selon la grille.',
    'travaux-evaluer':
        'Ouvre l\'interface d\'\u00e9valuation avec l\'\u00e9tudiant\u00b7e et la production pr\u00e9s\u00e9lectionn\u00e9s. Tu pourras appliquer une grille de crit\u00e8res et g\u00e9n\u00e9rer une r\u00e9troaction.',
    'travaux-btn-alleger':
        'Remplace l\'original par un fac-simil\u00e9 plus l\u00e9ger (niveaux de gris, 800 px). R\u00e9duit l\'espace de stockage. Les annotations sont conserv\u00e9es.',
    'travaux-btn-reimporter':
        'Remplace le fichier all\u00e9g\u00e9 par l\'original complet. Utile si tu as besoin de revoir les d\u00e9tails de la copie originale.',

    // --- Archivage et export ---

    'travaux-archivage-etudiant':
        'T\u00e9l\u00e9charge un ZIP contenant tous les travaux d\'un\u00b7e \u00e9tudiant\u00b7e. Utile pour remettre un dossier complet en fin de session.',
    'travaux-archivage-production':
        'T\u00e9l\u00e9charge un ZIP regroupant tous les travaux d\'une production. Pratique pour archiver une \u00e9valuation compl\u00e8te.',
    'travaux-archivage-semestre':
        'Archive compl\u00e8te de tous les travaux du trimestre en un seul ZIP. Recommand\u00e9 en fin de session pour la conservation.',
    'travaux-archivage-inclure-annotes':
        'Ajoute les versions annot\u00e9es (avec surlignage, commentaires et tampons) au ZIP. D\u00e9coche pour n\'exporter que les originaux.',
    'travaux-archivage-inclure-evals':
        'Ajoute un fichier de r\u00e9troaction pour chaque \u00e9valuation compl\u00e9t\u00e9e. Pratique pour la remise aux \u00e9tudiant\u00b7es.',
    'travaux-archivage-alleger':
        'Convertit les originaux d\u00e9j\u00e0 export\u00e9s en fac-simil\u00e9s l\u00e9gers (niveaux de gris, 800 px). Lib\u00e8re de l\'espace de stockage sans perdre les annotations.',

    // =================================================================
    // T7 — TABLEAU DE BORD — Aperçu
    // =================================================================

    // --- Navigation et vue d'ensemble ---

    'tdb-apercu':
        'Portrait complet de ton groupe-cours : indices d\'apprentissage, patterns, interventions et graphiques de d\u00e9veloppement.',
    'tdb-sous-nav':
        'Quatre vues : aper\u00e7u du groupe, liste des individus, profil \u00e9tudiant\u00b7e et interventions R\u00e0I.',
    'tdb-zones-couleur':
        'Fragile (0-64 %), Mod\u00e9r\u00e9 (65-74 %), Favorable (75-85 %), Tr\u00e8s favorable (\u2265 85 %). Seuils configurables dans R\u00e9glages.',

    // --- Observer (indices A-C-P) ---

    'tdb-observer':
        'Indices A-C-P du groupe. Chaque barre positionne les \u00e9tudiant\u00b7es sur une \u00e9chelle qui d\u00e9crit son contexte d\'apprentissage observ\u00e9, allant de Fragile \u00e0 Tr\u00e8s favorable.',
    'tdb-selecteur-indice':
        'Choisis l\'indice \u00e0 visualiser : Assiduit\u00e9 (A), Compl\u00e9tion (C) ou Performance (P).',
    'tdb-assiduite':
        'Taux de pr\u00e9sence aux s\u00e9ances. Chaque point repr\u00e9sente un\u00b7e \u00e9tudiant\u00b7e.',
    'tdb-completion':
        'Taux de remise des travaux. La corr\u00e9lation C\u00d7P indique le lien entre la remise et les r\u00e9sultats.',
    'tdb-performance':
        'R\u00e9sultats aux \u00e9valuations par niveaux. La performance peut \u00eatre not\u00e9e avec un chiffre ou une lettre (ex. : Insuffisant ou incomplet, en D\u00e9veloppement, Ma\u00eetris\u00e9, \u00c9tendu).',
    'tdb-liste-individus':
        'Vue d\u00e9taill\u00e9e de chaque \u00e9tudiant\u00b7e avec ses indices individuels.',
    'tdb-profil':
        'Fiche individuelle d\'un\u00b7e \u00e9tudiant\u00b7e : trajectoire, indices et historique.',

    // --- Graphiques ---

    'tdb-dev-groupe':
        '\u00c9volution d\'un indice dans le temps pour tout le groupe. Chaque ligne repr\u00e9sente un\u00b7e \u00e9tudiant\u00b7e.',
    'tdb-graphique-groupe':
        'Graphique longitudinal du groupe. Clique sur une courbe pour la verrouiller.',
    'tdb-selecteur-eleve-groupe':
        'Isole la trajectoire d\'un\u00b7e \u00e9tudiant\u00b7e sur le graphique du groupe.',
    'tdb-dev-individuel':
        'R\u00e9sultats par production. Chaque point repr\u00e9sente un\u00b7e \u00e9tudiant\u00b7e sur une activit\u00e9. Les trajectoires isol\u00e9es m\u00e9ritent attention.',
    'tdb-graphique-individuel':
        'R\u00e9sultats par activit\u00e9 d\'apprentissage. Les zones denses r\u00e9v\u00e8lent les tendances du groupe.',
    'tdb-selecteur-eleve-indiv':
        'Isole la trajectoire d\'un\u00b7e \u00e9tudiant\u00b7e sur le graphique des productions.',
    'tdb-impact-jetons':
        'Compare la trajectoire P avec et sans jeton de reprise. \u25a0 = production avec jeton, \u25a1 = sans.',
    'tdb-selecteur-eleve-jetons':
        'Affiche la courbe P individuelle d\'un\u00b7e \u00e9tudiant\u00b7e ayant utilis\u00e9 un jeton de reprise.',

    // --- Patterns et RàI ---

    'tdb-patterns':
        'Progression sur les crit\u00e8res multistructurels (fondations SOLO) identifi\u00e9s dans ta grille. Compl\u00e9mentaire au mod\u00e8le R\u00e0I, qui regarde sp\u00e9cifiquement la performance globale et certains aspects comportementaux (mobilisation observ\u00e9e).',
    'tdb-rai':
        'Niveau d\'intervention selon la performance globale (indice P, tous crit\u00e8res). Compl\u00e9mentaire au suivi des fondamentaux, qui cible uniquement les crit\u00e8res multistructurels.',
    'tdb-intervenir':
        'Suivi de l\'apprentissage des fondamentaux (taxonomie SOLO) et r\u00e9partition par niveaux d\'intervention R\u00e0I.',
    'tdb-interventions-rai':
        'Gestion des interventions par niveau R\u00e0I : universel, pr\u00e9ventif, intensif.',

    // =================================================================
    // T8 — TABLEAU DE BORD — Liste, profil, interventions
    // =================================================================

    // --- Liste des individus ---

    'liste-titre':
        'Liste compl\u00e8te des \u00e9tudiant\u00b7es avec indices A-C-P, patterns et niveaux R\u00e0I. Filtrable et triable.',
    'liste-filtres':
        'Filtre par groupe, programme, niveau R\u00e0I ou pattern. Le champ de recherche accepte nom, pr\u00e9nom ou DA.',
    'liste-filtre-rai':
        'Filtre par niveau d\'intervention : Tous, Niveau 1 (universel), Niveau 2 (pr\u00e9ventif), Niveau 3 (intensif).',
    'liste-filtre-pattern':
        'Filtre par trajectoire d\u00e9tect\u00e9e : progression stable, d\u00e9fi sp\u00e9cifique, difficult\u00e9 \u00e9mergente ou persistante.',
    'liste-recherche':
        'Recherche un\u00b7e \u00e9tudiant\u00b7e par nom, pr\u00e9nom ou num\u00e9ro d\'admission (DA).',
    'liste-col-sa':
        'Services adapt\u00e9s. Une coche indique que l\'\u00e9tudiant\u00b7e b\u00e9n\u00e9ficie d\'un plan de services.',
    'liste-col-interv':
        'Interventions document\u00e9es pour cet\u00b7te \u00e9tudiant\u00b7e. Clique pour consulter l\'historique.',

    // --- Profil étudiant·e ---

    'profil-selecteur':
        'Choisis un\u00b7e \u00e9tudiant\u00b7e. Les boutons Pr\u00e9c./Suiv. parcourent la liste s\u00e9quentiellement.',
    'profil-nav-observations':
        'Sept vues d\'observation : productions, mobilisation, progression, habilet\u00e9s, accompagnement, travaux, rapport.',
    'profil-productions':
        'Liste des productions avec description, jeton, note, date et acc\u00e8s direct \u00e0 l\'\u00e9valuation.',
    'profil-col-jeton':
        'Jeton de reprise : permet \u00e0 l\'\u00e9tudiant\u00b7e de reprendre une production pour d\u00e9montrer \u00e0 nouveau sa comp\u00e9tence ou son habilet\u00e9.',
    'profil-mobilisation':
        'Vue d\'ensemble des composantes A et C : pr\u00e9sence en classe et remise des travaux. Indique comment l\'\u00e9tudiant\u00b7e se mobilise dans le cours.',
    'profil-progression':
        '\u00c9volution des indices A-C-P au fil des semaines. Marqueurs : \u25cb artefact d\u00fb, \u25cf jeton appliqu\u00e9, \u25bc intervention R\u00e0I. Zones : Insuffisant, en D\u00e9veloppement, Ma\u00eetris\u00e9, \u00c9tendu.',
    'profil-habiletes':
        'Graphique d\'\u00e9volution des crit\u00e8res ou habilet\u00e9s (si \u00e9valuations avec d\u00e9tails). Marqueurs : \u25cf jeton, \u25bc intervention. Forces et d\u00e9fis par crit\u00e8re.',
    'profil-accompagnement':
        'Analyse R\u00e0I, contexte d\'apprentissage, structure SOLO et historique des interventions.',
    'profil-accomp-contexte':
        'Assiduit\u00e9 et compl\u00e9tion de l\'\u00e9tudiant\u00b7e. Interpr\u00e9tation du contexte d\'apprentissage apr\u00e8s les premi\u00e8res remises.',
    'profil-accomp-rai':
        'Performance globale et progression par crit\u00e8re. D\u00e9termine le niveau d\'intervention sugg\u00e9r\u00e9.',
    'profil-accomp-solo':
        'Analyse des r\u00e9ponses selon la taxonomie SOLO (Biggs & Collis). Identifie les forces et les d\u00e9fis structurels.',
    'profil-historique':
        'Interventions R\u00e0I document\u00e9es pour cet\u00b7te \u00e9tudiant\u00b7e. Cr\u00e9e une nouvelle intervention depuis le profil.',
    'profil-travaux':
        'Travaux soumis par l\'\u00e9tudiant\u00b7e. Les fichiers sont import\u00e9s depuis Travaux > Import.',
    'profil-rapport':
        'Rapport textuel configurable. Coche les sections \u00e0 inclure et copie dans le presse-papier.',
    'profil-rapport-sections':
        'Coche les sections souhait\u00e9es : Identification, Assiduit\u00e9, Compl\u00e9tion, Performance, Jetons, Date.',

    // --- Données confidentielles ---

    'profil-confidentiel':
        'Donn\u00e9es confidentielles stock\u00e9es localement : parcours, d\u00e9fis, portrait sp\u00e9cifique, diagnostic, notes.',
    'profil-conf-parcours':
        '\u00c9PGC (\u00e9tudiant\u00b7e de premi\u00e8re g\u00e9n\u00e9ration au c\u00e9gep) et historique du cours ant\u00e9rieur (ces donn\u00e9es sont facultatives).',
    'profil-conf-lecteur':
        '\u00c9valuation des comp\u00e9tences de lecture : structure, rigueur, plausibilit\u00e9, nuance, fran\u00e7ais (SRPN/F).',
    'profil-conf-diagnostic':
        'Services adapt\u00e9s, cat\u00e9gorie et sous-cat\u00e9gorie du diagnostic. Confidentiel.',

    // --- Interventions RàI ---

    'interv-titre':
        'Planification et suivi des interventions R\u00e0I de niveaux 2 et 3. Cr\u00e9e, consulte et documente.',
    'interv-btn-planifier':
        'Cr\u00e9e une nouvelle intervention de niveau 2 (pr\u00e9ventif) ou 3 (intensif) pour un groupe ou un individu.',
    'interv-carte':
        'Fiche d\'une intervention : statut, niveau, aper\u00e7u du sous-groupe (patterns, R\u00e0I, notes individuelles).',
    'interv-apercu-sous-groupe':
        'Agr\u00e9gation des profils du sous-groupe : patterns d\'apprentissage, niveaux R\u00e0I et notes individuelles.',
    'interv-criteres-cibles':
        'Crit\u00e8res de la grille de d\u00e9pistage cibl\u00e9s par l\'intervention. Pr\u00e9coch\u00e9s selon les d\u00e9fis communs du sous-groupe. Le compteur montre combien d\'\u00e9tudiant\u00b7es sont en d\u00e9fi pour chaque crit\u00e8re.',
    'interv-objectif-vise':
        'Objectif mesurable de l\'intervention. La suggestion est bas\u00e9e sur le crit\u00e8re cibl\u00e9 le plus faible et le prochain seuil IDME atteignable.',
    'interv-niveaux-rai':
        'R\u00e9partition des niveaux R\u00e0I (1, 2, 3) dans le sous-groupe cibl\u00e9 par l\'intervention.',
    'interv-patterns':
        'R\u00e9partition des patterns d\u00e9tect\u00e9s dans le sous-groupe cibl\u00e9 par l\'intervention.',
    'interv-notes-individuelles':
        'Tes observations pour chaque \u00e9tudiant\u00b7e lors de l\'intervention.',
    'interv-presences-notes':
        'Coche les pr\u00e9sent\u00b7es et documente tes observations individuelles. Le badge indique le niveau R\u00e0I.',
    'interv-gestion-absences':
        'Lie l\'intervention \u00e0 une s\u00e9ance. Les absences sont motiv\u00e9es automatiquement (cong\u00e9 motiv\u00e9). Attention, ce peut \u00eatre diff\u00e9rent du syst\u00e8me de gestion institutionnel.',
    'interv-bilan':
        'Bilan post-intervention. Comparaison automatique avant/apr\u00e8s sur les crit\u00e8res cibl\u00e9s. L\'\u00abavant\u00bb est captur\u00e9 au moment de la premi\u00e8re sauvegarde, l\'\u00abapr\u00e8s\u00bb est calcul\u00e9 en temps r\u00e9el.',

    // =================================================================
    // T9 — PLANIFICATION — Alignement (carte mentale)
    // =================================================================

    // --- Vue d'ensemble ---

    'planif-alignement':
        'Carte mentale interactive pour construire visuellement l\'alignement p\u00e9dagogique de ton cours \u2014 les liens entre objectifs, activit\u00e9s et \u00e9valuations.',
    'planif-sous-nav':
        'Deux vues compl\u00e9mentaires : la carte mentale d\'alignement et l\'organisateur du cours.',
    'planif-selecteur-cours':
        'Choisis le cours \u00e0 planifier. Chaque cours a sa propre carte d\'alignement.',
    'planif-aide':
        'Ouvre le guide de la carte mentale (7 pages, panneau flottant ind\u00e9pendant).',

    // --- Canevas et outils ---

    'planif-canevas':
        'Espace de travail de la carte mentale. Glisse des noeuds (diff\u00e9rents \u00e9l\u00e9ments cognitifs), cr\u00e9e des liens, organise visuellement ton cours.',
    'planif-palette':
        'Glisse un \u00e9l\u00e9ment vers le canevas pour l\'ajouter \u00e0 la carte mentale.',
    'planif-barre-outils':
        'Contr\u00f4les de zoom, filtres d\'affichage et options de vue du canevas.',
    'planif-boutons-action':
        'Ajoute, supprime, coupe, copie et colle des n\u0153uds sur le canevas.',
    'planif-filtres':
        'Filtre l\'affichage des n\u0153uds et des liens sur le canevas.',
    'planif-zoom':
        'Ajuste le niveau de zoom du canevas.',

    // --- Catégories pédagogiques ---

    'planif-pouvoir-enseigner':
        'Cadre curriculaire : comp\u00e9tence minist\u00e9rielle et id\u00e9es ma\u00eetresses de ton cours.',
    'planif-quoi-enseigner':
        'Quoi enseigner : types de connaissances (Anderson) \u2014 factuelle, conceptuelle, proc\u00e9durale et m\u00e9tacognitive.',
    'planif-comment-enseigner':
        'Comment enseigner : dispositifs d\'enseignement, activit\u00e9s de soutien et occasions de r\u00e9vision.',
    'planif-structure':
        'Quand enseigner : organisation temporelle en s\u00e9quences (semaines) et le\u00e7ons (s\u00e9ances).',
    'planif-design-apprentissages':
        'Productions et \u00e9valuations : lie les objectifs aux moyens de v\u00e9rifier l\'apprentissage pour compl\u00e9ter l\'alignement.',

    // --- Nœuds ---

    'planif-panneau-proprietes':
        'Propri\u00e9t\u00e9s du n\u0153ud s\u00e9lectionn\u00e9 : titre, description, clonage et suppression.',
    'planif-titre-noeud':
        'Nom du noeud tel qu\'il appara\u00eet sur la carte.',
    'planif-description-noeud':
        'Notes ou pr\u00e9cisions sur cet \u00e9l\u00e9ment. Champ libre.',
    'planif-cloner':
        'Cr\u00e9e un clone de ce n\u0153ud. Les modifications se propagent \u00e0 toutes les copies.',
    'planif-supprimer-noeud':
        'Supprime ce n\u0153ud et ses liens de la carte.',

    // =================================================================
    // T10 — PLANIFICATION — Organisateur (leçons)
    // =================================================================

    // --- Leçons et séquences ---

    'orga-sous-nav':
        'Vue textuelle et structur\u00e9e des donn\u00e9es de la carte mentale. S\u00e9lectionne une s\u00e9quence et une le\u00e7on pour afficher son plan.',
    'orga-selecteur-sequence':
        'Filtre par s\u00e9quence pour restreindre la vue calendrier.',
    'orga-selecteur-lecon':
        'S\u00e9lectionne une le\u00e7on pour afficher son plan d\u00e9taill\u00e9.',
    'orga-vue-calendrier':
        'Vue hi\u00e9rarchique textuelle des s\u00e9quences, s\u00e9ances et activit\u00e9s avec leurs liens p\u00e9dagogiques.',
    'orga-entete-lecon':
        'Groupes-cours auxquels cette le\u00e7on s\'applique, avec leurs plages horaires.',
    'orga-objectif':
        'Ce que l\'\u00e9tudiant\u00b7e sera capable de faire au terme de la le\u00e7on.',

    // --- Structure et contenu ---

    'orga-enseignement-explicite':
        'Structure en 5 phases : ouverture, modelage, pratique guid\u00e9e, pratique autonome, objectivation.',
    'orga-connaissances-prealables':
        'Savoirs pr\u00e9alables \u00e0 v\u00e9rifier ou revoir avant d\'aborder cette le\u00e7on.',
    'orga-item-a-revoir':
        '\u00c9l\u00e9ment pr\u00e9alable \u00e0 revoir en d\u00e9but de s\u00e9ance avant de poursuivre.',
    'orga-coeur-lecon':
        'Activit\u00e9s p\u00e9dagogiques de la le\u00e7on. Associe des productions pour compl\u00e9ter l\'alignement.',
    'orga-productions':
        'Productions li\u00e9es aux activit\u00e9s de cette le\u00e7on (mises en pratique, exercices d\'application, travaux).',
    'orga-selecteur-production':
        'Associe une production (mise en pratique, exercice, travail) \u00e0 cette activit\u00e9.',

    // --- Liens pédagogiques ---

    'orga-lien-pedagogique':
        'Connexion vers un autre \u00e9l\u00e9ment de la carte mentale (comp\u00e9tence, pr\u00e9requis, strat\u00e9gie, etc.).',
    'orga-alerte-alignement':
        'Incoh\u00e9rence d\'alignement d\u00e9tect\u00e9e : une \u00e9valuation ou un objectif n\'est pas encore reli\u00e9 \u00e0 une production.',

    // =================================================================
    // T11 — NAVIGATION principale et sous-navigation
    // =================================================================

    // --- Général ---

    'nav-accueil':
        'Retour \u00e0 la page d\'accueil.',
    'nav-aide':
        'Documentation et ressources d\'aide.',

    // --- Réglages ---

    'nav-calendrier-trimestre':
        'Configuration du trimestre, du cours, de ton profil, du groupe d\'\u00e9tudiant\u00b7es, de l\'horaire et du groupe-cours.',
    'nav-calendrier-vue':
        'Calendrier du trimestre : tableau des mois, jours de cours, cong\u00e9s et reprises.',
    'nav-conception-pratiques':
        'Assemble ta pratique de notation compl\u00e8te (SOM, STD, SPE, DEN) en associant \u00e9chelle, structure et jetons.',
    'nav-reg-preferences':
        'Personnalise ton interface : outils actifs, ressources affich\u00e9es, effets visuels et comportement de navigation.',
    'nav-reg-depistage':
        'Outils d\'observation des apprentissages (SOLO, actions RLO) et configuration du d\u00e9pistage R\u00e0I (seuils de d\u00e9tection et d\'interpr\u00e9tation).',
    'nav-reg-donnees':
        'Sauvegarde, restauration, captures A-C-P, export anonymis\u00e9, r\u00e9initialisation et maintenance.',
    'nav-reg-apropos':
        'Informations sur l\'application et sa version.',

    // --- Structure (anciennement Construction de la note) ---

    'nav-construction':
        'Configuration de l\'\u00e9valuation : productions, grilles, \u00e9chelles, cartouches et pratiques de notation.',
    'nav-conception-productions':
        'D\u00e9finis les productions de tes \u00e9tudiant\u00b7es : portfolios, artefacts et travaux avec pond\u00e9rations et \u00e9ch\u00e9ances.',
    'nav-conception-grilles':
        'Cr\u00e9e des grilles r\u00e9utilisables avec crit\u00e8res nomm\u00e9s, typ\u00e9s et pond\u00e9r\u00e9s.',
    'nav-conception-echelles':
        'Configure les \u00e9chelles de performance : seuils, valeurs ponctuelles, couleurs et aper\u00e7u visuel.',
    'nav-conception-cartouches':
        'Cr\u00e9e des matrices de commentaires automatiques (crit\u00e8res \u00d7 niveaux) pour la r\u00e9troaction diff\u00e9renci\u00e9e.',

    // --- Évaluations et travaux ---

    'nav-evaluations':
        '\u00c9valuation des productions : grilles crit\u00e9ri\u00e9es, niveaux de performance et r\u00e9troaction diff\u00e9renci\u00e9e automatique.',
    'nav-eval-liste':
        'Tableau exhaustif des \u00e9valuations : r\u00e9sultats, niveaux de performance, jetons et dossiers PDF.',
    'nav-eval-importer':
        'Importe les travaux de tes \u00e9tudiant\u00b7es (PDF, images) et pr\u00e9pare les fichiers (rotation, assemblage).',
    'nav-eval-annoter':
        'Annote les copies et \u00e9value selon la grille de crit\u00e8res, sur le m\u00eame document.',
    'nav-eval-exporter':
        'Exporte les PDF annot\u00e9s aux \u00e9tudiant\u00b7es, archive le trimestre et all\u00e8ge le stockage.',

    // --- Présences ---

    'nav-presences':
        'Suivi de l\'assiduit\u00e9 : statistiques de pr\u00e9sence, calendrier des s\u00e9ances et saisie des pr\u00e9sences.',
    'nav-suivi-saisie':
        'Saisis les pr\u00e9sences et absences pour chaque s\u00e9ance du groupe.',

    // --- Tableau de bord et suivi ---

    'nav-tableau-bord':
        'Vue d\'ensemble du groupe : indices A-C-P, patterns d\'apprentissage, niveaux R\u00e0I et profils individuels.',
    'nav-apercu':
        'Observer les indices A-C-P, les patterns, les niveaux R\u00e0I et le d\u00e9veloppement du groupe via des graphiques.',
    'nav-suivi-liste':
        'Tableau complet des \u00e9tudiant\u00b7es avec indices, patterns et niveaux R\u00e0I. Filtrable et triable par colonne.',
    'nav-suivi-profil':
        'Fiche individuelle d\'un\u00b7e \u00e9tudiant\u00b7e : productions, mobilisation, progression, habilet\u00e9s, accompagnement et rapport.',
    'nav-suivi-interventions':
        'Planifie et documente les interventions R\u00e0I de niveaux 2 (pr\u00e9ventif) et 3 (intensif).',
    'nav-labo-etudes':
        'Analyse les r\u00e9sultats de ta d\u00e9marche p\u00e9dagogique : graphiques de progression, corr\u00e9lations et trajectoires.',
    'nav-labo-rythme':
        'Rythme des \u00e9valuations : portrait des copies impos\u00e9es vs restantes par \u00e9tudiant et par production.',
    'nav-labo-bilan':
        'Composer et exploiter un bilan r\u00e9flexif de fin de trimestre aupr\u00e8s des \u00e9tudiants.',

    // --- Planification ---

    'nav-planification':
        'Planification p\u00e9dagogique : alignement objectifs-activit\u00e9s-\u00e9valuations et organisation des le\u00e7ons.',
    'nav-conception-alignement':
        'Carte mentale interactive : visualise l\'alignement objectifs \u2192 activit\u00e9s \u2192 \u00e9valuations.',
    'nav-conception-organisateur':
        'Calendrier des s\u00e9quences sur 15 semaines et plans de le\u00e7ons avec option d\'enseignement explicite en 5 phases.',

    // --- Labo ---

    'nav-labo':
        'Utilitaires compl\u00e9mentaires pour l\'enseignement en classe.',
    'nav-labo-modelisation':
        'D\u00e9monstrations interactives et mod\u00e9lisations visuelles pour illustrer des concepts en classe.',
    'nav-labo-tirage':
        'Tirage au sort al\u00e9atoire et questions flash pour l\'animation en classe.',

    // =================================================================
    // COMPLÉMENT — clés présentes dans index.html, non couvertes par T1-T11
    // =================================================================

    // --- Onglets principaux (navigation) ---

    'nav-conception':
        'L\'onglet \u00ab\u00a0Structure\u00a0\u00bb regroupe la conception de tes outils d\'\u00e9valuation : productions, grilles, \u00e9chelles, cartouches et pratiques de notation.',
    'nav-calendrier':
        'L\'onglet \u00ab\u00a0Contexte\u00a0\u00bb regroupe la configuration de ton espace de travail : trimestre, cours, profil, \u00e9tudiant\u00b7es, horaire et assemblage du groupe-cours.',
    'nav-suivi':
        'L\'onglet \u00ab\u00a0Suivi\u00a0\u00bb regroupe le portrait du groupe : liste des individus, profil \u00e9tudiant\u00b7e, interventions R\u00e0I et laboratoire d\'analyse.',

    // --- Thème de l’interface ---

    'pref-theme':
        'Bascule entre le mode clair et le mode sombre selon tes pr\u00e9f\u00e9rences visuelles et l\'environnement d\'utilisation.',

    // =================================================================
    // ARCHIVES \u2014 Création et ouverture (modales R\u00e9serve)
    // =================================================================

    'reserve-select-trimestre':
        'Trimestre du groupe-cours à archiver.',
    'reserve-select-groupe':
        'Groupe-cours qui sera archiv\u00e9. Tous les groupes que tu as enseign\u00e9s peuvent \u00eatre archiv\u00e9s.',
    'reserve-bouton-verser':
        'Cr\u00e9e une copie du groupe-cours dans tes archives. Geste manuel, ne supprime rien dans ton codex de travail.',
    'reserve-bouton-changer-dossier':
        'Change le dossier d\'archives s\u00e9lectionn\u00e9 (Chrome et Edge seulement).',
    'reserve-ouvrir-toggle-copie':
        'Active la recopie des items d\u00e9j\u00e0 pr\u00e9sents dans ta biblioth\u00e8que active : ils recevront un nouvel identifiant et le suffixe \u00ab\u00a0\u2014 copie\u00a0\u00bb.',
    'reserve-ouvrir-bouton-reimporter':
        'Recopie les items coch\u00e9s dans tes biblioth\u00e8ques actives. L’archive d\'origine reste fig\u00e9.'

};

// Chaque entrée `cle: texte` devient `cle: { hover: texte }` dans
// CATALOGUE_ACCOMPAGNEMENT.
const entrees = {};
for (const cle in TOOLTIPS) {
    if (Object.prototype.hasOwnProperty.call(TOOLTIPS, cle)) {
        entrees[cle] = { hover: TOOLTIPS[cle] };
    }
}
window.accompagnement.ajouterEntrees(entrees);

})();
