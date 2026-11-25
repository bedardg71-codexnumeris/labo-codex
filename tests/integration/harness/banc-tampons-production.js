// BANC « TAMPONS D'OBSERVATION SUR UNE PRODUCTION » (25 nov. 2026, « Tampons d'observation », lot 3).
// Un groupe fictif, trois productions fictives (une cible, deux cibles, aucune), des productions importées fictives
// (une image blanche servie par `recupererBlob`), des tampons créés ici. Rien n'est nommé d'après l'application
// (ni tampon, ni catégorie, ni critère fournis). Sert au banc du lot et à ses captures.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..', '..'), 'index.html');

export const T = 'a2032';
export const GC = 'GC_PR3';
export const ENSEMBLE = 'ENSC_PR3';
export const CIBLE_A = 'cible_pr3_a';
export const CIBLE_B = 'cible_pr3_b';
export const CAT = 'cat-banc-pr3';
export const CAT_AUTRE = 'cat-banc-pr3-autre';
export const P_UNE = { id: 'PR3_UNE', titre: 'Montage fictif', ciblesRenseignees: [CIBLE_A] };
export const P_DEUX = { id: 'PR3_DEUX', titre: 'Photo fictive', ciblesRenseignees: [CIBLE_A, CIBLE_B] };
export const P_SANS = { id: 'PR3_SANS', titre: 'Texte fictif' };
export const ZOE = { da: '3200001', nom: 'Fictif1', prenom: 'Zoé' };
export const YAN = { da: '3200002', nom: 'Fictif2', prenom: 'Yan' };
export const LOU = { da: '3200003', nom: 'Fictif3', prenom: 'Lou' };
export const criteres = () => [1, 2, 3].map((i) => ({ id: 'crit_pr3_' + i, texte: 'Critère fictif ' + i, essentiel: i < 3 }));
export const tamponId = (n) => 'custom-pr3-' + n;
export const TAMPON_AUTRE = 'custom-pr3-autre';
export const copie = (n, critere = '') => ({ id: tamponId(n), nom: 'Tampon fictif ' + n, categorieId: CAT, categorieNom: 'Catégorie fictive', critere, emoji: '' });
export const fichierDe = (eleve, production) => 'FT_' + eleve.da + '_' + production.id;
export const attendre = (page, ms) => page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);

/** Un instant à midi, heure de l'appareil : le jour lu ne dépend pas du fuseau. */
export const midi = (a, m, j) => new Date(a, m - 1, j, 12, 0, 0).getTime();
export const JOUR_1 = midi(2031, 10, 14);
export const JOUR_2 = midi(2031, 10, 16);
/** Un tampon posé, dans la forme que `poserAutocollant` écrit. */
export const pose = (tampon, instant, suite = '') => ({ id: 'STK_' + instant + suite, autocollantId: tampon, x: 0.3, y: 0.3, width: 0.04, height: 0.04 });
/** L'annotation d'une production importée : `pages` = { rang: [tampons posés] }. */
export const annotation = (eleve, production, pages) => ({
    id: 'AN_' + fichierDe(eleve, production), fichierId: fichierDe(eleve, production), etudiantDA: eleve.da,
    pages: Object.fromEntries(Object.entries(pages).map(([rang, stickers]) => [rang, { strokes: [], textAnnotations: [], shapes: [], stickers }])),
    dateModification: new Date(JOUR_1).toISOString()
});

const patternsAttendus = [/version\.json.*access control/i, /Cross origin requests are only supported/i, /Not allowed to load local resource/i,
    /Aucune échelle de performance configurée/, /Grille introuvable ou sans critères/, /The operation is insecure/, /Failed to load resource/i, /net::ERR_/i];

/**
 * Monte l'espace fictif. Rend le suivi `{ erreurs }`.
 * @param {{ annotations?: Array, inscriptions?: Array, pratique?: 'cibles'|'sommative', observation?: boolean, nomTampon1?: string, sansFichierPour?: Array, index?: string }} o
 *   observation : la catégorie des trois tampons est cochée « D'observation » (vrai d'office) ; pratique : celle du groupe.
 */
