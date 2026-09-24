import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #760 + #759 (24 sept. 2026) — CE QUE L'ÉLÈVE LIT DE SES TAMPONS, dans la vraie page.
//
// Une copie annotée de tampons ACTUELS, sur des réglages personnalisés (un nom de tampon changé, un tampon
// personnel dans une catégorie personnelle, un ordre de catégories changé). On ouvre la copie en mode
// Évaluer, on choisit les niveaux : la rétroaction générale s'écrit. Attendu :
//   · #760 — son bloc « Observations » liste les MÊMES tampons que la spécifique, dans le MÊME ordre, sous
//     les mêmes titres, avec les noms des réglages (hier : le bloc ne s'écrivait jamais) ;
//   · #759 — « Copier tout » rend des phrases séparées (hier : « …(1) — texte.Titre… »).
//
// Copie de banc : WebKit refuse un Blob dans IndexedDB en contexte éphémère ; `recupererBlob` est enveloppé
// (PNG d'un pixel), comme aux bancs #868 et #911. Aucun `page.click` : `el.click()` et `change` scriptés.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't760';

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && window.travauxOutils && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-760';
        const grille = { id: 'G760', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] };
        const echelle = { id: 'E760', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC760', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TEST760', nom: 'Tremblay', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: 'GC760' }]);
        window.db.setSync(T + '_productions', [{ id: 'p760', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G760', echelleId: 'E760', groupeCoursId: 'GC760' }]);
        window.db.setSync(T + '_grillesTemplates', [grille]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT760', etudiantDA: 'TEST760', productionId: 'p760', coursId, groupeCoursId: 'GC760',
            nomFichier: 'TREMBLAY_TEST760_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        // La copie : tampons actuels, un tampon personnel, un jeton (qui n'est pas une observation).
        window.db.setSync(T + '_annotationsTravaux', [{ id: 'AN760', fichierId: 'FT760', pages: { '1': {
            strokes: [], shapes: [], textAnnotations: [],
            stickers: [
                { autocollantId: 'obs-hoc', x: 10, y: 10 }, { autocollantId: 'obs-hoc', x: 20, y: 20 },
                { autocollantId: 'action-liaison', x: 30, y: 30 }, { autocollantId: 'obs-soupcon', x: 40, y: 40 },
                { autocollantId: 'custom-760', x: 50, y: 50 }, { autocollantId: 'jeton-delai', x: 60, y: 60 }
            ]
        } } }]);
        // Les réglages de Grégoire (clés globales) : un nom changé, une catégorie et un tampon personnels,
        // l'ordre des catégories changé, un texte réglé.
        window.db.setSync('personnalisationObservations', { 'obs-hoc': { nom: 'Thèse' } });
        window.db.setSync('categoriesPerso', [{ id: 'cat-760', nom: 'Style' }]);
        window.db.setSync('tamponsPersonnalises', [{ id: 'custom-760', nom: 'Belle image', categorie: 'cat-760' }]);
        window.db.setSync('ordreCategories', ['observations', 'cat-760', 'action', 'comprehension']);
        window.db.setSync('retroactionsObservations', { 'custom-760': 'Ton image frappe.', 'obs-hoc': "L'idée directrice manque." });

        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC760' });
        window.db.setSync('groupeCoursActif', { id: 'GC760', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT760' ? copie : original.apply(this, arguments); };

        window._presse760 = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true,
            value: { writeText: (t) => { window._presse760.push(t); return Promise.resolve(); } } });
    }, { png: PNG, T });
    return erreurs;
}

test('#760 + #759 · la générale liste les tampons de la spécifique, dans le même ordre, sur les réglages actuels ; « Copier tout » sépare les phrases', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST760', 'p760'));
    await page.waitForFunction(() => {
        const fa = window.travauxVisionneuse.getFichierActuel();
        return fa && fa.id === 'FT760' && window.travauxUI.getModeCourant() === 'evaluer'
            && !!document.getElementById('eval_c1') && !!document.getElementById('retroactionFinale1');
    }, null, { timeout: 15000 });

    // Le geste : choisir les niveaux. La générale s'écrit.
    await page.evaluate(() => {
        [['eval_c1', 'M'], ['eval_c2', 'D']].forEach(([id, v]) => {
            const s = document.getElementById(id);
            s.value = v;
            s.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
    await page.waitForFunction(() => /--- Observations ---/.test((document.getElementById('retroactionFinale1') || {}).value || ''), null, { timeout: 10000 });

    const lu = await page.evaluate(() => {
        const generale = document.getElementById('retroactionFinale1').value;
        const bloc = generale.split('--- Observations ---')[1].split('---')[0];
        window.basculerVueRetroaction('specifique');
        const spec = document.getElementById('contenuRetroSpecifique');
        const titresSpec = Array.from(spec.querySelectorAll('h5')).map(h => h.textContent);
        const tamponsSpec = Array.from(spec.querySelectorAll('p strong')).map(s => s.textContent);
        return { bloc, titresSpec, tamponsSpec };
    });

    // La spécifique, dans l'ordre des réglages (catégorie personnelle comprise, jeton absent).
    expect(lu.titresSpec).toEqual(['Observations', 'Style', 'Action']);
    expect(lu.tamponsSpec).toEqual(['Thèse', 'Soupçon IA', 'Belle image', 'Liaison']);
    // La générale : les mêmes, dans le même ordre, sous les mêmes titres.
    expect(lu.bloc.trim()).toBe([
        'Observations',
        'Thèse (×2) :', "L'idée directrice manque.",
        'Soupçon IA (×1) :', "Il y a un soupçon d'utilisation non permise de l'intelligence artificielle.",
        '',
        'Style',
        'Belle image (×1) :', 'Ton image frappe.',
        '',
        'Action',
        'Liaison (×1) :', "L'étudiant·e infère, relie des éléments entre eux, interprète."
    ].join('\n'));

    // « Copier tout » : le bouton de la sous-barre de la rétroaction.
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Copier tout');
        btn.click();
    });
    await page.waitForFunction(() => window._presse760.length > 0, null, { timeout: 10000 });
    const copie = await page.evaluate(() => window._presse760[window._presse760.length - 1]);
    const spec = copie.split('=== RÉTROACTION SPÉCIFIQUE ===\n')[1].split('\n\n=== BILAN ===')[0];
    expect(spec.startsWith('Observations\nThèse (2) — L\'idée directrice manque.\nSoupçon IA (1) — ')).toBe(true);
    expect(spec).toContain('\n\nStyle\nBelle image (1) — Ton image frappe.\n\nAction\nLiaison (1) — ');
    // Aucune phrase collée à la suivante, nulle part dans le texte copié.
    expect(copie).not.toMatch(/[.!?»)][A-ZÀ-Ý]/);

    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});
