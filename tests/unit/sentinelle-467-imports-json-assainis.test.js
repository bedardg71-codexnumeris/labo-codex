import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #467 (CO-39, 9 oct. 2026) — UN FICHIER JSON IMPORTÉ DANS UNE
// BIBLIOTHÈQUE N'Y ENTRE PLUS BRUT.
//
// Les cinq imports JSON de Bibliothèque (grilles, échelles, cartouches, productions,
// pratiques) faisaient `JSON.parse` puis fusionnaient tel quel. Ils passent
// maintenant par `assainirImportJson` (import-export.js) : la liste blanche du type pour les
// clés qu'elle nomme, et les balises retirées de toute autre chaîne, SANS RIEN
// JETER — la liste blanche seule aurait perdu des champs qui voyagent
// aujourd'hui par ce fichier (mesuré : `pratiques` d'une grille, `regles` d'une
// production, `description` d'une cartouche).
//
// Ce qu'il tient :
//   A — le helper : une balise ne passe nulle part, et rien n'est jeté.
//   B — ce qui voyage : chaque objet réel du codex de banc (fixture faite
//       en 1.172.0, donc AVANT ce lot) ressort identique.
//   C — le chemin réel : les cinq `confirmerImport*` écrivent dans la
//       Bibliothèque un nom assaini, depuis un fichier au format d'avant ce lot.
//   D — l'import JSON des tampons (sans schéma) : `retirerBalisesProfond`.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const CHARGE = '<img src=x onerror=alert(1)>';

/* ------------------------------------------------------------------ harnais */

function fauxDb() {
    const magasin = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        magasin,
        async get(cle) { return cloner(magasin.get(cle)); },
        getSync(cle, defaut) { return magasin.has(cle) ? cloner(magasin.get(cle)) : defaut; },
        async set(cle, v) { magasin.set(cle, cloner(v)); },
        async modifier(cle, fn, defaut) {
            const lu = magasin.has(cle) ? cloner(magasin.get(cle)) : cloner(defaut);
            const ecrit = fn(lu);
            if (ecrit === undefined) return undefined;
            magasin.set(cle, cloner(ecrit));
            return ecrit;
        }
    };
}

function fauxDocument() {
    return {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        body: { insertAdjacentHTML() {}, appendChild() {} },
        createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
        addEventListener() {}, removeEventListener() {}
    };
}

/** import-export.js PUIS le script de la famille, dans le même `window`. */
function monter(fichier) {
    const db = fauxDb();
    const alertes = [];
    const globaux = {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert: (m) => alertes.push(String(m)),
        confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        document: fauxDocument(),
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} },
            pointerVersItems: () => ({ trouves: [], absents: [] }),
            conduireAuxImportes: async () => null },   // #793 : le geste commun des cinq imports
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    };
    const win = chargerScript('js/import-export.js', globaux);
    chargerScript(fichier, globaux, win);
    return { db, win, alertes };
}

const cc = (contenu) => ({
    metadata: { licence: 'CC BY-NC-SA 4.0', auteur_original: 'Autrice fictive', date_creation: '2026-09-01' },
    contenu
});

/* ------------------------------------------------------- A — le helper seul */

describe('#467 · A — assainirImportJson : aucune balise ne passe, rien n\'est jeté', () => {
    const win = chargerScript('js/import-export.js');

    it('A.a le nom d\'une grille perd sa balise', () => {
        const apres = win.assainirImportJson({ id: 'GR_X', nom: CHARGE + 'Grille' }, 'grille');
        expect(apres.nom).toBe('Grille');
    });

    it('A.b une clé que le schéma ne nomme pas est GARDÉE, balise retirée', () => {
        const apres = win.assainirImportJson(
            { id: 'CART_X', nom: 'Cartouche', grilleId: 'GR_X', description: CHARGE + 'Pour la dissertation' },
            'cartouche');
        expect(apres.description).toBe('Pour la dissertation');
    });

    it('A.c en profondeur : un champ inconnu d\'un critère, et un tableau sans sous-schéma', () => {
        const apres = win.assainirImportJson({
            id: 'GR_X', nom: 'Grille',
            criteres: [{ id: 'CR_1', nom: CHARGE + 'Structure', estStandard: true, note: CHARGE + 'n' }],
            pratiquesCompatibles: [CHARGE + 'pan']
        }, 'grille');
        expect(apres.criteres[0].nom).toBe('Structure');
        expect(apres.criteres[0].estStandard).toBe(true);
        expect(apres.criteres[0].note).toBe('n');
        expect(apres.pratiquesCompatibles).toEqual(['pan']);
    });

    it('A.d les clés du schéma gardent le traitement des autres chemins (longueur bornée)', () => {
        const apres = win.assainirImportJson({ id: 'ECH_X', nom: 'Échelle', seuilMaitrise: CHARGE + 'M'.repeat(40) }, 'echelle');
        expect(apres.seuilMaitrise).toBe('M'.repeat(20));
    });

    it('A.e l\'original n\'est pas modifié ; `__proto__` reçu n\'est pas recopié, même imbriqué', () => {
        const brut = JSON.parse('{"id":"GR_X","nom":"<b>G</b>","__proto__":{"pollue":true},'
            + '"inconnu":{"__proto__":{"pollue":true}}}');
        const apres = win.assainirImportJson(brut, 'grille');
        expect(brut.nom).toBe('<b>G</b>');
        expect(apres.pollue).toBeUndefined();
        expect(Object.getPrototypeOf(apres)).toBe(Object.prototype);
        // Clé inconnue du schéma : rien ne la recopie par étalement, la garde est seule.
        expect(apres.inconnu.pollue).toBeUndefined();
        expect(Object.getPrototypeOf(apres.inconnu)).toBe(Object.prototype);
    });

    it('A.f un type inconnu est refusé, pas laissé passer', () => {
        expect(() => win.assainirImportJson({ id: 'X' }, 'inexistant')).toThrow();
    });
});

