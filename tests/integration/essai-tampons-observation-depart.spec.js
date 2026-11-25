import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { attendreApplication } from './harness/attendre-application.js';
import { indexHtml } from './harness/classe-de-banc.js';
import { DOSSIER_DES_DEPARTS } from '../departs-de-parcours/departs.js';
import { FICHIER_ESSAI, NOM_ESSAI, PRATIQUE, CIBLES, CAT_OBSERVATION, CAT_AUTRE, TAMPONS, PRODUCTIONS } from '../departs-de-parcours/essai-tampons-observation.js';

// =======================================================================
// ⚠ ESSAI SEULEMENT — LE FICHIER D'ESSAI DES TAMPONS D'OBSERVATION (ÉTAPE 3) S'OUVRE, ET L'ESSAI SE JOUE À PARTIR DE LUI
// (25 nov. 2026, consigne de Cowork de 9 h 45)
// =======================================================================
// À RETIRER AVANT LA FUSION, avec le fichier, sa fabrique (tests/departs-de-parcours/essai-tampons-observation.spec.js)
// et sa section de departs.html (rapport du lot 3, § 9 et § 10).
//
// Ce banc lit le fichier COMMIS dans departs/ (DEPARTS_DOSSIER pour un autre dossier) : c'est ce que Grégoire télécharge.
// Tout y passe par les gestes de l'écran (onglets, boutons, menus, la palette, un vrai clic sur la production) ; la base
// n'est lue que pour vérifier. Deux essais :
//   1. LA PREUVE de la consigne : un espace vide ; « Codex », « Ouvrir un codex… », le fichier, « Recharger » (le geste de
//      l'iPad) ; le groupe par cibles ; le bloc « Cibles que cette production renseigne » coché comme prévu sur chacune
//      des trois productions ; une production en Annoter ; un tampon d'observation posé ; le profil, « Sur ses
//      productions » ; « Inscrire pour une production » sur la production à deux cibles : deux blocs.
//   2. LE PARCOURS de l'essai (§ 9 du rapport), dans son ordre : les libellés marqués (VU) au rapport sont ceux que cet
//      essai lit à l'écran. ESSAI_CAPTURES=<dossier> : une capture par groupe de gestes.
// Chromium suffit ici : le banc éprouve que le FICHIER porte ses pièces et que l'essai se joue à partir de lui ; le
// comportement de l'étape 3 est jugé, lui, par son banc (WebKit et Chromium, 18 essais).
// Break-tests (25 nov.) : journal au rapport, § 10.

const CAPTURES = process.env.ESSAI_CAPTURES || '';
const capture = async (page, nom) => {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
};
const fermerLeRappel = (page) => page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
const [T1, T2, T3, T_AUTRE] = TAMPONS;
const [CIBLE_A, CIBLE_B] = CIBLES;
const prod = (cle) => PRODUCTIONS.find((p) => p.cle === cle);

/** Les onglets, par leur toucher. */
async function aller(page, onglet, sousOnglet) {
    await fermerLeRappel(page);
    await page.locator(`[data-onglet="${onglet}"]`).first().click();
    await page.locator(`#sous-navigation [data-sous-onglet="${sousOnglet}"]`).click();
    await expect(page.locator(`#${sousOnglet}.sous-section.active`)).toHaveCount(1);
}

