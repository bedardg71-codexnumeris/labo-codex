import { test, expect } from '@playwright/test';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LA PRÉSENTATION DU CRITÈRE ALGORITHMIQUE (#1150, lot 4, 24 oct. 2026), dans un vrai WebKit, contre le vrai
// index.html. Consigne `plans de travail/CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md`, § 6 ;
// maquette validée `plans de travail/MAQUETTE-2026-10-24-critere-algorithmique.html`.
//   · à 1 440 px : trois colonnes (la palette, les étapes, « Ce que l'élève lira ») ; la chaîne et l'état de ses
//     cinq étapes ; une seule étape ouverte, toucher une étape de la chaîne l'ouvre ;
//   · un bloc survolé allume ses zones et pose le crayon sur ses étapes ; poser un bloc au curseur dans une
//     étape ouverte depuis la chaîne ;
//   · − / + et les trois copies de référence changent la note et les phrases ; toucher une phrase ouvre son étape ;
//   · LE PIÈGE 5 : la note et les phrases d'une évaluation, inchangées — comparées à un relevé fait AVANT le lot
//     (`tests/fixtures/critere-algorithmique-avant-1150.json`, sur 96dccb51), et l'aperçu dit la même chose ;
//   · 1 180 et 820 px : la palette compacte (étape 2b), l'aperçu à droite ; 700 px : le tiroir collé en bas ;
//   · ce que le miroir éprouvait, reporté ici (la spec `critere-algorithmique-miroir` est retirée avec le
//     bloc) : en création, sans pondération, la phrase qui le dit, puis la pondération suivie sans redessin ;
//     une chimie aux codes pondérés, sans « français », sans défilement de côté ; une grille enregistrée dont la
//     pondération change refait l'aperçu en place.
//   · captures (CAPTURES_PRESENTATION=<dossier>) : 1 440, 1 180, 820 px, clair et sombre, « Ce que l'élève lit »
//     puis « Paliers » ouvertes.
// BREAK-TESTS (24 oct. 2026, restaurés, `shasum` identique ; 10 verts sans mutation) : l'appel à
// `atelierAlgo.suivre` retiré de `modifierCritereGrille` → « une grille enregistrée… » rougit ; `_suivreAtelier`
// retiré de la pose d'un bloc dans un palier en édition → « 1 440 px · un bloc survolé… posé au curseur » rougit ;
// la colonne de l'aperçu retirée de 760 à 1 179 px → « 820 px » rougit (à 1 180 px, la règle des 340 px tient).
// ⛔ Aucun `waitForTimeout`.

const AVANT = JSON.parse(readFileSync(path.join(racineProjet, 'tests', 'fixtures', 'critere-algorithmique-avant-1150.json'), 'utf8'));

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('backupNePlusRappeler', 'true');
    const noms = { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'GR', nom: 'Rédaction fictive', dansBibliotheque: true, criteres: [
            { id: 'CR', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, noms: noms,
              codesDepuisSousCriteres: true,
              sousCriteres: [{ id: 's1', code: '1', nom: 'Syntaxe', ponderation: 1 }, { id: 's2', code: '2', nom: 'Ponctuation', ponderation: 0.5 }],
              modeleProjection: 'norme_externe', paramsProjection: { nomServiceAide: 'Centre d’aide', motsReference: 900, erreursTolerees: 30 } } ] },
        { id: 'GN', nom: 'Neuve à régler', dansBibliotheque: true, criteres: [
            { id: 'CN', nom: 'Précision', type: 'algorithmique', ponderation: 0, nomsAttendus: true, codesDepuisSousCriteres: true,
              modeleProjection: 'aucune', enonces: { decompte: '', priorite: '', concentre: '' } } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
}`;

async function ouvrir(page, grilleId, largeur, hauteur) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    if (largeur) await page.setViewportSize({ width: largeur, height: hauteur || 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.atelierAlgo, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    if (grilleId) await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    return erreurs;
}

const atelier = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id || 'CR'}"]`);
const etape = (page, e, id) => atelier(page, id).locator(`.atelier-algo-etape[data-etape="${e}"]`);
const chaine = (page, e, id) => atelier(page, id).locator(`.atelier-algo-chaine .bc-etape[data-etape="${e}"]`);
const apercu = (page, id) => atelier(page, id).locator('.apercu-algo');
const ouvertes = (page, id) => atelier(page, id).locator('.atelier-algo-etape[data-ouverte]').evaluateAll((els) => els.map((e) => e.dataset.etape));
const boite = (loc) => loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { haut: r.top, bas: r.bottom, gauche: r.left, droite: r.right, largeur: r.width }; });
const texte = (loc) => loc.evaluate((el) => el.textContent.replace(/\s+/g, ' ').trim());
/** Les phrases du PDF, sans les étiquettes de source. */
const phrasePdf = (page, id) => apercu(page, id).locator('[data-lecture="pdf"]').evaluate((p) =>
    [...p.querySelectorAll('.apercu-algo-segment')].map((s) => s.lastChild.textContent).join(' '));
