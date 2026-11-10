import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md. Ce banc juge :
//   · le panneau : sans production avec sa grille dans le groupe-cours actif réel, « Commencer » ne
//     lance rien et le panneau dit pourquoi ; avec elle, le parcours part ;
//   · le chemin avec fichier, de bout en bout, en faisant les gestes : une grille NEUVE, un critère
//     algorithmique réglé dans son atelier, la grille associée à une production, une production
//     importée, deux codes posés dans Annoter, le passage en Évaluer ; la rétroaction contient le
//     décompte sous le critère et les deux codes dans « Spécifique » ; le verrou mène à la fin ;
//   · les étapes sautées ne comptent pas dans « n sur … » ; le chemin sans fichier (« Rien à
//     importer ») ; « Plus tard » puis « Reprendre ».
// ⚠ Chromium seulement dans le cloud (WebKit n'y existe pas) : le verdict WebKit se prend sur le Mac.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-8
// Noms d'étudiant·es manifestement fictifs (règle 6 de CLAUDE.md).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';
const T = 'a2026';
// Les cibles qu'une bulle couvre sous 800 px (voir `toucher`), écrites avec les captures.
const couverts = [];

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

/**
 * Un espace réel de banc : un trimestre, un cours, un groupe-cours actif, deux étudiant·es, une
 * échelle, une grille déjà employée (« Grille de la rédaction 1 ») et deux productions : la
 * première a sa grille, la seconde (« Rédaction 2 ») attend la sienne. `avecGrille: false` : aucune
 * production n'a de grille (le refus du panneau).
 */
async function ouvrirEspace(page, largeur, { clair = false, hauteur = 900, avecGrille = true, verrouDejaPose = false } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.addInitScript(releveDesAvisSurLaBulle);
    // Le rappel de sauvegarde paraît quand l'espace a des données sans codex : une personne le ferme
    // (« Plus tard », la croix) et le parcours continue ; le banc fait de même, quand il paraît.
    await page.addLocatorHandler(page.locator('#overlay-backup-reminder.actif'), async () => {
        await page.locator('#modal-backup-reminder [data-action="backupReminder.fermerPlusTard"]').click();
    });
    await page.clock.setFixedTime(HORLOGE);
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate(async ({ T, avecGrille }) => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    }, { T, avecGrille });
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate(({ T, avecGrille, verrouDejaPose }) => {
        // security-ok: fixtures littérales du banc, aucune source externe ; noms fictifs.
        const coursId = 'cours-p8';
        window.db.setSync('trimestres', [{ id: T, nom: 'Automne 2026', annee: 2026, session: 'A', actif: true,
            dateDebut: '2026-08-24', dateFinCours: '2026-12-11', dateFin: '2026-12-22' }]);
        window.db.setSync('trimestreActif', T);
        window.trimestreActif = T;
        // La personne a repoussé le rappel de sauvegarde (« Plus tard ») : il ne paraît pas pendant le banc.
        // (S'il paraissait quand même, le gestionnaire posé plus haut le fermerait.)
        window.db.setSync('backupProchainRappel', '2026-11-24T14:00:00.000Z');
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_P8', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_P8' });
        window.db.setSync('groupeCoursActif', { id: 'GC_P8', trimestreId: T });
        window.db.setSync(T + '_groupeEtudiants', [
            { da: '1111111', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GC_P8' },
            { da: '2222222', nom: 'Simulacre', prenom: 'Bêta', groupe: '01', coursId, groupeCoursId: 'GC_P8' }
        ]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E_P8', nom: 'IDME', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G_P8_1', nom: 'Grille de la rédaction 1', type: 'holistique',
            criteres: [{ id: 'c_contenu', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_productions', [
            { id: 'P_P8_1', titre: 'Rédaction 1', type: 'travail', ponderation: 40, coursId, grilleId: avecGrille ? 'G_P8_1' : '', echelleId: 'E_P8' },
            { id: 'P_P8_2', titre: 'Rédaction 2', type: 'travail', ponderation: 60, coursId, grilleId: '', echelleId: 'E_P8' }
        ]);
        // Une grille déjà employée : une évaluation verrouillée existe AVANT le parcours ; elle ne doit pas
        // le faire avancer à l'étape 10 (seul un verrou posé pendant le parcours compte).
        if (verrouDejaPose) {
            window.db.setSync(T + '_evaluationsSauvegardees', [{
                id: 'EV_P8_AVANT', etudiantDA: '2222222', productionId: 'P_P8_1', groupeCoursId: 'GC_P8', coursId,
                grilleId: 'G_P8_1', echelleId: 'E_P8', statutRemise: 'evalue', statutIntegrite: 'recevable',
                dateEvaluation: '2026-11-02T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: true,
                criteres: [{ critereId: 'c_contenu', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 100, retroaction: '' }],
                retroactionFinale: '', pointsAnalytiques: {}
            }]);
        }
    }, { T, avecGrille, verrouDejaPose });
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

async function ouvrirPanneau(page) {
    // L'avertissement d'une grille qui ne totalise pas 100 % reste jusqu'à « OK » : il couvre le menu.
    const ok = page.locator('.notification-warning button', { hasText: 'OK' });
    if (await ok.count()) await ok.first().click().catch(() => {});
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const item = (page) => page.locator('#panneau-assistance .assistance-parcours-item[data-parcours="commentaires"]');
const bulle = (page) => page.locator('#parcours-bulle');
const rang = (page) => bulle(page).locator('.parcours-bulle-rang');

async function attendreTitre(page, titre, { focus = true } = {}) {
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 10000 });
    if (focus) await expect(bulle(page)).toBeFocused();
}

