import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1039 (7 oct. 2026) — LE GÉNÉRATEUR D'ÉQUIPES, DANS LA VRAIE PAGE, PAR LE GESTE.
//
// Suivi › Animation : la barre latérale montre UN outil à la fois (modèle du profil) ; l'outil Équipes
// écarte l'absent du jour (fiche du jour à 0 période posée par le banc : le pack démo n'a pas de séance
// « aujourd'hui »), DEMANDE le reste avant de former, et place chaque présent dans une et une seule équipe.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('#1039 · barre latérale, absent du jour écarté, reste demandé, chaque présent dans une équipe', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    page.on('dialog', (d) => d.dismiss());
    await page.setViewportSize({ width: 1280, height: 900 });
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

    // Le pack démo, puis UN absent aujourd'hui (fiche à 0 période pour le cours actif).
    const prep = await page.evaluate(async () => {
        await window.activerModeDemo();
        await new Promise((r) => setTimeout(r, 1500));
        const eleves = obtenirEtudiantsCoursActif().filter((e) => !estEtudiantExclu(e));
        const absent = eleves[0];
        const coursId = db.getSync('infoCours', null)?.id;
        const presences = obtenirDonneesSelonMode('presences') || [];
        presences.push({ da: absent.da, date: window.dateLocaleYMD(), periodesPresentes: 0, notes: '', coursId });
        sauvegarderDonneesSelonMode('presences', presences, { geste: 'banc #1039' });
        afficherSection('suivi');
        afficherSousSection('suivi-animation');
        return { das: eleves.map((e) => e.da), absent: absent.da };
    });
    await page.waitForTimeout(600);

    // Un seul outil visible à la fois ; Questions flash par défaut.
    await expect(page.locator('#questions-container')).toBeVisible();
    await expect(page.locator('#tirage-container')).toBeHidden();
    await expect(page.locator('#equipes-container')).toBeHidden();

    await page.locator('#suivi-animation .sidebar-item[data-param="equipes"]').click();
    await expect(page.locator('#equipes-container')).toBeVisible();
    await expect(page.locator('#questions-container')).toBeHidden();
    await expect(page.locator('#suivi-animation .sidebar-item[data-param="equipes"]')).toHaveAttribute('aria-pressed', 'true');

    const presents = prep.das.length - 1;
    await expect(page.locator('.equipes-constat')).toContainText(`${presents} étudiant·es présent·es aujourd'hui ; 1 absence écartée d'après les présences.`);

    // Bouton inerte tant que la taille n'est pas choisie.
    const former = page.locator('[data-action="formerEquipesAnimation"]');
    await expect(former).toBeDisabled();
    await page.locator('input[name="equipes-taille"][value="4"]').check();

    const reste = presents % 4;
    if (reste > 0) {
        // Le reste est DEMANDÉ : pas de choix par défaut, bouton inerte jusqu'à la réponse.
        await expect(page.locator('input[name="equipes-reste"]:checked')).toHaveCount(0);
        await expect(page.locator('#equipes-contenu legend').nth(1)).toContainText(`il en reste ${reste}`);
        await expect(former).toBeDisabled();
        await page.locator('input[name="equipes-reste"][value="petite"]').check();
    }
    await expect(former).toBeEnabled();
    await former.click();

    const equipes = page.locator('.equipes-carte');
    const attendu = Math.floor(presents / 4) + (reste > 0 ? 1 : 0);
    await expect(equipes).toHaveCount(attendu);
    const noms = await page.locator('.equipes-carte li').allTextContents();
    expect(noms.length).toBe(presents);
    expect(new Set(noms).size).toBe(presents);

    // L'absent n'est dans aucune équipe.
    const nomAbsent = await page.evaluate((da) => {
        const e = obtenirEtudiantsCoursActif().find((x) => x.da === da);
        return [e.prenom, e.nom].filter(Boolean).join(' ');
    }, prep.absent);
    expect(noms).not.toContain(nomAbsent);

    // Retenir : la clé du cours reçoit les paires, et l'écran le dit.
    await page.locator('[data-action="retenirEquipes"]').click();
    await expect(page.locator('.equipes-memoire')).toContainText('Ce groupe a des équipes retenues.');
    const memoire = await page.evaluate(() => db.getSync('equipesAnimation_' + db.getSync('infoCours', null)?.id, null));
    expect(memoire.formations).toBe(1);
    expect(memoire.paires.length).toBeGreaterThan(0);

    expect(erreurs).toEqual([]);
});
