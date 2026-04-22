/**
 * demo-namespace.js
 * Chargement permanent des données démo dans le namespace demo_*
 *
 * Plan 1 Phase 1 du chantier PLAN-AUTONOMISATION-UTILISATEUR.md (21 avril 2026).
 * Source : js/pack-demo-20.js (PACK_DEMARRAGE).
 * Cible  : clés localStorage/IDB préfixées demo_*.
 * Flag version : localStorage.demo-version-installee (lit PACK._metadata.version).
 *
 * Principe : la démo vit en permanence dans demo_* dès le premier run, parallèle
 * aux namespaces trimestre réels (h2026_*, a2025_*). Le toggle « Données démo »
 * de l'accueil V3 ne fait QUE piloter l'affichage dans les sélecteurs (Phase 2).
 * Il ne charge ni ne décharge plus de données — ce rôle de snapshot/décharge
 * assuré par donnees-demo.js sera retiré en Phase 5.
 *
 * Ce module est INVISIBLE en Phase 1 : il peuple silencieusement demo_* mais
 * aucune UI ne lit encore ces clés. Les sélecteurs à 2 sections (Phase 2)
 * exposeront ces données au utilisateur.
 *
 * Contraintes respectées :
 *  - AUCUNE écriture sur les clés globales (trimestres, listeCours, cours,
 *    enseignants, grillesTemplates, echellesTemplates, cartouches_*, etc.)
 *  - AUCUNE écriture sur les namespaces trimestre réels (h2026_*, a2025_*)
 *  - Idempotent via flag de version
 *  - Attribution « Demo Labo Codex » posée dès l'init sur chaque entité
 *    structurante (pour préparer Phase 3)
 */