export async function monter(page, o = {}) {
    const { annotations = [], inscriptions = [], pratique = 'cibles', observation = true, nomTampon1 = 'Tampon fictif 1' } = o;
    const suivi = { erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { if (!estAttendue(e.message)) suivi.erreurs.push('pageerror: ' + e.message); });
    page.on('console', (m) => { if (m.type() === 'error' && !estAttendue(m.text())) suivi.erreurs.push('console.error: ' + m.text()); });
    // Le rappel de sauvegarde paraît après une écriture, à son heure : il couvrirait l'écran qu'on joue.
    await page.addLocatorHandler(page.locator('#overlay-backup-reminder'), async () => {
        await page.evaluate(() => { const r = document.getElementById('overlay-backup-reminder'); if (r) r.remove(); });
    });
    await page.goto(o.index || indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.InscriptionsCibles && window.travauxOutils
        && window.travauxStockage && window.travauxUI && typeof window.executerActionEval === 'function', null, { timeout: 20000 });
    await page.evaluate((d) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const { T, GC, ENSEMBLE, CIBLE_A, CIBLE_B, CAT, CAT_AUTRE } = d;
        const coursId = 'cours-pr3';
        const niveaux = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 50], ['2', 'Acquis', 100]]
            .map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 33, max: i * 33 + 32, couleur: 'var(--gris-moyen)' }));
        const ensemble = { id: ENSEMBLE, coursId, cibles: [
            { id: CIBLE_A, etiquette: 'Cible fictive A', enonce: '', poids: 1, terminale: false, criteres: d.criteres },
            { id: CIBLE_B, etiquette: 'Cible fictive B', enonce: '', poids: 1, terminale: false, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2032, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: d.pratique === 'cibles' ? 'cib-pr3' : 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', d.eleves.map((e) => Object.assign({ groupe: '01', coursId, groupeCoursId: GC }, e)));
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ECH_PR3', nom: 'Échelle fictive', niveaux }]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cib-pr3', nom: 'Par standards fictive', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
            configuration: { type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: 'ECH_PR3', niveauSansDonnee: '0' } }]);
        window.db.setSync(T + '_productions', d.productions.map((p, i) => Object.assign({ type: 'travail', numero: i + 1, groupeCoursId: GC, ponderation: 10 }, p)));
        window.db.setSync(T + '_inscriptionsCibles', d.inscriptions);
        // Les productions importées : une par étudiant·e et par production, sauf Lou (une ligne de tableau sans fichier).
        const fichiers = [];
        d.eleves.slice(0, 2).forEach((e) => d.productions.forEach((p) => fichiers.push({
            id: 'FT_' + e.da + '_' + p.id, etudiantDA: e.da, productionId: p.id, coursId, groupeCoursId: GC, nomFichier: p.id + '.png', typeMIME: 'image/png',
            tailleFichier: 70, nombrePages: 1, stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2031-10-01T12:00:00.000Z',
            dateModification: '2031-10-01T12:00:00.000Z', source: 'import-local', importePar: 'single', blobStatut: 'present', statut: 'actif' })));
        window.db.setSync(T + '_fichiersTravaux', fichiers);
        window.db.setSync(T + '_annotationsTravaux', d.annotations);
        window.db.setSync(T + '_evaluationsSauvegardees', fichiers.map((f) => ({ id: 'EV_' + f.id, etudiantDA: f.etudiantDA, productionId: f.productionId, fichierId: f.id,
            statutRemise: 'importe', statutIntegrite: 'recevable', criteres: [], noteFinale: 80, dateEvaluation: '2031-10-02T12:00:00.000Z', verrouillee: false })));
        // Trois tampons dans une catégorie à soi (le premier déclare le premier critère de la cible A), un quatrième
        // dans une autre catégorie, jamais cochée.
        const image = (texte) => {
            const c = document.createElement('canvas'); c.width = 64; c.height = 64;
            const x = c.getContext('2d'); x.fillStyle = '#000'; x.beginPath(); x.arc(32, 32, 28, 0, 7); x.fill();
            x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texte, 32, 34);
            return c.toDataURL('image/png');
        };
        const tampons = [1, 2, 3].map((n) => ({ id: 'custom-pr3-' + n, nom: n === 1 ? d.nomTampon1 : 'Tampon fictif ' + n, categorie: CAT }))
            .concat([{ id: 'custom-pr3-autre', nom: 'Tampon fictif hors observation', categorie: CAT_AUTRE }]);
        const pers = {};
        tampons.forEach((t, i) => { pers[t.id] = { nom: t.nom, imageBase64: image(i < 3 ? String(i + 1) : '×') }; });
        pers['custom-pr3-1'].critere = d.criteres[0].texte;
        window.db.setSync('categoriesPerso', [{ id: CAT, nom: 'Catégorie fictive' }, { id: CAT_AUTRE, nom: 'Autre catégorie fictive' }]);
        window.db.setSync('nomsCategoriesTampons', Object.assign({}, window.db.getSync('nomsCategoriesTampons', null) || {}, { [CAT]: 'Catégorie fictive', [CAT_AUTRE]: 'Autre catégorie fictive' }));
        window.db.setSync('tamponsPersonnalises', tampons);
        window.db.setSync('personnalisationObservations', pers);
        if (d.observation) window.db.setSync('categoriesObservation', [CAT]);
        window.travauxOutils.rechargerTamponsPersonnalises();
        // L'image de chaque production importée (WebKit refuse le Blob en IndexedDB au banc).
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 400, 600);
        const octets = Uint8Array.from(atob(cv.toDataURL('image/png').split(',')[1]), (c) => c.charCodeAt(0));
        const blob = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return String(id).indexOf('FT_') === 0 ? blob : original.apply(this, arguments); };
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
    }, { T, GC, ENSEMBLE, CIBLE_A, CIBLE_B, CAT, CAT_AUTRE, criteres: criteres(), eleves: [ZOE, YAN, LOU], productions: [P_UNE, P_DEUX, P_SANS],
        annotations, inscriptions, pratique, observation, nomTampon1 });
    return suivi;
}

