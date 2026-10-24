/**
 * etats-vides.js
 * Bannières contextuelles affichées en haut d'une sous-section quand celle-ci
 * est visiblement vierge. Les textes guident vers l'action suivante.
 *
 * Source : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 *
 * ---
 *
 * Stratégie de détection — 100 % DOM, zéro dépendance au stockage :
 *
 * 1) Si le module a déjà rendu son propre placeholder d'état vide
 *    (`.rangee-selection-vide`, `.placeholder-vide`, `.empty-state`), on s'efface
 *    pour ne pas doublonner. Le module est la source de vérité.
 *
 * 2) Sinon, on cherche des motifs de contenu universels dans le conteneur
 *    de la sous-section (items, cartes, rangées, nœuds mindmap). Si aucun
 *    ne matche, on considère la section vraiment vierge et on affiche la
 *    bannière.
 *
 * Cette approche évite les faux positifs dus à la diversité des
 *  conventions de stockage (clés globales / trimestre-préfixées / par-grille)
 *  et reflète ce que l'utilisateur voit réellement.
 *
 * Architecture :
 * - Écoute `sectionAffichee` émis par navigation.js
 * - Injection au sommet du conteneur #idSousSection, 300 ms après l'événement
 * - Nettoyage automatique à chaque nouvel événement
 * - Auto-masquée en mode démo (sections peuplées)
 */