/**
 * Corrections du 9 nov. (décision 2 de Cowork) : aucun avis de la pile ne couvre la bulle. Un relevé tourne dans la
 * page pendant tout l'essai (posé avant chaque chargement) : toutes les 100 ms, il regarde si un avis est AU-DESSUS de
 * la bulle (le point du milieu de leur intersection répond par l'avis : sous la bulle, il ne couvre rien). Un
 * recouvrement de plus de trois relevés (la pile se replace en 200 ms au plus, utils-notifications.js,
 * `_placerLaPile`) est consigné, avec le titre de l'étape. Chaque essai finit en exigeant un relevé vide (afterEach).
 * Break-test (9 nov., Chromium) : `_placerLaPile` sans effet → « 820 px : aucun avis… » ROUGE (l'orange de
 * l'étape 7 sur la bulle de l'étape 9) ; rétabli → vert.
 */
function releveDesAvisSurLaBulle() {
    window.__avisSurLaBulle = [];
    window.__relevesFaits = 0;
    let suite = 0;
    setInterval(() => {
        window.__relevesFaits++;
        const b = document.getElementById('parcours-bulle');
        let couvrent = [];
        if (b) {
            const r = b.getBoundingClientRect();
            couvrent = [...document.querySelectorAll('#notifications-pile > *')]
                .filter((n) => !n.classList.contains('notification-sortie'))
                .filter((n) => {
                    const x = n.getBoundingClientRect();
                    const g = Math.max(x.left, r.left), d = Math.min(x.right, r.right), h = Math.max(x.top, r.top), bas = Math.min(x.bottom, r.bottom);
                    if (d <= g || bas <= h) return false;
                    const dessus = document.elementFromPoint((g + d) / 2, (h + bas) / 2);
                    return !!(dessus && n.contains(dessus));
                });
        }
        suite = couvrent.length ? suite + 1 : 0;
        if (suite === 4) {
            const t = b.querySelector('.parcours-bulle-titre');
            window.__avisSurLaBulle.push((t ? t.textContent : '?') + ' : ' + couvrent.map((n) => n.textContent.trim().slice(0, 40)).join(' | '));
        }
    }, 100);
}

test.afterEach(async ({ page }) => {
    const releve = await page.evaluate(() => window.__avisSurLaBulle || []).catch(() => []);
    expect(releve, 'aucun avis n’a couvert la bulle').toEqual([]);
});

const REFUS = 'Commence par « Évaluer une première production » : il te faut une production et sa grille pour automatiser tes commentaires.';
const REFUS_PAGE = REFUS;

test('panneau : sans production avec sa grille, « Commencer » ne lance rien et le panneau dit pourquoi', async ({ page }) => {
    await ouvrirEspace(page, 1180, { avecGrille: false });
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Automatiser tes commentaires');
    await expect(item(page).locator('.assistance-parcours-ligne')).toHaveText("De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.");
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(REFUS);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveAttribute('role', 'status');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, 'panneau-refus-1180-sombre');
});

test('panneau : la démo et un service d’orthopédagogie font refuser ; avec une production et sa grille, le parcours part sur Conception › Grilles', async ({ page }) => {
    await ouvrirEspace(page, 1180);
    // Un service d'orthopédagogie ou la démo : refus ; ici, le groupe-cours réel a sa production avec grille.
    expect(await page.evaluate(() => window.ParcoursCommentaires.refus())).toBe('');
    // La démo ne compte pas : ouverte, elle fait refuser ; refermée, le groupe-cours réel revient.
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    expect(await page.evaluate(() => window.ParcoursCommentaires.refus())).toBe(REFUS_PAGE);
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(false);
    await expect.poll(() => page.evaluate(() => window.ParcoursCommentaires.refus())).toBe('');
    // Un service d'orthopédagogie non plus.
    await page.evaluate(() => { const c = db.getSync('cours', []); c[0].nature = 'service'; db.setSync('cours', c); });
    expect(await page.evaluate(() => window.ParcoursCommentaires.refus())).toBe(REFUS_PAGE);
    await page.evaluate(() => { const c = db.getSync('cours', []); delete c[0].nature; db.setSync('cours', c); });
    expect(await page.evaluate(() => window.ParcoursCommentaires.refus())).toBe('');
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await expect(rang(page)).toHaveText('1 sur 11');
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
});

/** Le contour doit être posé SUR l'élément attendu (la sonde du moteur passe toutes les 120 ms). */
async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 5000 }).toBe('posé');
}

/** La bulle ne couvre pas le contour (là où il faut toucher). */
async function bulleNeCouvrePasLeContour(page) {
    const couvre = () => page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        if (!c || c.hidden) return false;
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    });
    // Sous 800 px, relevé (voir `toucher`) plutôt qu'échec.
    if (page.viewportSize().width < 800) {
        if (await couvre()) couverts.push({ largeur: page.viewportSize().width, etape: await page.locator('#parcours-bulle-titre').textContent(), cible: 'le contour' });
        return;
    }
    await expect.poll(() => page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        if (!c || c.hidden) return false;
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }), { message: 'la bulle ne couvre pas le contour', timeout: 3000 }).toBe(false);
}

