/**
 * PRATIQUE MANAGER - Gestionnaire des pratiques configurables
 *
 * Gère le chargement, la sauvegarde et le changement de pratiques
 * d'évaluation configurables (JSON).
 *
 * S'intègre avec pratique-registre.js existant pour supporter
 * à la fois les pratiques codées en dur (PAN-Maîtrise, Sommative)
 * et les pratiques configurables JSON.
 *
 * VERSION : 1.0
 * DATE : 25 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

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
        const modalites = db.getSync('modalitesEvaluation', {});
        const pratiqueId = modalites.pratique; // Ex: 'pan-standards-bruno'

        if (!pratiqueId) {
            console.warn('[PratiqueManager] Aucune pratique configurée');
            return null;
        }

        // Vérifier si c'est une pratique codée en dur ou configurable
        if (pratiqueId === 'pan-maitrise' || pratiqueId === 'sommative' || pratiqueId === 'specifications') {
            // Pratique codée en dur existante, utiliser pratique-registre.js
            console.log(`[PratiqueManager] Pratique codée : ${pratiqueId}`);
            return window.obtenirPratiqueActive();
        }

        // Pratique configurable JSON
        const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (!pratiqueData) {
            console.error(`[PratiqueManager] Pratique introuvable : ${pratiqueId}`);
            console.log('[PratiqueManager] Pratiques disponibles:', pratiquesConfigurables.map(p => p.id));
            return null;
        }

        console.log(`[PratiqueManager] Chargement pratique configurable : ${pratiqueId}`);
        this.pratiqueActive = new PratiqueConfigurable(pratiqueData.config);
        return this.pratiqueActive;
    },

    /**
     * Change la pratique active (met à jour modalitesEvaluation.pratique)
     * @param {string} pratiqueId - ID de la pratique à activer
     */
    async changerPratiqueActive(pratiqueId) {
        const modalites = db.getSync('modalitesEvaluation', {});
        modalites.pratique = pratiqueId;
        modalites.dateConfiguration = new Date().toISOString();

        db.setSync('modalitesEvaluation', modalites);

        // Invalider le cache de pratique-registre.js
        if (window.invaliderCachePratique) {
            window.invaliderCachePratique();
        }

        // Recharger la pratique
        await this.chargerPratiqueActive();

        console.log(`[PratiqueManager] ✅ Pratique changée : ${pratiqueId}`);
    },

    /**
     * Liste toutes les pratiques (codées + configurables)
     * @returns {object} { codees: [...], configurables: [...] }
     */
    async listerPratiques() {
        const pratiquesCodees = window.listerPratiquesDisponibles(); // De pratique-registre.js
        const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);

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
        const pratiques = db.getSync('pratiquesConfigurables', []);

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
                db.setSync('pratiquesConfigurables', pratiques);
                console.log(`[PratiqueManager] ✅ ${nbMigrees} nouvelle(s) pratique(s) ajoutée(s)`);
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
            db.setSync('pratiquesConfigurables', pratiques);
            db.setSync('migrationBibliothequeV2', true); // Marquer migration comme effectuée
            console.log(`[PratiqueManager] ✅ Migration bibliothèque V2: ${nbCorrigees} pratique(s) corrigée(s)`);
            if (nbPredefinesRetirees > 0) {
                console.log(`[PratiqueManager]    → ${nbPredefinesRetirees} prédéfinie(s) retirée(s) de la sidebar`);
            }
            if (nbUtilisateurGardees > 0) {
                console.log(`[PratiqueManager]    → ${nbUtilisateurGardees} créée(s) par utilisateur gardée(s) dans sidebar`);
            }
        } else {
            // Aucune correction nécessaire, mais marquer migration comme effectuée
            db.setSync('migrationBibliothequeV2', true);
            console.log(`[PratiqueManager] ✅ Migration bibliothèque V2: Aucune correction nécessaire`);
        }
    },

    /**
     * Sauvegarde une nouvelle pratique configurable
     * @param {object} pratique - Objet { id, nom, auteur, description, config, dansBibliotheque }
     */
    async sauvegarderPratique(pratique) {
        const pratiques = db.getSync('pratiquesConfigurables', []);

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
        db.setSync('pratiquesConfigurables', pratiques);

        console.log(`[PratiqueManager] ✅ Pratique sauvegardée : ${pratique.id} (dansBibliotheque: ${pratique.dansBibliotheque})`);
    },

    /**
     * Supprime une pratique configurable
     * @param {string} pratiqueId - ID de la pratique à supprimer
     */
    async supprimerPratique(pratiqueId) {
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const index = pratiques.findIndex(p => p.id === pratiqueId);

        if (index === -1) {
            throw new Error(`Pratique introuvable : ${pratiqueId}`);
        }

        // Vérifier que ce n'est pas la pratique active
        const modalites = db.getSync('modalitesEvaluation', {});
        if (modalites.pratique === pratiqueId) {
            throw new Error('Impossible de supprimer la pratique active');
        }

        pratiques.splice(index, 1);
        db.setSync('pratiquesConfigurables', pratiques);

        console.log(`[PratiqueManager] ✅ Pratique supprimée : ${pratiqueId}`);
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

        console.log(`[PratiqueManager] ✅ Pratique importée : ${pratiqueJSON.id}`);
    },

    /**
     * Exporte une pratique en JSON
     * @param {string} pratiqueId - ID de la pratique à exporter
     * @returns {object} Objet JSON de la pratique
     */
    async exporterPratique(pratiqueId) {
        const pratiques = db.getSync('pratiquesConfigurables', []);
        const pratique = pratiques.find(p => p.id === pratiqueId);

        if (!pratique) {
            throw new Error(`Pratique introuvable : ${pratiqueId}`);
        }

        console.log(`[PratiqueManager] ✅ Pratique exportée : ${pratiqueId}`);
        return pratique;
    },

    /**
     * Initialise les pratiques prédéfinies
     * À appeler lors du premier lancement
     */
    async initialiserPratiquesPredefines() {
        const pratiques = db.getSync('pratiquesConfigurables', []);

        if (pratiques.length > 0) {
            console.log('[PratiqueManager] Pratiques déjà initialisées');
            return;
        }

        console.log('[PratiqueManager] Initialisation des pratiques prédéfinies...');

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
                    console.log(`   ✅ ${pratique.nom}`);
                } catch (error) {
                    console.error(`   ❌ Erreur sauvegarde ${pratique.nom}:`, error);
                }
            }

            console.log('[PratiqueManager] ✅ Pratiques prédéfinies initialisées');
        } else {
            console.warn('[PratiqueManager] ⚠️ PRATIQUES_PREDEFINES non chargé');
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

window.PratiqueManager = PratiqueManager;

console.log('✅ Module pratique-manager.js chargé');
