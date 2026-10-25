/**
 * LE CRITÈRE ALGORITHMIQUE, ÉTAPE 2a (22 oct. 2026) — LES DEUX NOMS DE L'ENSEIGNANT·E.
 *
 * Consigne : plans de travail/CONSIGNE-DU-JOUR.md (22 oct., 17 h 05) ; plan :
 * PLAN-2026-10-21-critere-algorithmique-toute-discipline.md, étape 2 ; textes provisoires :
 * TEXTES-2026-10-22-noms-critere-algorithmique.md. Décisions de Grégoire : aucun nom par défaut
 * (16 h 59) ; la parenthèse ne s'accorde plus, « (3,5 après pondération) » (17 h).
 *
 * Ce que ce banc verrouille :
 *   ↻ Retouches de la relecture (22 oct., 17 h 44, VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md) :
 *       « neuf » se lit à la marque PROPRE aux noms (`nomsAttendus`), plus à celle des codes, en ligne depuis
 *       la 1.213 ; le bilan d'un critère effondré et « Tous les critères sont maîtrisés » portent les noms,
 *       sans le participe (Grégoire, 17 h 43).
 *   N — LE MODÈLE : trois lectures (écrits ; d'avant, « erreur / mot » ; neuf, le repli) ; une
 *       paire à moitié écrite se lit absente ; la règle unique du pluriel ; l'écriture, au geste seulement.
 *   S — L'INVARIANT DU STOCK (sentinelle) : un critère sans noms rend, au caractère près, les phrases et la
 *       ligne du PDF de `5bd643c3` — sauf la parenthèse. Les chaînes attendues ont été MESURÉES sur
 *       `5bd643c3` (ses modules, le 22 oct. à 17 h 20), pas recopiées de l'écran.
 *   D — LE GARDE-FOU DU PLAN : une rédaction (« erreur / mot ») et une discipline sans texte (« unité
 *       manquante / unités manquantes » sur « calcul / calculs »), sur chaque surface du § 2.4 : les champs
 *       de l'évaluation et leur ligne de résultat, l'aide sous la formule, le miroir, la copie fictive d'un
 *       palier, la ligne du PDF, le décompte et « Aucune annotation » du modèle Générique, le total d'Annoter.
 *   E — L'ÉDITEUR : un critère neuf a ses champs vides, l'exemple grisé et l'invitation ; un critère d'avant
 *       montre ce qu'il lit et n'écrit rien au rendu ; le geste écrit les quatre formes affichées ; une forme
 *       trop longue est refusée ; « Partir de la liste du français écrit » pose « erreur » et « mot ».
 *   A — ANNOTER : l'invitation tant qu'un critère neuf n'a pas ses noms ; rien pour un critère d'avant.
 *   X — UN NOM PIÉGÉ reste du texte : éditeur, évaluation, PDF, miroir, Annoter.
 *   V — LE VOYAGE : l'export (fichier) et le partage gardent les noms ; une grille sans noms ressort sans noms.
 *
 * Break-tests : voir la demande de relecture. Grilles, noms et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const E = () => chargerScript('js/evaluation-enonces.js').enoncesAlgo;

const CHIMIE_NOMS = { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } };
const REDACTION_NOMS = { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
const PIEGE = '<img src=x onerror=alert(1)>';
const NOMS_PIEGES = { erreurs: { singulier: PIEGE, pluriel: PIEGE }, mots: { singulier: PIEGE, pluriel: PIEGE } };

const critere = (o) => Object.assign({ id: 'CA', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20 }, o);
const CHIMIE = critere({ codesSousCriteresSeulement: true, nomsAttendus: true, noms: CHIMIE_NOMS });
const REDACTION = critere({ nom: 'Langue écrite', codesSousCriteresSeulement: true, nomsAttendus: true, noms: REDACTION_NOMS });
const NEUF_SANS_NOMS = critere({ codesSousCriteresSeulement: true, nomsAttendus: true });
const STOCK = critere({});   // d'avant : ni marque, ni noms
// Né en 1.213 ou 1.214 : la marque des codes, pas celle des noms — c'est du stock (retouche 1).
const STOCK_1213 = critere({ codesSousCriteresSeulement: true });

/* ======================================================= N — LE MODÈLE */

