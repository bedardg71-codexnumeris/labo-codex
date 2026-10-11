import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Lot 3 de la file (10 oct. 2026) — L'IMPORT SÉLECTIF RATTACHE JUSTE.
//
// Le geste : un fichier de sauvegarde (format « localStorage brut ») déposé dans
// « Importer », des cases cochées, « Importer la sélection ». Le banc passe par
// le vrai `ouvrirModalImport` → `previsualiserImport` (FileReader) → aperçu →
// `executerImportSelectif`. Seuls le DOM et la base sont simulés.
//
//   A — #664 / #952 : une grille et une échelle renommées pour conflit d'id ;
//       cartouches, pratiques et productions reçues dans le même passage pointent
//       vers le nouvel id. Au second passage, elles suivent la grille de même nom.
//   B — #954 : une cartouche identique à celle en place n'entre pas en double,
//       ni au premier passage ni au second.
//   C — #655 : les cartouches se rangent sous la clé du trimestre actif.
//   D — trouvaille du lot 2 : aucun champ connu ne se perd, et « 40 » reste 40.
//   E — ce qui voyage : chaque grille et chaque production du codex de banc
//       (fixture 1.172.0, faite AVANT ce lot) entre avec tous ses champs.
//   F — le message de fin garde son ordre (pratiques, grilles, échelles,
//       cartouches, productions).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '..', 'fixtures', 'copies-de-secours-1.172.0', 'copie-de-secours.json');
const PREFIXE = 'a2031_';

/* ------------------------------------------------------------------ harnais */

function fauxDb(initial) {
    const magasin = new Map(Object.entries(initial || {}));
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        magasin,
        getSync(k, defaut) { return magasin.has(k) ? cloner(magasin.get(k)) : defaut; },
        setSync(k, v) { magasin.set(k, cloner(v)); return true; },
        async get(k, defaut) { return magasin.has(k) ? cloner(magasin.get(k)) : defaut; },
        async set(k, v) { magasin.set(k, cloner(v)); return true; },
        async flush() {},
        keys() { return [...magasin.keys()]; }
    };
}

function elementInerte() {
    return {
        innerHTML: '', textContent: '', value: '', style: {}, checked: false,
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        dataset: {}, setAttribute() {}, getAttribute: () => null,
        appendChild() {}, insertAdjacentHTML() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], focus() {}, click() {},
        parentElement: { remove() {} }
    };
}

/** Monte import-export.js sur un espace, dépose `fichier`, coche `coches`, importe. */
async function importer(espace, fichier, coches) {
    const db = espace.db;
    const alertes = [];
    const champFichier = elementInerte();
    const document = {
        getElementById: (id) => (id === 'fichierImport' ? champFichier : (id.startsWith('import-') ? null : elementInerte())),
        querySelector: () => null,
        querySelectorAll: (sel) => {
            const m = /^\.import-item-(\w+):checked$/.exec(sel);
            return m ? (coches[m[1]] || []).map((id) => ({ dataset: { itemId: id } })) : [];
        },
        body: elementInerte(), createElement: () => elementInerte(),
        addEventListener() {}, removeEventListener() {}
    };
    class FauxLecteur { readAsText(f) { this.onload({ target: { result: f.texte } }); } }
    let n = espace.compteurIds || 0;
    const win = chargerScript('js/import-export.js', {
        db, document,
        cle: (k) => PREFIXE + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + 'NEUF' + (++n),
        alert: (m) => alertes.push(String(m)),
        confirm: () => false,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        FileReader: FauxLecteur
    });
    win.ouvrirModalImport();
    const texte = JSON.stringify(fichier);
    await champFichier.onchange({ target: { files: [{ name: 'sauvegarde-fictive.json', type: 'application/json', size: texte.length, texte }] } });
    await win.executerImportSelectif();
    espace.compteurIds = n;
    return { alertes };
}

const lire = (espace, k) => espace.db.getSync(PREFIXE + k, null);

/* ----------------------------------------------------------- jeu fictif */

