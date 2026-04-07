/**
 * MODULE PROGRESSION DES FONDAMENTAUX PAR ACTIVITÉ
 *
 * Observe la trajectoire des scores multistructurels (fondations SOLO)
 * au fil des activités d'apprentissage évaluées. Ne prétend pas à la
 * causalité — fournit des signaux pour le jugement professionnel.
 *
 * Deux niveaux de granularité :
 * - Individuel : sparkline dans le profil étudiant
 * - Groupe : graphique combiné dans Suivi › Labo
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
 * Observe la progression des fondamentaux pour un étudiant, activité par activité.
 * Fournit le score, la variation et le contexte (seuil, jeton) — sans attribution causale.
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
            categorie: i === 0 ? 'Point de départ' : cat.label,
            couleur: i === 0 ? 'var(--gris-moyen, #999)' : cat.couleurVar,
            estJeton: hist[i].estJeton,
            productionId: hist[i].productionId,
            productionTitre: hist[i].productionTitre,
            date: hist[i].date
        });
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
 * Compare, pour chaque production, le score fondamentaux des étudiants qui l'ont
 * faite (score SUR cette production) vs ceux qui ne l'ont pas faite (dernier score
 * connu avant cette production). Répond à : « Quel travail est le plus associé
 * à la progression des fondamentaux ? »
 * @returns {Object|null} { productions: [...], seuil, nbEtudiantsTotal }
 */
