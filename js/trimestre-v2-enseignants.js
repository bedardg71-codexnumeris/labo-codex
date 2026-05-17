/* ===============================
   MODULE: TRIMESTRE V2 — ENSEIGNANTS
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 5438-5739 (zone 7 MODULES-MAP §2.4).

   Périmètre : CRUD profils enseignants (chargement, peuplement dropdown,
   sélection, nouveau, vider, sauvegarde, annulation, suppression).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.afficherSyntheseEnseignant` (zone 6 résidu, déjà exposé)
   - `window.populerDropdownsAssemblageV2` (hub résiduel exposé pour session A)

   Variable module-scope `enseignantEnEditionId` migrée ici (n'est pas
   consommée par les wrappers résiduels). État indépendant du résidu.
   =============================== */

(function() {
'use strict';

// Wrappers défensifs notifications — duplication assumée (consolidation
// `utils-notifications.js` reportée à un chantier post-refactor pour éviter
// de modifier les 73 sites d'appel dans trimestre-v2.js pendant la session A).
function afficherNotificationSucces(message, details) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(message, details);
    }
}

function afficherNotificationErreur(message, details) {
    if (typeof window.afficherNotificationErreur === 'function') {
        window.afficherNotificationErreur(message, details);
    } else {
        console.warn('[Trimestre V2 Enseignants] Erreur :', message, details || '');
    }
}

function chargerProfilEnseignantV2() {
    // Migration: copier profilEnseignant vers enseignants si nécessaire
    const profilAncien = db.getSync('profilEnseignant', null);
    let enseignants = db.getSync('enseignants', []);

    if (profilAncien && profilAncien.prenom && profilAncien.nom) {
        // Vérifier si ce profil existe déjà dans la liste (par courriel)
        const existe = enseignants.some(e => e.courriel === profilAncien.courriel);
        if (!existe) {
            const nouveauProfil = {
                id: genererIdUnique('ENS_'),
                ...profilAncien,
                dateCreation: new Date().toISOString()
            };
            enseignants.push(nouveauProfil);
            db.setSync('enseignants', enseignants);
            // Optionnel: nettoyer l'ancien profil
            // db.setSync('profilEnseignant', null);
        }
    }

    // Peupler le dropdown
    populerDropdownEnseignantsV2();

    // Sélectionner le premier enseignant s'il y en a
    if (enseignants.length > 0) {
        const select = document.getElementById('v2-selectEnseignant');
        if (select && !select.value) {
            select.value = enseignants[0].id;
            chargerEnseignantSelectionneV2();
        }
    } else {
        // Aucun enseignant - préparer pour nouveau
        const titre = document.getElementById('v2-titreFormEnseignant');
        if (titre) titre.textContent = 'Nouveau profil';
        mettreAJourCarteEnseignant();
    }
}

/**
 * Met à jour la carte résumé de l'enseignant
 * Appelée à chaque modification des champs du formulaire
 */
function mettreAJourCarteEnseignant() {
    // 🆕 Beta 95.3 : Utilise afficherSyntheseEnseignant() pour unifier la logique
    const enseignant = {
        prenom: document.getElementById('v2-ens-prenom')?.value?.trim() || '',
        nom: document.getElementById('v2-ens-nom')?.value?.trim() || '',
        courriel: document.getElementById('v2-ens-courriel')?.value?.trim() || '',
        institution: document.getElementById('v2-ens-institution')?.value?.trim() || '',
        departement: document.getElementById('v2-ens-departement')?.value?.trim() || ''
    };
    if (typeof window.afficherSyntheseEnseignant === 'function') {
        window.afficherSyntheseEnseignant(enseignant);
    }
}

// Variable pour suivre l'enseignant en édition (Beta 95.2)
let enseignantEnEditionId = null;

/**
 * Peuple le dropdown de sélection des enseignants (Beta 95.2)
 */
function populerDropdownEnseignantsV2() {
    const select = document.getElementById('v2-selectEnseignant');
    if (!select) return;

    const enseignants = db.getSync('enseignants', []);

    // En mode démo legacy, les enseignants démo sont dans la clé globale ;
    // on les affiche dans la section principale comme avant.
    const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const reels = enDemoLegacy ? enseignants : enseignants.filter(e => !e.isDemo);

    let html = '<option value="">— Sélectionner —</option>';
    reels.forEach(e => {
        const nomComplet = `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Sans nom';
        const selected = (e.id === enseignantEnEditionId) ? ' selected' : '';
        html += `<option value="${echapperHtml(e.id)}"${selected}>${nomComplet}</option>`;
    });

    select.innerHTML = html;

    // Section Démo (Plan 1 Phase 2.4) : seulement en mode normal
    if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
        const enseignantsDemo = db.getSync(cleDemo('enseignants'), []) || [];
        BibliothequeUI.ajouterOptgroupDemo(select, enseignantsDemo, e =>
            `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Sans nom'
        );
    }
}

/**
 * Charge l'enseignant sélectionné dans le formulaire (Beta 95.2)
 */
function chargerEnseignantSelectionneV2() {
    const select = document.getElementById('v2-selectEnseignant');
    const enseignantId = select?.value;

    if (!enseignantId) {
        // Aucune sélection - vider le formulaire
        viderFormulaireEnseignantV2();
        enseignantEnEditionId = null;
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantId);

    if (!enseignant) {
        viderFormulaireEnseignantV2();
        enseignantEnEditionId = null;
        return;
    }

    enseignantEnEditionId = enseignantId;

    // Remplir le formulaire
    const setValue = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setValue('v2-ens-prenom', enseignant.prenom);
    setValue('v2-ens-nom', enseignant.nom);
    setValue('v2-ens-courriel', enseignant.courriel);
    setValue('v2-ens-institution', enseignant.institution);
    setValue('v2-ens-departement', enseignant.departement);
    setValue('v2-ens-discipline', enseignant.discipline);
    setValue('v2-ens-siteWeb', enseignant.siteWeb);

    // Mettre à jour le titre et la carte
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Modifier le profil';

    mettreAJourCarteEnseignant();
}

