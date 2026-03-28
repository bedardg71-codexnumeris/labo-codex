/* ===============================
   MODULE: BILAN RÉFLEXIF
   Questionnaire de fin de trimestre, import CSV, rapport d'analyse
   =============================== */

(function() {
'use strict';

/* ===============================
   SECTION 0 : STYLES CSS
   =============================== */

var stylesInjectes = false;

function injecterStyles() {
    if (stylesInjectes) return;
    stylesInjectes = true;
    var style = document.createElement('style');
    style.textContent = [
        /* Navigation interne */
        '.bilan-nav{display:flex;gap:4px;margin-bottom:20px;padding:4px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-grand,12px);flex-wrap:wrap}',
        '.bilan-nav-btn{padding:10px 16px;border:none;background:transparent;color:var(--texte-secondaire,#8aa4b0);border-radius:var(--radius-moyen,6px);cursor:pointer;font-size:14px;transition:all .2s;font-family:inherit}',
        '.bilan-nav-btn:hover{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',
        '.bilan-nav-btn.actif{background:var(--bleu-carte,#1a3a48);color:var(--texte-principal,#d0e0e4);box-shadow:var(--shadow-subtil)}',
        '.bilan-nav-btn:disabled{opacity:.4;cursor:not-allowed}',
        '.bilan-vue{display:none}',
        '.bilan-vue.visible{display:block}',

        /* Barre d'actions éditeur */
        '.bilan-actions{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}',

        /* Titre du questionnaire */
        '.bilan-titre-input{width:100%;padding:10px 14px;font-size:16px;font-weight:600;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;margin-bottom:16px}',
        '.bilan-titre-input:focus{outline:none;border-color:var(--bleu-clair,#6aacb8)}',

        /* Bloc thématique */
        '.bilan-bloc{margin-bottom:12px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-grand,12px);overflow:hidden;transition:opacity .2s}',
        '.bilan-bloc.inactif{opacity:.45}',
        '.bilan-bloc-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bleu-tres-pale,#142428);cursor:pointer;user-select:none;gap:8px}',
        '.bilan-bloc-gauche{display:flex;align-items:center;gap:10px;flex:1;min-width:0}',
        '.bilan-bloc-titre{font-size:15px;font-weight:600;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-bloc-badge{font-size:11px;color:var(--texte-secondaire,#8aa4b0);white-space:nowrap}',
        '.bilan-toggle{position:relative;width:40px;height:22px;background:rgba(106,172,184,.2);border-radius:11px;cursor:pointer;transition:background .2s;flex-shrink:0;border:none}',
        '.bilan-toggle.actif{background:var(--vert-succes,#34c759)}',
        '.bilan-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s}',
        '.bilan-toggle.actif::after{transform:translateX(18px)}',
        '.bilan-bloc-body{padding:8px 16px 12px;display:none}',
        '.bilan-bloc.ouvert .bilan-bloc-body{display:block}',

        /* Question */
        '.bilan-question{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid rgba(106,172,184,.08)}',
        '.bilan-question:last-child{border-bottom:none}',
        '.bilan-question-num{font-size:12px;color:var(--texte-secondaire,#8aa4b0);min-width:20px;padding-top:2px}',
        '.bilan-question-texte{flex:1;font-size:14px;color:var(--texte-principal,#d0e0e4);line-height:1.4}',
        '.bilan-question-type{font-size:11px;color:var(--texte-secondaire,#8aa4b0);padding:2px 8px;background:var(--bleu-pale,#1a3040);border-radius:var(--radius-petit,5px);white-space:nowrap;align-self:center}',
        '.bilan-question-actions{display:flex;gap:2px;align-self:center}',
        '.bilan-btn-mini{padding:4px 6px;border:none;background:transparent;cursor:pointer;color:var(--texte-secondaire,#8aa4b0);border-radius:var(--radius-petit,5px);font-size:13px;line-height:1}',
        '.bilan-btn-mini:hover{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',

        /* Édition inline */
        '.bilan-edit-input{width:100%;padding:6px 10px;font-size:14px;border:1px solid var(--bleu-clair,#6aacb8);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',

        /* Section questions personnalisées */
        '.bilan-perso-section{margin-top:16px;padding:16px;border:1px dashed rgba(106,172,184,.2);border-radius:var(--radius-grand,12px)}',
        '.bilan-perso-titre{font-size:14px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);margin-bottom:8px}',

        /* Ajout question */
        '.bilan-ajout-form{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}',
        '.bilan-ajout-input{flex:1;min-width:200px;padding:8px 12px;font-size:14px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',
        '.bilan-ajout-select{padding:8px 12px;font-size:13px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',

        /* Import */
        '.bilan-import-zone{border:2px dashed rgba(106,172,184,.25);border-radius:var(--radius-grand,12px);padding:40px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:20px}',
        '.bilan-import-zone:hover{border-color:var(--bleu-clair,#6aacb8);background:var(--bleu-tres-pale,#142428)}',
        '.bilan-import-icone{font-size:40px;margin-bottom:10px;opacity:.6}',
        '.bilan-import-texte{font-size:14px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-import-texte strong{color:var(--texte-principal,#d0e0e4)}',
        '.bilan-mapping-table{width:100%;border-collapse:collapse;margin:16px 0}',
        '.bilan-mapping-table th{padding:8px 12px;text-align:left;font-weight:600;color:var(--texte-secondaire,#8aa4b0);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(106,172,184,.15)}',
        '.bilan-mapping-table td{padding:8px 12px;border-bottom:1px solid rgba(106,172,184,.08);font-size:13px;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-mapping-match{color:var(--vert-succes,#34c759)}',
        '.bilan-mapping-ignore{color:var(--texte-secondaire,#8aa4b0);font-style:italic}',
        '.bilan-mapping-select{padding:4px 8px;font-size:12px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;max-width:300px}',

        /* Rapport */
        '.bilan-rapport-section{margin-bottom:28px}',
        '.bilan-rapport-titre{font-size:16px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--bleu-clair,#6aacb8)}',
        '.bilan-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px}',
        '.bilan-stat-carte{padding:16px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-grand,12px);text-align:center;border:1px solid rgba(106,172,184,.1)}',
        '.bilan-stat-valeur{font-size:28px;font-weight:700;color:var(--bleu-clair,#6aacb8)}',
        '.bilan-stat-label{font-size:12px;color:var(--texte-secondaire,#8aa4b0);margin-top:4px}',
        '.bilan-canvas-wrapper{position:relative;width:100%;margin:12px 0}',
        '.bilan-signal{display:inline-block;padding:4px 10px;border-radius:var(--radius-pill,20px);font-size:12px;font-weight:600;margin:4px}',
        '.bilan-signal-fort{background:rgba(52,199,89,.15);color:var(--vert-succes,#34c759)}',
        '.bilan-signal-faible{background:rgba(232,64,87,.15);color:var(--rouge-erreur,#e84057)}',
        '.bilan-reponse-ouverte{padding:10px 14px;margin:6px 0;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-moyen,6px);font-size:13px;color:var(--texte-principal,#d0e0e4);border-left:3px solid var(--bleu-clair,#6aacb8);line-height:1.4}',
        '.bilan-synthese-item{padding:12px 16px;margin:8px 0;border-radius:var(--radius-moyen,6px)}',
        '.bilan-synthese-force{background:rgba(52,199,89,.08);border-left:4px solid var(--vert-succes,#34c759)}',
        '.bilan-synthese-vigilance{background:rgba(232,64,87,.08);border-left:4px solid var(--rouge-erreur,#e84057)}',
        '.bilan-synthese-titre{font-weight:600;font-size:14px;margin-bottom:4px}',
        '.bilan-synthese-detail{font-size:13px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-vide{text-align:center;padding:40px 20px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-vide-icone{font-size:40px;margin-bottom:10px;opacity:.5}',

        /* Boutons */
        '.bilan-btn{padding:8px 16px;border:none;border-radius:var(--radius-moyen,6px);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .2s}',
        '.bilan-btn-principal{background:var(--bleu-clair,#6aacb8);color:#fff}',
        '.bilan-btn-principal:hover{filter:brightness(1.1)}',
        '.bilan-btn-secondaire{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',
        '.bilan-btn-secondaire:hover{background:var(--bleu-carte,#1a3a48)}',
        '.bilan-btn-danger{background:transparent;color:var(--rouge-erreur,#e84057);border:1px solid var(--rouge-erreur,#e84057)}',
        '.bilan-btn-danger:hover{background:var(--rouge-erreur,#e84057);color:#fff}',

        /* Confirmation toast */
        '.bilan-toast{position:fixed;bottom:20px;right:20px;padding:12px 20px;background:var(--vert-succes,#34c759);color:#fff;border-radius:var(--radius-moyen,6px);font-size:14px;z-index:9999;opacity:0;transform:translateY(10px);transition:all .3s;pointer-events:none}',
        '.bilan-toast.visible{opacity:1;transform:translateY(0)}',

        /* Parcours — Activités */
        '.bilan-activite{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:8px;background:var(--bleu-tres-pale,#142428);border:1px solid rgba(106,172,184,.12);border-radius:var(--radius-moyen,6px);transition:background .15s}',
        '.bilan-activite:hover{background:var(--bleu-pale,#1a3040)}',
        '.bilan-activite-num{font-size:12px;font-weight:700;color:var(--texte-secondaire,#8aa4b0);min-width:22px}',
        '.bilan-activite-titre{flex:1;font-size:14px;color:var(--texte-principal,#d0e0e4);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.bilan-activite-type{font-size:11px;padding:2px 8px;border-radius:var(--radius-petit,5px);white-space:nowrap}',
        '.bilan-type-production{background:rgba(106,172,184,.15);color:var(--bleu-clair,#6aacb8)}',
        '.bilan-type-cours{background:rgba(200,160,96,.15);color:var(--orange-accent,#c8a060)}',
        '.bilan-type-evenement{background:rgba(58,170,138,.15);color:var(--vert-leger,#3aaa8a)}',

        /* Parcours — Émotions (chips) */
        '.bilan-emotions-list{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}',
        '.bilan-emotion-tag{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;background:var(--bleu-pale,#1a3040);border:1px solid rgba(106,172,184,.12);border-radius:var(--radius-pill,20px);font-size:13px;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-emotion-tag .bilan-btn-mini{font-size:11px;padding:1px 3px;margin-left:2px}',

        /* Parcours — Questions transversales */
        '.bilan-transversale{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(106,172,184,.08)}',
        '.bilan-transversale:last-child{border-bottom:none}',
        '.bilan-transversale-texte{flex:1;font-size:13px;color:var(--texte-principal,#d0e0e4);line-height:1.4}',

        /* Parcours — Bannière info */
        '.bilan-info{padding:12px 16px;background:rgba(106,172,184,.08);border-left:3px solid var(--bleu-clair,#6aacb8);border-radius:0 var(--radius-moyen,6px) var(--radius-moyen,6px) 0;margin-bottom:16px;font-size:13px;color:var(--texte-secondaire,#8aa4b0);line-height:1.5}',

        /* Panneau d'aide repliable */
        '.bilan-info-aide{padding:0;border:1px solid rgba(106,172,184,.12);border-left:3px solid var(--bleu-clair,#6aacb8);border-radius:0 var(--radius-moyen,6px) var(--radius-moyen,6px) 0;margin-bottom:16px;overflow:hidden;background:rgba(106,172,184,.05)}',
        '.bilan-aide-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;user-select:none}',
        '.bilan-aide-header:hover{background:rgba(106,172,184,.06)}',
        '.bilan-aide-titre{font-size:13px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);display:flex;align-items:center;gap:6px}',
        '.bilan-aide-chevron{font-size:11px;color:var(--texte-secondaire,#8aa4b0);transition:transform .2s}',
        '.bilan-aide-body{padding:0 14px 14px;font-size:13px;color:var(--texte-secondaire,#8aa4b0);line-height:1.6}',
        '.bilan-aide-body ol{margin:6px 0 10px;padding-left:20px}',
        '.bilan-aide-body li{margin-bottom:4px}',
        '.bilan-aide-body li strong{color:var(--texte-principal,#d0e0e4)}',
        '.bilan-aide-astuce{margin-top:10px;padding:8px 12px;background:rgba(106,172,184,.06);border-radius:var(--radius-petit,5px);font-size:12px;font-style:italic}',
        '.bilan-info-aide.replie .bilan-aide-body{display:none}',
        '.bilan-info-aide.replie .bilan-aide-chevron{transform:rotate(-90deg)}',

        /* Parcours — Sous-sections */
        '.bilan-sous-titre{font-size:14px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(106,172,184,.1)}'
    ].join('\n');
    document.head.appendChild(style);
}

/* ===============================
   SECTION 1 : ÉTAT ET CONSTANTES
   =============================== */

var etat = {
    vue: 'editeur',
    questionnaire: null,
    parcours: null,
    resultats: null,
    graphiques: {},
    blocOuvert: null,
    questionEnEdition: null,
    activiteEnEdition: null,
    mappingImport: null,
    donneesCSVParsees: null
};

var CLE_QUESTIONNAIRE = function() { return window.cle ? window.cle('questionnaireBilan') : 'questionnaireBilan'; };
var CLE_RESULTATS = function() { return window.cle ? window.cle('resultatsBilan') : 'resultatsBilan'; };
var CLE_PARCOURS = function() { return window.cle ? window.cle('parcoursBilan') : 'parcoursBilan'; };

function genId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

/* ===============================
   SECTION 2 : INITIALISATION ET NAVIGATION
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
    } else {
        etat.parcours = BILAN_REFLEXIF_DATA.creerParcoursVide();
        sauvegarderParcours();
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
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="import">Importer les r\u00e9sultats</button>',
            '<button class="bilan-nav-btn" data-action="BilanReflexif.afficherVue" data-param="rapport"' + (hasResultats ? '' : ' disabled') + '>Rapport d\u2019analyse</button>',
        '</div>',
        '<div id="bilan-vue-editeur" class="bilan-vue"></div>',
        '<div id="bilan-vue-parcours" class="bilan-vue"></div>',
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
    if (nomVue === 'editeur') rendreEditeur();
    else if (nomVue === 'parcours') rendreParcours();
    else if (nomVue === 'import') rendreImport();
    else if (nomVue === 'rapport' && etat.resultats) rendreRapport();
}

function afficherToast(message) {
    var toast = document.getElementById('bilan-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 2500);
}

/* ===============================
   SECTION 3 : ÉDITEUR DE QUESTIONNAIRE
   =============================== */

function rendreEditeur() {
    var vue = document.getElementById('bilan-vue-editeur');
    if (!vue) return;

    var q = etat.questionnaire;
    var html = [];

    // Titre du questionnaire
    html.push('<input type="text" class="bilan-titre-input" id="bilan-titre" value="' + echapperHtml(q.titre) + '" data-on-change="BilanReflexif.modifierTitre" placeholder="Titre du questionnaire">');

    // Barre d'actions
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.exporterTexte">Copier les questions</button>');
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

            html.push('<span class="bilan-question-type">' + (qp.type === 'likert4' ? 'Likert' : 'Ouvert') + '</span>');
            html.push('<div class="bilan-question-actions">');

            if (etat.questionEnEdition === qp.id) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerEdition" data-param="perso" data-param2="' + qp.id + '" title="Confirmer">\u2713</button>');
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerEdition" title="Annuler">\u2717</button>');
            } else {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.editerQuestion" data-param="perso" data-param2="' + qp.id + '" title="Modifier">\u270E</button>');
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestion" data-param="perso" data-param2="' + qp.id + '" data-confirm="Supprimer cette question ?" title="Supprimer">\u2715</button>');
            }

            html.push('</div>');
            html.push('</div>');
        }
    }
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-perso-input" placeholder="Ajouter une question personnalis\u00e9e\u2026">');
    html.push('<select class="bilan-ajout-select" id="bilan-perso-type">');
    html.push('<option value="likert4">Likert 4 niveaux</option>');
    html.push('<option value="ouvert">R\u00e9ponse ouverte</option>');
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterPerso">Ajouter</button>');
    html.push('</div>');
    html.push('</div>');

    vue.innerHTML = html.join('');
}

