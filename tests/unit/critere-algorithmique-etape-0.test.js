/**
 * LE CRITÈRE ALGORITHMIQUE, ÉTAPE 0 (21 oct. 2026) — un critère neuf ne parle plus français d'office,
 * la ligne du PDF s'écrit en français correct.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-21-critere-algorithmique-etape-0.md ; plan :
 * PLAN-2026-10-21-critere-algorithmique-toute-discipline.md (le garde-fou : deux disciplines fictives,
 * dont une sans texte).
 *
 * Ce que ce banc verrouille :
 *   N — LA NAISSANCE : un critère qui devient algorithmique (création, changement de type) porte la marque ;
 *       un critère qui portait déjà un modèle de projection (le stock) ne la reçoit pas.
 *   C — LES CODES : un critère marqué sans sous-critère n'a aucun code (pas le repli) ; avec deux
 *       sous-critères, leurs deux codes ; un critère existant sans la marque rend le repli, identique à hier.
 *   D — DEUX DISCIPLINES : « Français écrit » et « Unités et chiffres significatifs » (chimie), nés dans le
 *       lot ; pour la chimie, ni la palette d'Annoter, ni le gabarit (hors des choix offerts), ni la ligne du
 *       PDF ne disent « français ».
 *   P — LA LIGNE DU PDF : « 0 erreur », « 1 erreur », « 2 erreurs » ; « 13,75/20 (68,8 %) ».
 *
 * Break-tests (faits le 21 oct.) : voir la demande de relecture. Grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
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

const K = 'a2032_grillesTemplates';
const cle = (k) => 'a2032_' + k;
const HTML = `<!doctype html><html><body>
    <div id="accueilGrilles"></div><div id="conteneurEditionGrille" class="u-hide">
        <input id="nomGrilleTemplate"><textarea id="descriptionGrille"></textarea>
        <select id="typeGrille"></select><p id="precisionTypeGrille"></p><span id="totalPonderationAffichage"></span>
        <div id="panneauMetadonneesGrille"></div><div id="listeCriteres"></div><div id="vueGrillesCriteres"></div>
    </div></body></html>`;

/** Grilles de critères, sur les vrais registres (codes, phrases, projection, formules). */
function monter(grilles = []) {
    const dom = new JSDOM(HTML);
    const document = dom.window.document;
    const store = { [K]: grilles };
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
    chargerScript('js/temoin-enregistrement.js', { document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    chargerScript('js/evaluation-formules.js', {}, win);
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-projection.js', {}, win);
    chargerScript('js/codes-annotation.js', { db }, win);
    chargerScript('js/atelier-algo.js', { document }, win);   // #1150 : l'atelier du critère, qui rend le gabarit
    win.uiDialogues = { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true };
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, alert() {}, confirm: () => true,
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    }, win);
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, document, store, carte: (i) => document.querySelectorAll('#listeCriteres .item-liste')[i] };
}

/** « + Nouvelle grille », un critère algorithmique nommé, créé ; rend la grille enregistrée. */
async function creerGrilleAlgo(nomCritere) {
    const m = monter();
    await m.win.creerNouvelleGrille();
    m.document.getElementById('nomGrilleTemplate').value = 'Grille fictive · ' + nomCritere;
    const select = m.carte(0).querySelector('[data-on-change="modifierTypeCritereTempHandler"]');
    select.value = 'algorithmique';
    m.win.modifierTypeCritereTempHandler(select);
    m.win.modifierCritereTemp(0, 'nom', nomCritere);
    m.win.afficherCriteresTemp();
    return m;
}

const sc = (code, nom, ponderation = 1) => ({ id: 'SC_' + code, code: String(code), nom, ponderation, retroaction: '' });

/* ======================================================= N — LA NAISSANCE */

describe('étape 0 · N — un critère qui devient algorithmique naît marqué', () => {
    it('N.a en création : le critère algorithmique porte la marque, et la grille créée la garde', async () => {
        const m = await creerGrilleAlgo('Unités et chiffres significatifs');
        expect(m.win.tempCriteres[0].codesSousCriteresSeulement).toBe(true);
        await m.win.sauvegarderGrilleTemplate(true);
        expect(m.store[K][0].criteres[0]).toMatchObject({ type: 'algorithmique', codesSousCriteresSeulement: true });
        expect(m.store[K][0].criteres[0]).not.toHaveProperty('codesDepuisSousCriteres');
    });

    it('N.b un critère holistique d’une grille enregistrée qui devient algorithmique : marqué', async () => {
        const m = monter([{ id: 'G1', nom: 'Grille fictive', criteres: [{ id: 'C1', nom: 'Rigueur', type: 'holistique', ponderation: 20 }] }]);
        await m.win.modifierCritereGrille('G1', 0, 'type', 'algorithmique');
        expect(m.store[K][0].criteres[0].codesSousCriteresSeulement).toBe(true);
    });

    it('N.c le stock : un critère algorithmique qui porte déjà son modèle de projection ne reçoit pas la marque', async () => {
        const existant = { id: 'C1', nom: 'Français écrit', type: 'algorithmique', ponderation: 20, modeleProjection: 'aucune', paramsProjection: {} };
        const m = monter([{ id: 'G1', nom: 'Grille fictive', criteres: [existant] }]);
        await m.win.modifierCritereGrille('G1', 0, 'type', 'algorithmique');
        await m.win.modifierCritereGrille('G1', 0, 'nom', 'Français écrit (A26)');
        expect(m.store[K][0].criteres[0]).not.toHaveProperty('codesSousCriteresSeulement');
    });
});

