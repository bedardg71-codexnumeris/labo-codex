import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE BARÈME, LOT 3 — évaluer une copie avec le barème, et ce que l'étudiant·e lit (#1120, gestes 3 et 4).
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-27-bareme-3-evaluer.md. Décision de Grégoire (27 oct., sur la mesure) :
// le texte de la tranche atteinte se lit dans le BLOC de chaque critère (PDF, texte de l'application), sous le chiffre et
// avant le commentaire de la cartouche ; les lignes du bilan gardent le chiffre seul.
//
// Une grille fictive (le critère « Résumé » de l'exemple Journal de lecture, à barème ; un holistique ; un analytique
// sans barème), ouverte par le trajet de la copie (l'élève, puis la production), sous les deux surfaces : sans
// cartouche (`afficherCriteresDepuisGrille`) et avec (`cartoucheSelectionnee`). Le PDF par son vrai trajet
// (`travauxExportPDF.exporterDossierComplet`), observé à la sortie de `rendreSyntheseHTML`.
//
// Break-tests : voir la demande de relecture.

const T = 'tb3';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const NB = ' ';

const JOURNAL = [
    { id: 'TR_1', nom: 'Insuffisant', pointsMin: null, pointsMax: null, texte: 'Résumé absent ou erroné' },
    { id: 'TR_2', nom: 'Partiel', pointsMin: 2, pointsMax: 2, texte: 'Résume quelques événements' },
    { id: 'TR_3', nom: 'Satisfaisant', pointsMin: 3, pointsMax: 4, texte: 'Résume l’essentiel\nQuelques imprécisions' },
    { id: 'TR_4', nom: 'Remarquable', pointsMin: 5, pointsMax: 5, texte: 'Résume avec précision et concision' }
];

const MONTER = `({ T, bareme, cartouche }) => {
    const coursId = 'cours-b3';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    const criteres = [
        { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique' },
        Object.assign({ id: 'c2', nom: 'Résumé', ponderation: 5, type: 'analytique' }, bareme ? { bareme } : {}),
        { id: 'c3', nom: 'Réaction', ponderation: 25, type: 'analytique' }
    ];
    const commentaires = {};
    criteres.forEach((c) => ['I', 'D', 'M', 'E'].forEach((n) => { commentaires[c.id + '_' + n] = 'CARTOUCHE ' + c.id + '_' + n; }));
    // security-ok: fixtures littérales du banc, aucune source externe.
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GCB3', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: 'DAB3', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GCB3' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [{ id: 'PB3', titre: 'Journal fictif', type: 'travail', ponderation: 20, grilleId: 'GB3', echelleId: 'EB3', cartoucheId: cartouche ? 'CTB3' : '', groupeCoursId: 'GCB3' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_cartouches_GB3', cartouche ? [{ id: 'CTB3', nom: 'Cartouche témoin', grilleId: 'GB3', contexte: '', criteres: criteres.map((c) => ({ id: c.id, nom: c.nom })), commentaires }] : []);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_grillesTemplates', [{ id: 'GB3', nom: 'Journal de lecture fictif', criteres }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_echellesTemplates', [{ id: 'EB3', nom: 'IDME', niveaux }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_evaluationsSauvegardees', []);
    window.db.setSync(T + '_fichiersTravaux', [{ id: 'FB3', etudiantDA: 'DAB3', productionId: 'PB3', coursId, groupeCoursId: 'GCB3',
        nomFichier: 'FICTIF_DAB3_Journal.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1, stockage: 'indexeddb', thumbnailDataUrl: '',
        dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z', source: 'import-local', importePar: 'single', statut: 'present' }]);   // security-ok: fixture littérale du banc
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('backupNePlusRappeler', 'true');
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GCB3' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GCB3', trimestreId: T });
    // Le PDF : rien ne se télécharge, on garde ce que l'étudiant·e lirait (patron du banc #1173).
    window._pdfB3 = [];
    window._htmlB3 = [];
    window.jspdf.jsPDF.API.save = function (nom) { window._pdfB3.push(nom); return this; };
    const rendre = window.syntheseRetroactionRendu.rendreSyntheseHTML;
    window.syntheseRetroactionRendu.rendreSyntheseHTML = function () {
        const h = rendre.apply(this, arguments);
        window._htmlB3.push(h);
        return h;
    };
}`;

