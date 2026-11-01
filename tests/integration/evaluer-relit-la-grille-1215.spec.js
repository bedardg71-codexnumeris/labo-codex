import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1215 (1er nov. 2026) — ÉVALUER RELIT LA GRILLE QUAND ELLE CHANGE, SANS PERDRE LA SAISIE.
//
// Mesuré avant le correctif, sur ce parcours (critère algorithmique passé de 20 à 30) : une frappe après
// le détour enregistrait 17,50/30 au lieu de 27,50/30, soit une note finale de 74,25 au lieu de 75,5, et
// le PDF de l'élève l'imprimait. Trois lots de gardes : le calcul lit la grille (la SOURCE, éprouvée par
// une écriture de grille qui n'annonce rien) ; l'affichage suit (le détour réel) ; rien ne s'écrit à la
// relecture. La référence de chaque note est une copie ouverte APRÈS le changement de grille.
// Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const GRILLE = 'G1215', COPIE = 'FT1215', EVAL = 'EV1215', DA = 'TEST1215', T = 't1215', CARTOUCHE = 'K1215';
const NOUVEAUX_POIDS = { 0: 30, 1: 30, 2: 40 };   // Contenu 50 → 30, Français écrit 20 → 30, Structure 30 → 40

async function monter(page, options = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(({ png, T, GRILLE, COPIE, EVAL, DA, CARTOUCHE, options }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        if (window.backupReminder) window.backupReminder.desactiverRappels();
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: 'cours-1215', codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1215', trimestreId: T, coursId: 'cours-1215', groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: 'cours-1215', codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1215' });
        window.db.setSync('groupeCoursActif', { id: 'GC1215', trimestreId: T });
        const coursId = 'cours-1215', GC = 'GC1215';
        const criteres = [
            { id: 'c1', nom: 'Contenu', ponderation: 50, type: 'holistique' },
            { id: 'c2', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: 'nombre d\'erreurs / nombre de mots' },
            { id: 'c3', nom: 'Structure', ponderation: 30, type: 'analytique' }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const ajouter = (k, items) => window.db.setSync(k, (window.db.getSync(k, []) || []).concat(items));
        ajouter(T + '_grillesTemplates', [{ id: GRILLE, nom: 'Grille fictive', type: 'holistique', criteres }]);
        ajouter(T + '_echellesTemplates', [{ id: 'E1215', nom: 'IDME', niveaux }]);
        ajouter(T + '_productions', [{ id: 'p1215', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: GRILLE, echelleId: 'E1215', coursId, groupeCoursId: GC }]);
        ajouter(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: GC }]);
        if (options.cartouche) {
            window.db.setSync(T + '_cartouches_' + GRILLE, [{ id: CARTOUCHE, nom: 'Cartouche fictive', commentaires: { c1_M: 'Commentaire fictif M', c1_E: 'Commentaire fictif E' } }]);
        }
        if (options.categories) window.db.setSync(T + '_modalitesEvaluation', { activerCategorisationErreurs: true });
        ajouter(T + '_evaluationsSauvegardees', [{
            id: EVAL, etudiantDA: DA, productionId: 'p1215', groupeCoursId: GC, coursId, grilleId: GRILLE, grilleNom: 'Grille fictive', echelleId: 'E1215',
            cartoucheId: options.cartouche ? CARTOUCHE : '',
            statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-15T08:00:00.000Z',
            noteFinale: 82.33333333333333, niveauFinal: 'M', verrouillee: options.verrouillee === true, ponderationCouverte: 100,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 50, retroaction: '' },
                { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: 'E', ponderation: 20, retroaction: 'Phrase fictive' },
                { critereId: 'c3', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 30, points: 24, retroaction: '' }
            ],
            donneesAlgorithmiques: { c2: { erreurs: 2, mots: 600, noteCalculee: 18.333333333333332, pourcentage: 91.66666666666666, niveau: 'E', retroaction: 'Phrase fictive' } },
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: { c3: 24 },
            optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        }]);
        ajouter(T + '_fichiersTravaux', [{
            id: COPIE, etudiantDA: DA, productionId: 'p1215', coursId, groupeCoursId: GC, nomFichier: 'FICTIF_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z', source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const blob = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === COPIE ? blob : original.apply(this, arguments); };
    }, { png: PNG, T, GRILLE, COPIE, EVAL, DA, CARTOUCHE, options });
    return erreurs;
}

