import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #915, LOT 2 (18 septembre 2026) — INSCRIRE UN·E ÉLÈVE AU REGISTRE LONGITUDINAL, SUR LE VRAI ÉCRAN.
//
// Labo › Suivi longitudinal, 768 px, trimestre ACTIF archivé (le pire cas : la garde CSS du mode archive ferme les
// champs et les boutons d'écriture ; le registre n'est pas une donnée du trimestre, la capture doit rester possible).
// Ce banc juge : la recherche par le vrai dispatcher (data-on-input), le choix et l'inscription par el.click()
// (aucun page.click, budget du runner), le stock des DEUX trimestres identique octet pour octet après la capture,
// un DA dans deux trimestres = un élève, deux dossiers ; cibles ≥ 44 px ; « Refaire la copie » au second passage (#917).
//
// LOT 3 (même jour) — R3 : la ligne de saisie unique sous la garde du mode archive (les champs .rl-champ restent ouverts, SANS
// « Permission d'écriture »), Entrée dans la note, le focus qui revient à la note, l'élève qui passe au suivant, le stock de #913
// repris à l'inscription et l'ancienne clé intacte. R4 : « Retirer du registre » — refusé au dialogue, rien ne bouge ; accepté,
// l'élève et ses résultats partent, les trimestres restent identiques octet pour octet. (Remplace resultats-ulterieurs-913.spec.js,
// retiré avec le bloc du Cadre.)
//
// LOT 4 (même jour) — R5 : le dossier déplié. « Voir le dossier » s'ouvre au clic, les évaluations et les indices se lisent,
// rien ne déborde à 768 px, les cibles font ≥ 44 px, et le texte reste lisible (contraste mesuré) dans les DEUX modes.
// 1.146.3 (retour de Grégoire à la porte des lots 3-4 : « prend beaucoup d'espace vertical ») : chaque évaluation est une TUILE
// dans le flux des badges du profil — R5 mesure au moins DEUX tuiles par rangée à 768 px, l'ordre de lecture chronologique
// (gauche → droite, puis haut → bas), et qu'une tuile dépliée ne déplace ni n'étire sa voisine de rangée.

const TA = 't915a'; // archivé, ACTIF
const TB = 't915b'; // non archivé
const DA1 = '9150001';
const DA2 = '9150002';

