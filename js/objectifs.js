/**
 * GESTION DES OBJECTIFS D'APPRENTISSAGE
 *
 * Ce module gère les ensembles d'objectifs réutilisables pour les pratiques
 * d'évaluation multi-objectifs.
 *
 * VERSION : 1.0
 * DATE : 26 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise le module des objectifs
 */
function initialiserModuleObjectifs() {
    chargerEnsemblesObjectifs();
    afficherListeEnsemblesObjectifs();
    mettreAJourStatsObjectifs();

    // Gestionnaire d'événements pour les boutons d'export (Beta 92 - fix async)
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.btn-exporter-ensemble')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-exporter-ensemble');
            const ensembleId = btn.getAttribute('data-ensemble-id');
            if (ensembleId) {
                await exporterEnsembleObjectifs(ensembleId);
            }
        }
    });

}

// ============================================================================
// GESTION DU STORAGE
// ============================================================================

/**
 * Charge les ensembles d'objectifs depuis le storage
 * @returns {Array} Liste des ensembles
 */
function chargerEnsemblesObjectifs() {
    return db.getSync('objectifsTemplates', []);
}

/**
 * Sauvegarde les ensembles d'objectifs dans le storage
 * @param {Array} ensembles - Liste des ensembles
 */
function sauvegarderEnsemblesObjectifs(ensembles) {
    db.setSync('objectifsTemplates', ensembles);
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('objectifsTemplates');   // lot F : geste hors témoin (sauvegarderEnsemblesObjectifs)
    mettreAJourStatsObjectifs();
    afficherListeEnsemblesObjectifs();
}

// ============================================================================
// AFFICHAGE DE LA LISTE
// ============================================================================

/**
 * Affiche la liste des ensembles d'objectifs dans la sidebar
 */
function afficherListeEnsemblesObjectifs() {
    const liste = document.getElementById('listeEnsemblesObjectifs');

    // ✅ CORRECTION (Beta 95.5) : Vérification null avant accès
    if (!liste) {
        // Élément non présent dans le DOM (section non active)
        return;
    }

    const ensembles = chargerEnsemblesObjectifs();

    if (ensembles.length === 0) {
        liste.innerHTML = '<p class="banque-vide">Aucun ensemble d\'objectifs</p>';
        return;
    }

    let html = '';
    ensembles.forEach((ensemble, index) => {
        const nbObjectifs = ensemble.objectifs ? ensemble.objectifs.length : 0;
        html += `
            <div class="sidebar-item" data-action="afficherEnsembleObjectifs" data-param="${ensemble.id}">
                <div class="sidebar-item-titre">${echapperHtml(ensemble.nom)}</div>
                <div class="sidebar-item-badges"><span class="badge-caracteristique">${nbObjectifs} objectifs</span></div>
            </div>
        `;
    });

    liste.innerHTML = html;
}

/**
 * Met à jour les statistiques
 */
function mettreAJourStatsObjectifs() {
    const ensembles = chargerEnsemblesObjectifs();
    const stat = document.getElementById('stat-objectifs-ensembles');
    if (stat) {
        stat.textContent = ensembles.length;
    }
}

// ============================================================================
// CRÉATION D'UN NOUVEL ENSEMBLE
// ============================================================================

/**
 * Crée un nouvel ensemble d'objectifs
 */
function creerNouvelEnsembleObjectifs() {
    const id = genererIdUnique('objectifs_');

    const nouvelEnsemble = {
        id: id,
        nom: 'Nouvel ensemble d\'objectifs',
        auteur: '',
        etablissement: '',
        discipline: '',
        description: '',
        version: '1.0',
        date_creation: new Date().toISOString().split('T')[0],
        objectifs: []
    };

    // Ajouter 3 objectifs par défaut
    nouvelEnsemble.objectifs.push(creerObjectifVide(1));
    nouvelEnsemble.objectifs.push(creerObjectifVide(2));
    nouvelEnsemble.objectifs.push(creerObjectifVide(3));

    // Sauvegarder
    const ensembles = chargerEnsemblesObjectifs();
    ensembles.push(nouvelEnsemble);
    sauvegarderEnsemblesObjectifs(ensembles);

    // Afficher l'éditeur
    afficherEnsembleObjectifs(id);
}

