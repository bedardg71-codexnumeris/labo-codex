/* ===============================
   MODULE: PLANIFICATION — MOTEUR CARTE MENTALE
   Portage du prototype standalone vers la SPA Monitorage v6

   Tous les IDs et classes sont préfixés 'planif-'
   Toutes les refs DOM sont différées dans initialiser()
   Events globaux gérés via flag planificationActive

   Export: window.planificationCarte
   =============================== */

(function() {
'use strict';

// === ÉTAT DE L'APPLICATION ===
const etat = {
    noeuds: new Map(),
    liens: new Map(),
    compteur: 0,
    compteurLiens: 0,
    selection: null,
    multiSelection: new Set(),
    lienEnCours: null,
    panneauOuvert: false,
    zoom: 1,
    initialise: false,
    modeIndividuel: null
};

// === FLAG D'ACTIVATION ===
let planificationActive = false;

// === UNDO / REDO ===
const UNDO_MAX = 50;
let pileUndo = [];
let pileRedo = [];
let _undoBatch = false;

// === THROTTLE rAF POUR HANDLERS MOUSEMOVE ===
function throttleRAF(fn) {
    var rafId = null;
    return function(e) {
        if (rafId) return;
        rafId = requestAnimationFrame(function() {
            fn(e);
            rafId = null;
        });
    };
}

// === CLÉ DE STOCKAGE SÉANCES ===
var CLE_SEANCES = 'planification_seances';

// === INDEX INVERSE CLONES (sourceId → Set d'IDs) ===
var _cloneIndex = new Map();

// === CONFIGURATION DES TYPES ===
const TYPES = {
    // Objectifs
    'competence':     { label: 'Compétence',       couleur: 'var(--planif-couleur-competence)' },
    'idee-maitresse': { label: 'Idée maîtresse',   couleur: 'var(--planif-couleur-idee-maitresse)' },
    // Types de connaissances (Anderson & Krathwohl, 2001)
    'factuelle':      { label: 'Factuelle',          couleur: 'var(--planif-couleur-factuelle)' },
    'conceptuelle':   { label: 'Conceptuelle',       couleur: 'var(--planif-couleur-conceptuelle)' },
    'procedurale':    { label: 'Procédurale',        couleur: 'var(--planif-couleur-procedurale)' },
    'metacognitive':  { label: 'Métacognitive',      couleur: 'var(--planif-couleur-metacognitive)' },
    // Conteneurs
    'sequence':       { label: 'Séquence',          couleur: 'var(--planif-couleur-sequence)',  conteneur: true },
    'lecon':          { label: 'Leçon',             couleur: 'var(--planif-couleur-lecon)',     conteneur: true },
    // Activités
    'activite':       { label: 'Activité',          couleur: 'var(--planif-couleur-activite)' },
    'soutien':        { label: 'Soutien',           couleur: 'var(--planif-couleur-soutien)' },
    'revision':       { label: 'Révision',          couleur: 'var(--planif-couleur-revision)' },
    // Évaluation
    'evaluation':     { label: 'Évaluation',        couleur: 'var(--planif-couleur-evaluation)' }
};

const TYPES_LIENS = [
    { id: 'se_decline_en',        label: 'se décline en' },
    { id: 'se_concretise_dans',   label: 'se concrétise dans' },
    { id: 's_acquiert_par',       label: "s'acquiert par" },
    { id: 'se_verifie_par',       label: 'se vérifie par' },
    { id: 's_appuie_sur',         label: "s'appuie sur" },
    { id: 'complete',             label: 'complète' },
    { id: 'conduit_a',            label: 'conduit à' },
    { id: 'est_mobilise_par',     label: 'est mobilisé(e) par' }
];

// Table des verbes automatiques : direction amont → aval
// clé = "typeSource>typeCible", valeur = { verbe, inverser }
var VERBES_AUTO = {
    // Compétence → Idée maîtresse (se décline en)
    'competence>idee-maitresse':   { verbe: 'se_decline_en' },
    'idee-maitresse>competence':   { verbe: 'se_decline_en', inverser: true },
    // Idée maîtresse → Leçon (se concrétise dans)
    'idee-maitresse>lecon':        { verbe: 'se_concretise_dans' },
    'lecon>idee-maitresse':        { verbe: 'se_concretise_dans', inverser: true },
    'idee-maitresse>sequence':     { verbe: 'se_concretise_dans' },
    'sequence>idee-maitresse':     { verbe: 'se_concretise_dans', inverser: true },
    // Connaissance → Activité (s'acquiert par)
    'factuelle>activite':          { verbe: 's_acquiert_par' },
    'factuelle>soutien':           { verbe: 's_acquiert_par' },
    'factuelle>revision':          { verbe: 's_acquiert_par' },
    'conceptuelle>activite':       { verbe: 's_acquiert_par' },
    'conceptuelle>soutien':        { verbe: 's_acquiert_par' },
    'conceptuelle>revision':       { verbe: 's_acquiert_par' },
    'procedurale>activite':        { verbe: 's_acquiert_par' },
    'procedurale>soutien':         { verbe: 's_acquiert_par' },
    'procedurale>revision':        { verbe: 's_acquiert_par' },
    'metacognitive>activite':      { verbe: 's_acquiert_par' },
    'metacognitive>soutien':       { verbe: 's_acquiert_par' },
    'metacognitive>revision':      { verbe: 's_acquiert_par' },
    'activite>factuelle':          { verbe: 's_acquiert_par', inverser: true },
    'activite>conceptuelle':       { verbe: 's_acquiert_par', inverser: true },
    'activite>procedurale':        { verbe: 's_acquiert_par', inverser: true },
    'activite>metacognitive':      { verbe: 's_acquiert_par', inverser: true },
    'soutien>factuelle':           { verbe: 's_acquiert_par', inverser: true },
    'soutien>conceptuelle':        { verbe: 's_acquiert_par', inverser: true },
    'soutien>procedurale':         { verbe: 's_acquiert_par', inverser: true },
    'soutien>metacognitive':       { verbe: 's_acquiert_par', inverser: true },
    'revision>factuelle':          { verbe: 's_acquiert_par', inverser: true },
    'revision>conceptuelle':       { verbe: 's_acquiert_par', inverser: true },
    'revision>procedurale':        { verbe: 's_acquiert_par', inverser: true },
    'revision>metacognitive':      { verbe: 's_acquiert_par', inverser: true },
    // Idée maîtresse → Évaluation (se vérifie par)
    'idee-maitresse>evaluation':   { verbe: 'se_verifie_par' },
    'evaluation>idee-maitresse':   { verbe: 'se_verifie_par', inverser: true },
    // Connaissance → Évaluation (se vérifie par)
    'factuelle>evaluation':        { verbe: 'se_verifie_par' },
    'conceptuelle>evaluation':     { verbe: 'se_verifie_par' },
    'procedurale>evaluation':      { verbe: 'se_verifie_par' },
    'metacognitive>evaluation':    { verbe: 'se_verifie_par' },
    'evaluation>factuelle':        { verbe: 'se_verifie_par', inverser: true },
    'evaluation>conceptuelle':     { verbe: 'se_verifie_par', inverser: true },
    'evaluation>procedurale':      { verbe: 'se_verifie_par', inverser: true },
    'evaluation>metacognitive':    { verbe: 'se_verifie_par', inverser: true },
    // Activité → Évaluation (se vérifie par)
    'activite>evaluation':         { verbe: 'se_verifie_par' },
    'soutien>evaluation':          { verbe: 'se_verifie_par' },
    'revision>evaluation':         { verbe: 'se_verifie_par' },
    'evaluation>activite':         { verbe: 'se_verifie_par', inverser: true },
    'evaluation>soutien':          { verbe: 'se_verifie_par', inverser: true },
    'evaluation>revision':         { verbe: 'se_verifie_par', inverser: true },
};

// Groupes de types pour normalisation (verbes horizontaux)
var TYPES_CONNAISSANCE = ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive'];
var TYPES_ACTIVITE = ['activite', 'soutien', 'revision'];

function normaliserType(type) {
    if (TYPES_CONNAISSANCE.indexOf(type) !== -1) return 'connaissance';
    if (TYPES_ACTIVITE.indexOf(type) !== -1) return 'activite';
    return type;
}

// Verbes horizontaux : plusieurs choix possibles par couple
var VERBES_HORIZONTAUX = {
    'connaissance>connaissance':     ['s_appuie_sur', 'complete', 'conduit_a', 'est_mobilise_par'],  // normaliserType → 'connaissance'
    'activite>activite':             ['complete', 'conduit_a'],
    'idee-maitresse>idee-maitresse': ['s_appuie_sur', 'complete']
};

// === NIVEAUX COGNITIFS (Anderson & Krathwohl, 2001) ===
var NIVEAUX_COGNITIFS = [
    { id: 'memoriser',   label: 'Mémoriser',   ordre: 1, description: 'Retrouver des connaissances en mémoire' },
    { id: 'comprendre',  label: 'Comprendre',  ordre: 2, description: 'Construire du sens à partir de l\'information' },
    { id: 'appliquer',   label: 'Appliquer',   ordre: 3, description: 'Utiliser une procédure dans une situation donnée' },
    { id: 'analyser',    label: 'Analyser',    ordre: 4, description: 'Décomposer en parties et comprendre les relations' },
    { id: 'evaluer',     label: 'Évaluer',     ordre: 5, description: 'Porter un jugement selon des critères' },
    { id: 'creer',       label: 'Créer',       ordre: 6, description: 'Assembler des éléments pour produire quelque chose de nouveau' }
];

var BANQUE_VERBES = {
    memoriser:  ['reconnaître', 'identifier', 'rappeler', 'nommer', 'lister', 'définir', 'répéter', 'énoncer', 'repérer', 'associer'],
    comprendre: ['interpréter', 'illustrer', 'classifier', 'résumer', 'inférer', 'comparer', 'expliquer', 'paraphraser', 'décrire', 'distinguer'],
    appliquer:  ['exécuter', 'utiliser', 'résoudre', 'démontrer', 'calculer', 'appliquer', 'mettre en œuvre', 'réaliser', 'employer', 'opérer'],
    analyser:   ['différencier', 'organiser', 'attribuer', 'décomposer', 'structurer', 'examiner', 'déconstruire', 'catégoriser', 'schématiser', 'questionner'],
    evaluer:    ['vérifier', 'critiquer', 'juger', 'justifier', 'évaluer', 'argumenter', 'défendre', 'valider', 'recommander', 'prioriser'],
    creer:      ['générer', 'planifier', 'produire', 'concevoir', 'élaborer', 'construire', 'composer', 'formuler', 'inventer', 'synthétiser']
};

// Types de nœuds qui acceptent le sélecteur de niveau cognitif
var TYPES_AVEC_NIVEAU_COGNITIF = ['competence', 'idee-maitresse', 'activite', 'soutien', 'revision', 'evaluation'];

// === GUIDE INTÉGRÉ — 8 pages (7 pédagogiques + 1 technique import/export) ===
var GUIDE_PAGES = [
    {
        titre: 'Construis ta carte d\u2019alignement',
        contenu:
            '<p>Cette carte t\u2019aide à vérifier que tout ce que tu enseignes est relié à ce que tu évalues. C\u2019est ça, l\u2019alignement pédagogique.</p>' +
            '<p>Chaque élément affiche deux <strong>badges</strong> (gauche\u00a0= amont, droite\u00a0= aval) qui t\u2019indiquent l\u2019état de ses connexions\u00a0:</p>' +
            '<ul>' +
                '<li><span class="icone-inline icone-inline--check" aria-hidden="true"></span> = cet élément est bien relié (le badge prend la couleur de l\u2019élément).</li>' +
                '<li><strong>!</strong> (badge gris) = il manque une connexion.</li>' +
                '<li><span class="icone-inline icone-inline--warning" aria-hidden="true"></span> = attention, une évaluation manque quelque part dans la chaîne.</li>' +
            '</ul>' +
            '<p>Ce guide te propose 7\u00a0étapes pour construire ta carte et utiliser l\u2019import\u00a0/\u00a0export. Tu peux le consulter à tout moment depuis la palette.</p>' +
            '<p class="planif-guide-ref">Anderson, L.\u00a0W. (2026). <em>Curricular alignment: A re-examination</em> (Educational Practices Series, No.\u00a037). UNESCO International Bureau of Education. <a href="https://unesdoc.unesco.org/ark:/48223/pf0000397143.locale=en" target="_blank" rel="noopener">unesdoc.unesco.org</a></p>'
    },
    {
        titre: 'Commence par le pourquoi',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque cours vise des compétences — c\u2019est ce que l\u2019étudiant sera capable de faire à la fin. Tout le reste de ta carte en découle.</p>' +
            '<ol>' +
                '<li>Glisse un élément <span class="planif-guide-type" style="background:var(--planif-couleur-competence)"></span> <strong>Compétence</strong> de la palette sur le canevas.</li>' +
                '<li>Double-clique dessus pour écrire l\u2019énoncé de compétence.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Sélectionne la compétence et utilise le <strong>sélecteur de niveau cognitif</strong> dans l\u2019<strong>Inspecteur</strong> (panneau de droite) pour choisir le niveau visé (ex.\u00a0: Analyser, Créer). Les verbes suggérés t\u2019aideront à formuler ton énoncé.</div>'
    },
    {
        titre: 'Ce que l\u2019étudiant doit retenir',
        contenu:
            '<p class="planif-guide-pourquoi">Une idée maîtresse, c\u2019est l\u2019essentiel — ce qui restera quand l\u2019étudiant aura oublié les détails. Chaque compétence se décline en une ou plusieurs idées maîtresses.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-idee-maitresse)"></span> <strong>Idée maîtresse</strong> sur le canevas.</li>' +
                '<li>Relie-la à sa compétence en tirant un lien d\u2019un port à l\u2019autre. Le verbe <em>«\u00a0se décline en\u00a0»</em> s\u2019affiche automatiquement.</li>' +
                '<li>Le badge d\u2019entrée de l\u2019idée maîtresse affiche <span class="icone-inline icone-inline--check" aria-hidden="true"></span> — elle est connectée en amont.</li>' +
            '</ol>'
    },
    {
        titre: 'Organise dans le temps',
        contenu:
            '<p class="planif-guide-pourquoi">Les séquences et les leçons structurent ton cours dans le temps. Une séquence regroupe des leçons qui poursuivent les mêmes idées maîtresses.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-sequence)"></span> <strong>Séquence</strong> sur le canevas, puis des <span class="planif-guide-type" style="background:var(--planif-couleur-lecon)"></span> <strong>Leçons</strong> à l\u2019intérieur.</li>' +
                '<li>Relie chaque leçon à une ou plusieurs idées maîtresses. Le verbe <em>«\u00a0se concrétise dans\u00a0»</em> apparaît.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Tu peux déplacer une leçon d\u2019une séquence à l\u2019autre en la glissant.</div>'
    },
    {
        titre: 'Ce que tu enseignes concrètement',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque leçon transmet des connaissances. Il en existe 4\u00a0types\u00a0:</p>' +
            '<ul class="planif-guide-types-liste">' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-factuelle)"></span> <strong>Factuelle</strong> — des faits, termes, données. <em>(Ex.\u00a0: les dates clés, les définitions, une formule.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-conceptuelle)"></span> <strong>Conceptuelle</strong> — des principes, théories, modèles. <em>(Ex.\u00a0: la loi de l\u2019offre et la demande, la structure d\u2019un récit.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-procedurale)"></span> <strong>Procédurale</strong> — des méthodes, techniques, savoir-faire. <em>(Ex.\u00a0: résoudre une équation, rédiger une introduction.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-metacognitive)"></span> <strong>Métacognitive</strong> — la conscience de son propre apprentissage. <em>(Ex.\u00a0: planifier son étude, s\u2019autoévaluer.)</em></li>' +
            '</ul>' +
            '<ol>' +
                '<li>Glisse le type de connaissance approprié dans une <strong>Leçon</strong>.</li>' +
                '<li>Double-clique pour nommer la connaissance.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Si tu hésites entre Factuelle et Conceptuelle\u00a0: un fait se vérifie, un concept s\u2019explique.</div>'
    },
    {
        titre: 'Comment l\u2019étudiant va apprendre',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque connaissance a besoin d\u2019une activité pour être acquise. Le type d\u2019activité dépend de ce que tu vises\u00a0: un exercice de mémorisation ne développe pas la même chose qu\u2019une analyse de cas.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-activite)"></span> <strong>Activité</strong> dans la leçon.</li>' +
                '<li>Relie-la à la connaissance qu\u2019elle permet d\u2019acquérir. Le verbe <em>«\u00a0s\u2019acquiert par\u00a0»</em> apparaît.</li>' +
                '<li>Utilise le <strong>sélecteur de niveau cognitif</strong> dans l\u2019<strong>Inspecteur</strong> pour t\u2019assurer que l\u2019activité vise le bon niveau.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce"><span class="planif-guide-type" style="background:var(--planif-couleur-soutien)"></span> <strong>Soutien</strong> et <span class="planif-guide-type" style="background:var(--planif-couleur-revision)"></span> <strong>Révision</strong> sont des types d\u2019activités spécialisées. Utilise «\u00a0Soutien\u00a0» pour l\u2019aide supplémentaire, «\u00a0Révision\u00a0» pour le réinvestissement.</div>'
    },
    {
        titre: 'Vérifie que c\u2019est acquis',
        contenu:
            '<p class="planif-guide-pourquoi">L\u2019évaluation ferme la boucle de l\u2019alignement. Elle doit vérifier ce que tu as enseigné, au niveau cognitif que tu as visé — ni plus, ni moins.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-evaluation)"></span> <strong>Évaluation</strong> sur le canevas.</li>' +
                '<li>Relie-la aux éléments qu\u2019elle évalue\u00a0: idées maîtresses, connaissances ou activités. Le verbe <em>«\u00a0se vérifie par\u00a0»</em> apparaît.</li>' +
                '<li>Quand une compétence est atteinte par au moins une évaluation à travers la chaîne, son badge d\u2019avertissement disparaît.</li>' +
            '</ol>' +
            '<p class="planif-guide-conclusion">L\u2019objectif\u00a0: quand tous les badges de ta carte affichent <span class="icone-inline icone-inline--check" aria-hidden="true"></span> et qu\u2019il n\u2019y a plus de <span class="icone-inline icone-inline--warning" aria-hidden="true"></span>, ton cours est aligné — chaque compétence est enseignée et évaluée de manière cohérente.</p>'
    },
    {
        titre: 'Exporter et importer un plan',
        contenu:
            '<p class="planif-guide-pourquoi">Tu peux exporter ton plan de leçons en format texte (Markdown), le retravailler avec une IA ou un collègue, puis le réimporter. La carte se reconstruit automatiquement.</p>' +
            '<p><strong>Exporter</strong></p>' +
            '<ol>' +
                '<li>Va dans <strong>Plan de la leçon</strong> (onglet du haut).</li>' +
                '<li>Clique <strong>Exporter\u00a0/\u00a0Importer</strong>.</li>' +
                '<li>Utilise <strong>Copier MD</strong> pour copier le plan dans le presse-papiers, ou <strong>Exporter MD</strong> pour télécharger un fichier.</li>' +
            '</ol>' +
            '<p><strong>Retravailler avec une IA</strong></p>' +
            '<ol>' +
                '<li>Colle le plan dans un assistant IA de ton choix.</li>' +
                '<li>Demande-lui d\u2019enrichir les objectifs, d\u2019ajouter des leçons, de réorganiser les séquences\u2026</li>' +
                '<li>L\u2019IA comprend les marqueurs <code>[Séquence]</code> et <code>[Leçon]</code> — elle les conservera dans sa réponse.</li>' +
            '</ol>' +
            '<p><strong>Réimporter</strong></p>' +
            '<ol>' +
                '<li>Retourne dans <strong>Exporter\u00a0/\u00a0Importer</strong>, onglet <strong>Importer MD</strong>.</li>' +
                '<li>Colle le plan retravaillé dans la zone de texte.</li>' +
                '<li>Clique <strong>Prévisualiser</strong> pour vérifier ce qui sera créé.</li>' +
                '<li>Choisis <em>Créer une nouvelle carte</em> ou <em>Ajouter à la carte active</em>.</li>' +
                '<li>Clique <strong>Importer</strong>.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Après l\u2019import, tu peux réorganiser les nœuds sur le canevas et relier les éléments à tes compétences et idées maîtresses.</div>'
    }
];

var _guidePageCourante = 0;
var _guideOuvert = false;

function ouvrirGuide() {
    var panel = document.getElementById('planif-guide-panel');
    if (!panel) return;
    _guideOuvert = true;
    _guidePageCourante = 0;

    var conteneur = panel.querySelector('.planif-guide-panel-contenu');
    conteneur.innerHTML = '';
    conteneur.style.display = '';
    var btnReplier = panel.querySelector('.planif-guide-panel-replier');
    if (btnReplier) { btnReplier.textContent = '−'; btnReplier.title = 'Replier le guide'; }

    var guide = document.createElement('div');
    guide.className = 'planif-guide';
    guide.innerHTML =
        '<div class="planif-guide-header">' +
            '<div class="planif-guide-titre"></div>' +
        '</div>' +
        '<div class="planif-guide-corps"></div>' +
        '<div class="planif-guide-nav">' +
            '<button class="planif-guide-btn-prev" title="Précédent">&larr;</button>' +
            '<div class="planif-guide-dots"></div>' +
            '<button class="planif-guide-btn-next" title="Suivant">&rarr;</button>' +
        '</div>' +
        '<div class="planif-guide-page-num"></div>';

    conteneur.appendChild(guide);

    var btnPrev = guide.querySelector('.planif-guide-btn-prev');
    var btnNext = guide.querySelector('.planif-guide-btn-next');
    var dotsContainer = guide.querySelector('.planif-guide-dots');

    // Créer les 7 points de navigation
    for (var i = 0; i < GUIDE_PAGES.length; i++) {
        var dot = document.createElement('button');
        dot.className = 'planif-guide-dot';
        dot.dataset.page = i;
        dot.title = 'Page ' + (i + 1);
        dot.addEventListener('click', function() {
            _guidePageCourante = parseInt(this.dataset.page);
            rendrePageGuide(guide);
        });
        dotsContainer.appendChild(dot);
    }

    btnPrev.addEventListener('click', function() {
        if (_guidePageCourante > 0) {
            _guidePageCourante--;
            rendrePageGuide(guide);
        }
    });
    btnNext.addEventListener('click', function() {
        if (_guidePageCourante < GUIDE_PAGES.length - 1) {
            _guidePageCourante++;
            rendrePageGuide(guide);
        } else {
            fermerGuide();
        }
    });

    panel.style.display = '';
    rendrePageGuide(guide);
}

function rendrePageGuide(guide) {
    var page = GUIDE_PAGES[_guidePageCourante];
    if (!page) return;

    guide.querySelector('.planif-guide-titre').textContent = page.titre;
    guide.querySelector('.planif-guide-corps').innerHTML = page.contenu;
    guide.querySelector('.planif-guide-page-num').textContent = 'Page ' + (_guidePageCourante + 1) + ' / ' + GUIDE_PAGES.length;

    var btnPrev = guide.querySelector('.planif-guide-btn-prev');
    var btnNext = guide.querySelector('.planif-guide-btn-next');
    btnPrev.disabled = _guidePageCourante === 0;
    btnNext.textContent = _guidePageCourante === GUIDE_PAGES.length - 1 ? 'Terminer' : '\u2192';

    var dots = guide.querySelectorAll('.planif-guide-dot');
    for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('planif-guide-dot-actif', i === _guidePageCourante);
    }
}

function fermerGuide() {
    var panel = document.getElementById('planif-guide-panel');
    if (!panel) return;
    _guideOuvert = false;

    var conteneur = panel.querySelector('.planif-guide-panel-contenu');
    if (conteneur) conteneur.innerHTML = '';
    panel.style.display = 'none';
}

function resoudreVerbe(sourceId, cibleId) {
    var src = etat.noeuds.get(sourceId);
    var cbl = etat.noeuds.get(cibleId);
    if (!src || !cbl) return null;

    // 1. Chercher un verbe vertical (automatique)
    var cle = src.type + '>' + cbl.type;
    var match = VERBES_AUTO[cle];
    if (match) {
        if (match.inverser) {
            return { type: 'vertical', verbe: match.verbe, source: cibleId, cible: sourceId };
        }
        return { type: 'vertical', verbe: match.verbe, source: sourceId, cible: cibleId };
    }

    // 2. Chercher des verbes horizontaux (choix utilisateur)
    var srcN = normaliserType(src.type);
    var cblN = normaliserType(cbl.type);
    var cleH = srcN + '>' + cblN;
    var verbesH = VERBES_HORIZONTAUX[cleH];
    if (verbesH && verbesH.length > 0) {
        return { type: 'horizontal', verbes: verbesH, source: sourceId, cible: cibleId };
    }

    return null;
}

// Migration anciens verbes → nouveaux verbes
var MIGRATION_VERBES = {
    'developpe':    { nouveauVerbe: 'se_decline_en',      inverserDirection: true },
    'vise':         { nouveauVerbe: 'se_concretise_dans', inverserDirection: true },
    'mobilise':     { nouveauVerbe: 's_acquiert_par',     inverserDirection: true },
    'evalue':       { nouveauVerbe: 'se_verifie_par',     inverserDirection: true },
    'verifie':      { nouveauVerbe: 'se_verifie_par',     inverserDirection: true },
    'requiert':     { nouveauVerbe: 's_appuie_sur',       inverserDirection: false },
    'sappuie_sur':  { nouveauVerbe: 's_appuie_sur',       inverserDirection: false }
};

