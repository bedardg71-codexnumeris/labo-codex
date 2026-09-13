import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

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
// n'apparaît QUE si le réglage est coché : les configs existantes restent identiques.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const REPRISE = { id: 'R', etudiantDA: '1111111', productionId: 'P1', noteFinale: 70, repriseDeId: 'O', jetonRepriseApplique: true };
const ORIGINALE = { id: 'O', etudiantDA: '1111111', productionId: 'P1', noteFinale: 50, remplaceeParId: 'R', archivee: true };

function monter({ pratique = null, evaluations = [REPRISE, ORIGINALE] } = {}) {
    const store = {
        pratiquesConfigurables: pratique ? [Object.assign({ id: 'PR' }, pratique)] : [],
        evaluationsSauvegardees: evaluations.map(e => Object.assign({}, e))
    };
    const notifs = [];
    const win = chargerScript('js/evaluation-jetons.js', {
        db: { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k,
        obtenirPratiqueActiveGroupeCours: () => (pratique ? 'PR' : null),
        sauvegarderDonneesSelonMode: (k, v) => { store[k] = v; return true; },
        notifications: { succes: (t, m) => notifs.push({ type: 'succes', t, m }), erreur: (t, m) => notifs.push({ type: 'erreur', t, m }), info() {}, avertissement() {} }
    });
    return { win, store, notifs };
}

const PLATE_OUI = { jetons: { nombre: 2, delaiDuree: 3, delaiSurReprise: true } };
const PLATE_NON = { jetons: { nombre: 2, delaiDuree: 3, delaiSurReprise: false } };
const IMBRIQUEE_OUI = { configuration: { jetons: { activer: true, delai: { nombre: 2, dureeJours: 3, surReprise: true }, reprise: { nombre: 2 } } } };
const IMBRIQUEE_NON = { configuration: { jetons: { activer: true, delai: { nombre: 2, dureeJours: 3, surReprise: false }, reprise: { nombre: 2 } } } };

describe('#853 · le réglage est lu sous les deux formes, et n\'apparaît que coché', () => {
    it('PLATE : `delaiSurReprise: true` → `delai.surReprise === true` ; `false` → clé absente (config identique à avant)', () => {
        expect(monter({ pratique: PLATE_OUI }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3, surReprise: true });
        expect(monter({ pratique: PLATE_NON }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3 });
    });
    it('IMBRIQUÉE (assistant) : `delai.surReprise: true` → true ; `false` → clé absente', () => {
        expect(monter({ pratique: IMBRIQUEE_OUI }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3, surReprise: true });
        expect(monter({ pratique: IMBRIQUEE_NON }).win.obtenirConfigJetons().delai).toEqual({ nombre: 2, dureeJours: 3 });
    });
});

describe('#853 · appliquerJetonDelai sur une reprise suit le réglage de la pratique', () => {
    for (const [nom, pratique] of [['plate', PLATE_OUI], ['imbriquée', IMBRIQUEE_OUI]]) {
        it(`réglage coché (${nom}) : le délai est accordé sur la reprise`, () => {
            const b = monter({ pratique });
            expect(b.win.appliquerJetonDelai('R')).toBe(true);
            const r = b.store.evaluationsSauvegardees.find(e => e.id === 'R');
            expect(r.jetonDelaiApplique).toBe(true);
            expect(r.dureeDelaiJours).toBe(3);
        });
    }
    for (const [nom, pratique] of [['plate décochée', PLATE_NON], ['imbriquée décochée', IMBRIQUEE_NON], ['aucune pratique : défaut', null]]) {
        it(`réglage absent ou décoché (${nom}) : refus « Conflit » qui nomme le réglage, rien d'écrit`, () => {
            const b = monter({ pratique });
            expect(b.win.appliquerJetonDelai('R')).toBe(false);
            expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
            expect(b.notifs[0].m).toMatch(/pratique ne permet pas de délai sur une reprise/);
            expect(b.store.evaluationsSauvegardees.find(e => e.id === 'R').jetonDelaiApplique).toBeUndefined();
        });
    }
    it('une copie REMPLACÉE reste refusée, même réglage coché', () => {
        const b = monter({ pratique: PLATE_OUI });
        expect(b.win.appliquerJetonDelai('O')).toBe(false);
        expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
        expect(b.notifs[0].m).toMatch(/remplacée par une reprise/);
    });
    it('une évaluation ordinaire reçoit toujours son délai, réglage décoché', () => {
        const b = monter({ pratique: PLATE_NON, evaluations: [{ id: 'E', etudiantDA: '1111111', productionId: 'P2', noteFinale: 60 }] });
        expect(b.win.appliquerJetonDelai('E')).toBe(true);
    });
});

describe('#853 · le réglage est câblé dans le formulaire de la pratique et dans l\'assistant', () => {
    it('index.html porte la case `mat-delai-sur-reprise`, décochée par défaut', () => {
        const html = lire('index.html');
        const m = html.match(/<input[^>]*id="mat-delai-sur-reprise"[^>]*>/);
        expect(m).not.toBeNull();
        expect(m[0]).not.toMatch(/\bchecked\b/);
    });
    it('pratiques-gestion.js charge ET enregistre le réglage sous `delaiSurReprise`', () => {
        const src = lire('js/pratiques-gestion.js');
        expect(src).toContain("setCheckbox('mat-delai-sur-reprise', jetons.delaiSurReprise === true)");
        expect(src).toContain("delaiSurReprise: getCheckbox('mat-delai-sur-reprise')");
    });
    it('l\'assistant propose le réglage (toggle, non par défaut) et l\'écrit dans `delai.surReprise`', () => {
        const src = lire('js/wizard-pratique-v2.js');
        expect(src).toMatch(/id: 'delaiSurReprise',\s*label: '[^']+',\s*type: 'toggle',\s*default: false/);
        // Écrit seulement coché : la pratique par défaut reste identique au golden master #319.
        expect(src).toContain('r.delaiSurReprise === true ? { surReprise: true } : {}');
    });
});
