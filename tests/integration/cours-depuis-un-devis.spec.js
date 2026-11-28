import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');
const devis = (code) => readFileSync(path.join(racine, 'tests', 'fixtures', 'devis', code + '.txt'), 'utf8');

// CRÉER UN COURS À PARTIR D'UN DEVIS RANGÉ (lot du 28 nov. 2026, demande de Grégoire, 8 h 06 à 8 h 16), au navigateur.
//
// Les six gestes : le code et le nom tapés ; un devis choisi (ou « Aucun ») ; les propositions, champ par champ ; chacune
// confirmée une à une, ou « Autre » ; les éléments gardés, reformulés, retirés, ajoutés ; le cours créé. Ce que Vitest ne
// prouve pas :
//   · RIEN D'OFFICE : choisir un devis ne pose rien dans les champs ; une proposition sans réponse ne s'écrit pas ;
//   · « Autre » ne vide jamais un champ ;
//   · LE DEVIS RANGÉ EST IDENTIQUE avant et après (la réserve comparée octet pour octet) ;
//   · le cours retient le CODE du devis, et une fiche existante le garde quoi qu'on y enregistre, même devis parti ;
//   · la démonstration lit SA réserve.
// Cours fictifs ; les devis sont des documents publics du ministère.

async function ouvrir(page, codes) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(async (textes) => {
        const L = window.devisLecture;
        let r = [];
        textes.forEach((t, i) => { r = L.ranger(r, L.pourReserve(L.lire(t)), { idNeuf: 'DEVIS_FICTIF_' + i, maintenant: '2026-11-28T15:00:00.000Z' }); });
        if (r.length) await db.set('devisMinisteriels', r);
        window.afficherSection('calendrier');
    }, codes.map(devis));
}
async function nouveauCours(page) {
    await page.evaluate(() => { document.getElementById('accordeon-cours').classList.remove('ferme'); return window.nouveauCoursV2(); });
    await expect(page.locator('#cours-formulaire-edition')).toBeVisible();
}
const reserve = (page, cle = 'devisMinisteriels') => page.evaluate(async (k) => JSON.stringify((await db.get(k)) || null), cle);
const leCours = (page, code) => page.evaluate(async (c) => (await db.get('cours') || []).find((x) => x.codeCours === c) || null, code);
const champs = (page) => page.evaluate(() => ['v2-numeroCompetence', 'v2-competence', 'v2-ponderation', 'v2-heuresEnseignement', 'v2-disciplineCours', 'v2-elementsCompetence'].map((id) => document.getElementById(id).value));
const confirmer = (page, champ, i = 0) => page.locator(`[data-action="coursDevis.confirmer"][data-param="${champ}"][data-param2="${i}"]`).click();
const element = (page, i, geste) => page.locator(`[data-action="coursDevis.element"][data-param="${i}"][data-param2="${geste}"]`).click();
async function choisirUneDiscipline(page) {
    return page.evaluate(() => {
        const s = document.getElementById('v2-disciplineCours');
        const o = Array.from(s.options).find((x) => x.value && /601/.test(x.value)) || Array.from(s.options).find((x) => x.value);
        s.value = o.value;
        return o.value;
    });
}