async function monter(page, { bareme = JOURNAL, cartouche = false, largeur = 1440 } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.setViewportSize({ width: largeur, height: largeur <= 820 ? 1180 : 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.bareme && window.syntheseRetroactionData && window.travauxExportPDF && window.jspdf
        && window.travauxUI && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T, bareme, cartouche }) + ')');
    // Le chemin de Grégoire (patron du banc #1142) : Annoter, la copie, « Évaluer » ; la palette s'ouvre dans la visionneuse.
    await page.evaluate((png) => {
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FB3' ? copie : original.apply(this, arguments); };
        window.naviguerVers('evaluations', 'annoter');
    }, PNG);
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FB3"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FB3'));
    await page.waitForFunction(() => (window.travauxVisionneuse.getFichierActuel() || {}).id === 'FB3', null, { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => document.getElementById('eval_pts_c2') && document.getElementById('eval_pts_c3'), null, { timeout: 15000 });
    await page.waitForTimeout(3500);   // les recalculs différés du chargement et de `afficherPalettesEval`
    return erreurs;
}

const bloc = (page) => page.locator('#listeCriteresGrille1 .eval-bareme[data-bareme-critere="c2"]');
const tranche = (page, id) => bloc(page).locator(`.eval-bareme-tranche[data-tranche="${id}"]`);
const toucher = (loc) => loc.click();
const taper = (page, id, v) => page.evaluate(([i, x]) => {
    const champ = document.getElementById('eval_pts_' + i);
    champ.value = x;
    champ.dispatchEvent(new Event('input', { bubbles: true }));
}, [id, v]);
const choisir = (page, id, code) => page.evaluate(([i, c]) => {
    const menu = document.getElementById('eval_' + i);
    menu.value = c;
    menu.dispatchEvent(new Event('change', { bubbles: true }));
}, [id, code]);
const lire = (page) => page.evaluate(() => {
    const b = document.querySelector('#listeCriteresGrille1 .eval-bareme[data-bareme-critere="c2"]');
    const hors = document.getElementById('eval_pts_hors_c2');
    return {
        champ: document.getElementById('eval_pts_c2').value,
        // #646 : l'évaluation en cours vit sous son nom nu ; c'est lui que `pointsSaisis` écrit.
        memoire: (evaluationEnCours.pointsAnalytiques || {}).c2,
        choisies: b ? [...b.querySelectorAll('.eval-bareme-tranche--choisie')].map((li) => li.dataset.tranche) : null,
        pressees: b ? [...b.querySelectorAll('[aria-pressed="true"]')].map((x) => x.closest('li').dataset.tranche) : null,
        ouvertes: b ? [...b.querySelectorAll('.eval-bareme-valeurs:not([hidden])')].map((x) => x.closest('li').dataset.tranche) : null,
        hors: !!hors && !hors.hidden,
        note: document.getElementById('noteProduction1').textContent
    };
});
const enBase = (page) => page.evaluate((t) => window.db.getSync(t + '_evaluationsSauvegardees', []), T);
async function enregistrer(page) {
    await page.evaluate(() => window.sauvegarderEvaluation());
    await expect.poll(async () => (await enBase(page)).length).toBe(1);
    await page.waitForTimeout(400);
}
async function pdf(page) {
    await page.evaluate(() => window.travauxExportPDF.exporterDossierComplet('DAB3', 'PB3'));
    await expect.poll(() => page.evaluate(() => window._pdfB3.length), { timeout: 15000 }).toBe(1);
    return page.evaluate(() => window._htmlB3[window._htmlB3.length - 1]);
}
const texteDuHtml = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, '’').replace(/\s+/g, ' ');

