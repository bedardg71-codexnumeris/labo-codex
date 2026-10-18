import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_D, CRITERES_D, SECTIONS_D, TOTAUX_D, ligneD, partiesD, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 5 (« Couper », consigne du 18 oct. 2026), dans un vrai WebKit.
//
//   · la grille fictive (d), de la forme de celle de la porte, collée ; ses critères étiquetés sur leur
//     ligne entière : « Créer ma grille » refusé, chaque critère trop long NOMMÉ ;
//   · « Couper » en main : le bandeau, « Terminer » ; un toucher par événements de POINTEUR au point d'un
//     caractère calculé (`Range.getBoundingClientRect`) coupe le morceau à l'espace la plus proche, la
//     première partie garde « Critère » ; le glisser ne coupe pas ; « Annuler la dernière coupe » recolle ;
//     « Coller une autre grille » demande confirmation dès qu'une coupe est faite ;
//   · toutes les lignes coupées par le pointeur, les parties étiquetées : la grille se crée EN POINTS, ses
//     pondérations lues, et se retrouve dans Grilles de critères ;
//   · à 820 px, les boutons du bandeau font au moins 44 px et la page ne défile pas de côté.

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

/**
 * « Couper » doit être en main. Touche le morceau dont le texte est `texte` (le `n`-ième s'il revient)
 * au point du caractère de rang `rang` : sur son bord droit, la coupe vise le rang `rang + 1`. Avec
 * `glisser`, le doigt part de 40 px avant de se lever. Rend le texte des morceaux après le geste.
 */
async function toucher(page, texte, rang, { n = 0, glisser = false } = {}) {
    return page.evaluate(({ texte, rang, n, glisser }) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((x) => x.textContent === texte)[n];
        if (!b) throw new Error('Aucun morceau « ' + texte.slice(0, 40) + ' »');
        // Le bord GAUCHE du morceau en vue : à 820 px, un morceau plus large que le canevas aurait son début caché.
        b.scrollIntoView({ block: 'center', inline: 'start' });
        const r = document.createRange();
        r.setStart(b.firstChild, rang);
        r.setEnd(b.firstChild, rang + 1);
        const c = r.getBoundingClientRect();
        const p = { clientX: c.right - 1, clientY: c.top + c.height / 2 };
        const ev = (t, q) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 9, pointerType: 'touch', isPrimary: true }, q));
        b.dispatchEvent(ev('pointerdown', p));
        const fin = glisser ? { clientX: p.clientX + 40, clientY: p.clientY } : p;
        if (glisser) b.dispatchEvent(ev('pointermove', fin));
        b.dispatchEvent(ev('pointerup', fin));
        return [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].map((x) => x.textContent);
    }, { texte, rang, n, glisser });
}

