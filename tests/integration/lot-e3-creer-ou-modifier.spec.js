import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LOT E3 DE L'ENREGISTREMENT — CRÉER OU MODIFIER : PRODUCTIONS, INTERVENTIONS, VOLET
// CONFIDENTIEL, RÉGLAGES (D3, D0 ; 28 sept. 2026)
//
// Décision de Grégoire (D3) : « Créer quelque chose de neuf : un bouton qui nomme le geste. Tant
// qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit. Modifier ce qui existe : tout
// s'enregistre tout seul, champ par champ. « Annuler » devient « Fermer ». »
//
// Ce banc joue le vrai index.html depuis la démonstration et lit la BASE, pas l'écran.
// Productions :
//   (P-a) une production évaluée : un champ s'écrit sans bouton, le témoin le dit ; changer sa
//         grille n'écrit aucune évaluation (empreinte), et la cartouche de l'ancienne grille part ;
//   (P-b) une nouvelle production n'existe pas avant « Créer la production » ; « Fermer » pose la
//         question ; « Rester » ne perd rien ;
//   (P-c) un échec d'écriture : « Non enregistré – Modifier la production : … », sans succès ;
//   (P-d) un nom vidé : « Non enregistré – Modifier la production : le nom … », rien d'écrit.
//
// ⚠ Les productions de la démonstration sont en lecture seule (matériel Labo Codex) : le banc
// retire cette marque sur UNE production évaluée, dans le stockage propre à l'essai.
// Noms fictifs seulement. Stockage propre à chaque essai (contexte Playwright neuf).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => { window.__toasts = [];
        new MutationObserver((ms) => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.innerText.replace(/\s+/g, ' ').trim());
        }))).observe(document.body, { childList: true });
    });
}

async function changer(page, selecteur, valeur) {
    const n = await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = valeur; else el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true })); return 1;
    }, { selecteur, valeur });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'élément introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

const temoinSucces = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
    return !!el && el.classList.contains('visible');
});
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});
const visible = (page, s) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.classList.contains('u-hide'); }, s);
const questionOuverte = (page) => page.evaluate(() => document.getElementById('ui-dialogue-titre')?.textContent || '');
async function repondre(page, texte) {
    const n = await page.evaluate((texte) => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => x.textContent.trim() === texte);
        if (!b) return 0; b.click(); return 1;
    }, texte);
    expect(n, 'bouton de la question introuvable : ' + texte).toBe(1);
    await pause(page, 600);
}

/* ─────────────────────────────────────────────────────────────── productions */

const productions = (page) => page.evaluate(() => JSON.parse(JSON.stringify(db.getSync(cle('productions'), []) || [])));
const empreinteEvaluations = (page) => page.evaluate(() => JSON.stringify(db.getSync(cle('evaluationsSauvegardees'), []) || []));

/** Une production évaluée, rendue modifiable (marque « démo » retirée dans l'essai), ouverte. */
async function ouvrirProductionEvaluee(page) {
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const id = await page.evaluate(async () => {
        const evals = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const liste = db.getSync(cle('productions'), []) || [];
        const p = liste.find(x => x.grilleId && x.cartoucheId && evals.some(e => e.productionId === x.id))
            || liste.find(x => x.grilleId && evals.some(e => e.productionId === x.id));
        p.isDemo = false; p.auteur = 'Banc E3'; p.auteurOriginal = 'Banc E3'; delete p.metadata_cc;
        await db.set(cle('productions'), liste);   // security-ok: banc, la collection lue dans l'essai, marque « démo » retirée
        return p.id;
    });
    await page.evaluate((id) => chargerProductionPourModif(id), id);
    await pause(page, 900);
    return id;
}

