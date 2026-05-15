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
    else if (nomVue === 'import') rendreImport();
    else if (nomVue === 'rapport' && etat.resultats) rendreRapport();
}


function formaterQuestionnaireEnTexte(q) {
    var lignes = [];
    lignes.push('=== BILAN RÉFLEXIF — ' + q.titre + ' ===');
    lignes.push('');

    if (q.preambule && String(q.preambule).trim() !== '') {
        lignes.push('PRÉAMBULE :');
        lignes.push(String(q.preambule).trim());
        lignes.push('');
    }

    var num = 1;

    function lettrePour(opt, idx) {
        if (opt && opt.lettre) return String(opt.lettre).toLowerCase();
        return String.fromCharCode(97 + idx);
    }

    function texteOption(opt) {
        var t = (opt && opt.texte) ? String(opt.texte) : '';
        if (opt && opt.autreAvecChamp && !/_{3,}/.test(t)) {
            var base = t.replace(/\s*:\s*$/, '').trim();
            return base + ' : ___';
        }
        return t;
    }

    function ajouterQuestion(question) {
        var balise = null;

        switch (question.type) {
            case 'choix_unique':
                balise = '[RADIO]';
                break;
            case 'choix_multiple':
                var parts = [];
                if (question.minSelection != null && question.minSelection !== '') parts.push('min=' + question.minSelection);
                if (question.maxSelection != null && question.maxSelection !== '') parts.push('max=' + question.maxSelection);
                balise = '[CHECKBOX' + (parts.length ? ' ' + parts.join(' ') : '') + ']';
                break;
            case 'matrix':
                balise = '[MATRIX]';
                break;
            case 'ouvert':
                balise = '[OUVERT]';
                break;
            // likert4 : pas de balise, identifié par les choix a-d
        }

        if (balise) lignes.push(balise);

        if (question.consigneConditionnelle && String(question.consigneConditionnelle).trim() !== '') {
            lignes.push('*' + String(question.consigneConditionnelle).trim() + '*');
        }

        lignes.push(num + '. ' + question.texte);

        switch (question.type) {
            case 'likert4':
                lignes.push('a. Tout à fait d’accord');
                lignes.push('b. Plutôt d’accord');
                lignes.push('c. Plutôt en désaccord');
                lignes.push('d. Pas du tout d’accord');
                if (question.inclureNA) {
                    lignes.push('e. Non applicable');
                }
                break;
            case 'choix_unique':
            case 'choix_multiple':
                if (question.options) {
                    for (var o = 0; o < question.options.length; o++) {
                        var opt = question.options[o];
                        lignes.push(lettrePour(opt, o) + '. ' + texteOption(opt));
                    }
                }
                break;
            case 'matrix':
                if (question.enonces) {
                    for (var e = 0; e < question.enonces.length; e++) {
                        lignes.push('- ' + question.enonces[e].texte);
                    }
                }
                break;
            // ouvert : pas de choix
        }

        lignes.push('');
        num++;
    }

    for (var i = 0; i < q.blocs.length; i++) {
        var bloc = q.blocs[i];
        if (!bloc.actif) continue;

        lignes.push('SECTION : ' + bloc.titre);
        if (bloc.description && String(bloc.description).trim() !== '') {
            lignes.push('DESCRIPTION : ' + String(bloc.description).trim());
        }
        lignes.push('');
        for (var j = 0; j < bloc.questions.length; j++) {
            ajouterQuestion(bloc.questions[j]);
        }
    }

    if (q.questionsPersonnalisees && q.questionsPersonnalisees.length > 0) {
        lignes.push('SECTION : Questions supplémentaires');
        lignes.push('');
        for (var k = 0; k < q.questionsPersonnalisees.length; k++) {
            ajouterQuestion(q.questionsPersonnalisees[k]);
        }
    }

    while (lignes.length > 0 && lignes[lignes.length - 1] === '') {
        lignes.pop();
    }

    return lignes.join('\n');
}

