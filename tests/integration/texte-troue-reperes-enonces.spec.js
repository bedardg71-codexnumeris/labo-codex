import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Le texte troué, ÉTAPE 1 — les repères posables des quatre énoncés
// (3 septembre 2026), éprouvés dans un vrai WebKit, contre le vrai index.html.
//
// Ce que la sentinelle Vitest ne peut pas voir, et que ce spec mesure :
//   · le CLIC : un vrai pointeur sur un vrai bouton, et le repère qui arrive
//     dans la zone, au curseur ;
//   · le piège du focus : après une FRAPPE, le clic sur un repère ne doit pas
//     d'abord faire sortir la zone (son `change` re-rend tout le gabarit, et
//     le bouton sous le doigt disparaît avant que le clic arrive). Le premier
//     lot a été conçu contre ça ; c'est ici que ça se prouve ;
//   · une zone jamais visitée reçoit le repère à la FIN, pas en tête ;
//   · le témoin négatif : les textes d'une grille existante s'affichent tels
//     quels, et le rendu d'un texte composé au clic est celui d'un texte tapé.
//
// Mode « temp » (nouvelle grille) : c'est le même gabarit que la grille
// enregistrée, sans l'écriture IndexedDB — et `window.tempCriteres` se lit
// directement, ce qui rend la persistance vérifiable sans attendre.

const OUVRIR = `async (enoncesExistants) => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
    // ↻ Lot E1 (27 sept. 2026) : creerNouvelleGrille est asynchrone ; sans l'attendre, sa fin
    // efface les critères posés ci-dessous.
    await window.creerNouvelleGrille();
    // security-ok: fixture littérale du spec, aucune source externe.
    const critere = { id: 'CR_T', nom: 'Précision des calculs', ponderation: 20, type: 'algorithmique' };
    if (enoncesExistants) critere.enonces = enoncesExistants;
    window.tempCriteres = [critere];
    window.afficherCriteresTemp();
    return document.querySelectorAll('#listeCriteres textarea[data-enonce-cle]').length;
}`;

const zone = (page, cle) => page.locator(`#listeCriteres textarea[data-enonce-cle="${cle}"]`);
// ↻ Étape 3 (5 sept. 2026) : la zone que l'œil voit est la VUE du composeur, posée après le textarea
// (caché, il reste la valeur). Le focus et le caret se posent dans la vue ; la valeur se lit au textarea.
const vueDe = (page, cle) => zone(page, cle).locator('xpath=following-sibling::*[1]');
const caretA = (locator, position) => locator.evaluate((el, p) => { el.focus(); window.composeurBadges.placerCaret(el, p); }, position);
/** Ce que la zone rend de son état : la valeur, le focus (dans sa vue), le caret en positions de texte. */
const etatZone = (page, cle) => page.evaluate((c) => {
    const t = document.querySelector(`#listeCriteres textarea[data-enonce-cle="${c}"]`);
    const vue = window.composeurBadges.vueDe(t);
    const curseur = vue ? window.composeurBadges.curseur(vue) : null;
    return { valeur: t.value, focalisee: !!vue && document.activeElement === vue, curseur: curseur ? curseur.debut : t.selectionStart };
}, cle);
const repere = (page, cle, jeton) =>
    page.locator(`#listeCriteres .groupe-form:has(textarea[data-enonce-cle="${cle}"]) [data-action="insererRepereEnonce"][data-jeton="${jeton}"]`);

