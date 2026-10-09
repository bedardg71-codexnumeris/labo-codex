/* ===============================
   IMPORT / EXPORT DES PRODUCTIONS PÉDAGOGIQUES
   ✅ EXTRACTION (16 mai 2026, refactor étape 3)

   Sous-module extrait de productions.js (lignes 2630-3276).
   Périmètre : export/import JSON avec licence CC + assistant migration catégories.

   Dépendances (toutes via globales/window) :
   - getCleProductions (exposé par productions.js)
   - afficherFormProduction, afficherListeProductions, afficherTableauProductions,
     afficherBibliothequeProductions (productions.js)
   - getTypeLabel (productions.js)
   - CLE_BIBLIOTHEQUE_PRODUCTIONS (productions-bibliotheque.js)
   - Helpers globaux : db, echapperHtml, genererNomFichierExport,
     demanderMetadonneesEnrichies, ajouterMetadonnéesCC, verifierLicenceCC,
     genererBadgeCC, avertirSansLicence, ApercuSandbox, filtrerRessourcesNonDemo,
     window.notifications (utils-notifications.js)
   =============================== */

(function() {
'use strict';

async function exporterProductions() {
    const toutesProductions = await db.get(getCleProductions()) || [];

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const productions = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesProductions, 'production')
        : toutesProductions.filter(p => !p.estDemo && !p.auteurOriginal);
    const nbExclues = toutesProductions.length - productions.length;

    if (productions.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune production personnelle à exporter.\n\n${nbExclues} production(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune production à exporter.');
        }
        return;
    }

    // Informer si des productions ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Productions pédagogiques',
        `${productions.length} production(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { productions: productions },
        'productions',
        'Productions pédagogiques',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('productions', { inclureLicence: true, precisionDate: 'minute' });

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes(`${productions.length} production(s) exportée(s) avec succès`);
}

/**
 * Exporte la production actuellement en cours d'édition
 */
async function exporterProductionActive() {
    // Récupérer l'ID de la production depuis le sidebar actif
    const itemActif = document.querySelector('.sidebar-item.active');
    if (!itemActif) {
        alert('Aucune production sélectionnée à exporter.');
        return;
    }

    const productionId = itemActif.getAttribute('data-id');
    if (!productionId) {
        alert('Impossible de déterminer la production à exporter.');
        return;
    }

    const productions = await db.get(getCleProductions()) || [];
    const production = productions.find(p => p.id === productionId);

    if (!production) {
        alert('Production introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Production pédagogique',
        production.activiteApprentissage || production.description || production.titre || 'Production'
    );

    if (!metaEnrichies) {
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...production };

    // Si la production a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (production.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Tu vas exporter un matériel créé par ' + production.metadata_cc.auteur_original + '.\n\n' +
            'Entre ton nom pour être crédité comme contributeur :\n' +
            '(Laisse vide si tu n\'as fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = production.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...production.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(
        contenuExport,
        'production',
        production.activiteApprentissage || production.description || production.titre || 'Production',
        metaEnrichies
    );

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 🆕 Beta 95.3 : Nommage standardisé
    const nomExport = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('production', { nom: production.activiteApprentissage || production.description || production.titre, discipline: production.discipline, inclureLicence: true })
        : `production-${(production.activiteApprentissage || production.description || production.titre || 'production').replace(/[^a-z0-9]/gi, '-')}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.download = nomExport;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes(`Production "${production.activiteApprentissage || production.description || production.titre}" exportée avec succès`);
}

/**
 * Importe des productions depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec productions existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event|HTMLElement} eventOuEl - Événement de changement ou élément input (delegation)
 */
function importerProductions(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-productions` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            // z-index: 10001 pour passer au-dessus des modaux de bibliothèque (10000)
            const modal = document.createElement('div');
            modal.classList.add('modal-import-productions');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px; padding: 20px;">
                        <div data-apercu-cc-slot style="margin-bottom: 15px;"></div>
                        <p><strong>Veux-tu importer ces productions ?</strong></p>
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportProductions">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportProductions">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            // Stocker les données pour éviter problèmes de sérialisation
            window._productionsImportEnAttente = donnees;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox) {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    target.value = '';
}

/**
 * Confirme l'import et fusionne les productions
 * Fonction helper appelée depuis le modal de confirmation
 * PHASE 3.3: Détection de dépendances manquantes (Beta 91)
 */
window.confirmerImportProductions = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let productionsImportees;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            if (donnees.contenu.productions) {
                // Batch export: { metadata, contenu: { productions: [...] } }
                productionsImportees = donnees.contenu.productions;
            } else {
                // Individual export: { metadata, contenu: { ...production... } }
                // Préserver metadata_cc dans la production
                const production = { ...donnees.contenu };
                production.metadata_cc = donnees.metadata;
                productionsImportees = [production];
            }
        } else {
            // Ancien format direct
            productionsImportees = donnees.productions || [donnees];
        }

        if (!Array.isArray(productionsImportees)) {
            throw new Error('Format invalide: productions doit être un tableau');
        }
        // #467 — un nom reçu n'entre pas brut dans la Bibliothèque (import-export.js).
        productionsImportees = productionsImportees.map(p => window.assainirImportJson(p, 'production'));

        // PHASE 3.3: Détecter les dépendances manquantes (grilles référencées)
        const grillesExistantes = await db.get(cle('grillesTemplates')) || [];
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        const grillesManquantes = [];

        productionsImportees.forEach(prod => {
            if (prod.grilleId && !idsGrillesExistants.has(prod.grilleId)) {
                // Grille manquante détectée
                if (!grillesManquantes.includes(prod.grilleId)) {
                    grillesManquantes.push(prod.grilleId);
                }
            }
        });

        // Avertir l'utilisateur si des dépendances manquent
        if (grillesManquantes.length > 0) {
            const nbGrillesManquantes = grillesManquantes.length;
            const message = `Attention : ${nbGrillesManquantes} grille(s) de critères manquante(s)\n\n` +
                `Les productions importées font référence à des grilles qui n'existent pas encore dans ton système.\n\n` +
                `Grilles manquantes :\n${grillesManquantes.map(id => `  • ${id}`).join('\n')}\n\n` +
                `Tu peux continuer l'import, mais ces productions ne fonctionneront correctement qu'après avoir importé les grilles manquantes.\n\n` +
                `Continuer quand même ?`;

            if (!confirm(message)) {
                return;
            }

        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeProductions
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_PRODUCTIONS || 'bibliothequeProductions';
        // #599 — la fusion passe par la file : la Bibliothèque est
        // relue à l'instant de l'écriture. Hors file, un import et un ajout
        // concurrents s'écrasaient l'un l'autre.
        let nbAjoutees = 0;
        let nbMisesAJour = 0;

        const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE, (lues) => {
            const bibliotheque = lues || [];
            nbAjoutees = 0;
            nbMisesAJour = 0;

            // Fusionner dans la Bibliothèque uniquement
            productionsImportees.forEach(prod => {
                const indexBiblio = bibliotheque.findIndex(p => p.id === prod.id);
                if (indexBiblio >= 0) {
                    bibliotheque[indexBiblio] = { ...prod, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                    nbMisesAJour++;
                } else {
                    bibliotheque.push({ ...prod, dateAjoutBiblio: new Date().toISOString() });
                    nbAjoutees++;
                }
            });

            return bibliotheque;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE);   // lot F : geste hors témoin (confirmerImportProductions)

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeProductions')) {
            if (typeof afficherBibliothequeProductions === 'function') {
                await afficherBibliothequeProductions();
            }
        }

        const details = [];
        if (nbAjoutees > 0) details.push(`${nbAjoutees} nouvelle(s) production(s) ajoutée(s).`);
        if (nbMisesAJour > 0) details.push(`${nbMisesAJour} production(s) mise(s) à jour.`);
        details.push('Consulte « Productions disponibles » pour les ajouter à ta barre latérale.');
        notifications.succes('Import réussi', details.join(' '));

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   🆕 ASSISTANT DE MIGRATION CATÉGORIES (Beta 95.4)

   Détecte les productions sans catégorie et propose
   une assignation rapide (Sélection ou Obligatoire)
   =============================== */

/**
 * Vérifie si des productions nécessitent une migration de catégorie
 * et affiche un assistant si nécessaire
 *
 * @returns {boolean} - true si des productions sans catégorie existent
 */
async function verifierMigrationCategories() {
    const productions = await db.get(getCleProductions()) || [];

    // Filtrer les productions sans catégorie (exclure portfolio conteneur et formatifs)
    const sansCategorie = productions.filter(p =>
        !p.categorie &&
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    if (sansCategorie.length === 0) {
        return false;
    }

    return true;
}

/**
 * Affiche l'assistant de migration des catégories
 * Permet d'assigner rapidement des catégories aux productions existantes
 */
async function afficherAssistantMigrationCategories() {
    const productions = await db.get(getCleProductions()) || [];

    // Filtrer les productions sans catégorie
    const sansCategorie = productions.filter(p =>
        !p.categorie &&
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    if (sansCategorie.length === 0) {
        notifications.info('Toutes les productions ont déjà une catégorie assignée.');
        return;
    }

    // Générer le contenu du modal
    const lignesHTML = sansCategorie.map((prod, index) => `
        <tr>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                ${echapperHtml(prod.titre || 'Sans titre')}
                ${(prod.activiteApprentissage || prod.description) ? `<br><small style="color: var(--gris-moyen);">${echapperHtml(prod.activiteApprentissage || prod.description)}</small>` : ''}
            </td>
            <td style="text-align: center;">${getTypeLabel(prod.type)}</td>
            <td style="text-align: center;">
                <select id="migration-cat-${prod.id}" class="controle-form" style="min-width: 150px;">
                    <option value="">-- Non définie --</option>
                    <option value="selection">Sélection</option>
                    <option value="obligatoire">Obligatoire</option>
                </select>
            </td>
        </tr>
    `).join('');

    const modalHTML = `
        <div id="modal-migration-categories" class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999;">
            <div class="modal-contenu" style="background: var(--surface-conteneur, #162c36); border-radius: var(--radius-grand); max-width: 700px; width: 95%; max-height: 80vh; overflow: auto; padding: 24px;">
                <h3 style="margin-top: 0; color: var(--accent-primaire);">🔄 Migration des catégories</h3>
                <p style="color: var(--gris-fonce); margin-bottom: 20px;">
                    <strong>${sansCategorie.length}</strong> production(s) n'ont pas encore de catégorie assignée.
                    Assignez-leur une catégorie pour activer le calcul Sélection/Obligatoires.
                </p>

                <div style="margin-bottom: 20px; padding: 12px; background: var(--bleu-tres-pale); border-radius: var(--radius-moyen);">
                    <strong>Actions rapides :</strong>
                    <button type="button" data-action="assignerToutesMigration" data-param="selection" class="btn-secondaire" style="margin-left: 10px;">
                        Tout en Sélection
                    </button>
                    <button type="button" data-action="assignerToutesMigration" data-param="obligatoire" class="btn-secondaire" style="margin-left: 8px;">
                        Tout en Obligatoire
                    </button>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--gris-tres-clair); border-bottom: 2px solid var(--gris-clair);">
                            <th style="padding: 10px; text-align: left;">Production</th>
                            <th style="padding: 10px; text-align: center;">Type</th>
                            <th style="padding: 10px; text-align: center;">Catégorie</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lignesHTML}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gris-clair);">
                    <button type="button" data-action="fermerModalMigration" class="btn btn-annuler">Annuler</button>
                    <button type="button" data-action="sauvegarderMigrationCategories" class="btn btn-confirmer">
                        💾 Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Assigne une catégorie à toutes les productions dans le modal de migration
 * @param {string} categorie - 'selection' ou 'obligatoire'
 */
function assignerToutesMigration(categorie) {
    const selects = document.querySelectorAll('[id^="migration-cat-"]');
    selects.forEach(select => {
        select.value = categorie;
    });
}

/**
 * Ferme le modal de migration
 */
function fermerModalMigration() {
    const modal = document.getElementById('modal-migration-categories');
    if (modal) {
        modal.remove();
    }
}

/**
 * Sauvegarde les catégories assignées via l'assistant de migration
 */
async function sauvegarderMigrationCategories() {
    let nbMises = 0;

    // Parcourir les selects du modal
    const selects = document.querySelectorAll('[id^="migration-cat-"]');

    await db.modifier(getCleProductions(), (lues) => {
        const productions = lues || [];
        nbMises = 0;

        selects.forEach(select => {
            const prodId = select.id.replace('migration-cat-', '');
            const categorie = select.value;

            if (categorie) {
                const prod = productions.find(p => p.id === prodId);
                if (prod) {
                    prod.categorie = categorie;
                    nbMises++;
                }
            }
        });

        // Aucune catégorie assignée : le mutateur rend `undefined`, rien n'est écrit.
        if (nbMises === 0) return undefined;
        return productions;
    }, []);

    if (nbMises > 0) {

        // Notification
        notifications.succes(`${nbMises} catégorie(s) assignée(s)`, 'Les productions ont été mises à jour.');

        // Rafraîchir l'affichage si visible
        if (typeof afficherTableauProductions === 'function') {
            afficherTableauProductions();
        }
    }

    fermerModalMigration();
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Fermer le modal d'import productions (bouton Annuler) */
function fermerModalImportProductions() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-productions');
    if (wrapper) wrapper.remove();
    delete window._productionsImportEnAttente;
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportProductions() {
    window.confirmerImportProductions(window._productionsImportEnAttente);
    fermerModalImportProductions();
}

/** Ouvrir le file picker import */
function ouvrirFilePickerImportProductions() {
    var input = document.getElementById('fichier-import-productions-modal');
    if (input) input.click();
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.exporterProductions = exporterProductions;
window.exporterProductionActive = exporterProductionActive;
window.importerProductions = importerProductions;
// window.confirmerImportProductions est assigné inline ci-dessus (préservation comportementale)
window.verifierMigrationCategories = verifierMigrationCategories;
window.afficherAssistantMigrationCategories = afficherAssistantMigrationCategories;
window.assignerToutesMigration = assignerToutesMigration;
window.fermerModalMigration = fermerModalMigration;
window.sauvegarderMigrationCategories = sauvegarderMigrationCategories;
window.fermerModalImportProductions = fermerModalImportProductions;
window.confirmerEtFermerImportProductions = confirmerEtFermerImportProductions;
window.ouvrirFilePickerImportProductions = ouvrirFilePickerImportProductions;

})();