const vueDe = (zone) => zone.locator('xpath=following-sibling::*[1]');
const caretA = (vue, position) => vue.evaluate((el, p) => { el.focus(); window.composeurBadges.placerCaret(el, p); }, position);

test('1 440 px · trois colonnes, la chaîne et ses cinq états, une seule étape ouverte, toucher la chaîne l\'ouvre', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GR', 1440, 900);
    const pal = await boite(atelier(page).locator('.palette-algo'));
    const corps = await boite(atelier(page).locator('.gabarit-algo-corps'));
    const ap = await boite(apercu(page));
    console.log('1440 · PALETTE', JSON.stringify(pal), 'CORPS', JSON.stringify(corps), 'APERÇU', JSON.stringify(ap));
    expect(pal.droite, 'la palette à gauche des étapes').toBeLessThanOrEqual(corps.gauche);
    expect(ap.gauche, '« Ce que l\'élève lira » à droite des étapes').toBeGreaterThanOrEqual(corps.droite);
    expect(Math.round(ap.largeur)).toBe(340);
    // La palette dit à quoi elle sert (les mots de la maquette).
    await expect(atelier(page).locator('.palette-algo-titre')).toContainText('Blocs de textes');   // ↻ lot 3a : les mots de l'ébauche
    await expect(atelier(page).locator('.palette-algo-but')).toHaveText('Ces blocs servent à composer les phrases que ce critère écrit seul sur chaque copie. Chaque bloc prend la valeur réelle de la copie évaluée.');   // ↻ lot 3a
    await expect(atelier(page).locator('.palette-algo-gestes li')).toHaveText(['1Clique dans une zone violette.', '2Touche un bloc : il se pose au curseur.']);
    await expect(atelier(page).locator('.palette-algo-cible')).toHaveText('Aucune zone choisie.');

    // La chaîne : cinq étapes, réglées, l'arrivée est « Ce que l'élève lit », ouverte au départ, seule.
    const bc = atelier(page).locator('.atelier-algo-chaine .bc-etape');
    await expect(bc).toHaveCount(5);
    await expect(bc.locator('.bc-label')).toHaveText(['Ce que tu relèves et comptes', 'Codes utilisés', 'Note calculée', 'Cas d’interprétation', 'Ce que l’étudiant·e lit']);   // ↻ lot 3a
    await expect(bc.locator('.bc-info')).toHaveText(['erreurs / mots', '2 codes', 'pénalité normalisée', '1 table', '3 textes']);
    expect(await bc.evaluateAll((els) => els.map((b) => b.classList.contains('bc-complet')))).toEqual([true, true, true, true, true]);
    expect(await ouvertes(page)).toEqual(['eleve']);
    await expect(chaine(page, 'eleve')).toHaveClass(/bc-ouvert/);
    await expect(chaine(page, 'eleve')).toHaveClass(/bc-destination/);

    // Toucher « Paliers » dans la chaîne (la souris) : elle s'ouvre, seule, et y descend.
    await chaine(page, 'paliers').click();
    expect(await ouvertes(page)).toEqual(['paliers']);
    await expect(chaine(page, 'paliers')).toHaveClass(/bc-ouvert/);
    await expect(chaine(page, 'eleve')).not.toHaveClass(/bc-ouvert/);
    await expect(etape(page, 'paliers').locator('.atelier-algo-etape-resume')).toHaveText('Paliers selon la limite fixée');   // ↻ lot 3a
    // L'en-tête de l'étape ouverte la referme ; celui d'une autre l'ouvre.
    await etape(page, 'paliers').locator('.atelier-algo-etape-tete').click();
    expect(await ouvertes(page)).toEqual([]);
    await etape(page, 'compte').locator('.atelier-algo-etape-tete').click();
    expect(await ouvertes(page)).toEqual(['compte']);
    await expect(etape(page, 'compte').locator('.atelier-algo-etape-tete')).toHaveAttribute('aria-expanded', 'true');

    // Les états non réglés : un critère neuf, sans noms, sans pondération, cochée sans code, sans texte.
    await page.evaluate(() => window.chargerGrillePourModif('GN'));
    const bn = atelier(page, 'CN').locator('.atelier-algo-chaine .bc-etape');
    await expect(bn.locator('.bc-info')).toHaveText(['à nommer', '0 code', 'pénalité normalisée', '0 table', '0 texte']);
    expect(await bn.evaluateAll((els) => els.map((b) => b.classList.contains('bc-complet')))).toEqual([false, false, false, true, false]);
    expect(await bn.evaluateAll((els) => els.map((b) => b.querySelector('.u-lecteur-ecran').textContent))).toEqual(
        [', à régler', ', à régler', ', à régler', ', réglée', ', à régler, ouverte']);
    // La case « Afficher les chaînes d'étapes » masque aussi celle-ci ; les en-têtes restent.
    await page.evaluate(() => window.ChaineEtapes.afficherToutes(false));
    await expect(atelier(page, 'CN').locator('.atelier-algo-chaine')).toBeHidden();
    await expect(etape(page, 'note', 'CN').locator('.atelier-algo-etape-tete')).toBeVisible();
    await page.evaluate(() => window.ChaineEtapes.afficherToutes(true));
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord, 'aucun défilement de côté').toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
});

