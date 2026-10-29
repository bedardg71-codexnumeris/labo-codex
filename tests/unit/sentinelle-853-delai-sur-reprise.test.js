import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, fauxDocument, dbBanc, echapperHtml, elementDom } from './_helpers/bac-suivi.js';

// #853 (13 sept. 2026) — « Permettre un délai sur une reprise » est un RÉGLAGE DE LA PRATIQUE.
// Grégoire : « la question dépend de l'utilisateur, je ne veux pas imposer ma pratique à moi. »
//
// Avant : `appliquerJetonDelai` refusait tout délai sur une évaluation portant `repriseDeId`,
// pour tout le monde. Après : le refus tient seulement si la pratique ne coche pas le réglage.
// Défaut (réglage absent : pratiques antérieures, importées, partagées) = refus, comme avant.
// Une copie REMPLACÉE (`remplaceeParId`) reste refusée dans tous les cas : elle ne compte plus.
//
// Formes : PLATE `jetons.delaiSurReprise` (formulaire de gestion) ; IMBRIQUÉE
// `configuration.jetons.delai.surReprise` (assistant). La clé canonique `delai.surReprise`
// n'apparaît QUE pour le booléen vrai : les configs existantes restent identiques.
//
// Relectures croisées de Cowork (13 sept.) — 1re passe : valeurs MOLLES d'un JSON importé ;
// câblage par recherche de chaînes remplacé par un ALLER-RETOUR qui exécute le formulaire ;
// formulaire inerte en silence sur une pratique à jetons réglés ailleurs. 2e passe : (§1) sur
// une pratique MIXTE (bloc plat + bloc de l'assistant ou d'import), l'écran affichait les valeurs
// inertes sans le dire ; (§2) la note naissait sans son `u-hide` dans le banc, et « l'écran le
// dit » passait à vide ; (§3a) l'assistant n'était prouvé que par son texte — il est exécuté.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const REPRISE = { id: 'R', etudiantDA: '1111111', productionId: 'P1', noteFinale: 70, repriseDeId: 'O', jetonRepriseApplique: true };
const ORIGINALE = { id: 'O', etudiantDA: '1111111', productionId: 'P1', noteFinale: 50, remplaceeParId: 'R', archivee: true };

/** Le moteur des jetons (réel), avec UNE pratique active. */
function monterMoteur({ pratique = null, evaluations = [REPRISE, ORIGINALE] } = {}) {
    const store = {
        pratiquesConfigurables: pratique ? [Object.assign({ id: 'PR' }, clone(pratique))] : [],
        evaluationsSauvegardees: evaluations.map(e => Object.assign({}, e))
    };
    const notifs = [];
    const win = chargerScript('js/evaluation-jetons.js', {
        db: { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k,
        obtenirIdPratiqueActive: () => (pratique ? 'PR' : null),
        sauvegarderDonneesSelonMode: (k, v) => { store[k] = v; return true; },
        notifications: { succes: (t, m) => notifs.push({ type: 'succes', t, m }), erreur: (t, m) => notifs.push({ type: 'erreur', t, m }), info() {}, avertissement() {} }
    });
    return { win, store, notifs };
}

const PLATE = (v) => ({ jetons: { nombre: 2, delaiDuree: 3, delaiSurReprise: v } });
const IMBRIQUEE = (v) => ({ configuration: { jetons: { activer: true, delai: { nombre: 2, dureeJours: 3, surReprise: v }, reprise: { nombre: 2 } } } });
const MOLLES = ['true', 'false', 1, 0, {}, null, undefined];

describe('#853 · le réglage est lu sous les deux formes, et n\'apparaît que pour le booléen vrai', () => {
    for (const [nom, forme] of [['PLATE', PLATE], ['IMBRIQUÉE', IMBRIQUEE]]) {
        it(`${nom} : true → \`delai.surReprise === true\` ; false → clé absente (config identique à avant)`, () => {
            expect(monterMoteur({ pratique: forme(true) }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3, surReprise: true });
            expect(monterMoteur({ pratique: forme(false) }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3 });
        });
        for (const v of MOLLES) {
            it(`${nom} : valeur molle ${JSON.stringify(v)} (JSON importé) → clé absente, et le délai sur la reprise reste refusé`, () => {
                const b = monterMoteur({ pratique: forme(v) });
                expect(b.win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3 });
                expect(b.win.appliquerJetonDelai('R')).toBe(false);
            });
        }
    }
});

