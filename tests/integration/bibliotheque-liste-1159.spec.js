import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1159=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1159 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1159 (25 oct. 2026) — LES TROIS LISTES SIMPLES (lot 6 du plan du 24 oct.) : les cours, les
// trimestres, les groupes-cours. Consigne : plans de travail/CONSIGNE-LOT-2026-10-25-bibliotheques-
// deux-colonnes-6.md. Mots validés par Grégoire (cours : 25 oct., 16 h 56 ; trimestres et groupes-cours :
// 19 h 06).
//
// Dans le vrai index.html, depuis la démonstration, par le vrai bouton « Consulter la bibliothèque »
// du Cadre, à 1440 et à 820 px :
//   · les mots, mot pour mot : titres, phrases, boutons des rangées, ⋮, « Actif » / « Ouvert » en clair,
//     les groupes repliés « Mis de côté (n) » et « Clos (n) » ; les mots d'avant partis ;
//   · chaque geste de la rangée et de ⋮ appelle l'action d'aujourd'hui (data-action, data-param) ;
//   · « Mettre de côté » envoie la rangée dans le groupe replié, « Remettre… » la ramène ; le compte suit ;
//   · le trimestre actif n'a ni bouton ni ⋮ ;
//   · aucune trace de « dropdown » dans la fenêtre des groupes-cours, ni texte ni bulle ;
//   · un nom hostile s'affiche en texte (le composant échappe).
// Noms fictifs. Contexte Playwright neuf à chaque essai.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · mots : 'Mettre de côté' → 'Retirer de ma sélection' dans cours.js → « les cours » ROUGIT ;
//   · action : `action: 'ajouterCoursIndividuel'` → `'retirerCoursDeBibliotheque'` sur « Remettre dans mes
//     cours » → « les cours » ROUGIT ;
//   · redessin : `await rafraichirBibliothequeCours()` → `fermerModalBibliothequeCours()` dans
//     `retirerCoursDeBibliotheque` → « Mettre de côté, puis Remettre » (cours) ROUGIT ;
//   · compte : `rangeesRepli.length` → `0` dans `creerFenetreListe` → « Mis de côté (n) » ROUGIT ;
//   · espace : la boîte `<span>` autour du titre et du compte retirée → « les cours : les mots » ROUGIT
//     (« Mis de côté(1) » au rendu ; le textContent, lui, gardait l'espace : trouvé sur les captures) ;
//   · trimestre actif : `} else if (!estActif) {` → `} else {` → « les trimestres » ROUGIT ;
//   · dropdown : la bulle 'Afficher dans le dropdown' remise sur « Remettre dans le menu » → « les
//     groupes-cours » ROUGIT ;
//   · échappement : `echapperHtml(r.nom)` → `r.nom` dans `_renderRangee` → « nom hostile » ROUGIT.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const NOM_HOSTILE = 'Hiver 2033 <img src=x data-banc-1159="1"> (fictif)';

