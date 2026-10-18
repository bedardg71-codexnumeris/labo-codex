import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_D7, SECTION_D7, NOM_D7, POND_D7, CASES_D7, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 7 (« Rattacher », consigne du 18 oct. 2026), dans un vrai WebKit.
//
//   · la grille fictive (d7) collée : « Rattacher » dans « Le reste », après « Couper » ; un lien seul suffit à
//     faire confirmer « Coller une autre grille » ;
//   · deux touchers par événements de POINTEUR : la suite choisie (marquée, le bandeau change), retouchée
//     (choix annulé), Échap (annulé aussi) ; puis le lien : la marque, la flèche de B vers A, l'étiquette de B
//     retirée ; les refus « déjà la suite » et « boucle » ; retoucher un morceau rattaché défait son lien ;
//   · la marque reste l'outil posé, la flèche non ; étiqueter un morceau rattaché ne change rien, et se dit ;
//   · C1 (verdict du 18 oct., 17 h 15) : la marque d'une suite suit l'étiquette posée, changée ou retirée
//     ENSUITE sur son A (break-test : sans la remarque des suites dans `appliquer`, l'essai rougit) ;
//   · la lecture montre le nom entier ; la grille se crée, et son critère se retrouve sous son nom entier
//     dans Grilles de critères ;
//   · à 820 px, l'outil fait au moins 44 px et la page ne défile pas de côté.

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

