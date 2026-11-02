import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA PALETTE RÉTROACTION LAISSE LA PLACE AU TEXTE (consigne du 1er nov. 2026 ; ébauches `palette-retroaction-*`).
//
// La condition de Grégoire : « Générale », « Spécifique » et « Bilan » s'affichent entièrement, jamais coupés.
// ⚠ AU DOIGT (`hasTouch`) : l'iPad est la cible. Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre).
// Noms fictifs (règle 6).

test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });

const RETROACTION = 'travaux-palette-eval-retro';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const TOUTES = { description: true, objectif: true, tache: true, adresse: true, contexte: true, affichageNote: 'lettre' };
const CONTEXTE = 'Contexte fictif de la cartouche témoin.';

async function ouvrir(page, { options = TOUTES, positions = {}, verrouillee = false } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.executerActionEval === 'function', null, { timeout: 30000 });
    await page.evaluate(({ options, positions, verrouillee, CONTEXTE }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        Object.entries(positions).forEach(([id, pos]) => localStorage.setItem(id + '-pos', JSON.stringify(pos)));
        const T = 'tretro', coursId = 'cours-retro';
        const criteres = ['Structure', 'Rigueur', 'Nuance'].map((nom, i) => ({ id: 'c' + i, nom, ponderation: 30, type: 'holistique', description: 'Description de ' + nom }));
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'M', nom: 'Maîtrisé', min: 55, max: 100, valeurCalcul: 80 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCR', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TESTRETRO', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GCR' }]);
        window.db.setSync(T + '_productions', [{ id: 'pR', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GR', echelleId: 'ER', groupeCoursId: 'GCR', description: 'Activité fictive', objectif: 'Objectif fictif', tache: 'Tâche fictive' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GR', nom: 'Grille témoin', type: 'holistique', criteres }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ER', nom: 'Échelle témoin', niveaux }]);
        window.db.setSync(T + '_cartouches_GR', [{ id: 'CR', nom: 'Cartouche témoin', grilleId: 'GR', niveaux, criteres, commentaires: {}, contexte: CONTEXTE }]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVR', etudiantDA: 'TESTRETRO', productionId: 'pR', groupeCoursId: 'GCR', coursId, fichierId: 'FTR',
            grilleId: 'GR', echelleId: 'ER', cartoucheId: 'CR', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee,
            criteres: criteres.map((c) => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: 'M', ponderation: c.ponderation, retroaction: '' })),
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {}, optionsAffichage: options
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FTR', etudiantDA: 'TESTRETRO', productionId: 'pR', coursId, groupeCoursId: 'GCR',
            nomFichier: 'FICTIF_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCR' });
        window.db.setSync('groupeCoursActif', { id: 'GCR', trimestreId: T });
    }, { options, positions, verrouillee, CONTEXTE });
    await page.evaluate((png) => {
        window.definirPreference('accompagnementActif', false); // ses bulles de découverte couvrent la palette, sans prévenir
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        window.travauxStockage.recupererBlob = async function () { return copie; };
    }, PNG);
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    // pause-gardee : l'initialisation du module, lancée à +100 ms (#761), ne laisse aucune trace dans le DOM (mesuré sur 560 ms).
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await page.evaluate(() => window.executerActionEval({ value: 'consulter|EVR' }));
    await page.waitForFunction(() => window.travauxVisionneuse?.getFichierActuel?.()?.id === 'FTR' && window.travauxUI.getModeCourant() === 'evaluer'
        && !!document.getElementById('travaux-palette-eval-retro') && window._modifierEvaluationEnCours === false
        && document.getElementById('retroactionFinale1').value.length > 0, null, { timeout: 15000 });
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
}

const resume = (page) => page.evaluate(() => document.getElementById('resumeOptionsRetroaction').textContent);
const attendreResume = (page, texte) => page.waitForFunction((t) => document.getElementById('resumeOptionsRetroaction').textContent === t, texte, { timeout: 5000 });

