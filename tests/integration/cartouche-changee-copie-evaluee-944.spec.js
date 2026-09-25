import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #944 (24 sept. 2026) — CHANGER DE CARTOUCHE SUR UNE COPIE DÉJÀ ÉVALUÉE, PAR UN GESTE CONFIRMÉ.
// Suite de #939 : le commentaire enregistré passait avant la cartouche, et il ne dépend pas de la
// cartouche — choisir « Cartouche témoin (rev) » au menu ne changeait donc rien (rapport de
// Grégoire, « Carte mentale A26 (rev) »). Décision : le choix au menu, confirmé, remplace les
// commentaires de CETTE copie ; annulé, rien ne change, cartoucheId compris.
//
// Même copie de banc que la spec #939 (copie du 15 sept., c1 enregistré au niveau M, c2 portant
// l'ancien « [Non défini] »), plus une cartouche révisée CT939R. Aucun `page.click` : `el.click()`
// et `change` scriptés — un `change` scripté hors chargeur est ce que l'app reçoit du geste.
// Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't939';
const ENREGISTRE = "ENREGISTRÉ c1_M : ton propos tient, d'un bout à l'autre.";
const RETOUCHEE = "RETOUCHÉE c1_M : la cartouche d'aujourd'hui.";
const NOUVEAU_C1 = 'NOUVEAU c1_M : la cartouche révisée, choisie au menu.';
const NOUVEAU_C2 = 'NOUVEAU c2_D : la cartouche révisée, choisie au menu.';

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, ENREGISTRE, RETOUCHEE, NOUVEAU_C1, NOUVEAU_C2 }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-939';
        const grille = { id: 'G939', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] };
        const echelle = { id: 'E939', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC939', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TEST939', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC939' }]);
        window.db.setSync(T + '_productions', [{ id: 'p939', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G939', echelleId: 'E939', groupeCoursId: 'GC939' }]);
        window.db.setSync(T + '_grillesTemplates', [grille]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        // La cartouche d'AUJOURD'HUI : c1_M retouché depuis l'évaluation, rien pour c2_D.
        window.db.setSync(T + '_cartouches_G939', [{ id: 'CT939', nom: 'Cartouche témoin', grilleId: 'G939', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
            commentaires: { c1_M: RETOUCHEE, c1_E: 'VIVANTE c1_E' } },
            { id: 'CT939R', nom: 'Cartouche témoin (rev)', grilleId: 'G939', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
            commentaires: { c1_M: NOUVEAU_C1, c2_D: NOUVEAU_C2 } }]);
        // L'évaluation du 15 sept., telle que les collecteurs l'ont écrite.
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV939', etudiantDA: 'TEST939', productionId: 'p939', groupeCoursId: 'GC939',
            grilleId: 'G939', echelleId: 'E939', cartoucheId: 'CT939', statutRemise: 'evalue',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: ENREGISTRE },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '[Non défini]' }
            ],
            retroactionFinale: 'Voici quelques observations :\n\nCritère 1 (Contenu) — M\n' + ENREGISTRE
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT939', etudiantDA: 'TEST939', productionId: 'p939', coursId, groupeCoursId: 'GC939',
            nomFichier: 'FICTIF_TEST939_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);

        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC939' });
        window.db.setSync('groupeCoursActif', { id: 'GC939', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT939' ? copie : original.apply(this, arguments); };

        window._presse939 = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true,
            value: { writeText: (t) => { window._presse939.push(t); return Promise.resolve(); } } });
    }, { png: PNG, T, ENREGISTRE, RETOUCHEE, NOUVEAU_C1, NOUVEAU_C2 });
    return erreurs;
}


