import { test, expect } from '@playwright/test';
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, enDemo, releve, ecarts, horsDeLaDemo, DE_LA_DEMO,
    peuplerUnTrimestreReel, faireLaModelisation, sansInsecable
} from './harness/deux-temps-de-banc.js';

// =======================================================================
// LE TROISIÈME GROUPE DE LA DÉMO, EN « PAR STANDARDS » (22 NOVEMBRE 2026)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-2026-11-22-demo-par-standards-suite.md` (voie B). Rapport :
// `plans de travail/RAPPORT-2026-11-22-demo-par-standards-suite.md`. Aux deux orientations de l'iPad (1180 × 820 et
// 820 × 1180), dans l'application réelle :
//   A · la démo s'ouvre avec le premier et le troisième groupe ; la Modélisation de « Mettre ta classe en place » se
//       joue de bout en bout (ses détecteurs ne prennent pas le troisième groupe pour le sien), et l'en-tête offre alors
//       les trois groupes ;
//   B · la fiche de la pratique dit les cinq cibles, leurs poids, les quatre critères et lesquels sont essentiels ; le
//       tableau des cibles du troisième groupe montre les cinq cibles, la note des neuf, « En attente » pour Marmotte
//       Pétillante ; l'histoire, posée par l'écrivain réel des inscriptions, donne « Acquis » (3), garde « Ça y est
//       presque » (2) à l'historique et fait la note 69 ; à la sortie, aucune clé hors de la démo ne change ;
//       « Remettre la démo à neuf » rend l'état de départ.
// Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) : WebKit n'y existe pas, Safari reste dû au Mac.

const ORIENTATIONS = [[1180, 820], [820, 1180]];
// A joue la Modélisation entière par le banc partagé (`faireLaModelisation`). À 1180 × 820, ce banc rougit DÉJÀ sur la
// base (d0dd74205), à l'étape 1, avant tout ce que ce lot touche : « une flèche va de la bulle à #v2-btnCreerCours »,
// pointes à 527, 446 et 411 px (deux-temps-modeles-2026-11-13, B · 1180 × 820, mesuré sous Chromium le 22 nov. 2026).
// A se joue donc à la taille propre du banc de la Modélisation (1180 × 900, deux-temps-modelisation-2026-11-12) et en
// portrait (820 × 1180), où il passe sur la base.
const TAILLES_A = [[1180, 900], [820, 1180]];
const CIBLES = [['La lecture stratégique', 'Poids 25 · 25 %'], ['La lecture analytique', 'Poids 30 · 30 %'], ['Le plan', 'Poids 10 · 10 %'],
    ['La rédaction', 'Poids 25 · 25 %'], ['La révision', 'Poids 10 · 10 %']];
const NOTES_DES_NEUF = [['Girafe Lumineuse', '78 %'], ['Panthère Cordiale', '95 %'], ['Tortue Prévenante', '55 %'], ['Chouette Charmante', '65 %'],
    ['Kangourou Taquin', '43 %'], ['Colibri Radieux', '71 %'], ['Tigre Patient', '66 %'], ['Zèbre Gentil', '81 %'], ['Écureuil Joueur', '54 %']];
const MARMOTTE = '9700001';

const groupesDeLEntete = (page) => page.evaluate(() => [...document.querySelectorAll('#selectGroupeCoursHeader optgroup[label="Groupe-cours"] option')]
    .map((o) => [o.value, (o.getAttribute('data-principal') || '').replace(/ /g, ' ')]));
const rangee = (page, nom) => page.locator('.tc-tableau tbody tr', { has: page.locator('.tn-eleve', { hasText: nom }) });
const caseDe = (page, da, cible) => page.locator(`.tc-tableau [data-tc="case"][data-da="${da}"][data-cible="${cible}"]`);
const texte = async (loc) => sansInsecable((await loc.textContent()) || '');

async function entrerDansLaDemo(page) {
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => enDemo(page)).toBe(true);
}

async function ouvrirLeTableauDuTroisiemeGroupe(page) {
    await page.selectOption('#selectGroupeCoursHeader', 'GC_DEMO_STD');
    await expect.poll(() => page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).id)).toBe('GC_DEMO_STD');
    await page.evaluate(() => naviguerVers('evaluations', 'tableau'));
    await expect(page.locator('.tc-tableau')).toBeVisible();
}

