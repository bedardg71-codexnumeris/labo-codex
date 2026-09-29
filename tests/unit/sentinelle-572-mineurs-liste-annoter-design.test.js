import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #572 (29 août 2026) — LES MINEURS DE L'AUDIT ÉVALUATIONS, VOLETS LISTE,
// ANNOTER ET DESIGN (les volets Import/Export ont été livrés le 28).
//
// Liste : `toggleVerrouillerEvaluation` (sans appelant), `attacherEvenementsActions`
// (no-op au commentaire mensonger), le filtre « groupe » (élément créé nulle part,
// lu à cinq endroits), la branche « non-remis » (aucune option), les listeners de
// filtres accumulés à chaque visite, `production.nom` (une production porte `titre`),
// `reprise-ciblee` classée avec les lignes sans jeton, les annotations jamais purgées.
// Annoter : la note finale relue depuis le DOM au lieu de la valeur calculée.
// Design : « Cliquez » vouvoyé, badges de jetons en hex, pas de focus visible sur les
// barres d'outils, boutons-icônes sans nom accessible.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const nettoyer = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const liste = nettoyer(lire('js/liste-evaluations.js'));
const stockage = nettoyer(lire('js/travaux-stockage.js'));
const calcul = nettoyer(lire('js/evaluation-calcul.js'));
const sauvegarde = nettoyer(lire('js/evaluation-sauvegarde.js'));
const chargement = nettoyer(lire('js/evaluation-chargement.js'));
const ui = lire('js/travaux-ui.js');
const outils = lire('js/travaux-outils.js');
const css = lire('styles.css');

describe('#572 · Liste', () => {
    it('le code mort est parti : toggleVerrouillerEvaluation, attacherEvenementsActions, filtre groupe, branche non-remis', () => {
        expect(liste).not.toContain('function toggleVerrouillerEvaluation');
        expect(liste).not.toContain('function attacherEvenementsActions');
        expect(liste).not.toContain('filtre-groupe-eval');
        expect(liste).not.toContain("filtreStatut === 'non-remis'");
    });
    it('les listeners de filtres ne s\'accumulent plus (garde par élément)', () => {
        const i = liste.indexOf('function initialiserEvenementsFilres(');
        const corps = liste.slice(i, liste.indexOf('\n}', i));
        expect(corps).toContain('dataset.evenementsFiltresAttaches');
        expect(corps).toMatch(/if \(filtre && !filtre\.dataset\.evenementsFiltresAttaches\)/);
    });
    it('la vue Corbeille nomme la production par son titre, et la reprise ciblée est classée avec les reprises', () => {
        expect(liste).toContain('production.titre || production.nom');
        expect(liste).toMatch(/'reprise-ciblee':\s*2/);
    });
});

describe('#572 · annotations purgées avec le fichier', () => {
    it('supprimerDefinitivement et purgerCorbeilleExpiree retirent les annotations', () => {
        const a = stockage.indexOf('async function supprimerDefinitivement(');
        expect(stockage.slice(a, stockage.indexOf('\n    }\n', a))).toContain('supprimerAnnotationsFichiers([id])');
        const b = stockage.indexOf('async function purgerCorbeilleExpiree(');
        expect(stockage.slice(b, stockage.indexOf('\n    }\n', b))).toContain('supprimerAnnotationsFichiers(expirees.map(f => f.id), { discret: true })');   // lot F : purge au démarrage, pas un geste
    });
    it('supprimerAnnotationsFichiers ne retire que les annotations visées, et n\'écrit rien à vide', () => {
        const store = { test_annotationsTravaux: [{ fichierId: 'F1', x: 1 }, { fichierId: 'F2', x: 2 }, { fichierId: 'F3', x: 3 }] };
        const ecritures = [];
        const win = chargerScript('js/travaux-stockage.js', {
            db: { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d), setSync: (k, v) => { ecritures.push(k); store[k] = v; }, get: async () => null, set: async () => {} },
            cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [], notifications: { info() {}, erreur() {}, succes() {} }
        });
        expect(win.travauxStockage.supprimerAnnotationsFichiers(['F2', 'F9'])).toBe(1);
        expect(store.test_annotationsTravaux.map(a => a.fichierId)).toEqual(['F1', 'F3']);
        const avant = ecritures.length;
        expect(win.travauxStockage.supprimerAnnotationsFichiers(['F9'])).toBe(0);
        expect(ecritures.length).toBe(avant);
    });
});