test('1 440 px · un bloc survolé allume ses zones et le crayon de ses étapes ; posé au curseur dans une étape ouverte depuis la chaîne', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GR', 1440, 900);
    const service = atelier(page).locator('.palette-algo-bloc[data-jeton="{service}"]');
    // « Paliers » fermée : le crayon le dit dans la chaîne, aucune zone visible ne s'allume.
    await service.hover();
    await expect(chaine(page, 'paliers')).toHaveClass(/bc-montre/);
    await expect(chaine(page, 'eleve')).not.toHaveClass(/bc-montre/);
    await expect(chaine(page, 'paliers').locator('.bc-crayon')).toBeVisible();
    await expect(atelier(page).locator('.atelier-algo-peut')).toHaveCount(0);
    await page.mouse.move(5, 5);
    await expect(atelier(page).locator('.bc-montre')).toHaveCount(0);
    // {critere} : le décompte et le bilan (ouverts) s'allument ; « Codes » reçoit le crayon (« Aucune annotation »).
    await atelier(page).locator('.palette-algo-bloc[data-jeton="{critere}"]').hover();
    await expect(atelier(page).locator('.atelier-algo-etape[data-etape="eleve"] .atelier-algo-peut')).toHaveCount(3);
    expect(await atelier(page).locator('.bc-montre').evaluateAll((els) => els.map((b) => b.dataset.etape))).toEqual(['codes', 'eleve']);
    await page.mouse.move(5, 5);

    // Ouvrir « Paliers » par la chaîne, viser le verdict du palier 2, poser {service} à la souris.
    await chaine(page, 'paliers').click();
    const zone = etape(page, 'paliers').locator('textarea[data-palier-index="1"][data-champ="texte"]');
    const vue = vueDe(zone);
    await vue.scrollIntoViewIfNeeded();
    const avant = await zone.inputValue();
    await caretA(vue, avant.length);
    await expect(atelier(page).locator('.palette-algo-cible')).toHaveText('Zone choisie : Verdict, palier Excellent');   // ↻ lot 3a : le palier par son nom court
    await service.hover();
    await expect(vue).toHaveClass(/atelier-algo-peut/);
    await service.click();
    await expect(zone).toHaveValue(avant + ' {service}');
    expect(await vue.evaluate((el) => document.activeElement === el), 'la zone garde le focus').toBe(true);
    // La copie « Quelques » atteint ce palier : « Ce que l'élève lira » suit la pose, sans attendre la sortie de la zone.
    await expect(apercu(page).locator('[data-lecture="pdf"]')).toContainText('Centre d’aide');
    await expect.poll(() => page.evaluate(async () => (((await db.get(cle('grillesTemplates'))) || []).find((g) => g.id === 'GR').criteres[0].paliersProjection || [])[1]?.texte))
        .toBe(avant + ' {service}');
    // Fermer l'étape de la zone visée : la palette n'a plus de cible (elle ne poserait rien dans une zone cachée).
    await etape(page, 'paliers').locator('.atelier-algo-etape-tete').click();
    await expect(atelier(page).locator('.palette-algo-cible')).toHaveText('Aucune zone choisie.');
    expect(erreurs).toEqual([]);
});