const boutonBulle = (page, libelle) => bulle(page).locator('.parcours-bulle-boutons button', { hasText: libelle });

/**
 * Toucher ce que la bulle désigne. Au-dessus de 800 px, un vrai clic : s'il est couvert (par la bulle, le
 * voile), le banc échoue. Sous 800 px (l'iPhone), le moteur ne sait pas toujours poser une bulle longue sans
 * couvrir ce qu'il faut toucher : le banc le RELÈVE (fichier joint aux captures) et touche par programme,
 * pour que les captures aillent jusqu'au bout. Ce relevé est un constat du rapport, pas une réussite.
 */
async function toucher(page, cible) {
    const loc = typeof cible === 'string' ? page.locator(cible).first() : cible;
    if (page.viewportSize().width >= 800) { await loc.click(); return; }
    await loc.scrollIntoViewIfNeeded();
    const libre = await loc.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!h && (h === el || el.contains(h));
    });
    if (libre) { await loc.click(); return; }
    const titre = await page.locator('#parcours-bulle-titre').textContent().catch(() => '');
    couverts.push({ largeur: page.viewportSize().width, etape: titre, cible: typeof cible === 'string' ? cible : String(cible) });
    await loc.evaluate((el) => el.click());
}

/** Le fichier de banc : WebKit et Chromium refusent un Blob en IndexedDB éphémère ; l'image d'un pixel de #868. */
async function poserFichierImporte(page, { da = '1111111', productionId = 'P_P8_2', id = 'FT_P8_1' } = {}) {
    await page.evaluate(({ T, da, productionId, id, png }) => {
        // security-ok: fixture littérale du banc ; l'import lui-même est le quatrième parcours.
        const liste = window.db.getSync(T + '_fichiersTravaux', []) || [];
        liste.push({ id, etudiantDA: da, productionId, coursId: 'cours-p8', groupeCoursId: 'GC_P8',
            nomFichier: 'FICTIF_' + da + '_Redaction2.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-10T12:00:00.000Z', dateModification: '2026-11-10T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present' });
        window.db.setSync(T + '_fichiersTravaux', liste);
        // Une page blanche de taille réelle (la recette du banc d'annotation) : on y pose des codes.
        const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 400, 600);
        const octets = Uint8Array.from(atob(cv.toDataURL('image/png').split(',')[1]), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (fid) { return fid === id ? copie : original.apply(this, arguments); };
    }, { T, da, productionId, id });
}

/**
 * Les quatre formes, une à une, comme une personne les tape : chaque changement enregistre puis redessine
 * la fiche (`modifierNomsCritereAlgoHandler`, js/grilles.js), et la forme suivante attend que ce redessin
 * porte la précédente. Mesuré le 9 nov. : tapées en quelques millisecondes, deux enregistrements se
 * croisaient et une forme se perdait (« calcul » revenait vide), 1 passage sur 5. Une personne ne tape
 * pas si vite ; le banc non plus, désormais.
 */
async function ecrireLesQuatreFormes(page) {
    const nom = (paire, forme) => `#listeCriteres .noms-algo input[data-nom-paire="${paire}"][data-nom-forme="${forme}"]`;
    for (const [paire, forme, valeur] of [['erreurs', 'singulier', 'unité manquante'], ['erreurs', 'pluriel', 'unités manquantes'],
        ['mots', 'singulier', 'calcul'], ['mots', 'pluriel', 'calculs']]) {
        await page.fill(nom(paire, forme), valeur);
        await page.locator(nom(paire, forme)).dispatchEvent('change');
        await expect.poll(() => page.evaluate(([p, f]) => {
            const a = document.querySelector('#listeCriteres .gabarit-algo[data-atelier-algo]');
            const n = a && a._critere && a._critere.noms;
            return (n && n[p] && n[p][f]) || '';
        }, [paire, forme]), { message: 'la forme ' + paire + ' ' + forme + ' est enregistrée', timeout: 5000 }).toBe(valeur);
    }
    await attendreTitre(page, 'Tes codes');
}

/** Les étapes 1 à 6 sur une grille NEUVE : le critère algorithmique réglé dans son atelier, deux codes. */
// ↻ 10 nov. 2026 (« Les flèches des parcours ») : le voile du moteur est retiré, toute la page se touche. À l'étape 1,
// le « Type » d'un critère DÉJÀ LÀ était sous le voile ; changé, il s'écrirait dans la grille enregistrée et ferait
// avancer l'étape. La garde `garderLeType` (js/parcours-commentaires.js) le neutralise le temps de l'étape.
test('étape 1, sans voile : le « Type » d’un critère déjà là ne répond pas (rien ne s’écrit, l’étape n’avance pas) ; celui du critère ajouté, oui', async ({ page }) => {
    await ouvrirEspace(page, 1180);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await page.selectOption('#menuGrilles', 'G_P8_1');
    const types = '#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]';
    await expect(page.locator(types)).toHaveCount(1);
    const typeEnBase = () => page.evaluate(async () => (await obtenirGrilleParId('G_P8_1')).criteres.map((c) => c.type || 'holistique'));
    const avant = await typeEnBase();
    const affiche = await page.locator(types).first().inputValue();
    expect(affiche).not.toBe('algorithmique');

    // Le critère déjà là : le menu reprend sa valeur, rien ne s'écrit, l'étape reste la première.
    await page.locator(types).first().selectOption('algorithmique');
    await expect(page.locator(types).first()).toHaveValue(affiche);
    await page.waitForFunction(() => { window.__g = (window.__g || 0) + 1; return window.__g > 3; }, null, { polling: 150 });
    expect(await typeEnBase()).toEqual(avant);
    await expect(rang(page)).toHaveText(/^1 sur /);
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Ta grille');

    // Le critère ajouté : son « Type » répond, et l'étape avance (ce que l'étape demande).
    await page.click('#conteneurEditionGrille [data-action="ajouterCritereGrille"]');
    await expect(page.locator(types)).toHaveCount(2);
    await page.locator(types).last().selectOption('algorithmique');
    await attendreTitre(page, 'Ce que tu comptes');
    expect(await typeEnBase()).toEqual(avant.concat(['algorithmique']));
});

