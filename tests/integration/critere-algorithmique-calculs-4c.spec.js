import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ÉTAPE 4c DU CRITÈRE ALGORITHMIQUE (27 oct. 2026), dans un vrai WebKit, contre le vrai index.html. Consigne
// `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4c.md`, § 7 ; ébauche validée
// `plans de travail/EBAUCHE-2026-10-26-calculs.html`. Deux disciplines fictives : « unités manquantes » sur « calculs »,
// « erreurs » sur « mots ».
//   · composer « Compte pondéré des X ÷ Compte des Y × 100 » POUR LES PHRASES, le garder : la liste, la palette, la chaîne ;
//     la note du critère ne change pas ;
//   · le poser dans la phrase du décompte (palette) et voir la simulation ;
//   · une table « Selon » ce calcul ;
//   · « Retirer » refusé tant qu'un texte le lit ;
//   · une VRAIE copie évaluée (codes posés dans Annoter) : la phrase sous le critère et le PDF portent la valeur et le cas ;
//     la note est celle de la même grille sans le calcul ;
//   · « Ce calcul sert » change la zone sans perdre le brouillon ;
//   · 1 440, 1 180, 820 et 700 px : aucun défilement de côté, des cibles d'au moins 44 px ;
//   · captures (CAPTURES_CALCULS_4C=<dossier>) : la liste, la palette avec le bloc, une table « Selon » un calcul, 1 440 et
//     820 px, clair et sombre, les deux disciplines.
//
// BREAK-TEST (fait le 27 oct. 2026, restauré) : `garderCalcul` qui choisit aussi la note pour un calcul des phrases →
// « composer pour les phrases » rougit (le message dit « il donne maintenant la note. », et le critère passe à `perso:calc1`).

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
const etape = (page, id, e) => atelier(page, id).locator(`.atelier-algo-etape[data-etape="${e || 'note'}"]`);
const composeur = (page, id) => etape(page, id).locator('details.calc-composeur');
const geste = (page, id, g, v) => composeur(page, id).locator(`[data-composeur-geste="${g}"]` + (v ? `[data-valeur="${v}"]` : ''));
const liste = (page, id) => etape(page, id).locator('.calc-perso');
const bloc = (page, id) => atelier(page, id).locator('.palette-algo-bloc[data-jeton="{calc1}"]');
const enBase = (page, g) => page.evaluate(async (id) => ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id).criteres[0], g);
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const texte = (loc) => loc.evaluate((e) => e.textContent.replace(/\s+/g, ' ').trim());
const cliquerDom = (loc) => loc.evaluate((el) => el.click());
const changer = (loc, valeur) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); }, valeur);
const ouvrirEtape = async (page, id, e) => {
    await cliquerDom(atelier(page, id).locator(`.atelier-algo-chaine .bc-etape[data-etape="${e}"]`));
    await expect(etape(page, id, e)).toHaveAttribute('data-ouverte', '');
};

/** Composer « Compte pondéré des X ÷ Compte des Y × 100 » pour les phrases, sans le garder. */
async function composerTaux(page, id, nom) {
    await composeur(page, id).locator('summary').click();
    await composeur(page, id).locator('[data-composeur-champ="nom"]').fill(nom);
    await composeur(page, id).locator('[data-composeur-sert="phrases"]').check();
    await geste(page, id, 'donnee', 'comptePondere').click();
    await geste(page, id, 'operation', '÷').click();
    await geste(page, id, 'donnee', 'etendue').click();
    await geste(page, id, 'operation', '×').click();
    await composeur(page, id).locator('[data-composeur-champ="nombre"]').fill('100');
    await geste(page, id, 'nombre').click();
}
async function garderTaux(page, g, id, nom) {
    await ouvrirEtape(page, id, 'note');
    await composerTaux(page, id, nom);
    await composeur(page, id).locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => ((await enBase(page, g)).calculs || []).length).toBe(1);
}

