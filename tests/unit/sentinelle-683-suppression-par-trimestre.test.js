/**
 * #683 (15 oct. 2026, décision de Grégoire à 11 h 04) — UNE SUPPRESSION DU MATÉRIEL DE DÉPART NE
 * VAUT QUE POUR SON TRIMESTRE.
 *
 * Ce que le banc verrouille :
 *   A. la marque se pose dans la clé du trimestre actif, pas dans l'ancienne globale ;
 *   B. un autre trimestre ne la voit pas ;
 *   C. l'ancienne marque globale est LUE (portée de tous les trimestres) et jamais réécrite ;
 *   D. un `GABARIT_*` (bibliothèque globale) garde une marque globale : supprimé dans un
 *      trimestre, il ne revient pas après une bascule, par le vrai semeur de gabarits-utils.js ;
 *   E. sans trimestre connu (garde de boot #358), la marque reste durable, et ça se dit ;
 *   F. la bascule sème grille, échelle, cartouche dans cet ordre, grille et échelle abstenues
 *      en trimestre archivé ; changerTrimestreActifV2 l'appelle.
 * Aucun nom d'élève.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const NOM = 'ressourcesSupprimeesTrimestre';

function monter(store, etat) {
    const ecrites = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecrites.push(k); store[k] = clone(v); }
    };
    const w = { cle: (k) => (etat.trim ? etat.trim + '_' + k : k) };
    new Function('window', 'db', tranche(source('js/main.js'),
        'const CLE_RESSOURCES_SUPPRIMEES_TRIMESTRE', '// IDs des gabarits hardcodés', { longueurMin: 400 }))(w, db);
    return { w, db, ecrites };
}

describe('#683 · la marque d\'une suppression suit le trimestre', () => {
    it('A + B · posée dans la clé du trimestre, invisible d\'un autre trimestre', () => {
        const store = {}; const etat = { trim: 'a2026' };
        const { w, ecrites } = monter(store, etat);
        w.marquerRessourceSupprimee('GRILLE_GENERIQUE');
        expect(ecrites).toEqual(['a2026_' + NOM]);
        expect(store['a2026_' + NOM]).toEqual(['GRILLE_GENERIQUE']);
        expect('ressourcesSupprimees' in store).toBe(false);
        expect(w.estRessourceSupprimee('GRILLE_GENERIQUE')).toBe(true);
        etat.trim = 'h2027';
        expect(w.estRessourceSupprimee('GRILLE_GENERIQUE')).toBe(false);
    });

    it('C · l\'ancienne marque globale garde sa portée, sans être réécrite', () => {
        const store = { ressourcesSupprimees: ['ECHELLE_IDME_DEPART'] }; const etat = { trim: 'a2026' };
        const { w, ecrites } = monter(store, etat);
        expect(w.estRessourceSupprimee('ECHELLE_IDME_DEPART')).toBe(true);
        etat.trim = 'h2027';
        expect(w.estRessourceSupprimee('ECHELLE_IDME_DEPART')).toBe(true);
        w.marquerRessourceSupprimee('ECHELLE_IDME_DEPART');   // déjà couverte : la marque du trimestre s'y ajoute
        expect(store.ressourcesSupprimees).toEqual(['ECHELLE_IDME_DEPART']);
        expect(ecrites).not.toContain('ressourcesSupprimees');
    });

    it('D · un GABARIT_* garde une marque globale et ne revient pas après une bascule', () => {
        const store = { bibliothequeGrilles: [] }; const etat = { trim: 'a2026' };
        const { w, db } = monter(store, etat);
        w.marquerRessourceSupprimee('GABARIT_GRILLE_ANALYTIQUE');
        expect(store.ressourcesSupprimees).toEqual(['GABARIT_GRILLE_ANALYTIQUE']);
        expect(('a2026_' + NOM) in store).toBe(false);
        etat.trim = 'h2027';   // la bascule
        chargerScript('js/gabarits-utils.js', { db }, w);
        w.GabaritsUtils.initialiserTousLesGabarits();
        const ids = store.bibliothequeGrilles.map((g) => g.id);
        expect(ids).not.toContain('GABARIT_GRILLE_ANALYTIQUE');
        expect(ids).toContain('GABARIT_GRILLE_CHECKLIST_SPE');   // témoin : le semeur a bien tourné
    });

    it('E · sans trimestre connu, la marque reste durable et le dit', () => {
        const store = {}; const etat = { trim: '' };
        const { w } = monter(store, etat);
        const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
        w.marquerRessourceSupprimee('CART_GENERIQUE');
        expect(store.ressourcesSupprimees).toEqual(['CART_GENERIQUE']);
        expect(NOM in store).toBe(false);
        expect(avert).toHaveBeenCalledTimes(1);
        avert.mockRestore();
    });
});

describe('#683 · la bascule sème comme le chargement', () => {
    function semer(archive) {
        const appels = [];
        const w = {
            estTrimestreArchive: () => archive,
            assurerGrilleDeDepart: async () => { appels.push('grille'); },
            assurerEchelleIdmeDeDepart: async () => { appels.push('echelle'); },
            assurerCartoucheDeDepart: async () => { appels.push('cartouche'); }
        };
        const corps = tranche(source('js/trimestre-v2-liste.js'),
            'async function semerMaterielDeDepartApresBascule', '/**', { longueurMin: 200 });
        return new Function('window', corps + '\nreturn semerMaterielDeDepartApresBascule();')(w).then(() => appels);
    }

    it('F · grille, échelle, cartouche, dans cet ordre', async () => {
        expect(await semer(false)).toEqual(['grille', 'echelle', 'cartouche']);
    });

    it('F · trimestre archivé : grille et échelle s\'abstiennent, comme au chargement', async () => {
        expect(await semer(true)).toEqual(['cartouche']);
    });

    it('F · changerTrimestreActifV2 l\'appelle, et la cartouche est exposée', () => {
        const corps = tranche(source('js/trimestre-v2-liste.js'),
            'function changerTrimestreActifV2', '// #975 (7 oct. 2026)', { longueurMin: 400 });
        expect(corps).toContain('semerMaterielDeDepartApresBascule()');
        expect(source('js/cartouches.js')).toContain('window.assurerCartoucheDeDepart = assurerCartoucheDeDepart;');
    });

    it('la clé est au registre des trimestres, à la Réserve et à DATA-OWNERSHIP', () => {
        expect(source('js/trimestres.js')).toContain(`'${NOM}',`);
        expect(source('js/reserve.js')).toContain(`'${NOM}',`);
        expect(source('docs/DATA-OWNERSHIP.md')).toContain(`<trim>_${NOM}`);
    });
});
