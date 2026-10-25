import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1157=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1157 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1157 (25 oct. 2026) — LA BIBLIOTHÈQUE DES CARTES D'ALIGNEMENT EN DEUX COLONNES (lot 4 du plan du
// 24 oct.). Consigne : plans de travail/CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-4.md, § 1 et
// § 5 (et celles des lots 1 à 3).
//
// Dans le vrai index.html, depuis la démonstration, par le vrai bouton « Consulter la bibliothèque » de
// Conception › Carte d'alignement :
//   · les deux titres et leurs phrases, mot pour mot ; « Partager », « Ajouter » et « Importer une carte
//     (JSON) » partis ; « Importer ou exporter ▾ » : « Importer une carte », la note « Fichier .json » ;
//   · AUCUNE relation entre une carte et son exemplaire : aucun état calme, aucun « Tout garder », le
//     passage reste offert sur chaque rangée après un passage ;
//   · « Garder → » ouvre la fenêtre des métadonnées puis ajoute un exemplaire (annulée : rien) ;
//     « ← Utiliser » ajoute une carte au trimestre ;
//   · la ligne en clair (« 17 nœuds · 12 liens », le pluriel réel, « par <auteur> ») ; l'aperçu (la
//     description courte, l'auteur, la licence) ; une carte sans rien de plus n'a pas de bouton ;
//   · ⋮ des deux colonnes, libellés et actions ; la dernière carte du trimestre ne se supprime pas ;
//   · « Importer depuis un autre trimestre » au pied de « Dans ce trimestre », sans « Tout importer » ;
//     « Même cours » en tête, repli ouvert ;
//   · le défilement survit à un passage ; à 820 px, les panneaux empilés, ↓ et ↑ ; 44 px.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · menu : `_declencherImportAlignementFichier` → `_declencherImportAlignementFichierX` → « les deux
//     titres » ROUGIT ;
//   · passage : `passage:` retiré des rangées de la bibliothèque → « ← Utiliser » ROUGIT ;
//   · Garder → : `if (!metaCC) return;` retiré de `partagerAlignement` → « Garder → » ROUGIT ;
//   · ligne : `(nbNoeuds > 1 ? 's' : '')` → `'s'` dans `compteNoeudsLiens` → « la ligne en clair » ROUGIT ;
//   · aperçu : la ligne « Licence » retirée de `apercuAlignementBibliotheque` → ROUGIT ;
//   · ⋮ : « Supprimer définitivement » → `supprimerAlignementDeBibliotheque` → « ⋮ » ROUGIT ;
//   · dernière carte : `index.cartes.length <= 1` → `< 1` → « la dernière carte » ROUGIT ;
//   · import : `ouvert: reprises.length > 0` → `ouvert: false` → « Même cours » ROUGIT ;
//   · retouche (verdict du lot 4, § 2) : « de ce trimestre ? » → « du trimestre actif ? » → « ⋮ » ROUGIT ;
//     « de ce trimestre. » → « du trimestre actif. » → « la dernière carte » ROUGIT ; « le ramène » →
//     « en remet un exemplaire » dans l'aide → « l'aide » ROUGIT ;
//   · composant : le nom toujours en bouton (`var nom = r.apercu` → `var nom = true`) → « la ligne en
//     clair » ROUGIT.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const SEL = '#modalBibliothequeAlignements';
const NOM_DEMO = 'Écriture et littérature (démo)';

async function ouvrirDemo(page, largeur, hauteur) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
    await page.evaluate(() => naviguerVers('conception', 'carte'));
    await pause(page, 1200);
    await page.evaluate(() => {
        document.getElementById('transition-bandeau')?.remove();
        // La fenêtre du codex (#1007) a ses propres bancs ; les questions de l'app sont relevées ici.
        Codex.proposerAvantSuppression = async () => true;
        window.__questions = [];
        window.uiDialogues.confirmerAction = async (o) => { window.__questions.push(o.message); return true; };
    });
}

/** Le geste réel : le bouton « Consulter la bibliothèque » de la barre de la Carte. */
async function ouvrirBibliotheque(page) {
    await page.locator('#planif-btn-bibliotheque').click();
    await expect(page.locator(SEL + ' .biblio2-fenetre')).toBeVisible();
}

