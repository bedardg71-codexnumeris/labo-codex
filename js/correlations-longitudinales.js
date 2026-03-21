/**
 * MODULE CORRÉLATIONS LONGITUDINALES - Portrait dynamique des corrélations (V1)
 *
 * Graphique Chart.js montrant l'évolution de r(X↔P) semaine par semaine :
 * - r(A,P) : Assiduité ↔ Performance
 * - r(C,P) : Complétion ↔ Performance
 * - r(E,P) : Engagement ↔ Performance
 * - r(Interv,P) : Interventions cumulatives ↔ Performance
 *
 * Données : obtenirSnapshotsHebdomadaires() + obtenirInterventions()
 * Corrélation : calculerCorrelationPearson(x, y)
 *
 * @author Grégoire Bédard
 * @date 21 mars 2026
 * @version 1.0.0
 */

(function() {
'use strict';

/* ===============================
   CONFIGURATION
   =============================== */

var COULEURS_CORR = {
    AP:      '#4FC3F7',  // Bleu clair
    CP:      '#FF7043',  // Orange
    EP:      '#AB47BC',  // Violet
    IntervP: '#78909C'   // Gris-bleu
};

var SEUIL_MIN_ETUDIANTS = 5;

/* ===============================
   CALCUL DES CORRÉLATIONS
   =============================== */

/**
 * Calcule les corrélations longitudinales semaine par semaine.
 * @returns {Object|null} Données structurées pour le graphique, ou null si insuffisantes
 */
function calculerCorrelationsLongitudinales() {
    var snapshots = [];
    try {
        snapshots = obtenirSnapshotsHebdomadaires();
    } catch (e) {
        console.warn('⚠️ Corrélations longitudinales : snapshots non disponibles', e);
        return null;
    }

    if (!snapshots || snapshots.length < 2) return null;

    // Trier par numSemaine
    snapshots.sort(function(a, b) { return a.numSemaine - b.numSemaine; });

    // Dédupliquer par semaine (garder le dernier snapshot si >1 par semaine)
    var parSemaine = {};
    for (var i = 0; i < snapshots.length; i++) {
        var snap = snapshots[i];
        parSemaine[snap.numSemaine] = snap;
    }

    var semainesUniques = Object.keys(parSemaine).map(Number).sort(function(a, b) { return a - b; });

    // Charger les interventions et pré-construire une Map(da → [{date}])
    var interventions = [];
    try {
        interventions = obtenirInterventions() || [];
    } catch (e) {
        console.warn('⚠️ Interventions non disponibles pour corrélations', e);
    }

    var interventionsParDA = {};
    for (var j = 0; j < interventions.length; j++) {
        var interv = interventions[j];
        if (!interv.etudiants) continue;
        for (var k = 0; k < interv.etudiants.length; k++) {
            var da = interv.etudiants[k];
            if (!interventionsParDA[da]) interventionsParDA[da] = [];
            interventionsParDA[da].push({
                date: interv.date,
                type: interv.type,
                titre: interv.titre
            });
        }
    }

    // Collecter les événements d'intervention par semaine
    var evenementsInterventions = [];
    var interventionsVues = {};

    // Résultat
    var resultat = {
        semaines: [],
        labels: [],
        dates: [],
        correlations: { AP: [], CP: [], EP: [], IntervP: [] },
        n: [],
        evenementsInterventions: []
    };

    for (var s = 0; s < semainesUniques.length; s++) {
        var numSem = semainesUniques[s];
        var snapshot = parSemaine[numSem];
        var etudiants = snapshot.etudiants || [];
        var dateSeance = snapshot.dateSeance || snapshot.dateDebut || '';
        var dateRef = dateSeance.substring(0, 10); // YYYY-MM-DD

        resultat.semaines.push(numSem);
        resultat.labels.push('S' + numSem);
        resultat.dates.push(dateRef);

        // Extraire valeurs A, C, P pour étudiants valides
        var valeursA = [], valeursC = [], valeursP = [], valeursE = [], valeursInterv = [];
        var dasValides = [];

        for (var e = 0; e < etudiants.length; e++) {
            var etu = etudiants[e];
            if (etu.A == null || etu.C == null || etu.P == null) continue;
            if (isNaN(etu.A) || isNaN(etu.C) || isNaN(etu.P)) continue;

            valeursA.push(etu.A);
            valeursC.push(etu.C);
            valeursP.push(etu.P);

            // E = (A/100 × C/100 × P/100)^(1/3) × 100
            var engagement = Math.pow((etu.A / 100) * (etu.C / 100) * (etu.P / 100), 1 / 3) * 100;
            valeursE.push(engagement);

            // Interventions cumulatives pour cet étudiant jusqu'à cette date
            var nbInterv = 0;
            var listeInterv = interventionsParDA[etu.da];
            if (listeInterv && dateRef) {
                for (var iv = 0; iv < listeInterv.length; iv++) {
                    if (listeInterv[iv].date <= dateRef) nbInterv++;
                }
            }
            valeursInterv.push(nbInterv);
            dasValides.push(etu.da);
        }

        var n = valeursA.length;
        resultat.n.push(n);

        if (n < SEUIL_MIN_ETUDIANTS) {
            resultat.correlations.AP.push(null);
            resultat.correlations.CP.push(null);
            resultat.correlations.EP.push(null);
            resultat.correlations.IntervP.push(null);
            continue;
        }

        resultat.correlations.AP.push(calculerCorrelationPearson(valeursA, valeursP));
        resultat.correlations.CP.push(calculerCorrelationPearson(valeursC, valeursP));
        resultat.correlations.EP.push(calculerCorrelationPearson(valeursE, valeursP));

        // IntervP : seulement si au moins une intervention a eu lieu
        var totalInterv = 0;
        for (var ti = 0; ti < valeursInterv.length; ti++) totalInterv += valeursInterv[ti];
        if (totalInterv > 0) {
            resultat.correlations.IntervP.push(calculerCorrelationPearson(valeursInterv, valeursP));
        } else {
            resultat.correlations.IntervP.push(null);
        }

        // Marquer les interventions de cette semaine
        for (var ii = 0; ii < interventions.length; ii++) {
            var intDate = (interventions[ii].date || '').substring(0, 10);
            if (intDate >= (snapshot.dateDebut || '').substring(0, 10) &&
                intDate <= (snapshot.dateFin || dateRef).substring(0, 10)) {
                var cleInterv = interventions[ii].id || (intDate + interventions[ii].titre);
                if (!interventionsVues[cleInterv]) {
                    interventionsVues[cleInterv] = true;
                    evenementsInterventions.push({
                        semaine: numSem,
                        titre: interventions[ii].titre || 'Intervention',
                        type: interventions[ii].type || 'groupe'
                    });
                }
            }
        }
    }

    resultat.evenementsInterventions = evenementsInterventions;
    return resultat;
}

/* ===============================
   GRAPHIQUE CHART.JS
   =============================== */

var graphiqueCorrLongInstance = null;

/**
 * Crée le graphique de corrélations longitudinales.
 * @param {string} canvasId - ID du canvas HTML
 */
function creerGraphiqueCorrelationsLongitudinales(canvasId) {
    try {
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn('⚠️ Canvas ' + canvasId + ' introuvable');
            return;
        }

        // Détruire l'instance précédente
        if (graphiqueCorrLongInstance) {
            graphiqueCorrLongInstance.destroy();
            graphiqueCorrLongInstance = null;
        }
        var existant = Chart.getChart(canvas);
        if (existant) existant.destroy();

        // Calculer les données
        var donnees = calculerCorrelationsLongitudinales();
        if (!donnees || donnees.semaines.length < 2) {
            if (typeof afficherMessageAttente === 'function') {
                afficherMessageAttente(canvas, 'Données insuffisantes', 'Au moins 2 semaines de snapshots nécessaires');
            }
            return;
        }

        var ctx = canvas.getContext('2d');
        var estModeClair = document.body.classList.contains('mode-clair');

        // Couleur de grille
        var couleurGrilleVal = estModeClair
            ? 'rgba(3, 46, 92, 0.08)'
            : 'rgba(106, 172, 184, 0.08)';
        var couleurGrilleFort = estModeClair
            ? 'rgba(3, 46, 92, 0.2)'
            : 'rgba(106, 172, 184, 0.2)';
        var couleurTexte = estModeClair ? '#333' : '#b0c4d0';

        // Datasets
        var datasets = [
            {
                label: 'A ↔ P',
                data: donnees.correlations.AP,
                borderColor: COULEURS_CORR.AP,
                backgroundColor: COULEURS_CORR.AP,
                borderWidth: 2.5,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: COULEURS_CORR.AP,
                pointBorderColor: estModeClair ? '#fff' : '#1a2a3a',
                pointBorderWidth: 2,
                spanGaps: false
            },
            {
                label: 'C ↔ P',
                data: donnees.correlations.CP,
                borderColor: COULEURS_CORR.CP,
                backgroundColor: COULEURS_CORR.CP,
                borderWidth: 2.5,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: COULEURS_CORR.CP,
                pointBorderColor: estModeClair ? '#fff' : '#1a2a3a',
                pointBorderWidth: 2,
                spanGaps: false
            },
            {
                label: 'E ↔ P',
                data: donnees.correlations.EP,
                borderColor: COULEURS_CORR.EP,
                backgroundColor: COULEURS_CORR.EP,
                borderWidth: 2.5,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: COULEURS_CORR.EP,
                pointBorderColor: estModeClair ? '#fff' : '#1a2a3a',
                pointBorderWidth: 2,
                spanGaps: false
            },
            {
                label: 'Interv. ↔ P',
                data: donnees.correlations.IntervP,
                borderColor: COULEURS_CORR.IntervP,
                backgroundColor: COULEURS_CORR.IntervP,
                borderWidth: 2,
                borderDash: [6, 3],
                tension: 0.25,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: COULEURS_CORR.IntervP,
                pointBorderColor: estModeClair ? '#fff' : '#1a2a3a',
                pointBorderWidth: 1.5,
                spanGaps: false
            }
        ];

        // Plugin : lignes verticales pour les interventions
        var pluginInterventions = {
            id: 'interventionMarkers',
            afterDraw: function(chart) {
                if (!donnees.evenementsInterventions || donnees.evenementsInterventions.length === 0) return;
                var xScale = chart.scales.x;
                var yScale = chart.scales.y;
                var ctx2 = chart.ctx;

                var semainesMarquees = {};
                for (var m = 0; m < donnees.evenementsInterventions.length; m++) {
                    var evt = donnees.evenementsInterventions[m];
                    var idx = donnees.semaines.indexOf(evt.semaine);
                    if (idx === -1 || semainesMarquees[idx]) continue;
                    semainesMarquees[idx] = true;

                    var x = xScale.getPixelForValue(idx);
                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.setLineDash([4, 4]);
                    ctx2.strokeStyle = estModeClair ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
                    ctx2.lineWidth = 1;
                    ctx2.moveTo(x, yScale.top);
                    ctx2.lineTo(x, yScale.bottom);
                    ctx2.stroke();
                    ctx2.restore();

                    // Petit label en haut
                    ctx2.save();
                    ctx2.font = '9px Arial';
                    ctx2.fillStyle = estModeClair ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
                    ctx2.textAlign = 'center';
                    ctx2.fillText('▼', x, yScale.top - 2);
                    ctx2.restore();
                }
            }
        };

        // Plugin : lignes horizontales de référence (seuils Cohen)
        var pluginSeuils = {
            id: 'seuilsCohen',
            beforeDraw: function(chart) {
                var yScale = chart.scales.y;
                var xScale = chart.scales.x;
                var ctx2 = chart.ctx;
                var seuils = [0.3, 0.5, -0.3, -0.5];

                for (var si = 0; si < seuils.length; si++) {
                    var val = seuils[si];
                    var y = yScale.getPixelForValue(val);
                    if (y < yScale.top || y > yScale.bottom) continue;

                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.setLineDash([3, 5]);
                    ctx2.strokeStyle = estModeClair ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
                    ctx2.lineWidth = 1;
                    ctx2.moveTo(xScale.left, y);
                    ctx2.lineTo(xScale.right, y);
                    ctx2.stroke();
                    ctx2.restore();

                    // Label à droite
                    if (val > 0) {
                        ctx2.save();
                        ctx2.font = '9px Arial';
                        ctx2.fillStyle = estModeClair ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
                        ctx2.textAlign = 'left';
                        var labelSeuil = val === 0.3 ? 'faible' : 'modéré';
                        ctx2.fillText(labelSeuil, xScale.right + 4, y + 3);
                        ctx2.restore();
                    }
                }
            }
        };

        // Configuration du graphique
        var config = {
            type: 'line',
            plugins: [pluginSeuils, pluginInterventions],
            data: {
                labels: donnees.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { right: 50, top: 15 }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: couleurTexte,
                            font: { size: 11 },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 6,
                        padding: 10,
                        callbacks: {
                            title: function(tooltipItems) {
                                var idx = tooltipItems[0].dataIndex;
                                var label = donnees.labels[idx] || '';
                                var date = donnees.dates[idx] || '';
                                return label + (date ? ' (' + date + ')' : '');
                            },
                            label: function(context) {
                                var idx = context.dataIndex;
                                var val = context.parsed.y;
                                var nEtu = donnees.n[idx] || 0;
                                var rStr = val != null ? val.toFixed(3).replace('.', ',') : '—';
                                return ' ' + context.dataset.label + ' : r = ' + rStr + '  (n = ' + nEtu + ')';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Semaine',
                            color: couleurTexte,
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte,
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: couleurGrilleVal
                        }
                    },
                    y: {
                        min: -1,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Corrélation (r)',
                            color: couleurTexte,
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte,
                            font: { size: 11 },
                            stepSize: 0.25,
                            callback: function(value) {
                                return value.toFixed(2).replace('.', ',');
                            }
                        },
                        grid: {
                            display: true,
                            color: function(context) {
                                return context.tick.value === 0 ? couleurGrilleFort : couleurGrilleVal;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'xy',
                    intersect: false
                }
            }
        };

        graphiqueCorrLongInstance = new Chart(ctx, config);

        // Mettre à jour la description
        var desc = document.getElementById('corr-long-description');
        if (desc) {
            var nbSem = donnees.semaines.length;
            var dernierN = 0;
            for (var dn = donnees.n.length - 1; dn >= 0; dn--) {
                if (donnees.n[dn] > 0) { dernierN = donnees.n[dn]; break; }
            }
            desc.textContent = 'Corrélation de Pearson (r) entre chaque indice et P, calculée sur ' +
                nbSem + ' semaines (' + dernierN + ' étudiants). Lignes pointillées : seuils faible (±0,3) et modéré (±0,5).';
        }

        console.log('✅ Graphique corrélations longitudinales créé (' + donnees.semaines.length + ' semaines)');

    } catch (err) {
        console.error('❌ Erreur création graphique corrélations longitudinales:', err);
    }
}

// Exposer les fonctions globalement
window.creerGraphiqueCorrelationsLongitudinales = creerGraphiqueCorrelationsLongitudinales;
window.calculerCorrelationsLongitudinales = calculerCorrelationsLongitudinales;

})();
