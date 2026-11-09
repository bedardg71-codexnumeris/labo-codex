import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// DEUX LIENS VERS LA CARTE (9 nov. 2026) — les gestes, à l'écran.
//
//   1. L'objectif : dans la zone 🎯 d'une leçon, « Reprendre l’objectif d’une
//      production » ajoute une ligne liée, non modifiable sur place ; elle suit
//      le texte de la production ; « Délier » en refait un objectif ordinaire.
//      La fiche de production dit « Repris dans la carte : leçon « … », … ».
//   2. La compétence : un bloc existant propose « Relier à la fiche du cours »
//      et montre les deux textes ; relié, il affiche le numéro et l'énoncé de
//      la fiche ; « Délier » lui rend son titre.
//   3. Le stock : une évaluation dont la production a le même objectif qu'une
//      leçon propose « Relier » ; rien n'est relié avant le geste.
//
// La carte est celle du mode démo (fictive). Les textes posés ici sont fictifs.
// ⚠ Banc Chromium (session cloud) : le verdict WebKit se prend sur le Mac.

const CAPTURES = process.env.CAPTURES_DEUX_LIENS;
const OBJECTIF_A = 'Analyser un poème fictif en trois mouvements';
const OBJECTIF_B = 'Analyser un poème fictif en trois mouvements et en justifier la lecture';
const FICHE = { numero: '4EF0', enonce: 'Analyser des textes littéraires fictifs',
    elements: '• Reconnaître le propos du texte\nRepérer et classer des thèmes\nConfronter deux lectures' };

async function ouvrirCarte(page, { clair = false } = {}) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    // Le mode démo est prêt quand ses clés répondent : la carte démo et ses productions.
    await page.waitForFunction(() => window.cle('productions').startsWith('demo_')
        && (db.getSync(window.cle('planification_mindmap'), null) || {}).cartes
        && (db.getSync(window.cle('productions'), []) || []).length > 0, null, { timeout: 20000 });
    await page.evaluate((clair) => {
        document.body.classList.toggle('mode-clair', clair);
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
    }, clair);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await expect(page.locator('.planif-noeud').first()).toBeVisible();
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
}

/**
 * Prépare le terrain : une production démo porte OBJECTIF_A ; la carte est
 * rattachée à une fiche de cours qui porte une compétence ; la première leçon
 * est dépliée et placée en semaine 1. Rend les ids utiles.
 */
const preparer = (page) => page.evaluate(({ OBJECTIF_A, FICHE }) => {
    const cleProd = window.cle('productions');
    const prods = db.getSync(cleProd, []);
    const prod = prods.find(p => p && p.dansBibliotheque !== false) || prods[0];
    prod.objectif = OBJECTIF_A;
    db.setSync(cleProd, prods);

    const cours = db.getSync('cours', []) || [];
    let fiche = cours.find(c => c && c.nature !== 'service');
    if (!fiche) { fiche = { id: 'cours-fictif-deux-liens', nature: 'cours', titre: 'Cours fictif' }; cours.push(fiche); }
    fiche.numeroCompetence = FICHE.numero;
    fiche.competence = FICHE.enonce;
    fiche.elementsCompetence = FICHE.elements;
    db.setSync('cours', cours);

    const pd = window.planificationDonnees;
    const index = pd.getIndex();
    pd.definirCoursDeCarte(index.active, fiche.id);
    window.planificationCarte.chargerCarte(index.active);

    const api = window.planificationCarte;
    const lecons = [...api.etat.noeuds.values()].filter(n => n.type === 'lecon')
        .sort((a, b) => a.titre.localeCompare(b.titre));
    const lecon = lecons[0];
    lecon.metadata.objectifDeplie = true;
    api.definirSemaineLecon(lecon.id, 1);
    const competence = [...api.etat.noeuds.values()].find(n => n.type === 'competence');
    const evaluation = lecon.enfants.map(id => api.etat.noeuds.get(id)).find(n => n && n.type === 'evaluation');
    // `definirSemaineLecon` a sauvegardé (zone dépliée comprise) : on recharge
    // la carte pour que le rendu parte du stockage, comme au retour dans la section.
    api.chargerCarte(index.active);
    return { prodId: prod.id, prodTitre: prod.titre, coursId: fiche.id, lecon: lecon.id, leconTitre: lecon.titre,
        competence: competence.id, competenceTitre: competence.titre, evaluation: evaluation && evaluation.id };
}, { OBJECTIF_A, FICHE });