test('1 440 px · − / + et les copies de référence changent la note et les phrases ; toucher une phrase ouvre son étape', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GR', 1440, 900);
    const ap = apercu(page);
    await expect(ap.locator('.apercu-algo-reference')).toHaveText(['Aucune', 'Quelques', 'Beaucoup', 'Pondérée', 'Égalité']);   // ↻ lot 3a
    await expect(ap.locator('.apercu-algo-reference[aria-pressed="true"]')).toHaveText('Quelques');
    const resultat = () => texte(ap.locator('.apercu-algo-resultats'));
    const depart = { note: await resultat(), phrase: await phrasePdf(page) };
    const n0 = Number(await ap.locator('[data-apercu-champ="erreurs"]').inputValue());
    await ap.locator('[data-apercu-geste="plus"]').click();
    await expect(ap.locator('[data-apercu-champ="erreurs"]')).toHaveValue(String(n0 + 1));
    expect(await phrasePdf(page)).not.toBe(depart.phrase);
    expect(await resultat()).not.toBe(depart.note);
    await ap.locator('[data-apercu-geste="moins"]').click();
    await ap.locator('[data-apercu-geste="moins"]').click();
    await expect(ap.locator('[data-apercu-champ="erreurs"]')).toHaveValue(String(n0 - 1));
    await ap.locator('.apercu-algo-reference[data-copie="aucune"]').click();
    expect(await resultat()).toContain('20/20 (100 %)');
    expect(await resultat()).toContain('Sans erreur');
    await ap.locator('.apercu-algo-reference[data-copie="beaucoup"]').click();
    expect(await resultat()).toContain('plancher');
    await ap.locator('.apercu-algo-reference[data-copie="ponderee"]').click();
    await expect(ap.locator('.apercu-algo-codes')).toContainText('après pondération');
    // Le curseur à glisser change le compte aussi.
    await ap.locator('[data-apercu-champ="curseur"]').fill('5');
    await expect(ap.locator('[data-apercu-champ="erreurs"]')).toHaveValue('5');
    expect(await phrasePdf(page)).toContain('5 erreurs');

    // « Montrer d'où vient chaque phrase » : les étiquettes ; toucher le verdict ouvre « Paliers » sur sa zone.
    await expect(ap.locator('[data-lecture="pdf"] .apercu-algo-source').first()).toBeVisible();
    const verdict = ap.locator('[data-lecture="pdf"] .apercu-algo-segment[data-vers-zone^="palier:"]').first();
    const [, i, champ] = (await verdict.getAttribute('data-vers-zone')).split(':');
    await verdict.click();
    expect(await ouvertes(page)).toEqual(['paliers']);
    const zone = etape(page, 'paliers').locator(`textarea[data-palier-index="${i}"][data-champ="${champ}"]`);
    expect(await vueDe(zone).evaluate((el) => document.activeElement === el)).toBe(true);
    await expect(atelier(page).locator('.palette-algo-cible')).toHaveText(`Zone choisie : Verdict, palier ${['Sans erreur', 'Excellent', 'Très bien', 'Bien', 'Risqué', 'Échec'][Number(i)]}`);
    // « Aucune annotation » : l'étape « Codes ».
    await ap.locator('[data-lecture="aucune"] .apercu-algo-segment').click();
    expect(await ouvertes(page)).toEqual(['codes']);
    // La bascule cache les étiquettes, garde les phrases.
    await ap.locator('[data-apercu-champ="sources"]').uncheck();
    await expect(ap.locator('[data-lecture="pdf"] .apercu-algo-source').first()).toBeHidden();
    expect(await phrasePdf(page)).toContain('5 erreurs');
    // La copie réglée et l'étape ouverte survivent à un redessin (une modification enregistrée).
    const nom = page.locator('#listeCriteres input[data-on-change="modifierCritereGrilleHandler"][data-champ="nom"]').first();
    await nom.fill('Langue écrite (révisée)');
    await nom.press('Tab');
    await expect(etape(page, 'compte')).toBeVisible();
    await expect(ap.locator('[data-apercu-champ="erreurs"]')).toHaveValue('5');
    expect(await ouvertes(page)).toEqual(['codes']);
    expect(erreurs).toEqual([]);
});

