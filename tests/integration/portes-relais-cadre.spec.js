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
    // #1148 (24 oct. 2026) : la rangée de sélection et le résumé du trimestre passent AU-DESSUS de la fiche ;
    // le champ descend sous le bas de la fenêtre, où `elementFromPoint` ne rend rien. Le banc mesure un
    // recouvrement, pas une position : il amène le champ dans la vue d'abord.
    await finPlanif.scrollIntoViewIfNeeded();

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

test('#369 · Avertissements de cohérence : visibles sur saisie fautive, SILENCE sur saisie propre', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);

    // Saisie fautive : les DEUX cas réels du relais (remise des notes en août
    // + borne de planification manquante).
    const fautif = await page.evaluate(() => {
        db.setSync(window.cle('cadreCalendrier'), { // security-ok: fixture de test locale
            dateDebut: '2026-08-20', finCours: '2026-12-11', finTrimestre: '2026-12-21',
            remiseNotes: '2026-08-29', semainePlanificationDebut: '2026-10-12', semainePlanificationFin: ''
        });
        window.afficherStatistiquesTrimestreV2();
        const zone = document.getElementById('v2-avertissementsCadre');
        return { visible: !zone.classList.contains('u-hide'), texte: zone.textContent };
    });
    expect(fautif.visible).toBe(true);
    expect(fautif.texte).toContain('remise des notes');
    expect(fautif.texte).toContain('planification');
    expect(fautif.texte).toContain('rien n\'est bloqué');

    // Saisie corrigée → la zone se tait et disparaît.
    const propre = await page.evaluate(() => {
        db.setSync(window.cle('cadreCalendrier'), { // security-ok: fixture de test locale
            dateDebut: '2026-08-20', finCours: '2026-12-11', finTrimestre: '2026-12-21',
            remiseNotes: '2026-12-29', semainePlanificationDebut: '2026-10-12', semainePlanificationFin: '2026-10-16'
        });
        window.afficherStatistiquesTrimestreV2();
        const zone = document.getElementById('v2-avertissementsCadre');
        return { visible: !zone.classList.contains('u-hide'), texte: zone.textContent };
    });
    expect(propre.visible).toBe(false);
    expect(propre.texte).toBe('');

    expect(erreurs).toEqual([]);
});

test('#374 · Fusion « Journées sans cours » : migration des 2 anciennes clés + carte unique', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);

    // 1. MIGRATION : semer les DEUX anciennes clés (préfixe démo actif) puis
    //    rejouer la migration boot — tout converge vers journeesSansCours.
    const migration = await page.evaluate(() => {
        const prefixe = window.cle('cadreCalendrier').replace('cadreCalendrier', '');
        localStorage.setItem(prefixe + 'evenementsPrevus', JSON.stringify([ // security-ok: fixture de test locale
            { id: 'EVT_A', dateEvenement: '2026-09-07', description: 'Fête du travail', categorie: 'institutionnel', horaireReprise: 'Lundi', dateReprise: '2026-09-10' }
        ]));
        localStorage.setItem(prefixe + 'evenementsImprevus', JSON.stringify([ // security-ok: fixture de test locale
            { id: 'EVT_B', dateEvenement: '2026-10-20', description: 'Tempête', categorie: 'institutionnel', horaireReprise: '', dateReprise: '' }
        ]));
        const nb = window.migrerJourneesSansCours();
        return {
            nb,
            fusionnes: db.getSync(window.cle('journeesSansCours'), []).map(e => e.id),
            anciennesSupprimees: !localStorage.getItem(prefixe + 'evenementsPrevus') && !localStorage.getItem(prefixe + 'evenementsImprevus')
        };
    });
    expect(migration.nb).toBe(2);
    expect(migration.fusionnes).toEqual(['EVT_A', 'EVT_B']);
    expect(migration.anciennesSupprimees).toBe(true);

    // 2. CARTE UNIQUE : les deux événements migrés s'affichent, les anciens
    //    conteneurs jumeaux n'existent plus.
    const affichage = await page.evaluate(() => {
        window.chargerJourneesSansCoursV2();
        return {
            nbCartes: document.querySelectorAll('#v2-journeesSansCoursContainer .item-carte-compact').length,
            compteur: document.getElementById('v2-nombreJourneesSansCours')?.textContent,
            anciensConteneurs: !!document.getElementById('v2-congesPrevusContainer') || !!document.getElementById('v2-congesImprevusContainer')
        };
    });
    expect(affichage.nbCartes).toBe(2);
    expect(affichage.compteur).toBe('2');
    expect(affichage.anciensConteneurs).toBe(false);

    // 3. (19 nov. 2026) La partie « nature Férié » est retirée avec la nature : la
    //    question de reprise qui la remplace a son propre test, juste en dessous.

    expect(erreurs).toEqual([]);
});

