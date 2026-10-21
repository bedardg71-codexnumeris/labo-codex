import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 2c (30 août 2026) — LA COLLECTION DES GRILLES.
//
// Vingt-six sites lisaient `grillesTemplates`, y changeaient une entrée, puis
// réécrivaient la collection ENTIÈRE : vingt-quatre dans `js/grilles.js`, un
// dans `js/cartouches.js`, un dans `js/spe-specifications.js` (ce dernier fichier
// a été RETIRÉ le 1er septembre 2026, #681 — voir la liste PAR_LA_FILE).
//
// ⮕ LE SITE LE PLUS EXPOSÉ EST `modifierSousCritere` : c'est le geste de #510
// mot pour mot. L'éditeur de sous-critères est un tableau de champs dont le
// `change` part au blur, donc au moment PRÉCIS où l'on clique dans le champ
// suivant. Deux rafales lisaient le même instantané et la seconde réécrivait
// la grille SANS la modification de la première.
//
// ⮕ CINQ SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE : `dupliquerGrille`
// (un `prompt` de nom), `sauvegarderGrilleTemplate` (la question du doublon),
// et trois suppressions à confirmation. Tout ce qui s'enregistrait pendant que
// la question était à l'écran était écrasé par la collection lue AVANT.
//
// ⮕ ET `assurerGrilleDeDepart` VÉRIFIAIT SA PRÉSENCE HORS FILE : deux appels
// concurrents au démarrage semaient deux fois la même grille d'exemple, ou en
// perdaient une. La présence se vérifie désormais À L'INSTANT DE L'ÉCRITURE.
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

function fauxDocument() {
    return {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        body: { insertAdjacentHTML() {} },
        createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
        addEventListener() {}, removeEventListener() {}
    };
}