/** Un espace vide, puis « Codex », « Ouvrir un codex… », le fichier, « Recharger ». */
async function ouvrirLeFichier(page) {
    const fichier = path.join(DOSSIER_DES_DEPARTS, FICHIER_ESSAI);
    expect(fs.existsSync(fichier), `${FICHIER_ESSAI} est dans ${DOSSIER_DES_DEPARTS}`).toBe(true);
    page.on('dialog', (x) => x.accept().catch(() => {}));
    page.setDefaultTimeout(20000);
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await attendreApplication(page);
    expect(await page.evaluate(() => ({
        trimestres: (window.enumererTrimestres ? window.enumererTrimestres() : []).filter((x) => x && x.id !== 'demo').length,
        codexActif: Codex.etat().actif === true
    })), 'témoin : un espace vide').toEqual({ trimestres: 0, codexActif: false });

    await page.evaluate(() => { delete window.showOpenFilePicker; });   // l'iPad n'a pas ce sélecteur : le champ de fichier
    await page.click('#btn-codex');
    const ouvrir = page.locator('#codex-menu [data-action="Codex.actionOuvrir"]:visible');
    await expect(ouvrir).toHaveText(/Ouvrir un codex…|Ouvrir un codex\.\.\./);
    const choix = page.waitForEvent('filechooser');
    await ouvrir.click();
    await (await choix).setFiles(fichier);
    const dialogue = page.locator('#overlay-ui-dialogue');
    const recharger = dialogue.getByRole('button', { name: 'Recharger', exact: true });
    await expect(recharger, 'l’ouverture propose de recharger').toBeVisible({ timeout: 30000 });
    await expect(dialogue).toContainText('Recharger la page pour appliquer les données ?');
    await capture(page, '01-recharger');
    await Promise.all([page.waitForEvent('load'), recharger.click()]);
    await attendreApplication(page);
    expect(await page.evaluate(() => ({ actif: Codex.etat().actif, nom: Codex.etat().nom }))).toEqual({ actif: true, nom: NOM_ESSAI });
    // Ni bande « Mode démonstration », ni jalon, ni rappel : rien ne couvre l'essai.
    await expect(page.locator('#bandeau-demo'), 'aucune bande « Mode démonstration »').toBeHidden();
    expect(await page.evaluate(() => db.getSync('demo-actif', null))).toBeNull();
    // Le groupe est affiché, dans la barre du haut.
    await expect(page.locator('body')).toContainText('601-101-MQ · gr. 00001');
    await capture(page, '02-ouvert');
}

/** Ce que le fichier a mis en base, lu une fois pour désigner les lignes (les ids naissent à la fabrique). */
const reperes = (page) => page.evaluate(() => ({
    eleves: db.getSync(cle('groupeEtudiants'), []).map((e) => ({ da: String(e.da), nom: e.nom, prenom: e.prenom })),
    productions: db.getSync(cle('productions'), []).map((p) => ({ id: p.id, titre: p.titre })),
    fichiers: db.getSync(cle('fichiersTravaux'), []).map((f) => ({ id: f.id, da: String(f.etudiantDA), productionId: f.productionId }))
}));
const poses = (page) => page.evaluate(() => db.getSync(cle('annotationsTravaux'), [])
    .map((a) => ({ fichierId: a.fichierId, tampons: Object.values(a.pages || {}).flatMap((p) => p.stickers || []).map((s) => s.autocollantId) }))
    .filter((a) => a.tampons.length > 0));
const inscriptions = (page) => page.evaluate(() => db.getSync(cle('inscriptionsCibles'), []));

/**
 * Évaluation › Annoter. La première fois, l'onglet montre la liste des productions importées : la ligne de la personne et
 * de la production, son bouton « Annoter ». Ensuite, il rouvre la dernière production annotée : le menu des productions,
 * en haut, puis le nom de la personne.
 */
