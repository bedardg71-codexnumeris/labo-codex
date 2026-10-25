import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1155=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1155 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1155 (25 oct. 2026) — LES BIBLIOTHÈQUES DES ÉCHELLES ET DES CARTOUCHES EN DEUX COLONNES (lot 2 du
// plan du 24 oct.). Consigne : plans de travail/CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-2.md,
// § 4 (et celle du lot 1, § 5).
//
// Dans le vrai index.html, depuis la démonstration, par les vrais boutons « Consulter la bibliothèque »
// de Conception › Échelles de performance et › Cartouches de rétroaction :
//   · les deux titres, mot pour mot ; les boutons du milieu partis ; « Importer ou exporter ▾ » et
//     l'action d'aujourd'hui de chaque entrée ;
//   · échelles : les passages (← Utiliser, Garder →, Tout garder) et l'état calme ; une échelle ramenée
//     par « ← Utiliser » dit « Aussi » et « Déjà », sans « Garder → » ; l'aperçu des niveaux ; ⋮ ;
//     « Supprimer définitivement » garde l'exemplaire et le dit ; le bandeau des doublons et 44 px ;
//   · cartouches : les intertitres de grille dans les deux colonnes ; « Filtrer par grille » filtre la
//     bibliothèque ; aucune rangée du trimestre ne porte de passage ; ⋮ ; la suppression garde
//     l'exemplaire et le dit ; une cartouche retirée se retrouve et revient ;
//   · à 820 px, les panneaux empilés et les flèches ↓ ↑.
// Noms fictifs. Contexte Playwright neuf à chaque essai. La démo n'a ni échelle ni cartouche dans la
// bibliothèque : le banc en sème.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · menu : action « exporterEchelles » → « exporterEchellesX » (et « exporterCartouches ») → « les deux titres » ROUGIT ;
//   · titres : « Dans ta bibliothèque » → « Dans ta biblio » dans echelles.js                  → ROUGIT ;
//   · relation : `|| item.idOriginal === exemplaire.id` retiré de `lieeAExemplaire`
//     → « Tout garder, Garder →, ← Utiliser » et « ← Utiliser ; la cartouche » ROUGISSENT ;
//   · Tout garder : `horsBibliotheque >= 2` → `>= 99`                                         → ROUGIT ;
//   · aperçu des échelles : bornes « – » → « - »                                              → ROUGIT ;
//   · ⋮ : « Retirer de ce trimestre » → `supprimer…Definitivement` (échelles, cartouches)     → ROUGIT ;
//   · suppression d'une échelle : la phrase toujours ; `retirerEchelleDeLaBibliotheque` remis → ROUGIT ;
//   · suppression d'une cartouche : l'ancienne phrase ; `retirerCartoucheDeLaBibliotheque` remis
//     → ROUGIT (après l'ajout de la cartouche présente des deux côtés sous le même `id` : avec la seule
//     cartouche ramenée, le retrait par `id` ne la touchait pas, et le break-test restait VERT) ;
//   · doublons : `mots` retiré de l'appel du bandeau dans echelles.js                         → ROUGIT ;
//   · intertitres : `groupe: g` retiré des rangées du trimestre ; `_appliquerFiltreGroupe` retiré de
//     `choisirGroupe` ; un passage posé sur les rangées du trimestre                         → ROUGIT ;
//   · cartouche retirée : les retirées hors de « Dans ta bibliothèque »                      → ROUGIT.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const FAMILLES = {
    echelles: { sel: '#modalBibliothequeEchelles', sousSection: 'echelle-performance', action: 'afficherBibliothequeEchelles' },
    cartouches: { sel: '#modalBibliothequeCartouches', sousSection: 'retroactions', action: 'afficherBibliothequeCartouches' }
};
const GRILLE_4 = 'GRILLE_DEMO_1759264206489';   // « Grille-4 » de la démonstration

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

