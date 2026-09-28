import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 3a (30 août 2026) — LA COLLECTION DES PRODUCTIONS.
//
// Dix-huit sites, cinq fichiers, lisaient `cle('productions')`, y changeaient une
// entrée, puis réécrivaient la collection ENTIÈRE.
//
// ⚠⚠ ET LA CLÉ S'ÉCRIT DE DEUX FAÇONS. `getCleProductions()` REND
// `cle('productions')`, et `cleProductions` est une locale qui vaut la même
// chose. Une lecture par l'une et une écriture par l'autre, dans la même
// fonction, passent pour deux clés différentes à l'œil comme au grep — et la
// course devient invisible. C'est ce qui a failli faire sous-compter ce lot.
//
// ⮕ TROIS SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE : `sauvegarderProduction`
// (la question du doublon), `supprimerProductionActive` et
// `supprimerProductionDefinitivement` (une confirmation). La collection lue AVANT
// la question écrasait tout ce qui s'était enregistré pendant.
//
// ⮕ ET UN DÉFAUT DESTRUCTEUR, LATENT, FERMÉ ICI : `descendreEvaluation` testait
// `index < evaluations.length - 1`. Pour un id introuvable, `index` vaut -1 et
// ce test est VRAI : l'échange écrivait `evaluations[0] = undefined`, puis
// l'enregistrait. Non atteignable depuis les chevrons (l'id vient de la ligne
// affichée), donc jamais vu — mais il détruisait une production.
//
// ⚠⚠ LE BANC : chemin IndexedDB rétabli ET clone structuré. Sans le clone, deux
// lecteurs partagent le même tableau et le break-test refuse de rougir.

/* ------------------------------------------------------------------ harnais */

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined;
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            disque.set(record.key, fige);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = [...disque].map(([key, value]) => ({ key, value: cloner(value) }));
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                }
            };
            const tx = { objectStore: () => store };
            return tx;
        }
    };
}

async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

// ⚠ Ici le document doit rendre des ÉLÉMENTS, pas `null` : les rafraîchissements
// d'affichage de productions.js écrivent dans `innerHTML` sans garde. Un
// document qui rend `null` ferait un rouge de BANC, pas un défaut — et ce
// fichier mesure des ÉCRITURES EN BASE, pas du rendu.
function elementInerte() {
    const el = {
        innerHTML: '', textContent: '', value: '', style: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        dataset: {},
        setAttribute() {}, getAttribute: () => null, removeAttribute() {},
        appendChild() {}, insertAdjacentHTML() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => elementInerte(), querySelectorAll: () => [],
        closest: () => null, focus() {}, click() {}
    };
    return el;
}

function fauxDocument() {
    return {
        getElementById: () => elementInerte(),
        querySelector: () => elementInerte(),
        querySelectorAll: () => [],
        body: elementInerte(),
        createElement: () => elementInerte(),
        addEventListener() {}, removeEventListener() {}
    };
}

