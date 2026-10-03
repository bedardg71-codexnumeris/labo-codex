/* ===============================
   MODULE: BILAN RÉFLEXIF — RAPPORT D'ANALYSE + EXPORT PDF
   Vue d'ensemble, distributions Likert, choix unique/multiple/matrix/ouvert,
   graphiques Chart.js (global et bloc), synthèse forces/vigilances, export
   PDF avec jsPDF + autoTable. PLAN-MOYEN-TERME §4.1.g.

   Charger APRÈS : bilan-reflexif-data.js, bilan-reflexif-core.js
   Charger AVANT : bilan-reflexif.js (résidu — il hook afficherSection
                   pour appeler BilanReflexifRapport.detruireGraphiques)

   Dépendances :
   - BilanReflexifCore : etat (mute etat.graphiques + etat.resultats),
     CLE_RESULTATS, afficherToast, tronquer
   - BILAN_REFLEXIF_DATA : ECHELLE_LIKERT4, COULEURS_LIKERT
   - Libs externes : Chart (Chart.js), window.jspdf (jsPDF + autoTable),
     window.STYLE_GRAPHIQUE (config tooltip projet, optionnel)
   - Globaux projet : echapperHtml, db
   - window.BilanReflexif (lookup tardif) : rendreInterface, afficherVue
     — appelés par supprimerResultats pour rebuild la nav après suppression.

   Anti-patterns §5 surveillés :
   - §5.1 Ordre chargement : à respecter strictement.
   - §5.5 État pivot etat.graphiques : ce module est le seul à écrire dedans.
   =============================== */

(function() {
'use strict';

var etat = BilanReflexifCore.etat;
var afficherToast = BilanReflexifCore.afficherToast;
var tronquer = BilanReflexifCore.tronquer;
var CLE_RESULTATS = BilanReflexifCore.CLE_RESULTATS;

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
    html.push('<button class="bilan-btn bilan-btn-danger" data-action="BilanReflexif.supprimerResultats">Supprimer les r\u00e9sultats</button>');
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

/**
 * « Supprimer les résultats ». #1007 (2a-2) : la question est posée ICI, après le codex
 * proposé, aux mots d'avant ; elle l'était par le dispatcher (`data-confirm`, synchrone).
 * Rien de lu n'est réécrit : la clé est retirée.
 */
async function supprimerResultats() {
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('resultatsBilan'))) return;
    if (!confirm('Supprimer les r\u00e9sultats import\u00e9s ?')) return;
    etat.resultats = null;
    db.removeSync(CLE_RESULTATS());
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(CLE_RESULTATS());   // lot F : geste hors témoin (supprimer les résultats)
    detruireGraphiques();
    BilanReflexif.rendreInterface();
    BilanReflexif.afficherVue('editeur');
    afficherToast('R\u00e9sultats supprim\u00e9s');
}

/* ===============================
   SECTION 6 : EXPORT PDF
   =============================== */

// Couleurs PDF (RGB)
var _PDF_BLEU_TITRE = [3, 46, 92];
var _PDF_GRIS_META = [102, 102, 102];
var _PDF_GRIS_TEXTE = [51, 51, 51];
var _PDF_VERT_SUCCES = [52, 199, 89];
var _PDF_ROUGE_ERREUR = [232, 64, 87];

function _pdfEnteteEtVueEnsemble(doc, q, res, ctx) {
    doc.setFontSize(20);
    doc.setTextColor.apply(doc, _PDF_BLEU_TITRE);
    doc.setFont('helvetica', 'bold');
    doc.text('Bilan réflexif', ctx.marges.gauche, ctx.posY);
    ctx.posY += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor.apply(doc, _PDF_GRIS_META);
    doc.text(q.titre, ctx.marges.gauche, ctx.posY);
    ctx.posY += 6;
    doc.text('Importé le ' + new Date(res.dateImport).toLocaleDateString('fr-CA') + ' — ' + res.nbRepondants + ' répondants', ctx.marges.gauche, ctx.posY);
    ctx.posY += 4;

    doc.setDrawColor.apply(doc, _PDF_BLEU_TITRE);
    doc.setLineWidth(0.5);
    doc.line(ctx.marges.gauche, ctx.posY, ctx.largeurPage - ctx.marges.droite, ctx.posY);
    ctx.posY += 10;

    var stats = calculerVueEnsemble(res, q);
    doc.setFontSize(14);
    doc.setTextColor.apply(doc, _PDF_BLEU_TITRE);
    doc.setFont('helvetica', 'bold');
    doc.text('Vue d’ensemble', ctx.marges.gauche, ctx.posY);
    ctx.posY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor.apply(doc, _PDF_GRIS_TEXTE);
    doc.text('Score moyen global : ' + stats.scoreGlobal.toFixed(2) + ' / 4', ctx.marges.gauche, ctx.posY);
    ctx.posY += 5;
    doc.text('Taux de réponses favorables : ' + stats.tauxFavorable + '%', ctx.marges.gauche, ctx.posY);
    ctx.posY += 5;
    doc.text('Questions analysées : ' + stats.nbQuestionsRepondues, ctx.marges.gauche, ctx.posY);
    ctx.posY += 12;
}