for (const cartouche of [false, true]) {
    const surface = cartouche ? 'avec cartouche (cartoucheSelectionnee)' : 'sans cartouche (afficherCriteresDepuisGrille)';

    test(`${surface} · les tranches se lisent avant de toucher ; toucher une tranche, puis une valeur ; une valeur seule ; 2,5 ; hors barème ; à compléter`, async ({ page }) => {
        const erreurs = await monter(page, { cartouche });
        // Lisibles avant de toucher : le nom, les points, le texte ; dans l'ordre du barème.
        expect(await bloc(page).locator('.eval-bareme-tranche').evaluateAll((l) => l.map((li) => li.dataset.tranche))).toEqual(['TR_1', 'TR_2', 'TR_3', 'TR_4']);
        expect(await tranche(page, 'TR_3').locator('.eval-bareme-nom').textContent()).toBe('Satisfaisant');
        expect(await tranche(page, 'TR_3').locator('.eval-bareme-points').textContent()).toBe('3 à 4');
        expect(await tranche(page, 'TR_3').locator('.eval-bareme-texte').textContent()).toBe('Résume l’essentiel\nQuelques imprécisions');
        // H4 : une tranche sans points ne se touche pas.
        expect(await tranche(page, 'TR_1').locator('button').count()).toBe(0);
        expect(await tranche(page, 'TR_1').locator('.eval-bareme-marque').textContent()).toBe('à compléter');
        expect(await tranche(page, 'TR_1').locator('.eval-bareme-marque').getAttribute('data-tooltip')).toBe('bareme-eval-a-completer');
        // H1, H2.
        expect(await bloc(page).locator('ul').getAttribute('data-tooltip')).toBe('bareme-eval');
        expect(await page.locator('#listeCriteresGrille1 label[for="eval_pts_c2"]').textContent()).toBe('Ou tape les points :');
        // Rien de choisi, rien en mémoire.
        expect(await lire(page)).toMatchObject({ champ: '', choisies: [], ouvertes: [], hors: false });
        expect((await lire(page)).memoire).toBeUndefined();

        // Toucher « Satisfaisant » : ses valeurs paraissent sous elle ; rien ne bouge sous le doigt ; rien ne s'enregistre.
        const haut = () => tranche(page, 'TR_3').locator('.eval-bareme-choix').evaluate((el) => el.getBoundingClientRect().top);
        const avant = await haut();
        await toucher(tranche(page, 'TR_3').locator('.eval-bareme-choix'));
        expect(await haut()).toBe(avant);
        expect(await tranche(page, 'TR_3').locator('.eval-bareme-valeur').evaluateAll((l) => l.map((b) => b.textContent))).toEqual(['3', '4']);
        expect(await lire(page)).toMatchObject({ champ: '', ouvertes: ['TR_3'], choisies: [] });
        expect((await lire(page)).memoire).toBeUndefined();

        // Toucher 4 : les points dans le champ, en mémoire, la tranche choisie.
        await toucher(tranche(page, 'TR_3').locator('.eval-bareme-valeur', { hasText: '4' }));
        expect(await lire(page)).toMatchObject({ champ: '4', memoire: 4, choisies: ['TR_3'], pressees: ['TR_3'], hors: false });

        // Une tranche d'une seule valeur pose ses points d'un coup.
        await toucher(tranche(page, 'TR_2').locator('.eval-bareme-choix'));
        expect(await lire(page)).toMatchObject({ champ: '2', memoire: 2, choisies: ['TR_2'], hors: false });

        // Taper 2,5 : aucune tranche ne le couvre ; « hors barème » (H3), et rien de choisi.
        await taper(page, 'c2', '2.5');
        expect(await lire(page)).toMatchObject({ champ: '2.5', memoire: 2.5, choisies: [], hors: true });
        expect(await page.locator('#eval_pts_hors_c2').textContent()).toBe('hors barème');
        expect(await page.locator('#eval_pts_hors_c2').getAttribute('data-tooltip')).toBe('bareme-eval-hors-bareme');
        // Le zéro est une valeur : ici, aucune tranche ne le couvre (« Insuffisant » est à compléter).
        await taper(page, 'c2', '0');
        expect(await lire(page)).toMatchObject({ champ: '0', memoire: 0, choisies: [], hors: true });
        // La frappe choisit la tranche comme le toucher.
        await taper(page, 'c2', '5');
        expect(await lire(page)).toMatchObject({ champ: '5', memoire: 5, choisies: ['TR_4'], hors: false });
        // Champ vidé : rien de choisi, rien hors barème.
        await taper(page, 'c2', '');
        expect(await lire(page)).toMatchObject({ champ: '', choisies: [], hors: false });

        // Le clavier : Tab, puis Entrée ou Espace.
        const choix = tranche(page, 'TR_3').locator('.eval-bareme-choix');
        await toucher(choix);   // replier
        await choix.focus();
        await page.keyboard.press('Enter');
        expect((await lire(page)).ouvertes).toEqual(['TR_3']);
        // WebKit, comme Safari par défaut, ne tabule entre les boutons qu'avec Option : c'est la touche de l'iPad au clavier.
        await page.keyboard.press('Alt+Tab');
        await expect(tranche(page, 'TR_3').locator('.eval-bareme-valeur').first()).toBeFocused();
        await page.keyboard.press(' ');
        expect(await lire(page)).toMatchObject({ champ: '3', memoire: 3, choisies: ['TR_3'] });

        // Un critère sans barème : rien de neuf autour de son champ.
        expect(await page.locator('#listeCriteresGrille1 .eval-bareme[data-bareme-critere="c3"]').count()).toBe(0);
        expect(await page.locator('#listeCriteresGrille1 label[for="eval_pts_c3"], #eval_pts_hors_c3').count()).toBe(0);
        expect(erreurs).toEqual([]);
    });

    test(`${surface} · la copie enregistrée : seuls les points ; verrouillée, le barème se lit sans se toucher ; son PDF et le bilan disent le chiffre, puis le texte, sans le nom`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page, { cartouche });
        await choisir(page, 'c1', 'M');
        await toucher(tranche(page, 'TR_3').locator('.eval-bareme-choix'));
        await toucher(tranche(page, 'TR_3').locator('.eval-bareme-valeur', { hasText: '3' }));
        await taper(page, 'c3', '20');
        const bilan = await page.evaluate(() => document.getElementById('retroactionFinale1').value);
        await enregistrer(page);
        const [ev] = await enBase(page);
        expect(ev.pointsAnalytiques).toEqual({ c2: 3, c3: 20 });
        // Aucune donnée neuve : ni tranche, ni nom, ni texte du barème, hors du texte de la rétroaction (`retroactionFinale`, qui
        // existait : c'est ce que l'étudiant·e lit). Les champs : ceux d'une copie sans barème (essai de l'invariant 1).
        expect(JSON.stringify(Object.assign({}, ev, { retroactionFinale: '' }))).not.toMatch(/TR_|Satisfaisant|Résume l|bareme|tranche/);

        // Le bilan de l'application : sous « 3 / 5 », le texte, puis la cartouche ; sans barème, comme hier.
        expect(bilan).toContain('Critère 2 (Résumé) — 3 / 5\nRésume l’essentiel\nQuelques imprécisions\n');
        expect(bilan).not.toContain('Satisfaisant');
        if (cartouche) expect(bilan).toContain('Résume l’essentiel\nQuelques imprécisions\nCARTOUCHE c2_D\n');
        expect(bilan).toMatch(/Critère 3 \(Réaction\) — 20 \/ 25\n(CARTOUCHE c3_M\n)?\n/);

        // Verrouillée : les tranches se lisent, ne se touchent pas.
        expect(ev.verrouillee).toBe(true);
        await page.evaluate(() => window.desactiverFormulaireEvaluation(true));
        expect(await bloc(page).locator('button:not([disabled])').count()).toBe(0);
        await expect(tranche(page, 'TR_4').locator('.eval-bareme-texte')).toHaveText('Résume avec précision et concision');
        await page.evaluate(() => window.toucherTrancheBareme('c2', 'TR_4'));
        expect((await lire(page)).champ).toBe('3');
        expect(await enBase(page)).toEqual([ev]);

        // Le PDF, par son vrai trajet : « 3 / 5 », puis le texte (ses sauts de ligne), puis le commentaire ; jamais le nom.
        const html = await pdf(page);
        const texte = texteDuHtml(html);
        const i = texte.indexOf('3 / 5'), j = texte.indexOf('Résume l’essentiel');
        expect(i).toBeGreaterThan(-1);
        expect(j).toBeGreaterThan(i);
        expect(html).toContain('white-space: pre-line;');
        expect(html).toMatch(/Résume l(’|&rsquo;|&#039;|')essentiel\nQuelques imprécisions<\/div>/);
        if (cartouche) expect(texte.indexOf('CARTOUCHE c2_D')).toBeGreaterThan(j);
        expect(texte).not.toContain('Satisfaisant');
        expect(texte).toContain('20 / 25');
        expect(await enBase(page), 'le PDF n’écrit rien').toEqual([ev]);
        expect(erreurs).toEqual([]);
    });
}

