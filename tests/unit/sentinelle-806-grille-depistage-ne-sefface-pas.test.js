import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #806 — LE CHOIX DE GRILLE DE DÉPISTAGE NE S'EFFACE PLUS TOUT SEUL,
// ET LE CHEMIN QUI Y MÈNE EST LE VRAI.
//
// LE SYMPTÔME, RAPPORTÉ PAR GRÉGOIRE LE 9 SEPTEMBRE 2026 (bêta 1.125.2, a2026,
// 28 étudiants) : « la grille de critères de dépistage ne persiste pas, il faut
// régulièrement que je l'enregistre à nouveau », et le bandeau « Configuration
// requise » l'envoyait dans « Conception → Pratiques de notation », où le réglage
// n'est plus depuis sa migration vers « Labo → Outils d'observation ».
//
// ⚠ DEUX CHEMINS D'EFFACEMENT, ET AUCUN DES DEUX N'ÉTAIT UN GESTE DE L'UTILISATEUR :
//
//   1. `diagnostiquerGrilleReferenceDepistage` — une fonction d'AFFICHAGE — faisait
//      `definirPreference('grilleReferenceDepistage', '')` dès que la grille ne se
//      résolvait pas dans `cle('grillesTemplates')`. Or `db.getSync` rend `[]` tant
//      qu'IndexedDB n'est pas hydratée, et le localStorage de Grégoire est saturé
//      (5 119 Ko au rapport) : ses grilles vivent en IDB. Un seul rendu de profil
//      parti trop tôt effaçait son choix, définitivement.
//
//   2. `sauvegarderPreferencesV2` écrit TOUT le panneau à chaque `change` de
//      n'importe lequel de ses contrôles, et lisait le sélecteur avec `|| ''`. Un
//      `<select>` dont l'option n'existe pas rend `''` — indiscernable, à la seule
//      lecture de `.value`, d'un retrait volontaire. Le premier clic sur une case
//      voisine écrasait la préférence.
//
// ⮕ L'INVARIANT QUE CE FICHIER TIENT : un chemin de lecture ou d'affichage ne
// détruit pas un réglage de l'utilisateur, et un `''` ne s'écrit que lorsqu'il est
// démontrablement un choix.

const racine = path.resolve(process.cwd(), '..');

function lireCodeSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

const GRILLE = { id: 'GR1', nom: 'Analyse littéraire', criteres: [{ id: 'c1', nom: 'Structure' }] };