test('composer pour les phrases « Compte pondéré des X ÷ Compte des Y × 100 », le garder : la liste, la palette, la chaîne ; la note ne bouge pas', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM');
    await ouvrirEtape(page, 'CM', 'note');
    await composerTaux(page, 'CM', 'Taux pour 100');
    expect(await texte(composeur(page, 'CM').locator('.calc-zone'))).toBe('Taux pour 100 = Compte pondéré des erreurs ÷ Compte des mots × 100');
    // La copie fictive de départ : « Quelques » (le quart du plancher de la pénalité normalisée, 500 mots).
    await expect(composeur(page, 'CM').locator('[data-composeur-copie]')).toHaveText(/^Taux pour 100 = \d+ ÷ 500 × 100 = [\d,]+$/);
    // Les choix « vaut 0 » d'un calcul des phrases : jamais « La note entière ».
    const choix = await composeur(page, 'CM').locator('select[data-composeur-cas="etendue"] option').allTextContents();
    expect(choix).toEqual(['Sans valeur', 'La valeur 0']);
    await composeur(page, 'CM').locator('[data-action="garderCalculAlgo"]').click();
    await expect(etape(page, 'CM').locator('.calc-message')).toHaveText('Calcul « Taux pour 100 » gardé : il est dans la palette et dans le menu « Selon ».');
    const c = await enBase(page, 'GM');
    expect(c.modeleFormule).toBe('penalite_normalisee');
    expect(c.calculs).toEqual([{ id: 'calc1', nom: 'Taux pour 100', sert: 'phrases', cas: {},
        jetons: [{ t: 'd', k: 'comptePondere' }, { t: 'o', v: '÷' }, { t: 'd', k: 'etendue' }, { t: 'o', v: '×' }, { t: 'n', v: 100 }] }]);
    // Aucune carte pour lui dans « Le calcul de la note » ; la carte choisie reste la même.
    await expect(etape(page, 'CM').locator('.calc-carte')).toHaveCount(3);
    await expect(etape(page, 'CM').locator('.calc-carte[data-actif] input[type="radio"]')).toHaveValue('penalite_normalisee');
    // La liste.
    await expect(etape(page, 'CM').locator('h4.calc-titre').last()).toHaveText('Tes calculs pour les phrases et les tables');
    const item = liste(page, 'CM').locator('.calc-perso-item');
    await expect(item).toHaveCount(1);
    await expect(item.locator('.calc-nom')).toHaveText('Taux pour 100');
    expect(await texte(item.locator('.calc-formule'))).toBe('Compte pondéré des erreurs ÷ Compte des mots × 100');
    await expect(item.locator('.calc-legende')).toHaveText(/^Sur la copie fictive, il vaudrait [\d,]+\. Il est dans la palette et dans le menu « Selon » des tables\.$/);
    // La chaîne, la palette.
    await expect(etape(page, 'CM').locator('[data-resume]')).toHaveText('Pénalité proportionnelle à la longueur, sur 20 · 1 calcul pour tes phrases');
    await expect(bloc(page, 'CM').locator('.palette-algo-bloc-nom')).toHaveText('Taux pour 100');
    await expect(bloc(page, 'CM').locator('.palette-algo-bloc-aide')).toHaveText('Ton calcul : sa valeur sur la copie évaluée.');
    await expect(bloc(page, 'CM').locator('.palette-algo-bloc-valeur')).toHaveText(/^[\d,]+$/);
    expect(await bloc(page, 'CM').evaluate((b) => b.closest('.palette-algo-groupe').getAttribute('aria-label'))).toBe('Ce qui se remplit quand tu évalues la copie');
    expect(erreurs).toEqual([]);
});

