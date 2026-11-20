import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// « METTRE TA CLASSE EN PLACE », « NOUS FAISONS » — LES BULLES DU 19 NOVEMBRE 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md (relais, points 1, 2 et 5). Les mots sont jugés
// par tests/unit/sentinelle-parcours-classe-2026-11-09.test.js ; ce banc juge, au navigateur, en faisant les gestes :
//   1. LA CONFIRMATION (« C'est fait : … », au-dessus du titre) : présente quand l'étape d'avant vient d'être faite DANS
//      CE PASSAGE ; absente quand elle a été SAUTÉE parce que déjà réglée (décision de Cowork, relais du 19 nov.) ;
//   2. LE GENRE DE CHAQUE LIGNE, tel que l'œil le voit : la flèche devant un geste à faire (la consigne en gras), le
//      crochet quand il est fait, RIEN devant une explication ; aucune marque sur les sous-lignes d'un geste ;
//   3. les deux mesures du relais : (a) lancé dans la démo, le parcours en sort AVANT sa première bulle, et rien de la
//      démo n'entre dans les vraies données ; (b) le groupe-cours créé à la bulle 6 devient le groupe actif de l'en-tête.
// Deux tailles, l'iPad couché et debout : 1180 × 820, 820 × 1180.
// Break-test (19 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-nous-faisons-classe.md).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// Un mardi, 9 h à Montréal : l'horaire du banc donne une séance le mardi, celle-ci est « déjà donnée ».
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
// Des noms manifestement fictifs (CLAUDE.md, règle 6).
const ELEVES = ['2390001\t00001\tAlpaga\tAlix', '2390002\t00001\tBaobab\tBasile', '2390003\t00001\tCormoran\tCléo'].join('\n');
const TAILLES = [[1180, 820], [820, 1180]];

const bulle = (page) => page.locator('#parcours-bulle');
const plat = (t) => String(t || '').replace(/ /g, ' ');

async function ouvrirEspaceVide(page, [largeur, hauteur]) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.clock.setFixedTime(HORLOGE);
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await attendreApplication(page);
}

async function attendreEtape(page, n, titre) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 8', { timeout: 15000 });
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
    await expect(bulle(page)).not.toHaveClass(/est-en-attente/);
}

/**
 * La bulle telle que l'œil la lit : sa confirmation (ou rien), puis, dans l'ordre, chaque élément de ses lignes avec son
 * genre. O : l'objectif ; L : la phrase du lieu ; E : une explication (une phrase, sans marque) ; G : un geste à faire
 * (la flèche, sans le gras) ; C : la consigne (la flèche, en gras) ; F : un geste fait (le crochet) ; « - » : une ligne
 * de liste SANS marque (une explication mal rangée). Les sous-lignes suivent leur ligne, entre crochets.
 */
async function lireBulle(page) {
    return page.evaluate(() => {
        const b = document.getElementById('parcours-bulle');
        const plat = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
        const marque = (li) => {
            const c = getComputedStyle(li, '::before').content;
            const fleche = /→/.test(c), crochet = /✓/.test(c);
            if (crochet) return 'F';
            if (!fleche) return '-';
            return li.classList.contains('parcours-bulle-ligne--geste') && getComputedStyle(li.querySelector('.parcours-bulle-ligne-texte')).fontWeight >= 600 ? 'C' : 'G';
        };
        const lignes = [];
        [...b.querySelectorAll('.parcours-bulle-lignes > *')].forEach((x) => {
            if (x.tagName !== 'UL') {
                const genre = x.classList.contains('parcours-bulle-objectif') ? 'O' : x.classList.contains('parcours-bulle-lieu') ? 'L' : 'E';
                lignes.push(genre + ' ' + plat(x.textContent));
                return;
            }
            [...x.children].forEach((li) => {
                const texte = plat(li.querySelector('.parcours-bulle-ligne-texte').textContent);
                const sous = [...li.querySelectorAll(':scope > ul > li')].map((s) => marque(s) + ' ' + plat(s.querySelector('.parcours-bulle-ligne-texte').textContent));
                lignes.push(marque(li) + ' ' + texte + (sous.length ? ' [' + sous.join(' | ') + ']' : ''));
            });
        });
        const c = b.querySelector('.parcours-bulle-confirme');
        return { confirme: c && !c.hidden && getComputedStyle(c).display !== 'none' ? plat(c.textContent) : null, lignes };
    });
}

