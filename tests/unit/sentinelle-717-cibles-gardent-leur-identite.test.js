/**
 * SENTINELLE #717 — lot N5 (23 sept. 2026) : chaque cible de dénotation garde son identité, et ses coches avec elle.
 *
 * Décision de Grégoire (23 sept., 9 h 30, réponse A) : une identité permanente donnée à chaque cible à sa création.
 * Déplacer ou renommer une cible ne touche plus aux coches déjà faites ; une cible retirée emporte ses coches
 * (elles restent dans les données, elles ne sont plus lues) ; la question est posée avant d'écrire.
 *
 * Avant : l'assistant ET la gestion des pratiques nommaient les cibles par leur position (`cible-1`, `cible-2`…) ;
 * retirer la première faisait glisser les coches (59 → 78 sans un mot, constat A-6 de l'audit du 16 sept.).
 *
 * Les écrivains RÉELS sont chargés (wizard-pratique-v2.js, pratiques-gestion.js, denotation-saisie-ui.js, le
 * composant editeur-cibles.js) ; la note est celle du moteur réel (`_calculerPerformanceDenotation`). L'écran du
 * composant (vrais clics, iPad 768 px) est éprouvé par la spec WebKit `sentinelle-717-editeur-cibles.spec.js`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, fauxDocument, dbBanc, echapperHtml } from './_helpers/bac-suivi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const DA1 = '1000001', DA2 = '1000002', DA3 = '1000003';

/** La note du moteur réel, pour la pratique telle qu'elle est ENREGISTRÉE. */
function noteMoteur(store, pratiqueId, da) {
    const win = {};
    const globaux = { db: dbBanc(store, []), cle: (k) => 'test_' + k };
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    const p = store.test_pratiquesConfigurables.find(x => x.id === pratiqueId);
    return new win.PratiqueConfigurable(clone(p))._calculerPerformanceDenotation(da);
}
function jugement(coches, note = 78) { return { ciblesAtteintes: clone(coches), noteFinale: note, justification: 'banc', date: '2026-09-01' }; }

/* ---------------------------------------------------------------------------------------------
   L'assistant réel, sans écran : les réponses sont celles que le composant rend (`{ id, nom }`).
   --------------------------------------------------------------------------------------------- */
function monterAssistant(store) {
    const questions = [];
    const reponsesConfirm = [];
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = {
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
        db: dbBanc(store, []), cle: (k) => 'test_' + k,
        notifications: { erreur() {}, succes() {}, info() {}, warning() {} },
        normaliserIdPratique: (t) => t, genererIdUnique: (p) => p + 'NEUF',
        echapperHtml: (s) => String(s == null ? '' : s),
        confirm: (m) => { questions.push(m); return reponsesConfirm.length ? reponsesConfirm.shift() : true; }
    };
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return { win, store, questions, reponsesConfirm };
}
async function creer(a, cibles) {
    a.win.wizardState.reponses = { nom: 'DEN banc', calcNoteFinale: 'jugement', ciblesDenotation: clone(cibles), methodeSuggestionDen: 'mode' };
    a.win.wizardState.pratiqueId = null;
    a.win.wizardState.modeEdition = false;
    await a.win.creerPratiqueV2();
    return a.store.test_pratiquesConfigurables[a.store.test_pratiquesConfigurables.length - 1].id;
}
/** Rouvre la pratique par l'assistant, applique `geste` aux cibles relues, enregistre. */
async function reediter(a, id, geste = (c) => c) {
    a.win.wizardState.reponses = {};
    a.win.wizardState.pratiqueId = id;
    a.win.wizardState.modeEdition = true;
    a.win.chargerPratiqueExistante(id);
    a.win.wizardState.reponses.ciblesDenotation = geste(clone(a.win.wizardState.reponses.ciblesDenotation));
    a.win.wizardState.pratiqueId = id;
    a.win.wizardState.modeEdition = true;
    await a.win.creerPratiqueV2();
    return a.store.test_pratiquesConfigurables.find(p => p.id === id);
}
const storeVide = () => ({ test_pratiquesConfigurables: [], test_jugementsDenotation: {}, test_echellesTemplates: [], test_grillesTemplates: [] });

