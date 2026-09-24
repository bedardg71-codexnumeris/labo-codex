import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// AUDIT — LE PARCOURS D'UN·E ENSEIGNANT·E EN SOMMATIVE TRADITIONNELLE : CE QUE SON ÉLÈVE REÇOIT (WebKit).
// Rapport : Rapports/AUDIT-parcours-sommatif-2026-09-24.md. Consigne : plans de travail/CONSIGNE-AUDIT-PARCOURS-SOMMATIF.md.
// Lecture seule : rien n'est corrigé. Chaque essai imprime AUDIT-SOM {...} et ne rougit que si le parcours s'interrompt.
//
// Le parcours, sur un profil de navigateur vierge (aucune donnée réelle) :
//   (0) un trimestre, un groupe-cours sans pratique, un élève fictif, trois productions, trois copies — semés (le
//       parcours d'accueil n'est pas l'objet) ; PUIS un rechargement, pour que le VRAI démarrage sème ce qu'il sème
//       à un·e collègue qui arrive (échelle, grille, cartouche de départ) ;
//   (1) une grille EN POINTS : trois critères analytiques, pondérations 40 / 30 / 30 (la forme que l'éditeur de
//       grilles enregistre ; l'éditeur lui-même n'est pas conduit) ;
//   (2) une pratique SOMMATIVE par l'assistant (bouton réel, champs, « Suivant », « Créer »), appliquée au cours ;
//   (3) aucune échelle choisie : l'écran d'évaluation prend ce qu'il trouve ;
//   (4) sans cartouche (aucune n'est proposée pour cette grille) ;
//   (5) trois copies du même élève, annotées (tampons, codes), évaluées en points, Langue sous 60 % aux trois ;
//   (6) la page de synthèse du PDF (`construireFeedback` + `rendreSyntheseHTML`, le seul appelant réel est
//       `ajouterPageSynthese`) et « Copier tout » (le bouton de l'écran, presse-papier intercepté).
// Variante secondaire : les deux repères posés sur l'échelle de départ (D / M), la page relue.
// Variante limite : l'échelle supprimée — que devient l'écran d'une grille en points ?

const patternsAttendus = [/version\.json.*access control/i, /Cross origin requests are only supported/i, /Not allowed to load local resource.*\.(svg|png)/i];

const DA = '9000001';
const GRILLE = { id: 'G_PTS', nom: 'Grille en points (audit)', type: 'analytique', criteres: [
    { id: 'c_comp', nom: 'Compréhension', ponderation: 40, type: 'analytique', description: 'Comprendre le texte et la question posée' },
    { id: 'c_struct', nom: 'Structure', ponderation: 30, type: 'analytique', description: 'Organiser le propos en parties liées' },
    { id: 'c_langue', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'Écrire dans une langue correcte' }
] };
// Trois copies : Langue sous 60 % aux trois ; Structure sous 60 % à la première, entre 60 et 65 % à la deuxième.
const COPIES = [
    { p: 'P1', f: 'F1', titre: 'Travail 1', points: { c_comp: 30, c_struct: 17, c_langue: 15 } },   // 75 · 56,7 · 50   → 62 %
    { p: 'P2', f: 'F2', titre: 'Travail 2', points: { c_comp: 34, c_struct: 19, c_langue: 17 } },   // 85 · 63,3 · 56,7 → 70 %
    { p: 'P3', f: 'F3', titre: 'Travail 3', points: { c_comp: 36, c_struct: 22, c_langue: 16 } }    // 90 · 73,3 · 53,3 → 74 %
];
const ANNOTATION = (fichierId) => ({ id: 'AN_' + fichierId, fichierId, pages: { '1': {
    stickers: [{ autocollantId: 'obs-hoc' }, { autocollantId: 'action-liaison' }],
    shapes: [{ type: 'errfr_1' }, { type: 'errfr_1' }, { type: 'errfr_4' }]
} } });

async function attendre(page, fn, arg, ms = 8000) {
    return page.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);
}

