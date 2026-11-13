import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { attendreApplication } from './harness/attendre-application.js';
import {
    ouvrirEspaceVide, ouvrirPanneau, ouvrirPanneauSurLaDemo, bulle, carte, enDemo, attendreEtape, contourSur,
    releve, ecarts, horsDeLaDemo, DE_LA_DEMO, peuplerUnTrimestreReel, materiel, faireLaModelisation
} from './harness/deux-temps-de-banc.js';
import { etiqueter } from './harness/classe-de-banc.js';
import { actionDeLaListe, valeursActions } from './harness/parcours-3-de-banc.js';

// =======================================================================
// LOT « LES DEUX TEMPS, LES MODÈLES » (13 NOVEMBRE 2026)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md`. Sous WebKit, aux deux orientations de
// l'iPad (1180 × 820 et 820 × 1180).
//   A · le panneau : « Modélisation » et « Pratique guidée », leur matériel dessous ; la liste de dix ; sous
//       « Modélisation », un parcours sans modèle ne se lance pas et ne dit aucune phrase ; le modèle d'« Évaluer »
//       refuse tant que le deuxième groupe n'existe pas, nomme « Mettre ta classe en place » et y met la pulsation.
//   B · le modèle d'« Évaluer une première production », de bout en bout, avec le SEUL matériel fourni (copié de la
//       bulle, collé au clavier ; le fichier des commentaires téléchargé de la bulle, puis importé) ; la rétroaction
//       réécrite porte les quatre commentaires du profil (Structure M, Rigueur D, Plausibilité D, Nuance D) et « Bon
//       départ ! » ; le confinement : la grille, la production, la pratique, la cartouche et l'évaluation vivent dans la
//       démo, aucune clé hors d'elle ne change, et « Remettre la démo à neuf » les efface.

const ORIENTATIONS = [[1180, 820], [820, 1180]];
const M = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
const TOTAL = 9;
const etape = (page, n, titre) => attendreEtape(page, n, TOTAL, titre);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const coller = async (page, selecteur) => { await page.focus(selecteur); await page.keyboard.press('ControlOrMeta+V'); };
/**
 * Une étiquette posée sur chaque morceau nommé, et vérifiée : le harnais touche les morceaux aussitôt l'étiquette prise,
 * et un morceau redessiné entre-temps restait parfois sans étiquette (13 nov. 2026, « Créer ma grille » restait inactif).
 * Seuls les morceaux qui manquent sont retouchés : toucher un morceau étiqueté lui retire son étiquette.
 */
async function etiqueterTous(page, type, textes) {
    await expect(async () => {
        // Les textes exacts des morceaux à l'écran (la dissection rend une espace simple pour l'insécable de « 20 % »).
        const simple = (x) => x.replace(/\u00a0/g, ' ');
        const voulus = textes.map(simple);
        const manquants = await page.evaluate(([t, ts]) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')]
            .filter((b) => ts.includes(b.textContent.replace(/\u00a0/g, ' ')) && b.getAttribute('data-type') !== t).map((b) => b.textContent), [type, voulus]);
        if (manquants.length) await etiqueter(page, type, manquants);
        await expect(page.locator(`#dissection-contenu .dissection-morceau[data-type="${type}"]`)).toHaveCount(textes.length, { timeout: 1500 });
    }).toPass({ timeout: 15000 });
}

/** La pulsation est sur le k-ième élément du sélecteur (relu à chaque relevé : l'éditeur redessine sa liste). */
async function contourSurLeNieme(page, selecteur, k) {
    await expect.poll(() => page.evaluate(([sel, n]) => {
        const c = document.getElementById('parcours-contour'), el = document.querySelectorAll(sel)[n];
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        return Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 3 && Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 3 ? 'posé' : 'décalé';
    }, [selecteur, k]), { message: 'pulsation posée sur le ' + (k + 1) + 'e ' + selecteur, timeout: 5000 }).toBe('posé');
}
const ceQuiEstCree = (page) => page.evaluate(() => {
    const lire = (k) => db.getSync(k, []) || [];
    const g = lire('demo_grillesTemplates').find((x) => x.nom === 'G4H Sans français');
    const p = g ? lire('demo_productions').find((x) => x.grilleId === g.id) : null;
    return {
        grille: g ? g.criteres.map((c) => [c.nom, c.type, c.ponderation]) : null,
        production: p ? [p.titre, p.type, !!p.echelleId, !!p.cartoucheId] : null,
        pratiques: lire('demo_pratiquesConfigurables').filter((x) => String(x.id).indexOf('demo-') !== 0).length,
        cartouches: g ? lire('demo_cartouches_' + g.id).length : 0,
        evaluations: p ? lire('demo_evaluationsSauvegardees').filter((e) => e.productionId === p.id).length : 0
    };
});

