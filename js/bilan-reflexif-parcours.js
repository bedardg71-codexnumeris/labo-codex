/* ===============================
   MODULE: BILAN RÉFLEXIF — PARCOURS D'APPRENTISSAGE
   Sélection d'activités marquantes + questions par activité + émotions
   + questions transversales. PLAN-MOYEN-TERME §4.1.e.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js
   Charger AVANT : bilan-reflexif.js (résidu)

   Dépendances :
   - BilanReflexifCore : etat, genId, afficherToast, sauvegarderParcours
   - BILAN_REFLEXIF_DATA : TYPES_ACTIVITE, ECHELLE_EFFORT, QUESTIONS_TRANSVERSALES
   - Globaux projet : echapperHtml, db, window.cle, navigator (clipboard)
   =============================== */

(function() {
'use strict';

var etat = BilanReflexifCore.etat;
var genId = BilanReflexifCore.genId;
var afficherToast = BilanReflexifCore.afficherToast;
var sauvegarderParcours = BilanReflexifCore.sauvegarderParcours;
var rendreAideHTML = BilanReflexifCore.rendreAideHTML;

/* ===============================
   SECTION 3b : ÉDITEUR DU PARCOURS D'APPRENTISSAGE
   =============================== */

function rendreParcours() {
    var vue = document.getElementById('bilan-vue-parcours');
    if (!vue) return;

    var p = etat.parcours;
    var html = [];

    // Description d'introduction + recommandation
    html.push('<div class="bilan-info">');
    html.push('Cet outil recueille l\u2019exp\u00e9rience v\u00e9cue de l\u2019\u00e9tudiant\u00b7e \u00e0 travers les productions du trimestre. ');
    html.push('Pour chaque activit\u00e9 d\u2019apprentissage, l\u2019\u00e9tudiant\u00b7e situe son effort, ses \u00e9motions et les moments marquants de son parcours. ');
    html.push('Le portrait de groupe qui en \u00e9merge r\u00e9v\u00e8le les zones de friction, les moments de bascule et les r\u00e9ussites collectives.');
    html.push('<br><br>');
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
        '<li><strong>Pour chaque activit\u00e9, cr\u00e9e une section</strong> avec les questions ci-dessous.</li>' +
        '<li><strong>Ajoute les questions de synth\u00e8se</strong> en fin de formulaire.</li>' +
        '<li><strong>Configure l\u2019anonymat</strong> et distribue le lien.</li>' +
        '<li><strong>Exporte en CSV</strong> et importe dans l\u2019onglet \u00ab\u00a0Importer les r\u00e9sultats\u00a0\u00bb.</li>' +
        '</ol>'
    ));

    // === Questions posées pour chaque activité (éditables) ===
    var qpa = p.questionsParActivite || [];
    html.push('<div class="bilan-sous-titre">Questions pos\u00e9es pour chaque activit\u00e9 (' + qpa.filter(function(q) { return q.actif; }).length + ' actives)</div>');

    for (var qi = 0; qi < qpa.length; qi++) {
        html.push(rendreQuestionParActiviteHTML(qpa[qi], qi, p));
    }

    // Ajout d'une question personnalisée au bloc
    html.push('<div class="bilan-ajout-form">');
    html.push('<input type="text" class="bilan-ajout-input" id="bilan-qpa-input" placeholder="Ajouter une question par activit\u00e9\u2026">');
    html.push('<select class="bilan-ajout-select" id="bilan-qpa-type">');
    html.push('<option value="texte_libre">Texte libre</option>');
    html.push('<option value="choix_unique">Choix unique</option>');
    html.push('<option value="echelle5">\u00c9chelle 1-5</option>');
    html.push('</select>');
    html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterQuestionParActivite">Ajouter</button>');
    html.push('</div>');

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

    // === Questions transversales ===
    html.push('<div class="bilan-sous-titre">Questions de synth\u00e8se (fin du parcours)</div>');
    var qTrans = BILAN_REFLEXIF_DATA.QUESTIONS_TRANSVERSALES;
    for (var q = 0; q < qTrans.length; q++) {
        var qt = qTrans[q];
        var actifT = p.questionsTransversales[qt.id] !== false;
        html.push('<div class="bilan-transversale">');
        html.push('<button class="bilan-toggle' + (actifT ? ' actif' : '') + '" data-action="BilanReflexif.toggleTransversale" data-param="' + qt.id + '" title="' + (actifT ? 'D\u00e9sactiver' : 'Activer') + '"></button>');
        html.push('<span class="bilan-transversale-texte"' + (actifT ? '' : ' style="opacity:.45"') + '>' + echapperHtml(qt.texte) + '</span>');
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
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerModifActivite" title="Annuler"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon" style="width:12px;height:12px;"></button>');
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
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerActivite" data-param="' + activite.id + '" data-confirm="Supprimer cette activit\u00e9 ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
        html.push('</div>');
    }

    html.push('</div>');
    return html.join('');
}

// === Rendu des questions par activité ===

