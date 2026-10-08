import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// « TOUT VOIR » + LOUPE — 11 août 2026, demande de Grégoire en préparant A26 :
// « la vue complète de la carte de mon cours est à 25 %, c'est évidemment
// illisible à ce zoom ». Prendre du recul et lire sont contradictoires ; la
// loupe les réconcilie sans toucher au zoom de la carte, et « Tout voir » lui
// donne son point de départ.
//
// ⚠ POURQUOI CES CAS-LÀ SONT ICI ET PAS EN VITEST. Les quatre invariants
// ci-dessous ont besoin d'un canevas RÉELLEMENT MIS EN PAGE : une zone de
// travail sans taille, une couche de blocs positionnée par une règle CSS, un
// pointeur qui traverse des calques superposés. Trois défauts ont été trouvés
// en éprouvant tout ça dans Chromium le 11 août, aucun n'aurait été visible en
// bac à sable Node :
//   1. avec clientWidth = 0, « Tout voir » tombait au plancher EN SILENCE ;
//   2. retirer les id de la copie faisait sauter la règle CSS qui place la
//      couche — la loupe montrait une zone décalée de 4999 px / 2996 px ;
//   3. l'écouteur posé sur la zone ne voyait pas le pointeur sous la grille du
//      Planificateur : la loupe restait vide là où la carte est la plus dense.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrirCarte(page) {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.naviguerVers('conception', 'carte'));
    await page.waitForTimeout(1200);

    // Le gabarit de sa carte : une bande dense de leçons, une séquence isolée
    // très loin. C'est cette forme qui démasque un centrage par la moyenne.
    await page.evaluate(() => {
        const n = [{
            id: 'planif-noeud_cible', type: 'sequence', titre: 'CIBLE',
            x: 3400, y: 200, parent: null, enfants: [], metadata: {}
        }];
        for (let i = 0; i < 40; i++) {
            n.push({
                id: 'planif-noeud_s' + i, type: 'lecon', titre: 'L' + i,
                x: 100 + (i % 10) * 220, y: 2200 + Math.floor(i / 10) * 160,
                parent: null, enfants: [], metadata: {}
            });
        }
        window.planificationCarte.injecterNoeuds(n);
    });
    return erreurs;
}

async function centreDe(page, id) {
    return page.evaluate((nid) => {
        const r = document.getElementById(nid).getBoundingClientRect();
        return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
    }, id);
}

test('« Tout voir » fait tenir la carte ENTIÈRE, isolé compris', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);

    // « Tout voir » vit dans le menu « Vue » depuis le 8 oct. 2026.
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(400);

    const bilan = await page.evaluate(() => {
        const api = window.planificationCarte;
        const b = api.encadrementContenu();
        const zt = document.getElementById('planif-zone-travail');
        return {
            zoom: api.etat.zoom,
            largeur: (b.maxX - b.minX) * api.etat.zoom,
            hauteur: (b.maxY - b.minY) * api.etat.zoom,
            dispoW: zt.clientWidth,
            dispoH: zt.clientHeight
        };
    });

    expect(bilan.largeur).toBeLessThanOrEqual(bilan.dispoW);
    expect(bilan.hauteur).toBeLessThanOrEqual(bilan.dispoH);
    // Jamais grossi au-delà de 100 %, et jamais tombé au plancher en silence.
    expect(bilan.zoom).toBeLessThanOrEqual(1);
    expect(bilan.zoom).toBeGreaterThan(0.1);

    // La séquence isolée est réellement à l'écran — c'est elle que l'ancien
    // centrage par la moyenne laissait dehors.
    const visible = await page.evaluate(() => {
        const r = document.getElementById('planif-noeud_cible').getBoundingClientRect();
        return r.width > 0 && r.left >= 0 && r.top >= 0
            && r.right <= window.innerWidth && r.bottom <= window.innerHeight;
    });
    expect(visible).toBe(true);
    expect(erreurs).toEqual([]);
});