/** La démonstration, puis les fiches fictives du banc (fixtures littérales). */
async function ouvrirDemo(page, largeur) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
    await page.evaluate(async (nomHostile) => {
        // security-ok: fixtures littérales écrites par le banc, aucune source externe
        const trimestres = window.db.getSync('trimestres', []).filter(t => !/^[ha]20(32|33)$/.test(t.id));
        window.db.setSync('trimestres', trimestres.concat([   // security-ok: fixture littérale du banc
            { id: 'h2033', nom: nomHostile, annee: 2033, session: 'H', actif: false, archive: false },
            { id: 'h2032', nom: 'Hiver 2032 (fictif)', annee: 2032, session: 'H', actif: false, archive: true, dateFin: '2032-05-20' }
        ]));
        // Idempotentes : une recharge (les captures) ne les double pas.
        const cours = ((await window.db.get('cours')) || []).filter(c => !/^COURS_BANC_/.test(c.id));
        await window.db.set('cours', cours.map(c => Object.assign({}, c, { actif: false })).concat([   // security-ok: fixture littérale du banc
            { id: 'COURS_BANC_1', codeCours: '999-BAN-01', nomCours: 'Cours fictif du banc', dansBibliotheque: true, actif: true,
              prenomEnseignant: 'Prof', nomEnseignant: 'Fictif', session: 'A', annee: 2032, competence: 'Compétence fictive du banc' },
            { id: 'COURS_BANC_2', codeCours: '999-BAN-02', nomCours: 'Autre cours fictif', dansBibliotheque: false, session: 'H', annee: 2031 }
        ]));
        const cleGC = window.cle('groupesCours');
        window.db.setSync(cleGC, window.db.getSync(cleGC, []).filter(g => !/^GC_BANC_/.test(g.id)).concat([   // security-ok: fixture littérale du banc
            { id: 'GC_BANC_VISIBLE', coursId: 'COURS_BANC_1', groupeNum: '09901', dansSidebar: true },
            { id: 'GC_BANC_COTE', coursId: 'COURS_BANC_1', groupeNum: '09902', dansSidebar: false }
        ]));
        Codex.proposerAvantSuppression = async () => true;   // la fenêtre du codex (#1007) a ses propres bancs
    }, NOM_HOSTILE);
    await page.evaluate(() => { window.afficherSection('calendrier'); window.afficherSousSection('calendrier-trimestre'); });
    await pause(page, 900);
    await page.evaluate(() => { document.getElementById('overlay-backup-reminder')?.remove(); document.getElementById('transition-bandeau')?.remove(); });
    return erreurs;
}

const FENETRES = {
    cours: { accordeon: 'accordeon-cours', action: 'ouvrirModalBibliothequeCours', id: '#modalBibliothequeCours' },
    trimestres: { accordeon: 'accordeon-gestion-trimestres', action: 'ouvrirBibliothequeTrimestreV2', id: '#modalBibliothequeTrimestres' },
    groupesCours: { accordeon: 'accordeon-groupe-cours', action: 'ouvrirModalBibliothequeGroupeCours', id: '#modalBibliothequeGroupeCours' }
};

/** Le geste réel : l'accordéon du Cadre déplié, son bouton « Consulter la bibliothèque ». */
async function ouvrir(page, cle) {
    const f = FENETRES[cle];
    const ferme = await page.evaluate((id) => document.getElementById(id).classList.contains('ferme'), f.accordeon);
    if (ferme) {
        await page.locator(`#${f.accordeon} > .accordeon-header`).click();
        await pause(page, 600);
    }
    const bouton = page.locator(`#${f.accordeon} [data-action="${f.action}"]`);
    await bouton.scrollIntoViewIfNeeded();
    await bouton.click();
    await expect(page.locator(f.id + ' .biblio2-fenetre--liste')).toBeVisible();
    await page.mouse.move(5, 5);
    return page.locator(f.id);
}

const liste = (fen) => fen.locator('.biblio2-panneau--liste > .biblio2-liste > .biblio2-rangee');
const repli = (fen) => fen.locator('.biblio2-panneau--liste > details.biblio2-repli');
const rangeesRepli = (fen) => repli(fen).locator('.biblio2-liste > .biblio2-rangee');
const rangeeId = (fen, id) => fen.locator(`.biblio2-rangee[data-biblio-item-id="${id}"]`);
const texte = (loc) => loc.evaluate(e => e.textContent.replace(/\s+/g, ' ').trim());
/** Les gestes d'une rangée : son bouton, puis son ⋮ ({label, action, param} ; un trait : '—'). */
const gestes = (rangee) => rangee.evaluate((li) => {
    const lire = (b) => ({ label: b.textContent.replace(/\s+/g, ' ').trim(), action: b.getAttribute('data-action'), param: b.getAttribute('data-param'), title: b.getAttribute('title') });
    const bouton = li.querySelector('.biblio2-rangee-actions > .biblio2-passage');
    const pop = li.querySelector('.biblio-menu-popover');
    return {
        bouton: bouton ? lire(bouton) : null,
        kebab: !!li.querySelector('.biblio2-kebab'),
        menu: pop ? [...pop.children].map(e => e.tagName === 'HR' ? '—' : lire(e)) : []
    };
});
const ligne = (rangee) => texte(rangee.locator('.biblio2-rangee-meta'));