async function ouvrirEnAnnoter(page, r, eleve, production) {
    await aller(page, 'evaluations', 'evaluations-annoter');
    const p = r.productions.find((x) => x.titre === production.titre);
    const f = r.fichiers.find((x) => x.da === eleve.da && x.productionId === p.id);
    expect(f, `une image importée pour ${eleve.nom}, « ${production.titre} »`).toBeTruthy();
    const bouton = page.locator(`#evaluations-annoter button[data-action="travauxUI.ouvrirFichier"][data-param="${f.id}"]`);
    const menu = page.locator('#evaluations-annoter select.travaux-filtre-production');
    await expect(bouton.or(menu).first()).toBeVisible();
    if (await bouton.isVisible()) {
        await expect(bouton).toHaveText('Annoter');
        await bouton.click();
    } else {
        await menu.selectOption(p.id);
        const nom = page.locator(`#evaluations-annoter .annot-badge[data-fichier-id="${f.id}"]`);
        await expect(nom).toContainText(eleve.nom + ', ' + eleve.prenom);
        await nom.click();
    }
    await expect(page.locator(`#evaluations-annoter .annot-badge.actif[data-fichier-id="${f.id}"]`), 'la production ouverte est celle-là').toHaveCount(1);
    await expect(page.locator('#evaluations-annoter select.travaux-filtre-production option:checked')).toContainText(production.titre);
    await expect.poll(() => page.evaluate(() => (document.getElementById('travaux-canvas-annotation') || {}).width || 0)).toBeGreaterThan(100);
    // L'image fictive est vraiment à l'écran : son texte et son cadre sont de l'encre sombre sur le document (une page
    // sans son image reste blanche).
    await expect.poll(() => page.evaluate(() => {
        const c = document.getElementById('travaux-canvas-document');
        if (!c || !c.width) return 0;
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 200 && d[k] < 90 && d[k + 1] < 90 && d[k + 2] < 90) n++;
        return n;
    }), { message: 'l’image fictive est à l’écran (son encre)', timeout: 10000 }).toBeGreaterThan(300);
    // Le changement de production redessine la page : poser quand l'annotation ouverte est bien celle de ce fichier.
    await expect.poll(() => page.evaluate(() => { const a = window.travauxAnnotation.getAnnotationCourante(); return a ? a.fichierId : null; })).toBe(f.id);
    await fermerLeRappel(page);
    return f;
}

/** Toucher un tampon dans la palette « Tampons », puis la production. */
async function poser(page, tampon, fx, fy = 0.45) {
    // La palette se redessine quand la production change : le toucher est rejoué tant que le tampon n'est pas l'outil en main.
    const item = page.locator(`.travaux-autocollant-item[data-param="${tampon.id}"]`);
    await expect(item).toHaveAttribute('title', tampon.nom);
    await expect(async () => {
        await item.click({ timeout: 2000 });
        expect(await page.evaluate(() => window.travauxOutils.getAutocollantActif())).toBe(tampon.id);
    }).toPass({ timeout: 15000 });
    const point = await page.evaluate(([x, y]) => {
        const c = document.getElementById('travaux-canvas-annotation');
        c.scrollIntoView({ block: 'start' });
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width * x, y: Math.max(r.top, 0) + Math.min(r.height, window.innerHeight - Math.max(r.top, 0)) * y };
    }, [fx, fy]);
    await page.mouse.click(point.x, point.y);
}

/** Suivi › Profils, la personne, la section « Cibles ». */
async function ouvrirProfilCibles(page, eleve) {
    await aller(page, 'suivi', 'suivi-profil');
    await page.selectOption('#selecteurEtudiantProfil', eleve.da);
    const cibles = page.locator('[data-action="changerSectionProfil"][data-param="cibles"]');
    await expect(cibles).toHaveText('Cibles');
    await cibles.click();
    await expect(page.locator('.pc-panneau')).toBeVisible();
}
const carteProductions = (page) => page.locator('.pc-productions');
const rangDe = (page, r, production) => page.locator(`.pc-production[data-production="${r.productions.find((x) => x.titre === production.titre).id}"]`);
const cibleDuProfil = (page, n) => page.locator('.pc-cible').nth(n);

/** Évaluation › Tableau de notation › « Inscrire pour une production », la personne, la production. */
async function ouvrirInscrire(page, r, eleve, production) {
    await aller(page, 'evaluations', 'evaluations-tableau');
    const bouton = page.locator('[data-tc="par-production"]');
    await expect(bouton).toHaveText('Inscrire pour une production');
    await bouton.click();
    await expect(page.locator('.tc-fenetre')).toBeVisible();
    await page.locator('.tc-pr-eleve').selectOption(eleve.da);
    await page.locator('.tc-pr-production').selectOption(r.productions.find((x) => x.titre === production.titre).id);
}
const bloc = (page, cible) => page.locator(`.tc-fenetre .tc-bloc-cible[data-cible="${cible.id}"]`);
const tamponDuBloc = (page, cible, tampon) => bloc(page, cible).locator(`.oc-tampon[data-tampon="${tampon.id}"]`);
const presses = (page, cible) => bloc(page, cible).locator('.tc-pr-tampons .oc-tampon[aria-pressed="true"]');
const choisirNiveau = (page, cible, code) => bloc(page, cible).locator(`.tc-niveau input[value="${code}"]`).check({ force: true });
const inscrire = async (page) => {
    const b = page.locator('.tc-fenetre [data-tc="inscrire-production"]');
    await expect(b).toHaveText('Inscrire');
    await b.click();
};

