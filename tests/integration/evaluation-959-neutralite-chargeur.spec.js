import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #959, relecture croisée de Cowork (26 sept. 2026) — le chargeur partagé émet `change` sur la
// remise et l'intégrité, ce que le chemin de la copie ne faisait pas : `changerStatutRemise`
// rappelle `cartoucheSelectionnee()` AVANT que l'échelle de l'évaluation soit posée.
//   P1 · neutralité à l'ouverture : cartouche, échelle, commentaires par critère et rétroaction
//        finale d'une évaluation enregistrée, qui diffèrent de ce que la production prévoit.
//   P2 · anciens statuts de remise (`remis`, `non-remis`), par la Liste ET par la copie.
//   M1 · la rétroaction finale réécrite à la main, par les deux chemins.
// Trajet de la copie : `evaluerProduction` (la visionneuse), celui du banc #946. Noms fictifs.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't959';
const COMMENTAIRE = "ENREGISTRÉ c1_M : ton propos tient, d'un bout à l'autre.";
const A_LA_MAIN = 'Réécrite à la main : relis ta conclusion à voix haute avant de la remettre.';

async function monter(page, { statutRemise = 'evalue' } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, COMMENTAIRE, A_LA_MAIN, statutRemise }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-959';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC959', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST959', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC959' }
        ]);
        // La production prévoit l'échelle E959 et la cartouche CT959R ; l'évaluation porte E959B et CT959.
        window.db.setSync(T + '_productions', [
            { id: 'p959', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G959', echelleId: 'E959', cartoucheId: 'CT959R', groupeCoursId: 'GC959' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G959', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [
            { id: 'E959', nom: 'IDME de la production', niveaux },
            { id: 'E959B', nom: 'IDME de l\'évaluation', niveaux }
        ]);
        window.db.setSync(T + '_cartouches_G959', [
            { id: 'CT959', nom: 'Cartouche de la copie', grilleId: 'G959', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA COPIE c1_M', c2_D: 'CARTOUCHE DE LA COPIE c2_D' } },
            { id: 'CT959R', nom: 'Cartouche de la production', grilleId: 'G959', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA PRODUCTION c1_M', c2_D: 'CARTOUCHE DE LA PRODUCTION c2_D' } }
        ]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV959', etudiantDA: 'TEST959', productionId: 'p959', groupeCoursId: 'GC959',
            grilleId: 'G959', echelleId: 'E959B', cartoucheId: 'CT959', statutRemise, statutIntegrite: 'recevable',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: COMMENTAIRE },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '' }
            ],
            retroactionFinale: A_LA_MAIN
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT959', etudiantDA: 'TEST959', productionId: 'p959', coursId, groupeCoursId: 'GC959',
            nomFichier: 'FICTIF_TEST959_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC959' });
        window.db.setSync('groupeCoursActif', { id: 'GC959', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT959' ? copie : original.apply(this, arguments); };

        // Quel chargeur répond (les appels internes passent par le nom global).
        window._chargeurs959 = [];
        const v = window.verifierEtChargerEvaluationExistante;
        window.verifierEtChargerEvaluationExistante = function () { window._chargeurs959.push('copie'); return v.apply(this, arguments); };
        const m = window.modifierEvaluationParId;
        window.modifierEvaluationParId = function () { window._chargeurs959.push('modifier'); return m.apply(this, arguments); };
    }, { png: PNG, T, COMMENTAIRE, A_LA_MAIN, statutRemise });
    return erreurs;
}

const base = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV959'), T);

