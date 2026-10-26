import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA TABLE DE CAS, LOT 3a (26 oct. 2026), dans un vrai WebKit, contre le vrai index.html. Consigne
// `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3a.md`, § 7 ; ébauche validée
// `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`. Deux disciplines fictives, dont une sans texte : celles
// de l'ébauche (« unités manquantes » sur « calculs » ; « erreurs » sur « mots »).
//   · la chaîne et ses cinq noms ; l'étape « Cas d'interprétation » et « Ce que l'application choisit sans toi » ;
//   · « Fixer une limite » sur un critère neuf : des champs vides et la ligne qui le dit, puis, la limite écrite,
//     les paliers du 25 oct. ; « Retirer la limite » puis « Fixer une limite » retrouve tout ;
//   · la table : un seuil en pourcentage (« 7,5 »), ajouter et retirer un palier, le signalement, « Voir ce que
//     l'étudiant·e lirait à ce palier » (la copie réglée, la rangée marquée, la phrase) ;
//   · une collection enregistrée sur une grille, reprise sur l'autre (« Reprendre une de tes collections… ») ;
//   · « Égalité » : le code le plus fréquent, et la ligne « principalement », selon la règle du critère ;
//   · 1 440, 1 180, 820 et 700 px : aucun défilement de côté, les rangées s'empilent quand la table est étroite ;
//   · captures (CAPTURES_TABLE_DE_CAS=<dossier>) : 1 440, 1 180, 820 px, clair et sombre, l'étape ouverte, sur
//     chacune des deux disciplines.
// LE STOCK (piège 1) : la spec `critere-algorithmique-presentation` (« LE PIÈGE 5 ») compare toujours la note et les
// phrases d'une évaluation au relevé d'avant le lot 4 (`critere-algorithmique-avant-1150.json`) — verte après ce lot ;
// le banc Vitest `critere-algorithmique-table-de-cas` (G) compare six critères existants au relevé de c07270a6.
// ⛔ Aucun `waitForTimeout`.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('backupNePlusRappeler', 'true');
    const sc = (noms) => noms.map((nom, i) => ({ id: 's' + (i + 1), code: String(i + 1), nom: nom, ponderation: 1 }));
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        { id: 'GC', nom: 'Laboratoire fictif', dansBibliotheque: true, criteres: [
            { id: 'CC', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
              noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
              sousCriteres: sc(['Unité absente', 'Unité erronée', 'Chiffres significatifs']),
              modeleFormule: 'penalite_par_erreur', modeleProjection: 'aucune', paramsProjection: {} } ] },
        { id: 'GM', nom: 'Rédaction fictive', dansBibliotheque: true, criteres: [
            { id: 'CM', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
              noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
              sousCriteres: sc(['Syntaxe', 'Ponctuation', 'Lexique']),
              modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
              modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Atelier fictif', libelleSignalement: 'Revoir la langue', lienServiceAide: '' },
              paliersProjection: window.projectionAlgo.paliersGabaritNeuf() } ] },
        { id: 'GE', nom: 'Grille d’avant', dansBibliotheque: true, criteres: [
            { id: 'CE', nom: 'Langue', type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true, sousCriteres: sc(['Syntaxe', 'Ponctuation']) } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
}`;

async function ouvrir(page, grilleId, largeur, hauteur) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur || 1440, height: hauteur || 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.atelierAlgo, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    return erreurs;
}

const atelier = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id}"]`);
const etape = (page, id, e) => atelier(page, id).locator(`.atelier-algo-etape[data-etape="${e}"]`);
const apercu = (page, id) => atelier(page, id).locator('.apercu-algo');
const rangees = (page, id) => atelier(page, id).locator('.table-cas-rangee');
const cliquerDom = (loc) => loc.evaluate((el) => el.click());
const changer = (loc, valeur) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); }, valeur);
const enBase = (page, g) => page.evaluate(async (id) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id).criteres[0], g);
const ouvrirCas = async (page, id) => {
    await cliquerDom(atelier(page, id).locator('.atelier-algo-chaine .bc-etape[data-etape="paliers"]'));
    await expect(etape(page, id, 'paliers')).toHaveAttribute('data-ouverte', '');
};
const phrasePdf = (page, id) => apercu(page, id).locator('[data-lecture="pdf"]').evaluate((p) =>
    [...p.querySelectorAll('.apercu-algo-segment')].map((s) => s.lastChild.textContent).join(' '));
