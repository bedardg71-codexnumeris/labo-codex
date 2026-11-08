import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// « LE GRAPHIQUE SUIT LES PRÉSENCES » (8 nov. 2026, règle validée par Grégoire)
// =======================================================================
//
// Sur un groupe NEUF, dans le vrai index.html : le graphique du Suivi du groupe est vide ; une
// première saisie de présences (le geste de l'écran, puis l'enregistrement automatique) capture la
// séance ; en revenant au Suivi du groupe, SANS rechargement ni passage par Réglages, le graphique la
// montre. Une deuxième séance de la même semaine a sa propre capture, donc son propre point.
// Avant : aucune capture sans réouverture de l'application, le graphique restait vide.
//
// Le banc unitaire (tests/unit/sentinelle-graphique-suit-les-presences.test.js) tient la règle en
// détail (correction antérieure, séances suivantes, ordre, date future).
//
// DOSSIER_CAPTURES=<dossier> : enregistre l'écran du Suivi du groupe avant et après la première saisie.
// ⚠ Il part d'un stockage vidé (origine file:// partagée, workers: 1). Noms fictifs.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

// Automne 2026, le groupe vu le mardi et le jeudi. Deux séances PASSÉES de la même semaine.
const DEBUT = '2026-08-17';   // lundi
const FIN_COURS = '2026-12-11';
const FIN_TRIMESTRE = '2026-12-21';
const MARDI = '2026-08-25';
const JEUDI = '2026-08-27';

const DOSSIER_CAPTURES = process.env.DOSSIER_CAPTURES || '';
if (DOSSIER_CAPTURES) test.use({ viewport: { width: 1366, height: 1024 }, deviceScaleFactor: 2 });

async function viderStockage(page) {
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
}

/** Le parcours d'un poste neuf (comme parcours-neuf-saisie-presences) : trimestre, cours, élèves, horaire, groupe-cours. */
async function configurerGroupeNeuf(page) {
    await page.evaluate(({ DEBUT, FIN_COURS, FIN_TRIMESTRE }) => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync(cle('cadreCalendrier'), { dateDebut: DEBUT, finCours: FIN_COURS, finTrimestre: FIN_TRIMESTRE }); // security-ok: fixture de test locale
        db.setSync('cours', [{ id: 'COURS_GRAPHIQUE', codeCours: '601-101-MQ', nomCours: 'Littérature' }]);
        db.setSync('enseignants', [{ id: 'ENS_GRAPHIQUE', prenom: 'Prof', nom: 'Fictif' }]); // security-ok: fixture de test locale
        db.setSync(cle('groupeEtudiants'), Array.from({ length: 8 }, (_, i) => ({ // security-ok: fixture de test locale
            da: String(2100000 + i), nom: `Fictif${i + 1}`, prenom: 'Élève', groupe: '00001'
        })));
        db.setSync(cle('horaires'), []); // security-ok: fixture de test locale
        db.setSync(cle('groupesCours'), []); // security-ok: fixture de test locale
        naviguerVers('calendrier', 'trimestre');
    }, { DEBUT, FIN_COURS, FIN_TRIMESTRE });
    await attendreRepos(page);

    await page.evaluate(() => window.nouveauHoraireV2());
    await attendreRepos(page);
    await page.evaluate(() => {
        document.getElementById('v2-hor-groupeAssocie').value = '00001';
        document.getElementById('v2-hor-nom').value = 'Mardi et jeudi';
        document.getElementById('v2-hor-nbSeances').value = '2';
        window.mettreAJourSeancesHoraireV2();
    });
    await attendreRepos(page);
    await page.evaluate(() => {
        [['Mardi', 0], ['Jeudi', 1]].forEach(([jour, i]) => {
            document.getElementById(`v2-hor-seance-${i}-jour`).value = jour;
            document.getElementById(`v2-hor-seance-${i}-debut`).value = '08:00';
            document.getElementById(`v2-hor-seance-${i}-fin`).value = '10:00';
            document.getElementById(`v2-hor-seance-${i}-periodes`).value = '2';
        });
        window.sauvegarderHoraireV2();
    });
    await attendreRepos(page);

    await page.evaluate(() => window.nouveauGroupeCoursV2());
    await attendreRepos(page);
    const champsRefuses = await page.evaluate(() => {
        const horaireId = db.getSync(cle('horaires'), [])[0]?.id;
        const poser = (id, valeur) => {
            const el = document.getElementById(id);
            if (!el) return `champ absent : ${id}`;
            el.value = valeur;
            return el.value === valeur ? null : `valeur refusée par ${id} : ${valeur}`;
        };
        const refus = [poser('v2-gc-trimestre', 'a2026'), poser('v2-gc-cours', 'COURS_GRAPHIQUE'), poser('v2-gc-groupe', '00001'),
            poser('v2-gc-horaire', horaireId), poser('v2-gc-enseignant', 'ENS_GRAPHIQUE')].filter(Boolean);
        window.sauvegarderGroupeCoursV2();
        return refus;
    });
    await attendreRepos(page);
    expect(champsRefuses, 'le formulaire du groupe-cours a refusé une valeur').toEqual([]);
    await page.evaluate(() => window.changerGroupeCoursActifV2(db.getSync(cle('groupesCours'), [])[0].id));
    await attendreRepos(page);
}

