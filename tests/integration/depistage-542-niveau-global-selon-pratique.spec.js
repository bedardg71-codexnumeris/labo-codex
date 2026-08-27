import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #542 lot 3, pas 3c — LE NIVEAU DE LA PERFORMANCE GLOBALE VIENT DE LA
// PRATIQUE, ET LA SOMMATIVE N'EN DONNE PAS.
//
// CE QUI VIVAIT DANS LA CARTE « ACCOMPAGNEMENT », EN CLAIR :
//     pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I'
// Les bornes de l'échelle de Grégoire écrites dans le code — invisibles à une
// recherche sur `idme.`, puisqu'elles ne passaient même pas par `obtenirSeuil`.
// Elles affichaient un niveau IDME pour TOUT LE MONDE.
//
// ⮕ DÉCISION DE GRÉGOIRE (27 août 2026) : « c'est la pratique de notation qui
// établit la note globale de l'élève. Elle peut être la pratique sommative
// traditionnelle, comme elle peut être alternative. » La pratique dit donc dans
// quoi sa note se lit — et la SOMMATIVE répond « aucune échelle », parce qu'un
// pourcentage pondéré n'est pas un niveau atteint.
//
// ⚠ POURQUOI CE TEST EST AU NAVIGATEUR ET NON EN VITEST. Les fonctions pures du
// lot (situer, interpréter, résoudre) sont déjà couvertes unitairement. Ce qui
// ne l'est pas, c'est le BRANCHEMENT : que la carte appelle bien la pratique, et
// que le DOM montre — ou ne montre pas — un code de niveau. Une sentinelle de
// source aurait dit que le ternaire a disparu ; elle n'aurait pas dit ce que
// l'élève affiche.

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

// ⚠ UNE ÉCHELLE DONT AUCUN CODE NE COÏNCIDE AVEC IDME — W/X/Y/Z.
//
// Le premier jet employait A/B/C/D. Son « D » est aussi le « D » d'IDME : le
// test rougissait sur son propre fixture, en croyant avoir attrapé le ternaire.
// C'est le piège des identifiants de test trop courts, déjà noté dans le relais
// du projet — un motif qui apparaît par hasard dans d'autres données rend
// l'assertion muette ou menteuse.
//
// ⮕ Avec W/X/Y/Z, la lecture est sans ambiguïté : tout « I », « D », « M » ou
// « E » affiché comme niveau ne PEUT PAS venir des données. Il vient du code.
const ECHELLE_WXYZ = {
    id: 'ECH_WXYZ_542',
    nom: 'Échelle W/X/Y/Z',
    niveaux: [
        { code: 'W', nom: 'Amorce',      min: 0,  max: 49,  valeurCalcul: 25, niveauSOLO: 'unistructurel' },
        { code: 'X', nom: 'Progression', min: 50, max: 69,  valeurCalcul: 60, niveauSOLO: 'multistructurel' },
        { code: 'Y', nom: 'Consolidé',   min: 70, max: 84,  valeurCalcul: 78, niveauSOLO: 'relationnel' },
        { code: 'Z', nom: 'Rayonnant',   min: 85, max: 100, valeurCalcul: 92, niveauSOLO: 'abstrait_etendu' }
    ]
};

