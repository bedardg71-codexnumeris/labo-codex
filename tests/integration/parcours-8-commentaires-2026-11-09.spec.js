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
    // L'avertissement d'une grille qui ne totalise pas 100 % reste jusqu'à « OK » : il couvre le menu.
    const ok = page.locator('.notification-warning button', { hasText: 'OK' });
    if (await ok.count()) await ok.first().click().catch(() => {});
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

/** Le contour doit être posé SUR l'élément attendu (la sonde du moteur passe toutes les 120 ms). */
async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 5000 }).toBe('posé');
}

/** La bulle ne couvre pas le contour (là où il faut toucher). */
async function bulleNeCouvrePasLeContour(page) {
    await expect.poll(() => page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        if (!c || c.hidden) return false;
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }), { message: 'la bulle ne couvre pas le contour', timeout: 3000 }).toBe(false);
}

const boutonBulle = (page, libelle) => bulle(page).locator('.parcours-bulle-boutons button', { hasText: libelle });

/** Le fichier de banc : WebKit et Chromium refusent un Blob en IndexedDB éphémère ; l'image d'un pixel de #868. */
async function poserFichierImporte(page, { da = '1111111', productionId = 'P_P8_2', id = 'FT_P8_1' } = {}) {
    await page.evaluate(({ T, da, productionId, id, png }) => {
        // security-ok: fixture littérale du banc ; l'import lui-même est le quatrième parcours.
        const liste = window.db.getSync(T + '_fichiersTravaux', []) || [];
        liste.push({ id, etudiantDA: da, productionId, coursId: 'cours-p8', groupeCoursId: 'GC_P8',
            nomFichier: 'FICTIF_' + da + '_Redaction2.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-10T12:00:00.000Z', dateModification: '2026-11-10T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present' });
        window.db.setSync(T + '_fichiersTravaux', liste);
        // Une page blanche de taille réelle (la recette du banc d'annotation) : on y pose des codes.
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 400, 600);
        const octets = Uint8Array.from(atob(cv.toDataURL('image/png').split(',')[1]), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (fid) { return fid === id ? copie : original.apply(this, arguments); };
    }, { T, da, productionId, id });
}

/** Les étapes 1 à 6 sur une grille NEUVE : le critère algorithmique réglé dans son atelier, deux codes. */
async function reglerUneGrilleNeuve(page, { captures = '' } = {}) {
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await expect(rang(page)).toHaveText('1 sur 11');
    await contourSur(page, '#conception-grille-criteres .rangee-selection');
    if (captures) await capture(page, captures + '-01');
    await page.click('#conception-grille-criteres [data-action="creerNouvelleGrille"]');
    await contourSur(page, '#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]');
    await page.fill('#listeCriteres input[data-champ="nom"]', 'Unités');
    await page.locator('#listeCriteres input[data-champ="nom"]').blur();
    await page.selectOption('#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]', 'algorithmique');

    await attendreTitre(page, 'Ce que tu comptes');
    await expect(rang(page)).toHaveText('2 sur 11');
    await expect(page.locator('#listeCriteres .atelier-algo-etape[data-etape="compte"]')).toHaveAttribute('data-ouverte', '');
    if (captures) await capture(page, captures + '-02');
    const nom = (paire, forme) => `#listeCriteres .noms-algo input[data-nom-paire="${paire}"][data-nom-forme="${forme}"]`;
    for (const [paire, forme, valeur] of [['erreurs', 'singulier', 'unité manquante'], ['erreurs', 'pluriel', 'unités manquantes'],
        ['mots', 'singulier', 'calcul'], ['mots', 'pluriel', 'calculs']]) {
        await page.fill(nom(paire, forme), valeur);
        await page.locator(nom(paire, forme)).dispatchEvent('change');
    }

    await attendreTitre(page, 'Tes codes');
    await expect(rang(page)).toHaveText('3 sur 11');
    // « Continuer » ne paraît qu'une fois qu'un code pèse plus de 0.
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    if (captures) await capture(page, captures + '-03');
    for (let k = 0; k < 2; k++) {
        await page.locator('#listeCriteres .atelier-algo-etape[data-etape="codes"] [data-action="ajouterSousCritere"]').first().click();
    }
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Ta note');
    await expect(rang(page)).toHaveText('4 sur 11');
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await contourSur(page, '#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]');
    if (captures) await capture(page, captures + '-04');
    await page.fill('#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]', '20');
    await page.locator('#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]').dispatchEvent('change');
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Tes cas');
    await expect(rang(page)).toHaveText('5 sur 11');
    await contourSur(page, '#listeCriteres .table-cas-fixer');
    // Sans limite, l'étape est réglée : « Continuer » est toujours là.
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    if (captures) await capture(page, captures + '-05');
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, "Ce que l'étudiant·e lit");
    await expect(rang(page)).toHaveText('6 sur 11');
    // Une grille nouvelle : pas de « Continuer » ; elle avance quand la grille est créée.
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await contourSur(page, '#nomGrilleTemplate');
    if (captures) await capture(page, captures + '-06');
    await page.fill('#nomGrilleTemplate', 'Grille de la rédaction 2');
    await page.locator('#nomGrilleTemplate').dispatchEvent('change');
    await contourSur(page, '#btnCreerGrille');
    await page.click('#btnCreerGrille');
    await page.waitForFunction((T) => (window.db.getSync(T + '_grillesTemplates', []) || []).some((x) => x.nom === 'Grille de la rédaction 2'), T, { timeout: 5000 });
    return await page.evaluate((T) => {
        const g = (window.db.getSync(T + '_grillesTemplates', []) || []).find((x) => x.nom === 'Grille de la rédaction 2');
        return g ? { id: g.id, critereId: (g.criteres.find((c) => c.type === 'algorithmique') || {}).id } : null;
    }, T);
}

