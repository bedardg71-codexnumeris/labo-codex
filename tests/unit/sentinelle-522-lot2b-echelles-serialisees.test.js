import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 2b (30 août 2026) — LA COLLECTION DES ÉCHELLES.
//
// Vingt sites de `js/echelles.js` et un de `js/donnees-v2.js` lisaient
// `echellesTemplates`, y changeaient une entrée, puis réécrivaient la
// collection ENTIÈRE. Deux gestes rapprochés lisaient le même instantané et le
// second écrasait le premier, sans message et sans erreur.
//
// ⮕ TROIS SITES PORTAIENT UNE FENÊTRE D'ATTENTE HUMAINE, et ce sont les pires :
// `dupliquerEchelle` (un `prompt` de nom), `supprimerEchelleDefinitivement` et
// `supprimerEchelleDepuisSidebar` (une confirmation, parfois deux questions).
// Tout ce qui s'enregistrait pendant que la question était à l'écran était
// écrasé par la collection lue AVANT la question. C'est le défaut mesuré au
// lot 1 sur `partagerPratique`. Le remède est le même : lire hors file pour
// POSER la question, puis relire dans la file pour ÉCRIRE.
//
// ⚠ `donnees-v2.js` relevait du régime R2 : `getSync` puis `await db.set`.
// « Lecture synchrone » ne veut pas dire « séquence atomique » — dans `db.set`,
// l'écriture IndexedDB est attendue AVANT le rafraîchissement de localStorage,
// et `getSync` rend l'ancienne valeur pendant tout cet aller-retour.
//
// ⚠⚠ LE BANC : chemin IndexedDB rétabli ET clone structuré. Sans le clone, deux
// lecteurs partagent le même tableau, les deux modifications survivent, et le
// break-test refuse de rougir sur du code cassé (mesuré au lot 4).

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
        createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
        addEventListener() {}, removeEventListener() {}
    };
}

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
    for (const f of ['ajouterNiveauEchelle', 'supprimerNiveauEchelle',
                     'deplacerNiveauEchelleHaut', 'deplacerNiveauEchelleBas']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win };
}

const CLE = 'a2026_echellesTemplates';

const NIVEAUX = () => ([
    { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 67 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 100, valeurCalcul: 88 }
]);

const ECHELLES = () => ([
    { id: 'ECH_A', nom: 'Échelle A', dansBibliotheque: true, niveaux: NIVEAUX() },
    { id: 'ECH_B', nom: 'Échelle B', dansBibliotheque: true, niveaux: NIVEAUX() }
]);

const echelleDe = (liste, id) => liste.find((e) => e.id === id);

