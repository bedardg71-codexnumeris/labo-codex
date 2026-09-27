import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #963 — « JE FAIS RELIRE MA CARTE PAR UNE IA » (27 sept. 2026).
//
// Le geste que Grégoire fera : Actions ▸ « Télécharger un modèle… », choisir
// son étape et sa semaine, « Télécharger ». Ce que l'essai garde :
//   1. le principe est affiché sous le titre de la carte ;
//   2. le fichier téléchargé porte les consignes remplies avec CES choix ;
//   3. le téléchargement n'a rien écrit : la carte en mémoire ET sa copie dans
//      le magasin sont identiques avant et après (aller simple).
//
// La carte est celle du mode démo : des données fictives.

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
    await expect(page.locator('.planif-noeud').first()).toBeVisible();
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

/** La carte telle qu'elle vit : en mémoire, et dans le magasin. */
const instantane = (page) => page.evaluate(() => {
    const e = window.planificationCarte.etat;
    const idx = window.planificationDonnees.getIndex();
    const cles = Object.keys(localStorage).filter(k => k.includes('planification')).sort();
    return JSON.stringify({
        noeuds: [...e.noeuds.entries()],
        liens: [...e.liens.entries()],
        index: idx,
        magasin: cles.map(k => [k, localStorage.getItem(k)])
    });
});

test.describe('#963 · faire relire sa carte par une IA', () => {
    test('le principe est affiché sous le titre de la carte', async ({ page }) => {
        await ouvrirCarte(page);
        await expect(page.locator('#conception-carte > p.text-muted').nth(1))
            .toHaveText('Évaluer ce qu\'on enseigne, et enseigner ce qu\'on évalue, au même niveau d\'exigence.');
    });

    test('Actions ▸ Télécharger un modèle : le fichier porte les choix, et rien n\'est écrit', async ({ page }) => {
        await ouvrirCarte(page);
        const avant = await instantane(page);
        const nomCarte = await page.evaluate(() => {
            const idx = window.planificationDonnees.getIndex();
            return idx.cartes.find(c => c.id === idx.active).nom;
        });

        await page.click('#planif-btn-actions');
        await page.click('#planif-btn-modele-ia');
        const panneau = page.locator('#planif-modele-ia-panel');
        await expect(panneau).toBeVisible();
        await panneau.getByLabel('Relier').check();
        await page.selectOption('#planif-modele-ia-semaine', '3');

        // Le NOM que l'application demande, lu sur le lien qu'elle clique.
        // ⚠ Pas `suggestedFilename()` : sous Chromium sans interface en file://,
        // il rend « download » — pour l'export du plan aussi, mesuré le 27 sept.
        // L'essai garde ce que le code demande, pas ce que ce navigateur retient.
        await page.evaluate(() => {
            const cliquer = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () {
                window.__nomTelecharge = this.download;
                return cliquer.call(this);
            };
        });
        // Compter les écritures, pas seulement comparer les contenus : une
        // réécriture à l'identique passerait l'instantané (M5 du banc Vitest).
        await page.evaluate(() => {
            window.__ecritures = [];
            const poser = Storage.prototype.setItem;
            Storage.prototype.setItem = function (k, v) { window.__ecritures.push(k); return poser.call(this, k, v); };
            ['set', 'setSync'].forEach((m) => {
                const orig = window.db[m];
                window.db[m] = function (k, ...r) { window.__ecritures.push(k); return orig.call(this, k, ...r); };
            });
        });
        const [telechargement] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#planif-modele-ia-telecharger')
        ]);
        const chemin = await telechargement.path();
        const contenu = fs.readFileSync(chemin, 'utf8').replace(/^﻿/, '');

        expect(await page.evaluate(() => window.__nomTelecharge)).toMatch(/^modele-ia-.+\.md$/);
        expect(contenu.split('\n')[0]).toBe('# Carte d\'alignement : ' + nomCarte);
        expect(contenu).toMatch(/> Étape : Relier\. Carte bâtie jusqu'à la semaine 3( sur \d+)?\.\n/);
        expect(contenu).toContain('ce qui suit la semaine 3 ;');
        expect(contenu).toContain('## Semaine par semaine');
        await expect(panneau).toBeHidden();

        // Aller simple : ni la carte ni le magasin n'ont bougé.
        expect(await instantane(page)).toBe(avant);
        expect(await page.evaluate(() => window.__ecritures)).toEqual([]);

        if (process.env.MODELE_IA_EXEMPLE) fs.writeFileSync(process.env.MODELE_IA_EXEMPLE, contenu);
    });
});