test('« Ce calcul sert » change la zone sans perdre le brouillon ; le calcul de la note ne passe pas aux phrases', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GC');
    await ouvrirEtape(page, 'CC', 'note');
    await composeur(page, 'CC').locator('summary').click();
    await expect(composeur(page, 'CC').locator('[data-composeur-tete]')).toHaveText('Note =');
    await composeur(page, 'CC').locator('[data-composeur-sert="phrases"]').check();
    await expect(composeur(page, 'CC').locator('[data-composeur-tete]')).toHaveText('Ton calcul =');
    await geste(page, 'CC', 'donnee', 'compte').click();
    await composeur(page, 'CC').locator('[data-composeur-champ="nom"]').pressSequentially('Mon compte');
    await expect(composeur(page, 'CC').locator('[data-composeur-tete]')).toHaveText('Mon compte =');
    await expect(composeur(page, 'CC').locator('[data-composeur-champ="nom"]')).toBeFocused();
    await composeur(page, 'CC').locator('[data-composeur-sert="note"]').check();
    await expect(composeur(page, 'CC').locator('[data-composeur-tete]')).toHaveText('Note =');
    await expect(composeur(page, 'CC').locator('[data-composeur-champ="nom"]')).toHaveValue('Mon compte');
    expect(await texte(composeur(page, 'CC').locator('.calc-zone'))).toBe('Note = Compte des unités manquantes');
    await expect(composeur(page, 'CC')).toHaveAttribute('open', '');
    // Gardé pour la note, puis « Modifier ce calcul » vers les phrases : refusé, il donne la note.
    await composeur(page, 'CC').locator('[data-action="garderCalculAlgo"]').click();
    await expect.poll(async () => (await enBase(page, 'GC')).modeleFormule).toBe('perso:calc1');
    await etape(page, 'CC').locator('.calc-carte[data-actif] [data-composeur-geste="modifier"]').click();
    await composeur(page, 'CC').locator('[data-composeur-sert="phrases"]').check();
    await expect(composeur(page, 'CC').locator('[data-composeur-refus]')).toHaveText('Ce calcul donne la note : choisis d’abord un autre calcul.');
    await cliquerDom(composeur(page, 'CC').locator('[data-action="garderCalculAlgo"]'));   // `aria-disabled` : le geste est refusé, rien ne s'écrit
    expect((await enBase(page, 'GC')).calculs[0].sert).toBe('note');
    expect(erreurs).toEqual([]);
});

test('le poser dans la phrase du décompte, la simulation ; une table « Selon » ce calcul ; « Retirer » refusé tant qu’un texte le lit', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM');
    await garderTaux(page, 'GM', 'CM', 'Taux pour 100');
    // Le bloc, au curseur, dans le décompte (« Ce que l'étudiant·e lit »).
    await ouvrirEtape(page, 'CM', 'eleve');
    const zone = atelier(page, 'CM').locator('textarea[data-enonce-cle="decompte"]');
    const vue = zone.locator('xpath=following-sibling::*[1]');
    await vue.evaluate((el) => { el.focus(); window.composeurBadges.placerCaret(el, el.textContent.length); });
    await expect(bloc(page, 'CM')).not.toHaveAttribute('aria-disabled', 'true');
    // L'ouverture de l'étape défile en douceur (`atelierAlgo`) : la mesure part d'un défilement immobile, sinon c'est
    // la fin de ce défilement qu'on lirait (29 px mesurés, le bloc n'y étant pour rien).
    await expect.poll(async () => { const a = await page.evaluate(() => window.scrollY); await page.waitForTimeout(150); return a === await page.evaluate(() => window.scrollY); }).toBe(true);
    const y = await page.evaluate(() => window.scrollY);
    await cliquerDom(bloc(page, 'CM'));
    await expect(zone).toHaveValue(/\{calc1\}$/);
    await expect(vue.locator('[data-jeton="{calc1}"]')).toContainText('Taux pour 100');
    // Piège 3 : le focus reste dans la phrase, le défilement ne saute pas ; on tape à la suite.
    await expect(vue).toBeFocused();
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThanOrEqual(2);
    await page.keyboard.type(' x');
    await expect(vue).toBeFocused();
    // Les zones du bilan ne l'offrent pas.
    const bilan = atelier(page, 'CM').locator('textarea[data-enonce-cle="priorite"]');
    if (await bilan.count()) {
        await bilan.locator('xpath=following-sibling::*[1]').evaluate((el) => { el.focus(); window.composeurBadges.placerCaret(el, 0); });
        await expect(bloc(page, 'CM')).toHaveAttribute('aria-disabled', 'true');
    }
    await changer(zone, 'Ta copie : {erreurs} {nomErreurs}, soit {calc1} pour 100 {nomMots}.');
    await expect.poll(async () => (await enBase(page, 'GM')).enonces.decompte).toBe('Ta copie : {erreurs} {nomErreurs}, soit {calc1} pour 100 {nomMots}.');
    // La simulation : « Pour toi » / le PDF de l'étudiant·e lisent la valeur.
    const pdf = atelier(page, 'CM').locator('.apercu-algo [data-lecture="pdf"]');
    await expect(pdf).toContainText(/soit [\d,]+ pour 100/);
    await expect(pdf).not.toContainText('{calc1}');
    // Une table « Selon » ce calcul : ses cas de départ.
    await ouvrirEtape(page, 'CM', 'paliers');
    await cliquerDom(etape(page, 'CM', 'paliers').locator('[data-action="ajouterTableCasAlgo"]'));
    const carte = atelier(page, 'CM').locator('.table-cas--enseignant').first();
    await expect(carte.locator('select option[value="calc1"]')).toHaveText('Ton calcul « Taux pour 100 »');
    await changer(carte.locator('select'), 'calc1');
    await expect.poll(async () => (await enBase(page, 'GM')).tablesCas[0].selon).toBe('calc1');
    const quand = await atelier(page, 'CM').locator('.table-cas--enseignant').first().locator('.table-cas-quand').evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
    expect(quand).toEqual(['Sans valeur', 'Jusqu’à Retirer ce cas', 'Au-delà de 1']);
    await expect(etape(page, 'CM', 'paliers').locator('[data-resume]')).toHaveText('Aucune limite, aucun palier · une table selon ton calcul « taux pour 100 »');
    // « Retirer » : refusé, un texte et une table le lisent ; rien n'est écrit.
    await ouvrirEtape(page, 'CM', 'note');
    await cliquerDom(liste(page, 'CM').locator('[data-action="retirerCalculAlgo"]'));
    await expect(etape(page, 'CM').locator('.calc-message')).toHaveText('Une table ou un texte lit ce calcul : retire-l’en d’abord.');
    expect((await enBase(page, 'GM')).calculs).toHaveLength(1);
    expect(erreurs).toEqual([]);
});

