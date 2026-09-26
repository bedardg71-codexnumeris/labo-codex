import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT A DE L'ENREGISTREMENT — EN ANONYMISATION, ON TRAVAILLE NORMALEMENT (26 sept. 2026)
// =======================================================================
//
// Décision D5 de Grégoire (« Je choisis A ») : en anonymisation, tout s'enregistre ; seul
// l'affichage protège l'identité des élèves (« captures d'écran pour Claude ou démos live avec
// mes vraies données »). Deux exigences :
//   1. rien ne se perd — mesuré avant le lot : une évaluation faite en anonymisation paraissait
//      enregistrée, puis disparaissait au rechargement, sans message ; « Enregistrer » des
//      présences refusait ;
//   2. rien d'identifiant ne s'affiche, et aucune valeur de substitution (« Élève 3 », « Gr. A »)
//      n'est écrite dans les vraies données.
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://). Noms fictifs :
// le pack démo (écrivains et savants) et « Daniel Témoin ».

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

async function packDemo(page) {
    await viderLeStockage(page);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(1200);
}

const ANONYMISATION = (page) => page.evaluate(async () => { await changerMode('anonymisation'); });

// Semis et séquence d'ouverture : ceux des specs #699 / #882 (copie déjà évaluée, rouverte),
// ouverte EN ANONYMISATION.
async function ouvrirEvaluationTemoin(page, integrite = { statut: 'recevable', notes: '' }) {
    await viderLeStockage(page);
    await page.waitForFunction(() => typeof window.demarrerEvaluationDepuisFichier === 'function' && typeof window.db !== 'undefined');

    await page.evaluate(async (integrite) => {
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
            echelleId: 'E699', cartoucheId: '', statutRemise: 'evalue', statutIntegrite: integrite.statut, notesIntegrite: integrite.notes,
            dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
            optionsAffichage: { description: true, objectif: true, tache: true, adresse: false, contexte: true, affichageNote: 'complet' },
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 50 },
                { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', retroaction: '', ponderation: 30 },
                { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', retroaction: '', ponderation: 20 }
            ],
            noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', retroactionFinale: '',
            donneesAlgorithmiques: {}, pointsAnalytiques: {}
        }]);
        await window.changerMode('anonymisation');

        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        window.demarrerEvaluationDepuisFichier({ id: 'F699', etudiantDA: '1234567', productionId: 'P699', nomFichier: 'copie.pdf' });
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P699';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
    }, integrite);
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV699'
        && window._autoSaveSuspendu === false, null, { timeout: 10000 });
}

