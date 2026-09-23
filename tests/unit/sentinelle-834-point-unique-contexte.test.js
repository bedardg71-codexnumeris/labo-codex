import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #834 — LOT E DU CADRAGE « RENCONTRES » (12 sept. 2026) : UN POINT UNIQUE POUR
// L'IDENTIFIANT DU CONTEXTE.
//
// Mesuré le 11 sept. (Cowork, puis grep de la session) : DIX-NEUF sites recalculaient
// `infoCours._groupeCoursId || infoCours.id || null`, plus le helper de snapshots.js. Un
// troisième mode de contexte se serait codé vingt fois. Désormais : `obtenirIdContexteActif`
// (modes.js), et ZÉRO changement de valeur.
//
// VERROUILLÉ ICI :
//   1. sur une grille d'`infoCours` (absent, null, {}, id seul, _groupeCoursId seul, les deux,
//      valeurs vides), la fonction rend EXACTEMENT ce que rendait l'ancienne expression ;
//   2. sans argument, elle lit `infoCours` en base (même résultat) ;
//   3. STRUCTUREL : plus aucun fichier de js/ (hors modes.js, qui porte la règle) ne contient
//      l'expression recopiée `._groupeCoursId ||` — le point unique ne se re-duplique pas en
//      silence.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 au soir — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function monterModes(store) {
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); } };
    const win = { addEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    const document = { addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { setAttribute() {}, getAttribute() { return null; }, classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} }, style: {} }, documentElement: { addEventListener() {} } };
    chargerScript('js/modes.js', { db, cle, document, estEnModeDemo: () => false, obtenirTrimestreId: () => 'test', toggleDisplay() {}, afficherSousSection() {}, naviguerVers() {},
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} }, setTimeout: () => 0, clearTimeout() {}, MutationObserver: function () { return { observe() {}, disconnect() {} }; }, obtenirPreference: () => null, definirPreference() {} }, win);
    return win;
}

// L'ANCIENNE expression, telle qu'elle vivait aux seize sites — copiée ici, PAS importée.
const ancienne = (infoCours) => (infoCours ? (infoCours._groupeCoursId || infoCours.id || null) : null);

const GRILLE = [
    null, undefined, {}, { id: 'COURS_1' }, { _groupeCoursId: 'GC_1' }, { id: 'COURS_1', _groupeCoursId: 'GC_1' },
    { id: '', _groupeCoursId: '' }, { id: 'COURS_1', _groupeCoursId: '' }, { id: '', _groupeCoursId: 'GC_1' }, { id: 0 }, { id: null, _groupeCoursId: null },
    { id: 'GC_ENTITE', _groupeCoursId: 'GC_ENTITE', codeCours: '601-101-MQ', groupe: '00008' },
];

describe('lot E · obtenirIdContexteActif rend ce que les seize sites rendaient', () => {
    it('sur toute la grille, valeur identique à l\'ancienne expression', () => {
        const win = monterModes({});
        for (const info of GRILLE) {
            expect(win.obtenirIdContexteActif(info === undefined ? null : info)).toBe(ancienne(info));
        }
    });
    it('sans argument : lit infoCours en base, même résultat', () => {
        expect(monterModes({ infoCours: { id: 'COURS_1', _groupeCoursId: 'GC_7' } }).obtenirIdContexteActif()).toBe('GC_7');
        expect(monterModes({ infoCours: { id: 'COURS_1' } }).obtenirIdContexteActif()).toBe('COURS_1');
        expect(monterModes({ infoCours: null }).obtenirIdContexteActif()).toBeNull();
        expect(monterModes({}).obtenirIdContexteActif()).toBeNull();
    });
    it('`null` explicite n\'est pas « absent » : on ne relit pas la base à la place de l\'appelant', () => {
        const win = monterModes({ infoCours: { id: 'COURS_1', _groupeCoursId: 'GC_7' } });
        expect(win.obtenirIdContexteActif(null)).toBeNull();
    });
});

describe('lot E · structurel : l\'expression n\'est plus recopiée hors de modes.js', () => {
    it('aucun fichier de js/ (hors modes.js) ne contient `._groupeCoursId ||`', () => {
        const fautifs = [];
        const parcourir = (dossier) => {
            for (const nom of readdirSync(dossier, { withFileTypes: true })) {
                const chemin = path.join(dossier, nom.name);
                if (nom.isDirectory()) { if (nom.name !== '_archives') parcourir(chemin); continue; }
                if (!nom.name.endsWith('.js') || nom.name === 'modes.js') continue;
                const src = readFileSync(chemin, 'utf8');
                if (/\._groupeCoursId\s*\|\|/.test(src)) fautifs.push(path.relative(RACINE, chemin));
            }
        };
        parcourir(path.join(RACINE, 'js'));
        expect(fautifs).toEqual([]);
    });
    // Lot N2 (#716, 22 sept. 2026) : deux sites partent avec les méthodes historiques de la standards et de la
    // sommative (le P historique est désormais la note du cours) — 20 → 18, et la sommative sort de la liste.
    it('les onze fichiers mesurés appellent bien le point unique (dix-huit appels : dix-sept sites et le helper de snapshots)', () => {
        const fichiers = ['correlations-longitudinales.js', 'export-pdf.js', 'graphiques-progression.js', 'impact-jetons.js', 'planification-carte.js', 'productions.js', 'profil-etudiant-calculs.js', 'trimestres.js', 'profil-etudiant-sections-affichage.js', 'snapshots.js', 'pratiques/pratique-pan-standards.js'];
        let total = 0;
        for (const f of fichiers) {
            const n = (readFileSync(path.join(RACINE, 'js', f), 'utf8').match(/obtenirIdContexteActif\(/g) || []).length;
            expect(n, f).toBeGreaterThan(0);
            total += n;
        }
        expect(total).toBe(18);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 11 septembre 2026, 21 h (Toronto). Fichiers restaurés à empreinte
// SHA-256 identique.
//   1. modes.js : priorité inversée (`id` avant `_groupeCoursId`)            → 2 rouges (grille)
//   2. modes.js : `null` explicite relit la base                              → 1 rouge
//   3. productions.js : un site recopie l'ancienne expression                → 2 rouges (structurel + compte)
// 5/5 verts une fois restauré.