(function() {
'use strict';

function estDonneesDemoActives() {
    return typeof estEnModeDemo === 'function' && estEnModeDemo();
}

// =========================================================================
// Détection universelle "cette section est-elle vraiment vide ?"
// =========================================================================

// Motifs DOM qui attestent la présence de contenu utile dans un conteneur.
// Large éventail pour couvrir la diversité des modules sans hard-coder.
var MOTIFS_CONTENU = [
    // Cartes génériques (mais pas les bandeaux info ou notre propre bannière)
    '.carte:not(.etat-vide-banniere):not(.carte-info-toggle):not(.carte-info-note):not(.carte-info-conseil)',
    // #1147 : la sélection d'une bibliothèque de la Conception, en menu (elle était en cartes `-item`)
    '.rangee-selection-menu',
    // Items nommés par suffixe
    '[class*="-item"]',
    '[class*="-card"]',
    '[class*="-row"]',
    '[class*="-noeud"]',
    '[class*="-node"]',
    // Nœuds de la carte mentale (classes utilisées par planification-carte.js)
    '.planif-noeud-entete',
    '.planif-noeud-titre',
    // Rangées de tableau
    'table tbody tr',
    // Lignes d'étudiants, de productions, etc. (data-* conventions)
    '[data-da]',
    '[data-production-id]',
    '[data-grille-id]',
    '[data-echelle-id]',
    '[data-cartouche-id]',
    '[data-pratique-id]',
    '[data-intervention-id]',
    '[data-seance-id]',
    '[data-sequence-id]',
    '[data-lecon-id]'
];

// Motifs indiquant que le module gère déjà son propre état vide :
// on défère pour éviter de doublonner le message.
var MOTIFS_PLACEHOLDER = [
    '.rangee-selection-vide',   // #1147 : la phrase de la sélection vide (était `.sidebar-vide`)
    '.placeholder-vide',
    '.empty-state',
    '.liste-vide'
];

function paraitVide(container) {
    if (!container) return false;

    // Le module affiche déjà un placeholder d'état vide → on s'efface
    for (var i = 0; i < MOTIFS_PLACEHOLDER.length; i++) {
        if (container.querySelector(MOTIFS_PLACEHOLDER[i])) return false;
    }

    // Si un motif de contenu matche, pas vide
    var selecteur = MOTIFS_CONTENU.join(', ');
    return container.querySelectorAll(selecteur).length === 0;
}

// =========================================================================
// Configuration des états vides
// =========================================================================

var ETATS_VIDES = {
    'calendrier-trimestre': {
        message: 'Aucun\u00b7e \u00e9tudiant\u00b7e pour le moment. Ajoute-les s\u00e9par\u00e9ment ou importe ta liste depuis un tableur ou le syst\u00e8me de gestion institutionnel. Le format attendu est affich\u00e9 dans le panneau d\u2019import.'
    },
    'conception-productions': {
        message: 'Aucune production d\u00e9finie. Une production, c\u2019est une occasion pour tes \u00e9tudiant\u00b7es de mettre en pratique ce qu\u2019ils et elles apprennent \u2014 un exercice, un travail, un examen. Commence par cr\u00e9er tes productions avec leurs pond\u00e9rations et \u00e9ch\u00e9ances.'
    },
    'conception-grille-criteres': {
        message: 'Aucune grille de crit\u00e8res. Cr\u00e9e ta premi\u00e8re grille comme tu le ferais sur papier\u00a0: nomme tes crit\u00e8res, choisis leur type (holistique, analytique ou algorithmique) et r\u00e9partis les pond\u00e9rations pour totaliser 100\u00a0%.'
    },
    'conception-echelle-performance': {
        message: 'Aucune \u00e9chelle de performance. L\u2019\u00e9chelle \u00e9tablit le niveau de performance du crit\u00e8re ou de l\u2019habilet\u00e9 \u00e9valu\u00e9e (ex.\u00a0: Incomplet, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu). Configure les seuils et les couleurs qui correspondent \u00e0 ton jugement professionnel.'
    },
    'conception-retroactions': {
        message: 'Aucune cartouche de r\u00e9troaction. Les cartouches sont des gabarits de commentaires g\u00e9n\u00e9raux que tu pr\u00e9pares une fois\u00a0: un commentaire par combinaison crit\u00e8re\u00a0\u00d7\u00a0niveau. Lors de l\u2019\u00e9valuation, l\u2019application assemble automatiquement une r\u00e9troaction personnalis\u00e9e.'
    },
    'conception-pratiques-notation': {
        message: 'Aucune pratique de notation configur\u00e9e. La pratique, c\u2019est ta recette compl\u00e8te\u00a0: type de notation (SOM, STD, SPE ou DEN), \u00e9chelle, structure des \u00e9valuations et jetons. C\u2019est elle qui d\u00e9termine comment la note se construit.'
    },
    'evaluations-liste': {
        message: 'Aucune \u00e9valuation enregistr\u00e9e. Pour commencer, s\u00e9lectionne une production et un\u00b7e \u00e9tudiant\u00b7e, puis applique ta grille de crit\u00e8res. La r\u00e9troaction se construit au fur et \u00e0 mesure que tu attribues les niveaux.'
    },
    'evaluations-importer': {
        message: 'Aucun travail import\u00e9. Importe les travaux de tes \u00e9tudiant\u00b7es (PDF ou images) pour les annoter et les \u00e9valuer directement dans l\u2019application. Les images sont optimis\u00e9es automatiquement (contraste, luminosit\u00e9, etc.), mais tu peux aussi faire des ajustements manuels.'
    },
    'suivi-saisie': {
        message: 'Aucune pr\u00e9sence saisie. Les s\u00e9ances sont g\u00e9n\u00e9r\u00e9es automatiquement \u00e0 partir de ton calendrier et de ton horaire. S\u00e9lectionne une s\u00e9ance pour saisir les pr\u00e9sences et absences.'
    },
    'suivi-groupe': {
        message: 'Le tableau de bord se remplit au fur et \u00e0 mesure que tu saisis les pr\u00e9sences et les \u00e9valuations. Les indices A-C-P, les patterns et les niveaux R\u00e0I appara\u00eetront d\u00e8s que tu auras enregistr\u00e9 quelques donn\u00e9es \u2014 c\u2019est le portrait de ton groupe qui se dessine.'
    },
    'suivi-interventions': {
        message: 'Aucune intervention planifi\u00e9e. Les interventions R\u00e0I de niveaux 2 (pr\u00e9ventif) et 3 (intensif) se cr\u00e9ent \u00e0 partir des signaux du tableau de bord. Quand un\u00b7e \u00e9tudiant\u00b7e ou un sous-groupe montre des difficult\u00e9s \u00e9mergentes ou persistantes, c\u2019est le moment d\u2019intervenir.'
    },
    'conception-carte': {
        message: 'Ta carte mentale est vide. Commence par glisser un n\u0153ud depuis la palette. La comp\u00e9tence du devis minist\u00e9riel ou du plan-cadre de ton cours est un bon point de d\u00e9part. Relie ensuite tes connaissances requises, tes activit\u00e9s d\u2019apprentissage et tes \u00e9valuations pour rendre visible l\u2019alignement p\u00e9dagogique.'
    }

    // Note : `suivi-profil` est exclu. Son module affiche son propre
    // «Sélectionne un·e étudiant·e» qui couvre le cas. Ajouter une bannière
    // ici créerait une redondance systématique (plutôt qu'un vrai état vide).
};

// =========================================================================
// Rendu
// =========================================================================

var CLASSE_BANNIERE = 'etat-vide-banniere';

function supprimerBannieresActives() {
    var anciennes = document.querySelectorAll('.' + CLASSE_BANNIERE);
    for (var i = 0; i < anciennes.length; i++) {
        anciennes[i].parentNode && anciennes[i].parentNode.removeChild(anciennes[i]);
    }
}

function creerBanniere(message) {
    var div = document.createElement('div');
    div.className = CLASSE_BANNIERE;
    div.setAttribute('role', 'status');
    var p = document.createElement('p');
    p.textContent = message;
    div.appendChild(p);
    return div;
}

function afficherPourSousSection(idSousSection) {
    supprimerBannieresActives();

    if (estDonneesDemoActives()) return;

    var config = ETATS_VIDES[idSousSection];
    if (!config) return;

    var conteneur = document.getElementById(idSousSection);
    if (!conteneur) return;

    if (!paraitVide(conteneur)) return;

    var banniere = creerBanniere(config.message);
    if (conteneur.firstChild) {
        conteneur.insertBefore(banniere, conteneur.firstChild);
    } else {
        conteneur.appendChild(banniere);
    }
}

// =========================================================================
// Initialisation
// =========================================================================

var _initialise = false;

function initialiserEtatsVides() {
    if (_initialise) return;
    _initialise = true;

    window.addEventListener('sectionAffichee', function(e) {
        var id = e && e.detail && e.detail.idSousSection;
        if (!id) return;
        // Délai pour laisser les modules finir leur rendu (mindmap inclus)
        setTimeout(function() { afficherPourSousSection(id); }, 350);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserEtatsVides);
} else {
    initialiserEtatsVides();
}

window.etatsVides = {
    afficherPourSousSection: afficherPourSousSection,
    supprimerBannieresActives: supprimerBannieresActives,
    paraitVide: paraitVide,
    ETATS_VIDES: ETATS_VIDES
};

})();