describe('noms · N — le modèle', () => {
    it('N.a trois lectures : écrits ; d’avant, « erreur / mot » ; neuf sans noms, le repli — jamais vide', () => {
        const e = E();
        expect(e.noms(CHIMIE)).toEqual(CHIMIE_NOMS);
        expect(e.noms(STOCK)).toEqual(REDACTION_NOMS);
        expect(e.noms(null)).toEqual(REDACTION_NOMS);
        expect(e.noms({ nom: 'Français écrit' })).toEqual(REDACTION_NOMS);   // `critereAlgorithmiqueOuNomme` sans grille
        expect(e.noms(NEUF_SANS_NOMS)).toEqual(e.NOMS_DE_REPLI);
        Object.values(e.noms(NEUF_SANS_NOMS)).forEach((p) => { expect(p.singulier).toBeTruthy(); expect(p.pluriel).toBeTruthy(); });
    });

    it('N.b une paire à moitié écrite se lit absente ; l’autre paire garde ses noms', () => {
        const e = E();
        const c = critere({ nomsAttendus: true, noms: { erreurs: { singulier: 'unité manquante' }, mots: CHIMIE_NOMS.mots } });
        expect(e.noms(c)).toEqual({ erreurs: e.NOMS_DE_REPLI.erreurs, mots: CHIMIE_NOMS.mots });
        expect(e.nomsManquants(c)).toEqual(['erreurs']);
        const s = critere({ noms: { mots: { pluriel: '  ' } } });
        expect(e.noms(s)).toEqual(REDACTION_NOMS);
    });

    it('N.c ce qui manque : un neuf, toute paire incomplète ; un d’avant, seulement une paire écrite à moitié', () => {
        const e = E();
        expect(e.nomsManquants(NEUF_SANS_NOMS)).toEqual(['erreurs', 'mots']);
        expect(e.nomsManquants(CHIMIE)).toEqual([]);
        expect(e.nomsManquants(STOCK)).toEqual([]);
        expect(e.nomsManquants(critere({ noms: { erreurs: { singulier: 'faute' } } }))).toEqual(['erreurs']);
    });

    it('N.d une seule règle du pluriel : singulier sous 2 — « 0 erreur », « 1 erreur », « 1,5 erreur », « 2 erreurs »', () => {
        const e = E();
        expect([0, 1, 1.5, 1.99, 2, 7].map((n) => e.accorder(n, REDACTION_NOMS.erreurs))).toEqual(['erreur', 'erreur', 'erreur', 'erreur', 'erreurs', 'erreurs']);
        expect([undefined, null, '', 'abc'].map((n) => e.accorder(n, CHIMIE_NOMS.mots))).toEqual(['calcul', 'calcul', 'calcul', 'calcul']);
        expect(e.enonce(STOCK, 'decompte', { erreurs: 1.5, mots: 400 })).toBe('Ta production contient 1.5 erreur pour 400 mots.');
    });

    it('N.e l’écriture : au geste (`appliquerNoms`) ; une forme vide efface ; des noms vides partent ; trop long, refusé sans rien écrire', () => {
        const e = E();
        const c = critere({});
        expect(e.appliquerNoms(c, CHIMIE_NOMS).refuse).toBeNull();
        expect(c.noms).toEqual(CHIMIE_NOMS);
        e.appliquerNoms(c, { erreurs: { singulier: '  unité absente ' } });
        expect(c.noms.erreurs).toEqual({ singulier: 'unité absente', pluriel: 'unités manquantes' });
        const r = e.appliquerNoms(c, { mots: { singulier: 'x'.repeat(e.MAX_NOM + 1) } });
        expect(r.refuse).toBe('Un nom fait 40 caractères au plus');
        expect(c.noms.mots).toEqual(CHIMIE_NOMS.mots);
        e.appliquerNoms(c, { erreurs: { singulier: '', pluriel: '' }, mots: { singulier: '', pluriel: '' } });
        expect(c).not.toHaveProperty('noms');
    });

    it('N.f lire n’écrit rien : `noms`, `enonce`, `nomsManquants` laissent le critère tel quel', () => {
        const e = E();
        [STOCK, NEUF_SANS_NOMS, CHIMIE].forEach((c) => {
            const avant = JSON.stringify(c);
            e.noms(c); e.nomsManquants(c); e.enonce(c, 'decompte', { erreurs: 3, mots: 400 }); e.enonce(c, 'aucune', {});
            expect(JSON.stringify(c)).toBe(avant);
        });
    });

    it('N.g la marque des noms est la sienne, posée au geste (`marquerNomsAttendus`) sur un critère algorithmique seulement', () => {
        const e = E();
        const ca = chargerScript('js/codes-annotation.js', { db: { getSync: () => null } }).codesAnnotation;
        expect(e.MARQUE_NOMS).toBe('nomsAttendus');
        expect(e.MARQUE_NOMS).not.toBe(ca.MARQUE);
        expect(e.marquerNomsAttendus(critere({}))).toHaveProperty('nomsAttendus', true);
        expect(e.marquerNomsAttendus({ type: 'holistique' })).not.toHaveProperty('nomsAttendus');
    });
});

/* ======================================================= S — L'INVARIANT DU STOCK */

