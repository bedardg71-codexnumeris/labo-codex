/* ===============================
   MODULE: TRIMESTRE — accès et génération du calendrier

   Le module est devenu un mince accesseur après le démantèlement de la
   chaîne événements legacy (Beta 95 → Phases 1 et 2 legacy 95, mai 2026).
   Il expose deux getters et un générateur, lus/appelés par snapshots.js,
   saisie-presences.js, calendrier-vue.js, rythme.js, trimestre-v2-init.js,
   trimestre-v2-horaires.js, trimestres.js, demo-activation.js.

   La source de vérité reste la clé localStorage `calendrierComplet`
   peuplée par `genererCalendrierComplet` (appelée par les handlers
   d'édition trimestre-v2-init.js et trimestre-v2-horaires.js).

   ⚠️ NOTE 22 MAI 2026 : `genererCalendrierComplet` + ses 5 helpers ont
   été restaurés depuis git `6b2da4b^` après que le commit `6b2da4b`
   (Phase 2 cascade legacy 95 matin) les a retirés en croyant à tort
   qu'ils étaient orphelins. Les 24 call-sites avaient tous des guards
   `typeof === 'function'` qui les faisaient apparaître comme code mort
   à l'audit, mais le path d'écriture du calendrier passe par cette
   fonction. Sans elle, ajouter/modifier/supprimer un événement sauvegarde
   bien l'événement en stockage mais ne met JAMAIS à jour le calendrier
   interne — d'où les fériés invisibles dans la vue calendaire. Bug
   détecté par Grégoire en session tests manuels (ajout Fête des
   Patriotes le 18 mai), inscrit SUIVI-BUGS #120 Corrigés.
   =============================== */

