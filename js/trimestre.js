/* ===============================
   MODULE: TRIMESTRE — accès calendrier (résidu post-Beta 95 + Phase 2 cascade)

   Le module est devenu un mince accesseur après le démantèlement de la
   chaîne événements legacy (Beta 95 → Phases 1 et 2 legacy 95, mai 2026).
   Il expose deux getters lus par snapshots.js, saisie-presences.js,
   calendrier-vue.js, rythme.js, et la suite trimestre-v2-*.

   La source de vérité reste la clé localStorage `calendrierComplet`
   peuplée par trimestre-v2-init.js / trimestre-v2-horaires.js.
   =============================== */

(function() {
'use strict';

/**
 * calendrierComplet (localStorage) — source de vérité
 * Dictionnaire date → infos jour. Statuts possibles :
 *   "cours" | "reprise" | "conge" (avec motif) | "weekend" |
 *   "semaine-planification" | "semaine-examens"
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

window.obtenirCalendrierComplet = obtenirCalendrierComplet;
window.obtenirInfosJour = obtenirInfosJour;

})();
