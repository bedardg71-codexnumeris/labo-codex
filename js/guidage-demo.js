/* ===============================
   MODULE: GUIDAGE CONTEXTUEL DÉMO
   Chantier 4 — MVP AQPC

   Encarts explicatifs statiques affichés dans chaque sous-section
   quand le mode démo est actif. Utilise le pattern .info-box--info.

   Exports: afficherGuidageDemo, retirerGuidageDemo
   =============================== */

(function() {
'use strict';

const GUIDAGE_TEXTES = {
    'apercu-contenu': {
        titre: 'Tableau de bord \u2014 \u00c9tat des lieux',
        texte: 'Ce tableau pr\u00e9sente les indicateurs ACPE (Assiduit\u00e9, Compl\u00e9tion, Performance, Engagement) pour tes 10\u00a0\u00e9tudiants fictifs. Les barres gradu\u00e9es montrent la distribution du groupe. Survole un point pour voir le profil d\u2019un \u00e9tudiant.'
    },
    'suivi-liste': {
        titre: 'Liste des individus',
        texte: 'Chaque ligne r\u00e9sume un \u00e9tudiant\u00a0: son taux de pr\u00e9sence, sa compl\u00e9tion des travaux et sa performance moyenne. Clique sur un nom pour ouvrir son profil d\u00e9taill\u00e9.'
    },
    'suivi-profil': {
        titre: 'Profil \u00e9tudiant',
        texte: 'Le profil individuel rassemble toutes les donn\u00e9es d\u2019un \u00e9tudiant\u00a0: pr\u00e9sences, \u00e9valuations, progression. C\u2019est ici que tu planifies une intervention si n\u00e9cessaire.'
    },
    'suivi-interventions': {
        titre: 'Interventions R\u00e0I',
        texte: 'Le syst\u00e8me R\u00e9ponse \u00e0 l\u2019Intervention (R\u00e0I) classe les \u00e9tudiants en 3\u00a0niveaux selon leurs indicateurs. Les recommandations sont g\u00e9n\u00e9r\u00e9es automatiquement pour guider tes interventions.'
    },
    'suivi-apercu-legacy': {
        titre: 'Pr\u00e9sences \u2014 Aper\u00e7u',
        texte: 'Vue synth\u00e9tique de l\u2019assiduit\u00e9 du groupe\u00a0: taux de pr\u00e9sence global, tendances hebdomadaires et \u00e9tudiants \u00e0 surveiller. Les 313\u00a0pr\u00e9sences de la d\u00e9mo couvrent une session compl\u00e8te.'
    },
    'calendrier-vue': {
        titre: 'Calendrier scolaire',
        texte: 'Le calendrier affiche chaque s\u00e9ance avec un code couleur par \u00e9tudiant. Rep\u00e8re les patterns d\u2019absence pour intervenir au bon moment.'
    },
    'suivi-saisie': {
        titre: 'Saisie des pr\u00e9sences',
        texte: 'C\u2019est ici que tu prends les pr\u00e9sences au quotidien. S\u00e9lectionne la date, coche les pr\u00e9sents, note les retards. En d\u00e9mo, tu peux tester la saisie sans cons\u00e9quence.'
    },
    'evaluations-liste': {
        titre: 'Liste des \u00e9valuations',
        texte: 'Toutes les \u00e9valuations enregistr\u00e9es, filtrables par production et par groupe. Clique sur une \u00e9valuation pour voir le d\u00e9tail crit\u00e9ri\u00e9.'
    },
    'evaluations-importer': {
        titre: 'Préparer et importer',
        texte: 'Importer les fichiers des étudiants (PDF, images), les préparer (rotation, assemblage) et les associer à une production.'
    },
    'evaluations-annoter': {
        titre: 'Annoter et évaluer',
        texte: 'Annoter les copies directement à l\u2019écran, apposer des tampons de rétroaction et évaluer selon la grille de critères.'
    },
    'evaluations-exporter': {
        titre: 'Exporter les travaux',
        texte: 'Exporter les PDF annotés aux étudiants.'
    },
    'conception-grille-criteres': {
        titre: 'Grilles de crit\u00e8res',
        texte: 'Les grilles d\u00e9finissent les crit\u00e8res d\u2019\u00e9valuation et leur pond\u00e9ration. La d\u00e9mo inclut 3\u00a0grilles pr\u00eates \u00e0 l\u2019emploi que tu peux explorer et dupliquer.'
    },
    'conception-echelle-performance': {
        titre: '\u00c9chelles de performance',
        texte: 'Les \u00e9chelles d\u00e9finissent les niveaux de r\u00e9ussite (ex.\u00a0: A, B, C ou Excellent \u00e0 Insuffisant). Elles sont associ\u00e9es aux grilles pour convertir les cotes en notes.'
    },
    'conception-retroactions': {
        titre: 'Cartouches de r\u00e9troaction',
        texte: 'Les cartouches sont des banques de commentaires pr\u00e9r\u00e9dig\u00e9s associ\u00e9s aux niveaux de ta grille. Elles acc\u00e9l\u00e8rent la r\u00e9troaction \u00e9crite lors de l\u2019\u00e9valuation.'
    },
    'conception-productions': {
        titre: 'Productions \u00e9tudiantes',
        texte: 'Les productions sont les travaux que tes \u00e9tudiants doivent remettre (dissertations, examens, projets). La d\u00e9mo en contient 11, chacune associ\u00e9e \u00e0 une grille de crit\u00e8res.'
    },
    'suivi-animation': {
        titre: 'Animation',
        texte: 'Outils pour animer la classe\u00a0: questions flash, tirage au sort d\u2019\u00e9tudiant\u00b7es et formation d\u2019\u00e9quipes.'
    },
    'conception-carte': {
        titre: 'Planification \u2014 Carte mentale',
        texte: 'La carte mentale te permet de visualiser l\u2019alignement p\u00e9dagogique de ton cours. La d\u00e9mo inclut une carte compl\u00e8te \u00ab\u00a0\u00c9criture et litt\u00e9rature\u00a0\u00bb avec 26\u00a0n\u0153uds et 45\u00a0liens. Explore les s\u00e9quences, le\u00e7ons et activit\u00e9s pour voir comment les \u00e9l\u00e9ments se relient.'
    },
    'labo-modelisation': {
        titre: 'Labo \u2014 Mod\u00e9lisation',
        texte: 'La mod\u00e9lisation te permet d\u2019ouvrir un PDF pour l\u2019annoter en direct lors d\u2019une projection en classe. Ouvre un fichier depuis ton ordinateur pour tester les outils d\u2019annotation.'
    }
};

/**
 * Injecte l'encart de guidage dans la sous-section active
 * Appelé par afficherSousSection() dans navigation.js
 */
function afficherGuidageDemo(idSousSection) {
    retirerGuidageDemo();

    if (typeof estEnModeDemo !== 'function' || !estEnModeDemo()) return;

    const config = GUIDAGE_TEXTES[idSousSection];
    if (!config) return;

    const conteneur = document.getElementById(idSousSection);
    if (!conteneur) return;

    const encart = document.createElement('div');
    encart.id = 'guidage-demo-encart';
    encart.className = 'info-box info-box--info';
    encart.style.marginTop = '10px';
    encart.innerHTML = '<strong>' + config.titre + '</strong> \u2014 ' + config.texte;

    conteneur.insertBefore(encart, conteneur.firstChild);
}

/**
 * Retire l'encart de guidage (changement de sous-section ou sortie de démo)
 */
function retirerGuidageDemo() {
    const existant = document.getElementById('guidage-demo-encart');
    if (existant) existant.remove();
}

// === EXPORTS ===
window.afficherGuidageDemo = afficherGuidageDemo;
window.retirerGuidageDemo = retirerGuidageDemo;


})();
