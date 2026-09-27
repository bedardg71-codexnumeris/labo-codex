import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #965 — « MON ÉVALUATION ME DIT SI ELLE ARRIVE TROP TÔT », à l'écran.
//
// Une évaluation de la carte démo (fictive) passe par les quatre états, sans
// reconstruire la carte : la pastille de son en-tête suit (même point de
// rafraîchissement que les pastilles d'objectifs). L'Inspecteur de
// l'évaluation montre la légende des quatre états.
// Avec CAPTURES_965=<dossier>, l'essai dépose une capture de chaque état, en
// mode sombre puis clair : c'est ce que Grégoire juge (couleurs).

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

/** Leçon 1 en semaine 1, leçon 2 en semaine 2 ; trois objectifs ; l'évaluation de la leçon 1. */
const preparer = (page) => page.evaluate(() => {
    const api = window.planificationCarte;
    const lecons = [...api.etat.noeuds.values()].filter(n => n.type === 'lecon')
        .sort((a, b) => a.titre.localeCompare(b.titre));
    const [l1, l2] = lecons;
    api.definirSemaineLecon(l1.id, 1);
    api.definirSemaineLecon(l2.id, 2);
    api.definirObjectifsLecon(l1.id, ['Objectif fictif enseigné', 'Objectif fictif jamais servi']);
    api.definirObjectifsLecon(l2.id, ['Objectif fictif enseigné plus tard']);
    const [oAvant, oJamais] = api.objectifsDeLecon(l1).map(o => o.id);
    const oTard = api.objectifsDeLecon(l2)[0].id;
    const enfants = (l) => l.enfants.map(id => api.etat.noeuds.get(id));
    const act1 = enfants(l1).find(n => n.type === 'activite');
    const act2 = enfants(l2).find(n => n.type === 'activite');
    api.definirObjectifsServis(act1.id, [oAvant]);
    api.definirObjectifsServis(act2.id, [oTard]);
    const ev = enfants(l1).find(n => n.type === 'evaluation');
    const ordre = l1.enfants;
    api.definirObjectifsServis(ev.id, []);
    return { ev: ev.id, oAvant, oJamais, oTard, actAuDessus: ordre.indexOf(act1.id) < ordre.indexOf(ev.id) };
});

const ETATS = [
    { cle: 'aucun', symbole: '!', objectifs: () => [], texte: 'Aucun objectif relié : cette évaluation ne dit pas ce qu\'elle vérifie.' },
    { cle: 'nonEnseigne', symbole: '✕', objectifs: (ids) => [ids.oJamais], texte: 'Un objectif vérifié n\'est servi par aucun bloc : il n\'a pas été enseigné.' },
    { cle: 'apres', symbole: '⚠', objectifs: (ids) => [ids.oTard], texte: 'Un objectif vérifié n\'est servi qu\'après cette évaluation.' },
    { cle: 'avant', symbole: '✓', objectifs: (ids) => [ids.oAvant], texte: 'Chaque objectif vérifié a été enseigné avant cette évaluation.' }
];

test.describe('#965 · la pastille d’une évaluation', () => {
    test('quatre états, suivis sans reconstruire la carte ; légende dans l’Inspecteur', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        // Précondition de la carte démo : l'activité est AU-DESSUS de l'évaluation.
        expect(ids.actAuDessus).toBe(true);
        const pastille = page.locator('#' + ids.ev + ' .planif-noeud-entete .planif-eval-pastille');
        const dossier = process.env.CAPTURES_965;

        for (const theme of dossier ? ['sombre', 'clair'] : ['sombre']) {
            await page.evaluate((t) => document.body.classList.toggle('mode-clair', t === 'clair'), theme);
            for (const e of ETATS) {
                await page.evaluate(([id, objs]) => window.planificationCarte.definirObjectifsServis(id, objs), [ids.ev, e.objectifs(ids)]);
                await expect(pastille).toHaveClass(new RegExp('planif-eval-pastille--' + e.cle + '(\\s|$)'));
                await expect(pastille).toHaveText(e.symbole);
                await expect(pastille).toHaveAttribute('title', e.texte);
                if (dossier) {
                    await page.locator('#' + ids.ev).screenshot({ path: path.join(dossier, `965-${theme}-${e.cle}.png`) });
                }
            }
        }

        await page.locator('#' + ids.ev).dispatchEvent('dblclick');
        const legende = page.locator('#planif-panneau .planif-legende-pastilles')
            .filter({ has: page.locator('.planif-eval-pastille') });
        await expect(legende.locator('.planif-legende-pastille-texte')).toHaveText(ETATS.map(e => e.texte));
    });
});
