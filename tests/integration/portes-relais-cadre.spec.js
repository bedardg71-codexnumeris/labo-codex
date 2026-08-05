import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Filets du relais Cadre → Trimestre (4 août 2026) —
// `plans de travail/RELAIS-cadre-trimestre-2026-08-04.md`.
// Chaque item du relais converti en porte permanente atterrit ici.
//   #371 : les champs des semaines spéciales se chevauchaient (côte à côte) ;
//          semainePlanificationFin devenait inatteignable → borne vide →
//          compte de jours faux (#367 du relais). Correctif : empilement
//          vertical. Constaté dans CHROME à ~1470 px → reproductible ici.
//   #372 : l'encadré info-box vide autour d'« Enregistrer » est retiré.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

async function ouvrirAppEnDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
}

async function montrerTrimestre(page) {
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-calendrier')?.classList.add('active');
        document.getElementById('calendrier-trimestre')?.classList.add('active');
        // Ouvrir les accordéons COMME l'app (ferme → ouvert) : forcer
        // display:block sur le contenu d'une carte restée « ferme » fait
        // déborder le formulaire sur la carte suivante (faux positif).
        document.querySelectorAll('#calendrier-trimestre .carte.accordeon')
            .forEach(a => { a.classList.remove('ferme'); a.classList.add('ouvert'); });
    });
    await page.waitForTimeout(400);
}

test('#371 · Semaines spéciales : empilées, la borne de fin de planification est atteignable', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);

    const finPlanif = page.locator('#v2-semainePlanificationFin');
    await expect(finPlanif).toBeVisible();

    // 1. Le champ « au » de la planification est CLIQUABLE : l'élément peint
    //    en son centre est bien lui (c'est exactement ce qui échouait — le
    //    bloc Semaine d'examens le recouvrait).
    const dessus = await page.evaluate(() => {
        const el = document.getElementById('v2-semainePlanificationFin');
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return top === el ? 'champ' : (top ? (top.id || top.className || top.tagName) : 'rien');
    });
    expect(dessus, 'le champ semainePlanificationFin doit être l\'élément atteignable en son centre').toBe('champ');

    // 2. Empilement vertical : le bloc Semaine d'examens commence SOUS la fin
    //    du bloc Semaine de planification (aucun chevauchement possible).
    const geometrie = await page.evaluate(() => {
        const planif = document.getElementById('v2-semainePlanificationFin').getBoundingClientRect();
        const examens = document.getElementById('v2-semaineExamensDebut').getBoundingClientRect();
        return { basPlanif: planif.bottom, hautExamens: examens.top };
    });
    expect(geometrie.hautExamens).toBeGreaterThanOrEqual(geometrie.basPlanif);

    // 3. Non-régression #118 : pas d'overflow horizontal de la sous-section.
    const ov = await page.evaluate(() => {
        const el = document.getElementById('calendrier-trimestre');
        return { scrollW: el.scrollWidth, clientW: el.clientWidth };
    });
    expect(ov.scrollW).toBeLessThanOrEqual(ov.clientW);

    expect(erreurs).toEqual([]);
});

test('#366 · Les deux écrans affichent les MÊMES statistiques, calculées (plus de 15/75 inventés)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);

    // Calendrier synthétique VOLONTAIREMENT différent de 15/75 : 8 jours de
    // cours + 1 reprise = 9 jours, 2 semaines. Si un repli en dur revient,
    // l'un des écrans montrera 15/75 et l'écart le trahira.
    await page.evaluate(() => {
        const calendrier = {};
        const jours = ['2026-08-20', '2026-08-21', '2026-08-24', '2026-08-25', '2026-08-26',
                       '2026-08-27', '2026-08-28', '2026-08-31'];
        jours.forEach((d, i) => { calendrier[d] = { statut: 'cours', numeroSemaine: i < 5 ? 1 : 2 }; });
        calendrier['2026-09-01'] = { statut: 'conge' };
        calendrier['2026-09-02'] = { statut: 'reprise', numeroSemaine: 2 };
        db.setSync(window.cle('calendrierComplet'), calendrier); // security-ok: fixture de test locale
        db.setSync(window.cle('cadreCalendrier'), { dateDebut: '2026-08-20' }); // security-ok: fixture de test locale
    });

    // Écran 1 : sidebar du Trimestre (fonction pure via afficherStatistiquesTrimestreV2)
    const sidebar = await page.evaluate(() => {
        window.afficherStatistiquesTrimestreV2();
        return {
            semaines: document.getElementById('v2-nombreSemainesSidebar')?.textContent,
            jours: document.getElementById('v2-nombreJoursCoursSidebar')?.textContent
        };
    });
    expect(sidebar.semaines).toBe('2');
    expect(sidebar.jours).toBe('9');

    // Écran 2 : carte Légende du Calendrier scolaire (même fonction pure)
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-calendrier')?.classList.add('active');
        document.getElementById('calendrier-vue')?.classList.add('active');
        if (typeof window.afficherCalendrierScolaire === 'function') window.afficherCalendrierScolaire();
    });
    await page.waitForTimeout(400);

    const legende = await page.evaluate(() => {
        const valeurs = Array.from(document.querySelectorAll('.calendrier-legende-metriques .cal-valeur-grande-bleu'))
            .map(el => el.textContent.trim());
        return valeurs; // [semaines, jours, congés avec reprise]
    });
    expect(legende[0]).toBe('2');
    expect(legende[1]).toBe('9');

    expect(erreurs).toEqual([]);
});

test('#372 · Bouton Enregistrer du Trimestre : plus d\'encadré info-box vide autour', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);

    const bouton = page.locator('#calendrier-trimestre [data-action="sauvegarderTrimestreCompletV2"]');
    await expect(bouton).toBeVisible();

    // Le conteneur direct du bouton n'est plus une info-box (encadré bleu).
    const conteneurClasse = await bouton.evaluate(el => el.parentElement.className);
    expect(conteneurClasse).not.toContain('info-box');

    expect(erreurs).toEqual([]);
});
