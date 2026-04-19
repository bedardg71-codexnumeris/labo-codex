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

function lireCle(nomCle, parDefaut) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return parDefaut;
    try {
        return db.getSync(window.cle(nomCle), parDefaut);
    } catch (e) {
        return parDefaut;
    }
}

function nbElementsObj(nomCle) {
    var obj = lireCle(nomCle, {});
    return obj && typeof obj === 'object' ? Object.keys(obj).length : 0;
}

// =========================================================================
// Configuration des transitions (3 entrées, ordre = parcours utilisateur)
// =========================================================================
var TRANSITIONS = [
    {
        id: 'numerisation-croisement',
        dejaVuePref: 'transition_num_crois_vue',
        condition: function() {
            var gc = lireCle('groupeCoursActif', null);
            return !!gc;
        },
        message: 'Ton espace de travail est pr\u00eat\u00a0: trimestre, cours, groupe, horaire et pratique sont configur\u00e9s. Tu peux maintenant saisir les pr\u00e9sences et \u00e9valuer les productions de tes \u00e9tudiant\u00b7es.'
    },
    {
        id: 'croisement-observation',
        dejaVuePref: 'transition_crois_obs_vue',
        condition: function() {
            return nbElementsObj('evaluationsSauvegardees') > 0;
        },
        message: 'Tes premi\u00e8res \u00e9valuations sont enregistr\u00e9es. Le tableau de bord commence \u00e0 se remplir. Les indices A-C-P et les premiers patterns d\u2019apprentissage apparaissent. Tu peux maintenant observer la progression de ton groupe.'
    },
    {
        id: 'observation-competence',
        dejaVuePref: 'transition_obs_comp_vue',
        condition: function() {
            // Proxy : suffisamment de données pour que le tableau de bord détecte des signaux.
            // Seuil prudent : au moins 5 évaluations enregistrées.
            return nbElementsObj('evaluationsSauvegardees') >= 5;
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
    p.textContent = transition.message;
    contenu.appendChild(p);

    var btn = document.createElement('button');
    btn.className = 'transition-bandeau-fermer';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Fermer le message');
    btn.textContent = '\u2715';
    btn.addEventListener('click', function() {
        marquerCommeVue(transition.dejaVuePref);
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
        if (estDejaVue(t.dejaVuePref)) continue;
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