// ↻ 11 oct. 2026 (#574) : « + Ajouter un niveau » n'écrit plus rien — le niveau est tenu
// en attente jusqu'à ce que ses cinq champs obligatoires soient valides. L'ÉCRITURE de
// l'ajout (et donc sa course) a lieu au dernier champ : c'est elle que ces cas mettent
// en rafale. Les quatre premiers champs sont posés AVANT la rafale (tampon seulement).
const NIVEAU_NEUF = { code: 'X', nom: 'Extra', min: 0, max: 10, valeurCalcul: 5 };
async function preparerNiveauEnAttente(win, id) {
    await win.ajouterNiveauEchelle(id);
    for (const champ of ['code', 'nom', 'min', 'max']) {
        await win.modifierNiveauEnAttente(id, champ, NIVEAU_NEUF[champ]);
    }
}
const acheverNiveau = (win, id) => win.modifierNiveauEnAttente(id, 'valeurCalcul', NIVEAU_NEUF.valeurCalcul);

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 2b · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a un niveau achevé et un niveau modifié sur la MÊME échelle : les deux tiennent', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe
        await preparerNiveauEnAttente(win, 'ECH_A');

        await Promise.all([
            acheverNiveau(win, 'ECH_A'),
            win.modifierNiveauEchelle('ECH_A', 0, 'nom', 'Renommé')
        ]);

        const a = echelleDe(await db.get(CLE), 'ECH_A');
        expect(a.niveaux, 'trois niveaux, plus celui achevé').toHaveLength(4);
        expect(a.niveaux[0].nom, 'la modification tient').toBe('Renommé');
    });

    it('A.b deux échelles modifiées en même temps : aucune ne perd sa modification', async () => {
        // Le cas qui perdait le plus : deux entrées DIFFÉRENTES de la même
        // collection. Chacune relisait tout, chacune réécrivait tout.
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe

        await preparerNiveauEnAttente(win, 'ECH_A');

        await Promise.all([
            acheverNiveau(win, 'ECH_A'),
            win.modifierNiveauEchelle('ECH_B', 1, 'nom', 'Changé')
        ]);

        const liste = await db.get(CLE);
        expect(echelleDe(liste, 'ECH_A').niveaux, 'A a gardé son niveau').toHaveLength(4);
        expect(echelleDe(liste, 'ECH_B').niveaux[1].nom, 'B a gardé le sien').toBe('Changé');
    });

    it('A.c un ajout et un retrait concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe

        await preparerNiveauEnAttente(win, 'ECH_A');

        await Promise.all([
            acheverNiveau(win, 'ECH_A'),
            win.supprimerNiveauEchelle('ECH_B', 0)
        ]);

        const liste = await db.get(CLE);
        expect(echelleDe(liste, 'ECH_A').niveaux, 'l\'ajout tient').toHaveLength(4);
        expect(echelleDe(liste, 'ECH_B').niveaux, 'le retrait tient').toHaveLength(2);
    });

    it('A.d un déplacement et un ajout concurrents ne s\'écrasent pas', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe

        await preparerNiveauEnAttente(win, 'ECH_B');

        await Promise.all([
            win.deplacerNiveauEchelleHaut('ECH_A', 1),
            acheverNiveau(win, 'ECH_B')
        ]);

        const liste = await db.get(CLE);
        expect(echelleDe(liste, 'ECH_A').niveaux[0].code, 'le déplacement tient').toBe('D');
        expect(echelleDe(liste, 'ECH_B').niveaux, 'l\'ajout tient').toHaveLength(4);
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#522 lot 2b · B — un geste impossible REFUSE l\'écriture', () => {

    it('B.a un ajout sur une échelle absente ne touche à rien', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe

        await win.ajouterNiveauEchelle('ECH_FANTOME');

        expect(JSON.stringify(await db.get(CLE)), 'la collection est intacte')
            .toBe(JSON.stringify(ECHELLES()));
    });

    it('B.b on ne retire pas le DERNIER niveau d\'une échelle', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, [{ id: 'ECH_A', nom: 'Seule', niveaux: [NIVEAUX()[0]] }]);   // security-ok: littéral de banc

        await win.supprimerNiveauEchelle('ECH_A', 0);

        const liste = await db.get(CLE);
        expect(echelleDe(liste, 'ECH_A').niveaux, 'le dernier niveau reste').toHaveLength(1);
    });

    it('B.c le dernier niveau ne descend pas, et la collection n\'est pas réécrite', async () => {
        const { db, win } = await monterEchelles();
        await db.set(CLE, ECHELLES());   // security-ok: littéral de banc, aucune source externe

        await win.deplacerNiveauEchelleBas('ECH_A', 2);

        expect(JSON.stringify(await db.get(CLE)), 'l\'ordre est inchangé')
            .toBe(JSON.stringify(ECHELLES()));
    });
});

/* ------------------------------------------------- C — le cliquet du lot 2b */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sansCommentaires = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