// UNE VRAIE COPIE ÉVALUÉE — le montage de 3b et 4b (l'évaluation rendue par `cartoucheSelectionnee`, la copie ouverte par
// l'évènement, les codes posés par Annoter), sur un critère dont le décompte et une table lisent un calcul pour les phrases.
const MONTER_EVAL = `(avecCalcul) => {
    const k = (b) => cle(b);
    const taux = [{ t: 'd', k: 'comptePondere' }, { t: 'o', v: '÷' }, { t: 'd', k: 'etendue' }, { t: 'o', v: '×' }, { t: 'n', v: 100 }];
    const critere = { id: 'CR_T', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, facteurNormalisation: 500, codesDepuisSousCriteres: true,
        modeleProjection: 'aucune',
        sousCriteres: [{ id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 1, retroaction: '' }] };
    if (avecCalcul) Object.assign(critere, {
        calculs: [{ id: 'calc1', nom: 'Taux pour 100', sert: 'phrases', jetons: taux, cas: {} }], calculsProchain: 2,
        enonces: { decompte: 'Ta copie : {erreurs} erreurs, soit {calc1} pour 100 mots.' },
        tablesCas: [{ id: 't1', selon: 'calc1', cas: [{ genre: 'vide', texte: '' }, { genre: 'max', borne: 1, texte: 'Sous 1 pour 100 : bien.' }, { genre: 'audela', texte: 'Au-delà de 1 pour 100 ({calc1}) : revois tes accords.' }] }] });
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    db.setSync(k('grillesTemplates'), [{ id: 'G_T', nom: 'Grille fictive 4c', dansBibliotheque: true, criteres: [critere] }]);
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
    // La copie ouverte, six codes posés, 400 mots : 6 ÷ 400 × 100 = 1,5.
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_T', productionId: 'P_T' } } }));
    const shapes = [];
    for (let i = 0; i < 4; i++) shapes.push({ type: 'errfr_1', x: i, y: 1 });
    for (let i = 0; i < 2; i++) shapes.push({ type: 'errfr_3', x: i, y: 2 });
    window.travauxAnnotation.getAnnotationCourante = () => ({ id: 'A_T', fichierId: 'F_T', pages: { 1: { shapes } } });
    window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
    const mots = document.getElementById('eval_mots_CR_T');
    mots.value = '400';
    mots.dispatchEvent(new Event('input', { bubbles: true }));
    const memo = JSON.parse(JSON.stringify(evaluationEnCours.donneesAlgorithmiques.CR_T || null));
    const ev = { id: 'EV_F', etudiantDA: 'DA-F', productionId: 'P_T', grilleId: 'G_T', echelleId: 'ECH_F', cartoucheId: 'CART_F',
        statutRemise: 'remis', statutIntegrite: 'recevable', dateEvaluation: '2026-10-27T12:00:00.000Z',
        criteres: [{ critereId: 'CR_T', critereNom: 'Langue écrite', niveauSelectionne: memo && memo.niveau, ponderation: 20, retroaction: memo && memo.retroaction }],
        donneesAlgorithmiques: { CR_T: memo }, noteFinale: memo && memo.pourcentage, niveauFinal: memo && memo.niveau };
    const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(window.syntheseRetroactionData.construireFeedback(ev, { id: 'F_T' }, null));
    return { champ: document.getElementById('eval_erreurs_CR_T').value, sous: document.getElementById('comm_CR_T').textContent,
        note: document.getElementById('note_algo_CR_T').textContent, memo, html };
}`;

