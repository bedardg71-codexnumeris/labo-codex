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
        // Compter les fichiers importés par production (pas les étudiants)
        var fichiers = db.getSync(cle('fichiersTravaux'), []);
        var prefs = chargerPreferences();

        var estimations = [];

        productions.forEach(function (prod) {
            var activite = prod.activiteApprentissage || prod.description || '';
            var stats = statsMap[activite];
            if (!stats) return;

            // Fichiers importés pour cette production
            var fichiersImportes = fichiers.filter(function (f) {
                return f.productionId === prod.id;
            });
            var nbImportes = fichiersImportes.length;
            if (nbImportes === 0) return; // aucun fichier importé

            // Évaluations déjà faites (non remplacées)
            var evalsFaites = evaluations.filter(function (ev) {
                return ev.productionId === prod.id && !ev.remplaceeParId;
            }).length;

            var copiesRestantes = Math.max(0, nbImportes - evalsFaites);
            // Production terminée si <= 2 copies restantes (tolérance pour fichiers mal classés)
            if (copiesRestantes <= 2 && evalsFaites >= nbImportes * 0.8) return;

            var tempsEstimeMs = copiesRestantes * stats.moyenne;
            var tempsTotal = tempsEstimeMs * prefs.marge;

            estimations.push({
                productionNom: prod.titre + (activite ? ' — ' + activite : ''),
                activite: activite,
                totalCopies: nbImportes,
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

        // Restaurer les préférences dans le formulaire
        restaurerPreferences();

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
    var JOURS_COMPLETS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    var NOMS_JOURS_JS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    /**
     * Charge les préférences de rythme depuis le stockage.
     */
    function chargerPreferences() {
        var defaut = { heuresJour: 6, heuresDemi: 3, heuresSoir: 2, marge: 1.25, dateObjectif: '', weekends: false, feries: false };
        var prefs = db.getSync('preferencesRythme', defaut);
        return {
            heuresJour: prefs.heuresJour || defaut.heuresJour,
            heuresDemi: prefs.heuresDemi || defaut.heuresDemi,
            heuresSoir: prefs.heuresSoir || defaut.heuresSoir,
            marge: prefs.marge || defaut.marge,
            dateObjectif: prefs.dateObjectif || '',
            weekends: !!prefs.weekends,
            feries: !!prefs.feries
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
            weekends: document.getElementById('rythme-pref-weekends')?.checked || false,
            feries: document.getElementById('rythme-pref-feries')?.checked || false
        };
        db.setSync('preferencesRythme', prefs);
        afficherRythme();
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
        if (elWE) elWE.checked = prefs.weekends;
        var elFeries = document.getElementById('rythme-pref-feries');
        if (elFeries) elFeries.checked = prefs.feries;
    }

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
        var prefs = chargerPreferences();
        var jours = {};

        JOURS_SEMAINE.forEach(function (j) {
            jours[j] = { cours: [], heuresOccupees: 0, heuresLibres: prefs.heuresJour };
        });

        seances.forEach(function (s) {
            var jour = s.jour;
            if (!jours[jour]) return;
            var duree = s.duree || (s.nombrePeriodes ? s.nombrePeriodes * 0.833 : 0);
            if (duree <= 0) return; // séance sans durée
            var groupe = s.groupe || '';
            jours[jour].cours.push({
                debut: s.debut || '',
                duree: duree,
                local: s.local || '',
                groupe: groupe
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

        var joursAcceptes = prefs.weekends ? JOURS_COMPLETS : JOURS_SEMAINE;

        // Élargir au lundi de la semaine de début
        var dDebut = new Date(dateDebut + 'T12:00:00');
        while (NOMS_JOURS_JS[dDebut.getDay()] !== 'Lundi') {
            dDebut.setDate(dDebut.getDate() - 1);
        }

        // Élargir au vendredi (ou dimanche) de la semaine de fin
        var dFin = new Date(dateFin + 'T12:00:00');
        var jourFinSem = prefs.weekends ? 'Dimanche' : 'Vendredi';
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

        // Deuxième passage : inférer les numéros de semaine manquants (congés, weekends)
        // D'abord vers l'avant, puis vers l'arrière
        var dernierNum = null;
        for (var i = 0; i < joursBruts.length; i++) {
            if (joursBruts[i].numeroSemaine) dernierNum = joursBruts[i].numeroSemaine;
            else if (dernierNum) joursBruts[i].numeroSemaine = dernierNum;
        }
        dernierNum = null;
        for (var k = joursBruts.length - 1; k >= 0; k--) {
            if (joursBruts[k].numeroSemaine) dernierNum = joursBruts[k].numeroSemaine;
            else if (dernierNum) joursBruts[k].numeroSemaine = dernierNum;
        }

        return joursBruts;
    }

    /**
     * Répartit les estimations dans les jours disponibles.
     */
    function repartirDansJours(estimations, joursCalendrier, joursHoraire, prefs) {
        var aujourdHui = new Date().toISOString().split('T')[0];
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

        // Répartir (greedy, plus gros lots en premier)
        var estTriees = estimations.slice().sort(function (a, b) {
            return b.tempsEstimeMs - a.tempsEstimeMs;
        });

        estTriees.forEach(function (est) {
            var heuresRestant = est.tempsEstimeMs / 3600000;
            for (var i = 0; i < plages.length && heuresRestant > 0.1; i++) {
                var plage = plages[i];
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
        var aujourdHui = new Date().toISOString().split('T')[0];

        // Date objectif : utilisateur ou +14 jours par défaut
        var dateObjectif = prefs.dateObjectif || '';
        if (!dateObjectif || dateObjectif <= aujourdHui) {
            var d14 = new Date();
            d14.setDate(d14.getDate() + 14);
            dateObjectif = d14.toISOString().split('T')[0];
        }

        var joursCalendrier = obtenirJoursCalendrier(aujourdHui, dateObjectif, prefs);

        if (joursCalendrier.length === 0) {
            contenuPlanning.innerHTML = '<p class="u-texte-secondaire">Aucun jour disponible d\'ici la date objectif.</p>';
            sectionPlanning.style.display = '';
            return;
        }

        var plages = repartirDansJours(estimations, joursCalendrier, joursHoraire, prefs);
        var totalHeuresLibres = plages.reduce(function (s, p) { return s + p.heuresLibres; }, 0);
        var totalChargeMs = estimations.reduce(function (s, e) { return s + e.tempsEstimeMs; }, 0);

        // Grouper par semaine
        var semaines = {};
        plages.forEach(function (p) {
            var num = p.numeroSemaine || '?';
            if (!semaines[num]) semaines[num] = [];
            semaines[num].push(p);
        });

        var html = '<p class="u-texte-petit u-texte-secondaire" style="margin-bottom:.75rem">D\'aujourd\'hui au <strong>' + formaterDateCourte(dateObjectif) + '</strong>' + (prefs.dateObjectif ? ' (date objectif)' : ' (14 jours par défaut — indique une date objectif)') + '</p>';

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
                    html += '<div class="rythme-jour-info">Weekend</div>';
                } else {
                    // Mention reprise
                    if (plage.estReprise && plage.jourEffectif !== plage.jourSemaine) {
                        html += '<div class="rythme-cours" style="font-style:italic">Horaire du ' + plage.jourEffectif + ' (reprise)</div>';
                    }
                    // Mention congé travaillé
                    if (plage.type === 'ferie-travaille') {
                        html += '<div class="rythme-cours" style="font-style:italic">Congé' + (plage.motif ? ' — ' + echapperHtml(plage.motif) : '') + '</div>';
                    }

                    if (plage.cours && plage.cours.length > 0) {
                        plage.cours.forEach(function (c) {
                            var label = 'Cours';
                            if (c.debut) label += ' ' + c.debut;
                            label += ' (' + c.duree.toFixed(1) + 'h)';
                            html += '<div class="rythme-cours">' + label + '</div>';
                        });
                    }

                    if (plage.heuresLibres > 0) {
                        var labelType = plage.type === 'ferie-travaille' ? 'Journée libre'
                            : plage.estWeekend ? 'Weekend'
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
        html += '<span>Disponible : <strong>' + totalHeuresLibres.toFixed(0) + 'h</strong></span>';
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
        calculerStatsParActivite: calculerStatsParActivite,
        sauvegarderPreferences: sauvegarderPreferences
    };

})();
