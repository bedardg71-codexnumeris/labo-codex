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
    // EN-TETE — Zone 4 : Navigation
    // =================================================================

    'entete-nav-principale':
        'Modules principaux du syst\u00e8me. Chaque onglet ouvre une section d\u00e9di\u00e9e avec sa propre sous-navigation.',

    'entete-sous-nav':
        'Sous-sections du module actif. Ce menu change selon l\u2019onglet principal s\u00e9lectionn\u00e9.',

    'entete-reglages':
        'R\u00e9glages de base : configuration du trimestre actif, du cours, du groupe-cours, de l\u2019horaire et des pr\u00e9f\u00e9rences.',

    // =================================================================
    // REGLAGES — Sous-navigation
    // =================================================================

    'reglages-sous-nav':
        'Configuration de base de l\u2019application. Commence par Trimestre pour d\u00e9finir le cadre organisationnel.',

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

    // =================================================================
    // REGLAGES — Depistage
    // =================================================================

    'depist-sous-nav':
        'Configuration de la d\u00e9tection des patterns et de l\u2019identification des forces et d\u00e9fis. Influence la sensibilit\u00e9 des alertes du tableau de bord.',

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

    'donnees-sous-nav':
        'Sauvegarde, restauration, captures de progression et maintenance de l\u2019application.',

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
        'Auditer et nettoyer les ressources p\u00e9dagogiques accumul\u00e9es. S\u00e9lectionner un type pour afficher la liste.'
};

// Export global
window.TOOLTIPS = TOOLTIPS;

})();
