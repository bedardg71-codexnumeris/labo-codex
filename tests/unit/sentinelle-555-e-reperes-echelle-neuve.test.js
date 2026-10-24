import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #555 lot 2 (e) — L'ÉCHELLE NEUVE PORTE SES REPÈRES DÈS SA CRÉATION.
//
// CE QUI MANQUAIT (mesuré le 28 août 2026). Le bloc « Repères de maîtrise » du
// lot 1 ne vivait que dans l'éditeur d'une échelle ENREGISTRÉE
// (`afficherNiveauxEchelle`) : `blocReperesEchelle` n'avait qu'un appelant.
// L'éditeur d'une échelle NEUVE (`afficherNiveauxNouvelleEchelle`) écrit dans un
// tampon avant création — il fallait enregistrer, rouvrir, puis poser les
// repères. Pour qui découvre l'outil, c'est un second geste que rien n'annonce.
//
// ⮕ CE QUE CE BANC PROUVE, EN EXÉCUTANT LE VRAI `echelles.js` :
//   · les repères d'une échelle neuve se posent dans un tampon, avec les MÊMES
//     refus que sur une échelle enregistrée — calculés par la même fonction ;
//   · le bloc n'apparaît que quand l'ordre des plages est lisible, et il vise
//     le handler du tampon, sans `data-echelle-id` ;
//   · à l'enregistrement, les repères sont REVÉRIFIÉS contre les niveaux
//     finaux (un code renommé après avoir été désigné ne part pas en base), et
//     seuls les repères posés sont écrits — jamais de clé vide ;
//   · l'aperçu est le MÊME producteur que celui de l'éditeur vivant.
//
// Fixtures sans aucune lettre d'IDME, saisies dans le désordre — comme le banc
// du lot 1, dont le montage est repris.

/** Le VRAI `ordonnerNiveauxParPlage` (#575) et le VRAI `zoneDuCodeDansNiveaux` (#555 lot 2 (b)). */
function vraisLecteurs() {
    const w = chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
    return { ordonnerNiveauxParPlage: w.ordonnerNiveauxParPlage, zoneDuCodeDansNiveaux: w.zoneDuCodeDansNiveaux };
}

