import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_D7, SECTION_D7, NOM_D7, POND_D7, CASES_D7, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 11 (elle s'enregistre toute seule, à chaque geste ; consigne du
// 19 oct. 2026), dans un vrai WebKit.
//
//   · coller (d7), étiqueter, couper, rattacher, saisir le nom : le témoin commun dit « Enregistré » à chaque
//     geste ; RECHARGER la page → la dissection rouvre telle quelle (étiquettes, coupe et son annulation,
//     rattachement, nom saisi), sans question ;
//   · « Coller une autre grille » confirmé → l'accueil ; recharger → toujours l'accueil ;
//   · un brouillon illisible : l'accueil s'ouvre, un mot le dit, le brouillon n'est pas effacé ;
//   · en démo, le brouillon vit sous `demo_` : celui de l'enseignant n'est ni lu ni touché.
//   Break-test (fait le 19 oct.) : la reprise qui oublie les rattachements (`ouvrir`, champs repris) → le
//   premier essai rougit (l'état repris n'est plus celui d'avant le rechargement).


/** Recharge la page et rouvre Conception, comme l'enseignant qui revient. */
async function revenir(page) {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Compte les « Enregistré » du témoin commun, par clé. */
async function ecouterTemoin(page) {
    await page.evaluate(() => {
        window.__dits = [];
        const t = window.temoinEnregistrement, o = t.enregistre;
        t.enregistre = (c) => { window.__dits.push(c); return o(c); };
    });
}
const dits = (page) => page.evaluate(() => window.__dits.filter((c) => c === 'a2032_brouillonDissection').length);

/** « Couper » en main : touche le morceau `texte` juste après le caractère de rang `rang` (spec du lot 5). */
async function toucherPourCouper(page, texte, rang) {
    await page.evaluate(({ texte, rang }) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === texte);
        if (!b) throw new Error('Aucun morceau « ' + texte + ' »');
        b.scrollIntoView({ block: 'center', inline: 'start' });
        const r = document.createRange();
        r.setStart(b.firstChild, rang);
        r.setEnd(b.firstChild, rang + 1);
        const c = r.getBoundingClientRect();
        const p = { clientX: c.right - 1, clientY: c.top + c.height / 2 };
        const ev = (t) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 9, pointerType: 'touch', isPrimary: true }, p));
        b.dispatchEvent(ev('pointerdown'));
        b.dispatchEvent(ev('pointerup'));
    }, { texte, rang });
}

/** Ce qui doit survivre : l'état de la dissection, sans l'état d'écran. */
const etatGarde = (page) => page.evaluate(() => {
    const e = window.materielDissection.etatCourant();
    return JSON.parse(JSON.stringify({ doc: e.doc, liens: e.liens, coupes: e.coupes, rattachements: e.rattachements, nomSaisi: e.nomSaisi, compte: e.compte, valeurs: e.valeurs }));
});

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

