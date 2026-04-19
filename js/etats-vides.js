/**
 * etats-vides.js
 * Bannières contextuelles affichées en haut d'une sous-section quand
 * la donnée sous-jacente est vide. Les textes guident vers l'action suivante.
 *
 * Source : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 *
 * Architecture :
 * - Données statiques : { clé = idSousSection : { condition, message, action? } }
 * - Déclenchement : écoute l'événement `sectionAffichee` émis par navigation.js
 * - Injection : <div class="etat-vide-banniere"> au sommet du conteneur #idSousSection
 * - Suppression : nettoyée à chaque nouvel événement `sectionAffichee`
 *
 * Une bannière est supprimée si :
 * - Les données démo sont actives (sections peuplées, bannière inutile)
 * - La condition() ne matche plus (ex : étudiant ajouté)
 */

(function() {
'use strict';

function estDonneesDemoActives() {
    return typeof estEnModeDemo === 'function' && estEnModeDemo();
}

// Lit une clé préfixée par trimestre (ex: h2026_productions)
function lireCleTrim(nomCle, parDefaut) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return parDefaut;
    try {
        return db.getSync(window.cle(nomCle), parDefaut);
    } catch (e) {
        return parDefaut;
    }
}

// Lit une clé globale (ex: grillesTemplates)
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

function nbGlobal(nomCle) {
    var arr = lireCleGlobale(nomCle, []);
    return Array.isArray(arr) ? arr.length : 0;
}

// Compte les cartouches : stockage par grille, clés `cartouches_${grilleId}`.
// Retourne 0 si aucune grille n'a de cartouches.
function nbCartouches() {
    var grilles = lireCleGlobale('grillesTemplates', []);
    if (!Array.isArray(grilles) || grilles.length === 0) return 0;
    var total = 0;
    for (var i = 0; i < grilles.length; i++) {
        var gid = grilles[i] && grilles[i].id;
        if (!gid) continue;
        var cs = lireCleGlobale('cartouches_' + gid, []);
        if (Array.isArray(cs)) total += cs.length;
    }
    return total;
}

// =========================================================================
// Configuration des états vides (16 entrées)
// =========================================================================
var ETATS_VIDES = {

    // --- Étape 1 : Numérisation ---
    // Rappel : grilles, échelles et pratiques sont stockées GLOBALEMENT (pas par trimestre).

    'contexte-trimestre': {
        condition: function() { return nbTrim('groupeEtudiants') === 0; },
        message: 'Aucun\u00b7e \u00e9tudiant\u00b7e pour le moment. Ajoute-les s\u00e9par\u00e9ment ou importe ta liste depuis un tableur ou le syst\u00e8me de gestion institutionnel. Le format attendu est affich\u00e9 dans le panneau d\u2019import.'
    },

    'structure-productions': {
        condition: function() { return nbTrim('productions') === 0; },
        message: 'Aucune production d\u00e9finie. Une production, c\u2019est une occasion pour tes \u00e9tudiant\u00b7es de mettre en pratique ce qu\u2019ils et elles apprennent \u2014 un exercice, un travail, un examen. Commence par cr\u00e9er tes productions avec leurs pond\u00e9rations et \u00e9ch\u00e9ances.'
    },

    'structure-grille-criteres': {
        condition: function() { return nbGlobal('grillesTemplates') === 0; },
        message: 'Aucune grille de crit\u00e8res. Cr\u00e9e ta premi\u00e8re grille comme tu le ferais sur papier\u00a0: nomme tes crit\u00e8res, choisis leur type (holistique, analytique ou algorithmique) et r\u00e9partis les pond\u00e9rations pour totaliser 100\u00a0%.'
    },

    'structure-echelle-performance': {
        condition: function() { return nbGlobal('echellesTemplates') === 0; },
        message: 'Aucune \u00e9chelle de performance. L\u2019\u00e9chelle \u00e9tablit le niveau de performance du crit\u00e8re ou de l\u2019habilet\u00e9 \u00e9valu\u00e9e (ex.\u00a0: Insuffisant, D\u00e9veloppement, Ma\u00eetrise, \u00c9tendu). Configure les seuils et les couleurs qui correspondent \u00e0 ton jugement professionnel.'
    },

    'structure-retroactions': {
        condition: function() { return nbCartouches() === 0; },
        message: 'Aucune cartouche de r\u00e9troaction. Les cartouches sont des gabarits de commentaires g\u00e9n\u00e9raux que tu pr\u00e9pares une fois\u00a0: un commentaire par combinaison crit\u00e8re\u00a0\u00d7\u00a0niveau. Lors de l\u2019\u00e9valuation, l\u2019application assemble automatiquement une r\u00e9troaction personnalis\u00e9e.'
    },

    'contexte-pratiques-notation': {
        condition: function() { return nbGlobal('pratiquesConfigurables') === 0; },
        message: 'Aucune pratique de notation configur\u00e9e. La pratique, c\u2019est ta recette compl\u00e8te\u00a0: type de notation (SOM, STD, SPE ou DEN), \u00e9chelle, structure des \u00e9valuations et jetons. C\u2019est elle qui d\u00e9termine comment la note se construit.'
    },

    // --- Étape 2 : Croisement ---

    'evaluations-liste': {
        condition: function() { return nbTrim('evaluationsSauvegardees') === 0; },
        message: 'Aucune \u00e9valuation enregistr\u00e9e. Pour commencer, s\u00e9lectionne une production et un\u00b7e \u00e9tudiant\u00b7e, puis applique ta grille de crit\u00e8res. La r\u00e9troaction se construit au fur et \u00e0 mesure que tu attribues les niveaux.'
    },

    'evaluations-importer': {
        condition: function() { return nbTrim('fichiersTravaux') === 0; },
        message: 'Aucun travail import\u00e9. Importe les travaux de tes \u00e9tudiant\u00b7es (PDF ou images) pour les annoter et les \u00e9valuer directement dans l\u2019application. Les images sont optimis\u00e9es automatiquement (contraste, luminosit\u00e9, etc.), mais tu peux aussi faire des ajustements manuels.'
    },

    'suivi-saisie': {
        condition: function() { return nbTrim('presences') === 0; },
        message: 'Aucune pr\u00e9sence saisie. Les s\u00e9ances sont g\u00e9n\u00e9r\u00e9es automatiquement \u00e0 partir de ton calendrier et de ton horaire. S\u00e9lectionne une s\u00e9ance pour saisir les pr\u00e9sences et absences.'
    },

    // --- Étape 3 : Observation ---

    'apercu': {
        condition: function() {
            return nbTrim('evaluationsSauvegardees') === 0
                && nbTrim('presences') === 0;
        },
        message: 'Le tableau de bord se remplit au fur et \u00e0 mesure que tu saisis les pr\u00e9sences et les \u00e9valuations. Les indices A-C-P, les patterns et les niveaux R\u00e0I appara\u00eetront d\u00e8s que tu auras enregistr\u00e9 quelques donn\u00e9es \u2014 c\u2019est le portrait de ton groupe qui se dessine.'
    },

    'suivi-profil': {
        condition: function() {
            // Pas de bannière si aucun étudiant : laisser le module gérer son propre placeholder.
            // Bannière utile si étudiants présents mais aucun sélectionné pour affichage.
            if (nbTrim('groupeEtudiants') === 0) return false;
            return !window.profilActuelDA;
        },
        message: 'S\u00e9lectionne un\u00b7e \u00e9tudiant\u00b7e pour afficher son profil\u00a0: productions, mobilisation, progression, habilet\u00e9s et accompagnement.'
    },

    'suivi-interventions': {
        condition: function() { return nbTrim('interventions') === 0; },
        message: 'Aucune intervention planifi\u00e9e. Les interventions R\u00e0I de niveaux 2 (pr\u00e9ventif) et 3 (intensif) se cr\u00e9ent \u00e0 partir des signaux du tableau de bord. Quand un\u00b7e \u00e9tudiant\u00b7e ou un sous-groupe montre des difficult\u00e9s \u00e9mergentes ou persistantes, c\u2019est le moment d\u2019intervenir.'
    },

    // --- Étape 4 : Compétence ---

    'structure-carte': {
        condition: function() {
            var mm = lireCleTrim('planification_mindmap', null);
            if (!mm) return true;
            var nodes = mm.nodes || mm.noeuds || [];
            return !Array.isArray(nodes) || nodes.length === 0;
        },
        message: 'Ta carte mentale est vide. Commence par glisser un n\u0153ud depuis la palette. La comp\u00e9tence du devis minist\u00e9riel ou du plan-cadre de ton cours est un bon point de d\u00e9part. Relie ensuite tes connaissances requises, tes activit\u00e9s d\u2019apprentissage et tes \u00e9valuations pour rendre visible l\u2019alignement p\u00e9dagogique.'
    },

    'structure-organisateur': {
        condition: function() {
            var seances = lireCleTrim('planification_seances', {});
            if (!seances || typeof seances !== 'object') return true;
            var seq = seances.sequences || seances;
            return Object.keys(seq).length === 0;
        },
        message: 'Aucune s\u00e9quence d\u00e9finie. Les s\u00e9quences organisent tes le\u00e7ons sur les 15 semaines du trimestre. Une s\u00e9quence peut contenir plusieurs le\u00e7ons. Cr\u00e9e ta premi\u00e8re s\u00e9quence, puis ajoute des le\u00e7ons avec l\u2019option d\u2019enseignement explicite en 5 phases.'
    }
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
    // message est une string statique issue de ETATS_VIDES (pas de donnée utilisateur)
    // → insertion textuelle sécurisée via textContent
    var p = document.createElement('p');
    p.textContent = message;
    div.appendChild(p);
    return div;
}

function afficherPourSousSection(idSousSection) {
    supprimerBannieresActives();

    // Mode démo : sections peuplées, pas d'état vide
    if (estDonneesDemoActives()) return;

    var config = ETATS_VIDES[idSousSection];
    if (!config) return;

    try {
        if (!config.condition()) return;
    } catch (e) {
        return;
    }

    var conteneur = document.getElementById(idSousSection);
    if (!conteneur) return;

    var banniere = creerBanniere(config.message);
    // Injecter en haut du conteneur, avant tout autre enfant
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
        // Laisser les modules finir leur rendu avant l'injection
        setTimeout(function() { afficherPourSousSection(id); }, 250);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserEtatsVides);
} else {
    initialiserEtatsVides();
}

// Exports utilitaires (pour tests manuels console)
window.etatsVides = {
    afficherPourSousSection: afficherPourSousSection,
    supprimerBannieresActives: supprimerBannieresActives,
    ETATS_VIDES: ETATS_VIDES
};

})();