describe('#717 · l\'assistant : déplacer, renommer, retirer ne déplace plus les coches', () => {
    // À LA MAIN : deux cibles « Lire » (L) et « Écrire » (É), jugement 78.
    //   les deux cochées → 78. Retirer L : É garde SON id et sa coche → 78.
    //   L cochée, É non → 59 (plafond RREC). Retirer L : É, non cochée, reste non cochée → 59.
    //   (Avant : É devenait `cible-1` et héritait de la coche de L → 78, sans un mot.)
    it('le constat #717 : retirer la première cible — la cible restante garde son id et sa coche', async () => {
        const a = monterAssistant(storeVide());
        const L = a.win.EditeurCibles.nouvelId(), E = a.win.EditeurCibles.nouvelId();
        const id = await creer(a, [{ id: L, nom: 'Lire' }, { id: E, nom: 'Écrire' }]);
        a.store.test_jugementsDenotation = { [id]: { [DA1]: jugement({ [L]: true, [E]: true }), [DA2]: jugement({ [L]: true, [E]: false }) } };
        expect(noteMoteur(a.store, id, DA1)).toBe(78);
        expect(noteMoteur(a.store, id, DA2)).toBe(59);

        const apres = await reediter(a, id, (c) => c.filter(x => x.nom !== 'Lire'));
        expect(apres.configuration.objectifs).toEqual([{ id: E, nom: 'Écrire' }]);
        expect(noteMoteur(a.store, id, DA1)).toBe(78);
        expect(noteMoteur(a.store, id, DA2)).toBe(59);   // avant #717 : 78 (la coche de « Lire » glissait sur « Écrire »)
    });

    it('déplacer : les ids suivent les noms, les coches ne bougent pas', async () => {
        const a = monterAssistant(storeVide());
        const L = a.win.EditeurCibles.nouvelId(), E = a.win.EditeurCibles.nouvelId();
        const id = await creer(a, [{ id: L, nom: 'Lire' }, { id: E, nom: 'Écrire' }]);
        a.store.test_jugementsDenotation = { [id]: { [DA1]: jugement({ [L]: false, [E]: true }) } };
        const coches = clone(a.store.test_jugementsDenotation);
        const apres = await reediter(a, id, (c) => [c[1], c[0]]);
        expect(apres.configuration.objectifs).toEqual([{ id: E, nom: 'Écrire' }, { id: L, nom: 'Lire' }]);
        expect(a.store.test_jugementsDenotation).toEqual(coches);
        expect(noteMoteur(a.store, id, DA1)).toBe(59);   // « Lire » toujours non cochée, où qu'elle soit
        expect(a.questions).toEqual([]);                // rien de retiré : aucune question
    });

    it('renommer : l\'id reste, les coches restent', async () => {
        const a = monterAssistant(storeVide());
        const L = a.win.EditeurCibles.nouvelId(), E = a.win.EditeurCibles.nouvelId();
        const id = await creer(a, [{ id: L, nom: 'Lire' }, { id: E, nom: 'Écrire' }]);
        a.store.test_jugementsDenotation = { [id]: { [DA1]: jugement({ [L]: true, [E]: true }) } };
        const apres = await reediter(a, id, (c) => [Object.assign(c[0], { nom: 'Lire un texte littéraire' }), c[1]]);
        expect(apres.configuration.objectifs).toEqual([{ id: L, nom: 'Lire un texte littéraire' }, { id: E, nom: 'Écrire' }]);
        expect(noteMoteur(a.store, id, DA1)).toBe(78);
    });

    it('retirer une cible cochée : la question nomme la cible et le nombre d\'élèves ; « annuler » n\'écrit rien', async () => {
        const a = monterAssistant(storeVide());
        const L = a.win.EditeurCibles.nouvelId(), E = a.win.EditeurCibles.nouvelId();
        const id = await creer(a, [{ id: L, nom: 'Lire' }, { id: E, nom: 'Écrire' }]);
        a.store.test_jugementsDenotation = { [id]: { [DA1]: jugement({ [L]: true, [E]: true }), [DA2]: jugement({ [L]: true }), [DA3]: jugement({ [L]: false, [E]: true }) } };
        const avant = clone(a.store);

        a.reponsesConfirm.push(false);
        await reediter(a, id, (c) => c.filter(x => x.id !== L));
        expect(a.questions).toHaveLength(1);
        expect(a.questions[0]).toContain('« Lire »');
        expect(a.questions[0]).toContain('cochée pour 2 étudiant·es');
        expect(a.questions[0]).not.toContain('Écrire');
        expect(a.store).toEqual(avant);                 // annulé : rien d'écrit

        a.reponsesConfirm.push(true);
        const apres = await reediter(a, id, (c) => c.filter(x => x.id !== L));
        expect(apres.configuration.objectifs).toEqual([{ id: E, nom: 'Écrire' }]);
        expect(a.store.test_jugementsDenotation).toEqual(avant.test_jugementsDenotation);   // les coches de « Lire » restent dans les données
    });

    it('retirer une cible que personne n\'a cochée : aucune question', async () => {
        const a = monterAssistant(storeVide());
        const L = a.win.EditeurCibles.nouvelId(), E = a.win.EditeurCibles.nouvelId();
        const id = await creer(a, [{ id: L, nom: 'Lire' }, { id: E, nom: 'Écrire' }]);
        a.store.test_jugementsDenotation = { [id]: { [DA1]: jugement({ [L]: false, [E]: true }) } };
        const apres = await reediter(a, id, (c) => c.filter(x => x.id !== L));
        expect(a.questions).toEqual([]);
        expect(apres.configuration.objectifs).toEqual([{ id: E, nom: 'Écrire' }]);
    });

    it('le stock : une pratique aux ids `cible-N` s\'ouvre, s\'enregistre sans rien toucher, et ressort identique', async () => {
        const stock = { id: 'pratique_STOCK_DEN', nom: 'DEN stock', type: 'denotation', calcul_note: { methode: 'jugement_global' },
            configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible-1', nom: 'Analyser' }, { id: 'cible-2', nom: 'Argumenter' }],
                suggestion: { methode: 'mode' }, echelleId: null, grilleId: null } };
        const jugements = { pratique_STOCK_DEN: { [DA1]: jugement({ 'cible-1': true, 'cible-2': true }), [DA2]: jugement({ 'cible-1': true, 'cible-2': false }) } };
        const a = monterAssistant(Object.assign(storeVide(), { test_pratiquesConfigurables: [clone(stock)], test_jugementsDenotation: clone(jugements) }));
        const apres = await reediter(a, 'pratique_STOCK_DEN');
        expect(apres.configuration.objectifs).toEqual(stock.configuration.objectifs);
        expect(a.store.test_jugementsDenotation).toEqual(jugements);
        expect(a.questions).toEqual([]);
        expect(noteMoteur(a.store, 'pratique_STOCK_DEN', DA1)).toBe(78);
        expect(noteMoteur(a.store, 'pratique_STOCK_DEN', DA2)).toBe(59);
    });
});

