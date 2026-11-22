import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, enDemo, attendreEtape, contourSur, releve, ecarts, horsDeLaDemo,
    peuplerUnTrimestreReel, REMPLIR
} from './harness/deux-temps-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { faireLesTroisModeles } from './harness/trois-modeles-de-banc.js';
import { bulleDit, lireToute, aPlat } from './harness/bulle-du-22-nov.js';

// =======================================================================
// PARCOURS 7, « LIRE TA CLASSE ET INTERVENIR », « JE REGARDE » (22 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 3.1. Lancé sous le Chromium du nuage (le
// verdict WebKit et l'iPad viendront de la porte terrain).
//   A · sans le modèle de « Recevoir », le modèle refuse ; le panneau le dit, et la pulsation va à SA Modélisation.
//   B · aux deux tailles de l'iPad : les huit bulles, après les modèles des parcours 2, 3 et 4, mot pour mot (les textes
//       du module, que la sentinelle confronte à la consigne) ; « Remplir » (bulle 1) pose l'évaluation D, I, I, I de
//       Tapir Doux, reliée à sa copie ; « Remplir » (bulle 6) pose le plan ; l'intervention créée porte le plan ; ce
//       que l'écran affiche à la bulle 4 (les crochets, mesure M4) ; le confinement (aucune clé hors de la démo ne
//       change) ; « Refaire » retire l'évaluation et l'intervention, rien d'autre.
// Break-tests (22 nov.) : au rapport du lot.

const TAILLES = [[1180, 820], [820, 1180]];
const TOTAL = 8;
const etape = (page, n) => attendreEtape(page, n, TOTAL);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const textes = (page) => page.evaluate(() => JSON.parse(JSON.stringify({ t: ParcoursLireTaClasse.textes.modele, o: ParcoursLireTaClasse.objectifs,
    m4: ParcoursLireTaClasse.ecranM4, plan: ParcoursLireTaClasse.plan })));
const TAPIR = '9900005';

/** L'évaluation de Tapir Doux et ses interventions, dans la démo. */
const etatDeTapir = (page) => page.evaluate((da) => {
    const evals = (db.getSync('demo_evaluationsSauvegardees', []) || []).filter((e) => String(e.etudiantDA) === da && !e.remplaceeParId);
    const copie = (db.getSync('demo_fichiersTravaux', []) || []).find((f) => String(f.etudiantDA) === da);
    return {
        evaluations: evals.map((e) => ({ id: e.id, productionId: e.productionId, niveaux: e.criteres.map((c) => [c.critereNom, c.niveauSelectionne]),
            verrouillee: e.verrouillee, noteFinale: e.noteFinale, niveauFinal: e.niveauFinal })),
        copie: copie ? { id: copie.id, productionId: copie.productionId } : null,
        reliee: copie && window.travauxResolution ? (window.travauxResolution.trouverEvaluationPourFichier(copie) || {}).id || null : null,
        interventions: (db.getSync('demo_interventions', []) || []).filter((i) => (i.etudiants || []).includes(da))
            .map((i) => ({ id: i.id, titre: i.titre, niveauRai: i.niveauRai, duree: i.duree, etudiants: i.etudiants, criteresCibles: i.criteresCibles,
                objectifVise: i.objectifVise, description: i.description, statut: i.statut }))
    };
}, TAPIR);

test('A · sans le modèle de « Recevoir », le modèle de « Lire ta classe » refuse, le nomme, et la pulsation va à sa Modélisation', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, 820);
    await ouvrirPanneau(page);
    const t = await page.evaluate(() => ParcoursLireTaClasse.texteRefusModele);
    await boutonModele(page, 'lire-ta-classe').click();
    await expect(page.locator('#panneau-assistance [data-parcours="lire-ta-classe"]')).toContainText(aPlat(t).slice(0, 60));
    await expect(page.locator('#panneau-assistance [data-parcours="recevoir"] .assistance-modele-bouton')).toHaveClass(/assistance-parcours-bouton--appel/);
    expect(await page.evaluate(() => ParcoursMoteur.actif())).toBe(false);
    expect(await enDemo(page)).toBe(false);
});