test('cours depuis un devis · 4EF0 : rien d’office ; confirmer, « Autre », deux pondérations, la discipline en repère, les éléments ; le cours créé retient le code, le devis rangé est identique', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page, ['4EF0', '01FB']);
    const reserveAvant = await reserve(page);
    await nouveauCours(page);

    // 1. Ce qui relève du collège. 2. La liste des devis rangés : « Aucun » d'abord, le formulaire d'aujourd'hui.
    await page.locator('#v2-codeCours').fill('601-101-MQ');
    await page.locator('#v2-nomCours').fill('Écriture fictive');
    await expect(page.locator('#v2-devisCours option')).toHaveText(['Aucun (tout remplir à la main)', '4EF0 – Analyser des textes littéraires.', '01FB – Traduire un matériau musical.']);
    await expect(page.locator('.cours-devis-propositions')).toHaveCount(0);

    // 3. Les propositions paraissent ; RIEN n'est dans les champs.
    await page.locator('#v2-devisCours').selectOption('4EF0');
    await expect(page.locator('.cours-devis-propositions')).toBeVisible();
    expect(await champs(page)).toEqual(['', '', '', '', '', '']);
    await expect(page.locator('#v2-devisBilan')).toHaveText('9 propositions sont restées sans réponse : elles ne seront pas écrites dans le cours.');
    await expect(page.locator('[data-champ="heures"]')).toHaveCount(0);            // 4EF0 ne donne pas d'heures
    await expect(page.locator('.cours-devis-reperes')).toContainText('Français, langue d’enseignement et littérature');
    await expect(page.locator('#v2-devisBloc')).not.toContainText('Formulation juste');   // aucun critère de performance

    // 4. Confirmer une à une. Le numéro ; « Autre » sur l'énoncé (rien n'est écrit, le champ reçoit le curseur) ; la seconde pondération.
    await confirmer(page, 'numero');
    expect((await champs(page))[0]).toBe('4EF0');
    await page.locator('[data-action="coursDevis.autre"][data-param="enonce"]').click();
    expect((await champs(page))[1]).toBe('');
    await expect(page.locator('#v2-competence')).toBeFocused();
    await page.locator('#v2-competence').fill('Analyser des textes, à ma façon');
    await confirmer(page, 'ponderation', 1);
    expect((await champs(page)).slice(2, 4)).toEqual(['1-3-3', '60']);              // la fiche propose toujours les heures depuis la pondération
    const discipline = await choisirUneDiscipline(page);

    // « Autre » après une confirmation ne vide pas le champ : la valeur reste, à reformuler.
    await page.locator('[data-action="coursDevis.autre"][data-param="numero"]').click();
    expect((await champs(page))[0]).toBe('4EF0');

    // 5. Les éléments : un gardé, un reformulé, un retiré, un ajouté ; trois laissés sans réponse.
    await element(page, 0, 'garder');
    await element(page, 1, 'reformuler');
    await page.locator('[data-cours-devis-element="1"]').fill('Repérer des thèmes, reformulé');
    await element(page, 2, 'retirer');
    await page.locator('[data-action="coursDevis.ajouterElement"]').click();
    await page.locator('[data-cours-devis-ajoute="0"]').fill('Un élément ajouté');
    await expect(page.locator('#v2-devisBilan')).toHaveText('3 propositions sont restées sans réponse : elles ne seront pas écrites dans le cours.');
    await expect(page.locator('#v2-devisBilan')).toHaveClass(/est-incomplet/);

    // 6. Créer le cours.
    await page.locator('#v2-btnCreerCours').click();
    await expect.poll(() => leCours(page, '601-101-MQ')).not.toBeNull();
    const c = await leCours(page, '601-101-MQ');
    expect(c).toMatchObject({ nomCours: 'Écriture fictive', numeroCompetence: '4EF0', competence: 'Analyser des textes, à ma façon', ponderation: '1-3-3', heuresContact: 60, discipline, devisCode: '4EF0' });
    expect(c.elementsCompetence.split('\n')).toEqual(['Reconnaître le propos du texte.', 'Repérer des thèmes, reformulé', 'Un élément ajouté']);
    expect(JSON.stringify(c)).not.toMatch(/criteres|contexte|Formulation juste/);   // un code, jamais une copie du devis
    expect(await reserve(page), 'le devis rangé, avant et après').toBe(reserveAvant);
});