async function reglerUneGrilleNeuve(page, cap = async () => {}) {
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await expect(rang(page)).toHaveText('1 sur 11');
    await contourSur(page, '#conception-grille-criteres .rangee-selection');
    await cap(1);
    await toucher(page, '#conception-grille-criteres [data-action="creerNouvelleGrille"]');
    await contourSur(page, '#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]');
    await page.fill('#listeCriteres input[data-champ="nom"]', 'Unités');
    await page.locator('#listeCriteres input[data-champ="nom"]').blur();
    await page.selectOption('#listeCriteres select[data-on-change="modifierTypeCritereTempHandler"]', 'algorithmique');

    await attendreTitre(page, 'Ce que tu comptes');
    await expect(rang(page)).toHaveText('2 sur 11');
    await expect(page.locator('#listeCriteres .atelier-algo-etape[data-etape="compte"]')).toHaveAttribute('data-ouverte', '');
    await cap(2);
    await ecrireLesQuatreFormes(page);

    await attendreTitre(page, 'Tes codes');
    await expect(rang(page)).toHaveText('3 sur 11');
    // « Continuer » ne paraît qu'une fois qu'un code pèse plus de 0.
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await cap(3);
    for (let k = 0; k < 2; k++) {
        await toucher(page, '#listeCriteres .atelier-algo-etape[data-etape="codes"] [data-action="ajouterSousCritere"]');
    }
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Ta note');
    await expect(rang(page)).toHaveText('4 sur 11');
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await contourSur(page, '#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]');
    await cap(4);
    await page.fill('#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]', '20');
    await page.locator('#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"]').dispatchEvent('change');
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Tes cas');
    await expect(rang(page)).toHaveText('5 sur 11');
    await contourSur(page, '#listeCriteres .table-cas-fixer');
    // Sans limite, l'étape est réglée : « Continuer » est toujours là.
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await cap(5);
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, "Ce que l'étudiant·e lit");
    await expect(rang(page)).toHaveText('6 sur 11');
    // Une grille nouvelle : pas de « Continuer » ; elle avance quand la grille est créée.
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await contourSur(page, '#listeCriteres .atelier-algo-etape[data-etape="eleve"] .atelier-algo-etape-corps');
    await cap(6);
    await page.fill('#nomGrilleTemplate', 'Grille de la rédaction 2');
    await page.locator('#nomGrilleTemplate').dispatchEvent('change');
    await contourSur(page, '#btnCreerGrille');
    await toucher(page, '#btnCreerGrille');
    await page.waitForFunction((T) => (window.db.getSync(T + '_grillesTemplates', []) || []).some((x) => x.nom === 'Grille de la rédaction 2'), T, { timeout: 5000 });
    return await page.evaluate((T) => {
        const g = (window.db.getSync(T + '_grillesTemplates', []) || []).find((x) => x.nom === 'Grille de la rédaction 2');
        return g ? { id: g.id, critereId: (g.criteres.find((c) => c.type === 'algorithmique') || {}).id } : null;
    }, T);
}

/**
 * Le chemin avec fichier, de l'étape 7 à la fin (après reglerUneGrilleNeuve). `cap(n)` capture
 * l'étape n quand le banc tourne pour les captures.
 */
