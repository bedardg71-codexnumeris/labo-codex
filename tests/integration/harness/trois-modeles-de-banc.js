// =======================================================================
// LE HARNAIS « TROIS MODÈLES FAITS » (22 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 2 à 4 : les « Je regarde » des
// parcours 7 et 8 se jouent dans la démo, sur le deuxième groupe, APRÈS les modèles des parcours 2, 3 et 4. Ceux-ci sont
// joués ici comme la personne les joue (« Remplir », puis les gestes de la page), sans rien juger : leurs bancs à eux
// (`parcours-je-regarde-2026-11-16`, `je-regarde-evaluer-2026-11-18`, `je-regarde-recevoir-2026-11-17`) jugent chaque
// bulle. Le modèle de « Recevoir » est joué de sa première bulle à « Terminer » : trois copies importées (Loutre
// Enjouée, Tapir Doux, Antilope Vaillante), huit évaluations (les sept de l'exemple et celle de Loutre Enjouée), Tapir
// Doux et Antilope Vaillante sans évaluation.
import { expect } from '@playwright/test';
import { bulle, attendreEtape, contourSur, REMPLIR } from './deux-temps-de-banc.js';
import { actionDeLaListe } from './nous-faisons-evaluer-de-banc.js';
import { faireLesDeuxModeles, voirLeParcoursPuisJeRegarde } from './recevoir-modele-de-banc.js';

const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const etape4 = (page, n) => attendreEtape(page, n, 10);

/** Le modèle de « Recevoir », de sa première bulle à « Terminer » (le geste de chaque étape, rien de plus). */
export async function faireLeModeleDeRecevoir(page, pid) {
    await etape4(page, 1);
    await boutonDeBulle(page, REMPLIR).click();
    await expect.poll(() => page.evaluate(() => travauxImport.obtenirFileDAttente().length)).toBe(3);

    await etape4(page, 2);
    const tapir = await page.evaluate(() => travauxImport.obtenirFileDAttente().findIndex((f) => String(f.etudiantDA) === '9900005'));
    await page.click(`.pipeline-col-originaux .pipeline-fichier-ligne[data-param="${tapir}"]`);
    await expect(page.locator('[data-action="travauxUI.ouvrirPreparationFichier"]')).toHaveAttribute('data-param', String(tapir));
    await page.click('[data-action="travauxUI.ouvrirPreparationFichier"]');

    await etape4(page, 3);
    await page.click('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]');
    await page.click('#prep-btn-appliquer-persp');
    await contourSur(page, '#prep-btn-confirmer');
    await page.click('#prep-btn-confirmer');
    await expect(page.locator('#travaux-preparation-modal')).toBeHidden({ timeout: 45000 });

    await etape4(page, 4);
    await page.selectOption('.pipeline-production-selecteur select', pid);
    await page.click('[data-action="travauxUI.appliquerEtImporter"]');
    await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();

    await etape4(page, 5);
    const menuDeLoutre = '#evaluations-liste select.eval-actions-select:has(option[value^="annoter|"]):has(option[value*="|9900002"])';
    const annoter = (await page.locator(menuDeLoutre).evaluate((s) => [...s.options].map((o) => o.value))).find((v) => v.startsWith('annoter|'));
    await page.locator(menuDeLoutre).selectOption(annoter);

    await etape4(page, 6);
    await page.locator('#travaux-palette-tampons [title="Personnaliser"]').click();
    await page.click('#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]');

    await etape4(page, 7);
    await page.click('#travaux-btn-actions');
    await page.locator('[data-action="travauxUI.basculerMode"]', { hasText: 'Évaluer' }).first().click();

    await etape4(page, 8);
    await choisirLesNiveaux(page, ['M', 'D', 'D', 'D']);

    await etape4(page, 9);
    await page.click('#btnVerrouillerEvaluation');

    await etape4(page, 10);
    await page.selectOption('#travaux-archivage-lea-production', pid);
    await page.selectOption('#travaux-archivage-lea-etudiant', '9900002');
    const onglet = page.waitForEvent('popup');
    await page.click('[data-action="travauxUI.lancerExportLea"]');
    await (await onglet).close();
    await expect(bulle(page)).toContainText('Objectif atteint');
}

/**
 * Les modèles des parcours 2, 3 et 4, joués de bout en bout dans la démo ; le dernier se termine sur sa dernière bulle,
 * par « Terminer » si `terminer` (sinon la bulle reste, avec « Voir le parcours 5 »).
 * @returns {Promise<{pid: string, grilleId: string, cartoucheId: string}>} la production du modèle d'« Évaluer »
 */
export async function faireLesTroisModeles(page, { terminer = true } = {}) {
    const r = await faireLesDeuxModeles(page);
    await voirLeParcoursPuisJeRegarde(page, 4, 'recevoir');
    await faireLeModeleDeRecevoir(page, r.pid);
    if (terminer) {
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
    }
    return r;
}

/**
 * Un niveau par critère, dans l'ordre des menus du formulaire. Le formulaire se pose en plusieurs temps (la grille,
 * l'échelle, la cartouche) et peut redessiner ses menus : chaque choix est repris tant que les menus ne le gardent pas
 * tous (mesuré le 22 nov. 2026 : un premier choix perdu une fois sur deux sous Chromium).
 */
export async function choisirLesNiveaux(page, niveaux) {
    await expect(page.locator('#selectGrille1')).not.toHaveValue('');
    await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(niveaux.length);
    await expect(async () => {
        const ids = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.id));
        for (const [k, niveau] of niveaux.entries()) {
            if ((await page.locator('#' + ids[k]).inputValue()) !== niveau) await page.selectOption('#' + ids[k], niveau);
        }
        // La condition : les choix tiennent encore après deux images (un redessin du formulaire les aurait effacés).
        const lus = await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() =>
            ok([...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.value))))));
        expect(lus).toEqual(niveaux);
    }).toPass({ timeout: 15000 });
}

/** Une évaluation posée par le formulaire, comme la personne la pose : « Actions › Évaluer », un niveau par critère, le cadenas. */
export async function evaluerParLeFormulaire(page, da, pid, niveaux) {
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    await actionDeLaListe(page, 'evaluer|' + da + '|' + pid);
    await choisirLesNiveaux(page, niveaux);
    await page.click('#btnVerrouillerEvaluation');
    await expect.poll(() => page.evaluate(([d, p]) => !!(db.getSync(cle('evaluationsSauvegardees'), []) || [])
        .find((e) => e.productionId === p && e.etudiantDA === d && !e.remplaceeParId && e.verrouillee), [da, pid])).toBe(true);
}