const colonne = (page, cle) => page.locator(SEL + ' .biblio2-panneau--' + cle);
const rangees = (page, cle) => colonne(page, cle).locator('.biblio2-liste').first().locator(':scope > .biblio2-rangee');
const rangee = (page, cle, nom) => rangees(page, cle).filter({ has: page.locator('.biblio2-rangee-nom', { hasText: nom }) });
const texteVisible = (loc) => loc.evaluate(e => e.innerText.replace(/\s+/g, ' ').trim());
const ouvrirMenu = async (r) => { await r.locator('.biblio2-kebab').click(); return r.locator('.biblio-menu-popover.actif'); };
const indexCartes = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.planificationDonnees.getIndex())));
const biblio = (page) => page.evaluate(() => db.getSync('bibliothequeAlignements', []) || []);

/** Des cartes fictives dans la bibliothèque. */
async function semerBibliotheque(page, items) {
    await page.evaluate(async (liste) => {
        const lues = db.getSync('bibliothequeAlignements', []) || [];
        await db.set('bibliothequeAlignements', lues.concat(liste));   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, items);
}
const noeud = (i) => ({ id: 'pl_banc_' + i, type: 'activite', titre: 'Bloc fictif ' + i, x: 100 * i, y: 100, enfants: [], parent: null });
const lien = (i) => ({ id: 'lien_banc_' + i, source: 'pl_banc_0', cible: 'pl_banc_' + i });
const carteFictive = (id, nom, nbNoeuds, nbLiens, extra) => Object.assign({
    id, nom, dateCreation: '2026-10-25', dateAjoutBiblio: '2026-10-25T12:00:00.000Z', dansBibliotheque: true,
    auteur: '', metadata_cc: null,
    donnees: {
        compteur: nbNoeuds, compteurLiens: nbLiens,
        noeuds: Array.from({ length: nbNoeuds }, (_, i) => noeud(i)),
        liens: Array.from({ length: nbLiens }, (_, i) => lien(i + 1))
    }
}, extra || {});

/** Toutes les cibles visibles de la fenêtre : 44 px au moins. */
const cibles = (page) => page.evaluate((s) => [...document.querySelector(s).querySelectorAll('button, select, summary, label, input[type="text"]')]
    .filter(e => e.getClientRects().length > 0)
    .map(e => { const b = e.getBoundingClientRect(); return { t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 40), h: Math.round(b.height), w: Math.round(b.width) }; }), SEL);

// ─────────────────────────────────────────── 1 440 PX ───────────────────────────────────────────

test('les deux titres, les boutons d’avant partis, « Importer ou exporter ▾ » et son action', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    await expect(colonne(page, 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(1\)$/);
    await expect(colonne(page, 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(1\)$/);
    await expect(colonne(page, 'trimestre').locator('.biblio2-phrase').first())
        .toHaveText('Les cartes d\'alignement que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.');
    await expect(colonne(page, 'bibliotheque').locator('.biblio2-phrase').first())
        .toHaveText('Les cartes d\'alignement que tu gardes pour tous tes trimestres.');

    const libelles = await page.locator(SEL + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length, 'la tranche des boutons n’est pas vide').toBeGreaterThan(4);
    for (const ancien of ['Partager', 'Ajouter', 'Importer une carte (JSON)']) expect(libelles, ancien).not.toContain(ancien);
    await expect(page.locator(SEL + ' .badge-source')).toHaveCount(0);

    const declencheur = page.locator(SEL + ' .biblio2-btn-fichiers');
    await expect(declencheur).toHaveText('Importer ou exporter ▾');
    await declencheur.click();
    const menu = page.locator(SEL + ' .biblio-menu-popover.actif');
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Importer une carte']);
    await expect(menu.locator('.biblio-menu-note')).toHaveText('Fichier .json');
    const [selecteur] = await Promise.all([
        page.waitForEvent('filechooser'),
        menu.getByRole('menuitem', { name: 'Importer une carte', exact: true }).click()
    ]);
    expect(await selecteur.element().getAttribute('id')).toBe('biblio-alignements-fichier-import');
    expect(await selecteur.element().getAttribute('data-on-change')).toBe('_importerAlignementFichierChange');
});

test('« Garder → » ouvre la fenêtre des métadonnées puis ajoute un exemplaire ; aucun état calme après', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await page.evaluate(() => {
        window.__metadonnees = [];
        window.__reponseMeta = null;   // d'abord : la fenêtre est annulée
        window.demanderMetadonneesEnrichies = async (type, nom) => { window.__metadonnees.push([type, nom]); return window.__reponseMeta; };
    });
    await ouvrirBibliotheque(page);
    const avant = (await biblio(page)).length;
    expect(avant).toBe(1);

    const rt = () => rangee(page, 'trimestre', NOM_DEMO);
    await expect(rt().locator('.biblio2-passage')).toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
    await rt().locator('.biblio2-passage').click();
    await pause(page, 400);
    expect(await page.evaluate(() => window.__metadonnees)).toEqual([['alignement pédagogique', NOM_DEMO]]);
    expect((await biblio(page)).length, 'annulée : rien n’est ajouté').toBe(avant);

    await page.evaluate(() => { window.__reponseMeta = { nom: 'Autrice fictive' }; });
    await rt().locator('.biblio2-passage').click();
    await expect(colonne(page, 'bibliotheque').locator('h3')).toHaveText('Dans ta bibliothèque (2)');
    const apres = await biblio(page);
    expect(apres.length).toBe(avant + 1);
    const neuf = apres[apres.length - 1];
    expect(neuf.nom).toBe(NOM_DEMO);
    expect(neuf.auteur).toBe('Autrice fictive');
    expect(neuf.id).not.toBe('carte_1');
    expect(neuf.metadata_cc.licence).toBe('CC BY-NC-SA 4.0');

    // Aucune relation : le passage reste offert, aucun état calme, aucun « Tout garder ».
    await expect(rt().locator('.biblio2-passage')).toHaveCount(1);
    expect(await rangees(page, 'bibliotheque').count(), 'la tranche des rangées n’est pas vide').toBe(2);
    await expect(page.locator(SEL + ' .biblio2-etat')).toHaveCount(0);
    await expect(page.locator(SEL + ' button', { hasText: 'Tout garder' })).toHaveCount(0);
    await expect(rangees(page, 'bibliotheque').locator('.biblio2-passage')).toHaveCount(2);
});