async function laisserPasserLesChargeurs(page) {
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

async function ouvrir(page, chemin) {
    if (chemin === 'copie') await page.evaluate(() => window.evaluerProduction('TEST959', 'p959'));
    else await page.evaluate(() => window.modifierEvaluation('EV959'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV959', null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
}

async function enregistrer(page) {
    await page.evaluate(() => document.querySelector('[data-action="sauvegarderEvaluation"]').click());
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

const pertinent = (ev) => ({
    cartoucheId: ev.cartoucheId, echelleId: ev.echelleId, statutRemise: ev.statutRemise,
    commentaires: ev.criteres.map(c => c.retroaction || ''), niveaux: ev.criteres.map(c => c.niveauSelectionne),
    retroactionFinale: ev.retroactionFinale
});

// MESURÉ LE 26 SEPT. 2026, IDENTIQUE SUR LE CODE D'AVANT LE LOT (`98a0fc0b`) ET D'APRÈS :
//   · par la copie (la visionneuse enchaîne « copie, copie, modifier »), la SIMPLE OUVERTURE écrit en
//     base : la rétroaction finale réécrite à la main est remplacée par le texte régénéré, et un
//     commentaire de critère enregistré vide prend celui de la cartouche. ⮕ #960, inscrite.
//   · par la Liste, l'ouverture n'écrit rien ; « Enregistrer » garde la rétroaction à la main, mais
//     remplit aussi le commentaire vide depuis la cartouche (question posée avec #960, règle #939).
// Ces écarts sont déclarés `test.fail` : le jour où #960 les corrige, le banc le dira.
const nom = (chemin) => (chemin === 'copie' ? 'la copie' : 'la Liste');

for (const chemin of ['copie', 'liste']) {
    test(`#959 P1(a) · ouverte par ${nom(chemin)} puis enregistrée : cartouche, échelle et niveaux inchangés`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page);
        const avant = pertinent(await base(page));
        await ouvrir(page, chemin);
        await enregistrer(page);
        const apres = pertinent(await base(page));
        console.warn(`[959 P1a ${chemin}] chargeurs=${await page.evaluate(() => window._chargeurs959.join(','))} base=${JSON.stringify(apres)}`);
        expect.soft(apres.cartoucheId, 'cartouche').toBe(avant.cartoucheId);
        expect.soft(apres.echelleId, 'échelle').toBe(avant.echelleId);
        expect.soft(apres.statutRemise, 'remise').toBe(avant.statutRemise);
        expect.soft(apres.niveaux, 'niveaux').toEqual(avant.niveaux);
        expect.soft(apres.commentaires[0], 'commentaire enregistré (non vide)').toBe(COMMENTAIRE);
        expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
    });

    for (const [ancien, nouveau] of [['remis', 'evalue'], ['non-remis', 'non-recu']]) {
        test(`#959 P2 · ancien statut « ${ancien} » par ${nom(chemin)} : le menu montre « ${nouveau} », « Enregistrer » l'écrit`, async ({ page }) => {
            test.setTimeout(90000);
            await monter(page, { statutRemise: ancien });
            await ouvrir(page, chemin);
            const menu = await page.evaluate(() => document.getElementById('remiseProduction1').value);
            await page.evaluate(() => window.sauvegarderEvaluationModifiee());
            await page.waitForTimeout(800);
            const ecrit = (await base(page)).statutRemise;
            expect.soft(menu, 'menu').toBe(nouveau);
            expect(ecrit, 'base').toBe(nouveau);
        });
    }
}

test('#959 P1(b) · ouverte par la Liste sans rien toucher : la base est inchangée', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    const avant = await base(page);
    await ouvrir(page, 'liste');
    expect(await base(page)).toEqual(avant);
});

test('#959 M1 · par la Liste, « Enregistrer » garde la rétroaction réécrite à la main', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'liste');
    await enregistrer(page);
    expect((await base(page)).retroactionFinale).toBe(A_LA_MAIN);
});

test('#960 (antérieur à #959) · ouverte par la copie sans rien toucher : la base devrait être inchangée', async ({ page }) => {
    test.fail(true, '#960 — la simple ouverture par la visionneuse réécrit la rétroaction et remplit le commentaire vide');
    test.setTimeout(90000);
    await monter(page);
    const avant = await base(page);
    await ouvrir(page, 'copie');
    expect(await base(page)).toEqual(avant);
});

test('#960 (antérieur à #959) · par la copie, la rétroaction réécrite à la main devrait survivre', async ({ page }) => {
    test.fail(true, '#960 — remplacée par le texte régénéré depuis les critères');
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'copie');
    await enregistrer(page);
    expect((await base(page)).retroactionFinale).toBe(A_LA_MAIN);
});
