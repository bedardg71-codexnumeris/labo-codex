import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot P4 — sentinelles de la section « Partagés ».
// Couvre la DUPLICATION vers les documents de l'utilisateur (par type, avec
// dépendances : grille → cartouches, production → grille → cartouches,
// cartouche → sa grille entière) et les deux invariants :
//  1. les collections partage_* ne sont JAMAIS modifiées par une duplication
//     (lecture seule par construction) ;
//  2. la copie suit les conventions des dupliquer* existants (id neuf,
//     auteur actif, dansBibliotheque, metadata_cc retiré, inspireDe conservé).
// Le rendu de la section dans les 5 modales est couvert en Playwright.

function fauxDb() {
    const donnees = {};
    return {
        _donnees: donnees,
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k)
                ? JSON.parse(JSON.stringify(donnees[k]))
                : defaut;
        },
        setSync(k, v) {
            donnees[k] = JSON.parse(JSON.stringify(v));
        }
    };
}

let db;
let w;
let compteurIds;

function charger() {
    db = fauxDb();
    compteurIds = 0;
    w = chargerScript('js/partage-section.js', {
        db,
        genererIdUnique: (prefixe) => prefixe + 'NEUF_' + (++compteurIds),
        getCleProductions: () => 'h2026_productions',
        alert: () => {}
    });
    w.cle = (k) => 'h2026_' + k;
    w.BibliothequeUI = {
        obtenirAuteurActif: () => 'Grégoire',
        formaterTitre: (n) => n,
        renderCarteDisponible: (opts) => '[carte:' + opts.nom + ':' + opts.boutonPrincipal.label + ']'
    };
    return w;
}

