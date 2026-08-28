import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #555 (28 août 2026) — LES DEUX REPÈRES DE MAÎTRISE D'UNE ÉCHELLE.
//
// CE QUI MANQUAIT. Le code demandait « ce critère est-il un défi ? » et « tous
// les critères sont-ils maîtrisés ? » en testant les codes EN TOUTES LETTRES —
// `=== 'I' || === 'D'`, `=== 'M' || === 'E'` — à quatorze endroits du seul
// module de synthèse, dix-huit de plus dans le bilan à l'écran. Ces réponses ne
// valent que sur l'échelle IDME de Grégoire ; ailleurs elles ne veulent rien
// dire. Un niveau portait code, nom, description, SOLO, plage, valeur ponctuelle
// et couleur — jamais « à partir d'ici, c'est acquis ».
//
// ⮕ DEUX REPÈRES, ET NON UN — décision de Grégoire, 28 août 2026. Sa gradation
// PAN-Standards distingue TROIS états : insuffisant / réel mais non durable /
// acquis. Une seule frontière aurait forcé « en développement » dans l'une ou
// l'autre case, et la rétroaction remise à l'élève aurait dit autre chose que
// ce qu'il pense.
//
// ⮕ CE BANC EXÉCUTE LES REFUS, il ne cherche pas des chaînes dans un fichier :
// c'est la leçon de #524, où une validation existait bel et bien — sur un
// chemin mort. Montage repris de cette sentinelle-là.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js/echelles.js'), 'utf8');

// L'échelle du test n'a AUCUNE lettre d'IDME, et elle est saisie dans le
// désordre : c'est le seul montage qui distingue « l'ordre des plages » de
// « l'ordre de saisie ».
const ECHELLE = () => [{
    id: 'ECH_TEST_555',
    nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80 },
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30 },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95 },
        { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60 }
    ]
}];

/** Le VRAI `ordonnerNiveauxParPlage`, extrait de #575 — jamais une doublure. */
function vraiOrdonnerNiveaux() {
    const w = chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
    return w.ordonnerNiveauxParPlage;
}

