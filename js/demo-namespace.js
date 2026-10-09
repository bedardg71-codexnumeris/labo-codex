/**
 * demo-namespace.js
 * Chargement permanent des données démo dans le namespace demo_*
 *
 * Plan 1 Phase 1 du chantier PLAN-AUTONOMISATION-UTILISATEUR.md (21 avril 2026).
 * Source : js/pack-demo-10.js (PACK_DEMARRAGE).
 * Cible  : clés localStorage/IDB préfixées demo_*.
 * Flag version : localStorage.demo-version-installee (lit PACK._metadata.version).
 *
 * Principe : la démo vit en permanence dans demo_* dès le premier run, parallèle
 * aux namespaces trimestre réels (h2026_*, a2025_*). Le toggle « Données démo »
 * de l'accueil V3 active/désactive le mode démo via js/demo-activation.js
 * (Phase 5.B/5.C) sans toucher aux clés demo_* permanentes.
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

// ============================================
// CARTE MENTALE DÉMO (alignement pédagogique)
// Écrite dans demo_planification_mindmap par peuplerNamespace.
//
// #970 (9 oct. 2026) — la carte enseigne le geste d'aujourd'hui : chaque leçon
// porte un objectif, l'activité le sert et l'évaluation le COCHE
// (`metadata.objectifsServis`). Les deux liens « se vérifie par » vers une
// évaluation sont retirés : ce geste n'existe plus depuis #964. Les textes des
// objectifs reprennent l'idée maîtresse qui se concrétise dans chaque leçon.
// Une démo déjà installée garde l'ancienne carte jusqu'au prochain pack.
// ============================================

const CARTE_DEMO_ALIGNEMENT = {
    metadata_cc: {
        licence: "CC BY-NC-SA 4.0",
        licence_url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        licence_resume: "Attribution - Pas d'utilisation commerciale - Partage dans les mêmes conditions 4.0 International",
        auteur_original: "Grégoire Bédard",
        email_auteur: "labo@codexnumeris.org",
        site_auteur: "https://codexnumeris.org",
        type: "alignement_pedagogique",
        nom: "Écriture et littérature (démo)",
        date_creation: "2026-02-07",
        date_modification: "2026-02-17",
        version: "2.0",
        description_courte: "Carte démo d'alignement pédagogique pour le cours Écriture et littérature"
    },
    index: {
        active: 'carte_1',
        compteurCartes: 1,
        cartes: [{ id: 'carte_1', nom: 'Écriture et littérature (démo)', dateCreation: '2026-02-07T15:18:14.105Z' }]
    },
    cartes: {
        'carte_1': {
            compteur: 26,
            compteurLiens: 45,
            noeuds: [
                { id: 'planif-noeud_1', type: 'competence', titre: 'Analyser un texte littéraire', description: '', x: -1374.739362305048, y: -167.13476902957674, parent: null, enfants: [], metadata: { niveauCognitif: 'analyser' }, cloneSourceId: null },
                { id: 'planif-noeud_2', type: 'idee-maitresse', titre: 'Mettre en œuvre une posture analytique', description: '', x: -1403.0123338130581, y: 7.585377465095772, parent: null, enfants: [], metadata: { niveauCognitif: 'appliquer' }, cloneSourceId: null },
                { id: 'planif-noeud_19', type: 'idee-maitresse', titre: 'Appliquer différentes stratégies de lecture', description: '', x: -1039.9693420352505, y: 51.23377180784709, parent: null, enfants: [], metadata: { niveauCognitif: 'appliquer' }, cloneSourceId: null },
                { id: 'planif-noeud_20', type: 'idee-maitresse', titre: 'Mettre en œuvre une méthode d’annotation', description: '', x: -1750.4115500096973, y: 52.816054087974415, parent: null, enfants: [], metadata: { niveauCognitif: 'appliquer' }, cloneSourceId: null },
                { id: 'planif-noeud_11', type: 'sequence', titre: 'Semaine 1 (introduction)', description: 'description\n', x: -1626.3487399504672, y: 197.32957752851541, parent: null, enfants: ['planif-noeud_10', 'planif-noeud_9'], metadata: {}, cloneSourceId: null },
                { id: 'planif-noeud_9', type: 'lecon', titre: 'Séance 1 (2 périodes)', description: '', x: -1596.3487399504672, y: 272.3295775285154, parent: 'planif-noeud_11', enfants: ['planif-noeud_7', 'planif-noeud_26', 'planif-noeud_17', 'planif-noeud_12', 'planif-noeud_24'], metadata: { enseignementExplicite: false, objectifs: [{ id: 'obj_demo_1', texte: 'Mettre en œuvre une méthode d’annotation' }] }, cloneSourceId: null },
                { id: 'planif-noeud_10', type: 'lecon', titre: 'Séance 2 (2 périodes)', description: '', x: -1284.9499182684067, y: 278.46050312184747, parent: 'planif-noeud_11', enfants: ['planif-noeud_8', 'planif-noeud_18', 'planif-noeud_3', 'planif-noeud_13', 'planif-noeud_22'], metadata: { objectifs: [{ id: 'obj_demo_2', texte: 'Appliquer différentes stratégies de lecture' }] }, cloneSourceId: null },
                { id: 'planif-noeud_7', type: 'factuelle', titre: 'Distinguer différentes postures de lecture', description: '', x: -1566.3487399504672, y: 347.3295775285154, parent: 'planif-noeud_9', enfants: [], metadata: { prealable: true }, cloneSourceId: null },
                { id: 'planif-noeud_26', type: 'procedurale', titre: 'Appliquer une méthode d’annotation efficace', description: '', x: -1566.3487399504672, y: 492.3295775285154, parent: 'planif-noeud_9', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'planif-noeud_17', type: 'procedurale', titre: 'Noter ses réactions spontanées', description: '', x: -1558.3487399504672, y: 637.3295775285154, parent: 'planif-noeud_9', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'planif-noeud_12', type: 'activite', titre: 'Analyser «Pour que nous puissions vivre»', description: '', x: -1566.3487399504672, y: 762.3295775285154, parent: 'planif-noeud_9', enfants: [], metadata: { objectifsServis: ['obj_demo_1'] }, cloneSourceId: null },
                { id: 'planif-noeud_24', type: 'evaluation', titre: 'Rétroaction formative', description: '', x: -1526.8487399504672, y: 907.3295775285154, parent: 'planif-noeud_9', enfants: [], metadata: { visee: 'formative', objectifsServis: ['obj_demo_1'] }, cloneSourceId: null },
                { id: 'planif-noeud_8', type: 'factuelle', titre: 'Reconnaitre différents procédés littéraires (insistance et opposition)', description: '', x: -1254.9499182684067, y: 353.46050312184747, parent: 'planif-noeud_10', enfants: [], metadata: { prealable: true }, cloneSourceId: null },
                { id: 'planif-noeud_18', type: 'procedurale', titre: 'Observer le paratexte', description: '', x: -1215.4499182684067, y: 518.4605031218475, parent: 'planif-noeud_10', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'planif-noeud_3', type: 'procedurale', titre: 'Observer les motifs et les contrastes', description: '', x: -1254.9499182684067, y: 643.4605031218475, parent: 'planif-noeud_10', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'planif-noeud_13', type: 'activite', titre: 'Annoter le texte «Marine»', description: '', x: -1229.4499182684067, y: 788.4605031218475, parent: 'planif-noeud_10', enfants: [], metadata: { objectifsServis: ['obj_demo_2'] }, cloneSourceId: null },
                { id: 'planif-noeud_22', type: 'evaluation', titre: 'Rétroaction formative', description: '', x: -1215.4499182684067, y: 913.4605031218475, parent: 'planif-noeud_10', enfants: [], metadata: { visee: 'formative', objectifsServis: ['obj_demo_2'] }, cloneSourceId: null }
            ],
            liens: [
                { id: 'planif-lien_38', source: 'planif-noeud_1', cible: 'planif-noeud_2', type: 'se_decline_en' },
                { id: 'planif-lien_18', source: 'planif-noeud_2', cible: 'planif-noeud_19', type: 's_appuie_sur' },
                { id: 'planif-lien_41', source: 'planif-noeud_2', cible: 'planif-noeud_20', type: 's_appuie_sur' },
                { id: 'planif-lien_28', source: 'planif-noeud_2', cible: 'planif-noeud_11', type: 'se_concretise_dans' },
                { id: 'planif-lien_26', source: 'planif-noeud_20', cible: 'planif-noeud_9', type: 'se_concretise_dans' },
                { id: 'planif-lien_27', source: 'planif-noeud_19', cible: 'planif-noeud_10', type: 'se_concretise_dans' },
                { id: 'planif-lien_43', source: 'planif-noeud_7', cible: 'planif-noeud_26', type: 'complete' },
                { id: 'planif-lien_42', source: 'planif-noeud_26', cible: 'planif-noeud_17', type: 'conduit_a' },
                { id: 'planif-lien_32', source: 'planif-noeud_17', cible: 'planif-noeud_12', type: 's_acquiert_par' },
                { id: 'planif-lien_45', source: 'planif-noeud_8', cible: 'planif-noeud_18', type: 'complete' },
                { id: 'planif-lien_35', source: 'planif-noeud_18', cible: 'planif-noeud_3', type: 'complete' },
                { id: 'planif-lien_44', source: 'planif-noeud_3', cible: 'planif-noeud_13', type: 's_acquiert_par' }
            ]
        }
    }
};

/**
 * Helper : retourne une clé du namespace demo.
 * Exemple : cleDemo('groupeEtudiants') → 'demo_groupeEtudiants'.
 */