test('(P-a) production évaluée : un champ s\'écrit sans bouton ; changer la grille n\'écrit aucune évaluation', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const id = await ouvrirProductionEvaluee(page);
    expect(await page.evaluate(() => document.getElementById('productionActivite').disabled), 'fiche modifiable').toBe(false);
    expect(await visible(page, '#btnCreerProduction'), 'une fiche existante n\'a que « Fermer »').toBe(false);
    const avant = await empreinteEvaluations(page);
    await page.evaluate(() => { window.__toasts = []; });

    await changer(page, '#productionActivite', 'Activité fictive banc E3');
    expect((await productions(page)).find(p => p.id === id).activiteApprentissage).toBe('Activité fictive banc E3');
    expect(await temoinSucces(page), 'le témoin dit « Enregistré »').toBe(true);

    const autre = await page.evaluate((id) => {
        const p = (db.getSync(cle('productions'), []) || []).find(x => x.id === id);
        return (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id !== p.grilleId).id;
    }, id);
    await changer(page, '#productionGrille', autre);
    await pause(page, 400);
    const p = (await productions(page)).find(x => x.id === id);
    expect(p.grilleId).toBe(autre);
    expect(p.cartoucheId, 'la cartouche de l\'ancienne grille ne suit pas la nouvelle').toBe('');
    expect(await empreinteEvaluations(page), 'aucune évaluation réécrite').toBe(avant);
    expect(await page.evaluate(() => window.__toasts), 'aucun message de modification').toEqual([]);

    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page), 'une fiche existante se ferme sans question').toBe('');
    expect(await visible(page, '#formulaireProduction')).toBe(false);
});

test('(P-b) nouvelle production : rien avant « Créer la production » ; « Fermer » pose la question', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const nb = (await productions(page)).length;
    await cliquer(page, '[data-action="creerNouvelleProduction"]');
    expect(await visible(page, '#btnCreerProduction')).toBe(true);
    await changer(page, '#productionTitre', 'Journal fictif banc E3');
    await changer(page, '#productionType', 'travail');
    await changer(page, '#productionPonderation', '10');
    expect((await productions(page)).length, 'rien avant le bouton').toBe(nb);

    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page)).toBe('Cette production n\'est pas encore créée.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('productionTitre').value)).toBe('Journal fictif banc E3');
    expect((await productions(page)).length).toBe(nb);

    await page.evaluate(() => { window.__toasts = []; });
    await cliquer(page, '#btnCreerProduction');
    await pause(page, 600);
    const creee = (await productions(page)).find(p => p.titre === 'Journal fictif banc E3');
    expect(creee, 'créée au clic').toBeTruthy();
    expect(creee).toMatchObject({ type: 'travail', ponderation: 10 });
    // #489 (15 oct. 2026) : le verrou d'une production entière est retiré, la création n'écrit plus le champ.
    expect(creee.verrouille).toBeUndefined();
    expect(await page.evaluate(() => window.__toasts.some(t => t.includes('Production « Journal fictif banc E3 » créée.')))).toBe(true);
    expect(await visible(page, '#btnCreerProduction'), 'elle existe : « Fermer » seul').toBe(false);
    expect(await visible(page, '#btnDupliquerProduction')).toBe(true);

    // Elle existe : fermer ne pose plus de question.
    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page)).toBe('');
});

test('(P-b bis) « Quitter sans créer » n\'écrit rien ; ouvrir une autre production pose la question', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const nb = (await productions(page)).length;
    await cliquer(page, '[data-action="creerNouvelleProduction"]');
    await changer(page, '#productionTitre', 'Brouillon fictif banc E3');
    await page.locator('#menuProductions').selectOption({ index: 1 });   // #1147 : choisir dans le menu de la sélection
    expect(await questionOuverte(page)).toBe('Cette production n\'est pas encore créée.');
    await repondre(page, 'Quitter sans créer');
    expect((await productions(page)).length).toBe(nb);
    expect(await visible(page, '#btnCreerProduction'), 'l\'autre production s\'est ouverte').toBe(false);
});

test('(P-c) un échec d\'écriture : « Non enregistré – Modifier la production : … », aucun succès', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await ouvrirProductionEvaluee(page);
    await page.evaluate(() => {
        window.__toasts = [];
        document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes')?.classList.remove('visible');
        db._setIndexedDB = () => Promise.reject(new Error('panne simulée par le banc E3'));
        db._setLocalStorage = () => { throw new Error('panne simulée par le banc E3'); };
    });
    await changer(page, '#productionActivite', 'Ne doit pas s\'écrire');
    expect(await temoinEchec(page)).toMatch(/^Non enregistré – Modifier la production : /);
    expect(await temoinSucces(page), 'aucun « Enregistré »').toBe(false);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
});

test('(P-d) un nom vidé : « Non enregistré – Modifier la production : le nom de la production est requis. »', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const id = await ouvrirProductionEvaluee(page);
    const titre = (await productions(page)).find(p => p.id === id).titre;
    await changer(page, '#productionTitre', '');
    expect(await temoinEchec(page)).toBe('Non enregistré – Modifier la production : le nom de la production est requis.');
    expect((await productions(page)).find(p => p.id === id).titre).toBe(titre);
});

