import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Sentinelle #682 — LE RENOMMAGE N'ÉCRIT QUE SUR UNE ÉGALITÉ STRICTE.
//
// Option (b), tranchée par Grégoire le 1er septembre 2026 : renommer uniquement
// les libellés qui portent encore, AU CARACTÈRE PRÈS, un texte écrit par le code.
//
// ⚠⚠ CE BANC GARDE UNE CONDITION D'ÉCRITURE, PAS UNE PRÉCAUTION. Ce script écrit
// dans les données de quelqu'un. Un nom hors de la liste des libellés du code lui
// appartient — et ça vaut le jour où ce script tournera chez UN AUTRE
// utilisateur, dont on ne connaît ni les habitudes ni les renommages. C'est pour
// ce cas-là que les assertions ci-dessous sont écrites, pas pour le corpus
// d'aujourd'hui, où la sonde a rendu 5 sur 5 et zéro nom personnel.
//
// Break-test du 1er septembre, sur la source EN MÉMOIRE : remplacer l'égalité
// stricte par un `toLowerCase()`, par un `startsWith`, ou retirer la
// revérification dans le mutateur — B rougit dans les trois cas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const SRC = readFileSync(path.join(racineProjet, 'scripts', 'renommage-682-materiel-seme.js'), 'utf8');

function bac(store) {
    const db = {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        keys: async () => Object.keys(store),
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const r = await mutateur(lue);
            if (r === undefined) return undefined;
            store[c] = r;
            return r;
        }
    };
    const b = { window: {}, console: { log: () => {}, table: () => {} }, db };
    b.globalThis = b;
    vm.createContext(b);
    vm.runInContext(SRC, b);
    return b;
}

const TRIM = [{ id: 'a2026', actif: true }, { id: 'h2026', actif: false }];

