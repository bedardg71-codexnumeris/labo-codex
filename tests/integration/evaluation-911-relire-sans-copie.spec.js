import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #911 (17 septembre 2026) — RELIRE UNE ÉVALUATION D'UN TRIMESTRE SANS AUCUNE COPIE.
//
// Rapport de Grégoire, 17 sept. 2026, 13 h 49 (1.142.28) : aucune des 303 évaluations d'Automne 2025 ne
// s'ouvre depuis la Liste des évaluations — « Timeout : les critères de la grille ne sont pas rendus », et la
// console dit `Contenu listeCriteresGrille1: undefined` : le conteneur est ABSENT du DOM, pas vide.
//
// Deux scénarios, parce que la cause n'était pas mesurée :
//   S1 · page fraîche, trimestre sans copie → « Consulter » depuis la liste ;
//   S2 · une copie évaluée dans un trimestre (les panneaux du formulaire sont alors DANS les palettes de la
//        visionneuse), puis bascule vers un trimestre sans copie, SANS recharger → « Consulter » depuis la liste.
//
// LA COPIE DE BANC : WebKit refuse un Blob dans IndexedDB en contexte éphémère ; `recupererBlob` est enveloppé
// (PNG d'un pixel), comme au banc #868. Aucun `page.click` : `el.click()` et `change` sur le vrai <select>.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const TA = 't911a';   // trimestre courant, avec une copie
const TB = 't911b';   // trimestre d'origine : des évaluations, aucune copie

