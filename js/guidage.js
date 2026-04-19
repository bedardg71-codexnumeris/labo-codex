/**
 * guidage.js — Tour guidé en 6 étapes
 *
 * Remplace l'ancien wizard de configuration en 5 étapes (Beta 95) par un
 * parcours intégré couvrant l'ensemble du cycle d'apprentissage de
 * l'application : Numérisation → Croisement → Observation → Compétence.
 *
 * Source textes : docs/refonte-textes/tour-guide-bloc5.md (validé 19 avril 2026)
 *
 * Architecture :
 * - 6 étapes (0 Accueil → 5 Planification). Déclenchement contextuel :
 *   chaque étape s'affiche quand l'utilisateur entre dans la section
 *   correspondante, une seule fois (liste d'étapes vues).
 * - Panneau flottant non bloquant (bas-droit desktop, pleine largeur iPad).
 * - Coexiste avec le mode Assistance (✴️) : le lancement du tour active
 *   automatiquement tooltips + aide contextuelle + tour guidé pour exposer
 *   les aides accessibles en mode ✴️.
 * - Stockage dans les préférences globales (pas préfixé par trimestre).
 *
 * Compatibilité : expose les anciens noms de fonctions (demarrerGuidageConfiguration,
 * arreterGuidage, etapeSuivante) en redirection vers les nouveaux handlers
 * pour ne pas casser parcours-apprentissage.js.
 */

