import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1156=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1156 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1156 (25 oct. 2026) — LES BIBLIOTHÈQUES DES PRODUCTIONS ET DES PRATIQUES EN DEUX COLONNES (lot 3 du
// plan du 24 oct.). Consigne : plans de travail/CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-3.md,
// § 5 (et celles des lots 1 et 2).
//
// Dans le vrai index.html, depuis la démonstration, par les vrais boutons « Consulter la bibliothèque »
// de Conception › Productions étudiantes et › Pratiques de notation :
//   · les deux titres et leurs phrases, mot pour mot ; les boutons du milieu partis ; « Importer ou
//     exporter ▾ » et l'action d'aujourd'hui de chaque entrée ;
//   · productions : les passages (← Utiliser, Garder →, Tout garder) et l'état calme ; une production
//     ramenée dit « Aussi » et « Déjà », sans « Garder → » ; la ligne en clair et l'aperçu ; ⋮ ;
//     « Supprimer définitivement » garde l'exemplaire et le dit ; une retirée se retrouve et revient ;
//     la ligne d'import au pied de la bibliothèque, et sa bulle ;
//   · pratiques : aucune rangée du trimestre ne porte de passage ; l'encadré est parti ; une maquette
//     n'apparaît dans aucune colonne (la note la signale) ; la famille en mots ; ⋮ ; la phrase dans la
//     confirmation avec un exemplaire, absente sans ; la ligne d'import au pied de « Dans ce trimestre » ;
//   · les deux mesures de la phrase « Ce que tu y modifies… » ;
//   · à 820 px, les panneaux empilés et les flèches ↓ ↑ ; 44 px.
// Noms fictifs. Contexte Playwright neuf à chaque essai. La démo n'a aucune production dans la
// bibliothèque : le banc en sème.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · menu : action « exporterProductions » → « exporterProductionsX » (et « exporterPratiquesUtilisateur »)
//     → « les deux titres » ROUGIT ;
//   · relation : `|| item.idOriginal === exemplaire.id` retiré de `lieeAExemplaire` → « ← Utiliser ; une
//     production ramenée » ROUGIT ;
//   · Tout garder : `horsBibliotheque >= 2` → `>= 99`                                            → ROUGIT ;
//   · ligne : `formaterPourcentage(prod.ponderation)` → `prod.ponderation + ' %'`                → ROUGIT ;
//   · aperçu : la ligne « Grille de critères d'évaluation » retirée de `apercuProductionBibliotheque` → ROUGIT ;
//   · ⋮ : « Retirer de ce trimestre » → `supprimerProductionDefinitivement`                         → ROUGIT ;
//   · suppression d'une production : `retirerDeLaBibliotheque(id)` remis ; la phrase toujours      → ROUGIT ;
//   · retirée : les retirées hors de « Dans ta bibliothèque »                                    → ROUGIT ;
//   · ramenée puis retirée (verdict du lot 5, § 2.1) : `|| productions.find(p => p.idOriginal === id)`
//     retiré de `ajouterProductionIndividuelle`                                                   → ROUGIT ;
//   · import : `importAutreTrimestre` retiré de la colonne « Dans ta bibliothèque » des productions → ROUGIT ;
//   · pratiques : un passage posé sur les rangées du trimestre ; `filtrerParMaquette` retiré de la
//     colonne de la bibliothèque ; la famille par `type` seul (sans `configuration.type`)         → ROUGIT ;
//   · suppression d'une pratique : la phrase toujours                                             → ROUGIT ;
//   · pratiques : `await afficherBibliothequePratiques()` retiré après « ← Utiliser »             → ROUGIT ;
//   · retouche : `DEN: 'denotation'` → `DEN: 'denombrement'` dans `familleDeLaPratique`, puis l'entrée
//     `denotation` retirée de `FAMILLES_TAXONOMIQUES`                                             → ROUGIT.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const FAMILLES = {
    productions: { sel: '#modalBibliothequeProductions', sousSection: 'productions', action: 'afficherBibliothequeProductions' },
    pratiques: { sel: '#modalBibliothequePratiques', sousSection: 'pratiques-notation', action: 'afficherBibliothequePratiques' }
};
const GRILLE_4 = 'GRILLE_DEMO_1759264206489';   // « Grille-4 » de la démonstration
const PHRASE_EXEMPLAIRE = 'Son exemplaire de ta bibliothèque reste.';

async function ouvrirDemo(page, famille, largeur, hauteur) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
    await page.evaluate((s) => naviguerVers('conception', s), FAMILLES[famille].sousSection);
    await pause(page, 900);
    // La fenêtre du codex (#1007) a ses propres bancs ; les questions de l'app sont relevées ici.
    await page.evaluate(() => {
        Codex.proposerAvantSuppression = async () => true;
        window.__questions = [];
        window.uiDialogues.confirmerAction = async (o) => { window.__questions.push(o.message); return true; };
    });
}

/** Le geste réel : le bouton « Consulter la bibliothèque » de l'écran. */
async function ouvrirBibliotheque(page, famille) {
    const f = FAMILLES[famille];
    await page.locator('#conception-' + f.sousSection + ' button[data-action="' + f.action + '"]').click();
    await expect(page.locator(f.sel + ' .biblio2-fenetre')).toBeVisible();
}

const colonne = (page, famille, cle) => page.locator(FAMILLES[famille].sel + ' .biblio2-panneau--' + cle);
/** La rangée d'une colonne, par son nom (liste principale, hors « Partagés par des collègues »). */
const rangee = (page, famille, cle, nom) => colonne(page, famille, cle).locator('.biblio2-liste').first()
    .locator(':scope > .biblio2-rangee', { has: page.locator('.biblio2-rangee-nom', { hasText: nom }) });
const texteVisible = (loc) => loc.evaluate(e => e.innerText.replace(/\s+/g, ' ').trim());
const ouvrirMenu = async (r) => { await r.locator('.biblio2-kebab').click(); return r.locator('.biblio-menu-popover.actif'); };

