import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA PALETTE ÉVALUATION EN VERSION COMPACTE (consigne du 1er nov. 2026 ; ébauches `palette-evaluation-compacte*`).
//
// Le but de Grégoire : qui connaît ses critères se passe de leur description, et voit plus de critères d'un coup.
// ⚠ AU DOIGT (`hasTouch`) : l'iPad est la cible. Un élément qu'on ne peut pas cliquer n'y émet pas de `click`, d'où
// les gestes par `touchscreen.tap` et non par `.click()` sur ce qui doit fermer la bulle.
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre). Noms fictifs (règle 6).

test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });

const EVALUATION = 'travaux-palette-eval-droite';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const DESCRIPTIONS = {
    Structure: 'Établir et rendre lisibles les relations entre les éléments de son travail : pour chaque élément, on peut dire de quoi il dépend et ce qu’il sert.',
    Rigueur: 'Rendre compte avec exactitude de ce que dit le texte : relever les éléments importants sans en omettre, les nommer avec le terme juste, et expliquer ce qu’on avance sans laisser le lecteur deviner.',
    Plausibilité: 'Fonder son interprétation sur le texte : chaque idée avancée s’appuie sur des éléments précis du texte, et chaque élément retenu sert une idée.',
    Nuance: 'Interpréter au lieu de s’en tenir à la lecture évidente : dire ce qu’un élément révèle, ce que le rapprochement de deux éléments fait voir (une nuance, une tension, une contradiction qu’on explique), et ce que l’analyse permet de conclure.'
};

/** La grille des ébauches ; `extra` ajoute des critères après ceux-là. `cartouche` : l'autre gabarit qui sert la palette. */
async function ouvrir(page, { extra = [], cartouche = false, categorisation = false, recharger = false } = {}) {
    if (!recharger) await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.executerActionEval === 'function', null, { timeout: 30000 });
    if (!recharger) await page.evaluate(({ DESCRIPTIONS, extra, cartouche, categorisation }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const T = 'tcomp', coursId = 'cours-comp';
        const criteres = Object.keys(DESCRIPTIONS).map((nom, i) => ({ id: 'c' + i, nom, ponderation: 20, type: 'holistique', description: DESCRIPTIONS[nom] }));
        criteres.push({ id: 'cA', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: "nombre d'erreurs / nombre de mots", description: 'Respecter les normes de la langue écrite (orthographe, grammaire, syntaxe, ponctuation, vocabulaire) et corriger son travail avant la remise.' });
        criteres.push(...extra);
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCC', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TESTCOMP', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GCC' }]);
        window.db.setSync(T + '_productions', [{ id: 'pC', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GC', echelleId: 'EC', groupeCoursId: 'GCC' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GC', nom: 'Grille témoin', type: 'holistique', criteres }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'EC', nom: 'IDME', niveaux }]);
        if (cartouche) window.db.setSync(T + '_cartouches_GC', [{ id: 'CC', nom: 'Cartouche témoin', grilleId: 'GC', niveaux, criteres, commentaires: {} }]);
        if (categorisation) window.db.setSync(T + '_modalitesEvaluation', { activerCategorisationErreurs: true });
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVC', etudiantDA: 'TESTCOMP', productionId: 'pC', groupeCoursId: 'GCC', coursId, fichierId: 'FTC',
            grilleId: 'GC', echelleId: 'EC', cartoucheId: cartouche ? 'CC' : '', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: false,
            criteres: criteres.map((c) => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: 'M', ponderation: c.ponderation, retroaction: '' })),
            donneesAlgorithmiques: { cA: { erreurs: 2, mots: 600, noteCalculee: 0, pourcentage: 90, niveau: 'E', retroaction: '' } },
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {},
            optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FTC', etudiantDA: 'TESTCOMP', productionId: 'pC', coursId, groupeCoursId: 'GCC',
            nomFichier: 'FICTIF_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCC' });
        window.db.setSync('groupeCoursActif', { id: 'GCC', trimestreId: T });
    }, { DESCRIPTIONS, extra, cartouche, categorisation });
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
    await page.evaluate(() => window.executerActionEval({ value: 'consulter|EVC' }));
    await page.waitForFunction(() => window.travauxVisionneuse?.getFichierActuel?.()?.id === 'FTC' && window.travauxUI.getModeCourant() === 'evaluer'
        && !!document.querySelector('#travaux-palette-eval-droite .eval-badge-algo') && window._modifierEvaluationEnCours === false, null, { timeout: 15000 });
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
}

