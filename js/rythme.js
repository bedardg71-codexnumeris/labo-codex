/* ===============================
   MODULE: RYTHME DE TRAVAIL
   Statistiques d'évaluation par activité d'apprentissage.
   Onglet dans Boîte à outils.

   SOURCES (lecture seule, SSOT) :
   - cle('chronoEvaluations')        — historique chronomètre (primaire)
   - cle('evaluationsSauvegardees')  — durées dans les évaluations sauvegardées (backup)
   - cle('productions')              — pour mapper productionId → activité

   DÉPENDANCES : db.js, modes.js (obtenirDonneesSelonMode)
   =============================== */

(function () {
    'use strict';

    var _dernieresEstimations = null;
    var _rafraichirTimer = null;

    /* ===============================
       COLLECTE DES DONNÉES
       =============================== */

    /**
     * Collecte les évaluations avec statut évalué (source de vérité pour N)
     * et enrichit les durées depuis le chronomètre quand disponible.
     * Dédoublonne par productionId + etudiantDA.
     * @returns {Array<{dureeMs: number, activite: string, productionId: string, productionNom: string, date: string, groupeCoursId: string}>}
     */
    function collecterDurees() {
        var productions = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions')
            : db.getSync(cle('productions'), []);
        var prodMap = {};
        productions.forEach(function (p) {
            prodMap[p.id] = p;
        });

        // Index chrono par productionId|etudiantDA (durée la plus récente)
        var chronoDurees = {};
        var chrono = db.getSync(cle('chronoEvaluations'), []);
        chrono.forEach(function (e) {
            if (!e.dureeMs || e.dureeMs < 5000 || !e.etudiantDA || !e.productionId) return;
            var k = e.productionId + '|' + e.etudiantDA;
            if (!chronoDurees[k] || (e.date || '') > (chronoDurees[k].date || '')) {
                chronoDurees[k] = { dureeMs: e.dureeMs, date: e.date || '' };
            }
        });

        // Source de vérité : évaluations sauvegardées (une par élève par production)
        var evaluations = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('evaluationsSauvegardees')
            : [];
        var vus = {};
        var entrees = [];

        evaluations.forEach(function (ev) {
            if (!ev.etudiantDA || !ev.productionId) return;
            if (ev.remplaceeParId) return;
            var cleDedup = ev.productionId + '|' + ev.etudiantDA;
            if (vus[cleDedup]) return;
            vus[cleDedup] = true;

            // Durée : chrono (plus précis) > dureeEvaluation > 0
            var chronoInfo = chronoDurees[cleDedup];
            var dureeMs = 0;
            if (chronoInfo) {
                dureeMs = chronoInfo.dureeMs;
            } else if (ev.dureeEvaluation && ev.dureeEvaluation >= 5) {
                dureeMs = ev.dureeEvaluation * 1000;
            }

            var prod = prodMap[ev.productionId];
            var activite = prod ? (prod.activiteApprentissage || prod.description || '') : '';

            entrees.push({
                dureeMs: dureeMs,
                activite: activite,
                productionId: ev.productionId,
                productionNom: prod ? prod.titre : '',
                date: ev.dateCreation || ev.dateModification || '',
                groupeCoursId: ev.groupeCoursId || ''
            });
        });

        return entrees;
    }

    /* ===============================
       CALCUL DES STATISTIQUES
       =============================== */

    /**
     * Calcule les statistiques par activité d'apprentissage.
     * @returns {Array<{activite: string, moyenne: number, mediane: number, min: number, max: number, count: number, tendance: string}>}
     */
    function calculerStatsParActivite(entrees) {
        // Regrouper par activité avec métadonnées
        var groupes = {};
        entrees.forEach(function (e) {
            var act = e.activite || '(sans activité)';
            if (!groupes[act]) groupes[act] = { durees: [], total: 0, productions: {}, dateMin: '', dateMax: '' };
            var g = groupes[act];
            g.total++;
            if (e.dureeMs > 0) g.durees.push(e.dureeMs);
            if (e.productionNom) g.productions[e.productionNom] = true;
            if (e.date) {
                var d = e.date.substring(0, 10);
                if (!g.dateMin || d < g.dateMin) g.dateMin = d;
                if (!g.dateMax || d > g.dateMax) g.dateMax = d;
            }
        });

        var stats = [];
        for (var act in groupes) {
            var g = groupes[act];
            var durees = g.durees.sort(function (a, b) { return a - b; });
            var n = durees.length;
            if (n === 0) continue;
            var somme = durees.reduce(function (s, d) { return s + d; }, 0);
            var moyenne = somme / n;
            var mediane = n % 2 === 0
                ? (durees[n / 2 - 1] + durees[n / 2]) / 2
                : durees[Math.floor(n / 2)];

            // Tendance : comparer la moyenne des 5 dernières vs les 5 précédentes
            var tendance = '→';
            if (n >= 6) {
                var recentes = g.durees.slice(-5);
                var precedentes = g.durees.slice(-10, -5);
                if (precedentes.length >= 3) {
                    var moyRecentes = recentes.reduce(function (s, d) { return s + d; }, 0) / recentes.length;
                    var moyPrecedentes = precedentes.reduce(function (s, d) { return s + d; }, 0) / precedentes.length;
                    var delta = (moyRecentes - moyPrecedentes) / moyPrecedentes;
                    if (delta < -0.10) tendance = '↘';      // accélère (>10% plus rapide)
                    else if (delta > 0.10) tendance = '↗';   // ralentit
                }
            }

            stats.push({
                activite: act,
                moyenne: moyenne,
                mediane: mediane,
                min: durees[0],
                max: durees[n - 1],
                count: g.total,
                tendance: tendance,
                productions: Object.keys(g.productions),
                dateMin: g.dateMin,
                dateMax: g.dateMax
            });
        }

        // Trier par nombre décroissant (activités les plus utilisées en haut)
        stats.sort(function (a, b) { return b.count - a.count; });
        return stats;
    }

    /* ===============================
       ESTIMATION DE LA CHARGE
       =============================== */

    /**
     * Estime la charge pour les productions en cours.
     * @returns {Array<{productionNom: string, activite: string, groupes: Array, totalCopies: number, moyenneMs: number, tempsEstime: number}>}
     */
    function estimerCharge(statsMap) {
        var productions = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions')
            : db.getSync(cle('productions'), []);
        var evaluations = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('evaluationsSauvegardees')
            : [];
        // Fichiers importés : source de vérité = travauxStockage
        var fichiers = (typeof travauxStockage !== 'undefined' && travauxStockage.obtenirFichiersTravaux)
            ? travauxStockage.obtenirFichiersTravaux()
            : db.getSync(cle('fichiersTravaux'), []);
        var prefs = chargerPreferences();
        var groupesCours = db.getSync(cle('groupesCours'), []);

        var estimations = [];

        productions.forEach(function (prod) {
            var activite = prod.activiteApprentissage || prod.description || '';
            var stats = statsMap[activite];
            if (!stats) return;

            var echeances = prod.echeancesParGroupe || {};
            var gcIds = Object.keys(echeances);

            // Si pas d'échéances par groupe, traiter globalement (legacy)
            if (gcIds.length === 0) {
                var est = estimerPourLot(prod, null, null, fichiers, evaluations, stats, prefs);
                if (est) estimations.push(est);
                return;
            }

            // Ventiler par groupe-cours
            gcIds.forEach(function (gcId) {
                var entree = echeances[gcId];
                // #1009 (1er oct. 2026) : la charge se mesure aux copies EN MAIN,
                // pas à la case « Consignes transmises ». Un lot dont la case est
                // restée décochée mais dont les copies sont importées est du
                // travail à faire ; l'écarter ici faisait disparaître la ligne
                // entière. Un groupe non assigné ET sans copie ni évaluation reste
                // absent : `estimerPourLot` rend null dans ce cas.
                if (!entree) return;
                var gc = groupesCours.find(function (g) { return g.id === gcId; });
                var groupeNum = gc ? (gc.groupeNum || '') : '';
                var est = estimerPourLot(prod, gcId, groupeNum, fichiers, evaluations, stats, prefs);
                if (est) {
                    est.dateRemise = entree.date || '';
                    estimations.push(est);
                }
            });
        });

        return estimations;
    }

    /**
     * Estime la charge pour un lot production × groupe (ou production globale si gcId est null).
     */
    function estimerPourLot(prod, gcId, groupeNum, fichiers, evaluations, stats, prefs) {
        var activite = prod.activiteApprentissage || prod.description || '';

        // DAs avec un fichier importé pour cette production (et ce groupe si ventilé)
        var dasImportes = {};
        fichiers.forEach(function (f) {
            if (f.productionId !== prod.id || !f.etudiantDA) return;
            if (gcId && f.groupeCoursId !== gcId) return;
            dasImportes[f.etudiantDA] = true;
        });

        // DAs qui ont déjà une évaluation NOTÉE (statut ÉVALUÉ)
        // Une évaluation sans critères (ex. uniquement un jeton de délai appliqué)
        // est considérée « vide » par calculerStatutWorkflow (liste-evaluations.js:22-34)
        // et reste au statut « Importé ». On applique la même règle ici pour que
        // copiesRestantes corresponde exactement au filtre « Importé » de la liste.
        var dasEvalues = {};
        evaluations.forEach(function (ev) {
            if (ev.productionId !== prod.id || !ev.etudiantDA || ev.remplaceeParId) return;
            if (gcId && ev.groupeCoursId !== gcId) return;
            if (!Array.isArray(ev.criteres) || ev.criteres.length === 0) return;
            dasEvalues[ev.etudiantDA] = true;
        });

        // Statut IMPORTÉ = fichier importé SANS évaluation
        var copiesRestantes = 0;
        for (var da in dasImportes) {
            if (!dasEvalues[da]) copiesRestantes++;
        }
        var evalsFaites = Object.keys(dasEvalues).length;
        var nbImportes = Object.keys(dasImportes).length;
        if (copiesRestantes === 0 && evalsFaites === 0) return null;

        var tempsEstimeMs = copiesRestantes * stats.moyenne;
        var tempsTotal = tempsEstimeMs * prefs.marge;

        var nomLot = prod.titre + (activite ? ' — ' + activite : '');
        if (groupeNum) nomLot += ' (gr. ' + groupeNum + ')';

        return {
            productionId: prod.id,
            gcId: gcId || '',
            productionNom: nomLot,
            activite: activite,
            totalCopies: nbImportes,
            copiesFaites: evalsFaites,
            copiesRestantes: copiesRestantes,
            moyenneMs: stats.moyenne,
            tempsEstimeMs: tempsTotal,
            dateRemise: ''
        };
    }

    /* ===============================
       FORMATAGE
       =============================== */

    function formaterDuree(ms) {
        var totalSec = Math.round(ms / 1000);
        var min = Math.floor(totalSec / 60);
        var sec = totalSec % 60;
        return min + ':' + String(sec).padStart(2, '0');
    }

    function formaterDureeTexte(ms) {
        var totalMin = Math.round(ms / 60000);
        if (totalMin < 60) return totalMin + ' min';
        var h = Math.floor(totalMin / 60);
        var m = totalMin % 60;
        return h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '');
    }

    /* ===============================
       RENDU HTML
       =============================== */

    function afficherRythme() {
        var conteneur = document.getElementById('rythme-tableau-activites');
        if (!conteneur) return;

        var entrees = collecterDurees();

        if (entrees.length === 0) {
            conteneur.innerHTML =
                '<div class="journal-vide">' +
                    'Aucune donnée de durée disponible.<br>' +
                    'Active le chronomètre dans les préférences (Réglages) pour commencer à mesurer.' +
                '</div>';
            return;
        }

        // Restaurer les préférences dans le formulaire
        restaurerPreferences();

        var stats = calculerStatsParActivite(entrees);
        var maxMoyenne = Math.max.apply(null, stats.map(function (s) { return s.moyenne; }));

        // Colonnes du tableau 1 (durées par activité)
        var colonnesT1 = [
            { id: 'prod', label: 'Production', defaut: true },
            { id: 'periode', label: 'Période', defaut: true },
            { id: 'moy', label: 'Moy.', defaut: true },
            { id: 'med', label: 'Méd.', defaut: false },
            { id: 'min', label: 'Min', defaut: false },
            { id: 'max', label: 'Max', defaut: false },
            { id: 'n', label: 'N', defaut: true },
            { id: 'tendance', label: 'Tendance', defaut: true }
        ];
        var prefsCol1 = db.getSync('rythmeColonnesT1', null);
        if (!prefsCol1) {
            prefsCol1 = {};
            colonnesT1.forEach(function (c) { prefsCol1[c.id] = c.defaut; });
        }

        // Construire le tableau des durées par activité
        var html = '';

        // Checkboxes colonnes
        html += '<div class="rythme-colonnes-toggle">';
        html += 'Colonnes : ';
        colonnesT1.forEach(function (c) {
            var checked = prefsCol1[c.id] !== false ? ' checked' : '';
            html += '<label><input type="checkbox" data-tableau="t1" data-col="' + c.id + '"' + checked + '> ' + c.label + '</label>';
        });
        html += '</div>';

        html += '<table class="tableau" id="rythme-table-durees">';
        html += '<thead><tr>';
        html += '<th>Activité d\'apprentissage</th>';
        html += '<th class="rythme-col-t1-prod"' + (prefsCol1.prod === false ? ' hidden' : '') + '>Production</th>';
        html += '<th class="rythme-col-t1-periode rythme-col-centre"' + (prefsCol1.periode === false ? ' hidden' : '') + '>Période</th>';
        html += '<th class="rythme-col-t1-moy rythme-col-centre"' + (prefsCol1.moy === false ? ' hidden' : '') + '>Moy.</th>';
        html += '<th class="rythme-col-t1-med rythme-col-centre"' + (prefsCol1.med === false ? ' hidden' : '') + '>Méd.</th>';
        html += '<th class="rythme-col-t1-min rythme-col-centre"' + (prefsCol1.min === false ? ' hidden' : '') + '>Min</th>';
        html += '<th class="rythme-col-t1-max rythme-col-centre"' + (prefsCol1.max === false ? ' hidden' : '') + '>Max</th>';
        html += '<th class="rythme-col-t1-n rythme-col-centre"' + (prefsCol1.n === false ? ' hidden' : '') + '>N</th>';
        html += '<th class="rythme-col-t1-tendance rythme-col-tendance"' + (prefsCol1.tendance === false ? ' hidden' : '') + '>Tendance</th>';
        html += '</tr></thead><tbody>';

        // Map pour l'estimation
        var statsMap = {};

        stats.forEach(function (s) {
            statsMap[s.activite] = s;
            var pctBarre = maxMoyenne > 0 ? (s.moyenne / maxMoyenne * 100) : 0;
            var tendanceLabel = s.tendance === '↘' ? 'Accélère'
                : s.tendance === '↗' ? 'Ralentit' : 'Stable';

            // Productions associées
            var prodsLabel = s.productions.length > 0 ? s.productions.join(', ') : '—';
            // Période (date min — date max)
            var periodeLabel = '—';
            if (s.dateMin && s.dateMax) {
                periodeLabel = s.dateMin === s.dateMax
                    ? formaterDateCourte(s.dateMin)
                    : formaterDateCourte(s.dateMin) + ' — ' + formaterDateCourte(s.dateMax);
            }

            html += '<tr>';
            html += '<td><strong>' + echapperHtml(s.activite || '(sans activité)') + '</strong></td>';
            html += '<td class="rythme-col-t1-prod"' + (prefsCol1.prod === false ? ' hidden' : '') + '><small>' + echapperHtml(prodsLabel) + '</small></td>';
            html += '<td class="rythme-col-t1-periode rythme-col-nowrap"' + (prefsCol1.periode === false ? ' hidden' : '') + '><small>' + periodeLabel + '</small></td>';
            html += '<td class="rythme-col-t1-moy rythme-col-centre"' + (prefsCol1.moy === false ? ' hidden' : '') + '><strong>' + formaterDuree(s.moyenne) + '</strong></td>';
            html += '<td class="rythme-col-t1-med rythme-col-centre"' + (prefsCol1.med === false ? ' hidden' : '') + '>' + formaterDuree(s.mediane) + '</td>';
            html += '<td class="rythme-col-t1-min rythme-col-centre"' + (prefsCol1.min === false ? ' hidden' : '') + '>' + formaterDuree(s.min) + '</td>';
            html += '<td class="rythme-col-t1-max rythme-col-centre"' + (prefsCol1.max === false ? ' hidden' : '') + '>' + formaterDuree(s.max) + '</td>';
            html += '<td class="rythme-col-t1-n rythme-col-centre"' + (prefsCol1.n === false ? ' hidden' : '') + '>' + s.count + '</td>';
            html += '<td class="rythme-col-t1-tendance rythme-col-tendance"' + (prefsCol1.tendance === false ? ' hidden' : '') + '>';
            html += '<div class="rythme-barre-conteneur">';
            html += '<div class="rythme-barre" style="width:' + pctBarre.toFixed(0) + '%"></div>';
            html += '</div>';
            html += '<small class="u-texte-secondaire">' + s.tendance + ' ' + tendanceLabel + '</small>';
            html += '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        var nbAvecDuree = entrees.filter(function (e) { return e.dureeMs > 0; }).length;
        html += '<p class="u-texte-petit u-texte-secondaire u-mt-10">' + entrees.length + ' évaluations au total (' + nbAvecDuree + ' avec durée mesurée)</p>';

        conteneur.innerHTML = html;

        // Estimation de la charge
        var estimations = estimerCharge(statsMap);
        var sectionEstimation = document.getElementById('rythme-estimation');
        var contenuEstimation = document.getElementById('rythme-estimation-contenu');

        if (estimations.length > 0 && sectionEstimation && contenuEstimation) {
            // Colonnes du tableau 2 (charge)
            var colonnesT2 = [
                { id: 'remise', label: 'Remise', defaut: true },
                { id: 'evaluees', label: 'Évaluées', defaut: true },
                { id: 'restantes', label: 'Restantes', defaut: true },
                { id: 'moy2', label: 'Moy.', defaut: true },
                { id: 'temps', label: 'Temps estimé', defaut: true }
            ];
            var prefsCol2 = db.getSync('rythmeColonnesT2', null);
            if (!prefsCol2) {
                prefsCol2 = {};
                colonnesT2.forEach(function (c) { prefsCol2[c.id] = c.defaut; });
            }

            var htmlEst = '<div class="rythme-colonnes-toggle">';
            htmlEst += 'Colonnes : ';
            colonnesT2.forEach(function (c) {
                var checked = prefsCol2[c.id] !== false ? ' checked' : '';
                htmlEst += '<label><input type="checkbox" data-tableau="t2" data-col="' + c.id + '"' + checked + '> ' + c.label + '</label>';
            });
            htmlEst += '</div>';

            htmlEst += '<table class="tableau" id="rythme-table-charge">';
            htmlEst += '<thead><tr>';
            htmlEst += '<th>Production</th>';
            htmlEst += '<th class="rythme-col-t2-remise rythme-col-centre"' + (prefsCol2.remise === false ? ' hidden' : '') + '>Remise</th>';
            htmlEst += '<th class="rythme-col-t2-evaluees rythme-col-centre"' + (prefsCol2.evaluees === false ? ' hidden' : '') + '>Évaluées</th>';
            htmlEst += '<th class="rythme-col-t2-restantes rythme-col-centre"' + (prefsCol2.restantes === false ? ' hidden' : '') + '>Restantes</th>';
            htmlEst += '<th class="rythme-col-t2-moy2 rythme-col-centre"' + (prefsCol2.moy2 === false ? ' hidden' : '') + '>Moy.</th>';
            htmlEst += '<th class="rythme-col-t2-temps rythme-col-centre"' + (prefsCol2.temps === false ? ' hidden' : '') + '>Temps estimé</th>';
            htmlEst += '</tr></thead><tbody>';

            estimations.forEach(function (est) {
                var estComplet = est.copiesRestantes === 0;
                htmlEst += '<tr' + (estComplet ? ' class="rythme-lot-complet"' : '') + '>';
                htmlEst += '<td><strong>' + echapperHtml(est.productionNom) + '</strong>';
                if (estComplet) htmlEst += ' <small class="rythme-badge-termine">Terminé</small>';
                htmlEst += '</td>';
                htmlEst += '<td class="rythme-col-t2-remise rythme-col-centre"' + (prefsCol2.remise === false ? ' hidden' : '') + '>' + (est.dateRemise ? formaterDateCourte(est.dateRemise) : '—') + '</td>';
                htmlEst += '<td class="rythme-col-t2-evaluees rythme-col-centre"' + (prefsCol2.evaluees === false ? ' hidden' : '') + '>' + est.copiesFaites + '</td>';
                htmlEst += '<td class="rythme-col-t2-restantes rythme-col-centre"' + (prefsCol2.restantes === false ? ' hidden' : '') + '>' + (estComplet ? '—' : est.copiesRestantes) + '</td>';
                htmlEst += '<td class="rythme-col-t2-moy2 rythme-col-centre"' + (prefsCol2.moy2 === false ? ' hidden' : '') + '>' + formaterDuree(est.moyenneMs) + '</td>';
                htmlEst += '<td class="rythme-col-t2-temps rythme-col-centre"' + (prefsCol2.temps === false ? ' hidden' : '') + '><strong>' + (estComplet ? '—' : formaterDureeTexte(est.tempsEstimeMs)) + '</strong></td>';
                htmlEst += '</tr>';
            });

            htmlEst += '</tbody></table>';
            contenuEstimation.innerHTML = htmlEst;
            sectionEstimation.style.display = '';

            // Phase 3 : planning hebdomadaire (exclure les lots terminés)
            var estimationsActives = estimations.filter(function (e) { return e.copiesRestantes > 0; });
            _dernieresEstimations = estimationsActives;
            afficherPlanning(estimationsActives);
        }

        // Phase 4 : portrait temporel
        construirePortrait(entrees);
    }

    /* ===============================
       PHASE 3 — PLANNING HEBDOMADAIRE
       =============================== */

    var JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    // Semaine affichée du DIMANCHE au SAMEDI — format du calendrier de la
    // direction des études, adopté pour toutes les vues calendaires (décision
    // Grégoire, 6 août 2026). L'ordre suit `getDay()` : une seule liste sert
    // de mapping ET d'ordre d'affichage (l'ancienne JOURS_COMPLETS lundi→
    // dimanche, retirée, ne servait qu'à contredire le calendrier scolaire).
    var NOMS_JOURS_JS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    /**
     * Charge les préférences de rythme depuis le stockage.
     */
    function chargerPreferences() {
        var defaut = {
            heuresJour: 6, heuresDemi: 3, heuresSoir: 2, marge: 1.25,
            dateObjectif: '', heureObjectif: '', weekends: false, feries: false,
            // Hygiène de travail
            rappelPause: true, pauseApresMinutes: 45,
            alerteWeekend: true,
            alerteSoirTardif: true, heureDebutSoirTardif: 21,
            tamponPreCours: true, tamponPreCoursMinutes: 30
        };
        var prefs = db.getSync('preferencesRythme', defaut);
        return {
            heuresJour: prefs.heuresJour || defaut.heuresJour,
            heuresDemi: prefs.heuresDemi || defaut.heuresDemi,
            heuresSoir: prefs.heuresSoir || defaut.heuresSoir,
            marge: prefs.marge || defaut.marge,
            dateObjectif: prefs.dateObjectif || '',
            heureObjectif: prefs.heureObjectif || '',
            weekends: !!prefs.weekends,
            feries: !!prefs.feries,
            rappelPause: prefs.rappelPause !== false,
            pauseApresMinutes: prefs.pauseApresMinutes || 45,
            alerteWeekend: prefs.alerteWeekend !== false,
            alerteSoirTardif: prefs.alerteSoirTardif !== false,
            heureDebutSoirTardif: prefs.heureDebutSoirTardif || 21,
            tamponPreCours: prefs.tamponPreCours !== false,
            tamponPreCoursMinutes: prefs.tamponPreCoursMinutes || 30
        };
    }

    /**
     * Sauvegarde les préférences et rafraîchit l'affichage.
     */
    function sauvegarderPreferences() {
        var prefs = {
            heuresJour: parseInt(document.getElementById('rythme-pref-heures-jour')?.value) || 6,
            heuresDemi: parseInt(document.getElementById('rythme-pref-heures-demi')?.value) || 3,
            heuresSoir: parseInt(document.getElementById('rythme-pref-heures-soir')?.value) || 2,
            marge: parseFloat(document.getElementById('rythme-pref-marge')?.value) || 1.25,
            dateObjectif: document.getElementById('rythme-pref-date-objectif')?.value || '',
            heureObjectif: document.getElementById('rythme-pref-heure-objectif')?.value || '',
            weekends: document.getElementById('rythme-pref-weekends')?.checked || false,
            feries: document.getElementById('rythme-pref-feries')?.checked || false,
            // Hygiène de travail
            rappelPause: document.getElementById('rythme-pref-rappel-pause')?.checked !== false,
            pauseApresMinutes: parseInt(document.getElementById('rythme-pref-pause-minutes')?.value) || 45,
            alerteWeekend: document.getElementById('rythme-pref-alerte-weekend')?.checked !== false,
            alerteSoirTardif: document.getElementById('rythme-pref-alerte-soir')?.checked !== false,
            heureDebutSoirTardif: parseInt(document.getElementById('rythme-pref-heure-soir')?.value) || 21,
            tamponPreCours: document.getElementById('rythme-pref-tampon-cours')?.checked !== false,
            tamponPreCoursMinutes: parseInt(document.getElementById('rythme-pref-tampon-minutes')?.value) || 30
        };
        db.setSync('preferencesRythme', prefs);
        // Rafraîchir le calendrier immédiatement (réactif)
        if (_dernieresEstimations) {
            afficherPlanning(_dernieresEstimations);
        }
        // Pipeline complet (tableaux + estimations) avec délai anti-cascade
        clearTimeout(_rafraichirTimer);
        _rafraichirTimer = setTimeout(afficherRythme, 400);
    }

    function restaurerPreferences() {
        var prefs = chargerPreferences();
        var elJour = document.getElementById('rythme-pref-heures-jour');
        var elDemi = document.getElementById('rythme-pref-heures-demi');
        var elSoir = document.getElementById('rythme-pref-heures-soir');
        var elMarge = document.getElementById('rythme-pref-marge');
        var elDate = document.getElementById('rythme-pref-date-objectif');
        var elWE = document.getElementById('rythme-pref-weekends');
        if (elJour) elJour.value = prefs.heuresJour;
        if (elDemi) elDemi.value = prefs.heuresDemi;
        if (elSoir) elSoir.value = prefs.heuresSoir;
        if (elMarge) elMarge.value = prefs.marge;
        if (elDate) elDate.value = prefs.dateObjectif || '';
        var elHeure = document.getElementById('rythme-pref-heure-objectif');
        if (elHeure) elHeure.value = prefs.heureObjectif || '';
        if (elWE) elWE.checked = prefs.weekends;
        var elFeries = document.getElementById('rythme-pref-feries');
        if (elFeries) elFeries.checked = prefs.feries;
        // Hygiène de travail
        var el;
        el = document.getElementById('rythme-pref-rappel-pause');
        if (el) el.checked = prefs.rappelPause;
        el = document.getElementById('rythme-pref-pause-minutes');
        if (el) el.value = prefs.pauseApresMinutes;
        el = document.getElementById('rythme-pref-alerte-weekend');
        if (el) el.checked = prefs.alerteWeekend;
        el = document.getElementById('rythme-pref-alerte-soir');
        if (el) el.checked = prefs.alerteSoirTardif;
        el = document.getElementById('rythme-pref-heure-soir');
        if (el) el.value = prefs.heureDebutSoirTardif;
        el = document.getElementById('rythme-pref-tampon-cours');
        if (el) el.checked = prefs.tamponPreCours;
        el = document.getElementById('rythme-pref-tampon-minutes');
        if (el) el.value = prefs.tamponPreCoursMinutes;
    }

    /**
     * Récupère les séances de cours de l'horaire actif.
     * @returns {Array<{jour: string, debut: string, duree: number}>}
     */
    /**
     * Récupère TOUTES les séances de cours (tous les groupes-cours).
     * Collecte depuis toutes les sources disponibles.
     */
    function obtenirSeances() {
        var toutes = [];
        var vus = {};

        // Source 1 : entités horaires (structure moderne)
        // Chaque horaire a { id, nom, groupeAssocie, seances: [{jour, heureDebut, heureFin, local}] }
        // Filtrer : ne garder que les horaires liés à un groupe-cours actif
        var groupesCours = db.getSync(cle('groupesCours'), []);
        var horairesActifs = {};
        groupesCours.forEach(function (gc) {
            if (gc.horaireId) horairesActifs[gc.horaireId] = true;
        });
        var horaires = db.getSync(cle('horaires'), []);
        horaires = horaires.filter(function (h) { return horairesActifs[h.id]; });
        horaires.forEach(function (h) {
            if (h.seances) h.seances.forEach(function (s) {
                var cleSeance = (s.jour || '') + '|' + (s.heureDebut || '') + '|' + (h.groupeAssocie || '');
                if (!vus[cleSeance]) {
                    vus[cleSeance] = true;
                    toutes.push({
                        jour: s.jour,
                        debut: s.heureDebut,
                        fin: s.heureFin,
                        local: s.local || '',
                        groupe: h.groupeAssocie || '',
                        horaireNom: h.nom || ''
                    });
                }
            });
        });
        if (toutes.length > 0) return toutes;

        // Source 2 : obtenirSeancesHoraire par groupe-cours
        var groupesCours = db.getSync(cle('groupesCours'), []);
        groupesCours.forEach(function (gc) {
            if (typeof obtenirSeancesHoraire === 'function') {
                var seances = obtenirSeancesHoraire(gc.coursId || gc.id);
                if (seances) seances.forEach(function (s) {
                    var cle = (s.jour || '') + (s.debut || '') + (s.groupe || '');
                    if (!vus[cle]) { vus[cle] = true; toutes.push(s); }
                });
            }
        });
        if (toutes.length > 0) return toutes;

        // Source 3 : clé directe (legacy)
        var legacy = db.getSync(cle('seancesHoraire'), []);
        if (legacy && legacy.length > 0) return legacy;

        // Source 4 : horaireHebdo (legacy)
        return db.getSync(cle('horaireHebdo'), []) || [];
    }

    /**
     * Analyse l'horaire pour identifier les jours avec/sans cours.
     * @returns {Object<string, {cours: Array, heuresOccupees: number, heuresLibres: number}>}
     */
    function analyserHoraireHebdo() {
        var seances = obtenirSeances();
        var prefs = chargerPreferences();
        var jours = {};

        JOURS_SEMAINE.forEach(function (j) {
            jours[j] = { cours: [], heuresOccupees: 0, heuresLibres: prefs.heuresJour };
        });

        seances.forEach(function (s) {
            var jour = s.jour;
            if (!jours[jour]) return;
            // Calculer la durée : d'abord duree, puis nombrePeriodes, puis debut/fin
            var duree = s.duree || 0;
            if (!duree && s.nombrePeriodes) duree = s.nombrePeriodes * 0.833;
            if (!duree && s.debut && s.fin) {
                var hd = s.debut.split(':'), hf = s.fin.split(':');
                duree = (parseInt(hf[0]) + parseInt(hf[1] || 0) / 60) - (parseInt(hd[0]) + parseInt(hd[1] || 0) / 60);
            }
            if (duree <= 0) return;
            jours[jour].cours.push({
                debut: s.debut || s.heureDebut || '',
                fin: s.fin || s.heureFin || '',
                duree: duree,
                local: s.local || '',
                groupe: s.groupe || s.groupeId || ''
            });
            jours[jour].heuresOccupees += duree;
        });

        // Calculer les heures libres par jour (selon préférences)
        for (var j in jours) {
            var info = jours[j];
            if (info.heuresOccupees === 0) {
                info.heuresLibres = prefs.heuresJour;
                info.type = 'libre';
            } else if (info.heuresOccupees <= 3) {
                info.heuresLibres = prefs.heuresDemi;
                info.type = 'partiel';
            } else {
                info.heuresLibres = prefs.heuresSoir;
                info.type = 'soir';
            }
        }

        return jours;
    }

    /**
     * Collecte tous les jours ouvrables du calendrier entre deux dates.
     * @returns {Array<{date: string, jourSemaine: string, statut: string, motif: string|null, numeroSemaine: number|null}>}
     */
    /**
     * Collecte tous les jours entre deux dates (semaines complètes).
     * Tient compte des reprises (jourRemplace) du calendrier.
     */
    function obtenirJoursCalendrier(dateDebut, dateFin, prefs) {
        var calendrier = (typeof obtenirCalendrierComplet === 'function')
            ? obtenirCalendrierComplet()
            : db.getSync(cle('calendrierComplet'), {});

        var joursAcceptes = prefs.weekends ? NOMS_JOURS_JS : JOURS_SEMAINE;

        // Élargir au DIMANCHE de la semaine de début — la semaine affichée va
        // du dimanche au samedi (format direction des études, 6 août 2026).
        var dDebut = new Date(dateDebut + 'T12:00:00');
        while (NOMS_JOURS_JS[dDebut.getDay()] !== 'Dimanche') {
            dDebut.setDate(dDebut.getDate() - 1);
        }

        // Élargir au vendredi (ou samedi) de la semaine de fin
        var dFin = new Date(dateFin + 'T12:00:00');
        var jourFinSem = prefs.weekends ? 'Samedi' : 'Vendredi';
        while (NOMS_JOURS_JS[dFin.getDay()] !== jourFinSem) {
            dFin.setDate(dFin.getDate() + 1);
        }

        // Premier passage : collecter et trouver les numéros de semaine
        var joursBruts = [];
        var d = new Date(dDebut);
        while (d <= dFin) {
            var str = d.toISOString().split('T')[0];
            var info = calendrier[str];
            var jourSemaine = NOMS_JOURS_JS[d.getDay()];

            if (joursAcceptes.indexOf(jourSemaine) >= 0) {
                var estWeekend = jourSemaine === 'Samedi' || jourSemaine === 'Dimanche';
                var statut = estWeekend ? 'weekend' : (info ? info.statut : 'jour-ouvrable');
                var estConge = statut === 'conge';
                var estReprise = statut === 'reprise';

                // Jour effectif pour l'horaire : si c'est une reprise, utiliser le jour remplacé
                var jourEffectif = jourSemaine;
                if (estReprise && info && info.jourRemplace) {
                    jourEffectif = info.jourRemplace;
                }

                joursBruts.push({
                    date: str,
                    jourSemaine: jourSemaine,
                    jourEffectif: jourEffectif,
                    statut: statut,
                    estConge: estConge,
                    estReprise: estReprise,
                    motif: info ? (info.motif || (estReprise ? 'Reprise ' + (info.jourRemplace || '') : null)) : null,
                    numeroSemaine: info ? info.numeroSemaine : null,
                    estWeekend: estWeekend
                });
            }
            d.setDate(d.getDate() + 1);
        }

        // Deuxième passage : inférer les numéros de semaine manquants (congés,
        // weekends). Le DIMANCHE ouvre la semaine (format dimanche→samedi) :
        // il hérite de la semaine SUIVANTE (passe arrière), jamais de la
        // précédente — sinon il se rangerait en queue de la semaine finie et
        // l'affichage redeviendrait lundi→dimanche. Le samedi, lui, ferme la
        // semaine : héritage vers l'avant.
        var dernierNum = null;
        for (var i = 0; i < joursBruts.length; i++) {
            if (joursBruts[i].numeroSemaine) dernierNum = joursBruts[i].numeroSemaine;
            else if (dernierNum && joursBruts[i].jourSemaine !== 'Dimanche') joursBruts[i].numeroSemaine = dernierNum;
        }
        dernierNum = null;
        for (var k = joursBruts.length - 1; k >= 0; k--) {
            if (joursBruts[k].numeroSemaine) dernierNum = joursBruts[k].numeroSemaine;
            else if (dernierNum) joursBruts[k].numeroSemaine = dernierNum;
        }
        // Filet : un dimanche en toute fin de plage n'a rien après lui —
        // héritage vers l'avant plutôt que de rester sans semaine.
        dernierNum = null;
        for (var m = 0; m < joursBruts.length; m++) {
            if (joursBruts[m].numeroSemaine) dernierNum = joursBruts[m].numeroSemaine;
            else if (dernierNum) joursBruts[m].numeroSemaine = dernierNum;
        }

        return joursBruts;
    }

    /**
     * Répartit les estimations dans les jours disponibles.
     */
    function repartirDansJours(estimations, joursCalendrier, joursHoraire, prefs, dateObjectif) {
        var aujourdHui = window.dateLocaleYMD(); // #398 : date LOCALE
        // Heures disponibles le jour de l'objectif si une heure limite est définie
        var heuresLimiteObjectif = 0;
        if (prefs.heureObjectif && dateObjectif) {
            var parts = prefs.heureObjectif.split(':');
            heuresLimiteObjectif = parseInt(parts[0]) + (parseInt(parts[1] || 0) / 60);
        }

        var plages = [];
        joursCalendrier.forEach(function (j) {
            var estPasse = j.date < aujourdHui;

            // Utiliser le jour effectif pour l'horaire (reprises : mercredi → horaire du lundi)
            var infoHoraire = joursHoraire[j.jourEffectif || j.jourSemaine];

            var heuresLibres = 0;
            var type = 'conge';
            var cours = [];

            if (j.estConge) {
                // Congé travaillable si la préférence est activée
                if (prefs.feries) {
                    heuresLibres = prefs.heuresJour;
                    type = 'ferie-travaille';
                } else {
                    type = 'conge';
                }
            } else if (j.estWeekend) {
                heuresLibres = prefs.heuresDemi;
                type = 'weekend';
            } else if (infoHoraire) {
                heuresLibres = infoHoraire.heuresLibres;
                type = infoHoraire.type;
                cours = infoHoraire.cours;
            }

            // Limiter les heures du jour objectif si une heure est définie
            if (heuresLimiteObjectif > 0 && j.date === dateObjectif) {
                // Soustraire les heures de cours avant l'heure limite
                var heuresCoursMatin = 0;
                cours.forEach(function (c) {
                    if (c.debut && c.fin) {
                        var hd = c.debut.split(':'), hf = c.fin.split(':');
                        var dH = parseInt(hd[0]) + parseInt(hd[1] || 0) / 60;
                        var fH = parseInt(hf[0]) + parseInt(hf[1] || 0) / 60;
                        if (dH < heuresLimiteObjectif) {
                            heuresCoursMatin += Math.min(fH, heuresLimiteObjectif) - dH;
                        }
                    }
                });
                heuresLibres = Math.max(0, heuresLimiteObjectif - 8 - heuresCoursMatin);
            }

            plages.push({
                date: j.date,
                jourSemaine: j.jourSemaine,
                jourEffectif: j.jourEffectif,
                statut: j.statut,
                estReprise: j.estReprise,
                motif: j.motif,
                numeroSemaine: j.numeroSemaine,
                estWeekend: j.estWeekend,
                estConge: j.estConge,
                estPasse: estPasse,
                heuresLibres: estPasse ? 0 : heuresLibres,
                type: type,
                cours: cours,
                heuresUtilisees: 0,
                taches: []
            });
        });

        // Répartir (greedy) : trier par date de remise puis par charge décroissante
        var estTriees = estimations.slice().sort(function (a, b) {
            // D'abord par date de remise (lots disponibles en premier)
            if (a.dateRemise && b.dateRemise && a.dateRemise !== b.dateRemise) {
                return a.dateRemise < b.dateRemise ? -1 : 1;
            }
            if (a.dateRemise && !b.dateRemise) return 1;
            if (!a.dateRemise && b.dateRemise) return -1;
            // Puis par charge décroissante
            return b.tempsEstimeMs - a.tempsEstimeMs;
        });

        estTriees.forEach(function (est) {
            var heuresRestant = est.tempsEstimeMs / 3600000;
            for (var i = 0; i < plages.length && heuresRestant > 0.1; i++) {
                var plage = plages[i];
                // Ne pas placer de copies avant leur date de remise
                if (est.dateRemise && plage.date < est.dateRemise) continue;
                var dispo = plage.heuresLibres - plage.heuresUtilisees;
                if (dispo >= 0.5) {
                    var alloue = Math.min(heuresRestant, dispo);
                    var totalH = est.tempsEstimeMs / 3600000;
                    plage.taches.push({
                        nom: est.productionNom,
                        heures: alloue,
                        copies: totalH > 0 ? Math.round(est.copiesRestantes * (alloue / totalH)) : 0
                    });
                    plage.heuresUtilisees += alloue;
                    heuresRestant -= alloue;
                }
            }
        });

        return plages;
    }

    /**
     * Affiche le planning multi-semaines jusqu'à la date objectif.
     */
    function afficherPlanning(estimations) {
        var sectionPlanning = document.getElementById('rythme-planning');
        var contenuPlanning = document.getElementById('rythme-planning-contenu');
        if (!sectionPlanning || !contenuPlanning) return;

        if (estimations.length === 0) {
            sectionPlanning.style.display = 'none';
            return;
        }

        var prefs = chargerPreferences();
        var joursHoraire = analyserHoraireHebdo();
        var aujourdHui = window.dateLocaleYMD(); // #398 : date LOCALE

        // Date de début : la plus ancienne date de remise, ou aujourd'hui
        var premierRemise = '';
        estimations.forEach(function (est) {
            if (est.dateRemise && (!premierRemise || est.dateRemise < premierRemise)) {
                premierRemise = est.dateRemise;
            }
        });
        var dateDebut = premierRemise && premierRemise > aujourdHui ? aujourdHui : aujourdHui;

        // Date objectif : utilisateur ou dernière remise + 14 jours par défaut
        var dateObjectif = prefs.dateObjectif || '';
        if (!dateObjectif || dateObjectif < aujourdHui) {
            var derniereRemise = '';
            estimations.forEach(function (est) {
                if (est.dateRemise && est.dateRemise > derniereRemise) {
                    derniereRemise = est.dateRemise;
                }
            });
            var base = derniereRemise || aujourdHui;
            var d14 = new Date(base + 'T12:00:00');
            d14.setDate(d14.getDate() + 14);
            dateObjectif = d14.toISOString().split('T')[0];
        }

        var joursCalendrier = obtenirJoursCalendrier(dateDebut, dateObjectif, prefs);

        if (joursCalendrier.length === 0) {
            contenuPlanning.innerHTML = '<p class="u-texte-secondaire">Aucun jour disponible d\'ici la date objectif.</p>';
            sectionPlanning.style.display = '';
            return;
        }

        var plages = repartirDansJours(estimations, joursCalendrier, joursHoraire, prefs, dateObjectif);
        var totalHeuresLibres = plages.reduce(function (s, p) { return s + p.heuresLibres; }, 0);
        var totalChargeMs = estimations.reduce(function (s, e) { return s + e.tempsEstimeMs; }, 0);

        // Grouper par semaine
        var semaines = {};
        plages.forEach(function (p) {
            var num = p.numeroSemaine || '?';
            if (!semaines[num]) semaines[num] = [];
            semaines[num].push(p);
        });

        var labelHeure = prefs.heureObjectif && prefs.dateObjectif ? ' à ' + prefs.heureObjectif : '';
        var html = '<p class="u-texte-petit u-texte-secondaire u-mb-10">D\'aujourd\'hui au <strong>' + formaterDateCourte(dateObjectif) + labelHeure + '</strong>' + (prefs.dateObjectif ? ' (date objectif)' : ' (14 jours par défaut — indique une date objectif)') + '</p>';

        for (var numSem in semaines) {
            var joursSem = semaines[numSem];
            var premierJour = joursSem[0].date;
            var dernierJour = joursSem[joursSem.length - 1].date;

            html += '<div class="rythme-semaine-titre">Semaine ' + numSem + ' <span class="u-texte-secondaire">(' + formaterDateCourte(premierJour) + ' — ' + formaterDateCourte(dernierJour) + ')</span></div>';
            html += '<div class="rythme-semaine-grille' + (prefs.weekends ? ' rythme-avec-weekends' : '') + '">';

            joursSem.forEach(function (plage) {
                var classes = 'rythme-jour';
                if (plage.estConge) classes += ' rythme-jour-conge';
                if (plage.estPasse) classes += ' rythme-jour-passe';
                if (plage.estWeekend) classes += ' rythme-jour-weekend';
                var estAuj = plage.date === aujourdHui;
                if (estAuj) classes += ' rythme-jour-aujourdhui';

                html += '<div class="' + classes + '">';
                html += '<div class="rythme-jour-titre">' + plage.jourSemaine + ' <small>' + parseInt(plage.date.substring(8)) + '</small></div>';

                if (plage.estConge && plage.type !== 'ferie-travaille') {
                    html += '<div class="rythme-jour-info">Congé' + (plage.motif ? ' — ' + echapperHtml(plage.motif) : '') + '</div>';
                } else if (plage.estWeekend && plage.heuresLibres === 0) {
                    html += '<div class="rythme-jour-info">Fin de semaine</div>';
                } else {
                    // Mention reprise
                    if (plage.estReprise && plage.jourEffectif !== plage.jourSemaine) {
                        html += '<div class="rythme-cours rythme-cours-info">Horaire du ' + plage.jourEffectif + ' (reprise)</div>';
                    }
                    // Mention congé travaillé
                    if (plage.type === 'ferie-travaille') {
                        html += '<div class="rythme-cours rythme-cours-info">Congé' + (plage.motif ? ' — ' + echapperHtml(plage.motif) : '') + '</div>';
                    }

                    if (plage.cours && plage.cours.length > 0) {
                        plage.cours.forEach(function (c) {
                            var label = 'Cours';
                            if (c.groupe) label += ' gr. ' + echapperHtml(c.groupe);
                            if (c.debut && c.fin) label += ' ' + c.debut + '–' + c.fin;
                            else if (c.debut) label += ' ' + c.debut + ' (' + formaterNombre(c.duree, 1) + ' h)';
                            html += '<div class="rythme-cours">' + label + '</div>';
                        });
                    }

                    if (plage.heuresLibres > 0) {
                        var labelType = plage.type === 'ferie-travaille' ? 'Journée libre'
                            : plage.estWeekend ? 'Fin de semaine'
                            : plage.type === 'libre' ? 'Journée libre'
                            : plage.type === 'partiel' ? 'Demi-journée'
                            : 'Soirée';
                        html += '<div class="rythme-jour-libre">' + labelType + ' · ' + plage.heuresLibres + 'h</div>';
                    }

                    if (plage.taches.length > 0) {
                        plage.taches.forEach(function (t) {
                            html += '<div class="rythme-tache">' + echapperHtml(t.nom);
                            html += '<small> · ~' + t.copies + ' copies · ' + formaterDureeTexte(t.heures * 3600000) + '</small></div>';
                        });
                    }
                }
                html += '</div>';
            });

            html += '</div>';
        }

        // Résumé
        html += '<div class="rythme-resume">';
        html += '<span>Disponible : <strong>' + formaterNombre(totalHeuresLibres, 0) + ' h</strong></span>';
        html += '<span>Charge restante : <strong>' + formaterDureeTexte(totalChargeMs) + '</strong></span>';
        if (totalChargeMs > totalHeuresLibres * 3600000) {
            html += '<span class="rythme-alerte">La charge dépasse le temps disponible — ajuste la date objectif ou les plages.</span>';
        } else {
            var margeH = totalHeuresLibres - totalChargeMs / 3600000;
            html += '<span class="rythme-marge">Marge : ~' + Math.round(margeH) + 'h</span>';
        }
        html += '</div>';

        contenuPlanning.innerHTML = html;
        sectionPlanning.style.display = '';
    }

    function formaterDateCourte(dateStr) {
        if (!dateStr) return '';
        var parts = dateStr.split('-');
        var mois = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return parseInt(parts[2]) + ' ' + mois[parseInt(parts[1]) - 1];
    }

    /* ===============================
       PHASE 4 — PORTRAIT TEMPOREL
       =============================== */

    var TRANCHES_HEURE = [
        { id: 'matin', label: 'Matin (6h–12h)', min: 6, max: 12 },
        { id: 'apres-midi', label: 'Après-midi (12h–17h)', min: 12, max: 17 },
        { id: 'soiree', label: 'Soirée (17h–21h)', min: 17, max: 21 },
        { id: 'nuit', label: 'Nuit (21h–6h)', min: 21, max: 6 }
    ];

    function construirePortrait(entrees) {
        var section = document.getElementById('rythme-portrait');
        var contenu = document.getElementById('rythme-portrait-contenu');
        if (!section || !contenu) return;

        if (entrees.length === 0) {
            section.style.display = 'none';
            return;
        }

        // Compter par jour × tranche
        var grille = {};
        NOMS_JOURS_JS.forEach(function (j) {
            grille[j] = { 'matin': 0, 'apres-midi': 0, 'soiree': 0, 'nuit': 0 };
        });

        var maxCount = 0;
        var totalWeekend = 0;
        var totalSoir = 0;
        var total = 0;

        entrees.forEach(function (e) {
            if (!e.date) return;
            var d = new Date(e.date);
            if (isNaN(d.getTime())) return;
            var jour = NOMS_JOURS_JS[d.getDay()];
            var heure = d.getHours();

            var tranche = 'nuit';
            if (heure >= 6 && heure < 12) tranche = 'matin';
            else if (heure >= 12 && heure < 17) tranche = 'apres-midi';
            else if (heure >= 17 && heure < 21) tranche = 'soiree';

            if (grille[jour]) {
                grille[jour][tranche]++;
                if (grille[jour][tranche] > maxCount) maxCount = grille[jour][tranche];
            }

            total++;
            if (jour === 'Samedi' || jour === 'Dimanche') totalWeekend++;
            if (heure >= 21 || heure < 6) totalSoir++;
        });

        // Construire le heatmap
        var html = '<div class="rythme-heatmap">';
        html += '<div class="rythme-heatmap-coin"></div>';
        NOMS_JOURS_JS.forEach(function (j) {
            var abr = j.substring(0, 3);
            html += '<div class="rythme-heatmap-jour">' + abr + '</div>';
        });

        TRANCHES_HEURE.forEach(function (t) {
            html += '<div class="rythme-heatmap-tranche">' + t.label + '</div>';
            NOMS_JOURS_JS.forEach(function (j) {
                var n = grille[j][t.id];
                var intensite = maxCount > 0 ? n / maxCount : 0;
                var cls = 'rythme-heatmap-cellule';
                if (n === 0) cls += ' rythme-heatmap-vide';
                html += '<div class="' + cls + '" style="opacity:' + Math.max(0.15, intensite).toFixed(2) + '" title="' + j + ' ' + t.label + ' : ' + n + '">';
                if (n > 0) html += n;
                html += '</div>';
            });
        });
        html += '</div>';

        // Résumé
        var pctWeekend = total > 0 ? Math.round(totalWeekend / total * 100) : 0;
        var pctSoir = total > 0 ? Math.round(totalSoir / total * 100) : 0;
        html += '<div class="rythme-portrait-resume u-mt-10">';
        if (pctWeekend > 0) {
            html += '<span>' + formaterPourcentage(pctWeekend) + ' de tes évaluations sont en fin de semaine</span>';
        }
        if (pctSoir > 0) {
            html += '<span>' + formaterPourcentage(pctSoir) + ' sont en soirée tardive ou la nuit</span>';
        }
        if (pctWeekend === 0 && pctSoir === 0) {
            html += '<span>Toutes tes évaluations sont en semaine pendant la journée</span>';
        }
        html += '</div>';

        contenu.innerHTML = html;
        section.style.display = '';
    }

    /* ===============================
       PHASE 4 — RAPPELS DE BIEN-ÊTRE
       =============================== */

    var _rappelTimer = null;
    var _rappelDernierAffiche = 0;

    /**
     * Vérifie le contexte de l'évaluation et affiche des rappels doux.
     * Appelé au démarrage du chrono via Rythme.verifierBienEtre().
     */
    function verifierBienEtre() {
        var prefs = chargerPreferences();
        var maintenant = new Date();
        var jour = NOMS_JOURS_JS[maintenant.getDay()];
        var heure = maintenant.getHours();

        // Alerte weekend
        if (prefs.alerteWeekend && (jour === 'Samedi' || jour === 'Dimanche')) {
            afficherRappel('Évaluation un ' + jour.toLowerCase() + ' — les copies seront encore là lundi.');
        }

        // Alerte soir tardif
        var seuilSoir = prefs.heureDebutSoirTardif;
        if (prefs.alerteSoirTardif && (heure >= seuilSoir || heure < 6)) {
            afficherRappel('Il est ' + String(heure).padStart(2, '0') + 'h — le repos aussi fait partie du travail.');
        }

        // Tampon pré-cours
        if (prefs.tamponPreCours) {
            verifierTamponPreCours(maintenant, prefs.tamponPreCoursMinutes);
        }

        // Programmer le rappel de pause
        if (prefs.rappelPause) {
            programmerRappelPause(prefs.pauseApresMinutes);
        }
    }

    function programmerRappelPause(delaiMin) {
        if (_rappelTimer) clearTimeout(_rappelTimer);
        delaiMin = delaiMin || 45;
        _rappelTimer = setTimeout(function () {
            afficherRappel('Tu évalues depuis ' + delaiMin + ' min — une pause de 5 min ?');
            programmerRappelPause(delaiMin);
        }, delaiMin * 60 * 1000);
    }

    function arreterRappelPause() {
        if (_rappelTimer) { clearTimeout(_rappelTimer); _rappelTimer = null; }
    }

    function verifierTamponPreCours(maintenant, tamponMinutes) {
        var seances = obtenirSeances();
        var jour = NOMS_JOURS_JS[maintenant.getDay()];
        var minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes();

        seances.forEach(function (s) {
            if (s.jour !== jour || !s.debut) return;
            var parts = s.debut.split(':');
            var minutesCours = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
            var delta = minutesCours - minutesMaintenant;
            if (delta > 0 && delta <= tamponMinutes) {
                var label = s.groupe ? 'Cours gr. ' + s.groupe : 'Cours';
                afficherRappel(label + ' dans ' + delta + ' min — bon moment pour s\'arrêter.');
            }
        });
    }

    function afficherRappel(message) {
        // Éviter le spam : max 1 rappel par 5 minutes
        var maintenant = Date.now();
        if (maintenant - _rappelDernierAffiche < 300000) return;
        _rappelDernierAffiche = maintenant;

        var el = document.createElement('div');
        el.className = 'rythme-rappel';
        el.textContent = message;
        document.body.appendChild(el);

        // Animer l'entrée
        requestAnimationFrame(function () {
            el.classList.add('rythme-rappel-visible');
        });

        // Disparaître après 8 secondes
        setTimeout(function () {
            el.classList.remove('rythme-rappel-visible');
            setTimeout(function () { el.remove(); }, 400);
        }, 8000);
    }

    /* ===============================
       INITIALISATION
       =============================== */

    // Toggle colonnes (délégation)
    document.addEventListener('change', function (e) {
        var cb = e.target;
        if (!cb.dataset || !cb.dataset.tableau || !cb.dataset.col) return;
        var tableau = cb.dataset.tableau;
        var col = cb.dataset.col;
        var visible = cb.checked;
        var clePrefs = tableau === 't1' ? 'rythmeColonnesT1' : 'rythmeColonnesT2';
        var prefs = db.getSync(clePrefs, {});
        prefs[col] = visible;
        db.setSync(clePrefs, prefs);

        // Basculer la visibilité des cellules correspondantes
        var className = 'rythme-col-' + tableau + '-' + col;
        var cellules = document.querySelectorAll('.' + className);
        cellules.forEach(function (el) {
            if (visible) el.removeAttribute('hidden');
            else el.setAttribute('hidden', '');
        });
    });

    // Rafraîchir quand on navigue vers l'onglet
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-sous-section="rythme"]');
        if (btn && btn.closest('[data-section="labo"]')) {
            setTimeout(afficherRythme, 50);
        }
    });

    // Rafraîchir aussi quand la sous-section devient visible
    var _observerRythme = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.target.id === 'labo-rythme' && m.target.classList.contains('active')) {
                afficherRythme();
            }
        });
    });
    var _cibleRythme = document.getElementById('labo-rythme');
    if (_cibleRythme) {
        _observerRythme.observe(_cibleRythme, { attributes: true, attributeFilter: ['class'] });
    }

    // Export
    window.Rythme = {
        afficherRythme: afficherRythme,
        // Fonction pure exposée pour la vérification automatisée : l'ancrage
        // dimanche→samedi et l'héritage de semaine du dimanche s'y jouent.
        obtenirJoursCalendrier: obtenirJoursCalendrier,
        collecterDurees: collecterDurees,
        calculerStatsParActivite: calculerStatsParActivite,
        estimerCharge: estimerCharge,
        sauvegarderPreferences: sauvegarderPreferences,
        verifierBienEtre: verifierBienEtre,
        arreterRappelPause: arreterRappelPause
    };

})();
