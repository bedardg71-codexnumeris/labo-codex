import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1007, second lot (3 oct. 2026) : ce banc ne juge pas le codex proposé avant une suppression
// (jugé par 1007-propose-codex-avant-suppression.spec.js). Doublure « codex à jour » : la fenêtre
// qui propose ne paraît pas, et le geste se déroule comme avant le lot.
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        });
    });
});

// =======================================================================
// LOT B DE L'ENREGISTREMENT — UN SEUL TÉMOIN, ET AUCUN « ENREGISTRÉ » SUR UN ÉCHEC (27 sept. 2026)
// =======================================================================
//
// Décision D0, point 2 (Grégoire, 26 sept.) : « Un seul témoin, le même partout, dit
// « Enregistré » après chaque écriture. Si l'écriture échoue, il dit « Non enregistré », avec
// la raison. » Fiches #618 (succès affichés sur un échec) et #786 (contrat de
// `sauvegarderDonneesSelonMode`).
//
// Chaque site VIVANT est éprouvé par comportement, sur le vrai code : `db.setSync` lève
// `QuotaExceededError`, puis `Error`, puis la VRAIE garde #340 refuse (une garde enregistrée
// par `db.enregistrerGardeEcriture`). Attendu : aucun message de succès, le témoin dit « Non
// enregistré : ‹raison› », la base est inchangée. Puis une écriture réussie : « Enregistré »,
// et le « Non enregistré » précédent disparaît.
//
// Mesuré avant le lot (inventaire du 26 sept., A1) : sur un quota simulé, les présences
// affichaient « Espace de stockage presque plein – Les données sont sauvegardées… » ET
// « Présences enregistrées », base inchangée.
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://).
// Noms fictifs : le pack démo et « Daniel Témoin ».

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i,
    // Les pannes que le banc provoque, journalisées par `modes.js` et la garde de `db.js`.
    /Erreur sauvegarde|Écriture refusée par la garde|GARDE #340/
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function viderLeStockage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
}

/** Outils du banc, posés dans la page : pannes, relevé des toasts, lecture du témoin. */
async function poserOutils(page) {
    await page.evaluate(() => {
        window.__toasts = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) {
                window.__toasts.push(n.className.includes('notification-erreur') ? 'erreur:' + n.textContent : 'succes:' + n.textContent);
            }
        }))).observe(document.body, { childList: true });

        window.__retirerPanne = () => {
            if (db.__setSyncOrig) { db.setSync = db.__setSyncOrig; delete db.__setSyncOrig; }
            if (window.__panne && window.__panne.mode === 'garde') db._gardesEcriture.delete(window.__panne.cleGarde);
            window.__panne = null;
        };
        window.__poserPanne = (cleBase, mode) => {
            window.__retirerPanne();
            window.__panne = { cleBase, mode };
            if (mode === 'garde') {
                // La VRAIE garde #340 : `db.setSync` la consulte et rend `false` sans rien écrire.
                // Elle est indexée par la clé SANS le préfixe de trimestre (`a2026_`) ; en démo, la
                // clé `demo_presences` n'en a pas, et c'est elle entière que `db` cherche.
                const k = window.cle(cleBase);
                const m = k.match(/^[aeh]\d{4}_(.+)$/);
                window.__panne.cleGarde = m ? m[1] : k;
                db.enregistrerGardeEcriture(window.__panne.cleGarde, () => ({ coherent: false, raison: 'banc du lot B' }));
                return;
            }
            const orig = db.setSync;
            db.__setSyncOrig = orig;
            db.setSync = function (k, v) {
                if (k === window.cle(cleBase)) {
                    if (mode === 'quota') throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
                    throw new Error('panne du banc');
                }
                return orig.call(this, k, v);
            };
        };
        window.__lireTemoin = () => {
            const noeuds = document.querySelectorAll('#temoin-enregistrement');
            const t = noeuds[0];
            const visible = (el) => !!el && getComputedStyle(el).display !== 'none';
            const succes = t && t.querySelector('.temoin-enregistrement-succes');
            const echec = t && t.querySelector('.temoin-enregistrement-echec');
            return {
                nb: noeuds.length,
                succes: visible(succes) ? succes.textContent : null,
                echec: visible(echec) ? echec.querySelector('.temoin-enregistrement-echec-texte').textContent : null,
                roleSucces: succes && succes.getAttribute('role'),
                liveSucces: succes && succes.getAttribute('aria-live'),
                roleEchec: echec && echec.getAttribute('role')
            };
        };
        window.__base = (cleBase) => JSON.stringify(db.getSync(window.cle(cleBase), null));
    });
}

