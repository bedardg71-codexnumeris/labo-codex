import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// #1298 (19 nov. 2026, lot `lot/dupliquer-copie-profonde`) — LES COPIES QUI NE SE LIAIENT QUE PAR LE CACHE MÉMOIRE.
//
// Au-delà de 25 Ki caractères, `db` sert une clé par son cache mémoire, PAR RÉFÉRENCE (`db.get` rend l'objet du
// cache, `db.set` y range l'objet écrit). Deux familles de gestes ne liaient leur copie à la source QUE dans ce cas,
// mesuré au lot (petite collection : rien ; grande : le partage ci-dessous) :
//   · d'une clé à une autre — « Utiliser dans ce trimestre » depuis la bibliothèque (grille, échelle, production,
//     cartouche, pratique) et l'import d'une cartouche d'un autre trimestre : la copie du trimestre et l'original
//     partageaient leurs sous-objets EN MÉMOIRE ; modifier l'une modifiait l'autre, et la prochaine écriture de la
//     clé de l'original l'enregistrait ;
//   · dans la même clé, deux gestes qui reconstruisent la copie mais reprenaient un sous-objet tel quel :
//     `dupliquerGrille` (les sous-objets de chaque critère) et `dupliquerPratique` (`calcul_note`).
// Un essai par geste : la collection est GROSSIE pour passer par le cache, le geste est fait, et aucun objet de la
// copie n'est un objet de l'original (relus par `db.get`, là où le partage vivait). Puis un scénario d'effet de bout
// en bout pour la grille.
//
// ▣ BREAK-TEST (fait au lot, voir le rapport) : sur le code d'avant, les huit essais rougissent au partage, et le
//   scénario d'effet rougit sur le texte de la bibliothèque.
// Données FICTIVES. ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

const A = 'a2032_', H = 'h2032_';
const TEXTE_D = 'Texte fictif du niveau D, dans la bibliothèque.';
const TEXTE_COPIE = 'Texte réécrit dans la copie du trimestre seulement.';
const GRILLE = { id: 'GRILLE_SRC_1298', nom: 'Grille fictive', type: 'holistique', isDemo: false, auteur: 'Fictif',
    criteres: [{ id: 'CR_A_1298', nom: 'Pertinence fictive', type: 'holistique', ponderation: 100, descripteurs: { echelleId: 'ECHELLE_IDME_DEPART', parNiveau: { D: TEXTE_D } } }] };
const ECHELLE = { id: 'ECH_SRC_1298', nom: 'Échelle fictive', isDemo: false, auteur: 'Fictif', config: { type: 'IDME' },
    niveaux: [{ code: 'I', nom: 'Insuffisant', min: 0, max: 59 }, { code: 'D', nom: 'Développement', min: 60, max: 74 }, { code: 'M', nom: 'Maîtrisé', min: 75, max: 84 }, { code: 'E', nom: 'Étendu', min: 85, max: 100 }] };
const CARTOUCHE = { id: 'CART_SRC_1298', nom: 'Cartouche fictive', grilleId: GRILLE.id, isDemo: false, auteur: 'Fictif',
    criteres: [{ id: 'CR_A_1298', nom: 'Pertinence fictive' }], niveaux: [{ code: 'D', nom: 'Développement' }], commentaires: { CR_A_1298_D: 'Commentaire fictif' } };
const PRODUCTION = { id: 'PROD_SRC_1298', titre: 'Production fictive', type: 'examen', grilleId: GRILLE.id, ponderation: 20, isDemo: false, auteur: 'Fictif',
    echeancesParGroupe: { '00001': { date: '2032-10-01' } }, titresBlocs: { tache: 'Bloc fictif' }, champsPersonnalises: [{ id: 'C1', titre: 'Champ', texte: 'x' }] };
const PRATIQUE = { id: 'pratique_SRC_1298', nom: 'Pratique fictive', description: 'd', type: 'standards', calcul_note: { methode: 'moyenne_ponderee' },
    configuration: { seuil: 3 }, config: { id: 'pratique_SRC_1298', nom: 'Pratique fictive', type: 'standards', calcul_note: { methode: 'moyenne_ponderee' }, configuration: { seuil: 3 } },
    auteur: 'Fictif', isDemo: false, dansBibliotheque: true };