function exporterTexte() {
    var q = etat.questionnaire;
    if (!q) return;

    var texte = formaterQuestionnaireEnTexte(q);
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

/* ===============================
   SECTION 3a-bis : IMPORT D'UN QUESTIONNAIRE TEXTE
   =============================== */

// Parse un texte au format export et reconstruit { titre, blocs, questionsPersonnalisees }.
// Retourne { ok: true, questionnaire } ou { ok: false, erreurs: [{ ligne, message }] }.
function parserQuestionnaireTexte(texte) {
    if (typeof texte !== 'string' || texte.trim() === '') {
        return { ok: false, erreurs: [{ ligne: 0, message: 'Le texte est vide.' }] };
    }

    var lignes = texte.replace(/\r\n/g, '\n').split('\n');
    var erreurs = [];

    var titre = 'Bilan importé';
    var preambule = null;
    var blocs = [];
    var questionsPersonnalisees = [];
    var blocCourant = null;
    var modePerso = false;
    var questionCourante = null;
    var preambuleLignes = null;
    var consigneEnAttente = null;
    var typeEnAttente = null;
    var paramsEnAttente = null;

    var rxTitre = /^===\s*BILAN RÉFLEXIF\s*—?\s*(.*?)\s*===$/i;
    var rxSection = /^SECTION\s*:\s*(.+)$/i;
    var rxDescription = /^DESCRIPTION\s*:\s*(.+)$/i;
    var rxPreambule = /^PRÉAMBULE\s*:\s*(.*)$/i;
    var rxQuestion = /^\d+\s*[.)]\s*(.+)$/;
    var rxChoix = /^([a-zA-Z])\s*[.)]\s*(.+)$/;
    var rxBalise = /^\[(RADIO|CHECKBOX|MATRIX|OUVERT|LIKERT)(?:\s+([^\]]*))?\]$/i;
    var rxConsigne = /^\*([^*].*?)\*$/;
    var rxEnonceMatrice = /^[-•]\s+(.+)$/;
    var rxAutreChamp = /^(.*?)\s*:\s*_{3,}\s*$/;
    var rxCommentaire = /^\s*#/;
    var rxSeparateur = /^[-=*_]{3,}\s*$/;
    var rxPucePrefixe = /^[-*•]\s+/;
    var rxCaseCochable = /^(?:[☐☑☒✓✔□■]|\[[\sxX]?\])/;

    function ouvrirBlocSansTitre() {
        blocCourant = { titre: 'Sans titre', description: null, questions: [] };
        blocs.push(blocCourant);
    }

    function pousserQuestion(q) {
        if (modePerso) {
            questionsPersonnalisees.push(q);
        } else {
            if (!blocCourant) ouvrirBlocSansTitre();
            blocCourant.questions.push(q);
        }
    }

    function fermerPreambule() {
        if (preambuleLignes !== null) {
            preambule = preambuleLignes.join('\n').replace(/^\s+|\s+$/g, '');
            if (preambule === '') preambule = null;
            preambuleLignes = null;
        }
    }

    function fermerQuestion() {
        questionCourante = null;
    }

    for (var i = 0; i < lignes.length; i++) {
        var ligneOriginale = lignes[i];
        var ligneTrim = ligneOriginale.trim();
        var noLigne = i + 1;

        // En mode préambule : tout est préambule sauf délimiteurs forts
        if (preambuleLignes !== null) {
            if (rxSection.test(ligneTrim) || rxQuestion.test(ligneTrim) || rxBalise.test(ligneTrim) || rxTitre.test(ligneTrim)) {
                fermerPreambule();
                // continuer le traitement de cette ligne
            } else {
                preambuleLignes.push(ligneOriginale);
                continue;
            }
        }

        if (ligneTrim === '') {
            fermerQuestion();
            continue;
        }

        if (rxCommentaire.test(ligneTrim)) {
            fermerQuestion();
            continue;
        }

        // Tolérance Markdown : strip ** seulement (pas __ qui mangerait les ___ des champs Autre)
        ligneTrim = ligneTrim.replace(/\*\*/g, '').trim();
        if (ligneTrim === '') { fermerQuestion(); continue; }

        if (rxSeparateur.test(ligneTrim)) {
            fermerQuestion();
            continue;
        }

        // En mode matrice : énoncé en puce -
        if (questionCourante && questionCourante.type === 'matrix') {
            var mEn = ligneTrim.match(rxEnonceMatrice);
            if (mEn) {
                if (!questionCourante.enonces) questionCourante.enonces = [];
                questionCourante.enonces.push({
                    id: 'imp_e_' + genId(),
                    texte: mEn[1].trim()
                });
                continue;
            }
            // Sinon, on poursuit le traitement normal (la question matrix se ferme implicitement)
        }

        // Hors mode matrice : strip puce de liste pour les choix Likert
        var ligneSansPuce = ligneTrim.replace(rxPucePrefixe, '').trim();
        if (ligneSansPuce !== '') ligneTrim = ligneSansPuce;

        if (rxCaseCochable.test(ligneTrim)) {
            erreurs.push({ ligne: noLigne, message: 'Case à cocher ignorée — utilise [CHECKBOX] avec des options personnalisées.' });
            continue;
        }

        var mTitre = ligneTrim.match(rxTitre);
        if (mTitre) {
            if (mTitre[1] && mTitre[1].trim() !== '') titre = mTitre[1].trim();
            fermerQuestion();
            continue;
        }

        var mPreambule = ligneTrim.match(rxPreambule);
        if (mPreambule) {
            preambuleLignes = [];
            if (mPreambule[1] && mPreambule[1].trim() !== '') {
                preambuleLignes.push(mPreambule[1]);
            }
            fermerQuestion();
            continue;
        }

        var mSection = ligneTrim.match(rxSection);
        if (mSection) {
            fermerQuestion();
            var titreSection = mSection[1].trim();
            if (/questions?\s+suppl[ée]mentaires/i.test(titreSection)
                || /questions?\s+personnalis[ée]es/i.test(titreSection)) {
                modePerso = true;
                blocCourant = null;
            } else {
                modePerso = false;
                blocCourant = { titre: titreSection, description: null, questions: [] };
                blocs.push(blocCourant);
            }
            continue;
        }

        var mDescription = ligneTrim.match(rxDescription);
        if (mDescription) {
            if (blocCourant) {
                blocCourant.description = mDescription[1].trim();
            } else {
                erreurs.push({ ligne: noLigne, message: 'DESCRIPTION : sans SECTION : précédente.' });
            }
            continue;
        }

        var mBalise = ligneTrim.match(rxBalise);
        if (mBalise) {
            typeEnAttente = mBalise[1].toUpperCase();
            paramsEnAttente = mBalise[2] || '';
            fermerQuestion();
            continue;
        }

        var mConsigne = ligneTrim.match(rxConsigne);
        if (mConsigne && !rxQuestion.test(ligneTrim) && !rxChoix.test(ligneTrim)) {
            consigneEnAttente = mConsigne[1].trim();
            continue;
        }

        var mChoix = ligneTrim.match(rxChoix);
        if (mChoix && questionCourante) {
            var lettre = mChoix[1].toLowerCase();
            var texteChoix = mChoix[2].trim();

            if (questionCourante.type === 'ouvert') {
                questionCourante.type = 'likert4';
                questionCourante.inclureNA = false;
            }

            if (questionCourante.type === 'likert4') {
                if (lettre === 'e') {
                    questionCourante.inclureNA = true;
                }
                continue;
            }

            if (questionCourante.type === 'choix_unique' || questionCourante.type === 'choix_multiple') {
                var autreAvecChamp = false;
                var texteFinal = texteChoix;
                var mAutre = texteChoix.match(rxAutreChamp);
                if (mAutre) {
                    texteFinal = mAutre[1].trim() + ' : ___';
                    autreAvecChamp = true;
                }
                if (!questionCourante.options) questionCourante.options = [];
                questionCourante.options.push({
                    id: 'imp_o_' + genId(),
                    lettre: lettre,
                    texte: texteFinal,
                    autreAvecChamp: autreAvecChamp
                });
                continue;
            }
            continue;
        }

        var mQ = ligneTrim.match(rxQuestion);
        if (mQ) {
            var typeQ = 'ouvert';
            var minSel = null, maxSel = null;

            if (typeEnAttente) {
                if (typeEnAttente === 'RADIO') typeQ = 'choix_unique';
                else if (typeEnAttente === 'CHECKBOX') {
                    typeQ = 'choix_multiple';
                    if (paramsEnAttente) {
                        var mMax = paramsEnAttente.match(/max\s*=\s*(\d+)/i);
                        var mMin = paramsEnAttente.match(/min\s*=\s*(\d+)/i);
                        if (mMax) maxSel = parseInt(mMax[1], 10);
                        if (mMin) minSel = parseInt(mMin[1], 10);
                    }
                }
                else if (typeEnAttente === 'MATRIX') typeQ = 'matrix';
                else if (typeEnAttente === 'OUVERT') typeQ = 'ouvert';
                else if (typeEnAttente === 'LIKERT') typeQ = 'likert4';
                typeEnAttente = null;
                paramsEnAttente = null;
            }

            questionCourante = {
                id: 'imp_q_' + genId(),
                texte: mQ[1].trim(),
                type: typeQ,
                obligatoire: false,
                personnalisee: modePerso
            };

            if (typeQ === 'likert4') {
                questionCourante.inclureNA = false;
            }
            if (typeQ === 'choix_unique' || typeQ === 'choix_multiple') {
                questionCourante.options = [];
            }
            if (typeQ === 'choix_multiple') {
                questionCourante.minSelection = minSel;
                questionCourante.maxSelection = maxSel;
            }
            if (typeQ === 'matrix') {
                questionCourante.enonces = [];
            }
            if (consigneEnAttente) {
                questionCourante.consigneConditionnelle = consigneEnAttente;
                consigneEnAttente = null;
            }

            pousserQuestion(questionCourante);
            continue;
        }

        erreurs.push({ ligne: noLigne, message: 'Ligne ignorée (format non reconnu) : « ' + ligneTrim.substring(0, 60) + ' »' });
    }

    fermerPreambule();

    var nbQuestions = questionsPersonnalisees.length;
    for (var b = 0; b < blocs.length; b++) nbQuestions += blocs[b].questions.length;

    if (nbQuestions === 0) {
        erreurs.unshift({ ligne: 0, message: 'Aucune question détectée dans le texte.' });
        return { ok: false, erreurs: erreurs };
    }

    for (var n = 0; n < blocs.length; n++) {
        blocs[n].id = 'imp_b_' + genId();
        blocs[n].actif = true;
    }

    return {
        ok: true,
        questionnaire: {
            titre: titre,
            preambule: preambule,
            blocs: blocs,
            questionsPersonnalisees: questionsPersonnalisees
        },
        avertissements: erreurs
    };
}

