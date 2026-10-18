import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// ⏸ 18 oct. 2026 (la dissection, lot 1) : l'assistant en sept étapes est DÉBRANCHÉ de l'onglet, plus aucun
// collage ni bouton ne l'ouvre. Ces essais le parcouraient : suspendus, pas supprimés, comme son code. Son
// retrait est inscrit pour après lundi (PLAN-2026-10-18-la-dissection-pour-lundi.md, « Après lundi »).
test.skip(() => true, 'Assistant en sept étapes débranché le 18 oct. 2026 (dissection, lot 1) ; retrait après lundi.');

// « APPORTER MON MATÉRIEL », LOT 3a (consigne du 17 oct. 2026), dans un vrai WebKit.
//
//   · une grille fictive de la forme de celle de Grégoire (deux rangées d'en-tête, la 1re case
//     fusionnée sur les deux ; des bandes « NOM | I | D | M | E » suivies d'une rangée « tâches
//     ☐ | descripteurs »), COLLÉE dans la zone : quatre critères codés I, D, M, E ;
//   · changer une rangée « Suite du critère » en « À ignorer » retire ses sous-critères et ses
//     descripteurs, et le focus reste sur le menu ;
//   · « Créer ma grille » écrit les sous-critères dans la grille créée ;
//   · iPad : les menus font 44 px, la page ne défile pas de côté.
//
// ⛔ Textes inventés : aucun mot de la grille réelle de Grégoire.

const NIVEAUX = ['INCOMPLET', 'EN DÉVELOPPEMENT', 'MAÎTRISÉ', 'ÉTENDU'];
const CRITERES = [
    { nom: 'COMPRÉHENSION DU CORPUS', taches: ['Résumer chaque extrait', 'Situer l’époque', 'Nommer le narrateur'] },
    { nom: 'TRAVAIL DES CITATIONS', taches: ['Choisir une citation courte', 'L’introduire', 'La commenter', 'Donner la page'] },
    { nom: 'STRUCTURE DE L’ANALYSE', taches: ['Annoncer le plan', 'Une idée par paragraphe', 'Relier les parties', 'Conclure', 'Ouvrir', 'Relire le tout', 'Titrer'] },
    { nom: 'CLARTÉ DE L’EXPRESSION', taches: ['Phrases complètes', 'Vocabulaire juste', 'Ponctuation soignée'] }
];

function grilleFictiveHtml() {
    let h = '<p>Analyse littéraire : grille fictive</p><table>' +
        '<tr><td rowspan="2"><p>Critères</p></td><td>Premier palier</td><td>Deuxième palier</td><td>Troisième palier</td><td>Quatrième palier</td></tr>' +
        '<tr>' + NIVEAUX.map(n => '<td><p>' + n + '</p></td>').join('') + '</tr>';
    CRITERES.forEach((c, i) => {
        h += '<tr><td><p><b>' + c.nom + '</b></p></td><td>I</td><td>D</td><td>M</td><td>E</td></tr>';
        h += '<tr><td>' + c.taches.map(t => '<p>☐ ' + t + '</p>').join('') + '</td>' +
            NIVEAUX.map((n, j) => '<td><p>Critère ' + (i + 1) + ', palier ' + (j + 1) + '.</p><p>Un exemple l’appuie.</p></td>').join('') + '</tr>';
    });
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
    // Un témoin, pas un délai : le dernier drapeau des migrations de démarrage (main.js, auDbReady)
    // et la zone de collage qui écoute « coller » (materiel.js, au DOMContentLoaded).
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Un VRAI événement « coller » sur la zone, avec le HTML au presse-papiers (comme Pages). */
async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        const donnees = { 'text/html': h, 'text/plain': '' };
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (t) => donnees[t] || '' } });
        zone.dispatchEvent(ev);
    }, html);
}

const modele = (page) => page.evaluate(() => window.materiel.modeleCourant());