async function finirLeCheminAvecFichier(page, grille, cap = async () => {}) {
    await attendreTitre(page, 'Ta production');
    await expect(rang(page)).toHaveText('7 sur 11');
    await cap(7);
    await page.selectOption('#menuProductions', 'P_P8_2');
    await contourSur(page, '#productionGrille');
    await page.selectOption('#productionGrille', grille.id);

    await attendreTitre(page, 'Tes productions');
    await expect(rang(page)).toHaveText('8 sur 11');
    await contourSur(page, '#travaux-drop-zone');
    await expect(boutonBulle(page, 'Rien à importer')).toBeVisible();
    await cap(8);
    await poserFichierImporte(page);

    await attendreTitre(page, 'Poser tes codes');
    await expect(rang(page)).toHaveText('9 sur 11');
    const actions = '#evaluations-liste tr[data-production-id="P_P8_2"] select.eval-actions-select';
    await contourSur(page, actions);
    await page.selectOption(actions, 'annoter|FT_P8_1|P_P8_2');
    await expect(page.locator('#travaux-palette-erreurs-fr')).toBeVisible({ timeout: 10000 });
    await contourSur(page, '#travaux-palette-erreurs-fr');
    await bulleNeCouvrePasLeContour(page);
    // Deux codes posés : toucher le code, puis la production.
    const codes = page.locator('#travaux-palette-erreurs-fr .travaux-errfr-item');
    await expect(codes).toHaveCount(2);
    await cap(9);
    // Le code choisi, un point de la production que rien ne couvre (ni la bulle, ni une palette) : là où l'on touche.
    const poses = [];
    for (let k = 0; k < 2; k++) {
        await toucher(page, codes.nth(k));
        const p = await page.evaluate((deja) => {
            const c = document.getElementById('travaux-canvas-annotation');
            const r = c.getBoundingClientRect();
            for (let fy = 0.15; fy < 0.9; fy += 0.1) {
                for (let fx = 0.1; fx < 0.95; fx += 0.1) {
                    const x = r.left + r.width * fx, y = r.top + r.height * fy;
                    if (y < window.innerHeight - 10 && document.elementFromPoint(x, y) === c
                        && deja.every((q) => Math.abs(q.x - x) > 60 || Math.abs(q.y - y) > 60)) return { x, y };
                }
            }
            return null;
        }, poses);
        // Sous 800 px, les palettes d'Annoter couvrent la production : relevé, et le trajet s'arrête là
        // (les captures demandées à cette largeur, 2, 5 et 9, sont prises).
        if (!p && page.viewportSize().width < 800) {
            couverts.push({ largeur: page.viewportSize().width, etape: 'Poser tes codes', cible: 'aucun point libre sur la production (palettes d’Annoter)' });
            return;
        }
        expect(p, 'un point libre sur la production').not.toBeNull();
        poses.push(p);
        await page.mouse.click(p.x, p.y);
    }
    await expect(page.locator('#travaux-errfr-total-pastille')).toHaveText('2');
    // « Annoter ▾ », en haut de la production, puis « Évaluer » : le vrai geste.
    await toucher(page, '#travaux-btn-actions');
    await toucher(page, '#travaux-btn-evaluer');

    await attendreTitre(page, "Ta rétroaction s'écrit seule");
    await expect(rang(page)).toHaveText('10 sur 11');
    await expect(page.locator('#eval_erreurs_' + grille.critereId)).toHaveValue('2', { timeout: 6000 });
    await contourSur(page, '#eval_mots_' + grille.critereId);
    await bulleNeCouvrePasLeContour(page);
    await page.fill('#eval_mots_' + grille.critereId, '12');
    await page.locator('#eval_mots_' + grille.critereId).dispatchEvent('input');
    await page.locator('#eval_mots_' + grille.critereId).dispatchEvent('change');
    // La rétroaction : la phrase du compte sous le critère (la « Générale ») ; les deux codes dans « Spécifique ».
    await expect(page.locator('#retroactionFinale1')).toHaveValue(/Ta production contient 2 unités manquantes pour 12 calculs\./);
    await toucher(page, page.locator('#travaux-palette-eval-retro .retro-vues-radios label', { hasText: 'Spécifique' }));
    const specifique = (await page.locator('#contenuRetroSpecifique').innerText()).replace(/\s+/g, ' ');
    // Corrections du 9 nov. (Cowork) : le premier code d'un critère commence au numéro 1 (avant : « Code 0 »,
    // qu'aucune touche ne choisit). Break-test : codeSousCritereNeuf remis au rang depuis 0 → ROUGE.
    expect(specifique).toContain('Code 1');
    expect(specifique).toContain('Code 2');
    expect(specifique).not.toContain('Code 0');
    await contourSur(page, '#btnVerrouillerEvaluation');
    await bulleNeCouvrePasLeContour(page);
    await cap(10);
    await toucher(page, '#btnVerrouillerEvaluation');

    await attendreTitre(page, 'Pour aller plus loin');
    await expect(rang(page)).toHaveText('11 sur 11');
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await cap(11);
    await boutonBulle(page, 'Terminer').click();
    await expect(bulle(page)).toHaveCount(0);
}

test('de bout en bout, avec fichier : une grille neuve, deux codes posés, la rétroaction s’écrit seule ; le verrou mène à la fin', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspace(page, 1180);
    const grille = await reglerUneGrilleNeuve(page);
    expect(grille, 'la grille est créée').not.toBeNull();
    await finirLeCheminAvecFichier(page, grille);
    await ouvrirPanneau(page);
    await expect(item(page)).toHaveAttribute('data-etat', 'fait');
});

test('l’étape 8 sautée : la production associée à l’étape 7 a déjà ses fichiers (8 sur 10) ; une grille restée ouverte au lancement n’est pas celle du parcours', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspace(page, 1180);
    await poserFichierImporte(page);   // « Rédaction 2 » a déjà une production importée, sans grille
    // Une grille déjà employée reste ouverte au lancement : le parcours la referme, et la grille neuve
    // est celle du parcours (le compte reste « n sur 11 » pendant les étapes 2 à 6, pas « n sur 10 »).
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.evaluate(() => chargerGrillePourModif('G_P8_1'));
    await expect(page.locator('#conteneurEditionGrille')).toBeVisible();
    const grille = await reglerUneGrilleNeuve(page);
    await attendreTitre(page, 'Ta production');
    await expect(rang(page)).toHaveText('7 sur 11');
    await page.selectOption('#menuProductions', 'P_P8_2');
    await page.selectOption('#productionGrille', grille.id);
    await attendreTitre(page, 'Poser tes codes');
    await expect(rang(page)).toHaveText('8 sur 10');
});