/** Ce qu'une lecture de la simulation dit, sans les étiquettes de source. */
const lu = (ap, quoi) => ap.locator(`[data-lecture="${quoi}"]`).evaluate((el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll('.apercu-algo-source').forEach((x) => x.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
});
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('calculs · la chaîne, « Fixer une limite » sur un critère neuf (champs vides, puis les paliers du 25 oct.), retirer puis fixer retrouve tout', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC', 1440, 1000);
    const bc = atelier(page, 'CC').locator('.atelier-algo-chaine .bc-etape');
    await expect(bc.locator('.bc-label')).toHaveText(['Ce que tu relèves et comptes', 'Codes utilisés', 'Note calculée', 'Cas d’interprétation', 'Ce que l’étudiant·e lit']);
    await expect(bc.locator('.bc-info')).toHaveText(['unités manquantes / calculs', '3 codes', 'pénalité fixe', '0 table', '3 textes']);
    await expect(atelier(page, 'CC').locator('.palette-algo-titre')).toContainText('Blocs de textes');
    await expect(apercu(page, 'CC').locator('.apercu-algo-titre')).toHaveText('Simulation de ce que l’étudiant·e lirait');
    await ouvrirCas(page, 'CC');
    const cas = etape(page, 'CC', 'paliers');
    await expect(cas.locator('.atelier-algo-etape-but')).toHaveCount(2);
    await expect(cas.locator('.table-cas-vide')).toContainText('Aucune limite fixée : l’étudiant·e ne lit aucun palier.');
    await expect(cas.locator('.choix-app dt')).toHaveText(['Le code le plus fréquent', 'Défi prioritaire', 'Quand tout est maîtrisé', 'Aucune annotation']);
    await expect(cas.locator('.choix-app [data-vers-zone]')).toHaveCount(3);
    await expect(cas.locator('.choix-app dd').first()).toContainText('le premier de ta liste des codes');

    // Fixer : des champs vides, la ligne qui le dit, l'étape à régler ; aucune copie n'atteint de palier.
    await cliquerDom(cas.locator('[data-action="fixerLimiteAlgo"]'));
    await expect(rangees(page, 'CC')).toHaveCount(6);
    await expect(cas.locator('input[data-param-cle="motsReference"]')).toHaveValue('');
    await expect(cas.locator('input[data-param-cle="erreursTolerees"]')).toHaveValue('');
    await expect(cas.locator('input[data-param-cle="nomServiceAide"]')).toHaveValue('');
    await expect(cas.locator('.table-cas-limite')).toHaveText('Écris la longueur de référence et la tolérance : les paliers s’appliquent dès que les deux dépassent 0.');
    await expect(etape(page, 'CC', 'paliers').locator('[data-etat]')).toHaveText(', à régler');
    await expect(rangees(page, 'CC').locator('[data-palier-ici]:not([hidden])')).toHaveCount(0);
    expect((await enBase(page, 'GC')).paramsProjection).toEqual({ nomServiceAide: '', libelleSignalement: '', lienServiceAide: '' });

    // La limite écrite (12 calculs, 4 unités manquantes) : les paliers du 25 oct., en pourcentage.
    await changer(cas.locator('input[data-param-cle="motsReference"]'), '12');
    await expect.poll(async () => (await enBase(page, 'GC')).paramsProjection.motsReference).toBe(12);
    await changer(etape(page, 'CC', 'paliers').locator('input[data-param-cle="erreursTolerees"]'), '4');
    await expect(etape(page, 'CC', 'paliers').locator('.table-cas-limite')).toHaveText('Limite : 1 unité manquante à chaque 3 calculs (4 unités manquantes pour 12 calculs).');
    const noms = await rangees(page, 'CC').locator('input.palier-nom').evaluateAll((els) => els.map((e) => e.value));
    expect(noms).toEqual(['Aucune occurrence', 'Excellent', 'Très bien', 'Bien', 'Risqué', 'Au-delà']);
    const seuils = await rangees(page, 'CC').locator('.table-cas-seuil').evaluateAll((els) => els.map((e) => e.value));
    expect(seuils).toEqual(['30', '40', '50', '100']);
    await expect(rangees(page, 'CC').nth(1)).toContainText('soit au plus 1 unité manquante à chaque 10 calculs');
    await expect(etape(page, 'CC', 'paliers').locator('[data-etat]')).toHaveText(', réglée');

    // Retirer puis fixer : rien n'est perdu.
    const avant = await enBase(page, 'GC');
    await cliquerDom(etape(page, 'CC', 'paliers').locator('[data-action="retirerLimiteAlgo"]'));
    await expect(rangees(page, 'CC')).toHaveCount(0);
    const retire = await enBase(page, 'GC');
    expect(retire.modeleProjection).toBe('aucune');
    expect(retire.paramsProjection).toEqual(avant.paramsProjection);
    expect(retire.paliersProjection).toEqual(avant.paliersProjection);
    await cliquerDom(etape(page, 'CC', 'paliers').locator('[data-action="fixerLimiteAlgo"]'));
    await expect(rangees(page, 'CC')).toHaveCount(6);
    expect(await enBase(page, 'GC')).toEqual(avant);
    expect(erreurs).toEqual([]);
});