function poserPartages() {
    db.setSync('partage_grilles', [{
        id: 'PARTAGE_abc_GR_X', nom: 'Grille partagée',
        criteres: [{ id: 'C1', nom: 'Structure' }],
        metadata_cc: { auteur_original: 'Marie', licence: 'CC BY-NC-SA 4.0' },
        inspireDe: { nom: 'Grille partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'GR_X' }
    }]);
    db.setSync('partage_cartouches', [{
        id: 'PARTAGE_abc_CART_1', grilleId: 'PARTAGE_abc_GR_X', nom: 'Cartouche liée',
        inspireDe: { nom: 'Cartouche liée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'CART_1' }
    }]);
    db.setSync('partage_productions', [{
        id: 'PARTAGE_abc_PROD_1', titre: 'Dissertation', grilleId: 'PARTAGE_abc_GR_X',
        inspireDe: { nom: 'Dissertation', auteur: 'Marie', date: '2026-06-10', idOriginal: 'PROD_1' }
    }]);
    db.setSync('partage_echelles', [{
        id: 'PARTAGE_abc_ECH_1', nom: 'Échelle partagée', niveaux: [{ code: 'M', nom: 'Maîtrisé' }],
        inspireDe: { nom: 'Échelle partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'ECH_1' }
    }]);
    db.setSync('partage_pratiques', [{
        id: 'PARTAGE_abc_PR_1', nom: 'STD partagée', configuration: {},
        inspireDe: { nom: 'STD partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'PR_1' }
    }]);
}

function instantanePartages() {
    return JSON.stringify(['partage_grilles', 'partage_cartouches', 'partage_productions',
        'partage_echelles', 'partage_pratiques'].map(k => db.getSync(k, [])));
}

beforeEach(() => {
    charger();
    poserPartages();
});

describe('lot P4 · sentinelle exports', () => {
    it('expose l\'API attendue sur window.partageSection', () => {
        ['genererSectionHTML', 'dupliquer', 'dupliquerVersMesDocuments'].forEach(nom => {
            expect(w.partageSection[nom], nom).toBeTypeOf('function');
        });
    });
});

describe('lot P4 · duplication grille (avec cartouches)', () => {
    it('copie la grille dans cle(grillesTemplates) avec les conventions de duplication', () => {
        const avant = instantanePartages();
        const r = w.partageSection.dupliquerVersMesDocuments('grille', 'PARTAGE_abc_GR_X');

        const grilles = db.getSync('h2026_grillesTemplates', []);
        expect(grilles).toHaveLength(1);
        const copie = grilles[0];
        expect(copie.id).toBe('GRILLE_NEUF_1');
        expect(copie.auteur).toBe('Grégoire');
        expect(copie.dansBibliotheque).toBe(true);
        expect(copie.metadata_cc).toBeUndefined();
        // La trace de provenance (D7) est CONSERVÉE — c'est l'attribution CC.
        expect(copie.inspireDe).toEqual({
            nom: 'Grille partagée', auteur: 'Marie', date: '2026-06-10', idOriginal: 'GR_X'
        });
        expect(r.idNouveau).toBe('GRILLE_NEUF_1');
        expect(r.libelle).toContain('1 cartouche');

        // Invariant : les partagés sont intacts (lecture seule).
        expect(instantanePartages()).toBe(avant);
    });

    it('duplique les cartouches partagées de la grille dans cartouches_{nouvelId}, grilleId remappé', () => {
        w.partageSection.dupliquerVersMesDocuments('grille', 'PARTAGE_abc_GR_X');
        const cartouches = db.getSync('cartouches_GRILLE_NEUF_1', []);
        expect(cartouches).toHaveLength(1);
        expect(cartouches[0].id).toMatch(/^CART_NEUF_/);
        expect(cartouches[0].grilleId).toBe('GRILLE_NEUF_1');
        expect(cartouches[0].inspireDe.idOriginal).toBe('CART_1');
    });
});

describe('lot P4 · duplication cartouche → sa grille entière', () => {
    it('duplique la grille parente avec toutes ses cartouches', () => {
        const r = w.partageSection.dupliquerVersMesDocuments('cartouche', 'PARTAGE_abc_CART_1');
        expect(r).not.toBeNull();
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(1);
        expect(db.getSync('cartouches_' + r.idNouveau, [])).toHaveLength(1);
    });

    it('cartouche orpheline (grille parente absente des partagés) → null, rien d\'écrit', () => {
        db.setSync('partage_grilles', []);
        const r = w.partageSection.dupliquerVersMesDocuments('cartouche', 'PARTAGE_abc_CART_1');
        expect(r).toBeNull();
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(0);
    });
});

describe('lot P4 · duplication production (avec sa grille partagée)', () => {
    it('copie la production + sa grille + les cartouches, grilleId remappé', () => {
        const r = w.partageSection.dupliquerVersMesDocuments('production', 'PARTAGE_abc_PROD_1');
        const productions = db.getSync('h2026_productions', []);
        const grilles = db.getSync('h2026_grillesTemplates', []);
        expect(productions).toHaveLength(1);
        expect(grilles).toHaveLength(1);
        expect(productions[0].grilleId).toBe(grilles[0].id);
        expect(db.getSync('cartouches_' + grilles[0].id, [])).toHaveLength(1);
        expect(r.libelle).toContain('avec sa grille');
    });

    it('grilleId partagé introuvable → référence vidée (jamais de pointeur vers partage_*)', () => {
        db.setSync('partage_grilles', []);
        w.partageSection.dupliquerVersMesDocuments('production', 'PARTAGE_abc_PROD_1');
        const productions = db.getSync('h2026_productions', []);
        expect(productions[0].grilleId).toBe('');
    });
});

describe('lot P4 · duplication échelle et pratique', () => {
    it('échelle → cle(echellesTemplates) ; pratique → cle(pratiquesConfigurables)', () => {
        w.partageSection.dupliquerVersMesDocuments('echelle', 'PARTAGE_abc_ECH_1');
        w.partageSection.dupliquerVersMesDocuments('pratique', 'PARTAGE_abc_PR_1');
        expect(db.getSync('h2026_echellesTemplates', [])).toHaveLength(1);
        expect(db.getSync('h2026_pratiquesConfigurables', [])).toHaveLength(1);
    });

    it('id introuvable → null, aucun effet', () => {
        const avant = instantanePartages();
        expect(w.partageSection.dupliquerVersMesDocuments('echelle', 'FANTOME')).toBeNull();
        expect(db.getSync('h2026_echellesTemplates', [])).toHaveLength(0);
        expect(instantanePartages()).toBe(avant);
    });
});

describe('lot P4 · rendu de la section', () => {
    it('chaîne vide quand aucun item partagé du type (la section n\'apparaît pas)', () => {
        db.setSync('partage_grilles', []);
        expect(w.partageSection.genererSectionHTML('grille')).toBe('');
    });

    it('rend le titre de section + une carte par item, bouton Dupliquer', () => {
        const html = w.partageSection.genererSectionHTML('grille');
        expect(html).toContain('Partagés par des collègues');
        expect(html).toContain('[carte:Grille partagée:Dupliquer vers mes documents]');
    });

    it('cartouche : bouton « Dupliquer avec sa grille »', () => {
        const html = w.partageSection.genererSectionHTML('cartouche');
        expect(html).toContain('Dupliquer avec sa grille');
    });
});