for (const [L, H] of TAILLES) {
    test(`B · ${L} × ${H} : les huit bulles de « Je regarde », mot pour mot ; Tapir Doux évalué, son plan ; le confinement ; « Refaire »`, async ({ page }) => {
        test.setTimeout(420000);
        page.setDefaultTimeout(20000);
        // Les modèles préalables se jouent en portrait (le modèle de « Mettre ta classe en place » rougit en paysage sous
        // Chromium, hors de ce lot : voir je-regarde-recevoir-2026-11-17.spec.js).
        await ouvrirEspaceVide(page, 820, 1180);
        await peuplerUnTrimestreReel(page);
        // Les raccourcis d'annotation d'une personne qui a déjà annoté (sans eux, la première annotation, au modèle de
        // « Recevoir », pose les défauts : c'est l'application, au premier usage de ses outils ; même règle que son banc).
        await page.evaluate(() => db.setSync('raccourcisAnnotation', Object.assign({}, travauxOutils.obtenirRaccourcisAnnotation(), { texte: 'x' })));
        const avant = await releve(page);
        await faireLesTroisModeles(page);
        // Le relevé de la bulle juge le parcours de CE banc : celui des modèles préalables est remis à zéro (ils ont leurs
        // bancs, qui le portent). Mesuré le 22 nov. 2026 : « Importe-les » (modèle de « Recevoir », 4 sur 10, 820 × 1180)
        // y laisse un écart une fois sur deux, hors de ce lot.
        await page.evaluate(() => sessionStorage.removeItem('releve-bulle'));
        await page.setViewportSize({ width: L, height: H });
        const { t, o, m4, plan } = await textes(page);
        const sansEvaluation = await etatDeTapir(page);
        expect(sansEvaluation.evaluations, 'Tapir Doux sans évaluation après le modèle de « Recevoir »').toEqual([]);
        expect(sansEvaluation.copie, 'sa copie importée').toBeTruthy();

        await ouvrirPanneau(page);
        await boutonModele(page, 'lire-ta-classe').click();

        // 1. Ta classe d'un coup d'œil : « Remplir » pose l'évaluation de Tapir Doux ; puis « Détails ».
        await etape(page, 1);
        expect(await enDemo(page)).toBe(true);
        const v1 = await bulleDit(page, { titre: t[0].titre, lieuSuite: t[0].lieuSuite, lignes: t[0].lignes, objectif: o.modele }, 'bulle 1');
        expect(v1.entree, 'l’entrée').toBe('Parcours 7 · Lire ta classe et intervenir · Je regarde');
        expect(v1.lignes.find((l) => l[0] === 'lieu')[1]).toBe(aPlat("Tu es dans « Suivi », à l'onglet « Groupe » " + t[0].lieuSuite));
        expect(v1.boutons).toEqual([REMPLIR]);
        // 1.8 (consigne de la suite) : avant l'évaluation, son point est gris, tout à gauche de la bande P.
        const pointsDeP = () => page.evaluate(() => {
            const bandes = [...document.querySelectorAll('#carte-indicateurs-acpe .barre-etudiant')];
            const parDa = {};
            bandes.forEach((p) => { (parDa[p.dataset.da] = parDa[p.dataset.da] || []).push(p); });
            return Object.entries(parDa).map(([da, ps]) => { const p = ps[ps.length - 1]; return { da, gauche: parseFloat(p.style.left), gris: p.classList.contains('barre-etudiant-sans-eval') }; });
        });
        const avantP = await pointsDeP();
        const tapirAvant = avantP.find((x) => x.da === TAPIR);
        expect(tapirAvant.gris, 'son point est gris (sans évaluation)').toBe(true);
        expect(tapirAvant.gauche, 'tout à gauche de la bande').toBeLessThan(5);
        await boutonDeBulle(page, REMPLIR).click();
        await bulleDit(page, { titre: t[0].titre, lieuSuite: null, lignes: t[0].puis.lignes, objectif: null }, 'bulle 1, après « Remplir »');
        const pose = await etatDeTapir(page);
        expect(pose.evaluations).toHaveLength(1);
        expect(pose.evaluations[0]).toMatchObject({ niveaux: [['Structure', 'D'], ['Rigueur', 'I'], ['Plausibilité', 'I'], ['Nuance', 'I']],
            verrouillee: true, noteFinale: 45, niveauFinal: 'I', productionId: pose.copie.productionId });
        expect(pose.reliee, 'l’évaluation est celle de sa copie (paire DA, production)').toBe(pose.evaluations[0].id);
        // Son point sur la bande « Performance (P) » : 45 %, le plus bas du groupe (mesure M1).
        await expect.poll(() => page.evaluate((da) => { const p = [...document.querySelectorAll('#carte-indicateurs-acpe .barre-etudiant[data-da="' + da + '"]')].pop(); return p ? p.getAttribute('title') : ''; }, TAPIR))
            .toMatch(/^Doux, Tapir : 45\s%$/);
        // 1.8 : son point a pris sa place, le plus bas des points évalués du groupe.
        await expect.poll(async () => {
            const ps = (await pointsDeP()).filter((x) => !x.gris);
            const t = ps.find((x) => x.da === TAPIR);
            return !!t && ps.every((x) => x.da === TAPIR || x.gauche > t.gauche);
        }, { message: 'le point de Tapir Doux, le plus bas du groupe' }).toBe(true);
        await contourSur(page, '#btn-toggle-panneau-prioritaire');
        await flecheVers(page, '#btn-toggle-panneau-prioritaire', 'bulle 1, « Détails »');
        await page.click('#btn-toggle-panneau-prioritaire');

        // 2. Qui s'écarte ? Le P de Tapir Doux ; les autres pastilles ne répondent pas.
        await etape(page, 2);
        await bulleDit(page, { titre: t[1].titre, confirme: t[1].confirme, lieuSuite: null, lignes: t[1].lignes }, 'bulle 2');
        const ligneTapir = `#liste-etudiants-suivi .etudiant-suivi-item[data-da="${TAPIR}"]`;
        await expect(page.locator(ligneTapir)).toContainText(/A 100\s%.*C 100\s%.*P 45\s%/);
        await contourSur(page, `${ligneTapir} .prioritaire-indice:nth-child(3)`);
        // La pastille A de Tapir, gardée : le profil ne s'ouvre pas.
        await page.locator(`${ligneTapir} .prioritaire-indice`).first().click({ force: true });
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('2 sur 8');
        await expect(page.locator('#suivi-profil')).toBeHidden();
        await page.locator(`${ligneTapir} .prioritaire-indice`, { hasText: /^P/ }).click();

        // 3. Ce qui l'écarte : le profil, sur « Engagement ACP ».
        await etape(page, 3);
        await bulleDit(page, { titre: t[2].titre, confirme: t[2].confirme, lieuSuite: t[2].lieuSuite, lignes: t[2].lignes }, 'bulle 3');
        expect((await lireToute(page)).lignes.find((l) => l[0] === 'lieu')[1]).toBe(aPlat("Tu es dans « Suivi », à l'onglet « Profils » " + t[2].lieuSuite));
        await expect(page.locator('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="mobilisation"]')).toHaveAttribute('aria-current', 'true');
        await expect(page.locator('#profil-contenu-dynamique')).toContainText('Assiduité parfaite !');
        await expect(page.locator('#profil-contenu-dynamique')).toContainText('Toutes les productions sont remises !');
        await contourSur(page, '#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');
        await page.click('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');

        // 4. De quoi il a besoin : les deux lignes à crochets disent ce que la carte RàI affiche (M4).
        await etape(page, 4);
        await bulleDit(page, { titre: t[3].titre, confirme: t[3].confirme, lieuSuite: null, lignes: t[3].lignes }, 'bulle 4');
        const carte = page.locator('#profil-contenu-dynamique .profil-carte', { hasText: "Modèle de la Réponse à l'intervention" });
        await expect(carte).toContainText(m4.niveau);
        await expect(carte).toContainText(m4.phrase);
        await expect(carte).toContainText('Défi principal : ' + m4.defi);
        // 1.8, MESURE (rien changé) : pourquoi « Nuance » parmi trois critères à égalité. Les moyennes par critère, et les
        // pondérations de la grille de dépistage que lit `diagnostiquerForcesChallenges` (tri : le score, puis la
        // pondération la plus forte). Relevé pour le rapport.
        const pourquoi = await page.evaluate((da) => {
            const g = typeof obtenirGrilleReferenceDepistage === 'function' ? obtenirGrilleReferenceDepistage() : null;
            return { grille: g ? g.nom : null, ponderations: g ? g.criteres.map((c) => [c.nom, c.ponderation]) : null,
                moyennes: typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null };
        }, TAPIR);
        test.info().annotations.push({ type: `pourquoi « Nuance » (${L} × ${H})`, description: JSON.stringify(pourquoi) });
        const pond = Object.fromEntries((pourquoi.ponderations || []).map(([n, p]) => [n, p]));
        expect(pond['Nuance'], 'Nuance pèse plus que Rigueur et Plausibilité dans la grille de dépistage').toBeGreaterThan(Math.max(pond['Rigueur'], pond['Plausibilité']));
        await boutonDeBulle(page, 'Continuer').click();

        // 5. Ouvrir l'intervention : « HISTORIQUE », aucune ; « + Nouvelle intervention ».
        await etape(page, 5);
        await bulleDit(page, { titre: t[4].titre, confirme: t[4].confirme, lieuSuite: null, lignes: t[4].lignes }, 'bulle 5');
        await expect(page.locator('#profil-contenu-dynamique')).toContainText('Aucune intervention documentée.');
        const nouvelle = page.locator('#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]', { hasText: '+ Nouvelle intervention' });
        await contourSur(page, '#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]');
        await nouvelle.click();

        // 6. Ton plan : la fiche, Tapir coché, la date du jour ; « Remplir » pose le plan ; « Créer l'intervention ».
        await etape(page, 6);
        await bulleDit(page, { titre: t[5].titre, confirme: t[5].confirme, lieuSuite: t[5].lieuSuite, lignes: t[5].lignes }, 'bulle 6');
        expect((await lireToute(page)).lignes.find((l) => l[0] === 'lieu')[1]).toBe(aPlat("Tu es dans « Suivi », à l'onglet « Interventions » " + t[5].lieuSuite));
        await expect(page.locator(`#etud-${TAPIR}`)).toBeChecked();
        await expect(page.locator('#interventionDate')).toHaveValue('2026-11-10');
        // 1.8 : la fiche propose le niveau 2 et coche les quatre critères (ce que disent 1.5 et 1.6).
        await expect(page.locator('#interventionNiveau')).toHaveValue('2');
        expect(await page.evaluate(() => [...document.querySelectorAll('#criteresCiblesContainer .critere-cible-cb:checked')].map((c) => c.value).sort()))
            .toEqual(['Nuance', 'Plausibilité', 'Rigueur', 'Structure']);
        await boutonDeBulle(page, REMPLIR).click();
        await bulleDit(page, { titre: t[5].titre, lieuSuite: null, lignes: t[5].puis.lignes }, 'bulle 6, après « Remplir »');
        await expect(page.locator('#interventionTitre')).toHaveValue(plan.titre);
        await expect(page.locator('#interventionNiveau')).toHaveValue('3');
        await expect(page.locator('#objectifVise')).toHaveValue(plan.objectif);
        await contourSur(page, '[data-fiche-intervention] [data-action="sauvegarderPresencesIntervention"]');
        await page.click('[data-fiche-intervention] [data-action="sauvegarderPresencesIntervention"]');

        // 7. Après l'intervention : rien à faire ; le statut ne répond pas.
        await etape(page, 7);
        await bulleDit(page, { titre: t[6].titre, confirme: t[6].confirme, lieuSuite: null, lignes: t[6].lignes }, 'bulle 7');
        const cree = await etatDeTapir(page);
        expect(cree.interventions).toHaveLength(1);
        expect(cree.interventions[0]).toMatchObject({ titre: plan.titre, niveauRai: 3, duree: 1, etudiants: [TAPIR], criteresCibles: ['Rigueur'],
            objectifVise: plan.objectif, description: plan.description, statut: 'en-cours' });
        await page.locator('[data-fiche-intervention] label:has(input[name="interventionStatut"][value="completee"])').click({ force: true });
        expect((await etatDeTapir(page)).interventions[0].statut, 'le statut gardé').toBe('en-cours');
        await boutonDeBulle(page, 'Continuer').click();

        // 8. La suite : l'objectif atteint, la suite suggérée, trois boutons de même poids.
        await etape(page, 8);
        const v8 = await bulleDit(page, { titre: t[7].titre, confirme: t[7].confirme, lieuSuite: null,
            lignes: t[7].lignes.concat([['c', 'Touche « Le refaire avec ma classe », « Voir le parcours 8 », ou « Terminer »']]) }, 'bulle 8');
        expect(v8.lignes.filter((l) => l[0] === 'fin').map((l) => l[1])).toEqual(expect.arrayContaining([aPlat(o.modeleAtteint),
            aPlat('Suite suggérée : le parcours 8, « Automatiser tes commentaires ».')]));
        expect(v8.boutons).toEqual(['Le refaire avec ma classe', 'Voir le parcours 8', 'Terminer']);
        expect(await bulle(page).locator('.parcours-bulle-boutons button.btn-principal').count(), 'aucun bouton mis en avant').toBe(0);
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatModeleDe('lire-ta-classe').etat)).toBe('fait');

        // LE CONFINEMENT : rien hors de la démo n'a changé (les modèles 2, 3, 4 et celui-ci).
        // Break-test (22 nov.) : dans `poserLEvaluationDeTapir`, la garde `demo_` retirée et la clé réelle écrite → ROUGE ici.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        const vignettes = (await page.evaluate(() => (db.getSync('demo_fichiersTravaux', []) || []).map((f) => f.id)));
        const vignetteDeLaDemo = (k) => vignettes.some((id) => k === 'db:thumbnail_' + id || k === 'ls:thumbnail_' + id);
        // ⚠ TROUVAILLE (22 nov. 2026, rapport du lot) : ouvrir le profil d'un·e étudiant·e de la démo fait écrire à
        // l'application, HORS de la démo, la clé globale `jetonsEtudiants` (`obtenirStatutJetonsEtudiant` →
        // `initialiserJetonsEtudiant`, js/evaluation-jetons.js) : une entrée vide pour son DA. Ce n'est pas le code du
        // parcours (le geste de la bulle 2 ouvre le profil, comme tout profil ouvert dans la démo) ; inscrite, pas corrigée
        // ici. Elle est tolérée NOMMÉMENT, à cette valeur exacte : toute autre fuite rougit.
        const FUITE_CONNUE = { 'db:jetonsEtudiants': '{"9900005":{}}', 'ls:jetonsEtudiants': '{"9900005":{}}' };
        expect(Object.fromEntries(Object.keys(FUITE_CONNUE).map((k) => [k, apres[k] ?? null])), 'la fuite connue, telle quelle').toEqual(FUITE_CONNUE);
        expect(ecarts(avant, apres, (k) => horsDeLaDemo(k) && !vignetteDeLaDemo(k) && !(k in FUITE_CONNUE)), 'aucune autre clé hors de la démo ne change').toEqual([]);

        // « Refaire » : l'évaluation de Tapir Doux et son intervention partent ; les huit autres évaluations restent.
        const autres = await page.evaluate(() => (db.getSync('demo_evaluationsSauvegardees', []) || []).filter((e) => String(e.etudiantDA) !== '9900005').map((e) => e.id).sort());
        await ouvrirPanneau(page);
        await boutonModele(page, 'lire-ta-classe').click();
        await etape(page, 1);
        const defait = await etatDeTapir(page);
        expect(defait.evaluations).toEqual([]);
        expect(defait.interventions).toEqual([]);
        expect(await page.evaluate(() => (db.getSync('demo_evaluationsSauvegardees', []) || []).filter((e) => String(e.etudiantDA) !== '9900005').map((e) => e.id).sort())).toEqual(autres);
        // La démo rouverte par « Refaire » est sur son premier groupe : la bulle demande le deuxième (la règle des modèles).
        const choix = await page.evaluate(() => ParcoursEvaluer.textes.choisirLeGroupe);
        const groupe2 = await page.evaluate(() => ParcoursClasse.deuxiemeGroupe().id);
        if ((await page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).id)) !== groupe2) {
            await expect.poll(async () => (await lireToute(page)).lignes.filter((l) => ['n', 'g', 'c'].includes(l[0])).map((l) => l[1])).toEqual([aPlat(choix)]);
            await page.selectOption('#selectGroupeCoursHeader', groupe2);
        }
        await expect.poll(async () => (await lireToute(page)).boutons).toEqual([REMPLIR]);
        await bulleDit(page, { titre: t[0].titre, lieuSuite: t[0].lieuSuite, lignes: t[0].lignes, objectif: o.modele }, 'bulle 1, après « Refaire »');
    });
}