test('le piège 5 · la note et les phrases d\'une évaluation sont celles d\'avant le lot, et l\'aperçu dit la même chose', async ({ page }) => {
    const erreurs = await ouvrir(page, null, 1440, 900);
    const apres = await page.evaluate(() => {
        const g = window.PACK_DEMARRAGE.grillesTemplates.find((x) => x.nom === 'Grille-5 FR-ALGO-20 H26');
        const c = g.criteres.find((x) => x.type === 'algorithmique');
        const out = [];
        for (const mots of [300, 600, 900]) for (const n of [0, 1, 3, 7, 12, 20, 30, 45, 60]) {
            const f = window.formulesAlgo.calculer(c, { ponderation: c.ponderation, erreurs: n, mots });
            out.push({ erreurs: n, mots, note: f.note, pct: f.pctBorne, phrase: window.phraseDecompteAlgo(c, c, n, n, mots) });
        }
        return { grille: g.nom, critere: c.nom, ponderation: c.ponderation, copies: out };
    });
    const { releve, ...avant } = AVANT;
    expect(releve).toContain('96dccb51');
    expect(apres).toEqual(avant);

    // L'aperçu de l'atelier, pour ce même critère et trois copies réglées à la main : la note et la phrase de l'évaluation.
    await page.evaluate(async () => {
        const g = JSON.parse(JSON.stringify(window.PACK_DEMARRAGE.grillesTemplates.find((x) => x.nom === 'Grille-5 FR-ALGO-20 H26')));
        g.id = 'G_DEMO_COPIE';
        // security-ok: une copie du critère de démonstration livré, écrite par le spec.
        await db.set(cle('grillesTemplates'), [g]);
        await window.chargerGrillePourModif('G_DEMO_COPIE');
    });
    const id = await page.locator('#listeCriteres .gabarit-algo').first().getAttribute('data-critere-id');
    const ap = apercu(page, id);
    for (const [n, mots] of [[0, 600], [7, 600], [45, 900]]) {
        await ap.locator('[data-apercu-champ="mots"]').fill(String(mots));
        await ap.locator('[data-apercu-champ="erreurs"]').fill(String(n));
        const attendu = avant.copies.find((x) => x.erreurs === n && x.mots === mots);
        expect(await phrasePdf(page, id), `${n} / ${mots}`).toBe(attendu.phrase);
        // La note affichée est celle que l'évaluation retient : le pourcentage BORNÉ, ramené à la pondération (le miroir).
        const formate = await page.evaluate((a) => window.formaterNoteNombre(a.pct * 20 / 100) + '/20 (' + window.formaterNotePourcentage(a.pct) + ')', attendu);
        expect((await texte(ap.locator('.apercu-algo-resultats'))).replace(/\s+/g, ' ')).toContain(formate.replace(/\s+/g, ' '));
    }
    expect(erreurs).toEqual([]);
});

