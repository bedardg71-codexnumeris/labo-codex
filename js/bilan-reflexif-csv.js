/* ===============================
   MODULE: BILAN RÉFLEXIF — IMPORT CSV (RÉSULTATS ÉTUDIANTS)
   Parser CSV maison, détection séparateur, mapping fuzzy (Jaccard sur
   mots), agrégation par type de question (Likert4, choix unique/multiple,
   matrix, ouvert), conversion Likert texte→valeur. PLAN-MOYEN-TERME §4.1.f.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js
   Charger AVANT : bilan-reflexif.js (résidu)

   Dépendances :
   - BilanReflexifCore : etat, afficherToast, tronquer
   - BILAN_REFLEXIF_DATA : ECHELLE_LIKERT4, MAPPING_LIKERT,
     COLONNES_IGNOREES_PATTERNS
   - Globaux projet : echapperHtml, db, window.cle
   - window.BilanReflexif (lookup tardif) : afficherVue — appelée à la fin
     de confirmerImport pour rafraîchir la nav, jamais au load.

   Pures testées par tests/unit/bilan-reflexif.test.js :
   - detecterSeparateur, parserCSV, normaliserTexte, similitudeTexte,
     convertirLikert (test 6)
   - _agregerQuestion (test 7)
   - estColonneIgnoree, obtenirCiblesMapping, mapperColonnes,
     _estNA, _splitMultiChoix, _trouverOptionParTexte (couverts indirectement
     ou par futurs tests)
   =============================== */

(function() {
'use strict';

var etat = BilanReflexifCore.etat;
var afficherToast = BilanReflexifCore.afficherToast;
var tronquer = BilanReflexifCore.tronquer;

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
    BilanReflexif.afficherVue('rapport');
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
                html.push(' <span class="bilan-mapping-match"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>' + formaterPourcentage(Math.round(mp.score * 100)) + '</span>');
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
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_RESULTATS());   // lot F : geste hors témoin (importer des réponses)
    etat.donneesCSVParsees = null;
    etat.mappingImport = null;

    rendreInterface();
    BilanReflexif.afficherVue('rapport');
    afficherToast(nbRepondants + ' réponses importées');
}

// Distribue les colonnes selon leur rôle (principal / autres / enonce).
function _agregerSeparerColonnes(cols) {
    var colPrincipal = null;
    var colsAutres = [];
    var colsEnonce = [];
    for (var c = 0; c < cols.length; c++) {
        if (cols[c].role === 'autres') colsAutres.push(cols[c]);
        else if (cols[c].role === 'enonce') colsEnonce.push(cols[c]);
        else colPrincipal = cols[c];
    }
    return { principal: colPrincipal, autres: colsAutres, enonce: colsEnonce };
}

// Comptabilise une distribution Likert4 sur un jeu de données.
// Retourne { distribution, nbReponses, scoreMoyen, nbNA }.
function _agregerLikertSurColonne(colIndex, donnees, inclureNA) {
    var labels = BILAN_REFLEXIF_DATA.ECHELLE_LIKERT4;
    var distrib = {};
    for (var l = 0; l < labels.length; l++) distrib[labels[l].label] = 0;
    var somme = 0, nbRep = 0, nbNA = 0;

    for (var r = 0; r < donnees.length; r++) {
        var val = (donnees[r][colIndex] || '').trim();
        if (!val) continue;
        if (inclureNA && _estNA(val)) {
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

    return {
        distribution: distrib,
        nbReponses: nbRep,
        scoreMoyen: nbRep > 0 ? Math.round((somme / nbRep) * 100) / 100 : 0,
        nbNA: nbNA
    };
}

function _agregerLikert(question, colsSep, donnees) {
    var result = { type: 'likert4', nbReponses: 0 };
    if (!colsSep.principal) return result;
    var agg = _agregerLikertSurColonne(colsSep.principal.indexColonne, donnees, question.inclureNA);
    result.distribution = agg.distribution;
    result.nbReponses = agg.nbReponses;
    result.scoreMoyen = agg.scoreMoyen;
    if (question.inclureNA) {
        result.inclureNA = true;
        result.nbNA = agg.nbNA;
    }
    return result;
}

function _agregerChoix(question, colsSep, donnees) {
    var result = { type: question.type, nbReponses: 0 };
    if (!colsSep.principal) {
        if (colsSep.autres.length > 0) result.autres = _collecterAutres(colsSep.autres, donnees);
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
        var v = (donnees[rr][colsSep.principal.indexColonne] || '').trim();
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
    if (colsSep.autres.length > 0) result.autres = _collecterAutres(colsSep.autres, donnees);
    return result;
}

function _agregerMatrix(question, colsSep, donnees) {
    var result = { type: 'matrix', nbReponses: 0 };
    var parEnonce = {}, libellesEn = {};
    if (question.enonces) {
        for (var ei = 0; ei < question.enonces.length; ei++) {
            libellesEn[question.enonces[ei].id] = question.enonces[ei].texte;
        }
    }
    var nbMax = 0;
    for (var ce = 0; ce < colsSep.enonce.length; ce++) {
        var col = colsSep.enonce[ce];
        if (!col.enonceId) continue;
        var agg = _agregerLikertSurColonne(col.indexColonne, donnees, false);
        parEnonce[col.enonceId] = {
            distribution: agg.distribution,
            scoreMoyen: agg.scoreMoyen,
            nbReponses: agg.nbReponses
        };
        if (agg.nbReponses > nbMax) nbMax = agg.nbReponses;
    }
    result.parEnonce = parEnonce;
    result.libellesEnonces = libellesEn;
    result.nbReponses = nbMax;
    return result;
}

function _agregerOuvert(colsSep, donnees) {
    var result = { type: 'ouvert', nbReponses: 0 };
    if (!colsSep.principal) return result;
    var reps = [];
    for (var ro = 0; ro < donnees.length; ro++) {
        var rep = (donnees[ro][colsSep.principal.indexColonne] || '').trim();
        if (rep) reps.push(rep);
    }
    result.reponses = reps;
    result.nbReponses = reps.length;
    return result;
}

function _agregerQuestion(question, cols, donnees) {
    var colsSep = _agregerSeparerColonnes(cols);

    switch (question.type) {
        case 'likert4': return _agregerLikert(question, colsSep, donnees);
        case 'choix_unique':
        case 'choix_multiple': return _agregerChoix(question, colsSep, donnees);
        case 'matrix': return _agregerMatrix(question, colsSep, donnees);
        case 'ouvert': return _agregerOuvert(colsSep, donnees);
    }
    return { type: question.type, nbReponses: 0 };
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
   API publique
   =============================== */

window.BilanReflexifCSV = {
    // Vue
    rendreImport: rendreImport,

    // Flux import
    declencherImport: declencherImport,
    chargerResultatsDemo: chargerResultatsDemo,
    modifierMapping: modifierMapping,
    annulerImport: annulerImport,
    confirmerImport: confirmerImport,

    // Pures exposées pour les tests de régression
    detecterSeparateur: detecterSeparateur,
    parserCSV: parserCSV,
    normaliserTexte: normaliserTexte,
    similitudeTexte: similitudeTexte,
    estColonneIgnoree: estColonneIgnoree,
    obtenirCiblesMapping: obtenirCiblesMapping,
    mapperColonnes: mapperColonnes,
    convertirLikert: convertirLikert,
    _agregerQuestion: _agregerQuestion,
    _estNA: _estNA,
    _splitMultiChoix: _splitMultiChoix,
    _trouverOptionParTexte: _trouverOptionParTexte
};

})();
