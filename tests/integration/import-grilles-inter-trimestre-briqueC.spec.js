import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ============================================================================
// Brique C du PLAN-namespacing-par-trimestre — pas 4 (cadrage C/D §2.4).
// Import inter-trimestre de GRILLES = COPIE : une grille d'un trimestre source
// est dupliquée dans le trimestre ACTIF (id neuf + trace inspireDe), la source
// n'est JAMAIS mutée.
//
// Ce filet exerce le CHEMIN RÉEL chargé dans WebKit (pas une réimplémentation) :
//   cleSource() (trimestres.js) → copierGrilleDepuisTrimestre() (grilles.js) →
//   partageSection.dupliquerGrillePartagee() (partage-section.js).
//
// Invariants verrouillés :
//   1. LISTING — listerTrimestresAvecGrilles() ne retient que les trimestres
//      ayant une COPIE PROPRE (<id>_grillesTemplates), exclut l'actif et ceux
//      qui n'ont que le catalogue global.
//   2. COPIE — id neuf, inspireDe = OBJET {nom, auteur, date, sourceId} (schéma CC
//      transversal lu par formaterInspireDe, PAS une chaîne brute), sourceId = id
//      source, inspireDeTrimestre = source ; cartouches copiées et réancrées sur
//      l'id de la copie.
//   3. SOURCE IMMUABLE — l'objet lu ET le stockage source intacts byte-à-byte
//      (la trace inspireDe est posée sur une COPIE, jamais sur la source).
//   4. TÉMOIN D-C4 — l'echelleId d'une cartouche copiée N'EST PAS remappé au
//      pas 4 (périmètre « grilles + cartouches » ; remappage = report assumé).
//
// BREAK-TEST (vérif adverse) — ce test DOIT pouvoir rougir :
//   - Reposer une CHAÎNE brute (grilleSource.id) au lieu de l'objet forgé →
//     `copie.inspireDe.sourceId` undefined → assertion #2 rouge (et la carte
//     afficherait « Inspiré de Inconnu par Inconnu »).
//   - Poser inspireDe sur la source au lieu d'une copie → `grilleLueInspireDe`
//     devient un objet défini → assertion #3 rouge.
//   - Remapper l'echelleId à la copie → `cartoucheEchelleId` change → #4 rouge.
//   - Câbler la destination sur cle() au lieu de la clé nue → la copie
//     n'apparaît plus dans 'grillesTemplates' → assertion #2 rouge.
//   Rougissement confirmé localement avant de faire confiance au vert.
// ============================================================================

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.svg/i,
    /Not allowed to load local resource.*\.png/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('Brique C pas 4 · listerTrimestresAvecGrilles ne retient que les trimestres à copie propre', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const liste = await page.evaluate(() => {
        // Décor déterministe : 3 trimestres connus, actif = h2026.
        window.obtenirTrimestres = () => ([
            { id: 'h2026', nom: 'Hiver 2026' },   // ACTIF → exclu
            { id: 'a2025', nom: 'Automne 2025' }, // copie propre posée → inclus
            { id: 'h2025', nom: 'Hiver 2025' }    // pas de copie propre → exclu
        ]);
        window.obtenirTrimestreId = () => 'h2026';
        window.estTrimestreArchive = () => false;  // actif vivant (cible permise)

        // Seul a2025 possède une copie propre (cas archivé / golden master).
        db.setSync('a2025_grillesTemplates', [
            { id: 'GR_A', nom: 'Grille A25', criteres: [{ id: 'c1' }, { id: 'c2' }] }
        ]);

        return window.listerTrimestresAvecGrilles();
    });

    expect(liste).toHaveLength(1);
    expect(liste[0].id).toBe('a2025');
    expect(liste[0].nombre).toBe(1);
});

