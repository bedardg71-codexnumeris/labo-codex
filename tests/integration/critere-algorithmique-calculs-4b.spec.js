import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ÉTAPE 4b DU CRITÈRE ALGORITHMIQUE (27 oct. 2026), dans un vrai WebKit, contre le vrai index.html. Consigne
// `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4b.md`, § 7 ; ébauche validée
// `plans de travail/EBAUCHE-2026-10-26-calculs.html`. Deux disciplines fictives : « unités manquantes » sur « calculs »,
// « erreurs » sur « mots ».
//   · « Retoucher ce calcul », changer un nombre, « Garder » : la copie fictive suit ; puis une VRAIE copie évaluée (codes
//     posés dans Annoter) porte la nouvelle note ;
//   · composer de zéro « Pondération du critère − Compte pondéré des X × 3 », le garder ;
//   · les refus : incomplet, parenthèse, division par 0, sans nom ; rien ne s'écrit ;
//   · « Retirer » refusé pour le calcul de la note, puis confirmé pour un autre ;
//   · le redessin : poser un bloc, taper le nom ou un nombre ne fait perdre ni le brouillon, ni l'ouverture, ni le focus,
//     ni le défilement ;
//   · la copie verrouillée après un changement de calcul : la note remise et sa ligne (lot #1173) ;
//   · 1 440, 1 180, 820 et 700 px : aucun défilement de côté, des cibles d'au moins 44 px ;
//   · captures (CAPTURES_CALCULS_4B=<dossier>) : le composeur ouvert et une carte de calcul composé, 1 440 et 820 px,
//     clair et sombre, les deux disciplines.
//
// BREAK-TEST (fait le 27 oct. 2026, restauré) : `garderCalculAlgo` qui n'écrit pas `modeleFormule` (le registre rendu sans
// cette ligne) → « Retoucher… Garder » et « composer de zéro » rougissent : la carte gardée n'est pas choisie.

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
              modeleProjection: 'aucune', paramsProjection: {} } ] }
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
    await page.waitForFunction(() => window.dbReady === true && window.atelierAlgo && window.formulesAlgo && window.composeurCalcul, null, { timeout: 20000 });
    await page.evaluate(eval(SEMER));
    await page.evaluate((id) => window.chargerGrillePourModif(id), grilleId);
    return erreurs;
}

const atelier = (page, id) => page.locator(`#listeCriteres .gabarit-algo[data-critere-id="${id}"]`);
const etape = (page, id) => atelier(page, id).locator('.atelier-algo-etape[data-etape="note"]');
const carteActive = (page, id) => etape(page, id).locator('.calc-carte[data-actif]');
const composeur = (page, id) => etape(page, id).locator('details.calc-composeur');
const geste = (page, id, g, v) => composeur(page, id).locator(`[data-composeur-geste="${g}"]` + (v ? `[data-valeur="${v}"]` : ''));
const enBase = (page, g) => page.evaluate(async (id) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id).criteres[0], g);
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const texte = (loc) => loc.evaluate((e) => e.textContent.replace(/\s+/g, ' ').trim());
const ouvrirNote = async (page, id) => {
    await atelier(page, id).locator('.atelier-algo-chaine .bc-etape[data-etape="note"]').evaluate((el) => el.click());
    await expect(etape(page, id)).toHaveAttribute('data-ouverte', '');
};
async function composerMoinsTrois(page, id, nom) {
    await composeur(page, id).locator('summary').click();
    await composeur(page, id).locator('[data-composeur-champ="nom"]').fill(nom);
    await geste(page, id, 'donnee', 'ponderation').click();
    await geste(page, id, 'operation', '−').click();
    await geste(page, id, 'donnee', 'comptePondere').click();
    await geste(page, id, 'operation', '×').click();
    await composeur(page, id).locator('[data-composeur-champ="nombre"]').fill('3');
    await geste(page, id, 'nombre').click();
}

