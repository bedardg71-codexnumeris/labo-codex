/* ===============================
   MODULE: BILAN RÉFLEXIF
   Questionnaire de fin de trimestre, import CSV, rapport d'analyse

   Sous-modules extraits (PLAN-MOYEN-TERME §4.1) :
   - `bilan-reflexif-core.js` : styles, genId, afficherToast, libelleTypeQuestion
     (à charger AVANT ce fichier)

   Le résidu ci-dessous contient encore les sections 1 (état), 2 (init/nav),
   3-7 (éditeur, parcours, réflexion, import CSV, rapport). Les extractions
   suivantes les déplaceront vers leurs sous-modules dédiés.
   =============================== */

(function() {
'use strict';

// Alias des utilitaires extraits vers bilan-reflexif-core.js. Les call-sites
// internes restent inchangés (toujours `genId()`, etc.). Accès via `BilanReflexifCore`
// bare : en prod, `window.BilanReflexifCore` est créé par core.js (chargé avant)
// et accessible par nom global ; en sandbox de tests, l'identifiant est injecté
// via les paramètres de la Function wrappant le script.
var injecterStyles = BilanReflexifCore.injecterStyles;
var genId = BilanReflexifCore.genId;
var afficherToast = BilanReflexifCore.afficherToast;
var libelleTypeQuestion = BilanReflexifCore.libelleTypeQuestion;
var etat = BilanReflexifCore.etat;
var CLE_QUESTIONNAIRE = BilanReflexifCore.CLE_QUESTIONNAIRE;
var CLE_RESULTATS = BilanReflexifCore.CLE_RESULTATS;
var CLE_PARCOURS = BilanReflexifCore.CLE_PARCOURS;
var CLE_REFLEXION = BilanReflexifCore.CLE_REFLEXION;
var sauvegarderQuestionnaire = BilanReflexifCore.sauvegarderQuestionnaire;
var sauvegarderParcours = BilanReflexifCore.sauvegarderParcours;
var sauvegarderReflexion = BilanReflexifCore.sauvegarderReflexion;
var trouverBloc = BilanReflexifCore.trouverBloc;
var trouverQuestion = BilanReflexifCore.trouverQuestion;
var trouverQuestionPerso = BilanReflexifCore.trouverQuestionPerso;
var rendreAideHTML = BilanReflexifCore.rendreAideHTML;
var toggleAide = BilanReflexifCore.toggleAide;
var tronquer = BilanReflexifCore.tronquer;

/* ===============================
   SECTION 1 : INITIALISATION ET NAVIGATION
   =============================== */

var dejaInitialise = false;

function initialiserBilanReflexif() {
    injecterStyles();

    // Charger le questionnaire existant ou créer le démo
    var qSauve = db.getSync(CLE_QUESTIONNAIRE(), null);
    if (qSauve) {
        etat.questionnaire = qSauve;
    } else {
        etat.questionnaire = BILAN_REFLEXIF_DATA.creerQuestionnaireDemoComplet();
        sauvegarderQuestionnaire();
    }

    // Charger le parcours existant ou créer un vide
    var pSauve = db.getSync(CLE_PARCOURS(), null);
    if (pSauve) {
        etat.parcours = pSauve;
        // Migration : ajouter questionsParActivite si absent (parcours créés avant la refonte)
        if (!etat.parcours.questionsParActivite) {
            etat.parcours.questionsParActivite = JSON.parse(JSON.stringify(BILAN_REFLEXIF_DATA.QUESTIONS_PAR_ACTIVITE_DEFAUT));
            sauvegarderParcours();
        }
    } else {
        etat.parcours = BILAN_REFLEXIF_DATA.creerParcoursVide();
        sauvegarderParcours();
    }

    // Charger l'auto-réflexion existante ou en créer une
    var rSauve = db.getSync(CLE_REFLEXION(), null);
    if (rSauve) {
        etat.reflexion = rSauve;
    } else {
        etat.reflexion = BILAN_REFLEXIF_DATA.creerAutoReflexionVide(etat.questionnaire, etat.parcours);
        sauvegarderReflexion();
    }

    // Charger les résultats existants
    etat.resultats = db.getSync(CLE_RESULTATS(), null);

    if (!dejaInitialise) {
        dejaInitialise = true;
    }

    // Rendre la vue
    rendreInterface();
    afficherVue(etat.vue);
}

function rendreInterface() {
    var conteneur = document.getElementById('bilan-conteneur-principal');
    if (!conteneur) return;

    var hasResultats = !!etat.resultats;

    conteneur.innerHTML = [
        '<div class="bilan-nav">',
            '<button class="bilan-nav-btn actif" data-action="BilanReflexif.afficherVue" data-param="editeur">Questionnaire</button>',
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="parcours">Parcours</button>',
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="reflexion">Auto-r\u00e9flexion</button>',
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="import">Importer les r\u00e9sultats</button>',
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="rapport"' + (hasResultats ? '' : ' disabled') + '>Rapport d\u2019analyse</button>',
        '</div>',
        '<div id="bilan-vue-editeur" class="bilan-vue"></div>',
        '<div id="bilan-vue-parcours" class="bilan-vue"></div>',
        '<div id="bilan-vue-reflexion" class="bilan-vue"></div>',
        '<div id="bilan-vue-import" class="bilan-vue"></div>',
        '<div id="bilan-vue-rapport" class="bilan-vue"></div>',
        '<div id="bilan-toast" class="bilan-toast"></div>'
    ].join('');
}

function afficherVue(nomVue) {
    etat.vue = nomVue;

    // Mettre à jour les boutons nav
    var conteneur = document.getElementById('bilan-conteneur-principal');
    if (!conteneur) return;

    var boutons = conteneur.querySelectorAll('.bilan-nav-btn');
    for (var i = 0; i < boutons.length; i++) {
        var btn = boutons[i];
        var param = btn.getAttribute('data-param');
        btn.classList.toggle('actif', param === nomVue);
    }

    // Mettre à jour le bouton rapport (activer si résultats)
    var btnRapport = conteneur.querySelector('[data-param="rapport"]');
    if (btnRapport) {
        btnRapport.disabled = !etat.resultats;
    }

    // Afficher la bonne vue
    var vues = conteneur.querySelectorAll('.bilan-vue');
    for (var j = 0; j < vues.length; j++) {
        vues[j].classList.remove('visible');
    }
    var vueActive = document.getElementById('bilan-vue-' + nomVue);
    if (vueActive) {
        vueActive.classList.add('visible');
    }

    // Rendre le contenu de la vue
    if (nomVue === 'editeur') BilanReflexifEditeur.rendreEditeur();
    else if (nomVue === 'parcours') BilanReflexifParcours.rendreParcours();
    else if (nomVue === 'reflexion') BilanReflexifReflexion.rendreReflexion();
    else if (nomVue === 'import') BilanReflexifCSV.rendreImport();
    else if (nomVue === 'rapport' && etat.resultats) BilanReflexifRapport.rendreRapport();
}



/* ===============================
   SECTION 8 : HOOKS NAVIGATION ET API PUBLIQUE
   =============================== */

// Auto-enregistrement dans la config (résilience si config.js est en cache)
if (window.configurationsOnglets && window.configurationsOnglets['labo']) {
    var _labo = window.configurationsOnglets['labo'];
    var _hasBilan = false;
    for (var _b = 0; _b < _labo.length; _b++) {
        if (_labo[_b].id === 'bilan') { _hasBilan = true; break; }
    }
    if (!_hasBilan) {
        _labo.push({ id: 'bilan', label: 'Bilan r\u00e9flexif' });
    }
}

// Hook sur afficherSousSection pour initialiser quand on navigue vers bilan
var _originalAfficherSousSection = window.afficherSousSection;
if (typeof _originalAfficherSousSection === 'function') {
    window.afficherSousSection = function(idSousSection) {
        var resultat = _originalAfficherSousSection.apply(this, arguments);
        if (idSousSection === 'labo-bilan') {
            try { initialiserBilanReflexif(); } catch (e) { console.error('[BilanReflexif] Erreur init:', e); }
        }
        return resultat;
    };
}

// Hook sur afficherSection pour nettoyer les graphiques quand on quitte
var _originalAfficherSection = window.afficherSection;
if (typeof _originalAfficherSection === 'function') {
    window.afficherSection = function(nomSection) {
        if (nomSection !== 'labo') {
            try { BilanReflexifRapport.detruireGraphiques(); } catch (e) { console.error('[BilanReflexif] Erreur detruireGraphiques:', e); }
        }
        return _originalAfficherSection.apply(this, arguments);
    };
}

// API publique
window.BilanReflexif = {
    afficherVue: afficherVue,
    rendreInterface: rendreInterface,
    // Éditeur Likert — déplacé vers BilanReflexifEditeur (PLAN §4.1.d), forwarders
    modifierTitre: BilanReflexifEditeur.modifierTitre,
    modifierPreambule: BilanReflexifEditeur.modifierPreambule,
    modifierDescriptionBloc: BilanReflexifEditeur.modifierDescriptionBloc,
    toggleBloc: BilanReflexifEditeur.toggleBloc,
    toggleOuverture: BilanReflexifEditeur.toggleOuverture,
    editerQuestion: BilanReflexifEditeur.editerQuestion,
    confirmerEdition: BilanReflexifEditeur.confirmerEdition,
    annulerEdition: BilanReflexifEditeur.annulerEdition,
    validerEditionKeyup: BilanReflexifEditeur.validerEditionKeyup,
    supprimerQuestion: BilanReflexifEditeur.supprimerQuestion,
    deplacerQuestion: BilanReflexifEditeur.deplacerQuestion,
    ajouterQuestionBloc: BilanReflexifEditeur.ajouterQuestionBloc,
    ajouterPerso: BilanReflexifEditeur.ajouterPerso,
    // Édition des nouveaux types de questions (Phase B) — éditeur
    ajouterOption: BilanReflexifEditeur.ajouterOption,
    supprimerOption: BilanReflexifEditeur.supprimerOption,
    deplacerOption: BilanReflexifEditeur.deplacerOption,
    modifierOption: BilanReflexifEditeur.modifierOption,
    toggleAutreChamp: BilanReflexifEditeur.toggleAutreChamp,
    modifierLimite: BilanReflexifEditeur.modifierLimite,
    ajouterEnonce: BilanReflexifEditeur.ajouterEnonce,
    supprimerEnonce: BilanReflexifEditeur.supprimerEnonce,
    deplacerEnonce: BilanReflexifEditeur.deplacerEnonce,
    modifierEnonce: BilanReflexifEditeur.modifierEnonce,
    toggleNA: BilanReflexifEditeur.toggleNA,
    modifierConsigneConditionnelle: BilanReflexifEditeur.modifierConsigneConditionnelle,
    reinitialiserDemo: BilanReflexifEditeur.reinitialiserDemo,
    // Export/Import texte — déplacé vers BilanReflexifTexte (PLAN §4.1.f), forwarders
    exporterTexte: BilanReflexifTexte.exporterTexte,
    ouvrirModaleImport: BilanReflexifTexte.ouvrirModaleImport,
    fermerModaleImport: BilanReflexifTexte.fermerModaleImport,
    appliquerImport: BilanReflexifTexte.appliquerImport,
    telechargerModele: BilanReflexifTexte.telechargerModele,
    copierPromptIA: BilanReflexifTexte.copierPromptIA,
    // Éditeur Parcours — déplacé vers BilanReflexifParcours (PLAN §4.1.e), forwarders
    ajouterActivite: BilanReflexifParcours.ajouterActivite,
    modifierActivite: BilanReflexifParcours.modifierActivite,
    confirmerModifActivite: BilanReflexifParcours.confirmerModifActivite,
    annulerModifActivite: BilanReflexifParcours.annulerModifActivite,
    supprimerActivite: BilanReflexifParcours.supprimerActivite,
    deplacerActivite: BilanReflexifParcours.deplacerActivite,
    importerProductions: BilanReflexifParcours.importerProductions,
    ajouterEmotion: BilanReflexifParcours.ajouterEmotion,
    supprimerEmotion: BilanReflexifParcours.supprimerEmotion,
    toggleTransversale: BilanReflexifParcours.toggleTransversale,
    exporterTexteParcours: BilanReflexifParcours.exporterTexteParcours,
    // Questions par activité — éditeur Parcours
    toggleQuestionParActivite: BilanReflexifParcours.toggleQuestionParActivite,
    editerQuestionQPA: BilanReflexifParcours.editerQuestionQPA,
    confirmerEditionQPA: BilanReflexifParcours.confirmerEditionQPA,
    ajouterQuestionParActivite: BilanReflexifParcours.ajouterQuestionParActivite,
    supprimerQuestionParActivite: BilanReflexifParcours.supprimerQuestionParActivite,
    // Auto-réflexion — déplacé vers BilanReflexifReflexion (PLAN §4.1.e), forwarders
    changerEtatReflexion: BilanReflexifReflexion.changerEtatReflexion,
    toggleBlocReflexion: BilanReflexifReflexion.toggleBlocReflexion,
    toggleQuestionReflexion: BilanReflexifReflexion.toggleQuestionReflexion,
    repondreReflexionLikert: BilanReflexifReflexion.repondreReflexionLikert,
    repondreReflexionOuiNon: BilanReflexifReflexion.repondreReflexionOuiNon,
    ajouterQuestionReflexion: BilanReflexifReflexion.ajouterQuestionReflexion,
    supprimerQuestionReflexion: BilanReflexifReflexion.supprimerQuestionReflexion,
    sauvegarderReflexionExplicite: BilanReflexifReflexion.sauvegarderReflexionExplicite,
    // Aide — déplacé vers BilanReflexifCore (§4.1.f), forwarder
    toggleAide: BilanReflexifCore.toggleAide,
    // Import CSV — déplacé vers BilanReflexifCSV (§4.1.f), forwarders
    declencherImport: BilanReflexifCSV.declencherImport,
    chargerResultatsDemo: BilanReflexifCSV.chargerResultatsDemo,
    modifierMapping: BilanReflexifCSV.modifierMapping,
    confirmerImport: BilanReflexifCSV.confirmerImport,
    annulerImport: BilanReflexifCSV.annulerImport,
    // Rapport — déplacé vers BilanReflexifRapport (§4.1.g), forwarders
    exporterPDF: BilanReflexifRapport.exporterPDF,
    supprimerResultats: BilanReflexifRapport.supprimerResultats
};

window.initialiserBilanReflexif = initialiserBilanReflexif;

// Exposition pour les tests de régression du refactoring 2026-mai
// (cf. audit/PLAN-MOYEN-TERME.md §4.1, MODULES-MAP §2.5). Ces fonctions sont
// pures et n'ont pas vocation à faire partie de l'API publique. Le hatch sera
// retiré au fur et à mesure des 7 extractions : chaque sous-module exposera
// naturellement ses propres pures via son IIFE, et les tests pointeront alors
// vers ces nouveaux exports.
window.__bilanReflexifInternals = {
    // Texte — extrait vers BilanReflexifTexte (§4.1.f), forwarders
    parserQuestionnaireTexte: BilanReflexifTexte.parserQuestionnaireTexte,
    formaterQuestionnaireEnTexte: BilanReflexifTexte.formaterQuestionnaireEnTexte,
    genererModeleTexte: BilanReflexifTexte.genererModeleTexte,
    // CSV — extrait vers BilanReflexifCSV (§4.1.f), forwarders
    parserCSV: BilanReflexifCSV.parserCSV,
    detecterSeparateur: BilanReflexifCSV.detecterSeparateur,
    normaliserTexte: BilanReflexifCSV.normaliserTexte,
    similitudeTexte: BilanReflexifCSV.similitudeTexte,
    convertirLikert: BilanReflexifCSV.convertirLikert,
    obtenirCiblesMapping: BilanReflexifCSV.obtenirCiblesMapping,
    mapperColonnes: BilanReflexifCSV.mapperColonnes,
    _agregerQuestion: BilanReflexifCSV._agregerQuestion,
    _estNA: BilanReflexifCSV._estNA,
    _splitMultiChoix: BilanReflexifCSV._splitMultiChoix,
    _trouverOptionParTexte: BilanReflexifCSV._trouverOptionParTexte,
    estColonneIgnoree: BilanReflexifCSV.estColonneIgnoree
};

})();