// ---------- Les gestes de chaque étape, tels qu'une personne les fait ----------

async function remplirTrimestre(page) {
    await page.selectOption('#v2-sessionTrimestre', 'automne');
    await page.fill('#v2-anneeTrimestre', '2026');
    await page.fill('#v2-debutTrimestre', '2026-08-24');
    await page.fill('#v2-finCours', '2026-12-11');
    await page.fill('#v2-finTrimestre', '2026-12-21');
    await page.click('#v2-btnCreerTrimestre');
}

async function remplirCours(page) {
    await page.fill('#v2-codeCours', '601-101-MQ');
    await page.fill('#v2-nomCours', 'Écriture et littérature');
    const discipline = await page.evaluate(() => [...document.querySelectorAll('#v2-disciplineCours option')].map((o) => o.value).find(Boolean));
    await page.selectOption('#v2-disciplineCours', discipline);
    await page.fill('#v2-ponderation', '2-2-3');
    await page.click('#v2-btnCreerCours');
}

async function remplirProfil(page) {
    await page.fill('#v2-ens-prenom', 'Camille');
    await page.fill('#v2-ens-nom', 'Fictive');
    await page.fill('#v2-ens-courriel', 'camille@exemple.org');
    await page.fill('#v2-ens-institution', 'Cégep imaginaire');
    await page.click('#v2-btnCreerEnseignant');
}

async function remplirGroupeCours(page) {
    for (const id of ['v2-gc-trimestre', 'v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant']) {
        const valeur = await page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')]
            .filter((o) => o.value && !o.disabled).map((o) => o.value)[0], id);
        if (!(await page.inputValue('#' + id))) await page.selectOption('#' + id, valeur);
    }
    await page.click('#v2-btnCreerGroupeCours');
}

/** Le trimestre et le profil, faits à la main AVANT le parcours : il les sautera, la 1 au départ, la 3 en chemin. */
async function trimestreEtProfilAvant(page) {
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.click('#accordeon-gestion-trimestres .accordeon-header');
    await remplirTrimestre(page);
    await expect.poll(() => page.evaluate(() => db.getSync('trimestreActif', null))).toBe('a2026');
    await page.evaluate(async () => {
        const acc = document.getElementById('accordeon-enseignant');
        if (acc.classList.contains('ferme')) toggleAccordeonV2(acc.querySelector('.accordeon-header'));
        await nouveauProfilEnseignantV2();
    });
    await remplirProfil(page);
    await expect.poll(() => page.evaluate(() => (db.getSync('enseignants', []) || []).length)).toBe(1);
}