test('lot 3a · la grille fictive collée mène à quatre critères codés I, D, M, E ; une suite ignorée retire ses textes', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirConception(page);
    await coller(page, grilleFictiveHtml());

    await expect(page.locator('.materiel-etapes-nav button').nth(1)).toHaveText('2. Ce que contient ton tableau');
    await expect(page.locator('.materiel-question .alerte-attention')).toContainText('cases fusionnées');
    await page.locator('[data-action="materiel.suivant"]').click();
    await expect(page.locator('#materiel-titre-etape')).toHaveText('Vérifie ce que l’application a lu dans ton tableau');
    await expect(page.locator('.materiel-question')).toContainText('Proposé par l’application : à vérifier');
    await expect(page.locator('#materiel-role-r-1')).toHaveValue('niveaux');
    await expect(page.locator('#materiel-role-r-3')).toHaveValue('suite');

    let m = await modele(page);
    expect(m.criteres.map(c => c.nom.valeur)).toEqual(CRITERES.map(c => c.nom));
    expect(m.niveaux.map(n => [n.titre.valeur, n.code.valeur, n.code.etat])).toEqual(NIVEAUX.map((n, j) => [n, 'IDME'[j], 'repris']));
    expect(m.criteres.map(c => c.sousCriteres)).toEqual(CRITERES.map(c => c.taches));
    expect(m.criteres[0].cases[0].valeur).toBe('Critère 1, palier 1.\nUn exemple l’appuie.');
    expect(m.aClasser).toEqual([]);
    await expect(page.locator('#materiel-apercu-zone')).toContainText('Résumer chaque extrait');

    await page.selectOption('#materiel-role-r-3', 'ignorer');
    await expect(page.locator('#materiel-role-r-3')).toBeFocused();
    await expect(page.locator('#materiel-role-r-3')).toHaveValue('ignorer');
    await expect(page.locator('.materiel-question')).not.toContainText('Proposé par l’application');
    m = await modele(page);
    expect(m.criteres[0].sousCriteres).toEqual([]);
    expect(m.criteres[0].cases.map(d => d.valeur)).toEqual(['', '', '', '']);
    expect(m.criteres[1].sousCriteres).toEqual(CRITERES[1].taches);
    await expect(page.locator('#materiel-apercu-zone')).not.toContainText('Résumer chaque extrait');
    expect(erreurs).toEqual([]);
});

test('lot 3a · « Créer ma grille » écrit les sous-critères, dans l’ordre des lignes, à la forme de l’éditeur', async ({ page }) => {
    await ouvrirConception(page);
    await coller(page, grilleFictiveHtml());
    const etapes = await page.evaluate(() => window.materiel.etatCourant().etapes);
    await page.locator('[data-action="materiel.allerEtape"][data-param="' + etapes.indexOf('final') + '"]').click();
    for (let j = 0; j < 4; j++) {
        await page.fill('#materiel-v-min-' + j, String(j * 25));
        await page.fill('#materiel-v-max-' + j, String(j * 25 + 24));
        await page.fill('#materiel-v-note-' + j, String(j * 25 + 12));
    }
    await expect(page.locator('#materiel-v-code-0')).toHaveValue('I');
    await page.locator('[data-action="materiel.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Analyse littéraire : grille fictive » est créée');
    const g = await page.evaluate(() => { const l = db.getSync(cle('grillesTemplates'), []); return l[l.length - 1]; });
    expect(g.criteres.map(c => (c.sousCriteres || []).map(s => s.nom))).toEqual(CRITERES.map(c => c.taches));
    expect(g.criteres[2].sousCriteres.map(s => [s.code, s.ponderation, s.retroaction])).toEqual(CRITERES[2].taches.map((t, k) => [String(k), 1, '']));
    expect(Object.keys(g.criteres[0].descripteurs.parNiveau)).toEqual(['I', 'D', 'M', 'E']);
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    await expect(page.locator('#conception-grille-criteres')).toContainText('Analyse littéraire : grille fictive');
});

test('lot 3a · iPad : les menus de rôle font 44 px, la page ne défile pas de côté', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirConception(page);
    await coller(page, grilleFictiveHtml());
    await page.locator('[data-action="materiel.suivant"]').click();
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'la page ne défile pas horizontalement').toBeLessThanOrEqual(0);
    const petites = await page.evaluate(() => Array.from(document.querySelectorAll('#materiel-lecture select, #materiel-lecture button'))
        .filter((b) => b.offsetParent && b.getBoundingClientRect().height < 44).map((b) => b.id || b.textContent.trim()));
    expect(petites, 'cibles tactiles de 44 px').toEqual([]);
    expect(await page.locator('select.materiel-role').count()).toBe(10 + 5);
});