// G\u00e9n\u00e8re le texte du mod\u00e8le d\u00e9mo, pr\u00e9fix\u00e9 d'une en-t\u00eate comment\u00e9e expliquant le format.
function genererModeleTexte() {
    var entete = [
        '# MODÈLE — Questionnaire de Bilan réflexif',
        '#',
        '# Règles du format (les lignes commençant par # sont ignorées à l’import) :',
        '#',
        '#   === BILAN RÉFLEXIF — <titre> ===     ← première ligne du fichier',
        '#   PRÉAMBULE :                          ← bloc d’intro multi-paragraphe optionnel',
        '#   <texte du préambule>',
        '#',
        '#   SECTION : <titre du bloc>            ← regroupe des questions',
        '#   DESCRIPTION : <texte court>          ← optionnel, sur 1 ligne',
        '#',
        '#   <BALISE>                              ← optionnelle pour Likert ; obligatoire pour les autres types',
        '#   *<consigne en italique>*             ← optionnelle, sur sa propre ligne',
        '#   <num>. <texte de la question>',
        '#   <choix ou énoncés selon le type>',
        '#',
        '# Cinq types de questions disponibles :',
        '#   - Likert 4 (sans balise)             : a-d standards. Ajouter "e. Non applicable" pour la 5e branche.',
        '#   - [RADIO]   choix unique             : 2 à 8 options personnalisées.',
        '#   - [CHECKBOX] choix multiples         : options personnalisées. Limites optionnelles : [CHECKBOX max=3] ou [CHECKBOX min=1 max=5].',
        '#   - [MATRIX]  groupe Likert 4 partagé  : énoncés listés en puces "- ...".',
        '#   - [OUVERT]  texte libre              : pas de choix sous la question.',
        '#',
        '# Conventions :',
        '#   - L’option "Autre : ___" (3+ underscores) marque un champ libre supplémentaire.',
        '#   - Une question dont le numéro est précédé d’une ligne *italique* a une consigne conditionnelle.',
        '#   - L’import remplace entièrement le questionnaire actuel.',
        '#',
        ''
    ].join('\n');

    var modele = [
        '=== BILAN RÉFLEXIF — Modèle ===',
        '',
        'PRÉAMBULE :',
        'Ce questionnaire est anonyme. Réponds en pensant à ton expérience réelle.',
        '',
        'SECTION : Profil',
        '',
        '[RADIO]',
        '1. Quel est ton parcours avant ce cours ?',
        'a. Première fois que je suis ce cours',
        'b. Reprise après un trimestre antérieur',
        'c. Autre : ___',
        '',
        'SECTION : Évaluation',
        'DESCRIPTION : Tes réponses servent à ajuster les pratiques pour la prochaine cohorte.',
        '',
        '[MATRIX]',
        '2. Système d’évaluation',
        '- L’échelle IDME me permet de me situer dans mon apprentissage.',
        '- Les critères sont clairs et compréhensibles.',
        '- Je comprends comment ma note finale est construite.',
        '',
        '3. Le système de jetons est utile.',
        'a. Tout à fait d’accord',
        'b. Plutôt d’accord',
        'c. Plutôt en désaccord',
        'd. Pas du tout d’accord',
        'e. Non applicable',
        '',
        '[CHECKBOX max=3]',
        '4. Identifie les concepts les plus utiles (maximum 3) :',
        'a. Concept A',
        'b. Concept B',
        'c. Concept C',
        'd. Concept D',
        '',
        '[OUVERT]',
        '*Si tu as répondu Plutôt en désaccord ou Pas du tout d’accord :*',
        '5. Peux-tu expliquer ?',
        '',
        '[OUVERT]',
        '6. Un dernier commentaire ?',
        ''
    ].join('\n');

    return entete + modele;
}

function telechargerModele() {
    try {
        var contenu = genererModeleTexte();
        var blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'modele-bilan-reflexif.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        afficherToast('Mod\u00e8le t\u00e9l\u00e9charg\u00e9');
    } catch (err) {
        console.error('[BilanReflexif] Erreur t\u00e9l\u00e9chargement mod\u00e8le:', err);
        alert('Impossible de t\u00e9l\u00e9charger le mod\u00e8le.');
    }
}

var PROMPT_IA_BILAN = `Tu m’aides à créer un questionnaire de bilan réflexif de fin de trimestre, à importer dans Labo Codex puis à recréer dans une application de formulaire en ligne. Produis UNIQUEMENT du texte respectant le format suivant, sans aucune autre prose autour.

== FORMAT ==

Première ligne (titre) :
=== BILAN RÉFLEXIF — <titre> ===

Préambule optionnel (multi-paragraphes) :
PRÉAMBULE :
<texte du préambule>

Pour chaque bloc thématique :
SECTION : <titre du bloc>
DESCRIPTION : <description optionnelle, 1 ligne>

Cinq types de questions disponibles :

(A) Question Likert 4 (échelle d’accord) — pas de balise, identifiée par les 4 choix a-d :
1. <texte>
a. Tout à fait d’accord
b. Plutôt d’accord
c. Plutôt en désaccord
d. Pas du tout d’accord

Pour ajouter une 5e branche « Non applicable », ajouter :
e. Non applicable

(B) Choix unique non-Likert — préfixé par [RADIO] :
[RADIO]
2. <texte>
a. <option 1>
b. <option 2>
c. <option 3>
d. <option 4>

(C) Choix multiples — préfixé par [CHECKBOX], limites optionnelles :
[CHECKBOX max=3]
3. <texte>
a. <option 1>
b. <option 2>
c. <option 3>
d. <option 4>

[CHECKBOX]
4. <texte>
a. <option 1>
b. <option 2>
c. Autre : ___

(D) Matrice Likert 4 — préfixé par [MATRIX], chaque énoncé en puce - :
[MATRIX]
5. <titre du groupe>
- <énoncé 1>
- <énoncé 2>
- <énoncé 3>

(E) Question ouverte — préfixé par [OUVERT] :
[OUVERT]
6. <texte>

Pour une consigne conditionnelle (« si tu as répondu X »), placer une ligne *en italique* AU-DESSUS de la question :
[OUVERT]
*Si tu as répondu Oui à la question précédente :*
7. <texte>

Les questions sont séparées par une ligne vide.

== CONTRAINTES STRICTES ==

- Privilégier le bon type pour la donnée recherchée :
  * Likert 4 pour mesurer un accord/désaccord sur un énoncé.
  * Likert + e. Non applicable quand certains répondants peuvent ne pas être concernés.
  * RADIO pour une caractéristique mutuellement exclusive non ordinale (parcours, fréquence par paliers).
  * CHECKBOX pour des caractéristiques cumulables (usages, qualificatifs).
  * MATRIX quand 3+ énoncés partagent la même échelle Likert (économise du temps de passation).
  * OUVERT pour les justifications, conseils, surprises.
- AUCUN paragraphe d’introduction au milieu, AUCUN séparateur (---) entre les questions.
- Pas de Markdown : pas de **gras**, pas de # titres, pas de puces autres que celles du format.
- Une question = une seule ligne pour son énoncé. Une seule ligne par énoncé de matrice.
- Les libellés Likert sont toujours les 4 standards (Tout à fait / Plutôt / Plutôt en désaccord / Pas du tout). N’en invente pas d’autres.
- Tutoiement, registre étudiant·e collégial·e du Québec.

== TÂCHE ==

Produis un questionnaire de bilan réflexif. Voici le contexte :
- Cours / niveau : [À COMPLÉTER]
- Thèmes à sonder : [À COMPLÉTER]
- Nombre de blocs souhaités : [À COMPLÉTER, ex. 4-6]
- Nombre approximatif de questions : [À COMPLÉTER, ex. 15-25]

Une fois prêt, je copierai ton output et l’importerai dans Labo Codex via le bouton « Importer un questionnaire ».`;

function copierPromptIA() {
    try {
        navigator.clipboard.writeText(PROMPT_IA_BILAN).then(function() {
            afficherToast('Prompt copi\u00e9 dans le presse-papier');
        });
    } catch (err) {
        var ta = document.createElement('textarea');
        ta.value = PROMPT_IA_BILAN;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        afficherToast('Prompt copi\u00e9');
    }
}