// Corrections du 9 nov. (décision 2) : à 820 px, l'orange « Grille enregistrée : ses critères totalisent… »
// reste de l'étape 7 jusqu'à son « OK » (#1224) et couvrait la bulle de l'étape 9. Le relevé vérifie à
// chaque instant qu'aucun avis ne couvre la bulle (le relevé, `afterEach`) ; la fin vérifie que l'orange était bien
// là tout du long.
test('820 px : aucun avis ne couvre la bulle, l’orange de la grille restant affiché de l’étape 7 à la fin', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspace(page, 820, { hauteur: 1180 });
    const grille = await reglerUneGrilleNeuve(page);
    await finirLeCheminAvecFichier(page, grille);
    await expect(page.locator('#notifications-pile .notification-warning', { hasText: 'ses critères totalisent' })).toBeVisible();
});

// Relecture du 9 nov. : à 1180 × 820 (l'iPad à l'horizontale), aucun coin ne laisse la bulle libre à l'étape 11 (bulle
// centrée, pile de 444 px) : la pile passe sous la bulle. Break-test (9 nov., Chromium) : le passage sous la bulle
// retiré (`_placerLaPile`) → ROUGE (« Pour aller plus loin : Évaluation verrouillée… »). Rétabli → vert.
test('1180 × 820 : aucun avis ne couvre la bulle, même quand aucun coin ne la laisse libre', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspace(page, 1180, { hauteur: 820 });
    const grille = await reglerUneGrilleNeuve(page);
    await finirLeCheminAvecFichier(page, grille, async (n) => {
        // À la dernière étape, le relevé a le temps de voir (six passages) : la bulle centrée, l'orange et le vert sont là.
        if (n !== 11) return;
        await expect.poll(() => page.evaluate(() => document.getElementById('notifications-pile').children.length)).toBeGreaterThan(0);
        const depart = await page.evaluate(() => window.__relevesFaits);
        await expect.poll(() => page.evaluate(() => window.__relevesFaits)).toBeGreaterThanOrEqual(depart + 6);
    });
});

// Relecture du 9 nov. : un avis affiché AVANT le lancement cède aussi (la sonde tourne tant que la pile n'est pas vide).
// À cette taille, l'orange en haut à droite tombe sur la bulle de l'étape 1 (mesuré par la relecture). Break-test (9 nov.,
// Chromium) : la sonde lancée seulement pendant un parcours → ROUGE (l'orange reste sur la bulle). Rétabli → vert.
test('820 × 600 : un orange affiché avant le lancement ne couvre pas la bulle', async ({ page }) => {
    await ouvrirEspace(page, 820, { hauteur: 600 });
    await page.evaluate(() => window.notifications.warning('Avis du banc, resté jusqu’à « OK » : il est là avant le parcours.'));
    // L'orange couvre le bouton du menu (noté au rapport) : le panneau s'ouvre par le DOM, ce n'est pas ce qui est jugé.
    await page.evaluate(() => { document.getElementById('entete-menu-bouton').click(); document.getElementById('btn-assistance-menu').click(); });
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await item(page).locator('.assistance-parcours-bouton').evaluate((b) => b.click());
    await attendreTitre(page, 'Ta grille');
    // Le relevé a besoin de quelques passages : l'orange reste, on attend qu'il ait cédé.
    await expect.poll(() => page.evaluate(() => {
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        const n = document.querySelector('#notifications-pile .notification-warning');
        const x = n.getBoundingClientRect();
        const g = Math.max(x.left, b.left), d = Math.min(x.right, b.right), h = Math.max(x.top, b.top), bas = Math.min(x.bottom, b.bottom);
        if (d <= g || bas <= h) return 'libre';
        const dessus = document.elementFromPoint((g + d) / 2, (h + bas) / 2);
        return n.contains(dessus) ? 'couverte' : 'libre';
    }), { timeout: 3000 }).toBe('libre');
    await expect(page.locator('#notifications-pile .notification-warning')).toBeVisible();
});