/**
 * Prépare le formulaire pour un nouveau profil (Beta 95.2)
 */
function nouveauProfilEnseignantV2() {
    enseignantEnEditionId = null;

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectEnseignant');
    if (select) select.value = '';

    // Vider le formulaire
    viderFormulaireEnseignantV2();

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Nouveau profil';

    // Focus sur le premier champ
    document.getElementById('v2-ens-prenom')?.focus();
}

/**
 * Vide le formulaire enseignant
 */
function viderFormulaireEnseignantV2() {
    const champs = ['v2-ens-prenom', 'v2-ens-nom', 'v2-ens-courriel', 'v2-ens-institution', 'v2-ens-departement', 'v2-ens-discipline', 'v2-ens-siteWeb'];
    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });
    mettreAJourCarteEnseignant();
}

/**
 * Sauvegarde le profil enseignant (Beta 95.2 - multi-profils)
 */
async function sauvegarderEnseignantV2() {
    const prenom = document.getElementById('v2-ens-prenom')?.value?.trim() || '';
    const nom = document.getElementById('v2-ens-nom')?.value?.trim() || '';
    const courriel = document.getElementById('v2-ens-courriel')?.value?.trim() || '';
    const institution = document.getElementById('v2-ens-institution')?.value?.trim() || '';

    // Validation
    if (!prenom || !nom) {
        afficherNotificationErreur('Le prénom et le nom sont requis');
        return;
    }
    if (!courriel) {
        afficherNotificationErreur('Le courriel est requis');
        return;
    }
    if (!institution) {
        afficherNotificationErreur('L\'institution est requise');
        return;
    }

    const profil = {
        prenom: prenom,
        nom: nom,
        courriel: courriel,
        institution: institution,
        departement: document.getElementById('v2-ens-departement')?.value?.trim() || '',
        discipline: document.getElementById('v2-ens-discipline')?.value?.trim() || '',
        siteWeb: document.getElementById('v2-ens-siteWeb')?.value?.trim() || ''
    };

    let enseignants = db.getSync('enseignants', []);

    if (enseignantEnEditionId) {
        // Modification d'un profil existant
        const index = enseignants.findIndex(e => e.id === enseignantEnEditionId);
        if (index >= 0) {
            enseignants[index] = { ...enseignants[index], ...profil };
        }
        afficherNotificationSucces('Profil enseignant modifié');
    } else {
        // Nouveau profil
        const nouveauProfil = {
            id: genererIdUnique('ENS_'),
            ...profil,
            dateCreation: new Date().toISOString()
        };
        enseignants.push(nouveauProfil);
        enseignantEnEditionId = nouveauProfil.id;
        afficherNotificationSucces('Profil enseignant créé');
    }

    db.setSync('enseignants', enseignants);

    // Synchroniser profilEnseignant (utilisé en fallback par d'autres modules)
    db.setSync('profilEnseignant', profil);

    // Rafraîchir les dropdowns
    populerDropdownEnseignantsV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Modifier le profil';
}

/**
 * Annule les modifications et recharge le profil depuis le stockage
 */
function annulerFormEnseignantV2() {
    if (enseignantEnEditionId) {
        chargerEnseignantSelectionneV2();
    } else {
        viderFormulaireEnseignantV2();
    }
    afficherNotificationSucces('Modifications annulées');
}

/**
 * Supprime le profil enseignant sélectionné (Beta 95.2)
 */
async function supprimerProfilEnseignantV2() {
    if (!enseignantEnEditionId) {
        afficherNotificationErreur('Aucun profil sélectionné');
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantEnEditionId);

    if (!enseignant) {
        afficherNotificationErreur('Profil non trouvé');
        return;
    }

    // Confirmation
    const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
    const confirme = confirm(`Veux-tu vraiment supprimer le profil de ${nomComplet} ?\n\nCette action est irréversible.`);

    if (!confirme) {
        return;
    }

    // Supprimer de la liste
    const nouvellesListe = enseignants.filter(e => e.id !== enseignantEnEditionId);
    db.setSync('enseignants', nouvellesListe);

    // Réinitialiser
    enseignantEnEditionId = null;
    viderFormulaireEnseignantV2();

    // Rafraîchir les dropdowns
    populerDropdownEnseignantsV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Nouveau profil';

    afficherNotificationSucces('Profil enseignant supprimé');
}

// Exports globaux
window.mettreAJourCarteEnseignant = mettreAJourCarteEnseignant;
window.sauvegarderEnseignantV2 = sauvegarderEnseignantV2;
window.annulerFormEnseignantV2 = annulerFormEnseignantV2;
window.chargerProfilEnseignantV2 = chargerProfilEnseignantV2;
window.supprimerProfilEnseignantV2 = supprimerProfilEnseignantV2;
window.populerDropdownEnseignantsV2 = populerDropdownEnseignantsV2;
window.chargerEnseignantSelectionneV2 = chargerEnseignantSelectionneV2;
window.nouveauProfilEnseignantV2 = nouveauProfilEnseignantV2;

})();
