import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { attendreApplication } from './harness/attendre-application.js';
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, boutonPratique, bulle, carte, enDemo, attendreEtape, contourSur,
    releve, ecarts, horsDeLaDemo, DE_LA_DEMO, peuplerUnTrimestreReel, materiel, faireLaModelisation,
    lireBulle, attendreRemplir, remplirPuisVoir, REMPLIR
} from './harness/deux-temps-de-banc.js';
import { etiqueter } from './harness/classe-de-banc.js';
import { actionDeLaListe, valeursActions } from './harness/parcours-3-de-banc.js';

// =======================================================================
// LOT « LES DEUX TEMPS, LES MODÈLES » (13 NOVEMBRE 2026) — REMIS À JOUR LE 15 NOVEMBRE 2026
// =======================================================================
// Consignes : `plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md`, puis
// `plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`. Sous WebKit, aux deux orientations de l'iPad
// (1180 × 820 et 820 × 1180).
//   A · le panneau : la liste de dix ; le modèle d'« Évaluer » refuse tant que le deuxième groupe n'existe pas, nomme
//       « Mettre ta classe en place » et met la pulsation sur le bouton de SA Modélisation ; « Le refaire avec ma
//       classe » lance la Pratique guidée par les gardes du panneau.
//   B · le modèle d'« Évaluer une première production », de bout en bout, en trois temps (« Remplir avec l'exemple »,
//       puis le bouton de la page) : la grille de l'exemple entre dans l'étiquetage, que la personne fait elle-même ;
//       la production, les consignes (échéance : le mardi 9 septembre 2025) et la cartouche (ses vingt commentaires)
//       sont remplies par la bulle ; la rétroaction réécrite porte les quatre commentaires du profil (Structure M,
//       Rigueur D, Plausibilité D, Nuance D) et « Bon départ ! » ; la fin à deux boutons (« Recevoir » n'a pas encore
//       son modèle) ; le confinement : la grille, la production, la pratique, la cartouche et l'évaluation vivent dans
//       la démo, aucune clé hors d'elle ne change, et « Remettre la démo à neuf » les efface.
// MESURE DU 15 NOV. 2026 (ancienne décision 3.1) : la grille de l'exemple, étiquetée, n'offre PAS le choix « des
// points » / « des niveaux de performance » (il ne paraît que pour une grille qui porte les deux) : elle naît en
// points, et le détour par les quatre menus « Type » reste. Ce banc le vérifie à chaque passage.

const ORIENTATIONS = [[1180, 820], [820, 1180]];
const M = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
const TOTAL = 9;
const etape = (page, n, titre) => attendreEtape(page, n, TOTAL, titre);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
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

test('« Le refaire avec ma classe » passe par les gardes du panneau : sans classe, le panneau dit pourquoi ; avec, la Pratique guidée part sur les vraies données', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 1180, 820);
    const refaire = () => page.evaluate(() => ParcoursClasse.suitesDuModele('evaluer', () => {})[0].action());
    expect(await page.evaluate(() => ParcoursClasse.suitesDuModele('evaluer', () => {}).map((b) => b.libelle))).toEqual(['Le refaire avec ma classe', 'Terminer']);
    // Sans classe en place : rien ne part ; le panneau s'ouvre et nomme le préalable.
    await refaire();
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
    await expect(bulle(page)).toHaveCount(0);
    await page.evaluate(() => Assistance.fermerPanneau());
    // Avec une classe : la Pratique guidée part, sur les vraies données.
    await peuplerUnTrimestreReel(page);
    await refaire();
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9', { timeout: 10000 });
    expect(await enDemo(page)).toBe(false);
    expect(await page.evaluate(() => Assistance.etatDe('evaluer').etat)).toBe('en-cours');
    expect((await lireBulle(page)).boutons, 'en Pratique guidée, la bulle ne remplit rien').not.toContain(REMPLIR);
    await page.evaluate(() => ParcoursMoteur.fermer());
});