/** Des productions fictives : dans la bibliothèque, et (`aussiTrimestre`, `seulTrimestre`) dans ce trimestre. */
async function semerProductions(page, productions) {
    await page.evaluate(async (liste) => {
        const biblio = db.getSync('bibliothequeProductions', []) || [];
        const trimestre = db.getSync(cle('productions'), []) || [];
        for (const p of liste) {
            const { aussiTrimestre, seulTrimestre, ...prod } = p;
            if (!seulTrimestre) biblio.push(prod);
            if (aussiTrimestre || seulTrimestre) trimestre.push({ ...prod, dansBibliotheque: true });
        }
        await db.set('bibliothequeProductions', biblio);   // security-ok: fixture littérale écrite par le banc, aucune source externe
        await db.set(cle('productions'), trimestre);   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, productions);
}
const productionFictive = (id, titre, extra) => Object.assign({
    id, titre, activiteApprentissage: 'Activité fictive', type: 'travail', ponderation: 12.5,
    objectif: 'Objectif fictif : relier deux idées.', grilleId: GRILLE_4
}, extra || {});

/** Des pratiques fictives dans la bibliothèque. */
async function semerPratiquesBibliotheque(page, pratiques) {
    await page.evaluate(async (liste) => {
        const biblio = db.getSync('bibliothequePratiques', []) || [];
        await db.set('bibliothequePratiques', biblio.concat(liste));   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, pratiques);
}

/** Toutes les cibles visibles de la fenêtre : 44 px au moins. */
const cibles = (page, sel) => page.evaluate((s) => [...document.querySelector(s).querySelectorAll('button, select, summary, label, input[type="text"]')]
    .filter(e => e.getClientRects().length > 0)
    .map(e => { const b = e.getBoundingClientRect(); return { t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 40), h: Math.round(b.height), w: Math.round(b.width) }; }), sel);

/** Le menu « Importer ou exporter ▾ » : ses entrées, et l'action d'aujourd'hui de chacune (témoins). */
async function eprouverMenuFichiers(page, famille, mots) {
    const sel = FAMILLES[famille].sel;
    const declencheur = page.locator(sel + ' .biblio2-btn-fichiers');
    await expect(declencheur).toHaveText('Importer ou exporter ▾');
    await declencheur.click();
    const menu = page.locator(sel + ' .biblio-menu-popover.actif');
    await expect(menu.locator('.biblio-menu-item')).toHaveText([mots.importer, 'Importer le partage d\'une ou d\'un collègue', mots.exporter]);
    await expect(menu.locator('.biblio-menu-separateur')).toHaveCount(1);
    await expect(menu.locator('.biblio-menu-note')).toHaveText('Fichiers .json et .lcz');

    const [selecteur] = await Promise.all([
        page.waitForEvent('filechooser'),
        menu.getByRole('menuitem', { name: mots.importer, exact: true }).click()
    ]);
    expect(await selecteur.element().getAttribute('id')).toBe(mots.champ);
    expect(await selecteur.element().getAttribute('data-on-change')).toBe(mots.onChange);

    await page.evaluate((exporter) => {
        window.__appels = [];
        window.partageImport.ouvrirSelecteurFichier = () => window.__appels.push('partageImport.ouvrirSelecteurFichier');
        window[exporter] = () => window.__appels.push(exporter);
    }, mots.actionExporter);
    await declencheur.click();
    await menu.getByRole('menuitem', { name: /Importer le partage/ }).click();
    await declencheur.click();
    await menu.getByRole('menuitem', { name: mots.exporter }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual(['partageImport.ouvrirSelecteurFichier', mots.actionExporter]);
}

// ────────────────────────────────────────── PRODUCTIONS ──────────────────────────────────────────

test('productions : les deux titres, les boutons du milieu partis, « Importer ou exporter ▾ » et ses actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await ouvrirBibliotheque(page, 'productions');

    await expect(colonne(page, 'productions', 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(\d+\)$/);
    await expect(colonne(page, 'productions', 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(\d+\)$/);
    await expect(colonne(page, 'productions', 'trimestre').locator('.biblio2-phrase').first())
        .toHaveText('Les productions que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.');
    await expect(colonne(page, 'productions', 'bibliotheque').locator('.biblio2-phrase').first())
        .toHaveText('Les productions que tu gardes pour tous tes trimestres.');

    const libelles = await page.locator(FAMILLES.productions.sel + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length, 'la tranche des boutons n’est pas vide').toBeGreaterThan(10);
    for (const ancien of ['Ajouter mes productions à la bibliothèque', 'Exporter toutes mes productions (JSON)',
        'Importer des productions (JSON)', 'Importer un partage (.lcz)', 'Ajouter à ma sélection']) {
        expect(libelles, ancien).not.toContain(ancien);
    }
    await eprouverMenuFichiers(page, 'productions', {
        importer: 'Importer des productions', exporter: 'Exporter les productions de ce trimestre',
        champ: 'fichier-import-productions-modal', onChange: 'importerProductions', actionExporter: 'exporterProductions'
    });
});

test('productions : Garder →, ← Utiliser ; une production ramenée dit « Aussi » et « Déjà », sans « Garder → »', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
    await ouvrirBibliotheque(page, 'productions');

    // Garder dans ma bibliothèque →
    const rt = () => rangee(page, 'productions', 'trimestre', 'Évaluation terminale');
    await expect(rt().locator('.biblio2-passage')).toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
    await rt().locator('.biblio2-passage').click();
    await expect(rt().locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'productions', 'bibliotheque', 'Évaluation terminale').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    expect(await page.evaluate(() => (db.getSync('bibliothequeProductions', []) || []).some(p => p.titre === 'Évaluation terminale')),
        'la production est écrite dans la bibliothèque').toBe(true);

    // ← Utiliser dans ce trimestre : la production arrive sous un id neuf qui nomme sa source.
    const rb = () => rangee(page, 'productions', 'bibliotheque', 'Production fictive de la bibliothèque');
    await expect(rb().locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await rb().locator('.biblio2-passage').click();
    const rr = () => rangee(page, 'productions', 'trimestre', 'Production fictive de la bibliothèque');
    await expect(rr()).toHaveCount(1);
    const ramenee = await page.evaluate(() => (db.getSync(cle('productions'), []) || []).find(p => p.idOriginal === 'PROD_BANC_BIBLIO'));
    expect(ramenee, 'la production est dans ce trimestre').toBeTruthy();
    expect(ramenee.id).not.toBe('PROD_BANC_BIBLIO');
    await expect(rr().locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rr().locator('.biblio2-passage')).toHaveCount(0);
    await expect(rb().locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    await expect(rb().locator('.biblio2-passage')).toHaveCount(0);
    // Une production sans lien avec la bibliothèque garde son passage.
    await expect(rangee(page, 'productions', 'trimestre', 'Artefact 1').locator('.biblio2-passage'))
        .toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
});

test('productions : « Tout garder dans ma bibliothèque » verse les productions du trimestre, puis disparaît', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await ouvrirBibliotheque(page, 'productions');
    const nb = await colonne(page, 'productions', 'trimestre').locator('.biblio2-liste > .biblio2-rangee').count();
    expect(nb).toBeGreaterThanOrEqual(2);
    const toutGarder = colonne(page, 'productions', 'trimestre').getByRole('button', { name: 'Tout garder dans ma bibliothèque' });
    await toutGarder.click();
    await expect(colonne(page, 'productions', 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-passage')).toHaveCount(0);
    const etats = await colonne(page, 'productions', 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-etat').allTextContents();
    expect(etats.length).toBe(nb);
    for (const e of etats) expect(e).toBe('✓ Aussi dans ta bibliothèque');
    await expect(toutGarder).toHaveCount(0);
});

test('productions : la ligne en clair (type, pondération à la française) ; l’aperçu dit l’objectif et ce que la fiche nomme', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await ouvrirBibliotheque(page, 'productions');

    const r = rangee(page, 'productions', 'trimestre', 'Artefact 1');
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText('Artefact d\'un portfolio · 6,67 %');
    await expect(rangee(page, 'productions', 'trimestre', 'Évaluation terminale').locator('.biblio2-rangee-meta')).toHaveText('Évaluation terminale · 40 %');
    const nom = r.locator('.biblio2-rangee-nom');
    const apercu = r.locator('.biblio2-apercu');
    await expect(nom).toHaveAttribute('aria-expanded', 'false');
    await expect(apercu).toBeHidden();
    await nom.click();
    await expect(nom).toHaveAttribute('aria-expanded', 'true');
    const objectif = await page.evaluate(() => (db.getSync(cle('productions'), []) || []).find(p => p.titre === 'Artefact 1').objectif);
    await expect(apercu.locator('.biblio2-apercu-texte').first()).toHaveText('Objectif : ' + objectif);
    const lignes = await apercu.locator('tr').evaluateAll(trs => trs.map(tr => [...tr.cells].map(td => td.textContent.trim())));
    expect(lignes).toEqual([['Grille de critères d\'évaluation', 'Grille-4', '']]);
    await nom.click();
    await expect(apercu).toBeHidden();

    // Plus de badge, plus de « Type: » ni de « (s) », aucun emoji (le 📁 du portfolio compris).
    const metas = await page.locator(FAMILLES.productions.sel + ' .biblio2-rangee-meta').allTextContents();
    expect(metas.length).toBeGreaterThanOrEqual(10);
    for (const m of metas) expect(m).not.toMatch(/Type:|Pondération:|\(s\)|📁/);
    await expect(page.locator(FAMILLES.productions.sel + ' .badge-source')).toHaveCount(0);
});

test('productions : ⋮, les libellés et leurs actions ; une production retirée se retrouve dans la bibliothèque et revient', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
    await ouvrirBibliotheque(page, 'productions');

    const rt = () => rangee(page, 'productions', 'trimestre', 'Artefact 3');
    const id = await rt().getAttribute('data-biblio-item-id');
    let menu = await ouvrirMenu(rt());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter pour partager', 'Retirer de ce trimestre', 'Supprimer définitivement']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Retirer de ce trimestre', 'Supprimer définitivement']);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
        window.__appels = [];
        const temoin = (nom) => (...a) => window.__appels.push([nom, ...a]);
        window.dupliquerProductionBibliotheque = temoin('dupliquerProductionBibliotheque');
        window.partageExport.exporterPourPartager = temoin('exporterPourPartager');
        window.supprimerProductionDefinitivement = temoin('supprimerProductionDefinitivement');
        window.supprimerProductionDeBibliothequePartagee = temoin('supprimerProductionDeBibliothequePartagee');
    });
    for (const libelle of ['Dupliquer', 'Exporter pour partager', 'Supprimer définitivement']) {
        menu = await ouvrirMenu(rt());
        await menu.getByRole('menuitem', { name: libelle, exact: true }).click();
    }
    menu = await ouvrirMenu(rangee(page, 'productions', 'bibliotheque', 'Production fictive de la bibliothèque'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual([
        ['dupliquerProductionBibliotheque', id],
        ['exporterPourPartager', 'production', id],
        ['supprimerProductionDefinitivement', id],
        ['supprimerProductionDeBibliothequePartagee', 'PROD_BANC_BIBLIO']
    ]);

    // « Retirer de ce trimestre » pour de vrai : elle quitte la colonne, se retrouve dans la bibliothèque
    // (comme dans la section 2 d'avant), sa ligne le dit, et « ← Utiliser » la remet.
    menu = await ouvrirMenu(rt());
    await menu.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(rt()).toHaveCount(0);
    expect(await page.evaluate(() => window.__questions.pop())).toBe('Retirer cette production de ce trimestre ? Elle ne sera plus offerte dans le menu mais restera disponible dans le gestionnaire.');
    const retiree = rangee(page, 'productions', 'bibliotheque', 'Artefact 3');
    await expect(retiree).toHaveCount(1);
    await expect(retiree.locator('.biblio2-rangee-meta')).toHaveText('Retirée de ce trimestre · Artefact d\'un portfolio · 6,67 %');
    await expect(retiree.locator('.biblio2-kebab'), 'aucun geste de bibliothèque sur ce qui n’y est pas').toHaveCount(0);
    await retiree.locator('.biblio2-passage').click();
    await expect(rt()).toHaveCount(1);
    await expect(rangee(page, 'productions', 'bibliotheque', 'Artefact 3')).toHaveCount(0);
    expect(await page.evaluate((i) => (db.getSync(cle('productions'), []) || []).find(p => p.id === i).dansBibliotheque, id)).toBe(true);
});

test('productions : ramenée, puis retirée, « ← Utiliser » sur l’exemplaire la ramène (par `idOriginal`, verdict du lot 5, § 2.1)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
    await ouvrirBibliotheque(page, 'productions');
    const exemplaire = () => colonne(page, 'productions', 'bibliotheque').locator('.biblio2-rangee[data-biblio-item-id="PROD_BANC_BIBLIO"]');
    const rt = () => rangee(page, 'productions', 'trimestre', 'Production fictive de la bibliothèque');
    const copies = () => page.evaluate(() => (db.getSync(cle('productions'), []) || []).filter(p => p.idOriginal === 'PROD_BANC_BIBLIO'));

    await exemplaire().locator('.biblio2-passage').click();
    await expect(rt()).toHaveCount(1);
    const [ramenee] = await copies();
    const menu = await ouvrirMenu(rt());
    await menu.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(rt()).toHaveCount(0);

    await page.evaluate(() => {
        window.__notifs = [];
        for (const genre of ['info', 'succes', 'erreur']) {
            const f = notifications[genre].bind(notifications);
            notifications[genre] = (...a) => { window.__notifs.push([genre, ...a]); return f(...a); };
        }
    });
    await expect(exemplaire().locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await exemplaire().locator('.biblio2-passage').click();
    await expect(rt()).toHaveCount(1);
    const apres = await copies();
    expect(apres.map(p => [p.id, p.dansBibliotheque]), 'la même production revient, aucun second exemplaire').toEqual([[ramenee.id, true]]);
    const notifs = await page.evaluate(() => window.__notifs);
    expect(notifs.map(n => n[0])).toEqual(['succes']);
    await expect(exemplaire().locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
});

test('productions : « Supprimer définitivement » garde l’exemplaire de la bibliothèque et le dit ; la phrase seulement avec un exemplaire', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    const DEUX = 'Production fictive des deux colonnes';
    const SEULE = 'Production fictive du trimestre seul';
    await semerProductions(page, [
        productionFictive('PROD_BANC_DEUX', DEUX, { aussiTrimestre: true }),
        productionFictive('PROD_BANC_SEULE', SEULE, { seulTrimestre: true })
    ]);
    await ouvrirBibliotheque(page, 'productions');

    const supprimer = async (nom) => {
        const r = rangee(page, 'productions', 'trimestre', nom);
        await r.locator('.biblio2-kebab').click();
        await r.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
        await expect(rangee(page, 'productions', 'trimestre', nom)).toHaveCount(0);
    };
    const stock = () => page.evaluate(() => ({
        trimestre: (db.getSync(cle('productions'), []) || []).map(p => p.id),
        biblio: (db.getSync('bibliothequeProductions', []) || []).map(p => p.id)
    }));

    await supprimer(DEUX);
    await expect(rangee(page, 'productions', 'bibliotheque', DEUX)).toHaveCount(1);
    let s = await stock();
    expect(s.trimestre).not.toContain('PROD_BANC_DEUX');
    expect(s.biblio, 'l’exemplaire de la bibliothèque reste').toContain('PROD_BANC_DEUX');

    // ← Utiliser la ramène (id neuf, idOriginal) ; sa suppression porte la phrase aussi.
    await rangee(page, 'productions', 'bibliotheque', DEUX).locator('.biblio2-passage').click();
    await expect(rangee(page, 'productions', 'trimestre', DEUX).locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await supprimer(DEUX);
    s = await stock();
    expect(s.biblio).toContain('PROD_BANC_DEUX');

    await supprimer(SEULE);
    s = await stock();
    expect(s.trimestre).not.toContain('PROD_BANC_SEULE');

    const questions = (await page.evaluate(() => window.__questions)).filter(q => /^Supprimer définitivement la production/.test(q));
    expect(questions).toEqual([
        `Supprimer définitivement la production «${DEUX}» ? Cette action est irréversible. ${PHRASE_EXEMPLAIRE}`,
        `Supprimer définitivement la production «${DEUX}» ? Cette action est irréversible. ${PHRASE_EXEMPLAIRE}`,
        `Supprimer définitivement la production «${SEULE}» ? Cette action est irréversible.`
    ]);
});

test('productions : « Importer depuis un autre trimestre » au pied de « Dans ta bibliothèque », et il y écrit ; sa bulle', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await page.evaluate(async () => {
        await db.set('a2025_productions', [{ id: 'PROD_A2025_BANC', titre: 'Production fictive d\'un autre trimestre', type: 'travail',   // security-ok: fixture littérale écrite par le banc, aucune source externe
            ponderation: 20, coursId: 'COURS_BANC', sigleCours: '601-BANC', dansBibliotheque: true }]);
    });
    await ouvrirBibliotheque(page, 'productions');

    await expect(colonne(page, 'productions', 'trimestre').locator('details[data-repli="import-trimestre"]')).toHaveCount(0);
    const repli = colonne(page, 'productions', 'bibliotheque').locator('details[data-repli="import-trimestre"]');
    await expect(repli).toHaveCount(1);
    await repli.locator('summary').click();
    await expect(repli.locator('summary')).toHaveText('Importer depuis un autre trimestre');
    const toutImporter = repli.getByRole('button', { name: 'Tout importer' });
    await expect(toutImporter).toHaveAttribute('data-tooltip', 'import-trimestre-tout-productions');
    expect(await page.evaluate(() => JSON.stringify(window.accompagnement.obtenirEntree('import-trimestre-tout-productions'))))
        .toContain('Copie toutes les productions de ce trimestre dans ta bibliothèque. Les originales restent intactes.');
    expect(await page.evaluate(() => JSON.stringify(window.accompagnement.obtenirEntree('import-trimestre-tout-echelles'))))
        .toContain('Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes.');

    // Le trimestre choisi remplit le filtre de cours, qui paraît ; « Voir » puis « Importer ».
    await page.locator('#selectTrimestreImport').selectOption('a2025_productions');
    await expect(page.locator('#selectCoursImportProductions')).toBeVisible();
    await expect(page.locator('#selectCoursImportProductions option')).toHaveText(['Tous les cours', '601-BANC']);
    await repli.getByRole('button', { name: 'Voir les productions' }).click();
    const ligne = page.locator('#previewProductionsTrimestre .biblio2-import-rangee');
    await expect(ligne).toHaveCount(1);
    await expect(ligne.locator('.biblio2-rangee-meta')).toHaveText('Travail écrit · 20 % · 601-BANC');
    await ligne.getByRole('button', { name: 'Importer' }).click();
    await expect(rangee(page, 'productions', 'bibliotheque', 'Production fictive d\'un autre trimestre')).toHaveCount(1);
    expect(await page.evaluate(() => (db.getSync('bibliothequeProductions', []) || []).map(p => p.id))).toContain('PROD_A2025_BANC');
    expect(await page.evaluate(() => (db.getSync(cle('productions'), []) || []).map(p => p.id))).not.toContain('PROD_A2025_BANC');
});

test('productions : sans doublon, ni puce ; un doublon semé : les mots des colonnes, la puce, « Voir » ; 44 px', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
    await ouvrirBibliotheque(page, 'productions');
    const fen = page.locator(FAMILLES.productions.sel);
    expect(await fen.locator('.biblio2-rangee').count()).toBeGreaterThanOrEqual(10);
    await expect(fen.locator('.biblio-doublons')).toHaveCount(0);
    await expect(fen.locator('.biblio-id-court')).toHaveCount(0);

    await semerProductions(page, [productionFictive('PROD_HOMONYME_BANC', 'Artefact 1')]);
    await page.evaluate(async () => { await afficherBibliothequeProductions(); });
    await expect(fen.locator('.biblio-doublons')).toHaveCount(1);
    const lieux = await fen.locator('.biblio-doublon-lieu').allTextContents();
    expect(lieux).toContain('Dans ce trimestre');
    expect(lieux).toContain('Dans ta bibliothèque');
    expect(lieux.filter(l => !['Dans ce trimestre', 'Dans ta bibliothèque'].includes(l))).toEqual([]);
    const porteurs = await fen.locator('.biblio2-rangee .biblio-id-court').evaluateAll(cs => cs.map(c => c.closest('.biblio2-rangee').getAttribute('data-biblio-item-id')));
    expect(porteurs).toContain('PROD_HOMONYME_BANC');
    await fen.locator('.biblio-doublons [data-action="BibliothequeUI.voirItemDoublon"][data-param="PROD_HOMONYME_BANC"]').click();
    await expect(fen.locator('.biblio2-rangee[data-biblio-item-id="PROD_HOMONYME_BANC"]')).toHaveClass(/biblio-carte--pointee/);

    const toutes = await cibles(page, FAMILLES.productions.sel);
    expect(toutes.length, 'la tranche des cibles n’est pas vide').toBeGreaterThan(20);
    expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
});

test('mesure : garder une production, ou la ramener, crée un exemplaire séparé (la phrase « Ce que tu y modifies… » dit vrai)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'productions', 1440, 900);
    await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
    await ouvrirBibliotheque(page, 'productions');
    await rangee(page, 'productions', 'trimestre', 'Évaluation terminale').locator('.biblio2-passage').click();
    await expect(rangee(page, 'productions', 'trimestre', 'Évaluation terminale').locator('.biblio2-etat')).toHaveCount(1);
    await rangee(page, 'productions', 'bibliotheque', 'Production fictive de la bibliothèque').locator('.biblio2-passage').click();
    await expect(rangee(page, 'productions', 'trimestre', 'Production fictive de la bibliothèque')).toHaveCount(1);
    const mesure = await page.evaluate(async () => {
        const gardee = (db.getSync(cle('productions'), []) || []).find(p => p.titre === 'Évaluation terminale').id;
        await db.modifier(cle('productions'), (lues) => {
            lues.forEach(p => {
                if (p.id === gardee || p.idOriginal === 'PROD_BANC_BIBLIO') { p.titre += ' modifiée'; p.objectif = 'Objectif modifié.'; }
            });
            return lues;
        }, []);
        const biblio = db.getSync('bibliothequeProductions', []) || [];
        const ex1 = biblio.find(p => p.id === gardee);
        const ex2 = biblio.find(p => p.id === 'PROD_BANC_BIBLIO');
        return [ex1.titre, ex2.titre, ex2.objectif];
    });
    expect(mesure).toEqual(['Évaluation terminale', 'Production fictive de la bibliothèque', 'Objectif fictif : relier deux idées.']);
});

