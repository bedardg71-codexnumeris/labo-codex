/* ===============================
   MODULE : REPORT DES PRÉSENCES VERS LE SIS (Léa / Omnivox, COBA, Col.NET)
   7 septembre 2026

   POURQUOI CE MODULE EXISTE
   Labo Codex compte les PRÉSENCES ; Léa réclame les ABSENCES. Reporter l'un
   dans l'autre est une inversion, plus une transcription à la main, dans une
   page qui liste tous les élèves alors que trois ou quatre seulement portent
   une valeur. Ce module ne fait qu'une chose : dire lesquels, et combien.

   ⚠️ CE MODULE N'ÉCRIT JAMAIS DANS LE SIS.
   Aucun code d'ici ne touche à Léa. Mesuré le 7 sept. 2026 : les champs de la
   page « Absences et retards » sont des <input> indépendants qui n'acceptent
   aucun collage groupé, et le seul chemin automatisable (un bookmarklet)
   demandait à chaque enseignant une installation manuelle. Écarté. Le report
   reste manuel, et la sauvegarde dans Léa reste le geste de l'enseignant.

   CE QU'IL RÉUTILISE
   `construireModeleRapportPresences` (presences-rapport.js, #485) porte déjà
   tout le calcul délicat : exclusion des présences facultatives, appariement
   du coursId, rétrocompatibilité `heures` → `periodesPresentes`, tri par nom,
   et surtout la distinction entre « absent » (saisie faite, zéro période) et
   « vide » (aucune saisie). Ce module ne recalcule rien de cela : il inverse
   et filtre.

   ⚠ CE QUI RESTE DUPLIQUÉ, et il faut le dire : l'inversion elle-même
   (`attendues − présentes`, arrondie au dixième, tue si ≤ 0) existe aussi dans
   `presences-rapport.js`, sous la notation « périodes d'absence » du PDF
   (l. 462-468). Deux sites disent donc « périodes d'absence » à l'enseignant.
   Ils s'accordent sur toute donnée saine ; ils divergent sur un seul cas, une
   `periodesPresentes` NÉGATIVE en stockage, que ce module borne à la séance et
   que le PDF ne borne pas. Extraire l'inversion demanderait de toucher un
   chemin déjà livré et éprouvé (#485) : inscrit au BACKLOG (#780) plutôt que
   fait ici en fin de lot.

   TROIS CAS QUI NE SE RÉDUISENT PAS À UNE SOUSTRACTION (arbitrés avec Grégoire
   le 7 sept. 2026) :
   1. Aucune saisie pour l'élève à cette date → on n'affirme RIEN. Il part dans
      `sansSaisie`, à part, et jamais dans la liste à reporter. Écrire une
      absence pour quelqu'un qu'on n'a pas compté atterrirait dans un dossier
      officiel.
   2. Présence facultative (rattrapage RàI, BACKLOG #747) → elle n'entre pas
      dans le calcul (le modèle #485 l'exclut déjà), mais l'élève est SIGNALÉ.
      Savoir si un rattrapage annule l'absence au cours régulier est une règle
      institutionnelle, pas une décision de code.
   3. Retard → Léa met absence et retard dans le même champ, en périodes. Une
      présence partielle produit donc simplement la différence.

   ARCHITECTURE
   Ce module LIT le stockage (présences, étudiants, séances) et n'y écrit
   jamais. Il ne parle à aucun autre module autrement que par ses lectures.
   =============================== */

