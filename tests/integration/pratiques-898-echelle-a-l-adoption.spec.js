import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #898, lot 34 (17 sept. 2026) — ADOPTER UN MODÈLE STANDARDS SANS ÉCHELLE DEMANDE L'ÉCHELLE, DANS LA VRAIE PAGE.
//
// Pack démo, 768 px. Les deux gestes vivants, par leurs boutons réels :
//   (1) l'assistant — « + Nouvelle pratique » → « Partir d'un modèle » → « N plus récentes » → « ✓ Créer la pratique » ;
//   (2) la bibliothèque des pratiques — le bouton « Ajouter » de la carte « N meilleures évaluations ».
// À chaque geste : la question paraît AU-DESSUS de ce qui l'a demandée, avec les mots de Grégoire, les DEUX échelles du
// pack et un bouton « Adopter » inerte ; tant qu'on ne choisit pas, rien n'est écrit ; « Adopter » adopte.
// Puis la promesse du lot, sur un élève du pack : le profil, l'export (fichier lu) et le Comparateur disent la même note.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const QUESTION = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note. Choisis-la :';
const DA = 'DEMO004';

test('#898 · les deux gestes d\'adoption demandent l\'échelle, et les trois écrans disent la même note', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => { d.dismiss(); });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);

    const lirePratiques = () => page.evaluate(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).map(p => ({ id: p.id, nom: p.nom, dansBibliotheque: p.dansBibliotheque, echelleId: p.configuration && p.configuration.echelleId })));
    /** Ce que l'écran montre de la question, et si elle est AU-DESSUS (l'élément atteint au centre du bouton). */
    const lireQuestion = () => page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        if (!o) return null;
        const modale = o.querySelector('[role="dialog"]');
        const boutons = [...o.querySelectorAll('button')];
        const adopter = boutons.find(b => b.textContent.trim() === 'Adopter');
        const r = adopter.getBoundingClientRect();
        const atteint = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const rm = modale.getBoundingClientRect();
        const lignes = [...o.querySelectorAll('.ui-dialogue-choix-ligne')];
        return {
            titre: o.querySelector('.modal-titre').textContent.trim(),
            question: o.querySelector('#ui-dialogue-question').textContent.trim(),
            choix: lignes.map(l => l.textContent.trim()),
            coches: [...o.querySelectorAll('input[type="radio"]')].map(x => x.checked),
            boutons: boutons.map(b => b.textContent.trim()),
            adopterInerte: adopter.disabled,
            auDessus: atteint === adopter,
            dansLEcran: rm.left >= 0 && rm.right <= window.innerWidth && rm.top >= 0 && rm.bottom <= window.innerHeight,
            deborde: modale.scrollWidth > modale.clientWidth + 1,
            hauteurLignes: lignes.map(l => Math.round(l.getBoundingClientRect().height)),
            hauteurAdopter: Math.round(r.height)
        };
    });

    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    await page.waitForTimeout(500);
    const auDepart = await lirePratiques();

    /* ───── GESTE 1 : l'assistant ───── */
    await page.evaluate(() => document.querySelector('button[data-action="creerNouvellePratique"]').click());
    await page.waitForFunction(() => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'));
    const cocherEtSuivant = (nom, valeur) => page.evaluate(({ nom, valeur }) => {
        const el = document.querySelector(`input[name="${nom}"][value="${valeur}"]`);
        if (!el) return 'INTROUVABLE ' + nom + '=' + valeur;
        el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('wizard-v2-btn-suivant').click();
        return 'ok';
    }, { nom, valeur });
    expect(await cocherEtSuivant('porteEntree', 'modele')).toBe('ok');
    await page.waitForFunction(() => window.wizardState.etapeActuelle === 'choix-modele');
    expect(await cocherEtSuivant('modeleChoisi', 'STD-n-recents')).toBe('ok');
    await page.waitForFunction(() => window.wizardState.etapeActuelle === 'recapitulatif');
    await page.evaluate(() => document.getElementById('wizard-v2-btn-creer').click());
    await page.waitForSelector('#overlay-ui-dialogue');

    const q1 = await lireQuestion();
    expect(q1.titre).toBe('N plus récentes');
    expect(q1.question).toBe(QUESTION);
    expect(q1.choix).toEqual(['IDME et niv 0', 'IDME 4 niv']);
    expect(q1.coches).toEqual([false, false]);
    expect(q1.boutons).toEqual(['Annuler', 'Adopter']);
    expect(q1.adopterInerte).toBe(true);
    expect(q1.auDessus, 'la question doit passer au-dessus de l\'assistant').toBe(true);
    expect(q1.dansLEcran).toBe(true);
    expect(q1.deborde).toBe(false);
    for (const h of q1.hauteurLignes) expect(h).toBeGreaterThanOrEqual(44);
    expect(await lirePratiques(), 'rien n\'est adopté tant qu\'on ne choisit pas').toEqual(auDepart);

    // Le clic réel sur la LIGNE (la cible tactile), pas sur le bouton radio.
    await page.click('#overlay-ui-dialogue .ui-dialogue-choix-ligne:nth-child(2)');
    expect((await lireQuestion()).adopterInerte).toBe(false);
    await page.click('#overlay-ui-dialogue button.btn-principal');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    await page.waitForFunction(() => !document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'));
    const apres1 = await lirePratiques();
    const recents = apres1.find(p => !auDepart.some(a => a.id === p.id));
    expect(recents, 'la pratique adoptée par l\'assistant').toBeTruthy();
    const echelles = await page.evaluate(() => (window.db.getSync(window.cle('echellesTemplates'), []) || []).map(e => ({ id: e.id, nom: e.nom })));
    expect(recents.echelleId).toBe(echelles.find(e => e.nom === 'IDME 4 niv').id);

    /* ───── GESTE 2 : la bibliothèque ───── */
    await page.evaluate(() => document.querySelector('button[data-action="afficherBibliothequePratiques"]').click());
    await page.waitForSelector('#modalBibliothequePratiques');
    const SEL_AJOUTER = '#modalBibliothequePratiques [data-action="ajouterPratiqueALaSelection"][data-param="STD-n-meilleurs"]';
    await page.waitForSelector(SEL_AJOUTER);
    await page.evaluate((s) => document.querySelector(s).click(), SEL_AJOUTER);
    await page.waitForSelector('#overlay-ui-dialogue');
    const q2 = await lireQuestion();
    expect(q2.titre).toBe('N meilleures évaluations');
    expect(q2.question).toBe(QUESTION);
    expect(q2.choix).toEqual(['IDME et niv 0', 'IDME 4 niv']);
    expect(q2.adopterInerte).toBe(true);
    expect(q2.auDessus, 'la question doit passer au-dessus de la bibliothèque').toBe(true);
    expect(q2.dansLEcran).toBe(true);
    // « Annuler » : rien n'est écrit, la bibliothèque reste ouverte.
    await page.click('#overlay-ui-dialogue button.btn-neutre');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    expect(await lirePratiques()).toEqual(apres1);
    expect(await page.evaluate(() => !!document.getElementById('modalBibliothequePratiques'))).toBe(true);
    // Puis le même geste, mené au bout.
    await page.evaluate((s) => document.querySelector(s).click(), SEL_AJOUTER);
    await page.waitForSelector('#overlay-ui-dialogue');
    await page.click('#overlay-ui-dialogue .ui-dialogue-choix-ligne:nth-child(1)');
    await page.click('#overlay-ui-dialogue button.btn-principal');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    await page.waitForFunction(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).some(p => p.id === 'STD-n-meilleurs'));
    const meilleures = (await lirePratiques()).find(p => p.id === 'STD-n-meilleurs');
    expect(meilleures.echelleId).toBe(echelles.find(e => e.nom === 'IDME et niv 0').id);

    /* ───── LA PROMESSE : profil = export = Comparateur, pour chacune des deux pratiques adoptées ───── */
    for (const id of [recents.id, 'STD-n-meilleurs']) {
        await page.evaluate((id) => { window.chargerPratiquePourModif(id); }, id);
        await page.waitForTimeout(400);
        await page.evaluate(() => document.querySelector('button[data-action="appliquerPratiqueAuCoursActive"]').click());
        await page.waitForFunction((id) => window.obtenirIdPratiqueActive() === id, id, { timeout: 8000 });
        const ecrans = await page.evaluate(({ da, id }) => {
            window.afficherProfilComplet(da);
            const total = document.querySelector('#contenuProfilEtudiant .note-finale-total');
            const det = window.calculerDetailsNoteFinale(da);
            const sim = window.simulerIndices(da, id);
            return { instance: !!window.obtenirPratiqueParId(id), profilEcran: total ? total.textContent.trim() : null,
                profil: det && !det.erreur ? Math.round(det.noteFinale * 100) / 100 : det,
                comparateur: sim ? Math.round(sim.noteFinale * 100) / 100 : null, constructible: sim ? sim.noteConstructible : null };
        }, { da: DA, id });
        const [dl] = await Promise.all([
            page.waitForEvent('download', { timeout: 8000 }),
            page.evaluate(() => document.querySelector('button[data-action="exporterSyntheseResultatsCSV"]').click())
        ]);
        const csv = readFileSync(await dl.path(), 'utf8');
        const ligne = csv.split(/\r?\n/).find(l => l.includes(DA));
        console.log('MESURE-898 ' + JSON.stringify({ id, ecrans, ligne }));
        expect(ecrans.instance).toBe(true);
        expect(typeof ecrans.comparateur).toBe('number');
        expect(ecrans.profil).toBe(ecrans.comparateur);
        expect(ligne, 'la ligne de l\'élève dans le fichier exporté').toBeTruthy();
        expect(ligne).not.toMatch(/non constructible/i);
        // La note est la cellule qui précède le statut ; l'export écrit la note entière.
        const cellules = ligne.split(/[;,]/).map(c => c.replace(/"/g, '').trim());
        // E7 (28 oct. 2026) : « provisoire » tant que « Notes finalisées » n'est pas cochée (avant : « final »).
        const iStatut = cellules.indexOf('provisoire');
        expect(iStatut, 'le statut « provisoire » dans la ligne exportée').toBeGreaterThan(0);
        expect(cellules[iStatut - 1]).toBe(String(Math.round(ecrans.comparateur)));
    }
    expect(erreurs).toEqual([]);
});