test('Brique C pas 4 · garde D-C7 : aucune source listée quand le trimestre actif est archivé', async ({ page }) => {
    // D-C7 (cadrage §2.3) : la cible d'un import n'est JAMAIS archivée. La copie
    // écrit la clé globale nue, qu'un actif archivé ne relit pas (il lit
    // <id>_grillesTemplates) → l'import irait au mauvais endroit. Tant que la
    // destination n'est pas namespacée (Brique D), on masque l'import : malgré une
    // source DISPONIBLE (a2025 a ses grilles), listerTrimestresAvecGrilles rend [].
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        window.obtenirTrimestres = () => ([
            { id: 'a2025', nom: 'Automne 2025' },
            { id: 'a2024', nom: 'Automne 2024' }
        ]);
        window.obtenirTrimestreId = () => 'a2025';
        window.estTrimestreArchive = () => true;        // actif = archivé (consultation)
        // a2024 a bien une copie propre → SERAIT listable sans la garde.
        db.setSync('a2024_grillesTemplates', [
            { id: 'GR_Z', nom: 'Grille A24', criteres: [{ id: 'c1' }] }
        ]);
        return window.listerTrimestresAvecGrilles();
    });

    expect(res).toHaveLength(0);   // garde D-C7 : aucune source malgré a2024 disponible
});

test('Brique C pas 4 · « Voir les grilles » révèle réellement le preview (anti-régression bouton mort)', async ({ page }) => {
    // Régression terrain (26 juin) : le preview, RENDU PAR LA MODALE, portait
    // display:none INLINE, que classList.remove('u-hide') ne retire pas → bouton
    // « Voir les grilles » sans effet. Fix : cacher via la classe u-hide. Ce test
    // exerce le VRAI HTML (afficherBibliothequeGrilles) — pas un DOM fabriqué — et
    // vérifie la VISIBILITÉ effective (getComputedStyle), donc il rougit si le
    // display:none inline revient.
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(async () => {
        // Décor : un trimestre source archivé (a2025) avec ses grilles propres.
        window.obtenirTrimestres = () => ([
            { id: 'h2026', nom: 'Hiver 2026' },
            { id: 'a2025', nom: 'Automne 2025' }
        ]);
        window.obtenirTrimestreId = () => 'h2026';
        window.estTrimestreArchive = () => false;  // actif vivant (cible permise)
        db.setSync('a2025_grillesTemplates', [
            { id: 'GR_X', nom: 'Analytique A25', criteres: [{ id: 'c1' }, { id: 'c2' }] },
            { id: 'GR_Y', nom: 'Holistique A25', criteres: [{ id: 'c1' }] }
        ]);

        // Génère la VRAIE modale → le vrai HTML du preview (slot sectionImportTrimestre).
        await window.afficherBibliothequeGrilles();

        const select = document.getElementById('selectTrimestreImportGrilles');
        const preview = document.getElementById('previewGrillesTrimestre');
        if (!select || !preview) return { erreur: 'section import absente' };

        const visibleAvant = getComputedStyle(preview).display !== 'none';

        // Trimestre choisi → preview révélé avec la liste + boutons « Importer ».
        select.value = 'a2025';
        window.afficherGrillesTrimestreModal();
        const visibleApres = getComputedStyle(preview).display !== 'none';
        const nbBoutonsImporter = preview.querySelectorAll('[data-action="importerUneGrilleTrimestre"]').length;
        const contientNom = preview.innerHTML.includes('Analytique A25');

        return { visibleAvant, visibleApres, nbBoutonsImporter, contientNom };
    });

    expect(res.erreur).toBeUndefined();
    expect(res.visibleAvant).toBe(false);   // caché au départ (classe u-hide)
    expect(res.visibleApres).toBe(true);    // ← le fix : preview RÉELLEMENT visible
    expect(res.nbBoutonsImporter).toBe(2);  // un bouton « Importer » par grille
    expect(res.contientNom).toBe(true);
});