test('« ← Utiliser » ajoute une carte au trimestre ; le passage reste offert', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await semerBibliotheque(page, [carteFictive('ALI_BANC_1', 'Carte fictive Oméga', 3, 2)]);
    await ouvrirBibliotheque(page);
    const avant = await indexCartes(page);

    const rb = () => rangee(page, 'bibliotheque', 'Carte fictive Oméga');
    await expect(rb().locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await rb().locator('.biblio2-passage').click();
    await expect(rangee(page, 'trimestre', 'Carte fictive Oméga')).toHaveCount(1);
    const apres = await indexCartes(page);
    expect(apres.cartes.length).toBe(avant.cartes.length + 1);
    const neuve = apres.cartes.find(c => c.nom === 'Carte fictive Oméga');
    expect(neuve.id).not.toBe('ALI_BANC_1');
    expect(await page.evaluate((id) => window.planificationDonnees.chargerCarte(id).noeuds.length, neuve.id)).toBe(3);

    await expect(rb().locator('.biblio2-passage')).toHaveCount(1);
    await expect(rangee(page, 'trimestre', 'Carte fictive Oméga').locator('.biblio2-passage')).toHaveCount(1);
    await expect(page.locator(SEL + ' .biblio2-etat')).toHaveCount(0);
});

test('la ligne en clair, l’aperçu ; une carte sans rien de plus n’a pas de bouton', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await semerBibliotheque(page, [
        carteFictive('ALI_BANC_1', 'Carte fictive à un nœud', 1, 1),
        carteFictive('ALI_BANC_2', 'Carte fictive d’une autrice', 17, 12, {
            auteur: 'Autrice fictive',
            metadata_cc: { licence: 'CC BY 4.0', description_courte: 'Description fictive de la carte.' }
        })
    ]);
    await ouvrirBibliotheque(page);

    // Le trimestre : les comptes seulement ; aucun aperçu, le nom n'est pas un bouton.
    const rt = rangee(page, 'trimestre', NOM_DEMO);
    await expect(rt.locator('.biblio2-rangee-meta')).toHaveText(/^\d+ nœuds? · \d+ liens?$/);
    await expect(rt.locator('button.biblio2-rangee-nom')).toHaveCount(0);
    await expect(rt.locator('.biblio2-rangee-nom--fixe')).toHaveText(NOM_DEMO);
    await expect(rt.locator('.biblio2-apercu')).toHaveCount(0);
    await expect(page.locator(SEL)).not.toContainText('noeud');
    await expect(page.locator(SEL)).not.toContainText('(s)');

    // Le pluriel réel ; sans auteur ni description ni licence : pas d'aperçu, pas de bouton.
    const un = rangee(page, 'bibliotheque', 'Carte fictive à un nœud');
    await expect(un.locator('.biblio2-rangee-meta')).toHaveText('1 nœud · 1 lien');
    await expect(un.locator('button.biblio2-rangee-nom')).toHaveCount(0);

    // « par <auteur> » ; l'aperçu : la description courte, l'auteur, la licence.
    const autrice = rangee(page, 'bibliotheque', 'Carte fictive d’une autrice');
    await expect(autrice.locator('.biblio2-rangee-meta')).toHaveText('17 nœuds · 12 liens · par Autrice fictive');
    const nom = autrice.locator('button.biblio2-rangee-nom');
    await expect(nom).toHaveAttribute('aria-expanded', 'false');
    await nom.click();
    await expect(nom).toHaveAttribute('aria-expanded', 'true');
    const apercu = autrice.locator('.biblio2-apercu');
    await expect(apercu).toBeVisible();
    await expect(apercu.locator('.biblio2-apercu-texte')).toHaveText('Description fictive de la carte.');
    expect(await apercu.locator('tr').evaluateAll(trs => trs.map(t => t.innerText.replace(/\s+/g, ' ').trim())))
        .toEqual(['Auteur Autrice fictive', 'Licence CC BY 4.0']);
    await nom.click();
    await expect(apercu).toBeHidden();

    // La carte de la démonstration : sa description et sa licence.
    const demo = rangee(page, 'bibliotheque', NOM_DEMO);
    await demo.locator('button.biblio2-rangee-nom').click();
    await expect(demo.locator('.biblio2-apercu')).toContainText('Carte démo d\'alignement pédagogique');
    await expect(demo.locator('.biblio2-apercu')).toContainText('CC BY-NC-SA 4.0');
});