const CARTOUCHE_C = {
    id: 'CART_C', nom: 'Cartouche fictive Gamma', grilleId: 'GR_C', echelleId: 'ECH_C',
    contexte: 'Dissertation fictive', description: 'Pour la dissertation fictive',
    criteres: [{ id: 'CR_1', nom: 'Structure' }], niveaux: [{ code: 'M', nom: 'Maîtrisé' }],
    commentaires: { CR_1_M: 'Texte de rétroaction fictif' }
};

function espaceDeDepart() {
    return {
        db: fauxDb({
            [PREFIXE + 'grillesTemplates']: [
                { id: 'GR_A', nom: 'Grille locale Alpha', criteres: [] },
                { id: 'GR_C', nom: 'Grille fictive Gamma', criteres: [] }
            ],
            [PREFIXE + 'echellesTemplates']: [{ id: 'ECH_A', nom: 'Échelle locale Alpha', niveaux: [] }],
            // Une cartouche CRÉÉE ici, jamais importée : sans `dateImport` ni `auteurOriginal`.
            [PREFIXE + 'cartouches_GR_C']: [CARTOUCHE_C]
        })
    };
}

const FICHIER = {
    infoCours: { prenomEnseignant: 'Camille', nomEnseignant: 'Fictive' },
    grillesTemplates: [{
        id: 'GR_A', nom: 'Grille reçue Bêta',
        criteres: [{ id: 'CR_1', nom: 'Structure', ponderation: 50, estStandard: true }],
        pratiques: ['PAN'], pratiquesCompatibles: ['pan-standards'], estGabarit: false,
        baseSur: 'GR_ORIGINE', metadata_cc: { licence: 'CC BY-NC-SA 4.0', date_creation: '2031-01-01' }
    }],
    echellesTemplates: [{
        id: 'ECH_A', nom: 'Échelle reçue Bêta',
        niveaux: [{ code: 'I', nom: 'Insuffisant', valeurCalcul: '40' }, { code: 'M', nom: 'Maîtrisé', valeurCalcul: '85,5' }]
    }],
    cartouches_GR_A: [{
        id: 'CART_B', nom: 'Cartouche reçue Bêta', grilleId: 'GR_A', echelleId: 'ECH_A',
        description: 'Une description qui voyage', commentaires: { CR_1_I: 'Rétroaction fictive' }
    }],
    cartouches_GR_C: [CARTOUCHE_C],
    pratiquesConfigurables: [{ id: 'PRAT_B', nom: 'Pratique reçue Bêta', echelleId: 'ECH_A' }],
    productions: [{
        id: 'PROD_B', titre: 'Production reçue Bêta', grilleId: 'GR_A', echelleId: 'ECH_A', cartoucheId: 'CART_B',
        code: 'A1', regles: { nombreARetenir: 2, nombreTotal: 3, minimumCompletion: 1 }
    }]
};

const TOUT = {
    grilles: ['GR_A'], echelles: ['ECH_A'], cartouches: ['cartouches_GR_A', 'cartouches_GR_C'],
    pratiques: ['PRAT_B'], productions: ['PROD_B']
};

/* ------------------------------------------------------------------ essais */

