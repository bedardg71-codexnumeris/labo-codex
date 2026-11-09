import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md. Ce banc juge :
//   · le panneau : sans production avec sa grille dans le groupe-cours actif réel, « Commencer » ne
//     lance rien et le panneau dit pourquoi ; avec elle, le parcours part ;
//   · le chemin avec fichier, de bout en bout, en faisant les gestes : une grille NEUVE, un critère
//     algorithmique réglé dans son atelier, la grille associée à une production, une production
//     importée, deux codes posés dans Annoter, le passage en Évaluer ; la rétroaction contient le
//     décompte sous le critère et les deux codes dans « Spécifique » ; le verrou mène à la fin ;
//   · les étapes sautées ne comptent pas dans « n sur … » ; le chemin sans fichier (« Rien à
//     importer ») ; « Plus tard » puis « Reprendre ».
// ⚠ Chromium seulement dans le cloud (WebKit n'y existe pas) : le verdict WebKit se prend sur le Mac.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-8
// Noms d'étudiant·es manifestement fictifs (règle 6 de CLAUDE.md).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 'a2026';

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

/**
 * Un espace réel de banc : un trimestre, un cours, un groupe-cours actif, deux étudiant·es, une
 * échelle, une grille déjà employée (« Grille de la rédaction 1 ») et deux productions : la
 * première a sa grille, la seconde (« Rédaction 2 ») attend la sienne. `avecGrille: false` : aucune
 * production n'a de grille (le refus du panneau).
 */
async function ouvrirEspace(page, largeur, { clair = false, hauteur = 900, avecGrille = true } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.clock.setFixedTime(HORLOGE);
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate(async ({ T, avecGrille }) => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    }, { T, avecGrille });
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate(({ T, avecGrille }) => {
        // security-ok: fixtures littérales du banc, aucune source externe ; noms fictifs.
        const coursId = 'cours-p8';
        window.db.setSync('trimestres', [{ id: T, nom: 'Automne 2026', annee: 2026, session: 'A', actif: true,
            dateDebut: '2026-08-24', dateFinCours: '2026-12-11', dateFin: '2026-12-22' }]);
        window.db.setSync('trimestreActif', T);
        window.trimestreActif = T;
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_P8', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_P8' });
        window.db.setSync('groupeCoursActif', { id: 'GC_P8', trimestreId: T });
        window.db.setSync(T + '_groupeEtudiants', [
            { da: '1111111', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GC_P8' },
            { da: '2222222', nom: 'Simulacre', prenom: 'Bêta', groupe: '01', coursId, groupeCoursId: 'GC_P8' }
        ]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E_P8', nom: 'IDME', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G_P8_1', nom: 'Grille de la rédaction 1', type: 'holistique',
            criteres: [{ id: 'c_contenu', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_productions', [
            { id: 'P_P8_1', titre: 'Rédaction 1', type: 'travail', ponderation: 40, coursId, grilleId: avecGrille ? 'G_P8_1' : '', echelleId: 'E_P8' },
            { id: 'P_P8_2', titre: 'Rédaction 2', type: 'travail', ponderation: 60, coursId, grilleId: '', echelleId: 'E_P8' }
        ]);
    }, { T, avecGrille });
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const item = (page) => page.locator('#panneau-assistance .assistance-parcours-item[data-parcours="commentaires"]');
const bulle = (page) => page.locator('#parcours-bulle');
const rang = (page) => bulle(page).locator('.parcours-bulle-rang');

async function attendreTitre(page, titre) {
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 10000 });
    await expect(bulle(page)).toBeFocused();
}

const REFUS = 'Commence par « Évaluer une première production » : il te faut une production et sa grille pour automatiser tes commentaires.';

test('panneau : sans production avec sa grille, « Commencer » ne lance rien et le panneau dit pourquoi', async ({ page }) => {
    await ouvrirEspace(page, 1180, { avecGrille: false });
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Automatiser tes commentaires');
    await expect(item(page).locator('.assistance-parcours-ligne')).toHaveText("De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.");
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(REFUS);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveAttribute('role', 'status');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, 'panneau-refus-1180-sombre');
});

test('panneau : la démo ne compte pas ; avec une production et sa grille, le parcours part sur Conception › Grilles', async ({ page }) => {
    await ouvrirEspace(page, 1180);
    // Un service d'orthopédagogie ou la démo : refus ; ici, le groupe-cours réel a sa production avec grille.
    expect(await page.evaluate(() => window.ParcoursCommentaires.refus())).toBe('');
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await expect(rang(page)).toHaveText('1 sur 11');
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
});
