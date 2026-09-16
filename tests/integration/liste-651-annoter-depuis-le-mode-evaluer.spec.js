import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #651 (16 septembre 2026) — « ANNOTER » DEPUIS LA LISTE OUVRE LA COPIE AVEC SES PALETTES,
// MÊME APRÈS UN PASSAGE PAR LE MODE ÉVALUER.
//
// Rapport de Grégoire, 31 août 2026, 14 h 13 (1.106.13, Chrome, Mac) : « Quand je passe de la liste des
// évaluations à l'annotation par le dropdown "action", la page apparait sans palettes. » Ses dernières
// actions : une évaluation chargée (13 h 57), un détour par d'autres sections (grilles, Suivi), retour à
// Évaluations › Liste des évaluations, puis « Actions… › Annoter ».
//
// CE QUI SE PASSAIT (mesuré au navigateur le 16 sept., sur 1.142.14). Le détour compte : le trajet
// direct (Évaluer, Liste, Annoter) donnait déjà ses palettes. Revenir dans Évaluations passe par la
// réinitialisation générale de `initialiserModuleTravaux` : elle ferme les palettes d'évaluation et remet
// le mode à « annoter », mais ne rend pas les palettes d'annotation — la flottante (les outils) garde le
// `u-hide` posé par le mode Évaluer. `ouvrirFichier` passait ensuite par « mode annotation par défaut »,
// qui ne rallumait que les boutons. La cause écrite dans la fiche (mode d'avant « evaluer » + rappel posé
// ⮕ aucune branche) ne joue pas sur ce trajet : l'initialisation a déjà remis le mode à « annoter ».
//
// LA COPIE DE BANC. WebKit refuse un Blob dans IndexedDB en contexte éphémère : `recupererBlob` est
// enveloppé pour rendre une image PNG d'un pixel (recette de #868). Tout le reste du trajet est le vrai.
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre) : le menu d'actions est joué par
// `executerActionEval`, qui reçoit le <select> choisi, et on attend des RENDUS.

const DA = 'TEST651';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    // Le montage ne configure ni échelle ni grille : les palettes du mode Évaluer le signalent. Ce n'est
    // pas l'objet de cette porte, qui juge le mode et ses palettes, pas le calcul.
    /Aucune échelle de performance configurée/,
    /Grille introuvable ou sans critères/
];

async function monter(page) {
    const suivi = { dialogues: [], erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) suivi.erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) suivi.erreurs.push(m); }
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.executerActionEval === 'function'
        && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate(({ png, da }) => {
        const t = 'test651';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-651';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_651' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_651', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_651', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), [{ id: 'p651-1', titre: 'Analyse 1', type: 'travail', ponderation: 100 }]); // security-ok: fixture de test
        window.db.setSync(window.cle('fichiersTravaux'), [{ // security-ok: fixture de test
            id: 'FT651', etudiantDA: da, productionId: 'p651-1', coursId, groupeCoursId: 'GC_651',
            nomFichier: 'GAGNON_TEST651_Analyse1.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-02-01T12:00:00.000Z', dateModification: '2026-02-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        // Une évaluation enregistrée sur cette copie : c'est elle que « Consulter » charge.
        window.db.setSync(window.cle('evaluationsSauvegardees'), [{ // security-ok: fixture de test
            id: 'EVAL651', etudiantDA: da, productionId: 'p651-1', fichierId: 'FT651', statutRemise: 'importe', statutIntegrite: 'recevable',
            criteres: [], noteFinale: 80, dateEvaluation: '2026-02-02T12:00:00.000Z', verrouillee: false
        }]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT651' ? copie : original.apply(this, arguments); };
    }, { png: PNG, da: DA });
    return suivi;
}

const lireEtat = (page) => page.evaluate(() => {
    const vis = (el) => !!el && el.offsetParent !== null && !el.classList.contains('u-hide');
    const fa = window.travauxVisionneuse && window.travauxVisionneuse.getFichierActuel && window.travauxVisionneuse.getFichierActuel();
    const btnActions = document.getElementById('travaux-btn-actions');
    const btnAnnoter = document.getElementById('travaux-btn-annoter');
    return {
        section: (document.querySelector('.section.active') || {}).id || null,
        sousSection: (document.querySelector('.section.active .sous-section.active') || {}).id || null,
        mode: window.travauxUI.getModeCourant(),
        copieOuverte: (fa && fa.id) || null,
        libelle: btnActions ? btnActions.textContent : null,
        boutonAnnoterActif: !!btnAnnoter && btnAnnoter.classList.contains('actif'),
        palettesAnnotation: ['travaux-palette-flottante', 'travaux-palette-tampons', 'travaux-palette-erreurs-fr'].map((id) => vis(document.getElementById(id))),
        palettesEval: ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'].map((id) => vis(document.getElementById(id)))
    };
});

const attendre = (page, ms) => page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);