async function ouvrirDansAnnoter(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction((id) => !!document.querySelector(`#evaluations-contenu-fichiers [data-fichier-id="${id}"]`), COPIE, { timeout: 15000 });
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), COPIE);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, COPIE, { timeout: 10000 });
}

async function ouvrirDansEvaluer(page) {
    await ouvrirDansAnnoter(page);
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => document.getElementById('eval_mots_c2') && window.evaluationEnCours && !!window.evaluationEnCours.idModification, null, { timeout: 15000 });
    await page.waitForTimeout(3000);   // les minuteries de l'ouverture (+2 s), qui recalculent et rechargent
    await page.waitForFunction(() => !window._timerAutoSave && !(window._chargementsEvaluationEnCours > 0), null, { timeout: 10000 });
}

/** Les vrais champs de la vraie section des grilles, à `change`, comme au blur ; puis le retour sans rouvrir la copie. */
async function changerLaGrille(page, poids = NOUVEAUX_POIDS) {
    await page.evaluate(() => window.naviguerVers('conception', 'grille-criteres'));
    await page.evaluate((id) => window.chargerGrillePourModif(id), GRILLE);
    for (const [index, valeur] of Object.entries(poids)) {
        const s = `[data-on-change="modifierCritereGrilleHandler"][data-grille-id="${GRILLE}"][data-critere-index="${index}"][data-champ="ponderation"]`;
        await page.waitForFunction((s) => !!document.querySelector(s), s, { timeout: 10000 });
        await page.evaluate(({ s, valeur }) => {
            const el = document.querySelector(s);
            el.value = String(valeur);
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, { s, valeur });
        await page.waitForFunction(({ GRILLE, index, valeur }) => {
            const g = window.db.getSync(window.cle('grillesTemplates'), []).find((x) => x.id === GRILLE);
            return Number(g.criteres[index].ponderation) === Number(valeur);
        }, { GRILLE, index, valeur }, { timeout: 10000 });
    }
}

async function revenir(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => { const s = document.getElementById('evaluations-annoter'); return !!s && s.offsetParent !== null; }, null, { timeout: 10000 });
    await page.waitForTimeout(600);
}

/** Une écriture de grille qui n'annonce RIEN (comme `materiel-creation.js`, verdict de #1213, trouvaille 4). */
const ecrireGrilleSansAnnonce = (page, poids = { c1: 30, c2: 30, c3: 40 }) => page.evaluate(({ T, GRILLE, poids }) => {
    const g = window.db.getSync(T + '_grillesTemplates', []);
    g.find((x) => x.id === GRILLE).criteres.forEach((c) => { c.ponderation = poids[c.id]; });
    window.db.setSync(T + '_grillesTemplates', g);
}, { T, GRILLE, poids });

const taper = (page, id, valeur) => page.evaluate(({ id, valeur }) => {
    const el = document.getElementById(id);
    el.value = String(valeur);
    el.dispatchEvent(new Event('input', { bubbles: true }));
}, { id, valeur });

const choisir = (page, id, valeur) => page.evaluate(({ id, valeur }) => {
    const el = document.getElementById(id);
    el.value = valeur;
    el.dispatchEvent(new Event('change', { bubbles: true }));
}, { id, valeur });

const attendreEcriture = async (page) => {
    await page.waitForTimeout(200);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
    await page.waitForTimeout(200);
};

const base = (page) => page.evaluate(({ T, EVAL }) => window.db.getSync(T + '_evaluationsSauvegardees', []).find((x) => x.id === EVAL), { T, EVAL });

