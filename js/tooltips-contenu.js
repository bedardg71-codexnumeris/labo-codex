/**
 * tooltips-contenu.js
 * Base de contenu des tooltips — En-tete + Reglages
 * Convention : tutoiement, guillemets francais
 */
(function() {
'use strict';

const TOOLTIPS = {

    // =================================================================
    // EN-TETE — Zone 1 : Bandeau d'identification
    // =================================================================

    'entete-logo':
        'codexnumeris.org \u2014 Blog dans lequel est d\u00e9crite l\u2019exploration du Syst\u00e8me de suivi des apprentissages. \u00ab R\u00e9fl\u00e9chir, exp\u00e9rimenter, partager. \u00bb',

    'entete-version':
        'Version actuelle du syst\u00e8me. Le num\u00e9ro de build permet d\u2019identifier pr\u00e9cis\u00e9ment la version lors d\u2019un signalement de bogue.',

    'entete-mode-affichage':
        'Bascule entre l\u2019affichage des noms r\u00e9els (Normal) et des noms fictifs ou num\u00e9ros (Anonymisation) pour prot\u00e9ger l\u2019identit\u00e9 des \u00e9tudiants lors de pr\u00e9sentations publiques.',

    'entete-signaler-bug':
        'Signaler un probl\u00e8me technique. Pense \u00e0 noter le num\u00e9ro de build affich\u00e9 dans le bandeau pour faciliter le diagnostic.',

    // =================================================================
    // EN-TETE — Zone 2 : Contexte de travail
    // =================================================================

    'entete-pratique':
        'Pratique de notation active pour ce cours et cette session. Le code identifie le mod\u00e8le d\u2019\u00e9valuation (PAN-SDT), le cours (Litt) et la session (H26).',

    'entete-semaine':
        'Semaine courante du trimestre et date du jour. Situe l\u2019enseignant dans la progression de la session.',

    // =================================================================
    // EN-TETE — Zone 3 : Groupe-cours
    // =================================================================

    'entete-groupe-cours':
        'S\u00e9lectionner le groupe-cours sur lequel travailler. Toutes les donn\u00e9es affich\u00e9es (pr\u00e9sences, \u00e9valuations, tableau de bord) s\u2019ajustent au groupe choisi.',

    // =================================================================
    // EN-TETE — Zone 4 : Codex
    // =================================================================

    'entete-codex':
        'Le codex est ton \u00ab cloud personnel \u00bb sur cl\u00e9 USB. Il regroupe toutes tes donn\u00e9es dans un seul fichier portable que tu peux transporter entre tes appareils (ordinateur \u2192 USB \u2192 tablette \u2192 USB \u2192 ordinateur). La pastille verte indique que tout est enregistr\u00e9\u00a0; la pastille orange signale des modifications non sauvegard\u00e9es.',

    // =================================================================
    // EN-TETE — Zone 5 : Navigation
    // =================================================================

    'entete-reglages':
        'R\u00e9glages de base : configuration du trimestre actif, du cours, du groupe-cours, de l\u2019horaire et des pr\u00e9f\u00e9rences.',

    // =================================================================
    // REGLAGES — Panneaux du sous-onglet Trimestre
    // =================================================================

    'reglages-gestion-trimestres':
        'Configurer le trimestre actif : dates, bornes, semaines sp\u00e9ciales, cong\u00e9s et \u00e9v\u00e9nements impr\u00e9vus. Ces informations d\u00e9finissent le calendrier de tout le syst\u00e8me.',

    'reglages-cours':
        'D\u00e9finir le cours enseign\u00e9 : code, comp\u00e9tence minist\u00e9rielle et \u00e9l\u00e9ments de comp\u00e9tence. Ces informations sont le point d\u2019ancrage de l\u2019alignement p\u00e9dagogique.',

    'reglages-enseignant':
        'Profil de l\u2019enseignant. Ces informations servent de m\u00e9tadonn\u00e9es pour les ressources partag\u00e9es et s\u2019affichent dans le s\u00e9lecteur de groupe-cours.',

    'reglages-groupe-etudiants':
        'G\u00e9rer la liste des \u00e9tudiants : ajout manuel, import en lot (CSV/Excel/Omnivox). Le marqueur SA identifie les \u00e9tudiants en situation d\u2019aide pour le suivi R\u00e0I.',

    'reglages-horaire':
        'Configurer l\u2019horaire d\u2019un groupe : jours, heures, locaux, nombre de p\u00e9riodes. L\u2019horaire et le calendrier du trimestre g\u00e9n\u00e8rent automatiquement la grille des s\u00e9ances.',

    'reglages-groupe-cours':
        'Assembler un groupe-cours en r\u00e9unissant trimestre, cours, groupe, horaire, enseignant et pratique de notation. Le groupe-cours actif d\u00e9termine les donn\u00e9es affich\u00e9es dans toute l\u2019application.',

    // =================================================================
    // REGLAGES — Champs specifiques (Gestion des trimestres)
    // =================================================================

    'reglages-trim-identification':
        'Ces informations identifient le trimestre et pr\u00e9fixent les donn\u00e9es stock\u00e9es.',

    'reglages-trim-bornes':
        'Les dates de d\u00e9but, de fin, de fin des cours r\u00e9guliers et de remise des notes d\u00e9finissent le calendrier sur lequel s\u2019appuient les semaines et les s\u00e9ances.',

    'reglages-trim-semaines-speciales':
        'Semaine de planification et semaine d\u2019examens. Ces semaines sont trait\u00e9es diff\u00e9remment dans le calcul des s\u00e9ances et la planification.',

    'reglages-trim-conges':
        'Cong\u00e9s f\u00e9ri\u00e9s avec dates et reprises associ\u00e9es. Ajuste automatiquement le calendrier des s\u00e9ances.',

    'reglages-trim-imprevus':
        '\u00c9v\u00e9nements non planifi\u00e9s (annulations, fermetures) qui ajustent le calendrier des s\u00e9ances.',

    // =================================================================
    // REGLAGES — Champs specifiques (Cours)
    // =================================================================

    'reglages-cours-competence':
        'Code et \u00e9nonc\u00e9 de la comp\u00e9tence minist\u00e9rielle vis\u00e9e par le cours. Point d\u2019ancrage de l\u2019alignement p\u00e9dagogique.',

    'reglages-cours-elements':
        'Sous-comp\u00e9tences \u00e0 d\u00e9velopper durant le cours. Servent de r\u00e9f\u00e9rence pour la planification et les \u00e9valuations.',

    // =================================================================
    // REGLAGES — Champs specifiques (Groupe d'etudiants)
    // =================================================================

    'reglages-etudiants-sa':
        'Situation d\u2019aide \u2014 Marqueur pour les \u00e9tudiants identifi\u00e9s dans le mod\u00e8le de R\u00e9ponse \u00e0 l\u2019Intervention (R\u00e0I). Alimente le module d\u2019interventions du Tableau de bord.',

    'reglages-etudiants-import':
        'Importer des \u00e9tudiants en lot : coller depuis Excel/Omnivox ou charger un fichier CSV/TSV. Format : DA, Groupe, Nom, Pr\u00e9nom, Programme, (vide), SA.',

    // =================================================================
    // REGLAGES — Champs specifiques (Horaire)
    // =================================================================

    'reglages-horaire-periodes':
        'Le nombre de s\u00e9ances \u00d7 p\u00e9riodes par s\u00e9ance d\u00e9termine le volume hebdomadaire. La dur\u00e9e d\u2019une p\u00e9riode s\u2019applique \u00e0 tous les horaires.',

    // =================================================================
    // REGLAGES — Champs specifiques (Groupe-cours)
    // =================================================================

    'reglages-gc-nom-genere':
        'Nom g\u00e9n\u00e9r\u00e9 automatiquement \u00e0 partir des 5 \u00e9l\u00e9ments assembl\u00e9s. C\u2019est ce nom qui appara\u00eet dans le s\u00e9lecteur de groupe-cours en en-t\u00eate.',

    'reglages-gc-pratique':
        'Pratique de notation associ\u00e9e \u00e0 ce groupe-cours. D\u00e9termine les r\u00e8gles de construction de la note (sommative traditionnelle ou PAN bas\u00e9e sur des standards).',

    // =================================================================
    // REGLAGES — Patron Bibliotheque
    // =================================================================

    'reglages-bibliotheque':
        'Biblioth\u00e8que d\u2019entit\u00e9s r\u00e9utilisables. S\u00e9lectionne une entit\u00e9 existante ou cr\u00e9es-en une nouvelle. Permet de r\u00e9utiliser des configurations d\u2019un trimestre \u00e0 l\u2019autre.',

    // =================================================================
    // REGLAGES — Preferences
    // =================================================================

    'pref-outils':
        'Activer ou d\u00e9sactiver les fonctionnalit\u00e9s avanc\u00e9es (indices ACP, syst\u00e8me R\u00e0I). Les outils d\u00e9sactiv\u00e9s sont masqu\u00e9s de l\u2019interface.',

    'pref-outils-acp':
        'Indices pr\u00e9dictifs Assiduit\u00e9, Compl\u00e9tion, Performance. Calcul\u00e9s sur une fen\u00eatre glissante, ils alimentent le tableau de bord et la d\u00e9tection pr\u00e9coce des difficult\u00e9s.',

    'pref-outils-rai':
        'Niveaux d\u2019intervention et recommandations personnalis\u00e9es. Structure le soutien aux \u00e9tudiants en trois niveaux d\u2019intensit\u00e9 (universel, cibl\u00e9, intensif).',

    'pref-affichage':
        'Choisir les ressources visibles dans l\u2019interface : cartes SOLO, snapshots, graphiques, d\u00e9tails techniques, mode comparatif. Adapte la densit\u00e9 d\u2019information affich\u00e9e.',

    'pref-affichage-solo':
        'Affiche une carte avec les descriptions d\u00e9taill\u00e9es bas\u00e9es sur la taxonomie SOLO. Utile pour interpr\u00e9ter le niveau cognitif des apprentissages.',

    'pref-affichage-snapshots':
        'Historique hebdomadaire des indices A-C-P. Permet de suivre l\u2019\u00e9volution dans le temps.',

    'pref-affichage-graphiques':
        'Visualisation de la progression dans le temps via Chart.js.',

    'pref-affichage-details':
        'Affiche les formules de calcul et les donn\u00e9es brutes. Destin\u00e9 aux utilisateurs souhaitant v\u00e9rifier les calculs sous-jacents.',

    'pref-affichage-assiduite':
        'Choisir comment afficher les totaux de pr\u00e9sence et d\u2019assiduit\u00e9 (ex. : en p\u00e9riodes).',

    'pref-affichage-comparatif':
        'Mode exp\u00e9rimental. Affiche les deux pratiques de notation (SOM et PAN) c\u00f4te \u00e0 c\u00f4te pour comparer les approches.',

    'pref-visuel':
        'Effets visuels de l\u2019interface. L\u2019animation des points du tableau de bord peut \u00eatre d\u00e9sactiv\u00e9e pour r\u00e9duire les distractions.',

    'pref-navigation':
        'Court-circuiter la page d\u2019accueil pour ouvrir directement sur le tableau de bord au d\u00e9marrage.',

    'pref-tooltips':
        'Affiche des descriptions contextuelles au survol des \u00e9l\u00e9ments de l\u2019interface. D\u00e9sactiver si tu ma\u00eetrises d\u00e9j\u00e0 l\u2019application.',

    // =================================================================
    // REGLAGES — Depistage
    // =================================================================

    // --- Configuration du depistage ---

    'depist-activer-patterns':
        'Activer ou d\u00e9sactiver l\u2019identification des tendances r\u00e9currentes (progression, stagnation, r\u00e9gression) dans les r\u00e9sultats.',

    'depist-grille':
        'Grille utilis\u00e9e pour identifier les forces et d\u00e9fis. Doit \u00eatre la m\u00eame pour tous les artefacts du trimestre.',

    'depist-decoupler-pr':
        'S\u00e9parer le calcul de la note (P, selon la pratique) du calcul de risque (R, bas\u00e9 sur les N derni\u00e8res productions). Recommand\u00e9 avec \u00ab N meilleurs \u00bb.',

    'depist-fenetre':
        'Nombre de derni\u00e8res productions analys\u00e9es pour d\u00e9tecter les tendances. Valeur basse = d\u00e9tection pr\u00e9coce. Valeur \u00e9lev\u00e9e = d\u00e9tection plus fiable.',

    // --- Seuils de detection avances ---

    'depist-seuil-progression':
        'Diff\u00e9rence minimale (%) pour signaler une progression ou r\u00e9gression entre deux artefacts. Bas = sensible, \u00e9lev\u00e9 = moins sensible.',

    'depist-seuil-direction':
        'Variation minimale (%) pour afficher une tendance du risque. Contr\u00f4le la sensibilit\u00e9 de l\u2019indicateur directionnel.',

    'depist-seuil-defi':
        'Score (%) sous lequel un crit\u00e8re est identifi\u00e9 comme un d\u00e9fi n\u00e9cessitant attention. Bas = plus exigeant, \u00e9lev\u00e9 = moins exigeant.',

    'depist-restaurer':
        'R\u00e9initialiser tous les seuils de d\u00e9tection \u00e0 leurs valeurs par d\u00e9faut.',

    // --- Seuils d'interpretation ---

    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). D\u00e9termine les alertes du tableau de bord.',

    'depist-seuils-visuels':
        'Activer ou d\u00e9sactiver l\u2019affichage des couleurs Fragile / Acceptable / Bon dans les tableaux et indicateurs.',

    'depist-seuil-fragile':
        'Indice sous lequel la situation est consid\u00e9r\u00e9e pr\u00e9occupante (rouge). N\u00e9cessite une intervention.',

    'depist-seuil-acceptable':
        'Indice sous lequel la situation est en zone de vigilance (jaune). \u00c0 surveiller.',

    'depist-seuil-bon':
        'Indice au-dessus duquel la situation est satisfaisante (vert).',

    'depist-seuils-restaurer':
        'R\u00e9initialiser les seuils d\u2019interpr\u00e9tation \u00e0 leurs valeurs par d\u00e9faut (70/80/85%).',

    // =================================================================
    // REGLAGES — Donnees
    // =================================================================

    // --- Sauvegarde et restauration ---

    'donnees-sauvegarde':
        'Exporter tes donn\u00e9es (sauvegarde compl\u00e8te ou configuration p\u00e9dagogique seule) ou importer un fichier existant.',

    'donnees-export-complet':
        'Toutes les donn\u00e9es : cours, \u00e9tudiants, pr\u00e9sences, \u00e9valuations. Pour restaurer sur cet appareil ou un autre.',

    'donnees-export-config':
        'Uniquement les outils (grilles, \u00e9chelles, productions, cartouches). Pour partager avec des coll\u00e8gues (CC BY-NC-SA).',

    'donnees-import':
        'Charger une sauvegarde personnelle ou la configuration d\u2019un coll\u00e8gue. Le type sera d\u00e9tect\u00e9 automatiquement.',

    // --- Captures et recherche ---

    'donnees-captures':
        'Snapshots de suivi longitudinal et export anonymis\u00e9 pour la recherche en \u00e9ducation.',

    'donnees-snapshots':
        'Enregistre l\u2019\u00e9tat des indices A-C-P-E \u00e0 des moments cl\u00e9s pour le suivi longitudinal.',

    'donnees-capturer':
        'Capture manuelle imm\u00e9diate de l\u2019\u00e9tat actuel des indices.',

    'donnees-reconstruire':
        'Recalcule l\u2019historique des captures depuis le d\u00e9but. Utile apr\u00e8s un changement de param\u00e8tres.',

    'donnees-supprimer-captures':
        'Efface toutes les captures enregistr\u00e9es. Action irr\u00e9versible.',

    'donnees-export-recherche':
        'Export anonymis\u00e9 des indices A-C-P-E et statistiques agr\u00e9g\u00e9es pour la recherche. Aucune donn\u00e9e nominative incluse.',

    // --- Maintenance ---

    'donnees-maintenance':
        'Outils techniques : r\u00e9initialisation, informations de stockage et gestion avanc\u00e9e des ressources.',

    'donnees-reinitialiser':
        'Efface toutes les donn\u00e9es et revient \u00e0 l\u2019\u00e9tat initial. Triple confirmation + mot de passe requis. Irr\u00e9versible.',

    'donnees-info-techniques':
        'Stockage local (IndexedDB + localStorage), JSON lisible, aucune donn\u00e9e envoy\u00e9e sur internet.',

    'donnees-gestion-ressources':
        'Auditer et nettoyer les ressources p\u00e9dagogiques accumul\u00e9es. S\u00e9lectionner un type pour afficher la liste.',

    // =================================================================
    // PLANIFICATION — Alignement pedagogique
    // =================================================================

    'planif-sous-nav':
        'Deux vues compl\u00e9mentaires : la carte mentale d\u2019alignement et l\u2019organisateur du cours.',

    'planif-alignement':
        'Carte mentale interactive pour construire visuellement l\u2019alignement p\u00e9dagogique du cours.',

    // --- Barre d'outils ---

    'planif-selecteur-cours':
        'Choisir le cours \u00e0 planifier. Chaque cours a sa propre carte d\u2019alignement.',

    'planif-boutons-action':
        'Ajouter, supprimer, couper, copier et coller des n\u0153uds sur le canevas.',

    // --- Palette d'elements ---

    'planif-palette':
        'Glisser un \u00e9l\u00e9ment vers le canevas pour l\u2019ajouter \u00e0 la carte mentale.',

    'planif-pouvoir-enseigner':
        'Cadre curriculaire : comp\u00e9tence minist\u00e9rielle et id\u00e9es ma\u00eetresses du cours.',

    'planif-quoi-enseigner':
        'Types de connaissances (Anderson) : factuelle, conceptuelle, proc\u00e9durale et m\u00e9tacognitive.',

    'planif-comment-enseigner':
        'Dispositifs d\u2019enseignement : activit\u00e9s, soutien et r\u00e9vision.',

    'planif-design-apprentissages':
        '\u00c9valuations et productions : lier les objectifs aux moyens d\u2019\u00e9valuation.',

    'planif-structure':
        'Organisation temporelle : s\u00e9quences (semaines) et le\u00e7ons (s\u00e9ances).',

    'planif-aide':
        'Ouvrir le guide de la carte mentale (7 pages, panneau flottant ind\u00e9pendant).',

    // --- Canevas ---

    'planif-canevas':
        'Espace de travail de la carte mentale. Glisser des \u00e9l\u00e9ments, cr\u00e9er des liens, organiser visuellement le cours.',

    // --- Panneau de proprietes ---

    'planif-panneau-proprietes':
        'Propri\u00e9t\u00e9s du n\u0153ud s\u00e9lectionn\u00e9 : titre, description, clonage et suppression.',

    'planif-titre-noeud':
        'Nom de l\u2019\u00e9l\u00e9ment p\u00e9dagogique tel qu\u2019il appara\u00eet sur la carte.',

    'planif-description-noeud':
        'Notes ou pr\u00e9cisions sur cet \u00e9l\u00e9ment. Champ libre.',

    'planif-cloner':
        'Cr\u00e9er un clone de ce n\u0153ud. Les modifications se propagent \u00e0 toutes les copies.',

    'planif-supprimer-noeud':
        'Supprimer ce n\u0153ud et ses liens de la carte.',

    // --- Barre inferieure ---

    'planif-barre-outils':
        'Contr\u00f4les de zoom, filtres d\u2019affichage et options de vue du canevas.',

    'planif-zoom':
        'Ajuster le niveau de zoom du canevas.',

    'planif-filtres':
        'Filtrer l\u2019affichage des n\u0153uds et des liens sur le canevas.',

    // =================================================================
    // PLANIFICATION — Organisateur
    // =================================================================

    'orga-sous-nav':
        'Vue textuelle et structur\u00e9e des donn\u00e9es de la carte mentale. S\u00e9lectionner une s\u00e9quence et une le\u00e7on pour afficher son plan.',

    // --- Selecteurs de navigation ---

    'orga-selecteur-sequence':
        'Filtrer par s\u00e9quence pour restreindre la vue calendrier.',

    'orga-selecteur-lecon':
        'S\u00e9lectionner une le\u00e7on pour afficher son plan d\u00e9taill\u00e9.',

    // --- Vue calendrier ---

    'orga-vue-calendrier':
        'Vue hi\u00e9rarchique textuelle des s\u00e9quences, s\u00e9ances et activit\u00e9s avec leurs liens p\u00e9dagogiques.',

    // --- Plan de lecon ---

    'orga-entete-lecon':
        'Groupes-cours auxquels cette le\u00e7on s\u2019applique, avec leurs plages horaires.',

    'orga-objectif':
        'Ce que l\u2019\u00e9l\u00e8ve sera capable de faire au terme de la le\u00e7on.',

    'orga-connaissances-prealables':
        'Savoirs pr\u00e9alables \u00e0 v\u00e9rifier ou revoir avant d\u2019aborder cette le\u00e7on.',

    'orga-productions':
        'Productions et artefacts \u00e9valuatifs li\u00e9s aux activit\u00e9s de cette le\u00e7on.',

    'orga-enseignement-explicite':
        'Structure en 5 phases : ouverture, modelage, pratique guid\u00e9e, pratique autonome, objectivation.',

    'orga-coeur-lecon':
        'Activit\u00e9s p\u00e9dagogiques de la le\u00e7on. Associer des productions pour compl\u00e9ter l\u2019alignement.',

    // --- Elements contextuels du plan ---

    'orga-alerte-alignement':
        'Incoh\u00e9rence d\u2019alignement d\u00e9tect\u00e9e : une \u00e9valuation ou un objectif n\u2019est pas encore reli\u00e9 \u00e0 une production.',

    'orga-selecteur-production':
        'Associer une production (artefact \u00e9valuatif) \u00e0 cette activit\u00e9.',

    'orga-lien-pedagogique':
        'Connexion vers un autre \u00e9l\u00e9ment de la carte mentale (comp\u00e9tence, pr\u00e9requis, strat\u00e9gie, etc.).',

    'orga-item-a-revoir':
        '\u00c9l\u00e9ment pr\u00e9alable \u00e0 revoir en d\u00e9but de s\u00e9ance avant de poursuivre.',

    // =================================================================
    // TABLEAU DE BORD — Aperçu
    // =================================================================

    'tdb-sous-nav':
        'Quatre vues : aper\u00e7u du groupe, liste des individus, profil \u00e9tudiant et interventions R\u00e0I.',

    'tdb-apercu':
        'Portrait complet du groupe-cours : indices d\u2019apprentissage, patterns, interventions et graphiques de d\u00e9veloppement.',

    'tdb-liste-individus':
        'Vue d\u00e9taill\u00e9e de chaque \u00e9tudiant avec ses indices individuels.',

    'tdb-profil':
        'Fiche individuelle d\u2019un \u00e9tudiant : trajectoire, indices et historique.',

    'tdb-interventions-rai':
        'Gestion des interventions par niveau R\u00e0I : universel, pr\u00e9ventif, intensif.',

    // --- Section Observer ---

    'tdb-observer':
        'Indices A-C-E-P du groupe. Chaque barre positionne les \u00e9tudiants de Fragile \u00e0 Tr\u00e8s favorable.',

    'tdb-zones-couleur':
        'Fragile (30-49%), Mod\u00e9r\u00e9 (50-64%), Favorable (65-79%), Tr\u00e8s favorable (\u226580%). Seuils configurables dans R\u00e9glages.',

    'tdb-assiduite':
        'Taux de pr\u00e9sence aux s\u00e9ances. Chaque point = un \u00e9tudiant.',

    'tdb-completion':
        'Taux de remise des travaux. La corr\u00e9lation C\u00d7P indique le lien entre remise et r\u00e9sultats.',

    'tdb-engagement':
        'Niveau d\u2019engagement dans les activit\u00e9s d\u2019apprentissage. Combine plusieurs signaux comportementaux.',

    'tdb-performance':
        'R\u00e9sultats aux \u00e9valuations par niveaux : Incomplet, en D\u00e9veloppement, Ma\u00eetris\u00e9, \u00c9tendu.',

    // --- Section Intervenir ---

    'tdb-intervenir':
        'D\u00e9tection de patterns d\u2019apprentissage et r\u00e9partition par niveaux d\u2019intervention R\u00e0I.',

    'tdb-patterns':
        'R\u00e9partition des trajectoires : progression stable, d\u00e9fi sp\u00e9cifique, blocage \u00e9mergent ou critique.',

    'tdb-rai':
        'Trois niveaux R\u00e0I : universel, pr\u00e9ventif, intensif. Indique le type d\u2019intervention sugg\u00e9r\u00e9 pour chaque groupe d\u2019\u00e9tudiants.',

    // --- Section Développement du groupe ---

    'tdb-dev-groupe':
        '\u00c9volution d\u2019un indice dans le temps pour tout le groupe. Chaque ligne = un \u00e9tudiant.',

    'tdb-selecteur-indice':
        'Choisir l\u2019indice \u00e0 visualiser : Assiduit\u00e9, Compl\u00e9tion, Engagement ou Performance.',

    'tdb-selecteur-eleve-groupe':
        'Isoler la trajectoire d\u2019un \u00e9tudiant sp\u00e9cifique sur le graphique du groupe.',

    'tdb-graphique-groupe':
        'Graphique longitudinal du groupe. Cliquer sur une courbe pour la verrouiller.',

    // --- Section Développement individuel ---

    'tdb-dev-individuel':
        'R\u00e9sultats par artefact. Chaque point = un \u00e9tudiant sur une activit\u00e9. Les trajectoires isol\u00e9es m\u00e9ritent attention.',

    'tdb-selecteur-eleve-indiv':
        'Isoler la trajectoire d\u2019un \u00e9tudiant sp\u00e9cifique sur le graphique des artefacts.',

    'tdb-graphique-individuel':
        'R\u00e9sultats par activit\u00e9 d\u2019apprentissage. Les zones denses r\u00e9v\u00e8lent les tendances du groupe.',

    // --- Section Impact des jetons ---

    'tdb-impact-jetons':
        'Compare la trajectoire P des \u00e9tudiants ayant utilis\u00e9 un jeton de reprise \u00e0 ceux n\u2019en ayant pas utilis\u00e9. \u25a0 = s\u00e9ance avec jeton, \u25a1 = sans.',

    'tdb-selecteur-eleve-jetons':
        'Afficher la courbe P individuelle d\u2019un \u00e9tudiant ayant utilis\u00e9 un jeton de reprise.',

    // =================================================================
    // TABLEAU DE BORD — Liste des individus
    // =================================================================

    'liste-titre':
        'Liste compl\u00e8te des \u00e9tudiants avec indices A-C-E-P, patterns et niveaux R\u00e0I. Filtrable et triable.',

    'liste-filtres':
        'Filtrer par groupe, programme, niveau R\u00e0I ou pattern. Le champ recherche accepte nom, pr\u00e9nom ou DA.',

    'liste-filtre-rai':
        'Filtrer par niveau d\u2019intervention : Tous, Niveau 1 (universel), Niveau 2 (pr\u00e9ventif), Niveau 3 (intensif).',

    'liste-filtre-pattern':
        'Filtrer par trajectoire d\u00e9tect\u00e9e : progression stable, d\u00e9fi sp\u00e9cifique, blocage \u00e9mergent ou critique.',

    'liste-recherche':
        'Rechercher un \u00e9tudiant par nom, pr\u00e9nom ou num\u00e9ro d\u2019admission (DA).',

    'liste-col-sa':
        'Services adapt\u00e9s. Une coche indique que l\u2019\u00e9tudiant b\u00e9n\u00e9ficie d\u2019un plan de services.',

    'liste-col-interv':
        'Interventions document\u00e9es pour cet \u00e9tudiant. Cliquer pour consulter l\u2019historique.',

    // =================================================================
    // TABLEAU DE BORD — Profil
    // =================================================================

    // --- Panneau latéral ---

    'profil-selecteur':
        'Choisir un \u00e9tudiant. Les boutons Pr\u00e9c./Suiv. parcourent la liste s\u00e9quentiellement.',

    'profil-nav-observations':
        'Sept vues d\u2019observation : productions, engagement, progression, habilet\u00e9s, accompagnement, travaux, rapport.',

    // --- Vue Productions ---

    'profil-productions':
        'Liste des artefacts avec description, jeton, note, date et acc\u00e8s direct \u00e0 l\u2019\u00e9valuation.',

    'profil-col-jeton':
        'Jeton de reprise : permet \u00e0 l\u2019\u00e9tudiant de reprendre un artefact pour am\u00e9liorer son r\u00e9sultat.',

    // --- Vue Engagement ---

    'profil-engagement':
        'Trois composantes (A, C, P) et calcul de l\u2019engagement E = \u221b(A \u00d7 C \u00d7 P). Barre de positionnement dans les zones.',

    'profil-formule-engagement':
        'E = \u221b(A \u00d7 C \u00d7 P). Moyenne g\u00e9om\u00e9trique : un indice tr\u00e8s bas tire l\u2019engagement vers le bas m\u00eame si les autres sont \u00e9lev\u00e9s.',

    // --- Vue Progression temporelle ---

    'profil-progression':
        '\u00c9volution des indices A-C-P au fil des semaines. Marqueurs : \u25cb artefact d\u00fb, \u25cf jeton appliqu\u00e9, \u25bc intervention R\u00e0I. Zones : Incomplet, en D\u00e9veloppement, Ma\u00eetris\u00e9, \u00c9tendu.',

    // --- Vue Développement des habiletés ---

    'profil-habiletes':
        'Graphique d\u2019\u00e9volution des crit\u00e8res (si \u00e9valuations avec d\u00e9tails). Marqueurs : \u25cf jeton, \u25bc intervention. Forces/d\u00e9fis par crit\u00e8re.',

    // --- Vue Accompagnement ---

    'profil-accompagnement':
        'Analyse R\u00e0I, contexte d\u2019apprentissage, structure SOLO et historique des interventions.',

    'profil-accomp-rai':
        'Performance globale et progression par crit\u00e8re. D\u00e9termine le niveau d\u2019intervention sugg\u00e9r\u00e9.',

    'profil-accomp-contexte':
        'Assiduit\u00e9 et compl\u00e9tion de l\u2019\u00e9tudiant. Interpr\u00e9tation du contexte apr\u00e8s les premi\u00e8res remises.',

    'profil-accomp-solo':
        'Analyse des r\u00e9ponses selon la taxonomie SOLO (Biggs & Collis). Identifie forces et d\u00e9fis structurels.',

    // --- Modale Informations confidentielles ---

    'profil-confidentiel':
        'Donn\u00e9es confidentielles stock\u00e9es localement : parcours, d\u00e9fis, portrait de lecteur, diagnostic, notes.',

    'profil-conf-parcours':
        '\u00c9PGC (1re g\u00e9n\u00e9ration c\u00e9gep) et historique du cours ant\u00e9rieur.',

    'profil-conf-lecteur':
        '\u00c9valuation des comp\u00e9tences de lecture : structure, rigueur, plausibilit\u00e9, nuance, fran\u00e7ais.',

    'profil-conf-diagnostic':
        'Services adapt\u00e9s, cat\u00e9gorie et sous-cat\u00e9gorie du diagnostic. Confidentiel.',

    // --- Historique des interventions ---

    'profil-historique':
        'Interventions R\u00e0I document\u00e9es pour cet \u00e9tudiant. Cr\u00e9er une nouvelle intervention depuis le profil.',

    // --- Vue Travaux soumis ---

    'profil-travaux':
        'Travaux soumis par l\u2019\u00e9tudiant. Les fichiers sont import\u00e9s depuis Travaux > Import.',

    // --- Vue Rapport ---

    'profil-rapport':
        'Rapport textuel configurable. Cocher les sections \u00e0 inclure et copier dans le presse-papier.',

    'profil-rapport-sections':
        'Cocher les sections souhait\u00e9es : Identification, Assiduit\u00e9, Compl\u00e9tion, Performance, Jetons, Date.',

    // =================================================================
    // TABLEAU DE BORD — Interventions RàI
    // =================================================================

    'interv-titre':
        'Planification et suivi des interventions R\u00e0I de niveaux 2 et 3. Cr\u00e9er, consulter et documenter.',

    'interv-btn-planifier':
        'Cr\u00e9er une nouvelle intervention de niveau 2 (pr\u00e9ventif) ou 3 (intensif) pour un groupe ou un individu.',

    'interv-carte':
        'Fiche d\u2019une intervention : statut, niveau, aper\u00e7u du sous-groupe (patterns, R\u00e0I, notes individuelles).',

    'interv-apercu-sous-groupe':
        'Agr\u00e9gation des profils du sous-groupe : patterns d\u2019apprentissage, niveaux R\u00e0I et notes individuelles.',

    'interv-patterns':
        'R\u00e9partition des patterns d\u00e9tect\u00e9s dans le sous-groupe cibl\u00e9 par l\u2019intervention.',

    'interv-niveaux-rai':
        'R\u00e9partition des niveaux R\u00e0I (1, 2, 3) dans le sous-groupe cibl\u00e9 par l\u2019intervention.',

    'interv-notes-individuelles':
        'Observations de l\u2019enseignant pour chaque \u00e9tudiant lors de l\u2019intervention.',

    'interv-gestion-absences':
        'Lier l\u2019intervention \u00e0 une s\u00e9ance. Les non-participants sont marqu\u00e9s absents motiv\u00e9s (cong\u00e9).',

    'interv-presences-notes':
        'Cocher les pr\u00e9sents et documenter les observations individuelles. Le badge indique le niveau R\u00e0I.',

    // =================================================================
    // ÉVALUATIONS — Aperçu
    // =================================================================

    'eval-apercu':
        'Statistiques synth\u00e9tiques : taux de compl\u00e9tion moyen, productions r\u00e9alis\u00e9es et productions configur\u00e9es.',

    'eval-stats-groupe':
        'Indicateurs cl\u00e9s du groupe-cours : compl\u00e9tion, productions r\u00e9alis\u00e9es et nombre d\u2019artefacts configur\u00e9s.',

    'eval-taux-completion':
        'Moyenne des taux de remise individuels. Correspond \u00e0 l\u2019indice C (Compl\u00e9tion) du Tableau de bord.',

    // =================================================================
    // ÉVALUATIONS — Liste des évaluations
    // =================================================================

    'eval-liste':
        'Toutes les \u00e9valuations du groupe : r\u00e9sultats, niveaux IDME, jetons et acc\u00e8s aux dossiers PDF.',

    'eval-liste-resume':
        'R\u00e9sultats totaux, \u00e9valuations recevables (exclut les non-recevables), moyenne du groupe et nombre de productions.',

    'eval-col-jeton':
        'Type de jeton : I = Initial, D = D\u00e9lai, R = Reprise, RC = Reprise cibl\u00e9e. M\u00e9canisme de diff\u00e9renciation.',

    'eval-col-niveau':
        'Niveau IDME : I = Incomplet, D = en D\u00e9veloppement, M = Ma\u00eetris\u00e9, E = \u00c9tendu.',

    // =================================================================
    // ÉVALUATIONS — Évaluer une production
    // =================================================================

    // --- Paramètres (panneau gauche) ---

    'eval-page':
        'Interface d\u2019\u00e9valuation crit\u00e9ri\u00e9e. S\u00e9lectionner les param\u00e8tres \u00e0 gauche, \u00e9valuer et pr\u00e9visualiser la r\u00e9troaction \u00e0 droite.',

    'eval-grille':
        'Grille crit\u00e9ri\u00e9e avec pond\u00e9rations. D\u00e9termine les crit\u00e8res affich\u00e9s pour l\u2019\u00e9valuation.',

    'eval-echelle':
        '\u00c9chelle de conversion pourcentage \u2192 niveau IDME. Seuils configurables dans R\u00e9glages.',

    'eval-cartouche':
        'Mod\u00e8le de r\u00e9troaction automatique adapt\u00e9 au type de production. D\u00e9termine le vocabulaire et le ton des commentaires.',

    'eval-statut-remise':
        'Indiquer si la production a \u00e9t\u00e9 remise. Conditionne le calcul de l\u2019indice de compl\u00e9tion (C).',

    'eval-integrite':
        'Recevable ou non. Les travaux non recevables sont exclus des calculs de moyenne.',

    'eval-jetons':
        'D\u00e9lai (orange), Reprise (vert) ou Reprise cibl\u00e9e (violet). Permet \u00e0 l\u2019\u00e9tudiant de d\u00e9montrer sa progression.',

    'eval-jeton-delai':
        'Prolonge l\u2019\u00e9ch\u00e9ance de remise. L\u2019\u00e9valuation porte sur la m\u00eame production, remise plus tard.',

    'eval-jeton-reprise':
        'L\u2019\u00e9tudiant reprend enti\u00e8rement la production. La nouvelle \u00e9valuation remplace la note.',

    'eval-jeton-reprise-ciblee':
        'L\u2019\u00e9tudiant reprend un aspect sp\u00e9cifique cibl\u00e9 par l\u2019enseignant. Le niveau IDME peut \u00eatre ajust\u00e9.',

    'eval-note-finale':
        'R\u00e9sultat calcul\u00e9 en temps r\u00e9el : pourcentage pond\u00e9r\u00e9 et niveau IDME correspondant.',

    // --- Zone d'évaluation (panneau droit) ---

    'eval-retroaction':
        'R\u00e9troaction g\u00e9n\u00e9r\u00e9e automatiquement. Modifier le texte si n\u00e9cessaire, puis copier dans le presse-papier.',

    'eval-retroaction-options':
        'Sections \u00e0 inclure : Description, Objectif, T\u00e2che, Adresse (interpellation) et Contexte d\u2019apprentissage.',

    'eval-critere':
        '\u00c9valuer le crit\u00e8re en attribuant un niveau. La r\u00e9troaction est g\u00e9n\u00e9r\u00e9e automatiquement selon la cartouche.',

    'eval-francais-ecrit':
        '\u00c9valuation algorithmique : saisir les codes d\u2019erreurs et le nombre de mots. Calcul et r\u00e9troaction automatiques.',

    'eval-codes-erreurs':
        'Codes num\u00e9riques des erreurs s\u00e9par\u00e9s par points-virgules. Voir la grille pour la correspondance codes \u2192 cat\u00e9gories.',

    'eval-niveau-idme':
        'Niveau calcul\u00e9 automatiquement. Modifier uniquement si n\u00e9cessaire (ex. : reprise cibl\u00e9e).',

    // — Aper\u00e7u — cartes m\u00e9triques —
    'eval-productions-realisees':
        'Nombre de productions pour lesquelles au moins une \u00e9valuation a \u00e9t\u00e9 enregistr\u00e9e dans le groupe.',
    'eval-productions-configurees':
        'Nombre total de productions d\u00e9finies dans Construction de la note. Inclut portfolios, artefacts et travaux.',
    'eval-travaux-preparation':
        'Nombre de fichiers en file d\u2019attente dans le pipeline d\u2019importation, pr\u00eats \u00e0 \u00eatre trait\u00e9s et import\u00e9s.',
    'eval-travaux-importes':
        'Nombre de fichiers de travaux stock\u00e9s et pr\u00eats \u00e0 \u00eatre annot\u00e9s ou \u00e9valu\u00e9s.',

    // — R\u00e9troaction — options individuelles —
    'eval-retro-description':
        'Inclut un rappel du contexte de la production (titre et description de l\u2019artefact) dans la r\u00e9troaction remise \u00e0 l\u2019\u00e9tudiant.',
    'eval-retro-objectif':
        'Inclut l\u2019objectif d\u2019apprentissage vis\u00e9 par la production. Aide l\u2019\u00e9tudiant \u00e0 comprendre ce qu\u2019il devait d\u00e9montrer.',
    'eval-retro-tache':
        'Inclut le rappel de la t\u00e2che demand\u00e9e. Situe la r\u00e9troaction par rapport aux consignes initiales.',
    'eval-retro-adresse':
        'Ajoute une interpellation personnalis\u00e9e au d\u00e9but de la r\u00e9troaction (ex. : Bonjour [Pr\u00e9nom]). Humanise le commentaire \u00e9crit.',
    'eval-retro-contexte':
        'Inclut le texte de contexte d\u2019apprentissage d\u00e9fini dans la cartouche. Situe la r\u00e9troaction dans la progression du cours.',

    // — Formulaire \u00e9valuation — actions et panneaux —
    'eval-modifier-attribution':
        'Corriger l\u2019attribution automatique : changer l\u2019\u00e9tudiant ou la production associ\u00e9e \u00e0 ce fichier.',
    'eval-btn-reinitialiser':
        'Efface le formulaire d\u2019\u00e9valuation en cours et restaure les valeurs par d\u00e9faut. Les s\u00e9lections de grille et d\u2019\u00e9chelle sont conserv\u00e9es.',
    'eval-btn-supprimer':
        'Supprime d\u00e9finitivement cette \u00e9valuation. La production reviendra au statut pr\u00e9c\u00e9dent. Action irr\u00e9versible.',
    'eval-panneau-criteres':
        'Liste des crit\u00e8res de la grille s\u00e9lectionn\u00e9e. Attribue un niveau \u00e0 chaque crit\u00e8re pour calculer la note finale.',
    'eval-filtre-production':
        'Filtrer les \u00e9valuations par production. Permet de voir les r\u00e9sultats d\u2019un seul artefact \u00e0 la fois.',
    'eval-filtre-statut':
        'Filtrer par statut de progression : non re\u00e7u, re\u00e7u, import\u00e9, annot\u00e9, \u00e9valu\u00e9, ou par type de jeton.',

    // — Barre d\u2019outils annotation —
    'travaux-btn-annoter':
        'Mode annotation : surligner, \u00e9crire et apposer des tampons directement sur la copie de l\u2019\u00e9tudiant.',
    'travaux-btn-evaluer':
        'Mode \u00e9valuation : ouvre les panneaux de crit\u00e8res et de param\u00e8tres pour \u00e9valuer cette production selon la grille.',
    'travaux-btn-alleger':
        'Remplace l\u2019original par un fac-simil\u00e9 l\u00e9ger (niveaux de gris, 800px). R\u00e9duit l\u2019espace de stockage. Les annotations sont conserv\u00e9es.',
    'travaux-btn-reimporter':
        'Remplace le fichier all\u00e9g\u00e9 par l\u2019original complet. Utile si tu as besoin de revoir les d\u00e9tails de la copie originale.',

    // — Import pipeline —
    'travaux-fsapi-config':
        'Stocke les fichiers import\u00e9s directement sur le disque local au lieu d\u2019IndexedDB. Recommand\u00e9 sur ordinateur pour \u00e9viter les limites de stockage du navigateur.',
    'travaux-pipeline-optimisation':
        'Les images sont optimis\u00e9es automatiquement (uniformisation 200 DPI, compression JPEG). Les PDF sont import\u00e9s tels quels.',

    // — Archivage et export —
    'travaux-archivage-etudiant':
        'T\u00e9l\u00e9charge un fichier ZIP contenant tous les travaux d\u2019un \u00e9tudiant. Utile pour remettre un dossier complet en fin de session.',
    'travaux-archivage-production':
        'T\u00e9l\u00e9charge un fichier ZIP regroupant tous les travaux d\u2019une production. Pratique pour archiver une \u00e9valuation compl\u00e8te.',
    'travaux-archivage-semestre':
        'Archive compl\u00e8te de tous les travaux du semestre en un seul fichier ZIP. Recommand\u00e9 en fin de session pour la conservation.',
    'travaux-archivage-alleger':
        'Convertit les originaux d\u00e9j\u00e0 export\u00e9s en fac-simil\u00e9s l\u00e9gers (niveaux de gris, 800px). Lib\u00e8re de l\u2019espace sans perdre les annotations.',
    'travaux-archivage-inclure-annotes':
        'Ajoute les versions annot\u00e9es (avec surlignage, commentaires et tampons) au fichier ZIP. D\u00e9cocher pour n\u2019exporter que les originaux.',
    'travaux-archivage-inclure-evals':
        'Ajoute un fichier de r\u00e9troaction pour chaque \u00e9valuation compl\u00e9t\u00e9e. Pratique pour la remise aux \u00e9tudiants.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Concepts transversaux
    // =================================================================

    'cn-bibliotheque':
        'G\u00e9rer les ressources : cr\u00e9er, importer depuis la biblioth\u00e8que communautaire, dupliquer, exporter ou supprimer.',

    'cn-pratiques-compat':
        'Pratiques compatibles : SOM = Sommative, STD = PAN-Standards, SPE = Sp\u00e9cifique, DEN = D\u00e9nombrement.',

    'cn-preparer-pdf':
        'G\u00e9n\u00e9rer un PDF de la ressource. Choisir la grille et l\u2019\u00e9chelle, puis pr\u00e9visualiser.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Aper\u00e7u
    // =================================================================

    'cn-apercu':
        'D\u00e9compte des ressources configur\u00e9es : productions, grilles, \u00e9chelles, pratiques et cartouches.',

    'cn-ressources':
        'Nombre total de ressources disponibles (locales + biblioth\u00e8que) pour chaque type.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Productions
    // =================================================================

    'cn-prod-titre':
        'D\u00e9finir les productions \u00e9tudiantes : portfolio, artefacts et travaux avec pond\u00e9rations et \u00e9ch\u00e9ances.',

    'cn-prod-type':
        'Portfolio (conteneur d\u2019artefacts pond\u00e9r\u00e9), Artefact (production du portfolio) ou Travail (\u00e9valuation ind\u00e9pendante).',

    'cn-prod-ponderation':
        'Poids dans la note finale. Les artefacts contribuent au portfolio ; les portfolios et travaux se partagent le 100%.',

    'cn-prod-activite':
        'Nom de l\u2019activit\u00e9 p\u00e9dagogique associ\u00e9e \u00e0 cette production. Cliquer sur \u270f\ufe0f pour modifier.',

    'cn-prod-grille':
        'Associer une grille d\u2019\u00e9valuation \u00e0 cette production. D\u00e9finit les crit\u00e8res utilis\u00e9s lors de l\u2019\u00e9valuation.',

    'cn-prod-objectif':
        'Ce que l\u2019\u00e9tudiant sera capable de faire. Utilis\u00e9 dans la r\u00e9troaction et le dossier PDF.',

    'cn-prod-tache':
        'Ce qui est demand\u00e9 \u00e0 l\u2019\u00e9tudiant. Appara\u00eet dans le dossier PDF de r\u00e9troaction.',

    'cn-prod-tableau':
        'Tableau r\u00e9capitulatif de toutes les productions : titre, type, pond\u00e9ration et \u00e9ch\u00e9ance.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Grilles de crit\u00e8res
    // =================================================================

    'cn-grille-titre':
        'Grilles r\u00e9utilisables avec crit\u00e8res pond\u00e9r\u00e9s. Chaque grille d\u00e9finit les crit\u00e8res d\u2019\u00e9valuation d\u2019une production.',

    'cn-grille-critere':
        'Crit\u00e8res avec nom, type, pond\u00e9ration et description. La pond\u00e9ration totale doit atteindre 100%.',

    'cn-grille-type-critere':
        'M\u00e9thode d\u2019\u00e9valuation : Holistique (attribution manuelle d\u2019un niveau) ou Algorithmique (calcul automatique).',

    'cn-grille-ponderation-totale':
        'Somme des pond\u00e9rations de tous les crit\u00e8res. Doit atteindre 100% pour que la grille soit valide.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — \u00c9chelles de performance
    // =================================================================

    'cn-echelle-titre':
        '\u00c9chelles de conversion pourcentage \u2192 niveaux de performance. Configurer les seuils et couleurs.',

    'cn-echelle-niveau':
        'Niveaux avec code, nom, plages de pourcentage, valeur ponctuelle et couleur.',

    'cn-echelle-valeur-ponctuelle':
        'Valeur num\u00e9rique fixe attribu\u00e9e au niveau pour les calculs de note. Limite l\u2019impact des r\u00e9sultats extr\u00eames.',

    'cn-echelle-apercu':
        'Barre color\u00e9e montrant les plages de chaque niveau. V\u00e9rifie visuellement la coh\u00e9rence des seuils.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Cartouches de r\u00e9troaction
    // =================================================================

    'cn-cartouche-titre':
        'Matrices de commentaires automatiques. Chaque cartouche g\u00e9n\u00e8re une r\u00e9troaction par crit\u00e8re \u00d7 niveau.',

    'cn-cartouche-selectors':
        'La grille d\u00e9termine les crit\u00e8res (lignes), l\u2019\u00e9chelle d\u00e9termine les niveaux (colonnes) de la matrice.',

    'cn-cartouche-contexte':
        'Texte introductif optionnel affich\u00e9 au d\u00e9but de la r\u00e9troaction si l\u2019option \u00ab Contexte \u00bb est coch\u00e9e.',

    'cn-cartouche-matrice':
        'Tableau crit\u00e8res \u00d7 niveaux. Chaque cellule est un commentaire de r\u00e9troaction. Assemblage automatique lors de l\u2019\u00e9valuation.',

    // =================================================================
    // CONSTRUCTION DE LA NOTE — Pratiques de notation
    // =================================================================

    'cn-pratique-titre':
        'Assemblage final : type de pratique, \u00e9chelle, structure des \u00e9valuations et syst\u00e8me de jetons.',

    'cn-pratique-type':
        'SOM = Sommative (moyenne pond\u00e9r\u00e9e), STD = PAN-Standards (meilleures \u00e9valuations), SPE = Sp\u00e9cifique, DEN = D\u00e9nombrement.',

    'cn-pratique-discipline':
        'Discipline acad\u00e9mique associ\u00e9e. Filtre les ressources de la biblioth\u00e8que par pertinence.',

    'cn-pratique-echelle':
        '\u00c9chelle IDME utilis\u00e9e pour convertir les pourcentages en niveaux. Configurable dans \u00c9chelles de performance.',

    'cn-pratique-jetons':
        'Ressources limit\u00e9es (D\u00e9lai, Reprise, Reprise cibl\u00e9e) pour adapter le parcours \u00e9valuatif de l\u2019\u00e9tudiant.',

    'cn-pratique-appliquer':
        'D\u00e9finir cette pratique comme configuration active du cours. Conditionne tous les calculs de notes et indices.',

    // =================================================================
    // NAVIGATION PRINCIPALE — Onglets principaux
    // =================================================================

    'nav-accueil':
        'Retour \u00e0 la page d\u2019accueil du syst\u00e8me.',

    'nav-tableau-bord':
        'Vue d\u2019ensemble du groupe : indices A-C-E-P, patterns d\u2019apprentissage, niveaux R\u00e0I et profils individuels.',

    'nav-presences':
        'Suivi de l\u2019assiduit\u00e9 : statistiques de pr\u00e9sence, calendrier des s\u00e9ances et saisie des pr\u00e9sences.',

    'nav-evaluations':
        '\u00c9valuation des productions : grilles crit\u00e9ri\u00e9es, niveaux IDME et r\u00e9troaction diff\u00e9renci\u00e9e automatique.',

    'nav-construction':
        'Configuration de l\u2019\u00e9valuation : productions, grilles, \u00e9chelles, cartouches et pratiques de notation.',

    'nav-boite-outils':
        'Utilitaires compl\u00e9mentaires pour l\u2019enseignement.',

    'nav-planification':
        'Planification p\u00e9dagogique : alignement objectifs-activit\u00e9s-\u00e9valuations et organisation des le\u00e7ons.',

    'nav-aide':
        'Documentation, tutoriels et ressources d\u2019aide.',

    // =================================================================
    // SOUS-NAVIGATION — Tableau de bord
    // =================================================================

    'nav-tdb-apercu':
        'Observer les indices A-C-E-P, les patterns, les niveaux R\u00e0I et le d\u00e9veloppement du groupe via des graphiques.',

    'nav-tdb-liste':
        'Tableau complet des \u00e9tudiants avec indices, patterns et niveaux R\u00e0I. Filtrable et triable par colonne.',

    'nav-tdb-profil':
        'Fiche individuelle d\u2019un \u00e9tudiant : productions, engagement, progression, habilet\u00e9s, accompagnement et rapport.',

    'nav-tdb-interventions':
        'Planifier et documenter les interventions R\u00e0I de niveaux 2 (pr\u00e9ventif) et 3 (intensif).',

    // =================================================================
    // SOUS-NAVIGATION — Pr\u00e9sences
    // =================================================================

    'nav-pres-apercu':
        'Statistiques synth\u00e9tiques : taux d\u2019assiduit\u00e9 moyen, s\u00e9ances donn\u00e9es, prochaine s\u00e9ance et effectif.',

    'nav-pres-calendrier':
        'Calendrier du trimestre : grilles mensuelles, jours de cours, cong\u00e9s et reprises.',

    'nav-pres-saisie':
        'Saisir les pr\u00e9sences et absences pour chaque s\u00e9ance du groupe.',

    // =================================================================
    // SOUS-NAVIGATION — \u00c9valuations
    // =================================================================

    'nav-eval-apercu':
        'Statistiques synth\u00e9tiques : taux de compl\u00e9tion moyen, productions r\u00e9alis\u00e9es et configur\u00e9es.',

    'nav-eval-liste':
        'Tableau exhaustif des \u00e9valuations : r\u00e9sultats, niveaux IDME, jetons et dossiers PDF.',

    'nav-eval-importer':
        'Importer les travaux des \u00e9tudiants (PDF, images) et pr\u00e9parer les fichiers (rotation, assemblage).',

    'nav-eval-annoter':
        'Annoter les copies et \u00e9valuer selon la grille de crit\u00e8res, sur le m\u00eame document.',

    'travaux-production':
        'S\u00e9lectionne la production (travail, examen) que tu es en train de corriger. Les fichiers import\u00e9s seront associ\u00e9s \u00e0 cette production pour l\u2019\u00e9valuation.',

    'travaux-evaluer':
        'Ouvre l\u2019interface d\u2019\u00e9valuation avec l\u2019\u00e9tudiant et la production pr\u00e9-s\u00e9lectionn\u00e9s. Tu pourras appliquer une grille de crit\u00e8res et g\u00e9n\u00e9rer une r\u00e9troaction.',

    'nav-eval-exporter':
        'Exporter les PDF annot\u00e9s aux \u00e9tudiants, archiver le semestre et all\u00e9ger le stockage.',

    // =================================================================
    // SOUS-NAVIGATION — Construction de la note
    // =================================================================

    'nav-cn-apercu':
        'D\u00e9compte des ressources configur\u00e9es : productions, grilles, \u00e9chelles, pratiques et cartouches.',

    'nav-cn-productions':
        'D\u00e9finir les productions \u00e9tudiantes : portfolio, artefacts et travaux avec pond\u00e9rations et \u00e9ch\u00e9ances.',

    'nav-cn-grilles':
        'Cr\u00e9er des grilles r\u00e9utilisables avec crit\u00e8res nomm\u00e9s, typ\u00e9s et pond\u00e9r\u00e9s.',

    'nav-cn-echelles':
        'Configurer les \u00e9chelles IDME : seuils, valeurs ponctuelles, couleurs et aper\u00e7u visuel.',

    'nav-cn-cartouches':
        'Cr\u00e9er des matrices de commentaires automatiques (crit\u00e8res \u00d7 niveaux) pour la r\u00e9troaction diff\u00e9renci\u00e9e.',

    'nav-cn-pratiques':
        'Assembler une pratique compl\u00e8te (SOM, STD, SPE, DEN) en associant \u00e9chelle, structure et jetons.',

    // =================================================================
    // SOUS-NAVIGATION — Bo\u00eete \u00e0 outils
    // =================================================================

    'nav-bao-tirage':
        'Tirage au sort al\u00e9atoire dans le groupe d\u2019\u00e9tudiants.',

    // =================================================================
    // SOUS-NAVIGATION — Planification
    // =================================================================

    'nav-planif-alignement':
        'Carte mentale interactive : visualiser l\u2019alignement objectifs \u2192 activit\u00e9s \u2192 \u00e9valuations.',

    'nav-planif-organisateur':
        'Calendrier des s\u00e9quences sur 15 semaines et plans de le\u00e7ons avec enseignement explicite en 5 \u00e9tapes.',

    // =================================================================
    // SOUS-NAVIGATION — R\u00e9glages
    // =================================================================

    'nav-reg-trimestre':
        'Configuration du trimestre, du cours, de l\u2019enseignant, du groupe d\u2019\u00e9tudiants, de l\u2019horaire et du groupe-cours.',

    'nav-reg-preferences':
        'Personnaliser l\u2019interface : outils actifs, ressources affich\u00e9es, effets visuels et comportement de navigation.',

    'nav-reg-depistage':
        'Configurer les seuils de d\u00e9tection des patterns et d\u2019interpr\u00e9tation des indices A-C-P.',

    'nav-reg-donnees':
        'Sauvegarde, restauration, snapshots A-C-P-E, export anonymis\u00e9, r\u00e9initialisation et maintenance.',

    'nav-reg-apropos':
        'Informations sur l\u2019application et sa version.'
};

// Export global
window.TOOLTIPS = TOOLTIPS;

})();