async function monterGrilles() {
    const db = await monterDb();
    const win = chargerScript('js/grilles.js', {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'GR_') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true, prompt: () => 'Copie',
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: fauxDocument(),
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        // `grilleTemplateActuelle` est déclarée dans js/config.js, chargé avant
        // grilles.js en production. Sans elle, la seule LECTURE lève une
        // ReferenceError — ce serait un rouge de banc, pas un défaut.
        grilleTemplateActuelle: null
    });
    // Ces deux-là sont appelées en `window.*` : les poser sur le sandbox rendu,
    // pas dans les globaux, sinon le script ne les voit pas.
    win.estRessourceSupprimee = () => false;
    win.marquerRessourceSupprimee = () => {};
    win.IDS_GABARITS_HARDCODES = [];

    for (const f of ['ajouterCritereGrille', 'supprimerCritereGrille', 'modifierSousCritere',
                     'ajouterSousCritere', 'deplacerCritereGrilleHaut', 'deplacerCritereGrilleBas']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const CLE = 'a2026_grillesTemplates';

const CRITERES = () => ([
    { id: 'CR_1', nom: 'Compréhension', ponderation: 50, sousCriteres: [
        { id: 'SC_1', code: '1', nom: '', ponderation: 1, retroaction: '' },
        { id: 'SC_2', code: '2', nom: '', ponderation: 1, retroaction: '' }
    ] },
    { id: 'CR_2', nom: 'Analyse', ponderation: 50, sousCriteres: [] }
]);

const GRILLES = () => ([
    { id: 'GR_A', nom: 'Grille A', dansBibliotheque: true, criteres: CRITERES() },
    { id: 'GR_B', nom: 'Grille B', dansBibliotheque: true, criteres: CRITERES() }
]);

const grilleDe = (liste, id) => liste.find((g) => g.id === id);

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 2c · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a modifierSousCritere — LE geste de #510, deux champs coup sur coup', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        // Le blur du premier champ part quand on clique dans le second.
        await Promise.all([
            win.modifierSousCritere('GR_A', 0, 0, 'nom', 'Syntaxe'),
            win.modifierSousCritere('GR_A', 0, 1, 'nom', 'Ponctuation')
        ]);

        const sc = grilleDe(await db.get(CLE), 'GR_A').criteres[0].sousCriteres;
        expect(sc[0].nom, 'la première saisie survit').toBe('Syntaxe');
        expect(sc[1].nom, 'la seconde saisie survit').toBe('Ponctuation');
    });

    it('A.b deux ajouts de critère sur la MÊME grille en donnent deux', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.ajouterCritereGrille('GR_A'), win.ajouterCritereGrille('GR_A')]);

        expect(grilleDe(await db.get(CLE), 'GR_A').criteres, 'deux de départ, plus les deux ajoutés')
            .toHaveLength(4);
    });

    it('A.c deux grilles modifiées en même temps : aucune ne perd sa modification', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.ajouterCritereGrille('GR_A'), win.ajouterSousCritere('GR_B', 1)]);

        const liste = await db.get(CLE);
        expect(grilleDe(liste, 'GR_A').criteres, 'A a gardé son critère').toHaveLength(3);
        expect(grilleDe(liste, 'GR_B').criteres[1].sousCriteres, 'B a gardé son sous-critère').toHaveLength(1);
    });

    it('A.d un ajout et une suppression concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.ajouterCritereGrille('GR_A'), win.supprimerCritereGrille('GR_B', 0)]);

        const liste = await db.get(CLE);
        expect(grilleDe(liste, 'GR_A').criteres, 'l\'ajout tient').toHaveLength(3);
        expect(grilleDe(liste, 'GR_B').criteres, 'la suppression tient').toHaveLength(1);
    });

    it('A.e assurerGrilleDeDepart — deux appels concurrents ne sèment QU\'UNE grille', async () => {
        // Le semis vérifiait sa présence hors file : deux appels au démarrage
        // pouvaient créer deux exemplaires de la même grille d'exemple.
        const { db, win } = await monterGrilles();
        await db.set(CLE, []);   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.assurerGrilleDeDepart(), win.assurerGrilleDeDepart()]);

        const semees = (await db.get(CLE)).filter((g) => g.id === 'GRILLE_GENERIQUE');
        expect(semees, 'une seule grille générique').toHaveLength(1);
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#522 lot 2c · B — un geste impossible REFUSE l\'écriture', () => {

    it('B.a un ajout sur une grille absente ne touche à rien', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await win.ajouterCritereGrille('GR_FANTOME');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(GRILLES()));
    });

    it('B.b modifierSousCritere hors bornes ne réécrit rien', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await win.modifierSousCritere('GR_A', 0, 99, 'nom', 'Fantôme');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(GRILLES()));
    });

    it('B.c le dernier critère ne descend pas', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await win.deplacerCritereGrilleBas('GR_A', 1);

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(GRILLES()));
    });

    it('B.d deplacerCritereGrilleHaut échange bien deux critères voisins', async () => {
        const { db, win } = await monterGrilles();
        await db.set(CLE, GRILLES());   // security-ok: littéral de banc, aucune source externe

        await win.deplacerCritereGrilleHaut('GR_A', 1);

        const criteres = grilleDe(await db.get(CLE), 'GR_A').criteres;
        expect(criteres[0].id, 'le second est monté').toBe('CR_2');
        expect(criteres[1].id, 'le premier est descendu').toBe('CR_1');
    });
});

/* ------------------------------------------------- C — le cliquet du lot 2c */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