async function monterProductions() {
    const db = await monterDb();
    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => 'a2026_' + k });
    chargerScript('js/productions.js', {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'PROD_') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: fauxDocument(),
        obtenirDonneesSelonMode: () => null,
        obtenirIdentiteCCUtilisateur: () => 'banc',
        // ⚠ Appelées en identifiant NU (pas `window.x`), donc à injecter dans les
        // globaux : les poser sur le sandbox rendu ne suffit pas. Elles vivent
        // dans productions-liste.js, hors de ce banc.
        // Déclarée dans js/config.js, chargé avant productions.js en production.
        productionEnEdition: null,
        afficherListeProductions: async () => {},
        chargerProductionPourModif: async () => {},
        annulerFormProduction: () => {},
        mettreAJourPonderationTotale: async () => {}
    }, win);

    // Aides d'affichage appelées par les rafraîchissements : hors sujet ici,
    // mais leur absence ferait un rouge de BANC, pas un défaut.
    win.boutonsReordonnerBloc = () => '';
    win.calculerEtStockerIndicesCP = () => {};
    win.afficherListeProductions = async () => {};

    for (const f of ['monterEvaluation', 'descendreEvaluation', 'verrouillerEvaluation',
                     'typerProductionCommeTerminale']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const CLE = 'a2026_productions';

const PRODUCTIONS = () => ([
    { id: 'P1', titre: 'Analyse', type: 'examen', ponderation: 25 },
    { id: 'P2', titre: 'Dissertation', type: 'examen', ponderation: 25 },
    { id: 'P3', titre: 'Portfolio', type: 'portfolio', ponderation: 50 }
]);

const idsDe = (liste) => liste.map((p) => p.id).join(',');

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 3a · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a deux verrouillages concurrents tiennent tous les deux', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.verrouillerEvaluation('P1'), win.verrouillerEvaluation('P3')]);

        const liste = await db.get(CLE);
        expect(liste.find((p) => p.id === 'P1').verrouille, 'le premier verrou tient').toBe(true);
        expect(liste.find((p) => p.id === 'P3').verrouille, 'le second verrou tient').toBe(true);
    });

    it('A.b un déplacement et un verrouillage concurrents ne s\'écrasent pas', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.monterEvaluation('P2'), win.verrouillerEvaluation('P3')]);

        const liste = await db.get(CLE);
        expect(idsDe(liste), 'le déplacement tient').toBe('P2,P1,P3');
        expect(liste.find((p) => p.id === 'P3').verrouille, 'le verrou tient').toBe(true);
    });

    it('A.c une descente et une suppression concurrentes s\'appliquent toutes les deux', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.descendreEvaluation('P1'), win.supprimerProduction('P3')]);

        const liste = await db.get(CLE);
        expect(idsDe(liste), 'les deux effets survivent').toBe('P2,P1');
        expect(liste.every((p) => p && p.id), 'aucune entrée `undefined`').toBe(true);
    });

    it('A.d un typage et un verrouillage concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.typerProductionCommeTerminale('P1').catch(() => {}),
            win.verrouillerEvaluation('P3')
        ]);

        const liste = await db.get(CLE);
        expect(liste.find((p) => p.id === 'P1').type, 'le typage tient').toBe('terminale');
        expect(liste.find((p) => p.id === 'P3').verrouille, 'le verrou tient').toBe(true);
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#522 lot 3a · B — le geste impossible REFUSE, et ne détruit RIEN', () => {

    it('B.a descendreEvaluation sur un id INTROUVABLE ne détruit plus la première production', async () => {
        // ⚠ LE DÉFAUT FERMÉ PAR CE LOT. `index` valait -1, la condition
        // `index < length - 1` était VRAIE, et l'échange écrivait
        // `evaluations[0] = undefined` avant d'enregistrer.
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await win.descendreEvaluation('P_FANTOME');

        const liste = await db.get(CLE);
        expect(JSON.stringify(liste), 'la collection est intacte').toBe(JSON.stringify(PRODUCTIONS()));
        expect(liste[0], 'la première production n\'est pas devenue `undefined`').toBeTruthy();
    });

    it('B.b descendreEvaluation sur la DERNIÈRE ne réécrit rien', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await win.descendreEvaluation('P3');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(PRODUCTIONS()));
    });

    it('B.c monterEvaluation sur la PREMIÈRE et sur un id absent ne réécrit rien', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await win.monterEvaluation('P1');
        await win.monterEvaluation('P_FANTOME');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(PRODUCTIONS()));
    });

    it('B.e deux typages concurrents ne créent QU\'UNE terminale', async () => {
        // ⚠ CE CAS NE MESURE PAS LA COURSE, et c'est assumé : privée de sa file,
        // `db.modifier` perd la première écriture, si bien qu'une seule terminale
        // survit AUSSI sur le code cassé — le témoin ne le fait pas rougir. Ce
        // qu'il verrouille, c'est le GARDE « une seule terminale » rejoué DANS le
        // mutateur : la mutation qui le retire, elle, le fait rougir.
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.typerProductionCommeTerminale('P1').catch(() => {}),
            win.typerProductionCommeTerminale('P2').catch(() => {})
        ]);

        const terminales = (await db.get(CLE)).filter((p) => p.type === 'terminale');
        expect(terminales, 'une seule terminale').toHaveLength(1);
    });

    it('B.d verrouillerEvaluation sur un id absent ne touche à rien', async () => {
        const { db, win } = await monterProductions();
        await db.set(CLE, PRODUCTIONS());   // security-ok: littéral de banc, aucune source externe

        await win.verrouillerEvaluation('P_FANTOME');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(PRODUCTIONS()));
    });
});