// Corrections du 9 nov. (décision 3 de Cowork) : pendant tout parcours, l'aide dans les pages se tait.
// Break-test (9 nov., Chromium) : le garde de `afficherBulleDecouverte` retiré (accompagnement.js) → ROUGE
// (une bulle de découverte en plein parcours) ; celui de `afficherHover` retiré → ROUGE. Rétablis → verts.
test('pendant un parcours, l’aide dans les pages se tait (bulle de découverte, flèche, infobulle) ; hors parcours, elle parle', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirEspace(page, 1180);
    await page.evaluate(() => { definirPreference('accompagnementActif', true); document.body.classList.add('aide-contextuelle-active'); });
    const cle = await page.evaluate(() => Object.keys(window.accompagnement.catalogue).find((k) => window.accompagnement.catalogue[k].hover));
    expect(cle, 'une aide de survol au catalogue').toBeTruthy();
    // Hors parcours, une flèche paraît ; elle restera affichée quand le parcours commencera.
    await page.evaluate(() => window.accompagnement.afficherFleche('banc-p8-fleche', { sectionActive: 'banc', cibleSelector: '#btn-codex', message: 'Flèche du banc', direction: 'bas' }));
    await expect(page.locator('#fleche-didactique-host')).toBeVisible();
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    // Celle qui était là se cache ; aucune autre ne s'ouvre.
    await expect(page.locator('#fleche-didactique-host')).toBeHidden();
    await page.evaluate(() => window.accompagnement.afficherBulleDecouverte({ cible: '#btn-codex', message: 'Bulle du banc' }));
    await expect(page.locator('.bulle-decouverte')).toHaveCount(0);
    // Une flèche demandée en plein parcours ne se pose pas (relecture du 9 nov. : le CSS la cachait, le garde n'était
    // pas éprouvé). Elle se pose 150 ms après l'appel (AUTO_DELAI_STABILISATION) : on regarde après ce délai, mesuré
    // dans la page, si sa cible a reçu sa marque. Break-test : les deux gardes d'`afficherAutoReveal` retirés → ROUGE.
    expect(await page.evaluate(() => new Promise((ok) => {
        window.accompagnement.afficherFleche('banc-p8-fleche-2', { sectionActive: 'banc', cibleSelector: '#btn-codex', message: 'Flèche du banc, 2', direction: 'bas' });
        setTimeout(() => ok(document.querySelectorAll('.fleche-didactique-cible').length), 400);
    }))).toBe(0);
    // La bulle d'une description touchée n'est pas une aide : elle reste pendant un parcours.
    // Break-test : `:not(.tooltip-bulle--ancree)` retiré de css/accompagnement.css → ROUGE.
    await page.evaluate(() => { const c = document.getElementById('btn-codex'); window.basculerBulleAncree(c, c, 'Description du banc'); });
    await expect(page.locator('.tooltip-bulle.tooltip-bulle--ancree')).toBeVisible();
    await page.evaluate(() => { const c = document.getElementById('btn-codex'); window.basculerBulleAncree(c, c, 'Description du banc'); });
    await expect(page.locator('.tooltip-bulle.tooltip-visible')).toHaveCount(0);
    await page.evaluate((k) => {
        const s = document.createElement('span');
        s.id = 'banc-p8-survol';
        s.dataset.tooltip = k;
        s.textContent = 'survol';
        document.querySelector('header.entete').appendChild(s);
        window.accompagnement.afficherHover(s);
        return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    }, cle);
    await expect(page.locator('.tooltip-bulle.tooltip-visible')).toHaveCount(0);
    // « Plus tard » : hors parcours, l'aide parle de nouveau.
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await expect(bulle(page)).toHaveCount(0);
    await page.evaluate(() => window.accompagnement.afficherHover(document.getElementById('banc-p8-survol')));
    await expect(page.locator('.tooltip-bulle.tooltip-visible')).toBeVisible();
    await page.evaluate(() => window.accompagnement.masquerHover());
    await page.evaluate(() => window.accompagnement.afficherBulleDecouverte({ cible: '#btn-codex', message: 'Bulle du banc' }));
    await expect(page.locator('.bulle-decouverte')).toBeVisible();
});

