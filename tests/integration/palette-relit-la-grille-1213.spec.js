import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1213 (1er nov. 2026) — LA PALETTE D'ANNOTER RELIT LA GRILLE QUAND ELLE CHANGE.
//
// Vécu par Grégoire (iPad, 1.229.0) : une copie ouverte dans Annoter, un détour par la grille pour
// préciser le texte de quelques codes, et la palette montre encore l'ancien texte ; après un
// rechargement, tout y est. Les modifications étaient écrites : la palette ne relisait pas.
//
// Le parcours est le vrai : la vraie navigation, le vrai champ du sous-critère, sans recharger ni
// rouvrir la copie. Le mode réel et la démo (`demo_grillesTemplates`) ont chacun leur essai : la clé
// de l'écouteur est celle que `codesAnnotation` résout. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const GRILLE = 'G1213', COPIE = 'FT1213', EVAL = 'EV1213', DA = 'TEST1213';

/** Sème la copie, sa production, sa grille à codes et son évaluation, dans le namespace `T`. */
async function semer(page, T) {
    await page.evaluate(({ png, T, GRILLE, COPIE, EVAL, DA }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        // Le cours actif : celui du banc, ou celui du pack en démo (la copie doit y être visible).
        const info = window.db.getSync('infoCours', null) || {};
        const coursId = info.id || 'cours-1213';
        const GC = (window.db.getSync('groupeCoursActif', null) || {}).id || 'GC1213';
        const groupe = info.groupe || '01';
        const sc = (code, nom, ponderation) => ({ id: 'sc_' + code, code, nom, ponderation, retroaction: 'Texte fictif ' + code });
        const criteres = [
            { id: 'c1', nom: 'Contenu', ponderation: 80, type: 'holistique' },
            { id: 'c2', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: 'nombre d\'erreurs / nombre de mots',
                codesDepuisSousCriteres: true, sousCriteres: [sc('1', 'Nom fictif d\'avant', 1), sc('2', 'Autre code fictif', 1)] }
        ];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const ajouter = (k, items) => window.db.setSync(k, (window.db.getSync(k, []) || []).concat(items));
        ajouter(T + '_grillesTemplates', [{ id: GRILLE, nom: 'Grille fictive', type: 'holistique', criteres }]);
        ajouter(T + '_echellesTemplates', [{ id: 'E1213', nom: 'IDME', niveaux }]);
        ajouter(T + '_productions', [{ id: 'p1213', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: GRILLE, echelleId: 'E1213', coursId, groupeCoursId: GC }]);
        ajouter(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Alpha', groupe, coursId, groupeCoursId: GC }]);
        ajouter(T + '_evaluationsSauvegardees', [{
            id: EVAL, etudiantDA: DA, productionId: 'p1213', groupeCoursId: GC, coursId, grilleId: GRILLE, echelleId: 'E1213',
            statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 82.33333333333333, niveauFinal: 'M',
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 80, retroaction: '' },
                { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: 'E', ponderation: 20, retroaction: 'PHRASE 2' }
            ],
            donneesAlgorithmiques: { c2: { erreurs: 2, mots: 600, noteCalculee: 18.333333333333332, pourcentage: 91.66666666666666, niveau: 'E', retroaction: 'PHRASE 2' } },
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {},
            optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        }]);
        ajouter(T + '_fichiersTravaux', [{
            id: COPIE, etudiantDA: DA, productionId: 'p1213', coursId, groupeCoursId: GC,
            nomFichier: 'FICTIF_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        // Deux codes posés : le total n'est pas nul, le champ d'erreurs a donc de quoi recevoir.
        const pose = (id, type) => ({ id, type, color: '#123456', x1: 0.1, y1: 0.1, x2: 0.2, y2: 0.2 });
        ajouter(T + '_annotationsTravaux', [{
            id: 'ANN_' + COPIE, fichierId: COPIE, etudiantDA: DA, productionId: 'p1213',
            pages: { 1: { shapes: [pose('S1', 'errfr_1'), pose('S2', 'errfr_2')], textAnnotations: [], stickers: [] } }, version: 1,
            dateCreation: '2026-10-15T08:00:00.000Z', dateModification: '2026-10-15T08:00:00.000Z'
        }]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const blob = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === COPIE ? blob : original.apply(this, arguments); };
    }, { png: PNG, T, GRILLE, COPIE, EVAL, DA });
}

async function demarrer(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function', null, { timeout: 30000 });
    await page.evaluate(() => { if (window.backupReminder) window.backupReminder.desactiverRappels(); });
    return erreurs;
}

async function monterTrimestre(page) {
    const erreurs = await demarrer(page);
    const T = 't1213';
    await page.evaluate((T) => {
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: 'cours-1213', codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1213', trimestreId: T, coursId: 'cours-1213', groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: 'cours-1213', codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1213' });
        window.db.setSync('groupeCoursActif', { id: 'GC1213', trimestreId: T });
    }, T);
    await semer(page, T);
    return { erreurs, T };
}