function fonctionContenant(src, offset) {
    const entetes = [...src.slice(0, offset).matchAll(/\b([A-Za-z0-9_$.]+)\s*=\s*function\s*\(|\bfunction\s+([A-Za-z0-9_$]+)\s*\(/g)];
    if (!entetes.length) return '(hors fonction)';
    const d = entetes[entetes.length - 1];
    return (d[1] || d[2]).replace(/^window\./, '');
}

// La liste FERMÉE des écritures directes qui subsistent, avec leur raison.
// Chacune est synchrone de bout en bout (régime R3 de l'audit) : sans point de
// suspension entre la lecture et l'écriture, rien ne peut s'intercaler.
const SETSYNC_ADMIS = {
    'js/grilles.js': ['importerGrillesExternes'],
    // ↻ Lot E1 (27 sept. 2026) : `wizardV2CreerGrilleDemo` n'écrit plus rien (D3) ; la grille
    // de base est écrite par `finaliserCreationPratique`, dans la file (`modifierEtAnnoncer`).
    'js/wizard-pratique-v2.js': [],
    'js/import-export.js': ['executerImportConfigComplete', 'executerImportSelectif']
};

const PAR_LA_FILE = {
    // ⚠ 27 -> 24 le 31 août 2026 (#624), ET LE MOTIF COMPTE AUTANT QUE LE CHIFFRE.
    // Ce n'est PAS une attente alignée sur l'observé : la baisse est le BUT du lot.
    // Les quatre portes de suppression de grille portaient chacune leur propre
    // `db.modifier(cle('grillesTemplates'))` — quatre copies du même geste sous deux
    // politiques opposées. Elles délèguent maintenant toutes à un chemin unique, dont
    // l'unique écriture vit dans `_retirerGrilleDeLaListe`.
    //   27 − 4 (les quatre portes) + 1 (`_retirerGrilleDeLaListe`) = 24.
    // ⮕ C.d verrouille que la consolidation n'a pas fait DISPARAÎTRE l'invariant :
    //   il a changé d'adresse. Ne baisse jamais ce nombre sans montrer où le geste
    //   retiré est parti.
    // 24 → 26 le 31 août 2026 (#667) : `modifierFormuleCritereGrille` et
    // `modifierParamFormuleCritereGrille` écrivent le modèle de formule d'un
    // critère. Elles passent par la file comme les autres — c'est justement
    // ce que cette sentinelle exige, pas une exception qu'on lui concède.
    // 26 → 27 le 1er septembre 2026 (#668) : `modifierProjectionCritereGrille`
    // écrit le modèle de PROJECTION, ses paramètres et ses paliers. UNE seule
    // fonction pour les trois — elle prend un mutateur, là où #667 en avait
    // écrit deux. Six handlers du gabarit s'y adossent sans ajouter d'écriture :
    // c'est la direction que cette sentinelle récompense, moins de portes pour
    // plus de gestes. Le +1 est donc un ajout de CAPACITÉ, pas de dispersion.
    // 27 → 28 le 4 septembre 2026 (lot 4, §8 f) : `_deplacerSousCritere` — un sous-critère
    // se déplace aux chevrons, comme un critère. Par la file, comme les autres : c'est
    // ce que cette sentinelle exige, et le compte monte parce qu'un geste est né.
    // 28 → 27 le 9 octobre 2026 (#467) : `importerDansGrilleActive` est partie, sans
    // déclencheur (inventaire du lot F, 29 sept. : « code mort ») ; un import JSON
    // brut de moins.
    // 27 → 25 le même jour (#467) : l'îlot de la fenêtre des catégories d'erreurs est
    // parti (sans déclencheur) ; elle semait les catégories à l'ouverture
    // (`afficherConfigurationCategoriesErreurs`) et les enregistrait
    // (`sauvegarderCategoriesErreurs`), deux écritures par la file.
    // 24 → 25 le 19 octobre 2026 (la dissection, lot 13) : `_modifierReponsesCritere` — les
    // réponses d'un critère se modifient. UNE fonction pour les quatre gestes (texte, points,
    // ajout, retrait), qui prend l'opération, comme `modifierProjectionCritereGrille` (#668).
    // 25 → 26 le 20 octobre 2026 (#1120, lot 1) : `_modifierBaremeCritere` — le barème d'un
    // critère analytique, sur le même patron (une fonction, l'opération en paramètre). Celle des
    // réponses reste, réduite au texte par niveau des critères holistiques.
    'js/grilles.js': 21,   // #1131 (21 oct.) : 22 → 21, les sous-critères par défaut écrivent par `_modifierCritereCible` ; #469 (12 oct. 2026) : ajouterGrillesABibliotheque partie ; #1120 (21 oct.) : 26 → 22, le barème et
                           // les sous-critères écrivent par UNE file commune (`_modifierCritereCible`), au lieu de cinq
    'js/cartouches.js': 0,   // #469 (12 oct. 2026) : son seul site partait avec une fonction sans appelant
    // ⚰ Retiré le 1er septembre 2026 avec `js/spe-specifications.js` (#681) :
    // code mort, zéro consommateur vivant. Son unique site écrivait bien par la
    // file ; c'est le fichier qui est parti.
    'js/donnees-v2.js': 1
};

describe('#522 lot 2c · C — la course ne peut pas se rouvrir en silence', () => {

    it('C.a plus AUCUN db.set sur la collection des grilles, nulle part', () => {
        for (const f of [...Object.keys(PAR_LA_FILE), ...Object.keys(SETSYNC_ADMIS)]) {
            expect((lire(f).match(/db\.set\(cle\('grillesTemplates'\)/g) || []).length, f).toBe(0);
        }
    });

    it('C.b chaque fichier converti écrit par la file, au compte attendu', () => {
        for (const [f, attendu] of Object.entries(PAR_LA_FILE)) {
            const n = (lire(f).match(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('grillesTemplates'\)/g) || []).length;
            expect(n, `${f} : écritures par la file`).toBe(attendu);
        }
    });

    it('C.c les écritures directes restantes sont NOMMÉES, et toutes synchrones', () => {
        for (const [f, admises] of Object.entries(SETSYNC_ADMIS)) {
            const src = lire(f);
            const noms = [...src.matchAll(/db\.setSync\(cle\('grillesTemplates'\)/g)]
                .map((m) => fonctionContenant(src, m.index)).sort();
            expect(noms, `${f} : liste fermée des écritures directes`).toEqual([...admises].sort());
        }
    });

    it('C.d les cinq fenêtres d\'attente humaine écrivent DANS la file', () => {
        // Le défaut le plus coûteux du lot : une collection lue avant une
        // question, réécrite après. Chacune doit porter un `db.modifier`.
        const src = lire('js/grilles.js');
        // ⚠ LISTE RÉÉCRITE le 31 août 2026 (#624), PAS RACCOURCIE. Les trois chemins
        // de suppression ne portent plus l'écriture eux-mêmes : ils délèguent. Retirer
        // simplement leurs noms aurait emporté le SUJET de l'assertion et rendu la
        // sentinelle verte en ne surveillant plus rien. L'invariant — « toute fenêtre
        // d'attente humaine écrit DANS la file » — reste vrai ; il a changé d'adresse,
        // et le maillon de délégation est vérifié juste en dessous.
        for (const nom of ['dupliquerGrille', 'sauvegarderGrilleTemplate',
                           '_retirerGrilleDeLaListe']) {
            const debut = src.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = src.slice(debut, debut + 5000);
            expect(corps, `${nom} : n'écrit pas par la file`)
                .toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('grillesTemplates'\)/);
        }

        // ⮕ LE MAILLON AJOUTÉ, pas remplacé (#624). Les quatre portes de suppression
        // doivent atteindre la file PAR le chemin unique. Sans cette assertion, une
        // porte qui cesserait de déléguer — en redevenant nue, le défaut d'origine —
        // laisserait la boucle ci-dessus parfaitement verte.
        for (const nom of ['supprimerGrille', 'supprimerGrilleDefinitivement',
                           'supprimerGrilleDepuisSidebar', 'supprimerGrilleActive']) {
            const debut = src.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = src.slice(debut, debut + 5000);
            expect(corps, `${nom} : ne délègue pas au chemin gardé`)
                .toMatch(/supprimerGrilleAvecPorteDeSortie\(/);
        }
    });

    it('C.e assurerGrilleDeDepart vérifie sa présence DANS le mutateur', () => {
        // Vérifier avant d'entrer dans la file laisserait deux semis concurrents
        // passer tous les deux.
        const src = lire('js/grilles.js');
        const debut = src.indexOf('function assurerGrilleDeDepart(');
        const corps = src.slice(debut, src.indexOf('function initialiserModuleGrilles', debut));
        const posFile = corps.search(/(?:db\.modifier|modifierEtAnnoncer)\(/);   // lot E1 : la même file, annoncée
        const posTest = corps.indexOf("some(g => g.id === 'GRILLE_GENERIQUE')");
        expect(posFile, 'la file est absente').toBeGreaterThan(-1);
        expect(posTest, 'le test de présence est absent').toBeGreaterThan(posFile);
    });
});
