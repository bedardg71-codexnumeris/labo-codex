import { test, expect } from '@playwright/test';
import { ouvrirTableau, ouvrirObserver, stock, attendre, eleves, criteres, CIBLE, CAT, ENSEMBLE } from './harness/banc-observer-tampons.js';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// TAMPONS D'OBSERVATION, LOT 2 : OBSERVER (24 nov. 2026)
// Consigne de lot (Cowork, 24 nov., 16 h 30) ; décisions de Grégoire du 24 nov. ; rapport :
// plans de travail/RAPPORT-2026-11-24-tampons-observation-lot-2.md.
//
// Le vrai index.html, le vrai tableau des cibles, le vrai écran « Observer », la vraie fenêtre des tampons. Cible
// WebKit ; se relance sous Chromium par une config jetable (voir le rapport). Contexte neuf à chaque essai.
//
// RIEN EN DUR : le groupe, la cible, ses critères, la catégorie et ses tampons sont créés par le harnais, fictifs.
// Aucun tampon, catégorie ou critère fourni par l'application n'est nommé. BREAK-TESTS : journal au rapport.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const ECRAN = '.oc-fenetre';
const REGLAGES = '#modal-retro-observations';
const tampon = (page, n) => page.locator(`${ECRAN} .oc-tampon[data-tampon="custom-obs2-${n}"]`);
const inscrire = async (page) => { await page.locator(`${ECRAN} [data-oc="inscrire"]`).click(); await attendre(page, 250); };
const nomDe = (e) => `${e.prenom} ${e.nom}`;
const [ZOE, YAN, LOU, MAX, NOA] = eleves(5);
const CRITERES = criteres(4);
const copie = (n, critere = '') => ({ id: 'custom-obs2-' + n, nom: 'Tampon fictif ' + n, categorieId: CAT, categorieNom: 'Catégorie fictive', critere, emoji: '' });
const ouvrirCase = async (page, da) => { await page.locator(`.tc-case[data-da="${da}"][data-cible="${CIBLE}"]`).click(); await page.locator('.tc-historique-liste, .tc-fenetre .tc-aide').first().waitFor(); };

