import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ÉTAPE 4a DU CRITÈRE ALGORITHMIQUE (27 oct. 2026), dans un vrai WebKit, contre le vrai index.html. Consigne
// `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4a.md`, § 7 ; ébauche validée
// `plans de travail/EBAUCHE-2026-10-26-calculs.html`. Deux disciplines fictives : « unités manquantes » sur
// « calculs », « erreurs » sur « mots ».
//   · choisir chacune des trois cartes, taper son réglage, changer un menu « vaut 0 », et voir la copie fictive suivre ;
//     le focus revient au champ, le défilement ne saute pas ;
//   · une VRAIE copie évaluée en mode simple, codes posés dans Annoter, en pénalité fixe : sa note et sa ligne chiffrée ;
//     une étendue à 0 avec « Une note de 0 », puis avec « Aucune note » ;
//   · LA MESURE DU PIÈGE 2 : une grille déjà employée, on change le calcul d'un critère — la base, une copie verrouillée,
//     une copie déverrouillée (↻ #1173, 27 oct. : verrouillée, elle montre désormais la note remise) ;
//   · 1 440, 1 180, 820 et 700 px : aucun défilement de côté, des cibles d'au moins 40 px ;
//   · captures (CAPTURES_CALCULS_4A=<dossier>) : 1 440 et 820 px, clair et sombre, les deux disciplines.

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
              modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 2 }, modeleProjection: 'aucune', paramsProjection: {} } ] },
        { id: 'GM', nom: 'Rédaction fictive', dansBibliotheque: true, criteres: [
            { id: 'CM', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
              noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
              sousCriteres: sc(['Syntaxe', 'Ponctuation', 'Lexique']),
              modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
              modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900, erreursTolerees: 30, nomServiceAide: '', libelleSignalement: '', lienServiceAide: '' },
              paliersProjection: window.projectionAlgo.paliersGabaritNeuf() } ] }
    ]);
    window.afficherSection('conception');
    window.afficherSousSection('conception-grille-criteres');
}`;

async function ouvrir(page, grilleId, largeur, hauteur) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.setViewportSize({ width: largeur || 1440, height: hauteur || 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.atelierAlgo && window.formulesAlgo, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    return erreurs;
}

const atelier = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id}"]`);
const etape = (page, id) => atelier(page, id).locator('.atelier-algo-etape[data-etape="note"]');
const carteActive = (page, id) => etape(page, id).locator('.calc-carte[data-actif]');
const copie = (page, id) => carteActive(page, id).locator('[data-calcul-copie-texte]');
const cliquerDom = (loc) => loc.evaluate((el) => el.click());
const enBase = (page, g) => page.evaluate(async (id) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id).criteres[0], g);
const actif = (page) => page.evaluate(() => document.activeElement && document.activeElement.id);
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const ouvrirNote = async (page, id) => {
    await cliquerDom(atelier(page, id).locator('.atelier-algo-chaine .bc-etape[data-etape="note"]'));
    await expect(etape(page, id)).toHaveAttribute('data-ouverte', '');
};
const textes = (loc) => loc.evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));

