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

// La garde « carte masquée » et celle du toucher sans mouvement sont prouvées par le banc Vitest
// #433. Ici, le vrai geste : souris enfoncée sur un bloc, glissée jusqu'à la corbeille, relâchée.
test('#1070 — glissé jusqu\'à la corbeille et relâché, le bloc est supprimé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    await ouvrirCarte(page);
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });

    const depart = await page.evaluate(() => {
        const api = window.planificationCarte;
        const zone = document.getElementById('planif-zone-travail');
        window.scrollBy(0, zone.getBoundingClientRect().top);
        const corb = document.getElementById('planif-corbeille').getBoundingClientRect();
        // Un bloc sans parent, visible, loin de la corbeille, et que rien ne recouvre.
        for (const [id, nd] of api.etat.noeuds) {
            if (nd.parent) continue;
            const el = document.getElementById(id);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            const x = r.left + Math.min(20, r.width / 2), y = r.top + Math.min(12, r.height / 2);
            if (r.width === 0 || y > corb.top - 80 || y < 0 || x < 0 || x > innerWidth) continue;
            const dessus = document.elementFromPoint(x, y);
            if (!dessus || !el.contains(dessus)) continue;
            return { id, x, y, cx: corb.left + corb.width / 2, cy: corb.top + corb.height / 2,
                fixe: getComputedStyle(document.getElementById('planif-corbeille')).position,
                avant: api.etat.noeuds.size };
        }
        return null;
    });
    expect(depart, 'un bloc libre et visible sur la carte de démo').not.toBeNull();
    expect(depart.fixe, 'la corbeille est en position fixe : c\'est la condition du défaut').toBe('fixed');

    await page.mouse.move(depart.x, depart.y);
    await page.mouse.down();
    await page.mouse.move((depart.x + depart.cx) / 2, (depart.y + depart.cy) / 2, { steps: 6 });
    await page.mouse.move(depart.cx, depart.cy, { steps: 6 });
    const rouge = await page.evaluate(() => document.getElementById('planif-corbeille').classList.contains('planif-corbeille-survol'));
    await page.mouse.up();

    const r = await page.evaluate((id) => ({ encore: window.planificationCarte.etat.noeuds.has(id),
        apres: window.planificationCarte.etat.noeuds.size }), depart.id);
    expect(rouge, 'la corbeille vire au rouge sous le bloc glissé').toBe(true);
    expect(r.encore, 'relâché sur la corbeille, le bloc est supprimé').toBe(false);
    expect(r.apres).toBeLessThan(depart.avant);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});