describe('#717 · l\'id d\'une cible : jamais une position, jamais redonné', () => {
    const win = chargerScript('js/pratiques/editeur-cibles.js', { echapperHtml: (s) => String(s) });

    it('un id retiré n\'est pas redonné à la cible ajoutée ensuite', () => {
        // Deux cibles ; on retire la PREMIÈRE ; la cible ajoutée ensuite ne reprend ni son id ni celui de l'autre.
        const a = win.EditeurCibles.nouvelId();
        const b = win.EditeurCibles.nouvelId();
        const c = win.EditeurCibles.nouvelId();
        expect(new Set([a, b, c]).size).toBe(3);
    });

    it('mille ids : tous distincts, aucun de la forme positionnelle `cible-N`', () => {
        const ids = Array.from({ length: 1000 }, () => win.EditeurCibles.nouvelId());
        expect(new Set(ids).size).toBe(1000);
        expect(ids.filter(id => /^cible-\d+$/.test(id))).toEqual([]);
    });

    it('deux ids de la même milliseconde sont distincts (le compteur, pas l\'horloge)', () => {
        const maintenant = Date.now;
        Date.now = () => 1790000000000;
        try {
            expect(win.EditeurCibles.nouvelId()).not.toBe(win.EditeurCibles.nouvelId());
        } finally { Date.now = maintenant; }
    });

    it('sécurité (règle 1) : un nom porteur de " et < est rendu échappé dans la valeur du champ, rien n\'est injecté', () => {
        const w = chargerScript('js/pratiques/editeur-cibles.js', {});
        w.echapperHtml = echapperHtml;
        const html = w.EditeurCibles.rendre([{ id: 'cible_x', nom: 'Lire" onfocus="alert(1)<img src=x>' }]);
        expect(html).toContain('value="Lire&quot; onfocus=&quot;alert(1)&lt;img src=x&gt;"');
        expect(html).not.toContain('onfocus="alert');
        expect(html).not.toContain('<img src=x>');
    });
});

