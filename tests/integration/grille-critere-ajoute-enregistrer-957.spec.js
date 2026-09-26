import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #957 (26 sept. 2026) — « ENREGISTRER » NE RÉÉCRIT PLUS UNE COPIE PÉRIMÉE PAR-DESSUS LA BASE.
//
// CE QUI SE PASSAIT (inventaire de l'enregistrement du 26 sept., § 2, mesuré au banc) :
// Conception › Grilles, une grille de 5 critères, « + Ajouter un critère » → 6 en base ;
// « Enregistrer » → « Grille "…" sauvegardée ! » et 5 en base. Le critère ajouté était
// perdu, en silence. Cause : l'ajout écrit en base sans toucher `grilleTemplateActuelle`,
// et le bouton réécrivait cet objet mémoire, entier, par-dessus.
//
// Ce banc joue les VRAIS boutons du vrai index.html (clics sur `data-action`), depuis la
// démonstration, et lit la BASE (`cle('grillesTemplates')`), pas l'écran. Un cas témoin
// prouve que le bouton écrit encore ce que le formulaire possède (le nom). Deux cas
// « écrivain inconnu » écrivent directement en base, puis enregistrent : c'est la
// garantie du principe (l'écriture part de la base), pas seulement des chemins connus.
//
// ⚠ Stockage propre à chaque essai : un contexte Playwright neuf par test.

const pause = (page, ms) => page.waitForTimeout(ms);

function brancher(page) {
    const ecran = [];
    page.on('dialog', async (d) => { ecran.push(d.type() + ': ' + d.message()); await d.accept(); });
    return ecran;
}

async function ouvrirDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => { window.__toasts = [];
        new MutationObserver((ms) => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.innerText.replace(/\s+/g, ' ').trim());
        }))).observe(document.body, { childList: true });
    });
}

const lireGrille = (page, id) => page.evaluate((id) =>
    JSON.parse(JSON.stringify((db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id === id) || null)), id);

async function ouvrirGrille(page, choisir) {
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    const id = await page.evaluate(choisir);
    expect(id, 'aucune grille de démonstration ne convient').toBeTruthy();
    await page.evaluate((id) => chargerGrillePourModif(id), id);
    await pause(page, 900);
    return id;
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'bouton introuvable : ' + selecteur).toBe(1);
    await pause(page, 900);
}

const ENREGISTRER = '[data-action="sauvegarderGrilleComplete"]';
const premiereGrille = () => (db.getSync(cle('grillesTemplates'), []) || []).find(g => (g.criteres || []).length >= 2)?.id;
const grilleAvecSousCriteres = () => {
    for (const g of db.getSync(cle('grillesTemplates'), []) || []) {
        const i = (g.criteres || []).findIndex(c => c.type === 'algorithmique' && (c.sousCriteres || []).length >= 2);
        if (i !== -1) { window.__idx = i; return g.id; }
    }
    return null;
};

test('#957 — critère : « + Ajouter un critère » puis « Enregistrer » garde le critère en base', async ({ page }) => {
    test.setTimeout(90000);
    brancher(page);
    await ouvrirDemo(page);
    const id = await ouvrirGrille(page, premiereGrille);
    const avant = (await lireGrille(page, id)).criteres.length;

    await cliquer(page, `[data-action="ajouterCritereGrille"][data-param="${id}"]`);
    expect((await lireGrille(page, id)).criteres.length, 'l\'ajout écrit en base').toBe(avant + 1);

    await cliquer(page, ENREGISTRER);
    const apres = await lireGrille(page, id);
    expect(apres.criteres.length, 'LE CAS DU 26 SEPT. : « Enregistrer » effaçait le critère ajouté (5 → 6 → 5)').toBe(avant + 1);
    expect(apres.criteres.at(-1).nom).toBe('Nouveau critère');
    expect(await page.evaluate(() => window.__toasts)).toContainEqual(expect.stringMatching(/sauvegardée !/));
});