function rendreBlocHTML(bloc, indexBloc) {
    var estOuvert = etat.blocOuvert === bloc.id;
    var nbQuestions = bloc.questions.length;
    var nbLikert = 0;
    var nbOuvert = 0;
    for (var i = 0; i < nbQuestions; i++) {
        if (bloc.questions[i].type === 'likert4') nbLikert++;
        else nbOuvert++;
    }

    var html = [];
    html.push('<div class="bilan-bloc' + (bloc.actif ? '' : ' inactif') + (estOuvert ? ' ouvert' : '') + '" data-bloc="' + bloc.id + '">');

    // Header
    html.push('<div class="bilan-bloc-header">');
    html.push('<div class="bilan-bloc-gauche" data-action="BilanReflexif.toggleOuverture" data-param="' + bloc.id + '">');
    html.push('<span style="font-size:12px;color:var(--texte-secondaire)">' + (estOuvert ? '\u25BC' : '\u25B6') + '</span>');
    html.push('<span class="bilan-bloc-titre">' + echapperHtml(bloc.titre) + '</span>');
    html.push('<span class="bilan-bloc-badge">' + nbLikert + ' Likert' + (nbOuvert > 0 ? ' + ' + nbOuvert + ' ouverte' + (nbOuvert > 1 ? 's' : '') : '') + '</span>');
    html.push('</div>');
    html.push('<button class="bilan-toggle' + (bloc.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleBloc" data-param="' + bloc.id + '" title="' + (bloc.actif ? 'D\u00e9sactiver' : 'Activer') + '"></button>');
    html.push('</div>');

    // Body (questions)
    html.push('<div class="bilan-bloc-body">');
    for (var j = 0; j < bloc.questions.length; j++) {
        var q = bloc.questions[j];
        html.push('<div class="bilan-question">');
        html.push('<span class="bilan-question-num">' + (j + 1) + '.</span>');

        if (etat.questionEnEdition === q.id) {
            html.push('<input type="text" class="bilan-edit-input" id="bilan-edit-' + q.id + '" value="' + echapperHtml(q.texte) + '" data-on-keyup="BilanReflexif.validerEditionKeyup">');
        } else {
            html.push('<span class="bilan-question-texte">' + echapperHtml(q.texte) + '</span>');
        }

        html.push('<span class="bilan-question-type">' + (q.type === 'likert4' ? 'Likert' : 'Ouvert') + '</span>');
        html.push('<div class="bilan-question-actions">');

        if (etat.questionEnEdition === q.id) {
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerEdition" data-param="' + bloc.id + '" data-param2="' + q.id + '" title="Confirmer">\u2713</button>');
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerEdition" title="Annuler">\u2717</button>');
        } else {
            if (j > 0) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-param3="-1" title="Monter">\u2191</button>');
            }
            if (j < bloc.questions.length - 1) {
                html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-param3="1" title="Descendre">\u2193</button>');
            }
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.editerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" title="Modifier">\u270E</button>');
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestion" data-param="' + bloc.id + '" data-param2="' + q.id + '" data-confirm="Supprimer cette question ?" title="Supprimer">\u2715</button>');
        }

        html.push('</div>');
        html.push('</div>');
    }

    // Bouton ajouter une question au bloc
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-ajout-' + bloc.id + '" placeholder="Ajouter une question\u2026">');
    html.push('<select class="bilan-ajout-select" id="bilan-ajout-type-' + bloc.id + '">');
    html.push('<option value="likert4">Likert</option>');
    html.push('<option value="ouvert">Ouvert</option>');
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterQuestionBloc" data-param="' + bloc.id + '">Ajouter</button>');
    html.push('</div>');

    html.push('</div>'); // fin bloc-body
    html.push('</div>'); // fin bloc

    return html.join('');
}

// === Actions éditeur ===

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

    bloc.questions.push({
        id: 'q_' + genId(),
        texte: input.value.trim(),
        type: typeSelect ? typeSelect.value : 'likert4',
        obligatoire: false,
        personnalisee: true
    });

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

    etat.questionnaire.questionsPersonnalisees.push({
        id: 'q_perso_' + genId(),
        texte: input.value.trim(),
        type: typeSelect ? typeSelect.value : 'likert4',
        bloc: null
    });

    etat.questionnaire.dateModification = new Date().toISOString();
    sauvegarderQuestionnaire();
    rendreEditeur();
}

function reinitialiserDemo() {
    if (!confirm('Remplacer le questionnaire actuel par le mod\u00e8le d\u2019origine\u00a0?')) return;
    etat.questionnaire = BILAN_REFLEXIF_DATA.creerQuestionnaireDemoComplet();
    etat.blocOuvert = null;
    sauvegarderQuestionnaire();
    rendreEditeur();
    afficherToast('Mod\u00e8le r\u00e9initialis\u00e9');
}