/**
 * Crée un objectif vide
 * @param {number} index - Index de l'objectif
 * @returns {object} Objectif vide
 */
function creerObjectifVide(index) {
    return {
        id: 'obj' + index,
        nom: '',
        poids: 0,
        type: 'fondamental'
    };
}

// ============================================================================
// AFFICHAGE ET ÉDITION D'UN ENSEMBLE
// ============================================================================

/**
 * Affiche un ensemble d'objectifs pour édition
 * @param {string} ensembleId - ID de l'ensemble
 */
function afficherEnsembleObjectifs(ensembleId) {
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble) {
        console.error('Ensemble introuvable:', ensembleId);
        return;
    }

    // Cacher le message d'accueil
    const messageAccueil = document.getElementById('messageAccueilObjectifs');
    if (messageAccueil) messageAccueil.classList.add('hidden');

    // Afficher la zone d'édition
    const zoneEdition = document.getElementById('editionEnsembleObjectifs');
    if (zoneEdition) {
        zoneEdition.classList.remove('hidden');
        // Générer le HTML
        zoneEdition.innerHTML = genererFormulaireEnsemble(ensemble);
    }

    // Calculer le total
    calculerTotalPoidsEnsemble();
}

/**
 * Génère le formulaire d'édition d'un ensemble
 * @param {object} ensemble - Ensemble d'objectifs
 * @returns {string} HTML du formulaire
 */
