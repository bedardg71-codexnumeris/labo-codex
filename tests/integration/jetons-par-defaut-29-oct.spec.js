import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 29 oct. 2026 — LES JETONS PAR DÉFAUT, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md`, § 2). La pratique active de la démonstration ne règle
// pas ses jetons : le moteur les offre, et le formulaire le dit maintenant (case cochée ; avant : décochée). Avec un
// « non » explicite de l'assistant (`configuration.jetons = { activer: false }`), Annoter ne propose plus « Jeton de
// reprise » (avant : proposé, le « non » n'étant pas lu). L'unitaire (sentinelle-jetons-par-defaut-2026-10-29) juge le
// moteur, l'assistant et les modèles ; ici, que l'écran l'affiche. Données de la démonstration (fictives).
//
// ↻ RÉÉCRIT LE 28 NOV. 2026 — SANS DÉCLARATION, PAS DE JETONS, POUR LES ANCIENNES PRATIQUES AUSSI (décision de Grégoire,
// 8 h 42). Une pratique sans réglage de jetons n'en offre plus : sa fiche s'affiche DÉCOCHÉE, l'enregistrer sans toucher
// aux jetons n'écrit aucun bloc, et Annoter ne propose plus « Jeton de reprise ». Du 29 oct. au 28 nov., le moteur lui
// prêtait le défaut (2 / 2 / 2) et la case s'affichait cochée. La démonstration déclarera ses jetons dans le pack, à la
// release (9 h 05) : d'ici là, ce banc pose lui-même cette déclaration quand il en a besoin (`DECLARATION`).

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForFunction(() => typeof window.obtenirIdPratiqueActive === 'function' && !!window.obtenirIdPratiqueActive(), null, { timeout: 20000 });
    return page.evaluate(() => window.obtenirIdPratiqueActive());
}

/** Pose (ou retire) le réglage de jetons de la pratique active, comme l'assistant l'écrit. */
const poserReglage = (page, id, jetons) => page.evaluate(({ id, jetons }) => {
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
    const p = liste.find(x => x.id === id);
    p.configuration = Object.assign({}, p.configuration || {});
    if (jetons) p.configuration.jetons = jetons; else delete p.configuration.jetons;
    delete p.jetons;
    if (p.config) delete p.config.jetons;
    db.setSync(cle('pratiquesConfigurables'), liste);
}, { id, jetons });

/** Annoter : déposer un fichier, rendre l'étape 2 de l'import ; rend les valeurs du menu « Production ». */
const optionsProduction = async (page) => {
    await page.evaluate(async () => {
        const f = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], 'copie.pdf', { type: 'application/pdf' });
        window.travauxImport.viderFileDAttente();
        await window.travauxImport.ajouterFichiersEnAttente([f]);
        window.travauxUI.afficherImport();
    });
    const menu = page.locator('#pipeline-select-production');
    await expect(menu).toBeAttached();
    return menu.locator('option').evaluateAll(os => os.map(o => o.value));
};

/** La déclaration de jetons que les pratiques de la démonstration porteront dans le pack (valeurs de l'ancien défaut). */
const DECLARATION = { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
    repriseCiblee: { actif: true, nombre: 2, plafondNote: null } };

/** Pose le bloc `jetons` à la racine de la pratique (là où le pack le portera), ou le retire. */
const poserDeclaration = (page, id, jetons) => page.evaluate(({ id, jetons }) => {
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
    const p = liste.find(x => x.id === id);
    if (p.configuration) delete p.configuration.jetons;
    if (jetons) p.jetons = jetons; else delete p.jetons;
    db.setSync(cle('pratiquesConfigurables'), liste);
}, { id, jetons });

const pratiqueRangee = (page, id) => page.evaluate((id) => (db.getSync(cle('pratiquesConfigurables'), []) || []).find(x => x.id === id), id);

test('le formulaire : sans réglage, la case s\'affiche DÉCOCHÉE ; avec le « non » de l\'assistant, décochée et inerte', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const id = await ouvrirDemo(page);
    await poserReglage(page, id, null);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await page.evaluate((id) => chargerPratiquePourModif(id), id);
    await expect(page.locator('#mat-jetons-actif')).not.toBeChecked();   // ↻ 28 nov. 2026 : cochée du 29 oct. au 28 nov.
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toBeHidden();
    await expect(page.locator('#mat-jetons-actif')).toBeEnabled();

    await poserReglage(page, id, { activer: false });
    await page.evaluate((id) => chargerPratiquePourModif(id), id);
    await expect(page.locator('#mat-jetons-actif')).not.toBeChecked();
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toBeVisible();
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toHaveText(/ne peut pas les modifier\.\s*$/);
    expect(erreurs).toEqual([]);
});

test('une cumulative sans réglage : enregistrer sans toucher aux jetons n\'écrit aucun bloc et laisse CUM ; cocher écrit le bloc et le badge passe HYB', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirDemo(page);
    // Une pratique de type sommative, sans aucun réglage de jetons (une pratique d'avant le 29 oct.).
    await page.evaluate(() => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
        liste.push({ id: 'PR_BANC_SANS_REGLAGE', nom: 'Cumulative du banc', type: 'sommative', pratiques: ['SOM'], dansBibliotheque: true,
            calcul_note: { methode: 'moyenne_ponderee' }, configuration: {} });
        db.setSync(cle('pratiquesConfigurables'), liste);
    });
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await page.evaluate(() => chargerPratiquePourModif('PR_BANC_SANS_REGLAGE'));
    const badge = page.locator('#mat-badge-pratique .badge-type-pratique');
    await expect(page.locator('#mat-jetons-actif')).not.toBeChecked();
    await expect(badge).toHaveText('CUM');

    // Un champ voisin change (la description) : la fiche s'enregistre, sans bloc de jetons.
    await page.evaluate(async () => {
        document.getElementById('mat-pratique-description').value = 'Une description changée';
        await sauvegarderConfigPratiqueMat();
    });
    let rangee = await pratiqueRangee(page, 'PR_BANC_SANS_REGLAGE');
    expect(rangee.description).toBe('Une description changée');   // l'enregistrement a bien eu lieu
    expect('jetons' in rangee).toBe(false);
    expect(rangee.configuration.jetons).toBeUndefined();
    await expect(badge).toHaveText('CUM');
    expect(await page.evaluate(() => window.configJetonsDeclareeDeLaPratique((db.getSync(cle('pratiquesConfigurables'), []) || []).find(x => x.id === 'PR_BANC_SANS_REGLAGE')))).toBeNull();

    // L'enseignant·e coche « Activer le système de jetons » : le bloc s'écrit, la famille devient hybride.
    await page.evaluate(async () => {
        document.getElementById('mat-jetons-actif').checked = true;
        await sauvegarderConfigPratiqueMat();
    });
    rangee = await pratiqueRangee(page, 'PR_BANC_SANS_REGLAGE');
    expect(rangee.jetons).toMatchObject({ actif: true, nombre: 2 });
    await expect(badge).toHaveText('HYB');
    await expect(badge).toHaveAttribute('title', 'Hybride : cette pratique offre des jetons de reprise.');
    expect(erreurs).toEqual([]);
});

test('Annoter : « Jeton de reprise » n\'est PAS proposé sans réglage ; il l\'est quand la pratique déclare ses jetons ; plus après un « non »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const id = await ouvrirDemo(page);
    await poserReglage(page, id, null);
    expect(await optionsProduction(page)).not.toContain('__jeton_reprise__');   // ↻ 28 nov. 2026 : proposé du 29 oct. au 28 nov.
    await poserDeclaration(page, id, DECLARATION);                              // ce que le pack portera à la release
    expect(await optionsProduction(page)).toContain('__jeton_reprise__');
    await poserReglage(page, id, { activer: false });
    expect(await optionsProduction(page)).not.toContain('__jeton_reprise__');
    expect(erreurs).toEqual([]);
});