const morceau = (page, t) => page.locator('#dissection-contenu .dissection-morceau').filter({ hasText: new RegExp('^' + t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$') });

/** La ligne du critère `i`, coupée par le pointeur : à la fin de son nom, de « / N », puis avant chaque « [ ] ». */
async function couperLigne(page, i) {
    const [nom, pts] = CRITERES_D[i];
    const [, pond, cases] = partiesD(nom, pts, i + 1);
    // Une ligne de critère est unique ; « / 10 » et « / 20 » reviennent : leurs parties le sont, par leurs cases.
    await toucher(page, ligneD(i), nom.length - 1);
    await toucher(page, pond + ' ' + cases, pond.length - 1);
    let reste = cases;
    for (let k = reste.indexOf(' [ ] '); k >= 0; k = reste.indexOf(' [ ] ')) {
        await toucher(page, reste, k - 1);
        reste = reste.slice(k + 1);
    }
}

test('dissection 5 · « Couper » : (d) refusée en nommant, coupée au pointeur, annulée, créée en points, retrouvée', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_D));
    await expect(page.locator('#materiel-dissection')).toBeVisible();

    // « Coller une autre grille » : une coupe seule (aucune étiquette) suffit à demander confirmation.
    await page.locator('#dissection-palette [data-param="couper"]').click();
    expect(await toucher(page, TOTAUX_D[1], 4)).toContain('Total');
    await page.keyboard.press('Escape');
    const autre = page.locator('[data-action="materielDissection.collerAutre"]');
    await autre.click();
    await expect(autre).toHaveText('Confirmer : coller une autre grille');
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await page.locator('#dissection-palette [data-param="couper"]').click();
    await page.locator('#dissection-annuler-coupe').click();
    await expect(autre).toHaveText('Coller une autre grille');
    await expect(morceau(page, TOTAUX_D[1])).toHaveCount(1);
    await page.keyboard.press('Escape');

    // Étiquetée comme le 18 oct. : les critères sur leur ligne entière. Refusée, chaque critère trop long nommé.
    await etiqueter(page, 'titre', ['Évaluation fictive sur les images']);
    await etiqueter(page, 'section', SECTIONS_D);
    await etiqueter(page, 'critere', CRITERES_D.map((c, i) => ligneD(i)));
    await etiqueter(page, 'total', TOTAUX_D);
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(bouton).toBeDisabled();
    const raisons = page.locator('#dissection-creer-raisons');
    await expect(raisons).toContainText('des noms de critères plus courts (200 caractères au plus) pour « Repérage fictif des images / 10 [ ] le… »');
    await expect(raisons).toContainText('et 3 autres : coupe-les avec « Couper »');
    await expect(raisons).not.toContainText('étape');

    // « Couper » en main : le bandeau, « Terminer », pas encore d'annulation ; l'outil ne compte rien.
    await page.locator('#dissection-palette [data-param="couper"]').click();
    await expect(page.locator('#dissection-palette [data-param="couper"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#dissection-bandeau-texte')).toHaveText('Outil « Couper » : touche l’endroit d’un morceau où le séparer en deux. La coupe tombe entre deux mots.');
    await expect(page.locator('#dissection-terminer')).toBeVisible();
    await expect(page.locator('#dissection-annuler-coupe')).toBeHidden();

    // Un toucher DANS un mot (le « g » de « images ») : la coupe tombe à l'espace qui suit ; « Critère » reste au nom.
    const nom0 = CRITERES_D[0][0];
    await toucher(page, ligneD(0), nom0.length - 3);
    await expect(morceau(page, nom0)).toHaveAttribute('data-type', 'critere');
    await expect(morceau(page, ligneD(0).slice(nom0.length + 1))).not.toHaveAttribute('data-type', /.+/);
    await expect(page.locator('#dissection-statut')).toHaveText('Morceau coupé en deux : « ' + nom0 + ' » et « ' + ligneD(0).slice(nom0.length + 1) + ' ».');
    await expect(page.locator('#dissection-annuler-coupe')).toBeVisible();
    await expect(page.locator('#dissection-palette [data-param="couper"] .dissection-etiquette-compte')).toHaveText('');

    // Le glisser ne coupe pas.
    const avant = await page.locator('#dissection-contenu .dissection-morceau').count();
    await toucher(page, ligneD(1), 10, { glisser: true });
    await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(avant);

    // « Annuler la dernière coupe » : la ligne recollée, son étiquette rendue, plus rien à annuler.
    await page.locator('#dissection-annuler-coupe').click();
    await expect(morceau(page, ligneD(0))).toHaveAttribute('data-type', 'critere');
    await expect(morceau(page, nom0)).toHaveCount(0);
    await expect(page.locator('#dissection-annuler-coupe')).toBeHidden();
    await expect(page.locator('#dissection-statut')).toHaveText('Coupe annulée : « ' + ligneD(0) + ' » est recollé.');

    // À 820 px : les boutons du bandeau à 44 px, aucun défilement de côté.
    await toucher(page, ligneD(0), nom0.length - 1);
    const mesure = await page.evaluate(() => ({
        annuler: document.getElementById('dissection-annuler-coupe').getBoundingClientRect().height,
        terminer: document.getElementById('dissection-terminer').getBoundingClientRect().height,
        debord: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(mesure.annuler).toBeGreaterThanOrEqual(44);
    expect(mesure.terminer).toBeGreaterThanOrEqual(44);
    expect(mesure.debord).toBeLessThanOrEqual(0);
    await page.locator('#dissection-bandeau').scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath('dissection-5-couper-820.png') });
    await page.locator('#dissection-annuler-coupe').click();

    // Toutes les lignes coupées au pointeur, puis les parties étiquetées.
    for (let i = 0; i < CRITERES_D.length; i++) await couperLigne(page, i);
    await page.locator('#dissection-terminer').click();
    await expect(page.locator('#dissection-annuler-coupe')).toBeHidden();
    await etiqueter(page, 'ponderation', CRITERES_D.map(([nom, n], i) => partiesD(nom, n, i + 1)[1]));
    const cases = await page.evaluate(() => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].map((b) => b.textContent).filter((t) => t.startsWith('[ ] ')));
    expect(cases).toHaveLength(18);
    await etiqueter(page, 'souscritere', cases);
    CRITERES_D.forEach(([nom]) => expect(morceau(page, nom)).toHaveAttribute('data-type', 'critere'));

    await expect(page.locator('#dissection-logique')).toContainText('L’application y lirait une grille en points');
    await expect(page.locator('#dissection-constats')).toContainText('6 critères');
    await expect(page.locator('#dissection-sans-place')).toBeEmpty();
    await expect(raisons).toHaveCount(0);
    await expect(bouton).toBeEnabled();
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Évaluation fictive sur les images » est créée');

    const g = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0]);
    expect(g.nom).toBe('Évaluation fictive sur les images');
    expect(g.criteres.map((c) => [c.nom, c.ponderation])).toEqual([
        ['Partie A : repérer – Repérage fictif des images', 10],
        ['Partie A : repérer – Classement fictif des images', 20],
        ['Partie B : interpréter – Interprétation fictive des motifs', 15],
        ['Partie B : interpréter – Mise en relation fictive des motifs', 25],
        ['Partie C : rédiger – Rédaction fictive de la synthèse', 10],
        ['Partie C : rédiger – Justesse fictive de la langue', 20]
    ]);
    expect(g.criteres[0].sousCriteres.map((s) => s.nom)).toEqual([
        '[ ] le premier repère fictif 1 est relevé / n’est pas relevé',
        '[ ] le deuxième repère fictif 1 est expliqué / n’est pas expliqué',
        '[ ] le troisième repère fictif 1 est relié à l’ensemble / n’y est pas relié'
    ]);

    // Retrouvée dans Grilles de critères : ses six critères et leurs points.
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    const liste = page.locator('#listeCriteres');
    await expect(liste.locator('.critere-rangee input[data-champ="nom"]')).toHaveCount(6);
    const vus = await liste.locator('.critere-rangee').evaluateAll((rs) => rs.map((r) => [
        r.querySelector('input[data-champ="nom"]').value, r.querySelector('input[data-champ="ponderation"]')?.value]));
    expect(vus).toEqual(g.criteres.map((c) => [c.nom, String(c.ponderation)]));
    await expect(page.locator('#totalPonderationAffichage')).toHaveText('100 points');
    expect(erreurs).toEqual([]);
});