for (const [L, H] of ORIENTATIONS) {
    test(`A · ${L} × ${H} : les libellés du choix, la liste de dix, aucun lancement sans modèle sous « Modélisation », le refus du modèle d’« Évaluer » sans le deuxième groupe`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspaceVide(page, L, H);
        await ouvrirPanneauSurLaDemo(page);
        const options = page.locator('#assistance-materiel [role="radio"]');
        await expect(options.locator('.assistance-materiel-nom')).toHaveText(['Modélisation', 'Pratique guidée']);
        await expect(options.locator('.assistance-materiel-sous')).toHaveText(['avec le matériel de la démo', 'avec mon matériel']);
        for (const o of await options.all()) {
            const b = await o.boundingBox();
            expect(b.height).toBeGreaterThanOrEqual(44);
            expect(await o.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'le libellé tient dans son bouton').toBe(true);
        }
        expect((await materiel(page)).etudiants).toHaveLength(10);

        // Sans modèle : le bouton est là, inactif, sans phrase ; touché, rien ne part, ni dans la démo ni sur les vraies données.
        const sans = await page.evaluate(() => Assistance.parcours().filter((d) => !d.dansLaDemo && typeof d.lancerModele !== 'function').map((d) => d.id));
        expect(sans.length).toBeGreaterThan(0);
        expect(sans).not.toContain('evaluer');
        for (const id of sans) {
            await expect(carte(page, id).locator('.assistance-parcours-bouton')).toHaveAttribute('aria-disabled', 'true');
            await expect(carte(page, id).locator('p:not(.assistance-parcours-ligne)')).toHaveCount(0);
            await carte(page, id).locator('.assistance-parcours-bouton').click({ force: true });
            await expect(bulle(page)).toHaveCount(0);
            await expect(page.locator('#panneau-assistance')).toBeVisible();
            expect(await enDemo(page)).toBe(false);
        }

        // Le modèle d'« Évaluer » : son préalable est la modélisation de « Mettre ta classe en place ».
        // Break-test (13 nov. 2026) : `refusModele` retiré de l'enregistrement → ROUGE (le refus manque). Rétabli → vert.
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
        await carte(page, 'evaluer').locator('.assistance-parcours-bouton').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(carte(page, 'classe').locator('.assistance-parcours-bouton')).toHaveClass(/assistance-parcours-bouton--appel/);
        await expect(bulle(page)).toHaveCount(0);
        expect(await enDemo(page)).toBe(false);
    });

    test(`B · ${L} × ${H} : le modèle d’« Évaluer une première production », de bout en bout avec le seul matériel fourni ; le confinement ; la remise à neuf`, async ({ page, context }) => {
        test.setTimeout(300000);
        page.setDefaultTimeout(20000);   // un geste qui n'aboutit pas se dit en vingt secondes, pas à la fin de l'essai
        await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        const avant = await releve(page);
        const duPack = Object.fromEntries(Object.entries(avant).filter(([k]) => DE_LA_DEMO.test(k)));

        // Le préalable : la modélisation de « Mettre ta classe en place » ; sa dernière bulle offre la suite par son titre.
        await ouvrirPanneauSurLaDemo(page);
        await carte(page, 'classe').locator('.assistance-parcours-bouton').click();
        await faireLaModelisation(page);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Évaluer une première production', 'Refaire avec mon matériel']);
        await boutonDeBulle(page, 'Évaluer une première production').click();
        const m = await M(page);

        // 1. La grille : copiée de la bulle, collée, étiquetée, créée ; puis ses critères, jugés par niveaux.
        await etape(page, 1, 'Ta grille');
        expect(await enDemo(page)).toBe(true);
        await expect(bulle(page)).toContainText(m.grille.nom);
        await boutonDeBulle(page, 'Copier la grille').click();
        await coller(page, '#materiel-zone-collage');
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        // Ce que le champ lit d'un copier depuis la bulle : un tableau, un morceau par case (2 + 4 × 3).
        await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(14);
        await etiqueterTous(page, 'titre', [m.grille.nom]);
        await etiqueterTous(page, 'description', [m.grille.description].concat(m.grille.criteres.map((c) => c[1])));
        await etiqueterTous(page, 'critere', m.grille.criteres.map((c) => c[0]));
        await etiqueterTous(page, 'ponderation', m.grille.criteres.map((c) => c[2]));
        await page.locator('#materiel-dissection button', { hasText: 'Créer ma grille' }).click();
        await expect(bulle(page)).toContainText('passe chacun de ses quatre critères à « Holistique »'.replace(/« /g, '« ').replace(/ »/g, ' »'));
        await contourSur(page, '#conception-materiel [data-action="materiel.voir"][data-param="grille-criteres"]');
        await page.click('#conception-materiel [data-action="materiel.voir"][data-param="grille-criteres"]');
        const types = '#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]';
        await expect(page.locator(types)).toHaveCount(4);
        for (let k = 0; k < 4; k++) {
            // Mesuré le 13 nov. 2026 (trois passages sur six) : le menu suivant restait sous le bandeau de la démo, la
            // pulsation cachée ; le modèle l'amène maintenant entre l'en-tête et le bandeau (`typeAChanger`). Avant : trois
            // rouges sur six passages ; après : six sur six.
            await contourSurLeNieme(page, types, k);
            await expect(page.locator(types).nth(k)).toBeInViewport();
            await page.locator(types).nth(k).selectOption('holistique');
        }

        // 2. La production : son nom copié de la bulle (la démo a déjà un « Artefact 1 »), le type, la grille, l'échelle.
        await etape(page, 2, 'Ta production');
        await expect(bulle(page)).toContainText(m.production.description);
        await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
        await boutonDeBulle(page, 'Copier le nom').click();
        await coller(page, '#productionTitre');
        await expect(page.locator('#productionTitre')).toHaveValue(m.production.description);
        await coller(page, '#productionActivite');
        await page.selectOption('#productionType', m.production.type);
        const grilleId = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === 'G4H Sans français').id);
        await page.selectOption('#productionGrille', grilleId);
        await page.selectOption('#productionEchelle', { label: m.echelle });
        await page.click('#btnCreerProduction');

        // 3. Les consignes : l'objectif, la tâche et les consignes copiés de la bulle ; la date ; la case.
        await etape(page, 3, 'Tes consignes');
        for (const [bouton, champ, valeur] of [["Copier l'objectif", '#productionObjectif', m.production.objectif], ['Copier la tâche', '#productionTache', m.production.tache], ['Copier les consignes', '#productionDetailTache', m.production.detailTache]]) {
            await boutonDeBulle(page, bouton).click();
            await coller(page, champ);
            await expect(page.locator(champ)).toHaveValue(valeur);
        }
        await page.fill('#productionDateEcheance', '2025-12-09');
        await page.check('#productionEcheanceAssignee');

        // 4. L'étudiant·e de la ligne que la bulle pointe, nommé·e dans la bulle ; les niveaux imposés ; « Verrouiller ».
        await etape(page, 4, 'Une première production');
        const pid = await page.evaluate((g) => (db.getSync(cle('productions'), []) || []).find((p) => p.grilleId === g).id, grilleId);
        const evaluer = (await valeursActions(page, pid)).find((v) => v.startsWith('evaluer|'));
        const da = evaluer.split('|')[1];
        const qui = await page.evaluate((d) => { const e = obtenirEtudiantsCoursActif().find((x) => String(x.da) === d); return e.prenom + ' ' + e.nom; }, da);
        await expect(bulle(page)).toContainText(qui);
        await expect(bulle(page)).toContainText('Structure M, Rigueur D, Plausibilité D, Nuance D');
        await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value="${evaluer}"])`);
        await actionDeLaListe(page, evaluer);
        await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
        await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
        const criteres = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.id));
        for (const [k, [, niveau]] of m.niveaux.entries()) await page.selectOption('#' + criteres[k], niveau);
        await page.click('#btnVerrouillerEvaluation');

        // 5 et 6. La pratique : « Partir d'un modèle », le modèle par standards ; appliquée au cours du deuxième groupe.
        await etape(page, 5, 'Ta pratique');
        await expect(bulle(page)).toContainText(m.pratique.nom);
        await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
        await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
        await page.click('#wizard-v2-btn-suivant');
        const standards = page.locator(`#modalWizardPratiqueV2 input[name="modeleChoisi"][value="${m.pratique.id}"]`);
        await expect(async () => { await standards.check({ force: true }); await expect(standards).toBeChecked({ timeout: 500 }); }).toPass({ timeout: 5000 });
        await expect(page.locator(`#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[name="modeleChoisi"][value="${m.pratique.id}"])`)).toContainText(m.pratique.nom);
        await page.click('#wizard-v2-btn-suivant');
        await page.click('#wizard-v2-btn-creer');
        // Un modèle par standards demande son échelle (#898) : la bulle la nomme.
        await expect(bulle(page)).toContainText('Adopter');
        await expect(page.locator('#ui-dialogue-question')).toBeVisible();
        await page.locator('#overlay-ui-dialogue .ui-dialogue-choix-ligne', { hasText: m.echelle }).click();
        await page.getByRole('button', { name: 'Adopter', exact: true }).click();
        await etape(page, 6, "L'appliquer à ton cours");
        const pratiqueId = await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).find((p) => String(p.id).indexOf('demo-') !== 0).id);
        await page.selectOption('#menuPratiques', pratiqueId);
        await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');

        // 7. Le point qui s'allume.
        await etape(page, 7, "Le point qui s'allume");
        await boutonDeBulle(page, 'Continuer').click();

        // 8. La cartouche : la grille, l'échelle du pack (aucune échelle neuve), les vingt commentaires importés du fichier
        // que la bulle fournit ; puis la production la nomme.
        await etape(page, 8, 'Ta cartouche');
        await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
        await page.fill('#nomCartouche', 'Stratégies de lecture');
        await page.selectOption('#selectGrilleCartouche', grilleId);
        await expect.poll(() => page.locator('#selectEchelleCartouche option').count()).toBeGreaterThan(1);
        // L'échelle du pack, par son nom (le menu ajoute « (5 niv.) ») : aucune échelle neuve.
        await page.selectOption('#selectEchelleCartouche', await page.evaluate((nom) => [...document.querySelectorAll('#selectEchelleCartouche option')].find((o) => o.textContent.includes(nom)).value, m.echelle));
        await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]')).toHaveCount(20);
        await contourSur(page, '#conception-retroactions [data-action="ouvrirImportTxtCartouche"]');
        const [telechargement] = await Promise.all([page.waitForEvent('download'), boutonDeBulle(page, 'Télécharger les commentaires').click()]);
        expect(telechargement.suggestedFilename()).toBe(m.fichierCommentaires);
        await page.setInputFiles('#fichier-import-txt-cartouche', await telechargement.path());
        // Les vingt cases, le niveau 0 compris (#531).
        await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')].filter((t) => t.value.trim()).length)).toBe(20);
        await page.click('#btnCreerCartouche');
        await expect.poll(async () => (await ceQuiEstCree(page)).cartouches).toBe(1);
        await page.click('#sous-navigation [data-sous-onglet="conception-productions"]');
        if (!(await page.locator('#formulaireProduction').isVisible())) await page.click(`#conception-productions [data-action="modifierProduction"][data-param="${pid}"]`);
        const cartoucheId = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || [])[0].id, grilleId);
        await contourSur(page, '#productionCartouche');
        await page.selectOption('#productionCartouche', cartoucheId);

        // 9. La rétroaction réécrite : les quatre commentaires du profil, et le mot.
        await etape(page, 9, 'Ta rétroaction, avec tes mots');
        await expect(bulle(page)).toContainText(m.mot);
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
        // La fin : le parcours suivant n'a pas encore son modèle ; la suite dans la démo, puis les vraies données.
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Explorer la démo', 'Refaire avec mon matériel']);
        const evaluationId = await page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.productionId === p).id, pid);
        const consulter = (await valeursActions(page, evaluationId)).find((v) => v.startsWith('consulter|'));
        await actionDeLaListe(page, consulter);
        await page.waitForFunction((id) => {
            const ec = window.evaluationEnCours, b = document.getElementById('btnVerrouillerEvaluation');
            return !!ec && ec.idModification === id && !window._chargementsEvaluationEnCours && !!b && b.title === 'Déverrouiller l’évaluation';
        }, evaluationId, { timeout: 10000 });
        await page.click('#btnVerrouillerEvaluation');
        await contourSur(page, '#selectCartoucheEval');
        await page.selectOption('#selectCartoucheEval', cartoucheId);
        const attendus = m.niveaux.map(([critere, niveau]) => new RegExp('\\*\\*' + critere.toUpperCase() + ' \\(' + niveau + '\\)\\*\\* : (.*)').exec(m.commentaires)[1]);
        expect(attendus).toHaveLength(4);
        await expect.poll(() => page.inputValue('#retroactionFinale1'), { timeout: 5000 }).toContain(attendus[0]);
        const reecrite = await page.inputValue('#retroactionFinale1');
        for (const phrase of attendus) expect(reecrite).toContain(phrase);
        await page.fill('#motPourEtudiant1', m.mot);
        await page.click('#btnVerrouillerEvaluation');
        await expect.poll(() => page.evaluate((id) => {
            const e = (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((x) => x.id === id);
            return e ? [e.verrouillee, JSON.stringify(e).includes('Bon départ !')] : null;
        }, evaluationId)).toEqual([true, true]);

        // LE CONFINEMENT. Pendant la démo : les cinq objets vivent sous `demo_*`.
        expect(await ceQuiEstCree(page)).toEqual({
            grille: m.grille.criteres.map((c) => [c[0], 'holistique', parseInt(c[2], 10)]),
            production: [m.production.description, m.production.type, true, true], pratiques: 1, cartouches: 1, evaluations: 1
        });
        await boutonDeBulle(page, 'Explorer la démo').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('evaluer').etat)).toBe('fait');
        expect(await page.evaluate(() => Assistance.etatDe('evaluer').etat)).toBe('a-faire');

        // À la sortie : aucune clé hors de la démo ne change (la grille, la production, la pratique, la cartouche et
        // l'évaluation ont disparu des vraies données) ; ce qui a été créé reste dans la démo.
        // Break-test (13 nov. 2026), les cinq fuites rendues dans un même passage : dans `db.set` et `db.setSync`, ce
        // qui s'écrit sous `demo_grillesTemplates`, `demo_productions`, `demo_pratiquesConfigurables`,
        // `demo_evaluationsSauvegardees` et `demo_cartouches_*` s'écrit aussi sous la clé sans préfixe → ROUGE ici, chacune
        // nommée (`grillesTemplates`, `productions`, `pratiquesConfigurables`, `evaluationsSauvegardees`,
        // `cartouches_<la grille du modèle>`). Code rétabli → vert.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);
        expect((await ceQuiEstCree(page)).evaluations).toBe(1);

        // « Remettre la démo à neuf » les efface : la démo revient telle que le pack la donne.
        await ouvrirPanneauSurLaDemo(page);
        await page.click('#assistance-demo-neuf');
        await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
        await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
        const neuf = await releve(page);
        expect(ecarts(duPack, neuf, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
        expect(ecarts(avant, neuf, horsDeLaDemo), 'les autres clés identiques').toEqual([]);
        expect(await ceQuiEstCree(page)).toEqual({ grille: null, production: null, pratiques: 0, cartouches: 0, evaluations: 0 });
        // Le deuxième groupe parti avec elle : le modèle refuse de nouveau, et nomme son préalable.
        if (!(await page.locator('#panneau-assistance').isVisible())) await ouvrirPanneau(page);
        await carte(page, 'evaluer').locator('.assistance-parcours-bouton').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(bulle(page)).toHaveCount(0);
    });
}
