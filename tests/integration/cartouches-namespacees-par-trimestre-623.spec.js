import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #623 / S5 — LE RÉGIME NAMESPACÉ DES CARTOUCHES, VU DEPUIS L'ÉCRAN.
//
// POURQUOI CETTE SPEC EXISTE. S5 a été déclaré complet avec 4452 tests Vitest
// verts ; le push a été REFUSÉ par la garde Playwright, 8 specs rouges, toutes
// sur du RENDU, dont une perte fonctionnelle réelle (les lots d'un autre
// trimestre devenus invisibles à l'import). La suite est verte depuis, mais
// aucune spec ne visait S5 nommément : le lot dont c'était le sujet n'avait pas
// de sentinelle de rendu. Vitest tourne dans node, contre un faux `db` — il
// prouve le ROUTAGE ; il ne peut pas voir qu'un `<select>`, une barre latérale
// ou un `<p>` de modale montrent la bonne chose.
//
// LES TROIS EFFETS COUVERTS, ET LE DÉFAUT QUE CHACUN VERROUILLE :
//   1. Barre latérale + matrice : elles affichent les cartouches du trimestre
//      ACTIF. Sous le régime d'avant, `cartouches_<grilleId>` était une clé
//      GLOBALE — deux trimestres portant la même grille voyaient la même case
//      et s'y écrasaient, en silence.
//   2. Migration au boot : des cartouches restées sous la clé NUE réapparaissent
//      à l'écran après un démarrage, et la clé nue disparaît.
//   3. Désarchivage : un trimestre désarchivé RETROUVE ses cartouches. La
//      branche cartouches de `purgerCopiesModelesArchive` les détruisait —
//      correcte tant qu'elles étaient globales (la copie n'était qu'un doublon),
//      destructrice depuis qu'elles sont la SEULE donnée du trimestre.
//   4/5. L'annonce de partage (`confirmerExport`) : quand une grille vit dans
//      DEUX trimestres, la modale DIT que les cartouches envoyées sont celles du
//      trimestre actif — et se tait quand la grille n'existe qu'ici. Les deux cas
//      sont écrits parce que la seule présence de la phrase ne prouve rien : un
//      dispositif qui l'affiche toujours passerait le premier cas.
//
// ⚠ MÉTHODE — les fixtures sèment par la clé NAMESPACÉE, jamais par `cartouches_<id>`
// nue (sauf au cas 2, où l'état pré-migration EST le sujet). Et elles sèment par
// `cleSource(nom, trimestreId)`, jamais par `cle(nom)` : `cle()` route par le
// trimestre ACTIF, ce qui sèmerait dans le mauvais trimestre dès que le sujet du
// test est un AUTRE trimestre. Ce piège s'est refermé trois fois le 31 août 2026.

// Tolérances du chargement en `file://` — et RIEN d'autre. Le collecteur
// ci-dessous ne pousse que `msg.type() === 'error'` : une entrée visant un
// `console.warn` y serait morte à l'écriture, jamais confrontée à quoi que ce soit.
// C'est le cas de `/clé ABSENTE des registres/i`, retirée d'ici le 31 août 2026 après
// mesure : émetteur unique `js/trimestres.js:374`, et c'est un `warn`. Elle avait
// voyagé par copie depuis `archivage-lecture-seule-622.spec.js` sans être re-dérivée.
// ⚠ Si un jour ce collecteur s'élargit aux `warning`, cette liste devra être
// reconstruite par la mesure, pas complétée de mémoire : une tolérance née morte
// deviendrait porteuse en silence, et masquerait un signal que personne n'a voulu taire.
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    return erreurs;
}

async function ouvrir(page) {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    return erreurs;
}

/* ============================================================================
   1. LE TRIMESTRE ACTIF DÉCIDE — barre latérale ET matrice
   ============================================================================ */