// ─────────────────────────────────────────── PRATIQUES ───────────────────────────────────────────

test('pratiques : les deux titres, les boutons du milieu et l’encadré partis, « Importer ou exporter ▾ » et ses actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'pratiques', 1440, 900);
    await ouvrirBibliotheque(page, 'pratiques');

    await expect(colonne(page, 'pratiques', 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(\d+\)$/);
    await expect(colonne(page, 'pratiques', 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(\d+\)$/);
    await expect(colonne(page, 'pratiques', 'trimestre').locator('.biblio2-phrase').first())
        .toHaveText('Les pratiques que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.');
    await expect(colonne(page, 'pratiques', 'bibliotheque').locator('.biblio2-phrase').first())
        .toHaveText('Les pratiques que tu gardes pour tous tes trimestres.');

    const fen = page.locator(FAMILLES.pratiques.sel);
    const texte = await fen.innerText();
    expect(texte.length).toBeGreaterThan(200);
    expect(texte, 'l’encadré « Pour éditer une pratique… » est parti').not.toContain('Pour éditer une pratique');
    const libelles = await fen.locator('button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length).toBeGreaterThan(8);
    for (const ancien of ['Exporter toutes mes pratiques (JSON)', 'Importer des pratiques (JSON)', 'Importer un partage (.lcz)',
        'Ajouter', 'Tout garder dans ma bibliothèque']) {
        expect(libelles, ancien).not.toContain(ancien);
    }
    await eprouverMenuFichiers(page, 'pratiques', {
        importer: 'Importer des pratiques', exporter: 'Exporter les pratiques de ce trimestre',
        champ: 'fichier-import-pratiques-modal', onChange: 'importerPratiquesUtilisateur', actionExporter: 'exporterPratiquesUtilisateur'
    });
});

test('pratiques : aucune rangée du trimestre ne porte de passage ; la famille en mots ; « ← Utiliser » ramène un gabarit, la fenêtre reste ouverte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'pratiques', 1440, 560);
    await ouvrirBibliotheque(page, 'pratiques');

    const trimestre = colonne(page, 'pratiques', 'trimestre').locator('.biblio2-liste').first();
    const nbTrimestre = await trimestre.locator(':scope > .biblio2-rangee').count();
    expect(nbTrimestre).toBeGreaterThanOrEqual(2);
    await expect(trimestre.locator('.biblio2-passage')).toHaveCount(0);
    await expect(colonne(page, 'pratiques', 'trimestre').getByRole('button', { name: 'Tout garder dans ma bibliothèque' })).toHaveCount(0);

    // La famille en mots, à la place des badges ; « Gabarit » parti.
    await expect(rangee(page, 'pratiques', 'trimestre', 'PAN – Standards (démo)').locator('.biblio2-rangee-meta')).toHaveText(/^PAN-Standards( · par .+)?$/);
    await expect(rangee(page, 'pratiques', 'bibliotheque', 'Modèle sommatif').locator('.biblio2-rangee-meta')).toHaveText(/^Sommative · par /);
    await expect(rangee(page, 'pratiques', 'bibliotheque', 'Modèle de base').locator('.biblio2-rangee-meta')).toHaveText(/^PAN-Dénotation · par /);
    const fen = page.locator(FAMILLES.pratiques.sel);
    await expect(fen.locator('.badge-type-pratique')).toHaveCount(0);
    await expect(fen.locator('.badge-source')).toHaveCount(0);
    const metas = await fen.locator('.biblio2-rangee-meta').allTextContents();
    expect(metas.length).toBeGreaterThanOrEqual(6);
    for (const m of metas) expect(m).not.toMatch(/\b(SOM|STD|SPE|DEN)\b|Gabarit ?$/);

    // ← Utiliser dans ce trimestre : même id ; « Aussi » d'un côté, « Déjà » de l'autre ; la fenêtre reste
    // ouverte à la même position de défilement (consigne du lot 1, § 1.7 ; avant, elle se fermait).
    const fenetre = page.locator(FAMILLES.pratiques.sel + ' .biblio2-fenetre');
    const rb = () => rangee(page, 'pratiques', 'bibliotheque', 'Modèle sommatif');
    await rb().scrollIntoViewIfNeeded();
    const defilement = await fenetre.evaluate(f => f.scrollTop);
    expect(defilement, 'la fenêtre défile').toBeGreaterThan(0);
    await rb().locator('.biblio2-passage').click();
    await expect(rangee(page, 'pratiques', 'trimestre', 'Modèle sommatif')).toHaveCount(1);
    await expect(fenetre).toBeVisible();
    expect(Math.abs((await fenetre.evaluate(f => f.scrollTop)) - defilement)).toBeLessThanOrEqual(2);
    await expect(rangee(page, 'pratiques', 'trimestre', 'Modèle sommatif').locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'pratiques', 'trimestre', 'Modèle sommatif').locator('.biblio2-passage')).toHaveCount(0);
    await expect(rb().locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    await expect(rb().locator('.biblio2-passage')).toHaveCount(0);
    expect(await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).some(p => p.id === 'SOM-litterature' && p.dansBibliotheque !== false))).toBe(true);
});