// Compatibilité anciens verbes pour affichage
var VERBES_COMPAT = {
    'prerequis_de': 's_appuie_sur', 'evalue_par': 'se_verifie_par',
    'soutenu_par': 's_acquiert_par', 'revise_dans': 's_acquiert_par',
    'sequence_avant': 'se_concretise_dans',
    'developpe': 'se_decline_en', 'vise': 'se_concretise_dans',
    'mobilise': 's_acquiert_par', 'evalue': 'se_verifie_par',
    'verifie': 'se_verifie_par', 'requiert': 's_appuie_sur',
    'sappuie_sur': 's_appuie_sur'
};
function trouverConfigLien(typeId) {
    var t = TYPES_LIENS.find(function(tl) { return tl.id === typeId; });
    if (t) return t;
    var compat = VERBES_COMPAT[typeId];
    if (compat) return TYPES_LIENS.find(function(tl) { return tl.id === compat; });
    return null;
}

var TYPES_PREALABLE = { 'factuelle': true, 'conceptuelle': true, 'procedurale': true, 'metacognitive': true };

function obtenirLabelNoeud(donnees) {
    var config = TYPES[donnees.type];
    if (!config) return '';
    if (TYPES_PREALABLE[donnees.type] && donnees.metadata && donnees.metadata.prealable) {
        return config.label + ' préalable';
    }
    return config.label;
}

function obtenirCouleurNoeud(donnees) {
    var config = TYPES[donnees.type];
    if (!config) return '#94a3b8';
    if (TYPES_PREALABLE[donnees.type] && donnees.metadata && donnees.metadata.prealable) {
        return 'var(--planif-couleur-prerequis)';
    }
    return config.couleur;
}

function mettreAJourApparenceNoeud(donnees) {
    var el = document.getElementById(donnees.id);
    if (!el) return;
    var couleur = obtenirCouleurNoeud(donnees);
    el.style.borderColor = couleur;
    var typeEl = el.querySelector('.planif-noeud-type');
    if (typeEl) {
        typeEl.textContent = obtenirLabelNoeud(donnees);
        typeEl.style.color = couleur;
    }
    // Badge niveau cognitif
    var badgeCognitif = el.querySelector('.planif-badge-cognitif');
    if (donnees.metadata && donnees.metadata.niveauCognitif && TYPES_AVEC_NIVEAU_COGNITIF.indexOf(donnees.type) !== -1) {
        var nc = NIVEAUX_COGNITIFS.find(function(n) { return n.id === donnees.metadata.niveauCognitif; });
        if (nc) {
            if (!badgeCognitif) {
                badgeCognitif = document.createElement('span');
                badgeCognitif.className = 'planif-badge-cognitif';
                el.appendChild(badgeCognitif);
            }
            badgeCognitif.textContent = nc.label;
        }
    } else if (badgeCognitif) {
        badgeCognitif.remove();
    }
    mettreAJourBadge(donnees);
}

// Traverse la chaîne IM→IM pour trouver une compétence (toute direction de lien)
function ideeMaitresseAtteinCompetence(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var liens = getLiensDeNoeud(noeudId);
    for (var i = 0; i < liens.length; i++) {
        if (liens[i].noeudType === 'competence') return true;
        if (liens[i].noeudType === 'idee-maitresse') {
            if (ideeMaitresseAtteinCompetence(liens[i].noeudId, visited)) return true;
        }
    }
    return false;
}

// Traverse la chaîne IM→IM pour trouver une leçon (toute direction de lien)
function ideeMaitresseAtteinLecon(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var liens = getLiensDeNoeud(noeudId);
    for (var i = 0; i < liens.length; i++) {
        if (liens[i].noeudType === 'lecon' || liens[i].noeudType === 'sequence') return true;
    }
    return false;
}

// Traverse la chaîne horizontale connaissance→connaissance pour trouver un lien vers une activité
function connaissanceAtteinActivite(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var tousLesClones = trouverClones(noeudId);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    for (var i = 0; i < liens.length; i++) {
        var l = liens[i];
        if (l.noeudType === 'activite' || l.noeudType === 'soutien' || l.noeudType === 'revision') return true;
        if (TYPES_CONNAISSANCE.indexOf(l.noeudType) !== -1) {
            if (connaissanceAtteinActivite(l.noeudId, visited)) return true;
        }
    }
    return false;
}

// Traverse la chaîne IM→IM et descend via leçon→contenu→activité pour trouver une évaluation
function ideeMaitresseAtteinEvaluation(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var tousLesClones = trouverClones(noeudId);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    for (var i = 0; i < liens.length; i++) {
        var l = liens[i];
        // Lien direct vers une évaluation
        if (l.noeudType === 'evaluation') return true;
        // Traverser la chaîne IM→IM (complète, s'appuie sur)
        if (l.noeudType === 'idee-maitresse') {
            if (ideeMaitresseAtteinEvaluation(l.noeudId, visited)) return true;
        }
        // Descendre via leçon/séquence → enfants → évaluation
        if (l.noeudType === 'lecon' || l.noeudType === 'sequence') {
            var conteneur = etat.noeuds.get(l.noeudId);
            if (conteneur && conteneur.enfants) {
                for (var j = 0; j < conteneur.enfants.length; j++) {
                    var enfant = etat.noeuds.get(conteneur.enfants[j]);
                    if (!enfant) continue;
                    var liensEnfant = getLiensDeNoeud(enfant.id);
                    if (liensEnfant.some(function(le) { return le.noeudType === 'evaluation'; })) return true;
                    // Connaissance (factuelle/conceptuelle/procédurale/métacognitive) → activité → évaluation
                    if (TYPES_CONNAISSANCE.indexOf(enfant.type) !== -1) {
                        for (var k = 0; k < liensEnfant.length; k++) {
                            if (liensEnfant[k].noeudType === 'activite' || liensEnfant[k].noeudType === 'soutien' || liensEnfant[k].noeudType === 'revision') {
                                var liensAct = getLiensDeNoeud(liensEnfant[k].noeudId);
                                if (liensAct.some(function(la) { return la.noeudType === 'evaluation'; })) return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

// Retourne { entree: {valide, message}, sortie: {valide, message} }
// entree = amont (compétence/objectif), sortie = aval (leçon/activité)
// NOTE clones : Les LIENS sont agrégés sur tous les clones (identité partagée),
// mais le PARENT (containment) est vérifié sur le nœud courant seulement
// car chaque clone vit à sa propre position dans la hiérarchie.
function evaluerBadge(noeud) {
    var type = noeud.type;
    var tousLesClones = trouverClones(noeud.id);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    switch (type) {
        case 'competence':
            var devParIM = liens.some(function(l) { return l.noeudType === 'idee-maitresse'; });
            var compAtteinEval = devParIM && liens.some(function(l) {
                return l.noeudType === 'idee-maitresse' && ideeMaitresseAtteinEvaluation(l.noeudId);
            });
            var resComp = {
                entree: { valide: true, message: "Point de départ de l'alignement" },
                sortie: devParIM
                    ? { valide: true, message: "Se décline en idée(s) maîtresse(s)" }
                    : { valide: false, message: "Cette compétence ne se décline en aucune idée maîtresse" }
            };
            if (devParIM && !compAtteinEval) {
                resComp.avertissement = "Aucune évaluation ne vérifie cette compétence";
            }
            return resComp;

        case 'idee-maitresse':
            var atteinComp = ideeMaitresseAtteinCompetence(noeud.id);
            var atteinLecon = ideeMaitresseAtteinLecon(noeud.id);
            var atteinEval = ideeMaitresseAtteinEvaluation(noeud.id);
            var resIM = {
                entree: atteinComp
                    ? { valide: true, message: "Reliée à une compétence" }
                    : { valide: false, message: "Aucune compétence reliée (directement ou via une autre idée)" },
                sortie: atteinLecon
                    ? { valide: true, message: "Se concrétise dans une séquence ou leçon" }
                    : { valide: false, message: "Cette idée ne se concrétise dans aucune séquence ou leçon" }
            };
            if (atteinComp && atteinLecon && !atteinEval) {
                resIM.avertissement = "Cette idée ne se vérifie par aucune évaluation";
            }
            return resIM;

        case 'factuelle':
        case 'conceptuelle':
        case 'procedurale':
        case 'metacognitive':
            var labelConn = TYPES[type] ? TYPES[type].label.toLowerCase() : type;
            var dansLecon = noeud.parent && etat.noeuds.get(noeud.parent);
            var estDansLecon = dansLecon && dansLecon.type === 'lecon';
            var atteinActivite = connaissanceAtteinActivite(noeud.id);
            return {
                entree: estDansLecon
                    ? { valide: true, message: "Intégrée dans une leçon" }
                    : { valide: false, message: 'Cette connaissance ' + labelConn + " n'est dans aucune leçon" },
                sortie: atteinActivite
                    ? { valide: true, message: "Reliée à une activité" }
                    : { valide: false, message: "Aucune activité reliée (tracer un lien)" }
            };

        case 'activite':
        case 'soutien':
        case 'revision':
            var lieeConnaissanceE = liens.some(function(l) {
                return TYPES_CONNAISSANCE.indexOf(l.noeudType) !== -1;
            });
            return {
                entree: lieeConnaissanceE
                    ? { valide: true, message: "Reliée à du contenu" }
                    : { valide: false, message: "Aucune connaissance reliée (tracer un lien)" },
                sortie: lieeConnaissanceE
                    ? { valide: true, message: "Reliée à du contenu" }
                    : { valide: false, message: "Aucune connaissance reliée (tracer un lien)" }
            };

        case 'sequence':
            var contientLecon = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && e.type === 'lecon';
            });
            return {
                entree: { valide: true, message: "Structure organisationnelle" },
                sortie: contientLecon
                    ? { valide: true, message: "Contient au moins une leçon" }
                    : { valide: false, message: "Aucune leçon dans cette séquence" }
            };

        case 'lecon':
            var viseIM = liens.some(function(l) { return l.noeudType === 'idee-maitresse'; });
            var aConn = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && TYPES_CONNAISSANCE.indexOf(e.type) !== -1;
            });
            var aAct = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && (e.type === 'activite' || e.type === 'soutien' || e.type === 'revision');
            });
            var msgsSortie = [];
            if (!aConn) msgsSortie.push("Aucune connaissance");
            if (!aAct) msgsSortie.push("Aucune activité");
            return {
                entree: viseIM
                    ? { valide: true, message: "Reliée à une idée maîtresse" }
                    : { valide: false, message: "Aucune idée maîtresse ne se concrétise dans cette leçon" },
                sortie: msgsSortie.length === 0
                    ? { valide: true, message: "Contient du contenu et des activités" }
                    : { valide: false, message: msgsSortie.join(' · ') }
            };

        case 'evaluation':
            var typesAmontEval = ['idee-maitresse', 'factuelle', 'conceptuelle', 'procedurale', 'metacognitive'];
            var typesActivite = ['activite', 'soutien', 'revision'];
            var lieeActiviteOuContenu = liens.some(function(l) {
                return typesAmontEval.indexOf(l.noeudType) !== -1 || typesActivite.indexOf(l.noeudType) !== -1;
            });
            return {
                entree: lieeActiviteOuContenu
                    ? { valide: true, message: "Vérifie un objectif, une connaissance ou une activité" }
                    : { valide: false, message: "Aucun élément relié (tracer un lien vers une activité ou un contenu)" },
                sortie: { valide: true, message: "Preuve de réussite" }
            };

        default:
            return {
                entree: { valide: true, message: "" },
                sortie: { valide: true, message: "" }
            };
    }
}

function resoudreCouleur(cssVar) {
    if (!cssVar || !cssVar.startsWith('var(')) return cssVar;
    var temp = document.createElement('span');
    temp.style.color = cssVar;
    document.body.appendChild(temp);
    var resolved = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return resolved;
}

function appliquerBadge(badge, resultat, couleur) {
    if (resultat.valide) {
        badge.style.backgroundColor = couleur;
        badge.textContent = '\u2713';
        badge.title = resultat.message || '';
        badge.classList.remove('planif-badge-gris');
    } else {
        badge.style.backgroundColor = 'var(--gris-clair)';
        badge.textContent = '!';
        badge.title = resultat.message;
        badge.classList.add('planif-badge-gris');
    }
}

function mettreAJourBadge(donnees) {
    var el = document.getElementById(donnees.id);
    if (!el) return;
    var couleur = resoudreCouleur(obtenirCouleurNoeud(donnees));
    var resultat = evaluerBadge(donnees);

    // Badge entrée (amont — coin supérieur gauche)
    var badgeEntree = el.querySelector('.planif-badge-entree');
    if (!badgeEntree) {
        badgeEntree = document.createElement('span');
        badgeEntree.className = 'planif-badge-validation planif-badge-entree';
        el.appendChild(badgeEntree);
    }
    appliquerBadge(badgeEntree, resultat.entree, couleur);

    // Badge sortie (aval — coin supérieur droit)
    var badgeSortie = el.querySelector('.planif-badge-sortie');
    if (!badgeSortie) {
        badgeSortie = document.createElement('span');
        badgeSortie.className = 'planif-badge-validation planif-badge-sortie';
        el.appendChild(badgeSortie);
    }
    appliquerBadge(badgeSortie, resultat.sortie, couleur);

    // Triangle d'avertissement (non bloquant, ex: IM sans évaluation)
    var triangle = el.querySelector('.planif-badge-avertissement');
    if (resultat.avertissement) {
        if (!triangle) {
            triangle = document.createElement('span');
            triangle.className = 'planif-badge-avertissement';
            el.appendChild(triangle);
        }
        triangle.textContent = '\u26A0';
        triangle.title = resultat.avertissement;
        triangle.style.display = '';
    } else if (triangle) {
        triangle.style.display = 'none';
    }

    mettreAJourIndicateurClone(donnees);
}

function mettreAJourTousLesBadges() {
    for (var entry of etat.noeuds) {
        mettreAJourBadge(entry[1]);
    }
}

// === CONSTANTES ===
const OFFSET_X = 5000;
const OFFSET_Y = 3000;
const ESPACE_W = 10000;
const ESPACE_H = 6000;

// === RÉFÉRENCES DOM (initialisées dans initialiser()) ===
let zoneTravail, espace, espaceWrapper, coucheNoeuds, coucheLiens, canvas, lienTemp;
let panneau, menuLien, rectSelection;
let panneauSeances, panneauSeancesContenu, btnSeances;
let orgSelectSequence, orgSelectLecon, orgLecon, orgCalendrierContenu, orgCalendrierToggle;
let seancesOuvert = false;

// === UTILITAIRES DE COORDONNÉES ===
function clientVersData(clientX, clientY) {
    const rect = zoneTravail.getBoundingClientRect();
    return {
        x: (clientX - rect.left + zoneTravail.scrollLeft) / etat.zoom - OFFSET_X,
        y: (clientY - rect.top + zoneTravail.scrollTop) / etat.zoom - OFFSET_Y
    };
}

function clientVersEspace(clientX, clientY) {
    const rect = zoneTravail.getBoundingClientRect();
    return {
        x: (clientX - rect.left + zoneTravail.scrollLeft) / etat.zoom,
        y: (clientY - rect.top + zoneTravail.scrollTop) / etat.zoom
    };
}

// === ZOOM ===
function appliquerZoom() {
    espace.style.transform = 'scale(' + etat.zoom + ')';
    espaceWrapper.style.width = (ESPACE_W * etat.zoom) + 'px';
    espaceWrapper.style.height = (ESPACE_H * etat.zoom) + 'px';
}

function zoomer(clientX, clientY, facteur) {
    const oldZoom = etat.zoom;
    etat.zoom = Math.max(0.25, Math.min(3, etat.zoom * facteur));
    if (etat.zoom === oldZoom) return;

    appliquerZoom();

    const rect = zoneTravail.getBoundingClientRect();
    const cursorLocalX = clientX - rect.left;
    const cursorLocalY = clientY - rect.top;
    const espaceX = (cursorLocalX + zoneTravail.scrollLeft) / oldZoom;
    const espaceY = (cursorLocalY + zoneTravail.scrollTop) / oldZoom;
    zoneTravail.scrollLeft = espaceX * etat.zoom - cursorLocalX;
    zoneTravail.scrollTop = espaceY * etat.zoom - cursorLocalY;

    const zoomInfo = document.getElementById('planif-zoom-info');
    if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
    mettreAJourBoutonsZoomPreset();
}

function mettreAJourBoutonsZoomPreset() {
    var zoomArrondi = Math.round(etat.zoom * 100);
    var texte = zoomArrondi + '%';
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        var presetVal = Math.round(parseFloat(btn.dataset.zoom) * 100);
        btn.classList.toggle('actif', presetVal === zoomArrondi);
    });
    var infoHeader = document.getElementById('planif-zoom-info-header');
    if (infoHeader) infoHeader.textContent = texte;
    var infoFooter = document.getElementById('planif-zoom-info');
    if (infoFooter) infoFooter.textContent = texte;
}

// === CRÉER UN NŒUD ===
function creerNoeud(type, x, y) {
    enregistrerPourUndo();
    const id = 'planif-noeud_' + (++etat.compteur);
    const config = TYPES[type];

    const donnees = {
        id: id, type: type,
        titre: '',
        description: '',
        x: x, y: y,
        parent: null,
        enfants: [],
        metadata: {},
        cloneSourceId: null
    };
    etat.noeuds.set(id, donnees);

    const estConteneur = config.conteneur === true;

    const el = document.createElement('div');
    el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + type;
    el.id = id;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.borderColor = estConteneur ? '' : obtenirCouleurNoeud(donnees);

    if (estConteneur) {
        el.innerHTML =
            '<div class="planif-noeud-entete">' +
                '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
            '</div>' +
            '<div class="planif-noeud-titre" contenteditable="true"></div>' +
            '<div class="planif-noeud-zone planif-vide"></div>' +
            '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
            '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
            '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
            '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
    } else {
        el.innerHTML =
            '<div class="planif-noeud-entete">' +
                '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
            '</div>' +
            '<div class="planif-noeud-titre" contenteditable="true"></div>' +
            '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
            '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
            '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
            '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
    }

    attacherEvenements(el, donnees);
    coucheNoeuds.appendChild(el);

    const titreEl = el.querySelector('.planif-noeud-titre');
    setTimeout(function() { titreEl.focus(); }, 50);

    sauvegarder();
    return id;
}

// === SÉLECTION ===
function selectionnerNoeud(id) {
    if (etat.selection) {
        const ancien = document.getElementById(etat.selection);
        if (ancien) ancien.classList.remove('selected');
    }
    etat.selection = id;
    if (id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('selected');
    }
    fermerMenuLien();
}

function deselectionnerTout() {
    if (etat.selection) {
        const ancien = document.getElementById(etat.selection);
        if (ancien) ancien.classList.remove('selected');
        etat.selection = null;
    }
    for (const nid of etat.multiSelection) {
        const el = document.getElementById(nid);
        if (el) el.classList.remove('selected');
    }
    etat.multiSelection.clear();
}

function toggleMultiSelection(id) {
    if (etat.multiSelection.has(id)) {
        etat.multiSelection.delete(id);
        const el = document.getElementById(id);
        if (el) el.classList.remove('selected');
    } else {
        if (etat.selection && !etat.multiSelection.has(etat.selection)) {
            etat.multiSelection.add(etat.selection);
        }
        etat.multiSelection.add(id);
        const el = document.getElementById(id);
        if (el) el.classList.add('selected');
    }
}

function toutSelectionner() {
    etat.multiSelection.clear();
    for (const [nid] of etat.noeuds) {
        etat.multiSelection.add(nid);
        const el = document.getElementById(nid);
        if (el) el.classList.add('selected');
    }
}

function deselectionner() {
    deselectionnerTout();
    fermerPanneau();
    // Reset mode individuel
    if (etat.modeIndividuel) {
        var mEl = document.getElementById(etat.modeIndividuel);
        if (mEl) mEl.classList.remove('planif-mode-individuel');
        etat.modeIndividuel = null;
    }
}

