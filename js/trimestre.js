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
    const evenementsPrevus = db.getSync(cle('evenementsPrevus'), []);
    const evenementsImprevus = db.getSync(cle('evenementsImprevus'), []);

    // 🆕 FIX (16 fév 2026) : Synchroniser horaireHebdo depuis TOUTES les entités horaire
    // avant de générer le calendrier. Garantit que le calendrier reflète tous les groupes-cours.
    const horairesEntites = db.getSync(cle('horaires'), []);
    if (horairesEntites.length > 0) {
        const toutesSeances = [];
        const joursDejaVus = new Set();
        horairesEntites.forEach(h => {
            if (h.seances && Array.isArray(h.seances)) {
                h.seances.forEach(s => {
                    const jourNormalise = s.jour.toLowerCase();
                    if (!joursDejaVus.has(jourNormalise)) {
                        joursDejaVus.add(jourNormalise);
                        toutesSeances.push(s);
                    }
                });
            }
        });
        if (toutesSeances.length > 0) {
            db.setSync(cle('horaireHebdo'), toutesSeances);
        }
    }

    const horaireHebdo = db.getSync(cle('horaireHebdo'), null);
    let joursAvecCours = null;
    if (horaireHebdo && Array.isArray(horaireHebdo) && horaireHebdo.length > 0) {
        joursAvecCours = new Set(horaireHebdo.map(s => s.jour.toLowerCase()));
    }

    const dateDebut = cadre.dateDebut || cadre.debutTrimestre || '2025-08-21';
    const finCours = cadre.finCours || '2025-12-12';
    const finTrimestre = cadre.finTrimestre || '2025-12-22';

    if (!dateDebut || !finCours || !finTrimestre) {
        console.warn('⚠️ Dates du trimestre manquantes, calendrier non généré');
        return {};
    }

    // Construction des maps. Convention §3.0 : un événement personnel n'a pas de reprise.
    // Si une dateReprise est saisie sur un événement personnel, on l'ignore et on warn.
    const tousEvenements = [...evenementsPrevus, ...evenementsImprevus];
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
    // PASSE 1 — Séquence des jours pédagogiques avec rôle effectif
    // ============================================================
    // Pour chaque jour entre dateDebut et finCours, déterminer si c'est un jour
    // pédagogique du collège et quel rôle (Lundi/Mardi/...) il joue.
    // Le n-ième jour d'un rôle reçoit numeroSemaine = n (cf. plan §3.2 passe 2).
    //
    // Règles :
    //  - Weekend / semaine planif / semaine examens → ignoré
    //  - Férié institutionnel sans reprise → ignoré (jour pédagogique perdu)
    //  - Férié institutionnel avec reprise → ignoré ici (la date de reprise prend le rôle)
    //  - Férié personnel → inclus, rôle = jour calendaire (le collège n'a rien annulé)
    //  - Jour de reprise institutionnelle → rôle = jour cible
    //  - Jour normal → rôle = jour calendaire
    const compteursRoles = { Lundi: 0, Mardi: 0, Mercredi: 0, Jeudi: 0, Vendredi: 0 };
    const numSemParDate = {};
    const roleParDate = {};

    let curseur = creerDateLocale(dateDebut);
    const finCoursDate = creerDateLocale(finCours);
    let limitePasse1 = 0;
    while (curseur <= finCoursDate && limitePasse1 < 1000) {
        limitePasse1++;
        const dateStr = formaterDateTrimestreYMD(curseur);
        const jourCalendaire = obtenirNomJour(curseur);

        let roleEffectif = null;

        if (estWeekend(curseur)) {
            // ignoré
        } else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)
                || estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            // ignoré
        } else if (mapConges[dateStr]) {
            const evt = mapConges[dateStr];
            const cat = evt.categorie || 'institutionnel';
            if (cat === 'personnel') {
                roleEffectif = jourCalendaire;
            }
            // institutionnel : ignoré (la reprise éventuelle prendra le rôle ailleurs)
        } else if (mapReprises[dateStr]) {
            const evt = mapReprises[dateStr];
            const jourRemplace = (evt.horaireReprise || '').replace('Horaire du ', '');
            roleEffectif = jourRemplace.charAt(0).toUpperCase() + jourRemplace.slice(1);
        } else {
            roleEffectif = jourCalendaire;
        }

        if (roleEffectif && Object.prototype.hasOwnProperty.call(compteursRoles, roleEffectif)) {
            compteursRoles[roleEffectif]++;
            numSemParDate[dateStr] = compteursRoles[roleEffectif];
            roleParDate[dateStr] = roleEffectif;
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

        if (estWeekend(dateActuelle)) {
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

    // STOCKER dans localStorage - LA SOURCE UNIQUE
    db.setSync(cle('calendrierComplet'), calendrier);

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