for (const [L, H] of ORIENTATIONS) {
    test(`A · ${L} × ${H} : la liste de dix, le refus du modèle d’« Évaluer » sans le deuxième groupe, la pulsation sur la Modélisation à faire d’abord`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspaceVide(page, L, H);
        await ouvrirPanneau(page);
        expect((await materiel(page)).etudiants).toHaveLength(10);
        for (const b of [boutonModele(page, 'classe'), boutonPratique(page, 'classe'), boutonModele(page, 'evaluer'), boutonPratique(page, 'evaluer')]) {
            expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
            expect(await b.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'le libellé tient dans son bouton').toBe(true);
        }
        // Rien ne déborde du panneau, aux deux orientations.
        expect(await page.locator('#panneau-assistance').evaluate((p) => p.scrollWidth <= p.clientWidth + 1)).toBe(true);

        // Le modèle d'« Évaluer » : son préalable est la Modélisation de « Mettre ta classe en place ».
        // Break-test (13 nov. 2026) : `refusModele` retiré de l'enregistrement → ROUGE (le refus manque). Rétabli → vert.
        await expect(boutonModele(page, 'evaluer')).not.toHaveAttribute('aria-disabled', 'true');
        await boutonModele(page, 'evaluer').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(boutonModele(page, 'classe')).toHaveClass(/assistance-parcours-bouton--appel/);
        await expect(boutonPratique(page, 'classe')).not.toHaveClass(/assistance-parcours-bouton--appel/);
        await expect(bulle(page)).toHaveCount(0);
        expect(await enDemo(page)).toBe(false);
    });

    test(`B · ${L} × ${H} : le modèle d’« Évaluer une première production », de bout en bout, en trois temps ; le confinement ; la remise à neuf`, async ({ page }) => {
        test.setTimeout(300000);
        page.setDefaultTimeout(20000);   // un geste qui n'aboutit pas se dit en vingt secondes, pas à la fin de l'essai
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        const avant = await releve(page);
        const duPack = Object.fromEntries(Object.entries(avant).filter(([k]) => DE_LA_DEMO.test(k)));

        // Le préalable : la Modélisation de « Mettre ta classe en place » ; sa dernière bulle offre « Voir le parcours suivant ».
        await ouvrirPanneau(page);
        await boutonModele(page, 'classe').click();
        await faireLaModelisation(page);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
        await boutonDeBulle(page, 'Voir le parcours suivant').click();
        const m = await M(page);

        // 1. Les deux bulles d'ouverture (c'est ici qu'on étiquette pour la première fois), puis la grille de l'exemple.
        await etape(page, 1, 'Pourquoi étiqueter');
        expect(await enDemo(page)).toBe(true);
        await boutonDeBulle(page, 'Continuer').click();
        await etape(page, 1, 'Tu apprends aussi');
        await boutonDeBulle(page, 'Continuer').click();
        await etape(page, 1, 'Ta grille');
        await attendreRemplir(page, 'étape 1');
        await boutonDeBulle(page, REMPLIR).click();
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        // La grille de l'exemple, lue comme un collage : un tableau, une partie par case (2 + 4 × 3).
        await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(14);
        await expect(page.locator('#dissection-contenu')).toContainText(m.grille.nom);
        // L'étiquetage reste le geste de la personne : la bulle n'offre plus « Remplir ».
        await expect.poll(async () => (await lireBulle(page)).boutons).not.toContain(REMPLIR);
        await etiqueterTous(page, 'titre', [m.grille.nom]);
        await etiqueterTous(page, 'description', [m.grille.description].concat(m.grille.criteres.map((c) => c[1])));
        await etiqueterTous(page, 'critere', m.grille.criteres.map((c) => c[0]));
        await etiqueterTous(page, 'ponderation', m.grille.criteres.map((c) => c[2]));
        // MESURE (ancienne décision 3.1) : cette grille ne porte ni points ni niveaux nommés ; le choix « des points » /
        // « des niveaux de performance » ne lui est pas offert.
        await expect(page.locator('#dissection-creer-choix')).toBeHidden();
        await page.locator('#materiel-dissection button', { hasText: 'Créer ma grille' }).click();
        // … elle naît donc en points, et le détour par les quatre menus « Type » reste.
        await expect(bulle(page)).toContainText('passe chacun de ses quatre critères à « Holistique »');
        expect(await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === 'G4H Sans français').criteres.map((c) => c.type)))
            .toEqual(['analytique', 'analytique', 'analytique', 'analytique']);
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

        // 2. La production : « + Nouvelle production » (le geste de la page), puis les trois temps.
        await etape(page, 2, 'Ta production');
        expect((await lireBulle(page)).consignes).toEqual(['Touche « + Nouvelle production »']);
        expect((await lireBulle(page)).boutons).toEqual([]);
        await contourSur(page, '#conception-productions [data-action="creerNouvelleProduction"]');
        await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
        await attendreRemplir(page, 'étape 2');
        await remplirPuisVoir(page, { consigne: 'Touche « Créer la production »', bouton: '#btnCreerProduction', contexte: 'étape 2' });
        const grilleId = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === 'G4H Sans français').id);
        // Le nom dit ce qu'elle fait faire (la démo a déjà un « Artefact 1 »), repris en « Activité d'apprentissage ».
        await expect(page.locator('#productionTitre')).toHaveValue('Appliquer des stratégies de lecture variées (Deux-Rives)');
        await expect(page.locator('#productionActivite')).toHaveValue(m.production.description);
        await expect(page.locator('#productionType')).toHaveValue(m.production.type);
        await expect(page.locator('#productionGrille')).toHaveValue(grilleId);
        expect(await page.locator('#productionEchelle').evaluate((s) => s.selectedOptions[0].textContent)).toContain(m.echelle);
        await page.click('#btnCreerProduction');

        // 3. Les consignes et l'échéance : le mardi 9 septembre 2025, une séance du deuxième groupe.
        await etape(page, 3, 'Tes consignes');
        await attendreRemplir(page, 'étape 3');
        await remplirPuisVoir(page, { consigne: 'Coche « Consignes transmises » (la production entre alors au calendrier du groupe)', bouton: null, contexte: 'étape 3' });
        await expect(page.locator('#productionObjectif')).toHaveValue(m.production.objectif);
        await expect(page.locator('#productionTache')).toHaveValue(m.production.tache);
        expect(m.production.tache.replace(/ /g, ' ')).toMatch(/^Annoter le texte « Deux-Rives » en y appliquant/);
        await expect(page.locator('#productionDetailTache')).toHaveValue(m.production.detailTache);
        await expect(page.locator('#productionDateEcheance')).toHaveValue('2025-09-09');
        expect(await page.evaluate(() => {
            const s = obtenirSeancesCompletesDuGroupe(db.getSync('groupeCoursActif', null).id);
            return Array.isArray(s['2025-09-09']) && s['2025-09-09'].length > 0;
        }), 'le 2025-09-09 est une séance du deuxième groupe').toBe(true);
        await expect(bulle(page)).toContainText('le mardi 9 septembre 2025');
        await expect(bulle(page)).not.toContainText(/aujourd/);
        await page.check('#productionEcheanceAssignee');

        // 4. L'étudiant·e de la ligne que la bulle pointe, nommé·e dans la bulle ; les niveaux imposés ; « Verrouiller ».
        // TOUJOURS YACK AMICAL (Grégoire, 17 nov. 2026), quel que soit le tri de la Liste : la Liste est d'abord triée par
        // prénom (le geste de la page), tri qui met Antilope Vaillante, l'une des trois copies du modèle de « Recevoir »,
        // en première ligne (mesuré le 17 nov. 2026).
        // Break-test (17 nov. 2026) : `daDeLaLigne` rendant `undefined` dans le modèle (l'ancienne première ligne) →
        // ROUGE ici (« evaluer|9900006|… », Antilope Vaillante). Rétabli → vert.
        await etape(page, 4, 'Une première production');
        const pid = await page.evaluate((g) => (db.getSync(cle('productions'), []) || []).find((p) => p.grilleId === g).id, grilleId);
        await page.click('#evaluations-liste th[data-param="prenom"]');
        await expect(page.locator('#tri-eval-prenom')).toHaveText('↑');
        expect((await valeursActions(page, pid)).find((v) => v.startsWith('evaluer|')), 'le tri par prénom met Antilope Vaillante en tête').toBe('evaluer|9900006|' + pid);
        const evaluer = 'evaluer|' + m.etudiantEvalue.da + '|' + pid;
        const da = m.etudiantEvalue.da;
        expect(da).toBe('9900007');
        const qui = await page.evaluate((d) => { const e = obtenirEtudiantsCoursActif().find((x) => String(x.da) === d); return e.prenom + ' ' + e.nom; }, da);
        expect(qui).toBe('Yack Amical');
        await expect(bulle(page)).toContainText(qui);
        await expect(bulle(page)).toContainText("choisis le niveau de l'exemple");
        await expect(bulle(page)).toContainText('Structure M, Rigueur D, Plausibilité D, Nuance D');
        await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value="${evaluer}"])`);
        await actionDeLaListe(page, evaluer);
        await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
        await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
        const criteres = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.id));
        for (const [k, [, niveau]] of m.niveaux.entries()) await page.selectOption('#' + criteres[k], niveau);
        await page.click('#btnVerrouillerEvaluation');
        await expect.poll(() => page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).filter((e) => e.productionId === p).map((e) => e.etudiantDA), pid)).toEqual(['9900007']);

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

        // 8. La cartouche : « + Nouvelle cartouche », puis les trois temps ; l'échelle du pack (aucune échelle neuve) et
        // les vingt commentaires, remplis par la bulle (plus de fichier à télécharger) ; puis la production la nomme.
        await etape(page, 8, 'Ta cartouche');
        expect((await lireBulle(page)).consignes).toEqual(['Touche « + Nouvelle cartouche »']);
        await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
        await attendreRemplir(page, 'étape 8');
        const echellesAvant = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length);
        await remplirPuisVoir(page, { consigne: 'Touche « Créer la cartouche »', bouton: '#btnCreerCartouche', contexte: 'étape 8' });
        await expect(page.locator('#nomCartouche')).toHaveValue(m.cartouche);
        expect(m.cartouche).not.toMatch(/refonte|A26/);
        await expect(page.locator('#selectGrilleCartouche')).toHaveValue(grilleId);
        expect(await page.locator('#selectEchelleCartouche').evaluate((s) => s.selectedOptions[0].textContent)).toContain(m.echelle);
        await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]')).toHaveCount(20);
        // Les vingt cases, le niveau 0 compris (#531), chacune avec le commentaire de son critère et de son niveau.
        const cases = await page.evaluate((g) => {
            const noms = Object.fromEntries((db.getSync(cle('grillesTemplates'), []) || []).find((x) => x.id === g).criteres.map((c) => [c.id, c.nom.toUpperCase()]));
            return [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')].map((t) => {
                const reste = t.id.slice(5), coupe = reste.lastIndexOf('_');
                return [noms[reste.slice(0, coupe)] + ' (' + reste.slice(coupe + 1) + ')', t.value];
            });
        }, grilleId);
        for (const [caseDite, texte] of cases) expect(m.commentaires, caseDite).toContain('**' + caseDite + '** : ' + texte);
        expect(new Set(cases.map((c) => c[0])).size).toBe(20);
        // Ce que la page dit d'elle-même quand on écrit dans une cartouche pas encore créée (#517) : un avertissement, une
        // fois par cartouche. Il dit ce que dit la consigne de la bulle. Laissé tel quel (c'est la page, pas le modèle),
        // nommé au rapport ; le banc le retire pour toucher l'en-tête plus loin.
        await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
        await page.click('#btnCreerCartouche');
        await expect.poll(async () => (await ceQuiEstCree(page)).cartouches).toBe(1);
        expect(await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).length), 'aucune échelle neuve').toBe(echellesAvant);
        await expect.poll(async () => (await lireBulle(page)).consignes).toEqual(['Dans la fiche de la production, choisis cette cartouche (elle s\'appliquera à chaque évaluation)']);
        await page.click('#sous-navigation [data-sous-onglet="conception-productions"]');
        if (!(await page.locator('#formulaireProduction').isVisible())) await page.click(`#conception-productions [data-action="modifierProduction"][data-param="${pid}"]`);
        const cartoucheId = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || [])[0].id, grilleId);
        await contourSur(page, '#productionCartouche');
        await page.selectOption('#productionCartouche', cartoucheId);

        // 9. La rétroaction réécrite : les quatre commentaires du profil, et le mot. LA FIN : « Recevoir » n'a pas encore
        // son modèle : « Voir le parcours suivant » n'y est pas, et la consigne suit les boutons présents.
        await etape(page, 9, 'Ta rétroaction, avec tes mots');
        await expect(bulle(page)).toContainText(m.mot);
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
        await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Le refaire avec ma classe', 'Terminer']);
        const fin = await lireBulle(page);
        expect(fin.principal, 'aucun bouton mis en avant').toEqual([]);
        expect(fin.consignes).toEqual(['Touche « Le refaire avec ma classe », ou « Terminer »']);
        expect(fin.derniere).toBe(fin.consignes[0]);
        await expect(bulle(page).locator('.parcours-bulle-note').last()).toHaveText(/Pour revoir une étape, touche «\s9 sur 9\s»\./);
        const evaluationId = await page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.productionId === p).id, pid);
        const consulter = (await valeursActions(page, evaluationId)).find((v) => v.startsWith('consulter|'));
        await actionDeLaListe(page, consulter);
        await page.waitForFunction((id) => {
            const ec = window.evaluationEnCours, b = document.getElementById('btnVerrouillerEvaluation');
            return !!ec && ec.idModification === id && !window._chargementsEvaluationEnCours && !!b && b.title === 'Déverrouiller l’évaluation';
        }, evaluationId, { timeout: 10000 });
        await page.click('#btnVerrouillerEvaluation');
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
        await boutonDeBulle(page, 'Terminer').click();
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
        await ouvrirPanneau(page);
        await page.click('#assistance-demo-neuf');
        await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
        await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
        const neuf = await releve(page);
        expect(ecarts(duPack, neuf, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
        expect(ecarts(avant, neuf, horsDeLaDemo), 'les autres clés identiques').toEqual([]);
        expect(await ceQuiEstCree(page)).toEqual({ grille: null, production: null, pratiques: 0, cartouches: 0, evaluations: 0 });
        // Le deuxième groupe parti avec elle : le modèle refuse de nouveau, et nomme son préalable.
        if (!(await page.locator('#panneau-assistance').isVisible())) await ouvrirPanneau(page);
        // (La remise à neuf a oublié les Modélisations : celle d'« Évaluer » est de nouveau « À faire ».)
        await expect(carte(page, 'evaluer').locator('.assistance-modele-etat')).toHaveText('À faire');
        await boutonModele(page, 'evaluer').click();
        await expect(carte(page, 'evaluer').locator('.assistance-parcours-refus')).toContainText('Mettre ta classe en place');
        await expect(bulle(page)).toHaveCount(0);
    });
}