// === PANNEAU LATÉRAL ===
function ouvrirPanneau(id) {
    const donnees = etat.noeuds.get(id);
    if (!donnees) return;
    if (!donnees.metadata) donnees.metadata = {};
    const config = TYPES[donnees.type];

    document.getElementById('planif-panneau-pastille').style.background = obtenirCouleurNoeud(donnees);
    document.getElementById('planif-panneau-type').textContent = obtenirLabelNoeud(donnees);
    document.getElementById('planif-panneau-titre').value = donnees.titre;
    document.getElementById('planif-panneau-description').value = donnees.description || '';

    // Champs extra selon le type
    const extra = document.getElementById('planif-panneau-extra');
    extra.innerHTML = '';

    if (donnees.type === 'activite' || donnees.type === 'lecon') {
        var meta = donnees.metadata;
        var hasDuree = meta.duree || meta.periodes || meta.minutesParPeriode;
        extra.innerHTML +=
            '<div class="planif-duree-section" id="planif-duree-section" style="' + (hasDuree ? '' : 'display:none') + '">' +
                '<label>Dur\u00e9e</label>' +
                '<div class="planif-duree-calc">' +
                    '<input type="number" id="planif-duree-per" value="' + (meta.periodes || '') + '" min="1" max="10" placeholder="P\u00e9r.">' +
                    '<span class="planif-duree-sep">\u00d7</span>' +
                    '<input type="number" id="planif-duree-mpp" value="' + (meta.minutesParPeriode || '') + '" min="1" max="120" placeholder="Min/p\u00e9r.">' +
                    '<span class="planif-duree-sep">=</span>' +
                    '<span class="planif-duree-total" id="planif-duree-total">' + (meta.duree ? meta.duree + '\u2009min' : '') + '</span>' +
                '</div>' +
            '</div>' +
            '<button type="button" class="planif-duree-ajouter" id="planif-duree-ajouter" style="' + (hasDuree ? 'display:none' : '') + '">+ Dur\u00e9e</button>';

        function recalcDuree() {
            var per = parseInt(document.getElementById('planif-duree-per').value) || 0;
            var mpp = parseInt(document.getElementById('planif-duree-mpp').value) || 0;
            var total = per * mpp;
            meta.periodes = per || null;
            meta.minutesParPeriode = mpp || null;
            meta.duree = total || null;
            document.getElementById('planif-duree-total').textContent = total ? total + '\u2009min' : '';
            propagerModification(id, 'metadata', JSON.parse(JSON.stringify(meta)));
            sauvegarder();
        }

        var perInput = extra.querySelector('#planif-duree-per');
        var mppInput = extra.querySelector('#planif-duree-mpp');
        perInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        mppInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        perInput.addEventListener('input', recalcDuree);
        mppInput.addEventListener('input', recalcDuree);

        extra.querySelector('#planif-duree-ajouter').addEventListener('click', function() {
            document.getElementById('planif-duree-section').style.display = '';
            this.style.display = 'none';
            document.getElementById('planif-duree-per').focus();
        });
    }

    if (donnees.type === 'sequence') {
        extra.innerHTML +=
            '<label for="planif-panneau-sem-debut">Semaine début</label>' +
            '<input type="number" id="planif-panneau-sem-debut" value="' + (donnees.metadata.semaineDebut || '') + '" min="1" max="15" placeholder="1">' +
            '<label for="planif-panneau-sem-fin">Semaine fin</label>' +
            '<input type="number" id="planif-panneau-sem-fin" value="' + (donnees.metadata.semaineFin || '') + '" min="1" max="15" placeholder="5">';
        var semDebutInput = extra.querySelector('#planif-panneau-sem-debut');
        semDebutInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semDebutInput.addEventListener('input', function(e) {
            donnees.metadata.semaineDebut = parseInt(e.target.value) || null;
            propagerModification(id, 'metadata', JSON.parse(JSON.stringify(donnees.metadata)));
            sauvegarder();
        });
        var semFinInput = extra.querySelector('#planif-panneau-sem-fin');
        semFinInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semFinInput.addEventListener('input', function(e) {
            donnees.metadata.semaineFin = parseInt(e.target.value) || null;
            propagerModification(id, 'metadata', JSON.parse(JSON.stringify(donnees.metadata)));
            sauvegarder();
        });
    }

    if (TYPES_PREALABLE[donnees.type]) {
        var checked = donnees.metadata && donnees.metadata.prealable ? ' checked' : '';
        extra.innerHTML +=
            '<div class="planif-panneau-prealable">' +
                '<label class="planif-checkbox-label">' +
                    '<input type="checkbox" id="planif-panneau-prealable"' + checked + '>' +
                    ' Préalable' +
                '</label>' +
            '</div>';
        extra.querySelector('#planif-panneau-prealable').addEventListener('change', function(e) {
            enregistrerPourUndo();
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.prealable = e.target.checked;
            mettreAJourApparenceNoeud(donnees);
            document.getElementById('planif-panneau-pastille').style.background = obtenirCouleurNoeud(donnees);
            document.getElementById('planif-panneau-type').textContent = obtenirLabelNoeud(donnees);
            sauvegarder();
        });
    }

    if (donnees.type === 'evaluation') {
        var retros = [['aucune', 'Aucune'], ['orale', 'Orale'], ['ecrite', 'Écrite'], ['pairs', 'Par les pairs']];
        var retVal = donnees.metadata.retroaction || 'aucune';
        var htmlRetro = '<label for="planif-panneau-retroaction">Rétroaction</label>' +
            '<select id="planif-panneau-retroaction">';
        for (var ri = 0; ri < retros.length; ri++) {
            htmlRetro += '<option value="' + retros[ri][0] + '"' + (retVal === retros[ri][0] ? ' selected' : '') + '>' + retros[ri][1] + '</option>';
        }
        htmlRetro += '</select>';

        var prodVal = donnees.metadata.productionId || '';
        var productions = chargerProductions();
        var htmlProd = '<label for="planif-panneau-production">Production</label>' +
            '<select id="planif-panneau-production">' +
            '<option value="">Aucune</option>';
        if (productions.length > 0) {
            var parType = {};
            for (var pp = 0; pp < productions.length; pp++) {
                var tp = productions[pp].type || 'autre';
                if (!parType[tp]) parType[tp] = [];
                parType[tp].push(productions[pp]);
            }
            var typesOrdre = ['travail', 'examen', 'projet', 'quiz', 'autre'];
            var typesLabels = { travail: 'Travaux', examen: 'Examens', projet: 'Projets', quiz: 'Quiz', autre: 'Autres' };
            for (var ti = 0; ti < typesOrdre.length; ti++) {
                var grp = parType[typesOrdre[ti]];
                if (!grp || grp.length === 0) continue;
                htmlProd += '<optgroup label="' + (typesLabels[typesOrdre[ti]] || typesOrdre[ti]) + '">';
                for (var pi = 0; pi < grp.length; pi++) {
                    var selAttr = prodVal === grp[pi].id ? ' selected' : '';
                    htmlProd += '<option value="' + grp[pi].id + '"' + selAttr + '>' + grp[pi].nom + ' (' + (grp[pi].ponderation || 0) + ' %)</option>';
                }
                htmlProd += '</optgroup>';
            }
        }
        htmlProd += '</select>';

        extra.innerHTML += htmlRetro + htmlProd;

        extra.querySelector('#planif-panneau-retroaction').addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.retroaction = e.target.value;
            sauvegarder();
        });
        extra.querySelector('#planif-panneau-production').addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.productionId = e.target.value || null;
            sauvegarder();
        });
    }

    // Sélecteur de niveau cognitif (Anderson)
    if (TYPES_AVEC_NIVEAU_COGNITIF.indexOf(donnees.type) !== -1) {
        var niveauVal = donnees.metadata.niveauCognitif || '';
        var htmlNiveau = '<label for="planif-panneau-niveau-cognitif">Niveau cognitif</label>' +
            '<select id="planif-panneau-niveau-cognitif">' +
            '<option value="">— Non défini —</option>';
        for (var ni = 0; ni < NIVEAUX_COGNITIFS.length; ni++) {
            var nc = NIVEAUX_COGNITIFS[ni];
            htmlNiveau += '<option value="' + nc.id + '"' + (niveauVal === nc.id ? ' selected' : '') + '>' + nc.ordre + '. ' + nc.label + '</option>';
        }
        htmlNiveau += '</select>';
        htmlNiveau += '<div id="planif-panneau-niveau-desc" class="planif-panneau-niveau-desc"></div>';
        htmlNiveau += '<div id="planif-panneau-verbes" class="planif-panneau-verbes"></div>';
        extra.innerHTML += htmlNiveau;

        var selectNiveau = extra.querySelector('#planif-panneau-niveau-cognitif');
        var descDiv = extra.querySelector('#planif-panneau-niveau-desc');
        var verbesDiv = extra.querySelector('#planif-panneau-verbes');

        function afficherVerbes(niveauId) {
            if (!niveauId) {
                descDiv.textContent = '';
                verbesDiv.innerHTML = '';
                return;
            }
            var niveauObj = NIVEAUX_COGNITIFS.find(function(n) { return n.id === niveauId; });
            if (niveauObj) descDiv.textContent = niveauObj.description;
            var verbes = BANQUE_VERBES[niveauId] || [];
            verbesDiv.innerHTML = '';
            for (var vi = 0; vi < verbes.length; vi++) {
                var tag = document.createElement('button');
                tag.type = 'button';
                tag.className = 'planif-verbe-tag';
                tag.textContent = verbes[vi];
                tag.dataset.verbe = verbes[vi];
                tag.addEventListener('click', function() {
                    var verbe = this.dataset.verbe;
                    var titreInput = document.getElementById('planif-panneau-titre');
                    if (titreInput) {
                        var titreCourant = titreInput.value.trim();
                        if (!titreCourant.toLowerCase().startsWith(verbe.toLowerCase())) {
                            enregistrerPourUndo();
                            var nouveauTitre = verbe.charAt(0).toUpperCase() + verbe.slice(1) + (titreCourant ? ' ' + titreCourant : '');
                            titreInput.value = nouveauTitre;
                            titreInput.dispatchEvent(new Event('input'));
                        }
                    }
                });
                verbesDiv.appendChild(tag);
            }
        }
        afficherVerbes(niveauVal);

        selectNiveau.addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.niveauCognitif = e.target.value || null;
            afficherVerbes(e.target.value);
            mettreAJourApparenceNoeud(donnees);
            sauvegarder();
        });
    }

    // Événements du panneau
    document.getElementById('planif-panneau-titre').onfocus = function() {
        enregistrerPourUndo();
    };
    document.getElementById('planif-panneau-titre').oninput = function(e) {
        donnees.titre = e.target.value;
        const titreEl = document.getElementById(id);
        if (titreEl) {
            const t = titreEl.querySelector('.planif-noeud-titre');
            if (t) t.textContent = donnees.titre;
        }
        propagerModification(id, 'titre', e.target.value);
    };

    document.getElementById('planif-panneau-description').onfocus = function() {
        enregistrerPourUndo();
    };
    document.getElementById('planif-panneau-description').oninput = function(e) {
        donnees.description = e.target.value;
        propagerModification(id, 'description', e.target.value);
        sauvegarder();
    };

    // Clone info
    var cloneInfo = document.getElementById('planif-panneau-clone-info');
    if (cloneInfo) {
        if (doitAfficherIndicateurClone(donnees)) {
            var clones = trouverClones(id);
            var nb = clones.length;
            cloneInfo.style.display = '';
            cloneInfo.innerHTML = '<span class="planif-clone-compteur">\uD83E\uDDEC ' + nb + ' instance' + (nb > 1 ? 's' : '') + '</span>' +
                ' <a href="#" id="planif-clone-voir-autres" class="planif-clone-lien">Voir les autres</a>';
            var lienVoir = document.getElementById('planif-clone-voir-autres');
            if (lienVoir) {
                lienVoir.onclick = function(ev) {
                    ev.preventDefault();
                    var autresClones = trouverClones(id);
                    for (var ac = 0; ac < autresClones.length; ac++) {
                        if (autresClones[ac].id !== id) {
                            var elClone = document.getElementById(autresClones[ac].id);
                            if (elClone) {
                                elClone.classList.add('clone-surbrillance');
                                (function(el2) {
                                    setTimeout(function() { el2.classList.remove('clone-surbrillance'); }, 2500);
                                })(elClone);
                            }
                        }
                    }
                };
            }
        } else {
            cloneInfo.style.display = 'none';
            cloneInfo.innerHTML = '';
        }
    }

    // Bouton cloner
    var btnCloner = document.getElementById('planif-btn-cloner');
    if (btnCloner) {
        var estConteneur = config && config.conteneur;
        btnCloner.disabled = !!estConteneur;
        btnCloner.onclick = function() {
            clonerNoeud(id);
            fermerPanneau();
        };
    }

    document.getElementById('planif-btn-supprimer').onclick = function() {
        supprimerNoeud(id);
        fermerPanneau();
    };

    panneau.classList.add('visible');
    etat.panneauOuvert = true;
}

function fermerPanneau() {
    if (panneau) panneau.classList.remove('visible');
    etat.panneauOuvert = false;
}

// === SUPPRESSION ===
function supprimerNoeud(id) {
    enregistrerPourUndo();
    const donnees = etat.noeuds.get(id);

    // Clone transfer: if deleting an original that has clones, promote first clone
    if (donnees && !donnees.cloneSourceId && aDesClones(id)) {
        var clonesATransferer = [];
        for (var entry of etat.noeuds) {
            var n = entry[1];
            if (n.cloneSourceId === id) clonesATransferer.push(n);
        }
        // Désindexer tous les clones de l'ancien sourceId avant transfert
        for (var cdi = 0; cdi < clonesATransferer.length; cdi++) {
            _desindexerClone(clonesATransferer[cdi]);
        }
        if (clonesATransferer.length > 0) {
            var nouvelOriginal = clonesATransferer[0];
            nouvelOriginal.cloneSourceId = null;
            for (var ct = 1; ct < clonesATransferer.length; ct++) {
                clonesATransferer[ct].cloneSourceId = nouvelOriginal.id;
                _indexerClone(clonesATransferer[ct]);
            }
        }
    } else if (donnees) {
        _desindexerClone(donnees);
    }

    if (donnees && donnees.enfants) {
        for (const eid of [].concat(donnees.enfants)) {
            detacherDuConteneur(eid);
        }
    }

    if (donnees && donnees.parent) {
        detacherDuConteneur(id);
    }

    var liensASupprimer = [];
    for (const [lienId, lien] of etat.liens) {
        if (lien.source === id || lien.cible === id) {
            liensASupprimer.push(lienId);
        }
    }
    for (var li = 0; li < liensASupprimer.length; li++) {
        supprimerLien(liensASupprimer[li]);
    }
    etat.noeuds.delete(id);
    const el = document.getElementById(id);
    if (el) el.remove();
    if (etat.selection === id) etat.selection = null;

    // Update clone indicators for remaining clones
    if (donnees) {
        var sourceId = donnees.cloneSourceId || id;
        var restants = [];
        for (var entryR of etat.noeuds) {
            var nR = entryR[1];
            if (nR.id === sourceId || nR.cloneSourceId === sourceId) restants.push(nR);
        }
        for (var ri = 0; ri < restants.length; ri++) {
            mettreAJourIndicateurClone(restants[ri]);
        }
    }

    sauvegarder();
}

// === CLONAGE — UTILITAIRES ===
function mettreAJourIndicateurClone(noeud) {
    if (!noeud) return;
    var el = document.getElementById(noeud.id);
    if (!el) return;
    var indicateur = el.querySelector('.indicateur-clone');
    if (doitAfficherIndicateurClone(noeud)) {
        if (!indicateur) {
            indicateur = document.createElement('span');
            indicateur.className = 'indicateur-clone';
            indicateur.textContent = '\uD83E\uDDEC';
            indicateur.title = 'Ce nœud est un clone';
            el.appendChild(indicateur);
            indicateur.addEventListener('mouseenter', function() {
                var clones = trouverClones(noeud.id);
                for (var i = 0; i < clones.length; i++) {
                    if (clones[i].id !== noeud.id) {
                        var clEl = document.getElementById(clones[i].id);
                        if (clEl) clEl.classList.add('clone-surbrillance');
                    }
                }
            });
            indicateur.addEventListener('mouseleave', function() {
                var clones = trouverClones(noeud.id);
                for (var i = 0; i < clones.length; i++) {
                    if (clones[i].id !== noeud.id) {
                        var clEl = document.getElementById(clones[i].id);
                        if (clEl) clEl.classList.remove('clone-surbrillance');
                    }
                }
            });
        }
    } else {
        if (indicateur) indicateur.remove();
    }
}

// --- Maintenance de l'index inverse clones ---
function _indexerClone(noeud) {
    if (!noeud || !noeud.cloneSourceId) return;
    var set = _cloneIndex.get(noeud.cloneSourceId);
    if (!set) { set = new Set(); _cloneIndex.set(noeud.cloneSourceId, set); }
    set.add(noeud.id);
}

function _desindexerClone(noeud) {
    if (!noeud || !noeud.cloneSourceId) return;
    var set = _cloneIndex.get(noeud.cloneSourceId);
    if (set) {
        set.delete(noeud.id);
        if (set.size === 0) _cloneIndex.delete(noeud.cloneSourceId);
    }
}

function _reconstruireCloneIndex() {
    _cloneIndex.clear();
    for (var entry of etat.noeuds) {
        _indexerClone(entry[1]);
    }
}

function trouverClones(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    if (!donnees) return [];
    var sourceId = donnees.cloneSourceId || noeudId;
    var resultats = [];
    // L'original
    var original = etat.noeuds.get(sourceId);
    if (original) resultats.push(original);
    // Les clones via l'index
    var set = _cloneIndex.get(sourceId);
    if (set) {
        for (var cid of set) {
            var c = etat.noeuds.get(cid);
            if (c && c.id !== sourceId) resultats.push(c);
        }
    }
    return resultats;
}

function estClone(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    return donnees != null && donnees.cloneSourceId != null;
}

function aDesClones(noeudId) {
    var set = _cloneIndex.get(noeudId);
    return set != null && set.size > 0;
}

function doitAfficherIndicateurClone(noeud) {
    if (!noeud) return false;
    if (noeud.cloneSourceId) return true;
    return aDesClones(noeud.id);
}

function propagerModification(noeudId, champ, valeur) {
    var clones = trouverClones(noeudId);
    for (var i = 0; i < clones.length; i++) {
        var c = clones[i];
        if (c.id === noeudId) continue;
        if (champ === 'metadata') {
            c.metadata = JSON.parse(JSON.stringify(valeur));
        } else {
            c[champ] = valeur;
        }
        if (champ === 'titre') {
            var el = document.getElementById(c.id);
            if (el) {
                var t = el.querySelector('.planif-noeud-titre');
                if (t) t.textContent = valeur;
            }
        }
    }
}

function clonerNoeud(noeudId) {
    var source = etat.noeuds.get(noeudId);
    if (!source) return;
    var config = TYPES[source.type];
    if (config && config.conteneur) {
        afficherToastLien('Les conteneurs ne peuvent pas être clonés.');
        return;
    }
    enregistrerPourUndo();

    var DECALAGE = 60;
    var newId = 'planif-noeud_' + (++etat.compteur);
    var cloneSourceId = source.cloneSourceId || source.id;

    var donnees = {
        id: newId, type: source.type,
        titre: source.titre || '',
        description: source.description || '',
        x: source.x + DECALAGE, y: source.y + DECALAGE,
        parent: null,
        enfants: [],
        metadata: JSON.parse(JSON.stringify(source.metadata || {})),
        cloneSourceId: cloneSourceId
    };
    etat.noeuds.set(newId, donnees);
    _indexerClone(donnees);

    var el = document.createElement('div');
    el.className = 'planif-noeud planif-type-' + source.type;
    el.id = newId;
    el.style.left = donnees.x + 'px';
    el.style.top = donnees.y + 'px';
    el.style.borderColor = obtenirCouleurNoeud(donnees);

    el.innerHTML =
        '<div class="planif-noeud-entete">' +
            '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
        '</div>' +
        '<div class="planif-noeud-titre" contenteditable="true">' + (donnees.titre || '') + '</div>' +
        '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
        '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
        '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
        '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';

    attacherEvenements(el, donnees);
    coucheNoeuds.appendChild(el);

    mettreAJourIndicateurClone(donnees);
    var sourceOriginal = etat.noeuds.get(cloneSourceId);
    if (sourceOriginal) mettreAJourIndicateurClone(sourceOriginal);
    // Also update other clones' indicators
    var tousClones = trouverClones(newId);
    for (var ci = 0; ci < tousClones.length; ci++) {
        if (tousClones[ci].id !== newId && tousClones[ci].id !== cloneSourceId) {
            mettreAJourIndicateurClone(tousClones[ci]);
        }
    }

    selectionnerNoeud(newId);
    sauvegarder();
}

function supprimerLien(lienId) {
    enregistrerPourUndo();
    etat.liens.delete(lienId);
    const groupe = document.getElementById(lienId + '-groupe');
    if (groupe) groupe.remove();
    sauvegarder();
}

// === LIENS ===
function demarrerLien(noeudId, direction, e) {
    etat.lienEnCours = { noeudSourceId: noeudId, portDirection: direction };
    const pos = getPortPosition(noeudId, direction);
    lienTemp.setAttribute('x1', pos.x);
    lienTemp.setAttribute('y1', pos.y);
    lienTemp.setAttribute('x2', pos.x);
    lienTemp.setAttribute('y2', pos.y);
    lienTemp.style.display = 'block';

    function onMove(e2) {
        var p = clientVersData(e2.clientX, e2.clientY);
        lienTemp.setAttribute('x2', p.x);
        lienTemp.setAttribute('y2', p.y);
    }

    function onUp(e2) {
        lienTemp.style.display = 'none';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        var elSous = document.elementFromPoint(e2.clientX, e2.clientY);
        var noeudCibleEl = elSous ? elSous.closest('.planif-noeud') : null;
        if (noeudCibleEl && noeudCibleEl.id !== noeudId) {
            afficherMenuLien(e2.clientX, e2.clientY, noeudId, noeudCibleEl.id);
        }
        etat.lienEnCours = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function creerLien(sourceId, cibleId, typeLien) {
    // #130 : vérifier doublon avant création
    for (var entry of etat.liens) {
        var ex = entry[1];
        if (ex.source === sourceId && ex.cible === cibleId && ex.type === typeLien) {
            return ex.id;
        }
    }
    enregistrerPourUndo();
    var id = 'planif-lien_' + (++etat.compteurLiens);
    var donnees = { id: id, source: sourceId, cible: cibleId, type: typeLien };
    etat.liens.set(id, donnees);
    dessinerLien(donnees);

    // Re-layouter si les deux nœuds partagent le même conteneur
    var srcNode = etat.noeuds.get(sourceId);
    var cblNode = etat.noeuds.get(cibleId);
    if (srcNode && cblNode && srcNode.parent && srcNode.parent === cblNode.parent) {
        reLayoutConteneur(srcNode.parent);
    }

    sauvegarder();
    return id;
}

function dessinerLien(donnees) {
    var sourceEl = document.getElementById(donnees.source);
    var cibleEl = document.getElementById(donnees.cible);
    if (!sourceEl || !cibleEl) return;

    var ports = trouverMeilleursPorts(donnees.source, donnees.cible);
    var p1 = getPortPosition(donnees.source, ports.portSource);
    var p2 = getPortPosition(donnees.cible, ports.portCible);

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var tension = Math.max(Math.min(dist * 0.35, 80), 30);
    var cx1 = ports.portSource === 'droite' ? p1.x + tension : ports.portSource === 'gauche' ? p1.x - tension : p1.x;
    var cy1 = ports.portSource === 'bas' ? p1.y + tension : ports.portSource === 'haut' ? p1.y - tension : p1.y;
    var cx2 = ports.portCible === 'droite' ? p2.x + tension : ports.portCible === 'gauche' ? p2.x - tension : p2.x;
    var cy2 = ports.portCible === 'bas' ? p2.y + tension : ports.portCible === 'haut' ? p2.y - tension : p2.y;

    var ancien = document.getElementById(donnees.id + '-groupe');
    if (ancien) ancien.remove();

    var groupe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupe.id = donnees.id + '-groupe';
    groupe.setAttribute('class', 'planif-lien-groupe');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = donnees.id;
    path.setAttribute('d', 'M ' + p1.x + ' ' + p1.y + ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + p2.x + ' ' + p2.y);
    path.setAttribute('class', 'planif-lien');

    var sourceData = etat.noeuds.get(donnees.source);
    var couleur = (sourceData && TYPES[sourceData.type]) ? TYPES[sourceData.type].couleur : 'var(--planif-couleur-lien)';
    path.style.stroke = couleur;

    // Créer un marker de flèche dédié avec la couleur du lien
    var markerId = donnees.id + '-fleche';
    var ancienMarker = document.getElementById(markerId);
    if (ancienMarker) ancienMarker.remove();
    var defs = canvas.querySelector('defs');
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.id = markerId;
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('orient', 'auto-start-reverse');
    var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', couleur);
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    path.setAttribute('marker-end', 'url(#' + markerId + ')');

    path.addEventListener('click', function(e) {
        e.stopPropagation();
        afficherMenuLienExistant(e.clientX, e.clientY, donnees.id);
    });

    groupe.appendChild(path);

    var typeLienConfig = trouverConfigLien(donnees.type);
    if (typeLienConfig) {
        var mx = (p1.x + p2.x) / 2;
        var my = (p1.y + p2.y) / 2;
        // Fond blanc derrière le libellé pour la lisibilité
        var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('class', 'planif-lien-label-bg');
        var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.id = donnees.id + '-label';
        label.setAttribute('x', mx);
        label.setAttribute('y', my - 6);
        label.setAttribute('class', 'planif-lien-label');
        label.textContent = typeLienConfig.label;
        groupe.appendChild(bg);
        groupe.appendChild(label);
        // Ajuster le rect de fond après insertion (pour mesurer le texte)
        requestAnimationFrame(function() {
            try {
                var bbox = label.getBBox();
                bg.setAttribute('x', bbox.x - 3);
                bg.setAttribute('y', bbox.y - 1);
                bg.setAttribute('width', bbox.width + 6);
                bg.setAttribute('height', bbox.height + 2);
                bg.setAttribute('rx', '3');
            } catch(e) { console.warn('[Planif-Carte] SVG label bbox measurement failed:', e.message || e); }
        });
    }

    var poigneeSource = creerPoigneeLien(p1.x, p1.y, donnees.id, 'source');
    var poigneeCible = creerPoigneeLien(p2.x, p2.y, donnees.id, 'cible');
    groupe.appendChild(poigneeSource);
    groupe.appendChild(poigneeCible);

    coucheLiens.appendChild(groupe);
}

// === POIGNÉES DE RECONNEXION ===
function creerPoigneeLien(x, y, lienId, extremite) {
    var cercle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cercle.setAttribute('cx', x);
    cercle.setAttribute('cy', y);
    cercle.setAttribute('r', 7);
    cercle.setAttribute('class', 'planif-lien-poignee');
    cercle.setAttribute('data-lien', lienId);
    cercle.setAttribute('data-extremite', extremite);

    cercle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        demarrerReconnexion(lienId, extremite, e);
    });

    return cercle;
}

