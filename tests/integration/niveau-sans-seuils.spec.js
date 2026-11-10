import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LOT « NIVEAU SANS SEUILS » (10 nov. 2026) — rapport : `plans de travail/RAPPORT-2026-11-10-niveau-sans-seuils.md`.
// Ce que la VUE ÉTENDUE fait d'un niveau ajouté en vue simple (une valeur, aucun seuil) et d'une note au-dessus de 100.
// Le parcours est celui de la mesure, PAR L'INTERFACE : une classe collée, un modèle, un niveau « Exemplaire » qui vaut
// 110, deux productions, quatre étudiant·es. Noms fictifs. Aucune mesure pendant une transition, aucun rechargement.
// Écrit et éprouvé sous Chromium (session cloud) ; le verdict WebKit se prend sur le Mac.

const patternsAttendus = [/version\.json/i, /Cross origin requests/i, /Not allowed to load local resource/i, /favicon/i, /ERR_FILE_NOT_FOUND/i];
const LISTE = '9990001, Albatros, Ada\n9990002, Baobab, Bruno\n9990003, Cormoran, Chloé\n9990004, Dahlia, Dario';

async function classeNoteeAvecUnNiveauAjoute(page) {
    const erreurs = [];
    const garder = (m) => { if (!patternsAttendus.some((re) => re.test(m))) erreurs.push(m); };
    page.on('console', (m) => { if (m.type() === 'error') garder(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => garder(`pageerror: ${e.message}`));
    // Sous un banc, l'application s'ouvre en vue étendue ; ce parcours commence en vue simple, comme un nouvel arrivant.
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
    await page.goto(indexHtml);
    await attendreApplication(page);

    await page.locator('#simple-accueil-contenu [data-param="classe"]').click();
    await page.fill('#vs-liste', LISTE);
    await page.locator('#simple-classe-contenu [data-action="VueSimple.creerClasse"]').click();
    await expect(page.locator('#simple-classe-contenu .vs-succes')).toHaveText('Classe créée : 4 étudiant·es.');

    await page.locator('.navigation-vue-simple [data-onglet="simple-pratique"]').click();
    await page.locator('[data-action="VueSimple.choisirModele"][data-param="STD-n-meilleurs"]').click();
    await page.locator('#vs-bloc-niveaux [data-action="VueSimple.regler"]').click();
    await page.locator('[data-action="VueSimple.niveauGeste"][data-param="ajouter"]').click();
    const rangee = page.locator('.vs-niveau-rangee').nth(5);
    await rangee.locator('.vs-n-code').fill('X');
    await rangee.locator('.vs-n-nom').fill('Exemplaire');
    await rangee.locator('.vs-n-valeur').fill('110');
    await page.locator('[data-action="VueSimple.enregistrerReglage"]').click();
    await expect(page.locator('#simple-pratique-contenu .vs-succes')).toBeVisible();

    await page.locator('.navigation-vue-simple [data-onglet="simple-resultats"]').click();
    for (const nom of ['Production 1', 'Production 2']) {
        await page.locator('#simple-resultats-contenu [data-action="VueSimple.ouvrirProduction"]').first().click();
        await page.fill('#vs-production-nom', nom);
        await page.fill('#vs-production-date', '2026-11-02');
        await page.locator('[data-action="VueSimple.ajouterProduction"]').click();
        await expect(page.locator('#vs-tableau-hote .tn-production-titre', { hasText: nom })).toBeVisible();
    }
    // Ada : X, X (110) · Bruno : E, M · Chloé : PS, PS (0) · Dario : M, M (75)
    const saisies = ['xx', 'em', 'pp', 'mm'];
    for (let i = 0; i < saisies.length; i++) {
        await page.locator(`#vs-tableau-hote tbody tr:nth-child(${i + 1}) .tn-case`).first().focus();
        for (const lettre of saisies[i]) { await page.keyboard.press(lettre); await page.keyboard.press('ArrowRight'); }
    }
    const notes = page.locator('#vs-tableau-hote .tn-note-valeur');
    await expect(notes).toHaveText(['110', '88', '0', '75']);

    await page.locator('#entete-menu-bouton').click();
    await page.locator('#menu-vue-etendue').click();
    await expect(page.locator('body')).not.toHaveClass(/vue-simple/);
    return erreurs;
}

/** L'échelle « Mes niveaux » de la pratique du groupe actif, telle qu'elle est en base. */
const echelleDuGroupe = () => {
    const groupe = window.db.getSync('groupeCoursActif');
    const pratique = window.db.getSync(window.cle('pratiquesConfigurables'), []).find((x) => x.id === groupe.pratiqueId);
    return window.db.getSync(window.cle('echellesTemplates'), []).find((x) => x.id === pratique.configuration.echelleId);
};

test.describe('niveau sans seuils — la vue étendue', () => {
    test('la répartition du Suivi range la note de 0 au plus bas niveau, celle de 110 au plus haut, et ne montre pas le niveau sans seuils', async ({ page }) => {
        const erreurs = await classeNoteeAvecUnNiveauAjoute(page);
        await page.evaluate(() => window.naviguerVers('suivi', 'groupe'));
        const suivi = page.locator('#suivi-groupe');
        // Mesuré avant ce lot : « Préstructurel : 0 • Exemplaire : 1 • … • Étendu : 1 » — l'étudiante à 0 dans le niveau
        // ajouté, l'étudiante à 110 nulle part.
        await expect(suivi).toContainText('Préstructurel : 1 • Incomplet : 0 • Développement : 0 • Maîtrise : 1 • Étendu : 2');
        await expect(suivi).not.toContainText('Exemplaire :');
        await expect(suivi).toContainText('3 étudiant·es (75 %) ont atteint ou dépassé le niveau de maîtrise.');
        expect(erreurs).toEqual([]);
    });

    test('le PDF de l\'échelle imprime un tiret pour la plage du niveau sans seuils, et les vraies plages des autres', async ({ page }) => {
        await classeNoteeAvecUnNiveauAjoute(page);
        const echelle = await page.evaluateHandle(echelleDuGroupe);
        const rangees = await page.evaluate((e) => {
            // Lu par un analyseur, sans rien écrire dans la page : l'aperçu est une chaîne HTML.
            const lu = new DOMParser().parseFromString(window.ExportPDF.apercuEchelle(e), 'text/html');
            return [...lu.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.replace(/\s+/g, ' ').trim()));   // l'espace insécable devant « % » ramenée à une espace
        }, echelle);
        expect(rangees.map((r) => r[0])).toEqual(['PS', 'I', 'D', 'M', 'E', 'X']);
        expect(rangees[5]).toEqual(['X', 'Exemplaire', '—', '—']);
        expect(rangees[4][3]).toBe('85 % - 100 %');
        expect(rangees.map((r) => r[3])).toEqual(['0 % - 39,99 %', '40 % - 64,99 %', '65 % - 74,99 %', '75 % - 84,99 %', '85 % - 100 %', '—']);
    });

    test('le partage ne refuse plus la valeur 110 du niveau ajouté', async ({ page }) => {
        await classeNoteeAvecUnNiveauAjoute(page);
        const echelle = await page.evaluateHandle(echelleDuGroupe);
        const refus = await page.evaluate((e) => {
            const verdict = window.partageValidation.validerPackage(window.partageFormat.construirePackage(e, { type: 'echelle' }));
            return { valeurs: e.niveaux.map((n) => n.valeurCalcul), champs: (verdict.erreurs || []).map((x) => x.champ) };
        }, echelle);
        expect(refus.valeurs).toContain(110);
        expect(refus.champs.filter((c) => /valeurCalcul/.test(c))).toEqual([]);
        // ⚠ CONNU, HORS DE CE LOT (inscrit au rapport) : ce paquet reste refusé pour une AUTRE raison — deux couleurs des
        // niveaux par défaut (`var(--niveau-attention-critique)`, 32 caractères) dépassent la limite de 30 du schéma.
        // Le jour où ce refus est levé, cette ligne rougit : c'est voulu, elle devient `toEqual([])`.
        expect(refus.champs.every((c) => /\.couleur$/.test(c))).toBe(true);
    });
});
