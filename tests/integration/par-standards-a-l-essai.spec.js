import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// 21 nov. 2026 — L'ÉTIQUETTE « À L'ESSAI » DE LA PRATIQUE « PAR STANDARDS » (mandat de la release 1.253.0, point 1 ;
// décision de Grégoire, 14 h 17). Elle se lit, sans survol, aux trois endroits où la pratique se choisit ou se présente :
//   1. la carte du modèle, en vue simple ;
//   2. les cartes de l'assistant de création, en vue étendue (« Décrire ma pratique » et « Je sais déjà ce que je veux ») ;
//   3. l'en-tête de sa fiche, en vue étendue.
// UNE SEULE CONSTANTE l'allume et l'éteint (`EnsemblesCibles.A_L_ESSAI`, js/pratiques/ensembles-cibles.js) : ce banc
// l'éteint en mémoire et redessine les trois endroits — la mention part des trois. Aucune autre pratique ne la porte.
// Lisible en clair et en sombre : le contraste du texte sur son fond est mesuré (4,5 pour 1 au moins).
// Noms fictifs. Break-tests (21 nov. 2026) : journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const MOT = 'À l’essai';
const T = 'a2026';
const GC = 'GC_ESSAI';

async function ouvrir(page, { vueSimple = false } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    if (vueSimple) await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
    await page.goto(indexHtml);
    await attendreApplication(page);
    return erreurs;
}

/** Un trimestre fictif, un groupe, une pratique « Par standards » et une pratique « Par sélection de productions ». */
async function semer(page) {
    await page.evaluate(({ T, GC }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-essai';
        const niveaux = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 50], ['2', 'Acquis', 100]]
            .map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 34, max: i * 34 + 33, couleur: 'var(--gris-moyen)' }));
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cib-essai', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: '2100001', nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ECH_ESSAI', nom: 'Échelle fictive', niveaux }]);
        window.db.setSync(T + '_ensemblesCibles', [{ id: 'ENSC_ESSAI', coursId, cibles: [{ id: 'cible_a', etiquette: 'Analyser', enonce: '', poids: 1, terminale: false, criteres: [] }] }]);
        window.db.setSync(T + '_pratiquesConfigurables', [
            { id: 'cib-essai', nom: 'Par standards fictive', type: 'cibles', pratiques: ['CIB'], calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
                configuration: { type: 'cibles', ensembleCiblesId: 'ENSC_ESSAI', echelleId: 'ECH_ESSAI', niveauSansDonnee: '0' } },
            { id: 'sel-essai', nom: 'Sélection fictive', type: 'standards', pratiques: ['STD'], dansBibliotheque: true,
                configuration: { type: 'standards', echelleId: 'ECH_ESSAI', portfolio: { actif: true, methodeSelection: 'tous' } } }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
        if (window.invaliderCachePratique) window.invaliderCachePratique();
    }, { T, GC });
}

const eteindre = (page) => page.evaluate(() => { window.EnsemblesCibles.A_L_ESSAI = false; });

/**
 * Le contraste (WCAG) du texte d'un élément sur le premier fond opaque qu'il trouve en remontant ; un fond translucide
 * est composé sur celui d'en dessous.
 */
