import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_B, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 1 (consigne du 18 oct. 2026), dans un vrai WebKit.
//
//   · un tableau fictif collé s'ouvre dans la dissection, pas dans l'assistant en sept étapes ;
//   · deux étiquettes posées par des événements de POINTEUR (toucher, glisser), sans clic à l'aveugle
//     ni délai ; la grille comprise se refait ; Échap pose le surligneur ;
//   · `touch-action: none` seulement quand une étiquette est en main ;
//   · à la largeur de l'iPad (820), la page ne défile pas de côté ; étiquettes et « Terminer » ≥ 44 px ;
//   · C1 (relecture du 18 oct.) : la palette reste à GAUCHE du canevas, debout (820) comme couché (1180) ;
//     la précision de l'étiquette en main passe dans le bandeau ;
//   · C2 : « Coller une autre grille » demande confirmation dès qu'une étiquette est posée ;
//   · un collage piégé n'entre pas dans la page ; l'exemple et « Taper ma grille à la main ».

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
    // Un témoin, pas un délai : le dernier drapeau des migrations de démarrage (main.js, auDbReady)
    // et la zone de collage qui écoute « coller » (materiel.js, au DOMContentLoaded).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html, texte) {
    await page.evaluate(([h, t]) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        const donnees = { 'text/html': h, 'text/plain': t };
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => donnees[k] || '' } });
        zone.dispatchEvent(ev);
    }, [html, texte || '']);
}

/** Le texte d'un morceau → son id. */
async function idDe(page, texte) {
    return page.evaluate((t) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')]
        .find((b) => b.textContent === t)?.getAttribute('data-id'), texte);
}

/**
 * Un geste de pointeur : appuyer sur le premier morceau, passer sur les suivants, relâcher. Chaque
 * événement porte les coordonnées du centre de son morceau (elementFromPoint les relit).
 */