test('« Retoucher ce calcul », changer un nombre, « Garder » : la carte est choisie, la copie fictive suit, la chaîne nomme le calcul', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC');
    await ouvrirNote(page, 'CC');
    await carteActive(page, 'CC').locator('[data-composeur-geste="retoucher"]').click();
    await expect(composeur(page, 'CC')).toHaveAttribute('open', '');
    await expect(composeur(page, 'CC').locator('[data-composeur-champ="nom"]')).toHaveValue('Mon calcul, d’après « Pénalité fixe »');
    expect(await texte(composeur(page, 'CC').locator('.calc-zone'))).toBe('Note = Pondération du critère − Compte pondéré des unités manquantes × 2');
    // Le calcul tout fait reste offert tel quel, rien n'est écrit avant « Garder ».
    expect((await enBase(page, 'GC')).modeleFormule).toBe('penalite_par_erreur');
    // Changer un nombre : retirer le dernier, poser 2,5 (la virgule).
    await geste(page, 'CC', 'retirer').click();
    await composeur(page, 'CC').locator('[data-composeur-champ="nombre"]').fill('2,5');
    await geste(page, 'CC', 'nombre').click();
    await expect(composeur(page, 'CC').locator('[data-composeur-copie]')).toContainText('× 2,5 =');
    await composeur(page, 'CC').locator('[data-action="garderCalculAlgo"]').click();
    await expect(etape(page, 'CC').locator('.calc-message')).toHaveText('Calcul « Mon calcul, d’après « Pénalité fixe » » gardé : il donne maintenant la note.');
    const c = await enBase(page, 'GC');
    expect(c.modeleFormule).toBe('perso:calc1');
    expect(c.paramsFormule).toEqual({ pointsParErreur: 2 });
    expect(c.calculs).toEqual([{ id: 'calc1', nom: 'Mon calcul, d’après « Pénalité fixe »', sert: 'note',
        jetons: [{ t: 'd', k: 'ponderation' }, { t: 'o', v: '−' }, { t: 'd', k: 'comptePondere' }, { t: 'o', v: '×' }, { t: 'n', v: 2.5 }], cas: { comptePondere: 'calcul' } }]);
    await expect(carteActive(page, 'CC').locator('.calc-nom')).toHaveText('Mon calcul, d’après « Pénalité fixe »');
    await expect(carteActive(page, 'CC').locator('.calc-texte')).toHaveText('Ton calcul.');
    await expect(carteActive(page, 'CC').locator('.calc-param')).toHaveCount(0);
    await expect(carteActive(page, 'CC').locator('[data-calcul-copie-texte]')).toContainText('× 2,5 =');
    await expect(etape(page, 'CC').locator('[data-resume]')).toHaveText('« Mon calcul, d’après « Pénalité fixe » », sur 20');
    await expect(composeur(page, 'CC')).not.toHaveAttribute('open', '');
    // Revenir au calcul tout fait retrouve son réglage.
    await etape(page, 'CC').locator('input[value="penalite_par_erreur"]').evaluate((el) => el.click());
    await expect.poll(async () => (await enBase(page, 'GC')).modeleFormule).toBe('penalite_par_erreur');
    await expect(carteActive(page, 'CC').locator('.calc-param input')).toHaveValue('2');
    expect(erreurs).toEqual([]);
});

test('composer de zéro « Pondération du critère − Compte pondéré des X × 3 », le garder ; « Modifier ce calcul », « Garder les changements »', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM');
    await ouvrirNote(page, 'CM');
    await composerMoinsTrois(page, 'CM', 'Moins trois');
    expect(await texte(composeur(page, 'CM').locator('.calc-zone'))).toBe('Note = Pondération du critère − Compte pondéré des erreurs × 3');
    await expect(composeur(page, 'CM').locator('[data-composeur-refus]')).toHaveText('');
    await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GM')).modeleFormule).toBe('perso:calc1');
    expect(await texte(carteActive(page, 'CM').locator('.calc-formule'))).toBe('Note = Pondération du critère − Compte pondéré des erreurs × 3');
    await expect(carteActive(page, 'CM').locator('[data-calcul-copie-texte]')).toContainText('Note = 20 −');
    // « Modifier ce calcul » : le composeur rouvert, prérempli ; « Garder les changements ».
    await carteActive(page, 'CM').locator('[data-composeur-geste="modifier"]').click();
    await expect(composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]')).toHaveText('Garder les changements');
    await geste(page, 'CM', 'retirer').click();
    await composeur(page, 'CM').locator('[data-composeur-champ="nombre"]').fill('4');
    await geste(page, 'CM', 'nombre').click();
    await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GM')).calculs[0].jetons[4]).toEqual({ t: 'n', v: 4 });
    expect((await enBase(page, 'GM')).calculs).toHaveLength(1);
    expect(erreurs).toEqual([]);
});