async function ouvrir(page, enoncesExistants) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // ↻ §8 (5 sept.) : prêt quand la base l'est (comme le spec des paliers), plus un délai fixe.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    const n = await page.evaluate(eval(OUVRIR), enoncesExistants || null);
    // ↻ La carte « Bilan » (5 sept. 2026, 1.120) : en CRÉATION, trois zones — « Aucune annotation » vit
    // sous la case des codes, dans la liste des sous-critères d'une grille ENREGISTRÉE (réserve nommée
    // au cadrage). Son rendu et sa palette ({critere} seul, jamais {erreurs}) sont éprouvés par la
    // sentinelle Vitest `sentinelle-carte-bilan` (B) et, au registre, par `…-etape-1-reperes` (B.b).
    expect(n, 'trois zones en création : « Aucune annotation » n\'y est pas').toBe(3);
    // Lot 4 (4 sept. 2026) : les zones vivent dans des cartes repliées à l'ouverture — un pointeur
    // ne les atteint pas plus qu'une main. ↻ §8 (5 sept., décision de Grégoire) : le DÉCOMPTE se
    // compose dans « Ce que l'élève lit » (la carte de projection), avant les paliers ; les deux du
    // bilan sont dans « Bilan » (↻ 1.120). On déplie les deux par l'événement DOM (le dispatcher de
    // main.js) ; les redessins qui suivent chaque frappe les gardent dépliées (spec lot4-gabarit-algo-cartes).
    for (const section of ['commentaire', 'projection']) {
        const carte = page.locator(`#listeCriteres .gabarit-algo-carte[data-pli$=":${section}"]`);
        await expect(carte).toHaveClass(/ferme/);
        await page.evaluate((s) => document.querySelector(`#listeCriteres .gabarit-algo-carte[data-pli$=":${s}"] .accordeon-header`).click(), section);
        await expect(carte).not.toHaveClass(/ferme/);
    }
    // §8 : le décompte est dans la carte de projection, une fois, et nulle part ailleurs.
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli$=":projection"] textarea[data-enonce-cle="decompte"]')).toHaveCount(1);
    await expect(page.locator('#listeCriteres .gabarit-algo-carte[data-pli$=":commentaire"] textarea[data-enonce-cle]')).toHaveCount(2);
    await expect(page.locator('#listeCriteres textarea[data-enonce-cle="decompte"]')).toHaveCount(1);
}

test('texte troué · chaque zone offre ses repères ; en création, « Aucune annotation » n\'est pas rendue', async ({ page }) => {
    await ouvrir(page);
    const offerts = await page.evaluate(() =>
        [...document.querySelectorAll('#listeCriteres .groupe-form:has(textarea[data-enonce-cle])')].map(g => ({
            cle: g.querySelector('textarea').dataset.enonceCle,
            reperes: [...g.querySelectorAll('[data-action="insererRepereEnonce"]')].map(b => b.dataset.jeton),
            textes: [...g.querySelectorAll('[data-action="insererRepereEnonce"]')].map(b => b.textContent.trim()),
            visibles: [...g.querySelectorAll('[data-action="insererRepereEnonce"]')].every(b => b.offsetParent !== null),
            // La palette AVANT l'établi (Grégoire, 3 sept. après-midi) : la rangée
            // précède la zone, et l'aide suit la zone — c'est le champ qu'elle décrit.
            rangeeAvantZone: !!(g.querySelector('.reperes-enonce').compareDocumentPosition(g.querySelector('textarea')) & Node.DOCUMENT_POSITION_FOLLOWING),
            aideApresZone: !!(g.querySelector('textarea').compareDocumentPosition(g.querySelector('small')) & Node.DOCUMENT_POSITION_FOLLOWING)
        })));
    console.log('OFFERTS →', JSON.stringify(offerts));
    const parCle = Object.fromEntries(offerts.map(o => [o.cle, o.reperes]));
    expect(parCle.decompte).toEqual(['{critere}', '{erreurs}', '{mots}', '{points}']);
    // Le badge montre le mot sans accolades ; ce qu'il pose les garde.
    expect(offerts.find(o => o.cle === 'decompte').textes).toEqual(['critere', 'erreurs', 'mots', 'points']);
    expect(parCle.priorite).toEqual(['{critere}']);
    expect(parCle.concentre).toEqual(['{critere}']);
    expect(parCle.aucune, '« Aucune annotation » n\'est pas dans la création (carte « Bilan », 1.120)').toBeUndefined();
    expect(offerts.every(o => o.visibles), 'les repères sont à l\'écran').toBe(true);
    expect(offerts.every(o => o.rangeeAvantZone), 'la rangée « Poser » précède la zone').toBe(true);
    expect(offerts.every(o => o.aideApresZone), 'l\'aide reste attachée au champ, sous lui').toBe(true);
    expect(offerts.flatMap(o => o.reperes)).not.toContain('{s}');
});

test('texte troué · après une FRAPPE, un clic pose le repère au curseur — rien ne se perd', async ({ page }) => {
    await ouvrir(page);
    const z = zone(page, 'priorite');
    await expect(z).toHaveValue('{critere} est à travailler en priorité');

    await caretA(vueDe(page, 'priorite'), '{critere} est à travailler en priorité'.length);
    await page.keyboard.type(' (dès maintenant)');
    // ⚠ Le clic qui compte : la zone est focalisée ET modifiée. Si le bouton
    // prend le focus, `change` part, le gabarit se re-rend, et le clic tombe
    // dans le vide — le repère n'arrive jamais.
    await repere(page, 'priorite', '{critere}').click();

    const apres = Object.assign(await etatZone(page, 'priorite'), await page.evaluate(() => ({ enregistre: (window.tempCriteres[0].enonces || {}).priorite })));
    console.log('APRÈS FRAPPE + CLIC →', JSON.stringify(apres));
    expect(apres.valeur).toBe('{critere} est à travailler en priorité (dès maintenant) {critere}');
    expect(apres.enregistre, 'la valeur est écrite sur le critère sans attendre la sortie de la zone').toBe(apres.valeur);
    expect(apres.focalisee, 'la zone garde le focus : on continue d\'écrire').toBe(true);
    expect(apres.curseur, 'le curseur est après le repère').toBe(apres.valeur.length);
});

