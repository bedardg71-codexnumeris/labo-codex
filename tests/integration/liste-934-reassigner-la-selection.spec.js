import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #934 (22 septembre 2026) — « RÉASSIGNER LA SÉLECTION » DEPUIS LA LISTE DES ÉVALUATIONS.
//
// Le geste de Grégoire du 22 sept. au matin, mais en un coup : filtrer sur la production où l'import
// s'est trompé (« Artefact 2 »), cocher les lignes qui portent une copie, « Réassigner la sélection (3) »,
// choisir « Artefact 2 (rév) ». La question groupée COMPTE, NOMME les fichiers (la liste ne les affiche
// pas) et LISTE le conflit (Sara a déjà une copie sous la cible : elle ira à la corbeille) avant d'écrire.
// « Annuler » ne déplace rien. Confirmer déplace les trois copies par le geste unique (#932) et met
// l'existante en conflit à la corbeille.
//
// ⚠ Le pack démo ne porte AUCUNE copie (`fichiersTravaux` absent de `js/demo-*.js`, mesuré le 22 sept.) :
// le montage pose sa propre fixture, recette des portes #651 et #868. Aucun `page.click` ni
// `waitForTimeout` (règle du 4 septembre) : les cases et boutons sont cliqués par `el.click()` — le vrai
// dispatcher de main.js —, et on attend des RENDUS.

const A2 = 'p934-a2', A2R = 'p934-a2r';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

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
        && typeof window.reassignerSelectionEval === 'function' && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate(({ A2, A2R }) => {
        const t = 'test934';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-934';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_934' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_934', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_934', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST934A', nom: 'Exemple', prenom: 'Sara', groupe: '01', coursId },
            { da: 'TEST934B', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId },
            { da: 'TEST934C', nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test
            { id: A2, titre: 'Artefact 2', type: 'travail', ponderation: 50 },
            { id: A2R, titre: 'Artefact 2 (rév)', type: 'travail', ponderation: 50 }
        ]);
        const copie = (id, da, prod, nomFichier) => ({
            id, etudiantDA: da, productionId: prod, coursId, groupeCoursId: 'GC_934',
            nomFichier, typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-22T12:00:00.000Z', dateModification: '2026-09-22T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        // Trois copies importées sous « Artefact 2 » par erreur ; Sara a DÉJÀ une copie sous « Artefact 2 (rév) ».
        window.db.setSync(window.cle('fichiersTravaux'), [ // security-ok: fixture de test
            copie('FT934A', 'TEST934A', A2, 'Exemple_Artefact_2_revise.png'),
            copie('FT934B', 'TEST934B', A2, 'Roy_Artefact_2_revise.png'),
            copie('FT934C', 'TEST934C', A2, 'Gagnon_Artefact_2_revise.png'),
            copie('FT934A_OLD', 'TEST934A', A2R, 'Exemple_Artefact_1.png')
        ]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), []); // security-ok: fixture de test
        window.db.setSync(window.cle('corbeilleFichiers'), []); // security-ok: fixture de test
    }, { A2, A2R });
    return suivi;
}

async function ouvrirLaListeFiltreeSur(page, productionId) {
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active'), null, { timeout: 10000 });
    await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-liste.sous-section.active')
        && document.querySelectorAll('#corps-tableau-evaluations tr').length > 0, null, { timeout: 10000 });
    await page.evaluate((pid) => {
        const f = document.getElementById('filtre-production-eval');
        f.value = pid;
        window.filtrerListeEvaluations();
    }, productionId);
    await page.waitForFunction((pid) => {
        const lignes = Array.from(document.querySelectorAll('#corps-tableau-evaluations tr'));
        return lignes.length === 3 && lignes.every(tr => tr.dataset.productionId === pid);
    }, productionId, { timeout: 10000 });
}

const lireCopies = (page) => page.evaluate(() => ({
    actives: (window.db.getSync(window.cle('fichiersTravaux'), []) || []).map(f => [f.id, f.productionId]).sort(),
    corbeille: (window.db.getSync(window.cle('corbeilleFichiers'), []) || []).map(f => f.id).sort()
}));

const COPIES_AVANT = { actives: [['FT934A', A2], ['FT934A_OLD', A2R], ['FT934B', A2], ['FT934C', A2]], corbeille: [] };