/* ---------------------------------------------------------------------------------------------
   La gestion des pratiques réelle, sur un faux document : l'écran du composant est simulé par
   ses lignes (`data-cible-id` + champ du nom), comme le composant les rend.
   --------------------------------------------------------------------------------------------- */
function monterGestion(pratique, jugements) {
    const store = { test_pratiquesConfigurables: [clone(pratique)], test_jugementsDenotation: clone(jugements), test_echellesTemplates: [], test_grillesTemplates: [] };
    const elements = {};
    const questions = [], reponsesConfirm = [];
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = { document: fauxDocument(elements, {}), db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml: (x) => String(x == null ? '' : x),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        toggleDisplay: (el, visible) => { if (el) el.style.display = visible ? '' : 'none'; },
        confirm: (m) => { questions.push(m); return reponsesConfirm.length ? reponsesConfirm.shift() : true; } };
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerAvecInterne('js/pratiques-gestion.js', globaux, win, ['appliquerFormulaireDansCollection']);
    // L'écran : les lignes que l'enseignant·e voit, dans l'ordre.
    const ecran = (cibles) => {
        elements['mat-den-cibles'].innerHTML = '<!-- écran modifié par le banc -->';   // ce que l'écran montre a changé
        elements['mat-den-cibles'].querySelectorAll = (s) => (s === '.editeur-cibles-ligne'
            ? cibles.map(c => ({ dataset: { cibleId: c.id }, querySelector: () => ({ value: c.nom }) })) : []);
    };
    return { win, store, elements, ecran, questions, reponsesConfirm };
}
const PRATIQUE_GESTION = { id: 'P_DEN', nom: 'DEN gestion', type: 'denotation', calcul_note: { methode: 'jugement_global' }, pratiques: ['DEN'],
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible_a', nom: 'Lire' }, { id: 'cible_b', nom: 'Écrire' }],
        suggestion: { methode: 'mode' }, grilleId: null, echelleId: '' } };

