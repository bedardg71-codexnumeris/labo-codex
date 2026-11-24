/**
 * SENTINELLE (24 nov. 2026) — TAMPONS D'OBSERVATION, LOT 1 : RÉGLER.
 *
 * Consigne de lot : « Tampons d'observation », lot 1 (Cowork, 24 nov. 2026, 13 h 55).
 * Rapport : plans de travail/RAPPORT-2026-11-24-tampons-observation-lot-1.md.
 *
 * Deux données, et rien d'autre :
 *   · `categoriesObservation` : la liste des identifiants des catégories dites « d'observation » ;
 *   · `personnalisationObservations[id].critere` : le critère qu'un tampon déclare, facultatif.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (la fenêtre, l'export et l'import d'un jeu et la bibliothèque sont joués au
 * navigateur : tests/integration/tampons-observation-lot-1-regler.spec.js) :
 *   A. Le critère rangé : du texte, rogné, borné ; rien n'est écrit pour un critère vide ou qui n'est pas du texte.
 *   B. Le critère VOYAGE TOUJOURS, que la catégorie du tampon soit d'observation ou non (retouche du 24 nov., 15 h 35 :
 *      décocher, exporter puis réimporter l'effaçait). Seul un identifiant qui n'est celui d'aucun tampon ne rend rien.
 *   G. Les mots acceptés par Grégoire le 24 nov. (15 h 31, 15 h 33) : l'aide C2 sans sa seconde phrase, les deux titres.
 *   C. La liste blanche de la bibliothèque (SCHEMAS_IMPORT.tampon) laisse entrer `critere`, et lui seul de neuf.
 *   D. Un codex enregistré puis rouvert rend les deux données à l'identique (vrai ZIP, vrai `charger`).
 *   E. À la fusion de deux codex, la liste est une DONNÉE : elle vient quand elle manque ici, elle est en conflit
 *      quand les deux diffèrent ; ce n'est pas un réglage de l'appareil. La fenêtre la nomme en mots.
 *   F. Les registres ; un seul module nomme la clé pour l'écrire ; aucune lecture sans appelant (zéro dette).
 *
 * RIEN EN DUR : les tampons et les catégories de ce banc sont créés ici, fictifs. Les catégories fournies ne sont
 * jamais nommées : elles sont lues de l'application (`obtenirOrdreCategories`). BREAK-TESTS : journal au rapport.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';
import { tranche } from './_helpers/tranche.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CLE = 'categoriesObservation';
const PERS = 'personnalisationObservations';

const CAT = 'cat-banc-1';
const AUTRE_CAT = 'cat-banc-2';
const TAMPON = 'custom-banc-1';
const AUTRE_TAMPON = 'custom-banc-2';

/** Le vrai module des tampons, sur un stock en mémoire : deux catégories à soi, un tampon créé dans chacune. */
function monterOutils(stockInitial = {}) {
    const stock = Object.assign({
        categoriesPerso: [{ id: CAT, nom: 'Catégorie fictive' }, { id: AUTRE_CAT, nom: 'Autre catégorie fictive' }],
        tamponsPersonnalises: [{ id: TAMPON, nom: 'Tampon fictif', categorie: CAT }, { id: AUTRE_TAMPON, nom: 'Autre tampon fictif', categorie: AUTRE_CAT }]
    }, structuredClone(stockInitial));
    const ecritures = [];
    const win = { addEventListener() {}, removeEventListener() {} };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    const db = { ready: false, getSync: (k, d) => (k in stock ? stock[k] : d), setSync: (k, v) => { ecritures.push(k); stock[k] = v; } };
    chargerScript('js/travaux-outils.js', { db, Image: ImageStub }, win);
    win.travauxOutils.rechargerTamponsPersonnalises();
    ecritures.length = 0;
    return { o: win.travauxOutils, stock, ecritures };
}