const ecran = (page) => page.evaluate(() => {
    const valeur = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
    return {
        erreurs: valeur('eval_erreurs_c2'), mots: valeur('eval_mots_c2'), points: valeur('eval_pts_c3'),
        niveauC1: valeur('eval_c1'), menuC2: valeur('eval_c2'), retroaction: valeur('retroactionFinale1'),
        maxPoints: (document.getElementById('eval_pts_c3') || {}).max,
        entetes: [...document.querySelectorAll('#listeCriteresGrille1 .eval-critere-header')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
        resultatAlgo: (document.getElementById('resultat_algo_c2') || { textContent: '' }).textContent.replace(/\s+/g, ' '),
        note: (document.getElementById('noteProduction1') || {}).textContent,
        noteCourante: window.noteCalculeeCourante
    };
});

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test.setTimeout(120000);

test('#1215 · le parcours : un niveau et des erreurs saisis, le détour, le retour — la saisie reste, le poids et la note sont les nouveaux', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirDansEvaluer(page);
    // Aucune écriture pendant la saisie : ce qui revient ne peut venir que du FORMULAIRE, pas de la base.
    await page.evaluate(() => {
        window._autoSaveSuspendu = true;
        window.__carte1215 = document.querySelector('#listeCriteresGrille1 .eval-critere-carte');
        document.getElementById('eval_erreurs_c2').dataset.da = window.evaluationEnCours.etudiantDA;   // la marque de copie (#671)
    });
    await choisir(page, 'eval_c1', 'E');
    await taper(page, 'eval_erreurs_c2', 3);
    await taper(page, 'eval_mots_c2', 600);
    await taper(page, 'eval_pts_c3', 26);
    await taper(page, 'retroactionFinale1', 'Rétroaction fictive tapée');
    expect((await base(page)).pointsAnalytiques.c3, 'rien n\'est écrit : la base garde 24').toBe(24);

    await changerLaGrille(page);
    await revenir(page);

    const e = await ecran(page);
    expect(await page.evaluate(() => window.__carte1215 !== document.querySelector('#listeCriteresGrille1 .eval-critere-carte')), 'le formulaire a bien été rebâti').toBe(true);
    expect(await page.evaluate(() => document.getElementById('eval_erreurs_c2').dataset.da), 'la marque de copie #671 survit').toBe(DA);
    expect(e.niveauC1, 'le niveau choisi reste').toBe('E');
    expect(e.erreurs, 'le nombre d\'erreurs tapé reste').toBe('3');
    expect(e.mots).toBe('600');
    expect(e.points, 'les points tapés restent').toBe('26');
    expect(e.retroaction, 'la rétroaction tapée reste, au mot près').toBe('Rétroaction fictive tapée');
    expect(e.entetes[0]).toContain('30');
    expect(e.entetes[1]).toContain('30');
    expect(e.entetes[2]).toContain('40');
    expect(e.maxPoints).toBe('40');
    expect(e.resultatAlgo, 'la ligne du résultat dit le nouveau poids').toContain('27,50/30');
    // 95 × 30 % + 91,67 × 30 % + 26/40 × 40 % = 28,5 + 27,5 + 26
    expect(e.noteCourante).toBeCloseTo(82, 5);

    // Le prochain geste enregistre : la note et le PDF partent de la nouvelle pondération.
    await page.evaluate(() => { window._autoSaveSuspendu = false; });
    await taper(page, 'retroactionFinale1', 'Rétroaction fictive tapée, suite');
    await attendreEcriture(page);
    const b = await base(page);
    expect(b.noteFinale).toBeCloseTo(82, 5);
    expect(b.donneesAlgorithmiques.c2.noteCalculee).toBeCloseTo(27.5, 5);
    expect(b.criteres.map((c) => c.ponderation)).toEqual([30, 30, 40]);
    const lignePdf = await page.evaluate(({ T, COPIE, b }) => {
        const f = window.db.getSync(T + '_fichiersTravaux', []).find((x) => x.id === COPIE);
        const div = document.createElement('div');
        div.innerHTML = window.syntheseRetroactionRendu.rendreSyntheseHTML(window.syntheseRetroactionData.construireFeedback(b, f, null));   // security-ok: données fictives du banc
        return div.textContent.replace(/\s+/g, ' ');
    }, { T, COPIE, b });
    expect(lignePdf, 'ce que l\'élève lirait').toContain('27,50/30');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1215 · relire n\'écrit rien : ni l\'évaluation, ni un enregistrement armé, ni un versement au champ', async ({ page }) => {
    const erreurs = await monter(page);
    await ouvrirDansEvaluer(page);
    const avant = await base(page);
    await page.evaluate(() => {
        window.__inputs1215 = 0;
        document.addEventListener('input', () => { window.__inputs1215++; }, true);
        document.addEventListener('change', () => { window.__inputs1215++; }, true);
    });
    // La relecture est synchrone : ce qu'elle arme se lit juste après l'événement, sans dépendre d'une attente.
    await ecrireGrilleSansAnnonce(page);
    const pendant = await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return {
            evenements: window.__inputs1215,
            arme: !!window._timerAutoSave || !!window._pendingAutoSaveSnapshot,
            compteur: window._chargementsEvaluationEnCours,
            relu: (document.getElementById('eval_pts_c3') || {}).max
        };
    });
    expect(pendant.relu, 'témoin : la relecture a eu lieu').toBe('40');
    expect(pendant.evenements, 'aucun événement').toBe(0);
    expect(pendant.arme, 'aucun enregistrement armé').toBe(false);
    expect(pendant.compteur, 'le compteur de chargement est rendu').toBe(0);
    await page.waitForTimeout(2200);
    expect(await base(page), 'l\'évaluation est intacte, à l\'octet').toEqual(avant);
    // 80 × 30 % + 94,44 × 30 % + 60 % × 40 % : l'écran suit, pour le prochain geste.
    const e = await ecran(page);
    expect(e.noteCourante).toBeCloseTo(76.3333, 3);
    expect(e.retroaction, 'le texte généré suit la note, à l\'écran seulement').toContain('76,3');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1215 · une copie verrouillée : sa note remise ne bouge pas, ses champs restent figés', async ({ page }) => {
    const erreurs = await monter(page, { verrouillee: true });
    await ouvrirDansEvaluer(page);
    const avant = await base(page);
    expect((await ecran(page)).note, 'témoin : la note remise à l\'écran').toContain('82,3');
    // Le texte que l'écran montre, marqué : la relecture ne le régénère pas sur une copie verrouillée.
    await page.evaluate(() => { document.getElementById('retroactionFinale1').value = 'Texte affiché fictif'; });
    expect(await page.evaluate(() => document.getElementById('eval_mots_c2').disabled)).toBe(true);

    await changerLaGrille(page);
    await revenir(page);

    const etat = await page.evaluate(() => ({
        entete: document.querySelector('#listeCriteresGrille1 .eval-critere-header').textContent,
        figes: ['eval_c1', 'eval_erreurs_c2', 'eval_mots_c2', 'eval_pts_c3'].map((id) => document.getElementById(id).disabled)
    }));
    expect(etat.entete, 'témoin : le formulaire a relu la grille').toContain('30');
    expect(etat.figes, 'le verrou reste sur les champs rebâtis').toEqual([true, true, true, true]);
    const e = await ecran(page);
    expect(e.retroaction, 'le texte affiché reste, le générateur n\'y passe pas').toBe('Texte affiché fictif');
    expect(e.note, 'la note remise reste à l\'écran').toContain('82,3');
    expect(e.noteCourante).toBeCloseTo(82.3333, 3);
    await page.waitForTimeout(2200);
    expect(await base(page), 'rien n\'est écrit').toEqual(avant);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1215 · une copie verrouillée, le poids baisse sous ses points : la note remise et la base ne bougent pas', async ({ page }) => {
    await monter(page, { verrouillee: true });
    await ouvrirDansEvaluer(page);
    const avant = await base(page);
    await changerLaGrille(page, { 0: 60, 2: 20 });   // Structure 30 → 20, 24 points remis
    await revenir(page);
    const e = await ecran(page);
    expect(e.maxPoints, 'témoin : le formulaire a relu la grille').toBe('20');
    expect(e.note, 'la note remise reste à l\'écran').toContain('82,3');
    expect(e.noteCourante).toBeCloseTo(82.3333, 3);
    await page.waitForTimeout(2200);
    expect(await base(page), 'rien n\'est écrit').toEqual(avant);
});

