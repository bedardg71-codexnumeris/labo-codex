/**
 * transitions.js
 * Notifications temporaires affichées quand l'utilisateur franchit un jalon
 * du parcours : Numérisation → Croisement → Observation → Compétence.
 *
 * Source : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 *
 * Architecture :
 * - 3 transitions avec condition() + message + clé de mémorisation
 * - Déclenchement : écoute l'événement `sectionAffichee` + re-évaluation
 * - Mémorisation : préférences globales (non préfixées par trimestre)
 * - Affichage : bandeau fixe en bas de l'écran, fermeture explicite
 */

(function() {
'use strict';

// Clé préfixée par trimestre (ex : h2026_evaluationsSauvegardees)
function lireCleTrim(nomCle, parDefaut) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return parDefaut;
    try {
        return db.getSync(window.cle(nomCle), parDefaut);
    } catch (e) {
        return parDefaut;
    }
}

// Clé globale (ex : groupeCoursActif)
function lireCleGlobale(nomCle, parDefaut) {
    if (typeof db === 'undefined') return parDefaut;
    try {
        return db.getSync(nomCle, parDefaut);
    } catch (e) {
        return parDefaut;
    }
}

function nbTrim(nomCle) {
    var arr = lireCleTrim(nomCle, []);
    return Array.isArray(arr) ? arr.length : 0;
}

// =========================================================================
// Configuration des transitions (3 entrées, ordre = parcours utilisateur)
// =========================================================================
var TRANSITIONS = [
    {
        id: 'numerisation-croisement',
        dejaVuePref: 'transition_num_crois_vue',
        condition: function() {
            // groupeCoursActif est une clé GLOBALE (stocke l'ID du GC actif)
            return !!lireCleGlobale('groupeCoursActif', null);
        },
        message: 'Ton espace de travail est pr\u00eat\u00a0: trimestre, cours, groupe, horaire et pratique sont configur\u00e9s. Tu peux maintenant saisir les pr\u00e9sences et \u00e9valuer les productions de tes \u00e9tudiant\u00b7es.',
        messageDemo: 'Cet espace de travail est une d\u00e9mo. Tu peux explorer les pr\u00e9sences et \u00e9valuations avec des donn\u00e9es fictives. Pour construire ton vrai espace, quitte la d\u00e9mo et configure tes propres trimestre, cours, groupe, horaire et pratique.'
    },
    {
        id: 'croisement-observation',
        dejaVuePref: 'transition_crois_obs_vue',
        condition: function() {
            return nbTrim('evaluationsSauvegardees') > 0;
        },
        message: 'Tes premi\u00e8res \u00e9valuations sont enregistr\u00e9es. Le tableau de bord commence \u00e0 se remplir. Les indices A-C-P et les premiers patterns d\u2019apprentissage apparaissent. Tu peux maintenant observer la progression de ton groupe.'
    },
    {
        id: 'observation-competence',
        dejaVuePref: 'transition_obs_comp_vue',
        condition: function() {
            // Proxy : suffisamment de données pour détecter des signaux RàI.
            return nbTrim('evaluationsSauvegardees') >= 5;
        },
        message: 'Le tableau de bord montre des signaux qui m\u00e9ritent attention. Tu peux maintenant planifier des interventions pr\u00e9ventives pour les \u00e9tudiant\u00b7es qui en ont besoin, et approfondir l\u2019alignement p\u00e9dagogique de ton cours.'
    }
];

// =========================================================================
// Préférences (non préfixées par trimestre — jalons du parcours global)
// =========================================================================

function marquerCommeVue(pref) {
    if (typeof definirPreference === 'function') {
        definirPreference(pref, true);
    }
}

function estDejaVue(pref) {
    if (typeof obtenirPreference !== 'function') return false;
    return obtenirPreference(pref) === true;
}

// Option B : tracker séparément « vu en mode démo » vs « vu en mode normal ».
// Le bandeau démo et le bandeau normal ont des messages distincts et doivent
// pouvoir se ré-afficher indépendamment (ex. l'utilisateur voit le message
// démo, sort de la démo, configure son vrai GC → le vrai bandeau s'affiche).
function estEnModeDemoLocal() {
    return typeof estEnModeDemo === 'function' && estEnModeDemo();
}

function prefPourMode(transition) {
    return estEnModeDemoLocal()
        ? transition.dejaVuePref + '_demo'
        : transition.dejaVuePref;
}

function messagePourMode(transition) {
    return (estEnModeDemoLocal() && transition.messageDemo)
        ? transition.messageDemo
        : transition.message;
}

// =========================================================================
// Affichage
// =========================================================================

var ID_BANDEAU = 'transition-bandeau';

function fermerBandeau() {
    var el = document.getElementById(ID_BANDEAU);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function afficherBandeau(transition) {
    fermerBandeau(); // remplacer tout bandeau existant

    var div = document.createElement('div');
    div.id = ID_BANDEAU;
    div.className = 'transition-bandeau';
    div.setAttribute('role', 'status');

    var contenu = document.createElement('div');
    contenu.className = 'transition-bandeau-contenu';

    var p = document.createElement('p');
    p.textContent = messagePourMode(transition);
    contenu.appendChild(p);

    var btn = document.createElement('button');
    btn.className = 'transition-bandeau-fermer';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Fermer le message');
    btn.textContent = '\u2715';
    btn.addEventListener('click', function() {
        marquerCommeVue(prefPourMode(transition));
        fermerBandeau();
    });
    contenu.appendChild(btn);

    div.appendChild(contenu);
    document.body.appendChild(div);

    // Animation d'entrée
    requestAnimationFrame(function() {
        div.classList.add('visible');
    });
}

// =========================================================================
// Évaluation
// =========================================================================

function evaluerTransitions() {
    // Ne pas afficher si un bandeau est déjà visible
    if (document.getElementById(ID_BANDEAU)) return;

    // Parcourir dans l'ordre : afficher la première non vue + déclenchée
    for (var i = 0; i < TRANSITIONS.length; i++) {
        var t = TRANSITIONS[i];
        if (estDejaVue(prefPourMode(t))) continue;
        try {
            if (t.condition()) {
                afficherBandeau(t);
                return;
            }
        } catch (e) { /* ignore */ }
    }
}

// =========================================================================
// Initialisation
// =========================================================================

var _initialise = false;

function initialiserTransitions() {
    if (_initialise) return;
    _initialise = true;

    window.addEventListener('sectionAffichee', function() {
        // Léger délai pour laisser les écritures se propager
        setTimeout(evaluerTransitions, 500);
    });

    // Évaluation initiale après chargement complet
    setTimeout(evaluerTransitions, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserTransitions);
} else {
    initialiserTransitions();
}

window.transitions = {
    evaluerTransitions: evaluerTransitions,
    fermerBandeau: fermerBandeau,
    TRANSITIONS: TRANSITIONS
};

})();
