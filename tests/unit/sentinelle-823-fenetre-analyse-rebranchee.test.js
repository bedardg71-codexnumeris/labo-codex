/**
 * SENTINELLE #823 — LA FENÊTRE D'ANALYSE DES PATTERNS ATTEINT ENFIN LES CALCULS,
 * ET TROIS CONTRÔLES SANS EFFET ONT QUITTÉ L'ÉCRAN SANS LAISSER DE TRACE.
 *
 * Carte des effets du 10 septembre 2026 (§ 4 du cadrage de l'écran de réglage du
 * dépistage) : le champ « dernières productions » de Labo › Outils d'observation
 * écrivait la préférence `fenetrePatterns`, que personne ne lisait ; les douze
 * calculs de patterns lisent `seuilsInterpretation.nombreProductionsAnalyse` par
 * `obtenirNombreProductionsPourPatterns`, une clé que rien n'écrivait. La fenêtre
 * valait 3 quoi qu'on tape. Arbitrage de Grégoire : « retirer trois, brancher la
 * fenêtre ».
 *
 * Ce banc EXÉCUTE le panneau (`preferences-v2.js`) sur un faux document dont seuls
 * les champs du lot existent, avec le vrai `interpretation-config.js` et le vrai
 * `profil-etudiant-helpers.js` derrière, pour prouver que la valeur tapée arrive
 * jusqu'à la fonction que les calculs appellent.
 *
 * ⛔ Cas 5 — LA VALEUR ORPHELINE N'EST PAS MIGRÉE. Des utilisateurs ont
 * `fenetrePatterns` à 4 ou 5 dans leurs préférences : cette valeur n'a jamais eu
 * d'effet, la récupérer donnerait rétroactivement un effet à un réglage et
 * changerait des profils sans que personne l'ait demandé (décision Cowork,
 * confirmée par Grégoire). Le banc verrouille cette décision.
 *
 * Break-tests (faits rougir AVANT de faire confiance à ce banc) :
 *   1. retirer l'écriture `seuils.nombreProductionsAnalyse` de `sauvegarderSeuilsV2` → cas 1 rougit.
 *   2. faire relire `obtenirPreference('fenetrePatterns')` au panneau → cas 2 rougit.
 *   3. remettre `data-on-change="sauvegarderPreferencesV2"` sur le champ → cas 6 rougit.
 *   4. faire copier `prefs.fenetrePatterns` dans `nombreProductionsAnalyse` au chargement → cas 5 rougit.
 *   5. remettre `uniteAffichageAssiduite` dans DEFAUTS → cas 7 rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));

/** Un faux document qui ne connaît que les champs demandés (id → { value }). */
function fauxDocument(champs) {
    const elems = {};
    // Comme un <input> réel : `.value` rend toujours une chaîne, quoi qu'on y pose.
    for (const [id, valeur] of Object.entries(champs)) {
        let v = String(valeur);
        elems[id] = { checked: false, get value() { return v; }, set value(x) { v = String(x); } };
    }
    return {
        readyState: 'complete',
        addEventListener() {}, removeEventListener() {},
        getElementById: (id) => elems[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; } }, setAttribute() {}, appendChild() {}, addEventListener() {} }),
        body: { classList: { add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute() { return null; }, style: {} },
        documentElement: { addEventListener() {} },
        _elems: elems
    };
}

/**
 * Monte, dans l'ordre de index.html, interpretation-config → helpers → le panneau,
 * sur un magasin en mémoire. `prefsEcrites` note chaque `definirPreference`.
 */
function monter({ store = {}, champs = {} } = {}) {
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        removeSync: (k) => { delete store[k]; },
        get: async () => null, set: async () => {}
    };
    const prefsEcrites = {};
    const win = { addEventListener() {}, removeEventListener() {}, dbReady: false, obtenirTrimestreId: () => 'test' };
    const globaux = {
        db,
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: (n) => (store.preferencesUtilisateur && n in store.preferencesUtilisateur) ? store.preferencesUtilisateur[n] : null,
        definirPreference: (n, v) => { prefsEcrites[n] = v; },
        notifications: { succes() {}, erreur() {}, info() {} },
        alert: () => { throw new Error('alert() appelé : la validation des seuils a refusé la sauvegarde'); }
    };
    chargerScript('js/interpretation-config.js', globaux, win);
    globaux.obtenirSeuil = win.obtenirSeuil;
    globaux.chargerSeuilsInterpretation = win.chargerSeuilsInterpretation;
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    const doc = fauxDocument(champs);
    chargerScript('js/preferences-v2.js', Object.assign({ document: doc }, globaux), win);
    return { win, store, doc, prefsEcrites };
}

