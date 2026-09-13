import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 2a (30 août 2026) — LES NIVEAUX DE L'ÉCHELLE.
//
// Six fonctions de `js/echelles.js` lisaient la clé `niveauxEchelle`, y
// changeaient une valeur, puis la réécrivaient entière : modifierNiveau,
// ajouterNiveau, supprimerNiveau, deplacerNiveauHaut, deplacerNiveauBas et
// basculerVerrouillageNiveau. C'est le geste de #510, sur une autre clé —
// et l'éditeur de niveaux est un tableau de champs dont le `change` part au
// blur, donc au moment PRÉCIS où on clique dans le champ suivant.
//
// ⚠ La clé n'est PAS namespacée par trimestre (`db.get('niveauxEchelle')`,
// sans `cle()`), contrairement à `echellesTemplates`. C'est un défaut latent
// et neutre, laissé tel quel : on ne corrige pas un bug dormant pendant un
// refactor, on l'inscrit.
//
// ⚠⚠ LE BANC DOIT REPRODUIRE LE CHEMIN INDEXEDDB, SINON IL NE PROUVE RIEN.
// Node n'a pas d'IndexedDB : `db.js` s'y rabat sur localStorage-seul, où `set`
// écrit SYNCHRONEMENT. La fenêtre de course n'existe alors pas, et ces cas
// passent au VERT sur le code NON corrigé. On rend au banc la fenêtre que Node
// lui retire — on ne l'invente pas.
//
// ⚠⚠ ET LE CLONE STRUCTURÉ EST LA SECONDE MOITIÉ DU RÉALISME. Mesuré au lot 4,
// après un break-test qui a REFUSÉ de rougir : une fausse base qui rend la
// RÉFÉRENCE de l'objet fait partager le même tableau à deux lecteurs
// concurrents, chacun y pousse sa modification, les deux survivent, et le banc
// est vert même la file neutralisée. IndexedDB clone à l'écriture ET à la
// lecture : deux lectures rendent deux tableaux DISTINCTS. C'est cela qui rend
// la course perdante, donc observable.

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
        createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
        addEventListener() {}, removeEventListener() {}
    };
}

/** La vraie db PUIS le vrai éditeur d'échelles, dans un même sandbox. */
async function monterEchelles() {
    const db = await monterDb();
    const win = chargerScript('js/echelles.js', {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ECH_') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: fauxDocument(),
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        obtenirIdentiteUtilisateur: () => 'banc'
    });
    // Garde de validité : sans les six fonctions, les cas passeraient au vert
    // sans rien exercer du tout.
    for (const f of ['modifierNiveau', 'ajouterNiveau', 'supprimerNiveau',
                     'deplacerNiveauHaut', 'deplacerNiveauBas', 'basculerVerrouillageNiveau']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const CLE = 'niveauxEchelle';   // volontairement SANS préfixe de trimestre : c'est l'état du dépôt

const NIVEAUX = () => ([
    { code: 'I', nom: 'Insuffisant', description: '', min: 0,  max: 59,  valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', description: '', min: 60, max: 74,  valeurCalcul: 67 },
    { code: 'M', nom: 'Maîtrisé', description: '', min: 75, max: 89,  valeurCalcul: 82 },
    { code: 'E', nom: 'Expert', description: '', min: 90, max: 100, valeurCalcul: 95 }
]);

/* ------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 2a · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a modifierNiveau — deux champs modifiés coup sur coup, aucun n\'est écrasé', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        // Le blur du premier champ part au moment où on clique dans le second :
        // les deux lectures partent avant que la première écriture ait abouti.
        await Promise.all([
            win.modifierNiveau(0, 'nom', 'Insuffisant (revu)'),
            win.modifierNiveau(2, 'nom', 'Maîtrisé (revu)')
        ]);

        const apres = await db.get(CLE);
        expect(apres[0].nom, 'la première saisie survit').toBe('Insuffisant (revu)');
        expect(apres[2].nom, 'la seconde saisie survit').toBe('Maîtrisé (revu)');
    });

    it('A.b ajouterNiveau — deux ajouts concurrents donnent DEUX niveaux', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.ajouterNiveau(), win.ajouterNiveau()]);

        const apres = await db.get(CLE);
        expect(apres, 'quatre niveaux de départ, plus les deux ajoutés').toHaveLength(6);
    });

    it('A.c basculerVerrouillageNiveau — deux verrous posés en rafale tiennent tous les deux', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.basculerVerrouillageNiveau(1),
            win.basculerVerrouillageNiveau(3)
        ]);

        const apres = await db.get(CLE);
        expect(apres[1].verrouille, 'le premier verrou tient').toBe(true);
        expect(apres[3].verrouille, 'le second verrou tient').toBe(true);
    });

    it('A.d une modification et une suppression concurrentes ne se perdent pas', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.modifierNiveau(0, 'nom', 'Premier (revu)'),
            win.supprimerNiveau(3)
        ]);

        const apres = await db.get(CLE);
        expect(apres, 'la suppression a bien eu lieu').toHaveLength(3);
        expect(apres[0].nom, 'et la modification concurrente n\'a pas été écrasée').toBe('Premier (revu)');
    });
});

/* ------------------------------------------- B — les refus, sans TypeError */

describe('#522 lot 2a · B — un index hors bornes REFUSE l\'écriture au lieu de lever', () => {

    it('B.a modifierNiveau hors bornes ne touche à rien', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await expect(win.modifierNiveau(99, 'nom', 'Fantôme')).resolves.toBeUndefined();

        const apres = await db.get(CLE);
        expect(apres, 'la liste est intacte').toHaveLength(4);
        expect(JSON.stringify(apres)).toBe(JSON.stringify(NIVEAUX()));
    });

    it('B.b supprimerNiveau hors bornes ne retire rien', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await win.supprimerNiveau(99);

        expect(await db.get(CLE), 'aucun niveau retiré').toHaveLength(4);
    });

    it('B.c deplacerNiveauBas sur le DERNIER niveau refuse, sans réécrire', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await win.deplacerNiveauBas(3);

        const apres = await db.get(CLE);
        expect(JSON.stringify(apres), 'l\'ordre est inchangé').toBe(JSON.stringify(NIVEAUX()));
    });

    it('B.d deplacerNiveauHaut échange bien deux niveaux voisins', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, NIVEAUX());   // security-ok: littéral de banc, aucune source externe

        await win.deplacerNiveauHaut(1);

        const apres = await db.get(CLE);
        expect(apres[0].code, 'le second est monté').toBe('D');
        expect(apres[1].code, 'le premier est descendu').toBe('I');
    });
});