describe('#682 · le renommage n\'écrit que sur une égalité stricte', () => {

    it('A · en mode par défaut, il n\'écrit RIEN — même quand il y a à faire', async () => {
        const store = {
            trimestres: TRIM, ressourcesSupprimees: [],
            a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            h2026_grillesTemplates: [], a2026_echellesTemplates: [], h2026_echellesTemplates: []
        };
        const avant = JSON.stringify(store);
        const b = bac(store);
        const r = await b.window.renommage682();
        expect(r.aFaire.length, 'il devrait AVOIR quelque chose à faire').toBe(1);
        expect(r.ecrit).toBe(0);
        expect(JSON.stringify(store), 'le mode par défaut a écrit').toBe(avant);
    });

    it('B · ⛔ un nom CHOISI par l\'utilisateur n\'est jamais réécrit, même approchant', async () => {
        // Quatre pièges : la casse, un espace, un préfixe, une vraie personnalisation.
        // Aucun n'est STRICTEMENT égal à un libellé du code : aucun ne doit bouger.
        const pieges = [
            'grille générique (exemple)',        // casse
            'Grille générique (exemple) ',       // espace final
            'Grille générique (exemple) — FR',   // préfixe commun
            'Ma grille de littérature'           // le sien
        ];
        for (const nom of pieges) {
            const store = {
                trimestres: TRIM, ressourcesSupprimees: [],
                a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: nom }],
                h2026_grillesTemplates: [], a2026_echellesTemplates: [], h2026_echellesTemplates: []
            };
            const b = bac(store);
            const r = await b.window.renommage682({ executer: true });
            expect(r.ecrit, 'a réécrit « ' + nom +' »').toBe(0);
            expect(store.a2026_grillesTemplates[0].nom, '« ' + nom + ' » a été touché').toBe(nom);
            expect(r.intouchables.length, '« ' + nom + ' » n\'est pas rangé parmi les intouchables').toBe(1);
        }
    });

    it('C · un libellé du code, lui, est renommé — et le compte avant/après le dit', async () => {
        const store = {
            trimestres: TRIM, ressourcesSupprimees: [],
            a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            h2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            a2026_echellesTemplates: [{ id: 'ECHELLE_IDME_DEPART', nom: 'Échelle IDME (point de départ)' }],
            h2026_echellesTemplates: []
        };
        const b = bac(store);
        const r = await b.window.renommage682({ executer: true });
        expect(r.ecrit).toBe(3);
        expect(store.a2026_grillesTemplates[0].nom).toBe('Grille de départ');
        expect(store.h2026_grillesTemplates[0].nom).toBe('Grille de départ');
        expect(store.a2026_echellesTemplates[0].nom).toBe('Échelle de départ (IDME)');
        // Le compte avant/après est PUBLIÉ : c'est un geste sur un corpus réel,
        // il doit pouvoir se vérifier ligne à ligne.
        expect(r.avantApres.length).toBe(3);
        for (const l of r.avantApres) {
            expect(l).toHaveProperty('avant');
            expect(l).toHaveProperty('apres');
            expect(l).toHaveProperty('ou');
        }
    });

    it('D · relancé, il ne réécrit rien — l\'opération est idempotente', async () => {
        const store = {
            trimestres: TRIM, ressourcesSupprimees: [],
            a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            h2026_grillesTemplates: [], a2026_echellesTemplates: [], h2026_echellesTemplates: []
        };
        const b = bac(store);
        await b.window.renommage682({ executer: true });
        const apresPremier = JSON.stringify(store);
        const r2 = await b.window.renommage682({ executer: true });
        expect(r2.ecrit).toBe(0);
        expect(JSON.stringify(store)).toBe(apresPremier);
    });

    it('F · ⚡ LA COURSE — un renommage arrivé entre la lecture et l\'écriture est respecté', async () => {
        // ⚠ CE CAS A ÉTÉ AJOUTÉ APRÈS UN BREAK-TEST QUI N'A PAS MORDU. Retirer la
        // revérification DANS le mutateur ne changeait rien aux cinq tests
        // ci-dessus : le nom personnel y est déjà écarté à la lecture. La seconde
        // ligne de défense n'existe que pour la course — l'utilisateur qui renomme
        // dans un autre onglet, ou un auto-save qui passe — et une règle que
        // personne ne fait rougir n'est pas une règle verrouillée.
        const store = {
            trimestres: TRIM, ressourcesSupprimees: [],
            a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille générique (exemple)' }],
            h2026_grillesTemplates: [], a2026_echellesTemplates: [], h2026_echellesTemplates: []
        };
        const db = {
            get: async (c) => (c in store ? store[c] : null),
            getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
            keys: async () => Object.keys(store),
            modifier: async (c, mutateur, defaut = null) => {
                // La course : le nom change juste avant que le mutateur ne le voie.
                if (c === 'a2026_grillesTemplates') store[c][0].nom = 'Ma grille à moi';
                const r = await mutateur(c in store ? store[c] : defaut);
                if (r === undefined) return undefined;
                store[c] = r;
                return r;
            }
        };
        const b = { window: {}, console: { log: () => {}, table: () => {} }, db };
        b.globalThis = b;
        vm.createContext(b);
        vm.runInContext(SRC, b);
        const r = await b.window.renommage682({ executer: true });
        expect(r.ecrit, 'un nom posé pendant la course a été écrasé').toBe(0);
        expect(store.a2026_grillesTemplates[0].nom).toBe('Ma grille à moi');
    });

    it('E · il dit les absences PAR TRIMESTRE, et distingue le tombstone du semis jamais passé', async () => {
        const store = {
            trimestres: TRIM,
            ressourcesSupprimees: ['GRILLE_GENERIQUE'],
            a2026_grillesTemplates: [],
            h2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille de départ' }],
            a2026_echellesTemplates: [], h2026_echellesTemplates: []
        };
        const b = bac(store);
        const r = await b.window.renommage682();
        const gA = r.absencesParTrimestre.find(a => a.id === 'GRILLE_GENERIQUE' && a.trimestre === 'a2026');
        expect(gA, 'l\'absence dans a2026 n\'est pas rapportée').toBeTruthy();
        expect(gA.tombstone, 'le tombstone global n\'est pas signalé').toBe('OUI');
        expect(gA.ailleurs, 'la présence ailleurs n\'est pas signalée').toBe('oui');
        // Une échelle absente PARTOUT et sans tombstone se distingue de la grille.
        const eA = r.absencesParTrimestre.find(a => a.id === 'ECHELLE_IDME_DEPART' && a.trimestre === 'a2026');
        expect(eA.tombstone).toBe('non');
        expect(eA.ailleurs).toBe('nulle part');
    });
});
