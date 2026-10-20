/**
 * LE BARÈME, LOT 1 — écrire un barème dans « Grilles de critères » (#1120, geste 1).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-20-bareme-1-editeur.md ; plan : PLAN-2026-10-19-bareme.md.
 * Remplace le banc du lot 13 de la dissection (l'éditeur des réponses, retiré avec elles) ; ce qui en
 * reste pour les critères holistiques (le texte d'un niveau) est éprouvé ici, en H.
 *
 * Ce que ce banc verrouille :
 *   L — LA LECTURE UNIQUE (`js/bareme.js`) : toutes les clés de la mesure préalable — nombre avec ou
 *       sans unité, deux bornes (trait court, demi-cadratin, « à »), virgule, « (2) », « Réponse N », un
 *       nom de niveau, une clé illisible ; le zéro est une valeur, « Partiel » n'a pas de points.
 *   R — LES REFUS : ceux de la saisie, ceux de la structure (l'import), leurs textes.
 *   C — LA CONVERSION, sans perte, partage compris : exporter, valider, importer, comparer.
 *   G — LES GESTES, sur un faux stockage : la première modification convertit CE critère seulement ;
 *       un refus n'écrit rien ; une tranche neuve s'écrit aussitôt, « à compléter » (C1 du verdict du
 *       20 oct.), et un refus de points y laisse le nom et le texte ; le retrait confirme.
 *   H — UN CRITÈRE HOLISTIQUE ne change pas : ses textes par niveau, seuls, se modifient.
 *   S — LA SÉCURITÉ : un `<img onerror>` dans un nom de tranche reste du texte ; aucun handler en ligne ;
 *       le partage le refuse.
 *   I — L'INVARIANT 1 : aucun calcul ne lit le barème ; même note avec ou sans.
 *
 * Break-tests (faits le 20 oct.) : une conversion qui perd un texte (`tranchesDuCritere` qui rend le
 * texte vide) → L.a, L.c, G.a, G.c et G.d rouges ; une lecture qui rend 0 pour « Partiel » (`lireCle`) →
 * L.a, L.b, C.b, G.a, G.b et G.g rouges. Code restauré.
 *
 * Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const B = chargerScript('js/bareme.js').bareme;
const K = 'a2032_grillesTemplates';
const cle = (k) => 'a2032_' + k;

/** Une grille fictive, comme la dissection la crée : un critère analytique à réponses, un holistique lié à une échelle. */
function grilleFictive() {
    return {
        id: 'GRILLE_BANC', nom: 'Grille fictive', type: 'analytique',
        criteres: [
            { id: 'CR_1', nom: 'Introduction', type: 'analytique', ponderation: 4, descripteurs: { parNiveau: {
                '0 point': 'Aucune introduction.', '2 points': 'Une introduction incomplète.', 'Partiel': 'Un sujet amené, rien de plus.', '3-4': 'Une introduction complète.' } } },
            { id: 'CR_2', nom: 'Clarté', type: 'holistique', ponderation: 6,
                descripteurs: { echelleId: 'ECH_BANC', parNiveau: { I: 'Texte incomplet.', M: 'Texte maîtrisé.' } } },
            { id: 'CR_3', nom: 'Langue', type: 'analytique', ponderation: 10, descripteurs: { parNiveau: { '5 points': 'Des fautes.', '10 points': 'Aucune faute.' } } }
        ]
    };
}

function monter({ grilles = [grilleFictive()], confirme = true } = {}) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const store = { [K]: grilles, [cle('echellesTemplates')]: [{ id: 'ECH_BANC', nom: 'Échelle du banc', niveaux: [{ code: 'I', nom: 'Incomplet' }, { code: 'M', nom: 'Maîtrisé' }] }] };
    const journal = [];
    let n = 0;
    const db = {
        get: async (k) => (k in store ? store[k] : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const resultat = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            journal.push(['ecrit', k]);
            return resultat;
        }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml };
    chargerScript('js/temoin-enregistrement.js', { document }, win);   // la vraie `raisonPourTemoin`
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre: (raison, geste, k) => journal.push(['nonEnregistre', raison, k]) };
    chargerScript('js/ui-blocs.js', { document }, win);                // la vraie corbeille
    chargerScript('js/bareme.js', {}, win);
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, confirm: (m) => { journal.push(['confirm', m]); return confirme; },
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    }, win);
    const rendre = () => { win.afficherCriteresGrille(JSON.parse(JSON.stringify(store[K][0]))); };
    rendre();
    const critere = (i) => store[K][0].criteres[i];
    const carte = (i) => document.querySelectorAll('#listeCriteres .item-liste')[i];
    const tranches = (i) => [...carte(i).querySelectorAll('.grille-bareme-tranche')];
    const champ = (i, j, nom) => tranches(i)[j].querySelector(`[data-champ="${nom}"]`);
    return { win, document, store, journal, critere, carte, tranches, champ, rendre };
}