// ↻ RÉORIENTÉ LE 2 SEPT. 2026 — LE PÉRIMÈTRE SE DÉDUIT DU DÉPÔT, IL NE S'ÉCRIT PAS À LA MAIN.
// Ce cas itérait sur une liste tapée : `evaluation-sauvegarde` et `evaluation-chargement`.
// Son titre disait « plus personne ne relit le DOM » ; il en vérifiait deux sur trois, et
// il est resté vert du 29 août au 2 septembre pendant que `js/evaluation.js:1784`
// (`_lireChampsDOMMod`, le chemin de MODIFICATION) relisait l'écran — arrondi `toFixed(1)`
// stocké à la place de la valeur, et 0 écrit quand l'écran affiche « -- ». Les deux effets
// sont reproduits sur le chemin réel dans `sentinelle-572-quatrieme-site-note-modification`.
// ⮕ Ajouter `evaluation` à la liste aurait fermé ce cas et laissé le même piège au fichier
// suivant. Une garde dont le périmètre est figé mesure l'état du jour où on l'a tapée, pas
// l'invariant. Ici, la liste des fichiers est CELLE DU DÉPÔT, lue à chaque exécution.
function fichiersJs(dossier, acc = []) {
    for (const e of readdirSync(dossier, { withFileTypes: true })) {
        const p = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersJs(p, acc);
        else if (e.name.endsWith('.js')) acc.push(p);
    }
    return acc;
}

describe('#572 · Annoter — la note finale vient de la valeur calculée', () => {
    it('le calcul pose noteCalculeeCourante (nombre ou null)', () => {
        expect(calcul).toContain('window.noteCalculeeCourante = pourcentage;');
        expect(calcul).toContain('window.noteCalculeeCourante = null;');
    });

    it('et plus AUCUN fichier de js/ ne relit la note depuis #noteProduction1 — périmètre déduit', () => {
        const fichiers = fichiersJs(path.join(racine, 'js'));
        expect(fichiers.length, 'le balayage ne voit presque rien').toBeGreaterThan(100);
        const fautifs = [];
        for (const f of fichiers) {
            const src = nettoyer(readFileSync(f, 'utf8'));
            if (/parseFloat\([^)]*noteProduction1/.test(src)) fautifs.push(path.relative(racine, f));
        }
        expect(fautifs, 'un fichier relit la note depuis l\'écran').toEqual([]);
    });

    it('témoin — les sites qui écrivent noteFinale lisent la source, et ils sont QUATRE (pas trois)', () => {
        // Un motif qui rend zéro partout ne prouve rien : celui-ci doit trouver les quatre
        // écritures — trois d'avant, plus le chemin de modification. Compté sur tout js/.
        let sites = 0;
        for (const f of fichiersJs(path.join(racine, 'js'))) {
            const src = nettoyer(readFileSync(f, 'utf8'));
            sites += (src.match(/typeof window\.noteCalculeeCourante === 'number'/g) || []).length;
        }
        expect(sites).toBe(4);
    });
});

describe('#572 · Design', () => {
    it('plus de « Cliquez » : l\'application tutoie', () => {
        expect(outils).not.toContain('Cliquez');
        expect(ui).not.toContain('Cliquez');
    });
    it('les badges de jetons sont sur la palette, sans hex', () => {
        const i = css.indexOf('.badge-jeton-delai-wrapper {'); const j = css.indexOf('.badge-jeton-reprise-ciblee-wrapper {');
        const bloc = css.slice(i, css.indexOf('\n}\n', j));
        expect(bloc).not.toMatch(/#ff6f00|#9c27b0/);
        expect(bloc).toContain('var(--jetons-delai-fond)');
        expect(bloc).toContain('var(--jetons-reprise-bordure)');
    });
    it('focus visible sur les barres d\'outils ; les boutons-icônes ont un nom', () => {
        expect(css).toMatch(/\.travaux-toolbar button:focus-visible,\s*\.annot-toolbar-fichiers button:focus-visible\s*\{/);
        expect(ui).toMatch(/id="travaux-split-btn-page-prec"[^>]*aria-label="Page précédente"/);
        expect(ui).toMatch(/id="travaux-split-btn-page-suiv"[^>]*aria-label="Page suivante"/);
        const sansNom = [...ui.matchAll(/<button class="modal-fermer"[^>]*>/g)].map(m => m[0]).filter(b => !/aria-label=/.test(b));
        expect(sansNom).toEqual([]);
    });
});