const niveaux = () => [
    { nom: 'Insuffisant', code: 'I', min: 0, max: 59.99, valeurCalcul: 50 },
    { nom: 'Maîtrisé', code: 'M', min: 60, max: 100, valeurCalcul: 80 }
];
/** Une échelle fictive semée dans la bibliothèque (et, `aussiTrimestre`, dans ce trimestre, même `id`). */
async function semerEchelles(page, echelles) {
    await page.evaluate(async (liste) => {
        Codex.proposerAvantSuppression = async () => true;   // la fenêtre du codex (#1007) a ses propres bancs
        const biblio = db.getSync('bibliothequeEchelles', []) || [];
        const trimestre = db.getSync(cle('echellesTemplates'), []) || [];
        for (const e of liste) {
            const { aussiTrimestre, seulTrimestre, ...echelle } = e;
            if (!seulTrimestre) biblio.push(echelle);
            if (aussiTrimestre || seulTrimestre) trimestre.push({ ...echelle, dansBibliotheque: true });
        }
        await db.set('bibliothequeEchelles', biblio);   // security-ok: fixture littérale écrite par le banc, aucune source externe
        await db.set(cle('echellesTemplates'), trimestre);   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, echelles);
}

const cartoucheFictive = (id, nom, grilleId, grilleNom) => ({
    id, nom, grilleId, grilleNom,
    criteres: [{ id: 'CR1', nom: 'Critère fictif' }, { id: 'CR2', nom: 'Second critère fictif' }],
    niveaux: [{ code: 'I', nom: 'Insuffisant' }, { code: 'M', nom: 'Maîtrisé' }],
    commentaires: { CR1_I: 'Commentaire fictif.', CR1_M: 'Autre commentaire fictif.', CR2_I: '', CR2_M: 'Troisième commentaire fictif.' }
});
async function semerCartouchesBibliotheque(page, cartouches) {
    await page.evaluate(async (liste) => {
        Codex.proposerAvantSuppression = async () => true;
        const biblio = db.getSync('bibliothequeCartouches', []) || [];
        await db.set('bibliothequeCartouches', biblio.concat(liste));   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, cartouches);
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

// ─────────────────────────────────────────── ÉCHELLES ───────────────────────────────────────────

test('échelles : les deux titres, les boutons du milieu partis, « Importer ou exporter ▾ » et ses actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await ouvrirBibliotheque(page, 'echelles');

    await expect(colonne(page, 'echelles', 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(\d+\)$/);
    await expect(colonne(page, 'echelles', 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(\d+\)$/);
    await expect(colonne(page, 'echelles', 'trimestre').locator('.biblio2-phrase').first())
        .toHaveText('Les échelles que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.');
    await expect(colonne(page, 'echelles', 'bibliotheque').locator('.biblio2-phrase').first())
        .toHaveText('Les échelles que tu gardes pour tous tes trimestres.');

    const libelles = await page.locator(FAMILLES.echelles.sel + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length, 'la tranche des boutons n’est pas vide').toBeGreaterThan(6);
    for (const ancien of ['Ajouter mes échelles à la bibliothèque', 'Exporter toutes mes échelles (JSON)',
        'Importer des échelles (JSON)', 'Importer un partage (.lcz)', 'Ajouter à ma sélection']) {
        expect(libelles, ancien).not.toContain(ancien);
    }
    await eprouverMenuFichiers(page, 'echelles', {
        importer: 'Importer des échelles', exporter: 'Exporter les échelles de ce trimestre',
        champ: 'fichier-import-echelles-modal', onChange: 'importerEchelles', actionExporter: 'exporterEchelles'
    });
});

test('échelles : Tout garder, Garder →, ← Utiliser ; une échelle ramenée dit « Aussi » et « Déjà », sans « Garder → »', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await semerEchelles(page, [{ id: 'ECH_BANC_BIBLIO', nom: 'Échelle fictive de la bibliothèque', niveaux: niveaux() }]);
    await ouvrirBibliotheque(page, 'echelles');

    // Les échelles du trimestre hors de la bibliothèque (la démo, et « Échelle de départ (IDME) » que
    // l'app pose au démarrage) : « Tout garder » est là.
    const toutGarder = colonne(page, 'echelles', 'trimestre').getByRole('button', { name: 'Tout garder dans ma bibliothèque' });
    await expect(toutGarder).toBeVisible();

    // Garder dans ma bibliothèque →
    const r4 = rangee(page, 'echelles', 'trimestre', 'IDME 4 niv');
    await expect(r4.locator('.biblio2-passage')).toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
    await r4.locator('.biblio2-passage').click();
    await expect(rangee(page, 'echelles', 'trimestre', 'IDME 4 niv').locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'echelles', 'bibliotheque', 'IDME 4 niv').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    expect(await page.evaluate(() => (db.getSync('bibliothequeEchelles', []) || []).some(e => e.nom === 'IDME 4 niv')),
        'l’échelle est écrite dans la bibliothèque').toBe(true);

    // ← Utiliser dans ce trimestre : l'échelle arrive sous un id neuf qui nomme sa source.
    const rb = rangee(page, 'echelles', 'bibliotheque', 'Échelle fictive de la bibliothèque');
    await expect(rb.locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await rb.locator('.biblio2-passage').click();
    await expect(rangee(page, 'echelles', 'trimestre', 'Échelle fictive de la bibliothèque')).toHaveCount(1);
    const ramenee = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).find(e => e.idOriginal === 'ECH_BANC_BIBLIO'));
    expect(ramenee, 'l’échelle est dans ce trimestre').toBeTruthy();
    expect(ramenee.id).not.toBe('ECH_BANC_BIBLIO');
    await expect(rangee(page, 'echelles', 'trimestre', 'Échelle fictive de la bibliothèque').locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'echelles', 'trimestre', 'Échelle fictive de la bibliothèque').locator('.biblio2-passage')).toHaveCount(0);
    await expect(rangee(page, 'echelles', 'bibliotheque', 'Échelle fictive de la bibliothèque').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    // Une échelle sans lien avec la bibliothèque garde son passage.
    await expect(rangee(page, 'echelles', 'trimestre', 'IDME et niv 0').locator('.biblio2-passage')).toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
});

test('échelles : « Tout garder dans ma bibliothèque » verse les échelles du trimestre, puis disparaît', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await ouvrirBibliotheque(page, 'echelles');
    const nb = await colonne(page, 'echelles', 'trimestre').locator('.biblio2-liste > .biblio2-rangee').count();
    expect(nb).toBeGreaterThanOrEqual(2);
    const toutGarder = colonne(page, 'echelles', 'trimestre').getByRole('button', { name: 'Tout garder dans ma bibliothèque' });
    await toutGarder.click();
    await expect(colonne(page, 'echelles', 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-passage')).toHaveCount(0);
    const etats = await colonne(page, 'echelles', 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-etat').allTextContents();
    expect(etats.length).toBe(nb);
    for (const e of etats) expect(e).toBe('✓ Aussi dans ta bibliothèque');
    await expect(toutGarder).toHaveCount(0);
});

test('échelles : l’aperçu dit les niveaux dans l’ordre (nom, code, bornes) ; la ligne en clair', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await ouvrirBibliotheque(page, 'echelles');

    const r = rangee(page, 'echelles', 'trimestre', 'IDME et niv 0');
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText('5 niveaux');
    const nom = r.locator('.biblio2-rangee-nom');
    const apercu = r.locator('.biblio2-apercu');
    await expect(nom).toHaveAttribute('aria-expanded', 'false');
    await expect(apercu).toBeHidden();
    await nom.click();
    await expect(nom).toHaveAttribute('aria-expanded', 'true');
    const lignes = await apercu.locator('tr').evaluateAll(trs => trs.map(tr => [...tr.cells].map(td => td.textContent.replace(/\s+/g, ' ').trim())));
    expect(lignes).toEqual([
        ['Aucun', '0', '0 % – 0 %'],
        ['Incomplet ou insuffisant', 'I', '0 % – 64,99 %'],
        ['En Développement', 'D', '65 % – 74,99 %'],
        ['Maîtrisé', 'M', '75 % – 84,99 %'],
        ['Étendu', 'E', '85 % – 100 %']
    ]);
    await nom.click();
    await expect(apercu).toBeHidden();

    const metas = await page.locator(FAMILLES.echelles.sel + ' .biblio2-rangee-meta').allTextContents();
    expect(metas.length).toBeGreaterThanOrEqual(2);
    for (const m of metas) expect(m).not.toMatch(/\(x\)|\(s\)|gabarit/);
});

test('échelles : ⋮, les libellés et leurs actions ; « Retirer de ce trimestre » pour de vrai', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await semerEchelles(page, [{ id: 'ECH_BANC_BIBLIO', nom: 'Échelle fictive de la bibliothèque', niveaux: niveaux() }]);
    await ouvrirBibliotheque(page, 'echelles');
    const ouvrirMenu = async (r) => { await r.locator('.biblio2-kebab').click(); return r.locator('.biblio-menu-popover.actif'); };

    const r4 = () => rangee(page, 'echelles', 'trimestre', 'IDME 4 niv');
    const id4 = await r4().getAttribute('data-biblio-item-id');
    let menu = await ouvrirMenu(r4());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter pour partager', 'Retirer de ce trimestre', 'Supprimer définitivement']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Retirer de ce trimestre', 'Supprimer définitivement']);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
        window.__appels = [];
        const temoin = (nom) => (...a) => window.__appels.push([nom, ...a]);
        window.dupliquerEchelleBibliotheque = temoin('dupliquerEchelleBibliotheque');
        window.partageExport.exporterPourPartager = temoin('exporterPourPartager');
        window.supprimerEchelleDefinitivement = temoin('supprimerEchelleDefinitivement');
        window.supprimerEchelleDeBibliothequePartagee = temoin('supprimerEchelleDeBibliothequePartagee');
    });
    for (const libelle of ['Dupliquer', 'Exporter pour partager', 'Supprimer définitivement']) {
        menu = await ouvrirMenu(r4());
        await menu.getByRole('menuitem', { name: libelle, exact: true }).click();
    }
    menu = await ouvrirMenu(rangee(page, 'echelles', 'bibliotheque', 'Échelle fictive de la bibliothèque'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual([
        ['dupliquerEchelleBibliotheque', id4],
        ['exporterPourPartager', 'echelle', id4],
        ['supprimerEchelleDefinitivement', id4],
        ['supprimerEchelleDeBibliothequePartagee', 'ECH_BANC_BIBLIO']
    ]);

    menu = await ouvrirMenu(r4());
    await menu.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(r4()).toHaveCount(0);
    const stock = await page.evaluate((id) => (db.getSync(cle('echellesTemplates'), []) || []).find(e => e.id === id), id4);
    expect(stock, 'les données de l’échelle restent').toBeTruthy();
    expect(stock.dansBibliotheque).toBe(false);
});