/* ======================================================= L — LA LECTURE UNIQUE */

describe('barème 1 · L — la lecture unique', () => {
    const lu = (par, extra) => B.tranchesDuCritere(Object.assign({ type: 'analytique', descripteurs: { parNiveau: par } }, extra));
    const pts = (t) => [t.pointsMin, t.pointsMax];

    it('L.a toutes les clés de la mesure préalable, dans l’ordre écrit, chaque texte intact', () => {
        const par = {
            '0 point': 'zéro', '2 points': 'deux', '3-4': 'trait court', '4 – 5 pts': 'demi-cadratin', '6 à 7': 'à',
            '1,5 point': 'virgule', '3-4 (2)': 'dédoublée', 'Réponse 3': 'sans points', 'Satisfaisant': 'niveau', '≈ quatre ?': 'illisible',
            '8 pts': '  espaces gardés \n'
        };
        const t = lu(par);
        expect(t.map(pts)).toEqual([[0, 0], [2, 2], [3, 4], [4, 5], [6, 7], [1.5, 1.5], [3, 4], [null, null], [null, null], [null, null], [8, 8]]);
        expect(t.map(x => x.nom)).toEqual(['', '', '', '', '', '', '', '', 'Satisfaisant', '≈ quatre ?', '']);
        expect(t.map(x => x.texte)).toEqual(Object.values(par));
        expect(t.map(x => x.id)).toEqual(Array.from({ length: 11 }, (_, i) => 'TR_lu_' + (i + 1)));
    });

    it('L.b le zéro est une valeur ; « Partiel » n’a pas de points (null, pas 0)', () => {
        const [zero, partiel] = lu({ '0': 'a', 'Partiel': 'b' });
        expect(pts(zero)).toEqual([0, 0]);
        expect(pts(partiel)).toEqual([null, null]);
        expect(B.aCompleter(zero)).toBe(false);
        expect(B.aCompleter(partiel)).toBe(true);
    });

    it('L.c des points donnent leur tranche, ou null ; le zéro trouve la sienne, « Partiel » aucune', () => {
        const t = lu({ '0 point': 'zéro', 'Partiel': 'p', '1-2': 'un', '3 à 4': 'trois' });
        expect(B.trancheDesPoints(t, 0).texte).toBe('zéro');
        expect(B.trancheDesPoints(t, 1.5).texte).toBe('un');
        expect(B.trancheDesPoints(t, 4).texte).toBe('trois');
        expect(B.trancheDesPoints(t, 2.5)).toBeNull();
        expect(B.trancheDesPoints(t, undefined)).toBeNull();
        expect(B.trancheDesPoints(t, null)).toBeNull();
        expect(B.trancheDesPoints(t, NaN)).toBeNull();
    });

    it('L.d `bareme` l’emporte ; un critère lié à une échelle, holistique ou algorithmique n’a pas de barème', () => {
        const bareme = [{ id: 'TR_a', nom: 'Juste', pointsMin: 2, pointsMax: 2, texte: 'x' }];
        expect(B.tranchesDuCritere({ type: 'analytique', bareme, descripteurs: { parNiveau: { '0': 'ancien' } } })).toEqual(bareme);
        expect(lu({ I: 'x' }, { descripteurs: { echelleId: 'ECH', parNiveau: { I: 'x' } } })).toEqual([]);
        expect(B.tranchesDuCritere({ type: 'holistique', descripteurs: { parNiveau: { '2 points': 'x' } } })).toEqual([]);
        expect(B.tranchesDuCritere({ type: 'algorithmique', bareme })).toEqual([]);
        expect(B.tranchesDuCritere({ type: 'analytique' })).toEqual([]);
        expect(B.tranchesDuCritere(null)).toEqual([]);
    });

    it('L.e la lecture n’écrit rien : le critère lu est identique avant et après', () => {
        const c = grilleFictive().criteres[0];
        const avant = JSON.stringify(c);
        B.tranchesDuCritere(c);
        expect(JSON.stringify(c)).toBe(avant);
        expect(B.estAncien(c)).toBe(true);
    });

    it('L.f la saisie : un nombre, deux bornes (dans l’ordre), la virgule ; l’affichage', () => {
        expect(B.lirePoints('3')).toEqual({ pointsMin: 3, pointsMax: 3 });
        expect(B.lirePoints(' 2,5 pts ')).toEqual({ pointsMin: 2.5, pointsMax: 2.5 });
        expect(B.lirePoints('4-3')).toEqual({ pointsMin: 3, pointsMax: 4 });
        expect(B.lirePoints('3 points à 4 points')).toEqual({ pointsMin: 3, pointsMax: 4 });
        expect(B.lirePoints('')).toEqual({ vide: true });
        expect(B.lirePoints('trois')).toEqual({ illisible: true });
        expect(B.lirePoints('-1')).toEqual({ negatif: true });
        expect(['3', '2,5', '3 à 4', '']).toEqual([{ pointsMin: 3, pointsMax: 3 }, { pointsMin: 2.5, pointsMax: 2.5 }, { pointsMin: 3, pointsMax: 4 }, { pointsMin: null, pointsMax: null }].map(B.pointsEnTexte));
    });
});