test('calculs · la table : un seuil en pourcentage, ajouter et retirer un palier, le signalement, « Voir ce que l\'étudiant·e lirait à ce palier »', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC', 1440, 1000);
    await page.evaluate(async () => {
        await window.fixerLimiteAlgo('GC', 0);
        const lues = await db.get(cle('grillesTemplates'));
        Object.assign(lues.find((g) => g.id === 'GC').criteres[0].paramsProjection, { motsReference: 12, erreursTolerees: 4, nomServiceAide: 'Atelier des sciences', libelleSignalement: 'Revoir les unités' });
        await db.set(cle('grillesTemplates'), lues);   // security-ok: la grille fictive du spec, relue et réécrite par lui
        await window.chargerGrillePourModif('GC');
    });
    await ouvrirCas(page, 'CC');
    // Le seuil d'« Excellent » à « 7,5 » % : enregistré 0,075, la rangée le relit ; « 0 » est refusé, rien n'est écrit.
    await changer(rangees(page, 'CC').nth(1).locator('.table-cas-seuil'), '7,5');
    await expect(rangees(page, 'CC').nth(1).locator('.table-cas-seuil')).toHaveValue('7,5');
    expect((await enBase(page, 'GC')).paliersProjection[1].ratioMax).toBe(0.075);
    await changer(rangees(page, 'CC').nth(1).locator('.table-cas-seuil'), '0');
    expect((await enBase(page, 'GC')).paliersProjection[1].ratioMax).toBe(0.075);
    // Le signalement d'« Au-delà » coché ; « Voir ce que l'étudiant·e lirait » à ce palier : la copie réglée, la rangée marquée.
    await rangees(page, 'CC').nth(5).locator('label.palier-leve-signalement input').evaluate((el) => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect.poll(async () => (await enBase(page, 'GC')).paliersProjection[5].leveSignalement).toBe(true);
    await cliquerDom(rangees(page, 'CC').nth(5).locator('[data-apercu-geste="palier"]'));
    const ap = apercu(page, 'CC');
    await expect(ap.locator('.apercu-algo-flash')).toHaveText(/^Copie réglée sur le palier « Au-delà » : \d+ unités manquantes pour 12 calculs\.$/);
    await expect(rangees(page, 'CC').nth(5)).toHaveAttribute('data-atteint', '');
    await expect(rangees(page, 'CC').nth(5).locator('[data-palier-ici]')).toBeVisible();
    expect(await phrasePdf(page, 'CC')).toMatch(/Tu fais en moyenne 1 unité manquante à chaque \d+ calculs?\. Ce rapport dépasse la limite fixée\. Il serait important de demander de l’aide : Atelier des sciences\.$/);
    await expect(ap.locator('[data-lecture="signalement"]')).toContainText('Revoir les unités');
    await expect(ap.locator('[data-etat-lecture="signalement"]')).toHaveText('s’afficherait');
    // « Risqué » ensuite : la marque passe à sa rangée.
    await cliquerDom(rangees(page, 'CC').nth(4).locator('[data-apercu-geste="palier"]'));
    await expect(rangees(page, 'CC').nth(4)).toHaveAttribute('data-atteint', '');
    await expect(rangees(page, 'CC').nth(5)).not.toHaveAttribute('data-atteint', '');
    await expect(ap.locator('[data-etat-lecture="signalement"]')).toHaveText('ne s’afficherait pas');
    // Ajouter un palier (au-dessus du dernier seuil), puis le retirer.
    await cliquerDom(etape(page, 'CC', 'paliers').locator('.table-cas-ajouter'));
    await expect(rangees(page, 'CC')).toHaveCount(7);
    await expect(rangees(page, 'CC').nth(5).locator('input.palier-nom')).toHaveValue('Nouveau palier');
    await cliquerDom(rangees(page, 'CC').nth(5).locator('[data-action="supprimerPalierProjectionGrille"]'));
    await expect(rangees(page, 'CC')).toHaveCount(6);
    // « + Ajouter une recommandation » : la zone repliée paraît, rien n'est écrit.
    const bien = rangees(page, 'CC').nth(3);
    await expect(bien.locator('[data-recommandation]')).toBeHidden();
    await cliquerDom(bien.locator('.table-cas-ajout-reco'));
    await expect(bien.locator('[data-recommandation]')).toBeVisible();
    expect((await enBase(page, 'GC')).paliersProjection[3].texteAide).toBe('');
    expect(erreurs).toEqual([]);
});

