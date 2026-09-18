import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { globauxIdentiteNaturelle } from './_helpers/identite-naturelle.js';

// =======================================================================
// SENTINELLE #916 — un cours actif ABSENT de la bibliothèque ne fait pas
// boucler le menu Cours du Cadre
// =======================================================================
//
// Rapport de Grégoire du 18 sept. 2026 (1.144.0, trimestre a2025 archivé) :
// « Je ne suis pas capable de changer de trimestre ». Le sélecteur
// #selectTrimestreActif restait sur « Chargement... », toast rouge « Cours
// introuvable » dès l'accueil, et deux
//   RangeError: Maximum call stack size exceeded
//     at chargerDropdownCoursV2 ← changerCoursSelectionneV2 ← …
//
// Mécanisme : `infoCours` est un MIROIR fabriqué par l'orchestre à partir du
// `coursId` du groupe-cours activé, en tolérant que ce cours ne figure pas
// dans la bibliothèque globale `cours` (`coursInfo?.…`). `chargerDropdownCoursV2`
// garde EXPRÈS ce cours actif dans le menu et le sélectionne ; la garde
// #466/CT-17 de `changerCoursSelectionneV2`, qui ne résout que dans `cours`,
// le déclarait « introuvable », rechargeait le menu… qui le resélectionnait :
// récursion sans sortie. L'exception interrompait `initialiserTrimestreV2`
// AVANT `populerDropdownTrimestreV2` — d'où le sélecteur de trimestre muet.
//
// Ce qui est verrouillé ici :
//   A. le cas du rapport se termine, sans exception ;
//   B. il ne crie pas « Cours introuvable » : personne n'a cliqué une option
//      périmée, c'est l'état du trimestre ;
//   C. il n'écrit RIEN (le trimestre du rapport est archivé) ;
//   D. l'écran tombe sur l'état vide, pas sur le formulaire d'un autre cours ;
//   E. #466/CT-17 n'est pas défait : une option réellement périmée crie
//      toujours, UNE fois, et se termine ;
//   F. les deux à la fois (option périmée + cours actif hors bibliothèque) se
//      terminent aussi.

const ORPHELIN = {
    id: 'COURS1766455789356', codeCours: '', nomCours: '', groupe: '00001',
    _modeCours: false, _source: 'groupe-cours', _groupeCoursId: 'GC1'
};
const AUTRE = { id: 'a2026-601-101-MQ', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' };

function monter(storeInitial) {
    const store = JSON.parse(JSON.stringify(storeInitial));
    const ecritures = [];
    const erreurs = [];
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { ecritures.push(k); store[k] = v; }
    };
    const elements = {};
    const faireElement = () => {
        const classes = new Set();
        return {
            innerHTML: '', textContent: '', value: '', options: [], style: {}, dataset: {},
            appendChild(o) { this.options.push(o); },
            addEventListener() {}, setAttribute() {}, getAttribute: () => null,
            querySelector: () => null, querySelectorAll: () => [],
            classList: {
                add: (c) => classes.add(c), remove: (c) => classes.delete(c),
                contains: (c) => classes.has(c), toggle() {}
            }
        };
    };
    ['v2-selectCours', 'cours-etat-vide', 'cours-formulaire-edition'].forEach(id => { elements[id] = faireElement(); });
    // Départ : le formulaire d'un AUTRE cours est affiché, l'état vide caché.
    elements['cours-etat-vide'].classList.add('u-hide');
    const doc = {
        getElementById: (id) => elements[id] || null,
        createElement: () => faireElement(),
        querySelector: () => null, querySelectorAll: () => [],
        addEventListener() {}, removeEventListener() {},
        body: { addEventListener() {}, appendChild() {}, classList: { add() {}, remove() {} }, style: {} },
        documentElement: { addEventListener() {} }
    };
    const win = chargerScript('js/trimestre-v2-cours.js', {
        db,
        cle: (k) => k,
        toggleDisplay: () => {},
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { erreur: (t) => erreurs.push(t), info() {}, succes() {} },
        ...globauxIdentiteNaturelle(),
        document: doc
    });
    return { win, store, ecritures, erreurs, elements };
}

describe('#916 · un cours actif hors bibliothèque ne fait pas boucler le menu Cours', () => {

    it('A-D · le cas du rapport : se termine, ne crie pas, n\'écrit rien, montre l\'état vide', () => {
        const b = monter({ cours: [AUTRE], infoCours: ORPHELIN });
        const avant = JSON.stringify(b.store);

        expect(() => b.win.chargerDropdownCoursV2()).not.toThrow();      // A

        expect(b.erreurs).toEqual([]);                                   // B
        expect(b.ecritures).toEqual([]);                                 // C
        expect(JSON.stringify(b.store)).toBe(avant);
        expect(b.elements['cours-etat-vide'].classList.contains('u-hide')).toBe(false);          // D
        expect(b.elements['cours-formulaire-edition'].classList.contains('u-hide')).toBe(true);
        // Le menu garde le cours actif, comme avant : ce banc ne change pas ce choix.
        expect(b.elements['v2-selectCours'].options.map(o => o.value)).toContain(ORPHELIN.id);
    });

    it('A bis · même cas quand la bibliothèque est VIDE', () => {
        const b = monter({ cours: [], infoCours: ORPHELIN });
        expect(() => b.win.chargerDropdownCoursV2()).not.toThrow();
        expect(b.erreurs).toEqual([]);
    });

    it('E · #466/CT-17 tient : une option réellement périmée crie UNE fois et se termine', () => {
        const b = monter({ cours: [AUTRE], infoCours: AUTRE });
        expect(() => b.win.changerCoursSelectionneV2('id-qui-n-existe-plus')).not.toThrow();
        expect(b.erreurs).toEqual(['Cours introuvable']);
    });

    it('F · option périmée ET cours actif hors bibliothèque : se termine, crie une fois', () => {
        const b = monter({ cours: [AUTRE], infoCours: ORPHELIN });
        expect(() => b.win.changerCoursSelectionneV2('id-qui-n-existe-plus')).not.toThrow();
        expect(b.erreurs).toEqual(['Cours introuvable']);
    });
});
