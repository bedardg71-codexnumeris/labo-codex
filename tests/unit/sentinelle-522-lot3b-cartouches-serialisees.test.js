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
// ⮕ ET `assurerCartoucheDeDepart` VÉRIFIAIT SA PRÉSENCE HORS FILE — défaut
// jumeau d'`assurerGrilleDeDepart`, corrigé au lot 2c : deux appels concurrents
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
        cle: (k) => PREFIXE_TRIMESTRE + k,
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

    for (const f of ['dupliquerCartouche', 'supprimerCartoucheConfirm',
                     'retirerCartoucheDeBibliotheque']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const G = 'G1';
// ⚠ MIGRÉE PAR S5/#623 LE 31 AOÛT 2026. Cette ligne portait `'cartouches_' + G`
// avec le commentaire « volontairement SANS préfixe de trimestre : c'est l'état du
// dépôt ». L'état du dépôt a changé : `js/cartouches.js` route désormais par
// `cle(...)`, donc vers `a2026_cartouches_G1` avec le stub de ce fichier.
// La clé est DÉRIVÉE du stub, jamais recopiée — un préfixe écrit deux fois est un
// désaccord qui attend son heure.
const PREFIXE_TRIMESTRE = 'a2026_';
const CLE = PREFIXE_TRIMESTRE + 'cartouches_' + G;

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

    // ↻ #864 (14 sept. 2026) : A.a, A.b et A.c éprouvaient la file par la bascule
    // de verrouillage, retirée avec le verrouillage des cartouches. Ils sont
    // RÉANCRÉS sur des gestes vivants — la course gardée reste la même : deux
    // écritures lancées ensemble gardent leurs deux effets. A.c est fusionné dans A.b.
    it('A.a deux suppressions concurrentes s\'appliquent toutes les deux', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.supprimerCartoucheConfirm('C1', G),
            win.supprimerCartoucheConfirm('C3', G)
        ]);

        const liste = await db.get(CLE);
        expect(liste.map((c) => c.id), 'les deux suppressions tiennent').toEqual(['C2']);
    });

    it('A.b une duplication et une suppression concurrentes s\'appliquent toutes les deux', async () => {
        const { db, win } = await monterCartouches();
        await db.set(CLE, CARTOUCHES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.dupliquerCartouche('C1', G),
            win.supprimerCartoucheConfirm('C2', G)
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'trois de départ, une copie, une suppression').toHaveLength(3);
        expect(cartoucheDe(liste, 'C2'), 'la suppression tient').toBeUndefined();
        expect(liste.filter((c) => c.nom === 'Français écrit (copie)'), 'la copie tient').toHaveLength(1);
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

    // ↻ #864 (14 sept. 2026) : B.a (une bascule de verrouillage sur un id absent)
    // est parti avec la bascule. B.b et B.c gardent le refus sur deux gestes vivants.

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
// ⚠ MOTIF ÉLARGI PAR S5/#623 LE 31 AOÛT 2026, ET LE COMPTE N'A PAS BOUGÉ.
// Le motif ne connaissait que la clé nue. Depuis que les sites composent
// `cle(\`cartouches_…\`)`, il ne voyait plus RIEN — un cliquet qui compte zéro
// écriture directe ne dit pas « il n'y en a plus », il dit qu'il ne sait plus
// regarder, et il laisserait passer la prochaine. Le `(?:cle\()?` optionnel le
// fait voir à travers le routage, routé ou nu.
const ECRITURES_DIRECTES = /db\.set(Sync)?\(\s*(?:cle\()?\s*[`']cartouches_/g;

// ⚠ CE QUE CE MOTIF NE PEUT PAS VOIR — vérifié le 31 août 2026, à ne pas rouvrir.
// Il exige un LITTÉRAL immédiatement après `db.set(`. La forme « composition en N,
// routage en N+1 » lui échappe donc entièrement :
//     var brute = 'cartouches_' + grilleId;
//     return (typeof window.cle === 'function') ? window.cle(brute) : brute;
// Elle existe à deux endroits — `js/partage-export.js:64` et
// `js/partage-format.js:170` — et dans les deux, la ligne suivante ROUTE : le code
// est correct. ⮕ Ce n'est donc pas un faux POSITIF (le motif ne les signale pas),
// c'est un ANGLE MORT (il ne peut ni les condamner ni les absoudre).
// ⮕ Sans conséquence ICI : ce cliquet ne lit que `js/cartouches.js` et
//   `js/import-export.js`, où la forme n'apparaît pas. Mais quiconque étendra son
//   périmètre à `partage-*.js` doit savoir qu'il ne verra pas ces deux sites — et
//   qu'un site de cette forme qui OUBLIERAIT de router passerait tout aussi
//   invisible. Étendre le périmètre demande d'élargir le motif dans le même geste.

describe('#522 lot 3b · C — la course ne peut pas se rouvrir en silence', () => {

    it('C.a plus AUCUNE écriture directe sur la clé des cartouches, dans cartouches.js', () => {
        expect((lire('js/cartouches.js').match(ECRITURES_DIRECTES) || []).length).toBe(0);
    });

    // ↻ #864 (14 sept. 2026) : seize → quinze. La seizième était la bascule de
    // verrouillage (`basculerVerrouillageCartouche`), retirée avec le verrouillage.
    // ↻ Lot E1 (27 sept. 2026) : quinze → seize. La seizième est le NOM d'une cartouche
    // existante, qui s'enregistre désormais au changement (`sauvegarderNomCartouche`, D3).
    // ↻ #467 (9 oct. 2026) : seize → quatorze. `importerDansCartoucheActive` et
    // `importerCartoucheJSON` sont parties : aucun déclencheur (inventaire du lot F,
    // 29 sept. : « code mort »), deux imports JSON bruts de moins.
    // ↻ #1153 (24 oct. 2026) : douze → treize. La treizième est la COPIE d'une cartouche pour
    // une autre grille (`copierCartouchePourGrille`), écrite par la file sous la grille choisie.
    it('C.b les quatorze écritures-modifications passent par la file', () => {
        const n = (lire('js/cartouches.js').match(/(?:db\.modifier|modifierEtAnnoncer)\(\s*(?:cle\()?\s*[`']cartouches_/g) || []).length;
        expect(n, 'lot 3b, lot 4 et les conversions antérieures, moins la bascule retirée par #864, plus le nom (lot E1), moins les deux imports morts (#467), moins importerDepuisMarkdown et importerPartiel (#469, 12 oct.), plus la copie pour une autre grille (#1153)').toBe(13);
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
                .toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(\s*(?:cle\()?\s*[`']cartouches_/);
        }
    });

    it('C.e assurerCartoucheDeDepart vérifie sa présence DANS le mutateur', () => {
        // Vérifier avant d'entrer dans la file laisserait deux semis concurrents
        // passer tous les deux — c'est le défaut jumeau corrigé au lot 2c.
        const src = lire('js/cartouches.js');
        const debut = src.indexOf('function assurerCartoucheDeDepart(');
        expect(debut, 'assurerCartoucheDeDepart introuvable').toBeGreaterThan(-1);
        const corps = src.slice(debut, debut + 6000);
        const posFile = corps.search(/(?:db\.modifier|modifierEtAnnoncer)\(/);   // lot E1 : la même file, annoncée
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
        expect(corps, 'la lecture doit rester directe').toMatch(/await db\.get\(\s*(?:cle\()?\s*`cartouches_/);
        expect(corps, 'la réparation doit passer par la file').toMatch(/db\.modifier\(\s*(?:cle\()?\s*`cartouches_/);
        expect(corps, 'la réparation doit revérifier la forme').toMatch(/Array\.isArray\(lues\)/);
    });
});
