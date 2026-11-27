// LES PHRASES DU PARCOURS 3 APRÈS LES TROIS FAMILLES (27 NOV. 2026 ; mandat du lot `lot/familles-cum-hyb-2026-11-27`,
// textes 26 à 28, rapport : plans de travail/RAPPORT-2026-11-27-familles-cum-hyb.md). « Sommative » s'appelle
// « Cumulative » (CUM) et « Par sélection de productions » s'appelle « Hybride » (HYB). Les textes du parcours ont été
// validés par Grégoire le 18 et le 22 nov. ; seuls ces mots changent. Les sentinelles des deux temps du parcours 3 lisent
// leurs consignes d'origine, puis y appliquent ces retouches : chacune doit trouver sa ligne.
//
// ⚠ Les mots neufs sont PROPOSÉS (Grégoire peut les corriger avant la fusion) : s'il les corrige, c'est ici et dans
// js/parcours-evaluer.js qu'ils changent, nulle part ailleurs.

/** Repère, ancienne phrase, nouvelle phrase (sans point final : la retouche s'applique avec ou sans lui). */
export const RETOUCHES_27_NOV_PARCOURS = Object.freeze([
    { repere: 'T26a', avant: 'la plus répandue : la notation sommative, qu\'on appelle aussi cumulative',
        apres: 'la plus répandue : la notation cumulative, qu\'on appelle aussi sommative' },
    // La ligne suivante a deux formes d'origine : « Je regarde » (18 nov., retouchée le 22) et « Nous faisons » (20 nov.).
    { repere: 'T26b', avant: 'Ici, le mot ne parle pas du moment de l\'évaluation (en fin d\'apprentissage, par opposition à formative) mais de la façon dont la note se construit : en faisant la « somme » des résultats aux productions antérieures, ou le « cumul » de leurs points',
        apres: 'Ici, « sommative » ne parle pas du moment de l\'évaluation (en fin d\'apprentissage, par opposition à formative) mais de la façon dont la note se construit : par le « cumul » des points, ou leur « somme »' },
    { repere: 'T26c', avant: 'Ici, le mot ne parle pas du moment de l\'évaluation (par opposition à formative) mais de la façon dont la note se construit',
        apres: 'Ici, « sommative » ne parle pas du moment de l\'évaluation (en fin d\'apprentissage, par opposition à formative) mais de la façon dont la note se construit : par le « cumul » des points, ou leur « somme »' },
    { repere: 'T27', avant: 'Le code à côté du nom dit sa famille : SOM pour la sommative, SEL pour la sélection de productions, STD pour les standards',
        apres: 'Le code à côté du nom dit sa famille : CUM pour la cumulative, HYB pour l\'hybride, STD pour les standards' },
    { repere: 'T28a', avant: 'L\'exemple prend « N meilleures évaluations », par sélection de productions :',
        apres: 'L\'exemple prend « N meilleures évaluations », une pratique hybride :' },
    { repere: 'T28b', avant: 'Le récapitulatif dit sa famille et ce qu\'elle fait : « Par sélection de productions »',
        apres: 'Le récapitulatif dit sa famille et ce qu\'elle fait : « Hybride »' }
]);

/**
 * Applique les retouches du 27 nov. à des lignes de consigne. Une retouche s'applique à une ligne qui contient son ancienne
 * phrase (mise à plat par `aPlat`, comme le reste de la sentinelle) ; rend les lignes et les repères servis.
 */
export function retoucherLignes27(lignes, aPlat, reperes) {
    const servies = new Set();
    const choisies = RETOUCHES_27_NOV_PARCOURS.filter((r) => !reperes || reperes.includes(r.repere));
    const sortie = lignes.map((l) => choisies.reduce((neuve, r) => {
        const avant = aPlat(r.avant), apres = aPlat(r.apres);
        if (!neuve.includes(avant)) return neuve;
        servies.add(r.repere);
        return neuve.replace(avant, apres);
    }, l));
    return { lignes: sortie, servies: [...servies].sort() };
}