function fonctionContenant(src, offset) {
    const entetes = [...src.slice(0, offset).matchAll(/\b([A-Za-z0-9_$.]+)\s*=\s*function\s*\(|\bfunction\s+([A-Za-z0-9_$]+)\s*\(/g)];
    if (!entetes.length) return '(hors fonction)';
    const d = entetes[entetes.length - 1];
    return (d[1] || d[2]).replace(/^window\./, '');
}

describe('#522 lot 2b · C — la course ne peut pas se rouvrir en silence', () => {

    // ⚠ Commentaires retirés AVANT de compter : l'en-tête de ce chantier NOMME
    // l'ancien geste, et compterait comme un site vivant.
    const echelles = sansCommentaires(readFileSync(path.join(racine, 'js/echelles.js'), 'utf8'));
    const donneesV2 = sansCommentaires(readFileSync(path.join(racine, 'js/donnees-v2.js'), 'utf8'));

    it('C.a plus AUCUN db.set sur la collection des échelles', () => {
        expect((echelles.match(/db\.set\(cle\('echellesTemplates'\)/g) || []).length).toBe(0);
    });

    it('C.b la seule écriture directe restante est NOMMÉE, et sa raison tient', () => {
        // `importerEchellesExternes` est SYNCHRONE et rend un compteur : la
        // rendre asynchrone changerait son contrat, donc ses appelants. Même
        // motif que `importerPratiquesExternes`, écarté au lot 1.
        const noms = [...echelles.matchAll(/db\.setSync\(cle\('echellesTemplates'\)/g)]
            .map((m) => fonctionContenant(echelles, m.index));
        expect(noms).toEqual(['importerEchellesExternes']);
    });

    it('C.c les vingt-cinq écritures-modifications passent par la file', () => {
        // ↻ 24 → 25 le 1er septembre 2026 : `assurerEchelleIdmeDeDepart` (§2 du
        // PLAN-2026-09-01) sème l'échelle IDME de départ, et elle le fait PAR LA
        // FILE — deux boots concurrents sèmeraient sinon deux fois. Le compte
        // monte parce qu'une écriture de plus respecte la règle, pas parce que la
        // règle a cédé : C.a et C.b ci-dessus continuent d'exiger qu'AUCUNE
        // écriture directe ne subsiste.
        const parLaFile = (echelles.match(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('echellesTemplates'\)/g) || []).length;
        // #648 (3 sept. 2026) : 25 → 22. Les trois suppressions de Conception (liste,
        // zone d'édition, section 1) écrivaient chacune leur retrait ; elles passent
        // par UN cœur (`supprimerOuRemplacerEchelle`), qui écrit une fois. Moins de
        // sites, même garde : chaque retrait reste par la file.
        // #520 (13 sept. 2026) : 22 → 21. `enregistrerCommeEchelle` est partie avec
        // le bloc « ANCIEN SYSTÈME » d'index.html, son seul appelant. Un site de
        // moins, aucune écriture directe de plus (C.a et C.b le gardent).
        // #658 (13 sept. 2026) : 21 → 20. `modifierNiveau` est partie avec l'ancien
        // tableau de niveaux, qui rendait dans `#tableauNiveaux` (conteneur caché
        // d'index.html) et portait ses seuls déclencheurs. Même motif : un site de
        // moins, aucune écriture directe de plus.
        // Lot E1, trouvaille 1 (a) de la relecture (27 sept. 2026) : 20 → 19. « Écraser »
        // retirait l'homonyme dans sa propre écriture, AVANT les vérifications de
        // « Créer l'échelle » ; le retrait passe dans l'écriture de création. Deux
        // écritures deviennent une, toujours par la file.
        // #467 (9 oct. 2026) : 19 → 18. `importerDansEchelleActive` est partie :
        // aucun déclencheur (inventaire du lot F, 29 sept. : « code mort »), et un
        // import JSON brut de moins. Aucune écriture directe de plus.
        expect(parLaFile, 'lot 2b, lot 4, les conversions antérieures, le semis IDME, et le cœur #648').toBe(18);
    });

    it('C.d les trois fenêtres d\'attente humaine lisent hors file et écrivent DANS la file', () => {
        // Le défaut le plus coûteux du lot : une collection lue avant une
        // question, réécrite après. Chacune de ces fonctions doit contenir un
        // `db.modifier` — sa lecture d'affichage, elle, peut rester dehors.
        // #648 : `supprimerEchelleDefinitivement` et `supprimerEchelleDepuisSidebar`
        // délèguent au cœur `supprimerOuRemplacerEchelle`, qui porte désormais les
        // questions (confirm, prompt) ET l'écriture par la file. C'est lui qu'on tient.
        for (const nom of ['dupliquerEchelle', 'supprimerOuRemplacerEchelle']) {
            const debut = echelles.indexOf('function ' + nom + '(');
            expect(debut, `${nom} : introuvable`).toBeGreaterThan(-1);
            const corps = echelles.slice(debut, debut + 4000);
            expect(corps, `${nom} : n'écrit pas par la file`)
                .toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('echellesTemplates'\)/);
            expect(corps, `${nom} : garde une écriture directe`)
                .not.toMatch(/db\.set\(cle\('echellesTemplates'\)/);
        }
    });

    it('C.e donnees-v2 : la suppression définitive écrit par la file, sur cle()', () => {
        expect(donneesV2).toMatch(/db\.modifier\(cle\('echellesTemplates'\)/);
        expect((donneesV2.match(/db\.set\(cle\('echellesTemplates'\)/g) || []).length).toBe(0);
        expect(donneesV2, 'la clé nue rouvrirait le défaut de #358')
            .not.toMatch(/db\.(set|setSync|modifier)\('echellesTemplates'/);
    });
});
