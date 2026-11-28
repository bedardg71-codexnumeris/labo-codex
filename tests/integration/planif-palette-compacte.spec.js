import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PALETTE « NŒUDS » : VERSION COMPACTE ET HAUTEUR BORNÉE (amendement du 28 nov. 2026).
//
// Constat de Grégoire sur l'iPad couché : la palette est plus haute que l'écran, et « Mémo », rangé
// au bas, était hors de portée tant qu'on n'avait pas replié des familles à la main.
//   1. LA GARANTIE, dans les deux versions : la palette ne dépasse jamais ce qu'on voit du canevas ;
//      la liste des nœuds défile à l'intérieur, « Mémo » reste au pied, toujours atteignable.
//   2. LA VERSION COMPACTE, sur le modèle des palettes d'annotation : un bouton dans l'en-tête, une
//      préférence, deux colonnes, les noms entiers.
//   3. AU DOIGT : un nœud de la palette fait au moins 44 px ; faire défiler la liste ne pose rien.
// Fenêtres : un iPad couché (1180 × 820 points, 740 une fois retirées les barres de Safari) et debout
// (820 × 1180, soit 1106). Chromium : le toucher y est émulé ; le doigt se juge sur l'iPad.

const NOMS = ['Compétence', 'Idée maîtresse', 'Factuelle', 'Conceptuelle', 'Procédurale', 'Métacognitive', 'Exposé', 'Activité',
    'Soutien', 'Révision', 'Évaluation', 'Séquence', 'Leçon', 'Ouverture', 'Modélisation', 'Pratique guidée', 'Pratique autonome', 'Clôture'];

const deuxImages = (page) => page.evaluate(() => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin))));
async function ouvrirCarte(page) {
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active').forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
        window.planificationCarte.initialiser(); window.planificationCarte.activer();
        document.getElementById('transition-bandeau')?.remove();
    });
    await page.waitForFunction(() => document.getElementById('planif-palette').style.maxHeight !== '');
    await immobile(page);
}
/** La page immobile : la palette ne bouge plus pendant huit images (l'en-tête finit de se resserrer après un défilement). */
const immobile = (page) => page.evaluate(() => new Promise((fin) => {
    let avant = '', calmes = 0;
    const tour = () => {
        const p = document.getElementById('planif-palette'), b = p.getBoundingClientRect();
        const ici = [b.top, b.bottom, b.left, scrollY, p.style.maxHeight].join(',');
        calmes = ici === avant ? calmes + 1 : 0;
        avant = ici;
        if (calmes >= 8) fin(); else requestAnimationFrame(tour);
    };
    requestAnimationFrame(tour);
}));
const defilerPage = async (page, y) => { await page.evaluate((y) => window.scrollTo(0, y), y); await immobile(page); };

/** Ce que la palette occupe, et ce qu'on voit du canevas. */
const mesurer = (page) => page.evaluate(() => {
    const pal = document.getElementById('planif-palette'), r = pal.getBoundingClientRect();
    const zone = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
    const memo = document.getElementById('planif-palette-memo'), m = memo.getBoundingClientRect();
    const liste = pal.querySelector('.planif-palette-contenu');
    const boutons = [...pal.querySelectorAll('.planif-palette-btn')];
    const dessus = document.elementFromPoint(m.left + m.width / 2, m.top + m.height / 2);
    return {
        haut: r.top, bas: r.bottom, largeur: Math.round(r.width), basVisible: Math.min(zone.bottom, innerHeight),
        memoHaut: m.top, memoBas: m.bottom, memoHauteur: Math.round(m.height), memoSeTouche: !!dessus && memo.contains(dessus),
        memoHorsDeLaListe: !liste.contains(memo),
        listeVue: liste.clientHeight, listeEntiere: liste.scrollHeight, listeDefile: getComputedStyle(liste).overflowY,
        famillesDepliees: [...pal.querySelectorAll('.planif-palette-zone-label')].every((l) => l.getAttribute('aria-expanded') === 'true'),
        noms: boutons.map((b) => b.textContent.trim()),
        petits: boutons.filter((b) => { const x = b.getBoundingClientRect(); return x.height < 44 || x.width < 44; }).map((b) => b.textContent.trim()),
        coupes: boutons.filter((b) => b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1 || getComputedStyle(b).textOverflow === 'ellipsis').map((b) => b.textContent.trim()),
        colonnes: new Set(boutons.map((b) => Math.round(b.getBoundingClientRect().left))).size
    };
});

