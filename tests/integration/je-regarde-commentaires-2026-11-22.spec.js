import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, enDemo, attendreEtape, contourSur, releve, ecarts, horsDeLaDemo,
    peuplerUnTrimestreReel, REMPLIR
} from './harness/deux-temps-de-banc.js';
import { faireLesTroisModeles } from './harness/trois-modeles-de-banc.js';
import { bulleDit, lireToute, aPlat } from './harness/bulle-du-22-nov.js';

// =======================================================================
// PARCOURS 8, « AUTOMATISER TES COMMENTAIRES », « JE REGARDE » (22 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 4.1, et la suite (15 h), point 6. Lancé
// sous le Chromium du nuage (le verdict WebKit et l'iPad viendront de la porte terrain).
//   A · sans le modèle de « Recevoir », le modèle refuse ; le panneau le dit, et la pulsation va à SA Modélisation.
//   B · aux deux tailles de l'iPad : les huit bulles, après les modèles des parcours 2, 3 et 4, mot pour mot (les textes
//       du module, que la sentinelle confronte à la consigne) ; « Français écrit » ajouté à la « Grille générale à 4
//       critères » (les huit évaluations déjà posées gardent leurs notes) ; ce que « Remplir » pose à chaque bulle ; six
//       codes sur la copie d'Antilope Vaillante ; 300 mots ; la rétroaction écrite par l'application ; le confinement
//       (aucune clé hors de la démo ne change) ; « Refaire » retire le critère, les codes et l'évaluation, rien d'autre.
// Break-tests (22 nov.) : au rapport du lot (plans de travail/RAPPORT-2026-11-22-parcours-6-7-8-suite.md).

const TAILLES = [[1180, 820], [820, 1180]];
const TOTAL = 8;
const etape = (page, n) => attendreEtape(page, n, TOTAL);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const textes = (page) => page.evaluate(() => JSON.parse(JSON.stringify({ t: ParcoursCommentaires.textesModele, m: ParcoursCommentaires.materielModele })));
const ANTILOPE = '9900006';
const TAPIR = '9900005';

/** La grille de l'exemple, la copie d'Antilope Vaillante, ses annotations, son évaluation ; les autres évaluations. */
const etatDuModele = (page) => page.evaluate(([da, tapir]) => {
    const g = (db.getSync('demo_grillesTemplates', []) || []).find((x) => x && x.nom === 'Grille générale à 4 critères');
    const copie = (db.getSync('demo_fichiersTravaux', []) || []).find((f) => String(f.etudiantDA) === da && f.productionId);
    const evals = (db.getSync('demo_evaluationsSauvegardees', []) || []).filter((e) => e && !e.remplaceeParId);
    const prod = copie ? (db.getSync('demo_productions', []) || []).find((p) => p.id === copie.productionId) : null;
    return {
        grille: g ? { id: g.id, criteres: g.criteres.map((c) => [c.nom, c.type || 'holistique', Number(c.ponderation)]) } : null,
        production: prod ? { titre: prod.titre || prod.nom, grilleId: prod.grilleId } : null,
        copie: copie ? { id: copie.id, productionId: copie.productionId } : null,
        // Les codes posés : les formes `errfr_N` de l'annotation de la copie (une par fichier, ses pages dedans).
        annotations: copie ? (JSON.stringify((db.getSync('demo_annotationsTravaux', []) || []).filter((a) => a && a.fichierId === copie.id)).match(/"type":"errfr_\d+"/g) || []).length : 0,
        codes: copie ? (JSON.stringify((db.getSync('demo_annotationsTravaux', []) || []).filter((a) => a && a.fichierId === copie.id)).match(/"type":"errfr_\d+"/g) || []).map((x) => x.replace(/\D/g, '')).sort() : [],
        antilope: evals.filter((e) => String(e.etudiantDA) === da).map((e) => ({ id: e.id, verrouillee: e.verrouillee,
            niveaux: e.criteres.map((c) => [c.critereNom, c.niveauSelectionne]), noteFinale: e.noteFinale, retro: e.retroactionFinale || '' })),
        autres: evals.filter((e) => String(e.etudiantDA) !== da).map((e) => [e.id, e.noteFinale, e.niveauFinal]).sort(),
        tapir: (db.getSync('demo_fichiersTravaux', []) || []).filter((f) => String(f.etudiantDA) === tapir).map((f) => f.id)
    };
}, [ANTILOPE, TAPIR]);

