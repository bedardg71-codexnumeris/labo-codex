/* ===============================
   MODULE 99: POINT D'ENTRÉE ET INITIALISATION
   Index: 50 10-10-2025a → Modularisation

   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   Ce module doit être chargé EN DERNIER après tous les autres modules.
   Il initialise l'application et attache tous les événements globaux.

   Contenu de ce module:
   - Initialisation au chargement du DOM
   - Événements de navigation principale
   - Démarrage de la section par défaut
   - Initialisations conditionnelles des modules
   =============================== */

(function() {
'use strict';

// Snapshot du build embarqué dans CE fichier (cf. BACKLOG #285).
// init-inline.js compare cette valeur au BUILD_ID lu depuis version.json :
// si différent, Safari file:// a probablement un main.js périmé en cache,
// et la séquence reload+bandeau s'enclenche. SYNCHRONISER À CHAQUE BUMP.
window._SCRIPT_BUILD_main = '0818-1010';

/* ===============================
   FONCTION GLOBALE: Génération d'ID uniques
   =============================== */
/**
 * Génère un ID unique avec préfixe, résistant aux collisions même en boucle
 * @param {string} prefix - Préfixe (ex: 'EVAL_', 'PROD_', 'CR')
 * @returns {string} - ID unique (ex: 'EVAL_1707123456789_k7x2m')
 */
window.genererIdUnique = (function() {
    let compteur = 0;
    return function(prefix) {
        prefix = prefix || '';
        compteur = (compteur + 1) % 0xFFFF;
        const ts = Date.now();
        const rnd = crypto.getRandomValues(new Uint8Array(6));
        const hex = Array.from(rnd, b => b.toString(16).padStart(2, '0')).join('');
        return prefix + ts + '_' + compteur.toString(16) + '_' + hex;
    };
})();

/* ===============================
   FONCTION GLOBALE: Toggle visibilité (Beta 97.1)
   =============================== */
/**
 * Toggle la visibilité d'un élément via la classe CSS .u-hide.
 * Remplace element.style.display = 'none'/'block'/'flex'/etc.
 * @param {HTMLElement|null} element - L'élément à montrer/cacher
 * @param {boolean} show - true pour montrer, false pour cacher
 */
window.toggleDisplay = function(element, show) {
    if (!element) return;
    if (show) {
        element.classList.remove('u-hide');
        element.style.display = '';
    } else {
        element.classList.add('u-hide');
        element.style.display = 'none';
    }
};

/**
 * Vérifie si un étudiant est exclu des calculs du groupe.
 * Inactivité (registrariat) et décrochage (enseignant) : résultats affichés
 * jusqu'à la dernière présence, mais exclus des moyennes et statistiques.
 * @param {Object} etudiant - Objet étudiant avec propriété .statut
 * @returns {boolean}
 */
window.estEtudiantExclu = function(etudiant) {
    if (!etudiant || !etudiant.statut) return false;
    return etudiant.statut === 'inactif' || etudiant.statut === 'décrochage' || etudiant.statut === 'abandon';
};

/* ===============================
   FONCTIONS GLOBALES: Ressources supprimées volontairement (Beta 98.7)
   Empêche les fonctions assurer*() de réinjecter des gabarits
   que l'utilisateur a supprimés.
   =============================== */
window.estRessourceSupprimee = function(id) {
    const supprimees = db.getSync('ressourcesSupprimees', []);
    return supprimees.includes(id);
};

window.marquerRessourceSupprimee = function(id) {
    const supprimees = db.getSync('ressourcesSupprimees', []);
    if (!supprimees.includes(id)) {
        supprimees.push(id);
        db.setSync('ressourcesSupprimees', supprimees);
    }
};

// IDs des gabarits hardcodés (réinjectés par assurer*() si absents)
window.IDS_GABARITS_HARDCODES = [
    'ECHELLE_GENERIQUE', 'ECHELLE_BRUNO_CHIMIE', 'ECHELLE_XAVIER_INFO',
    'ECHELLE_ISABELLE_BIO', 'ECHELLE_HELENE_PHILO', 'ECHELLE_MARIEHELENE_LITT',
    'ECHELLE_ETIENNE_ADMIN', 'ECHELLE_OLIVIER_GEO', 'ECHELLE_JORDAN_PHILO',
    'GRILLE_GENERIQUE', 'CART_GENERIQUE'
];

/* ===============================
   FONCTIONS GLOBALES: Formatage de dates (Beta 97.1 - #68)
   3 formats canoniques, tous acceptent ISO string, tous avec TZ fix
   =============================== */
/** "6 février 2026" */
window.formaterDate = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
};

/** "6 fév." */
window.formaterDateCourte = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
};

