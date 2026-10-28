import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// AUDIT — pratiques de notation, flux E : LE PARCOURS DU LABO, DANS LA PAGE RÉELLE (WebKit).
// Rapport : Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md.
// Pour chaque famille : (1) « + Nouvelle pratique » (bouton réel) → (2) l'assistant, étape par étape, par ses
// champs DOM et son bouton « Suivant » → récapitulatif lu → « Créer » (bouton réel) → (3) « Appliquer au cours
// actif » (bouton réel, patron de la porte #762) → (4) deux copies déjà évaluées (semées) → le profil de l'élève
// (afficherProfilComplet, le geste de la liste) → (5) l'export CSV des résultats finaux (bouton réel, fichier lu).
// Rien n'est jugé ici : chaque test imprime AUDIT-PNC-E {...} et ne rougit que si le parcours s'interrompt.
//
// DEVENU SENTINELLE LE 17 SEPT. 2026 (lot 28, 1.142.24) pour deux constats corrigés :
//   A-3 — le parcours SPE rend « non constructible » à l'export, APRÈS la passe d'indices que la page fait d'elle-même
//         (avant : le 0 bouche-trou du cache relu comme une note → « 0, final » pour toute la classe) ;
//   B-2 — « N plus récentes » adopté, rouvert par l'assistant, échelle choisie, enregistré sans rien toucher d'autre :
//         la méthode relue à l'écran est « N derniers » et le portfolio est intact (dernier essai du fichier).
//         ⚠ Mesuré au break-test : ce parcours rougit si `recents` quitte la table de relecture, PAS si le défaut
//         d'`approcheEvaluation` est retiré — dans la page, l'étape « Approche » (carte pré-cochée, #443) la repose.
//         Ce défaut-là est gardé par le banc Vitest (B2, B2 bis), qui enregistre sans traverser les étapes.
// Les trois autres parcours restent des mesures.

