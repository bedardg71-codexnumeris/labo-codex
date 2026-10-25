import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1153 (24 oct. 2026) — « + NOUVELLE CARTOUCHE » RENOMMAIT LA CARTOUCHE OUVERTE ; CHANGER LA
// GRILLE D'UNE CARTOUCHE LA DÉDOUBLAIT. Source probable du mécanisme (1) de #1144.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-cartouche-nouvelle-renomme.md.
//
// La cause : `initialiserNouveauCartoucheAvecEchelle` reprenait `cartoucheActuel?.id` et ses
// commentaires, et `creerNouvelleCartouche` ne remettait pas `cartoucheActuel` à zéro.
//   (a) même grille  : la fiche « neuve » portait l'id de l'ouverte — son nom la renommait ;
//   (a) autre grille : l'id de l'ouverte s'écrivait sous la clé de l'autre grille ;
//   (b) changer la grille d'une cartouche enregistrée : l'id passait à l'autre grille.
// Ce qui est attendu : (a) une cartouche neuve, matrice vide ; (b) une COPIE pour la grille
// choisie (id neuf, commentaires rattachés par id puis par nom), l'originale intacte.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

const MOTS_COPIE = 'Changer de grille crée une copie de cette cartouche pour la grille choisie. '
    + 'L\'originale reste telle quelle. Les commentaires des critères communs passent dans la copie. Continuer ?';

async function ouvrir(page) {
    const erreurs = [];
    const dialogues = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', async (d) => { dialogues.push(d.message()); await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    return { erreurs, dialogues };
}

/**
 * Deux grilles, une échelle, une cartouche sous A, une production qui la porte.
 * B partage avec A un critère par l'id (Structure) et un par le nom seulement (Langue).
 */
async function semer(page, { homonymeSousB = false } = {}) {
    await page.evaluate(async (homonymeSousB) => {
        const c = window.cle;
        const IDME = [
            { code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 32 },
            { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 70 },
            { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92 }
        ];
        const commentaires = {};
        ['CR_NR_A1', 'CR_NR_A2'].forEach(cr => IDME.forEach(n => { commentaires[cr + '_' + n.code] = `Texte ${n.code} de ${cr}`; }));
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('grillesTemplates'), [
            { id: 'GRILLE_NR_A', nom: 'Grille fictive A', type: 'holistique', dansBibliotheque: true,
              criteres: [{ id: 'CR_NR_A1', nom: 'Structure', ponderation: 50 }, { id: 'CR_NR_A2', nom: 'Langue', ponderation: 50 }] },
            { id: 'GRILLE_NR_B', nom: 'Grille fictive B', type: 'holistique', dansBibliotheque: true,
              criteres: [{ id: 'CR_NR_A1', nom: 'Structure', ponderation: 40 }, { id: 'CR_NR_B9', nom: 'Langue', ponderation: 30 },
                  { id: 'CR_NR_B3', nom: 'Style', ponderation: 30 }] }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('echellesTemplates'), [{ id: 'ECH_NR', nom: 'Échelle fictive', niveaux: IDME, dansBibliotheque: true }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('cartouches_GRILLE_NR_A'), [{ id: 'CART_NR', nom: 'Cartouche témoin', grilleId: 'GRILLE_NR_A',
            echelleId: 'ECH_NR', contexte: 'Contexte témoin', dansBibliotheque: true,
            criteres: [{ id: 'CR_NR_A1', nom: 'Structure' }, { id: 'CR_NR_A2', nom: 'Langue' }],
            niveaux: IDME.map(n => ({ code: n.code, nom: n.nom })), commentaires }]);
        if (homonymeSousB) {
            // security-ok: jeu d'essai littéral d'un test, aucune source externe.
            await db.set(c('cartouches_GRILLE_NR_B'), [{ id: 'CART_NR_HOMONYME', nom: 'Cartouche témoin', grilleId: 'GRILLE_NR_B',
                echelleId: 'ECH_NR', contexte: '', dansBibliotheque: true,
                criteres: [{ id: 'CR_NR_A1', nom: 'Structure' }], niveaux: IDME.map(n => ({ code: n.code, nom: n.nom })),
                commentaires: { CR_NR_A1_M: 'Texte de l\'homonyme' } }]);
        }
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('productions'), [{ id: 'PROD_NR', titre: 'Analyse fictive', type: 'travail', ponderation: 40,
            dansBibliotheque: true, grilleId: 'GRILLE_NR_A', echelleId: 'ECH_NR', cartoucheId: 'CART_NR' }]);
    }, homonymeSousB);
}