test('⋮ : les libellés et leurs actions, dans les deux colonnes', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await semerBibliotheque(page, [carteFictive('ALI_BANC_1', 'Carte fictive Oméga', 2, 1)]);
    await page.evaluate(() => window.planificationCarte.dupliquerCarte(window.planificationDonnees.getIndex().active));
    await pause(page, 300);
    await ouvrirBibliotheque(page);
    expect(await rangees(page, 'trimestre').count()).toBe(2);

    const rt = rangees(page, 'trimestre').first();
    let menu = await ouvrirMenu(rt);
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter', 'Supprimer définitivement']);
    expect(await menu.locator('.biblio-menu-item').evaluateAll(bs => bs.map(b => b.getAttribute('data-action'))))
        .toEqual(['dupliquerAlignementDuTrimestre', 'exporterAlignementJSON', 'supprimerAlignementDuTrimestre']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Supprimer définitivement']);
    await page.keyboard.press('Escape');

    const rb = rangee(page, 'bibliotheque', 'Carte fictive Oméga');
    menu = await ouvrirMenu(rb);
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveCount(1);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    await expect(rangee(page, 'bibliotheque', 'Carte fictive Oméga')).toHaveCount(0);
    expect((await biblio(page)).some(i => i.id === 'ALI_BANC_1')).toBe(false);

    // « Supprimer définitivement » : la carte quitte le trimestre, sans phrase sur un exemplaire.
    const avant = await indexCartes(page);
    const cible = rangees(page, 'trimestre').last();
    const nomCible = (await cible.locator('.biblio2-rangee-nom').textContent()).trim();
    menu = await ouvrirMenu(cible);
    await menu.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
    await expect(rangees(page, 'trimestre')).toHaveCount(1);
    expect((await indexCartes(page)).cartes.length).toBe(avant.cartes.length - 1);
    const questions = await page.evaluate(() => window.__questions);
    expect(questions.some(q => q.includes(nomCible))).toBe(true);
    expect(questions.some(q => q.includes('exemplaire'))).toBe(false);
    // Retouche (verdict du lot 4, § 2.2) : « ce trimestre », plus « le trimestre actif ».
    expect(questions).toContain('Supprimer définitivement la carte « ' + nomCible + ' » de ce trimestre ?');
});