function cleDemo(nomCollection) {
    return 'demo_' + nomCollection;
}

/**
 * Jeton anti-cache des chargements dynamiques (#825) : le build courant, ou
 * l'instant si `version.js` n'a pas été chargé.
 * @returns {string}
 */
function jetonAntiCache() {
    const v = window.__VERSION__;
    return (v && v.build) ? String(v.build) : String(Date.now());
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
        // #825 (11 sept. 2026) — le dossier `js/` est servi IMMUABLE un an : une URL
        // sans jeton ne changerait plus jamais de contenu chez qui l'a déjà
        // reçue. Ce chemin n'est dans aucune balise <script> d'index.html,
        // donc ni release.mjs ni le garde #547 ne le voient : le jeton est le
        // BUILD courant (version.js, chargé en premier). Il change à chaque
        // release même si le pack n'a pas bougé — 0,6 Mo, seulement chez qui
        // active la démo ; assumé, contre un régime de lecture de plus dans
        // release.mjs. Repli `Date.now()` si version.js manque : jamais une
        // URL nue. La sentinelle #825 refuse un chargement dynamique sans `?v=`.
        script.src = 'js/pack-demo-10.js?v=' + jetonAntiCache();
        script.onload = function() {
            resolve(typeof PACK_DEMARRAGE !== 'undefined' ? PACK_DEMARRAGE : null);
        };
        script.onerror = function() {
            console.error('[DEMO-INIT] Échec chargement pack-demo-10.js');
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

    // Collections directement issues du pack.
    // Note : 'presences' est traité séparément plus bas — le pack le stocke
    // en objet {date: {da: data}} mais tous les lecteurs (indices, aperçu)
    // attendent un tableau [{date, da, ...}]. Le legacy fusionnerDonneesDemo
    // convertissait ; Phase 1 doit le faire aussi.
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
        'dureePeriode',
        'pratiquesConfigurables'
    ];

    for (let i = 0; i < collectionsDuPack.length; i++) {
        const nom = collectionsDuPack[i];
        if (pack[nom] !== undefined) {
            let valeur = pack[nom];
            // 🆕 #464/CO-02 (21 août 2026) : estampiller isDemo:true sur chaque item
            // du pack À L'ÉCRITURE du namespace démo. Sans le flag, estItemDemo()
            // rendait false pour les modèles du pack (aucun item ne portait isDemo,
            // 2 seulement portaient l'auteur « Demo Labo Codex ») — la moitié
            // « lookup » de la garde anti-référence-démo était inerte. Patron
            // « identité + flag » du retrait démo (skill integrite-globaux §3.3).
            if (Array.isArray(valeur)) {
                valeur = valeur.map(item =>
                    (item && typeof item === 'object' && item.id) ? Object.assign({}, item, { isDemo: true }) : item
                );
            }
            db.setSync(cleDemo(nom), valeur);
        }
    }

    // Présences : conversion objet → tableau (comme le legacy)
    if (pack.presences !== undefined) {
        let presencesArr = [];
        if (Array.isArray(pack.presences)) {
            presencesArr = pack.presences;
        } else if (typeof pack.presences === 'object' && pack.presences !== null) {
            Object.keys(pack.presences).forEach(function(date) {
                const parDA = pack.presences[date] || {};
                Object.keys(parDA).forEach(function(da) {
                    presencesArr.push(Object.assign({ date: date, da: da }, parDA[da]));
                });
            });
        }
        db.setSync(cleDemo('presences'), presencesArr);
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
        auteur: 'Demo Labo Codex'
    }]);

    // Enseignant démo : une entrée dans demo_enseignants.
    db.setSync(cleDemo('enseignants'), [{
        id: 'ENS_DEMO',
        prenom: 'Primo',
        nom: 'Primavera',
        courriel: '',
        isDemo: true,
        auteur: 'Demo Labo Codex'
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
        auteur: 'Demo Labo Codex',
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
            pratiqueId: 'demo-std-litt',
            actif: true,
            isDemo: true,
            auteur: 'Demo Labo Codex',
            dateCreation: (pack._metadata && pack._metadata.date) || '2026-02-06'
        }]);
    }

    // Carte mentale démo (alignement pédagogique).
    // Constante définie plus haut dans ce module depuis Phase 5.A.
    db.setSync(cleDemo('planification_mindmap'), CARTE_DEMO_ALIGNEMENT);
}

/**
 * Initialisation idempotente du namespace demo_*.
 * - Au premier run : charge le pack et peuple demo_*
 * - Aux runs suivants : compare la version du pack au flag demo-version-installee ;
 *   refresh si différent, no-op sinon
 * - Ne touche JAMAIS les clés globales ou les namespaces trimestre réels
 */
async function initialiserDemoNamespace() {
    try {
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
window.CARTE_DEMO_ALIGNEMENT = CARTE_DEMO_ALIGNEMENT;

})();
