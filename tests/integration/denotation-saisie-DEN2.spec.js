import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Lot DEN-2 (#318, Dénotation couche 2) — UI de saisie du jugement.
// Vérifie, dans WebKit, que : (1) le panneau se rend quand une pratique DEN est
// active (cibles + garde + champs) ; (2) la saisie est PERSISTÉE (namespacée) ;
// (3) l'écriture est non-destructive (n'écrase pas une autre pratique) ; (4) la
// garde bascule attention → succès quand toutes les cibles sont confirmées.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

const DA = 'DA_DEN_1';
const PRATIQUE_ID = 'prat-den-test';
const CIBLES = [{ id: 'o1', nom: 'Analyser' }, { id: 'o2', nom: 'Argumenter' }];
const SETUP = {
    da: DA,
    pratiqueId: PRATIQUE_ID,
    pratiqueData: {
        id: PRATIQUE_ID, nom: 'Dénotation (test)', type: 'denotation',
        calcul_note: { methode: 'jugement_global' },
        objectifs: CIBLES,
        configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: CIBLES, suggestion: { methode: 'mode' } }
    }
};

test('DEN-2 · le panneau se rend quand une DEN est active (cibles + garde + champs)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ da, pratiqueData }) => {
        if (!window.denotationSaisie) return { erreur: 'denotationSaisie absent' };
        window.db.setSync('pratiquesConfigurables', [pratiqueData]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [pratiqueData]);
        // #328 L2-b2 : activation par la SSOT groupesCours[].pratiqueId
        // (le miroir modalitesEvaluation.pratique n'existe plus).
        window.db.setSync('groupeCoursActif', { id: 'GC_DEN', trimestreId: window.obtenirTrimestreId() });
        window.db.setSync(window.cle('groupesCours'), [{ id: 'GC_DEN', pratiqueId: pratiqueData.id }]);

        const active = window.denotationSaisie.estActive();
        const html = window.denotationSaisie.panneau(da);
        return {
            active,
            aIntro: html.includes('jugement'),
            aCible1: html.includes('Analyser'),
            aCible2: html.includes('Argumenter'),
            aGardeAttention: html.includes('den-garde') && html.includes('alerte-attention'),
            aChampNote: html.includes('den-note-' + da),
            aChampJustif: html.includes('den-justif-' + da),
            aBoutonEnregistrer: html.includes('denotationSaisie.enregistrer')
        };
    }, SETUP);

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.active).toBe(true);
    expect(r.aIntro).toBe(true);
    expect(r.aCible1).toBe(true);
    expect(r.aCible2).toBe(true);
    expect(r.aGardeAttention).toBe(true); // pas de saisie → garde « attention »
    expect(r.aChampNote).toBe(true);
    expect(r.aChampJustif).toBe(true);
    expect(r.aBoutonEnregistrer).toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('DEN-2 · enregistrer persiste la saisie (namespacée) sans écraser une autre pratique', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ da, pratiqueId, pratiqueData }) => {
        window.db.setSync('pratiquesConfigurables', [pratiqueData]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [pratiqueData]);
        // #328 L2-b2 : activation par la SSOT groupesCours[].pratiqueId.
        window.db.setSync('groupeCoursActif', { id: 'GC_DEN', trimestreId: window.obtenirTrimestreId() });
        window.db.setSync(window.cle('groupesCours'), [{ id: 'GC_DEN', pratiqueId: pratiqueId }]);

        // Saisie préexistante d'une AUTRE pratique : ne doit pas être touchée.
        window.db.setSync(window.cle('jugementsDenotation'), {
            'autre-prat': { 'DAX': { ciblesAtteintes: {}, noteFinale: 99, justification: 'intacte', date: '2026-01-01' } }
        });

        // Rendre le panneau dans un conteneur réel pour que enregistrer() lise le DOM.
        const hote = document.createElement('div');
        hote.id = 'hote-test-den';
        hote.innerHTML = window.denotationSaisie.panneau(da);
        document.body.appendChild(hote);

        document.getElementById('den-cible-o1-' + da).checked = true;
        document.getElementById('den-cible-o2-' + da).checked = true;
        document.getElementById('den-note-' + da).value = '82';
        document.getElementById('den-justif-' + da).value = 'Cibles atteintes <ok>';

        window.denotationSaisie.enregistrer(da);

        const persiste = window.denotationJugements.lireJugementDenotation(pratiqueId, da);
        const autre = window.denotationJugements.lireTousLesJugements()['autre-prat'];
        const garde = document.getElementById('den-garde-' + da);

        return {
            note: persiste ? persiste.noteFinale : null,
            justif: persiste ? persiste.justification : null,
            o1: persiste ? persiste.ciblesAtteintes.o1 : null,
            o2: persiste ? persiste.ciblesAtteintes.o2 : null,
            aDate: !!(persiste && persiste.date),
            autreIntacte: !!(autre && autre.DAX && autre.DAX.noteFinale === 99),
            gardeSucces: !!(garde && garde.className.includes('alerte-succes'))
        };
    }, SETUP);

    expect(r.note).toBe(82);
    expect(r.justif).toBe('Cibles atteintes <ok>'); // stocké brut, échappé à l'affichage
    expect(r.o1).toBe(true);
    expect(r.o2).toBe(true);
    expect(r.aDate).toBe(true);
    expect(r.autreIntacte).toBe(true); // non-destructif
    expect(r.gardeSucces).toBe(true);  // garde live : toutes cibles → succès
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