async function geste(page, textes) {
    await page.evaluate((ts) => {
        const blocs = ts.map((t) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((b) => b.textContent === t));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (type, b) => new PointerEvent(type, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
}

test('dissection · coller, poser deux étiquettes au pointeur, lire la grille comprise ; iPad sans défilement de côté', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_B));

    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(page.locator('#materiel-lecture')).toBeHidden();   // l'assistant en sept étapes reste débranché
    await expect(page.locator('#dissection-titre')).toBeFocused();   // règle SPA
    await expect(page.locator('#materiel-en-construction')).toBeVisible();
    await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(24);
    // Douze étiquettes, plus les outils « Couper » (lot 5), juste après « Suite », et « Rattacher » (lot 7), après « Couper ».
    await expect(page.locator('#dissection-palette .dissection-etiquette:not(.dissection-outil)')).toHaveCount(12);
    await expect(page.locator('#dissection-palette .dissection-outil')).toHaveCount(2);
    await expect(page.locator('#dissection-palette [data-param="suite"] + [data-param="couper"] + [data-param="rattacher"]')).toHaveCount(1);
    await expect(page.locator('#dissection-comprise')).toContainText('Surligne ta grille');

    // Sans étiquette en main, le canevas défile au doigt sur les morceaux.
    const touchAction = () => page.evaluate(() => getComputedStyle(document.querySelector('#dissection-contenu .dissection-morceau')).touchAction);
    expect(await touchAction()).toBe('auto');

    // 1re étiquette : « Critère », un toucher.
    await page.locator('#dissection-palette [data-param="critere"]').click();
    await expect(page.locator('#dissection-palette [data-param="critere"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#dissection-terminer')).toBeVisible();
    await expect(page.locator('#dissection-bandeau-precision')).toHaveText('Critère : Ce qui est attendu : la question que tu te poses devant la copie');
    expect(await touchAction()).toBe('none');
    await geste(page, ['Question 1 : le sens du passage fictif']);
    // La flèche de l'étiquette en main vers son morceau.
    await expect(page.locator('#dissection-traits path.dissection-trait')).toHaveCount(1);

    // 2e étiquette : « Descripteur », un glissé sur trois réponses.
    await page.locator('#dissection-palette [data-param="descripteur"]').click();
    await expect(page.locator('#dissection-palette [data-param="critere"]')).toHaveAttribute('aria-pressed', 'false');
    await geste(page, ['Réponse juste et complète', 'Réponse juste, mais incomplète', 'Réponse absente ou fausse']);
    await expect(page.locator('#dissection-palette [data-param="descripteur"] .dissection-etiquette-compte')).toHaveText('3');

    // Retoucher un morceau surligné le retire.
    await geste(page, ['Réponse absente ou fausse']);
    await expect(page.locator('#dissection-palette [data-param="descripteur"] .dissection-etiquette-compte')).toHaveText('2');
    const idRetire = await idDe(page, 'Réponse absente ou fausse');
    expect(await page.evaluate((id) => window.materielDissection.etatCourant().liens[id], idRetire)).toBeUndefined();

    // Échap pose le surligneur.
    await page.keyboard.press('Escape');
    await expect(page.locator('#dissection-terminer')).toBeHidden();
    await expect(page.locator('#dissection-bandeau-precision')).toBeHidden();
    await expect(page.locator('#dissection-bandeau-texte')).toHaveText('Touche une étiquette dans la palette : elle devient ton surligneur.');
    expect(await touchAction()).toBe('auto');

    // La grille comprise : un critère, deux réponses, sans points.
    const R = await page.evaluate(() => {
        const r = window.materielDissection.comprise();
        return { criteres: r.criteres.map((c) => [c.nom, c.reponses.map((x) => x.desc)]), sansPlace: r.sansPlace.length };
    });
    expect(R).toEqual({ criteres: [['Question 1 : le sens du passage fictif', ['Réponse juste et complète', 'Réponse juste, mais incomplète']]], sansPlace: 0 });
    const lecture = page.locator('#dissection-comprise .dissection-table-comprise');
    await expect(lecture.locator('tbody tr')).toHaveCount(1);
    await expect(lecture).toContainText('Question 1 : le sens du passage fictif');
    await expect(lecture).toContainText('Réponse juste, mais incomplète');
    await expect(page.locator('#dissection-constats')).toContainText('1 critère');
    await expect(page.locator('#dissection-constats')).toContainText('21 morceaux sans étiquette');

    // iPad debout puis couché (C1) : la palette reste à gauche du canevas, leurs hauts au même niveau ;
    // la page ne défile pas de côté ; le canevas, lui, défile ; la palette tient dans la hauteur du canevas.
    await page.locator('#dissection-palette [data-param="points"]').click();
    const mesurer = () => page.evaluate(() => {
        const pal = document.getElementById('dissection-palette').getBoundingClientRect();
        const c = document.getElementById('dissection-canevas'), cv = c.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            ecartHauts: Math.abs(cv.top - pal.top),
            aGauche: pal.right <= cv.left,
            largeurCanevas: cv.width,
            palettePlusHaute: pal.height > cv.height + 1,
            canevasDefile: c.scrollWidth > c.clientWidth,
            etiquettes: Math.min(...[...document.querySelectorAll('#dissection-palette .dissection-etiquette')].map((b) => b.getBoundingClientRect().height)),
            terminer: document.getElementById('dissection-terminer').getBoundingClientRect().height
        };
    });
    for (const [largeur, hauteur] of [[820, 1180], [1180, 820]]) {
        await page.setViewportSize({ width: largeur, height: hauteur });
        const m = await mesurer();
        const ou = largeur + ' × ' + hauteur;
        expect(m.debord, ou + ' : la page ne défile pas horizontalement').toBeLessThanOrEqual(0);
        expect(m.aGauche, ou + ' : la palette est à gauche du canevas').toBe(true);
        expect(m.ecartHauts, ou + ' : côte à côte, pas l\'une au-dessus de l\'autre').toBeLessThan(100);
        expect(m.largeurCanevas, ou + ' : le canevas garde 480 px').toBeGreaterThanOrEqual(480);
        expect(m.palettePlusHaute, ou + ' : la palette défile dans la hauteur du canevas').toBe(false);
        expect(m.canevasDefile, ou + ' : la grille défile dans son canevas').toBe(true);
        expect(m.etiquettes).toBeGreaterThanOrEqual(44);
        expect(m.terminer).toBeGreaterThanOrEqual(44);
    }
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.screenshot({ path: test.info().outputPath('dissection-820.png') });

    // C2 · « Coller une autre grille », des étiquettes posées : un premier toucher demande confirmation.
    // Break-test (fait le 18 oct.) : la garde de `collerAutre` retirée → l'accueil revient au premier toucher, rouge.
    const autre = page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]');
    await autre.click();
    await expect(autre).toHaveText('Confirmer : coller une autre grille');
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    // Un autre geste désarme le bouton.
    await page.keyboard.press('Escape');
    await page.locator('#dissection-palette [data-param="titre"]').click();
    await expect(autre).toHaveText('Coller une autre grille');
    await autre.click();
    await autre.click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    expect(await page.evaluate(() => window.materielDissection.etatCourant().doc)).toBeNull();
    expect(erreurs).toEqual([]);
});