// MESURÉ sur `5bd643c3` (ses modules, chargés tels quels, le 22 oct. 2026 à 17 h 20). La parenthèse est
// la seule différence permise : la décision de 17 h la change pour TOUS les critères.
const ANCIEN = {
    generique: {
        '0/400/': 'Ta production contient 0 erreur pour 400 mots.',
        '1/400/': 'Ta production contient 1 erreur pour 400 mots.',
        '2/400/': 'Ta production contient 2 erreurs pour 400 mots.',
        '7/400/5': 'Ta production contient 7 erreurs (5 une fois pondérées) pour 400 mots.',
        '12/500/': 'Ta production contient 12 erreurs pour 500 mots.',
        '5/400/3.5': 'Ta production contient 5 erreurs (3,5 une fois pondérées) pour 400 mots.',
        '2/2/1.5': 'Ta production contient 2 erreurs (1,5 une fois pondérée) pour 2 mots.',
        aucune: 'Aucun tampon ni erreur annotés.',
        priorite: 'Unités et chiffres significatifs est à travailler en priorité',
        concentre: 'Concentre-toi sur Unités et chiffres significatifs'
    },
    francais: {
        '0/400/': 'Ta rédaction contient 0 erreur de français pour 400 mots.',
        '7/400/5': 'Ta rédaction contient 7 erreurs de français (5 une fois pondérées) pour 400 mots.',
        '12/500/': 'Ta rédaction contient 12 erreurs de français pour 500 mots.',
        aucune: 'Aucun tampon ni erreur de français annotés.'
    },
    pdf: {
        '0/400/': '0 erreur sur 400 mots &rarr; 20,00/20 (100,0 %)',
        '1/400/': '1 erreur sur 400 mots &rarr; 19,50/20 (97,5 %)',
        '2/400/': '2 erreurs sur 400 mots &rarr; 19,00/20 (95,0 %)',
        '7/400/5': '7 erreurs (5 une fois pondérées) sur 400 mots &rarr; 13,75/20 (68,8 %)',
        '12/500/': '12 erreurs sur 500 mots &rarr; 8,00/20 (40,0 %)',
        '5/400/3.5': '5 erreurs (3,5 une fois pondérées) sur 400 mots &rarr; 16,50/20 (82,5 %)'
    }
};
const NOTES = { '0/400/': [20, 100], '1/400/': [19.5, 97.5], '2/400/': [19, 95], '7/400/5': [13.75, 68.75], '12/500/': [8, 40], '5/400/3.5': [16.5, 82.5] };
/** La seule différence permise : la parenthèse d'hier devient celle de 17 h. */
const parentheseDuJour = (s) => s.replace(/ une fois pondérées?\)/g, ' après pondération)');
const cas = (k) => { const [e, m, p] = k.split('/'); return { erreurs: Number(e), mots: Number(m), pondere: p === '' ? null : Number(p) }; };

/** La ligne du PDF, par le vrai rendu (`ligneCalculAlgo`) ; `noms` : ceux que le PDF lit du critère. */
function lignePdf(algo) {
    const win = { enoncesAlgo: E() };
    chargerScript('js/synthese-retroaction-rendu.js', { echapperHtml: echapper }, win);
    const html = win.syntheseRetroactionRendu.rendreSyntheseHTML({
        course: {}, artefact: { title: 'Copie fictive', corrected: '2026-10-22' }, student: { da: '1' },
        scale: [{ code: 'M', label: 'Maîtrisé', color: '#1565c0' }], overall: { code: 'M', label: 'Maîtrisé', color: '#1565c0' },
        trajectory: [], errors: [], tokens: [], objectives: [],
        criteria: [{ name: 'Critère fictif', code: 'M', weight: 20, comment: '', algo: Object.assign({ ponderation: 20, sommePonderee: null }, algo) }]
    });
    return { html, ligne: (html.match(/<div style="font-family:[^"]*; font-size: 9px; color:[^"]*; margin-bottom: 3px;">(.*?)<\/div>/) || ['', ''])[1].replace(/<\/?b[^>]*>/g, '') };
}

describe('noms · S — l’invariant du stock : un critère sans noms rend ce que rendait 5bd643c3, sauf la parenthèse', () => {
    it('S.a le décompte du modèle Générique, « Aucune annotation », le défi et le « concentre-toi »', () => {
        const e = E();
        Object.entries(ANCIEN.generique).forEach(([k, attendu]) => {
            const rendu = k.includes('/')
                ? (() => { const c = cas(k); return e.enonce(STOCK, 'decompte', { erreurs: c.erreurs, mots: c.mots, points: c.pondere === null ? '' : e.mentionPonderee(c.erreurs, c.pondere) }); })()
                : e.enonce(STOCK, k, {});
            expect(rendu, k).toBe(parentheseDuJour(attendu));
        });
    });

    it('S.b le modèle Français (choisi) garde ses mots, au caractère près', () => {
        const e = E();
        const fr = critere({ nom: 'Français écrit' });
        Object.entries(ANCIEN.francais).forEach(([k, attendu]) => {
            const rendu = k.includes('/')
                ? (() => { const c = cas(k); return e.enonce(fr, 'decompte', { erreurs: c.erreurs, mots: c.mots, points: c.pondere === null ? '' : e.mentionPonderee(c.erreurs, c.pondere) }); })()
                : e.enonce(fr, k, {});
            expect(rendu, k).toBe(parentheseDuJour(attendu));
        });
    });

    it('S.c la ligne du PDF : sans grille (noms absents) comme avec un critère d’avant (`noms` lus)', () => {
        const e = E();
        Object.entries(ANCIEN.pdf).forEach(([k, attendu]) => {
            const c = cas(k);
            const algo = { erreurs: c.erreurs, mots: c.mots, sommePonderee: c.pondere, noteCalculee: NOTES[k][0], pourcentage: NOTES[k][1] };
            expect(lignePdf(algo).ligne, k + ' sans noms').toBe(parentheseDuJour(attendu));
            expect(lignePdf(Object.assign({ noms: e.noms(STOCK) }, algo)).ligne, k + ' critère d’avant').toBe(parentheseDuJour(attendu));
        });
    });

    it('S.d la parenthèse ne s’accorde plus : « (1,5 après pondération) », « (3,5 après pondération) »', () => {
        const e = E();
        expect(e.mentionPonderee(2, 1.5)).toBe(' (1,5 après pondération)');
        expect(e.mentionPonderee(5, 3.5)).toBe(' (3,5 après pondération)');
        expect(e.mentionPonderee(5, 5)).toBe('');
    });
});