describe('Lot 3 · A — #664 / #952 : ce qui désigne une grille ou une échelle renommée suit le nouvel id', () => {
    it('A.a premier passage : la grille et l\'échelle reçues sont renommées, et tout ce qui les désigne suit', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);

        const grilles = lire(espace, 'grillesTemplates');
        const recue = grilles.find((g) => g.nom === 'Grille reçue Bêta');
        expect(recue.id).not.toBe('GR_A');
        const echelle = lire(espace, 'echellesTemplates').find((e) => e.nom === 'Échelle reçue Bêta');
        expect(echelle.id).not.toBe('ECH_A');

        // Les cartouches de la grille reçue vont sous SON nouvel id, et la désignent.
        expect(lire(espace, 'cartouches_GR_A')).toBe(null);
        const cartouches = lire(espace, 'cartouches_' + recue.id);
        expect(cartouches.map((c) => c.id)).toEqual(['CART_B']);
        expect(cartouches[0].grilleId).toBe(recue.id);
        expect(cartouches[0].echelleId).toBe(echelle.id);

        const pratique = lire(espace, 'pratiquesConfigurables').find((p) => p.id === 'PRAT_B');
        expect(pratique.echelleId).toBe(echelle.id);

        const prod = lire(espace, 'productions').find((p) => p.titre === 'Production reçue Bêta');
        expect(prod.grilleId).toBe(recue.id);
        expect(prod.echelleId).toBe(echelle.id);
        expect(prod.cartoucheId).toBe('CART_B');
    });

    it('A.b second passage du même fichier : rien ne s\'ajoute, et rien ne tombe sous la grille locale Alpha', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);
        const avant = JSON.stringify([...espace.db.magasin].filter(([k]) => !k.endsWith('productions')));
        await importer(espace, FICHIER, TOUT);
        const apres = JSON.stringify([...espace.db.magasin].filter(([k]) => !k.endsWith('productions')));
        expect(apres).toBe(avant);
        expect(lire(espace, 'cartouches_GR_A')).toBe(null);
    });
});

describe('#627 / #663 (11 oct. 2026) — la pratique désigne son échelle sous `configuration`', () => {
    // La forme réelle des pratiques (assistant, gestion) : `configuration.echelleId`. Le lot 3 ne
    // rebranchait que `echelleId` à la racine, que les pratiques d'aujourd'hui n'écrivent pas.
    const FICHIER_CONF = Object.assign({}, FICHIER, {
        pratiquesConfigurables: [{ id: 'PRAT_CONF', nom: 'Pratique reçue Delta', configuration: { echelleId: 'ECH_A', seuil: 60 } }]
    });
    const COCHES = { echelles: ['ECH_A'], pratiques: ['PRAT_CONF'] };

    it('A.c l\'échelle reçue est renommée : `configuration.echelleId` suit, le reste de la configuration reste', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER_CONF, COCHES);
        const echelle = lire(espace, 'echellesTemplates').find((e) => e.nom === 'Échelle reçue Bêta');
        expect(echelle.id).not.toBe('ECH_A');
        const pratique = lire(espace, 'pratiquesConfigurables').find((p) => p.id === 'PRAT_CONF');
        expect(pratique.configuration).toEqual({ echelleId: echelle.id, seuil: 60 });
    });

    it('A.d sans conflit, rien ne bouge', async () => {
        const espace = { db: fauxDb({}) };
        await importer(espace, FICHIER_CONF, COCHES);
        const pratique = lire(espace, 'pratiquesConfigurables').find((p) => p.id === 'PRAT_CONF');
        expect(pratique.configuration.echelleId).toBe('ECH_A');
    });
});

describe('Lot 3 · B — #954 : une cartouche identique à celle en place n\'entre pas en double', () => {
    it('B.a la cartouche Gamma, créée ici, reste seule après deux imports', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, { cartouches: ['cartouches_GR_C'] });
        await importer(espace, FICHIER, { cartouches: ['cartouches_GR_C'] });
        const gamma = lire(espace, 'cartouches_GR_C');
        expect(gamma).toHaveLength(1);
        expect(gamma[0]).toEqual(CARTOUCHE_C);
    });

    it('B.b une cartouche de même id mais au contenu différent entre encore, sous un id neuf (règle #448)', async () => {
        const espace = espaceDeDepart();
        const autre = { ...FICHIER, cartouches_GR_C: [{ ...CARTOUCHE_C, contexte: 'Un autre contexte fictif' }] };
        await importer(espace, autre, { cartouches: ['cartouches_GR_C'] });
        const gamma = lire(espace, 'cartouches_GR_C');
        expect(gamma).toHaveLength(2);
        expect(gamma[1].id).not.toBe('CART_C');
    });

    it('B.c le bilan dit la cartouche écartée (mots neufs, à relire par Cowork)', async () => {
        const espace = espaceDeDepart();
        const { alertes } = await importer(espace, FICHIER, TOUT);
        expect(alertes.join('\n')).toContain('1 cartouche(s) déjà présente(s) à l\'identique, non ajoutée(s)');
    });
});

