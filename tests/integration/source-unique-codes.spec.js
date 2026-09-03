import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// UNE SEULE SOURCE POUR LES CODES, ET UNE SEULE FAÇON DE CHOISIR UNE COULEUR
// (consigne du 3 septembre 2026, 16 h) — dans un vrai WebKit.
//
//   · copie gouvernée par sa grille (case cochée) : la palette des codes ne porte
//     PAS de bandeau (coup d'œil de Grégoire : trop de place), l'engrenage reste et
//     porte la phrase de Grégoire avec le NOM de la grille, et l'écran qu'il ouvre
//     n'offre que la phrase ;
//   · copie sans grille : ni phrase ni garde, « Personnaliser » présent, l'écran
//     édite les dix — et la personnalisation de Grégoire (noms courts, couleurs,
//     ordre) s'y lit au caractère près et n'a pas bougé ;
//   · gabarit : le champ Couleur d'un sous-critère est le sélecteur de la palette
//     (douze pastilles + « Personnalisé… ») ; une pastille écrit la couleur ; une
//     couleur déjà choisie hors des douze reste affichée telle quelle.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync('personnalisationErreursFr', { errfr_2: { nom: 'Accord GV', couleur: '#112233' }, errfr_6: { nom: 'Accord PP' } });
    // security-ok: fixture littérale du spec.
    db.setSync('ordreErreursFr', ['errfr_6', 'errfr_1', 'errfr_2', 'errfr_3', 'errfr_4', 'errfr_5', 'errfr_7', 'errfr_8', 'errfr_9', 'errfr_10']);
    // security-ok: fixture littérale du spec.
    await db.set(cle('grillesTemplates'), [{
        id: 'G1', nom: 'Philo activée', dansBibliotheque: true,
        criteres: [{ id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true, sousCriteres: [
            { id: 'sc_1', code: '1', nom: 'Thèse non dégagée',   ponderation: 1 },
            { id: 'sc_2', code: '2', nom: 'Argument circulaire', ponderation: 0.5, couleur: '#abcdef' }
        ] }]
    }]);
    // security-ok: fixture littérale du spec.
    db.setSync(cle('productions'), [{ id: 'P1', nom: 'Dissertation', grilleId: 'G1' }]);
    return true;
}`;

const LIRE_PALETTE = `() => {
    // La palette flottante s'insère dans la zone du canevas de l'écran Annoter :
    // on la fournit (même geste que la spec des compteurs, pour sa palette).
    if (!document.getElementById('travaux-zone-canvas')) {
        const zone = document.createElement('div');
        zone.id = 'travaux-zone-canvas';
        document.body.appendChild(zone);
    }
    if (document.getElementById('travaux-palette-erreurs-fr')) travauxOutils.fermerPaletteErreursFrancais();
    travauxOutils.togglePaletteErreursFrancais();
    const pal = document.getElementById('travaux-palette-erreurs-fr');
    const src = pal.querySelector('.travaux-errfr-source');
    const engrenage = pal.querySelector('[data-action="travauxOutils.ouvrirEditionRetroErreursFr"]');
    travauxOutils.ouvrirEditionRetroErreursFr();
    const modal = document.getElementById('modal-retro-erreurs-fr');
    const r = {
        bandeau: src ? src.textContent : null,
        boutonPersonnaliser: !!engrenage,
        titreEngrenage: engrenage ? engrenage.getAttribute('title') : null,
        items: [...pal.querySelectorAll('.travaux-errfr-item')].map(el => el.querySelector('.travaux-errfr-numero').textContent + ':' + el.querySelector('.travaux-errfr-nom').textContent),
        modalPhrase: modal ? (modal.querySelector('.travaux-errfr-source') || {}).textContent || null : null,
        modalChampsNom: modal ? modal.querySelectorAll('input[data-nom-id]').length : -1,
        modalNoms: modal ? [...modal.querySelectorAll('input[data-nom-id]')].map(i => i.value) : [],
        perso: JSON.stringify(db.getSync('personnalisationErreursFr', null)),
        ordre: JSON.stringify(db.getSync('ordreErreursFr', null))
    };
    travauxOutils.fermerModalRetroErreursFr();
    travauxOutils.fermerPaletteErreursFrancais();
    return r;
}`;

test('source unique · copie gouvernée : pas de bandeau, l\'engrenage porte la phrase, l\'écran n\'édite pas', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));
    const persoAvant = await page.evaluate(() => JSON.stringify(db.getSync('personnalisationErreursFr', null)));

    const gouvernee = await page.evaluate((lire) => {
        window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F1', productionId: 'P1' } } }));
        return eval(lire)();
    }, LIRE_PALETTE);
    console.log('GOUVERNÉE →', JSON.stringify(gouvernee));
    const PHRASE = 'Les codes de cette copie viennent de sa grille « Philo activée ». Pour les modifier, ouvre la grille.';
    expect(gouvernee.bandeau, 'pas de bandeau dans l\'espace de travail').toBeNull();
    expect(gouvernee.boutonPersonnaliser, 'l\'engrenage reste').toBe(true);
    expect(gouvernee.titreEngrenage).toBe(PHRASE);
    expect(gouvernee.items).toEqual(['1:Thèse non dégagée', '2:Argument circulaire']);
    expect(gouvernee.modalPhrase).toBe(PHRASE);
    expect(gouvernee.modalChampsNom, 'aucun champ à éditer sous gouvernance').toBe(0);
    expect(gouvernee.perso, 'la personnalisation globale n\'a pas bougé').toBe(persoAvant);
});

test('source unique · copie sans grille : l\'édition du repli, intacte au caractère près', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));
    const persoAvant = await page.evaluate(() => JSON.stringify(db.getSync('personnalisationErreursFr', null)));
    const ordreAvant = await page.evaluate(() => JSON.stringify(db.getSync('ordreErreursFr', null)));

    // Gouvernée, puis fermée : le repli revient, éditable.
    const repli = await page.evaluate((lire) => {
        window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F1', productionId: 'P1' } } }));
        window.dispatchEvent(new CustomEvent('travaux-fichier-ferme'));
        return eval(lire)();
    }, LIRE_PALETTE);
    console.log('REPLI →', JSON.stringify(repli));
    expect(repli.bandeau).toBeNull();
    expect(repli.boutonPersonnaliser).toBe(true);
    expect(repli.titreEngrenage).toBe('Personnaliser');
    expect(repli.modalChampsNom).toBe(10);
    // Les noms courts de Grégoire, dans SON ordre : « Accord PP » (errfr_6) est premier.
    expect(repli.modalNoms[0]).toBe('Accord PP');
    expect(repli.modalNoms[2]).toBe('Accord GV');
    expect(repli.items[0]).toBe('1:Accord PP');
    expect(repli.items[2]).toBe('3:Accord GV');
    expect(repli.perso).toBe(persoAvant);
    expect(repli.ordre).toBe(ordreAvant);
});

test('source unique · gabarit : le champ Couleur est le sélecteur de la palette, douze pastilles et « Personnalisé… »', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(eval(SEMER));
    await page.evaluate(async () => {
        window.afficherSection('conception');
        window.afficherSousSection('conception-grille-criteres');
        await window.chargerGrillePourModif('G1');
    });

    const pickers = page.locator('#listeCriteres .sous-critere-couleur-groupe .travaux-retro-couleur-picker');
    await expect(pickers).toHaveCount(2);
    const rendu = await page.evaluate(() => {
        const groupes = [...document.querySelectorAll('#listeCriteres .sous-critere-couleur-groupe')];
        return groupes.map(g => ({
            pastilles: g.querySelectorAll('.travaux-btn-couleur').length,
            perso: !!g.querySelector('.travaux-btn-couleur-perso'),
            affichee: g.querySelector('summary').style.background,
            inputsColorNus: document.querySelectorAll('#listeCriteres input[type="color"]:not(.travaux-retro-couleur-input)').length
        }));
    });
    console.log('SÉLECTEURS →', JSON.stringify(rendu));
    expect(rendu.every(r => r.pastilles === 12 && r.perso)).toBe(true);
    // La couleur hors des douze déjà enregistrée reste affichée telle quelle.
    expect(rendu[1].affichee.replace(/\s/g, '')).toMatch(/rgb\(171,205,239\)|#abcdef/);
    expect(rendu[0].inputsColorNus).toBe(0);

    // Ouvert, puis un clic ailleurs : il se referme (coup d'œil de Grégoire).
    await pickers.nth(1).locator('summary').click();
    await expect(pickers.nth(1)).toHaveAttribute('open', '');
    await page.locator('#nomGrilleTemplate').click();
    await expect(pickers.nth(1)).not.toHaveAttribute('open', '');

    // Choisir une pastille sur le premier sous-critère : la couleur s'écrit.
    await pickers.nth(0).locator('summary').click();
    await pickers.nth(0).locator('.travaux-btn-couleur[data-couleur="#22c55e"]').click();
    await page.waitForTimeout(400);
    const apres = await page.evaluate(async () => {
        const g = (await db.get(cle('grillesTemplates')))[0];
        return { couleurs: g.criteres[0].sousCriteres.map(sc => sc.couleur), codes: codesAnnotation.listeCodes(g).map(c => c.couleur) };
    });
    console.log('APRÈS PASTILLE →', JSON.stringify(apres));
    expect(apres.couleurs).toEqual(['#22c55e', '#abcdef']);
    expect(apres.codes).toEqual(['#22c55e', '#abcdef']);
});