describe('noms · S — retouche 1 : un critère né en 1.213 ou 1.214 (la marque des codes, sans celle des noms) est du stock', () => {
    it('S.e il lit « erreur » et « mot », ne manque de rien, et rend les chaînes de 5bd643c3 (sauf la parenthèse)', () => {
        const e = E();
        expect(e.noms(STOCK_1213)).toEqual(REDACTION_NOMS);
        expect(e.nomsManquants(STOCK_1213)).toEqual([]);
        expect(e.estNeuf(STOCK_1213)).toBe(false);
        Object.entries(ANCIEN.generique).forEach(([k, attendu]) => {
            const rendu = k.includes('/')
                ? (() => { const c = cas(k); return e.enonce(STOCK_1213, 'decompte', { erreurs: c.erreurs, mots: c.mots, points: c.pondere === null ? '' : e.mentionPonderee(c.erreurs, c.pondere) }); })()
                : e.enonce(STOCK_1213, k, {});
            expect(rendu, k).toBe(parentheseDuJour(attendu));
        });
        const algo = { erreurs: 7, mots: 400, sommePonderee: 5, noteCalculee: 13.75, pourcentage: 68.75, noms: e.noms(STOCK_1213) };
        expect(lignePdf(algo).ligne).toBe(parentheseDuJour(ANCIEN.pdf['7/400/5']));
    });
});

/* ======================================================= B — LE BILAN (retouche 2) */

// MESURÉ sur `5bd643c3` (`_rendreAlgoA0Bilan`, `_rendreTousMaitrisesBilan`, chargés tels quels, 22 oct., 17 h 55).
// Seul « annotée(s) » part : décision de Grégoire, 22 oct. 2026, 17 h 43.
const ANCIEN_BILAN = {
    a0: '<p>- <strong>Unités et chiffres significatifs est à travailler en priorité</strong> (Unités et chiffres significatifs : 5 erreurs sur 400 mots, Incomplet)</p>',
    a0un: '<p>- <strong>Unités et chiffres significatifs est à travailler en priorité</strong> (Unités et chiffres significatifs : 1 erreur sur 400 mots, Incomplet)</p>',
    tous: '<p>Tous les critères sont maîtrisés. Concentre-toi sur Unités et chiffres significatifs (3 erreurs annotées).</p>',
    tousUn: '<p>Tous les critères sont maîtrisés. Concentre-toi sur Unités et chiffres significatifs (1 erreur annotée).</p>'
};
const sansParticipe = (s) => s.replace(/ annotées?\)/, ')');

/** Le bilan de l'app (evaluation-retroaction.js) : ses deux lignes qui portent les noms. */
function bilan() {
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-retroaction.js', { echapperHtml: echapper, db: { getSync: (k, d) => d },
        document: { addEventListener() {}, getElementById: () => null } }, win);
    return win.bilanAlgoNoms;
}

describe('noms · B — le bilan : le critère effondré et « Tous les critères sont maîtrisés »', () => {
    it('B.a sans noms (d’avant, ou né en 1.213) : les phrases de 5bd643c3, le participe en moins', () => {
        const b = bilan();
        [STOCK, STOCK_1213].forEach((c) => {
            expect(b.rendreAlgoA0({ critere: c, critereNom: c.nom, erreurs: 5, mots: 400 })).toBe(ANCIEN_BILAN.a0);
            expect(b.rendreAlgoA0({ critere: c, critereNom: c.nom, erreurs: 1, mots: 400 })).toBe(ANCIEN_BILAN.a0un);
            expect(b.rendreTousMaitrises(3, null, c)).toBe(sansParticipe(ANCIEN_BILAN.tous));
            expect(b.rendreTousMaitrises(1, null, c)).toBe(sansParticipe(ANCIEN_BILAN.tousUn));
        });
    });

    [['rédaction', REDACTION, 'erreur', 'erreurs', 'mot', 'mots'], ['chimie', CHIMIE, 'unité manquante', 'unités manquantes', 'calcul', 'calculs']]
        .forEach(([nom, c, s1, p1, s2, p2]) => {
            it(`B.b ${nom} : les deux noms, accordés par la règle unique`, () => {
                const b = bilan();
                expect(b.rendreAlgoA0({ critere: c, critereNom: c.nom, erreurs: 5, mots: 12 })).toContain(`(${c.nom} : 5 ${p1} sur 12 ${p2}, Incomplet)`);
                expect(b.rendreAlgoA0({ critere: c, critereNom: c.nom, erreurs: 1, mots: 1 })).toContain(`: 1 ${s1} sur 1 ${s2}, Incomplet)`);
                expect(b.rendreTousMaitrises(3, null, c)).toMatch(new RegExp(`\\(3 ${p1}\\)\\.</p>$`));
                expect(b.rendreTousMaitrises(1, null, c)).toMatch(new RegExp(`\\(1 ${s1}\\)\\.</p>$`));
                expect(E().nombreEtNom(3, c)).toBe(`3 ${p1}`);
            });
        });

    it('B.c le PDF de synthèse dit les mêmes mots : même fonction (`nombreEtNom`), sans participe', () => {
        const src = readFileSync(path.join(racine, 'js/synthese-retroaction-data.js'), 'utf8');
        const ligne = src.split('\n').find((l) => l.includes('messageGlobal = `Tous les critères sont maîtrisés.'));
        expect(ligne).toContain('(${window.enoncesAlgo.nombreEtNom(totErr, critereAlgo)}).');
        expect(ligne).not.toMatch(/annot/);
        const app = readFileSync(path.join(racine, 'js/evaluation-retroaction.js'), 'utf8');
        expect(app).toContain("ech(window.enoncesAlgo.nombreEtNom(totalErreursFr, critereAlgo))");
    });

    it('B.d un nom piégé reste du texte dans le bilan', () => {
        const b = bilan();
        const c = critere({ nomsAttendus: true, noms: NOMS_PIEGES });
        [b.rendreAlgoA0({ critere: c, critereNom: c.nom, erreurs: 5, mots: 12 }), b.rendreTousMaitrises(3, null, c)].forEach((h) => {
            expect(h).not.toContain(PIEGE);
            expect(h).toContain('&lt;img src=x onerror=alert(1)&gt;');
        });
    });
});