// --- Chargement de profil-etudiant-helpers.js avec un journal des écritures ---
function chargerHelpers(preference, grilles) {
    const ecritures = [];
    const win = chargerScript('js/profil-etudiant-helpers.js', {
        db: {
            get: async () => null,
            getSync: (k, d) => (String(k).indexOf('grillesTemplates') !== -1 ? grilles : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirPreference: (nom) => (nom === 'grilleReferenceDepistage' ? preference : null),
        definirPreference: (nom, valeur) => { ecritures.push([nom, valeur]); },
        obtenirDonneesSelonMode: () => [],
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a,
        estModeeLectureSeule: () => false, genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
    });
    return { win, ecritures };
}

// --- Faux <select> minimal, fidèle sur LE point qui compte : une valeur
//     inconnue des options ne « prend » pas et retombe sur ''. C'est tout le
//     piège de #806, et un stub qui l'ignorerait ne prouverait rien. ---
function fauxSelect(options, valeurVoulue) {
    const select = {
        options: options.map(o => ({ value: o.value, textContent: o.texte })),
        _value: '',
        get value() { return this._value; },
        set value(v) {
            this._value = this.options.some(o => o.value === v) ? v : '';
        },
        appendChild(o) { this.options.push(o); }
    };
    select.value = valeurVoulue;
    return select;
}

function chargerPreferencesV2(select, prefsInitiales) {
    const prefs = { ...prefsInitiales };
    const document = {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: (id) => (id === 'v2-pref-grille-reference' ? select : null),
        createElement: () => ({ dataset: {}, value: '', textContent: '' }),
        querySelector: () => null, querySelectorAll: () => [],
        body: { classList: { add: () => {}, remove: () => {} } },
        documentElement: { addEventListener: () => {} }
    };
    const win = chargerScript('js/preferences-v2.js', {
        document,
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {} },
        cle: (k) => 'a2026_' + k,
        obtenirPreference: (nom) => prefs[nom],
        definirPreference: (nom, valeur) => { prefs[nom] = valeur; }
    });
    return { win, prefs };
}

describe('#806 · la grille de dépistage ne s\'efface pas toute seule', () => {

    it('1. ⛔ LE CŒUR — une base pas encore hydratée NE DÉTRUIT PAS le choix', () => {
        // `grillesTemplates` vide = IDB pas encore chargée. C'est le cas de
        // Grégoire, dont le localStorage saturé pousse les grilles en IDB.
        const { win, ecritures } = chargerHelpers('GR1', []);
        const r = win.diagnostiquerGrilleReferenceDepistage();

        expect(ecritures, 'un chemin d\'affichage a écrit dans les préférences')
            .toEqual([]);
        expect(r.raison).toBe('grilles-indisponibles');
        expect(r.message, 'le message doit rassurer sur le sort du réglage')
            .toMatch(/conserv/i);
        expect(r.message, 'il ne doit PAS affirmer une suppression qui n\'a pas eu lieu')
            .not.toMatch(/supprim/i);
    });

    it('2. une grille RÉELLEMENT supprimée : la cause est dite, et rien n\'est écrit non plus', () => {
        // Liste non vide + id absent = suppression avérée. Le diagnostic le dit,
        // mais il ne « nettoie » plus : c'est à l'utilisateur de re-désigner.
        const { win, ecritures } = chargerHelpers('GR_DISPARUE', [GRILLE]);
        const r = win.diagnostiquerGrilleReferenceDepistage();

        expect(r.raison).toBe('grille-introuvable');
        expect(r.message).toMatch(/supprim/i);
        expect(ecritures, 'l\'auto-nettoyage est revenu').toEqual([]);
    });

    it('3. appelée dix fois, la préférence vaut toujours ce que l\'utilisateur y a mis', () => {
        // ⮕ L'ancien comportement s'auto-masquait : le 2e appel voyait une
        // préférence vide et rendait « aucune-grille-designee ». La répétition
        // est donc l'assertion, pas un ornement.
        const { win, ecritures } = chargerHelpers('GR1', []);
        for (let i = 0; i < 10; i++) win.diagnostiquerGrilleReferenceDepistage();
        expect(ecritures).toEqual([]);
    });

    it('4. ⛔ SÉLECTEUR DÉSYNCHRONISÉ — sauvegarder le panneau n\'efface pas la grille', () => {
        // Le dropdown ne propose pas la grille désignée (pas encore peuplé, ou
        // grille d'un autre trimestre) : `.value` rend ''. Sauvegarder le panneau
        // — ce que fait le moindre clic sur une case voisine — ne doit rien perdre.
        const select = fauxSelect([{ value: '', texte: '-- Sélectionner une grille --' }], 'GR1');
        expect(select.value, 'prémisse du test : la valeur ne prend pas').toBe('');

        const { win, prefs } = chargerPreferencesV2(select, { grilleReferenceDepistage: 'GR1' });
        win.sauvegarderPreferencesV2();

        expect(prefs.grilleReferenceDepistage, 'le choix a été écrasé par un sélecteur vide')
            .toBe('GR1');
    });

    it('5. RETRAIT VOLONTAIRE — quand la grille EST offerte, le vide s\'enregistre', () => {
        // La contrepartie, sans quoi la garde deviendrait un verrou : l'utilisateur
        // doit pouvoir ne plus rien désigner. Le départage se fait sur les options.
        const select = fauxSelect([
            { value: '', texte: '-- Sélectionner une grille --' },
            { value: 'GR1', texte: 'Analyse littéraire' }
        ], '');
        const { win, prefs } = chargerPreferencesV2(select, { grilleReferenceDepistage: 'GR1' });
        win.sauvegarderPreferencesV2();

        expect(prefs.grilleReferenceDepistage).toBe('');
    });

    it('6. un choix explicite s\'enregistre normalement', () => {
        const select = fauxSelect([
            { value: '', texte: '-- Sélectionner une grille --' },
            { value: 'GR2', texte: 'Dissertation' }
        ], 'GR2');
        const { win, prefs } = chargerPreferencesV2(select, { grilleReferenceDepistage: 'GR1' });
        win.sauvegarderPreferencesV2();

        expect(prefs.grilleReferenceDepistage).toBe('GR2');
    });

    it('7. le chemin faux n\'est plus écrit nulle part dans les écrans', () => {
        // Il l'était en DEUX exemplaires — d'où la vérification par famille et non
        // sur un fichier : c'est la duplication qui a permis au libellé de survivre
        // à la migration du réglage.
        for (const fichier of [
            'js/profil-etudiant-sections-affichage.js',
            'js/profil-etudiant-diagnostics.js',
            'js/profil-etudiant-calculs.js'
        ]) {
            expect(lireCodeSansCommentaires(fichier), `chemin périmé revenu dans ${fichier}`)
                .not.toMatch(/Pratiques de notation[^'"`]*[Gg]rille de référence pour le dépistage/);
        }
    });

    it('8. les deux bandeaux « Configuration requise » lisent le diagnostic', () => {
        // Une phrase composée à un seul endroit ne peut plus diverger d'un écran
        // à l'autre — c'est ce qui avait laissé le libellé périmé en place.
        for (const fichier of [
            'js/profil-etudiant-sections-affichage.js',
            'js/profil-etudiant-diagnostics.js'
        ]) {
            const code = lireCodeSansCommentaires(fichier);
            expect(code, `${fichier} n'appelle plus le diagnostic`)
                .toMatch(/diagnostiquerGrilleReferenceDepistage\(\)/);
            expect(code, `${fichier} n'affiche pas le message du diagnostic`)
                .toMatch(/lectureGrille\.message/);
        }
    });

    it('9. le portillon branché sur une cible morte n\'est pas revenu', () => {
        // `#grilleReferenceDepistage` (id disparu du HTML) portait le correctif de
        // course #414 : il donnait à lire que l'hydratation était couverte pour ce
        // réglage alors qu'elle ne l'était pas. Un garde-fou branché sur rien est
        // pire qu'un garde-fou absent.
        const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html, 'l\'ancien id est réapparu dans le HTML — revoir cette sentinelle')
            .not.toContain('id="grilleReferenceDepistage"');

        const code = lireCodeSansCommentaires('js/pratiques.js');
        expect(code, 'pratiques.js repeuple un sélecteur qui n\'existe pas')
            .not.toContain("getElementById('grilleReferenceDepistage')");
        expect(code, 'chargerGrillesDisponibles est revenue')
            .not.toMatch(/function chargerGrillesDisponibles\s*\(/);
    });
});

// #829 (9 oct. 2026) — EN DÉMO, le sélecteur montrait « Grille enregistrée, introuvable dans ce
// trimestre » pendant que le profil calculait avec une grille du pack (#749), et un choix dans le
// pack ÉCRASAIT la préférence globale de l'enseignant (classe #806).
describe('#829 · en démo, le sélecteur de grille de dépistage', () => {
    // Le panneau entier : dropdown peuplé par `grillesTemplates` du pack, puis valeurs lues.
    function panneauDemo(demo) {
        const select = fauxSelect([], '');
        Object.defineProperty(select, 'innerHTML', { set() { this.options = [{ value: '', textContent: '-- Sélectionner une grille --' }]; } });
        const prefs = { grilleReferenceDepistage: 'GR_REEL' };
        const document = {
            readyState: 'complete', addEventListener: () => {},
            getElementById: (id) => (id === 'v2-pref-grille-reference' ? select : null),
            createElement: () => ({ dataset: {}, value: '', textContent: '' }),
            querySelector: () => null, querySelectorAll: () => [],
            body: { classList: { add: () => {}, remove: () => {} } },
            documentElement: { addEventListener: () => {} }
        };
        const win = chargerScript('js/preferences-v2.js', {
            document,
            db: { getSync: (k, d) => (String(k).indexOf('grillesTemplates') !== -1 ? [{ id: 'GR_DEMO', nom: 'Grille du pack' }] : (d !== undefined ? d : null)), setSync: () => {} },
            cle: (k) => (demo ? 'demo_' : 'a2026_') + k,
            obtenirPreference: (nom) => prefs[nom],
            definirPreference: (nom, valeur) => { prefs[nom] = valeur; },
            estEnModeDemo: () => demo,
            // La résolution à la lecture de #749 (profil-etudiant-helpers.js) : la grille du pack.
            diagnostiquerGrilleReferenceDepistage: () => ({ grille: { id: 'GR_DEMO' }, raison: null, message: null })
        });
        win.initialiserPreferencesV2();
        return { win, select, prefs };
    }

    it('montre la grille avec laquelle le profil calcule, pas « introuvable »', () => {
        const { select } = panneauDemo(true);
        expect(select.value).toBe('GR_DEMO');
        expect(select.options.filter((o) => o.dataset && o.dataset.grilleIntrouvable)).toEqual([]);
    });

    it('choisir une grille du pack, ou toucher une case voisine, n\'écrit pas la préférence réelle', () => {
        const { win, select, prefs } = panneauDemo(true);
        select.value = 'GR_DEMO';
        win.sauvegarderPreferencesV2();
        select.value = '';
        win.sauvegarderPreferencesV2();
        expect(prefs.grilleReferenceDepistage).toBe('GR_REEL');
    });

    it('hors démo, rien ne change : la grille réelle absente est dite, un choix s\'écrit', () => {
        const { win, select, prefs } = panneauDemo(false);
        expect(select.value).toBe('GR_REEL');
        expect(select.options.some((o) => o.dataset && o.dataset.grilleIntrouvable)).toBe(true);
        select.value = 'GR_DEMO';
        win.sauvegarderPreferencesV2();
        expect(prefs.grilleReferenceDepistage).toBe('GR_DEMO');
    });
});