function exporterTexte() {
    var q = etat.questionnaire;
    if (!q) return;

    var lignes = [];
    lignes.push('=== BILAN R\u00c9FLEXIF \u2014 ' + q.titre + ' ===');
    lignes.push('');

    var num = 1;
    var echelleTexte = '   [ ] Tout \u00e0 fait d\u2019accord  [ ] Plut\u00f4t d\u2019accord  [ ] Plut\u00f4t en d\u00e9saccord  [ ] Pas du tout d\u2019accord';

    for (var i = 0; i < q.blocs.length; i++) {
        var bloc = q.blocs[i];
        if (!bloc.actif) continue;

        lignes.push('SECTION : ' + bloc.titre);
        for (var j = 0; j < bloc.questions.length; j++) {
            var question = bloc.questions[j];
            lignes.push(num + '. ' + question.texte);
            if (question.type === 'likert4') {
                lignes.push(echelleTexte);
            } else {
                lignes.push('   [R\u00e9ponse libre]');
            }
            num++;
        }
        lignes.push('');
    }

    // Questions personnalisées
    if (q.questionsPersonnalisees && q.questionsPersonnalisees.length > 0) {
        lignes.push('SECTION : Questions suppl\u00e9mentaires');
        for (var k = 0; k < q.questionsPersonnalisees.length; k++) {
            var qp = q.questionsPersonnalisees[k];
            lignes.push(num + '. ' + qp.texte);
            if (qp.type === 'likert4') {
                lignes.push(echelleTexte);
            } else {
                lignes.push('   [R\u00e9ponse libre]');
            }
            num++;
        }
    }

    var texte = lignes.join('\n');
    try {
        navigator.clipboard.writeText(texte).then(function() {
            afficherToast('Questions copi\u00e9es dans le presse-papier');
        });
    } catch (err) {
        // Fallback pour Safari file://
        var ta = document.createElement('textarea');
        ta.value = texte;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        afficherToast('Questions copi\u00e9es');
    }
}

// === Panneau d'aide ===

function rendreAideHTML(cle, titre, contenu) {
    var lsKey = 'bilan_aide_' + cle;
    var replie = false;
    try { replie = localStorage.getItem(lsKey) === '1'; } catch (e) { /* ignore */ }

    var html = [];
    html.push('<div class="bilan-info-aide' + (replie ? ' replie' : '') + '" id="bilan-aide-' + cle + '">');
    html.push('<div class="bilan-aide-header" data-action="BilanReflexif.toggleAide" data-param="' + cle + '">');
    html.push('<span class="bilan-aide-titre">\u2753 ' + titre + '</span>');
    html.push('<span class="bilan-aide-chevron">\u25BC</span>');
    html.push('</div>');
    html.push('<div class="bilan-aide-body">' + contenu + '</div>');
    html.push('</div>');
    return html.join('');
}

function toggleAide(cle) {
    var panneau = document.getElementById('bilan-aide-' + cle);
    if (!panneau) return;
    var lsKey = 'bilan_aide_' + cle;
    var estReplie = panneau.classList.contains('replie');
    panneau.classList.toggle('replie');
    try { localStorage.setItem(lsKey, estReplie ? '0' : '1'); } catch (e) { /* ignore */ }
}

// === Utilitaires éditeur ===

function trouverBloc(blocId) {
    for (var i = 0; i < etat.questionnaire.blocs.length; i++) {
        if (etat.questionnaire.blocs[i].id === blocId) return etat.questionnaire.blocs[i];
    }
    return null;
}

function trouverQuestion(blocId, questionId) {
    var bloc = trouverBloc(blocId);
    if (!bloc) return null;
    for (var i = 0; i < bloc.questions.length; i++) {
        if (bloc.questions[i].id === questionId) return bloc.questions[i];
    }
    return null;
}

function trouverQuestionPerso(questionId) {
    var perso = etat.questionnaire.questionsPersonnalisees;
    if (!perso) return null;
    for (var i = 0; i < perso.length; i++) {
        if (perso[i].id === questionId) return perso[i];
    }
    return null;
}

function sauvegarderQuestionnaire() {
    db.setSync(CLE_QUESTIONNAIRE(), etat.questionnaire);
}

/* ===============================
   SECTION 3b : ÉDITEUR DU PARCOURS D'APPRENTISSAGE
   =============================== */

