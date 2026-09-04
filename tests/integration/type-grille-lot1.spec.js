import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE TYPE MONTE À LA GRILLE — lot 1 (consigne du 3 septembre 2026), dans un vrai WebKit.
//
// Le « fini quand » de la consigne, geste par geste :
//   · Grégoire crée une grille, choisit « Analytique », ajoute trois critères — les trois
//     sont analytiques sans qu'il ait rien coché ;
//   · il en passe un en algorithmique : le badge de la barre latérale devient MIXTE ;
//   · une grille d'avant ce lot (sans `type`) : le menu montre le déduit, rien n'est écrit,
//     un critère neuf y reste holistique ; une composition mixte ne présélectionne rien ;
//   · export/import et partage : le type traverse (les fonctions réelles de la page).

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G0', nom: 'Avant le lot', dansBibliotheque: true, criteres: [
            { id: 'C1', nom: 'Structure', type: 'holistique', ponderation: 50 },
            { id: 'C2', nom: 'Rigueur',   type: 'holistique', ponderation: 50 } ] },
        { id: 'GM', nom: 'Mixte de fait', dansBibliotheque: true, criteres: [
            { id: 'C1', nom: 'Structure', type: 'holistique',    ponderation: 80 },
            { id: 'C2', nom: 'Français',  type: 'algorithmique', ponderation: 20 } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    window.creerNouvelleGrille();
    return {
        menu: document.getElementById('typeGrille').value,
        nCriteres: document.querySelectorAll('#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]').length,
        cle: cle('grillesTemplates')
    };
}`;

const LIRE = `async () => {
    const grilles = (await db.get(cle('grillesTemplates'))) || [];
    const brut = (g) => ({
        id: g.id, nom: g.nom, type: g.type,
        aType: Object.prototype.hasOwnProperty.call(g, 'type'),
        criteres: (g.criteres || []).map(c => c.type)
    });
    return { grilles: grilles.map(brut), menu: document.getElementById('typeGrille').value };
}`;

const TYPES_TEMP = '#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]';
const TYPES_GRILLE = '#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]';

test('lot 1 · le type monte à la grille — le « fini quand », à l\'écran', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const semis = await page.evaluate(eval(SEMER));
    console.log('SEMIS →', JSON.stringify(semis));
    expect(semis.menu, 'une grille neuve part sans type').toBe('');
    expect(semis.nCriteres, 'un premier critère vide est rendu').toBe(1);

    // 1 — choisir « Analytique », ajouter deux critères : trois analytiques, rien coché.
    await page.fill('#nomGrilleTemplate', 'Dissertation');
    await page.selectOption('#typeGrille', 'analytique');
    await page.waitForTimeout(200);
    await page.click('#listeCriteres [data-action="ajouterCritereTemp"]');
    await page.click('#listeCriteres [data-action="ajouterCritereTemp"]');
    await expect(page.locator(TYPES_TEMP)).toHaveCount(3);
    const typesTemp = await page.locator(TYPES_TEMP).evaluateAll(els => els.map(e => e.value));
    console.log('TYPES EN CRÉATION →', JSON.stringify(typesTemp));
    expect(typesTemp).toEqual(['analytique', 'analytique', 'analytique']);

    // Nommer les critères puis enregistrer la grille (le bouton « Enregistrer » appelle ceci).
    await page.evaluate(() => {
        ['Contenu', 'Structure', 'Langue'].forEach((n, i) => { window.modifierCritereTemp(i, 'nom', n); window.modifierCritereTemp(i, 'ponderation', i === 0 ? 40 : 30); });
    });
    await page.evaluate(() => window.sauvegarderGrilleComplete());
    await page.waitForTimeout(400);
    let etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS ENREGISTREMENT →', JSON.stringify(etat));
    const neuve = etat.grilles.find(g => g.nom === 'Dissertation');
    expect(neuve, 'la grille est enregistrée').toBeTruthy();
    expect(neuve.type).toBe('analytique');
    expect(neuve.criteres).toEqual(['analytique', 'analytique', 'analytique']);
    const item = page.locator(`#sidebarListeGrilles .sidebar-item[data-id="${neuve.id}"]`);
    await expect(item.locator('.badge-composition--analy')).toHaveCount(1);

    // 2 — en passer un en algorithmique : le badge devient MIXTE, le type déclaré reste.
    await page.evaluate((id) => window.chargerGrillePourModif(id), neuve.id);
    await page.waitForTimeout(300);
    await expect(page.locator('#typeGrille')).toHaveValue('analytique');
    await expect(page.locator(TYPES_GRILLE)).toHaveCount(3);
    await page.locator(TYPES_GRILLE).nth(2).selectOption('algorithmique');
    await expect(item.locator('.badge-composition--mixte')).toHaveCount(1);
    await expect(item.locator('.badge-composition--analy')).toHaveCount(0);
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS DÉROGATION →', JSON.stringify(etat));
    let g = etat.grilles.find(x => x.id === neuve.id);
    expect(g.type, 'le type déclaré ne bouge pas').toBe('analytique');
    expect(g.criteres).toEqual(['analytique', 'analytique', 'algorithmique']);
    await expect(page.locator('#typeGrille')).toHaveValue('analytique');

    // 3 — un critère neuf sur cette grille naît analytique.
    await page.click('#listeCriteres [data-action="ajouterCritereGrille"]');
    await page.waitForTimeout(300);
    etat = await page.evaluate(eval(LIRE));
    g = etat.grilles.find(x => x.id === neuve.id);
    expect(g.criteres).toEqual(['analytique', 'analytique', 'algorithmique', 'analytique']);

    // 4 — une grille d'avant ce lot : le menu MONTRE holistique, rien n'est ÉCRIT,
    //     et un critère neuf y reste holistique — exactement comme avant.
    await page.evaluate(() => window.chargerGrillePourModif('G0'));
    await page.waitForTimeout(300);
    await expect(page.locator('#typeGrille')).toHaveValue('holistique');
    await page.click('#listeCriteres [data-action="ajouterCritereGrille"]');
    await page.waitForTimeout(300);
    etat = await page.evaluate(eval(LIRE));
    console.log('GRILLE D\'AVANT →', JSON.stringify(etat.grilles.find(x => x.id === 'G0')));
    const g0 = etat.grilles.find(x => x.id === 'G0');
    expect(g0.aType, 'aucun champ `type` écrit sur une grille d\'avant').toBe(false);
    expect(g0.criteres).toEqual(['holistique', 'holistique', 'holistique']);

    // 5 — une composition mixte de fait : rien de présélectionné.
    await page.evaluate(() => window.chargerGrillePourModif('GM'));
    await page.waitForTimeout(300);
    await expect(page.locator('#typeGrille')).toHaveValue('');
    etat = await page.evaluate(eval(LIRE));
    expect(etat.grilles.find(x => x.id === 'GM').aType).toBe(false);

    // 6 — le transport, par les fonctions réelles de la page : export/import et partage.
    const transport = await page.evaluate(async (id) => {
        const g = ((await db.get(cle('grillesTemplates'))) || []).find(x => x.id === id);
        return {
            importExport: window.assainirObjet(g, window.SCHEMAS_IMPORT.grille).type,
            partage: window.partageFormat.projeterEntite(g, 'grille').type
        };
    }, neuve.id);
    console.log('TRANSPORT →', JSON.stringify(transport));
    expect(transport).toEqual({ importExport: 'analytique', partage: 'analytique' });
});