function _pdfRendreTableLikert(doc, questionsLikert, res, ctx) {
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
        startY: ctx.posY,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: _PDF_BLEU_TITRE, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: _PDF_GRIS_TEXTE },
        columnStyles: {
            0: { cellWidth: ctx.largeurContenu * 0.35 },
            5: { fontStyle: 'bold', halign: 'center' }
        },
        margin: { left: ctx.marges.gauche, right: ctx.marges.droite },
        didParseCell: function(data) {
            if (data.section === 'body') {
                var col = data.column.index;
                if (col >= 1 && col <= 4) data.cell.styles.halign = 'center';
            }
        }
    });

    ctx.posY = doc.lastAutoTable.finalY + 5;
}

function _pdfRendreReponsesOuvertes(doc, questionsOuvertes, res, ctx) {
    for (var ro = 0; ro < questionsOuvertes.length; ro++) {
        var qOuv = questionsOuvertes[ro];
        var repOuv = res.reponses[qOuv.id];
        if (!repOuv || !repOuv.reponses || repOuv.reponses.length === 0) continue;

        if (ctx.posY > 240) { doc.addPage(); ctx.posY = ctx.marges.haut; }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor.apply(doc, _PDF_GRIS_META);
        doc.text(tronquer(qOuv.texte, 80) + ' (' + repOuv.nbReponses + ' réponses)', ctx.marges.gauche, ctx.posY);
        ctx.posY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor.apply(doc, _PDF_GRIS_TEXTE);
        for (var rr = 0; rr < repOuv.reponses.length; rr++) {
            if (ctx.posY > 250) { doc.addPage(); ctx.posY = ctx.marges.haut; }
            var lignes = doc.splitTextToSize('• ' + repOuv.reponses[rr], ctx.largeurContenu - 5);
            doc.setFontSize(8);
            doc.text(lignes, ctx.marges.gauche + 3, ctx.posY);
            ctx.posY += lignes.length * 3.5 + 1;
        }
        ctx.posY += 3;
    }
}

function _pdfDessinerBloc(doc, bloc, res, ctx) {
    var questionsLikert = [];
    var questionsOuvertes = [];
    for (var j = 0; j < bloc.questions.length; j++) {
        var qb = bloc.questions[j];
        if (!res.reponses[qb.id]) continue;
        if (qb.type === 'likert4') questionsLikert.push(qb);
        else questionsOuvertes.push(qb);
    }
    if (questionsLikert.length === 0 && questionsOuvertes.length === 0) return;

    if (ctx.posY > 230) {
        doc.addPage();
        ctx.posY = ctx.marges.haut;
    }

    doc.setFontSize(12);
    doc.setTextColor.apply(doc, _PDF_BLEU_TITRE);
    doc.setFont('helvetica', 'bold');
    doc.text(bloc.titre, ctx.marges.gauche, ctx.posY);
    ctx.posY += 3;

    if (questionsLikert.length > 0) {
        var scoreBloc = calculerScoreBloc(questionsLikert, res);
        var signaux = calculerSignaux(questionsLikert, res);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor.apply(doc, _PDF_GRIS_META);
        var infoBloc = 'Score moyen : ' + scoreBloc.moyenne.toFixed(2) + '/4';
        if (signaux.fort) infoBloc += ' — Signal fort (' + signaux.tauxFavorable + '% favorables)';
        if (signaux.faible) infoBloc += ' — Signal faible (' + signaux.tauxDefavorable + '% défavorables)';
        doc.text(infoBloc, ctx.marges.gauche, ctx.posY);
        ctx.posY += 5;

        _pdfRendreTableLikert(doc, questionsLikert, res, ctx);
    }

    _pdfRendreReponsesOuvertes(doc, questionsOuvertes, res, ctx);

    ctx.posY += 5;
}

