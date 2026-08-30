import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 4 (30 août 2026) — LE HELPER DES BIBLIOTHÈQUES.
//
// Les cinq familles (grilles, échelles, cartouches, productions, pratiques)
// n'écrivent pas leur bibliothèque chacune de son côté : elles passent toutes
// par `BibliothequeUI.dupliquerVersBibliotheque` et `dupliquerEtEditerItem`
// (js/bibliotheque-ui.js), qui faisaient `await d.lireListe()`, calculaient,
// puis `await d.ecrireListe(liste)`.
//
// ⮕ La course est donc UNE, et sa correction aussi : le couple
// lecture/écriture du descripteur est remplacé par un `modifierListe(mutateur)`
// que chaque famille câble sur `db.modifier`. Un seul changement de contrat,
// dix descripteurs, cinq familles couvertes.
//
// ⚠⚠ LE BANC DOIT REPRODUIRE LE CHEMIN INDEXEDDB, SINON IL NE PROUVE RIEN.
// C'est le faux-vert du lot 1, et il vaut d'être réécrit ici : Node n'a pas
// d'IndexedDB, donc `db.js` s'y rabat sur le mode localStorage-seul, où `set`
// écrit SYNCHRONEMENT. La fenêtre de course n'existe alors pas et les cas
// ci-dessous passent au VERT sur le code NON corrigé — un banc qui rend le
// défaut structurellement impossible. On rétablit donc le chemin de
// production : on n'invente pas la fenêtre, on rend au banc celle que Node
// lui retire.
//
// ⚠ Et `getSync` n'aurait rien protégé : dans `db.set`, l'écriture IndexedDB
// est ATTENDUE avant le rafraîchissement de localStorage. Pendant tout cet
// aller-retour, une lecture synchrone rend encore l'ANCIENNE valeur.

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

/**
 * Le commit IDB différé d'un tour de boucle : c'est CE délai qui existe en vrai.
 *
 * ⚠⚠ ET LE CLONE STRUCTURÉ, QUI EST LA SECONDE MOITIÉ DU RÉALISME — mesuré le
 * 30 août, après un break-test qui a refusé de rougir. Une fausse base qui
 * range et rend la RÉFÉRENCE de l'objet fait partager le même tableau à deux
 * lecteurs concurrents : chacun y pousse sa copie, les deux survivent, et le
 * banc passe au VERT même quand la file est neutralisée. IndexedDB, lui, clone
 * à l'écriture ET à la lecture (structured clone) : deux lectures rendent deux
 * tableaux DISTINCTS, et c'est précisément ce qui rend la course perdante.
 *
 * ⮕ Sans ce clone, ce fichier entier ne prouverait rien.
 */
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

/** La vraie base, bootée, PUIS basculée sur le chemin IndexedDB de production. */
async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    // Garde de validité du banc : sans base prête, tout ce qui suit ne prouve rien.
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

function fauxDocument() {
    return {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ setAttribute() {}, appendChild() {}, style: {} }),
        addEventListener() {}, removeEventListener() {}
    };
}

/** La vraie db PUIS le vrai helper, dans un même sandbox. */
async function monterHelper() {
    const db = await monterDb();

    // `forkerItem` appelle `nommerCopie` (suffixe « (copie) » normalisé). On
    // charge la VRAIE fonction plutôt qu'un simulacre : `js/identite-item.js`
    // est un module pur (ni stockage, ni DOM), donc rien n'empêche de l'exercer
    // tel quel — et une copie mal nommée serait un vrai défaut, pas un artefact
    // de banc.
    const identite = chargerScript('js/identite-item.js', {});
    if (typeof identite.nommerCopie !== 'function') throw new Error('nommerCopie absent du sandbox');

    const win = chargerScript('js/bibliotheque-ui.js', {
        db,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ITEM_') + Math.random().toString(36).slice(2, 10),
        obtenirIdentiteCCUtilisateur: () => 'banc',
        obtenirProfilAuteurActifSync: () => ({ auteur_original: 'banc' }),
        nommerCopie: identite.nommerCopie,
        document: fauxDocument()
    });
    // Garde de validité : sans le helper, les cas passeraient au vert sans rien exercer.
    if (!win.BibliothequeUI) throw new Error('BibliothequeUI absent du sandbox');
    return { db, BibliothequeUI: win.BibliothequeUI };
}