for (const [L, H] of TAILLES_A) {
    test(`A · ${L} × ${H} : la démo s'ouvre avec le premier et le troisième groupe ; après la Modélisation, l'en-tête en offre trois`, async ({ page }) => {
        test.setTimeout(300000);
        page.setDefaultTimeout(20000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirEspaceVide(page, L, H);
        await entrerDansLaDemo(page);
        expect(await groupesDeLEntete(page)).toEqual([['GC_DEMO', '601-101 · gr. 0demo'], ['GC_DEMO_STD', '601-998-DM · gr. 00003']]);
        expect(await page.evaluate(() => ParcoursClasse.deuxiemeGroupe()), 'le troisième groupe n\'est pas le deuxième').toBe(null);
        expect(await page.evaluate(() => db.getSync('groupeCoursActif', null).id), 'la démo ouvre sur le premier groupe').toBe('GC_DEMO');
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);

        // La Modélisation de « Mettre ta classe en place », de bout en bout (le banc partagé juge chaque étape).
        await ouvrirPanneau(page);
        await boutonModele(page, 'classe').click();
        await faireLaModelisation(page);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Voir le parcours 3', 'Terminer']);   // ↻ 23 nov. 2026, à la réunion des lots : « Voir le parcours N » (20 nov.), le mot que ce banc lisait sur `main` était « Voir le parcours suivant »
        await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await enDemo(page)).toBe(true);
        const trois = await groupesDeLEntete(page);
        expect(trois.map(([id]) => id).slice(0, 2)).toEqual(['GC_DEMO', 'GC_DEMO_STD']);
        expect(trois).toHaveLength(3);
        expect(trois[2][1]).toBe('601-999-DM · gr. 00002');
        expect(await page.evaluate(() => ParcoursClasse.deuxiemeGroupe().id), 'le deuxième groupe est celui que la personne a monté').toBe(trois[2][0]);
        expect(erreurs).toEqual([]);
    });
}

