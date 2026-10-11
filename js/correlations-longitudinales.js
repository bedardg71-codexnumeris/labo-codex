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

// Couleurs corrélations : centralisées dans js/couleurs.js (COULEURS.correlations)
var COULEURS_CORR = COULEURS.correlations;

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
        snapshots = (window.LaboCodexData && typeof window.LaboCodexData.lireSnapshotsHebdomadaires === 'function')
            ? window.LaboCodexData.lireSnapshotsHebdomadaires()
            : obtenirSnapshotsHebdomadaires();
    } catch (e) {
        console.warn('⚠️ Corrélations longitudinales : snapshots non disponibles', e);
        return null;
    }

    if (!snapshots || snapshots.length < 2) return null;

    // Trier par date de séance (granularité par séance, pas par semaine)
    snapshots.sort(function(a, b) {
        var dateA = a.dateSeance || a.dateDebut || '';
        var dateB = b.dateSeance || b.dateDebut || '';
        if (dateA !== dateB) return dateA < dateB ? -1 : 1;
        return (a.numSemaine || 0) - (b.numSemaine || 0);
    });

    // Charger les interventions et pré-construire une Map(da → [{date}])
    var interventions = [];
    try {
        interventions = (window.LaboCodexData && typeof window.LaboCodexData.lireInterventions === 'function')
            ? window.LaboCodexData.lireInterventions() || []
            : obtenirInterventions() || [];
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
                titre: typeof window.titreInterventionAffiche === 'function' ? window.titreInterventionAffiche(interv) : interv.titre   // Lot A, R4
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
        correlations: { AP: [], CP: [] },
        moyennes: { A: [], C: [], P: [] },
        interventionsCourbes: [],  // [{titre, etudiants:[], moyP:[], indexDebut}] + contrôle
        n: [],
        evenementsInterventions: []
    };

    for (var s = 0; s < snapshots.length; s++) {
        var snapshot = snapshots[s];
        var numSem = snapshot.numSemaine || snapshot.numeroSemaine || 0;
        var etudiants = snapshot.etudiants || [];
        var dateSeance = snapshot.dateSeance || snapshot.dateDebut || '';
        var dateRef = dateSeance.substring(0, 10); // YYYY-MM-DD

        resultat.semaines.push(numSem);
        resultat.labels.push('Sem. ' + numSem);
        resultat.dates.push(dateRef);

        // Extraire valeurs A, C, P pour étudiants valides
        var valeursA = [], valeursC = [], valeursP = [], valeursInterv = [];
        var dasValides = [];

        for (var e = 0; e < etudiants.length; e++) {
            var etu = etudiants[e];
            if (etu.A == null || etu.C == null || etu.P == null) continue;
            if (isNaN(etu.A) || isNaN(etu.C) || isNaN(etu.P)) continue;

            valeursA.push(etu.A);
            valeursC.push(etu.C);
            valeursP.push(etu.P);

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

        // Moyennes du groupe (depuis snapshot.groupe ou calculées)
        if (snapshot.groupe && snapshot.groupe.moyenneA != null) {
            resultat.moyennes.A.push(snapshot.groupe.moyenneA);
            resultat.moyennes.C.push(snapshot.groupe.moyenneC);
            resultat.moyennes.P.push(snapshot.groupe.moyenneP);
        } else if (n > 0) {
            var sA = 0, sC = 0, sP = 0;
            for (var si2 = 0; si2 < n; si2++) { sA += valeursA[si2]; sC += valeursC[si2]; sP += valeursP[si2]; }
            resultat.moyennes.A.push(Math.round(sA / n * 10) / 10);
            resultat.moyennes.C.push(Math.round(sC / n * 10) / 10);
            resultat.moyennes.P.push(Math.round(sP / n * 10) / 10);
        } else {
            resultat.moyennes.A.push(null);
            resultat.moyennes.C.push(null);
            resultat.moyennes.P.push(null);
        }

        if (n < SEUIL_MIN_ETUDIANTS) {
            resultat.correlations.AP.push(null);
            resultat.correlations.CP.push(null);
            continue;
        }

        resultat.correlations.AP.push(calculerCorrelationPearson(valeursA, valeursP));
        resultat.correlations.CP.push(calculerCorrelationPearson(valeursC, valeursP));

        // Marquer les interventions dont la date correspond à cette séance
        for (var ii = 0; ii < interventions.length; ii++) {
            var intDate = (interventions[ii].date || '').substring(0, 10);
            if (intDate === dateRef) {
                var cleInterv = interventions[ii].id || (intDate + interventions[ii].titre);
                if (!interventionsVues[cleInterv]) {
                    interventionsVues[cleInterv] = true;
                    evenementsInterventions.push({
                        indexSeance: s,
                        titre: (typeof window.titreInterventionAffiche === 'function' ? window.titreInterventionAffiche(interventions[ii]) : interventions[ii].titre) || 'Intervention',   // Lot A, R4
                        type: interventions[ii].type || 'groupe',
                        niveauRai: interventions[ii].niveauRai || 2
                    });
                }
            }
        }
    }

    resultat.evenementsInterventions = evenementsInterventions;

    // #241 (lot 11, 11 oct. 2026) — « P sans reprises » sur les courbes d'intervention : une reprise
    // relève P après coup et peut se lire comme l'effet d'une intervention. Même calcul que le profil
    // individuel (`deltasReprisesParSeance`, impact-jetons.js), par élève, puis moyenné sur le groupe.
    // `null` quand aucune reprise ne change P dans ce groupe : pas de courbe à tracer.
    var datesSnapshots = snapshots.map(function(sn) { return sn.dateSeance || sn.dateDebut || ''; });
    var cacheReprises = {};
    function infoReprises(da) {
        if (!(da in cacheReprises)) {
            cacheReprises[da] = (typeof window.deltasReprisesParSeance === 'function')
                ? window.deltasReprisesParSeance(da, datesSnapshots) : null;
        }
        return cacheReprises[da];
    }
    function moyennesPDuGroupe(estDansGroupe, idxDebut) {
        var avec = [], sans = [], ecartVu = false;
        for (var sp = 0; sp < snapshots.length; sp++) {
            if (sp < idxDebut) { avec.push(null); sans.push(null); continue; }
            var etus = snapshots[sp].etudiants || [];
            var somP = 0, somSans = 0, nbP = 0;
            for (var ep = 0; ep < etus.length; ep++) {
                if (!estDansGroupe(etus[ep].da) || etus[ep].P == null || isNaN(etus[ep].P)) continue;
                var ecart = (typeof window.ecartReprisesALaSeance === 'function')
                    ? window.ecartReprisesALaSeance(infoReprises(etus[ep].da), sp) : 0;
                if (ecart !== 0) ecartVu = true;
                somP += etus[ep].P;
                somSans += etus[ep].P - ecart;
                nbP++;
            }
            avec.push(nbP > 0 ? Math.round(somP / nbP * 10) / 10 : null);
            sans.push(nbP > 0 ? Math.round(somSans / nbP * 10) / 10 : null);
        }
        return { moyP: avec, moyPSansReprises: ecartVu ? sans : null };
    }

    // Construire les courbes P par intervention (groupes figés)
    // Chaque intervention a son propre groupe d'étudiants ciblés, fixe dans le temps
    var tousLesCibles = {}; // DA → true pour tous les étudiants ciblés par au moins une intervention N2
    for (var ci = 0; ci < interventions.length; ci++) {
        var interv = interventions[ci];
        if (!interv.etudiants || interv.etudiants.length === 0) continue;
        // 1 seul étudiant → analysé dans le profil individuel, pas au niveau groupe
        if (interv.etudiants.length <= 1) continue;
        var dateInterv = (interv.date || '').substring(0, 10);
        if (!dateInterv) continue;

        var dasCibles = interv.etudiants.slice(); // copie figée
        for (var dc = 0; dc < dasCibles.length; dc++) tousLesCibles[dasCibles[dc]] = true;

        // Trouver l'index de la séance de l'intervention (ou la plus proche après).
        // #729 (11 oct. 2026) — aucune séance à sa date ou après (intervention postérieure à la
        // dernière séance) : la courbe reste vide. Le défaut 0 la faisait partir du tout début.
        var idxDebut = resultat.dates.length;
        for (var sd = 0; sd < resultat.dates.length; sd++) {
            if (resultat.dates[sd] >= dateInterv) { idxDebut = sd; break; }
        }

        // Calculer moy P de ce groupe figé à chaque séance (null avant l'intervention)
        var moyennesInterv = moyennesPDuGroupe(function(da) { return dasCibles.indexOf(da) !== -1; }, idxDebut);

        var titreCourtInterv = (typeof window.titreInterventionAffiche === 'function' ? window.titreInterventionAffiche(interv) : interv.titre) || ('Intervention ' + (ci + 1));   // Lot A, R4
        if (titreCourtInterv.length > 20) titreCourtInterv = titreCourtInterv.substring(0, 18) + '…';

        resultat.interventionsCourbes.push({
            titre: titreCourtInterv,
            nbEtudiants: dasCibles.length,
            niveauRai: interv.niveauRai || 2,
            moyP: moyennesInterv.moyP,
            moyPSansReprises: moyennesInterv.moyPSansReprises
        });
    }

    // Courbe contrôle : étudiants jamais ciblés par aucune intervention
    var moyennesControle = moyennesPDuGroupe(function(da) { return !tousLesCibles[da]; }, 0);
    resultat.interventionsCourbes.push({
        titre: 'Contrôle',
        nbEtudiants: null,
        niveauRai: 0,
        moyP: moyennesControle.moyP,
        moyPSansReprises: moyennesControle.moyPSansReprises
    });

    // Mapper les artefacts aux séances via leur échéance
    // Clé = index de la séance dans resultat (pas numéro de semaine)
    resultat.artefactsParSeance = {};
    try {
        var productions;
        var infoCours;
        var cadre;
        if (window.LaboCodexData && typeof window.LaboCodexData.lireDonneesNamespacees === 'function') {
            productions = window.LaboCodexData.lireDonneesNamespacees('productions') || [];
            infoCours = window.LaboCodexData.lireInfoCours();
            cadre = window.LaboCodexData.lireDonneesNamespacees('cadreCalendrier') || {};
            // lireDonneesNamespacees peut renvoyer un tableau si plusieurs groupes ; ici on attend un objet.
            if (Array.isArray(cadre)) cadre = cadre[0] || {};
        } else {
            productions = (typeof obtenirDonneesSelonMode === 'function')
                ? obtenirDonneesSelonMode('productions') || []
                : [];
            infoCours = db.getSync('infoCours', null);
            cadre = db.getSync(cle('cadreCalendrier'), {});
        }
        var gcId = obtenirIdContexteActif(infoCours);

        // Borne inférieure du semestre
        var dateDebutSem = (cadre && cadre.dateDebut) || '';

        var prodFiltrees = productions.filter(function(p) {
            if (p.facultatif || p.type === 'portfolio') return false;
            if (typeof obtenirEcheanceEffective === 'function') {
                var ech = obtenirEcheanceEffective(p, gcId);
                return ech.assignee && !!ech.date && ech.date >= dateDebutSem;
            }
            return !!p.dateEcheance && p.dateEcheance >= dateDebutSem;
        });

        for (var pi = 0; pi < prodFiltrees.length; pi++) {
            var prod = prodFiltrees[pi];
            var dateEch = '';
            if (typeof obtenirEcheanceEffective === 'function') {
                dateEch = obtenirEcheanceEffective(prod, gcId).date || '';
            } else {
                dateEch = prod.dateEcheance || '';
            }
            if (!dateEch) continue;
            var dateEchNorm = dateEch.substring(0, 10);

            // Trouver la séance la plus proche (dernière séance dont la date <= échéance)
            var idxSeance = -1;
            for (var fi = 0; fi < resultat.dates.length; fi++) {
                if (resultat.dates[fi] <= dateEchNorm) {
                    idxSeance = fi;
                } else {
                    break; // dates triées, on dépasse
                }
            }
            // Si l'échéance tombe exactement sur une date de séance, préférer celle-ci
            var idxExact = resultat.dates.indexOf(dateEchNorm);
            if (idxExact !== -1) idxSeance = idxExact;

            if (idxSeance >= 0) {
                if (!resultat.artefactsParSeance[idxSeance]) resultat.artefactsParSeance[idxSeance] = [];
                resultat.artefactsParSeance[idxSeance].push({
                    titre: prod.titre || 'Sans titre',
                    activite: prod.activiteApprentissage || prod.description || ''
                });
            }
        }
    } catch (e) {
        console.warn('⚠️ Mapping artefacts-séances non disponible', e);
    }

    // Indexer les interventions par index de séance pour accès rapide
    resultat.interventionsParSeance = {};
    for (var ei = 0; ei < evenementsInterventions.length; ei++) {
        var evt = evenementsInterventions[ei];
        if (!resultat.interventionsParSeance[evt.indexSeance]) {
            resultat.interventionsParSeance[evt.indexSeance] = [];
        }
        resultat.interventionsParSeance[evt.indexSeance].push(evt);
    }

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

        // Codex data en mode « tous fusionnés » : pas pertinent pour les corrélations longitudinales
        if (window.LaboCodexData && window.LaboCodexData.modeConsultation() === 'codex-data-tous') {
            if (typeof afficherMessageAttente === 'function') {
                afficherMessageAttente(canvas,
                    'Sélectionne un groupe-cours',
                    'Les corrélations longitudinales se calculent par groupe-cours (calendriers et cohortes différents).');
            }
            return;
        }

        // Calculer les données
        var donnees = calculerCorrelationsLongitudinales();
        if (!donnees || donnees.semaines.length < 2) {
            if (typeof afficherMessageAttente === 'function') {
                afficherMessageAttente(canvas, 'Données insuffisantes', 'Au moins 2 semaines de relevés nécessaires');
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

        // Construire les tableaux de styles par point :
        // ◎ double cercle vide = séance avec artefact, ● cercle plein = séance normale
        var nbPoints = donnees.labels.length;
        var pointStyles = [];
        var pointRadii = [];
        var pointBorderWidths = [];
        var isArtefact = []; // pour générer bgColor par dataset
        for (var ps = 0; ps < nbPoints; ps++) {
            if (donnees.artefactsParSeance && donnees.artefactsParSeance[ps]) {
                pointStyles.push('circle');
                pointRadii.push(5);
                pointBorderWidths.push(3);
                isArtefact.push(true);
            } else {
                pointStyles.push('circle');
                pointRadii.push(4);
                pointBorderWidths.push(2);
                isArtefact.push(false);
            }
        }

        // Helper : générer un tableau de bgColor par point (transparent si artefact)
        var bordurePoint = estModeClair ? '#fff' : '#1a2a3a';
        function bgParPoint(couleur) {
            return isArtefact.map(function(a) { return a ? 'transparent' : couleur; });
        }

        // Datasets
        var datasets = [
            {
                label: 'A ↔ P',
                data: donnees.correlations.AP,
                borderColor: COULEURS_CORR.AP,
                backgroundColor: COULEURS_CORR.AP,
                borderWidth: 2.5,
                tension: 0.25,
                pointStyle: pointStyles,
                pointRadius: pointRadii,
                pointHoverRadius: 7,
                pointBackgroundColor: bgParPoint(COULEURS_CORR.AP),
                pointBorderColor: bordurePoint,
                pointBorderWidth: pointBorderWidths,
                spanGaps: false
            },
            {
                label: 'C ↔ P',
                data: donnees.correlations.CP,
                borderColor: COULEURS_CORR.CP,
                backgroundColor: COULEURS_CORR.CP,
                borderWidth: 2.5,
                tension: 0.25,
                pointStyle: pointStyles,
                pointRadius: pointRadii,
                pointHoverRadius: 7,
                pointBackgroundColor: bgParPoint(COULEURS_CORR.CP),
                pointBorderColor: bordurePoint,
                pointBorderWidth: pointBorderWidths,
                spanGaps: false
            },
        ];

        // Datasets interventions : une courbe P par intervention + contrôle
        var COULEURS_INTERV = ['#EF5350', '#FFA726', '#66BB6A', '#42A5F5'];
        var courbes = donnees.interventionsCourbes || [];
        for (var ci = 0; ci < courbes.length; ci++) {
            var courbe = courbes[ci];
            var estControle = courbe.niveauRai === 0;
            var couleurInterv = estControle ? '#4CAF50' : (COULEURS_INTERV[ci] || COULEURS_INTERV[0]);
            var labelInterv = estControle ? 'P contrôle' : ('P · ' + courbe.titre);
            datasets.push({
                label: labelInterv,
                data: courbe.moyP,
                borderColor: couleurInterv,
                backgroundColor: couleurInterv,
                borderWidth: 2,
                borderDash: estControle ? [6, 3] : [8, 4],
                tension: 0.25,
                pointStyle: pointStyles,
                pointRadius: pointRadii,
                pointHoverRadius: 6,
                pointBackgroundColor: bgParPoint(couleurInterv),
                pointBorderColor: bordurePoint,
                pointBorderWidth: pointBorderWidths,
                spanGaps: true,
                yAxisID: 'yPct',
                _intervIndex: ci
            });
            // #241 : la même courbe sans l'apport des reprises, en pointillé fin, seulement si une
            // reprise a changé P dans ce groupe. Mot de la légende : celui du profil individuel.
            if (courbe.moyPSansReprises) {
                datasets.push({
                    label: 'P sans reprises · ' + (estControle ? 'contrôle' : courbe.titre),
                    data: courbe.moyPSansReprises,
                    borderColor: couleurInterv,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderDash: [2, 3],
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    spanGaps: true,
                    yAxisID: 'yPct',
                    _intervIndex: ci
                });
            }
        }

        // Datasets overlay : moyennes A, C, P (axe Y secondaire, masqués par défaut)
        var COULEURS_MOY = COULEURS.indices;
        var nomsIndices = { A: 'Moy. A', C: 'Moy. C', P: 'Moy. P' };
        var indices = ['A', 'C', 'P'];
        for (var di = 0; di < indices.length; di++) {
            var indice = indices[di];
            datasets.push({
                label: nomsIndices[indice],
                data: donnees.moyennes[indice],
                borderColor: COULEURS_MOY[indice],
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                tension: 0.25,
                pointStyle: pointStyles,
                pointRadius: pointRadii,
                pointHoverRadius: 4,
                pointBackgroundColor: bgParPoint(COULEURS_MOY[indice]),
                pointBorderWidth: pointBorderWidths,
                spanGaps: true,
                yAxisID: 'yPct',
                hidden: true
            });
        }

        // Plugin : triangles d'intervention au-dessus des points de données
        var pluginInterventions = {
            id: 'interventionMarkers',
            afterDatasetsDraw: function(chart) {
                if (!donnees.interventionsParSeance) return;
                var xScale = chart.scales.x;
                var yScale = chart.scales.y;
                var ctx2 = chart.ctx;
                var couleurN2 = '#FFA726'; // Orange — niveau 2
                var couleurN3 = '#EF5350'; // Rouge — niveau 3

                for (var idxStr in donnees.interventionsParSeance) {
                    var idx = Number(idxStr);
                    var intervs = donnees.interventionsParSeance[idxStr];
                    var x = xScale.getPixelForValue(idx);

                    // Trouver le point le plus haut parmi les datasets visibles pour cette séance
                    var yMin = yScale.bottom; // bas du graphique (pixel le plus grand)
                    var datasets = chart.data.datasets;
                    for (var di = 0; di < datasets.length; di++) {
                        if (datasets[di].hidden || datasets[di].yAxisID === 'yPct') continue;
                        var val = datasets[di].data[idx];
                        if (val == null) continue;
                        var yPx = yScale.getPixelForValue(val);
                        if (yPx < yMin) yMin = yPx; // plus haut visuellement = pixel plus petit
                    }

                    // Niveau le plus élevé parmi les interventions de cette séance
                    var niveauMax = 2;
                    for (var ni = 0; ni < intervs.length; ni++) {
                        if (intervs[ni].niveauRai > niveauMax) niveauMax = intervs[ni].niveauRai;
                    }

                    // Triangle pointant vers le bas, au-dessus du point le plus haut
                    var triY = yMin - 12;
                    var triSize = 5;
                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.moveTo(x - triSize, triY - triSize);
                    ctx2.lineTo(x + triSize, triY - triSize);
                    ctx2.lineTo(x, triY + triSize);
                    ctx2.closePath();
                    ctx2.fillStyle = niveauMax >= 3 ? couleurN3 : couleurN2;
                    ctx2.globalAlpha = 0.8;
                    ctx2.fill();
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
                        display: false
                    },
                    tooltip: Object.assign({}, (window.STYLE_GRAPHIQUE && window.STYLE_GRAPHIQUE.tooltip) || {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 6,
                        padding: 10
                    }, {
                        mode: 'nearest',
                        intersect: true,
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
                                if (context.dataset.yAxisID === 'yPct') {
                                    var pctStr = val != null ? val.toFixed(1).replace('.', ',') + '%' : '—';
                                    return ' ' + context.dataset.label + ' : ' + pctStr;
                                }
                                var rStr = val != null ? val.toFixed(3).replace('.', ',') : '—';
                                return ' ' + context.dataset.label + ' : r = ' + rStr + '  (n = ' + nEtu + ')';
                            },
                            afterBody: function(tooltipItems) {
                                var idx = tooltipItems[0].dataIndex;
                                var lignes = [];

                                // Artefacts de cette séance
                                var arts = donnees.artefactsParSeance ? donnees.artefactsParSeance[idx] : null;
                                if (arts && arts.length > 0) {
                                    lignes.push('');
                                    lignes.push('▪ Productions :');
                                    for (var ai = 0; ai < arts.length; ai++) {
                                        var ligne = '  ' + arts[ai].titre;
                                        if (arts[ai].activite) ligne += ' — ' + arts[ai].activite;
                                        lignes.push(ligne);
                                    }
                                }

                                // Interventions de cette séance
                                var intervs = donnees.interventionsParSeance ? donnees.interventionsParSeance[idx] : null;
                                if (intervs && intervs.length > 0) {
                                    lignes.push('');
                                    for (var ii = 0; ii < intervs.length; ii++) {
                                        lignes.push('▲ Intervention N' + intervs[ii].niveauRai + ' : ' + intervs[ii].titre);
                                    }
                                }

                                // P par intervention
                                var courbes = donnees.interventionsCourbes || [];
                                var aDesP = false;
                                for (var ci2 = 0; ci2 < courbes.length; ci2++) {
                                    var val2 = courbes[ci2].moyP[idx];
                                    if (val2 != null) {
                                        if (!aDesP) { lignes.push(''); aDesP = true; }
                                        var lbl = courbes[ci2].niveauRai === 0 ? 'Contrôle' : courbes[ci2].titre;
                                        var nb = courbes[ci2].nbEtudiants;
                                        lignes.push((courbes[ci2].niveauRai === 0 ? '○' : '●') + ' ' + lbl + ' : P = ' + val2.toFixed(1).replace('.', ',') + '%' + (nb ? ' (n=' + nb + ')' : ''));
                                    }
                                }

                                return lignes;
                            }
                        }
                    })
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Séance',
                            color: couleurTexte,
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: couleurTexte,
                            font: { size: 10 },
                            maxRotation: 45,
                            minRotation: 45
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
                    },
                    yPct: {
                        position: 'right',
                        min: 0,
                        max: 100,
                        display: true,
                        title: {
                            display: true,
                            text: 'Moyenne (%)',
                            color: couleurTexte,
                            font: { size: 11 }
                        },
                        ticks: {
                            color: couleurTexte,
                            font: { size: 10 },
                            stepSize: 25,
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { display: false }
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
                nbSem + ' semaines (' + dernierN + ' étudiant·es). Lignes pointillées : seuils faible (±0,3) et modéré (±0,5).';
        }

        // Générer les checkboxes intervention dynamiquement
        var conteneurChk = document.getElementById('checkboxes-interventions-corr');
        if (conteneurChk && courbes.length > 0) {
            conteneurChk.innerHTML = '';
            for (var cb = 0; cb < courbes.length; cb++) {
                var courbeChk = courbes[cb];
                var estCtrl = courbeChk.niveauRai === 0;
                var coulChk = estCtrl ? '#4CAF50' : (COULEURS_INTERV[cb] || COULEURS_INTERV[0]);
                var labelChk = estCtrl ? 'P contrôle' : ('P · ' + courbeChk.titre);
                var lbl = document.createElement('label');
                lbl.style.cssText = 'display:inline-flex;align-items:center;gap:4px;cursor:pointer;color:' + coulChk + ';font-size:0.78rem;';
                var inp = document.createElement('input');
                inp.type = 'checkbox';
                inp.checked = true;
                inp.dataset.intervLabel = labelChk;
                inp.addEventListener('change', function() {
                    toggleCorrelationByLabel(this.dataset.intervLabel, this.checked);
                });
                lbl.appendChild(inp);
                // SVG indicateur de style de ligne (pointillé pour interventions)
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '2');
                var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', '0');
                line.setAttribute('y1', '1');
                line.setAttribute('x2', '16');
                line.setAttribute('y2', '1');
                line.setAttribute('stroke', coulChk);
                line.setAttribute('stroke-width', '2');
                line.setAttribute('stroke-dasharray', estCtrl ? '4 3' : '6 3');
                svg.appendChild(line);
                lbl.appendChild(svg);
                lbl.appendChild(document.createTextNode(' ' + labelChk));
                conteneurChk.appendChild(lbl);
            }
        }



    } catch (err) {
        console.error('❌ Erreur création graphique corrélations longitudinales:', err);
    }
}