function rendreQuestionParActiviteHTML(question, index, parcours) {
    var html = [];
    var lettres = 'abcdefghijklmnopqrstuvwxyz';
    var lettre = index < lettres.length ? lettres[index] : (index + 1);

    // Type lisible
    var typeLabels = {
        'choix_unique': 'Choix unique',
        'echelle5': '\u00c9chelle 1-5',
        'choix_multiple': 'Choix multiples',
        'texte_libre': 'Texte libre'
    };
    var typeLabel = typeLabels[question.type] || question.type;

    html.push('<div class="bilan-question" style="' + (question.actif ? '' : 'opacity:.45') + '">');
    html.push('<button class="bilan-toggle' + (question.actif ? ' actif' : '') + '" data-action="BilanReflexif.toggleQuestionParActivite" data-param="' + question.id + '" style="align-self:center;flex-shrink:0"></button>');
    html.push('<span class="bilan-question-num">' + lettre + ')</span>');

    if (etat.questionEnEdition === question.id) {
        html.push('<input type="text" class="bilan-edit-input" id="bilan-edit-' + question.id + '" value="' + echapperHtml(question.texte) + '">');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.confirmerEditionQPA" data-param="' + question.id + '" title="Confirmer">\u2713</button>');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.annulerEdition" title="Annuler"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon" style="width:12px;height:12px;"></button>');
    } else {
        html.push('<span class="bilan-question-texte">' + echapperHtml(question.texte) + '</span>');
        html.push('<span class="bilan-question-type">' + echapperHtml(typeLabel) + '</span>');
        html.push('<div class="bilan-question-actions">');
        html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.editerQuestionQPA" data-param="' + question.id + '" title="Modifier">\u270E</button>');
        if (question.personnalisee) {
            html.push('<button class="bilan-btn-mini" data-action="BilanReflexif.supprimerQuestionParActivite" data-param="' + question.id + '" data-confirm="Supprimer cette question ?" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
        }
        html.push('</div>');
    }

    html.push('</div>');

    // Sous-question conditionnelle (ex: raison de non-complétion)
    if (question.sousQuestion && question.actif) {
        html.push('<div class="bilan-question" style="padding-left:52px;font-size:12px;color:var(--texte-secondaire)">');
        html.push('<span class="bilan-question-num">\u21B3</span>');
        html.push('<span class="bilan-question-texte" style="font-style:italic">' + echapperHtml(question.sousQuestion.texte));
        html.push(' <em>(si ' + question.sousQuestion.condition.join(' ou ') + ')</em></span>');
        html.push('<span class="bilan-question-type">Texte libre</span>');
        html.push('</div>');
    }

    // Choix pour choix_unique (afficher les options)
    if (question.type === 'choix_unique' && question.choix && question.actif) {
        html.push('<div class="bilan-preview-choix" style="padding-left:52px;margin-bottom:4px">');
        for (var c = 0; c < question.choix.length; c++) {
            html.push('<span class="bilan-preview-option">' + echapperHtml(question.choix[c]) + '</span>');
        }
        html.push('</div>');
    }

    // Échelle pour echelle5
    if (question.type === 'echelle5' && question.actif) {
        var echelle = BILAN_REFLEXIF_DATA.ECHELLE_EFFORT;
        html.push('<div class="bilan-preview-choix" style="padding-left:52px;margin-bottom:4px">');
        for (var ei = 0; ei < echelle.length; ei++) {
            html.push('<span class="bilan-preview-option">' + echapperHtml(echelle[ei].label) + '</span>');
        }
        html.push('</div>');
    }

    // Émotions pour choix_multiple (+ éditeur d'émotions intégré)
    if (question.type === 'choix_multiple' && question.actif) {
        html.push('<div style="padding-left:52px;margin-bottom:4px">');
        html.push('<div class="bilan-emotions-list">');
        for (var em = 0; em < parcours.emotionsDisponibles.length; em++) {
            html.push('<span class="bilan-emotion-tag">');
            html.push(echapperHtml(parcours.emotionsDisponibles[em]));
            html.push(' <button class="bilan-btn-mini" data-action="BilanReflexif.supprimerEmotion" data-param="' + em + '" title="Retirer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon" style="width:12px;height:12px;"></button>');
            html.push('</span>');
        }
        html.push('</div>');
        html.push('<div class="bilan-ajout-form">');
        html.push('<input type="text" class="bilan-ajout-input" id="bilan-emotion-input" placeholder="Ajouter une \u00e9motion\u2026" style="max-width:220px">');
        html.push('<button class="bilan-btn bilan-btn-secondaire" data-action="BilanReflexif.ajouterEmotion">Ajouter</button>');
        html.push('</div>');
        html.push('</div>');
    }

    return html.join('');
}

// === Actions questions par activité ===

function toggleQuestionParActivite(qpaId) {
    var qpa = etat.parcours.questionsParActivite;
    for (var i = 0; i < qpa.length; i++) {
        if (qpa[i].id === qpaId) {
            qpa[i].actif = !qpa[i].actif;
            break;
        }
    }
    sauvegarderParcours();
    rendreParcours();
}

function editerQuestionQPA(qpaId) {
    etat.questionEnEdition = qpaId;
    rendreParcours();
    setTimeout(function() {
        var input = document.getElementById('bilan-edit-' + qpaId);
        if (input) { input.focus(); input.select(); }
    }, 50);
}

function confirmerEditionQPA(qpaId) {
    var input = document.getElementById('bilan-edit-' + qpaId);
    if (!input || !input.value.trim()) return;
    var qpa = etat.parcours.questionsParActivite;
    for (var i = 0; i < qpa.length; i++) {
        if (qpa[i].id === qpaId) {
            qpa[i].texte = input.value.trim();
            break;
        }
    }
    etat.questionEnEdition = null;
    sauvegarderParcours();
    rendreParcours();
}

function ajouterQuestionParActivite() {
    var input = document.getElementById('bilan-qpa-input');
    var typeSelect = document.getElementById('bilan-qpa-type');
    if (!input || !input.value.trim()) return;

    etat.parcours.questionsParActivite.push({
        id: 'qpa_' + genId(),
        texte: input.value.trim(),
        type: typeSelect ? typeSelect.value : 'texte_libre',
        actif: true,
        obligatoire: false,
        personnalisee: true
    });

    sauvegarderParcours();
    rendreParcours();
}

function supprimerQuestionParActivite(qpaId) {
    var qpa = etat.parcours.questionsParActivite;
    for (var i = 0; i < qpa.length; i++) {
        if (qpa[i].id === qpaId) {
            qpa.splice(i, 1);
            break;
        }
    }
    sauvegarderParcours();
    rendreParcours();
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
        var titre = prod.titre || '';
        var descProd = prod.activiteApprentissage || prod.description;
        if (descProd) {
            titre = titre ? (titre + ' \u2014 ' + descProd) : descProd;
        }
        if (!titre) titre = prod.nom || ('Production ' + (i + 1));
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

    // Questions actives par activité
    var qpa = (p.questionsParActivite || []).filter(function(q) { return q.actif; });
    var lettres = 'abcdefghijklmnopqrstuvwxyz';
    var num = 1;

    // Par activité
    for (var i = 0; i < p.activites.length; i++) {
        var act = p.activites[i];
        lignes.push('--- ' + act.titre + ' ---');
        lignes.push('');

        for (var qi = 0; qi < qpa.length; qi++) {
            var question = qpa[qi];
            lignes.push(num + '. ' + question.texte);

            if (question.type === 'choix_unique' && question.choix) {
                for (var ci = 0; ci < question.choix.length; ci++) {
                    lignes.push(lettres[ci] + '. ' + question.choix[ci]);
                }
            } else if (question.type === 'echelle5') {
                var echelle = BILAN_REFLEXIF_DATA.ECHELLE_EFFORT;
                for (var ei = 0; ei < echelle.length; ei++) {
                    lignes.push(lettres[ei] + '. ' + echelle[ei].label);
                }
            } else if (question.type === 'choix_multiple') {
                for (var mi = 0; mi < p.emotionsDisponibles.length; mi++) {
                    lignes.push(lettres[mi] + '. ' + p.emotionsDisponibles[mi]);
                }
            }

            lignes.push('');
            num++;

            // Sous-question conditionnelle
            if (question.sousQuestion) {
                lignes.push(num + '. ' + question.sousQuestion.texte + ' (si ' + question.sousQuestion.condition.join(' ou ') + ')');
                lignes.push('');
                num++;
            }
        }
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
        lignes.push('');
        for (var t = 0; t < transActives.length; t++) {
            var qt = transActives[t];
            lignes.push(num + '. ' + qt.texte);
            if (qt.type === 'choix_multiple_ouvert' && qt.choix) {
                for (var cti = 0; cti < qt.choix.length; cti++) {
                    lignes.push(lettres[cti] + '. ' + qt.choix[cti]);
                }
            }
            lignes.push('');
            num++;
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

/* ===============================
   API publique
   =============================== */

window.BilanReflexifParcours = {
    // Rendu
    rendreParcours: rendreParcours,

    // Activités (CRUD)
    ajouterActivite: ajouterActivite,
    modifierActivite: modifierActivite,
    confirmerModifActivite: confirmerModifActivite,
    annulerModifActivite: annulerModifActivite,
    supprimerActivite: supprimerActivite,
    deplacerActivite: deplacerActivite,
    importerProductions: importerProductions,

    // Questions par activité
    toggleQuestionParActivite: toggleQuestionParActivite,
    editerQuestionQPA: editerQuestionQPA,
    confirmerEditionQPA: confirmerEditionQPA,
    ajouterQuestionParActivite: ajouterQuestionParActivite,
    supprimerQuestionParActivite: supprimerQuestionParActivite,

    // Émotions et transversales
    ajouterEmotion: ajouterEmotion,
    supprimerEmotion: supprimerEmotion,
    toggleTransversale: toggleTransversale,

    // Export texte
    exporterTexteParcours: exporterTexteParcours
};

})();
