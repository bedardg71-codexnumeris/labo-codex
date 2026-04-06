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

    /* ===============================
       COLLECTE DES DONNÉES
       =============================== */

    /**
     * Collecte toutes les durées d'évaluation depuis les deux sources.
     * Dédoublonne par date+productionId pour éviter les doublons chrono/éval.
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

        var entrees = [];
        var vus = {}; // clé: productionId + '|' + date (minute) pour dédoublonnage

        // Source 1 : historique chronomètre
        var chrono = db.getSync(cle('chronoEvaluations'), []);
        chrono.forEach(function (e) {
            if (!e.dureeMs || e.dureeMs < 5000) return; // ignorer < 5s
            var prod = e.productionId ? prodMap[e.productionId] : null;
            var activite = e.activite || (prod ? (prod.activiteApprentissage || prod.description) : null) || '';
            var cleDedup = (e.productionId || '') + '|' + (e.date || '').substring(0, 16);
            vus[cleDedup] = true;
            entrees.push({
                dureeMs: e.dureeMs,
                activite: activite,
                productionId: e.productionId || '',
                productionNom: e.productionNom || (prod ? prod.titre : ''),
                date: e.date || '',
                groupeCoursId: e.groupeCoursId || ''
            });
        });

        // Source 2 : évaluations sauvegardées (backup, durées non chronométrées)
        var evaluations = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('evaluationsSauvegardees')
            : [];
        evaluations.forEach(function (ev) {
            if (!ev.dureeEvaluation || ev.dureeEvaluation < 5) return; // ignorer < 5s
            var cleDedup = (ev.productionId || '') + '|' + (ev.dateCreation || '').substring(0, 16);
            if (vus[cleDedup]) return; // déjà dans le chrono
            var prod = ev.productionId ? prodMap[ev.productionId] : null;
            var activite = prod ? (prod.activiteApprentissage || prod.description || '') : '';
            entrees.push({
                dureeMs: ev.dureeEvaluation * 1000,
                activite: activite,
                productionId: ev.productionId || '',
                productionNom: ev.productionNom || (prod ? prod.titre : ''),
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
        // Regrouper par activité
        var groupes = {};
        entrees.forEach(function (e) {
            var act = e.activite || '(sans activité)';
            if (!groupes[act]) groupes[act] = [];
            groupes[act].push(e.dureeMs);
        });

        var stats = [];
        for (var act in groupes) {
            var durees = groupes[act].sort(function (a, b) { return a - b; });
            var n = durees.length;
            var somme = durees.reduce(function (s, d) { return s + d; }, 0);
            var moyenne = somme / n;
            var mediane = n % 2 === 0
                ? (durees[n / 2 - 1] + durees[n / 2]) / 2
                : durees[Math.floor(n / 2)];

            // Tendance : comparer la moyenne des 5 dernières vs les 5 précédentes
            var tendance = '→';
            if (n >= 6) {
                var recentes = groupes[act].slice(-5);
                var precedentes = groupes[act].slice(-10, -5);
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
                count: n,
                tendance: tendance
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
        var etudiants = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('groupeEtudiants')
            : db.getSync(cle('groupeEtudiants'), []);
        var nbEtudiants = etudiants.length || 0;

        var estimations = [];

        productions.forEach(function (prod) {
            var activite = prod.activiteApprentissage || prod.description || '';
            var stats = statsMap[activite];
            if (!stats) return; // pas de données pour cette activité

            // Compter les évaluations déjà faites pour cette production
            var evalsFaites = evaluations.filter(function (ev) {
                return ev.productionId === prod.id && !ev.remplaceeParId;
            }).length;

            var copiesRestantes = Math.max(0, nbEtudiants - evalsFaites);
            if (copiesRestantes === 0) return;

            var tempsEstimeMs = copiesRestantes * stats.moyenne;
            // Ajouter 25% pour post-évaluation (relecture, PDF, LÉA)
            var tempsTotal = tempsEstimeMs * 1.25;

            estimations.push({
                productionNom: prod.titre + (activite ? ' — ' + activite : ''),
                activite: activite,
                totalCopies: nbEtudiants,
                copiesFaites: evalsFaites,
                copiesRestantes: copiesRestantes,
                moyenneMs: stats.moyenne,
                tempsEstimeMs: tempsTotal
            });
        });

        return estimations;
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

        var stats = calculerStatsParActivite(entrees);
        var maxMoyenne = Math.max.apply(null, stats.map(function (s) { return s.moyenne; }));

        // Construire le tableau
        var html = '<table class="tableau-donnees rythme-tableau">';
        html += '<thead><tr>';
        html += '<th>Activité</th>';
        html += '<th class="u-texte-centre">Moy.</th>';
        html += '<th class="u-texte-centre">Méd.</th>';
        html += '<th class="u-texte-centre">Min</th>';
        html += '<th class="u-texte-centre">Max</th>';
        html += '<th class="u-texte-centre">N</th>';
        html += '<th></th>';
        html += '</tr></thead><tbody>';

        // Map pour l'estimation
        var statsMap = {};

        stats.forEach(function (s) {
            statsMap[s.activite] = s;
            var pctBarre = maxMoyenne > 0 ? (s.moyenne / maxMoyenne * 100) : 0;
            var tendanceLabel = s.tendance === '↘' ? 'Accélère'
                : s.tendance === '↗' ? 'Ralentit' : 'Stable';

            html += '<tr>';
            html += '<td><strong>' + echapperHtml(s.activite) + '</strong></td>';
            html += '<td class="u-texte-centre"><strong>' + formaterDuree(s.moyenne) + '</strong></td>';
            html += '<td class="u-texte-centre">' + formaterDuree(s.mediane) + '</td>';
            html += '<td class="u-texte-centre">' + formaterDuree(s.min) + '</td>';
            html += '<td class="u-texte-centre">' + formaterDuree(s.max) + '</td>';
            html += '<td class="u-texte-centre">' + s.count + '</td>';
            html += '<td>';
            html += '<div class="rythme-barre-conteneur">';
            html += '<div class="rythme-barre" style="width:' + pctBarre.toFixed(0) + '%"></div>';
            html += '</div>';
            html += '<small class="u-texte-secondaire">' + s.tendance + ' ' + tendanceLabel + '</small>';
            html += '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<p class="u-texte-petit u-texte-secondaire u-mt-10">' + entrees.length + ' évaluations mesurées au total</p>';

        conteneur.innerHTML = html;

        // Estimation de la charge
        var estimations = estimerCharge(statsMap);
        var sectionEstimation = document.getElementById('rythme-estimation');
        var contenuEstimation = document.getElementById('rythme-estimation-contenu');

        if (estimations.length > 0 && sectionEstimation && contenuEstimation) {
            var htmlEst = '';
            estimations.forEach(function (est) {
                htmlEst += '<div class="rythme-estimation-ligne">';
                htmlEst += '<strong>' + echapperHtml(est.productionNom) + '</strong>';
                htmlEst += '<div class="rythme-estimation-details">';
                htmlEst += '<span>' + est.copiesFaites + '/' + est.totalCopies + ' évaluées</span>';
                htmlEst += '<span>' + est.copiesRestantes + ' restantes × ~' + formaterDuree(est.moyenneMs) + '</span>';
                htmlEst += '<span class="rythme-estimation-total">≈ ' + formaterDureeTexte(est.tempsEstimeMs) + ' (incl. révision)</span>';
                htmlEst += '</div>';
                htmlEst += '</div>';
            });
            contenuEstimation.innerHTML = htmlEst;
            sectionEstimation.style.display = '';
        }
    }

    /* ===============================
       INITIALISATION
       =============================== */

    // Rafraîchir quand on navigue vers l'onglet
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-sous-section="rythme"]');
        if (btn && btn.closest('[data-section="boite-outils"]')) {
            setTimeout(afficherRythme, 50);
        }
    });

    // Rafraîchir aussi quand la sous-section devient visible
    var _observerRythme = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.target.id === 'boite-outils-rythme' && m.target.classList.contains('active')) {
                afficherRythme();
            }
        });
    });
    var _cibleRythme = document.getElementById('boite-outils-rythme');
    if (_cibleRythme) {
        _observerRythme.observe(_cibleRythme, { attributes: true, attributeFilter: ['class'] });
    }

    // Export
    window.Rythme = {
        afficherRythme: afficherRythme,
        collecterDurees: collecterDurees,
        calculerStatsParActivite: calculerStatsParActivite
    };

})();