/* ======================================================= R — LES REFUS */

describe('barème 1 · R — les refus', () => {
    const T = [
        { id: 'a', nom: '', pointsMin: 0, pointsMax: 1, texte: '' },
        { id: 'b', nom: 'Juste', pointsMin: 3, pointsMax: 4, texte: '' },
        { id: 'c', nom: 'Partiel', pointsMin: null, pointsMax: null, texte: '' }
    ];

    it('R.a les points : lisibles, de 0 à la pondération, sans chevauchement ; effacés, la tranche redevient « à compléter »', () => {
        const refus = (s, max = 4) => B.modifierPoints(T, 'c', s, max).refuse;
        expect(refus(' ')).toBeUndefined();
        expect(B.modifierPoints(T, 'b', ' ', 4).tranches[1]).toMatchObject({ nom: 'Juste', pointsMin: null, pointsMax: null });   // null, pas 0
        expect(refus('deux')).toBe('Ces points ne se lisent pas : écris un nombre (3 ou 2,5) ou deux bornes (3 à 4)');
        expect(refus('-1')).toBe('Les points d’une tranche commencent à 0 : corrige-les');
        expect(refus('5')).toBe('Les points d’une tranche vont de 0 à 4, la pondération du critère : corrige-les, ou change la pondération');
        expect(refus('5', 4.5)).toBe('Les points d’une tranche vont de 0 à 4,5, la pondération du critère : corrige-les, ou change la pondération');
        expect(refus('1-2')).toBe('Ces points chevauchent ceux de la tranche 0 à 1 : choisis des points qu’aucune autre tranche ne couvre');
        expect(refus('4')).toBe('Ces points chevauchent ceux de la tranche « Juste » (3 à 4) : choisis des points qu’aucune autre tranche ne couvre');
        expect(refus('2')).toBeUndefined();
        expect(refus('2', null)).toBeUndefined();   // sans pondération, pas de borne haute
        expect(refus('50', null)).toBeUndefined();
        // Ses propres points ne la chevauchent pas.
        expect(B.modifierPoints(T, 'b', '3,5 à 4', 4).tranches[1]).toMatchObject({ pointsMin: 3.5, pointsMax: 4 });
    });

    it('R.b le nom, le texte, le nombre de tranches ; une tranche qui n’est plus là n’est pas touchée, sans un mot', () => {
        expect(B.modifierNom(T, 'a', 'x'.repeat(201)).refuse).toBe('Le nom d’une tranche fait 200 caractères au plus');
        expect(B.modifierTexte(T, 'a', 'x'.repeat(5001)).refuse).toBe('Une tranche fait 5 000 caractères au plus');
        expect(B.modifierTexte(T, 'a', 'x'.repeat(5000)).tranches).toBeDefined();
        const vingt = Array.from({ length: 20 }, (_, i) => ({ id: 'T' + i, nom: '', pointsMin: i, pointsMax: i, texte: '' }));
        expect(B.ajouter(vingt.slice(1), 'n').tranches).toHaveLength(20);
        expect(B.ajouter(vingt, 'n')).toEqual({ refuse: 'Au plus 20 tranches par critère' });
        expect(B.modifierNom(T, 'z', 'x')).toEqual({ refuse: null });
        expect(B.modifierPoints(T, 'z', '2', 4)).toEqual({ refuse: null });
        expect(B.retirer(T, 'z')).toEqual({ refuse: null });
    });

    it('R.c une tranche neuve s’ajoute en dernier, vide et sans points (« à compléter ») — rien n’est inventé', () => {
        const r = B.ajouter(T, 'n');
        expect(r.tranches.slice(0, 3)).toEqual(T);
        expect(r.tranches.slice(-1)).toEqual([{ id: 'n', nom: '', pointsMin: null, pointsMax: null, texte: '' }]);
        expect(B.aCompleter(r.tranches[3])).toBe(true);
        expect(B.refusStructure(r.tranches)).toBeNull();
    });

    it('R.d la structure (l’import) : ce que l’application écrit entre, même sans points, même chevauchant', () => {
        expect(B.refusStructure([])).toBeNull();
        expect(B.refusStructure(T)).toBeNull();
        expect(B.refusStructure([{ id: 'a', nom: '', pointsMin: 0, pointsMax: 2, texte: '' }, { id: 'b', nom: '', pointsMin: 2, pointsMax: 9, texte: '' }])).toBeNull();
        expect(B.refusStructure('x')).toBe('le barème doit être une liste');
        expect(B.refusStructure(Array.from({ length: 21 }, (_, i) => ({ id: 'T' + i, nom: '', pointsMin: null, pointsMax: null, texte: '' })))).toBe('21 tranches > max 20');
        expect(B.refusStructure([{ id: 'a', nom: '', pointsMin: 4, pointsMax: 3, texte: '' }])).toBe('tranche 1 : des bornes à l’envers');
        expect(B.refusStructure([{ id: 'a', nom: '', pointsMin: -1, pointsMax: 3, texte: '' }])).toBe('tranche 1 : des points négatifs');
        expect(B.refusStructure([{ id: 'a', nom: '', pointsMin: 1, pointsMax: null, texte: '' }])).toBe('tranche 1 : des points : deux nombres, ou deux null');
        expect(B.refusStructure([T[0], T[0]])).toBe('tranche 2 : identifiant en double (a)');
        expect(B.refusStructure([{ id: 'a', nom: '', pointsMin: 0, pointsMax: 0, texte: 'x'.repeat(5001) }])).toBe('tranche 1 : texte absent ou > 5000 caractères');
    });

    it('R.e les refus validés par Grégoire (lot 13, 19 oct. 19 h 29) gardent leurs mots, « réponse » devenu « tranche »', () => {
        const src = readFileSync(path.join(racine, 'js', 'bareme.js'), 'utf8');
        expect(src).toContain("trop: 'Au plus 20 tranches par critère'");
        expect(src).toContain("texteLong: 'Une tranche fait 5 000 caractères au plus'");
        // C1 (verdict du 20 oct.) : « Les points de la tranche sont obligatoires » ne bloque plus rien, il est parti.
        expect(src).not.toContain('pointsVides');
    });
});