const bascule = (page) => page.evaluate((id) => document.querySelector(`#${id} [data-action="travauxOutils.basculerVersionPalette"]`).click(), EVALUATION);
// Le bouton de version dit ce qu'il fera (consigne du 2 nov. 2026, § 1).
const VERS_COMPACTE = 'Passer à la version compacte', VERS_ETENDUE = 'Passer à la version étendue';


/** Ce qui se voit d'un sélecteur dans la palette : les textes des éléments rendus. */
const visibles = (page, selecteur) => page.evaluate(({ id, selecteur }) => [...document.querySelectorAll(`#${id} ${selecteur}`)]
    .filter((e) => e.offsetParent !== null && e.offsetHeight > 0).map((e) => e.textContent.trim()), { id: EVALUATION, selecteur });

const quiPeutDefiler = (page) => page.evaluate((id) => {
    const p = document.getElementById(id);
    return [p, ...p.querySelectorAll('*')]
        .filter((el) => el.offsetParent !== null && ['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
        .map((el) => el.id || el.className);
}, EVALUATION);

/** Les critères entiers visibles sans défiler : dans le cadre du contenu et dans l'écran. */
const critèresEntiers = (page) => page.evaluate((id) => {
    const p = document.getElementById(id);
    const c = p.querySelector(':scope > .palette-flottante-contenu');
    c.scrollTop = 0;
    const cadre = c.getBoundingClientRect();
    return [...p.querySelectorAll('#listeCriteresGrille1 > .eval-critere-carte')].filter((x) => {
        const r = x.getBoundingClientRect();
        return r.top >= cadre.top - 0.5 && r.bottom <= cadre.bottom + 0.5 && r.bottom <= innerHeight;
    }).length;
}, EVALUATION);

const bulle = (page) => page.evaluate(() => {
    const b = document.getElementById('tooltip-bulle');
    if (!b || !b.classList.contains('tooltip-visible')) return null;
    const r = b.getBoundingClientRect();
    return { texte: b.querySelector('.tooltip-contenu').textContent, top: r.top, left: r.left, width: b.offsetWidth, position: b.dataset.position, nb: document.querySelectorAll('.tooltip-bulle').length, ancree: b.classList.contains('tooltip-bulle--ancree') };
});

/** Le centre du nom d'un critère, en coordonnées d'écran, pour y poser le doigt. */
const centreNom = (page, nom) => page.evaluate(({ id, nom }) => {
    const s = [...document.querySelectorAll(`#${id} .eval-critere-header strong`)].find((x) => x.textContent === nom);
    s.scrollIntoView({ block: 'center' });
    const r = s.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, { id: EVALUATION, nom });

const toucherNom = async (page, nom) => {
    const { x, y } = await centreNom(page, nom);
    await page.touchscreen.tap(x, y);
};

test.describe('La palette Évaluation compacte', () => {
    test('par défaut, les descriptions ; un seul bouton, à sa place, et sur la seule palette Évaluation', async ({ page }) => {
        await ouvrir(page);
        const m = await page.evaluate((id) => {
            const p = document.getElementById(id);
            return {
                compacte: p.classList.contains('evaluation-compacte'),
                boutons: [...p.querySelectorAll('.palette-flottante-barre button')].map((b) => b.getAttribute('aria-label') || 'replier'),
                ailleurs: ['travaux-palette-eval-gauche', 'travaux-palette-eval-retro'].map((i) => document.querySelectorAll(`#${i} [data-action$="basculerVersionPalette"]`).length),
                preference: window.obtenirPreference('paletteEvaluationCompacte')
            };
        }, EVALUATION);
        expect(m).toEqual({
            compacte: false,
            boutons: [VERS_COMPACTE, 'replier'],
            ailleurs: [0, 0],
            preference: false
        });
        expect((await visibles(page, '.eval-critere-description')).length).toBe(5);
        expect(await page.evaluate(() => [...document.querySelectorAll('.eval-critere-nom-bouton')].filter((b) => b.offsetHeight > 0).length), 'le bouton sur le nom n’existe qu’en compacte').toBe(0);
    });

    test('compacte : une ligne par critère, le menu à droite ; aucune description ni aide visible ; le bouton bascule', async ({ page }) => {
        await ouvrir(page, { cartouche: true }); // le gabarit qui porte les phrases d'aide
        expect((await visibles(page, '.eval-aide')).length, 'témoin : les aides se voient en descriptions').toBeGreaterThan(0);
        expect((await visibles(page, '.eval-critere-description')).length).toBe(5);

        await bascule(page);
        expect(await visibles(page, '.eval-critere-description')).toEqual([]);
        expect(await visibles(page, '.eval-aide')).toEqual([]);

        const lignes = await page.evaluate((id) => {
            const p = document.getElementById(id);
            return {
                largeur: p.getBoundingClientRect().width,
                version: p.querySelector('.palette-bouton-version').getAttribute('aria-label'),
                cartes: ['c0', 'c1', 'c2', 'c3'].map((c) => {
                    const menu = document.getElementById('eval_' + c);
                    const carte = menu.closest('.eval-critere-carte').getBoundingClientRect();
                    const nom = menu.closest('.eval-critere-carte').querySelector('strong').getBoundingClientRect();
                    const m = menu.getBoundingClientRect();
                    return { hauteur: carte.height, menu: m.width, aDroite: Math.round(carte.right - m.right), memeLigne: nom.top < m.bottom && nom.bottom > m.top, cibleMenu: m.height >= 32 };
                })
            };
        }, EVALUATION);
        expect(lignes.largeur).toBe(316);
        expect(lignes.version).toBe(VERS_ETENDUE);
        for (const c of lignes.cartes) expect(c).toEqual({ hauteur: 46, menu: 120, aDroite: 8, memeLigne: true, cibleMenu: true });

        await bascule(page);
        expect((await visibles(page, '.eval-critere-description')).length, 'le bouton ramène les descriptions').toBe(5);
    });

    test('le critère algorithmique : ses deux champs côte à côte, l’étiquette à gauche, le résultat, le menu sans étiquette visible', async ({ page }) => {
        await ouvrir(page, { cartouche: true });
        await bascule(page);
        const m = await page.evaluate(() => {
            const r = (id) => document.getElementById(id).getBoundingClientRect();
            const erreurs = r('eval_erreurs_cA'), mots = r('eval_mots_cA'), res = r('resultat_algo_cA'), menu = r('eval_cA');
            const groupe = document.getElementById('eval_erreurs_cA').closest('.groupe-form');
            const etiquette = groupe.querySelector('label').getBoundingClientRect();
            const carte = document.getElementById('eval_cA').closest('.eval-critere-carte');
            return {
                coteACote: Math.abs(erreurs.top - mots.top) < 1 && mots.left > erreurs.right,
                etiquetteAGauche: etiquette.right <= erreurs.left && etiquette.top < erreurs.bottom && etiquette.bottom > erreurs.top,
                ordre: mots.bottom <= res.top && res.bottom <= menu.top,
                etiquetteMenu: [...carte.querySelectorAll('label[data-tooltip="eval-niveau-idme"]')].map((l) => l.offsetHeight),
                aria: document.getElementById('eval_cA').getAttribute('aria-label'),
                formule: getComputedStyle(document.getElementById('formule_algo_cA')).display,
                badgeDansCarte: carte.querySelector('.eval-badge-algo').getBoundingClientRect().right <= carte.getBoundingClientRect().right,
                hauteur: carte.getBoundingClientRect().height,
                resultat: res.height
            };
        });
        expect(m).toMatchObject({ coteACote: true, etiquetteAGauche: true, ordre: true, etiquetteMenu: [0], aria: 'Français écrit : Niveau de l’échelle « IDME »', formule: 'none', badgeDansCarte: true });
        expect(m.hauteur).toBeLessThan(190); // l'ébauche : 169 à une ligne de résultat ; la nôtre dit aussi le niveau, sur deux lignes
    });

    test('avec catégorisation : le champ des codes suit la même règle, chacun sur sa rangée (l’étiquette est trop longue pour deux colonnes)', async ({ page }) => {
        await ouvrir(page, { cartouche: true, categorisation: true });
        await page.waitForFunction(() => !!document.getElementById('eval_categories_cA'));
        await bascule(page);
        expect(await visibles(page, '.eval-aide')).toEqual([]);
        const m = await page.evaluate(() => {
            const r = (id) => document.getElementById(id).getBoundingClientRect();
            const codes = r('eval_categories_cA'), mots = r('eval_mots_cA');
            const e = document.getElementById('eval_categories_cA').closest('.groupe-form').querySelector('label').getBoundingClientRect();
            const carte = document.getElementById('eval_cA').closest('.eval-critere-carte').getBoundingClientRect();
            return { lEnDessousDeLAutre: mots.top >= codes.bottom, etiquetteAGauche: e.right <= codes.left, dansLaCarte: mots.right <= carte.right, largeurCodes: codes.width };
        });
        expect(m).toMatchObject({ lEnDessousDeLAutre: true, etiquetteAGauche: true, dansLaCarte: true });
        expect(m.largeurCodes).toBeGreaterThan(120);
    });

    test('les deux gabarits rendent la même chose en compacte (sans cartouche)', async ({ page }) => {
        await ouvrir(page);
        await bascule(page);
        expect(await visibles(page, '.eval-critere-description')).toEqual([]);
        const m = await page.evaluate(() => {
            const menu = document.getElementById('eval_c0');
            const carte = menu.closest('.eval-critere-carte').getBoundingClientRect();
            return { aide: document.querySelectorAll('#listeCriteresGrille1 .eval-aide').length, hauteur: carte.height, menu: menu.getBoundingClientRect().width, boutons: document.querySelectorAll('#listeCriteresGrille1 .eval-critere-nom-bouton').length };
        });
        expect(m).toEqual({ aide: 0, hauteur: 46, menu: 120, boutons: 5 });
    });

    test('le critère analytique : sans barème, une ligne ; avec barème, un bloc qui garde sa saisie ; la description part', async ({ page }) => {
        await ouvrir(page, {
            cartouche: true,
            extra: [
                { id: 'cP', nom: 'Points libres', ponderation: 10, type: 'analytique', description: 'Une description du critère en points.' },
                { id: 'cB', nom: 'Barème', ponderation: 10, type: 'analytique', description: 'Une autre description.', bareme: [
                    { id: 't1', nom: 'Solide', pointsMin: 8, pointsMax: 10, texte: 'Le texte de la tranche, assez long pour tenir sur plusieurs lignes dans la palette.' },
                    { id: 't2', nom: 'Partiel', pointsMin: 0, pointsMax: 7, texte: 'Un autre texte de tranche.' }
                ] }
            ]
        });
        await bascule(page);
        expect(await visibles(page, '.eval-critere-description')).toEqual([]);
        const m = await page.evaluate(() => {
            const champ = document.getElementById('eval_pts_cP');
            const carte = champ.closest('.eval-critere-carte').getBoundingClientRect();
            const nom = champ.closest('.eval-critere-carte').querySelector('strong').getBoundingClientRect();
            const c = champ.getBoundingClientRect();
            const bloc = document.getElementById('eval_pts_cB').closest('.eval-critere-carte');
            return {
                ligne: { hauteur: carte.height, memeLigne: nom.top < c.bottom && nom.bottom > c.top, champ: c.width > 40, dansLaCarte: c.right <= carte.right },
                tranches: bloc.querySelectorAll('.eval-bareme-choix').length,
                textes: [...bloc.querySelectorAll('.eval-bareme-texte')].filter((t) => t.offsetHeight > 0).length,
                tranchesVisibles: [...bloc.querySelectorAll('.eval-bareme-nom')].filter((t) => t.offsetHeight > 0).map((t) => t.textContent),
                champBloc: document.getElementById('eval_pts_cB').offsetHeight >= 32,
                horsCarte: document.getElementById('eval_pts_cB').getBoundingClientRect().right > bloc.getBoundingClientRect().right
            };
        });
        expect(m).toEqual({
            ligne: { hauteur: 46, memeLigne: true, champ: true, dansLaCarte: true },
            tranches: 2, textes: 0, tranchesVisibles: ['Solide', 'Partiel'], champBloc: true, horsCarte: false
        });
    });

    test('le choix survit au rechargement, et il n’emporte pas celui de la palette Codes', async ({ page }) => {
        await ouvrir(page);
        await bascule(page);
        await page.waitForFunction(() => window.db.getSync('preferencesUtilisateur', {}).paletteEvaluationCompacte === true);
        expect(await page.evaluate(() => window.obtenirPreference('dispositionPaletteCodes'))).toBe('etendue');
        await page.reload();
        await ouvrir(page, { recharger: true });
        expect(await page.evaluate((id) => document.getElementById(id).classList.contains('evaluation-compacte'), EVALUATION)).toBe(true);
        expect(await visibles(page, '.eval-critere-description')).toEqual([]);
    });

    test('un niveau choisi en compacte donne la même note qu’en descriptions, et le même niveau reste choisi', async ({ page }) => {
        await ouvrir(page, { cartouche: true });
        const choisir = (id, v) => page.evaluate(({ id, v }) => { const s = document.getElementById(id); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, { id, v });
        const note = () => page.evaluate(() => window.noteCalculeeCourante);
        // La note de référence : en descriptions.
        for (const [id, v] of [['eval_c0', 'E'], ['eval_c1', 'D'], ['eval_c2', 'M'], ['eval_c3', 'I'], ['eval_cA', 'M']]) await choisir(id, v);
        const reference = await note();
        expect(reference, 'témoin : le calcul a bien tourné').toBeGreaterThan(0);
        // Remise à zéro, puis les mêmes niveaux en compacte.
        for (const [id, v] of [['eval_c0', 'I'], ['eval_c1', 'I'], ['eval_c2', 'I'], ['eval_c3', 'E'], ['eval_cA', 'I']]) await choisir(id, v);
        const autre = await note();
        expect(autre, 'témoin : la note dépend bien des niveaux').not.toBe(reference);
        await bascule(page);
        for (const [id, v] of [['eval_c0', 'E'], ['eval_c1', 'D'], ['eval_c2', 'M'], ['eval_c3', 'I'], ['eval_cA', 'M']]) await choisir(id, v);
        expect(await note()).toBe(reference);
        await bascule(page);
        expect(await note()).toBe(reference);
        expect(await page.evaluate(() => ['eval_c0', 'eval_c1', 'eval_c2', 'eval_c3', 'eval_cA'].map((i) => document.getElementById(i).value))).toEqual(['E', 'D', 'M', 'I', 'M']);
    });

    test('la bulle : toucher un nom ouvre sa description, toucher ailleurs ou un autre nom la ferme, jamais deux', async ({ page }) => {
        await ouvrir(page, { extra: [{ id: 'cS', nom: 'Sans description', ponderation: 5, type: 'holistique' }] });
        await bascule(page);
        expect(await bulle(page), 'rien d’ouvert au départ').toBeNull();

        await toucherNom(page, 'Nuance');
        await page.waitForFunction(() => document.getElementById('tooltip-bulle')?.classList.contains('tooltip-visible'));
        const ouverte = await bulle(page);
        expect(ouverte.texte).toBe(DESCRIPTIONS.Nuance);
        expect(ouverte).toMatchObject({ position: 'bas', nb: 1, ancree: true, width: 270 });
        const dessous = await page.evaluate(() => {
            const s = [...document.querySelectorAll('#travaux-palette-eval-droite .eval-critere-header strong')].find((x) => x.textContent === 'Nuance');
            return { bas: s.closest('.eval-critere-header').getBoundingClientRect().bottom, attendu: s.closest('.eval-critere-header').querySelector('button').getAttribute('aria-expanded') };
        });
        expect(ouverte.top).toBeGreaterThanOrEqual(dessous.bas);
        expect(dessous.attendu).toBe('true');

        // Un autre nom : la sienne, une seule.
        await toucherNom(page, 'Rigueur');
        await page.waitForFunction((t) => document.querySelector('#tooltip-bulle .tooltip-contenu').textContent === t, DESCRIPTIONS.Rigueur);
        expect((await bulle(page)).nb).toBe(1);
        expect(await page.evaluate(() => [...document.querySelectorAll('.eval-critere-nom-bouton[aria-expanded="true"]')].map((b) => b.getAttribute('aria-label')))).toEqual(['Rigueur, voir la description']);

        // Le même nom : elle se ferme.
        await toucherNom(page, 'Rigueur');
        await page.waitForFunction(() => !document.getElementById('tooltip-bulle').classList.contains('tooltip-visible'));

        // Ailleurs, sur un élément qui n'est pas cliquable : le pointeur suffit (l'iPad n'y émet pas de `click`).
        await toucherNom(page, 'Structure');
        await page.waitForFunction(() => document.getElementById('tooltip-bulle').classList.contains('tooltip-visible'));
        await page.evaluate(() => {
            const zone = document.getElementById('travaux-zone-canvas');
            zone.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
        });
        expect(await bulle(page)).toBeNull();
        expect(await page.evaluate(() => document.querySelectorAll('.eval-critere-nom-bouton[aria-expanded="true"]').length)).toBe(0);

        // Le défilement de la palette la ferme aussi : elle vit dans `body`, elle resterait sur place.
        await toucherNom(page, 'Structure');
        await page.waitForFunction(() => document.getElementById('tooltip-bulle').classList.contains('tooltip-visible'));
        await page.evaluate((id) => document.querySelector(`#${id} > .palette-flottante-contenu`).dispatchEvent(new Event('scroll')), EVALUATION);
        expect(await bulle(page)).toBeNull();
    });

    test('un critère sans description : ni soulignement, ni bouton, ni bulle, pas même celle de l’aide générale', async ({ page }) => {
        await ouvrir(page, { extra: [{ id: 'cS', nom: 'Sans description', ponderation: 5, type: 'holistique' }] });
        await page.evaluate(() => window.definirPreference('accompagnementActif', true));
        await bascule(page);
        const m = await page.evaluate(() => {
            const strong = (nom) => [...document.querySelectorAll('#travaux-palette-eval-droite .eval-critere-header strong')].find((x) => x.textContent === nom);
            const s = strong('Sans description'), n = strong('Nuance');
            return {
                bouton: s.closest('.eval-critere-header').querySelectorAll('button').length,
                souligne: getComputedStyle(s).textDecorationLine,
                temoin: getComputedStyle(n).textDecorationLine + ' ' + getComputedStyle(n).textDecorationStyle,
                recoitLeToucher: getComputedStyle(s).pointerEvents
            };
        });
        expect(m).toEqual({ bouton: 0, souligne: 'none', temoin: 'underline dotted', recoitLeToucher: 'none' });
        await toucherNom(page, 'Sans description');
        expect(await bulle(page)).toBeNull();
    });

    test('la bulle d’aide générale du nom : elle reste en descriptions, et en compacte la description l’emporte', async ({ page }) => {
        await ouvrir(page);
        await page.evaluate(() => window.definirPreference('accompagnementActif', true));
        // En descriptions, le nom garde sa bulle (survol) : témoin qu'on n'a pas tué le mécanisme.
        const { x, y } = await centreNom(page, 'Nuance');
        await page.mouse.move(x, y);
        await page.waitForFunction(() => document.getElementById('tooltip-bulle')?.classList.contains('tooltip-visible'), null, { timeout: 5000 });
        expect((await bulle(page)).texte).toContain('Évalue ce critère');
        await page.mouse.move(5, 5);
        await page.waitForFunction(() => !document.getElementById('tooltip-bulle').classList.contains('tooltip-visible'), null, { timeout: 5000 });

        await bascule(page);
        // Le survol du nom en compacte n'ouvre plus l'aide générale : le bouton, qui recouvre le nom, n'en porte pas.
        const sous = await page.evaluate(({ x, y }) => {
            const s = [...document.querySelectorAll('#travaux-palette-eval-droite .eval-critere-header strong')].find((n) => n.textContent === 'Nuance');
            const r = s.getBoundingClientRect();
            const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return { classe: e.className, tooltip: !!e.closest('[data-tooltip]') };
        }, { x, y });
        expect(sous).toEqual({ classe: 'eval-critere-nom-bouton', tooltip: false });

        // Ouverte, la description ne cède ni au survol ni à la fin du survol d'une autre bulle.
        await toucherNom(page, 'Nuance');
        await page.waitForFunction(() => document.getElementById('tooltip-bulle').classList.contains('tooltip-visible'));
        const aide = (evenement) => page.evaluate((evenement) => {
            document.querySelector('#travaux-palette-eval-droite [data-tooltip="eval-francais-ecrit"]').dispatchEvent(new MouseEvent(evenement, { bubbles: false }));
        }, evenement);
        // pause-gardee (les deux) : plus longues que les délais de la bulle, dont aucune trace ne dit qu'ils sont passés.
        await aide('mouseenter');
        await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
        expect((await bulle(page)).texte, 'le survol d’une autre aide ne la remplace pas').toBe(DESCRIPTIONS.Nuance);
        await aide('mouseleave');
        await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));
        expect((await bulle(page)).texte, 'la fin de ce survol ne la ferme pas').toBe(DESCRIPTIONS.Nuance);
    });

    test('la bulle ne dépend pas de la préférence des aides', async ({ page }) => {
        await ouvrir(page); // `accompagnementActif` : false
        await bascule(page);
        await toucherNom(page, 'Plausibilité');
        await page.waitForFunction(() => document.getElementById('tooltip-bulle')?.classList.contains('tooltip-visible'));
        expect((await bulle(page)).texte).toBe(DESCRIPTIONS.Plausibilité);
    });

    test('repliée, la compacte s’applique et un seul élément défile ; le bouton ramène les descriptions', async ({ page }) => {
        await ouvrir(page);
        await bascule(page);
        expect(await visibles(page, '.eval-critere-description')).toEqual([]);
        expect(await quiPeutDefiler(page)).toEqual(['palette-flottante-contenu']);

        await page.evaluate((id) => window.travauxUI.togglePaletteEvalReplie(id), EVALUATION);
        expect(await quiPeutDefiler(page)).toEqual([]);
        await page.evaluate((id) => window.travauxUI.togglePaletteEvalReplie(id), EVALUATION);
        expect(await page.evaluate((id) => document.getElementById(id).classList.contains('evaluation-compacte'), EVALUATION)).toBe(true);
        expect(await quiPeutDefiler(page)).toEqual(['palette-flottante-contenu']);

        await bascule(page);
        expect(await page.evaluate((id) => {
            const p = document.getElementById(id);
            return { compacte: p.classList.contains('evaluation-compacte'), largeur: p.getBoundingClientRect().width, version: p.querySelector('.palette-bouton-version').getAttribute('aria-label'), preference: window.obtenirPreference('paletteEvaluationCompacte') };
        }, EVALUATION)).toEqual({ compacte: false, largeur: 316, version: VERS_COMPACTE, preference: false });
    });

    test('compacte par-dessus une taille enregistrée : la hauteur suit le contenu, et la taille n’est pas réécrite', async ({ page }) => {
        await ouvrir(page);
        // En plein écran : la zone est assez haute pour que la compacte laisse de la place, donc que sa hauteur puisse se juger.
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        // Une palette allongée à la main jusqu'au bas de la zone, et sa taille enregistrée (ce que fait la poignée, #773).
        await page.evaluate((id) => {
            const p = document.getElementById(id);
            p.style.height = (p.parentElement.getBoundingClientRect().height - 24) + 'px';
            localStorage.setItem(id + '-geometrie', JSON.stringify({ left: 'auto', right: p.style.right, top: p.style.top, width: '', height: p.style.height }));
        }, EVALUATION);
        const pos = () => page.evaluate((id) => localStorage.getItem(id + '-geometrie'), EVALUATION);
        const avant = await pos();
        expect(avant).toContain('"height"');
        await bascule(page);
        const m = await page.evaluate((id) => {
            const p = document.getElementById(id);
            const c = p.querySelector(':scope > .palette-flottante-contenu');
            return { deborde: c.scrollHeight > c.clientHeight + 1, hauteur: p.getBoundingClientRect().height, zone: p.parentElement.getBoundingClientRect().height, styleHauteur: p.style.height };
        }, EVALUATION);
        expect(await pos()).toBe(avant);
        expect(m.deborde).toBe(false);
        expect(m.hauteur, 'elle suit son contenu, elle ne garde pas la hauteur posée à la main').toBeLessThan(m.zone - 60);
        expect(parseFloat(m.styleHauteur), 'la taille reste pour le retour aux descriptions').toBeGreaterThan(0);
    });

    test('les trois trouvailles du lot du défilement : la largeur, le badge entier, les champs lisibles en mode sombre', async ({ page }) => {
        // Un nom d'un seul long mot : à 316 pt, c'est ce qui ne laisse plus de place au badge sur la rangée du nom.
        await ouvrir(page, { extra: [{ id: 'cL', nom: 'Anticonstitutionnellement', ponderation: 5, type: 'algorithmique', formule: "nombre d'erreurs / nombre de mots" }] });

        await test.step('à l’ouverture, à 1180 pt : Paramètres à 200 (verdict du 1er nov.), Évaluation à 316', async () => {
            const l = await page.evaluate(() => ({
                parametres: document.getElementById('travaux-palette-eval-gauche').getBoundingClientRect().width,
                evaluation: document.getElementById('travaux-palette-eval-droite').getBoundingClientRect().width
            }));
            expect(l).toEqual({ parametres: 200, evaluation: 316 });
            const se = await page.evaluate(() => {
                const g = document.getElementById('travaux-palette-eval-gauche').getBoundingClientRect();
                const d = document.getElementById('travaux-palette-eval-droite').getBoundingClientRect();
                const r = document.getElementById('travaux-palette-eval-retro').getBoundingClientRect();
                return { gaucheAvantEvaluation: g.right <= d.left, evaluationAvantRetro: d.right <= r.left };
            });
            expect(se).toEqual({ gaucheAvantEvaluation: true, evaluationAvantRetro: true });
        });

        const badgeEntier = () => page.evaluate(() => {
            return [...document.querySelectorAll('#travaux-palette-eval-droite .eval-badge-algo')].map((b) => {
                const grid = b.closest('.eval-grid-critere').getBoundingClientRect();
                const r = b.getBoundingClientRect();
                return { dedans: r.right <= grid.right + 0.5, uneLigne: r.height < 22, texte: b.textContent };
            });
        });
        await test.step('le badge se voit en entier, en descriptions comme en compacte, à la largeur la plus étroite que la palette accepte', async () => {
            const entiers = Array(2).fill({ dedans: true, uneLigne: true, texte: 'ALGORITHMIQUE' });
            await page.evaluate((id) => { document.getElementById(id).style.width = '120px'; }, EVALUATION);
            expect(await badgeEntier()).toEqual(entiers);
            await bascule(page);
            expect(await badgeEntier()).toEqual(entiers);
            await bascule(page);
        });

        await test.step('mode sombre : contraste des champs Erreurs et Mots, et le fond est celui du design system', async () => {
            const lire = (id) => page.evaluate((id) => {
                const lum = (rgb) => {
                    const f = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
                    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
                };
                const lireC = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
                const e = document.getElementById(id);
                const s = getComputedStyle(e);
                const fond = lireC(s.backgroundColor);
                const carte = lireC(getComputedStyle(e.closest('.eval-critere-carte')).backgroundColor);
                const compose = fond.rgb.map((v, i) => v * fond.a + carte.rgb[i] * (1 - fond.a));
                const texte = lireC(s.color).rgb;
                const [a, b] = [lum(compose), lum(texte)].sort((x, y) => y - x);
                const jeton = document.createElement('div');
                jeton.style.background = 'var(--surface-input)';
                jeton.style.color = 'var(--texte-principal)';
                document.body.appendChild(jeton);
                const j = getComputedStyle(jeton);
                const attendu = { bg: j.backgroundColor, color: j.color };
                jeton.remove();
                return { contraste: (a + 0.05) / (b + 0.05), bg: s.backgroundColor, color: s.color, attendu };
            }, id);
            await page.evaluate(() => document.body.classList.remove('mode-clair'));
            // La transition de 0,3 s du fond (`input[type="number"].controle-form`) : la mesure lit la valeur d'arrivée.
            await page.waitForFunction(() => getComputedStyle(document.getElementById('eval_erreurs_cA')).backgroundColor !== 'rgb(255, 255, 255)');
            await page.evaluate(() => new Promise((r) => setTimeout(r, 400))); // pause-gardee : la fin d'une transition CSS, sans événement que tous les chemins émettent
            for (const id of ['eval_erreurs_cA', 'eval_mots_cA']) {
                const m = await lire(id);
                expect(m.contraste, id).toBeGreaterThanOrEqual(4.5);
                expect({ bg: m.bg, color: m.color }, id + ' : les jetons, pas le navigateur').toEqual(m.attendu);
            }
            await page.evaluate(() => document.body.classList.add('mode-clair'));
            await page.evaluate(() => new Promise((r) => setTimeout(r, 400))); // pause-gardee : idem
            const clair = await lire('eval_erreurs_cA');
            expect(clair.contraste, 'mode clair : la règle plus forte reste').toBeGreaterThanOrEqual(4.5);
            expect(clair.bg).toBe('rgb(255, 255, 255)');
        });
    });

    test('la mesure du rapport : les critères entiers visibles sans défiler, hors plein écran et en plein écran', async ({ page }) => {
        // Les quatre nombres du rapport se relisent ici (`MESURE`, sortie du banc). Grille des ébauches : quatre lignes, un algorithmique.
        await ouvrir(page, { cartouche: true });
        const mesure = {};
        mesure.completeHors = await critèresEntiers(page);
        await bascule(page);
        mesure.compacteHors = await critèresEntiers(page);
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        mesure.compactePlein = await critèresEntiers(page);
        await bascule(page);
        mesure.completePlein = await critèresEntiers(page);
        console.warn('MESURE ' + JSON.stringify(mesure));
        expect(mesure.compacteHors, 'compacte, hors plein écran : plus de critères qu’en descriptions').toBeGreaterThan(mesure.completeHors);
        expect(mesure.compactePlein).toBeGreaterThanOrEqual(mesure.completePlein);
        expect(mesure.compactePlein, 'en plein écran, les cinq tiennent').toBe(5);
    });
});
