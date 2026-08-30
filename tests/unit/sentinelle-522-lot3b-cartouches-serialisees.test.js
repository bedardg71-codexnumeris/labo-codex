import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 3b (30 août 2026) — LES CARTOUCHES D'UNE GRILLE.
//
// Treize sites de `js/cartouches.js` lisaient `cartouches_<grilleId>`, y
// changeaient une entrée, puis réécrivaient la collection ENTIÈRE.
//
// ⚠ LA CLÉ EST UN GABARIT, pas un littéral : `cartouches_${grilleId}`. Un
// balayage qui n'apparie que des chaînes ne la voit pas. L'outil de mesure du
// lot apparie sur l'EXPRESSION de clé — c'est ce qui a permis de la compter.
//
// ⮕ TROIS SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE : `sauvegarderCartouche`
// (la question du doublon), `supprimerCartoucheConfirm` et
// `supprimerCartoucheDefinitivement` (une confirmation).
//
// ⮕ ET `assurerCartoucheGenerique` VÉRIFIAIT SA PRÉSENCE HORS FILE — défaut
// jumeau d'`assurerGrilleGenerique`, corrigé au lot 2c : deux appels concurrents
// au démarrage semaient DEUX cartouches d'exemple.
// ⚠ CE CAS-LÀ N'A PAS DE VÉRIFICATION DE COMPORTEMENT, et il faut le dire : la
// fonction n'est pas exportée, elle n'est atteignable que par
// `initialiserModuleCartouches`, qui câble tout l'écran. Un banc qui la
// rejoindrait mesurerait surtout son propre échafaudage. Ce qui la garde ici est
// le cliquet C.e — le test de présence doit vivre APRÈS l'ouverture de la file —
// et la mutation 2 du break-test, qui le retire et fait rougir. Moins fort qu'un
// cas de course ; dit plutôt que sous-entendu.
// ⮕ Son équivalent grille, lui, EST vérifié par un cas de comportement
// (`sentinelle-522-lot2c-grilles-serialisees`, cas A.e).
//
// ⚠ UN SITE N'EST PAS CONVERTI, ET C'EST DÉLIBÉRÉ. `obtenirCartouchesGrille` est
// appelée vingt-quatre fois : sa LECTURE reste hors file — sérialiser des
// lectures derrière la file d'écriture les ralentirait sans rien protéger. Seule
// sa RÉPARATION de forme (objet unique au lieu d'un tableau, legacy du
// pack-démarrage) entre dans la file, et elle y revérifie la forme.
//
// ⚠⚠ LE BANC : chemin IndexedDB rétabli ET clone structuré.

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

function elementInerte() {
    return {
        innerHTML: '', textContent: '', value: '', style: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        dataset: {}, setAttribute() {}, getAttribute: () => null,
        appendChild() {}, insertAdjacentHTML() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], focus() {}, click() {}
    };
}