describe('A · le critère rangé : du texte, rogné, borné', () => {
    it('les espaces sont resserrés et rognés ; au-delà de 200 caractères, le texte est coupé', () => {
        const { o, stock } = monterOutils();
        o.declarerCritereTampon(TAMPON, '  Un   critère\n fictif  ');
        expect(stock[PERS][TAMPON].critere).toBe('Un critère fictif');
        o.declarerCritereTampon(TAMPON, 'x'.repeat(450));
        expect(stock[PERS][TAMPON].critere).toHaveLength(200);
    });
    it('un critère vide, ou qui n\'est pas du texte, n\'écrit rien et n\'efface rien', () => {
        const { o, stock, ecritures } = monterOutils({ [PERS]: { [TAMPON]: { nom: 'Tampon fictif', critere: 'Déjà là' } } });
        for (const v of ['', '   ', null, undefined, 12, { texte: 'x' }, ['x']]) o.declarerCritereTampon(TAMPON, v);
        o.declarerCritereTampon('', 'Sans tampon');
        expect(ecritures).toEqual([]);
        expect(stock[PERS][TAMPON]).toEqual({ nom: 'Tampon fictif', critere: 'Déjà là' });
    });
    it('le critère s\'ajoute à la personnalisation du tampon sans rien lui retirer', () => {
        const { o, stock } = monterOutils({ [PERS]: { [TAMPON]: { nom: 'Tampon fictif', imageBase64: 'data:image/png;base64,AAAA', emoji: '🌟' } } });
        o.declarerCritereTampon(TAMPON, 'Critère fictif');
        expect(stock[PERS][TAMPON]).toEqual({ nom: 'Tampon fictif', imageBase64: 'data:image/png;base64,AAAA', emoji: '🌟', critere: 'Critère fictif' });
    });
});

describe('B · le critère voyage toujours, catégorie d\'observation ou non', () => {
    const AVEC_CRITERES = { [PERS]: { [TAMPON]: { critere: 'Critère fictif' }, [AUTRE_TAMPON]: { critere: 'Autre critère fictif' } } };

    it('sans liste rangée, aucune catégorie n\'est d\'observation, pas même une catégorie fournie', () => {
        const { o, stock } = monterOutils(AVEC_CRITERES);
        expect(CLE in stock).toBe(false);
        const fournies = o.obtenirOrdreCategories().filter((c) => c !== CAT && c !== AUTRE_CAT);
        expect(fournies.length, 'témoin : l\'application fournit des catégories').toBeGreaterThan(0);
        const tous = o.obtenirAutocollants().filter((a) => !a.legacy);
        expect(tous.some((a) => fournies.includes(a.categorie)), 'témoin : et des tampons dans ces catégories').toBe(true);
        for (const a of tous.filter((t) => !t.custom)) expect(o.critereDuTampon(a.id), a.id).toBe('');
        expect(o.critereDuTampon(TAMPON), 'aucune catégorie cochée : le critère rangé voyage quand même').toBe('Critère fictif');
    });
    it('la catégorie cochée rend le critère de ses tampons ; la catégorie non cochée aussi', () => {
        const { o } = monterOutils(Object.assign({ [CLE]: [CAT] }, AVEC_CRITERES));
        expect(o.critereDuTampon(TAMPON)).toBe('Critère fictif');
        expect(o.critereDuTampon(AUTRE_TAMPON), 'sa catégorie n\'est pas d\'observation : non montré, mais emporté').toBe('Autre critère fictif');
        expect(o.critereDuTampon('custom-inconnu')).toBe('');
    });
    it('l\'identifiant d\'une catégorie qui n\'existe plus est ignoré à la lecture', () => {
        const { o, ecritures } = monterOutils(Object.assign({ [CLE]: ['cat-supprimee', CAT, CAT, 7, null],
            tamponsPersonnalises: [{ id: TAMPON, nom: 'Tampon fictif', categorie: CAT }, { id: 'custom-orphelin', nom: 'Orphelin fictif', categorie: 'cat-supprimee' }] },
        { [PERS]: { [TAMPON]: { critere: 'Critère fictif' }, 'custom-orphelin': { critere: 'Critère orphelin' } } }));
        expect(o.critereDuTampon(TAMPON)).toBe('Critère fictif');
        expect(o.critereDuTampon('custom-orphelin'), 'sa catégorie n\'existe plus : son critère voyage encore').toBe('Critère orphelin');
        expect(o.critereDuTampon('custom-inconnu'), 'aucun tampon de cet identifiant').toBe('');
        expect(ecritures, 'lire ne répare rien : rien n\'est écrit').toEqual([]);
    });
    it('une liste qui n\'est pas une liste vaut « aucune », et le critère voyage quand même', () => {
        for (const valeur of [null, 'tout', { [CAT]: true }, 1]) {
            const { o } = monterOutils(Object.assign({ [CLE]: valeur }, AVEC_CRITERES));
            expect(o.critereDuTampon(TAMPON), JSON.stringify(valeur)).toBe('Critère fictif');
        }
    });
    it('un critère rangé trop long ou mal espacé (venu d\'ailleurs) sort propre', () => {
        const { o } = monterOutils({ [CLE]: [CAT], [PERS]: { [TAMPON]: { critere: '  ' + 'y'.repeat(300) } } });
        expect(o.critereDuTampon(TAMPON)).toBe('y'.repeat(200));
    });
});