test('mots · « Égalité » : le premier de la liste pour un critère neuf, le premier posé pour un critère d\'avant ; « principalement » le dit', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM', 1440, 1000);
    const ap = apercu(page, 'CM');
    await expect(ap.locator('.apercu-algo-reference')).toHaveText(['Aucune', 'Quelques', 'Beaucoup', 'Égalité']);
    await cliquerDom(ap.locator('.apercu-algo-reference[data-copie="egalite"]'));
    await expect(ap.locator('.apercu-algo-flash')).toHaveText('Copie réglée : les codes 2 et 1, deux fois chacun, le 2 posé le premier.');
    await expect(ap.locator('.apercu-algo-dominant')).toHaveText('Le plus fréquent : code 1, Syntaxe (à égalité avec code 2 : le premier de ta liste)');
    await expect(ap.locator('[data-lecture="recurrent"]')).toContainText('Langue écrite : 4 erreurs (principalement : Syntaxe)');
    await expect(ap.locator('[data-etat-lecture="recurrent"]')).toHaveText('s’afficherait');
    expect(await lu(ap, 'concentre')).toBe('Tous les critères sont maîtrisés. Tu pourrais encore raffiner : Langue écrite (4 erreurs).');
    // Le critère d'avant : le premier posé ; « Concentre-toi sur ».
    await page.evaluate(() => window.chargerGrillePourModif('GE'));
    const ape = apercu(page, 'CE');
    await cliquerDom(ape.locator('.apercu-algo-reference[data-copie="egalite"]'));
    await expect(ape.locator('.apercu-algo-dominant')).toHaveText('Le plus fréquent : code 2, Ponctuation (à égalité avec code 1 : le premier posé)');
    await expect(ape.locator('[data-lecture="recurrent"]')).toContainText('Langue : 4 erreurs (principalement : Ponctuation)');
    expect(await lu(ape, 'concentre')).toBe('Tous les critères sont maîtrisés. Concentre-toi sur Langue (4 erreurs).');
    expect(erreurs).toEqual([]);
});

