import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 31 oct. 2026 — UNE COPIE FAITE PENDANT LA DÉMO REJOINT LA BIBLIOTHÈQUE (grille seulement ; les quatre
// autres familles sont arrêtées à l'étape 0 : plans de travail/RAPPORT-2026-10-31-copie-demo-bibliotheque.md).
// Le parcours entier, avec un vrai rechargement avant le vrai trimestre. Noms fictifs.

const LIGNE = 'Cette copie reste dans la démo. Quand elle est prête, garde-la dans ta bibliothèque pour la retrouver dans tes vrais trimestres.';
const SOURCE = 'GRILLE_DEMO_1759243306842';

async function ouvrirSection(page) {
    await page.evaluate(() => {
        // La section des grilles, pour que les clics du banc soient de vrais clics.
        let n = document.getElementById('conteneurEditionGrille');
        while (n && n !== document.body) { n.classList.remove('u-hide'); n.style.display = n.style.display === 'none' ? 'block' : n.style.display; if (n.classList.contains('sous-section') || n.classList.contains('section')) n.classList.add('active'); n = n.parentElement; }
    });
}

async function demarrer(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 30000 });
    await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'a2031', nom: 'Automne 2031 (fictif)', session: 'A', annee: '2031', actif: true }]);
        await changerTrimestreActif('a2031');
    });
    return erreurs;
}

/** En démo : ouvre la grille du pack et clique « Dupliquer pour créer ma grille ». Rend l'id de la copie. */
async function dupliquerEnDemo(page) {
    await page.evaluate(async () => { await activerModeDemo(); });
    await page.waitForFunction(() => db.getSync('demo-actif', null) === 'true' && cle('grillesTemplates') === 'demo_grillesTemplates');
    await page.evaluate((id) => chargerGrillePourModif(id), SOURCE);
    await ouvrirSection(page);
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie'), 'la grille du pack n\'a pas la ligne').toHaveCount(0);
    const avant = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).map((g) => g.id));
    await page.locator('#conteneurEditionGrille .bandeau-demo-readonly-btn[data-action="dupliquerEtEditerGrille"]').click();
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(1);
    return page.evaluate((ids) => db.getSync(cle('grillesTemplates'), []).find((g) => !ids.includes(g.id)).id, avant);
}

const biblioGrille = (page, id) => page.evaluate((i) => (db.getSync('bibliothequeGrilles', []) || []).find((g) => g.id === i) || null, id);