/** Le profil d'un·e étudiant·e, section « Cibles ». */
export async function ouvrirProfilCibles(page, eleve) {
    await page.evaluate((da) => {
        const rappel = document.getElementById('overlay-backup-reminder'); if (rappel) rappel.remove();   // le rappel de sauvegarde, après une écriture
        window.afficherSection('suivi'); window.afficherProfilComplet(da);
    }, eleve.da);
    await page.locator('[data-action="changerSectionProfil"][data-param="cibles"]').click();
    await page.locator('.pc-panneau').waitFor();
    await attendre(page, 150);   // les images des tampons
}

/** Le tableau des cibles, puis « Inscrire pour une production ». */
export async function ouvrirParProduction(page, eleve, production) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); window.TableauNotation.afficher(); });
    await page.locator('.tc-tableau').waitFor();
    await page.locator('[data-tc="par-production"]').click();
    await page.locator('.tc-fenetre').waitFor();
    if (eleve) await page.locator('.tc-pr-eleve').selectOption(eleve.da);
    if (production) await page.locator('.tc-pr-production').selectOption(production.id);
    await attendre(page, 150);
}

/** La production importée d'un·e étudiant·e, ouverte en Annoter (le vrai écran). */
export async function ouvrirEnAnnoter(page, eleve, production) {
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active'), null, { timeout: 10000 });
    await attendre(page, 400);
    await page.evaluate((v) => window.executerActionEval({ value: v }), `annoter|${fichierDe(eleve, production)}|${production.id}`);
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 10000 });
    await attendre(page, 2000);
    await page.evaluate(() => { const r = document.getElementById('overlay-backup-reminder'); if (r) r.remove(); });
}

/** Pose un tampon par le vrai chemin : le tampon choisi, puis un vrai clic sur la production. */
export async function poserVraiment(page, tampon, fx = 0.3, fy = 0.5) {
    await page.evaluate((id) => window.travauxOutils.setAutocollantActif(id), tampon);
    const p = await page.evaluate(([x, y]) => {
        const canevas = document.getElementById('travaux-canvas-annotation');
        if (canevas.getBoundingClientRect().bottom > window.innerHeight) window.scrollTo(0, document.scrollingElement.scrollHeight);
        const r = canevas.getBoundingClientRect();
        return { x: r.left + r.width * x, y: r.top + r.height * y };
    }, [fx, fy]);
    await page.mouse.click(p.x, p.y);
}

export const inscriptions = (page) => page.evaluate((T) => window.db.getSync(T + '_inscriptionsCibles', []), T);
export const annotationsRangees = (page) => page.evaluate((T) => window.db.getSync(T + '_annotationsTravaux', []), T);
export const dateLisible = (page, instant) => page.evaluate((i) => window.TableauCibles.dateLisible(window.InscriptionsCibles.dateDuJour(new Date(i))), instant);
