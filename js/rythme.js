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

            // Phase 3 : planning hebdomadaire
            afficherPlanning(estimations);
        }
    }

    /* ===============================
       PHASE 3 — PLANNING HEBDOMADAIRE
       =============================== */

    var JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    var HEURES_DISPO_JOUR = 6;     // heures de travail max par journée libre
    var HEURES_DISPO_DEMI = 3;     // heures disponibles si demi-journée libre
    var HEURES_DISPO_SOIR = 2;     // heures si on accepte de travailler le soir

    /**
     * Récupère les séances de cours de l'horaire actif.
     * @returns {Array<{jour: string, debut: string, duree: number}>}
     */
    function obtenirSeances() {
        if (typeof obtenirSeancesHoraire === 'function') {
            var seances = obtenirSeancesHoraire(null);
            if (seances && seances.length > 0) return seances;
        }
        // Fallback : lire directement depuis la clé
        var horaires = db.getSync(cle('horaires'), []);
        for (var i = 0; i < horaires.length; i++) {
            if (horaires[i].seances && horaires[i].seances.length > 0) {
                return horaires[i].seances;
            }
        }
        return db.getSync(cle('seancesHoraire'), []) || [];
    }

    /**
     * Analyse l'horaire pour identifier les jours avec/sans cours.
     * @returns {Object<string, {cours: Array, heuresOccupees: number, heuresLibres: number}>}
     */
    function analyserHoraireHebdo() {
        var seances = obtenirSeances();
        var jours = {};

        JOURS_SEMAINE.forEach(function (j) {
            jours[j] = { cours: [], heuresOccupees: 0, heuresLibres: HEURES_DISPO_JOUR };
        });

        seances.forEach(function (s) {
            var jour = s.jour;
            if (!jours[jour]) return;
            var duree = s.duree || (s.nombrePeriodes ? s.nombrePeriodes * 0.833 : 0);
            jours[jour].cours.push({
                debut: s.debut || '??',
                duree: duree,
                local: s.local || ''
            });
            jours[jour].heuresOccupees += duree;
        });

        // Calculer les heures libres par jour
        for (var j in jours) {
            var info = jours[j];
            if (info.heuresOccupees === 0) {
                // Journée sans cours
                info.heuresLibres = HEURES_DISPO_JOUR;
                info.type = 'libre';
            } else if (info.heuresOccupees <= 3) {
                // Demi-journée de cours → l'autre demi-journée est libre
                info.heuresLibres = HEURES_DISPO_DEMI;
                info.type = 'partiel';
            } else {
                // Journée chargée → seulement le soir
                info.heuresLibres = HEURES_DISPO_SOIR;
                info.type = 'soir';
            }
        }

        return jours;
    }

    /**
     * Identifie la semaine courante dans le calendrier.
     * @returns {{ numeroSemaine: number, lundi: string, vendredi: string, dates: Object }}
     */
    function obtenirSemaineCourante() {
        var calendrier = (typeof obtenirCalendrierComplet === 'function')
            ? obtenirCalendrierComplet()
            : db.getSync(cle('calendrierComplet'), {});
        var aujourdHui = new Date().toISOString().split('T')[0];

        // Trouver la semaine courante
        var infoAuj = calendrier[aujourdHui];
        var numSemaine = infoAuj ? infoAuj.numeroSemaine : null;

        // Collecter les dates de cette semaine
        var datesSemaine = {};
        var lundi = null, vendredi = null;
        for (var dateStr in calendrier) {
            var info = calendrier[dateStr];
            if (info.numeroSemaine === numSemaine && JOURS_SEMAINE.indexOf(info.jourSemaine) >= 0) {
                datesSemaine[info.jourSemaine] = {
                    date: dateStr,
                    statut: info.statut,
                    motif: info.motif || null
                };
                if (info.jourSemaine === 'Lundi') lundi = dateStr;
                if (info.jourSemaine === 'Vendredi') vendredi = dateStr;
            }
        }

        return {
            numeroSemaine: numSemaine,
            lundi: lundi,
            vendredi: vendredi,
            dates: datesSemaine
        };
    }

    /**
     * Répartit les estimations dans les plages horaires disponibles.
     */
    function repartirDansPlages(estimations, joursHoraire, semaine) {
        var plagesDisponibles = [];

        JOURS_SEMAINE.forEach(function (jour) {
            var infoJour = joursHoraire[jour];
            var infoDate = semaine.dates[jour];
            if (!infoJour) return;

            // Jour de congé ou weekend → pas de plage
            if (infoDate && (infoDate.statut === 'conge' || infoDate.statut === 'weekend')) return;

            // Jour dans le passé → pas de plage
            if (infoDate && infoDate.date < new Date().toISOString().split('T')[0]) return;

            if (infoJour.heuresLibres > 0.5) {
                plagesDisponibles.push({
                    jour: jour,
                    date: infoDate ? infoDate.date : '',
                    heuresLibres: infoJour.heuresLibres,
                    type: infoJour.type,
                    heuresUtilisees: 0,
                    taches: []
                });
            }
        });

        // Trier les estimations par temps décroissant (plus gros lots en premier)
        var estTriees = estimations.slice().sort(function (a, b) {
            return b.tempsEstimeMs - a.tempsEstimeMs;
        });

        // Répartir (greedy : chaque tâche va dans la première plage qui a assez de temps)
        estTriees.forEach(function (est) {
            var heuresNecessaires = est.tempsEstimeMs / 3600000;

            for (var i = 0; i < plagesDisponibles.length; i++) {
                var plage = plagesDisponibles[i];
                var heuresRestantes = plage.heuresLibres - plage.heuresUtilisees;
                if (heuresRestantes >= 0.5) {
                    var heuresAllouees = Math.min(heuresNecessaires, heuresRestantes);
                    plage.taches.push({
                        nom: est.productionNom,
                        heures: heuresAllouees,
                        copies: Math.round(est.copiesRestantes * (heuresAllouees / heuresNecessaires))
                    });
                    plage.heuresUtilisees += heuresAllouees;
                    heuresNecessaires -= heuresAllouees;
                    if (heuresNecessaires < 0.1) break;
                }
            }
        });

        return plagesDisponibles;
    }

    /**
     * Affiche le planning de la semaine.
     */
    function afficherPlanning(estimations) {
        var sectionPlanning = document.getElementById('rythme-planning');
        var contenuPlanning = document.getElementById('rythme-planning-contenu');
        if (!sectionPlanning || !contenuPlanning) return;

        var joursHoraire = analyserHoraireHebdo();
        var semaine = obtenirSemaineCourante();

        if (!semaine.numeroSemaine) {
            contenuPlanning.innerHTML = '<p class="u-texte-secondaire">Calendrier non configuré — configure le trimestre dans Réglages pour voir le planning.</p>';
            sectionPlanning.style.display = '';
            return;
        }

        var plages = repartirDansPlages(estimations, joursHoraire, semaine);
        var totalHeuresLibres = plages.reduce(function (s, p) { return s + p.heuresLibres; }, 0);
        var totalChargeMs = estimations.reduce(function (s, e) { return s + e.tempsEstimeMs; }, 0);

        var html = '<div class="rythme-semaine-titre">Semaine ' + semaine.numeroSemaine;
        if (semaine.lundi && semaine.vendredi) {
            html += ' <span class="u-texte-secondaire">(' + formaterDateCourte(semaine.lundi) + ' — ' + formaterDateCourte(semaine.vendredi) + ')</span>';
        }
        html += '</div>';

        html += '<div class="rythme-semaine-grille">';

        JOURS_SEMAINE.forEach(function (jour) {
            var info = joursHoraire[jour];
            var infoDate = semaine.dates[jour];
            var estConge = infoDate && infoDate.statut === 'conge';
            var estPasse = infoDate && infoDate.date < new Date().toISOString().split('T')[0];

            html += '<div class="rythme-jour' + (estConge ? ' rythme-jour-conge' : '') + (estPasse ? ' rythme-jour-passe' : '') + '">';
            html += '<div class="rythme-jour-titre">' + jour;
            if (infoDate && infoDate.date) html += ' <small>' + infoDate.date.substring(8) + '</small>';
            html += '</div>';

            if (estConge) {
                html += '<div class="rythme-jour-info">Congé' + (infoDate.motif ? ' — ' + echapperHtml(infoDate.motif) : '') + '</div>';
            } else {
                // Afficher les cours
                if (info.cours.length > 0) {
                    info.cours.forEach(function (c) {
                        html += '<div class="rythme-cours">Cours ' + c.debut + ' (' + c.duree.toFixed(1) + 'h)</div>';
                    });
                }

                // Afficher le temps libre
                var labelType = info.type === 'libre' ? 'Journée libre'
                    : info.type === 'partiel' ? 'Demi-journée libre'
                    : 'Soirée disponible';
                html += '<div class="rythme-jour-libre">' + labelType + ' · ' + info.heuresLibres + 'h</div>';

                // Tâches assignées
                var plage = plages.find(function (p) { return p.jour === jour; });
                if (plage && plage.taches.length > 0) {
                    plage.taches.forEach(function (t) {
                        html += '<div class="rythme-tache">';
                        html += echapperHtml(t.nom);
                        html += '<small> · ~' + t.copies + ' copies · ' + formaterDureeTexte(t.heures * 3600000) + '</small>';
                        html += '</div>';
                    });
                }
            }
            html += '</div>';
        });

        html += '</div>';

        // Résumé
        html += '<div class="rythme-resume">';
        html += '<span>Disponible cette semaine : <strong>' + totalHeuresLibres.toFixed(0) + 'h</strong></span>';
        html += '<span>Charge restante : <strong>' + formaterDureeTexte(totalChargeMs) + '</strong></span>';
        if (totalChargeMs > totalHeuresLibres * 3600000) {
            html += '<span class="rythme-alerte">La charge dépasse le temps disponible cette semaine</span>';
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