test.describe('Tampons d’observation, lot 2 — toucher, inscrire', () => {
    test('un tampon seul suffit à inscrire : deux touches par étudiant·e, cinq de suite ; chacun·e reçoit la copie de son tampon, sans niveau ni coche', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        let touches = 0;
        for (const [i, e] of [ZOE, YAN, LOU, MAX, NOA].entries()) {
            await expect(page.locator('#oc-nom')).toHaveText(nomDe(e));
            await tampon(page, i + 1).click(); touches++;
            await page.locator(`${ECRAN} [data-oc="inscrire"]`).click(); touches++;
            await attendre(page, 250);
        }
        expect(touches / 5, 'le temps du geste : deux touches par étudiant·e').toBe(2);
        await expect(page.locator('#oc-fin-titre')).toBeVisible();
        const liste = await stock(page);
        expect(liste).toHaveLength(5);
        expect(liste.map((i) => i.da)).toEqual([ZOE, YAN, LOU, MAX, NOA].map((e) => e.da));
        expect(liste.map((i) => i.tampons)).toEqual([[copie(1, CRITERES[0].texte)], [copie(2, CRITERES[1].texte)], [copie(3)], [copie(4)], [copie(5)]]);
        for (const i of liste) {
            expect([i.niveau, i.echelleId, i.productionId, i.origine, i.noteBreve]).toEqual([null, null, null, 'observation', '']);
            expect(i.criteres.map((k) => k.respecte), 'aucun critère n’est coché du fait d’un tampon').toEqual([null, null, null, null]);
            expect(JSON.stringify(i), 'jamais l’image').not.toMatch(/data:image|imageBase64/);
        }
        expect(erreurs).toEqual([]);
    });

    test('toucher retient, toucher encore relâche ; l’état pressé se voit autrement que par la couleur ; passer au suivant repart à vide', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        const t3 = tampon(page, 3);
        await expect(t3).toHaveAttribute('aria-pressed', 'false');
        const avant = await t3.evaluate((b) => ({ bordure: getComputedStyle(b).borderTopWidth, coche: getComputedStyle(b.querySelector('.oc-tampon-coche')).display }));
        await t3.click();
        await expect(t3).toHaveAttribute('aria-pressed', 'true');
        const presse = await t3.evaluate((b) => ({ bordure: getComputedStyle(b).borderTopWidth, coche: getComputedStyle(b.querySelector('.oc-tampon-coche')).display,
            signe: b.querySelector('.oc-tampon-coche').textContent }));
        expect(avant).toEqual({ bordure: '1px', coche: 'none' });
        expect(presse).toEqual({ bordure: '3px', coche: 'block', signe: '✓' });
        await expect(page.locator(`${ECRAN} .oc-tampons-retenus`), 'le nom du tampon retenu se lit sans survol').toHaveText(' : Tampon fictif 3');
        await expect(page.locator(`${ECRAN} .oc-annonce`)).toHaveText(`« Tampon fictif 3 » retenu pour ${nomDe(ZOE)}.`);
        await tampon(page, 1).click();
        await expect(page.locator(`${ECRAN} .oc-tampons-retenus`)).toHaveText(' : Tampon fictif 1, Tampon fictif 3');
        await t3.click();
        await expect(t3).toHaveAttribute('aria-pressed', 'false');
        await expect(page.locator(`${ECRAN} .oc-annonce`)).toHaveText('« Tampon fictif 3 » relâché.');
        await expect(page.locator(`${ECRAN} .oc-tampons-retenus`)).toHaveText(' : Tampon fictif 1');
        // Passer, puis revenir : tout est relâché.
        await page.locator(`${ECRAN} [data-oc="passer"]`).click();
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(YAN));
        await expect(page.locator(`${ECRAN} .oc-tampon[aria-pressed="true"]`)).toHaveCount(0);
        await page.locator(`${ECRAN} .oc-pastille`).first().click();
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        await expect(page.locator(`${ECRAN} .oc-tampon[aria-pressed="true"]`)).toHaveCount(0);
        await expect(page.locator(`${ECRAN} .oc-tampons-retenus`)).toHaveText('');
        expect(await stock(page), 'retenir n’écrit rien').toEqual([]);
    });

    test('plusieurs tampons, un texte, une coche et l’origine « Conversation » : une seule inscription les porte tous', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        await page.locator(`${ECRAN} [data-oc="origine"][data-valeur="conversation"]`).click();
        await tampon(page, 4).click();
        await tampon(page, 2).click();
        await page.locator(`${ECRAN} .tc-critere`).nth(2).locator('.tc-coche[data-valeur="non"]').click();
        await page.locator(`${ECRAN} .oc-note`).fill('Un texte fictif');
        await inscrire(page);
        const liste = await stock(page);
        expect(liste).toHaveLength(1);
        expect(liste[0].origine).toBe('conversation');
        expect(liste[0].noteBreve).toBe('Un texte fictif');
        expect(liste[0].tampons.map((t) => t.id), 'dans l’ordre de l’écran').toEqual(['custom-obs2-2', 'custom-obs2-4']);
        expect(liste[0].criteres.map((k) => k.respecte), 'seule la coche touchée est renseignée ; le critère du tampon 2 ne l’est pas').toEqual([null, null, false, null]);
    });

    test('un tampon qui déclare un critère de la cible est sur la rangée de ce critère ; le toucher ne coche rien ; les autres sont en tête', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        const rangees = page.locator(`${ECRAN} .tc-critere`);
        await expect(rangees).toHaveCount(4);
        expect(await rangees.evaluateAll((l) => l.map((li) => [...li.querySelectorAll('.oc-tampon')].map((b) => b.dataset.tampon))))
            .toEqual([['custom-obs2-1'], ['custom-obs2-2'], [], []]);
        expect(await page.locator(`${ECRAN} .oc-tampons-bloc .oc-tampon`).evaluateAll((l) => l.map((b) => b.dataset.tampon)))
            .toEqual([3, 4, 5, 6].map((n) => 'custom-obs2-' + n));
        expect(await page.locator(`${ECRAN} .oc-tampon, ${ECRAN} .oc-tampons`).evaluateAll((l) => l.filter((e) => /(^| )tc-critere/.test(e.className)).length),
            'aucun tampon ne porte la classe des critères').toBe(0);
        await tampon(page, 1).click();
        await tampon(page, 2).click();
        await expect(page.locator(`${ECRAN} .tc-coche[aria-pressed="true"]`), 'un tampon touché ne presse aucune coche').toHaveCount(0);
        // Sur une cible qui n'a pas ce critère (aucun critère), tous sont en tête.
        await page.locator(`${ECRAN} [data-oc="changer"]`).click();
        await page.locator(`.oc-tuile[data-cible="${CIBLE}_nue"]`).click();
        await page.locator('[data-oc="commencer"]').click();
        await expect(page.locator(`${ECRAN} .oc-tampons-bloc .oc-tampon`)).toHaveCount(6);
        await tampon(page, 1).click();
        await inscrire(page);
        const liste = await stock(page);
        expect(liste[0].cibleId).toBe(CIBLE + '_nue');
        expect(liste[0].tampons).toEqual([copie(1, CRITERES[0].texte)]);
        expect(liste[0].criteres).toEqual([]);
    });

    test('chaque tampon est une cible de 44 px au moins ; rien ne passe sous la bande d’actions à 1180 × 700 avec quatre critères et douze tampons', async ({ page }) => {
        await page.setViewportSize({ width: 1180, height: 700 });
        await ouvrirTableau(page, { nTampons: 12, avecCritere: 4 });
        await ouvrirObserver(page);
        const m = await page.evaluate(() => {
            const r = [...document.querySelectorAll('.oc-fenetre .oc-tampon')].map((b) => b.getBoundingClientRect());
            const a = document.querySelector('.oc-actions').getBoundingClientRect();
            const b = document.querySelector('.oc-inscrire').getBoundingClientRect();
            return { n: r.length, petit: Math.min(...r.map((x) => Math.min(x.width, x.height))), bas: Math.max(...r.map((x) => x.bottom)), haut: Math.min(...r.map((x) => x.top)),
                bande: a.top, inscrireHaut: b.top, inscrireBas: b.bottom, defilement: document.querySelector('.oc-overlay').scrollTop };
        });
        expect(m.n).toBe(12);
        expect(m.petit).toBeGreaterThanOrEqual(44);
        expect(m.defilement, 'sans défilement').toBe(0);
        expect(m.haut).toBeGreaterThanOrEqual(0);
        expect(m.bas, 'le dernier tampon est au-dessus de la bande d’actions').toBeLessThanOrEqual(m.bande);
        expect(m.inscrireHaut).toBeGreaterThanOrEqual(0);
        expect(m.inscrireBas, '« Inscrire et passer au suivant » se voit en entier').toBeLessThanOrEqual(700);
    });

    test('une observation vide est refusée, et le refus nomme le tampon ; rien n’est écrit', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 3 });
        await ouvrirObserver(page);
        await inscrire(page);
        await expect(page.locator(`${ECRAN} .tc-alerte`)).toHaveText('Touche un tampon, renseigne un critère ou écris ce que tu as vu : une observation vide ne s\'inscrit pas.');
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        expect(await stock(page)).toEqual([]);
        await tampon(page, 1).click();
        await expect(page.locator(`${ECRAN} .tc-alerte`), 'toucher un tampon retire le refus').toBeHidden();
    });

    test('le nom d’un tampon, de sa catégorie et son critère sont du texte : aucune balise n’entre, aucun gestionnaire inline', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 3, avecCritere: 1 });
        await page.evaluate(() => {
            // security-ok: fixture de test (des noms piégés, pour vérifier l'échappement)
            const pers = window.db.getSync('personnalisationObservations', {});
            pers['custom-obs2-2'].nom = '<img src=x onerror="window.__piege=1">Nom <b>piégé</b>';
            window.db.setSync('personnalisationObservations', pers);
            window.db.setSync('tamponsPersonnalises', window.db.getSync('tamponsPersonnalises', []).map((t) => (t.id === 'custom-obs2-2' ? Object.assign({}, t, { nom: pers[t.id].nom }) : t)));
            window.db.setSync('nomsCategoriesTampons', Object.assign({}, window.db.getSync('nomsCategoriesTampons', {}), { 'cat-banc-obs2': '<script>window.__piege=2</script>Catégorie' }));
            window.travauxOutils.rechargerTamponsPersonnalises();
        });
        await ouvrirObserver(page);
        await expect(page.locator(`${ECRAN} .oc-tampon b, ${ECRAN} .oc-tampon script, ${ECRAN} .oc-tampons-bloc script`)).toHaveCount(0);
        await tampon(page, 2).click();
        await expect(page.locator(`${ECRAN} .oc-tampons-retenus`)).toContainText('<b>piégé</b>');
        expect(await page.locator(`${ECRAN} .oc-tampon, ${ECRAN} .oc-tampon *, ${ECRAN} .oc-tampons, ${ECRAN} [data-oc="reglages"]`)
            .evaluateAll((l) => l.flatMap((e) => [...e.attributes].map((a) => a.name)).filter((n) => /^on/i.test(n)))).toEqual([]);
        await inscrire(page);
        await page.locator(`${ECRAN} [data-oc="fermer"]`).first().click();
        await ouvrirCase(page, ZOE.da);
        await expect(page.locator('.tc-historique-liste .tc-tampon b, .tc-historique-liste .tc-tampon script')).toHaveCount(0);
        await expect(page.locator('.tc-historique-liste .tc-tampon-nom')).toContainText('<b>piégé</b>');
        expect(await page.evaluate(() => window.__piege)).toBeUndefined();
    });
});