function calculerImpactArtefactsGroupe() {
    var etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
    if (etudiants.length < 3) return null;

    // Collecter les trajectoires complètes de chaque étudiant
    var trajectoires = []; // [{ da, points: [{productionId, score}] }]
    var seuil = 0.70;
    var toutesProductionIds = {};
    var ordreProductions = [];

    etudiants.forEach(function(e) {
        var impact = calculerImpactArtefacts(e.da);
        if (!impact || impact.points.length === 0) return;
        seuil = impact.seuil;

        // Enregistrer les productionIds dans l'ordre d'apparition
        impact.points.forEach(function(pt) {
            if (!toutesProductionIds[pt.productionId]) {
                toutesProductionIds[pt.productionId] = pt.productionTitre;
                ordreProductions.push(pt.productionId);
            }
        });

        trajectoires.push({
            da: e.da,
            points: impact.points // ancien → récent, avec score et productionId
        });
    });

    if (trajectoires.length < 3) return null;

    function mediane(arr) {
        if (arr.length === 0) return null;
        var s = arr.slice().sort(function(a, b) { return a - b; });
        var m = Math.floor(s.length / 2);
        return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
    }

    // Pour chaque production : score SUR cette prod (ont fait) vs dernier score AVANT (pas fait)
    var productions = ordreProductions.map(function(prodId) {
        var scoresFait = [];    // score sur cette production
        var scoresPasFait = []; // dernier score avant cette production

        trajectoires.forEach(function(traj) {
            // Chercher si l'étudiant a cette production dans sa trajectoire
            var indexProd = -1;
            for (var i = 0; i < traj.points.length; i++) {
                if (traj.points[i].productionId === prodId) {
                    indexProd = i;
                    break;
                }
            }

            if (indexProd >= 0 && traj.points[indexProd].score !== null) {
                // A fait cette production → score SUR cette production
                scoresFait.push(traj.points[indexProd].score);
            } else {
                // N'a PAS fait cette production → dernier score connu avant
                var dernierAvant = null;
                for (var j = traj.points.length - 1; j >= 0; j--) {
                    // Chercher le dernier score avant cette production dans l'ordre global
                    var ptProdIdx = ordreProductions.indexOf(traj.points[j].productionId);
                    var cibleIdx = ordreProductions.indexOf(prodId);
                    if (ptProdIdx < cibleIdx && traj.points[j].score !== null) {
                        dernierAvant = traj.points[j].score;
                        break;
                    }
                }
                if (dernierAvant !== null) {
                    scoresPasFait.push(dernierAvant);
                }
            }
        });

        var medianeFait = mediane(scoresFait);
        var medianePasFait = mediane(scoresPasFait);
        var ecart = (medianeFait !== null && medianePasFait !== null)
            ? medianeFait - medianePasFait : null;

        return {
            productionId: prodId,
            titre: toutesProductionIds[prodId] || prodId,
            nbOntFait: scoresFait.length,
            nbPasFait: scoresPasFait.length,
            medianeFait: medianeFait,
            medianePasFait: medianePasFait,
            ecart: ecart
        };
    });

    // Trier par écart décroissant (plus forte association en premier)
    productions.sort(function(a, b) {
        var ea = a.ecart !== null ? a.ecart : -999;
        var eb = b.ecart !== null ? b.ecart : -999;
        return eb - ea;
    });

    // Ne garder que les productions avec au moins 1 étudiant qui l'a faite
    productions = productions.filter(function(p) {
        return p.nbOntFait > 0;
    });

    if (productions.length < 2) return null;

    return {
        productions: productions,
        seuil: seuil,
        nbEtudiantsTotal: trajectoires.length
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
                            var score100 = p.score !== null ? Math.round(p.score * 100) : null;
                            var lines = ['Score fondamentaux : ' + (score100 !== null ? score100 + '%' : 'N/A')];
                            if (score100 !== null) {
                                lines.push(score100 >= seuil100 ? 'Au-dessus du seuil' : 'Sous le seuil de ' + seuil100 + '%');
                            }
                            if (idx > 0) {
                                var signe = p.deltaPercent >= 0 ? '+' : '';
                                lines.push('Variation : ' + signe + p.deltaPercent + ' pp depuis l\'activite precedente');
                            }
                            if (p.estJeton) {
                                lines.push('Jeton de reprise applique');
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
/**
 * Crée un graphique horizontal comparant, pour chaque production,
 * le score fondamentaux médian des étudiants qui l'ont faite vs pas faite.
 * Lecture immédiate : grand écart = cette production compte pour les fondamentaux.
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
    var dataFait = prods.map(function(p) { return p.medianeFait !== null ? Math.round(p.medianeFait * 100) : null; });
    var dataPasFait = prods.map(function(p) { return p.medianePasFait !== null ? Math.round(p.medianePasFait * 100) : null; });

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
                    label: 'Ont fait le travail',
                    data: dataFait,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                    borderColor: '#28a745',
                    borderWidth: 1
                },
                {
                    label: 'N\'ont pas fait le travail',
                    data: dataPasFait,
                    backgroundColor: 'rgba(150, 150, 150, 0.4)',
                    borderColor: '#999',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
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
                            xMin: seuil100,
                            xMax: seuil100,
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
                            var lines = [
                                p.nbOntFait + ' ont fait, ' + p.nbPasFait + ' n\'ont pas fait'
                            ];
                            if (p.ecart !== null) {
                                var ecartPct = Math.round(p.ecart * 100);
                                var signe = ecartPct >= 0 ? '+' : '';
                                lines.push('Ecart : ' + signe + ecartPct + ' pp');
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score fondamentaux median (%)',
                        color: couleurTexte,
                        font: { size: 11 }
                    },
                    ticks: { color: couleurTexte },
                    grid: { color: couleurGrille }
                },
                y: {
                    ticks: { color: couleurTexte, font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });

    canvas._chartInstance = chart;

    // Description textuelle
    var descEl = document.getElementById('impact-artefacts-description');
    if (descEl) {
        var messages = [];

        prods.forEach(function(p) {
            var titre = echapperHtml(p.titre || p.productionId);
            var scoreFait = p.medianeFait !== null ? Math.round(p.medianeFait * 100) + '%' : '?';
            var scorePas = p.medianePasFait !== null ? Math.round(p.medianePasFait * 100) + '%' : '—';
            var ecartStr = '';
            if (p.ecart !== null) {
                var ecartPct = Math.round(p.ecart * 100);
                ecartStr = ' · ecart ' + (ecartPct >= 0 ? '+' : '') + ecartPct + ' pp';
            }
            var contexte = '';
            if (p.nbPasFait === 0) {
                contexte = ' (tous l\'ont fait)';
            }
            messages.push('<strong>' + titre + '</strong> : ' +
                p.nbOntFait + '/' + donnees.nbEtudiantsTotal + ' l\'ont fait → ' + scoreFait +
                (p.nbPasFait > 0 ? ' vs ' + scorePas + ' pour ceux qui ne l\'ont pas fait' : '') +
                ecartStr + contexte);
        });

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