/* ------------------------------------------------- C — le cliquet du lot 2a */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sansCommentaires = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Le nom de la fonction qui contient l'offset donné (la plus proche en amont). */
function fonctionContenant(src, offset) {
    const entetes = [...src.slice(0, offset).matchAll(/\bfunction\s+([A-Za-z0-9_$]+)\s*\(/g)];
    return entetes.length ? entetes[entetes.length - 1][1] : '(hors fonction)';
}

describe('#522 lot 2a · C — la course ne peut pas se rouvrir en silence', () => {

    // ⚠ Assertion statique : les commentaires sont retirés AVANT de compter,
    // sinon l'en-tête de ce chantier — qui NOMME l'ancien geste — compterait
    // comme un site vivant et le cliquet rougirait sur sa propre documentation.
    const source = sansCommentaires(readFileSync(path.join(racine, 'js/echelles.js'), 'utf8'));

    it('C.a les sept écritures-modifications passent par la file', () => {
        const parLaFile = (source.match(/db\.modifier\('niveauxEchelle'/g) || []).length;
        expect(parLaFile, 'six converties au lot 2a, plus celle qui préexistait').toBe(7);
    });

    it('C.b les six fonctions du lot ne gardent AUCUN db.set sur la clé', () => {
        const converties = ['modifierNiveau', 'ajouterNiveau', 'supprimerNiveau',
                            'deplacerNiveauHaut', 'deplacerNiveauBas', 'basculerVerrouillageNiveau'];
        for (const m of source.matchAll(/db\.set\('niveauxEchelle'/g)) {
            const nom = fonctionContenant(source, m.index);
            expect(converties, `${nom} écrit encore hors de la file`).not.toContain(nom);
        }
    });

    it('C.c les deux écritures restantes sont NOMMÉES, et ce sont des remplacements complets', () => {
        // Elles ne lisent pas la clé avant de l'écrire : elles posent une liste
        // venue d'ailleurs (l'échelle chargée, les niveaux par défaut). Aucune
        // course — mais la liste reste FERMÉE : une troisième écriture directe
        // doit se justifier ici, ou passer par la file.
        // ↻ 13 sept. 2026 : `genererNiveauxPersonnalises` est partie avec le bloc
        // « ANCIEN SYSTÈME » d'index.html, son seul appelant (#520).
        const noms = [...source.matchAll(/db\.set\('niveauxEchelle'/g)]
            .map((m) => fonctionContenant(source, m.index))
            .sort();
        expect(noms).toEqual([
            'chargerEchelleTemplate',
            'reinitialiserNiveauxDefaut'
        ]);
    });

    it('C.d aucune lecture de la clé ne subsiste dans les six fonctions converties', () => {
        const converties = ['modifierNiveau', 'ajouterNiveau', 'supprimerNiveau',
                            'deplacerNiveauHaut', 'deplacerNiveauBas', 'basculerVerrouillageNiveau'];
        for (const m of source.matchAll(/db\.get\('niveauxEchelle'/g)) {
            const nom = fonctionContenant(source, m.index);
            expect(converties, `${nom} lit encore hors de la file`).not.toContain(nom);
        }
    });
});
