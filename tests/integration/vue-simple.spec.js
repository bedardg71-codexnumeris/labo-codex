import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// VUE SIMPLE (lot « Vue simple », consigne de Cowork du 9 nov. 2026) — rapport : `plans de travail/RAPPORT-2026-11-09-vue-simple.md`.
// Deux vues, « Vue simple » et « Vue étendue ». La vue simple réduit l'application à une fonction : passer de résultats non
// sommatifs à une note chiffrée. Ce banc suit le parcours d'un nouvel arrivant, de l'application vide jusqu'à la vue étendue
// et retour, PAR L'INTERFACE (aucune donnée semée, sauf où c'est dit). Noms fictifs. Écrit et éprouvé sous Chromium
// (session cloud) ; le verdict WebKit se prend sur le Mac.

const patternsAttendus = [/version\.json/i, /Cross origin requests/i, /Not allowed to load local resource/i, /favicon/i, /ERR_FILE_NOT_FOUND/i];
const CLE_CHOIX = 'laboCodex.vue';

// La règle arrêtée par Grégoire : un novice ne lit aucun de ces mots en vue simple.
const MOTS_INTERDITS = /horaire|cong[ée]s?\b|calendrier|grille|crit[èe]re|cartouche|annotation|pr[ée]sence|d[ée]pistage|portfolio|artefact/i;
// Décision de Grégoire (9 nov. 2026, 19 h 35) : « étudiant·e », jamais « élève », sur tout écran de la vue simple.
const MOT_ELEVE = /[ée]l[èe]ves?\b/i;
// « codex » : toléré dans la phrase qui l'introduit et, pour cette version (décision de Cowork, 19 h 40), à ces endroits, nommés un à un.
const OU_CODEX_EST_TOLERE = [
    '.modal-js-overlay',           // l'aperçu du geste d'enregistrement (« Mettre à jour le codex », « codex-manifeste.json »)
    '#overlay-backup-reminder',    // le rappel de sauvegarde (« Mets ton codex à jour »)
    '.notification-succes'         // la confirmation ou l'échec du geste (« Codex mis à jour », « Codex non mis à jour »)
];
const PHRASE_CODEX = 'Tes données restent dans ce navigateur. Enregistre-les dans un fichier, ton codex, pour ne pas les perdre et pour les rouvrir ailleurs.';
const LISTE = '9990001, Albatros, Ada\n9990002;Baobab;Bruno\n9990003\tCormoran\tChloé\n9990004 Dahlia Dario';

