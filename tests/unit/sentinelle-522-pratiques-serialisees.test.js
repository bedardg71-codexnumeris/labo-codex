import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 (30 août 2026) — LA COURSE DE #510, LÀ OÙ ELLE EST DÉCLENCHÉE
// PAR DE LA SAISIE : LA CLÉ `pratiquesConfigurables`.
//
// #510 a doté db.js de `db.modifier` (file par clé) et converti DEUX éditeurs :
// grilles et échelles. #522 demandait d'auditer le reste. L'audit du 30 août a
// mesuré 102 sites lire→modifier→écrire hors de `db.modifier`, sur 213 ; et
// UN SEUL groupe de clés est atteint par un déclencheur de SAISIE, celui-ci :
// dix champs du wizard de pratique portent `data-on-change` vers
// `sauvegarderConfigPratiqueMat`, et les tableaux « types de travaux » et
// « forfaits » en portent cinq autres vers leurs propres éditeurs de cellule.
// C'est le geste de #510 à l'identique — le `change` part AU BLUR, donc au
// moment précis où l'on clique dans le champ suivant.
//
// ⚠⚠ ET CE CHEMIN-CI PASSE PAR `getSync`, CE QUI NE LE PROTÈGE PAS.
// L'intuition « lecture synchrone = séquence atomique » est fausse ici, et
// c'est le fait qui a orienté tout l'audit : dans `db.set`, l'écriture
// IndexedDB est ATTENDUE AVANT le rafraîchissement de localStorage. Pendant
// tout cet aller-retour, `getSync` rend encore l'ANCIENNE valeur :
//
//     A : getSync[v0] ─ mute ─ set: await IDB ······· localStorage = v0+A
//     B :                 getSync[v0 !] ─ mute ─ set ······ localStorage = v0+B
//                                                          ⇒ A perdu, en silence
//
// Le remède est celui de #510, et pour la même raison : ce n'est pas
// l'écriture qu'il faut sérialiser, c'est la SÉQUENCE — `db.modifier`.

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
 * ⚠⚠ LE BANC DOIT REPRODUIRE LE CHEMIN INDEXEDDB, SINON IL NE PROUVE RIEN.
 *
 * C'est le faux-vert attrapé le 30 août, et il vaut d'être écrit : Node n'a pas
 * d'IndexedDB, donc `db.js` s'y rabat sur le mode localStorage-seul, où `set`
 * écrit SYNCHRONEMENT. La fenêtre de course n'existe alors pas, et les six cas
 * ci-dessous passaient au vert sur le code NON corrigé — un banc qui rend le
 * défaut structurellement impossible.
 *
 * En production, `useIndexedDB` est vrai : `set` attend le commit IDB AVANT de
 * rafraîchir localStorage. On rétablit donc ce chemin — on n'invente pas la
 * fenêtre, on rend au banc celle que Node lui retire.
 */