test('cours depuis un devis · 01FB (ni pondération, ni heures, ni discipline), une proposition laissée sans réponse ; puis « Aucun » : le formulaire d’aujourd’hui, aucun code retenu', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page, ['4EF0', '01FB']);
    const reserveAvant = await reserve(page);
    await nouveauCours(page);
    await page.locator('#v2-codeCours').fill('551-A01-ZZ');
    await page.locator('#v2-nomCours').fill('Formation auditive fictive');
    await page.locator('#v2-devisCours').selectOption('01FB');
    await expect(page.locator('.cours-devis-ligne[data-champ]')).toHaveCount(2);     // le numéro et l'énoncé, rien d'autre
    await expect(page.locator('.cours-devis-reperes')).toHaveCount(0);
    await confirmer(page, 'enonce');                                                // le numéro reste SANS RÉPONSE
    await element(page, 0, 'garder');
    await element(page, 1, 'garder');
    await page.locator('#v2-ponderation').fill('2-1-3');
    await choisirUneDiscipline(page);
    await expect(page.locator('#v2-devisBilan')).toHaveText('1 proposition est restée sans réponse : elle ne sera pas écrite dans le cours.');
    await page.locator('#v2-btnCreerCours').click();
    await expect.poll(() => leCours(page, '551-A01-ZZ')).not.toBeNull();
    let c = await leCours(page, '551-A01-ZZ');
    expect(c).toMatchObject({ numeroCompetence: '', competence: 'Traduire un matériau musical.', ponderation: '2-1-3', devisCode: '01FB' });
    expect(c.elementsCompetence).toBe('Solfier à première vue un matériau musical.\nReproduire par écrit un matériau musical entendu.');

    // « Aucun » : pas de propositions ; un cours rempli à la main ne retient aucun devis.
    await nouveauCours(page);
    await expect(page.locator('#v2-devisCours')).toHaveValue('');
    await expect(page.locator('.cours-devis-propositions')).toHaveCount(0);
    await page.locator('#v2-codeCours').fill('601-102-MQ');
    await page.locator('#v2-nomCours').fill('Littérature fictive');
    await page.locator('#v2-numeroCompetence').fill('4EF1');
    await page.locator('#v2-ponderation').fill('3-1-3');
    await choisirUneDiscipline(page);
    await page.locator('#v2-btnCreerCours').click();
    await expect.poll(() => leCours(page, '601-102-MQ')).not.toBeNull();
    c = await leCours(page, '601-102-MQ');
    expect(c.numeroCompetence).toBe('4EF1');
    expect(c).not.toHaveProperty('devisCode');

    // Un devis choisi dont rien n'est confirmé : le cours n'en vient pas, aucun code retenu.
    await nouveauCours(page);
    await page.locator('#v2-codeCours').fill('601-103-MQ');
    await page.locator('#v2-devisCours').selectOption('4EF0');
    await page.locator('#v2-ponderation').fill('3-1-3');
    await choisirUneDiscipline(page);
    await page.locator('#v2-btnCreerCours').click();
    await expect.poll(() => leCours(page, '601-103-MQ')).not.toBeNull();
    c = await leCours(page, '601-103-MQ');
    expect([c.numeroCompetence, c.competence, c.elementsCompetence]).toEqual(['', '', '']);
    expect(c).not.toHaveProperty('devisCode');
    expect(await reserve(page)).toBe(reserveAvant);
});

test('cours depuis un devis · changer de devis retire ce que les confirmations avaient posé, garde ce qui a été tapé ; un service n’a pas de devis', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page, ['4EF0', '000Z']);
    await nouveauCours(page);
    await page.locator('#v2-devisCours').selectOption('000Z');
    await confirmer(page, 'numero');
    await confirmer(page, 'heures');                                                 // « Périodes d'enseignement : 45 » : un nombre sans ambiguïté
    await element(page, 0, 'garder');
    await page.locator('#v2-competence').fill('Tapé à la main');
    expect(await champs(page)).toEqual(['000Z', 'Tapé à la main', '', '45', '', 'Saisir le sens d’un message oral.']);

    await page.locator('#v2-devisCours').selectOption('4EF0');
    expect(await champs(page)).toEqual(['', 'Tapé à la main', '', '', '', '']);
    await page.locator('#v2-devisCours').selectOption('');
    await expect(page.locator('.cours-devis-propositions')).toHaveCount(0);
    expect((await champs(page))[1]).toBe('Tapé à la main');

    // Une saisie dans le champ des éléments n'est jamais remplacée par les gestes.
    await page.locator('#v2-devisCours').selectOption('4EF0');
    await page.locator('#v2-elementsCompetence').fill('Mes éléments à moi');
    await element(page, 0, 'garder');
    expect((await champs(page))[5]).toBe('Mes éléments à moi');

    // Un service : le bloc du devis se cache avec les champs ministériels.
    await page.locator('#v2-natureCours').selectOption('service');
    await expect(page.locator('#v2-devisBloc')).toBeHidden();
    expect(await page.evaluate(() => window.coursDevis.codeRetenu())).toBe('');
});

