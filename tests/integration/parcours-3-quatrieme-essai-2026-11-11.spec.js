import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, contourSur, bulle, capture, deuxSondes } from './harness/classe-de-banc.js';
import { flecheVers, nombreDeFleches } from './harness/fleches-de-banc.js';
import {
    etape2, etape3, etape4, etapes5et6, etape9, menusLibres, dossierDesCaptures
} from './harness/parcours-3-de-banc.js';

// =======================================================================
// « ÉVALUER UNE PREMIÈRE PRODUCTION » : LE TROISIÈME ESSAI DE GRÉGOIRE SUR L'IPAD (11 NOV. 2026, 9 H 11 À 9 H 26)
// =======================================================================
// Relais de la conversation du Projet, 11 nov., 9 h 47. Une grille COMPOSÉE DANS CONCEPTION › GRILLES (« Test 1 »,
// « Partir de zéro »), pas par la dissection. Le banc joue le parcours de bout en bout avec elle, à 1180 × 820 (l'iPad
// en paysage), et juge les quatre points :
//   1. « Ta production » (capture 16) : la règle des formulaires (une flèche par champ obligatoire vide, le halo sur
//      « Créer la production ») ; puis la grille ; puis « Échelle de performance », restée à « Aucune », la grille se
//      notant par niveaux. Break-test : `echelleAttendue` rendue fausse (js/parcours-evaluer.js) → ROUGE ici (« étape 2,
//      l'échelle : nombre de flèches », 0 au lieu de 1).
//   2. « Une première production », sur la Liste (capture 17) : la bulle nomme « Actions › Évaluer » ; la flèche va au
//      menu de la rangée, seule. Break-test : `nommeLeContour` retiré de l'étape 4 → ROUGE (« étape 4, la Liste »).
//   3. L'écran d'évaluation (capture 18) : la bulle passe à « Pour chaque critère… », le premier critère est amené dans
//      la vue, halo et flèche dessus ; « Verrouiller » ensuite. Cause mesurée : l'écran était bien reconnu ; le premier
//      critère, à ~1 000 px sous le haut d'un formulaire de 1 270 px, portait le halo hors de l'écran, et la flèche
//      l'excluait (« jamais vers ce qu'il faut toucher »). Break-test : `pageQuiDit` retiré de l'étape 4 → ROUGE
//      (la page visible ne contient pas « Pour chaque critère »).
//   4. « Ta cartouche » (captures 19 et 20, BLOQUANT) : « Cartouche de départ (copie) », rangée sous « Grille de
//      départ » ; la bulle le dit (l'avis), la flèche va à « Grille (critères) », le halo sur son menu, jamais sur
//      « Dupliquer · Supprimer · Fermer » ; la grille changée, la copie rangée sous « Test 1 » avance l'étape, et la
//      fiche de la production l'offre. Dans la fiche, avant : la ligne sous « Cartouche de rétroaction » dit que
//      « Test 1 » n'en a aucune. Break-tests : `cartoucheHorsDeLaGrille` rendue fausse → ROUGE (l'avis absent) ;
//      `direCartoucheAbsente` neutralisée (js/productions.js) → ROUGE (la ligne absente) ; et, dans l'essai suivant,
//      `ouToucherCartouche` rendant `actionsFicheCartouche` → ROUGE (le halo sur le groupe de « Supprimer »).
// Captures : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-3-quatrieme-essai

const TOTAL = 9;
const etape = (page, n, titre) => attendreEtape(page, n, TOTAL, titre, { focus: false });
const ctx = (page) => page.evaluate(() => ParcoursEvaluer.contexte());
const DOSSIER = process.env.CAPTURES_PARCOURS || '';
dossierDesCaptures(DOSSIER);

const AVIS = '#parcours-bulle .parcours-bulle-avis';
const LIGNE_VIDE = '#productionCartoucheVide';
const GROUPE_GRILLE_CARTOUCHE = '.groupe-form:has(#selectGrilleCartouche)';

/** Le halo ne recouvre jamais « Supprimer » (11 nov. 2026, capture 19). */
async function haloLoinDeSupprimer(page, contexte) {
    await deuxSondes(page);
    const recouvre = await page.evaluate(() => {
        const c = document.getElementById('parcours-contour'), s = document.getElementById('btnSupprimerCartouche');
        if (!c || c.hidden || !s || !ParcoursMoteur.visible(s)) return false;
        const a = c.getBoundingClientRect(), b = s.getBoundingClientRect();
        return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    });
    expect(recouvre, contexte + ' : le halo recouvre « Supprimer »').toBe(false);
}

/** Une grille composée dans Conception › Grilles : un critère holistique (le type par défaut). */
async function composerUneGrille(page, nomGrille) {
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.fill('#nomGrilleTemplate', nomGrille);
    const carte = page.locator('#listeCriteres .item-liste').first();
    await expect(carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]')).toHaveValue('holistique');
    const nom = carte.locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill('Structure');
    await nom.press('Tab');
    await page.click('#btnCreerGrille');
}