async function monterCartouches() {
    const db = await monterDb();
    const win = chargerScript('js/cartouches.js', {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'CART_') + Math.random().toString(36).slice(2, 8),
        nommerCopie: (nom) => String(nom) + ' (copie)',
        alert: () => {}, confirm: () => true, prompt: () => 'Copie',
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: {
            getElementById: () => elementInerte(),
            querySelector: () => null, querySelectorAll: () => [],
            body: elementInerte(), createElement: () => elementInerte(),
            addEventListener() {}, removeEventListener() {}
        },
        BibliothequeUI: {
            obtenirAuteurActif: () => 'banc',
            forgerInspireDe: () => null,
            repertoires: { rendre() {} },
            filtrerParModeDemo: (liste) => liste,
            estItemDemo: () => false
        },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        // Déclarée dans js/config.js, chargé avant cartouches.js en production :
        // sans elle, la seule LECTURE lève une ReferenceError — rouge de banc.
        cartoucheActuel: null,
        calculerPourcentageComplete: async () => {},
        chargerCartouchePourModif: async () => {},
        afficherBanqueCartouches: async () => {},
        chargerCartouchesRetroaction: async () => {},
        definirCartoucheActive: () => {}
    });
    win.estRessourceSupprimee = () => false;
    win.marquerRessourceSupprimee = () => {};
    win.IDS_GABARITS_HARDCODES = [];

    for (const f of ['basculerVerrouillageCartouche', 'dupliquerCartouche',
                     'supprimerCartoucheConfirm', 'retirerCartoucheDeBibliotheque']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const G = 'G1';
const CLE = 'cartouches_' + G;   // volontairement SANS préfixe de trimestre : c'est l'état du dépôt

// ⚠ `criteres` et `niveaux` ne sont pas décoratifs : `calculerPourcentageComplete`
// les parcourt, et elle vit dans la MÊME IIFE que le code testé — un stub passé
// au sandbox ne la remplace pas. Leçon déjà inscrite dans la sentinelle #517.
const CARTOUCHES = () => ([
    { id: 'C1', grilleId: G, nom: 'Français écrit', dansBibliotheque: true,
      criteres: [{ id: 'CR_1', nom: 'Français' }], niveaux: [{ code: 'I' }, { code: 'M' }], commentaires: {} },
    { id: 'C2', grilleId: G, nom: 'Structure', dansBibliotheque: true,
      criteres: [{ id: 'CR_1', nom: 'Français' }], niveaux: [{ code: 'I' }, { code: 'M' }], commentaires: {} },
    { id: 'C3', grilleId: G, nom: 'Analyse', dansBibliotheque: true,
      criteres: [{ id: 'CR_1', nom: 'Français' }], niveaux: [{ code: 'I' }, { code: 'M' }], commentaires: {} }
]);

const cartoucheDe = (liste, id) => liste.find((c) => c.id === id);

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 3b · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a deux verrouillages concurrents tiennent tous les deux', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.basculerVerrouillageCartouche('C1', G),
            win.basculerVerrouillageCartouche('C3', G)
        ]);

        const liste = await db.get(CLE);
        expect(cartoucheDe(liste, 'C1').verrouille, 'le premier verrou tient').toBe(true);
        expect(cartoucheDe(liste, 'C3').verrouille, 'le second verrou tient').toBe(true);
    });

    it('A.b une duplication et un verrouillage concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.dupliquerCartouche('C1', G),
            win.basculerVerrouillageCartouche('C2', G)
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'la copie est là').toHaveLength(4);
        expect(cartoucheDe(liste, 'C2').verrouille, 'le verrou tient').toBe(true);
    });

    it('A.c une suppression et un verrouillage concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.supprimerCartoucheConfirm('C3', G),
            win.basculerVerrouillageCartouche('C1', G)
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'la suppression tient').toHaveLength(2);
        expect(cartoucheDe(liste, 'C1').verrouille, 'le verrou tient').toBe(true);
    });

    it('A.d deux duplications concurrentes donnent DEUX copies', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.dupliquerCartouche('C1', G), win.dupliquerCartouche('C2', G)]);

        expect(await db.get(CLE), 'trois de départ, plus les deux copies').toHaveLength(5);
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#522 lot 3b · B — un geste impossible REFUSE l\'écriture', () => {

    it('B.a un verrouillage sur un id absent ne touche à rien', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await win.basculerVerrouillageCartouche('C_FANTOME', G);

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(CARTOUCHES()));
    });

    it('B.b un retrait de bibliothèque sur un id absent ne touche à rien', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await win.retirerCartoucheDeBibliotheque('C_FANTOME', G);

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(CARTOUCHES()));
    });

    it('B.c une duplication d\'un id absent n\'ajoute rien', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await win.dupliquerCartouche('C_FANTOME', G);

        expect(await db.get(CLE), 'aucune copie').toHaveLength(3);
    });
});