test('LA PREUVE : le fichier s’ouvre dans un espace vide par les gestes de l’iPad ; le groupe est par cibles ; les trois productions déclarent leurs cibles ; un tampon d’observation posé se retrouve au profil ; la production à deux cibles offre deux blocs', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirLeFichier(page);
    const r = await reperes(page);
    expect(r.eleves.length, 'quatre personnes fictives').toBe(4);
    expect(r.eleves.every((e) => /^Fictif-\d\d$/.test(e.nom) && /^Personne-\d\d$/.test(e.prenom)), 'des noms manifestement fictifs').toBe(true);
    expect(r.fichiers.length, 'six images importées').toBe(6);
    const images = await page.evaluate(async (ids) => {
        const tailles = [];
        for (const id of ids) { const blob = await window.travauxStockage.recupererBlob(id); tailles.push(blob ? blob.size : 0); }
        return tailles;
    }, r.fichiers.map((f) => f.id));
    expect(images.every((t) => t > 10000), 'chacune des six images est dans l’espace : ' + images.join(', ')).toBe(true);
    expect(await poses(page), 'aucun tampon déjà posé').toEqual([]);
    expect(await inscriptions(page), 'rien d’inscrit').toEqual([]);

    // Le groupe par cibles : le tableau des cibles, la pratique nommée, les deux cibles, rien d'inscrit.
    await aller(page, 'evaluations', 'evaluations-tableau');
    await expect(page.locator('#transition-bandeau'), 'le jalon ne couvre pas l’essai').toHaveCount(0);
    await expect(page.locator('.tc-tableau')).toBeVisible();
    await expect(page.locator('#evaluations-tableau')).toContainText(PRATIQUE);
    await expect(page.locator('.tc-tableau thead')).toContainText(CIBLE_A.etiquette);
    await expect(page.locator('.tc-tableau thead')).toContainText(CIBLE_B.etiquette);
    await expect(page.locator('.tc-tableau [data-tc="case"]')).toHaveCount(8);
    await expect(page.locator('.tc-tableau [data-tc="case"]').filter({ hasText: 'Données insuffisantes' }), 'rien d’inscrit au tableau').toHaveCount(8);

    // Conception › Productions : chaque fiche, son bloc « Cibles que cette production renseigne ».
    await aller(page, 'conception', 'conception-productions');
    for (const d of PRODUCTIONS) {
        await page.selectOption('#menuProductions', r.productions.find((x) => x.titre === d.titre).id);
        const blocCibles = page.locator('#productionCiblesBloc');
        await expect(blocCibles.locator('legend')).toHaveText('Cibles que cette production renseigne');
        await expect(page.locator('#productionTitre')).toHaveValue(d.titre);
        const cases = await blocCibles.locator('.prod-cible-case').evaluateAll((cs) => cs.map((c) => ({ id: c.value, cochee: c.checked })));
        expect(cases, d.titre).toEqual(CIBLES.map((c) => ({ id: c.id, cochee: d.cibles.includes(c.id) })));
    }

    // Annoter : la production à une cible de la première personne ; la palette offre les tampons fictifs.
    const eleve = r.eleves[0];
    const f = await ouvrirEnAnnoter(page, r, eleve, prod('une'));
    await expect(page.locator('.tampons-categorie-nom', { hasText: CAT_OBSERVATION.nom })).toHaveCount(1);
    await expect(page.locator('.tampons-categorie-nom', { hasText: CAT_AUTRE.nom })).toHaveCount(1);
    await poser(page, T2, 0.4);
    await poser(page, T_AUTRE, 0.6);
    await expect.poll(() => poses(page), { message: 'la pose s’enregistre d’elle-même', timeout: 10000 }).toEqual([{ fichierId: f.id, tampons: [T2.id, T_AUTRE.id] }]);
    expect(await inscriptions(page), 'poser n’inscrit rien').toEqual([]);

    // Le profil : « Sur ses productions » montre le tampon d'observation, pas celui de l'autre catégorie.
    await ouvrirProfilCibles(page, eleve);
    await expect(carteProductions(page)).toContainText('Sur ses productions');
    const rang = rangDe(page, r, prod('une'));
    await expect(rang.locator('.pc-cible-titre')).toHaveText('Production : ' + prod('une').titre);
    await expect(rang.locator('.tc-tampon-nom')).toHaveText([T2.nom]);
    expect(await page.locator('.pc-panneau').innerText()).not.toContain(T_AUTRE.nom);

    // « Inscrire pour une production », la production à deux cibles : deux blocs.
    await ouvrirInscrire(page, r, eleve, prod('deux'));
    await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(2);
    await expect(bloc(page, CIBLE_A)).toContainText(CIBLE_A.etiquette);
    await expect(bloc(page, CIBLE_B)).toContainText(CIBLE_B.etiquette);
});

