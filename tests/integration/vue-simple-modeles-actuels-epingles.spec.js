import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// 21 nov. 2026 — LES ÉCRANS DES DEUX MODÈLES ACTUELS DE LA VUE SIMPLE, ÉPINGLÉS (mandat de la release 1.253.0, point 6).
//
// « Par standards » est entrée dans la vue simple, à l'essai, à côté de « Par sélection de productions » et de « Par
// spécifications ». Le rapport du lot (`plans de travail/RAPPORT-2026-11-21-par-standards-vue-simple.md`, § 1) avait
// comparé UNE FOIS, sous Chromium, les écrans des deux modèles actuels à ceux de la base, sans l'épingler. Ce banc
// l'épingle : il joue le même parcours (la classe, le modèle, une production, un résultat) et compare le HTML de chaque
// écran (le choix du modèle, l'accueil, la pratique, les résultats, la note) à une référence rangée à côté.
//
// LA RÉFÉRENCE (`harness/vue-simple-modeles-actuels.reference.json`) A ÉTÉ PRISE SUR LE CODE DE `main` À LA 1.252.0
// (`0aee769a7`, avant « Par standards »), sous WebKit, sur le Mac :
//     INDEX_HTML=<arbre de main>/index.html EPINGLER=1 npx playwright test integration/vue-simple-modeles-actuels-epingles.spec.js
// Un écran d'un modèle actuel qui change fait rougir ce banc. Si le changement est VOULU, la référence se reprend par la
// même commande sur le code neuf (sans INDEX_HTML), et le diff du fichier dit ce qui a changé à l'écran.
//
// UNE SEULE DIFFÉRENCE EST ADMISE, au choix du modèle : la carte des modèles qui ne sont pas l'un des deux actuels, et la
// classe de la grille qui dit leur nombre (`vs-etapes--deux`, `--trois`). Elles sont retirées avant la comparaison ; le
// texte des deux cartes actuelles, lui, est comparé.
//
// L'horloge est fixée (le trimestre créé en coulisse suit la date du jour) ; les identifiants générés sont neutralisés.
// Break-test (21 nov. 2026) : journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + (process.env.INDEX_HTML || path.join(path.resolve(__dirname, '..', '..'), 'index.html'));
const REFERENCE = path.join(__dirname, 'harness', 'vue-simple-modeles-actuels.reference.json');
const patternsAttendus = [/version\.json/i, /Cross origin requests/i, /Not allowed to load local resource/i, /favicon/i, /ERR_FILE_NOT_FOUND/i];
const LISTE = '9990001, Albatros, Ada\n9990002;Baobab;Boréal\n9990003\tCormoran\tChloé\n9990004 Dahlia Dario';
const ACTUELS = ['STD-n-meilleurs', 'SPE-simple'];

const MODELES = [
    { modele: 'STD-n-meilleurs', nom: 'Hybride', bloc: '#vs-bloc-regle', type: null, touche: 'e' },
    { modele: 'SPE-simple', nom: 'Par spécifications', bloc: '#vs-bloc-paliers', type: 'Projet', touche: 'a' }
];