test('une vraie copie évaluée · codes posés dans Annoter : la phrase sous le critère et le PDF portent la valeur et le cas ; la note est inchangée', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const monter = async (avecCalcul) => {
        await page.goto(indexHtml);
        await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.syntheseRetroactionData && window.tablesCasAlgo, null, { timeout: 20000 });
        return page.evaluate('(' + MONTER_EVAL + ')(' + JSON.stringify(avecCalcul) + ')');
    };
    const sans = await monter(false);
    const r = await monter(true);
    expect(r.champ).toBe('6');
    expect(r.sous).toBe('Ta copie : 6 erreurs, soit 1,5 pour 100 mots. Au-delà de 1 pour 100 (1,5) : revois tes accords.');
    expect(r.memo.retroaction).toBe(r.sous);
    expect(r.html).toContain('Ta copie : 6 erreurs, soit 1,5 pour 100 mots. Au-delà de 1 pour 100 (1,5) : revois tes accords.');
    expect(r.html).not.toContain('{calc1}');
    // La note : celle de la même grille sans le calcul.
    expect([r.note, r.memo.noteCalculee, r.memo.pourcentage, r.memo.niveau]).toEqual([sans.note, sans.memo.noteCalculee, sans.memo.pourcentage, sans.memo.niveau]);
    if (process.env.CAPTURES_CALCULS_4C) {
        const p = await page.context().newPage();
        await p.setContent(r.html);
        await p.locator('body').screenshot({ path: path.join(process.env.CAPTURES_CALCULS_4C, 'calculs-4c-pdf-copie-evaluee.png') });
        await p.close();
    }
    expect(erreurs).toEqual([]);
});

test('le nom d’un calcul est un texte de l’enseignant·e : dans la liste, la palette, le menu « Selon » et la phrase, jamais du balisage', async ({ page }) => {
    const erreurs = await ouvrir(page, 'GM');
    const piege = '<img src=x onerror="window.__piege=1">Taux';
    await garderTaux(page, 'GM', 'CM', piege);
    await expect(liste(page, 'CM').locator('.calc-nom')).toHaveText(piege);
    await expect(bloc(page, 'CM').locator('.palette-algo-bloc-nom')).toHaveText(piege);
    await ouvrirEtape(page, 'CM', 'paliers');
    await cliquerDom(etape(page, 'CM', 'paliers').locator('[data-action="ajouterTableCasAlgo"]'));
    await expect(atelier(page, 'CM').locator('.table-cas--enseignant select option[value="calc1"]')).toHaveText('Ton calcul « ' + piege + ' »');
    // L'image du piège, pas les icônes de l'application (les chevrons et la corbeille des cas d'une table).
    expect(await atelier(page, 'CM').locator('img[src="x"]').count()).toBe(0);
    expect(await page.evaluate(() => window.__piege)).toBeUndefined();
    expect(erreurs).toEqual([]);
});

