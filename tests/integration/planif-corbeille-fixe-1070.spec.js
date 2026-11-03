import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1070 (3 nov. 2026) — UN BLOC LÂCHÉ SUR LA CORBEILLE DE LA CARTE D'ALIGNEMENT EST SUPPRIMÉ.
// Observé : le bloc relâché sur la corbeille était déplacé. `pointSurCorbeille` sortait dès que
// `offsetParent === null` (« palette masquée ») ; or un élément en `position: fixed` n'a JAMAIS
// d'offsetParent — et la corbeille l'est depuis #444. Le banc Vitest #433 sert un faux
// `offsetParent: {}` : seul un vrai navigateur voit le défaut.

async function ouvrirCarte(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    });
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);
}

// La garde « carte masquée » est prouvée par le banc Vitest #433 : ici, un navigateur rend déjà
// un rectangle nul pour un élément masqué, et l'assertion ne pourrait pas échouer.
test('#1070 — relâché sur la corbeille, le bloc est supprimé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    await ouvrirCarte(page);

    const r = await page.evaluate(() => {
        const api = window.planificationCarte;
        const el = document.getElementById('planif-corbeille');
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const id = [...api.etat.noeuds.keys()][0];
        const avant = api.etat.noeuds.size;
        const supprime = api.deposerDansCorbeille({ clientX: cx, clientY: cy }, id);
        const apres = api.etat.noeuds.size;
        const encore = api.etat.noeuds.has(id);
        return { fixe: getComputedStyle(el).position, id: !!id, avant, apres, supprime, encore,
            largeur: rect.width };
    });

    expect(r.fixe, 'la corbeille est en position fixe : c\'est la condition du défaut').toBe('fixed');
    expect(r.id, 'la carte de démo porte au moins un bloc').toBe(true);
    expect(r.largeur, 'la corbeille a une géométrie à l\'écran').toBeGreaterThan(0);
    expect(r.supprime, 'le dépôt sur la corbeille supprime').toBe(true);
    expect(r.encore).toBe(false);
    expect(r.apres).toBeLessThan(r.avant);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});