test.describe('Tampons d’observation, lot 2 — relire : la case, l’historique, le profil', () => {
    async function inscrireUnTamponSeul(page, n = 3) {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        await tampon(page, n).click();
        await inscrire(page);
        await page.locator(`${ECRAN} [data-oc="fermer"]`).first().click();
    }

    test('une trace de tampons seuls : sa case montre ✎ ; l’historique dit la date, l’origine et le tampon, jamais « remarque »', async ({ page }) => {
        await inscrireUnTamponSeul(page);
        const laCase = page.locator(`.tc-case[data-da="${ZOE.da}"][data-cible="${CIBLE}"]`);
        await expect(laCase.locator('.tc-case-remarque')).toHaveText('✎');
        await expect(laCase.locator('.tc-case-niveau')).toHaveCount(0);
        await ouvrirCase(page, ZOE.da);
        const entree = page.locator('.tc-historique-liste .tc-entree');
        await expect(entree).toHaveCount(1);
        const aujourdhui = await page.evaluate(() => window.TableauCibles.dateLisible(window.InscriptionsCibles.dateDuJour()));
        await expect(entree.locator('.tc-entree-date')).toHaveText(aujourdhui);
        await expect(entree.locator('.tc-entree-origine')).toHaveText('Observation');
        await expect(entree.locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
        await expect(entree.locator('.tc-tampon img'), 'le poste a encore ce tampon : son image est montrée').toHaveCount(1);
        await expect(entree.locator('.tc-entree-niveau')).toHaveCount(0);
        expect(await entree.innerText()).not.toMatch(/remarque|sans niveau/i);
        await expect(entree.locator('.tc-entree-critere'), 'aucun critère renseigné : pas de liste de tirets (retouche du 24 nov.)').toHaveCount(0);
        expect(await entree.innerText()).not.toMatch(/Critère fictif/);
    });

    test('au profil : la même lecture, datée, avec son origine, sans « remarque » ni bouton d’annulation', async ({ page }) => {
        await inscrireUnTamponSeul(page, 1);
        await page.evaluate((da) => { window.afficherSection('suivi'); window.afficherProfilComplet(da); }, ZOE.da);
        await page.locator('[data-action="changerSectionProfil"][data-param="cibles"]').click();
        const entree = page.locator('.pc-cible').first().locator('.tc-entree');
        await expect(entree).toHaveCount(1);
        await expect(entree.locator('.tc-entree-origine')).toHaveText('Observation');
        // Ce tampon déclare le premier critère de la cible : il se lit à côté de ce critère, qui reste non renseigné.
        const lignes = entree.locator('.tc-entree-critere');
        await expect(lignes.nth(0).locator('.tc-tampon-nom')).toHaveText('Tampon fictif 1');
        await expect(lignes.nth(0)).toHaveClass(/tc-entree-critere--vide/);
        await expect(lignes, 'aucun critère renseigné : seul celui qui porte un tampon se lit (retouche du 24 nov.)').toHaveCount(1);
        expect(await entree.innerText()).not.toMatch(/remarque|sans niveau/i);
        await expect(page.locator('.pc-cible [data-tc="annuler"]')).toHaveCount(0);
    });

    test('un texte ET des tampons : l’historique montre les deux', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6 });
        await ouvrirObserver(page);
        await tampon(page, 5).click();
        await page.locator(`${ECRAN} .oc-note`).fill('Un texte fictif');
        await inscrire(page);
        await page.locator(`${ECRAN} [data-oc="fermer"]`).first().click();
        await ouvrirCase(page, ZOE.da);
        const entree = page.locator('.tc-historique-liste .tc-entree');
        await expect(entree.locator('.tc-entree-note')).toHaveText('Un texte fictif');
        await expect(entree.locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 5']);
        await expect(entree.locator('.tc-entree-niveau--remarque')).toHaveCount(1);
    });

    test('renommer puis supprimer un tampon ne change pas ce que montre une trace déjà inscrite ; l’annulation annule l’inscription entière', async ({ page }) => {
        await inscrireUnTamponSeul(page, 3);
        const avant = await stock(page);
        // Renommé, par la vraie fenêtre des réglages.
        await page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
        await page.locator(`${REGLAGES} input[data-nom-id="custom-obs2-3"]`).fill('Un autre nom');
        await page.evaluate(() => window.travauxOutils.enregistrerRetroObservations());
        await attendre(page, 300);
        expect(await page.evaluate(() => window.travauxOutils.tamponsDObservation().find((t) => t.id === 'custom-obs2-3').nom), 'témoin : le réglage a changé').toBe('Un autre nom');
        await ouvrirCase(page, ZOE.da);
        await expect(page.locator('.tc-historique-liste .tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
        await page.evaluate(() => window.TableauCibles.fermer());
        // Supprimé, par la même fenêtre.
        await page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
        await page.evaluate(() => window.travauxOutils.supprimerTamponRetroObs('custom-obs2-3'));
        await page.evaluate(() => window.travauxOutils.enregistrerRetroObservations());
        await attendre(page, 300);
        expect(await page.evaluate(() => window.travauxOutils.tamponsDObservation().map((t) => t.id)), 'témoin : il n’est plus offert').not.toContain('custom-obs2-3');
        await ouvrirCase(page, ZOE.da);
        const entree = page.locator('.tc-historique-liste .tc-entree');
        await expect(entree.locator('.tc-tampon-nom')).toHaveText(['Tampon fictif 3']);
        await expect(entree.locator('.tc-tampon img'), 'sans le tampon sur le poste, le nom seul').toHaveCount(0);
        expect(await stock(page), 'aucune inscription n’a été réécrite').toEqual(avant);
        // L'annulation : une entrée de plus, qui désigne l'inscription ; la case perd son signe.
        await entree.locator('[data-tc="annuler"]').click();
        await page.locator('#overlay-ui-dialogue .btn-supprimer').click();
        await expect(page.locator('.tc-historique-liste .tc-entree--annulee')).toHaveCount(1);
        await expect(page.locator('.tc-historique-liste .tc-entree--annulee .tc-tampon-nom'), 'annulée, la trace reste lisible, barrée').toHaveText(['Tampon fictif 3']);
        const apres = await stock(page);
        expect(apres.filter((e) => e.type === 'inscription')).toEqual(avant);
        expect(apres.filter((e) => e.type === 'annulation').map((e) => e.inscriptionId)).toEqual([avant[0].id]);
        await page.evaluate(() => window.TableauCibles.fermer());
        await expect(page.locator(`.tc-case[data-da="${ZOE.da}"][data-cible="${CIBLE}"] .tc-case-remarque`), 'la case perd son signe').toHaveCount(0);
    });
});

test.describe('Tampons d’observation, lot 2 — la porte vers les réglages, et l’écran sans catégorie d’observation', () => {
    test('sans catégorie d’observation : aucun tampon, aucune rangée, le refus d’avant ; seule la porte est neuve', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2, observation: false });
        await ouvrirObserver(page);
        await expect(page.locator(`${ECRAN} .oc-tampon, ${ECRAN} .oc-tampons, ${ECRAN} .oc-tampons-bloc, ${ECRAN} .oc-tampons-retenus`)).toHaveCount(0);
        expect(await page.locator(ECRAN).evaluate((f) => f.classList.contains('oc-fenetre--tampons'))).toBe(false);
        expect(await page.locator(ECRAN).innerHTML()).not.toMatch(/oc-tampon/);
        await expect(page.locator(`${ECRAN} [data-oc="reglages"]`)).toHaveText('Régler mes tampons');
        await inscrire(page);
        await expect(page.locator(`${ECRAN} .tc-alerte`)).toHaveText('Renseigne un critère ou écris ce que tu as vu : une observation vide ne s\'inscrit pas.');
        await page.locator(`${ECRAN} .tc-coche[data-valeur="oui"]`).first().click();
        await inscrire(page);
        const liste = await stock(page);
        expect(liste).toHaveLength(1);
        expect(liste[0].tampons).toEqual([]);
    });

    test('depuis « Observer », sans aucune copie : la porte ouvre les réglages ; une catégorie cochée là fait paraître ses tampons ; ce qui était en cours est gardé', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirTableau(page, { nTampons: 4, avecCritere: 1, observation: false });
        expect(await page.evaluate((T) => (window.db.getSync(T + '_fichiersTravaux', null) || []).length, 'a2031'), 'témoin : aucune copie dans ce groupe').toBe(0);
        await ouvrirObserver(page);
        await page.locator(`${ECRAN} .tc-critere`).nth(1).locator('.tc-coche[data-valeur="oui"]').click();
        await page.locator(`${ECRAN} .oc-note`).fill('Un texte en cours');
        await page.locator(`${ECRAN} [data-oc="reglages"]`).click();
        await expect(page.locator(`${REGLAGES} .travaux-retro-modal`)).toBeVisible();
        // Échap ne ferme pas l'écran « Observer » qui est dessous.
        await page.keyboard.press('Escape');
        await expect(page.locator(ECRAN)).toHaveCount(1);
        await page.locator(`${REGLAGES} input[data-cat-observation-id="${CAT}"]`).check();
        await page.evaluate(() => window.travauxOutils.enregistrerRetroObservations());
        await expect(page.locator(REGLAGES)).toHaveCount(0);
        await expect(page.locator(`${ECRAN} .oc-tampon`)).toHaveCount(4);
        await expect(page.locator(`${ECRAN} .oc-annonce`)).toHaveText('Tes tampons sont à jour.');
        await expect(page.locator(`${ECRAN} .oc-note`)).toHaveValue('Un texte en cours');
        expect(await page.locator(`${ECRAN} .tc-critere`).evaluateAll((l) => l.map((li) => (li.querySelector('.tc-coche[aria-pressed="true"]') || { dataset: {} }).dataset.valeur || 'vide')))
            .toEqual(['vide', 'oui', 'vide', 'vide']);
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        await tampon(page, 1).click();
        await inscrire(page);
        const [i] = await stock(page);
        expect(i.tampons.map((t) => t.id)).toEqual(['custom-obs2-1']);
        expect(i.noteBreve).toBe('Un texte en cours');
        expect(i.criteres.map((k) => k.respecte)).toEqual([null, true, null, null]);
        expect(erreurs).toEqual([]);
    });

    test('décochée dans les réglages, la catégorie retire ses tampons de l’écran ; un tampon retenu qui n’est plus offert ne s’inscrit pas', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 4 });
        await ouvrirObserver(page);
        await tampon(page, 2).click();
        await page.locator(`${ECRAN} [data-oc="reglages"]`).click();
        await page.locator(`${REGLAGES} input[data-cat-observation-id="${CAT}"]`).uncheck();
        await page.evaluate(() => window.travauxOutils.enregistrerRetroObservations());
        await expect(page.locator(`${ECRAN} .oc-tampon`)).toHaveCount(0);
        await inscrire(page);
        await expect(page.locator(`${ECRAN} .tc-alerte`)).toBeVisible();
        expect(await stock(page)).toEqual([]);
    });
});

