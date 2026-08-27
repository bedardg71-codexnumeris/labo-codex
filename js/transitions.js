/**
 * transitions.js
 * Notifications temporaires affichées quand l'utilisateur franchit un jalon
 * du parcours : Numérisation → Croisement → Observation → Compétence.
 *
 * Source : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 *
 * Architecture :
 * - Des entrées avec condition() + message + clé de mémorisation + sections cibles
 * - Deux familles cohabitent : les JALONS du parcours (conditionnés par les
 *   données de l'utilisateur) et les AVIS datés (conditionnés par une date,
 *   variante visuelle « avis », placés en tête pour passer devant les jalons)
 * - Déclenchement : écoute l'événement `sectionAffichee` + re-évaluation
 * - Ciblage : chaque bandeau ne s'affiche que dans sa/ses section(s) pertinente(s)
 *   (champ `sections`) — sinon il déborde hors contexte (ex. sur l'accueil)
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
        // ------------------------------------------------------------------
        // AVIS DATÉ — #508 · identification à l'entrée au 1er septembre 2026
        // ------------------------------------------------------------------
        // En tête du tableau : evaluerTransitions() affiche la PREMIÈRE entrée
        // éligible, donc l'avis passe devant les jalons du parcours pendant sa
        // fenêtre. Les jalons ne sont pas perdus : ils réapparaissent dès que
        // l'avis est fermé ou expiré.
        //
        // Pas de champ `sections` : l'avis doit être vu quelle que soit la
        // section ouverte. Pas de `messageDemo` non plus, et `ignorerModeDemo`
        // maintient une clé unique — l'avis porte sur l'accès au site, pas sur
        // le contenu de l'espace de travail.
        //
        // ⚠ Fenêtre courte et unilatérale. L'application est DERRIÈRE la porte
        // Cloudflare : à partir du 1er septembre, quiconque lit ce bandeau a
        // déjà franchi l'identification, et l'avertir ne sert plus à rien. La
        // condition l'éteint donc à cette date, et #508 prend le relais avec un
        // paragraphe d'accueil rédigé au présent. Ne pas prolonger la date sans
        // réécrire le message : un avis périmé apprend à ne plus lire la zone.
        id: 'avis-identification-2026-09-01',
        dejaVuePref: 'avis_identification_2026_09_vue',
        ignorerModeDemo: true,
        variante: 'avis',
        titre: '\u00c0 partir du 1\u1d49\u02b3 septembre',
        condition: function() {
            // Bascule à minuit, heure locale de l'utilisateur (mois 8 = septembre).
            return new Date() < new Date(2026, 8, 1, 0, 0, 0);
        },
        // ⚠ Le mois doit se lire comme un RENOUVELLEMENT, jamais comme une
        // échéance. « L'accès reste ouvert un mois » se lisait « au bout d'un
        // mois, je perds l'accès » (retour de Grégoire, 27 août). D'où la
        // deuxième phrase, qui n'est pas un ornement : elle porte la nuance.
        message: 'L\u2019acc\u00e8s \u00e0 Labo Codex demandera une identification\u00a0: tu entres ton courriel, tu re\u00e7ois un code, et tu n\u2019y repenses plus pendant un mois. Apr\u00e8s quoi tu r\u00e9entres ton courriel et c\u2019est reparti pour un mois\u00a0: rien ne se ferme, il n\u2019y a ni compte \u00e0 cr\u00e9er ni mot de passe \u00e0 retenir. Tes donn\u00e9es, elles, restent sur ton appareil, comme avant.'
    },
    {
        id: 'numerisation-croisement',
        dejaVuePref: 'transition_num_crois_vue',
        // Section où le bandeau a du sens (l'appel à l'action « saisir présences
        // et évaluer » relève de l'Évaluation). Vide/absent = aucune restriction.
        sections: ['evaluations'],
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
        // Parle du tableau de bord et de l'observation du groupe → Suivi.
        sections: ['suivi'],
        condition: function() {
            return nbTrim('evaluationsSauvegardees') > 0;
        },
        message: 'Tes premi\u00e8res \u00e9valuations sont enregistr\u00e9es. Le tableau de bord commence \u00e0 se remplir. Les indices A-C-P et les premiers patterns d\u2019apprentissage apparaissent. Tu peux maintenant observer la progression de ton groupe.'
    },
    {
        id: 'observation-competence',
        dejaVuePref: 'transition_obs_comp_vue',
        // Signaux du tableau de bord, interventions, alignement → Suivi (et non
        // l'accueil, où il s'affichait hors contexte).
        sections: ['suivi'],
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
    // Les avis datés gardent une clé unique : ils portent sur l'accès au site,
    // pas sur le contenu de l'espace, et n'ont donc pas à se ré-afficher quand
    // l'utilisateur entre ou sort de la démo.
    if (transition.ignorerModeDemo) return transition.dejaVuePref;
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
    if (transition.variante) {
        div.classList.add('transition-bandeau--' + transition.variante);
    }
    // Un avis daté n'est pas une félicitation de parcours : il demande une
    // annonce polie mais ferme au lecteur d'écran, d'où role="alert".
    div.setAttribute('role', transition.variante === 'avis' ? 'alert' : 'status');

    var contenu = document.createElement('div');
    contenu.className = 'transition-bandeau-contenu';

    // Colonne de texte : titre optionnel + message.
    var texte = document.createElement('div');
    texte.className = 'transition-bandeau-texte';

    if (transition.titre) {
        var h = document.createElement('p');
        h.className = 'transition-bandeau-titre';
        h.textContent = transition.titre;
        texte.appendChild(h);
    }

    var p = document.createElement('p');
    p.textContent = messagePourMode(transition);
    texte.appendChild(p);
    contenu.appendChild(texte);

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

// Section principale courante (variable globale de config.js/navigation.js).
// typeof reste sûr en mode strict même si le script n'est pas encore chargé.
function sectionPrincipaleCourante() {
    return (typeof sectionActive !== 'undefined') ? sectionActive : null;
}

// Le bandeau ne s'affiche que dans sa/ses section(s) pertinente(s). Sans champ
// `sections`, aucune restriction (rétro-compatible).
function cibleSectionCourante(transition) {
    if (!transition.sections || !transition.sections.length) return true;
    return transition.sections.indexOf(sectionPrincipaleCourante()) !== -1;
}

function evaluerTransitions() {
    // Ne pas afficher si un bandeau est déjà visible
    if (document.getElementById(ID_BANDEAU)) return;

    // Parcourir dans l'ordre : afficher la première non vue + déclenchée + dans
    // sa section pertinente (évite les messages hors contexte, ex. sur l'accueil).
    for (var i = 0; i < TRANSITIONS.length; i++) {
        var t = TRANSITIONS[i];
        if (estDejaVue(prefPourMode(t))) continue;
        if (!cibleSectionCourante(t)) continue;
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
