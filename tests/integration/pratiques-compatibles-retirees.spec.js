import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LES CASES « PRATIQUES COMPATIBLES » PARTENT, LE BADGE DIT LA COMPOSITION
// (consigne du 3 septembre 2026, volet C) — dans un vrai WebKit.
//
//   · la composition d'une grille est un badge DÉDUIT des types de critères : ALGO,
//     HOLIS, MIXTE ; rien pour une grille sans critère ; et le champ déclaré ne
//     commande plus rien. ↻ #1147 (24 oct. 2026) : la barre latérale est partie, la
//     sélection est un menu au nom seul ; le badge vit dans la bibliothèque, qui le tire
//     de `GabaritsUtils.genererBadgeComposition` — c'est lui qu'on lit ;
//   · le formulaire d'une grille n'offre plus de cases ;
//   · une grille enregistrée qui portait `pratiquesCompatibles` le garde après
//     une sauvegarde : on ne saisit plus, on ne supprime rien.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    const c = (id, type) => ({ id, nom: 'Critère ' + id, type, ponderation: 20 });
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'G_ALGO',  nom: 'G1 FR-ALGO seul A26', dansBibliotheque: true, pratiquesCompatibles: ['SOM'], criteres: [c('a1', 'algorithmique'), c('a2', 'algorithmique')] },
        { id: 'G_HOLIS', nom: 'G5 FR-HOLIS A26',     dansBibliotheque: true, pratiquesCompatibles: ['SOM', 'STD', 'SPE'], criteres: [c('h1', 'holistique')] },
        { id: 'G_MIXTE', nom: 'Grille mixte',        dansBibliotheque: true, criteres: [c('m1', 'holistique'), c('m2', 'algorithmique')] },
        { id: 'G_VIDE',  nom: 'Grille vide',         dansBibliotheque: true, criteres: [] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    await window.afficherListeGrilles();
    const grilles = await db.get(cle('grillesTemplates'));
    const menu = [...document.getElementById('menuGrilles').options].filter(o => o.value).map(o => o.textContent);
    return grilles.map(g => {
        const el = document.createElement('div');
        el.innerHTML = window.GabaritsUtils.genererBadgeComposition(g);
        return { id: g.id, menu,
            badges: [...el.querySelectorAll('.badge-composition')].map(b => b.textContent),
            ancien: el.querySelectorAll('.badge-type-som, .badge-type-std, .badge-type-spe, .badge-type-den, .badge-type-multi').length };
    });
}`;

test('volet C · la liste des grilles dit la composition, déduite des critères', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const liste = await page.evaluate(eval(SEMER));
    console.log('LISTE →', JSON.stringify(liste));
    const par = Object.fromEntries(liste.map(l => [l.id, l]));
    expect(par.G_ALGO.badges).toEqual(['ALGO']);
    expect(par.G_HOLIS.badges).toEqual(['HOLIS']);
    expect(par.G_MIXTE.badges).toEqual(['MIXTE']);
    expect(par.G_VIDE.badges).toEqual([]);
    // #1147 : le menu de la sélection montre le nom seul.
    expect(liste[0].menu).toEqual(liste.map(l => l.id === 'G_ALGO' ? 'G1 FR-ALGO seul A26' : l.id === 'G_HOLIS' ? 'G5 FR-HOLIS A26' : l.id === 'G_MIXTE' ? 'Grille mixte' : 'Grille vide'));
    // Le champ déclaré (SOM, STD, SPE) ne commande plus aucun badge.
    expect(liste.every(l => l.ancien === 0)).toBe(true);
});

test('volet C · le formulaire n\'offre plus de cases, et une grille qui portait le champ le garde après sauvegarde', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));

    const r = await page.evaluate(async () => {
        await window.chargerGrillePourModif('G_ALGO');
        const cases = document.querySelectorAll('input[name="grille_pratiques"], .champ-pratiques-compatibles').length;
        document.getElementById('nomGrilleTemplate').value = 'G1 FR-ALGO seul A26 (renommée)';
        await window.sauvegarderGrilleTemplate(true);
        await new Promise(res => setTimeout(res, 400));
        const g = (await db.get(cle('grillesTemplates'))).find(x => x.id === 'G_ALGO');
        return { cases, nom: g.nom, pratiques: g.pratiquesCompatibles };
    });
    console.log('FORMULAIRE + SAUVEGARDE →', JSON.stringify(r));
    expect(r.cases).toBe(0);
    expect(r.nom).toBe('G1 FR-ALGO seul A26 (renommée)');
    // Ne se saisit plus, ne se supprime d'aucune donnée.
    expect(r.pratiques).toEqual(['SOM']);
});