function genererFormulaireEnsemble(ensemble) {
    const objectifsHTML = ensemble.objectifs.map((obj, index) => `
        <div class="objectif-item" data-index="${index}">
            <input type="text"
                   class="controle-form"
                   placeholder="Nom de l'objectif"
                   value="${echapperHtml(obj.nom)}"
                   data-field="nom"
                   data-on-input="marquerEnsembleModifie">
            <input type="number"
                   class="controle-form"
                   placeholder="Poids %"
                   value="${echapperHtml(obj.poids)}"
                   min="0"
                   max="100"
                   step="1"
                   data-field="poids"
                   data-on-input="calculerTotalEtMarquerHandler">
            <select class="controle-form" data-field="type" data-on-change="marquerEnsembleModifie">
                <option value="fondamental" ${obj.type === 'fondamental' ? 'selected' : ''}>Fondamental</option>
                <option value="integrateur" ${obj.type === 'integrateur' ? 'selected' : ''}>Intégrateur</option>
                <option value="transversal" ${obj.type === 'transversal' ? 'selected' : ''}>Transversal</option>
            </select>
            <button type="button"
                    class="btn btn-tres-compact btn-supprimer"
                    data-action="retirerObjectifEnsemble" data-param="${index}">Supprimer</button>
        </div>
    `).join('');

    return `
        <input type="hidden" id="ensembleActuelId" value="${echapperHtml(ensemble.id)}">

        <h3>Édition de l'ensemble</h3>

        <!-- Informations générales -->
        <div class="carte-info-section">
            <h4>Informations générales</h4>

            <!-- Nom + Pratiques compatibles sur même ligne -->
            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap;">
                <div class="groupe-form" style="flex: 1; min-width: 300px; margin: 0;">
                    <label>Nom de l'ensemble *</label>
                    <input type="text"
                           id="ensembleNom"
                           class="controle-form"
                           value="${echapperHtml(ensemble.nom)}"
                           placeholder="Ex: Objectifs Calcul différentiel"
                           data-on-input="marquerEnsembleModifie">
                </div>
            </div>

            <div class="grid-2col">
                <div class="groupe-form">
                    <label>Auteur</label>
                    <input type="text"
                           id="ensembleAuteur"
                           class="controle-form"
                           value="${echapperHtml(ensemble.auteur || '')}"
                           placeholder="Ton nom"
                           data-on-input="marquerEnsembleModifie">
                </div>
                <div class="groupe-form">
                    <label>Établissement</label>
                    <input type="text"
                           id="ensembleEtablissement"
                           class="controle-form"
                           value="${echapperHtml(ensemble.etablissement || '')}"
                           placeholder="Ex: Cégep de..."
                           data-on-input="marquerEnsembleModifie">
                </div>
            </div>

            <div class="groupe-form">
                <label>Discipline</label>
                <input type="text"
                       id="ensembleDiscipline"
                       class="controle-form"
                       value="${echapperHtml(ensemble.discipline || '')}"
                       placeholder="Ex: Mathématiques, Biologie..."
                       data-on-input="marquerEnsembleModifie">
            </div>

            <div class="groupe-form">
                <label>Description</label>
                <textarea id="ensembleDescription"
                          class="controle-form"
                          rows="2"
                          placeholder="Description optionnelle de cet ensemble d'objectifs"
                          data-on-input="marquerEnsembleModifie">${echapperHtml(ensemble.description || '')}</textarea>
            </div>
        </div>

        <!-- Liste des objectifs -->
        <div class="objectifs-section">
            <div class="section-header">
                <h4>Objectifs (compétences)</h4>
                <button type="button" data-action="ajouterObjectifEnsemble" class="btn btn-secondaire">
                    + Ajouter un objectif
                </button>
            </div>

            <div id="listeObjectifsEnsemble">
                ${objectifsHTML}
            </div>
        </div>

        <!-- Indicateur du total -->
        <div class="total-poids-container">
            <div class="total-poids-header">
                <span class="total-poids-label">Total des pondérations :</span>
                <span id="totalPoidsEnsemble" class="total-poids-valeur">
                    0%
                </span>
            </div>
            <p id="validationPoidsEnsemble" class="total-poids-message">
                Le total doit atteindre 100% pour que l'ensemble soit valide
            </p>
        </div>

        <!-- Boutons d'action -->
        <div class="btn-groupe" style="display: flex; justify-content: space-between; align-items: center;">
            <!-- Boutons gauche (actions sur l'ensemble) -->
            <div style="display: flex; gap: 10px;">
                <button data-action="dupliquerEnsembleObjectifs" data-param="${ensemble.id}" class="btn btn-secondaire" style="display: ${ensemble.nom === 'Nouvel ensemble d\'objectifs' ? 'none' : 'inline-block'};" title="Créer une copie de cet ensemble">
                    Dupliquer l'ensemble
                </button>
                <button class="btn btn-secondaire btn-exporter-ensemble" data-ensemble-id="${ensemble.id}" style="display: ${ensemble.nom === 'Nouvel ensemble d\'objectifs' ? 'none' : 'inline-block'};" title="Exporter cet ensemble">
                    Exporter l'ensemble
                </button>
                <button data-action="supprimerEnsembleObjectifs" data-param="${ensemble.id}" class="btn btn-supprimer" title="Supprimer cet ensemble">
                    Supprimer l'ensemble
                </button>
            </div>
            <!-- Boutons droite (actions principales) -->
            <div style="display: flex; gap: 10px;">
                <button data-action="annulerEditionEnsemble" class="btn btn-annuler">
                    Annuler
                </button>
                <button data-action="sauvegarderEnsembleObjectifs" class="btn btn-confirmer" id="btnSauvegarderEnsemble">
                    Enregistrer
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// GESTION DES OBJECTIFS DANS L'ENSEMBLE
// ============================================================================

/**
 * Ajoute un objectif à l'ensemble en cours d'édition
 */
function ajouterObjectifEnsemble() {
    const ensembleId = document.getElementById('ensembleActuelId').value;
    const ensembles = chargerEnsemblesObjectifs();
    const ensembleIndex = ensembles.findIndex(e => e.id === ensembleId);

    if (ensembleIndex === -1) return;

    // D'abord, sauvegarder les modifications en cours du formulaire
    const nom = document.getElementById('ensembleNom').value.trim();
    const auteur = document.getElementById('ensembleAuteur').value.trim();
    const etablissement = document.getElementById('ensembleEtablissement').value.trim();
    const discipline = document.getElementById('ensembleDiscipline').value.trim();
    const description = document.getElementById('ensembleDescription').value.trim();

    // Récupérer les objectifs actuels
    const objectifsElements = document.querySelectorAll('#listeObjectifsEnsemble .objectif-item');
    const objectifs = [];

    objectifsElements.forEach((elem, idx) => {
        const nomObj = elem.querySelector('[data-field="nom"]').value.trim();
        const poids = parseFloat(elem.querySelector('[data-field="poids"]').value) || 0;
        const type = elem.querySelector('[data-field="type"]').value;

        objectifs.push({
            id: 'obj' + (idx + 1),
            nom: nomObj,
            poids: poids,
            type: type
        });
    });

    // Ajouter le nouvel objectif
    const nouvelObjectif = creerObjectifVide(objectifs.length + 1);
    objectifs.push(nouvelObjectif);

    // Mettre à jour l'ensemble
    ensembles[ensembleIndex].nom = nom;
    ensembles[ensembleIndex].auteur = auteur;
    ensembles[ensembleIndex].etablissement = etablissement;
    ensembles[ensembleIndex].discipline = discipline;
    ensembles[ensembleIndex].description = description;
    ensembles[ensembleIndex].objectifs = objectifs;
    ensembles[ensembleIndex].date_modification = new Date().toISOString().split('T')[0];

    // Sauvegarder l'ensemble modifié pour mettre à jour le badge
    sauvegarderEnsemblesObjectifs(ensembles);

    // Réafficher
    afficherEnsembleObjectifs(ensembleId);
    marquerEnsembleModifie();
}

/**
 * Retire un objectif de l'ensemble
 * @param {number} index - Index de l'objectif à retirer
 */
function retirerObjectifEnsemble(index) {
    const ensembleId = document.getElementById('ensembleActuelId').value;
    const ensembles = chargerEnsemblesObjectifs();
    const ensembleIndex = ensembles.findIndex(e => e.id === ensembleId);

    if (ensembleIndex === -1) return;

    const ensemble = ensembles[ensembleIndex];
    if (!ensemble.objectifs[index]) return;

    if (!confirm(`Retirer l'objectif "${ensemble.objectifs[index].nom || '(sans nom)'}" ?`)) {
        return;
    }

    // D'abord, sauvegarder les modifications en cours du formulaire
    const nom = document.getElementById('ensembleNom').value.trim();
    const auteur = document.getElementById('ensembleAuteur').value.trim();
    const etablissement = document.getElementById('ensembleEtablissement').value.trim();
    const discipline = document.getElementById('ensembleDiscipline').value.trim();
    const description = document.getElementById('ensembleDescription').value.trim();

    // Récupérer les objectifs actuels (sauf celui à supprimer)
    const objectifsElements = document.querySelectorAll('#listeObjectifsEnsemble .objectif-item');
    const objectifs = [];

    objectifsElements.forEach((elem, idx) => {
        if (idx !== index) { // Exclure l'objectif à supprimer
            const nomObj = elem.querySelector('[data-field="nom"]').value.trim();
            const poids = parseFloat(elem.querySelector('[data-field="poids"]').value) || 0;
            const type = elem.querySelector('[data-field="type"]').value;

            objectifs.push({
                id: 'obj' + (objectifs.length + 1),
                nom: nomObj,
                poids: poids,
                type: type
            });
        }
    });

    // Mettre à jour l'ensemble
    ensembles[ensembleIndex].nom = nom;
    ensembles[ensembleIndex].auteur = auteur;
    ensembles[ensembleIndex].etablissement = etablissement;
    ensembles[ensembleIndex].discipline = discipline;
    ensembles[ensembleIndex].description = description;
    ensembles[ensembleIndex].objectifs = objectifs;
    ensembles[ensembleIndex].date_modification = new Date().toISOString().split('T')[0];

    // Sauvegarder l'ensemble modifié pour mettre à jour le badge
    sauvegarderEnsemblesObjectifs(ensembles);

    // Réafficher
    afficherEnsembleObjectifs(ensembleId);
    marquerEnsembleModifie();
}