// Lot « journées reprise » (19 nov. 2026, décision de Grégoire) : le menu « Nature »
// cède la place à « Cette journée sera-t-elle reprise ? ». Par les VRAIS gestes (clics
// sur les radios : le dispatcher data-on-change est dans le chemin). Le choix n'est pas
// stocké : il se déduit de dateReprise. Oui → la journée sort du compte des semaines ;
// Non → elle reste comptée, badge « Non reprise », le jour porte son numéro de semaine.
test('Journées sans cours · la question de reprise décide, et se relit de dateReprise', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);
    await page.evaluate(() => {
        db.setSync(window.cle('cadreCalendrier'), { // security-ok: fixture de test locale
            dateDebut: '2026-08-20', finCours: '2026-12-11', finTrimestre: '2026-12-21'
        });
        db.setSync(window.cle('journeesSansCours'), []); // security-ok: fixture de test locale
        window.chargerJourneesSansCoursV2();
    });
    const nb = () => page.evaluate(() => db.getSync(window.cle('journeesSansCours'), []).length);
    const blocVisible = () => page.locator('#v2-blocReprise').isVisible();
    // Gestes par l'événement DOM (TESTS-AUTOMATISES.md §4) : el.click() coche le radio et
    // émet « change », qui traverse le dispatcher data-on-change de main.js comme la souris.
    const geste = (sel) => page.locator(sel).evaluate((el) => el.click());

    // 1. Ajout : le menu Nature n'existe plus ; aucune réponse pré-cochée, bloc masqué.
    //    Le seul clic à la souris du spec : il prouve le pointeur sur « + Ajouter ».
    await page.locator('[data-action="afficherFormEvenementV2"]').click();
    expect(await page.locator('#v2-categorieEvenement').count()).toBe(0);
    expect(await page.locator('#v2-repriseOui').isChecked()).toBe(false);
    expect(await page.locator('#v2-repriseNon').isChecked()).toBe(false);
    expect(await blocVisible()).toBe(false);

    // 2. Sans réponse, rien n'est écrit.
    await page.fill('#v2-dateEvenement', '2026-11-10');
    await page.fill('#v2-descriptionEvenement', 'Grève');
    await geste('#v2-btnConfirmerEvenement');
    expect(await nb()).toBe(0);

    // 3. « Oui » montre horaire et date, alors obligatoires (date seule : refus).
    await geste('#v2-repriseOui');
    expect(await blocVisible()).toBe(true);
    await page.fill('#v2-dateReprise', '2026-11-21');
    await geste('#v2-btnConfirmerEvenement');
    expect(await nb()).toBe(0);

    // 4. « Non » masque ET vide les champs de reprise ; la journée s'enregistre sans reprise.
    await geste('#v2-repriseNon');
    expect(await blocVisible()).toBe(false);
    expect(await page.inputValue('#v2-dateReprise')).toBe('');
    await geste('#v2-btnConfirmerEvenement');
    const nonReprise = await page.evaluate(() => {
        const j = db.getSync(window.cle('journeesSansCours'), [])[0];
        const cal = db.getSync(window.cle('calendrierComplet'), {});
        const carte = document.querySelector('#v2-journeesSansCoursContainer .item-carte-compact');
        return { j, jour: cal['2026-11-10'], badge: carte?.querySelector('.badge-non-reprise')?.textContent, texte: carte?.textContent };
    });
    expect(nonReprise.j.dateReprise).toBe('');
    expect('categorie' in nonReprise.j).toBe(false);          // la nature n'est plus écrite
    expect(nonReprise.badge).toBe('Non reprise');
    expect(nonReprise.texte).not.toContain('Reprise le');
    expect(nonReprise.jour.statut).toBe('conge');
    expect(nonReprise.jour.nonReprise).toBe(true);
    expect(nonReprise.jour.numeroSemaine).toBeGreaterThan(0);
    // La vue calendaire : pointillé « non reprise », motif précédé du numéro de semaine.
    const caseJour = await page.evaluate(() => {
        window.afficherCalendrierScolaire();
        const td = document.querySelector('td[data-date="2026-11-10"]');
        return { classe: td?.className, texte: td?.textContent };
    });
    expect(caseJour.classe).toContain('calendrier-jour-conge-non-reprise');
    expect(caseJour.texte).toContain('S' + nonReprise.jour.numeroSemaine + ' · Grève');

    // 5. Une journée REPRISE : pas de badge, la ligne « → Reprise le … » suffit ; hors compte.
    await geste('[data-action="afficherFormEvenementV2"]');
    expect(await page.locator('#v2-repriseNon').isChecked()).toBe(false);   // le formulaire repart vierge
    await page.fill('#v2-dateEvenement', '2026-09-07');
    await page.fill('#v2-descriptionEvenement', 'Fête du travail');
    await geste('#v2-repriseOui');
    await page.selectOption('#v2-horaireReprise', 'Lundi');
    await page.fill('#v2-dateReprise', '2026-09-10');
    await geste('#v2-btnConfirmerEvenement');
    const reprise = await page.evaluate(() => {
        const cal = db.getSync(window.cle('calendrierComplet'), {});
        const cartes = [...document.querySelectorAll('#v2-journeesSansCoursContainer .item-carte-compact')];
        const carte = cartes.find((c) => c.textContent.includes('Fête du travail'));
        return { jour: cal['2026-09-07'], jourReprise: cal['2026-09-10'], badges: carte?.querySelectorAll('.badge-non-reprise').length, texte: carte?.textContent };
    });
    expect(reprise.badges).toBe(0);
    expect(reprise.texte).toContain('Reprise le');
    expect(reprise.jour.statut).toBe('conge');
    expect(reprise.jour.nonReprise).toBeUndefined();
    expect(reprise.jour.numeroSemaine).toBeUndefined();
    expect(reprise.jourReprise.statut).toBe('reprise');

    // 6. « Modifier » relit dateReprise : la journée reprise montre Oui (et sa date), l'autre Non.
    const idDe = (desc) => page.evaluate((d) => db.getSync(window.cle('journeesSansCours'), []).find((e) => e.description === d).id, desc);
    await geste(`[data-action="modifierEvenementV2"][data-param="${await idDe('Fête du travail')}"]`);
    expect(await page.locator('#v2-repriseOui').isChecked()).toBe(true);
    expect(await blocVisible()).toBe(true);
    expect(await page.inputValue('#v2-dateReprise')).toBe('2026-09-10');
    await geste(`[data-action="modifierEvenementV2"][data-param="${await idDe('Grève')}"]`);
    expect(await page.locator('#v2-repriseNon').isChecked()).toBe(true);
    expect(await blocVisible()).toBe(false);

    expect(erreurs).toEqual([]);
});

