import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
const dossierCaptures = process.env.CAPTURES_1174 || null;

// PORTE #1174 (27 octobre 2026) — « METTRE À LA CORBEILLE (N) » DEPUIS LA LISTE DES ÉVALUATIONS.
//
// Le geste de Grégoire du 27 oct. à 8 h 40, en un coup : filtrer sur « Artefact 5 », cocher les lignes
// qui portent une copie, « Mettre à la corbeille (3) ». Une seule question compte les copies et nomme
// celles déjà évaluées (leur note reste) ; « Annuler » n'écrit rien ; confirmer déplace les trois copies,
// la corbeille en compte trois, les évaluations gardent leur note ; « Restaurer » en ramène une.
// Mesure demandée par la consigne (§ 2) : la copie VERROUILLÉE se comporte comme la non verrouillée.
//
// Recette de #934 : fixture propre (le pack démo ne porte aucune copie), cases et boutons cliqués par
// `el.click()` — le vrai dispatcher de main.js —, on attend des RENDUS, aucun `waitForTimeout`.

const A5 = 'p1174-a5';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const NOMS_REELS = ['Sara', 'Exemple', 'Camille', 'Roy', 'Léa', 'Gagnon'];

async function monter(page) {
    const suivi = { dialogues: [], erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) suivi.erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) suivi.erreurs.push(m); }
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.afficherSousSection === 'function'
        && typeof window.mettreSelectionALaCorbeille === 'function' && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate((A5) => {
        const t = 'test1174';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-1174';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_1174' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_1174', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_1174', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST1174A', nom: 'Exemple', prenom: 'Sara', groupe: '01', coursId },
            { da: 'TEST1174B', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId },
            { da: 'TEST1174C', nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [{ id: A5, titre: 'Artefact 5', type: 'travail', ponderation: 100 }]); // security-ok: fixture de test
        const copie = (id, da, nomFichier, extra) => Object.assign({
            id, etudiantDA: da, productionId: A5, coursId, groupeCoursId: 'GC_1174',
            nomFichier, typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-27T12:00:00.000Z', dateModification: '2026-10-27T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }, extra || {});
        const evaluation = (id, da, note, verrouillee) => ({
            id, etudiantDA: da, productionId: A5, coursId, grilleId: '', grilleNom: 'Grille test',
            criteres: [{ critereId: 'c1', critereNom: 'Critère 1', niveauSelectionne: 'M', score: note }],
            noteFinale: note, statutRemise: 'remis', verrouillee, dateEvaluation: '2026-10-27T12:00:00.000Z'
        });
        // Sara : copie seule. Camille : évaluée 48,8 %, NON verrouillée. Léa : évaluée 70 %, VERROUILLÉE.
        window.db.setSync(window.cle('fichiersTravaux'), [ // security-ok: fixture de test
            copie('FT1174A', 'TEST1174A', 'Exemple_Artefact_5.png'),
            copie('FT1174B', 'TEST1174B', 'Roy_Artefact_5.png', { evaluationId: 'EV1174B' }),
            copie('FT1174C', 'TEST1174C', 'Gagnon_Artefact_5.png', { evaluationId: 'EV1174C' })
        ]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), [ // security-ok: fixture de test
            evaluation('EV1174B', 'TEST1174B', 48.8, false),
            evaluation('EV1174C', 'TEST1174C', 70, true)
        ]);
        window.db.setSync(window.cle('corbeilleFichiers'), []); // security-ok: fixture de test
    }, A5);
    return suivi;
}

async function ouvrirLaListe(page) {
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active'), null, { timeout: 10000 });
    await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-liste.sous-section.active')
        && document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').length === 3, null, { timeout: 10000 });
}

const lireStock = (page) => page.evaluate(() => JSON.stringify({
    f: window.db.getSync(window.cle('fichiersTravaux'), []),
    c: window.db.getSync(window.cle('corbeilleFichiers'), []),
    e: window.db.getSync(window.cle('evaluationsSauvegardees'), [])
}));