function injecterModaleImport() {
    if (document.getElementById('modalBilanImportQuestionnaire')) return;

    var html = [
        '<div id="modalBilanImportQuestionnaire" class="modal-overlay" data-close-on-bg="BilanReflexif.fermerModaleImport">',
        '<div class="modal-contenu" style="max-width:760px;max-height:85vh;padding:16px;display:flex;flex-direction:column;">',
        '<button data-action="BilanReflexif.fermerModaleImport" class="modal-fermer" title="Fermer">',
        '<img src="icons/icon-close-window.svg" alt="" class="modal-close-icon">',
        '</button>',
        '<h2 class="modal-titre" style="margin-bottom:6px;">Importer un questionnaire</h2>',
        '<p style="color:var(--texte-secondaire);font-size:13px;margin:0 0 12px 0;">',
        'Colle ici un questionnaire au format texte (g\u00e9n\u00e9ralement produit par toi ou par une IA \u00e0 partir du mod\u00e8le). ',
        'L\u2019import <strong>remplace enti\u00e8rement</strong> le questionnaire actuel.',
        '</p>',
        '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">',
        '<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.telechargerModele">T\u00e9l\u00e9charger le mod\u00e8le</button>',
        '<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.copierPromptIA">Copier le prompt pour IA</button>',
        '<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.toggleAide" data-param="import-format">Format accept\u00e9</button>',
        '</div>',
        '<div id="bilan-import-aide-conteneur" style="margin-bottom:10px;"></div>',
        '<textarea id="bilan-import-textarea" placeholder="Colle ici le texte du questionnaire\u2026" ',
        'style="width:100%;flex:1;min-height:240px;padding:10px 12px;border:1px solid rgba(106,172,184,.2);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.45;resize:vertical;"></textarea>',
        '<div id="bilan-import-erreurs" style="margin-top:10px;font-size:13px;color:var(--rouge-erreur,#e84057);max-height:140px;overflow-y:auto;"></div>',
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;border-top:1px solid var(--bordure,rgba(106,172,184,.15));padding-top:10px;">',
        '<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.fermerModaleImport">Annuler</button>',
        '<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.appliquerImport">Importer</button>',
        '</div>',
        '</div>',
        '</div>'
    ].join('');

    var conteneur = document.createElement('div');
    conteneur.innerHTML = html;
    document.body.appendChild(conteneur.firstChild);

    var aide = document.getElementById('bilan-import-aide-conteneur');
    if (aide) {
        aide.innerHTML = rendreAideHTML('import-format',
            'Format accept\u00e9',
            '<p>Cinq types de questions sont supportés. Le format suit la même structure que <strong>Copier les questions</strong> :</p>' +
            '<pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;background:var(--bleu-tres-pale,#142428);padding:10px;border-radius:6px;color:var(--texte-principal,#d0e0e4);margin:8px 0;">' +
            '=== BILAN RÉFLEXIF — Mon titre ===\n\n' +
            'PRÉAMBULE :\n' +
            'Texte d’introduction multi-paragraphe.\n\n' +
            'SECTION : Mon bloc\n' +
            'DESCRIPTION : Description optionnelle du bloc.\n\n' +
            '1. Question Likert (sans balise)\n' +
            'a. Tout à fait d’accord\n' +
            'b. Plutôt d’accord\n' +
            'c. Plutôt en désaccord\n' +
            'd. Pas du tout d’accord\n' +
            'e. Non applicable           ← optionnel : 5e branche NA\n\n' +
            '[RADIO]\n' +
            '2. Choix unique\n' +
            'a. Option 1\n' +
            'b. Autre : ___\n\n' +
            '[CHECKBOX max=3]\n' +
            '3. Choix multiples avec limite\n' +
            'a. Option 1\n' +
            'b. Option 2\n\n' +
            '[MATRIX]\n' +
            '4. Groupe Likert partagé\n' +
            '- Énoncé 1\n' +
            '- Énoncé 2\n\n' +
            '[OUVERT]\n' +
            '*Si tu as répondu Oui :*\n' +
            '5. Question conditionnelle\n' +
            '</pre>' +
            '<ul>' +
            '<li><strong>Likert (1 énoncé)</strong> : pas de balise, identifié par les 4 choix <code>a-d</code>. Ajouter <code>e. Non applicable</code> pour la 5e branche.</li>' +
            '<li><strong>[RADIO]</strong> : choix unique non-Likert (parcours, fréquence par paliers).</li>' +
            '<li><strong>[CHECKBOX]</strong> : choix multiples. Limites optionnelles : <code>[CHECKBOX max=3]</code>, <code>[CHECKBOX min=1 max=5]</code>.</li>' +
            '<li><strong>[MATRIX]</strong> (= Likert matriciel) : groupe Likert 4 partagé. Énoncés en puces <code>-</code>. Équivalent du « Likert » multi-énoncés de certaines applications de formulaire.</li>' +
            '<li><strong>[OUVERT]</strong> : texte libre.</li>' +
            '<li>Option <code>Autre : ___</code> (3 underscores ou plus) pour un champ libre supplémentaire.</li>' +
            '<li>Consigne conditionnelle : ligne en <em>*italique*</em> sur sa propre ligne, AU-DESSUS du numéro de question.</li>' +
            '<li>Le bloc <code>SECTION : Questions supplémentaires</code> est rangé dans les questions personnalisées.</li>' +
            '<li>Lignes vides séparent les questions ; lignes commençant par <code>#</code> ignorées ; séparateurs <code>---</code> ignorés.</li>' +
            '<li><strong>Tolérance Markdown</strong> : <code>**gras**</code> et puces <code>- </code> devant les choix Likert sont nettoyés automatiquement.</li>' +
            '</ul>'
        );
    }
}

function ouvrirModaleImport() {
    injecterModaleImport();
    var modale = document.getElementById('modalBilanImportQuestionnaire');
    if (!modale) return;
    var textarea = document.getElementById('bilan-import-textarea');
    var erreurs = document.getElementById('bilan-import-erreurs');
    if (textarea) textarea.value = '';
    if (erreurs) erreurs.textContent = '';
    modale.classList.add('actif');
    if (textarea) {
        try { textarea.focus(); } catch (e) { /* ignore */ }
    }
}

function fermerModaleImport() {
    var modale = document.getElementById('modalBilanImportQuestionnaire');
    if (modale) modale.classList.remove('actif');
}

function appliquerImport() {
    var textarea = document.getElementById('bilan-import-textarea');
    var zoneErreurs = document.getElementById('bilan-import-erreurs');
    if (!textarea) return;
    if (zoneErreurs) zoneErreurs.textContent = '';

    var resultat = parserQuestionnaireTexte(textarea.value);

    if (!resultat.ok) {
        if (zoneErreurs) {
            var lignesErr = ['<strong>Import impossible\u00a0:</strong><ul style="margin:4px 0 0 0;padding-left:18px;">'];
            for (var i = 0; i < resultat.erreurs.length && i < 20; i++) {
                var e = resultat.erreurs[i];
                var prefixe = e.ligne ? ('Ligne ' + e.ligne + ' \u2014 ') : '';
                lignesErr.push('<li>' + echapperHtml(prefixe + e.message) + '</li>');
            }
            if (resultat.erreurs.length > 20) {
                lignesErr.push('<li>(+' + (resultat.erreurs.length - 20) + ' autres erreurs)</li>');
            }
            lignesErr.push('</ul>');
            zoneErreurs.innerHTML = lignesErr.join('');
        }
        return;
    }

    var nbBlocs = resultat.questionnaire.blocs.length;
    var nbQp = resultat.questionnaire.questionsPersonnalisees.length;
    var nbQ = nbQp;
    for (var b = 0; b < nbBlocs; b++) nbQ += resultat.questionnaire.blocs[b].questions.length;

    var msg = 'Remplacer le questionnaire actuel par celui import\u00e9\u00a0?\n\n'
        + '\u2022 ' + nbBlocs + ' bloc(s)\n'
        + '\u2022 ' + nbQ + ' question(s) au total'
        + (nbQp > 0 ? ('\n\u2022 ' + nbQp + ' question(s) personnalis\u00e9e(s)') : '');
    if (!confirm(msg)) return;

    etat.questionnaire = resultat.questionnaire;
    etat.blocOuvert = null;
    etat.questionEnEdition = null;
    sauvegarderQuestionnaire();
    fermerModaleImport();
    BilanReflexifEditeur.rendreEditeur();
    afficherToast('Questionnaire import\u00e9');
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

function obtenirCiblesMapping(questions) {
    var cibles = [];
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.type === 'matrix' && q.enonces && q.enonces.length > 0) {
            for (var j = 0; j < q.enonces.length; j++) {
                var en = q.enonces[j];
                cibles.push({
                    key: q.id + '|' + en.id + '|enonce',
                    label: tronquer(q.texte, 40) + '  →  ' + tronquer(en.texte || '(énoncé sans texte)', 40),
                    questionId: q.id,
                    enonceId: en.id,
                    role: 'enonce'
                });
            }
        } else {
            cibles.push({
                key: q.id + '||principal',
                label: tronquer(q.texte, 80),
                questionId: q.id,
                enonceId: null,
                role: 'principal'
            });
        }
        if ((q.type === 'choix_unique' || q.type === 'choix_multiple') && q.options) {
            var aAutre = false;
            for (var oi = 0; oi < q.options.length; oi++) {
                if (q.options[oi].autreAvecChamp) { aAutre = true; break; }
            }
            if (aAutre) {
                cibles.push({
                    key: q.id + '||autres',
                    label: '↳ ' + tronquer(q.texte, 60) + '  (champ libre « Autre »)',
                    questionId: q.id,
                    enonceId: null,
                    role: 'autres'
                });
            }
        }
    }
    return cibles;
}