function rendreParcours() {
    var vue = document.getElementById('bilan-vue-parcours');
    if (!vue) return;

    var p = etat.parcours;
    var html = [];

    // Bannière de recommandation
    html.push('<div class="bilan-info">');
    html.push('S\u00e9lectionne <strong>5 \u00e0 7 activit\u00e9s marquantes</strong> du trimestre plut\u00f4t que l\u2019int\u00e9gralit\u00e9. ');
    html.push('Le parcours est un formulaire <strong>s\u00e9par\u00e9</strong> du questionnaire Likert \u2014 il sera distribu\u00e9 ind\u00e9pendamment.');
    html.push('</div>');

    // Barre d'actions
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.exporterTexteParcours">Copier le formulaire</button>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.importerProductions">Importer depuis les productions</button>');
    html.push('</div>');

    // Panneau d'aide — distribution du parcours
    html.push(rendreAideHTML('parcours',
        'Comment distribuer le parcours\u00a0?',
        '<ol>' +
        '<li><strong>Copie le formulaire</strong> \u2014 Clique sur \u00ab\u00a0Copier le formulaire\u00a0\u00bb. Le texte complet (activit\u00e9s + questions de synth\u00e8se) est copi\u00e9.</li>' +
        '<li><strong>Cr\u00e9e un formulaire s\u00e9par\u00e9</strong> \u2014 Le parcours est un formulaire distinct du questionnaire Likert. Distribue-les s\u00e9par\u00e9ment pour \u00e9viter la fatigue de r\u00e9ponse.</li>' +
        '<li><strong>Pour chaque activit\u00e9, cr\u00e9e une section</strong> avec\u00a0: compl\u00e9tion (choix unique\u00a0: Oui / Partiellement / Non), raison si non compl\u00e9t\u00e9e (texte court, conditionnel si possible), effort per\u00e7u (\u00e9chelle 1-5 ou choix unique), \u00e9motion dominante (choix multiples, 1-2 parmi la liste), moment marquant (texte long, optionnel).</li>' +
        '<li><strong>Ajoute les questions de synth\u00e8se</strong> en fin de formulaire.</li>' +
        '<li><strong>Configure l\u2019anonymat</strong> et distribue le lien.</li>' +
        '<li><strong>Exporte en CSV</strong> et importe dans l\u2019onglet \u00ab\u00a0Importer les r\u00e9sultats\u00a0\u00bb.</li>' +
        '</ol>'
    ));

    // === Liste des activités ===
    html.push('<div class="bilan-sous-titre">Activit\u00e9s d\u2019apprentissage (' + p.activites.length + ')</div>');

    if (p.activites.length === 0) {
        html.push('<div class="bilan-vide" style="padding:20px">');
        html.push('<p>Aucune activit\u00e9 configur\u00e9e. Ajoute des activit\u00e9s manuellement ou importe-les depuis tes productions.</p>');
        html.push('</div>');
    } else {
        for (var i = 0; i < p.activites.length; i++) {
            html.push(rendreActiviteHTML(p.activites[i], i));
        }
    }

    // Formulaire d'ajout d'activité
    html.push('<div class="bilan-ajout-form" style="margin-top:12px">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-parcours-titre-input" placeholder="Titre de l\u2019activit\u00e9 (ex: Analyse litt\u00e9raire \u2014 Le Survenant)">');
    html.push('<select class="bilan-ajout-select" id="bilan-parcours-type-input">');
    var types = BILAN_REFLEXIF_DATA.TYPES_ACTIVITE;
    for (var t = 0; t < types.length; t++) {
        html.push('<option value="' + types[t].id + '">' + echapperHtml(types[t].label) + '</option>');
    }
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterActivite">Ajouter</button>');
    html.push('</div>');

    // === Émotions disponibles ===
    html.push('<div class="bilan-sous-titre">\u00c9motions propos\u00e9es aux \u00e9tudiants (' + p.emotionsDisponibles.length + ')</div>');
    html.push('<div class="bilan-emotions-list">');
    for (var e = 0; e < p.emotionsDisponibles.length; e++) {
        html.push('<span class="bilan-emotion-tag">');
        html.push(echapperHtml(p.emotionsDisponibles[e]));
        html.push(' <button class="bilan-btn-mini" data-action="BilanReflexif.supprimerEmotion" data-param="' + e + '" title="Retirer">\u2715</button>');
        html.push('</span>');
    }
    html.push('</div>');
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-emotion-input" placeholder="Ajouter une \u00e9motion\u2026" style="max-width:250px">');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterEmotion">Ajouter</button>');
    html.push('</div>');

    // === Questions transversales ===
    html.push('<div class="bilan-sous-titre">Questions de synth\u00e8se (fin du parcours)</div>');
    var qTrans = BILAN_REFLEXIF_DATA.QUESTIONS_TRANSVERSALES;
    for (var q = 0; q < qTrans.length; q++) {
        var qt = qTrans[q];
        var actif = p.questionsTransversales[qt.id] !== false;
        html.push('<div class="bilan-transversale">');
        html.push('<button class="bilan-toggle' + (actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleTransversale" data-param="' + qt.id + '" title="' + (actif ? 'D\u00e9sactiver' : 'Activer') + '"></button>');
        html.push('<span class="bilan-transversale-texte' + (actif ? '' : '" style="opacity:.45') + '">' + echapperHtml(qt.texte) + '</span>');
        html.push('</div>');
    }

    vue.innerHTML = html.join('');
}

function rendreActiviteHTML(activite, index) {
    var html = [];
    var typeClasse = 'bilan-type-' + (activite.type || 'production');
    var typeLabel = '';
    var types = BILAN_REFLEXIF_DATA.TYPES_ACTIVITE;
    for (var t = 0; t < types.length; t++) {
        if (types[t].id === activite.type) { typeLabel = types[t].label; break; }
    }

    html.push('<div class="bilan-activite" data-activite="' + activite.id + '">');
    html.push('<span class="bilan-activite-num">' + (index + 1) + '.</span>');

    if (etat.activiteEnEdition === activite.id) {
        html.push('<input type="text" class="bilan-edit-input" id="bilan-edit-act-' + activite.id + '" value="' + echapperHtml(activite.titre) + '" style="flex:1">');
        html.push('<select class="bilan-ajout-select" id="bilan-edit-type-' + activite.id + '">');
        for (var ts = 0; ts < types.length; ts++) {
            html.push('<option value="' + types[ts].id + '"' + (types[ts].id === activite.type ? ' selected' : '') + '>' + echapperHtml(types[ts].label) + '</option>');
        }
        html.push('</select>');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerModifActivite" data-param="' + activite.id + '" title="Confirmer">\u2713</button>');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerModifActivite" title="Annuler">\u2717</button>');
    } else {
        html.push('<span class="bilan-activite-titre">' + echapperHtml(activite.titre) + '</span>');
        html.push('<span class="bilan-activite-type ' + typeClasse + '">' + echapperHtml(typeLabel) + '</span>');
        html.push('<div class="bilan-question-actions">');
        if (index > 0) {
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerActivite" data-param="' + activite.id + '" data-param2="-1" title="Monter">\u2191</button>');
        }
        if (index < etat.parcours.activites.length - 1) {
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.deplacerActivite" data-param="' + activite.id + '" data-param2="1" title="Descendre">\u2193</button>');
        }
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.modifierActivite" data-param="' + activite.id + '" title="Modifier">\u270E</button>');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerActivite" data-param="' + activite.id + '" data-confirm="Supprimer cette activit\u00e9 ?" title="Supprimer">\u2715</button>');
        html.push('</div>');
    }

    html.push('</div>');
    return html.join('');
}

// === Actions parcours ===

function ajouterActivite() {
    var input = document.getElementById('bilan-parcours-titre-input');
    var typeInput = document.getElementById('bilan-parcours-type-input');
    if (!input || !input.value.trim()) return;

    etat.parcours.activites.push({
        id: 'act_' + genId(),
        titre: input.value.trim(),
        type: typeInput ? typeInput.value : 'production',
        ordre: etat.parcours.activites.length + 1
    });

    sauvegarderParcours();
    rendreParcours();
}

function modifierActivite(actId) {
    etat.activiteEnEdition = actId;
    rendreParcours();
    setTimeout(function() {
        var input = document.getElementById('bilan-edit-act-' + actId);
        if (input) { input.focus(); input.select(); }
    }, 50);
}

function confirmerModifActivite(actId) {
    var input = document.getElementById('bilan-edit-act-' + actId);
    var typeInput = document.getElementById('bilan-edit-type-' + actId);
    if (!input || !input.value.trim()) return;

    var act = trouverActivite(actId);
    if (act) {
        act.titre = input.value.trim();
        if (typeInput) act.type = typeInput.value;
    }

    etat.activiteEnEdition = null;
    sauvegarderParcours();
    rendreParcours();
}

function annulerModifActivite() {
    etat.activiteEnEdition = null;
    rendreParcours();
}

function supprimerActivite(actId) {
    var activites = etat.parcours.activites;
    for (var i = 0; i < activites.length; i++) {
        if (activites[i].id === actId) {
            activites.splice(i, 1);
            break;
        }
    }
    recalculerOrdreActivites();
    sauvegarderParcours();
    rendreParcours();
}

function deplacerActivite(actId, direction) {
    var activites = etat.parcours.activites;
    var idx = -1;
    for (var i = 0; i < activites.length; i++) {
        if (activites[i].id === actId) { idx = i; break; }
    }
    if (idx < 0) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= activites.length) return;

    var temp = activites[idx];
    activites[idx] = activites[newIdx];
    activites[newIdx] = temp;

    recalculerOrdreActivites();
    sauvegarderParcours();
    rendreParcours();
}

function importerProductions() {
    var productions = [];
    try {
        productions = db.getSync(window.cle ? window.cle('productions') : 'productions', []) || [];
    } catch (e) {
        productions = [];
    }

    if (!productions || productions.length === 0) {
        afficherToast('Aucune production trouv\u00e9e dans l\u2019application');
        return;
    }

    // Vérifier les doublons avec les activités existantes
    var titresExistants = {};
    for (var e = 0; e < etat.parcours.activites.length; e++) {
        titresExistants[etat.parcours.activites[e].titre.toLowerCase()] = true;
    }

    var nbAjoutees = 0;
    for (var i = 0; i < productions.length; i++) {
        var prod = productions[i];
        var titre = prod.titre || prod.description || prod.nom || ('Production ' + (i + 1));
        if (titresExistants[titre.toLowerCase()]) continue;

        etat.parcours.activites.push({
            id: 'act_' + genId(),
            titre: titre,
            type: 'production',
            ordre: etat.parcours.activites.length + 1
        });
        titresExistants[titre.toLowerCase()] = true;
        nbAjoutees++;
    }

    if (nbAjoutees === 0) {
        afficherToast('Toutes les productions sont d\u00e9j\u00e0 dans la liste');
    } else {
        sauvegarderParcours();
        rendreParcours();
        afficherToast(nbAjoutees + ' production' + (nbAjoutees > 1 ? 's import\u00e9es' : ' import\u00e9e'));
    }
}

function ajouterEmotion() {
    var input = document.getElementById('bilan-emotion-input');
    if (!input || !input.value.trim()) return;

    var emotion = input.value.trim();
    // Vérifier les doublons (insensible à la casse)
    var existe = etat.parcours.emotionsDisponibles.some(function(e) {
        return e.toLowerCase() === emotion.toLowerCase();
    });
    if (existe) {
        afficherToast('Cette \u00e9motion existe d\u00e9j\u00e0');
        return;
    }

    etat.parcours.emotionsDisponibles.push(emotion);
    sauvegarderParcours();
    rendreParcours();
}

function supprimerEmotion(index) {
    if (index < 0 || index >= etat.parcours.emotionsDisponibles.length) return;
    etat.parcours.emotionsDisponibles.splice(index, 1);
    sauvegarderParcours();
    rendreParcours();
}

function toggleTransversale(cleQuestion) {
    var qt = etat.parcours.questionsTransversales;
    qt[cleQuestion] = !qt[cleQuestion];
    sauvegarderParcours();
    rendreParcours();
}

function exporterTexteParcours() {
    var p = etat.parcours;
    if (!p || p.activites.length === 0) {
        afficherToast('Ajoute des activit\u00e9s avant d\u2019exporter');
        return;
    }

    var lignes = [];
    lignes.push('=== PARCOURS D\u2019APPRENTISSAGE ===');
    lignes.push('');
    lignes.push('Pour chaque activit\u00e9 ci-dessous, r\u00e9ponds aux questions.');
    lignes.push('');

    // Par activité
    for (var i = 0; i < p.activites.length; i++) {
        var act = p.activites[i];
        lignes.push('--- ' + act.titre + ' ---');
        lignes.push('a) As-tu compl\u00e9t\u00e9 cette activit\u00e9\u00a0?');
        lignes.push('   [ ] Oui  [ ] Partiellement  [ ] Non');
        lignes.push('b) Si non ou partiellement, qu\u2019est-ce qui t\u2019a emp\u00each\u00e9\u00a0?');
        lignes.push('   [R\u00e9ponse libre]');
        lignes.push('c) Quel niveau d\u2019effort\u00a0?');
        var effortLabels = BILAN_REFLEXIF_DATA.ECHELLE_EFFORT.map(function(e) { return '[ ] ' + e.label; });
        lignes.push('   ' + effortLabels.join('  '));
        lignes.push('d) Quelle(s) \u00e9motion(s) d\u00e9crivent le mieux ton exp\u00e9rience\u00a0?');
        var emotionLabels = p.emotionsDisponibles.map(function(e) { return '[ ] ' + e; });
        lignes.push('   ' + emotionLabels.join('  '));
        lignes.push('e) Moment marquant\u00a0? (optionnel)');
        lignes.push('   [R\u00e9ponse libre]');
        lignes.push('');
    }

    // Questions transversales
    var qTrans = BILAN_REFLEXIF_DATA.QUESTIONS_TRANSVERSALES;
    var transActives = [];
    for (var q = 0; q < qTrans.length; q++) {
        if (p.questionsTransversales[qTrans[q].id] !== false) {
            transActives.push(qTrans[q]);
        }
    }

    if (transActives.length > 0) {
        lignes.push('=== QUESTIONS DE SYNTH\u00c8SE ===');
        for (var t = 0; t < transActives.length; t++) {
            var qt = transActives[t];
            lignes.push((t + 1) + '. ' + qt.texte);
            if (qt.type === 'choix_multiple_ouvert' && qt.choix) {
                var choixLabels = qt.choix.map(function(c) { return '[ ] ' + c; });
                lignes.push('   ' + choixLabels.join('  '));
                lignes.push('   [R\u00e9ponse libre]');
            } else {
                lignes.push('   [R\u00e9ponse libre]');
            }
        }
    }

    var texte = lignes.join('\n');
    try {
        navigator.clipboard.writeText(texte).then(function() {
            afficherToast('Formulaire du parcours copi\u00e9 dans le presse-papier');
        });
    } catch (err) {
        var ta = document.createElement('textarea');
        ta.value = texte;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        afficherToast('Formulaire du parcours copi\u00e9');
    }
}

// === Utilitaires parcours ===

function trouverActivite(actId) {
    for (var i = 0; i < etat.parcours.activites.length; i++) {
        if (etat.parcours.activites[i].id === actId) return etat.parcours.activites[i];
    }
    return null;
}

function recalculerOrdreActivites() {
    for (var i = 0; i < etat.parcours.activites.length; i++) {
        etat.parcours.activites[i].ordre = i + 1;
    }
}

function sauvegarderParcours() {
    db.setSync(CLE_PARCOURS(), etat.parcours);
}

/* ===============================
   SECTION 4 : PARSEUR CSV ET IMPORT
   =============================== */

function rendreImport() {
    var vue = document.getElementById('bilan-vue-import');
    if (!vue) return;

    var html = [];

    if (!etat.questionnaire || obtenirToutesLesQuestions().length === 0) {
        html.push('<div class="bilan-vide">');
        html.push('<div class="bilan-vide-icone">\u270D</div>');
        html.push('<p>Cr\u00e9e d\u2019abord un questionnaire dans l\u2019onglet \u00ab\u00a0Questionnaire\u00a0\u00bb.</p>');
        html.push('</div>');
        vue.innerHTML = html.join('');
        return;
    }

    // Zone d'import
    html.push('<div class="bilan-import-zone" id="bilan-zone-import" data-action="BilanReflexif.declencherImport">');
    html.push('<div class="bilan-import-icone">\uD83D\uDCC4</div>');
    html.push('<div class="bilan-import-texte"><strong>Cliquer pour s\u00e9lectionner un fichier CSV</strong><br>');
    html.push('Export\u00e9 depuis un formulaire en ligne ou un tableur</div>');
    html.push('</div>');
    html.push('<input type="file" id="bilan-file-input" accept=".csv,.tsv,.txt" style="display:none">');

    // Info résultats existants
    if (etat.resultats) {
        html.push('<div style="padding:12px 16px;background:var(--bleu-tres-pale);border-radius:var(--radius-moyen);margin-bottom:16px;border-left:3px solid var(--vert-succes)">');
        html.push('<strong>R\u00e9sultats import\u00e9s</strong> : ' + etat.resultats.nbRepondants + ' r\u00e9pondants');
        html.push(' (' + echapperHtml(etat.resultats.source) + ')');
        html.push('<br><small style="color:var(--texte-secondaire)">Import\u00e9s le ' + new Date(etat.resultats.dateImport).toLocaleDateString('fr-CA') + '</small>');
        html.push('</div>');
    }

    // Zone de mapping (sera remplie après sélection du fichier)
    html.push('<div id="bilan-mapping-zone"></div>');

    // Bouton charger démo
    html.push('<div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid rgba(106,172,184,.1)">');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.chargerResultatsDemo">Charger les donn\u00e9es de d\u00e9monstration</button>');
    html.push('</div>');

    vue.innerHTML = html.join('');

    // Attacher l'event listener au file input
    var fileInput = document.getElementById('bilan-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                traiterFichierCSV(e.target.files[0]);
            }
        });
    }
}

