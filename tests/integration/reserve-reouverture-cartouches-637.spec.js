import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #637 — UNE ARCHIVE ROUVERTE MONTRE TOUTES SES CARTOUCHES (26 sept. 2026).
//
// Depuis S5/#623, les cartouches vivent sous `<trim>_cartouches_<grilleId>`. Le versement
// les copie sous cette clé complète (`reserve.js`), et, s'il en reste, sous la forme nue
// héritée. La réouverture (`reserve-ouvrir.js`) ne retenait que la forme nue. Trajet réel :
// verser un groupe-cours en ZIP (WebKit n'a pas l'accès aux dossiers : téléchargement), puis
// rouvrir ce ZIP dans un espace VIERGE et lire ce que la liste propose.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Origin null is not allowed by Access-Control-Allow-Origin/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrir(page, erreurs) {
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);
}

/** Verse le groupe-cours fictif d'a2025 et rend le ZIP téléchargé. */
async function verser(browser, erreurs, { cartouchesNues, pratiques } = {}) {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const page = await ctx.newPage();
    await ouvrir(page, erreurs);
    await page.evaluate(({ cartouchesNues, pratiques }) => {
        window.db.setSync('trimestres', [
            { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A', actif: false },
            { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('cours', [{ id: 'C637', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        window.db.setSync('a2025_groupesCours', [{ id: 'GC637', coursId: 'C637', groupeNum: '1', nom: 'A2025-601-101-MQ-00001' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2025_groupeEtudiants', [{ da: '1111111', prenom: 'Fictif', nom: 'Témoin', groupe: '1', groupeCoursId: 'GC637' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2025_grillesTemplates', [{ id: 'G637', nom: 'Analyse 637', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 100 }] }]);
        // #953 : l'échelle du trimestre, elle aussi sous la clé namespacée seulement.
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2025_echellesTemplates', [{ id: 'E637', nom: 'Échelle 637', niveaux: [] }]);
        if (pratiques) {
            // #953 : la forme nue des pratiques n'est plus écrite depuis la migration du
            // 24 mai (main.js) : elle reste figée, et le versement la copie quand même.
            // security-ok: fixture littérale du banc, aucune source externe.
            window.db.setSync('pratiquesConfigurables', [{ id: 'PRAT_A', nom: 'Pratique nue A (figée)', config: {} }]);
            // security-ok: fixture littérale du banc, aucune source externe.
            window.db.setSync('a2025_pratiquesConfigurables', [
                { id: 'PRAT_A', nom: 'Pratique namespacée A', config: { echelleId: 'E637' } },
                { id: 'PRAT_B', nom: 'Pratique namespacée B', config: {} }]);
        }
        // La forme namespacée — celle que les évaluations d'a2025 ont lue.
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2025_cartouches_G637', [
            { id: 'CART_A', grilleId: 'G637', nom: 'Cartouche namespacée A', commentaires: { c1_M: 'Texte A.' } },
            { id: 'CART_B', grilleId: 'G637', nom: 'Cartouche namespacée B', commentaires: { c1_M: 'Texte B.' } }]);
        if (cartouchesNues) {
            // Forme nue héritée d'avant S5, pour la MÊME grille : une version plus ancienne
            // de CART_A, et une cartouche que seule la forme nue connaît.
            // Et une AUTRE grille qui n'a QUE la forme nue : là, elle sert.
            // security-ok: fixture littérale du banc, aucune source externe.
            window.db.setSync('cartouches_G637', [
                { id: 'CART_A', grilleId: 'G637', nom: 'Cartouche nue A (ancienne)', commentaires: { c1_M: 'Vieux texte.' } },
                { id: 'CART_NUE', grilleId: 'G637', nom: 'Cartouche nue seule', commentaires: { c1_M: 'Texte nu.' } }]);
            // security-ok: fixture littérale du banc, aucune source externe.
            window.db.setSync('cartouches_GNUE', [
                { id: 'CART_GNUE', grilleId: 'GNUE', nom: 'Cartouche d\'une grille sans forme namespacée', commentaires: {} }]);
        }
    }, { cartouchesNues: !!cartouchesNues, pratiques: !!pratiques });
    const telechargementAttendu = page.waitForEvent('download', { timeout: 30000 });
    const versement = page.evaluate(() => window.Reserve.verserGroupeCours('a2025', 'GC637'));
    // Défense K-β : l'aperçu du ZIP attend « Télécharger » — le geste de l'enseignant·e.
    await page.locator('.export-preview-modal button.btn-confirmer').click({ timeout: 20000 });
    const telechargement = await telechargementAttendu;
    // Lot A1 (30 sept. 2026) : le fichier parti, c'est l'usager qui dit s'il est là.
    await page.getByRole('button', { name: 'Il y est' }).click({ timeout: 20000 });
    await versement;
    const chemin = await telechargement.path();
    const octets = readFileSync(chemin);
    await ctx.close();
    return octets.toString('base64');
}

/** Rouvre le ZIP dans un espace vierge ; rend les cartouches que la liste propose. */
async function rouvrir(browser, erreurs, base64, { dejaLa, injecter, reimporter } = {}) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ouvrir(page, erreurs);
    const r = await page.evaluate(async ({ base64, dejaLa, injecter, reimporter }) => {
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        // Une cartouche de l'archive déjà présente là où l'import écrira (trimestre actif).
        // security-ok: fixture littérale du banc, aucune source externe.
        if (dejaLa) window.db.setSync(cle('cartouches_G637'), [{ id: 'CART_A', grilleId: 'G637', nom: 'Déjà là' }]);
        const binaire = atob(base64);
        const octets = new Uint8Array(binaire.length);
        for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
        const zip = await JSZip.loadAsync(octets);
        const cheminDonnees = Object.keys(zip.files).find(f => /donnees\.json$/.test(f));
        const donnees = JSON.parse(await zip.file(cheminDonnees).async('text'));
        let fichier = new File([octets], 'archive-637.zip');
        if (injecter) {
            // Archive plus ancienne : une clé nue héritée ajoutée au donnees.json du versement.
            Object.assign(donnees, injecter);
            zip.file(cheminDonnees, JSON.stringify(donnees));
            fichier = new File([await zip.generateAsync({ type: 'uint8array' })], 'archive-637.zip');
        }
        const clesArchive = Object.keys(donnees);
        document.getElementById('modalOuvrirVersement').classList.add('actif');
        await window.ReserveOuvrir.onFichierChoisi({ files: [fichier] });
        const texte = (l) => l.textContent.replace(/\s+/g, ' ').trim();
        const labelsDe = (type) => [...document.querySelectorAll(`#modalOuvrirVersement label.reserve-ouvrir-item[data-type="${type}"]`)];
        const labels = labelsDe('cartouches');
        const lignes = labels.map(texte);
        const doublons = labels.filter(l => l.dataset.doublon === '1').map(texte);
        const grilles = labelsDe('grilles').map(texte);
        const echelles = labelsDe('echelles').map(texte);
        const pratiques = labelsDe('pratiques').map(texte);
        let apres = null;
        if (reimporter) {
            // Le geste : cocher la grille ET ses cartouches, puis « Réimporter ».
            [...labelsDe('grilles'), ...labels].forEach(l => { l.querySelector('input').checked = true; });
            await window.ReserveOuvrir.appliquerReimport();
            const grillesTrim = (window.db.getSync(cle('grillesTemplates'), []) || []).map(g => g.id);
            const cartouchesTrim = window.db.getSync(cle('cartouches_G637'), []) || [];
            apres = { cle: cle('grillesTemplates'), grillesTrim,
                cartouchesSousGrillePresente: cartouchesTrim.filter(c => grillesTrim.includes(c.grilleId)).map(c => c.id) };
        }
        return { clesArchive, lignes, doublons, grilles, echelles, pratiques, apres };
    }, { base64, dejaLa: !!dejaLa, injecter: injecter || null, reimporter: !!reimporter });
    await ctx.close();
    return r;
}

test('#637 · une archive rouverte propose les cartouches rangées sous la clé du trimestre', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false });
    const r = await rouvrir(browser, erreurs, zip);
    console.log('RÉOUVERTURE →', JSON.stringify(r));
    // Témoin : l'archive porte bien la clé namespacée (sinon la liste vide ne dirait rien).
    expect(r.clesArchive).toContain('a2025_cartouches_G637');
    expect(r.lignes).toHaveLength(2);
    expect(r.lignes.join(' | ')).toContain('Cartouche namespacée A');
    expect(r.lignes.join(' | ')).toContain('Cartouche namespacée B');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#637 · les deux formes coexistent : la namespacée l\'emporte pour la grille, la nue est ignorée', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: true });
    const r = await rouvrir(browser, erreurs, zip);
    console.log('RÉOUVERTURE (deux formes) →', JSON.stringify(r));
    expect(r.clesArchive).toEqual(expect.arrayContaining(['a2025_cartouches_G637', 'cartouches_G637']));
    const tout = r.lignes.join(' | ');
    expect(tout).toContain('Cartouche namespacée A');
    expect(tout).toContain('Cartouche namespacée B');
    // La forme nue est ignorée EN BLOC pour cette grille : c'est la namespacée que les
    // évaluations d'a2025 lisaient ; la nue ne leur était pas visible.
    expect(tout).not.toContain('Cartouche nue A (ancienne)');
    expect(tout).not.toContain('Cartouche nue seule');
    // Une grille qui n'a que la forme nue : celle-ci sert.
    expect(tout).toContain('Cartouche d\'une grille sans forme namespacée');
    expect(r.lignes).toHaveLength(3);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#637 · une cartouche de l\'archive déjà présente là où l\'import écrira est dite « déjà présente »', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false });
    const r = await rouvrir(browser, erreurs, zip, { dejaLa: true });
    console.log('RÉOUVERTURE (déjà là) →', JSON.stringify(r));
    expect(r.lignes).toHaveLength(2);
    // Seule CART_A est déjà là (trimestre actif) ; CART_B ne l'est pas.
    expect(r.doublons).toHaveLength(1);
    expect(r.doublons[0]).toContain('Cartouche namespacée A');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// #953 — UNE ARCHIVE ROUVERTE PROPOSE AUSSI SES GRILLES ET SES ÉCHELLES (26 sept. 2026).
//
// Depuis #358, grilles et échelles vivent sous `<trim>_grillesTemplates` / `<trim>_echellesTemplates`,
// et le versement ne copie plus que cette forme. La réouverture ne lisait que la forme nue :
// aucune grille proposée, et chaque cartouche s'y disait « grille manquante ».

test('#953 · une archive rouverte propose ses grilles et ses échelles ; plus aucune cartouche « grille manquante »', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false });
    const r = await rouvrir(browser, erreurs, zip);
    console.log('RÉOUVERTURE (#953) →', JSON.stringify(r));
    // Témoin : l'archive porte les clés namespacées, et PAS la forme nue.
    expect(r.clesArchive).toEqual(expect.arrayContaining(['a2025_grillesTemplates', 'a2025_echellesTemplates']));
    expect(r.clesArchive).not.toContain('grillesTemplates');
    expect(r.grilles).toHaveLength(1);
    expect(r.grilles[0]).toContain('Analyse 637');
    expect(r.echelles).toHaveLength(1);
    expect(r.echelles[0]).toContain('Échelle 637');
    expect(r.lignes).toHaveLength(2);
    expect(r.lignes.join(' | ')).not.toContain('manquante');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#953 · grilles et échelles : les deux formes coexistent et divergent, la namespacée l\'emporte', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false });
    // Archive d'avant le retrait de la forme nue : une version plus ancienne de G637 et E637,
    // et une grille que seule la forme nue connaît.
    const r = await rouvrir(browser, erreurs, zip, { injecter: {
        grillesTemplates: [{ id: 'G637', nom: 'Analyse 637 (ancienne, nue)', criteres: [] },
                           { id: 'GNUE', nom: 'Grille nue seule', criteres: [] }],
        echellesTemplates: [{ id: 'E637', nom: 'Échelle 637 (ancienne, nue)', niveaux: [] }]
    } });
    console.log('RÉOUVERTURE (#953, deux formes) →', JSON.stringify({ grilles: r.grilles, echelles: r.echelles }));
    expect(r.clesArchive).toEqual(expect.arrayContaining(['grillesTemplates', 'a2025_grillesTemplates']));
    // La forme nue est ignorée EN BLOC dès que la namespacée existe.
    expect(r.grilles).toHaveLength(1);
    expect(r.grilles[0]).toContain('Analyse 637');
    expect(r.grilles[0]).not.toContain('ancienne');
    expect(r.echelles).toHaveLength(1);
    expect(r.echelles[0]).not.toContain('ancienne');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#953 · pratiques : la forme nue figée est ignorée, la namespacée l\'emporte', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false, pratiques: true });
    const r = await rouvrir(browser, erreurs, zip);
    console.log('RÉOUVERTURE (#953, pratiques) →', JSON.stringify({ cles: r.clesArchive.filter(k => /pratiques/.test(k)), pratiques: r.pratiques }));
    // Témoin : le versement copie les DEUX formes.
    expect(r.clesArchive).toEqual(expect.arrayContaining(['pratiquesConfigurables', 'a2025_pratiquesConfigurables']));
    const tout = r.pratiques.join(' | ');
    expect(r.pratiques).toHaveLength(2);
    expect(tout).toContain('Pratique namespacée A');
    expect(tout).toContain('Pratique namespacée B');
    expect(tout).not.toContain('figée');
    // Son échelle est proposée par la même archive : plus d'« échelle manquante ».
    expect(tout).not.toContain('manquante');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#953 · réimporter la grille ET ses cartouches : elles se rangent sous une grille présente dans le trimestre actif', async ({ browser }) => {
    const erreurs = [];
    const zip = await verser(browser, erreurs, { cartouchesNues: false });
    const r = await rouvrir(browser, erreurs, zip, { reimporter: true });
    console.log('RÉIMPORT (#953) →', JSON.stringify(r.apres));
    expect(r.apres.cle).toBe('a2026_grillesTemplates');
    expect(r.apres.grillesTrim).toContain('G637');
    expect(r.apres.cartouchesSousGrillePresente.sort()).toEqual(['CART_A', 'CART_B']);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