test('invariant 1 · mêmes points, même note, même évaluation enregistrée, avec et sans barème ; des points hors barème : le chiffre seul', async ({ page }) => {
    test.setTimeout(90000);
    const releve = async (bareme) => {
        await monter(page, { bareme });
        await choisir(page, 'c1', 'M');
        await taper(page, 'c2', '2.5');
        await taper(page, 'c3', '20');
        await enregistrer(page);
        const [ev] = await enBase(page);
        const html = await pdf(page);
        const bilan = await page.evaluate(() => document.getElementById('retroactionFinale1').value);
        ['id', 'dateEvaluation', 'heureEvaluation', 'dateModification', 'dateCreation', 'horodatage'].forEach((k) => { delete ev[k]; });
        ev.journal = (ev.journal || []).map((j) => Object.assign({}, j, { date: '' }));
        return { ev, html, bilan };
    };
    const avec = await releve(JOURNAL);
    const sans = await releve(null);
    expect(avec.ev.noteFinale).toBe(sans.ev.noteFinale);
    expect(Object.keys(avec.ev).sort()).toEqual(Object.keys(sans.ev).sort());
    expect(avec.ev).toEqual(sans.ev);
    // 2,5 n'est dans aucune tranche : le PDF et le bilan disent le chiffre seul, comme sans barème.
    expect(texteDuHtml(avec.html)).toContain('2,5 / 5');
    expect(avec.html).toBe(sans.html);
    expect(avec.bilan).toBe(sans.bilan);
});