/* ======================================================= C — LA CONVERSION, PARTAGE COMPRIS */

describe('barème 1 · C — la conversion, sans perte, partage compris', () => {
    it('C.a écrire ce qui est lu : `bareme` identique à la lecture, `parNiveau` retiré de ce critère seulement', () => {
        const g = grilleFictive();
        const lu = B.tranchesDuCritere(g.criteres[0]);
        const autre = JSON.stringify(g.criteres[1]);
        B.ecrireSurCritere(g.criteres[0], lu);
        expect(g.criteres[0].bareme).toEqual(lu);
        expect(g.criteres[0]).not.toHaveProperty('descripteurs');
        expect(B.tranchesDuCritere(g.criteres[0])).toEqual(lu);
        expect(JSON.stringify(g.criteres[1])).toBe(autre);
        expect(B.estAncien(g.criteres[2])).toBe(true);
    });

    it('C.b exporter, valider, importer (partage et fichier) : les mêmes tranches, à l’octet près', () => {
        const g = grilleFictive();
        B.ecrireSurCritere(g.criteres[0], B.tranchesDuCritere(g.criteres[0]));
        g.criteres[0].bareme[3].nom = 'Juste et complet';   // un nom, une tranche à compléter (« Partiel »), un zéro
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        const attendu = JSON.stringify(B.tranchesDuCritere(g.criteres[0]));

        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/bareme.js');
        chargerScript('js/partage-schemas.js', {}, wp);
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        chargerScript('js/partage-import.js', { db: dbP }, wp);
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        const verdict = wp.partageValidation.validerPackage(JSON.parse(JSON.stringify(paquet)));
        expect(verdict.erreurs).toEqual([]);
        const recue = wp.partageImport.prefixerEntites(verdict.packageNettoye, 'IMP_banc').parType.grille[0];
        expect(JSON.stringify(B.tranchesDuCritere(recue.criteres[0]))).toBe(attendu);
        // Le critère encore à réponses voyage aussi, tel quel, et se lit pareil à l'arrivée.
        expect(B.tranchesDuCritere(recue.criteres[2])).toEqual(B.tranchesDuCritere(g.criteres[2]));

        const wie = chargerScript('js/import-export.js');
        const importee = wie.assainirObjet(JSON.parse(JSON.stringify(g)), wie.SCHEMAS_IMPORT.grille);
        expect(JSON.stringify(B.tranchesDuCritere(importee.criteres[0]))).toBe(attendu);
        expect(importee.criteres[0].bareme[2]).toMatchObject({ nom: 'Partiel', pointsMin: null, pointsMax: null });   // null, pas 0
    });

    it('C.c le partage refuse un barème mal formé (la règle de `bareme.js`), et un champ que le schéma ne connaît pas', () => {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/bareme.js');
        chargerScript('js/partage-schemas.js', {}, wp);
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        const paquetDe = (bareme) => {
            const g = grilleFictive();
            g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
            const p = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
            p.entites.grilles[0].criteres[0].bareme = bareme;
            return p;
        };
        const ok = { id: 'TR_1', nom: '', pointsMin: 1, pointsMax: 2, texte: '' };
        expect(wp.partageValidation.validerPackage(paquetDe([ok])).valide).toBe(true);
        const envers = wp.partageValidation.validerPackage(paquetDe([Object.assign({}, ok, { pointsMin: 3 })]));
        expect(envers.valide).toBe(false);
        expect(envers.erreurs.map(e => e.message)).toContain('barème : tranche 1 : des bornes à l’envers');
        expect(wp.partageValidation.validerPackage(paquetDe([Object.assign({}, ok, { couleur: 'rouge' })])).valide).toBe(false);
    });
});