/** « Consulter » depuis la liste, puis la fin de son chargement (mode Évaluer, évaluation chargée). */
async function consulterDepuisLaListe(page) {
    await page.evaluate(() => window.executerActionEval({ value: 'consulter|EVAL651' }));
    await page.waitForFunction(() => {
        const fa = window.travauxVisionneuse && window.travauxVisionneuse.getFichierActuel && window.travauxVisionneuse.getFichierActuel();
        return fa && fa.id === 'FT651' && window.travauxUI.getModeCourant() === 'evaluer'
            && !!document.getElementById('travaux-palette-eval-retro')
            && window.evaluationEnCours && window.evaluationEnCours.idModification === 'EVAL651';
    }, null, { timeout: 10000 });
}

/** Le trajet du rapport : un détour par une autre section, retour à Évaluations, puis la liste. */
async function detourPuisListe(page) {
    await page.evaluate(() => window.afficherSection('suivi'));
    await page.waitForFunction(() => !!document.querySelector('#section-suivi.active'), null, { timeout: 10000 });
    await page.evaluate(() => window.afficherSection('evaluations'));
    // L'initialisation du module part à +100 ms de l'arrivée : on attend qu'elle ait remis le mode.
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    await attendre(page, 400);
    await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-liste.sous-section.active'), null, { timeout: 10000 });
}

/** « Actions… › Annoter », puis l'état stable une fois TOUTES les minuteries de l'ouverture passées. */
async function annoterDepuisLaListe(page) {
    await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT651|p651-1' }));
    await page.waitForFunction(() => !!document.querySelector('.annot-badge[data-fichier-id="FT651"].actif')
        && !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 10000 });
    await attendre(page, 1500);
}

const ETAT_ANNOTER = {
    section: 'section-evaluations', sousSection: 'evaluations-annoter', mode: 'annoter', copieOuverte: 'FT651',
    libelle: 'Annoter ▾', boutonAnnoterActif: true,
    palettesAnnotation: [true, true, true], palettesEval: [false, false, false]
};

test('Porte #651 · mode Évaluer, détour, puis « Annoter » depuis la liste : la copie s\'ouvre avec ses palettes d\'annotation', async ({ page }) => {
    const suivi = await monter(page);
    await consulterDepuisLaListe(page);
    await detourPuisListe(page);
    await annoterDepuisLaListe(page);

    // AVANT : palettesAnnotation [false, true, true] — la flottante, celle des outils, restait cachée.
    expect(await lireEtat(page)).toEqual(ETAT_ANNOTER);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #651 · le trajet direct (Évaluer, Liste, Annoter) donne le même état', async ({ page }) => {
    const suivi = await monter(page);
    await consulterDepuisLaListe(page);
    await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-liste.sous-section.active'), null, { timeout: 10000 });
    await annoterDepuisLaListe(page);
    expect(await lireEtat(page)).toEqual(ETAT_ANNOTER);
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #651 · garde : après « Annoter », « Consulter » depuis la liste arrive toujours en Évaluer, l\'évaluation chargée', async ({ page }) => {
    const suivi = await monter(page);
    await consulterDepuisLaListe(page);
    await detourPuisListe(page);
    await annoterDepuisLaListe(page);

    await page.evaluate(() => window.afficherSousSection('evaluations-liste'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-liste.sous-section.active'), null, { timeout: 10000 });
    await consulterDepuisLaListe(page);
    await attendre(page, 1500);
    const etat = await lireEtat(page);
    expect({ mode: etat.mode, libelle: etat.libelle, palettesEval: etat.palettesEval, palettesAnnotation: etat.palettesAnnotation })
        .toEqual({ mode: 'evaluer', libelle: 'Évaluer ▾', palettesEval: [true, true, true], palettesAnnotation: [false, false, false] });
    expect(await page.evaluate(() => window.evaluationEnCours && window.evaluationEnCours.idModification)).toBe('EVAL651');
    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});