// -----------------------------------------------------------------------
// (a) + (c) — L'ÉVALUATION : elle survit au rechargement, sans « Élève N » ni « Gr. A » en base
// -----------------------------------------------------------------------
test('(a)(c) une évaluation modifiée en anonymisation est encore là après rechargement, sans substitution écrite', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirEvaluationTemoin(page);
    await page.waitForFunction(() => (document.getElementById('eval_c3') || {}).value === 'I', null, { timeout: 10000 });
    await page.waitForFunction(() => document.getElementById('afficherAdresse1').checked === false, null, { timeout: 10000 });
    await page.evaluate(() => window.attacherEvenementsMemorisation());

    // LES GESTES : cocher « Adresse » (la rétroaction commence alors par « Bonjour ‹prénom› ! »),
    // puis Langue passe de I à M.
    await page.evaluate(() => document.getElementById('afficherAdresse1').click());
    await page.evaluate(() => { document.getElementById('eval_c3').value = 'M'; window.niveauSelectionne('c3'); });
    // Témoin : l'écran montre le pseudonyme, jamais le prénom.
    const ecran = await page.evaluate(() => document.getElementById('retroactionFinale1').value);
    expect(ecran).toMatch(/Bonjour Élève \d+ !/);
    expect(ecran).not.toContain('Daniel');

    await page.waitForFunction(() => {
        const ev = (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699');
        return ev && ev.criteres.find(c => c.critereId === 'c3').niveauSelectionne === 'M' && /Bonjour/.test(ev.retroactionFinale || '');
    }, null, { timeout: 8000 });
    await page.evaluate(async () => { await window.db.flush(); });

    // (a) LE RECHARGEMENT — avant le lot, l'évaluation revenait à I : l'écriture avait été refusée.
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.cle === 'function'
        && typeof window.demarrerEvaluationDepuisFichier === 'function', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const base = await page.evaluate(() => (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699'));
    expect(base, 'l\'évaluation doit être en base après rechargement').toBeTruthy();
    expect(base.criteres.find(c => c.critereId === 'c3').niveauSelectionne).toBe('M');

    // (c) Ce qui est écrit, ce sont les vraies valeurs.
    expect(base.retroactionFinale).toContain('Bonjour Daniel !');
    expect(JSON.stringify(base)).not.toMatch(/Élève \d+|Gr\. [A-Z]|ANONYME|etudiantDAReel|etudiantDAffichage/);
    expect(base.etudiantNom).toBe('Daniel Témoin');
    expect(base.groupe).toBe('00007');
    expect(erreurs).toEqual([]);
});

// -----------------------------------------------------------------------
// R4 (relecture croisée) — LES NOTES D'INTÉGRITÉ : masquées, et « Enregistrer » ne les efface pas
// -----------------------------------------------------------------------
test('R4 notes d\'intégrité en anonymisation : masquées à l\'écran, gardées en base à l\'enregistrement', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    const NOTES = 'Passages repris de la copie de Curie';
    await ouvrirEvaluationTemoin(page, { statut: 'ia', notes: NOTES });
    // Le statut d'intégrité se recharge par « Modifier » (Liste des évaluations), pas par la copie.
    await page.evaluate(() => window.modifierEvaluation('EV699'));
    await page.waitForFunction(() => (document.getElementById('statutIntegrite') || {}).value === 'ia', null, { timeout: 10000 });
    await page.waitForTimeout(800);
    const champ = await page.evaluate(() => {
        const c = document.getElementById('notesIntegrite');
        return { valeur: c.value, desactive: c.disabled, placeholder: c.placeholder,
            visible: !document.getElementById('divNotesIntegrite').classList.contains('u-hide') };
    });
    expect(champ).toEqual({ valeur: '', desactive: true, placeholder: 'Masqué en anonymisation', visible: true });

    await page.evaluate(() => window.sauvegarderEvaluationModifiee());
    await page.waitForTimeout(600);
    const base = await page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699'));
    expect(base.statutIntegrite).toBe('ia');
    expect(base.notesIntegrite).toBe(NOTES);
});

// -----------------------------------------------------------------------
// (b) + (c) + (d) — LES PRÉSENCES : « Enregistrer » écrit ; DA et notes masqués ; la note garde sa valeur
// -----------------------------------------------------------------------
test('(b)(c)(d) présences en anonymisation : « Enregistrer » écrit, le DA et la note sont masqués, la note n\'est pas effacée', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await packDemo(page);
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await expect(page.locator('#tbody-saisie-presences input[id^="periodes_"]').first()).toBeAttached({ timeout: 8000 });

    // Témoin en mode normal : une note posée sur DEMO004, visible, avec son DA.
    const NOTE = 'Rencontre prévue avec Césaire';
    await page.evaluate((note) => {
        document.getElementById('notes_DEMO004').value = note;
        window.enregistrerPresences();
    }, NOTE);
    const temoin = await page.evaluate(() => ({
        note: document.getElementById('notes_DEMO004').value,
        texte: document.getElementById('tbody-saisie-presences').textContent
    }));
    expect(temoin.note).toBe(NOTE);
    expect(temoin.texte).toContain('DEMO004');

    await ANONYMISATION(page);
    await page.evaluate(() => window.initialiserSaisiePresences());
    await page.waitForTimeout(500);

    // (d) Rien d'identifiant : ni DA, ni note, ni nom réel.
    const anonyme = await page.evaluate(() => {
        const champ = document.getElementById('notes_DEMO004');
        return { valeur: champ.value, desactive: champ.disabled, placeholder: champ.placeholder,
            texte: document.getElementById('tbody-saisie-presences').textContent };
    });
    expect(anonyme.valeur).toBe('');
    expect(anonyme.desactive).toBe(true);
    expect(anonyme.placeholder).toBe('Masqué en anonymisation');
    expect(anonyme.texte).not.toContain('DEMO004');
    expect(anonyme.texte).not.toContain('Césaire');

    // (b) Le geste : DEMO006 absent, « Enregistrer ».
    const date = await page.evaluate(() => {
        document.getElementById('periodes_DEMO006').value = '0';
        window.enregistrerPresences();
        return document.getElementById('date-cours').value;
    });
    const ecrit = await page.evaluate((d) => (window.db.getSync(cle('presences'), []) || []).filter(p => p.date === d), date);
    const p5 = ecrit.find(p => p.da === 'DEMO006');
    const p4 = ecrit.find(p => p.da === 'DEMO004');
    expect(p5, 'la présence de DEMO006 doit être écrite').toBeTruthy();
    expect(p5.periodesPresentes).toBe(0);
    // (c) La note masquée n'est pas effacée, et aucun champ de l'anonymisation n'est écrit.
    expect(p4.notes).toBe(NOTE);
    expect(JSON.stringify(ecrit)).not.toMatch(/Élève \d+|ANONYME|daReel|daAffichage|"prenom"|"nom"/);
});