function monter({ echelles = ECHELLE() } = {}) {
    const store = { 'a2026_echellesTemplates': echelles };
    const globaux = {
        db: {
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        alert: () => {}, confirm: () => true,
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        echelleTemplateActuelle: null,
        travauxOutils: { renderPickerCouleur: () => '' },
        document: {
            getElementById: (id) => (
                ['tableauNiveauxEchelle', 'apercuEchelleNiveaux'].includes(id)
                    ? { innerHTML: '', classList: { add() {}, remove() {} } }
                    : null
            ),
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        },
        // Le vrai lecteur d'ordre, chargé à part : la règle des plages ne doit
        // exister qu'à UN endroit, et ce banc le vérifie en la consommant.
        ordonnerNiveauxParPlage: vraiOrdonnerNiveaux()
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    win.travauxOutils = { renderPickerCouleur: () => '' };
    win.ordonnerNiveauxParPlage = globaux.ordonnerNiveauxParPlage;
    chargerScript('js/echelles.js', globaux, win);
    return { win, store };
}

const echelleEnBase = (store) => store['a2026_echellesTemplates'][0];

describe('#555 · une échelle porte ses deux repères de maîtrise', () => {

    // ── 1. CE QUI EST ACCEPTÉ ────────────────────────────────────────────────

    it('enregistre les deux repères, en majuscules et sans espaces', async () => {
        const { win, store } = monter();
        expect(await win.modifierRepereEchelle('ECH_TEST_555', 'seuilSuffisance', ' x ')).toEqual({ ok: true });
        expect(await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'Y')).toEqual({ ok: true });

        expect(echelleEnBase(store).seuilSuffisance).toBe('X');
        expect(echelleEnBase(store).seuilMaitrise).toBe('Y');
    });

    it('accepte les DEUX repères sur le même niveau — c\'est le modèle à une frontière', async () => {
        const { win, store } = monter();
        await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'Y');
        expect(await win.modifierRepereEchelle('ECH_TEST_555', 'seuilSuffisance', 'Y')).toEqual({ ok: true });
        expect(echelleEnBase(store).seuilSuffisance).toBe('Y');
    });

    it('le vide RETIRE le repère au lieu d\'écrire une chaîne creuse', async () => {
        // Une clé présente et vide se lit « défini », et c'est faux.
        const { win, store } = monter();
        await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'Y');
        expect(await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', '')).toEqual({ ok: true });
        expect('seuilMaitrise' in echelleEnBase(store)).toBe(false);
    });

    // ── 2. CE QUI EST REFUSÉ ─────────────────────────────────────────────────

    it('refuse un code qui n\'est pas dans l\'échelle', async () => {
        const { win, store } = monter();
        const r = await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'M');
        expect(r.refuse).toMatch(/ne fait pas partie/);
        expect('seuilMaitrise' in echelleEnBase(store)).toBe(false);
    });

    it('refuse une suffisance PLUS HAUTE que la maîtrise', async () => {
        // Sinon un élève serait « acquis » sans être « suffisant » : la
        // rétroaction se contredirait sur le même écran.
        const { win, store } = monter();
        await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'X');
        const r = await win.modifierRepereEchelle('ECH_TEST_555', 'seuilSuffisance', 'Z');
        expect(r.refuse).toMatch(/ne peut pas être plus haut/);
        expect('seuilSuffisance' in echelleEnBase(store)).toBe(false);
    });

    it('refuse dans l\'AUTRE sens aussi — une maîtrise plus basse que la suffisance', async () => {
        const { win, store } = monter();
        await win.modifierRepereEchelle('ECH_TEST_555', 'seuilSuffisance', 'Y');
        const r = await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'W');
        expect(r.refuse).toMatch(/ne peut pas être plus haut/);
        expect('seuilMaitrise' in echelleEnBase(store)).toBe(false);
    });

    it('refuse quand l\'ordre des plages n\'est pas lisible — il ne le devine pas', async () => {
        // Bornes manquantes : aucun rang, donc aucune garantie possible. Le
        // projet interdit de trancher à la place de l'utilisateur.
        const { win, store } = monter({ echelles: [{
            id: 'ECH_SANS_BORNES', nom: 'Sans bornes',
            niveaux: [{ code: 'A', nom: 'Un' }, { code: 'B', nom: 'Deux' }]
        }] });
        const r = await win.modifierRepereEchelle('ECH_SANS_BORNES', 'seuilMaitrise', 'B');
        expect(r.refuse).toMatch(/n'est pas lisible/);
        expect('seuilMaitrise' in echelleEnBase(store)).toBe(false);
    });

    // ── 3. L'ORDRE VIENT DES PLAGES ──────────────────────────────────────────

    it('l\'ordre comparé est celui des PLAGES, pas celui de la saisie', async () => {
        // L'échelle est saisie Y, W, Z, X. Lue par les plages : W < X < Y < Z.
        // Si l'ordre de saisie tranchait, « W après Y » passerait.
        const { win } = monter();
        await win.modifierRepereEchelle('ECH_TEST_555', 'seuilMaitrise', 'Y');
        const r = await win.modifierRepereEchelle('ECH_TEST_555', 'seuilSuffisance', 'Z');
        expect(r.refuse).toMatch(/ne peut pas être plus haut/);
    });

    it('les options du sélecteur suivent l\'ordre des plages', async () => {
        const { win, store } = monter();
        const html = win.optionsRepereEchelle(echelleEnBase(store), 'seuilMaitrise');
        const codes = [...html.matchAll(/value="([^"]*)"/g)].map((m) => m[1]);
        expect(codes).toEqual(['', 'W', 'X', 'Y', 'Z']);
    });

    // ── 4. AUCUNE VALEUR DEVINÉE ─────────────────────────────────────────────

    it('une échelle sans repères en reste sans — rien n\'est deviné à sa place', async () => {
        const { store } = monter();
        expect('seuilSuffisance' in echelleEnBase(store)).toBe(false);
        expect('seuilMaitrise' in echelleEnBase(store)).toBe(false);
    });

    it('aucun code IDME n\'est écrit en dur dans le mécanisme des repères', () => {
        // Le corps exécutable du bloc #555 seul : le reste d'`echelles.js`
        // contient l'échelle IDME par défaut, qui est une DONNÉE, pas une règle.
        const bloc = source.slice(
            source.indexOf('const REPERES_ECHELLE'),
            source.indexOf('async function modifierNiveauEchelle(')
        );
        expect(bloc.length).toBeGreaterThan(500);
        const codeSeul = bloc
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
        expect(codeSeul).not.toMatch(/['"][IDME]['"]/);
    });

    // ── 5. SÉCURITÉ ──────────────────────────────────────────────────────────

    it('un nom de niveau hostile ne sort pas brut dans les options', async () => {
        const { win } = monter({ echelles: [{
            id: 'ECH_HOSTILE', nom: 'Hostile',
            niveaux: [{ code: 'A', nom: '<img src=x onerror=alert(1)>', min: 0, max: 100 }]
        }] });
        const html = win.optionsRepereEchelle({
            id: 'ECH_HOSTILE',
            niveaux: [{ code: 'A', nom: '<img src=x onerror=alert(1)>', min: 0, max: 100 }]
        }, 'seuilMaitrise');
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });
});