test('les refus : sans nom, incomplet, parenthèse, division par 0 — rien ne s’écrit', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC');
    await ouvrirNote(page, 'CC');
    const avant = JSON.stringify(await enBase(page, 'GC'));
    await composeur(page, 'CC').locator('summary').click();
    const refus = composeur(page, 'CC').locator('[data-composeur-refus]');
    const garder = composeur(page, 'CC').locator('[data-action="garderCalculAlgo"]');
    await expect(refus).toHaveText('Donne un nom à ton calcul.');
    await expect(composeur(page, 'CC').locator('.calc-zone')).toContainText('Vide : touche une donnée, un nombre ou une opération.');
    await composeur(page, 'CC').locator('[data-composeur-champ="nom"]').fill('Essai');
    await expect(refus).toHaveText('Le calcul est vide.');
    await geste(page, 'CC', 'donnee', 'ponderation').click();
    await geste(page, 'CC', 'operation', '÷').click();
    await expect(refus).toHaveText('Le calcul n’est pas complet : il manque une donnée ou un nombre.');
    await composeur(page, 'CC').locator('[data-composeur-champ="nombre"]').fill('0');
    await geste(page, 'CC', 'nombre').click();
    await expect(refus).toHaveText('Le calcul divise par 0.');
    await garder.evaluate((el) => el.click());   // aria-disabled : Playwright n'y clique pas ; le geste, lui, reste possible
    await geste(page, 'CC', 'effacer').click();
    await geste(page, 'CC', 'operation', '(').click();
    await geste(page, 'CC', 'donnee', 'ponderation').click();
    await expect(refus).toHaveText('Une parenthèse n’est pas fermée.');
    await expect(garder).toHaveAttribute('aria-disabled', 'true');
    await garder.evaluate((el) => el.click());
    await composeur(page, 'CC').locator('[data-composeur-champ="nom"]').fill('');
    await expect(refus).toHaveText('Donne un nom à ton calcul.');
    expect(JSON.stringify(await enBase(page, 'GC'))).toBe(avant);
    // « Annuler » : plus de brouillon, le composeur replié.
    await geste(page, 'CC', 'annuler').click();
    await expect(composeur(page, 'CC')).not.toHaveAttribute('open', '');
    await composeur(page, 'CC').locator('summary').click();
    await expect(composeur(page, 'CC').locator('.calc-zone')).toContainText('Vide');
    expect(erreurs).toEqual([]);
});

test('« Retirer » : refusé pour le calcul de la note ; confirmé pour un autre, « Annuler » n’écrit rien', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM');
    await ouvrirNote(page, 'CM');
    await composerMoinsTrois(page, 'CM', 'Premier');
    await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GM')).modeleFormule).toBe('perso:calc1');
    await composerMoinsTrois(page, 'CM', 'Second');
    await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GM')).modeleFormule).toBe('perso:calc2');
    // Le calcul de la note : refusé, avec le message.
    await carteActive(page, 'CM').locator('[data-action="retirerCalculAlgo"]').click();
    await expect(etape(page, 'CM').locator('.calc-message')).toHaveText('Ce calcul donne la note : choisis d’abord un autre calcul.');
    expect((await enBase(page, 'GM')).calculs).toHaveLength(2);
    // Un autre : la confirmation en place ; « Annuler », puis « Retirer ».
    const autre = etape(page, 'CM').locator('.calc-carte:not([data-actif])').filter({ hasText: 'Premier' });
    await autre.locator('[data-action="retirerCalculAlgo"]').click();
    await expect(etape(page, 'CM').locator('.table-cas-confirmer p')).toHaveText('Retirer le calcul « Premier » ? Ses blocs seront perdus.');
    await etape(page, 'CM').locator('[data-action="annulerRetraitCalculAlgo"]').click();
    expect((await enBase(page, 'GM')).calculs).toHaveLength(2);
    await autre.locator('[data-action="retirerCalculAlgo"]').click();
    await etape(page, 'CM').locator('[data-action="confirmerRetraitCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GM')).calculs.map((c) => c.id)).toEqual(['calc2']);
    expect((await enBase(page, 'GM')).calculsProchain).toBe(3);
    expect(erreurs).toEqual([]);
});

