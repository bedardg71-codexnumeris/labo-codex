// « L'en-tête épuré » (7 nov. 2026) — les ONGLETS de la navigation secondaire portent des libellés
// courts (js/config.js) ; les TITRES des pages gardent leur libellé long (consigne de Grégoire :
// « Change seulement les onglets ; les titres des pages gardent leur libellé long »).
//
// L'Aide, les catalogues d'accompagnement et les fiches nomment une page par son titre long
// (« Suivi → Saisie des présences »). Les sentinelles qui vérifiaient « le chemin cité est un
// libellé de config.js » acceptent donc, pour chaque sous-section renommée, le libellé de l'onglet
// OU le titre long de la page. Ce registre est le seul endroit où les titres longs sont recopiés ;
// sentinelle-en-tete-epure-2026-11-07.test.js vérifie que chacun existe encore dans l'application.
// Les sous-sections dont l'onglet n'a pas changé n'y sont pas.

export const TITRES_LONGS = {
    conception: {
        materiel: 'Apporter mon matériel',
        carte: "Carte d'alignement",
        productions: 'Productions étudiantes',
        'grille-criteres': 'Grilles de critères',
        'echelle-performance': 'Échelles de performance',
        retroactions: 'Cartouches de rétroaction',
        'pratiques-notation': 'Pratiques de notation',
    },
    calendrier: { vue: 'Calendrier scolaire' },
    suivi: {
        groupe: 'Suivi du groupe',
        liste: 'Liste des étudiant·es',
        saisie: 'Saisie des présences',
        profil: 'Profils individuels',
    },
    evaluations: {
        importer: 'Préparer et importer',
        liste: 'Liste des évaluations',
        annoter: 'Annoter et évaluer',
        exporter: 'Exporter les travaux',
    },
    labo: {
        accompagnement: "Outils d'observation",
        comparateur: 'Exploration des pratiques',
        rythme: 'Rythme de travail',
        bilan: 'Bilan réflexif',
    },
};

/** Les titres longs d'une section, dans l'ordre de config.js (liste vide si aucun). */
export function titresLongsDe(section) {
    // L'Aide et les catalogues écrivent l'apostrophe droite ou typographique (« Outils d’observation »).
    const titres = Object.values(TITRES_LONGS[section] || {});
    return [...new Set([...titres, ...titres.map((t) => t.replace(/'/g, '’'))])];
}

/** Le titre long d'une sous-section, ou null si son onglet n'a pas été raccourci. */
export function titreLong(section, id) {
    return (TITRES_LONGS[section] || {})[id] || null;
}

/**
 * Les TITRES des pages d'une section, dans l'ordre des onglets de config.js : le titre long quand
 * l'onglet a été raccourci, le libellé de l'onglet sinon. `cfg` : le texte de js/config.js.
 */
export function titresDesPagesDansLOrdre(cfg, section) {
    const bloc = cfg.match(new RegExp(`'${section}': \\[([\\s\\S]*?)\\]`))[1];
    return [...bloc.matchAll(/\{ id: '([^']+)', label: (["'])(.*?)\2 \}/g)].map((m) => titreLong(section, m[1]) || m[3]);
}
