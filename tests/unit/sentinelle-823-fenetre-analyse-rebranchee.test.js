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
        // ↻ Lot E3 (28 sept. 2026) : `seuilsInterpretation` s'écrit par le témoin commun, qui passe par
        // `cle()` ; elle est inscrite à CLES_GLOBALES (jamais préfixée), comme dans l'application.
        cle: (k) => (k === 'seuilsInterpretation' ? k : 'test_' + k),
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

    it('9. « Direction du risque » est renommé, pas retiré : son seuil garde son lecteur vivant', () => {
        // Relecture croisée du 10 sept. au soir : le seuil `directionRisque` est lu par
        // `calculerDirectionsCriteres` (flèches par critère du profil). Option 1 de Grégoire :
        // garder le curseur sous son vrai nom ; `calculerDirectionRisque` (résultat jamais lu) part.
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(html.includes('Sensibilité des flèches par critère'), 'le nouveau libellé n\'est pas à l\'écran').toBe(true);
        expect(html.includes('id="v2-seuil-risque"'), 'le curseur a disparu').toBe(true);
        const sections = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');
        expect(sections.includes('calculerDirectionRisque'), '`calculerDirectionRisque` est encore là').toBe(false);
        expect(sections).toMatch(/function calculerDirectionsCriteres[\s\S]*?obtenirSeuil\(\s*'directionRisque'\s*\)/);
        for (const f of ['index.html', 'js/accompagnement-contenu-hover.js', 'js/accompagnement-contenu-popup.js', 'js/accompagnement-contenu-terme.js']) {
            const code = lireCodeSansCommentaires(f).replace(/<!--[\s\S]*?-->/g, '');
            expect(code.includes('Direction du risque') || code.includes('tendance du risque'), `${f} porte encore le mot « risque » pour ce curseur`).toBe(false);
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

describe('forme du 11 sept. 2026 · les trois seuils de détection sont des CHAMPS en points, la clé reste en fraction', () => {
    // ⛔ LE PIÈGE : un champ qui affiche « 10 » et qu'on enregistrerait tel quel
    // écrirait 10 là où `calculerIPB` / `calculerDirectionsCriteres` /
    // `genererSectionPerformance` (badges) attendent 0,10 — flèches et défis faux pour tout
    // le monde. La conversion se fait à la lecture ET à l'écriture, et ces cas
    // l'EXÉCUTENT sur le vrai panneau.
    // Break-test : retirer le `/ 100` de `_pointsEnFraction` → cas 10 rougit ;
    // retirer le `* 100` de `_fractionEnPoints` → cas 11 rougit.

    it('10. tapé en points, écrit en fraction : 60 → 0,60, 12 → 0,12, 7 → 0,07', () => {
        const { win, store } = monter({ champs: { 'v2-seuil-defi': 60, 'v2-seuil-progression': 12, 'v2-seuil-risque': 7 } });
        win.sauvegarderSeuilsV2();
        expect(store.seuilsInterpretation.defiSpecifique, 'le seuil de défi n\'est pas converti').toBe(0.60);
        expect(store.seuilsInterpretation.progressionArtefacts).toBe(0.12);
        expect(store.seuilsInterpretation.directionRisque).toBe(0.07);
        expect(win.obtenirSeuil('defiSpecifique'), 'la fonction que les calculs appellent').toBe(0.60);
    });

    it('11. stocké en fraction, affiché en points : 0,65 → « 65 », 0,08 → « 8 »', () => {
        const { win, doc } = monter({
            store: { seuilsInterpretation: { defiSpecifique: 0.65, progressionArtefacts: 0.08, directionRisque: 0.04 } },
            champs: { 'v2-seuil-defi': 70, 'v2-seuil-progression': 10, 'v2-seuil-risque': 5 }
        });
        win.initialiserPreferencesV2();
        expect(doc._elems['v2-seuil-defi'].value).toBe('65');
        expect(doc._elems['v2-seuil-progression'].value).toBe('8');
        expect(doc._elems['v2-seuil-risque'].value).toBe('4');
    });

    it('12. « Remettre les valeurs par défaut (3 · 10 · 5 · 70) » remet les champs en points et la clé en fraction — et rien d\'autre', () => {
        const { win, store, doc } = monter({
            store: { seuilsInterpretation: { defiSpecifique: 0.65, progressionArtefacts: 0.15, directionRisque: 0.09, nombreProductionsAnalyse: 8, interpretation: { acceptable: 0.6, bon: 0.75, excellent: 0.9 } } },
            champs: { 'v2-pref-fenetre-patterns': 8, 'v2-seuil-defi': 65, 'v2-seuil-progression': 15, 'v2-seuil-risque': 9, 'v2-seuil-fragile': 60, 'v2-seuil-acceptable': 75, 'v2-seuil-bon': 90 }
        });
        win.restaurerSeuilsDetectionDefautV2();
        expect([doc._elems['v2-pref-fenetre-patterns'].value, doc._elems['v2-seuil-progression'].value, doc._elems['v2-seuil-risque'].value, doc._elems['v2-seuil-defi'].value]).toEqual(['3', '10', '5', '70']);
        const s = store.seuilsInterpretation;
        expect([s.nombreProductionsAnalyse, s.progressionArtefacts, s.directionRisque, s.defiSpecifique]).toEqual([3, 0.10, 0.05, 0.70]);
        // Les trois seuils d'interprétation, eux, ne bougent pas.
        expect(s.interpretation).toEqual({ acceptable: 0.6, bon: 0.75, excellent: 0.9 });
    });

    it('13. une valeur vide retombe sur le défaut en fraction, jamais sur NaN ni sur 0', () => {
        const { win, store } = monter({ champs: { 'v2-seuil-defi': '', 'v2-seuil-progression': 'abc', 'v2-seuil-risque': 0 } });
        win.sauvegarderSeuilsV2();
        expect(store.seuilsInterpretation.defiSpecifique).toBe(0.70);
        expect(store.seuilsInterpretation.progressionArtefacts).toBe(0.10);
        expect(store.seuilsInterpretation.directionRisque).toBe(0.05);
    });

    it('14. à l\'écran : trois champs chiffrés, plus aucun curseur, plus d\'étiquette de curseur, et le peintre est parti', () => {
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        const debut = html.indexOf('id="labo-accompagnement"');
        const fin = html.indexOf('id="labo-modelisation"', debut);
        const ecran = html.slice(debut, fin);
        for (const id of ['v2-seuil-progression', 'v2-seuil-risque', 'v2-seuil-defi']) {
            const champ = ecran.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
            expect(champ, `${id} a disparu`).not.toBeNull();
            expect(champ[0]).toMatch(/type="number"/);
            expect(champ[0]).toMatch(/data-on-change="sauvegarderSeuilsV2"/);
        }
        expect(ecran.includes('type="range"'), 'un curseur survit').toBe(false);
        expect(ecran.includes('v2-valeur-'), 'une étiquette de curseur survit').toBe(false);
        expect(ecran.includes('mettreAJourAffichageSeuilV2'), 'le peintre est encore appelé').toBe(false);
        // Rien ne se replie plus sur cet écran.
        expect(ecran.includes('<details'), 'un repliable survit').toBe(false);
        expect(ecran.includes('accordeon-header'), 'une carte se replie encore').toBe(false);
        const panneau = lireCodeSansCommentaires('js/preferences-v2.js');
        expect(panneau.includes('mettreAJourAffichageSeuilV2'), 'le peintre de curseur est encore défini').toBe(false);
        expect(panneau.includes('v2-valeur-')).toBe(false);
    });
});