test('cours depuis un devis · une fiche existante : le lien ouvre son devis ; elle s’enregistre sans perdre le code, même quand le devis n’est plus rangé', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await ouvrir(page, ['4EF0']);
    const id = await page.evaluate(async () => (await window.CoursEntite.creer({ codeCours: '601-101-MQ', nomCours: 'Écriture fictive', discipline: '601 Français (langue et littérature)', ponderation: '2-2-3', numeroCompetence: '4EF0', devisCode: '4EF0' })).id);
    await page.evaluate((i) => { document.getElementById('accordeon-cours').classList.remove('ferme'); window.chargerDropdownCoursV2(); window.changerCoursSelectionneV2(i); }, id);
    await expect(page.locator('#cours-formulaire-edition')).toBeVisible();

    // La fiche existante : pas de liste, pas de propositions (le mode modification est hors du lot) ; le lien.
    await expect(page.locator('#v2-devisCours')).toHaveCount(0);
    await expect(page.locator('.cours-devis-lien')).toContainText('Ce cours a été créé à partir du devis 4EF0.');

    // Enregistrer un champ : le code retenu ne bouge pas.
    await page.locator('#v2-nomCours').fill('Écriture fictive, renommée');
    await page.locator('#v2-nomCours').dispatchEvent('change');
    await expect.poll(async () => (await leCours(page, '601-101-MQ')).nomCours).toBe('Écriture fictive, renommée');
    expect((await leCours(page, '601-101-MQ')).devisCode).toBe('4EF0');

    // Le lien ouvre le devis dans « Apporter mon matériel », avec ses critères de performance.
    await page.locator('[data-action="coursDevis.voirDevis"]').click();
    await expect(page.locator('#materiel-devis')).toBeVisible();
    await expect(page.locator('#devis-numero')).toHaveValue('4EF0');
    await expect(page.locator('.devis-element .devis-ligne')).toHaveCount(17);

    // Le devis n'est plus rangé sur l'appareil : la fiche s'ouvre, le dit, et s'enregistre sans rien perdre.
    await page.evaluate(async (i) => { await db.set('devisMinisteriels', []); window.afficherSection('calendrier'); window.changerCoursSelectionneV2(i); }, id);
    await expect(page.locator('.cours-devis-lien')).toContainText('qui n’est pas rangé sur cet appareil');
    await expect(page.locator('[data-action="coursDevis.voirDevis"]')).toHaveCount(0);
    await page.locator('#v2-competence').fill('Énoncé retouché');
    await page.locator('#v2-competence').dispatchEvent('change');
    await expect.poll(async () => (await leCours(page, '601-101-MQ')).competence).toBe('Énoncé retouché');
    const c = await leCours(page, '601-101-MQ');
    expect([c.devisCode, c.numeroCompetence, c.ponderation]).toEqual(['4EF0', '4EF0', '2-2-3']);
});

test('cours depuis un devis · aucun devis rangé : une ligne discrète, le formulaire d’aujourd’hui ; la démonstration lit SA réserve, jamais la réelle', async ({ page }) => {
    test.setTimeout(120000);
    page.on('dialog', (d) => d.accept());
    await ouvrir(page, []);
    await nouveauCours(page);
    await expect(page.locator('#v2-devisCours')).toHaveCount(0);
    await expect(page.locator('.cours-devis-aucun')).toContainText('Aucun devis ministériel n’est rangé');

    // Un devis réel, puis la démonstration avec un autre devis dans SA réserve.
    await page.evaluate(async (t) => {
        const L = window.devisLecture;
        await db.set('devisMinisteriels', L.ranger([], L.pourReserve(L.lire(t.reel)), { idNeuf: 'DEVIS_REEL', maintenant: 'x' }));
        await activerModeDemo();
        await db.set('demo_devisMinisteriels', L.ranger([], L.pourReserve(L.lire(t.demo)), { idNeuf: 'DEVIS_DEMO', maintenant: 'x' }));
    }, { reel: devis('4EF0'), demo: devis('01FL') });
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    const reelle = await reserve(page);
    await page.evaluate(() => window.afficherSection('calendrier'));
    await nouveauCours(page);
    await expect(page.locator('#v2-devisCours option')).toHaveText(['Aucun (tout remplir à la main)', '01FL – Gérer sa carrière.']);
    expect(await reserve(page)).toBe(reelle);
});
