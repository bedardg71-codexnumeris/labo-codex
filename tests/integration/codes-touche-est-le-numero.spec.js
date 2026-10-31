import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// CONSIGNE DU 31 OCT. 2026, PARTIE E — LA TOUCHE D'UN CODE EST SON NUMÉRO.
//
// Constat de Grégoire (iPad, séance du 31 oct.) : les raccourcis enregistrés ne concordaient plus avec les numéros,
// après un déplacement des codes : le code 4 se posait avec la touche 5, le 6 avec la 4.
// Ses entrées `errfr_*` enregistrées ne sont plus lues, et ne sont pas effacées.

const ouvrirAvecRaccourcis = async (page, racc) => {
    const suivi = await ouvrirCopie(page);
    await page.evaluate((racc) => {
        window.db.setSync('raccourcisAnnotation', racc);
        window.travauxOutils.invaliderCacheRaccourcis();
        document.activeElement && document.activeElement.blur();
    }, racc);
    return suivi;
};
const outil = (page) => page.evaluate(() => window.travauxOutils.getOutilActif().id);
const numeroActif = (page) => page.evaluate(() => {
    const id = window.travauxOutils.getOutilActif().id;
    return window.codesAnnotation.listeCodes(null).find((c) => c.id === id)?.numero || null;
});
const idDuCode = (page, numero) => page.evaluate((n) => window.codesAnnotation.listeCodes(null).find((c) => c.numero === n).id, numero);

test.describe('La touche d’un code est son numéro', () => {
    test('des raccourcis enregistrés désaccordés ne décident plus : la touche 4 pose le code 4, et ils restent enregistrés', async ({ page }) => {
        await ouvrirCopie(page);
        const [c4, c5, c6] = [await idDuCode(page, '4'), await idDuCode(page, '5'), await idDuCode(page, '6')];
        const avant = { [c4]: '5', [c6]: '4', [c5]: '6', stylo: 'd' };
        await page.evaluate((r) => { window.db.setSync('raccourcisAnnotation', r); window.travauxOutils.invaliderCacheRaccourcis(); }, avant);

        await page.keyboard.press('4');
        expect(await numeroActif(page)).toBe('4');
        await page.keyboard.press('6');
        expect(await numeroActif(page)).toBe('6');
        await page.keyboard.press('0');
        expect(await numeroActif(page)).toBe('10');
        await page.keyboard.press('d');
        expect(await outil(page)).toBe('stylo'); // témoin : une lettre va toujours à son outil
        expect(await page.evaluate(() => window.db.getSync('raccourcisAnnotation', null))).toMatchObject(avant);
        // Une lettre gardée d'avant sur un code n'est plus lue non plus.
        await page.evaluate((c4) => { window.db.setSync('raccourcisAnnotation', { [c4]: 'k' }); window.travauxOutils.invaliderCacheRaccourcis(); }, c4);
        await page.keyboard.press('k');
        expect(await outil(page)).toBe('stylo');
    });

    test('un chiffre va au code, même si un tampon avait reçu ce chiffre', async ({ page }) => {
        await ouvrirAvecRaccourcis(page, { 'obs-relation': '3', 'obs-rupture': '*', stylo: 'd' });
        await page.keyboard.press('3');
        expect(await numeroActif(page)).toBe('3');
        expect(await page.evaluate(() => window.travauxOutils.getAutocollantActif())).toBeNull();
        await page.keyboard.press('*');
        expect(await page.evaluate(() => window.travauxOutils.getAutocollantActif())).toBe('obs-rupture'); // témoin
    });

    test('donner ce chiffre à un tampon ne touche pas aux entrées de codes enregistrées', async ({ page }) => {
        await ouvrirCopie(page);
        const c4 = await idDuCode(page, '4');
        await page.evaluate((c4) => {
            window.db.setSync('raccourcisAnnotation', { [c4]: '7' });
            window.travauxOutils.invaliderCacheRaccourcis();
            window.travauxOutils.definirRaccourci('obs-relation', '7');
        }, c4);
        const r = await page.evaluate(() => window.db.getSync('raccourcisAnnotation', null));
        expect(r[c4]).toBe('7');
        expect(r['obs-relation']).toBe('7');
    });

    test('la palette n’a plus de badge gris, et le compteur des codes posés reste', async ({ page }) => {
        await ouvrirCopie(page);
        const m = await page.evaluate(() => {
            if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
            const p = document.getElementById('travaux-palette-erreurs-fr');
            return {
                items: p.querySelectorAll('.travaux-errfr-item').length,
                badges: p.querySelectorAll('.raccourci-badge').length,
                compteurs: p.querySelectorAll('.travaux-errfr-compteur').length,
                titre: p.querySelector('.travaux-errfr-item').title
            };
        });
        expect(m.items).toBe(10);
        expect(m.badges).toBe(0);
        expect(m.compteurs).toBe(10);
        expect(m.titre).not.toMatch(/\[/);
    });

    test('l’écran de réglage des codes ne propose plus de touche ; celui des tampons, si', async ({ page }) => {
        await ouvrirCopie(page);
        const n = await page.evaluate(() => {
            window.travauxOutils.ouvrirEditionRetroErreursFr();
            const lignes = document.querySelectorAll('#travaux-retro-errfr-liste .travaux-retro-draggable').length;
            const champs = document.querySelectorAll('#travaux-retro-errfr-liste input[data-raccourci-id]').length;
            return { lignes, champs };
        });
        expect(n.lignes).toBe(10); // témoin : l'écran est bien ouvert
        expect(n.champs).toBe(0);
        await attendre(page, 50);
    });
});
