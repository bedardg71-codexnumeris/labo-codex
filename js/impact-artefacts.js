/**
 * MODULE IMPACT DES ARTEFACTS SUR LES FONDAMENTAUX
 *
 * Analyse l'effet de chaque artefact (et de chaque jeton de reprise) sur la
 * trajectoire des scores multistructurels (fondations SOLO).
 *
 * Deux niveaux de granularité :
 * - Individuel : sparkline dans le profil étudiant (creerSparklineImpactArtefacts)
 * - Groupe : bar chart dans Suivi › Labo (creerGraphiqueImpactArtefactsGroupe)
 *
 * Condition préalable : dépistage actif (grille avec critères multistructurels).
 * Données source : calculerIPB(da).historiqueComplet
 *
 * @author Labo Codex
 * @date 7 avril 2026
 */

(function() {
'use strict';

/* ===============================
   SEUILS D'IMPACT
   =============================== */

var SEUILS = {
    fortPositif:    0.10,  // >= +10pp
    moderePositif:  0.05,  // +5pp à +10pp
    neutre:         0.05,  // ±5pp
    modereNegatif: -0.05,  // -5pp à -10pp
    fortNegatif:   -0.10   // <= -10pp
};

/**
 * Classifie un delta en catégorie qualitative.
 * @param {number} delta - Variation du score (ex: 0.08 = +8pp)
 * @returns {Object} { label, couleurVar }
 */
function classifierDelta(delta) {
    if (delta >= SEUILS.fortPositif) {
        return { label: 'Fort positif', couleurVar: 'var(--vert-succes, #28a745)' };
    }
    if (delta >= SEUILS.moderePositif) {
        return { label: 'Modéré positif', couleurVar: 'var(--succes, #4caf50)' };
    }
    if (delta > -SEUILS.neutre) {
        return { label: 'Neutre', couleurVar: 'var(--gris-moyen, #999)' };
    }
    if (delta > SEUILS.fortNegatif) {
        return { label: 'Modéré négatif', couleurVar: 'var(--orange-accent, #ff9800)' };
    }
    return { label: 'Fort négatif', couleurVar: 'var(--rouge-erreur, #dc3545)' };
}

/* ===============================
   CALCUL INDIVIDUEL
   =============================== */

/**
 * Calcule l'impact de chaque artefact sur les fondamentaux pour un étudiant.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} { points: [...], seuil, criteresMulti }
 */
function calculerImpactArtefacts(da) {
    if (typeof calculerIPB !== 'function') return null;
    var ipbData = calculerIPB(da);
    if (!ipbData || !ipbData.historiqueComplet || ipbData.historiqueComplet.length < 2) return null;

    var hist = ipbData.historiqueComplet; // ancien → récent
    var points = [];

    for (var i = 0; i < hist.length; i++) {
        var delta = 0;
        var deltaPercent = 0;
        if (i > 0 && hist[i].score !== null && hist[i - 1].score !== null) {
            delta = hist[i].score - hist[i - 1].score;
            deltaPercent = Math.round(delta * 100);
        }
        var cat = classifierDelta(delta);
        points.push({
            index: i,
            score: hist[i].score,
            delta: delta,
            deltaPercent: deltaPercent,
            categorie: i === 0 ? 'Premier artefact' : cat.label,
            couleur: i === 0 ? 'var(--gris-moyen, #999)' : cat.couleurVar,
            estJeton: hist[i].estJeton,
            productionId: hist[i].productionId,
            productionTitre: hist[i].productionTitre,
            date: hist[i].date,
            impactDiffere: null
        });
    }

    // Détection d'impact différé
    for (var n = 0; n < points.length - 1; n++) {
        var estNeutre = Math.abs(points[n].delta) < SEUILS.neutre;
        var prochainFort = Math.abs(points[n + 1].delta) >= SEUILS.moderePositif;
        if (n > 0 && estNeutre && prochainFort) {
            points[n].impactDiffere = {
                deltaManifeste: points[n + 1].delta,
                deltaManifestePct: points[n + 1].deltaPercent,
                manifesteSurIndex: n + 1
            };
        }
    }

    return {
        points: points,
        seuil: ipbData.seuil,
        criteresMulti: ipbData.criteresMulti
    };
}

/* ===============================
   CALCUL GROUPE
   =============================== */

/**
 * Agrège l'impact des artefacts sur les fondamentaux pour tout le groupe.
 * @returns {Object|null} { productions: [...], jetonsAggreges: {...} }
 */
function calculerImpactArtefactsGroupe() {
    var etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
    if (etudiants.length < 3) return null;

    // Agrégation par productionId
    var parProduction = {};
    var jetonsTotal = 0;
    var jetonsImpactPositif = 0;
    var jetonsImpactNeutre = 0;
    var jetonsImpactNegatif = 0;

    etudiants.forEach(function(e) {
        var impact = calculerImpactArtefacts(e.da);
        if (!impact) return;

        impact.points.forEach(function(pt) {
            if (pt.index === 0) return; // pas de delta pour le premier
            if (!parProduction[pt.productionId]) {
                parProduction[pt.productionId] = {
                    productionId: pt.productionId,
                    titre: pt.productionTitre,
                    deltas: [],
                    nbJetons: 0,
                    jetonsImpactPositif: 0,
                    jetonsImpactDiffere: 0,
                    jetonsImpactNeutre: 0
                };
            }
            var p = parProduction[pt.productionId];
            p.deltas.push(pt.delta);

            if (pt.estJeton) {
                p.nbJetons++;
                jetonsTotal++;
                if (pt.delta >= SEUILS.moderePositif) {
                    p.jetonsImpactPositif++;
                    jetonsImpactPositif++;
                } else if (pt.impactDiffere && pt.impactDiffere.deltaManifeste >= SEUILS.moderePositif) {
                    p.jetonsImpactDiffere++;
                    jetonsImpactPositif++; // compté comme positif au total
                } else if (pt.delta <= SEUILS.modereNegatif) {
                    jetonsImpactNegatif++;
                } else {
                    p.jetonsImpactNeutre++;
                    jetonsImpactNeutre++;
                }
            }
        });
    });

    // Calculer médiane et moyenne par production
    var productions = Object.keys(parProduction).map(function(key) {
        var p = parProduction[key];
        var sorted = p.deltas.slice().sort(function(a, b) { return a - b; });
        var mid = Math.floor(sorted.length / 2);
        var mediane = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        var moyenne = sorted.reduce(function(s, v) { return s + v; }, 0) / sorted.length;

        return {
            productionId: p.productionId,
            titre: p.titre,
            medianeDelta: mediane,
            moyenneDelta: moyenne,
            nbEtudiants: p.deltas.length,
            nbJetons: p.nbJetons,
            jetonsImpactPositif: p.jetonsImpactPositif,
            jetonsImpactDiffere: p.jetonsImpactDiffere,
            jetonsImpactNeutre: p.jetonsImpactNeutre
        };
    });

    // Trier par impact médian décroissant
    productions.sort(function(a, b) { return b.medianeDelta - a.medianeDelta; });

    if (productions.length < 2) return null;

    return {
        productions: productions,
        jetonsAggreges: {
            total: jetonsTotal,
            impactPositif: jetonsImpactPositif,
            impactNeutre: jetonsImpactNeutre,
            impactNegatif: jetonsImpactNegatif
        }
    };
}

/* ===============================
   SPARKLINE INDIVIDUEL (Chart.js)
   =============================== */

/**
 * Crée un sparkline de l'impact des artefacts sur les fondamentaux.
 * @param {string} canvasId - ID du canvas
 * @param {string} da - Numéro de DA
 */
function creerSparklineImpactArtefacts(canvasId, da) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var impact = calculerImpactArtefacts(da);
    if (!impact || impact.points.length < 2) {
        canvas.parentElement.style.display = 'none';
        return;
    }

    var ctx = canvas.getContext('2d');
    var pts = impact.points;

    // Données
    var labels = pts.map(function(p) { return p.productionTitre || ('Art. ' + (p.index + 1)); });
    var scores = pts.map(function(p) { return p.score !== null ? Math.round(p.score * 100) : null; });

    // Couleurs des points selon IDME
    var pointBg = pts.map(function(p) {
        if (p.score === null) return 'var(--gris-moyen, #999)';
        if (p.score >= 0.85) return 'var(--bleu-principal, #2196f3)';
        if (p.score >= 0.75) return 'var(--vert-succes, #28a745)';
        if (p.score >= 0.65) return 'var(--orange-accent, #ff9800)';
        return 'var(--rouge-erreur, #dc3545)';
    });

    // Marqueurs jetons : triangle, plus grand
    var pointStyles = pts.map(function(p) { return p.estJeton ? 'triangle' : 'circle'; });
    var pointRadii = pts.map(function(p) { return p.estJeton ? 7 : 4; });
    var pointBorders = pts.map(function(p) {
        if (p.impactDiffere) return 3;
        return p.estJeton ? 2 : 1;
    });

    // Mode sombre/clair
    var estModeClair = document.body.classList.contains('mode-clair');
    var couleurGrille = estModeClair ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    var couleurTexte = estModeClair ? '#555' : '#aaa';
    var couleurLigne = estModeClair ? '#3F51B5' : '#7986CB';

    // Détruire graphique existant si rechargement
    if (canvas._chartInstance) {
        canvas._chartInstance.destroy();
    }

    var seuil100 = Math.round(impact.seuil * 100);

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: scores,
                borderColor: couleurLigne,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.25,
                pointStyle: pointStyles,
                pointRadius: pointRadii,
                pointBackgroundColor: pointBg,
                pointBorderColor: pointBg,
                pointBorderWidth: pointBorders,
                spanGaps: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                annotation: {
                    annotations: {
                        seuilLine: {
                            type: 'line',
                            yMin: seuil100,
                            yMax: seuil100,
                            borderColor: 'rgba(255, 152, 0, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 3],
                            label: {
                                display: true,
                                content: 'Seuil ' + seuil100 + '%',
                                position: 'start',
                                font: { size: 9 },
                                color: couleurTexte,
                                backgroundColor: 'transparent'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            if (!items.length) return '';
                            var idx = items[0].dataIndex;
                            var p = pts[idx];
                            return p.productionTitre || ('Artefact ' + (idx + 1));
                        },
                        label: function(item) {
                            var idx = item.dataIndex;
                            var p = pts[idx];
                            var lines = ['Score : ' + (p.score !== null ? Math.round(p.score * 100) + '%' : 'N/A')];
                            if (idx > 0) {
                                var signe = p.deltaPercent >= 0 ? '+' : '';
                                lines.push('Delta : ' + signe + p.deltaPercent + 'pp (' + p.categorie + ')');
                            }
                            if (p.estJeton) {
                                lines.push('Jeton de reprise');
                            }
                            if (p.impactDiffere) {
                                var sd = p.impactDiffere.deltaManifestePct >= 0 ? '+' : '';
                                lines.push('Impact differe : ' + sd + p.impactDiffere.deltaManifestePct + 'pp sur artefact suivant');
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        font: { size: 9 },
                        color: couleurTexte,
                        maxRotation: 45
                    },
                    grid: { display: false }
                },
                y: {
                    display: false,
                    min: 0,
                    max: 100,
                    grid: { color: couleurGrille }
                }
            }
        }
    });

    canvas._chartInstance = chart;
}

