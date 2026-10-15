import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #577 — L'ASSISTANT DE CONFIGURATION POSE LES DEUX REPÈRES DE
// MAÎTRISE DE L'ÉCHELLE CHOISIE.
//
// CE QUI MANQUAIT (mesuré le 28 août 2026). L'étape « Échelle de performance »
// faisait choisir une échelle et passait à la suite. Or c'est le seul moment où
// l'utilisateur pense sa pratique — et le seul où l'on peut lui demander où
// commence la maîtrise sans que la question tombe de nulle part. Sans repères,
// la rétroaction remise à l'élève ne nomme ni priorités ni acquis (#555).
//
// ⮕ DÉCISION DE GRÉGOIRE (28 août 2026, arbitrage A3, option A) : les repères se
// posent DANS L'ASSISTANT, et restent modifiables ensuite dans le gabarit de
// l'échelle. Ce banc exécute le VRAI wizard avec le VRAI echelles.js dans le
// même bac à sable : le bloc rendu est celui de l'éditeur, l'écriture est la
// même transaction, le refus est le même.
//
// ⚠ VOCABULAIRE : cette étape ne dit jamais « seuil » — le mot est pris par le
// dépistage (`seuils-personnels`). Une assertion le garde.

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

// Aucune lettre d'IDME, saisie dans le désordre.
const ECHELLE = (extra = {}) => ({
    id: 'ECH_577',
    nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
        { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
    ],
    ...extra
});