test('Brique C pas 4 · copie inter-trimestre : id neuf + inspireDe + cartouches, source intacte', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); } });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        const grilleSource = {
            id: 'GR_SRC', nom: 'Dissertation A25',
            criteres: [{ id: 'c1', nom: 'Idées' }],
            dansBibliotheque: true
        };
        const cartoucheSource = {
            id: 'CART_SRC', grilleId: 'GR_SRC', nom: 'Niveau 4',
            echelleId: 'ECH_SRC', contenu: 'x'
        };

        // Source = trimestre a2025 (copie propre namespacée). La destination de la
        // copie est la clé globale nue 'grillesTemplates' (= trimestre actif tant
        // qu'il n'est pas archivé) — indépendante du trimestre actif réel.
        db.setSync('a2025_grillesTemplates', [grilleSource]);
        db.setSync('a2025_cartouches_GR_SRC', [cartoucheSource]);

        const destAvant = db.getSync('grillesTemplates', []);
        const nbDestAvant = Array.isArray(destAvant) ? destAvant.length : 0;

        // Snapshot byte-à-byte de la source AVANT.
        const srcGrillesAvant = JSON.stringify(db.getSync('a2025_grillesTemplates', []));
        const srcCartouchesAvant = JSON.stringify(db.getSync('a2025_cartouches_GR_SRC', []));

        // Chemin réel : relire la grille comme le fait le handler, puis copier.
        const grilleLue = db.getSync('a2025_grillesTemplates', []).find(g => g.id === 'GR_SRC');
        const resultat = window.copierGrilleDepuisTrimestre(grilleLue, 'a2025');

        const destApres = db.getSync('grillesTemplates', []);
        const copie = destApres.find(g => g.inspireDe && g.inspireDe.sourceId === 'GR_SRC');
        const cartouchesCopie = copie ? db.getSync('cartouches_' + copie.id, []) : [];

        return {
            nbDestAvant,
            nbDestApres: destApres.length,
            copieExiste: !!copie,
            copieId: copie ? copie.id : null,
            copieInspireDe: copie ? copie.inspireDe : null,
            copieInspireDeTrimestre: copie ? copie.inspireDeTrimestre : null,
            nbCartouchesCopie: cartouchesCopie.length,
            nbCartouchesRetour: resultat ? resultat.nbCartouches : null,
            cartoucheGrilleId: cartouchesCopie[0] ? cartouchesCopie[0].grilleId : null,
            cartoucheEchelleId: cartouchesCopie[0] ? cartouchesCopie[0].echelleId : null,
            // Source non mutée : objet lu en mémoire + stockage byte-à-byte.
            grilleLueInspireDe: grilleLue.inspireDe,
            srcGrillesIntacte: JSON.stringify(db.getSync('a2025_grillesTemplates', [])) === srcGrillesAvant,
            srcCartouchesIntacte: JSON.stringify(db.getSync('a2025_cartouches_GR_SRC', [])) === srcCartouchesAvant
        };
    });

    // (2) COPIE dans le trimestre actif, id NEUF.
    expect(res.copieExiste).toBe(true);
    expect(res.copieId).not.toBe('GR_SRC');
    expect(res.nbDestApres).toBe(res.nbDestAvant + 1);
    // inspireDe = OBJET structuré (schéma CC), pas une chaîne brute.
    expect(res.copieInspireDe.sourceId).toBe('GR_SRC');
    expect(res.copieInspireDe.nom).toBe('Dissertation A25');
    expect(res.copieInspireDeTrimestre).toBe('a2025');
    // Cartouche copiée, réancrée sur l'id de la copie.
    expect(res.nbCartouchesCopie).toBe(1);
    expect(res.nbCartouchesRetour).toBe(1);
    expect(res.cartoucheGrilleId).toBe(res.copieId);
    // (4) TÉMOIN D-C4 — echelleId NON remappé au pas 4.
    expect(res.cartoucheEchelleId).toBe('ECH_SRC');
    // (3) SOURCE IMMUABLE.
    expect(res.grilleLueInspireDe).toBeUndefined();
    expect(res.srcGrillesIntacte).toBe(true);
    expect(res.srcCartouchesIntacte).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
