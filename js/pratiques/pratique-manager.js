/**
 * PRATIQUE MANAGER - Gestionnaire des pratiques configurables
 *
 * Gère le chargement, la sauvegarde et le changement de pratiques
 * d'évaluation configurables (JSON).
 *
 * ÉCRITURES pratiquesConfigurables : migration (ajout flags), création, suppression
 *
 * S'intègre avec pratique-registre.js existant pour supporter
 * à la fois les pratiques codées en dur (PAN-Standards, Sommative)
 * et les pratiques configurables JSON.
 *
 * VERSION : 1.0
 * DATE : 25 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

// ============================================================================
// GESTIONNAIRE PRINCIPAL
// ============================================================================

const PratiqueManager = {
    pratiqueActive: null,

    /**
     * Charge la pratique active depuis modalitesEvaluation
     * Compatible avec l'architecture existante
     */
    async chargerPratiqueActive() {
        // #328 L2-b2 : id dérivé de la SSOT groupesCours[].pratiqueId — le
        // miroir modalitesEvaluation.pratique n'existe plus.
        const pratiqueId = (typeof window.obtenirPratiqueActiveGroupeCours === 'function')
            ? window.obtenirPratiqueActiveGroupeCours()
            : null; // Ex: 'pan-standards-bruno'

        if (!pratiqueId) {
            console.warn('[PratiqueManager] Aucune pratique configurée');
            return null;
        }

        // Vérifier si c'est une pratique codée en dur ou configurable.
        // Session A volet B : normalisation à la lecture — le SSOT peut être legacy
        // (pan-standards…) OU canonique (standards…). Les ids configurables (p. ex.
        // pan-standards-bedard) ne figurent pas dans la table → restent inchangés et
        // tombent dans la branche configurable JSON, comportement préservé.
        const idCanonique = (typeof normaliserIdPratique === 'function')
            ? normaliserIdPratique(pratiqueId)
            : pratiqueId;
        if (idCanonique === 'standards' || idCanonique === 'sommative' || idCanonique === 'specifications') {
            // Pratique codée en dur existante, utiliser pratique-registre.js
            return window.obtenirPratiqueActive();
        }

        // Pratique configurable JSON
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (!pratiqueData) {
            console.error(`[PratiqueManager] Pratique introuvable : ${pratiqueId}`);
            return null;
        }

        this.pratiqueActive = new PratiqueConfigurable(pratiqueData.config);
        return this.pratiqueActive;
    },

    /**
     * Change la pratique active du groupe-cours actif.
     * #328 L2-b2 : écrit la SSOT `groupesCours[].pratiqueId` (décision #303 —
     * la pratique active est par GROUPE-COURS) ; le miroir
     * modalitesEvaluation.pratique n'est plus écrit.
     * @param {string} pratiqueId - ID de la pratique à activer
     */
    async changerPratiqueActive(pratiqueId) {
        const gcActif = db.getSync('groupeCoursActif', null);
        if (!gcActif || !gcActif.id) {
            throw new Error('Aucun groupe-cours actif : assemble d\'abord un groupe-cours (Cadre → Groupes-cours) avant d\'activer une pratique.');
        }

        const groupesCours = db.getSync(cle('groupesCours'), []);
        const index = Array.isArray(groupesCours)
            ? groupesCours.findIndex(g => g && g.id === gcActif.id)
            : -1;
        if (index === -1) {
            throw new Error('Groupe-cours actif introuvable dans la liste des groupes-cours du trimestre.');
        }

        groupesCours[index].pratiqueId = pratiqueId;
        db.setSync(cle('groupesCours'), groupesCours);

        // Synchroniser la copie du pointeur (jamais prioritaire sur la SSOT,
        // mais on ne la laisse pas contredire ce qui vient d'être activé).
        gcActif.pratiqueId = pratiqueId;
        db.setSync('groupeCoursActif', gcActif);

        // Invalider le cache de pratique-registre.js
        if (window.invaliderCachePratique) {
            window.invaliderCachePratique();
        }

        // Recharger la pratique
        await this.chargerPratiqueActive();

    },

    /**
     * Liste toutes les pratiques (codées + configurables)
     * @returns {object} { codees: [...], configurables: [...] }
     */
    async listerPratiques() {
        const pratiquesCodees = window.listerPratiquesDisponibles(); // De pratique-registre.js
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

        return {
            codees: pratiquesCodees,
            configurables: pratiquesConfigurables
        };
    },

    /**
     * Migration : Ajoute le flag dansBibliotheque à toutes les pratiques configurables
     * Appelée automatiquement au chargement de pratiques.js
     *
     * ✅ MODIFICATION (9 décembre 2025) :
     * - Pratiques PRÉDÉFINIES → dansBibliotheque = false (disponibles dans modal)
     * - Pratiques CRÉÉES PAR UTILISATEUR → dansBibliotheque = true (visibles dans sidebar)
     */
    migrerVersBibliotheque() {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

        // Vérifier si migration v2 déjà effectuée
        const migrationV2Effectuee = db.getSync('migrationBibliothequeV2', false);

        if (migrationV2Effectuee) {
            // Migration v2 déjà faite, juste gérer les nouvelles pratiques sans flag
            let nbMigrees = 0;
            pratiques.forEach(p => {
                if (p.dansBibliotheque === undefined) {
                    p.dansBibliotheque = false; // Par défaut false (seront ajoutées manuellement)
                    nbMigrees++;
                }
            });

            if (nbMigrees > 0) {
                db.setSync(cle('pratiquesConfigurables'), pratiques);
            }
            return;
        }

        // MIGRATION V2 : Corriger les pratiques prédéfinies existantes
        let nbCorrigees = 0;
        let nbPredefinesRetirees = 0;
        let nbUtilisateurGardees = 0;

        // Obtenir la liste des IDs de pratiques prédéfinies
        const idsPredefinis = window.PRATIQUES_PREDEFINES
            ? Object.keys(window.PRATIQUES_PREDEFINES)
            : [];

        pratiques.forEach(p => {
            // Traiter toutes les pratiques, même celles qui ont déjà un flag
            const estPredefinie = idsPredefinis.includes(p.id);

            if (estPredefinie && p.dansBibliotheque !== false) {
                // Pratique prédéfinie incorrectement marquée comme dans la bibliothèque
                p.dansBibliotheque = false;
                nbPredefinesRetirees++;
                nbCorrigees++;
            } else if (!estPredefinie && p.dansBibliotheque === undefined) {
                // Pratique créée par utilisateur sans flag → garder dans sidebar
                p.dansBibliotheque = true;
                nbUtilisateurGardees++;
                nbCorrigees++;
            }
        });

        if (nbCorrigees > 0) {
            db.setSync(cle('pratiquesConfigurables'), pratiques);
            db.setSync('migrationBibliothequeV2', true); // Marquer migration comme effectuée
            if (nbPredefinesRetirees > 0) {
            }
            if (nbUtilisateurGardees > 0) {
            }
        } else {
            // Aucune correction nécessaire, mais marquer migration comme effectuée
            db.setSync('migrationBibliothequeV2', true);
        }
    },

    /**
     * Sauvegarde une nouvelle pratique configurable
     * @param {object} pratique - Objet { id, nom, auteur, description, config, dansBibliotheque }
     */
    async sauvegarderPratique(pratique) {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

        // Vérifier unicité de l'ID
        if (pratiques.some(p => p.id === pratique.id)) {
            throw new Error(`Une pratique avec l'ID ${pratique.id} existe déjà`);
        }

        // Valider la pratique
        new PratiqueConfigurable(pratique.config); // Lance une erreur si invalide

        // Si dansBibliotheque n'est pas défini, définir à false pour les pratiques prédéfinies
        if (pratique.dansBibliotheque === undefined) {
            pratique.dansBibliotheque = false;
        }

        pratiques.push(pratique);
        db.setSync(cle('pratiquesConfigurables'), pratiques);

    },

    /**
     * Supprime une pratique configurable
     * @param {string} pratiqueId - ID de la pratique à supprimer
     */
    async supprimerPratique(pratiqueId) {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        const index = pratiques.findIndex(p => p.id === pratiqueId);

        if (index === -1) {
            throw new Error(`Pratique introuvable : ${pratiqueId}`);
        }

        // Vérifier que ce n'est pas la pratique active (#328 L2-b2 : SSOT)
        const pratiqueActiveId = (typeof window.obtenirPratiqueActiveGroupeCours === 'function')
            ? window.obtenirPratiqueActiveGroupeCours()
            : null;
        if (pratiqueActiveId === pratiqueId) {
            throw new Error('Impossible de supprimer la pratique active');
        }

        pratiques.splice(index, 1);
        db.setSync(cle('pratiquesConfigurables'), pratiques);

    },

    /**
     * Importe une pratique depuis un fichier JSON
     * @param {object} pratiqueJSON - Objet JSON de la pratique
     */
    async importerPratique(pratiqueJSON) {
        // Valider la structure
        if (!pratiqueJSON.id || !pratiqueJSON.config) {
            throw new Error('Structure JSON invalide (id et config requis)');
        }

        // Valider la configuration
        new PratiqueConfigurable(pratiqueJSON.config);

        // Sauvegarder
        await this.sauvegarderPratique(pratiqueJSON);

    },

    /**
     * Exporte une pratique en JSON
     * @param {string} pratiqueId - ID de la pratique à exporter
     * @returns {object} Objet JSON de la pratique
     */
    async exporterPratique(pratiqueId) {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);
        const pratique = pratiques.find(p => p.id === pratiqueId);

        if (!pratique) {
            throw new Error(`Pratique introuvable : ${pratiqueId}`);
        }

        return pratique;
    },

    /**
     * Initialise les pratiques prédéfinies
     * À appeler lors du premier lancement
     */
    async initialiserPratiquesPredefines() {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

        if (pratiques.length > 0) {
            return;
        }


        // Charger les pratiques prédéfinies
        if (window.PRATIQUES_PREDEFINES) {
            const predefines = window.PRATIQUES_PREDEFINES;

            for (const [key, config] of Object.entries(predefines)) {
                const pratique = {
                    id: config.id,
                    nom: config.nom,
                    auteur: config.auteur,
                    etablissement: config.etablissement,
                    description: config.description,
                    config: config
                };

                try {
                    await this.sauvegarderPratique(pratique);
                } catch (error) {
                    console.error(`   ❌ Erreur sauvegarde ${pratique.nom}:`, error);
                }
            }

        } else {
            console.warn('[PratiqueManager] ⚠️ PRATIQUES_PREDEFINES non chargé');
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

window.PratiqueManager = PratiqueManager;



})();