describe('C · la liste blanche de la bibliothèque laisse entrer `critere`, et lui seul de neuf', () => {
    const win = chargerScript('js/import-export.js');
    const schema = win.SCHEMAS_IMPORT.tampon;
    it('le critère entre, sans balise, borné à 200 caractères ; un champ inconnu n\'entre pas', () => {
        const brut = { id: TAMPON, nom: 'Tampon fictif', categorie: CAT, critere: '<b>Critère</b> fictif<script>x()</script>', observation: true, cible: 'c1', critereId: 'k1' };
        const propre = win.assainirObjet(brut, schema);
        expect(propre.critere).not.toMatch(/[<>]/);
        expect(propre.critere).toContain('Critère');
        expect(Object.keys(propre).sort()).toEqual(['categorie', 'critere', 'id', 'nom']);
        expect(win.assainirObjet({ id: TAMPON, critere: 'z'.repeat(500) }, schema).critere.length).toBeLessThanOrEqual(200);
    });
    it('ce qui n\'est pas du texte n\'entre jamais tel quel : absent, ou devenu un texte court', () => {
        for (const v of [12, true, { texte: 'x' }, ['x'], null]) {
            const propre = win.assainirObjet({ id: TAMPON, critere: v }, schema);
            if ('critere' in propre) {
                expect(typeof propre.critere, JSON.stringify(v)).toBe('string');
                expect(propre.critere.length).toBeLessThanOrEqual(200);
            }
        }
    });
    it('le schéma n\'a gagné qu\'un champ', () => {
        expect(Object.keys(schema).sort()).toEqual(['auteur', 'auteurOriginal', 'categorie', 'critere', 'custom', 'dansBibliotheque', 'dateAjoutBiblio',
            'dateCreation', 'dateImport', 'dateModification', 'estDemo', 'fichier', 'id', 'imageBase64', 'inspireDe', 'isDemo', 'metadata_cc', 'nom']);
    });
});

