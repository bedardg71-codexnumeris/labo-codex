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
    'tableau-bord-apercu': {
        titre: 'Tableau de bord \u2014 \u00c9tat des lieux',
        texte: 'Ce tableau pr\u00e9sente les indicateurs ACPE (Assiduit\u00e9, Compl\u00e9tion, Performance, Engagement) pour vos 20\u00a0\u00e9tudiants fictifs. Les barres gradu\u00e9es montrent la distribution du groupe. Survolez un point pour voir le profil d\u2019un \u00e9tudiant.'
    },
    'tableau-bord-liste': {
        titre: 'Liste des individus',
        texte: 'Chaque ligne r\u00e9sume un \u00e9tudiant\u00a0: son taux de pr\u00e9sence, sa compl\u00e9tion des travaux et sa performance moyenne. Cliquez sur un nom pour ouvrir son profil d\u00e9taill\u00e9.'
    },
    'tableau-bord-profil': {
        titre: 'Profil \u00e9tudiant',
        texte: 'Le profil individuel rassemble toutes les donn\u00e9es d\u2019un \u00e9tudiant\u00a0: pr\u00e9sences, \u00e9valuations, progression. C\u2019est ici que vous planifiez une intervention si n\u00e9cessaire.'
    },
    'tableau-bord-interventions': {
        titre: 'Interventions R\u00e0I',
        texte: 'Le syst\u00e8me R\u00e9ponse \u00e0 l\u2019Intervention (R\u00e0I) classe les \u00e9tudiants en 3\u00a0niveaux selon leurs indicateurs. Les recommandations sont g\u00e9n\u00e9r\u00e9es automatiquement pour guider vos interventions.'
    },
    'presences-apercu': {
        titre: 'Pr\u00e9sences \u2014 Aper\u00e7u',
        texte: 'Vue synth\u00e9tique de l\u2019assiduit\u00e9 du groupe\u00a0: taux de pr\u00e9sence global, tendances hebdomadaires et \u00e9tudiants \u00e0 surveiller. Les 627\u00a0pr\u00e9sences de la d\u00e9mo couvrent une session compl\u00e8te.'
    },
    'presences-calendrier': {
        titre: 'Vue calendaire',
        texte: 'Le calendrier affiche chaque s\u00e9ance avec un code couleur par \u00e9tudiant. Rep\u00e9rez les patterns d\u2019absence pour intervenir au bon moment.'
    },
    'presences-saisie': {
        titre: 'Saisie des pr\u00e9sences',
        texte: 'C\u2019est ici que vous prenez les pr\u00e9sences au quotidien. S\u00e9lectionnez la date, cochez les pr\u00e9sents, notez les retards. En d\u00e9mo, vous pouvez tester la saisie sans cons\u00e9quence.'
    },
    'evaluations-apercu': {
        titre: '\u00c9valuations \u2014 Aper\u00e7u',
        texte: 'Synth\u00e8se des 200\u00a0\u00e9valuations de la d\u00e9mo\u00a0: progression du groupe, r\u00e9partition des r\u00e9sultats par production et indicateurs de compl\u00e9tion.'
    },
    'evaluations-liste': {
        titre: 'Liste des \u00e9valuations',
        texte: 'Toutes les \u00e9valuations enregistr\u00e9es, filtrables par production et par groupe. Cliquez sur une \u00e9valuation pour voir le d\u00e9tail crit\u00e9ri\u00e9.'
    },
    'evaluations-travaux': {
        titre: 'Travaux',
        texte: 'Le module Travaux permet d\u2019importer les fichiers des \u00e9tudiants (PDF, images), de les annoter directement \u00e0 l\u2019\u00e9cran et d\u2019y apposer des tampons de r\u00e9troaction.'
    },
    'construction-apercu': {
        titre: 'Construction de la note \u2014 Aper\u00e7u',
        texte: 'Ici se construit votre dispositif d\u2019\u00e9valuation\u00a0: productions \u00e9tudiantes, grilles de crit\u00e8res, \u00e9chelles de performance et cartouches de r\u00e9troaction. La d\u00e9mo inclut 11\u00a0productions et 3\u00a0grilles configur\u00e9es.'
    },
    'construction-grille-criteres': {
        titre: 'Grilles de crit\u00e8res',
        texte: 'Les grilles d\u00e9finissent les crit\u00e8res d\u2019\u00e9valuation et leur pond\u00e9ration. La d\u00e9mo inclut 3\u00a0grilles pr\u00eates \u00e0 l\u2019emploi que vous pouvez explorer et dupliquer.'
    },
    'construction-echelle-performance': {
        titre: '\u00c9chelles de performance',
        texte: 'Les \u00e9chelles d\u00e9finissent les niveaux de r\u00e9ussite (ex.\u00a0: A, B, C ou Excellent \u00e0 Insuffisant). Elles sont associ\u00e9es aux grilles pour convertir les cotes en notes.'
    },
    'construction-retroactions': {
        titre: 'Cartouches de r\u00e9troaction',
        texte: 'Les cartouches sont des banques de commentaires pr\u00e9r\u00e9dig\u00e9s associ\u00e9s aux niveaux de votre grille. Elles acc\u00e9l\u00e8rent la r\u00e9troaction \u00e9crite lors de l\u2019\u00e9valuation.'
    },
    'construction-productions': {
        titre: 'Productions \u00e9tudiantes',
        texte: 'Les productions sont les travaux que vos \u00e9tudiants doivent remettre (dissertations, examens, projets). La d\u00e9mo en contient 11, chacune associ\u00e9e \u00e0 une grille de crit\u00e8res.'
    },
    'boite-outils-tirage': {
        titre: 'Bo\u00eete \u00e0 outils',
        texte: 'Outils interactifs pour l\u2019animation en classe\u00a0: tirage au sort d\u2019\u00e9tudiants pour les mises en situation, les pr\u00e9sentations ou les exercices collaboratifs.'
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