/* ======================================================= montages */

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const K = 'a2032_grillesTemplates';
const HTML = `<!doctype html><html><body>
    <div id="accueilGrilles"></div><div id="conteneurEditionGrille" class="u-hide">
        <input id="nomGrilleTemplate"><textarea id="descriptionGrille"></textarea>
        <select id="typeGrille"></select><p id="precisionTypeGrille"></p><span id="totalPonderationAffichage"></span>
        <div id="panneauMetadonneesGrille"></div><div id="listeCriteres"></div><div id="vueGrillesCriteres"></div>
    </div><div id="listeCriteresGrille1"></div></body></html>`;

/** L'éditeur de grille, sur les vrais registres (patron du banc de l'étape 0). */
function monter(grilles = []) {
    const dom = new JSDOM(HTML);
    const document = dom.window.document;
    const store = { [K]: JSON.parse(JSON.stringify(grilles)) };
    let n = 0;
    const db = {
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const r = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (r === undefined) return undefined;
            store[k] = r;
            return r;
        }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml, addEventListener() {}, removeEventListener() {} };
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    win.raisonPourTemoin = (r) => r;
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    chargerScript('js/evaluation-formules.js', {}, win);
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-projection.js', {}, win);
    chargerScript('js/codes-annotation.js', { db }, win);
    chargerScript('js/miroir-algo.js', {}, win);
    chargerScript('js/note-pourcentage.js', {}, win);
    chargerScript('js/atelier-algo.js', { document }, win);   // #1150 : l'atelier rend le gabarit et remplit « Ce que l'élève lira »
    win.uiDialogues = { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true };
    chargerScript('js/grilles.js', {
        db, cle: (k) => 'a2032_' + k, document, echapperHtml, alert() {}, confirm: () => true,
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    }, win);
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    const liste = () => document.getElementById('listeCriteres');
    return { win, document, store, liste };
}

/** Une grille enregistrée, rendue dans l'éditeur. */
function editeur(c) {
    const G = { id: 'G1', nom: 'Grille fictive', criteres: [JSON.parse(JSON.stringify(c))] };
    const m = monter([G]);
    m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
    return m;
}

/** L'évaluation (`afficherCriteresDepuisGrille`) rendue pour une grille d'un critère. */
function evaluation(c) {
    const dom = new JSDOM(HTML);
    const document = dom.window.document;
    const G = { id: 'G1', nom: 'Grille fictive', criteres: [JSON.parse(JSON.stringify(c))] };
    const store = { a2032_grillesTemplates: [G] };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d), get: async () => null, setSync() {}, set: async () => {} };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-chargement.js', { db, document, cle: (k) => 'a2032_' + k, echapperHtml: vraiEchapperHtml(document),
        evaluationEnCours: null, notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} } }, win);
    win.afficherCriteresDepuisGrille('G1', 'E_absente');
    return { html: document.getElementById('listeCriteresGrille1').innerHTML, document, win };
}

/** Annoter (travaux-outils.js), copie ouverte sous `grille`. */
function annoter(grille) {
    const ecoutes = {};
    const win = { addEventListener: (n, f) => { (ecoutes[n] = ecoutes[n] || []).push(f); }, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/codes-annotation.js', { db: { getSync: () => null } }, win);
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ innerHTML: '', style: {}, classList: { add() {}, remove() {} }, addEventListener() {}, remove() {} }),
        body: { appendChild() {} }, addEventListener() {} };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    chargerScript('js/travaux-outils.js', { db: { ready: false, getSync: () => null, setSync() {} }, Image: ImageStub, document, echapperHtml: echapper,
        travauxAnnotation: { getAnnotationCourante: () => null } }, win);
    win.codesAnnotation.grilleDeCopie = () => (grille ? JSON.parse(JSON.stringify(grille)) : null);
    (ecoutes['travaux-fichier-ouvert'] || []).forEach((f) => f({ detail: { fichier: { id: 'F1' } } }));
    return win;
}