test('sécurité · un <img onerror> dans le nom et le texte d’une tranche sort en texte, à l’écran, au bilan et au PDF', async ({ page }) => {
    test.setTimeout(90000);
    const piege = '<img src=x onerror="window.__piege=1">';
    const bareme = JOURNAL.map((t) => (t.id === 'TR_3' ? Object.assign({}, t, { nom: piege + 'Nom', texte: piege + 'Texte' }) : t));
    const erreurs = await monter(page, { bareme });
    await expect(tranche(page, 'TR_3').locator('.eval-bareme-nom')).toHaveText(piege + 'Nom');
    await expect(tranche(page, 'TR_3').locator('.eval-bareme-texte')).toHaveText(piege + 'Texte');
    await choisir(page, 'c1', 'M');
    await toucher(tranche(page, 'TR_3').locator('.eval-bareme-choix'));
    await toucher(tranche(page, 'TR_3').locator('.eval-bareme-valeur', { hasText: '4' }));
    await taper(page, 'c3', '20');
    expect(await page.evaluate(() => document.getElementById('retroactionFinale1').value)).toContain('— 4 / 5\n' + piege + 'Texte');
    await enregistrer(page);
    const html = await pdf(page);
    expect(html).not.toContain('<img src=x');
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    expect(await page.evaluate(() => window.__piege)).toBeUndefined();
    expect(erreurs).toEqual([]);
});

