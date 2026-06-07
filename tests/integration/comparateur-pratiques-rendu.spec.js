import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Comparateur de pratiques : GARDE DÉMO + rendu (matrice, fiche, export).
// Depuis C4, le comparateur est une SOUS-SECTION pérenne du Labo
// (Labo › « Comparateur de pratiques »), plus un overlay. Les tests exercent
// donc le vrai câblage de navigation : afficherSection('labo') +
// afficherSousSection('labo-comparateur') déclenche l'initialiseur
// 'labo-comparateur' (setTimeout 100 ms) qui rend le contenu dans
// #labo-comparateur. Attrape aussi les ReferenceError silencieux au chargement.
//
// Ouverture commune (inlinée dans chaque page.evaluate async) :
//   window.afficherSection('labo');
//   window.afficherSousSection('labo-comparateur');
//   await new Promise((r) => setTimeout(r, 250));   // initialiseur en setTimeout 100 ms
//   const panel = document.getElementById('labo-comparateur');

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

test('C4 · garde démo — hors démo, la sous-section invite à activer la démonstration', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.initialiserComparateurPratiques !== 'function') {
            return { erreur: 'window.initialiserComparateurPratiques absent' };
        }
        if (typeof window.db === 'undefined' || typeof window.estEnModeDemo !== 'function') {
            return { erreur: 'db ou estEnModeDemo absent' };
        }

        // S'assurer qu'on n'est PAS en démo
        window.db.setSync('demo-actif', null);

        // C4 : ouverture par la vraie navigation (sous-section pérenne du Labo).
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));

        const panel = document.getElementById('labo-comparateur');
        const html = panel ? panel.innerHTML : '';
        return {
            aPanneau: !!panel,
            visible: panel ? panel.classList.contains('active') : false,
            aBoutonActiver: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            aMatrice: !!(panel && panel.querySelector('#comparateur-matrice')),
            aTitre: html.includes('Comparateur de pratiques'),
            focusSurTitre: !!(document.activeElement
                && document.activeElement.classList
                && document.activeElement.classList.contains('comparateur-titre'))
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aPanneau).toBe(true);
    expect(resultat.visible).toBe(true);
    expect(resultat.aTitre).toBe(true);
    expect(resultat.aBoutonActiver).toBe(true);   // invitation présente
    expect(resultat.aMatrice).toBe(false);        // pas de vue matrice hors démo
    expect(resultat.focusSurTitre).toBe(true);    // focus SPA déplacé au titre

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C4 · garde démo — en démo, la sous-section affiche la matrice (structure + navigation sortante)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.initialiserComparateurPratiques !== 'function') {
            return { erreur: 'window.initialiserComparateurPratiques absent' };
        }

        // Simuler le mode démo actif (estEnModeDemo lit ce flag en premier).
        // Sans seed : la structure de la matrice se rend, les notes valent « — ».
        window.db.setSync('demo-actif', 'true');

        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));

        const panel = document.getElementById('labo-comparateur');
        const matrice = panel ? panel.querySelector('#comparateur-matrice') : null;
        const table = matrice ? matrice.querySelector('table.comparateur-matrice-table') : null;
        const lignes = table ? table.querySelectorAll('tbody tr').length : 0;
        const aColNiveau = table ? table.textContent.includes('Niveau atteint') : false;
        // C1-c (structure) : au moins une ligne E1 dans les en-têtes + ligne de
        // garde. Le texte E1 PAR FAMILLE est vérifié dans le test seedé (réf = STD).
        const corps = panel ? panel.querySelector('.comparateur-corps') : null;
        const aE1 = !!(corps && corps.querySelector('.comparateur-col-e1'));
        const aGarde = !!(corps && corps.querySelector('.comparateur-garde'));

        // « Fermeture » = quitter la sous-section : on navigue ailleurs dans le Labo,
        // #labo-comparateur perd .active (la navigation gère la visibilité).
        window.afficherSousSection('labo-rythme');
        const fermeOk = !panel.classList.contains('active');

        return {
            aMatrice: !!matrice,
            etatMatrice: matrice ? matrice.getAttribute('data-etat') === 'matrice' : false,
            aTable: !!table,
            nbLignes: lignes,
            aColNiveau,
            aE1, aGarde,
            aBoutonActiver: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            fermeOk
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aMatrice).toBe(true);
    expect(resultat.etatMatrice).toBe(true);
    expect(resultat.aTable).toBe(true);
    expect(resultat.nbLignes).toBe(4);            // 4 profils-types en dur
    expect(resultat.aColNiveau).toBe(true);       // colonne « Niveau atteint »
    expect(resultat.aE1).toBe(true);              // C1-c : au moins une ligne E1
    expect(resultat.aGarde).toBe(true);           // C1-c : ligne de garde
    expect(resultat.aBoutonActiver).toBe(false);  // plus l'invitation
    expect(resultat.fermeOk).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C1-b · matrice — parité moteur (réf = panneau profil) + divergence des pratiques (données démo)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        if (typeof window.simulerIndices !== 'function') return { erreur: 'simulerIndices absent' };

        // Seed démo complet (fusionne demo_* + globaux) — données réelles des profils-types.
        await window.activerModeDemo();

        const DA = 'DEMO011'; // profil « Irrégulier » : STD≈81 / SOM≈76 / SPE≈60 (seed C0)
        const refId = window.obtenirPratiqueActiveGroupeCours() || 'standards';

        // PARITÉ : la réf simulée doit égaler le détail de note du panneau profil
        // (même appel sous-jacent, pratique active).
        const sim = window.simulerIndices(DA, refId);
        const det = window.calculerDetailsNoteFinale(DA, null);
        const pariteOk = !!(sim && det && sim.noteFinale === det.noteFinale);

        // DIVERGENCE : résoudre la SPE configurable, comparer les 3 familles.
        const cfgs = window.db.getSync(window.cle('pratiquesConfigurables'), null)
            || window.db.getSync('pratiquesConfigurables', []) || [];
        let speId = null;
        for (const p of cfgs) {
            const inst = window.obtenirPratiqueParId(p.id);
            if (inst && typeof inst.obtenirCode === 'function' && inst.obtenirCode() === 'SPE' && p.id !== refId) {
                speId = p.id; break;
            }
        }
        const pStd = window.simulerIndices(DA, refId).P;
        const pSom = window.simulerIndices(DA, 'sommative').P;
        const pSpe = speId ? window.simulerIndices(DA, speId).P : null;

        // Rendu DOM : la matrice affiche le niveau atteint (libellé d'échelle) + la note réf.
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));
        const matrice = document.getElementById('comparateur-matrice');
        const texte = matrice ? matrice.textContent : '';
        const corps = document.querySelector('#labo-comparateur .comparateur-corps');
        const texteCorps = corps ? corps.textContent : '';

        return {
            pariteOk,
            refId,
            speTrouvee: !!speId,
            pStd, pSom, pSpe,
            domNiveauMaitrise: texte.includes('Maîtrisé'), // terminale DEMO011 = M
            domNoteStd: texte.includes(String(pStd)),
            // C1-c : E1 par famille (réf STD + simulations SOM/SPE) + ligne de garde.
            e1Std: texteCorps.includes('les reprises remplacent'),
            e1Som: texteCorps.includes('moyenne pondérée'),
            e1Spe: texteCorps.includes('exigences satisfaites'),
            garde: texteCorps.includes('palmarès des pratiques de notation')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.pariteOk, `Parité réf/profil rompue (refId=${resultat.refId})`).toBe(true);
    expect(resultat.speTrouvee).toBe(true);

    // Les 3 familles calculent des notes finies.
    for (const p of [resultat.pStd, resultat.pSom, resultat.pSpe]) {
        expect(typeof p).toBe('number');
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
    }
    // Divergence documentée du profil irrégulier : SPE plafonne sous SOM, sous STD.
    expect(resultat.pSpe).toBeLessThan(resultat.pSom);
    expect(resultat.pSom).toBeLessThan(resultat.pStd);

    // La maîtrise (niveau atteint) est montrée en regard, et la note réf est rendue.
    expect(resultat.domNiveauMaitrise).toBe(true);
    expect(resultat.domNoteStd).toBe(true);

    // C1-c : microcopy E1 par famille (réf STD + simulations SOM/SPE) + ligne de garde.
    expect(resultat.e1Std).toBe(true);
    expect(resultat.e1Som).toBe(true);
    expect(resultat.e1Spe).toBe(true);
    expect(resultat.garde).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C2-d.1 · navigation matrice → fiche (en-tête + phrase de contexte + maîtrise) + retour non-destructif', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        await window.activerModeDemo();

        const snapshot = () => {
            const o = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                o[k] = localStorage.getItem(k);
            }
            return JSON.stringify(o, Object.keys(o).sort());
        };
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));
        const panel = document.getElementById('labo-comparateur');

        // Snapshot APRÈS rendu (la navigation persiste l'état de nav, hors périmètre) :
        // on isole l'invariant du comparateur — ses interactions sont en lecture seule.
        const avant = snapshot();

        // Ligne DEMO011 (« Irrégulier ») activable : role=button + tabindex.
        const tr = panel.querySelector('[data-profil-da="DEMO011"]');
        const ligneActivable = !!(tr && tr.getAttribute('role') === 'button' && tr.getAttribute('tabindex') === '0');

        // Clic → ouverture de la fiche (délégation sur #comparateur-matrice).
        if (tr) tr.click();

        const titreEl = panel.querySelector('.comparateur-titre');
        const titre = titreEl ? titreEl.textContent : '';
        const phraseEl = panel.querySelector('.comparateur-fiche-contexte');
        const blocMaitrise = panel.querySelector('.comparateur-fiche-bloc');
        const nbEtapes = panel.querySelectorAll('.comparateur-traj-etape').length;
        const finaleEl = panel.querySelector('.comparateur-fiche-finale-niveau');
        const focusTitre = !!(document.activeElement
            && document.activeElement.classList
            && document.activeElement.classList.contains('comparateur-titre'));
        const aRetour = !!panel.querySelector('.comparateur-retour');
        // La fiche n'affiche plus la matrice.
        const ficheSansMatrice = !panel.querySelector('#comparateur-matrice');

        // Retour → la matrice réapparaît (état des sélecteurs préservé).
        const r = panel.querySelector('.comparateur-retour');
        if (r) r.click();
        const retourMatrice = !!panel.querySelector('#comparateur-matrice table.comparateur-matrice-table');

        const apres = snapshot();

        return {
            ligneActivable,
            titre,
            aPhrase: !!phraseEl,
            phraseTexte: phraseEl ? phraseEl.textContent : '',
            aBlocMaitrise: !!blocMaitrise,
            nbEtapes,
            finaleTexte: finaleEl ? finaleEl.textContent : '',
            focusTitre,
            aRetour,
            ficheSansMatrice,
            retourMatrice,
            nonDestructif: avant === apres
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.ligneActivable).toBe(true);
    expect(resultat.titre).toContain('Irrégulier');
    expect(resultat.titre).toContain('DEMO011');
    expect(resultat.aPhrase).toBe(true);
    expect(resultat.phraseTexte).toContain('A raté deux des premières remises'); // §9 variante A
    expect(resultat.aBlocMaitrise).toBe(true);
    expect(resultat.nbEtapes).toBeGreaterThanOrEqual(1);          // trajectoire (libellés d'échelle)
    expect(resultat.finaleTexte).toContain('Maîtrisé');           // terminale DEMO011 = M
    expect(resultat.focusTitre).toBe(true);                       // focus SPA au titre de la fiche
    expect(resultat.aRetour).toBe(true);
    expect(resultat.ficheSansMatrice).toBe(true);
    expect(resultat.retourMatrice).toBe(true);                    // retour reconstruit la matrice
    expect(resultat.nonDestructif).toBe(true);                    // aucune écriture (lecture seule)

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C2-d.3 · fiche — bloc récit E2 (cartes par pratique via simulerIndices().recit) non-destructif', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        await window.activerModeDemo();

        const snapshot = () => {
            const o = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                o[k] = localStorage.getItem(k);
            }
            return JSON.stringify(o, Object.keys(o).sort());
        };
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));
        const panel = document.getElementById('labo-comparateur');

        // Snapshot APRÈS rendu (la navigation persiste l'état de nav, hors périmètre).
        const avant = snapshot();

        const tr = panel.querySelector('[data-profil-da="DEMO011"]');
        if (tr) tr.click();

        const corps = panel.querySelector('.comparateur-corps');
        const texte = corps ? corps.textContent : '';
        const cartes = panel.querySelectorAll('.comparateur-recit-carte');
        const carteRef = panel.querySelector('.comparateur-recit-carte--ref');
        const lignes = panel.querySelectorAll('.comparateur-recit-ligne');
        const noteFinale = panel.querySelector('.comparateur-recit-notefinale');
        // La carte de référence est la première (« Ta pratique » d'abord).
        const refEstPremiere = cartes.length
            ? cartes[0].classList.contains('comparateur-recit-carte--ref') : false;

        const apres = snapshot();

        return {
            aTitreRecit: texte.includes('Ce que chaque pratique retient'),
            nbCartes: cartes.length,
            aCarteRef: !!carteRef,
            tagRef: carteRef ? carteRef.querySelector('.comparateur-col-tag')?.textContent : '',
            refEstPremiere,
            nbLignes: lignes.length,
            aNoteFinale: !!noteFinale,
            aGarde: !!panel.querySelector('.comparateur-fiche-bloc .comparateur-garde'),
            nonDestructif: avant === apres
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aTitreRecit).toBe(true);
    expect(resultat.nbCartes).toBeGreaterThanOrEqual(1);   // au moins la référence
    expect(resultat.aCarteRef).toBe(true);
    expect(resultat.tagRef).toContain('Ta pratique');
    expect(resultat.refEstPremiere).toBe(true);            // réf d'abord
    expect(resultat.nbLignes).toBeGreaterThanOrEqual(1);   // résultats du contrat §4
    expect(resultat.aNoteFinale).toBe(true);               // synthèse discrète
    expect(resultat.aGarde).toBe(true);                    // ligne de garde sous le récit
    expect(resultat.nonDestructif).toBe(true);             // lecture seule

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C3 · export CSV — bouton présent + contenu conforme (BOM, en-têtes, une colonne par pratique)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        await window.activerModeDemo();

        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));
        const panel = document.getElementById('labo-comparateur');
        const aBouton = !!panel.querySelector('.comparateur-exporter');

        if (typeof window._comparateurGenererCSV !== 'function') {
            return { erreur: '_comparateurGenererCSV absent' };
        }
        const csv = window._comparateurGenererCSV();
        const aBOM = csv.charCodeAt(0) === 0xFEFF;
        const lignes = csv.replace(/^﻿/, '').replace(/\r\n$/, '').split('\r\n');
        const entete = lignes[0] || '';
        const nbColonnes = entete.split(',').length;

        return {
            aBouton,
            aBOM,
            nbLignes: lignes.length,
            entete,
            aColProfil: entete.includes('Profil'),
            aColDA: entete.includes('DA'),
            aColNiveau: entete.includes('Niveau atteint'),
            aColTendance: entete.includes('Tendance'),
            aColTaPratique: entete.includes('Ta pratique'),
            nbColonnes,
            ligneIrregulier: lignes.find(l => l.includes('DEMO011')) || ''
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aBouton).toBe(true);
    expect(resultat.aBOM).toBe(true);                     // BOM UTF-8 (Excel/accents)
    expect(resultat.nbLignes).toBe(5);                    // en-tête + 4 profils-types
    expect(resultat.aColProfil).toBe(true);
    expect(resultat.aColDA).toBe(true);
    expect(resultat.aColNiveau).toBe(true);
    expect(resultat.aColTendance).toBe(true);
    expect(resultat.aColTaPratique).toBe(true);           // au moins la pratique de référence
    expect(resultat.nbColonnes).toBeGreaterThanOrEqual(5);
    expect(resultat.ligneIrregulier).toContain('Irrégulier');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C1-d · sélection inline des candidates — recalcul + invariant non-destructif (données démo)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        await window.activerModeDemo();

        // Snapshot intégral du localStorage APRÈS seed démo (référence non-destructif).
        const snapshot = () => {
            const o = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                o[k] = localStorage.getItem(k);
            }
            return JSON.stringify(o, Object.keys(o).sort());
        };
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 250));
        const panel = document.getElementById('labo-comparateur');

        // Snapshot APRÈS rendu (la navigation persiste l'état de nav, hors périmètre).
        const avant = snapshot();

        // Sélecteurs inline présents (zone dans le corps, pas de modale).
        const zone = panel.querySelector('#comparateur-selecteurs');
        const selects = panel.querySelectorAll('.comparateur-select');

        // Recalcul : changer une candidate doit re-rendre la matrice.
        let recalculOk = false;
        const sel = panel.querySelector('.comparateur-select[data-slot="0"]');
        const matrice = document.getElementById('comparateur-matrice');
        if (sel && matrice) {
            const avantTable = matrice.textContent;
            const autre = Array.from(sel.options).find(o => o.value !== sel.value);
            if (autre) {
                sel.value = autre.value;
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                recalculOk = document.getElementById('comparateur-matrice').textContent !== avantTable;
            }
        }

        const apres = snapshot();

        return {
            aZone: !!zone,
            nbSelects: selects.length,
            recalculOk,
            nonDestructif: avant === apres
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aZone).toBe(true);                 // sélection inline (pas de modale)
    expect(resultat.nbSelects).toBeGreaterThanOrEqual(1);
    expect(resultat.recalculOk).toBe(true);            // changer une candidate recalcule
    expect(resultat.nonDestructif).toBe(true);         // aucune écriture (lecture seule)

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