/* ======================================================= C — LES CODES */

describe('étape 0 · C — les codes d’un critère marqué sont ses sous-critères, et seulement eux', () => {
    const A = () => monter().win.codesAnnotation;
    const grille = (critere) => ({ id: 'G', nom: 'Grille fictive', criteres: [Object.assign({ id: 'C', nom: 'Critère fictif', type: 'algorithmique', ponderation: 20 }, critere)] });

    it('C.a marqué, sans sous-critère : aucun code — pas le repli', () => {
        expect(A().listeCodes(grille({ codesSousCriteresSeulement: true }))).toEqual([]);
        expect(A().estActive(grille({ codesSousCriteresSeulement: true }))).toBe(true);
    });

    it('C.b marqué, deux sous-critères : leurs deux codes, sans le geste d’activation', () => {
        const codes = A().listeCodes(grille({ codesSousCriteresSeulement: true, sousCriteres: [sc(1, 'Unité absente'), sc(2, 'Chiffres significatifs', 0.5)] }));
        expect(codes.map((c) => [c.id, c.nom, c.poids, c.source])).toEqual([['errfr_1', 'Unité absente', 1, 'grille'], ['errfr_2', 'Chiffres significatifs', 0.5, 'grille']]);
    });

    it('C.c le stock : un critère existant sans la marque rend le repli, identique à hier à l’octet près', () => {
        const a = A();
        const repli = JSON.stringify(a.listeCodes(null));
        expect(JSON.stringify(a.listeCodes(grille({})))).toBe(repli);
        // Le drapeau sur une liste vide retombe, comme hier, sur le repli.
        expect(JSON.stringify(a.listeCodes(grille({ codesDepuisSousCriteres: true, sousCriteres: [] })))).toBe(repli);
        expect(a.listeCodes(grille({})).map((c) => c.nom)).toEqual(a.REPLI_DEFAUT.map((t) => t.nom));
    });
});

/* ======================================================= V — LA MARQUE VOYAGE */

describe('étape 0 · V — la marque voyage : import et partage', () => {
    const grille = () => ({ id: 'G_V', nom: 'Laboratoire fictif', criteres: [{ id: 'C_V', nom: 'Unités et chiffres significatifs', type: 'algorithmique',
        ponderation: 20, codesSousCriteresSeulement: true, sousCriteres: [sc(1, 'Unité absente')] }] });

    it('V.a l’IMPORT garde la marque (schéma fermé `SCHEMAS_IMPORT`)', () => {
        const ie = chargerScript('js/import-export.js');
        expect(ie.assainirObjet(grille(), ie.SCHEMAS_IMPORT.grille).criteres[0].codesSousCriteresSeulement).toBe(true);
    });

    it('V.b le PARTAGE garde la marque (schéma fermé `SCHEMA_ENTITE`)', () => {
        const db = { getSync: () => null };
        const w = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, w);
        chargerScript('js/partage-format.js', { db }, w);
        expect(w.partageFormat.projeterEntite(grille(), 'grille').criteres[0].codesSousCriteresSeulement).toBe(true);
    });
});

/* ======================================================= D — DEUX DISCIPLINES */