test('#957 — sous-critères : ajouter, modifier, supprimer, puis « Enregistrer » — rien n\'est défait', async ({ page }) => {
    test.setTimeout(120000);
    brancher(page);
    await ouvrirDemo(page);
    const id = await ouvrirGrille(page, grilleAvecSousCriteres);
    const idx = await page.evaluate(() => window.__idx);
    const nbSc = async () => (await lireGrille(page, id)).criteres[idx].sousCriteres.length;
    const n0 = await nbSc();

    // Ajouter
    await cliquer(page, `[data-action="ajouterSousCritere"][data-param="${id}"][data-param2="${idx}"]`);
    expect(await nbSc()).toBe(n0 + 1);
    await cliquer(page, ENREGISTRER);
    expect(await nbSc(), 'ajout d\'un sous-critère défait par « Enregistrer »').toBe(n0 + 1);

    // Modifier (le vrai champ, au change)
    await page.evaluate(({ id, idx }) => {
        const el = document.querySelector(`[data-on-change="modifierSousCritereHandler"][data-grille-id="${id}"][data-critere-index="${idx}"][data-sc-index="0"][data-champ="nom"]`);
        el.value = 'Nom fictif du banc 957'; el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { id, idx });
    await pause(page, 700);
    expect((await lireGrille(page, id)).criteres[idx].sousCriteres[0].nom).toBe('Nom fictif du banc 957');
    await cliquer(page, ENREGISTRER);
    expect((await lireGrille(page, id)).criteres[idx].sousCriteres[0].nom, 'modification d\'un sous-critère défaite par « Enregistrer »').toBe('Nom fictif du banc 957');

    // Supprimer (confirmation acceptée)
    const avantSupp = await nbSc();
    await cliquer(page, `[data-action="supprimerSousCritere"][data-param="${id}"][data-param2="${idx}"][data-param3="0"]`);
    expect(await nbSc()).toBe(avantSupp - 1);
    await cliquer(page, ENREGISTRER);
    expect(await nbSc(), 'suppression d\'un sous-critère défaite par « Enregistrer »').toBe(avantSupp - 1);
});

test('#957 — sous-critères par défaut (0-10), puis « Enregistrer » : les onze restent', async ({ page }) => {
    test.setTimeout(90000);
    brancher(page);
    await ouvrirDemo(page);
    const id = await ouvrirGrille(page, premiereGrille);
    await cliquer(page, `[data-action="ajouterCritereGrille"][data-param="${id}"]`);
    const idx = (await lireGrille(page, id)).criteres.length - 1;
    // Mise en place : le critère neuf devient algorithmique (écriture partielle qui, elle,
    // resynchronisait déjà l'objet mémoire). Le geste sous examen est le bouton qui suit.
    await page.evaluate(({ id, idx }) => modifierCritereGrille(id, idx, 'type', 'algorithmique'), { id, idx });
    await page.evaluate((id) => chargerGrillePourModif(id), id);
    await pause(page, 900);
    await cliquer(page, `[data-action="initialiserSousCriteresParDefaut"][data-param="${id}"][data-param2="${idx}"]`);
    expect((await lireGrille(page, id)).criteres[idx].sousCriteres.length).toBe(11);
    await cliquer(page, ENREGISTRER);
    expect((await lireGrille(page, id)).criteres[idx].sousCriteres.length, 'sous-critères par défaut défaits par « Enregistrer »').toBe(11);
});

test('#957 — témoin : « Enregistrer » écrit encore le nom tapé dans le formulaire', async ({ page }) => {
    test.setTimeout(90000);
    brancher(page);
    await ouvrirDemo(page);
    const id = await ouvrirGrille(page, premiereGrille);
    // Valeur posée SANS `change` : c'est le bouton, et lui seul, qui doit l'écrire.
    await page.evaluate(() => { document.getElementById('nomGrilleTemplate').value = 'Grille fictive banc 957'; });
    expect((await lireGrille(page, id)).nom).not.toBe('Grille fictive banc 957');
    await cliquer(page, ENREGISTRER);
    expect((await lireGrille(page, id)).nom).toBe('Grille fictive banc 957');
});

test('#957 — un geste qui passait par l\'objet mémoire (type de la grille) ne défait plus un ajout', async ({ page }) => {
    test.setTimeout(90000);
    brancher(page);
    await ouvrirDemo(page);
    const id = await ouvrirGrille(page, premiereGrille);
    const avant = (await lireGrille(page, id)).criteres.length;
    await cliquer(page, `[data-action="ajouterCritereGrille"][data-param="${id}"]`);
    const nouveauType = await page.evaluate(() => {
        const s = document.getElementById('typeGrille');
        const opt = [...s.options].find(o => o.value && o.value !== s.value);
        s.value = opt.value; s.dispatchEvent(new Event('change', { bubbles: true }));
        return opt.value;
    });
    await pause(page, 900);
    const apres = await lireGrille(page, id);
    expect(apres.type).toBe(nouveauType);
    expect(apres.criteres.length, 'changer le type de la grille réécrivait l\'objet mémoire périmé').toBe(avant + 1);
});

test('#957 — le principe : une écriture inconnue en base survit à « Enregistrer » (grille et échelle)', async ({ page }) => {
    test.setTimeout(120000);
    brancher(page);
    await ouvrirDemo(page);

    // Grille
    const id = await ouvrirGrille(page, premiereGrille);
    await page.evaluate((id) => db.modifier(cle('grillesTemplates'), (l) => {
        const g = l.find(x => x.id === id); g.champEcritAilleurs957 = 'présent'; return l;
    }, []), id);
    await pause(page, 300);
    await cliquer(page, ENREGISTRER);
    expect((await lireGrille(page, id)).champEcritAilleurs957, 'grille : la copie mémoire écrasait une écriture faite ailleurs').toBe('présent');

    // Échelle
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    const eid = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || [])[0]?.id);
    expect(eid).toBeTruthy();
    await page.evaluate((eid) => chargerEchellePourModif(eid), eid);
    await pause(page, 900);
    await page.evaluate((eid) => db.modifier(cle('echellesTemplates'), (l) => {
        const e = l.find(x => x.id === eid); e.champEcritAilleurs957 = 'présent'; return l;
    }, []), eid);
    await page.evaluate(() => { document.getElementById('nomEchelleTemplate').value = 'Échelle fictive banc 957'; });
    await pause(page, 300);
    await cliquer(page, '[data-action="sauvegarderEchelleComplete"]');
    const e = await page.evaluate((eid) => JSON.parse(JSON.stringify((db.getSync(cle('echellesTemplates'), []) || []).find(x => x.id === eid))), eid);
    expect(e.champEcritAilleurs957, 'échelle : la copie mémoire écrasait une écriture faite ailleurs').toBe('présent');
    expect(e.nom, 'échelle : le nom tapé est écrit par le bouton').toBe('Échelle fictive banc 957');
});