/** Coche les trois copies par le VRAI clic, puis ouvre la question. */
async function cocherToutEtOuvrir(page) {
    await page.evaluate(() => document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').forEach(cb => cb.click()));
    await page.waitForFunction(() => {
        const barre = document.getElementById('eval-barre-selection');
        return barre && !barre.classList.contains('u-hide') && document.getElementById('eval-btn-corbeille-selection').textContent === 'Mettre à la corbeille (3)';
    }, null, { timeout: 10000 });
    await page.evaluate(() => document.getElementById('eval-btn-corbeille-selection').click());
    await page.waitForFunction(() => !!document.getElementById('corbeille-selection-overlay'), null, { timeout: 10000 });
    return page.evaluate(() => {
        const o = document.getElementById('corbeille-selection-overlay');
        return {
            titre: o.querySelector('.modal-titre').textContent.trim(),
            texte: o.textContent.replace(/\s+/g, ' ').trim(),
            bouton: document.getElementById('corbeille-selection-btn-confirmer').textContent.trim()
        };
    });
}

test('Porte #1174 · trois copies cochées dont deux évaluées : « Annuler » n\'écrit rien ; confirmer met tout à la corbeille, les notes restent ; « Restaurer » en ramène une', async ({ page }) => {
    test.setTimeout(120000);
    const suivi = await monter(page);
    await ouvrirLaListe(page);
    const avant = await lireStock(page);

    // 1. La question : trois copies, deux évaluées nommées, aucune reprise.
    const q = await cocherToutEtOuvrir(page);
    expect(q.titre).toBe('Mettre 3 copies à la corbeille ?');
    expect(q.bouton).toBe('Mettre 3 copies à la corbeille');
    expect(q.texte).toContain('Tu pourras les restaurer depuis la corbeille pendant 30 jours.');
    expect(q.texte).toContain('2 copies déjà évaluées : leur évaluation et leur note restent dans la liste, sans copie liée.');
    expect(q.texte).toContain('Camille Roy');
    expect(q.texte).toContain('Léa Gagnon');
    expect(q.texte).not.toContain('reprise');
    expect(q.texte).not.toContain('TEST1174');

    // 2. « Annuler » : la question part, le stockage est identique.
    await page.evaluate(() => document.querySelector('#corbeille-selection-overlay .modal-actions [data-action="fermerOverlayParent"]').click());
    await page.waitForFunction(() => !document.getElementById('corbeille-selection-overlay'), null, { timeout: 10000 });
    expect(await lireStock(page)).toBe(avant);

    // 3. Confirmer : les trois copies à la corbeille (même date), les évaluations intactes, la sélection vide.
    await page.evaluate(() => window.viderSelectionEval());
    await cocherToutEtOuvrir(page);
    await page.evaluate(() => document.getElementById('corbeille-selection-btn-confirmer').click());
    await page.waitForFunction(() => !document.getElementById('corbeille-selection-overlay')
        && document.getElementById('eval-barre-selection').classList.contains('u-hide'), null, { timeout: 10000 });
    const apres = await page.evaluate(() => {
        const c = window.db.getSync(window.cle('corbeilleFichiers'), []);
        return {
            actives: window.db.getSync(window.cle('fichiersTravaux'), []).length,
            corbeille: c.map(f => f.id).sort(),
            dates: new Set(c.map(f => f.dateSuppression)).size,
            evaluations: window.db.getSync(window.cle('evaluationsSauvegardees'), []).map(e => [e.id, e.noteFinale, e.verrouillee]),
            bouton: (document.getElementById('btn-corbeille-eval') || {}).textContent,
            cases: document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').length,
            lignes: document.querySelectorAll('#corps-tableau-evaluations tr').length
        };
    });
    expect(apres).toEqual({
        actives: 0, corbeille: ['FT1174A', 'FT1174B', 'FT1174C'], dates: 1,
        evaluations: [['EV1174B', 48.8, false], ['EV1174C', 70, true]],   // verrouillée ou non : la note reste
        bouton: 'Corbeille (3)', cases: 0, lignes: 3
    });
    expect(JSON.parse(avant).e).toEqual(JSON.parse(await lireStock(page)).e);   // aucune évaluation touchée

    // 4. « Restaurer » depuis la corbeille en ramène une.
    await page.evaluate(() => window.basculerVueCorbeille());
    await page.waitForFunction(() => !!document.querySelector('[data-action="restaurerFichierCorbeille"][data-param="FT1174B"]'), null, { timeout: 10000 });
    await page.evaluate(() => document.querySelector('[data-action="restaurerFichierCorbeille"][data-param="FT1174B"]').click());
    await page.waitForFunction(() => window.db.getSync(window.cle('fichiersTravaux'), []).length === 1, null, { timeout: 10000 });
    const restaure = await page.evaluate(() => ({
        actives: window.db.getSync(window.cle('fichiersTravaux'), []).map(f => [f.id, f.dateSuppression || null]),
        corbeille: window.db.getSync(window.cle('corbeilleFichiers'), []).map(f => f.id).sort()
    }));
    expect(restaure).toEqual({ actives: [['FT1174B', null]], corbeille: ['FT1174A', 'FT1174C'] });
    expect(suivi.dialogues, 'aucune porte une par une').toEqual([]);
    expect(suivi.erreurs).toEqual([]);
});

test('Porte #1174 · en anonymisation, la question ne montre aucun nom réel', async ({ page }) => {
    test.setTimeout(120000);
    const suivi = await monter(page);
    await page.evaluate(() => window.changerMode('anonymisation'));
    await page.waitForFunction(() => window.estModeAnonymisation && window.estModeAnonymisation(), null, { timeout: 10000 });
    await ouvrirLaListe(page);
    const q = await cocherToutEtOuvrir(page);
    expect(q.titre).toBe('Mettre 3 copies à la corbeille ?');
    expect(q.texte).toContain('2 copies déjà évaluées');
    for (const nom of NOMS_REELS) expect(q.texte, `« ${nom} » affiché en anonymisation`).not.toContain(nom);
    expect(q.texte).not.toContain('TEST1174');
    expect(suivi.erreurs).toEqual([]);
});

async function mesurerLaBarre(page, largeur) {
    await monter(page);
    await ouvrirLaListe(page);
    await page.evaluate(() => document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').forEach(cb => cb.click()));
    await page.waitForFunction(() => !document.getElementById('eval-barre-selection').classList.contains('u-hide'), null, { timeout: 10000 });
    const m = await page.evaluate(() => {
        const barre = document.getElementById('eval-barre-selection');
        const rb = barre.getBoundingClientRect();
        const boutons = Array.from(barre.querySelectorAll('button')).map(b => { const r = b.getBoundingClientRect(); return { g: r.left, d: r.right, h: r.height, texte: b.textContent.trim() }; });
        return { tactile: matchMedia('(pointer: coarse)').matches, debordeBarre: barre.scrollWidth > barre.clientWidth + 1,
            dansLaBarre: boutons.every(b => b.g >= rb.left - 1 && b.d <= rb.right + 1), boutons };
    });
    expect(m.boutons.map(b => b.texte)).toEqual(['Réassigner la sélection (3)', 'Mettre à la corbeille (3)', 'Tout décocher']);
    expect(m.debordeBarre).toBe(false);
    expect(m.dansLaBarre).toBe(true);

    if (dossierCaptures) {
        await page.evaluate(() => document.getElementById('eval-btn-corbeille-selection').click());
        await page.waitForFunction(() => !!document.getElementById('corbeille-selection-overlay'), null, { timeout: 10000 });
        for (const sombre of [false, true]) {
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await page.evaluate(() => { document.getElementById('corbeille-selection-overlay').style.display = 'none'; });
            await page.locator('#eval-barre-selection').screenshot({ path: path.join(dossierCaptures, `barre-${largeur}-${sombre ? 'sombre' : 'clair'}.png`) });
            await page.evaluate(() => { document.getElementById('corbeille-selection-overlay').style.display = ''; });
            await page.screenshot({ path: path.join(dossierCaptures, `confirmation-${largeur}-${sombre ? 'sombre' : 'clair'}.png`) });
        }
    }
    return m;
}

test.describe('Porte #1174 · Mac, 1440 px', () => {
    test.use({ viewport: { width: 1440, height: 900 } });
    test('la barre tient ses trois boutons sans déborder', async ({ page }) => {
        test.setTimeout(120000);
        await mesurerLaBarre(page, 1440);
    });
});

test.describe('Porte #1174 · iPad, 820 px au doigt', () => {
    test.use({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true });
    test('la barre tient ses trois boutons sans déborder, chacun de 44 px au moins', async ({ page }) => {
        test.setTimeout(120000);
        const m = await mesurerLaBarre(page, 820);
        expect(m.tactile, 'le banc émule bien un pointeur tactile').toBe(true);
        // 28 px à la souris ; 44 px au doigt par la règle T-A10 (`.btn`, styles.css), mesuré le 27 oct.
        for (const b of m.boutons) expect(b.h, b.texte).toBeGreaterThanOrEqual(44);
    });
});