describe('étape 0 · D — deux disciplines fictives, dont une sans texte', () => {
    /**
     * Le gabarit, sans les choix offerts (boutons, options de menus) : ce qu'il DIT du critère.
     * (La limite nommée de l'étape 0, la description de « Pénalité normalisée », est levée : le lot de
     * mots, F1, en a retiré la phrase.)
     * 22 oct. 2026 (consigne du miroir, point 7) : la phrase d'un critère sans sous-critère nomme le même
     * choix que le bouton — « pars de la liste du français écrit ». Ce NOM d'une liste offerte est retiré
     * comme le bouton ; tout autre « français » reste rouge.
     */
    const ceQueDitLeGabarit = (carte) => {
        const copie = carte.cloneNode(true);
        copie.querySelectorAll('button, option').forEach((x) => x.remove());
        return copie.textContent.split('la liste du français écrit').join('la liste offerte');
    };

    for (const nom of ['Français écrit', 'Unités et chiffres significatifs']) {
        it(`D « ${nom} » : né sans code ; le gabarit offre la liste du français écrit sans la poser`, async () => {
            const m = await creerGrilleAlgo(nom);
            const carte = m.carte(0);
            expect(m.win.codesAnnotation.listeCodes({ criteres: m.win.tempCriteres })).toEqual([]);
            expect(carte.querySelector('[data-action="initialiserSousCriteresParDefaut"]').textContent.trim()).toBe('Partir de la liste du français écrit (codes 1 à 10)');
            expect(carte.querySelector('[data-on-change="modifierCodesDepuisSousCriteresHandler"]'), 'pas de case : aucun repli à choisir').toBeNull();
            if (nom !== 'Français écrit') {
                const t = ceQueDitLeGabarit(carte).replace(/\s+/g, ' ');
                const i = t.toLowerCase().indexOf('français');
                expect(i, i >= 0 ? t.slice(Math.max(0, i - 160), i + 80) : '').toBe(-1);
            }
        });
    }

    it('D.c la liste du français, choisie : ses dix sous-critères, leurs dix codes', async () => {
        const m = await creerGrilleAlgo('Français écrit');
        await m.win.initialiserSousCriteresParDefaut('temp', 0);
        expect(m.win.tempCriteres[0].sousCriteres.map((s) => s.code)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
        expect(m.win.codesAnnotation.listeCodes({ criteres: m.win.tempCriteres }).map((c) => c.id))
            .toEqual(['errfr_1', 'errfr_2', 'errfr_3', 'errfr_4', 'errfr_5', 'errfr_6', 'errfr_7', 'errfr_8', 'errfr_9', 'errfr_10']);
    });
});

/* ======================================================= P — LA LIGNE DU PDF */

describe('étape 0 · P — la ligne du PDF, en français correct', () => {
    const echapperHtml = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    function ligne(algo, comment) {
        const win = { enoncesAlgo: chargerScript('js/evaluation-enonces.js').enoncesAlgo };
        chargerScript('js/synthese-retroaction-rendu.js', { echapperHtml }, win);
        const html = win.syntheseRetroactionRendu.rendreSyntheseHTML({
            course: {}, artefact: { title: 'Copie fictive', corrected: '2026-10-21' }, student: { da: '1' },
            scale: [{ code: 'M', label: 'Maîtrisé', color: '#1565c0' }], overall: { code: 'M', label: 'Maîtrisé', color: '#1565c0' },
            trajectory: [], errors: [], tokens: [], objectives: [],
            criteria: [{ name: 'Critère fictif', code: 'M', weight: 20, comment: comment || '', algo: Object.assign({ mots: 400, ponderation: 20, sommePonderee: null }, algo) }]
        });
        return { html, ligne: (html.match(/\d+ erreurs?[^<]*sur \d+ mots &rarr; <b[^>]*>[^<]*<\/b> \([^)]*\)/) || [''])[0].replace(/<[^>]+>/g, '') };
    }

    it('P.a « 0 erreur », « 1 erreur », « 2 erreurs »', () => {
        expect(ligne({ erreurs: 0, noteCalculee: 20, pourcentage: 100 }).ligne).toMatch(/^0 erreur sur 400 mots/);
        expect(ligne({ erreurs: 1, noteCalculee: 19.5, pourcentage: 97.5 }).ligne).toMatch(/^1 erreur sur 400 mots/);
        expect(ligne({ erreurs: 2, noteCalculee: 19, pourcentage: 95 }).ligne).toMatch(/^2 erreurs sur 400 mots/);
    });

    it('P.b la virgule décimale, les décimales d’hier : « 13,75/20 (68,8 %) »', () => {
        expect(ligne({ erreurs: 7, noteCalculee: 13.75, pourcentage: 68.75 }).ligne).toBe('7 erreurs sur 400 mots &rarr; 13,75/20 (68,8\u00A0%)');
        expect(ligne({ erreurs: 7, sommePonderee: 5, noteCalculee: 13.75, pourcentage: 68.75 }).ligne).toBe('7 erreurs (5 après pondération) sur 400 mots &rarr; 13,75/20 (68,8\u00A0%)');
        expect(ligne({ erreurs: 3, noteCalculee: 16.5, pourcentage: 82.5 }).ligne).toBe('3 erreurs sur 400 mots &rarr; 16,50/20 (82,5\u00A0%)');
    });

    it('P.c chimie : ni la ligne, ni la phrase du modèle générique ne disent « français »', () => {
        const generique = chargerScript('js/evaluation-enonces.js').enoncesAlgo;
        const phrase = generique.enonce({ nom: 'Unités et chiffres significatifs', modeleEnonces: 'generique' }, 'decompte', { erreurs: 3, mots: 12, points: '' });
        const { html, ligne: l } = ligne({ erreurs: 3, mots: 12, noteCalculee: 15, pourcentage: 75 }, phrase);
        expect(l).toBe('3 erreurs sur 12 mots &rarr; 15,00/20 (75,0\u00A0%)');
        expect(html.toLowerCase()).not.toContain('français');
    });
});
