import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, fauxDocument, dbBanc, echapperHtml } from './_helpers/bac-suivi.js';

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
// Relecture croisée de Cowork (13 sept.) : (§2) les valeurs MOLLES d'un JSON importé ("true",
// "false", 1, 0, {}, null) n'étaient pas essayées — `!!valeur` survivait ; (§3) les essais de
// câblage cherchaient des chaînes dans le texte des fichiers — remplacés par un ALLER-RETOUR qui
// exécute le formulaire de gestion ; (§1) sur une pratique à jetons réglés ailleurs (assistant,
// import), le formulaire était inerte en silence — il le dit désormais, se désactive, n'écrit rien.

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
        obtenirPratiqueActiveGroupeCours: () => (pratique ? 'PR' : null),
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
        expect(b.notifs[0].m).toMatch(/remplacée par une reprise/);
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
 */
function monterFormulaire(pratique) {
    const store = { test_pratiquesConfigurables: [Object.assign({ id: 'PR', nom: 'Pratique banc', type: 'sommative' }, clone(pratique))] };
    const elements = {};
    const document = fauxDocument(elements, {});
    const win = { addEventListener() {}, removeEventListener() {} };
    const globaux = {
        document, db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        // Global d'un autre module (js/utils) que le formulaire appelle par nom nu.
        toggleDisplay: (el, visible) => { if (el) el.style.display = visible ? '' : 'none'; }
    };
    chargerAvecInterne('js/pratiques-gestion.js', globaux, win, ['appliquerFormulaireDansCollection']);
    return { win, store, elements, interne: win.__audit['pratiques-gestion.js'] };
}

describe('#853 · aller-retour : formulaire de gestion → pratique enregistrée → moteur', () => {
    it('bloc PLAT : la case s\'affiche décochée, se coche, s\'enregistre, et le moteur accorde le délai sur la reprise', async () => {
        const f = monterFormulaire(PLATE(false));
        await f.win.chargerPratiquePourModif('PR');
        expect(f.elements['mat-delai-sur-reprise'].checked).toBe(false);
        expect(f.elements['mat-delai-sur-reprise'].disabled).toBe(false);
        expect(f.elements['mat-jetons-regles-ailleurs'].classList.contains('u-hide')).toBe(true);
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

    for (const [nom, pratique] of [['configuration.jetons (assistant)', IMBRIQUEE(false)],
        ['configuration.jetons désactivés (assistant, `activer: false`)', { configuration: { jetons: { activer: false } } }],
        ['config.jetons (import)', { config: { jetons: { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2 } } } }]]) {
        it(`jetons réglés ailleurs — ${nom} : l'écran le dit, les champs sont désactivés, rien n'est écrit, le moteur n'a pas bougé`, async () => {
            const f = monterFormulaire(pratique);
            await f.win.chargerPratiquePourModif('PR');
            expect(f.elements['mat-jetons-regles-ailleurs'].classList.contains('u-hide')).toBe(false);
            for (const id of ['mat-jetons-actif', 'mat-delai-sur-reprise', 'mat-delai-duree', 'mat-jetons-nombre']) {
                expect(f.elements[id].disabled, id).toBe(true);
            }
            f.elements['mat-delai-sur-reprise'].checked = true;   // une case désactivée ne se coche pas ; le mutateur ne doit rien en faire
            const avant = clone(f.store.test_pratiquesConfigurables[0]);
            const ecrite = f.interne.appliquerFormulaireDansCollection(clone(f.store.test_pratiquesConfigurables));
            expect(ecrite[0].jetons).toEqual(avant.jetons);   // aucun bloc plat fabriqué
            const moteur = monterMoteur({ pratique: ecrite[0] });
            expect(moteur.win.appliquerJetonDelai('R')).toBe(false);
        });
    }

    it('index.html porte la case et la note, masquée par défaut', () => {
        const html = lire('index.html');
        expect(html).toMatch(/<input[^>]*id="mat-delai-sur-reprise"[^>]*>/);
        expect(html.match(/<input[^>]*id="mat-delai-sur-reprise"[^>]*>/)[0]).not.toMatch(/\bchecked\b/);
        expect(html).toMatch(/<p id="mat-jetons-regles-ailleurs" class="u-hide\b/);
    });
});

describe('#853 · l\'assistant propose le réglage et ne l\'écrit que coché', () => {
    it('toggle « Permettre un délai sur une reprise ? », non par défaut ; `surReprise` écrit seulement coché', () => {
        const src = lire('js/wizard-pratique-v2.js');
        expect(src).toMatch(/id: 'delaiSurReprise',\s*label: '[^']+',\s*type: 'toggle',\s*default: false/);
        expect(src).toContain('r.delaiSurReprise === true ? { surReprise: true } : {}');
    });
});