const PANNES = [
    ['quota', /^Non enregistré – .+ : la mémoire du navigateur est pleine\./],
    ['erreur', /^Non enregistré – .+ : le navigateur a refusé l'écriture\.$/],
    ['garde', /^Non enregistré – .+ : ces données ne correspondent pas au trimestre ouvert\.$/]
];

/**
 * Joue `geste` sous chacune des trois pannes, et vérifie : aucun toast de succès, le témoin dit
 * l'échec (avec `gesteAttendu`), la base de `cleBase` est inchangée.
 */
async function eprouverLesTroisPannes(page, cleBase, geste, gesteAttendu) {
    for (const [mode, motif] of PANNES) {
        const r = await page.evaluate(async ({ cleBase, mode, geste }) => {
            const avant = window.__base(cleBase);
            window.__toasts = [];
            window.__poserPanne(cleBase, mode);
            try { await (0, eval)(geste); } finally { window.__retirerPanne(); }
            await new Promise((res) => setTimeout(res, 300));
            return { avant, apres: window.__base(cleBase), toasts: window.__toasts.slice(), temoin: window.__lireTemoin() };
        }, { cleBase, mode, geste });
        expect(r.toasts.filter((t) => t.startsWith('succes:')), `${mode} : aucun message de succès (${gesteAttendu})`).toEqual([]);
        expect(r.temoin.echec, `${mode} : le témoin dit l'échec`).toMatch(motif);
        expect(r.temoin.echec).toContain(gesteAttendu);
        expect(r.apres, `${mode} : la base est inchangée`).toBe(r.avant);
    }
}

async function ecritureReussie(page, geste) {
    return page.evaluate(async (geste) => {
        window.__toasts = [];
        await (0, eval)(geste);
        await new Promise((res) => setTimeout(res, 300));
        return { toasts: window.__toasts.slice(), temoin: window.__lireTemoin() };
    }, geste);
}

// Semis : celui du spec du lot A (copie déjà évaluée, rouverte), en mode NORMAL.
// `grosse` ajoute une évaluation d'un autre élève de plus de 25 Ki caractères : la clé passe
// alors par le cache mémoire de `db` (IDB-first), comme celle d'un groupe réel.
async function ouvrirEvaluationTemoin(page, { grosse = false } = {}) {
    await viderLeStockage(page);
    await page.waitForFunction(() => typeof window.demarrerEvaluationDepuisFichier === 'function' && typeof window.db !== 'undefined');
    await page.evaluate((grosse) => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        window.db.setSync(k('grillesTemplates'), [{ id: 'G699', nom: 'Grille témoin 50/30/20', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50, description: 'Le fond.' },
            { id: 'c2', nom: 'Organisation', ponderation: 30, description: 'La structure.' },
            { id: 'c3', nom: 'Langue', ponderation: 20, description: 'La forme.' }
        ] }]);
        window.db.setSync(k('echellesTemplates'), [{ id: 'E699', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(k('productions'), [{ id: 'P699', titre: 'Portrait témoin', grilleId: 'G699', echelleId: 'E699', groupeCoursId: 'GC1' }]);
        window.db.setSync(k('evaluationsSauvegardees'), [{
            id: 'EV699', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00007', groupeCoursId: 'GC1',
            productionId: 'P699', productionNom: 'Portrait témoin', grilleId: 'G699', grilleNom: 'Grille témoin 50/30/20',
            echelleId: 'E699', cartoucheId: '', statutRemise: 'evalue', statutIntegrite: 'recevable', notesIntegrite: '',
            dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
            optionsAffichage: { description: true, objectif: true, tache: true, adresse: false, contexte: true, affichageNote: 'complet' },
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 50 },
                { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', retroaction: '', ponderation: 30 },
                { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', retroaction: '', ponderation: 20 }
            ],
            noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', retroactionFinale: '',
            donneesAlgorithmiques: {}, pointsAnalytiques: {}
        }].concat(grosse ? [{
            id: 'EV_LOURDE', etudiantDA: '7654321', etudiantNom: 'Estelle Voisine', groupe: '00007', groupeCoursId: 'GC1',
            productionId: 'P699', productionNom: 'Portrait témoin', grilleId: 'G699', echelleId: 'E699',
            criteres: [], noteFinale: 70, niveauFinal: 'D', verrouillee: true, dateEvaluation: '2026-09-05T10:00:00.000Z',
            retroactionFinale: 'x'.repeat(30000)
        }] : []));
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        window.demarrerEvaluationDepuisFichier({ id: 'F699', etudiantDA: '1234567', productionId: 'P699', nomFichier: 'copie.pdf' });
        document.getElementById('selectEtudiantEval').value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P699';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
    }, grosse);
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV699'
        && window._autoSaveSuspendu === false, null, { timeout: 10000 });
    await page.waitForTimeout(2000);   // laisser passer tout auto-enregistrement d'ouverture
}