/** L'ouverture de la copie est finie : la chaîne de chargement a rendu la main et le menu porte la cartouche enregistrée. */
async function ouvrirLaCopie(page) {
    await page.evaluate(() => window.evaluerProduction('TEST939', 'p939'));
    await page.waitForFunction(() => {
        const ec = window.evaluationEnCours;
        return ec && ec.idModification === 'EV939' && window._modifierEvaluationEnCours === false
            && document.getElementById('eval_c1')?.value === 'M'
            && document.getElementById('comm_c1')?.textContent.trim() !== '';
    }, null, { timeout: 15000 });
    // Les chargeurs réappliquent la cartouche par minuteries (200-300 ms) : on les laisse passer.
    await page.waitForTimeout(1200);
    // L'ouverture arme elle-même un enregistrement automatique (débounce) : on le laisse écrire.
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value)).toBe('CT939');
    expect(await page.evaluate(() => !!document.getElementById('overlay-ui-dialogue')), 'aucune confirmation à l\'ouverture').toBe(false);
}

/** Le geste : l'enseignant choisit une cartouche au menu. */
async function choisirAuMenu(page, cartoucheId) {
    await page.evaluate((id) => {
        const s = document.getElementById('selectCartoucheEval');
        s.value = id;
        s.dispatchEvent(new Event('change', { bubbles: true }));
    }, cartoucheId);
}

async function dialogue(page) {
    await page.waitForSelector('#overlay-ui-dialogue', { timeout: 5000 });
    return page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        return {
            message: o.querySelector('.modal-section').textContent,
            boutons: Array.from(o.querySelectorAll('.modal-actions button')).map(b => b.textContent),
            menu: document.getElementById('selectCartoucheEval').value
        };
    });
}

async function repondre(page, libelle) {
    await page.evaluate((l) => Array.from(document.querySelectorAll('#overlay-ui-dialogue button')).find(b => b.textContent === l).click(), libelle);
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
}

async function copierTout(page) {
    const avant = await page.evaluate(() => window._presse939.length);
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Copier tout').click());
    await page.waitForFunction((n) => window._presse939.length > n, avant, { timeout: 10000 });
    return page.evaluate(() => window._presse939[window._presse939.length - 1]);
}

const enBase = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV939'), T);
const divs = (page) => page.evaluate(() => ({
    c1: document.getElementById('comm_c1').textContent.trim(),
    c2: document.getElementById('comm_c2').textContent.trim()
}));
/** Ce que le PDF imprime : le constructeur de la synthèse, sur l'évaluation enregistrée. */
const pdf = (page) => page.evaluate((T) => {
    const ev = window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV939');
    return Object.fromEntries(window.syntheseRetroactionData.construireFeedback(ev, null, null).criteria.map(c => [c.key, c.comment]));
}, T);