/** Coche les trois lignes affichées par le VRAI clic (dispatcher `data-on-change`), puis ouvre la modale sur la cible. */
async function cocherToutEtChoisirLaCible(page, cibleId) {
    await page.evaluate(() => document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').forEach(cb => cb.click()));
    await page.waitForFunction(() => {
        const barre = document.getElementById('eval-barre-selection');
        return barre && !barre.classList.contains('u-hide') && document.getElementById('eval-btn-reassigner-selection').textContent === 'Réassigner la sélection (3)';
    }, null, { timeout: 10000 });
    await page.evaluate(() => document.getElementById('eval-btn-reassigner-selection').click());
    await page.waitForFunction(() => !!document.getElementById('reassigner-selection-overlay'), null, { timeout: 10000 });
    await page.evaluate((pid) => {
        const s = document.getElementById('reassigner-selection-cible');
        s.value = pid;
        s.dispatchEvent(new Event('change', { bubbles: true }));
    }, cibleId);
    await page.waitForFunction(() => !document.getElementById('reassigner-selection-btn-confirmer').disabled, null, { timeout: 10000 });
    return page.evaluate(() => ({
        titre: document.querySelector('#reassigner-selection-overlay .modal-titre').textContent.trim(),
        recap: document.getElementById('reassigner-selection-recap').textContent.replace(/\s+/g, ' ').trim(),
        bouton: document.getElementById('reassigner-selection-btn-confirmer').textContent.trim(),
        casesCochees: document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb:checked').length,
        casesSansCopie: Array.from(document.querySelectorAll('#corps-tableau-evaluations tr')).filter(tr => !tr.querySelector('.eval-selection-cb')).length
    }));
}

test('Porte #934 · trois copies cochées, une en conflit : la question nomme le conflit ; « Annuler » ne déplace rien ; confirmer déplace tout', async ({ page }) => {
    test.setTimeout(120000);
    const suivi = await monter(page);
    await ouvrirLaListeFiltreeSur(page, A2);
    expect(await lireCopies(page)).toEqual(COPIES_AVANT);

    // 1. La question groupée : 3 copies, chaque fichier nommé, 1 conflit nommé (existant → arrivant).
    const q = await cocherToutEtChoisirLaCible(page, A2R);
    expect(q.casesCochees).toBe(3);
    expect(q.titre).toBe('Réassigner 3 copies');
    expect(q.bouton).toBe('Réassigner 3 copies');
    expect(q.recap).toContain('3 copies vers « Artefact 2 (rév) »');
    expect(q.recap).toContain('Sara Exemple — Exemple_Artefact_2_revise.png');
    expect(q.recap).toContain('Camille Roy — Roy_Artefact_2_revise.png');
    expect(q.recap).toContain('Léa Gagnon — Gagnon_Artefact_2_revise.png');
    expect(q.recap).toContain('1 conflit');
    expect(q.recap).toContain('Sara Exemple : Exemple_Artefact_1.png → remplacé par Exemple_Artefact_2_revise.png');
    expect(q.recap).toContain('corbeille');

    // 2. « Annuler » : la modale part, rien ne bouge.
    await page.evaluate(() => document.querySelector('#reassigner-selection-overlay .modal-actions [data-action="fermerOverlayParent"]').click());
    await page.waitForFunction(() => !document.getElementById('reassigner-selection-overlay'), null, { timeout: 10000 });
    expect(await lireCopies(page)).toEqual(COPIES_AVANT);
    expect(suivi.dialogues, 'aucune porte une par une : la question est groupée').toEqual([]);

    // 3. Confirmer : les trois copies passent sous la cible, l'existante de Sara part à la corbeille.
    await page.evaluate(() => window.viderSelectionEval());
    const q2 = await cocherToutEtChoisirLaCible(page, A2R);
    expect(q2.bouton).toBe('Réassigner 3 copies');
    await page.evaluate(() => document.getElementById('reassigner-selection-btn-confirmer').click());
    await page.waitForFunction(() => !document.getElementById('reassigner-selection-overlay'), null, { timeout: 10000 });
    await page.waitForFunction(() => {
        const f = window.db.getSync(window.cle('fichiersTravaux'), []) || [];
        return f.length === 3 && f.every(x => x.productionId === 'p934-a2r');
    }, null, { timeout: 10000 });
    expect(await lireCopies(page)).toEqual({ actives: [['FT934A', A2R], ['FT934B', A2R], ['FT934C', A2R]], corbeille: ['FT934A_OLD'] });
    expect(suivi.dialogues).toEqual([]);

    // 4. Après le rendu, la liste filtrée sur « Artefact 2 » n'a plus de copie à cocher, et la barre est repliée.
    await page.waitForFunction(() => document.getElementById('eval-barre-selection').classList.contains('u-hide'), null, { timeout: 10000 });
    const apres = await page.evaluate(() => ({
        lignes: document.querySelectorAll('#corps-tableau-evaluations tr').length,
        cases: document.querySelectorAll('#corps-tableau-evaluations .eval-selection-cb').length,
        toutDesactive: document.getElementById('eval-tout-selectionner').disabled
    }));
    expect(apres).toEqual({ lignes: 3, cases: 0, toutDesactive: true });
    expect(suivi.erreurs).toEqual([]);
});
