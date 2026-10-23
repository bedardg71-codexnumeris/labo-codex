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
//   · ↻ 2b : sans zone visitée, rien ne se pose (avant : à la FIN de la zone du bouton) ;
//   · le témoin négatif : les textes d'une grille existante s'affichent tels
//     quels, et le rendu d'un texte composé au clic est celui d'un texte tapé.
//
// Mode « temp » (nouvelle grille) : c'est le même gabarit que la grille
// enregistrée, sans l'écriture IndexedDB — et `window.tempCriteres` se lit
// directement, ce qui rend la persistance vérifiable sans attendre.
//
// ↻ RÈGLE DU 21 OCT. 2026 (#1131, #1138) : en CRÉATION, QUATRE zones. Depuis #1131 (demande de Grégoire,
// 21 oct., 9 h 15), le gabarit des sous-critères se rend en création, « Quand la copie ne porte aucun code »
// compris : la zone « Aucune annotation » (`aucune`) y est, une fois, dans ce pli. La saisir écrit dans
// `window.tempCriteres[0].enonces.aucune`, sans écriture IndexedDB ; ses repères sont ceux de la modification.
// (Avant : la carte « Bilan », 1.120, la réservait à une grille enregistrée ; trois zones.)

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
// ↻ Étape 2b (22 oct. 2026) : plus de rangée par zone — LA palette du critère vise la zone où est le curseur
// (`cle` ne sert plus qu'à dire, à la lecture du spec, la zone visée).
const repere = (page, cle, jeton) =>
    page.locator(`#listeCriteres .palette-algo [data-action="insererRepereEnonce"][data-jeton="${jeton}"]`);

async function ouvrir(page, enoncesExistants) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // ↻ §8 (5 sept.) : prêt quand la base l'est (comme le spec des paliers), plus un délai fixe.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    const n = await page.evaluate(eval(OUVRIR), enoncesExistants || null);
    // ↻ 21 oct. 2026 (#1131, #1138) : en CRÉATION, quatre zones — « Aucune annotation » y est, une fois, dans
    // le pli « Quand la copie ne porte aucun code » des sous-critères. Sa palette ({critere} seul, jamais
    // {erreurs}) est aussi éprouvée par la sentinelle Vitest `sentinelle-carte-bilan` (B).
    expect(n, 'quatre zones en création, « Aucune annotation » comprise').toBe(4);
    await expect(page.locator('#listeCriteres .sous-critere-pli--aucune textarea[data-enonce-cle="aucune"]')).toHaveCount(1);
    await expect(page.locator('#listeCriteres textarea[data-enonce-cle="aucune"]')).toHaveCount(1);
    // Son pli est replié à l'ouverture, comme les cartes ci-dessous : on le déplie par l'événement DOM.
    const pliAucune = page.locator('#listeCriteres .sous-critere-pli--aucune');
    await expect(pliAucune).toHaveClass(/ferme/);
    await page.evaluate(() => document.querySelector('#listeCriteres .sous-critere-pli--aucune .accordeon-header').click());
    await expect(pliAucune).not.toHaveClass(/ferme/);
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

test('texte troué · chaque zone, visée, active ses repères dans la palette ; en création, « Aucune annotation » aussi (#1131)', async ({ page }) => {
    await ouvrir(page);
    // ↻ Étape 2b (22 oct. 2026) : plus aucune rangée « Poser : » ; la zone visée (le focus) règle la palette.
    await expect(page.locator('#listeCriteres .reperes-enonce')).toHaveCount(0);
    const offerts = [];
    for (const cle of ['decompte', 'priorite', 'concentre', 'aucune']) {
        await caretA(vueDe(page, cle), 0);
        offerts.push(await page.evaluate((c) => {
            const t = document.querySelector(`#listeCriteres textarea[data-enonce-cle="${c}"]`);
            const g = t.closest('.groupe-form');
            const actifs = [...document.querySelectorAll('#listeCriteres .palette-algo .palette-algo-bloc:not([aria-disabled="true"])')];
            return {
                cle: c,
                reperes: actifs.map((b) => b.dataset.jeton),
                noms: actifs.map((b) => b.querySelector('.palette-algo-bloc-nom').textContent.trim()),
                visibles: actifs.every((b) => b.offsetParent !== null),
                cible: document.querySelector('#listeCriteres .palette-algo .palette-algo-cible').textContent.trim(),
                etiquette: g.querySelector('label').textContent.trim(),
                aideApresZone: !!(t.compareDocumentPosition(g.querySelector('small')) & Node.DOCUMENT_POSITION_FOLLOWING)
            };
        }, cle));
    }
    console.log('OFFERTS →', JSON.stringify(offerts));
    const parCle = Object.fromEntries(offerts.map(o => [o.cle, o.reperes]));
    // ↻ Étape 2a (22 oct. 2026) : les deux noms de l'enseignant·e sont offerts au décompte et à « Aucune annotation ».
    // L'ordre est celui de la palette : ce qui s'écrit dans la grille, puis ce qui se remplit à la correction.
    expect(parCle.decompte).toEqual(['{critere}', '{nomErreurs}', '{nomMots}', '{erreurs}', '{mots}', '{points}']);
    // Le bloc montre un nom en mots ; ce qu'il pose garde ses accolades. Ce critère d'avant lit « erreur / mot ».
    expect(offerts.find(o => o.cle === 'decompte').noms).toEqual(['Nom du critère', '« erreurs »', '« mots »', 'Compte des erreurs', 'Compte des mots', 'Somme pondérée']);
    expect(parCle.priorite).toEqual(['{critere}']);
    expect(parCle.concentre).toEqual(['{critere}']);
    expect(parCle.aucune, '« Aucune annotation » en création : les repères de la modification').toEqual(['{critere}', '{nomErreurs}']);
    expect(offerts.every(o => o.visibles), 'les blocs actifs sont à l\'écran').toBe(true);
    expect(offerts.every(o => o.cible === 'Dans : « ' + o.etiquette + ' »'), 'la palette nomme la zone par son étiquette').toBe(true);
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
    // ↻ étape 2a (22 oct. 2026) : les deux noms deviennent des jetons ; la structure du 2 sept. ne change pas.
    const defaut = 'Ta production contient {erreurs} {nomErreurs}{points} pour {mots} {nomMots}.';
    await expect(z).toHaveValue(defaut);

    await caretA(vueDe(page, 'decompte'), 'Ta production contient'.length);
    await repere(page, 'decompte', '{mots}').click();

    const r = await page.evaluate(() => {
        const t = document.querySelector('#listeCriteres textarea[data-enonce-cle="decompte"]');
        return {
            valeur: t.value,
            rendu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'decompte', { erreurs: 3, mots: 500 }),
            noms: window.enoncesAlgo.noms(window.tempCriteres[0])
        };
    });
    console.log('MILIEU →', JSON.stringify(r));
    expect(r.valeur).toBe('Ta production contient {mots} {erreurs} {nomErreurs}{points} pour {mots} {nomMots}.');
    expect(r.rendu).toBe(`Ta production contient 500 3 ${r.noms.erreurs.pluriel} pour 500 ${r.noms.mots.pluriel}.`);
});