/** Un point de la production que rien ne couvre (ni la bulle, ni une palette), loin des points déjà touchés. */
const pointLibre = (page, deja) => page.evaluate((d) => {
    const c = document.getElementById('travaux-canvas-annotation');
    const r = c.getBoundingClientRect();
    for (let fy = 0.15; fy < 0.9; fy += 0.08) {
        for (let fx = 0.1; fx < 0.95; fx += 0.08) {
            const x = r.left + r.width * fx, y = r.top + r.height * fy;
            if (y < window.innerHeight - 10 && document.elementFromPoint(x, y) === c && d.every((q) => Math.abs(q.x - x) > 40 || Math.abs(q.y - y) > 40)) return { x, y };
        }
    }
    return null;
}, deja);

test('A · sans le modèle de « Recevoir », le modèle d’« Automatiser tes commentaires » refuse, le nomme, et la pulsation va à sa Modélisation', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, 820);
    await ouvrirPanneau(page);
    const t = await page.evaluate(() => ParcoursCommentaires.texteRefusModele);
    await boutonModele(page, 'commentaires').click();
    await expect(page.locator('#panneau-assistance [data-parcours="commentaires"]')).toContainText(aPlat(t).slice(0, 60));
    await expect(page.locator('#panneau-assistance [data-parcours="recevoir"] .assistance-modele-bouton')).toHaveClass(/assistance-parcours-bouton--appel/);
    expect(await page.evaluate(() => ParcoursMoteur.actif())).toBe(false);
    expect(await enDemo(page)).toBe(false);
});