// -----------------------------------------------------------------------
// (c) + (d) — L'INTERVENTION : textes libres masqués, et « Enregistrer » ne les efface pas
// -----------------------------------------------------------------------
test('(c)(d) intervention en anonymisation : description, observations et notes masquées ; l\'enregistrement les garde', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await packDemo(page);
    const TEXTES = { description: 'Atelier pour Curie et Kahlo', observations: 'Curie a bien réagi', note: 'Kahlo : revoir la thèse', bilan: 'Suivi avec Curie' };
    await page.evaluate((t) => {
        const gc = typeof obtenirIdContexteActif === 'function' ? obtenirIdContexteActif() : null;
        // security-ok: fixture littérale du banc.
        db.setSync(cle('interventions'), [{
            id: 'INT-A', date: '2026-09-10', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'en-classe',
            titre: 'Atelier thèse', description: t.description, seanceConcernee: null, marquerNonParticipantsMotives: false,
            etudiants: ['DEMO004'], analyse: null, criteresCibles: [], objectifVise: '', observations: t.observations,
            notesIndividuelles: { DEMO004: t.note }, bilan: { atteint: null, suite: null, observationsBilan: t.bilan },
            groupeCoursId: gc, statut: 'completee', dateCreation: '2026-09-10T10:00:00.000Z', dateModification: '2026-09-10T10:00:00.000Z'
        }]);
    }, TEXTES);
    await page.evaluate(() => naviguerVers('suivi', 'interventions'));
    await page.waitForTimeout(600);

    // Témoin en mode normal : les textes sont à l'écran.
    await page.evaluate(() => window.ouvrirIntervention('INT-A'));
    await page.waitForTimeout(400);
    expect(await page.locator('#interventionDescription').inputValue()).toBe(TEXTES.description);

    await ANONYMISATION(page);
    await page.evaluate(() => window.ouvrirIntervention('INT-A'));
    await page.waitForTimeout(400);
    const ecran = await page.evaluate(() => document.getElementById('conteneurPrincipal').innerText + ' '
        + [...document.querySelectorAll('#conteneurPrincipal textarea')].map(t => t.value).join(' '));
    for (const texte of Object.values(TEXTES)) expect(ecran).not.toContain(texte);
    // R4 : le titre (texte libre) aussi — titre générique daté, champ masqué.
    expect(ecran).not.toContain('Atelier thèse');
    expect(ecran).toContain('Intervention du 10 septembre');
    await expect(page.locator('#interventionTitre')).toBeDisabled();
    for (const id of ['#interventionDescription', '#observationsIntervention', '#note-DEMO004', '#observationsBilan']) {
        await expect(page.locator(id)).toBeDisabled();
        await expect(page.locator(id)).toHaveAttribute('placeholder', 'Masqué en anonymisation');
    }

    await page.evaluate(() => window.sauvegarderPresencesIntervention('INT-A'));
    await page.waitForTimeout(400);
    const ecrite = await page.evaluate(() => (db.getSync(cle('interventions'), []) || []).find(i => i.id === 'INT-A'));
    expect(ecrite.description).toBe(TEXTES.description);
    expect(ecrite.observations).toBe(TEXTES.observations);
    expect(ecrite.notesIndividuelles.DEMO004).toBe(TEXTES.note);
    expect(ecrite.bilan.observationsBilan).toBe(TEXTES.bilan);
    expect(ecrite.titre).toBe('Atelier thèse');
});

