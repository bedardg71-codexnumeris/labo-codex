/* ===============================
   MODULE: FUSION DES SÉANCES D'HORAIRE (CT-04)

   Rôle: fonction PURE, sans lecture ni écriture de stockage.

   Source unique de la fusion « entités horaires → horaireHebdo ». Ce calcul
   existait en TROIS copies identiques (trimestre-v2-horaires.js à la
   sauvegarde et à la suppression, trimestre.js dans genererCalendrierComplet),
   chacune dédupliquant par JOUR seul. Conséquence mesurée (audit CT-04,
   20 août 2026) : deux groupes qui ont cours le même jour à des heures
   différentes — « Mar-Jeu » 10:00 et « Mar-soir » 18:00 — produisaient
   [Mardi 10:00, Jeudi 14:00] ; la séance du mardi soir n'atteignait jamais le
   calendrier ni la saisie des présences.

   Les trois copies devaient tomber ensemble : genererCalendrierComplet() est
   appelée juste après la sauvegarde d'un horaire, et réécrivait horaireHebdo
   avec sa propre fusion. Corriger un seul site n'aurait rien changé à l'écran.

   API publique:
   - fusionnerSeancesHoraires(horaires) → tableau de séances
     Fonction PURE (testée dans tests/unit/horaire-fusion-CT04.test.js).
   =============================== */

(function() {
'use strict';

/**
 * Fusionne les séances de toutes les entités horaire en une liste plate,
 * dédupliquée par (jour, heure de début).
 *
 * Identité d'une séance = jour normalisé + heure de début normalisée. Deux
 * séances du même jour à des heures différentes sont donc DEUX séances ; deux
 * séances du même jour à la même heure (deux groupes réellement simultanés,
 * ou un doublon de saisie) restent une seule entrée — le calendrier ne sait
 * afficher qu'un créneau.
 *
 * Robustesse : une séance sans jour est écartée plutôt que de faire planter la
 * fusion. L'ancien code appelait `s.jour.toLowerCase()` sans garde.
 *
 * L'ordre d'insertion est préservé (premier arrivé, premier gardé) : le
 * calendrier et les présences lisent cette liste telle quelle.
 *
 * @param {Array<{seances?: Array<object>}>} horaires - entités horaire
 * @returns {Array<object>} séances fusionnées, sans doublon (jour, heure)
 */
function fusionnerSeancesHoraires(horaires) {
    const toutesSeances = [];
    if (!Array.isArray(horaires)) return toutesSeances;

    const creneauxDejaVus = new Set();

    horaires.forEach(h => {
        if (!h || !Array.isArray(h.seances)) return;

        h.seances.forEach(s => {
            if (!s || s.jour == null || s.jour === '') return;

            const jourNormalise = String(s.jour).trim().toLowerCase();
            if (!jourNormalise) return;

            // `debut` est la forme des données antérieures à la V2 ; les deux
            // cohabitent dans les séances lues (cf. trimestre-v2-horaires.js).
            const heureBrute = s.heureDebut != null && s.heureDebut !== ''
                ? s.heureDebut
                : (s.debut != null ? s.debut : '');
            const heureNormalisee = String(heureBrute).trim().toLowerCase();

            const creneau = jourNormalise + '@' + heureNormalisee;
            if (creneauxDejaVus.has(creneau)) return;

            creneauxDejaVus.add(creneau);
            toutesSeances.push(s);
        });
    });

    return toutesSeances;
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.fusionnerSeancesHoraires = fusionnerSeancesHoraires;

})();
