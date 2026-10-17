import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « APPORTER MON MATÉRIEL », ÉTAPE 5 DU PLAN « PRÊT POUR LUNDI » (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · une grille fictive de la forme de 1995 (parties en cases fusionnées verticales, « /4 »,
//     commentaires vides) collée → Vérification « sur 64 » → « Créer ma grille » → la grille seule,
//     badge « ANALY » dans Grilles de critères ;
//   · #1095 : sur l'iPad (820 et 1180 px), la rangée d'un critère donne au nom sa ligne ; au-dessus
//     de 1180 px, la grille en ligne de grilles.js est intacte.
// ⛔ Textes inventés : aucun mot d'une grille réelle.

const PARTIES = [
    ['Introduction', [['Sujet amené', 'Le thème est situé dans un contexte large.', '/4'], ['Sujet posé', 'La question est formulée clairement.', '/3']]],
    ['Développement', [['Arguments', 'Chaque idée est appuyée par un exemple.', '/18'], ['Citations', 'Elles sont brèves et commentées.', '/15'], ['Cohérence', 'Les paragraphes s’enchaînent.', '/10']]],
    ['Conclusion', [['Synthèse', 'Le parcours est résumé sans redite.', '/6'], ['Ouverture', 'Une piste neuve est proposée.', '/8']]]
];

function grilleHtml() {
    let h = '<p>Dissertation fictive : grille de correction</p><table>' +
        '<tr><td colspan="2"><p><b>CRITÈRES</b></p></td><td><p><b>NOTE</b></p></td><td><p><b>COMMENTAIRES</b></p></td></tr>';
    PARTIES.forEach(([partie, criteres]) => criteres.forEach(([nom, expl, pts], k) => {
        h += '<tr>' + (k === 0 ? '<td rowspan="' + criteres.length + '"><p>' + partie + '</p></td>' : '') +
            '<td><p>' + nom + '</p><p>' + expl + '</p></td><td><p>' + pts + '</p></td><td><p>&nbsp;</p></td></tr>';
    }));
    return h + '</table>';
}

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.waitForTimeout(200);
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Word ou Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        const donnees = { 'text/html': h, 'text/plain': '' };
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (t) => donnees[t] || '' } });
        zone.dispatchEvent(ev);
    }, html);
}

test('étape 5 · une grille en points collée se vérifie « sur 64 » et se crée seule, badge « ANALY »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, grilleHtml());

    await expect(page.locator('.materiel-etapes-nav button')).toHaveText(['1. Sens du tableau', '2. Ce que contient ton tableau', '3. Vérification']);
    await page.locator('[data-action="materiel.suivant"]').click();
    await expect(page.locator('#materiel-role-c-0')).toHaveValue('partie');
    await expect(page.locator('#materiel-role-c-2 option:checked')).toHaveText('Points ou pondération');
    await expect(page.locator('#materiel-role-c-3')).toHaveValue('ignorer');
    await page.locator('[data-action="materiel.suivant"]').click();

    await expect(page.locator('.materiel-verif thead th')).toHaveText(['Critère', 'Description', 'Points']);
    await expect(page.locator('#materiel-v-nom-0')).toHaveValue('Introduction – Sujet amené');
    await expect(page.locator('#materiel-v-pond-2')).toHaveValue('18');
    await expect(page.locator('.materiel-total')).toHaveText('Total : sur 64');
    await expect(page.locator('[data-action="materiel.ramenerA100"]')).toHaveCount(0);
    // Une saisie redessine le total, sans redessiner le champ.
    await page.fill('#materiel-v-pond-6', '9');
    await expect(page.locator('.materiel-total')).toHaveText('Total : sur 65');
    await expect(page.locator('#materiel-cree li')).toHaveText('Une grille en points « Dissertation fictive : grille de correction » (7 critères), sur 65.');

    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Dissertation fictive : grille de correction » est créée');
    await expect(page.locator('.materiel-carte-cree')).toHaveCount(1);
    const ecrit = await page.evaluate(() => ({
        grilles: db.getSync(cle('grillesTemplates'), []),
        echelles: db.getSync(cle('echellesTemplates'), []),
        enPoints: window.grilleEntierementEnPoints(db.getSync(cle('grillesTemplates'), []).slice(-1)[0])
    }));
    const g = ecrit.grilles[ecrit.grilles.length - 1];
    expect(ecrit.enPoints).toBe(true);
    expect(ecrit.echelles.filter(e => /Dissertation fictive/.test(e.nom))).toEqual([]);
    expect(g.criteres.map(c => c.ponderation)).toEqual([4, 3, 18, 15, 10, 6, 9]);

    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await expect(page.locator(`#conception-grille-criteres .sidebar-item[data-id="${g.id}"] .badge-composition`)).toHaveText('ANALY');
    expect(erreurs).toEqual([]);
});

for (const [largeur, hauteur] of [[820, 1180], [1180, 820], [1440, 900]]) {
    test(`#1095 · à ${largeur} px, la rangée d’un critère dans Grilles de critères`, async ({ page }) => {
        await page.setViewportSize({ width: largeur, height: hauteur });
        await ouvrirConception(page);
        await page.evaluate(() => {
            db.setSync(cle('grillesTemplates'), [{ id: 'GRILLE_X', nom: 'Grille fictive', dansBibliotheque: true, criteres: [
                { id: 'CR_1', nom: 'Correction de la langue', description: '', ponderation: 100, type: 'analytique', formule: '', niveauSOLO: 'multistructurel', verrouille: false }] }]);
            window.afficherSousSection('conception-grille-criteres');
        });
        await page.evaluate(() => window.ouvrirGrilleDepuisListe('GRILLE_X'));
        const nom = page.locator('#listeCriteres .critere-rangee input[data-champ="nom"]').first();
        await expect(nom).toBeVisible();
        const mesure = await page.evaluate(() => {
            const r = document.querySelector('#listeCriteres .critere-rangee');
            return { colonnes: getComputedStyle(r).gridTemplateColumns.split(' ').length, nom: r.querySelector('input[data-champ="nom"]').getBoundingClientRect().width,
                deborde: document.documentElement.scrollWidth > document.documentElement.clientWidth };
        });
        expect(mesure.deborde).toBe(false);
        if (largeur <= 1180) {
            expect(mesure.colonnes).toBe(3);                 // le nom sur sa ligne, puis trois champs
            expect(mesure.nom).toBeGreaterThan(300);         // 42 px à 820, 56 px à 1180, avant #1095
        } else {
            expect(mesure.colonnes).toBe(5);                 // au-dessus de l'iPad, rien ne change
        }
    });
}