// -----------------------------------------------------------------------
// (c) — LA FICHE D'ÉLÈVE : l'identité masquée n'est pas réécrite, le reste s'enregistre
// -----------------------------------------------------------------------
test('(c) fiche d\'élève en anonymisation : « Enregistrer les modifications » garde DA, nom et prénom réels', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await packDemo(page);
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await expect(page.locator('#v2-listeEtudiants tbody tr').first()).toBeAttached({ timeout: 5000 });
    const avant = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e.da === 'DEMO004'));

    await ANONYMISATION(page);
    await page.waitForTimeout(500);
    await page.locator('#v2-listeEtudiants select[data-da="DEMO004"]').first().selectOption('editer');
    await page.waitForTimeout(400);
    await page.locator('#v2-etudiantProgramme').fill('Arts, lettres et communication');
    await page.evaluate(() => window.soumettreEtudiantV2());
    await page.waitForTimeout(600);

    const apres = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e.da === 'DEMO004'));
    expect(apres, 'la fiche doit rester sous son DA').toBeTruthy();
    expect(apres.programme).toBe('Arts, lettres et communication');
    // Le groupe n'est pas comparé : l'écriture le normalise (« demo » → « 0demo », L-9 #749, comme en
    // mode normal). Qu'il ne soit pas « Gr. X » est vérifié juste en dessous.
    expect({ da: apres.da, nom: apres.nom, prenom: apres.prenom })
        .toEqual({ da: avant.da, nom: avant.nom, prenom: avant.prenom });
    expect(JSON.stringify(apres)).not.toMatch(/Élève \d+|Gr\. [A-Z]|ANONYME|daReel|groupeReel/);
    // Le message nomme le pseudonyme, pas l'élève.
    await expect(page.getByText(/Élève \d+ modifié/)).toBeVisible();
});

// -----------------------------------------------------------------------
// (d) — LE VOLET CONFIDENTIEL : visible en mode normal (témoin), masqué en anonymisation
// -----------------------------------------------------------------------
test('(d) volet confidentiel : ses notes s\'affichent en mode normal, rien ne s\'affiche en anonymisation', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await packDemo(page);
    const NOTE = 'Suivi médical, voir avec Césaire';
    const NOTE_PRESENCE = 'Absent : rendez-vous';
    await page.evaluate(({ note, notePresence }) => {
        // security-ok: fixtures littérales du banc.
        db.setSync(cle('confidentielEtudiants'), { DEMO004: { notes: note, defiFLS: true } });
        const presences = db.getSync(cle('presences'), []) || [];
        presences.push({ date: '2026-09-02', da: 'DEMO004', periodesPresentes: 0, notes: notePresence });
        db.setSync(cle('presences'), presences);
    }, { note: NOTE, notePresence: NOTE_PRESENCE });

    const lireVolet = () => page.evaluate(() => {
        window.ouvrirModalConfidentiel('DEMO004');
        const modal = document.getElementById('modalConfidentiel');
        const valeurs = [...modal.querySelectorAll('textarea, input[type="text"]')].map(c => c.value).join(' ');
        const r = { texte: modal.innerText + ' ' + valeurs, fls: document.getElementById('confidentiel-defi-fls').checked };
        window.fermerModalConfidentiel();
        return r;
    });

    // R2 : la pastille verte du bouton « Confidentiel » (témoin en mode normal).
    const pastille = () => page.evaluate(() => {
        naviguerVers('suivi', 'profil');
        window.afficherProfilComplet('DEMO004');
        window.changerSectionProfil('accompagnement');
        const bouton = document.querySelector('[data-action="ouvrirModalConfidentiel"]');
        return bouton ? bouton.textContent.includes('\u25CF') : null;
    });
    expect(await pastille()).toBe(true);

    const normal = await lireVolet();
    expect(normal.texte).toContain(NOTE);                 // témoin
    expect(normal.texte).toContain(NOTE_PRESENCE);
    expect(normal.fls).toBe(true);

    await ANONYMISATION(page);
    const anonyme = await lireVolet();
    expect(anonyme.texte).not.toContain(NOTE);
    expect(anonyme.texte).not.toContain(NOTE_PRESENCE);
    expect(anonyme.texte).toContain('Masqué en anonymisation');
    expect(anonyme.fls).toBe(false);
    await expect(page.locator('#confidentiel-btn-enregistrer')).toBeHidden();
    expect(await pastille(), 'R2 : pas de pastille en anonymisation').toBe(false);
});