/**
 * Calcule le total des pondérations
 */
function calculerTotalPoidsEnsemble() {
    const objectifs = document.querySelectorAll('#listeObjectifsEnsemble .objectif-item');
    let total = 0;

    objectifs.forEach(obj => {
        const poidsInput = obj.querySelector('[data-field="poids"]');
        const poids = parseFloat(poidsInput.value) || 0;
        total += poids;
    });

    // Mettre à jour l'affichage
    const totalSpan = document.getElementById('totalPoidsEnsemble');
    const validationP = document.getElementById('validationPoidsEnsemble');

    if (!totalSpan || !validationP) return;

    totalSpan.textContent = total + '%';

    // Changer la couleur selon la validité
    totalSpan.classList.remove('u-texte-succes', 'u-texte-danger', 'u-texte-warning');
    validationP.classList.remove('u-texte-succes', 'u-texte-danger', 'u-texte-warning');

    if (total === 100) {
        totalSpan.classList.add('u-texte-succes');
        validationP.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Total valide ! L\'ensemble peut être utilisé.';
        validationP.classList.add('u-texte-succes');
    } else if (total > 100) {
        totalSpan.classList.add('u-texte-danger');
        validationP.innerHTML = '<span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Le total dépasse 100% (' + total + '%). Ajustez les pondérations.';
        validationP.classList.add('u-texte-danger');
    } else {
        totalSpan.classList.add('u-texte-warning');
        validationP.textContent = 'Le total doit atteindre 100% (actuellement ' + total + '%)';
        validationP.classList.add('u-texte-warning');
    }

    return total;
}