/* ======================================================= G — LES GESTES */

describe('barème 1 · G — les gestes, dans « Grilles de critères »', () => {
    it('G.a la première modification écrit le barème tel qu’affiché et retire les réponses de CE critère seulement', async () => {
        const m = monter();
        const affiche = m.tranches(0).map(t => [t.querySelector('[data-champ="nom"]').value, t.querySelector('[data-champ="points"]').value, t.querySelector('textarea').value]);
        expect(affiche).toEqual([['', '0', 'Aucune introduction.'], ['', '2', 'Une introduction incomplète.'], ['Partiel', '', 'Un sujet amené, rien de plus.'], ['', '3 à 4', 'Une introduction complète.']]);
        const autres = [JSON.stringify(m.critere(1)), JSON.stringify(m.critere(2))];
        const t = m.champ(0, 1, 'texte');
        t.value = 'Une introduction qui annonce le sujet.';
        await m.win.modifierTrancheBaremeHandler(t);
        const c = m.critere(0);
        expect(c).not.toHaveProperty('descripteurs');
        expect(c.bareme.map(x => [x.id, x.nom, x.pointsMin, x.pointsMax, x.texte])).toEqual([
            ['TR_lu_1', '', 0, 0, 'Aucune introduction.'], ['TR_lu_2', '', 2, 2, 'Une introduction qui annonce le sujet.'],
            ['TR_lu_3', 'Partiel', null, null, 'Un sujet amené, rien de plus.'], ['TR_lu_4', '', 3, 4, 'Une introduction complète.']]);
        expect([JSON.stringify(m.critere(1)), JSON.stringify(m.critere(2))]).toEqual(autres);
    });

    it('G.b les points : lus, remis en forme, la marque « à compléter » part ; un refus n’écrit rien, le témoin dit pourquoi', async () => {
        const m = monter();
        expect(m.tranches(0)[2].querySelector('.grille-bareme-marque').textContent).toBe('à compléter');
        const p = m.champ(0, 2, 'points');
        expect(p.getAttribute('aria-describedby')).toBe(m.tranches(0)[2].querySelector('.grille-bareme-marque').id);
        p.value = '1';
        await m.win.modifierTrancheBaremeHandler(p);
        expect(m.critere(0).bareme[2]).toMatchObject({ nom: 'Partiel', pointsMin: 1, pointsMax: 1 });
        expect(m.tranches(0)[2].querySelector('.grille-bareme-marque')).toBeNull();
        expect(p.hasAttribute('aria-describedby')).toBe(false);

        const avant = JSON.stringify(m.store[K]);
        const q = m.champ(0, 3, 'points');
        q.value = '2-3';
        await m.win.modifierTrancheBaremeHandler(q);
        expect(JSON.stringify(m.store[K])).toBe(avant);
        expect(q.classList.contains('champ-refuse')).toBe(true);
        expect(m.journal).toContainEqual(['nonEnregistre', 'ces points chevauchent ceux de la tranche 2 : choisis des points qu’aucune autre tranche ne couvre.', K]);
        q.value = '3,5 à 4';
        await m.win.modifierTrancheBaremeHandler(q);
        expect(q.value).toBe('3,5 à 4');
        expect(q.classList.contains('champ-refuse')).toBe(false);
    });

    it('G.c « + Ajouter une tranche » (C1) : écrite aussitôt, « à compléter » ; nom et texte au fil de la saisie ; un refus de points les laisse', async () => {
        const m = monter();
        await m.win.ajouterTrancheBareme('GRILLE_BANC', 2);
        // Écrite tout de suite, par la file : la conversion de CE critère, et la tranche vide en dernier.
        expect(m.critere(2)).not.toHaveProperty('descripteurs');
        expect(m.critere(2).bareme.slice(-1)).toEqual([{ id: 'TR_banc1', nom: '', pointsMin: null, pointsMax: null, texte: '' }]);
        const neuve = m.tranches(2)[2];
        expect(neuve.querySelector('.grille-bareme-marque').textContent).toBe('à compléter');
        expect(m.document.activeElement).toBe(neuve.querySelector('[data-champ="nom"]'));
        neuve.querySelector('[data-champ="nom"]').value = 'Presque';
        await m.win.modifierTrancheBaremeHandler(neuve.querySelector('[data-champ="nom"]'));
        neuve.querySelector('textarea').value = 'Une ou deux fautes.';
        await m.win.modifierTrancheBaremeHandler(neuve.querySelector('textarea'));
        expect(m.critere(2).bareme[2]).toEqual({ id: 'TR_banc1', nom: 'Presque', pointsMin: null, pointsMax: null, texte: 'Une ou deux fautes.' });
        // Des points qui chevauchent : refusés, les points seuls ; le nom et le texte restent écrits.
        const p = m.champ(2, 2, 'points');
        p.value = '4-6';
        await m.win.modifierTrancheBaremeHandler(p);
        expect(p.classList.contains('champ-refuse')).toBe(true);
        expect(m.critere(2).bareme[2]).toEqual({ id: 'TR_banc1', nom: 'Presque', pointsMin: null, pointsMax: null, texte: 'Une ou deux fautes.' });
        p.value = '8';
        await m.win.modifierTrancheBaremeHandler(p);
        expect(m.critere(2).bareme[2]).toMatchObject({ pointsMin: 8, pointsMax: 8, texte: 'Une ou deux fautes.' });
        expect(m.tranches(2)[2].querySelector('.grille-bareme-marque')).toBeNull();
        expect(m.critere(2).bareme.slice(0, 2).map(x => x.texte)).toEqual(['Des fautes.', 'Aucune faute.']);
        // Ses points effacés : la marque revient, la tranche est à compléter.
        p.value = '';
        await m.win.modifierTrancheBaremeHandler(p);
        expect(m.critere(2).bareme[2]).toMatchObject({ pointsMin: null, pointsMax: null });
        expect(m.tranches(2)[2].querySelector('.grille-bareme-marque').textContent).toBe('à compléter');
        expect(p.getAttribute('aria-describedby')).toBe(m.tranches(2)[2].querySelector('.grille-bareme-marque').id);
    });

    it('G.c2 au plus 20 tranches : la 21e n’est pas écrite, le témoin le dit', async () => {
        const g = grilleFictive();
        g.criteres[2].bareme = Array.from({ length: 20 }, (_, i) => ({ id: 'T' + i, nom: '', pointsMin: null, pointsMax: null, texte: '' }));
        const m = monter({ grilles: [g] });
        const avant = JSON.stringify(m.store[K]);
        await m.win.ajouterTrancheBareme('GRILLE_BANC', 2);
        expect(JSON.stringify(m.store[K])).toBe(avant);
        expect(m.journal).toContainEqual(['nonEnregistre', 'au plus 20 tranches par critère.', K]);
    });

    it('G.d retirer : la confirmation du retrait d’un critère ; annulée, rien ne part', async () => {
        const non = monter({ confirme: false });
        await non.win.retirerTrancheBareme('GRILLE_BANC', 0, 'TR_lu_2');
        expect(non.critere(0)).toEqual(grilleFictive().criteres[0]);
        const oui = monter();
        await oui.win.retirerTrancheBareme('GRILLE_BANC', 0, 'TR_lu_2');
        expect(oui.journal).toContainEqual(['confirm', 'Es-tu sûr de vouloir retirer cette tranche ?']);
        expect(oui.critere(0).bareme.map(x => x.id)).toEqual(['TR_lu_1', 'TR_lu_3', 'TR_lu_4']);
        expect(oui.tranches(0).map(t => t.querySelector('textarea').value)).toEqual(['Aucune introduction.', 'Un sujet amené, rien de plus.', 'Une introduction complète.']);
    });

    it('G.e la dernière tranche retirée : le critère n’a plus ni barème ni réponses', async () => {
        const g = grilleFictive();
        g.criteres[0].descripteurs.parNiveau = { '2 points': 'Seule.' };
        const m = monter({ grilles: [g] });
        await m.win.retirerTrancheBareme('GRILLE_BANC', 0, 'TR_lu_1');
        expect(m.critere(0)).not.toHaveProperty('bareme');
        expect(m.critere(0)).not.toHaveProperty('descripteurs');
    });

    it('G.f un critère déplacé entre le rendu et le geste n’est pas touché (`_memeCritere`)', async () => {
        const m = monter();
        const t = m.champ(0, 0, 'texte');
        m.store[K][0].criteres.reverse();   // un autre onglet a réordonné la grille
        const avant = JSON.stringify(m.store[K]);
        t.value = 'Écrit au mauvais endroit ?';
        await m.win.modifierTrancheBaremeHandler(t);
        expect(JSON.stringify(m.store[K])).toBe(avant);
    });

    it('G.g une pondération baissée après coup : la tranche se montre « hors barème », rien n’est réécrit', () => {
        const g = grilleFictive();
        g.criteres[0].ponderation = 3;
        const m = monter({ grilles: [g] });
        expect(m.tranches(0).map(t => (t.querySelector('.grille-bareme-marque') || {}).textContent)).toEqual([undefined, undefined, 'à compléter', 'hors barème']);
        expect(m.critere(0)).toEqual(g.criteres[0]);
    });

    it('G.h un critère analytique sans rien : son barème vide et « + Ajouter une tranche »', () => {
        const g = grilleFictive();
        delete g.criteres[0].descripteurs;
        const m = monter({ grilles: [g] });
        expect(m.tranches(0)).toHaveLength(0);
        expect(m.carte(0).querySelector('.grille-attendu-titre').textContent).toBe('Barème');
        expect(m.carte(0).querySelector('[data-action="ajouterTrancheBareme"]').textContent).toBe('+ Ajouter une tranche');
    });
});

