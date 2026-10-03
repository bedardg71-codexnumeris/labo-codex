/* ===============================
   MODULE: BILAN RÉFLEXIF — IMPORT/EXPORT TEXTE DU QUESTIONNAIRE
   Formatage texte, parsing, modèle, modale d'import + prompt IA.
   PLAN-MOYEN-TERME §4.1.f.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js,
                   bilan-reflexif-editeur.js
   Charger AVANT : bilan-reflexif.js (résidu)

   Dépendances :
   - BilanReflexifCore : etat, sauvegarderQuestionnaire, afficherToast
   - BilanReflexifEditeur : rendreEditeur (recharge la vue après import)
   - Globaux projet : echapperHtml, navigator (clipboard), Blob, URL,
     document.execCommand (fallback Safari file://)

   Pures testées par tests/unit/bilan-reflexif.test.js :
   - formaterQuestionnaireEnTexte (test 3)
   - parserQuestionnaireTexte (tests 2, 3.b)
   - genererModeleTexte (test 2)
   =============================== */

(function() {
'use strict';

var etat = BilanReflexifCore.etat;
var genId = BilanReflexifCore.genId;
var afficherToast = BilanReflexifCore.afficherToast;
var sauvegarderQuestionnaire = BilanReflexifCore.sauvegarderQuestionnaire;

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
// Prétraitement d'une ligne brute : gère le mode préambule, les lignes vides,
// les commentaires, le markdown bold (**), les séparateurs, les énoncés de
// matrice et les cases cochables. Mute `ctx` au passage. Retourne :
//   { action: 'skip' }        — ligne consommée, passer à la suivante
//   { action: 'process', ligne: '...' } — ligne à traiter normalement
// Le ctx porte : preambuleLignes, questionCourante (lecture seule),
// les regex partagées et la fermerQuestion/fermerPreambule (lecture seule
// références aux closures du parser principal).
function _parserPretraitement(ligneOriginale, ctx, erreurs, noLigne) {
    var ligneTrim = ligneOriginale.trim();

    // Mode préambule : tout est préambule sauf délimiteurs forts
    if (ctx.preambuleLignes !== null) {
        var estDelimiteur = ctx.rxSection.test(ligneTrim) || ctx.rxQuestion.test(ligneTrim)
            || ctx.rxBalise.test(ligneTrim) || ctx.rxTitre.test(ligneTrim);
        if (estDelimiteur) {
            ctx.fermerPreambule();
            // Continuer le traitement de cette ligne
        } else {
            ctx.preambuleLignes.push(ligneOriginale);
            return { action: 'skip' };
        }
    }

    if (ligneTrim === '' || ctx.rxCommentaire.test(ligneTrim)) {
        ctx.fermerQuestion();
        return { action: 'skip' };
    }

    // Tolérance Markdown : strip ** seulement
    ligneTrim = ligneTrim.replace(/\*\*/g, '').trim();
    if (ligneTrim === '') { ctx.fermerQuestion(); return { action: 'skip' }; }

    if (ctx.rxSeparateur.test(ligneTrim)) {
        ctx.fermerQuestion();
        return { action: 'skip' };
    }

    // Mode matrice : énoncé en puce -
    if (ctx.questionCourante && ctx.questionCourante.type === 'matrix') {
        var mEn = ligneTrim.match(ctx.rxEnonceMatrice);
        if (mEn) {
            if (!ctx.questionCourante.enonces) ctx.questionCourante.enonces = [];
            ctx.questionCourante.enonces.push({
                id: 'imp_e_' + genId(),
                texte: mEn[1].trim()
            });
            return { action: 'skip' };
        }
    }

    // Hors matrice : strip puce de liste
    var ligneSansPuce = ligneTrim.replace(ctx.rxPucePrefixe, '').trim();
    if (ligneSansPuce !== '') ligneTrim = ligneSansPuce;

    if (ctx.rxCaseCochable.test(ligneTrim)) {
        erreurs.push({ ligne: noLigne, message: 'Case à cocher ignorée — utilise [CHECKBOX] avec des options personnalisées.' });
        return { action: 'skip' };
    }

    return { action: 'process', ligne: ligneTrim };
}

// Décode la balise typeEnAttente en {type, minSelection, maxSelection}.
// Retourne null si pas de balise active.
function _parserDecoderType(typeEnAttente, paramsEnAttente) {
    if (!typeEnAttente) return { type: 'ouvert', minSel: null, maxSel: null };
    var spec = { type: 'ouvert', minSel: null, maxSel: null };
    if (typeEnAttente === 'RADIO') spec.type = 'choix_unique';
    else if (typeEnAttente === 'CHECKBOX') {
        spec.type = 'choix_multiple';
        if (paramsEnAttente) {
            var mMax = paramsEnAttente.match(/max\s*=\s*(\d+)/i);
            var mMin = paramsEnAttente.match(/min\s*=\s*(\d+)/i);
            if (mMax) spec.maxSel = parseInt(mMax[1], 10);
            if (mMin) spec.minSel = parseInt(mMin[1], 10);
        }
    }
    else if (typeEnAttente === 'MATRIX') spec.type = 'matrix';
    else if (typeEnAttente === 'OUVERT') spec.type = 'ouvert';
    else if (typeEnAttente === 'LIKERT') spec.type = 'likert4';
    return spec;
}

// Crée un objet question initialisé selon son type. Retourne la question.
function _parserCreerQuestion(texte, spec, modePerso, consigne) {
    var q = {
        id: 'imp_q_' + genId(),
        texte: texte,
        type: spec.type,
        obligatoire: false,
        personnalisee: modePerso
    };
    if (spec.type === 'likert4') q.inclureNA = false;
    if (spec.type === 'choix_unique' || spec.type === 'choix_multiple') q.options = [];
    if (spec.type === 'choix_multiple') {
        q.minSelection = spec.minSel;
        q.maxSelection = spec.maxSel;
    }
    if (spec.type === 'matrix') q.enonces = [];
    if (consigne) q.consigneConditionnelle = consigne;
    return q;
}

// Ajoute une option (a-d / a-e) à la question courante selon son type.
// Mute questionCourante en place. rxAutreChamp est passé en argument pour
// éviter de recompiler la regex à chaque appel.
function _parserAjouterChoix(mChoix, questionCourante, rxAutreChamp) {
    var lettre = mChoix[1].toLowerCase();
    var texteChoix = mChoix[2].trim();

    if (questionCourante.type === 'ouvert') {
        questionCourante.type = 'likert4';
        questionCourante.inclureNA = false;
    }

    if (questionCourante.type === 'likert4') {
        if (lettre === 'e') questionCourante.inclureNA = true;
        return;
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
    }
}

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

    // Contexte mutable partagé avec les helpers de préprocessing.
    var pretraitementCtx = {
        preambuleLignes: preambuleLignes,
        questionCourante: questionCourante,
        rxSection: rxSection, rxQuestion: rxQuestion, rxBalise: rxBalise,
        rxTitre: rxTitre, rxCommentaire: rxCommentaire, rxSeparateur: rxSeparateur,
        rxEnonceMatrice: rxEnonceMatrice, rxPucePrefixe: rxPucePrefixe,
        rxCaseCochable: rxCaseCochable,
        fermerQuestion: fermerQuestion, fermerPreambule: fermerPreambule
    };

    for (var i = 0; i < lignes.length; i++) {
        var ligneOriginale = lignes[i];
        var noLigne = i + 1;

        // Resynchronisation par référence en début d'itération : les helpers
        // peuvent muter `ctx.preambuleLignes.push(...)` ou appeler les closures
        // `fermerQuestion()`/`fermerPreambule()` qui réassignent les locals du
        // parent. On ne resynchronise PAS dans l'autre sens après l'appel :
        // les closures ont déjà fait le travail.
        pretraitementCtx.preambuleLignes = preambuleLignes;
        pretraitementCtx.questionCourante = questionCourante;
        var pre = _parserPretraitement(ligneOriginale, pretraitementCtx, erreurs, noLigne);
        if (pre.action === 'skip') continue;
        var ligneTrim = pre.ligne;

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
            _parserAjouterChoix(mChoix, questionCourante, rxAutreChamp);
            continue;
        }

        var mQ = ligneTrim.match(rxQuestion);
        if (mQ) {
            var spec = _parserDecoderType(typeEnAttente, paramsEnAttente);
            typeEnAttente = null;
            paramsEnAttente = null;
            questionCourante = _parserCreerQuestion(mQ[1].trim(), spec, modePerso, consigneEnAttente);
            consigneEnAttente = null;
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

async function appliquerImport() {
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
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('questionnaire'))) return;
    if (!confirm(msg)) return;

    etat.questionnaire = resultat.questionnaire;
    etat.blocOuvert = null;
    etat.questionEnEdition = null;
    sauvegarderQuestionnaire();
    fermerModaleImport();
    BilanReflexifEditeur.rendreEditeur();
    afficherToast('Questionnaire import\u00e9');
}

/* ===============================
   API publique
   =============================== */

window.BilanReflexifTexte = {
    // Export texte
    formaterQuestionnaireEnTexte: formaterQuestionnaireEnTexte,
    exporterTexte: exporterTexte,

    // Import texte (parser + modèle + prompt IA)
    parserQuestionnaireTexte: parserQuestionnaireTexte,
    genererModeleTexte: genererModeleTexte,
    telechargerModele: telechargerModele,
    copierPromptIA: copierPromptIA,

    // Modale d'import
    injecterModaleImport: injecterModaleImport,
    ouvrirModaleImport: ouvrirModaleImport,
    fermerModaleImport: fermerModaleImport,
    appliquerImport: appliquerImport
};

})();