/**
 * Marque l'ensemble comme modifié
 */
function marquerEnsembleModifie() {
    const btnSauvegarder = document.getElementById('btnSauvegarderEnsemble');
    if (btnSauvegarder) {
        btnSauvegarder.textContent = 'Enregistrer *';
        // Le bouton reste vert (btn-confirmer) même avec des modifications
    }
}

// ============================================================================
// SAUVEGARDE ET ANNULATION
// ============================================================================

/**
 * Sauvegarde les modifications de l'ensemble
 */
function sauvegarderEnsembleObjectifs() {
    const ensembleId = document.getElementById('ensembleActuelId').value;
    const ensembles = chargerEnsemblesObjectifs();
    const index = ensembles.findIndex(e => e.id === ensembleId);

    if (index === -1) {
        console.error('Ensemble introuvable:', ensembleId);
        return;
    }

    // Récupérer les valeurs du formulaire
    const nom = document.getElementById('ensembleNom').value.trim();
    const auteur = document.getElementById('ensembleAuteur').value.trim();
    const etablissement = document.getElementById('ensembleEtablissement').value.trim();
    const discipline = document.getElementById('ensembleDiscipline').value.trim();
    const description = document.getElementById('ensembleDescription').value.trim();

    // Valider
    if (!nom) {
        alert('Le nom de l\'ensemble est obligatoire.');
        return;
    }

    // Récupérer les objectifs
    const objectifsElements = document.querySelectorAll('#listeObjectifsEnsemble .objectif-item');
    const objectifs = [];

    objectifsElements.forEach((elem, idx) => {
        const nomObj = elem.querySelector('[data-field="nom"]').value.trim();
        const poids = parseFloat(elem.querySelector('[data-field="poids"]').value) || 0;
        const type = elem.querySelector('[data-field="type"]').value;

        objectifs.push({
            id: 'obj' + (idx + 1),
            nom: nomObj,
            poids: poids,
            type: type
        });
    });

    // Valider le total
    const total = calculerTotalPoidsEnsemble();
    if (total !== 100) {
        if (!confirm(`Le total des pondérations est de ${total}% au lieu de 100%.\n\nVeux-tu quand même enregistrer ?`)) {
            return;
        }
    }


    // Mettre à jour l'ensemble
    ensembles[index].nom = nom;
    ensembles[index].auteur = auteur;
    ensembles[index].etablissement = etablissement;
    ensembles[index].discipline = discipline;
    ensembles[index].description = description;
    ensembles[index].objectifs = objectifs;
    ensembles[index].date_modification = new Date().toISOString().split('T')[0];

    // Sauvegarder
    sauvegarderEnsemblesObjectifs(ensembles);

    // Réinitialiser le bouton
    const btnSauvegarder = document.getElementById('btnSauvegarderEnsemble');
    if (btnSauvegarder) {
        btnSauvegarder.textContent = 'Sauvegarder';
        btnSauvegarder.style.background = '';
    }

    // Afficher les boutons Dupliquer et Exporter si le nom a changé (Beta 92)
    if (nom !== 'Nouvel ensemble d\'objectifs') {
        const btnsDupliquer = document.querySelectorAll('[data-action="dupliquerEnsembleObjectifs"]');
        const btnsExporter = document.querySelectorAll('.btn-exporter-ensemble');
        btnsDupliquer.forEach(btn => btn.classList.remove('u-hide'));
        btnsExporter.forEach(btn => btn.classList.remove('u-hide'));
    }

    alert('✅ Ensemble d\'objectifs enregistré !');
}