// Break-test (fait le 18 oct.) : `b.innerHTML = L.t` dans la feuille (materiel-dissection.js, `bloc`) → une
// <b> du collage apparaît dans la page, rouge sur `balisesCollees`.
const SOURCE_PIEGE = 'http://127.0.0.1:9/piege-dissection-lot1.png';

test('dissection · un collage piégé n’entre pas dans la page : rien ne s’exécute, rien ne se charge', async ({ page }) => {
    const requetes = [];
    page.on('request', (r) => { if (r.url().includes('piege-dissection')) requetes.push(r.url()); });
    await ouvrirConception(page);
    await page.evaluate(() => { window.__pirate = 0; });
    await coller(page, '<script>window.__pirate = 1;</script><table><tr><td>Critère<img src="' + SOURCE_PIEGE + '" onerror="window.__pirate = 2"></td><td>A</td></tr>' +
        '<tr><td>&lt;b&gt;gras&lt;/b&gt;</td><td>1</td></tr></table>');
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    // Le temps qu'une image aurait de partir : un témoin, la requête qu'elle ferait, attendue en vain.
    await page.waitForRequest((r) => r.url().includes('piege-dissection'), { timeout: 1500 }).catch(() => null);
    const r = await page.evaluate(() => ({
        pirate: window.__pirate,
        imagesPiegees: document.querySelectorAll('img[src*="piege-dissection"]').length,
        balisesCollees: document.querySelectorAll('#dissection-contenu b, #dissection-contenu img, #dissection-contenu script').length,
        textes: [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].map((b) => b.textContent)
    }));
    expect(r.imagesPiegees, 'aucune image du collage dans la page').toBe(0);
    expect(requetes, 'aucune requête vers l’image piégée').toEqual([]);
    expect(r.pirate).toBe(0);
    expect(r.balisesCollees).toBe(0);
    expect(r.textes).toEqual(['Critère', 'A', '<b>gras</b>', '1']);
});

test('dissection · « Essayer avec un exemple » ouvre une grille fictive ; « Taper ma grille à la main » mène à Grilles de critères', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await page.locator('#materiel-accueil [data-action="materiel.essayerExemple"]').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#dissection-contenu')).toContainText('Journal de lecture');
    await expect(page.locator('#dissection-contenu')).toContainText('TOTAL : / 30');
    // Sans étiquette posée, « Coller une autre grille » revient à l'accueil au premier toucher.
    await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();

    await page.locator('#materiel-accueil [data-action="materiel.taperMain"]').click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await expect(page.locator('#conception-materiel')).toBeHidden();
    expect(erreurs).toEqual([]);
});