test('pratiques : l’aperçu dit la description, puis l’échelle et la grille ; sans description, la famille sans l’anglais', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'pratiques', 1440, 900);
    const echelle = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).find(e => e.dansBibliotheque !== false));
    await semerPratiquesBibliotheque(page, [{ id: 'PRAT_BANC', nom: 'Pratique fictive', type: 'sommative', auteur: 'Collègue fictive',
        description: 'Description fictive de la pratique.', configuration: { echelleId: echelle.id, grilleId: GRILLE_4 } }]);
    await ouvrirBibliotheque(page, 'pratiques');

    const r = rangee(page, 'pratiques', 'bibliotheque', 'Pratique fictive');
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText('Sommative · par Collègue fictive');
    await r.locator('.biblio2-rangee-nom').click();
    await expect(r.locator('.biblio2-apercu .biblio2-apercu-texte').first()).toHaveText('Description fictive de la pratique.');
    const lignes = await r.locator('.biblio2-apercu tr').evaluateAll(trs => trs.map(tr => [...tr.cells].map(td => td.textContent.trim())));
    expect(lignes).toEqual([['Échelle de performance', echelle.nom, ''], ['Grille de critères d\'évaluation', 'Grille-4', '']]);

    const demo = rangee(page, 'pratiques', 'trimestre', 'PAN – Standards (démo)');
    await demo.locator('.biblio2-rangee-nom').click();
    await expect(demo.locator('.biblio2-apercu .biblio2-apercu-texte').first()).toHaveText('PAN-Standards - Maîtrise de standards/objectifs');

    // Retouche du lot 3 : l'éditeur recompose la même table ; une pratique DEN sans description y lisait
    // « denotation » brut (aucune entrée canonique), elle lit maintenant le nom de la famille.
    await page.evaluate(async () => {
        const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
        await db.set(cle('pratiquesConfigurables'), liste.concat([{ id: 'PRAT_BANC_DEN', nom: 'Pratique fictive DEN',   // security-ok: fixture littérale écrite par le banc
            type: 'denotation', pratiques: ['DEN'], configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [] } }]));
        await fermerModalBibliothequePratiques();
        await chargerPratiquePourModif('PRAT_BANC_DEN');
    });
    await expect(page.locator('#mat-description-pratique'))
        .toHaveText('PAN-Dénotation - Note finale certificative posée (non calculée) selon l\'atteinte de cibles d\'apprentissage');
});