function declencherImport() {
    var fileInput = document.getElementById('bilan-file-input');
    if (fileInput) fileInput.click();
}

function chargerResultatsDemo() {
    etat.resultats = BILAN_REFLEXIF_DATA.genererResultatsDemo();
    db.setSync(CLE_RESULTATS(), etat.resultats);
    rendreInterface();
    afficherVue('rapport');
    afficherToast('Donn\u00e9es de d\u00e9monstration charg\u00e9es');
}

// === Parseur CSV ===

function traiterFichierCSV(fichier) {
    var reader = new FileReader();

    // Essayer UTF-8 d'abord
    reader.onload = function(e) {
        var texte = e.target.result;

        // Détecter si l'encodage semble corrompu (caractères courants FR)
        if (texte.indexOf('\ufffd') >= 0 || (texte.indexOf('\u00e9') < 0 && texte.indexOf('\\xe9') >= 0)) {
            // Réessayer en ISO-8859-1
            var reader2 = new FileReader();
            reader2.onload = function(e2) {
                traiterContenuCSV(e2.target.result, fichier.name);
            };
            reader2.readAsText(fichier, 'ISO-8859-1');
            return;
        }

        traiterContenuCSV(texte, fichier.name);
    };
    reader.readAsText(fichier, 'UTF-8');
}

function traiterContenuCSV(texte, nomFichier) {
    // Retirer BOM UTF-8
    if (texte.charCodeAt(0) === 0xFEFF) {
        texte = texte.substring(1);
    }

    // Détecter le séparateur
    var separateur = detecterSeparateur(texte);

    // Parser le CSV
    var lignes = parserCSV(texte, separateur);
    if (lignes.length < 2) {
        afficherToast('Le fichier semble vide ou invalide.');
        return;
    }

    var entetes = lignes[0];
    var donnees = lignes.slice(1);

    // Mapper les colonnes aux questions
    var questions = obtenirToutesLesQuestions();
    var mapping = mapperColonnes(entetes, questions);

    etat.donneesCSVParsees = { entetes: entetes, donnees: donnees, nomFichier: nomFichier };
    etat.mappingImport = mapping;

    afficherMapping(entetes, mapping, questions, donnees.length);
}

function detecterSeparateur(texte) {
    var premiereLigne = texte.split('\n')[0] || '';
    var nbVirgules = (premiereLigne.match(/,/g) || []).length;
    var nbPV = (premiereLigne.match(/;/g) || []).length;
    var nbTabs = (premiereLigne.match(/\t/g) || []).length;

    if (nbTabs > nbVirgules && nbTabs > nbPV) return '\t';
    if (nbPV > nbVirgules) return ';';
    return ',';
}

function parserCSV(texte, sep) {
    var lignes = [];
    var ligneCourante = [];
    var champCourant = '';
    var dansGuillemets = false;
    var i = 0;

    while (i < texte.length) {
        var c = texte[i];

        if (dansGuillemets) {
            if (c === '"') {
                if (i + 1 < texte.length && texte[i + 1] === '"') {
                    champCourant += '"';
                    i += 2;
                } else {
                    dansGuillemets = false;
                    i++;
                }
            } else {
                champCourant += c;
                i++;
            }
        } else {
            if (c === '"') {
                dansGuillemets = true;
                i++;
            } else if (c === sep) {
                ligneCourante.push(champCourant.trim());
                champCourant = '';
                i++;
            } else if (c === '\r') {
                i++;
            } else if (c === '\n') {
                ligneCourante.push(champCourant.trim());
                champCourant = '';
                if (ligneCourante.length > 1 || ligneCourante[0] !== '') {
                    lignes.push(ligneCourante);
                }
                ligneCourante = [];
                i++;
            } else {
                champCourant += c;
                i++;
            }
        }
    }

    // Dernière ligne
    if (champCourant || ligneCourante.length > 0) {
        ligneCourante.push(champCourant.trim());
        if (ligneCourante.length > 1 || ligneCourante[0] !== '') {
            lignes.push(ligneCourante);
        }
    }

    return lignes;
}

function normaliserTexte(texte) {
    return (texte || '').toLowerCase()
        .replace(/[\u00e0\u00e2\u00e4]/g, 'a')
        .replace(/[\u00e9\u00e8\u00ea\u00eb]/g, 'e')
        .replace(/[\u00ee\u00ef]/g, 'i')
        .replace(/[\u00f4\u00f6]/g, 'o')
        .replace(/[\u00fb\u00fc]/g, 'u')
        .replace(/\u00e7/g, 'c')
        .replace(/[\u2019\u2018']/g, "'")
        .replace(/[^a-z0-9' ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function similitudeTexte(a, b) {
    var na = normaliserTexte(a);
    var nb = normaliserTexte(b);
    if (na === nb) return 1;

    // Jaccard sur les mots
    var motsA = na.split(' ').filter(function(m) { return m.length > 2; });
    var motsB = nb.split(' ').filter(function(m) { return m.length > 2; });
    if (motsA.length === 0 || motsB.length === 0) return 0;

    var setA = {};
    var setB = {};
    for (var i = 0; i < motsA.length; i++) setA[motsA[i]] = true;
    for (var j = 0; j < motsB.length; j++) setB[motsB[j]] = true;

    var intersection = 0;
    var union = 0;
    var tous = {};
    for (var ma in setA) { if (setA.hasOwnProperty(ma)) tous[ma] = true; }
    for (var mb in setB) { if (setB.hasOwnProperty(mb)) tous[mb] = true; }
    for (var mot in tous) {
        if (!tous.hasOwnProperty(mot)) continue;
        union++;
        if (setA[mot] && setB[mot]) intersection++;
    }

    return union > 0 ? intersection / union : 0;
}

function estColonneIgnoree(entete) {
    var patterns = BILAN_REFLEXIF_DATA.COLONNES_IGNOREES_PATTERNS;
    for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].test(entete.trim())) return true;
    }
    return false;
}

function mapperColonnes(entetes, questions) {
    var mapping = [];

    for (var i = 0; i < entetes.length; i++) {
        var entete = entetes[i];

        if (estColonneIgnoree(entete)) {
            mapping.push({ indexColonne: i, entete: entete, questionId: null, score: 0, ignore: true });
            continue;
        }

        var meilleurScore = 0;
        var meilleureQuestion = null;

        for (var j = 0; j < questions.length; j++) {
            var score = similitudeTexte(entete, questions[j].texte);
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleureQuestion = questions[j];
            }
        }

        if (meilleurScore >= 0.35 && meilleureQuestion) {
            mapping.push({ indexColonne: i, entete: entete, questionId: meilleureQuestion.id, score: meilleurScore, ignore: false });
        } else {
            mapping.push({ indexColonne: i, entete: entete, questionId: null, score: 0, ignore: false });
        }
    }

    return mapping;
}

function obtenirToutesLesQuestions() {
    var questions = [];
    var q = etat.questionnaire;
    if (!q) return questions;

    for (var i = 0; i < q.blocs.length; i++) {
        if (!q.blocs[i].actif) continue;
        for (var j = 0; j < q.blocs[i].questions.length; j++) {
            questions.push(q.blocs[i].questions[j]);
        }
    }
    if (q.questionsPersonnalisees) {
        for (var k = 0; k < q.questionsPersonnalisees.length; k++) {
            questions.push(q.questionsPersonnalisees[k]);
        }
    }
    return questions;
}

function afficherMapping(entetes, mapping, questions, nbLignes) {
    var zone = document.getElementById('bilan-mapping-zone');
    if (!zone) return;

    var html = [];
    html.push('<h3 style="margin:16px 0 8px;color:var(--texte-principal)">Correspondance des colonnes (' + nbLignes + ' r\u00e9ponses d\u00e9tect\u00e9es)</h3>');
    html.push('<table class="bilan-mapping-table">');
    html.push('<thead><tr><th>Colonne CSV</th><th>Question correspondante</th></tr></thead>');
    html.push('<tbody>');

    for (var i = 0; i < mapping.length; i++) {
        var m = mapping[i];
        html.push('<tr>');
        html.push('<td>' + echapperHtml(tronquer(m.entete, 60)) + '</td>');

        if (m.ignore) {
            html.push('<td class="bilan-mapping-ignore">Ignor\u00e9e (m\u00e9tadonn\u00e9e)</td>');
        } else {
            html.push('<td>');
            html.push('<select class="bilan-mapping-select" data-on-change="BilanReflexif.modifierMapping" id="bilan-map-' + i + '">');
            html.push('<option value="">Ignorer cette colonne</option>');
            for (var j = 0; j < questions.length; j++) {
                var selected = (m.questionId === questions[j].id) ? ' selected' : '';
                html.push('<option value="' + questions[j].id + '"' + selected + '>' + echapperHtml(tronquer(questions[j].texte, 80)) + '</option>');
            }
            html.push('</select>');
            if (m.score >= 0.35) {
                html.push(' <span class="bilan-mapping-match">\u2713 ' + Math.round(m.score * 100) + '%</span>');
            }
            html.push('</td>');
        }

        html.push('</tr>');
    }

    html.push('</tbody></table>');
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.confirmerImport">Importer les r\u00e9sultats</button>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.annulerImport">Annuler</button>');
    html.push('</div>');

    zone.innerHTML = html.join('');
}

function modifierMapping(el) {
    if (!el || !el.target) return;
    var select = el.target || el;
    var id = select.id;
    if (!id) return;
    var index = parseInt(id.replace('bilan-map-', ''), 10);
    if (isNaN(index) || !etat.mappingImport || !etat.mappingImport[index]) return;
    etat.mappingImport[index].questionId = select.value || null;
}