function demarrerReconnexion(lienId, extremite, e) {
    var lien = etat.liens.get(lienId);
    if (!lien) return;

    var noeudFixeId = extremite === 'source' ? lien.cible : lien.source;
    var groupeEl = document.getElementById(lienId + '-groupe');
    if (groupeEl) groupeEl.style.opacity = '0.2';

    var fixePos = getCentre(noeudFixeId);
    lienTemp.setAttribute('x1', fixePos.x);
    lienTemp.setAttribute('y1', fixePos.y);
    var pInit = clientVersData(e.clientX, e.clientY);
    lienTemp.setAttribute('x2', pInit.x);
    lienTemp.setAttribute('y2', pInit.y);
    lienTemp.style.display = 'block';

    function onMove(e2) {
        var p = clientVersData(e2.clientX, e2.clientY);
        lienTemp.setAttribute('x2', p.x);
        lienTemp.setAttribute('y2', p.y);
    }

    function onUp(e2) {
        lienTemp.style.display = 'none';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        var elSous = document.elementFromPoint(e2.clientX, e2.clientY);
        var noeudCibleEl = elSous && elSous.closest ? elSous.closest('.planif-noeud') : null;

        if (noeudCibleEl && noeudCibleEl.id !== noeudFixeId) {
            enregistrerPourUndo();
            if (extremite === 'source') {
                lien.source = noeudCibleEl.id;
            } else {
                lien.cible = noeudCibleEl.id;
            }
            dessinerLien(lien);
            sauvegarder();
        } else {
            if (groupeEl) groupeEl.style.opacity = '1';
        }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function mettreAJourLiens(noeudId) {
    for (var entry of etat.liens) {
        var lien = entry[1];
        if (lien.source === noeudId || lien.cible === noeudId) {
            dessinerLien(lien);
        }
    }
}

// === MENU TYPE DE LIEN ===
function afficherMenuLien(x, y, sourceId, cibleId) {
    var resolution = resoudreVerbe(sourceId, cibleId);
    if (!resolution) {
        // Lien invalide — afficher un message discret
        var src = etat.noeuds.get(sourceId);
        var cbl = etat.noeuds.get(cibleId);
        var srcLabel = src ? (TYPES[src.type] ? TYPES[src.type].label : src.type) : '?';
        var cblLabel = cbl ? (TYPES[cbl.type] ? TYPES[cbl.type].label : cbl.type) : '?';
        afficherToastLien('Ce lien n\'est pas possible entre ' + srcLabel + ' et ' + cblLabel + '.');
        return;
    }

    // Vertical : verbe automatique, pas de popup
    if (resolution.type === 'vertical') {
        creerLien(resolution.source, resolution.cible, resolution.verbe);
        return;
    }

    // Horizontal : popup de choix de verbe
    menuLien.innerHTML = '';
    var titre = document.createElement('div');
    titre.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    titre.textContent = 'Type de relation';
    menuLien.appendChild(titre);

    for (var vi = 0; vi < resolution.verbes.length; vi++) {
        (function(verbeId) {
            var cfg = trouverConfigLien(verbeId);
            var btn = document.createElement('button');
            btn.textContent = cfg ? cfg.label : verbeId;
            btn.addEventListener('click', function() {
                creerLien(resolution.source, resolution.cible, verbeId);
                fermerMenuLien();
            });
            menuLien.appendChild(btn);
        })(resolution.verbes[vi]);
    }

    var posMenu = clientVersEspace(x, y);
    menuLien.style.left = posMenu.x + 'px';
    menuLien.style.top = posMenu.y + 'px';
    menuLien.style.display = 'block';
}

function afficherToastLien(message) {
    var toast = document.createElement('div');
    toast.className = 'planif-toast-lien';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('planif-toast-visible'); }, 10);
    setTimeout(function() {
        toast.classList.remove('planif-toast-visible');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

function afficherMenuLienExistant(x, y, lienId) {
    var lien = etat.liens.get(lienId);
    if (!lien) return;

    // Déterminer les verbes pertinents pour ce couple source-cible
    var resolution = resoudreVerbe(lien.source, lien.cible);
    var verbesPertinents = [];
    if (resolution) {
        if (resolution.type === 'vertical') {
            verbesPertinents = [resolution.verbe];
        } else {
            verbesPertinents = resolution.verbes;
        }
    }
    // Toujours inclure le verbe actuel normalisé (même si la résolution a changé)
    var verbeNormalise = VERBES_COMPAT[lien.type] || lien.type;
    if (verbeNormalise && verbesPertinents.indexOf(verbeNormalise) === -1) {
        verbesPertinents.push(verbeNormalise);
    }

    menuLien.innerHTML = '';

    // Titre du menu
    var titre = document.createElement('div');
    titre.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    titre.textContent = 'Verbe du lien';
    menuLien.appendChild(titre);

    // Boutons pour chaque verbe pertinent
    for (var vi = 0; vi < verbesPertinents.length; vi++) {
        (function(verbeId) {
            var cfg = trouverConfigLien(verbeId);
            var btn = document.createElement('button');
            btn.textContent = cfg ? cfg.label : verbeId;
            if (lien.type === verbeId) btn.classList.add('actif');
            btn.addEventListener('click', function() {
                if (lien.type !== verbeId) {
                    enregistrerPourUndo();
                    lien.type = verbeId;
                    dessinerLien(lien);
                    sauvegarder();
                }
                fermerMenuLien();
            });
            menuLien.appendChild(btn);
        })(verbesPertinents[vi]);
    }

    var sep = document.createElement('hr');
    sep.style.cssText = 'border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;';
    menuLien.appendChild(sep);

    var btnSuppr = document.createElement('button');
    btnSuppr.textContent = 'Supprimer ce lien';
    btnSuppr.classList.add('u-texte-danger');
    btnSuppr.addEventListener('click', function() {
        supprimerLien(lienId);
        fermerMenuLien();
    });
    menuLien.appendChild(btnSuppr);

    var posMenu = clientVersEspace(x, y);
    menuLien.style.left = posMenu.x + 'px';
    menuLien.style.top = posMenu.y + 'px';
    menuLien.style.display = 'block';
}

function fermerMenuLien() {
    if (menuLien) menuLien.style.display = 'none';
}

// === UTILITAIRES GÉOMÉTRIQUES ===
function getCentre(noeudId) {
    var el = document.getElementById(noeudId);
    if (!el) return { x: 0, y: 0 };
    var donnees = etat.noeuds.get(noeudId);
    return {
        x: donnees.x + el.offsetWidth / 2,
        y: donnees.y + el.offsetHeight / 2
    };
}

function getPortPosition(noeudId, direction) {
    var el = document.getElementById(noeudId);
    var donnees = etat.noeuds.get(noeudId);
    if (!el || !donnees) return { x: 0, y: 0 };

    var w = el.offsetWidth;
    var h = el.offsetHeight;

    switch (direction) {
        case 'droite': return { x: donnees.x + w, y: donnees.y + h / 2 };
        case 'gauche': return { x: donnees.x, y: donnees.y + h / 2 };
        case 'bas':    return { x: donnees.x + w / 2, y: donnees.y + h };
        case 'haut':   return { x: donnees.x + w / 2, y: donnees.y };
        default:       return getCentre(noeudId);
    }
}

function trouverMeilleursPorts(sourceId, cibleId) {
    var s = getCentre(sourceId);
    var c = getCentre(cibleId);
    var dx = c.x - s.x;
    var dy = c.y - s.y;

    var portSource, portCible;
    if (Math.abs(dx) > Math.abs(dy)) {
        portSource = dx > 0 ? 'droite' : 'gauche';
        portCible = dx > 0 ? 'gauche' : 'droite';
    } else {
        portSource = dy > 0 ? 'bas' : 'haut';
        portCible = dy > 0 ? 'haut' : 'bas';
    }
    return { portSource: portSource, portCible: portCible };
}

// === GESTION DES CONTENEURS ===
function trouverConteneurRacine(noeudId) {
    var n = etat.noeuds.get(noeudId);
    if (!n || !n.parent) return noeudId;
    return trouverConteneurRacine(n.parent);
}

function collecterDescendants(racine, parent, liste) {
    var enfants = parent.enfants || [];
    for (var i = 0; i < enfants.length; i++) {
        var eid = enfants[i];
        var ed = etat.noeuds.get(eid);
        if (!ed) continue;
        liste.push({ id: eid, dx: ed.x - racine.x, dy: ed.y - racine.y });
        if (TYPES[ed.type] && TYPES[ed.type].conteneur && ed.enfants) {
            collecterDescendants(racine, ed, liste);
        }
    }
}

function peutContenir(conteneurType, enfantType) {
    if (conteneurType === 'sequence') return enfantType === 'lecon';
    if (conteneurType === 'lecon') return enfantType === 'activite' || enfantType === 'soutien' || enfantType === 'revision' || TYPES_CONNAISSANCE.indexOf(enfantType) !== -1 || enfantType === 'evaluation';
    return false;
}

function trouverConteneurPour(clientX, clientY, excludeId, enfantType) {
    var data = clientVersData(clientX, clientY);
    var meilleur = null;
    var meilleurAire = Infinity;
    for (var entry of etat.noeuds) {
        var cid = entry[0];
        var cdata = entry[1];
        if (cid === excludeId) continue;
        var config = TYPES[cdata.type];
        if (!config || !config.conteneur) continue;
        if (!peutContenir(cdata.type, enfantType)) continue;
        if (estDescendantDe(cid, excludeId)) continue;
        var cel = document.getElementById(cid);
        if (!cel) continue;
        var w = parseFloat(cel.style.width) || cel.offsetWidth || 200;
        var h = parseFloat(cel.style.height) || cel.offsetHeight || 80;
        if (data.x >= cdata.x && data.x <= cdata.x + w && data.y >= cdata.y && data.y <= cdata.y + h) {
            var aire = w * h;
            if (aire < meilleurAire) {
                meilleur = cid;
                meilleurAire = aire;
            }
        }
    }
    return meilleur;
}

function estDescendantDe(candidatId, noeudId, visited) {
    if (!visited) visited = new Set();
    if (visited.has(noeudId)) return false;
    visited.add(noeudId);
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud || !noeud.enfants) return false;
    for (var i = 0; i < noeud.enfants.length; i++) {
        if (noeud.enfants[i] === candidatId) return true;
        if (estDescendantDe(candidatId, noeud.enfants[i], visited)) return true;
    }
    return false;
}

function rattacherAuConteneur(noeudId, conteneurId) {
    var noeud = etat.noeuds.get(noeudId);
    var conteneur = etat.noeuds.get(conteneurId);
    if (!noeud || !conteneur) return;

    if (noeud.parent && noeud.parent !== conteneurId) {
        detacherDuConteneur(noeudId);
    }

    noeud.parent = conteneurId;
    if (!conteneur.enfants) conteneur.enfants = [];
    if (!conteneur.enfants.includes(noeudId)) {
        conteneur.enfants.push(noeudId);
    }

    var el = document.getElementById(noeudId);
    if (el) el.classList.add('planif-enfant-conteneur');
    reLayoutAvecAnimation(conteneurId);
}

function detacherDuConteneur(noeudId) {
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud || !noeud.parent) return;

    var ancienParentId = noeud.parent;
    var ancienParent = etat.noeuds.get(ancienParentId);
    if (ancienParent && ancienParent.enfants) {
        ancienParent.enfants = ancienParent.enfants.filter(function(eid) { return eid !== noeudId; });
    }

    noeud.parent = null;
    var el = document.getElementById(noeudId);
    if (el) el.classList.remove('planif-enfant-conteneur');

    if (ancienParent) {
        if (ancienParent.enfants && ancienParent.enfants.length > 0) {
            reLayoutConteneur(ancienParentId);
        } else {
            mettreAJourZoneConteneur(ancienParentId);
        }
    }
}

var _layoutEnCours = new Set();
var _zoneEnCours = new Set();
var LAYOUT_GAP = 60;
var LAYOUT_PADDING = 30;
var LAYOUT_HEADER_H = 45;

function reLayoutAvecAnimation(conteneurId) {
    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) return;
    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var elements = [];
    for (var i = 0; i < enfants.length; i++) {
        var eel = document.getElementById(enfants[i]);
        if (eel) {
            eel.classList.add('planif-snap-transition');
            elements.push(eel);
        }
    }
    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.classList.add('planif-snap-transition');
        elements.push(cel);
    }
    reLayoutConteneur(conteneurId);
    setTimeout(function() {
        for (var j = 0; j < elements.length; j++) {
            elements[j].classList.remove('planif-snap-transition');
        }
    }, 350);
}

function reLayoutConteneur(conteneurId) {
    if (_layoutEnCours.has(conteneurId)) return;
    _layoutEnCours.add(conteneurId);

    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) { _layoutEnCours.delete(conteneurId); return; }
    var config = TYPES[conteneur.type];
    if (!config || !config.conteneur) { _layoutEnCours.delete(conteneurId); return; }

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    if (enfants.length === 0) {
        mettreAJourZoneConteneur(conteneurId);
        _layoutEnCours.delete(conteneurId);
        return;
    }

    // Recursively layout nested containers first
    var aDesEnfantsConteneurs = false;
    for (var i = 0; i < enfants.length; i++) {
        var ed = etat.noeuds.get(enfants[i]);
        if (ed && TYPES[ed.type] && TYPES[ed.type].conteneur) {
            aDesEnfantsConteneurs = true;
            if (ed.enfants && ed.enfants.length > 0) {
                reLayoutConteneur(enfants[i]);
            }
        }
    }

    // Conteneurs avec enfants-conteneurs (ex: séquence → leçons) : disposition libre
    if (aDesEnfantsConteneurs) {
        _layoutEnCours.delete(conteneurId);
        mettreAJourZoneConteneur(conteneurId);
        return;
    }

    // Enfants feuilles (ex: leçon → activités) : colonne verticale centrée
    // Sort children by Y position
    enfants.sort(function(a, b) {
        var da = etat.noeuds.get(a);
        var db = etat.noeuds.get(b);
        return (da ? da.y : 0) - (db ? db.y : 0);
    });
    conteneur.enfants = enfants;

    var GAP = LAYOUT_GAP;
    var PADDING = LAYOUT_PADDING;
    var HEADER_H = LAYOUT_HEADER_H;

    // Measure children widths/heights
    var maxW = 0;
    var totalH = 0;
    var dims = [];
    for (var j = 0; j < enfants.length; j++) {
        var eel = document.getElementById(enfants[j]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        dims.push({ w: w, h: h });
        if (w > maxW) maxW = w;
        totalH += h;
    }
    totalH += GAP * (enfants.length - 1);

    // Container dimensions
    var newW = maxW + PADDING * 2;
    var newH = totalH + PADDING * 2 + HEADER_H;

    // Stack children in centered column
    var curY = conteneur.y + HEADER_H + PADDING;
    for (var k = 0; k < enfants.length; k++) {
        var ed2 = etat.noeuds.get(enfants[k]);
        if (!ed2) continue;
        ed2.x = conteneur.x + (newW - dims[k].w) / 2;
        ed2.y = curY;
        var eel2 = document.getElementById(enfants[k]);
        if (eel2) {
            eel2.style.left = ed2.x + 'px';
            eel2.style.top = ed2.y + 'px';
        }
        mettreAJourLiens(enfants[k]);
        curY += dims[k].h + GAP;
    }

    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.style.width = newW + 'px';
        cel.style.height = newH + 'px';
        cel.style.borderColor = obtenirCouleurNoeud(conteneur);
        cel.classList.add('planif-a-enfants');
        var zone = cel.querySelector('.planif-noeud-zone');
        if (zone) zone.classList.remove('planif-vide');
    }

    mettreAJourLiens(conteneurId);

    _layoutEnCours.delete(conteneurId);

    // Recurse to parent
    if (conteneur.parent) {
        reLayoutConteneur(conteneur.parent);
    }
}

function reLayoutConteneurSaufDragged(conteneurId, draggedId) {
    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) return;
    var config = TYPES[conteneur.type];
    if (!config || !config.conteneur) return;

    var enfants = (conteneur.enfants || []).filter(function(eid) {
        return etat.noeuds.has(eid) && eid !== draggedId;
    });
    if (enfants.length === 0) return;

    // Sort by Y
    enfants.sort(function(a, b) {
        var da = etat.noeuds.get(a);
        var db = etat.noeuds.get(b);
        return (da ? da.y : 0) - (db ? db.y : 0);
    });

    var GAP = LAYOUT_GAP;
    var PADDING = LAYOUT_PADDING;
    var HEADER_H = LAYOUT_HEADER_H;

    var maxW = 0;
    var totalH = 0;
    var dims = [];
    for (var j = 0; j < enfants.length; j++) {
        var eel = document.getElementById(enfants[j]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        dims.push({ w: w, h: h });
        if (w > maxW) maxW = w;
        totalH += h;
    }
    totalH += GAP * (enfants.length - 1);

    var newW = maxW + PADDING * 2;
    var newH = totalH + PADDING * 2 + HEADER_H;

    var curY = conteneur.y + HEADER_H + PADDING;
    for (var k = 0; k < enfants.length; k++) {
        var ed2 = etat.noeuds.get(enfants[k]);
        if (!ed2) continue;
        ed2.x = conteneur.x + (newW - dims[k].w) / 2;
        ed2.y = curY;
        var eel2 = document.getElementById(enfants[k]);
        if (eel2) {
            eel2.style.transition = 'left 150ms ease, top 150ms ease';
            eel2.style.left = ed2.x + 'px';
            eel2.style.top = ed2.y + 'px';
            // Clear transition after animation
            (function(el) {
                setTimeout(function() { el.style.transition = ''; }, 160);
            })(eel2);
        }
        mettreAJourLiens(enfants[k]);
        curY += dims[k].h + GAP;
    }

    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.style.width = newW + 'px';
        cel.style.height = newH + 'px';
    }
    mettreAJourLiens(conteneurId);
}

function mettreAJourZoneConteneur(conteneurId) {
    if (_zoneEnCours.has(conteneurId)) return;
    _zoneEnCours.add(conteneurId);
    var conteneur = etat.noeuds.get(conteneurId);
    var el = document.getElementById(conteneurId);
    if (!conteneur || !el) { _zoneEnCours.delete(conteneurId); return; }

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var zone = el.querySelector('.planif-noeud-zone');

    if (enfants.length === 0) {
        el.classList.remove('planif-a-enfants');
        el.style.width = '';
        el.style.height = '';
        el.style.borderColor = '';
        if (zone) { zone.classList.add('planif-vide'); zone.textContent = ''; }
        _zoneEnCours.delete(conteneurId);
        return;
    }

    el.classList.add('planif-a-enfants');

    var PADDING = LAYOUT_PADDING;
    var HEADER_H = LAYOUT_HEADER_H;

    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < enfants.length; i++) {
        var ed = etat.noeuds.get(enfants[i]);
        var eel = document.getElementById(enfants[i]);
        if (!ed || !eel) continue;
        var w = eel.offsetWidth || 140;
        var h = eel.offsetHeight || 50;
        if (ed.x < minX) minX = ed.x;
        if (ed.y < minY) minY = ed.y;
        if (ed.x + w > maxX) maxX = ed.x + w;
        if (ed.y + h > maxY) maxY = ed.y + h;
    }

    var newX = minX - PADDING;
    var newY = minY - PADDING - HEADER_H;
    var newW = (maxX - minX) + PADDING * 2;
    var newH = (maxY - minY) + PADDING * 2 + HEADER_H;

    conteneur.x = newX;
    conteneur.y = newY;
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';

    mettreAJourLiens(conteneurId);

    _zoneEnCours.delete(conteneurId);

    if (conteneur.parent) {
        mettreAJourZoneConteneur(conteneur.parent);
    }
}


// === UNDO / REDO ===
function clonerEtatPersistant() {
    return {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        modeIndividuel: etat.modeIndividuel,
        noeuds: Array.from(etat.noeuds.values()).map(function(n) {
            return {
                id: n.id, type: n.type, titre: n.titre, description: n.description,
                x: n.x, y: n.y, parent: n.parent,
                enfants: n.enfants ? n.enfants.slice() : [],
                metadata: JSON.parse(JSON.stringify(n.metadata || {})),
                cloneSourceId: n.cloneSourceId || null
            };
        }),
        liens: Array.from(etat.liens.values()).map(function(l) {
            return { id: l.id, source: l.source, cible: l.cible, type: l.type };
        })
    };
}

function enregistrerPourUndo() {
    if (_undoBatch) return;
    pileUndo.push(clonerEtatPersistant());
    if (pileUndo.length > UNDO_MAX) pileUndo.shift();
    pileRedo = [];
}

function _collecterDescendants(noeudId, ensemble) {
    ensemble.add(noeudId);
    var nd = etat.noeuds.get(noeudId);
    if (!nd || !nd.enfants) return;
    for (var i = 0; i < nd.enfants.length; i++) {
        _collecterDescendants(nd.enfants[i], ensemble);
    }
}

function reconstruireDOM() {
    if (coucheNoeuds) coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';

    // Charger les données de séances pour l'indicateur objectif
    var _seancesDOM = {};
    try { _seancesDOM = db.getSync(window.cle(CLE_SEANCES), {}); } catch(e) {}

    // Filtrage par séquence active (null = tout visible)
    var visibles = null;  // Set des nœuds à afficher (vue focalisée)
    var masques = null;   // Set des nœuds à masquer (vue globale compacte)
    if (sequenceActiveId && etat.noeuds.has(sequenceActiveId)) {
        visibles = new Set();
        _collecterDescendants(sequenceActiveId, visibles);
    } else {
        // Vue globale : compacter les séquences (masquer leurs descendants)
        var seqs = obtenirSequencesCarte();
        if (seqs.length > 0) {
            masques = new Set();
            for (var si = 0; si < seqs.length; si++) {
                var enfantsSeq = seqs[si].enfants || [];
                for (var ei = 0; ei < enfantsSeq.length; ei++) {
                    _collecterDescendants(enfantsSeq[ei], masques);
                }
            }
        }
    }

    for (var entry of etat.noeuds) {
        var n = entry[1];
        if (visibles && !visibles.has(n.id)) continue;
        if (masques && masques.has(n.id)) continue;
        var config = TYPES[n.type];
        if (!config) continue;
        var estConteneur = config.conteneur === true;
        var estCompact = masques && n.type === 'sequence';
        var el = document.createElement('div');
        el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + n.type;
        if (estCompact) el.classList.add('planif-seq-compact');
        if (n.parent) el.classList.add('planif-enfant-conteneur');
        el.id = n.id;
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
        el.style.borderColor = obtenirCouleurNoeud(n);

        if (estCompact) {
            // Vue globale compacte : bloc résumé (titre + badge leçons)
            var nbLecons = (n.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); }).length;
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre">' + echapperHtml(n.titre || '') + '</div>' +
                '<div class="planif-seq-compact-info">' + nbLecons + ' le\u00e7on' + (nbLecons > 1 ? 's' : '') + '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        } else if (estConteneur) {
            var nbEnfants = (n.enfants || []).length;
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre" contenteditable="true">' + (n.titre || '') + '</div>' +
                '<div class="planif-noeud-zone ' + (nbEnfants === 0 ? 'planif-vide' : '') + '">' +
                    (nbEnfants > 0 ? nbEnfants + ' \u00e9l\u00e9ment' + (nbEnfants > 1 ? 's' : '') : '') +
                '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        } else {
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre" contenteditable="true">' + (n.titre || '') + '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        }
        attacherEvenements(el, n);
        coucheNoeuds.appendChild(el);
        // Indicateur clone synchrone (avant le rAF layout)
        mettreAJourIndicateurClone(n);
        // Badge cognitif (si défini)
        if (n.metadata && n.metadata.niveauCognitif && TYPES_AVEC_NIVEAU_COGNITIF.indexOf(n.type) !== -1) {
            var ncObj = NIVEAUX_COGNITIFS.find(function(nc) { return nc.id === n.metadata.niveauCognitif; });
            if (ncObj) {
                var badgeC = document.createElement('span');
                badgeC.className = 'planif-badge-cognitif';
                badgeC.textContent = ncObj.label;
                el.appendChild(badgeC);
            }
        }
        // Indicateur 🎯 objectif personnalisé (leçons uniquement)
        if (n.type === 'lecon' && _seancesDOM[n.id] && _seancesDOM[n.id].objectifPersonnalise) {
            var badgeObj = document.createElement('span');
            badgeObj.className = 'planif-badge-objectif';
            badgeObj.textContent = '\uD83C\uDFAF';
            badgeObj.title = 'Objectif d\u00e9fini \u2014 cliquer pour voir le d\u00e9tail';
            badgeObj.addEventListener('click', function(leconId) {
                return function(e) {
                    e.stopPropagation();
                    naviguerNiveauLecon(leconId);
                };
            }(n.id));
            el.appendChild(badgeObj);
        }
    }

    requestAnimationFrame(function() {
        // Répartition automatique des conteneurs (skip masqués et compacts)
        for (var entry2 of etat.noeuds) {
            var n2 = entry2[1];
            if (visibles && !visibles.has(n2.id)) continue;
            if (masques && masques.has(n2.id)) continue;
            if (masques && n2.type === 'sequence') continue; // Compact : pas de layout enfants
            if (TYPES[n2.type] && TYPES[n2.type].conteneur && n2.enfants && n2.enfants.length > 0 && !n2.parent) {
                reLayoutConteneur(n2.id);
            }
        }
        // Handle containers with no children
        for (var entry2b of etat.noeuds) {
            var n2b = entry2b[1];
            if (visibles && !visibles.has(n2b.id)) continue;
            if (masques && masques.has(n2b.id)) continue;
            if (TYPES[n2b.type] && TYPES[n2b.type].conteneur && (!n2b.enfants || n2b.enfants.length === 0)) {
                mettreAJourZoneConteneur(n2b.id);
            }
        }
        // Liens : seulement si les deux extrémités sont visibles (pas masquées)
        for (var entry3 of etat.liens) {
            var l = entry3[1];
            if (visibles && (!visibles.has(l.source) || !visibles.has(l.cible))) continue;
            if (masques && (masques.has(l.source) || masques.has(l.cible))) continue;
            dessinerLien(l);
        }
        mettreAJourCarrousel();
    });
}

function restaurerSnapshot(snapshot) {
    etat.noeuds.clear();
    etat.liens.clear();
    _cloneIndex.clear();
    etat.compteur = snapshot.compteur;
    etat.compteurLiens = snapshot.compteurLiens;

    for (var i = 0; i < snapshot.noeuds.length; i++) {
        var n = snapshot.noeuds[i];
        if (n.type === 'prerequis') {
            n.type = 'factuelle';
            if (!n.metadata) n.metadata = {};
            n.metadata.prealable = true;
        }
        // Migration anciens types de connaissances → Anderson
        if (n.type === 'connaissance') n.type = 'factuelle';
        else if (n.type === 'strategie') n.type = 'procedurale';
        else if (n.type === 'condition') n.type = 'procedurale';
        var clone = {
            id: n.id, type: n.type, titre: n.titre, description: n.description,
            x: n.x, y: n.y, parent: n.parent,
            enfants: n.enfants ? n.enfants.slice() : [],
            metadata: JSON.parse(JSON.stringify(n.metadata || {})),
            cloneSourceId: n.cloneSourceId || null
        };
        etat.noeuds.set(clone.id, clone);
    }
    for (var j = 0; j < snapshot.liens.length; j++) {
        var l = snapshot.liens[j];
        if (etat.noeuds.has(l.source) && etat.noeuds.has(l.cible)) {
            etat.liens.set(l.id, { id: l.id, source: l.source, cible: l.cible, type: l.type });
        }
    }
    // Nettoyer les références parent/enfants invalides
    for (var entryV of etat.noeuds) {
        var nV = entryV[1];
        if (nV.parent && !etat.noeuds.has(nV.parent)) nV.parent = null;
        if (nV.enfants) nV.enfants = nV.enfants.filter(function(eid) { return etat.noeuds.has(eid); });
    }
    _reconstruireCloneIndex();

    reconstruireDOM();
    etat.selection = null;
    etat.multiSelection.clear();
    etat.modeIndividuel = snapshot.modeIndividuel || null;
    fermerPanneau();
    fermerMenuLien();
    sauvegarder();
    requestAnimationFrame(function() { mettreAJourTousLesBadges(); });
}

function annuler() {
    if (pileUndo.length === 0) return;
    pileRedo.push(clonerEtatPersistant());
    restaurerSnapshot(pileUndo.pop());
}

function retablir() {
    if (pileRedo.length === 0) return;
    pileUndo.push(clonerEtatPersistant());
    restaurerSnapshot(pileRedo.pop());
}

// === SAUVEGARDE ===
function sauvegarder() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var donnees = {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    window.planificationDonnees.sauvegarderCarte(index.active, donnees);

    if (seancesOuvert) rafraichirSeances();
    mettreAJourTousLesBadges();
}

function viderCanvas() {
    if (coucheNoeuds) coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';
    etat.noeuds.clear();
    etat.liens.clear();
    _cloneIndex.clear();
    etat.compteur = 0;
    etat.compteurLiens = 0;
    etat.selection = null;
    etat.multiSelection.clear();
    pileUndo = [];
    pileRedo = [];
    fermerPanneau();
    fermerMenuLien();
}