// Consigne du lot 2, § 3.2 (décision de Grégoire pour les grilles, étendue par Cowork) et § 4.
test('échelles : « Supprimer définitivement » garde l’exemplaire de la bibliothèque et le dit ; la phrase seulement avec un exemplaire', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    const questions = [];
    page.on('dialog', (d) => { if (/^Supprimer définitivement l'échelle/.test(d.message())) questions.push(d.message()); });
    const DEUX = 'Échelle fictive des deux colonnes';
    const SEULE = 'Échelle fictive du trimestre seul';
    await semerEchelles(page, [
        { id: 'ECH_BANC_DEUX', nom: DEUX, niveaux: niveaux(), aussiTrimestre: true },
        { id: 'ECH_BANC_SEULE', nom: SEULE, niveaux: niveaux(), seulTrimestre: true }
    ]);
    await ouvrirBibliotheque(page, 'echelles');

    const supprimer = async (nom) => {
        const r = rangee(page, 'echelles', 'trimestre', nom);
        await r.locator('.biblio2-kebab').click();
        await r.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
        await expect(rangee(page, 'echelles', 'trimestre', nom)).toHaveCount(0);
    };
    const stock = () => page.evaluate(() => ({
        trimestre: (db.getSync(cle('echellesTemplates'), []) || []).map(e => e.id),
        biblio: (db.getSync('bibliothequeEchelles', []) || []).map(e => e.id)
    }));

    await supprimer(DEUX);
    await expect(rangee(page, 'echelles', 'bibliotheque', DEUX)).toHaveCount(1);
    let s = await stock();
    expect(s.trimestre).not.toContain('ECH_BANC_DEUX');
    expect(s.biblio, 'l’exemplaire de la bibliothèque reste').toContain('ECH_BANC_DEUX');

    // ← Utiliser la ramène ; les deux colonnes la disent liée ; sa suppression porte la phrase aussi.
    await rangee(page, 'echelles', 'bibliotheque', DEUX).locator('.biblio2-passage').click();
    await expect(rangee(page, 'echelles', 'trimestre', DEUX).locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'echelles', 'trimestre', DEUX).locator('.biblio2-passage')).toHaveCount(0);
    await expect(rangee(page, 'echelles', 'bibliotheque', DEUX).locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    await supprimer(DEUX);
    s = await stock();
    expect(s.biblio).toContain('ECH_BANC_DEUX');

    await supprimer(SEULE);
    s = await stock();
    expect(s.trimestre).not.toContain('ECH_BANC_SEULE');

    expect(questions).toEqual([
        `Supprimer définitivement l'échelle «${DEUX}» ?\n\nCette action est irréversible.\n\nSon exemplaire de ta bibliothèque reste.`,
        `Supprimer définitivement l'échelle «${DEUX}» ?\n\nCette action est irréversible.\n\nSon exemplaire de ta bibliothèque reste.`,
        `Supprimer définitivement l'échelle «${SEULE}» ?\n\nCette action est irréversible.`
    ]);
});

test('échelles : sans doublon, ni puce ni marque ; un doublon semé : les mots des colonnes, la puce, « Voir » ; 44 px', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await semerEchelles(page, [{ id: 'ECH_BANC_BIBLIO', nom: 'Échelle fictive de la bibliothèque', niveaux: niveaux() }]);
    await ouvrirBibliotheque(page, 'echelles');
    const fen = page.locator(FAMILLES.echelles.sel);
    expect(await fen.locator('.biblio2-rangee').count()).toBeGreaterThanOrEqual(3);
    await expect(fen.locator('.biblio-doublons')).toHaveCount(0);
    await expect(fen.locator('.biblio-id-court')).toHaveCount(0);

    await page.evaluate(async () => {
        const biblio = db.getSync('bibliothequeEchelles', []) || [];
        await db.set('bibliothequeEchelles', biblio.concat([{ id: 'ECH_HOMONYME_BANC', nom: 'IDME 4 niv',   // security-ok: fixture littérale écrite par le banc, aucune source externe
            niveaux: [{ nom: 'Maîtrisé', code: 'M', min: 0, max: 100, valeurCalcul: 80 }] }]));
        await afficherBibliothequeEchelles();
    });
    await expect(fen.locator('.biblio-doublons')).toHaveCount(1);
    const lieux = await fen.locator('.biblio-doublon-lieu').allTextContents();
    expect(lieux).toContain('Dans ce trimestre');
    expect(lieux).toContain('Dans ta bibliothèque');
    expect(lieux.filter(l => !['Dans ce trimestre', 'Dans ta bibliothèque'].includes(l))).toEqual([]);
    const porteurs = await fen.locator('.biblio2-rangee .biblio-id-court').evaluateAll(cs => cs.map(c => c.closest('.biblio2-rangee').getAttribute('data-biblio-item-id')));
    expect(porteurs.length, 'la puce sur les rangées nommées').toBeGreaterThanOrEqual(2);
    expect(porteurs).toContain('ECH_HOMONYME_BANC');
    await fen.locator('.biblio-doublons [data-action="BibliothequeUI.voirItemDoublon"][data-param="ECH_HOMONYME_BANC"]').click();
    await expect(fen.locator('.biblio2-rangee[data-biblio-item-id="ECH_HOMONYME_BANC"]')).toHaveClass(/biblio-carte--pointee/);

    const toutes = await cibles(page, FAMILLES.echelles.sel);
    expect(toutes.length, 'la tranche des cibles n’est pas vide').toBeGreaterThan(12);
    expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
});

test('mesure : garder une échelle crée un exemplaire séparé (la phrase « Ce que tu y modifies… » dit vrai)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'echelles', 1440, 900);
    await ouvrirBibliotheque(page, 'echelles');
    await rangee(page, 'echelles', 'trimestre', 'IDME 4 niv').locator('.biblio2-passage').click();
    await expect(rangee(page, 'echelles', 'trimestre', 'IDME 4 niv').locator('.biblio2-etat')).toHaveCount(1);
    const mesure = await page.evaluate(async () => {
        const id = (db.getSync(cle('echellesTemplates'), []) || []).find(e => e.nom === 'IDME 4 niv').id;
        await db.modifier(cle('echellesTemplates'), (lues) => {
            const e = lues.find(x => x.id === id);
            e.nom = 'IDME 4 niv modifiée';
            e.niveaux[0].nom = 'Niveau modifié';
            return lues;
        }, []);
        const exemplaire = (db.getSync('bibliothequeEchelles', []) || []).find(e => e.id === id);
        return { nom: exemplaire.nom, niveau: exemplaire.niveaux[0].nom };
    });
    expect(mesure.nom).toBe('IDME 4 niv');
    expect(mesure.niveau).not.toBe('Niveau modifié');
});

