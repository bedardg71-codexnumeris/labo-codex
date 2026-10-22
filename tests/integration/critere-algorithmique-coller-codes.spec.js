import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ÉTAPE 5 DU CRITÈRE ALGORITHMIQUE — COLLER SA LISTE DE CODES (22 oct. 2026), dans un vrai WebKit.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-22-critere-algorithmique-coller-codes.md (option A).
//
//   · une liste de codes de chimie, fictive, collée dans « Apporter mon matériel », étiquetée au doigt ; son nom
//     et son commentaire PIÉGÉS (`<img onerror>`) : la lecture les montre comme du texte ;
//   · « Où vont ces codes ? » : le critère qui peut la recevoir, et ceux qui ne le peuvent pas, grisés, leur
//     motif dessous ; le bouton attend un choix ;
//   · « Ajouter ces codes » : les sous-critères en base, le reste du critère inchangé ; la confirmation ; le
//     critère, qui a maintenant des codes, ne se choisit plus ;
//   · Grilles de critères montre les codes : rien de collé ne s'exécute ;
//   · à 820 px (iPad, au doigt) : des cibles de 44 px, aucun débord.

const MARQUE = 'codesSousCriteresSeulement';
const PIEGE_NOM = 'Unité <img src=x onerror="window.__piege=1">';
const PIEGE_COMMENTAIRE = 'Écris l’unité. <img src=x onerror="window.__piege=2">';
const LISTE = [
    [{ l: [['Code', null]] }, { l: [['Nom', null]] }, { l: [['Poids', null]] }, { l: [['Commentaire', null]] }],
    [{ l: [['U1', 'code']] }, { l: [[PIEGE_NOM, 'nomcode']] }, { l: [['2', 'poids']] }, { l: [[PIEGE_COMMENTAIRE, 'commentaire']] }],
    [{ l: [['CS', 'code']] }, { l: [['Chiffres significatifs', 'nomcode']] }, { l: [] }, { l: [['Arrondis au bon nombre de chiffres.', 'commentaire']] }]
];

async function attendreApp(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
}

/** Le trimestre de banc, deux grilles : un critère de chimie qui attend ses codes, un critère qui en a déjà. */
async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate((marque) => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
        db.setSync('a2032_grillesTemplates', [   // security-ok: banc, deux grilles fictives dans un contexte neuf
            { id: 'GRILLE_CHIMIE', nom: 'Laboratoire fictif', criteres: [
                { id: 'CR_CALC', nom: 'Calculs fictifs', type: 'algorithmique', ponderation: 20, description: '', formule: '', niveauSOLO: 'aucun', verrouille: false, [marque]: true }
            ] },
            { id: 'GRILLE_PLEINE', nom: 'Rédaction fictive', criteres: [
                { id: 'CR_LANGUE', nom: 'Langue fictive', type: 'algorithmique', ponderation: 30, description: '', formule: '', niveauSOLO: 'aucun', verrouille: false, [marque]: true,
                    sousCriteres: [{ id: 'SC_X', code: 'X', nom: 'Déjà là', ponderation: 1, retroaction: '' }] }
            ] }
        ]);
    }, MARQUE);
    await page.reload();
    await attendreApp(page);
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

/** Une étiquette en main, puis un geste de pointeur sur les morceaux de la liste (celui de la spec 2a). */
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

const grilles = (page) => page.evaluate(() => db.getSync(cle('grillesTemplates'), []));

test.describe('iPad', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

    test('étape 5 · une liste de codes collée va dans le critère qui l’attend ; rien de collé ne s’exécute ; un critère qui a des codes est refusé', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirConception(page);
        await coller(page, enHtml(LISTE));
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        await etiqueter(page, 'code', ['U1', 'CS']);
        await etiqueter(page, 'nomcode', [PIEGE_NOM, 'Chiffres significatifs']);
        await etiqueter(page, 'poids', ['2']);
        await etiqueter(page, 'commentaire', [PIEGE_COMMENTAIRE, 'Arrondis au bon nombre de chiffres.']);

        // La lecture : une rangée par code, le piège en texte.
        const table = page.locator('#dissection-comprise .dissection-table-codes');
        await expect(table.locator('tbody tr')).toHaveCount(2);
        await expect(table.locator('tbody tr').first().locator('td')).toHaveText(['U1', PIEGE_NOM, '2', PIEGE_COMMENTAIRE]);
        await expect(table.locator('tbody tr').nth(1).locator('td').nth(2)).toHaveText('1');
        await expect(page.locator('#dissection-comprise img[onerror]')).toHaveCount(0);

        // Où vont ces codes : le critère de chimie se choisit ; celui qui a déjà des codes, grisé, son motif dessous.
        const options = page.locator('#dissection-destinations .dissection-creer-option');
        await expect(options).toHaveCount(2);
        await expect(options.nth(0).locator('input')).toBeEnabled();
        await expect(options.nth(1).locator('input')).toBeDisabled();
        await expect(options.nth(1).locator('.dissection-destination-motif')).toHaveText('Il a déjà des codes ou des sous-critères : rien n’est remplacé');
        const bouton = page.locator('[data-action="materielDissection.ajouterCodes"]');
        await expect(bouton).toBeDisabled();
        await expect(page.locator('#dissection-creer-raisons')).toContainText('le critère qui recevra ces codes');

        // À 820 px : des cibles de 44 px, et la page ne défile pas de côté.
        expect((await options.nth(0).boundingBox()).height).toBeGreaterThanOrEqual(44);
        expect((await bouton.boundingBox()).height).toBeGreaterThanOrEqual(44);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

        const avant = await grilles(page);
        await options.nth(0).click();
        await expect(bouton).toBeEnabled();
        await bouton.click();
        await expect(page.locator('#dissection-codes-ajoutes')).toHaveText('2 codes ajoutés à « Calculs fictifs » (grille « Laboratoire fictif »). Tu les retrouves dans « Grilles de critères ».');
        await expect(page.locator('#dissection-codes-ajoutes')).toBeFocused();

        // En base : les sous-critères, tels quels ; le reste à l'octet près.
        const apres = await grilles(page);
        const scs = apres[0].criteres[0].sousCriteres;
        expect(scs.map((s) => [s.code, s.nom, s.ponderation, s.retroaction])).toEqual([
            ['U1', PIEGE_NOM, 2, PIEGE_COMMENTAIRE], ['CS', 'Chiffres significatifs', 1, 'Arrondis au bon nombre de chiffres.']]);
        expect(scs.every((s) => /^SC_/.test(s.id))).toBe(true);
        delete apres[0].criteres[0].sousCriteres;
        expect(JSON.stringify(apres)).toBe(JSON.stringify(avant));

        // Le critère qui vient de recevoir la liste ne se choisit plus : un second toucher n'ajoute rien.
        await expect(options.nth(0).locator('input')).toBeDisabled();
        await expect(bouton).toBeDisabled();

        // Grilles de critères montre les codes : rien de collé ne s'exécute.
        await page.evaluate(async () => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif('GRILLE_CHIMIE'); });
        await expect(page.locator('#listeCriteres .item-liste').first()).toBeVisible();
        await expect.poll(() => page.locator('#listeCriteres').evaluate((l) => [...l.querySelectorAll('input, textarea')].map((x) => x.value)))
            .toEqual(expect.arrayContaining(['U1', PIEGE_NOM, PIEGE_COMMENTAIRE]));
        await expect(page.locator('#listeCriteres img[onerror]')).toHaveCount(0);   // la page a ses propres images (icônes)
        expect(await page.evaluate(() => window.__piege)).toBeUndefined();
        expect(erreurs).toEqual([]);
    });
});