for (const [nom, viewport] of [['iPad couché', { width: 1180, height: 740 }], ['iPad debout', { width: 820, height: 1106 }]]) {
    test.describe(nom, () => {
        test.use({ viewport, hasTouch: true, isMobile: true });

        for (const version of ['étendue', 'compacte']) {
            test(`${version} : la palette ne dépasse jamais ce qu'on voit, et « Mémo » se touche sans rien replier`, async ({ page }) => {
                const erreurs = [];
                page.on('pageerror', (e) => erreurs.push(e.message));
                await ouvrirCarte(page);
                if (version === 'compacte') { await page.locator('#planif-palette-version').tap(); await deuxImages(page); }

                // Page en haut (le canevas dépasse sous la fenêtre), puis descendue au bout : la borne suit.
                for (const y of [0, 100000]) {
                    await defilerPage(page, y);
                    const m = await mesurer(page);
                    expect(m.famillesDepliees, 'toutes les familles sont dépliées').toBe(true);
                    expect(m.noms, 'les dix-huit nœuds, mêmes noms, même ordre').toEqual(NOMS);
                    expect(m.bas, `le bas de la palette (page à ${y})`).toBeLessThanOrEqual(m.basVisible);
                    expect(m.memoBas, '« Mémo » est dans la fenêtre').toBeLessThanOrEqual(m.basVisible);
                    expect(m.memoHaut).toBeGreaterThanOrEqual(m.haut);
                    expect(m.memoSeTouche, 'rien ne recouvre « Mémo »').toBe(true);
                    expect(m.memoHorsDeLaListe, '« Mémo » est au pied, hors de la liste qui défile').toBe(true);
                    expect(m.memoHauteur).toBeGreaterThanOrEqual(44);
                    expect(m.petits, 'chaque nœud est une cible d\'au moins 44 px').toEqual([]);
                    expect(m.coupes, 'aucun nom coupé').toEqual([]);
                    expect(m.colonnes).toBe(version === 'compacte' ? 2 : 1);
                    expect(m.listeDefile).toBe('auto');
                }

                // Sans replier quoi que ce soit : un toucher sur « Mémo » en pose un.
                await page.locator('#planif-palette-memo').tap();
                await expect(page.locator('.planif-memo')).toHaveCount(1);
                expect(erreurs).toEqual([]);
            });
        }

        test('faire défiler la liste au doigt ne pose aucun nœud, et ni la palette ni le canevas ne bougent', async ({ page }) => {
            await ouvrirCarte(page);
            await defilerPage(page, 100000);
            const avant = await page.evaluate(() => {
                const pal = document.getElementById('planif-palette'), l = pal.querySelector('.planif-palette-contenu'), z = document.getElementById('planif-zone-travail'), r = l.getBoundingClientRect();
                const btn = [...pal.querySelectorAll('.planif-palette-btn')].filter((b) => { const x = b.getBoundingClientRect(); return x.top > r.top + r.height * 0.55 && x.bottom < r.bottom; })[0];
                const bb = btn ? btn.getBoundingClientRect() : r;
                return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), surUnNoeud: !!btn, defilable: l.scrollHeight > l.clientHeight, haut: pal.getBoundingClientRect().top,
                    canevas: [z.scrollLeft, z.scrollTop], page: scrollY, blocs: window.planificationCarte.etat.noeuds.size };
            });
            test.skip(!avant.defilable, 'à cette taille la liste tient entière : rien à faire défiler');
            // Un vrai geste tactile, en événements de toucher du navigateur : le doigt posé SUR un nœud
            // (un élément qu'on peut aussi glisser), puis remonté de 250 px.
            expect(avant.surUnNoeud, 'le doigt part d\'un nœud de la palette').toBe(true);
            const cdp = await page.context().newCDPSession(page);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: avant.x, y: avant.y }] });
            for (let i = 1; i <= 10; i++) {
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: avant.x, y: avant.y - i * 25 }] });
                await deuxImages(page);
            }
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            await deuxImages(page);
            const apres = await page.evaluate(() => {
                const pal = document.getElementById('planif-palette'), l = pal.querySelector('.planif-palette-contenu'), z = document.getElementById('planif-zone-travail');
                return { liste: l.scrollTop, haut: pal.getBoundingClientRect().top, canevas: [z.scrollLeft, z.scrollTop], page: scrollY, blocs: window.planificationCarte.etat.noeuds.size };
            });
            expect(apres.liste, 'la liste a défilé').toBeGreaterThan(100);
            expect(apres.blocs, 'aucun nœud posé par le défilement').toBe(avant.blocs);
            expect(apres.haut, 'la palette n\'a pas bougé').toBe(avant.haut);
            expect(apres.canevas, 'le canevas n\'a pas défilé').toEqual(avant.canevas);
            expect(apres.page, 'la page non plus').toBe(avant.page);
            // Le dernier nœud est atteint en défilant, et un toucher le pose.
            await page.locator('#planif-palette .planif-palette-btn[data-type="cloture"]').scrollIntoViewIfNeeded();
            await page.locator('#planif-palette .planif-palette-btn[data-type="cloture"]').tap();
            await expect.poll(() => page.evaluate(() => Array.from(window.planificationCarte.etat.noeuds.values()).map((n) => n.type))).toEqual(['cloture']);
        });
    });
}