// ────────────────────────────────────────── CARTOUCHES ──────────────────────────────────────────

test('cartouches : les deux titres, les boutons du milieu partis, « Importer ou exporter ▾ » et ses actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'cartouches', 1440, 900);
    await ouvrirBibliotheque(page, 'cartouches');

    await expect(colonne(page, 'cartouches', 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(\d+\)$/);
    await expect(colonne(page, 'cartouches', 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(\d+\)$/);
    const libelles = await page.locator(FAMILLES.cartouches.sel + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length).toBeGreaterThan(10);
    for (const ancien of ['Exporter toutes mes cartouches (JSON)', 'Importer des cartouches (JSON)', 'Importer un partage (.lcz)',
        'Ajouter à ma sélection', 'Tout garder dans ma bibliothèque']) {
        expect(libelles, ancien).not.toContain(ancien);
    }
    await eprouverMenuFichiers(page, 'cartouches', {
        importer: 'Importer des cartouches', exporter: 'Exporter les cartouches de ce trimestre',
        champ: 'fichier-import-cartouches-modal', onChange: 'importerCartouches', actionExporter: 'exporterCartouches'
    });
});

test('cartouches : les intertitres de grille dans les deux colonnes ; « Filtrer par grille » filtre la bibliothèque ; aucun passage dans ce trimestre', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'cartouches', 1440, 900);
    await semerCartouchesBibliotheque(page, [
        cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4'),
        cartoucheFictive('CART_BANC_B', 'Cartouche fictive B', 'GRILLE_FICTIVE_ABSENTE', 'Grille fictive absente')
    ]);
    await ouvrirBibliotheque(page, 'cartouches');

    // « Dans ce trimestre » : les grilles de la démo, en ordre, chacune avant ses cartouches.
    const trimestre = colonne(page, 'cartouches', 'trimestre').locator('.biblio2-liste').first();
    await expect(trimestre.locator(':scope > .biblio2-groupe h4')).toHaveText(['Grille-4', 'Grille-5 FR-ALGO-20 H26', 'Grille-5 FR-HOLIS-20 H26']);
    const ordre = await trimestre.locator(':scope > li').evaluateAll(lis => lis.map(li => li.classList.contains('biblio2-groupe')
        ? '# ' + li.textContent.trim() : li.querySelector('.biblio2-rangee-nom span:last-child').textContent.trim()));
    expect(ordre.indexOf('Stratégies de lecture'), 'le nom est lu').toBeGreaterThan(0);
    expect(ordre[0]).toBe('# Grille-4');
    expect(ordre.indexOf('Stratégies de lecture')).toBeLessThan(ordre.indexOf('# Grille-5 FR-ALGO-20 H26'));
    expect(ordre.indexOf('Analyse littéraire')).toBeGreaterThan(ordre.indexOf('# Grille-5 FR-ALGO-20 H26'));

    // Aucune rangée du trimestre ne porte de passage (consigne, § 2.2), sur une tranche non vide.
    const nbTrimestre = await trimestre.locator(':scope > .biblio2-rangee').count();
    expect(nbTrimestre).toBeGreaterThanOrEqual(9);
    await expect(trimestre.locator('.biblio2-passage')).toHaveCount(0);

    // « Dans ta bibliothèque » : ses intertitres, puis le filtre de la barre.
    const biblio = colonne(page, 'cartouches', 'bibliotheque').locator('.biblio2-liste').first();
    await expect(biblio.locator(':scope > .biblio2-groupe h4')).toHaveText(['Grille fictive absente', 'Grille-4']);
    const filtre = page.locator(FAMILLES.cartouches.sel + ' .biblio2-barre select');
    await expect(filtre).toHaveAttribute('aria-label', 'Filtrer par grille');
    await expect(filtre.locator('option')).toHaveText(['Toutes les grilles', 'Grille fictive absente', 'Grille-4']);
    await expect(page.locator(FAMILLES.cartouches.sel + ' .biblio2-barre label')).toHaveText('Masquer ce qui est déjà dans ce trimestre');
    await filtre.selectOption('Grille-4');
    await expect(biblio.locator(':scope > .biblio2-rangee:visible .biblio2-rangee-nom')).toHaveText([/Cartouche fictive A$/]);
    await expect(biblio.locator(':scope > .biblio2-groupe:visible h4')).toHaveText(['Grille-4']);
    await filtre.selectOption('');
    await expect(biblio.locator(':scope > .biblio2-rangee:visible')).toHaveCount(2);
    // Le filtre ne touche pas « Dans ce trimestre ».
    await filtre.selectOption('Grille fictive absente');
    await expect(trimestre.locator(':scope > .biblio2-rangee:visible')).toHaveCount(nbTrimestre);
});