async function ouvrir(page) {
    const erreurs = [];
    const garder = (m) => { if (!patternsAttendus.some((re) => re.test(m))) erreurs.push(m); };
    page.on('console', (m) => { if (m.type() === 'error') garder(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => garder(`pageerror: ${e.message}`));
    await page.clock.setFixedTime(new Date('2026-11-21T15:00:00'));
    // La règle que vivent les utilisateurs : sans le drapeau des bancs, une application vide s'ouvre en vue simple.
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
    await page.goto(indexHtml);
    await attendreApplication(page);
    return erreurs;
}

const ecran = (page, nom) => page.locator(`#simple-${nom}-contenu`);
const allerA = async (page, nom) => { await page.locator(`.navigation-vue-simple [data-onglet="simple-${nom}"]`).click(); await expect(page.locator(`#section-simple-${nom}`)).toBeVisible(); };

/**
 * Le HTML d'un écran, prêt à comparer : les cartes des modèles qui ne sont pas actuels et la classe du nombre de cartes
 * retirées (la seule différence admise), les identifiants générés neutralisés dans l'ordre où ils paraissent, les blancs
 * entre balises resserrés.
 */
async function releve(page, nom) {
    const html = await ecran(page, nom).evaluate((hote, actuels) => {
        const copie = hote.cloneNode(true);
        copie.querySelectorAll('[data-action="VueSimple.choisirModele"]').forEach((b) => {
            if (actuels.indexOf(b.getAttribute('data-param')) < 0) b.closest('li').remove();
        });
        copie.querySelectorAll('.vs-etapes').forEach((l) => { l.className = l.className.replace(/vs-etapes--(deux|trois)/, 'vs-etapes--N'); });
        return copie.innerHTML;
    }, ACTUELS);
    const vus = new Map();
    return html
        .replace(/\b([A-Za-z]+_)(\d{10,}[\w-]*|[a-z0-9]{8,}(?:_[a-z0-9]+)*)\b/g, (tout, prefixe) => {
            if (!vus.has(tout)) vus.set(tout, `${prefixe}#${vus.size + 1}`);
            return vus.get(tout);
        })
        .replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

for (const m of MODELES) {
    test(`« ${m.nom} » : les cinq écrans de la vue simple sont ceux de la 1.252.0`, async ({ page }) => {
        const erreurs = await ouvrir(page);
        const releves = {};

        await ecran(page, 'accueil').locator('[data-param="classe"]').click();
        await page.fill('#vs-liste', LISTE);
        await ecran(page, 'classe').locator('[data-action="VueSimple.creerClasse"]').click();
        await expect(ecran(page, 'classe').locator('.vs-succes')).toHaveText('Classe créée : 4 étudiant·es.');

        await allerA(page, 'pratique');
        await expect(page.locator('[data-action="VueSimple.choisirModele"]').first()).toBeVisible();
        releves.choix = await releve(page, 'pratique');
        await page.locator(`[data-action="VueSimple.choisirModele"][data-param="${m.modele}"]`).click();
        await expect(ecran(page, 'pratique').locator(m.bloc)).toBeVisible();
        releves.pratique = await releve(page, 'pratique');

        await allerA(page, 'resultats');
        await ecran(page, 'resultats').locator('[data-action="VueSimple.ouvrirProduction"]').first().click();
        await page.fill('#vs-production-nom', 'Production 1');
        await page.fill('#vs-production-date', '2026-11-02');
        if (m.type) await page.selectOption('#vs-production-type', { label: m.type });
        await page.locator('[data-action="VueSimple.ajouterProduction"]').click();
        await expect(page.locator('#vs-tableau-hote .tn-production-titre', { hasText: /^Production 1$/ })).toBeVisible();
        const premiereCase = page.locator('#vs-tableau-hote tbody tr:nth-child(1) td.tn-cellule:nth-of-type(1) .tn-case');
        await premiereCase.focus();
        await page.keyboard.press(m.touche);
        await expect(premiereCase).not.toHaveText('');
        await page.evaluate(() => window.db.flush());
        // Le focus et l'annonce du lecteur d'écran sont l'état d'un geste, pas l'écran : on relit l'écran posé.
        await allerA(page, 'note');
        releves.note = await releve(page, 'note');
        await allerA(page, 'resultats');
        await expect(page.locator('#vs-tableau-hote .tn-production-titre')).toHaveCount(1);
        releves.resultats = await releve(page, 'resultats');
        await page.locator('.navigation-vue-simple [data-onglet="simple-accueil"]').click();
        await expect(page.locator('#section-simple-accueil')).toBeVisible();
        releves.accueil = await releve(page, 'accueil');

        expect(erreurs).toEqual([]);
        for (const [nom, html] of Object.entries(releves)) expect(html.length, `l'écran « ${nom} » est vide`).toBeGreaterThan(200);

        if (process.env.EPINGLER) {
            const tout = existsSync(REFERENCE) ? JSON.parse(readFileSync(REFERENCE, 'utf8')) : {};
            tout[m.modele] = releves;
            writeFileSync(REFERENCE, JSON.stringify(tout, null, 2) + '\n');
            return;
        }
        const reference = JSON.parse(readFileSync(REFERENCE, 'utf8'))[m.modele];
        expect(Object.keys(releves).sort()).toEqual(Object.keys(reference).sort());
        for (const nom of Object.keys(reference)) expect(releves[nom], `« ${m.nom} », écran « ${nom} »`).toBe(reference[nom]);
    });
}

/*
 * JOURNAL (21 nov. 2026, WebKit, sur le Mac).
 *   · Référence prise sur `main` à la 1.252.0 (`0aee769a7`, arbre `labo-codex-fusion`) ; le code de la 1.253.0 la rend à
 *     l'identique, deux passages de suite (4 sur 4).
 *   · Break-test : `pratiqueModele: 'Modèle'` devenu `'Le modèle'` dans js/vue-simple.js — les deux essais rougissent sur
 *     l'écran « pratique » ; défait, vert.
 *   · La constante « À l'essai » éteinte (`A_L_ESSAI = false`) : vert, les écrans des modèles actuels n'en dépendent pas.
 *
 * REPRISE VOULUE (22 nov. 2026, session du cloud, Chromium seulement) : l'échelle de départ d'un trimestre neuf a
 * « 0 – Aucun » en tête au lieu de « PS – Préstructurel » (décision de Grégoire, 12 h 27). La référence WebKit n'a PAS
 * été reprise par EPINGLER (pas de WebKit ici) : sous Chromium, la base (`51688aac`) et la tête ont été relevées toutes
 * deux, et leurs relevés ne diffèrent qu'en deux fragments de « Par sélection de productions » (« Tes niveaux » de
 * l'écran « pratique », le repère de l'écran « resultats ») ; ces deux fragments, et eux seuls, ont été reportés à la
 * main dans la référence. ⚠ Sous Chromium, ce banc rougit aussi sur la base : la référence est WebKit. Son verdict
 * reste celui du Mac.
 *
 * REPRISE VOULUE (27 nov. 2026, lot des trois familles, sans navigateur) : six fragments de la référence reportés à la
 * main, chacun un mot posé par le lot : le titre du modèle « Hybride » (deux écrans), « Modèle Hybride », le badge HYB
 * et le nom « Hybride » du tableau, la carte « … ou hybride. » (deux écrans). Rien d'autre. Verdict : celui du Mac.
 */
