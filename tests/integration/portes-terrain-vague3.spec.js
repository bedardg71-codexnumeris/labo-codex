import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Portes terrain vague 3 → filets WebKit permanents (Lot W, 3 juillet 2026).
//
// Ces portes étaient des vérifications VISUELLES ponctuelles (passe Safari
// Mac/iPad). La CI exécute Playwright sur WebKit — le moteur de Safari — à
// chaque push : chaque porte convertie ici est re-vérifiée à chaque
// déploiement, dans le moteur où le bug d'origine vivait.
//   1. #118  : overflow horizontal de Calendrier → Trimestre — bug
//              SAFARI-SEULEMENT à l'origine (min-width:auto des enfants de
//              grid) ; la mesure scrollWidth ici est LE check qui l'aurait
//              attrapé à sa naissance.
//   2. #283-T1 : la grille des mois s'empile sous 1024 px (et reste 2
//              colonnes au-dessus), sans scroll horizontal.
//   3. #344  : carte Légende fusionnée EN TÊTE du Calendrier scolaire.
//   4. #306  : libellés « Créer » en création dans les 4 sections de
//              l'assemblage + save EXPLICITE du Trimestre (modifier un champ
//              sans cliquer ne persiste rien).
//
// Setup : mode démo (activerModeDemo — données réalistes, aucune donnée
// utilisateur réelle en CI) ; sections montrées par les classes .active
// (même mécanique que navigation.js) pour ne pas dépendre du tour guidé.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

async function ouvrirAppEnDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
}

async function montrerSousSection(page, sectionId, sousSectionId, renduFn) {
    await page.evaluate(({ sectionId, sousSectionId, renduFn }) => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById(sectionId)?.classList.add('active');
        document.getElementById(sousSectionId)?.classList.add('active');
        if (renduFn && typeof window[renduFn] === 'function') window[renduFn]();
    }, { sectionId, sousSectionId, renduFn });
    await page.waitForTimeout(700);
}

const mesureOverflow = (page) => page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth
}));