/* ------------------------------------------- B — ce qui voyage arrive entier */

describe('#467 · B — un objet réel fait avant ce lot ressort identique', () => {
    const win = chargerScript('js/import-export.js');
    const copie = JSON.parse(readFileSync(
        path.join(racine, 'tests/fixtures/copies-de-secours-1.172.0/copie-de-secours.json'), 'utf8'));
    const FAMILLES = {
        grille: /grillesTemplates$|^bibliothequeGrilles$/,
        echelle: /echellesTemplates$|^bibliothequeEchelles$/,
        production: /_productions$|^bibliothequeProductions$/
    };

    for (const [type, motif] of Object.entries(FAMILLES)) {
        it(`B.${type} chaque ${type} du codex de banc`, () => {
            let n = 0;
            for (const [cle, valeur] of Object.entries(copie)) {
                if (!motif.test(cle)) continue;
                const liste = typeof valeur === 'string' ? JSON.parse(valeur) : valeur;
                if (!Array.isArray(liste)) continue;
                for (const item of liste) {
                    n++;
                    expect(win.assainirImportJson(item, type), `${cle} · ${item.id}`).toEqual(item);
                }
            }
            expect(n, 'le codex de banc porte bien des objets de ce type').toBeGreaterThan(0);
        });
    }
});

/* -------------------------------------------- C — le chemin réel, quatre fois */

describe('#467 · C — les quatre imports écrivent un nom assaini dans la Bibliothèque', () => {

    it('C.a grilles (format CC, lot), le reste de la grille intact', async () => {
        const { db, win, alertes } = monter('js/grilles.js');
        await win.confirmerImportGrilles(cc({ grilles: [
            { id: 'GR_IMP', nom: CHARGE + 'Grille reçue', pratiques: ['p1'],
              criteres: [{ id: 'CR_1', nom: 'Structure', ponderation: 100, sousCriteres: [] }] }
        ] }));
        expect(alertes).toEqual([]);
        const [g] = db.magasin.get('bibliothequeGrilles');
        expect(g.nom).toBe('Grille reçue');
        expect(g.pratiques).toEqual(['p1']);
        expect(g.criteres[0].nom).toBe('Structure');
    });

    it('C.b échelles (ancien format direct)', async () => {
        const { db, win, alertes } = monter('js/echelles.js');
        await win.confirmerImportEchelles({ id: 'ECH_IMP', nom: CHARGE + 'Échelle reçue',
            niveaux: [{ code: CHARGE + 'I', nom: 'Incomplet', min: 0, max: 64 }] });
        expect(alertes).toEqual([]);
        const [e] = db.magasin.get('bibliothequeEchelles');
        expect(e.nom).toBe('Échelle reçue');
        expect(e.niveaux[0].code).toBe('I');
    });

    it('C.c cartouches (format CC, individuelle), sa description gardée', async () => {
        const { db, win, alertes } = monter('js/cartouches.js');
        await win.confirmerImportCartouches(cc({ id: 'CART_IMP', grilleId: 'GR_A', nom: CHARGE + 'Cartouche reçue',
            description: 'Pour la dissertation', commentaires: { 'CR_1_I': CHARGE + 'À revoir' } }));
        expect(alertes).toEqual([]);
        const [c] = db.magasin.get('bibliothequeCartouches');
        expect(c.nom).toBe('Cartouche reçue');
        expect(c.description).toBe('Pour la dissertation');
        expect(c.commentaires.CR_1_I).toBe('À revoir');
    });

    it('C.d productions (format CC, lot), ses règles gardées', async () => {
        const { db, win, alertes } = monter('js/productions-import-export.js');
        await win.confirmerImportProductions(cc({ productions: [
            { id: 'PROD_IMP', titre: CHARGE + 'Dissertation', nom: CHARGE + 'Dissertation', regles: { a: 1 } }
        ] }));
        expect(alertes).toEqual([]);
        const [p] = db.magasin.get('bibliothequeProductions');
        expect(p.titre).toBe('Dissertation');
        expect(p.nom).toBe('Dissertation');
        expect(p.regles).toEqual({ a: 1 });
    });
});