test('calculs · les trois cartes, le réglage, un menu « vaut 0 » ; la copie fictive suit, le focus revient', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC', 1440, 1000);
    await ouvrirNote(page, 'CC');
    const e = etape(page, 'CC');
    await expect(e.locator('.atelier-algo-etape-but')).toHaveText('Comment ce que tu identifies et comptes construit la note, en fonction de la pondération du critère. Chaque code posé compte pour la pondération de son sous-critère : c’est le compte pondéré.');
    await expect(e.locator('.calc-titre')).toHaveText('Le calcul de la note');
    expect(await textes(e.locator('.calc-nom'))).toEqual(['Pénalité proportionnelle à la longueur', 'Rapport visé', 'Pénalité fixe']);
    await expect(e.locator('.calc-note > .calc-legende').first()).toHaveText('La note reste entre 0 et la pondération du critère.');
    // #1173 (27 oct.) : la phrase que la mesure du piège 2 retenait, posée une fois la note remise éprouvée (note-remise-1173.spec.js).
    await expect(e.locator('.calc-note > .calc-legende').nth(1)).toHaveText('Une copie déjà évaluée garde sa note. Elle ne suit le nouveau calcul que si tu la déverrouilles et la modifies.');
    await expect(atelier(page, 'CC').locator('.bc-etape[data-etape="note"] .bc-info')).toHaveText('pénalité fixe');
    await expect(e.locator('[data-resume]')).toHaveText('Pénalité fixe, sur 20');

    // La pénalité fixe : son réglage, ses pastilles, la copie fictive (« Quelques » du miroir), une rangée « vaut 0 ».
    const c = carteActive(page, 'CC');
    await expect(c.locator('.calc-param label')).toHaveText('Points retirés par unité manquante');
    expect(await textes(c.locator('.calc-formule > *'))).toEqual(['Note =', 'Pondération du critère', '−', 'Compte pondéré des unités manquantes', '×', 'Points par unité manquante (2)']);
    await expect(copie(page, 'CC')).toHaveText(/^Note = 20 − \d+ × 2 = −?\d+(,\d+)?( \/ 20| ; la note ne descendrait pas sous 0 : 0 \/ 20\.)$/);
    expect(await textes(c.locator('.calc-cas-rangee > span'))).toEqual(['Si Compte pondéré des unités manquantes vaut 0']);
    expect(await c.locator('.calc-cas select option').evaluateAll((os) => os.map((o) => o.textContent)))
        .toEqual(['Calculer normalement', 'Aucune note : l’évaluation attend le compte pondéré des unités manquantes', 'La note entière', 'Une note de 0']);
    await expect(c.locator('.calc-cas > .calc-legende')).toHaveCount(0);   // la pénalité fixe ne divise pas

    // La copie fictive se règle : 3 unités manquantes → la ligne suit.
    const champ = atelier(page, 'CC').locator('[data-apercu-champ="erreurs"]');
    await champ.fill('3');
    await champ.dispatchEvent('input');
    await expect(copie(page, 'CC')).toHaveText('Note = 20 − 3 × 2 = 14 / 20');

    // Taper le réglage : 2,5 → au départ du champ, le focus passe au menu ; il y revient après le redessin.
    const reglage = c.locator('.calc-param input');
    await reglage.focus();
    await reglage.fill('2.5');
    // Le menu « vaut 0 » dans la vue : sinon, c'est Tab qui fait défiler (le navigateur amène le champ suivant), pas le redessin.
    await c.locator('.calc-cas select').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const yAvant = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Tab');
    await expect.poll(async () => (await enBase(page, 'GC')).paramsFormule).toEqual({ pointsParErreur: 2.5 });
    await expect(copie(page, 'CC')).toHaveText('Note = 20 − 3 × 2,5 = 12,5 / 20');
    expect(await actif(page)).toBe('tcas-GC-0-calcul-cas-comptePondere');
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - yAvant), 'le défilement ne saute pas').toBeLessThanOrEqual(2);

    // Un menu « vaut 0 » : la copie fictive à 0 suit le choix ; le focus reste au menu ; seule l'entrée qui diffère s'écrit.
    await champ.fill('0');
    await champ.dispatchEvent('input');
    await expect(copie(page, 'CC')).toHaveText('Note = 20 − 0 × 2,5 = 20 / 20');
    const yMenu = await page.evaluate(() => window.scrollY);
    await carteActive(page, 'CC').locator('.calc-cas select').focus();
    await carteActive(page, 'CC').locator('.calc-cas select').selectOption('zero');
    await expect.poll(async () => (await enBase(page, 'GC')).casZero).toEqual({ penalite_par_erreur: { comptePondere: 'zero' } });
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - yMenu), 'le défilement ne saute pas (menu)').toBeLessThanOrEqual(2);
    await expect(copie(page, 'CC')).toHaveText('Le compte pondéré des unités manquantes vaut 0 : la note serait 0 / 20.');
    expect(await actif(page)).toBe('tcas-GC-0-calcul-cas-comptePondere');
    await carteActive(page, 'CC').locator('.calc-cas select').selectOption('aucune');
    await expect(copie(page, 'CC')).toHaveText('Aucune note : l’évaluation attendrait le compte pondéré des unités manquantes.');
    await carteActive(page, 'CC').locator('.calc-cas select').selectOption('calcul');
    await expect.poll(async () => (await enBase(page, 'GC')).casZero).toBeUndefined();

    // Choisir le rapport visé : ses défauts, deux rangées, jamais « Calculer normalement » pour la donnée qui divise.
    await e.locator('input[type="radio"][value="ratio_cible"]').focus();   // un clic donne le focus au bouton
    await cliquerDom(e.locator('input[type="radio"][value="ratio_cible"]'));
    await expect.poll(async () => (await enBase(page, 'GC')).modeleFormule).toBe('ratio_cible');
    expect(await actif(page)).toBe('tcas-GC-0-calcul-ratio_cible');
    await expect(atelier(page, 'CC').locator('.bc-etape[data-etape="note"] .bc-info')).toHaveText('rapport visé');
    await expect(carteActive(page, 'CC').locator('.calc-param label')).toHaveText('Rapport qui donne la note entière : 1 unité manquante à chaque … calculs');
    expect(await textes(carteActive(page, 'CC').locator('.calc-cas-rangee > span'))).toEqual(['Si Compte des calculs vaut 0', 'Si Compte pondéré des unités manquantes vaut 0']);
    expect(await carteActive(page, 'CC').locator('.calc-cas select').nth(1).evaluate((s) => [...s.options].map((o) => o.value))).toEqual(['aucune', 'entiere', 'zero']);
    await expect(carteActive(page, 'CC').locator('.calc-cas select').nth(1)).toHaveValue('entiere');
    await expect(carteActive(page, 'CC').locator('.calc-cas > .calc-legende')).toHaveText('Une division par une donnée qui vaut 0 n’a pas de résultat : tu dis ce que vaut alors la note.');
    // La copie fictive du laboratoire n'a pas d'étendue (aucune projection, aucune longueur fixée) : l'étendue
    // s'examine d'abord, et le rapport visé l'attend. Avec 12 calculs, le compte à 0 donne la note entière.
    await expect(copie(page, 'CC')).toHaveText('Aucune note : l’évaluation attendrait le compte des calculs.');
    const longueur = atelier(page, 'CC').locator('[data-apercu-champ="mots"]');
    await longueur.fill('12');
    await longueur.dispatchEvent('input');
    await expect(copie(page, 'CC')).toHaveText('Le compte pondéré des unités manquantes vaut 0 : la note serait entière, 20 / 20.');

    // Choisir la pénalité proportionnelle : son réglage, la copie fictive à 3.
    await e.locator('input[type="radio"][value="penalite_normalisee"]').focus();   // un clic donne le focus au bouton
    await cliquerDom(e.locator('input[type="radio"][value="penalite_normalisee"]'));
    await expect.poll(async () => (await enBase(page, 'GC')).modeleFormule).toBe('penalite_normalisee');
    await expect(carteActive(page, 'CC').locator('.calc-param label')).toHaveText('Longueur sur laquelle une occurrence coûte un point (calculs)');
    await champ.fill('3');
    await champ.dispatchEvent('input');
    await expect(copie(page, 'CC')).toHaveText('Note = 20 − 3 ÷ 12 × 500 = −105 ; la note ne descendrait pas sous 0 : 0 / 20.');
    await expect(etape(page, 'CC').locator('[data-resume]')).toHaveText('Pénalité proportionnelle à la longueur, sur 20');
    expect(erreurs).toEqual([]);
});