test.describe('Deux liens · l’objectif d’une production', () => {
    test('reprendre, suivre le texte, délier — et la mention dans la fiche de production', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        const bloc = page.locator('#' + ids.lecon);

        // Reprendre : la commande est un sélecteur, sa première entrée porte le libellé validé.
        const sel = bloc.locator('select.planif-obj-reprendre');
        await expect(sel.locator('option').first()).toHaveText('Reprendre l’objectif d’une production');
        await sel.selectOption(ids.prodId);

        const ligne = page.locator('#' + ids.lecon + ' .planif-noeud-objectif--lie');
        await expect(ligne).toHaveText(OBJECTIF_A);
        await expect(ligne).not.toHaveAttribute('contenteditable', /.*/);
        const objId = await ligne.getAttribute('data-obj-id');
        expect(await page.evaluate(({ l, o }) => {
            const ob = window.planificationCarte.objectifsDeLecon(window.planificationCarte.etat.noeuds.get(l)).find(x => x.id === o);
            return ob;
        }, { l: ids.lecon, o: objId })).toEqual({ id: objId, texte: OBJECTIF_A, productionId: ids.prodId });

        // Rien n'est coché d'office dans l'évaluation de la leçon.
        if (ids.evaluation) {
            const servis = await page.evaluate((e) => window.planificationCarte.etat.noeuds.get(e).metadata.objectifsServis || [], ids.evaluation);
            expect(servis).not.toContain(objId);
        }

        // Toucher la ligne ouvre ses deux commandes.
        await ligne.click();
        const menu = page.locator('#' + ids.lecon + ' .planif-obj-lie-menu');
        await expect(menu.locator('button')).toHaveText(['Modifier dans la production', 'Délier']);


        // Le texte suit la production : modifiée ailleurs, la carte rechargée la montre.
        await page.evaluate(({ OBJECTIF_B, prodId }) => {
            const cleProd = window.cle('productions');
            const prods = db.getSync(cleProd, []);
            prods.find(p => p.id === prodId).objectif = OBJECTIF_B;
            db.setSync(cleProd, prods);
            window.planificationCarte.chargerCarte(window.planificationDonnees.getIndex().active);
        }, { OBJECTIF_B, prodId: ids.prodId });
        await expect(page.locator('#' + ids.lecon + ' .planif-noeud-objectif--lie')).toHaveText(OBJECTIF_B);

        // Le plan de cours exporté imprime le texte courant de la production.
        const plan = await page.evaluate(() => JSON.stringify(window.planificationExport.construirePlan({})));
        expect(plan).toContain(OBJECTIF_B);
        expect(plan).not.toContain('"' + OBJECTIF_A + '"');

        // La fiche de production dit où son objectif est repris.
        await page.evaluate(async (prodId) => {
            if (typeof afficherSection === 'function') afficherSection('conception');
            if (typeof afficherSousSection === 'function') afficherSousSection('conception-productions');
            await window.chargerProductionPourModif(prodId);
        }, ids.prodId);
        const mention = page.locator('.production-objectif-reprise');
        await expect(mention).toHaveText('Repris dans la carte : leçon « ' + ids.leconTitre + ' », semaine 1');

        // Délier : retour à la carte, la ligne redevient ordinaire, avec le texte du moment.
        await page.evaluate(() => {
            document.querySelectorAll('.section.active, .sous-section.active').forEach(el => el.classList.remove('active'));
            document.getElementById('section-conception')?.classList.add('active');
            document.getElementById('conception-carte')?.classList.add('active');
            window.planificationCarte.chargerCarte(window.planificationDonnees.getIndex().active);
        });
        await page.locator('#' + ids.lecon + ' .planif-noeud-objectif--lie').click();
        await page.locator('#' + ids.lecon + ' [data-geste-lien="delier"]').click();
        const libre = page.locator('#' + ids.lecon + ' .planif-noeud-objectif[data-obj-id="' + objId + '"]');
        await expect(libre).toHaveAttribute('contenteditable', 'true');
        await expect(libre).toHaveText(OBJECTIF_B);
        expect(await page.evaluate(({ l, o }) => window.planificationCarte.objectifsDeLecon(window.planificationCarte.etat.noeuds.get(l)).find(x => x.id === o), { l: ids.lecon, o: objId }))
            .toEqual({ id: objId, texte: OBJECTIF_B });
    });

    test('le stock : « Relier » n’apparaît que pour un objectif identique, et rien n’est relié avant le geste', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        // La démo porte une évaluation dans cette leçon : sans elle, l'essai doit ÉCHOUER, pas sauter.
        expect(ids.evaluation, 'la leçon démo n’a plus d’évaluation').toBeTruthy();
        await page.evaluate(({ ids, OBJECTIF_A }) => {
            const api = window.planificationCarte;
            // Posé AVANT l'écriture des objectifs, qui sauvegarde la carte entière.
            api.etat.noeuds.get(ids.evaluation).metadata.productionId = ids.prodId;
            api.definirObjectifsLecon(ids.lecon, [OBJECTIF_A, 'Un autre objectif fictif']);
            window.planificationCarte.chargerCarte(window.planificationDonnees.getIndex().active);
        }, { ids, OBJECTIF_A });
        // Rien n'est relié par le chargement.
        expect(await page.evaluate((l) => window.planificationCarte.objectifsDeLecon(window.planificationCarte.etat.noeuds.get(l)).some(o => o.productionId), ids.lecon)).toBe(false);

        await page.locator('#' + ids.evaluation).dispatchEvent('dblclick');
        const relier = page.locator('.planif-btn-relier-objectif');
        await expect(relier).toHaveCount(1);
        await expect(relier).toHaveText('Relier');
        await relier.evaluate((el) => el.click());
        expect(await page.evaluate((l) => window.planificationCarte.objectifsDeLecon(window.planificationCarte.etat.noeuds.get(l)).map(o => !!o.productionId), ids.lecon))
            .toEqual([true, false]);
        await expect(page.locator('.planif-btn-relier-objectif')).toHaveCount(0);
    });
});

