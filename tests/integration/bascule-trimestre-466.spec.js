import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #466 (lot L4 « bascule de trimestre », 21 août 2026) — verrouille :
//   1. CT-05 v2 : au retour vers un trimestre qui a un GC marqué actif, le
//      pointeur groupeCoursActif est restauré. Invariant de RÉGRESSION sur la
//      chaîne entière (break-testé à sa source : la restauration #446 de
//      l'orchestre). Les 3 gardes `typeof nom-nu` de changerTrimestreActifV2,
//      réanimés par #466 (3e occurrence du piège #444/#446), sont la CEINTURE :
//      sur le code actuel, peupler/bandeau ont aussi des routes indirectes
//      vivantes — rafraichirVuesApresCours n'en avait AUCUNE.
//   2. CT-05 v1 : « + Nouveau trimestre » avec activation passe par le chemin
//      COMPLET de bascule — le miroir trimestreActif suit, et le pointeur GC de
//      l'ANCIEN trimestre ne survit pas.
//   3. CO-16/CT-06 : la bascule réinitialise les pointeurs d'édition (grille) et
//      le formulaire « Journées sans cours ».
//   4. CT-17 : sélectionner un id non résolvable est REFUSÉ à voix haute (patron
//      commun aux 3 accordéons), plus jamais un silence.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Sélection non résolue/i
];
// ⚠ Une entrée `/clé ABSENTE des registres/i` a été retirée d'ici le 31 août 2026.
// Elle était INERTE depuis son écriture, et pas seulement périmée : son émetteur
// unique (`js/trimestres.js:374`) est un `console.warn`, or le collecteur
// ci-dessous ne pousse que `msg.type() === 'error'`. Le motif n'a donc jamais été
// confronté à quoi que ce soit. Recopiée sur trois specs sans être re-dérivée une
// seule fois, elle annonçait une source de bruit surveillée par rien — et serait
// devenue porteuse en silence le jour où quelqu'un aurait élargi le collecteur
// aux `warning`, masquant alors un vrai signal que personne n'aurait voulu masquer.
// ⮕ Une garde peut naître morte. Avant d'ajouter un motif ici, vérifie qu'il peut
// atteindre le collecteur : le TYPE du message décide, pas son texte.

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

const SETUP = () => {
    db.setSync('trimestres', [
        { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true },
        { id: 'h2027', nom: 'Hiver 2027', annee: 2027, session: 'H', actif: false }
    ]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('cours', [{ id: 'C1', codeCours: '601-101-MQ', nom: 'Littérature' }]);
    db.setSync('a2026_groupesCours', [{ id: 'GC1', coursId: 'C1', groupeNum: '00001', actif: true, dansSidebar: true }]);
    db.setSync('h2027_groupesCours', []);
    db.setSync('a2026_grillesTemplates', [{ id: 'G1', nom: 'Grille SRPNF', criteres: [] }]);
    db.setSync('a2026_journeesSansCours', [{ id: 'EVT_1', dateEvenement: '2026-10-12', description: 'Action de grâce', categorie: 'conge' }]);
};

async function ouvrir(page) {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    return erreurs;
}

test('CT-05 v2 · au retour de bascule, le groupe-cours marqué actif est RESTAURÉ (gardes réanimés)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        // Aller sur h2027 (vide) puis REVENIR sur a2026 — le geste de l'audit.
        window.changerTrimestreActifV2('h2027');
        await new Promise(res => setTimeout(res, 400));
        window.changerTrimestreActifV2('a2026');
        await new Promise(res => setTimeout(res, 600));
        return { gcActif: window.db.getSync('groupeCoursActif', null) };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.gcActif, 'le pointeur est restauré (il restait null avant le fix)').not.toBeNull();
    expect(r.gcActif.id).toBe('GC1');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-05 v1 · création + activation d\'un trimestre = bascule COMPLÈTE (miroir suivi, ancien contexte purgé)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        // Simuler l'ancien contexte vivant d'a2026
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026' });
        // ↻ #975 (7 oct. 2026) : « + Nouveau trimestre » ouvre la fiche du Cadre en création
        // (chemin du lot E2) ; « Créer le trimestre » crée et active, par le chemin complet.
        window.ouvrirCreationTrimestreV2();
        document.getElementById('v2-sessionTrimestre').value = 'ete';
        document.getElementById('v2-anneeTrimestre').value = '2027';
        window.creerTrimestreV2();
        await new Promise(res => setTimeout(res, 700));
        return {
            miroir: window.db.getSync('trimestreActif', null),
            registreActif: (window.db.getSync('trimestres', []).find(t => t.actif) || {}).id,
            gcActif: window.db.getSync('groupeCoursActif', null)
        };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.registreActif).toBe('e2027');
    expect(r.miroir, 'le MIROIR suit la création+activation (il restait périmé avant)').toBe('e2027');
    // e2027 n'a aucun groupe-cours : le pointeur de l'ANCIEN trimestre ne doit pas survivre.
    expect(r.gcActif, 'le GC d\'a2026 ne survit pas sous e2027').toBeNull();
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CO-16/CT-06 · la bascule réinitialise l\'éditeur de grille et le formulaire Journées', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        // Édition en cours : une grille d'a2026 + le formulaire Journées ouvert
        grilleTemplateActuelle = { id: 'G1', nom: 'Grille SRPNF' };
        const formEvt = document.getElementById('v2-formEvenement');
        if (formEvt) formEvt.classList.remove('u-hide');

        window.changerTrimestreActifV2('h2027');
        await new Promise(res => setTimeout(res, 400));
        return {
            pointeurGrille: (typeof grilleTemplateActuelle === 'undefined') ? 'indisponible' : grilleTemplateActuelle,
            formEvtMasque: formEvt ? formEvt.classList.contains('u-hide') : null
        };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.pointeurGrille, 'le pointeur d\'édition de grille est remis à null').toBeNull();
    expect(r.formEvtMasque, 'le formulaire Journées est refermé').toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-17 · sélectionner un horaire disparu est refusé à voix haute (plus de formulaire fantôme)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        let erreurDite = false;
        const o = window.notifications;
        const orig = o.erreur;
        o.erreur = (...a) => { erreurDite = true; return orig.apply(o, a); };
        window.changerHoraireSelectionneV2('HOR_DISPARU');
        o.erreur = orig;
        return { erreurDite, selection: window.db.getSync(window.cle('horaireSelectionne'), null) };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.erreurDite, 'le refus est DIT').toBe(true);
    expect(r.selection, 'la sélection persistée est nettoyée').toBeNull();
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