for (const [largeur, hauteur] of [[1440, 900], [1180, 820], [820, 1180], [700, 900]]) {
    test(`${largeur} px · « Ce calcul sert », la liste et la table « Selon » un calcul : aucun défilement de côté, des cibles d’au moins 44 px`, async ({ page }) => {
        const erreurs = await ouvrir(page, 'GM', largeur, hauteur);
        await garderTaux(page, 'GM', 'CM', 'Taux pour 100');
        await liste(page, 'CM').locator('[data-composeur-geste="modifier"]').click();
        await expect(composeur(page, 'CM').locator('[data-composeur-sert="phrases"]')).toBeChecked();
        await composeur(page, 'CM').scrollIntoViewIfNeeded();
        expect(await debord(page), 'aucun défilement de côté').toBeLessThanOrEqual(0);
        const petites = await etape(page, 'CM').evaluate((e) => [...e.querySelectorAll('.calc-sert-choix, .calc-perso button')]
            .filter((x) => x.getBoundingClientRect().height < 44).map((x) => (x.dataset.composeurGeste || x.dataset.action || x.className) + ' ' + Math.round(x.getBoundingClientRect().height)));
        expect(petites, 'cibles de moins de 44 px').toEqual([]);
        const hors = await etape(page, 'CM').evaluate((e) => {
            const fautifs = [];
            [e.querySelector('details.calc-composeur'), e.querySelector('.calc-perso')].forEach((boite) => {
                const bord = boite.getBoundingClientRect().right;
                [...boite.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > bord + 1).forEach((x) => fautifs.push(x.tagName + '.' + x.className));
            });
            return fautifs;
        });
        expect(hors, 'rien ne dépasse du composeur ni de la liste').toEqual([]);
        await ouvrirEtape(page, 'CM', 'paliers');
        await cliquerDom(etape(page, 'CM', 'paliers').locator('[data-action="ajouterTableCasAlgo"]'));
        await changer(atelier(page, 'CM').locator('.table-cas--enseignant select').first(), 'calc1');
        await expect.poll(async () => (await enBase(page, 'GM')).tablesCas[0].selon).toBe('calc1');
        expect(await debord(page), 'aucun défilement de côté, table comprise').toBeLessThanOrEqual(0);
        expect(erreurs).toEqual([]);
    });
}

test('captures · la liste, la palette avec le bloc, une table « Selon » un calcul ; 1 440 et 820 px, clair et sombre, les deux disciplines', async ({ page }) => {
    test.skip(!process.env.CAPTURES_CALCULS_4C, 'captures sur demande : CAPTURES_CALCULS_4C=<dossier>');
    test.setTimeout(300000);
    const dossier = process.env.CAPTURES_CALCULS_4C;
    for (const [g, id, nom] of [['GC', 'CC', 'calculs'], ['GM', 'CM', 'mots']]) {
        for (const [largeur, hauteur] of [[1440, 900], [820, 1180]]) {
            for (const mode of ['clair', 'sombre']) {
                await ouvrir(page, g, largeur, hauteur);
                await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                await garderTaux(page, g, id, 'Taux pour 100');
                await page.evaluate(() => document.querySelectorAll('.modal-overlay.actif, [class*="notification"], [class*="toast"]').forEach((el) => el.remove()));
                await liste(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -160); });
                await page.waitForTimeout(400);
                await page.screenshot({ path: path.join(dossier, `calculs-4c-${nom}-liste-${largeur}-${mode}.png`) });
                await ouvrirEtape(page, id, 'eleve');
                const vue = atelier(page, id).locator('textarea[data-enonce-cle="decompte"]').locator('xpath=following-sibling::*[1]');
                await vue.evaluate((el) => { el.focus(); window.composeurBadges.placerCaret(el, 0); });
                await bloc(page, id).evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -120); });
                await page.waitForTimeout(400);
                await page.screenshot({ path: path.join(dossier, `calculs-4c-${nom}-palette-${largeur}-${mode}.png`) });
                await ouvrirEtape(page, id, 'paliers');
                await cliquerDom(etape(page, id, 'paliers').locator('[data-action="ajouterTableCasAlgo"]'));
                await changer(atelier(page, id).locator('.table-cas--enseignant select').first(), 'calc1');
                await expect.poll(async () => (await enBase(page, g)).tablesCas[0].selon).toBe('calc1');
                await atelier(page, id).locator('.table-cas--enseignant').first().evaluate((el) => { el.scrollIntoView(); window.scrollBy(0, -110); });
                await page.waitForTimeout(400);
                await page.screenshot({ path: path.join(dossier, `calculs-4c-${nom}-table-${largeur}-${mode}.png`) });
            }
        }
    }
});