async function monterProfil(page, typePratique) {
    return page.evaluate(({ echelle, typePratique }) => {
        for (const dep of ['afficherProfilComplet', 'changerSectionProfil', 'db', 'cle']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }

        // ⚠ LE TRIMESTRE D'ABORD, ET C'EST L'ORDRE QUI COMPTE. `window.cle()`
        // préfixe par le trimestre actif ; à froid il n'y en a aucun, et les
        // clés restent nues. Poser le trimestre APRÈS aurait écrit les fixtures
        // sous des clés que l'application ne relit pas.
        const trimestreId = 'test542';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);

        const coursId = 'cours-542-lot3';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _modeCours: true }); // security-ok: fixture de test, litteral du fichier, aucune source externe
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test, litteral du fichier
            { da: 'TEST542', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test, litteral du fichier
            { id: 'prod-542-1', type: 'production', activiteApprentissage: 'Analyse littéraire',
              dateEcheance: '2026-04-01', groupes: ['01'], ponderation: 100 }
        ]);
        window.db.setSync(window.cle('echellesTemplates'), [echelle]); // security-ok: fixture de test, echelle definie en tete de ce fichier
        window.db.setSync(window.cle('evaluationsSauvegardees'), [ // security-ok: fixture de test, litteral du fichier
            {
                id: 'eval-542-1', etudiantDA: 'TEST542', productionId: 'prod-542-1',
                echelleId: echelle.id, noteFinale: 78, retroactionFinale: 'Bon travail.',
                criteres: [{ critereNom: 'Structure', niveauSelectionne: 'Y' }]
            }
        ]);

        // ⚠ LA PRATIQUE ACTIVE SE LIT DANS LA SSOT — `groupesCours[].pratiqueId`
        // via `groupeCoursActif` (`pratique-registre.js:641`), PAS dans
        // `modalitesEvaluation`. Un premier montage écrivait dans
        // `modalitesEvaluation` : les deux cas rendaient alors EXACTEMENT la
        // même chose, et le test « sommative » exerçait en réalité le chemin
        // « standards » sous un autre nom. Il était vert, et il ne prouvait rien.
        window.db.setSync('groupeCoursActif', { id: 'GC_542', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [
            { id: 'GC_542', trimestreId, coursId, pratiqueId: typePratique, actif: true }
        ]);

        try {
            window.afficherProfilComplet('TEST542');
            window.changerSectionProfil('accompagnement');
        } catch (e) {
            return { erreur: 'rendu planté : ' + e.message };
        }

        const container = document.getElementById('contenuProfilEtudiant');
        if (!container) return { erreur: '#contenuProfilEtudiant absent' };
        const html = container.innerHTML;

        // Isoler le paragraphe « Performance globale (P) » — c'est LUI qui
        // portait le ternaire, et lui seul qui nous intéresse.
        const i = html.indexOf('Performance globale');
        const bloc = i === -1 ? '' : html.slice(i, i + 900);

        // GARDE ANTI-SILENCE : le test doit vérifier qu'il a bien établi la
        // configuration qu'il croit exercer. Sans cette ligne, un montage qui
        // rate sa cible rend un test vert qui n'a rien testé — c'est ce qui
        // vient d'arriver.
        const pratiqueEffective = (typeof window.obtenirTypePratiqueActive === 'function')
            ? window.obtenirTypePratiqueActive() : null;

        return { aBloc: i !== -1, bloc, longueur: html.length, pratiqueEffective };
    }, { echelle: ECHELLE_WXYZ, typePratique });
}

test('#542 pas 3c · le niveau global n\'est PLUS un code IDME écrit dans le code', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const r = await monterProfil(page, 'standards');
    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.aBloc, 'le bloc « Performance globale » doit être rendu').toBe(true);
    expect(r.pratiqueEffective, 'le montage doit avoir posé la pratique par niveaux').toBe('standards');

    // ⮕ L'ASSERTION QUI PORTE LE SENS. L'échelle en base est A/B/C/D : aucun de
    // ses codes n'existe dans IDME. Si le rendu affiche « M » ou « E » comme
    // niveau, c'est que le ternaire est revenu — les données ne peuvent pas les
    // produire.
    const codesIDME = (r.bloc.match(/>\s*[IDME]\s*<\/span>/g) || []);
    expect(codesIDME, `codes IDME rendus depuis le code : ${codesIDME.join(' ')}`).toEqual([]);

    // ⮕ ET L'ASSERTION POSITIVE, sans laquelle la précédente serait vraie pour
    // rien : un bloc qui n'afficherait AUCUN niveau passerait le test « pas de
    // code IDME » sans rien prouver.
    const codeAffiche = (r.bloc.match(/>\s*([WXYZ])\s*<\/span>/) || [])[1];
    expect(codeAffiche, `aucun code de l'échelle de l'utilisateur n'est affiché — bloc : ${r.bloc.slice(0, 200)}`)
        .toBeTruthy();
    expect(r.bloc, 'le pourcentage reste affiché à côté du niveau').toMatch(/\d+\s*%/);

    // SOLO est au SURVOL, pas en vedette — même esprit que la décision de
    // Grégoire sur le comparateur : ne pas mettre une taxonomie devant un
    // enseignant qui ne l'emploie pas. Et c'est l'étiquette du niveau ATTEINT
    // qui doit s'y trouver, pas une phrase générique.
    expect(r.bloc, 'l\'étiquette SOLO du niveau atteint doit être au survol')
        .toMatch(/title="(Préstructurel|Unistructurel|Multistructurel|Relationnel|Abstrait étendu) —/);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#542 pas 3c · sous une pratique SOMMATIVE, la note globale n\'affiche aucun niveau', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const r = await monterProfil(page, 'sommative');
    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.aBloc).toBe(true);
    expect(r.pratiqueEffective, 'le montage doit avoir posé la pratique SOMMATIVE').toBe('sommative');

    // Le pourcentage reste — c'est la note, et elle est juste.
    expect(r.bloc, 'le pourcentage doit rester affiché').toMatch(/\d+\s*%/);
    // Et l'explication est DISPONIBLE au survol, jamais affichée en permanence :
    // une pratique sommative sans niveau n'est pas en panne, et un avertissement
    // permanent le laisserait croire.
    expect(r.bloc, 'la raison doit être disponible au survol').toContain('pourcentage');
    // Mais aucun code de niveau : une note pondérée n'est pas un niveau atteint.
    const codesIDME = (r.bloc.match(/>\s*[IDME]\s*<\/span>/g) || []);
    expect(codesIDME, `un niveau est affiché sous une pratique sommative : ${codesIDME.join(' ')}`).toEqual([]);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