describe('Lot 3 · C — #655 : les cartouches se rangent dans le trimestre actif', () => {
    it('C.a aucune clé nue `cartouches_*` n\'est écrite', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);
        const nues = [...espace.db.magasin.keys()].filter((k) => k.startsWith('cartouches_'));
        expect(nues).toEqual([]);
    });
});

describe('Lot 3 · D — aucun champ connu ne se perd, et un nombre en texte reste un nombre', () => {
    it('D.a grille : pratiques, pratiquesCompatibles, estGabarit, baseSur, estStandard, metadata_cc.date_creation', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);
        const g = lire(espace, 'grillesTemplates').find((x) => x.nom === 'Grille reçue Bêta');
        expect(g.pratiques).toEqual(['PAN']);
        expect(g.pratiquesCompatibles).toEqual(['pan-standards']);
        expect(g.estGabarit).toBe(false);
        expect(g.baseSur).toBe('GR_ORIGINE');
        expect(g.criteres[0].estStandard).toBe(true);
        expect(g.metadata_cc.date_creation).toBe('2031-01-01');
    });

    it('D.b échelle : « 40 » devient 40 et « 85,5 » devient 85.5, au lieu de 0', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);
        const e = lire(espace, 'echellesTemplates').find((x) => x.nom === 'Échelle reçue Bêta');
        expect(e.niveaux.map((n) => n.valeurCalcul)).toEqual([40, 85.5]);
    });

    it('D.c cartouche : description ; production : code et regles', async () => {
        const espace = espaceDeDepart();
        await importer(espace, FICHIER, TOUT);
        const recue = lire(espace, 'grillesTemplates').find((g) => g.nom === 'Grille reçue Bêta');
        expect(lire(espace, 'cartouches_' + recue.id)[0].description).toBe('Une description qui voyage');
        const prod = lire(espace, 'productions').find((p) => p.titre === 'Production reçue Bêta');
        expect(prod.code).toBe('A1');
        expect(prod.regles).toEqual({ nombreARetenir: 2, nombreTotal: 3, minimumCompletion: 1 });
    });

    it('D.d un texte qui n\'est pas un nombre retombe à 0, comme avant', () => {
        const win = chargerScript('js/import-export.js');
        const e = win.assainirObjet({ niveaux: [{ valeurCalcul: '40 points' }, { valeurCalcul: '0x10' }, { valeurCalcul: '' }] },
            win.SCHEMAS_IMPORT.echelle);
        expect(e.niveaux.map((n) => n.valeurCalcul)).toEqual([0, 0, 0]);
    });
});