/* ------------------------------------------------- C — le cliquet du lot 3b */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

// La clé s'écrit en GABARIT et en littéral : les deux formes sont interdites.
const ECRITURES_DIRECTES = /db\.set(Sync)?\(\s*[`']cartouches_/g;

describe('#522 lot 3b · C — la course ne peut pas se rouvrir en silence', () => {

    it('C.a plus AUCUNE écriture directe sur la clé des cartouches, dans cartouches.js', () => {
        expect((lire('js/cartouches.js').match(ECRITURES_DIRECTES) || []).length).toBe(0);
    });

    it('C.b les seize écritures-modifications passent par la file', () => {
        const n = (lire('js/cartouches.js').match(/db\.modifier\(\s*[`']cartouches_/g) || []).length;
        expect(n, 'lot 3b, lot 4 et les conversions antérieures').toBe(16);
    });

    it('C.c la seule écriture directe restante du dépôt est NOMMÉE, et sa raison tient', () => {
        // `executerImportConfigComplete` est synchrone de bout en bout (régime R3
        // de l'audit) : sans point de suspension entre la lecture et l'écriture,
        // rien ne peut s'intercaler.
        const src = lire('js/import-export.js');
        const n = (src.match(ECRITURES_DIRECTES) || []).length;
        expect(n, 'une seule, dans executerImportConfigComplete').toBe(1);
        const debut = src.indexOf('function executerImportConfigComplete');
        const fin = src.indexOf('function executerImportSelectif');
        const pos = src.search(ECRITURES_DIRECTES);
        expect(pos > debut && pos < fin, 'elle n\'est pas où on l\'attend').toBe(true);
    });

    it('C.d les trois fenêtres d\'attente humaine écrivent DANS la file', () => {
        const src = lire('js/cartouches.js');
        for (const nom of ['sauvegarderCartouche', 'supprimerCartoucheConfirm',
                           'supprimerCartoucheDefinitivement']) {
            const debut = src.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = src.slice(debut, debut + 5000);
            expect(corps, `${nom} : n'écrit pas par la file`)
                .toMatch(/db\.modifier\(\s*[`']cartouches_/);
        }
    });

    it('C.e assurerCartoucheGenerique vérifie sa présence DANS le mutateur', () => {
        // Vérifier avant d'entrer dans la file laisserait deux semis concurrents
        // passer tous les deux — c'est le défaut jumeau corrigé au lot 2c.
        const src = lire('js/cartouches.js');
        const debut = src.indexOf('function assurerCartoucheGenerique(');
        expect(debut, 'assurerCartoucheGenerique introuvable').toBeGreaterThan(-1);
        const corps = src.slice(debut, debut + 6000);
        const posFile = corps.indexOf('db.modifier(');
        const posTest = corps.indexOf("some(c => c.id === 'CART_GENERIQUE')");
        expect(posFile, 'la file est absente').toBeGreaterThan(-1);
        expect(posTest, 'le test de présence est absent').toBeGreaterThan(posFile);
    });

    it('C.f obtenirCartouchesGrille garde sa LECTURE hors file, et sa RÉPARATION dedans', () => {
        // Choix assumé : cette fonction est appelée vingt-quatre fois. Sérialiser
        // des lectures derrière la file d'écriture les ralentirait sans rien
        // protéger. Seule la réparation de forme écrit — et elle revérifie.
        const src = lire('js/cartouches.js');
        const debut = src.indexOf('function obtenirCartouchesGrille(');
        const corps = src.slice(debut, debut + 1500);
        expect(corps, 'la lecture doit rester directe').toMatch(/await db\.get\(\s*`cartouches_/);
        expect(corps, 'la réparation doit passer par la file').toMatch(/db\.modifier\(\s*`cartouches_/);
        expect(corps, 'la réparation doit revérifier la forme').toMatch(/Array\.isArray\(lues\)/);
    });
});
