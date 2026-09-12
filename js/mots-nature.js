/* ===============================
   MOTS-NATURE.JS — le mot de chaque nature de cours (consigne du 12 septembre 2026)

   Grégoire, 12 sept. 2026, 7 h 05 : « On ne change rien au fonctionnement, on fait juste
   mettre une étiquette (qui pourrait éventuellement changer) pour clarifier comment ça
   fonctionne. » Et 7 h 35 : « Elle entre par le Cadre, elle aussi. »

   Les VALEURS en base ne changent pas : `cours.nature` vaut 'cours' ou 'service', partout,
   pour toujours (aucune migration, aucune écriture). Ce fichier est LE SEUL endroit qui
   donne le mot affiché pour une nature — le jour où d'autres services existent (aide à la
   réussite, tutorat…), l'étiquette « Orthopédagogie » se change ICI, et nulle part ailleurs.
   Point unique, à la manière de `contexteActifEstService` (modes.js) et `GROUPE_SERVICE`
   (rencontres.js) : aucun site ne recopie ces mots (verrou structurel dans
   tests/unit/sentinelle-etiquettes-nature-un-point-unique.test.js).

   Chargé juste après db.js : tout module qui écrit une nature à l'écran le trouve.
   =============================== */

(function() {
'use strict';

const MOTS_NATURE = Object.freeze({
    cours: Object.freeze({
        nature: 'Enseignement',          // Cadre › Cours, menu Nature ; l'étiquette d'une fiche
        objet: 'cours',                  // « Nom du cours », « un cours »
        Objet: 'Cours',                  // en tête de phrase ou de libellé
        objetLong: 'cours',              // la forme complète (identique pour un cours)
        ObjetLong: 'Cours',
        objetGroupeCours: 'Cours à enseigner', // Cadre › Groupe-cours, champ 2
        personne: 'enseignant·e',        // « l'enseignant·e responsable »
        Personne: 'Enseignant·e',        // titre de l'accordéon, fil d'Ariane, champ 5
        personneCourt: 'Enseig.',        // carte résumé du groupe-cours
        profil: 'Profil enseignant',     // Cadre › Enseignant·e, sélecteur
        choisirPersonne: 'Sélectionner un enseignant·e' // option vide du sélecteur
    }),
    service: Object.freeze({
        nature: 'Orthopédagogie',
        objet: 'service',
        Objet: 'Service',
        objetLong: 'service d’orthopédagogie',
        ObjetLong: 'Service d’orthopédagogie',
        objetGroupeCours: 'Service d’orthopédagogie',
        personne: 'orthopédagogue',
        Personne: 'Orthopédagogue',
        personneCourt: 'Ortho.',
        profil: 'Profil orthopédagogue',
        choisirPersonne: 'Sélectionner un·e orthopédagogue'
    })
});

/**
 * Les mots d'une nature. Toute valeur autre que 'service' est un cours — même règle que
 * `estCoursService` (modes.js) et que le formulaire du Cadre.
 * @param {string|{nature?: string}|null} nature - 'cours' | 'service', ou un objet cours
 * @returns {{nature: string, objet: string, Objet: string, objetLong: string, ObjetLong: string, objetGroupeCours: string, personne: string, Personne: string, personneCourt: string, profil: string, choisirPersonne: string}}
 */
function motsNature(nature) {
    const n = (nature && typeof nature === 'object') ? nature.nature : nature;
    return n === 'service' ? MOTS_NATURE.service : MOTS_NATURE.cours;
}

/** Le mot de la nature seul : « Enseignement » ou « Orthopédagogie ». */
function motNature(nature) {
    return motsNature(nature).nature;
}

window.MOTS_NATURE = MOTS_NATURE;
window.motsNature = motsNature;
window.motNature = motNature;

})();