/** "jeudi 6 février 2026" */
window.formaterDateComplete = function(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/* ===============================
   FONCTION GLOBALE: Badge de pratique de notation
   =============================== */
/**
 * Génère un badge HTML indiquant la pratique de notation
 * Fonction globale unique utilisée partout dans l'application
 * @param {string} type - 'SOM' ou 'PAN' (fourni par calculerTousLesIndices)
 * @param {boolean} compact - true pour version compacte (profil), false pour version normale
 * @returns {string} - HTML du badge avec classes CSS
 */
window.genererBadgePratique = function(type, compact = false) {
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    const typePAN = config.typePAN || 'maitrise';

    let classe = compact ? 'badge-pratique-compact' : 'badge-pratique';

    // Session B : code dérivé du registre (source unique). SOM direct ; sinon le
    // typePAN (maitrise/standards/specifications/denotation) → code via le registre
    // (maitrise et inconnu retombent sur STD, comportement historique préservé).
    const code = (type === 'SOM')
        ? 'SOM'
        : (typeof obtenirCodePratique === 'function' ? obtenirCodePratique(typePAN) : 'STD');
    classe += ' ' + code.toLowerCase();

    return `<span class="${classe}">${code}</span>`;
};

// ✅ Fonction reactiverGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre

// ✅ Fonction prechargerGroupeDemo() supprimée (Beta 93.5)
// Le groupe démo est maintenant géré via checkbox dans le formulaire Trimestre
// L'import s'effectue uniquement quand l'utilisateur coche la checkbox

// ===============================
// WRAPPERS — Fonctions extraites des onclick complexes (Phase 4)
// ===============================
window.naviguerVersReglagesTrimestre = function() {
    window.location.href = '#calendrier-trimestre';
    if (typeof afficherSousSectionActuelle === 'function') {
        afficherSousSectionActuelle('sous-section-trimestre');
    }
};
window.naviguerVersReglagesTrimestreDepuisPresences = function() {
    if (typeof afficherSection === 'function') afficherSection('reglages');
    if (typeof afficherSousSection === 'function') afficherSousSection('calendrier-trimestre');
};
window.rechargerPage = function() { window.location.reload(); };
window.ouvrirImportEchellesLocal = function() {
    var el = document.getElementById('fichier-import-echelles-local');
    if (el) el.click();
};
window.ouvrirImportTxtCartouche = function() {
    var el = document.getElementById('fichier-import-txt-cartouche');
    if (el) el.click();
};
// Bug 31 mai : lire l'id de la pratique en édition via le getter VIVANT
// (l'ancien window.pratiqueEnEditionMateriel était un snapshot figé à null →
// ces trois boutons passaient null silencieusement). On no-op proprement si
// aucune pratique n'est ouverte plutôt que d'appeler avec null.
function _idPratiqueEnEdition() {
    return (typeof obtenirPratiqueEnEditionMateriel === 'function')
        ? obtenirPratiqueEnEditionMateriel()
        : null;
}
window.dupliquerPratiqueMaterielActive = function() {
    const id = _idPratiqueEnEdition();
    if (typeof dupliquerPratiqueMateriel === 'function' && id) {
        dupliquerPratiqueMateriel(id);
    }
};
window.supprimerPratiqueMaterielActive = function() {
    const id = _idPratiqueEnEdition();
    if (typeof supprimerPratiqueMateriel === 'function' && id) {
        supprimerPratiqueMateriel(id);
    }
};
window.appliquerPratiqueAuCoursActive = function() {
    const id = _idPratiqueEnEdition();
    if (typeof appliquerPratiqueAuCours === 'function') {
        appliquerPratiqueAuCours(id);
    }
};
document.addEventListener('DOMContentLoaded', function () {

    // ===============================
    // FONCTION UTILITAIRE : Recalcul indices C-P
    // ===============================
    function recalculerIndicesSiDemande() {
        if (db.getSync('recalculerIndicesCP', null) === 'true') {
            db.setSync('recalculerIndicesCP', null); // Effacer le flag immédiatement
            if (typeof calculerEtStockerIndicesCP === 'function') {
                try {
                    calculerEtStockerIndicesCP();
                } catch (e) {
                    console.error('❌ [Main] Erreur lors du recalcul:', e);
                }
            } else {
                console.warn('⚠️ [Main] Fonction calculerEtStockerIndicesCP non disponible');
            }
        }
    }

    // ===============================
    // 0. ÉCOUTER LA SYNCHRONISATION IndexedDB
    // ===============================
    // Recharger les données quand la synchronisation IndexedDB → localStorage est terminée
    // ⚠ COURSE CORRIGÉE LE 7 AOÛT 2026 — la cause de #367 non migré.
    //
    // Ce bloc porte les MIGRATIONS AU BOOT. Il ne s'abonnait qu'à `db-ready`,
    // depuis `DOMContentLoaded`. Or `db.syncToLocalStorageCache()` émet cet
    // événement dès la fin de la synchro IndexedDB — qui peut se terminer AVANT
    // que ce code ait posé son écouteur. Dans ce cas l'événement est déjà passé,
    // l'écouteur ne se déclenche jamais, et TOUTES les migrations de ce bloc
    // sont sautées EN SILENCE — sans erreur, sans trace.
    //
    // Constat terrain (Grégoire, 7 août) : `migration_planification_seances_done`
    // encore à `false` et 38 entrées dans la clé nue, des heures après le
    // déploiement, avec un main.js pourtant à jour.
    //
    // `codex.js` connaissait déjà le piège et le contourne correctement. Le
    // même patron est appliqué ici : si la DB est DÉJÀ prête, on exécute
    // immédiatement ; sinon on attend l'événement.
    async function auDbReady(event) {

        // #374-bis (6 août 2026) : RE-scanner la fusion des journées sans cours
        // maintenant que memoryCache est hydraté. La passe de DOMContentLoaded
        // (§3.6b-bis) rate les clés vivant UNIQUEMENT en IndexedDB — classe de
        // bug #142 « lu trop tôt, relu à db-ready ». Constaté le 6 août : les
        // 2 congés A2026 de Grégoire, jamais fusionnés, semblaient disparus.
        // Idempotente (dédoublonnage id + contenu) ; si elle rattrape des
        // événements, le calendrier doit être régénéré pour les refléter.
        if (typeof migrerJourneesSansCours === 'function') {
            try {
                if (migrerJourneesSansCours() > 0 && typeof genererCalendrierComplet === 'function') {
                    genererCalendrierComplet();
                }
            } catch (e) {
                console.warn('[Migration #374-bis] re-scan db-ready échoué:', e);
            }
        }

        // Migration consolidation onboarding v6.21 (21 avril 2026) : nettoie
        // les flags localStorage + IDB orphelins après retrait des modules
        // primo-* (Phase 3) et modal-bienvenue (20 avril). Idempotent.
        if (!db.getSync('migration_onboarding_v6_21_done', false)) {
            try { db.removeSync('primo_accueil_vu'); } catch(e) {}
            try { db.removeSync('bienvenue_vu'); } catch(e) {}
            db.setSync('migration_onboarding_v6_21_done', true);
        }

        // Migration rétention rapportsBugArchives (22 mai 2026, Phase 6.2
        // PLAN-AQPC) : seuil réduit de 50 → 20 rapports max pour limiter
        // l'empreinte de PII potentielle. Tronque immédiatement si la liste
        // dépasse 20. Idempotent.
        if (!db.getSync('migration_rapports_bug_20_done', false)) {
            try {
                const archives = db.getSync('rapportsBugArchives', []);
                if (Array.isArray(archives) && archives.length > 20) {
                    archives.length = 20;
                    db.setSync('rapportsBugArchives', archives);
                }
            } catch(e) {
                console.warn('[migration_rapports_bug_20] erreur ignorée:', e);
            }
            db.setSync('migration_rapports_bug_20_done', true);
        }

        // Migration vocabulaire descriptif (22 mai 2026, Phase 6.1 PLAN-AQPC) :
        // renomme la propriété `decouplerPR` → `decouplerPN` (Découpler
        // Performance / Niveau d'attention) dans toutes les structures
        // stockées. Cohérent avec le renommage des tokens CSS --risque-*
        // → --niveau-attention-* livré au chantier J du 21 mai 2026.
        // Idempotent.
        if (!db.getSync('migration_decoupler_pn_done', false)) {
            try {
                const renommerDansObjet = (obj) => {
                    if (obj && Object.prototype.hasOwnProperty.call(obj, 'decouplerPR')) {
                        obj.decouplerPN = obj.decouplerPR;
                        delete obj.decouplerPR;
                        return true;
                    }
                    return false;
                };

                // NB Lot 3 #328 (11 juin 2026) : le volet « modalitesEvaluation
                // .portfolio.decouplerPR » (clé globale pré-namespacing) a été
                // retiré — la clé nue est morte et le module propriétaire est
                // le seul écrivain de la clé namespacée. La config portfolio
                // canonique vit dans pratiquesConfigurables (Phase G2-a).

                // 1. preferencesUtilisateur.decouplerPR (préférence v2)
                const prefs = db.getSync('preferencesUtilisateur', {});
                if (prefs && renommerDansObjet(prefs)) {
                    db.setSync('preferencesUtilisateur', prefs);
                }

                // 2. bibliothequePratiques[*].config.portfolio.decouplerPR
                const biblioPratiques = db.getSync('bibliothequePratiques', []);
                let biblioModifiee = false;
                if (Array.isArray(biblioPratiques)) {
                    biblioPratiques.forEach(p => {
                        if (p?.config?.portfolio && renommerDansObjet(p.config.portfolio)) {
                            biblioModifiee = true;
                        }
                    });
                    if (biblioModifiee) db.setSync('bibliothequePratiques', biblioPratiques);
                }

                // 3. pratiquesPersonnalisees[*].config.portfolio.decouplerPR
                const pratiquesPerso = db.getSync('pratiquesPersonnalisees', []);
                let persoModifiee = false;
                if (Array.isArray(pratiquesPerso)) {
                    pratiquesPerso.forEach(p => {
                        if (p?.config?.portfolio && renommerDansObjet(p.config.portfolio)) {
                            persoModifiee = true;
                        }
                    });
                    if (persoModifiee) db.setSync('pratiquesPersonnalisees', pratiquesPerso);
                }
            } catch(e) {
                console.warn('[migration_decoupler_pn] erreur partielle ignorée:', e);
            }
            db.setSync('migration_decoupler_pn_done', true);
        }

        // Migration namespacing de modalitesEvaluation (24 mai 2026) :
        // la pratique de notation devient namespacée par trimestre pour que
        // chaque session conserve sa propre pratique (modèle qui évolue d'un
        // semestre à l'autre). On copie le global existant dans la clé
        // namespacée de chaque trimestre encore dépourvu. Idempotent.
        // ⚠️ BORNÉE (Lot 3 #328, 11 juin 2026) : SEUL lecteur autorisé de la
        // clé nue 'modalitesEvaluation' dans js/ — pont pour les données
        // pré-24 mai 2026. La sentinelle L3 verrouille ce périmètre ; ne pas
        // ajouter d'autre lecture de la clé nue.
        if (!db.getSync('migration_modalites_namespacees_done', false)) {
            try {
                const modalitesGlobales = db.getSync('modalitesEvaluation', null);
                if (modalitesGlobales) {
                    const trimestres = db.getSync('trimestres', []);
                    if (Array.isArray(trimestres)) {
                        trimestres.forEach(t => {
                            if (!t || !t.id) return;
                            const cleNamespacee = `${t.id}_modalitesEvaluation`;
                            if (db.getSync(cleNamespacee, null) === null) {
                                db.setSync(cleNamespacee, modalitesGlobales);
                            }
                        });
                    }
                }
            } catch(e) {
                console.warn('[migration_modalites_namespacees] erreur ignorée:', e);
            }
            db.setSync('migration_modalites_namespacees_done', true);
        }

        // === #367 (7 août 2026) — notes de leçon : namespacer ET composer ===
        //
        // `planification_seances` n'avait jamais été namespacée : les notes
        // étaient partagées entre TOUS les trimestres et avec la démo. Et son
        // dictionnaire était PLAT par id de leçon, alors que ces ids sont
        // produits par un compteur PAR CARTE — les notes étaient donc déjà
        // aliassées entre cartes d'un même trimestre (rouge D1, audit 5 août).
        //
        // SÉMANTIQUE RETENUE — chaque carte GARDE CE QU'ELLE AFFICHE AUJOURD'HUI.
        // Puisque toutes les cartes lisent actuellement le même dictionnaire
        // plat, une carte qui montre la note X pour `planif-noeud_3` continue de
        // la montrer. La migration fige l'état visible ; elle ne propage rien de
        // neuf et ne retire rien à personne. C'est la lecture la plus sûre de la
        // décision Grégoire du 7 août (« dupliquer vers tous, purger la nue »).
        //
        // ⚠ FILET RETIRÉ le 8 août 2026 (#409). La migration archivait d'abord la
        // clé nue dans `planification_seances_archive_pre367`. Grégoire a vérifié
        // ses données réelles (A2026 et H2026) après le premier démarrage en
        // 1.50.0 : la clé nue ne portait que des productions de TEST, et l'archive
        // ne protégeait précisément que celles-là. Elle n'a jamais eu de lecteur —
        // aucun chemin de restauration n'existait, seulement une copie morte.
        // ⮕ CONSÉQUENCE ASSUMÉE, et c'est la seule : sur un codex qui n'a PAS
        //    encore migré, une note dont la leçon n'existe dans aucune carte n'a
        //    pas de destination composite et est désormais PERDUE à la purge, au
        //    lieu d'être archivée. C'est la portée exacte de la décision du 7 août.
        if (!db.getSync('migration_planification_seances_done', false)) {
            try {
                const notesNues = db.getSync('planification_seances', null);
                const aDesNotes = notesNues && typeof notesNues === 'object' && Object.keys(notesNues).length > 0;

                if (aDesNotes) {
                    const listeTrim = db.getSync('trimestres', []);
                    if (Array.isArray(listeTrim)) {
                        listeTrim.forEach(t => {
                            if (!t || !t.id) return;
                            const donneesCartes = db.getSync(`${t.id}_planification_mindmap`, null);
                            if (!donneesCartes || !donneesCartes.cartes) return;

                            const cleCible = `${t.id}_planification_seances`;
                            const cible = db.getSync(cleCible, {}) || {};
                            let modifie = false;

                            Object.keys(donneesCartes.cartes).forEach(carteId => {
                                const contenu = donneesCartes.cartes[carteId];
                                const noeuds = (contenu && contenu.noeuds) || [];
                                noeuds.forEach(n => {
                                    if (!n || n.type !== 'lecon') return;
                                    const source = notesNues[n.id];
                                    if (!source) return;
                                    const cleComposite = `${carteId}::${n.id}`;
                                    if (cleComposite in cible) return; // idempotent
                                    cible[cleComposite] = JSON.parse(JSON.stringify(source));
                                    modifie = true;
                                });
                            });

                            if (modifie) db.setSync(cleCible, cible); // security-ok: redistribution interne de données locales
                        });
                    }

                    // Purge de la nue : sans elle, `cle()` continuerait de la
                    // servir aux codex qui n'ont pas encore migré ET la démo
                    // continuerait d'y écrire.
                    db.setSync('planification_seances', {});
                }
            } catch (e) {
                console.warn('[migration_planification_seances] erreur ignorée:', e);
            }
            db.setSync('migration_planification_seances_done', true);
        }

        // #409 (8 août 2026) — retrait de l'archive de #367 déjà STOCKÉE.
        // Retirer l'écriture ci-dessus ne suffit pas : la clé existe déjà chez
        // qui a démarré 1.50.0-1.55.x, et c'est une copie intégrale du
        // dictionnaire de notes qui pèse pour rien sur le budget localStorage
        // (#353). Sans drapeau, comme la purge dureePeriodeMinutes juste en
        // dessous, et pour la même raison : un backup Codex pris dans la fenêtre
        // du 7-8 août PORTE cette clé et la réintroduirait à l'import. Une purge
        // à drapeau, elle, ne repasserait jamais.
        // ⮕ À RETIRER quand les backups de cette fenêtre seront hors rotation —
        //    au plus tard à la rentrée (septembre 2026). Item BACKLOG #428.
        try {
            if (db.getSync('planification_seances_archive_pre367', null) !== null) {
                db.removeSync('planification_seances_archive_pre367');
            }
        } catch (e) {
            console.warn('[purge archive pre367] erreur ignorée:', e);
        }

        // #424 Lot F (8 août 2026) — MOISSONNEUSE des rattachements d'activités.
        // La page « Plan de la leçon » écrivait {retroaction, productionId}
        // dans planification_seances[<carte>::<lecon>].activites[<actId>] — un
        // porteur PARALLÈLE au nœud. Depuis le portage #424, la vérité vit sur
        // le nœud : metadata.retroaction de l'ACTIVITÉ (formative, Lot E),
        // metadata.productionId de l'ÉVALUATION (Inspecteur). La moisson porte
        // les valeurs vers le nœud puis retire le sous-objet — TOUS les
        // trimestres (leçon #429), par les clés namespacées composites (leçon
        // #419 : on moissonne par le chemin par lequel on lit).
        // SANS DRAPEAU, patron #409/#428 : un backup Codex d'avant le portage
        // réintroduirait `activites` à l'import ; une moisson à drapeau ne
        // repasserait jamais. Idempotente : le nœud est PRIORITAIRE, une
        // valeur déjà posée n'est jamais écrasée.
        // ⚠ Ne rien inventer : ce qui ne se résout pas (carte disparue, nœud
        // absent, production sans évaluation unique libre dans la leçon) est
        // CONSIGNÉ en console et LAISSÉ EN PLACE — une entrée n'est retirée
        // que moissonnée.
        // ⮕ À RETIRER quand les backups d'avant le portage seront hors
        //    rotation — au plus tard à la rentrée (septembre 2026). BACKLOG #430.
        try {
            const listeTrimMoisson = db.getSync('trimestres', []);
            (Array.isArray(listeTrimMoisson) ? listeTrimMoisson : []).forEach(t => {
                if (!t || !t.id) return;
                const cleSeancesT = `${t.id}_planification_seances`;
                const seancesT = db.getSync(cleSeancesT, null);
                if (!seancesT || typeof seancesT !== 'object') return;

                const mindmap = db.getSync(`${t.id}_planification_mindmap`, null);
                let seancesModifiees = false;
                let mindmapModifiee = false;

                Object.keys(seancesT).forEach(cleComposite => {
                    const entree = seancesT[cleComposite];
                    if (!entree || typeof entree !== 'object' || !entree.activites) return;
                    const morceaux = cleComposite.split('::');
                    const carte = mindmap && mindmap.cartes && mindmap.cartes[morceaux[0]];
                    if (!carte || !Array.isArray(carte.noeuds)) {
                        console.warn('[moisson #424] ' + t.id + '/' + cleComposite + ' : carte introuvable, rattachements laissés en place');
                        return;
                    }
                    const leconId = morceaux[1];
                    const activites = entree.activites;

                    Object.keys(activites).forEach(actId => {
                        const choix = activites[actId] || {};
                        const noeudAct = carte.noeuds.find(n => n && n.id === actId);
                        if (!noeudAct) {
                            console.warn('[moisson #424] ' + t.id + '/' + cleComposite + ' : nœud ' + actId + ' introuvable, rattachement laissé en place');
                            return;
                        }

                        // productionId posé sur une ACTIVITÉ (0 au relevé D1 —
                        // cas backup ancien) : sa destination est le nœud
                        // ÉVALUATION de la MÊME leçon, s'il est UNIQUE et
                        // encore libre. Sinon : ne rien inventer.
                        if (choix.productionId) {
                            const lecon = carte.noeuds.find(n => n && n.id === leconId);
                            const evals = ((lecon && lecon.enfants) || [])
                                .map(eid => carte.noeuds.find(n => n && n.id === eid))
                                .filter(n => n && n.type === 'evaluation');
                            const cibleLibre = evals.length === 1 && !(evals[0].metadata && evals[0].metadata.productionId);
                            if (!cibleLibre) {
                                console.warn('[moisson #424] ' + t.id + '/' + cleComposite + '/' + actId + ' : production ' + choix.productionId + ' sans évaluation unique libre, rattachement laissé en place');
                                return; // l'entrée reste, on ne détruit pas ce qu'on n'a pas porté
                            }
                            if (!evals[0].metadata) evals[0].metadata = {};
                            evals[0].metadata.productionId = choix.productionId;
                            mindmapModifiee = true;
                        }

                        // Rétroaction formative → le nœud ACTIVITÉ, s'il n'en
                        // porte pas déjà une (« aucune » n'est pas un rattachement).
                        if (choix.retroaction && choix.retroaction !== 'aucune'
                            && !(noeudAct.metadata && noeudAct.metadata.retroaction)) {
                            if (!noeudAct.metadata) noeudAct.metadata = {};
                            noeudAct.metadata.retroaction = choix.retroaction;
                            mindmapModifiee = true;
                        }

                        delete activites[actId];
                        seancesModifiees = true;
                    });

                    if (Object.keys(activites).length === 0) {
                        delete entree.activites;
                        seancesModifiees = true;
                    }
                });

                if (mindmapModifiee) db.setSync(`${t.id}_planification_mindmap`, mindmap); // security-ok: redistribution interne de données locales du même utilisateur
                if (seancesModifiees) db.setSync(cleSeancesT, seancesT); // security-ok: idem
            });
        } catch (e) {
            console.warn('[moisson #424] erreur ignorée:', e);
        }

        // Purge du champ legacy dureePeriodeMinutes dans les modalités de
        // chaque trimestre (Lot 3 #328, 11 juin 2026). Sans flag : idempotente
        // et robuste face aux réintroductions par import de données anciennes
        // (même patron que nettoyerLegacy de preferences.js). La valeur est
        // rapatriée dans la clé `dureePeriode` (domaine horaire) au passage.
        try {
            if (window.modalitesEvaluation && typeof window.modalitesEvaluation.purgerLegacy === 'function') {
                window.modalitesEvaluation.purgerLegacy();
            }
        } catch(e) {
            console.warn('[purge dureePeriodeMinutes] erreur ignorée:', e);
        }

        // Migration namespacing de pratiquesConfigurables (24 mai 2026) :
        // la bibliothèque de templates de pratiques devient namespacée par
        // trimestre. Chaque trimestre conserve sa propre bibliothèque, isolée
        // des autres (modèle C — décision Grégoire). Le partage inter-
        // utilisateurs passera par la Voûte (future). On copie le global
        // existant dans la clé namespacée de chaque trimestre encore
        // dépourvu. Idempotent.
        if (!db.getSync('migration_pratiques_namespacees_done', false)) {
            try {
                const pratiquesGlobales = db.getSync('pratiquesConfigurables', null);
                if (Array.isArray(pratiquesGlobales) && pratiquesGlobales.length > 0) {
                    const trimestres = db.getSync('trimestres', []);
                    if (Array.isArray(trimestres)) {
                        trimestres.forEach(t => {
                            if (!t || !t.id) return;
                            const cleNamespacee = `${t.id}_pratiquesConfigurables`;
                            if (db.getSync(cleNamespacee, null) === null) {
                                db.setSync(cleNamespacee, pratiquesGlobales);
                            }
                        });
                    }
                }
            } catch(e) {
                console.warn('[migration_pratiques_namespacees] erreur ignorée:', e);
            }
            db.setSync('migration_pratiques_namespacees_done', true);
        }

        // Migration namespacing des MODÈLES grilles/échelles (#358, Option A —
        // 28 juin 2026) : grillesTemplates / echellesTemplates ont été déplacés de
        // CLES_GLOBALES vers CLES_NAMESPACEES (l'« interrupteur »). C1
        // (migrerModelesVersNamespace) peuple <trim>_grillesTemplates /
        // <trim>_echellesTemplates par USAGE (productions + évaluations grade-bearing,
        // via identifierTemplatesUtilises) — AVANT tout lecteur — pour que la bascule
        // cle() → régime namespacé préserve chaque note (sentinelle d'intégrité 358).
        // ADDITIF / IDEMPOTENT : ne touche NI au catalogue de gabarits
        // (bibliothequeGrilles/Echelles), NI à la clé globale héritée (son retrait est
        // la dernière étape, live, sur backup). Flag idempotent. Placée APRÈS la
        // migration des pratiques (registre des trimestres déjà stable) et avant tout
        // rendu (aucune lecture de grilles/échelles plus haut dans ce handler db-ready).
        if (!db.getSync('migration_modeles_namespacees_done', false)) {
            try {
                if (typeof migrerModelesVersNamespace === 'function') {
                    migrerModelesVersNamespace();
                    // G4 (#358) — VIDAGE de la clé globale héritée, TOUTE DERNIÈRE
                    // étape : ne s'exécute QUE si le peuplement n'a pas levé d'exception
                    // (sinon on garderait le global comme filet). Retire les modèles
                    // redondants, CONSERVE + journalise les orphelins non capturés.
                    if (typeof viderModelesGlobalHerite === 'function') {
                        viderModelesGlobalHerite();
                    }
                }
                // Boot ATOMIQUE (#358 follow-up, 3 juillet 2026) : G4 (removeSync) et
                // le peuplement C1 (setSync) sont des écritures fire-and-forget — si le
                // contexte meurt entre elles et la pose du flag, on pouvait obtenir
                // « flag posé mais global non vidé » (origine du reliquat du 28 juin).
                // On DRAINE donc tout (_pendingWrites → commit IDB) AVANT de poser le
                // flag : un flush qui échoue lève → catch → flag NON posé → nouvelle
                // tentative au prochain boot (migrerModelesVersNamespace est idempotent).
                if (db && typeof db.flush === 'function') {
                    await db.flush();
                }
                // Flag posé seulement après peuplement + vidage réussis ET durables :
                // un échec partiel laisse le global intact et fait re-tenter au
                // prochain boot (migrerModelesVersNamespace est idempotent/additif).
                db.setSync('migration_modeles_namespacees_done', true);
            } catch(e) {
                console.warn('[migration_modeles_namespacees] erreur ignorée:', e);
            }
        }

        // Migration #326 R1 (16 juin 2026) : le flag transitoire de maquette
        // d'exploration passe de `estEssai` à `estMaquette` (renommage zéro-dette).
        // Préserve les maquettes créées en terrain (iPad) en réécrivant le champ
        // dans `pratiquesConfigurables` (global + chaque trimestre). Aucun chemin
        // de lecture ne lit plus `estEssai` → on rebaptise une fois et on supprime
        // l'ancien champ (pas d'alias dormant). Idempotent.
        if (!db.getSync('migration_estEssai_to_estMaquette_done', false)) {
            try {
                const _rebaptiserMaquettes = (cleStore) => {
                    const liste = db.getSync(cleStore, null);
                    if (!Array.isArray(liste) || liste.length === 0) return;
                    let modifie = false;
                    liste.forEach(p => {
                        if (p && Object.prototype.hasOwnProperty.call(p, 'estEssai')) {
                            if (p.estEssai === true) p.estMaquette = true;
                            delete p.estEssai;
                            modifie = true;
                        }
                    });
                    if (modifie) db.setSync(cleStore, liste);
                };
                _rebaptiserMaquettes('pratiquesConfigurables');
                const trimestres = db.getSync('trimestres', []);
                if (Array.isArray(trimestres)) {
                    trimestres.forEach(t => {
                        if (t && t.id) _rebaptiserMaquettes(`${t.id}_pratiquesConfigurables`);
                    });
                }
            } catch(e) {
                console.warn('[migration_estEssai_to_estMaquette] erreur ignorée:', e);
            }
            db.setSync('migration_estEssai_to_estMaquette_done', true);
        }

        // Migration Phase G1 (24 mai 2026) : groupesCours[].pratiqueId qui
        // contient un type ('pan-standards', 'sommative', etc.) est remplacé
        // par un id de pratique configurable réel (premier entry avec ce type
        // dans la bibliothèque locale du trimestre). Source canonique de la
        // pratique active = groupe-cours, pas le trimestre (décision Grégoire).
        // Idempotent.
        if (!db.getSync('migration_pratiqueId_to_configurable_id_done', false)) {
            try {
                const typesLegacy = new Set([
                    'pan-standards', 'pan-maitrise', 'sommative',
                    'pan-specifications', 'specifications', 'pan-denotation'
                ]);
                const trimestres = db.getSync('trimestres', []);
                if (Array.isArray(trimestres)) {
                    trimestres.forEach(t => {
                        if (!t || !t.id) return;
                        const cleGC = `${t.id}_groupesCours`;
                        const groupesCours = db.getSync(cleGC, []);
                        if (!Array.isArray(groupesCours) || groupesCours.length === 0) return;

                        const clePratiques = `${t.id}_pratiquesConfigurables`;
                        const pratiques = db.getSync(clePratiques, []);
                        if (!Array.isArray(pratiques) || pratiques.length === 0) return;

                        let modifie = false;
                        groupesCours.forEach(gc => {
                            if (!gc || !typesLegacy.has(gc.pratiqueId)) return;
                            const cible = pratiques.find(p => p && p.type === gc.pratiqueId);
                            if (cible) {
                                console.warn(`[migration_pratiqueId G1] ${t.id}/${gc.id} : "${gc.pratiqueId}" → "${cible.id}" (${cible.nom})`);
                                gc.pratiqueId = cible.id;
                                modifie = true;
                            } else {
                                console.warn(`[migration_pratiqueId G1] ${t.id}/${gc.id} : aucune pratique configurable de type "${gc.pratiqueId}" trouvée — laissé en l'état`);
                            }
                        });
                        if (modifie) db.setSync(cleGC, groupesCours);
                    });
                }

                // Aussi groupeCoursActif (global, pointeur dynamique)
                const gcActif = db.getSync('groupeCoursActif', null);
                if (gcActif && typesLegacy.has(gcActif.pratiqueId) && gcActif.trimestreId && gcActif.id) {
                    const pratiques = db.getSync(`${gcActif.trimestreId}_pratiquesConfigurables`, []);
                    if (Array.isArray(pratiques)) {
                        const cible = pratiques.find(p => p && p.type === gcActif.pratiqueId);
                        if (cible) {
                            console.warn(`[migration_pratiqueId G1] groupeCoursActif : "${gcActif.pratiqueId}" → "${cible.id}" (${cible.nom})`);
                            gcActif.pratiqueId = cible.id;
                            db.setSync('groupeCoursActif', gcActif);
                        }
                    }
                }
            } catch(e) {
                console.warn('[migration_pratiqueId_to_configurable_id] erreur ignorée:', e);
            }
            db.setSync('migration_pratiqueId_to_configurable_id_done', true);
        }

        // Purge du champ legacy `groupe` des groupe-cours (27 juin 2026, dette
        // d'intégrité #130/#306). Le champ d'identité canonique est `groupeNum`
        // (seul champ écrit par `sauvegarderGroupeCoursV2`, cohérent avec `nom`) ;
        // l'ancien `groupe` n'est plus produit que par du code archivé et, quand
        // il réapparaît périmé/inversé (reconstruction, import de codex ancien),
        // il gagne à tort dans les lectures `groupe || groupeNum`. La règle
        // (`GroupeCoursEntite.normaliserCanonique`) retire `groupe` sans jamais
        // écraser un `groupeNum` présent. SANS flag (comme la purge de
        // `dureePeriodeMinutes`) : idempotente et robuste face aux réintroductions
        // — c'est le « tarir la source » du fond restant #306.
        try {
            if (window.GroupeCoursEntite && typeof window.GroupeCoursEntite.normaliserCanonique === 'function') {
                const trimestres = db.getSync('trimestres', []);
                if (Array.isArray(trimestres)) {
                    trimestres.forEach(t => {
                        if (!t || !t.id) return;
                        const cleGC = `${t.id}_groupesCours`;
                        const groupesCours = db.getSync(cleGC, null);
                        if (!Array.isArray(groupesCours) || groupesCours.length === 0) return;
                        const res = window.GroupeCoursEntite.normaliserCanonique(groupesCours);
                        if (res.divergences && res.divergences.length > 0) {
                            res.divergences.forEach(d => {
                                console.warn(`[purge groupe legacy] ${t.id}/${d.id} : "groupe"="${d.groupe}" ≠ canonique groupeNum="${d.groupeNum}" (nom="${d.nom}") → retiré, groupeNum fait foi`);
                            });
                        }
                        if (res.modifie) db.setSync(cleGC, groupesCours);
                    });
                }
            }
        } catch(e) {
            console.warn('[purge groupe legacy] erreur ignorée:', e);
        }

        // ✅ NOUVEAU (30 déc 2025): Recalculer les indices C et P si demandé (après chargement démo)
        recalculerIndicesSiDemande();

        // Recharger les données de toutes les sections affichées
        if (typeof chargerInfosCours === 'function') {
            chargerInfosCours();
        }
        if (typeof chargerListeEtudiants === 'function') {
            chargerListeEtudiants();
        }
        if (typeof afficherTableauProductions === 'function') {
            await afficherTableauProductions();
        }
        // ✅ NOUVEAU (29 déc 2025): Recharger le tableau de bord après synchronisation IndexedDB
        if (typeof chargerTableauBordApercu === 'function') {
            chargerTableauBordApercu();
        }

        // [Chantier 1] chargerEtatCheckboxDemo supprimée
    }

    // L'écouteur reste posé (db-ready peut être réémis après un import), ET le
    // rattrapage couvre le cas où il a déjà eu lieu. Les migrations du bloc sont
    // toutes idempotentes (drapeaux), donc une double exécution est sans effet.
    //
    // #414 (8 août 2026) : le rattrapage écrit à la main ici le 7 août est passé
    // au portillon commun `auDbPret` — sémantique STRICTEMENT identique
    // (`once: false` = écouteur maintenu + exécution immédiate si l'événement
    // est déjà passé). L'audit de #414 a montré que ce geste était réécrit à la
    // main en neuf endroits, avec trois familles de défauts ; le laisser en
    // version manuelle ICI, sur le bloc de migrations le plus critique du boot,
    // aurait maintenu la variante que le cliquet doit précisément interdire.
    window.auDbPret(auDbReady, { once: false });

    // ===============================
    // 1. GÉNÉRATION DYNAMIQUE DES BULLES — VORTEX (Beta 99.19+)
    // Rotation rigide autour d'un axe horizontal commun (top:50 %),
    // dérive horizontale lente, densité dilatée, opacité réduite.
    // ===============================

    const NB_BULLES_VORTEX = 18;
    const DUREE_VORTEX = 12;   // secondes — même vitesse angulaire pour toutes
    const DUREE_DERIVE = 75;   // secondes — dérive horizontale

    function creerUneBulle(tailles) {
        const taille = tailles[Math.floor(Math.random() * tailles.length)];
        const trajectoire = document.createElement('div');
        trajectoire.className = `bulle-trajectoire ${taille}`;

        const bulle = document.createElement('div');
        bulle.className = 'bulle';
        trajectoire.appendChild(bulle);

        // Rayon (amplitude Y) aléatoire : près de l'axe ou loin
        const amp = 8 + Math.random() * 52;              // 8 à 60 px
        // Scale proportionnel au rayon — loin = plus de profondeur 3D
        const scaleVar = 0.03 + (amp - 8) / 52 * 0.15;   // 3 % à 18 %
        const scaleUp = (1 + scaleVar).toFixed(3);
        const scaleDown = (1 - scaleVar).toFixed(3);

        // Phase aléatoire sur le cycle complet du vortex
        const spinDelay = (-Math.random() * DUREE_VORTEX).toFixed(2);
        // Offset X biaisé négatif : les bulles entrent depuis juste hors-champ à
        // gauche, de sorte que le fade-in a lieu au niveau du bouton Codex.
        const startX = `${(-20 - Math.random() * 60).toFixed(1)}px`;

        trajectoire.style.cssText = `
            --start-x: ${startX};
            --spin-amp: ${amp.toFixed(1)}px;
            --spin-duration: ${DUREE_VORTEX}s;
            --scale-up: ${scaleUp};
            --scale-down: ${scaleDown};
            --spin-delay: ${spinDelay}s;
            --drift-duration: ${DUREE_DERIVE}s;
        `;

        return trajectoire;
    }

    function genererBullesApprentissage() {
        const container = document.getElementById('bulles-container');
        if (!container) return;

        // Accessibilité (Phase 5.3 axe-core) : court-circuiter complètement si
        // l'utilisateur a activé « Réduire les animations » dans son OS.
        // Évite de polluer le DOM avec 18 éléments décoratifs invisibles.
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '';
        const tailles = ['petite', 'moyenne', 'grande'];

        for (let i = 0; i < NB_BULLES_VORTEX; i++) {
            const bulle = creerUneBulle(tailles);
            // Délai distribué sur tout le cycle de dérive → bulles espacées horizontalement
            const delai = (-Math.random() * DUREE_DERIVE).toFixed(2);
            bulle.style.animationDelay = `${delai}s`;
            container.appendChild(bulle);
        }
    }

    // Générer les bulles au chargement
    genererBullesApprentissage();

    // Régénérer si la liste d'étudiants change
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.includes('groupeEtudiants')) {
            const container = document.getElementById('bulles-container');
            if (container) {
                container.innerHTML = '';
                genererBullesApprentissage();
            }
        }
    });

    // ===============================
    // 1. NAVIGATION PRINCIPALE
    // ===============================

    document.querySelectorAll('.navigation-principale button').forEach(bouton => {
        bouton.addEventListener('click', function () {
            const onglet = this.getAttribute('data-onglet');
            afficherSection(onglet);
        });
    });

    // Chantier 3 : Section par défaut selon contexte
    const _modeExpert = !!obtenirPreference('modeExpert');
    const _demoActif = db.getSync('demo-actif', null) === 'true';
    if (_demoActif) {
        naviguerVers('suivi', 'groupe');
    } else if (_modeExpert) {
        naviguerVers('suivi', 'groupe');
    } else {
        afficherSection('accueil');
    }