const CLE = 'a2026_bibliothequeDuBanc';

/** Un descripteur de famille, câblé comme les dix vrais : par `db.modifier`. */
function descripteur(db, id, extra = {}) {
    return {
        id,
        prefixeId: 'BANC_',
        modifierListe: (mutateur) => db.modifier(CLE, mutateur, []),
        nommerLaCopie: (copie, source) => { copie.nom = String(source.nom) + ' (copie)'; },
        forgerProvenance: (source) => ({ id: source.id, nom: source.nom }),
        ...extra
    };
}

const SOURCE = () => ({ id: 'S1', nom: 'Gabarit du banc', criteres: [{ n: 1 }] });

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 4 · A — deux duplications concurrentes gardent leurs DEUX copies', () => {

    it('A.a dupliquerVersBibliotheque — le chemin « Dupliquer depuis la bibliothèque »', async () => {
        const { db, BibliothequeUI } = await monterHelper();
        await db.set(CLE, [SOURCE()]);   // security-ok: littéral de banc, aucune source externe

        // Les deux gestes partent AVANT que le premier ait fini d'écrire :
        // c'est exactement la rafale que `db.modifier` doit sérialiser.
        const [a, b] = await Promise.all([
            BibliothequeUI.dupliquerVersBibliotheque(descripteur(db, 'S1')),
            BibliothequeUI.dupliquerVersBibliotheque(descripteur(db, 'S1'))
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'la source et les DEUX copies doivent survivre').toHaveLength(3);
        expect(a && a.id, 'la première duplication rend sa copie').toBeTruthy();
        expect(b && b.id, 'la seconde duplication rend sa copie').toBeTruthy();
        expect(a.id).not.toBe(b.id);
        // Et les deux copies sont bien CELLES qui ont été rendues.
        const ids = liste.map((x) => x.id);
        expect(ids).toContain(a.id);
        expect(ids).toContain(b.id);
    });

    it('A.b dupliquerEtEditerItem — le chemin « Dupliquer et éditer »', async () => {
        const { db, BibliothequeUI } = await monterHelper();
        await db.set(CLE, [SOURCE()]);   // security-ok: littéral de banc, aucune source externe

        const charges = [];
        const d = () => descripteur(db, 'S1', {
            chargerPourModif: (idCopie) => { charges.push(idCopie); }
        });

        await Promise.all([
            BibliothequeUI.dupliquerEtEditerItem(d()),
            BibliothequeUI.dupliquerEtEditerItem(d())
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'la source et les DEUX copies doivent survivre').toHaveLength(3);
        // Le chargement en édition reçoit l'id de LA copie créée par SON appel :
        // c'est ce que la variable de sortie du mutateur doit garantir.
        expect(charges, 'chaque appel charge sa propre copie').toHaveLength(2);
        expect(charges[0]).not.toBe(charges[1]);
        const ids = liste.map((x) => x.id);
        expect(ids).toContain(charges[0]);
        expect(ids).toContain(charges[1]);
    });

    it('A.c TÉMOIN — une duplication seule marche toujours, et la source est intacte', async () => {
        const { db, BibliothequeUI } = await monterHelper();
        await db.set(CLE, [SOURCE()]);   // security-ok: littéral de banc, aucune source externe

        const copie = await BibliothequeUI.dupliquerVersBibliotheque(descripteur(db, 'S1'));

        const liste = await db.get(CLE);
        expect(liste).toHaveLength(2);
        expect(copie.nom).toBe('Gabarit du banc (copie)');
        expect(copie.dansBibliotheque).toBe(true);
        expect(copie.isDemo).toBe(false);
        // La source n'a pas été touchée (clone, pas alias).
        const source = liste.find((x) => x.id === 'S1');
        expect(source.nom).toBe('Gabarit du banc');
        expect(source.dansBibliotheque).toBeUndefined();
    });

    it('A.d source absente : AUCUNE écriture, et le message est posé', async () => {
        const { db, BibliothequeUI } = await monterHelper();
        await db.set(CLE, [SOURCE()]);   // security-ok: littéral de banc, aucune source externe

        let messageAffiche = 0;
        const rendu = await BibliothequeUI.dupliquerVersBibliotheque(
            descripteur(db, 'INTROUVABLE', { siIntrouvable: () => { messageAffiche += 1; } })
        );

        expect(rendu, 'le contrat rend null quand la source est absente').toBeNull();
        expect(messageAffiche, 'le message d\'absence est posé une fois').toBe(1);
        // `undefined` rendu par le mutateur ANNULE l'écriture : la liste est intacte.
        expect(await db.get(CLE)).toHaveLength(1);
    });
});

