import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #320 Lot L3 — filtre « par dossier » dans la modale biblio pratiques.
// Vérifie que le select de filtre masque les groupes non sélectionnés
// (groupes enveloppés en .biblio-groupe-repertoire) et que « Tous » réaffiche.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

test('L3 · le filtre « par dossier » masque les autres groupes', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequePratiques !== 'function' || !window.repertoiresBibliotheque) {
            return { erreur: 'pré-requis absents' };
        }

        window.db.setSync('repertoiresBibliotheques', []);
        const dossier = window.repertoiresBibliotheque.creer('Expérimentations', 'pratiques');

        // Classer une pratique réelle du pool dans le dossier
        await window.afficherBibliothequePratiques();
        const boutonAjouter = document.querySelector('[data-action="ajouterPratiqueALaSelection"]');
        const pratiqueId = boutonAjouter ? boutonAjouter.getAttribute('data-param') : null;
        if (!pratiqueId) return { erreur: 'aucune pratique dans le pool' };
        await window.classerPratiqueDansRepertoire(pratiqueId, dossier.id);

        // Le filtre dossier est présent + groupes enveloppés
        const selectExiste = !!document.getElementById('filtreRepertoirePratiques');
        const groupes = () => Array.from(document.querySelectorAll('#listePratiquesDisponibles .biblio-groupe-repertoire'));
        const nbGroupes = groupes().length;

        // Filtrer sur le dossier → seul ce groupe reste visible
        const select = document.getElementById('filtreRepertoirePratiques');
        select.value = dossier.id;
        window.filtrerParRepertoirePratiques();
        const visiblesApresFiltre = groupes().filter(d => d.style.display !== 'none');
        const filtreOk = visiblesApresFiltre.length === 1
            && visiblesApresFiltre[0].getAttribute('data-repertoire-id') === dossier.id;

        // Repasser à « Tous » → tout réapparaît
        select.value = '';
        window.filtrerParRepertoirePratiques();
        const tousVisibles = groupes().every(d => d.style.display !== 'none');

        return { selectExiste, nbGroupes, filtreOk, tousVisibles };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.selectExiste).toBe(true);
    expect(resultat.nbGroupes).toBeGreaterThanOrEqual(2); // dossier + « Non classées »
    expect(resultat.filtreOk).toBe(true);
    expect(resultat.tousVisibles).toBe(true);
    expect(erreurs).toEqual([]);
});