const texteVisible = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function monter({ echelles = [ECHELLE()] } = {}) {
    const store = { 'a2026_echellesTemplates': echelles, 'a2026_pratiquesConfigurables': [] };
    const elements = {};
    const element = (id) => {
        if (!elements[id]) {
            elements[id] = {
                id, value: '', innerHTML: '', textContent: '', style: {},
                classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
                // bloc 3 (15 oct. 2026) : le titre de l'étape porte sa bulle
                setAttribute() {}, removeAttribute() {}
            };
        }
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
        alert: () => {}, confirm: () => true, prompt: (_q, d) => d || 'Copie',
        genererIdUnique: (p) => p + 'X', nommerCopie: (n) => n + ' (copie)',
        obtenirIdentiteCCUtilisateur: () => 'test',
        BibliothequeUI: new Proxy({}, { get: () => (() => '') }),
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        echelleTemplateActuelle: null,
        travauxOutils: { renderPickerCouleur: () => '' },
        toggleDisplay: () => {},
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
    win.toggleDisplay = globaux.toggleDisplay;
    chargerScript('js/echelles.js', globaux, win);
    // #910 : la liste des échelles lit le prédicat de la question d'adoption, que
    // index.html charge avant l'assistant. Le vrai, pas un stub.
    chargerScript('js/pratiques-bibliotheque.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);

    win.wizardState.reponses = { typePratique: 'standards', approcheEvaluation: 'par-artefacts', nom: 'Test' };
    win.wizardState.etapeActuelle = 'echelle-performance';
    win.wizardState.historique = [];
    return { win, store, element };
}

const etape = (win) => win.genererContenuEtape(win.ETAPES_WIZARD['echelle-performance']);
const enBase = (store) => store['a2026_echellesTemplates'][0];

describe('#577 · l\'assistant pose les repères de maîtrise de l\'échelle choisie', () => {

    it('l\'étape porte le bloc des repères APRÈS la liste des échelles, et la liste rafraîchit l\'étape', () => {
        const { win } = monter();
        const champs = win.ETAPES_WIZARD['echelle-performance'].champs.map((c) => c.type);
        expect(champs).toEqual(['select-echelle', 'reperes-echelle']);
        expect(win.ETAPES_WIZARD['echelle-performance'].champs[0].rafraichir).toBe(true);
        expect(etape(win)).toContain('data-on-change="wizardV2RafraichirEtapeCourante"');
    });

    it('sans échelle choisie, aucun bloc : les repères désignent des niveaux d\'une échelle', () => {
        const { win } = monter();
        expect(etape(win)).not.toContain('Repères de maîtrise');
    });

    it('échelle choisie SANS repères : le bloc de l\'éditeur, son handler, et l\'avertissement', () => {
        const { win } = monter();
        win.wizardState.reponses.echelleId = 'ECH_577';
        const html = etape(win);
        expect(html).toContain('Repères de maîtrise');
        expect(html).toContain('data-on-change="wizardV2ModifierRepereEchelle"');
        expect(html).toContain('data-echelle-id="ECH_577"');
        expect(html).not.toContain('modifierRepereEchelleHandler');
        // Les deux listes, dans l'ordre des PLAGES.
        expect((html.match(/data-champ="seuilSuffisance"/g) || []).length).toBe(1);
        expect((html.match(/data-champ="seuilMaitrise"/g) || []).length).toBe(1);
        expect(html.indexOf('value="W"')).toBeLessThan(html.indexOf('value="X"'));
        // L'avertissement dit ce que l'absence coûte, et où poser plus tard.
        const texte = texteVisible(html);
        expect(texte).toContain('Sans ces deux repères');
        expect(texte).toContain('Conception → Échelles de performance');
        // Le bloc vient après la liste des échelles.
        expect(html.indexOf('Repères de maîtrise')).toBeGreaterThan(html.indexOf('name="echelleId"'));
    });

    it('ne dit jamais « seuil » à l\'écran — le mot appartient au dépistage', () => {
        const { win } = monter();
        win.wizardState.reponses.echelleId = 'ECH_577';
        expect(texteVisible(etape(win))).not.toMatch(/seuil/i);
    });

    it('échelle choisie AVEC repères : les listes les montrent, pas d\'avertissement, l\'aperçu dit les zones', () => {
        const { win } = monter({ echelles: [ECHELLE({ seuilSuffisance: 'X', seuilMaitrise: 'Y' })] });
        win.wizardState.reponses.echelleId = 'ECH_577';
        const html = etape(win);
        expect(html).toMatch(/value="X" selected/);
        expect(html).toMatch(/value="Y" selected/);
        const texte = texteVisible(html);
        expect(texte).not.toContain('Sans ces deux repères');
        expect(texte).toContain('à travailler');
        expect(texte).toContain('suffisant');
        expect(texte).toContain('maîtrisé');
    });

    it('échelle dont l\'ordre des plages n\'est pas lisible : renvoi à l\'éditeur, pas de liste', () => {
        const { win } = monter({ echelles: [ECHELLE({ niveaux: [{ code: '', nom: 'A', min: 0 }, { code: '', nom: 'B', min: 50 }] })] });
        win.wizardState.reponses.echelleId = 'ECH_577';
        const html = etape(win);
        expect(html).not.toContain('data-champ="seuilMaitrise"');
        expect(texteVisible(html)).toContain('n\'est pas lisible');
        expect(texteVisible(html)).toContain('Conception → Échelles de performance');
    });

    it('le handler ÉCRIT le repère sur l\'échelle, par la même transaction que l\'éditeur', async () => {
        const { win, store, element } = monter();
        win.wizardState.reponses.echelleId = 'ECH_577';
        const el = (champ, value) => ({
            dataset: { echelleId: 'ECH_577', champ }, value,
            classList: { add() {}, remove() {}, contains: () => false }
        });
        expect(await win.wizardV2ModifierRepereEchelle(el('seuilSuffisance', ' x '))).toMatchObject({ ok: true });
        expect(await win.wizardV2ModifierRepereEchelle(el('seuilMaitrise', 'Y'))).toMatchObject({ ok: true });
        expect(enBase(store).seuilSuffisance).toBe('X');
        expect(enBase(store).seuilMaitrise).toBe('Y');
        // L'éditeur d'échelle n'a PAS été redessiné : il vit dans un autre écran.
        expect(element('tableauNiveauxEchelle').innerHTML).toBe('');
    });

    it('le handler REFUSE la suffisance au-dessus de la maîtrise, et n\'écrit rien', async () => {
        const { win, store } = monter({ echelles: [ECHELLE({ seuilMaitrise: 'X' })] });
        win.wizardState.reponses.echelleId = 'ECH_577';
        const marques = [];
        const el = { dataset: { echelleId: 'ECH_577', champ: 'seuilSuffisance' }, value: 'Z',
            classList: { add: (c) => marques.push(c), remove() {}, contains: () => false } };
        const r = await win.wizardV2ModifierRepereEchelle(el);
        expect(r.refuse).toMatch(/plus haut/);
        expect('seuilSuffisance' in enBase(store)).toBe(false);
        expect(marques).toContain('champ-refuse');
    });

    it('le vide RETIRE le repère, depuis l\'assistant aussi', async () => {
        const { win, store } = monter({ echelles: [ECHELLE({ seuilSuffisance: 'X', seuilMaitrise: 'Y' })] });
        win.wizardState.reponses.echelleId = 'ECH_577';
        const el = { dataset: { echelleId: 'ECH_577', champ: 'seuilMaitrise' }, value: '',
            classList: { add() {}, remove() {}, contains: () => false } };
        await win.wizardV2ModifierRepereEchelle(el);
        expect('seuilMaitrise' in enBase(store)).toBe(false);
    });

    it('le récapitulatif dit si les repères sont posés — et ce que leur absence coûte', () => {
        const sans = monter();
        sans.win.wizardState.reponses.echelleId = 'ECH_577';
        const recapSans = texteVisible(sans.win.genererRecapitulatif());
        expect(recapSans).toContain('Repères de maîtrise : non posés');
        expect(recapSans).toContain('ni nommer les priorités');

        const avec = monter({ echelles: [ECHELLE({ seuilSuffisance: 'X', seuilMaitrise: 'Y' })] });
        avec.win.wizardState.reponses.echelleId = 'ECH_577';
        const recapAvec = texteVisible(avec.win.genererRecapitulatif());
        expect(recapAvec).toContain('suffisant à partir de X, maîtrisé à partir de Y');
        expect(recapAvec).not.toContain('non posés');
    });

    it('la branche DEN ne reçoit PAS le bloc : les repères y ont un autre sens, non tranché', () => {
        // #577, état mesuré : pour DEN l'échelle sert « à la rétroaction, pas au
        // calcul ». Y recopier le bloc serait décider à la place de Grégoire.
        const { win } = monter();
        const types = win.ETAPES_WIZARD['config-denotation'].champs.map((c) => c.type);
        expect(types).toContain('select-echelle');
        expect(types).not.toContain('reperes-echelle');
    });
});