/** Étape 1, par « Partir de zéro » : « Test 1 », composée dans Conception › Grilles. */
async function composerTest1(page) {
    await etape(page, 1, 'Ta grille');
    await page.click('#materiel-accueil [data-action="materiel.taperMain"]');
    await composerUneGrille(page, 'Test 1');
    await etape(page, 2, 'Ta production');
}

test('« Évaluer une première production » avec une grille composée dans Conception › Grilles, de bout en bout, à 1180 × 820 : les quatre points du troisième essai', async ({ page }) => {
    test.setTimeout(300000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
    await composerTest1(page);

    // Point 1 : la règle des formulaires, la grille, puis l'échelle (la grille se note par niveaux).
    const test1 = (await ctx(page)).grilleId;
    expect(await page.evaluate((id) => grilleEntierementEnPoints(db.getSync(cle('grillesTemplates'), []).find((g) => g.id === id)), test1)).toBe(false);
    await etape2(page, { cap: '1180x820-test1', niveaux: true, echelleVide: false, grilleId: test1, nomEchelle: /Échelle de départ/ });
    // (Point 4c, vu dans la fiche, avant la création : « Test 1 » n'a aucune cartouche.)
    await etape3(page, { cap: '1180x820-test1', plusTard: false });
    await expect.poll(() => page.evaluate(() => {
        const p = (db.getSync(cle('productions'), []) || []).find((x) => x.id === ParcoursEvaluer.contexte().productionId);
        return p ? [p.grilleId, p.echelleId] : null;
    })).toEqual([test1, 'ECHELLE_IDME_DEPART']);

    // Points 2 et 3 : la Liste, puis l'écran d'évaluation (un critère, l'échelle de départ).
    await etape4(page, { niveaux: true, cap: '1180x820-test1', echelleVide: false, nCriteres: 1, niveau: 'M' });
    await etapes5et6(page, { cap: '1180x820-test1' });
    // Étape 7 : « Continuer ». (Son titre « Performance (P) » amené dans la vue n'est pas jugé ici : à 1180 × 820, il
    // en sort deux fois sur trois après coup, hors de ce lot — inscrit au rapport ; le banc du parcours 3 le juge à 900.)
    await etape(page, 7, "Le point qui s'allume");
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // Point 4 : « Cartouche de départ », dupliquée, rangée sous « Grille de départ ».
    await etape(page, 8, 'Ta cartouche');
    await page.selectOption('#menuCartouches', 'CART_GENERIQUE');
    await expect(page.locator('#btnDupliquerCartouche')).toBeVisible();
    await page.click('#btnDupliquerCartouche');
    await expect.poll(() => page.evaluate(() => (window.cartoucheActuel || {}).nom || '')).toContain('(copie)');
    const copie = await page.evaluate(() => window.cartoucheActuel.id);
    await expect(page.locator(AVIS)).toHaveText('Cette cartouche est rangée sous la grille « Grille de départ » : pour que ta production la trouve, choisis « Test 1 » dans « Grille (critères) ».');
    await expect(page.locator(AVIS)).toHaveAttribute('role', 'status');
    await contourSur(page, '#selectGrilleCartouche');
    await flecheVers(page, GROUPE_GRILLE_CARTOUCHE, 'étape 8, « Grille (critères) »');
    await nombreDeFleches(page, 2, 'étape 8, hors de la grille');   // ↻ 11 nov. 2026 : le groupe du menu (une zone qui contient le contour garde sa flèche) et le menu
    await haloLoinDeSupprimer(page, 'étape 8, la copie ouverte');
    await capture(page, DOSSIER, 'p3-8-hors-grille-1180x820');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(7);

    // La grille changée : l'application copie la cartouche sous « Test 1 » (la question acceptée) ; l'avis part.
    const dialogues = [];
    page.on('dialog', (d) => dialogues.push(d.message()));
    await page.selectOption('#selectGrilleCartouche', test1);
    // Mesuré : le menu de l'échelle se vide, et rien ne part avant qu'une échelle soit choisie. L'étape la désigne.
    await expect(page.locator(AVIS)).toHaveText("Choisis maintenant l'échelle : une copie de cette cartouche sera rangée sous « Test 1 », et l'originale restera telle quelle.");
    await contourSur(page, '#selectEchelleCartouche');
    await flecheVers(page, '.groupe-form:has(#selectEchelleCartouche)', 'étape 8, l’échelle');
    await haloLoinDeSupprimer(page, 'étape 8, l’échelle à choisir');
    expect(dialogues).toEqual([]);
    await page.selectOption('#selectEchelleCartouche', 'ECHELLE_IDME_DEPART');
    await expect.poll(() => dialogues.length).toBeGreaterThan(0);
    expect(dialogues[0]).toMatch(/^Changer de grille crée une copie/);
    await deuxSondes(page);
    expect(dialogues.slice(1), 'aucune autre question ni alerte').toEqual([]);
    await expect.poll(() => page.evaluate((id) => (db.getSync(cle('cartouches_' + id), []) || []).length, test1)).toBe(1);
    await expect(page.locator(AVIS)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => ParcoursEvaluer.contexte().cartoucheId)).toBeTruthy();
    const c = await ctx(page);
    expect(c.cartoucheId).not.toBe(copie);   // une cartouche neuve de « Test 1 », l'originale reste sous sa grille
    expect(await page.evaluate((id) => (db.getSync(cle('cartouches_GRILLE_GENERIQUE'), []) || []).some((x) => x.id === id), copie)).toBe(true);
    // Ses phrases : écrites dans la matrice de la copie ouverte (elle s'enregistre seule).
    await expect.poll(() => page.evaluate(() => (window.cartoucheActuel || {}).grilleId)).toBe(test1);
    await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]').first()).toBeVisible();
    for (const id of await page.evaluate(() => [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')].map((t) => t.id))) {
        await page.fill('#' + id, 'MOT-DE-CARTOUCHE ' + id.split('_').pop());
        await page.locator('#' + id).blur();
    }
    await expect.poll(() => page.evaluate((g) => {
        const cart = (db.getSync(cle('cartouches_' + g), []) || [])[0];
        return cart ? Object.values(cart.commentaires || {}).filter((t) => /MOT-DE-CARTOUCHE/.test(t)).length : 0;
    }, test1)).toBeGreaterThan(0);
    await haloLoinDeSupprimer(page, 'étape 8, la copie rangée sous « Test 1 »');

    // Puis la fiche de la production : le menu l'offre, la ligne « aucune cartouche » est partie.
    await page.click('#sous-navigation [data-sous-onglet="conception-productions"]');
    if (!(await page.locator('#formulaireProduction').isVisible())) {
        await page.click(`#conception-productions [data-action="modifierProduction"][data-param="${c.productionId}"]`);
    }
    await contourSur(page, '#productionCartouche');
    await menusLibres(page, 'étape 8, la cartouche');
    await expect(page.locator(`#productionCartouche option[value="${c.cartoucheId}"]`)).toHaveCount(1);
    await expect(page.locator(LIGNE_VIDE)).toBeHidden();
    await page.selectOption('#productionCartouche', c.cartoucheId);

    await etape9(page, { cap: '1180x820-test1' });
});

test('« Ta production », hors parcours : sous « Cartouche de rétroaction », une ligne nomme la grille qui n’a aucune cartouche ; elle part avec une grille qui en a', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await composerUneGrille(page, 'Grille fictive');
    await expect.poll(() => page.evaluate(() => ((db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === 'Grille fictive') || {}).id)).toBeTruthy();
    const fictive = await page.evaluate(() => db.getSync(cle('grillesTemplates'), []).find((g) => g.nom === 'Grille fictive').id);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
    await expect(page.locator(LIGNE_VIDE)).toBeHidden();
    await page.selectOption('#productionGrille', fictive);
    await expect(page.locator(LIGNE_VIDE)).toHaveText("Aucune cartouche n'est rangée sous la grille « Grille fictive » : écris-en une dans Conception › Cartouches, avec cette grille, pour la choisir ici.");
    await expect(page.locator('#productionCartouche option')).toHaveCount(1);
    await capture(page, DOSSIER, 'fiche-production-grille-sans-cartouche-1180x820');
    // Sans grille : la ligne part.
    await page.selectOption('#productionGrille', '');
    await expect(page.locator(LIGNE_VIDE)).toBeHidden();
    // Une cartouche rangée sous la grille (posée en base) : la grille rechoisie, le menu l'offre et la ligne ne revient pas.
    await page.evaluate((id) => db.setSync(cle('cartouches_' + id), [{ id: 'CART_FICTIVE', nom: 'Cartouche fictive', grilleId: id }]), fictive);
    await page.selectOption('#productionGrille', fictive);
    await expect(page.locator('#productionCartouche option[value="CART_FICTIVE"]')).toHaveCount(1);
    await expect(page.locator(LIGNE_VIDE)).toBeHidden();
});