test('texte troué · au milieu d\'une phrase, le repère prend ses espaces, et se rend comme un jeton tapé', async ({ page }) => {
    await ouvrir(page);
    const z = zone(page, 'decompte');
    const defaut = 'Ta production contient {erreurs} erreur{s}{points} pour {mots} mots.';
    await expect(z).toHaveValue(defaut);

    await caretA(vueDe(page, 'decompte'), 'Ta production contient'.length);
    await repere(page, 'decompte', '{mots}').click();

    const r = await page.evaluate(() => {
        const t = document.querySelector('#listeCriteres textarea[data-enonce-cle="decompte"]');
        return {
            valeur: t.value,
            rendu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'decompte', { erreurs: 3, mots: 500 })
        };
    });
    console.log('MILIEU →', JSON.stringify(r));
    expect(r.valeur).toBe('Ta production contient {mots} {erreurs} erreur{s}{points} pour {mots} mots.');
    expect(r.rendu).toBe('Ta production contient 500 3 erreurs pour 500 mots.');
});

test('texte troué · un curseur au milieu d\'un mot : le repère se pose à la frontière, jamais dans le mot (essai iPad)', async ({ page }) => {
    await ouvrir(page);
    const z = zone(page, 'concentre');
    await expect(z).toHaveValue('Concentre-toi sur {critere}');
    // « Concentre-toi sur {critere} » : curseur dans « Concen|tre-toi » (6 lettres avant, 7 après le tiret compris).
    await caretA(vueDe(page, 'concentre'), 6);
    await repere(page, 'concentre', '{critere}').click();
    const v = await z.inputValue();
    console.log('MILIEU DE MOT →', JSON.stringify(v));
    expect(v).toBe('{critere} Concentre-toi sur {critere}');
});

test('texte troué · une zone jamais visitée reçoit le repère à la fin, pas en tête', async ({ page }) => {
    await ouvrir(page);
    await repere(page, 'concentre', '{critere}').click();
    const v = await zone(page, 'concentre').inputValue();
    console.log('JAMAIS VISITÉE →', JSON.stringify(v));
    expect(v).toBe('Concentre-toi sur {critere} {critere}');
});

test('texte troué · TÉMOIN NÉGATIF — une grille existante affiche ses textes tels quels', async ({ page }) => {
    // Des textes rédigés avant ce lot, avec et sans jetons, et une zone VIDÉE.
    const existants = {
        decompte: 'Mon décompte à moi : {erreurs} sur {mots}.',
        priorite: 'le calcul d\'abord',
        aucune: ''
    };
    await ouvrir(page, existants);
    const lus = await page.evaluate(() => {
        const v = (cle) => document.querySelector(`#listeCriteres textarea[data-enonce-cle="${cle}"]`).value;
        return {
            decompte: v('decompte'), priorite: v('priorite'), concentre: v('concentre'),
            aucuneRendue: !!document.querySelector('#listeCriteres textarea[data-enonce-cle="aucune"]'),
            rendu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'decompte', { erreurs: 2, mots: 300 }),
            tu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'aucune', {}),
            enonces: window.tempCriteres[0].enonces
        };
    });
    console.log('EXISTANTS →', JSON.stringify(lus));
    expect(lus.decompte).toBe(existants.decompte);
    expect(lus.priorite).toBe(existants.priorite);
    expect(lus.aucuneRendue, 'en création, la zone « Aucune annotation » n\'est pas rendue ; sa valeur vide reste dans les données').toBe(false);
    // La zone restée au défaut montre le défaut du modèle générique (le nom ne dit pas « français »).
    expect(lus.concentre).toBe('Concentre-toi sur {critere}');
    expect(lus.rendu).toBe('Mon décompte à moi : 2 sur 300.');
    expect(lus.tu, 'une zone vidée reste muette').toBe('');
    // ⚠ Le rendu du gabarit N'ÉCRIT RIEN : les données sont celles d'avant, à l'octet.
    expect(lus.enonces).toEqual(existants);
});
