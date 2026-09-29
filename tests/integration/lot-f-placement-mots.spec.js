import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT F (D4) — LES BOUTONS RENOMMÉS TIENNENT AUX QUATRE LARGEURS (29 sept. 2026).
// « Mettre à jour dans un autre fichier… » remplace « Enregistrer sous… » (plus long),
// « Faire une copie de secours » remplace « Exporter le Codex », « Copie de secours » remplace
// « Sauvegarder » sur l'Accueil. Mesure : aucun débordement du texte hors de son élément
// (scrollWidth ≤ clientWidth), aucun élément hors de l'écran. Pack démo.

const LARGEURS = [[768, 1024], [1024, 768], [1180, 820], [1470, 956]];

async function demarrer(page, largeur, hauteur) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        await new Promise((res) => { const r = indexedDB.deleteDatabase('LaboCodexDB'); r.onsuccess = r.onerror = r.onblocked = () => res(); setTimeout(res, 1500); });
    });
    await page.reload();
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

for (const [largeur, hauteur] of LARGEURS) {
    test(`placement des mots renommés à ${largeur} px`, async ({ page }) => {
        test.setTimeout(90000);
        page.on('dialog', (d) => d.accept().catch(() => {}));
        await demarrer(page, largeur, hauteur);

        // Menu du codex (un codex actif pour que tout le menu s'affiche).
        await page.evaluate(() => db.setSync('_codex_etat', { actif: true, nom: 'Codex du banc', derniereSauvegarde: null, modificationsDepuis: new Date().toISOString(), manifeste: null }));
        await page.reload();
        await page.waitForTimeout(3500);
        await page.evaluate(() => Codex.toggleMenu());
        const mesures = await page.evaluate(() => {
            const mes = (sel) => {
                const el = document.querySelector(sel);
                if (!el || el.getClientRects().length === 0) return { absent: true, sel };
                const r = el.getBoundingClientRect();
                return { sel, texte: el.textContent.replace(/\s+/g, ' ').trim(), deborde: el.scrollWidth > el.clientWidth + 1, horsEcran: r.left < 0 || r.right > window.innerWidth + 1 };
            };
            return [
                mes('[data-action="Codex.actionEnregistrer"]'),
                mes('[data-action="Codex.actionEnregistrerSous"]'),
                mes('#codex-menu-statut-haut .codex-statut-etat')
            ];
        });
        expect(mesures.map((m) => m.texte)).toEqual([
            expect.stringContaining('Mettre à jour le codex'),
            'Mettre à jour dans un autre fichier…',
            expect.stringContaining('Ton codex n\'a pas tes derniers changements')
        ]);
        for (const m of mesures) expect({ sel: m.sel, deborde: m.deborde, horsEcran: m.horsEcran }).toEqual({ sel: m.sel, deborde: false, horsEcran: false });
        await page.evaluate(() => Codex.toggleMenu());

        // Réglages › Données : la carte de la copie de secours.
        await page.evaluate(() => { afficherSection('reglages'); });
        await page.waitForTimeout(300);
        await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
        await page.waitForTimeout(500);
        const bouton = await page.evaluate(() => {
            const el = document.querySelector('#reglages-donnees [data-action="ouvrirModalExport"]');
            const r = el.getBoundingClientRect();
            const carte = el.closest('.carte-bleu-pale-p15').getBoundingClientRect();
            return { texte: el.textContent.trim(), deborde: el.scrollWidth > el.clientWidth + 1, dansLaCarte: r.left >= carte.left - 1 && r.right <= carte.right + 1 };
        });
        expect(bouton).toEqual({ texte: 'Faire une copie de secours', deborde: false, dansLaCarte: true });

        // Accueil : la carte des utilitaires.
        await page.evaluate(() => { afficherSection('accueil'); });
        await page.waitForTimeout(800);
        const carte = await page.evaluate(() => {
            const el = [...document.querySelectorAll('.accueil-utilitaire-titre')].find((x) => x.textContent.trim() === 'Copie de secours');
            if (!el) return { absent: true };
            return { deborde: el.scrollWidth > el.clientWidth + 1 };
        });
        expect(carte).toEqual({ deborde: false });
    });
}
