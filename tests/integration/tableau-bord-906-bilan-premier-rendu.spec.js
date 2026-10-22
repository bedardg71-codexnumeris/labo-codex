import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #906 (19 sept. 2026) — LA PHRASE DU BILAN DES FONDAMENTAUX, AU PREMIER RENDU.
//
// Mesuré en 1.146.9 par une sonde sur le pack démo : après le retrait d'un élève (n'importe lequel des dix), la phrase
// sous la barre des patterns décrivait encore le groupe de dix au premier rendu, et le bon groupe au second seulement.
// `chargerTableauBordApercu` écrivait la phrase (lue dans `_tousEtudiantsEnrichis`) une quarantaine de lignes AVANT de
// rafraîchir cette liste. La barre des patterns, elle, lit la liste que le rendu lui passe : elle était à jour.
//
// Les phrases attendues sont celles que le code d'AVANT donnait au SECOND rendu, relevées par la sonde et figées ici :
// le correctif ne change aucun mot, il retire le retard.
//
// ⚠ Le changement de groupe n'est PAS un décrochage (le banc profil-745 couvre celui-là) : un élève retiré, puis rajouté.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const PHRASE_DIX = '9 étudiant·es (90 %) maîtrisent les fondamentaux multistructurels. 1 (10 %) en difficulté sur les fondamentaux (1 persistante).';
const PHRASE_SANS_DEMO004 = '8 étudiant·es (89 %) maîtrisent les fondamentaux multistructurels. 1 (11 %) en difficulté sur les fondamentaux (1 persistante).';
const PHRASE_SANS_DEMO015 = '9 étudiant·es (100 %) maîtrisent les fondamentaux multistructurels.';

test('tableau de bord · la phrase du bilan des fondamentaux décrit le groupe affiché dès le premier rendu', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const m = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
        await window.activerModeDemo();
        await pause(1500);

        // La carte des patterns se reconnaît à son titre (`data-tooltip="tdb-patterns"`) : la carte RàI, sa voisine dans le
        // même conteneur, porte elle aussi une `.interpretation-barre`.
        const lire = () => {
            const titre = document.querySelector('#conteneur-indicateurs-apprentissage [data-tooltip="tdb-patterns"]');
            const carte = titre ? titre.closest('.distribution-container') : null;
            if (!carte) return { carte: false };
            // La barre : la somme des quatre comptes de sa légende est le groupe qu'elle décrit.
            const comptes = Array.from(carte.querySelectorAll('.distribution-legende > span'))
                .map(s => parseInt((texte(s).match(/(\d+) \(\d+ %\)/) || [])[1], 10));
            return {
                carte: true,
                phrase: texte(carte.querySelector('.interpretation-barre')),
                comptesBarre: comptes,
                groupeBarre: comptes.reduce((a, b) => a + b, 0)
            };
        };
        const unRendu = async () => { chargerTableauBordApercu(); await pause(700); return lire(); };

        const complet = JSON.parse(JSON.stringify(obtenirDonneesSelonMode('groupeEtudiants')));
        const sans = (da) => complet.filter(e => e.da !== da);

        // État de départ : deux rendus, pour partir d'une phrase qui décrit bien les dix — quel que soit le code jugé.
        await unRendu();
        const depart = await unRendu();

        // (A) un élève RETIRÉ du groupe (DEMO004, qui maîtrise) — UN seul rendu.
        sauvegarderDonneesSelonMode('groupeEtudiants', sans('DEMO004'));
        const retire = await unRendu();

        // (B) le même élève RAJOUTÉ — UN seul rendu.
        sauvegarderDonneesSelonMode('groupeEtudiants', complet);
        const rajoute = await unRendu();

        // (C) le seul élève en difficulté retiré (DEMO015) : toute une proposition de la phrase disparaît — UN seul rendu.
        sauvegarderDonneesSelonMode('groupeEtudiants', sans('DEMO015'));
        const retireEnDifficulte = await unRendu();

        return { nbEleves: complet.length, depart, retire, rajoute, retireEnDifficulte };
    });

    // Le départ est bien celui que la sonde a relevé (sinon les phrases figées ne jugeraient rien).
    expect(m.nbEleves).toBe(10);
    expect(m.depart).toMatchObject({ carte: true, phrase: PHRASE_DIX, groupeBarre: 10 });

    // (A) retiré : la barre ET la phrase décrivent les neuf, au premier rendu.
    expect(m.retire.groupeBarre).toBe(9);
    expect(m.retire.phrase).toBe(PHRASE_SANS_DEMO004);

    // (B) rajouté : la barre ET la phrase décrivent de nouveau les dix, au premier rendu.
    expect(m.rajoute.groupeBarre).toBe(10);
    expect(m.rajoute.phrase).toBe(PHRASE_DIX);

    // (C) l'élève en difficulté retiré : la proposition « en difficulté » part au premier rendu.
    expect(m.retireEnDifficulte.groupeBarre).toBe(9);
    expect(m.retireEnDifficulte.phrase).toBe(PHRASE_SANS_DEMO015);
});