/**
 * Ajuste les bornes des deux axes Y aux données visibles.
 */
function _ajusterAxeY() {
    if (!graphiqueCorrLongInstance) return;
    var datasets = graphiqueCorrLongInstance.data.datasets;

    // Axe gauche (corrélations, échelle -1 à 1)
    var minCorr = Infinity, maxCorr = -Infinity, aDesCorr = false;
    // Axe droit (pourcentages, échelle 0 à 100)
    var minPct = Infinity, maxPct = -Infinity, aDesPct = false;

    for (var i = 0; i < datasets.length; i++) {
        if (datasets[i].hidden) continue;
        var data = datasets[i].data;
        var estPct = datasets[i].yAxisID === 'yPct';

        for (var j = 0; j < data.length; j++) {
            if (data[j] == null) continue;
            if (estPct) {
                aDesPct = true;
                if (data[j] < minPct) minPct = data[j];
                if (data[j] > maxPct) maxPct = data[j];
            } else {
                aDesCorr = true;
                if (data[j] < minCorr) minCorr = data[j];
                if (data[j] > maxCorr) maxCorr = data[j];
            }
        }
    }

    // Axe gauche (r)
    if (!aDesCorr || minCorr === Infinity) {
        graphiqueCorrLongInstance.options.scales.y.min = -1;
        graphiqueCorrLongInstance.options.scales.y.max = 1;
    } else {
        var margeR = 0.15;
        var yMinR = Math.floor((minCorr - margeR) * 4) / 4;
        var yMaxR = Math.ceil((maxCorr + margeR) * 4) / 4;
        if (yMinR < -1) yMinR = -1;
        if (yMaxR > 1) yMaxR = 1;
        graphiqueCorrLongInstance.options.scales.y.min = yMinR;
        graphiqueCorrLongInstance.options.scales.y.max = yMaxR;
    }

    // Axe droit (%)
    if (!aDesPct || minPct === Infinity) {
        graphiqueCorrLongInstance.options.scales.yPct.min = 0;
        graphiqueCorrLongInstance.options.scales.yPct.max = 100;
    } else {
        var margePct = 5;
        var yMinP = Math.floor((minPct - margePct) / 5) * 5;
        var yMaxP = Math.ceil((maxPct + margePct) / 5) * 5;
        if (yMinP < 0) yMinP = 0;
        if (yMaxP > 100) yMaxP = 100;
        graphiqueCorrLongInstance.options.scales.yPct.min = yMinP;
        graphiqueCorrLongInstance.options.scales.yPct.max = yMaxP;
    }
}