for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
    test.describe(`${largeur} px`, () => {
        test.use({ hasTouch: true, viewport: { width: largeur, height: hauteur } });
        test(`${largeur} px · la palette compacte de l'étape 2b, « Ce que l'élève lira » à droite, des cibles de 44 px`, async ({ page }) => {
            const erreurs = await ouvrir(page, 'GR');
            const pal = atelier(page).locator('.palette-algo');
            expect(await pal.evaluate((p) => getComputedStyle(p).getPropertyValue('--palette-algo-compacte').trim())).toBe('1');
            const corps = await boite(atelier(page).locator('.gabarit-algo-corps'));
            const ap = await boite(apercu(page));
            const p0 = await boite(pal);
            console.log(`${largeur} · PALETTE`, JSON.stringify(p0), 'CORPS', JSON.stringify(corps), 'APERÇU', JSON.stringify(ap));
            expect(p0.bas, 'la palette au-dessus des étapes').toBeLessThanOrEqual(corps.haut + 1);
            expect(ap.gauche, 'l\'aperçu à droite').toBeGreaterThanOrEqual(corps.droite);
            expect(Math.round(ap.largeur)).toBe(largeur >= 1180 ? 340 : 300);
            // La palette suit la zone touchée (2b), dans une étape ouverte depuis son en-tête.
            await etape(page, 'paliers').locator('.atelier-algo-etape-tete').click();
            const zone = etape(page, 'paliers').locator('textarea[data-palier-index="3"][data-champ="texte"]');
            await vueDe(zone).evaluate((el) => el.scrollIntoView({ block: 'center' }));
            const b = await boite(vueDe(zone));
            await page.mouse.click(b.gauche + 8, b.haut + 8);
            await expect(pal.locator('.palette-algo-cible')).toHaveText('Zone choisie : Verdict, palier Bien');
            expect(await zone.evaluate((z) => { const a = z.closest('.table-cas-rangee'); return !!a && a.previousElementSibling && a.previousElementSibling.matches('.palette-algo'); })).toBe(true);
            // Cibles : les pas, les copies de référence, les en-têtes des étapes.
            const hauteurs = await atelier(page).locator('.apercu-algo-pas, .apercu-algo-reference, .atelier-algo-etape-tete').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
            expect(Math.min(...hauteurs)).toBeGreaterThanOrEqual(44);
            const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(debord, 'aucun défilement de côté').toBeLessThanOrEqual(0);
            expect(erreurs).toEqual([]);
        });
    });
}

test('700 px · « Ce que l\'élève lira » devient un tiroir collé en bas, réduit, qui se déplie', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GR', 700, 900);
    await atelier(page).evaluate((el) => el.scrollIntoView());
    await expect(atelier(page).locator('.gabarit-algo-plan')).toHaveAttribute('data-tiroir', '');
    const ap = apercu(page);
    expect(await ap.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    // L'entrée de la section anime une transformation de ses ancêtres : tant qu'elle court, un `fixed` se rapporte
    // à elle (mesuré : 1 958 au lieu de 900). On attend le tiroir posé, ce que l'œil voit une fois l'entrée finie.
    await expect.poll(async () => Math.round((await boite(ap)).bas), { timeout: 5000 }).toBe(900);
    const b = await boite(ap);
    expect(Math.round(b.largeur)).toBe(700);
    await expect(ap).toHaveAttribute('data-reduit', '');
    await expect(ap.locator('.apercu-algo-copie')).toBeHidden();
    await expect(ap.locator('[data-lecture="pdf"]')).toBeVisible();
    await ap.locator('[data-apercu-geste="reduire"]').click();
    await expect(ap.locator('.apercu-algo-copie')).toBeVisible();
    await expect(ap.locator('[data-apercu-geste="reduire"]')).toHaveText('Réduire');
    // Hors de l'écran, l'atelier rend son tiroir.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(atelier(page).locator('.gabarit-algo-plan')).not.toHaveAttribute('data-tiroir', '');
    const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(debord).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
});