/** Pose le doigt au centre d'un élément visible. */
async function toucher(page, selecteur) {
    const { x, y } = await page.evaluate((s) => {
        const e = document.querySelector(s);
        e.scrollIntoView({ block: 'nearest' });
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, selecteur);
    await page.touchscreen.tap(x, y);
}

const touchVue = (page, valeur) => toucher(page, `.retro-vues-radios label:has(input[value="${valeur}"])`);

/** Les libellés de la bande : entiers, dans la palette, et le nombre de rangées. */
const bande = (page) => page.evaluate((id) => {
    const p = document.getElementById(id);
    const c = p.querySelector('.palette-flottante-contenu');
    const labels = [...p.querySelectorAll('.retro-vues-radios label')];
    const zone = c.getBoundingClientRect();
    return {
        textes: labels.map((l) => l.textContent.trim()),
        coupes: labels.filter((l) => l.scrollWidth > l.clientWidth || getComputedStyle(l).textOverflow === 'ellipsis').map((l) => l.textContent.trim()),
        debordent: labels.filter((l) => l.getBoundingClientRect().right > zone.right + 0.5 || l.getBoundingClientRect().left < zone.left - 0.5).map((l) => l.textContent.trim()),
        rangees: new Set(labels.map((l) => Math.round(l.getBoundingClientRect().top))).size,
        largeurPalette: p.getBoundingClientRect().width
    };
}, RETROACTION);

test.describe('La palette Rétroaction compacte', () => {
    test('la bande change de vue, marque la vue active, et garde ses radios', async ({ page }) => {
        await ouvrir(page);
        const etat = () => page.evaluate(() => ({
            active: [...document.querySelectorAll('.retro-vues-radios label')].filter((l) => getComputedStyle(l).fontWeight === '600').map((l) => l.textContent.trim()),
            radio: document.querySelector('input[name="vueRetroaction"]:checked').value,
            vues: ['vueRetroGenerale', 'vueRetroSpecifique', 'vueRetroBilan'].filter((id) => !document.getElementById(id).classList.contains('u-hide'))
        }));
        expect(await etat()).toEqual({ active: ['Générale'], radio: 'generale', vues: ['vueRetroGenerale'] });
        await touchVue(page, 'specifique');
        await expect.poll(etat).toEqual({ active: ['Spécifique'], radio: 'specifique', vues: ['vueRetroSpecifique'] });
        await touchVue(page, 'bilan');
        await expect.poll(etat).toEqual({ active: ['Bilan'], radio: 'bilan', vues: ['vueRetroBilan'] });
        await touchVue(page, 'generale');
        await expect.poll(etat).toEqual({ active: ['Générale'], radio: 'generale', vues: ['vueRetroGenerale'] });
    });

    test('aucun des trois mots n’est coupé : 260, 200 et la largeur minimale de la palette', async ({ page }) => {
        await ouvrir(page);
        const a200 = await bande(page);
        expect(a200.largeurPalette, 'à l’ouverture, la plus petite largeur où ils tiennent').toBe(200);
        expect(a200.textes).toEqual(['Générale', 'Spécifique', 'Bilan']);
        expect(a200.coupes).toEqual([]);
        expect(a200.debordent).toEqual([]);
        expect(a200.rangees, 'à 200, une seule rangée').toBe(1);
        for (const vue of ['specifique', 'bilan', 'generale']) { // la vue active est en gras : le mot grandit
            await page.evaluate((v) => document.querySelector(`input[name="vueRetroaction"][value="${v}"]`).click(), vue);
            const b = await bande(page);
            expect({ vue, coupes: b.coupes, debordent: b.debordent, rangees: b.rangees }).toEqual({ vue, coupes: [], debordent: [], rangees: 1 });
        }

        const aLargeur = async (largeur) => {
            await page.evaluate(({ id, largeur }) => { document.getElementById(id).style.width = largeur + 'px'; }, { id: RETROACTION, largeur });
            return bande(page);
        };
        const a260 = await aLargeur(260);
        expect(a260.coupes).toEqual([]);
        expect(a260.debordent).toEqual([]);
        expect(a260.rangees).toBe(1);

        const a150 = await aLargeur(150);
        expect(a150.coupes).toEqual([]);
        expect(a150.debordent).toEqual([]);
        expect(a150.rangees, 'trop étroite, la bande passe à la ligne').toBe(2);

        const minimum = await aLargeur(1); // la règle CSS garde le dernier mot : c'est le plancher réel
        expect(minimum.largeurPalette).toBe(100);
        expect(minimum.coupes).toEqual([]);
        expect(minimum.debordent).toEqual([]);
        expect(minimum.rangees).toBeGreaterThanOrEqual(2);
    });

    test('les options sont pliées à l’ouverture, s’ouvrent au doigt, et se replient à la réouverture', async ({ page }) => {
        await ouvrir(page);
        const pli = () => page.evaluate(() => {
            const b = document.querySelector('.eval-options-pli');
            const f = b.querySelector('.eval-options-pli-fleche');
            return { aria: b.getAttribute('aria-expanded'), cases: document.getElementById('afficherContexte1').closest('label').offsetParent !== null, tourne: getComputedStyle(f).transform !== 'none' };
        });
        expect(await pli()).toEqual({ aria: 'false', cases: false, tourne: false });
        await toucher(page, '.eval-options-pli');
        await expect.poll(pli).toEqual({ aria: 'true', cases: true, tourne: true });

        // Ni préférence ni clé neuve : le pli vit en mémoire.
        expect(await page.evaluate(() => JSON.stringify(window.db.getSync('preferencesUtilisateur', {})).includes('ptionsRetro'))).toBe(false);

        // Réouverture par les deux chemins : les palettes recréées (Annoter, puis Évaluer), les palettes réaffichées.
        await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
        await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
        await page.waitForFunction(() => !!document.getElementById('travaux-palette-eval-retro'));
        expect((await pli()).aria).toBe('false');

        await toucher(page, '.eval-options-pli');
        await expect.poll(async () => (await pli()).aria).toBe('true');
    });

    test('décocher « Contexte » change le résumé et régénère comme la case d’aujourd’hui', async ({ page }) => {
        await ouvrir(page);
        await attendreResume(page, 'Options : tout inclus · niveau de performance');
        expect(await page.evaluate(() => document.getElementById('retroactionFinale1').value)).toContain(CONTEXTE);

        await toucher(page, '.eval-options-pli');
        await page.waitForFunction(() => document.getElementById('afficherContexte1').closest('label').offsetParent !== null);
        await toucher(page, '.eval-options-checkboxes label:has(#afficherContexte1)');
        await attendreResume(page, 'Options : sans contexte · niveau de performance');
        await page.waitForFunction((t) => !document.getElementById('retroactionFinale1').value.includes(t), CONTEXTE, { timeout: 5000 });

        // Ce que le PDF relit suit toujours la case (#882) : même `input`, même auto-save.
        await page.waitForFunction(() => window.db.getSync('tretro_evaluationsSauvegardees', [])[0].optionsAffichage.contexte === false, null, { timeout: 8000 });

        await toucher(page, '.eval-options-radios label:has(#affichageNoteComplet1)');
        await attendreResume(page, 'Options : sans contexte · note chiffrée');
        await toucher(page, '.eval-options-checkboxes label:has(#afficherObjectif1)');
        await attendreResume(page, 'Options : sans objectif ni contexte · note chiffrée');
        await toucher(page, '.eval-options-checkboxes label:has(#afficherTache1)');
        await attendreResume(page, 'Options : sans objectif, tâche ni contexte · note chiffrée');
    });

    test('options ouvertes, hauteur courte, palette étroite, bandeau : rien ne passe sur le pied ni sur le compte', async ({ page }) => {
        await ouvrir(page);
        const geo = () => page.evaluate((id) => {
            const r = (e) => e.getBoundingClientRect();
            const t = document.getElementById('retroactionFinale1');
            const cadre = t.parentElement;
            const compte = document.getElementById('compteur-mots-retro');
            const boutons = [...document.querySelectorAll('.eval-retro-pied button')].filter((b) => b.offsetParent);
            const contenu = document.querySelector(`#${id} > .palette-flottante-contenu`);
            return {
                champSurPied: r(cadre).bottom > Math.min(...boutons.map((b) => r(b).top)) + 0.5,
                texteSurCompte: r(t).bottom > r(compte).top + 0.5,
                texteHorsCadre: r(t).bottom > r(cadre).bottom + 0.5,
                optionsSurChamp: r(document.querySelector('.eval-options-pli')).bottom > r(cadre).top + 0.5,
                plancher: t.getBoundingClientRect().height >= 80,
                atteint: (() => { contenu.scrollTop = contenu.scrollHeight; const ok = r(boutons.at(-1)).bottom <= r(contenu).bottom + 0.5; contenu.scrollTop = 0; return ok; })()
            };
        }, RETROACTION);
        const attendu = { champSurPied: false, texteSurCompte: false, texteHorsCadre: false, optionsSurChamp: false, plancher: true, atteint: true };
        expect(await geo()).toEqual(attendu);
        await page.evaluate(() => document.querySelector('.eval-options-pli').click());
        expect(await geo(), 'options ouvertes').toEqual(attendu);
        await page.evaluate((id) => { document.getElementById(id).style.width = '110px'; }, RETROACTION);
        expect(await geo(), 'options ouvertes, 110 de large').toEqual(attendu);
        await page.evaluate((id) => { document.getElementById(id).style.width = ''; window.travauxOutils.layoutPaletteH(id); }, RETROACTION);
        expect(await geo(), 'en bandeau').toEqual(attendu);
    });

    test('le résumé suit « cocherOptionsParDefaut », qui coche sans événement', async ({ page }) => {
        await ouvrir(page);
        await page.evaluate(() => new Promise((r) => setTimeout(r, 800))); // pause-gardee : le chargeur repose les cases à +350 ms, sans trace dans le DOM
        await page.evaluate(() => document.getElementById('afficherContexte1').click());
        await attendreResume(page, 'Options : sans contexte · niveau de performance');
        await page.evaluate(() => window.cocherOptionsParDefaut());
        expect(await resume(page)).toMatch(/^Options : tout inclus · /);
    });

    test('le résumé suit les options posées par le code, sans événement : une copie rouverte', async ({ page }) => {
        await ouvrir(page, { options: { description: true, objectif: false, tache: false, adresse: true, contexte: false, affichageNote: 'complet' } });
        await attendreResume(page, 'Options : sans objectif, tâche ni contexte · note chiffrée');
        // pause-gardee : le chargeur repose les cases à +350 ms (evaluation.js), sans trace dans le DOM ; un clic avant lui serait effacé.
        await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));
        await page.evaluate(() => {
            ['afficherDescription1', 'afficherAdresse1'].forEach((id) => { document.getElementById(id).click(); });
        });
        await attendreResume(page, 'Options : rien d\'inclus · note chiffrée');
    });

    test('« Copier tout » descend au pied, après « Copier », dans les trois vues, et copie les trois sections', async ({ page }) => {
        await ouvrir(page);
        const pied = () => page.evaluate(() => {
            const vis = [...document.querySelectorAll('.eval-retro-pied button')].filter((b) => b.offsetParent !== null);
            const hautPied = document.querySelector('.eval-retro-pied');
            return {
                boutons: vis.map((b) => b.textContent.trim()),
                dansLEcran: vis.every((b) => b.getBoundingClientRect().bottom <= document.getElementById('travaux-palette-eval-retro').getBoundingClientRect().bottom),
                rangees: new Set(vis.map((b) => Math.round(b.getBoundingClientRect().top))).size,
                sousBarre: !!document.querySelector('.retro-sous-barre button'),
                bulle: vis.at(-1).title,
                hauteur: hautPied.offsetHeight
            };
        });
        const generale = await pied();
        expect(generale.boutons).toEqual(['Régénérer', 'Copier', 'Copier tout']);
        expect(generale.bulle).toBe('Copier les 3 sections');
        expect(generale.sousBarre).toBe(false);
        expect(generale.rangees, 'à 200, deux rangées : les trois boutons demandent 221 px').toBe(2);

        await page.evaluate(() => {
            window.__copies = [];
            Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t) => { window.__copies.push(t); return Promise.resolve(); } } });
        });
        await toucher(page, '.eval-retro-pied .btn-copier-tout');
        await page.waitForFunction(() => window.__copies.length === 1);
        const copie = await page.evaluate(() => window.__copies[0]);
        expect(copie).toContain('=== RÉTROACTION GÉNÉRALE ===');
        expect(copie).toContain('=== RÉTROACTION SPÉCIFIQUE ===');
        expect(copie).toContain('=== BILAN ===');

        for (const vue of ['specifique', 'bilan']) {
            await touchVue(page, vue);
            await expect.poll(async () => (await pied()).boutons, `vue ${vue}`).toEqual(['Copier tout']);
            expect((await pied()).dansLEcran).toBe(true);
        }

        // « Copier » copie toujours la vue active.
        await touchVue(page, 'generale');
        await expect.poll(async () => (await pied()).boutons).toEqual(['Régénérer', 'Copier', 'Copier tout']);
        await toucher(page, '.eval-retro-pied .btn-copier-retro:not(.btn-copier-tout)[data-outil-eval]');
        await page.waitForFunction(() => window.__copies.length === 2);
        expect(await page.evaluate(() => window.__copies[1])).toBe(await page.evaluate(() => document.getElementById('retroactionFinale1').value.trim()));
    });

    test('Spécifique et Bilan longs : un seul défileur, la bande et le pied restent à l’écran', async ({ page }) => {
        await ouvrir(page);
        await touchVue(page, 'specifique');
        const long = await page.evaluate((id) => {
            const c = document.getElementById('contenuRetroSpecifique');
            c.textContent = 'Un texte fictif assez long. '.repeat(400);
            const p = document.getElementById(id);
            const contenu = p.querySelector(':scope > .palette-flottante-contenu');
            const pal = p.getBoundingClientRect();
            const defilent = [contenu, c].filter((e) => e.scrollHeight > e.clientHeight + 1).map((e) => e.id || e.className);
            return { defilent, bas: document.querySelector('.btn-copier-tout').getBoundingClientRect().bottom <= pal.bottom, haut: document.querySelector('.retro-vues-radios').getBoundingClientRect().top >= pal.top };
        }, RETROACTION);
        expect(long).toEqual({ defilent: ['contenuRetroSpecifique'], bas: true, haut: true });
    });

    test('le compte de mots ne couvre jamais le texte ; l’avis reste au-dessus des boutons', async ({ page }) => {
        await ouvrir(page);
        const geo = await page.evaluate(() => {
            const t = document.getElementById('retroactionFinale1');
            t.value = 'Un texte fictif assez long pour défiler. '.repeat(200);
            t.scrollTop = 100; // au milieu : le texte remplit le champ jusqu'à son bord bas
            window.mettreAJourCompteurMots();
            const c = document.getElementById('compteur-mots-retro').getBoundingClientRect();
            const r = t.getBoundingClientRect();
            const cadre = t.parentElement.getBoundingClientRect();
            return { dessous: c.top >= r.bottom - 0.5, coin: cadre.right - c.right < 12 && cadre.bottom - c.bottom < 8, compte: document.getElementById('compteur-mots-retro').textContent };
        });
        expect(geo).toEqual({ dessous: true, coin: true, compte: geo.compte });
        expect(geo.compte).toMatch(/^\d+ mots$/);

        const avis = await page.evaluate(() => {
            window.poserRetroactionReecrite?.(true);
            const a = document.getElementById('avisRetroactionReecrite');
            a.classList.remove('u-hide');
            const r = a.getBoundingClientRect();
            return { dessus: [...document.querySelectorAll('.eval-retro-pied button')].filter((b) => b.offsetParent).every((b) => b.getBoundingClientRect().top >= r.bottom - 0.5) };
        });
        expect(avis.dessus).toBe(true);

        // Palette large : le texte de l'avis tiendrait à côté des boutons. Il reste au-dessus.
        const large = await page.evaluate((id) => {
            document.getElementById(id).style.width = '800px';
            const r = document.getElementById('avisRetroactionReecrite').getBoundingClientRect();
            return [...document.querySelectorAll('.eval-retro-pied button')].filter((b) => b.offsetParent).every((b) => b.getBoundingClientRect().top >= r.bottom - 0.5);
        }, RETROACTION);
        expect(large).toBe(true);
    });

    test('les largeurs : Paramètres à 200, Évaluation à 316 contre la Rétroaction réelle, et la copie regagne sa place', async ({ page }) => {
        const mesure = () => page.evaluate(() => {
            const r = (id) => document.getElementById(id).getBoundingClientRect();
            const g = r('travaux-palette-eval-gauche'), d = r('travaux-palette-eval-droite'), p = r('travaux-palette-eval-retro');
            return { parametres: g.width, evaluation: d.width, retroaction: p.width, ecart: p.left - d.right, copie: d.left - g.right };
        });
        await ouvrir(page);
        const m = await mesure();
        expect(m).toEqual({ parametres: 200, evaluation: 316, retroaction: 200, ecart: 8, copie: 432 });
        expect(m.copie, 'plus que les 272 d’avant ce lot').toBeGreaterThan(272);

        // Revenue à 200, Paramètres garde toute sa barre, cadenas affiché : le « − » dépassait de 7 px.
        const barre = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-eval-gauche');
            const vis = [...p.querySelectorAll('.palette-flottante-barre button')].filter((b) => b.offsetParent);
            return { cadenas: vis.some((b) => b.id === 'btnVerrouPalette'), dehors: vis.filter((b) => b.getBoundingClientRect().right > p.getBoundingClientRect().right - 1).length };
        });
        expect(barre).toEqual({ cadenas: true, dehors: 0 });
    });

    test('Évaluation suit une Rétroaction élargie par la poignée ; sa propre position enregistrée l’emporte', async ({ page }) => {
        await ouvrir(page, { positions: { [RETROACTION]: { left: '', right: '12px', top: '12px', width: '260px', height: '' } } });
        const a = await page.evaluate(() => {
            const d = document.getElementById('travaux-palette-eval-droite').getBoundingClientRect();
            const p = document.getElementById('travaux-palette-eval-retro').getBoundingClientRect();
            const g = document.getElementById('travaux-palette-eval-gauche').getBoundingClientRect();
            return { retroaction: p.width, ecart: p.left - d.right, copie: d.left - g.right };
        });
        expect(a).toEqual({ retroaction: 260, ecart: 8, copie: 372 });

        await page.evaluate(() => localStorage.clear());
        await ouvrir(page, { positions: { 'travaux-palette-eval-droite': { left: '', right: '400px', top: '12px', width: '', height: '' } } });
        expect(await page.evaluate(() => document.getElementById('travaux-palette-eval-droite').style.right)).toBe('400px');
    });

    test('une Rétroaction en bandeau ne pousse pas Évaluation hors de la zone', async ({ page }) => {
        await ouvrir(page, { positions: { [RETROACTION]: { left: '12px', right: '', top: '500px', width: '1156px', height: '200px' } } });
        const d = await page.evaluate(() => {
            const r = document.getElementById('travaux-palette-eval-droite').getBoundingClientRect();
            const z = document.getElementById('travaux-palette-eval-droite').parentElement.getBoundingClientRect();
            return { dedans: r.left >= z.left && r.right <= z.right, right: document.getElementById('travaux-palette-eval-droite').style.right };
        });
        expect(d).toEqual({ dedans: true, right: '220px' });
    });

    test('la mesure du rapport : le champ gagne sa hauteur, hors plein écran et en plein écran', async ({ page }) => {
        await ouvrir(page);
        const hauteur = () => page.evaluate(() => document.getElementById('retroactionFinale1').getBoundingClientRect().height);
        // Avant ce lot, mesuré sur `01bbfff0` : 81,97 hors plein écran, 442,98 en plein écran.
        const hors = await hauteur();
        expect(hors).toBeGreaterThan(82);
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        await expect.poll(hauteur).toBeGreaterThan(443);
        const plein = await hauteur();
        expect(plein).toBeGreaterThan(hors);
        if (process.env.MESURE_RAPPORT) await page.screenshot({ path: process.env.MESURE_RAPPORT + '/plein.png' });
        if (process.env.MESURE_RAPPORT) console.warn('MESURE', JSON.stringify({ hors, plein }));
    });

    test('une palette rouverte après Bilan repart de la Générale : la bande ne ment pas', async ({ page }) => {
        await ouvrir(page);
        await touchVue(page, 'bilan');
        await page.waitForFunction(() => !document.getElementById('vueRetroBilan').classList.contains('u-hide'));
        await page.evaluate(() => window.travauxUI.basculerMode('annoter'));
        await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
        await page.waitForFunction(() => !!document.getElementById('travaux-palette-eval-retro'));
        const e = await page.evaluate(() => ({
            radio: document.querySelector('input[name="vueRetroaction"]:checked').value,
            generale: !document.getElementById('vueRetroGenerale').classList.contains('u-hide'),
            bilan: !document.getElementById('vueRetroBilan').classList.contains('u-hide')
        }));
        expect(e).toEqual({ radio: 'generale', generale: true, bilan: false });
    });

    test('sous le verrou, les pastilles se voient éteintes ; le pli reste utilisable', async ({ page }) => {
        await ouvrir(page, { verrouillee: true });
        await page.waitForFunction(() => document.getElementById('afficherContexte1').disabled === true, null, { timeout: 8000 });
        await toucher(page, '.eval-options-pli');
        await page.waitForFunction(() => document.querySelector('.eval-options-pli').getAttribute('aria-expanded') === 'true');
        const avant = await resume(page);
        await toucher(page, '.eval-options-checkboxes label:has(#afficherContexte1)');
        const etat = await page.evaluate(() => ({
            coche: document.getElementById('afficherContexte1').checked,
            opacite: getComputedStyle(document.getElementById('afficherContexte1').closest('label')).opacity
        }));
        expect(etat).toEqual({ coche: true, opacite: '0.6' });
        expect(await resume(page)).toBe(avant);
    });

    for (const clair of [false, true]) {
        test(`les couleurs se lisent en mode ${clair ? 'clair' : 'sombre'}`, async ({ page }) => {
            await ouvrir(page);
            // La classe vit sur `html` et sur `body` : n'en changer qu'une laisse le mode d'avant (contre-épreuve restée verte).
            await page.evaluate((c) => { [document.documentElement, document.body].forEach((e) => e.classList.toggle('mode-clair', c)); }, clair);
            await page.evaluate(() => document.querySelector('.eval-options-pli').click());
            await page.evaluate(() => new Promise((r) => setTimeout(r, 400))); // pause-gardee : la transition de couleur de 0,3 s, sans trace dans le DOM
            const ratios = await page.evaluate(() => {
                const rgb = (s) => s.match(/[\d.]+/g).map(Number);
                const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
                const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
                const fondDe = (e) => { let n = e; while (n) { const c = rgb(getComputedStyle(n).backgroundColor); if (c.length === 3 || c[3] === 1) return c.slice(0, 3); n = n.parentElement; } return [255, 255, 255]; };
                const de = (s) => { const e = document.querySelector(s); return ratio(rgb(getComputedStyle(e).color).slice(0, 3), fondDe(e)); };
                return {
                    fond: fondDe(document.getElementById('travaux-palette-eval-retro')).reduce((a, b) => a + b, 0) > 500,
                    vueActive: de('.retro-vues-radios label:has(input:checked)'),
                    pastille: de('.eval-options-checkboxes label:has(input:checked)'),
                    copierTout: de('.btn-copier-tout'),
                    compte: de('#compteur-mots-retro'),
                    champ: de('#retroactionFinale1')
                };
            });
            const { fond, ...valeurs } = ratios;
            expect(fond, 'le mode demandé est bien celui qu’on mesure').toBe(clair);
            for (const [nom, r] of Object.entries(valeurs)) expect(r, nom).toBeGreaterThanOrEqual(nom === 'compte' ? 3 : 4.5);
        });
    }
});