// ===============================
    // 2. CHARGEMENTS CONDITIONNELS
    // ===============================


    // ===============================
    // PRIORITÉ 0 : MULTI-TRIMESTRES (Beta 95)
    // Doit s'exécuter EN PREMIER pour la migration et le namespacing
    // ===============================

    if (typeof initialiserModuleTrimestres === 'function') {
        initialiserModuleTrimestres();
    }

    // ===============================
    // PRIORITÉ 1 : MODULES GÉNÉRATEURS DE DONNÉES
    // Ces modules créent les sources uniques de vérité
    // ===============================

    // MODULE HORAIRE: Génère seancesCompletes (source unique)
    if (typeof initialiserModuleHoraire === 'function') {
        initialiserModuleHoraire();
    }

    // ===============================
    // PRIORITÉ 2 : DONNÉES DE BASE
    // ===============================

    // MODULE 03: Liste des étudiants
    if (typeof initialiserModuleListeEtudiants === 'function') {
        initialiserModuleListeEtudiants();
    }

    // MODULE 04: Productions et évaluations
    if (typeof initialiserModuleProductions === 'function') {
        initialiserModuleProductions();
    }

    // MODULE 05: Grilles de critères
    if (typeof initialiserModuleGrilles === 'function') {
        initialiserModuleGrilles();
    }

    // MODULE 06: Échelles de performance
    if (typeof initialiserModuleEchelles === 'function') {
        initialiserModuleEchelles();
    }

    // MODULE 07: Cartouches de rétroaction
    if (typeof initialiserModuleCartouches === 'function') {
        initialiserModuleCartouches();
    }

    // MODULE 07B: Objectifs d'apprentissage
    if (typeof initialiserModuleObjectifs === 'function') {
        initialiserModuleObjectifs();
    }

    // MODULE 08: Cours
    if (typeof initialiserModuleCours === 'function') {
        initialiserModuleCours();
    }

    // MODULE CONTEXTE: Affichage informations contextuelles dans l'en-tête
    if (typeof initialiserModuleContexte === 'function') {
        initialiserModuleContexte();
    }

    // MODULE DONNÉES DEMO (Phase 5.D) : si demo-actif='true' au boot,
    // ré-afficher le bandeau. Pas de nettoyage automatique — le legacy
    // supprimait les clés demo_* de Phase 1 (bug question 3 de l'audit).
    if (typeof initialiserBandeauDemoSiActif === 'function') {
        initialiserBandeauDemoSiActif();
    }
    // PLAN 1 Phase 5.E — Migration silencieuse one-shot des résidus legacy
    // (isDemo/estDemo dans globaux, trimestre demo orphelin). Idempotente
    // via flag migration-phase5-done. Skippée si demo-actif='true'.
    if (typeof migrerResidusPhase5 === 'function') {
        migrerResidusPhase5();
    }
    // PLAN 1 Phase 1 — Initialiser le namespace demo_* permanent
    // (idempotent via flag demo-version-installee).
    if (typeof initialiserDemoNamespace === 'function') {
        initialiserDemoNamespace();
    }

    // MODULE ACCUEIL: Page d'accueil (Chantier 3)
    if (typeof initialiserAccueil === 'function') {
        initialiserAccueil();
    }

    // MODULE 11: Gestion du groupe
    if (typeof initialiserModuleGroupe === 'function') {
        initialiserModuleGroupe();
    }

    // MODULE 12: Pratiques de notation
    if (typeof initialiserModulePratiques === 'function') {
        initialiserModulePratiques();
    }

    // REGISTRE DES PRATIQUES: Initialiser et vérifier les pratiques enregistrées
    if (typeof initialiserRegistrePratiques === 'function') {
        initialiserRegistrePratiques();
    }

    // ===============================
    // PRIORITÉ 3 : MODULES LECTEURS
    // Ces modules lisent les données générées par les modules sources
    // ===============================

    // MODULE 09-1: Calendrier scolaire (lit calendrierComplet)
    if (typeof initialiserModuleVueCalendaire === 'function') {
        initialiserModuleVueCalendaire();
    }

    // MODULE 09-2: Saisie des présences (lit seancesCompletes)
    if (typeof initialiserModuleSaisiePresences === 'function') {
        initialiserModuleSaisiePresences();
    }

    // ===============================
    // PRIORITÉ 4 : MODULES AVANCÉS
    // ===============================

    // MODULE 15: Profil étudiant
    if (typeof initialiserModuleProfilEtudiant === 'function') {
        initialiserModuleProfilEtudiant();
    }

    // MODULE 16: Liste des évaluations
    if (typeof initialiserListeEvaluations === 'function') {
        // Note: Initialisation différée lors de l'affichage de la sous-section
    }

    // MODULE 17: Gestion des modes
    if (typeof initialiserSystemeModes === 'function') {
        // Note: initialiserSystemeModes() est appelé automatiquement à la fin de modes.js
        // pour garantir que le système est prêt AVANT les autres modules
    }

    // MODULE: Interventions RàI (Beta 85)
    if (typeof initialiserModuleInterventions === 'function') {
        initialiserModuleInterventions();
    }

    // MODULE: Snapshots progression longitudinale (Beta 93)
    if (typeof initialiserModuleSnapshots === 'function') {
        initialiserModuleSnapshots();
    }

    // ===============================
    // PRIORITÉ 5 : UTILITAIRES
    // ===============================

    // MODULE : Utilitaires
    if (typeof initialiserModuleUtilitaires === 'function') {
        initialiserModuleUtilitaires();
    }

    // MODULE : Import/Export
    if (typeof initialiserModuleImportExport === 'function') {
        initialiserModuleImportExport();
    }

    // ===============================
    // PRIORITÉ 6 : TABLEAU DE BORD (SYNTHÈSE)
    // Doit être initialisé en dernier car il lit toutes les sources
    // ===============================
    
    if (typeof initialiserModuleTableauBordApercu === 'function') {
        initialiserModuleTableauBordApercu();
    }

    if (typeof initialiserModulePresencesApercu === 'function') {
        initialiserModulePresencesApercu();
    }

    if (typeof initialiserModuleEvaluationsApercu === 'function') {
        initialiserModuleEvaluationsApercu();
    }

    // ===============================
    // 3. ÉVÉNEMENTS GLOBAUX
    // ===============================

    // Sélecteur d'étudiant dans le détail individuel
    const selectEtudiant = document.getElementById('select-etudiant');
    if (selectEtudiant) {
        selectEtudiant.addEventListener('change', function () {
            if (typeof chargerDetailEtudiant === 'function') {
                chargerDetailEtudiant(this.value);
            }
        });
    }

    // Délégation des accordéons (remplace 78+ onclick inline)
    document.addEventListener('click', function (e) {
        var header = e.target.closest('.accordeon-header');
        if (header) {
            e.stopPropagation();
            if (typeof toggleAccordeonV2 === 'function') {
                toggleAccordeonV2(header);
            }
        }
    });

    // Délégation générique des actions (remplace onclick inline dans index.html)
    document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-action]');
        if (!el) return;

        var action = el.dataset.action;

        // Confirmation optionnelle
        if (el.dataset.confirm && !confirm(el.dataset.confirm)) return;

        // stopPropagation optionnel
        if (el.hasAttribute('data-stop')) e.stopPropagation();

        // preventDefault optionnel (liens <a> avec data-action)
        if (el.hasAttribute('data-prevent')) e.preventDefault();

        // Résoudre la fonction (supporte dot notation : Codex.actionOuvrir)
        var fn = action.split('.').reduce(function(obj, key) {
            return obj ? obj[key] : undefined;
        }, window);

        if (typeof fn === 'function') {
            // Auto-conversion numérique limitée aux petits nombres (indices).
            // Les DA (7 chiffres), IDs et grands nombres restent strings.
            var _num = function(v) { return v !== '' && !isNaN(v) && Number(v) < 10000 ? Number(v) : v; };
            var param = el.dataset.param;
            var param2 = el.dataset.param2;
            var param3 = el.dataset.param3;
            if (param !== undefined) {
                param = _num(param);
                if (param2 !== undefined) {
                    param2 = _num(param2);
                    if (param3 !== undefined) {
                        param3 = _num(param3);
                        fn(param, param2, param3);
                    } else {
                        fn(param, param2);
                    }
                } else {
                    fn(param);
                }
            } else {
                fn(el);
            }
        } else if (action) {
            console.warn('[data-action] Fonction non trouv\u00e9e : "' + action + '". V\u00e9rifier que le module est charg\u00e9.');
        }
    });

    // Activation clavier des [data-action] rendus focusables artificiellement
    // (ex. <div role="button" tabindex="0"> : cartes d'accueil, demi-cartes).
    // Le dispatcher click ci-dessus n'écoute que la souris ; on simule le clic
    // sur Entrée/Espace via el.click() (réutilise toute la logique de routage).
    // Les éléments nativement activables (button, a, input, textarea, select)
    // gèrent Entrée/Espace eux-mêmes : on ne les double pas.
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        var el = e.target.closest('[data-action]');
        if (!el) return;
        var tag = el.tagName;
        if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (el.getAttribute('role') !== 'button' && !el.hasAttribute('tabindex')) return;
        e.preventDefault(); // évite le défilement sur Espace
        el.click();
    });

    // Délégation change / input / keyup / mousedown (Phase 5 — remplace on* inline)
    ['change', 'input', 'keyup', 'mousedown', 'focusin'].forEach(function(eventType) {
        document.addEventListener(eventType, function(e) {
            var attr = 'data-on-' + eventType;
            var el = e.target.closest('[' + attr + ']');
            if (!el) return;

            var action = el.getAttribute(attr);
            var fn = action.split('.').reduce(function(obj, key) {
                return obj ? obj[key] : undefined;
            }, window);

            if (typeof fn !== 'function') {
                if (action) console.warn('[' + attr + '] Fonction non trouv\u00e9e : "' + action + '".');
                return;
            }

            var param = el.dataset.param;
            var param2 = el.dataset.param2;
            var _num = function(v) { return v !== '' && !isNaN(v) && Number(v) < 10000 ? Number(v) : v; };
            if (param !== undefined) param = _num(param);

            if (param !== undefined && param2 !== undefined) {
                fn(param, param2);
            } else if (param !== undefined) {
                fn(param, el);
            } else {
                fn(el);
            }
        });
    });

    // Délégation fermeture overlay (click sur le fond = fermer la modale)
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-close-on-bg')) {
            var action = e.target.getAttribute('data-close-on-bg');
            var fn = action.split('.').reduce(function(obj, key) {
                return obj ? obj[key] : undefined;
            }, window);
            if (typeof fn === 'function') fn();
        }
    });

    // Délégation dragstart (remplace ondragstart inline)
    document.addEventListener('dragstart', function(e) {
        var el = e.target.closest('[data-drag-data]');
        if (!el) return;
        var data = el.getAttribute('data-drag-data');
        var idx = data.indexOf(':');
        if (idx > -1) {
            e.dataTransfer.setData(data.substring(0, idx), data.substring(idx + 1));
        }
    });

    /**
     * Ferme la modale/overlay la plus proche en remontant le DOM.
     * Usage : data-action="fermerOverlayParent"
     */
    window.fermerOverlayParent = function(el) {
        var overlay = el.closest('.modal-overlay');
        if (overlay) overlay.remove();
    };

    // ===============================
    // 3.5 EXÉCUTION DES MIGRATIONS (Beta 93.5)
    // ===============================
    // Ajouter coursId aux données existantes si nécessaire
    if (typeof executerMigrationsBeta935 === 'function') {
        executerMigrationsBeta935();
    }

    // ===============================
    // 3.6 EXÉCUTION DES MIGRATIONS (Beta 95)
    // ===============================
    // Migrer horaires globaux vers horaires par cours
    if (typeof executerMigrationsBeta95 === 'function') {
        executerMigrationsBeta95();
    }

    // ===============================
    // 3.6b MIGRATION CLÉ PRODUCTIONS (Beta 97)
    // ===============================
    // Copier productionsPedagogiques → productions (clé canonique)
    if (typeof migrerCleProductionsPedagogiques === 'function') {
        migrerCleProductionsPedagogiques();
    }

    // ===============================
    // 3.6b-bis FUSION JOURNÉES SANS COURS (#374, 5 août 2026)
    // ===============================
    // evenementsPrevus + evenementsImprevus → journeesSansCours (tous
    // trimestres). Sans flag : couvre aussi les imports d'archives pré-fusion.
    if (typeof migrerJourneesSansCours === 'function') {
        migrerJourneesSansCours();
    }

    // ===============================
    // 3.6c MIGRATION CLÉS SANS NAMESPACE (Beta 99.01)
    // ===============================
    // Copier indicesPatternsRaI, indicesEvaluation, horaireSelectionne vers clés namespacées
    if (typeof migrerClesSansNamespace === 'function') {
        migrerClesSansNamespace();
    }

    // Renommage description → activiteApprentissage (Beta 99.06)
    if (typeof migrerDescriptionVersActivite === 'function') {
        migrerDescriptionVersActivite();
    }

    // ===============================
    // 3.7 GROUPE DÉMO (Beta 93.5)
    // ===============================
    // ✅ Préchargement automatique supprimé
    // Le groupe démo est maintenant géré via checkbox dans Réglages → Trimestre
    // Voir fonction basculerDonneesDemo() dans trimestre.js

    // ===============================
    // 3.8 RECALCUL INDICES C-P (FALLBACK)
    // ===============================
    // Si db-ready n'a pas été capturé, recalculer après un délai
    setTimeout(() => {
        recalculerIndicesSiDemande();
    }, 1500); // Attendre 1.5s pour s'assurer que tout est chargé

    // ===============================
    // 4. FIN D'INITIALISATION
    // ===============================
});

})();
