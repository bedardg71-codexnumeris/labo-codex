import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// SENTINELLE S5 / #623 — LES CARTOUCHES SUIVENT LE RÉGIME DE LEUR GRILLE
// =====================================================================
//
// Écrit ROUGE le 31 août 2026 contre le code d'alors, puis passé au VERT par les
// volets (a) et (c) du correctif. Le détail du rouge est consigné plus bas : il
// prouve que cette sentinelle a mordu avant d'être verte, et pour quelles raisons.
//
// ⚠⚠ UN VERT ICI NE VEUT PAS DIRE QUE S5 EST LIVRÉ.
// Le routage ne change le comportement que des sites qui APPELLENT `cle()` /
// `cleSource()` — 9 sites mesurés. Les 65 autres composent la clé en LITTÉRAL et
// parlent à `db` directement : ils lisent et écrivent encore la clé nue, sans
// passer par le routage. L'application est donc dans un état INCOHÉRENT tant que
// le volet (d), les 65 sites, et le volet (b), la migration au boot, ne sont pas
// livrés. Ce fichier exerce le routage et l'archivage ; il ne dit RIEN des 65
// autres sites. Ne pas lire son vert comme un feu vert au chantier.
//
// ---------------------------------------------------------------------
// CE QUE LE CODE FAIT AUJOURD'HUI (régime GLOBAL) — mesuré, pas supposé
// ---------------------------------------------------------------------
// `cle()` rend la clé **NUE** dès que le nom commence par `cartouches_` :
//     js/trimestres.js:344 → `if (CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')) return nomCle;`
// Une seule clé `cartouches_<grilleId>` sert donc TOUS les trimestres qui
// partagent une grille. En mode archive seulement, une branche antérieure
// (`:333-340`) dévie vers `<trim>_cartouches_<grilleId>` si la copie existe —
// copie posée à l'archivage par `creerSnapshotRessources` (`:771-777`).
// Et au désarchivage, `purgerCopiesModelesArchive` **supprime** cette copie
// (`:1085`), délibérément : dans le régime global elle redevient orpheline, et
// le commentaire `:1082-1084` l'écrit en toutes lettres.
//
// ⮕ C'est cohérent AUJOURD'HUI. Ça devient une perte de données dès que les
//   cartouches sont namespacées sans que la purge soit retirée — d'où les trois
//   volets indissociables du §6.3 de l'audit Z1.
//
// ---------------------------------------------------------------------
// ROUGE OBTENU LE 31 AOÛT 2026, CONTRE LE CODE ACTUEL — cas par cas
// ---------------------------------------------------------------------
// Consigné AVANT que le correctif existe : c'est la preuve que cette sentinelle
// a mordu pour la bonne raison, et non qu'elle a été écrite pour être verte.
// Exécution initiale, AVANT correctif : 6 cas, 4 rouges, 2 verts. Les deux verts
// sont les gardes de validité, et elles DOIVENT rester vertes : l'une vérifie que
// le chemin IndexedDB est bien forcé, l'autre que le corpus partage réellement la
// grille G1 — sans quoi l'isolation serait vraie par vacuité.
// Un 7e cas (archivage d'un trimestre NON actif) a été ajouté APRÈS le correctif,
// parce qu'une mesure a montré qu'il manquait — son commentaire le raconte.
//
// 1. « une cartouche écrite en H2026 n'est PAS visible depuis A2025 »
//    attendu [] — observé [{ id: 'CART_H', texte: 'rétroaction écrite en Hiver 2026' }]
//    ⮕ `cleSource('cartouches_G1','a2025')` rend la clé NUE `cartouches_G1`
//      (js/trimestres.js:409, la condition `|| nomCle.startsWith('cartouches_')`),
//      la même case que `cle()` a rendue à H2026 (:344). Une seule case, deux
//      trimestres : A2025 lit ce que H2026 a écrit.
//
// 2. « chaque trimestre garde SES cartouches quand les deux en écrivent »
//    attendu [CART_A] — observé [CART_H]
//    ⮕ Le versant ÉCRITURE du même partage : la seconde écriture n'a pas
//      coexisté avec la première, elle l'a REMPLACÉE. Le cas 1 seul ne l'aurait
//      pas montré — un routage qui isolerait la lecture sans isoler l'écriture
//      passerait le cas 1 et échouerait ici.
//
// 3. « les cartouches d'A2025 survivent à archivage PUIS désarchivage »
//    attendu [CART_A] — observé [CART_H]
//    ⮕ `archiverTrimestre` a bien posé `a2025_cartouches_G1` (garde vérifiée,
//      non nulle). `desarchiverTrimestre` l'a supprimée via
//      `purgerCopiesModelesArchive` (js/trimestres.js:1085). A2025 retombe donc
//      sur la clé nue, que H2026 a réécrite entre-temps : ses rétroactions sont
//      perdues, sans message. C'est mot pour mot la perte que #358/#359 ont
//      corrigée pour les grilles.
//
// 4. « le désarchivage ne détruit RIEN qui porte des cartouches du trimestre »
//    attendu [] — observé ['a2025_cartouches_G1']
//    ⮕ Le même défaut vu sur le GESTE plutôt que sur son effet : le
//      désarchivage NOMME lui-même la clé qu'il détruit, dans `copiesPurgees`.
//      Cette valeur observée est aussi la garde du cas 3 : elle prouve que le
//      chemin de purge a été réellement emprunté, et non sauté faute de grille
//      identifiée.
//
// ⮕ Les quatre valeurs observées sont celles du régime GLOBAL, et aucune ne
//   vient d'un montage bancal : archivage et désarchivage rendent tous deux
//   `success: true`, et la copie existait bien avant d'être purgée.
//
// ---------------------------------------------------------------------
// VALIDITÉ DU BANC — la condition sans laquelle il ne prouve RIEN
// ---------------------------------------------------------------------
// ⚠⚠ Node n'a pas d'IndexedDB : `db.js` s'y rabat sur le mode localStorage-seul,
// où `set` écrit SYNCHRONEMENT. La fenêtre pendant laquelle `getSync` rend
// encore l'ancienne valeur n'existe alors pas — et un banc qui l'ignore rend
// toute COURSE d'écriture structurellement impossible à observer, donc verte
// sur du code non corrigé. C'est le principe, et il est juste.
// Le plan l'exige (ligne 127) pour S4 et S5 nommément. `fausseConnexionIDB` et
// `monterDb` ci-dessous sont repris de `tests/unit/sentinelle-522-pratiques-serialisees.test.js:64-101`
// (locaux à ce fichier, non exportables — d'où la copie plutôt que l'import).
//
// ⚠ MAIS — MESURÉ, ET IL FAUT LE DIRE : sur CES deux cas, le forçage ne change
// RIEN au résultat. Banc relancé le 31 août avec le forçage retiré : 4 rouges,
// 1 vert, à l'identique. La raison est simple et vaut d'être comprise plutôt que
// répétée : ces cas mesurent un ROUTAGE DE CLÉ, pas une course d'écriture. Deux
// trimestres qui partagent la même case se marchent dessus quel que soit le
// moment où l'écriture atterrit — le défaut est structurel, pas temporel.
// Le forçage est CONSERVÉ : il est exigé pour tout test d'écriture
// inter-namespace, il rend le banc fidèle au chemin de production, et il
// protégera le premier cas de COURSE qu'on ajoutera ici. Mais personne ne doit
// croire qu'il est ce qui fait rougir les quatre cas actuels : ce serait prêter
// à une garde un mérite qu'elle n'a pas, et se reposer dessus ailleurs.
//
// ⚠ SUR QUOI CE FICHIER N'ASSERTE PAS : le snapshot d'archivage porte DEUX
// champs nommés `cartouches` à quelques lignes d'écart — `ressources.cartouches`
// est une CARTE `{grilleId: [...]}` (`js/trimestres.js:800`), et
// `statistiquesFinales.…cartouches` est un COMPTE (`:830`). Asserter sur l'un en
// croyant tenir l'autre est un faux vert tout prêt. Toutes les assertions
// ci-dessous portent sur le STOCKAGE (`db.getSync` de la clé effectivement
// routée), jamais sur le snapshot.
//
// ⚠ PAS DE CAS DE COURSE ICI, ET C'EST DÉLIBÉRÉ. Deux écritures concurrentes sur
// deux trimestres ne sont pas couvertes : ni le §6.3 ni le lot ne le demandaient,
// et il valait mieux ne pas gonfler la sentinelle avant que S5 soit complet
// (décision `kuekatsheu-c8`, 31 août). C'est le cas qui aurait besoin du forçage
// IndexedDB — contrairement aux sept ci-dessous. À décider après S5.
//
// ⚠ IL NE VOIT PAS LE RENDU. La barre latérale des cartouches et la matrice sont
// du DOM ; Vitest est du Node. Une spec Playwright/WebKit est due EN PLUS, et
// elle sera écrite avec le vert (une spec rouge dans `tests/integration/`
// bloquerait le push de tout le monde, exactement comme ce fichier-ci).

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