/* ------------------------------------------------- B — le cliquet du contrat */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sansCommentaires = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

// Les six fichiers qui portent un descripteur de famille, et le compte attendu.
const DESCRIPTEURS = {
    'js/echelles.js': 2,
    'js/grilles.js': 2,
    'js/cartouches.js': 2,
    'js/productions-bibliotheque-ui.js': 1,
    'js/productions-liste.js': 1,
    'js/pratiques-gestion.js': 2
};

describe('#522 lot 4 · B — le contrat du helper ne peut pas revenir en arrière', () => {

    it('B.a le helper n\'expose plus de couple lecture/écriture', () => {
        // ⚠ Assertion statique : les commentaires sont retirés AVANT de compter,
        // sinon la phrase d'historique qui NOMME l'ancien contrat compte comme
        // un site vivant et le cliquet rougit sur sa propre documentation.
        const src = sansCommentaires(readFileSync(path.join(racine, 'js/bibliotheque-ui.js'), 'utf8'));
        expect(src).not.toMatch(/\blireListe\b/);
        expect(src).not.toMatch(/\becrireListe\b/);
        // Les deux chemins passent par le mutateur.
        expect((src.match(/d\.modifierListe\(/g) || []).length).toBe(2);
    });

    it('B.b les dix descripteurs câblent `modifierListe` sur `db.modifier`', () => {
        let total = 0;
        for (const [f, attendu] of Object.entries(DESCRIPTEURS)) {
            const src = sansCommentaires(readFileSync(path.join(racine, f), 'utf8'));
            const parLaFile = (src.match(/modifierListe:\s*\(mutateur\)\s*=>\s*db\.modifier\(/g) || []).length;
            expect(parLaFile, `${f} : descripteurs câblés sur db.modifier`).toBe(attendu);
            // Et aucun ne garde l'ancien contrat.
            expect(src, `${f} : l'ancien couple ne doit plus exister`).not.toMatch(/\blireListe\b|\becrireListe\b/);
            total += parLaFile;
        }
        expect(total, 'les cinq familles, dix descripteurs').toBe(10);
    });

    it('B.c aucun autre fichier ne réintroduit l\'ancien contrat', () => {
        // Le helper sert cinq familles : un sixième appelant qui reviendrait au
        // couple lecture/écriture rouvrirait la course pour tout le monde.
        const fichiers = Object.keys(DESCRIPTEURS).concat('js/bibliotheque-ui.js');
        for (const f of fichiers) {
            const src = sansCommentaires(readFileSync(path.join(racine, f), 'utf8'));
            expect(src, `${f}`).not.toMatch(/lireListe\s*:/);
            expect(src, `${f}`).not.toMatch(/ecrireListe\s*:/);
        }
    });
});