for (const [L, H] of ORIENTATIONS) {
    test(`B · ${L} × ${H} : la fiche et le tableau des cibles du troisième groupe ; l'histoire posée ; le confinement ; la remise à neuf`, async ({ page }) => {
        test.setTimeout(300000);
        page.setDefaultTimeout(20000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        const avant = await releve(page);
        const duPack = Object.fromEntries(Object.entries(avant).filter(([k]) => DE_LA_DEMO.test(k)));
        await entrerDansLaDemo(page);

        // La fiche de la pratique : les cinq cibles, leurs poids, les critères et leur caractère essentiel.
        await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
        await page.evaluate(() => chargerPratiquePourModif('demo-cib-litt'));
        const fiche = page.locator('#mat-cibles-fiche .cibles-fiche-cible');
        await expect(fiche).toHaveCount(5);
        for (const [k, [etiquette, poids]] of CIBLES.entries()) {
            expect(await texte(fiche.nth(k).locator('.cibles-fiche-etiquette'))).toBe(etiquette);
            expect(await texte(fiche.nth(k).locator('.cibles-fiche-poids'))).toBe(poids);
        }
        const criteres = fiche.nth(0).locator('.cibles-fiche-criteres li');
        await expect(criteres).toHaveCount(4);
        expect(await Promise.all([0, 1, 2, 3].map((k) => texte(criteres.nth(k))))).toEqual(
            ['Structure critère essentiel', 'Rigueur critère essentiel', 'Plausibilité critère essentiel', 'Nuance']);
        for (const k of [1, 2, 3, 4]) await expect(fiche.nth(k).locator('.cibles-fiche-sans-critere')).toHaveText('Aucun critère.');

        // Le tableau des cibles : cinq colonnes, dix rangées, la note des neuf, « En attente » pour Marmotte Pétillante.
        await ouvrirLeTableauDuTroisiemeGroupe(page);
        expect(await page.locator('.tc-tableau thead .tc-col-cible .tn-production-titre').allTextContents()).toEqual(CIBLES.map(([e]) => e));
        await expect(page.locator('.tc-tableau tbody tr')).toHaveCount(10);
        for (const [nom, note] of NOTES_DES_NEUF) {
            expect(await texte(rangee(page, nom).locator('.tc-note-valeur')), nom).toBe(note);
        }
        const marmotte = rangee(page, 'Marmotte Pétillante');
        expect(await texte(marmotte.locator('.tc-note-etat'))).toBe('En attente');
        expect(await texte(marmotte.locator('.tc-note-detail'))).toBe('La lecture stratégique');
        expect(await texte(caseDe(page, MARMOTTE, 'demo-cible-ls').locator('.tc-case-sans-donnee'))).toBe('Données insuffisantes');

        // Sa case « La lecture stratégique », ouverte : les quatre critères, trois essentiels ; aucune inscription.
        await caseDe(page, MARMOTTE, 'demo-cible-ls').click();
        const fenetre = page.locator('.tc-fenetre');
        await expect(fenetre).toBeVisible();
        expect((await fenetre.locator('.tc-critere .tc-critere-texte').allTextContents()).map(sansInsecable)).toEqual(
            ['Structure critère essentiel', 'Rigueur critère essentiel', 'Plausibilité critère essentiel', 'Nuance']);
        await expect(fenetre.locator('.tc-historique-hote')).toContainText('Aucune inscription pour l’instant.');
        await page.keyboard.press('Escape');
        await expect(fenetre).toHaveCount(0);

        // L'histoire, posée par l'écrivain réel (comme le fera le futur parcours), une saisie après l'autre.
        await page.evaluate(async () => {
            for (const s of PACK_DEMARRAGE.groupeParStandards.histoire.inscriptions) await InscriptionsCibles.inscrire([s]);
            TableauNotation.afficher();
        });
        await expect(caseDe(page, MARMOTTE, 'demo-cible-ls').locator('.tc-case-niveau')).toHaveText('3');
        await expect(caseDe(page, MARMOTTE, 'demo-cible-ls').locator('.tc-case-compte')).toHaveText('3');
        expect(await texte(rangee(page, 'Marmotte Pétillante').locator('.tc-note-valeur'))).toBe('69 %');
        await caseDe(page, MARMOTTE, 'demo-cible-ls').click();
        await expect(fenetre.locator('.tc-retenu-niveau')).toContainText('Acquis');
        const entrees = fenetre.locator('.tc-historique-liste .tc-entree');
        await expect(entrees).toHaveCount(3);
        expect(await texte(entrees.nth(0).locator('.tc-entree-niveau'))).toContain('Acquis');
        await expect(entrees.nth(0).locator('.tc-entree-retenu')).toHaveCount(1);
        expect(await texte(entrees.nth(1).locator('.tc-entree-niveau'))).toContain('Ça y est presque');
        await expect(entrees.nth(1).locator('.tc-entree-retenu')).toHaveCount(0);
        await expect(entrees.nth(2).locator('.tc-entree-niveau--remarque')).toHaveCount(1);
        await expect(entrees.nth(2).locator('.tc-entree-note')).toHaveText('Relève bien les procédés ; son hypothèse ne s\'appuie pas encore sur le texte.');
        expect(await entrees.nth(2).locator('.tc-entree-critere').evaluateAll((l) => l.map((x) => x.className.replace('tc-entree-critere tc-entree-critere--', ''))))
            .toEqual(['oui', 'oui', 'non', 'vide']);
        await page.keyboard.press('Escape');

        // La sortie : aucune clé hors de la démo ne change.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);

        // « Remettre la démo à neuf » rend l'état de départ : l'histoire est partie, Marmotte Pétillante est en attente.
        await ouvrirPanneau(page);
        await page.click('#assistance-demo-neuf');
        await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
        await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
        const neuf = await releve(page);
        expect(ecarts(duPack, neuf, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
        expect(ecarts(avant, neuf, horsDeLaDemo), 'les autres clés identiques').toEqual([]);
        await page.evaluate(() => Assistance.fermerPanneau());
        await entrerDansLaDemo(page);
        await ouvrirLeTableauDuTroisiemeGroupe(page);
        expect(await texte(rangee(page, 'Marmotte Pétillante').locator('.tc-note-etat'))).toBe('En attente');
        expect(erreurs).toEqual([]);
    });
}