for (const taille of TAILLES) {
    const nom = taille.join(' × ');

    test(`la confirmation, présente après une étape faite, absente après une étape sautée ; le genre de chaque ligne (${nom})`, async ({ page }) => {
        test.setTimeout(180000);
        await ouvrirEspaceVide(page, taille);
        await trimestreEtProfilAvant(page);
        await page.evaluate(() => { afficherSection('accueil'); afficherAccueil(); });
        await page.evaluate(() => Assistance.lancerParcours('classe'));

        // 2. Le cours : la première bulle de ce passage. Le trimestre a été sauté (déjà réglé) : aucune confirmation.
        await attendreEtape(page, 2, 'Ton cours');
        let vu = await lireBulle(page);
        expect(vu.confirme, 'bulle 2 : le trimestre était déjà là').toBeNull();
        expect(vu.lignes).toEqual([
            "L Tu es dans la section « Cours et services » : c'est là que tu dis quel cours tu donnes.",
            'E Aie sous la main ton plan de cours.',
            'G Le code du cours (ex. : 601-101-MQ)',
            'G Sa pondération (elle servira à calculer tes heures de cours)',
            'G Sa discipline (elle servira à identifier le matériel que tu partageras)',
            'C Touche « Créer le cours »',
            "E Tu donnes plusieurs cours ? Crée-en un seul pour l'instant : tu ajouteras les autres après ce parcours."
        ]);
        // Un geste fait : le crochet remplace la flèche, la ligne reste.
        await page.fill('#v2-codeCours', '601-101-MQ');
        await expect.poll(async () => (await lireBulle(page)).lignes[2]).toBe('F Le code du cours (ex. : 601-101-MQ)');
        await remplirCours(page);

        // 3 sautée (le profil existait) → 4. La classe : l'étape d'avant n'a pas été faite dans ce passage, rien n'est confirmé.
        await attendreEtape(page, 4, 'Ta classe');
        vu = await lireBulle(page);
        expect(vu.confirme, 'bulle 4 : le profil était déjà là').toBeNull();
        expect(vu.lignes).toEqual([
            "L Tu es dans la section « Groupe d'étudiant·es » : c'est là que tu apportes la liste de ton groupe.",
            'E Aie sous la main la liste de ton groupe, tirée du système de gestion scolaire de ton collège.',
            "G Colle ta liste, copiée de ton tableur, ou choisis un fichier .csv. Une ligne par personne : [- son DA (il l'identifie partout dans l'application) | - son numéro de groupe (il servira à ton horaire et à ton groupe-cours) | - son nom et son prénom]",
            "G Vérifie l'aperçu",
            'C Touche « Importer »'
        ]);
        await page.fill('#v2-donneesCollees', ELEVES);
        await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
        await page.click('#v2-btnConfirmerImport');

        // 5. L'horaire : les étudiant·es viennent d'être importé·es, la confirmation le dit.
        await attendreEtape(page, 5, 'Ton horaire');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : tes étudiant·es sont importé·es.");
        expect(vu.lignes).toEqual([
            "L Tu es dans la section « Horaire » : c'est là que tu dis quand ton groupe se rencontre.",
            'E Aie sous la main ton horaire.',
            "G Choisis le groupe (l'horaire lui sera lié)",
            "G Nomme l'horaire (ex. : Lun-Mar)",
            'G Choisis le nombre de séances par semaine (des heures consécutives avec un même groupe comptent pour une seule séance)',
            "G Pour chaque séance : le jour, le début et la fin (le nombre de périodes s'écrit d'après ces heures ; corrige-le au besoin)",
            "C Touche « Créer l'horaire »"
        ]);
        // Le nombre de séances, le jour et les heures naissent avec un défaut : leurs lignes gardent la flèche, même touchés.
        await page.selectOption('#v2-hor-groupeAssocie', '00001');
        await page.fill('#v2-hor-nom', 'Mardi matin');
        await page.selectOption('#v2-hor-nbSeances', '1');
        await page.selectOption('#v2-hor-seance-0-jour', 'Mardi');
        await page.fill('#v2-hor-seance-0-debut', '08:00');
        await page.fill('#v2-hor-seance-0-fin', '10:00');
        await expect.poll(async () => (await lireBulle(page)).lignes.slice(2, 6).map((l) => l.slice(0, 1))).toEqual(['F', 'F', 'G', 'G']);
        await page.click('#v2-btnCreerHoraire');

        // 6. Le groupe-cours.
        await attendreEtape(page, 6, 'Ton groupe-cours');
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : ton horaire est créé.");
        expect(vu.lignes).toEqual([
            "L Tu es dans la section « Groupe-cours » : c'est là que tu assembles ce que tu viens de créer.",
            "E Un groupe-cours, c'est une classe : un cours, un groupe, un horaire, un·e enseignant·e. C'est à lui que se rattachera tout ce que l'application gardera : présences, productions, évaluations.",
            'G Ton cours', 'G Ton numéro de groupe', 'G Ton horaire', 'G Toi, comme enseignant·e',
            "C Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de l'application)",
            'E La pratique de notation peut attendre.'
        ]);
        // La parenthèse de la consigne sort du gras (la consigne l'écrit hors des astérisques) ; la consigne, elle, y reste.
        expect(await page.evaluate(() => {
            const c = document.querySelector('#parcours-bulle .parcours-bulle-ligne--geste .parcours-bulle-ligne-texte');
            const p = c.querySelector('.parcours-bulle-ligne-precision');
            return { gras: getComputedStyle(c).fontWeight, precision: p ? p.textContent.replace(/\u00a0/g, ' ') : null, poids: p ? getComputedStyle(p).fontWeight : null };
        })).toEqual({ gras: '600', precision: " (il apparaîtra dans l'en-tête de l'application)", poids: '400' });
        expect(await page.evaluate(() => (db.getSync(cle('groupesCours'), []) || []).length), 'aucun groupe-cours avant ce geste').toBe(0);
        await remplirGroupeCours(page);

        // Mesure (b) du relais : le groupe-cours créé, le premier du trimestre, devient le groupe actif de l'en-tête. La
        // bulle 7 prend donc les présences de CE groupe. (Une personne qui en a déjà un dans le trimestre ne voit pas la
        // bulle 6 : l'étape est réglée, le parcours la saute ; mesuré au rapport du lot.)
        await attendreEtape(page, 7, 'Prendre les présences');
        const gc = await page.evaluate(() => {
            const l = db.getSync(cle('groupesCours'), []);
            return { cree: l.length === 1 ? l[0].id : null, actif: (db.getSync('groupeCoursActif', null) || {}).id, entete: document.getElementById('selectGroupeCoursHeader').value };
        });
        expect(gc.cree).toBeTruthy();
        expect(gc.actif, 'le groupe actif est celui qu’on vient de créer').toBe(gc.cree);
        expect(gc.entete, 'l’en-tête le montre').toBe(gc.cree);

        // 7. Les présences : la mise en place vient d'être terminée.
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : ton groupe-cours est créé. La mise en place est terminée.");
        expect(vu.lignes).toEqual([
            "L Tu es dans « Suivi », à l'onglet « Présences ». Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi.",
            "E Tu prends déjà les présences ; ici, chaque séance s'ajoute à la mémoire de ta classe.",
            "G Choisis une séance déjà donnée, ou celle d'aujourd'hui (l'application propose la plus récente)",
            'G Note seulement les absences et les retards (tout le monde est présent par défaut)',
            "C Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)"
        ]);
        await page.click('#btnVerrouillerSaisiePresences');

        // 8. La classe d'un coup d'œil : tout est explication, sauf la consigne de la fin.
        await attendreEtape(page, 8, "Ta classe d'un coup d'œil");
        vu = await lireBulle(page);
        expect(vu.confirme).toBe("C'est fait : la séance est verrouillée.");
        expect(vu.lignes).toEqual([
            "L Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.",
            "E Chaque point blanc est un·e de tes étudiant·es. La bande « Assiduité » le place selon ses présences : plus il glisse vers la gauche, plus les absences s'accumulent.",
            "E Tout le monde était là : un point s'écartera à la première absence.",
            "E Les bandes « Complétion » et « Performance » sont vides : elles s'allumeront à tes premières évaluations.",
            "E Séance après séance, tu verras qui s'éloigne, sans attendre une main levée.",
            'E Pour revoir une étape, touche « 8 sur 8 ».',
            "O Objectif atteint : tu es en mesure de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance.",
            "E Chaque parcours a son objectif. C'est toi qui choisis la suite.",
            expect.stringMatching(/^C Touche « (Parcours suivant », ou « )?Terminer »$/)
        ]);

        // Revue par le compteur (la bulle 5, déjà faite) : l'étape d'avant a été faite dans ce passage, la confirmation reste.
        await bulle(page).locator('.parcours-bulle-rang').click();
        await bulle(page).locator('.parcours-bulle-etape').nth(4).click();
        await attendreEtape(page, 5, 'Ton horaire');
        expect((await lireBulle(page)).confirme).toBe("C'est fait : tes étudiant·es sont importé·es.");
        await page.evaluate(() => ParcoursMoteur.fermer());
    });

    test(`la première bulle : l'objectif, la section, les gestes fléchés, leurs sous-lignes sans marque ; aucune confirmation (${nom})`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirEspaceVide(page, taille);
        await page.evaluate(() => Assistance.lancerParcours('classe'));
        await attendreEtape(page, 1, 'Ton trimestre');
        let vu = await lireBulle(page);
        expect(vu.confirme).toBeNull();
        expect(vu.lignes).toEqual([
            "O À la fin de ce parcours, tu seras en mesure de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance.",
            "L Tu es dans « Cadre », à la section « Trimestre » : c'est là que tu donnes les dates de ton trimestre.",
            "E Cette fois, c'est ta propre classe : ce que tu crées ici reste dans ton application.",
            'E Aie sous la main le calendrier scolaire de ton collège.',
            "G Choisis la session et l'année (elles serviront à identifier ton trimestre)",
            'G Donne trois dates (elles serviront à bâtir ton calendrier de séances) : [- le début du trimestre | - la fin des cours réguliers | - la fin du trimestre]',
            'C Touche « Créer le trimestre »',
            'E Le reste du formulaire peut attendre.',
            'E Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.'
        ]);
        // Une sous-ligne faite reçoit son crochet ; la ligne mère garde sa flèche jusqu'à la dernière.
        await page.fill('#v2-debutTrimestre', '2026-08-24');
        await expect.poll(async () => (await lireBulle(page)).lignes[5]).toBe(
            'G Donne trois dates (elles serviront à bâtir ton calendrier de séances) : [F le début du trimestre | - la fin des cours réguliers | - la fin du trimestre]');
        await page.fill('#v2-finCours', '2026-12-11');
        await page.fill('#v2-finTrimestre', '2026-12-21');
        await expect.poll(async () => (await lireBulle(page)).lignes[5].slice(0, 1)).toBe('F');
        // Le nom de la section, sous l'en-tête, avec son halo.
        await expect(page.locator('#accordeon-gestion-trimestres .accordeon-header h3')).toHaveClass(/parcours-section-actuelle/);
        await expect(page.locator('#accordeon-gestion-trimestres .accordeon-header h3')).toBeInViewport();
        await page.evaluate(() => ParcoursMoteur.fermer());
    });
}