/** `dialogues` : { recus: [], accepter: bool } — sans lui, tout dialogue est une ERREUR du banc (aucun n'est attendu). `cadre` : sème le stock de #913. */
async function monter(page, { dialogues = null, cadre = false } = {}) {
    await page.setViewportSize({ width: 768, height: 1024 });
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => {
        if (!dialogues) { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); return; }
        dialogues.recus.push(d.message());
        (dialogues.accepter ? d.accept() : d.dismiss()).catch(() => {});
    });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function');
    await page.evaluate(({ TA, TB, DA1, DA2, cadre }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        if (cadre) window.db.setSync(TA + '_resultatsUlterieurs', { [DA1]: [{ cours: '601-102-MQ', trimestre: 'H2025', note: 78.5 }], [DA2]: [{ cours: '601-102-MQ', trimestre: 'H2025', note: 61 }] });
        const coursId = 'cours-915';
        window.db.setSync('trimestres', [
            { id: TA, nom: 'Automne 2024', annee: 2024, session: 'A', actif: true, archive: true },
            { id: TB, nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false, archive: false }
        ]);
        window.db.setSync('cours', [{ id: coursId, codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }]);
        window.db.setSync(TA + '_groupesCours', [{ id: 'GC915A', trimestreId: TA, coursId, groupeNum: '00001', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(TA + '_groupeEtudiants', [
            { da: DA1, nom: 'Gagnon', prenom: 'Léa', groupe: '00001', coursId, groupeCoursId: 'GC915A', statut: 'actif' },
            { da: DA2, nom: 'Roy', prenom: 'Max', groupe: '00001', coursId, groupeCoursId: 'GC915A' }
        ]);
        window.db.setSync(TA + '_evaluationsSauvegardees', [
            { id: 'EV1', etudiantDA: DA1, coursId, productionId: 'P1', grilleId: 'G1', criteres: [{ id: 'CR1', niveau: 'M' }], dateEvaluation: '2024-10-01T12:00:00.000Z' },
            { id: 'EV2', etudiantDA: DA2, coursId, productionId: 'P1', grilleId: 'G1', criteres: [] }
        ]);
        window.db.setSync(TA + '_grillesTemplates', [{ id: 'G1', nom: 'SRPNF × IDME', criteres: [{ id: 'CR1', nom: 'Structure' }] }]);
        window.db.setSync(TA + '_presences', [{ date: '2024-08-26', da: DA1, coursId, statut: 'present', heures: 2 }, { date: '2024-08-26', da: DA2, coursId, statut: 'absent', heures: 0 }]);
        window.db.setSync(TA + '_indicesCP', { [DA1]: { actuel: { C: 1, P: 0.8, details: { noteConstructible: true } }, historique: [] } });
        window.db.setSync(TB + '_groupesCours', [{ id: 'GC915B', trimestreId: TB, coursId, groupeNum: '00002', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(TB + '_groupeEtudiants', [{ da: DA1, nom: 'Gagnon', prenom: 'Léa', groupe: '00002', coursId, groupeCoursId: 'GC915B' }]);
        window.db.setSync(TB + '_evaluationsSauvegardees', []);
        window.db.setSync('trimestreActif', TA);
        window.db.setSync('infoCours', { id: coursId, codeCours: '601-101-MQ', groupe: '00001', _groupeCoursId: 'GC915A' });
        window.db.setSync('groupeCoursActif', { id: 'GC915A', trimestreId: TA });
    }, { TA, TB, DA1, DA2, cadre });
    // Le mode archive se pose au démarrage : on recharge sur le stock semé (une seule fois, sans `clear`).
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function'
        && typeof window.initialiserRegistreLongitudinal === 'function');
    // `offsetParent !== null` NE SUFFIT PAS sous WebKit : le contenu d'un <details> FERMÉ le garde non nul (mesuré le 18 sept. —
    // le banc comptait une cible repliée). Visible = rendu ET tous les <details> ancêtres ouverts (le <summary> d'un <details>
    // fermé reste visible, lui). Posée sur window APRÈS le rechargement : les page.evaluate du banc l'appellent.
    await page.evaluate(() => {
        window.__visible915 = (el) => {
            if (!el || el.offsetParent === null) return false;
            for (let d = el.parentElement && el.parentElement.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) {
                const sonResume = el.closest('summary');
                if (!d.open && !(sonResume && sonResume.parentElement === d)) return false;
            }
            return true;
        };
    });
    // Seule attente fixe du banc, justifiée : le démarrage réécrit les indices du trimestre actif de façon asynchrone
    // (mesuré : P semé 0,8, relu 0), sans aucun signal DOM à attendre ; l'empreinte « avant » se prend après ce délai.
    await page.waitForTimeout(500);
    return erreurs;
}

const stockDesTrimestres = (page) => page.evaluate(({ TA, TB }) => {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(TA + '_') || k.startsWith(TB + '_')) o[k] = localStorage.getItem(k); }
    return o;
}, { TA, TB });

async function ouvrirLeSousOnglet(page) {
    await page.evaluate(() => { window.afficherSection('labo'); window.afficherSousSection('labo-longitudinal'); });
    await page.waitForFunction(() => { const c = document.getElementById('rl-recherche'); return !!c && c.offsetParent !== null; }, null, { timeout: 10000 });
}

/** Tape dans le champ par le VRAI dispatcher (data-on-input, délégué sur document dans main.js). */
async function chercher(page, texte) {
    await page.evaluate((texte) => {
        const champ = document.getElementById('rl-recherche');
        champ.value = texte;
        champ.dispatchEvent(new Event('input', { bubbles: true }));
    }, texte);
}

const cliquer = (page, selecteur) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('absent : ' + s); el.click(); }, selecteur);