function _pdfCollecterForcesEtVigilances(q, res) {
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
        if (sb.moyenne < 2.5 || sig.faible) vigilances.push(blocS.titre + ' (' + sb.moyenne.toFixed(2) + '/4, ' + sig.tauxDefavorable + '% défav.)');
    }
    return { forces: forces, vigilances: vigilances };
}

function _pdfDessinerListePuces(doc, items, ctx) {
    for (var i = 0; i < items.length; i++) {
        doc.text('• ' + items[i], ctx.marges.gauche + 3, ctx.posY);
        ctx.posY += 5;
    }
}

function _pdfDessinerSynthese(doc, q, res, ctx) {
    if (ctx.posY > 220) { doc.addPage(); ctx.posY = ctx.marges.haut; }

    doc.setFontSize(14);
    doc.setTextColor.apply(doc, _PDF_BLEU_TITRE);
    doc.setFont('helvetica', 'bold');
    doc.text('Synthèse', ctx.marges.gauche, ctx.posY);
    ctx.posY += 8;

    var fv = _pdfCollecterForcesEtVigilances(q, res);

    doc.setFontSize(10);
    if (fv.forces.length > 0) {
        doc.setTextColor.apply(doc, _PDF_VERT_SUCCES);
        doc.setFont('helvetica', 'bold');
        doc.text('Forces identifiées :', ctx.marges.gauche, ctx.posY);
        ctx.posY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor.apply(doc, _PDF_GRIS_TEXTE);
        _pdfDessinerListePuces(doc, fv.forces, ctx);
        ctx.posY += 3;
    }

    if (fv.vigilances.length > 0) {
        doc.setTextColor.apply(doc, _PDF_ROUGE_ERREUR);
        doc.setFont('helvetica', 'bold');
        doc.text('Zones de vigilance :', ctx.marges.gauche, ctx.posY);
        ctx.posY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor.apply(doc, _PDF_GRIS_TEXTE);
        _pdfDessinerListePuces(doc, fv.vigilances, ctx);
    }
}

function _pdfDessinerPiedPage(doc, q, ctx) {
    var nbPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= nbPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Bilan réflexif — ' + q.titre, ctx.marges.gauche, 267);
        doc.text('Page ' + p + '/' + nbPages, ctx.largeurPage - ctx.marges.droite, 267, { align: 'right' });
    }
}

function exporterPDF() {
    if (!etat.resultats || !etat.questionnaire) return;

    try {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

        var ctx = {
            marges: { haut: 15, bas: 15, gauche: 15, droite: 15 },
            largeurPage: 215.9,
            largeurContenu: 215.9 - 15 - 15,
            posY: 15
        };
        var res = etat.resultats;
        var q = etat.questionnaire;

        _pdfEnteteEtVueEnsemble(doc, q, res, ctx);

        for (var i = 0; i < q.blocs.length; i++) {
            var bloc = q.blocs[i];
            if (!bloc.actif) continue;
            _pdfDessinerBloc(doc, bloc, res, ctx);
        }

        _pdfDessinerSynthese(doc, q, res, ctx);
        _pdfDessinerPiedPage(doc, q, ctx);

        var nomFichier = 'bilan-reflexif-' + new Date().toISOString().slice(0, 10) + '.pdf';
        doc.save(nomFichier);
        afficherToast('PDF exporté : ' + nomFichier);

    } catch (err) {
        console.error('[BilanReflexif] Erreur export PDF:', err);
        afficherToast('Erreur lors de l’export PDF');
    }
}


/* ===============================
   API publique
   =============================== */

window.BilanReflexifRapport = {
    // Rendu
    rendreRapport: rendreRapport,

    // Cycle de vie des graphiques (hook depuis le résidu sur afficherSection)
    detruireGraphiques: detruireGraphiques,

    // Actions utilisateur
    supprimerResultats: supprimerResultats,
    exporterPDF: exporterPDF
};

})();