async function monter(page, { actif, archive = false, sansCritere = false }) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.modifierEvaluationParId === 'function' && typeof window.db !== 'undefined'
        && window.travauxUI && window.travauxStockage && typeof window.evaluerProduction === 'function'
        && typeof window.changerTrimestreActifV2 === 'function');
    await page.evaluate(({ png, TA, TB, actif, archive, sansCritere }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-911';
        const grille = { id: 'G911', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] };
        const echelle = { id: 'E911', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        window.db.setSync('trimestres', [
            { id: TA, nom: 'Trimestre courant', annee: 2026, session: 'A', actif: actif === TA },
            { id: TB, nom: 'Trimestre sans copie', annee: 2025, session: 'A', actif: actif === TB, archive }
        ]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        [[TA, 'GC_911A', 'TEST911A', 'pA'], [TB, 'GC_911B', 'TEST911B', 'pB']].forEach(([t, gc, da, prod]) => {
            window.db.setSync(t + '_groupesCours', [{ id: gc, trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
            window.db.setSync(t + '_groupeEtudiants', [{ da, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: gc }]);
            window.db.setSync(t + '_productions', [{ id: prod, titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G911', echelleId: 'E911', groupeCoursId: gc }]);
            window.db.setSync(t + '_grillesTemplates', [grille]);
            window.db.setSync(t + '_echellesTemplates', [echelle]);
        });
        // TA : une copie importée. TB : AUCUN fichier, une évaluation enregistrée avec critères et niveaux.
        window.db.setSync(TA + '_fichiersTravaux', [{
            id: 'FT911', etudiantDA: 'TEST911A', productionId: 'pA', coursId, groupeCoursId: 'GC_911A',
            nomFichier: 'GAGNON_TEST911A_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.db.setSync(TB + '_evaluationsSauvegardees', [{
            id: 'EVAL911', etudiantDA: 'TEST911B', productionId: 'pB', grilleId: 'G911', echelleId: 'E911', cartoucheId: '',
            groupeCoursId: 'GC_911B', coursId, statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres: sansCritere ? [] : [{ critereId: 'c1', niveauSelectionne: 'M' }, { critereId: 'c2', niveauSelectionne: 'D' }],
            noteFinale: 74, retroactionFinale: 'Rétroaction témoin.', dateEvaluation: '2025-10-20T12:00:00.000Z', verrouillee: false
        }]);
        const gcActif = actif === TA ? 'GC_911A' : 'GC_911B';
        window.trimestreActif = actif;
        window.db.setSync('trimestreActif', actif);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: gcActif });
        window.db.setSync('groupeCoursActif', { id: gcActif, trimestreId: actif });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT911' ? copie : original.apply(this, arguments); };

        window._notif911 = [];
        const n = window.notifications;
        ['succes', 'erreur'].forEach((type) => {
            const orig = n[type];
            n[type] = function (titre) { window._notif911.push(`${type}: ${titre}`); return orig.apply(this, arguments); };
        });
    }, { png: PNG, TA, TB, actif, archive, sansCritere });
    return erreurs;
}

/** Le geste de Grégoire : Évaluation › Liste des évaluations › menu « Actions… » › Consulter. */
async function consulterDepuisLaListe(page) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    const selecteur = '.eval-actions-select option[value="consulter|EVAL911"]';
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate((s) => {
        window._notif911.length = 0;   // la bascule de trimestre en a émis (« Cours changé ») : on juge le chargement seul
        const menu = document.querySelector(s).closest('select');
        menu.value = 'consulter|EVAL911';
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    }, selecteur);
    // Les deux issues du chargement se disent par une notification (succès aux étapes 13-14, erreur au `catch`).
    await page.waitForFunction(() => window._notif911.some((n) => /Évaluation chargée|Erreur de chargement/.test(n)), null, { timeout: 10000 });
    return lireFormulaire(page);
}

function lireFormulaire(page) {
    return page.evaluate(() => {
        const vis = (el) => !!el && el.offsetParent !== null;
        return {
            conteneurPresent: !!document.getElementById('listeCriteresGrille1'),
            panneaux: ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'].map((id) => !!document.getElementById(id)),
            grilleVisible: vis(document.getElementById('listeCriteresGrille1')),
            niveauC1: (document.getElementById('eval_c1') || {}).value || null,
            niveauC2: (document.getElementById('eval_c2') || {}).value || null,
            retroaction: (document.getElementById('retroactionFinale1') || {}).value || null,
            notifications: window._notif911
        };
    });
}

const OUVERTE = {
    conteneurPresent: true, panneaux: [true, true, true], grilleVisible: true,
    niveauC1: 'M', niveauC2: 'D', retroaction: 'Rétroaction témoin.',
    notifications: ['succes: Évaluation chargée - Tu peux maintenant la modifier']
};

test('Porte #911 · S1 · page fraîche, trimestre sans copie : « Consulter » depuis la liste rend la grille et restaure les niveaux', async ({ page }) => {
    const erreurs = await monter(page, { actif: TB });
    expect(await consulterDepuisLaListe(page)).toEqual(OUVERTE);
    expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
});

/** Une copie évaluée dans le trimestre courant, puis bascule vers le trimestre sans copie — SANS recharger la page. */
async function evaluerUneCopiePuisBasculer(page) {
    // 1. Une copie ouverte en mode Évaluer : les trois panneaux du formulaire sont DANS les palettes de la visionneuse.
    await page.evaluate(() => window.evaluerProduction('TEST911A', 'pA'));
    await page.waitForFunction(() => {
        const fa = window.travauxVisionneuse.getFichierActuel();
        return fa && fa.id === 'FT911' && window.travauxUI.getModeCourant() === 'evaluer' && !!document.getElementById('travaux-palette-eval-retro');
    }, null, { timeout: 10000 });
    expect(await page.evaluate(() => !!document.querySelector('#evaluations-contenu-fichiers #listeCriteresGrille1'))).toBe(true);

    // 2. Cadre › trimestre actif : on bascule vers le trimestre sans copie.
    await page.evaluate((tb) => {
        window.afficherSection('cadre');
        window.changerTrimestreActifV2(tb);
        window.db.setSync('infoCours', { id: 'cours-911', codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_911B' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_911B', trimestreId: tb });
    }, TB);

    // 3. Évaluation › Annoter et évaluer (le trajet du rapport) : « Aucun fichier importé ».
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-annoter'); });
    await page.waitForFunction(() => /Aucun fichier importé/.test((document.getElementById('evaluations-contenu-fichiers') || {}).textContent || ''), null, { timeout: 10000 });
    // Les palettes sont parties avec la visionneuse : le mode ne peut pas rester « evaluer » (sinon le
    // prochain `basculerMode('evaluer')` ne fait rien — état résiduel, bug #73).
    expect(await page.evaluate(() => window.travauxUI.getModeCourant())).toBe('annoter');
}

test('Porte #911 · S2 · une copie évaluée, puis bascule vers un trimestre sans copie : « Consulter » depuis la liste rend la grille', async ({ page }) => {
    const erreurs = await monter(page, { actif: TA });
    await evaluerUneCopiePuisBasculer(page);
    // AVANT la garde : conteneurPresent false, panneaux [false, false, false], « erreur: Erreur de chargement ».
    expect(await consulterDepuisLaListe(page)).toEqual(OUVERTE);
    expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
});

test('Porte #911 · S3 · le même trajet vers un trimestre ARCHIVÉ : la grille se rend, et rien n\'est écrit dans ses évaluations', async ({ page }) => {
    const erreurs = await monter(page, { actif: TA, archive: true });
    const avant = await page.evaluate((tb) => JSON.stringify(window.db.getSync(tb + '_evaluationsSauvegardees', [])), TB);
    await evaluerUneCopiePuisBasculer(page);
    expect(await page.evaluate(() => document.body.classList.contains('mode-archive'))).toBe(true);
    const etat = await consulterDepuisLaListe(page);
    expect({ ...etat, notifications: null }).toEqual({ ...OUVERTE, notifications: null });
    // L'auto-save attend 1,5 s après un `change` : on laisse passer ce délai avant de relire la base.
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2500)));
    const apres = await page.evaluate((tb) => JSON.stringify(window.db.getSync(tb + '_evaluationsSauvegardees', [])), TB);
    expect(apres).toBe(avant);
    expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
});