const patternsAttendus = [/version\.json.*access control/i, /Cross origin requests are only supported/i, /Not allowed to load local resource.*\.(svg|png)/i];
const E1 = { id: 'E1', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#a00' }, { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#0a0' }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#00a' } ] };
const GRILLE = { id: 'G1', nom: 'Grille banc', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 100 }] };
function ev(id, da, productionId, noteFinale, niveauFinal, extra) {
    return Object.assign({ id, etudiantDA: da, productionId, noteFinale, niveauFinal, echelleId: 'E1', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true,
        dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'Rétroaction de banc.', statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: niveauFinal, ponderation: 100 }] }, extra || {});
}
const d = (j) => ({ dateEvaluation: '2026-0' + (1 + Math.floor(j / 3)) + '-1' + j + 'T12:00:00.000Z' });
const FAMILLES = {
    SOM: { da: '1000001', nom: 'Sommative', prenom: 'Alice',
        productions: [{ id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01' }, { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-01' }],
        evaluations: [ev('EV_S1', '1000001', 'P1', 84, 'M'), ev('EV_S2', '1000001', 'P2', 90, 'E')],
        reponses: { nom: 'Pratique (labo)', prenom: 'Test', nomAuteur: 'Labo', etablissement: 'Cégep banc', discipline: '*premier*', porteEntree: 'decrire', calcNoteFinale: 'moyenne', reglesSommatives: ['double_verrou'], nbEvaluationsPrevues: '4', seuilVaBien: '80', seuilDifficulte: '70', seuilGrandeDifficulte: '60',
            nomEvalVerrouillee: 'Dissertation', seuilVerrou: '90', plafondVerrou: '50', afficherRang: true },
        attendu: 'moyenne pondérée 84×40 + 90×60 = 87,6 ; verrou « Dissertation < 90 → max 50 » APPLIQUÉ depuis le lot 29 (#897) : 50 au profil et à l\'export' },
    STD: { da: '1000002', nom: 'Standards', prenom: 'Bruno',
        productions: [{ id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 3, minimumCompletion: 1, nombreTotal: 6 } },
            { id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: 40, numero: 7, dateEcheance: '2026-05-01' },
            ...[1, 2, 3, 4, 5, 6].map(i => ({ id: 'A' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', numero: i, ponderation: 0, dateEcheance: '2026-0' + (1 + Math.floor(i / 3)) + '-1' + i }))],
        evaluations: [ev('EV_A1', '1000002', 'A1', 85, 'M', d(1)), ev('EV_A2', '1000002', 'A2', 60, 'D', d(2)), ev('EV_A3', '1000002', 'A3', 78, 'M', d(3)), ev('EV_A4', '1000002', 'A4', 70, 'D', d(4)), ev('EV_A5', '1000002', 'A5', 78, 'M', d(5)), ev('EV_TERM', '1000002', 'TERM', 82, 'M')],
        reponses: { nom: 'Pratique (labo)', prenom: 'Test', nomAuteur: 'Labo', etablissement: 'Cégep banc', discipline: '*premier*', porteEntree: 'decrire', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', nbEvaluationsPrevues: '6', seuilVaBien: '80', seuilDifficulte: '70', seuilGrandeDifficulte: '60',
            utiliserPortfolio: true, nbArtefactsSoumis: '6', modeSelectionPortfolio: 'derniers', nbArtefactsRetenus: '4', minAvantCalculFormatif: '2', echelleId: 'E1', grilleId: 'G1' },
        attendu: 'les 4 derniers (A2 A3 A4 A5) = 71,5 → ×0,6 + 82×0,4 = 75,7 (banc A2)' },
    SPE: { da: '1000003', nom: 'Specifications', prenom: 'Chloé',
        productions: [{ id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-02-01' }, { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-02-15' }],
        evaluations: [ev('EV_D1', '1000003', 'D1', 80, 'M'), ev('EV_X1', '1000003', 'X1', 90, 'E')],
        reponses: { nom: 'Pratique (labo)', prenom: 'Test', nomAuteur: 'Labo', etablissement: 'Cégep banc', discipline: '*premier*', porteEntree: 'decrire', calcNoteFinale: 'acceptable', nbEvaluationsPrevues: '5', seuilVaBien: '80', seuilDifficulte: '70', seuilGrandeDifficulte: '60',
            seuilAcceptabilite: '70', utiliserJetons: true, nbJetonsDelai: '4', dureeDelaiJours: '5', delaiSurReprise: true, nbJetonsReprise: '3', modeleBundle: '*premier*' },
        attendu: 'aucun type de travail ni forfait n\'est écrit par l\'assistant → non constructible (banc A3)' },
    DEN: { da: '1000004', nom: 'Denotation', prenom: 'Dani',
        productions: [{ id: 'W1', titre: 'Travail 1', type: 'travail', dateEcheance: '2026-02-01' }, { id: 'W2', titre: 'Travail 2', type: 'travail', dateEcheance: '2026-03-01' }],
        evaluations: [ev('EV_W1', '1000004', 'W1', 85, 'M'), ev('EV_W2', '1000004', 'W2', 90, 'E')],
        reponses: { nom: 'Pratique (labo)', prenom: 'Test', nomAuteur: 'Labo', etablissement: 'Cégep banc', discipline: '*premier*', porteEntree: 'decrire', calcNoteFinale: 'jugement', ciblesDenotation: ['Lire', 'Écrire'], methodeSuggestionDen: 'mediane', echelleId: 'E1', grilleId: 'G1' },
        attendu: 'sans jugement saisi : non calculable ; avec un jugement 78 aux deux cibles : 78 (banc A4)' }
};

for (const [code, F] of Object.entries(FAMILLES)) {
    test(`Flux E · ${code} — le parcours du labo, de « + Nouvelle pratique » à l'export`, async ({ page }, testInfo) => {
        test.setTimeout(120000);
        const erreurs = [];
        const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
        page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
        page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
        const dialogues = [];
        page.on('dialog', (dl) => { dialogues.push(dl.message()); dl.accept().catch(() => {}); });
        await page.goto(indexHtml);
        await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.chargerPratiquePourModif === 'function'
            && typeof window.appliquerPratiqueAuCoursActive === 'function' && typeof window.afficherProfilComplet === 'function' && typeof window.db !== 'undefined' && window.wizardState);
        const R = { famille: code, attendu: F.attendu, etapes: [] };

        // (0) Semis : un trimestre, un groupe-cours sans pratique, une échelle, une grille, un élève, ses copies évaluées.
        await page.evaluate(({ F, E1, GRILLE }) => {
            const trimestreId = 'testE';
            window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre E', actif: true }]);
            window.db.setSync('trimestreActif', trimestreId);
            const coursId = 'cours-E'; const GC_ID = 'GC_E';
            window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '00001', _groupeCoursId: GC_ID }); // security-ok: fixture de test
            window.db.setSync('groupeCoursActif', { id: GC_ID, trimestreId });
            window.db.setSync(trimestreId + '_groupesCours', [{ id: GC_ID, trimestreId, coursId, groupeNum: '00001', pratiqueId: null, actif: true }]);
            window.db.setSync(window.cle('echellesTemplates'), [E1]);
            window.db.setSync(window.cle('grillesTemplates'), [GRILLE]);
            window.db.setSync(window.cle('pratiquesConfigurables'), []);
            window.db.setSync(window.cle('groupeEtudiants'), [{ da: F.da, nom: F.nom, prenom: F.prenom, groupe: '00001', coursId }]); // security-ok: fixture de test
            window.db.setSync(window.cle('productions'), F.productions);
            window.db.setSync(window.cle('evaluationsSauvegardees'), F.evaluations);
            window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation');
            // 20 sept. 2026 — L'ORDRE DU RUNNER, POSÉ EXPRÈS. Sur GitHub, une passe d'indices précédait l'application
            // de la pratique (groupe-cours sans pratique → « sommative » : 85, constructible) ; le Mac finissait
            // l'assistant avant elle et ne jugeait donc jamais ce cas. La spec ne dépend plus de qui court le plus vite.
            window.calculerEtStockerIndicesCP();
        }, { F, E1, GRILLE });

        // (1) Le bouton réel « + Nouvelle pratique ».
        await page.evaluate(() => document.querySelector('button[data-action="creerNouvellePratique"]').click());
        await page.waitForFunction(() => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif'));

        // (2) L'assistant, par ses champs et son bouton « Suivant ».
        for (let tour = 0; tour < 20; tour++) {
            const etape = await page.evaluate(() => window.wizardState.etapeActuelle);
            if (etape === 'recapitulatif') break;
            const pose = await page.evaluate(({ etape, reponses }) => {
                const def = window.ETAPES_WIZARD[etape];
                let champs = def.champs || [];
                if (def.getChampsDynamiques) champs = def.getChampsDynamiques(window.wizardState.reponses);
                const plat = []; const aplatir = (c) => { if (c.type === 'row' && c.champs) c.champs.forEach(aplatir); else plat.push(c); }; champs.forEach(aplatir);
                const poses = [];
                for (const c of plat) {
                    if (!(c.id in reponses)) continue;
                    const v = reponses[c.id];
                    if (c.type === 'radio-cards') {
                        let el = document.querySelector(`input[name="${c.id}"][value="${v}"]`);
                        if (v === '*premier*') el = document.querySelector(`input[name="${c.id}"]`);
                        if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); poses.push(c.id + '=' + el.value); } else poses.push(c.id + ' INTROUVABLE');
                    } else if (c.type === 'checkbox-cards') {
                        document.querySelectorAll(`input[name="${c.id}"]`).forEach(cb => { cb.checked = v.includes(cb.value); });
                        poses.push(c.id + '=' + JSON.stringify(v));
                    } else if (c.type === 'liste-cibles') {
                        // #717 : le composant des cibles — une ligne par cible, « + Ajouter une cible » pour la suivante.
                        const liste = document.getElementById('wizardv2-' + c.id);
                        v.forEach((nom, i) => {
                            if (i > 0) liste.querySelector('[data-action="EditeurCibles.ajouter"]').click();
                            const champ = liste.querySelectorAll('.editeur-cibles-nom')[i];
                            champ.value = nom; champ.dispatchEvent(new Event('change', { bubbles: true }));
                        });
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
                // DEN : Q1 n'offre pas « jugement » ; c'est le lien « Je sais déjà ce que je veux » (voie rapide).
                if (etape === 'calcul-note-finale' && reponses.calcNoteFinale === 'jugement') {
                    const lien = document.querySelector('[data-action="wizardV2VoieRapide"]');
                    if (lien) { lien.click(); return { etape, poses, voieRapide: true }; }
                    return { etape, poses, voieRapide: 'LIEN INTROUVABLE' };
                }
                document.getElementById('wizard-v2-btn-suivant').click();
                return { etape, poses };
            }, { etape, reponses: F.reponses });
            R.etapes.push(pose);
            try {
                await page.waitForFunction((e) => window.wizardState.etapeActuelle !== e, etape, { timeout: 4000 });
            } catch (err) {
                R.etapes.push({ bloque: etape, message: await page.evaluate(() => (document.querySelector('.notification-erreur, .notification.erreur, .toast-erreur') || {}).textContent || '(aucun message lu)') });
                break;
            }
        }
        R.etapeFinale = await page.evaluate(() => window.wizardState.etapeActuelle);
        R.recapitulatif = await page.evaluate(() => (document.querySelector('#modalWizardPratiqueV2 .wizard-v2-recap, #modalWizardPratiqueV2 .modal-body, #modalWizardPratiqueV2') || {}).innerText?.replace(/\s+\n/g, '\n').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 60));
        R.boutonCreerVisible = await page.evaluate(() => { const b = document.getElementById('wizard-v2-btn-creer'); return !!b && !b.classList.contains('u-hide'); });
        // « Créer » (bouton réel), après avoir nommé la pratique dans le champ du récapitulatif.
        await page.evaluate((nom) => { const c = document.getElementById('wizard-v2-recap-nom'); if (c) c.value = nom; document.getElementById('wizard-v2-btn-creer').click(); }, 'Pratique ' + code + ' (labo)');
        await page.waitForFunction(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || []).length === 1, null, { timeout: 8000 }).catch(() => {});
        R.pratique = await page.evaluate(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || [])[0] || null);

        // (3) « Appliquer au cours actif » (bouton réel, patron #762).
        if (R.pratique) {
            await page.evaluate((id) => { window.chargerPratiquePourModif(id); }, R.pratique.id);
            await page.waitForFunction((id) => document.getElementById('menuPratiques')?.value === id, R.pratique.id, { timeout: 8000 }).catch(() => {});   // #1147
            await page.evaluate(() => document.querySelector('button[data-action="appliquerPratiqueAuCoursActive"]').click());
            await page.waitForFunction((id) => (window.db.getSync(window.cle('groupesCours'), []) || [])[0]?.pratiqueId === id, R.pratique.id, { timeout: 8000 }).catch(() => {});
            R.applique = await page.evaluate(() => ({ pratiqueId: (window.db.getSync(window.cle('groupesCours'), []) || [])[0]?.pratiqueId,
                badgeActive: [...(document.getElementById('menuPratiques')?.options || [])].filter(o => o.textContent.endsWith(' (active)')).length }));   // #1147 : l'état dans le menu
            if (code === 'SPE') {
                // #899 — LE CHEMIN QUE LE RÉCAPITULATIF PROMET : « Conception › Pratiques de notation (clique sur la pratique) ».
                // Le choix réel de la pratique dans le menu (#1147) montre les deux titres nommés par la phrase.
                await page.locator('#menuPratiques').selectOption(R.pratique.id);
                await page.waitForFunction(() => [...document.querySelectorAll('h4')].some(h => h.textContent.trim() === 'Types de productions' && h.offsetParent !== null), null, { timeout: 8000 }).catch(() => {});
                R.chemin899 = await page.evaluate(() => {
                    const visible = (t) => [...document.querySelectorAll('h4')].some(h => h.textContent.trim() === t && h.offsetParent !== null);
                    const onglet = [...document.querySelectorAll('.sous-navigation button, .sous-navigation a, [data-sous-section]')].map(e => e.textContent.trim());
                    return { types: visible('Types de productions'), forfaits: visible('Table des forfaits (bundles)'), sectionNommee: onglet.includes('Pratiques de notation') };
                });
            }
            if (code === 'DEN') {
                await page.evaluate(({ id, da, ids }) => { window.db.setSync(window.cle('jugementsDenotation'), { [id]: { [da]: { ciblesAtteintes: Object.fromEntries(ids.map(c => [c, true])), noteFinale: 78, justification: 'banc', date: '2026-05-01' } } }); }, { id: R.pratique.id, da: F.da, ids: R.pratique.configuration.objectifs.map(c => c.id) });
            }
        }

        // (4) Le profil de l'élève.
        R.profil = await page.evaluate((da) => {
            try { window.afficherProfilComplet(da); } catch (e) { return { erreur: e.message }; }
            const cont = document.getElementById('contenuProfilEtudiant');
            const total = cont && cont.querySelector('.note-finale-total');
            const texte = cont ? cont.innerText : '';
            const extrait = (re) => { const m = texte.match(re); return m ? m[0].slice(0, 220) : null; };
            return {
                noteFinaleTotal: total ? total.textContent.trim() : null,
                diagnostic: (typeof window._diagnostiquerNoteNonCalculable === 'function') ? window._diagnostiquerNoteNonCalculable() : null,
                indiceP: window.calculerTousLesIndices(da).P,
                moteur: (() => { const id = (window.db.getSync(window.cle('groupesCours'), []) || [])[0]?.pratiqueId; const inst = window.obtenirPratiqueParId(id);
                    const sim = window.simulerIndices(da, id); const det = window.calculerDetailsNoteFinale(da);
                    let perf = null; try { perf = inst ? inst.calculerPerformance(da) : 'pas d\'instance'; } catch (e) { perf = 'ERREUR ' + e.message; }
                    return { perfConfigurable: perf, simule: sim && { P: sim.P, noteFinale: sim.noteFinale, noteConstructible: sim.noteConstructible }, riche: det ? (det.erreur ? 'erreur: ' + det.erreur.slice(0, 60) : det.noteFinale) : null }; })(),
                badgePratique: (cont && cont.querySelector('[class*="badge-type-"]')) ? cont.querySelector('[class*="badge-type-"]').textContent.trim() : null,
                phrases: [extrait(/[^\n]*(non calculable|pas encore branché|non constructible|jugement|Calcul impossible)[^\n]*/i), extrait(/[^\n]*(meilleur|dernier|récent|retenu)[^\n]*/i)].filter(Boolean)
            };
        }, F.da);

        // (5) L'export CSV des résultats finaux, par le bouton réel ; le fichier téléchargé est lu.
        try {
            const [dl] = await Promise.all([
                page.waitForEvent('download', { timeout: 8000 }),
                page.evaluate(() => document.querySelector('button[data-action="exporterSyntheseResultatsCSV"]').click())
            ]);
            const chemin = await dl.path();
            const csv = readFileSync(chemin, 'utf8');
            R.export = { fichier: dl.suggestedFilename(), lignes: csv.split(/\r?\n/).filter(Boolean).slice(0, 4) };
        } catch (e) { R.export = { erreur: String(e.message).slice(0, 120) }; }
        R.dialogues = dialogues; R.erreursConsole = erreurs.slice(0, 5);
        console.log('AUDIT-PNC-E ' + JSON.stringify(R));
        testInfo.attach('AUDIT-PNC-E-' + code, { body: JSON.stringify(R, null, 1), contentType: 'application/json' });
        expect(R.etapeFinale, 'l\'assistant doit atteindre le récapitulatif').toBe('recapitulatif');
        expect(R.pratique, 'une pratique doit être enregistrée').not.toBeNull();
        // #899 : la ligne du récapitulatif ne paraît que pour une spécification.
        const ligne899 = (R.recapitulatif || []).some(l => l.includes('Types de productions et forfaits'));
        expect(ligne899, 'la ligne #899 du récapitulatif').toBe(code === 'SPE');
        if (code === 'SOM') {
            // Lot 29 (#897) : le verrou coché dans l'assistant (Dissertation 84 < 90 → max 50) s'applique — profil ET export.
            expect(R.profil.moteur.perfConfigurable).toBe(0.5);
            expect(R.profil.moteur.simule).toMatchObject({ P: 50, noteConstructible: true });
            expect(R.profil.indiceP).toBe(50);
            const ligneSom = (R.export.lignes || []).find(l => l.includes(F.da));
            expect(ligneSom, 'la ligne de l\'élève est dans le CSV').toBeTruthy();
            expect(ligneSom).toMatch(/,50,provisoire/);   // E7 (28 oct. 2026) : « provisoire » sans « Notes finalisées » (avant : « final »)
        }
        if (code === 'SPE') {
            expect(R.chemin899, 'le chemin promis par #899 existe dans la page').toMatchObject({ types: true, forfaits: true });
            // A-3 : la page a fait sa passe d'indices (le cache porte le bouche-trou), et l'export ne le prend pas pour une note.
            const cache = await page.evaluate((da) => (window.db.getSync(window.cle('indicesCP'), {}) || {})[da]?.actuel || null, F.da);
            expect(cache, 'la passe d\'indices a eu lieu : sans elle, ce parcours ne juge rien').not.toBeNull();
            expect(cache.noteConstructible).toBe(false);
            expect(R.profil.moteur.perfConfigurable).toBeNull();
            expect(R.profil.moteur.simule.noteConstructible).toBe(false);
            const ligneEleve = (R.export.lignes || []).find(l => l.includes(F.da));
            expect(ligneEleve, 'la ligne de l\'élève est dans le CSV').toBeTruthy();
            expect(ligneEleve).toContain('non constructible');
            expect(ligneEleve).not.toMatch(/,0,final/);
        }
    });
}