// -----------------------------------------------------------------------
// R5 (relecture croisée) — PRÉSENCES PAR SOUS-GROUPE : la bascule de mode ne vide plus la séance
// -----------------------------------------------------------------------
// Mesuré avant le correctif : le menu des sous-groupes, rempli au démarrage seulement, gardait
// les vrais numéros pendant que la liste passait à « Gr. A » ; le tableau tombait à zéro ligne,
// « Verrouiller » n'écrivait rien sans un mot, et la préférence « Gr. B » s'écrivait en base.
test('R5 présences par sous-groupe : après la bascule en anonymisation, la séance garde ses élèves et « Verrouiller » écrit', async ({ page }) => {
    test.setTimeout(90000);
    brancherEcouteurs(page);
    await packDemo(page);
    await page.evaluate(() => {
        // Deux sous-groupes dans le même cours (« mode cours », tous les groupes fusionnés).
        const k = cle('groupeEtudiants');
        const c = obtenirCoursActifId();
        const liste = db.getSync(k, []);
        liste.forEach((e, i) => { e.coursId = c; if (i % 2) e.groupe = '00002'; });
        // security-ok: fixture du banc, dérivée du pack démo.
        db.setSync(k, liste);
        const info = db.getSync('infoCours', {});
        info._modeCours = true;
        // security-ok: fixture du banc.
        db.setSync('infoCours', info);
    });
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await page.evaluate(() => { window.chargerGroupesPresences(); window.initialiserSaisiePresences(); });
    await page.waitForTimeout(800);
    const lignes = () => page.evaluate(() => document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]').length);
    expect(await lignes()).toBe(10);

    // Le sous-groupe « 00002 », puis la bascule par le bouton de l'en-tête.
    await page.evaluate(() => { const s = document.getElementById('selectGroupePresences'); s.value = '00002'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(500);
    expect(await lignes()).toBe(5);
    await page.evaluate(async () => { await basculerModeAnonymisation(); });
    await page.waitForTimeout(800);
    expect(await lignes(), 'la séance doit garder les cinq élèves du sous-groupe').toBe(5);

    // « Verrouiller » écrit la séance du sous-groupe (période 0 posée sur le premier élève affiché).
    const r = await page.evaluate(() => {
        const champ = document.querySelector('#tbody-saisie-presences input[id^="periodes_"]');
        const da = champ.id.slice('periodes_'.length);
        champ.value = '0';
        const date = document.getElementById('date-cours').value;
        basculerVerrouillageDateActive();
        const p = (db.getSync(cle('presences'), []) || []).find(x => x.date === date && x.da === da);
        basculerVerrouillageDateActive();
        return { periodes: p ? p.periodesPresentes : null, pref: db.getSync(cle('presences_groupe'), null) };
    });
    expect(r.periodes).toBe(0);

    // Le menu, rempli en anonymisation : libellés anonymisés, valeurs et préférence réelles.
    await page.evaluate(() => { window.chargerGroupesPresences(); });
    const menu = await page.evaluate(() => {
        const s = document.getElementById('selectGroupePresences');
        s.value = '00002';
        s.dispatchEvent(new Event('change', { bubbles: true }));
        return { libelles: [...s.options].map(o => o.textContent), pref: db.getSync(cle('presences_groupe'), null) };
    });
    expect(menu.libelles.join(' ')).toMatch(/Gr\. [A-Z]/);
    expect(menu.libelles.join(' ')).not.toContain('00002');
    expect(menu.pref).toBe('00002');
});
