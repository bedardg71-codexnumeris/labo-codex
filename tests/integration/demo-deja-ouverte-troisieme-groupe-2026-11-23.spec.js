import { test, expect } from '@playwright/test';
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, enDemo, releve, ecarts, horsDeLaDemo, DE_LA_DEMO, faireLaModelisation
} from './harness/deux-temps-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LA DÉMO DÉJÀ OUVERTE REÇOIT LE TROISIÈME GROUPE (publication des parcours, 23 nov. 2026, point 4)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-2026-11-22-publication-parcours.md`, point 4. La version du pack reste 21.3 ;
// une démo installée avant le troisième groupe reçoit le SEUL bloc `groupeParStandards`, par ajout
// (`verserGroupeParStandardsSiAbsent`, js/demo-namespace.js), au chargement suivant.
//
// Le banc, dans l'application réelle, aux deux orientations de l'iPad que permet la Modélisation (voir TAILLES) :
//   1. une démo « d'avant » : celle du chargement, dont on retire le troisième groupe (ce qu'avait une démo installée
//      avant le 22 nov.) ;
//   2. la Modélisation de « Mettre ta classe en place », jouée de bout en bout : le deuxième groupe de la personne ;
//   3. un rechargement, la démo ouverte : chaque clé de la démo garde ce qu'elle avait, item pour item, à sa place ;
//      le troisième groupe arrive (l'en-tête offre trois groupes, « le deuxième » reste celui de la personne) ;
//      `cours` garde ses cours et reçoit celui du troisième groupe, comme à l'entrée ;
//   4. un second rechargement ne change aucune des clés que le versement écrit ;
//   5. la sortie de la démo rend les clés hors de la démo telles qu'avant l'entrée dans la démo.
// Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) : WebKit n'y existe pas, Safari reste dû au Mac.
//
// BREAK-TEST (23 nov. 2026) : l'appel de `verserGroupeParStandardsSiAbsent` retiré d'`initialiserDemoNamespace` →
// rouge à l'étape 3 (« le troisième groupe arrive »). Remis à l'identique.

// À 1180 × 820, le banc partagé de la Modélisation rougit déjà sur la base, à l'étape 1 (rapport de
// lot/demo-par-standards, § 5) : on le joue à sa taille propre (1180 × 900) et en portrait.
const TAILLES = [[1180, 900], [820, 1180]];

const groupesDeLEntete = (page) => page.evaluate(() => [...document.querySelectorAll('#selectGroupeCoursHeader optgroup[label="Groupe-cours"] option')]
    .map((o) => o.value));

/** Retire de la démo tout ce que le bloc du troisième groupe y a versé : une démo installée avant le 22 nov. */
async function rendreLaDemoDAvant(page) {
    await page.evaluate(async () => {
        const pack = window.PACK_DEMARRAGE;
        const a = window.ajoutsDuGroupeParStandards(pack);
        const ids = new Set();
        Object.values(a.collections).forEach((l) => l.forEach((x) => x && x.id && ids.add(x.id)));
        ids.add(a.groupeCours.id); ids.add(a.horaire.id); ids.add(a.groupeCours.coursId);
        for (const k of await db.keys()) {
            if (k.indexOf('demo_') !== 0) continue;
            const v = db.getSync(k, null);
            if (!Array.isArray(v)) continue;
            const reste = v.filter((x) => !(x && ids.has(x.id)));
            if (reste.length === v.length) continue;
            if (reste.length) db.setSync(k, reste); else db.removeSync(k);
        }
        await db.flush();
    });
}