test('pratiques : ⋮, les libellés et leurs actions ; la phrase dans la confirmation avec un exemplaire, absente sans', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'pratiques', 1440, 900);
    const questions = [];
    page.on('dialog', (d) => { if (/^Supprimer définitivement la pratique/.test(d.message())) questions.push(d.message()); });
    await ouvrirBibliotheque(page, 'pratiques');

    const rt = () => rangee(page, 'pratiques', 'trimestre', 'PAN – Spécifications (démo)');
    const id = await rt().getAttribute('data-biblio-item-id');
    let menu = await ouvrirMenu(rt());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter pour partager', 'Exporter (JSON)', 'Retirer de ce trimestre', 'Supprimer définitivement']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Retirer de ce trimestre', 'Supprimer définitivement']);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
        window.__appels = [];
        const temoin = (nom) => (...a) => window.__appels.push([nom, ...a]);
        window.dupliquerPratiqueBibliotheque = temoin('dupliquerPratiqueBibliotheque');
        window.partageExport.exporterPourPartager = temoin('exporterPourPartager');
        window.partagerPratiqueMateriel = temoin('partagerPratiqueMateriel');
        window.retirerPratiqueDeBibliothequeMateriel = temoin('retirerPratiqueDeBibliothequeMateriel');
        window.supprimerPratiqueDeBibliothequePartagee = temoin('supprimerPratiqueDeBibliothequePartagee');
    });
    for (const libelle of ['Dupliquer', 'Exporter pour partager', 'Exporter (JSON)', 'Retirer de ce trimestre']) {
        menu = await ouvrirMenu(rt());
        await menu.getByRole('menuitem', { name: libelle, exact: true }).click();
    }
    menu = await ouvrirMenu(rangee(page, 'pratiques', 'bibliotheque', 'Modèle simple'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual([
        ['dupliquerPratiqueBibliotheque', id],
        ['exporterPourPartager', 'pratique', id],
        ['partagerPratiqueMateriel', id],
        ['retirerPratiqueDeBibliothequeMateriel', id],
        ['supprimerPratiqueDeBibliothequePartagee', 'SPE-simple']
    ]);

    // « Supprimer définitivement », pour de vrai : un gabarit ramené (son exemplaire reste dans la
    // bibliothèque) porte la phrase ; une pratique de la démo, sans exemplaire, non.
    await rangee(page, 'pratiques', 'bibliotheque', 'Modèle sommatif').locator('.biblio2-passage').click();
    await expect(rangee(page, 'pratiques', 'trimestre', 'Modèle sommatif')).toHaveCount(1);
    for (const nom of ['Modèle sommatif', 'PAN – Standards (démo)']) {
        const r = rangee(page, 'pratiques', 'trimestre', nom);
        await r.locator('.biblio2-kebab').click();
        await r.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
        await expect(rangee(page, 'pratiques', 'trimestre', nom)).toHaveCount(0);
    }
    await expect(rangee(page, 'pratiques', 'bibliotheque', 'Modèle sommatif').locator('.biblio2-passage')).toHaveCount(1);
    expect(questions).toEqual([
        `Supprimer définitivement la pratique «Modèle sommatif» ?\n\nCette action est irréversible.\n\n${PHRASE_EXEMPLAIRE}`,
        'Supprimer définitivement la pratique «PAN – Standards (démo)» ?\n\nCette action est irréversible.'
    ]);
});