/* ------------------------------------------------- C — le cliquet du lot 3a */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

// Les DEUX écritures de la même clé. Toute assertion qui n'en verrait qu'une
// laisserait la moitié du lot se rouvrir en silence.
const CLES = [
    /db\.set\(\s*getCleProductions\(\)/g,
    /db\.set\(\s*cleProductions\b/g,
    /db\.set\(\s*cle\('productions'\)/g
];

const FICHIERS = [
    'js/productions.js',
    'js/productions-liste.js',
    'js/productions-bibliotheque-ui.js',
    'js/productions-import-export.js',
    'js/pratiques-gestion.js'
];

describe('#522 lot 3a · C — la course ne peut pas se rouvrir en silence', () => {

    it('C.a plus AUCUN db.set sur la collection des productions, sous AUCUNE de ses écritures', () => {
        for (const f of FICHIERS) {
            const src = lire(f);
            for (const motif of CLES) {
                expect((src.match(motif) || []).length, `${f} : ${motif}`).toBe(0);
            }
        }
    });

    it('C.b chaque fichier écrit par la file', () => {
        for (const f of FICHIERS) {
            expect(lire(f), `${f} : aucune écriture par la file`)
                .toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(\s*(getCleProductions\(\)|cleProductions\b|cle\('productions'\))/);
        }
    });

    it('C.c la seule écriture directe restante est NOMMÉE, et sa raison tient', () => {
        // `importerProductionsExternes` est SYNCHRONE et rend un compteur : la
        // rendre asynchrone changerait son contrat, donc ses appelants. Même
        // motif que `importerPratiquesExternes` (lot 1) et
        // `importerEchellesExternes` (lot 2b).
        const src = lire('js/productions-liste.js');
        const directes = (src.match(/db\.setSync\(\s*(getCleProductions\(\)|cleProductions\b|cle\('productions'\))/g) || []).length;
        expect(directes, 'une seule, dans importerProductionsExternes').toBe(1);
        // ⚠ Elle est ASSIGNÉE à `window`, pas déclarée : chercher
        // « function importerProductionsExternes » rendait -1, donc un faux rouge.
        const debut = src.indexOf('window.importerProductionsExternes');
        expect(debut, 'importerProductionsExternes introuvable').toBeGreaterThan(-1);
        expect(src.slice(debut, debut + 3000)).toMatch(/db\.setSync\(/);
    });

    it('C.d descendreEvaluation refuse explicitement l\'index -1', () => {
        // La condition `index < length - 1` seule était VRAIE pour -1. Le refus
        // doit être écrit, pas déduit.
        const src = lire('js/productions.js');
        const debut = src.indexOf('function descendreEvaluation(');
        expect(debut, 'descendreEvaluation introuvable').toBeGreaterThan(-1);
        const corps = src.slice(debut, debut + 1500);
        expect(corps, 'le refus de l\'index -1 n\'est pas écrit').toMatch(/index === -1/);
    });

    it('C.e les trois fenêtres d\'attente humaine écrivent DANS la file', () => {
        const cas = {
            'js/productions.js': 'sauvegarderProduction',
            'js/productions-liste.js': 'supprimerProductionActive',
            'js/productions-bibliotheque-ui.js': 'supprimerProductionDefinitivement'
        };
        for (const [f, nom] of Object.entries(cas)) {
            const src = lire(f);
            const debut = src.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = src.slice(debut, debut + 5000);
            expect(corps, `${nom} : n'écrit pas par la file`)
                .toMatch(/db\.modifier\(/);
        }
    });
});