async function ouvrirLaCartouche(page) {
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 400);
    await page.evaluate(async () => { await chargerCartouchePourModif('CART_NR', 'GRILLE_NR_A'); });
    await pause(page, 500);
}

/** Toutes les clés `cartouches_*` lues en base, telles quelles (JSON) — pour l'octet près. */
const lireCartouches = (page) => page.evaluate(async () => {
    const sortie = {};
    for (const k of db.keysSync().filter(k => /cartouches_GRILLE_NR_/.test(k)).sort()) {
        sortie[k.replace(/^.*cartouches_/, '')] = await db.get(k);
    }
    return sortie;
});

const textesMatrice = (page) => page.evaluate(() => {
    const matrice = document.getElementById('matriceRetroaction');
    return { visible: !!matrice && !matrice.classList.contains('u-hide'),
        textes: [...document.querySelectorAll('#matriceRetroaction textarea[id^="comm_"]')].map(t => t.value) };
});

const productionEnBase = (page) => page.evaluate(async () => JSON.stringify(await db.get(cle('productions'))));

/** Le geste « + Nouvelle cartouche », grille et échelle choisies, un nom, puis « Créer la cartouche ». */
async function creerApresOuverte(page, grilleId) {
    await page.locator('button[data-action="creerNouvelleCartouche"]').click();
    await pause(page, 500);
    await page.locator('#selectGrilleCartouche').selectOption(grilleId);
    await pause(page, 400);
    await page.locator('#selectEchelleCartouche').selectOption('ECH_NR');
    await pause(page, 500);
    const matrice = await textesMatrice(page);
    await page.locator('#nomCartouche').fill('Cartouche neuve');
    await page.locator('#nomCartouche').press('Tab');
    await pause(page, 400);
    await page.locator('#btnCreerCartouche').click();
    await pause(page, 900);
    return matrice;
}

