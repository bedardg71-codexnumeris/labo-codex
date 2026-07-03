import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Lot frictions vague 2 (2 juillet 2026) — #355 + #305.
//
// #355 — navigation élève en consultation : desactiverFormulaireEvaluation
// désactivait `selectEtudiantEval` → impossible de passer à l'élève suivant·e
// dans une évaluation verrouillée/archivée. Contrat : le sélecteur d'élève est
// de la NAVIGATION, jamais désactivé ; les autres contrôles le restent.
//
// #305 — a11y : le popup d'aide « Conseil » (afficherPopupPrimo) n'avait ni
// role="dialog", ni nom accessible, ni gestion du focus (la modale sœur
// afficherAideContextuelle avait été corrigée le 19 juin, pas lui).
// Sentinelle STATIQUE (le popup ne s'ouvre que par délégation d'événement,
// non déclenchable en sandbox) : les attributs et le retour de focus doivent
// être présents dans la source.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function fauxElement(id) {
    return {
        id,
        disabled: false,
        value: '',
        textContent: '',
        style: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null,
        addEventListener() {}, appendChild() {},
        querySelector: () => null, querySelectorAll: () => []
    };
}

describe('#355 · desactiverFormulaireEvaluation — le sélecteur d\'élève reste navigable', () => {
    it('verrouiller le formulaire ne désactive PAS selectEtudiantEval (mais bien les autres)', () => {
        const elements = new Map();
        const fauxDocument = {
            getElementById: (id) => {
                if (!elements.has(id)) elements.set(id, fauxElement(id));
                return elements.get(id);
            },
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener() {},
            body: fauxElement('body'),
            createElement: () => fauxElement('cree')
        };

        const win = chargerScript('js/evaluation.js', {
            document: fauxDocument,
            db: { getSync: () => null, setSync() {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: () => []
        }, { addEventListener() {}, removeEventListener() {} });

        win.desactiverFormulaireEvaluation(true);

        expect(elements.get('selectEtudiantEval')?.disabled || false).toBe(false); // navigation préservée
        expect(elements.get('selectProduction1').disabled).toBe(true);            // édition bien verrouillée
        expect(elements.get('selectGrille1').disabled).toBe(true);
        expect(elements.get('retroactionFinale1').disabled).toBe(true);
    });
});

describe('#305 · popup « Conseil » (Primo) — nom accessible + focus (sentinelle statique)', () => {
    const source = readFileSync(path.join(racine, 'js', 'accompagnement.js'), 'utf8');
    const blocPrimo = source.slice(
        source.indexOf('function afficherPopupPrimo'),
        source.indexOf('function fermerPopup()')
    );

    it('afficherPopupPrimo pose role="dialog" + aria-modal + aria-labelledby', () => {
        expect(blocPrimo).toContain("setAttribute('role', 'dialog')");
        expect(blocPrimo).toContain("setAttribute('aria-modal', 'true')");
        expect(blocPrimo).toContain("setAttribute('aria-labelledby', 'primo-popup-titre')");
        expect(blocPrimo).toContain('id="primo-popup-titre"'); // la cible du labelledby existe
    });

    it('le focus va au bouton Fermer à l\'ouverture et REVIENT au déclencheur à la fermeture', () => {
        expect(blocPrimo).toContain('_declencheur = document.activeElement');
        expect(blocPrimo).toMatch(/btnFermer\.focus\(\)/);
        expect(blocPrimo).toMatch(/declencheur\.focus === 'function'\) declencheur\.focus\(\)/);
    });
});