test.describe('à la souris', () => {
    test.use({ viewport: { width: 1280, height: 860 } });

    test('le bouton de l\'en-tête passe à la version compacte, s\'en souvient, et revient ; il ne déplace pas la palette', async ({ page }) => {
        await ouvrirCarte(page);
        const bouton = page.locator('#planif-palette-version');
        const palette = page.locator('#planif-palette');
        await expect(bouton).toHaveAttribute('title', 'Passer à la version compacte');
        await expect(palette).not.toHaveClass(/planif-palette-compacte/);
        const etendue = await mesurer(page);
        const placeDe = () => page.evaluate(() => { const p = document.getElementById('planif-palette'); return [p.offsetLeft, p.offsetTop]; });
        const place = await placeDe();

        await bouton.click();
        await expect(palette).toHaveClass(/planif-palette-compacte/);
        await expect(bouton).toHaveAttribute('title', 'Passer à la version étendue');
        await expect(bouton).toHaveAttribute('aria-label', 'Passer à la version étendue');
        expect(await page.evaluate(() => obtenirPreference('planifPaletteNoeudsCompacte'))).toBe(true);
        const compacte = await mesurer(page);
        expect(await placeDe(), 'le clic sur le bouton ne déplace pas la palette').toEqual(place);
        expect(compacte.colonnes).toBe(2);
        expect(compacte.noms).toEqual(NOMS);
        expect(compacte.coupes).toEqual([]);
        expect(compacte.listeEntiere, 'la liste compacte est nettement moins haute').toBeLessThan(etendue.listeEntiere * 0.75);
        expect(compacte.largeur, 'un peu de largeur en plus').toBeGreaterThan(etendue.largeur);
        expect(compacte.largeur).toBeLessThanOrEqual(280);

        // Rechargée : la version choisie est retenue (préférence de l'appareil).
        await page.reload();
        await attendreApplication(page);
        await page.evaluate(() => {
            document.getElementById('section-conception')?.classList.add('active');
            document.getElementById('conception-carte')?.classList.add('active');
            window.planificationCarte.initialiser();
        });
        await expect(page.locator('#planif-palette')).toHaveClass(/planif-palette-compacte/);
        await page.locator('#planif-palette-version').click();
        await expect(page.locator('#planif-palette')).not.toHaveClass(/planif-palette-compacte/);
        expect(await page.evaluate(() => obtenirPreference('planifPaletteNoeudsCompacte'))).toBe(false);
    });

    test('compacte : un nœud de CHAQUE colonne se pose par un glisser, là où on le lâche ; un clic en pose un aussi', async ({ page }) => {
        await ouvrirCarte(page);
        await page.locator('#planif-palette-version').click();
        const cible = await page.evaluate(() => { const z = document.getElementById('planif-zone-travail').getBoundingClientRect(); return { x: z.left + z.width * 0.55, y: z.top + z.height * 0.5 }; });
        const colonnes = await page.evaluate(() => ['factuelle', 'conceptuelle'].map((t) => Math.round(document.querySelector(`#planif-palette [data-type="${t}"]`).getBoundingClientRect().left)));
        expect(colonnes[1], '« Conceptuelle » est dans la seconde colonne').toBeGreaterThan(colonnes[0] + 50);

        let n = 0;
        for (const type of ['factuelle', 'conceptuelle']) {
            const zone = page.locator('#planif-zone-travail');
            const boite = await zone.boundingBox();
            const point = { x: cible.x - boite.x + n * 220, y: cible.y - boite.y };
            await page.locator(`#planif-palette .planif-palette-btn[data-type="${type}"]`).dragTo(zone, { targetPosition: point });
            n++;
            await expect.poll(() => page.evaluate(() => window.planificationCarte.etat.noeuds.size)).toBe(n);
            const pose = await page.evaluate(() => { const nd = Array.from(window.planificationCarte.etat.noeuds.values()).pop(); const r = document.getElementById(nd.id).getBoundingClientRect(); return { type: nd.type, x: r.left, y: r.top, l: r.width, h: r.height }; });
            expect(pose.type).toBe(type);
            const lache = { x: boite.x + point.x, y: boite.y + point.y };
            expect(Math.abs(pose.x + pose.l / 2 - lache.x), 'posé sous le pointeur, en largeur').toBeLessThan(pose.l);
            expect(Math.abs(pose.y + pose.h / 2 - lache.y), 'posé sous le pointeur, en hauteur').toBeLessThan(pose.h + 20);
        }
        await page.locator('#planif-palette .planif-palette-btn[data-type="metacognitive"]').click();
        await expect.poll(() => page.evaluate(() => Array.from(window.planificationCarte.etat.noeuds.values()).map((x) => x.type))).toEqual(['factuelle', 'conceptuelle', 'metacognitive']);
    });

    test('compacte : les familles gardent leur titre, leur couleur et leur repli', async ({ page }) => {
        await ouvrirCarte(page);
        const lire = () => page.evaluate(() => [...document.querySelectorAll('#planif-palette .planif-palette-categorie')].map((c) => {
            const l = c.querySelector('.planif-palette-zone-label');
            return [c.dataset.zone, l.textContent.trim(), getComputedStyle(l).color, getComputedStyle(c).backgroundColor];
        }));
        const etendue = await lire();
        await page.locator('#planif-palette-version').click();
        expect(await lire()).toEqual(etendue);
        expect(etendue).toHaveLength(6);
        const titre = page.locator('#planif-palette .planif-palette-categorie[data-zone="quoi"] .planif-palette-zone-label');
        const facts = page.locator('#planif-palette .planif-palette-btn[data-type="factuelle"]');
        await expect(facts).toBeVisible();
        await titre.click();
        await expect(titre).toHaveAttribute('aria-expanded', 'false');
        await expect(facts).toBeHidden();
        await titre.click();
        await expect(facts).toBeVisible();
    });

    test('la palette se déplace par sa barre comme avant ; descendue, elle se raccourcit au lieu de sortir de l\'écran', async ({ page }) => {
        await ouvrirCarte(page);
        await defilerPage(page, 100000);
        const avant = await mesurer(page);
        const depart = await page.evaluate(() => { const p = document.getElementById('planif-palette'); return [p.offsetLeft, p.offsetTop]; });
        expect(depart, 'la position de départ est celle d\'avant le lot').toEqual([12, 12]);
        const titre = await page.locator('#planif-palette .planif-palette-titre').boundingBox();
        await page.mouse.move(titre.x + 30, titre.y + titre.height / 2);
        await page.mouse.down();
        await page.mouse.move(titre.x + 130, titre.y + 120, { steps: 6 });
        await page.mouse.move(titre.x + 230, titre.y + titre.height / 2 + 200, { steps: 6 });
        await page.mouse.up();
        await deuxImages(page);
        const apres = await mesurer(page);
        expect(await page.evaluate(() => document.getElementById('planif-palette').offsetTop), 'descendue de 200 px dans le canevas').toBe(212);
        expect(avant.bas).toBeLessThanOrEqual(avant.basVisible);
        expect(apres.bas, 'descendue de 200 px, elle ne dépasse toujours pas').toBeLessThanOrEqual(apres.basVisible);
        expect(apres.memoSeTouche).toBe(true);
        expect(await page.evaluate(() => document.getElementById('planif-palette').offsetLeft)).toBe(212);
    });

    test('la corbeille dit qu\'elle prend aussi un mémo', async ({ page }) => {
        await ouvrirCarte(page);
        const corbeille = page.locator('#planif-corbeille');
        await expect(corbeille).toHaveAttribute('title', 'Glisse un bloc ou un mémo ici pour le supprimer');
        await expect(corbeille).toHaveAttribute('aria-label', 'Corbeille — glisse un bloc ou un mémo ici pour le supprimer');
    });
});