test('de bout en bout, avec fichier : une grille neuve, deux codes posés, la rétroaction s’écrit seule ; le verrou mène à la fin', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspace(page, 1180);
    const grille = await reglerUneGrilleNeuve(page);
    expect(grille, 'la grille est créée').not.toBeNull();

    await attendreTitre(page, 'Ta production');
    await expect(rang(page)).toHaveText('7 sur 11');
    await page.selectOption('#menuProductions', 'P_P8_2');
    await contourSur(page, '#productionGrille');
    await page.selectOption('#productionGrille', grille.id);

    await attendreTitre(page, 'Tes productions');
    await expect(rang(page)).toHaveText('8 sur 11');
    await contourSur(page, '#travaux-drop-zone');
    await expect(boutonBulle(page, 'Rien à importer')).toBeVisible();
    await poserFichierImporte(page);

    await attendreTitre(page, 'Poser tes codes');
    await expect(rang(page)).toHaveText('9 sur 11');
    await contourSur(page, '#evaluations-liste tr[data-production-id="P_P8_2"] select.eval-actions-select');
    await page.selectOption('#evaluations-liste tr[data-production-id="P_P8_2"] select.eval-actions-select', 'annoter|FT_P8_1|P_P8_2');
    await expect(page.locator('#travaux-palette-erreurs-fr')).toBeVisible({ timeout: 10000 });
    await contourSur(page, '#travaux-palette-erreurs-fr');
    // Deux codes posés : toucher le code, puis la production.
    const codes = page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item');
    await expect(codes).toHaveCount(2);
    for (let k = 0; k < 2; k++) {
        await codes.nth(k).click();
        const p = await page.evaluate((fx) => {
            const c = document.getElementById('travaux-canvas-annotation');
            const r = c.getBoundingClientRect();
            return { x: r.left + r.width * fx, y: r.top + Math.min(r.height * 0.3, 200) };
        }, 0.3 + 0.3 * k);
        await page.mouse.click(p.x, p.y);
    }
    if (process.env.SONDE_P8) await page.screenshot({ path: process.env.SONDE_P8 + '/sonde-09.png' });
    await expect(page.locator('#travaux-errfr-total-pastille')).toHaveText('2');
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));

    await attendreTitre(page, "Ta rétroaction s'écrit seule");
    await expect(rang(page)).toHaveText('10 sur 11');
    await expect(page.locator('#eval_erreurs_' + grille.critereId)).toHaveValue('2', { timeout: 6000 });
    await contourSur(page, '#eval_mots_' + grille.critereId);
    await page.fill('#eval_mots_' + grille.critereId, '12');
    await page.locator('#eval_mots_' + grille.critereId).dispatchEvent('input');
    await page.locator('#eval_mots_' + grille.critereId).dispatchEvent('change');
    // La rétroaction : le décompte sous le critère, les deux codes dans « Spécifique ».
    const retro = page.locator('#travaux-palette-eval-retro');
    await expect(retro).toBeVisible();
    if (process.env.SONDE_P8) { await page.waitForTimeout(800); await page.screenshot({ path: process.env.SONDE_P8 + '/sonde-10.png' }); }
    // La phrase du compte, sous le critère, dans la « Générale » (une zone de texte) ; la bulle ne couvre pas le contour.
    await expect(page.locator('#retroactionFinale1')).toHaveValue(/Ta production contient 2 unités manquantes pour 12 calculs\./);
    await bulleNeCouvrePasLeContour(page);
    await page.locator('#travaux-palette-eval-retro .retro-vues-radios label', { hasText: 'Spécifique' }).click({ timeout: 4000 });
    const specifique = (await page.locator('#contenuRetroSpecifique').innerText()).replace(/\s+/g, ' ');
    if (process.env.SONDE_P8) console.log('SPECIFIQUE>>', specifique.slice(0, 800));
    expect(specifique).toContain('Code 0');
    expect(specifique).toContain('Code 1');
    await contourSur(page, '#btnVerrouillerEvaluation');
    await page.click('#btnVerrouillerEvaluation');

    await attendreTitre(page, 'Pour aller plus loin');
    await expect(rang(page)).toHaveText('11 sur 11');
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await boutonBulle(page, 'Terminer').click();
    await expect(bulle(page)).toHaveCount(0);
    await ouvrirPanneau(page);
    await expect(item(page)).toHaveAttribute('data-etat', 'fait');
});