(function() {
'use strict';

/**
 * calendrierComplet (localStorage) — source de vérité
 * Dictionnaire date → infos jour. Statuts possibles :
 *   "cours" | "reprise" | "conge" (avec motif) | "weekend" |
 *   "semaine-planification" | "semaine-examens" | "jour-ouvrable" | "hors-cours"
 * Une entrée "cours" / "reprise" porte numeroSemaine, numeroJour,
 * jourSemaine. Une entrée "conge" porte motif. "weekend" et
 * "semaine-*" portent uniquement jourSemaine.
 */

function obtenirCalendrierComplet() {
    return db.getSync(cle('calendrierComplet'), {});
}

function obtenirInfosJour(date) {
    const calendrier = obtenirCalendrierComplet();
    return calendrier[date] || null;
}

/**
 * Génère le calendrier complet du trimestre actif depuis le cadre,
 * les événements (prévus + imprévus) et l'horaire hebdomadaire.
 * Écrit dans la clé `calendrierComplet` (localStorage trimestre-scoped).
 * Appelée par tous les handlers qui modifient une entrée de calendrier.
 */
function genererCalendrierComplet() {

    const cadre = db.getSync(cle('cadreCalendrier'), {});
    // #374 (5 août 2026) : clé UNIQUE journeesSansCours (fusion des ex-clés
    // evenementsPrevus/evenementsImprevus, migrées au boot par migrations.js).
    const tousEvenements = db.getSync(cle('journeesSansCours'), []);

    // 🆕 FIX (16 fév 2026) : Synchroniser horaireHebdo depuis TOUTES les entités horaire
    // avant de générer le calendrier. Garantit que le calendrier reflète tous les groupes-cours.
    // CT-04 (21 août 2026) : source unique fusionnerSeancesHoraires (dédup par
    // jour ET heure). Cette copie-ci s'exécute APRÈS la sauvegarde d'un horaire
    // (trimestre-v2-horaires.js appelle genererCalendrierComplet juste après) :
    // tant qu'elle dédupliquait par jour seul, elle réécrasait le résultat
    // correct et la 2e séance d'un même jour disparaissait quand même.
    const horairesEntites = db.getSync(cle('horaires'), []);
    if (horairesEntites.length > 0) {
        const toutesSeances = fusionnerSeancesHoraires(horairesEntites);
        if (toutesSeances.length > 0) {
            db.setSyncSiChange(cle('horaireHebdo'), toutesSeances);   // #1040 : rien si inchangé
        }
    }

    const horaireHebdo = db.getSync(cle('horaireHebdo'), null);
    let joursAvecCours = null;
    if (horaireHebdo && Array.isArray(horaireHebdo) && horaireHebdo.length > 0) {
        joursAvecCours = new Set(horaireHebdo.map(s => s.jour.toLowerCase()));
    }

    // #399 (audit 5 août 2026) : les dates de repli EN DUR (2025-08-21/12-12/12-22)
    // sont RETIRÉES — elles rendaient cette garde morte et généraient un calendrier
    // fantôme 2025 sur cadre vide (sonde : 124 entrées dont 82 « cours »). Bornes
    // absentes → la clé est PURGÉE (cohérent : plus de résidu à l'écran, #390).
    const dateDebut = cadre.dateDebut || cadre.debutTrimestre;
    const finCours = cadre.finCours;
    const finTrimestre = cadre.finTrimestre;

    if (!dateDebut || !finCours || !finTrimestre) {
        console.warn('⚠️ Dates du trimestre manquantes, calendrier non généré (clé purgée)');
        db.setSync(cle('calendrierComplet'), {});
        return {};
    }

    // Construction des maps. Convention §3.0 : un événement personnel n'a pas de reprise.
    // Si une dateReprise est saisie sur un événement personnel, on l'ignore et on warn.
    // Natures : institutionnel | ferie | personnel — seul « personnel » a un
    // traitement propre ; « ferie » se comporte comme institutionnel (l'étiquette
    // ne change RIEN au calcul, vérifié avec Grégoire, relais #373).
    const mapConges = {};
    const mapReprises = {};
    tousEvenements.forEach(evt => {
        mapConges[evt.dateEvenement] = evt;
        const cat = evt.categorie || 'institutionnel';
        if (evt.dateReprise) {
            if (cat === 'personnel') {
                console.warn('Événement personnel "' + evt.description + '" (' + evt.dateEvenement + ') a une dateReprise — ignorée par convention §3.0');
            } else {
                mapReprises[evt.dateReprise] = evt;
            }
        }
    });

    // ============================================================
    // PASSE 1 — Numérotation « paquet de 5 » (#368, relais 4 août 2026)
    // ============================================================
    // Règle validée par Grégoire et vérifiée contre le calendrier officiel
    // du cégep 2026-2027 : numeroSemaine = ⌈rang du jour de cours effectif ÷ 5⌉.
    // Une semaine scolaire est un paquet de 5 jours de cours effectifs du
    // COLLÈGE, pas une semaine calendaire : elle s'étire autour des fériés
    // (A2026 : la semaine 3 absorbe le lundi 7 sept et finit le jeudi 10)
    // et enjambe les pauses. Aucun jour de bascule présupposé — contrainte
    // Grégoire : « il ne faut pas coder en dur ma pratique ».
    //
    // Compte comme jour effectif : tout jour entre dateDebut et finCours qui
    // n'est ni weekend, ni semaine planification/examens, ni congé
    // institutionnel ou férié (jour pédagogique perdu pour le collège).
    // Un congé PERSONNEL compte (le collège n'a rien annulé) ; un jour de
    // reprise est un jour ouvrable ordinaire, compté à sa propre date.
    //
    // L'ancien comptage PAR RÔLE (n-ième lundi = semaine n) reculait dès
    // qu'un congé décalait un rôle (constat A2026 : ven 13 nov = sem 13 puis
    // lun 16 nov = sem 12, maxSemaine 17 au lieu de 15) — RETIRÉ.

    // Diviseur = nombre de jours OUVRABLES d'une semaine (lun-ven, le
    // complément exact d'estWeekend) — hypothèse documentée, rendue visible
    // par le golden master #368 (la changer le fait rougir).
    const JOURS_OUVRABLES_PAR_SEMAINE = 5;
    const numSemParDate = {};

    let curseur = creerDateLocale(dateDebut);
    const finCoursDate = creerDateLocale(finCours);
    let rangJourEffectif = 0;
    let limitePasse1 = 0;
    while (curseur <= finCoursDate && limitePasse1 < 1000) {
        limitePasse1++;
        const dateStr = formaterDateTrimestreYMD(curseur);

        let compte = true;
        if (estWeekend(curseur)) {
            compte = false;
        } else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)
                || estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            compte = false;
        } else if (mapConges[dateStr] && (mapConges[dateStr].categorie || 'institutionnel') !== 'personnel') {
            compte = false;
        }

        if (compte) {
            rangJourEffectif++;
            numSemParDate[dateStr] = Math.ceil(rangJourEffectif / JOURS_OUVRABLES_PAR_SEMAINE);
        }

        curseur.setDate(curseur.getDate() + 1);
    }

    // ============================================================
    // PASSE 2 — Construction du calendrier complet
    // ============================================================
    const calendrier = {};
    let dateActuelle = creerDateLocale(dateDebut);
    const dateFin = creerDateLocale(finTrimestre);
    let compteurJoursCours = 0;
    let limitePasse2 = 0;

    while (dateActuelle <= dateFin && limitePasse2 < 1000) {
        limitePasse2++;
        const dateStr = formaterDateTrimestreYMD(dateActuelle);
        const jourSemaine = obtenirNomJour(dateActuelle);

        let infosJour = { jourSemaine };

        // #399 (L8, décision D4 5 août 2026) : mapReprises testée AVANT estWeekend —
        // une reprise volontairement placée un samedi est HONORÉE comme jour de
        // cours (branche « reprise » plus bas : numeroJour compté, offerte à la
        // saisie de présences). Elle ne porte PAS de numeroSemaine propre : la
        // numérotation « paquet de 5 » (passe 1) ne compte que les jours ouvrables
        // du collège — un samedi n'y figure pas, numSemParDate le laisse vide.
        // Changement MINIMAL : seule la préséance weekend↔reprise est inversée ;
        // les plages planification/examens et les congés gardent leur priorité.
        if (estWeekend(dateActuelle) && !mapReprises[dateStr]) {
            infosJour.statut = 'weekend';
        } else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)) {
            infosJour.statut = 'semaine-planification';
        } else if (estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            infosJour.statut = 'semaine-examens';
        } else if (mapConges[dateStr]) {
            const evt = mapConges[dateStr];
            const cat = evt.categorie || 'institutionnel';
            infosJour.statut = 'conge';
            infosJour.motif = evt.description;
            infosJour.categorieEvenement = cat;
            // Personnel : afficher le numéro de semaine (le rôle compte normalement)
            if (cat === 'personnel' && numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
        } else if (mapReprises[dateStr]) {
            infosJour.statut = 'reprise';
            const evt = mapReprises[dateStr];
            if (evt && evt.horaireReprise) {
                const jourRemplace = evt.horaireReprise.replace('Horaire du ', '');
                infosJour.jourRemplace = jourRemplace.charAt(0).toUpperCase() + jourRemplace.slice(1);
            }
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
            compteurJoursCours++;
            infosJour.numeroJour = compteurJoursCours;
        } else if (dateStr <= finCours && (joursAvecCours === null || joursAvecCours.has(jourSemaine.toLowerCase()))) {
            infosJour.statut = 'cours';
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
            compteurJoursCours++;
            infosJour.numeroJour = compteurJoursCours;
        } else if (dateStr <= finCours) {
            // Jour ouvrable hors horaire du groupe : afficher quand même le numéro de semaine
            // du collège (plan §3.4) pour les utilisateurs avec horaire 3 jours/sem.
            infosJour.statut = 'jour-ouvrable';
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
        } else {
            infosJour.statut = 'hors-cours';
        }

        calendrier[dateStr] = infosJour;
        dateActuelle.setDate(dateActuelle.getDate() + 1);
    }

    // STOCKER dans localStorage - LA SOURCE UNIQUE (#1040 : rien si inchangé)
    db.setSyncSiChange(cle('calendrierComplet'), calendrier);

    return calendrier;
}

/* ===============================
   HELPERS DATE — IIFE-privés (dupliqués avec calendrier-vue.js pour
   les 2 premiers ; les 3 derniers étaient uniques à trimestre.js).
   =============================== */

function creerDateLocale(dateStr) {
    const [annee, mois, jour] = dateStr.split('-').map(Number);
    return new Date(annee, mois - 1, jour);
}

function formaterDateTrimestreYMD(date) {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
}

function estWeekend(date) {
    const jour = date.getDay();
    return jour === 0 || jour === 6;
}

function obtenirNomJour(date) {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[date.getDay()];
}

function estDansPlage(date, debut, fin) {
    if (!debut || !fin) return false;
    return date >= debut && date <= fin;
}

window.obtenirCalendrierComplet = obtenirCalendrierComplet;
window.obtenirInfosJour = obtenirInfosJour;
window.genererCalendrierComplet = genererCalendrierComplet;

})();