test('pratiques : une maquette n’apparaît dans aucune colonne, la note la signale ; l’import est au pied de « Dans ce trimestre »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'pratiques', 1440, 900);
    await page.evaluate(async () => {
        const trimestre = db.getSync(cle('pratiquesConfigurables'), []) || [];
        await db.set(cle('pratiquesConfigurables'), trimestre.concat([{ id: 'MAQ_BANC_T', nom: 'Maquette fictive du trimestre',   // security-ok: fixture littérale écrite par le banc, aucune source externe
            type: 'sommative', estMaquette: true, dansBibliotheque: true }]));
        // La ligne d'import ne paraît que s'il existe un autre trimestre à pratiques : son contenu a son banc
        // (import-pratiques-inter-trimestre-briqueC, même décor) ; ici, seule sa place compte.
        const actif = obtenirTrimestreId();
        window.obtenirTrimestres = () => [{ id: actif, nom: 'Ce trimestre' }, { id: 'a2025', nom: 'Automne 2025' }];
        db.setSync('a2025_pratiquesConfigurables', [{ id: 'PR_A2025_BANC', nom: 'Pratique fictive d\'un autre trimestre', dansBibliotheque: true }]);   // security-ok: fixture littérale écrite par le banc, aucune source externe
    });
    await semerPratiquesBibliotheque(page, [{ id: 'MAQ_BANC_B', nom: 'Maquette fictive de la bibliothèque', type: 'sommative', estMaquette: true }]);
    await ouvrirBibliotheque(page, 'pratiques');

    const fen = page.locator(FAMILLES.pratiques.sel);
    expect(await fen.locator('.biblio2-rangee').count(), 'la tranche des rangées n’est pas vide').toBeGreaterThanOrEqual(6);
    await expect(fen.locator('.biblio2-rangee', { hasText: 'Maquette fictive' })).toHaveCount(0);
    expect(await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).some(p => p.id === 'MAQ_BANC_T')), 'la maquette est en stock').toBe(true);
    const note = fen.locator('.biblio2-note');
    await expect(note).toHaveText(/^Tu as 1 maquette d'exploration\. Les maquettes ne s'affichent pas ici/);
    await expect(note.getByRole('button', { name: 'Gérer mes maquettes' })).toHaveAttribute('data-action', 'ouvrirExplorationMaquettes');

    await expect(colonne(page, 'pratiques', 'bibliotheque').locator('details[data-repli="import-trimestre"]')).toHaveCount(0);
    const repli = colonne(page, 'pratiques', 'trimestre').locator('details[data-repli="import-trimestre"]');
    await expect(repli).toHaveCount(1);
    await expect(repli.getByRole('button', { name: 'Tout importer', includeHidden: true })).toHaveAttribute('data-tooltip', 'import-trimestre-tout-pratiques');
});