function annulerImport() {
    etat.donneesCSVParsees = null;
    etat.mappingImport = null;
    rendreImport();
}

function confirmerImport() {
    if (!etat.donneesCSVParsees || !etat.mappingImport) return;

    var donnees = etat.donneesCSVParsees.donnees;
    var mapping = etat.mappingImport;
    var questions = obtenirToutesLesQuestions();

    // Construire un index question par ID
    var questionsParId = {};
    for (var i = 0; i < questions.length; i++) {
        questionsParId[questions[i].id] = questions[i];
    }

    // Agréger les résultats
    var reponses = {};
    var nbRepondants = donnees.length;

    for (var m = 0; m < mapping.length; m++) {
        var map = mapping[m];
        if (!map.questionId || map.ignore) continue;

        var question = questionsParId[map.questionId];
        if (!question) continue;

        if (question.type === 'likert4') {
            var distribution = {};
            var labels = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
            for (var l = 0; l < labels.length; l++) {
                distribution[labels[l].label] = 0;
            }
            var somme = 0;
            var nbRep = 0;

            for (var r = 0; r < donnees.length; r++) {
                var valeur = (donnees[r][map.indexColonne] || '').trim();
                var valNum = convertirLikert(valeur);
                if (valNum > 0) {
                    var labelCorr = labels.find(function(x) { return x.valeur === valNum; });
                    if (labelCorr) distribution[labelCorr.label]++;
                    somme += valNum;
                    nbRep++;
                }
            }

            reponses[map.questionId] = {
                type: 'likert4',
                distribution: distribution,
                nbReponses: nbRep,
                scoreMoyen: nbRep > 0 ? Math.round((somme / nbRep) * 100) / 100 : 0
            };

        } else if (question.type === 'ouvert') {
            var reps = [];
            for (var ro = 0; ro < donnees.length; ro++) {
                var rep = (donnees[ro][map.indexColonne] || '').trim();
                if (rep) reps.push(rep);
            }
            reponses[map.questionId] = {
                type: 'ouvert',
                reponses: reps,
                nbReponses: reps.length
            };
        }
    }

    etat.resultats = {
        id: 'resultats_' + genId(),
        questionnaireId: etat.questionnaire.id,
        dateImport: new Date().toISOString(),
        source: etat.donneesCSVParsees.nomFichier || 'Import CSV',
        nbRepondants: nbRepondants,
        reponses: reponses
    };

    db.setSync(CLE_RESULTATS(), etat.resultats);
    etat.donneesCSVParsees = null;
    etat.mappingImport = null;

    rendreInterface();
    afficherVue('rapport');
    afficherToast(nbRepondants + ' r\u00e9ponses import\u00e9es');
}

function convertirLikert(valeur) {
    if (!valeur) return 0;
    var norm = valeur.toLowerCase().trim();
    var mapping = BILAN_REFLEXIF_DATA.MAPPING_LIKERT;
    if (mapping.hasOwnProperty(norm)) return mapping[norm];

    // Tentative numérique
    var n = parseFloat(norm);
    if (!isNaN(n) && n >= 1 && n <= 4) return Math.round(n);

    return 0;
}

/* ===============================
   SECTION 5 : RAPPORT D'ANALYSE
   =============================== */

function rendreRapport() {
    var vue = document.getElementById('bilan-vue-rapport');
    if (!vue || !etat.resultats) return;

    // Détruire les graphiques existants
    detruireGraphiques();

    var res = etat.resultats;
    var q = etat.questionnaire;
    var html = [];

    // Bouton export PDF
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.exporterPDF">\u{1F4C4} Exporter en PDF</button>');
    html.push('<button class="bilan-btn bilan-btn-danger" data-action="BilanReflexif.supprimerResultats" data-confirm="Supprimer les r\u00e9sultats import\u00e9s ?">Supprimer les r\u00e9sultats</button>');
    html.push('</div>');

    // === Vue d'ensemble ===
    html.push('<div class="bilan-rapport-section">');
    html.push('<div class="bilan-rapport-titre">Vue d\u2019ensemble</div>');

    var stats = calculerVueEnsemble(res, q);

    html.push('<div class="bilan-stat-grid">');
    html.push('<div class="bilan-stat-carte"><div class="bilan-stat-valeur">' + res.nbRepondants + '</div><div class="bilan-stat-label">R\u00e9pondants</div></div>');
    html.push('<div class="bilan-stat-carte"><div class="bilan-stat-valeur">' + stats.scoreGlobal.toFixed(2) + '</div><div class="bilan-stat-label">Score moyen / 4</div></div>');
    html.push('<div class="bilan-stat-carte"><div class="bilan-stat-valeur">' + stats.tauxFavorable + '%</div><div class="bilan-stat-label">Favorables</div></div>');
    html.push('<div class="bilan-stat-carte"><div class="bilan-stat-valeur">' + stats.nbQuestionsRepondues + '</div><div class="bilan-stat-label">Questions analys\u00e9es</div></div>');
    html.push('</div>');

    // Graphique global
    html.push('<div class="bilan-canvas-wrapper"><canvas id="bilan-chart-global" height="60"></canvas></div>');
    html.push('</div>');

    // === Par bloc thématique ===
    for (var i = 0; i < q.blocs.length; i++) {
        var bloc = q.blocs[i];
        if (!bloc.actif) continue;

        var questionsLikert = [];
        var questionsOuvertes = [];
        for (var j = 0; j < bloc.questions.length; j++) {
            var qb = bloc.questions[j];
            if (res.reponses[qb.id]) {
                if (qb.type === 'likert4') questionsLikert.push(qb);
                else if (qb.type === 'ouvert') questionsOuvertes.push(qb);
            }
        }

        if (questionsLikert.length === 0 && questionsOuvertes.length === 0) continue;

        html.push('<div class="bilan-rapport-section">');
        html.push('<div class="bilan-rapport-titre">' + echapperHtml(bloc.titre));

        // Score moyen du bloc
        if (questionsLikert.length > 0) {
            var scoreBloc = calculerScoreBloc(questionsLikert, res);
            html.push(' <span style="font-size:14px;font-weight:400;color:var(--texte-secondaire)">\u2014 ' + scoreBloc.moyenne.toFixed(2) + ' / 4</span>');
        }
        html.push('</div>');

        // Signaux
        if (questionsLikert.length > 0) {
            var signaux = calculerSignaux(questionsLikert, res);
            if (signaux.fort) html.push('<span class="bilan-signal bilan-signal-fort">\u2713 Signal fort \u2014 ' + signaux.tauxFavorable + '% favorables</span>');
            if (signaux.faible) html.push('<span class="bilan-signal bilan-signal-faible">\u26A0 Signal faible \u2014 ' + signaux.tauxDefavorable + '% d\u00e9favorables</span>');

            // Graphique barres empilées
            var canvasId = 'bilan-chart-' + bloc.id;
            var hauteur = Math.max(questionsLikert.length * 35, 80);
            html.push('<div class="bilan-canvas-wrapper"><canvas id="' + canvasId + '" height="' + hauteur + '"></canvas></div>');
        }

        // Réponses ouvertes
        for (var ro = 0; ro < questionsOuvertes.length; ro++) {
            var qOuv = questionsOuvertes[ro];
            var repOuv = res.reponses[qOuv.id];
            if (!repOuv || !repOuv.reponses || repOuv.reponses.length === 0) continue;

            html.push('<div style="margin-top:12px"><strong style="font-size:13px;color:var(--texte-secondaire)">' + echapperHtml(qOuv.texte) + ' (' + repOuv.nbReponses + ' r\u00e9ponses)</strong></div>');
            for (var rr = 0; rr < repOuv.reponses.length; rr++) {
                html.push('<div class="bilan-reponse-ouverte">' + echapperHtml(repOuv.reponses[rr]) + '</div>');
            }
        }

        html.push('</div>');
    }

    // === Synthèse ===
    html.push(rendreSynthese(q, res));

    vue.innerHTML = html.join('');

    // Créer les graphiques après le rendu
    setTimeout(function() { creerGraphiques(q, res); }, 100);
}

function calculerVueEnsemble(res, q) {
    var sommeScores = 0;
    var nbScores = 0;
    var totalFavorable = 0;
    var totalReponses = 0;

    for (var qId in res.reponses) {
        if (!res.reponses.hasOwnProperty(qId)) continue;
        var rep = res.reponses[qId];
        if (rep.type !== 'likert4') continue;

        sommeScores += rep.scoreMoyen;
        nbScores++;

        var dist = rep.distribution;
        for (var label in dist) {
            if (!dist.hasOwnProperty(label)) continue;
            totalReponses += dist[label];
            // Niveaux 3 et 4 = favorables
            var valeur = labelVersValeur(label);
            if (valeur >= 3) totalFavorable += dist[label];
        }
    }

    return {
        scoreGlobal: nbScores > 0 ? sommeScores / nbScores : 0,
        tauxFavorable: totalReponses > 0 ? Math.round((totalFavorable / totalReponses) * 100) : 0,
        nbQuestionsRepondues: nbScores
    };
}

function calculerScoreBloc(questionsLikert, res) {
    var somme = 0;
    var nb = 0;
    for (var i = 0; i < questionsLikert.length; i++) {
        var rep = res.reponses[questionsLikert[i].id];
        if (rep && rep.scoreMoyen) {
            somme += rep.scoreMoyen;
            nb++;
        }
    }
    return { moyenne: nb > 0 ? somme / nb : 0, nb: nb };
}

function calculerSignaux(questionsLikert, res) {
    var totalFav = 0;
    var totalDefav = 0;
    var totalRep = 0;

    for (var i = 0; i < questionsLikert.length; i++) {
        var rep = res.reponses[questionsLikert[i].id];
        if (!rep || !rep.distribution) continue;
        for (var label in rep.distribution) {
            if (!rep.distribution.hasOwnProperty(label)) continue;
            var n = rep.distribution[label];
            var v = labelVersValeur(label);
            totalRep += n;
            if (v >= 3) totalFav += n;
            if (v <= 2) totalDefav += n;
        }
    }

    var tauxFav = totalRep > 0 ? Math.round((totalFav / totalRep) * 100) : 0;
    var tauxDefav = totalRep > 0 ? Math.round((totalDefav / totalRep) * 100) : 0;

    return {
        fort: tauxFav >= 80,
        faible: tauxDefav >= 30,
        tauxFavorable: tauxFav,
        tauxDefavorable: tauxDefav
    };
}

function labelVersValeur(label) {
    var echelle = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
    for (var i = 0; i < echelle.length; i++) {
        if (echelle[i].label === label) return echelle[i].valeur;
    }
    return 0;
}