test('Porte #911 · S4 · le même trajet, « Consulter » depuis le PROFIL de l\'élève', async ({ page }) => {
    const erreurs = await monter(page, { actif: TA });
    await evaluerUneCopiePuisBasculer(page);
    await page.evaluate(() => { window.afficherSection('suivi'); window.afficherProfilComplet('TEST911B'); });
    await page.waitForFunction(() => window.profilActuelDA === 'TEST911B' && !window._profilAutoChargement
        && !!document.querySelector('#contenuProfilEtudiant .rangee-selection-profil'), null, { timeout: 10000 });
    await page.evaluate(() => window.changerSectionProfil('productions'));
    const selecteur = '#suivi-profil [data-action="consulterEvaluation"][data-param2="pB"]';
    await page.waitForFunction((s) => !!document.querySelector(s), selecteur, { timeout: 10000 });
    await page.evaluate((s) => { window._notif911.length = 0; document.querySelector(s).click(); }, selecteur);
    await page.waitForFunction(() => window._notif911.some((n) => /Évaluation chargée|Erreur de chargement/.test(n)), null, { timeout: 10000 });
    expect(await lireFormulaire(page)).toEqual(OUVERTE);
    expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
});

test('Porte #911 · S5 · une évaluation SANS critère enregistré : elle s\'ouvre sur la grille, aucun niveau à restaurer', async ({ page }) => {
    // Sept des 303 évaluations d'Automne 2025 sont dans ce cas (sonde de Cowork, 17 sept.). L'attente rend
    // `false` sans critère : pas de rejet, pas de restauration. On le FIGE, on ne le répare pas ici.
    const erreurs = await monter(page, { actif: TB, sansCritere: true });
    expect(await consulterDepuisLaListe(page)).toEqual({ ...OUVERTE, niveauC1: null, niveauC2: null });
    expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
});

test('Porte #911 · S6 · trimestre archivé : le formulaire de rapport de bogue reste saisissable, les champs du trimestre non', async ({ page }) => {
    // Rapport du 17 sept. : huit clics sur `#sectionFormulaireBug`, rapport parti SANS description. La cause n'était
    // pas l'alerte d'erreur : le mode lecture seule pose `pointer-events: none` sur tout <textarea>, et le clic
    // tombait sur la <div> parente. On lit le style calculé, et l'élément que le navigateur donne au point cliqué.
    await monter(page, { actif: TB, archive: true });
    await page.evaluate((tb) => { window.changerTrimestreActifV2(tb); window.ouvrirModalRapportBug(); }, TB);
    await page.waitForFunction(() => !!document.getElementById('descriptionBug'), null, { timeout: 10000 });
    const etat = await page.evaluate(() => {
        const cible = (id) => {
            const el = document.getElementById(id);
            el.scrollIntoView({ block: 'center' });
            const r = el.getBoundingClientRect();
            const auPoint = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return { pointerEvents: getComputedStyle(el).pointerEvents, auPoint: auPoint && auPoint.id };
        };
        return {
            archive: document.body.classList.contains('mode-archive'),
            description: cible('descriptionBug'),
            prenom: cible('prenomTesteur'),
            // Témoin : un champ du trimestre reste, lui, en lecture seule.
            temoin: getComputedStyle(document.getElementById('retroactionFinale1')).pointerEvents
        };
    });
    expect(etat).toEqual({
        archive: true,
        description: { pointerEvents: 'auto', auPoint: 'descriptionBug' },
        prenom: { pointerEvents: 'auto', auPoint: 'prenomTesteur' },
        temoin: 'none'
    });
});