// [nom, clé de l'original (brute), original, clé de la copie (brute ; null = la même), geste, arguments]
const GESTES = [
    ['« Utiliser dans ce trimestre » une grille', 'bibliothequeGrilles', GRILLE, A + 'grillesTemplates', 'ajouterGrilleIndividuelle', [GRILLE.id]],
    ['« Utiliser dans ce trimestre » une échelle', 'bibliothequeEchelles', ECHELLE, A + 'echellesTemplates', 'ajouterEchelleIndividuelle', [ECHELLE.id]],
    ['« Utiliser dans ce trimestre » une production', 'bibliothequeProductions', PRODUCTION, A + 'productions', 'ajouterProductionIndividuelle', [PRODUCTION.id]],
    ['« Utiliser dans ce trimestre » une cartouche', 'bibliothequeCartouches', CARTOUCHE, A + `cartouches_${GRILLE.id}`, 'ajouterCartoucheIndividuelle', [CARTOUCHE.id, GRILLE.id]],
    ['« Utiliser dans ce trimestre » une pratique', 'bibliothequePratiques', PRATIQUE, A + 'pratiquesConfigurables', 'ajouterPratiqueALaSelection', [PRATIQUE.id]],
    ['importer une cartouche d’un autre trimestre', H + `cartouches_${GRILLE.id}`, CARTOUCHE, A + `cartouches_${GRILLE.id}`, 'importerUneCartoucheTrimestre', ['h2032', GRILLE.id, CARTOUCHE.id]],
    ['dupliquerGrille (reconstruite, critères étalés)', A + 'grillesTemplates', GRILLE, null, 'dupliquerGrille', [GRILLE.id]],
    ['dupliquerPratique (reconstruite, `calcul_note` repris)', A + 'pratiquesConfigurables', PRATIQUE, null, 'dupliquerPratique', [PRATIQUE.id]]
];

async function ouvrirLApplication(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }, { id: 'h2032', nom: 'Hiver 2032', actif: false }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApplication(page);
}

/**
 * Sème l'original (et la grille porteuse des cartouches) dans des collections GROSSIES par du remplissage, fait le
 * geste, et rend les chemins des objets que la copie partage avec l'original (relus par `db.get`), et la source des
 * deux clés (cache mémoire ou base).
 */
const fairePuisMesurer = (page, [, src, source, dest, fn, args]) => page.evaluate(async ({ src, source, dest, fn, args, GRILLE, A, H }) => {
    // Les objets en commun, par identité : écrit ici, dans le banc, pour ne pas juger le geste avec le code jugé.
    const objetsPartages = (a, b) => {
        const vus = new Set();
        (function noter(v) { if (!v || typeof v !== 'object' || vus.has(v)) return; vus.add(v); for (const k of Object.keys(v)) noter(v[k]); })(a);
        const chemins = [];
        (function chercher(v, ch, deja) {
            if (!v || typeof v !== 'object' || deja.has(v)) return;
            deja.add(v);
            if (vus.has(v)) { chemins.push(ch || '(racine)'); return; }
            for (const k of Object.keys(v)) chercher(v[k], ch ? ch + '.' + k : k, deja);
        })(b, '', new Set());
        return chemins;
    };
    const remplissage = () => Array.from({ length: 30 }, (_, i) => ({ id: 'REMPLI_' + i, nom: 'Remplissage ' + i, titre: 'Remplissage ' + i, criteres: [], niveaux: [], description: 'x'.repeat(1200) }));
    // Les sorties d'autres fichiers, seules coutures : les questions et les messages.
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = (q, d) => d || 'Nom fictif';
    window.demanderEchelleAdoption = async () => ({ adopter: true, echelleId: null });
    const cleDest = dest || src;
    const grilles = (k) => k === A + 'grillesTemplates' || k === H + 'grillesTemplates';
    for (const k of [A + 'grillesTemplates', H + 'grillesTemplates']) if (k !== src && k !== cleDest) await db.set(k, [JSON.parse(JSON.stringify(GRILLE))]);   // security-ok: banc, données fictives
    await db.set(src, [JSON.parse(JSON.stringify(source))].concat(remplissage()));   // security-ok: idem
    if (dest) await db.set(dest, grilles(dest) ? [] .concat(remplissage()) : remplissage());   // security-ok: idem
    const idsAvant = ((await db.get(cleDest)) || []).map((x) => x.id);
    await window[fn](...args);
    await db.flush();
    const original = ((await db.get(src)) || []).find((x) => x.id === source.id);
    const copie = ((await db.get(cleDest)) || []).find((x) => !idsAvant.includes(x.id) && (dest || x.id !== source.id) && x.id !== 'GRILLE_GENERIQUE');
    return {
        enCache: db.memoryCache.has(src) && db.memoryCache.has(cleDest),
        original: !!original,
        copie: copie ? copie.id : null,
        partages: original && copie ? objetsPartages(original, copie) : null
    };
}, { src, source, dest, fn, args, GRILLE, A, H });