test.describe('Deux liens · la compétence de la fiche du cours', () => {
    test('relier un bloc existant : deux textes montrés, lien posé, éléments en lecture seule, délier rend le titre', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        const bloc = page.locator('#' + ids.competence);
        // Le stock n'est pas relié d'office : le bloc garde son titre, modifiable.
        await expect(bloc.locator('.planif-noeud-titre')).toHaveText(ids.competenceTitre);
        await expect(bloc.locator('.planif-noeud-titre')).toHaveAttribute('contenteditable', 'true');

        await bloc.dispatchEvent('dblclick');
        await expect(page.locator('#planif-panneau-titre')).toHaveValue(ids.competenceTitre);
        await expect(page.locator('.planif-panneau-texte-fiche')).toHaveText(FICHE.numero + ' · ' + FICHE.enonce);
        const relier = page.locator('#planif-btn-competence-relier');
        await expect(relier).toHaveText('Relier à la fiche du cours');
        await relier.evaluate((el) => el.click());

        // Relié : numéro et énoncé de la fiche, titre non modifiable, éléments en lecture seule.
        await expect(bloc.locator('.planif-noeud-numero-competence')).toHaveText(FICHE.numero);
        await expect(bloc.locator('.planif-noeud-titre')).toHaveText(FICHE.enonce);
        await expect(bloc.locator('.planif-noeud-titre')).not.toHaveAttribute('contenteditable', /.*/);
        await expect(page.locator('#planif-panneau-titre')).toHaveJSProperty('readOnly', true);
        await expect(page.locator('.planif-panneau-elements li')).toHaveText([
            'Reconnaître le propos du texte', 'Repérer et classer des thèmes', 'Confronter deux lectures']);
        await expect(page.locator('#planif-btn-competence-fiche')).toHaveText('Modifier dans la fiche du cours');
        await expect(page.locator('#planif-btn-competence-delier')).toHaveText('Délier');
        // Les éléments ne deviennent pas des blocs.
        expect(await page.evaluate(() => [...window.planificationCarte.etat.noeuds.values()].filter(n => n.titre === 'Confronter deux lectures').length)).toBe(0);

        // Le titre écrit avant le lien est gardé de côté, jamais effacé.
        expect(await page.evaluate((c) => window.planificationCarte.etat.noeuds.get(c).metadata.titreAvantLien, ids.competence))
            .toBe(ids.competenceTitre);

        // La fiche change : la carte rechargée suit.
        await page.evaluate(({ coursId }) => {
            const cours = db.getSync('cours', []);
            cours.find(c => c.id === coursId).competence = 'Énoncé fictif révisé';
            db.setSync('cours', cours);
            window.planificationCarte.chargerCarte(window.planificationDonnees.getIndex().active);
        }, ids);
        await expect(bloc.locator('.planif-noeud-titre')).toHaveText('Énoncé fictif révisé');

        // Délier : le titre de l'enseignant·e revient.
        await bloc.dispatchEvent('dblclick');
        await page.locator('#planif-btn-competence-delier').evaluate((el) => el.click());
        await expect(bloc.locator('.planif-noeud-titre')).toHaveText(ids.competenceTitre);
        await expect(bloc.locator('.planif-noeud-titre')).toHaveAttribute('contenteditable', 'true');
        await expect(page.locator('#planif-panneau-titre')).toHaveJSProperty('readOnly', false);
    });

    test('posée depuis la palette, une compétence naît liée ; la deuxième reste libre ; une copie garde le texte, pas le lien', async ({ page }) => {
        await ouvrirCarte(page);
        await preparer(page);
        const avant = await page.evaluate(() => new Set([...window.planificationCarte.etat.noeuds.keys()]).size);
        const nouveaux = async () => page.evaluate((n) => [...window.planificationCarte.etat.noeuds.values()]
            .slice(n).filter(x => x.type === 'competence').map(x => ({ id: x.id, titre: x.titre, lie: !!x.metadata.lieFicheCours })), avant);

        await page.locator('#planif-palette .planif-palette-btn[data-type="competence"]').dispatchEvent('click', { detail: 1 });
        let crees = await nouveaux();
        expect(crees).toEqual([{ id: crees[0].id, titre: FICHE.enonce, lie: true }]);
        await expect(page.locator('#' + crees[0].id + ' .planif-noeud-titre')).toHaveText(FICHE.enonce);
        await expect(page.locator('#' + crees[0].id + ' .planif-noeud-numero-competence')).toHaveText(FICHE.numero);

        await page.locator('#planif-palette .planif-palette-btn[data-type="competence"]').dispatchEvent('click', { detail: 1 });
        crees = await nouveaux();
        expect(crees[1]).toEqual({ id: crees[1].id, titre: '', lie: false });

        // Copier (pas cloner) le bloc lié : la copie est un autre bloc.
        await page.evaluate((id) => window.planificationCarte.dupliquerNoeud(id, true, false), crees[0].id);
        crees = await nouveaux();
        expect(crees[2]).toEqual({ id: crees[2].id, titre: FICHE.enonce, lie: false });
    });

    test('« Modifier dans la fiche du cours » ouvre Cadre › Trimestre sur la fiche', async ({ page }) => {
        await ouvrirCarte(page);
        const ids = await preparer(page);
        await page.evaluate((c) => window.planificationCarte.relierCompetenceAFiche(c), ids.competence);
        await page.locator('#' + ids.competence).dispatchEvent('dblclick');
        await page.locator('#planif-btn-competence-fiche').evaluate((el) => el.click());
        await expect(page.locator('#calendrier-trimestre')).toBeVisible();
        await expect(page.locator('#v2-competence')).toHaveValue(FICHE.enonce);
    });
});