async function contraste(locator) {
    return locator.evaluate((el) => {
        const lire = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
        const couches = [];
        for (let n = el; n; n = n.parentElement) {
            const f = lire(getComputedStyle(n).backgroundColor);
            if (f.a > 0) couches.push(f);
            if (f.a === 1) break;
        }
        let fond = { r: 255, g: 255, b: 255 };
        for (const c of couches.reverse()) fond = { r: c.r * c.a + fond.r * (1 - c.a), g: c.g * c.a + fond.g * (1 - c.a), b: c.b * c.a + fond.b * (1 - c.a) };
        const lum = (c) => { const v = [c.r, c.g, c.b].map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
        const a = lum(lire(getComputedStyle(el).color)), b = lum(fond);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
}

/** L'étiquette est là, dit le mot, se voit, et se lit dans les deux thèmes. */
async function seLit(page, etiquette, ou, cadre) {
    await expect(etiquette, ou).toHaveText(MOT);
    await expect(etiquette, ou).toBeVisible();
    for (const clair of [true, false]) {
        await page.evaluate((c) => window.definirTheme(c), clair);
        // Le changement de thème est une transition : on mesure les couleurs posées, pas celles du passage.
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || !a.effect || a.effect.getComputedTiming().iterations === Infinity));
        const c = await contraste(etiquette);
        // Captures à la demande (CAPTURES=<dossier>) : l'endroit entier, dans le thème, pour la relecture de l'apparence.
        if (process.env.CAPTURES) {
            const nom = ou.replace(/[^a-zà-ÿ]+/gi, '-').replace(/^-|-$/g, '');
            await etiquette.locator(cadre || 'xpath=..').screenshot({ path: path.join(process.env.CAPTURES, `essai-${nom}-${clair ? 'clair' : 'sombre'}.png`) });
            console.warn(`${ou}, ${clair ? 'clair' : 'sombre'} : contraste ${c.toFixed(2)}`);
        }
        expect(c, `${ou}, ${clair ? 'clair' : 'sombre'} : contraste ${c.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
}

async function ouvrirAssistant(page) {
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    await page.locator('#conception-pratiques-notation [data-action="creerNouvellePratique"]').click();
    await expect(page.locator('#modalWizardPratiqueV2 .wizard-v2-radio-card').first()).toBeVisible();
}

const carteDeLAssistant = (page, valeur) => page.locator('#modalWizardPratiqueV2 .wizard-v2-radio-card', { has: page.locator(`input[value="${valeur}"]`) });

test('vue simple : la carte du modèle « Par standards » porte « À l’essai », les deux autres non ; la constante éteinte, plus aucune', async ({ page }) => {
    const erreurs = await ouvrir(page, { vueSimple: true });
    await page.locator('#simple-accueil-contenu [data-param="classe"]').click();
    await page.fill('#vs-liste', '9990001, Albatros, Ada');
    await page.locator('#simple-classe-contenu [data-action="VueSimple.creerClasse"]').click();
    await page.locator('.navigation-vue-simple [data-onglet="simple-pratique"]').click();
    const cartes = page.locator('#simple-pratique-contenu .vs-etape');
    await expect(cartes).toHaveCount(3);
    const carte = cartes.filter({ has: page.locator('[data-param="par-standards"]') });
    await seLit(page, carte.locator('.vs-etape-essai'), 'la carte de la vue simple', 'xpath=ancestor::li[1]');
    await expect(page.locator('#simple-pratique-contenu .vs-etape-essai')).toHaveCount(1);

    await eteindre(page);
    await page.evaluate(() => window.VueSimple.aller('pratique'));
    await expect(cartes).toHaveCount(3);
    await expect(page.locator('#simple-pratique-contenu')).not.toContainText(MOT);
    expect(erreurs).toEqual([]);
});

test('vue étendue, l’assistant : les deux cartes où « Par standards » se choisit portent « À l’essai », aucune autre ; la constante éteinte, plus aucune', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await semer(page);
    for (const eteinte of [false, true]) {
        if (eteinte) await eteindre(page);
        // « Décrire ma pratique » : la question « Comment la note finale se construit-elle ? »
        await ouvrirAssistant(page);
        await carteDeLAssistant(page, 'decrire').click();
        await page.locator('#wizard-v2-btn-suivant').click();
        await expect(carteDeLAssistant(page, 'cibles')).toBeVisible();
        if (!eteinte) {
            await seLit(page, carteDeLAssistant(page, 'cibles').locator('.wizard-v2-card-title .etiquette-essai'), 'l’assistant, « Décrire ma pratique »', 'xpath=ancestor::label[1]');
            await expect(page.locator('#modalWizardPratiqueV2 .etiquette-essai')).toHaveCount(1);
        } else await expect(page.locator('#modalWizardPratiqueV2')).not.toContainText(MOT);
        // « Je sais déjà ce que je veux » : le choix direct de la famille
        await page.locator('#modalWizardPratiqueV2 [data-action="wizardV2VoieRapide"]').click();
        await expect(carteDeLAssistant(page, 'cibles')).toBeVisible();
        await expect(carteDeLAssistant(page, 'niveaux')).toBeVisible();
        if (!eteinte) {
            await seLit(page, carteDeLAssistant(page, 'cibles').locator('.wizard-v2-card-title .etiquette-essai'), 'l’assistant, « Je sais déjà ce que je veux »', 'xpath=ancestor::label[1]');
            await expect(page.locator('#modalWizardPratiqueV2 .etiquette-essai')).toHaveCount(1);
        } else await expect(page.locator('#modalWizardPratiqueV2')).not.toContainText(MOT);
        await page.evaluate(() => window.fermerWizardV2());
    }
    expect(erreurs).toEqual([]);
});

test('vue étendue, la fiche : l’en-tête d’une pratique « Par standards » porte « À l’essai » ; celui d’une autre pratique, non ; la constante éteinte, plus aucun', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await semer(page);
    const etiquette = page.locator('#mat-essai-pratique .etiquette-essai');
    await page.evaluate(() => window.ouvrirReglagesPratique('cib-essai'));
    await expect(page.locator('#mat-titre-pratique')).toHaveText('Par standards fictive');
    await seLit(page, etiquette, 'l’en-tête de la fiche', 'xpath=ancestor::h3[1]/..');

    await page.evaluate(() => window.ouvrirReglagesPratique('sel-essai'));
    await expect(page.locator('#mat-titre-pratique')).toHaveText('Sélection fictive');
    await expect(page.locator('#mat-essai-pratique')).toBeEmpty();

    await eteindre(page);
    await page.evaluate(() => window.ouvrirReglagesPratique('cib-essai'));
    await expect(page.locator('#mat-titre-pratique')).toHaveText('Par standards fictive');
    await expect(page.locator('#mat-essai-pratique')).toBeEmpty();
    expect(erreurs).toEqual([]);
});

/*
 * JOURNAL DES BREAK-TESTS (21 nov. 2026, WebKit, sur le Mac) : voir tests/unit/sentinelle-par-standards-a-l-essai.test.js
 * (S1 à S5). Chaque essai d'ici a rougi sur le sabotage de son endroit, puis reverdi une fois le sabotage défait.
 * ⚠ Une mesure de contraste prise pendant la transition du thème rend n'importe quoi (2,62 puis 1,49 au premier passage) :
 *   `seLit` attend la fin des animations avant de lire les couleurs.
 */
