/**
 * donnees-v2.js
 * Module de gestion de l'onglet Données (Beta 96)
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

    console.log('[donnees-v2] Chargement du module...');

    // =========================================================================
    // ÉTAT LOCAL
    // =========================================================================

    let ressourceASupprimer = null; // {type, id, nom, dependances, avertissements}

    // =========================================================================
    // INITIALISATION
    // =========================================================================

    /**
     * Initialise l'onglet Données v2
     */
    function initialiserDonneesV2() {
        console.log('[donnees-v2] Initialisation...');

        // Charger les statistiques des snapshots
        chargerStatistiquesSnapshots();

        // Charger les compteurs de ressources
        chargerCompteursRessources();

        console.log('[donnees-v2] Initialisation terminée');
    }

    /**
     * Charge la vue Données (appelée par navigation.js)
     * Rafraîchit les compteurs à chaque navigation vers cette section
     */
    function chargerVueDonnees() {
        console.log('[donnees-v2] Chargement de la vue Données...');

        // Rafraîchir les compteurs
        chargerCompteursRessources();

        // Rafraîchir les statistiques des snapshots
        chargerStatistiquesSnapshots();
    }

    // =========================================================================
    // STATISTIQUES SNAPSHOTS
    // =========================================================================

    /**
     * Charge les statistiques des snapshots dans les cartes métriques
     */
    function chargerStatistiquesSnapshots() {
        // Éléments DOM
        const statHebdo = document.getElementById('v2-stat-snapshots-hebdo');
        const statInterventions = document.getElementById('v2-stat-snapshots-interventions');
        const statDerniere = document.getElementById('v2-stat-derniere-capture');

        if (!statHebdo || !statInterventions || !statDerniere) {
            console.log('[donnees-v2] Éléments statistiques non trouvés');
            return;
        }

        // ✅ CORRECTIF (13 fév 2026): Utiliser cleSnapshots() (clé par groupe-cours)
        // au lieu des anciennes clés 'snapshotsHebdomadaires'/'snapshotsInterventions' qui n'existent pas
        const cleSnap = typeof cleSnapshots === 'function' ? cleSnapshots() : cle('snapshots');
        const snapshots = db.getSync(cleSnap, { hebdomadaires: [], interventions: [] });

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

        // Compter chaque type
        const counts = {
            pratiques: obtenirToutesPratiquesUtilisateur().length,
            grilles: (typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ? obtenirToutesLesGrillesBibliothequeSync() : []).length,
            cartouches: (typeof obtenirToutesLesCartouchesBibliothequeSync === 'function' ? obtenirToutesLesCartouchesBibliothequeSync() : []).length,
            echelles: (typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ? obtenirToutesLesEchellesBibliothequeSync() : []).length,
            productions: (typeof obtenirToutesLesProductionsBibliothequeSync === 'function' ? obtenirToutesLesProductionsBibliothequeSync() : []).length
        };

        // Mettre à jour les options du select
        Array.from(select.options).forEach(option => {
            if (option.value && counts[option.value] !== undefined) {
                const labels = {
                    pratiques: 'Pratiques de notation',
                    grilles: 'Grilles de critères',
                    cartouches: 'Cartouches de rétroaction',
                    echelles: 'Échelles de performance',
                    productions: 'Productions'
                };
                option.textContent = `${labels[option.value]} (${counts[option.value]})`;
            }
        });
    }

    /**
     * Affiche le tableau pour le type de ressource sélectionné
     */
    function afficherTableauRessource(type) {
        const container = document.getElementById('table-ressources-container');
        if (!container) return;

        if (!type) {
            container.innerHTML = '<p class="text-muted text-center" style="padding: 30px;">Sélectionnez un type de ressource ci-dessus pour afficher la liste.</p>';
            return;
        }

        // Afficher le chargement
        container.innerHTML = '<p class="text-muted text-center" style="padding: 30px;">Chargement...</p>';

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
            pratiques = db.getSync('pratiquesConfigurables') || [];
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
            const modalites = db.getSync('modalitesEvaluation') || {};
            return modalites.pratiqueActiveId || modalites.configurationSTDAppliquee?.id || null;
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
                                onclick="naviguerVersRessource('pratique', '${p.id}')"
                                title="Consulter cette pratique">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                onclick="ouvrirModalSuppressionRessource('pratique', '${p.id}')"
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

        const grilles = typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ?
            obtenirToutesLesGrillesBibliothequeSync() : [];

        if (grilles.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune grille de critères dans la bibliothèque.</p>
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
                                onclick="naviguerVersRessource('grille', '${g.id}')"
                                title="Consulter cette grille">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                onclick="ouvrirModalSuppressionRessource('grille', '${g.id}')"
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
                                onclick="naviguerVersRessource('cartouche', '${c.id}')"
                                title="Consulter cette cartouche">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                onclick="ouvrirModalSuppressionRessource('cartouche', '${c.id}')"
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

        const echelles = typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ?
            obtenirToutesLesEchellesBibliothequeSync() : [];

        if (echelles.length === 0) {
            container.innerHTML = `
                <div class="alerte alerte-information">
                    <p>Aucune échelle de performance dans la bibliothèque.</p>
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
                                onclick="naviguerVersRessource('echelle', '${e.id}')"
                                title="Consulter cette échelle">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                onclick="ouvrirModalSuppressionRessource('echelle', '${e.id}')"
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

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(p.nom)}</strong>
                        ${p.description ? `<br><small class="text-muted">${escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</small>` : ''}
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
                                onclick="naviguerVersRessource('production', '${p.id}')"
                                title="Consulter cette production">
                            Voir
                        </button>
                        <button class="btn btn-compact"
                                onclick="ouvrirModalSuppressionRessource('production', '${p.id}')"
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
            html += `<tr><td><strong>${escapeHtml(p.nom)}</strong>${p.description ? `<br><small class="text-muted">${escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</small>` : ''}</td><td>${badgeType}</td><td>${escapeHtml(p.auteur || 'Inconnu')}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.coursCount > 0 ? `<span class="badge-statut evalue">${usage.coursCount} cours</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" onclick="naviguerVersRessource('pratique', '${p.id}')" title="Consulter">Voir</button> <button class="btn btn-compact" onclick="ouvrirModalSuppressionRessource('pratique', '${p.id}')" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauGrillesV2(container) {
        const grilles = typeof obtenirToutesLesGrillesBibliothequeSync === 'function' ? obtenirToutesLesGrillesBibliothequeSync() : [];

        if (grilles.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune grille de critères dans la bibliothèque.</p></div>`;
            return;
        }

        const usages = calculerUsagesGrilles(grilles);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Discipline</th><th>Critères</th><th>Statut</th><th>Usage</th><th>Cartouches</th><th>Actions</th></tr></thead><tbody>`;

        grilles.forEach(g => {
            const dansSidebar = g.dansBibliotheque !== false;
            const usage = usages[g.id] || { productionsCount: 0, evaluationsCount: 0 };
            const nbCriteres = g.criteres?.length || 0;
            const nbCartouches = compterCartouchesGrille(g.id);
            html += `<tr><td><strong>${escapeHtml(g.nom)}</strong>${g.auteur ? `<br><small class="text-muted">Par ${escapeHtml(g.auteur)}</small>` : ''}</td><td>${escapeHtml(g.discipline || '—')}</td><td>${nbCriteres} critère${nbCriteres > 1 ? 's' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.productionsCount > 0 || usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.productionsCount} prod. / ${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td>${nbCartouches > 0 ? `${nbCartouches} cartouche${nbCartouches > 1 ? 's' : ''}` : '—'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" onclick="naviguerVersRessource('grille', '${g.id}')" title="Consulter">Voir</button> <button class="btn btn-compact" onclick="ouvrirModalSuppressionRessource('grille', '${g.id}')" title="Supprimer">Supprimer</button></td></tr>`;
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
            html += `<tr><td><strong>${escapeHtml(c.nom)}</strong>${c.auteur ? `<br><small class="text-muted">Par ${escapeHtml(c.auteur)}</small>` : ''}</td><td>${escapeHtml(nomGrille)}</td><td>${nbCommentaires} commentaire${nbCommentaires > 1 ? 's' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" onclick="naviguerVersRessource('cartouche', '${c.id}')" title="Consulter">Voir</button> <button class="btn btn-compact" onclick="ouvrirModalSuppressionRessource('cartouche', '${c.id}')" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function afficherTableauEchellesV2(container) {
        const echelles = typeof obtenirToutesLesEchellesBibliothequeSync === 'function' ? obtenirToutesLesEchellesBibliothequeSync() : [];

        if (echelles.length === 0) {
            container.innerHTML = `<div class="alerte alerte-information"><p>Aucune échelle de performance dans la bibliothèque.</p></div>`;
            return;
        }

        const usages = calculerUsagesEchelles(echelles);
        let html = `<table class="table-ressources"><thead><tr><th>Nom</th><th>Niveaux</th><th>Statut</th><th>Usage</th><th>Actions</th></tr></thead><tbody>`;

        echelles.forEach(e => {
            const dansSidebar = e.dansBibliotheque !== false;
            const usage = usages[e.id] || { pratiquesCount: 0 };
            const nbNiveaux = e.niveaux?.length || 0;
            html += `<tr><td><strong>${escapeHtml(e.nom)}</strong>${e.auteur ? `<br><small class="text-muted">Par ${escapeHtml(e.auteur)}</small>` : ''}</td><td>${nbNiveaux} niveau${nbNiveaux > 1 ? 'x' : ''}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.pratiquesCount > 0 ? `<span class="badge-statut evalue">${usage.pratiquesCount} pratique(s)</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" onclick="naviguerVersRessource('echelle', '${e.id}')" title="Consulter">Voir</button> <button class="btn btn-compact" onclick="ouvrirModalSuppressionRessource('echelle', '${e.id}')" title="Supprimer">Supprimer</button></td></tr>`;
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
            html += `<tr><td><strong>${escapeHtml(p.nom)}</strong>${p.description ? `<br><small class="text-muted">${escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</small>` : ''}</td><td>${escapeHtml(typeProduction)}</td><td>${dansSidebar ? '<span class="badge-actif">Sidebar</span>' : '<span class="badge-archive">Masquée</span>'}</td><td>${usage.evaluationsCount > 0 ? `<span class="badge-statut evalue">${usage.evaluationsCount} éval.</span>` : '<span class="badge-statut non-evalue">Non utilisée</span>'}</td><td class="actions-cell"><button class="btn btn-compact btn-secondaire" onclick="naviguerVersRessource('production', '${p.id}')" title="Consulter">Voir</button> <button class="btn btn-compact" onclick="ouvrirModalSuppressionRessource('production', '${p.id}')" title="Supprimer">Supprimer</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
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
            const trimestres = db.getSync('trimestres') || [];
            trimestres.forEach(trim => {
                const groupesCours = db.getSync(`${trim.id}_groupesCours`) || [];
                groupesCours.forEach(gc => {
                    if (gc.pratiqueId && usages[gc.pratiqueId]) {
                        usages[gc.pratiqueId].coursCount++;
                        usages[gc.pratiqueId].cours.push({
                            trimestreId: trim.id,
                            groupeCoursId: gc.id,
                            groupe: gc.groupe
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
            const productions = db.getSync(cle('productions')) || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
            const pratiques = db.getSync('pratiquesConfigurables') || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
            const productions = db.getSync(cle('productions')) || [];
            const prodsUtilisant = productions.filter(p => p.grilleId === grilleId);
            if (prodsUtilisant.length > 0) {
                dependances.push(`Utilisée par ${prodsUtilisant.length} production(s)`);
            }
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        // Vérifier les évaluations
        try {
            const trimestres = db.getSync('trimestres') || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
            const pratiques = db.getSync('pratiquesConfigurables') || [];
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
            const trimestres = db.getSync('trimestres') || [];
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
        const badges = {
            'pan-standards': '<span class="badge-type-pratique badge-type-std">STD</span>',
            'pan-specifications': '<span class="badge-type-pratique badge-type-spe">SPE</span>',
            'sommative': '<span class="badge-type-pratique badge-type-som">SOM</span>',
            'denominateur': '<span class="badge-type-pratique badge-type-den">DEN</span>',
            'configurable': '<span class="badge-type-pratique badge-type-multi">CFG</span>'
        };
        return badges[type] || '<span class="badge-type-pratique badge-type-multi">—</span>';
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
        // D'abord afficher la section principale "Construction de la note"
        if (typeof afficherSection === 'function') {
            afficherSection('construction');
        }

        // Ensuite afficher la bonne sous-section
        setTimeout(() => {
            if (type === 'pratique') {
                // Naviguer vers Construction de la note > Pratiques de notation
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('construction-pratiques-notation');
                }
                console.log('[donnees-v2] Navigation vers pratique:', id);
            } else if (type === 'grille') {
                // Naviguer vers Construction de la note > Grilles de critères
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('construction-grille-criteres');
                }
                console.log('[donnees-v2] Navigation vers grille:', id);
            } else if (type === 'cartouche') {
                // Naviguer vers Construction de la note > Rétroactions (Cartouches)
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('construction-retroactions');
                }
                console.log('[donnees-v2] Navigation vers cartouche:', id);
            } else if (type === 'echelle') {
                // Naviguer vers Construction de la note > Échelles de performance
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('construction-echelles');
                }
                console.log('[donnees-v2] Navigation vers échelle:', id);
            } else if (type === 'production') {
                // Naviguer vers Construction de la note > Productions
                if (typeof afficherSousSection === 'function') {
                    afficherSousSection('construction-productions');
                }
                console.log('[donnees-v2] Navigation vers production:', id);
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
            const grilles = obtenirToutesLesGrillesBibliothequeSync();
            ressource = grilles.find(g => g.id === id);
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
            const echelles = obtenirToutesLesEchellesBibliothequeSync();
            ressource = echelles.find(e => e.id === id);
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
                         type === 'grille' ? 'grille de critères' : 'cartouche de rétroaction';
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
        modal.classList.remove('u-hide');
    }

    /**
     * Ferme la modal de suppression
     */
    function fermerModalSuppressionRessource() {
        const modal = document.getElementById('modal-suppression-ressource');
        if (modal) {
            modal.classList.add('u-hide');
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

                // Rafraîchir l'affichage
                chargerCompteursRessources();
                if (type === 'pratique') afficherTableauPratiques();
                if (type === 'grille') afficherTableauGrilles();
                if (type === 'cartouche') afficherTableauCartouches();
                if (type === 'echelle') afficherTableauEchelles();
                if (type === 'production') afficherTableauProductions();

                // Notification
                if (typeof afficherNotificationSucces === 'function') {
                    afficherNotificationSucces(`${formaterTypeRessource(type)} "${nom}" supprimée`);
                } else {
                    alert(`${nom} a été supprimé(e) définitivement.`);
                }
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
            let configurables = db.getSync('pratiquesConfigurables') || [];
            configurables = configurables.filter(p => p.id !== pratiqueId);
            db.setSync('pratiquesConfigurables', configurables);
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        console.log('[donnees-v2] Pratique supprimée:', pratiqueId);
        return true;
    }

    /**
     * Supprime définitivement une grille et ses cartouches associées
     */
    async function supprimerGrilleDefinitivement(grilleId) {
        // Supprimer les cartouches associées à cette grille
        try {
            await db.remove(`cartouches_${grilleId}`);
        } catch (e) {
            console.warn('[donnees-v2] Erreur calcul usages:', e.message);
        }

        // Retirer de la bibliothèque
        if (typeof retirerGrilleDeLaBibliotheque === 'function') {
            await retirerGrilleDeLaBibliotheque(grilleId);
        }

        console.log('[donnees-v2] Grille supprimée (avec cartouches):', grilleId);
        return true;
    }

    /**
     * Supprime définitivement une cartouche
     */
    async function supprimerCartoucheDefinitivement(cartoucheId) {
        // Retirer de la bibliothèque
        if (typeof retirerCartoucheDeLaBibliotheque === 'function') {
            await retirerCartoucheDeLaBibliotheque(cartoucheId);
        }

        console.log('[donnees-v2] Cartouche supprimée:', cartoucheId);
        return true;
    }

    /**
     * Supprime définitivement une échelle de la bibliothèque
     */
    async function supprimerEchelleDefinitivement(echelleId) {
        // Retirer de la bibliothèque
        if (typeof retirerEchelleDeLaBibliotheque === 'function') {
            await retirerEchelleDeLaBibliotheque(echelleId);
        } else {
            // Fallback: suppression directe
            try {
                let echelles = db.getSync('echellesTemplates') || [];
                echelles = echelles.filter(e => e.id !== echelleId);
                await db.set('echellesTemplates', echelles);
            } catch (e) {
                console.error('[donnees-v2] Erreur suppression échelle:', e);
                return false;
            }
        }

        console.log('[donnees-v2] Échelle supprimée:', echelleId);
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

        console.log('[donnees-v2] Production supprimée:', productionId);
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
    window.ouvrirModalSuppressionRessource = ouvrirModalSuppressionRessource;
    window.fermerModalSuppressionRessource = fermerModalSuppressionRessource;
    window.verifierConfirmationSuppression = verifierConfirmationSuppression;
    window.confirmerSuppressionRessource = confirmerSuppressionRessource;
    window.naviguerVersRessource = naviguerVersRessource;

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

    console.log('[donnees-v2] Module chargé');

})();