test('mesure : une pratique ramenée est un objet séparé ; une retirée absente de la bibliothèque devient introuvable (#1160)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'pratiques', 1440, 900);
    await ouvrirBibliotheque(page, 'pratiques');
    await rangee(page, 'pratiques', 'bibliotheque', 'Modèle sommatif').locator('.biblio2-passage').click();
    await expect(rangee(page, 'pratiques', 'trimestre', 'Modèle sommatif')).toHaveCount(1);
    const mesure = await page.evaluate(async () => {
        await db.modifier(cle('pratiquesConfigurables'), (lues) => {
            const p = lues.find(x => x.id === 'SOM-litterature');
            p.nom = 'Modèle sommatif modifié';
            p.description = 'Description modifiée.';
            return lues;
        }, []);
        const ex = (await obtenirToutesLesPratiquesBibliotheque()).find(p => p.id === 'SOM-litterature');
        return [ex.nom, ex.description];
    });
    expect(mesure[0]).toBe('Modèle sommatif');
    expect(mesure[1]).not.toBe('Description modifiée.');

    // #1160, pour les pratiques (consigne du lot 3, § 3.1) : une pratique retirée qui n'est pas dans la
    // bibliothèque ne se retrouve ni dans l'une ni dans l'autre colonne — comme avant ce lot (la section 2
    // d'avant ne listait que la bibliothèque). Mesuré, pas corrigé.
    const r = rangee(page, 'pratiques', 'trimestre', 'PAN – Standards (démo)');
    await r.locator('.biblio2-kebab').click();
    await r.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(rangee(page, 'pratiques', 'trimestre', 'PAN – Standards (démo)')).toHaveCount(0);
    await expect(page.locator(FAMILLES.pratiques.sel + ' .biblio2-rangee', { hasText: 'PAN – Standards (démo)' })).toHaveCount(0);
    expect(await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).find(p => p.id === 'demo-std-litt').dansBibliotheque)).toBe(false);
});