test('le redessin : poser un bloc, taper le nom ou un nombre garde le brouillon, l’ouverture, le focus et le défilement', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM', 1180, 820);
    await ouvrirNote(page, 'CM');
    await composeur(page, 'CM').locator('summary').click();
    const nom = composeur(page, 'CM').locator('[data-composeur-champ="nom"]');
    await nom.click();
    await page.keyboard.type('Mon taux');
    await expect(nom).toBeFocused();
    const bouton = geste(page, 'CM', 'donnee', 'etendue');
    await bouton.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    await bouton.focus();
    await page.keyboard.press('Enter');
    await expect(geste(page, 'CM', 'donnee', 'etendue')).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await composeur(page, 'CM').locator('[data-composeur-champ="nombre"]').fill('100');
    await composeur(page, 'CM').locator('[data-composeur-champ="nombre"]').press('Enter');   // Entrée pose le nombre
    await expect(composeur(page, 'CM')).toHaveAttribute('open', '');
    expect(await texte(composeur(page, 'CM').locator('.calc-zone'))).toBe('Note = Compte des mots 100');
    await expect(nom).toHaveValue('Mon taux');
    // Le gabarit redessiné en entier (le rechargement de la grille, comme après une modification enregistrée) : le brouillon reste.
    await page.evaluate(() => window.chargerGrillePourModif('GM'));
    await ouvrirNote(page, 'CM');
    await expect(composeur(page, 'CM')).toHaveAttribute('open', '');
    await expect(composeur(page, 'CM').locator('[data-composeur-champ="nom"]')).toHaveValue('Mon taux');
    expect(await texte(composeur(page, 'CM').locator('.calc-zone'))).toBe('Note = Compte des mots 100');
    expect(erreurs).toEqual([]);
});

// UNE VRAIE COPIE ÉVALUÉE (le montage du banc 4a, codes posés dans Annoter), puis la copie verrouillée (lot #1173).
const MONTER_EVAL = `(reglage) => {
    const k = (b) => cle(b);
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{ id: 'G_T', nom: 'Grille fictive 4b', dansBibliotheque: true, criteres: [Object.assign({
        id: 'CR_T', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true,
        sousCriteres: [{ id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 1, retroaction: '' }] }, reglage)] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('echellesTemplates'), [{ id: 'ECH_F', nom: 'Échelle fictive', niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 59 }, { code: 'D', nom: 'en Développement', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }, { code: 'E', nom: 'Étendu', min: 90, max: 100 }] }]);
    // security-ok: fixture littérale du spec, aucune source externe.
    db.setSync(k('cartouches_G_T'), [{ id: 'CART_F', nom: 'Cartouche fictive', criteres: [{ id: 'CR_T' }], niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }] }]);
    db.setSync(k('modalitesEvaluation'), { activerCategorisationErreurs: false });   // security-ok: fixture littérale du spec
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
    return { champ: document.getElementById('eval_erreurs_CR_T').value, note: document.getElementById('note_algo_CR_T').textContent,
        niveau: document.getElementById('niveau_algo_CR_T').textContent, ligne: document.getElementById('formule_algo_CR_T').textContent,
        memo: JSON.parse(JSON.stringify(evaluationEnCours.donneesAlgorithmiques.CR_T || null)) };
}`;

test('une vraie copie évaluée, codes posés dans Annoter : le calcul retouché et gardé donne sa note', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.formulesAlgo, null, { timeout: 20000 });
    // Le critère tel que « Retoucher… Garder » l'écrit : la pénalité fixe à 2, retouchée à 2,5.
    const reglage = { modeleFormule: 'perso:calc1', paramsFormule: { pointsParErreur: 2 }, calculsProchain: 2,
        calculs: [{ id: 'calc1', nom: 'Mon calcul, d’après « Pénalité fixe »', sert: 'note', cas: { comptePondere: 'calcul' },
            jetons: [{ t: 'd', k: 'ponderation' }, { t: 'o', v: '−' }, { t: 'd', k: 'comptePondere' }, { t: 'o', v: '×' }, { t: 'n', v: 2.5 }] }] };
    await page.evaluate('(' + MONTER_EVAL + ')(' + JSON.stringify(reglage) + ')');
    const r = await page.evaluate('(' + TAPER_MOTS + ')(400)');
    expect(r.champ).toBe('3');
    expect(r.ligne).toBe('Note = 20 − 3 × 2,5 = 12,5 / 20');
    expect([r.note, r.niveau]).toEqual(['12,50', 'D']);
    expect(r.memo).toMatchObject({ erreurs: 3, mots: 400, noteCalculee: 12.5, pourcentage: 62.5, niveau: 'D' });
    expect(erreurs).toEqual([]);
});