test('cartouches : ← Utiliser ; la cartouche ramenée dit « Aussi » ; sa suppression garde l’exemplaire et le dit ; sans exemplaire, rien', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 'cartouches', 1440, 900);
    const questions = [];
    page.on('dialog', (d) => { if (/^Supprimer définitivement la cartouche/.test(d.message())) questions.push(d.message()); });
    const DEUX = 'Cartouche fictive des deux colonnes';
    await semerCartouchesBibliotheque(page, [
        cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4'),
        cartoucheFictive('CART_BANC_DEUX', DEUX, GRILLE_4, 'Grille-4')
    ]);
    // La même cartouche, sous le même `id`, aussi dans sa grille de ce trimestre (un stock d'avant le lot).
    await page.evaluate(async ([g, c]) => {
        const lot = db.getSync(cle('cartouches_' + g), []) || [];
        await db.set(cle('cartouches_' + g), lot.concat([{ ...c, dansBibliotheque: true }]));   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, [GRILLE_4, cartoucheFictive('CART_BANC_DEUX', DEUX, GRILLE_4, 'Grille-4')]);
    await ouvrirBibliotheque(page, 'cartouches');

    // Présente des deux côtés : « Supprimer définitivement » la retire de ce trimestre, l'exemplaire reste.
    const deux = rangee(page, 'cartouches', 'trimestre', DEUX);
    await expect(deux.locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await deux.locator('.biblio2-kebab').click();
    await deux.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
    await expect(rangee(page, 'cartouches', 'trimestre', DEUX)).toHaveCount(0);
    await expect(rangee(page, 'cartouches', 'bibliotheque', DEUX)).toHaveCount(1);
    expect(await page.evaluate(() => (db.getSync('bibliothequeCartouches', []) || []).map(c => c.id)),
        'l’exemplaire de la bibliothèque reste').toContain('CART_BANC_DEUX');

    const rb = () => rangee(page, 'cartouches', 'bibliotheque', 'Cartouche fictive A');
    await expect(rb().locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await rb().locator('.biblio2-passage').click();
    const rt = () => rangee(page, 'cartouches', 'trimestre', 'Cartouche fictive A');
    await expect(rt()).toHaveCount(1);
    await expect(rt().locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rt().locator('.biblio2-passage')).toHaveCount(0);
    await expect(rb().locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    // Sous l'intertitre de sa grille.
    expect(await rt().evaluate(li => { let p = li.previousElementSibling; while (p && !p.classList.contains('biblio2-groupe')) p = p.previousElementSibling; return p && p.textContent.trim(); })).toBe('Grille-4');
    const ramenee = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || []).find(c => c.idOriginal === 'CART_BANC_A'), GRILLE_4);
    expect(ramenee, 'la cartouche est dans sa grille de ce trimestre').toBeTruthy();
    expect(ramenee.id).not.toBe('CART_BANC_A');

    // L'aperçu : les critères et leurs commentaires rédigés ; la ligne en clair. (La copie ramenée et son
    // exemplaire portent le même nom : le bandeau des doublons les nomme, #291, et la puce suit le texte.)
    await expect(rt().locator('.biblio2-rangee-meta')).toHaveText(/^3 commentaires(#\w+)?$/);
    await rt().locator('.biblio2-rangee-nom').click();
    const lignes = await rt().locator('.biblio2-apercu tr').evaluateAll(trs => trs.map(tr => [...tr.cells].map(td => td.textContent.trim())));
    expect(lignes.map(l => [l[0], l[2]])).toEqual([['Critère fictif', '2 commentaires'], ['Second critère fictif', '1 commentaire']]);

    // Supprimer définitivement : elle quitte ce trimestre, l'exemplaire reste, la question le dit.
    await rt().locator('.biblio2-kebab').click();
    await rt().getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
    await expect(rt()).toHaveCount(0);
    await expect(rb()).toHaveCount(1);
    expect(await page.evaluate(() => (db.getSync('bibliothequeCartouches', []) || []).map(c => c.id))).toContain('CART_BANC_A');

    // Une cartouche de la démo, sans exemplaire : la question sans la phrase.
    const sans = rangee(page, 'cartouches', 'trimestre', 'Carte mentale');
    await sans.locator('.biblio2-kebab').click();
    await sans.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
    await expect(rangee(page, 'cartouches', 'trimestre', 'Carte mentale')).toHaveCount(0);

    expect(questions).toHaveLength(3);
    expect(questions[0]).toBe(`Supprimer définitivement la cartouche «${DEUX}» de sa grille « Grille-4 » ?\n\n`
        + 'Son exemplaire de ta bibliothèque reste.\n\nCette action est irréversible.');
    expect(questions[1]).toBe('Supprimer définitivement la cartouche «Cartouche fictive A» de sa grille « Grille-4 » ?\n\n'
        + 'Son exemplaire de ta bibliothèque reste.\n\nCette action est irréversible.');
    expect(questions[2]).not.toContain('bibliothèque');
    expect(questions[2]).not.toContain('Bibliothèque');
});

test('cartouches : ⋮, les libellés et leurs actions ; une cartouche retirée se retrouve dans la bibliothèque et revient', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'cartouches', 1440, 900);
    await semerCartouchesBibliotheque(page, [cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4')]);
    await ouvrirBibliotheque(page, 'cartouches');
    const ouvrirMenu = async (r) => { await r.locator('.biblio2-kebab').click(); return r.locator('.biblio-menu-popover.actif'); };

    const rt = () => rangee(page, 'cartouches', 'trimestre', 'Carte mentale');
    const id = await rt().getAttribute('data-biblio-item-id');
    let menu = await ouvrirMenu(rt());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter pour partager', 'Retirer de ce trimestre', 'Supprimer définitivement']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Retirer de ce trimestre', 'Supprimer définitivement']);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
        window.__appels = [];
        const temoin = (nom) => (...a) => window.__appels.push([nom, ...a]);
        window.dupliquerCartoucheBibliotheque = temoin('dupliquerCartoucheBibliotheque');
        window.partageExport.exporterPourPartager = temoin('exporterPourPartager');
        window.supprimerCartoucheDefinitivement = temoin('supprimerCartoucheDefinitivement');
        window.supprimerCartoucheDeBibliothequePartagee = temoin('supprimerCartoucheDeBibliothequePartagee');
    });
    for (const libelle of ['Dupliquer', 'Exporter pour partager', 'Supprimer définitivement']) {
        menu = await ouvrirMenu(rt());
        await menu.getByRole('menuitem', { name: libelle, exact: true }).click();
    }
    menu = await ouvrirMenu(rangee(page, 'cartouches', 'bibliotheque', 'Cartouche fictive A'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual([
        ['dupliquerCartoucheBibliotheque', id, GRILLE_4],
        ['exporterPourPartager', 'cartouche', id, GRILLE_4],
        ['supprimerCartoucheDefinitivement', id, GRILLE_4],
        ['supprimerCartoucheDeBibliothequePartagee', 'CART_BANC_A']
    ]);

    // « Retirer de ce trimestre » pour de vrai : elle quitte la colonne, se retrouve dans la bibliothèque
    // (comme dans la section 2 d'avant), sa ligne le dit, et « ← Utiliser » la remet.
    menu = await ouvrirMenu(rt());
    await menu.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(rt()).toHaveCount(0);
    const retiree = rangee(page, 'cartouches', 'bibliotheque', 'Carte mentale');
    await expect(retiree).toHaveCount(1);
    await expect(retiree.locator('.biblio2-rangee-meta')).toHaveText(/^Retirée de ce trimestre · /);
    await expect(retiree.locator('.biblio2-kebab'), 'aucun geste de bibliothèque sur ce qui n’y est pas').toHaveCount(0);
    await retiree.locator('.biblio2-passage').click();
    await expect(rt()).toHaveCount(1);
    await expect(rangee(page, 'cartouches', 'bibliotheque', 'Carte mentale')).toHaveCount(0);
    expect(await page.evaluate(([g, i]) => (db.getSync(cle('cartouches_' + g), []) || []).find(c => c.id === i).dansBibliotheque, [GRILLE_4, id])).toBe(true);
});