async function ouvrirDansAnnoter(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    // L'arrivée lance `initialiserModuleTravaux` à +100 ms : ne pas la croiser, attendre le badge de la copie.
    await page.waitForFunction((id) => !!document.querySelector(`#evaluations-contenu-fichiers [data-fichier-id="${id}"]`), COPIE, { timeout: 15000 });
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), COPIE);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, COPIE, { timeout: 10000 });
    await page.waitForFunction(() => !!document.getElementById('travaux-zone-canvas'), null, { timeout: 10000 });
    // La palette des codes : s'ouvre par son bouton ; ouverte d'office si le mode l'a déjà fait.
    await page.evaluate(() => { if (!document.getElementById('travaux-palette-erreurs-fr')) travauxOutils.togglePaletteErreursFrancais(); });
    await page.waitForFunction(() => !!document.querySelector('#travaux-errfr-contenu .travaux-errfr-nom'), null, { timeout: 10000 });
    await page.waitForFunction((id) => (travauxAnnotation.getAnnotationCourante() || {}).fichierId === id, COPIE, { timeout: 10000 });
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

/** Le vrai champ du sous-critère, dans la vraie section des grilles : `change`, comme au blur. */
async function changerDansLaGrille(page, scIndex, champ, valeur) {
    await page.evaluate(() => window.naviguerVers('conception', 'grille-criteres'));
    await page.evaluate((id) => window.chargerGrillePourModif(id), GRILLE);
    const selecteur = `[data-on-change="modifierSousCritereHandler"][data-grille-id="${GRILLE}"][data-critere-index="1"][data-sc-index="${scIndex}"][data-champ="${champ}"]`;
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur);
        el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { selecteur, valeur });
    await page.waitForFunction(({ GRILLE, champ, scIndex, valeur }) => {
        const g = window.db.getSync(window.cle('grillesTemplates'), []).find((x) => x.id === GRILLE);
        return String(g.criteres[1].sousCriteres[scIndex][champ]) === String(valeur);
    }, { GRILLE, champ, scIndex, valeur }, { timeout: 10000 });
}

async function revenirAAnnoter(page) {
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => {
        const s = document.getElementById('evaluations-annoter');
        return !!s && s.offsetParent !== null && !!document.getElementById('travaux-canvas-annotation');
    }, null, { timeout: 10000 });
}

const nomsDeLaPalette = (page) => page.evaluate(() => [...document.querySelectorAll('#travaux-errfr-contenu .travaux-errfr-nom')].map((n) => n.textContent));
/** La palette, attendue : elle se réécrit à l'arrivée du `donnees-enregistrees`, pas à celle du banc. */
const attendrePalette = (page, noms) => expect.poll(() => nomsDeLaPalette(page), { timeout: 10000 }).toEqual(noms);
const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test.setTimeout(120000);

