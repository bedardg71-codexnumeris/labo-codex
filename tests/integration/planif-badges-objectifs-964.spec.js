import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #964 — « MES BADGES SUIVENT MES OBJECTIFS » (27 sept. 2026), à l'écran.
//
// Le geste que Grégoire fera : double-clic sur une évaluation, l'Inspecteur
// montre « Objectifs vérifiés » — sa leçon, puis les leçons placées avant elle ;
// cocher l'objectif d'une leçon précédente donne à l'évaluation son ✓ amont, et
// la pastille de l'objectif, dans l'autre leçon, passe à « vérifié ».
//
// La carte est celle du mode démo (fictive), complétée ici : deux leçons
// placées (semaines 1 et 2), un objectif chacune, un bloc qui les sert.

async function ouvrirCarte(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
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
    await expect(page.locator('.planif-noeud').first()).toBeVisible();
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

/** Pose deux leçons en semaines 1 et 2 avec un objectif chacune ; rend les ids utiles. */
const preparer = (page) => page.evaluate(() => {
    const api = window.planificationCarte;
    const lecons = [...api.etat.noeuds.values()].filter(n => n.type === 'lecon')
        .sort((a, b) => a.titre.localeCompare(b.titre));
    const [l1, l2] = lecons;
    // Objectifs dépliés sur le bloc : c'est là que vivent les pastilles.
    l1.metadata.objectifDeplie = true;
    api.definirSemaineLecon(l1.id, 1);
    api.definirSemaineLecon(l2.id, 2);
    api.definirObjectifsLecon(l1.id, ['Repérer une posture fictive']);
    api.definirObjectifsLecon(l2.id, ['Annoter un poème fictif']);
    const o1 = api.objectifsDeLecon(l1)[0].id;
    const act1 = l1.enfants.map(id => api.etat.noeuds.get(id)).find(n => n.type === 'activite');
    api.definirObjectifsServis(act1.id, [o1]);
    const ev2 = l2.enfants.map(id => api.etat.noeuds.get(id)).find(n => n.type === 'evaluation');
    // L'évaluation part SANS rien : ni objectif, ni lien « se vérifie par ».
    // Les liens retirés d'abord ; l'écriture qui suit sauvegarde et rafraîchit
    // tous les badges (`sauvegarder` → `mettreAJourTousLesBadges`).
    // Tous les liens vers une évaluation partent : la démo relie l'activité de
    // la leçon 1 à l'évaluation de sa leçon, ce qui vérifierait déjà l'objectif
    // (règle transitive, conservée) et masquerait l'effet du geste.
    for (const [id, l] of [...api.etat.liens]) {
        const bouts = [api.etat.noeuds.get(l.source), api.etat.noeuds.get(l.cible)];
        if (bouts.some(n => n && n.type === 'evaluation')) api.etat.liens.delete(id);
    }
    api.definirObjectifsServis(ev2.id, []);
    return { l1: l1.id, l1Titre: l1.titre, l2: l2.id, o1, ev2: ev2.id };
});

test.describe('#964 · l’évaluation coche les objectifs qu’elle vérifie', () => {
    test('Inspecteur : sa leçon puis la précédente ; cocher lève le badge et la pastille', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);

        await page.locator('#' + ids.ev2).dispatchEvent('dblclick');
        const bloc = page.locator('#planif-objectifs-servis');
        await expect(bloc).toBeVisible();
        await expect(page.locator('#planif-objectifs-servis').locator('xpath=preceding-sibling::label[1]'))
            .toHaveText('Objectifs vérifiés');
        await expect(bloc.locator('.planif-objectifs-servis-groupe')).toHaveText([
            'Cette leçon',
            'Leçon « ' + ids.l1Titre + ' » (semaine 1)'
        ]);

        const badgeAmont = page.locator('#' + ids.ev2 + ' .planif-badge-entree');
        await expect(badgeAmont).toHaveText('!');
        const pastille = page.locator('#' + ids.l1 + ' .planif-obj-pastille[data-obj-id="' + ids.o1 + '"]');
        await expect(pastille).toHaveClass(/planif-obj-pastille--servi/);

        // Clic porté sur la case elle-même : dans le viewport de l'essai, une
        // palette flottante recouvre l'Inspecteur (mesuré sous Chromium).
        await bloc.locator('input[data-obj-id="' + ids.o1 + '"]').evaluate((el) => el.click());

        await expect(badgeAmont).toHaveText('✓');
        await expect(pastille).toHaveClass(/planif-obj-pastille--verifie/);
        expect(await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).metadata.objectifsServis, ids.ev2))
            .toEqual([ids.o1]);
    });

    // R3 (a) — relecture de Cowork, 28 sept. : les cases de l'Inspecteur
    // réécrivent la liste entière. Un objectif coché dont la leçon n'est plus
    // « avant » doit garder sa case, sinon cocher autre chose l'efface.
    test('un objectif coché d’une leçon devenue postérieure survit quand on coche une autre case', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        const o2 = await page.evaluate(({ l2, ev2, o1 }) => {
            const api = window.planificationCarte;
            api.definirObjectifsLecon(l2, ['Objectif fictif de la leçon 2']);
            api.definirObjectifsServis(ev2, [o1]);
            api.definirSemaineLecon(l2, 1);   // leçon 2 (celle de l'évaluation) → semaine 1
            return api.objectifsDeLecon(api.etat.noeuds.get(l2))[0].id;
        }, ids);
        await page.evaluate(({ l1 }) => window.planificationCarte.definirSemaineLecon(l1, 3), ids); // leçon 1 → semaine 3, APRÈS

        await page.locator('#' + ids.ev2).dispatchEvent('dblclick');
        const bloc = page.locator('#planif-objectifs-servis');
        await expect(bloc.locator('input[data-obj-id="' + ids.o1 + '"]')).toBeChecked();
        await bloc.locator('input[data-obj-id="' + o2 + '"]').evaluate((el) => el.click());

        const coches = await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).metadata.objectifsServis, ids.ev2);
        expect(coches).toHaveLength(2);
        expect(coches).toEqual(expect.arrayContaining([ids.o1, o2]));
    });
});