function lireCodeSansCommentaires(chemin) {
    return readFileSync(path.join(RACINE, chemin), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((l) => !/^\s*\/\//.test(l))
        .join('\n');
}

describe('#823 · la fenêtre d\'analyse des patterns est rebranchée', () => {

    it('1. la valeur tapée dans le champ arrive jusqu\'à obtenirNombreProductionsPourPatterns', () => {
        const { win, store } = monter({ champs: { 'v2-pref-fenetre-patterns': 5 } });
        expect(win.obtenirNombreProductionsPourPatterns(), 'avant la sauvegarde, le défaut').toBe(3);
        win.sauvegarderSeuilsV2();
        expect(store.seuilsInterpretation.nombreProductionsAnalyse, 'la clé que les calculs lisent n\'est pas écrite').toBe(5);
        expect(win.obtenirNombreProductionsPourPatterns(), 'la fonction des douze calculs ne voit pas la valeur').toBe(5);
    });

    it('2. le panneau relit la clé des calculs, pas une préférence', () => {
        const { win, doc } = monter({
            store: { seuilsInterpretation: { nombreProductionsAnalyse: 7 }, preferencesUtilisateur: { fenetrePatterns: 4 } },
            champs: { 'v2-pref-fenetre-patterns': 3 }
        });
        win.initialiserPreferencesV2();
        expect(doc._elems['v2-pref-fenetre-patterns'].value, 'le champ n\'affiche pas la valeur en vigueur').toBe('7');
    });

    it('3. « Restaurer les valeurs par défaut » remet 3 dans la bonne clé', () => {
        const { win, store, doc } = monter({
            store: { seuilsInterpretation: { nombreProductionsAnalyse: 9 } },
            champs: { 'v2-pref-fenetre-patterns': 9 }
        });
        win.restaurerSeuilsDetectionDefautV2();
        expect(doc._elems['v2-pref-fenetre-patterns'].value).toBe('3');
        expect(store.seuilsInterpretation.nombreProductionsAnalyse).toBe(3);
        expect(win.obtenirNombreProductionsPourPatterns()).toBe(3);
    });

    it('4. une valeur vide ou absurde retombe sur 3, jamais sur NaN', () => {
        const { win, store } = monter({ champs: { 'v2-pref-fenetre-patterns': '' } });
        win.sauvegarderSeuilsV2();
        expect(store.seuilsInterpretation.nombreProductionsAnalyse).toBe(3);
    });

    it('5. ⛔ la préférence orpheline `fenetrePatterns` n\'est PAS migrée — décision, pas oubli', () => {
        // Un utilisateur qui avait tapé 5 « il y a des mois » : ça n'a jamais eu
        // d'effet. Après ce lot, l'analyse porte sur 3 tant qu'il ne retape pas.
        const { win, store, doc } = monter({
            store: { preferencesUtilisateur: { fenetrePatterns: 5, decouplerPN: true, uniteAffichageAssiduite: 'heures' } },
            champs: { 'v2-pref-fenetre-patterns': 3 }
        });
        win.initialiserPreferencesV2();
        expect(win.obtenirNombreProductionsPourPatterns(), 'la valeur orpheline a été récupérée').toBe(3);
        expect(doc._elems['v2-pref-fenetre-patterns'].value).toBe('3');
        expect(store.seuilsInterpretation?.nombreProductionsAnalyse ?? 3, 'quelque chose a copié la préférence dans les seuils').toBe(3);
        // Et l'orpheline reste où elle est : on n'écrit pas dans les données des gens.
        expect(store.preferencesUtilisateur).toEqual({ fenetrePatterns: 5, decouplerPN: true, uniteAffichageAssiduite: 'heures' });
    });

    it('6. le champ déclenche la sauvegarde des seuils, et plus celle des préférences', () => {
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        const champ = html.match(/<input[^>]*id="v2-pref-fenetre-patterns"[^>]*>/);
        expect(champ, 'le champ a disparu de index.html').not.toBeNull();
        expect(champ[0]).toMatch(/data-on-change="sauvegarderSeuilsV2"/);

        const { win, prefsEcrites } = monter({ champs: { 'v2-pref-fenetre-patterns': 5 } });
        win.sauvegarderPreferencesV2();
        for (const cle of ['fenetrePatterns', 'decouplerPN', 'uniteAffichageAssiduite']) {
            expect(cle in prefsEcrites, `le panneau écrit encore la préférence retirée « ${cle} »`).toBe(false);
        }
    });
});

describe('#823 · les trois contrôles sans effet sont partis sans laisser de trace', () => {

    it('7. ni l\'écran, ni le panneau, ni les défauts ne les connaissent plus', () => {
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        for (const id of ['v2-pref-decoupler-pn', 'v2-pref-unite-affichage']) {
            expect(html.includes(`id="${id}"`), `le contrôle « ${id} » est encore dans index.html`).toBe(false);
        }
        for (const infobulle of ['depist-decoupler-pn', 'pref-affichage-assiduite']) {
            expect(html.includes(`data-tooltip="${infobulle}"`), `l'infobulle « ${infobulle} » est encore posée`).toBe(false);
        }

        const panneau = lireCodeSansCommentaires('js/preferences-v2.js');
        for (const motif of ["'decouplerPN'", "'fenetrePatterns'", "'uniteAffichageAssiduite'", 'formaterAssiduiteAvecUnite', 'formaterTotalPresence', 'obtenirUniteAffichageAssiduite']) {
            expect(panneau.includes(motif), `le panneau porte encore « ${motif} »`).toBe(false);
        }

        const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, removeSync() {}, get: async () => null, set: async () => {} };
        const prefs = chargerScript('js/preferences.js', { db });
        const defauts = prefs.obtenirToutesPreferences();
        for (const cle of ['decouplerPN', 'fenetrePatterns', 'uniteAffichageAssiduite']) {
            expect(cle in defauts, `« ${cle} » est encore un défaut de preferences.js`).toBe(false);
        }
    });

    it('8. les deux formateurs d\'assiduité n\'ont ni définition ni appelant nulle part', () => {
        const js = readFileSync(path.join(RACINE, 'js', 'preferences-v2.js'), 'utf8');
        expect(js).not.toMatch(/function formaterAssiduiteAvecUnite|function formaterTotalPresence/);
        // Un appelant qui serait apparu ailleurs casserait en silence : on balaie index.html
        // et les modules chargés par lui.
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        const scripts = [...html.matchAll(/<script[^>]+src="(js\/[^"?]+)/g)].map(m => m[1]);
        expect(scripts.length).toBeGreaterThan(50);
        for (const s of scripts) {
            const code = lireCodeSansCommentaires(s);
            expect(code.includes('formaterAssiduiteAvecUnite') || code.includes('formaterTotalPresence'),
                `${s} appelle encore un formateur retiré`).toBe(false);
        }
    });
});
