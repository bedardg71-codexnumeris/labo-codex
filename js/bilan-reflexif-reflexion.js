/* ===============================
   MODULE: BILAN RÉFLEXIF — AUTO-RÉFLEXION DE L'ENSEIGNANT
   Blocs A (miroir Likert), B (miroir parcours), C (synthèses) avec
   états avant/après les résultats. PLAN-MOYEN-TERME §4.1.e.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js
   Charger AVANT : bilan-reflexif.js (résidu)

   Dépendances :
   - BilanReflexifCore : etat, genId, sauvegarderReflexion
   - BILAN_REFLEXIF_DATA : ECHELLE_LIKERT4 (pour rendu Likert miroir)
   - Globaux projet : echapperHtml
   =============================== */

(function() {
'use strict';

var etat = BilanReflexifCore.etat;
var genId = BilanReflexifCore.genId;
var sauvegarderReflexion = BilanReflexifCore.sauvegarderReflexion;
var tronquer = BilanReflexifCore.tronquer;

/* ===============================
   SECTION 3c : AUTO-RÉFLEXION DE L'ENSEIGNANT
   =============================== */

function rendreReflexion() {
    var vue = document.getElementById('bilan-vue-reflexion');
    if (!vue) return;

    var r = etat.reflexion;
    var html = [];
    var modeApres = r.etat === 'apres_resultats';

    // Description d'introduction
    html.push('<div class="bilan-info">');
    html.push('Cet outil t\u2019accompagne dans une introspection sur ta propre pratique. ');
    html.push('Tu y consignes ta perception de l\u2019enseignement offert et tes observations sur chaque activit\u00e9. ');
    html.push('Apr\u00e8s avoir consult\u00e9 les r\u00e9sultats de tes \u00e9tudiant\u00b7es, tu peux revenir sur tes r\u00e9ponses et identifier les \u00e9carts entre ta perception et la leur. ');
    html.push('C\u2019est un espace personnel \u2014 rien n\u2019est partag\u00e9.');
    html.push('</div>');

    // Indicateur d'état avant/après
    html.push('<div class="bilan-actions" style="align-items:center">');
    html.push('<span style="font-size:13px;color:var(--texte-secondaire);margin-right:4px">\u00c9tat\u00a0:</span>');
    html.push('<button class="bilan-btn ' + (modeApres ? 'bilan-btn-secondaire' : 'bilan-btn-principal') + '" data-action="BilanReflexif.changerEtatReflexion" data-param="avant_resultats">Avant les r\u00e9sultats</button>');
    html.push('<button class="bilan-btn ' + (modeApres ? 'bilan-btn-principal' : 'bilan-btn-secondaire') + '" data-action="BilanReflexif.changerEtatReflexion" data-param="apres_resultats">Apr\u00e8s les r\u00e9sultats</button>');
    // Lot E3 (D0) : le bouton « Enregistrer » est parti — chaque réponse s'écrit au geste ou à la
    // sortie du champ, et le témoin commun le dit.
    html.push('</div>');

    // === BLOC A — Miroir Likert ===
    var blocA = r.blocA;
    var nbActifA = blocA.questions.filter(function(q) { return q.actif; }).length;
    html.push('<div class="bilan-bloc' + (blocA.actif ? '' : ' inactif') + ' ouvert">');
    html.push('<div class="bilan-bloc-header">');
    html.push('<div class="bilan-bloc-gauche">');
    html.push('<span class="bilan-bloc-titre">Ma perception de l\u2019enseignement</span>');
    html.push('<span class="bilan-bloc-badge">' + nbActifA + ' question' + (nbActifA > 1 ? 's' : '') + ' miroir' + (nbActifA > 1 ? 's' : '') + '</span>');
    html.push('</div>');
    html.push('<button class="bilan-toggle' + (blocA.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleBlocReflexion" data-param="blocA"></button>');
    html.push('</div>');
    html.push('<div class="bilan-bloc-body"' + (blocA.actif ? '' : ' style="display:none"') + '>');

    if (blocA.actif) {
        for (var ia = 0; ia < blocA.questions.length; ia++) {
            html.push(rendreQuestionMiroirLikertHTML(blocA.questions[ia], modeApres));
        }
        // Ajout question perso
        html.push('<div class="bilan-ajout-form">');
        html.push('<input type="text" class="bilan-ajout-input" id="bilan-reflexion-a-input" placeholder="Ajouter une question miroir\u2026">');
        html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterQuestionReflexion" data-param="blocA">Ajouter</button>');
        html.push('</div>');
    }
    html.push('</div></div>');

    // === BLOC B — Miroir Parcours ===
    var blocB = r.blocB;
    var activites = etat.parcours ? etat.parcours.activites : [];
    html.push('<div class="bilan-bloc' + (blocB.actif ? '' : ' inactif') + ' ouvert">');
    html.push('<div class="bilan-bloc-header">');
    html.push('<div class="bilan-bloc-gauche">');
    html.push('<span class="bilan-bloc-titre">Mes observations par activit\u00e9</span>');
    html.push('<span class="bilan-bloc-badge">' + activites.length + ' activit\u00e9' + (activites.length > 1 ? 's' : '') + '</span>');
    html.push('</div>');
    html.push('<button class="bilan-toggle' + (blocB.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleBlocReflexion" data-param="blocB"></button>');
    html.push('</div>');
    html.push('<div class="bilan-bloc-body"' + (blocB.actif ? '' : ' style="display:none"') + '>');

    if (blocB.actif) {
        if (activites.length === 0) {
            html.push('<div class="bilan-vide" style="padding:12px">Configure des activit\u00e9s dans l\u2019onglet Parcours pour remplir cette section.</div>');
        } else {
            for (var ib = 0; ib < activites.length; ib++) {
                html.push(rendreActiviteReflexionHTML(activites[ib], blocB, modeApres));
            }
        }
    }
    html.push('</div></div>');

    // === BLOC C — Synthèse ===
    var blocC = r.blocC;
    var nbActifC = blocC.questions.filter(function(q) { return q.actif; }).length;
    html.push('<div class="bilan-bloc' + (blocC.actif ? '' : ' inactif') + ' ouvert">');
    html.push('<div class="bilan-bloc-header">');
    html.push('<div class="bilan-bloc-gauche">');
    html.push('<span class="bilan-bloc-titre">Bilan de ma pratique</span>');
    html.push('<span class="bilan-bloc-badge">' + nbActifC + ' question' + (nbActifC > 1 ? 's' : '') + '</span>');
    html.push('</div>');
    html.push('<button class="bilan-toggle' + (blocC.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleBlocReflexion" data-param="blocC"></button>');
    html.push('</div>');
    html.push('<div class="bilan-bloc-body"' + (blocC.actif ? '' : ' style="display:none"') + '>');

    if (blocC.actif) {
        for (var ic = 0; ic < blocC.questions.length; ic++) {
            html.push(rendreQuestionSyntheseHTML(blocC.questions[ic], modeApres));
        }
        html.push('<div class="bilan-ajout-form">');
        html.push('<input type="text" class="bilan-ajout-input" id="bilan-reflexion-c-input" placeholder="Ajouter une question de synth\u00e8se\u2026">');
        html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterQuestionReflexion" data-param="blocC">Ajouter</button>');
        html.push('</div>');
    }
    html.push('</div></div>');

    vue.innerHTML = html.join('');

    // Attacher les listeners blur pour sauvegarde auto
    setTimeout(function() { attacherListenersReflexion(); }, 100);
}

// === Rendu des questions miroirs Likert (Bloc A) ===

function rendreQuestionMiroirLikertHTML(question, modeApres) {
    var html = [];
    var cle = modeApres ? 'apres' : 'avant';
    var valeur = question.reponses ? question.reponses[cle] : null;
    var valeurAutre = question.reponses ? question.reponses[modeApres ? 'avant' : 'apres'] : null;
    var echelle = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;

    html.push('<div class="bilan-question" style="flex-wrap:wrap;' + (question.actif ? '' : 'opacity:.45') + '">');
    html.push('<button class="bilan-toggle' + (question.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleQuestionReflexion" data-param="blocA" data-param2="' + question.id + '" style="align-self:flex-start;flex-shrink:0;margin-top:2px"></button>');
    html.push('<div style="flex:1;min-width:0">');
    html.push('<div class="bilan-question-texte">' + echapperHtml(question.texte) + '</div>');

    if (question.actif) {
        // Sélecteur Likert 4 niveaux
        html.push('<div class="bilan-preview-choix" style="margin-top:6px">');
        for (var i = 0; i < echelle.length; i++) {
            var sel = valeur === echelle[i].valeur;
            html.push('<button class="bilan-preview-option" style="cursor:pointer;' + (sel ? 'background:var(--bleu-clair);color:#fff;border-color:var(--bleu-clair)' : '') + '" data-action="BilanReflexif.repondreReflexionLikert" data-param="' + question.id + '" data-param2="' + echelle[i].valeur + '">' + echapperHtml(echelle[i].label) + '</button>');
        }
        html.push('</div>');

        // Valeur de l'autre état (avant/après)
        if (valeurAutre !== null && valeurAutre !== undefined) {
            var labelAutre = '';
            for (var j = 0; j < echelle.length; j++) { if (echelle[j].valeur === valeurAutre) labelAutre = echelle[j].label; }
            html.push('<div style="font-size:11px;color:var(--texte-secondaire);margin-top:4px;font-style:italic">R\u00e9ponse ' + (modeApres ? 'avant' : 'apr\u00e8s') + '\u00a0: ' + echapperHtml(labelAutre) + '</div>');
        }

        // Commentaire
        html.push('<textarea class="bilan-ajout-input" data-reflexion-field="commentaire-' + question.id + '" placeholder="Commentaire (optionnel)" style="margin-top:6px;min-height:32px;resize:vertical;font-size:12px">' + echapperHtml(question.commentaire || '') + '</textarea>');
    }

    html.push('</div>');
    if (question.personnalisee) {
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestionReflexion" data-param="blocA" data-param2="' + question.id + '" data-confirm="Supprimer ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
    }
    html.push('</div>');
    return html.join('');
}

// === Rendu des activités (Bloc B) ===

function rendreActiviteReflexionHTML(activite, blocB, modeApres) {
    var html = [];
    var cle = modeApres ? 'apres' : 'avant';
    var repAct = blocB.reponses[activite.id] || {};
    var questions = blocB.questionsParDefaut || [];

    html.push('<div style="margin-bottom:16px;padding:10px 14px;background:var(--bleu-tres-pale);border-radius:var(--radius-moyen);border-left:3px solid var(--orange-accent)">');
    html.push('<div style="font-size:14px;font-weight:600;color:var(--texte-principal);margin-bottom:8px">' + echapperHtml(activite.titre) + '</div>');

    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (!q.actif) continue;
        var repQ = repAct[q.id] || {};
        var val = repQ[cle] || '';
        var valAutre = repQ[modeApres ? 'avant' : 'apres'] || '';

        html.push('<div style="margin-bottom:8px">');
        html.push('<div style="font-size:12px;font-weight:600;color:var(--texte-secondaire);margin-bottom:3px">' + echapperHtml(q.texte) + '</div>');

        if (q.type === 'oui_non_texte') {
            var ouiNon = (typeof val === 'object') ? val : { oui: false, texte: '' };
            html.push('<div class="bilan-preview-choix" style="margin-bottom:4px">');
            html.push('<button class="bilan-preview-option" style="cursor:pointer;' + (ouiNon.oui === true ? 'background:var(--bleu-clair);color:#fff;border-color:var(--bleu-clair)' : '') + '" data-action="BilanReflexif.repondreReflexionOuiNon" data-param="' + activite.id + '" data-param2="' + q.id + '" data-param3="1">Oui</button>');
            html.push('<button class="bilan-preview-option" style="cursor:pointer;' + (ouiNon.oui === false ? 'background:var(--bleu-clair);color:#fff;border-color:var(--bleu-clair)' : '') + '" data-action="BilanReflexif.repondreReflexionOuiNon" data-param="' + activite.id + '" data-param2="' + q.id + '" data-param3="0">Non</button>');
            html.push('</div>');
            html.push('<input type="text" class="bilan-ajout-input" data-reflexion-field="blocB-' + activite.id + '-' + q.id + '-texte" value="' + echapperHtml(ouiNon.texte || '') + '" placeholder="Pr\u00e9cise\u2026" style="font-size:12px">');
        } else {
            html.push('<input type="text" class="bilan-ajout-input" data-reflexion-field="blocB-' + activite.id + '-' + q.id + '" value="' + echapperHtml(typeof val === 'string' ? val : '') + '" placeholder="Ta r\u00e9ponse\u2026" style="font-size:12px">');
        }

        if (valAutre && (typeof valAutre === 'string' ? valAutre : (valAutre.texte || ''))) {
            var txt = typeof valAutre === 'string' ? valAutre : ((valAutre.oui ? 'Oui' : 'Non') + (valAutre.texte ? ' \u2014 ' + valAutre.texte : ''));
            html.push('<div style="font-size:10px;color:var(--texte-secondaire);font-style:italic;margin-top:2px">R\u00e9ponse ' + (modeApres ? 'avant' : 'apr\u00e8s') + '\u00a0: ' + echapperHtml(txt) + '</div>');
        }

        html.push('</div>');
    }

    html.push('</div>');
    return html.join('');
}

// === Rendu des questions de synthèse (Bloc C) ===

function rendreQuestionSyntheseHTML(question, modeApres) {
    var html = [];
    var cle = modeApres ? 'apres' : 'avant';
    var valeur = question.reponses ? question.reponses[cle] : '';
    var valeurAutre = question.reponses ? question.reponses[modeApres ? 'avant' : 'apres'] : '';

    html.push('<div class="bilan-question" style="flex-wrap:wrap;' + (question.actif ? '' : 'opacity:.45') + '">');
    html.push('<button class="bilan-toggle' + (question.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleQuestionReflexion" data-param="blocC" data-param2="' + question.id + '" style="align-self:flex-start;flex-shrink:0;margin-top:2px"></button>');
    html.push('<div style="flex:1;min-width:0">');
    html.push('<div class="bilan-question-texte">' + echapperHtml(question.texte) + '</div>');

    if (question.actif) {
        html.push('<textarea class="bilan-ajout-input" data-reflexion-field="blocC-' + question.id + '" placeholder="Ta r\u00e9flexion\u2026" style="margin-top:6px;min-height:60px;resize:vertical">' + echapperHtml(valeur || '') + '</textarea>');

        if (valeurAutre) {
            html.push('<div style="font-size:10px;color:var(--texte-secondaire);font-style:italic;margin-top:2px">R\u00e9ponse ' + (modeApres ? 'avant' : 'apr\u00e8s') + '\u00a0: ' + echapperHtml(tronquer(valeurAutre, 100)) + '</div>');
        }
    }

    html.push('</div>');
    if (question.personnalisee) {
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestionReflexion" data-param="blocC" data-param2="' + question.id + '" data-confirm="Supprimer ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
    }
    html.push('</div>');
    return html.join('');
}

// === Actions auto-réflexion ===

function changerEtatReflexion(nouvelEtat) {
    etat.reflexion.etat = nouvelEtat;
    etat.reflexion.dateModification = new Date().toISOString();
    sauvegarderReflexion();
    rendreReflexion();
}

function toggleBlocReflexion(nomBloc) {
    var bloc = etat.reflexion[nomBloc];
    if (!bloc) return;
    bloc.actif = !bloc.actif;
    sauvegarderReflexion();
    rendreReflexion();
}

function toggleQuestionReflexion(nomBloc, questionId) {
    var bloc = etat.reflexion[nomBloc];
    if (!bloc || !bloc.questions) return;
    for (var i = 0; i < bloc.questions.length; i++) {
        if (bloc.questions[i].id === questionId) {
            bloc.questions[i].actif = !bloc.questions[i].actif;
            break;
        }
    }
    sauvegarderReflexion();
    rendreReflexion();
}

function repondreReflexionLikert(questionId, valeur) {
    var questions = etat.reflexion.blocA.questions;
    var cle = etat.reflexion.etat === 'apres_resultats' ? 'apres' : 'avant';
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].id === questionId) {
            if (!questions[i].reponses) questions[i].reponses = { avant: null, apres: null };
            questions[i].reponses[cle] = valeur;
            break;
        }
    }
    etat.reflexion.dateModification = new Date().toISOString();
    sauvegarderReflexion();
    rendreReflexion();
}

function repondreReflexionOuiNon(activiteId, questionId, valOui) {
    var cle = etat.reflexion.etat === 'apres_resultats' ? 'apres' : 'avant';
    var reponses = etat.reflexion.blocB.reponses;
    if (!reponses[activiteId]) reponses[activiteId] = {};
    if (!reponses[activiteId][questionId]) reponses[activiteId][questionId] = { avant: { oui: null, texte: '' }, apres: { oui: null, texte: '' } };
    var rep = reponses[activiteId][questionId][cle];
    if (typeof rep !== 'object' || rep === null) rep = { oui: null, texte: '' };
    rep.oui = (valOui === 1 || valOui === '1');
    reponses[activiteId][questionId][cle] = rep;
    etat.reflexion.dateModification = new Date().toISOString();
    sauvegarderReflexion();
    rendreReflexion();
}

function ajouterQuestionReflexion(nomBloc) {
    var inputId = 'bilan-reflexion-' + (nomBloc === 'blocA' ? 'a' : 'c') + '-input';
    var input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;

    var bloc = etat.reflexion[nomBloc];
    if (!bloc || !bloc.questions) return;

    var newQ = {
        id: 'qm_' + genId(),
        texte: input.value.trim(),
        actif: true,
        personnalisee: true
    };

    if (nomBloc === 'blocA') {
        newQ.type = 'likert4';
        newQ.blocLikertSource = null;
        newQ.reponses = { avant: null, apres: null };
        newQ.commentaire = '';
    } else {
        newQ.type = 'texte_long';
        newQ.reponses = { avant: '', apres: '' };
    }

    bloc.questions.push(newQ);
    sauvegarderReflexion();
    rendreReflexion();
}

function supprimerQuestionReflexion(nomBloc, questionId) {
    var bloc = etat.reflexion[nomBloc];
    if (!bloc || !bloc.questions) return;
    for (var i = 0; i < bloc.questions.length; i++) {
        if (bloc.questions[i].id === questionId) {
            bloc.questions.splice(i, 1);
            break;
        }
    }
    sauvegarderReflexion();
    rendreReflexion();
}

function collecterReponsesReflexion() {
    var r = etat.reflexion;
    var cle = r.etat === 'apres_resultats' ? 'apres' : 'avant';

    // Collecter les commentaires du Bloc A
    for (var ia = 0; ia < r.blocA.questions.length; ia++) {
        var qa = r.blocA.questions[ia];
        var taComm = document.querySelector('[data-reflexion-field="commentaire-' + qa.id + '"]');
        if (taComm) qa.commentaire = taComm.value;
    }

    // Collecter les réponses texte du Bloc B
    var activites = etat.parcours ? etat.parcours.activites : [];
    var questionsB = r.blocB.questionsParDefaut || [];
    for (var ib = 0; ib < activites.length; ib++) {
        var actId = activites[ib].id;
        if (!r.blocB.reponses[actId]) r.blocB.reponses[actId] = {};
        for (var jb = 0; jb < questionsB.length; jb++) {
            var qb = questionsB[jb];
            if (!qb.actif) continue;

            if (qb.type === 'oui_non_texte') {
                var inputTexte = document.querySelector('[data-reflexion-field="blocB-' + actId + '-' + qb.id + '-texte"]');
                if (inputTexte) {
                    if (!r.blocB.reponses[actId][qb.id]) r.blocB.reponses[actId][qb.id] = { avant: { oui: null, texte: '' }, apres: { oui: null, texte: '' } };
                    var rep = r.blocB.reponses[actId][qb.id][cle];
                    if (typeof rep !== 'object' || rep === null) rep = { oui: null, texte: '' };
                    rep.texte = inputTexte.value;
                    r.blocB.reponses[actId][qb.id][cle] = rep;
                }
            } else {
                var inputVal = document.querySelector('[data-reflexion-field="blocB-' + actId + '-' + qb.id + '"]');
                if (inputVal) {
                    if (!r.blocB.reponses[actId][qb.id]) r.blocB.reponses[actId][qb.id] = { avant: '', apres: '' };
                    r.blocB.reponses[actId][qb.id][cle] = inputVal.value;
                }
            }
        }
    }

    // Collecter les réponses du Bloc C
    for (var ic = 0; ic < r.blocC.questions.length; ic++) {
        var qc = r.blocC.questions[ic];
        var taC = document.querySelector('[data-reflexion-field="blocC-' + qc.id + '"]');
        if (taC) {
            if (!qc.reponses) qc.reponses = { avant: '', apres: '' };
            qc.reponses[cle] = taC.value;
        }
    }

    r.dateModification = new Date().toISOString();
}

function attacherListenersReflexion() {
    var champs = document.querySelectorAll('[data-reflexion-field]');
    for (var i = 0; i < champs.length; i++) {
        champs[i].addEventListener('blur', function() {
            collecterReponsesReflexion();
            sauvegarderReflexion();
        });
    }
}


/* ===============================
   API publique
   =============================== */

window.BilanReflexifReflexion = {
    // Rendu
    rendreReflexion: rendreReflexion,

    // États et toggles
    changerEtatReflexion: changerEtatReflexion,
    toggleBlocReflexion: toggleBlocReflexion,
    toggleQuestionReflexion: toggleQuestionReflexion,

    // Réponses
    repondreReflexionLikert: repondreReflexionLikert,
    repondreReflexionOuiNon: repondreReflexionOuiNon,

    // CRUD questions
    ajouterQuestionReflexion: ajouterQuestionReflexion,
    supprimerQuestionReflexion: supprimerQuestionReflexion
};

})();
