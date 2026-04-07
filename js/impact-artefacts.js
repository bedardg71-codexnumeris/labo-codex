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
 * Pour chaque production : nb étudiants en progression / stagnation / régression,
 * score médian du groupe, et impact des jetons.
 * Les productions sont en ordre chronologique (première évaluée en premier).
 * @returns {Object|null} { productions: [...], seuil, jetonsAggreges: {...} }
 */
function calculerImpactArtefactsGroupe() {
    var etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
    if (etudiants.length < 3) return null;

    // Collecter toutes les données par productionId, en préservant l'ordre chronologique
    var parProduction = {};
    var ordreProductions = []; // pour garder l'ordre chronologique
    var seuil = 0.70;
    var jetonsTotal = 0;
    var jetonsImpactPositif = 0;
    var jetonsImpactNeutre = 0;
    var jetonsImpactNegatif = 0;

    etudiants.forEach(function(e) {
        var impact = calculerImpactArtefacts(e.da);
        if (!impact) return;
        seuil = impact.seuil;

        impact.points.forEach(function(pt) {
            if (!parProduction[pt.productionId]) {
                parProduction[pt.productionId] = {
                    productionId: pt.productionId,
                    titre: pt.productionTitre,
                    scores: [],
                    nbProgression: 0,
                    nbStagnation: 0,
                    nbRegression: 0,
                    nbJetons: 0,
                    jetonsImpactPositif: 0,
                    jetonsImpactNeutre: 0
                };
                ordreProductions.push(pt.productionId);
            }
            var p = parProduction[pt.productionId];
            if (pt.score !== null) p.scores.push(pt.score);

            // Compter progression/stagnation/régression (sauf premier artefact)
            if (pt.index > 0) {
                if (pt.delta >= SEUILS.moderePositif) {
                    p.nbProgression++;
                } else if (pt.delta <= -SEUILS.moderePositif) {
                    p.nbRegression++;
                } else {
                    p.nbStagnation++;
                }
            }

            if (pt.estJeton) {
                p.nbJetons++;
                jetonsTotal++;
                if (pt.delta >= SEUILS.moderePositif || (pt.impactDiffere && pt.impactDiffere.deltaManifeste >= SEUILS.moderePositif)) {
                    p.jetonsImpactPositif++;
                    jetonsImpactPositif++;
                } else if (pt.delta <= -SEUILS.moderePositif) {
                    jetonsImpactNegatif++;
                } else {
                    p.jetonsImpactNeutre++;
                    jetonsImpactNeutre++;
                }
            }
        });
    });

    // Construire le tableau en ordre chronologique avec score médian
    var productions = ordreProductions.map(function(key) {
        var p = parProduction[key];
        var sorted = p.scores.slice().sort(function(a, b) { return a - b; });
        var mid = Math.floor(sorted.length / 2);
        var scoreMedian = sorted.length === 0 ? null :
            sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        var nbTotal = p.nbProgression + p.nbStagnation + p.nbRegression;

        return {
            productionId: p.productionId,
            titre: p.titre,
            scoreMedian: scoreMedian,
            nbEtudiants: p.scores.length,
            nbProgression: p.nbProgression,
            nbStagnation: p.nbStagnation,
            nbRegression: p.nbRegression,
            nbTotal: nbTotal,
            nbJetons: p.nbJetons,
            jetonsImpactPositif: p.jetonsImpactPositif,
            jetonsImpactNeutre: p.jetonsImpactNeutre
        };
    });

    // Supprimer les doublons (garder le premier par productionId)
    var vus = {};
    productions = productions.filter(function(p) {
        if (vus[p.productionId]) return false;
        vus[p.productionId] = true;
        return true;
    });

    if (productions.length < 2) return null;

    return {
        productions: productions,
        seuil: seuil,
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
 * Crée un graphique combiné pour le groupe :
 * - Barres empilées : nb étudiants en progression / stagnation / régression par production
 * - Ligne : score multistructurel médian du groupe (axe Y droit)
 * - Seuil de maîtrise en pointillés
 * Productions en ordre chronologique.
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
    var seuil100 = Math.round(donnees.seuil * 100);

    var labels = prods.map(function(p) { return p.titre || p.productionId; });
    var dataProgression = prods.map(function(p) { return p.nbProgression; });
    var dataStagnation = prods.map(function(p) { return p.nbStagnation; });
    var dataRegression = prods.map(function(p) { return -p.nbRegression; }); // négatif pour barres vers le bas
    var dataScoreMedian = prods.map(function(p) { return p.scoreMedian !== null ? Math.round(p.scoreMedian * 100) : null; });

    // Mode sombre/clair
    var estModeClair = document.body.classList.contains('mode-clair');
    var couleurTexte = estModeClair ? '#555' : '#aaa';
    var couleurGrille = estModeClair ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

    if (canvas._chartInstance) {
        canvas._chartInstance.destroy();
    }

    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Progression',
                    data: dataProgression,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                    borderColor: '#28a745',
                    borderWidth: 1,
                    stack: 'impact',
                    yAxisID: 'yEtudiants',
                    order: 2
                },
                {
                    label: 'Stagnation',
                    data: dataStagnation,
                    backgroundColor: estModeClair ? 'rgba(150, 150, 150, 0.25)' : 'rgba(200, 200, 200, 0.2)',
                    borderColor: estModeClair ? '#bbb' : '#666',
                    borderWidth: 1,
                    stack: 'impact',
                    yAxisID: 'yEtudiants',
                    order: 2
                },
                {
                    label: 'Régression',
                    data: dataRegression,
                    backgroundColor: 'rgba(220, 53, 69, 0.5)',
                    borderColor: '#dc3545',
                    borderWidth: 1,
                    stack: 'impact',
                    yAxisID: 'yEtudiants',
                    order: 2
                },
                {
                    label: 'Score median du groupe (%)',
                    data: dataScoreMedian,
                    type: 'line',
                    borderColor: '#7986CB',
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointBackgroundColor: dataScoreMedian.map(function(v) {
                        if (v === null) return '#999';
                        if (v >= 85) return '#2196f3';
                        if (v >= seuil100) return '#28a745';
                        if (v >= 65) return '#ff9800';
                        return '#dc3545';
                    }),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1.5,
                    tension: 0.25,
                    spanGaps: true,
                    yAxisID: 'yScore',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: couleurTexte, font: { size: 11 }, usePointStyle: true }
                },
                annotation: {
                    annotations: {
                        seuilLine: {
                            type: 'line',
                            yScaleID: 'yScore',
                            yMin: seuil100,
                            yMax: seuil100,
                            borderColor: 'rgba(255, 152, 0, 0.6)',
                            borderWidth: 1.5,
                            borderDash: [6, 4],
                            label: {
                                display: true,
                                content: 'Seuil ' + seuil100 + '%',
                                position: 'start',
                                font: { size: 10 },
                                color: couleurTexte,
                                backgroundColor: 'transparent'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(items) {
                            if (!items.length) return '';
                            var idx = items[0].dataIndex;
                            var p = prods[idx];
                            var lines = [];
                            if (p.scoreMedian !== null) {
                                lines.push('Score median : ' + Math.round(p.scoreMedian * 100) + '%' + (p.scoreMedian < donnees.seuil ? ' (sous le seuil)' : ''));
                            }
                            lines.push(p.nbEtudiants + ' etudiants evalues');
                            if (p.nbJetons > 0) {
                                lines.push(p.nbJetons + ' jeton(s) dont ' + p.jetonsImpactPositif + ' avec impact positif');
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: couleurTexte, font: { size: 10 }, maxRotation: 35 },
                    grid: { display: false }
                },
                yEtudiants: {
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nombre d\'etudiants',
                        color: couleurTexte,
                        font: { size: 11 }
                    },
                    ticks: { color: couleurTexte, stepSize: 1 },
                    grid: { color: couleurGrille }
                },
                yScore: {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Score multistructurel median (%)',
                        color: couleurTexte,
                        font: { size: 11 }
                    },
                    min: 0,
                    max: 100,
                    ticks: { color: couleurTexte },
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

        prods.forEach(function(p) {
            if (p.nbTotal === 0) return;
            var scoreStr = p.scoreMedian !== null ? Math.round(p.scoreMedian * 100) + '%' : '?';
            var contexte = p.scoreMedian !== null && p.scoreMedian < donnees.seuil ? ' (sous le seuil)' : '';
            var titre = echapperHtml(p.titre || p.productionId);
            messages.push('<strong>' + titre + '</strong> : ' +
                p.nbProgression + ' en progression, ' +
                p.nbStagnation + ' stables, ' +
                p.nbRegression + ' en regression' +
                ' — score median ' + scoreStr + contexte +
                (p.nbJetons > 0 ? ' · ' + p.nbJetons + ' jeton(s)' : ''));
        });

        // Bilan jetons
        var j = donnees.jetonsAggreges;
        if (j.total > 0) {
            messages.push('<br><strong>Jetons de reprise</strong> : ' + j.total + ' appliques, ' + j.impactPositif + ' avec impact positif, ' + j.impactNeutre + ' neutres, ' + j.impactNegatif + ' negatifs.');
        }

        descEl.innerHTML = messages.join('<br>');
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