/* ────────────────────────────────────────────────────────────── interventions */
//   (I-a) une intervention COMPLÉTÉE modifiée : écrite sans bouton, AUCUNE présence écrite (empreinte) ;
//   (I-b) le passage à « Complétée » : la question ; « Annuler » n'écrit rien ; « Marquer complétée » reporte ;
//   (I-c) une nouvelle intervention n'existe pas avant « Créer l'intervention » ; « Fermer » pose la question ;
//   (I-d) changer de sous-onglet puis revenir : la création en cours est toujours là.

const interventions = (page) => page.evaluate(() => JSON.parse(JSON.stringify(db.getSync(cle('interventions'), []) || [])));
const empreintePresences = (page) => page.evaluate(() => JSON.stringify(db.getSync(cle('presences'), []) || []));

async function ouvrirInterventions(page, stock) {
    await ouvrirDemo(page);
    if (stock) await page.evaluate((stock) => { db.setSync(cle('interventions'), stock); }, stock);
    await page.evaluate(() => naviguerVers('suivi', 'interventions'));
    await pause(page, 900);
}

async function uneIntervention(page, extra) {
    return page.evaluate((extra) => {
        const e = (obtenirEtudiantsCoursActif() || [])[0];
        return Object.assign({ id: 'INT-E3', titre: 'Rattrapage fictif banc E3', date: '2026-09-10', heure: '', duree: 2, type: 'groupe', niveauRai: 2,
            contexte: 'en-classe', description: '', etudiants: [e.da], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [],
            objectifVise: '', bilan: null, statut: 'en-cours', groupeCoursId: obtenirIdContexteActif() }, extra);
    }, extra || {});
}

test('(I-a) intervention complétée modifiée : écrite sans bouton, aucune présence écrite', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const stock = [await uneIntervention(page, { statut: 'completee' })];
    await page.evaluate((stock) => { db.setSync(cle('interventions'), stock); }, stock);
    await page.evaluate(() => naviguerVers('suivi', 'interventions'));
    await pause(page, 900);
    await page.evaluate(() => ouvrirIntervention('INT-E3'));
    await pause(page, 700);
    const avant = await empreintePresences(page);
    await page.evaluate(() => { window.__toasts = []; });
    await changer(page, '#interventionDate', '2026-09-11');
    await changer(page, '#observationsIntervention', 'Observation fictive banc E3');
    const i = (await interventions(page)).find(x => x.id === 'INT-E3');
    expect(i).toMatchObject({ date: '2026-09-11', observations: 'Observation fictive banc E3', statut: 'completee' });
    expect(await temoinSucces(page)).toBe(true);
    expect(await empreintePresences(page), 'aucune présence écrite par une modification').toBe(avant);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
    expect(await questionOuverte(page)).toBe('');
});

test('(I-b) passage à « Complétée » : la question et sa case DÉCOCHÉE ; « Annuler » n\'écrit rien ; sans la case, aucune présence ; cochée, le report', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const stock = [await uneIntervention(page)];
    await page.evaluate((stock) => { db.setSync(cle('interventions'), stock); }, stock);
    await page.evaluate(() => naviguerVers('suivi', 'interventions'));
    await pause(page, 900);
    await page.evaluate(() => ouvrirIntervention('INT-E3'));
    await pause(page, 700);
    const avant = await empreintePresences(page);
    const laCase = () => page.evaluate(() => {
        const c = document.querySelector('#overlay-ui-dialogue input[type="checkbox"]');
        return c ? { coche: c.checked, texte: c.parentElement.textContent.trim() } : null;
    });

    // (1) « Annuler » : rien d'écrit, le statut revient.
    await changer(page, 'input[name="interventionStatut"][value="completee"]', true);
    expect(await questionOuverte(page)).toBe('Marquer cette intervention complétée ?');
    expect(await laCase()).toEqual({ coche: false, texte: 'Reporter les présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours.' });
    await repondre(page, 'Annuler');
    expect((await interventions(page))[0].statut).toBe('en-cours');
    expect(await empreintePresences(page)).toBe(avant);
    expect(await page.evaluate(() => document.querySelector('input[name="interventionStatut"][value="en-cours"]').checked)).toBe(true);

    // (2) « Marquer complétée » sans toucher la case : complétée, AUCUNE présence.
    await changer(page, 'input[name="interventionStatut"][value="completee"]', true);
    await repondre(page, 'Marquer complétée');
    await pause(page, 500);
    expect((await interventions(page))[0].statut).toBe('completee');
    expect(await empreintePresences(page), 'case décochée : rien dans les présences').toBe(avant);
    expect(await visible(page, '#observationsBilan'), 'le bilan paraît').toBe(true);

    // (3) De retour « En préparation », puis complétée case COCHÉE : le report, une fois.
    await changer(page, 'input[name="interventionStatut"][value="en-cours"]', true);
    await pause(page, 400);
    await changer(page, 'input[name="interventionStatut"][value="completee"]', true);
    await page.evaluate(() => { document.querySelector('#overlay-ui-dialogue input[type="checkbox"]').click(); });
    await repondre(page, 'Marquer complétée');
    await pause(page, 500);
    const da = stock[0].etudiants[0];
    const reportees = await page.evaluate(({ da }) => (db.getSync(cle('presences'), []) || []).filter(p => p.da === da && p.date === '2026-09-10' && p.facultatif), { da });
    expect(reportees.length, 'case cochée : le report a eu lieu, une fois').toBe(1);
});