test('#1215 · la SOURCE : une grille changée SANS annonce, la frappe calcule quand même sur le poids d\'aujourd\'hui', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await ecrireGrilleSansAnnonce(page);
    expect(await page.evaluate(() => document.getElementById('eval_erreurs_c2').dataset.ponderation), 'témoin : l\'attribut est périmé').toBe('20');
    await taper(page, 'eval_erreurs_c2', 3);
    await taper(page, 'eval_pts_c3', 35);
    expect((await ecran(page)).points, 'le maximum est le poids d\'aujourd\'hui (40), pas l\'attribut (30)').toBe('35');
    await attendreEcriture(page);
    const b = await base(page);
    expect(b.donneesAlgorithmiques.c2.noteCalculee).toBeCloseTo(27.5, 5);
    expect(b.donneesAlgorithmiques.c2.pourcentage).toBeCloseTo(91.6667, 3);
    expect(b.pointsAnalytiques.c3).toBe(35);
    // 80 × 30 % + 91,67 × 30 % + 35/40 × 40 % = 24 + 27,5 + 35
    expect(b.noteFinale).toBeCloseTo(86.5, 5);
});

test('#1215 · un geste qui ne recalcule pas (la rétroaction) écrit la note de la nouvelle grille', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await changerLaGrille(page);
    await revenir(page);
    await taper(page, 'retroactionFinale1', 'Texte fictif');
    await attendreEcriture(page);
    const b = await base(page);
    expect(b.noteFinale, 'et non 82,33, la note de la grille d\'avant').toBeCloseTo(76.3333, 3);
    expect(b.donneesAlgorithmiques.c2.noteCalculee, 'et non 18,33').toBeCloseTo(28.3333, 3);
    expect(b.retroactionFinale).toBe('Texte fictif');
});

