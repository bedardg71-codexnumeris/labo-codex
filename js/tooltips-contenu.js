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
        'Biblioth\u00e8que d\u2019entit\u00e9s r\u00e9utilisables. S\u00e9lectionne une entit\u00e9 existante ou cr\u00e9es-en une nouvelle. Permet de r\u00e9utiliser des configurations d\u2019un trimestre \u00e0 l\u2019autre.'
};

// Export global
window.TOOLTIPS = TOOLTIPS;

})();