test('(I-c) nouvelle intervention : rien avant « Créer l\'intervention » ; « Fermer » pose la question', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirInterventions(page, []);
    await cliquer(page, '[data-action="afficherFormulaireIntervention"]');
    await changer(page, '#interventionTitre', 'Atelier fictif banc E3');
    expect(await interventions(page)).toEqual([]);
    await cliquer(page, '[data-action="fermerFicheIntervention"]');
    expect(await questionOuverte(page)).toBe('Cette intervention n\'est pas encore créée.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('interventionTitre').value)).toBe('Atelier fictif banc E3');
    expect(await interventions(page)).toEqual([]);

    await page.evaluate(() => { window.__toasts = []; });
    const n = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action="sauvegarderPresencesIntervention"]')].find(x => x.textContent.trim() === 'Créer l\'intervention'); if (!b) return 0; b.click(); return 1; });
    expect(n, 'bouton « Créer l\'intervention »').toBe(1);
    await pause(page, 700);
    const liste = await interventions(page);
    expect(liste.map(i => i.titre)).toEqual(['Atelier fictif banc E3']);
    expect(await page.evaluate(() => window.__toasts.some(t => t.includes('Intervention créée.')))).toBe(true);
    expect(await page.evaluate(() => [...document.querySelectorAll('[data-action="sauvegarderPresencesIntervention"]')].length), 'elle existe : « Fermer » seul').toBe(0);
    await cliquer(page, '[data-action="fermerFicheIntervention"]');
    expect(await questionOuverte(page)).toBe('');
});

test('(I-d) changer de sous-onglet puis revenir : la création en cours est toujours là, rien d\'écrit', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirInterventions(page, []);
    await cliquer(page, '[data-action="afficherFormulaireIntervention"]');
    await changer(page, '#interventionTitre', 'Brouillon fictif banc E3');
    await page.evaluate(() => naviguerVers('suivi', 'liste'));
    await pause(page, 700);
    await page.evaluate(() => naviguerVers('suivi', 'interventions'));
    await pause(page, 900);
    expect(await page.evaluate(() => document.getElementById('interventionTitre')?.value)).toBe('Brouillon fictif banc E3');
    expect(await interventions(page)).toEqual([]);
});

/* ─────────────────────────────────────────────────────────────── volet confidentiel */
//   (C-a) un champ du volet s'écrit sans bouton, le témoin le dit ; « Fermer » redessine le profil (la pastille) ;
//   (C-b) en anonymisation, le volet est masqué et RIEN ne s'écrit depuis lui, même un changement forcé.

const confidentiel = (page) => page.evaluate(() => JSON.stringify(db.getSync(cle('confidentielEtudiants'), {}) || {}));

async function ouvrirVolet(page) {
    const da = await page.evaluate(() => (obtenirEtudiantsCoursActif() || [])[0].da);
    await page.evaluate((da) => {
        db.setSync(cle('confidentielEtudiants'), {});
        naviguerVers('suivi', 'profil');
        window.afficherProfilComplet(da);
        window.changerSectionProfil('accompagnement');
    }, da);
    await pause(page, 700);
    await page.evaluate((da) => window.ouvrirModalConfidentiel(da), da);
    await pause(page, 400);
    return da;
}
const pastille = (page) => page.evaluate(() => {
    const b = document.querySelector('[data-action="ouvrirModalConfidentiel"]');
    return b ? b.textContent.includes('●') : null;
});

