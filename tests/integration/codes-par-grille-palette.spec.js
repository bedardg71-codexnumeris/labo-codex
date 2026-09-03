import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LES CODES PAR GRILLE, lot 2 — la palette des codes suit la grille de la copie
// ouverte (3 septembre 2026), dans un vrai WebKit, contre le vrai index.html.
//
// Ce que ce spec mesure, et que Vitest ne peut pas :
//   · une copie d'une production dont la grille est ACTIVÉE (geste
//     `codesDepuisSousCriteres`) donne ses sous-critères comme codes — numérotés
//     par leur code, nommés par leur nom, le code 0 (pondération 0) exclu ;
//   · une copie d'une grille SANS geste, une copie orpheline, ou la fermeture,
//     rendent les dix codes d'hier — noms compris ;
//   · un code posé que la liste ne connaît pas garde son numéro : jamais perdu ;
//   · un code actif que la nouvelle liste ne connaît plus laisse la place au stylo.
//
// L'ouverture réelle d'un fichier exige un blob en IndexedDB ; ce que le lot a
// livré passe par l'ÉVÉNEMENT `travaux-fichier-ouvert` (émis par la visionneuse
// dès que le fichier est connu) : c'est lui qu'on émet ici, avec le même détail.

const SEMER = `() => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    const sousCriteres = [
        { id: 'sc_0', code: '0', nom: 'Aucune erreur',       ponderation: 0,   retroaction: 'Rien à cibler.' },
        { id: 'sc_1', code: '1', nom: 'Thèse non dégagée',   ponderation: 1,   retroaction: 'La thèse doit être explicite.' },
        { id: 'sc_2', code: '2', nom: 'Argument circulaire', ponderation: 0.5, retroaction: 'L’argument suppose ce qu’il prouve.', couleur: '#123456' },
        { id: 'sc_3', code: '3', nom: 'Exemple absent',      ponderation: 1,   retroaction: '' }
    ];
    const critere = (drapeau) => ({ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20,
        codesDepuisSousCriteres: drapeau, sousCriteres: JSON.parse(JSON.stringify(sousCriteres)) });
    db.setSync(cle('grillesTemplates'), [
        { id: 'G_ACT',   nom: 'Philo activée', criteres: [critere(true)] },
        { id: 'G_REPLI', nom: 'Philo sans geste', criteres: [critere(false)] }
    ]);
    db.setSync(cle('productions'), [
        { id: 'P_ACT',   nom: 'Dissertation', grilleId: 'G_ACT' },
        { id: 'P_REPLI', nom: 'Résumé',       grilleId: 'G_REPLI' },
        { id: 'P_SANS',  nom: 'Sans grille',  grilleId: '' }
    ]);
    return true;
}`;

const OUVRIR = `(productionId) => {
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_' + productionId, productionId: productionId } } }));
    const grille = travauxOutils.grilleCourante();
    const html = travauxOutils.genererContenuErreursFr();
    const items = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('.travaux-errfr-item')]
        .map(el => ({ id: el.dataset.param, numero: el.querySelector('.travaux-errfr-numero').textContent, nom: el.querySelector('.travaux-errfr-nom').textContent }));
    return {
        grilleId: grille ? grille.id : null,
        outils: Object.keys(travauxOutils.OUTILS).filter(k => k.startsWith('errfr_')),
        items: items,
        inconnu: codesAnnotation.code(grille, 'errfr_9').numero,
        outilActif: travauxOutils.getOutilActif ? travauxOutils.getOutilActif().id : null
    };
}`;

test('codes par grille · la copie d\'une grille ACTIVÉE donne ses sous-critères comme codes', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));

    const r = await page.evaluate(eval(OUVRIR), 'P_ACT');
    console.log('ACTIVÉE →', JSON.stringify(r));
    expect(r.grilleId).toBe('G_ACT');
    expect(r.outils).toEqual(['errfr_1', 'errfr_2', 'errfr_3']);
    expect(r.items.map(i => i.id)).toEqual(['errfr_1', 'errfr_2', 'errfr_3']);
    expect(r.items.map(i => i.numero)).toEqual(['1', '2', '3']);
    expect(r.items.map(i => i.nom)).toEqual(['Thèse non dégagée', 'Argument circulaire', 'Exemple absent']);
    // Le code 0 « Aucune erreur » (pondération 0) ne se pose pas.
    expect(r.items.some(i => i.nom === 'Aucune erreur')).toBe(false);
    // Un code posé que cette grille ne connaît pas garde son numéro : jamais perdu.
    expect(r.inconnu).toBe('9');
});

test('codes par grille · sans geste, copie orpheline ou fermeture : les dix d\'hier', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));

    const dix = ['errfr_1', 'errfr_2', 'errfr_3', 'errfr_4', 'errfr_5', 'errfr_6', 'errfr_7', 'errfr_8', 'errfr_9', 'errfr_10'];
    const sansGeste = await page.evaluate(eval(OUVRIR), 'P_REPLI');
    console.log('SANS GESTE →', JSON.stringify(sansGeste));
    expect(sansGeste.grilleId, 'la grille est connue…').toBe('G_REPLI');
    expect(sansGeste.outils, '…mais sans geste, la liste est le repli').toEqual(dix);
    expect(sansGeste.items[0].nom).toBe('Construction syntaxique / accord du verbe');
    expect(sansGeste.items.map(i => i.numero)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);

    const sansGrille = await page.evaluate(eval(OUVRIR), 'P_SANS');
    expect(sansGrille.grilleId).toBeNull();
    expect(sansGrille.outils).toEqual(dix);

    const orpheline = await page.evaluate(eval(OUVRIR), '');
    expect(orpheline.grilleId).toBeNull();
    expect(orpheline.outils).toEqual(dix);

    // Activée, puis fermée : retour au repli.
    await page.evaluate(eval(OUVRIR), 'P_ACT');
    const apresFermeture = await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('travaux-fichier-ferme'));
        return { grille: travauxOutils.grilleCourante(), outils: Object.keys(travauxOutils.OUTILS).filter(k => k.startsWith('errfr_')) };
    });
    expect(apresFermeture.grille).toBeNull();
    expect(apresFermeture.outils).toEqual(dix);
});

test('codes par grille · un code actif que la nouvelle liste ne connaît plus laisse la place au stylo', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));

    const r = await page.evaluate(async (ouvrir) => {
        travauxOutils.setOutilActif('errfr_7');   // sous le repli, le 7 existe
        const avant = travauxOutils.getOutilActif ? travauxOutils.getOutilActif().id : null;
        const apres = eval(ouvrir)('P_ACT');       // la grille activée n'a pas de 7
        return { avant, apres: apres.outilActif };
    }, OUVRIR);
    console.log('OUTIL ACTIF →', JSON.stringify(r));
    expect(r.avant).toBe('errfr_7');
    expect(r.apres).toBe('stylo');
});