(function() {
'use strict';

/* ===============================
   NOM DU SYSTÈME D'INFORMATION SCOLAIRE
   =============================== */

// La préférence `sisDefaut` existe déjà (preferences.js, défaut 'lea') et
// pilote l'onglet Préférences. On la lit plutôt que d'écrire « Léa » en dur :
// le jour où COBA s'active, l'écran suit sans retouche.
const NOMS_SIS = {
    lea: 'Léa',
    coba: 'COBA',
    colnet: 'Col.NET'
};

function nomSisCourant() {
    let code = 'lea';
    if (typeof obtenirPreference === 'function') {
        code = obtenirPreference('sisDefaut') || 'lea';
    }
    return NOMS_SIS[code] || NOMS_SIS.lea;
}

/* ===============================
   FONCTION PURE — QUI REPORTER, ET COMBIEN
   =============================== */

/**
 * Transforme le modèle de grille #485 en liste de report pour UNE séance.
 * Fonction pure : aucune lecture de stockage, aucune dépendance DOM.
 *
 * @param {Object} modele - sortie de construireModeleRapportPresences
 *   {colonnes: [{date, periodesAttendues}], lignes: [{etudiant, cellules}]}
 * @param {string} dateStr - 'YYYY-MM-DD', la séance à reporter
 * @param {Object} [options] - {dasFacultatifs: Array<string>}
 * @returns {{date, periodesAttendues, aReporter, sansSaisie, nbTotal, nbPresents, seanceIntrouvable}}
 *   aReporter[i] = {da, nom, prenom, periodesPresentes, periodesAbsence, rai}
 *   sansSaisie[i] = {da, nom, prenom, rai}
 */
function construireReportPresences(modele, dateStr, options) {
    const opts = options || {};
    const dasFacultatifs = new Set((opts.dasFacultatifs || []).map(String));

    const colonnes = (modele && Array.isArray(modele.colonnes)) ? modele.colonnes : [];
    const lignes = (modele && Array.isArray(modele.lignes)) ? modele.lignes : [];

    const vide = {
        date: dateStr || '',
        periodesAttendues: 0,
        aReporter: [],
        sansSaisie: [],
        nbTotal: 0,
        nbPresents: 0,
        seanceIntrouvable: true
    };

    const index = colonnes.findIndex(c => c && c.date === dateStr);
    if (index === -1) return vide;

    // 0 période attendue : l'horaire ne prévoit rien ce jour-là. Personne ne
    // peut être absent d'une séance qui n'existe pas — on ne reporte rien,
    // et l'écran le dira plutôt que d'afficher une liste vide énigmatique.
    const periodesAttendues = colonnes[index].periodesAttendues > 0
        ? colonnes[index].periodesAttendues
        : 0;

    const aReporter = [];
    const sansSaisie = [];
    let nbPresents = 0;
    let nbTotal = 0;

    lignes.forEach(ligne => {
        const etudiant = ligne && ligne.etudiant;
        if (!etudiant || !etudiant.da) return;

        const cellule = Array.isArray(ligne.cellules) ? ligne.cellules[index] : null;
        if (!cellule) return;

        nbTotal++;

        const da = String(etudiant.da);
        const base = {
            da: da,
            nom: etudiant.nom || '',
            prenom: etudiant.prenom || '',
            rai: dasFacultatifs.has(da)
        };

        // Cas 1 : aucune saisie. On ne conclut pas.
        if (cellule.etat === 'vide') {
            sansSaisie.push(base);
            return;
        }

        const presentes = typeof cellule.periodes === 'number' ? cellule.periodes : 0;
        let absence = periodesAttendues - presentes;

        // Présent (ou davantage, si une saisie dépasse la séance) : rien à reporter.
        if (!(absence > 0)) {
            nbPresents++;
            return;
        }

        // Borne haute : une absence ne peut pas excéder la séance elle-même.
        // Se déclencherait si `periodesPresentes` était négatif dans le stockage.
        if (absence > periodesAttendues) absence = periodesAttendues;
        absence = Math.round(absence * 10) / 10;

        base.periodesPresentes = Math.round(presentes * 10) / 10;
        base.periodesAbsence = absence;
        aReporter.push(base);
    });

    return {
        date: dateStr,
        periodesAttendues: periodesAttendues,
        aReporter: aReporter,
        sansSaisie: sansSaisie,
        nbTotal: nbTotal,
        nbPresents: nbPresents,
        seanceIntrouvable: false
    };
}

/* ===============================
   COLLECTE — LECTURE SEULE DU STOCKAGE
   =============================== */

/**
 * DA porteurs d'une présence FACULTATIVE (rattrapage RàI) à cette date.
 * Le modèle #485 les écarte du calcul ; on les récupère pour les signaler.
 *
 * @param {Array} presences
 * @param {string} dateStr
 * @param {string|null} coursId
 * @returns {Array<string>}
 */
function listerDasFacultatifs(presences, dateStr, coursId) {
    const das = [];
    (presences || []).forEach(p => {
        if (!p || p.date !== dateStr || !p.da) return;
        if (p.facultatif !== true) return;
        // Appariement identique à saisie-presences.js : on n'écarte que si les
        // deux côtés sont définis ET différents.
        if (coursId && p.coursId && p.coursId !== coursId) return;
        das.push(String(p.da));
    });
    return das;
}

/**
 * Assemble le report pour la date affichée dans l'écran de saisie.
 * Mêmes sources que le tableau de saisie : le mode anonymisation, s'il est
 * actif, est donc hérité tel quel (les noms affichés sont ceux du tableau).
 *
 * @returns {Object|null} le report, ou null si la date est absente
 */
function collecterReportPresences() {
    const dateInput = document.getElementById('date-cours');
    const dateStr = dateInput ? dateInput.value : '';
    if (!dateStr) return null;

    let etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : (typeof obtenirDonneesSelonMode === 'function' ? obtenirDonneesSelonMode('groupeEtudiants') : []);
    etudiants = etudiants || [];

    // Même filtre de sous-groupe que le tableau de saisie : ce qu'on reporte
    // doit correspondre à ce qu'on vient de saisir, pas au cours entier.
    const selectGroupe = document.getElementById('selectGroupePresences');
    const groupeFiltre = selectGroupe ? selectGroupe.value : '';
    if (groupeFiltre) {
        etudiants = etudiants.filter(e => e && e.groupe === groupeFiltre);
    }

    let presences = typeof obtenirDonneesSelonMode === 'function'
        ? (obtenirDonneesSelonMode('presences') || [])
        : [];
    if (!Array.isArray(presences)) presences = [];

    const seancesCompletes = (typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {}) || {};

    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    const dureePeriode = typeof obtenirDureePeriode === 'function'
        ? obtenirDureePeriode()
        : (window.DUREE_PERIODE_DEFAUT || 50);

    if (typeof window.construireModeleRapportPresences !== 'function') {
        console.warn('[report SIS] construireModeleRapportPresences absente — presences-rapport.js non chargé ?');
        return null;
    }

    // Une seule date : le modèle ne produit qu'une colonne.
    const seancesUneDate = {};
    if (Array.isArray(seancesCompletes[dateStr])) {
        seancesUneDate[dateStr] = seancesCompletes[dateStr];
    }

    const modele = window.construireModeleRapportPresences(
        etudiants, seancesUneDate, presences, { coursId: coursId, dureePeriode: dureePeriode }
    );

    return construireReportPresences(modele, dateStr, {
        dasFacultatifs: listerDasFacultatifs(presences, dateStr, coursId)
    });
}

/* ===============================
   RENDU
   =============================== */

/** Séparateur décimal français : « 0,5 », pas « 0.5 ». */
function nombreFr(n) {
    return String(n).replace('.', ',');
}

/**
 * Une ligne du tableau de report. Le DA vient en premier et en gras :
 * c'est l'ancrage, parce que Léa affiche le DA en première colonne et qu'un
 * nombre à sept chiffres ne se confond pas dans une liste de 28 noms.
 */
function ligneReportHtml(eleve, periodesAttendues) {
    const mentionRai = eleve.rai
        ? ' <span class="badge-rai" title="Une présence facultative (rattrapage RàI) existe à cette date. Elle n\'est PAS déduite : à toi de décider si elle annule l\'absence.">RàI</span>'
        : '';

    // Pas de `u-texte-danger` sur la valeur à saisir : mesuré au navigateur le
    // 7 sept., la règle de couleur de `.tableau td` l'emporte et la classe ne
    // rendait rien. Le gras suffit, et il évite de dramatiser une absence.
    return `
        <tr>
            <td class="u-texte-bold">${echapperHtml(eleve.da)}</td>
            <td>${echapperHtml(eleve.nom)}, ${echapperHtml(eleve.prenom)}${mentionRai}</td>
            <td class="u-text-center u-texte-gris">${nombreFr(eleve.periodesPresentes)} / ${nombreFr(periodesAttendues)}</td>
            <td class="u-text-center u-texte-bold">${nombreFr(eleve.periodesAbsence)}</td>
        </tr>`;
}

/**
 * Construit le contenu du panneau. Séparée du basculement pour qu'un
 * rechargement de la saisie puisse la rappeler sans rouvrir le panneau.
 */
function rendrePanneauReportPresences() {
    const conteneur = document.getElementById('contenu-report-sis');
    if (!conteneur) return;

    const sis = nomSisCourant();
    const report = collecterReportPresences();

    if (!report) {
        conteneur.innerHTML = `<p class="text-muted u-m-0">Choisis d'abord une date de séance.</p>`;
        return;
    }

    if (report.seanceIntrouvable || report.periodesAttendues <= 0) {
        conteneur.innerHTML = `<p class="text-muted u-m-0">
            Aucune période n'est prévue à l'horaire pour cette date : il n'y a rien à reporter dans ${echapperHtml(sis)}.
        </p>`;
        return;
    }

    const dateLisible = typeof window.formaterDateComplete === 'function'
        ? window.formaterDateComplete(report.date)
        : report.date;

    let html = `
        <p class="u-texte-petit u-texte-gris u-mb-10 u-m-0">
            <strong>${echapperHtml(dateLisible)}</strong> ·
            séance de ${report.periodesAttendues} période${report.periodesAttendues > 1 ? 's' : ''} ·
            ${report.nbPresents} présent${report.nbPresents > 1 ? 's' : ''} sur ${report.nbTotal}
        </p>`;

    if (report.aReporter.length === 0) {
        html += `<p class="u-texte-succes u-texte-medium u-mt-10 u-mb-10">
            Personne à reporter : aucune absence saisie pour cette séance.
        </p>`;
    } else {
        html += `
        <table class="tableau u-mb-10">
            <thead>
                <tr>
                    <th class="w-100px">DA</th>
                    <th>Nom, Prénom</th>
                    <th class="u-text-center">Présent</th>
                    <th class="u-text-center">À saisir dans ${echapperHtml(sis)}</th>
                </tr>
            </thead>
            <tbody>
                ${report.aReporter.map(e => ligneReportHtml(e, report.periodesAttendues)).join('')}
            </tbody>
        </table>
        <p class="u-texte-petit u-texte-gris u-mb-10">
            ${report.aReporter.length} ligne${report.aReporter.length > 1 ? 's' : ''} à saisir dans
            ${echapperHtml(sis)}, puis n'oublie pas d'y cliquer « Sauvegarder les modifications ».
            Labo Codex n'écrit jamais dans ${echapperHtml(sis)}.
        </p>`;
    }

    if (report.sansSaisie.length > 0) {
        html += `
        <div class="u-mt-15 u-p-15" style="border-left: 4px solid var(--btn-annuler); background: var(--surface-section)">
            <p class="u-texte-medium u-mb-8 u-m-0">
                ${report.sansSaisie.length} élève${report.sansSaisie.length > 1 ? 's' : ''} sans aucune saisie à cette date
            </p>
            <p class="u-texte-petit u-texte-gris u-mb-8">
                Codex ne peut pas dire s'ils étaient absents ou si la séance n'a pas été saisie jusqu'au bout.
                Rien n'est proposé pour eux : complète la saisie, ou tranche toi-même dans ${echapperHtml(sis)}.
            </p>
            <p class="u-texte-petit u-m-0">
                ${report.sansSaisie.map(e =>
                    `${echapperHtml(e.da)} — ${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}`
                ).join(' · ')}
            </p>
        </div>`;
    }

    conteneur.innerHTML = html;
}

/**
 * Ouvre ou ferme le panneau. Panneau inline plutôt que modale : l'enseignant
 * lit ces lignes en gardant la page du SIS ouverte à côté, et une modale
 * l'obligerait à fermer pour revoir son tableau de saisie.
 */
function basculerPanneauReportPresences() {
    const panneau = document.getElementById('panneau-report-sis');
    const bouton = document.getElementById('btn-report-sis');
    if (!panneau) return;

    const ouvert = !panneau.classList.contains('u-hide');

    if (ouvert) {
        panneau.classList.add('u-hide');
        if (bouton) bouton.setAttribute('aria-expanded', 'false');
        return;
    }

    rendrePanneauReportPresences();
    panneau.classList.remove('u-hide');
    if (bouton) bouton.setAttribute('aria-expanded', 'true');

    // Le panneau apparaît sous le compteur, hors du champ de vision quand la
    // liste est longue : on y déplace le focus (règle d'accessibilité SPA).
    const titre = document.getElementById('titre-report-sis');
    if (titre && typeof titre.focus === 'function') titre.focus();
}

/**
 * Aligne le libellé du bouton sur la préférence `sisDefaut`.
 * Appelée à l'initialisation du module de saisie.
 */
function synchroniserLibelleReportSis() {
    const libelle = 'Reporter dans ' + nomSisCourant();

    const bouton = document.getElementById('btn-report-sis');
    if (bouton) bouton.textContent = libelle;

    const titre = document.getElementById('titre-report-sis');
    if (titre) titre.textContent = libelle;
}

// Patron de presences-rapport.js : le libellé s'aligne dès que la DB répond,
// sans que saisie-presences.js ait à connaître ce module.
if (typeof window.auDbPret === 'function') {
    window.auDbPret(synchroniserLibelleReportSis);
}

/* ===============================
   FRAÎCHEUR DU PANNEAU
   =============================== */

// Un panneau ouvert qui montre les absences du 4 septembre pendant que le
// tableau affiche le 8 est pire que pas de panneau du tout : il ferait
// écrire de vraies absences sur la mauvaise séance. Changer la date ou le
// sous-groupe le refait donc immédiatement.
//
// Délégation sur `document` plutôt qu'un appel depuis saisie-presences.js :
// ce module reste inconnu de celui qu'il observe, et le rendu relit le
// stockage — l'ordre d'exécution par rapport au rechargement du tableau
// n'a donc aucune importance.
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('change', function(e) {
        const cible = e && e.target;
        if (!cible || (cible.id !== 'date-cours' && cible.id !== 'selectGroupePresences')) return;

        const panneau = document.getElementById('panneau-report-sis');
        if (panneau && !panneau.classList.contains('u-hide')) {
            rendrePanneauReportPresences();
        }
    });
}

/* ===============================
   EXPORTS
   =============================== */

window.construireReportPresences = construireReportPresences;
window.listerDasFacultatifs = listerDasFacultatifs;
window.collecterReportPresences = collecterReportPresences;
window.rendrePanneauReportPresences = rendrePanneauReportPresences;
window.basculerPanneauReportPresences = basculerPanneauReportPresences;
window.synchroniserLibelleReportSis = synchroniserLibelleReportSis;

})();
