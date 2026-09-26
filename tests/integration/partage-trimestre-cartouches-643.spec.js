import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #643 — LE FICHIER DE PARTAGE DIT DE QUEL TRIMESTRE VIENNENT SES CARTOUCHES (26 sept. 2026).
//
// Décision de Grégoire du 31 août : une grille partagée envoie les cartouches du trimestre
// ACTIF. Jusqu'ici, seule la modale de l'émettrice le disait ; le fichier ne le portait pas,
// et la personne qui le reçoit ne pouvait pas le savoir. Trajet réel entre DEUX espaces :
// l'émettrice fabrique le .lcz signé de sa grille (vraie chaîne d'export, lecteurs par
// défaut), le fichier passe dans un contexte vierge, la prévisualisation le dit.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

const AUTEUR = 'Collègue fictive 643';

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);
}

/** Émet le .lcz d'une grille à cartouches depuis un espace dont le trimestre actif est donné. */
async function emettre(browser, erreurs, { retirerChamp } = {}) {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    attacherCaptureErreurs(pageA, erreurs);
    await ouvrir(pageA);
    const r = await pageA.evaluate(async ({ auteur, retirerChamp }) => {
        window.db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false },
            { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }
        ]);
        window.db.setSync('trimestreActif', 'a2026');
        // security-ok: fixture littérale du banc, aucune source externe.
        const grille = { id: 'G643', nom: 'Analyse partagée', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Structure', ponderation: 50 }, { id: 'c2', nom: 'Rigueur', ponderation: 50 }] };
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('grillesTemplates'), [grille]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(cle('cartouches_G643'), [{ id: 'CART643', grilleId: 'G643', nom: 'Cartouche d\'automne',
            criteres: [{ id: 'c1', nom: 'Structure' }], niveaux: [{ code: 'M', nom: 'Maîtrisé' }],
            commentaires: { c1_M: 'Structure claire.' } }]);
        const pkg = await window.partageFormat.construirePackageSigne(grille, { type: 'grille', identiteAuteur: auteur });
        if (retirerChamp) {
            // Paquet « d'avant cette version » : sans le champ, signé tel quel.
            delete pkg.manifest.trimestreCartouches;
            pkg.manifest.signature = null; pkg.manifest.clePublique = null; pkg.manifest.algorithme = null;
            const resigne = await window.signaturePartage.signerPackage(pkg);
            Object.assign(pkg, resigne);
        }
        const blob = await window.partageExport.genererLcz(pkg);
        const octets = new Uint8Array(await blob.arrayBuffer());
        let binaire = '';
        octets.forEach((o) => { binaire += String.fromCharCode(o); });
        return { base64: btoa(binaire), manifest: pkg.manifest };
    }, { auteur: AUTEUR, retirerChamp: !!retirerChamp });
    await ctxA.close();
    return r;
}

/** Ouvre le .lcz dans un espace VIERGE ; rend le texte de la prévisualisation, puis importe. */
async function recevoir(browser, erreurs, base64) {
    const ctxB = await browser.newContext();
    const page = await ctxB.newPage();
    attacherCaptureErreurs(page, erreurs);
    await ouvrir(page);
    const r = await page.evaluate(async (base64) => {
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        const binaire = atob(base64);
        const octets = new Uint8Array(binaire.length);
        for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
        const promesse = window.partageImport.importerFichier(new File([octets], 'grille-643.lcz'));
        await new Promise(res => setTimeout(res, 500));
        const previz = document.getElementById('modalPartagePreviz');
        const paragraphes = previz ? [...previz.querySelectorAll('p')].map(p => p.textContent) : [];
        const bouton = previz ? previz.querySelector('[data-decision="importer"]') : null;
        if (bouton) bouton.click();
        const issue = await promesse;
        return { statut: issue.statut, paragraphes, cartouches: (window.db.getSync('partage_cartouches', []) || []).length };
    }, base64);
    await ctxB.close();
    return r;
}

test('#643 · le fichier porte le NOM du trimestre des cartouches, et la prévisualisation le dit', async ({ browser }) => {
    const erreurs = [];
    const emis = await emettre(browser, erreurs);
    console.log('MANIFESTE →', JSON.stringify({ trimestreCartouches: emis.manifest.trimestreCartouches }));

    // Le nom lisible, jamais l'identifiant interne (local à l'émettrice).
    expect(emis.manifest.trimestreCartouches).toBe('Automne 2026');
    expect(JSON.stringify(emis.manifest)).not.toContain('a2026');

    const recu = await recevoir(browser, erreurs, emis.base64);
    console.log('PRÉVISUALISATION →', JSON.stringify(recu));
    expect(recu.statut).toBe('importe');
    expect(recu.cartouches).toBe(1);
    expect(recu.paragraphes).toContain('Cartouches tirées du trimestre : Automne 2026');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#643 · un fichier émis AVANT cette version ne fait dire aucun trimestre', async ({ browser }) => {
    const erreurs = [];
    const emis = await emettre(browser, erreurs, { retirerChamp: true });
    expect(emis.manifest).not.toHaveProperty('trimestreCartouches');

    const recu = await recevoir(browser, erreurs, emis.base64);
    console.log('PRÉVISUALISATION (ancien) →', JSON.stringify(recu));
    expect(recu.statut).toBe('importe');
    expect(recu.cartouches).toBe(1);
    // Témoin : la prévisualisation a bien été lue (sinon « aucune phrase » serait vacant).
    expect(recu.paragraphes.some(p => p.startsWith('Contenu : '))).toBe(true);
    expect(recu.paragraphes.join(' | ')).not.toContain('trimestre');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
