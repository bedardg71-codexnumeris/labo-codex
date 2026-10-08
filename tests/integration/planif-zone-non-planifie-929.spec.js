import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #929 — LA ZONE « NON PLANIFIÉ » SE REND MÊME VIDE (20 sept. 2026).
//
// Retour de Grégoire (1.151.0, Chrome/Mac) : « Le glyphe pivote quand on clique
// dessus, mais le panneau demeure inchangé » — dix clics sur le bouton de
// disposition. Tout était planifié : la zone valait '' et le bouton n'avait
// rien à déplacer. Et la zone étant la SEULE cible de désancrage, plus aucune
// leçon ne pouvait quitter le calendrier par le glisser.
//
// Ce banc fait les gestes de l'écran, dans l'ordre du terrain : tout planifier
// (glisser la séquence sur une semaine), voir la zone vide, puis glisser une
// leçon sur la zone VIDE et une autre sur la zone PLEINE — les deux écritures
// doivent être les mêmes (arrêt de la consigne).
//
// Le bouton ◧ et la réserve « à gauche » sont retirés le 8 oct. 2026 (lot 2 du
// chantier de la carte) : leurs étapes sont parties avec eux ; le retrait se
// verrouille dans `planif-planificateur-dates.spec.js`.

const PHRASE = 'Glisse ici une leçon pour la retirer du calendrier.';
const ZONE = '#planif-sommaire [data-grille-semaine=""]';

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
    await expect(page.locator('#planif-sommaire .planif-grille-rangee').first()).toBeVisible();
    // Le bandeau de transition du mode démo avale les pointerdown en headless
    // (même retrait que planif-drag-pointer-148) — il n'est pas l'objet du test.
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

/** Glisse une pastille de la grille (par son id de nœud) sur une cible de dépôt. */
async function glisser(page, idNoeud, selecteurCible) {
    const item = page.locator(`#planif-sommaire [data-grille-id="${idNoeud}"]`).first();
    await item.scrollIntoViewIfNeeded();
    const a = await item.boundingBox();
    expect(a, `pastille ${idNoeud} introuvable`).not.toBeNull();
    await page.mouse.move(a.x + 14, a.y + a.height / 2);
    await page.mouse.down();
    // La cible se lit APRÈS le pointerdown : le défilement peut l'avoir bougée.
    const b = await page.locator(selecteurCible).first().boundingBox();
    expect(b, `cible ${selecteurCible} introuvable`).not.toBeNull();
    const xb = b.x + b.width / 2;
    const yb = b.y + b.height / 2;
    for (let i = 1; i <= 8; i++) {
        await page.mouse.move(a.x + 14 + (xb - a.x - 14) * i / 8, a.y + a.height / 2 + (yb - a.y - a.height / 2) * i / 8);
        await page.waitForTimeout(30);
    }
    await page.mouse.up();
}

const lireLecons = (page) => page.evaluate(() =>
    Array.from(window.planificationCarte.etat.noeuds.values())
        .filter(n => n.type === 'lecon')
        .map(n => ({ id: n.id, metadata: JSON.parse(JSON.stringify(n.metadata || {})) })));

