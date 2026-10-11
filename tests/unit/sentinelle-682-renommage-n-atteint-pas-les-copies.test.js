import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Sentinelle #682 — LE RENOMMAGE DU §3 N'ATTEINT PAS LES COPIES DÉJÀ SEMÉES.
//
// Trouvé en préparant la porte terrain du §3, le 1er septembre 2026 : le code
// porte « Échelle de départ (IDME) », l'écran de Grégoire affiche « Échelle IDME
// (point de départ) » — le nom d'avant.
//
// LE MÉCANISME, mesuré sous WebKit sur deux passages de la même base : le semis
// est idempotent PAR IDENTIFIANT. `assurerEchelleIdmeDeDepart` et
// `assurerGrilleDeDepart` vérifient la présence de l'id dans le mutateur et
// sortent sans écrire si l'objet est là. Ils ne recréent pas, DONC ILS NE
// RENOMMENT JAMAIS. Un espace neuf reçoit le nom neuf ; une base déjà semée
// garde l'ancien, indéfiniment.
//
// ⮕ Un lot de libellés qui n'atteint que les espaces neufs n'est pas livré, il
// est semé. Ce banc GARDE LE FAIT — il ne le corrige pas : renommer une copie en
// base, c'est écrire dans les données de quelqu'un, et c'est une décision de
// Grégoire. `scripts/sonde-682-materiel-seme-noms.js` lui rend le compte.
//
// ⚠ CE BANC DOIT ÊTRE REVU, PAS SUPPRIMÉ, le jour où cette décision est prise.
// Si l'assertion A rougit, c'est que quelque chose renomme désormais les copies :
// vérifier que c'est voulu, et que les noms CHOISIS par l'utilisateur sont
// épargnés — c'est la seule chose qui ne se négocie pas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        keys: async () => Object.keys(store)
    };
}

describe('#682 · le semis ne renomme pas ce qui est déjà là', () => {

    it('A · une base portant l\'ANCIEN nom le garde — le §3 n\'atteint que les espaces neufs', async () => {
        const store = {
            a2026_echellesTemplates: [{
                id: 'ECHELLE_IDME_DEPART',
                nom: 'Échelle IDME (point de départ)',   // le nom d'avant le §3
                niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 }]
            }]
        };
        const win = chargerScript('js/echelles.js',
            { db: dbDepuisStore(store), cle: (k) => 'a2026_' + k },
            { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false });

        await win.assurerEchelleIdmeDeDepart();

        expect(store.a2026_echellesTemplates.length, 'un doublon a été semé').toBe(1);
        expect(store.a2026_echellesTemplates[0].nom,
            'le semis a renommé une copie en base — vérifier que c\'est VOULU et que les noms '
            + 'choisis par l\'utilisateur sont épargnés').toBe('Échelle IDME (point de départ)');
    });

    it('B · un espace NEUF, lui, reçoit bien le nom du §3 — les deux faits coexistent', async () => {
        const store = {};
        const win = chargerScript('js/echelles.js',
            { db: dbDepuisStore(store), cle: (k) => 'a2026_' + k },
            { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false });
        await win.assurerEchelleIdmeDeDepart();
        expect(store.a2026_echellesTemplates[0].nom).toBe('Échelle de départ (IDME)');
    });

    it('C · la sonde est ATTEIGNABLE, sépare les trois cas, et n\'écrit rien', async () => {
        // Le geste est « coller le fichier puis appeler » : on l'éprouve tel quel.
        const src = readFileSync(path.join(racineProjet, 'scripts', 'sonde-682-materiel-seme-noms.js'), 'utf8');
        const store = {
            trimestres: [{ id: 'a2026', nom: 'A26', actif: true }],
            ressourcesSupprimees: ['GRILLE_GENERIQUE'],
            a2026_echellesTemplates: [{ id: 'ECHELLE_IDME_DEPART', nom: 'Mon échelle à moi' }],
            a2026_grillesTemplates: []
        };
        const avant = JSON.stringify(store);
        const bac = { window: {}, console: { log: () => {}, table: () => {} }, db: dbDepuisStore(store) };
        bac.globalThis = bac;
        vm.createContext(bac);
        vm.runInContext(src, bac);

        expect(typeof bac.window.sonde682, 'la sonde ne s\'expose pas sous le nom annoncé').toBe('function');
        const r = await bac.window.sonde682();

        // ⛔ LA SÉPARATION QUI COMPTE : un nom choisi par l'utilisateur ne doit
        // JAMAIS tomber dans le tas des « renommables ».
        expect(r.aToi.map(l => l.id), 'un nom choisi par l\'utilisateur n\'est pas reconnu comme tel')
            .toEqual(['ECHELLE_IDME_DEPART']);
        expect(r.aRenommer, 'un nom personnel a été rangé parmi les renommables').toEqual([]);

        // Une absence expliquée par un tombstone est NOMMÉE comme telle : c'est la
        // durabilité qui fonctionne, pas un défaut.
        const grille = r.absents.find(a => a.id === 'GRILLE_GENERIQUE');
        expect(grille, 'la grille absente n\'est pas rapportée').toBeTruthy();
        expect(grille.cause).toMatch(/tombstone tient/);

        // Lecture seule : le magasin est intact, octet pour octet.
        expect(JSON.stringify(store), 'la sonde a ÉCRIT dans le magasin').toBe(avant);
    });

    it('D · une absence SANS tombstone reste une absence — la sonde n\'invente pas de cause', async () => {
        const src = readFileSync(path.join(racineProjet, 'scripts', 'sonde-682-materiel-seme-noms.js'), 'utf8');
        const store = { trimestres: [{ id: 'a2026', actif: true }], ressourcesSupprimees: [],
                        a2026_echellesTemplates: [], a2026_grillesTemplates: [] };
        const bac = { window: {}, console: { log: () => {}, table: () => {} }, db: dbDepuisStore(store) };
        bac.globalThis = bac;
        vm.createContext(bac);
        vm.runInContext(src, bac);
        const r = await bac.window.sonde682();
        for (const a of r.absents) {
            expect(a.cause, 'une cause a été inventée pour ' + a.id).toMatch(/cause inconnue/);
        }
    });
});