// ↻ Lot E2 (28 sept. 2026, D3) : le bouton « Enregistrer » du Trimestre est retiré (un
// trimestre existant s'enregistre champ par champ). Son successeur, « Créer le trimestre »,
// est caché quand un trimestre est actif (la démo en a un) ; l'invariant #372 tient pour lui.
test('#372 · Bouton du Trimestre : plus d\'encadré info-box vide autour ; « Créer le trimestre » caché sur un trimestre existant', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.setViewportSize({ width: 1470, height: 956 });
    await ouvrirAppEnDemo(page);
    await montrerTrimestre(page);

    // Ce que fait la navigation à l'affichage du Cadre (#763) : la fiche relit le stock.
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await page.waitForTimeout(400);
    await expect(page.locator('#calendrier-trimestre [data-action="sauvegarderTrimestreCompletV2"]')).toHaveCount(0);
    const bouton = page.locator('#calendrier-trimestre #v2-btnCreerTrimestre');
    await expect(bouton).toHaveCount(1);
    await expect(bouton).toBeHidden();

    // Le conteneur direct du bouton n'est plus une info-box (encadré bleu).
    const conteneurClasse = await bouton.evaluate(el => el.parentElement.className);
    expect(conteneurClasse).not.toContain('info-box');

    expect(erreurs).toEqual([]);
});