describe('#717 · la gestion des pratiques : les mêmes gestes, la même règle', () => {
    const JUGEMENTS = { P_DEN: { [DA1]: jugement({ cible_a: true, cible_b: true }), [DA2]: jugement({ cible_a: true, cible_b: false }) } };

    it('la liste s\'ouvre avec les ids enregistrés, dans l\'ordre', async () => {
        const g = monterGestion(PRATIQUE_GESTION, JUGEMENTS);
        await g.win.chargerPratiquePourModif('P_DEN');
        const html = g.elements['mat-den-cibles'].innerHTML;
        expect(html.indexOf('data-cible-id="cible_a"')).toBeGreaterThan(-1);
        expect(html.indexOf('data-cible-id="cible_a"')).toBeLessThan(html.indexOf('data-cible-id="cible_b"'));
        expect(html).toContain('value="Lire"');
    });

    it('retirer la première : « Écrire » garde son id ; déplacer et renommer ne touchent pas aux coches', async () => {
        const g = monterGestion(PRATIQUE_GESTION, JUGEMENTS);
        await g.win.chargerPratiquePourModif('P_DEN');
        const coches = clone(g.store.test_jugementsDenotation);

        g.ecran([{ id: 'cible_b', nom: 'Écrire' }, { id: 'cible_a', nom: 'Lire' }]);           // déplacer
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.store.test_pratiquesConfigurables[0].configuration.objectifs).toEqual([{ id: 'cible_b', nom: 'Écrire' }, { id: 'cible_a', nom: 'Lire' }]);

        g.ecran([{ id: 'cible_b', nom: 'Écrire un essai' }, { id: 'cible_a', nom: 'Lire' }]);  // renommer
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.store.test_pratiquesConfigurables[0].configuration.objectifs).toEqual([{ id: 'cible_b', nom: 'Écrire un essai' }, { id: 'cible_a', nom: 'Lire' }]);
        expect(noteMoteur(g.store, 'P_DEN', DA1)).toBe(78);
        expect(noteMoteur(g.store, 'P_DEN', DA2)).toBe(59);
        expect(g.questions).toEqual([]);

        g.ecran([{ id: 'cible_b', nom: 'Écrire un essai' }]);                                 // retirer « Lire »
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.store.test_pratiquesConfigurables[0].configuration.objectifs).toEqual([{ id: 'cible_b', nom: 'Écrire un essai' }]);
        expect(noteMoteur(g.store, 'P_DEN', DA1)).toBe(78);
        expect(noteMoteur(g.store, 'P_DEN', DA2)).toBe(59);   // avant #717 : 78
        expect(g.store.test_jugementsDenotation).toEqual(coches);
    });

    it('retirer une cible cochée : la question nomme la cible et le nombre d\'élèves ; « annuler » n\'écrit rien et remet la liste', async () => {
        const g = monterGestion(PRATIQUE_GESTION, JUGEMENTS);
        await g.win.chargerPratiquePourModif('P_DEN');
        const avant = clone(g.store);
        g.ecran([{ id: 'cible_b', nom: 'Écrire' }]);
        g.reponsesConfirm.push(false);
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.questions).toHaveLength(1);
        expect(g.questions[0]).toContain('« Lire »');
        expect(g.questions[0]).toContain('cochée pour 2 étudiant·es');
        expect(g.store).toEqual(avant);
        expect(g.elements['mat-den-cibles'].innerHTML).toContain('data-cible-id="cible_a"');   // la liste enregistrée revient à l'écran
    });

    it('une ligne laissée vide (« + Ajouter une cible » sans nom) ne s\'enregistre pas : elle ne serait cochable par personne', async () => {
        // Une cible sans nom plafonnerait toutes les notes à 59 (aucune coche possible à la saisie).
        const g = monterGestion(PRATIQUE_GESTION, JUGEMENTS);
        await g.win.chargerPratiquePourModif('P_DEN');
        g.ecran([{ id: 'cible_a', nom: 'Lire' }, { id: 'cible_b', nom: 'Écrire' }, { id: 'cible_vide', nom: '   ' }]);
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.store.test_pratiquesConfigurables[0].configuration.objectifs).toEqual([{ id: 'cible_a', nom: 'Lire' }, { id: 'cible_b', nom: 'Écrire' }]);
        expect(noteMoteur(g.store, 'P_DEN', DA1)).toBe(78);
    });

    it('la question au singulier : « pour 1 étudiant·e », « sans elle » ; deux cibles retirées : « sans elles »', async () => {
        const g = monterGestion(PRATIQUE_GESTION, { P_DEN: { [DA1]: jugement({ cible_a: true, cible_b: true }) } });
        await g.win.chargerPratiquePourModif('P_DEN');
        g.ecran([{ id: 'cible_b', nom: 'Écrire' }]);
        g.reponsesConfirm.push(false);
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.questions[0]).toContain('« Lire » : cochée pour 1 étudiant·e\n');
        expect(g.questions[0]).toContain('recalculée sans elle.');
        g.ecran([]);
        g.reponsesConfirm.push(false);
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.questions[1]).toContain('Tu retires des cibles déjà cochées.');
        expect(g.questions[1]).toContain('recalculée sans elles.');
        expect(g.questions[1]).not.toContain('élève');
    });

    it('le stock : une pratique aux ids `cible-N` s\'enregistre sans rien toucher et ressort identique', async () => {
        const stock = clone(PRATIQUE_GESTION);
        stock.configuration.objectifs = [{ id: 'cible-1', nom: 'Lire' }, { id: 'cible-2', nom: 'Écrire' }];
        const g = monterGestion(stock, { P_DEN: { [DA1]: jugement({ 'cible-1': true, 'cible-2': true }) } });
        await g.win.chargerPratiquePourModif('P_DEN');
        g.ecran(stock.configuration.objectifs);
        await g.win.sauvegarderConfigPratiqueMat();
        expect(g.store.test_pratiquesConfigurables[0].configuration.objectifs).toEqual(stock.configuration.objectifs);
        expect(noteMoteur(g.store, 'P_DEN', DA1)).toBe(78);
        expect(g.questions).toEqual([]);
    });
});

