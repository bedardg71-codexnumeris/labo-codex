import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #654 — UNE PRODUCTION IMPORTÉE RETROUVE SA CARTOUCHE (26 sept. 2026).
//
// Quand une cartouche importée entre en collision avec une cartouche déjà là (même id,
// contenu différent), l'import garde les deux et donne un id NEUF à l'arrivante. La
// production importée avec elle gardait l'ANCIEN id : elle désignait la cartouche locale
// (import de configuration) ou une cartouche absente de sa grille (Réserve, copie en
// double). Trois chemins écrivent ce cas ; chacun est rejoué ici par son vrai geste.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // Sous file://, une lecture annexe de l'import (fetch) est refusée : sans lien avec le banc.
    /Origin null is not allowed by Access-Control-Allow-Origin/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrir(page, erreurs) {
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);
    await page.evaluate(() => {
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
    });
}

/** Le vrai geste : « Importer » ouvre la modale, le fichier choisi passe par #fichierImport. */
async function choisirFichierImport(page, nom, objet) {
    await page.evaluate(() => window.ouvrirModalImport());
    await page.setInputFiles('#fichierImport', { name: nom, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(objet)) });
    await page.waitForTimeout(600);
}

// Fixtures fictives. La grille est IDENTIQUE des deux côtés (pas de remap de grille) ;
// seule la cartouche diffère : c'est le cas qui fait naître un id neuf.
const GRILLE = { id: 'G654', nom: 'Analyse fictive', type: 'holistique', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 100 }] };
const CART_LOCALE = { id: 'CART654', grilleId: 'G654', nom: 'Cartouche locale', commentaires: { c1_M: 'Texte local.' } };
const CART_ARRIVANTE = { id: 'CART654', grilleId: 'G654', nom: 'Cartouche de l\'archive', commentaires: { c1_M: 'Texte de l\'archive.' } };
const PROD = { id: 'P654', titre: 'Analyse 654', grilleId: 'G654', cartoucheId: 'CART654', type: 'artefact', ponderation: 10 };
const CONFIG = { metadata: { type: 'configuration-complete', nom: 'Banc 654' },
    contenu: { grilles: [GRILLE], cartouches: { G654: [CART_ARRIVANTE] }, productions: [PROD] } };