test.describe('portes terrain vague 3 (WebKit)', () => {
    test('#344 + #283-T1 · Calendrier scolaire : légende en tête, mois 2 col. à 1470px / 1 col. à 900px, zéro overflow', async ({ page }) => {
        const erreurs = [];
        attacherCaptureErreurs(page, erreurs);
        await page.setViewportSize({ width: 1470, height: 956 });
        await ouvrirAppEnDemo(page);
        await montrerSousSection(page, 'section-calendrier', 'calendrier-vue', 'afficherCalendrierScolaire');

        const etat = await page.evaluate(() => {
            const fusion = document.querySelector('.calendrier-legende-fusion');
            const grille = document.querySelector('.cal-grid-2col');
            return {
                fusion: !!fusion,
                grille: !!grille,
                legendeEnTete: !!(fusion && grille) &&
                    fusion.getBoundingClientRect().top < grille.getBoundingClientRect().top,
                colonnesMois: grille ? getComputedStyle(grille).gridTemplateColumns.split(' ').length : 0
            };
        });
        expect(etat.fusion, 'carte Légende fusionnée absente (#344)').toBe(true);
        expect(etat.legendeEnTete, 'la Légende doit précéder la grille des mois (#344)').toBe(true);
        expect(etat.colonnesMois, '2 colonnes de mois attendues à 1470px').toBe(2);

        let ov = await mesureOverflow(page);
        expect(ov.scrollW, `overflow horizontal à 1470px (scrollW=${ov.scrollW})`).toBeLessThanOrEqual(ov.clientW);

        // #283-T1 : sous 1024px, les mois s'empilent — sans scroll horizontal
        await page.setViewportSize({ width: 900, height: 800 });
        await page.waitForTimeout(400);
        const colonnes900 = await page.evaluate(() => {
            const g = document.querySelector('.cal-grid-2col');
            return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0;
        });
        expect(colonnes900, 'les mois doivent s\'empiler en 1 colonne sous 1024px (#283-T1)').toBe(1);
        ov = await mesureOverflow(page);
        expect(ov.scrollW, `overflow horizontal à 900px (scrollW=${ov.scrollW})`).toBeLessThanOrEqual(ov.clientW);

        expect(erreurs).toEqual([]);
    });

    test('#118 · Trimestre : aucun overflow horizontal avec le formulaire d\'événement OUVERT (le bug était Safari-only)', async ({ page }) => {
        const erreurs = [];
        attacherCaptureErreurs(page, erreurs);
        await page.setViewportSize({ width: 1470, height: 956 });
        await ouvrirAppEnDemo(page);
        await montrerSousSection(page, 'section-calendrier', 'calendrier-trimestre', null);

        // Reproduire le déclencheur du rapport #118 : accordéons ouverts +
        // formulaire interne d'événement visible (grids 1fr 1fr d'inputs date).
        await page.evaluate(() => {
            document.querySelectorAll('#calendrier-trimestre .accordeon-contenu')
                .forEach(a => { a.style.display = 'block'; });
            document.getElementById('v2-formEvenementPrevu')?.classList.remove('u-hide');
        });
        await page.waitForTimeout(400);

        let ov = await mesureOverflow(page);
        expect(ov.scrollW, `overflow #118 à 1470px (scrollW=${ov.scrollW}/${ov.clientW})`).toBeLessThanOrEqual(ov.clientW);

        // iPad portrait — le rapport signalait un « impact iPad probablement amplifié »
        await page.setViewportSize({ width: 820, height: 1180 });
        await page.waitForTimeout(400);
        ov = await mesureOverflow(page);
        expect(ov.scrollW, `overflow #118 à 820px (scrollW=${ov.scrollW}/${ov.clientW})`).toBeLessThanOrEqual(ov.clientW);

        expect(erreurs).toEqual([]);
    });

    test('#306 ↻ lot E2 · assemblage : « Créer » en création (4 sections) ; le Trimestre s\'enregistre au changement', async ({ page }) => {
        const erreurs = [];
        attacherCaptureErreurs(page, erreurs);
        await page.setViewportSize({ width: 1470, height: 956 });
        await ouvrirAppEnDemo(page);
        await montrerSousSection(page, 'section-calendrier', 'calendrier-trimestre', null);

        const libelles = await page.evaluate(() => {
            const lire = (id) => document.getElementById(id)?.textContent?.trim();
            window.nouveauCoursV2?.();
            window.nouveauHoraireV2?.();
            window.nouveauProfilEnseignantV2?.();
            window.nouveauGroupeCoursV2?.();
            return {
                cours: lire('v2-btnCreerCours'),             // lot E2 : « Créer le cours »
                horaire: lire('v2-btnCreerHoraire'),          // lot E2 : « Créer l'horaire »
                enseignant: lire('v2-btnCreerEnseignant'),   // lot E2 : « Créer le profil »
                groupeCours: lire('v2-btnCreerGroupeCours')   // lot E2 : « Créer le groupe-cours »
            };
        });
        expect(libelles).toEqual({ cours: 'Créer le cours', horaire: 'Créer l\'horaire', enseignant: 'Créer le profil', groupeCours: 'Créer le groupe-cours' });

        // ↻ Lot E2 (28 sept. 2026, D3) : la décision #306 (« save explicite ») est renversée —
        // un trimestre existant s'enregistre champ par champ. Modifier une borne, sans autre
        // geste, l'écrit.
        const saveExplicite = await page.evaluate(() => {
            const avant = JSON.stringify(window.db.getSync(window.cle('cadreCalendrier'), null));
            const champ = document.getElementById('v2-debutTrimestre');
            if (!champ) return 'champ absent';
            champ.value = '2031-01-01';
            champ.dispatchEvent(new Event('change', { bubbles: true }));
            const apres = JSON.stringify(window.db.getSync(window.cle('cadreCalendrier'), null));
            return avant === apres ? 'rien-sans-clic' : 'persiste-sans-clic';
        });
        expect(saveExplicite).toBe('persiste-sans-clic');

        expect(erreurs).toEqual([]);
    });
});