for (const largeur of [1440, 820]) {
    test.describe(`à ${largeur} px`, () => {

        test('les cours : les mots, les gestes et leurs actions ; « Mis de côté (n) » replié', async ({ page }) => {
            const erreurs = await ouvrirDemo(page, largeur);
            const fen = await ouvrir(page, 'cours');
            await expect(fen.locator('.biblio2-titre')).toHaveText('Bibliothèque de cours');
            await expect(fen.locator('.biblio2-fenetre > .biblio2-phrase')).toHaveText('Gère tes configurations de cours');
            await expect(fen.locator('.biblio2-btn-fichiers')).toHaveText('Importer ou exporter ▾');

            const tous = await page.evaluate(async () => (await db.get('cours')) || []);
            const dansListe = tous.filter(c => c.dansBibliotheque !== false).length;
            const deCote = tous.filter(c => c.dansBibliotheque === false).length;
            await expect(liste(fen)).toHaveCount(dansListe);
            await expect(rangeesRepli(fen)).toHaveCount(deCote);
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${deCote})`);
            await expect(repli(fen)).not.toHaveAttribute('open', '');
            // Au rendu (innerText), pas seulement au texte : l'intitulé est en `flex`.
            expect(await repli(fen).locator('summary').evaluate(e => e.innerText.trim())).toBe(`Mis de côté (${deCote})`);

            const r1 = rangeeId(fen, 'COURS_BANC_1');
            expect(await ligne(r1)).toBe('Actif • Prof Fictif • A2032');
            const g1 = await gestes(r1);
            expect(g1.bouton).toMatchObject({ label: 'Reprendre dans ce trimestre', action: 'reprendreCoursDansTrimestreActif', param: 'COURS_BANC_1' });
            expect(g1.menu.map(m => m === '—' ? m : [m.label, m.action, m.param])).toEqual([
                ['Exporter', 'exporterUnCours', 'COURS_BANC_1'],
                ['Mettre de côté', 'retirerCoursDeBibliotheque', 'COURS_BANC_1'],
                '—',
                ['Supprimer la fiche', 'supprimerFicheCours', 'COURS_BANC_1']
            ]);
            const g2 = await gestes(rangeeId(fen, 'COURS_BANC_2'));
            expect(g2.bouton).toMatchObject({ label: 'Remettre dans mes cours', action: 'ajouterCoursIndividuel', param: 'COURS_BANC_2' });
            expect(g2.menu.map(m => [m.label, m.action])).toEqual([['Supprimer la fiche', 'supprimerFicheCours']]);
            // Une seule ligne de rangée sur un cours sans « Actif » : pas de mot en trop.
            expect(await ligne(rangeeId(fen, 'COURS_BANC_2'))).toBe('H2031');

            const menuFichiers = await fen.locator('.biblio2-entete .biblio-menu-popover .biblio-menu-item').evaluateAll(bs => bs.map(b => [b.textContent.trim(), b.getAttribute('data-action')]));
            expect(menuFichiers).toEqual([['Importer des cours', 'ouvrirFilePickerImportCours'], ['Exporter tous mes cours', 'partagerTousLesCours']]);
            await expect(fen.locator('#fichier-import-cours-modal')).toHaveAttribute('data-on-change', 'importerCoursSimple');

            const tout = await texte(fen);
            for (const ancien of ['Retirer de ma sélection', 'Déposer dans les cours disponibles', 'Ajouter à ma sélection', 'Cours dans ta sélection', 'Cours disponibles']) {
                expect(tout, ancien).not.toContain(ancien);
            }
            expect(erreurs).toEqual([]);
        });

        test('les cours : « Mettre de côté » envoie la rangée dans le groupe replié, « Remettre dans mes cours » la ramène', async ({ page }) => {
            const erreurs = await ouvrirDemo(page, largeur);
            let fen = await ouvrir(page, 'cours');
            const n = await rangeesRepli(fen).count();
            const r1 = rangeeId(fen, 'COURS_BANC_1');
            await r1.locator('.biblio2-kebab').click();
            await r1.locator('.biblio-menu-item', { hasText: 'Mettre de côté' }).click();
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${n + 1})`);
            await expect(repli(fen).locator('.biblio2-rangee[data-biblio-item-id="COURS_BANC_1"]')).toHaveCount(1);
            await expect(liste(fen).and(page.locator('[data-biblio-item-id="COURS_BANC_1"]'))).toHaveCount(0);
            const apres = await page.evaluate(async () => (await db.get('cours')).find(c => c.id === 'COURS_BANC_1'));
            expect(apres).toMatchObject({ dansBibliotheque: false, actif: false });
            expect(apres.metadata_cc).toBeUndefined();

            await repli(fen).locator('summary').click();
            const deCote = repli(fen).locator('.biblio2-rangee[data-biblio-item-id="COURS_BANC_1"]');
            await expect(deCote.locator('.biblio2-passage')).toHaveText('Remettre dans mes cours');
            await deCote.locator('.biblio2-passage').click();
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${n})`);
            await expect(liste(fen).and(page.locator('[data-biblio-item-id="COURS_BANC_1"]'))).toHaveCount(1);
            // Le repli ouvert le reste au redessin.
            await expect(repli(fen)).toHaveAttribute('open', '');
            expect(erreurs).toEqual([]);
        });

        test('les trimestres : les mots, les gestes et leurs actions ; l\'actif sans bouton ni ⋮ ; « Clos (n) » replié', async ({ page }) => {
            const erreurs = await ouvrirDemo(page, largeur);
            const fen = await ouvrir(page, 'trimestres');
            await expect(fen.locator('.biblio2-titre')).toHaveText('Bibliothèque des trimestres');
            await expect(fen.locator('.biblio2-fenetre > .biblio2-phrase')).toHaveText('Active, clos ou rouvre tes trimestres.');

            const tous = await page.evaluate(() => obtenirTrimestres());
            const ouverts = tous.filter(t => !t.archive);
            const clos = tous.filter(t => t.archive);
            await expect(liste(fen)).toHaveCount(ouverts.length);
            await expect(repli(fen).locator('summary')).toHaveText(`Clos (${clos.length})`);
            await expect(repli(fen)).not.toHaveAttribute('open', '');

            const actif = ouverts.find(t => t.actif);
            expect(actif, 'la démonstration a un trimestre actif').toBeTruthy();
            const ra = rangeeId(fen, actif.id);
            expect(await ligne(ra)).toBe('Actif');
            const ga = await gestes(ra);
            expect(ga.bouton).toBeNull();
            expect(ga.kebab).toBe(false);

            const ro = rangeeId(fen, 'h2033');
            expect(await ligne(ro)).toBe('Ouvert');
            const go = await gestes(ro);
            expect(go.bouton).toMatchObject({ label: 'Activer', action: 'changerTrimestreActifV2', param: 'h2033' });
            expect(go.menu.map(m => m === '—' ? m : [m.label, m.action, m.param])).toEqual([
                ['Clore', 'confirmerArchivage', 'h2033'], '—', ['Supprimer…', 'confirmerSuppressionTrimestre', 'h2033']
            ]);

            const mots = await page.evaluate(() => [ReserveTrimestre, ReserveCopies, ReserveRenvoyer].map(R => [R.MOTS.menu, R.ACTION]));
            const gc = await gestes(rangeeId(fen, 'h2032'));
            expect(await ligne(rangeeId(fen, 'h2032'))).toBe('Clos');
            expect(gc.bouton).toMatchObject({ label: 'Rouvrir', action: 'confirmerDesarchivage', param: 'h2032' });
            expect(gc.menu.map(m => m === '—' ? m : [m.label, m.action])).toEqual([
                ...mots, '—', ['Supprimer…', 'confirmerSuppressionTrimestre']
            ]);

            const tout = await texte(fen);
            for (const ancien of ['📚', 'Trimestre actuellement actif', 'Disponible', 'Trimestres disponibles', 'Trimestres clos', 'Aucun trimestre actif']) {
                expect(tout, ancien).not.toContain(ancien);
            }
            expect(erreurs).toEqual([]);
        });

        test('les trimestres : un nom hostile s\'affiche en texte', async ({ page }) => {
            await ouvrirDemo(page, largeur);
            const fen = await ouvrir(page, 'trimestres');
            await expect(rangeeId(fen, 'h2033').locator('.biblio2-rangee-nom')).toHaveText(NOM_HOSTILE);
            await expect(fen.locator('[data-banc-1159]')).toHaveCount(0);
        });

        test('les groupes-cours : les mots, les gestes et leurs actions ; « Mis de côté (n) » ; aucune trace de « dropdown »', async ({ page }) => {
            const erreurs = await ouvrirDemo(page, largeur);
            const fen = await ouvrir(page, 'groupesCours');
            await expect(fen.locator('.biblio2-titre')).toHaveText('Bibliothèque des groupes-cours');
            await expect(fen.locator('.biblio2-fenetre > .biblio2-phrase')).toHaveText('Les groupes-cours que le menu de l\'en-tête te propose.');

            const { visibles, deCote, actifId } = await page.evaluate(() => {
                const gcs = db.getSync(cle('groupesCours'), []);
                return { visibles: gcs.filter(g => g.dansSidebar !== false).length, deCote: gcs.filter(g => g.dansSidebar === false).length,
                    actifId: (db.getSync('groupeCoursActif', null) || {}).id };
            });
            await expect(liste(fen)).toHaveCount(visibles);
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${deCote})`);
            await expect(repli(fen)).not.toHaveAttribute('open', '');

            expect(actifId, 'la démonstration a un groupe-cours actif').toBeTruthy();
            const ra = rangeeId(fen, actifId);
            expect(await ligne(ra)).toMatch(/^Actif( •|$)/);
            const ga = await gestes(ra);
            expect(ga.bouton).toBeNull();
            expect(ga.menu.map(m => m === '—' ? m : [m.label, m.action])).toEqual([
                ['Mettre de côté', 'masquerGroupeCoursDepuisBibliotheque'], '—', ['Supprimer', 'supprimerGroupeCoursDepuisBibliotheque']
            ]);

            const rv = rangeeId(fen, 'GC_BANC_VISIBLE');
            await expect(rv.locator('.biblio2-rangee-nom')).toHaveText('999-BAN-01 — Groupe 09901');
            expect(await ligne(rv)).not.toMatch(/Actif/);
            const gv = await gestes(rv);
            expect(gv.bouton).toMatchObject({ label: 'Activer', action: 'activerGroupeCoursDepuisBibliotheque', param: 'GC_BANC_VISIBLE' });
            expect(gv.menu.map(m => m === '—' ? m : [m.label, m.action, m.param])).toEqual([
                ['Mettre de côté', 'masquerGroupeCoursDepuisBibliotheque', 'GC_BANC_VISIBLE'], '—',
                ['Supprimer', 'supprimerGroupeCoursDepuisBibliotheque', 'GC_BANC_VISIBLE']
            ]);
            const gm = await gestes(rangeeId(fen, 'GC_BANC_COTE'));
            expect(gm.bouton).toMatchObject({ label: 'Remettre dans le menu', action: 'afficherGroupeCoursDepuisBibliotheque', param: 'GC_BANC_COTE' });
            expect(gm.menu.map(m => [m.label, m.action])).toEqual([['Supprimer', 'supprimerGroupeCoursDepuisBibliotheque']]);

            // Ni dans les mots, ni dans les bulles, ni dans aucun attribut de la fenêtre.
            const html = await fen.evaluate(e => e.outerHTML);
            expect(html.toLowerCase()).not.toContain('dropdown');
            for (const ancien of ['Masquer', 'Afficher', 'Groupe-cours masqués', 'Bibliothèque groupe-cours', 'Gère les groupes-cours']) {
                expect(await texte(fen), ancien).not.toContain(ancien);
            }
            expect(erreurs).toEqual([]);
        });

        test('les groupes-cours : « Mettre de côté » envoie la rangée dans le groupe replié, « Remettre dans le menu » la ramène', async ({ page }) => {
            const erreurs = await ouvrirDemo(page, largeur);
            const fen = await ouvrir(page, 'groupesCours');
            const n = await rangeesRepli(fen).count();
            const rv = rangeeId(fen, 'GC_BANC_VISIBLE');
            await rv.locator('.biblio2-kebab').click();
            await rv.locator('.biblio-menu-item', { hasText: 'Mettre de côté' }).click();
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${n + 1})`);
            await expect(repli(fen).locator('.biblio2-rangee[data-biblio-item-id="GC_BANC_VISIBLE"]')).toHaveCount(1);
            expect(await page.evaluate(() => db.getSync(cle('groupesCours'), []).find(g => g.id === 'GC_BANC_VISIBLE').dansSidebar)).toBe(false);

            await repli(fen).locator('summary').click();
            await repli(fen).locator('.biblio2-rangee[data-biblio-item-id="GC_BANC_VISIBLE"] .biblio2-passage').click();
            await expect(repli(fen).locator('summary')).toHaveText(`Mis de côté (${n})`);
            await expect(liste(fen).and(page.locator('[data-biblio-item-id="GC_BANC_VISIBLE"]'))).toHaveCount(1);
            expect(await page.evaluate(() => db.getSync(cle('groupesCours'), []).find(g => g.id === 'GC_BANC_VISIBLE').dansSidebar)).toBe(true);
            expect(erreurs).toEqual([]);
        });

        test('les trois fenêtres tiennent dans la largeur ; cibles de 44 px ; Échap ferme', async ({ page }) => {
            await ouvrirDemo(page, largeur);
            for (const cle of Object.keys(FENETRES)) {
                const fen = await ouvrir(page, cle);
                await repli(fen).locator('summary').click();
                const m = await fen.evaluate((e) => {
                    const f = e.querySelector('.biblio2-fenetre');
                    const cibles = [...f.querySelectorAll('.biblio2-passage, .biblio2-kebab, .biblio2-repli-titre, .biblio2-fermer')]
                        .filter(b => b.getClientRects().length);
                    return { deborde: f.scrollWidth - f.clientWidth, droite: f.getBoundingClientRect().right, vue: window.innerWidth,
                        petites: cibles.filter(b => b.getBoundingClientRect().height < 44).map(b => b.className) };
                });
                expect(m.deborde, cle + ' sans défilement horizontal').toBeLessThanOrEqual(0);
                expect(m.droite, cle + ' dans la vue').toBeLessThanOrEqual(m.vue);
                expect(m.petites, cle + ' 44 px').toEqual([]);
                await page.keyboard.press('Escape');
                await expect(fen).toHaveCount(0);
            }
        });
    });
}

test('captures pour Grégoire : les trois fenêtres, Mac 1440 clair et sombre (un groupe replié ouvert), iPad 820 clair', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1159 non posée');
    test.setTimeout(180000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    const prises = [[1440, true], [1440, false], [820, false]];
    for (const [largeur, sombre] of prises) {
        await ouvrirDemo(page, largeur);
        await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
        // Pour Grégoire, un nom ordinaire : le nom hostile a son propre essai.
        await page.evaluate(() => window.db.setSync('trimestres', window.db.getSync('trimestres', [])   // security-ok: fixture littérale du banc
            .map(t => t.id === 'h2033' ? Object.assign({}, t, { nom: 'Hiver 2033 (fictif)' }) : t)));
        for (const cle of Object.keys(FENETRES)) {
            const fen = await ouvrir(page, cle);
            await repli(fen).locator('summary').click();
            await pause(page, 300);
            const appareil = largeur === 1440 ? 'mac' : 'ipad';
            await page.screenshot({ path: path.join(dossierCaptures, `${cle}-${appareil}-${largeur}-${sombre ? 'sombre' : 'clair'}.png`) });
            await page.keyboard.press('Escape');
        }
    }
});