test('#654 · import de configuration : la production importée désigne la cartouche venue avec elle', async ({ page }) => {
    const erreurs = [];
    await ouvrir(page, erreurs);
    await page.evaluate(({ GRILLE, CART_LOCALE }) => {
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('grillesTemplates'), [GRILLE]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('cartouches_G654'), [CART_LOCALE]);
        window.db.setSync(cle('productions'), []);
    }, { GRILLE, CART_LOCALE });
    await choisirFichierImport(page, 'config-654.json', CONFIG);
    const r = await page.evaluate(async () => {
        await window.executerImportConfigComplete();
        const cartouches = window.db.getSync(cle('cartouches_G654'), []);
        const prod = (window.db.getSync(cle('productions'), []) || []).find(p => p.titre === 'Analyse 654');
        const designee = cartouches.find(c => c.id === prod.cartoucheId) || null;
        return { nbCartouches: cartouches.length, cartoucheId: prod.cartoucheId, designee: designee && designee.nom };
    });
    console.log('CONFIG →', JSON.stringify(r));
    expect(r.nbCartouches, 'les deux cartouches sont gardées').toBe(2);
    expect(r.cartoucheId).not.toBe('CART654');
    expect(r.designee).toBe('Cartouche de l\'archive');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#654 · import de configuration : une production déjà là, à l\'identique, n\'est ni touchée ni dédoublée', async ({ page }) => {
    const erreurs = [];
    await ouvrir(page, erreurs);
    await page.evaluate(({ GRILLE, CART_LOCALE, PROD }) => {
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('grillesTemplates'), [GRILLE]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('cartouches_G654'), [CART_LOCALE]);
        window.db.setSync(cle('productions'), [PROD]);
    }, { GRILLE, CART_LOCALE, PROD });
    await choisirFichierImport(page, 'config-654.json', CONFIG);
    const r = await page.evaluate(async () => {
        await window.executerImportConfigComplete();
        const prods = (window.db.getSync(cle('productions'), []) || []).filter(p => p.titre === 'Analyse 654');
        return { nbCartouches: window.db.getSync(cle('cartouches_G654'), []).length, prods };
    });
    console.log('CONFIG IDENTIQUE →', JSON.stringify(r));
    // Témoin : la collision de cartouche a bien eu lieu (sinon le cas serait vacant).
    expect(r.nbCartouches).toBe(2);
    expect(r.prods).toHaveLength(1);
    expect(r.prods[0].cartoucheId).toBe('CART654');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#654 · import sélectif : la production importée désigne la cartouche venue avec elle', async ({ page }) => {
    const erreurs = [];
    await ouvrir(page, erreurs);
    await page.evaluate(({ CART_LOCALE }) => {
        // ⚠ Ce chemin écrit les cartouches sous la clé NUE (#655, hors lot) : la collision
        // se pose donc là où il lit.
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('cartouches_G654', [CART_LOCALE]);
        window.db.setSync(cle('productions'), []);
    }, { CART_LOCALE });
    await choisirFichierImport(page, 'brut-654.json',
        { grillesTemplates: [], modalitesEvaluation: {}, a2026_productions: [PROD], cartouches_G654: [CART_ARRIVANTE] });
    const r = await page.evaluate(async () => {
        const cases = [...document.querySelectorAll('.import-item-productions, .import-item-cartouches')];
        cases.forEach(c => { c.checked = true; });
        await window.executerImportSelectif();
        const cartouches = window.db.getSync('cartouches_G654', []);
        const prod = (window.db.getSync(cle('productions'), []) || []).find(p => p.titre === 'Analyse 654') || {};
        const designee = cartouches.find(c => c.id === prod.cartoucheId) || null;
        return { nbCases: cases.length, nbCartouches: cartouches.length, cartoucheId: prod.cartoucheId, designee: designee && designee.nom };
    });
    console.log('SÉLECTIF →', JSON.stringify(r));
    expect(r.nbCases, 'la modale a bien offert productions et cartouches').toBe(2);
    expect(r.nbCartouches).toBe(2);
    expect(r.designee).toBe('Cartouche de l\'archive');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#654 · Réserve, copie en double : la production copiée désigne la copie de sa cartouche, dans sa grille', async ({ page }) => {
    const erreurs = [];
    await ouvrir(page, erreurs);
    const r = await page.evaluate(async ({ GRILLE, CART_LOCALE, CART_ARRIVANTE, PROD }) => {
        // Tout est déjà là (doublons) ; la cartouche locale diffère de celle de l'archive.
        // Posée sous les DEUX formes de clé : la détection des doublons de la Réserve a
        // lu la forme nue jusqu'à #637 ; ce banc ne doit pas dépendre de laquelle.
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('grillesTemplates'), [GRILLE]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('cartouches_G654'), [CART_LOCALE]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('cartouches_G654', [CART_LOCALE]);
        window.db.setSync(cle('productions'), [PROD]);
        // L'archive, par le vrai lecteur : un ZIP trimestres/<dossier>/donnees.json.
        const zip = new JSZip();
        zip.file('trimestres/a2025-banc-654/donnees.json', JSON.stringify({
            grillesTemplates: [GRILLE], a2025_productions: [PROD], cartouches_G654: [CART_ARRIVANTE] }));
        const fichier = new File([await zip.generateAsync({ type: 'blob' })], 'archive-654.zip');
        document.getElementById('modalOuvrirVersement').classList.add('actif');
        await window.ReserveOuvrir.onFichierChoisi({ files: [fichier] });
        const cases = [...document.querySelectorAll('#modalOuvrirVersement input.reserve-ouvrir-checkbox')];
        cases.forEach(c => { c.checked = true; });
        document.getElementById('reserve-ouvrir-toggle-copie').checked = true;
        await window.ReserveOuvrir.appliquerReimport();
        const prods = (window.db.getSync(cle('productions'), []) || []).filter(p => p.titre === 'Analyse 654' && p.id !== 'P654');
        const prod = prods[0] || {};
        const cartouchesDeSaGrille = window.db.getSync(cle('cartouches_' + prod.grilleId), []) || [];
        const designee = cartouchesDeSaGrille.find(c => c.id === prod.cartoucheId) || null;
        return { nbCases: cases.length, nbCopies: prods.length, grilleId: prod.grilleId, cartoucheId: prod.cartoucheId,
            idsDeSaGrille: cartouchesDeSaGrille.map(c => c.id), designee: designee && designee.nom };
    }, { GRILLE, CART_LOCALE, CART_ARRIVANTE, PROD });
    console.log('RÉSERVE →', JSON.stringify(r));
    expect(r.nbCases, 'grille, cartouche et production offertes').toBe(3);
    expect(r.nbCopies).toBe(1);
    // Témoin : la grille a bien été copiée (sinon la cartouche resterait dans G654).
    expect(r.grilleId).not.toBe('G654');
    expect(r.idsDeSaGrille).toHaveLength(1);
    // La copie porte le nom de la cartouche de l'archive, suffixé « — copie » (_faireCopie).
    expect(r.designee).toBe('Cartouche de l\'archive — copie');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