function chargerCarte(carteId) {
    sequenceActiveId = null;
    leconActiveId = null;
    viderCanvas();
    var donnees = window.planificationDonnees.chargerCarte(carteId);
    if (!donnees) { centrerVueSurContenu(); return; }

    etat.compteur = donnees.compteur || 0;
    etat.compteurLiens = donnees.compteurLiens || 0;

    var noeudsListe = donnees.noeuds || [];
    for (var i = 0; i < noeudsListe.length; i++) {
        var n = noeudsListe[i];
        if (n.type === 'prerequis') {
            n.type = 'factuelle';
            if (!n.metadata) n.metadata = {};
            n.metadata.prealable = true;
        }
        // Migration anciens types de connaissances → Anderson
        if (n.type === 'connaissance') n.type = 'factuelle';
        else if (n.type === 'strategie') n.type = 'procedurale';
        else if (n.type === 'condition') n.type = 'procedurale';
        var config = TYPES[n.type];
        if (!config) continue;
        if (isNaN(n.x)) n.x = 100;
        if (isNaN(n.y)) n.y = 100;
        if (n.enfants === undefined) n.enfants = [];
        if (n.parent === undefined) n.parent = null;
        if (!n.metadata) n.metadata = {};
        if (!('cloneSourceId' in n)) n.cloneSourceId = null;

        // Remap IDs si nécessaire (ancien format sans préfixe)
        if (!n.id.startsWith('planif-')) {
            var oldId = n.id;
            n.id = 'planif-' + oldId;
            // Remap parent
            if (n.parent && !n.parent.startsWith('planif-')) n.parent = 'planif-' + n.parent;
            // Remap enfants
            n.enfants = n.enfants.map(function(eid) {
                return eid.startsWith('planif-') ? eid : 'planif-' + eid;
            });
        }

        etat.noeuds.set(n.id, n);
    }
    _reconstruireCloneIndex();

    // Remap et charger les liens
    var liensListe = donnees.liens || [];
    var liensModifies = false;
    for (var m = 0; m < liensListe.length; m++) {
        var l = liensListe[m];
        if (!l.id.startsWith('planif-')) l.id = 'planif-' + l.id;
        if (!l.source.startsWith('planif-')) l.source = 'planif-' + l.source;
        if (!l.cible.startsWith('planif-')) l.cible = 'planif-' + l.cible;
        // Migration anciens verbes → nouveaux verbes + inversion direction
        var migration = MIGRATION_VERBES[l.type];
        if (migration) {
            if (migration.inverserDirection) {
                var ancienneSource = l.source;
                l.source = l.cible;
                l.cible = ancienneSource;
            }
            l.type = migration.nouveauVerbe;
            liensModifies = true;
        }
        // Post-migration : normaliser via VERBES_COMPAT (renommage simple)
        var compat = VERBES_COMPAT[l.type];
        if (compat) {
            l.type = compat;
            liensModifies = true;
        }
        etat.liens.set(l.id, l);
    }

    reconstruireDOM();
    if (liensModifies) sauvegarder();

    requestAnimationFrame(function() {
        centrerVueSurContenu();
        mettreAJourTousLesBadges();
    });

    pileUndo = [];
    pileRedo = [];
}

function centrerVueSurContenu() {
    if (!zoneTravail) return;
    if (etat.noeuds.size === 0) {
        zoneTravail.scrollLeft = OFFSET_X * etat.zoom - zoneTravail.clientWidth / 2;
        zoneTravail.scrollTop = OFFSET_Y * etat.zoom - zoneTravail.clientHeight / 2;
    } else {
        var sumX = 0, sumY = 0, count = 0;
        for (var entry of etat.noeuds) {
            var nd = entry[1];
            sumX += nd.x;
            sumY += nd.y;
            count++;
        }
        var cx = (sumX / count + OFFSET_X) * etat.zoom;
        var cy = (sumY / count + OFFSET_Y) * etat.zoom;
        zoneTravail.scrollLeft = cx - zoneTravail.clientWidth / 2;
        zoneTravail.scrollTop = cy - zoneTravail.clientHeight / 2;
    }
}

function zoomPleineLargeur() {
    if (!zoneTravail) return;
    var viewportWidth = zoneTravail.clientWidth;
    var contentWidth = ESPACE_W;
    if (etat.noeuds.size > 0) {
        var minX = Infinity, maxX = -Infinity;
        for (var entry of etat.noeuds) {
            var nd = entry[1];
            var el = document.getElementById('noeud-' + nd.id);
            var nodeW = el ? el.offsetWidth : 200;
            if (nd.x < minX) minX = nd.x;
            if (nd.x + nodeW > maxX) maxX = nd.x + nodeW;
        }
        contentWidth = (maxX - minX) + 200;
    }
    etat.zoom = Math.max(0.25, Math.min(3, viewportWidth / contentWidth));
    appliquerZoom();
    centrerVueSurContenu();
    var zoomInfo = document.getElementById('planif-zoom-info');
    if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
    mettreAJourBoutonsZoomPreset();
}

function zoomPleineHauteur() {
    if (!zoneTravail) return;
    var viewportHeight = zoneTravail.clientHeight;
    var contentHeight = ESPACE_H;
    if (etat.noeuds.size > 0) {
        var minY = Infinity, maxY = -Infinity;
        for (var entry of etat.noeuds) {
            var nd = entry[1];
            var el = document.getElementById('noeud-' + nd.id);
            var nodeH = el ? el.offsetHeight : 100;
            if (nd.y < minY) minY = nd.y;
            if (nd.y + nodeH > maxY) maxY = nd.y + nodeH;
        }
        contentHeight = (maxY - minY) + 200;
    }
    etat.zoom = Math.max(0.25, Math.min(3, viewportHeight / contentHeight));
    appliquerZoom();
    centrerVueSurContenu();
    var zoomInfo = document.getElementById('planif-zoom-info');
    if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
    mettreAJourBoutonsZoomPreset();
}

// === ATTACHER ÉVÉNEMENTS D'UN NŒUD ===
function attacherEvenements(el, donnees) {
    var id = donnees.id;
    var config = TYPES[donnees.type];
    var estConteneur = config && config.conteneur === true;

    el.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('planif-noeud-port') || e.target.isContentEditable) return;
        e.preventDefault();

        if (e.metaKey || e.ctrlKey) {
            toggleMultiSelection(id);
            return;
        }

        // Multi-selection group drag
        var estDragGroupe = etat.multiSelection.size > 1 && etat.multiSelection.has(id);
        if (estDragGroupe) {
            enregistrerPourUndo();
            var startMouseX = e.clientX;
            var startMouseY = e.clientY;
            var positionsInitiales = new Map();
            var tousNoeuds = new Set(etat.multiSelection);

            for (var nid2 of etat.multiSelection) {
                var nd2 = etat.noeuds.get(nid2);
                if (nd2 && TYPES[nd2.type] && TYPES[nd2.type].conteneur && nd2.enfants) {
                    var desc2 = [];
                    collecterDescendants(nd2, nd2, desc2);
                    for (var d2 = 0; d2 < desc2.length; d2++) tousNoeuds.add(desc2[d2].id);
                }
            }

            for (var nid3 of tousNoeuds) {
                var nd3 = etat.noeuds.get(nid3);
                if (nd3) positionsInitiales.set(nid3, { x: nd3.x, y: nd3.y });
            }

            el.classList.add('planif-dragging');

            function onMoveGroupe(e2) {
                var dx2 = (e2.clientX - startMouseX) / etat.zoom;
                var dy2 = (e2.clientY - startMouseY) / etat.zoom;

                for (var entry2 of positionsInitiales) {
                    var nid4 = entry2[0];
                    var pos2 = entry2[1];
                    var nd4 = etat.noeuds.get(nid4);
                    if (!nd4) continue;
                    nd4.x = pos2.x + dx2;
                    nd4.y = pos2.y + dy2;
                    var nel2 = document.getElementById(nid4);
                    if (nel2) {
                        nel2.style.left = nd4.x + 'px';
                        nel2.style.top = nd4.y + 'px';
                    }
                    mettreAJourLiens(nid4);
                }
            }

            function onUpGroupe() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveGroupeThrottled);
                document.removeEventListener('mouseup', onUpGroupe);
                sauvegarder();
            }

            var onMoveGroupeThrottled = throttleRAF(onMoveGroupe);
            document.addEventListener('mousemove', onMoveGroupeThrottled);
            document.addEventListener('mouseup', onUpGroupe);
            return;
        }

        enregistrerPourUndo();
        if (etat.multiSelection.size > 0) {
            deselectionnerTout();
        }
        selectionnerNoeud(id);

        var startMouseX2 = e.clientX;
        var startMouseY2 = e.clientY;
        var startDataX = donnees.x;
        var startDataY = donnees.y;

        // Si l'enfant est visuellement hors de son conteneur, activer le mode individuel
        if (donnees.parent && etat.modeIndividuel !== id) {
            var parentConteneur = etat.noeuds.get(donnees.parent);
            if (parentConteneur) {
                var pEl = document.getElementById(donnees.parent);
                var pw = pEl ? (parseFloat(pEl.style.width) || pEl.offsetWidth || 200) : 200;
                var ph = pEl ? (parseFloat(pEl.style.height) || pEl.offsetHeight || 80) : 80;
                var horsLimites = donnees.x + 20 < parentConteneur.x ||
                                  donnees.x > parentConteneur.x + pw + 20 ||
                                  donnees.y + 20 < parentConteneur.y ||
                                  donnees.y > parentConteneur.y + ph + 20;
                if (horsLimites) {
                    etat.modeIndividuel = id;
                    document.querySelectorAll('.planif-mode-individuel').forEach(function(mel) { mel.classList.remove('planif-mode-individuel'); });
                    el.classList.add('planif-mode-individuel');
                }
            }
        }

        // CAS A: Enfant en mode normal → drag du groupe entier (remonte au conteneur racine)
        if (donnees.parent && etat.modeIndividuel !== id) {
            var racineId = trouverConteneurRacine(id);
            var racine = etat.noeuds.get(racineId);
            if (!racine) return;

            var racineStartX = racine.x;
            var racineStartY = racine.y;
            var descendantsGrp = [];
            collecterDescendants(racine, racine, descendantsGrp);

            var racineEl = document.getElementById(racineId);
            if (racineEl) racineEl.classList.add('planif-dragging');

            var peutDropRacine = racine.type === 'lecon';
            var survolConteneurGrp = null;

            function onMoveA(e2) {
                var dx = (e2.clientX - startMouseX2) / etat.zoom;
                var dy = (e2.clientY - startMouseY2) / etat.zoom;

                racine.x = racineStartX + dx;
                racine.y = racineStartY + dy;
                if (racineEl) {
                    racineEl.style.left = racine.x + 'px';
                    racineEl.style.top = racine.y + 'px';
                }
                mettreAJourLiens(racineId);

                for (var j = 0; j < descendantsGrp.length; j++) {
                    var di = descendantsGrp[j];
                    var dd = etat.noeuds.get(di.id);
                    if (!dd) continue;
                    dd.x = racine.x + di.dx;
                    dd.y = racine.y + di.dy;
                    var del2 = document.getElementById(di.id);
                    if (del2) { del2.style.left = dd.x + 'px'; del2.style.top = dd.y + 'px'; }
                    mettreAJourLiens(di.id);
                }

                if (peutDropRacine) {
                    var ancienSurvol = survolConteneurGrp;
                    survolConteneurGrp = trouverConteneurPour(e2.clientX, e2.clientY, racineId, racine.type);
                    if (ancienSurvol !== survolConteneurGrp) {
                        if (ancienSurvol) {
                            var aEl = document.getElementById(ancienSurvol);
                            if (aEl) aEl.classList.remove('planif-conteneur-survol');
                        }
                        if (survolConteneurGrp) {
                            var sEl = document.getElementById(survolConteneurGrp);
                            if (sEl) sEl.classList.add('planif-conteneur-survol');
                        }
                    }
                }
            }

            function onUpA() {
                if (racineEl) racineEl.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveAThrottled);
                document.removeEventListener('mouseup', onUpA);
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (peutDropRacine) {
                    if (survolConteneurGrp && survolConteneurGrp !== racine.parent) {
                        rattacherAuConteneur(racineId, survolConteneurGrp);
                    } else if (!survolConteneurGrp && racine.parent) {
                        detacherDuConteneur(racineId);
                    }
                }

                sauvegarder();
            }

            var onMoveAThrottled = throttleRAF(onMoveA);
            document.addEventListener('mousemove', onMoveAThrottled);
            document.addEventListener('mouseup', onUpA);
            return;
        }

        // CAS B: Enfant en mode individuel → drag individuel + détachement
        if (donnees.parent && etat.modeIndividuel === id) {
            el.classList.add('planif-dragging');
            var parentId = donnees.parent;
            var parentData = etat.noeuds.get(parentId);

            // Si c'est un conteneur avec enfants, collecter les descendants pour les déplacer ensemble
            var descendantsB = [];
            if (estConteneur && donnees.enfants && donnees.enfants.length > 0) {
                collecterDescendants(donnees, donnees, descendantsB);
            }

            function onMoveB(e2) {
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                el.style.left = donnees.x + 'px';
                el.style.top = donnees.y + 'px';
                mettreAJourLiens(id);

                // Déplacer les descendants avec le conteneur
                for (var db = 0; db < descendantsB.length; db++) {
                    var dbi = descendantsB[db];
                    var dbd = etat.noeuds.get(dbi.id);
                    if (!dbd) continue;
                    dbd.x = donnees.x + dbi.dx;
                    dbd.y = donnees.y + dbi.dy;
                    var dbEl = document.getElementById(dbi.id);
                    if (dbEl) { dbEl.style.left = dbd.x + 'px'; dbEl.style.top = dbd.y + 'px'; }
                    mettreAJourLiens(dbi.id);
                }

                // Check if dragged out of parent bounds
                if (parentData) {
                    var cel = document.getElementById(parentId);
                    if (cel) {
                        var cw = parseFloat(cel.style.width) || cel.offsetWidth || 200;
                        var ch = parseFloat(cel.style.height) || cel.offsetHeight || 80;
                        var outOfBounds = donnees.x + (el.offsetWidth || 140) < parentData.x ||
                                          donnees.x > parentData.x + cw ||
                                          donnees.y + (el.offsetHeight || 50) < parentData.y ||
                                          donnees.y > parentData.y + ch;
                        if (outOfBounds) {
                            // Will detach on mouseup
                            return;
                        }
                    }

                    mettreAJourZoneConteneur(parentId);
                }
            }

            function onUpB() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveBThrottled);
                document.removeEventListener('mouseup', onUpB);

                // Check if out of bounds → detach
                if (parentData) {
                    var cel2 = document.getElementById(parentId);
                    if (cel2) {
                        var cw2 = parseFloat(cel2.style.width) || cel2.offsetWidth || 200;
                        var ch2 = parseFloat(cel2.style.height) || cel2.offsetHeight || 80;
                        var outOfBounds2 = donnees.x + (el.offsetWidth || 140) < parentData.x ||
                                           donnees.x > parentData.x + cw2 ||
                                           donnees.y + (el.offsetHeight || 50) < parentData.y ||
                                           donnees.y > parentData.y + ch2;
                        if (outOfBounds2) {
                            etat.modeIndividuel = null;
                            el.classList.remove('planif-mode-individuel');
                            detacherDuConteneur(id);
                            sauvegarder();
                            return;
                        }
                    }
                }

                // Répartition automatique au lâcher
                if (donnees.parent) {
                    reLayoutAvecAnimation(donnees.parent);
                }
                sauvegarder();
            }

            var onMoveBThrottled = throttleRAF(onMoveB);
            document.addEventListener('mousemove', onMoveBThrottled);
            document.addEventListener('mouseup', onUpB);
            return;
        }

        // CAS C: Conteneur → drag du groupe entier (+ hover-detection pour Leçon)
        if (estConteneur) {
            el.classList.add('planif-dragging');
            var descendantsInit = [];
            if (donnees.enfants) {
                collecterDescendants(donnees, donnees, descendantsInit);
            }

            var peutEtreEnfant = donnees.type === 'lecon';
            var survolConteneur = null;

            function onMoveC(e2) {
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                el.style.left = donnees.x + 'px';
                el.style.top = donnees.y + 'px';
                mettreAJourLiens(id);

                for (var j = 0; j < descendantsInit.length; j++) {
                    var di = descendantsInit[j];
                    var dd = etat.noeuds.get(di.id);
                    if (!dd) continue;
                    dd.x = donnees.x + di.dx;
                    dd.y = donnees.y + di.dy;
                    var del2 = document.getElementById(di.id);
                    if (del2) { del2.style.left = dd.x + 'px'; del2.style.top = dd.y + 'px'; }
                    mettreAJourLiens(di.id);
                }

                if (donnees.parent) {
                    mettreAJourZoneConteneur(donnees.parent);
                }

                if (peutEtreEnfant) {
                    var ancienSurvol = survolConteneur;
                    survolConteneur = trouverConteneurPour(e2.clientX, e2.clientY, id, donnees.type);
                    if (ancienSurvol !== survolConteneur) {
                        if (ancienSurvol) {
                            var ancienEl = document.getElementById(ancienSurvol);
                            if (ancienEl) ancienEl.classList.remove('planif-conteneur-survol');
                            var zn = ancienEl ? ancienEl.querySelector('.planif-noeud-zone') : null;
                            if (zn) zn.classList.remove('planif-survol');
                        }
                        if (survolConteneur) {
                            var survolEl = document.getElementById(survolConteneur);
                            if (survolEl) survolEl.classList.add('planif-conteneur-survol');
                            var zn2 = survolEl ? survolEl.querySelector('.planif-noeud-zone') : null;
                            if (zn2) zn2.classList.add('planif-survol');
                        }
                    }
                }
            }

            function onUpC() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveCThrottled);
                document.removeEventListener('mouseup', onUpC);

                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (peutEtreEnfant) {
                    if (survolConteneur && survolConteneur !== donnees.parent) {
                        rattacherAuConteneur(id, survolConteneur);
                    } else if (!survolConteneur && donnees.parent) {
                        detacherDuConteneur(id);
                    }
                }

                sauvegarder();
            }

            var onMoveCThrottled = throttleRAF(onMoveC);
            document.addEventListener('mousemove', onMoveCThrottled);
            document.addEventListener('mouseup', onUpC);
            return;
        }

        // CAS D: Noeud libre → drag simple + hover-detection conteneur
        el.classList.add('planif-dragging');
        var survolConteneurD = null;

        function onMoveD(e2) {
            donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
            donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
            el.style.left = donnees.x + 'px';
            el.style.top = donnees.y + 'px';
            mettreAJourLiens(id);

            var ancienSurvolD = survolConteneurD;
            survolConteneurD = trouverConteneurPour(e2.clientX, e2.clientY, id, donnees.type);
            if (ancienSurvolD !== survolConteneurD) {
                if (ancienSurvolD) {
                    var aElD = document.getElementById(ancienSurvolD);
                    if (aElD) aElD.classList.remove('planif-conteneur-survol');
                    var znD = aElD ? aElD.querySelector('.planif-noeud-zone') : null;
                    if (znD) znD.classList.remove('planif-survol');
                }
                if (survolConteneurD) {
                    var sElD = document.getElementById(survolConteneurD);
                    if (sElD) sElD.classList.add('planif-conteneur-survol');
                    var znD2 = sElD ? sElD.querySelector('.planif-noeud-zone') : null;
                    if (znD2) znD2.classList.add('planif-survol');
                }
            }
        }

        function onUpD() {
            el.classList.remove('planif-dragging');
            document.removeEventListener('mousemove', onMoveDThrottled);
            document.removeEventListener('mouseup', onUpD);

            document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
            document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

            if (survolConteneurD && survolConteneurD !== donnees.parent) {
                rattacherAuConteneur(id, survolConteneurD);
            } else if (!survolConteneurD && donnees.parent) {
                detacherDuConteneur(id);
            }

            sauvegarder();
        }

        var onMoveDThrottled = throttleRAF(onMoveD);
        document.addEventListener('mousemove', onMoveDThrottled);
        document.addEventListener('mouseup', onUpD);
    });

    // Double-clic: mode individuel pour enfants, panneau pour le reste
    el.addEventListener('dblclick', function(e) {
        if (e.target.isContentEditable) return;

        // Bloc compact → ouvrir la vue focalisée
        if (el.classList.contains('planif-seq-compact')) {
            ouvrirSequence(id);
            return;
        }

        if (donnees.parent) {
            // Enfant → active mode individuel
            etat.modeIndividuel = id;
            document.querySelectorAll('.planif-mode-individuel').forEach(function(mel) { mel.classList.remove('planif-mode-individuel'); });
            el.classList.add('planif-mode-individuel');
            selectionnerNoeud(id);
            ouvrirPanneau(id);
        } else {
            selectionnerNoeud(id);
            ouvrirPanneau(id);
        }
    });

    var titreEl = el.querySelector('.planif-noeud-titre');
    titreEl.addEventListener('focus', function() {
        enregistrerPourUndo();
    });
    titreEl.addEventListener('input', function() {
        donnees.titre = titreEl.textContent;
        sauvegarder();
    });
    titreEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); titreEl.blur(); }
    });

    el.querySelectorAll('.planif-noeud-port').forEach(function(port) {
        port.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            demarrerLien(id, port.dataset.dir, e);
        });
    });

    el.addEventListener('click', function(e) {
        if (e.target.classList.contains('planif-noeud-port')) return;
        if (e.metaKey || e.ctrlKey) return;
        if (etat.multiSelection.size === 0) {
            selectionnerNoeud(id);
            // Rafraîchir l'inspecteur si déjà ouvert
            if (etat.panneauOuvert) {
                ouvrirPanneau(id);
            }
        }
    });
}

// === PANNEAU SÉANCES ===
function toggleSeances() {
    seancesOuvert = !seancesOuvert;
    if (panneauSeances) panneauSeances.classList.toggle('visible', seancesOuvert);
    if (btnSeances) btnSeances.classList.toggle('actif', seancesOuvert);
    if (seancesOuvert) rafraichirSeances();
}

function getLiensDeNoeud(noeudId) {
    var resultat = [];
    for (var entry of etat.liens) {
        var lien = entry[1];
        if (lien.source === noeudId || lien.cible === noeudId) {
            var autreId = lien.source === noeudId ? lien.cible : lien.source;
            var autre = etat.noeuds.get(autreId);
            var typeLienConfig = trouverConfigLien(lien.type);
            if (autre && typeLienConfig) {
                resultat.push({
                    noeudId: autreId,
                    noeudTitre: autre.titre || (TYPES[autre.type] ? TYPES[autre.type].label : '?'),
                    noeudType: autre.type,
                    lienLabel: typeLienConfig.label,
                    direction: lien.source === noeudId ? 'sortant' : 'entrant'
                });
            }
        }
    }
    return resultat;
}

function naviguerVers(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    if (!donnees) return;

    deselectionnerTout();
    selectionnerNoeud(noeudId);

    var el = document.getElementById(noeudId);
    if (!el) return;
    var targetX = (donnees.x + OFFSET_X + (el.offsetWidth || 140) / 2) * etat.zoom - zoneTravail.clientWidth / 2;
    var targetY = (donnees.y + OFFSET_Y + (el.offsetHeight || 50) / 2) * etat.zoom - zoneTravail.clientHeight / 2;

    zoneTravail.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });

    el.style.transition = 'box-shadow 0.3s';
    el.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.4), 0 0 20px rgba(59,130,246,0.2)';
    setTimeout(function() {
        el.style.boxShadow = '';
        el.style.transition = '';
    }, 1200);
}

