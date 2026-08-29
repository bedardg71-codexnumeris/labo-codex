import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #578 (29 août 2026) — LA CARTOUCHE NEUVE NE DEVINE PLUS SON ÉCHELLE.
//
// Arbitrage de Grégoire (option A), après mesure sur ses trois trimestres :
// 10 grilles, 9 sans `echelleId`. La grille dit les CRITÈRES ; l'échelle se
// choisit là où on s'en sert. Jusqu'ici `initialiserNouveauCartouche` prenait
// `echelles.find(e => !e.estDemo) || echelles[0]` — un ordre de tableau — et
// n'écrivait aucun `echelleId` : la cartouche neuve portait les colonnes de la
// PREMIÈRE échelle du trimestre, quoi qu'on ait choisi.
//
// Ce banc tient quatre bords :
//   A — sans échelle choisie : aucune colonne, `echelleId` vide, et la matrice
//       le DIT (pas un tableau à une colonne, pas un NaN dans les métriques) ;
//   B — avec une échelle choisie qui n'est PAS la première : ses niveaux à elle,
//       et son `echelleId` ÉCRIT sur la cartouche ;
//   C — une échelle désignée par `idOriginal` est résolue comme ailleurs ;
//   D — CLIQUET : chaque `data-on-change` du formulaire de cartouche dans
//       index.html résout vers une fonction que le module pose sur `window`.
//       Le 26 août (`e50155e0`), les deux listes avaient reçu des noms que rien
//       ne définissait : elles étaient MORTES, avec un `console.warn` pour seul
//       symptôme. Sans D, l'option A rendrait une matrice toujours vide.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

/* ------------------------------------------------------------------ harnais */

function elementFictif(valeur = '') {
    return {
        value: valeur, innerHTML: '', textContent: '', checked: false, disabled: false,
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        querySelectorAll: () => [], querySelector: () => null,
        appendChild() {}, addEventListener() {}, focus() {}, closest: () => null
    };
}

const ECH_1 = { id: 'ECH_1', nom: 'Première du trimestre', niveaux: [
    { code: 'W', nom: 'Amorce' }, { code: 'Y', nom: 'Consolidé' }
] };
const ECH_2 = { id: 'ECH_2', nom: 'Seconde', niveaux: [
    { code: 'P', nom: 'Piètre' }, { code: 'Q', nom: 'Quelconque' }, { code: 'R', nom: 'Remarqué' }
] };
const ECH_3 = { id: 'ECH_3', idOriginal: 'ORIG_9', nom: 'Importée', niveaux: [
    { code: 'K', nom: 'Kappa' }
] };

