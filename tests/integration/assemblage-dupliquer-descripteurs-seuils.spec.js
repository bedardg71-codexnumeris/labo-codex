import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// ASSEMBLAGE DE LA RELEASE (19 nov. 2026, `lot/assemblage-release`) — LE BANC CROISÉ que les lots ne pouvaient
// pas avoir chacun de son côté (consigne : `plans de travail/CONSIGNE-2026-11-19-assemblage-release.md`).
//
// Trois lots se rencontrent sur la même grille :
//   · `lot/dupliquer-copie-profonde` (#1298) : « Dupliquer » copie EN PROFONDEUR et garde les identifiants des critères ;
//   · `lot/autoevaluation-consignes` : la case « Pour vérifier » (`critere.descripteurs.pourVerifier`) ;
//   · le même lot, « noms des seuils » : la case du niveau qui porte un seuil de l'échelle montre « Seuil minimal de
//     réussite » ou « Seuil de maîtrise ».
//
// ▣ CE QUE CHAQUE ESSAI JUGE, PAR LE GESTE RÉEL : dupliquer une grille qui porte des descripteurs et un « Pour
//   vérifier » ; la copie les garde (et les identifiants de ses critères) ; les deux étiquettes de seuil paraissent
//   dans la COPIE ; changer un descripteur ET la question dans la copie, par leurs cases, ne change pas la source,
//   relue dans IndexedDB (`db.get`) et dans le JSON (`db.getSync`), avant et après rechargement ; la source, rouverte,
//   montre ses propres textes. Deux gestes : le bouton « Dupliquer » de l'éditeur et « Dupliquer » de la bibliothèque.
//
// ▣ BREAK-TEST (fait à l'assemblage, voir le rapport) : remettre l'étalement dans le geste rougit l'essai ; couper
//   les étiquettes de seuil (`etiquettesSeuilsDuNiveau` → []) le rougit aussi.
//
// Données FICTIVES. ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

const ID_DEPART = 'ECHELLE_IDME_DEPART';
const TEXTE_D = 'Tu nommes deux procédés fictifs, sans encore les relier.';
const TEXTE_M = 'Chaque procédé fictif est relié à un effet.';
const QUESTION = 'Ai-je relié chaque procédé fictif à un effet ?';
const TEXTE_D_COPIE = 'Texte de niveau réécrit dans la copie seulement.';
const QUESTION_COPIE = 'Question réécrite dans la copie seulement ?';

const GRILLE = {
    id: 'GRILLE_CROISE_ASSEMBLAGE',
    nom: 'Grille fictive du banc croisé',
    type: 'holistique',
    isDemo: false,
    criteres: [
        {
            id: 'CR_CROISE_A', nom: 'Analyse fictive', type: 'holistique', ponderation: 60,
            descripteurs: { echelleId: ID_DEPART, parNiveau: { D: TEXTE_D, M: TEXTE_M }, pourVerifier: QUESTION }
        },
        { id: 'CR_CROISE_B', nom: 'Langue fictive', type: 'holistique', ponderation: 40 }
    ]
};
const NOM_COPIE = GRILLE.nom + ' (copie)';

async function ouvrirApp(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApplication(page);
    const refus = await page.evaluate(async ({ grille, id }) => {
        await assurerEchelleIdmeDeDepart();
        // Les deux seuils de l'échelle de départ, posés par le geste de l'écran de l'échelle : D et M.
        await ecrireRepereEchelle(id, 'seuilMaitrise', '');
        await ecrireRepereEchelle(id, 'seuilSuffisance', '');
        const r1 = await ecrireRepereEchelle(id, 'seuilMaitrise', 'M');
        const r2 = await ecrireRepereEchelle(id, 'seuilSuffisance', 'D');
        await db.set(cle('grillesTemplates'), [grille]);   // security-ok: banc, grille fictive dans un contexte neuf
        await db.flush();
        naviguerVers('conception', 'grille-criteres');
        return [r1 && r1.refuse, r2 && r2.refuse].filter(Boolean);
    }, { grille: GRILLE, id: ID_DEPART });
    expect(refus).toEqual([]);
}

