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
        if (pratiqueId === 'pan-maitrise' || pratiqueId === 'sommative') {
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
     * Sauvegarde une nouvelle pratique configurable
     * @param {object} pratique - Objet { id, nom, auteur, description, config }
     */
    async sauvegarderPratique(pratique) {
        const pratiques = db.getSync('pratiquesConfigurables', []);

        // Vérifier unicité de l'ID
        if (pratiques.some(p => p.id === pratique.id)) {
            throw new Error(`Une pratique avec l'ID ${pratique.id} existe déjà`);
        }

        // Valider la pratique
        new PratiqueConfigurable(pratique.config); // Lance une erreur si invalide

        pratiques.push(pratique);
        db.setSync('pratiquesConfigurables', pratiques);

        console.log(`[PratiqueManager] ✅ Pratique sauvegardée : ${pratique.id}`);
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