function rendreSynthese(q, res) {
    var html = [];
    html.push('<div class="bilan-rapport-section">');
    html.push('<div class="bilan-rapport-titre">Synth\u00e8se</div>');

    var forces = [];
    var vigilances = [];

    for (var i = 0; i < q.blocs.length; i++) {
        var bloc = q.blocs[i];
        if (!bloc.actif) continue;

        var questionsLikert = [];
        for (var j = 0; j < bloc.questions.length; j++) {
            if (bloc.questions[j].type === 'likert4' && res.reponses[bloc.questions[j].id]) {
                questionsLikert.push(bloc.questions[j]);
            }
        }
        if (questionsLikert.length === 0) continue;

        var scoreBloc = calculerScoreBloc(questionsLikert, res);
        var signaux = calculerSignaux(questionsLikert, res);

        if (scoreBloc.moyenne >= 3.2) {
            forces.push({ titre: bloc.titre, score: scoreBloc.moyenne, tauxFav: signaux.tauxFavorable });
        }
        if (scoreBloc.moyenne < 2.5 || signaux.faible) {
            vigilances.push({ titre: bloc.titre, score: scoreBloc.moyenne, tauxDefav: signaux.tauxDefavorable });
        }
    }

    // Forces
    if (forces.length > 0) {
        html.push('<h4 style="color:var(--vert-succes);margin:12px 0 8px">Forces identifi\u00e9es</h4>');
        for (var f = 0; f < forces.length; f++) {
            html.push('<div class="bilan-synthese-item bilan-synthese-force">');
            html.push('<div class="bilan-synthese-titre">' + echapperHtml(forces[f].titre) + '</div>');
            html.push('<div class="bilan-synthese-detail">Score moyen : ' + forces[f].score.toFixed(2) + '/4 \u2014 ' + forces[f].tauxFav + '% de r\u00e9ponses favorables</div>');
            html.push('</div>');
        }
    }

    // Zones de vigilance
    if (vigilances.length > 0) {
        html.push('<h4 style="color:var(--rouge-erreur);margin:12px 0 8px">Zones de vigilance</h4>');
        for (var v = 0; v < vigilances.length; v++) {
            html.push('<div class="bilan-synthese-item bilan-synthese-vigilance">');
            html.push('<div class="bilan-synthese-titre">' + echapperHtml(vigilances[v].titre) + '</div>');
            html.push('<div class="bilan-synthese-detail">Score moyen : ' + vigilances[v].score.toFixed(2) + '/4 \u2014 ' + vigilances[v].tauxDefav + '% de r\u00e9ponses d\u00e9favorables</div>');
            html.push('</div>');
        }
    }

    if (forces.length === 0 && vigilances.length === 0) {
        html.push('<p style="color:var(--texte-secondaire)">Aucun signal particulier d\u00e9tect\u00e9 \u2014 les r\u00e9sultats sont globalement neutres.</p>');
    }

    html.push('</div>');
    return html.join('');
}

// === Graphiques Chart.js ===

function creerGraphiques(q, res) {
    // Graphique global
    creerGraphiqueGlobal(res);

    // Graphiques par bloc
    for (var i = 0; i < q.blocs.length; i++) {
        var bloc = q.blocs[i];
        if (!bloc.actif) continue;

        var questionsLikert = [];
        for (var j = 0; j < bloc.questions.length; j++) {
            if (bloc.questions[j].type === 'likert4' && res.reponses[bloc.questions[j].id]) {
                questionsLikert.push(bloc.questions[j]);
            }
        }
        if (questionsLikert.length === 0) continue;

        creerGraphiqueBloc('bilan-chart-' + bloc.id, questionsLikert, res);
    }
}

function creerGraphiqueGlobal(res) {
    var canvas = document.getElementById('bilan-chart-global');
    if (!canvas) return;

    // Calculer la distribution globale en pourcentage
    var totaux = [0, 0, 0, 0]; // [4, 3, 2, 1]
    var totalRep = 0;
    var echelle = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;

    for (var qId in res.reponses) {
        if (!res.reponses.hasOwnProperty(qId)) continue;
        var rep = res.reponses[qId];
        if (rep.type !== 'likert4') continue;
        for (var k = 0; k < echelle.length; k++) {
            var n = rep.distribution[echelle[k].label] || 0;
            totaux[k] += n;
            totalRep += n;
        }
    }

    var pcts = totalRep > 0 ? totaux.map(function(v) { return Math.round((v / totalRep) * 100); }) : [0, 0, 0, 0];

    var couleurs = obtenirCouleursLikert();
    var estClair = document.body.classList.contains('mode-clair');

    try {
        var chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Distribution globale'],
                datasets: [
                    { label: echelle[0].label, data: [pcts[0]], backgroundColor: couleurs[0] },
                    { label: echelle[1].label, data: [pcts[1]], backgroundColor: couleurs[1] },
                    { label: echelle[2].label, data: [pcts[2]], backgroundColor: couleurs[2] },
                    { label: echelle[3].label, data: [pcts[3]], backgroundColor: couleurs[3] }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: estClair ? '#1a1a2e' : '#d0e0e4', padding: 12 } },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) { return ctx.dataset.label + ' : ' + ctx.raw + '%'; }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, max: 100, grid: { color: couleurGrille() }, ticks: { color: estClair ? '#555' : '#8aa4b0', callback: function(v) { return v + '%'; } } },
                    y: { stacked: true, grid: { display: false }, ticks: { color: estClair ? '#1a1a2e' : '#d0e0e4' } }
                }
            }
        });
        etat.graphiques['global'] = chart;
    } catch (err) {
        console.error('[BilanReflexif] Erreur graphique global:', err);
    }
}

function creerGraphiqueBloc(canvasId, questionsLikert, res) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var echelle = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
    var labels = [];
    var datasets = [
        { label: echelle[0].label, data: [], backgroundColor: '' },
        { label: echelle[1].label, data: [], backgroundColor: '' },
        { label: echelle[2].label, data: [], backgroundColor: '' },
        { label: echelle[3].label, data: [], backgroundColor: '' }
    ];

    var couleurs = obtenirCouleursLikert();
    for (var d = 0; d < 4; d++) datasets[d].backgroundColor = couleurs[d];

    for (var i = 0; i < questionsLikert.length; i++) {
        var q = questionsLikert[i];
        var rep = res.reponses[q.id];
        labels.push(tronquer(q.texte, 50));

        var total = rep.nbReponses || 1;
        for (var k = 0; k < echelle.length; k++) {
            var n = (rep.distribution && rep.distribution[echelle[k].label]) || 0;
            datasets[k].data.push(Math.round((n / total) * 100));
        }
    }

    var estClair = document.body.classList.contains('mode-clair');

    try {
        var chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: { labels: labels, datasets: datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) { return ctx.dataset.label + ' : ' + ctx.raw + '%'; }
                        }
                    }
                },
                scales: {
                    x: { stacked: true, max: 100, grid: { color: couleurGrille() }, ticks: { color: estClair ? '#555' : '#8aa4b0', callback: function(v) { return v + '%'; } } },
                    y: { stacked: true, grid: { display: false }, ticks: { color: estClair ? '#1a1a2e' : '#d0e0e4', font: { size: 11 } } }
                }
            }
        });
        etat.graphiques[canvasId] = chart;
    } catch (err) {
        console.error('[BilanReflexif] Erreur graphique bloc:', err);
    }
}

function obtenirCouleursLikert() {
    var cl = BILAN_REFLEXIF_DATA.COULEURS_LIKERT;
    return [
        obtenirCouleurCSS(cl[4].variable, cl[4].fallback),
        obtenirCouleurCSS(cl[3].variable, cl[3].fallback),
        obtenirCouleurCSS(cl[2].variable, cl[2].fallback),
        obtenirCouleurCSS(cl[1].variable, cl[1].fallback)
    ];
}

function obtenirCouleurCSS(variable, fallback) {
    var val = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return val || fallback;
}

function couleurGrille() {
    return document.body.classList.contains('mode-clair')
        ? 'rgba(3, 46, 92, 0.08)'
        : 'rgba(106, 172, 184, 0.08)';
}

function detruireGraphiques() {
    for (var key in etat.graphiques) {
        if (etat.graphiques.hasOwnProperty(key) && etat.graphiques[key]) {
            try { etat.graphiques[key].destroy(); } catch (e) { /* ignore */ }
        }
    }
    etat.graphiques = {};
}

function supprimerResultats() {
    etat.resultats = null;
    db.removeSync(CLE_RESULTATS());
    detruireGraphiques();
    rendreInterface();
    afficherVue('editeur');
    afficherToast('R\u00e9sultats supprim\u00e9s');
}

/* ===============================
   SECTION 6 : EXPORT PDF
   =============================== */

