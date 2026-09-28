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

   Consigne du 12 sept. 2026, 8 h 55 (la section Cours du Cadre, #841 / #842) : deux
   familles de mots s'ajoutent ici, et nulle part ailleurs.
   - Les mots qui suivent le CONTEXTE ACTIF (l'option vide des menus de personne et de
     cours, « Aucun cours sélectionné », la phrase des éléments obligatoires du groupe-cours) :
     `motsNatureContexteActif()`, lu AU MOMENT où un menu se construit — pas après.
   - Les mots qui suivent la FICHE ouverte dans le formulaire du Cadre (« Nouveau cours » /
     « Modifier le service », le bandeau) : `motsNature(nature du menu Nature)`.

   Consigne du 12 sept. 2026, 10 h 25 (#846) : un mot qui nomme un CHOIX possible ne suit pas
   le contexte. Le champ 2 du groupe-cours (« Cours ou service ») et son option vide ont quitté
   cette table : on peut y choisir un cours comme un service, quel que soit le contexte actif.

   Chargé juste après db.js : tout module qui écrit une nature à l'écran le trouve.
   =============================== */

(function() {
'use strict';

const MOTS_NATURE = Object.freeze({
    cours: Object.freeze({
        nature: 'Enseignement',          // Cadre › Cours, menu Nature ; l'étiquette d'une fiche
        objet: 'cours',                  // « Nom du cours », « un cours »
        Objet: 'Cours',                  // en tête de phrase ou de libellé ; le bandeau « Mode modification — Cours … »
        objetLong: 'cours',              // la forme complète (identique pour un cours)
        ObjetLong: 'Cours',
        personne: 'enseignant·e',        // « l'enseignant·e responsable »
        Personne: 'Enseignant·e',        // titre de l'accordéon, fil d'Ariane, champ 5
        personneCourt: 'Enseig.',        // carte résumé du groupe-cours
        profil: 'Profil enseignant',     // Cadre › Enseignant·e, sélecteur
        choisirPersonne: 'Sélectionner un enseignant·e', // option vide du sélecteur de profil (v2-selectEnseignant)
        choisirPersonneGC: '— Choisir un enseignant —',   // option vide du champ 5 du groupe-cours (v2-gc-enseignant)
        choisirObjet: 'Sélectionner un cours...',        // option vide du menu Cours du Cadre (v2-selectCours)
        aucunObjet: 'Aucun cours sélectionné',            // la synthèse vide, à gauche du formulaire
        nouveau: 'Nouveau cours',                         // titre du formulaire (création)
        modifier: 'Modifier le cours',                    // titre du formulaire (édition)
        dupliquer: 'Dupliquer le cours',                  // titre du formulaire (duplication)
        creer: 'Créer le cours',                          // lot E2 (D3) : le bouton qui crée la fiche
        pasEncoreCree: 'Ce cours n\'est pas encore créé.',  // lot E2 : la question de sortie, en création
        // Cadre › Groupe-cours : ce qui est obligatoire (l'horaire l'est pour un cours, pas pour un service)
        elementsObligatoires: 'renseigne les 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e. La pratique de notation est facultative.',
        nbElementsObligatoires: '5 éléments obligatoires',
        elementsObligatoiresForm: 'Renseigne les 5 éléments obligatoires (la pratique de notation est facultative).',
        horaireFacultatif: ''                             // suffixe de « L'horaire des séances » dans la liste
    }),
    service: Object.freeze({
        nature: 'Orthopédagogie',
        objet: 'service',
        Objet: 'Service',
        objetLong: 'service d’orthopédagogie',
        ObjetLong: 'Service d’orthopédagogie',
        personne: 'orthopédagogue',
        Personne: 'Orthopédagogue',
        personneCourt: 'Ortho.',
        profil: 'Profil orthopédagogue',
        choisirPersonne: 'Sélectionner un·e orthopédagogue',
        choisirPersonneGC: '— Choisir un·e orthopédagogue —',
        choisirObjet: 'Sélectionner un service...',
        aucunObjet: 'Aucun service sélectionné',
        nouveau: 'Nouveau service',
        modifier: 'Modifier le service',
        dupliquer: 'Dupliquer le service',
        creer: 'Créer le service',
        pasEncoreCree: 'Ce service n\'est pas encore créé.',
        elementsObligatoires: 'renseigne les 4 éléments obligatoires : trimestre, service d’orthopédagogie, numéro de groupe et orthopédagogue. L’horaire et la pratique de notation sont facultatifs.',
        nbElementsObligatoires: '4 éléments obligatoires',
        elementsObligatoiresForm: 'Renseigne les 4 éléments obligatoires (l’horaire et la pratique de notation sont facultatifs).',
        horaireFacultatif: ' (facultatif)'
    })
});

/**
 * Les mots d'une nature. Toute valeur autre que 'service' est un cours — même règle que
 * `estCoursService` (modes.js) et que le formulaire du Cadre.
 * @param {string|{nature?: string}|null} nature - 'cours' | 'service', ou un objet cours
 * @returns {typeof MOTS_NATURE.cours}
 */
function motsNature(nature) {
    const n = (nature && typeof nature === 'object') ? nature.nature : nature;
    return n === 'service' ? MOTS_NATURE.service : MOTS_NATURE.cours;
}

/** Le mot de la nature seul : « Enseignement » ou « Orthopédagogie ». */
function motNature(nature) {
    return motsNature(nature).nature;
}

/**
 * Les mots de la nature du CONTEXTE ACTIF (`contexteActifEstService`, modes.js) — pour tout
 * ce que le Cadre affiche sans fiche ouverte : l'option vide d'un menu au moment où il se
 * construit, la synthèse vide, la phrase des éléments obligatoires. Sans contexte (démarrage,
 * harnais) : les mots d'un cours.
 */
function motsNatureContexteActif() {
    const estService = typeof contexteActifEstService === 'function' && contexteActifEstService();
    return estService ? MOTS_NATURE.service : MOTS_NATURE.cours;
}

window.MOTS_NATURE = MOTS_NATURE;
window.motsNature = motsNature;
window.motNature = motNature;
window.motsNatureContexteActif = motsNatureContexteActif;

})();