test('mesure : « ← Utiliser » crée une cartouche séparée (la phrase « Ce que tu y modifies… » dit vrai)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 'cartouches', 1440, 900);
    await semerCartouchesBibliotheque(page, [cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4')]);
    await ouvrirBibliotheque(page, 'cartouches');
    await rangee(page, 'cartouches', 'bibliotheque', 'Cartouche fictive A').locator('.biblio2-passage').click();
    await expect(rangee(page, 'cartouches', 'trimestre', 'Cartouche fictive A')).toHaveCount(1);
    const mesure = await page.evaluate(async (g) => {
        await db.modifier(cle('cartouches_' + g), (lues) => {
            const c = lues.find(x => x.idOriginal === 'CART_BANC_A');
            c.nom = 'Cartouche fictive A modifiée';
            c.commentaires.CR1_I = 'Commentaire modifié.';
            return lues;
        }, []);
        const exemplaire = (db.getSync('bibliothequeCartouches', []) || []).find(c => c.id === 'CART_BANC_A');
        return { nom: exemplaire.nom, commentaire: exemplaire.commentaires.CR1_I };
    }, GRILLE_4);
    expect(mesure).toEqual({ nom: 'Cartouche fictive A', commentaire: 'Commentaire fictif.' });
});

// ──────────────────────────────────────── 820 PX, CAPTURES ───────────────────────────────────────

for (const famille of ['echelles', 'cartouches']) {
    test(`${famille} à 820 px : les panneaux l’un sous l’autre, les flèches ↓ et ↑, 44 px`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page, famille, 820, 1180);
        if (famille === 'echelles') await semerEchelles(page, [{ id: 'ECH_BANC_BIBLIO', nom: 'Échelle fictive de la bibliothèque', niveaux: niveaux() }]);
        else await semerCartouchesBibliotheque(page, [cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4')]);
        await ouvrirBibliotheque(page, famille);

        const bt = await colonne(page, famille, 'trimestre').boundingBox();
        const bb = await colonne(page, famille, 'bibliotheque').boundingBox();
        expect(bt.y + bt.height, '« Dans ce trimestre » d’abord').toBeLessThanOrEqual(bb.y + 1);
        expect(Math.abs(bt.x - bb.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(bt.width - bb.width)).toBeLessThanOrEqual(2);

        const nomBiblio = famille === 'echelles' ? 'Échelle fictive de la bibliothèque' : 'Cartouche fictive A';
        expect(await texteVisible(rangee(page, famille, 'bibliotheque', nomBiblio).locator('.biblio2-passage'))).toBe('↑ Utiliser dans ce trimestre');
        if (famille === 'echelles') {
            expect(await texteVisible(rangee(page, famille, 'trimestre', 'IDME 4 niv').locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque ↓');
        }
        const toutes = await cibles(page, FAMILLES[famille].sel);
        expect(toutes.length).toBeGreaterThan(8);
        expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
    });
}

test('captures pour Grégoire : échelles et cartouches, Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1155 non posée');
    test.setTimeout(180000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    for (const famille of ['echelles', 'cartouches']) {
        await page.setViewportSize({ width: 1440, height: 900 });
        if (famille === 'echelles') {
            await ouvrirDemo(page, famille, 1440, 900);
            await semerEchelles(page, [{ id: 'ECH_BANC_BIBLIO', nom: 'Échelle fictive de la bibliothèque', niveaux: niveaux() }]);
        } else {
            await page.evaluate((s) => naviguerVers('conception', s), FAMILLES.cartouches.sousSection);
            await pause(page, 900);
            await semerCartouchesBibliotheque(page, [
                cartoucheFictive('CART_BANC_A', 'Cartouche fictive A', GRILLE_4, 'Grille-4'),
                cartoucheFictive('CART_BANC_B', 'Cartouche fictive B', 'GRILLE_FICTIVE_ABSENTE', 'Grille fictive absente')
            ]);
        }
        await ouvrirBibliotheque(page, famille);
        const premiere = colonne(page, famille, 'trimestre').locator('.biblio2-liste > .biblio2-rangee').first();
        await premiere.locator('.biblio2-rangee-nom').click();
        for (const sombre of [false, true]) {
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await colonne(page, famille, 'trimestre').locator('.biblio2-liste > .biblio2-rangee').nth(1).locator('.biblio2-kebab').click();
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
