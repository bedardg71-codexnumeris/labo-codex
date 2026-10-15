/**
 * #684 (15 oct. 2026, décision de Grégoire à 11 h 20, issue (A)) — LES ANCIENS NOMS DU MATÉRIEL
 * DE DÉPART, RATTRAPÉS UNE FOIS, AU CARACTÈRE PRÈS.
 *
 *   A. un ancien libellé écrit par le code devient le nouveau, dans chaque trimestre (archivés
 *      compris) et dans la cartouche ;
 *   B. un nom retouché d'un seul caractère, ou choisi par l'usager, n'est jamais touché ;
 *   C. la condition est revérifiée DANS le mutateur ;
 *   D. idempotente : un second passage n'écrit rien ;
 *   E. le drapeau : le boot le teste et le pose ; l'ouverture d'un codex qui ne le porte pas
 *      le retire (la migration rejoue), un codex qui le porte le garde.
 * Table et condition : scripts/renommage-682-materiel-seme.js. Aucun nom d'élève.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

function monter(store, { avantEcriture } = {}) {
    const ecrites = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        modifier: async (k, mutateur, d = null) => {
            if (avantEcriture) avantEcriture(store);
            const r = await mutateur(k in store ? clone(store[k]) : d);
            if (r !== undefined) { store[k] = clone(r); ecrites.push(k); }
            return r;
        }
    };
    const w = {};
    new Function('window', 'db', tranche(source('js/main.js'),
        '/* ===============================\n   #684', '// IDs des gabarits hardcodés', { longueurMin: 800 }))(w, db);
    return { w, ecrites };
}

const TRIM = [{ id: 'a2025', archive: true }, { id: 'a2026', actif: true }];
const nomDe = (store, cle, id) => store[cle].find((o) => o.id === id).nom;

describe('#684 · les anciens noms du matériel de départ', () => {
    it('A · les trois anciens libellés deviennent les nouveaux, dans chaque trimestre', async () => {
        const store = {
            trimestres: TRIM,
            a2025_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            // La grille de l'usager vient EN PREMIER : une recherche par nom la trouverait avant celle du code.
            a2026_grillesTemplates: [{ id: 'G_MOI', nom: 'Grille générique (exemple)' }, { id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            a2026_echellesTemplates: [{ id: 'ECHELLE_IDME_DEPART', nom: 'Échelle IDME (point de départ)' }],
            a2026_cartouches_GRILLE_GENERIQUE: [{ id: 'CART_GENERIQUE', nom: 'Cartouche générique (exemple)' }]
        };
        const { w } = monter(store);
        const { renommes } = await w.migrerNomsMaterielDeDepart684();
        expect(renommes).toHaveLength(4);
        expect(nomDe(store, 'a2025_grillesTemplates', 'GRILLE_GENERIQUE')).toBe('Grille de départ');
        expect(nomDe(store, 'a2026_grillesTemplates', 'GRILLE_GENERIQUE')).toBe('Grille de départ');
        expect(nomDe(store, 'a2026_grillesTemplates', 'G_MOI'), 'l\'identité décide, pas le nom').toBe('Grille générique (exemple)');
        expect(nomDe(store, 'a2026_echellesTemplates', 'ECHELLE_IDME_DEPART')).toBe('Échelle de départ (IDME)');
        expect(nomDe(store, 'a2026_cartouches_GRILLE_GENERIQUE', 'CART_GENERIQUE')).toBe('Cartouche de départ');
    });

    it('B · un nom retouché d\'un seul caractère, ou choisi par l\'usager, reste', async () => {
        const store = {
            trimestres: TRIM,
            a2025_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple) ' }],
            a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'grille générique (exemple)' }],
            a2026_echellesTemplates: [{ id: 'ECHELLE_IDME_DEPART', nom: 'Mon IDME' }]
        };
        const avant = clone(store);
        const { w, ecrites } = monter(store);
        expect((await w.migrerNomsMaterielDeDepart684()).renommes).toEqual([]);
        expect(ecrites).toEqual([]);
        expect(store).toEqual(avant);
    });

    it('C · renommé par l\'usager entre la lecture et l\'écriture : la file ne touche à rien', async () => {
        const store = { trimestres: TRIM, a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }] };
        const { w, ecrites } = monter(store, { avantEcriture: (s) => { s.a2026_grillesTemplates[0].nom = 'Ma grille'; } });
        expect((await w.migrerNomsMaterielDeDepart684()).renommes).toEqual([]);
        expect(ecrites).toEqual([]);
        expect(store.a2026_grillesTemplates[0].nom).toBe('Ma grille');
    });

    it('D · idempotente : le second passage n\'écrit rien', async () => {
        const store = { trimestres: TRIM, a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }] };
        const { w, ecrites } = monter(store);
        await w.migrerNomsMaterielDeDepart684();
        expect(ecrites).toHaveLength(1);
        expect((await w.migrerNomsMaterielDeDepart684()).renommes).toEqual([]);
        expect(ecrites).toHaveLength(1);
    });
});

describe('#684 · le drapeau', () => {
    const FLAG = 'migration_noms_materiel_depart_684_20261015_done';

    function monterLanceur(store, { panne } = {}) {
        const db = {
            getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = clone(v); },
            flush: async () => {},
            modifier: async (k, mutateur, d = null) => {
                if (panne) throw new Error('panne');
                const r = await mutateur(k in store ? clone(store[k]) : d);
                if (r !== undefined) store[k] = clone(r);
                return r;
            }
        };
        const w = { dateLocaleYMD: () => '2026-10-15' };
        new Function('window', 'db', tranche(source('js/main.js'),
            '/* ===============================\n   #684', '// IDs des gabarits hardcodés', { longueurMin: 800 }))(w, db);
        return w;
    }
    const ANCIEN = () => ({ trimestres: TRIM, a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }] });

    it('E · sans drapeau : migre, puis pose le drapeau daté', async () => {
        const store = ANCIEN(); const w = monterLanceur(store);
        expect(w.FLAG_MIGRATION_NOMS_MATERIEL_684).toBe(FLAG);
        const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await w.lancerMigrationNomsMateriel684();
        avert.mockRestore();
        expect(store.a2026_grillesTemplates[0].nom).toBe('Grille de départ');
        expect(store[FLAG]).toBe('2026-10-15');
    });

    it('E · drapeau posé : rien ne bouge', async () => {
        const store = { ...ANCIEN(), [FLAG]: '2026-10-15' }; const w = monterLanceur(store);
        await w.lancerMigrationNomsMateriel684();
        expect(store.a2026_grillesTemplates[0].nom).toBe('Grille générique (exemple)');
    });

    it('E · une erreur ne pose pas le drapeau : réessai au prochain démarrage', async () => {
        const store = ANCIEN(); const w = monterLanceur(store, { panne: true });
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        await w.lancerMigrationNomsMateriel684();
        err.mockRestore();
        expect(FLAG in store).toBe(false);
    });

    it('E · le démarrage l\'appelle, après la migration des cartouches', () => {
        const main = source('js/main.js');
        const appel = main.indexOf('        await window.lancerMigrationNomsMateriel684();');
        expect(appel).toBeGreaterThan(main.indexOf('async function auDbReady'));
        expect(appel).toBeGreaterThan(main.indexOf("if (!db.getSync('migration_cartouches_namespacees_done', false))"));
    });

    async function ouvrirCodex(donnees) {
        const retires = [];
        const corps = tranche(source('js/codex.js'), 'async function _drapeau684SuitLeCodex', '/**', { longueurMin: 150 });
        const w = { FLAG_MIGRATION_NOMS_MATERIEL_684: FLAG };
        const db = { remove: async (k) => { retires.push(k); } };
        await new Function('window', 'db', 'donnees', corps + '\nreturn _drapeau684SuitLeCodex(donnees);')(w, db, donnees);
        return retires;
    }

    it('E · un codex sans le drapeau le retire : la migration rejouera', async () => {
        expect(await ouvrirCodex({ a2026_grillesTemplates: [] })).toEqual([FLAG]);
    });

    it('E · un codex qui le porte le garde', async () => {
        expect(await ouvrirCodex({ [FLAG]: '2026-10-15' })).toEqual([]);
    });

    it('E · l\'ouverture d\'un codex l\'appelle, après la boucle d\'écriture', () => {
        const corps = tranche(source('js/codex.js'), 'async function chargerCodex', '// 3. Synchroniser le cache localStorage', { longueurMin: 400 });
        expect(corps.indexOf('await _drapeau684SuitLeCodex(donnees);')).toBeGreaterThan(corps.indexOf('await db.set(cleEntree, valeurEntree);'));
    });
});