function genererSeancesHTML() {
    var sequences = [];
    var leconsOrphelines = [];

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    if (sequences.length === 0 && leconsOrphelines.length === 0) {
        return '<div class="planif-cal-vide">Aucune séquence ou leçon pour le moment.<br>Ajoute des éléments à la carte.</div>';
    }

    sequences.sort(function(a, b) {
        var sa = (a.metadata && a.metadata.semaineDebut) || 0;
        var sb = (b.metadata && b.metadata.semaineDebut) || 0;
        if (sa !== sb) return sa - sb;
        return (a.x || 0) - (b.x || 0);
    });

    var html = '';

    function genererEnfant(enfantId) {
        var enfant = etat.noeuds.get(enfantId);
        if (!enfant) return '';
        var config = TYPES[enfant.type];
        if (!config) return '';

        if (enfant.type === 'lecon') return genererLeconBloc(enfant);

        var itemHtml = '<div class="planif-cal-item" data-noeud="' + enfantId + '">';
        itemHtml += '<span class="planif-cal-pastille-mini" style="background: ' + obtenirCouleurNoeud(enfant) + '"></span>';
        itemHtml += '<div>';
        itemHtml += '<span class="planif-cal-item-titre">' + (enfant.titre || obtenirLabelNoeud(enfant)) + '</span>';

        if (enfant.metadata && enfant.metadata.duree) {
            itemHtml += ' <span class="planif-cal-duree">' + enfant.metadata.duree + ' min</span>';
        }

        var liens = getLiensDeNoeud(enfantId);
        if (liens.length > 0) {
            itemHtml += '<div class="planif-cal-liens">';
            for (var j = 0; j < liens.length; j++) {
                var l = liens[j];
                var lNoeud = etat.noeuds.get(l.noeudId);
                var couleur = lNoeud ? obtenirCouleurNoeud(lNoeud) : '#94a3b8';
                var fleche = l.direction === 'sortant' ? '→' : '←';
                itemHtml += '<div class="planif-cal-lien-item" data-noeud="' + l.noeudId + '">';
                itemHtml += '<span class="planif-cal-lien-pastille" style="background: ' + couleur + '"></span>';
                itemHtml += fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre;
                itemHtml += '</div>';
            }
            itemHtml += '</div>';
        }

        itemHtml += '</div></div>';
        return itemHtml;
    }

    function genererLeconBloc(lecon) {
        var config = TYPES['lecon'];
        var dureeTotal = 0;
        var bloc = '<div class="planif-cal-lecon">';
        bloc += '<div class="planif-cal-lecon-header" data-noeud="' + lecon.id + '">';
        bloc += '<span class="planif-cal-pastille" style="background: ' + config.couleur + '"></span>';
        bloc += '<span class="planif-cal-titre">' + (lecon.titre || 'Leçon') + '</span>';
        if (lecon.metadata && lecon.metadata.duree) {
            bloc += '<span class="planif-cal-duree">' + lecon.metadata.duree + ' min</span>';
            dureeTotal += lecon.metadata.duree;
        }
        bloc += '</div>';

        var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
        if (enfants.length > 0) {
            bloc += '<div class="planif-cal-enfants">';
            for (var j = 0; j < enfants.length; j++) {
                var ed = etat.noeuds.get(enfants[j]);
                if (ed && ed.metadata && ed.metadata.duree) dureeTotal += ed.metadata.duree;
                bloc += genererEnfant(enfants[j]);
            }
            bloc += '</div>';
        }

        var liensLecon = getLiensDeNoeud(lecon.id);
        if (liensLecon.length > 0) {
            bloc += '<div class="planif-cal-enfants">';
            for (var k = 0; k < liensLecon.length; k++) {
                var ll = liensLecon[k];
                var lNoeud2 = etat.noeuds.get(ll.noeudId);
                var couleur2 = lNoeud2 ? obtenirCouleurNoeud(lNoeud2) : '#94a3b8';
                var fleche2 = ll.direction === 'sortant' ? '→' : '←';
                bloc += '<div class="planif-cal-lien-item" data-noeud="' + ll.noeudId + '">';
                bloc += '<span class="planif-cal-lien-pastille" style="background: ' + couleur2 + '"></span>';
                bloc += fleche2 + ' ' + ll.lienLabel + ' : ' + ll.noeudTitre;
                bloc += '</div>';
            }
            bloc += '</div>';
        }

        if (dureeTotal > 0) {
            var h = Math.floor(dureeTotal / 60);
            var m = dureeTotal % 60;
            var tempsStr = h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
            bloc += '<div class="planif-cal-total">Total : <strong>' + tempsStr + '</strong></div>';
        }

        bloc += '</div>';
        return bloc;
    }

    // Séquences
    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var configSeq = TYPES['sequence'];
        html += '<div class="planif-cal-sequence">';
        html += '<div class="planif-cal-sequence-header" data-noeud="' + seq.id + '">';
        html += '<span class="planif-cal-pastille" style="background: ' + configSeq.couleur + '"></span>';
        html += '<span class="planif-cal-titre">' + (seq.titre || 'Séquence') + '</span>';

        if (seq.metadata && seq.metadata.semaineDebut) {
            var semTxt = 'Sem. ' + seq.metadata.semaineDebut;
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
            html += '<span class="planif-cal-semaines">' + semTxt + '</span>';
        }
        html += '</div>';

        var enfSeq = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
        enfSeq.sort(function(a, b) {
            var na = etat.noeuds.get(a), nb = etat.noeuds.get(b);
            return ((na && na.x) || 0) - ((nb && nb.x) || 0);
        });
        var dureeSeq = 0;

        for (var j = 0; j < enfSeq.length; j++) {
            var ed = etat.noeuds.get(enfSeq[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                html += genererLeconBloc(ed);
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
                for (var k = 0; k < (ed.enfants || []).length; k++) {
                    var cd = etat.noeuds.get(ed.enfants[k]);
                    if (cd && cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;
                }
            } else {
                html += '<div class="planif-cal-enfants">' + genererEnfant(enfSeq[j]) + '</div>';
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
            }
        }

        var liensSeq = getLiensDeNoeud(seq.id);
        if (liensSeq.length > 0) {
            html += '<div class="planif-cal-enfants">';
            for (var m = 0; m < liensSeq.length; m++) {
                var ls = liensSeq[m];
                var lNoeud3 = etat.noeuds.get(ls.noeudId);
                var couleur3 = lNoeud3 ? obtenirCouleurNoeud(lNoeud3) : '#94a3b8';
                var fleche3 = ls.direction === 'sortant' ? '→' : '←';
                html += '<div class="planif-cal-lien-item" data-noeud="' + ls.noeudId + '">';
                html += '<span class="planif-cal-lien-pastille" style="background: ' + couleur3 + '"></span>';
                html += fleche3 + ' ' + ls.lienLabel + ' : ' + ls.noeudTitre;
                html += '</div>';
            }
            html += '</div>';
        }

        if (dureeSeq > 0) {
            var hSeq = Math.floor(dureeSeq / 60);
            var mSeq = dureeSeq % 60;
            var tempsSeq = hSeq > 0 ? hSeq + 'h' + (mSeq > 0 ? String(mSeq).padStart(2, '0') : '') : mSeq + ' min';
            html += '<div class="planif-cal-total">Durée totale : <strong>' + tempsSeq + '</strong></div>';
        }

        html += '</div>';
    }

    // Leçons orphelines
    if (leconsOrphelines.length > 0) {
        html += '<div class="planif-cal-orphelines">';
        html += '<div class="planif-cal-orphelines-titre">Leçons hors séquence</div>';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            html += genererLeconBloc(leconsOrphelines[p]);
        }
        html += '</div>';
    }

    return html;
}

// === ORGANISATEUR — SÉLECTEURS ET AFFICHAGE LEÇON ===

function peuplerSelecteursOrganisateur() {
    // Collecter séquences
    var sequences = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'sequence') sequences.push(entry[1]);
    }
    sequences.sort(function(a, b) {
        return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999);
    });

    // Peupler select séquence
    var valActuelle = orgSelectSequence.value;
    orgSelectSequence.innerHTML = '<option value="">— Séquence —</option>';
    for (var i = 0; i < sequences.length; i++) {
        var opt = document.createElement('option');
        opt.value = sequences[i].id;
        opt.textContent = sequences[i].titre || 'Séquence ' + (i + 1);
        orgSelectSequence.appendChild(opt);
    }
    orgSelectSequence.value = valActuelle;

    peuplerSelecteurLecons();
}

function peuplerSelecteurLecons() {
    var seqId = orgSelectSequence.value;
    var lecons = [];

    if (seqId) {
        // Leçons enfants de la séquence sélectionnée
        var seq = etat.noeuds.get(seqId);
        if (seq && seq.enfants) {
            for (var i = 0; i < seq.enfants.length; i++) {
                var e = etat.noeuds.get(seq.enfants[i]);
                if (e && e.type === 'lecon') lecons.push(e);
            }
        }
    } else {
        // Toutes les leçons
        for (var entry of etat.noeuds) {
            if (entry[1].type === 'lecon') lecons.push(entry[1]);
        }
    }

    var valActuelle = orgSelectLecon.value;
    orgSelectLecon.innerHTML = '<option value="">— Leçon —</option>';
    for (var j = 0; j < lecons.length; j++) {
        var opt = document.createElement('option');
        opt.value = lecons[j].id;
        opt.textContent = lecons[j].titre || 'Leçon ' + (j + 1);
        orgSelectLecon.appendChild(opt);
    }
    orgSelectLecon.value = valActuelle;

    afficherLeconOrganisateur();
}

function trouverIdeesMaitressesAncetres(noeudId) {
    // Remonter les branches (parent + liens) pour trouver TOUTES les idées maîtresses
    var visite = {};
    var aExplorer = [noeudId];
    var resultats = [];
    var ids = {};
    while (aExplorer.length > 0) {
        var courantId = aExplorer.shift();
        if (visite[courantId]) continue;
        visite[courantId] = true;
        var courant = etat.noeuds.get(courantId);
        if (!courant) continue;

        // Vérifier les liens de ce nœud pour des idées maîtresses
        var liens = getLiensDeNoeud(courantId);
        for (var i = 0; i < liens.length; i++) {
            var cible = etat.noeuds.get(liens[i].noeudId);
            if (cible && cible.type === 'idee-maitresse' && !ids[cible.id]) {
                resultats.push(cible);
                ids[cible.id] = true;
            }
        }

        // Remonter au parent (conteneur)
        if (courant.parent && !visite[courant.parent]) {
            aExplorer.push(courant.parent);
        }
    }
    return resultats;
}

function chargerProductions() {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return [];
    try {
        var productions = db.getSync(window.cle('productions'), []);
        return productions.filter(function(p) { return p.estActive; }).map(function(p) {
            // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
            var infoC = db.getSync('infoCours', null);
            var gcPlanif = infoC ? (infoC._groupeCoursId || infoC.id || null) : null;
            var dateEch = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(p, gcPlanif).date : p.dateEcheance;
            return { id: p.id, nom: p.nom, type: p.type || 'autre', ponderation: p.ponderation || 0, grilleId: p.grilleId, dateEcheance: dateEch };
        });
    } catch(e) { return []; }
}

function afficherDetailsProduction(productionId, productions) {
    if (!productionId) return null;
    var prod = null;
    for (var i = 0; i < productions.length; i++) {
        if (productions[i].id === productionId) { prod = productions[i]; break; }
    }
    if (!prod) return null;
    var nomGrille = 'Aucune grille';
    var nomEchelle = 'Aucune échelle';
    try {
        if (typeof db !== 'undefined' && typeof window.cle === 'function' && prod.grilleId) {
            var grilles = db.getSync(window.cle('grillesTemplates'), []);
            var grille = grilles.find(function(g) { return g.id === prod.grilleId; });
            if (grille) {
                nomGrille = grille.nom || nomGrille;
                var echelles = db.getSync(window.cle('echellesTemplates'), []);
                var echelle = echelles.find(function(e) { return e.id === grille.echelleId; });
                if (echelle) nomEchelle = echelle.nom || nomEchelle;
            }
        }
    } catch(e) { console.warn('[Planif-Carte] grille/echelle lookup skipped:', e.message || e); }
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
    var infoCDet = db.getSync('infoCours', null);
    var gcDetPlanif = infoCDet ? (infoCDet._groupeCoursId || infoCDet.id || null) : null;
    var dateEchDet = (typeof obtenirEcheanceEffective === 'function')
        ? obtenirEcheanceEffective(prod, gcDetPlanif).date : (prod.dateEcheance || null);
    return { nomProduction: prod.nom, ponderation: prod.ponderation, nomGrille: nomGrille, nomEchelle: nomEchelle, dateEcheance: dateEchDet };
}

function sauvegarderChoixActivite(leconId, activiteId, retroaction, productionId) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return;
    var seances = db.getSync(window.cle(CLE_SEANCES), {});
    if (!seances[leconId]) seances[leconId] = {};
    if (!seances[leconId].activites) seances[leconId].activites = {};
    seances[leconId].activites[activiteId] = { retroaction: retroaction, productionId: productionId || null };
    db.setSync(window.cle(CLE_SEANCES), seances);
}

function afficherLeconOrganisateur() {
    var leconId = orgSelectLecon.value;
    if (!leconId) {
        orgLecon.style.display = 'none';
        return;
    }
    orgLecon.style.display = '';

    var lecon = etat.noeuds.get(leconId);
    if (!lecon) return;

    // Objectif — remonter les branches pour trouver toutes les idées maîtresses
    var objContenu = orgLecon.querySelector('#planif-org-objectif .planif-org-section-contenu');
    var ideesM = trouverIdeesMaitressesAncetres(leconId);
    if (ideesM.length === 0) {
        objContenu.textContent = 'Aucune idée maîtresse associée. Reliez la branche à une idée maîtresse.';
        objContenu.classList.add('planif-org-placeholder');
    } else if (ideesM.length === 1) {
        var titre = (ideesM[0].titre || '...').toLowerCase();
        var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
        objContenu.textContent = 'Au terme de la leçon, l\'étudiant·e sera capable ' + prefixe + titre + '.';
        objContenu.classList.remove('planif-org-placeholder');
    } else {
        var html = 'Au terme de la leçon, l\u2019étudiant·e sera capable\u00a0:<br>';
        for (var k = 0; k < ideesM.length; k++) {
            var t = (ideesM[k].titre || '...').toLowerCase();
            var p = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? "d'" : 'de ';
            html += '\u00a0\u00a0— ' + p + t + (k < ideesM.length - 1 ? '\u00a0;' : '.') + '<br>';
        }
        objContenu.innerHTML = html;
        objContenu.classList.remove('planif-org-placeholder');
    }

    // Enseignement explicite — checkbox
    var eeContenu = document.getElementById('planif-org-ee-checkbox');
    if (eeContenu) {
        eeContenu.checked = !!(lecon.metadata && lecon.metadata.enseignementExplicite);
    }

    // Prérequis — placeholder (Phase 2)
    // Productions — placeholder (Phase 2)

    // Signal de cohérence évaluation
    var evalsLecon = (lecon.enfants || []).filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && e.type === 'evaluation';
    });

    // Cœur de la leçon — afficher les enfants (activités, soutiens, révisions, évaluations)
    var coeurContenu = document.getElementById('planif-org-coeur-contenu');
    var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var activites = enfants.filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && (e.type === 'activite' || e.type === 'soutien' || e.type === 'revision');
    });

    // Charger les productions depuis Construction de la note
    var productions = chargerProductions();
    var seances = typeof db !== 'undefined' ? db.getSync(window.cle(CLE_SEANCES), {}) : {};

    if (activites.length === 0) {
        coeurContenu.innerHTML = '<div class="planif-org-placeholder">Aucune activité dans cette leçon.</div>';
    } else {
        // Vérifier cohérence évaluation
        var aucuneProd = activites.every(function(eid) {
            var choix = (seances[leconId] && seances[leconId].activites && seances[leconId].activites[eid]) || {};
            return !choix.productionId;
        });
        var h = '';
        if (evalsLecon.length > 0 && aucuneProd) {
            h += '<div class="planif-org-avertissement">\u26A0 ' + evalsLecon.length + ' évaluation' + (evalsLecon.length > 1 ? 's' : '') + ' dans la carte ' + (evalsLecon.length > 1 ? 'ne sont reliées' : "n'est reliée") + ' à aucune activité ci-dessous.</div>';
        }

        for (var j = 0; j < activites.length; j++) {
            var enf = etat.noeuds.get(activites[j]);
            if (!enf) continue;
            var choixAct = (seances[leconId] && seances[leconId].activites && seances[leconId].activites[enf.id]) || { retroaction: 'aucune', productionId: null };

            h += '<div class="planif-org-activite" data-noeud="' + enf.id + '">';
            h += '<div class="planif-org-activite-entete">';
            h += '<span class="planif-cal-pastille-mini" style="background: ' + obtenirCouleurNoeud(enf) + '"></span>';
            h += '<span class="planif-cal-item-titre">' + (enf.titre || obtenirLabelNoeud(enf)) + '</span>';
            h += '<span class="planif-org-activite-type">' + obtenirLabelNoeud(enf).toUpperCase() + '</span>';
            if (enf.metadata && enf.metadata.duree) {
                h += ' <span class="planif-cal-duree">' + enf.metadata.duree + ' min</span>';
            }
            h += '</div>';

            // Rétroaction
            h += '<div class="planif-org-activite-detail">';
            h += '<label>Rétroaction\u00a0:</label>';
            h += '<select class="planif-org-select-retro" data-activite="' + enf.id + '" data-lecon="' + leconId + '">';
            var retros = [['aucune', 'Aucune'], ['orale', 'Orale'], ['ecrite', 'Écrite'], ['pairs', 'Par les pairs']];
            for (var r = 0; r < retros.length; r++) {
                h += '<option value="' + retros[r][0] + '"' + (choixAct.retroaction === retros[r][0] ? ' selected' : '') + '>' + retros[r][1] + '</option>';
            }
            h += '</select>';
            h += '</div>';

            // Production
            h += '<div class="planif-org-activite-detail">';
            h += '<label>Production\u00a0:</label>';
            h += '<select class="planif-org-select-prod" data-activite="' + enf.id + '" data-lecon="' + leconId + '">';
            h += '<option value="">Aucune</option>';
            if (productions.length > 0) {
                var parType = {};
                for (var p = 0; p < productions.length; p++) {
                    var tp = productions[p].type || 'autre';
                    if (!parType[tp]) parType[tp] = [];
                    parType[tp].push(productions[p]);
                }
                var typesOrdre = ['travail', 'examen', 'projet', 'quiz', 'autre'];
                var typesLabels = { travail: 'Travaux', examen: 'Examens', projet: 'Projets', quiz: 'Quiz', autre: 'Autres' };
                for (var ti = 0; ti < typesOrdre.length; ti++) {
                    var grp = parType[typesOrdre[ti]];
                    if (!grp || grp.length === 0) continue;
                    h += '<optgroup label="' + (typesLabels[typesOrdre[ti]] || typesOrdre[ti]) + '">';
                    for (var pi = 0; pi < grp.length; pi++) {
                        var selected = choixAct.productionId === grp[pi].id ? ' selected' : '';
                        h += '<option value="' + grp[pi].id + '"' + selected + '>' + grp[pi].nom + ' (' + (grp[pi].ponderation || 0) + ' %)</option>';
                    }
                    h += '</optgroup>';
                }
            }
            h += '</select>';
            h += '</div>';

            // Détails production (si sélectionnée)
            if (choixAct.productionId) {
                var details = afficherDetailsProduction(choixAct.productionId, productions);
                if (details) {
                    h += '<div class="planif-org-prod-details">';
                    h += 'Grille\u00a0: ' + details.nomGrille + ' \u00b7 Échelle\u00a0: ' + details.nomEchelle;
                    if (details.dateEcheance) h += '<br>Échéance\u00a0: ' + details.dateEcheance;
                    h += '</div>';
                }
            }

            h += '</div>';
        }
        coeurContenu.innerHTML = h;

        // Brancher les event listeners
        coeurContenu.querySelectorAll('.planif-org-select-retro').forEach(function(sel) {
            sel.addEventListener('change', function() {
                sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, sel.value, null);
            });
        });
        coeurContenu.querySelectorAll('.planif-org-select-prod').forEach(function(sel) {
            sel.addEventListener('change', function() {
                var retro = sel.closest('.planif-org-activite').querySelector('.planif-org-select-retro');
                sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, retro ? retro.value : 'aucune', sel.value || null);
                afficherLeconOrganisateur(); // Refresh to show production details
            });
        });
        coeurContenu.querySelectorAll('.planif-org-activite-entete').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var nid = el.closest('[data-noeud]').dataset.noeud;
                if (nid) naviguerVers(nid);
            });
        });
    }
}

function rafraichirSeances() {
    if (!seancesOuvert) return;

    // Peupler les sélecteurs
    if (orgSelectSequence) peuplerSelecteursOrganisateur();

    // Vue calendrier (dans la sous-section en bas)
    var cible = orgCalendrierContenu || panneauSeancesContenu;
    cible.innerHTML = genererSeancesHTML();
    cible.querySelectorAll('[data-noeud]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var noeudId = el.dataset.noeud;
            if (noeudId) naviguerVers(noeudId);
        });
    });
}

