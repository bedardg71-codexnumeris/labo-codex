import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_D7, SECTION_D7, NOM_D7, POND_D7, CASES_D7, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 12 (rattacher sans que l'ordre des touchers compte, consigne du
// 19 oct. 2026), dans un vrai WebKit.
//
//   · la grille fictive (d7), étiquetée comme à la porte ; « Rattacher » en main, les touchers de la capture de
//     Grégoire (19 oct., 7 h 54), DANS SON ORDRE : le début puis la fin, le milieu puis la fin ;
//   · le groupe : les deux fins marquées vers le début (la tête), le nom entier sous la tête, lu par la page
//     (pas caché aux lecteurs d'écran), deux flèches vers la tête ; la lecture, un seul critère au nom entier ;
//   · détacher par deux touchers : un membre, puis la tête (la fin redevient seule, avec l'étiquette du groupe).
//   Break-test (fait le 19 oct.) : la tête prise sur le second touché (`joindre`) → l'essai rougit dès la
//   première jointure (le début marqué comme membre).

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    // Un témoin, pas un délai (même que la spec du lot 1).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

/** Une étiquette en main, un geste de pointeur sur tous les morceaux dont le texte est dans la liste, puis Échap. */
async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, b) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
    await page.keyboard.press('Escape');
}

/** Un toucher (pointerdown puis pointerup, sans glisser) au centre du morceau dont le texte est `texte`. */
async function toucher(page, texte) {
    await page.evaluate((t) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === t);
        if (!b) throw new Error('Aucun morceau « ' + t + ' »');
        b.scrollIntoView({ block: 'center', inline: 'start' });
        const r = b.getBoundingClientRect();
        const p = { clientX: r.left + Math.min(30, r.width / 2), clientY: r.top + r.height / 2 };
        const ev = (k) => new PointerEvent(k, Object.assign({ bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true }, p));
        b.dispatchEvent(ev('pointerdown'));
        b.dispatchEvent(ev('pointerup'));
    }, texte);
}

const morceau = (page, t) => page.locator('#dissection-contenu .dissection-morceau').filter({ hasText: new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$') });
const outil = (page) => page.locator('#dissection-palette [data-param="rattacher"]');
const statut = (page) => page.locator('#dissection-statut');
const idDe = (page, t) => morceau(page, t).getAttribute('data-id');

test('dissection 12 · les touchers de la capture, dans son ordre : le nom entier sous la tête ; détacher par deux touchers', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_D7));
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await etiqueter(page, 'titre', ['Évaluation fictive sur les images']);
    await etiqueter(page, 'section', [SECTION_D7]);
    await etiqueter(page, 'critere', NOM_D7);
    await etiqueter(page, 'ponderation', [POND_D7]);
    await etiqueter(page, 'souscritere', CASES_D7);
    await expect(page.locator('#dissection-comprise .dissection-crit-nom')).toHaveText(NOM_D7);

    const [debut, milieu, fin] = NOM_D7;
    const idDebut = await idDe(page, debut);
    const nomEntier = NOM_D7.join(' ');
    const sous = page.locator('#dissection-contenu .dissection-nom-entier');
    const fleche = page.locator('#dissection-traits path.dissection-trait-lien');

    // Les touchers de la capture : le début, puis la fin.
    await outil(page).click();
    await toucher(page, debut);
    await toucher(page, fin);
    await expect(statut(page)).toHaveText('Morceaux rattachés : l’application lit « ' + debut + ' ' + fin + ' ». L’étiquette « Critère » de la suite est retirée : celle du premier morceau vaut pour le texte entier.');
    await expect(morceau(page, debut)).not.toHaveClass(/dissection-rattache/);
    await expect(morceau(page, debut)).toHaveAttribute('data-type', 'critere');
    await expect(morceau(page, fin)).toHaveAttribute('data-suite-de', idDebut);
    await expect(morceau(page, fin)).toHaveAttribute('title', 'Suite de « ' + debut + ' »');
    // Puis le milieu, puis la fin : il se joint au même groupe.
    await toucher(page, milieu);
    await toucher(page, fin);
    await expect(statut(page)).toHaveText(/^Morceaux rattachés : l’application lit « Nuances fictives du propos \(exemples, contrastes, renvois\) »\./);
    await expect(morceau(page, milieu)).toHaveAttribute('data-suite-de', idDebut);
    await expect(morceau(page, milieu)).toHaveClass(/dissection-rattache/);
    await expect(morceau(page, milieu)).toHaveClass(/dis-t-critere/);
    await expect(fleche).toHaveCount(2);
    expect(await fleche.evaluateAll((ps) => ps.map((p) => p.getAttribute('data-vers')))).toEqual([idDebut, idDebut]);

    // Sous la tête, en tout temps, le nom entier : juste après elle, visible, pas caché aux lecteurs d'écran.
    await expect(sous).toHaveCount(1);
    await expect(sous).toHaveText('L’application lit : « ' + nomEntier + ' »');
    await expect(sous).toHaveAttribute('data-de', idDebut);
    await expect(sous).toBeVisible();
    expect(await sous.evaluate((n) => ({
        apres: n.previousElementSibling && n.previousElementSibling.getAttribute('data-id'),
        cache: !!n.closest('[aria-hidden="true"]')
    }))).toEqual({ apres: idDebut, cache: false });
    await page.keyboard.press('Escape');
    await expect(sous).toHaveText('L’application lit : « ' + nomEntier + ' »');
    await expect(page.locator('#dissection-constats')).toContainText('1 critère');
    await expect(page.locator('#dissection-comprise .dissection-crit-nom')).toHaveText([nomEntier]);
    await morceau(page, debut).scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath('dissection-12-nom-entier-820.png') });

    // Détacher par deux touchers : le milieu, puis la tête.
    await outil(page).click();
    await toucher(page, milieu);
    await expect(morceau(page, milieu)).toHaveClass(/dissection-choisi/);
    await expect(page.locator('#dissection-bandeau-texte')).toHaveText('Outil « Rattacher » : touche maintenant le morceau à joindre à « (exemples, contrastes, ». Retouche « (exemples, contrastes, » pour le détacher.');
    await toucher(page, milieu);
    await expect(statut(page)).toHaveText('Lien défait : « (exemples, contrastes, » redevient un morceau à part.');
    await expect(morceau(page, milieu)).not.toHaveClass(/dissection-rattache/);
    await expect(sous).toHaveText('L’application lit : « ' + debut + ' ' + fin + ' »');
    await expect(fleche).toHaveCount(1);
    await toucher(page, debut);
    await toucher(page, debut);
    await expect(statut(page)).toHaveText('Lien défait : « ' + debut + ' » redevient un morceau à part.');
    await expect(sous).toHaveCount(0);
    await expect(fleche).toHaveCount(0);
    await expect(morceau(page, fin)).not.toHaveClass(/dissection-rattache/);
    // Le groupe d'un seul morceau n'existe plus ; la fin garde l'étiquette du groupe, le début n'en a plus.
    await expect(morceau(page, fin)).toHaveAttribute('data-type', 'critere');
    await expect(morceau(page, debut)).not.toHaveAttribute('data-type', /.+/);

    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
});