test('#1215 · un niveau choisi à la main sur un critère algorithmique reste choisi', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await choisir(page, 'eval_c2', 'D');
    await attendreEcriture(page);
    await changerLaGrille(page);
    await revenir(page);
    const e = await ecran(page);
    expect(e.menuC2, 'le menu garde le niveau choisi').toBe('D');
    expect(e.erreurs).toBe('2');
    // 80 × 30 % + 65 (D, la valeur du niveau) × 30 % + 60 % × 40 %
    expect(e.noteCourante).toBeCloseTo(67.5, 5);
    expect(e.retroaction, 'le texte généré dit la note du niveau choisi, pas celle du calcul').toContain('67,5');
});

test('#1215 · le poids baisse sous les points : ramenés au maximum, à l\'écran seulement, comme à l\'ouverture', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await changerLaGrille(page, { 0: 60, 2: 20 });   // Structure 30 → 20, 24 points saisis
    await revenir(page);
    const e = await ecran(page);
    expect(e.maxPoints).toBe('20');
    expect(e.points).toBe('20');
    expect((await base(page)).pointsAnalytiques.c3, 'rien n\'est écrit avant un geste').toBe(24);
});

test('#1215 · un critère ajouté et un critère retiré : les avis existants le disent, la saisie des autres reste', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await choisir(page, 'eval_c1', 'E');
    await attendreEcriture(page);
    const avant = await base(page);
    await page.evaluate(({ T, GRILLE }) => {
        const g = window.db.getSync(T + '_grillesTemplates', []);
        const grille = g.find((x) => x.id === GRILLE);
        // L'identifiant porte la naissance du critère (#705) : ici, le 26 oct., après l'évaluation du 15.
        grille.criteres = grille.criteres.filter((c) => c.id !== 'c3').concat([{ id: 'CR1793000000000', nom: 'Critère ajouté fictif', ponderation: 30, type: 'holistique' }]);
        window.db.setSync(T + '_grillesTemplates', g);
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
    }, { T, GRILLE });
    const etat = await page.evaluate(() => ({
        horsGrille: (document.getElementById('avisCriteresHorsGrille') || {}).textContent || '',
        ajoute: (document.getElementById('avisCriteresAjoutesDepuis') || {}).textContent || '',
        champAjoute: !!document.getElementById('eval_CR1793000000000'),
        champRetire: !!document.getElementById('eval_pts_c3'),
        niveauC1: document.getElementById('eval_c1').value,
        erreurs: document.getElementById('eval_erreurs_c2').value
    }));
    expect(etat.horsGrille).toContain('Structure');
    expect(etat.ajoute).toContain('Critère ajouté fictif');
    expect(etat.champAjoute).toBe(true);
    expect(etat.champRetire).toBe(false);
    expect(etat.niveauC1).toBe('E');
    expect(etat.erreurs).toBe('2');
    await page.waitForTimeout(2000);
    expect(await base(page), 'rien n\'est écrit').toEqual(avant);
});