/**
 * Met à jour la visibilité de l'axe yPct et ajuste l'axe Y.
 */
function _majAxes() {
    if (!graphiqueCorrLongInstance) return;
    var datasets = graphiqueCorrLongInstance.data.datasets;
    var auMoinsUnPct = false;
    for (var j = 0; j < datasets.length; j++) {
        if (datasets[j].yAxisID === 'yPct' && !datasets[j].hidden) {
            auMoinsUnPct = true; break;
        }
    }
    graphiqueCorrLongInstance.options.scales.yPct.display = auMoinsUnPct;
    _ajusterAxeY();
    graphiqueCorrLongInstance.update();
}

function toggleCorrelation(cle, visible) {
    if (typeof visible === 'object' && visible !== null) visible = visible.checked;
    if (!graphiqueCorrLongInstance) return;
    var labels = { AP: 'A ↔ P', CP: 'C ↔ P' };
    var label = labels[cle];
    if (!label) return;
    toggleCorrelationByLabel(label, visible);
}

function toggleCorrelationByLabel(label, visible) {
    if (!graphiqueCorrLongInstance) return;
    var datasets = graphiqueCorrLongInstance.data.datasets;
    for (var i = 0; i < datasets.length; i++) {
        if (datasets[i].label === label) {
            datasets[i].hidden = !visible;
            break;
        }
    }
    _majAxes();
}

/**
 * Toggle d'un overlay moyenne sur le graphique.
 * @param {string} indice - 'A', 'C', 'P' ou 'E'
 * @param {boolean} visible - true pour afficher
 */
function toggleOverlayMoyenne(indice, visible) {
    if (typeof visible === 'object' && visible !== null) visible = visible.checked;
    if (!graphiqueCorrLongInstance) return;
    var label = 'Moy. ' + indice;
    var datasets = graphiqueCorrLongInstance.data.datasets;
    for (var i = 0; i < datasets.length; i++) {
        if (datasets[i].label === label) {
            datasets[i].hidden = !visible;
            break;
        }
    }
    _majAxes();
}

// Exposer les fonctions globalement
window.creerGraphiqueCorrelationsLongitudinales = creerGraphiqueCorrelationsLongitudinales;
window.calculerCorrelationsLongitudinales = calculerCorrelationsLongitudinales;
window.toggleCorrelation = toggleCorrelation;
window.toggleCorrelationByLabel = toggleCorrelationByLabel;
window.toggleOverlayMoyenne = toggleOverlayMoyenne;

})();