test('« Ta cartouche » sur une cartouche déjà enregistrée sous la grille du parcours : aucun halo sur « Dupliquer · Supprimer · Fermer », ni ailleurs', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    // Le parcours repris à l'étape 8, sa grille étant « Grille de départ » et sa cartouche déjà là (le repère).
    await page.evaluate(() => {
        definirPreference('parcoursEvaluer', { grillesAvant: ['GRILLE_GENERIQUE'], productionsAvant: [], pratiquesAvant: [],
            grilleId: 'GRILLE_GENERIQUE', cartouchesAvant: ['CART_GENERIQUE'], productionId: null });
        Assistance.definirEtat('evaluer', 'en-cours', 7);
        return Assistance.parcours().find((p) => p.id === 'evaluer').lancer(7);
    });
    await etape(page, 8, 'Ta cartouche');
    await page.selectOption('#menuCartouches', 'CART_GENERIQUE');
    await expect(page.locator('#btnSupprimerCartouche')).toBeVisible();
    await deuxSondes(page);
    await expect(page.locator('#parcours-contour')).toBeHidden();
    await expect(page.locator(AVIS)).toHaveCount(0);
    await haloLoinDeSupprimer(page, 'étape 8, la cartouche de départ');
    await expect(bulle(page)).toBeVisible();
});
