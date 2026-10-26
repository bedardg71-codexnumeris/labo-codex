import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LES CODES PAR GRILLE, lot 3 — le gabarit, dans un vrai WebKit (3 septembre 2026).
//
//   · la case « Utiliser ces sous-critères comme codes d'annotation » est décochée
//     sur une grille d'avant ce lot, et sa note le dit ;
//   · cocher écrit `codesDepuisSousCriteres: true` ; la palette des codes d'une copie
//     de cette grille suit aussitôt ; décocher RETIRE le champ (jamais `false`) ;
//   · chaque sous-critère porte sa couleur ; en changer une l'écrit sur le
//     sous-critère et la liste des codes la lit.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [{
        id: 'G1', nom: 'Philo', dansBibliotheque: true,
        criteres: [{ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, sousCriteres: [
            { id: 'sc_0', code: '0', nom: 'Aucune erreur',       ponderation: 0,   retroaction: '' },
            { id: 'sc_1', code: '1', nom: 'Thèse non dégagée',   ponderation: 1,   retroaction: 'La thèse doit être explicite.' },
            { id: 'sc_2', code: '2', nom: 'Argument circulaire', ponderation: 0.5, retroaction: '' },
            { id: 'sc_3', code: '3', nom: 'Exemple absent',      ponderation: 1,   retroaction: '' }
        ] }]
    }]);
    // security-ok: fixture littérale du spec.
    db.setSync(cle('productions'), [{ id: 'P1', nom: 'Dissertation', grilleId: 'G1' }]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    await window.chargerGrillePourModif('G1');
    return {
        // .sous-critere-item sert aussi aux paliers de projection : on compte les champs Code.
        n: document.querySelectorAll('#listeCriteres .sous-critere-input-code').length,
        nom: (document.getElementById('nomGrilleTemplate') || {}).value,
        codes: [...document.querySelectorAll('#listeCriteres .sous-critere-input-code')].map(i => i.value),
        grilles: ((await db.get(cle('grillesTemplates'))) || []).map(g => g.id + ':' + g.nom + ':' + (g.criteres[0].sousCriteres || []).length),
        cle: cle('grillesTemplates')
    };
}`;

const LIRE = `async () => {
    const g = (await db.get(cle('grillesTemplates')))[0];
    const c = g.criteres[0];
    return {
        drapeau: c.codesDepuisSousCriteres,
        drapeauPresent: Object.prototype.hasOwnProperty.call(c, 'codesDepuisSousCriteres'),
        couleurs: c.sousCriteres.map(sc => sc.couleur),
        codes: codesAnnotation.listeCodes(g).map(x => x.id + ':' + x.couleur)
    };
}`;

test('codes par grille · gabarit — cocher active, décocher retire, la couleur suit', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const semis = await page.evaluate(eval(SEMER));
    console.log('SEMIS →', JSON.stringify(semis));
    expect(semis.n, 'les quatre sous-critères sont rendus').toBe(4);

    // ↻ Lot A (5 sept. 2026) : UNE seule liste — la case vit en tête des sous-critères, à plat (plus de carte
    // « Codes d'annotation ») ; la couleur et l'observation de chaque rangée n'apparaissent que si elle est cochée.
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli$=":codes"]')).toHaveCount(0);
    const bloc = page.locator('#listeCriteres .sous-criteres-conteneur--en-tete .sous-criteres-codes');
    const caseCodes = bloc.locator('input[type="checkbox"]');
    await expect(caseCodes).not.toBeChecked();
    await expect(bloc.locator('.sous-criteres-codes-note')).toContainText('Ce critère utilise encore les dix codes de la palette générale');   // ↻ lot 3a : la ligne de l'ébauche
    await expect(bloc.locator('.sous-criteres-codes-note')).toContainText('pondération 0');
    await expect(bloc.locator('.sous-criteres-codes-palette')).toContainText('palette générale');
    await expect(page.locator('#listeCriteres .sous-critere-couleur-groupe')).toHaveCount(0);

    // Cocher : le geste s'écrit, la note change, la palette d'une copie suit — et les couleurs se rendent.
    // ↻ 4 sept. 2026, 18 h 30 (run 33902352824 instable ici) : le clic passe par le DOM — sur le runner,
    // un clic souris coûte de 2 à 9 s, et le budget de 30 s s'épuise. Même dispatcher, même geste.
    await caseCodes.evaluate((el) => el.click());
    await expect(page.locator('#listeCriteres .sous-criteres-codes--actif')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .sous-criteres-codes-note')).toContainText('ces 3 sous-critères');

    // Les couleurs rendues : la sienne ou celle des dix par position ; gris pour le code 0.
    // Consigne du 3 sept. (16 h) : le champ est le sélecteur de la palette ; sa valeur vit
    // dans l'input caché qu'il pose (`.travaux-retro-couleur-input`).
    const couleursRendues = await page.locator('#listeCriteres .sous-critere-couleur-groupe .travaux-retro-couleur-input').evaluateAll(els => els.map(e => e.value));
    console.log('COULEURS RENDUES →', JSON.stringify(couleursRendues));
    expect(couleursRendues).toEqual(['#888888', '#c62828', '#c62828', '#e65100']);
    let etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS COCHE →', JSON.stringify(etat));
    expect(etat.drapeau).toBe(true);
    expect(etat.codes).toEqual(['errfr_1:#c62828', 'errfr_2:#c62828', 'errfr_3:#e65100']);
    const palette = await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F1', productionId: 'P1' } } }));
        return Object.keys(travauxOutils.OUTILS).filter(k => k.startsWith('errfr_'));
    });
    expect(palette).toEqual(['errfr_1', 'errfr_2', 'errfr_3']);

    // Changer la couleur du code 2 (« Personnalisé… » du sélecteur : l'input caché reçoit la
    // couleur et émet `change`) : écrite sur le sous-critère, lue par la liste.
    await page.evaluate(() => {
        const inp = document.querySelectorAll('#listeCriteres .sous-critere-couleur-groupe .travaux-retro-couleur-input')[2];
        inp.value = '#112233';
        inp.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS COULEUR →', JSON.stringify(etat));
    expect(etat.couleurs).toEqual([undefined, undefined, '#112233', undefined]);
    expect(etat.codes[1]).toBe('errfr_2:#112233');

    // Décocher : le champ est RETIRÉ, pas mis à false ; retour aux dix.
    await page.locator('#listeCriteres .sous-criteres-codes input[type="checkbox"]').evaluate((el) => el.click());
    await expect(page.locator('#listeCriteres .sous-criteres-codes--actif')).toHaveCount(0);
    await expect(page.locator('#listeCriteres .sous-critere-couleur-groupe')).toHaveCount(0);
    etat = await page.evaluate(eval(LIRE));
    console.log('APRÈS DÉCOCHE →', JSON.stringify(etat));
    expect(etat.drapeauPresent).toBe(false);
    expect(etat.codes).toHaveLength(10);
    // La couleur choisie reste sur le sous-critère : décocher ne jette rien.
    expect(etat.couleurs[2]).toBe('#112233');
});