(function() {
'use strict';

const CLE_VERSION = 'demo-version-installee';

/**
 * Helper : retourne une clé du namespace demo.
 * Exemple : cleDemo('groupeEtudiants') → 'demo_groupeEtudiants'.
 */
function cleDemo(nomCollection) {
    return 'demo_' + nomCollection;
}

/**
 * Lazy-load du pack démo si PACK_DEMARRAGE n'est pas en mémoire.
 * Retourne l'objet pack ou null en cas d'échec.
 */
function chargerPackDemarrage() {
    return new Promise(function(resolve) {
        if (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) {
            resolve(PACK_DEMARRAGE);
            return;
        }
        const script = document.createElement('script');
        script.src = 'js/pack-demo-20.js';
        script.onload = function() {
            resolve(typeof PACK_DEMARRAGE !== 'undefined' ? PACK_DEMARRAGE : null);
        };
        script.onerror = function() {
            console.error('[DEMO-INIT] Échec chargement pack-demo-20.js');
            resolve(null);
        };
        document.head.appendChild(script);
    });
}

/**
 * Peuple le namespace demo_* avec toutes les données du pack.
 * Écrit uniquement dans demo_*, ne touche aucune clé globale.
 */
function peuplerNamespace(pack) {
    if (!pack) return;

    // Collections directement issues du pack
    const collectionsDuPack = [
        'listeCours',
        'cadreCalendrier',
        'horaireHebdo',
        'groupeEtudiants',
        'productions',
        'evaluationsSauvegardees',
        'grillesTemplates',
        'echellesTemplates',
        'modalitesEvaluation',
        'presences'
    ];

    for (let i = 0; i < collectionsDuPack.length; i++) {
        const nom = collectionsDuPack[i];
        if (pack[nom] !== undefined) {
            db.setSync(cleDemo(nom), pack[nom]);
        }
    }

    // Trimestre démo : une entrée dans demo_trimestres (parallèle à la liste
    // globale `trimestres`, qui reste exclusivement pour les trimestres réels).
    db.setSync(cleDemo('trimestres'), [{
        id: 'demo',
        nom: 'Démonstration',
        session: 'D',
        annee: '2025',
        actif: false,
        isDemo: true,
        auteur: 'Labo Codex'
    }]);

    // Enseignant démo : une entrée dans demo_enseignants.
    db.setSync(cleDemo('enseignants'), [{
        id: 'ENS_DEMO',
        prenom: 'Primo',
        nom: 'Primavera',
        courriel: '',
        isDemo: true,
        auteur: 'Labo Codex'
    }]);

    // Horaire démo.
    db.setSync(cleDemo('horaires'), [{
        id: 'HOR_DEMO',
        nom: 'Lun-AM / Mer-PM',
        groupeAssocie: '0demo',
        periodesParSeance: 2,
        seances: [
            { id: 'SEANCE_DEMO_A', lettre: 'A', jour: 'Lundi',    heureDebut: '11:00', heureFin: '12:40', nombrePeriodes: 2, duree: 2, local: '2309' },
            { id: 'SEANCE_DEMO_B', lettre: 'B', jour: 'Mercredi', heureDebut: '13:00', heureFin: '14:40', nombrePeriodes: 2, duree: 2, local: '1709' }
        ],
        isDemo: true,
        auteur: 'Labo Codex',
        dateCreation: (pack._metadata && pack._metadata.date) || '2026-02-06'
    }]);

    // Groupe-cours démo.
    const premierCoursDemo = (pack.listeCours || [])[0];
    if (premierCoursDemo) {
        db.setSync(cleDemo('groupesCours'), [{
            id: 'GC_DEMO',
            nom: 'DEMO-' + (premierCoursDemo.sigle || '601-101') + '-MQ-0demo (Lun-AM / Mer-PM)',
            trimestreId: 'demo',
            coursId: premierCoursDemo.id,
            groupeNum: '0demo',
            horaireId: 'HOR_DEMO',
            enseignantId: 'ENS_DEMO',
            pratiqueId: null,
            actif: true,
            isDemo: true,
            auteur: 'Labo Codex',
            dateCreation: (pack._metadata && pack._metadata.date) || '2026-02-06'
        }]);
    }

    // Note : CARTE_DEMO_ALIGNEMENT (carte mentale) vit pour l'instant dans
    // donnees-demo.js (var locale). Sa migration vers demo_planification_mindmap
    // se fera en Phase 5, au moment du retrait complet de donnees-demo.js.
}

/**
 * Initialisation idempotente du namespace demo_*.
 * - Au premier run : charge le pack et peuple demo_*
 * - Aux runs suivants : compare la version du pack au flag demo-version-installee ;
 *   refresh si différent, no-op sinon
 * - Ne touche JAMAIS les clés globales ou les namespaces trimestre réels
 * - Attend brièvement si donnees-demo.js nettoie des résidus en async (évite
 *   une race condition où dechargerDonneesDemo supprimerait nos écritures)
 */
async function initialiserDemoNamespace() {
    try {
        // Attente défensive : si l'ancien système a détecté un résidu (demo-actif
        // = 'true') et est en train de le nettoyer en async, laisser 1 s pour
        // que dechargerDonneesDemo termine avant qu'on réécrive demo_*.
        if (typeof db !== 'undefined' && db.getSync('demo-actif', null) === 'true') {
            console.warn('[DEMO-INIT] Résidus de l\'ancien système détectés, attente 1 s avant init');
            await new Promise(function(r) { setTimeout(r, 1000); });
        }

        let versionInstallee = null;
        try { versionInstallee = localStorage.getItem(CLE_VERSION); } catch (e) { /* storage indisponible */ }

        let pack = null;
        if (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) {
            pack = PACK_DEMARRAGE;
        } else {
            pack = await chargerPackDemarrage();
        }

        if (!pack) {
            console.warn('[DEMO-INIT] Pack démo indisponible, namespace demo_* non initialisé');
            return;
        }

        const versionPack = (pack._metadata && pack._metadata.version) || '0';

        if (versionInstallee === versionPack) {
            // Déjà à jour, rien à refresh
            return;
        }

        peuplerNamespace(pack);

        try { localStorage.setItem(CLE_VERSION, versionPack); } catch (e) { /* storage indisponible */ }

        const message = versionInstallee
            ? 'rafraîchi depuis ' + versionInstallee
            : 'première installation';
        console.warn('[DEMO-INIT] Namespace demo_* initialisé (version ' + versionPack + ', ' + message + ')');
    } catch (e) {
        console.error('[DEMO-INIT] Erreur:', e);
    }
}

// ============================================
// Exports
// ============================================

window.cleDemo = cleDemo;
window.initialiserDemoNamespace = initialiserDemoNamespace;

})();
