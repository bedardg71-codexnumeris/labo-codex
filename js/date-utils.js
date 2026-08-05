/**
 * DATE-UTILS — helper de date LOCALE unique (#398, audit perf+logique 5 août 2026)
 *
 * new Date().toISOString() rend la date UTC : à Toronto, « aujourd'hui » devient
 * demain dès 20 h (EDT) / 19 h (EST). Dix sites fonctionnels calculaient la date
 * du jour ainsi (assiduité, snapshots, aperçus de présences, rythme,
 * interventions) : une séance saisie en soirée comptait immédiatement des
 * absences, les snapshots lisaient le jour calendaire de demain.
 *
 * Ce module est la SSOT du « aujourd'hui » applicatif. Chargé tôt (après db.js),
 * aucune dépendance.
 */

(function() {
'use strict';

/**
 * Date au format YYYY-MM-DD en heure LOCALE.
 * @param {Date} [d] - Date à formater (défaut : maintenant)
 * @returns {string} YYYY-MM-DD local
 */
function dateLocaleYMD(d) {
    const dt = (d instanceof Date) ? d : new Date();
    return dt.getFullYear() + '-'
        + String(dt.getMonth() + 1).padStart(2, '0') + '-'
        + String(dt.getDate()).padStart(2, '0');
}

window.dateLocaleYMD = dateLocaleYMD;

})();