/** Source et copie relues par `db.get` (IndexedDB) et `db.getSync` (JSON), avec les objets qu'elles ont en commun. */
const lire = (page) => page.evaluate(async ({ idSource, nomCopie }) => {
    // Un objet partagé ne se voit que par identité (écrit ici, pas emprunté au code jugé).
    const objetsPartages = (a, b) => {
        const vus = new Set();
        (function noter(v) {
            if (!v || typeof v !== 'object' || vus.has(v)) return;
            vus.add(v);
            for (const k of Object.keys(v)) noter(v[k]);
        })(a);
        const chemins = [];
        (function chercher(v, ch, dejaVus) {
            if (!v || typeof v !== 'object' || dejaVus.has(v)) return;
            dejaVus.add(v);
            if (vus.has(v)) { chemins.push(ch || '(racine)'); return; }
            for (const k of Object.keys(v)) chercher(v[k], ch ? ch + '.' + k : k, dejaVus);
        })(b, '', new Set());
        return chemins;
    };
    const d = (g) => (g && g.criteres && g.criteres[0] && g.criteres[0].descripteurs) || {};
    const textes = (g) => ({ D: (d(g).parNiveau || {}).D, M: (d(g).parNiveau || {}).M, question: d(g).pourVerifier, echelleId: d(g).echelleId });
    const enBase = (await db.get(cle('grillesTemplates'))) || [];
    const json = db.getSync(cle('grillesTemplates'), []) || [];
    const source = enBase.find((g) => g.id === idSource);
    const copies = enBase.filter((g) => g.nom === nomCopie);
    const copie = copies[0] || null;
    return {
        copies: copies.length,
        idCopie: copie && copie.id,
        idsCriteresCopie: copie ? copie.criteres.map((c) => c.id) : null,
        partages: copie ? objetsPartages(source, copie) : null,
        source: textes(source),
        copie: textes(copie),
        sourceJson: textes(json.find((g) => g.id === idSource)),
        copieJson: textes(copie && json.find((g) => g.id === copie.id))
    };
}, { idSource: GRILLE.id, nomCopie: NOM_COPIE });

const carte = (page) => page.locator('#listeCriteres .item-liste').first();
const cases = (page) => carte(page).locator('.grille-attendu > .grille-attendu-niveaux .grille-attendu-niveau');
const caseNiveau = (page, id, code) => page.locator(`#listeCriteres textarea[data-on-change="modifierDescripteurNiveauHandler"][data-grille-id="${id}"][data-critere-index="0"][data-niveau="${code}"]`);
const caseQuestion = (page, id) => page.locator(`#listeCriteres textarea[data-on-change="modifierQuestionVerificationHandler"][data-grille-id="${id}"][data-critere-index="0"]`);

async function ouvrirGrille(page, id) {
    await page.evaluate(async (gid) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(gid); }, id);
    await expect(caseNiveau(page, id, 'D')).toBeVisible();
}

/** [nom du niveau, étiquettes] des cases qui portent une étiquette de seuil. */
const etiquettes = (page) => cases(page).evaluateAll((cs) => cs
    .map((c) => [c.querySelector('strong').textContent, [...c.querySelectorAll('.grille-attendu-seuil')].map((s) => s.textContent)])
    .filter(([, e]) => e.length));

/** La copie, ouverte : ses textes dans leurs cases, et les deux étiquettes de seuil. */
async function verifierLaCopieOuverte(page, idCopie, attendu) {
    await ouvrirGrille(page, idCopie);
    await expect(caseNiveau(page, idCopie, 'D')).toHaveValue(attendu.D);
    await expect(caseNiveau(page, idCopie, 'M')).toHaveValue(TEXTE_M);
    await expect(caseQuestion(page, idCopie)).toHaveValue(attendu.question);
    expect(await etiquettes(page)).toEqual([['Développement', ['Seuil minimal de réussite']], ['Maîtrise', ['Seuil de maîtrise']]]);
    await expect(carte(page).locator('.grille-attendu-seuil').first()).toBeVisible();
}

