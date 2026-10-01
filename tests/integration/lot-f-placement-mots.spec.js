import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT F (D4) — LES BOUTONS RENOMMÉS TIENNENT AUX QUATRE LARGEURS (29 sept. 2026).
// « Mettre à jour dans un autre fichier… » remplace « Enregistrer sous… » (plus long),
// « Copie de secours » remplace « Sauvegarder » sur l'Accueil (devenue « Ton codex » au lot I,
// #985, avec son sous-titre). Lot I bis (D9, 30 sept.) : le bouton « Faire une copie de
// secours » de Réglages › Données est retiré ; la carte y a deux cases, mesurées ici. Mesure : aucun débordement du texte hors de son élément
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

        // Réglages › Données : la carte « Ouverture et partage ». RÉANCRÉ au lot I bis (D9,
        // 30 sept. 2026) : la case de l'ancien fichier de secours et son bouton sont retirés ;
        // la carte a DEUX cases, côte à côte, et ses mots sont ceux validés par Grégoire.
        await page.evaluate(() => { afficherSection('reglages'); });
        await page.waitForTimeout(300);
        await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
        await page.waitForTimeout(500);
        const carteDonnees = await page.evaluate(() => {
            const txt = (el) => el.textContent.replace(/\s+/g, ' ').trim();
            const carte = document.querySelector('#reglages-donnees [data-tooltip="donnees-codex"]').closest('.carte');
            const cases = Array.from(carte.querySelectorAll('.carte-bleu-pale-p15')).map((c) => {
                const b = c.querySelector('button');
                const r = b.getBoundingClientRect();
                const rc = c.getBoundingClientRect();
                return {
                    titre: txt(c.querySelector('h4')), texte: txt(c.querySelector('p')), bouton: txt(b), action: b.dataset.action,
                    boutonDeborde: b.scrollWidth > b.clientWidth + 1,
                    boutonDansLaCase: r.left >= rc.left - 1 && r.right <= rc.right + 1,
                    dansLEcran: rc.left >= 0 && rc.right <= window.innerWidth + 1 && rc.width > 0,
                    haut: Math.round(rc.top), gauche: Math.round(rc.left)
                };
            });
            return {
                titre: txt(carte.querySelector('h3')), sousTitre: txt(carte.querySelector('p')),
                ancienBouton: document.querySelectorAll('[data-action="ouvrirModalExport"]').length,
                coteACote: cases.length === 2 && cases[0].haut === cases[1].haut && cases[0].gauche < cases[1].gauche,
                cases: cases.map(({ haut, gauche, ...reste }) => reste)
            };
        });
        expect(carteDonnees).toEqual({
            titre: 'Ouverture et partage',
            sousTitre: 'Ouvre un codex ou une configuration partagée, ou exporte ta configuration pédagogique pour la partager. Pour mettre ton travail en sûreté ou le transporter, mets ton codex à jour : menu Codex, en haut de l\'écran.',
            ancienBouton: 0,
            coteACote: true,
            cases: [
                { titre: 'Exporter ma config', texte: 'ZIP léger sans données étudiants : grilles, échelles, productions, cartouches. Pour partager avec des collègues (CC BY-NC-SA).', bouton: 'Exporter ma config', action: 'exporterConfigurationComplete', boutonDeborde: false, boutonDansLaCase: true, dansLEcran: true },
                { titre: 'Ouvrir un Codex', texte: 'Ouvre un codex ou une configuration partagée. Le type est détecté automatiquement.', bouton: 'Ouvrir un Codex…', action: 'ouvrirModalImport', boutonDeborde: false, boutonDansLaCase: true, dansLEcran: true }
            ]
        });

        // Accueil : la carte des utilitaires.
        await page.evaluate(() => { afficherSection('accueil'); });
        await page.waitForTimeout(800);
        const carte = await page.evaluate(() => {
            const el = [...document.querySelectorAll('.accueil-utilitaire-titre')].find((x) => x.textContent.trim() === 'Ton codex');
            if (!el) return { absent: true };
            const desc = el.parentElement.querySelector('.accueil-utilitaire-desc');
            const r = desc.getBoundingClientRect();
            return {
                deborde: el.scrollWidth > el.clientWidth + 1,
                descDeborde: desc.scrollWidth > desc.clientWidth + 1,
                descDansLEcran: r.right <= window.innerWidth && r.width > 0
            };
        });
        expect(carte).toEqual({ deborde: false, descDeborde: false, descDansLEcran: true });
    });
}