describe('Lot 3 · E — ce qui voyage : le codex de banc 1.172.0 entre avec tous ses champs', () => {
    const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));
    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
    // Champs que l'import pose ou retire DÉLIBÉRÉMENT : la trace de l'import, et le
    // rattachement local au cours (`CLES_PRODUCTION_NON_TRANSPORTEES`, #511).
    const sansMarques = (o) => {
        const { dateImport, auteurOriginal, coursId, ...reste } = o;
        return reste;
    };

    it('E.a les grilles de `bibliothequeGrilles` et les productions de `a2031_productions` ressortent identiques', async () => {
        const grilles = parse(fixture.bibliothequeGrilles);
        const prods = parse(fixture.a2031_productions);
        expect(grilles.length).toBeGreaterThan(0);
        expect(prods.length).toBeGreaterThan(0);
        const fichier = { infoCours: { prenomEnseignant: 'Camille', nomEnseignant: 'Fictive' },
            bibliothequeGrilles: grilles, a2031_productions: prods };
        const espace = { db: fauxDb({}) };
        await importer(espace, fichier, { grilles: grilles.map((g) => g.id), productions: prods.map((p) => p.id) });

        const entrees = lire(espace, 'grillesTemplates');
        expect(entrees.map(sansMarques)).toEqual(grilles.map(sansMarques));
        const prodsEntrees = lire(espace, 'productions');
        expect(prodsEntrees.map(sansMarques)).toEqual(prods.map(sansMarques));
    });

    it('E.b les échelles et les pratiques du pack démo ressortent identiques, « 40 » converti en 40', async () => {
        const echelles = parse(fixture.demo_echellesTemplates);
        const pratiques = parse(fixture.demo_pratiquesConfigurables);
        expect(echelles.length).toBeGreaterThan(0);
        expect(pratiques.length).toBeGreaterThan(0);
        // Sous des clés nues : c'est sous ce nom que l'import sélectif les cherche.
        const fichier = { infoCours: { prenomEnseignant: 'Camille', nomEnseignant: 'Fictive' },
            echellesTemplates: echelles, pratiquesConfigurables: pratiques };
        const espace = { db: fauxDb({}) };
        await importer(espace, fichier, { echelles: echelles.map((e) => e.id), pratiques: pratiques.map((p) => p.id) });

        const enNombres = (e) => ({ ...e, niveaux: (e.niveaux || []).map((n) =>
            (typeof n.valeurCalcul === 'string' ? { ...n, valeurCalcul: Number(n.valeurCalcul) } : n)) });
        expect(echelles.some((e) => (e.niveaux || []).some((n) => typeof n.valeurCalcul === 'string'))).toBe(true);
        expect(lire(espace, 'echellesTemplates').map(sansMarques)).toEqual(echelles.map(sansMarques).map(enNombres));
        expect(lire(espace, 'pratiquesConfigurables').map(sansMarques)).toEqual(pratiques.map(sansMarques));
    });
});

describe('Lot 3 · F — le message de fin garde son ordre', () => {
    it('F.a pratiques, grilles, échelles, cartouches, productions', async () => {
        const espace = espaceDeDepart();
        const { alertes } = await importer(espace, FICHIER, TOUT);
        const message = alertes.find((m) => m.startsWith('Import réussi'));
        const ordre = ['pratique(s)', 'grille(s)', 'échelle(s)', '1 cartouche(s)\n', 'production(s)']
            .map((mot) => message.indexOf(mot));
        expect(ordre.every((i) => i >= 0)).toBe(true);
        expect([...ordre].sort((a, b) => a - b)).toEqual(ordre);
    });
});

