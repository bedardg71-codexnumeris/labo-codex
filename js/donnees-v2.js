/**
 * donnees-v2.js
 * Module de gestion de l'onglet Données (Beta 96)
 *
 * ÉCRITURES pratiquesConfigurables : suppression (nettoyage via calculerUsagesPratiques)
 *
 * Gère l'affichage et l'initialisation de l'onglet Données :
 * - Statistiques des snapshots
 * - Gestion des ressources (pratiques, grilles, cartouches)
 * - Suppression définitive avec vérification des dépendances
 *
 * Les fonctions d'import/export restent dans import-export.js
 * Les fonctions de snapshots restent dans snapshots.js
 */

(function() {
    'use strict';


    // =========================================================================
    // ÉTAT LOCAL
    // =========================================================================

    let ressourceASupprimer = null; // {type, id, nom, dependances, avertissements}

    // =========================================================================
    // UTILITAIRES DE FUSION
    // =========================================================================

    /**
     * Fusionne deux tableaux de ressources en dédupliquant par id.
     * Priorité à la version bibliothèque si même id.
     * Ajoute un marqueur _source pour l'affichage.
     */
    function fusionnerRessources(biblio, templates) {
        const parId = new Map();
        (biblio || []).forEach(r => parId.set(r.id, Object.assign({}, r, { _source: 'bibliotheque' })));
        (templates || []).forEach(r => {
            if (!parId.has(r.id)) {
                parId.set(r.id, Object.assign({}, r, { _source: 'templates' }));
            }
        });
        return Array.from(parId.values());
    }

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Données v2
     */
    function initialiserDonneesV2() {

        // Charger les statistiques des snapshots
        chargerStatistiquesSnapshots();

        // Charger les compteurs de ressources
        chargerCompteursRessources();

    }

    /**
     * Charge la vue Données (appelée par navigation.js)
     * Rafraîchit les compteurs à chaque navigation vers cette section
     */
    function chargerVueDonnees() {

        // Rafraîchir les compteurs
        chargerCompteursRessources();

        // Rafraîchir les statistiques des snapshots
        chargerStatistiquesSnapshots();

        // Carte « Partage entre collègues » (#329 P3) : liste des packages
        // importés + câblage de la zone de dépôt
        if (window.partageImport && typeof partageImport.rafraichirSection === 'function') {
            partageImport.rafraichirSection();
        }
    }

    // =========================================================================
    // STATISTIQUES SNAPSHOTS
    // =========================================================================

    /**
     * Charge les statistiques des snapshots dans les cartes métriques
     */
    async function chargerStatistiquesSnapshots() {
        // Éléments DOM
        const statHebdo = document.getElementById('v2-stat-snapshots-hebdo');
        const statInterventions = document.getElementById('v2-stat-snapshots-interventions');
        const statDerniere = document.getElementById('v2-stat-derniere-capture');

        if (!statHebdo || !statInterventions || !statDerniere) {
            return;
        }

        // ✅ CORRECTIF (2 mars 2026): Lire depuis IndexedDB (source de vérité)
        // db.getSync() lit localStorage en premier, qui peut contenir des données périmées
        const cleSnap = typeof cleSnapshots === 'function' ? cleSnapshots() : cle('snapshots');
        let snapshots;
        if (db.useIndexedDB && cleSnap) {
            try {
                snapshots = await db.get(cleSnap);
            } catch (e) { console.warn('[Donnees-V2] IndexedDB read failed, fallback getSync:', e.message || e); }
        }
        if (!snapshots) {
            snapshots = db.getSync(cleSnap, { hebdomadaires: [], interventions: [] });
        }

        const snapshotsHebdo = snapshots.hebdomadaires || [];
        const snapshotsInterventions = snapshots.interventions || [];

        // Afficher les compteurs
        statHebdo.textContent = snapshotsHebdo.length || '0';
        statInterventions.textContent = snapshotsInterventions.length || '0';

        // Trouver la dernière capture
        let derniereDate = null;

        if (snapshotsHebdo.length > 0) {
            const derniereHebdo = snapshotsHebdo[snapshotsHebdo.length - 1];
            if (derniereHebdo.dateSeance) {
                derniereDate = new Date(derniereHebdo.dateSeance);
            }
        }

        if (snapshotsInterventions.length > 0) {
            const derniereIntervention = snapshotsInterventions[snapshotsInterventions.length - 1];
            if (derniereIntervention.date) {
                const dateIntervention = new Date(derniereIntervention.date);
                if (!derniereDate || dateIntervention > derniereDate) {
                    derniereDate = dateIntervention;
                }
            }
        }

        // Formater la date
        if (derniereDate) {
            const options = { day: 'numeric', month: 'short' };
            statDerniere.textContent = derniereDate.toLocaleDateString('fr-CA', options);
        } else {
            statDerniere.textContent = '—';
        }
    }

    // =========================================================================
    // COMPTEURS DE RESSOURCES
    // =========================================================================

    /**
     * Charge les compteurs dans les options du dropdown
     */
    function chargerCompteursRessources() {
        const select = document.getElementById('select-type-ressource');
        if (!select) return;

        // Compter chaque type (fusion bibliothèque + templates pour grilles et échelles)
        const grillesBiblio = typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ? obtenirToutesLesGrillesBibliothequeSync() : [];
        const grillesTempl = db.getSync('grillesTemplates', []) || [];
        const echellesBiblio = typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ? obtenirToutesLesEchellesBibliothequeSync() : [];
        const echellesTempl = db.getSync('echellesTemplates', []) || [];

        const counts = {
            pratiques: obtenirToutesPratiquesUtilisateur().length,
            grilles: fusionnerRessources(grillesBiblio, grillesTempl).length,
            cartouches: (typeof obtenirToutesLesCartouchesBibliothequeSync === 'function' ? obtenirToutesLesCartouchesBibliothequeSync() : []).length,
            echelles: fusionnerRessources(echellesBiblio, echellesTempl).length,
            productions: (typeof obtenirToutesLesProductionsBibliothequeSync === 'function' ? obtenirToutesLesProductionsBibliothequeSync() : []).length,
            alignements: (typeof getNombreAlignementsBibliotheque === 'function' ? getNombreAlignementsBibliotheque() : 0)
        };

        // Mettre à jour les options du select
        Array.from(select.options).forEach(option => {
            if (option.value && counts[option.value] !== undefined) {
                const labels = {
                    pratiques: 'Pratiques de notation',
                    grilles: 'Grilles de critères',
                    cartouches: 'Cartouches de rétroaction',
                    echelles: 'Échelles de performance',
                    productions: 'Productions',
                    alignements: 'Alignements pédagogiques'
                };
                option.textContent = `${labels[option.value]} (${counts[option.value]})`;
            }
        });
    }

    /**
     * Affiche le tableau pour le type de ressource sélectionné
     */
    function afficherTableauRessource(type) {
        if (typeof type === 'object' && type && type.value !== undefined) type = type.value;
        const container = document.getElementById('table-ressources-container');
        if (!container) return;

        if (!type) {
            container.innerHTML = '<p class="text-muted text-center" style="padding: 30px;">Sélectionne un type de ressource ci-dessus pour afficher la liste.</p>';
            return;
        }

        // Afficher le chargement
        container.innerHTML = '<p class="text-muted text-center" style="padding: 30px;">Chargement…</p>';

        // Appeler la fonction appropriée avec un léger délai
        setTimeout(() => {
            switch(type) {
                case 'pratiques':
                    afficherTableauPratiquesV2(container);
                    break;
                case 'grilles':
                    afficherTableauGrillesV2(container);
                    break;
                case 'cartouches':
                    afficherTableauCartouchesV2(container);
                    break;
                case 'echelles':
                    afficherTableauEchellesV2(container);
                    break;
                case 'productions':
                    afficherTableauProductionsV2(container);
                    break;
                case 'alignements':
                    afficherTableauAlignementsV2(container);
                    break;
                case 'parametres':
                    afficherTableauParametresV2(container);
                    break;
                default:
                    container.innerHTML = '<p class="text-muted text-center" style="padding: 30px;">Type de ressource non reconnu.</p>';
            }
        }, 50);
    }

    // =========================================================================
    // RÉCUPÉRATION DES RESSOURCES
    // =========================================================================

    /**
     * Obtenir toutes les pratiques de l'utilisateur (source: pratiquesConfigurables)
     * C'est la même source que le modal "Pratiques dans la barre latérale"
     */
    function obtenirToutesPratiquesUtilisateur() {
        let pratiques = [];

        // Source principale : pratiquesConfigurables (même source que le modal bibliothèque)
        try {
            pratiques = db.getSync(cle('pratiquesConfigurables')) || db.getSync('pratiquesConfigurables') || [];
        } catch (e) {
            console.error('[donnees-v2] Erreur lecture pratiquesConfigurables:', e);
        }

        return pratiques;
    }

    /**
     * Obtenir la pratique active pour le trimestre courant
     */
    function obtenirPratiqueActiveId() {
        try {
            // #328 L2-b2 : id dérivé de la SSOT groupesCours[].pratiqueId —
            // les fallbacks miroirs (pratique, pratiqueActiveId,
            // configurationSTDAppliquee) n'existent plus.
            return (typeof obtenirPratiqueActiveGroupeCours === 'function')
                ? obtenirPratiqueActiveGroupeCours()
                : null;
        } catch (e) {
            return null;
        }
    }

    // =========================================================================
    // AFFICHAGE DES TABLEAUX DE RESSOURCES
    // =========================================================================

    /**
     * Affiche le tableau des pratiques de notation
     */
    function afficherTableauPratiques() {
        const container = document.getElementById('table-ressources-pratiques');
        if (!container) return;

        const pratiques = obtenirToutesPratiquesUtilisateur();

        if (pratiques.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune pratique personnalisée. Les gabarits prédéfinis sont toujours disponibles.</p>
                </div>
            `;
            return;
        }

        // Obtenir les usages
        const usages = calculerUsagesPratiques(pratiques);

        let html = `
            <table class="table-ressources">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Auteur</th>
                        <th>Statut</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pratiques.forEach(p => {
            const dansSidebar = p.dansBibliotheque !== false;
            const usage = usages[p.id] || { coursCount: 0, cours: [] };
            const badgeType = obtenirBadgeTypePratique(p.type);

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(p.nom)}</strong>
                        ${p.description ? `<br><small class="text-muted">${escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>${badgeType}</td>
                    <td>${escapeHtml(p.auteur || 'Inconnu')}</td>
                    <td>
                        ${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}
                    </td>
                    <td>
                        ${usage.coursCount > 0 ?
                            `<span class="badge-statut evalue">${usage.coursCount} cours</span>` :
                            '<span class="badge-statut non-evalue">Non utilisée</span>'}
                    </td>
                    <td class="actions-cell">
                        <button class="btn btn-compact btn-secondaire"
                                data-action="naviguerVersRessource" data-param="pratique" data-param2="${p.id}"
                                title="Consulter cette pratique">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                data-action="ouvrirModalSuppressionRessource" data-param="pratique" data-param2="${p.id}"
                                title="Supprimer définitivement">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Affiche le tableau des grilles de critères
     */
    function afficherTableauGrilles() {
        const container = document.getElementById('table-ressources-grilles');
        if (!container) return;

        const grillesBiblio = typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ?
            obtenirToutesLesGrillesBibliothequeSync() : [];
        const grillesTempl = db.getSync('grillesTemplates', []) || [];
        const grilles = fusionnerRessources(grillesBiblio, grillesTempl);

        if (grilles.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune grille de critères trouvée.</p>
                </div>
            `;
            return;
        }

        // Obtenir les usages
        const usages = calculerUsagesGrilles(grilles);

        let html = `
            <table class="table-ressources">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Discipline</th>
                        <th>Critères</th>
                        <th>Statut</th>
                        <th>Usage</th>
                        <th>Cartouches</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        grilles.forEach(g => {
            const dansSidebar = g.dansBibliotheque !== false;
            const usage = usages[g.id] || { productionsCount: 0, evaluationsCount: 0 };
            const nbCriteres = g.criteres?.length || 0;
            const nbCartouches = compterCartouchesGrille(g.id);

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(g.nom)}</strong>
                        ${g.auteur ? `<br><small class="text-muted">Par ${escapeHtml(g.auteur)}</small>` : ''}
                    </td>
                    <td>${escapeHtml(g.discipline || '—')}</td>
                    <td>${nbCriteres} critère${nbCriteres > 1 ? 's' : ''}</td>
                    <td>
                        ${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}
                    </td>
                    <td>
                        ${usage.productionsCount > 0 || usage.evaluationsCount > 0 ?
                            `<span class="badge-statut evalue">${usage.productionsCount} prod. / ${usage.evaluationsCount} éval.</span>` :
                            '<span class="badge-statut non-evalue">Non utilisée</span>'}
                    </td>
                    <td>${nbCartouches > 0 ? `${nbCartouches} cartouche${nbCartouches > 1 ? 's' : ''}` : '—'}</td>
                    <td class="actions-cell">
                        <button class="btn btn-compact btn-secondaire"
                                data-action="naviguerVersRessource" data-param="grille" data-param2="${g.id}"
                                title="Consulter cette grille">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                data-action="ouvrirModalSuppressionRessource" data-param="grille" data-param2="${g.id}"
                                title="Supprimer définitivement">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Affiche le tableau des cartouches de rétroaction
     */
    function afficherTableauCartouches() {
        const container = document.getElementById('table-ressources-cartouches');
        if (!container) return;

        const cartouches = typeof obtenirToutesLesCartouchesBibliothequeSync === 'function' ?
            obtenirToutesLesCartouchesBibliothequeSync() : [];

        if (cartouches.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune cartouche de rétroaction dans la bibliothèque.</p>
                </div>
            `;
            return;
        }

        // Obtenir les usages
        const usages = calculerUsagesCartouches(cartouches);

        let html = `
            <table class="table-ressources">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Grille associée</th>
                        <th>Commentaires</th>
                        <th>Statut</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cartouches.forEach(c => {
            const dansSidebar = c.dansBibliotheque !== false;
            const usage = usages[c.id] || { evaluationsCount: 0 };
            const nbCommentaires = compterCommentairesCartouche(c);
            const nomGrille = obtenirNomGrilleAssociee(c.grilleId);

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(c.nom)}</strong>
                        ${c.auteur ? `<br><small class="text-muted">Par ${escapeHtml(c.auteur)}</small>` : ''}
                    </td>
                    <td>${escapeHtml(nomGrille)}</td>
                    <td>${nbCommentaires} commentaire${nbCommentaires > 1 ? 's' : ''}</td>
                    <td>
                        ${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}
                    </td>
                    <td>
                        ${usage.evaluationsCount > 0 ?
                            `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` :
                            '<span class="badge-statut non-evalue">Non utilisée</span>'}
                    </td>
                    <td class="actions-cell">
                        <button class="btn btn-compact btn-secondaire"
                                data-action="naviguerVersRessource" data-param="cartouche" data-param2="${c.id}"
                                title="Consulter cette cartouche">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                data-action="ouvrirModalSuppressionRessource" data-param="cartouche" data-param2="${c.id}"
                                title="Supprimer définitivement">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Affiche le tableau des échelles de performance
     */
    function afficherTableauEchelles() {
        const container = document.getElementById('table-ressources-echelles');
        if (!container) return;

        const echellesBiblio = typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ?
            obtenirToutesLesEchellesBibliothequeSync() : [];
        const echellesTempl = db.getSync('echellesTemplates', []) || [];
        const echelles = fusionnerRessources(echellesBiblio, echellesTempl);

        if (echelles.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune échelle de performance trouvée.</p>
                </div>
            `;
            return;
        }

        // Obtenir les usages
        const usages = calculerUsagesEchelles(echelles);

        let html = `
            <table class="table-ressources">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Niveaux</th>
                        <th>Statut</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        echelles.forEach(e => {
            const dansSidebar = e.dansBibliotheque !== false;
            const usage = usages[e.id] || { pratiquesCount: 0 };
            const nbNiveaux = e.niveaux?.length || 0;

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(e.nom)}</strong>
                        ${e.auteur ? `<br><small class="text-muted">Par ${escapeHtml(e.auteur)}</small>` : ''}
                    </td>
                    <td>${nbNiveaux} niveau${nbNiveaux > 1 ? 'x' : ''}</td>
                    <td>
                        ${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}
                    </td>
                    <td>
                        ${usage.pratiquesCount > 0 ?
                            `<span class="badge-statut evalue">${usage.pratiquesCount} pratique(s)</span>` :
                            '<span class="badge-statut non-evalue">Non utilisée</span>'}
                    </td>
                    <td class="actions-cell">
                        <button class="btn btn-compact btn-secondaire"
                                data-action="naviguerVersRessource" data-param="echelle" data-param2="${e.id}"
                                title="Consulter cette échelle">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                data-action="ouvrirModalSuppressionRessource" data-param="echelle" data-param2="${e.id}"
                                title="Supprimer définitivement">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Affiche le tableau des productions
     */
    function afficherTableauProductions() {
        const container = document.getElementById('table-ressources-productions');
        if (!container) return;

        const productions = typeof obtenirToutesLesProductionsBibliothequeSync === 'function' ?
            obtenirToutesLesProductionsBibliothequeSync() : [];

        if (productions.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune production dans la bibliothèque.</p>
                </div>
            `;
            return;
        }

        // Obtenir les usages
        const usages = calculerUsagesProductions(productions);

        let html = `
            <table class="table-ressources">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th>Usage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        productions.forEach(p => {
            const dansSidebar = p.dansBibliotheque !== false;
            const usage = usages[p.id] || { evaluationsCount: 0 };
            const typeProduction = p.type || p.categorie || '—';
            const descAff = p.activiteApprentissage || p.description;

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(p.nom)}</strong>
                        ${descAff ? `<br><small class="text-muted">${escapeHtml(descAff.substring(0, 50))}${descAff.length > 50 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>${escapeHtml(typeProduction)}</td>
                    <td>
                        ${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}
                    </td>
                    <td>
                        ${usage.evaluationsCount > 0 ?
                            `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` :
                            '<span class="badge-statut non-evalue">Non utilisée</span>'}
                    </td>
                    <td class="actions-cell">
                        <button class="btn btn-compact btn-secondaire"
                                data-action="naviguerVersRessource" data-param="production" data-param2="${p.id}"
                                title="Consulter cette production">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                data-action="ouvrirModalSuppressionRessource" data-param="production" data-param2="${p.id}"
                                title="Supprimer définitivement">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // =========================================================================
    // FONCTIONS V2 (avec conteneur passé en paramètre pour dropdown)
    // =========================================================================

    function afficherTableauPratiquesV2(container) {
        const pratiques = obtenirToutesPratiquesUtilisateur();

        if (pratiques.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune pratique personnalisée. Les gabarits prédéfinis sont toujours disponibles.</p></div>`;
            return;
        }

        const usages = calculerUsagesPratiques(pratiques);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Type</th><th>Auteur</th><th>Statut</th><th>Usage</th><th>Actions</th></tr></thead><tbody>`;

        pratiques.forEach(p => {
            const dansSidebar = p.dansBibliotheque !== false;
            const usage = usages[p.id] || { coursCount: 0 };
            const badgeType = obtenirBadgeTypePratique(p.type);
            html += `<tr><td><strong>${escapeHtml(p.nom)}</strong>${p.description ? `<br><small class="text-muted">${escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</small>` : ''}</td><td>${badgeType}</td><td>${escapeHtml(p.auteur || 'Inconnu')}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.coursCount > 0 ? `<span class="badge-statut evalue">${usage.coursCount} cours</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" data-action="naviguerVersRessource" data-param="pratique" data-param2="${p.id}" title="Consulter">Voir</button> <button class="btn btn-compact" data-action="ouvrirModalSuppressionRessource" data-param="pratique" data-param2="${p.id}" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauGrillesV2(container) {
        const grillesBiblio = typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ? obtenirToutesLesGrillesBibliothequeSync() : [];
        const grillesTempl = db.getSync('grillesTemplates', []) || [];
        const grilles = fusionnerRessources(grillesBiblio, grillesTempl);

        if (grilles.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune grille de critères trouvée.</p></div>`;
            return;
        }

        const usages = calculerUsagesGrilles(grilles);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Source</th><th>Discipline</th><th>Critères</th><th>Statut</th><th>Usage</th><th>Cartouches</th><th>Actions</th></tr></thead><tbody>`;

        grilles.forEach(g => {
            const dansSidebar = g.dansBibliotheque !== false;
            const usage = usages[g.id] || { productionsCount: 0, evaluationsCount: 0 };
            const nbCriteres = g.criteres?.length || 0;
            const nbCartouches = compterCartouchesGrille(g.id);
            const badgeSource = g._source === 'templates' ? '<span class="badge-source badge-source--locale">Templates</span>' : '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>';
            html += `<tr><td><strong>${escapeHtml(g.nom)}</strong>${g.auteur ? `<br><small class="text-muted">Par ${escapeHtml(g.auteur)}</small>` : ''}</td><td>${badgeSource}</td><td>${escapeHtml(g.discipline || '—')}</td><td>${nbCriteres} critère${nbCriteres > 1 ? 's' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.productionsCount > 0 || usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.productionsCount} prod. / ${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td>${nbCartouches > 0 ? `${nbCartouches} cartouche${nbCartouches > 1 ? 's' : ''}` : '—'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" data-action="naviguerVersRessource" data-param="grille" data-param2="${g.id}" title="Consulter">Voir</button> <button class="btn btn-compact" data-action="ouvrirModalSuppressionRessource" data-param="grille" data-param2="${g.id}" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauCartouchesV2(container) {
        const cartouches = typeof obtenirToutesLesCartouchesBibliothequeSync === 'function' ? obtenirToutesLesCartouchesBibliothequeSync() : [];

        if (cartouches.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune cartouche de rétroaction dans la bibliothèque.</p></div>`;
            return;
        }

        const usages = calculerUsagesCartouches(cartouches);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Grille associée</th><th>Commentaires</th><th>Statut</th><th>Usage</th><th>Actions</th></tr></thead><tbody>`;

        cartouches.forEach(c => {
            const dansSidebar = c.dansBibliotheque !== false;
            const usage = usages[c.id] || { evaluationsCount: 0 };
            const nbCommentaires = compterCommentairesCartouche(c);
            const nomGrille = obtenirNomGrilleAssociee(c.grilleId);
            html += `<tr><td><strong>${escapeHtml(c.nom)}</strong>${c.auteur ? `<br><small class="text-muted">Par ${escapeHtml(c.auteur)}</small>` : ''}</td><td>${escapeHtml(nomGrille)}</td><td>${nbCommentaires} commentaire${nbCommentaires > 1 ? 's' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" data-action="naviguerVersRessource" data-param="cartouche" data-param2="${c.id}" title="Consulter">Voir</button> <button class="btn btn-compact" data-action="ouvrirModalSuppressionRessource" data-param="cartouche" data-param2="${c.id}" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauEchellesV2(container) {
        const echellesBiblio = typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ? obtenirToutesLesEchellesBibliothequeSync() : [];
        const echellesTempl = db.getSync('echellesTemplates', []) || [];
        const echelles = fusionnerRessources(echellesBiblio, echellesTempl);

        if (echelles.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune échelle de performance trouvée.</p></div>`;
            return;
        }

        const usages = calculerUsagesEchelles(echelles);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Source</th><th>Niveaux</th><th>Statut</th><th>Usage</th><th>Actions</th></tr></thead><tbody>`;

        echelles.forEach(e => {
            const dansSidebar = e.dansBibliotheque !== false;
            const usage = usages[e.id] || { pratiquesCount: 0 };
            const nbNiveaux = e.niveaux?.length || 0;
            const badgeSource = e._source === 'templates' ? '<span class="badge-source badge-source--locale">Templates</span>' : '<span class="badge-source badge-source--bibliotheque">Bibliothèque</span>';
            html += `<tr><td><strong>${escapeHtml(e.nom)}</strong>${e.auteur ? `<br><small class="text-muted">Par ${escapeHtml(e.auteur)}</small>` : ''}</td><td>${badgeSource}</td><td>${nbNiveaux} niveau${nbNiveaux > 1 ? 'x' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.pratiquesCount > 0 ? `<span class="badge-statut evalue">${usage.pratiquesCount} pratique(s)</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" data-action="naviguerVersRessource" data-param="echelle" data-param2="${e.id}" title="Consulter">Voir</button> <button class="btn btn-compact" data-action="ouvrirModalSuppressionRessource" data-param="echelle" data-param2="${e.id}" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauProductionsV2(container) {
        const productions = typeof obtenirToutesLesProductionsBibliothequeSync === 'function' ? obtenirToutesLesProductionsBibliothequeSync() : [];

        if (productions.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune production dans la bibliothèque.</p></div>`;
            return;
        }

        const usages = calculerUsagesProductions(productions);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Type</th><th>Statut</th><th>Usage</th><th>Actions</th></tr></thead><tbody>`;

        productions.forEach(p => {
            const dansSidebar = p.dansBibliotheque !== false;
            const usage = usages[p.id] || { evaluationsCount: 0 };
            const typeProduction = p.type || p.categorie || '—';
            const descAffCompact = p.activiteApprentissage || p.description;
            html += `<tr><td><strong>${escapeHtml(p.nom)}</strong>${descAffCompact ? `<br><small class="text-muted">${escapeHtml(descAffCompact.substring(0, 50))}${descAffCompact.length > 50 ? '...' : ''}</small>` : ''}</td><td>${escapeHtml(typeProduction)}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" data-action="naviguerVersRessource" data-param="production" data-param2="${p.id}" title="Consulter">Voir</button> <button class="btn btn-compact" data-action="ouvrirModalSuppressionRessource" data-param="production" data-param2="${p.id}" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauAlignementsV2(container) {
        const alignements = typeof obtenirTousLesAlignementsBibliothequeSync === 'function' ? obtenirTousLesAlignementsBibliothequeSync() : [];

        if (alignements.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucun alignement dans la bibliothèque partagée.</p></div>`;
            return;
        }

        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Auteur</th><th>Noeuds</th><th>Liens</th><th>Date</th><th>Actions</th></tr></thead><tbody>`;

        alignements.forEach(a => {
            const nbNoeuds = a.donnees ? (a.donnees.noeuds || []).length : 0;
            const nbLiens = a.donnees ? (a.donnees.liens || []).length : 0;
            const auteur = a.auteur || (a.metadata_cc && a.metadata_cc.auteur_original) || '—';
            const date = a.dateAjoutBiblio ? new Date(a.dateAjoutBiblio).toLocaleDateString('fr-CA') : '—';
            const licence = (a.metadata_cc && a.metadata_cc.licence) || '';
            html += `<tr><td><strong>${escapeHtml(a.nom || 'Sans titre')}</strong>${licence ? `<br><small class="text-muted">${escapeHtml(licence)}</small>` : ''}</td><td>${escapeHtml(auteur)}</td><td>${nbNoeuds}</td><td>${nbLiens}</td><td>${date}</td><td class="actions-cell"><button class="btn btn-compact" data-action="supprimerAlignementDeBibliotheque" data-param="${a.id}" title="Supprimer de la bibliothèque">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Affiche le tableau des paramètres de configuration stockés
     */
    function afficherTableauParametresV2(container) {
        const trimestreActif = window.trimestreActif || db.getSync('trimestreActif', null);

        // Liste des paramètres à auditer (clé, label, namespacé)
        const parametres = [
            { cle: 'profilEnseignant', label: 'Profil enseignant (legacy)', ns: false },
            { cle: 'enseignants', label: 'Liste des enseignants', ns: false },
            { cle: 'modalitesEvaluation', label: 'Modalités d\'évaluation', ns: true },
            { cle: 'trimestreActif', label: 'Trimestre actif', ns: false },
            { cle: 'modeApplication', label: 'Mode de l\'application', ns: false },
            { cle: 'preferencesUtilisateur', label: 'Préférences utilisateur', ns: false },
            { cle: 'seuilsInterpretation', label: 'Seuils d\'interprétation', ns: true },
            { cle: 'errfrModeSynthese', label: 'Mode synthèse erreurs FR', ns: false },
            { cle: 'pratiqueParDefaut', label: 'Pratique par défaut', ns: true },
            { cle: 'demo-actif', label: 'Mode démo actif', ns: false },
            { cle: 'indicesCP', label: 'Indices C/P', ns: true },
            { cle: 'formatHoraire', label: 'Format horaire', ns: true },
            { cle: 'datesVerrouillees', label: 'Dates verrouillées', ns: true },
            { cle: 'migrationLegacyEffectuee', label: 'Migration legacy effectuée', ns: false },
            { cle: 'migrationLegacyDate', label: 'Date migration legacy', ns: false }
        ];

        let html = '<table class="table-ressources"><thead><tr><th>Paramètre</th><th>Clé</th><th>Valeur</th><th>Actions</th></tr></thead><tbody>';

        parametres.forEach(p => {
            const cleFinale = p.ns && trimestreActif ? trimestreActif + '_' + p.cle : p.cle;
            let valeur = null;
            try {
                valeur = db.getSync(cleFinale, null);
            } catch(e) { console.warn('[Donnees-V2] db.getSync read skipped for key:', cleFinale, e.message || e); }

            let apercu = '—';
            let typeBadge = '<span class="badge-statut non-evalue">Vide</span>';

            if (valeur !== null && valeur !== undefined) {
                typeBadge = '<span class="badge-actif">Défini</span>';
                if (typeof valeur === 'string') {
                    apercu = escapeHtml(valeur.length > 80 ? valeur.substring(0, 80) + '…' : valeur);
                } else if (Array.isArray(valeur)) {
                    apercu = valeur.length + ' élément' + (valeur.length > 1 ? 's' : '');
                } else if (typeof valeur === 'object') {
                    const keys = Object.keys(valeur);
                    apercu = keys.length + ' propriété' + (keys.length > 1 ? 's' : '') + ' : ' + escapeHtml(keys.slice(0, 4).join(', ')) + (keys.length > 4 ? '…' : '');
                } else {
                    apercu = escapeHtml(String(valeur));
                }
            }

            html += '<tr>'
                + '<td><strong>' + escapeHtml(p.label) + '</strong>' + (p.ns ? '<br><small class="text-muted">Namespacé par trimestre</small>' : '') + '</td>'
                + '<td><code>' + escapeHtml(cleFinale) + '</code></td>'
                + '<td>' + typeBadge + '<br><small>' + apercu + '</small></td>'
                + '<td class="actions-cell">'
                + (valeur !== null ? '<button class="btn btn-compact" data-action="supprimerParametreConfig" data-param="' + escapeHtml(cleFinale) + '" data-param2="' + escapeHtml(p.label) + '" title="Supprimer">Supprimer</button>' : '')
                + '</td></tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Supprime un paramètre de configuration après confirmation
     */
    function supprimerParametreConfig(cle, label) {
        if (!confirm('Supprimer le paramètre « ' + label + ' » (' + cle + ') ?\n\nCette action est irréversible.')) {
            return;
        }
        try {
            db.setSync(cle, null);
            notifications.succes('Paramètre « ' + label + ' » supprimé');
            afficherTableauParametresV2(document.getElementById('table-ressources-container'));
        } catch(e) {
            console.error('[donnees-v2] Erreur suppression paramètre:', e);
            notifications.erreur('Erreur lors de la suppression');
        }
    }

    // =========================================================================
    // CALCUL DES USAGES / DÉPENDANCES
    // =========================================================================

    /**
     * Calcule l'usage des pratiques (cours qui les utilisent)
     */
    function calculerUsagesPratiques(pratiques) {
        const usages = {};
        pratiques.forEach(p => {
            usages[p.id] = { coursCount: 0, cours: [] };
        });

        // Parcourir tous les trimestres pour trouver les groupe-cours
        try {
            const trimestres = enumererTrimestres();
            trimestres.forEach(trim => {
                const groupesCours = db.getSync(`${trim.id}_groupesCours`) || [];
                groupesCours.forEach(gc => {
                    if (gc.pratiqueId && usages[gc.pratiqueId]) {
                        usages[gc.pratiqueId].coursCount++;
                        usages[gc.pratiqueId].cours.push({
                            trimestreId: trim.id,
                            groupeCoursId: gc.id,
                            groupe: gc.groupeNum
                        });
                    }
                });
            });
        } catch (e) {
            console.error('[donnees-v2] Erreur calcul usages pratiques:', e);
        }

        return usages;
    }

    /**
     * Calcule l'usage des grilles (productions et évaluations qui les utilisent)
     */
    function calculerUsagesGrilles(grilles) {
        const usages = {};
        grilles.forEach(g => {
            usages[g.id] = { productionsCount: 0, evaluationsCount: 0 };
        });

        // Parcourir les productions
        try {
            const productions = obtenirDonneesSelonMode('productions');
            productions.forEach(prod => {
                if (prod.grilleId && usages[prod.grilleId]) {
                    usages[prod.grilleId].productionsCount++;
                }
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        // Parcourir les évaluations de tous les trimestres
        try {
            const trimestres = enumererTrimestres();
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evaluations.forEach(ev => {
                    if (ev.grilleId && usages[ev.grilleId]) {
                        usages[ev.grilleId].evaluationsCount++;
                    }
                });
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return usages;
    }

    /**
     * Calcule l'usage des cartouches (évaluations qui les utilisent)
     */
    function calculerUsagesCartouches(cartouches) {
        const usages = {};
        cartouches.forEach(c => {
            usages[c.id] = { evaluationsCount: 0 };
        });

        // Parcourir les évaluations de tous les trimestres
        try {
            const trimestres = enumererTrimestres();
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evaluations.forEach(ev => {
                    if (ev.cartoucheId && usages[ev.cartoucheId]) {
                        usages[ev.cartoucheId].evaluationsCount++;
                    }
                });
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return usages;
    }

    /**
     * Calcule l'usage des échelles (pratiques qui les utilisent)
     */
    function calculerUsagesEchelles(echelles) {
        const usages = {};
        echelles.forEach(e => {
            usages[e.id] = { pratiquesCount: 0 };
        });

        // Parcourir les pratiques configurables
        try {
            const pratiques = db.getSync(cle('pratiquesConfigurables')) || db.getSync('pratiquesConfigurables') || [];
            pratiques.forEach(p => {
                if (p.echelleId && usages[p.echelleId]) {
                    usages[p.echelleId].pratiquesCount++;
                }
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return usages;
    }

    /**
     * Calcule l'usage des productions (évaluations qui les utilisent)
     */
    function calculerUsagesProductions(productions) {
        const usages = {};
        productions.forEach(p => {
            usages[p.id] = { evaluationsCount: 0 };
        });

        // Parcourir les évaluations de tous les trimestres
        try {
            const trimestres = enumererTrimestres();
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evaluations.forEach(ev => {
                    if (ev.productionId && usages[ev.productionId]) {
                        usages[ev.productionId].evaluationsCount++;
                    }
                });
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return usages;
    }

    /**
     * Vérifie les dépendances avant suppression d'une pratique
     */
    function verifierDependancesPratique(pratiqueId) {
        const dependances = [];
        const avertissements = [];

        // Vérifier si c'est la pratique active
        const pratiqueActiveId = obtenirPratiqueActiveId();
        if (pratiqueId === pratiqueActiveId) {
            dependances.push('Cette pratique est actuellement active pour le trimestre.');
        }

        // Vérifier les cours qui l'utilisent
        try {
            const trimestres = enumererTrimestres();
            trimestres.forEach(trim => {
                const groupesCours = db.getSync(`${trim.id}_groupesCours`) || [];
                groupesCours.forEach(gc => {
                    if (gc.pratiqueId === pratiqueId) {
                        dependances.push(`Utilisée par un cours du trimestre ${trim.nom || trim.id}`);
                    }
                });
            });
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return { dependances, avertissements };
    }

    /**
     * Vérifie les dépendances avant suppression d'une grille
     */
    function verifierDependancesGrille(grilleId) {
        const dependances = [];
        const avertissements = [];

        // Vérifier les productions
        try {
            const productions = obtenirDonneesSelonMode('productions');
            const prodsUtilisant = productions.filter(p => p.grilleId === grilleId);
            if (prodsUtilisant.length > 0) {
                dependances.push(`Utilisée par ${prodsUtilisant.length} production(s)`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        // Vérifier les évaluations
        try {
            const trimestres = enumererTrimestres();
            let evalCount = 0;
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evalCount += evaluations.filter(ev => ev.grilleId === grilleId).length;
            });
            if (evalCount > 0) {
                dependances.push(`Utilisée par ${evalCount} évaluation(s)`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        // Avertissement: cartouches associées
        const nbCartouches = compterCartouchesGrille(grilleId);
        if (nbCartouches > 0) {
            avertissements.push(`${nbCartouches} cartouche(s) associée(s) seront aussi supprimées`);
        }

        return { dependances, avertissements };
    }

    /**
     * Vérifie les dépendances avant suppression d'une cartouche
     */
    function verifierDependancesCartouche(cartoucheId) {
        const dependances = []; // Les cartouches n'ont pas de dépendances bloquantes
        const avertissements = [];

        // Vérifier les évaluations (avertissement seulement)
        try {
            const trimestres = enumererTrimestres();
            let evalCount = 0;
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evalCount += evaluations.filter(ev => ev.cartoucheId === cartoucheId).length;
            });
            if (evalCount > 0) {
                avertissements.push(`Utilisée dans ${evalCount} évaluation(s) - les rétroactions associées seront perdues`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return { dependances, avertissements };
    }

    /**
     * Vérifie les dépendances avant suppression d'une échelle
     */
    function verifierDependancesEchelle(echelleId) {
        const dependances = [];
        const avertissements = [];

        // Vérifier les pratiques qui utilisent cette échelle
        try {
            const pratiques = db.getSync(cle('pratiquesConfigurables')) || db.getSync('pratiquesConfigurables') || [];
            const pratiquesUtilisant = pratiques.filter(p => p.echelleId === echelleId);
            if (pratiquesUtilisant.length > 0) {
                dependances.push(`Utilisée par ${pratiquesUtilisant.length} pratique(s) de notation`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return { dependances, avertissements };
    }

    /**
     * Vérifie les dépendances avant suppression d'une production
     */
    function verifierDependancesProduction(productionId) {
        const dependances = [];
        const avertissements = [];

        // Vérifier les évaluations qui utilisent cette production
        try {
            const trimestres = enumererTrimestres();
            let evalCount = 0;
            trimestres.forEach(trim => {
                const evaluations = db.getSync(`${trim.id}_evaluationsSauvegardees`) || [];
                evalCount += evaluations.filter(ev => ev.productionId === productionId).length;
            });
            if (evalCount > 0) {
                dependances.push(`Utilisée par ${evalCount} évaluation(s)`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return { dependances, avertissements };
    }

    // =========================================================================
    // UTILITAIRES
    // =========================================================================

    /**
     * Compte les cartouches associées à une grille
     */
    function compterCartouchesGrille(grilleId) {
        try {
            const cartouches = db.getSync(`cartouches_${grilleId}`) || [];
            return cartouches.length;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Compte les commentaires dans une cartouche
     */
    function compterCommentairesCartouche(cartouche) {
        if (!cartouche || !cartouche.commentaires) return 0;
        let count = 0;
        Object.values(cartouche.commentaires).forEach(niveaux => {
            if (Array.isArray(niveaux)) {
                count += niveaux.length;
            } else if (typeof niveaux === 'object') {
                Object.values(niveaux).forEach(arr => {
                    if (Array.isArray(arr)) count += arr.length;
                });
            }
        });
        return count;
    }

    /**
     * Obtient le nom d'une grille par son ID
     */
    function obtenirNomGrilleAssociee(grilleId) {
        if (!grilleId) return '—';
        try {
            const grilles = obtenirToutesLesGrillesBibliothequeSync();
            const grille = grilles.find(g => g.id === grilleId);
            return grille ? grille.nom : grilleId.substring(0, 8) + '...';
        } catch (e) {
            return grilleId.substring(0, 8) + '...';
        }
    }

    /**
     * Formate le type de pratique pour affichage
     */
    function formaterTypePratique(type) {
        const types = {
            'pan-standards': 'PAN-Standards',
            'pan-specifications': 'PAN-Spécifications',
            'sommative': 'Sommative',
            'configurable': 'Configurable'
        };
        return types[type] || type || 'Autre';
    }

    /**
     * Formate le type de ressource pour affichage
     */
    function formaterTypeRessource(type) {
        const types = {
            'pratique': 'Pratique',
            'grille': 'Grille',
            'cartouche': 'Cartouche',
            'echelle': 'Échelle',
            'production': 'Production'
        };
        return types[type] || type || 'Ressource';
    }

    /**
     * Génère le badge HTML abrégé pour un type de pratique (SOM, STD, SPE, DEN)
     */
    function obtenirBadgeTypePratique(type) {
        // Session B : badge des 4 familles routé vers le registre (source unique).
        const rep = (typeof obtenirRepresentationPratiqueStricte === 'function')
            ? obtenirRepresentationPratiqueStricte(type) : null;
        if (rep) return genererBadgePratiqueHTML(type);
        // États distincts (non famille) : pratique configurable multi / inconnu.
        if (type === 'configurable') return '<span class="badge-type-pratique badge-type-multi">CFG</span>';
        return '<span class="badge-type-pratique badge-type-multi">—</span>';
    }

    /**
     * Échappe le HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =========================================================================
    // NAVIGATION VERS LES RESSOURCES
    // =========================================================================

    /**
     * Navigue vers la page de consultation d'une ressource
     */
    function naviguerVersRessource(type, id) {
        // Afficher la section appropriée selon le type de ressource
        if (typeof afficherSection === 'function') {
            afficherSection(type === 'pratique' ? 'calendrier' : 'conception');
        }

        // Ensuite afficher la bonne sous-section
        setTimeout(() => {
            if (type === 'pratique') {
                // Naviguer vers Conception > Pratiques de notation
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('conception-pratiques-notation');
                }
            } else if (type === 'grille') {
                // Naviguer vers Construction de la note > Grilles de critères
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('conception-grille-criteres');
                }
            } else if (type === 'cartouche') {
                // Naviguer vers Construction de la note > Rétroactions (Cartouches)
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('conception-retroactions');
                }
            } else if (type === 'echelle') {
                // Naviguer vers Construction de la note > Échelles de performance
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('conception-echelle-performance');
                }
            } else if (type === 'production') {
                // Naviguer vers Construction de la note > Productions
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('conception-productions');
                }
            }
        }, 100);
    }

    // =========================================================================
    // MODAL DE SUPPRESSION
    // =========================================================================

    /**
     * Ouvre la modal de confirmation de suppression
     */
    function ouvrirModalSuppressionRessource(type, id) {
        const modal = document.getElementById('modal-suppression-ressource');
        if (!modal) {
            console.error('[donnees-v2] Modal de suppression non trouvée');
            return;
        }

        // Récupérer la ressource
        let ressource = null;
        let dependances = [];
        let avertissements = [];

        if (type === 'pratique') {
            const pratiques = obtenirToutesPratiquesUtilisateur();
            ressource = pratiques.find(p => p.id === id);
            const deps = verifierDependancesPratique(id);
            dependances = deps.dependances;
            avertissements = deps.avertissements;
        } else if (type === 'grille') {
            const grillesBiblio = obtenirToutesLesGrillesBibliothequeSync();
            ressource = grillesBiblio.find(g => g.id === id);
            if (!ressource) {
                const grillesTempl = db.getSync('grillesTemplates', []) || [];
                ressource = grillesTempl.find(g => g.id === id);
            }
            const deps = verifierDependancesGrille(id);
            dependances = deps.dependances;
            avertissements = deps.avertissements;
        } else if (type === 'cartouche') {
            const cartouches = obtenirToutesLesCartouchesBibliothequeSync();
            ressource = cartouches.find(c => c.id === id);
            const deps = verifierDependancesCartouche(id);
            dependances = deps.dependances;
            avertissements = deps.avertissements;
        } else if (type === 'echelle') {
            const echellesBiblio = obtenirToutesLesEchellesBibliothequeSync();
            ressource = echellesBiblio.find(e => e.id === id);
            if (!ressource) {
                const echellesTempl = db.getSync('echellesTemplates', []) || [];
                ressource = echellesTempl.find(e => e.id === id);
            }
            const deps = verifierDependancesEchelle(id);
            dependances = deps.dependances;
            avertissements = deps.avertissements;
        } else if (type === 'production') {
            const productions = obtenirToutesLesProductionsBibliothequeSync();
            ressource = productions.find(p => p.id === id);
            const deps = verifierDependancesProduction(id);
            dependances = deps.dependances;
            avertissements = deps.avertissements;
        }

        if (!ressource) {
            alert('Ressource non trouvée.');
            return;
        }

        // Stocker pour la confirmation
        ressourceASupprimer = {
            type,
            id,
            nom: ressource.nom,
            dependances,
            avertissements
        };

        // Remplir la modal
        const infoDiv = document.getElementById('suppression-ressource-info');
        const typeLabel = type === 'pratique' ? 'pratique de notation' :
                         type === 'grille' ? 'grille de critères' :
                         type === 'echelle' ? 'échelle de niveaux' :
                         type === 'production' ? 'production' : 'cartouche de rétroaction';
        infoDiv.innerHTML = `
            <p>Tu es sur le point de supprimer définitivement la ${typeLabel} :</p>
            <p style="font-size: 1.2rem; font-weight: bold; color: var(--accent-primaire); margin: 15px 0;">
                ${escapeHtml(ressource.nom)}
            </p>
            <p class="text-muted">Cette action est irréversible.</p>
        `;

        // Dépendances bloquantes
        const divDependances = document.getElementById('suppression-dependances-bloquantes');
        const listeDependances = document.getElementById('liste-dependances-bloquantes');
        if (dependances.length > 0) {
            listeDependances.innerHTML = dependances.map(d => `<li>${escapeHtml(d)}</li>`).join('');
            divDependances.classList.remove('u-hide');
        } else {
            divDependances.classList.add('u-hide');
        }

        // Avertissements
        const divAvertissements = document.getElementById('suppression-avertissements');
        const listeAvertissements = document.getElementById('liste-avertissements');
        if (avertissements.length > 0) {
            listeAvertissements.innerHTML = avertissements.map(a => `<li>${escapeHtml(a)}</li>`).join('');
            divAvertissements.classList.remove('u-hide');
        } else {
            divAvertissements.classList.add('u-hide');
        }

        // Zone de confirmation
        const divConfirmation = document.getElementById('suppression-confirmation');
        const inputConfirmation = document.getElementById('input-confirmation-nom');
        const nomAttendu = document.getElementById('nom-ressource-attendu');
        const btnConfirmer = document.getElementById('btn-confirmer-suppression');

        if (dependances.length > 0) {
            // Suppression bloquée
            divConfirmation.classList.add('u-hide');
            btnConfirmer.disabled = true;
            btnConfirmer.textContent = 'Suppression impossible';
        } else {
            // Suppression possible avec confirmation
            divConfirmation.classList.remove('u-hide');
            inputConfirmation.value = '';
            nomAttendu.textContent = ressource.nom;
            btnConfirmer.disabled = true;
            btnConfirmer.textContent = 'Supprimer définitivement';
        }

        // Afficher la modal
        modal.classList.add('actif');
    }

    /**
     * Ferme la modal de suppression
     */
    function fermerModalSuppressionRessource() {
        const modal = document.getElementById('modal-suppression-ressource');
        if (modal) {
            modal.classList.remove('actif');
        }
        ressourceASupprimer = null;
    }

    /**
     * Vérifie si le nom de confirmation correspond
     */
    function verifierConfirmationSuppression() {
        if (!ressourceASupprimer) return;

        const input = document.getElementById('input-confirmation-nom');
        const btnConfirmer = document.getElementById('btn-confirmer-suppression');

        if (input.value.trim() === ressourceASupprimer.nom) {
            btnConfirmer.disabled = false;
        } else {
            btnConfirmer.disabled = true;
        }
    }

    /**
     * Confirme et exécute la suppression
     */
    async function confirmerSuppressionRessource() {
        if (!ressourceASupprimer) return;

        const { type, id, nom } = ressourceASupprimer;

        try {
            let succes = false;

            if (type === 'pratique') {
                succes = await supprimerPratiqueDefinitivement(id);
            } else if (type === 'grille') {
                succes = await supprimerGrilleDefinitivement(id);
            } else if (type === 'cartouche') {
                succes = await supprimerCartoucheDefinitivement(id);
            } else if (type === 'echelle') {
                succes = await supprimerEchelleDefinitivement(id);
            } else if (type === 'production') {
                succes = await supprimerProductionDefinitivement(id);
            }

            if (succes) {
                // Fermer la modal
                fermerModalSuppressionRessource();

                // Rafraîchir l'affichage (dropdown V2 + accordéons)
                chargerCompteursRessources();
                const typePluriel = type === 'pratique' ? 'pratiques' :
                                   type === 'grille' ? 'grilles' :
                                   type === 'cartouche' ? 'cartouches' :
                                   type === 'echelle' ? 'echelles' :
                                   type === 'production' ? 'productions' : '';
                if (typePluriel) afficherTableauRessource(typePluriel);

                // Notification
                notifications.succes(`${formaterTypeRessource(type)} "${nom}" supprimée`);
            } else {
                alert('Erreur lors de la suppression.');
            }
        } catch (e) {
            console.error('[donnees-v2] Erreur suppression:', e);
            alert('Erreur lors de la suppression: ' + e.message);
        }
    }

    // =========================================================================
    // FONCTIONS DE SUPPRESSION
    // =========================================================================

    /**
     * Supprime définitivement une pratique
     */
    async function supprimerPratiqueDefinitivement(pratiqueId) {
        // Retirer de la bibliothèque
        if (typeof retirerPratiqueDeLaBibliotheque === 'function') {
            await retirerPratiqueDeLaBibliotheque(pratiqueId);
        }

        // Retirer des pratiques configurables
        try {
            let configurables = db.getSync(cle('pratiquesConfigurables')) || db.getSync('pratiquesConfigurables') || [];
            configurables = configurables.filter(p => p.id !== pratiqueId);
            db.setSync(cle('pratiquesConfigurables'), configurables);
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        return true;
    }

    /**
     * Supprime définitivement une grille et ses cartouches associées
     */
    async function supprimerGrilleDefinitivement(grilleId) {
        // Marquer comme supprimée si c'est un gabarit hardcodé
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(grilleId)) {
            window.marquerRessourceSupprimee(grilleId);
        }
        // Supprimer les cartouches associées à cette grille
        try {
            await db.remove(`cartouches_${grilleId}`);
        } catch (e) {
            console.warn('[donnees-v2] Erreur suppression cartouches grille:', e.message);
        }

        // Retirer de la bibliothèque
        if (typeof retirerGrilleDeLaBibliotheque === 'function') {
            await retirerGrilleDeLaBibliotheque(grilleId);
        }

        // Retirer aussi de grillesTemplates (dual storage)
        try {
            let templates = db.getSync('grillesTemplates', []) || [];
            const avant = templates.length;
            templates = templates.filter(g => g.id !== grilleId);
            if (templates.length !== avant) {
                await db.set('grillesTemplates', templates);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur suppression grille templates:', e.message);
        }

        return true;
    }

    /**
     * Supprime définitivement une cartouche
     */
    async function supprimerCartoucheDefinitivement(cartoucheId) {
        // Marquer comme supprimée si c'est un gabarit hardcodé
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(cartoucheId)) {
            window.marquerRessourceSupprimee(cartoucheId);
        }
        // Retirer de la bibliothèque
        if (typeof retirerCartoucheDeLaBibliotheque === 'function') {
            await retirerCartoucheDeLaBibliotheque(cartoucheId);
        }

        return true;
    }

    /**
     * Supprime définitivement une échelle de la bibliothèque
     */
    async function supprimerEchelleDefinitivement(echelleId) {
        // Marquer comme supprimée si c'est un gabarit hardcodé
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(echelleId)) {
            window.marquerRessourceSupprimee(echelleId);
        }
        // Retirer de la bibliothèque
        if (typeof retirerEchelleDeLaBibliotheque === 'function') {
            await retirerEchelleDeLaBibliotheque(echelleId);
        }

        // Retirer aussi de echellesTemplates (dual storage)
        try {
            let templates = db.getSync('echellesTemplates', []) || [];
            const avant = templates.length;
            templates = templates.filter(e => e.id !== echelleId);
            if (templates.length !== avant) {
                await db.set('echellesTemplates', templates);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur suppression échelle templates:', e.message);
        }

        return true;
    }

    /**
     * Supprime définitivement une production de la bibliothèque
     */
    async function supprimerProductionDefinitivement(productionId) {
        // Retirer de la bibliothèque
        if (typeof retirerProductionDeLaBibliotheque === 'function') {
            await retirerProductionDeLaBibliotheque(productionId);
        } else {
            // Fallback: suppression directe
            try {
                let productions = db.getSync('bibliothequeProductions') || [];
                productions = productions.filter(p => p.id !== productionId);
                await db.set('bibliothequeProductions', productions);
            } catch (e) {
                console.error('[donnees-v2] Erreur suppression production:', e);
                return false;
            }
        }

        return true;
    }

    // =========================================================================
    // GESTION DES ACCORDÉONS - CHARGEMENT À LA DEMANDE
    // =========================================================================

    /**
     * Appelé quand un accordéon de ressources est ouvert
     */
    function onAccordeonRessourceOuvert(accordeonId) {
        if (accordeonId === 'accordeon-ressources-pratiques') {
            afficherTableauPratiques();
        } else if (accordeonId === 'accordeon-ressources-grilles') {
            afficherTableauGrilles();
        } else if (accordeonId === 'accordeon-ressources-cartouches') {
            afficherTableauCartouches();
        } else if (accordeonId === 'accordeon-ressources-echelles') {
            afficherTableauEchelles();
        } else if (accordeonId === 'accordeon-ressources-productions') {
            afficherTableauProductions();
        }
    }

    // Écouter les événements d'ouverture d'accordéon
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.accordeon-header');
        if (!header) return;

        const accordeon = header.closest('.accordeon');
        if (!accordeon) return;

        // Attendre que l'accordéon soit ouvert
        setTimeout(() => {
            if (!accordeon.classList.contains('ferme')) {
                onAccordeonRessourceOuvert(accordeon.id);
            }
        }, 100);
    });

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.initialiserDonneesV2 = initialiserDonneesV2;
    window.chargerVueDonnees = chargerVueDonnees;
    window.chargerStatistiquesSnapshots = chargerStatistiquesSnapshots;
    window.chargerCompteursRessources = chargerCompteursRessources;
    window.afficherTableauPratiques = afficherTableauPratiques;
    window.afficherTableauGrilles = afficherTableauGrilles;
    window.afficherTableauCartouches = afficherTableauCartouches;
    window.afficherTableauEchelles = afficherTableauEchelles;
    window.afficherTableauProductions = afficherTableauProductions;
    window.afficherTableauRessource = afficherTableauRessource;
    window.afficherTableauAlignementsV2 = afficherTableauAlignementsV2;
    window.ouvrirModalSuppressionRessource = ouvrirModalSuppressionRessource;
    window.fermerModalSuppressionRessource = fermerModalSuppressionRessource;
    window.verifierConfirmationSuppression = verifierConfirmationSuppression;
    window.confirmerSuppressionRessource = confirmerSuppressionRessource;
    window.naviguerVersRessource = naviguerVersRessource;
    window.supprimerParametreConfig = supprimerParametreConfig;

    // =========================================================================
    // INITIALISATION AU CHARGEMENT
    // =========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof db !== 'undefined' && db.isReady) {
                initialiserDonneesV2();
            } else {
                document.addEventListener('db-ready', initialiserDonneesV2);
            }
        });
    } else {
        if (typeof db !== 'undefined' && db.isReady) {
            initialiserDonneesV2();
        } else {
            document.addEventListener('db-ready', initialiserDonneesV2);
        }
    }


})();