function monter({ echelleChoisie = '' } = {}) {
    const store = {
        'cartouches_G1': [],
        'a2026_echellesTemplates': [ECH_1, ECH_2, ECH_3],
        'a2026_grillesTemplates': [{
            id: 'G1', nom: 'Grille du test',
            criteres: [{ id: 'CR_1', nom: 'Analyse' }, { id: 'CR_2', nom: 'Rigueur' }]
        }]
    };
    const els = {};
    const doc = {
        getElementById: (id) => (els[id] || (els[id] = elementFictif())),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        createElement: () => elementFictif()
    };
    els['selectGrilleRetroaction'] = elementFictif('G1');
    els['selectEchelleCartouche'] = elementFictif(echelleChoisie);

    const globaux = {
        db: {
            get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        genererIdUnique: (p) => p + 'x',
        obtenirIdentiteCCUtilisateur: () => 'Testeur',
        GabaritsUtils: new Proxy({}, { get: () => (() => []) }),
        BibliothequeUI: new Proxy({}, { get: (c, nom) => (nom === 'filtrerParModeDemo' ? ((x) => x || []) : (() => '')) }),
        cartoucheActuel: null,
        document: doc
    };
    const win = chargerScript('js/cartouches.js', globaux);
    return { win, store, els };
}

function texteMetriquesSansNaN(els) {
    return Object.values(els).every(e => !String(e.textContent).includes('NaN') && !String(e.innerHTML).includes('NaN'));
}

/* ----------------------------------------------------------------------- A */

describe('#578 · A — sans échelle choisie, la cartouche neuve n\'invente aucune colonne', () => {
    it('niveaux vides, echelleId vide, et la matrice dit pourquoi', async () => {
        const { win, els } = monter({ echelleChoisie: '' });
        await win.ajouterCartoucheAGrille('G1');

        const c = win.cartoucheActuel;
        expect(c).toBeTruthy();
        expect(c.grilleId).toBe('G1');
        expect(c.niveaux).toEqual([]);
        expect(c.echelleId).toBe('');
        // Jamais les colonnes de la PREMIÈRE échelle du trimestre.
        expect(JSON.stringify(c.niveaux)).not.toContain('"W"');

        const matrice = els['matriceContainer'].innerHTML;
        expect(matrice).toContain('pas encore d\'échelle');
        expect(matrice).not.toContain('<table');
        expect(texteMetriquesSansNaN(els)).toBe(true);
    });

    it('le formulaire reflète l\'absence : liste d\'échelle sans option marquée', async () => {
        const { win, els } = monter({ echelleChoisie: '' });
        await win.ajouterCartoucheAGrille('G1');
        // populerDropdownsCartouche a régénéré les options sans en marquer aucune.
        expect(els['selectEchelleCartouche'].innerHTML).toContain('<option value="">-- Échelle --</option>');
        expect(els['selectEchelleCartouche'].innerHTML).not.toContain(' selected');
        expect(els['selectGrilleCartouche'].innerHTML).toMatch(/value="G1"\s+selected/);
    });
});

/* ----------------------------------------------------------------------- B */

describe('#578 · B — avec une échelle choisie, ce sont SES niveaux, et son id est écrit', () => {
    it('la seconde échelle du trimestre, pas la première', async () => {
        const { win, els } = monter({ echelleChoisie: 'ECH_2' });
        await win.ajouterCartoucheAGrille('G1');

        const c = win.cartoucheActuel;
        expect(c.echelleId).toBe('ECH_2');
        expect(c.niveaux.map(n => n.code)).toEqual(['P', 'Q', 'R']);

        const matrice = els['matriceContainer'].innerHTML;
        expect(matrice).toContain('<table');
        expect(matrice).toContain('CR_1_P');
        expect(matrice).not.toContain('CR_1_W');
        expect(els['selectEchelleCartouche'].innerHTML).toMatch(/value="ECH_2"\s+selected/);
    });
});

/* ----------------------------------------------------------------------- C */

describe('#578 · C — une échelle désignée par idOriginal est résolue', () => {
    it('ORIG_9 → ECH_3, et c\'est l\'id canonique qui est écrit', async () => {
        const { win } = monter({ echelleChoisie: 'ORIG_9' });
        await win.ajouterCartoucheAGrille('G1');
        const c = win.cartoucheActuel;
        expect(c.echelleId).toBe('ECH_3');
        expect(c.niveaux.map(n => n.code)).toEqual(['K']);
    });

    it('un id qui ne résout nulle part ne fabrique rien', async () => {
        const { win, els } = monter({ echelleChoisie: 'FANTOME' });
        await win.ajouterCartoucheAGrille('G1');
        expect(win.cartoucheActuel.niveaux).toEqual([]);
        expect(win.cartoucheActuel.echelleId).toBe('');
        expect(els['matriceContainer'].innerHTML).toContain('pas encore d\'échelle');
    });
});

/* ----------------------------------------------------------------------- D */

describe('#578 · D — cliquet : les listes du formulaire de cartouche sont branchées', () => {
    it('chaque data-on-change du bloc infoCartouche résout vers une fonction posée sur window', () => {
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        const debut = html.indexOf('id="infoCartouche"');
        const fin = html.indexOf('id="matriceRetroaction"', debut);
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        const bloc = html.slice(debut, fin);
        const noms = [...bloc.matchAll(/data-on-change="([^"]+)"/g)].map(m => m[1]);
        // Garde anti-silence : le bloc porte bien les deux listes grille + échelle.
        expect(noms.length).toBeGreaterThanOrEqual(2);

        const { win } = monter();
        const morts = noms.filter(nom => typeof win[nom] !== 'function');
        expect(morts, 'data-on-change sans fonction sur window (le dispatcher ne fera que console.warn) : ' + morts.join(', ')).toEqual([]);
    });
});