async function scenario(page, dupliquer) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirApp(page);
    const deLaSource = { D: TEXTE_D, M: TEXTE_M, question: QUESTION, echelleId: ID_DEPART };

    // 1. DUPLIQUER : la copie garde ses descripteurs, sa question et les identifiants de ses critères ; rien de partagé.
    await dupliquer(page);
    await expect.poll(async () => (await lire(page)).copies).toBe(1);
    const apres = await lire(page);
    const idCopie = apres.idCopie;
    expect(apres.idsCriteresCopie).toEqual(GRILLE.criteres.map((c) => c.id));
    expect(apres.copie).toEqual(deLaSource);
    expect(apres.partages).toEqual([]);

    // 2. LA COPIE, OUVERTE : ses textes, et « Seuil minimal de réussite » / « Seuil de maîtrise » sur D et M.
    await verifierLaCopieOuverte(page, idCopie, { D: TEXTE_D, question: QUESTION });

    // 3. CHANGER, DANS LA COPIE, un descripteur et la question, par leurs cases.
    await caseNiveau(page, idCopie, 'D').fill(TEXTE_D_COPIE);
    await caseNiveau(page, idCopie, 'D').press('Tab');
    await expect.poll(async () => (await lire(page)).copie.D).toBe(TEXTE_D_COPIE);
    await caseQuestion(page, idCopie).fill(QUESTION_COPIE);
    await caseQuestion(page, idCopie).press('Tab');
    await expect.poll(async () => (await lire(page)).copie.question).toBe(QUESTION_COPIE);

    // 4. LA SOURCE N'A PAS BOUGÉ, dans IndexedDB comme dans le JSON.
    const avantRechargement = await lire(page);
    expect(avantRechargement.source).toEqual(deLaSource);
    expect(avantRechargement.sourceJson).toEqual(deLaSource);
    expect(avantRechargement.copieJson).toEqual({ ...deLaSource, D: TEXTE_D_COPIE, question: QUESTION_COPIE });
    expect(avantRechargement.partages).toEqual([]);

    // 5. RECHARGÉE : toujours pas ; la copie garde ses textes et ses étiquettes ; la source rouverte montre les siens.
    await page.evaluate(() => db.flush());
    await page.reload();
    await attendreApplication(page);
    const apresRechargement = await lire(page);
    expect(apresRechargement.partages).toEqual([]);
    expect(apresRechargement.source).toEqual(deLaSource);
    expect(apresRechargement.sourceJson).toEqual(deLaSource);
    expect(apresRechargement.copie).toEqual({ ...deLaSource, D: TEXTE_D_COPIE, question: QUESTION_COPIE });
    await verifierLaCopieOuverte(page, idCopie, { D: TEXTE_D_COPIE, question: QUESTION_COPIE });
    await ouvrirGrille(page, GRILLE.id);
    await expect(caseNiveau(page, GRILLE.id, 'D')).toHaveValue(TEXTE_D);
    await expect(caseQuestion(page, GRILLE.id)).toHaveValue(QUESTION);

    expect(erreurs).toEqual([]);
}

for (const vue of [{ nom: 'paysage', width: 1180, height: 820 }, { nom: 'portrait', width: 820, height: 1180 }]) {
    test.describe(`Assemblage · dupliquer une grille décrite, avec « Pour vérifier » et les noms des seuils (${vue.nom}, ${vue.width} × ${vue.height})`, () => {
        test.use({ viewport: { width: vue.width, height: vue.height }, hasTouch: true });

        test('« Dupliquer » de l’éditeur : la copie garde descripteurs, question et étiquettes ; la changer ne change pas la source', async ({ page }) => {
            test.setTimeout(120000);
            await scenario(page, async (p) => {
                await ouvrirGrille(p, GRILLE.id);
                await p.locator('#btnDupliquerGrille').tap();
            });
        });

        test('« Dupliquer » de la bibliothèque : la copie garde descripteurs, question et étiquettes ; la changer ne change pas la source', async ({ page }) => {
            test.setTimeout(120000);
            await scenario(page, async (p) => {
                await p.evaluate(async (id) => { await window.dupliquerGrilleBibliotheque(id); }, GRILLE.id);
            });
        });
    });
}