test('texte troué · « Aucune annotation » en création : la saisir écrit sur le critère, sans écriture en base', async ({ page }) => {
    await ouvrir(page);
    // Toute écriture du stockage, comptée pendant la saisie (db.js : setSync, set, modifier).
    await page.evaluate(() => {
        window.__ecritures = [];
        for (const nom of ['setSync', 'set', 'modifier']) {
            const avant = db[nom].bind(db);
            db[nom] = (cle, ...reste) => { window.__ecritures.push(nom + ' ' + cle); return avant(cle, ...reste); };
        }
    });
    const defaut = await zone(page, 'aucune').inputValue();
    expect(defaut, 'la zone porte son texte de départ').not.toBe('');
    await caretA(vueDe(page, 'aucune'), 0);
    await page.keyboard.type('Rien à cibler sur ');
    await repere(page, 'aucune', '{critere}').click();
    const r = await page.evaluate(() => ({
        valeur: document.querySelector('#listeCriteres textarea[data-enonce-cle="aucune"]').value,
        enregistre: (window.tempCriteres[0].enonces || {}).aucune,
        ecritures: window.__ecritures.filter((e) => /grille/i.test(e))
    }));
    console.log('AUCUNE →', JSON.stringify(r));
    expect(r.enregistre, 'la valeur est sur le critère en création').toBe(r.valeur);
    expect(r.valeur, 'la frappe et le repère, au curseur, devant le texte de départ').toBe('Rien à cibler sur {critere} ' + defaut);
    expect(r.ecritures, 'aucune écriture des grilles avant « Créer la grille »').toEqual([]);
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

test('texte troué · sans zone visitée depuis le rendu, un bloc ne pose rien, et la palette invite à placer le curseur', async ({ page }) => {
    // ↻ Étape 2b (22 oct. 2026) : avant, le repère allait à la fin de SA zone ; la palette sert toutes les
    // zones, et sans cible elle ne devine pas laquelle.
    await ouvrir(page);
    await expect(page.locator('#listeCriteres .palette-algo .palette-algo-cible')).toHaveText('Place le curseur dans un texte : un bloc touché s\'y pose, là où est le curseur.');
    await expect(page.locator('#listeCriteres .palette-algo .palette-algo-bloc:not([aria-disabled="true"])')).toHaveCount(0);
    // `force` : Playwright ne clique pas un élément `aria-disabled` ; un doigt, si — c'est ce qu'on éprouve.
    await repere(page, 'concentre', '{critere}').click({ force: true });
    const v = await zone(page, 'concentre').inputValue();
    console.log('SANS CIBLE →', JSON.stringify(v));
    expect(v).toBe('Concentre-toi sur {critere}');
    expect(await page.evaluate(() => (window.tempCriteres[0].enonces || {}).concentre)).toBeUndefined();
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
            aucune: v('aucune'),
            rendu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'decompte', { erreurs: 2, mots: 300 }),
            tu: window.enoncesAlgo.enonce(window.tempCriteres[0], 'aucune', {}),
            enonces: window.tempCriteres[0].enonces
        };
    });
    console.log('EXISTANTS →', JSON.stringify(lus));
    expect(lus.decompte).toBe(existants.decompte);
    expect(lus.priorite).toBe(existants.priorite);
    // ↻ 21 oct. 2026 (#1131) : en création, la zone est rendue ; vidée, elle se montre vide.
    expect(lus.aucuneRendue, 'en création, la zone « Aucune annotation » est rendue').toBe(true);
    expect(lus.aucune, 'la zone vidée se montre vide, sans défaut remis').toBe('');
    // La zone restée au défaut montre le défaut du modèle générique (le nom ne dit pas « français »).
    expect(lus.concentre).toBe('Concentre-toi sur {critere}');
    expect(lus.rendu).toBe('Mon décompte à moi : 2 sur 300.');
    expect(lus.tu, 'une zone vidée reste muette').toBe('');
    // ⚠ Le rendu du gabarit N'ÉCRIT RIEN : les données sont celles d'avant, à l'octet.
    expect(lus.enonces).toEqual(existants);
});