test('en création · sans pondération, l\'aperçu le dit ; la pondération tapée, il suit sans redessiner le gabarit', async ({ page }) => {
    const erreurs = await ouvrir(page, null, 1440, 1000);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill('Grille fictive de l’atelier');
    const carte = page.locator('#listeCriteres .item-liste').first();
    await carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('algorithmique');
    const ap = carte.locator('.apercu-algo');
    await expect(ap.locator('.apercu-algo-resultats')).toHaveText(/Note\s+aucune/);
    await expect(ap.locator('.apercu-algo-raison')).toHaveText('Donne une pondération à ce critère : l\'essai montrera la note de chaque copie.');
    await expect(carte.locator('.atelier-algo-chaine .bc-etape[data-etape="note"]')).not.toHaveClass(/bc-complet/);
    const base = await page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), [])));
    await ap.evaluate((el) => { el.dataset.temoin = '1'; });   // un témoin sur l'élément : un redessin l'emporterait
    const ponderation = carte.locator('input[data-on-change="modifierPonderationCritereTempHandler"]');
    await ponderation.fill('30');
    await ponderation.press('Tab');
    await expect(ap.locator('.apercu-algo-resultats')).toContainText('/30');
    await expect(carte.locator('.atelier-algo-chaine .bc-etape[data-etape="note"]')).toHaveClass(/bc-complet/);
    await expect(ap, 'l\'aperçu est le même élément : rien n\'a été redessiné').toHaveAttribute('data-temoin', '1');
    expect(await page.evaluate(() => JSON.stringify(db.getSync(cle('grillesTemplates'), []))), 'rien n\'est écrit en base avant « Créer la grille »').toBe(base);
    expect(erreurs).toEqual([]);
});

test('à 820 px, une chimie aux codes pondérés : la copie pondérée, aucun « français », aucun défilement de côté', async ({ page }) => {
    const erreurs = await ouvrir(page, null, 820, 1180);
    await page.evaluate(async () => {
        // security-ok: fixture littérale du spec, aucune source externe.
        await db.set(cle('grillesTemplates'), [{ id: 'GC', nom: 'Laboratoire fictif', criteres: [
            { id: 'CC', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20, nomsAttendus: true,
              noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
              modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 12 }, modeleProjection: 'aucune',
              codesDepuisSousCriteres: true, sousCriteres: [
                { id: 'SC1', code: '1', nom: 'Unité manquante', ponderation: 1.5 },
                { id: 'SC2', code: '2', nom: 'Chiffres significatifs', ponderation: 0.5 },
                { id: 'SC3', code: '3', nom: 'Arrondi', ponderation: 1 } ] } ] }]);
        await window.chargerGrillePourModif('GC');
    });
    const ap = apercu(page, 'CC');
    await ap.locator('.apercu-algo-reference[data-copie="ponderee"]').click();
    await expect(ap.locator('.apercu-algo-codes')).toContainText('après pondération');
    await expect(ap.locator('.apercu-algo-codes')).toContainText('« Unité manquante » (poids 1,5)');
    await expect(ap.locator('[data-apercu-nom="mots"]')).toHaveText('calculs');
    await ap.locator('.apercu-algo-reference[data-copie="aucune"]').click();
    expect(await phrasePdf(page, 'CC')).toBe('Ta production contient 0 unité manquante pour 12 calculs.');
    await expect(ap.locator('.apercu-algo-etendue')).toHaveText('Sans projection, ces copies ont la longueur du facteur : chaque unité manquante y coûte un point, quel que soit le facteur.');
    // Ni l'aperçu ni la chaîne ne disent « français » (le menu du modèle des phrases, lui, offre « Français écrit »).
    expect((await texte(ap)).toLowerCase()).not.toContain('français');
    expect((await texte(atelier(page, 'CC').locator('.atelier-algo-chaine'))).toLowerCase()).not.toContain('français');
    const debord = await page.evaluate(() => {
        const a = document.querySelector('#listeCriteres .apercu-algo');
        return { page: document.documentElement.scrollWidth - document.documentElement.clientWidth, apercu: a.scrollWidth - a.clientWidth };
    });
    expect(debord.page).toBeLessThanOrEqual(0);
    expect(debord.apercu).toBeLessThanOrEqual(0);
    expect(erreurs).toEqual([]);
});