/**
 * Annule l'édition
 */
function annulerEditionEnsemble() {
    const zoneEdition = document.getElementById('editionEnsembleObjectifs');
    const messageAccueil = document.getElementById('messageAccueilObjectifs');

    if (zoneEdition) zoneEdition.classList.add('hidden');
    if (messageAccueil) messageAccueil.classList.remove('hidden');
}

// ============================================================================
// SUPPRESSION
// ============================================================================

/**
 * Supprime un ensemble d'objectifs
 * @param {string} ensembleId - ID de l'ensemble à supprimer
 */
function supprimerEnsembleObjectifs(ensembleId) {
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble) return;

    if (!confirm(`Supprimer l'ensemble "${ensemble.nom}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Retirer l'ensemble
    const nouveauxEnsembles = ensembles.filter(e => e.id !== ensembleId);
    sauvegarderEnsemblesObjectifs(nouveauxEnsembles);

    // Masquer l'éditeur
    annulerEditionEnsemble();

    alert('Ensemble supprimé avec succès.');
}

/**
 * Duplique un ensemble d'objectifs
 * @param {string} ensembleId - ID de l'ensemble à dupliquer
 */
function dupliquerEnsembleObjectifs(ensembleId) {
    const ensembles = chargerEnsemblesObjectifs();
    const ensembleOriginal = ensembles.find(e => e.id === ensembleId);

    if (!ensembleOriginal) {
        console.error('Ensemble introuvable:', ensembleId);
        return;
    }

    // Créer une copie profonde
    const copie = JSON.parse(JSON.stringify(ensembleOriginal));

    // Générer un nouvel ID unique
    copie.id = genererIdUnique('objectifs_');

    // Modifier le nom pour indiquer que c'est une copie
    copie.nom = ensembleOriginal.nom + ' - Copie';

    // Ajouter la date de création
    copie.dateCreation = new Date().toISOString();
    copie.dateModification = new Date().toISOString();

    // Ajouter le nouvel ensemble
    ensembles.push(copie);
    sauvegarderEnsemblesObjectifs(ensembles);

    // Rafraîchir la liste et afficher le nouvel ensemble
    afficherListeEnsemblesObjectifs();
    mettreAJourStatsObjectifs();
    afficherEnsembleObjectifs(copie.id);

    alert('✅ Ensemble dupliqué avec succès !\n\nTu peux maintenant modifier la copie.');
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

/**
 * Exporte un ensemble d'objectifs
 * @param {string} ensembleId - ID de l'ensemble à exporter
 */
async function exporterEnsembleObjectifs(ensembleId) {
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble) return;

    // NOUVEAU (Beta 92): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Ensemble d\'objectifs',
        ensemble.nom
    );

    if (!metaEnrichies) {
        return;
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        ensemble,
        'ensemble-objectifs',
        ensemble.nom,
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (accents préservés, horodaté)
    const nomFichier = genererNomFichierExport('objectifs', {
        nom: ensemble.nom,
        inclureLicence: true,
        precisionDate: 'minute'
    });

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes('Ensemble d\'objectifs exporté avec succès');
}

/**
 * Exporte tous les ensembles
 */
function exporterTousObjectifs() {
    const ensembles = chargerEnsemblesObjectifs();

    if (ensembles.length === 0) {
        alert('Aucun ensemble à exporter.');
        return;
    }

    // Ajouter les métadonnées CC
    const exportAvecCC = ajouterMetadonnéesCC(ensembles, 'ensembles-objectifs', `Tous les ensembles (${ensembles.length})`);

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tous-objectifs-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// CONFIGURATION PRATIQUE MULTI-OBJECTIFS
// ============================================================================

// #436 G2-b (9 août 2026) — ÎLOT « multi-objectifs » RETIRÉ.
// activerPratiqueMultiObjectifs / desactiverPratiqueMultiObjectifs /
// verifierPratiqueMultiObjectifs étaient exposées sur `window` mais n'avaient
// AUCUN appelant : ni `data-action` dans index.html, ni appel JS (grep sur tout
// le dépôt). Elles étaient les dernières consommatrices du champ d'instantané
// qui désignait l'ensemble d'objectifs actif.
// Même famille que ce que #435 a retiré le même jour : la note « par objectifs »
// reposait sur un lien production→objectif qui n'a jamais existé.


// ============================================================================
// WRAPPERS POUR DELEGATION
// ============================================================================

/**
 * Wrapper multi-statement pour data-on-input sur les champs poids
 */
function calculerTotalEtMarquerHandler() {
    calculerTotalPoidsEnsemble();
    marquerEnsembleModifie();
}

// ============================================================================
// EXPORTS
// ============================================================================

window.initialiserModuleObjectifs = initialiserModuleObjectifs;
window.calculerTotalEtMarquerHandler = calculerTotalEtMarquerHandler;
window.creerNouvelEnsembleObjectifs = creerNouvelEnsembleObjectifs;
window.afficherEnsembleObjectifs = afficherEnsembleObjectifs;
window.ajouterObjectifEnsemble = ajouterObjectifEnsemble;
window.retirerObjectifEnsemble = retirerObjectifEnsemble;
window.calculerTotalPoidsEnsemble = calculerTotalPoidsEnsemble;
window.marquerEnsembleModifie = marquerEnsembleModifie;
window.sauvegarderEnsembleObjectifs = sauvegarderEnsembleObjectifs;
window.annulerEditionEnsemble = annulerEditionEnsemble;
window.supprimerEnsembleObjectifs = supprimerEnsembleObjectifs;
window.dupliquerEnsembleObjectifs = dupliquerEnsembleObjectifs;
window.exporterEnsembleObjectifs = exporterEnsembleObjectifs;
window.exporterTousObjectifs = exporterTousObjectifs;
window.chargerEnsemblesObjectifs = chargerEnsemblesObjectifs;

// Nouvelles fonctions pour pratique multi-objectifs



})();