function exporterPDF() {
    if (!etat.resultats || !etat.questionnaire) return;

    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

        var marges = { haut: 15, bas: 15, gauche: 15, droite: 15 };
        var largeurPage = 215.9;
        var largeurContenu = largeurPage - marges.gauche - marges.droite;
        var posY = marges.haut;
        var res = etat.resultats;
        var q = etat.questionnaire;

        // === Page 1 : En-tête et vue d'ensemble ===
        doc.setFontSize(20);
        doc.setTextColor(3, 46, 92);
        doc.setFont('helvetica', 'bold');
        doc.text('Bilan r\u00e9flexif', marges.gauche, posY);
        posY += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text(q.titre, marges.gauche, posY);
        posY += 6;
        doc.text('Import\u00e9 le ' + new Date(res.dateImport).toLocaleDateString('fr-CA') + ' \u2014 ' + res.nbRepondants + ' r\u00e9pondants', marges.gauche, posY);
        posY += 4;

        doc.setDrawColor(3, 46, 92);
        doc.setLineWidth(0.5);
        doc.line(marges.gauche, posY, largeurPage - marges.droite, posY);
        posY += 10;

        // Vue d'ensemble
        var stats = calculerVueEnsemble(res, q);
        doc.setFontSize(14);
        doc.setTextColor(3, 46, 92);
        doc.setFont('helvetica', 'bold');
        doc.text('Vue d\u2019ensemble', marges.gauche, posY);
        posY += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        doc.text('Score moyen global : ' + stats.scoreGlobal.toFixed(2) + ' / 4', marges.gauche, posY);
        posY += 5;
        doc.text('Taux de r\u00e9ponses favorables : ' + stats.tauxFavorable + '%', marges.gauche, posY);
        posY += 5;
        doc.text('Questions analys\u00e9es : ' + stats.nbQuestionsRepondues, marges.gauche, posY);
        posY += 12;

        // === Détail par bloc ===
        for (var i = 0; i < q.blocs.length; i++) {
            var bloc = q.blocs[i];
            if (!bloc.actif) continue;

            var questionsLikert = [];
            var questionsOuvertes = [];
            for (var j = 0; j < bloc.questions.length; j++) {
                var qb = bloc.questions[j];
                if (!res.reponses[qb.id]) continue;
                if (qb.type === 'likert4') questionsLikert.push(qb);
                else questionsOuvertes.push(qb);
            }
            if (questionsLikert.length === 0 && questionsOuvertes.length === 0) continue;

            // Vérifier espace restant
            if (posY > 230) {
                doc.addPage();
                posY = marges.haut;
            }

            // Titre du bloc
            doc.setFontSize(12);
            doc.setTextColor(3, 46, 92);
            doc.setFont('helvetica', 'bold');
            doc.text(bloc.titre, marges.gauche, posY);
            posY += 3;

            if (questionsLikert.length > 0) {
                var scoreBloc = calculerScoreBloc(questionsLikert, res);
                var signaux = calculerSignaux(questionsLikert, res);

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(102, 102, 102);
                var infoBloc = 'Score moyen : ' + scoreBloc.moyenne.toFixed(2) + '/4';
                if (signaux.fort) infoBloc += ' \u2014 Signal fort (' + signaux.tauxFavorable + '% favorables)';
                if (signaux.faible) infoBloc += ' \u2014 Signal faible (' + signaux.tauxDefavorable + '% d\u00e9favorables)';
                doc.text(infoBloc, marges.gauche, posY);
                posY += 5;

                // Tableau des distributions
                var echelle = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
                var tableHead = [['Question', echelle[0].label, echelle[1].label, echelle[2].label, echelle[3].label, 'Moy.']];
                var tableBody = [];

                for (var ql = 0; ql < questionsLikert.length; ql++) {
                    var qItem = questionsLikert[ql];
                    var rep = res.reponses[qItem.id];
                    var total = rep.nbReponses || 1;
                    var row = [tronquer(qItem.texte, 45)];
                    for (var e = 0; e < echelle.length; e++) {
                        var n = (rep.distribution && rep.distribution[echelle[e].label]) || 0;
                        row.push(Math.round((n / total) * 100) + '%');
                    }
                    row.push(rep.scoreMoyen.toFixed(2));
                    tableBody.push(row);
                }

                doc.autoTable({
                    startY: posY,
                    head: tableHead,
                    body: tableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [3, 46, 92], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 8, textColor: [51, 51, 51] },
                    columnStyles: {
                        0: { cellWidth: largeurContenu * 0.35 },
                        5: { fontStyle: 'bold', halign: 'center' }
                    },
                    margin: { left: marges.gauche, right: marges.droite },
                    didParseCell: function(data) {
                        if (data.section === 'body') {
                            var col = data.column.index;
                            if (col >= 1 && col <= 4) data.cell.styles.halign = 'center';
                        }
                    }
                });

                posY = doc.lastAutoTable.finalY + 5;
            }

            // Réponses ouvertes
            for (var ro = 0; ro < questionsOuvertes.length; ro++) {
                var qOuv = questionsOuvertes[ro];
                var repOuv = res.reponses[qOuv.id];
                if (!repOuv || !repOuv.reponses || repOuv.reponses.length === 0) continue;

                if (posY > 240) { doc.addPage(); posY = marges.haut; }

                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(102, 102, 102);
                doc.text(tronquer(qOuv.texte, 80) + ' (' + repOuv.nbReponses + ' r\u00e9ponses)', marges.gauche, posY);
                posY += 4;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(51, 51, 51);
                for (var rr = 0; rr < repOuv.reponses.length; rr++) {
                    if (posY > 250) { doc.addPage(); posY = marges.haut; }
                    var lignes = doc.splitTextToSize('\u2022 ' + repOuv.reponses[rr], largeurContenu - 5);
                    doc.setFontSize(8);
                    doc.text(lignes, marges.gauche + 3, posY);
                    posY += lignes.length * 3.5 + 1;
                }
                posY += 3;
            }

            posY += 5;
        }

        // === Synthèse ===
        if (posY > 220) { doc.addPage(); posY = marges.haut; }

        doc.setFontSize(14);
        doc.setTextColor(3, 46, 92);
        doc.setFont('helvetica', 'bold');
        doc.text('Synth\u00e8se', marges.gauche, posY);
        posY += 8;

        var forces = [];
        var vigilances = [];
        for (var ib = 0; ib < q.blocs.length; ib++) {
            var blocS = q.blocs[ib];
            if (!blocS.actif) continue;
            var qLikS = [];
            for (var jb = 0; jb < blocS.questions.length; jb++) {
                if (blocS.questions[jb].type === 'likert4' && res.reponses[blocS.questions[jb].id]) {
                    qLikS.push(blocS.questions[jb]);
                }
            }
            if (qLikS.length === 0) continue;
            var sb = calculerScoreBloc(qLikS, res);
            var sig = calculerSignaux(qLikS, res);
            if (sb.moyenne >= 3.2) forces.push(blocS.titre + ' (' + sb.moyenne.toFixed(2) + '/4, ' + sig.tauxFavorable + '% fav.)');
            if (sb.moyenne < 2.5 || sig.faible) vigilances.push(blocS.titre + ' (' + sb.moyenne.toFixed(2) + '/4, ' + sig.tauxDefavorable + '% d\u00e9fav.)');
        }

        doc.setFontSize(10);
        if (forces.length > 0) {
            doc.setTextColor(52, 199, 89);
            doc.setFont('helvetica', 'bold');
            doc.text('Forces identifi\u00e9es :', marges.gauche, posY);
            posY += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 51, 51);
            for (var fi = 0; fi < forces.length; fi++) {
                doc.text('\u2022 ' + forces[fi], marges.gauche + 3, posY);
                posY += 5;
            }
            posY += 3;
        }

        if (vigilances.length > 0) {
            doc.setTextColor(232, 64, 87);
            doc.setFont('helvetica', 'bold');
            doc.text('Zones de vigilance :', marges.gauche, posY);
            posY += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 51, 51);
            for (var vi = 0; vi < vigilances.length; vi++) {
                doc.text('\u2022 ' + vigilances[vi], marges.gauche + 3, posY);
                posY += 5;
            }
        }

        // Pied de page sur toutes les pages
        var nbPages = doc.internal.getNumberOfPages();
        for (var p = 1; p <= nbPages; p++) {
            doc.setPage(p);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Bilan r\u00e9flexif \u2014 ' + q.titre, marges.gauche, 267);
            doc.text('Page ' + p + '/' + nbPages, largeurPage - marges.droite, 267, { align: 'right' });
        }

        // Sauvegarder
        var nomFichier = 'bilan-reflexif-' + new Date().toISOString().slice(0, 10) + '.pdf';
        doc.save(nomFichier);
        afficherToast('PDF export\u00e9 : ' + nomFichier);

    } catch (err) {
        console.error('[BilanReflexif] Erreur export PDF:', err);
        afficherToast('Erreur lors de l\u2019export PDF');
    }
}

/* ===============================
   SECTION 7 : UTILITAIRES
   =============================== */

function tronquer(texte, max) {
    if (!texte || texte.length <= max) return texte || '';
    return texte.substring(0, max - 1) + '\u2026';
}

/* ===============================
   SECTION 8 : HOOKS NAVIGATION ET API PUBLIQUE
   =============================== */

// Auto-enregistrement dans la config (résilience si config.js est en cache)
if (window.configurationsOnglets && window.configurationsOnglets['boite-outils']) {
    var _boite = window.configurationsOnglets['boite-outils'];
    var _hasBilan = false;
    for (var _b = 0; _b < _boite.length; _b++) {
        if (_boite[_b].id === 'bilan') { _hasBilan = true; break; }
    }
    if (!_hasBilan) {
        _boite.push({ id: 'bilan', label: 'Bilan r\u00e9flexif' });
    }
}

// Hook sur afficherSousSection pour initialiser quand on navigue vers bilan
var _originalAfficherSousSection = window.afficherSousSection;
if (typeof _originalAfficherSousSection === 'function') {
    window.afficherSousSection = function(idSousSection) {
        var resultat = _originalAfficherSousSection.apply(this, arguments);
        if (idSousSection === 'boite-outils-bilan') {
            try { initialiserBilanReflexif(); } catch (e) { console.error('[BilanReflexif] Erreur init:', e); }
        }
        return resultat;
    };
}

// Hook sur afficherSection pour nettoyer les graphiques quand on quitte
var _originalAfficherSection = window.afficherSection;
if (typeof _originalAfficherSection === 'function') {
    window.afficherSection = function(nomSection) {
        if (nomSection !== 'boite-outils') {
            try { detruireGraphiques(); } catch (e) { console.error('[BilanReflexif] Erreur detruireGraphiques:', e); }
        }
        return _originalAfficherSection.apply(this, arguments);
    };
}

// API publique
window.BilanReflexif = {
    afficherVue: afficherVue,
    // Éditeur Likert
    modifierTitre: modifierTitre,
    toggleBloc: toggleBloc,
    toggleOuverture: toggleOuverture,
    editerQuestion: editerQuestion,
    confirmerEdition: confirmerEdition,
    annulerEdition: annulerEdition,
    validerEditionKeyup: validerEditionKeyup,
    supprimerQuestion: supprimerQuestion,
    deplacerQuestion: deplacerQuestion,
    ajouterQuestionBloc: ajouterQuestionBloc,
    ajouterPerso: ajouterPerso,
    reinitialiserDemo: reinitialiserDemo,
    exporterTexte: exporterTexte,
    // Éditeur Parcours
    ajouterActivite: ajouterActivite,
    modifierActivite: modifierActivite,
    confirmerModifActivite: confirmerModifActivite,
    annulerModifActivite: annulerModifActivite,
    supprimerActivite: supprimerActivite,
    deplacerActivite: deplacerActivite,
    importerProductions: importerProductions,
    ajouterEmotion: ajouterEmotion,
    supprimerEmotion: supprimerEmotion,
    toggleTransversale: toggleTransversale,
    exporterTexteParcours: exporterTexteParcours,
    // Aide
    toggleAide: toggleAide,
    // Import / Rapport
    declencherImport: declencherImport,
    chargerResultatsDemo: chargerResultatsDemo,
    modifierMapping: modifierMapping,
    confirmerImport: confirmerImport,
    annulerImport: annulerImport,
    exporterPDF: exporterPDF,
    supprimerResultats: supprimerResultats
};

window.initialiserBilanReflexif = initialiserBilanReflexif;

})();