test('mesure (a) : lancé dans la démo, « Nous faisons » en sort avant sa première bulle ; rien de la démo n’entre dans les vraies données', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, TAILLES[0]);
    const reelles = () => page.evaluate(() => {
        const o = {};
        Object.keys(localStorage).forEach((k) => { if (!/^demo_/.test(k)) o[k] = localStorage.getItem(k); });
        return o;
    });
    const avant = await reelles();
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    // Chaque bulle rendue, même un instant, avec l'état de la démo à ce moment.
    await page.evaluate(() => {
        window.__bulles = [];
        new MutationObserver(() => {
            const r = document.querySelector('#parcours-bulle .parcours-bulle-rang');
            if (r) window.__bulles.push(estEnModeDemo());
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    await page.evaluate(() => Assistance.lancerParcours('classe'));
    await attendreEtape(page, 1, 'Ton trimestre');
    const vues = await page.evaluate(() => window.__bulles);
    expect(vues.length).toBeGreaterThan(0);
    expect(vues.every((d) => d === false), 'aucune bulle rendue pendant que la démo est ouverte').toBe(true);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(false);
    // Les clés réelles qui ont changé : aucune ne porte une marque de la démo (DA, groupe-cours, horaire, enseignant).
    const apres = await reelles();
    const changees = Object.keys(apres).filter((k) => apres[k] !== avant[k]);
    const marquees = changees.filter((k) => /DEMO|GC_DEMO|HOR_DEMO|Primavera|601-999-DM/.test(apres[k]));
    expect(marquees, 'clés réelles écrites avec une donnée de la démo').toEqual([]);
    await page.evaluate(() => ParcoursMoteur.fermer());
});