test('#1213 · le code renommé dans la grille : la palette montre le nouveau nom, sans recharger ni rouvrir', async ({ page }) => {
    const { erreurs } = await monterTrimestre(page);
    await ouvrirDansAnnoter(page);
    expect(await nomsDeLaPalette(page)).toEqual(['Nom fictif d\'avant', 'Autre code fictif']);
    await page.evaluate(() => travauxOutils.setOutilActif('errfr_2'));
    // Une page qu'un rechargement remettrait à zéro : le marqueur doit survivre au parcours.
    await page.evaluate(() => {
        window.__sansRechargement1213 = true;
        // Les codes déjà dessinés sont redessinés : leur numéro se lit à chaque rendu.
        window.__rendus1213 = 0;
        const rendre = travauxAnnotation.reRendreAnnotations;
        travauxAnnotation.reRendreAnnotations = function () { window.__rendus1213++; return rendre.apply(this, arguments); };
        // La palette déplacée par l'usager : elle ne doit être ni recréée, ni replacée.
        window.__palette1213 = document.getElementById('travaux-palette-erreurs-fr');
        window.__palette1213.style.top = '77px';
    });

    await changerDansLaGrille(page, 0, 'nom', 'Nom fictif précisé');
    await revenirAAnnoter(page);

    await attendrePalette(page, ['Nom fictif précisé', 'Autre code fictif']);
    expect(await page.evaluate(() => window.__rendus1213), 'la page est redessinée').toBeGreaterThanOrEqual(1);
    const etat = await page.evaluate(() => ({
        sansRechargement: window.__sansRechargement1213 === true,
        memePalette: document.getElementById('travaux-palette-erreurs-fr') === window.__palette1213,
        hautPalette: window.__palette1213.style.top,
        copie: (window.travauxVisionneuse.getFichierActuel() || {}).id,
        outil: travauxOutils.getOutilActif().id,
        nomOutil: travauxOutils.OUTILS.errfr_1.nom,
        badges: [...document.querySelectorAll('#travaux-errfr-contenu .travaux-errfr-compteur')].map((b) => b.textContent),
        poses: travauxAnnotation.getAnnotationCourante().pages[1].shapes.length
    }));
    expect(etat.sansRechargement, 'la page n\'a pas été rechargée').toBe(true);
    expect(etat.copie, 'la copie est restée ouverte').toBe(COPIE);
    expect(etat.memePalette, 'la palette n\'est pas recréée').toBe(true);
    expect(etat.hautPalette, 'la palette reste où on l\'a mise').toBe('77px');
    expect(etat.outil, 'l\'outil actif reste, son code existe toujours').toBe('errfr_2');
    expect(etat.nomOutil).toBe('Nom fictif précisé');
    expect(etat.badges, 'les compteurs suivent').toEqual(['1', '1']);
    expect(etat.poses, 'les codes posés sont là').toBe(2);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1213 · même parcours en démo : la clé relue est celle du namespace démo', async ({ page }) => {
    const erreurs = await demarrer(page);
    await page.evaluate(async () => {
        window.db.setSync('trimestres', [{ id: 'a2031', nom: 'Automne 2031 (fictif)', session: 'A', annee: '2031', actif: true }]);
        await window.changerTrimestreActif('a2031');
        await window.activerModeDemo();
    });
    await page.waitForFunction(() => window.db.getSync('demo-actif', null) === 'true' && window.cle('grillesTemplates') === 'demo_grillesTemplates');
    await semer(page, 'demo');
    await ouvrirDansAnnoter(page);
    expect(await nomsDeLaPalette(page)).toEqual(['Nom fictif d\'avant', 'Autre code fictif']);

    await changerDansLaGrille(page, 0, 'nom', 'Nom fictif en démo');
    await revenirAAnnoter(page);

    await attendrePalette(page, ['Nom fictif en démo', 'Autre code fictif']);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1213 · relire la grille n\'écrit rien : ni dans le champ d\'erreurs, ni dans l\'évaluation', async ({ page }) => {
    const { T } = await monterTrimestre(page);
    await ouvrirDansAnnoter(page);
    await page.evaluate(() => {
        window.__inputs1213 = 0;
        document.addEventListener('input', (e) => { if (e.target && /^eval_erreurs_/.test(e.target.id || '')) window.__inputs1213++; }, true);
    });
    await page.evaluate(() => travauxUI.basculerMode('evaluer'));
    // L'évaluation chargée, et un premier versement au champ : le champ porte de quoi recevoir.
    await page.waitForFunction(() => !!document.querySelector('input[id^="eval_erreurs_"]') && window.__inputs1213 > 0
        && window.evaluationEnCours && !!window.evaluationEnCours.idModification, null, { timeout: 15000 });
    await page.evaluate(() => travauxUI.basculerMode('annoter'));
    const note = (T) => {
        const e = window.db.getSync(T + '_evaluationsSauvegardees', [])[0];
        return { note: e.noteFinale, erreurs: e.donneesAlgorithmiques.c2.erreurs, pct: e.donneesAlgorithmiques.c2.pourcentage };
    };
    const noteAvant = await page.evaluate(note, T);

    // Le texte, puis le poids : le poids est le cas où la somme pondérée changerait.
    await changerDansLaGrille(page, 0, 'nom', 'Nom fictif précisé');
    await changerDansLaGrille(page, 0, 'ponderation', '0.5');
    await expect.poll(() => page.evaluate(() => travauxOutils.sommePondereeErreurs({ errfr_1: 2 })), { timeout: 10000, message: 'la grille a bien été relue' }).toBe(1);

    // La relecture est synchrone : ce qu'elle verse au champ se mesure pendant l'événement même, sans
    // dépendre des minuteries que l'ouverture a pu laisser (le compteur à +2 s de `afficherPalettesEval`).
    const pendant = await page.evaluate(() => {
        const champ = document.querySelector('input[id^="eval_erreurs_"]');
        const avant = window.__inputs1213;
        const valeur = champ.value;
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return { versements: window.__inputs1213 - avant, valeurInchangee: champ.value === valeur };
    });
    expect(pendant, 'relire n\'écrit pas dans le champ, donc n\'arme pas l\'auto-save').toEqual({ versements: 0, valeurInchangee: true });

    // Au retour (`activerAnnotation` verse au champ, sans rapport avec ce lot), le poids changé ne
    // change pas la note enregistrée : mêmes codes, même note.
    const n = await page.evaluate(() => window.__inputs1213);
    await revenirAAnnoter(page);
    await page.waitForFunction((n) => window.__inputs1213 > n, n, { timeout: 15000 });
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
    expect(await page.evaluate(note, T)).toEqual(noteAvant);
});

test('#1213 · un code retiré de la grille : son outil actif laisse la place au stylo', async ({ page }) => {
    await monterTrimestre(page);
    await ouvrirDansAnnoter(page);
    await page.evaluate(() => travauxOutils.setOutilActif('errfr_2'));
    await changerDansLaGrille(page, 1, 'code', '7');
    await revenirAAnnoter(page);
    await expect.poll(() => page.evaluate(() => Object.keys(travauxOutils.OUTILS).filter((k) => k.startsWith('errfr_'))), { timeout: 10000 }).toEqual(['errfr_1', 'errfr_7']);
    expect(await page.evaluate(() => travauxOutils.getOutilActif().id)).toBe('stylo');
});

test('#1213 · aucune copie ouverte, ou une autre clé écrite : rien n\'est relu', async ({ page }) => {
    await monterTrimestre(page);
    const sansCopie = await page.evaluate(() => {
        const avant = Object.keys(travauxOutils.OUTILS).filter((k) => k.startsWith('errfr_')).join();
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('grillesTemplates') } }));
        return { grille: travauxOutils.grilleCourante(), memes: avant === Object.keys(travauxOutils.OUTILS).filter((k) => k.startsWith('errfr_')).join() };
    });
    expect(sansCopie.grille).toBeNull();
    expect(sansCopie.memes).toBe(true);

    await ouvrirDansAnnoter(page);
    const autreCle = await page.evaluate(() => {
        const avant = travauxOutils.grilleCourante();
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: window.cle('productions') } }));
        const apresAutre = travauxOutils.grilleCourante() === avant;
        window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: {} }));
        return { apresAutre, sansCle: travauxOutils.grilleCourante() === avant };
    });
    expect(autreCle).toEqual({ apresAutre: true, sansCle: true });
});