// ──────────────────────────────────────── 820 PX, CAPTURES ───────────────────────────────────────

for (const famille of ['productions', 'pratiques']) {
    test(`${famille} à 820 px : les panneaux l’un sous l’autre, les flèches ↓ et ↑, 44 px`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page, famille, 820, 1180);
        if (famille === 'productions') await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
        await ouvrirBibliotheque(page, famille);

        const bt = await colonne(page, famille, 'trimestre').boundingBox();
        const bb = await colonne(page, famille, 'bibliotheque').boundingBox();
        expect(bt.y + bt.height, '« Dans ce trimestre » d’abord').toBeLessThanOrEqual(bb.y + 1);
        expect(Math.abs(bt.x - bb.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(bt.width - bb.width)).toBeLessThanOrEqual(2);

        const nomBiblio = famille === 'productions' ? 'Production fictive de la bibliothèque' : 'Modèle sommatif';
        expect(await texteVisible(rangee(page, famille, 'bibliotheque', nomBiblio).locator('.biblio2-passage'))).toBe('↑ Utiliser dans ce trimestre');
        if (famille === 'productions') {
            expect(await texteVisible(rangee(page, famille, 'trimestre', 'Artefact 1').locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque ↓');
        }
        const toutes = await cibles(page, FAMILLES[famille].sel);
        expect(toutes.length).toBeGreaterThan(8);
        expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
    });
}

test('captures pour Grégoire : productions et pratiques, Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1156 non posée');
    test.setTimeout(180000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    for (const famille of ['productions', 'pratiques']) {
        await page.setViewportSize({ width: 1440, height: 900 });
        if (famille === 'productions') {
            await ouvrirDemo(page, famille, 1440, 900);
            await semerProductions(page, [productionFictive('PROD_BANC_BIBLIO', 'Production fictive de la bibliothèque')]);
        } else {
            await page.evaluate((s) => naviguerVers('conception', s), FAMILLES.pratiques.sousSection);
            await pause(page, 900);
        }
        await ouvrirBibliotheque(page, famille);
        const premiere = colonne(page, famille, 'trimestre').locator('.biblio2-liste > .biblio2-rangee').nth(1);
        await premiere.locator('.biblio2-rangee-nom').click();
        for (const sombre of [false, true]) {
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await colonne(page, famille, 'trimestre').locator('.biblio2-liste > .biblio2-rangee').first().locator('.biblio2-kebab').click();
            await pause(page, 300);
            await page.screenshot({ path: path.join(dossierCaptures, `${famille}-mac-1440-${sombre ? 'sombre' : 'clair'}.png`) });
            await page.keyboard.press('Escape');
        }
        await page.evaluate(() => document.body.classList.toggle('mode-clair', true));
        await page.setViewportSize({ width: 820, height: 1180 });
        await pause(page, 400);
        await page.screenshot({ path: path.join(dossierCaptures, `${famille}-ipad-820-clair.png`) });
        await page.keyboard.press('Escape');
        await page.keyboard.press('Escape');
        await expect(page.locator(FAMILLES[famille].sel)).toHaveCount(0);
    }
});