test('audit · parcours sommatif, grille en points sans échelle choisie — ce que l\'élève reçoit', async ({ page }, testInfo) => {
    test.setTimeout(240000);
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    const dialogues = [];
    page.on('dialog', (dl) => { dialogues.push(dl.message()); dl.accept().catch(() => {}); });
    const R = { etapes: {} };

    // (0) Premier chargement : le socle (trimestre, cours, élève, productions, copies). Rien sur l'échelle ni la grille.
    await page.goto(indexHtml);
    await attendre(page, () => typeof window.db !== 'undefined' && typeof window.cle === 'function', null, 20000);
    await page.evaluate(({ DA, COPIES }) => {
        const trimestreId = 'a2026';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-S'; const GC_ID = 'GC_S';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'XXX-101', nomCours: 'Cours banc', groupe: '00001', _groupeCoursId: GC_ID, prenomEnseignant: 'Prof', nomEnseignant: 'Banc' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: GC_ID, trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: GC_ID, trimestreId, coursId, groupeNum: '00001', pratiqueId: null, actif: true }]);
        window.db.setSync(trimestreId + '_groupeEtudiants', [{ da: DA, prenom: 'Élève', nom: 'Fictif', groupe: '00001', coursId, groupeCoursId: GC_ID }]); // security-ok: fixture de test
        window.db.setSync(trimestreId + '_productions', COPIES.map((c, i) => ({ id: c.p, numero: i + 1, titre: c.titre, type: 'travail', ponderation: 25,
            objectif: 'Objectif du ' + c.titre, tache: 'Tâche du ' + c.titre, dateEcheance: '2026-10-0' + (i + 1), groupeCoursId: GC_ID, coursId }))); // security-ok: fixture de test
        window.db.setSync(trimestreId + '_evaluationsSauvegardees', []);
        window.db.setSync(trimestreId + '_fichiersTravaux', COPIES.map(c => ({ id: c.f, etudiantDA: DA, productionId: c.p, nomFichier: 'copie-' + c.p + '.pdf', typeMIME: 'application/pdf' }))); // security-ok: fixture de test
    }, { DA, COPIES });
    await page.waitForTimeout(1500);

    // Second chargement : le VRAI démarrage, trimestre établi, sème ce qu'il sème.
    await page.reload();
    await attendre(page, () => typeof window.afficherSection === 'function' && typeof window.chargerPratiquePourModif === 'function'
        && typeof window.demarrerEvaluationDepuisFichier === 'function' && window.wizardState && typeof window.syntheseRetroactionData !== 'undefined', null, 30000);
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-echelles'); });
    await page.waitForTimeout(1500);
    R.etapes.demarrage = await page.evaluate(() => {
        const ech = window.db.getSync(window.cle('echellesTemplates'), []) || [];
        const gr = window.db.getSync(window.cle('grillesTemplates'), []) || [];
        const cartes = Object.keys(localStorage).filter(k => k.indexOf('cartouches_') !== -1);
        return {
            cle: window.cle('echellesTemplates'),
            echelles: ech.map(e => ({ id: e.id, nom: e.nom, seuilSuffisance: e.seuilSuffisance || null, seuilMaitrise: e.seuilMaitrise || null,
                niveaux: (e.niveaux || []).map(n => `${n.code} ${n.nom} [${n.min}-${n.max}] v=${n.valeurCalcul}`) })),
            grilles: gr.map(g => ({ id: g.id, nom: g.nom, criteres: (g.criteres || []).map(c => `${c.nom} ${c.ponderation} ${c.type || '(holistique)'}`) })),
            clesCartouches: cartes
        };
    });

    // (1) La grille en points.
    await page.evaluate((GRILLE) => {
        const gr = window.db.getSync(window.cle('grillesTemplates'), []) || [];
        window.db.setSync(window.cle('grillesTemplates'), gr.concat([GRILLE])); // security-ok: fixture de test
        const prods = window.db.getSync(window.cle('productions'), []) || [];
        window.db.setSync(window.cle('productions'), prods.map(p => Object.assign({}, p, { grilleId: GRILLE.id }))); // security-ok: fixture de test
    }, GRILLE);

    // (2) L'assistant, famille sommative, sans règle particulière.
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelector('button[data-action="creerNouvellePratique"]').click());
    await attendre(page, () => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'));
    const reponses = { nom: 'Pratique sommative (audit)', prenom: 'Prof', nomAuteur: 'Banc', etablissement: 'Cégep banc', discipline: '*premier*', porteEntree: 'decrire',
        calcNoteFinale: 'moyenne', reglesSommatives: ['aucune'], nbEvaluationsPrevues: '3', seuilVaBien: '80', seuilDifficulte: '70', seuilGrandeDifficulte: '60' };
    const parcoursAssistant = [];
    for (let tour = 0; tour < 20; tour++) {
        const etape = await page.evaluate(() => window.wizardState.etapeActuelle);
        if (etape === 'recapitulatif') break;
        const pose = await page.evaluate(({ etape, reponses }) => {
            const def = window.ETAPES_WIZARD[etape];
            let champs = def.champs || [];
            if (def.getChampsDynamiques) champs = def.getChampsDynamiques(window.wizardState.reponses);
            const plat = []; const aplatir = (c) => { if (c.type === 'row' && c.champs) c.champs.forEach(aplatir); else plat.push(c); }; champs.forEach(aplatir);
            const titre = (document.querySelector('#modalWizardPratiqueV2 h3, #modalWizardPratiqueV2 .wizard-v2-titre-etape') || {}).textContent || '';
            const poses = []; const offerts = plat.map(c => c.id + ':' + c.type);
            for (const c of plat) {
                if (!(c.id in reponses)) continue;
                const v = reponses[c.id];
                if (c.type === 'radio-cards') {
                    let el = document.querySelector(`input[name="${c.id}"][value="${v}"]`);
                    if (v === '*premier*') el = document.querySelector(`input[name="${c.id}"]`);
                    if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); poses.push(c.id + '=' + el.value); } else poses.push(c.id + ' INTROUVABLE');
                } else if (c.type === 'checkbox-cards') {
                    document.querySelectorAll(`input[name="${c.id}"]`).forEach(cb => { cb.checked = v.includes(cb.value); cb.dispatchEvent(new Event('change', { bubbles: true })); });
                    poses.push(c.id + '=' + JSON.stringify(v));
                } else {
                    const el = document.getElementById('wizardv2-' + c.id);
                    if (!el) { poses.push(c.id + ' INTROUVABLE (' + c.type + ')'); continue; }
                    if (c.type === 'toggle') el.checked = !!v;
                    else if (v === '*premier*' && el.tagName === 'SELECT') { const o = Array.from(el.options).find(o => o.value); if (o) el.value = o.value; }
                    else el.value = v;
                    el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true }));
                    poses.push(c.id + '=' + v);
                }
            }
            document.getElementById('wizard-v2-btn-suivant').click();
            return { etape, titre: titre.trim().slice(0, 80), offerts, poses };
        }, { etape, reponses });
        parcoursAssistant.push(pose);
        const passe = await attendre(page, (e) => window.wizardState.etapeActuelle !== e, etape, 4000);
        if (!passe) { parcoursAssistant.push({ bloque: etape }); break; }
    }
    R.etapes.assistant = { parcours: parcoursAssistant, etapeFinale: await page.evaluate(() => window.wizardState.etapeActuelle) };
    R.etapes.assistant.recapitulatif = await page.evaluate(() => (document.querySelector('#modalWizardPratiqueV2 .wizard-v2-recap, #modalWizardPratiqueV2') || {}).innerText
        ?.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 50));
    await page.evaluate(() => { const c = document.getElementById('wizard-v2-recap-nom'); if (c) c.value = 'Pratique sommative (audit)'; document.getElementById('wizard-v2-btn-creer').click(); });
    await attendre(page, () => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).length === 1);
    const pratique = await page.evaluate(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || [])[0] || null);
    R.etapes.assistant.pratique = pratique ? { id: pratique.id, type: pratique.type, configEchelle: pratique.config ? (pratique.config.echelle || null) : '(pas de config)',
        cles: Object.keys(pratique), cleConfig: pratique.config ? Object.keys(pratique.config) : [] } : null;
    if (pratique) {
        await page.evaluate((id) => { window.chargerPratiquePourModif(id); }, pratique.id);
        await attendre(page, (id) => !!document.querySelector(`#sidebarListePratiques .sidebar-item[data-id="${id}"]`), pratique.id);
        await page.evaluate(() => document.querySelector('button[data-action="appliquerPratiqueAuCoursActive"]').click());
        await attendre(page, (id) => (window.db.getSync(window.cle('groupesCours'), []) || [])[0]?.pratiqueId === id, pratique.id);
        R.etapes.assistant.appliquee = await page.evaluate(() => (window.db.getSync(window.cle('groupesCours'), []) || [])[0]?.pratiqueId || null);
    }

    // Les annotations des trois copies (tampons + codes), par l'écrivain du module.
    await page.evaluate(({ COPIES, AN }) => { COPIES.forEach(c => window.travauxStockage.sauvegarderAnnotationFichier(JSON.parse(AN.replace(/__F__/g, c.f)))); },
        { COPIES, AN: JSON.stringify(ANNOTATION('__F__')) });

    // (3)-(5) L'écran d'évaluation, copie par copie.
    await page.evaluate(() => { window.afficherSection('evaluations'); });
    await page.waitForTimeout(800);
    R.etapes.evaluations = [];
    for (const c of COPIES) {
        const res = await page.evaluate(async ({ c, DA, GRILLE }) => {
            const dormir = (ms) => new Promise(r => setTimeout(r, ms));
            window.chargerListeEtudiantsEval && window.chargerListeEtudiantsEval();
            window.chargerGroupesEval && window.chargerGroupesEval();
            window.chargerProductionsDansSelect && window.chargerProductionsDansSelect();
            window.chargerGrillesDansSelect && window.chargerGrillesDansSelect();
            window.chargerEchellePerformance && window.chargerEchellePerformance();
            const fichier = (window.db.getSync(window.cle('fichiersTravaux'), []) || []).find(f => f.id === c.f);
            const demarre = window.demarrerEvaluationDepuisFichier(fichier);
            await dormir(300);
            const selE = document.getElementById('selectEtudiantEval'); selE.value = DA; window.chargerEvaluationsEtudiant();
            const selP = document.getElementById('selectProduction1'); selP.value = c.p; selP.dispatchEvent(new Event('change', { bubbles: true }));
            await dormir(900);
            const selG = document.getElementById('selectGrille1');
            if (selG.value !== GRILLE.id) { selG.value = GRILLE.id; selG.dispatchEvent(new Event('change', { bubbles: true })); }
            const selR = document.getElementById('remiseProduction1');
            if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
            await dormir(400);
            const selEch = document.getElementById('selectEchelle1');
            const selC = document.getElementById('selectCartoucheEval');
            const avant = {
                demarre,
                optionsEchelle: selEch ? Array.from(selEch.options).map(o => (o.value || '∅') + ' = ' + o.textContent.trim()) : null,
                echelleChoisie: selEch ? selEch.value : null,
                optionsCartouche: selC ? Array.from(selC.options).map(o => (o.value || '∅') + ' = ' + o.textContent.trim()) : null,
                champsPoints: GRILLE.criteres.map(cr => !!document.getElementById('eval_pts_' + cr.id)),
                menus: GRILLE.criteres.map(cr => !!document.getElementById('eval_' + cr.id))
            };
            for (const [id, v] of Object.entries(c.points)) {
                const champ = document.getElementById('eval_pts_' + id);
                if (champ) { champ.value = String(v); champ.dispatchEvent(new Event('input', { bubbles: true })); }
                await dormir(120);
            }
            await dormir(300);
            const ecran = { note: document.getElementById('noteProduction1').textContent, niveau: document.getElementById('niveauProduction1').textContent,
                portee: (document.getElementById('porteeNote1') || {}).textContent || '' };
            const notifs = [];
            const orig = window.notifications.erreur;
            window.notifications.erreur = (t, m) => { notifs.push(String(t) + ' ' + String(m || '')); return orig.call(window.notifications, t, m); };
            window.sauvegarderEvaluation();
            await dormir(600);
            window.notifications.erreur = orig;
            const evals = window.db.getSync(window.cle('evaluationsSauvegardees'), []) || [];
            const e = evals.find(x => x.productionId === c.p && x.etudiantDA === DA);
            return { copie: c.p, avant, ecran, notifs, enBase: e ? { id: e.id, echelleId: e.echelleId, noteFinale: e.noteFinale, niveauFinal: e.niveauFinal, cartoucheId: e.cartoucheId || null,
                criteres: (e.criteres || []).map(x => `${x.critereNom}: ${x.niveauSelectionne} · ${x.points} / ${x.ponderation} · rétro « ${String(x.retroaction || '').slice(0, 60)} »`) } : null };
        }, { c, DA, GRILLE });
        R.etapes.evaluations.push(res);
    }

    // (6a) « Copier tout » sur la dernière copie, par le bouton de l'écran ; le presse-papier est intercepté.
    R.etapes.copierTout = await page.evaluate(async () => {
        let copie = null;
        const orig = navigator.clipboard && navigator.clipboard.writeText;
        try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => { copie = t; return Promise.resolve(); } }, configurable: true }); } catch (e) { return { erreur: 'presse-papier non interceptable : ' + e.message }; }
        if (typeof window.genererRetroaction === 'function') window.genererRetroaction(1);
        const bouton = document.querySelector('[data-action="copierToutRetroaction"]');
        if (bouton) bouton.click(); else window.copierToutRetroaction();
        await new Promise(r => setTimeout(r, 300));
        return { parLeBouton: !!bouton, texte: copie, _orig: !!orig };
    });

    // (6b) La page de synthèse du PDF, pour chaque copie ; trois lectures de l'échelle.
    const LIRE_PDF = async () => {
        const nettoyer = (html) => html.replace(/<\/(div|p|h[1-6]|li|section|header|footer|ul|span|b)>/gi, '$& ').replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
        const evals = window.db.getSync(window.cle('evaluationsSauvegardees'), []) || [];
        const fichiers = window.db.getSync(window.cle('fichiersTravaux'), []) || [];
        return ['P1', 'P2', 'P3'].map(p => {
            const e = evals.find(x => x.productionId === p);
            const f = fichiers.find(x => x.productionId === p);
            if (!e) return { p, absente: true };
            const an = window.travauxStockage.obtenirAnnotationFichier(f.id);
            const fb = window.syntheseRetroactionData.construireFeedback(e, f, an);
            const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
            const box = document.createElement('div'); box.innerHTML = html;
            const racine = box.firstElementChild || box;
            const blocs = Array.from(racine.children).map(b => ({ balise: b.tagName.toLowerCase(), texte: nettoyer(b.outerHTML).slice(0, 900) }));
            return { p, bilan: fb.bilan, portee: fb.portee || null, niveauGeneral: fb.niveauGeneral || fb.niveau || null, blocs };
        });
    };
    R.pdfSansReperes = await page.evaluate(LIRE_PDF);

    // Variante secondaire : l'enseignant·e pose les deux repères sur l'échelle de départ (D, M) — par l'écrivain de l'éditeur.
    R.reperesPoses = await page.evaluate(async () => {
        const id = (window.db.getSync(window.cle('echellesTemplates'), []) || [])[0]?.id;
        const a = await window.ecrireRepereEchelle(id, 'seuilSuffisance', 'D');
        const b = await window.ecrireRepereEchelle(id, 'seuilMaitrise', 'M');
        const e = (window.db.getSync(window.cle('echellesTemplates'), []) || [])[0];
        return { id, a, b, seuilSuffisance: e.seuilSuffisance, seuilMaitrise: e.seuilMaitrise };
    });
    R.pdfAvecReperes = await page.evaluate(LIRE_PDF);

    // Variante limite : aucune échelle du tout (l'enseignant·e supprime la seule qu'il ou elle a) — l'écran d'une grille en points.
    R.sansAucuneEchelle = await page.evaluate(async ({ DA }) => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const sauve = window.db.getSync(window.cle('echellesTemplates'), []);
        window.db.setSync(window.cle('echellesTemplates'), []);
        window.chargerEchellePerformance();
        const selEch = document.getElementById('selectEchelle1');
        const options = Array.from(selEch.options).map(o => (o.value || '∅') + ' = ' + o.textContent.trim());
        if (window.evaluationEnCours) window.evaluationEnCours.echelleId = '';
        const champ = document.getElementById('eval_pts_c_comp');
        if (champ) { champ.value = '35'; champ.dispatchEvent(new Event('input', { bubbles: true })); }
        await dormir(300);
        const ecran = { note: document.getElementById('noteProduction1').textContent, niveau: document.getElementById('niveauProduction1').textContent };
        window.db.setSync(window.cle('echellesTemplates'), sauve); // security-ok: restauration de la fixture
        return { options, ecran };
    }, { DA });

    // La note provisoire en sommative : ce que le moteur rend à la page du PDF.
    R.moteur = await page.evaluate((DA) => {
        let det; try { det = window.calculerDetailsNoteFinale(DA); } catch (e) { det = 'ERREUR ' + e.message; }
        let jetons; try { jetons = window.obtenirConfigJetons ? window.obtenirConfigJetons() : null; } catch (e) { jetons = 'ERREUR ' + e.message; }
        let p; try { p = window.calculerTousLesIndices(DA).P; } catch (e) { p = 'ERREUR ' + e.message; }
        return { detailsNoteFinale: det, jetons, indiceP: p, designation: window.designerPratiqueActive ? window.designerPratiqueActive() : null };
    }, DA);

    R.dialogues = dialogues; R.erreursConsole = erreurs.slice(0, 8);
    console.log('AUDIT-SOM ' + JSON.stringify(R, null, 1));
    testInfo.attach('AUDIT-SOM', { body: JSON.stringify(R, null, 1), contentType: 'application/json' });
    expect(R.etapes.assistant.etapeFinale, 'l\'assistant doit atteindre le récapitulatif').toBe('recapitulatif');
    expect(R.etapes.evaluations.every(e => e.enBase), 'les trois copies doivent être enregistrées').toBe(true);
});