for (const [L, H] of TAILLES) {
    test(`${L} × ${H} : une démo d'avant, avec le deuxième groupe de la Modélisation, garde tout et reçoit le troisième groupe`, async ({ page }) => {
        test.setTimeout(300000);
        page.setDefaultTimeout(20000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirEspaceVide(page, L, H);
        await expect.poll(() => page.evaluate(() => !!window.PACK_DEMARRAGE && Array.isArray(db.getSync('demo_groupesCours', null)))).toBe(true);

        // 0. Un premier passage dans la démo, rechargée : les migrations de démarrage de l'application (dansBibliotheque
        //    des échelles, l'échelle de départ semée, la purge de modalitesEvaluation) touchent la démo ouverte au premier
        //    rechargement, avec ou sans ce lot (mesuré par un témoin le 23 nov.) ; elles sont faites avant la mesure.
        await page.evaluate(() => activerModeDemo());
        await expect.poll(() => enDemo(page)).toBe(true);
        await page.reload();
        await attendreApplication(page);
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);

        // 1. La démo d'avant.
        await rendreLaDemoDAvant(page);
        expect(await page.evaluate(() => db.getSync('demo_groupesCours', []).map((g) => g.id))).toEqual(['GC_DEMO']);

        // 2. La Modélisation de « Mettre ta classe en place », de bout en bout : le deuxième groupe de la personne.
        const fermee = await releve(page);
        await ouvrirPanneau(page);
        await boutonModele(page, 'classe').click();
        await faireLaModelisation(page);
        await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await enDemo(page)).toBe(true);
        expect(await groupesDeLEntete(page)).toHaveLength(2);
        const sienId = await page.evaluate(() => ParcoursClasse.deuxiemeGroupe().id);
        const avant = await releve(page);

        // 3. Le rechargement, la démo ouverte : le versement additif.
        await page.reload();
        await attendreApplication(page);
        await expect.poll(() => page.evaluate(() => db.getSync('demo_groupesCours', []).some((g) => g.id === 'GC_DEMO_STD')),
            { message: 'le troisième groupe arrive' }).toBe(true);
        const apres = await releve(page);
        const parties = [];
        // Les clés de la démo telles que `db` les rend (`db:`) ; `ls:` n'est que l'endroit où db.js les range, et un cache
        // calculé (les instantanés, `demo_snapshots_…`) y passe d'un rangement à l'autre au démarrage, sans rapport avec ce lot.
        for (const k of Object.keys(avant).filter((c) => /^db:demo_/.test(c))) {
            expect(k in apres, k + ' reste').toBe(true);
            const a = JSON.parse(avant[k]), b = JSON.parse(apres[k]);
            if (Array.isArray(a)) {
                if (JSON.stringify(b.slice(0, a.length)) !== JSON.stringify(a)) parties.push(k);
            } else if (avant[k] !== apres[k]) parties.push(k);
        }
        expect(parties, 'chaque clé de la démo garde ce qu\'elle avait, item pour item, à sa place').toEqual([]);
        // Hors de la démo, la démo ouverte : `cours` garde ses cours, dans l'ordre, et reçoit celui du troisième groupe, comme
        // à l'entrée. Par leurs identités : les migrations de démarrage de l'application retouchent les cours à chaque
        // chargement (un `pratiqueId` posé, mesuré le 23 nov.), comme elles recalculent les caches `calendrierComplet`,
        // `indicesAssiduite` et `indicesCP`. L'étape 5 juge ce qui reste hors de la démo une fois sortie.
        {
            const a = JSON.parse(avant['db:cours']), b = JSON.parse(apres['db:cours']);
            expect(b.slice(0, a.length).map((c) => c.id), '`cours` garde ses cours').toEqual(a.map((c) => c.id));
            expect(b.slice(a.length).map((c) => [c.id, c.isDemo]), '`cours` reçoit le cours du troisième groupe').toEqual([['demo-cours-std', true]]);
        }
        const s = await page.evaluate(() => ({
            groupes: db.getSync('demo_groupesCours', []).map((g) => g.id),
            dix: db.getSync('demo_groupeEtudiants', []).filter((e) => e.coursId === 'demo-cours-std').length,
            productions: db.getSync('demo_productions', []).filter((p) => p.coursId === 'demo-cours-std').map((p) => p.titre.replace(/\u00a0/g, ' ')),
            ensemble: db.getSync('demo_ensemblesCibles', []).map((e) => e.id),
            deuxieme: ParcoursClasse.deuxiemeGroupe().id
        }));
        expect(s.groupes).toEqual(['GC_DEMO', sienId, 'GC_DEMO_STD']);
        expect(s.dix).toBe(10);
        expect(s.productions).toEqual(['Stratégies de lecture sur « Deux-Rives »', 'Stratégies de lecture sur « Marine »']);
        expect(s.ensemble).toEqual(['ENSC_DEMO_STD']);
        expect(s.deuxieme, '« le deuxième groupe » reste celui de la personne').toBe(sienId);
        expect(await groupesDeLEntete(page), 'l\'en-tête offre les trois groupes (le troisième, versé après, à la suite)').toEqual(['GC_DEMO', sienId, 'GC_DEMO_STD']);

        // 4. Idempotent : un second rechargement ne change aucune des clés que le versement écrit. (Les caches que
        //    l'application recalcule de l'horaire à chaque démarrage, `demo_horaireHebdo` et `demo_calendrierComplet`,
        //    suivent le nouvel horaire au chargement d'après : c'est ce qu'ils font aussi pour l'horaire de la Modélisation.)
        await page.reload();
        await attendreApplication(page);
        const encore = await releve(page);
        const VERSEES = ['groupesCours', 'horaires', 'listeCours', 'groupeEtudiants', 'productions', 'echellesTemplates',
            'pratiquesConfigurables', 'ensemblesCibles', 'inscriptionsCibles'].map((c) => 'db:demo_' + c);
        expect(ecarts(apres, encore, (k) => VERSEES.includes(k)), 'idempotent').toEqual([]);
        expect(JSON.parse(encore['db:cours']).map((c) => c.id)).toEqual(JSON.parse(apres['db:cours']).map((c) => c.id));

        // 5. La sortie : les clés hors de la démo redeviennent celles d'avant l'entrée dans la démo.
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        expect(ecarts(fermee, await releve(page), horsDeLaDemo), 'hors de la démo, rien ne reste').toEqual([]);
        expect(erreurs).toEqual([]);
    });
}