describe('#853 · appliquerJetonDelai sur une reprise suit le réglage de la pratique', () => {
    for (const [nom, pratique] of [['plate', PLATE(true)], ['imbriquée', IMBRIQUEE(true)]]) {
        it(`réglage coché (${nom}) : le délai est accordé sur la reprise`, () => {
            const b = monterMoteur({ pratique });
            expect(b.win.appliquerJetonDelai('R')).toBe(true);
            const r = b.store.evaluationsSauvegardees.find(e => e.id === 'R');
            expect(r.jetonDelaiApplique).toBe(true);
            expect(r.dureeDelaiJours).toBe(3);
        });
    }
    for (const [nom, pratique] of [['plate décochée', PLATE(false)], ['imbriquée décochée', IMBRIQUEE(false)], ['aucune pratique : défaut', null]]) {
        it(`réglage absent ou décoché (${nom}) : refus « Conflit » qui nomme le réglage, rien d'écrit`, () => {
            const b = monterMoteur({ pratique });
            expect(b.win.appliquerJetonDelai('R')).toBe(false);
            expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
            expect(b.notifs[0].m).toMatch(/pratique ne permet pas de délai sur une reprise/);
            expect(b.store.evaluationsSauvegardees.find(e => e.id === 'R').jetonDelaiApplique).toBeUndefined();
        });
    }
    it('une copie REMPLACÉE reste refusée, même réglage coché', () => {
        const b = monterMoteur({ pratique: PLATE(true) });
        expect(b.win.appliquerJetonDelai('O')).toBe(false);
        expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
        // ↻ #1152, lot 5 (29 oct. 2026) : la phrase de Cowork du § 1.4 (plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md).
        expect(b.notifs[0].m).toBe('Cette évaluation a une reprise : un délai ne s\'y applique pas.');
    });
    it('une évaluation ordinaire reçoit toujours son délai, réglage décoché', () => {
        const b = monterMoteur({ pratique: PLATE(false), evaluations: [{ id: 'E', etudiantDA: '1111111', productionId: 'P2', noteFinale: 60 }] });
        expect(b.win.appliquerJetonDelai('E')).toBe(true);
    });
});

/**
 * Le formulaire de gestion RÉEL (js/pratiques-gestion.js) sur un faux document. `chargerPratiquePourModif`
 * ouvre la pratique (et pose la pratique en édition) ; `appliquerFormulaireDansCollection` est le mutateur
 * que la sauvegarde confie à `db.modifier` — exposé par le banc, appelé ici sur la collection du magasin.
 * La note naît avec son `u-hide`, comme dans index.html : sans quoi « l'écran le dit » passerait à vide.
 */
function monterFormulaire(pratique) {
    const store = { test_pratiquesConfigurables: [Object.assign({ id: 'PR', nom: 'Pratique banc', type: 'sommative' }, clone(pratique))] };
    const note = elementDom({ id: 'mat-jetons-regles-ailleurs' });
    note.classList.add('u-hide');
    const elements = { 'mat-jetons-regles-ailleurs': note };
    const document = fauxDocument(elements, {});
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = {
        document, db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        // Global d'un autre module (js/utils) que le formulaire appelle par nom nu.
        toggleDisplay: (el, visible) => { if (el) el.style.display = visible ? '' : 'none'; }
    };
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);   // lot N5 (#717) : la liste des cibles DEN, posée au chargement
    chargerAvecInterne('js/pratiques-gestion.js', globaux, win, ['appliquerFormulaireDansCollection']);
    return { win, store, elements, interne: win.__audit['pratiques-gestion.js'] };
}

const NOTE_AFFICHEE = (f) => !f.elements['mat-jetons-regles-ailleurs'].classList.contains('u-hide');

