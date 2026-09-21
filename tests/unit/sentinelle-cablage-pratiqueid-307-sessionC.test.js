import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C — câblage Lot 2 (#307). obtenirConfigPratiqueActive(pratiqueId) résout la
// config d'une pratique DEMANDÉE (simulation) sans toucher l'état global ; sans argument
// ⇒ pratique active du groupe-cours (invariant). C'est le pivot qui rend
// calculerDetailsNoteFinale(da, pratiqueId) réellement paramétrable : la note finale
// dérive de cette config (nombreARetenir, méthode de sélection, catégories). Avant ce
// câblage, le paramètre ne pilotait que le NOM affiché, pas le calcul.

const CONFIG_A = { portfolio: { nombreARetenir: 3, methodeSelection: 'meilleurs' } };
const CONFIG_B = { portfolio: { nombreARetenir: 5, methodeSelection: 'recents' }, categories: { actif: true } };

const store = {
    pratiquesConfigurables: [
        { id: 'prat-A', configuration: CONFIG_A },
        { id: 'prat-B', configuration: CONFIG_B }
    ]
};
const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: () => {}, get: async () => null, set: async () => {}
};
const cle = (k) => k;
// Pratique active du groupe-cours = 'prat-A' (résolution injectée).
const obtenirPratiqueActiveGroupeCours = () => 'prat-A';

let win;
beforeAll(() => {
    // Lot N1a (21 sept. 2026) : la configuration se lit par la désignation du registre RÉEL
    // (`trouverPratiqueEnBibliotheque`, `designerPratiqueActive`), sur le pointeur du groupe-cours.
    const registre = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    registre.lirePointeurPratiqueGroupeCours = () => 'prat-A';
    win = chargerScript('js/portfolio.js', { db, cle, obtenirPratiqueActiveGroupeCours,
        trouverPratiqueEnBibliotheque: registre.trouverPratiqueEnBibliotheque, designerPratiqueActive: registre.designerPratiqueActive });
});

describe('Session C Lot 2 · câblage pratiqueId → config (#307)', () => {
    it('expose obtenirConfigPratiqueActive / obtenirConfigCategories', () => {
        expect(typeof win.obtenirConfigPratiqueActive).toBe('function');
        expect(typeof win.obtenirConfigCategories).toBe('function');
    });

    it('pratique DEMANDÉE → SA config (simulation)', () => {
        expect(win.obtenirConfigPratiqueActive('prat-B').portfolio.nombreARetenir).toBe(5);
        expect(win.obtenirConfigPratiqueActive('prat-A').portfolio.nombreARetenir).toBe(3);
    });

    it('sans argument → config de la pratique ACTIVE (invariant)', () => {
        expect(win.obtenirConfigPratiqueActive().portfolio.nombreARetenir).toBe(3); // active = prat-A
    });

    it('deux pratiques ⇒ deux configs distinctes (déverrouillage #307)', () => {
        // La config — donc la future note finale — varie selon la pratique demandée,
        // là où avant tout passait par l'active. Preuve que le verrou est levé.
        const a = win.obtenirConfigPratiqueActive('prat-A').portfolio;
        const b = win.obtenirConfigPratiqueActive('prat-B').portfolio;
        expect(a.nombreARetenir).not.toBe(b.nombreARetenir);
        expect(a.methodeSelection).not.toBe(b.methodeSelection);
    });

    it('obtenirConfigCategories suit la pratique demandée', () => {
        expect(win.obtenirConfigCategories('prat-B')).toEqual(CONFIG_B.categories); // actif:true
        expect(win.obtenirConfigCategories('prat-A')).toBeNull();                   // pas de catégories
        expect(win.obtenirConfigCategories()).toBeNull();                          // active = A → null
    });

    it('pratique demandée inconnue → null (pas de repli silencieux sur l\'active)', () => {
        // Sinon la simulation mentirait en affichant la note de l'active sous un autre nom.
        expect(win.obtenirConfigPratiqueActive('prat-inexistante')).toBeNull();
    });
});