for (const vue of [{ nom: 'paysage', width: 1180, height: 820 }, { nom: 'portrait', width: 820, height: 1180 }]) {
    test.describe(`#1298 · Copies par le cache mémoire — la copie est à elle (${vue.nom}, ${vue.width} × ${vue.height})`, () => {
        test.use({ viewport: { width: vue.width, height: vue.height }, hasTouch: true });

        for (const geste of GESTES) {
            test(`${geste[0]} : aucun objet en commun avec l’original, collection servie par le cache`, async ({ page }) => {
                const erreurs = [];
                page.on('pageerror', (e) => erreurs.push(e.message));
                await ouvrirLApplication(page);
                const r = await fairePuisMesurer(page, geste);
                expect(r.enCache).toBe(true);        // la condition du défaut est bien réunie
                expect(r.original).toBe(true);
                expect(r.copie).not.toBeNull();
                expect(r.partages).toEqual([]);
                expect(erreurs).toEqual([]);
            });
        }

        test('« Utiliser dans ce trimestre » une grille, puis changer sa copie : la bibliothèque ne change pas, ni en mémoire ni après rechargement', async ({ page }) => {
            const erreurs = [];
            page.on('pageerror', (e) => erreurs.push(e.message));
            await ouvrirLApplication(page);
            await page.evaluate(() => assurerEchelleIdmeDeDepart());
            const r = await fairePuisMesurer(page, GESTES[0]);
            expect(r.copie).not.toBeNull();
            const texteBibliotheque = () => page.evaluate(async (id) => {
                const g = ((await db.get('bibliothequeGrilles')) || []).find((x) => x.id === id);
                return g && g.criteres[0].descripteurs.parNiveau.D;
            }, GRILLE.id);

            // La copie du trimestre, ouverte dans l'éditeur : son texte de niveau D réécrit par sa case.
            await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, r.copie);
            const caseD = page.locator(`#listeCriteres textarea[data-on-change="modifierDescripteurNiveauHandler"][data-grille-id="${r.copie}"][data-critere-index="0"][data-niveau="D"]`);
            await expect(caseD).toHaveValue(TEXTE_D);
            await caseD.fill(TEXTE_COPIE);
            await caseD.press('Tab');
            await expect.poll(() => page.evaluate(async (id) => {
                const g = ((await db.get(cle('grillesTemplates'))) || []).find((x) => x.id === id);
                return g && g.criteres[0].descripteurs.parNiveau.D;
            }, r.copie)).toBe(TEXTE_COPIE);
            expect(await texteBibliotheque()).toBe(TEXTE_D);

            // La bibliothèque réécrite par un geste ordinaire : garder dans la bibliothèque une AUTRE grille du trimestre
            // (sans cette écriture, rien n'enregistre le partage : mesuré au lot, sur le code d'avant, il survivait alors
            // au rechargement). Puis la page rechargée.
            const tailleAvant = await page.evaluate(async (autre) => {
                await db.modifier(cle('grillesTemplates'), (l) => (l || []).concat([autre]));   // security-ok: banc, une grille fictive
                return ((await db.get('bibliothequeGrilles')) || []).length;
            }, { id: 'GRILLE_AUTRE_1298', nom: 'Autre grille fictive', type: 'holistique', criteres: [{ id: 'CR_Z_1298', nom: 'Critère fictif', type: 'holistique', ponderation: 100 }] });
            await page.evaluate(async () => { await garderGrilleDansBibliotheque('GRILLE_AUTRE_1298'); await db.flush(); });
            expect(await page.evaluate(async () => ((await db.get('bibliothequeGrilles')) || []).length)).toBe(tailleAvant + 1);
            expect(await texteBibliotheque()).toBe(TEXTE_D);
            await page.reload();
            await attendreApplication(page);
            expect(await texteBibliotheque()).toBe(TEXTE_D);
            expect(erreurs).toEqual([]);
        });
    });
}