/* ===============================
   GRAPHIQUE GROUPE (Chart.js)
   =============================== */

/**
 * Crée un bar chart horizontal de l'impact par production pour le groupe.
 * @param {string} canvasId - ID du canvas
 */
function creerGraphiqueImpactArtefactsGroupe(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Vérifier condition préalable : dépistage actif
    if (typeof obtenirGrilleReferenceDepistage === 'function') {
        var grille = obtenirGrilleReferenceDepistage();
        if (!grille || !grille.criteres) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }
        var multi = grille.criteres.filter(function(c) {
            return (c.niveauSOLO || 'multistructurel') === 'multistructurel';
        });
        if (multi.length === 0) {
            canvas.parentElement.parentElement.style.display = 'none';
            return;
        }
    }

    var donnees = calculerImpactArtefactsGroupe();
    if (!donnees) {
        canvas.parentElement.parentElement.style.display = 'none';
        return;
    }

    // Afficher la carte
    var carte = document.getElementById('carte-impact-artefacts-fondamentaux');
    if (carte) carte.style.display = '';

    var ctx = canvas.getContext('2d');
    var prods = donnees.productions;

    var labels = prods.map(function(p) { return p.titre || p.productionId; });
    var medianes = prods.map(function(p) { return Math.round(p.medianeDelta * 1000) / 10; }); // 1 décimale

    // Couleurs selon direction
    var bgColors = medianes.map(function(v) {
        if (v >= 5) return 'rgba(40, 167, 69, 0.7)';
        if (v >= 1) return 'rgba(40, 167, 69, 0.4)';
        if (v > -1) return 'rgba(150, 150, 150, 0.25)';
        if (v > -5) return 'rgba(255, 152, 0, 0.4)';
        return 'rgba(220, 53, 69, 0.7)';
    });
    var borderColors = medianes.map(function(v) {
        if (v >= 0) return '#28a745';
        return '#dc3545';
    });

    // Mode sombre/clair
    var estModeClair = document.body.classList.contains('mode-clair');
    var couleurTexte = estModeClair ? '#555' : '#aaa';
    var couleurGrille = estModeClair ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

    if (canvas._chartInstance) {
        canvas._chartInstance.destroy();
    }

    // Plugin pour afficher la valeur à droite de chaque barre
    var pluginValeurBarre = {
        id: 'valeurBarre',
        afterDatasetsDraw: function(chart) {
            var ctx2 = chart.ctx;
            chart.data.datasets.forEach(function(dataset, i) {
                var meta = chart.getDatasetMeta(i);
                meta.data.forEach(function(bar, index) {
                    var val = dataset.data[index];
                    if (val === 0 || val === null) return;
                    var signe = val >= 0 ? '+' : '';
                    ctx2.save();
                    ctx2.fillStyle = couleurTexte;
                    ctx2.font = '11px sans-serif';
                    ctx2.textAlign = 'left';
                    ctx2.textBaseline = 'middle';
                    ctx2.fillText(signe + val.toFixed(1) + ' pp', bar.x + 6, bar.y);
                    ctx2.restore();
                });
            });
        }
    };

    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Impact median (pp)',
                data: medianes,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        plugins: [pluginValeurBarre],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(item) {
                            var idx = item.dataIndex;
                            var p = prods[idx];
                            var signe = item.raw >= 0 ? '+' : '';
                            var lines = [
                                'Impact median : ' + signe + item.raw.toFixed(1) + ' pp',
                                'Moyenne : ' + (p.moyenneDelta >= 0 ? '+' : '') + (p.moyenneDelta * 100).toFixed(1) + ' pp',
                                p.nbEtudiants + ' etudiants evalues'
                            ];
                            if (p.nbJetons > 0) {
                                lines.push(p.nbJetons + ' jeton(s) : ' + p.jetonsImpactPositif + ' positif, ' + p.jetonsImpactDiffere + ' differe, ' + p.jetonsImpactNeutre + ' neutre');
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Impact median sur les fondamentaux (points de pourcentage)',
                        color: couleurTexte,
                        font: { size: 11 }
                    },
                    ticks: { color: couleurTexte },
                    grid: { color: couleurGrille }
                },
                y: {
                    ticks: {
                        color: couleurTexte,
                        font: { size: 11 }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    canvas._chartInstance = chart;

    // Description textuelle sous le graphique
    var descEl = document.getElementById('impact-artefacts-description');
    if (descEl) {
        var messages = [];

        // Productions à fort impact positif
        var fortes = prods.filter(function(p) { return p.medianeDelta >= SEUILS.moderePositif; });
        if (fortes.length > 0) {
            var noms = fortes.map(function(p) { return echapperHtml(p.titre); });
            messages.push('Productions a impact positif sur les fondamentaux : ' + noms.join(', ') + '.');
        }

        // Productions à impact négatif
        var negatives = prods.filter(function(p) { return p.medianeDelta <= -SEUILS.moderePositif; });
        if (negatives.length > 0) {
            var nomsNeg = negatives.map(function(p) { return echapperHtml(p.titre); });
            messages.push('Productions associees a une regression : ' + nomsNeg.join(', ') + '.');
        }

        // Bilan jetons
        var j = donnees.jetonsAggreges;
        if (j.total > 0) {
            messages.push('Jetons de reprise : ' + j.total + ' appliques, ' + j.impactPositif + ' avec impact positif, ' + j.impactNeutre + ' neutres, ' + j.impactNegatif + ' negatifs.');
        }

        descEl.innerHTML = messages.join(' ');
    }
}

/* ===============================
   EXPORTS
   =============================== */

window.calculerImpactArtefacts = calculerImpactArtefacts;
window.calculerImpactArtefactsGroupe = calculerImpactArtefactsGroupe;
window.creerSparklineImpactArtefacts = creerSparklineImpactArtefacts;
window.creerGraphiqueImpactArtefactsGroupe = creerGraphiqueImpactArtefactsGroupe;

})();