test('#623 · barre latérale et matrice montrent les cartouches du trimestre ACTIF, à grille identique', async ({ page }) => {
    const erreurs = await ouvrir(page);

    const r = await page.evaluate(async () => {
        const attendre = (ms) => new Promise((res) => setTimeout(res, ms));

        // MÊME id de grille dans les deux trimestres : c'est la seule situation où
        // le régime global et le régime namespacé donnent des écrans différents.
        // Deux ids distincts rendraient le test vert dans les deux régimes.
        const grille = { id: 'GR_S5_ROUTE', nom: 'Grille S5 portée par deux trimestres',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        const cart = (id, nom, texte) => ({
            id, nom, grilleId: 'GR_S5_ROUTE',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: texte },
            dansBibliotheque: true
        });

        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026',    annee: 2026, session: 'H', actif: true,  archive: false },
            { id: 'a2025', nom: 'Automne 2025',  annee: 2025, session: 'A', actif: false, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';

        db.setSync('h2026_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.
        db.setSync('a2025_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.

        // ⚠ `cleSource(..., id)`, PAS `cle(...)` : le second sèmerait les DEUX lots
        // dans h2026 (trimestre actif), et le cas ne mesurerait plus rien.
        db.setSync(cleSource('cartouches_GR_S5_ROUTE', 'h2026'), [cart('CART_H', 'Cartouche Hiver', 'Commentaire H2026.')]);   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.
        db.setSync(cleSource('cartouches_GR_S5_ROUTE', 'a2025'), [cart('CART_A', 'Cartouche Automne', 'Commentaire A2025.')]);   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.

        // Lecture SCOPÉE à la grille du cas. Le démarrage re-sème l'exemple
        // générique (`assurerGrilleDeDepart` / `assurerCartoucheDeDepart`) dans la
        // collection du trimestre actif : il partagerait la barre sans rien dire du
        // routage. On le neutralise en LISANT le sujet, plutôt qu'en écrivant un
        // tombstone global qui déteindrait sur les autres specs de la suite.
        const lireBarre = () => [...document.querySelectorAll(
            '#listeCartouchesBanque .sidebar-item[data-grille-id="GR_S5_ROUTE"] .sidebar-item-titre'
        )].map((n) => n.textContent.trim());

        // — Trimestre actif = Hiver 2026
        await afficherBanqueCartouches();
        await attendre(300);
        const barreHiver = lireBarre();
        await chargerCartouchePourModif('CART_H', 'GR_S5_ROUTE');
        await attendre(400);
        const celluleHiver = document.getElementById('comm_C1_M');
        const matriceHiver = celluleHiver ? celluleHiver.value : null;

        // — Bascule vers Automne 2025, MÊME grille
        changerTrimestreActif('a2025');
        await attendre(300);
        await afficherBanqueCartouches();
        await attendre(300);
        const barreAutomne = lireBarre();
        await chargerCartouchePourModif('CART_A', 'GR_S5_ROUTE');
        await attendre(400);
        const celluleAutomne = document.getElementById('comm_C1_M');
        const matriceAutomne = celluleAutomne ? celluleAutomne.value : null;

        return { barreHiver, matriceHiver, barreAutomne, matriceAutomne };
    });

    console.log('ROUTAGE ACTIF →', JSON.stringify(r, null, 1));

    // La barre latérale ne montre QUE le lot du trimestre actif. Le `toEqual`
    // (et non un `toContain`) est ce qui accuse le régime global : sous lui, les
    // deux lots vivraient dans la même case et la barre en montrerait deux.
    expect(r.barreHiver, 'Hiver 2026 actif : sa cartouche, et elle seule').toEqual(['Cartouche Hiver']);
    expect(r.matriceHiver, 'la matrice ouvre le commentaire d\'Hiver 2026').toBe('Commentaire H2026.');

    expect(r.barreAutomne, 'Automne 2025 actif : sa cartouche, et elle seule').toEqual(['Cartouche Automne']);
    expect(r.matriceAutomne, 'la matrice ouvre le commentaire d\'Automne 2025').toBe('Commentaire A2025.');

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});

/* ============================================================================
   2. LA MIGRATION AU BOOT — l'état « encore sous clé nue » se résorbe à l'écran
   ============================================================================ */

test('#623 · après un démarrage, les cartouches restées sous clé NUE s\'affichent dans le trimestre actif', async ({ page }) => {
    const erreurs = await ouvrir(page);

    // État PRÉ-migration. C'est le seul endroit de cette spec où la clé nue est
    // semée : elle est le SUJET du cas, pas un raccourci de fixture.
    await page.evaluate(async () => {
        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026',   annee: 2026, session: 'H', actif: true,  archive: false },
            { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A', actif: false, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';

        const grille = { id: 'GR_S5_BOOT', nom: 'Grille S5 héritée',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        db.setSync('h2026_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.
        db.setSync('a2025_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.

        db.setSync('cartouches_GR_S5_BOOT', [{   // security-ok: fixture littérale, et la clé NUE est ici le SUJET du cas (état pré-migration), pas un raccourci.
            id: 'CART_LEGACY', nom: 'Cartouche héritée du régime global', grilleId: 'GR_S5_BOOT',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Écrite avant S5.' },
            dansBibliotheque: true
        }]);

        // Le drapeau d'idempotence est posé par les démarrages précédents : sans
        // ce retrait, le boot suivant sauterait la migration et le cas mesurerait
        // un décor, pas un geste.
        db.removeSync('migration_cartouches_namespacees_done');
        if (db.flush) await db.flush();
    });

    // LE GESTE MESURÉ : un vrai redémarrage de l'application.
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const r = await page.evaluate(async () => {
        const attendre = (ms) => new Promise((res) => setTimeout(res, ms));
        await afficherBanqueCartouches();
        await attendre(300);
        return {
            // Scopé à la grille du cas — voir la note du premier cas.
            barre: [...document.querySelectorAll(
                '#listeCartouchesBanque .sidebar-item[data-grille-id="GR_S5_BOOT"] .sidebar-item-titre'
            )].map((n) => n.textContent.trim()),
            cleNueRestee: db.getSync('cartouches_GR_S5_BOOT', null),
            copieHiver: (db.getSync('h2026_cartouches_GR_S5_BOOT', []) || []).map((c) => c.id),
            copieAutomne: (db.getSync('a2025_cartouches_GR_S5_BOOT', []) || []).map((c) => c.id),
            drapeau: db.getSync('migration_cartouches_namespacees_done', false)
        };
    });

    console.log('MIGRATION BOOT →', JSON.stringify(r, null, 1));

    expect(r.barre, 'la cartouche héritée reste visible après le démarrage').toEqual(['Cartouche héritée du régime global']);
    expect(r.copieHiver, 'copie posée dans le trimestre actif').toEqual(['CART_LEGACY']);
    expect(r.copieAutomne, 'et dans CHAQUE trimestre — sans quoi les autres la perdraient').toEqual(['CART_LEGACY']);
    expect(r.cleNueRestee, 'la clé nue est retirée, et seulement après relecture des copies').toBeNull();
    expect(r.drapeau, 'le drapeau n\'est posé qu\'une fois la migration complète').toBe(true);

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});

/* ============================================================================
   3. LE DÉSARCHIVAGE NE DÉTRUIT PLUS RIEN
   ============================================================================ */

test('#623 · un trimestre archivé PUIS désarchivé retrouve ses cartouches à l\'écran', async ({ page }) => {
    const erreurs = await ouvrir(page);

    const r = await page.evaluate(async () => {
        const attendre = (ms) => new Promise((res) => setTimeout(res, ms));

        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: true,  archive: false },
            { id: 'e2098', nom: 'Été 2098',   annee: 2098, session: 'E', actif: false, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';

        const grille = { id: 'GR_S5_ARCH', nom: 'Grille S5 du trimestre archivé',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        db.setSync('e2098_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.
        db.setSync('h2026_grillesTemplates', []);   // security-ok: tableau VIDE — l'absence est le sujet du cas, il n'y a aucune donnée à assainir.

        // ⚠ SANS CETTE PRODUCTION, LE CAS NE MESURERAIT RIEN. La purge du
        // désarchivage dérivait ses grilleIds d'`identifierTemplatesUtilises`, qui
        // les lit dans les productions et les évaluations du trimestre. Un
        // trimestre sans production donne un ensemble VIDE : la boucle destructrice
        // ne tournerait sur rien, et le témoin resterait vert en la remettant.
        db.setSync('e2098_productions', [{ id: 'PROD_1', grilleId: 'GR_S5_ARCH' }]);   // security-ok: production littérale à deux champs, écrite par le spec pour peupler `identifierTemplatesUtilises`.

        db.setSync(cleSource('cartouches_GR_S5_ARCH', 'e2098'), [{   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.
            id: 'CART_ARCH', nom: 'Cartouche du trimestre archivé', grilleId: 'GR_S5_ARCH',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Rédigée avant l\'archivage.' },
            dansBibliotheque: true
        }]);

        const archivage = archiverTrimestre('e2098');
        await attendre(400);
        const desarchivage = desarchiverTrimestre('e2098');
        await attendre(200);

        // Le trimestre rouvert devient l'actif : c'est le geste de l'enseignant qui
        // revient dans sa session passée, et c'est là que la perte se voyait.
        changerTrimestreActif('e2098');
        await attendre(300);
        await afficherBanqueCartouches();
        await attendre(300);

        const barre = [...document.querySelectorAll(
            '#listeCartouchesBanque .sidebar-item[data-grille-id="GR_S5_ARCH"] .sidebar-item-titre'
        )].map((n) => n.textContent.trim());

        await chargerCartouchePourModif('CART_ARCH', 'GR_S5_ARCH');
        await attendre(400);
        const cellule = document.getElementById('comm_C1_M');

        return {
            archivageReussi: archivage.success,
            refus: archivage.refus || null,
            desarchivageReussi: desarchivage.success,
            copiesPurgees: desarchivage.copiesPurgees || [],
            barre,
            matrice: cellule ? cellule.value : null,
            enStockage: (db.getSync('e2098_cartouches_GR_S5_ARCH', []) || []).map((c) => c.id)
        };
    });

    console.log('DÉSARCHIVAGE →', JSON.stringify(r, null, 1));

    // Que l'archivage ait été ACCEPTÉ fait partie du cas : un refus
    // (`cartouches-non-migrees`) signalerait une fixture restée sous clé nue, et
    // la suite du test ne mesurerait plus le désarchivage.
    expect(r.refus, 'aucun fil de détente déclenché : la fixture est bien namespacée').toBeNull();
    expect(r.archivageReussi, 'archiverTrimestre doit réussir').toBe(true);
    expect(r.desarchivageReussi, 'desarchiverTrimestre doit réussir').toBe(true);

    // Le cœur : la purge du désarchivage ne touche plus aux cartouches.
    expect(r.copiesPurgees.join(' '), 'aucune clé de cartouches dans les clés purgées').not.toContain('cartouches_');
    expect(r.enStockage, 'la donnée survit en stockage').toEqual(['CART_ARCH']);
    expect(r.barre, 'et elle est bien à l\'écran, là où l\'enseignant la cherche').toEqual(['Cartouche du trimestre archivé']);
    expect(r.matrice, 'son contenu aussi — pas seulement son nom').toBe('Rédigée avant l\'archivage.');

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});

/* ============================================================================
   4 & 5. L'ANNONCE DE PARTAGE — dite quand il y a ambiguïté, tue quand il n'y en a pas
   ============================================================================ */

// Ouvre la modale d'export sur une grille, lit l'annonce, puis ANNULE (aucun
// fichier produit, aucune écriture). La promesse d'`exporterPourPartager` n'est
// pas attendue avant la lecture : elle ne se résout qu'à la décision.
//
// ⚠ POURQUOI UN `eval` ICI, malgré la règle « zéro eval » du projet. `page.evaluate`
// ne transmet que des valeurs SÉRIALISABLES : une fonction ne peut pas lui être
// passée, seulement sa source. La règle vise le code applicatif sous CSP ; ce corps-ci
// est injecté par Playwright dans le contexte de la page de test, hors de cette
// contrainte. La seule alternative serait de recopier ce helper dans les deux cas —
// deux copies qui divergeraient. Même motif que le `SEMER` de
// `cartouches-import-trimestre.spec.js`.
const LIRE_ANNONCE = `async (grilleId) => {
    const attendre = (ms) => new Promise((res) => setTimeout(res, ms));
    const entite = window.partageExport.resoudreEntite('grille', grilleId);
    const promesse = window.partageExport.exporterPourPartager('grille', grilleId);
    await attendre(500);
    const overlay = document.getElementById('modalPartageExport');
    const avert = overlay ? overlay.querySelector('.alerte-attention') : null;
    const lecture = {
        entiteResolue: !!entite,
        modaleOuverte: !!overlay,
        annonce: avert ? avert.textContent.replace(/\\s+/g, ' ').trim() : null,
        texteModale: overlay ? overlay.textContent.replace(/\\s+/g, ' ').trim() : ''
    };
    const annuler = overlay ? overlay.querySelector('[data-decision="annuler"]') : null;
    if (annuler) annuler.click();
    lecture.exportConfirme = await promesse;
    return lecture;
}`;

test('#623 · grille présente dans DEUX trimestres : l\'export DIT de quel trimestre viennent les cartouches', async ({ page }) => {
    const erreurs = await ouvrir(page);

    const r = await page.evaluate(async (lireAnnonce) => {
        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026',   annee: 2026, session: 'H', actif: true,  archive: false },
            { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A', actif: false, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';

        // ⚠ LA CONDITION DE L'ANNONCE : la MÊME grille dans les collections de
        // travail des DEUX trimestres. Semée dans un seul, la phrase ne s'affiche
        // pas — et le test passerait au vert en ne prouvant rien.
        const grille = { id: 'GR_S5_DEUX', nom: 'Grille S5 partagée entre deux sessions',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        db.setSync('h2026_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.
        db.setSync('a2025_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.

        db.setSync(cleSource('cartouches_GR_S5_DEUX', 'h2026'), [{   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.
            id: 'CART_HIV', nom: 'Cartouche d\'Hiver', grilleId: 'GR_S5_DEUX',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Version Hiver.' }, dansBibliotheque: true
        }]);
        db.setSync(cleSource('cartouches_GR_S5_DEUX', 'a2025'), [{   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.
            id: 'CART_AUT', nom: 'Cartouche d\'Automne', grilleId: 'GR_S5_DEUX',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Version Automne.' }, dansBibliotheque: true
        }]);

        return await eval(lireAnnonce)('GR_S5_DEUX');
    }, LIRE_ANNONCE);

    console.log('ANNONCE (deux trimestres) →', JSON.stringify(r, null, 1));

    expect(r.entiteResolue, 'la grille doit être résolue dans le trimestre actif').toBe(true);
    expect(r.modaleOuverte, 'la modale de confirmation doit s\'ouvrir').toBe(true);
    expect(r.annonce, 'l\'ambiguïté doit être NOMMÉE, pas tranchée en silence').not.toBeNull();
    expect(r.annonce).toContain('2 trimestres');
    expect(r.annonce, 'les deux porteurs sont nommés').toContain('Automne 2025');
    // Le trimestre ACTIF est celui dont partent les cartouches, et c'est LUI que
    // la phrase doit désigner — pas seulement « un des deux ».
    expect(r.annonce, 'le trimestre dont partent les cartouches est nommé').toContain('« Hiver 2026 »');
    expect(r.exportConfirme, 'le test annule : rien n\'est produit').toBe(false);

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#623 · grille présente dans UN SEUL trimestre : aucune annonce, la modale reste sobre', async ({ page }) => {
    const erreurs = await ouvrir(page);

    const r = await page.evaluate(async (lireAnnonce) => {
        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026',   annee: 2026, session: 'H', actif: true,  archive: false },
            { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A', actif: false, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';

        const grille = { id: 'GR_S5_SEUL', nom: 'Grille S5 propre à une seule session',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        db.setSync('h2026_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit trois lignes plus haut dans ce spec, aucune entrée externe.
        db.setSync('a2025_grillesTemplates', []);   // l'autre trimestre ne la porte PAS   // security-ok: tableau VIDE — l'absence est le sujet du cas, il n'y a aucune donnée à assainir.

        db.setSync(cleSource('cartouches_GR_S5_SEUL', 'h2026'), [{   // security-ok: cartouche littérale du spec, et la clé est calculée par `cleSource` — la fonction de routage de production elle-même.
            id: 'CART_SEUL', nom: 'Cartouche unique', grilleId: 'GR_S5_SEUL',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Sans ambiguïté.' }, dansBibliotheque: true
        }]);

        return await eval(lireAnnonce)('GR_S5_SEUL');
    }, LIRE_ANNONCE);

    console.log('ANNONCE (un seul trimestre) →', JSON.stringify(r, null, 1));

    expect(r.modaleOuverte, 'la modale s\'ouvre quand même').toBe(true);
    // Le témoin jumeau du cas précédent : sans lui, un dispositif qui afficherait
    // la phrase TOUJOURS passerait le premier test. Ici il rougirait.
    expect(r.annonce, 'aucune ambiguïté à lever : pas de phrase, pas de bruit').toBeNull();
    // Et la modale reste fonctionnelle : elle annonce bien les cartouches embarquées.
    expect(r.texteModale, 'les dépendances sont tout de même annoncées').toContain('ressource(s) liée(s)');
    expect(r.exportConfirme).toBe(false);

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});