test('#944 · copie évaluée, autre cartouche choisie au menu, « Remplacer » : les commentaires de la nouvelle cartouche partout, puis de nouveau protégés', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirLaCopie(page);
    expect((await divs(page)).c1).toBe(ENREGISTRE);

    await choisirAuMenu(page, 'CT939R');
    const d = await dialogue(page);
    expect(d.message).toBe('Remplacer les commentaires de cette copie par ceux de la cartouche « Cartouche témoin (rev) » ? '
        + 'Les retouches faites à la main dans la rétroaction de cette copie seront perdues.');
    expect(d.boutons).toEqual(['Garder les commentaires actuels', 'Remplacer']);
    expect(d.menu, 'le temps de la question, le menu garde l\'ancienne cartouche').toBe('CT939');

    await repondre(page, 'Remplacer');
    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value)).toBe('CT939R');
    expect(await divs(page)).toEqual({ c1: NOUVEAU_C1, c2: NOUVEAU_C2 });
    const generaleEcran = await page.evaluate(() => document.getElementById('retroactionFinale1').value);
    expect(generaleEcran).toContain('Critère 1 (Contenu) — M\n' + NOUVEAU_C1);
    expect(generaleEcran).not.toContain(ENREGISTRE);

    const copie = await copierTout(page);
    expect(copie).toContain(NOUVEAU_C1);
    expect(copie).toContain(NOUVEAU_C2);
    expect(copie).not.toContain(ENREGISTRE);

    // Le prochain enregistrement fixe les nouveaux commentaires.
    await page.evaluate(() => window.sauvegarderEvaluationModifiee());
    await page.waitForFunction((T) => {
        const ev = window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV939');
        return ev && ev.cartoucheId === 'CT939R';
    }, T, { timeout: 10000 });
    const ev = await enBase(page);
    expect(Object.fromEntries(ev.criteres.map(c => [c.critereId, c.retroaction]))).toEqual({ c1: NOUVEAU_C1, c2: NOUVEAU_C2 });
    expect(await pdf(page)).toEqual({ c1: NOUVEAU_C1, c2: NOUVEAU_C2 });
    expect(await copierTout(page)).toContain(NOUVEAU_C1);

    // … qui redeviennent protégés par #939 : la cartouche révisée retouchée en arrière-plan n'y touche plus.
    await page.evaluate((T) => {
        const cs = window.db.getSync(T + '_cartouches_G939', []);
        cs.find(c => c.id === 'CT939R').commentaires.c1_M = 'RETOUCHÉE APRÈS COUP';
        window.db.setSync(T + '_cartouches_G939', cs);
        const s = document.getElementById('eval_c1');
        s.value = 'M';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    }, T);
    expect((await divs(page)).c1).toBe(NOUVEAU_C1);

    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test('#944 · même geste, « Garder les commentaires actuels » : le menu revient, rien ne change, cartoucheId compris', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirLaCopie(page);
    const avant = JSON.stringify(await enBase(page));

    await choisirAuMenu(page, 'CT939R');
    await dialogue(page);
    await repondre(page, 'Garder les commentaires actuels');

    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value)).toBe('CT939');
    expect(await divs(page)).toEqual({ c1: ENREGISTRE, c2: '' });
    expect(JSON.stringify(await enBase(page)), 'rien d\'écrit en base').toBe(avant);
    expect(await copierTout(page)).not.toContain('NOUVEAU');

    // Et l'enregistrement qui suit garde la cartouche et les commentaires d'alors.
    await page.evaluate(() => window.sauvegarderEvaluationModifiee());
    await page.waitForFunction((T) => {
        const ev = window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV939');
        return ev && ev.criteres.find(c => c.critereId === 'c2')?.retroaction !== '[Non défini]';
    }, T, { timeout: 10000 });
    const ev = await enBase(page);
    expect(ev.cartoucheId).toBe('CT939');
    expect(ev.criteres.find(c => c.critereId === 'c1').retroaction).toBe(ENREGISTRE);
    expect((await pdf(page)).c1).toBe(ENREGISTRE);

    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

// #945 (25 sept. 2026) — Entrée suit le bouton qui a le focus : dans cette confirmation
// « danger », le focus part sur « Garder les commentaires actuels ». Une vraie frappe au clavier.
test('#945 · même geste, touche Entrée : rien n\'est remplacé ni écrit ; Tab jusqu\'au bouton rouge puis Entrée remplace', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirLaCopie(page);
    const avant = JSON.stringify(await enBase(page));

    await choisirAuMenu(page, 'CT939R');
    await dialogue(page);
    expect(await page.evaluate(() => document.activeElement && document.activeElement.textContent)).toBe('Garder les commentaires actuels');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value)).toBe('CT939');
    expect(await divs(page)).toEqual({ c1: ENREGISTRE, c2: '' });
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
    expect(JSON.stringify(await enBase(page)), 'rien d\'écrit en base').toBe(avant);

    // Le focus déplacé sur le bouton rouge : Entrée confirme, comme le ferait ce bouton.
    await choisirAuMenu(page, 'CT939R');
    await dialogue(page);
    await page.evaluate(() => Array.from(document.querySelectorAll('#overlay-ui-dialogue button')).find(b => b.textContent === 'Remplacer').focus());
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value)).toBe('CT939R');
    expect(await divs(page)).toEqual({ c1: NOUVEAU_C1, c2: NOUVEAU_C2 });

    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test.describe('iPad', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 820, height: 1180 } });
test('#944 · les deux boutons de la confirmation sont des cibles tactiles (iPad, 44 px)', async ({ page }) => {
    await monter(page);
    await ouvrirLaCopie(page);
    await choisirAuMenu(page, 'CT939R');
    await dialogue(page);
    const hauteurs = await page.evaluate(() => Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button'))
        .map(b => Math.round(b.getBoundingClientRect().height)));
    for (const h of hauteurs) expect(h).toBeGreaterThanOrEqual(44);
});
});