// ─── Captures pour Grégoire (CAPTURES_DEUX_LIENS=<dossier>), 1180 px, densité 2, sombre et clair ─────────
// Les palettes flottantes et le bandeau de démo sont masqués : à 1180 px, la palette du planificateur
// recouvre l'Inspecteur et le bloc Compétence (mesuré sous Chromium), le bandeau coupe la leçon.
test.describe('captures', () => {
    test.use({ deviceScaleFactor: 2 });
    for (const clair of [false, true]) {
        const theme = clair ? 'clair' : 'sombre';
        test(`captures · ${theme} : la leçon et sa ligne liée, la fiche de production, le bloc Compétence et son Inspecteur`, async ({ page }) => {
            test.skip(!CAPTURES, 'CAPTURES_DEUX_LIENS non défini');
            const fichier = (nom) => path.join(CAPTURES, `${nom}-1180-${theme}.png`);
            await ouvrirCarte(page, { clair });
            await page.addStyleTag({ content: '#planif-palette, #planif-palette-nav, #bandeau-demo { display: none !important; }' });
            const ids = await preparer(page);
            // Le stock : la leçon porte déjà, sans lien, l'objectif de la production que son évaluation désigne.
            await page.evaluate(({ l, p, e, OBJECTIF_A }) => {
                const api = window.planificationCarte;
                api.etat.noeuds.get(e).metadata.productionId = p;
                const objs = api.objectifsDeLecon(api.etat.noeuds.get(l));
                api.definirObjectifsLecon(l, objs.concat([{ id: null, texte: OBJECTIF_A }]));
                api.chargerCarte(window.planificationDonnees.getIndex().active);
            }, { l: ids.lecon, p: ids.prodId, e: ids.evaluation, OBJECTIF_A });
            // Défilement immédiat (pas l'animation de `naviguerVers`) : rien à attendre.
            const centrer = (id) => page.evaluate((id) => document.getElementById(id)
                .scrollIntoView({ block: 'center', inline: 'center' }), id);

            // 1. L'Inspecteur de l'évaluation : « Relier » sur l'objectif identique.
            await centrer(ids.lecon);
            await page.locator('#' + ids.evaluation).dispatchEvent('dblclick');
            await expect(page.locator('.planif-btn-relier-objectif')).toHaveCount(1);
            await page.locator('.planif-btn-relier-objectif').scrollIntoViewIfNeeded();
            await page.locator('#planif-panneau').screenshot({ path: fichier('inspecteur-evaluation-relier') });

            // 2. Relié : la leçon montre la ligne liée ; la toucher ouvre ses deux commandes.
            await page.locator('.planif-btn-relier-objectif').evaluate((el) => el.click());
            await page.evaluate(() => window.planificationCarte.deselectionner && window.planificationCarte.deselectionner());
            // L'en-tête de la leçon au milieu de la zone : la leçon est haute, la centrer
            // entière ferait passer son en-tête sous la barre d'outils.
            await page.evaluate((l) => document.querySelector('#' + l + ' .planif-noeud-entete').scrollIntoView({ block: 'center' }), ids.lecon);
            await page.locator('#' + ids.lecon + ' .planif-noeud-objectif--lie').click();
            const entete = await page.locator('#' + ids.lecon + ' .planif-noeud-entete').boundingBox();
            const zone = await page.locator('#' + ids.lecon + ' .planif-noeud-objectifs').boundingBox();
            await page.screenshot({ path: fichier('lecon-ligne-liee'), clip: { x: entete.x - 24, y: entete.y - 16,
                width: entete.width + 48, height: (zone.y + zone.height) - entete.y + 64 } });

            // 3. Le bloc Compétence du stock, avant de relier : les deux textes, et « Relier à la fiche du cours ».
            await centrer(ids.competence);
            await page.locator('#' + ids.competence).dispatchEvent('dblclick');
            await expect(page.locator('#planif-btn-competence-relier')).toBeVisible();
            await page.screenshot({ path: fichier('competence-avant-relier') });

            // 4. Relié : le bloc (numéro et énoncé de la fiche) et son Inspecteur (éléments en lecture seule).
            await page.locator('#planif-btn-competence-relier').evaluate((el) => el.click());
            await expect(page.locator('#planif-btn-competence-delier')).toBeVisible();
            await page.screenshot({ path: fichier('competence-liee-et-inspecteur') });

            // 5. La fiche de production et sa mention.
            await page.evaluate(async (prodId) => {
                afficherSection('conception');
                afficherSousSection('conception-productions');
                await window.chargerProductionPourModif(prodId);
            }, ids.prodId);
            await expect(page.locator('.production-objectif-reprise')).toBeVisible();
            await page.locator('[data-ancre="objectif"]').scrollIntoViewIfNeeded();
            await page.locator('[data-ancre="objectif"]').screenshot({ path: fichier('fiche-production-mention') });
        });
    }
});