// Les captures (CAPTURES_PARCOURS=<dossier>) : les onze étapes à 1180 px, sombre et clair ; les étapes 2, 5
// et 9 à 820 et 390 px. Sous Chromium dans le cloud ; les captures WebKit se refont sur le Mac.
for (const [largeur, clair, etapes] of [
    [1180, false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    [1180, true, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    [820, false, [2, 5, 9]],
    [390, false, [2, 5, 9]]
]) {
    const theme = clair ? 'clair' : 'sombre';
    test(`captures : le chemin avec fichier à ${largeur} px, ${theme}`, async ({ page }) => {
        test.skip(!CAPTURES, 'captures seulement sur demande (CAPTURES_PARCOURS)');
        test.setTimeout(180000);
        await ouvrirEspace(page, largeur, { clair, hauteur: largeur === 390 ? 844 : (largeur === 820 ? 1180 : 900) });
        const cap = async (n) => { if (etapes.includes(n)) await capture(page, `avec-fichier-${largeur}-${theme}-${String(n).padStart(2, '0')}`); };
        const grille = await reglerUneGrilleNeuve(page, cap);
        await finirLeCheminAvecFichier(page, grille, cap);
        if (couverts.length) fs.writeFileSync(path.join(CAPTURES, `couverts-${largeur}.json`), JSON.stringify(couverts, null, 2));
    });
}

/** Le contour posé sur le DERNIER élément qui répond au sélecteur (un critère qu'on vient d'ajouter). */
async function contourSurDernier(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const tous = document.querySelectorAll(sel);
        const el = tous[tous.length - 1];
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur le dernier ' + selecteur, timeout: 5000 }).toBe('posé');
}

/** Le chemin sans fichier, sur la grille déjà associée à « Rédaction 1 ». */
async function cheminSansFichier(page, cap = async () => {}) {
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Ta grille');
    await cap(1);
    await page.selectOption('#menuGrilles', 'G_P8_1');
    // Une grille existante : d'abord « + Ajouter un critère », puis le « Type » du critère ajouté.
    await contourSur(page, '#conteneurEditionGrille [data-action="ajouterCritereGrille"]');
    await page.click('#conteneurEditionGrille [data-action="ajouterCritereGrille"]');
    const types = '#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]';
    await expect(page.locator(types)).toHaveCount(2);
    await contourSurDernier(page, types);
    await page.locator(types).last().selectOption('algorithmique');

    // La grille porte déjà une production : l'étape 7 ne compte pas (10 étapes au lieu de 11).
    await attendreTitre(page, 'Ce que tu comptes');
    await expect(rang(page)).toHaveText('2 sur 10');
    await cap(2);
    await ecrireLesQuatreFormes(page);

    // « Plus tard » ferme la bulle ; le parcours attend dans le panneau ; « Reprendre » revient à la même étape.
    await attendreTitre(page, 'Tes codes');
    await expect(rang(page)).toHaveText('3 sur 10');
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await expect(bulle(page)).toHaveCount(0);
    // Un rechargement entre les deux : « Reprendre » retrouve la grille du parcours et rouvre sa fiche.
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.Assistance
        && window.ParcoursCommentaires && window.travauxStockage, null, { timeout: 30000 });
    await ouvrirPanneau(page);
    await expect(item(page)).toHaveAttribute('data-etat', 'en-cours');
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 10');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
    await capture(page, 'sans-fichier-panneau-en-cours');
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreTitre(page, 'Tes codes');
    await expect(rang(page)).toHaveText('3 sur 10');
    for (let k = 0; k < 2; k++) {
        await toucher(page, '#listeCriteres .atelier-algo-etape[data-etape="codes"] [data-action="ajouterSousCritere"]');
    }
    await cap(3);
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Ta note');
    await cap(4);
    const pond = '#listeCriteres input[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]';
    await contourSurDernier(page, pond);
    await page.locator(pond).last().fill('20');
    await page.locator(pond).last().dispatchEvent('change');
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();
    await attendreTitre(page, 'Tes cas');
    await cap(5);
    await boutonBulle(page, 'Continuer').click();

    // Une grille existante s'enregistre d'elle-même : « Continuer », pas « Créer la grille ».
    await attendreTitre(page, "Ce que l'étudiant·e lit");
    await expect(rang(page)).toHaveText('6 sur 10');
    await cap(6);
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    await attendreTitre(page, 'Tes productions');
    await expect(rang(page)).toHaveText('7 sur 10');
    await cap(8);
    await boutonBulle(page, 'Rien à importer').click();

    // Sans fichier : l'étape 9 sautée, la variante de l'étape 10 ; 9 étapes en tout.
    await attendreTitre(page, "Ta rétroaction s'écrit seule");
    await expect(rang(page)).toHaveText('8 sur 9');
    await expect(bulle(page).locator('.parcours-bulle-texte')).toContainText("Pas besoin d'importer");
    const evaluer = '#evaluations-liste tr[data-production-id="P_P8_1"][data-da="1111111"] select.eval-actions-select';
    await contourSur(page, evaluer);
    await cap(10);
    await page.selectOption(evaluer, 'evaluer|1111111|P_P8_1');
    // Le formulaire sans fichier se remplit en différé (`_evaluerSansCopie`) : on écrit une fois qu'il a fini.
    await page.waitForFunction(() => window._evaluerSansCopieEnCours === false && !!document.querySelector('#evaluations-contenu-evaluation:not(.u-hide)'), null, { timeout: 10000 });
    const critereId = await page.evaluate((T) => {
        const g = (window.db.getSync(T + '_grillesTemplates', []) || []).find((x) => x.id === 'G_P8_1');
        return (g.criteres.find((c) => c.type === 'algorithmique') || {}).id;
    }, T);
    await expect(page.locator('#eval_erreurs_' + critereId)).toBeVisible({ timeout: 10000 });
    await contourSur(page, '#eval_erreurs_' + critereId);
    // Le geste entier : taper, puis quitter le champ (`change`), comme dans l'essai avec fichier. Avec `input` seul,
    // la phrase arrivait parfois après 5 s (mesuré le 9 nov. : 1 rouge sur 3, avec ou sans les corrections du jour).
    await page.fill('#eval_erreurs_' + critereId, '3');
    await page.locator('#eval_erreurs_' + critereId).dispatchEvent('input');
    await page.locator('#eval_erreurs_' + critereId).dispatchEvent('change');
    await contourSur(page, '#eval_mots_' + critereId);
    await page.fill('#eval_mots_' + critereId, '12');
    await page.locator('#eval_mots_' + critereId).dispatchEvent('input');
    await page.locator('#eval_mots_' + critereId).dispatchEvent('change');
    await expect(page.locator('#retroactionFinale1')).toHaveValue(/Ta production contient 3 unités manquantes pour 12 calculs\./, { timeout: 5000 });
    // L'autre critère s'évalue « comme d'habitude » : sans lui, le verrou refuserait.
    await page.evaluate(() => {
        const s = [...document.querySelectorAll('#travaux-eval-droite select')].find((x) => [...x.options].some((o) => o.value === 'M'));
        if (s) { s.value = 'M'; s.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    await contourSur(page, '#btnVerrouillerEvaluation');
    await capture(page, 'sans-fichier-1180-sombre-10-verrou');
    await toucher(page, '#btnVerrouillerEvaluation');

    await attendreTitre(page, 'Pour aller plus loin');
    await expect(rang(page)).toHaveText('9 sur 9');
    await cap(11);
    await boutonBulle(page, 'Terminer').click();
    await ouvrirPanneau(page);
    await expect(item(page)).toHaveAttribute('data-etat', 'fait');}

test('sans fichier, sur une grille déjà employée : l’étape 7 sautée hors du compte, « Plus tard », un rechargement puis « Reprendre », « Rien à importer » ; un verrou d’avant ne fait pas avancer', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspace(page, 1180, { verrouDejaPose: true });
    await cheminSansFichier(page);
});

test('captures : le chemin sans fichier à 1180 px, sombre', async ({ page }) => {
    test.skip(!CAPTURES, 'captures seulement sur demande (CAPTURES_PARCOURS)');
    test.setTimeout(180000);
    await ouvrirEspace(page, 1180);
    await cheminSansFichier(page, async (n) => capture(page, 'sans-fichier-1180-sombre-' + String(n).padStart(2, '0')));
});