// LA COPIE VERROUILLÉE APRÈS UN CHANGEMENT DE CALCUL (piège 2) : « Retoucher… Garder » change la note de la grille ; la
// copie verrouillée montre la note remise et la ligne du lot #1173.
const T = 't4b';
const MONTER_REMISE = `({ T }) => {
    const coursId = 'cours-4b';
    const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 59, valeurCalcul: 40 }, { code: 'D', nom: 'en Développement', min: 60, max: 74, valeurCalcul: 67 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }];
    window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);   // security-ok: fixture littérale du banc
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_groupesCours', [{ id: 'GC4B', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_groupeEtudiants', [{ da: 'DA4B', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC4B' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [{ id: 'P4B', titre: 'Rédaction fictive', type: 'travail', ponderation: 60, grilleId: 'G4B', echelleId: 'E4B', cartoucheId: 'CT4B', groupeCoursId: 'GC4B' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_cartouches_G4B', [{ id: 'CT4B', nom: 'Cartouche témoin', grilleId: 'G4B', contexte: '', criteres: [{ id: 'c2', nom: 'Langue écrite' }], commentaires: {} }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_grillesTemplates', [{ id: 'G4B', nom: 'Grille témoin', criteres: [   // security-ok: fixture littérale du banc
        { id: 'c2', nom: 'Langue écrite', ponderation: 100, type: 'algorithmique', modeleFormule: 'penalite_par_erreur', paramsFormule: { pointsParErreur: 2 } }] }]);
    window.db.setSync(T + '_echellesTemplates', [{ id: 'E4B', nom: 'IDME', niveaux }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_evaluationsSauvegardees', [{
        id: 'EV4B', etudiantDA: 'DA4B', productionId: 'P4B', groupeCoursId: 'GC4B', grilleId: 'G4B', echelleId: 'E4B', cartoucheId: 'CT4B',
        statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-20T08:00:00.000Z', noteFinale: 70, niveauFinal: 'D', verrouillee: true,
        ponderationCouverte: 100, criteres: [{ critereId: 'c2', critereNom: 'Langue écrite', niveauSelectionne: 'D', ponderation: 100, retroaction: '' }],
        donneesAlgorithmiques: { c2: { erreurs: 15, mots: 500, noteCalculee: 70, pourcentage: 70, niveau: 'D', retroaction: '' } },
        retroactionFinale: 'Rétroaction remise.', retroactionReecrite: true }]);   // security-ok: fixture littérale du banc
    window.trimestreActif = T;
    window.db.setSync('trimestreActif', T);
    window.db.setSync('backupNePlusRappeler', 'true');
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC4B' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GC4B', trimestreId: T });
}`;

test('la copie verrouillée après « Retoucher… Garder » : la note remise et sa ligne ; rien ne s’écrit', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.modifierEvaluation === 'function' && window.composeurCalcul, null, { timeout: 20000 });
    await page.evaluate('(' + MONTER_REMISE + ')(' + JSON.stringify({ T }) + ')');
    const avant = await page.evaluate((t) => JSON.stringify(window.db.getSync(t + '_evaluationsSauvegardees', [])), T);
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-grille-criteres'); });
    await page.evaluate(() => window.chargerGrillePourModif('G4B'));
    const a = page.locator('#listeCriteres .gabarit-algo[data-critere-id="c2"]');
    await a.locator('.atelier-algo-chaine .bc-etape[data-etape="note"]').evaluate((el) => el.click());
    await a.locator('.calc-carte[data-actif] [data-composeur-geste="retoucher"]').click();
    const det = a.locator('details.calc-composeur');
    await det.locator('[data-composeur-geste="retirer"]').click();
    await det.locator('[data-composeur-champ="nombre"]').fill('1');
    await det.locator('[data-composeur-geste="nombre"]').click();
    await det.locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(() => page.evaluate((t) => window.db.getSync(t + '_grillesTemplates', [])[0].criteres[0].modeleFormule, T)).toBe('perso:calc1');
    await page.evaluate(() => { window.afficherSection('evaluations'); window.modifierEvaluation('EV4B'); });
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV4B', null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    const vu = await page.evaluate(() => ({ note: document.getElementById('noteProduction1').textContent, ligne: document.getElementById('noteRemise1').textContent,
        cachee: document.getElementById('noteRemise1').classList.contains('u-hide') }));
    expect(vu.note).toBe('70 %');
    expect(vu.cachee).toBe(false);
    expect(vu.ligne).toBe('Note remise : 70 %. Avec le calcul actuel de la grille, elle serait de 85 %. Déverrouille l\'évaluation pour l\'appliquer.');
    expect(await page.evaluate((t) => JSON.stringify(window.db.getSync(t + '_evaluationsSauvegardees', [])), T)).toBe(avant);
    expect(erreurs).toEqual([]);
});

