import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Axe D — Exploration des pratiques (#326), lot D-1.
// `diffConfigsPratiques` (pur) balaie l'objet config et liste les différences ;
// `phraseEffetPourDiff` les traduit en « ce que ça change » (repli neutre) ;
// `diffPratiques` combine les deux sur deux enveloppes {id, nom, config}.
// Invariants visés (SPEC §6) : symétrie diff(A,B)/diff(B,A), repli neutre,
// et SURVIE au « non calculable » (le diff est statique, jamais de calcul).

function charger() {
    return chargerScript('js/pratiques/pratiques-exploration.js');
}

const CONFIG_A = {
    type: 'standards',
    systeme_reprises: { type: 'limitees', niveau_retrogradable: false },
    structure_evaluations: { ponderation: 'egale' },
    calcul_note: { methode: 'conversion_niveaux' }
};
const CONFIG_B = {
    type: 'standards',
    systeme_reprises: { type: 'illimitees', niveau_retrogradable: true },
    structure_evaluations: { ponderation: 'ponderee' },
    calcul_note: { methode: 'conversion_niveaux', conditions_speciales: [{ type: 'plafonnement' }] }
};

describe('Exploration des pratiques · diff de config (D-1)', () => {
    it('liste les différences par chemin (modification + ajout)', () => {
        const { ExplorationPratiques } = charger();
        const diff = ExplorationPratiques.diffConfigsPratiques(CONFIG_A, CONFIG_B);
        const parChemin = Object.fromEntries(diff.map((d) => [d.chemin, d]));

        expect(parChemin['systeme_reprises.type'].type).toBe('modification');
        expect(parChemin['systeme_reprises.type'].valeurA).toBe('limitees');
        expect(parChemin['systeme_reprises.type'].valeurB).toBe('illimitees');
        expect(parChemin['systeme_reprises.niveau_retrogradable'].type).toBe('modification');
        expect(parChemin['structure_evaluations.ponderation'].type).toBe('modification');
        // conditions_speciales n'existe que dans B → ajout (tableau comparé en bloc)
        expect(parChemin['calcul_note.conditions_speciales'].type).toBe('ajout');
        // `type` identique des deux côtés → absent du diff
        expect(parChemin['type']).toBeUndefined();
    });

    it('est symétrique : diff(B,A) est le miroir de diff(A,B)', () => {
        const { ExplorationPratiques } = charger();
        const ab = ExplorationPratiques.diffConfigsPratiques(CONFIG_A, CONFIG_B);
        const ba = ExplorationPratiques.diffConfigsPratiques(CONFIG_B, CONFIG_A);

        expect(ba.map((d) => d.chemin)).toEqual(ab.map((d) => d.chemin)); // même tri
        const miroir = { ajout: 'retrait', retrait: 'ajout', modification: 'modification' };
        ab.forEach((d) => {
            const inverse = ba.find((x) => x.chemin === d.chemin);
            expect(inverse.type).toBe(miroir[d.type]);
            expect(inverse.valeurA).toEqual(d.valeurB);
            expect(inverse.valeurB).toEqual(d.valeurA);
        });
    });

    it('traduit les réglages connus et retombe sur le neutre sinon', () => {
        const { ExplorationPratiques } = charger();
        const phrase = (entry) => ExplorationPratiques.phraseEffetPourDiff(entry);

        expect(phrase({ chemin: 'systeme_reprises.type', type: 'modification', valeurA: 'limitees', valeurB: 'illimitees' }))
            .toMatch(/illimitées/);
        expect(phrase({ chemin: 'systeme_reprises.niveau_retrogradable', type: 'modification', valeurA: false, valeurB: true }))
            .toMatch(/redescendre/);
        expect(phrase({ chemin: 'calcul_note.conditions_speciales', type: 'ajout' }))
            .toMatch(/condition particulière/i);
        // chemin inconnu → repli neutre, jamais d'échec
        expect(phrase({ chemin: 'un.chemin.inconnu', type: 'modification', valeurA: 1, valeurB: 2 }))
            .toBe('Réglage modifié.');
        expect(phrase(null)).toBe('Réglage modifié.');
    });

    it('décrit le passage à la dénotation (DEN, jugement saisi)', () => {
        const { ExplorationPratiques } = charger();
        const phrase = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'calcul_note.methode', type: 'modification', valeurA: 'conversion_niveaux', valeurB: 'jugement_global' }
        );
        expect(phrase).toMatch(/jugement que tu poses/);
    });

    it('survit au « non calculable » : une config DEN sans note se diffe quand même', () => {
        const { ExplorationPratiques } = charger();
        // Une config DEN n'a pas de note simulable — le diff reste purement structurel.
        const den = { type: 'denotation', modeDEN: 'eliminee', calcul_note: { methode: 'jugement_global' }, suggestion: { methode: 'mode' } };
        const std = { type: 'standards', calcul_note: { methode: 'conversion_niveaux' } };
        const diff = ExplorationPratiques.diffPratiques({ config: std }, { config: den });
        const chemins = diff.map((d) => d.chemin);
        expect(chemins).toContain('type');
        expect(chemins).toContain('modeDEN');
        // chaque entrée porte une phrase d'effet (jamais vide)
        expect(diff.every((d) => typeof d.effet === 'string' && d.effet.length > 0)).toBe(true);
    });

    it('diffPratiques renvoie une liste vide pour deux pratiques identiques', () => {
        const { ExplorationPratiques } = charger();
        expect(ExplorationPratiques.diffPratiques({ config: CONFIG_A }, { config: CONFIG_A })).toEqual([]);
    });

    // — Mapping affiné (15 juin) : sélection portfolio, normalisation
    //   `configuration.*`, modes DEN lisibles, nombre d'artefacts directionnel.
    it('décrit la méthode de sélection du portfolio selon la valeur', () => {
        const { ExplorationPratiques } = charger();
        const phrase = (v) => ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'portfolio.methodeSelection', type: 'modification', valeurA: 'meilleurs', valeurB: v }
        );
        expect(phrase('recents')).toMatch(/récents/);
        expect(phrase('tous')).toMatch(/toutes les démonstrations/i);
        expect(phrase('meilleurs')).toMatch(/meilleures démonstrations/i);
    });

    it('retrouve la règle même quand le chemin est niché sous configuration.', () => {
        const { ExplorationPratiques } = charger();
        const plat = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'portfolio.methodeSelection', type: 'modification', valeurA: 'meilleurs', valeurB: 'recents' }
        );
        const niche = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'configuration.portfolio.methodeSelection', type: 'modification', valeurA: 'meilleurs', valeurB: 'recents' }
        );
        expect(niche).toBe(plat);
        expect(niche).not.toBe('Réglage modifié.');
    });

    it('rend les modes de dénotation lisibles (éliminée/réduite/différée)', () => {
        const { ExplorationPratiques } = charger();
        const phrase = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'modeDEN', type: 'modification', valeurA: 'reduite', valeurB: 'eliminee' }
        );
        expect(phrase).toMatch(/réduite/);
        expect(phrase).toMatch(/éliminée/);
    });

    it('indique le sens du changement du nombre d\'artefacts retenus', () => {
        const { ExplorationPratiques } = charger();
        const moins = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'portfolio.nombreARetenir', type: 'modification', valeurA: 5, valeurB: 3 }
        );
        const plus = ExplorationPratiques.phraseEffetPourDiff(
            { chemin: 'portfolio.nombreARetenir', type: 'modification', valeurA: 3, valeurB: 5 }
        );
        expect(moins).toMatch(/[Mm]oins d'artefacts/);
        expect(plus).toMatch(/[Pp]lus d'artefacts/);
    });

    it('ne cadre jamais un réglage en « plus/moins sévère » (anti palmarès)', () => {
        const { ExplorationPratiques } = charger();
        // Balaie toutes les phrases produites par le mapping sur un échantillon
        // représentatif : aucune ne doit employer le registre de la générosité.
        const echantillons = [
            { chemin: 'systeme_reprises.type', type: 'modification', valeurA: 'limitees', valeurB: 'illimitees' },
            { chemin: 'systeme_reprises.niveau_retrogradable', type: 'modification', valeurA: false, valeurB: true },
            { chemin: 'structure_evaluations.ponderation', type: 'modification', valeurA: 'egale', valeurB: 'ponderee' },
            { chemin: 'calcul_note.conditions_speciales', type: 'ajout' },
            { chemin: 'portfolio.methodeSelection', type: 'modification', valeurA: 'meilleurs', valeurB: 'recents' },
            { chemin: 'notesFinales', type: 'modification', valeurA: false, valeurB: true }
        ];
        const interdits = /(sévèr|généreu|indulgen|laxis|plus haute|plus basse|gonfle|\bavantage\b)/i;
        echantillons.forEach((e) => {
            expect(ExplorationPratiques.phraseEffetPourDiff(e)).not.toMatch(interdits);
        });
    });
});