test('la dernière carte du trimestre ne se supprime toujours pas', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await page.evaluate(() => {
        window.__avertissements = [];
        const avant = notifications.warning;
        notifications.warning = (...a) => { window.__avertissements.push(a.join(' ')); return avant.apply(notifications, a); };
    });
    await ouvrirBibliotheque(page);
    expect((await indexCartes(page)).cartes.length).toBe(1);
    const menu = await ouvrirMenu(rangee(page, 'trimestre', NOM_DEMO));
    await menu.getByRole('menuitem', { name: 'Supprimer définitivement' }).click();
    await pause(page, 500);
    expect((await indexCartes(page)).cartes.length).toBe(1);
    expect(await page.evaluate(() => window.__questions)).toEqual([]);
    // Retouche (verdict du lot 4, § 2.2).
    expect(await page.evaluate(() => window.__avertissements)).toEqual(['Impossible de supprimer la dernière carte de ce trimestre.']);
    await expect(rangee(page, 'trimestre', NOM_DEMO)).toHaveCount(1);
});

test('l’aide « Comment fonctionne la bibliothèque » : le texte validé, « le ramène »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await page.evaluate(() => document.body.classList.add('aide-contextuelle-active'));
    await ouvrirBibliotheque(page);
    await page.locator(SEL + ' .biblio2-entete .btn-aide-contextuelle[data-aide="bibliotheque-fonctionnement"]').click();
    const modale = page.locator('.aide-contextuelle-modal.active');
    await expect(modale.locator('#aide-ctx-titre')).toHaveText('Comment fonctionne la bibliothèque');
    const texte = await texteVisible(modale.locator('.aide-contextuelle-body'));
    expect(texte).toContain('« Dans ta bibliothèque » : ce que tu gardes pour tous tes trimestres.');
    expect(texte).toContain('S\'il est dans ta bibliothèque, « ← Utiliser dans ce trimestre » le ramène.');
    for (const ancien of ['badges de source', 'ta sélection', 'Disponibles']) expect(texte, ancien).not.toContain(ancien);
});

test('« Importer depuis un autre trimestre » au pied de « Dans ce trimestre » ; « Même cours » en tête, repli ouvert', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    // Le contenu de l'import a son banc (planif-toolbar, « import inter-trimestre ») ; ici, sa place et ses mots.
    await page.evaluate(() => {
        window.planificationDonnees.listerTrimestresAvecCartes = () => [{ id: 'h9099', nom: 'Hiver 9099 (fictif)',
            cartes: [{ id: 'carte_1', nom: 'Carte fictive d’hiver', nbNoeuds: 3 }] }];
        window.__reprises = [];
        window.planificationCarte.reprisesDisponibles = () => window.__reprises;
    });
    await ouvrirBibliotheque(page);
    await expect(colonne(page, 'bibliotheque').locator('details[data-repli="import-trimestre"]')).toHaveCount(0);
    let repli = colonne(page, 'trimestre').locator('details[data-repli="import-trimestre"]');
    await expect(repli).toHaveCount(1);
    await expect(repli.locator('summary')).toHaveText('Importer depuis un autre trimestre');
    expect(await repli.evaluate(d => d.open), 'sans carte du même cours : replié').toBe(false);
    await expect(repli.getByRole('button', { name: 'Tout importer', includeHidden: true })).toHaveCount(0);
    await expect(page.locator('#biblio-alignements-meme-cours')).toHaveCount(0);

    await repli.locator('summary').click();
    await expect(page.locator('#biblio-alignements-import-trimestre option')).toHaveText(['-- Choisir un trimestre --', 'Hiver 9099 (fictif) (1 carte)']);
    await page.selectOption('#biblio-alignements-import-trimestre', 'h9099');
    await repli.getByRole('button', { name: 'Voir les cartes' }).click();
    const cartes = page.locator('#biblio-alignements-cartes-trimestre');
    await expect(cartes).toBeVisible();
    await expect(cartes.locator('.biblio2-import-rangee')).toHaveText(/Carte fictive d’hiver\s*3 nœuds\s*Importer/);

    // « Même cours » : en tête, repli ouvert d'emblée, « Reprendre ».
    await page.evaluate(() => {
        window.__reprises = [{ trimestreId: 'h9099', trimestreNom: 'Hiver 9099 (fictif)', carte: { id: 'carte_1', nom: 'Carte fictive d’hiver' } }];
        BibliothequeUI.fermerFenetre('modalBibliothequeAlignements');
    });
    await ouvrirBibliotheque(page);
    repli = colonne(page, 'trimestre').locator('details[data-repli="import-trimestre"]');
    expect(await repli.evaluate(d => d.open)).toBe(true);
    const meme = page.locator('#biblio-alignements-meme-cours');
    await expect(meme.locator('.biblio2-import-groupe')).toHaveText('Même cours');
    const reprendre = meme.getByRole('button', { name: 'Reprendre' });
    await expect(reprendre).toHaveAttribute('data-action', 'importerCarteTrimestreVersActif');
    await expect(reprendre).toHaveAttribute('data-param', 'h9099');
    await expect(reprendre).toHaveAttribute('data-param2', 'carte_1');
    await expect(meme.locator('.biblio2-import-rangee')).toHaveText(/Carte fictive d’hiver\s*Hiver 9099 \(fictif\)\s*Reprendre/);
});

