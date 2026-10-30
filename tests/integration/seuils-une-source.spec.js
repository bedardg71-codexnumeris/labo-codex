import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// UNE SEULE SOURCE PAR FAMILLE DE SEUILS (décision de Grégoire, 30 oct. 2026), dans un vrai WebKit, sur le pack de
// démo : A et C suivent les champs de Labo › Outils d'observation, P suit les repères de l'échelle.

async function demo(page, avant) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.PACK_DEMARRAGE, null, { timeout: 30000 });
    await page.evaluate(() => db.setSync('backupNePlusRappeler', 'true'));
    if (avant) await page.evaluate(avant);
    await page.evaluate(() => window.activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo && window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    await page.evaluate(() => naviguerVers('tableau-bord', 'apercu'));
    await page.locator('#btn-toggle-panneau-prioritaire').click();
    await expect(page.locator('.prioritaire-tri-btn').first()).toBeVisible();
}

const LIRE = `() => ({
    filtres: [...document.querySelectorAll('.prioritaire-tri-btn')].map((b) => b.textContent.replace(/\\u00a0/g, ' ')),
    pastilles: [...document.querySelectorAll('.etudiant-suivi-item')].map((i) => [...i.querySelectorAll('.prioritaire-indice')].map((c) => c.textContent.replace(/\\u00a0/g, ' ').trim() + (c.className.includes('critique') ? ' R' : c.className.includes('attention') ? ' J' : ''))),
    fond: [...document.querySelectorAll('.barre-indicateur')].map((b) => b.style.background)
})`;

test('sans rien d’enregistré : les défauts 95 · 90 · 85 et les repères de l’échelle commandent filtres, pastilles et barres', async ({ page }) => {
    await demo(page);
    const r = await page.evaluate('(' + LIRE + ')()');
    expect(r.filtres).toContain('A ou C < 85 %');
    expect(r.filtres).toContain('P < 65 %');
    // La fiche fictive de la capture du 30 oct. : A 84 et C 80 au palier le plus bas, P 68 entre les deux repères.
    expect(r.pastilles.flat()).toEqual(expect.arrayContaining(['A 84 % R', 'C 80 % R', 'P 68 % J']));
    // Aucune fiche à P sous le premier repère dans ce pack : le rouge de P n'y paraît pas.
    expect(r.pastilles.flat().some((t) => t.startsWith('P') && t.endsWith(' R'))).toBe(false);
    expect(r.fond).toHaveLength(3);
    // A : la première zone (rouge) ferme à 85 %, soit (85 − 30) / 70 de la barre.
    expect(r.fond[0]).toContain('78.57');
    // P : la première zone ferme au repère de suffisance, 65 %, soit la moitié de la barre.
    expect(r.fond[2]).toContain('50%');
});

test('un réglage enregistré n’est pas réécrit, et tout le suit ; idme figé reste dans l’objet sans être lu', async ({ page }) => {
    const enregistre = { nombreProductionsAnalyse: 3, progressionArtefacts: 0.05, directionRisque: 0.05, defiSpecifique: 0.7,
        idme: { insuffisant: 0.64, developpement: 0.75, maitrise: 0.85 }, interpretation: { excellent: 0.75, bon: 0.7, acceptable: 0.65 } };
    await demo(page, `db.setSync('seuilsInterpretation', ${JSON.stringify(enregistre)})`);
    const r = await page.evaluate('(' + LIRE + ')()');
    expect(r.filtres).toContain('A ou C < 65 %');
    expect(r.pastilles.flat()).toEqual(expect.arrayContaining(['A 84 %', 'C 80 %']));
    expect(await page.evaluate(() => db.getSync('seuilsInterpretation', null))).toEqual(enregistre);
});

test('Outils d’observation : le champ du bas accepte 85, le désordre est refusé, « Restaurer » lit les défauts, l’Aide aussi', async ({ page }) => {
    await demo(page);
    await page.evaluate(() => naviguerVers('labo', 'outils-observation')).catch(() => {});
    const r = await page.evaluate(() => {
        const champ = (id) => document.getElementById(id);
        const poser = (b, a, h) => { champ('v2-seuil-fragile').value = b; champ('v2-seuil-acceptable').value = a; champ('v2-seuil-bon').value = h; };
        const lu = () => db.getSync('seuilsInterpretation', null)?.interpretation ?? null;
        const max = champ('v2-seuil-fragile').max;
        poser(86, 91, 96);
        const accepte = window.sauvegarderSeuilsV2();
        const apres = lu();
        poser(91, 86, 96);
        const refuse = window.sauvegarderSeuilsV2();
        const apresRefus = lu();
        window.restaurerSeuilsInterpretationDefautV2();
        const restaure = lu();
        const aide = [...document.querySelectorAll('#aide-table-paliers-a-c tbody tr')].map((l) => [...l.children].map((c) => c.textContent.replace(/ /g, ' ')));
        return { max, accepte, apres, refuse, apresRefus, restaure, aide };
    });
    expect(Number(r.max)).toBeGreaterThanOrEqual(85);
    expect(r.accepte).toBeTruthy();
    expect(r.apres).toEqual({ excellent: 0.96, bon: 0.91, acceptable: 0.86 });
    expect(r.refuse).toBe(false);
    expect(r.apresRefus).toEqual(r.apres);
    expect(r.restaure).toEqual({ excellent: 0.95, bon: 0.9, acceptable: 0.85 });
    expect(r.aide).toEqual([
        ['≥ 95 %', 'Aucune absence ou presque', 'Aucun travail manquant ou presque'],
        ['90-94 %', 'Absences rares', 'Travaux manquants rares'],
        ['85-89 %', 'Quelques absences', 'Quelques travaux manquants'],
        ['< 85 %', 'Absences très fréquentes', 'Travaux manquants très fréquents']
    ]);
});