test('le parcours : copie en démo, Garder, sortie, nouveau pack, rechargement, Utiliser dans ce trimestre', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    const copieId = await dupliquerEnDemo(page);

    const ligne = page.locator('#conteneurEditionGrille .bandeau-demo-copie');
    await expect(ligne).toContainText(LIGNE);
    const bouton = ligne.getByRole('button', { name: 'Garder dans ma bibliothèque' });
    await expect(bouton).toHaveAttribute('data-action', 'garderGrilleDansBibliotheque');
    await expect(bouton).toHaveAttribute('data-param', copieId);
    expect((await bouton.boundingBox()).height, 'cible tactile de l\'iPad').toBeGreaterThanOrEqual(44);
    expect(await biblioGrille(page, copieId), 'rien ne s\'écrit sans le geste').toBeNull();

    // Le nom saisi juste avant le clic : le geste doit garder la copie renommée.
    await page.locator('#nomGrilleTemplate').fill('Ma grille fictive');
    await bouton.click();
    await expect(ligne).toHaveText('Aussi dans ta bibliothèque');
    await expect(page.locator('#modalBibliothequeGrilles'), 'la fenêtre ne s\'ouvre pas par-dessus l\'édition').toHaveCount(0);
    const gardee = await biblioGrille(page, copieId);
    expect(gardee.nom).toBe('Ma grille fictive');
    expect(gardee.inspireDe.auteur).toBe('Labo Codex');

    // L'exemplaire est un instantané : ce qui change ensuite dans la démo ne le suit pas (rapport, § limites).
    await page.locator('#nomGrilleTemplate').fill('Autre nom fictif');
    await page.evaluate(() => sauvegarderGrilleTemplate(true));
    expect((await biblioGrille(page, copieId)).nom).toBe('Ma grille fictive');

    // Sortie de la démo, puis nouvelle version du pack : la copie de démo part, l'exemplaire reste.
    await page.evaluate(async () => {
        await desactiverModeDemo();
        localStorage.setItem('demo-version-installee', 'ancienne');
        await initialiserDemoNamespace();
    });
    await expect(ligne, 'hors démo, la ligne a disparu').toHaveCount(0);
    expect(await page.evaluate((i) => db.getSync('demo_grillesTemplates', []).some((g) => g.id === i), copieId)).toBe(false);
    expect(await biblioGrille(page, copieId)).not.toBeNull();

    await page.reload();
    await page.waitForFunction(() => window.dbReady === true && typeof window.ajouterGrilleIndividuelle === 'function' && cle('grillesTemplates') === 'a2031_grillesTemplates', null, { timeout: 30000 });
    expect(await page.evaluate(() => cle('grillesTemplates'))).toBe('a2031_grillesTemplates');

    // Le vrai bouton de la fenêtre.
    await page.evaluate(() => afficherBibliothequeGrilles());
    const utiliser = page.locator('#modalBibliothequeGrilles [data-action="ajouterGrilleIndividuelle"][data-param="' + copieId + '"]');
    await expect(utiliser).toContainText('Utiliser dans ce trimestre');
    await utiliser.click();
    await page.waitForFunction((i) => db.getSync(cle('grillesTemplates'), []).some((x) => x.idOriginal === i), copieId);

    const reelle = await page.evaluate((i) => {
        const g = db.getSync(cle('grillesTemplates'), []).find((x) => x.idOriginal === i);
        return g ? { nom: g.nom, criteres: g.criteres.length, inspire: BibliothequeUI.formaterInspireDe(g), isDemo: g.isDemo, id: g.id } : null;
    }, copieId);
    expect(reelle.nom).toBe('Ma grille fictive');
    expect(reelle.criteres).toBe(5);
    expect(reelle.isDemo).toBe(false);
    expect(reelle.inspire).toBe('Inspiré de Grille-5 FR-HOLIS-20 H26 par Labo Codex');

    // Ouverte hors démo : ni la ligne, ni le bandeau de lecture seule.
    await page.evaluate((i) => chargerGrillePourModif(i), reelle.id);
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(0);
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-readonly')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});

test('le nom affiché est gardé même si le champ n\'a pas été quitté (le toucher de l\'iPad)', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    const copieId = await dupliquerEnDemo(page);
    // Pas de `change` : la valeur est posée, le champ garde le focus, comme sous un toucher.
    await page.evaluate(() => { document.getElementById('nomGrilleTemplate').value = 'Nom sans sortie de champ'; });
    await page.evaluate((id) => garderGrilleDansBibliotheque(id), copieId);
    expect((await biblioGrille(page, copieId)).nom).toBe('Nom sans sortie de champ');
    expect(erreurs).toEqual([]);
});

// Le `change` part à l'appui, le clic au relâchement : la fenêtre de doublon peut s'ouvrir entre les deux et prendre
// le clic (5 essais rouges sur 10 avec une vraie souris). Les deux issues sont donc éprouvées séparément, par les
// événements DOM : une souris réelle ne dit pas laquelle arrive.
async function compterLesQuestions(page) {
    await page.evaluate(() => {
        const vraie = window.verifierEtGererDoublon;
        window.__questionsDoublon = 0;
        window.verifierEtGererDoublon = function (...args) { window.__questionsDoublon++; return vraie.apply(this, args); };
    });
}
const nomEnregistre = (page, id) => page.evaluate((i) => db.getSync(cle('grillesTemplates'), []).find((g) => g.id === i).nom, id);

test('un nom déjà pris, le clic arrive au bouton : une seule question ; annulée, la copie se garde sous son nom enregistré', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    const copieId = await dupliquerEnDemo(page);
    const nom = await nomEnregistre(page, copieId);
    await compterLesQuestions(page);
    await page.evaluate(() => {
        const champ = document.getElementById('nomGrilleTemplate');
        champ.value = 'Grille-4';
        champ.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#conteneurEditionGrille .bandeau-demo-copie button').click();
    });
    const annuler = page.locator('#btnDoublonAnnuler');
    await expect(annuler).toBeVisible();
    await annuler.click();
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveText('Aussi dans ta bibliothèque');
    await expect(annuler).toBeHidden();
    expect(await page.evaluate(() => window.__questionsDoublon)).toBe(1);
    expect((await biblioGrille(page, copieId)).nom).toBe(nom);
    expect(erreurs).toEqual([]);
});