for (const largeur of [1440, 1180, 820, 700]) {
    test(`${largeur} px · le barème à l’évaluation : aucun défilement de côté, des cibles d’au moins 44 px, espacées`, async ({ page }) => {
        const erreurs = await monter(page, { largeur });
        await toucher(tranche(page, 'TR_3').locator('.eval-bareme-choix'));
        const mesure = await bloc(page).evaluate((b) => {
            const r = (el) => el.getBoundingClientRect();
            const cibles = [...b.querySelectorAll('button')].map((x) => ({ h: Math.round(r(x).height), w: Math.round(r(x).width), t: x.textContent.trim().slice(0, 12) }));
            const valeurs = [...b.querySelectorAll('.eval-bareme-valeur')].map(r);
            return {
                visible: r(b).width > 0,
                petites: cibles.filter((c) => c.h < 44 || c.w < 44),
                ecart: valeurs.length > 1 ? Math.round(valeurs[1].left - valeurs[0].right) : null,
                deborde: b.scrollWidth - b.clientWidth,
                page: document.documentElement.scrollWidth - document.documentElement.clientWidth
            };
        });
        console.warn(`b3 · ${largeur} px →`, JSON.stringify(mesure));
        expect(mesure.visible).toBe(true);
        expect(mesure.petites, 'cibles de moins de 44 px').toEqual([]);
        expect(mesure.ecart).toBeGreaterThanOrEqual(8);
        expect(mesure.deborde).toBeLessThanOrEqual(0);
        expect(mesure.page, 'aucun défilement de côté').toBeLessThanOrEqual(0);
        expect(erreurs).toEqual([]);
    });
}

test('captures · le barème à l’évaluation (rien de choisi, une tranche ouverte, hors barème), le critère dans le PDF ; 1 440 et 820 px, clair et sombre', async ({ page }) => {
    test.skip(!process.env.CAPTURES_BAREME_3, 'captures sur demande : CAPTURES_BAREME_3=<dossier>');
    test.setTimeout(240000);
    const dossier = process.env.CAPTURES_BAREME_3;
    for (const largeur of [1440, 820]) {
        for (const mode of ['clair', 'sombre']) {
            await monter(page, { largeur, cartouche: true });
            await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
            await page.evaluate(() => document.querySelectorAll('[class*="notification"], [class*="toast"]').forEach((el) => el.remove()));
            const prendre = async (nom) => {
                await bloc(page).scrollIntoViewIfNeeded();
                await page.waitForTimeout(300);
                await page.screenshot({ path: path.join(dossier, `bareme-3-${nom}-${largeur}-${mode}.png`) });
            };
            await prendre('rien-de-choisi');
            await toucher(tranche(page, 'TR_3').locator('.eval-bareme-choix'));
            await toucher(tranche(page, 'TR_3').locator('.eval-bareme-valeur', { hasText: '3' }));
            await prendre('tranche-ouverte');
            await taper(page, 'c2', '2.5');
            await prendre('hors-bareme');
            await choisir(page, 'c1', 'M');
            await taper(page, 'c2', '3');
            await taper(page, 'c3', '20');
            await enregistrer(page);
            const html = await pdf(page);
            const p = await page.context().newPage();
            await p.setViewportSize({ width: 900, height: 1200 });
            await p.setContent(html);
            await p.screenshot({ path: path.join(dossier, `bareme-3-pdf-critere-${largeur}-${mode}.png`) });
            await p.close();
        }
    }
});