// UNE VRAIE COPIE ÉVALUÉE — le montage du lot 3b (`cartoucheSelectionnee`, la copie ouverte par l'évènement, les codes
// posés par Annoter), en pénalité fixe (2 points par erreur), puis une étendue à 0 en pénalité proportionnelle.
const MONTER_EVAL = `(reglage) => {
    const k = (b) => cle(b);
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{ id: 'G_T', nom: 'Grille fictive 4a', dansBibliotheque: true, criteres: [Object.assign({
        id: 'CR_T', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true,
        sousCriteres: [{ id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 1, retroaction: '' }] }, reglage)] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('echellesTemplates'), [{ id: 'ECH_F', nom: 'Échelle fictive', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 59 }, { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }, { code: 'E', nom: 'Étendu', min: 90, max: 100 }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('cartouches_G_T'), [{ id: 'CART_F', nom: 'Cartouche fictive', criteres: [{ id: 'CR_T' }], niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }] }]);
    db.setSync(k('modalitesEvaluation'), { activerCategorisationErreurs: false });
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('productions'), [{ id: 'P_T', titre: 'Rédaction fictive', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F' }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('fichiersTravaux'), [{ id: 'F_T', etudiantDA: 'DA-F', productionId: 'P_T', nomFichier: 'FICTIF.png', typeMIME: 'image/png' }]);
    evaluationEnCours = { etudiantDA: 'DA-F', productionId: 'P_T', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        criteres: {}, donneesAlgorithmiques: {}, statutRemise: 'evalue' };
    document.getElementById('selectEchelle1').innerHTML = '<option value="ECH_F">Échelle fictive</option>';
    document.getElementById('remiseProduction1').innerHTML = '<option value="recu">Reçu</option>';
    const selC = document.getElementById('selectCartoucheEval');
    selC.innerHTML = '<option value="CART_F">Cartouche fictive</option>';
    selC.value = 'CART_F';
    cartoucheSelectionnee();
    // La copie ouverte, trois codes posés (deux de syntaxe, un de ponctuation).
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_T', productionId: 'P_T' } } }));
    const shapes = [{ type: 'errfr_1', x: 0, y: 1 }, { type: 'errfr_1', x: 1, y: 1 }, { type: 'errfr_3', x: 0, y: 2 }];
    window.travauxAnnotation.getAnnotationCourante = () => ({ id: 'A_T', fichierId: 'F_T', pages: { 1: { shapes } } });
    window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
    return true;
}`;
const TAPER_MOTS = `(n) => {
    const mots = document.getElementById('eval_mots_CR_T');
    mots.value = String(n);
    mots.dispatchEvent(new Event('input', { bubbles: true }));
    const ligne = document.getElementById('formule_algo_CR_T');
    return { champ: document.getElementById('eval_erreurs_CR_T').value, note: document.getElementById('note_algo_CR_T').textContent,
        pct: document.getElementById('pct_algo_CR_T').textContent, niveau: document.getElementById('niveau_algo_CR_T').textContent,
        ligne: ligne.textContent, masquee: ligne.classList.contains('u-hide'),
        memo: JSON.parse(JSON.stringify(evaluationEnCours.donneesAlgorithmiques.CR_T || null)), niveauEnCours: (evaluationEnCours.criteres || {}).CR_T };
}`;