for (const [L, H] of TAILLES) {
    test(`B · ${L} × ${H} : les huit bulles de « Je regarde », mot pour mot ; « Français écrit » ; six codes, 300 mots ; le confinement ; « Refaire »`, async ({ page }) => {
        test.setTimeout(480000);
        page.setDefaultTimeout(20000);
        // Les modèles préalables se jouent en portrait (même règle que le banc du parcours 7, « Je regarde »).
        await ouvrirEspaceVide(page, 820, 1180);
        await peuplerUnTrimestreReel(page);
        await page.evaluate(() => db.setSync('raccourcisAnnotation', Object.assign({}, travauxOutils.obtenirRaccourcisAnnotation(), { texte: 'x' })));
        const avant = await releve(page);
        await faireLesTroisModeles(page);
        await page.evaluate(() => sessionStorage.removeItem('releve-bulle'));
        await page.setViewportSize({ width: L, height: H });
        const { t, m } = await textes(page);
        const B = t.bulles;
        const depart = await etatDuModele(page);
        expect(depart.grille.criteres, 'la grille de l’exemple, ses quatre critères').toEqual([
            ['Structure', 'holistique', 20], ['Rigueur', 'holistique', 30], ['Plausibilité', 'holistique', 15], ['Nuance', 'holistique', 35]]);
        expect(depart.copie, 'la copie d’Antilope Vaillante, importée au modèle de « Recevoir »').toBeTruthy();
        expect(depart.production.grilleId, 'sa production porte la grille de l’exemple').toBe(depart.grille.id);
        expect(depart.antilope, 'Antilope Vaillante, pas encore évaluée').toEqual([]);
        expect(depart.annotations).toBe(0);

        await ouvrirPanneau(page);
        await boutonModele(page, 'commentaires').click();

        // 1. Ta grille : le menu en haut de la page, puis « + Ajouter un critère », « Remplir » (le nom), « Algorithmique ».
        await etape(page, 1);
        expect(await enDemo(page)).toBe(true);
        const v1 = await bulleDit(page, { titre: B[0].titre, lieuSuite: B[0].lieuSuite, lignes: B[0].lignes, objectif: t.objectif }, 'bulle 1');
        expect(v1.entree, 'l’entrée').toBe('Parcours 8 · Automatiser tes commentaires · Je regarde');
        expect(v1.lignes.find((l) => l[0] === 'lieu')[1]).toBe(aPlat("Tu es dans « Conception », à l'onglet « Grilles » " + B[0].lieuSuite));
        expect(v1.boutons).toEqual([]);
        await contourSur(page, '#menuGrilles');
        await page.selectOption('#menuGrilles', depart.grille.id);
        await bulleDit(page, { titre: B[0].titre, lieuSuite: null, lignes: B[0].puis.lignes, objectif: null }, 'bulle 1, la grille ouverte');
        const ajouter = '#conteneurEditionGrille [data-action="ajouterCritereGrille"]';
        await contourSur(page, ajouter);
        await page.click(ajouter);
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual([REMPLIR]);
        await boutonDeBulle(page, REMPLIR).click();
        const carte = '#listeCriteres .item-liste:last-of-type';
        await expect(page.locator(`${carte} input[data-champ="nom"]`)).toHaveValue(m.critere);
        await expect.poll(async () => (await etatDuModele(page)).grille.criteres.map((c) => c[0])).toContain(m.critere);
        const type = `${carte} select[data-on-change^="modifierTypeCritere"]`;
        await contourSur(page, type);
        await page.selectOption(type, 'algorithmique');

        // 2. Ce que tu comptes : les quatre champs sont vides (l'application ne les préremplit pas) ; « Remplir ».
        await etape(page, 2);
        await bulleDit(page, { titre: B[1].titre, confirme: B[1].confirme, lieuSuite: null, lignes: B[1].lignes }, 'bulle 2');
        const noms = '#listeCriteres .noms-algo input[data-nom-paire]';
        expect(await page.locator(noms).evaluateAll((xs) => xs.map((x) => x.value)), 'rien de prérempli pour « Français écrit »').toEqual(['', '', '', '']);
        expect((await lireToute(page)).boutons).toEqual([REMPLIR]);
        await boutonDeBulle(page, REMPLIR).click();

        // 3. Tes codes : « Partir de la liste du français écrit » ; la seconde forme ; « Continuer ».
        await etape(page, 3);
        await bulleDit(page, { titre: B[2].titre, confirme: B[2].confirme, lieuSuite: null, lignes: B[2].lignes }, 'bulle 3');
        expect(await page.locator(noms).evaluateAll((xs) => xs.map((x) => x.value))).toEqual(m.noms.map((x) => x[2]));
        const liste = '#listeCriteres [data-action="initialiserSousCriteresParDefaut"]';
        await contourSur(page, liste);
        await page.click(liste);
        await bulleDit(page, { titre: B[2].titre, lieuSuite: null, lignes: B[2].puis.lignes }, 'bulle 3, les dix codes');
        await boutonDeBulle(page, 'Continuer').click();

        // 4. Ta note : « Remplir » pose les cinq pondérations ; « Continuer ».
        await etape(page, 4);
        await bulleDit(page, { titre: B[3].titre, confirme: B[3].confirme, lieuSuite: null, lignes: B[3].lignes }, 'bulle 4');
        expect((await lireToute(page)).boutons).toEqual([REMPLIR, 'Continuer']);
        await boutonDeBulle(page, REMPLIR).click();
        await expect.poll(async () => (await etatDuModele(page)).grille.criteres).toEqual([
            ['Structure', 'holistique', 16], ['Rigueur', 'holistique', 24], ['Plausibilité', 'holistique', 12], ['Nuance', 'holistique', 28],
            [m.critere, 'algorithmique', 20]]);
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual(['Continuer']);
        await boutonDeBulle(page, 'Continuer').click();

        // 5. Ce que l'étudiant·e lit : « Fixer une limite », « Remplir » (30 pour 900) ; « Continuer » ; les phrases ; « Continuer ».
        await etape(page, 5);
        await bulleDit(page, { titre: B[4].titre, confirme: B[4].confirme, lieuSuite: null, lignes: B[4].lignes }, 'bulle 5');
        const fixer = '#listeCriteres .atelier-algo-etape[data-etape="paliers"] .table-cas-fixer';
        await contourSur(page, fixer);
        await page.click(fixer);
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual([REMPLIR, 'Continuer']);
        await boutonDeBulle(page, REMPLIR).click();
        await expect(page.locator('#listeCriteres [data-param-cle="motsReference"]')).toHaveValue(m.limite.motsReference);
        await expect(page.locator('#listeCriteres [data-param-cle="erreursTolerees"]')).toHaveValue(m.limite.erreursTolerees);
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual(['Continuer']);
        await boutonDeBulle(page, 'Continuer').click();
        await bulleDit(page, { titre: B[4].titre, lieuSuite: null, lignes: B[4].puis.lignes }, 'bulle 5, ce que l’étudiant·e lit');
        // Ce que l'atelier montre à l'étape « Ce que l'étudiant·e lit » (la bulle cite « Ta production contient… ») : mesure.
        const eleve = aPlat(await page.locator('#listeCriteres .atelier-algo-etape[data-etape="eleve"] .atelier-algo-etape-corps').innerText());
        console.warn('MESURE bulle 5, l’étape « Ce que l’étudiant·e lit » :', eleve.slice(0, 400));
        if (!eleve.includes('Ta production contient')) test.info().annotations.push({ type: 'écart (rapport)', description: 'bulle 5 : l’atelier dit « ' + eleve.slice(0, 200) + ' »' });
        await boutonDeBulle(page, 'Continuer').click();

        // 6. Poser tes codes : la Liste ; « Actions › Annoter » sur la ligne d'Antilope Vaillante ; six codes ; « Évaluer ».
        await etape(page, 6);
        const v6 = await bulleDit(page, { titre: B[5].titre, confirme: B[5].confirme, lieuSuite: B[5].lieuSuite, lignes: B[5].lignes }, 'bulle 6');
        expect(v6.lignes.find((l) => l[0] === 'lieu')[1]).toBe(aPlat("Tu es dans « Évaluation », à l'onglet « Liste » " + B[5].lieuSuite));
        const actions = `#evaluations-liste tr[data-da="${ANTILOPE}"][data-production-id="${depart.copie.productionId}"] select.eval-actions-select`;
        // La bulle dit « la production « Artefact 1 » » : ce que la Liste affiche dans sa colonne « Production » (mesure).
        const colonne = await page.evaluate(([da, pid]) => {
            const tr = document.querySelector(`#evaluations-liste tr[data-da="${da}"][data-production-id="${pid}"]`);
            const ths = [...document.querySelectorAll('#evaluations-liste thead th')].map((th) => th.textContent.replace(/[↕︎↑↓]/g, '').trim());
            const k = ths.indexOf('Production');
            return tr && k >= 0 ? tr.children[k].textContent.replace(/\s+/g, ' ').trim() : null;
        }, [ANTILOPE, depart.copie.productionId]);
        // ⚠ MOT QUI NE TIENT PAS À L'ÉCRAN (mesuré le 22 nov. 2026, rapport du lot) : la Liste nomme la production par son
        // nom (« Appliquer des stratégies de lecture variées (Deux-Rives) »), jamais « Artefact 1 ». Le texte est validé
        // mot pour mot : il reste ; l'écart est noté, il ne fait pas rougir.
        if (!String(colonne).includes('Artefact 1')) test.info().annotations.push({ type: 'écart (rapport)', description: 'bulle 6 : la Liste dit « ' + colonne + ' »' });
        await contourSur(page, actions);
        await page.selectOption(actions, `annoter|${depart.copie.id}|${depart.copie.productionId}`);
        await expect(page.locator('#travaux-palette-erreurs-fr')).toBeVisible({ timeout: 10000 });
        await bulleDit(page, { titre: B[5].titre, lieuSuite: null, lignes: B[5].puis.lignes }, 'bulle 6, la copie ouverte');
        const codes = page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item');
        await expect(codes).toHaveCount(10);
        // La suggestion de la bulle : trois fois le code 1, deux fois le code 4, une fois le code 10.
        const poses = [];
        for (const k of [0, 0, 0, 3, 3, 9]) {
            await codes.nth(k).click();
            const p = await pointLibre(page, poses);
            expect(p, 'un point libre sur la production').not.toBeNull();
            poses.push(p);
            await page.mouse.click(p.x, p.y);
        }
        await expect(page.locator('#travaux-errfr-total-pastille')).toHaveText('6');
        await expect.poll(async () => (await etatDuModele(page)).codes).toEqual(['1', '1', '1', '10', '4', '4']);
        await page.click('#travaux-btn-actions');
        await page.click('#travaux-btn-evaluer');

        // 7. Ta rétroaction s'écrit seule : 6 erreurs ; 300 mots, écrits ; « Remplir » (M, M, E, M) ; le verrou.
        await etape(page, 7);
        await bulleDit(page, { titre: B[6].titre, confirme: B[6].confirme, lieuSuite: null, lignes: B[6].lignes }, 'bulle 7');
        const fe = await page.evaluate((nom) => (db.getSync('demo_grillesTemplates', []) || []).find((g) => g.nom === 'Grille générale à 4 critères')
            .criteres.find((c) => c.nom === nom).id, m.critere);
        await expect(page.locator('#eval_erreurs_' + fe)).toHaveValue('6', { timeout: 8000 });
        await contourSur(page, '#eval_mots_' + fe);
        await page.fill('#eval_mots_' + fe, m.mots);
        await page.locator('#eval_mots_' + fe).dispatchEvent('input');
        await page.locator('#eval_mots_' + fe).dispatchEvent('change');
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual([REMPLIR]);
        await boutonDeBulle(page, REMPLIR).click();
        await expect.poll(() => page.evaluate((n) => Object.keys(n).map((nom) => {
            const g = (db.getSync('demo_grillesTemplates', []) || []).find((x) => x.nom === 'Grille générale à 4 critères');
            const el = document.getElementById('eval_' + g.criteres.find((c) => c.nom === nom).id);
            return el ? el.value : null;
        }), m.niveaux)).toEqual(['M', 'M', 'E', 'M']);
        // La phrase du compte, dans la rétroaction : 6 erreurs, 300 mots (ses mots exacts : mesurés, rapportés).
        await expect(page.locator('#retroactionFinale1')).toHaveValue(/contient 6 erreurs (de français )?pour 300 mots\./);
        const phraseDuCompte = ((await page.locator('#retroactionFinale1').inputValue()).match(/[^\n·]*contient 6 erreurs[^\n·]*/) || [''])[0].trim();
        console.warn('MESURE bulle 7, la phrase du compte :', phraseDuCompte);
        if (!phraseDuCompte.startsWith('Ta production contient')) test.info().annotations.push({ type: 'écart (rapport)', description: 'bulle 7 : la rétroaction dit « ' + phraseDuCompte + ' »' });
        await contourSur(page, '#btnVerrouillerEvaluation');
        await page.click('#btnVerrouillerEvaluation');

        // 8. Et pour tes prochaines productions : la suite, trois boutons de même poids.
        await etape(page, 8);
        const v8 = await bulleDit(page, { titre: B[7].titre, confirme: B[7].confirme, lieuSuite: null,
            lignes: B[7].lignes.concat([['c', 'Touche « Le refaire avec ma classe », « Voir le parcours 9 », ou « Terminer »']]) }, 'bulle 8');
        expect(v8.lignes.filter((l) => l[0] === 'fin').map((l) => l[1])).toEqual(expect.arrayContaining([aPlat(t.objectifAtteint)]));
        expect(v8.boutons).toEqual(['Le refaire avec ma classe', 'Voir le parcours 9', 'Terminer']);
        const fin = await etatDuModele(page);
        expect(fin.antilope).toHaveLength(1);
        expect(fin.antilope[0]).toMatchObject({ verrouillee: true, niveaux: expect.arrayContaining([['Structure', 'M'], ['Rigueur', 'M'], ['Plausibilité', 'E'], ['Nuance', 'M']]) });
        expect(fin.antilope[0].retro).toContain(phraseDuCompte);
        // L'ajout direct (mesure du 22 nov. : ni les notes, ni la Liste, ni les indices P ne changent) : les huit
        // évaluations d'avant gardent leur note et leur niveau.
        expect(fin.autres, 'les évaluations d’avant, inchangées').toEqual(depart.autres);
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('commentaires').etat)).toBe('fait');

        // LE CONFINEMENT : rien hors de la démo n'a changé (les modèles 2, 3, 4 et celui-ci).
        // Break-test (22 nov.) : `ecrireCtx` qui écrit la préférence même en modèle → ROUGE ici.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        const vignettes = (await page.evaluate(() => (db.getSync('demo_fichiersTravaux', []) || []).map((f) => f.id)));
        const vignetteDeLaDemo = (k) => vignettes.some((id) => k === 'db:thumbnail_' + id || k === 'ls:thumbnail_' + id);
        // ⚠ TROUVAILLE (22 nov. 2026, rapport du lot) : quitter la démo pendant que le mode « Évaluer » est ouvert (la fin
        // de ce modèle le laisse ouvert sur la copie verrouillée) fait écrire à l'application, HORS de la démo, la clé
        // globale `dernieresSelectionsEvaluation` (`sauvegarderSelectionsEvaluation`, js/travaux-ui.js, avant de refermer le
        // mode) : la production et la grille DE LA DÉMO. Ce n'est pas le code du parcours. Tolérée NOMMÉMENT, à condition
        // qu'elle ne porte que la production de l'exemple : toute autre fuite rougit.
        const FUITE_CONNUE = ['db:dernieresSelectionsEvaluation', 'ls:dernieresSelectionsEvaluation'];
        FUITE_CONNUE.forEach((k) => { if (apres[k] !== avant[k]) expect(apres[k], k).toContain(depart.copie.productionId); });
        expect(ecarts(avant, apres, (k) => horsDeLaDemo(k) && !vignetteDeLaDemo(k) && !FUITE_CONNUE.includes(k)), 'aucune autre clé hors de la démo ne change').toEqual([]);

        // « Refaire » : le cinquième critère, les codes et l'évaluation d'Antilope Vaillante partent ; le reste reste.
        await ouvrirPanneau(page);
        await boutonModele(page, 'commentaires').click();
        await etape(page, 1);
        const defait = await etatDuModele(page);
        expect(defait.grille.criteres).toEqual(depart.grille.criteres);
        expect(defait.annotations).toBe(0);
        expect(defait.antilope).toEqual([]);
        expect(defait.autres).toEqual(depart.autres);
        expect(defait.tapir, 'la copie de Tapir Doux reste').toEqual(depart.tapir);
        const choix = await page.evaluate(() => ParcoursEvaluer.textes.choisirLeGroupe);
        const groupe2 = await page.evaluate(() => ParcoursClasse.deuxiemeGroupe().id);
        if ((await page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).id)) !== groupe2) {
            await expect.poll(async () => (await lireToute(page)).lignes.filter((l) => ['n', 'g', 'c'].includes(l[0])).map((l) => l[1])).toEqual([aPlat(choix)]);
            await page.selectOption('#selectGroupeCoursHeader', groupe2);
        }
        await bulleDit(page, { titre: B[0].titre, lieuSuite: B[0].lieuSuite, lignes: B[0].lignes, objectif: t.objectif }, 'bulle 1, après « Refaire »');
    });
}