// ──────────────────────────────────────── 820 PX, CAPTURES ───────────────────────────────────────

test('à 820 px : les panneaux l’un sous l’autre, les flèches ↓ et ↑, 44 px ; le défilement survit à un passage', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 820, 1180);
    await semerBibliotheque(page, Array.from({ length: 8 }, (_, i) => carteFictive('ALI_BANC_' + i, 'Carte fictive n° ' + (i + 1), 2, 1)));
    await ouvrirBibliotheque(page);

    const bt = await colonne(page, 'trimestre').boundingBox();
    const bb = await colonne(page, 'bibliotheque').boundingBox();
    expect(bt.y + bt.height, '« Dans ce trimestre » d’abord').toBeLessThanOrEqual(bb.y + 1);
    expect(Math.abs(bt.x - bb.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(bt.width - bb.width)).toBeLessThanOrEqual(2);
    expect(await texteVisible(rangee(page, 'bibliotheque', 'Carte fictive n° 8').locator('.biblio2-passage'))).toBe('↑ Utiliser dans ce trimestre');
    expect(await texteVisible(rangee(page, 'trimestre', NOM_DEMO).locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque ↓');

    const toutes = await cibles(page);
    expect(toutes.length).toBeGreaterThan(8);
    expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);

    // Le défilement : la fenêtre redessinée après « ← Utiliser » reste où l'on était.
    const fenetre = page.locator(SEL + ' .biblio2-fenetre');
    await rangee(page, 'bibliotheque', 'Carte fictive n° 8').scrollIntoViewIfNeeded();
    const avant = await fenetre.evaluate(f => f.scrollTop);
    expect(avant, 'la fenêtre défile').toBeGreaterThan(100);
    await rangee(page, 'bibliotheque', 'Carte fictive n° 8').locator('.biblio2-passage').click();
    await expect(rangee(page, 'trimestre', 'Carte fictive n° 8')).toHaveCount(1);
    expect(Math.abs(await page.locator(SEL + ' .biblio2-fenetre').evaluate(f => f.scrollTop) - avant)).toBeLessThanOrEqual(2);
});

test('captures pour Grégoire : la Carte, Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1157 non posée');
    test.setTimeout(180000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    await ouvrirDemo(page, 1440, 900);
    await semerBibliotheque(page, [
        carteFictive('ALI_BANC_1', 'Carte fictive d’une autrice', 17, 12, {
            auteur: 'Autrice fictive',
            metadata_cc: { licence: 'CC BY 4.0', description_courte: 'Description fictive de la carte.' }
        }),
        carteFictive('ALI_BANC_2', 'Carte fictive à un nœud', 1, 1)
    ]);
    await page.evaluate(() => window.planificationCarte.dupliquerCarte(window.planificationDonnees.getIndex().active));
    await pause(page, 300);
    await ouvrirBibliotheque(page);
    // La bulle d'aide du bouton « Consulter la bibliothèque » reste sous la souris et couvrirait une rangée.
    await page.mouse.move(5, 5);
    await rangee(page, 'bibliotheque', NOM_DEMO).locator('button.biblio2-rangee-nom').click();
    for (const sombre of [false, true]) {
        await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
        await rangees(page, 'trimestre').first().locator('.biblio2-kebab').click();
        await pause(page, 300);
        await page.screenshot({ path: path.join(dossierCaptures, `carte-mac-1440-${sombre ? 'sombre' : 'clair'}.png`) });
        await page.keyboard.press('Escape');
    }
    await page.evaluate(() => document.body.classList.toggle('mode-clair', true));
    await page.setViewportSize({ width: 820, height: 1180 });
    await pause(page, 400);
    await page.screenshot({ path: path.join(dossierCaptures, 'carte-ipad-820-clair.png') });
    await page.keyboard.press('Escape');
    await expect(page.locator(SEL)).toHaveCount(0);
});