async function monterCopie(page, reglage) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.formulesAlgo, null, { timeout: 20000 });
    await page.evaluate('(' + MONTER_EVAL + ')(' + JSON.stringify(reglage) + ')');
    return erreurs;
}

test('une vraie copie évaluée · codes posés dans Annoter, pénalité fixe : sa note et sa ligne chiffrée', async ({ page }) => {
    const erreurs = await monterCopie(page, { modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 2 } });
    const r = await page.evaluate('(' + TAPER_MOTS + ')(400)');
    expect(r.champ).toBe('3');
    expect(r.ligne).toBe('Note = 20 − 3 × 2 = 14 / 20');
    expect(r.masquee).toBe(false);
    expect([r.note, r.pct, r.niveau]).toEqual(['14,00', '70,0', 'D']);
    // Ce qui s'enregistre ne change pas de forme : la note brute, le pourcentage borné, le niveau.
    expect(r.memo).toMatchObject({ erreurs: 3, mots: 400, noteCalculee: 14, pourcentage: 70, niveau: 'D' });
    expect(Object.keys(r.memo).sort()).toEqual(['erreurs', 'mots', 'niveau', 'noteCalculee', 'pourcentage', 'retroaction']);
    expect(erreurs).toEqual([]);
});

test('une vraie copie évaluée · une étendue à 0 avec « Une note de 0 », puis avec « Aucune note »', async ({ page }) => {
    const erreurs = await monterCopie(page, { modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
        casZero: { penalite_normalisee: { etendue: 'zero' } } });
    const zero = await page.evaluate('(' + TAPER_MOTS + ')(0)');
    expect(zero.ligne).toBe('Le compte des mots vaut 0 : la note est 0 / 20.');
    expect([zero.note, zero.pct, zero.niveau]).toEqual(['0,00', '0,0', 'I']);
    expect(zero.memo).toMatchObject({ mots: 0, noteCalculee: 0, pourcentage: 0, niveau: 'I' });
    // Avec des mots, le calcul reprend : 20 − 3 ÷ 400 × 500.
    const plein = await page.evaluate('(' + TAPER_MOTS + ')(400)');
    expect(plein.ligne).toBe('Note = 20 − 3 ÷ 400 × 500 = 16,25 / 20');

    // « Aucune note » (le choix de départ) : la ligne masquée, le niveau retiré — jamais « -- » en mémoire (#702).
    await page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []);
        delete g[0].criteres[0].casZero;
        db.setSync(cle('grillesTemplates'), g);
    });
    const aucune = await page.evaluate('(' + TAPER_MOTS + ')(0)');
    expect(aucune.masquee).toBe(true);
    expect(aucune.ligne).toBe('');
    expect(aucune.niveauEnCours).toBeUndefined();
    expect(erreurs).toEqual([]);
});