describe('Lot 3 · G — relecture du 10 oct. : « même nom » ne suffit pas pour rebrancher', () => {
    // Le fichier vient d'un collègue : sa grille et son échelle portent le nom des
    // locales, mais pas les mêmes critères ni les mêmes niveaux.
    const espaceCommun = () => ({
        db: fauxDb({
            [PREFIXE + 'grillesTemplates']: [{ id: 'GR_LOC', nom: 'Grille de rédaction', criteres: [{ id: 'CR_L1' }, { id: 'CR_L2' }] }],
            [PREFIXE + 'echellesTemplates']: [{ id: 'ECH_LOC', nom: 'Échelle commune', niveaux: [{ code: 'I' }, { code: 'M' }] }]
        })
    });
    const fichierCollegue = (criteres, niveaux) => ({
        infoCours: { prenomEnseignant: 'Camille', nomEnseignant: 'Fictive' },
        grillesTemplates: [{ id: 'GR_COL', nom: 'Grille de rédaction', criteres }],
        echellesTemplates: [{ id: 'ECH_COL', nom: 'Échelle commune', niveaux }],
        cartouches_GR_COL: [{ id: 'CART_COL', nom: 'Cartouche du collègue', grilleId: 'GR_COL', echelleId: 'ECH_COL',
            commentaires: { CR_x_A: 'Rétroaction fictive' } }],
        pratiquesConfigurables: [{ id: 'PRAT_COL', nom: 'Pratique du collègue', echelleId: 'ECH_COL' }],
        productions: [{ id: 'PROD_COL', titre: 'Production du collègue', grilleId: 'GR_COL', echelleId: 'ECH_COL' }]
    });
    const COCHES = { grilles: ['GR_COL'], echelles: ['ECH_COL'], cartouches: ['cartouches_GR_COL'],
        pratiques: ['PRAT_COL'], productions: ['PROD_COL'] };

    it('G.a grille de même nom, critères différents : rien ne tombe sous la grille locale', async () => {
        const espace = espaceCommun();
        await importer(espace, fichierCollegue([{ id: 'CR_x' }, { id: 'CR_y' }], [{ code: 'I' }, { code: 'M' }]), COCHES);
        expect(lire(espace, 'cartouches_GR_LOC')).toBe(null);
        expect(lire(espace, 'cartouches_GR_COL').map((c) => c.grilleId)).toEqual(['GR_COL']);
        expect(lire(espace, 'productions').find((p) => p.id === 'PROD_COL').grilleId).toBe('GR_COL');
    });

    it('G.b échelle de même nom, codes de niveaux différents : rien ne la désigne', async () => {
        const espace = espaceCommun();
        await importer(espace, fichierCollegue([{ id: 'CR_L1' }, { id: 'CR_L2' }], [{ code: 'A' }, { code: 'B' }]), COCHES);
        expect(lire(espace, 'pratiquesConfigurables').find((p) => p.id === 'PRAT_COL').echelleId).toBe('ECH_COL');
        expect(lire(espace, 'productions').find((p) => p.id === 'PROD_COL').echelleId).toBe('ECH_COL');
        expect(lire(espace, 'cartouches_GR_LOC')[0].echelleId).toBe('ECH_COL');
    });

    it('G.c mêmes critères et mêmes niveaux, dans un autre ordre : la redirection a lieu', async () => {
        const espace = espaceCommun();
        await importer(espace, fichierCollegue([{ id: 'CR_L2' }, { id: 'CR_L1' }], [{ code: 'M' }, { code: 'I' }]), COCHES);
        expect(lire(espace, 'cartouches_GR_COL')).toBe(null);
        expect(lire(espace, 'cartouches_GR_LOC')[0].grilleId).toBe('GR_LOC');
        expect(lire(espace, 'pratiquesConfigurables').find((p) => p.id === 'PRAT_COL').echelleId).toBe('ECH_LOC');
        expect(lire(espace, 'productions').find((p) => p.id === 'PROD_COL').grilleId).toBe('GR_LOC');
    });

    it('G.d un sous-ensemble de critères ne suffit pas', async () => {
        const espace = espaceCommun();
        await importer(espace, fichierCollegue([{ id: 'CR_L1' }], [{ code: 'I' }, { code: 'M' }]), COCHES);
        expect(lire(espace, 'cartouches_GR_LOC')).toBe(null);
    });
});

describe('Lot 3 · H — relecture du 10 oct. : un sous-schéma ne laisse plus passer une valeur brute', () => {
    const win = chargerScript('js/import-export.js');
    const S = win.SCHEMAS_IMPORT;
    const BRUT = '<img src=x onerror=alert(1)>';

    it('H.a une chaîne, un tableau ou null à la place d\'un objet sous-schématisé est omis', () => {
        for (const brut of [BRUT, ['a', BRUT], null, 42]) {
            const prod = win.assainirObjet({ id: 'P', regles: brut }, S.production);
            expect('regles' in prod).toBe(false);
            const prat = win.assainirObjet({ id: 'Q', calcul_note: brut, echelle: brut }, S.pratique);
            expect('calcul_note' in prat).toBe(false);
            expect('echelle' in prat).toBe(false);
        }
    });

    it('H.b un objet passe par son sous-schéma, et un champ sans sous-schéma reste recopié', () => {
        const prod = win.assainirObjet({ regles: { nombreARetenir: '2', intrus: BRUT } }, S.production);
        expect(prod.regles).toEqual({ nombreARetenir: 2 });
        const prat = win.assainirObjet({ configuration: 'brut' }, S.pratique);
        expect(prat.configuration).toBe('brut');
    });
});