test('B-2 · « N plus récentes » adopté puis rouvert par l\'assistant : la méthode relue est « N derniers », le portfolio est intact', async ({ page }) => {
    test.setTimeout(120000);
    page.on('dialog', (dl) => { dl.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.editerPratique === 'function' && typeof window.db !== 'undefined' && window.wizardState);
    const F = FAMILLES.STD;
    await page.evaluate(({ F, E1, GRILLE }) => {
        const trimestreId = 'testE';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre E', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        window.db.setSync('infoCours', { id: 'cours-E', codeCours: 'FRA101', groupe: '00001', _groupeCoursId: 'GC_E' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_E', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_E', trimestreId, coursId: 'cours-E', groupeNum: '00001', pratiqueId: null, actif: true }]);
        window.db.setSync(window.cle('echellesTemplates'), [E1]);
        window.db.setSync(window.cle('grillesTemplates'), [GRILLE]);
        window.db.setSync(window.cle('pratiquesConfigurables'), []);
        window.db.setSync(window.cle('groupeEtudiants'), [{ da: F.da, nom: F.nom, prenom: F.prenom, groupe: '00001', coursId: 'cours-E' }]); // security-ok: fixture de test
        window.db.setSync(window.cle('productions'), F.productions);
        window.db.setSync(window.cle('evaluationsSauvegardees'), F.evaluations);
        window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation');
    }, { F, E1, GRILLE });

    /** Avance l'assistant jusqu'au récapitulatif ; ne pose QUE les réponses données, et rend ce que chaque étape affichait. */
    const parcourir = async (reponses) => {
        const vu = {};
        for (let tour = 0; tour < 20; tour++) {
            const etape = await page.evaluate(() => window.wizardState.etapeActuelle);
            if (etape === 'recapitulatif') return vu;
            Object.assign(vu, await page.evaluate(({ reponses }) => {
                const def = window.ETAPES_WIZARD[window.wizardState.etapeActuelle];
                let champs = def.champs || [];
                if (def.getChampsDynamiques) champs = def.getChampsDynamiques(window.wizardState.reponses);
                const plat = []; const aplatir = (c) => { if (c.type === 'row' && c.champs) c.champs.forEach(aplatir); else plat.push(c); }; champs.forEach(aplatir);
                const lu = {};
                for (const c of plat) {
                    const el = document.getElementById('wizardv2-' + c.id);
                    if (c.type === 'radio-cards') {
                        if (c.id in reponses) { const r = document.querySelector(`input[name="${c.id}"][value="${reponses[c.id]}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); } }
                        continue;
                    }
                    if (!el) continue;
                    // Une réponse ne se pose que dans un champ VIDE : ce que l'assistant a restauré n'est jamais écrasé par le banc.
                    if (c.id in reponses && (el.value === '' || el.value == null)) {
                        if (reponses[c.id] === '*premier*' && el.tagName === 'SELECT') { const o = Array.from(el.options).find(o => o.value); if (o) el.value = o.value; }
                        else el.value = reponses[c.id];
                        el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    lu[c.id] = el.type === 'checkbox' ? el.checked : el.value;
                }
                document.getElementById('wizard-v2-btn-suivant').click();
                return lu;
            }, { reponses }));
            await page.waitForFunction((e) => window.wizardState.etapeActuelle !== e, etape, { timeout: 4000 });
        }
        throw new Error('récapitulatif jamais atteint');
    };
    const enregistrer = async () => page.evaluate(() => document.getElementById('wizard-v2-btn-creer').click());
    const lirePratique = () => page.evaluate(() => (window.db.getSync(window.cle('pratiquesConfigurables'), []) || [])[0] || null);

    // (1) LE STOCK : « N plus récentes » adoptée SANS échelle, telle qu'elle s'écrivait AVANT le lot 34 (#898). Depuis, le
    // geste d'adoption demande l'échelle (jugé par pratiques-898-echelle-a-l-adoption.spec.js) ; tarir n'est pas réparer :
    // les pratiques déjà adoptées restent sans échelle, et leur sortie reste celle que ce parcours juge.
    await page.evaluate(() => {
        const m = window.obtenirToutesLesPratiquesBibliothequeSync(true).find(x => x.id === 'STD-n-recents');
        const p = Object.assign(JSON.parse(JSON.stringify(m)), { id: 'pratique_STOCK_898', dansBibliotheque: true, dateCreation: '2026-09-10T12:00:00.000Z' });
        delete p.estGabarit;
        window.db.setSync(window.cle('pratiquesConfigurables'), [p]); // security-ok: fixture de test, clone du gabarit de l'application
    });
    const adoptee = await lirePratique();
    expect(adoptee.configuration.portfolio).toMatchObject({ methodeSelection: 'recents', nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10 });
    expect(adoptee.configuration.echelleId).toBeUndefined();

    // (2) ROUVRIR par l'assistant (le geste « Modifier »), choisir l'échelle, ne rien toucher au portfolio, enregistrer.
    await page.evaluate((id) => window.editerPratique(id), adoptee.id);
    await page.waitForFunction(() => document.getElementById('modalWizardPratiqueV2')?.classList.contains('actif') && window.wizardState.modeEdition === true);
    // L'assistant exige aussi, à la réouverture, des champs que le gabarit ne porte pas (il les nomme : « Remplis : … »).
    const vu = await parcourir({ echelleId: 'E1', nbEvaluationsPrevues: '6', seuilVaBien: '80', seuilDifficulte: '70', seuilGrandeDifficulte: '60',
        etablissement: 'Cégep banc', discipline: '*premier*' });
    expect(vu.modeSelectionPortfolio, 'ce que le <select> de l\'étape portfolio affiche à la réouverture').toBe('derniers');
    expect(vu.nbArtefactsRetenus).toBe('5');
    await enregistrer();
    await page.waitForFunction(() => ((window.db.getSync(window.cle('pratiquesConfigurables'), []) || [])[0] || {}).configuration?.echelleId === 'E1', null, { timeout: 8000 });
    const apres = await lirePratique();
    expect(apres.id).toBe(adoptee.id);
    expect(apres.configuration.portfolio).toMatchObject({ methodeSelection: 'derniers', nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10 });
    expect(apres.configuration.varianteCalcul).toBeUndefined();   // #900 (lot N6) : ni le gabarit ni l'assistant ne l'écrivent

    // (3) Et le moteur calcule : les 5 plus récents de A1..A5 = (85+60+78+70+78)/5 = 74,2 → 74,2 × 0,6 + 82 × 0,4 = 77,32.
    const note = await page.evaluate(({ id, da }) => {
        const gc = window.db.getSync(window.cle('groupesCours'), []); gc[0].pratiqueId = id; window.db.setSync(window.cle('groupesCours'), gc);
        const ga = window.db.getSync('groupeCoursActif', {}); ga.pratiqueId = id; window.db.setSync('groupeCoursActif', ga);
        const det = window.calculerDetailsNoteFinale(da); const sim = window.simulerIndices(da, id);
        return { riche: det && !det.erreur ? Math.round(det.noteFinale * 100) / 100 : (det && det.erreur), constructible: sim && sim.noteConstructible };
    }, { id: apres.id, da: F.da });
    expect(note).toEqual({ riche: 77.32, constructible: true });
});