const etatGraphique = (page) => page.evaluate(() => {
    const chart = Chart.getChart(document.getElementById('graphique-groupe-moyennes'));
    return {
        captures: obtenirSnapshotsHebdomadaires().map((s) => s.dateSeance),
        etiquettes: chart ? chart.data.labels.slice() : null,
        courbes: chart ? chart.data.datasets.filter((d) => d.data.some((v) => v !== null && v !== undefined)).length : 0
    };
});

async function ouvrirSuiviGroupe(page) {
    await page.evaluate(() => naviguerVers('suivi', 'groupe'));
    await attendreRepos(page);
}

/** Ouvre la séance `date` dans Suivi › Présences et marque le premier élève absent (le geste de l'écran). */
async function saisirUneAbsence(page, date) {
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await attendreRepos(page);
    await page.evaluate((d) => {
        const champ = document.getElementById('date-cours');
        champ.value = d;
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    }, date);
    await attendreRepos(page);
    const premier = page.locator('#tbody-saisie-presences input[id^="periodes_"]').first();
    await premier.fill('0');
    await premier.blur();   // le `change` d'un champ numérique part au blur ; l'enregistrement suit 1,5 s après
    await attendreRepos(page, { horizon: 2000 });
}

/** La carte « Développement du groupe » seule ; les bulles de la configuration (en haut à droite) sont cachées. */
async function capturer(page, nom) {
    if (!DOSSIER_CAPTURES) return;
    await page.addStyleTag({ content: '#notifications-pile { display: none !important; }' });
    const carte = page.locator('#graphique-groupe-moyennes').locator('xpath=ancestor::*[.//h3][1]');
    await carte.scrollIntoViewIfNeeded();
    await attendreRepos(page);
    await carte.screenshot({ path: path.join(DOSSIER_CAPTURES, nom) });
}

test('groupe neuf · la première séance saisie paraît au graphique du Suivi du groupe, sans rechargement ; la deuxième de la semaine aussi', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await viderStockage(page);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await configurerGroupeNeuf(page);

    // AVANT : aucune capture, aucun graphique.
    await ouvrirSuiviGroupe(page);
    expect(await etatGraphique(page)).toEqual({ captures: [], etiquettes: null, courbes: 0 });
    await capturer(page, 'suivi-groupe-neuf-avant.png');

    // La première saisie : le mardi, un élève absent.
    await saisirUneAbsence(page, MARDI);
    await expect.poll(async () => (await etatGraphique(page)).captures, { message: 'la séance saisie est capturée' }).toEqual([MARDI]);

    // APRÈS : retour au Suivi du groupe, sans rechargement ni Réglages — la séance y est, une courbe par élève.
    await ouvrirSuiviGroupe(page);
    const apres = await etatGraphique(page);
    expect(apres.etiquettes, 'un point : la séance du mardi').toHaveLength(1);
    expect(apres.courbes, 'une courbe par élève').toBe(8);
    await capturer(page, 'suivi-groupe-neuf-apres.png');

    // La deuxième séance de la même semaine a sa propre capture : deux points.
    await saisirUneAbsence(page, JEUDI);
    await expect.poll(async () => (await etatGraphique(page)).captures).toEqual([MARDI, JEUDI]);
    await ouvrirSuiviGroupe(page);
    expect((await etatGraphique(page)).etiquettes, 'deux points, un par séance').toHaveLength(2);

    expect(erreurs, 'erreurs console pendant le parcours').toEqual([]);
});