/** Le chemin IndexedDB de production, rendu à Node qui ne l'a pas. */
function fausseConnexionIDB() {
    const disque = new Map();
    return {
        transaction() {
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = disque.has(key) ? { key, value: disque.get(key) } : undefined;
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                put(record) {
                    const req = {};
                    // Commit différé d'un tour de boucle : c'est CE délai qui
                    // existe en vrai, et pendant lequel getSync rend l'ancien.
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            disque.set(record.key, record.value);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                delete(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            disque.delete(key);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = [...disque].map(([key, value]) => ({ key, value }));
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
    // Garde de validité : sans base prête, tout ce qui suit ne prouve rien.
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('Banc invalide : db non prête.');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

/** Monte la vraie `js/trimestres.js` sur la vraie `db`. */
async function monterTrimestres() {
    const db = await monterDb();
    const win = chargerScript('js/trimestres.js', {
        db,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        obtenirDonneesSelonMode: (nom) => db.getSync(nom, []) || [],
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || '') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true,
        afficherListeTrimestres: () => {},
        mettreAJourBandeauTrimestre: () => {}
    });
    if (typeof win.cle !== 'function' || typeof win.cleSource !== 'function') {
        throw new Error('Banc invalide : trimestres.js n\'a pas exposé cle/cleSource.');
    }
    return { db, win };
}

const TRIMESTRES = [
    { id: 'a2025', nom: 'Automne 2025', actif: false, archive: false },
    { id: 'h2026', nom: 'Hiver 2026', actif: true, archive: false }
];

/** Cartouche minimale, reconnaissable à son texte. */
const cartouche = (id, texte) => ({ id, texte, grilleId: 'G1' });

const C_H2026 = cartouche('CART_H', 'rétroaction écrite en Hiver 2026');
const C_A2025 = cartouche('CART_A', 'rétroaction écrite en Automne 2025');

let db;
let win;

beforeEach(async () => {
    ({ db, win } = await monterTrimestres());

    // Les deux trimestres partagent la MÊME grille : c'est la condition qui rend
    // le partage de clé observable. Sans grille commune, chaque `cartouches_X`
    // n'aurait qu'un propriétaire et rien ne se croiserait.
    db.setSync('trimestres', structuredClone(TRIMESTRES));
    db.setSync('trimestreActif', 'h2026');
    db.setSync('grillesTemplates', [{ id: 'G1', nom: 'Grille partagée', echelleId: 'E1' }]);

    // `identifierTemplatesUtilises` dérive les grilleIds de `<id>_productions` et
    // `<id>_evaluationsSauvegardees` (js/trimestres.js:660-677). SANS cette
    // production, l'archivage ne copierait AUCUNE cartouche et le désarchivage
    // n'en purgerait aucune : le cas 2 passerait au vert sans rien exercer.
    db.setSync('a2025_productions', [{ id: 'P_A', grilleId: 'G1', nom: 'Production A2025' }]);
    db.setSync('h2026_productions', [{ id: 'P_H', grilleId: 'G1', nom: 'Production H2026' }]);
});

/** Ce que le trimestre `id` voit comme cartouches de la grille `G1`. */
const cartouchesVuesPar = (id) => db.getSync(win.cleSource('cartouches_G1', id), []) || [];

/**
 * Bascule le trimestre actif PAR LE VRAI GESTE, et VÉRIFIE que la bascule a pris.
 *
 * ⚠ Faux rouge attrapé le 31 août, et il vaut d'être consigné : ce banc posait
 * d'abord `db.setSync('trimestreActif', id)`. Cette clé existe (elle est l'un des
 * trois miroirs écrits par `changerTrimestreActif`, js/trimestres.js:507), mais
 * `cle()` ne la lit JAMAIS : il passe par `obtenirTrimestreActif()`, qui filtre le
 * tableau `trimestres` sur `t.actif === true` (:245-257). La bascule n'avait donc
 * aucun effet, les deux écritures atterrissaient dans le MÊME namespace, et deux
 * cas rougissaient en accusant un correctif parfaitement correct.
 * ⮕ Une clé qui porte le bon nom n'est pas la source de vérité. Ici la source est
 *   le champ `actif` du tableau — et la garde ci-dessous refuse d'avancer sans elle.
 */
function activerTrimestre(id) {
    const ok = win.changerTrimestreActif(id);
    if (ok === false) throw new Error(`Banc invalide : changerTrimestreActif('${id}') a refusé.`);
    const actif = win.obtenirTrimestreActif();
    if (!actif || actif.id !== id) {
        throw new Error(`Banc invalide : trimestre actif = ${actif && actif.id} au lieu de ${id}.`);
    }
}

describe('S5 / #623 · cas 1 — ISOLATION : un trimestre ne voit pas les cartouches d\'un autre', () => {

    it('garde de validité du BANC : le chemin IndexedDB de production est bien forcé', () => {
        // Le forçage doit être VISIBLE, pas supposé. S'il se perdait (refonte de
        // `monterDb`, changement d'API de db.js), le banc retomberait en silence
        // sur le mode localStorage-seul de Node — sans conséquence pour les cas
        // actuels (mesuré), mais fatal au premier cas de course ajouté ici.
        expect(db.useIndexedDB, 'le chemin IndexedDB n\'est pas forcé — voir l\'en-tête').toBe(true);
        expect(db.db, 'aucune fausse connexion IDB branchée').not.toBeNull();
    });

    it('garde de validité : les deux trimestres existent et partagent bien la grille G1', () => {
        // Sans ce cas, un corpus mal monté ferait passer l'isolation PAR VACUITÉ :
        // deux trimestres qui ne partagent rien sont trivialement isolés.
        const trimestres = db.getSync('trimestres', []);
        expect(trimestres.map((t) => t.id).sort()).toEqual(['a2025', 'h2026']);
        expect(db.getSync('grillesTemplates', []).map((g) => g.id)).toEqual(['G1']);
        expect(db.getSync('a2025_productions', [])[0].grilleId).toBe('G1');
        expect(db.getSync('h2026_productions', [])[0].grilleId).toBe('G1');
    });

    it('une cartouche écrite en H2026 n\'est PAS visible depuis A2025', async () => {
        // Écriture par le VRAI chemin de routage, pas par une clé écrite à la main.
        await db.set(win.cle('cartouches_G1'), [C_H2026]);

        expect(cartouchesVuesPar('h2026')).toEqual([C_H2026]);

        // ⮕ L'ASSERTION QUI ACCUSE. Aujourd'hui `cle()` et `cleSource()` rendent
        //   tous deux la clé NUE `cartouches_G1` (js/trimestres.js:344 et :409) :
        //   A2025 lit la même case et voit la cartouche de H2026.
        expect(
            cartouchesVuesPar('a2025'),
            'Régime GLOBAL : A2025 lit la clé nue `cartouches_G1`, donc la cartouche de H2026. '
            + 'Après S5, `cle()` doit router vers `<trim>_cartouches_G1`.'
        ).toEqual([]);
    });

    it('chaque trimestre garde SES cartouches quand les deux en écrivent', async () => {
        // La paire d'effets, dans les deux sens : ce n'est pas seulement « A2025
        // ne voit pas H2026 », c'est aussi « l'écriture de H2026 n'ÉCRASE pas
        // celle d'A2025 ». Un routage qui isolerait la lecture sans isoler
        // l'écriture passerait le cas précédent et échouerait ici.
        activerTrimestre('a2025');
        await db.set(win.cle('cartouches_G1'), [C_A2025]);

        activerTrimestre('h2026');
        await db.set(win.cle('cartouches_G1'), [C_H2026]);

        expect(cartouchesVuesPar('h2026')).toEqual([C_H2026]);
        expect(
            cartouchesVuesPar('a2025'),
            'Régime GLOBAL : la seconde écriture a écrasé la première dans la même case.'
        ).toEqual([C_A2025]);
    });

});

describe('S5 / #623 · cas 2 — SURVIE AU DÉSARCHIVAGE (volet c)', () => {

    it('les cartouches d\'A2025 survivent à archivage PUIS désarchivage, même si H2026 a écrit entre-temps', async () => {
        // Le scénario de perte RÉEL, et il faut les trois temps. Sans l'écriture
        // de H2026 au milieu, la clé nue contiendrait encore les cartouches
        // d'A2025 après la purge, et le test passerait au VERT sans rien prouver.
        activerTrimestre('a2025');
        await db.set(win.cle('cartouches_G1'), [C_A2025]);

        // 1. Archivage d'A2025 : `creerSnapshotRessources` copie la clé nue vers
        //    `a2025_cartouches_G1` (js/trimestres.js:771-777).
        activerTrimestre('h2026');
        const archivage = win.archiverTrimestre('a2025');
        expect(archivage && archivage.success, 'l\'archivage a échoué — le cas n\'exerce rien').toBe(true);

        // GARDE : la donnée d'A2025 existe bien sous SON namespace avant la
        // suite. Sans elle, l'assertion finale mesurerait un zéro.
        // ⚠ Cette garde a CHANGÉ DE NATURE avec le volet (c1) : avant, elle
        // vérifiait la COPIE que `creerSnapshotRessources` posait à l'archivage ;
        // ce `db.setSync` a été retiré (la donnée est déjà namespacée, il se
        // copierait sur lui-même). Ce qu'elle vérifie désormais, c'est la donnée
        // VIVANTE écrite par `cle()` quand A2025 était actif.
        expect(
            db.getSync('a2025_cartouches_G1', null),
            'garde : A2025 n\'a pas de cartouches sous son propre namespace — ce cas ne prouve rien'
        ).not.toBeNull();

        // 2. H2026 écrit SES cartouches dans la case partagée.
        await db.set(win.cle('cartouches_G1'), [C_H2026]);

        // 3. Désarchivage : `purgerCopiesModelesArchive` retire la copie (:1085).
        const desarchivage = win.desarchiverTrimestre('a2025');
        expect(desarchivage && desarchivage.success, 'le désarchivage a échoué — le cas n\'exerce rien').toBe(true);

        // ⮕ L'ASSERTION QUI ACCUSE. A2025 désarchivé doit retrouver SES
        //   rétroactions. Aujourd'hui sa copie vient d'être supprimée et il
        //   retombe sur la clé nue, où H2026 a écrit : ses cartouches sont
        //   perdues, silencieusement.
        expect(
            cartouchesVuesPar('a2025'),
            'Volet (c) : la branche cartouches de `purgerCopiesModelesArchive` '
            + '(js/trimestres.js:1085) a détruit la copie d\'A2025, qui retombe sur la clé '
            + 'nue réécrite par H2026. C\'est la perte que #358/#359 ont corrigée pour les grilles.'
        ).toEqual([C_A2025]);
    });

    it('archiver un trimestre NON ACTIF prend SES cartouches, pas celles de l\'actif', async () => {
        // ⚠ CE CAS EXISTE PARCE QU'UNE MESURE A MONTRÉ QU'IL MANQUAIT.
        // Les autres cas assertent sur le STOCKAGE lu après désarchivage ; aucun
        // ne regarde le CONTENU du snapshot. Break-test du 31 août : remplacer
        // `cleSource(..., trimestreId)` par `cle(...)` dans la boucle du snapshot
        // (js/trimestres.js:806) laissait ce fichier VERT à 6/6 — l'erreur serait
        // passée. `cle()` route par le trimestre ACTIF, or `creerSnapshotRessources`
        // reçoit `trimestreId` en PARAMÈTRE et archive couramment un trimestre qui
        // n'est pas l'actif : le snapshot aurait été juste en apparence et rempli
        // des cartouches d'un AUTRE trimestre.
        //
        // C'est le piège que le fichier documentait DÉJÀ dix lignes plus haut pour
        // #622/B3 (`:761-763`) et qui a failli être rejoué dans la même fonction.
        // Un piège écrit dans un commentaire n'arrête personne ; une sentinelle si.
        //
        // ⮕ Ici, et ici SEULEMENT, on asserte sur le snapshot. On prend la CARTE
        //   `ressources.cartouches` (`:800`, `{grilleId: [...]}`) — PAS le COMPTE
        //   homonyme de `statistiquesFinales` (`:830`) : la question est « lesquelles
        //   ont été enregistrées », pas « combien ».
        activerTrimestre('a2025');
        await db.set(win.cle('cartouches_G1'), [C_A2025]);
        activerTrimestre('h2026');
        await db.set(win.cle('cartouches_G1'), [C_H2026]);

        // A2025 n'est PAS l'actif au moment où on l'archive — c'est le cas normal.
        expect(win.obtenirTrimestreActif().id, 'garde : le cas doit archiver un NON-actif').toBe('h2026');
        const archivage = win.archiverTrimestre('a2025');
        expect(archivage && archivage.success).toBe(true);

        const trimestre = db.getSync('trimestres', []).find((t) => t.id === 'a2025');
        expect(trimestre.snapshotRessources, 'garde : aucun snapshot écrit — le cas ne prouve rien').toBeTruthy();
        const snapshot = db.getSync(trimestre.snapshotRessources, null);
        expect(snapshot, 'garde : snapshot introuvable sous sa clé').not.toBeNull();

        expect(
            snapshot.cartouches && snapshot.cartouches.G1,
            'Le snapshot d\'A2025 contient les cartouches d\'un AUTRE trimestre : la boucle '
            + 'route par le trimestre ACTIF au lieu du trimestre ARCHIVÉ (cleSource, pas cle).'
        ).toEqual([C_A2025]);
    });

    it('le désarchivage ne détruit RIEN qui porte des cartouches du trimestre', async () => {
        // Formulation complémentaire, sur le geste plutôt que sur son effet :
        // après S5, aucune clé `a2025_cartouches_*` ne doit figurer dans ce que
        // le désarchivage déclare avoir purgé.
        activerTrimestre('a2025');
        await db.set(win.cle('cartouches_G1'), [C_A2025]);
        activerTrimestre('h2026');

        win.archiverTrimestre('a2025');
        const desarchivage = win.desarchiverTrimestre('a2025');
        const purgees = (desarchivage && desarchivage.copiesPurgees) || [];

        expect(
            purgees.filter((k) => k.includes('cartouches_')),
            'Volet (c) : le désarchivage purge encore les copies de cartouches.'
        ).toEqual([]);
    });

});