for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180], [700, 900]]) {
    test(`${largeur} px · le composeur ouvert et une carte de calcul composé : aucun défilement de côté, des cibles d’au moins 44 px`, async ({ page }) => {
        const erreurs = await ouvrir(page, 'GM', largeur, hauteur);
        await ouvrirNote(page, 'CM');
        await composerMoinsTrois(page, 'CM', 'Moins trois');
        await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
        await expect.poll(async () => (await enBase(page, 'GM')).modeleFormule).toBe('perso:calc1');
        await carteActive(page, 'CM').locator('[data-composeur-geste="modifier"]').click();
        await composeur(page, 'CM').scrollIntoViewIfNeeded();
        expect(await debord(page), 'aucun défilement de côté').toBeLessThanOrEqual(0);
        // Étape 4c : un bouton radio (« Ce calcul sert ») se touche par son étiquette, c'est elle qui mesure 44 px.
        const petites = await etape(page, 'CM').evaluate((e) => [...e.querySelectorAll('details.calc-composeur button, details.calc-composeur input, details.calc-composeur select, details.calc-composeur summary, .calc-carte .calc-actions button')]
            .map((x) => (x.type === 'radio' && x.closest('label')) || x)
            .filter((x) => x.getBoundingClientRect().height < 44).map((x) => (x.dataset.composeurGeste || x.dataset.action || x.tagName) + ' ' + Math.round(x.getBoundingClientRect().height)));
        expect(petites, 'cibles de moins de 44 px').toEqual([]);
        const hors = await etape(page, 'CM').evaluate((e) => {
            const det = e.querySelector('details.calc-composeur'), bord = det.getBoundingClientRect().right;
            return [...det.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > bord + 1).map((x) => x.tagName + '.' + x.className);
        });
        expect(hors, 'rien ne dépasse du composeur').toEqual([]);
        expect(erreurs).toEqual([]);
    });
}

test('captures · le composeur ouvert et une carte de calcul composé, 1 440 et 820 px, clair et sombre, les deux disciplines', async ({ page }) => {
    test.skip(!process.env.CAPTURES_CALCULS_4B, 'captures sur demande : CAPTURES_CALCULS_4B=<dossier>');
    test.setTimeout(300000);
    const dossier = process.env.CAPTURES_CALCULS_4B;
    for (const [g, id, nom] of [['GC', 'CC', 'calculs'], ['GM', 'CM', 'mots']]) {
        for (const [largeur, hauteur] of [[1440, 900], [820, 1180]]) {
            for (const mode of ['clair', 'sombre']) {
                await ouvrir(page, g, largeur, hauteur);
                await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                await ouvrirNote(page, id);
                await composerMoinsTrois(page, id, 'Moins trois');
                await composeur(page, id).locator('[data-action="garderCalculAlgo"]').click();
                await expect(carteActive(page, id).locator('.calc-texte')).toHaveText('Ton calcul.');
                await carteActive(page, id).locator('[data-composeur-geste="modifier"]').click();
                await page.evaluate(() => document.querySelectorAll('.modal-overlay.actif, [class*="notification"], [class*="toast"]').forEach((el) => el.remove()));
                await carteActive(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -60); });
                await page.waitForTimeout(400);
                await page.screenshot({ path: path.join(dossier, `calculs-4b-${nom}-carte-${largeur}-${mode}.png`) });
                await composeur(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -40); });
                await page.waitForTimeout(300);
                await page.screenshot({ path: path.join(dossier, `calculs-4b-${nom}-composeur-${largeur}-${mode}.png`) });
            }
        }
    }
});
