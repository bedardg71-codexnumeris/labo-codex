/* ===============================
   MODULE: BILAN RÉFLEXIF — ÉDITEUR
   Édition du questionnaire : blocs, questions Likert/choix/matrix/ouvert,
   options, énoncés, NA. PLAN-MOYEN-TERME §4.1.d, MODULES-MAP §2.5.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js
   Charger AVANT : bilan-reflexif.js (résidu)

   Dépendances :
   - BilanReflexifCore : etat, sauvegarderQuestionnaire, trouverBloc/Question/Perso,
     genId, afficherToast, libelleTypeQuestion
   - BILAN_REFLEXIF_DATA : creerQuestionnaireDemoComplet (pour reinitialiserDemo)
   - Globaux projet : echapperHtml (sécurité)
   - window.BilanReflexif (résidu, lookup tardif) : exporterTexte,
     ouvrirModaleImport — pas requis au load, seulement au clic utilisateur.
   =============================== */

(function() {
'use strict';

// Aliases vers BilanReflexifCore : laisse tous les call-sites internes
// (`etat.X`, `sauvegarderQuestionnaire()`, etc.) inchangés.
var etat = BilanReflexifCore.etat;
var genId = BilanReflexifCore.genId;
var afficherToast = BilanReflexifCore.afficherToast;
var libelleTypeQuestion = BilanReflexifCore.libelleTypeQuestion;
var sauvegarderQuestionnaire = BilanReflexifCore.sauvegarderQuestionnaire;
var trouverBloc = BilanReflexifCore.trouverBloc;
var trouverQuestion = BilanReflexifCore.trouverQuestion;
var trouverQuestionPerso = BilanReflexifCore.trouverQuestionPerso;
var rendreAideHTML = BilanReflexifCore.rendreAideHTML;

/* ===============================
   SECTION 3 : ÉDITEUR DE QUESTIONNAIRE
   =============================== */

function rendreEditeur() {
    var vue = document.getElementById('bilan-vue-editeur');
    if (!vue) return;

    var q = etat.questionnaire;
    var html = [];

    // Description d'introduction
    html.push('<div class="bilan-info">');
    html.push('Cet outil te permet de construire un questionnaire anonyme \u00e0 distribuer \u00e0 tes \u00e9tudiant\u00b7es en fin de trimestre. ');
    html.push('Il recueille leurs perceptions sur la qualit\u00e9 de l\u2019enseignement, du syst\u00e8me d\u2019\u00e9valuation et de l\u2019accompagnement re\u00e7u. ');
    html.push('Les r\u00e9ponses te donneront un portrait du v\u00e9cu de ton groupe.');
    html.push('</div>');

    // Titre du questionnaire
    html.push('<input type="text" class="bilan-titre-input" id="bilan-titre" value="' + echapperHtml(q.titre) + '" data-on-change="BilanReflexif.modifierTitre" placeholder="Titre du questionnaire">');

    // Préambule (multi-lignes, optionnel) — affiché aux élèves dans le formulaire en ligne
    var preambuleVal = q.preambule ? String(q.preambule) : '';
    html.push('<textarea class="bilan-preambule-input" id="bilan-preambule" data-on-change="BilanReflexif.modifierPreambule" placeholder="Préambule (optionnel) — texte d’introduction affiché aux étudiant·es dans le formulaire en ligne…" rows="2">' + echapperHtml(preambuleVal) + '</textarea>');

    // Barre d'actions
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.exporterTexte">Copier les questions</button>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ouvrirModaleImport">Importer un questionnaire</button>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.reinitialiserDemo">R\u00e9initialiser le mod\u00e8le</button>');
    html.push('</div>');

    // Panneau d'aide — distribution du questionnaire Likert
    html.push(rendreAideHTML('editeur',
        'Comment distribuer ce questionnaire\u00a0?',
        '<ol>' +
        '<li><strong>Copie les questions</strong> \u2014 Clique sur \u00ab\u00a0Copier les questions\u00a0\u00bb. Le texte est copi\u00e9 dans ton presse-papier.</li>' +
        '<li><strong>Ouvre ton outil de formulaire en ligne</strong> \u2014 La plupart des outils (formulaires institutionnels, outils gratuits) permettent de cr\u00e9er des questionnaires avec des questions \u00e0 choix multiples.</li>' +
        '<li><strong>Cr\u00e9e une question par item</strong> \u2014 Pour chaque question Likert, cr\u00e9e une question de type \u00ab\u00a0choix unique\u00a0\u00bb ou \u00ab\u00a0\u00e9chelle\u00a0\u00bb avec les 4 options\u00a0: Tout \u00e0 fait d\u2019accord / Plut\u00f4t d\u2019accord / Plut\u00f4t en d\u00e9saccord / Pas du tout d\u2019accord.</li>' +
        '<li><strong>Pour les questions ouvertes</strong>, cr\u00e9e une question de type \u00ab\u00a0texte long\u00a0\u00bb ou \u00ab\u00a0paragraphe\u00a0\u00bb.</li>' +
        '<li><strong>Configure l\u2019anonymat</strong> \u2014 Assure-toi que le formulaire ne collecte pas le nom ni le courriel des r\u00e9pondants.</li>' +
        '<li><strong>Distribue le lien</strong> \u2014 Partage le lien du formulaire \u00e0 tes \u00e9tudiants.</li>' +
        '<li><strong>Exporte les r\u00e9sultats en CSV</strong> \u2014 Une fois les r\u00e9ponses collect\u00e9es, exporte-les au format CSV depuis ton outil. Tu pourras ensuite les importer dans l\u2019onglet \u00ab\u00a0Importer les r\u00e9sultats\u00a0\u00bb.</li>' +
        '</ol>' +
        '<div class="bilan-aide-astuce"><strong>Vocabulaire \u2014 attention :</strong> certaines applications de formulaire en ligne appellent \u00ab\u00a0Likert\u00a0\u00bb une question \u00e0 plusieurs \u00e9nonc\u00e9s partageant la m\u00eame \u00e9chelle, ce qui correspond \u00e0 notre <strong>Likert matriciel</strong>. Une \u00ab\u00a0Likert (1 \u00e9nonc\u00e9)\u00a0\u00bb dans Labo Codex devient g\u00e9n\u00e9ralement un type \u00ab\u00a0Choix\u00a0\u00bb \u00e0 4 options dans ces applications.</div>' +
        '<div class="bilan-aide-astuce">Certains outils de formulaire permettent d\u2019importer les questions directement depuis un document structur\u00e9. V\u00e9rifie si ton outil offre cette option \u2014 \u00e7a peut t\u2019\u00e9conomiser la saisie manuelle.</div>'
    ));

    // Blocs thématiques
    for (var i = 0; i < q.blocs.length; i++) {
        html.push(rendreBlocHTML(q.blocs[i], i));
    }

    // Questions personnalisées
    html.push('<div class="bilan-perso-section">');
    html.push('<div class="bilan-perso-titre">Questions personnalis\u00e9es</div>');
    if (q.questionsPersonnalisees && q.questionsPersonnalisees.length > 0) {
        for (var k = 0; k < q.questionsPersonnalisees.length; k++) {
            var qp = q.questionsPersonnalisees[k];
            html.push('<div class="bilan-question">');
            html.push('<span class="bilan-question-num">' + (k + 1) + '.</span>');

            if (etat.questionEnEdition === qp.id) {
                html.push('<input type="text" class="bilan-edit-input" id="bilan-edit-' + qp.id + '" value="' + echapperHtml(qp.texte) + '" data-on-keyup="BilanReflexif.validerEditionKeyup">');
            } else {
                html.push('<span class="bilan-question-texte">' + echapperHtml(qp.texte) + '</span>');
            }

            html.push('<span class="bilan-question-type">' + echapperHtml(libelleTypeQuestion(qp.type, qp)) + '</span>');
            html.push('<div class="bilan-question-actions">');

            if (etat.questionEnEdition === qp.id) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerEdition" data-param="perso" data-param2="' + qp.id + '" title="Confirmer">\u2713</button>');
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerEdition" title="Annuler"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon" style="width:12px;height:12px;"></button>');
            } else {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.editerQuestion" data-param="perso" data-param2="' + qp.id + '" title="Modifier">\u270E</button>');
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestion" data-param="perso" data-param2="' + qp.id + '" data-confirm="Supprimer cette question ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
            }

            html.push('</div>');
            html.push('</div>');
            html.push(rendreDetailsQuestion(qp, 'perso'));
        }
    }
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-perso-input" placeholder="Ajouter une question personnalis\u00e9e\u2026">');
    html.push('<select class="bilan-ajout-select" id="bilan-perso-type">');
    html.push('<option value="likert4">Likert (1 énoncé)</option>');
    html.push('<option value="choix_unique">Choix unique</option>');
    html.push('<option value="choix_multiple">Choix multiple</option>');
    html.push('<option value="matrix">Likert matriciel</option>');
    html.push('<option value="ouvert">R\u00e9ponse ouverte</option>');
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterPerso">Ajouter</button>');
    html.push('</div>');
    html.push('</div>');

    vue.innerHTML = html.join('');
}

function rendreDetailsQuestion(q, blocId) {
    if (!q) return '';
    var bId = blocId || 'perso';
    var parts = [];

    // Consigne conditionnelle (toujours affichée comme champ optionnel)
    var consigne = q.consigneConditionnelle || '';
    parts.push(
        '<div class="bilan-question-meta">' +
        '<input type="text" class="bilan-question-consigne-input" ' +
        'placeholder="Consigne conditionnelle (italique au-dessus dans le formulaire — ex. « Si tu as répondu Oui : »)…" ' +
        'value="' + echapperHtml(consigne) + '" ' +
        'data-on-change="BilanReflexif.modifierConsigneConditionnelle" ' +
        'data-bloc="' + bId + '" data-question="' + q.id + '">' +
        '</div>'
    );

    // Likert + NA toggle
    if (q.type === 'likert4') {
        parts.push(
            '<label class="bilan-question-na-toggle">' +
            '<input type="checkbox" ' + (q.inclureNA ? 'checked' : '') + ' ' +
            'data-on-change="BilanReflexif.toggleNA" ' +
            'data-bloc="' + bId + '" data-question="' + q.id + '"> ' +
            'Inclure une 5e option « Non applicable »' +
            '</label>'
        );
    }

    // Options Radio/Checkbox
    if (q.type === 'choix_unique' || q.type === 'choix_multiple') {
        if (q.type === 'choix_multiple') {
            var minV = (q.minSelection != null) ? q.minSelection : '';
            var maxV = (q.maxSelection != null) ? q.maxSelection : '';
            parts.push(
                '<div class="bilan-question-limites">' +
                '<label>Min : <input type="number" min="0" max="20" class="bilan-mini-num" value="' + minV + '" placeholder="—" ' +
                'data-on-change="BilanReflexif.modifierLimite" data-bloc="' + bId + '" data-question="' + q.id + '" data-champ="min"></label>' +
                '<label>Max : <input type="number" min="0" max="20" class="bilan-mini-num" value="' + maxV + '" placeholder="—" ' +
                'data-on-change="BilanReflexif.modifierLimite" data-bloc="' + bId + '" data-question="' + q.id + '" data-champ="max"></label>' +
                '<span style="opacity:.6">(laisser vide = pas de limite)</span>' +
                '</div>'
            );
        }
        var opts = q.options || [];
        var optsHtml = ['<div class="bilan-question-options-list">'];
        for (var oi = 0; oi < opts.length; oi++) {
            var opt = opts[oi];
            var lettre = String.fromCharCode(97 + oi);
            var row = '<div class="bilan-option-row">' +
                '<span class="bilan-option-lettre">' + lettre + '.</span>' +
                '<input type="text" class="bilan-option-input" value="' + echapperHtml(opt.texte || '') + '" ' +
                'data-on-change="BilanReflexif.modifierOption" ' +
                'data-bloc="' + bId + '" data-question="' + q.id + '" data-option="' + opt.id + '" ' +
                'placeholder="Texte de l’option…">' +
                '<label class="bilan-option-autre">' +
                '<input type="checkbox" ' + (opt.autreAvecChamp ? 'checked' : '') + ' ' +
                'data-on-change="BilanReflexif.toggleAutreChamp" ' +
                'data-bloc="' + bId + '" data-question="' + q.id + '" data-option="' + opt.id + '"> Autre' +
                '</label>';
            if (oi > 0) {
                row += '<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerOption" data-bloc="' + bId + '" data-question="' + q.id + '" data-option="' + opt.id + '" data-direction="-1" title="Monter">↑</button>';
            }
            if (oi < opts.length - 1) {
                row += '<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerOption" data-bloc="' + bId + '" data-question="' + q.id + '" data-option="' + opt.id + '" data-direction="1" title="Descendre">↓</button>';
            }
            row += '<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerOption" data-bloc="' + bId + '" data-question="' + q.id + '" data-option="' + opt.id + '" data-confirm="Supprimer cette option ?" title="Supprimer">×</button>' +
                '</div>';
            optsHtml.push(row);
        }
        optsHtml.push(
            '<button class="bilan-btn bilan-btn-secondaire bilan-add-mini" ' +
            'data-action="BilanReflexif.ajouterOption" data-bloc="' + bId + '" data-question="' + q.id + '">+ Ajouter une option</button>'
        );
        optsHtml.push('</div>');
        parts.push(optsHtml.join(''));
    }

    // Énoncés Matrix
    if (q.type === 'matrix') {
        var enonces = q.enonces || [];
        var enonHtml = ['<div class="bilan-question-enonces-list">'];
        for (var ei = 0; ei < enonces.length; ei++) {
            var en = enonces[ei];
            var rowE = '<div class="bilan-enonce-row">' +
                '<span class="bilan-enonce-puce">—</span>' +
                '<input type="text" class="bilan-enonce-input" value="' + echapperHtml(en.texte || '') + '" ' +
                'data-on-change="BilanReflexif.modifierEnonce" ' +
                'data-bloc="' + bId + '" data-question="' + q.id + '" data-enonce="' + en.id + '" ' +
                'placeholder="Texte de l’énoncé…">';
            if (ei > 0) {
                rowE += '<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerEnonce" data-bloc="' + bId + '" data-question="' + q.id + '" data-enonce="' + en.id + '" data-direction="-1" title="Monter">↑</button>';
            }
            if (ei < enonces.length - 1) {
                rowE += '<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerEnonce" data-bloc="' + bId + '" data-question="' + q.id + '" data-enonce="' + en.id + '" data-direction="1" title="Descendre">↓</button>';
            }
            rowE += '<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerEnonce" data-bloc="' + bId + '" data-question="' + q.id + '" data-enonce="' + en.id + '" data-confirm="Supprimer cet énoncé ?" title="Supprimer">×</button>' +
                '</div>';
            enonHtml.push(rowE);
        }
        enonHtml.push(
            '<button class="bilan-btn bilan-btn-secondaire bilan-add-mini" ' +
            'data-action="BilanReflexif.ajouterEnonce" data-bloc="' + bId + '" data-question="' + q.id + '">+ Ajouter un énoncé</button>'
        );
        enonHtml.push('</div>');
        parts.push(enonHtml.join(''));
    }

    return '<div class="bilan-question-details">' + parts.join('') + '</div>';
}

function rendreBlocHTML(bloc, indexBloc) {
    var estOuvert = etat.blocOuvert === bloc.id;
    var nbQuestions = bloc.questions.length;
    // Compteur générique : N questions
    // (le détail par type apparaît sur les badges individuels des questions)

    var html = [];
    html.push('<div class="bilan-bloc' + (bloc.actif ? '' : ' inactif') + (estOuvert ? ' ouvert' : '') + '" data-bloc="' + bloc.id + '">');

    // Header
    html.push('<div class="bilan-bloc-header">');
    html.push('<div class="bilan-bloc-gauche" data-action="BilanReflexif.toggleOuverture" data-param="' + bloc.id + '">');
    html.push('<span style="font-size:12px;color:var(--texte-secondaire)">' + (estOuvert ? '\u25BC' : '\u25B6') + '</span>');
    html.push('<span class="bilan-bloc-titre">' + echapperHtml(bloc.titre) + '</span>');
    html.push('<span class="bilan-bloc-badge">' + nbQuestions + ' question' + (nbQuestions > 1 ? 's' : '') + '</span>');
    html.push('</div>');
    html.push('<button class="bilan-toggle' + (bloc.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleBloc" data-param="' + bloc.id + '" title="' + (bloc.actif ? 'D\u00e9sactiver' : 'Activer') + '"></button>');
    html.push('</div>');

    // Body (questions)
    html.push('<div class="bilan-bloc-body">');

    // Description du bloc (optionnelle, multi-lignes courte)
    var descVal = bloc.description ? String(bloc.description) : '';
    html.push('<div class="bilan-bloc-description-zone">');
    html.push('<textarea class="bilan-bloc-description-input" id="bilan-desc-' + bloc.id + '" data-on-change="BilanReflexif.modifierDescriptionBloc" data-param="' + bloc.id + '" placeholder="Description du bloc (optionnelle) — affichée aux étudiant·es comme cadrage de la section…" rows="1">' + echapperHtml(descVal) + '</textarea>');
    html.push('</div>');
    for (var j = 0; j < bloc.questions.length; j++) {
        var q = bloc.questions[j];
        html.push('<div class="bilan-question">');
        html.push('<span class="bilan-question-num">' + (j + 1) + '.</span>');

        if (etat.questionEnEdition === q.id) {
            html.push('<input type="text" class="bilan-edit-input" id="bilan-edit-' + q.id + '" value="' + echapperHtml(q.texte) + '" data-on-keyup="BilanReflexif.validerEditionKeyup">');
        } else {
            html.push('<span class="bilan-question-texte">' + echapperHtml(q.texte) + '</span>');
        }

        html.push('<span class="bilan-question-type">' + echapperHtml(libelleTypeQuestion(q.type, q)) + '</span>');
        html.push('<div class="bilan-question-actions">');

        if (etat.questionEnEdition === q.id) {
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerEdition" data-param="' + bloc.id + '" data-param2="' + q.id + '" title="Confirmer">\u2713</button>');
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerEdition" title="Annuler"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon" style="width:12px;height:12px;"></button>');
        } else {
            if (j > 0) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-param3="-1" title="Monter">\u2191</button>');
            }
            if (j < bloc.questions.length - 1) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-param3="1" title="Descendre">\u2193</button>');
            }
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.editerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" title="Modifier">\u270E</button>');
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-confirm="Supprimer cette question ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
        }

        html.push('</div>');
        html.push('</div>');

        // Détails read-only : options, énoncés, consigne, NA
        html.push(rendreDetailsQuestion(q, bloc.id));
    }

    // Bouton ajouter une question au bloc
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-ajout-' + bloc.id + '" placeholder="Ajouter une question\u2026">');
    html.push('<select class="bilan-ajout-select" id="bilan-ajout-type-' + bloc.id + '">');
    html.push('<option value="likert4">Likert (1 énoncé)</option>');
    html.push('<option value="choix_unique">Choix unique</option>');
    html.push('<option value="choix_multiple">Choix multiple</option>');
    html.push('<option value="matrix">Likert matriciel</option>');
    html.push('<option value="ouvert">Ouvert</option>');
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterQuestionBloc" data-param="' + bloc.id + '">Ajouter</button>');
    html.push('</div>');

    html.push('</div>'); // fin bloc-body
    html.push('</div>'); // fin bloc

    return html.join('');
}

// === Actions éditeur ===

function modifierPreambule() {
    var ta = document.getElementById('bilan-preambule');
    if (ta && etat.questionnaire) {
        var val = ta.value;
        etat.questionnaire.preambule = val.trim() === '' ? null : val;
        etat.questionnaire.dateModification = new Date().toISOString();
        sauvegarderQuestionnaire();
    }
}

function modifierDescriptionBloc(blocId, elem) {
    var bloc = trouverBloc(blocId);
    if (!bloc) return;
    var ta = elem || document.getElementById('bilan-desc-' + blocId);
    if (!ta) return;
    var val = (ta.value || '').trim();
    bloc.description = val === '' ? null : val;
    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
}

function modifierTitre() {
    var input = document.getElementById('bilan-titre');
    if (input && etat.questionnaire) {
        etat.questionnaire.titre = input.value.trim() || 'Bilan r\u00e9flexif';
        etat.questionnaire.dateModification = new Date().toISOString();
        sauvegarderQuestionnaire();
    }
}

function toggleBloc(blocId) {
    var bloc = trouverBloc(blocId);
    if (!bloc) return;
    bloc.actif = !bloc.actif;
    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function toggleOuverture(blocId) {
    etat.blocOuvert = (etat.blocOuvert === blocId) ? null : blocId;
    rendreEditeur();
}

function editerQuestion(blocId, questionId) {
    etat.questionEnEdition = questionId;
    rendreEditeur();
    // Focus l'input
    setTimeout(function() {
        var input = document.getElementById('bilan-edit-' + questionId);
        if (input) { input.focus(); input.select(); }
    }, 50);
}

function confirmerEdition(blocId, questionId) {
    var input = document.getElementById('bilan-edit-' + questionId);
    if (!input) return;
    var texte = input.value.trim();
    if (!texte) return;

    if (blocId === 'perso') {
        var qp = trouverQuestionPerso(questionId);
        if (qp) qp.texte = texte;
    } else {
        var question = trouverQuestion(blocId, questionId);
        if (question) question.texte = texte;
    }

    etat.questionEnEdition = null;
    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function annulerEdition() {
    etat.questionEnEdition = null;
    rendreEditeur();
}

function validerEditionKeyup(el) {
    if (!el || !el.target) return;
    var e = el;
    // Le dispatcher passe l'élément directement pour les events sans param
    // On doit récupérer le KeyboardEvent depuis le contexte
    // Comme data-on-keyup passe l'élément, on utilise une approche différente
}

function supprimerQuestion(blocId, questionId) {
    if (blocId === 'perso') {
        var perso = etat.questionnaire.questionsPersonnalisees;
        for (var i = 0; i < perso.length; i++) {
            if (perso[i].id === questionId) {
                perso.splice(i, 1);
                break;
            }
        }
    } else {
        var bloc = trouverBloc(blocId);
        if (!bloc) return;
        for (var j = 0; j < bloc.questions.length; j++) {
            if (bloc.questions[j].id === questionId) {
                bloc.questions.splice(j, 1);
                break;
            }
        }
    }
    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function deplacerQuestion(blocId, questionId, direction) {
    var bloc = trouverBloc(blocId);
    if (!bloc) return;
    var idx = -1;
    for (var i = 0; i < bloc.questions.length; i++) {
        if (bloc.questions[i].id === questionId) { idx = i; break; }
    }
    if (idx < 0) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= bloc.questions.length) return;

    var temp = bloc.questions[idx];
    bloc.questions[idx] = bloc.questions[newIdx];
    bloc.questions[newIdx] = temp;

    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function ajouterQuestionBloc(blocId) {
    var input = document.getElementById('bilan-ajout-' + blocId);
    var typeSelect = document.getElementById('bilan-ajout-type-' + blocId);
    if (!input || !input.value.trim()) return;

    var bloc = trouverBloc(blocId);
    if (!bloc) return;

    var type = typeSelect ? typeSelect.value : 'likert4';
    var nouvelle = {
        id: 'q_' + genId(),
        texte: input.value.trim(),
        type: type,
        obligatoire: false,
        personnalisee: true
    };
    if (type === 'likert4') nouvelle.inclureNA = false;
    if (type === 'choix_unique' || type === 'choix_multiple') {
        nouvelle.options = [
            { id: 'opt_' + genId(), lettre: 'a', texte: '', autreAvecChamp: false },
            { id: 'opt_' + genId(), lettre: 'b', texte: '', autreAvecChamp: false }
        ];
    }
    if (type === 'choix_multiple') {
        nouvelle.minSelection = null;
        nouvelle.maxSelection = null;
    }
    if (type === 'matrix') {
        nouvelle.enonces = [
            { id: 'enon_' + genId(), texte: '' },
            { id: 'enon_' + genId(), texte: '' }
        ];
    }

    bloc.questions.push(nouvelle);

    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function ajouterPerso() {
    var input = document.getElementById('bilan-perso-input');
    var typeSelect = document.getElementById('bilan-perso-type');
    if (!input || !input.value.trim()) return;

    if (!etat.questionnaire.questionsPersonnalisees) {
        etat.questionnaire.questionsPersonnalisees = [];
    }

    var type = typeSelect ? typeSelect.value : 'likert4';
    var nouvelle = {
        id: 'q_perso_' + genId(),
        texte: input.value.trim(),
        type: type,
        obligatoire: false,
        personnalisee: true,
        bloc: null
    };
    if (type === 'likert4') nouvelle.inclureNA = false;
    if (type === 'choix_unique' || type === 'choix_multiple') {
        nouvelle.options = [
            { id: 'opt_' + genId(), lettre: 'a', texte: '', autreAvecChamp: false },
            { id: 'opt_' + genId(), lettre: 'b', texte: '', autreAvecChamp: false }
        ];
    }
    if (type === 'choix_multiple') {
        nouvelle.minSelection = null;
        nouvelle.maxSelection = null;
    }
    if (type === 'matrix') {
        nouvelle.enonces = [
            { id: 'enon_' + genId(), texte: '' },
            { id: 'enon_' + genId(), texte: '' }
        ];
    }

    etat.questionnaire.questionsPersonnalisees.push(nouvelle);

    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}


function trouverQuestionUniverselle(blocId, questionId) {
    if (!blocId || blocId === 'perso') {
        return trouverQuestionPerso(questionId);
    }
    return trouverQuestion(blocId, questionId);
}

function trouverOption(question, optionId) {
    if (!question || !question.options) return null;
    for (var i = 0; i < question.options.length; i++) {
        if (question.options[i].id === optionId) return question.options[i];
    }
    return null;
}

function indexOption(question, optionId) {
    if (!question || !question.options) return -1;
    for (var i = 0; i < question.options.length; i++) {
        if (question.options[i].id === optionId) return i;
    }
    return -1;
}

function trouverEnonce(question, enonceId) {
    if (!question || !question.enonces) return null;
    for (var i = 0; i < question.enonces.length; i++) {
        if (question.enonces[i].id === enonceId) return question.enonces[i];
    }
    return null;
}

function indexEnonce(question, enonceId) {
    if (!question || !question.enonces) return -1;
    for (var i = 0; i < question.enonces.length; i++) {
        if (question.enonces[i].id === enonceId) return i;
    }
    return -1;
}

function _toucher() {
    if (etat.questionnaire) etat.questionnaire.dateModification = new Date().toISOString();
}

function ajouterOption(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    if (!q.options) q.options = [];
    if (q.options.length >= 8) {
        afficherToast('Limite : 8 options max');
        return;
    }
    q.options.push({
        id: 'opt_' + genId(),
        lettre: String.fromCharCode(97 + q.options.length),
        texte: '',
        autreAvecChamp: false
    });
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function supprimerOption(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var optionId = elem.dataset.option;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q || !q.options) return;
    if (q.options.length <= 2) {
        afficherToast('Minimum : 2 options');
        return;
    }
    q.options = q.options.filter(function(o) { return o.id !== optionId; });
    // Réajuster les lettres
    for (var i = 0; i < q.options.length; i++) {
        q.options[i].lettre = String.fromCharCode(97 + i);
    }
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function deplacerOption(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var optionId = elem.dataset.option;
    var direction = parseInt(elem.dataset.direction, 10);
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q || !q.options) return;
    var idx = indexOption(q, optionId);
    var newIdx = idx + direction;
    if (idx < 0 || newIdx < 0 || newIdx >= q.options.length) return;
    var tmp = q.options[idx];
    q.options[idx] = q.options[newIdx];
    q.options[newIdx] = tmp;
    for (var i = 0; i < q.options.length; i++) {
        q.options[i].lettre = String.fromCharCode(97 + i);
    }
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function modifierOption(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var optionId = elem.dataset.option;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    var opt = trouverOption(q, optionId);
    if (!opt) return;
    opt.texte = elem.value;
    _toucher();
    sauvegarderQuestionnaire();
    // Pas de re-render : l'utilisateur tape encore
}

function toggleAutreChamp(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var optionId = elem.dataset.option;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    var opt = trouverOption(q, optionId);
    if (!opt) return;
    opt.autreAvecChamp = !!elem.checked;
    _toucher();
    sauvegarderQuestionnaire();
    // Pas de re-render : la case à cocher reflète déjà l'état
}

function modifierLimite(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var champ = elem.dataset.champ; // "min" ou "max"
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    var v = elem.value;
    var n = v === '' ? null : parseInt(v, 10);
    if (n != null && (isNaN(n) || n < 0)) n = null;
    if (champ === 'min') q.minSelection = n;
    if (champ === 'max') q.maxSelection = n;
    _toucher();
    sauvegarderQuestionnaire();
}

function ajouterEnonce(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    if (!q.enonces) q.enonces = [];
    q.enonces.push({ id: 'enon_' + genId(), texte: '' });
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function supprimerEnonce(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var enonceId = elem.dataset.enonce;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q || !q.enonces) return;
    if (q.enonces.length <= 1) {
        afficherToast('Au moins 1 énoncé requis');
        return;
    }
    q.enonces = q.enonces.filter(function(e) { return e.id !== enonceId; });
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function deplacerEnonce(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var enonceId = elem.dataset.enonce;
    var direction = parseInt(elem.dataset.direction, 10);
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q || !q.enonces) return;
    var idx = indexEnonce(q, enonceId);
    var newIdx = idx + direction;
    if (idx < 0 || newIdx < 0 || newIdx >= q.enonces.length) return;
    var tmp = q.enonces[idx];
    q.enonces[idx] = q.enonces[newIdx];
    q.enonces[newIdx] = tmp;
    _toucher();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function modifierEnonce(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var enonceId = elem.dataset.enonce;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    var en = trouverEnonce(q, enonceId);
    if (!en) return;
    en.texte = elem.value;
    _toucher();
    sauvegarderQuestionnaire();
}

function toggleNA(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q || q.type !== 'likert4') return;
    q.inclureNA = !!elem.checked;
    _toucher();
    sauvegarderQuestionnaire();
}

function modifierConsigneConditionnelle(elem) {
    var blocId = elem.dataset.bloc;
    var questionId = elem.dataset.question;
    var q = trouverQuestionUniverselle(blocId, questionId);
    if (!q) return;
    var v = (elem.value || '').trim();
    q.consigneConditionnelle = v === '' ? null : v;
    _toucher();
    sauvegarderQuestionnaire();
}

async function reinitialiserDemo() {
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('questionnaire'))) return;
    if (!confirm('Remplacer le questionnaire actuel par le mod\u00e8le d\u2019origine\u00a0?')) return;
    etat.questionnaire = BILAN_REFLEXIF_DATA.creerQuestionnaireDemoComplet();
    etat.blocOuvert = null;
    sauvegarderQuestionnaire();
    rendreEditeur();
    afficherToast('Mod\u00e8le r\u00e9initialis\u00e9');
}

/* ===============================
   API publique
   =============================== */

window.BilanReflexifEditeur = {
    // Rendu
    rendreEditeur: rendreEditeur,

    // Edition du questionnaire
    modifierTitre: modifierTitre,
    modifierPreambule: modifierPreambule,
    modifierDescriptionBloc: modifierDescriptionBloc,

    // Blocs
    toggleBloc: toggleBloc,
    toggleOuverture: toggleOuverture,

    // Questions (édition inline + CRUD)
    editerQuestion: editerQuestion,
    confirmerEdition: confirmerEdition,
    annulerEdition: annulerEdition,
    validerEditionKeyup: validerEditionKeyup,
    supprimerQuestion: supprimerQuestion,
    deplacerQuestion: deplacerQuestion,
    ajouterQuestionBloc: ajouterQuestionBloc,
    ajouterPerso: ajouterPerso,

    // Options (choix unique/multiple)
    ajouterOption: ajouterOption,
    supprimerOption: supprimerOption,
    deplacerOption: deplacerOption,
    modifierOption: modifierOption,
    toggleAutreChamp: toggleAutreChamp,
    modifierLimite: modifierLimite,

    // Énoncés (matrix)
    ajouterEnonce: ajouterEnonce,
    supprimerEnonce: supprimerEnonce,
    deplacerEnonce: deplacerEnonce,
    modifierEnonce: modifierEnonce,

    // Métadonnées question
    toggleNA: toggleNA,
    modifierConsigneConditionnelle: modifierConsigneConditionnelle,

    // Démo
    reinitialiserDemo: reinitialiserDemo
};

})();
