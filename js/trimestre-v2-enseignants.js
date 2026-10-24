/* ===============================
   MODULE: TRIMESTRE V2 — ENSEIGNANTS
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 5438-5739 (zone 7 MODULES-MAP §2.4).

   Périmètre : CRUD profils enseignants (chargement, peuplement dropdown,
   sélection, nouveau, vider, sauvegarde, annulation, suppression).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.populerDropdownsAssemblageV2` (hub résiduel exposé pour session A)

   Variable module-scope `enseignantEnEditionId` migrée ici (n'est pas
   consommée par les wrappers résiduels). État indépendant du résidu.
   =============================== */

(function() {
'use strict';

/**
 * #306 (décision Grégoire, 19 août 2026) : Enseignant·e suit le patron
 * « état vide masqué » de Cours/Horaire/Groupe-cours — le formulaire
 * n'apparaît que sur une sélection ou « + Nouveau profil » ; sans rien,
 * l'état vide guide vers l'action.
 */
function _basculerFormulaireEnseignant(visible) {
    const etatVide = document.getElementById('enseignant-etat-vide');
    const formulaire = document.getElementById('enseignant-formulaire-edition');
    if (etatVide) etatVide.classList.toggle('u-hide', !!visible);
    if (formulaire) formulaire.classList.toggle('u-hide', !visible);
}

function chargerProfilEnseignantV2() {
    // Migration: copier profilEnseignant vers enseignants si nécessaire
    const profilAncien = db.getSync('profilEnseignant', null);
    let enseignants = db.getSync('enseignants', []);

    if (profilAncien && profilAncien.prenom && profilAncien.nom) {
        // Vérifier si ce profil existe déjà dans la liste (par courriel).
        // CT-15 : même clé que la garde de `sauvegarderEnseignantV2`, sinon la
        // migration réinjecterait un profil que la création aurait refusé —
        // « X@Exemple.com » et « x@exemple.com » sont le même courriel.
        const existe = !!trouverDoublonNaturel(
            enseignants, profilAncien, cleNaturelleEnseignant);
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
        // Aucun enseignant : état vide (#306) — la création passe par
        // « + Nouveau profil », comme chez Cours.
        _basculerFormulaireEnseignant(false);
    }
}

/** Lot E2 : le profil ouvert, tel qu'il est en base (null en création). */
function _enseignantEnBase() {
    if (!enseignantEnEditionId) return null;
    return (db.getSync('enseignants', []) || []).find(e => e.id === enseignantEnEditionId) || null;
}

/** Lot E2 : les champs du formulaire, en objet profil. */
function _profilDesChamps() {
    const val = (id) => document.getElementById(id)?.value?.trim() || '';
    return {
        prenom: val('v2-ens-prenom'),
        nom: val('v2-ens-nom'),
        courriel: val('v2-ens-courriel'),
        institution: val('v2-ens-institution'),
        departement: val('v2-ens-departement'),
        discipline: val('v2-ens-discipline'),
        siteWeb: val('v2-ens-siteWeb')
    };
}

/** Les champs obligatoires ; la phrase de refus, inchangée, ou null. */
function _raisonProfilIncomplet(profil) {
    if (!profil.prenom || !profil.nom) return 'Le prénom et le nom sont requis';
    if (!profil.courriel) return 'Le courriel est requis';
    if (!profil.institution) return 'L\'institution est requise';
    return null;
}

/**
 * CT-15 (23 août 2026) — GARDE SUR LE COURRIEL, pour la création comme pour la modification.
 *
 * ⚠ L'IDENTITÉ EST LE COURRIEL, PAS LE NOM. Deux enseignants homonymes existent ; c'est la
 * leçon #450 transposée hors des bibliothèques — on ne bloque jamais sur un nom.
 * ⚠ ON N'INTERDIT PAS : un même courriel peut légitimement porter deux profils (deux
 * institutions, deux départements). Règle #455 : le geste reste possible, jamais silencieux.
 * @returns {boolean} true si on peut écrire
 */
function _confirmerCourrielPartage(enseignants, courriel, exclureId) {
    const memeCourriel = trouverDoublonNaturel(
        enseignants,
        { courriel },
        cleNaturelleEnseignant,
        exclureId ? { exclureId } : undefined
    );
    if (!memeCourriel) return true;
    return confirm(
        'Un profil utilise déjà « ' + courriel + ' » : ' +
        ((memeCourriel.prenom || '') + ' ' + (memeCourriel.nom || '')).trim() +
        '.\n\n' +
        'Deux profils au même courriel sont indiscernables dans les menus ' +
        'de groupe-cours.\n\n' +
        (exclureId ? 'Enregistrer quand même ?' : 'Créer quand même un second profil ?')
    );
}

/**
 * Lot E2 (D3) — un profil existant s'enregistre tout seul : « Créer le profil » ne paraît
 * qu'en création, et le titre suit.
 */
function rendreModeFicheEnseignantV2(enCreation) {
    const btn = document.getElementById('v2-btnCreerEnseignant');
    if (btn) btn.classList[enCreation ? 'remove' : 'add']('u-hide');
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = enCreation ? 'Nouveau profil' : 'Modifier le profil';
}

/** Lot E2 : « la fiche est en création et porte une saisie » (ui-dialogues.js). */
function enseignantEnCreationSaisi() {
    const formulaire = document.getElementById('enseignant-formulaire-edition');
    if (!formulaire || formulaire.classList.contains('u-hide')) return false;
    if (enseignantEnEditionId) return false;
    const p = _profilDesChamps();
    return !!(p.prenom || p.nom || p.courriel || p.institution || p.departement || p.siteWeb);
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('enseignant', enseignantEnCreationSaisi);

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

    // #841 (12 sept. 2026) : le mot de l'option vide se lit dans le point unique (js/mots-nature.js) AU MOMENT
    // où le menu se construit — « Sélectionner un enseignant·e » / « Sélectionner un·e orthopédagogue » selon le
    // contexte actif. Avant, « — Sélectionner — » en dur écrasait le mot posé par appliquerMotsNatureCadre.
    let html = '<option value="">' + motsNatureContexteActif().choisirPersonne + '</option>';
    reels.forEach(e => {
        const nomComplet = `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Sans nom';
        const selected = (e.id === enseignantEnEditionId) ? ' selected' : '';
        // CT-09 : l'id était échappé, pas le nom — asymétrie sur la même ligne.
        html += `<option value="${echapperAttribut(e.id)}"${selected}>${echapperHtml(nomComplet)}</option>`;
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
 * Lot E2 : choisir un autre profil pendant une création pose la question de sortie.
 */
async function chargerEnseignantSelectionneV2() {
    const select = document.getElementById('v2-selectEnseignant');
    const enseignantId = select?.value;

    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('enseignant'))) {
        if (select) select.value = '';     // « Rester » : la création reste à l'écran
        return;
    }

    if (!enseignantId) {
        // Aucune sélection : état vide (#306)
        enseignantEnEditionId = null;
        viderFormulaireEnseignantV2();
        _basculerFormulaireEnseignant(false);
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantId);

    if (!enseignant) {
        enseignantEnEditionId = null;
        viderFormulaireEnseignantV2();
        _basculerFormulaireEnseignant(false);
        return;
    }

    enseignantEnEditionId = enseignantId;
    _basculerFormulaireEnseignant(true);

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

    rendreModeFicheEnseignantV2(false);
}

/**
 * Prépare le formulaire pour un nouveau profil (Beta 95.2)
 */
async function nouveauProfilEnseignantV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('enseignant'))) return;
    enseignantEnEditionId = null;

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectEnseignant');
    if (select) select.value = '';

    // Vider le formulaire
    viderFormulaireEnseignantV2();

    rendreModeFicheEnseignantV2(true);

    // #306 : le geste explicite ouvre le formulaire
    _basculerFormulaireEnseignant(true);

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
}

/**
 * #474 (lot 8, 11 oct. 2026, constat CT-10) : `profilEnseignant` est « mon profil », la copie que
 * lisent en repli le groupe-cours (`'profil'`), l'attribution CC, l'export PDF et le codex. Avant, CHAQUE
 * profil enregistré l'écrasait : modifier la fiche d'un collègue faisait de lui « moi ». Le marqueur
 * explicite est `profilEnseignant.enseignantId`. Il se pose par un geste qui écrit déjà la copie,
 * jamais au chargement (aucune écriture dans le stock) :
 *   · copie marquée : seul le profil de cet id la met à jour ;
 *   · copie d'avant ce lot (sans marque) : c'est le profil qui porte le même courriel (la clé naturelle
 *     de CT-15), tel qu'il était en base avant ce geste ;
 *   · aucune copie : le premier profil enregistré est celui de l'utilisateur (supposition, écrite à
 *     la demande de relecture du lot 8).
 * @param {Object} profil - les champs écrits
 * @param {string} idEcrit - l'id du profil écrit
 * @param {Object|null} enBase - le profil tel qu'il était avant ce geste (null à la création)
 */
function _estMonProfil(idEcrit, enBase) {
    const copie = db.getSync('profilEnseignant', null);
    if (!copie || typeof copie !== 'object') return true;
    if (copie.enseignantId) return copie.enseignantId === idEcrit;
    if (!enBase) return false;
    const cleCopie = cleNaturelleEnseignant(copie);
    return !!cleCopie && cleCopie === cleNaturelleEnseignant(enBase);
}

/** Après une écriture : menus et carte relus du stock. */
function _apresEcritureEnseignant(profil, idEcrit, enBase) {
    // Synchroniser profilEnseignant (utilisé en fallback par d'autres modules) — #474 : seulement
    // pour le profil de l'utilisateur, marqué par son id.
    if (_estMonProfil(idEcrit, enBase)) db.setSync('profilEnseignant', { ...profil, enseignantId: idEcrit });
    populerDropdownEnseignantsV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

/**
 * Lot E2 (D3) — un profil EXISTANT s'enregistre tout seul, au changement de chaque champ.
 * Un champ obligatoire vidé : « Non enregistré : ‹raison› », rien n'est écrit. Le courriel
 * déjà porté par un autre profil pose la question de CT-15 ; « Annuler » remet le courriel
 * en base dans le champ. En création, rien : c'est « Créer le profil » qui écrit.
 * @returns {boolean} true si le profil a été écrit
 */
function sauvegarderChampEnseignantV2(el) {
    const enBase = _enseignantEnBase();
    if (!enBase) return false;
    const profil = _profilDesChamps();
    const geste = 'Modifier le profil';
    const raison = _raisonProfilIncomplet(profil);
    if (raison) {
        if (window.temoinEnregistrement) {
            window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(raison), geste, cle('enseignants'));
        }
        return false;
    }
    const enseignants = JSON.parse(JSON.stringify(db.getSync('enseignants', []) || []));
    if (profil.courriel !== enBase.courriel &&
        !_confirmerCourrielPartage(enseignants, profil.courriel, enBase.id)) {
        const champ = document.getElementById('v2-ens-courriel');
        if (champ) champ.value = enBase.courriel || '';
        return false;
    }
    const index = enseignants.findIndex(e => e.id === enBase.id);
    if (index < 0) return false;
    enseignants[index] = { ...enseignants[index], ...profil };
    if (!sauvegarderDonneesSelonMode('enseignants', enseignants, { geste })) return false;
    _apresEcritureEnseignant(profil, enBase.id, enBase);
    return true;
}

/**
 * Lot E2 (D3) — « Créer le profil » : le seul geste qui crée un profil. Rien n'est écrit
 * avant ce clic ; le message du geste ne part qu'après l'écriture.
 * @returns {boolean} true si le profil a été créé
 */
function creerProfilEnseignantV2() {
    if (enseignantEnEditionId) return false;
    const profil = _profilDesChamps();
    const geste = 'Créer le profil';
    const raison = _raisonProfilIncomplet(profil);
    if (raison) {
        if (window.temoinEnregistrement) {
            window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(raison), geste, cle('enseignants'));
        }
        return false;
    }
    const enseignants = JSON.parse(JSON.stringify(db.getSync('enseignants', []) || []));
    if (!_confirmerCourrielPartage(enseignants, profil.courriel, null)) return false;
    const nouveauProfil = {
        id: genererIdUnique('ENS_'),
        ...profil,
        dateCreation: new Date().toISOString()
    };
    enseignants.push(nouveauProfil);
    if (!sauvegarderDonneesSelonMode('enseignants', enseignants, { geste })) return false;
    enseignantEnEditionId = nouveauProfil.id;
    _apresEcritureEnseignant(profil, nouveauProfil.id, null);
    const select = document.getElementById('v2-selectEnseignant');
    if (select) select.value = nouveauProfil.id;
    rendreModeFicheEnseignantV2(false);
    notifications.succes(`Profil «\u00a0${`${profil.prenom} ${profil.nom}`.trim()}\u00a0» créé.`);
    return true;
}

/**
 * Lot E2 (D3) : « Annuler » devient « Fermer » — il n'annulait rien. En création, la
 * question de sortie ; sinon, retour à l'état vide (#306 : désélection + formulaire refermé).
 */
async function fermerFicheEnseignantV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('enseignant'))) return;
    enseignantEnEditionId = null;

    const select = document.getElementById('v2-selectEnseignant');
    if (select) select.value = '';

    viderFormulaireEnseignantV2();
    _basculerFormulaireEnseignant(false);
}

/**
 * Supprime le profil enseignant sélectionné (Beta 95.2)
 */
async function supprimerProfilEnseignantV2() {
    if (!enseignantEnEditionId) {
        notifications.erreur('Aucun profil sélectionné');
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantEnEditionId);

    if (!enseignant) {
        notifications.erreur('Profil non trouvé');
        return;
    }

    // Confirmation
    const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('enseignant'))) return;
    const confirme = confirm(`Veux-tu vraiment supprimer le profil de ${nomComplet} ?\n\nCette action est irréversible.`);

    if (!confirme) {
        return;
    }

    // Supprimer de la liste (lot E2 : par le témoin ; rien ne change à la suppression)
    // #1007 : relue après l'attente de la fenêtre ; celle d'avant ne vaut plus rien.
    const nouvellesListe = db.getSync('enseignants', []).filter(e => e.id !== enseignantEnEditionId);
    if (!sauvegarderDonneesSelonMode('enseignants', nouvellesListe, { geste: 'Supprimer le profil' })) return;
    // #1075, point 8 (22 oct. 2026) — « mon profil » supprimé ne revient pas : sa copie
    // `profilEnseignant` ne partait pas, et `chargerProfilEnseignantV2` la réinjectait au chargement
    // suivant (aucun profil ne portait plus son courriel). Elle part avec lui quand elle est la sienne
    // (même règle que l'écriture : `_estMonProfil`). Banc : sentinelle-1075-mon-profil-supprime.
    const copie = db.getSync('profilEnseignant', null);
    if (copie && typeof copie === 'object' && _estMonProfil(enseignant.id, enseignant)) db.removeSync('profilEnseignant');

    // Réinitialiser
    enseignantEnEditionId = null;
    viderFormulaireEnseignantV2();

    // Rafraîchir les dropdowns
    populerDropdownEnseignantsV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }

    // #306 : après suppression, retour à l'état vide (le titre sera reposé
    // par la prochaine entrée — sélection ou « + Nouveau profil »)
    _basculerFormulaireEnseignant(false);

    notifications.succes('Profil enseignant supprimé');
}

// Exports globaux
window.sauvegarderChampEnseignantV2 = sauvegarderChampEnseignantV2;
window.creerProfilEnseignantV2 = creerProfilEnseignantV2;
window.fermerFicheEnseignantV2 = fermerFicheEnseignantV2;
window.chargerProfilEnseignantV2 = chargerProfilEnseignantV2;
window.supprimerProfilEnseignantV2 = supprimerProfilEnseignantV2;
window.populerDropdownEnseignantsV2 = populerDropdownEnseignantsV2;
window.chargerEnseignantSelectionneV2 = chargerEnseignantSelectionneV2;
window.nouveauProfilEnseignantV2 = nouveauProfilEnseignantV2;

})();