test('un nom déjà pris, la question prend le clic : annulée, rien n\'est gardé et le bouton reste', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    const copieId = await dupliquerEnDemo(page);
    await compterLesQuestions(page);
    await page.evaluate(() => {
        const champ = document.getElementById('nomGrilleTemplate');
        champ.value = 'Grille-4';
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const annuler = page.locator('#btnDoublonAnnuler');
    await expect(annuler).toBeVisible();
    await annuler.click();
    await expect(annuler).toBeHidden();
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie').getByRole('button')).toHaveText('Garder dans ma bibliothèque');
    expect(await biblioGrille(page, copieId)).toBeNull();
    expect(await page.evaluate(() => window.__questionsDoublon)).toBe(1);
    expect(erreurs).toEqual([]);
});

test('rien sans le geste : sortir de la démo sans garder laisse la bibliothèque et le vrai trimestre intacts', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    const avant = await page.evaluate(() => ({ biblio: db.getSync('bibliothequeGrilles', []), vraies: db.getSync('a2031_grillesTemplates', []) }));
    const copieId = await dupliquerEnDemo(page);
    expect(await biblioGrille(page, copieId)).toBeNull();
    await page.evaluate(async () => { await desactiverModeDemo(); });
    const apres = await page.evaluate(() => ({ biblio: db.getSync('bibliothequeGrilles', []), vraies: db.getSync('a2031_grillesTemplates', []) }));
    expect(apres).toEqual(avant);
    expect(erreurs).toEqual([]);
});

test('hors démo : une grille portant une filiation n\'a pas la ligne, et « + Nouvelle » retire celle de la copie', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await demarrer(page);
    await page.evaluate(async () => {
        const g = { id: 'GRILLE_BANC_31OCT', nom: 'Grille fictive', criteres: [], isDemo: false, inspireDe: { nom: 'Source fictive', auteur: 'Personne fictive', date: '2026-10-31' } };
        db.setSync(cle('grillesTemplates'), [g]);
        await chargerGrillePourModif(g.id);
    });
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(0);

    await dupliquerEnDemo(page);
    await page.evaluate(() => BibliothequeUI.quitterModeLectureSeuleDemo(document.getElementById('conteneurEditionGrille')));
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(0);

    // En démo, ni une grille créée de zéro (pas une copie), ni un exemple du pack qui porterait une filiation.
    await page.evaluate(async () => {
        const liste = db.getSync(cle('grillesTemplates'), []);
        db.setSync(cle('grillesTemplates'), liste.concat([
            { id: 'GRILLE_BANC_NEUVE', nom: 'Neuve fictive', criteres: [], isDemo: false },
            { id: 'GRILLE_BANC_EXEMPLE', nom: 'Exemple fictif', criteres: [], isDemo: true, inspireDe: { nom: 'Source fictive', auteur: 'Personne fictive', date: '2026-10-31' } }
        ]));
        await chargerGrillePourModif('GRILLE_BANC_NEUVE');
    });
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(0);
    await page.evaluate(() => chargerGrillePourModif('GRILLE_BANC_EXEMPLE'));
    await expect(page.locator('#conteneurEditionGrille .bandeau-demo-copie')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});

// Captures sur demande : CAPTURES_COPIE_DEMO=<dossier>.
test('captures de la ligne, clair et sombre', async ({ page }) => {
    test.skip(!process.env.CAPTURES_COPIE_DEMO, 'captures sur demande');
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await demarrer(page);
    await dupliquerEnDemo(page);
    const dossier = process.env.CAPTURES_COPIE_DEMO;
    const ligne = page.locator('#conteneurEditionGrille .bandeau-demo-copie');
    const bouton = ligne.getByRole('button');
    await ligne.scrollIntoViewIfNeeded();
    for (const theme of ['dark', 'light']) {
        await page.evaluate((t) => document.body.classList.toggle('mode-clair', t === 'light'), theme);
        await page.screenshot({ path: path.join(dossier, 'copie-demo-' + theme + '-1280.png') });
    }
    await page.setViewportSize({ width: 820, height: 1000 });
    await page.screenshot({ path: path.join(dossier, 'copie-demo-light-820.png') });
    await bouton.click();
    await expect(ligne).toHaveText('Aussi dans ta bibliothèque');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: path.join(dossier, 'copie-demo-gardee-light-1280.png') });
});