test('dissection 11 · chaque geste s’enregistre ; recharger rouvre la dissection telle quelle ; « Coller une autre grille » repart de l’accueil', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await ecouterTemoin(page);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    const grilles = () => page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), [])));
    const grillesAvant = await grilles();

    // Coller : le premier geste, il s'enregistre.
    await coller(page, enHtml(GRILLE_D7));
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect.poll(() => dits(page)).toBe(1);
    // Le témoin commun s'est montré.
    await expect(page.locator('#temoin-enregistrement .temoin-enregistrement-succes')).toHaveText(/Enregistré/);

    // Étiqueter (un geste par étiquette), couper, rattacher, saisir le nom.
    await etiqueter(page, 'titre', ['Évaluation fictive sur les images']);
    await etiqueter(page, 'section', [SECTION_D7]);
    await etiqueter(page, 'critere', NOM_D7);
    await etiqueter(page, 'ponderation', [POND_D7]);
    await etiqueter(page, 'souscritere', CASES_D7);
    await expect.poll(() => dits(page)).toBe(6);
    await page.locator('#dissection-palette [data-param="couper"]').click();
    await toucherPourCouper(page, CASES_D7[0], CASES_D7[0].indexOf(' fictive') - 1);
    await expect(page.locator('#dissection-annuler-coupe')).toBeVisible();
    await expect.poll(() => dits(page)).toBe(7);
    await page.keyboard.press('Escape');
    await outil(page).click();
    await toucher(page, NOM_D7[0]);
    await expect.poll(() => dits(page)).toBe(7);   // le choix seul n'écrit rien
    await toucher(page, NOM_D7[2]);
    await expect.poll(() => dits(page)).toBe(8);
    await page.keyboard.press('Escape');
    const nom = page.locator('#dissection-nom-grille');
    await nom.fill('Évaluation fictive reprise');
    await nom.press('Tab');
    await expect.poll(() => dits(page)).toBeGreaterThanOrEqual(9);
    await expect.poll(() => page.evaluate(() => db.getSync('a2032_brouillonDissection', null)?.nomSaisi)).toBe('Évaluation fictive reprise');

    const avant = await etatGarde(page);
    expect(avant.coupes).toHaveLength(1);
    expect(Object.keys(avant.rattachements)).toHaveLength(1);
    // Le brouillon porte le document disséqué, jamais le HTML collé.
    expect(JSON.stringify(await page.evaluate(() => db.getSync('a2032_brouillonDissection', null)))).not.toMatch(/<table|<td/i);
    // Rien n'est entré dans les grilles.
    expect(await grilles()).toBe(grillesAvant);
    await page.evaluate(() => db.flush());

    // Recharger : la dissection rouvre, telle quelle, sans question.
    await revenir(page);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await expect(page.locator('#materiel-accueil')).toBeHidden();
    await expect(statut(page)).toHaveText('Dissection reprise telle que tu l’as laissée.');
    expect(await etatGarde(page)).toEqual(avant);
    await expect(morceau(page, NOM_D7[2])).toHaveClass(/dissection-rattache/);
    await expect(morceau(page, NOM_D7[0])).toHaveAttribute('data-type', 'critere');
    await expect(page.locator('#dissection-contenu .dissection-nom-entier')).toHaveText('L’application lit : « ' + NOM_D7[0] + ' ' + NOM_D7[2] + ' »');
    await expect(page.locator('#dissection-nom-grille')).toHaveValue('Évaluation fictive reprise');
    // La pile des coupes est revenue : « Annuler la dernière coupe » recolle la case.
    await page.locator('#dissection-palette [data-param="couper"]').click();
    await page.locator('#dissection-annuler-coupe').click();
    await expect(morceau(page, CASES_D7[0])).toHaveCount(1);
    await page.keyboard.press('Escape');

    // « Coller une autre grille », confirmé : l'accueil ; recharger : toujours l'accueil.
    const autre = page.locator('[data-action="materielDissection.collerAutre"]');
    await autre.click();
    await autre.click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect.poll(() => page.evaluate(() => db.getSync('a2032_brouillonDissection', null))).toBeNull();
    await page.evaluate(() => db.flush());
    await revenir(page);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    expect(erreurs).toEqual([]);
});

test('dissection 11 · un brouillon illisible : l’accueil s’ouvre, un mot le dit, rien n’est effacé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    const abime = { format: 'dissection-9', doc: 'abîmé' };
    await page.evaluate((b) => { db.setSync('a2032_brouillonDissection', b); return db.flush(); }, abime);
    await revenir(page);
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    await expect(page.locator('#materiel-erreur')).toHaveText('Ta dissection précédente n’a pas pu être relue : elle reste gardée telle quelle. Colle une grille pour en commencer une autre ; elle la remplacera.');
    expect(await page.evaluate(() => db.getSync('a2032_brouillonDissection', null))).toEqual(abime);
    expect(erreurs).toEqual([]);
});

test('dissection 11 · en démo, le brouillon vit sous demo_ : celui de l’enseignant n’est ni lu ni touché', async ({ page }) => {
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_D7));
    await etiqueter(page, 'critere', NOM_D7);
    await expect.poll(() => page.evaluate(() => db.getSync('a2032_brouillonDissection', null)?.liens && Object.keys(db.getSync('a2032_brouillonDissection', null).liens).length)).toBe(3);
    const reel = await page.evaluate(() => db.getSync('a2032_brouillonDissection', null));
    await page.evaluate(() => db.flush());

    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => cle('brouillonDissection'))).toBe('demo_brouillonDissection');
    await revenir(page);
    await expect.poll(() => page.evaluate(() => cle('brouillonDissection'))).toBe('demo_brouillonDissection');
    // En démo, l'onglet s'ouvre sur l'accueil : le brouillon de l'enseignant n'est pas lu.
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
    // Un collage en démo écrit sous demo_, et laisse celui de l'enseignant intact.
    await coller(page, enHtml(GRILLE_D7));
    await expect.poll(() => page.evaluate(() => !!db.getSync('demo_brouillonDissection', null))).toBe(true);
    expect(await page.evaluate(() => db.getSync('a2032_brouillonDissection', null))).toEqual(reel);
    // « Coller une autre grille » en démo n'efface que celui de la démo.
    const autre = page.locator('[data-action="materielDissection.collerAutre"]');
    await autre.click();
    await expect.poll(() => page.evaluate(() => db.getSync('demo_brouillonDissection', null))).toBeNull();
    expect(await page.evaluate(() => db.getSync('a2032_brouillonDissection', null))).toEqual(reel);
});