test('(C-a) volet confidentiel : un champ s\'écrit sans bouton ; « Fermer » redessine la pastille', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const da = await ouvrirVolet(page);
    expect(await pastille(page), 'aucune information au départ').toBe(false);
    expect(await page.locator('#modalConfidentiel button', { hasText: 'Enregistrer' }).count()).toBe(0);
    await changer(page, '#confidentiel-notes', 'Note confidentielle fictive banc E3');
    expect(JSON.parse(await confidentiel(page))[da].notes).toBe('Note confidentielle fictive banc E3');
    expect(await temoinSucces(page)).toBe(true);
    await changer(page, '#confidentiel-defi-fls', true);
    expect(JSON.parse(await confidentiel(page))[da]).toMatchObject({ notes: 'Note confidentielle fictive banc E3', defiFLS: true });
    await cliquer(page, '#modalConfidentiel .btn-annuler[data-action="fermerModalConfidentiel"]');
    expect(await page.evaluate(() => document.getElementById('modalConfidentiel').classList.contains('actif'))).toBe(false);
    expect(await pastille(page), 'le profil redessiné montre la pastille').toBe(true);
});

test('(C-b) anonymisation : le volet est masqué et rien ne s\'écrit depuis lui', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.evaluate(async () => { await changerMode('anonymisation'); });
    await pause(page, 800);
    await ouvrirVolet(page);
    expect(await visible(page, '#confidentiel-champs')).toBe(false);
    const avant = await confidentiel(page);
    // Un changement forcé sur un champ masqué (aucun geste ne peut l'atteindre, un script si).
    await changer(page, '#confidentiel-notes', 'écrit depuis un volet masqué');
    await changer(page, '#confidentiel-epgc', true);
    expect(await confidentiel(page)).toBe(avant);
    expect(await page.evaluate(() => window.sauvegarderConfidentiel())).toBe(false);
    expect(await confidentiel(page)).toBe(avant);
});

/* ────────────────────────────────────────────────────────────── réglages */
//   (R-a) des seuils mal ordonnés : « Non enregistré – Seuils : … », les champs reviennent, rien d'écrit, aucun succès ;
//   (R-b) une préférence changée : écrite, le témoin dit « Enregistré » ; plus aucun bouton « Enregistrer ».

test('(R-a) seuils mal ordonnés : « Non enregistré – Seuils : … », les champs reviennent, aucun succès', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('labo', 'accompagnement'));
    await pause(page, 900);
    const avant = await page.evaluate(() => JSON.stringify(db.getSync('seuilsInterpretation', null)));
    const valeurs = await page.evaluate(() => ['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon'].map(id => document.getElementById(id).value));
    await page.evaluate(() => { window.__toasts = []; });
    await changer(page, '#v2-seuil-fragile', String(Number(valeurs[1]) + 1));   // au-dessus du palier suivant
    expect(await temoinEchec(page)).toBe('Non enregistré – Seuils : les seuils doivent aller du plus bas au plus haut (Fragile < Acceptable < Bon).');
    expect(await temoinSucces(page)).toBe(false);
    expect(await page.evaluate(() => ['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon'].map(id => document.getElementById(id).value))).toEqual(valeurs);
    expect(await page.evaluate(() => JSON.stringify(db.getSync('seuilsInterpretation', null)))).toBe(avant);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
    // Une valeur juste ensuite : écrite, et le « Non enregistré » s'efface (même clé).
    await changer(page, '#v2-seuil-fragile', String(Number(valeurs[0]) - 1));
    expect(await temoinEchec(page)).toBe('');
    expect(await page.evaluate(() => db.getSync('seuilsInterpretation', {}).interpretation.acceptable)).toBe((Number(valeurs[0]) - 1) / 100);
});

test('(R-b) une préférence changée s\'écrit, le témoin le dit ; aucun bouton « Enregistrer » sur les deux pages', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('reglages', 'preferences'));
    await pause(page, 900);
    const avant = await page.evaluate(() => obtenirPreference('chronoEvaluation'));
    await changer(page, '#v2-pref-chrono-eval', !avant);
    expect(await page.evaluate(() => obtenirPreference('chronoEvaluation'))).toBe(!avant);
    expect(await temoinSucces(page)).toBe(true);
    for (const page_ of ['#reglages-preferences', '#labo-accompagnement']) {
        expect(await page.locator(page_ + ' button', { hasText: /^\s*Enregistrer\s*$/ }).count(), page_).toBe(0);
    }
});