test('la loupe montre CE QU’ON VISE, et l’atterrissage y mène', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    // « Tout voir » vit dans le menu « Vue » depuis le 8 oct. 2026.
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(400);

    const cible = await centreDe(page, 'planif-noeud_cible');
    await page.click('#planif-btn-loupe');
    expect(await page.getAttribute('#planif-btn-loupe', 'aria-pressed')).toBe('true');

    await page.mouse.move(cible[0], cible[1]);
    await page.waitForTimeout(250);

    // Le bloc visé doit être AU CENTRE du cadre, à l'échelle de lecture.
    const centrage = await page.evaluate(() => {
        const cadre = document.getElementById('planif-loupe').getBoundingClientRect();
        const copie = document.querySelector('.planif-loupe-contenu').firstElementChild;
        const cop = Array.from(copie.querySelectorAll('.planif-noeud'))
            .find((n) => n.textContent.includes('CIBLE'));
        if (!cop) return null;
        const rn = cop.getBoundingClientRect();
        return {
            dx: Math.abs((cadre.left + cadre.width / 2) - (rn.left + rn.width / 2)),
            dy: Math.abs((cadre.top + cadre.height / 2) - (rn.top + rn.height / 2))
        };
    });
    expect(centrage).not.toBeNull();
    expect(centrage.dx).toBeLessThan(20);
    expect(centrage.dy).toBeLessThan(20);

    // « Aller ici » : la carte s'y rend, à l'échelle qu'on venait de lire.
    await page.click('.planif-loupe-aller');
    await page.waitForTimeout(500);
    const apres = await page.evaluate(() => {
        const r = document.getElementById('planif-noeud_cible').getBoundingClientRect();
        const zt = document.getElementById('planif-zone-travail').getBoundingClientRect();
        return {
            zoom: window.planificationCarte.etat.zoom,
            loupe: window.planificationCarte.etat.loupeActive,
            dx: Math.abs((r.left + r.width / 2) - (zt.left + zt.width / 2)),
            dy: Math.abs((r.top + r.height / 2) - (zt.top + zt.height / 2))
        };
    });
    expect(apres.zoom).toBe(1);
    expect(apres.loupe).toBe(false);
    expect(apres.dx).toBeLessThan(30);
    expect(apres.dy).toBeLessThan(30);
    expect(erreurs).toEqual([]);
});

test('⚠ la loupe voit le pointeur MÊME sous la grille du Planificateur', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    // « Tout voir » vit dans le menu « Vue » depuis le 8 oct. 2026.
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(400);
    await page.click('#planif-btn-loupe');

    // Un point réellement couvert par un calque : c'est le cas qui a fait
    // échouer l'écouteur posé sur #planif-zone-travail.
    const point = await page.evaluate(() => {
        const zt = document.getElementById('planif-zone-travail').getBoundingClientRect();
        const x = Math.round(zt.left + zt.width * 0.75);
        const y = Math.round(zt.top + zt.height * 0.15);
        const dessus = document.elementFromPoint(x, y);
        return { x, y, dessus: dessus ? (dessus.id || dessus.className) : null };
    });
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(250);

    const rempli = await page.evaluate(() => {
        const c = document.querySelector('.planif-loupe-contenu');
        return { decale: c.style.left !== '', blocs: c.firstElementChild
            ? c.firstElementChild.querySelectorAll('.planif-noeud').length : 0 };
    });
    expect(rempli.decale).toBe(true);
    expect(rempli.blocs).toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
});

test('⚠ iPad : glisser le doigt en mode loupe ne déplace AUCUN bloc', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    // « Tout voir » vit dans le menu « Vue » depuis le 8 oct. 2026.
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(400);
    await page.click('#planif-btn-loupe');

    const avant = await page.evaluate(() => {
        const o = {};
        for (const [id, n] of window.planificationCarte.etat.noeuds) o[id] = [n.x, n.y];
        return o;
    });

    const cible = await centreDe(page, 'planif-noeud_cible');
    await page.evaluate(([x, y]) => {
        const zt = document.getElementById('planif-zone-travail');
        for (const [dx, dy] of [[0, 0], [-80, 40], [-160, 80]]) {
            zt.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true, clientX: x + dx, clientY: y + dy,
                pointerType: 'touch', isPrimary: true, pointerId: 1
            }));
        }
    }, cible);
    await page.waitForTimeout(250);

    const apres = await page.evaluate(() => {
        const o = {};
        for (const [id, n] of window.planificationCarte.etat.noeuds) o[id] = [n.x, n.y];
        return o;
    });
    const bouges = Object.keys(avant).filter((k) => String(avant[k]) !== String(apres[k]));
    expect(bouges).toEqual([]);

    // Et la loupe a bien suivi le doigt.
    const suivi = await page.evaluate(() => document.querySelector('.planif-loupe-contenu').style.left);
    expect(suivi).not.toBe('');
    expect(erreurs).toEqual([]);
});