(function() {
'use strict';

// =========================================================================
// Configuration des 6 étapes
// =========================================================================

var ETAPES_TOUR = [
    {
        id: 0,
        titre: 'Bienvenue',
        texte: "Labo Codex num\u00e9rise le travail que tu fais d\u00e9j\u00e0. Ce parcours te guide \u00e0 travers les \u00e9tapes essentielles. Tu peux le quitter \u00e0 tout moment et y revenir depuis les Pr\u00e9f\u00e9rences. Commence par configurer ton espace de travail dans R\u00e9glages.",
        actions: [
            { label: 'Aller aux R\u00e9glages', type: 'primaire', action: 'naviguerVers', param: 'contexte' },
            { label: 'Explorer seul\u00b7e',     type: 'secondaire', action: 'passerEtape' }
        ],
        // Étape 0 s'affiche sur la section 'accueil' uniquement
        correspond: function(idSousSection) {
            return !idSousSection || idSousSection === 'accueil';
        }
    },
    {
        id: 1,
        titre: 'R\u00e9glages',
        texte: "C'est ici que tu poses les fondations\u00a0: ton trimestre (dates, cong\u00e9s), ton cours (comp\u00e9tence, \u00e9l\u00e9ments), ton groupe d'\u00e9tudiant\u00b7es et ton horaire. Ce sont les m\u00eames informations que dans ton plan de cours. Tu les saisis une fois et l'application g\u00e9n\u00e8re automatiquement le calendrier de tes s\u00e9ances.\n\nLes ic\u00f4nes \ud83d\udccd t'en disent plus sur chaque section. Quand ton groupe-cours est assembl\u00e9, tu es pr\u00eat\u00b7e pour la suite.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('contexte-') === 0;
        }
    },
    {
        id: 2,
        titre: 'Structure',
        texte: "Tu construis ici tes outils d'\u00e9valuation \u2014 les m\u00eames que sur papier, mais r\u00e9utilisables. Les productions d\u00e9finissent les occasions d'apprentissage de tes \u00e9tudiant\u00b7es. Les grilles fixent tes crit\u00e8res. Les \u00e9chelles \u00e9tablissent les niveaux de performance. Les cartouches pr\u00e9parent la r\u00e9troaction. La pratique assemble le tout.\n\nL'ordre n'est pas impos\u00e9, mais les productions et les grilles sont un bon point de d\u00e9part.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            if (typeof idSousSection !== 'string') return false;
            // La section Structure contient les 4 sous-sections de conception
            // + carte/organisateur (planification). Étape 2 ne vise QUE la conception.
            var structureConception = ['structure-productions', 'structure-grille-criteres', 'structure-echelle-performance', 'structure-retroactions'];
            return structureConception.indexOf(idSousSection) !== -1;
        }
    },
    {
        id: 3,
        titre: '\u00c9valuations',
        texte: "C'est le geste quotidien\u00a0: tu s\u00e9lectionnes une production, tu attribues un niveau \u00e0 chaque crit\u00e8re et la r\u00e9troaction se construit au fur et \u00e0 mesure. Tu peux importer les copies de tes \u00e9tudiant\u00b7es (PDF ou images), les annoter avec des tampons / estampes ou des codes, puis les \u00e9valuer \u2014 tout sur le m\u00eame document.\n\nLes jetons (D\u00e9lai, Reprise, Reprise cibl\u00e9e) offrent \u00e0 l'\u00e9tudiant\u00b7e une nouvelle occasion de d\u00e9montrer sa comp\u00e9tence.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            return typeof idSousSection === 'string' && idSousSection.indexOf('evaluations-') === 0;
        }
    },
    {
        id: 4,
        titre: 'Tableau de bord',
        texte: "Le tableau de bord te montre ce que tu ne verrais pas facilement sur papier\u00a0: le portrait de ton groupe en un coup d'\u0153il. Les indices Assiduit\u00e9 (A), Compl\u00e9tion (C) et Performance (P) r\u00e9sument le contexte d'apprentissage observ\u00e9 de chaque \u00e9tudiant\u00b7e. Les zones de couleur t'aident \u00e0 rep\u00e9rer qui a besoin d'attention.\n\nExplore les quatre vues\u00a0: aper\u00e7u, liste, profil individuel et interventions R\u00e0I.",
        actions: [
            { label: "J'ai compris",      type: 'primaire', action: 'avancerEtape' },
            { label: 'Passer cette \u00e9tape', type: 'secondaire', action: 'passerEtape' }
        ],
        correspond: function(idSousSection) {
            if (idSousSection === 'apercu' || idSousSection === 'accueil-apercu') return true;
            return typeof idSousSection === 'string' && idSousSection.indexOf('suivi-') === 0;
        }
    },
    {
        id: 5,
        titre: 'Planification (optionnelle)',
        texte: "La carte mentale rend visible l'alignement p\u00e9dagogique de ton cours\u00a0: ce que tu vises, comment tu l'enseignes et comment tu le v\u00e9rifies. L'organisateur structure tes le\u00e7ons sur les 15 semaines du trimestre. Ce module est compl\u00e9mentaire. Tu peux l'explorer quand tu te sens \u00e0 l'aise avec les autres sections.",
        actions: [
            { label: 'Terminer le parcours', type: 'primaire',   action: 'terminerTour' },
            { label: 'Relancer plus tard',   type: 'secondaire', action: 'terminerTour' }
        ],
        correspond: function(idSousSection) {
            return idSousSection === 'structure-carte' || idSousSection === 'structure-organisateur';
        }
    }
];

// =========================================================================
// État persistant (préférences globales)
// =========================================================================

function obtenirEtape() {
    if (typeof obtenirPreference !== 'function') return null;
    var v = obtenirPreference('tourGuide_etape');
    return typeof v === 'number' ? v : null;
}

function definirEtape(valeur) {
    if (typeof definirPreference === 'function') {
        definirPreference('tourGuide_etape', valeur);
    }
}

function estComplete() {
    if (typeof obtenirPreference !== 'function') return false;
    return obtenirPreference('tourGuide_complete') === true;
}

function marquerComplete(valeur) {
    if (typeof definirPreference === 'function') {
        definirPreference('tourGuide_complete', !!valeur);
    }
}

function obtenirEtapesVues() {
    if (typeof obtenirPreference !== 'function') return [];
    var v = obtenirPreference('tourGuide_etapes_vues');
    return Array.isArray(v) ? v.slice() : [];
}

function marquerEtapeVue(idEtape) {
    var vues = obtenirEtapesVues();
    if (vues.indexOf(idEtape) === -1) {
        vues.push(idEtape);
        if (typeof definirPreference === 'function') {
            definirPreference('tourGuide_etapes_vues', vues);
        }
    }
}