/* ────────────────────────────────────────────────────────── bilan réflexif */
//   (B-a) l'auto-réflexion n'a plus de bouton « Enregistrer » ; un geste s'écrit, le témoin le dit.

test('(B-a) auto-réflexion : plus de bouton « Enregistrer » ; un geste s\'écrit, le témoin le dit', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => { window.initialiserBilanReflexif(); BilanReflexif.afficherVue('reflexion'); });
    await pause(page, 600);
    const vue = await page.evaluate(() => {
        const racine = document.getElementById('bilan-conteneur-principal') || document.body;
        return { html: racine.innerHTML, boutons: [...racine.querySelectorAll('button')].map(b => b.textContent.trim()) };
    });
    expect(vue.html).toContain('Avant les r');
    expect(vue.boutons).not.toContain('Enregistrer');
    expect(vue.html).not.toContain('sauvegarderReflexionExplicite');
    await cliquer(page, '[data-action="BilanReflexif.changerEtatReflexion"][data-param="apres_resultats"]');
    expect(await page.evaluate(() => (db.getSync(cle('autoreflexionBilan'), {}) || {}).etat)).toBe('apres_resultats');
    expect(await temoinSucces(page)).toBe(true);
});

/* ─────────────────────────────────────────────────────────────── placement */
//   Les boutons renommés à 360, 768, 1024 et 1180 px : visibles, dans l'écran, hors du témoin.

const mesurerBoutons = (page, selecteurs) => page.evaluate((selecteurs) => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { g: b.left, d: b.right, h: b.top, b: b.bottom, l: b.width }; };
    const out = {};
    for (const [nom, s] of Object.entries(selecteurs)) out[nom] = r(document.querySelector(s));
    out.__temoin = r(document.querySelector('#temoin-enregistrement .visible'));
    out.__largeur = document.documentElement.clientWidth;
    return out;
}, selecteurs);
const chevauche = (a, b) => !!(a && b && a.g < b.d && b.g < a.d && a.h < b.b && b.h < a.b);

async function verifierPlacement(page, largeur, selecteurs, preparer) {
    await page.setViewportSize({ width: largeur, height: 900 });
    await preparer();
    await pause(page, 500);
    await page.evaluate((s) => { document.querySelector(s)?.scrollIntoView({ block: 'center' }); }, Object.values(selecteurs)[0]);
    await pause(page, 300);
    await page.evaluate(() => window.temoinEnregistrement.enregistre('banc'));
    const m = await mesurerBoutons(page, selecteurs);
    for (const nom of Object.keys(selecteurs)) {
        const b = m[nom];
        expect(b && b.l > 0, `${largeur} px : « ${nom} » visible`).toBe(true);
        expect(b.g >= 0 && b.d <= m.__largeur, `${largeur} px : « ${nom} » dans l'écran`).toBe(true);
        expect(chevauche(b, m.__temoin), `${largeur} px : « ${nom} » sous le témoin`).toBe(false);
    }
    await page.evaluate(() => { window.temoinEnregistrement.fermer(); });
}

test('placement : « Fermer » et « Créer la production » / « Créer l\'intervention », « Fermer » du volet, à quatre largeurs', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirDemo(page);
    const da = await page.evaluate(() => (obtenirEtudiantsCoursActif() || [])[0].da);
    for (const largeur of [360, 768, 1024, 1180]) {
        await verifierPlacement(page, largeur,
            { 'Fermer (production)': '[data-action="fermerFicheProduction"]', 'Créer la production': '#btnCreerProduction' },
            async () => { await page.evaluate(async () => { naviguerVers('conception', 'productions'); await window.creerNouvelleProduction(); }); });
        await verifierPlacement(page, largeur,
            { 'Fermer (intervention)': '[data-action="fermerFicheIntervention"]', 'Créer l\'intervention': '.actions-fiche-intervention [data-action="sauvegarderPresencesIntervention"]' },
            async () => { await page.evaluate(async () => {
                naviguerVers('suivi', 'interventions');
                // Une création laissée par le tour précédent : on la ferme sans question (rien de saisi).
                afficherFormulaireIntervention();
            }); });
        await verifierPlacement(page, largeur,
            { 'Fermer (volet)': '#modalConfidentiel .btn-annuler[data-action="fermerModalConfidentiel"]' },
            async () => { await page.evaluate((da) => { naviguerVers('suivi', 'profil'); window.afficherProfilComplet(da); window.ouvrirModalConfidentiel(da); }, da); });
        await page.evaluate(() => window.fermerModalConfidentiel());
    }
});