describe('#717 · la saisie du jugement n\'efface pas les coches d\'une cible retirée', () => {
    it('réenregistrer le jugement garde la coche de la cible retirée, et écrit celles de l\'écran', () => {
        const store = { test_jugementsDenotation: { P_DEN: { [DA1]: jugement({ cible_a: true, cible_b: false }) } } };
        const elements = {};
        const win = { addEventListener() {}, removeEventListener() {} };
        const config = { id: 'P_DEN', calcul_note: { methode: 'jugement_global' }, configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible_b', nom: 'Écrire' }], suggestion: { methode: 'mode' } } };
        const globaux = { document: fauxDocument(elements, {}), db: dbBanc(store, []), cle: (k) => 'test_' + k,
            obtenirPratiqueActive: () => ({ config }), notifications: { succes() {}, erreur() {} } };
        chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
        win.notifications = globaux.notifications;
        chargerScript('js/pratiques/denotation-saisie-ui.js', globaux, win);
        fauxDocument(elements, {}).getElementById('den-cible-cible_b-' + DA1).checked = true;
        elements['den-note-' + DA1] = Object.assign(fauxDocument(elements, {}).getElementById('den-note-' + DA1), { value: '78' });
        win.denotationSaisie.enregistrer(DA1);
        expect(store.test_jugementsDenotation.P_DEN[DA1].ciblesAtteintes).toEqual({ cible_a: true, cible_b: true });
    });
});

describe('#717 · sentinelle : aucun id de cible positionnel dans js/', () => {
    const fichiers = [];
    const parcourir = (d) => { for (const n of readdirSync(d)) { const p = path.join(d, n); if (statSync(p).isDirectory()) { if (n !== 'lib') parcourir(p); } else if (n.endsWith('.js')) fichiers.push(p); } };
    parcourir(path.join(RACINE, 'js'));

    it('ni `\'cible-\' + (i + 1)` ni gabarit `cible-${…}` : un id de cible ne se calcule jamais depuis une position', () => {
        const fautifs = [];
        for (const f of fichiers) {
            readFileSync(f, 'utf8').split('\n').forEach((ligne, i) => {
                if (/['"`]cible-['"`]\s*\+/.test(ligne) || /`cible-\$\{/.test(ligne)) fautifs.push(path.relative(RACINE, f) + ':' + (i + 1));
            });
        }
        expect(fautifs).toEqual([]);
    });

    it('les deux éditeurs passent par le composant commun, et plus par une zone de texte', () => {
        const wizard = readFileSync(path.join(RACINE, 'js/wizard-pratique-v2.js'), 'utf8');
        const gestion = readFileSync(path.join(RACINE, 'js/pratiques-gestion.js'), 'utf8');
        const index = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(wizard).toMatch(/id: 'ciblesDenotation',[\s\S]{0,200}type: 'liste-cibles'/);
        expect(wizard).toContain('window.EditeurCibles.lire(element)');
        expect(gestion).toContain("window.EditeurCibles.lire(document.getElementById('mat-den-cibles'))");
        expect(index).not.toMatch(/<textarea id="mat-den-cibles"/);
        expect(index).toMatch(/<script src="js\/pratiques\/editeur-cibles\.js/);
    });
});