test('(a) même grille : « + Nouvelle cartouche » après une cartouche ouverte crée une cartouche neuve, matrice vide ; l\'ouverte garde son nom', async ({ page }) => {
    test.setTimeout(60000);
    const { erreurs } = await ouvrir(page);
    await semer(page);
    await ouvrirLaCartouche(page);
    const avant = await lireCartouches(page);

    const matrice = await creerApresOuverte(page, 'GRILLE_NR_A');
    expect.soft(matrice.visible, 'la matrice s\'ouvre').toBe(true);
    expect.soft(matrice.textes.length, 'la matrice a ses cases').toBe(8);
    expect.soft(matrice.textes.filter(Boolean), 'la matrice neuve est vide').toEqual([]);

    const apres = await lireCartouches(page);
    const sousA = apres.GRILLE_NR_A || [];
    expect.soft(JSON.stringify(sousA.find(c => c.id === 'CART_NR')), 'l\'ouverte, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A[0]));
    const neuves = sousA.filter(c => c.id !== 'CART_NR');
    expect.soft(neuves.map(c => c.nom), 'une cartouche neuve, à son nom').toEqual(['Cartouche neuve']);
    expect.soft(Object.values((neuves[0] || {}).commentaires || { x: 'absente' }).filter(Boolean), 'aucun commentaire repris').toEqual([]);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('(a) autre grille : « + Nouvelle cartouche » puis une autre grille n\'écrit pas l\'id de l\'ouverte sous la clé de l\'autre grille', async ({ page }) => {
    test.setTimeout(60000);
    const { erreurs, dialogues } = await ouvrir(page);
    await semer(page);
    await ouvrirLaCartouche(page);
    const avant = await lireCartouches(page);

    const matrice = await creerApresOuverte(page, 'GRILLE_NR_B');
    expect.soft(dialogues, 'une création ne demande pas de « changer de grille »').toEqual([]);
    expect.soft(matrice.textes.length, 'la matrice a les cases de B').toBe(12);
    expect.soft(matrice.textes.filter(Boolean), 'la matrice neuve est vide').toEqual([]);

    const apres = await lireCartouches(page);
    expect.soft(JSON.stringify(apres.GRILLE_NR_A), 'la clé de A, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A));
    const sousB = apres.GRILLE_NR_B || [];
    expect.soft(sousB.map(c => c.id).filter(id => id === 'CART_NR'), 'l\'id de l\'ouverte ne passe pas sous B').toEqual([]);
    expect.soft(sousB.map(c => c.nom), 'une cartouche neuve sous B').toEqual(['Cartouche neuve']);
    expect.soft(Object.keys((sousB[0] || {}).commentaires || { x: 1 }).filter(k => (sousB[0].commentaires[k] || '').trim()), 'aucun commentaire repris').toEqual([]);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('(b) changer la grille d\'une cartouche enregistrée en fait une copie pour la grille choisie ; l\'originale reste intacte', async ({ page }) => {
    test.setTimeout(60000);
    const { erreurs, dialogues } = await ouvrir(page);
    await semer(page);
    await ouvrirLaCartouche(page);
    const avant = await lireCartouches(page);
    const productionAvant = await productionEnBase(page);
    const original = avant.GRILLE_NR_A[0];

    await page.locator('#selectGrilleCartouche').selectOption('GRILLE_NR_B');
    await pause(page, 900);
    expect.soft(dialogues, 'la question dit la copie').toEqual([MOTS_COPIE]);

    let apres = await lireCartouches(page);
    expect.soft(JSON.stringify(apres.GRILLE_NR_A), 'l\'originale, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A));
    const sousB = apres.GRILLE_NR_B || [];
    expect.soft(sousB.length, 'une copie sous B').toBe(1);
    const copie = sousB[0] || { commentaires: {} };
    expect.soft(copie.id, 'un id neuf').not.toBe('CART_NR');
    expect.soft(copie.id || '', 'un id de cartouche').toMatch(/^CART_/);
    expect.soft(copie.grilleId).toBe('GRILLE_NR_B');
    expect.soft(copie.nom, 'le nom de l\'originale').toBe('Cartouche témoin');
    expect.soft(copie.contexte).toBe('Contexte témoin');
    // Structure : même id ; Langue : par le nom (CR_NR_A2 → CR_NR_B9). Rien de jeté.
    ['I', 'D', 'M', 'E'].forEach(n => {
        expect.soft(copie.commentaires['CR_NR_A1_' + n], 'Structure ' + n).toBe(original.commentaires['CR_NR_A1_' + n]);
        expect.soft(copie.commentaires['CR_NR_B9_' + n], 'Langue ' + n + ', par le nom').toBe(original.commentaires['CR_NR_A2_' + n]);
    });
    expect.soft((copie.criteres || []).map(c => c.id), 'les critères de la copie : ceux de B, dans son ordre').toEqual(['CR_NR_A1', 'CR_NR_B9', 'CR_NR_B3']);

    // La fiche ouverte est la copie, et le menu la montre ; la chaîne suit B.
    const fiche = await page.evaluate(() => ({ id: window.cartoucheActuel && window.cartoucheActuel.id,
        menu: document.getElementById('menuCartouches').value,
        grille: document.getElementById('selectGrilleCartouche').value,
        chaineGrille: (document.querySelector('#chaineCartouche [data-etape="grille"] .bc-info') || {}).textContent }));
    expect.soft(fiche.id, 'la fiche ouverte est la copie').toBe(copie.id);
    expect.soft(fiche.menu, 'le menu montre la copie').toBe(copie.id);
    expect.soft(fiche.grille).toBe('GRILLE_NR_B');
    expect.soft(fiche.chaineGrille, 'la chaîne lit B').toBe('3 critères');

    // La copie vit : une frappe dans sa matrice s'écrit chez elle, pas chez l'originale.
    const caseStyle = page.locator('#comm_CR_NR_B3_M');
    await caseStyle.fill('Un texte pour le style.');
    await caseStyle.press('Tab');
    await pause(page, 500);
    apres = await lireCartouches(page);
    expect.soft(((apres.GRILLE_NR_B || [])[0] || { commentaires: {} }).commentaires.CR_NR_B3_M, 'la frappe atteint la copie').toBe('Un texte pour le style.');
    expect.soft(JSON.stringify(apres.GRILLE_NR_A), 'l\'originale, toujours à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A));
    expect.soft(await productionEnBase(page), 'la production garde l\'originale').toBe(productionAvant);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('(b) la copie ne déclenche aucun écrasement quand une cartouche du même nom vit déjà sous la grille choisie', async ({ page }) => {
    test.setTimeout(60000);
    const { erreurs, dialogues } = await ouvrir(page);
    await semer(page, { homonymeSousB: true });
    await ouvrirLaCartouche(page);
    const avant = await lireCartouches(page);

    await page.locator('#selectGrilleCartouche').selectOption('GRILLE_NR_B');
    await pause(page, 900);
    expect.soft(dialogues, 'une seule question : la copie').toEqual([MOTS_COPIE]);

    const apres = await lireCartouches(page);
    expect.soft(JSON.stringify(apres.GRILLE_NR_A), 'l\'originale, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A));
    const sousB = apres.GRILLE_NR_B || [];
    expect.soft(JSON.stringify(sousB.find(c => c.id === 'CART_NR_HOMONYME')), 'l\'homonyme de B, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_B[0]));
    const copies = sousB.filter(c => c.id !== 'CART_NR_HOMONYME');
    expect.soft(copies.length, 'la copie s\'ajoute').toBe(1);
    expect.soft((copies[0] || {}).id, 'un id neuf').not.toBe('CART_NR');
    expect.soft((copies[0] || {}).nom, 'un nom qui ne double pas l\'homonyme').not.toBe('Cartouche témoin');
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('une cartouche EN CRÉATION change simplement de grille : la question d\'avant, rien d\'écrit, puis « Créer » l\'écrit sous la seule grille choisie', async ({ page }) => {
    test.setTimeout(60000);
    const { erreurs, dialogues } = await ouvrir(page);
    await semer(page);
    await ouvrirLaCartouche(page);
    const avant = await lireCartouches(page);

    await page.locator('button[data-action="creerNouvelleCartouche"]').click();
    await pause(page, 500);
    await page.locator('#selectGrilleCartouche').selectOption('GRILLE_NR_A');
    await pause(page, 300);
    await page.locator('#selectEchelleCartouche').selectOption('ECH_NR');
    await pause(page, 500);
    await page.locator('#comm_CR_NR_A1_M').fill('Écrit en création');
    await page.locator('#comm_CR_NR_A1_M').press('Tab');
    await pause(page, 300);
    const idEnCreation = await page.evaluate(() => window.cartoucheActuel.id);

    await page.locator('#selectGrilleCartouche').selectOption('GRILLE_NR_B');
    await pause(page, 700);
    expect.soft(dialogues, 'la question d\'une création').toEqual(['Changer de grille va reconfigurer la matrice.\nLes commentaires des critères communs seront conservés.\n\nContinuer ?']);
    expect.soft(await lireCartouches(page), 'rien d\'écrit').toEqual(avant);
    const fiche = await page.evaluate(() => ({ id: window.cartoucheActuel.id, grilleId: window.cartoucheActuel.grilleId,
        structure: (document.getElementById('comm_CR_NR_A1_M') || {}).value, style: !!document.getElementById('comm_CR_NR_B3_M') }));
    expect.soft(fiche, 'la même fiche, sur B, le commentaire du critère commun gardé').toEqual({ id: idEnCreation, grilleId: 'GRILLE_NR_B', structure: 'Écrit en création', style: true });

    await page.locator('#nomCartouche').fill('Cartouche en création');
    await page.locator('#btnCreerCartouche').click();
    await pause(page, 900);
    const apres = await lireCartouches(page);
    expect.soft(JSON.stringify(apres.GRILLE_NR_A), 'la clé de A, à l\'octet près').toBe(JSON.stringify(avant.GRILLE_NR_A));
    expect.soft((apres.GRILLE_NR_B || []).map(c => [c.id, c.nom]), 'écrite sous B seulement').toEqual([[idEnCreation, 'Cartouche en création']]);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});
