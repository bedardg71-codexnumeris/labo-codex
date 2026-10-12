/**
 * MODULE IMPACT DES JETONS — Comparaison P avec/sans jetons de reprise
 *
 * Graphique tableau de bord : 2 courbes de moyennes comparatives
 * - Moy. P « avec jetons » : étudiants ayant utilisé ≥1 jeton reprise
 * - Moy. P « sans jetons » : étudiants n'ayant jamais utilisé de jeton reprise
 *
 * Marqueurs : ☐ = sans jeton, ◼ = séance avec jeton appliqué
 *
 * Le détail individuel (P sans reprises, embranchement) est dans le profil
 * via genererPSansReprises() exporté pour graphiques-progression.js.
 *
 * @author Grégoire Bédard
 * @date 21 mars 2026
 * @version 1.1.0
 */

(function() {
'use strict';

/* ===============================
   CONFIGURATION
   =============================== */

var COULEUR_AVEC_JETONS = '#FF9800';   // Orange — groupe avec jetons
var COULEUR_SANS_JETONS = '#4FC3F7';   // Bleu clair — groupe sans jetons

/* ===============================
   CALCUL DES DONNÉES (tableau de bord)
   =============================== */

/**
 * Calcule les moyennes P comparatives avec/sans jetons.
 * @returns {Object|null} Données structurées pour le graphique
 */
function calculerImpactJetons() {
    var snapshots = [];
    try {
        snapshots = (window.LaboCodexData && typeof window.LaboCodexData.lireSnapshotsHebdomadaires === 'function')
            ? window.LaboCodexData.lireSnapshotsHebdomadaires()
            : obtenirSnapshotsHebdomadaires();
    } catch (e) {
        console.warn('⚠️ Impact jetons : snapshots non disponibles', e);
        return null;
    }

    if (!snapshots || snapshots.length < 2) return null;

    snapshots.sort(function(a, b) { return (a.numSemaine || 0) - (b.numSemaine || 0); });

    var evaluations = [];
    try {
        evaluations = (window.LaboCodexData && typeof window.LaboCodexData.lireDonneesNamespacees === 'function')
            ? window.LaboCodexData.lireDonneesNamespacees('evaluationsSauvegardees') || []
            : (typeof obtenirDonneesSelonMode === 'function'
                ? obtenirDonneesSelonMode('evaluationsSauvegardees') || []
                : []);
    } catch (e) {
        return null;
    }

    // Identifier les étudiants ayant utilisé des jetons de reprise
    var dasAvecJetons = {};
    evaluations.forEach(function(e) {
        if (!e.remplaceeParId &&
            (e.jetonRepriseApplique || e.repriseDeId ||
             e.jetonRepriseCibleeApplique || e.repriseDeIdCiblee)) {
            if (e.etudiantDA) dasAvecJetons[e.etudiantDA] = true;
        }
    });

    var nbAvecJetons = Object.keys(dasAvecJetons).length;

    // Indexer les jetons par index de séance (pour marqueurs ◼)
    var jetonsParIndex = {};
    evaluations.forEach(function(ev) {
        if (ev.remplaceeParId) return;
        if (!(ev.jetonRepriseApplique || ev.repriseDeId ||
              ev.jetonRepriseCibleeApplique || ev.repriseDeIdCiblee)) return;

        var origId = ev.repriseDeId || ev.repriseDeIdCiblee;
        var originale = origId ? evaluations.find(function(e) { return e.id === origId; }) : null;

        var productions = (window.LaboCodexData && typeof window.LaboCodexData.lireDonneesNamespacees === 'function')
            ? window.LaboCodexData.lireDonneesNamespacees('productions') || []
            : (typeof obtenirDonneesSelonMode === 'function'
                ? obtenirDonneesSelonMode('productions') || []
                : []);
        var prod = productions.find(function(p) { return p.id === ev.productionId; });
        var dateEcheance = '';
        if (prod) {
            if (typeof obtenirEcheanceEffective === 'function') {
                var infoCours = (window.LaboCodexData && typeof window.LaboCodexData.lireInfoCours === 'function')
                    ? window.LaboCodexData.lireInfoCours()
                    : db.getSync('infoCours', null);
                var gcId = obtenirIdContexteActif(infoCours);
                dateEcheance = obtenirEcheanceEffective(prod, gcId).date || '';
            } else {
                dateEcheance = prod.dateEcheance || '';
            }
        }
        if (!dateEcheance) return;
        var dateEchNorm = dateEcheance.substring(0, 10);

        // Trouver l'index de séance
        var idxSeance = -1;
        for (var si2 = 0; si2 < snapshots.length; si2++) {
            var ds2 = snapshots[si2].dateSeance || '';
            if (ds2 && ds2 <= dateEchNorm) idxSeance = si2;
            else if (ds2 > dateEchNorm) break;
        }
        for (var si3 = 0; si3 < snapshots.length; si3++) {
            if (snapshots[si3].dateSeance === dateEchNorm) { idxSeance = si3; break; }
        }
        if (idxSeance >= 0) {
            if (!jetonsParIndex[idxSeance]) jetonsParIndex[idxSeance] = [];
            jetonsParIndex[idxSeance].push({
                production: prod ? (prod.titre || prod.activiteApprentissage || prod.description || '') : '',
                noteOriginale: originale ? originale.noteFinale : null,
                noteReprise: ev.noteFinale,
                type: ev.jetonRepriseCibleeApplique ? 'repriseCiblee' : 'reprise'
            });
        }
    });

    // Calculer les moyennes P par groupe à chaque séance
    var labels = [];
    var dates = [];
    var moyPAvecJetons = [];
    var moyPSansJetons = [];

    for (var s = 0; s < snapshots.length; s++) {
        labels.push('Sem. ' + snapshots[s].numSemaine);
        dates.push(snapshots[s].dateSeance || '');

        var etus = snapshots[s].etudiants || [];
        var somAvec = 0, nbA = 0;
        var somSans = 0, nbS = 0;

        for (var ei = 0; ei < etus.length; ei++) {
            var etu = etus[ei];
            if (etu.P == null || isNaN(etu.P)) continue;
            if (dasAvecJetons[etu.da]) { somAvec += etu.P; nbA++; }
            else { somSans += etu.P; nbS++; }
        }

        moyPAvecJetons.push(nbA > 0 ? Math.round(somAvec / nbA * 10) / 10 : null);
        moyPSansJetons.push(nbS > 0 ? Math.round(somSans / nbS * 10) / 10 : null);
    }

    var nbSansJetons = 0;
    var dernierSnapshot = snapshots[snapshots.length - 1];
    if (dernierSnapshot && dernierSnapshot.etudiants) {
        dernierSnapshot.etudiants.forEach(function(e) {
            if (!dasAvecJetons[e.da] && e.P != null) nbSansJetons++;
        });
    }

    return {
        labels: labels,
        dates: dates,
        moyPAvecJetons: moyPAvecJetons,
        moyPSansJetons: moyPSansJetons,
        jetonsParIndex: jetonsParIndex,
        nbAvecJetons: nbAvecJetons,
        nbSansJetons: nbSansJetons
    };
}

/* ===============================
   CALCUL « P SANS REPRISES » (profil individuel)
   =============================== */

/**
 * #241 — les écarts de note de chaque reprise d'un élève (reprise − originale), rangés à la séance
 * de l'échéance de leur production. Partagé par le profil et les courbes d'intervention.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Array<string>} datesSeances - dates des séances (AAAA-MM-JJ), dans l'ordre
 * @returns {{deltas:Array<{indexSeance:number, delta:number}>, nbEvals:number}|null} - null sans reprise qui change la note
 */
function deltasReprisesParSeance(da, datesSeances) {
    var evaluations = [];
    var productions = [];
    try {
        evaluations = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('evaluationsSauvegardees') || [] : [];
        productions = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions') || [] : [];
    } catch (e) { return null; }

    // Trouver les reprises de cet étudiant
    var reprises = evaluations.filter(function(e) {
        return e.etudiantDA === da && !e.remplaceeParId &&
               (e.jetonRepriseApplique || e.repriseDeId ||
                e.jetonRepriseCibleeApplique || e.repriseDeIdCiblee);
    });

    if (reprises.length === 0) return null;

    // Compter les évaluations actives pour cet étudiant
    var nbEvals = 0;
    evaluations.forEach(function(e) {
        if (e.etudiantDA === da && !e.remplaceeParId && e.noteFinale != null) nbEvals++;
    });
    if (nbEvals === 0) nbEvals = 1;

    // Calculer les deltas par index de séance
    var deltasParIndex = []; // [{ indexSeance, delta }]
    reprises.forEach(function(ev) {
        var origId = ev.repriseDeId || ev.repriseDeIdCiblee;
        var originale = origId ? evaluations.find(function(e) { return e.id === origId; }) : null;
        if (!originale || originale.noteFinale == null || ev.noteFinale == null) return;
        var delta = ev.noteFinale - originale.noteFinale;
        if (delta === 0) return;

        // Trouver la date d'échéance de la production
        var prod = productions.find(function(p) { return p.id === ev.productionId; });
        var dateEcheance = '';
        if (prod) {
            if (typeof obtenirEcheanceEffective === 'function') {
                var infoCours = db.getSync('infoCours', null);
                var gcId = obtenirIdContexteActif(infoCours);
                dateEcheance = obtenirEcheanceEffective(prod, gcId).date || '';
            } else {
                dateEcheance = prod.dateEcheance || '';
            }
        }
        if (!dateEcheance) return;
        var dateEchNorm = dateEcheance.substring(0, 10);

        var idxSeance = -1;
        for (var i = 0; i < datesSeances.length; i++) {
            if (datesSeances[i] && datesSeances[i] <= dateEchNorm) idxSeance = i;
            else if (datesSeances[i] > dateEchNorm) break;
        }
        for (var j = 0; j < datesSeances.length; j++) {
            if (datesSeances[j] === dateEchNorm) { idxSeance = j; break; }
        }

        if (idxSeance >= 0) {
            deltasParIndex.push({ indexSeance: idxSeance, delta: delta });
        }
    });

    if (deltasParIndex.length === 0) return null;
    deltasParIndex.sort(function(a, b) { return a.indexSeance - b.indexSeance; });
    return { deltas: deltasParIndex, nbEvals: nbEvals };
}

/**
 * #241 (lot 11, 11 oct. 2026) — l'écart cumulé des reprises à la séance `s`, en points de P (0-100) :
 * la somme des (note de la reprise − note de l'originale) dont l'échéance est atteinte, répartie
 * sur les évaluations actives de l'élève. 0 avant la première.
 * @param {{deltas:Array, nbEvals:number}|null} info - rendu de `deltasReprisesParSeance`
 * @param {number} s - index de séance
 * @returns {number}
 */
function ecartReprisesALaSeance(info, s) {
    if (!info) return 0;
    var cumul = 0;
    for (var d = 0; d < info.deltas.length; d++) {
        if (info.deltas[d].indexSeance <= s) cumul += info.deltas[d].delta;
    }
    return cumul / info.nbEvals;
}

/**
 * Calcule la courbe « P sans reprises » pour un étudiant.
 * Embranchement pointillé à partir du premier jeton de reprise.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {Array} snapshots - Snapshots avec dateSeance
 * @param {Array} donneesP - Tableau de valeurs P (0-1, avec offset) du graphique individuel
 * @returns {Array|null} - Tableau parallèle à donneesP (null avant le premier jeton), ou null si pas de jetons
 */
function genererPSansReprises(da, snapshots, donneesP) {
    // #241 : le calcul des écarts est partagé avec les courbes d'intervention (correlations-longitudinales.js).
    var info = deltasReprisesParSeance(da, snapshots.map(function(s) { return s.dateSeance || ''; }));
    if (!info) return null;
    var deltasParIndex = info.deltas;
    var nbEvals = info.nbEvals;

    var premierIdx = deltasParIndex[0].indexSeance;

    // Construire la courbe : null avant le premier jeton, P ajusté après
    // donneesP est en échelle 0-1 (avec offset), delta est en échelle 0-100
    var resultat = [];
    for (var s = 0; s < donneesP.length; s++) {
        if (s < premierIdx || donneesP[s] == null) {
            resultat.push(null);
        } else {
            // Convertir l'écart (0-100) en échelle du graphique (0-1)
            var pSans = donneesP[s] - (ecartReprisesALaSeance(info, s) / 100);
            resultat.push(pSans);
        }
    }

    return resultat;
}

/* ===============================
   GRAPHIQUE CHART.JS (tableau de bord)
   =============================== */

var graphiqueImpactJetonsInstance = null;

/**
 * Crée le graphique d'impact des jetons (2 courbes de moyennes).
 * @param {string} canvasId - ID du canvas HTML
 */
function creerGraphiqueImpactJetons(canvasId) {
    try {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (graphiqueImpactJetonsInstance) {
            graphiqueImpactJetonsInstance.destroy();
            graphiqueImpactJetonsInstance = null;
        }
        var existant = Chart.getChart(canvas);
        if (existant) existant.destroy();

        // Codex data en mode « tous fusionnés » : pas pertinent (calendriers différents)
        if (window.LaboCodexData && window.LaboCodexData.modeConsultation() === 'codex-data-tous') {
            if (typeof afficherMessageAttente === 'function') {
                afficherMessageAttente(canvas,
                    'Sélectionne un groupe-cours',
                    'L’impact des jetons se calcule par groupe-cours (calendriers et cohortes différents).');
            }
            return;
        }

        var donnees = calculerImpactJetons();
        if (!donnees || donnees.labels.length < 2) {
            if (typeof afficherMessageAttente === 'function') {
                afficherMessageAttente(canvas, 'Données insuffisantes', 'Au moins 2 semaines de relevés nécessaires');
            }
            return;
        }

        var carte = document.getElementById('carte-impact-jetons');
        if (donnees.nbAvecJetons === 0) {
            if (carte) carte.style.display = 'none';
            return;
        }
        if (carte) carte.style.display = '';

        var ctx = canvas.getContext('2d');
        var estModeClair = document.body.classList.contains('mode-clair');
        var couleurTexte = estModeClair ? '#333' : '#b0c4d0';
        var couleurGrille = estModeClair ? 'rgba(3, 46, 92, 0.08)' : 'rgba(106, 172, 184, 0.08)';

        var nbPoints = donnees.labels.length;

        // Styles de points : ☐ vide normal, ◼ plein si jeton
        function mkPointStyles() {
            var styles = [], radii = [], bgsAvec = [], bgsSans = [];
            for (var i = 0; i < nbPoints; i++) {
                var aJeton = !!donnees.jetonsParIndex[i];
                styles.push('rect');
                radii.push(aJeton ? 6 : 4);
                bgsAvec.push(aJeton ? COULEUR_AVEC_JETONS : 'transparent');
                bgsSans.push('transparent');
            }
            return { styles: styles, radii: radii, bgsAvec: bgsAvec, bgsSans: bgsSans };
        }
        var pts = mkPointStyles();

        var datasets = [
            {
                label: 'P avec jetons (n=' + donnees.nbAvecJetons + ')',
                data: donnees.moyPAvecJetons,
                borderColor: COULEUR_AVEC_JETONS,
                backgroundColor: COULEUR_AVEC_JETONS,
                borderWidth: 2.5,
                tension: 0.25,
                pointStyle: pts.styles.slice(),
                pointRadius: pts.radii.slice(),
                pointHoverRadius: 7,
                pointBackgroundColor: pts.bgsAvec,
                pointBorderColor: COULEUR_AVEC_JETONS,
                pointBorderWidth: 2,
                spanGaps: true
            },
            {
                label: 'P sans jetons (n=' + donnees.nbSansJetons + ')',
                data: donnees.moyPSansJetons,
                borderColor: COULEUR_SANS_JETONS,
                backgroundColor: COULEUR_SANS_JETONS,
                borderWidth: 2.5,
                tension: 0.25,
                pointStyle: 'rect',
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: 'transparent',
                pointBorderColor: COULEUR_SANS_JETONS,
                pointBorderWidth: 2,
                spanGaps: true
            }
        ];

        var tooltipCallbacks = {
            title: function(tooltipItems) {
                var idx = tooltipItems[0].dataIndex;
                var label = donnees.labels[idx] || '';
                var date = donnees.dates[idx] || '';
                return label + (date ? ' (' + date + ')' : '');
            },
            label: function(context) {
                var val = context.parsed.y;
                var pctStr = val != null ? val.toFixed(1).replace('.', ',') + '%' : '—';
                return ' ' + context.dataset.label + ' : ' + pctStr;
            },
            afterBody: function(tooltipItems) {
                var idx = tooltipItems[0].dataIndex;
                var lignes = [];
                var jetonsSeance = donnees.jetonsParIndex[idx];
                if (jetonsSeance && jetonsSeance.length > 0) {
                    lignes.push('');
                    lignes.push('◼ Jetons appliqués :');
                    for (var ji = 0; ji < jetonsSeance.length; ji++) {
                        var j = jetonsSeance[ji];
                        var typeLabel = j.type === 'repriseCiblee' ? 'Reprise ciblée' : 'Reprise';
                        var noteInfo = '';
                        if (j.noteOriginale != null && j.noteReprise != null) {
                            var diff = j.noteReprise - j.noteOriginale;
                            noteInfo = ' : ' + j.noteOriginale.toFixed(0) + '% → ' + j.noteReprise.toFixed(0) + '%' +
                                ' (' + (diff >= 0 ? '+' : '') + diff.toFixed(0) + ')';
                        }
                        lignes.push('  ' + typeLabel + noteInfo);
                        if (j.production) lignes.push('  ' + j.production);
                    }
                }
                return lignes;
            }
        };

        var config = {
            type: 'line',
            data: { labels: donnees.labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: false },
                    legend: { display: false },
                    tooltip: Object.assign({}, (window.STYLE_GRAPHIQUE && window.STYLE_GRAPHIQUE.tooltip) || {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff', bodyColor: '#fff',
                        cornerRadius: 6, padding: 10
                    }, {
                        mode: 'index', intersect: false,
                        callbacks: tooltipCallbacks
                    })
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Séance', color: couleurTexte, font: { size: 12, weight: 'bold' } },
                        ticks: { color: couleurTexte, maxRotation: 45, minRotation: 45, font: { size: 10 } },
                        grid: { display: true, color: couleurGrille }
                    },
                    y: {
                        title: { display: true, text: 'Performance (%)', color: couleurTexte, font: { size: 12, weight: 'bold' } },
                        ticks: { color: couleurTexte, callback: function(val) { return val.toFixed(0) + '%'; } },
                        grid: { display: true, color: couleurGrille }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        };

        graphiqueImpactJetonsInstance = new Chart(ctx, config);

        // Description
        var desc = document.getElementById('impact-jetons-description');
        if (desc) {
            desc.textContent = donnees.nbAvecJetons + ' étudiant' + (donnees.nbAvecJetons > 1 ? 's' : '') +
                ' avec jeton' + (donnees.nbAvecJetons > 1 ? 's' : '') + ' de reprise, ' +
                donnees.nbSansJetons + ' sans, sur ' + donnees.labels.length + ' semaines.';
        }



    } catch (e) {
        console.error('❌ Erreur création graphique impact jetons:', e);
    }
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.creerGraphiqueImpactJetons = creerGraphiqueImpactJetons;
window.calculerImpactJetons = calculerImpactJetons;
window.genererPSansReprises = genererPSansReprises;
window.deltasReprisesParSeance = deltasReprisesParSeance;   // #241
window.ecartReprisesALaSeance = ecartReprisesALaSeance;   // #241

})();