async function ouvrir(page) {
    const erreurs = [];
    const garder = (m) => { if (!patternsAttendus.some((re) => re.test(m))) erreurs.push(m); };
    page.on('console', (m) => { if (m.type() === 'error') garder(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => garder(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    // Sous un banc (`navigator.webdriver`), l'application s'ouvre en vue étendue pour ne pas déplacer les autres bancs
    // (`vueAuDemarrage`). Ce banc-ci éprouve la règle que vivent les utilisateurs : il éteint le drapeau.
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
    await page.goto(indexHtml);
    await attendreApplication(page);
    return erreurs;
}

const ecran = (page, nom) => page.locator(`#simple-${nom}-contenu`);
const allerA = async (page, nom) => { await page.locator(`.navigation-vue-simple [data-onglet="simple-${nom}"]`).click(); await expect(page.locator(`#section-simple-${nom}`)).toBeVisible(); };
const caseTn = (page, rangee, colonne) => page.locator(`#vs-tableau-hote tbody tr:nth-child(${rangee}) td.tn-cellule:nth-of-type(${colonne}) .tn-case`);
const noteTn = (page, rangee) => page.locator(`#vs-tableau-hote tbody tr:nth-child(${rangee}) .tn-note-valeur`);

async function collerLaClasse(page) {
    await ecran(page, 'accueil').locator('[data-param="classe"]').click();
    await page.fill('#vs-liste', LISTE);
    await ecran(page, 'classe').locator('[data-action="VueSimple.creerClasse"]').click();
    await expect(ecran(page, 'classe').locator('.vs-succes')).toHaveText('Classe créée : 4 étudiant·es.');
}

async function choisirLeModele(page, modele) {
    await allerA(page, 'pratique');
    await page.locator(`[data-action="VueSimple.choisirModele"][data-param="${modele}"]`).click();
    await expect(ecran(page, 'pratique').locator(modele === 'SPE-simple' ? '#vs-bloc-paliers' : '#vs-bloc-regle')).toBeVisible();
}

/** « Régler » : ouvre un réglage de l'écran Pratique (regle, niveaux, types, paliers). */
async function regler(page, quoi) {
    await allerA(page, 'pratique');
    await page.locator(`#vs-bloc-${quoi} [data-action="VueSimple.regler"]`).click();
    await expect(page.locator(`#vs-bloc-${quoi} [data-action="VueSimple.enregistrerReglage"]`)).toBeVisible();
}

async function enregistrerLeReglage(page, mot) {
    await page.locator('[data-action="VueSimple.enregistrerReglage"]').click();
    await expect(ecran(page, 'pratique').locator('.vs-succes')).toHaveText(mot);
}

/** Règle « N meilleures productions », par « Régler ». */
async function reglerLesMeilleures(page, n) {
    await regler(page, 'regle');
    await page.locator('input[name="vs-regle"][value="meilleurs"]').check();
    await page.fill('#vs-regle-nombre', String(n));
    await enregistrerLeReglage(page, 'Règle enregistrée.');
}

async function ajouterProduction(page, nom, date, type) {
    await ecran(page, 'resultats').locator('[data-action="VueSimple.ouvrirProduction"]').first().click();
    await page.fill('#vs-production-nom', nom);
    if (date) await page.fill('#vs-production-date', date);
    if (type) await page.selectOption('#vs-production-type', { label: type });
    await page.locator('[data-action="VueSimple.ajouterProduction"]').click();
    await expect(page.locator('#vs-tableau-hote .tn-production-titre', { hasText: new RegExp(`^${nom}$`) })).toBeVisible();
}

/** Le novice par standards, SANS OUVRIR AUCUN RÉGLAGE : classe, modèle, trois productions, des résultats pour Ada et un pour Bruno. */
async function novice(page) {
    await collerLaClasse(page);
    await choisirLeModele(page, 'STD-n-meilleurs');
    await allerA(page, 'resultats');
    await ajouterProduction(page, 'Production 1', '2026-11-02');
    await ajouterProduction(page, 'Production 2', '2026-11-09');
    await ajouterProduction(page, 'Production 3', '');
    await caseTn(page, 1, 1).focus();
    await page.keyboard.press('e');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('m');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('d');
    await caseTn(page, 2, 1).focus();
    await page.keyboard.press('i');
    await expect(noteTn(page, 1)).toHaveText('80');   // toutes les productions : E (100), M (75), D (65) → 240 / 3
}

/** L'empreinte des données : toutes les clés de `db` et tout `localStorage`, sauf le choix de la vue (qui n'est pas une donnée). */
async function empreinte(page) {
    return page.evaluate(async (cleChoix) => {
        await window.db.flush();
        const cles = (await window.db.keys()).sort();
        const base = {};
        for (const c of cles) base[c] = JSON.stringify(await window.db.get(c, null));
        const local = {};
        Object.keys(window.localStorage).sort().forEach((k) => { if (k !== cleChoix) local[k] = window.localStorage.getItem(k); });
        return { compte: cles.length, base, local };
    }, CLE_CHOIX);
}

function differences(avant, apres) {
    const diff = [];
    ['base', 'local'].forEach((zone) => {
        new Set([...Object.keys(avant[zone]), ...Object.keys(apres[zone])]).forEach((k) => {
            if (avant[zone][k] !== apres[zone][k]) diff.push(`${zone}:${k}`);
        });
    });
    return diff;
}

async function basculer(page, vue) {
    await page.locator('#entete-menu-bouton').click();
    await page.locator(vue === 'simple' ? '#menu-vue-simple' : '#menu-vue-etendue').click();
    await expect(page.locator('body')).toHaveClass(vue === 'simple' ? /vue-simple/ : /^(?!.*vue-simple)/);
}

/** Ce qu'un utilisateur lit à l'écran : le texte rendu, et les libellés portés par les éléments visibles. */
async function ceQuiSeLit(page) {
    return page.evaluate((toleres) => {
        const visibles = [...document.querySelectorAll('body *')].filter((n) => (n.checkVisibility ? n.checkVisibility() : n.offsetParent !== null));
        const attributs = visibles.map((n) => ['title', 'aria-label', 'placeholder', 'alt'].map((a) => n.getAttribute(a)).filter(Boolean).join(' | ')).filter(Boolean);
        const texte = document.body.innerText;
        // Le texte hors des endroits où « codex » est toléré : celui de ces éléments est retiré du texte lu.
        let horsToleres = texte;
        toleres.forEach((sel) => document.querySelectorAll(sel).forEach((n) => { const t = n.innerText; if (t) horsToleres = horsToleres.split(t).join(''); }));
        return { texte, horsToleres, attributs: attributs.join('\n') };
    }, OU_CODEX_EST_TOLERE);
}

async function aucunMotInterdit(page, ou) {
    const lu = await ceQuiSeLit(page);
    const motDans = (t) => { const m = t.match(MOTS_INTERDITS); return m ? `${ou} : « ${m[0]} » dans « ${t.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, ' ')} »` : null; };
    expect(motDans(lu.texte)).toBeNull();
    expect(motDans(lu.attributs)).toBeNull();
    // Aucun chemin vers un écran de la vue étendue (« Conception › Pratiques », « Cadre › Trimestre ») : elle n'est pas affichée.
    const chemin = lu.texte.match(/[^\n]*›[^\n]*/);
    expect(chemin ? `${ou} : un chemin de la vue étendue, « ${chemin[0].trim().slice(0, 120)} »` : null).toBeNull();
    // « codex » : toléré dans la seule phrase qui l'introduit.
    const eleve = (lu.texte + '\n' + lu.attributs).match(MOT_ELEVE);
    expect(eleve ? `${ou} : « ${eleve[0]} » se lit, au lieu de « étudiant·e »` : null).toBeNull();
    const sansLaPhrase = lu.horsToleres.split(PHRASE_CODEX).join('');
    const codex = sansLaPhrase.match(/codex/i);
    expect(codex ? `${ou} : « codex » dans « ${sansLaPhrase.slice(Math.max(0, codex.index - 60), codex.index + 60).replace(/\s+/g, ' ')} »` : null).toBeNull();
}

test.describe('Vue simple · le parcours d\'un nouvel arrivant', () => {
    test('1 à 9 : de l\'application vide à la note, à la sauvegarde, à la vue étendue, et retour', async ({ page }) => {
        test.setTimeout(120000);
        const erreurs = await ouvrir(page);

        // 1. Application vide : vue simple, accueil à quatre cartes.
        await expect(page.locator('body')).toHaveClass(/vue-simple/);
        await expect(page.locator('#section-simple-accueil')).toBeVisible();
        await expect(ecran(page, 'accueil').locator('.vs-titre')).toHaveText('Ta notation alternative');
        await expect(ecran(page, 'accueil').locator('.vs-etape')).toHaveCount(4);
        await expect(page.locator('.navigation-vue-simple button')).toHaveText(['Accueil', 'Classe', 'Pratique', 'Résultats', 'Note finale']);
        await expect(page.locator('.navigation-principale:not(.navigation-vue-simple)')).toBeHidden();
        await expect(page.locator('#btn-codex .codex-label-btn')).toHaveText('Sauvegarder');
        await expect(page.locator('#btn-codex')).toHaveAttribute('aria-label', 'Sauvegarder');

        // 2. Il colle sa liste : trimestre, cours et groupe se créent en coulisse, sans rien d'inventé.
        await collerLaClasse(page);
        await expect(ecran(page, 'classe').locator('.vs-table tbody tr')).toHaveCount(4);
        const coulisse = await page.evaluate(() => {
            const t = window.db.getSync('trimestres', []).filter((x) => x.id !== 'demo');
            const id = t[0].id;
            const gc = window.db.getSync(id + '_groupesCours', []);
            return { trimestres: t.length, actif: t[0].actif, id, groupes: gc.length, horaireId: gc[0].horaireId, pratiqueId: gc[0].pratiqueId,
                cours: window.db.getSync('cours', []).filter((c) => c.id === gc[0].coursId).map((c) => [c.nomCours, c.nature]),
                eleves: window.db.getSync(id + '_groupeEtudiants', []).map((e) => `${e.da} ${e.nom} ${e.prenom} ${e.coursId === gc[0].coursId}`),
                calendrier: window.db.getSync(id + '_cadreCalendrier', null), horaires: window.db.getSync(id + '_horaires', null), conges: window.db.getSync(id + '_journeesSansCours', null),
                actifId: (window.db.getSync('groupeCoursActif', null) || {}).id === gc[0].id };
        });
        expect(coulisse).toMatchObject({ trimestres: 1, actif: true, groupes: 1, horaireId: null, pratiqueId: null, cours: [['Mon cours', 'cours']], actifId: true });
        expect(coulisse.eleves).toEqual(['9990001 Albatros Ada true', '9990002 Baobab Bruno true', '9990003 Cormoran Chloé true', '9990004 Dahlia Dario true']);
        expect((coulisse.calendrier || {}).dateDebut || '').toBe('');   // aucun faux calendrier
        expect(coulisse.horaires || []).toEqual([]);                    // aucun faux horaire
        expect(coulisse.conges || []).toEqual([]);

        // 3. Il choisit un modèle et la règle qui construit la note.
        await choisirLeModele(page, 'STD-n-meilleurs');
        await expect(page.locator('#vs-bloc-regle .vs-valeur')).toHaveText('La note retient toutes les productions évaluées.');   // la règle de départ (Grégoire, 9 nov.)
        await reglerLesMeilleures(page, 2);
        await expect(page.locator('#vs-bloc-regle .vs-valeur')).toHaveText('La note retient les 2 meilleures productions.');
        const pratique = await page.evaluate(() => {
            const gc = window.db.getSync('groupeCoursActif', null);
            const p = window.db.getSync(window.cle('pratiquesConfigurables'), []).find((x) => x.id === gc.pratiqueId);
            const echelle = window.db.getSync(window.cle('echellesTemplates'), []).find((e) => e.id === p.configuration.echelleId);
            return { n: window.db.getSync(window.cle('pratiquesConfigurables'), []).length, type: p.configuration.type, pf: p.configuration.portfolio,
                echelle: { nom: echelle.nom, aElle: echelle.pratiqueId === p.id, lettres: echelle.niveaux.map((x) => x.code).join(' ') } };
        });
        // L'échelle est née avec la pratique : une copie à elle, « Mes niveaux », pas l'échelle de départ du trimestre.
        expect(pratique).toMatchObject({ n: 1, type: 'standards', pf: { methodeSelection: 'meilleurs', nombreARetenir: 2 }, echelle: { nom: 'Mes niveaux', aElle: true, lettres: 'PS I D M E' } });

        // 4. Le tableau sans colonne ne reste pas muet : il dit quoi faire et montre « + Production ».
        await allerA(page, 'resultats');
        await expect(page.locator('#vs-tableau-hote .tn-etat-vide')).toHaveText('Ton tableau n’a pas encore de colonne. Ajoute ta première production : un nom et une date.');
        await expect(page.locator('#vs-tableau-hote .tn-etat-geste button')).toHaveText('+ Production');
        await page.locator('#vs-tableau-hote .tn-etat-geste button').click();
        await expect(page.locator('#vs-production-formulaire input, #vs-production-formulaire select')).toHaveCount(2);   // un nom et une date, rien d'autre
        await page.locator('[data-action="VueSimple.fermerProduction"]').click();
        await ajouterProduction(page, 'Production 1', '2026-11-02');
        await ajouterProduction(page, 'Production 2', '2026-11-09');
        await ajouterProduction(page, 'Production 3', '');
        await expect(page.locator('#vs-tableau-hote .tn-col-production .tn-production-titre')).toHaveText(['Production 1', 'Production 2', 'Production 3']);
        const productions = await page.evaluate(() => window.db.getSync(window.cle('productions'), []));
        expect(productions).toHaveLength(3);
        expect(Object.keys(productions[0]).sort()).toEqual(['coursId', 'dansBibliotheque', 'dateCreation', 'dateEcheance', 'dateModification', 'description', 'id', 'numero', 'titre', 'type']);
        expect(productions.map((p) => [p.titre, p.type, p.dateEcheance, p.numero])).toEqual([['Production 1', 'autre', '2026-11-02', 1], ['Production 2', 'autre', '2026-11-09', 2], ['Production 3', 'autre', '', 3]]);

        // 5. Il inscrit ses résultats au tableau.
        await expect(page.locator('#vs-tableau-hote .tn-case')).toHaveCount(12);
        await caseTn(page, 1, 1).click();   // au toucher : '' → PS
        await expect(caseTn(page, 1, 1)).toHaveText('PS');
        await caseTn(page, 1, 1).focus();
        await page.keyboard.press('e');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('m');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('d');
        await caseTn(page, 2, 1).focus();
        await page.keyboard.press('i');
        await expect(noteTn(page, 1)).toHaveText('88');
        await expect(noteTn(page, 2)).toHaveText('40');
        const copies = await page.evaluate(() => window.db.getSync(window.cle('evaluationsSauvegardees'), []));
        expect(copies).toHaveLength(4);
        expect(copies.every((c) => c.sansGrille === true && c.grilleId === null)).toBe(true);

        // 6. Il voit la note de chaque étudiant·e et exporte le CSV.
        await allerA(page, 'note');
        await expect(ecran(page, 'note').locator('.vs-notes tbody tr')).toHaveCount(4);
        await expect(ecran(page, 'note').locator('.vs-notes tbody tr').nth(0)).toContainText('Ada Albatros');
        await expect(ecran(page, 'note').locator('.vs-note-valeur')).toHaveText(['88', '40', '–', '–']);
        const simule = await page.evaluate(() => { const gc = window.db.getSync('groupeCoursActif', null); return Math.round(window.simulerIndices('9990001', gc.pratiqueId).P); });
        expect(simule).toBe(88);   // la note de l'écran est celle de l'export
        const [csv] = await Promise.all([page.waitForEvent('download'), ecran(page, 'note').locator('[data-action="exporterSyntheseResultatsCSV"]').click()]);
        const contenu = readFileSync(await csv.path(), 'utf8');
        expect(contenu).toMatch(/9990001[;,]"?Albatros"?[;,]"?Ada"?/);
        expect(contenu.split(/\r?\n/).find((l) => l.includes('9990001'))).toContain('88');
        expect(contenu.split(/\r?\n/).filter((l) => /^"?999000\d/.test(l))).toHaveLength(4);

        // 7. Il sauvegarde : même place, même point d'état ; la phrase à l'ouverture ; un fichier s'écrit.
        await page.locator('#btn-codex').click();
        await expect(page.locator('#codex-menu-statut-haut .vs-phrase-sauvegarder')).toHaveText(PHRASE_CODEX);
        await expect(page.locator('#codex-menu .codex-menu-item:visible')).toHaveText([/Enregistrer dans un fichier/, /Ouvrir un fichier…/]);
        // La fenêtre de choix du navigateur ne s'ouvre pas sans écran : un fichier en mémoire la remplace et compte ses écritures
        // (le remplaçant des bancs du codex, 1007-codex-a-part-avant-suppression.spec.js). L'aperçu, lui, est le vrai.
        await page.evaluate(() => {
            window.__ecritures = [];
            window.showSaveFilePicker = async ({ suggestedName }) => ({ async createWritable() {
                return { async write(blob) { window.__ecritures.push({ fichier: suggestedName, octets: blob.size }); }, async close() {}, async abort() {} };
            } });
        });
        await page.locator('.codex-menu-item--simple[data-action="Codex.actionEnregistrer"]').click();
        await page.locator('.modal-js-overlay button', { hasText: 'Mettre à jour' }).click();
        await expect.poll(() => page.evaluate(() => window.__ecritures.length), { timeout: 20000 }).toBe(1);
        const ecriture = await page.evaluate(() => window.__ecritures[0]);
        expect(ecriture.octets).toBeGreaterThan(1000);
        await page.locator('#btn-codex').click();
        await expect(page.locator('#codex-menu-statut-haut')).toContainText('Ton fichier est à jour.');
        await page.locator('#btn-codex').click();

        // 8. Il passe à la vue étendue : sa classe, sa pratique et ses résultats y sont, sans perte ni doublon.
        // Ici on VISITE des écrans de la vue étendue, qui recalculent des indices dérivés (comportement d'avant le lot) : la
        // comparaison porte donc sur ce que l'enseignant a donné. La bascule seule, octet pour octet : le bloc suivant.
        const sesDonnees = (e) => Object.fromEntries(Object.entries(e.base).filter(([k]) => !k.startsWith('demo_') && /^(trimestres|cours|groupeCoursActif|.*_(groupeEtudiants|groupesCours|pratiquesConfigurables|productions|evaluationsSauvegardees|echellesTemplates))$/.test(k)));
        const avant = await empreinte(page);
        expect(Object.keys(sesDonnees(avant)).length).toBe(9);
        await basculer(page, 'etendue');
        await expect(page.locator('#section-accueil')).toBeVisible();
        await expect(page.locator('.navigation-principale:not(.navigation-vue-simple)')).toBeVisible();
        await expect(page.locator('.navigation-vue-simple')).toBeHidden();
        await expect(page.locator('#btn-codex .codex-label-btn')).toHaveText('Codex');
        await expect(page.locator('#codex-indicateur')).toBeVisible();   // le même point d'état, dans les deux vues
        await page.evaluate(() => window.naviguerVers('evaluations', 'liste'));
        await page.evaluate(() => window.TableauNotation.afficher());
        await expect(page.locator('#tableau-notation-hote .tn-case')).toHaveCount(12);
        await expect(page.locator('#tableau-notation-hote tbody tr:nth-child(1) .tn-note-valeur')).toHaveText('88');
        await expect(page.locator('#tableau-notation-hote .tn-avis')).toBeVisible();   // en vue étendue, les mots validés ne bougent pas
        await page.evaluate(() => window.naviguerVers('suivi', 'liste'));
        await expect(page.locator('#suivi-liste')).toContainText('Albatros');
        await page.evaluate(() => window.naviguerVers('conception', 'pratiques-notation'));
        await expect(page.locator('#selectionPratiques')).toContainText('Par standards');
        await page.evaluate(() => window.naviguerVers('conception', 'productions'));
        await expect(page.locator('#conception-productions')).toContainText('Production 3');

        // 9. Il revient à la vue simple : idem.
        await basculer(page, 'simple');
        await expect(page.locator('#section-simple-accueil')).toBeVisible();
        await expect(ecran(page, 'accueil').locator('.vs-etape-etat')).toHaveText(['4 étudiant·es', 'Par standards']);
        await allerA(page, 'resultats');
        await expect(page.locator('#vs-tableau-hote .tn-case')).toHaveCount(12);
        await expect(noteTn(page, 1)).toHaveText('88');
        const apres = await empreinte(page);
        expect(sesDonnees(apres)).toEqual(sesDonnees(avant));
        expect(erreurs).toEqual([]);
    });

    test('au rechargement, celui qui a bâti sa classe en vue simple y reste ; la vue étendue choisie reste aussi', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await page.evaluate(() => window.db.flush());
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).toHaveClass(/vue-simple/);
        await expect(ecran(page, 'accueil').locator('.vs-etape-etat').first()).toHaveText('4 étudiant·es');
        await basculer(page, 'etendue');
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).not.toHaveClass(/vue-simple/);
        await expect(page.locator('#section-accueil')).toBeVisible();
        expect(erreurs).toEqual([]);
    });

    test('par spécifications : « + Production » demande le type quand la pratique en a plus d\'un ; acceptable ou non, la note suit', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'SPE-simple');
        await expect(page.locator('#vs-bloc-paliers .vs-paliers-lus li')).toHaveText([/Excellence 90 · Projet : 2, Examen : 1/, /Réussite 70 · Projet : 1, Examen : 1/]);
        await regler(page, 'paliers');
        await page.locator('.vs-palier-rangee').nth(0).locator('.vs-palier-nombre[data-type="1"]').fill('1');   // Excellence : 1 projet, 1 examen
        await enregistrerLeReglage(page, 'Paliers enregistrés.');
        await allerA(page, 'resultats');
        await ecran(page, 'resultats').locator('[data-action="VueSimple.ouvrirProduction"]').first().click();
        await expect(page.locator('#vs-production-type option')).toHaveText(['Projet', 'Examen']);
        await page.locator('[data-action="VueSimple.fermerProduction"]').click();
        await ajouterProduction(page, 'Projet fictif', '2026-11-02', 'Projet');
        await ajouterProduction(page, 'Examen fictif', '2026-11-09', 'Examen');
        await caseTn(page, 1, 1).focus();
        await page.keyboard.press('a');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('a');
        await expect(caseTn(page, 1, 2)).toHaveText('✓');
        await expect(noteTn(page, 1)).toHaveText('90');
        await allerA(page, 'note');
        await expect(ecran(page, 'note').locator('.vs-note-valeur').first()).toHaveText('90');
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · les gestes tiennent', () => {
    test('deux clics de suite ne créent ni deux cours, ni deux pratiques, ni deux colonnes', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await ecran(page, 'accueil').locator('[data-param="classe"]').click();
        await page.fill('#vs-liste', LISTE);
        await page.evaluate(() => { const b = document.querySelector('#simple-classe-contenu [data-action="VueSimple.creerClasse"]'); b.click(); b.click(); });
        await expect(ecran(page, 'classe').locator('.vs-succes')).toHaveText('Classe créée : 4 étudiant·es.');
        await allerA(page, 'pratique');
        await page.evaluate(() => { const b = document.querySelector('[data-action="VueSimple.choisirModele"][data-param="STD-n-meilleurs"]'); b.click(); b.click(); });
        await expect(page.locator('#vs-bloc-regle')).toBeVisible();
        await allerA(page, 'resultats');
        await page.locator('#vs-tableau-hote .tn-etat-geste button').click();
        await page.fill('#vs-production-nom', 'Production 1');
        await page.evaluate(() => { const b = document.querySelector('[data-action="VueSimple.ajouterProduction"]'); b.click(); b.click(); });
        await expect(page.locator('#vs-tableau-hote .tn-production-titre')).toHaveText(['Production 1']);
        const comptes = await page.evaluate(() => ({ cours: window.db.getSync('cours', []).filter((c) => !c.isDemo).length, groupes: window.db.getSync(window.cle('groupesCours'), []).length,
            pratiques: window.db.getSync(window.cle('pratiquesConfigurables'), []).length, productions: window.db.getSync(window.cle('productions'), []).length }));
        expect(comptes).toEqual({ cours: 1, groupes: 1, pratiques: 1, productions: 1 });
        expect(erreurs).toEqual([]);
    });

    test('« Changer de modèle » puis le même modèle : la pratique laissée est reprise, pas doublée', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'STD-n-meilleurs');
        await page.locator('[data-action="VueSimple.changerModele"]').click();
        await expect(page.locator('[data-action="VueSimple.choisirModele"]')).toHaveCount(2);
        await choisirLeModele(page, 'STD-n-meilleurs');
        expect(await page.evaluate(() => window.db.getSync(window.cle('pratiquesConfigurables'), []).length)).toBe(1);
        expect(erreurs).toEqual([]);
    });

    test('un geste commun qui ouvre un écran de la vue étendue ramène à la vue simple (on ne s\'y retrouve pas sans barre)', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await page.evaluate(() => window.naviguerVers('calendrier', 'trimestre'));   // ce que fait « Trimestres », dans le bandeau d'un trimestre clos
        await expect(page.locator('#section-simple-classe')).toBeVisible();
        await expect(page.locator('#section-calendrier')).toBeHidden();
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · rien n\'est imposé, rien ne se règle avant d\'avoir une note', () => {
    // Règle validée par Grégoire (9 nov. 2026, 19 h 44) : tout ce qui entre dans la note a une valeur de départ et se règle,
    // à un geste, près de la valeur ; rien ne se règle avant d'avoir une note.
    test('application vide : de la liste à la note sans ouvrir un seul réglage ; puis chaque valeur réglable est à un geste de l\'écran où elle paraît', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        let reglagesOuverts = 0;
        await page.exposeFunction('__reglageOuvert', () => { reglagesOuverts++; });
        await page.evaluate(() => { const vrai = window.VueSimple.regler; window.VueSimple.regler = function () { window.__reglageOuvert(); return vrai.apply(this, arguments); }; });
        await novice(page);   // classe, modèle, trois productions, des résultats : aucun « Régler »
        await allerA(page, 'note');
        await expect(ecran(page, 'note').locator('.vs-note-valeur')).toHaveText(['80', '40', '–', '–']);
        expect(reglagesOuverts).toBe(0);
        await expect(page.locator('.vs-reglage')).toHaveCount(0);
        // Écran Pratique : la règle et les niveaux se lisent, « Régler » est à côté de chacun, et un geste ouvre le réglage.
        for (const quoi of ['regle', 'niveaux']) {
            await allerA(page, 'pratique');
            await expect(page.locator(`#vs-bloc-${quoi} input`)).toHaveCount(0);
            await page.locator(`#vs-bloc-${quoi} [data-action="VueSimple.regler"]`).click();
            await expect(page.locator(`#vs-bloc-${quoi} input`).first()).toBeVisible();
            await page.locator('[data-action="VueSimple.annulerReglage"]').click();
        }
        // Tableau : « Régler » à côté de la phrase de la règle, et à côté des niveaux ; un geste mène au réglage ouvert.
        await allerA(page, 'resultats');
        await expect(page.locator('#vs-tableau-hote .tn-pratique .tn-reglages')).toHaveText('Régler');
        await page.locator('#vs-tableau-hote .tn-pratique .tn-reglages').click();
        await expect(page.locator('#vs-bloc-regle input[name="vs-regle"]').first()).toBeVisible();
        await allerA(page, 'resultats');
        await page.locator('#vs-tableau-hote .tn-repere .tn-reglages').click();
        await expect(page.locator('#vs-bloc-niveaux .vs-niveau-rangee')).toHaveCount(5);
        expect(erreurs).toEqual([]);
    });

    test('par spécifications : les types et les paliers sont à un geste, sur l\'écran Pratique et au tableau', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'SPE-simple');
        for (const quoi of ['paliers', 'types']) {
            await expect(page.locator(`#vs-bloc-${quoi} input`)).toHaveCount(0);
            await page.locator(`#vs-bloc-${quoi} [data-action="VueSimple.regler"]`).click();
            await expect(page.locator(`#vs-bloc-${quoi} input`).first()).toBeVisible();
            await page.locator('[data-action="VueSimple.annulerReglage"]').click();
        }
        await allerA(page, 'resultats');
        await ajouterProduction(page, 'Projet fictif', '2026-11-02', 'Projet');
        await page.locator('#vs-tableau-hote .tn-pratique .tn-reglages').click();
        await expect(page.locator('#vs-bloc-types .vs-type-nom')).toHaveCount(2);
        await allerA(page, 'resultats');
        await page.locator('#vs-tableau-hote .tn-repere .tn-reglages').click();
        await expect(page.locator('#vs-bloc-paliers .vs-palier-rangee')).toHaveCount(2);
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · A. par standards, les niveaux se règlent', () => {
    const copies = (page) => page.evaluate(() => window.db.getSync(window.cle('evaluationsSauvegardees'), []));
    const rangee = (page, i) => page.locator('#vs-bloc-niveaux .vs-niveau-rangee').nth(i);

    test('quatre niveaux aux valeurs inventées : la note est celle qu\'on recalcule à la main', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'STD-n-meilleurs');
        await regler(page, 'niveaux');
        // Cinq niveaux de départ : on en retire un, et les quatre autres deviennent ceux de l'enseignant·e.
        await page.locator('[data-action="VueSimple.niveauGeste"][data-param="retirer"]').nth(0).click();
        await expect(page.locator('.vs-niveau-rangee')).toHaveCount(4);
        const miens = [['Z', 'À reprendre', '30'], ['C', 'En chemin', '61.5'], ['B', 'Bien', '82'], ['A', 'Abouti', '95']];
        for (let i = 0; i < 4; i++) {
            await rangee(page, i).locator('.vs-n-code').fill(miens[i][0]);
            await rangee(page, i).locator('.vs-n-nom').fill(miens[i][1]);
            await rangee(page, i).locator('.vs-n-valeur').fill(miens[i][2]);
        }
        // L'ordre : « A » monte en tête (trois fois « monter »).
        for (let i = 3; i > 0; i--) await rangee(page, i).locator('[data-param="monter"]').click();
        await expect(page.locator('.vs-n-code')).toHaveCount(4);
        expect(await page.locator('.vs-n-code').evaluateAll((els) => els.map((e) => e.value))).toEqual(['A', 'Z', 'C', 'B']);
        await enregistrerLeReglage(page, 'Niveaux enregistrés.');
        await expect(page.locator('#vs-bloc-niveaux .vs-niveau')).toHaveText([/A Abouti 95/, /Z À reprendre 30/, /C En chemin 61.5/, /B Bien 82/]);
        await allerA(page, 'resultats');
        for (const [n, d] of [['Production 1', '2026-11-02'], ['Production 2', '2026-11-09'], ['Production 3', '2026-11-16']]) await ajouterProduction(page, n, d);
        await expect(page.locator('#vs-tableau-hote .tn-repere-titre')).toHaveText('Échelle « Mes niveaux » :');
        await expect(page.locator('#vs-tableau-hote .tn-repere')).not.toContainText(/IDME|départ/i);
        // Ada : A, C, Z → (95 + 61,5 + 30) / 3 = 62,17 → 62. Bruno : B, B → 82. Le toucher suit l'ordre réglé : vide → A.
        await caseTn(page, 1, 1).click();
        await expect(caseTn(page, 1, 1)).toHaveText('A');
        await caseTn(page, 1, 2).focus(); await page.keyboard.press('c');
        await caseTn(page, 1, 3).focus(); await page.keyboard.press('z');
        await caseTn(page, 2, 1).focus(); await page.keyboard.press('b');
        await caseTn(page, 2, 2).focus(); await page.keyboard.press('b');
        await expect(noteTn(page, 1)).toHaveText('62');
        await expect(noteTn(page, 2)).toHaveText('82');
        expect((await copies(page)).map((c) => [c.niveauFinal, c.noteFinale]).sort()).toEqual([['A', 95], ['B', 82], ['B', 82], ['C', 61.5], ['Z', 30]]);
        // La règle « 2 meilleures » : Ada → (95 + 61,5) / 2 = 78,25 → 78.
        await reglerLesMeilleures(page, 2);
        await allerA(page, 'note');
        await expect(ecran(page, 'note').locator('.vs-note-valeur')).toHaveText(['78', '82', '–', '–']);
        expect(erreurs).toEqual([]);
    });

    test('une valeur changée laisse les résultats saisis tels quels et pose le signe ; ressaisir prend la valeur d\'aujourd\'hui', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await novice(page);   // Ada : E, M, D → 80
        const avant = await copies(page);
        await regler(page, 'niveaux');
        await rangee(page, 3).locator('.vs-n-valeur').fill('90');   // « M » : 75 → 90
        await enregistrerLeReglage(page, 'Niveaux enregistrés.');
        expect(await copies(page)).toEqual(avant);   // aucun résultat n'est réécrit
        await allerA(page, 'resultats');
        await expect(caseTn(page, 1, 2)).toHaveText('M');
        await expect(caseTn(page, 1, 2)).toHaveClass(/tn-case--valeur-changee/);   // le signe « ≠ »
        await expect(caseTn(page, 1, 1)).not.toHaveClass(/tn-case--valeur-changee/);
        await expect(noteTn(page, 1)).toHaveText('80');   // la valeur écrite à la saisie reste : (100 + 75 + 65) / 3
        await caseTn(page, 1, 2).focus();
        await page.keyboard.press('Backspace');
        await page.keyboard.press('m');   // ressaisi : M vaut 90
        await expect(caseTn(page, 1, 2)).not.toHaveClass(/tn-case--valeur-changee/);
        await expect(noteTn(page, 1)).toHaveText('85');   // (100 + 90 + 65) / 3
        expect(erreurs).toEqual([]);
    });

    test('retirer un niveau inscrit dans un résultat, ou changer sa lettre : refusé, la raison est dite, aucun résultat n\'est effacé', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await novice(page);
        const avant = await copies(page);
        const echelleAvant = await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('echellesTemplates'), [])));
        await regler(page, 'niveaux');
        await rangee(page, 3).locator('[data-param="retirer"]').click();   // « M », que porte un résultat d'Ada
        await expect(page.locator('#vs-reglage-retour .vs-erreur')).toHaveText('Le niveau « Maîtrise » est inscrit dans 1 résultat du tableau : il ne se retire pas. Aucun résultat n’a été effacé.');
        await expect(page.locator('.vs-niveau-rangee')).toHaveCount(5);
        await rangee(page, 3).locator('.vs-n-code').fill('B');   // sa lettre
        await page.locator('[data-action="VueSimple.enregistrerReglage"]').click();
        await expect(page.locator('#vs-reglage-retour .vs-erreur')).toHaveText('La lettre « M » est inscrite dans 1 résultat du tableau : elle ne se change pas. Aucun résultat n’a été effacé.');
        expect(await copies(page)).toEqual(avant);
        expect(await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('echellesTemplates'), [])))).toBe(echelleAvant);   // rien n'est écrit
        // Un niveau que rien ne porte (« PS ») se retire ; et il en faut au moins deux.
        await page.locator('[data-action="VueSimple.annulerReglage"]').click();
        await regler(page, 'niveaux');
        await rangee(page, 0).locator('[data-param="retirer"]').click();
        await expect(page.locator('.vs-niveau-rangee')).toHaveCount(4);
        await enregistrerLeReglage(page, 'Niveaux enregistrés.');
        expect(await copies(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    test('régler ses niveaux ne change aucun autre groupe ni aucune autre pratique : l\'échelle du trimestre est copiée, jamais modifiée', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await page.evaluate(() => {
            // security-ok: fixtures littérales du banc. Deux groupes, deux pratiques par standards, UNE échelle du trimestre lue par les deux.
            const T = 'avs2';
            const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 40 }, { code: 'M', nom: 'Maîtrise', min: 65, max: 100, valeurCalcul: 80 }];
            const pratique = (id) => ({ id, nom: 'Standards fictifs ' + id, type: 'standards', configuration: { type: 'standards', echelleId: 'E_COMMUNE', notesFinales: false, portfolio: { actif: true, utiliser: true, methodeSelection: 'tous', nombreARetenir: 3, minimumCompletion: 1 } } });
            window.db.setSync('backupNePlusRappeler', 'true');
            window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
            window.db.setSync('cours', [{ id: 'c-a', codeCours: 'FIC201', nomCours: 'Cours fictif A' }, { id: 'c-b', codeCours: 'FIC202', nomCours: 'Cours fictif B' }]);   // security-ok: fixture
            window.db.setSync(T + '_groupesCours', [{ id: 'GC_A', trimestreId: T, coursId: 'c-a', groupeNum: '01', pratiqueId: 'std-a' }, { id: 'GC_B', trimestreId: T, coursId: 'c-b', groupeNum: '02', pratiqueId: 'std-b' }]);
            window.db.setSync(T + '_groupeEtudiants', [{ da: '9990031', nom: 'Genêt', prenom: 'Gaël', groupe: '01', coursId: 'c-a' }, { da: '9990032', nom: 'Hêtre', prenom: 'Hélène', groupe: '02', coursId: 'c-b' }]);   // security-ok: fixture
            window.db.setSync(T + '_pratiquesConfigurables', [pratique('std-a'), pratique('std-b')]);   // security-ok: fixture
            window.db.setSync(T + '_echellesTemplates', [{ id: 'E_COMMUNE', nom: 'Échelle fictive', niveaux }]);   // security-ok: fixture
            window.db.setSync(T + '_productions', [{ id: 'PA1', titre: 'Production A', type: 'autre', numero: 1, coursId: 'c-a' }, { id: 'PB1', titre: 'Production B', type: 'autre', numero: 1, coursId: 'c-b' }]);   // security-ok: fixture
            window.db.setSync(T + '_evaluationsSauvegardees', [{ id: 'EB1', etudiantDA: '9990032', productionId: 'PB1', sansGrille: true, grilleId: null, criteres: [], niveauFinal: 'M', noteFinale: 80, echelleId: 'E_COMMUNE',
                verrouillee: true, statutRemise: 'evalue', statutIntegrite: 'recevable', coursId: 'c-b', groupeCoursId: 'GC_B' }]);
            window.db.setSync('trimestreActif', T);
            window.db.setSync('groupeCoursActif', { id: 'GC_A', trimestreId: T });
            window.db.setSync('infoCours', { id: 'c-a', codeCours: 'FIC201', groupe: '01', _groupeCoursId: 'GC_A' });   // security-ok: fixture
            window.localStorage.setItem('laboCodex.vue', 'simple');
        });
        await page.evaluate(() => window.db.flush());
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).toHaveClass(/vue-simple/);
        const lire = () => page.evaluate(() => ({
            commune: JSON.stringify(window.db.getSync('avs2_echellesTemplates', []).find((e) => e.id === 'E_COMMUNE')),
            b: JSON.stringify(window.db.getSync('avs2_pratiquesConfigurables', []).find((p) => p.id === 'std-b')),
            copieB: JSON.stringify(window.db.getSync('avs2_evaluationsSauvegardees', [])),
            echelleDeA: window.db.getSync('avs2_pratiquesConfigurables', []).find((p) => p.id === 'std-a').configuration.echelleId,
            // L'échelle de départ que l'application sème dans tout trimestre n'est pas en cause : on lit la commune et les copies.
            echelles: window.db.getSync('avs2_echellesTemplates', []).filter((e) => e.id === 'E_COMMUNE' || e.pratiqueId).map((e) => [e.id === 'E_COMMUNE' ? e.id : 'copie', e.nom, e.pratiqueId || null, e.niveaux.map((n) => n.code + n.valeurCalcul).join(' ')])
        }));
        const avant = await lire();
        await regler(page, 'niveaux');   // le groupe A
        await rangee(page, 1).locator('.vs-n-valeur').fill('95');   // « M » : 80 → 95
        await enregistrerLeReglage(page, 'Niveaux enregistrés.');
        const apres = await lire();
        expect(apres.commune).toBe(avant.commune);     // l'échelle du trimestre : intacte
        expect(apres.b).toBe(avant.b);                 // l'autre pratique : intacte
        expect(apres.copieB).toBe(avant.copieB);       // le résultat de l'autre groupe : intact
        expect(apres.echelleDeA).not.toBe('E_COMMUNE');
        expect(apres.echelles).toEqual([['E_COMMUNE', 'Échelle fictive', null, 'I40 M80'], ['copie', 'Mes niveaux', 'std-a', 'I40 M95']]);
        // L'autre groupe saisit toujours M = 80.
        await allerA(page, 'resultats');
        await ecran(page, 'resultats').locator('.vs-select').selectOption('GC_B');
        await expect(noteTn(page, 1)).toHaveText('80');
        await expect(page.locator('#vs-tableau-hote .tn-niveau', { hasText: 'M' })).toContainText('80');
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · B. par spécifications, les types et les paliers se règlent', () => {
    test('renommer un type, en ajouter un, ajouter un palier plancher : « + Production » liste les types de l\'utilisateur, la note suit', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'SPE-simple');
        await regler(page, 'types');
        await page.locator('.vs-type-nom').nth(0).fill('Travail long');
        await page.locator('[data-action="VueSimple.typeGeste"][data-param="ajouter"]').click();
        await page.locator('.vs-type-nom').nth(2).fill('Atelier');
        await enregistrerLeReglage(page, 'Types enregistrés.');
        await regler(page, 'paliers');
        await expect(page.locator('#vs-bloc-paliers thead th')).toHaveText(['Palier', 'Note', 'Travail long', 'Examen', 'Atelier', '']);
        await page.locator('[data-action="VueSimple.palierGeste"][data-param="ajouter"]').click();
        await page.locator('.vs-palier-rangee').nth(2).locator('.vs-palier-nom').fill('Sous la réussite');
        await page.locator('.vs-palier-rangee').nth(2).locator('.vs-palier-note').fill('45');
        await page.locator('.vs-palier-rangee').nth(0).locator('.vs-palier-nombre[data-type="3"]').fill('1');   // Excellence demande aussi un atelier
        await enregistrerLeReglage(page, 'Paliers enregistrés.');
        await expect(page.locator('#vs-bloc-paliers .vs-paliers-lus li')).toHaveText([/Excellence 90 · Travail long : 2, Examen : 1, Atelier : 1/, /Réussite 70 · Travail long : 1, Examen : 1/, /Sous la réussite 45 · aucune exigence/]);
        await allerA(page, 'resultats');
        await ecran(page, 'resultats').locator('[data-action="VueSimple.ouvrirProduction"]').first().click();
        await expect(page.locator('#vs-production-type option')).toHaveText(['Travail long', 'Examen', 'Atelier']);
        await page.locator('[data-action="VueSimple.fermerProduction"]').click();
        await ajouterProduction(page, 'Travail fictif', '2026-11-02', 'Travail long');
        await ajouterProduction(page, 'Examen fictif', '2026-11-09', 'Examen');
        await ajouterProduction(page, 'Atelier fictif', '2026-11-16', 'Atelier');
        // Ada : travail et examen acceptables → Réussite (70). Bruno : travail non acceptable → plancher (45).
        await caseTn(page, 1, 1).focus(); await page.keyboard.press('a');
        await caseTn(page, 1, 2).focus(); await page.keyboard.press('a');
        await caseTn(page, 2, 1).focus(); await page.keyboard.press('n');
        await expect(noteTn(page, 1)).toHaveText('70');
        await expect(noteTn(page, 2)).toHaveText('45');
        expect(erreurs).toEqual([]);
    });

    test('retirer un type porté par une production : refusé, la raison est dite, rien n\'est touché ; un type libre se retire, un au minimum', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        await choisirLeModele(page, 'SPE-simple');
        await allerA(page, 'resultats');
        await ajouterProduction(page, 'Projet fictif', '2026-11-02', 'Projet');
        const avant = await page.evaluate(() => JSON.stringify([window.db.getSync(window.cle('productions'), []), window.db.getSync(window.cle('pratiquesConfigurables'), [])]));
        await regler(page, 'types');
        await page.locator('[data-action="VueSimple.typeGeste"][data-param="retirer"]').nth(0).click();   // « Projet »
        await expect(page.locator('#vs-reglage-retour .vs-erreur')).toHaveText('1 production de ton tableau est du type « Projet » : il ne se retire pas. Aucune production n’a été touchée.');
        await expect(page.locator('.vs-type-nom')).toHaveCount(2);
        expect(await page.evaluate(() => JSON.stringify([window.db.getSync(window.cle('productions'), []), window.db.getSync(window.cle('pratiquesConfigurables'), [])]))).toBe(avant);
        await page.locator('[data-action="VueSimple.typeGeste"][data-param="retirer"]').nth(1).click();   // « Examen », libre
        await expect(page.locator('.vs-type-nom')).toHaveCount(1);
        await page.locator('[data-action="VueSimple.typeGeste"][data-param="retirer"]').nth(0).click();
        await expect(page.locator('#vs-reglage-retour .vs-erreur')).toHaveText('Il faut au moins un type.');
        await enregistrerLeReglage(page, 'Types enregistrés.');
        await expect(page.locator('#vs-bloc-paliers .vs-paliers-lus li')).toHaveText([/Excellence 90 · Projet : 2/, /Réussite 70 · Projet : 1/]);   // les exigences du type retiré partent avec lui
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · la vue voyage avec le fichier', () => {
    test('un fichier enregistré depuis la vue simple porte la marque ; ouvert sur un appareil sans choix, il s\'ouvre en vue simple ; le choix de l\'appareil prime', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await collerLaClasse(page);
        const avant = await empreinte(page);
        // Le fichier, tel que « Enregistrer dans un fichier » le prépare.
        const marques = await page.evaluate(async () => {
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
            const lireMarque = async () => { const r = await window.Codex.generer({}); const zip = await window.JSZip.loadAsync(r.blob); return JSON.parse(await zip.file('donnees.json').async('string')).vueDuFichier; };
            const simple = await lireMarque();
            window.__fichier = (await window.Codex.generer({})).blob;
            return { simple, dansLesDonnees: window.db.getSync('vueDuFichier', 'absente') };
        });
        expect(marques).toEqual({ simple: 'simple', dansLesDonnees: 'absente' });   // la marque est dans le fichier, pas dans les données de l'appareil
        expect(differences(avant, await empreinte(page))).toEqual([]);            // préparer le fichier n'écrit rien non plus
        // Un appareil qui n'a fait aucun choix ouvre ce fichier.
        await page.evaluate(async () => {
            window.localStorage.removeItem('laboCodex.vue');
            await window.Codex.charger(new File([window.__fichier], 'fichier-fictif.zip', { type: 'application/zip' }));
            await window.db.flush();
        });
        expect(await page.evaluate(() => window.localStorage.getItem('laboCodex.vue'))).toBeNull();
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).toHaveClass(/vue-simple/);
        await expect(ecran(page, 'accueil').locator('.vs-etape-etat').first()).toHaveText('4 étudiant·es');
        // Le choix fait sur l'appareil prime : la vue étendue choisie reste, malgré la marque.
        await basculer(page, 'etendue');
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).not.toHaveClass(/vue-simple/);
        // Enregistré depuis la vue étendue, le fichier porte l'autre marque.
        expect(await page.evaluate(async () => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => true; const r = await window.Codex.generer({}); const zip = await window.JSZip.loadAsync(r.blob); return JSON.parse(await zip.file('donnees.json').async('string')).vueDuFichier; })).toBe('etendue');
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · la bascule n\'écrit rien', () => {
    test('application vide : aller-retour, même compte et même empreinte ; seul le choix de la vue change, hors des données', async ({ page }) => {
        const erreurs = await ouvrir(page);
        const avant = await empreinte(page);
        await basculer(page, 'etendue');
        await page.evaluate(() => window.naviguerVers('calendrier', 'trimestre'));
        await basculer(page, 'simple');
        const apres = await empreinte(page);
        expect(differences(avant, apres)).toEqual([]);
        expect(apres.compte).toBe(avant.compte);
        expect(await page.evaluate((c) => window.localStorage.getItem(c), CLE_CHOIX)).toBe('simple');
        expect(await page.evaluate(async (c) => (await window.db.keys()).includes(c), CLE_CHOIX)).toBe(false);   // le choix n'est pas dans `db` : il ne voyage pas avec le codex
        expect(erreurs).toEqual([]);
    });

    test('avec la classe, la pratique et des résultats : deux aller-retour, rien ne bouge', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await novice(page);
        // Le recalcul différé des indices (1,2 s après la dernière saisie) est une écriture du tableau, pas de la bascule :
        // on attend que l'empreinte ne bouge plus d'une mesure à la suivante (1,5 s d'écart).
        let precedente = null;
        await expect.poll(async () => {
            const mesure = JSON.stringify(await empreinte(page));
            const stable = mesure === precedente;
            precedente = mesure;
            return stable;
        }, { intervals: [1500], timeout: 20000 }).toBe(true);
        const avant = await empreinte(page);
        for (let i = 0; i < 2; i++) {
            await basculer(page, 'etendue');
            await basculer(page, 'simple');
            await allerA(page, 'resultats');
            await allerA(page, 'note');
        }
        const apres = await empreinte(page);
        expect(differences(avant, apres)).toEqual([]);
        expect(apres.compte).toBe(avant.compte);
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · elle ne nomme rien qui n\'existe pas', () => {
    test('novice : aucun écran atteignable ne porte un mot de la liste (« codex » dans la seule phrase qui l\'introduit)', async ({ page }) => {
        test.setTimeout(120000);
        const erreurs = await ouvrir(page);
        // Application vide : les cinq écrans, le menu, « Sauvegarder ».
        for (const nom of ['accueil', 'classe', 'pratique', 'resultats', 'note']) {
            await allerA(page, nom);
            await aucunMotInterdit(page, `vide › ${nom}`);
        }
        await page.locator('#entete-menu-bouton').click();
        await aucunMotInterdit(page, 'vide › menu');
        await page.keyboard.press('Escape');
        await page.locator('#btn-codex').click();
        await aucunMotInterdit(page, 'vide › Sauvegarder');
        await page.locator('#btn-codex').click();
        await allerA(page, 'accueil');
        // Une liste refusée, puis la classe.
        await ecran(page, 'accueil').locator('[data-param="classe"]').click();
        await page.fill('#vs-liste', '123, Trop, Court');
        await ecran(page, 'classe').locator('[data-action="VueSimple.creerClasse"]').click();
        await aucunMotInterdit(page, 'classe › liste refusée');
        await allerA(page, 'accueil');
        await collerLaClasse(page);
        await aucunMotInterdit(page, 'classe créée');
        for (const nom of ['pratique', 'resultats', 'note', 'accueil']) {
            await allerA(page, nom);
            await aucunMotInterdit(page, `classe sans pratique › ${nom}`);
        }
        // Le modèle, la règle, le tableau sans colonne, le formulaire, le tableau rempli.
        await choisirLeModele(page, 'STD-n-meilleurs');
        await aucunMotInterdit(page, 'pratique choisie');
        await allerA(page, 'resultats');
        await aucunMotInterdit(page, 'tableau sans colonne');
        await allerA(page, 'note');
        await aucunMotInterdit(page, 'note sans production');
        await allerA(page, 'resultats');
        await page.locator('#vs-tableau-hote .tn-etat-geste button').click();
        await aucunMotInterdit(page, 'formulaire de production');
        await page.locator('[data-action="VueSimple.ajouterProduction"]').click();
        await aucunMotInterdit(page, 'production sans nom');
        await page.locator('[data-action="VueSimple.fermerProduction"]').click();
        await ajouterProduction(page, 'Production 1', '2026-11-02');
        await aucunMotInterdit(page, 'tableau, une colonne');
        await caseTn(page, 1, 1).focus();
        await page.keyboard.press('m');
        await aucunMotInterdit(page, 'tableau, un résultat');
        await expect(page.locator('#vs-tableau-hote .tn-avis')).toHaveCount(0);
        await expect(page.locator('#vs-tableau-hote .tn-legende-item')).toHaveText(['Plein : compte dans la note', 'Contour : évaluée, non retenue', 'Pointillé : à saisir']);
        for (const nom of ['note', 'pratique', 'classe', 'accueil']) {
            await allerA(page, nom);
            await aucunMotInterdit(page, `novice › ${nom}`);
        }
        await page.locator('#btn-codex').click();
        await aucunMotInterdit(page, 'novice › Sauvegarder');
        // Le geste d'enregistrement : « codex » y est toléré (l'aperçu, nommé plus haut) ; les autres mots, non.
        await page.locator('.codex-menu-item--simple[data-action="Codex.actionEnregistrer"]').click();
        await expect(page.locator('.modal-js-overlay')).toContainText('Mettre à jour le codex');
        await aucunMotInterdit(page, 'novice › aperçu de l\'enregistrement');
        await page.locator('.modal-js-overlay button', { hasText: 'Annuler' }).click();
        // Les réglages, ouverts un à un, et un refus.
        for (const quoi of ['regle', 'niveaux']) {
            await regler(page, quoi);
            await aucunMotInterdit(page, `novice › réglage ${quoi}`);
            await page.locator('[data-action="VueSimple.annulerReglage"]').click();
        }
        await regler(page, 'niveaux');
        await page.locator('[data-action="VueSimple.niveauGeste"][data-param="retirer"]').nth(3).click();   // « M », inscrit dans un résultat
        await aucunMotInterdit(page, 'novice › retrait refusé');
        expect(erreurs).toEqual([]);
    });

    test('la légende du point et la phrase sur les critères : absentes sans grille, présentes avec une grille', async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await ouvrir(page);
        await novice(page);
        const legende = page.locator('#vs-tableau-hote .tn-legende-item');
        const avis = page.locator('#vs-tableau-hote .tn-avis');
        // Sans grille (la grille de départ que l'application sème ne compte pas) : ni l'une ni l'autre.
        await page.evaluate(async () => { if (typeof window.assurerGrilleDeDepart === 'function') await window.assurerGrilleDeDepart(); });
        await allerA(page, 'resultats');
        await expect(avis).toHaveCount(0);
        await expect(legende.filter({ hasText: 'Point : évaluée avec une grille' })).toHaveCount(0);
        // Une grille dans les données, aucune case évaluée avec elle : la phrase sur les critères paraît ; la légende du point, pas encore.
        await page.evaluate(async () => {   // security-ok: fixture fictive du banc
            await window.db.modifier(window.cle('grillesTemplates'), (lues) => (lues || []).concat([{ id: 'G_X', nom: 'Grille fictive', type: 'holistique', dansBibliotheque: true,
                criteres: [{ id: 'c', nom: 'Critère fictif', ponderation: 100, type: 'holistique' }] }]), []);
        });
        await allerA(page, 'accueil');
        await allerA(page, 'resultats');
        await expect(avis).toHaveText('Un résultat saisi ici compte dans la note, mais il n’a pas de critères : il ne donne ni forces, ni défis, ni rétroaction par critère.');
        await expect(legende.filter({ hasText: 'Point : évaluée avec une grille' })).toHaveCount(0);
        // Une copie évaluée avec la grille (Chloé, Production 2) : la légende du point paraît ; la case se lit et ne se modifie pas.
        await page.evaluate(async () => {   // security-ok: fixture fictive du banc
            const gc = window.db.getSync('groupeCoursActif', null);
            const p2 = window.db.getSync(window.cle('productions'), []).find((p) => p.titre === 'Production 2');
            await window.db.modifier(window.cle('evaluationsSauvegardees'), (lues) => (lues || []).concat([{ id: 'EG1', etudiantDA: '9990003', productionId: p2.id, grilleId: 'G_X', grilleNom: 'Grille fictive',
                echelleId: 'ECHELLE_IDME_DEPART', noteFinale: 75, niveauFinal: 'M', verrouillee: true, statutRemise: 'evalue', statutIntegrite: 'recevable',
                criteres: [{ critereId: 'c', critereNom: 'Critère fictif', niveauSelectionne: 'M', ponderation: 100 }], dateEvaluation: '2026-11-09T12:00:00.000Z', coursId: p2.coursId, groupeCoursId: gc.id }]), []);
        });
        await allerA(page, 'accueil');
        await allerA(page, 'resultats');
        await expect(legende).toHaveText(['Plein : compte dans la note', 'Contour : évaluée, non retenue', 'Pointillé : à saisir', 'Point : évaluée avec une grille']);
        await expect(avis).toBeVisible();
        await expect(caseTn(page, 3, 2)).toHaveClass(/tn-case--grille/);
        await expect(caseTn(page, 3, 2)).toHaveText('M');
        await caseTn(page, 3, 2).click();   // en vue simple, la copie se lit ; elle ne s'ouvre pas dans l'éditeur de la vue étendue
        await expect(page.locator('#section-simple-resultats')).toBeVisible();
        expect(await page.evaluate(() => window.db.getSync(window.cle('evaluationsSauvegardees'), []).find((e) => e.id === 'EG1').niveauFinal)).toBe('M');
        expect(erreurs).toEqual([]);
    });

    test('aucun parcours ne se lance ni ne se propose ; le menu ne porte que « Vue étendue »', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await page.locator('#entete-menu-bouton').click();
        await expect(page.locator('#entete-menu-panneau > :visible')).toHaveCount(1);
        await expect(page.locator('#entete-menu-panneau > :visible')).toHaveText(/^\s*Vue étendue\s*Toutes les fonctions\s*$/);
        await expect(page.locator('#btn-assistance-menu')).toBeHidden();
        await page.keyboard.press('Escape');
        // La préférence d'accompagnement est ALLUMÉE (elle l'est chez qui a suivi une visite) : en vue simple, elle ne répond pas.
        await page.evaluate(() => window.accompagnement.definirActif(true));
        expect(await page.evaluate(() => window.accompagnement.estActif())).toBe(false);
        await collerLaClasse(page);
        for (const nom of ['pratique', 'resultats', 'note', 'accueil']) await allerA(page, nom);
        const propose = await page.evaluate(() => [...document.querySelectorAll('body [class*="parcours-"], body [id*="assistance"], body [class*="tour-"], body [class*="fleche-didactique"], body [class*="primo-aide"], body .btn-aide-contextuelle')]
            .filter((n) => (n.checkVisibility ? n.checkVisibility() : n.offsetParent !== null)).map((n) => n.id || n.className));
        expect(propose).toEqual([]);
        // En vue étendue, le menu habituel, puis sous un filet, « Vue simple » ; l'Assistance y est toujours.
        await basculer(page, 'etendue');
        await page.locator('#entete-menu-bouton').click();
        await expect(page.locator('#entete-menu-panneau > button:visible .entete-menu-mot')).toHaveText([/Assistance/, /Aide/, /Signaler/, /Soutenir/, /Réglages/, /Vue simple\s*Ta notation seulement/]);
        await expect(page.locator('#entete-menu-panneau .entete-menu-filet')).toBeVisible();
        expect(await page.evaluate(() => window.accompagnement.estActif())).toBe(true);
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · le passage vers la vue étendue', () => {
    test('après le parcours, chaque section de la vue étendue s\'ouvre sans erreur en console, et aucune ne reste muette', async ({ page }) => {
        test.setTimeout(180000);
        const erreurs = await ouvrir(page);
        await novice(page);
        await basculer(page, 'etendue');
        // « Ton espace de travail est prêt : […] horaire et pratique sont configurés » ne se dit pas d'un groupe sans horaire.
        await page.evaluate(() => window.naviguerVers('evaluations', 'liste'));
        await expect(page.locator('#evaluations-liste')).toContainText('Production 1');
        // Le bandeau vient 500 ms après l'affichage (transitions.js) : on le fait évaluer maintenant, sans attendre un délai.
        await page.evaluate(() => window.transitions.evaluerTransitions());
        expect(await page.evaluate(() => { const n = document.getElementById('transition-bandeau'); return n ? n.innerText : ''; })).not.toMatch(/horaire/i);
        const sections = await page.evaluate(() => Object.entries(configurationsOnglets).map(([s, items]) => [s, items.map((i) => i.id)]));
        expect(sections.map((s) => s[0])).toEqual(['accueil', 'conception', 'calendrier', 'suivi', 'evaluations', 'labo', 'aide', 'reglages']);
        const muettes = [];
        for (const [section, items] of sections) {
            for (const item of (items.length ? items : [null])) {
                const id = item ? `${section}-${item}` : `section-${section}`;
                // Le profil se recharge 100 ms après son affichage et reprend la main (comportement d'avant le lot) : on
                // redemande la section jusqu'à ce qu'elle tienne à l'écran.
                await expect(async () => {
                    await page.evaluate(([s, i]) => { if (i) window.naviguerVers(s, i); else window.afficherSection(s); }, [section, item]);
                    await expect(page.locator('#' + id)).toBeVisible({ timeout: 800 });
                }).toPass({ timeout: 10000 });
                // Les initialisateurs de navigation.js partent à 100 ou 150 ms : la section a jusqu'à 3 s pour dire quelque chose.
                const parle = await page.waitForFunction((i) => document.getElementById(i).innerText.replace(/\s+/g, ' ').trim().length >= 60, id, { timeout: 3000 }).then(() => true, () => false);
                if (!parle) muettes.push(id);
            }
        }
        expect(muettes).toEqual([]);
        // Celles à qui il manque une information disent laquelle et où la donner.
        await page.evaluate(() => window.naviguerVers('calendrier', 'vue'));
        await expect(page.locator('#conteneur-calendrier')).toContainText('ce trimestre n\'en a pas encore. Tu peux les donner dans Cadre › Trimestre.');
        await page.evaluate(() => window.naviguerVers('suivi', 'groupe'));
        await expect(page.locator('#suivi-groupe')).toContainText('Assiduité non calculée : ce groupe n\'a pas d\'horaire. Tu peux le donner dans Cadre › Trimestre › Horaire.');
        await page.evaluate(() => window.naviguerVers('suivi', 'saisie'));
        await expect(page.locator('#suivi-saisie')).toContainText('Configurer l\'horaire dans Cadre › Trimestre');
        // La pratique née en vue simple s'ouvre dans Conception › Pratiques.
        await page.evaluate(() => window.naviguerVers('conception', 'pratiques-notation'));
        await expect(page.locator('#selectionPratiques')).toContainText('Par standards (active)');
        expect(erreurs).toEqual([]);
    });
});

test.describe('Vue simple · quelqu\'un qui a déjà des données', () => {
    // Semé : un trimestre, deux groupes par standards et par spécifications, un groupe en sommative.
    function semer() {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const T = 'avs';
        const niveaux = [{ code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 40, couleur: 'var(--niveau-attention-critique)' }, { code: 'M', nom: 'Maîtrise', min: 65, max: 100, valeurCalcul: 80, couleur: 'var(--niveau-attention-minimal)' }];
        const pratiques = [
            { id: 'std-vs', nom: 'Standards fictifs', type: 'standards', configuration: { type: 'standards', echelleId: 'E_VS', notesFinales: false, portfolio: { actif: true, utiliser: true, methodeSelection: 'tous', nombreARetenir: 3, minimumCompletion: 1 } } },
            { id: 'som-vs', nom: 'Sommative fictive', type: 'sommative', configuration: { type: 'sommative' } }
        ];
        window.db.setSync('backupNePlusRappeler', 'true');
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: 'c-std', codeCours: 'FIC101', nomCours: 'Cours fictif A' }, { id: 'c-som', codeCours: 'FIC102', nomCours: 'Cours fictif B' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD', trimestreId: T, coursId: 'c-std', groupeNum: '01', pratiqueId: 'std-vs' }, { id: 'GC_SOM', trimestreId: T, coursId: 'c-som', groupeNum: '02', pratiqueId: 'som-vs' }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: '9990021', nom: 'Érable', prenom: 'Élie', groupe: '01', coursId: 'c-std' }, { da: '9990022', nom: 'Fougère', prenom: 'Flore', groupe: '02', coursId: 'c-som' }]);
        window.db.setSync(T + '_pratiquesConfigurables', pratiques);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E_VS', nom: 'Échelle fictive', niveaux }]);
        window.db.setSync(T + '_productions', [{ id: 'PV1', titre: 'Production fictive', type: 'autre', numero: 1, dateEcheance: '2026-10-01', coursId: 'c-std' }]);
        window.db.setSync(T + '_evaluationsSauvegardees', []);
        window.db.setSync('trimestreActif', T);
        window.db.setSync('groupeCoursActif', { id: 'GC_STD', trimestreId: T });
        window.db.setSync('infoCours', { id: 'c-std', codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC_STD' });
    }

    test('au démarrage, la vue étendue ; en vue simple, ses groupes par standards, et un mot pour les autres', async ({ page }) => {
        const erreurs = await ouvrir(page);
        await page.evaluate(semer);
        await page.evaluate(() => window.db.flush());
        await page.reload();
        await attendreApplication(page);
        await expect(page.locator('body')).not.toHaveClass(/vue-simple/);   // l'application porte des données : étendue
        await expect(page.locator('#section-accueil')).toBeVisible();
        await basculer(page, 'simple');
        await allerA(page, 'resultats');
        await expect(ecran(page, 'resultats').locator('.vs-select option')).toHaveText(['Cours fictif A · groupe 01', 'Cours fictif B · groupe 02 (autre pratique)']);
        await expect(ecran(page, 'resultats').locator('.vs-note')).toHaveText('Un groupe dont la pratique n’est ni par standards ni par spécifications se suit en vue étendue.');
        await expect(page.locator('#vs-tableau-hote .tn-production-titre')).toHaveText(['Production fictive']);
        await ecran(page, 'resultats').locator('.vs-select').selectOption('GC_SOM');
        await expect(page.locator('#vs-tableau-hote .tn-etat-vide')).toHaveText('Le tableau sert aux pratiques par standards et par spécifications. La pratique de ce groupe se suit en vue étendue.');
        await allerA(page, 'note');
        await expect(ecran(page, 'note').locator('.vs-select')).toHaveValue('GC_SOM');
        await ecran(page, 'note').locator('.vs-select').selectOption('GC_STD');
        await expect(ecran(page, 'note').locator('.vs-notes tbody tr')).toHaveCount(1);
        await allerA(page, 'pratique');
        await expect(page.locator('#vs-bloc-regle .vs-valeur')).toHaveText('La note retient toutes les productions évaluées.');
        expect(erreurs).toEqual([]);
    });
});