test('#1215 · avec une cartouche et des codes catégorisés : l\'autre rendu, et le handler catégoriel lit la grille', async ({ page }) => {
    await monter(page, { cartouche: true, categories: true });
    await ouvrirDansEvaluer(page);
    expect(await page.evaluate(() => document.getElementById('selectCartoucheEval').value), 'témoin : la cartouche est celle de la copie').toBe(CARTOUCHE);
    await page.waitForFunction(() => !!document.getElementById('eval_categories_c2'), null, { timeout: 10000 });
    await page.evaluate(() => { window._autoSaveSuspendu = true; });
    await taper(page, 'eval_categories_c2', '1;2;1');
    await choisir(page, 'eval_c1', 'E');
    const commentaire = await page.evaluate(() => document.getElementById('comm_c1').textContent);
    expect(commentaire, 'témoin : la cartouche a parlé').toContain('Commentaire fictif E');

    await changerLaGrille(page);
    await revenir(page);

    const etat = await page.evaluate(() => ({
        codes: document.getElementById('eval_categories_c2').value,
        attribut: document.getElementById('eval_categories_c2').dataset.ponderation,
        niveauC1: document.getElementById('eval_c1').value,
        commentaire: document.getElementById('comm_c1').textContent,
        resultat: document.getElementById('resultat_algo_c2').textContent
    }));
    expect(etat.codes, 'les codes tapés restent').toBe('1;2;1');
    expect(etat.attribut).toBe('30');
    expect(etat.niveauC1).toBe('E');
    expect(etat.commentaire).toContain('Commentaire fictif E');
    expect(etat.resultat).toContain('/30');

    // Le handler catégoriel : sans annonce, l'attribut reste à 30 et le poids d'aujourd'hui est 25.
    await ecrireGrilleSansAnnonce(page, { c1: 35, c2: 25, c3: 40 });
    await taper(page, 'eval_categories_c2', '1;2;1;1');
    const algo = await page.evaluate(() => window.evaluationEnCours && (typeof evaluationEnCours !== 'undefined' ? evaluationEnCours : window.evaluationEnCours).donneesAlgorithmiques.c2);
    expect(algo.noteCalculee / (algo.pourcentage / 100), 'la note et son pourcentage disent le poids d\'aujourd\'hui').toBeCloseTo(25, 5);
});

test('#1215 · avec une cartouche, son rendu rejoue les niveaux : relire n\'arme toujours rien', async ({ page }) => {
    await monter(page, { cartouche: true });
    await ouvrirDansEvaluer(page);
    const avant = await base(page);
    await ecrireGrilleSansAnnonce(page);
    const arme = await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return { arme: !!window._timerAutoSave || !!window._pendingAutoSaveSnapshot, relu: document.getElementById('eval_pts_c3').max, cartouche: document.getElementById('selectCartoucheEval').value };
    });
    expect(arme).toEqual({ arme: false, relu: '40', cartouche: CARTOUCHE });
    await page.waitForTimeout(2200);
    expect(await base(page)).toEqual(avant);
});

test('#1215 · un enregistrement déjà en attente part avec l\'état relu, pas avec son vieil instantané', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await ecrireGrilleSansAnnonce(page, { c1: 50, c2: 20, c3: 30 });
    const instantane = await page.evaluate(({ T, GRILLE }) => {
        const champ = document.getElementById('eval_erreurs_c2');
        champ.value = '3';
        champ.dispatchEvent(new Event('input', { bubbles: true }));   // arme l'enregistrement, sur 20
        const g = window.db.getSync(T + '_grillesTemplates', []);
        g.find((x) => x.id === GRILLE).criteres.find((c) => c.id === 'c2').ponderation = 30;
        window.db.setSync(T + '_grillesTemplates', g);
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return window._pendingAutoSaveSnapshot.donneesAlgorithmiques.c2.noteCalculee;
    }, { T, GRILLE });
    expect(instantane).toBeCloseTo(27.5, 5);
});