test('LE PARCOURS de l’essai, dans l’ordre du rapport (§ 9) : poser et relire (une cible) ; inscrire (une cible) ; inscrire (deux cibles, le tampon à critère déjà retenu, toucher sous une cible) ; sans rien toucher ; la production sans cible déclarée', async ({ page }) => {
    test.setTimeout(300000);
    await ouvrirLeFichier(page);
    const r = await reperes(page);
    const [P1, P2] = r.eleves;
    const aujourdhui = await page.evaluate(() => window.TableauCibles.dateLisible(window.InscriptionsCibles.dateDuJour(new Date())));

    // ── Groupe 2 : poser sur la production à une cible. ──
    await aller(page, 'evaluations', 'evaluations-annoter');
    await capture(page, '03-annoter-liste');
    const fUne = await ouvrirEnAnnoter(page, r, P1, prod('une'));
    await poser(page, T2, 0.35);
    await poser(page, T_AUTRE, 0.65);
    await expect.poll(() => poses(page), { timeout: 10000 }).toEqual([{ fichierId: fUne.id, tampons: [T2.id, T_AUTRE.id] }]);
    await capture(page, '05-annoter-pose');

    // ── Groupe 3 : relire au profil. Sous la production, et sous la cible A (« pas encore inscrite »). ──
    await ouvrirProfilCibles(page, P1);
    await expect(carteProductions(page)).toContainText('Sur ses productions');
    await expect(rangDe(page, r, prod('une')).locator('.tc-tampon-nom')).toHaveText([T2.nom]);
    await expect(rangDe(page, r, prod('une')).locator('.tc-entree-date')).toHaveText(aujourdhui);
    const directe = cibleDuProfil(page, 0).locator('.tc-entree');
    await expect(directe).toHaveCount(1);
    await expect(directe.locator('.tc-entree-directe')).toHaveText('pas encore inscrite');
    await expect(directe.locator('.tc-entree-origine')).toHaveText('Production : ' + prod('une').titre);
    await expect(directe.locator('.tc-tampon-nom')).toHaveText([T2.nom]);
    await expect(cibleDuProfil(page, 1).locator('.tc-entree')).toHaveCount(0);
    expect(await page.locator('.pc-panneau').innerText()).not.toContain(T_AUTRE.nom);
    await carteProductions(page).scrollIntoViewIfNeeded();
    await capture(page, '06-profil-une-cible');

    // ── Groupe 4 : inscrire, une cible. Un bloc, le tampon retenu d'office ; un toucher le relâche, un second le remet. ──
    await ouvrirInscrire(page, r, P1, prod('une'));
    await expect(page.locator('.tc-fenetre')).toContainText('Inscrire pour une production');
    await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(1);
    await expect(bloc(page, CIBLE_A).locator('.tc-pr-tampons .tc-champ-nom')).toHaveText('Tampons d’observation posés sur cette production');
    await expect(presses(page, CIBLE_A)).toHaveCount(1);
    await expect(bloc(page, CIBLE_A).locator('.oc-tampons-retenus')).toHaveText(' : ' + T2.nom);
    await capture(page, '07-inscrire-une-cible');
    await tamponDuBloc(page, CIBLE_A, T2).click();
    await expect(tamponDuBloc(page, CIBLE_A, T2)).toHaveAttribute('aria-pressed', 'false');
    await expect(bloc(page, CIBLE_A).locator('.oc-tampons-retenus')).toHaveText(' : aucun');
    await tamponDuBloc(page, CIBLE_A, T2).click();
    await expect(tamponDuBloc(page, CIBLE_A, T2)).toHaveAttribute('aria-pressed', 'true');
    await expect(bloc(page, CIBLE_A).locator('.tc-niveau', { hasText: 'Acquis' })).toHaveCount(1);
    await choisirNiveau(page, CIBLE_A, '3');
    await inscrire(page);
    await expect.poll(async () => (await inscriptions(page)).map((i) => [i.da, i.cibleId, i.niveau, i.tampons.map((t) => t.id)])).toEqual([[P1.da, CIBLE_A.id, '3', [T2.id]]]);

    // ── Groupe 5 : relire. Une seule entrée sous la cible, avec le niveau ; plus de « pas encore inscrite ». ──
    await ouvrirProfilCibles(page, P1);
    const inscrite = cibleDuProfil(page, 0).locator('.tc-entree');
    await expect(inscrite).toHaveCount(1);
    await expect(inscrite.locator('.tc-entree-directe')).toHaveCount(0);
    await expect(inscrite.locator('.tc-entree-niveau')).toContainText('Acquis');
    await expect(inscrite.locator('.tc-tampon-nom')).toHaveText([T2.nom]);
    await expect(rangDe(page, r, prod('une')).locator('.tc-tampon-nom')).toHaveText([T2.nom]);
    await capture(page, '08-profil-apres-inscription');

    // ── Groupe 6 : deux cibles. Le tampon à critère et un tampon sans critère, posés sur la production à deux cibles. ──
    const fDeux = await ouvrirEnAnnoter(page, r, P1, prod('deux'));
    await poser(page, T1, 0.35);
    await poser(page, T3, 0.65);
    await expect.poll(async () => (await poses(page)).find((a) => a.fichierId === fDeux.id), { timeout: 10000 }).toEqual({ fichierId: fDeux.id, tampons: [T1.id, T3.id] });
    await ouvrirInscrire(page, r, P1, prod('deux'));
    await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(2);
    for (const c of CIBLES) await expect(bloc(page, c).locator('.tc-pr-tampons .oc-tampon'), 'chaque bloc montre les deux tampons').toHaveCount(2);
    await expect(tamponDuBloc(page, CIBLE_A, T1), 'le tampon à critère, déjà retenu sous la cible A').toHaveAttribute('aria-pressed', 'true');
    await expect(tamponDuBloc(page, CIBLE_A, T3)).toHaveAttribute('aria-pressed', 'false');
    await expect(bloc(page, CIBLE_A).locator('.oc-tampons-retenus')).toHaveText(' : ' + T1.nom);
    await expect(presses(page, CIBLE_B), 'rien de retenu sous la cible B').toHaveCount(0);
    await expect(bloc(page, CIBLE_B).locator('.oc-tampons-retenus')).toHaveText(' : aucun');
    await capture(page, '09-inscrire-deux-cibles');

    // ── Groupe 7 : toucher sous une cible. Retenu là, pas sous l'autre ; un second toucher relâche. ──
    await tamponDuBloc(page, CIBLE_B, T3).click();
    await expect(tamponDuBloc(page, CIBLE_B, T3)).toHaveAttribute('aria-pressed', 'true');
    await expect(tamponDuBloc(page, CIBLE_A, T3)).toHaveAttribute('aria-pressed', 'false');
    await tamponDuBloc(page, CIBLE_B, T3).click();
    await expect(tamponDuBloc(page, CIBLE_B, T3)).toHaveAttribute('aria-pressed', 'false');
    await tamponDuBloc(page, CIBLE_B, T3).click();
    await expect(bloc(page, CIBLE_B).locator('.oc-tampons-retenus')).toHaveText(' : ' + T3.nom);
    await bloc(page, CIBLE_B).scrollIntoViewIfNeeded();
    await capture(page, '10-inscrire-deux-cibles-touche');
    await choisirNiveau(page, CIBLE_A, '2');
    await choisirNiveau(page, CIBLE_B, '3');
    await inscrire(page);
    await expect.poll(async () => (await inscriptions(page)).filter((i) => i.productionId === fDeux.productionId).map((i) => [i.cibleId, i.niveau, i.tampons.map((t) => t.id)]))
        .toEqual([[CIBLE_A.id, '2', [T1.id]], [CIBLE_B.id, '3', [T3.id]]]);
    await ouvrirProfilCibles(page, P1);
    await expect(cibleDuProfil(page, 0).locator('.tc-entree').first().locator('.tc-tampon-nom')).toHaveText([T1.nom]);
    await expect(cibleDuProfil(page, 1).locator('.tc-entree').first().locator('.tc-tampon-nom')).toHaveText([T3.nom]);
    await expect(rangDe(page, r, prod('deux')).locator('.tc-tampon-nom')).toHaveText([T1.nom, T3.nom]);
    await capture(page, '11-profil-deux-cibles');

    // ── Groupe 8 : sans rien toucher. La deuxième personne, deux tampons sans critère : aucune inscription n'en porte. ──
    const fDeuxP2 = await ouvrirEnAnnoter(page, r, P2, prod('deux'));
    await poser(page, T2, 0.35);
    await poser(page, T3, 0.65);
    await expect.poll(async () => (await poses(page)).find((a) => a.fichierId === fDeuxP2.id), { timeout: 10000 }).toEqual({ fichierId: fDeuxP2.id, tampons: [T2.id, T3.id] });
    await ouvrirInscrire(page, r, P2, prod('deux'));
    for (const c of CIBLES) await expect(presses(page, c)).toHaveCount(0);
    // « Aucun niveau » et rien d'autre sous une cible : refus, rien n'est inscrit, la fenêtre reste.
    await expect(bloc(page, CIBLE_A).locator('.tc-niveau', { hasText: 'Aucun niveau' })).toHaveCount(1);
    await bloc(page, CIBLE_A).locator('.tc-niveau input[data-sans-niveau]').check({ force: true });
    await inscrire(page);
    await expect(page.locator('.tc-fenetre')).toBeVisible();
    expect((await inscriptions(page)).filter((i) => i.da === P2.da), 'le refus n’écrit rien').toEqual([]);
    await capture(page, '12-refus-aucun-niveau');
    await choisirNiveau(page, CIBLE_A, '1');
    await choisirNiveau(page, CIBLE_B, '2');
    await inscrire(page);
    await expect.poll(async () => (await inscriptions(page)).filter((i) => i.da === P2.da).map((i) => [i.cibleId, i.niveau, i.tampons]))
        .toEqual([[CIBLE_A.id, '1', []], [CIBLE_B.id, '2', []]]);

    // ── Groupe 9 : la production sans cible déclarée. Au profil, sous la production seulement ; la fenêtre offre les
    // deux cibles, et le tampon à critère y est déjà retenu sous la cible A. ──
    const fSans = await ouvrirEnAnnoter(page, r, P2, prod('aucune'));
    await poser(page, T1, 0.35);
    await poser(page, T2, 0.65);
    await expect.poll(async () => (await poses(page)).find((a) => a.fichierId === fSans.id), { timeout: 10000 }).toEqual({ fichierId: fSans.id, tampons: [T1.id, T2.id] });
    await ouvrirProfilCibles(page, P2);
    await expect(rangDe(page, r, prod('aucune')).locator('.tc-tampon-nom')).toHaveText([T1.nom, T2.nom]);
    await expect(page.locator('.pc-cible .tc-entree--directe'), 'sous aucune cible en direct').toHaveCount(0);
    await carteProductions(page).scrollIntoViewIfNeeded();
    await capture(page, '13-profil-sans-cible');
    await ouvrirInscrire(page, r, P2, prod('aucune'));
    await expect(page.locator('.tc-fenetre .tc-bloc-cible')).toHaveCount(2);
    await expect(tamponDuBloc(page, CIBLE_A, T1)).toHaveAttribute('aria-pressed', 'true');
    await expect(presses(page, CIBLE_A)).toHaveCount(1);
    await expect(presses(page, CIBLE_B)).toHaveCount(0);
    await capture(page, '14-inscrire-sans-cible');
});