/* ======================================================= H — UN CRITÈRE HOLISTIQUE */

describe('barème 1 · H — un critère holistique ne change pas', () => {
    it('H.a ses textes par niveau, nommés par l’échelle, seuls modifiables ; aucun barème', async () => {
        const m = monter();
        const carte = m.carte(1);
        expect(carte.querySelector('.grille-bareme')).toBeNull();
        expect([...carte.querySelectorAll('.grille-attendu-niveau strong')].map(s => s.textContent)).toEqual(['Incomplet', 'Maîtrisé']);
        expect([...carte.querySelectorAll('.grille-attendu input, .grille-attendu button')]).toHaveLength(0);
        const t = carte.querySelectorAll('.grille-attendu-niveau textarea')[1];
        t.value = 'Un texte maîtrisé, revu.';
        await m.win.modifierTexteReponseGrilleHandler(t);
        expect(m.critere(1).descripteurs).toEqual({ echelleId: 'ECH_BANC', parNiveau: { I: 'Texte incomplet.', M: 'Un texte maîtrisé, revu.' } });
    });

    it('H.b le geste du texte par niveau ne touche pas les réponses d’un critère analytique (elles sont son barème)', async () => {
        const m = monter();
        const leurre = m.document.createElement('textarea');
        Object.assign(leurre.dataset, { grilleId: 'GRILLE_BANC', critereIndex: '0', reponseIndex: '0', reponseCle: '0 point' });
        leurre.value = 'x';
        const avant = JSON.stringify(m.store[K]);
        await m.win.modifierTexteReponseGrilleHandler(leurre);
        expect(JSON.stringify(m.store[K])).toBe(avant);
    });
});