// RETOUCHE du 24 nov. 2026, 19 h (essai de Grégoire sur son iPad, 18 h 47) : revenu sur un·e élève déjà noté·e, l'écran
// vide laissait croire que rien n'était enregistré. Sa correction, mot pour mot (18 h 55) : « je lis sous son nom :
// "Déjà inscrit aujourd'hui : Incertain, Inexact". Les tampons restent relâchés : si j'en touche un et que j'inscris,
// j'ajoute une trace, sans refaire la première. »
test.describe('Tampons d’observation, lot 2 — retouche : « Déjà inscrit aujourd’hui »', () => {
    const deja = (page) => page.locator(`${ECRAN} .oc-deja`);
    const revenirA = async (page, rang) => { await page.locator(`${ECRAN} .oc-pastille`).nth(rang).click(); await attendre(page, 150); };
    const JOUR = '2031-03-04';
    const trace = (id, quoi) => Object.assign({ id, type: 'inscription', da: ZOE.da, ensembleId: ENSEMBLE, cibleId: CIBLE, niveau: null, echelleId: null, date: JOUR,
        horodatage: JOUR + 'T10:00:00.000Z', productionId: null, origine: 'observation', noteBreve: '', criteres: CRITERES.map((k) => Object.assign({ respecte: null }, k)), tampons: [] }, quoi);

    test('inscrire deux tampons pour A, passer à B, revenir à A : la ligne nomme les deux, rien n’est pressé ; un tampon de plus ajoute une trace, et la ligne en nomme trois', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, avecCritere: 2 });
        await ouvrirObserver(page);
        await expect(deja(page), 'personne n’est encore inscrit·e : aucune ligne').toHaveCount(0);
        await expect(page.locator('#oc-nom')).not.toHaveAttribute('aria-describedby', /.+/);
        await tampon(page, 3).click();
        await tampon(page, 4).click();
        await inscrire(page);
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(YAN));
        await expect(deja(page), 'un·e autre étudiant·e n’a pas la ligne').toHaveCount(0);
        const premiere = await stock(page);
        await revenirA(page, 0);
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        await expect(deja(page)).toHaveText('Déjà inscrit aujourd’hui : Tampon fictif 3, Tampon fictif 4');
        await expect(deja(page)).toBeVisible();
        await expect(page.locator(`${ECRAN} .oc-tampon[aria-pressed="true"]`), 'les tampons restent relâchés').toHaveCount(0);
        await expect(page.locator(`${ECRAN} .tc-coche[aria-pressed="true"]`)).toHaveCount(0);
        await expect(page.locator(`${ECRAN} .oc-note`)).toHaveValue('');
        // Lue à l'arrivée : le nom reçoit le focus, et la ligne le décrit.
        await expect(page.locator('#oc-nom')).toBeFocused();
        await expect(page.locator('#oc-nom')).toHaveAttribute('aria-describedby', 'oc-deja');
        const m = await page.evaluate(() => ({ nom: document.getElementById('oc-nom').getBoundingClientRect().bottom, ligne: document.getElementById('oc-deja').getBoundingClientRect().top }));
        expect(m.ligne, 'la ligne est sous le nom').toBeGreaterThanOrEqual(m.nom - 1);
        // Un tampon de plus : une trace AJOUTÉE, la première intacte.
        await tampon(page, 1).click();
        await inscrire(page);
        const apres = await stock(page);
        expect(apres).toHaveLength(2);
        expect(apres[0], 'la première trace n’est ni réécrite ni fusionnée').toEqual(premiere[0]);
        expect(apres[1].tampons.map((t) => t.id)).toEqual(['custom-obs2-1']);
        await revenirA(page, 0);
        await expect(deja(page)).toHaveText('Déjà inscrit aujourd’hui : Tampon fictif 3, Tampon fictif 4, Tampon fictif 1');
        await expect(page.locator(`${ECRAN} .oc-tampon[aria-pressed="true"]`)).toHaveCount(0);
    });

    test('une autre cible, un autre jour, un·e autre étudiant·e n’y paraissent pas ; une inscription annulée disparaît de la ligne ; sans tampon, la ligne dit seulement qu’une inscription existe', async ({ page }) => {
        await ouvrirTableau(page, { nTampons: 6, inscriptions: [
            trace('I-autre-cible', { cibleId: CIBLE + '_nue', criteres: [], tampons: [copie(5)] }),
            trace('I-autre-jour', { date: '2031-03-03', horodatage: '2031-03-03T10:00:00.000Z', tampons: [copie(6)] }),
            trace('I-autre-eleve', { da: YAN.da, tampons: [copie(4)] }),
            trace('I-texte', { da: LOU.da, origine: 'conversation', noteBreve: 'Un texte fictif' })] });
        await ouvrirObserver(page);
        expect(await page.evaluate((j) => window.ObservationCibles.dater(j), JOUR)).toBe(true);
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        await expect(deja(page), 'ni l’autre cible, ni l’autre jour, ni l’autre étudiant·e').toHaveCount(0);
        await revenirA(page, 1);
        await expect(deja(page), 'témoin : la trace de l’autre étudiant·e se lit chez elle').toHaveText('Déjà inscrit aujourd’hui : Tampon fictif 4');
        await revenirA(page, 2);
        await expect(deja(page), 'sans tampon : le mot court').toHaveText('Déjà inscrit aujourd’hui.');
        // Une trace pour Zoé, puis son annulation par l'historique de sa case.
        await revenirA(page, 0);
        await tampon(page, 2).click();
        await inscrire(page);
        await revenirA(page, 0);
        await expect(deja(page)).toHaveText('Déjà inscrit aujourd’hui : Tampon fictif 2');
        await page.locator(`${ECRAN} [data-oc="fermer"]`).first().click();
        await ouvrirCase(page, ZOE.da);
        await page.locator('.tc-historique-liste .tc-entree').first().locator('[data-tc="annuler"]').click();
        await page.locator('#overlay-ui-dialogue .btn-supprimer').click();
        await expect(page.locator('.tc-historique-liste .tc-entree--annulee')).toHaveCount(1);
        await page.evaluate(() => window.TableauCibles.fermer());
        await ouvrirObserver(page);
        await page.evaluate((j) => window.ObservationCibles.dater(j), JOUR);
        await expect(page.locator('#oc-nom')).toHaveText(nomDe(ZOE));
        await expect(deja(page), 'annulée, la trace ne paraît plus à la ligne').toHaveCount(0);
        await revenirA(page, 1);
        await expect(deja(page), 'témoin : la ligne de l’autre étudiant·e est toujours là').toHaveCount(1);
    });

    test('la forme tient avec la ligne : à 1180 × 700, quatre critères et douze tampons, rien ne passe sous la bande d’actions', async ({ page }) => {
        await page.setViewportSize({ width: 1180, height: 700 });
        await ouvrirTableau(page, { nTampons: 12, avecCritere: 4 });
        await ouvrirObserver(page);
        await tampon(page, 5).click();
        await tampon(page, 6).click();
        await inscrire(page);
        await revenirA(page, 0);
        await expect(deja(page)).toBeVisible();
        const m = await page.evaluate(() => {
            const r = [...document.querySelectorAll('.oc-fenetre .oc-tampon')].map((b) => b.getBoundingClientRect());
            const a = document.querySelector('.oc-actions').getBoundingClientRect();
            const b = document.querySelector('.oc-inscrire').getBoundingClientRect();
            return { n: r.length, bas: Math.max(...r.map((x) => x.bottom)), bande: a.top, inscrireBas: b.bottom, defilement: document.querySelector('.oc-overlay').scrollTop };
        });
        expect(m.n).toBe(12);
        expect(m.defilement, 'sans défilement').toBe(0);
        expect(m.bas, 'le dernier tampon est au-dessus de la bande d’actions').toBeLessThanOrEqual(m.bande);
        expect(m.inscrireBas, '« Inscrire et passer au suivant » se voit en entier').toBeLessThanOrEqual(700);
    });
});