describe('#467 · C (suite) — les pratiques', () => {
    it('C.e pratiques (format CC), leurs nombres intacts', async () => {
        const { db, win, alertes } = monter('js/pratiques-gestion.js');
        await win.confirmerImportPratiques(cc({ pratiques: [
            { id: 'PRAT_IMP', nom: CHARGE + 'Pratique reçue', description: CHARGE + 'Par standards',
              seuils: { reussite: 60 } }
        ] }));
        expect(alertes).toEqual([]);
        const [p] = db.magasin.get('bibliothequePratiques');
        expect(p.nom).toBe('Pratique reçue');
        expect(p.description).toBe('Par standards');
        expect(p.seuils).toEqual({ reussite: 60 });
    });
});

/* -------------------------------------- D — l'import de tampons, chemin réel */

describe('#467 · D — l\'import JSON des tampons n\'écrit aucun nom brut', () => {
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }

    it('D.a noms de tampon, de catégorie et de symbole : balises retirées, le reste intact', () => {
        const stock = new Map();
        const db = {
            ready: false,
            getSync: (k, d) => (stock.has(k) && stock.get(k) !== null ? JSON.parse(JSON.stringify(stock.get(k))) : d),
            setSync: (k, v) => { stock.set(k, v); },
            removeSync: (k) => { stock.delete(k); }
        };
        const alertes = [];
        const win = chargerScript('js/import-export.js', {});
        win.addEventListener = () => {};
        win.removeEventListener = () => {};
        chargerScript('js/travaux-outils.js', {
            db, Image: ImageStub, document: fauxDocument(),
            notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
            alert: (m) => alertes.push(String(m))
        }, win);

        win.travauxOutils.confirmerImportTampons({ contenu: {
            tampons: [{ id: 'T_IMP', nom: CHARGE + 'Bravo', categorie: 'cat_imp', retroaction: CHARGE + 'Belle idée' }],
            categories: [{ id: 'cat_imp', nom: CHARGE + 'Reçue', couleur: '#123456' }],
            symbolesBuiltin: [],
            symbolesPerso: [{ id: 'S_IMP', nom: CHARGE + 'Étoile', icone: '★' }]
        } });

        expect(alertes).toEqual([]);
        expect(stock.get('tamponsPersonnalises')).toEqual([{ id: 'T_IMP', nom: 'Bravo', categorie: 'cat_imp' }]);
        expect(stock.get('nomsCategoriesTampons')).toEqual({ cat_imp: 'Reçue' });
        expect(stock.get('categoriesPerso')).toEqual([{ id: 'cat_imp', nom: 'Reçue' }]);
        expect(stock.get('couleursCategories')).toEqual({ cat_imp: '#123456' });
        expect(stock.get('symbolesUnicodePerso')).toEqual([{ id: 'S_IMP', nom: 'Étoile', icone: '★' }]);
        expect(JSON.stringify(stock.get('retroactionsObservations'))).not.toContain('<');
    });
});

/* ------------------------- E — le fichier .lcz : la mesure demandée par la fiche */

// La fiche demandait d'abord « ce que `assainirObjet` fait d'un nom reçu en
// `.lcz` ». Mesuré le 9 oct. : RIEN — le `.lcz` n'y passe pas. Il a son propre
// filtre (`partage-validation.js`, niveau 5) : un motif dangereux fait REFUSER
// le fichier entier ; toute autre balise est échappée au stockage. Ce volet fige
// cette mesure : si le filtre du `.lcz` s'affaiblit, ce lot n'est plus vrai.
describe('#467 · E — un nom reçu par .lcz : refusé s\'il est dangereux, échappé sinon', () => {
    const win = chargerScript('js/partage-schemas.js');
    chargerScript('js/partage-validation.js', { db: { getSync: (k, d) => d } }, win);
    const paquet = (nom) => ({
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0', dateExport: '2026-10-09T12:00:00Z',
            auteur: { nom: 'Autrice fictive' },
            item_principal: { type: 'grille', id: 'GR_LCZ' },
            chaineAttribution: [], signature: null, clePublique: null, algorithme: null
        },
        entites: { grilles: [{ id: 'GR_LCZ', nom, criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }],
            metadata_cc: { auteur_original: 'Autrice fictive', licence: 'CC BY-NC-SA 4.0', contributeurs: [] } }] },
        references: [], medias: []
    });

    it('E.a une balise à gestionnaire d\'événement : le fichier est refusé', () => {
        const r = win.partageValidation.validerPackage(paquet(CHARGE + 'Grille'));
        expect(r.valide).toBe(false);
        expect(r.erreurs.some((e) => e.code === 'CONTENU_DANGEREUX')).toBe(true);
    });

    it('E.b une balise bénigne : stockée échappée, jamais brute', () => {
        const r = win.partageValidation.validerPackage(paquet('<b>Grille</b>'));
        expect(r.valide).toBe(true);
        expect(r.packageNettoye.entites.grilles[0].nom).toBe('&lt;b&gt;Grille&lt;/b&gt;');
    });

    it('E.c un nom sans balise passe intact', () => {
        const r = win.partageValidation.validerPackage(paquet('Grille & co'));
        expect(r.valide).toBe(true);
        expect(r.packageNettoye.entites.grilles[0].nom).toBe('Grille & co');
    });
});