const plat = (s) => String(s).replace(/\s+/g, ' ').trim();
const SC = [{ id: 'SC1', code: '1', nom: 'Unité manquante', ponderation: 1.5, retroaction: '' }, { id: 'SC2', code: '2', nom: 'Arrondi', ponderation: 0.5, retroaction: '' }];

/* ======================================================= D — DEUX DISCIPLINES, CHAQUE SURFACE */

describe('noms · D — une rédaction et une discipline sans texte, sur chaque surface', () => {
    const DISCIPLINES = [
        { nom: 'rédaction', c: REDACTION, s: 'erreur', p: 'erreurs', ms: 'mot', mp: 'mots', champE: 'Erreurs', champM: 'Mots' },
        { nom: 'chimie', c: CHIMIE, s: 'unité manquante', p: 'unités manquantes', ms: 'calcul', mp: 'calculs', champE: 'Unités manquantes', champM: 'Calculs' }
    ];

    DISCIPLINES.forEach((d) => {
        it(`D.a ${d.nom} : le décompte du modèle Générique et « Aucune annotation »`, () => {
            const e = E();
            expect(e.enonce(d.c, 'decompte', { erreurs: 5, mots: 12, points: e.mentionPonderee(5, 3.5) }))
                .toBe(`Ta production contient 5 ${d.p} (3,5 après pondération) pour 12 ${d.mp}.`);
            expect(e.enonce(d.c, 'decompte', { erreurs: 1, mots: 1 })).toBe(`Ta production contient 1 ${d.s} pour 1 ${d.ms}.`);
            expect(e.enonce(d.c, 'aucune', {})).toBe(`Aucun tampon ni ${d.s} annotés.`);
        });

        it(`D.b ${d.nom} : la ligne du PDF`, () => {
            const r = lignePdf({ erreurs: 5, mots: 12, sommePonderee: 5.5, noteCalculee: 14.5, pourcentage: 72.5, noms: E().noms(d.c) });
            expect(r.ligne).toBe(`5 ${d.p} (5,5 après pondération) sur 12 ${d.mp} &rarr; 14,50/20 (72,5 %)`);
        });

        it(`D.c ${d.nom} : les champs de l’évaluation et leur ligne de résultat (mode simple)`, () => {
            const { document } = evaluation(Object.assign({}, d.c));
            const etiquettes = [...document.querySelectorAll('.eval-grille-algo .eval-label')].map((x) => plat(x.textContent));
            expect(etiquettes).toEqual([d.champE, d.champM]);
            expect(plat(document.querySelector('.eval-resultat-algo').textContent)).toMatch(new RegExp(`^-- ${d.p} sur -- ${d.mp} → `));
        });

        // ↻ #1150 (24 oct. 2026) : le miroir est devenu « Ce que l'élève lira », la copie fictive réglable de
        // l'atelier — « Quelques » au départ, sur l'étendue du miroir (900 : la longueur de la projection).
        it(`D.d ${d.nom} : le gabarit — l’aide sous la formule, « Ce que l’élève lira », la copie fictive d’un palier`, () => {
            const c = Object.assign({}, d.c, { sousCriteres: SC, modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
                modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900 } });
            const liste = editeur(c).liste();
            const t = plat(liste.textContent);
            expect(t).toContain(`Lors de l'évaluation, « ${d.champE} » se remplit avec les codes que tu poses dans Annoter, ou se tape ; « ${d.champM} » se tape.`);
            const apercu = liste.querySelector('.apercu-algo');
            expect(apercu.querySelector('[data-apercu-champ="mots"]').value).toBe('900');
            expect(plat(apercu.querySelector('[data-apercu-nom="mots"]').textContent)).toBe(d.mp);
            expect(plat(apercu.querySelector('[data-lecture="pdf"]').textContent)).toMatch(new RegExp(`Ta production contient \\d+ (${d.s}|${d.p}) pour 900 ${d.mp}\\.`));
            expect(t).toMatch(new RegExp(`— copie fictive, \\d+ (${d.s}|${d.p}) pour 900 ${d.mp}`));   // un palier
            // Ce que l'aperçu dit de la copie ne garde aucun mot de la rédaction. (Hors du lot : la formule,
            // « Erreurs pondérées ÷ Mots », attend l'étape 4 ; les textes de la projection EUF, l'étape 3.)
            if (d.nom === 'chimie') {
                const donnees = [...liste.querySelectorAll('[data-apercu-nom], .apercu-algo-codes, .apercu-algo-etendue, .palier-apercu-copie')].map((x) => x.textContent).join(' ');
                expect(donnees.toLowerCase()).not.toMatch(/\berreurs?\b|\bmots?\b/);
            }
        });

        it(`D.e ${d.nom} : le total d’Annoter`, () => {
            const win = annoter({ id: 'G1', nom: 'Grille fictive', criteres: [d.c] });
            expect(win.travauxOutils.totalCodesEnMots(1)).toBe(`1 ${d.s}`);
            expect(win.travauxOutils.totalCodesEnMots(3)).toBe(`3 ${d.p}`);
        });
    });

    it('D.f sans grille, le total d’Annoter et le miroir disent « erreur » : ce qu’ils disaient', () => {
        expect(annoter(null).travauxOutils.totalCodesEnMots(3)).toBe('3 erreurs');
        const { win } = monter();
        expect(win.miroirAlgo.libelles(STOCK).occurrences(1)).toBe('1 erreur');
    });
});