// -----------------------------------------------------------------------
// LE TÉMOIN LUI-MÊME
// -----------------------------------------------------------------------
test('lot B · le témoin : un seul nœud, rôles justes, l\'échec RESTE jusqu\'à une écriture réussie ou « Fermer »', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherEcouteurs(page);
    await viderLeStockage(page);
    await poserOutils(page);

    const r = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const out = {};
        window.__poserPanne('banc_lotB', 'quota');
        out.retourEchec = sauvegarderDonneesSelonMode('banc_lotB', [1], { geste: 'Essai du banc' });
        window.__retirerPanne();
        out.echec = window.__lireTemoin();
        // Un échec qu'on n'a pas vu est le mal que ce lot répare : aucun délai ne l'efface.
        await pause(3500);
        out.echecApresDelai = window.__lireTemoin();
        // R1 (relecture de Cowork) : le succès d'une AUTRE clé montre « Enregistré » sans
        // retirer l'échec — une petite écriture réussie juste après une grosse qui échoue.
        sauvegarderDonneesSelonMode('banc_autre', [1]);
        out.apresAutreCle = window.__lireTemoin();
        out.retourSucces = sauvegarderDonneesSelonMode('banc_lotB', [2]);
        out.succes = window.__lireTemoin();
        for (let i = 0; i < 5; i++) sauvegarderDonneesSelonMode('banc_lotB', [3 + i]);
        out.apresCinq = window.__lireTemoin();
        await pause(2500);
        out.succesEfface = window.__lireTemoin();
        // « Fermer » retire l'échec sans écriture.
        window.__poserPanne('banc_lotB', 'erreur');
        sauvegarderDonneesSelonMode('banc_lotB', [9]);
        window.__retirerPanne();
        document.querySelector('.temoin-enregistrement-fermer').click();
        out.apresFermer = window.__lireTemoin();
        const t = document.getElementById('temoin-enregistrement');
        out.pointeurs = getComputedStyle(t).pointerEvents;
        return out;
    });

    expect(r.retourEchec, 'contrat #786 : false, jamais une chaîne').toBe(false);
    expect(r.echec.echec).toBe('Non enregistré – Essai du banc : la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.');
    expect(r.echec.roleEchec).toBe('alert');
    expect(r.echecApresDelai.echec, 'l\'échec est encore affiché 3,5 s plus tard').toBe(r.echec.echec);
    expect(r.apresAutreCle.succes, 'une autre clé réussit : « Enregistré »').toBe('Enregistré');
    expect(r.apresAutreCle.echec, 'R1 : le succès d\'une autre clé ne retire pas l\'échec').toBe(r.echec.echec);
    expect(r.retourSucces).toBe(true);
    expect(r.succes.succes).toBe('Enregistré');
    expect(r.succes.echec, 'une écriture réussie efface le « Non enregistré »').toBe(null);
    expect(r.succes.roleSucces).toBe('status');
    expect(r.succes.liveSucces).toBe('polite');
    expect(r.apresCinq.nb, 'le témoin est posé UNE fois').toBe(1);
    expect(r.succesEfface.succes, '« Enregistré » est bref').toBe(null);
    expect(r.apresFermer.echec, '« Fermer » retire l\'échec').toBe(null);
    expect(r.pointeurs, 'le témoin ne capte pas le pointeur (Pencil)').toBe('none');
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// SITE VIVANT · LES PRÉSENCES (bouton réel, pack démo)
// -----------------------------------------------------------------------
// Lot D (27 sept. 2026) : le bouton « Enregistrer » est parti ; le geste est une période changée,
// suivie du vidage de l'écriture en attente (l'écrivain unique, avec le geste touché).
test('lot B · présences : sous les trois pannes, aucun message de succès, le témoin dit l\'échec, base inchangée', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await viderLeStockage(page);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(1200);
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await page.waitForTimeout(800);
    await poserOutils(page);

    const clic = "(() => { const el = document.querySelector('#tbody-saisie-presences input[id^=\"periodes_\"]'); "
        + "el.value = String(Number(el.value) === 1 ? 2 : 1); mettreAJourLignePeriodesHandler(el); return viderEnregistrementPresences(); })()";
    await eprouverLesTroisPannes(page, 'presences', clic, 'Enregistrement des présences');

    const ok = await ecritureReussie(page, clic);
    // Lot D : « Présences enregistrées » est parti ; le témoin le dit.
    expect(ok.toasts.some((t) => t.includes('Présences enregistrées'))).toBe(false);
    expect(ok.temoin.succes).toBe('Enregistré');
    expect(ok.temoin.echec).toBe(null);
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// SITES VIVANTS · L'ÉVALUATION (modification, cadenas) ET LA LISTE (suppression)
// -----------------------------------------------------------------------
test('lot B · évaluation modifiée, cadenas, suppression : aucun succès sur un échec, le témoin le dit, base inchangée', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirEvaluationTemoin(page);
    await poserOutils(page);
    await page.evaluate(() => { window._autoSaveSuspendu = true; });

    await eprouverLesTroisPannes(page, 'evaluationsSauvegardees', 'sauvegarderEvaluation()', 'Verrouillage de l\'évaluation');
    await eprouverLesTroisPannes(page, 'evaluationsSauvegardees', 'basculerVerrouillageEvaluationCourante()', 'Verrouillage de l\'évaluation');
    // Le cadenas n'a pas basculé à l'écran ni dans l'évaluation en cours.
    expect(await page.evaluate(() => !!window.evaluationEnCours.verrouillee)).toBe(false);
    await eprouverLesTroisPannes(page, 'evaluationsSauvegardees', "supprimerEvaluation('EV699')", 'Suppression de l\'évaluation');

    // Puis les écritures réussies : le succès revient, le témoin dit « Enregistré ».
    const modif = await ecritureReussie(page, 'sauvegarderEvaluation()');
    expect(modif.toasts.some((t) => t.includes('Évaluation verrouillée : '))).toBe(true);   // lot C
    expect(modif.temoin.echec).toBe(null);
    expect(modif.temoin.succes).toBe('Enregistré');
    const cadenas = await ecritureReussie(page, 'basculerVerrouillageEvaluationCourante()');
    expect(cadenas.toasts.some((t) => /Évaluation (dé)?verrouillée/.test(t))).toBe(true);
    const suppr = await ecritureReussie(page, "supprimerEvaluation('EV699')");
    expect(suppr.toasts.some((t) => t.includes('Évaluation supprimée'))).toBe(true);
    expect(await page.evaluate(() => db.getSync(cle('evaluationsSauvegardees'), []).length)).toBe(0);
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// SITES VIVANTS · LA CORBEILLE DE LA LISTE (suppression définitive, vider)
// -----------------------------------------------------------------------
test('lot B · corbeille : le message ne compte que les évaluations vraiment retirées ; le témoin dit l\'échec', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirEvaluationTemoin(page);
    await poserOutils(page);
    await page.evaluate(() => { window._autoSaveSuspendu = true; });

    const semer = (id) => page.evaluate((id) => {
        db.setSync(cle('corbeilleFichiers'), [{ id, etudiantDA: '1234567', productionId: 'P699', groupeCoursId: 'GC1', nomFichier: 'copie.pdf', dateSuppression: new Date().toISOString() }]);
    }, id);
    const jouer = (id, mode, ouvrir, bouton) => page.evaluate(async ({ id, mode, ouvrir, bouton }) => {
        const avant = window.__base('evaluationsSauvegardees');
        window.__toasts = [];
        if (mode) window.__poserPanne('evaluationsSauvegardees', mode);
        try {
            await (0, eval)(ouvrir);   // #1007 : la porte est async (le codex proposé la précède)
            await document.getElementById(bouton).onclick();
        } finally { window.__retirerPanne(); }
        await new Promise((res) => setTimeout(res, 300));
        return { avant, apres: window.__base('evaluationsSauvegardees'), toasts: window.__toasts.slice(), temoin: window.__lireTemoin() };
    }, { id, mode, ouvrir, bouton });

    await semer('FC1');
    const def = await jouer('FC1', 'quota', "supprimerFichierDefinitivement('FC1')", 'supprimer-definitif-btn-confirmer');
    expect(def.toasts.filter((t) => t.startsWith('succes:')), 'le fichier seul : il est bien supprimé').toEqual(['succes:Fichier supprimé définitivement.']);
    expect(def.temoin.echec).toMatch(/^Non enregistré – Suppression des évaluations du fichier : la mémoire/);
    expect(def.apres).toBe(def.avant);

    await semer('FC2');
    const vider = await jouer('FC2', 'erreur', 'viderTouteCorbeille()', 'vider-corbeille-btn-confirmer');
    expect(vider.toasts.filter((t) => t.startsWith('succes:'))).toEqual(['succes:Corbeille vidée.']);
    expect(vider.temoin.echec).toMatch(/^Non enregistré – Suppression des évaluations de la corbeille : le navigateur a refusé/);
    expect(vider.apres).toBe(vider.avant);

    // Écriture réussie : le compte réel, et le témoin efface l'échec.
    await semer('FC3');
    const ok = await jouer('FC3', null, "supprimerFichierDefinitivement('FC3')", 'supprimer-definitif-btn-confirmer');
    expect(ok.toasts).toContain('succes:Fichier et 1 évaluation supprimés définitivement.');
    expect(ok.temoin.echec).toBe(null);
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// R4 (a) · LE CADENAS QUAND LA CLÉ EST SERVIE PAR LE CACHE MÉMOIRE
// -----------------------------------------------------------------------
test('lot B · R4 cadenas, clé servie par le cache mémoire : après un échec, le verrou reste tel quel dans ce que db rend', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirEvaluationTemoin(page, { grosse: true });
    await poserOutils(page);
    await page.evaluate(() => { window._autoSaveSuspendu = true; });

    const r = await page.evaluate(() => {
        const k = cle('evaluationsSauvegardees');
        const out = { servieParCache: db.memoryCache.has(k) };
        const lire = () => (db.getSync(k, []).find((e) => e.id === 'EV699') || {}).verrouillee;
        out.avant = lire();
        window.__poserPanne('evaluationsSauvegardees', 'quota');
        try { basculerVerrouillageEvaluationCourante(); } finally { window.__retirerPanne(); }
        out.apres = lire();
        out.echec = window.__lireTemoin().echec;
        return out;
    });
    // Sans ce témoin de fraîcheur, l'essai passerait sur une clé en localStorage (relue
    // fraîche à chaque `getSync`), où la mutation en place ne se voit jamais.
    expect(r.servieParCache, 'la clé doit être servie par le cache mémoire').toBe(true);
    expect(r.echec).toMatch(/^Non enregistré – Verrouillage de l'évaluation : /);
    expect(r.apres, 'le tableau lu reprend son verrou : l\'auto-enregistrement suivant n\'écrira pas un verrou que l\'écran ne montre pas').toBe(r.avant);
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// R3 · LA FENÊTRE DE LA RÉTROACTION RESTE OUVERTE SUR UN ÉCHEC
// -----------------------------------------------------------------------
test('lot B · R3 rétroaction : sur un échec, la fenêtre reste ouverte avec le texte ; sur un succès, elle se ferme', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherEcouteurs(page);
    await viderLeStockage(page);
    await page.waitForFunction(() => window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined', null, { timeout: 30000 });
    await page.evaluate(() => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync('cours', [{ id: 'C1', code: '601-101', nom: 'Cours un' }]);
        db.setSync('infoCours', { id: 'C1', code: '601-101', nom: 'Cours un' });
        db.setSync(cle('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00001', coursId: 'C1' }]);
        db.setSync(cle('fichiersTravaux'), [{ id: 'F1', etudiantDA: '1234567', productionId: 'P1', nomFichier: 'copie.pdf', coursId: 'C1' }]);
        db.setSync(cle('evaluationsSauvegardees'), [{ id: 'EV_C1', coursId: 'C1', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin',
            groupe: '00001', productionId: 'P1', productionNom: 'Portrait', grilleNom: 'Grille', noteFinale: 80, niveauFinal: 'M',
            criteres: [], retroactionFinale: 'Première version.', dateEvaluation: '2026-09-10T10:00:00.000Z', verrouillee: false }]);
    });
    await poserOutils(page);
    await page.evaluate(() => travauxUI.afficherRetroaction('F1'));
    await page.locator('#travaux-modal-retro-texte').fill('Deuxième version, écrite à la main.');

    const echec = await page.evaluate(() => {
        const avant = window.__base('evaluationsSauvegardees');
        window.__toasts = [];
        window.__poserPanne('evaluationsSauvegardees', 'erreur');
        try { travauxUI.sauvegarderRetroactionDepuisModal('F1'); } finally { window.__retirerPanne(); }
        const zone = document.getElementById('travaux-modal-retro-texte');
        return { ouverte: !!document.getElementById('travaux-modal-retroaction'), texte: zone && zone.value,
            toasts: window.__toasts.slice(), temoin: window.__lireTemoin(), inchangee: window.__base('evaluationsSauvegardees') === avant };
    });
    expect(echec.ouverte, 'la fenêtre reste ouverte sur un échec').toBe(true);
    expect(echec.texte, 'le texte écrit est toujours là').toBe('Deuxième version, écrite à la main.');
    expect(echec.toasts.filter((t) => t.startsWith('succes:'))).toEqual([]);
    expect(echec.temoin.echec).toMatch(/^Non enregistré – Enregistrement de la rétroaction : le navigateur a refusé/);
    expect(echec.inchangee).toBe(true);

    const ok = await page.evaluate(() => {
        window.__toasts = [];
        travauxUI.sauvegarderRetroactionDepuisModal('F1');
        return { ouverte: !!document.getElementById('travaux-modal-retroaction'), toasts: window.__toasts.slice(),
            temoin: window.__lireTemoin(), texte: db.getSync(cle('evaluationsSauvegardees'), [])[0].retroactionFinale };
    });
    expect(ok.ouverte, 'sur un succès, la fenêtre se ferme').toBe(false);
    expect(ok.texte).toBe('Deuxième version, écrite à la main.');
    expect(ok.temoin.echec).toBe(null);
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// PLACEMENT · 360, 768, 1024, 1180 px, clair et sombre : il ne masque ni la barre d'Annoter
// ni les boutons des présences
// -----------------------------------------------------------------------
const INTERACTIFS = 'button, input, select, textarea, a[href], [data-action], [role="button"]';

async function chevauchements(page, portee) {
    return page.evaluate(({ portee, INTERACTIFS }) => {
        window.temoinEnregistrement.nonEnregistre(
            'la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.',
            'Enregistrement de l\'évaluation');
        const temoin = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
        const t = temoin.getBoundingClientRect();
        const cibles = [];
        document.querySelectorAll(portee).forEach((racine) => {
            [racine, ...racine.querySelectorAll(INTERACTIFS)].filter((el) => el.matches(INTERACTIFS)).forEach((el) => {
                const r = el.getBoundingClientRect();
                const s = getComputedStyle(el);
                if (r.width === 0 || r.height === 0 || s.visibility === 'hidden' || s.display === 'none') return;
                if (r.bottom <= 0 || r.top >= innerHeight) return;
                const croise = r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top;
                if (croise) cibles.push((el.id ? '#' + el.id : el.tagName) + ' ' + (el.getAttribute('data-action') || '') + ' ' + (el.textContent || '').trim().slice(0, 30));
            });
        });
        const fond = getComputedStyle(temoin).backgroundImage + ' ' + getComputedStyle(temoin).backgroundColor;
        return { cibles, rect: { l: Math.round(t.left), r: Math.round(t.right), t: Math.round(t.top), b: Math.round(t.bottom) }, largeurVue: innerWidth, fond,
            couleur: getComputedStyle(temoin).color, debordeX: document.documentElement.scrollWidth > innerWidth };
    }, { portee, INTERACTIFS });
}

for (const largeur of [360, 768, 1024, 1180]) {
    for (const clair of [false, true]) {
        test(`lot B · placement ${largeur} px, ${clair ? 'clair' : 'sombre'} : aucun bouton des présences ni de la barre d'Annoter sous le témoin`, async ({ page }) => {
            test.setTimeout(90000);
            const erreurs = brancherEcouteurs(page);
            // 1180 × 820 : l'iPad Air de Grégoire couché (relecture de Cowork, R4 b).
            await page.setViewportSize({ width: largeur, height: { 360: 740, 768: 1024, 1024: 768, 1180: 820 }[largeur] });
            await viderLeStockage(page);
            await page.evaluate(() => activerModeDemo());
            await page.waitForTimeout(1200);
            await page.evaluate((clair) => { document.body.classList.toggle('mode-clair', clair); naviguerVers('suivi', 'saisie'); window.scrollTo(0, 0); }, clair);
            await page.waitForTimeout(800);

            const presences = await chevauchements(page, '#actions-presences-bar, #controle-verrouillage-presences, #btn-cours-precedent, #btn-cours-suivant, #date-cours');
            expect(presences.cibles, `présences à ${largeur} px : ${JSON.stringify(presences.rect)}`).toEqual([]);
            expect(presences.rect.r, 'le témoin tient dans la largeur').toBeLessThanOrEqual(largeur);

            // Annoter, en plein écran (la vraie barre posée par afficherVisionneuse).
            await page.evaluate(() => {
                const hote = document.getElementById('evaluations-contenu-fichiers');
                document.body.appendChild(hote);
                hote.style.cssText = 'display:block;';
                window.travauxUI.afficherVisionneuse();
                document.getElementById('travaux-btn-plein-ecran').click();
            });
            await page.waitForTimeout(400);
            const annoter = await chevauchements(page, '.travaux-plein-ecran');
            expect(await page.evaluate(() => !!document.querySelector('.travaux-plein-ecran .annot-toolbar'))).toBe(true);
            expect(annoter.cibles, `Annoter à ${largeur} px : ${JSON.stringify(annoter.rect)}`).toEqual([]);
            expect(erreurs).toEqual([]);
        });
    }
}