// LA MESURE DU PIÈGE 2 (consigne § 6.2) — une grille déjà employée, on change le calcul d'un critère par le geste de
// l'atelier. Une évaluation verrouillée, une déverrouillée, enregistrées avec la pénalité proportionnelle (14 / 20).
const T = 't4a';
const MONTER_PIEGE = `({ T, verrouillee }) => {
    const coursId = 'cours-4a';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 67 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    // security-ok: fixtures littérales du banc, aucune source externe.
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC4A', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: 'DA4A', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC4A' }]);
    window.db.setSync(T + '_productions', [{ id: 'P4A', titre: 'Rédaction fictive', type: 'travail', ponderation: 60, grilleId: 'G4A', echelleId: 'E4A', cartoucheId: 'CT4A', groupeCoursId: 'GC4A' }]);
    const commentaires = {};
    ['I', 'D', 'M', 'E'].forEach((n) => { commentaires['c2_' + n] = 'CARTOUCHE c2_' + n; });
    window.db.setSync(T + '_cartouches_G4A', [{ id: 'CT4A', nom: 'Cartouche témoin', grilleId: 'G4A', contexte: '', criteres: [{ id: 'c2', nom: 'Langue écrite' }], commentaires }]);
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G4A', nom: 'Grille témoin', criteres: [
        { id: 'c2', nom: 'Langue écrite', ponderation: 100, type: 'algorithmique', modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 }, facteurNormalisation: 500 }] }]);
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E4A', nom: 'IDME', niveaux }]);
    window.db.setSync(T + '_evaluationsSauvegardees', [{
        id: 'EV4A', etudiantDA: 'DA4A', productionId: 'P4A', groupeCoursId: 'GC4A', grilleId: 'G4A', echelleId: 'E4A', cartoucheId: 'CT4A',
        statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: 70, niveauFinal: 'D', verrouillee,
        criteres: [{ critereId: 'c2', critereNom: 'Langue écrite', niveauSelectionne: 'D', ponderation: 100, retroaction: '' }],
        donneesAlgorithmiques: { c2: { erreurs: 15, mots: 500, noteCalculee: 70, pourcentage: 70, niveau: 'D', retroaction: '' } },
        retroactionFinale: '', retroactionReecrite: false }]);
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC4A' });
    window.db.setSync('groupeCoursActif', { id: 'GC4A', trimestreId: T });
}`;
const evaluationsEnBase = (page) => page.evaluate((t) => JSON.stringify(window.db.getSync(t + '_evaluationsSauvegardees', [])), T);
const ecran = (page) => page.evaluate(() => ({
    note: (document.getElementById('note_algo_c2') || {}).textContent, pct: (document.getElementById('pct_algo_c2') || {}).textContent,
    ligne: (document.getElementById('formule_algo_c2') || {}).textContent, champ: (document.getElementById('eval_erreurs_c2') || {}).value,
    noteProduction: (document.getElementById('noteProduction1') || {}).textContent
}));

