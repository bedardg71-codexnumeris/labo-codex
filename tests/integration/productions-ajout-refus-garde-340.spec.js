import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle — retour terrain du 22 août 2026 : « je ne vois toujours pas mes
// ajouts dans ma bibliothèque ou ma sidebar », alors que l'app affichait
// « "Artefact 3" ajoutée à ton cours ! ».
//
// Le relevé de ses données a montré UNE seule production dans le trimestre et
// AUCUNE masquée : les ajouts n'étaient pas cachés, ils n'existaient pas.
//
// Mécanisme : la garde #340 (js/productions-namespace-garde.js) refuse
// d'enregistrer un tableau de productions jugé étranger au trimestre visé —
// aucune native + au moins deux étrangères. Elle journalise
// « [DB][GARDE #340] Écriture BLOQUÉE »… et `db.set` fait alors un simple
// `return;`. La valeur de retour ne distingue donc PAS le refus du succès, et
// l'app annonçait un succès dans les deux cas.
//
// Ce qui est verrouillé ici : quand l'écriture est refusée, l'utilisateur
// l'apprend. Un message de succès sur une écriture refusée est le pire des
// défauts — il fait chercher ailleurs.

test('terrain · une écriture refusée par la garde #340 n\'est JAMAIS annoncée comme un succès', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        const out = {};
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'H2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
        // ⚠ CE QUI ARME LA GARDE : les groupes-cours NAMESPACÉS, jamais le
        // magasin global `cours`. Cette spec est née à 1.91.7 en armant par
        // `cours` ; le commit SUIVANT (b598fb5a, 1.91.8, même jour) a retiré
        // cette source — « identité = code seul » (#455) a rendu `cours`
        // global, son `trimestreId` ne désigne plus que le trimestre de
        // création. La mise en scène est restée en arrière : la map sortait
        // vide, la garde ne bloquait plus rien, et la spec échouait sur
        // « les données ont bougé » en accusant le code. (#530)
        //
        // `construireMapCoursTrimestre` n'attribue un coursId à un trimestre
        // que s'il n'apparaît QUE là — d'où un groupe par trimestre.
        db.setSync('a2026_groupesCours', [{ id: 'GC_A', coursId: 'C_A' }]);
        db.setSync('h2026_groupesCours', [{ id: 'GC_H', coursId: 'C_H' }]);
        db.setSync('cours', [{ id: 'C_A' }, { id: 'C_H' }]);
        // Aucune production native résolvable dans le trimestre actif.
        await db.set('a2026_productions', [{ id: 'P_A1', titre: 'Artefact 1', dansBibliotheque: true }]);
        await db.set('bibliothequeProductions', [
            { id: 'BIB_H1', titre: 'Artefact 2', coursId: 'C_H' },
            { id: 'BIB_H2', titre: 'Artefact 3', coursId: 'C_H' }
        ]);

        // Ancre anti-péremption : une map vide = garde inerte (fail-open
        // délibéré de `gardeProductions`). Sans cette mesure, tout le reste
        // de la spec passerait « à vide » sans que rien ne soit protégé.
        out.coursAttribues = Object.keys(construireMapCoursTrimestre()).length;

        await afficherBibliothequeProductions();
        await new Promise((res) => setTimeout(res, 400));

        // 1er ajout : une seule étrangère → la garde tolère
        document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_H1"]').click();
        await new Promise((res) => setTimeout(res, 700));
        out.apres1 = (await db.get('a2026_productions')).map((x) => x.titre);

        // 2e ajout : deux étrangères, zéro native → la garde BLOQUE
        document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_H2"]').click();
        await new Promise((res) => setTimeout(res, 800));
        out.apres2 = (await db.get('a2026_productions')).map((x) => x.titre);

        const textes = [...document.querySelectorAll('.notification, .toast, [class*="notif"]')]
            .map((x) => x.textContent.trim()).filter(Boolean);
        out.direRefus = textes.some((t) => /n'a PAS pu être ajoutée/.test(t));
        out.direSuccesAtort = textes.some((t) => /Artefact 3.*ajoutée à ton cours/.test(t));
        return out;
    });

    expect(r.coursAttribues, 'la garde doit être ARMÉE : sans coursId attribuable elle est inerte et cette spec ne prouve rien')
        .toBeGreaterThan(0);
    expect(r.apres1, 'le 1er ajout doit passer (une seule étrangère est tolérée)')
        .toEqual(['Artefact 1', 'Artefact 2']);
    expect(r.apres2, 'le 2e ajout doit être refusé : les données ne bougent pas')
        .toEqual(['Artefact 1', 'Artefact 2']);
    expect(r.direRefus, 'le refus doit être DIT à l\'utilisateur').toBe(true);
    expect(r.direSuccesAtort, 'jamais de message de succès sur une écriture refusée').toBe(false);
});

// Périmètre RÉEL de la garde, mesuré plutôt que supposé (#530, 26 août 2026).
//
// La règle d'attribution de `construireMapCoursTrimestre` est délibérément
// stricte : un coursId n'est rattaché à un trimestre que s'il n'apparaît QUE
// là. Un cours reconduit d'une session à l'autre — le cas ORDINAIRE d'un
// enseignant — est donc « non attribuable », et la garde se tait.
//
// Ce n'est pas un oubli : c'est le prix payé le 22 août, quand la garde
// ancrée sur `cours.trimestreId` a refusé TOUTE écriture dans le trimestre de
// Grégoire, sa collection entière comptant comme étrangère.
//
// Ce test fixe ce prix par écrit. S'il rougit, c'est que quelqu'un a rendu la
// garde plus mordante : qu'il relise d'abord b598fb5a avant de se réjouir.
test('périmètre · un cours reconduit d\'un trimestre à l\'autre rend la garde INERTE', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'H2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');

        // LE cas ordinaire : le même cours enseigné aux deux sessions.
        db.setSync('a2026_groupesCours', [{ id: 'GC1', coursId: 'C_601101' }]);
        db.setSync('h2026_groupesCours', [{ id: 'GC2', coursId: 'C_601101' }]);

        const map = construireMapCoursTrimestre();

        // Et la conséquence : un tableau 100 % étranger passe quand même.
        const etranger = [
            { id: 'X1', titre: 'venue de H2026', coursId: 'C_601101' },
            { id: 'X2', titre: 'venue de H2026 aussi', coursId: 'C_601101' }
        ];
        const verdict = gardeNamespaceProductions('a2026_productions', etranger);

        return { attribues: Object.keys(map), bloque: verdict.coherent === false };
    });

    expect(r.attribues, 'un cours vu dans deux trimestres n\'est attribuable à aucun')
        .toEqual([]);
    expect(r.bloque, 'garde inerte : rien n\'est attribuable, donc rien n\'est bloqué — c\'est délibéré')
        .toBe(false);
});