test('une grille enregistrée : changer la pondération du critère refait l\'aperçu en place, avec la nouvelle note', async ({ page }) => {
    const erreurs = await ouvrir(page, null, 1440, 1000);
    await page.evaluate(async () => {
        // security-ok: fixture littérale du spec, aucune source externe.
        await db.set(cle('grillesTemplates'), [{ id: 'G_P', nom: 'Grille fictive enregistrée', criteres: [
            { id: 'CR_P', nom: 'Rigueur des calculs', type: 'algorithmique', ponderation: 30, modeleFormule: 'penalite_par_erreur',
              paramsFormule: { pointsParErreur: 1 }, modeleProjection: 'aucune', paramsProjection: {} } ] }]);
        await window.chargerGrillePourModif('G_P');
    });
    const ap = apercu(page, 'CR_P');
    await ap.locator('.apercu-algo-reference[data-copie="aucune"]').click();
    await expect(ap.locator('.apercu-algo-resultats')).toContainText('30/30 (100 %)');
    await expect(etape(page, 'note', 'CR_P').locator('.atelier-algo-etape-resume')).toHaveText('Formule : pénalité fixe, sur 30');
    const pond = page.locator('input[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]').first();
    await pond.fill('20');
    await pond.press('Tab');
    await expect(ap.locator('.apercu-algo-resultats')).toContainText('20/20 (100 %)');
    await expect(etape(page, 'note', 'CR_P').locator('.atelier-algo-etape-resume')).toHaveText('Formule : pénalité fixe, sur 20');
    expect(erreurs).toEqual([]);
});

test('captures · 1 440, 1 180, 820 px, clair et sombre, « Ce que l\'élève lit » puis « Paliers » ouvertes', async ({ page }) => {
    test.skip(!process.env.CAPTURES_PRESENTATION, 'captures sur demande : CAPTURES_PRESENTATION=<dossier>');
    test.setTimeout(120000);
    const dossier = process.env.CAPTURES_PRESENTATION;
    for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180]]) {
        for (const mode of ['clair', 'sombre']) {
            await ouvrir(page, 'GR', largeur, hauteur);
            await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
            for (const e of ['eleve', 'paliers']) {
                if (e === 'paliers') await chaine(page, 'paliers').click();
                await atelier(page).locator('.atelier-algo-chaine').evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -110); });
                // Les animations qui touchent l'atelier (l'entrée de la section, le chevron) finies ; une animation
                // en boucle ailleurs dans la page ne compte pas.
                await page.waitForFunction(() => {
                    const g = document.querySelector('#listeCriteres .gabarit-algo');
                    return document.getAnimations().every((x) => x.playState !== 'running' || !x.effect || !x.effect.target
                        || !(x.effect.target.contains(g) || g.contains(x.effect.target)));
                });
                await page.screenshot({ path: path.join(dossier, `atelier-${largeur}-${mode}-${e}.png`) });
            }
        }
    }
});