test('#1215 · hors du formulaire : une autre clé, ou le mode Annoter, ne rebâtit rien', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    const memeCarte = (page) => page.evaluate(() => document.querySelector('#listeCriteresGrille1 .eval-critere-carte') === window.__carte1215);
    await page.evaluate(() => {
        window.__carte1215 = document.querySelector('#listeCriteresGrille1 .eval-critere-carte');
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('productions') } }));
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: {} }));
    });
    expect(await memeCarte(page), 'une autre clé, ou aucune').toBe(true);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } })));
    expect(await memeCarte(page), 'témoin : la clé des grilles rebâtit').toBe(false);

    await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
    await page.waitForFunction(() => window.travauxUI.getModeCourant() !== 'evaluer', null, { timeout: 10000 });
    await page.evaluate(() => {
        window.__carte1215 = document.querySelector('#listeCriteresGrille1 .eval-critere-carte');
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
    });
    expect(await memeCarte(page), 'en Annoter : l\'entrée dans Évaluer bâtira neuf').toBe(true);
});

test('#1215 · rien à relire sans risque : une grille supprimée, rien de bâti, un chargement en cours — le formulaire ne bouge pas', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await page.evaluate(() => { window._autoSaveSuspendu = true; });
    await taper(page, 'eval_mots_c2', 700);
    const relire = () => page.evaluate(() => {
        window.__carte1215 = document.querySelector('#listeCriteresGrille1 .eval-critere-carte');
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return document.querySelector('#listeCriteresGrille1 .eval-critere-carte') === window.__carte1215;
    });

    // Un chargement en cours : le chargeur lit la grille lui-même.
    await page.evaluate(() => { window._chargementsEvaluationEnCours = 1; });
    expect(await relire(), 'chargement en cours').toBe(true);
    await page.evaluate(() => { window._chargementsEvaluationEnCours = 0; });

    // La grille supprimée : le rendu écrirait « Grille introuvable » par-dessus la saisie.
    const grilles = await page.evaluate(({ T }) => {
        const g = window.db.getSync(T + '_grillesTemplates', []);
        window.db.setSync(T + '_grillesTemplates', []);
        return g;
    }, { T });
    expect(await relire(), 'grille supprimée').toBe(true);
    expect((await ecran(page)).mots, 'la saisie reste').toBe('700');
    await page.evaluate(({ T, grilles }) => window.db.setSync(T + '_grillesTemplates', grilles), { T, grilles });

    // Rien de bâti (« Non reçu », attente d'échelle) : le message reste, aucun formulaire n'apparaît.
    const attente = await page.evaluate(() => {
        const zone = document.getElementById('listeCriteresGrille1');
        window.__zone1215 = zone.innerHTML;
        zone.innerHTML = '<p class="eval-texte-italic-gris">Texte d\'attente fictif</p>';   // security-ok: littéral du banc
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return zone.textContent;
    });
    expect(attente).toBe('Texte d\'attente fictif');

    // Témoin : les trois conditions levées, la même annonce rebâtit.
    await page.evaluate(() => { document.getElementById('listeCriteresGrille1').innerHTML = window.__zone1215; });   // security-ok: le HTML du formulaire, relu du DOM
    expect(await relire(), 'témoin').toBe(false);
});

test('#1215 · la grille renommée : le menu des grilles porte le nouveau nom, la même grille reste choisie', async ({ page }) => {
    await monter(page);
    await ouvrirDansEvaluer(page);
    await page.evaluate(({ T, GRILLE }) => {
        const g = window.db.getSync(T + '_grillesTemplates', []);
        g.find((x) => x.id === GRILLE).nom = 'Grille fictive renommée';
        window.db.setSync(T + '_grillesTemplates', g);
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
    }, { T, GRILLE });
    const menu = await page.evaluate(() => {
        const s = document.getElementById('selectGrille1');
        return { valeur: s.value, texte: s.selectedOptions[0].textContent };
    });
    expect(menu).toEqual({ valeur: GRILLE, texte: 'Grille fictive renommée' });
});