// === EXPORT DU PLAN DE COURS ===
function genererPlanTexte() {
    var sequences = [];
    var leconsOrphelines = [];
    var index = window.planificationDonnees.getIndex();
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

    function formatDuree(min) {
        if (!min) return '';
        var h = Math.floor(min / 60);
        var m = min % 60;
        return h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
    }

    function liensTexte(noeudId, indent) {
        var liens = getLiensDeNoeud(noeudId);
        if (liens.length === 0) return '';
        var s = '';
        for (var i = 0; i < liens.length; i++) {
            var l = liens[i];
            var fleche = l.direction === 'sortant' ? '→' : '←';
            s += indent + fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre + '\n';
        }
        return s;
    }

    var txt = '═══════════════════════════════════════\n';
    txt += 'PLAN DE COURS — ' + nomCarte + '\n';
    txt += 'Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n';
    txt += '═══════════════════════════════════════\n\n';

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var semTxt = '';
        if (seq.metadata && seq.metadata.semaineDebut) {
            semTxt = ' (Sem. ' + seq.metadata.semaineDebut;
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
            semTxt += ')';
        }

        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉQUENCE : ' + (seq.titre || 'Sans titre') + semTxt + '\n';
        txt += '───────────────────────────────────────\n';
        txt += liensTexte(seq.id, '  ');

        var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
        var dureeSeq = 0;

        for (var j = 0; j < enfants.length; j++) {
            var ed = etat.noeuds.get(enfants[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                var dureeLecon = ed.metadata && ed.metadata.duree ? ' — ' + formatDuree(ed.metadata.duree) : '';
                txt += '\n  ┌ SÉANCE : ' + (ed.titre || 'Sans titre') + dureeLecon + '\n';
                txt += liensTexte(ed.id, '  │ ');
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;

                var enfantsLecon = (ed.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
                for (var k = 0; k < enfantsLecon.length; k++) {
                    var cd = etat.noeuds.get(enfantsLecon[k]);
                    if (!cd) continue;
                    var dureeAct = cd.metadata && cd.metadata.duree ? ' (' + formatDuree(cd.metadata.duree) + ')' : '';
                    txt += '  │ • [' + obtenirLabelNoeud(cd) + '] ' + (cd.titre || 'Sans titre') + dureeAct + '\n';
                    txt += liensTexte(enfantsLecon[k], '  │   ');
                    if (cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;
                }
                txt += '  └─\n';
            } else {
                var dureeEd = ed.metadata && ed.metadata.duree ? ' (' + formatDuree(ed.metadata.duree) + ')' : '';
                txt += '  • [' + obtenirLabelNoeud(ed) + '] ' + (ed.titre || 'Sans titre') + dureeEd + '\n';
                txt += liensTexte(enfants[j], '    ');
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
            }
        }

        if (dureeSeq > 0) txt += '  Durée totale : ' + formatDuree(dureeSeq) + '\n';
        txt += '\n';
    }

    if (leconsOrphelines.length > 0) {
        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉANCES HORS SÉQUENCE\n';
        txt += '───────────────────────────────────────\n';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            var lecon = leconsOrphelines[p];
            var dlOrph = lecon.metadata && lecon.metadata.duree ? ' — ' + formatDuree(lecon.metadata.duree) : '';
            txt += '\n  ┌ SÉANCE : ' + (lecon.titre || 'Sans titre') + dlOrph + '\n';
            txt += liensTexte(lecon.id, '  │ ');
            var enfOrph = (lecon.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
            for (var q = 0; q < enfOrph.length; q++) {
                var cdOrph = etat.noeuds.get(enfOrph[q]);
                if (!cdOrph) continue;
                var dureeOrph = cdOrph.metadata && cdOrph.metadata.duree ? ' (' + formatDuree(cdOrph.metadata.duree) + ')' : '';
                txt += '  │ • [' + obtenirLabelNoeud(cdOrph) + '] ' + (cdOrph.titre || 'Sans titre') + dureeOrph + '\n';
                txt += liensTexte(enfOrph[q], '  │   ');
            }
            txt += '  └─\n';
        }
    }

    return txt;
}

function genererPlanTSV() {
    var sequences = [];
    var leconsOrphelines = [];

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

    var tsv = 'Séquence\tSemaines\tSéance\tDurée séance (min)\tType\tTitre\tDurée (min)\tLiens\n';

    function liensCompacts(noeudId) {
        var liens = getLiensDeNoeud(noeudId);
        return liens.map(function(l) {
            var fleche = l.direction === 'sortant' ? '→' : '←';
            return fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre;
        }).join(' ; ');
    }

    function escape(str) {
        return (str || '').replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var semTxt = '';
        if (seq.metadata && seq.metadata.semaineDebut) {
            semTxt = seq.metadata.semaineDebut.toString();
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
        }
        var seqLiens = liensCompacts(seq.id);
        var seqNom = escape(seq.titre || 'Sans titre');
        var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });

        if (enfants.length === 0) {
            tsv += seqNom + '\t' + semTxt + '\t\t\tSéquence\t' + seqNom + '\t\t' + escape(seqLiens) + '\n';
            continue;
        }

        for (var j = 0; j < enfants.length; j++) {
            var ed = etat.noeuds.get(enfants[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                var leconNom = escape(ed.titre || 'Sans titre');
                var leconDuree = ed.metadata && ed.metadata.duree || '';
                var leconLiens = liensCompacts(ed.id);
                tsv += seqNom + '\t' + semTxt + '\t' + leconNom + '\t' + leconDuree + '\tSéance\t' + leconNom + '\t' + leconDuree + '\t' + escape(leconLiens) + '\n';

                var enfantsLecon = (ed.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
                for (var k = 0; k < enfantsLecon.length; k++) {
                    var cd = etat.noeuds.get(enfantsLecon[k]);
                    if (!cd) continue;
                    var actLiens = liensCompacts(enfantsLecon[k]);
                    tsv += seqNom + '\t' + semTxt + '\t' + leconNom + '\t' + leconDuree + '\t' + escape(obtenirLabelNoeud(cd)) + '\t' + escape(cd.titre || 'Sans titre') + '\t' + (cd.metadata && cd.metadata.duree || '') + '\t' + escape(actLiens) + '\n';
                }
            } else {
                var actLiens2 = liensCompacts(enfants[j]);
                tsv += seqNom + '\t' + semTxt + '\t\t\t' + escape(obtenirLabelNoeud(ed)) + '\t' + escape(ed.titre || 'Sans titre') + '\t' + (ed.metadata && ed.metadata.duree || '') + '\t' + escape(actLiens2) + '\n';
            }
        }
    }

    for (var p = 0; p < leconsOrphelines.length; p++) {
        var lecon2 = leconsOrphelines[p];
        var leconNom2 = escape(lecon2.titre || 'Sans titre');
        var leconDuree2 = lecon2.metadata && lecon2.metadata.duree || '';
        var leconLiens2 = liensCompacts(lecon2.id);
        tsv += '(Hors séquence)\t\t' + leconNom2 + '\t' + leconDuree2 + '\tSéance\t' + leconNom2 + '\t' + leconDuree2 + '\t' + escape(leconLiens2) + '\n';

        var enfOrph = (lecon2.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
        for (var q = 0; q < enfOrph.length; q++) {
            var cdOrph = etat.noeuds.get(enfOrph[q]);
            if (!cdOrph) continue;
            var actLiens3 = liensCompacts(enfOrph[q]);
            tsv += '(Hors séquence)\t\t' + leconNom2 + '\t' + leconDuree2 + '\t' + escape(obtenirLabelNoeud(cdOrph)) + '\t' + escape(cdOrph.titre || 'Sans titre') + '\t' + (cdOrph.metadata && cdOrph.metadata.duree || '') + '\t' + escape(actLiens3) + '\n';
        }
    }

    return tsv;
}

function telechargerFichier(contenu, nomFichier, type) {
    var blob = new Blob(['\uFEFF' + contenu], { type: type + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);
}

// === MULTI-CARTES UI ===
function mettreAJourListeCartes() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var select = document.getElementById('planif-liste-cartes');
    if (!select) return;
    select.innerHTML = '';
    for (var i = 0; i < index.cartes.length; i++) {
        var carte = index.cartes[i];
        var opt = document.createElement('option');
        opt.value = carte.id;
        opt.textContent = carte.nom;
        if (carte.id === index.active) {
            opt.selected = true;
            var titreCarte = document.getElementById('planif-titre-carte');
            if (titreCarte && document.activeElement !== titreCarte) {
                titreCarte.value = carte.nom;
                titreCarte.size = Math.max(10, carte.nom.length + 2);
            }
        }
        select.appendChild(opt);
    }
}

function nouvelleCarte(nom) {
    sequenceActiveId = null;
    var index = window.planificationDonnees.getIndex();
    if (!index) index = { active: null, compteurCartes: 0, cartes: [] };
    var id = 'carte_' + (++index.compteurCartes);
    index.cartes.push({ id: id, nom: nom || 'Sans titre', dateCreation: new Date().toISOString() });
    index.active = id;
    window.planificationDonnees.sauvegarderIndex(index);
    viderCanvas();
    mettreAJourListeCartes();
    sauvegarder();
    centrerVueSurContenu();
}

function renommerCarteActive(nouveauNom) {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    if (!carte) return;
    carte.nom = nouveauNom || 'Sans titre';
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
}

function exporterCarte() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    var donnees = {
        nom: carte ? carte.nom : 'Sans titre',
        dateExport: new Date().toISOString(),
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    var blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = ((carte ? carte.nom : 'carte').replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '')) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importerCarte(fichier) {
    var lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            var donnees = JSON.parse(e.target.result);
            if (!donnees.noeuds || !Array.isArray(donnees.noeuds)) {
                console.warn('[Planification] Format de fichier invalide.');
                return;
            }
            var nom = donnees.nom || fichier.name.replace('.json', '') || 'Importée';
            var index = window.planificationDonnees.getIndex();
            if (!index) index = { active: null, compteurCartes: 0, cartes: [] };
            var id = 'carte_' + (++index.compteurCartes);
            index.cartes.push({ id: id, nom: nom, dateCreation: new Date().toISOString() });
            index.active = id;
            window.planificationDonnees.sauvegarderIndex(index);
            // Migration anciens types de connaissances → Anderson (fichiers importés)
            for (var mi = 0; mi < donnees.noeuds.length; mi++) {
                var nm = donnees.noeuds[mi];
                if (nm.type === 'connaissance') nm.type = 'factuelle';
                else if (nm.type === 'strategie') nm.type = 'procedurale';
                else if (nm.type === 'condition') nm.type = 'procedurale';
                else if (nm.type === 'prerequis') {
                    nm.type = 'factuelle';
                    if (!nm.metadata) nm.metadata = {};
                    nm.metadata.prealable = true;
                }
            }
            var contenu = {
                compteur: donnees.compteur || 0,
                compteurLiens: donnees.compteurLiens || 0,
                noeuds: donnees.noeuds,
                liens: donnees.liens || []
            };
            window.planificationDonnees.sauvegarderCarte(id, contenu);
            mettreAJourListeCartes();
            chargerCarte(id);
        } catch (err) {
            console.warn('[Planification] Erreur importation :', err.message);
        }
    };
    lecteur.readAsText(fichier);
}

function supprimerCarteActive() {
    var index = window.planificationDonnees.getIndex();
    if (!index || index.cartes.length <= 1) {
        console.warn('[Planification] Impossible de supprimer la dernière carte.');
        return;
    }
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    if (!confirm('Supprimer la carte « ' + (carte ? carte.nom : '') + ' » ?')) return;

    window.planificationDonnees.supprimerCarte(index.active);
    index.cartes = index.cartes.filter(function(c) { return c.id !== index.active; });
    index.active = index.cartes[0].id;
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
    chargerCarte(index.active);
}

function dupliquerCarteActive() {
    sauvegarder();
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carteOrigine = index.cartes.find(function(c) { return c.id === index.active; });
    var nomOrigine = carteOrigine ? carteOrigine.nom : 'Sans titre';
    var nom = prompt('Nom de la copie :', nomOrigine + ' (copie)');
    if (nom === null) return;
    var id = 'carte_' + (++index.compteurCartes);
    index.cartes.push({ id: id, nom: nom.trim() || nomOrigine + ' (copie)', dateCreation: new Date().toISOString() });
    var contenu = {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    window.planificationDonnees.sauvegarderCarte(id, contenu);
    index.active = id;
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
    chargerCarte(id);
}

function changerCarte(carteId) {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    sauvegarder();
    index.active = carteId;
    window.planificationDonnees.sauvegarderIndex(index);
    chargerCarte(carteId);
    mettreAJourListeCartes();
}

// === INITIALISATION ===
function initialiser() {
    if (etat.initialise) return;

    // Refs DOM
    zoneTravail = document.getElementById('planif-zone-travail');
    espace = document.getElementById('planif-espace');
    espaceWrapper = document.getElementById('planif-espace-wrapper');
    coucheNoeuds = document.getElementById('planif-couche-noeuds');
    coucheLiens = document.getElementById('planif-couche-liens');
    canvas = document.getElementById('planif-canvas');
    lienTemp = document.getElementById('planif-lien-temp');
    panneau = document.getElementById('planif-panneau');
    menuLien = document.getElementById('planif-menu-lien');
    rectSelection = document.getElementById('planif-rect-selection');
    panneauSeances = document.getElementById('planif-panneau-seances');
    panneauSeancesContenu = document.getElementById('planif-panneau-seances-contenu');
    btnSeances = document.getElementById('planif-btn-seances');
    orgSelectSequence = document.getElementById('planif-org-select-sequence');
    orgSelectLecon = document.getElementById('planif-org-select-lecon');
    orgLecon = document.getElementById('planif-org-lecon');
    orgCalendrierContenu = document.getElementById('planif-org-calendrier-contenu');
    orgCalendrierToggle = document.getElementById('planif-org-calendrier-toggle');

    if (!zoneTravail || !espace) {
        console.warn('[Planification] DOM non prêt.');
        return;
    }

    appliquerZoom();

    // Zoom molette
    var gestureEnCours = false;
    zoneTravail.addEventListener('wheel', function(e) {
        if (e.ctrlKey && !gestureEnCours) {
            e.preventDefault();
            var facteur = e.deltaY < 0 ? 1.05 : 0.95;
            zoomer(e.clientX, e.clientY, facteur);
        }
    }, { passive: false });

    // Zoom gestuel Safari
    if ('GestureEvent' in window) {
        var gestureBaseZoom = 1;
        zoneTravail.addEventListener('gesturestart', function(e) {
            e.preventDefault();
            gestureEnCours = true;
            gestureBaseZoom = etat.zoom;
        });
        zoneTravail.addEventListener('gesturechange', function(e) {
            e.preventDefault();
            var oldZoom = etat.zoom;
            etat.zoom = Math.max(0.25, Math.min(3, gestureBaseZoom * e.scale));
            appliquerZoom();
            var rect = zoneTravail.getBoundingClientRect();
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            var espaceX = (cx + zoneTravail.scrollLeft) / oldZoom;
            var espaceY = (cy + zoneTravail.scrollTop) / oldZoom;
            zoneTravail.scrollLeft = espaceX * etat.zoom - cx;
            zoneTravail.scrollTop = espaceY * etat.zoom - cy;
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
        });
        zoneTravail.addEventListener('gestureend', function(e) {
            e.preventDefault();
            gestureEnCours = false;
        });
    }

    // Zoom tactile
    var touchStartDist = null;
    var touchStartZoom = null;
    zoneTravail.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDist = Math.hypot(dx, dy);
            touchStartZoom = etat.zoom;
        }
    }, { passive: true });
    zoneTravail.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && touchStartDist) {
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            var dist = Math.hypot(dx, dy);
            var scale = dist / touchStartDist;
            var oldZoom = etat.zoom;
            etat.zoom = Math.max(0.25, Math.min(3, touchStartZoom * scale));
            appliquerZoom();
            var rect = zoneTravail.getBoundingClientRect();
            var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            var localX = midX - rect.left;
            var localY = midY - rect.top;
            var espaceX = (localX + zoneTravail.scrollLeft) / oldZoom;
            var espaceY = (localY + zoneTravail.scrollTop) / oldZoom;
            zoneTravail.scrollLeft = espaceX * etat.zoom - localX;
            zoneTravail.scrollTop = espaceY * etat.zoom - localY;
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
        }
    }, { passive: true });
    zoneTravail.addEventListener('touchend', function() {
        touchStartDist = null;
        touchStartZoom = null;
    });

    // Palette drag & drop
    var paletteDragType = null;
    var paletteSurvolConteneur = null;

    document.querySelectorAll('#planif-palette .planif-palette-btn').forEach(function(btn) {
        btn.addEventListener('dragstart', function(e) {
            paletteDragType = btn.dataset.type;
            e.dataTransfer.setData('planif-type', btn.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });

        btn.addEventListener('dragend', function() {
            if (paletteSurvolConteneur) {
                var el = document.getElementById(paletteSurvolConteneur);
                if (el) {
                    el.classList.remove('planif-conteneur-survol');
                    var zn = el.querySelector('.planif-noeud-zone');
                    if (zn) zn.classList.remove('planif-survol');
                }
            }
            paletteDragType = null;
            paletteSurvolConteneur = null;
        });

        btn.addEventListener('click', function(e) {
            if (e.detail === 1) {
                var rect = zoneTravail.getBoundingClientRect();
                var centre = clientVersData(rect.left + rect.width / 2, rect.top + rect.height / 2);
                var x = centre.x - 70 + (Math.random() - 0.5) * 100;
                var y = centre.y - 30 + (Math.random() - 0.5) * 100;
                creerNoeud(btn.dataset.type, x, y);
            }
        });
    });

    // Drag palette flottante
    var palette = document.getElementById('planif-palette');
    var paletteBarre = palette ? palette.querySelector('.planif-palette-barre') : null;
    if (paletteBarre) {
        // Pointer Events : couvre souris, doigt (iPad) et Apple Pencil.
        // Nécessite touch-action:none sur .planif-palette-barre (styles.css).
        paletteBarre.addEventListener('pointerdown', function(e) {
            if (e.target.closest('.planif-palette-toggle')) return;
            if (!e.isPrimary) return;
            e.preventDefault();
            var pointerId = e.pointerId;
            var startX = e.clientX;
            var startY = e.clientY;
            var rect = palette.getBoundingClientRect();
            var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
            var startLeft = rect.left - wrapperRect.left;
            var startTop = rect.top - wrapperRect.top;

            function onMove(e2) {
                if (e2.pointerId !== pointerId) return;
                palette.style.left = (startLeft + e2.clientX - startX) + 'px';
                palette.style.top = (startTop + e2.clientY - startY) + 'px';
            }
            function onUp(e2) {
                if (e2.pointerId !== pointerId) return;
                paletteBarre.removeEventListener('pointermove', onMove);
                paletteBarre.removeEventListener('pointerup', onUp);
                paletteBarre.removeEventListener('pointercancel', onUp);
            }
            paletteBarre.setPointerCapture(pointerId);
            paletteBarre.addEventListener('pointermove', onMove);
            paletteBarre.addEventListener('pointerup', onUp);
            paletteBarre.addEventListener('pointercancel', onUp);
        });
    }

    // Toggle repli palette
    var paletteToggle = document.getElementById('planif-palette-toggle');
    if (paletteToggle && palette) {
        paletteToggle.addEventListener('click', function() {
            palette.classList.toggle('planif-palette-replie');
            paletteToggle.textContent = palette.classList.contains('planif-palette-replie') ? '+' : '−';
            paletteToggle.title = palette.classList.contains('planif-palette-replie') ? 'Ouvrir la palette' : 'Réduire la palette';
        });
    }

    // Inspecteur — bouton 🔎 de la palette
    var btnInspecteur = document.getElementById('planif-palette-inspecteur-btn');
    if (btnInspecteur) {
        btnInspecteur.addEventListener('click', function() {
            if (etat.panneauOuvert) {
                fermerPanneau();
            } else if (etat.selection) {
                ouvrirPanneau(etat.selection);
            }
        });
    }

    // Raccourcis flottant — bouton 🛎️ de la palette
    var raccourcisPanel = document.getElementById('planif-raccourcis-panel');
    var btnRaccourcis = document.getElementById('planif-palette-raccourcis-btn');
    if (btnRaccourcis && raccourcisPanel) {
        btnRaccourcis.addEventListener('click', function() {
            var estVisible = raccourcisPanel.style.display !== 'none';
            raccourcisPanel.style.display = estVisible ? 'none' : '';
        });
        var raccFermerBtn = raccourcisPanel.querySelector('.planif-raccourcis-panel-fermer');
        if (raccFermerBtn) {
            raccFermerBtn.addEventListener('click', function() {
                raccourcisPanel.style.display = 'none';
            });
        }
        var raccReplierBtn = raccourcisPanel.querySelector('.planif-raccourcis-panel-replier');
        if (raccReplierBtn) {
            raccReplierBtn.addEventListener('click', function() {
                var contenu = raccourcisPanel.querySelector('.planif-raccourcis-panel-contenu');
                if (!contenu) return;
                var estReplie = contenu.style.display === 'none';
                contenu.style.display = estReplie ? '' : 'none';
                raccReplierBtn.textContent = estReplie ? '−' : '+';
                raccReplierBtn.title = estReplie ? 'Replier' : 'Déplier';
            });
        }
        // Drag panneau raccourcis
        var raccBarre = raccourcisPanel.querySelector('.planif-guide-barre');
        if (raccBarre) {
            raccBarre.addEventListener('mousedown', function(e) {
                if (e.target.closest('.planif-raccourcis-panel-fermer') || e.target.closest('.planif-raccourcis-panel-replier')) return;
                e.preventDefault();
                var startX = e.clientX;
                var startY = e.clientY;
                var rect = raccourcisPanel.getBoundingClientRect();
                var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
                var startLeft = rect.left - wrapperRect.left;
                var startTop = rect.top - wrapperRect.top;
                function onMove(e2) {
                    raccourcisPanel.style.left = (startLeft + e2.clientX - startX) + 'px';
                    raccourcisPanel.style.top = (startTop + e2.clientY - startY) + 'px';
                    raccourcisPanel.style.right = 'auto';
                }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }
    }

    // Guide flottant — bouton 📔 de la palette (#167)
    var btnAidePalette = document.getElementById('planif-palette-aide-btn');
    if (btnAidePalette) {
        btnAidePalette.addEventListener('click', function() {
            if (_guideOuvert) {
                fermerGuide();
            } else {
                ouvrirGuide();
            }
        });
    }

    // Bouton fermer du panneau guide
    var guidePanel = document.getElementById('planif-guide-panel');
    var guideFermerBtn = guidePanel ? guidePanel.querySelector('.planif-guide-panel-fermer') : null;
    if (guideFermerBtn) {
        guideFermerBtn.addEventListener('click', fermerGuide);
    }

    // Bouton replier/déplier du panneau guide
    var guideReplierBtn = guidePanel ? guidePanel.querySelector('.planif-guide-panel-replier') : null;
    if (guideReplierBtn) {
        guideReplierBtn.addEventListener('click', function() {
            var contenu = guidePanel.querySelector('.planif-guide-panel-contenu');
            if (!contenu) return;
            var estReplie = contenu.style.display === 'none';
            contenu.style.display = estReplie ? '' : 'none';
            guideReplierBtn.textContent = estReplie ? '−' : '+';
            guideReplierBtn.title = estReplie ? 'Replier le guide' : 'Déplier le guide';
        });
    }

    // Drag panneau guide flottant — même pattern que la palette
    var guideBarre = guidePanel ? guidePanel.querySelector('.planif-guide-barre') : null;
    if (guideBarre) {
        guideBarre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.planif-guide-panel-fermer') || e.target.closest('.planif-guide-panel-replier')) return;
            e.preventDefault();
            var startX = e.clientX;
            var startY = e.clientY;
            var rect = guidePanel.getBoundingClientRect();
            var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
            var startLeft = rect.left - wrapperRect.left;
            var startTop = rect.top - wrapperRect.top;

            function onMove(e2) {
                guidePanel.style.left = (startLeft + e2.clientX - startX) + 'px';
                guidePanel.style.top = (startTop + e2.clientY - startY) + 'px';
                guidePanel.style.right = 'auto';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // Clic sur un panneau flottant = premier plan
    var _zIndexPanneaux = 81;
    [raccourcisPanel, guidePanel].forEach(function(panel) {
        if (panel) {
            panel.addEventListener('mousedown', function() {
                panel.style.zIndex = ++_zIndexPanneaux;
            });
        }
    });

    zoneTravail.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        if (paletteDragType) {
            var ancien = paletteSurvolConteneur;
            paletteSurvolConteneur = trouverConteneurPour(e.clientX, e.clientY, null, paletteDragType);
            if (ancien !== paletteSurvolConteneur) {
                if (ancien) {
                    var aEl = document.getElementById(ancien);
                    if (aEl) {
                        aEl.classList.remove('planif-conteneur-survol');
                        var zn = aEl.querySelector('.planif-noeud-zone');
                        if (zn) zn.classList.remove('planif-survol');
                    }
                }
                if (paletteSurvolConteneur) {
                    var sEl = document.getElementById(paletteSurvolConteneur);
                    if (sEl) {
                        sEl.classList.add('planif-conteneur-survol');
                        var zn2 = sEl.querySelector('.planif-noeud-zone');
                        if (zn2) zn2.classList.add('planif-survol');
                    }
                }
            }
        }
    });

    zoneTravail.addEventListener('drop', function(e) {
        e.preventDefault();
        var type = e.dataTransfer.getData('planif-type');
        if (!type || !TYPES[type]) return;

        // Capturer le conteneur cible détecté pendant le dragover
        var conteneurCible = paletteSurvolConteneur;

        // Nettoyer le feedback visuel du survol palette
        if (paletteSurvolConteneur) {
            var scEl = document.getElementById(paletteSurvolConteneur);
            if (scEl) {
                scEl.classList.remove('planif-conteneur-survol');
                var scZn = scEl.querySelector('.planif-noeud-zone');
                if (scZn) scZn.classList.remove('planif-survol');
            }
        }

        var pos = clientVersData(e.clientX, e.clientY);
        var newId = creerNoeud(type, pos.x - 70, pos.y - 20);

        // Fallback: re-détecter le conteneur si pas détecté pendant le dragover
        if (!conteneurCible) {
            conteneurCible = trouverConteneurPour(e.clientX, e.clientY, newId, type);
        }

        if (conteneurCible) {
            // Différer au prochain macrotask pour garantir le rendu complet de l'élément
            setTimeout(function() {
                rattacherAuConteneur(newId, conteneurCible);
                sauvegarder();
            }, 0);
        }

        paletteDragType = null;
        paletteSurvolConteneur = null;
    });

    // Sélection par rectangle (lasso)
    espace.addEventListener('mousedown', function(e) {
        if (e.target.closest('.planif-noeud') || e.target.closest('.planif-lien-groupe') || e.target.closest('.planif-noeud-port')) return;
        if (e.target !== espace && e.target !== canvas && e.target.tagName !== 'svg'
            && e.target.id !== 'planif-couche-noeuds' && !e.target.closest('#planif-couche-svg-offset')) return;
        if (e.target.closest('#planif-panneau') || e.target.closest('#planif-menu-lien')) return;

        var startEspace = clientVersEspace(e.clientX, e.clientY);
        var startEspaceX = startEspace.x;
        var startEspaceY = startEspace.y;
        var moved = false;

        deselectionnerTout();

        function onMove(e2) {
            moved = true;
            var cur = clientVersEspace(e2.clientX, e2.clientY);
            var x = Math.min(startEspaceX, cur.x);
            var y = Math.min(startEspaceY, cur.y);
            var w = Math.abs(cur.x - startEspaceX);
            var h = Math.abs(cur.y - startEspaceY);

            rectSelection.style.left = x + 'px';
            rectSelection.style.top = y + 'px';
            rectSelection.style.width = w + 'px';
            rectSelection.style.height = h + 'px';
            rectSelection.style.display = 'block';

            for (var entry of etat.noeuds) {
                var nid = entry[0];
                var nd = entry[1];
                var nel = document.getElementById(nid);
                if (!nel) continue;
                var nx = nd.x + OFFSET_X;
                var ny = nd.y + OFFSET_Y;
                var nw = nel.offsetWidth || 140;
                var nh = nel.offsetHeight || 50;
                var intersecte = !(nx + nw < x || nx > x + w || ny + nh < y || ny > y + h);
                if (intersecte) nel.classList.add('selected');
                else nel.classList.remove('selected');
            }
        }

        function onUp(e2) {
            document.removeEventListener('mousemove', onMoveThrottled);
            document.removeEventListener('mouseup', onUp);
            rectSelection.style.display = 'none';

            if (!moved) { deselectionner(); return; }

            var cur = clientVersEspace(e2.clientX, e2.clientY);
            var x = Math.min(startEspaceX, cur.x);
            var y = Math.min(startEspaceY, cur.y);
            var w = Math.abs(cur.x - startEspaceX);
            var h = Math.abs(cur.y - startEspaceY);

            etat.multiSelection.clear();
            for (var entry of etat.noeuds) {
                var nid = entry[0];
                var nd = entry[1];
                var nel = document.getElementById(nid);
                if (!nel) continue;
                var nx = nd.x + OFFSET_X;
                var ny = nd.y + OFFSET_Y;
                var nw = nel.offsetWidth || 140;
                var nh = nel.offsetHeight || 50;
                var intersecte = !(nx + nw < x || nx > x + w || ny + nh < y || ny > y + h);
                if (intersecte) {
                    etat.multiSelection.add(nid);
                    nel.classList.add('selected');
                }
            }

            if (etat.multiSelection.size === 1) {
                var seul = Array.from(etat.multiSelection)[0];
                etat.multiSelection.clear();
                selectionnerNoeud(seul);
            } else if (etat.multiSelection.size === 0) {
                deselectionner();
            }
        }

        var onMoveThrottled = throttleRAF(onMove);
        document.addEventListener('mousemove', onMoveThrottled);
        document.addEventListener('mouseup', onUp);
    });

    // Événements multi-cartes
    var listeCartes = document.getElementById('planif-liste-cartes');
    if (listeCartes) {
        listeCartes.addEventListener('change', function(e) { changerCarte(e.target.value); });
    }

    // Menu déroulant Actions
    var btnActions = document.getElementById('planif-btn-actions');
    var dropdown = document.getElementById('planif-actions-dropdown');
    if (btnActions && dropdown) {
        btnActions.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('ouvert');
        });
        document.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });
        dropdown.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });
    }

    var btnNouvelle = document.getElementById('planif-btn-nouvelle-carte');
    if (btnNouvelle) {
        btnNouvelle.addEventListener('click', function() {
            var nom = prompt('Nom de la nouvelle carte :', 'Nouvelle carte');
            if (nom === null) return;
            nouvelleCarte(nom.trim() || 'Sans titre');
        });
    }

    var btnSupprimerCarte = document.getElementById('planif-btn-supprimer-carte');
    if (btnSupprimerCarte) btnSupprimerCarte.addEventListener('click', supprimerCarteActive);

    var btnDupliquerCarte = document.getElementById('planif-btn-dupliquer-carte');
    if (btnDupliquerCarte) btnDupliquerCarte.addEventListener('click', dupliquerCarteActive);

    var btnImporterCarte = document.getElementById('planif-btn-importer-carte');
    if (btnImporterCarte) {
        btnImporterCarte.addEventListener('click', function() {
            document.getElementById('planif-fichier-import').click();
        });
    }

    var btnAnnuler = document.getElementById('planif-btn-annuler');
    if (btnAnnuler) btnAnnuler.addEventListener('click', annuler);

    var fichierImport = document.getElementById('planif-fichier-import');
    if (fichierImport) {
        fichierImport.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                importerCarte(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // Bouton exporter carte (menu Actions)
    var btnExporterCarte = document.getElementById('planif-btn-exporter-carte');
    if (btnExporterCarte) {
        btnExporterCarte.addEventListener('click', function() {
            var idx = window.planificationDonnees.getIndex();
            if (idx && idx.active && typeof exporterAlignementJSON === 'function') {
                exporterAlignementJSON(idx.active);
            }
        });
    }

    // Bouton bibliothèque (palette d'éléments)
    var btnBibliotheque = document.getElementById('planif-palette-bibliotheque-btn');
    if (btnBibliotheque) {
        btnBibliotheque.addEventListener('click', function() {
            if (typeof afficherBibliothequeAlignements === 'function') {
                afficherBibliothequeAlignements();
            }
        });
    }

    // Titre carte éditable
    var titreCarte = document.getElementById('planif-titre-carte');
    if (titreCarte) {
        function ajusterLargeurTitre() {
            titreCarte.size = Math.max(10, titreCarte.value.length + 2);
        }
        titreCarte.addEventListener('input', function() {
            renommerCarteActive(titreCarte.value.trim());
            ajusterLargeurTitre();
        });
        titreCarte.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); titreCarte.blur(); }
        });
        ajusterLargeurTitre();
    }

    // Fermer panneau
    var btnFermerPanneau = document.getElementById('planif-btn-fermer-panneau');
    if (btnFermerPanneau) btnFermerPanneau.addEventListener('click', fermerPanneau);

    // Séances — Naviguer vers le sous-onglet Organisateur
    if (btnSeances) btnSeances.addEventListener('click', function() {
        // Pré-sélectionner la leçon active si possible
        var leconId = etat.selection;
        if (leconId) {
            var noeud = etat.noeuds.get(leconId);
            if (!noeud || noeud.type !== 'lecon') leconId = null;
        }
        if (typeof window.organisateur !== 'undefined' && leconId) {
            window.organisateur.naviguerVersLecon(leconId);
        } else if (typeof afficherSousSection === 'function') {
            afficherSousSection('conception-organisateur');
            var boutons = document.querySelectorAll('.sous-navigation button');
            boutons.forEach(function(btn) {
                btn.classList.toggle('actif', btn.getAttribute('data-sous-onglet') === 'conception-organisateur');
            });
        }
    });

    // Legacy: Organisateur side panel selectors (kept for backward compat)
    if (orgSelectSequence) orgSelectSequence.addEventListener('change', peuplerSelecteurLecons);
    if (orgSelectLecon) orgSelectLecon.addEventListener('change', afficherLeconOrganisateur);
    var eeCheckbox = document.getElementById('planif-org-ee-checkbox');
    if (eeCheckbox) {
        eeCheckbox.addEventListener('change', function(e) {
            var leconId = orgSelectLecon ? orgSelectLecon.value : '';
            if (!leconId) return;
            var lecon = etat.noeuds.get(leconId);
            if (!lecon) return;
            enregistrerPourUndo();
            if (!lecon.metadata) lecon.metadata = {};
            lecon.metadata.enseignementExplicite = e.target.checked;
            sauvegarder();
        });
    }
    if (orgCalendrierToggle) {
        orgCalendrierToggle.addEventListener('click', function() {
            var contenu = orgCalendrierContenu;
            var chevron = orgCalendrierToggle.querySelector('.planif-org-chevron');
            if (contenu.style.display === 'none') {
                contenu.style.display = '';
                if (chevron) chevron.textContent = '▾';
            } else {
                contenu.style.display = 'none';
                if (chevron) chevron.textContent = '▸';
            }
        });
    }

    // Export texte/TSV
    var btnExportTexte = document.getElementById('planif-btn-export-texte');
    if (btnExportTexte) {
        btnExportTexte.addEventListener('click', function() {
            var index = window.planificationDonnees.getIndex();
            var nomCarte = 'plan';
            if (index && index.cartes) {
                var c = index.cartes.find(function(cc) { return cc.id === index.active; });
                if (c) nomCarte = c.nom;
            }
            var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '_plan.txt';
            telechargerFichier(genererPlanTexte(), nomFichier, 'text/plain');
        });
    }

    var btnExportTSV = document.getElementById('planif-btn-export-tsv');
    if (btnExportTSV) {
        btnExportTSV.addEventListener('click', function() {
            var index = window.planificationDonnees.getIndex();
            var nomCarte = 'plan';
            if (index && index.cartes) {
                var c = index.cartes.find(function(cc) { return cc.id === index.active; });
                if (c) nomCarte = c.nom;
            }
            var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '_plan.tsv';
            telechargerFichier(genererPlanTSV(), nomFichier, 'text/tab-separated-values');
        });
    }

    // Recentrer
    var btnRecentrer = document.getElementById('planif-btn-recentrer');
    if (btnRecentrer) btnRecentrer.addEventListener('click', function() { centrerVueSurContenu(); });

    // Boutons de zoom prédéfinis (100%, 75%, 50%, 25%)
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var niveauZoom = parseFloat(btn.dataset.zoom);
            etat.zoom = niveauZoom;
            appliquerZoom();
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(niveauZoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
            centrerVueSurContenu();
        });
    });

    etat.initialise = true;

    // Charger les données
    window.planificationDonnees.migrerDonneesProto();
    var index = window.planificationDonnees.initialiserSiNecessaire();
    mettreAJourListeCartes();
    chargerCarte(index.active);
}