test('mots puis calculs · une collection enregistrée sur une grille, reprise dans l\'autre par l\'en-tête de la table', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM', 1440, 1000);
    await ouvrirCas(page, 'CM');
    await cliquerDom(etape(page, 'CM', 'paliers').locator('[data-action="ouvrirSaisieCollectionProjection"]'));
    await etape(page, 'CM', 'paliers').locator('input[data-collection-nom="CM"]').fill('Rédaction');
    await cliquerDom(etape(page, 'CM', 'paliers').locator('[data-action="enregistrerCollectionProjection"]'));
    await expect(etape(page, 'CM', 'paliers').locator('.collections-liste .collection-nom')).toHaveText('Rédaction');
    await page.evaluate(() => window.chargerGrillePourModif('GC'));
    await ouvrirCas(page, 'CC');
    const menu = etape(page, 'CC', 'paliers').locator('select[data-on-change="reprendreCollectionProjectionHandler"]');
    await expect(menu.locator('option').first()).toHaveText('Reprendre une de tes collections…');
    const id = await menu.locator('option:not([value=""])').getAttribute('value');
    await changer(menu, id);
    await expect(rangees(page, 'CC')).toHaveCount(6);
    const c = await enBase(page, 'GC');
    expect(c.modeleProjection).toBe('norme_externe');
    expect(c.paramsProjection).toMatchObject({ motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Atelier fictif' });
    expect(c.paliersProjection.map((p) => p.libelle)).toEqual(['Aucune occurrence', 'Excellent', 'Très bien', 'Bien', 'Risqué', 'Au-delà']);
    expect(erreurs).toEqual([]);
});

// La table s'empile sous 560 px (le seuil de l'ébauche) : à 1 440 et 1 180 px (palette à côté), elle en mesure
// environ 600 et 585 ; à 820 px (palette compacte, simulation à droite), 300 ; à 700 px (simulation en tiroir), 500.
for (const [largeur, hauteur, empilee] of [[1440, 900, false], [1180, 820, false], [820, 1180, true], [700, 900, true]]) {
    test(`${largeur} px · la table des paliers, sans défilement de côté ; les rangées ${empilee ? 's’empilent' : 'en trois colonnes'}`, async ({ page }) => {
        const erreurs = await ouvrir(page, 'GM', largeur, hauteur);
        await ouvrirCas(page, 'CM');
        const r = rangees(page, 'CM').nth(4);
        await r.scrollIntoViewIfNeeded();
        const colonnes = await r.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        console.log(largeur, 'COLONNES →', colonnes, 'TABLE →', await etape(page, 'CM', 'paliers').locator('.table-cas').evaluate((el) => Math.round(el.getBoundingClientRect().width)));
        expect(colonnes).toBe(empilee ? 1 : 3);
        await expect(etape(page, 'CM', 'paliers').locator('.table-cas-entete')).toBeVisible({ visible: !empilee });
        expect(await debord(page), 'aucun défilement de côté').toBeLessThanOrEqual(0);
        // Les cibles du toucher : « Voir ce que l'étudiant·e lirait » et le seuil font au moins 40 px.
        const h = await r.locator('[data-apercu-geste="palier"]').evaluate((el) => el.getBoundingClientRect().height);
        expect(h).toBeGreaterThanOrEqual(40);
        expect(erreurs).toEqual([]);
    });
}

test('captures · 1 440, 1 180, 820 px, clair et sombre, « Cas d\'interprétation » ouverte, sur les deux disciplines', async ({ page }) => {
    test.skip(!process.env.CAPTURES_TABLE_DE_CAS, 'captures sur demande : CAPTURES_TABLE_DE_CAS=<dossier>');
    test.setTimeout(240000);
    const dossier = process.env.CAPTURES_TABLE_DE_CAS;
    for (const [g, id, nom] of [['GC', 'CC', 'calculs'], ['GM', 'CM', 'mots']]) {
        for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180]]) {
            for (const mode of ['clair', 'sombre']) {
                await ouvrir(page, g, largeur, hauteur);
                if (g === 'GC') {
                    await page.evaluate(async () => {
                        await window.fixerLimiteAlgo('GC', 0);
                        const lues = await db.get(cle('grillesTemplates'));
                        Object.assign(lues.find((x) => x.id === 'GC').criteres[0].paramsProjection, { motsReference: 12, erreursTolerees: 4, nomServiceAide: 'Atelier des sciences' });
                        await db.set(cle('grillesTemplates'), lues);   // security-ok: la grille fictive du spec, relue et réécrite par lui
                        await window.chargerGrillePourModif('GC');
                    });
                }
                await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                await ouvrirCas(page, id);
                await cliquerDom(rangees(page, id).nth(4).locator('[data-apercu-geste="palier"]'));
                await etape(page, id, 'paliers').evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -110); });
                await page.waitForFunction(() => {
                    const a = document.querySelector('#listeCriteres .gabarit-algo');
                    return document.getAnimations().every((x) => x.playState !== 'running' || !x.effect || !x.effect.target
                        || !(x.effect.target.contains(a) || a.contains(x.effect.target)));
                });
                await page.screenshot({ path: path.join(dossier, `table-de-cas-${nom}-${largeur}-${mode}.png`) });
            }
        }
    }
});