/* ======================================================= E — L'ÉDITEUR */

describe('noms · E — l’éditeur de grille', () => {
    const champs = (liste) => [...liste.querySelectorAll('input[data-nom-paire]')];

    it('E.a un critère neuf : quatre champs vides, l’exemple grisé d’une discipline sans texte, l’invitation', () => {
        const { liste } = editeur(NEUF_SANS_NOMS);
        expect(champs(liste().querySelector('.noms-algo')).map((x) => [x.value, x.placeholder])).toEqual([
            ['', 'Ex. : unité manquante'], ['', 'Ex. : unités manquantes'], ['', 'Ex. : calcul'], ['', 'Ex. : calculs']]);
        expect(liste().querySelector('.noms-algo-invitation')).not.toBeNull();
        expect(liste().querySelectorAll('.noms-algo-rangee--manque')).toHaveLength(2);
    });

    it('E.b un critère d’avant : les champs montrent ce qu’il lit, pas d’invitation, et le rendu n’écrit rien', () => {
        const m = editeur(STOCK);
        const avant = JSON.stringify(m.store[K]);
        expect(champs(m.liste()).map((x) => x.value)).toEqual(['erreur', 'erreurs', 'mot', 'mots']);
        expect(m.liste().querySelector('.noms-algo-invitation')).toBeNull();
        m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(m.store[K][0])));
        expect(JSON.stringify(m.store[K])).toBe(avant);
    });

    it('E.b2 un critère né en 1.213 (marque des codes seule) : comme le stock, ses noms lus, pas d’invitation', () => {
        const m = editeur(STOCK_1213);
        expect(champs(m.liste()).map((x) => x.value)).toEqual(['erreur', 'erreurs', 'mot', 'mots']);
        expect(m.liste().querySelector('.noms-algo-invitation')).toBeNull();
    });

    it('E.c le geste sur un champ écrit les quatre formes affichées ; un critère d’avant reçoit « erreur / erreurs » à côté', async () => {
        const m = editeur(STOCK);
        const x = champs(m.liste()).find((i) => i.dataset.nomPaire === 'mots' && i.dataset.nomForme === 'pluriel');
        champs(m.liste())[2].value = 'calcul';
        x.value = 'calculs';
        await m.win.modifierNomsCritereAlgoHandler(x);
        expect(m.store[K][0].criteres[0].noms).toEqual({ erreurs: REDACTION_NOMS.erreurs, mots: CHIMIE_NOMS.mots });
    });

    it('E.d une forme trop longue est refusée : rien n’est écrit, le champ le dit', async () => {
        const m = editeur(CHIMIE);
        const x = champs(m.liste())[0];
        x.value = 'x'.repeat(41);
        await m.win.modifierNomsCritereAlgoHandler(x);
        expect(m.store[K][0].criteres[0].noms).toEqual(CHIMIE_NOMS);
        expect(x.classList.contains('champ-refuse')).toBe(true);
    });

    it('E.e « Partir de la liste du français écrit » pose « erreur » et « mot » ; des noms déjà écrits restent', async () => {
        const m = editeur(NEUF_SANS_NOMS);
        await m.win.initialiserSousCriteresParDefaut('G1', 0);
        expect(m.store[K][0].criteres[0].noms).toEqual(REDACTION_NOMS);
        const m2 = editeur(critere({ nomsAttendus: true, noms: { erreurs: CHIMIE_NOMS.erreurs } }));
        await m2.win.initialiserSousCriteresParDefaut('G1', 0);
        expect(m2.store[K][0].criteres[0].noms).toEqual({ erreurs: CHIMIE_NOMS.erreurs, mots: REDACTION_NOMS.mots });
    });

    it('E.g la naissance : un critère qui devient algorithmique reçoit la marque des noms, au même geste que celle des codes', async () => {
        const m = monter();
        await m.win.creerNouvelleGrille();
        const select = m.liste().querySelector('[data-on-change="modifierTypeCritereTempHandler"]');
        select.value = 'algorithmique';
        m.win.modifierTypeCritereTempHandler(select);
        expect(m.win.tempCriteres[0]).toMatchObject({ type: 'algorithmique', codesSousCriteresSeulement: true, nomsAttendus: true });
        m.win.afficherCriteresTemp();
        expect(m.liste().querySelector('.noms-algo-invitation')).not.toBeNull();
    });

    it('E.f en création (cible `temp`) : le geste écrit sur le critère temporaire, rien en base', async () => {
        const m = monter();
        m.win.tempCriteres = [JSON.parse(JSON.stringify(NEUF_SANS_NOMS))];
        m.win.afficherCriteresTemp();
        const xs = champs(m.liste());
        xs.forEach((x, i) => { x.value = ['unité manquante', 'unités manquantes', 'calcul', 'calculs'][i]; });
        await m.win.modifierNomsCritereAlgoHandler(xs[3]);
        expect(m.win.tempCriteres[0].noms).toEqual(CHIMIE_NOMS);
        expect(m.store[K]).toEqual([]);
        expect(m.liste().querySelector('.noms-algo-invitation')).toBeNull();
    });
});