/* ======================================================= S — LA SÉCURITÉ */

describe('barème 1 · S — la sécurité', () => {
    const piege = '"><img src=x onerror="window.__pwn=1">';

    it('S.a un <img onerror> dans un nom et un texte de tranche reste du texte ; aucun handler en ligne', () => {
        const g = grilleFictive();
        g.criteres[0].bareme = [{ id: piege, nom: piege, pointsMin: 1, pointsMax: 1, texte: piege }];
        const m = monter({ grilles: [g] });
        const bloc = m.carte(0).querySelector('.grille-attendu');
        expect(bloc.querySelector('img[src="x"]')).toBeNull();   // la seule image est celle de la corbeille
        expect(m.champ(0, 0, 'nom').value).toBe(piege);
        expect(m.champ(0, 0, 'texte').value).toBe(piege);
        expect(m.champ(0, 0, 'nom').dataset.trancheId).toBe(piege);
        expect([...m.document.querySelectorAll('#listeCriteres *')].flatMap(e => [...e.attributes].map(x => x.name)).filter(n => /^on/i.test(n))).toEqual([]);
        expect([...bloc.querySelectorAll('[data-champ]')].every(x => x.getAttribute('data-on-change') === 'modifierTrancheBaremeHandler')).toBe(true);
    });

    it('S.b le partage refuse le paquet qui le porte (niveau 5, contenu dangereux)', () => {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/bareme.js');
        chargerScript('js/partage-schemas.js', {}, wp);
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        const g = grilleFictive();
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        g.criteres[0].bareme = [{ id: 'TR_1', nom: '<img src=x onerror=alert(1)>', pointsMin: 1, pointsMax: 1, texte: '' }];
        const v = wp.partageValidation.validerPackage(wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' }));
        expect(v.valide).toBe(false);
        expect(v.erreurs.map(e => e.code)).toContain('CONTENU_DANGEREUX');
    });
});

/* ======================================================= I — L'INVARIANT 1 */

describe('barème 1 · I — aucun calcul ne lit le barème', () => {
    it('I.a seuls la lecture, l’éditeur, l’import et le partage nomment `bareme` ; aucun module de note, de P, du Comparateur ni du dépistage', () => {
        // Le jour où l'un d'eux le lira, changer une tranche pourra changer une note : ce banc rougit, et la
        // question remonte à Grégoire (invariant 1 du plan).
        const lecteurs = readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js'))
            .filter(f => /\bbareme\b/.test(readFileSync(path.join(racine, 'js', f), 'utf8')));
        expect(lecteurs.sort()).toEqual(['bareme.js', 'grilles.js', 'import-export.js', 'partage-schemas.js', 'partage-validation.js']);
    });

    it('I.b ni les réponses ni le barème : aucun module d’évaluation, de note ou de bilan ne lit `descripteurs`', () => {
        const lecteurs = readdirSync(path.join(racine, 'js')).filter(f => f.endsWith('.js'))
            .filter(f => /\.descripteurs\b|\bdescripteurs\s*(?:\.[a-zA-Z]|\[)/.test(readFileSync(path.join(racine, 'js', f), 'utf8')));
        expect(lecteurs.sort()).toEqual(['bareme.js', 'grilles.js', 'import-export.js', 'materiel-assistant.js', 'materiel-creation.js']);
    });

    it('I.c mêmes points, même note : la portée d’une évaluation enregistrée, avec et sans barème', () => {
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/evaluation-calcul.js', { document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
            db: { getSync: (k, d) => d }, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s) }, win);
        const sans = grilleFictive();
        sans.criteres.forEach(c => { delete c.descripteurs; });
        const avec = grilleFictive();
        avec.criteres.forEach(c => { if (B.estAncien(c)) B.ecrireSurCritere(c, B.tranchesDuCritere(c)); });
        expect(avec.criteres[0].bareme).toHaveLength(4);
        const niveaux = [{ code: 'I', valeurCalcul: 40 }, { code: 'M', valeurCalcul: 82 }];
        const evaluation = { criteres: [{ critereId: 'CR_2', niveauSelectionne: 'M' }], pointsAnalytiques: { CR_1: 0, CR_3: 7.5 } };
        // La portée recopie chaque critère compté (avec son barème, ou non) : on compare ce qu'elle CALCULE.
        const p = (g) => {
            const r = win.porteeDepuisEvaluation(JSON.parse(JSON.stringify(evaluation)), g, niveaux);
            r.criteresComptes = r.criteresComptes.map(x => Object.assign({}, x, { critere: x.critere.id }));
            return JSON.stringify(r);
        };
        expect(p(avec)).toBe(p(sans));
        expect(JSON.parse(p(avec)).criteresComptes.map(x => [x.critere, x.valeur])).toEqual([['CR_1', 0], ['CR_2', 82], ['CR_3', 75]]);
    });
});