// === RACCOURCIS CLAVIER (gérés via planificationActive flag) ===
function gererKeydown(e) {
    if (!planificationActive) return;

    var pasDansChamp = !document.activeElement.isContentEditable
        && document.activeElement.tagName !== 'INPUT'
        && document.activeElement.tagName !== 'TEXTAREA';

    // Vérifier qu'on est bien dans la section structure (carte mentale)
    var sectionPlanif = document.getElementById('section-conception');
    if (!sectionPlanif || !sectionPlanif.classList.contains('active')) return;

    if ((e.metaKey || e.ctrlKey) && e.key === 'a' && pasDansChamp) {
        e.preventDefault();
        toutSelectionner();
        return;
    }

    if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+') && pasDansChamp) {
        e.preventDefault();
        var rect = zoneTravail.getBoundingClientRect();
        zoomer(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.15);
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '-' && pasDansChamp) {
        e.preventDefault();
        var rect2 = zoneTravail.getBoundingClientRect();
        zoomer(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2, 0.85);
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '0' && pasDansChamp) {
        e.preventDefault();
        etat.zoom = 1;
        appliquerZoom();
        var zoomInfo = document.getElementById('planif-zoom-info');
        if (zoomInfo) zoomInfo.textContent = '100%';
        mettreAJourBoutonsZoomPreset();
        centrerVueSurContenu();
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '1' && pasDansChamp) {
        e.preventDefault();
        centrerVueSurContenu();
        return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'd' && pasDansChamp) {
        e.preventDefault();
        if (etat.selection) clonerNoeud(etat.selection);
        return;
    }

    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z' && pasDansChamp) {
        e.preventDefault();
        annuler();
        return;
    }
    if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        if (pasDansChamp) {
            e.preventDefault();
            retablir();
            return;
        }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (pasDansChamp) {
            if (etat.multiSelection.size > 0) {
                enregistrerPourUndo();
                _undoBatch = true;
                for (var nid of Array.from(etat.multiSelection)) {
                    supprimerNoeud(nid);
                }
                _undoBatch = false;
                etat.multiSelection.clear();
                fermerPanneau();
            } else if (etat.selection) {
                supprimerNoeud(etat.selection);
                fermerPanneau();
            }
        }
    }
    if (e.key === 'Escape') {
        deselectionner();
        fermerMenuLien();
    }
}

// Attacher/détacher le keydown global
document.addEventListener('keydown', gererKeydown);

// === EXPORT ===
/**
 * Injecte une liste de nœuds dans la carte active, reconstruit le DOM et sauvegarde.
 * Utilisé par l'import MD de l'organisateur.
 * @param {Array} listeNoeuds - Nœuds au format { id, type, titre, x, y, parent, enfants, metadata }
 */
function injecterNoeuds(listeNoeuds) {
    for (var i = 0; i < listeNoeuds.length; i++) {
        var n = listeNoeuds[i];
        if (!n.enfants) n.enfants = [];
        if (!n.parent) n.parent = null;
        if (!n.metadata) n.metadata = {};
        if (!('cloneSourceId' in n)) n.cloneSourceId = null;
        etat.noeuds.set(n.id, n);
    }
    reconstruireDOM();
    sauvegarder();
    requestAnimationFrame(function() {
        centrerVueSurContenu();
        mettreAJourTousLesBadges();
    });
}

// =========== CARROUSEL SÉQUENCES ===========

var sequenceActiveId = null; // null = vue globale (tout visible)

function obtenirSequencesCarte() {
    var sequences = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
    }
    sequences.sort(function(a, b) { return a.y - b.y; });
    return sequences;
}

function mettreAJourCarrousel() {
    var conteneur = document.getElementById('planif-toolbar-sequences');
    var navZone = document.getElementById('planif-nav-seq');
    if (!conteneur) return;

    // Bouton Vue globale : sorti du carrousel (4 août 2026, exercice 601-101),
    // il vit dans la zone droite de la barre (#planif-btn-vue-globale, index.html).
    var btnVueGlobale = document.getElementById('planif-btn-vue-globale');

    var sequences = obtenirSequencesCarte();
    if (sequences.length === 0) {
        conteneur.innerHTML = '';
        if (navZone) navZone.style.display = 'none';
        if (btnVueGlobale) btnVueGlobale.style.display = 'none';
        return;
    }

    if (navZone) navZone.style.display = '';
    if (btnVueGlobale) {
        btnVueGlobale.style.display = '';
        btnVueGlobale.classList.toggle('actif', !sequenceActiveId);
    }

    var html = '';
    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var nbLecons = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); }).length;
        var estActif = seq.id === sequenceActiveId;
        html += '<div class="planif-seq-badge' + (estActif ? ' actif' : '') + '"' +
                ' data-action="planificationCarte.ouvrirSequence"' +
                ' data-param="' + seq.id + '"' +
                ' title="' + echapperHtml(seq.titre || 'Sans titre') + '">' +
                '<span class="planif-seq-badge-nom">' + echapperHtml(seq.titre || 'Sans titre') + '</span>' +
                '<span class="planif-seq-badge-pill">' + nbLecons + '</span>' +
                '</div>';
    }
    conteneur.innerHTML = html;

    mettreAJourCompteurSequences();
    mettreAJourCarrouselLecons();

    requestAnimationFrame(function() {
        var badgeActif = conteneur.querySelector('.planif-seq-badge.actif');
        if (badgeActif) badgeActif.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
}

function mettreAJourCompteurSequences() {
    var sequences = obtenirSequencesCarte();
    var index = sequenceActiveId ? sequences.findIndex(function(s) { return s.id === sequenceActiveId; }) : -1;

    var texte = index >= 0 ? (index + 1) + ' / ' + sequences.length : '-- / ' + (sequences.length || '--');

    var compteur = document.getElementById('planif-compteur-seq');
    if (compteur) compteur.textContent = texte;

    var btnPrec = document.getElementById('planif-btn-seq-prec');
    if (btnPrec) btnPrec.disabled = (index <= 0);

    var btnSuiv = document.getElementById('planif-btn-seq-suiv');
    if (btnSuiv) btnSuiv.disabled = (index < 0 || index >= sequences.length - 1);
}

function centrerVueSurSequence(seqId) {
    var seq = etat.noeuds.get(seqId);
    if (!seq || !zoneTravail) return;

    // Calculer le bounding box de la séquence et ses enfants
    var minX = seq.x, maxX = seq.x, minY = seq.y, maxY = seq.y;
    var el = document.getElementById(seq.id);
    if (el) {
        maxX = seq.x + (el.offsetWidth || 200);
        maxY = seq.y + (el.offsetHeight || 100);
    }
    var enfants = (seq.enfants || []);
    for (var i = 0; i < enfants.length; i++) {
        var enfant = etat.noeuds.get(enfants[i]);
        if (!enfant) continue;
        var eel = document.getElementById(enfants[i]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        if (enfant.x < minX) minX = enfant.x;
        if (enfant.x + w > maxX) maxX = enfant.x + w;
        if (enfant.y < minY) minY = enfant.y;
        if (enfant.y + h > maxY) maxY = enfant.y + h;
    }

    var cx = ((minX + maxX) / 2 + OFFSET_X) * etat.zoom;
    var cy = ((minY + maxY) / 2 + OFFSET_Y) * etat.zoom;
    zoneTravail.scrollTo({
        left: cx - zoneTravail.clientWidth / 2,
        top: cy - zoneTravail.clientHeight / 2,
        behavior: 'smooth'
    });
}

function ouvrirSequence(seqId) {
    var ancienId = sequenceActiveId;
    sequenceActiveId = seqId || null; // "" ou null = vue globale
    leconActiveId = null;
    // Restaurer le canevas si on revient du niveau micro
    var vueLecon = document.getElementById('planif-vue-lecon');
    if (vueLecon) vueLecon.style.display = 'none';
    if (zoneTravail) zoneTravail.style.display = '';
    if (sequenceActiveId === ancienId) return;
    reconstruireDOM();
    requestAnimationFrame(function() {
        if (sequenceActiveId) {
            centrerVueSurSequence(sequenceActiveId);
        } else {
            centrerVueSurContenu();
        }
    });
}

function sequencePrecedente() {
    var sequences = obtenirSequencesCarte();
    var index = sequenceActiveId ? sequences.findIndex(function(s) { return s.id === sequenceActiveId; }) : -1;
    if (index > 0) ouvrirSequence(sequences[index - 1].id);
}

function sequenceSuivante() {
    var sequences = obtenirSequencesCarte();
    var index = sequenceActiveId ? sequences.findIndex(function(s) { return s.id === sequenceActiveId; }) : -1;
    if (index >= 0 && index < sequences.length - 1) ouvrirSequence(sequences[index + 1].id);
}

// =========== SOUS-CARROUSEL LEÇONS ===========

var leconActiveId = null; // null = vue séquence (méso), ID = vue leçon (micro)

function obtenirLeconsDeLaSequence() {
    if (!sequenceActiveId) return [];
    var seq = etat.noeuds.get(sequenceActiveId);
    if (!seq || !seq.enfants) return [];
    var lecons = [];
    for (var i = 0; i < seq.enfants.length; i++) {
        var nd = etat.noeuds.get(seq.enfants[i]);
        if (nd && nd.type === 'lecon') lecons.push(nd);
    }
    return lecons;
}

function mettreAJourCarrouselLecons() {
    var conteneur = document.getElementById('planif-toolbar-lecons');
    var navZone = document.getElementById('planif-nav-lecon');
    var sep = document.getElementById('planif-sep-lecons');
    if (!conteneur) return;

    var lecons = obtenirLeconsDeLaSequence();
    if (lecons.length === 0) {
        conteneur.innerHTML = '';
        if (navZone) navZone.style.display = 'none';
        if (sep) sep.style.display = 'none';
        return;
    }

    if (navZone) navZone.style.display = '';
    if (sep) sep.style.display = '';

    var html = '';
    for (var i = 0; i < lecons.length; i++) {
        var lec = lecons[i];
        var estActif = lec.id === leconActiveId;
        var duree = lec.metadata && lec.metadata.duree ? lec.metadata.duree + '\u2009min' : '';
        html += '<div class="planif-seq-badge planif-lecon-badge' + (estActif ? ' actif' : '') + '"' +
                ' data-action="planificationCarte.ouvrirLecon"' +
                ' data-param="' + lec.id + '"' +
                ' title="' + echapperHtml(lec.titre || 'Sans titre') + '">' +
                '<span class="planif-seq-badge-nom">' + echapperHtml(lec.titre || 'Sans titre') + '</span>' +
                (duree ? '<span class="planif-seq-badge-pill planif-lecon-pill">' + duree + '</span>' : '') +
                '</div>';
    }
    conteneur.innerHTML = html;

    mettreAJourCompteurLecons();

    requestAnimationFrame(function() {
        var badgeActif = conteneur.querySelector('.planif-lecon-badge.actif');
        if (badgeActif) badgeActif.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
}

function mettreAJourCompteurLecons() {
    var lecons = obtenirLeconsDeLaSequence();
    var index = leconActiveId ? lecons.findIndex(function(l) { return l.id === leconActiveId; }) : -1;

    var texte = index >= 0 ? (index + 1) + ' / ' + lecons.length : '-- / ' + (lecons.length || '--');

    var compteur = document.getElementById('planif-compteur-lecon');
    if (compteur) compteur.textContent = texte;

    var btnPrec = document.getElementById('planif-btn-lecon-prec');
    if (btnPrec) btnPrec.disabled = (index <= 0);

    var btnSuiv = document.getElementById('planif-btn-lecon-suiv');
    if (btnSuiv) btnSuiv.disabled = (index < 0 || index >= lecons.length - 1);
}

function ouvrirLecon(leconId) {
    leconActiveId = leconId || null;
    mettreAJourCarrouselLecons();

    var vueLecon = document.getElementById('planif-vue-lecon');
    if (leconActiveId) {
        // Niveau 3 : masquer le canevas, afficher la vue leçon
        if (zoneTravail) zoneTravail.style.display = 'none';
        if (vueLecon) { vueLecon.style.display = ''; rendreVueLecon(leconActiveId); }
    } else {
        // Retour au niveau 2 : masquer la vue leçon, restaurer le canevas
        if (vueLecon) vueLecon.style.display = 'none';
        if (zoneTravail) zoneTravail.style.display = '';
    }
}

function rendreVueLecon(leconId) {
    var vueLecon = document.getElementById('planif-vue-lecon');
    if (!vueLecon) return;

    var lec = etat.noeuds.get(leconId);
    if (!lec) { vueLecon.innerHTML = ''; return; }

    // Données de séances (objectif, notes, durée)
    var seances = {};
    try { seances = db.getSync(window.cle(CLE_SEANCES), {}); } catch(e) {}
    var donnees = seances[leconId] || {};
    var duree = lec.metadata && lec.metadata.duree ? lec.metadata.duree : '';

    // Séquence parente
    var seqParent = sequenceActiveId ? etat.noeuds.get(sequenceActiveId) : null;
    var seqTitre = seqParent ? echapperHtml(seqParent.titre || '') : '';

    // Activités enfants
    var activites = (lec.enfants || []).map(function(eid) { return etat.noeuds.get(eid); }).filter(Boolean);

    // Construire le HTML
    var html = '<div class="planif-vue-lecon-inner">';

    // En-tête
    html += '<div class="planif-vue-lecon-header">';
    html += '<div class="planif-vue-lecon-breadcrumb">';
    if (seqTitre) html += '<span class="planif-vue-lecon-seq">' + seqTitre + '</span> <span class="planif-vue-lecon-sep">\u203A</span> ';
    html += '<span class="planif-vue-lecon-titre-label">' + echapperHtml(lec.titre || 'Sans titre') + '</span>';
    html += '</div>';
    if (duree) html += '<span class="planif-vue-lecon-duree">' + duree + '\u2009min</span>';
    html += '</div>';

    // Objectif
    html += '<div class="planif-vue-lecon-section">';
    html += '<h4>Objectif</h4>';
    html += '<div class="planif-vue-lecon-objectif" contenteditable="true" data-lecon-id="' + leconId + '" data-champ="objectifPersonnalise">' +
            echapperHtml(donnees.objectifPersonnalise || '') + '</div>';
    html += '</div>';

    // Activités
    if (activites.length > 0) {
        html += '<div class="planif-vue-lecon-section">';
        html += '<h4>Activit\u00e9s <span class="planif-vue-lecon-count">' + activites.length + '</span></h4>';
        html += '<div class="planif-vue-lecon-activites">';
        for (var i = 0; i < activites.length; i++) {
            var act = activites[i];
            var typeConfig = TYPES[act.type];
            var couleur = typeConfig ? typeConfig.couleur : 'var(--texte-secondaire)';
            var label = typeConfig ? typeConfig.label : act.type;
            var actDuree = act.metadata && act.metadata.duree ? act.metadata.duree + '\u2009min' : '';
            html += '<div class="planif-vue-lecon-activite">';
            html += '<span class="planif-vue-lecon-act-type" style="color:' + couleur + '">' + label + '</span>';
            html += '<span class="planif-vue-lecon-act-titre">' + echapperHtml(act.titre || '') + '</span>';
            if (actDuree) html += '<span class="planif-vue-lecon-act-duree">' + actDuree + '</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
    }

    // Notes
    html += '<div class="planif-vue-lecon-section">';
    html += '<h4>Notes</h4>';
    html += '<div class="planif-vue-lecon-notes" contenteditable="true" data-lecon-id="' + leconId + '" data-champ="notes">' +
            echapperHtml(donnees.notes || '') + '</div>';
    html += '</div>';

    html += '</div>';
    vueLecon.innerHTML = html;

    // Brancher la sauvegarde sur les champs éditables
    vueLecon.querySelectorAll('[contenteditable]').forEach(function(el) {
        el.addEventListener('blur', function() {
            var lid = el.dataset.leconId;
            var champ = el.dataset.champ;
            if (!lid || !champ) return;
            var s = {};
            try { s = db.getSync(window.cle(CLE_SEANCES), {}); } catch(e2) {}
            if (!s[lid]) s[lid] = {};
            s[lid][champ] = el.textContent.trim();
            try { db.setSync(window.cle(CLE_SEANCES), s); } catch(e3) {}
        });
    });
}

function leconPrecedente() {
    var lecons = obtenirLeconsDeLaSequence();
    var index = leconActiveId ? lecons.findIndex(function(l) { return l.id === leconActiveId; }) : -1;
    if (index > 0) ouvrirLecon(lecons[index - 1].id);
}

function leconSuivante() {
    var lecons = obtenirLeconsDeLaSequence();
    var index = leconActiveId ? lecons.findIndex(function(l) { return l.id === leconActiveId; }) : -1;
    if (index >= 0 && index < lecons.length - 1) ouvrirLecon(lecons[index + 1].id);
}

// =========== FIN CARROUSEL ===========

window.planificationCarte = {
    initialiser: initialiser,
    activer: function() { planificationActive = true; },
    desactiver: function() { planificationActive = false; },
    centrerVueSurContenu: centrerVueSurContenu,
    mettreAJourListeCartes: mettreAJourListeCartes,
    chargerCarte: chargerCarte,
    changerCarte: changerCarte,
    etat: etat,
    getLiensDeNoeud: getLiensDeNoeud,
    obtenirLabelNoeud: obtenirLabelNoeud,
    obtenirCouleurNoeud: obtenirCouleurNoeud,
    TYPES: TYPES,
    TYPES_LIENS: TYPES_LIENS,
    genererSeancesHTML: genererSeancesHTML,
    trouverIdeesMaitressesAncetres: trouverIdeesMaitressesAncetres,
    chargerProductions: chargerProductions,
    afficherDetailsProduction: afficherDetailsProduction,
    naviguerVers: naviguerVers,
    CLE_SEANCES: CLE_SEANCES,
    zoomPleineLargeur: zoomPleineLargeur,
    zoomPleineHauteur: zoomPleineHauteur,
    injecterNoeuds: injecterNoeuds,
    nouvelleCarte: nouvelleCarte,
    ouvrirGuide: ouvrirGuide,
    // Carrousel séquences
    ouvrirSequence: ouvrirSequence,
    sequencePrecedente: sequencePrecedente,
    sequenceSuivante: sequenceSuivante,
    mettreAJourCarrousel: mettreAJourCarrousel,
    // Sous-carrousel leçons
    ouvrirLecon: ouvrirLecon,
    leconPrecedente: leconPrecedente,
    leconSuivante: leconSuivante,
    // Plein écran
    togglePleinEcran: togglePleinEcranCarte
};

// === COULEUR DE FOND CANEVAS ===
(function() {
    var btnFond = document.getElementById('planif-btn-fond');
    var dropdown = document.getElementById('planif-fond-dropdown');
    if (!btnFond || !dropdown) return;

    btnFond.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('visible');
    });

    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        var swatch = e.target.closest('[data-fond]');
        if (!swatch) return;
        var couleur = swatch.dataset.fond;
        var zone = document.getElementById('planif-zone-wrapper');
        if (zone) zone.style.background = couleur || '';
        db.setSync('planif-fond-canvas', couleur);
        dropdown.classList.remove('visible');
    });

    document.addEventListener('click', function() {
        dropdown.classList.remove('visible');
    });

    // Restaurer
    var fondSauve = db.getSync('planif-fond-canvas', null);
    if (fondSauve) {
        var zone = document.getElementById('planif-zone-wrapper');
        if (zone) zone.style.background = fondSauve;
    }
})();

var _planifPleinEcran = false;

function togglePleinEcranCarte() {
    var zone = document.getElementById('conception-carte');
    if (!zone) return;
    _planifPleinEcran = !_planifPleinEcran;
    zone.classList.toggle('planif-plein-ecran', _planifPleinEcran);
    document.body.classList.toggle('planif-plein-ecran-actif', _planifPleinEcran);
    var btn = document.getElementById('planif-btn-plein-ecran');
    if (btn) {
        btn.innerHTML = _planifPleinEcran ? '<img src="icons/icon-collapse.svg" alt="" class="planif-icon">' : '<img src="icons/icon-fit-to-width.svg" alt="" class="planif-icon">';
        btn.title = _planifPleinEcran ? 'Quitter le plein \u00e9cran' : 'Plein \u00e9cran';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _planifPleinEcran) {
        togglePleinEcranCarte();
    }
});

})();