test.describe('#915 lot 2 — Suivi longitudinal, 768 px, trimestre actif archivé', () => {
    test('R1 · chercher, choisir, inscrire : deux dossiers pour un DA dans deux trimestres, et le stock des trimestres identique octet pour octet', async ({ page }) => {
        const erreurs = await monter(page);
        expect(await page.evaluate(() => document.body.classList.contains('mode-archive'))).toBe(true);
        await ouvrirLeSousOnglet(page);
        const avant = await stockDesTrimestres(page);
        expect(Object.keys(avant).length).toBeGreaterThan(5);

        // Le champ reste OUVERT sous la garde CSS du mode archive (type=search).
        const champ = await page.evaluate(() => { const c = document.getElementById('rl-recherche'); const cs = getComputedStyle(c); return { type: c.type, pointer: cs.pointerEvents, disabled: c.disabled, opacite: cs.opacity, hauteur: c.getBoundingClientRect().height }; });
        expect(champ.type).toBe('search');
        expect(champ.pointer).not.toBe('none');
        expect(champ.disabled).toBe(false);
        expect(Math.round(champ.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)

        await chercher(page, 'gag');
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-resultat').length === 1);
        const resultat = await page.evaluate(() => { const b = document.querySelector('#rl-resultats .rl-resultat-bouton'); return { texte: b.textContent, hauteur: b.getBoundingClientRect().height, da: b.dataset.da }; });
        expect(resultat.da).toBe(DA1);
        expect(resultat.texte).toContain('Gagnon, Léa');
        expect(resultat.texte).toContain('Automne 2024');
        expect(resultat.texte).toContain('Hiver 2026');
        expect(Math.round(resultat.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)

        await cliquer(page, '#rl-resultats .rl-resultat-bouton');
        await page.waitForFunction(() => !!document.getElementById('rl-inscrire'));
        const bouton = await page.evaluate(() => { const b = document.getElementById('rl-inscrire'); const cs = getComputedStyle(b); return { texte: b.textContent, hauteur: b.getBoundingClientRect().height, pointer: cs.pointerEvents, disabled: b.disabled, confirm: b.getAttribute('data-confirm') }; });
        expect(bouton.texte).toBe('Inscrire au registre');
        expect(Math.round(bouton.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)
        expect(bouton.pointer).not.toBe('none');
        expect(bouton.disabled).toBe(false);
        expect(bouton.confirm).toBeNull();

        // Ce que le stock porte JUSTE AVANT la capture (le démarrage de l'app recalcule les indices du trimestre actif,
        // même archivé — mesuré ici : P semé 0.8, relu 0 ; code étranger, hors lot) : la capture doit le copier tel quel.
        const cpAuStock = await page.evaluate(({ TA, DA1 }) => window.db.getSync(TA + '_indicesCP', {})[DA1] || null, { TA, DA1 });
        await cliquer(page, '#rl-inscrire');
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-eleve').length === 1, null, { timeout: 10000 });
        const registre = await page.evaluate(() => window.db.getSync('registreLongitudinal', null));
        expect(registre.format).toBe('registre-longitudinal');
        expect(Object.keys(registre.eleves)).toEqual([DA1]);
        const dossiers = registre.eleves[DA1].dossiers;
        expect(dossiers.map((d) => d.trimestre).sort()).toEqual([TA, TB].sort());
        const dA = dossiers.find((d) => d.trimestre === TA);
        expect(dA.evaluations.map((e) => e.id)).toEqual(['EV1']);
        expect(dA.presences).toHaveLength(1);
        expect(dA.indices.cp).toEqual(cpAuStock);
        expect(dA.grillesIds).toEqual(['G1']);
        expect(registre.modeles.grilles[TA + ':G1'].criteres).toHaveLength(1);
        expect(JSON.stringify(dossiers)).not.toContain(DA2);

        expect(await stockDesTrimestres(page)).toEqual(avant);

        const ligne = await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-eleve').textContent);
        expect(ligne).toContain('Gagnon, Léa');
        expect(ligne).toContain('Automne 2024');
        expect(ligne).toContain('Hiver 2026');
        expect(ligne).toMatch(/Copie du \d{4}-\d{2}-\d{2}/);
        const resume = await page.evaluate(() => document.querySelector('#rl-choix .rl-resume').textContent);
        // Lot 3 : les pluriels sont accordés (relevé de la porte terrain du 18 sept. : « 11 évaluation·s », « 1 dossier·s »).
        expect(resume).toMatch(/^1 évaluation · 1 séance · 1 grille : SRPNF × IDME · 2 dossiers, \d+ Ko — Copie du/);

        // Second passage (#917, retour de Grégoire du 18 sept.) : le bouton dit le geste, quitte le style principal,
        // garde sa cible de 44 px, et le dialogue nomme l'élève et ce qui ne bouge pas.
        const bouton2 = await page.evaluate(() => { const b = document.getElementById('rl-inscrire'); return { texte: b.textContent, confirm: b.getAttribute('data-confirm'), secondaire: b.classList.contains('btn-secondaire'), principal: b.classList.contains('btn-principal'), hauteur: b.getBoundingClientRect().height }; });
        expect(bouton2.texte).toBe('Refaire la copie');
        expect(bouton2.secondaire).toBe(true);
        expect(bouton2.principal).toBe(false);
        expect(Math.round(bouton2.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)
        expect(bouton2.confirm).toContain('Gagnon, Léa');
        expect(bouton2.confirm).toContain('remplacée');
        expect(bouton2.confirm).toContain('Tes trimestres ne sont pas modifiés');

        expect(erreurs).toEqual([]);
    });

    test('R2 · un nom qui n\'existe pas : la liste le dit ; rien n\'est écrit', async ({ page }) => {
        const erreurs = await monter(page);
        await ouvrirLeSousOnglet(page);
        await chercher(page, 'zzz');
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-vide').length === 1);
        expect(await page.evaluate(() => document.querySelector('#rl-resultats .rl-vide').textContent)).toBe('Aucun·e élève ne porte ce nom.');
        expect(await page.evaluate(() => window.db.getSync('registreLongitudinal', null))).toBeNull();
        expect(erreurs).toEqual([]);
    });

    /** Inscrit un·e élève par les vrais gestes : chercher, choisir, cliquer. */
    async function inscrire(page, motif, nbInscritsAttendu) {
        await chercher(page, motif);
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-resultat').length === 1);
        await cliquer(page, '#rl-resultats .rl-resultat-bouton');
        await page.waitForFunction(() => !!document.getElementById('rl-inscrire'));
        await cliquer(page, '#rl-inscrire');
        await page.waitForFunction((n) => document.querySelectorAll('#rl-zone-inscrits .rl-eleve').length === n, nbInscritsAttendu, { timeout: 10000 });
    }

    /** Remplit la ligne de saisie, pose le curseur dans « Note finale » et tape Entrée (la soumission implicite clique « Ajouter »). */
    async function saisir(page, { eleve, cours, trimestre, note }) {
        await page.evaluate(({ eleve, cours, trimestre, note }) => {
            const f = document.querySelector('#rl-zone-saisie form');
            if (eleve !== undefined) { f.elements.eleve.value = eleve; f.elements.eleve.dispatchEvent(new Event('change', { bubbles: true })); }
            if (cours !== undefined) f.elements.cours.value = cours;
            if (trimestre !== undefined) f.elements.trimestre.value = trimestre;
            f.elements.note.value = note;
            f.elements.note.focus();
        }, { eleve, cours, trimestre, note });
        await page.keyboard.press('Enter');
    }

    const resultatsAuRegistre = (page, da) => page.evaluate((da) => { const r = window.db.getSync('registreLongitudinal', null); return r && r.eleves[da] ? r.eleves[da].resultatsUlterieurs : null; }, da);

    test('R3 · lot 3 — la ligne de saisie unique sous le mode archive, SANS permission d\'écriture ; le stock du Cadre repris, l\'ancienne clé intacte', async ({ page }) => {
        const erreurs = await monter(page, { cadre: true });
        expect(await page.evaluate(() => document.body.classList.contains('mode-archive') && !document.body.classList.contains('mode-ecriture-temp'))).toBe(true);
        await ouvrirLeSousOnglet(page);
        const avant = await stockDesTrimestres(page);
        expect(avant[TA + '_resultatsUlterieurs']).toBeTruthy();

        // Avant toute inscription : pas de formulaire, et l'écran NOMME les deux élèves dont le Cadre porte un résultat.
        expect(await page.evaluate(() => !!document.querySelector('#rl-zone-saisie form'))).toBe(false);
        const enAttente = await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-en-attente').textContent);
        expect(enAttente).toContain('Gagnon, Léa');
        expect(enAttente).toContain('Roy, Max');
        expect(enAttente).toContain('1 résultat ultérieur');
        expect(await page.evaluate(() => window.db.getSync('registreLongitudinal', null))).toBeNull(); // ouvrir n'écrit rien

        await inscrire(page, 'gag', 1);
        await inscrire(page, 'roy', 2);
        // La reprise s'est faite À L'INSCRIPTION : le résultat du Cadre est sous le bon nom, et dit d'où il vient.
        expect(await resultatsAuRegistre(page, DA1)).toEqual([{ cours: '601-102-MQ', trimestre: 'H2025', note: 78.5, origine: 'cadre' }]);
        const ligneLea = await page.evaluate((da) => Array.from(document.querySelectorAll('#rl-zone-inscrits .rl-eleve')).find((li) => li.dataset.da === da).textContent, DA1);
        expect(ligneLea).toContain('601-102-MQ · H2025 · 78,5 — saisi dans le Cadre');
        expect(await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-en-attente'))).toBeNull();

        // Les champs restent OUVERTS sous la garde CSS du mode archive (.rl-champ, exception nommée d'index.html) ; cibles ≥ 44 px.
        const mesures = await page.evaluate(() => {
            const zone = document.getElementById('registre-longitudinal-conteneur').getBoundingClientRect();
            const cibles = Array.from(document.querySelectorAll('#rl-zone-saisie .rl-champ, #rl-zone-saisie .rl-cible, #rl-zone-inscrits .rl-cible')).filter((el) => window.__visible915(el));
            return {
                nb: cibles.length,
                fermes: cibles.filter((el) => getComputedStyle(el).pointerEvents === 'none' || el.disabled).map((el) => el.name || el.textContent),
                // arrondi : WebKit rend 43,99997 px pour min-height: 44px ; la liste NOMME la cible fautive
                petites: cibles.filter((el) => { const r = el.getBoundingClientRect(); return Math.round(r.height) < 44 || Math.round(r.width) < 44; })
                    .map((el) => el.tagName + ' ' + (el.name || el.textContent) + ' ' + Math.round(el.getBoundingClientRect().width) + '×' + Math.round(el.getBoundingClientRect().height)),
                horsZone: cibles.filter((el) => { const r = el.getBoundingClientRect(); return r.left < zone.left - 1 || r.right > zone.right + 1; }).length,
                debordePage: document.documentElement.scrollWidth > window.innerWidth,
                options: Array.from(document.querySelector('#rl-zone-saisie select').options).map((o) => o.textContent)
            };
        });
        // 4 champs + « Ajouter » ; 2 « Retirer du registre » ; 2 « Retirer » (un résultat du Cadre par élève) ; lot 4 : 2 « Voir le dossier ».
        expect(mesures.nb).toBe(11);
        expect(mesures.fermes).toEqual([]);
        expect(mesures.petites).toEqual([]);
        expect(mesures.horsZone).toBe(0);
        expect(mesures.debordePage).toBe(false);
        expect(mesures.options).toEqual(['Gagnon, Léa', 'Roy, Max']);

        await saisir(page, { eleve: DA1, cours: '601-103-MQ', trimestre: 'A2026', note: '64,5' });
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-resultat-ulterieur').length === 3, null, { timeout: 5000 });
        // La saisie suivante : le curseur est dans la note, le cours et le trimestre sont restés, l'élève est passé au suivant.
        const suite = await page.evaluate(() => { const a = document.activeElement; const f = a && a.closest('form'); return { champ: a && a.name, note: a && a.value, eleve: f && f.elements.eleve.value, cours: f && f.elements.cours.value, trimestre: f && f.elements.trimestre.value }; });
        expect(suite).toEqual({ champ: 'note', note: '', eleve: DA2, cours: '601-103-MQ', trimestre: 'A2026' });
        expect(await resultatsAuRegistre(page, DA1)).toEqual([{ cours: '601-102-MQ', trimestre: 'H2025', note: 78.5, origine: 'cadre' }, { cours: '601-103-MQ', trimestre: 'A2026', note: 64.5 }]);

        // Une note hors bornes : rien n'est écrit, l'écran le dit, et ce qui était tapé n'est pas perdu.
        await saisir(page, { note: '140' });
        await page.waitForFunction(() => (document.querySelector('#rl-zone-saisie .rl-refus') || {}).textContent === 'La note doit être un nombre entre 0 et 100.', null, { timeout: 5000 });
        expect(await page.evaluate(() => document.querySelector('#rl-zone-saisie input[name="note"]').value)).toBe('140');
        expect((await resultatsAuRegistre(page, DA2)).length).toBe(1);

        // « Retirer » un résultat venu du Cadre : il part du registre, il ne revient pas, et le Cadre n'a pas bougé.
        await page.evaluate((da) => Array.from(document.querySelectorAll('#rl-zone-inscrits .rl-eleve')).find((li) => li.dataset.da === da).querySelector('[data-action="retirerResultatLongitudinal"][data-index="0"]').click(), DA1);
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-resultat-ulterieur').length === 2, null, { timeout: 5000 });
        expect(await resultatsAuRegistre(page, DA1)).toEqual([{ cours: '601-103-MQ', trimestre: 'A2026', note: 64.5 }]);

        // La soumission du formulaire n'a pas rechargé la page, et AUCUN trimestre n'a été touché — l'ancienne clé comprise.
        expect(await page.evaluate(() => !!document.getElementById('rl-recherche'))).toBe(true);
        expect(await stockDesTrimestres(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    // #1007 (2a-2, 3 oct. 2026) — la question n'est plus posée par le dispatcher (`data-confirm`) mais par
    // `retirerEleveLongitudinal`, APRÈS la fenêtre du codex proposé (aucun codex actif dans ce banc : la
    // fenêtre « sans codex »). « Annuler » : aucune question, rien ne bouge ; « Supprimer sans codex » :
    // la question d'avant, mot pour mot.
    const FENETRE_CODEX = '#overlay-ui-dialogue';
    async function fenetreDuCodex(page, bouton) {
        await page.waitForFunction((sel) => { const o = document.querySelector(sel); return !!o && o.getClientRects().length > 0; }, FENETRE_CODEX, { timeout: 10000 });
        const f = await page.evaluate((sel) => { const o = document.querySelector(sel);
            return { titre: o.querySelector('.modal-titre').textContent, texte: o.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim() }; }, FENETRE_CODEX);
        await page.locator(FENETRE_CODEX + ' .modal-actions button', { hasText: bouton }).click();
        return f;
    }

    test('R4 · lot 3 — « Retirer du registre » : le dialogue dit ce qu\'il emporte ; refusé, rien ne bouge ; accepté, l\'élève part et les trimestres restent', async ({ page }) => {
        const dialogues = { recus: [], accepter: false };
        const erreurs = await monter(page, { dialogues });
        await ouvrirLeSousOnglet(page);
        await inscrire(page, 'gag', 1);
        await inscrire(page, 'roy', 2);
        await saisir(page, { eleve: DA1, cours: '601-102-MQ', trimestre: 'H2026', note: '78,5' });
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-resultat-ulterieur').length === 1, null, { timeout: 5000 });
        const avant = await stockDesTrimestres(page);
        const registreAvant = await page.evaluate(() => JSON.stringify(window.db.getSync('registreLongitudinal', null)));
        const retirerLea = () => page.evaluate((da) => Array.from(document.querySelectorAll('#rl-zone-inscrits .rl-eleve')).find((li) => li.dataset.da === da).querySelector('[data-action="retirerEleveLongitudinal"]').click(), DA1);

        // #1007 (2a-2) : la fenêtre du codex d'abord ; « Annuler » : aucune question, rien ne bouge.
        await retirerLea();
        const f = await fenetreDuCodex(page, 'Annuler');
        expect(f).toEqual({ titre: 'Écrire un codex avant de supprimer ?',
            texte: 'Retirer cet·te étudiant·e du registre efface pour de bon ses dossiers. Ton codex à jour pourra te les rendre, jusqu\'à ta mise à jour suivante.' });
        await page.waitForTimeout(300);
        expect(dialogues.recus).toEqual([]);
        expect(await page.evaluate(() => JSON.stringify(window.db.getSync('registreLongitudinal', null)))).toBe(registreAvant);

        // Refusé au dialogue : rien ne bouge.
        await retirerLea();
        await fenetreDuCodex(page, 'Supprimer sans codex');
        await expect.poll(() => dialogues.recus.length).toBe(1);
        expect(dialogues.recus[0]).toMatch(/^Retirer Gagnon, Léa du registre \? Sa copie du \d{4}-\d{2}-\d{2} \(2 dossiers\) sera effacée et ne pourra pas être retrouvée\./);
        expect(dialogues.recus[0]).toContain('Son résultat ultérieur sera effacé aussi : 601-102-MQ · H2026 · 78,5.');
        expect(dialogues.recus[0]).toContain('Tes trimestres ne sont pas modifiés.');
        expect(await page.evaluate(() => JSON.stringify(window.db.getSync('registreLongitudinal', null)))).toBe(registreAvant);

        // Accepté : l'élève, ses dossiers et ses résultats partent ; l'autre reste ; le choix en cours redevient « Inscrire au registre ».
        dialogues.accepter = true;
        await retirerLea();
        await fenetreDuCodex(page, 'Supprimer sans codex');
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-eleve').length === 1, null, { timeout: 10000 });
        const registre = await page.evaluate(() => window.db.getSync('registreLongitudinal', null));
        expect(Object.keys(registre.eleves)).toEqual([DA2]);
        expect(JSON.stringify(registre)).not.toContain(DA1);
        expect(Object.keys(registre.modeles.grilles)).toEqual([TA + ':G1']); // G1 sert encore au dossier de Max
        expect(await page.evaluate(() => Array.from(document.querySelector('#rl-zone-saisie select').options).map((o) => o.textContent))).toEqual(['Roy, Max']);
        expect(await stockDesTrimestres(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    /** Contraste WCAG entre deux couleurs CSS calculées (rgb/rgba), calculé côté Node sur les couleurs relevées dans la page. */
    function contraste(c1, c2) {
        const lum = (c) => {
            const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { v = Number(v) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const [clair, fonce] = [lum(c1), lum(c2)].sort((x, y) => y - x);
        return (clair + 0.05) / (fonce + 0.05);
    }

    test('R5 · lot 4 — le dossier déplié : lisible, sans débordement, cibles ≥ 44 px, dans les deux modes ; déplier n\'écrit rien', async ({ page }) => {
        const erreurs = await monter(page);
        // Cinq évaluations pour Léa, à la forme réelle (critereNom, niveauSelectionne), rangées DANS LE DÉSORDRE ; la 5e n'a rien à déplier.
        await page.evaluate(({ TA, DA1 }) => {
            // security-ok: fixtures littérales du banc, aucune source externe.
            const ev = (n, jour, extra) => Object.assign({ id: 'T' + n, etudiantDA: DA1, coursId: 'cours-915', productionNom: 'Artefact ' + n, grilleId: 'G1', grilleNom: 'SRPNF × IDME', echelleId: 'ECH1',
                dateEvaluation: '2024-10-' + jour + 'T12:00:00.000Z', noteFinale: 60 + n, niveauFinal: 'D', criteres: [{ critereId: 'CR1', critereNom: 'Structure', niveauSelectionne: 'D' }, { critereId: 'CR2', critereNom: 'Rigueur', niveauSelectionne: 'M' }],
                retroactionFinale: 'Tu commences à dégager les intentions et les procédés. '.repeat(4) }, extra || {});
            window.db.setSync(TA + '_evaluationsSauvegardees', [ev(3, '15'), ev(1, '01'), ev(4, '22'), ev(2, '08'), ev(5, '29', { criteres: [], retroactionFinale: '' })]);
            window.db.setSync(TA + '_echellesTemplates', [{ id: 'ECH1', nom: 'IDME', niveaux: [{ code: 'D', nom: 'En Développement' }, { code: 'M', nom: 'Maîtrisé' }] }]);
        }, { TA, DA1 });
        await ouvrirLeSousOnglet(page);
        await inscrire(page, 'gag', 1);
        const avant = await stockDesTrimestres(page);
        const registreAvant = await page.evaluate(() => JSON.stringify(window.db.getSync('registreLongitudinal', null)));

        const replie = await page.evaluate(() => { const d = document.querySelector('#rl-zone-inscrits .rl-dossier'); return { ouvert: d.open, resume: d.querySelector('summary').textContent, hauteur: Math.round(d.querySelector('summary').getBoundingClientRect().height) }; });
        expect(replie).toEqual({ ouvert: false, resume: 'Voir le dossier', hauteur: expect.any(Number) });
        expect(replie.hauteur).toBeGreaterThanOrEqual(44);

        await cliquer(page, '#rl-zone-inscrits .rl-dossier > summary');
        await page.waitForFunction(() => { const d = document.querySelector('#rl-zone-inscrits .rl-dossier'); return d.open && d.querySelector('.rl-tuile') && d.querySelector('.rl-tuile').offsetParent !== null; }, null, { timeout: 5000 });
        const texte = await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-dossier').innerText);
        expect(texte).toContain('Automne 2024 (601-101-MQ, gr. 00001)');
        expect(texte).toContain('Hiver 2026 (601-101-MQ, gr. 00002)');
        expect(texte).toContain('Indices au moment de la copie');
        expect(texte).toMatch(/Complétion : \d+ %/);
        expect(texte).toContain('Évaluations (5)');
        expect(texte).toContain('Aucune évaluation dans cette copie.');
        expect(texte).not.toMatch(/undefined|NaN|\bnull\b/);

        // LES TUILES. Production, date, note et niveau visibles d'emblée ; critères et rétroaction repliés dedans.
        const geometrie = () => page.evaluate(() => Array.from(document.querySelectorAll('#rl-zone-inscrits .rl-tuiles .rl-tuile')).map((t) => {
            const r = t.getBoundingClientRect();
            return { nom: t.querySelector('.rl-nom').textContent, balise: t.tagName, ouvert: !!t.open, x: Math.round(r.left), y: Math.round(r.top), l: Math.round(r.width), h: Math.round(r.height),
                entete: t.querySelector('.rl-tuile-entete').innerText.replace(/\n+/g, ' | '), critereVisible: window.__visible915(t.querySelector('.rl-criteres')) };
        }));
        const tuiles = await geometrie();
        expect(tuiles.map((t) => t.nom)).toEqual(['Artefact 1', 'Artefact 2', 'Artefact 3', 'Artefact 4', 'Artefact 5']); // chronologique, malgré le désordre du stock
        expect(tuiles[0].entete).toBe('Artefact 1 | 2024-10-01 | Note : 61 · D — En Développement | SRPNF × IDME');
        expect(tuiles.map((t) => t.balise)).toEqual(['DETAILS', 'DETAILS', 'DETAILS', 'DETAILS', 'DIV']); // la 5e n'a rien à déplier : pas de triangle
        expect(tuiles.some((t) => t.critereVisible)).toBe(false);
        // Au moins DEUX tuiles par rangée à 768 px, lues de gauche à droite puis de haut en bas.
        const rangees = [...new Set(tuiles.map((t) => t.y))].map((y) => tuiles.filter((t) => t.y === y));
        expect(rangees[0].length).toBeGreaterThanOrEqual(2);
        expect(rangees.length).toBeLessThan(tuiles.length);
        for (const rangee of rangees) expect(rangee.map((t) => t.x)).toEqual(rangee.map((t) => t.x).slice().sort((p, q) => p - q));
        expect(rangees.flat().map((t) => t.nom)).toEqual(tuiles.map((t) => t.nom));
        // Déplier la 1re : elle grandit, sa voisine de rangée ne bouge pas et ne s'étire pas.
        await cliquer(page, '#rl-zone-inscrits .rl-tuiles .rl-tuile > summary');
        await page.waitForFunction(() => window.__visible915(document.querySelector('#rl-zone-inscrits .rl-tuiles .rl-tuile .rl-criteres')), null, { timeout: 5000 });
        const apres = await geometrie();
        expect(apres[0].ouvert).toBe(true);
        expect(apres[0].h).toBeGreaterThan(tuiles[0].h);
        expect(apres[0].l).toBe(tuiles[0].l);
        expect({ x: apres[1].x, y: apres[1].y, l: apres[1].l, h: apres[1].h }).toEqual({ x: tuiles[1].x, y: tuiles[1].y, l: tuiles[1].l, h: tuiles[1].h });
        const ouverte = await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-tuiles .rl-tuile').innerText);
        expect(ouverte).toContain('Structure : D — En Développement');
        expect(ouverte).toContain('Rétroaction');
        expect(ouverte).toContain('Tu commences à dégager');

        for (const mode of ['sombre', 'clair']) {
            await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
            const releve = await page.evaluate(() => {
                const dossier = document.querySelector('#rl-zone-inscrits .rl-dossier');
                const zone = document.getElementById('registre-longitudinal-conteneur').getBoundingClientRect();
                const fondDe = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(255, 255, 255)'; };
                const textes = Array.from(dossier.querySelectorAll('summary, h4, h5, p, li, .rl-tuile-entete span')).filter((el) => window.__visible915(el) && el.textContent.trim());
                return {
                    couleurs: textes.map((el) => ({ quoi: el.tagName + ' ' + el.textContent.trim().slice(0, 30), texte: getComputedStyle(el).color, fond: fondDe(el) })),
                    petites: Array.from(dossier.querySelectorAll('summary')).filter((el) => window.__visible915(el) && Math.round(el.getBoundingClientRect().height) < 44).map((el) => el.textContent.slice(0, 30) + ' ' + Math.round(el.getBoundingClientRect().height)),
                    horsZone: textes.filter((el) => { const r = el.getBoundingClientRect(); return r.left < zone.left - 1 || r.right > zone.right + 1; }).map((el) => el.textContent.slice(0, 30)),
                    debordePage: document.documentElement.scrollWidth > window.innerWidth
                };
            });
            const illisibles = releve.couleurs.filter((c) => contraste(c.texte, c.fond) < 4.5).map((c) => mode + ' · ' + c.quoi + ' · ' + c.texte + ' sur ' + c.fond);
            expect(releve.couleurs.length).toBeGreaterThan(8); // le relevé mesure quelque chose
            expect(illisibles).toEqual([]);
            expect(releve.petites).toEqual([]);
            expect(releve.horsZone).toEqual([]);
            expect(releve.debordePage).toBe(false);
        }

        // Déplier est un rendu : ni le registre ni les trimestres n'ont bougé.
        expect(await page.evaluate(() => JSON.stringify(window.db.getSync('registreLongitudinal', null)))).toBe(registreAvant);
        expect(await stockDesTrimestres(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    // Bogue signalé par Grégoire le 28 sept. 2026 (1.160.4) : bandeau « MODE ANONYMISATION », et l'écran disait « A., Benjamin ».
    // Sur la vraie page : le bouton de l'en-tête (changerMode) redessine le sous-onglet, les noms deviennent des pseudonymes
    // — liste, sélecteur de saisie, data-confirm — puis reviennent au retour en mode normal.
    test('R6 · mode anonymisation : aucun vrai nom à l\'écran, et la bascule redessine le sous-onglet', async ({ page }) => {
        const erreurs = await monter(page);
        await ouvrirLeSousOnglet(page);
        await chercher(page, 'gag');
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-resultat').length === 1);
        await cliquer(page, '#rl-resultats .rl-resultat-bouton');
        await page.waitForFunction(() => !!document.getElementById('rl-inscrire'));
        await cliquer(page, '#rl-inscrire');
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-eleve').length === 1, null, { timeout: 10000 });

        const lireEcran = () => page.evaluate(() => {
            const c = document.getElementById('registre-longitudinal-conteneur');
            // #1007 (2a-2) : la question de « Retirer du registre » vit dans `data-question` (posée par la fonction).
            const confirms = Array.from(c.querySelectorAll('[data-confirm], [data-question]')).map((b) => b.getAttribute('data-confirm') || b.getAttribute('data-question'));
            return { texte: c.textContent, confirms: confirms.join(' | '), options: Array.from(c.querySelectorAll('#rl-zone-saisie select option')).map((o) => o.textContent) };
        });
        expect((await lireEcran()).texte).toContain('Gagnon, Léa');

        await page.evaluate(() => changerMode(MODES.ANONYMISATION));
        await page.waitForFunction(() => document.getElementById('registre-longitudinal-conteneur').textContent.includes('Élève R'), null, { timeout: 10000 });
        const anonyme = await lireEcran();
        for (const vrai of ['Gagnon', 'Léa']) {
            expect(anonyme.texte).not.toContain(vrai);
            expect(anonyme.confirms).not.toContain(vrai);
        }
        expect(anonyme.options).toEqual(['Élève R1']);
        expect(anonyme.confirms).toContain('Élève R1');

        await page.evaluate(() => changerMode(MODES.NORMAL));
        await page.waitForFunction(() => document.getElementById('registre-longitudinal-conteneur').textContent.includes('Gagnon, Léa'), null, { timeout: 10000 });
        expect((await lireEcran()).texte).not.toContain('Élève R');
        expect(erreurs).toEqual([]);
    });
});