/* ======================================================= A — ANNOTER */

describe('noms · A — Annoter invite à nommer', () => {
    const grille = (c) => ({ id: 'G1', nom: 'Grille fictive', criteres: [Object.assign({ sousCriteres: SC }, c)] });
    it('A.a un critère neuf sans noms : la palette le dit, et nomme ce que l’élève lit d’ici là', () => {
        const html = annoter(grille(NEUF_SANS_NOMS)).travauxOutils.genererContenuErreursFr();
        expect(html).toContain('Ton critère algorithmique n’a pas encore ses deux noms');
        expect(html).toContain('« élément relevé » et « élément examiné »');
    });
    it('A.b nommé, ou d’avant : rien', () => {
        expect(annoter(grille(CHIMIE)).travauxOutils.genererContenuErreursFr()).not.toContain('deux noms');
        expect(annoter(grille(STOCK_1213)).travauxOutils.genererContenuErreursFr()).not.toContain('deux noms');
        expect(annoter(grille(STOCK)).travauxOutils.genererContenuErreursFr()).not.toContain('deux noms');
    });
});

/* ======================================================= X — UN NOM PIÉGÉ */

describe('noms · X — un nom piégé reste du texte', () => {
    const c = critere({ nomsAttendus: true, noms: NOMS_PIEGES, sousCriteres: SC,
        modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 } });

    it('X.a l’éditeur (champs, aide, miroir) : aucune balise, le texte échappé', () => {
        const liste = editeur(c).liste();
        expect(liste.querySelectorAll('img[onerror], img[src="x"]').length).toBe(0);
        expect(liste.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(champs0(liste)).toBe(PIEGE);
    });
    const champs0 = (liste) => liste.querySelector('input[data-nom-paire]').value;

    it('X.b l’évaluation : aucune balise', () => {
        const { document, html } = evaluation(c);
        expect(document.querySelectorAll('#listeCriteresGrille1 img[onerror], #listeCriteresGrille1 img[src="x"]').length).toBe(0);
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('X.c le PDF : aucune balise', () => {
        const r = lignePdf({ erreurs: 3, mots: 12, noteCalculee: 10, pourcentage: 50, noms: E().noms(c) });
        expect(r.html).not.toContain(PIEGE);
        expect(r.ligne).toContain('3 &lt;img src=x onerror=alert(1)&gt; sur 12 &lt;img');
    });

    it('X.d l’import retire la balise et borne la chaîne', () => {
        const ie = chargerScript('js/import-export.js');
        const importee = ie.assainirObjet({ id: 'G', nom: 'G', criteres: [c] }, ie.SCHEMAS_IMPORT.grille);
        expect(importee.criteres[0].noms.erreurs.singulier).toBe('');
        const long = critere({ noms: { erreurs: { singulier: 'x'.repeat(60), pluriel: 'y' } } });
        expect(ie.assainirObjet({ id: 'G', nom: 'G', criteres: [long] }, ie.SCHEMAS_IMPORT.grille).criteres[0].noms.erreurs.singulier).toHaveLength(40);
    });
});

/* ======================================================= V — LE VOYAGE */

describe('noms · V — l’export et le partage gardent les noms', () => {
    const G = (c) => ({ id: 'G_V', nom: 'Laboratoire fictif', criteres: [c],
        metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] } });

    function partager(g) {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        chargerScript('js/partage-import.js', { db: dbP }, wp);
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        const verdict = wp.partageValidation.validerPackage(JSON.parse(JSON.stringify(paquet)));
        expect(verdict.erreurs).toEqual([]);
        return wp.partageImport.prefixerEntites(verdict.packageNettoye, 'IMP_banc').parType.grille[0];
    }

    it('V.a le partage : les noms à l’arrivée ; sans noms, sans noms', () => {
        expect(partager(G(CHIMIE)).criteres[0].noms).toEqual(CHIMIE_NOMS);
        expect(partager(G(STOCK)).criteres[0]).not.toHaveProperty('noms');
    });

    it('V.b l’import d’un fichier : les noms à l’arrivée ; sans noms, sans noms', () => {
        const ie = chargerScript('js/import-export.js');
        expect(ie.assainirObjet(JSON.parse(JSON.stringify(G(CHIMIE))), ie.SCHEMAS_IMPORT.grille).criteres[0].noms).toEqual(CHIMIE_NOMS);
        expect(ie.assainirObjet(JSON.parse(JSON.stringify(G(STOCK))), ie.SCHEMAS_IMPORT.grille).criteres[0]).not.toHaveProperty('noms');
    });

    it('V.c le partage refuse un champ inconnu sous les noms (schéma fermé)', () => {
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        const p = wp.partageFormat.construirePackage(G(CHIMIE), { type: 'grille', identiteAuteur: 'Auteur fictif' });
        p.entites.grilles[0].criteres[0].noms.erreurs.genre = 'féminin';
        expect(wp.partageValidation.validerPackage(p).valide).toBe(false);
    });
});
