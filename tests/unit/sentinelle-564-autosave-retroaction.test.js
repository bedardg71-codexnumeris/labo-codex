import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #564 (28 août 2026) — une rétroaction saisie SEULE ne doit plus être perdue.
//
// Pourquoi : `_debouncerAutoSave` n'avait qu'un seul appelant, `niveauSelectionne`.
// Modifier uniquement le texte de la rétroaction finale, sans toucher un critère,
// ne créait donc AUCUN snapshot ; `_flusherAutoSave` au changement de fichier
// n'avait rien à persister et le texte était perdu. Seul « Enregistrer » le
// sauvait. Perte réelle en navigation rapide entre copies.
//
// `_autoSauvegarderCriteres` lisait DÉJÀ `retroactionFinale1` dans le DOM : il ne
// manquait que le déclencheur, câblé par `data-on-input` sur le textarea.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer `window.retroactionModifiee = retroactionModifiee;`
//      (evaluation-chargement.js) → « expose » et « arme le debounce » rougissent.
//   2. remplacer le corps de `retroactionModifiee` par un no-op
//      → « arme le debounce » rougit seul.
//   3. retirer `data-on-input="retroactionModifiee"` du textarea (index.html)
//      → « câblé sur le textarea » rougit seul : l'export vivrait sans appelant,
//      exactement le patron de code mort qui a rendu #560 trompeur.
//   4. retirer la garde `if (window._autoSaveSuspendu) return;` de
//      `_debouncerAutoSave` → « respecte la suspension » rougit (la protection
//      contre la race condition de chargement serait perdue).

function monter() {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (_k, d) => (d !== undefined ? d : null),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirPreference: () => null
    };
    const win = chargerScript('js/evaluation-chargement.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    // Une évaluation en cours qui a DÉJÀ un critère renseigné : c'est le cas de
    // #564 — l'utilisateur revient sur le texte sans retoucher les niveaux.
    win.evaluationEnCours = {
        etudiantDA: '111', productionId: 'P1', grilleId: 'G1',
        echelleId: 'E1', cartoucheId: 'C1',
        criteres: { C1: 'M' }, donneesAlgorithmiques: {}
    };
    win._pendingAutoSaveSnapshot = null;
    win._autoSaveSuspendu = false;
    return win;
}

function nettoyer(win) {
    if (win._timerAutoSave) clearTimeout(win._timerAutoSave);
    win._timerAutoSave = null;
}

describe('#564 · la rétroaction saisie seule arme l’auto-save', () => {
    it('expose retroactionModifiee', () => {
        const win = monter();
        expect(typeof win.retroactionModifiee).toBe('function');
        nettoyer(win);
    });

    it('arme le debounce : un snapshot est créé, avec l’évaluation en cours', () => {
        const win = monter();
        expect(win._pendingAutoSaveSnapshot).toBe(null);

        win.retroactionModifiee();

        expect(win._pendingAutoSaveSnapshot).not.toBe(null);
        expect(win._pendingAutoSaveSnapshot.etudiantDA).toBe('111');
        expect(win._pendingAutoSaveSnapshot.productionId).toBe('P1');
        // Le snapshot doit porter les critères déjà saisis, sinon
        // `_autoSauvegarderCriteres` sortirait sur sa garde « au moins un
        // critère renseigné » et le texte ne serait toujours pas persisté.
        expect(win._pendingAutoSaveSnapshot.criteres).toEqual({ C1: 'M' });
        nettoyer(win);
    });

    it('respecte la suspension de chargement (anti-race-condition)', () => {
        const win = monter();
        win._autoSaveSuspendu = true;

        win.retroactionModifiee();

        expect(win._pendingAutoSaveSnapshot).toBe(null);
        nettoyer(win);
    });

    it('câblé sur le textarea #retroactionFinale1 dans index.html', () => {
        // Commentaires HTML retirés AVANT d'asserter : une sentinelle qui lit la
        // source ne doit pas être satisfaite par de la documentation.
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8')
            .replace(/<!--[\s\S]*?-->/g, '');

        const balise = html.match(/<textarea[^>]*id="retroactionFinale1"[^>]*>/);
        expect(balise, 'le textarea #retroactionFinale1 doit exister').not.toBe(null);
        expect(balise[0]).toContain('data-on-input="retroactionModifiee"');
    });
});