test.describe('#929 · zone « Non planifié » toujours rendue', () => {
    // Haut, pour que la palette et la zone en pied de grille tiennent à l'écran.
    test.use({ viewport: { width: 1280, height: 1500 } });

    test('tout planifié → zone vide visible ; une leçon glissée dessus quitte sa semaine', async ({ page }) => {
        await ouvrirCarte(page);

        const initial = await lireLecons(page);
        expect(initial.length).toBeGreaterThanOrEqual(2);
        expect(initial.every(l => l.metadata.semaine === undefined)).toBe(true);
        const [l1, l2] = initial;

        // 1. TOUT PLANIFIER, par le geste : la séquence glissée sur la semaine 1
        //    ancre tout son bloc (« le dépôt EST l'assignation »).
        const idSeq = await page.evaluate(() =>
            Array.from(window.planificationCarte.etat.noeuds.values()).find(n => n.type === 'sequence').id);
        await glisser(page, idSeq, '#planif-sommaire [data-grille-semaine="1"]');
        await expect.poll(async () => (await lireLecons(page)).map(l => l.metadata.semaine)).toEqual(
            initial.map(() => 1));

        // 2. La zone VIDE paraît, sous la grille, avec son titre et la phrase validée.
        const zone = page.locator(ZONE);
        await expect(zone).toHaveCount(1);
        await expect(zone).toBeVisible();
        await expect(zone.locator('.planif-grille-nonplanifie-titre')).toHaveText('Non planifié');
        await expect(zone.locator('.planif-grille-nonplanifie-vide')).toHaveText(PHRASE);
        await expect(zone.locator('[data-grille-id]')).toHaveCount(0);

        const geometrie = () => page.evaluate((sel) => {
            const z = document.querySelector(sel).getBoundingClientRect();
            const g = document.querySelector('#planif-sommaire .planif-grille').getBoundingClientRect();
            return { zx: z.x, zy: z.y, zw: z.width, gx: g.x, gy: g.y, gbas: g.bottom };
        }, ZONE);

        const enBas = await geometrie();
        expect(enBas.zy).toBeGreaterThanOrEqual(Math.floor(enBas.gbas)); // SOUS la grille

        // 4. Une leçon glissée sur la zone VIDE quitte sa semaine et entre dans la zone.
        await glisser(page, l1.id, ZONE);
        await expect(zone.locator(`[data-grille-id="${l1.id}"]`)).toHaveCount(1);
        await expect(page.locator(`#planif-sommaire [data-grille-semaine="1"] [data-grille-id="${l1.id}"]`)).toHaveCount(0);
        await expect(zone.locator('.planif-grille-nonplanifie-vide')).toHaveCount(0);
        const apresVide = (await lireLecons(page)).find(l => l.id === l1.id);

        // 5. ARRÊT DE LA CONSIGNE : le même geste sur la zone PLEINE écrit la même chose.
        await glisser(page, l2.id, ZONE);
        await expect(zone.locator(`[data-grille-id="${l2.id}"]`)).toHaveCount(1);
        const apresPleine = (await lireLecons(page)).find(l => l.id === l2.id);

        expect('semaine' in apresVide.metadata).toBe(false);
        expect('semaine' in apresPleine.metadata).toBe(false);
        // Chaque leçon retrouve EXACTEMENT ses métadonnées d'avant planification.
        expect(apresVide.metadata).toEqual(l1.metadata);
        expect(apresPleine.metadata).toEqual(l2.metadata);
    });

    // TROUVÉ PAR CE BANC (20 sept.). Le clic sur ◧ juste après un glisser — ◧
    // retiré depuis — ne faisait RIEN sous WebKit. Relâchée
    // sur un autre élément que celui saisi, la souris n'y produit aucun `click` ;
    // l'avaleur « once » posé au pointerup restait armé et mangeait le prochain
    // clic de l'écran. L'essai ci-dessous garde l'autre moitié : quand le clic
    // EXISTE (relâché sur la pastille saisie), il est toujours avalé.
    test('l’avaleur de clic : avale le clic du glisser quand il existe, et ne survit pas au geste', async ({ page }) => {
        await ouvrirCarte(page);
        const [l1] = await lireLecons(page);
        await page.evaluate(() => {
            window.__emis = 0;
            window.__passes = 0;
            window.addEventListener('click', () => { window.__emis++; }, true);
            document.getElementById('planif-sommaire').addEventListener('click', () => { window.__passes++; });
        });

        // Glisser court, relâché SUR la pastille saisie : un clic est émis, et avalé.
        const item = page.locator(`#planif-sommaire [data-grille-id="${l1.id}"]`).first();
        await item.scrollIntoViewIfNeeded();
        const b = await item.boundingBox();
        await page.mouse.move(b.x + 14, b.y + b.height / 2);
        await page.mouse.down();
        for (let i = 1; i <= 4; i++) {
            await page.mouse.move(b.x + 14 + i * 3, b.y + b.height / 2);
            await page.waitForTimeout(30);
        }
        await page.mouse.up();
        await expect.poll(() => page.evaluate(() => window.__emis)).toBe(1);
        expect(await page.evaluate(() => window.__passes)).toBe(0);

        // Le clic SUIVANT, lui, passe : l'avaleur n'a pas survécu au geste.
        // (Il visait ◧ jusqu'au 8 oct. 2026 ; il vise la pastille elle-même.)
        await item.click();
        await expect.poll(() => page.evaluate(() => window.__passes)).toBe(1);
    });
});
