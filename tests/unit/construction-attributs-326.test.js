import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 R3 — extracteur PUR « config résolue → attributs de construction par famille ».
// Lignes du tableau du Comparateur (RELAIS §4.3.4) : ancres (pondération / reprises /
// nb de productions) toujours présentes, puis attributs family-specific.
// Constat R1 (RELAIS §4.5) : STD ne porte PAS de jetons côté pratique vivante.

const win = chargerScript('js/pratiques/construction-attributs.js');
const { extraire, AXES_ANCRES } = win.ConstructionAttributs;

const axes = (r) => r.attributs.map(a => a.axe);
const val = (r, axe) => (r.attributs.find(a => a.axe === axe) || {}).valeur;

describe('#326 R3 · ancres toujours présentes (pondération / reprises / nb de productions)', () => {
    it('les 3 ancres ouvrent la liste, dans l\'ordre, marquées ancre:true', () => {
        const r = extraire({ type: 'standards' });
        expect(axes(r).slice(0, 3)).toEqual(AXES_ANCRES);
        expect(r.attributs.slice(0, 3).every(a => a.ancre === true)).toBe(true);
    });

    it('config vide → repli neutre (ancres avec valeurs par défaut, jamais d\'exception)', () => {
        const r = extraire({});
        expect(axes(r).slice(0, 3)).toEqual(AXES_ANCRES);
        // jamais de valeur null/undefined : toujours une chaîne lisible
        expect(r.attributs.every(a => typeof a.valeur === 'string' && a.valeur.length > 0)).toBe(true);
    });
});

describe('#326 R3 · STANDARDS', () => {
    const cfg = {
        type: 'standards',
        echelle: { echelle_nom: 'IDME H26', niveaux: [{}, {}, {}, {}] },
        portfolio: {
            methodeSelection: 'meilleurs', nombreARetenir: 4, minimumCompletion: 8,
            categories: { actif: true, selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } }
        },
        notesFinales: true
    };
    it('pondération par catégories Sélection/Obligatoires', () => {
        expect(val(extraire(cfg), 'ponderation')).toBe('Sélection 65 % / Obligatoires 35 %');
    });
    it('méthode de sélection, composantes, mode note finale, échelle', () => {
        const r = extraire(cfg);
        expect(val(r, 'methodeSelection')).toBe('meilleurs');
        expect(val(r, 'composantes')).toMatch(/catégories/);
        expect(val(r, 'notesFinales')).toMatch(/Oui/);
        expect(val(r, 'echelle')).toBe('IDME H26 (4 niveaux)');
    });
    it('nb de productions = retenus sur minimum', () => {
        expect(val(extraire(cfg), 'nbProductions')).toBe('4 retenu(s) sur 8 minimum');
    });
    it('CONSTAT R1 : STD ne liste PAS de jetons', () => {
        expect(axes(extraire(cfg))).not.toContain('jetons');
        // reprises STD = régime/récence, jamais « jetons »
        expect(val(extraire(cfg), 'reprises')).not.toMatch(/jeton/i);
    });
});

describe('#326 R3 · SPÉCIFICATIONS', () => {
    const cfg = {
        type: 'specifications',
        seuilAcceptabilite: 100,
        tableBundles: [{}, {}, {}],
        jetons: { activer: true, reprise: { nombre: 2 } },
        echelle: { niveaux: [{}, {}, {}] }
    };
    it('reprises = jetons (SPE), seuil d\'acceptabilité, forfaits', () => {
        const r = extraire(cfg);
        expect(val(r, 'reprises')).toMatch(/Jetons de reprise \(2\)/);
        expect(val(r, 'seuilAcceptabilite')).toBe('100 %');
        expect(val(r, 'forfaits')).toBe('3 palier(s)');
    });
    it('nb de productions = types de travaux', () => {
        // typesTravaux absent → libellé générique
        expect(val(extraire(cfg), 'nbProductions')).toMatch(/Forfaits par type|type/);
    });
});

describe('#326 R3 · SOMMATIVE', () => {
    const cfg = { type: 'sommative', configuration: { reprisesPermises: 'limitees' }, reglesSpeciales: ['remplacement', 'plafonnement'] };
    it('pondération par production, reprises (select), règles spéciales', () => {
        const r = extraire(cfg);
        expect(val(r, 'ponderation')).toMatch(/production/i);
        expect(val(r, 'reprises')).toBe('Limitées');
        expect(val(r, 'reglesSpeciales')).toBe('remplacement, plafonnement');
    });
    it('toutes les évaluations comptent ; pas d\'échelle (SOM par design)', () => {
        const r = extraire(cfg);
        expect(val(r, 'nbProductions')).toMatch(/Toutes/);
        expect(axes(r)).not.toContain('echelle');
    });
});

describe('#326 R3 · DÉNOTATION', () => {
    const cfg = { type: 'denotation', objectifs: ['Cible A', 'Cible B', 'Cible C'], suggestion: { methode: 'mediane' } };
    it('reprises s.o., note = jugement saisi, cibles, suggestion', () => {
        const r = extraire(cfg);
        expect(val(r, 'reprises')).toBe('s.o.');
        expect(val(r, 'noteFinale')).toMatch(/[Jj]ugement/);
        expect(val(r, 'nbProductions')).toBe('3 cible(s) d\'apprentissage');
        expect(val(r, 'suggestion')).toBe('mediane');
    });
    it('#343 (b) : échelle/grille DEN affichées comme critères explicites (pas « s.o. »)', () => {
        const r = extraire(cfg);
        // échelle/grille absentes → libellé « optionnelle » + cibles, jamais « s.o. » ni « #343 »
        expect(val(r, 'echelle')).toMatch(/[Oo]ptionnelle|critères/);
        expect(val(r, 'echelle')).not.toMatch(/#343|s\.o\./i);
        expect(val(r, 'grille')).toMatch(/[Oo]ptionnelle|critères/);
    });
    it('#343 (b) : échelle/grille DEN rattachées → affichées (résolues)', () => {
        const cfgMateriel = {
            type: 'denotation', objectifs: ['Cible A'], suggestion: { methode: 'mode' },
            echelle: { echelle_nom: 'IDME H26', niveaux: [{}, {}, {}, {}] },
            configuration: { grilleId: 'GRILLE_X' }
        };
        const r = extraire(cfgMateriel);
        expect(val(r, 'echelle')).toBe('IDME H26 (4 niveaux)');
        expect(val(r, 'grille')).toBe('Rattachée');
        // la note reste un jugement (l'échelle ne calcule pas)
        expect(val(r, 'noteFinale')).toMatch(/[Jj]ugement/);
    });
});