const NIVEAUX = () => [
    { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
    { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
    { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
    { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
];

function monter() {
    const store = { 'a2026_echellesTemplates': [] };
    // Un DOM minimal mais PERSISTANT : chaque id rend toujours le même objet,
    // pour lire ensuite ce que le rendu y a écrit.
    const elements = {};
    const element = (id) => {
        if (!elements[id]) elements[id] = { id, value: '', innerHTML: '', classList: { add() {}, remove() {}, contains: () => false } };   // contains : #1147, le menu lit si la fiche est ouverte
        return elements[id];
    };
    const lecteurs = vraisLecteurs();
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
        alert: (m) => { globaux.alertes.push(m); }, confirm: () => true,
        alertes: [],
        prompt: (_q, defaut) => defaut || 'Copie',
        genererIdUnique: (p) => p + 'NEUVE',
        nommerCopie: (nom) => nom + ' (copie)',
        obtenirIdentiteCCUtilisateur: () => 'test',
        // #1147 : les filtres rendent la liste (le menu la parcourt) ; le reste, du vide.
        BibliothequeUI: new Proxy({}, { get: (_, nom) => (String(nom).startsWith('filtrer') ? (l) => l : () => '') }),
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        echelleTemplateActuelle: null,
        travauxOutils: { renderPickerCouleur: () => '' },
        document: {
            getElementById: element,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        },
        ordonnerNiveauxParPlage: lecteurs.ordonnerNiveauxParPlage,
        zoneDuCodeDansNiveaux: lecteurs.zoneDuCodeDansNiveaux
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    win.travauxOutils = { renderPickerCouleur: () => '' };
    win.ordonnerNiveauxParPlage = globaux.ordonnerNiveauxParPlage;
    win.zoneDuCodeDansNiveaux = globaux.zoneDuCodeDansNiveaux;
    chargerScript('js/echelles.js', globaux, win);

    // L'état d'un éditeur d'échelle neuve, niveaux saisis, aucun repère.
    win._niveauxNouvelleEchelle = NIVEAUX();
    win._reperesNouvelleEchelle = {};
    return { win, store, element, alertes: globaux.alertes };
}

describe('#555 (e) · les repères d\'une échelle NEUVE, avant enregistrement', () => {

    // ── 1. LE TAMPON ─────────────────────────────────────────────────────────

    it('pose les deux repères dans le tampon, en majuscules et sans espaces', () => {
        const { win } = monter();
        expect(win.modifierRepereTemp('seuilSuffisance', ' x ')).toEqual({ ok: true });
        expect(win.modifierRepereTemp('seuilMaitrise', 'Y')).toEqual({ ok: true });
        expect(win._reperesNouvelleEchelle).toEqual({ seuilSuffisance: 'X', seuilMaitrise: 'Y' });
    });

    it('le vide RETIRE le repère du tampon', () => {
        const { win } = monter();
        win.modifierRepereTemp('seuilMaitrise', 'Y');
        expect(win.modifierRepereTemp('seuilMaitrise', '')).toEqual({ ok: true });
        expect('seuilMaitrise' in win._reperesNouvelleEchelle).toBe(false);
    });

    it('refuse un code absent de l\'échelle neuve, et n\'écrit rien', () => {
        const { win } = monter();
        const r = win.modifierRepereTemp('seuilMaitrise', 'M');
        expect(r.refuse).toMatch(/ne fait pas partie/);
        expect(win._reperesNouvelleEchelle).toEqual({});
    });

    it('refuse la suffisance AU-DESSUS de la maîtrise, dans les deux sens', () => {
        const { win } = monter();
        win.modifierRepereTemp('seuilMaitrise', 'X');
        expect(win.modifierRepereTemp('seuilSuffisance', 'Y').refuse).toMatch(/plus haut/);
        expect('seuilSuffisance' in win._reperesNouvelleEchelle).toBe(false);

        const autre = monter();
        autre.win.modifierRepereTemp('seuilSuffisance', 'Y');
        expect(autre.win.modifierRepereTemp('seuilMaitrise', 'X').refuse).toMatch(/plus haut/);
        expect('seuilMaitrise' in autre.win._reperesNouvelleEchelle).toBe(false);
    });

    it('refuse un repère inconnu', () => {
        const { win } = monter();
        expect(win.modifierRepereTemp('seuilDeQuoi', 'Y').refuse).toMatch(/inconnu/);
    });

    // ── 2. LE RENDU ──────────────────────────────────────────────────────────

    it('rend le bloc SOUS les niveaux, visant le handler du tampon, sans data-echelle-id', () => {
        const { win, element } = monter();
        win.afficherNiveauxNouvelleEchelle();
        const html = element('tableauNiveauxEchelle').innerHTML;
        expect(html).toContain('Repères de maîtrise');
        expect(html.indexOf('Repères de maîtrise')).toBeGreaterThan(html.indexOf('data-champ="valeurCalcul"'));
        expect(html).toContain('data-on-change="modifierRepereTempHandler"');
        expect(html).not.toContain('modifierRepereEchelleHandler');
        expect(html).not.toContain('data-echelle-id');
    });

    it('ne rend PAS le bloc tant que l\'ordre des plages n\'est pas lisible', () => {
        const { win, element } = monter();
        // Les quatre niveaux par défaut d'une échelle neuve : codes vides.
        win._niveauxNouvelleEchelle = NIVEAUX().map((n) => ({ ...n, code: '' }));
        win.afficherNiveauxNouvelleEchelle();
        expect(element('tableauNiveauxEchelle').innerHTML).not.toContain('Repères de maîtrise');
    });

    it('le handler du tampon rend visible un refus, comme celui de l\'éditeur vivant', () => {
        const { win } = monter();
        const el = { dataset: { champ: 'seuilMaitrise' }, value: 'M', classList: { add() {}, remove() {}, contains: () => false }, setAttribute() {}, removeAttribute() {}, title: '' };
        win.modifierRepereTempHandler(el);
        expect(win._reperesNouvelleEchelle).toEqual({});
        el.value = 'Y';
        win.modifierRepereTempHandler(el);
        expect(win._reperesNouvelleEchelle).toEqual({ seuilMaitrise: 'Y' });
    });

    it('l\'aperçu dit la zone de chaque niveau — par le MÊME producteur que l\'éditeur vivant', () => {
        const { win, element } = monter();
        win.modifierRepereTemp('seuilSuffisance', 'X');
        win.modifierRepereTemp('seuilMaitrise', 'Y');
        const apercuNeuve = element('apercuEchelleNiveaux').innerHTML;
        expect(apercuNeuve).toContain('à travailler');
        expect(apercuNeuve).toContain('suffisant');
        expect(apercuNeuve).toContain('maîtrisé');

        // Même échelle, enregistrée : même aperçu, au caractère près.
        const enregistree = { id: 'ECH_X', niveaux: NIVEAUX(), seuilSuffisance: 'X', seuilMaitrise: 'Y' };
        win.afficherNiveauxEchelle(enregistree);
        expect(element('apercuEchelleNiveaux').innerHTML).toBe(apercuNeuve);
    });

    // ── 3. L'ENREGISTREMENT ──────────────────────────────────────────────────

    it('écrit les deux repères sur l\'échelle créée', async () => {
        const { win, store, element } = monter();
        element('nomEchelleTemplate').value = 'Cotation W-X-Y-Z';
        win.modifierRepereTemp('seuilSuffisance', 'X');
        win.modifierRepereTemp('seuilMaitrise', 'Y');
        await win.sauvegarderEchelleComplete();
        const creee = store['a2026_echellesTemplates'][0];
        expect(creee.nom).toBe('Cotation W-X-Y-Z');
        expect(creee.seuilSuffisance).toBe('X');
        expect(creee.seuilMaitrise).toBe('Y');
        expect(win._reperesNouvelleEchelle).toBeNull();
    });

    it('sans repère posé, n\'écrit AUCUNE clé de repère — l\'absence reste l\'absence', async () => {
        const { win, store, element } = monter();
        element('nomEchelleTemplate').value = 'Sans repères';
        await win.sauvegarderEchelleComplete();
        const creee = store['a2026_echellesTemplates'][0];
        expect('seuilSuffisance' in creee).toBe(false);
        expect('seuilMaitrise' in creee).toBe(false);
    });

    it('refuse d\'enregistrer si un code désigné a été renommé depuis — et le dit', async () => {
        const { win, store, element, alertes } = monter();
        element('nomEchelleTemplate').value = 'Renommée';
        win.modifierRepereTemp('seuilMaitrise', 'Y');
        // L'utilisateur renomme ensuite le niveau Y en Q : le repère pointe dans le vide.
        win.modifierNiveauTemp(0, 'code', 'Q');
        expect(win.reperesNouvelleEchellePourEnregistrement().refuse).toMatch(/Maîtrisé à partir de.*ne fait pas partie/);

        await win.sauvegarderEchelleComplete();
        expect(store['a2026_echellesTemplates']).toEqual([]);
        expect(alertes.some((m) => /Repères de maîtrise/.test(m))).toBe(true);
    });

    it('annuler vide le tampon des repères avec celui des niveaux', () => {
        const { win } = monter();
        win.modifierRepereTemp('seuilMaitrise', 'Y');
        win.annulerFormEchelle();
        expect(win._reperesNouvelleEchelle).toBeNull();
        expect(win._niveauxNouvelleEchelle).toBeNull();
    });
});