function _tenterMappingAutres(entete, questions) {
    var m = entete.match(/^autres?\s*[:\u2014\u2013\-]\s*(.+)$/i);
    if (!m) return null;
    var prefix = m[1].trim();

    var meilleur = null, meilleurScore = 0;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (!q.options) continue;
        var aAutre = false;
        for (var oi = 0; oi < q.options.length; oi++) {
            if (q.options[oi].autreAvecChamp) { aAutre = true; break; }
        }
        if (!aAutre) continue;
        var s = similitudeTexte(prefix, q.texte);
        if (s > meilleurScore) {
            meilleurScore = s;
            meilleur = q;
        }
    }
    if (meilleurScore >= 0.5 && meilleur) {
        return { questionId: meilleur.id, enonceId: null, role: 'autres', score: meilleurScore };
    }
    return null;
}

function _tenterMappingMatrice(entete, questions) {
    var meilleur = null, meilleurScore = 0;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.type !== 'matrix' || !q.enonces) continue;
        for (var j = 0; j < q.enonces.length; j++) {
            var en = q.enonces[j];
            var combined = q.texte + ' ' + (en.texte || '');
            var s = similitudeTexte(entete, combined);
            if (s > meilleurScore) {
                meilleurScore = s;
                meilleur = { question: q, enonce: en };
            }
        }
    }
    if (meilleurScore >= 0.4 && meilleur) {
        return {
            questionId: meilleur.question.id,
            enonceId: meilleur.enonce.id,
            role: 'enonce',
            score: meilleurScore
        };
    }
    return null;
}