for (const verrouillee of [true, false]) {
    test(`piège 2 · changer le calcul d’une grille déjà employée — copie ${verrouillee ? 'verrouillée' : 'déverrouillée'} : la base, l’écran, ce qui s’écrit`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
        await page.goto(indexHtml);
        await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function' && window.formulesAlgo, null, { timeout: 20000 });
        await page.evaluate('(' + MONTER_PIEGE + ')(' + JSON.stringify({ T, verrouillee }) + ')');
        const avant = await evaluationsEnBase(page);

        // (a) Le geste de l'atelier : la pénalité fixe (1 point par erreur) remplace la pénalité proportionnelle.
        await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-grille-criteres'); });
        await page.evaluate(() => window.chargerGrillePourModif('G4A'));
        await page.locator('#listeCriteres .calc-carte input[value="penalite_par_erreur"]').evaluate((el) => el.click());
        await expect.poll(() => page.evaluate((t) => window.db.getSync(t + '_grillesTemplates', [])[0].criteres[0].modeleFormule, T)).toBe('penalite_par_erreur');
        expect(await evaluationsEnBase(page), '(a) les évaluations enregistrées, identiques en base').toBe(avant);

        // (b) / (c) La copie rouverte (« Modifier ») : ce que l'écran montre, ce qui s'écrit sans geste.
        await page.evaluate(() => window.modifierEvaluation('EV4A'));
        await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV4A', null, { timeout: 15000 });
        await page.waitForTimeout(3500);
        await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
        const vu = await ecran(page);
        const apresOuverture = await evaluationsEnBase(page);
        // eslint-disable-next-line no-console
        console.log(`PIÈGE 2 · ${verrouillee ? 'verrouillée' : 'déverrouillée'} · écran à la réouverture :`, JSON.stringify(vu));
        expect(vu.champ).toBe('15');
        // Déverrouillée, l'écran montre la note RECALCULÉE par le nouveau calcul : 100 − 15 × 1 = 85. Verrouillée, depuis
        // #1173 (27 oct.), il montre la note remise et la ligne chiffrée se tait : `note-remise-1173.spec.js` l'éprouve.
        if (verrouillee) {
            expect(vu.ligne).toBe('');
            expect(vu.note).toBe('70,00');
        } else {
            expect(vu.ligne).toBe('Note = 100 − 15 × 1 = 85 / 100');
            expect(vu.note).toBe('85,00');
        }
        expect(apresOuverture, 'rien ne s’écrit à la réouverture, sans geste').toBe(avant);

        // Un geste sur la copie (l'auto-save armé comme par une frappe) : une copie verrouillée ne s'écrit pas ;
        // une déverrouillée s'écrit avec la note du nouveau calcul.
        await page.evaluate(() => window._debouncerAutoSave());
        await page.waitForTimeout(2500);
        const apresGeste = JSON.parse(await evaluationsEnBase(page))[0];
        // eslint-disable-next-line no-console
        console.log(`PIÈGE 2 · ${verrouillee ? 'verrouillée' : 'déverrouillée'} · en base après un geste :`, JSON.stringify(apresGeste.donneesAlgorithmiques.c2), apresGeste.noteFinale);
        if (verrouillee) expect(JSON.stringify([apresGeste])).toBe(avant);
        else expect(apresGeste.donneesAlgorithmiques.c2).toMatchObject({ noteCalculee: 85, pourcentage: 85 });
        expect(erreurs).toEqual([]);
    });
}

for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180], [700, 900]]) {
    test(`${largeur} px · « Note calculée » sans défilement de côté ; des cibles d’au moins 40 px`, async ({ page }) => {
        const erreurs = await ouvrir(page, 'GM', largeur, hauteur);
        await ouvrirNote(page, 'CM');
        await carteActive(page, 'CM').scrollIntoViewIfNeeded();
        expect(await debord(page), 'aucun défilement de côté').toBeLessThanOrEqual(0);
        for (const sel of ['.calc-carte-tete', '.calc-param input', '.calc-cas select']) {
            const h = await etape(page, 'CM').locator(sel).first().evaluate((el) => el.getBoundingClientRect().height);
            expect(h, sel).toBeGreaterThanOrEqual(40);
        }
        // Ce qui se VOIT : aucun élément ne dépasse le bord droit de sa carte. (Le `scrollWidth` d'une rangée compte la
        // largeur naturelle du menu natif de WebKit, que le menu, contenu, n'occupe pas : mesuré le 27 oct.)
        const hors = await etape(page, 'CM').locator('.calc-carte').evaluateAll((cs) => cs.flatMap((c) => {
            const bord = c.getBoundingClientRect().right;
            return [...c.querySelectorAll('*')].filter((el) => el.getBoundingClientRect().right > bord + 1).map((el) => el.tagName + '.' + el.className);
        }));
        expect(hors, 'rien ne dépasse des cartes').toEqual([]);
        expect(erreurs).toEqual([]);
    });
}

test('captures · 1 440 et 820 px, clair et sombre, « Note calculée » dans les deux disciplines', async ({ page }) => {
    test.skip(!process.env.CAPTURES_CALCULS_4A, 'captures sur demande : CAPTURES_CALCULS_4A=<dossier>');
    test.setTimeout(240000);
    const dossier = process.env.CAPTURES_CALCULS_4A;
    for (const [g, id, nom] of [['GC', 'CC', 'calculs'], ['GM', 'CM', 'mots']]) {
        for (const [largeur, hauteur] of [[1440, 900], [820, 1180]]) {
            for (const mode of ['clair', 'sombre']) {
                await ouvrir(page, g, largeur, hauteur);
                await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                await ouvrirNote(page, id);
                await etape(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -60); });
                await page.waitForFunction(() => {
                    const a = document.querySelector('#listeCriteres .gabarit-algo');
                    return document.getAnimations().every((x) => x.playState !== 'running' || !x.effect || !x.effect.target
                        || !(x.effect.target.contains(a) || a.contains(x.effect.target)));
                });
                await page.screenshot({ path: path.join(dossier, `calculs-4a-${nom}-${largeur}-${mode}.png`) });
            }
        }
    }
});
