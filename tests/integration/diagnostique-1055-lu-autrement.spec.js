import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1055 (15 oct. 2026) — UN DIAGNOSTIC SE LIT AUTREMENT QU'UNE PRODUCTION ORDINAIRE
//
// Grégoire, 15 oct., 14 h 00 : « Si l'enseignant décide qu'une production est un diagnostic, il
// ne faudrait pas que les résultats de ce diagnostic apparaissent dans la compilation des notes
// de l'élève, ou dans les graphiques de complétion, ou dans l'évolution de la progression
// étudiante dans le profil. »
//
// Le banc joue le vrai index.html sur la démonstration. Il marque diagnostique une production
// ÉVALUÉE, puis compare chaque lecture à un ORACLE : la même lecture sur le même trimestre dont
// on a retiré cette production et ses copies. Une lecture qui ne lit que l'ordinaire rend la même
// chose dans les deux cas. Préalable : marquée ou non, la production change bien les lectures
// (sinon le banc ne mesurerait rien).
// Puis : la marque paraît dans Conception › Productions et dans la Liste des évaluations ; et
// « + Nouvelle production » ouverte après la fiche diagnostique donne une case décochée.
// Noms fictifs (démonstration). Contexte neuf à chaque essai. Écrit le 15 oct., non lancé : il
// part au verdict du soir.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
}

/** Lectures d'un élève : note du cours, C, P et C historiques, flèches par critère. */
const LIRE = () => {
    const r = resoudrePratiqueActive();
    const pratique = r && r.etat === 'ok' ? r.pratique : null;
    const eleves = (db.getSync(cle('groupeEtudiants'), []) || []).map(e => e.da);
    const parEleve = {};
    for (const da of eleves) {
        const h = calculerIndicesHistoriques(da, '2099-12-31');
        parEleve[da] = {
            note: pratique ? calculerNoteDuCours(da, pratique) : null,
            C: pratique ? pratique.calculerCompletion(da) : null,
            histC: h.C, histP: h.P,
            fleches: JSON.stringify(calculerDirectionsCriteres(da))
        };
    }
    return parEleve;
};

/** Marque (ou retire) une production, ou la retire du trimestre avec ses copies (l'oracle). */
const POSER = ({ id, mode, sauvegarde }) => {
    if (mode === 'restaurer') {
        db.setSync(cle('productions'), sauvegarde.productions);
        db.setSync(cle('evaluationsSauvegardees'), sauvegarde.evaluations);
        return null;
    }
    const productions = db.getSync(cle('productions'), []) || [];
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
    const copie = { productions: JSON.parse(JSON.stringify(productions)), evaluations: JSON.parse(JSON.stringify(evaluations)) };
    if (mode === 'marquer') {
        db.setSync(cle('productions'), productions.map(p => p.id === id ? Object.assign({}, p, { diagnostique: true }) : p));
    } else if (mode === 'retirer') {
        db.setSync(cle('productions'), productions.filter(p => p.id !== id));
        db.setSync(cle('evaluationsSauvegardees'), evaluations.filter(e => e.productionId !== id));
    }
    return copie;
};

/** Une production évaluée de la démonstration, ni portfolio ni terminale : la candidate. */
const CHOISIR = () => {
    const productions = db.getSync(cle('productions'), []) || [];
    const evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
    const p = productions.find(x => x.type !== 'portfolio' && x.type !== 'terminale'
        && evaluations.filter(e => e.productionId === x.id && e.noteFinale != null).length >= 3);
    return p ? { id: p.id, titre: p.titre } : null;
};

test('marquée diagnostique, une production n\'entre ni dans la note, ni dans C, ni dans l\'historique, ni dans les flèches du profil', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const cible = await page.evaluate(`(${CHOISIR.toString()})()`);
    expect(cible, 'la démonstration doit porter une production évaluée').not.toBeNull();

    const ordinaire = await page.evaluate(`(${LIRE.toString()})()`);

    const sauvegarde = await page.evaluate(`(${POSER.toString()})(${JSON.stringify({ id: cible.id, mode: 'retirer' })})`);
    const oracle = await page.evaluate(`(${LIRE.toString()})()`);
    await page.evaluate(`(${POSER.toString()})(${JSON.stringify({ mode: 'restaurer', sauvegarde })})`);

    // Préalable : la production pèse bien sur au moins une lecture d'au moins un élève.
    expect(JSON.stringify(ordinaire), 'retirer la production doit changer quelque chose, sinon le banc ne mesure rien').not.toBe(JSON.stringify(oracle));

    await page.evaluate(`(${POSER.toString()})(${JSON.stringify({ id: cible.id, mode: 'marquer' })})`);
    const marquee = await page.evaluate(`(${LIRE.toString()})()`);
    for (const da of Object.keys(oracle)) {
        expect.soft(marquee[da], `élève ${da} : la production diagnostique se lit comme si elle n'existait pas`).toEqual(oracle[da]);
    }
});

// ↻ #1147 (24 oct. 2026) : Conception › Productions montre sa sélection dans un menu au nom seul (décision du
// 24 oct. : aucun badge) ; la marque n'y paraît plus, la Liste des évaluations la garde.
test('la marque « Diagnostique » paraît dans la Liste des évaluations ; le menu de la Conception dit le titre seul', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const cible = await page.evaluate(`(${CHOISIR.toString()})()`);
    expect(cible).not.toBeNull();
    await page.evaluate(`(${POSER.toString()})(${JSON.stringify({ id: cible.id, mode: 'marquer' })})`);

    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 1200);
    await expect(page.locator(`#menuProductions option[value="${cible.id}"]`)).toHaveText(cible.titre);
    await expect(page.locator('#conception-productions .marque-diagnostique')).toHaveCount(0);

    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    await pause(page, 1500);
    const marquees = page.locator('#corps-tableau-evaluations .marque-diagnostique');
    expect(await marquees.count(), 'les copies de la production diagnostique portent la marque').toBeGreaterThan(0);
});

test('« + Nouvelle production » ouverte après la fiche diagnostique : la case est décochée', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    const cible = await page.evaluate(`(${CHOISIR.toString()})()`);
    expect(cible).not.toBeNull();
    await page.evaluate(`(${POSER.toString()})(${JSON.stringify({ id: cible.id, mode: 'marquer' })})`);

    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 900);
    await page.evaluate((id) => chargerProductionPourModif(id), cible.id);
    await pause(page, 900);
    // Préalable : la fiche ouverte est bien diagnostique, la case est cochée à l'écran.
    await expect(page.locator('#productionDiagnostique')).toBeChecked();

    await page.locator('button[data-action="creerNouvelleProduction"]:visible').first().click();
    await pause(page, 900);
    await expect(page.locator('#productionDiagnostique')).not.toBeChecked();
});