function mapperColonnes(entetes, questions) {
    var mapping = [];

    for (var i = 0; i < entetes.length; i++) {
        var entete = entetes[i];
        var entry = {
            indexColonne: i,
            entete: entete,
            questionId: null,
            enonceId: null,
            role: null,
            score: 0,
            ignore: false
        };

        if (estColonneIgnoree(entete)) {
            entry.ignore = true;
            mapping.push(entry);
            continue;
        }

        // 1. Préfixe "Autres : ..."
        var matchAutres = _tenterMappingAutres(entete, questions);
        if (matchAutres) {
            entry.questionId = matchAutres.questionId;
            entry.role = 'autres';
            entry.score = matchAutres.score;
            mapping.push(entry);
            continue;
        }

        // 2. Énoncé de matrice (vs question principale non-matrice)
        var matchMatrice = _tenterMappingMatrice(entete, questions);

        var matchDefault = null;
        var meilleurScore = 0, meilleureQ = null;
        for (var j = 0; j < questions.length; j++) {
            var q = questions[j];
            if (q.type === 'matrix') continue;
            var s = similitudeTexte(entete, q.texte);
            if (s > meilleurScore) {
                meilleurScore = s;
                meilleureQ = q;
            }
        }
        if (meilleurScore >= 0.35 && meilleureQ) {
            matchDefault = { questionId: meilleureQ.id, enonceId: null, role: 'principal', score: meilleurScore };
        }

        var meilleurMatch = null;
        if (matchMatrice && matchDefault) {
            meilleurMatch = matchMatrice.score > matchDefault.score ? matchMatrice : matchDefault;
        } else {
            meilleurMatch = matchMatrice || matchDefault;
        }

        if (meilleurMatch) {
            entry.questionId = meilleurMatch.questionId;
            entry.enonceId = meilleurMatch.enonceId;
            entry.role = meilleurMatch.role;
            entry.score = meilleurMatch.score;
        }
        mapping.push(entry);
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

    var cibles = obtenirCiblesMapping(questions);

    var html = [];
    html.push('<h3 style="margin:16px 0 8px;color:var(--texte-principal)">Correspondance des colonnes (' + nbLignes + ' réponses détectées)</h3>');
    html.push('<table class="bilan-mapping-table">');
    html.push('<thead><tr><th>Colonne CSV</th><th>Question / énoncé / champ correspondant</th></tr></thead>');
    html.push('<tbody>');

    for (var i = 0; i < mapping.length; i++) {
        var mp = mapping[i];
        html.push('<tr>');
        html.push('<td>' + echapperHtml(tronquer(mp.entete, 60)) + '</td>');

        if (mp.ignore) {
            html.push('<td class="bilan-mapping-ignore">Ignorée (métadonnée)</td>');
        } else {
            html.push('<td>');
            html.push('<select class="bilan-mapping-select" data-on-change="BilanReflexif.modifierMapping" id="bilan-map-' + i + '">');
            html.push('<option value="">Ignorer cette colonne</option>');
            var currentKey = (mp.questionId || '') + '|' + (mp.enonceId || '') + '|' + (mp.role || '');
            for (var c = 0; c < cibles.length; c++) {
                var cible = cibles[c];
                var selected = (currentKey === cible.key) ? ' selected' : '';
                html.push('<option value="' + cible.key + '"' + selected + '>' + echapperHtml(cible.label) + '</option>');
            }
            html.push('</select>');
            if (mp.score >= 0.35) {
                html.push(' <span class="bilan-mapping-match">✓ ' + Math.round(mp.score * 100) + '%</span>');
            }
            html.push('</td>');
        }

        html.push('</tr>');
    }

    html.push('</tbody></table>');
    html.push('<div class="bilan-actions">');
    html.push('<button class="bilan-btn bilan-btn-principal" data-action="BilanReflexif.confirmerImport">Importer les résultats</button>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.annulerImport">Annuler</button>');
    html.push('</div>');

    zone.innerHTML = html.join('');
}

function modifierMapping(el) {
    if (!el) return;
    var select = (el.target && el.target.tagName === 'SELECT') ? el.target : el;
    var id = select.id;
    if (!id) return;
    var index = parseInt(id.replace('bilan-map-', ''), 10);
    if (isNaN(index) || !etat.mappingImport || !etat.mappingImport[index]) return;

    var key = select.value;
    var entry = etat.mappingImport[index];
    if (!key) {
        entry.questionId = null;
        entry.enonceId = null;
        entry.role = null;
    } else {
        var parts = key.split('|');
        entry.questionId = parts[0] || null;
        entry.enonceId = parts[1] || null;
        entry.role = parts[2] || 'principal';
    }
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

    var questionsParId = {};
    for (var i = 0; i < questions.length; i++) {
        questionsParId[questions[i].id] = questions[i];
    }

    // Regrouper les colonnes par questionId
    var colonnesParQuestion = {};
    for (var m = 0; m < mapping.length; m++) {
        var mp = mapping[m];
        if (!mp.questionId || mp.ignore) continue;
        if (!colonnesParQuestion[mp.questionId]) colonnesParQuestion[mp.questionId] = [];
        colonnesParQuestion[mp.questionId].push(mp);
    }

    var reponses = {};
    var nbRepondants = donnees.length;

    for (var qid in colonnesParQuestion) {
        if (!colonnesParQuestion.hasOwnProperty(qid)) continue;
        var question = questionsParId[qid];
        if (!question) continue;
        reponses[qid] = _agregerQuestion(question, colonnesParQuestion[qid], donnees);
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
    afficherToast(nbRepondants + ' réponses importées');
}

function _agregerQuestion(question, cols, donnees) {
    var labels = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
    var colPrincipal = null;
    var colsAutres = [];
    var colsEnonce = [];
    for (var c = 0; c < cols.length; c++) {
        if (cols[c].role === 'autres') colsAutres.push(cols[c]);
        else if (cols[c].role === 'enonce') colsEnonce.push(cols[c]);
        else colPrincipal = cols[c];
    }

    var result = { type: question.type, nbReponses: 0 };

    if (question.type === 'likert4') {
        if (!colPrincipal) return result;
        var distrib = {};
        for (var l = 0; l < labels.length; l++) distrib[labels[l].label] = 0;
        var somme = 0, nbRep = 0, nbNA = 0;
        for (var r = 0; r < donnees.length; r++) {
            var val = (donnees[r][colPrincipal.indexColonne] || '').trim();
            if (!val) continue;
            if (question.inclureNA && _estNA(val)) {
                nbNA++;
                continue;
            }
            var n = convertirLikert(val);
            if (n > 0) {
                var lbl = labels.find(function(x) { return x.valeur === n; });
                if (lbl) distrib[lbl.label]++;
                somme += n;
                nbRep++;
            }
        }
        result.distribution = distrib;
        result.nbReponses = nbRep;
        result.scoreMoyen = nbRep > 0 ? Math.round((somme / nbRep) * 100) / 100 : 0;
        if (question.inclureNA) {
            result.inclureNA = true;
            result.nbNA = nbNA;
        }
        return result;
    }

    if (question.type === 'choix_unique' || question.type === 'choix_multiple') {
        if (!colPrincipal) {
            if (colsAutres.length > 0) result.autres = _collecterAutres(colsAutres, donnees);
            return result;
        }
        var distOpt = {}, libelles = {};
        if (question.options) {
            for (var oi = 0; oi < question.options.length; oi++) {
                distOpt[question.options[oi].id] = 0;
                libelles[question.options[oi].id] = question.options[oi].texte;
            }
        }
        var nbR = 0;
        for (var rr = 0; rr < donnees.length; rr++) {
            var v = (donnees[rr][colPrincipal.indexColonne] || '').trim();
            if (!v) continue;
            var parts = (question.type === 'choix_multiple') ? _splitMultiChoix(v) : [v];
            if (parts.length === 0) continue;
            nbR++;
            for (var p = 0; p < parts.length; p++) {
                var opt = _trouverOptionParTexte(question.options, parts[p]);
                if (opt) distOpt[opt.id]++;
            }
        }
        result.distribution = distOpt;
        result.libellesOptions = libelles;
        result.nbReponses = nbR;
        if (colsAutres.length > 0) result.autres = _collecterAutres(colsAutres, donnees);
        return result;
    }

    if (question.type === 'matrix') {
        var parEnonce = {}, libellesEn = {};
        if (question.enonces) {
            for (var ei = 0; ei < question.enonces.length; ei++) {
                libellesEn[question.enonces[ei].id] = question.enonces[ei].texte;
            }
        }
        var nbMax = 0;
        for (var ce = 0; ce < colsEnonce.length; ce++) {
            var col = colsEnonce[ce];
            if (!col.enonceId) continue;
            var distrEn = {};
            for (var le = 0; le < labels.length; le++) distrEn[labels[le].label] = 0;
            var sommeE = 0, nbE = 0;
            for (var re = 0; re < donnees.length; re++) {
                var ve = (donnees[re][col.indexColonne] || '').trim();
                if (!ve) continue;
                var ne = convertirLikert(ve);
                if (ne > 0) {
                    var lbl2 = labels.find(function(x) { return x.valeur === ne; });
                    if (lbl2) distrEn[lbl2.label]++;
                    sommeE += ne;
                    nbE++;
                }
            }
            parEnonce[col.enonceId] = {
                distribution: distrEn,
                scoreMoyen: nbE > 0 ? Math.round((sommeE / nbE) * 100) / 100 : 0,
                nbReponses: nbE
            };
            if (nbE > nbMax) nbMax = nbE;
        }
        result.parEnonce = parEnonce;
        result.libellesEnonces = libellesEn;
        result.nbReponses = nbMax;
        return result;
    }

    if (question.type === 'ouvert') {
        if (!colPrincipal) return result;
        var reps = [];
        for (var ro = 0; ro < donnees.length; ro++) {
            var rep = (donnees[ro][colPrincipal.indexColonne] || '').trim();
            if (rep) reps.push(rep);
        }
        result.reponses = reps;
        result.nbReponses = reps.length;
        return result;
    }

    return result;
}

function _estNA(valeur) {
    var norm = (valeur || '').toLowerCase().trim();
    return /^non\s+applicable$|^n\.?\/?\s*a\.?$/.test(norm);
}

function _splitMultiChoix(valeur) {
    if (!valeur) return [];
    var v = String(valeur);
    var parts = v.indexOf(';') !== -1 ? v.split(';') : [v];
    var out = [];
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i].trim();
        if (p.length > 0) out.push(p);
    }
    return out;
}

function _trouverOptionParTexte(options, valeur) {
    if (!options || !valeur) return null;
    var meilleur = null, meilleurScore = 0;
    for (var i = 0; i < options.length; i++) {
        var s = similitudeTexte(valeur, options[i].texte || '');
        if (s > meilleurScore) {
            meilleurScore = s;
            meilleur = options[i];
        }
    }
    if (meilleurScore >= 0.5) return meilleur;
    return null;
}