test('dissection 7 · « Rattacher » : deux touchers au pointeur, marque et flèche, refus, nom entier créé et retrouvé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await coller(page, enHtml(GRILLE_D7));
    await expect(page.locator('#materiel-dissection')).toBeVisible();

    // L'outil, dans « Le reste », juste après « Couper ».
    const reste = await page.locator('#dissection-palette .dissection-etiquette').evaluateAll((bs) => bs.map((b) => b.getAttribute('data-param')).slice(-4));
    expect(reste).toEqual(['suite', 'couper', 'rattacher', 'ignorer']);
    await expect(outil(page)).toContainText('Rattacher');
    await expect(outil(page)).toContainText('Joint un morceau à celui dont il est la suite');

    // Un lien seul (aucune étiquette) suffit à faire confirmer « Coller une autre grille ».
    await outil(page).click();
    await expect(page.locator('#dissection-bandeau-texte')).toHaveText('Outil « Rattacher » : touche d’abord le morceau qui en continue un autre, puis celui qu’il continue. Touche un morceau déjà rattaché pour défaire son lien.');
    await toucher(page, NOM_D7[2]);
    await toucher(page, NOM_D7[0]);
    await page.keyboard.press('Escape');
    const autre = page.locator('[data-action="materielDissection.collerAutre"]');
    await autre.click();
    await expect(autre).toHaveText('Confirmer : coller une autre grille');
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    // C1 (verdict du 18 oct., 17 h 15) : rattacher d'abord, étiqueter A ensuite : la suite prend la couleur
    // de l'étiquette posée sur A, puis de celle qui la remplace ; l'étiquette retirée, elle la perd.
    const suite = morceau(page, NOM_D7[2]);
    await expect(suite).toHaveClass(/dissection-rattache/);
    await expect(suite).not.toHaveClass(/dis-t-/);
    await etiqueter(page, 'critere', [NOM_D7[0]]);
    await expect(suite).toHaveClass(/dis-t-critere/);
    await etiqueter(page, 'descripteur', [NOM_D7[0]]);
    await expect(suite).toHaveClass(/dis-t-descripteur/);
    await expect(suite).not.toHaveClass(/dis-t-critere/);
    await etiqueter(page, 'descripteur', [NOM_D7[0]]);
    await expect(morceau(page, NOM_D7[0])).not.toHaveAttribute('data-type', /.+/);
    await expect(suite).not.toHaveClass(/dis-t-/);
    await expect(suite).toHaveClass(/dissection-rattache/);
    // Le lien défait (outil en main, un toucher sur la suite) : on repart d'une feuille sans lien.
    await outil(page).click();
    await expect(autre).toHaveText('Coller une autre grille');
    await toucher(page, NOM_D7[2]);
    await expect(statut(page)).toHaveText('Lien défait : « renvois) » redevient un morceau à part.');
    await expect(morceau(page, NOM_D7[2])).not.toHaveClass(/dissection-rattache/);
    await page.keyboard.press('Escape');

    // Étiquetée comme à la porte : les deux fins du nom en Critère, des critères à part.
    await etiqueter(page, 'titre', ['Évaluation fictive sur les images']);
    await etiqueter(page, 'section', [SECTION_D7]);
    await etiqueter(page, 'critere', NOM_D7);
    await etiqueter(page, 'ponderation', [POND_D7]);
    await etiqueter(page, 'souscritere', CASES_D7);
    await expect(page.locator('#dissection-constats')).toContainText('3 critères');
    await expect(page.locator('#dissection-comprise .dissection-crit-nom')).toHaveText(NOM_D7);

    // Premier toucher : la suite choisie, marquée ; retouchée, le choix tombe ; Échap aussi.
    const idNom = await idDe(page, NOM_D7[0]);
    await outil(page).click();
    await expect(outil(page)).toHaveAttribute('aria-pressed', 'true');
    await toucher(page, NOM_D7[2]);
    await expect(morceau(page, NOM_D7[2])).toHaveClass(/dissection-choisi/);
    await expect(page.locator('#dissection-bandeau-texte')).toHaveText('Outil « Rattacher » : touche maintenant le morceau que « renvois) » continue. Retouche « renvois) » pour annuler.');
    await expect(statut(page)).toHaveText('Suite choisie : « renvois) ». Touche maintenant le morceau qu’il continue.');
    await toucher(page, NOM_D7[2]);
    await expect(morceau(page, NOM_D7[2])).not.toHaveClass(/dissection-choisi/);
    await expect(statut(page)).toHaveText('Choix annulé : aucun lien créé.');
    await toucher(page, NOM_D7[2]);
    await page.keyboard.press('Escape');
    await expect(outil(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(morceau(page, NOM_D7[2])).not.toHaveClass(/dissection-choisi/);

    // Les deux touchers : « renvois) » rattaché au nom. Sa marque, son étiquette retirée, la flèche de B vers A.
    await outil(page).click();
    await toucher(page, NOM_D7[2]);
    await toucher(page, NOM_D7[0]);
    const fin = morceau(page, NOM_D7[2]);
    await expect(fin).toHaveClass(/dissection-rattache/);
    await expect(fin).toHaveAttribute('data-suite-de', idNom);
    await expect(fin).not.toHaveAttribute('data-type', /.+/);
    await expect(statut(page)).toHaveText('Morceaux rattachés : l’application lit « Nuances fictives du propos renvois) ». L’étiquette « Critère » de la suite est retirée : celle du premier morceau vaut pour le texte entier.');
    const fleche = page.locator('#dissection-traits path.dissection-trait-lien');
    await expect(fleche).toHaveCount(1);
    await expect(fleche).toHaveAttribute('data-de', await fin.getAttribute('data-id'));
    await expect(fleche).toHaveAttribute('data-vers', idNom);
    // La marque n'est pas que la couleur : un trait en pointillé et le symbole.
    const marque = await fin.evaluate((b) => ({ trait: getComputedStyle(b).borderLeftStyle, symbole: getComputedStyle(b, '::before').content }));
    expect(marque.trait).toBe('dashed');
    expect(marque.symbole).toContain('↳');

    // Refus « déjà la suite » : la suite choisie reste choisie, aucun lien créé.
    await toucher(page, NOM_D7[1]);
    await toucher(page, NOM_D7[2]);
    await expect(statut(page)).toHaveText('Ce morceau est déjà la suite de « Nuances fictives du propos » : rattache plutôt à celui-là.');
    await expect(morceau(page, NOM_D7[1])).toHaveClass(/dissection-choisi/);
    await expect(fleche).toHaveCount(1);
    // … puis le bon morceau : le nom entier, dans l'ordre de la grille (pas celui des gestes).
    await toucher(page, NOM_D7[0]);
    await expect(statut(page)).toHaveText(/^Morceaux rattachés : l’application lit « Nuances fictives du propos \(exemples, contrastes, renvois\) »\./);
    await expect(fleche).toHaveCount(2);

    // Refus « boucle » : le nom choisi comme suite de sa propre suite. Puis le choix retouché tombe.
    await toucher(page, NOM_D7[0]);
    await toucher(page, NOM_D7[2]);
    await expect(statut(page)).toHaveText('Ce morceau est déjà la suite de « Nuances fictives du propos » : ils sont déjà rattachés, dans l’autre sens.');
    await expect(fleche).toHaveCount(2);
    await toucher(page, NOM_D7[0]);
    await expect(statut(page)).toHaveText('Choix annulé : aucun lien créé.');

    // À 820 px : l'outil à 44 px, aucun défilement de côté.
    const mesure = await page.evaluate(() => ({
        outil: document.querySelector('#dissection-palette [data-param="rattacher"]').getBoundingClientRect().height,
        debord: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(mesure.outil).toBeGreaterThanOrEqual(44);
    expect(mesure.debord).toBeLessThanOrEqual(0);
    await morceau(page, NOM_D7[0]).scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath('dissection-7-rattacher-820.png') });

    // L'outil posé : la marque reste, la flèche part.
    await page.locator('#dissection-terminer').click();
    await expect(fleche).toHaveCount(0);
    await expect(fin).toHaveClass(/dissection-rattache/);

    // Étiqueter un morceau rattaché ne change rien, et se dit.
    await page.locator('#dissection-palette [data-param="descripteur"]').click();
    await toucher(page, NOM_D7[2]);
    await expect(fin).not.toHaveAttribute('data-type', /.+/);
    await expect(statut(page)).toHaveText('Ce morceau est la suite de « Nuances fictives du propos » : l’étiquette de « Nuances fictives du propos » vaut pour les deux. Défais le lien avec « Rattacher » pour l’étiqueter à part.');
    await page.keyboard.press('Escape');

    // La lecture : un seul critère, sous le nom entier, sa pondération et ses cases.
    const nomEntier = NOM_D7.join(' ');
    await expect(page.locator('#dissection-constats')).toContainText('1 critère');
    await expect(page.locator('#dissection-comprise .dissection-crit-nom')).toHaveText([nomEntier]);
    await expect(page.locator('#dissection-logique')).toContainText('L’application y lirait une grille en points');
    const bouton = page.locator('#dissection-creer [data-action="materielDissection.creer"]');
    await expect(bouton).toBeEnabled();
    await bouton.click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Évaluation fictive sur les images » est créée');

    const g = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).slice(-1)[0]);
    expect(g.criteres.map((c) => [c.nom, c.ponderation])).toEqual([['Partie D : nuancer – ' + nomEntier, 24]]);
    expect(g.criteres[0].sousCriteres.map((s) => s.nom)).toEqual(CASES_D7);

    // Retrouvée dans Grilles de critères, sous le nom entier.
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    const liste = page.locator('#listeCriteres');
    await expect(liste.locator('.critere-rangee input[data-champ="nom"]')).toHaveCount(1);
    await expect(liste.locator('.critere-rangee input[data-champ="nom"]')).toHaveValue('Partie D : nuancer – ' + nomEntier);
    expect(erreurs).toEqual([]);
});