describe('#853 · aller-retour : formulaire de gestion → pratique enregistrée → moteur', () => {
    it('bloc PLAT : la note reste cachée, la case s\'affiche décochée, se coche, s\'enregistre, et le moteur accorde le délai', async () => {
        const f = monterFormulaire(PLATE(false));
        await f.win.chargerPratiquePourModif('PR');
        expect(NOTE_AFFICHEE(f)).toBe(false);
        expect(f.elements['mat-delai-sur-reprise'].checked).toBe(false);
        expect(f.elements['mat-delai-sur-reprise'].disabled).toBe(false);
        // L'enseignant·e coche le réglage (et laisse le reste tel quel).
        f.elements['mat-jetons-actif'].checked = true;
        f.elements['mat-delai-sur-reprise'].checked = true;
        const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
        expect(ecrite[0].jetons.delaiSurReprise).toBe(true);
        const moteur = monterMoteur({ pratique: { jetons: ecrite[0].jetons } });
        expect(moteur.win.appliquerJetonDelai('R')).toBe(true);
    });

    it('bloc PLAT déjà coché : la case se RECHARGE cochée', async () => {
        const f = monterFormulaire(PLATE(true));
        await f.win.chargerPratiquePourModif('PR');
        expect(f.elements['mat-delai-sur-reprise'].checked).toBe(true);
    });

    const CONFIG_IMPORT = { config: { jetons: { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2 } } } };
    const AILLEURS = [
        ['configuration.jetons (assistant)', IMBRIQUEE(false)],
        ['configuration.jetons désactivés (assistant, `activer: false`)', { configuration: { jetons: { activer: false } } }],
        ['config.jetons (import)', CONFIG_IMPORT],
        // 2e passe de Cowork (§1) : pratiques MIXTES — un bloc plat INERTE (coché, valeurs à part) sous un bloc lu.
        ['MIXTE : bloc plat inerte + configuration.jetons', Object.assign({ jetons: { nombre: 5, delaiDuree: 7, delaiSurReprise: true, repriseOriginale: 'supprimer', cibleePlafond: 80 } }, IMBRIQUEE(false))],
        ['MIXTE : bloc plat inerte + config.jetons', Object.assign({ jetons: { nombre: 5, delaiDuree: 7, delaiSurReprise: true } }, CONFIG_IMPORT)]
    ];
    for (const [nom, pratique] of AILLEURS) {
        it(`jetons réglés ailleurs — ${nom} : l'écran le dit, les champs sont désactivés, rien n'est écrit, le moteur n'a pas bougé`, async () => {
            const f = monterFormulaire(pratique);
            await f.win.chargerPratiquePourModif('PR');
            expect(NOTE_AFFICHEE(f)).toBe(true);
            for (const id of ['mat-jetons-actif', 'mat-delai-sur-reprise', 'mat-delai-duree', 'mat-jetons-nombre']) {
                expect(f.elements[id].disabled, id).toBe(true);
            }
            f.elements['mat-delai-sur-reprise'].checked = true;   // une case désactivée ne se coche pas ; le mutateur ne doit rien en faire
            const avant = clone(f.store.test_pratiquesConfigurables[0]);
            const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
            expect(ecrite[0].jetons).toEqual(avant.jetons);   // aucun bloc plat fabriqué, ni l'inerte réécrit
            expect(ecrite[0].configuration && ecrite[0].configuration.jetons).toEqual(avant.configuration && avant.configuration.jetons);
            // Le moteur lit le bloc de l'assistant ou d'import, jamais le plat : pas de délai sur la reprise.
            const moteur = monterMoteur({ pratique: ecrite[0] });
            expect(moteur.win.appliquerJetonDelai('R')).toBe(false);
        });
    }

    it('index.html porte la case (décochée) et la note (masquée), qui dit que les valeurs affichées ne s\'appliquent pas', () => {
        const html = lire('index.html');
        const caseHtml = html.match(/<input[^>]*id="mat-delai-sur-reprise"[^>]*>/);
        expect(caseHtml).not.toBeNull();
        expect(caseHtml[0]).not.toMatch(/\bchecked\b/);
        const note = html.split('id="mat-jetons-regles-ailleurs"')[1].split('</p>')[0];
        expect(note).toMatch(/^ class="u-hide\b/);
        // Jetons par défaut (29 oct. 2026) : les valeurs affichées SONT celles qui s'appliquent (le formulaire lit la résolution
        // du moteur) ; la demi-phrase qui disait le contraire est retirée.
        expect(note).toMatch(/ne peut pas les modifier\.\s*$/);
        expect(note).not.toMatch(/valeurs affichées/);
    });
});

/**
 * L'assistant RÉEL (js/wizard-pratique-v2.js), par le harnais du golden master #319 : réponses posées dans
 * `wizardState`, `creerPratiqueV2()`, pratique relue dans le magasin — puis rebranchée au moteur.
 */
async function produireParAssistant(reponsesJetons) {
    let store = [];
    const db = {
        getSync: (k, d) => (k === 'pratiquesConfigurables' ? store : (k === 'modalitesEvaluation' ? {} : (d !== undefined ? d : null))),
        setSync: (k, v) => { if (k === 'pratiquesConfigurables') store = v; }
    };
    const globaux = { db, cle: (k) => k, notifications: { erreur() {}, succes() {} }, normaliserIdPratique: (t) => t,
        genererIdUnique: () => 'id-genere', echapperHtml };
    const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    win.wizardState.reponses = Object.assign({ calcNoteFinale: 'acceptable', seuilAcceptabilite: 100, utiliserJetons: true,
        nbJetonsDelai: 3, dureeDelaiJours: 3, nbJetonsReprise: 2, modeleBundle: 'standard', nom: 'SPE banc' }, reponsesJetons);
    win.wizardState.pratiqueId = 'PR';
    win.wizardState.modeEdition = false;
    await win.creerPratiqueV2();
    return store[0];
}

describe('#853 · l\'assistant (exécuté) écrit le réglage seulement coché', () => {
    it('coché : `configuration.jetons.delai.surReprise === true`, et le moteur accorde le délai sur la reprise', async () => {
        const p = await produireParAssistant({ delaiSurReprise: true });
        expect(p.configuration.jetons.delai).toEqual({ nombre: 3, dureeJours: 3, surReprise: true });
        expect(monterMoteur({ pratique: p }).win.appliquerJetonDelai('R')).toBe(true);
    });
    for (const [nom, v] of [['décoché', false], ['jamais répondu', undefined]]) {
        it(`${nom} : la clé n'est PAS écrite (pratique identique au golden #319), et le moteur refuse`, async () => {
            const p = await produireParAssistant(v === undefined ? {} : { delaiSurReprise: v });
            expect(p.configuration.jetons.delai).toEqual({ nombre: 3, dureeJours: 3 });
            expect(monterMoteur({ pratique: p }).win.appliquerJetonDelai('R')).toBe(false);
        });
    }
    it('l\'étape « Configuration des jetons » propose le réglage en toggle, non par défaut', () => {
        expect(lire('js/wizard-pratique-v2.js')).toMatch(/id: 'delaiSurReprise',\s*label: '[^']+',\s*type: 'toggle',\s*default: false/);
    });
});