// =========================================================================
// Panneau UI
// =========================================================================

var ID_PANNEAU = 'panneau-tour-guide';

function echapper(s) {
    if (typeof echapperHtml === 'function') return echapperHtml(s);
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

function fermerPanneau() {
    var el = document.getElementById(ID_PANNEAU);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function afficherPanneauEtape(etape) {
    fermerPanneau();

    var panneau = document.createElement('div');
    panneau.id = ID_PANNEAU;
    panneau.className = 'panneau-tour-guide';
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-label', 'Parcours guid\u00e9');

    // En-tête : titre + progression + fermeture
    var header = document.createElement('div');
    header.className = 'tour-header';

    var titre = document.createElement('span');
    titre.className = 'tour-titre';
    titre.textContent = etape.titre;
    header.appendChild(titre);

    var progression = document.createElement('span');
    progression.className = 'tour-progression';
    progression.setAttribute('aria-label', '\u00c9tape ' + (etape.id + 1) + ' sur ' + ETAPES_TOUR.length);
    for (var i = 0; i < ETAPES_TOUR.length; i++) {
        var dot = document.createElement('span');
        dot.className = 'tour-dot' + (i === etape.id ? ' actif' : (i < etape.id ? ' vu' : ''));
        progression.appendChild(dot);
    }
    header.appendChild(progression);

    var btnFermer = document.createElement('button');
    btnFermer.className = 'tour-fermer';
    btnFermer.type = 'button';
    btnFermer.setAttribute('aria-label', 'Fermer le parcours guid\u00e9');
    btnFermer.textContent = '\u2715';
    btnFermer.addEventListener('click', quitterTourGuide);
    header.appendChild(btnFermer);

    panneau.appendChild(header);

    // Corps : texte (support \n → paragraphes)
    var corps = document.createElement('div');
    corps.className = 'tour-corps';
    var paragraphes = etape.texte.split('\n\n');
    for (var j = 0; j < paragraphes.length; j++) {
        var p = document.createElement('p');
        p.textContent = paragraphes[j];
        corps.appendChild(p);
    }
    panneau.appendChild(corps);

    // Actions
    var actions = document.createElement('div');
    actions.className = 'tour-actions';
    for (var k = 0; k < etape.actions.length; k++) {
        var a = etape.actions[k];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tour-btn btn ' + (a.type === 'primaire' ? 'btn-primaire' : 'btn-secondaire');
        btn.textContent = a.label;
        (function(action) {
            btn.addEventListener('click', function() { executerAction(action); });
        })(a);
        actions.appendChild(btn);
    }
    panneau.appendChild(actions);

    document.body.appendChild(panneau);

    // Animation d'entrée
    requestAnimationFrame(function() {
        panneau.classList.add('visible');
    });
}

// =========================================================================
// Actions
// =========================================================================

function executerAction(a) {
    var etape = etapeCourante();
    switch (a.action) {
        case 'naviguerVers':
            marquerEtapeVue(etape.id);
            if (typeof afficherSection === 'function' && a.param) afficherSection(a.param);
            fermerPanneau();
            // L'étape suivante se déclenchera automatiquement à l'événement sectionAffichee
            definirEtape(etape.id + 1);
            break;
        case 'avancerEtape':
            avancerEtape();
            break;
        case 'passerEtape':
            passerEtape();
            break;
        case 'terminerTour':
            terminerTour();
            break;
        default:
            console.warn('[Tour guid\u00e9] Action inconnue :', a.action);
    }
}

function etapeCourante() {
    var i = obtenirEtape();
    if (i === null || i < 0 || i >= ETAPES_TOUR.length) return null;
    return ETAPES_TOUR[i];
}

function avancerEtape() {
    var courante = etapeCourante();
    if (!courante) return;
    marquerEtapeVue(courante.id);
    fermerPanneau();
    var prochaine = courante.id + 1;
    if (prochaine >= ETAPES_TOUR.length) {
        terminerTour();
        return;
    }
    definirEtape(prochaine);
    // La prochaine étape s'affichera quand l'utilisateur entrera dans sa section.
}

function passerEtape() {
    var courante = etapeCourante();
    if (!courante) return;
    marquerEtapeVue(courante.id);
    fermerPanneau();
    // L'étape reste la même : elle ne se réaffichera plus pour cette session,
    // mais les suivantes se déclenchent sur entrée dans leur section.
    // Pour éviter qu'elle bloque la progression, on avance sans naviguer.
    var prochaine = courante.id + 1;
    if (prochaine >= ETAPES_TOUR.length) {
        terminerTour();
    } else {
        definirEtape(prochaine);
    }
}

function terminerTour() {
    fermerPanneau();
    marquerComplete(true);
    definirEtape(null);
}

function quitterTourGuide() {
    fermerPanneau();
    marquerComplete(true);
    definirEtape(null);
}

// =========================================================================
// Démarrage / déclenchement
// =========================================================================

function demarrerTourGuide() {
    // Réinitialiser l'état pour démarrer un nouveau tour
    definirEtape(0);
    marquerComplete(false);
    if (typeof definirPreference === 'function') {
        definirPreference('tourGuide_etapes_vues', []);
    }

    // Activer les couches complémentaires pour cohérence visuelle
    if (typeof definirTourGuide === 'function') definirTourGuide(true);
    if (typeof definirTooltips === 'function') definirTooltips(true);
    if (typeof definirAideContextuelle === 'function') definirAideContextuelle(true);

    // Afficher l'étape 0 immédiatement
    afficherPanneauEtape(ETAPES_TOUR[0]);
}

function relancerTourGuide() {
    demarrerTourGuide();
}

function verifierDeclenchementAuto(idSousSection) {
    if (estComplete()) return;
    var idxEtape = obtenirEtape();
    if (idxEtape === null) return;

    var etape = ETAPES_TOUR[idxEtape];
    if (!etape) return;

    // Ne pas rejouer une étape déjà vue
    var vues = obtenirEtapesVues();
    if (vues.indexOf(etape.id) !== -1) return;

    // Déclencher si la section correspond
    if (etape.correspond(idSousSection)) {
        afficherPanneauEtape(etape);
    }
}

// =========================================================================
// Compatibilité ascendante (appels depuis parcours-apprentissage.js)
// =========================================================================

function demarrerGuidageConfiguration() {
    // L'ancien wizard 5 étapes est remplacé par le tour 6 étapes.
    demarrerTourGuide();
}

function arreterGuidage() {
    quitterTourGuide();
}

function etapeSuivante() {
    avancerEtape();
}

// =========================================================================
// Initialisation
// =========================================================================

var _initialise = false;

function initialiserGuidage() {
    if (_initialise) return;
    _initialise = true;

    // Écoute des changements de section pour déclencher les étapes en contexte
    window.addEventListener('sectionAffichee', function(e) {
        var id = e && e.detail && e.detail.idSousSection;
        // Léger délai pour laisser le rendu finir (cohérent avec etats-vides.js)
        setTimeout(function() { verifierDeclenchementAuto(id); }, 300);
    });

    // Si un tour était en cours (ex : l'utilisateur recharge la page), rien
    // à faire d'automatique ici — l'étape courante se réaffichera à la
    // prochaine entrée dans sa section.
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserGuidage);
} else {
    initialiserGuidage();
}

// =========================================================================
// Exports
// =========================================================================

window.demarrerTourGuide = demarrerTourGuide;
window.relancerTourGuide = relancerTourGuide;
window.quitterTourGuide = quitterTourGuide;
window.terminerTour = terminerTour;

// Compat ancien API
window.demarrerGuidageConfiguration = demarrerGuidageConfiguration;
window.arreterGuidage = arreterGuidage;
window.etapeSuivante = etapeSuivante;
window.initialiserGuidage = initialiserGuidage;

// Pour tests console
window.tourGuide = {
    ETAPES_TOUR: ETAPES_TOUR,
    afficherPanneauEtape: afficherPanneauEtape,
    etapeCourante: etapeCourante
};

})();