function _collecterAutres(colsAutres, donnees) {
    var autres = [];
    for (var c = 0; c < colsAutres.length; c++) {
        for (var r = 0; r < donnees.length; r++) {
            var val = (donnees[r][colsAutres[c].indexColonne] || '').trim();
            if (val) autres.push(val);
        }
    }
    return autres;
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

        // Filtrer les questions avec réponses
        var qsAvecRep = [];
        for (var j = 0; j < bloc.questions.length; j++) {
            if (res.reponses[bloc.questions[j].id]) qsAvecRep.push(bloc.questions[j]);
        }
        if (qsAvecRep.length === 0) continue;

        html.push('<div class="bilan-rapport-section">');
        html.push('<div class="bilan-rapport-titre">' + echapperHtml(bloc.titre));

        var scoreBloc = calculerScoreBloc(qsAvecRep, res);
        if (scoreBloc.nb > 0) {
            html.push(' <span style="font-size:14px;font-weight:400;color:var(--texte-secondaire)">\u2014 ' + scoreBloc.moyenne.toFixed(2) + ' / 4</span>');
        }
        html.push('</div>');

        var signaux = calculerSignaux(qsAvecRep, res);
        if (signaux.fort) html.push('<span class="bilan-signal bilan-signal-fort">\u2713 Signal fort \u2014 ' + signaux.tauxFavorable + '% favorables</span>');
        if (signaux.faible) html.push('<span class="bilan-signal bilan-signal-faible">\u26A0 Signal faible \u2014 ' + signaux.tauxDefavorable + '% d\u00e9favorables</span>');

        // Rendu de chaque question selon son type
        for (var k = 0; k < qsAvecRep.length; k++) {
            var qb = qsAvecRep[k];
            var rep = res.reponses[qb.id];
            switch (qb.type) {
                case 'likert4':
                    html.push(rendreReponseLikert(qb, rep));
                    break;
                case 'choix_unique':
                    html.push(rendreReponseChoixUnique(qb, rep));
                    break;
                case 'choix_multiple':
                    html.push(rendreReponseChoixMultiple(qb, rep));
                    break;
                case 'matrix':
                    html.push(rendreReponseMatrix(qb, rep));
                    break;
                case 'ouvert':
                    html.push(rendreReponseOuvert(qb, rep));
                    break;
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

function _rendreBarreLikert(distribution, totalRep) {
    if (!distribution || totalRep <= 0) return '';
    var labels = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
    var html = ['<div class="bilan-rep-likert-bar">'];
    var segs = ['', '', '', ''];
    var pcts = [0, 0, 0, 0];
    for (var i = 0; i < labels.length; i++) {
        var n = distribution[labels[i].label] || 0;
        var pct = totalRep > 0 ? Math.round((n / totalRep) * 100) : 0;
        pcts[i] = pct;
        if (pct > 0) {
            html.push('<div class="bilan-rep-likert-segment-' + labels[i].valeur + '" style="width:' + pct + '%" title="' + labels[i].label + ' : ' + pct + '%">' + (pct >= 8 ? pct + '%' : '') + '</div>');
        }
    }
    html.push('</div>');
    var leg = [
        pcts[0] + '% Tout à fait',
        pcts[1] + '% Plutôt',
        pcts[2] + '% Plutôt en désaccord',
        pcts[3] + '% Pas du tout'
    ];
    html.push('<div class="bilan-rep-likert-legende">' + leg.join(' · ') + '</div>');
    return html.join('');
}

function _rendreBarrePct(label, pct, dominante) {
    return '<div class="bilan-rep-row">' +
        '<span class="bilan-rep-label">' + echapperHtml(label) + '</span>' +
        '<div class="bilan-rep-bar' + (dominante ? ' dominante' : '') + '"><div style="width:' + pct + '%"></div></div>' +
        '<span class="bilan-rep-pct"><strong>' + pct + '%</strong></span>' +
        '</div>';
}

function _rendreReponsesAutres(rep) {
    if (!rep || !rep.autres || rep.autres.length === 0) return '';
    var html = ['<div class="bilan-rep-autres">'];
    html.push('<div class="bilan-rep-autres-titre">Réponses libres « Autre » (' + rep.autres.length + ')</div>');
    for (var i = 0; i < rep.autres.length; i++) {
        html.push('<div class="bilan-reponse-ouverte">' + echapperHtml(rep.autres[i]) + '</div>');
    }
    html.push('</div>');
    return html.join('');
}

function rendreReponseLikert(question, rep) {
    var html = ['<div class="bilan-question-rep">'];
    html.push('<div class="bilan-rep-titre">' + echapperHtml(question.texte));
    var meta = '';
    if (rep.scoreMoyen != null) meta = rep.scoreMoyen.toFixed(2) + ' / 4';
    if (rep.nbReponses != null) meta += (meta ? ' · ' : '') + rep.nbReponses + ' réponses';
    if (meta) html.push('<span class="bilan-rep-meta">' + meta + '</span>');
    html.push('</div>');
    if (rep.inclureNA && rep.nbNA > 0) {
        var totAvecNA = rep.nbReponses + rep.nbNA;
        var pctNA = totAvecNA > 0 ? Math.round((rep.nbNA / totAvecNA) * 100) : 0;
        html.push('<div class="bilan-rep-na">⊘ Non applicable : ' + rep.nbNA + ' réponse' + (rep.nbNA > 1 ? 's' : '') + ' (' + pctNA + '%)</div>');
    }
    html.push(_rendreBarreLikert(rep.distribution, rep.nbReponses));
    html.push('</div>');
    return html.join('');
}

function rendreReponseChoixUnique(question, rep) {
    var html = ['<div class="bilan-question-rep">'];
    html.push('<div class="bilan-rep-titre">' + echapperHtml(question.texte));
    if (rep.nbReponses != null) html.push('<span class="bilan-rep-meta">' + rep.nbReponses + ' réponses</span>');
    html.push('</div>');

    if (rep.nbReponses === 0) {
        html.push('<div class="bilan-rep-vide">Aucune réponse</div>');
    } else {
        // Trouver l'option dominante (>=60% ou max simple)
        var pctMax = 0, idMax = null;
        for (var oid in rep.distribution) {
            if (!rep.distribution.hasOwnProperty(oid)) continue;
            var pct = rep.nbReponses > 0 ? Math.round((rep.distribution[oid] / rep.nbReponses) * 100) : 0;
            if (pct > pctMax) { pctMax = pct; idMax = oid; }
        }
        html.push('<div class="bilan-rep-options">');
        if (question.options) {
            for (var oi = 0; oi < question.options.length; oi++) {
                var opt = question.options[oi];
                var n = rep.distribution[opt.id] || 0;
                var pctOpt = rep.nbReponses > 0 ? Math.round((n / rep.nbReponses) * 100) : 0;
                var dom = (opt.id === idMax && pctMax >= 60);
                html.push(_rendreBarrePct(opt.texte || ('Option ' + (oi + 1)), pctOpt, dom));
            }
        }
        html.push('</div>');
    }

    html.push(_rendreReponsesAutres(rep));
    html.push('</div>');
    return html.join('');
}

function rendreReponseChoixMultiple(question, rep) {
    var html = ['<div class="bilan-question-rep">'];
    html.push('<div class="bilan-rep-titre">' + echapperHtml(question.texte));
    var meta = (rep.nbReponses != null) ? rep.nbReponses + ' réponses' : '';
    if (question.maxSelection) meta += (meta ? ' · ' : '') + 'max ' + question.maxSelection;
    if (meta) html.push('<span class="bilan-rep-meta">' + meta + '</span>');
    html.push('</div>');

    if (rep.nbReponses === 0) {
        html.push('<div class="bilan-rep-vide">Aucune réponse</div>');
    } else {
        // Calculer max pct pour normaliser la barre (un % > 100 cumulé fait peu de sens)
        // Ici on affiche le taux de sélection : nbSelec / nbReponses
        html.push('<div class="bilan-rep-options">');
        if (question.options) {
            // Trier par fréquence décroissante pour mettre en avant les top
            var sorted = question.options.slice().sort(function(a, b) {
                return (rep.distribution[b.id] || 0) - (rep.distribution[a.id] || 0);
            });
            for (var oi = 0; oi < sorted.length; oi++) {
                var opt = sorted[oi];
                var n = rep.distribution[opt.id] || 0;
                var pctOpt = rep.nbReponses > 0 ? Math.round((n / rep.nbReponses) * 100) : 0;
                var top3 = (oi < 3 && n > 0);
                html.push(_rendreBarrePct(opt.texte || ('Option ' + (oi + 1)), pctOpt, top3));
            }
        }
        html.push('</div>');
    }

    html.push(_rendreReponsesAutres(rep));
    html.push('</div>');
    return html.join('');
}

function rendreReponseMatrix(question, rep) {
    var html = ['<div class="bilan-question-rep">'];
    html.push('<div class="bilan-rep-titre">' + echapperHtml(question.texte));
    var nbE = (question.enonces || []).length;
    var meta = nbE + ' énoncé' + (nbE > 1 ? 's' : '');
    if (rep.nbReponses != null) meta += ' · ' + rep.nbReponses + ' réponses max';
    html.push('<span class="bilan-rep-meta">' + meta + '</span>');
    html.push('</div>');

    if (!rep.parEnonce || nbE === 0) {
        html.push('<div class="bilan-rep-vide">Aucune réponse</div>');
    } else {
        html.push('<table class="bilan-rep-matrix">');
        html.push('<thead><tr><th>Énoncé</th><th>Distribution</th><th>Moy.</th></tr></thead>');
        html.push('<tbody>');
        for (var ei = 0; ei < question.enonces.length; ei++) {
            var en = question.enonces[ei];
            var repE = rep.parEnonce[en.id];
            html.push('<tr>');
            html.push('<td>' + echapperHtml(en.texte || ('Énoncé ' + (ei + 1))) + '</td>');
            html.push('<td>');
            if (repE && repE.nbReponses > 0) {
                html.push(_rendreBarreLikert(repE.distribution, repE.nbReponses));
            } else {
                html.push('<span class="bilan-rep-vide">—</span>');
            }
            html.push('</td>');
            html.push('<td>' + (repE && repE.scoreMoyen != null ? repE.scoreMoyen.toFixed(2) : '—') + '</td>');
            html.push('</tr>');
        }
        html.push('</tbody></table>');
    }
    html.push('</div>');
    return html.join('');
}

function rendreReponseOuvert(question, rep) {
    var html = ['<div class="bilan-question-rep">'];
    html.push('<div class="bilan-rep-titre">' + echapperHtml(question.texte));
    if (rep.nbReponses != null) html.push('<span class="bilan-rep-meta">' + rep.nbReponses + ' réponses</span>');
    html.push('</div>');

    if (!rep.reponses || rep.reponses.length === 0) {
        html.push('<div class="bilan-rep-vide">Aucune réponse</div>');
    } else {
        for (var i = 0; i < rep.reponses.length; i++) {
            html.push('<div class="bilan-reponse-ouverte">' + echapperHtml(rep.reponses[i]) + '</div>');
        }
    }
    html.push('</div>');
    return html.join('');
}

function calculerVueEnsemble(res, q) {
    var sommeScores = 0;
    var nbScores = 0;
    var totalFavorable = 0;
    var totalReponses = 0;

    function _ajouterDistrib(distrib) {
        for (var lbl in distrib) {
            if (!distrib.hasOwnProperty(lbl)) continue;
            var n = distrib[lbl];
            totalReponses += n;
            var v = labelVersValeur(lbl);
            if (v >= 3) totalFavorable += n;
        }
    }

    for (var qId in res.reponses) {
        if (!res.reponses.hasOwnProperty(qId)) continue;
        var rep = res.reponses[qId];

        if (rep.type === 'likert4') {
            if (rep.nbReponses > 0) {
                sommeScores += rep.scoreMoyen;
                nbScores++;
            }
            _ajouterDistrib(rep.distribution || {});
        } else if (rep.type === 'matrix') {
            if (rep.parEnonce) {
                for (var enid in rep.parEnonce) {
                    if (!rep.parEnonce.hasOwnProperty(enid)) continue;
                    var repE = rep.parEnonce[enid];
                    if (repE.nbReponses > 0) {
                        sommeScores += repE.scoreMoyen;
                        nbScores++;
                    }
                    _ajouterDistrib(repE.distribution || {});
                }
            }
        }
    }

    return {
        scoreGlobal: nbScores > 0 ? sommeScores / nbScores : 0,
        tauxFavorable: totalReponses > 0 ? Math.round((totalFavorable / totalReponses) * 100) : 0,
        nbQuestionsRepondues: nbScores
    };
}

function calculerScoreBloc(questionsBloc, res) {
    var somme = 0;
    var nb = 0;
    for (var i = 0; i < questionsBloc.length; i++) {
        var qb = questionsBloc[i];
        var rep = res.reponses[qb.id];
        if (!rep) continue;
        if (qb.type === 'likert4' && rep.nbReponses > 0) {
            somme += rep.scoreMoyen;
            nb++;
        } else if (qb.type === 'matrix' && rep.parEnonce) {
            for (var enid in rep.parEnonce) {
                if (!rep.parEnonce.hasOwnProperty(enid)) continue;
                var repE = rep.parEnonce[enid];
                if (repE.nbReponses > 0) {
                    somme += repE.scoreMoyen;
                    nb++;
                }
            }
        }
    }
    return { moyenne: nb > 0 ? somme / nb : 0, nb: nb };
}

function calculerSignaux(questionsBloc, res) {
    var totalFav = 0, totalDefav = 0, totalRep = 0;

    function _addDistrib(distrib) {
        for (var lbl in distrib) {
            if (!distrib.hasOwnProperty(lbl)) continue;
            var n = distrib[lbl];
            var v = labelVersValeur(lbl);
            totalRep += n;
            if (v >= 3) totalFav += n;
            if (v <= 2) totalDefav += n;
        }
    }

    for (var i = 0; i < questionsBloc.length; i++) {
        var qb = questionsBloc[i];
        var rep = res.reponses[qb.id];
        if (!rep) continue;
        if (qb.type === 'likert4' && rep.distribution) {
            _addDistrib(rep.distribution);
        } else if (qb.type === 'matrix' && rep.parEnonce) {
            for (var enid in rep.parEnonce) {
                if (!rep.parEnonce.hasOwnProperty(enid)) continue;
                _addDistrib(rep.parEnonce[enid].distribution || {});
            }
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

        var qsAvecRep = [];
        for (var j = 0; j < bloc.questions.length; j++) {
            if (res.reponses[bloc.questions[j].id]) qsAvecRep.push(bloc.questions[j]);
        }
        if (qsAvecRep.length === 0) continue;

        var scoreBloc = calculerScoreBloc(qsAvecRep, res);
        var signaux = calculerSignaux(qsAvecRep, res);
        if (scoreBloc.nb === 0) continue;

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
    // Seul le graphique global Chart.js subsiste ; les rendus par question
    // utilisent désormais des barres HTML (plus simple, plus rapide).
    creerGraphiqueGlobal(res);
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
                    tooltip: Object.assign({}, (window.STYLE_GRAPHIQUE && window.STYLE_GRAPHIQUE.tooltip) || {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff', bodyColor: '#fff',
                        cornerRadius: 6, padding: 10
                    }, {
                        callbacks: {
                            label: function(ctx) { return ctx.dataset.label + ' : ' + ctx.raw + '%'; }
                        }
                    })
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
                    tooltip: Object.assign({}, (window.STYLE_GRAPHIQUE && window.STYLE_GRAPHIQUE.tooltip) || {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff', bodyColor: '#fff',
                        cornerRadius: 6, padding: 10
                    }, {
                        callbacks: {
                            label: function(ctx) { return ctx.dataset.label + ' : ' + ctx.raw + '%'; }
                        }
                    })
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
            try { detruireGraphiques(); } catch (e) { console.error('[BilanReflexif] Erreur detruireGraphiques:', e); }
        }
        return _originalAfficherSection.apply(this, arguments);
    };
}

// API publique
window.BilanReflexif = {
    afficherVue: afficherVue,
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
    exporterTexte: exporterTexte,
    // Import du questionnaire (texte)
    ouvrirModaleImport: ouvrirModaleImport,
    fermerModaleImport: fermerModaleImport,
    appliquerImport: appliquerImport,
    telechargerModele: telechargerModele,
    copierPromptIA: copierPromptIA,
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

// Exposition pour les tests de régression du refactoring 2026-mai
// (cf. audit/PLAN-MOYEN-TERME.md §4.1, MODULES-MAP §2.5). Ces fonctions sont
// pures et n'ont pas vocation à faire partie de l'API publique. Le hatch sera
// retiré au fur et à mesure des 7 extractions : chaque sous-module exposera
// naturellement ses propres pures via son IIFE, et les tests pointeront alors
// vers ces nouveaux exports.
window.__bilanReflexifInternals = {
    parserQuestionnaireTexte: parserQuestionnaireTexte,
    formaterQuestionnaireEnTexte: formaterQuestionnaireEnTexte,
    genererModeleTexte: genererModeleTexte,
    parserCSV: parserCSV,
    detecterSeparateur: detecterSeparateur,
    normaliserTexte: normaliserTexte,
    similitudeTexte: similitudeTexte,
    convertirLikert: convertirLikert,
    obtenirCiblesMapping: obtenirCiblesMapping,
    mapperColonnes: mapperColonnes,
    _agregerQuestion: _agregerQuestion,
    _estNA: _estNA,
    _splitMultiChoix: _splitMultiChoix,
    _trouverOptionParTexte: _trouverOptionParTexte,
    estColonneIgnoree: estColonneIgnoree
};

})();