function fausseConnexionIDB() {
    const disque = new Map();
    return {
        transaction() {
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => { req.result = disque.has(key) ? { key, value: disque.get(key) } : undefined; if (req.onsuccess) req.onsuccess(); });
                    return req;
                },
                put(record) {
                    const req = {};
                    // Le commit est différé d'un tour de boucle : c'est CE délai
                    // qui existe en vrai, et pendant lequel getSync rend l'ancien.
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => { disque.set(record.key, record.value); if (tx.oncomplete) tx.oncomplete(); }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => { req.result = [...disque].map(([key, value]) => ({ key, value })); if (req.onsuccess) req.onsuccess(); });
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

/** Un DOM assez tolérant pour que l'éditeur de pratiques s'exécute. */
function fauxDocument() {
    const faire = () => ({
        value: '', checked: false, textContent: '', innerHTML: '', style: {},
        dataset: {}, disabled: false, options: [], selectedIndex: 0,
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        setAttribute() {}, getAttribute: () => null, removeAttribute() {},
        appendChild() {}, removeChild() {}, insertAdjacentHTML() {},
        addEventListener() {}, removeEventListener() {}, focus() {}, click() {},
        querySelector: () => null, querySelectorAll: () => [], closest: () => null
    });
    return {
        getElementById: () => faire(), querySelector: () => null, querySelectorAll: () => [],
        createElement: () => faire(), addEventListener() {}, removeEventListener() {},
        body: faire(), documentElement: faire()
    };
}

/** Monte la vraie db PUIS le vrai éditeur de pratiques, dans un même sandbox. */
async function monterEditeurPratiques() {
    const db = await monterDb();
    // lot N5 (#717) : la liste des cibles DEN (EditeurCibles), posée au chargement du formulaire.
    const winCibles = chargerScript('js/pratiques/editeur-cibles.js', { echapperHtml: (t) => String(t == null ? '' : t) });
    const win = chargerScript('js/pratiques-gestion.js', {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => p + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: fauxDocument(),
        BibliothequeUI: {
            obtenirAuteurActif: () => 'banc',
            forgerInspireDe: () => null,
            repertoires: { rendre() {} }
        },
        obtenirIdentiteUtilisateur: () => 'banc',
        afficherListePratiquesMateriel: async () => {},
        afficherBibliothequePratiques: async () => {},
        // Les aides d'affichage que l'éditeur appelle en remplissant le
        // formulaire : hors sujet ici, mais leur absence ferait un rouge de banc.
        toggleDisplay: () => {},
        setValeurChamp: () => {},
        getValeurChamp: () => '',
        getCheckbox: () => false,
        setCheckbox: () => {}
    }, winCibles);
    return { db, win };
}

/** Une pratique en édition, posée par le VRAI point d'entrée de l'éditeur. */
async function poserPratiqueEnEdition(db, win, pratique) {
    await db.set('a2026_pratiquesConfigurables', [pratique]);   // security-ok: littéral de banc, aucune source externe
    await win.chargerPratiquePourModif(pratique.id);
    // Garde de validité : sans pratique en édition, les éditeurs de cellule
    // sortent en silence (`if (!pratiqueEnEditionMateriel) return;`) et le test
    // passerait au vert sans avoir rien exercé.
    expect(win.obtenirPratiqueEnEditionMateriel(), 'le banc doit avoir une pratique en édition').toBe(pratique.id);
}

const PRATIQUE = () => ({
    id: 'P1', nom: 'Pratique du banc', type: 'standards',
    configuration: {
        typesTravaux: [{ id: 1, nom: '', description: '' }, { id: 2, nom: '', description: '' }],
        forfaits: [{ lettre: '', note: 0 }, { lettre: '', note: 0 }]
    }
});

/* ------------------------------------- A — le geste réel : deux champs voisins */

describe('#522 · A — deux cellules quittées coup sur coup gardent leurs deux saisies', () => {

    it('A.a LE CAS QUI PORTE LE SENS : nom et description d\'un type de travail', async () => {
        const { db, win } = await monterEditeurPratiques();
        await poserPratiqueEnEdition(db, win, PRATIQUE());

        // Les deux `change` partent SANS s'attendre : c'est le geste réel, quitter
        // la cellule « nom » pour cliquer dans la cellule « description » voisine.
        await Promise.all([
            win.modifierTypeTravailMat(0, 'nom', 'NOM-A'),
            win.modifierTypeTravailMat(0, 'description', 'DESCRIPTION-B')
        ]);

        const apres = await db.get('a2026_pratiquesConfigurables');
        const type = apres[0].configuration.typesTravaux[0];
        expect(type.nom, 'la saisie de la première cellule doit rester').toBe('NOM-A');
        expect(type.description).toBe('DESCRIPTION-B');
    });

    it('A.b deux lignes différentes du même tableau', async () => {
        const { db, win } = await monterEditeurPratiques();
        await poserPratiqueEnEdition(db, win, PRATIQUE());

        await Promise.all([
            win.modifierTypeTravailMat(0, 'nom', 'LIGNE-1'),
            win.modifierTypeTravailMat(1, 'nom', 'LIGNE-2')
        ]);

        const apres = await db.get('a2026_pratiquesConfigurables');
        expect(apres[0].configuration.typesTravaux[0].nom).toBe('LIGNE-1');
        expect(apres[0].configuration.typesTravaux[1].nom).toBe('LIGNE-2');
    });

    it('A.c DEUX ÉDITEURS DIFFÉRENTS, MÊME CLÉ : un forfait et un type de travail', async () => {
        // La file de `db.modifier` est PAR CLÉ, pas par fonction : c'est ce qui
        // protège deux zones distinctes du même écran qui écrivent la même
        // collection. Une correction fonction par fonction laisserait ce cas.
        const { db, win } = await monterEditeurPratiques();
        await poserPratiqueEnEdition(db, win, PRATIQUE());

        await Promise.all([
            win.modifierTypeTravailMat(0, 'nom', 'TYPE-A'),
            win.modifierForfaitMat(0, 'lettre', 'F')
        ]);

        const apres = await db.get('a2026_pratiquesConfigurables');
        expect(apres[0].configuration.typesTravaux[0].nom, 'la saisie du tableau des types doit rester').toBe('TYPE-A');
        expect(apres[0].configuration.forfaits[0].lettre, 'celle du tableau des forfaits aussi').toBe('F');
    });

    it('A.d dix rafales d\'affilée sur la même pratique : aucune ne se perd', async () => {
        const { db, win } = await monterEditeurPratiques();
        const pratique = PRATIQUE();
        pratique.configuration.typesTravaux = Array.from({ length: 10 }, (_, i) => ({ id: i, nom: '', description: '' }));
        await poserPratiqueEnEdition(db, win, pratique);

        await Promise.all(Array.from({ length: 10 }, (_, i) =>
            win.modifierTypeTravailMat(i, 'nom', 'N' + i)
        ));

        const apres = await db.get('a2026_pratiquesConfigurables');
        expect(apres[0].configuration.typesTravaux.map(t => t.nom)).toEqual(
            Array.from({ length: 10 }, (_, i) => 'N' + i)
        );
    });
});

/* ------------------------------------------------ B — les refus n'écrivent pas */

describe('#522 · B — un refus ne réécrit pas la collection', () => {

    it('B.a un index de type hors bornes laisse la collection intacte', async () => {
        // Réécrire « telle quelle » une collection qu'on n'a pas modifiée est
        // une occasion de plus de perdre ce qu'une autre rafale vient d'y poser.
        const { db, win } = await monterEditeurPratiques();
        const pratique = PRATIQUE();
        pratique.configuration.typesTravaux[0].nom = 'INTACT';
        await poserPratiqueEnEdition(db, win, pratique);

        await win.modifierTypeTravailMat(99, 'nom', 'X');

        const apres = await db.get('a2026_pratiquesConfigurables');
        expect(apres[0].configuration.typesTravaux[0].nom).toBe('INTACT');
    });

    it('B.b une pratique introuvable ne touche à rien', async () => {
        const { db, win } = await monterEditeurPratiques();
        const pratique = PRATIQUE();
        pratique.configuration.typesTravaux[0].nom = 'INTACT';
        await poserPratiqueEnEdition(db, win, pratique);

        // La pratique en édition est retirée de la collection sous les pieds de
        // l'éditeur (l'autre onglet l'a supprimée) : l'écriture doit être annulée.
        await db.set('a2026_pratiquesConfigurables', [{ id: 'AUTRE', configuration: { typesTravaux: [] } }]);   // security-ok: littéral de banc, aucune source externe
        await win.modifierTypeTravailMat(0, 'nom', 'X');

        const apres = await db.get('a2026_pratiquesConfigurables');
        expect(apres).toHaveLength(1);
        expect(apres[0].id).toBe('AUTRE');
    });
});

/* ------------------------------------------------------- C — le cliquet du lot */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sansCommentaires = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

// Liste FERMÉE au 30 août 2026 : les seules écritures de la clé qui restent
// hors de la file, avec la raison de chacune. Le compte ne peut que BAISSER —
// retirer une entrée quand elle disparaît. Toute écriture directe NEUVE rougit.
const TOLEREES = {
    // Entièrement SYNCHRONES : la séquence lire-modifier-écrire n'y rend jamais
    // la main, donc rien ne peut s'y intercaler (mono-thread). Les convertir
    // exigerait de les rendre asynchrones, donc d'auditer leurs appelants.
    'js/pratiques-gestion.js': {
        'copierPratiqueDepuisTrimestre': 'synchrone de bout en bout ; rend son résultat à l\'appelant'
        // ⮕ DEUX ENTRÉES RETIRÉES LE 30 AOÛT (lot 4) : `dupliquerPratiqueBibliotheque`
        // et `dupliquerEtEditerPratique` n'écrivaient pas elles-mêmes — elles
        // passaient par le helper transversal `BibliothequeUI`, qui faisait
        // `await d.lireListe()` puis `await d.ecrireListe(liste)`. Le helper
        // prend désormais un `modifierListe(mutateur)` sérialisé par
        // `db.modifier`, et les cinq familles (grilles, échelles, cartouches,
        // productions, pratiques) sont couvertes par ce seul changement.
        // Le cliquet les a réclamées de lui-même : c'est son versant inverse,
        // celui qui refuse qu'une tolérance survive à sa raison d'être.
    },
    'js/pratiques.js': {
        'migrerConfigurationsSpecifiques': 'migration de démarrage, synchrone, exécutée une seule fois',
        'migrerEtablissementsPratiques': 'migration de démarrage, synchrone, exécutée une seule fois',
        'importerPratiquesExternes': 'synchrone et REND un compteur : la rendre asynchrone changerait son contrat'
    }
};

describe('#522 · C — cliquet : la clé `pratiquesConfigurables` s\'écrit par la file', () => {

    it('C.a les seules écritures directes restantes sont celles de la liste fermée', () => {
        // ⚠ Assertion statique : les commentaires sont retirés AVANT de compter,
        // sinon un exemple cité en commentaire compte comme un site vivant.
        const trouvees = {};
        for (const f of Object.keys(TOLEREES)) {
            const src = sansCommentaires(readFileSync(path.join(racine, f), 'utf8'));
            const lignes = src.split('\n');
            for (const m of src.matchAll(/db\.(set|setSync)\s*\(\s*cle\(\s*'pratiquesConfigurables'\s*\)/g)) {
                const n = src.slice(0, m.index).split('\n').length;
                // La fonction englobante : la dernière déclaration au-dessus.
                // ⚠ Les DEUX formes, sinon le cliquet nomme faux : ce fichier
                // déclare aussi bien `function X(` que `window.X = function(`,
                // et ne chercher que la première attribuait l'écriture à la
                // fonction d'AVANT (constaté le 30 août sur importerPratiquesExternes).
                let fn = '(hors fonction nommée)';
                for (let i = n - 1; i >= 0; i--) {
                    const d = lignes[i].match(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/)
                        || lignes[i].match(/^\s*(?:window\.|const\s+|let\s+|var\s+)([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function/);
                    if (d) { fn = d[1]; break; }
                }
                (trouvees[f] ||= []).push(fn);
            }
        }

        for (const [f, fns] of Object.entries(trouvees)) {
            for (const fn of fns) {
                expect(TOLEREES[f], `écriture directe NEUVE dans ${f} · ${fn}() — la faire passer par db.modifier`).toHaveProperty(fn);
            }
        }
        // Et l'inverse : une entrée devenue inutile doit être retirée d'ici.
        for (const [f, entrees] of Object.entries(TOLEREES)) {
            for (const fn of Object.keys(entrees)) {
                expect(trouvees[f] || [], `${f} · ${fn}() n'écrit plus la clé : retirer son entrée de TOLEREES`).toContain(fn);
            }
        }
    });

    it('C.b et la file est bien celle de db.js, pas une sérialisation maison', () => {
        let parLaFile = 0;
        for (const f of ['js/pratiques-gestion.js', 'js/pratiques.js']) {
            const src = sansCommentaires(readFileSync(path.join(racine, f), 'utf8'));
            parLaFile += [...src.matchAll(/(?:db\.modifier|modifierEtAnnoncer)\s*\(\s*cle\(\s*'pratiquesConfigurables'\s*\)/g)].length;
        }
        // 22 sites convertis le 30 août ; le compte ne doit pas retomber.
        expect(parLaFile, 'les écritures de la clé passent par `db.modifier`').toBeGreaterThanOrEqual(22);
    });
});