/* ---------------------------------------------------------------- Le codex (vrai module, vrai ZIP) */
class FauxFileReader {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; if (this.onload) this.onload({ target: this }); }, (e) => { if (this.onerror) this.onerror(e); }); }
    readAsText(blob) { blob.text().then((t) => { this.result = t; if (this.onload) this.onload({ target: this }); }, (e) => { if (this.onerror) this.onerror(e); }); }
}
const consoleSandbox = { log() {}, info() {}, debug() {}, warn() {}, error() {} };
function creerDbCodex(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return { _map: map, ready: true, init: async () => {}, get: async (k, d = null) => (map.has(k) ? map.get(k) : d), set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); }, keys: async () => [...map.keys()], listBlobIds: async () => [], getSync: (k, d = null) => (map.has(k) ? map.get(k) : d),
        setSync: (k, v) => { map.set(k, v); }, syncToLocalStorageCache: async () => {}, flush: async () => {} };
}
function monterCodex(db) {
    const win = { addEventListener() {}, removeEventListener() {}, afficherProgression() {}, majProgression() {}, masquerProgression() {}, trimestreActif: 'a2031' };
    const doc = { readyState: 'loading', addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {}, contains() { return false; } } }),
        body: { addEventListener() {}, appendChild() {} }, documentElement: { addEventListener() {} } };
    const stockage = () => ({ _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    monterFichierSortant(win, { document: doc });
    new Function('window', 'document', 'console', 'localStorage', 'sessionStorage', 'db', 'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator', '"use strict";\n' + lire('js/codex.js'))(win, doc, consoleSandbox, stockage(), stockage(), db, undefined, JSZip,
        FauxFileReader, (cb) => setTimeout(cb, 0), { confirmerAction: async () => true, demanderSaisie: async () => null }, undefined, (cb) => setTimeout(cb, 0),
        { userAgent: 'BacASable/tampons-observation (Node; test)' });
    return win.Codex;
}

describe('D · un codex enregistré puis rouvert rend les deux données à l\'identique', () => {
    it('la liste des catégories et le critère de chaque tampon reviennent tels quels', async () => {
        const depart = {
            trimestres: [{ id: 'a2031', actif: true }],
            [CLE]: [CAT, AUTRE_CAT],
            categoriesPerso: [{ id: CAT, nom: 'Catégorie fictive' }, { id: AUTRE_CAT, nom: 'Autre catégorie fictive' }],
            [PERS]: { [TAMPON]: { nom: 'Tampon fictif', critere: 'Un critère « fictif », avec l\'apostrophe' }, [AUTRE_TAMPON]: { nom: 'Autre tampon fictif' } }
        };
        const zip = await monterCodex(creerDbCodex(depart)).generer({ silencieux: true });
        const cible = creerDbCodex({});
        const fichier = zip.blob; fichier.name = 'codex-banc.zip';
        await monterCodex(cible).charger(fichier);
        expect(cible._map.get(CLE)).toEqual(depart[CLE]);
        expect(cible._map.get(PERS)).toEqual(depart[PERS]);
    }, 20000);
});

describe('E · à la fusion de deux codex, la liste est une donnée, pas un réglage de l\'appareil', () => {
    const Codex = monterCodex(creerDbCodex({}));
    it('absente ici, elle vient de l\'autre codex', () => {
        const analyse = Codex._analyserFusion({}, { [CLE]: [CAT] });
        expect(analyse.importees).toEqual([CLE]);
        expect(analyse.appareil).toEqual([]);
    });
    it('différente des deux côtés, elle est un conflit ; seulement ici, elle est gardée', () => {
        const analyse = Codex._analyserFusion({ [CLE]: [CAT] }, { [CLE]: [AUTRE_CAT] });
        expect(analyse.conflits).toEqual([{ cle: CLE }]);
        expect(analyse.appareil).toEqual([]);
        const seule = Codex._analyserFusion({ [CLE]: [CAT] }, {});
        expect(seule.conflits).toEqual([]);
        expect(seule.importees).toEqual([]);
    });
    it('témoin : un réglage de l\'appareil, lui, ne vient pas et n\'est pas un conflit', () => {
        const analyse = Codex._analyserFusion({}, { categoriesMasquees: [CAT] });
        expect(analyse.importees).toEqual([]);
        expect(analyse.appareil).toEqual(['categoriesMasquees']);
    });
    it('la clé n\'est pas dans REGLAGES_DE_L_APPAREIL, et la fenêtre de fusion la nomme en mots', () => {
        const source = lire('js/codex.js');
        expect(tranche(source, 'var REGLAGES_DE_L_APPAREIL = [', '];')).not.toContain(CLE);
        expect(tranche(source, 'var LIBELLES_DES_CLES = {', '\n};')).toMatch(/categoriesObservation: \{ nom: '[^']*(\\'[^']*)*', ou: 'Annotation › Tampons', unite: 'catégorie' \}/);
    });
});

describe('F · les registres, un seul écrivain, aucune lecture sans appelant', () => {
    const fichiersJs = readdirSync(path.join(RACINE, 'js'), { recursive: true }).filter((f) => String(f).endsWith('.js')).map((f) => 'js/' + String(f).split(path.sep).join('/'));

    it('la clé est déclarée à DATA-OWNERSHIP, avec son propriétaire', () => {
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/\| `categoriesObservation` \| ssot-ok \| `travaux-outils\.js` \| 1 \|/);
    });
    it('seul travaux-outils.js nomme la clé pour la lire ou l\'écrire ; codex.js ne la nomme que pour la dire', () => {
        const quiLaNomme = fichiersJs.filter((f) => lire(f).includes(CLE)).sort();
        expect(quiLaNomme).toEqual(['js/codex.js', 'js/travaux-outils.js']);
        const codex = lire('js/codex.js');
        expect(codex.split(CLE).length - 1, 'une seule mention dans codex.js : son libellé').toBe(1);
        const outils = lire('js/travaux-outils.js');
        expect(outils.match(/'categoriesObservation'/g), 'le nom de la clé n\'est écrit qu\'une fois : la constante').toHaveLength(1);
        expect(outils.match(/db\.setSync\(CLE_CATEGORIES_OBSERVATION/g), 'une seule écriture').toHaveLength(1);
    });
    it('la bibliothèque passe par travaux-outils.js : elle ne lit ni n\'écrit `personnalisationObservations`', () => {
        const biblio = lire('js/tampons-bibliotheque.js');
        expect(biblio, 'elle peut en parler dans un commentaire, pas la lire ni l\'écrire').not.toMatch(/(getSync|setSync|db\.get|db\.set)\(\s*'personnalisationObservations'/);
        expect(biblio).toContain('travauxOutils.critereDuTampon(');
        expect(biblio).toContain('travauxOutils.declarerCritereTampon(');
    });
    it('aucun autre écran ne lit ces réglages dans ce lot', () => {
        const lecteurs = fichiersJs.filter((f) => /critereDuTampon|declarerCritereTampon|obtenirCategoriesObservation/.test(lire(f))).sort();
        expect(lecteurs).toEqual(['js/tampons-bibliotheque.js', 'js/travaux-outils.js']);
    });
    it('rien en dur : le code neuf ne nomme aucune catégorie fournie ni aucun tampon', () => {
        const outils = lire('js/travaux-outils.js');
        const bloc = tranche(outils, '// TAMPONS D\'OBSERVATION — lot 1', '// MIGRATION RLO');
        const { o } = monterOutils();
        const fournies = o.obtenirOrdreCategories().filter((c) => c !== CAT && c !== AUTRE_CAT);
        const tampons = o.obtenirAutocollants().filter((a) => !a.custom).map((a) => a.id);
        for (const nom of fournies.concat(tampons)) expect(bloc, nom).not.toMatch(new RegExp('[\'"]' + nom + '[\'"]'));
    });
    it('la phrase d\'aide acceptée le 22 nov. est dans le code, mot pour mot', () => {
        const { o } = monterOutils();
        expect(typeof o).toBe('object');
        const source = lire('js/travaux-outils.js').replace(/\\u([0-9a-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
        expect(source).toContain('Un tampon d’observation nomme ce que tu vois l’étudiant·e faire. La cause, tu la chercheras avec elle ou lui.');
        expect(source, 'le nom de travail est « tampon d\'observation » : pas « marque »').not.toMatch(/marque d[’']observation/i);
    });
});

describe('G · les mots acceptés par Grégoire le 24 nov. 2026 (15 h 31 et 15 h 33)', () => {
    // Les guillemets des textes portent des espaces insécables, comme dans le code.
    const source = lire('js/travaux-outils.js').replace(/\\u([0-9a-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

    it('l\'aide des catégories (C2) tient en une phrase : « Rien d\'autre ne change pour l\'instant. » est retirée', () => {
        expect(source).toContain("aideCategories: 'Coche « D’observation » pour une catégorie dont les tampons disent ce que tu vois l’étudiant·e faire.',");
        expect(source).not.toMatch(/Rien d[’']autre ne change/);
    });
    it('la case, le champ et les deux annonces sont ceux de la page de textes', () => {
        expect(source).toContain("caseCategorie: 'D’observation',");
        expect(source).toContain("libelleCritere: 'Critère (facultatif)',");
        expect(source).toContain("'« ' + nom + ' » est maintenant une catégorie d’observation. Chacun de ses tampons peut déclarer un critère.'");
        expect(source).toContain("'« ' + nom + ' » n’est plus une catégorie d’observation. Les critères déjà écrits sont gardés, mais ne sont plus montrés.'");
    });
    it('la fenêtre s\'intitule « Tampons et rétroactions », et un jeu exporté « Tampons » : les anciens titres ne sont plus écrits', () => {
        expect(source).toContain('<h2 style="margin-top:0">Tampons et rétroactions</h2>');
        expect(source).not.toMatch(/Rétroactions (—|–|-) Observations/);
        expect(source.match(/demanderMetadonneesEnrichies\('Tampons', /g)).toHaveLength(1);
        expect(source.match(/ajouterMetadonnéesCC\(contenu, 'tampons', 'Tampons', /g)).toHaveLength(1);
        expect(source, 'le titre d\'un jeu exporté').not.toMatch(/['"]Tampons d[’']observation['"]/);
    });
    it('la catégorie fournie « Observations » garde son nom : c\'est un contenu, que l\'utilisateur renomme', () => {
        expect(source).toContain("observations: 'Observations'");
    });
});
