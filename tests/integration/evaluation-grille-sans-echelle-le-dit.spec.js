import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// §4-2 du PLAN-2026-09-01 — CHOISIR UNE GRILLE SANS ÉCHELLE NE PRODUISAIT RIEN.
//
// `chargerGrilleSelectionnee` enveloppait TOUT son travail utile dans un
// `if (echelleId)`. Sans échelle choisie, la fonction peuplait le select des
// cartouches puis sortait : aucun critère rendu, aucun message, rien. Du point
// de vue de l'enseignant, l'application ne réagissait pas à son clic — et le
// texte d'attente, qui ne nommait que la grille et la cartouche, lui disait que
// la pièce manquante était la cartouche.
//
// ⚠ POURQUOI CE BANC EST EN PLAYWRIGHT ET PAS EN VITEST. Ce qui est en cause
// est ce que l'écran MONTRE. Vitest ne voit pas le rendu : il lirait le même
// `textContent` que le bloc soit visible ou masqué. On lit donc ici la
// VISIBILITÉ, pas seulement le texte.
//
// Deux chemins, deux gestes — et le banc les distingue, parce que les confondre
// est la seconde façon de mentir : envoyer choisir dans une liste vide.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

const GRILLE = {
    id: 'G-SANS-ECHELLE',
    nom: 'Grille témoin',
    criteres: [
        { id: 'c1', nom: 'Idéation', ponderation: 40 },
        { id: 'c2', nom: 'Structure', ponderation: 60 }
    ]
};
// L'échelle RÉELLE de la bibliothèque (`echelles-bibliotheque.js`) — `valeur:`.
const ECHELLE = {
    id: 'ECHELLE_TEST_SANS_NIVEAUX',
    nom: 'Échelle Chimie organique',
    niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeurCalcul: 40, couleur: '#dc3545' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#28a745' }
    ]
};

/**
 * Pose les données, choisit la grille, et rend ce que l'écran MONTRE ensuite.
 * @param echelles  ce qui existe en base
 * @param echelleId ce que l'enseignant a choisi ('' = rien)
 */
async function choisirLaGrille(page, { echelles, echelleId }) {
    return page.evaluate(({ GRILLE, echelles, echelleId }) => {
        if (typeof window.chargerGrilleSelectionnee !== 'function') {
            return { erreur: 'window.chargerGrilleSelectionnee absent' };
        }
        // security-ok: fixtures littérales du banc, aucune donnée externe.
        window.db.setSync('grillesTemplates', [GRILLE]);
        // security-ok: fixtures littérales du banc, aucune donnée externe.
        window.db.setSync('echellesTemplates', echelles);

        // ⚠ METTRE LA ZONE DANS SES CONDITIONS D'USAGE — mesuré, pas supposé.
        // Cinq ancêtres masquent #listeCriteresGrille1 sur une page qu'on vient
        // d'ouvrir : #travaux-eval-droite et #evaluations-contenu-evaluation par
        // la classe `u-hide`, puis `.sous-section` et `.section` par des règles
        // CSS que retirer une classe ne défait pas. Tant que l'écran
        // d'évaluation n'a pas été ouvert, TOUT y est invisible — y compris un
        // message parfaitement correct. Sans ce déroulé, `offsetParent` mesure
        // l'état de la page de test, pas le correctif : c'est le faux ROUGE
        // qu'a rendu la première version de ce banc.
        //
        // ⮕ CE QUE LE TÉMOIN DE VISIBILITÉ VAUT ENCORE, ET CE QU'IL NE VAUT PAS.
        // On force les ANCÊTRES, jamais la zone ni le <p> lui-même : un message
        // posé masqué serait donc toujours vu. Ce banc ne prouve pas que l'écran
        // réel affiche ce panneau — ça, c'est le chemin d'ouverture, et il n'est
        // pas ce qu'on corrige ici.
        for (let n = document.getElementById('listeCriteresGrille1').parentElement; n && n !== document.body; n = n.parentElement) {
            n.classList.remove('u-hide');
            if (getComputedStyle(n).display === 'none') n.style.display = 'block';
        }

        evaluationEnCours = { grilleId: '', echelleId: echelleId, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;

        // ⚠ Pas d'`innerHTML` interpolé, même dans un banc : la Défense J refuse
        // la FORME, et elle a raison de ne pas faire d'exception pour les tests —
        // c'est là que les habitudes se prennent.
        const selGrille = document.getElementById('selectGrille1');
        const option = document.createElement('option');
        option.value = GRILLE.id;
        option.textContent = GRILLE.nom;
        selGrille.replaceChildren(option);
        selGrille.value = GRILLE.id;
        const selEchelle = document.getElementById('selectEchelle1');
        if (selEchelle) selEchelle.value = echelleId;

        window.chargerGrilleSelectionnee();

        const zone = document.getElementById('listeCriteresGrille1');
        const p = zone.querySelector('p');
        return {
            texte: zone.textContent.replace(/\s+/g, ' ').trim(),
            // La VISIBILITÉ, pas seulement le texte : un bloc masqué garderait
            // le texte de l'état précédent et rendrait ce banc faussement vert.
            messageVisible: !!p && p.offsetParent !== null,
            nbSelectsNiveaux: zone.querySelectorAll('select.eval-select-niveau').length
        };
    }, { GRILLE, echelles, echelleId });
}

test('§4-2 · une grille choisie sans échelle DIT ce qui manque (des échelles existent)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const r = await choisirLaGrille(page, { echelles: [ECHELLE], echelleId: '' });

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.messageVisible, 'le message doit être VISIBLE, pas seulement présent').toBe(true);
    expect(r.texte, 'l\'écran doit nommer l\'échelle de performance').toMatch(/échelle de performance/i);
    expect(r.texte, 'des échelles existent : il faut dire d\'en CHOISIR une').toMatch(/choisis/i);
    expect(r.texte, 'ne pas envoyer créer une échelle quand il en existe').not.toMatch(/crée-la/i);
    expect(r.nbSelectsNiveaux, 'aucun critère ne peut être rendu sans échelle').toBe(0);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§4-2 · quand AUCUNE échelle n\'existe, l\'écran dit d\'en créer une (et où)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const r = await choisirLaGrille(page, { echelles: [], echelleId: '' });

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.messageVisible).toBe(true);
    expect(r.texte, 'il faut dire de la CRÉER').toMatch(/crée-la/i);
    // ⚠ CE BANC A ROUGI LE 1er SEPTEMBRE, ET IL AVAIT RAISON. Il exigeait le mot
    // « Matériel » — un onglet qui N'EXISTE PAS : zéro occurrence dans
    // `index.html`. Le message d'origine (`evaluation-chargement.js:297`) portait
    // ce chemin faux, et je l'avais recopié en écrivant le §4-2 : dire OÙ ne sert
    // à rien si le OÙ n'existe pas.
    // ⮕ Le banc exige désormais le chemin RÉEL, dans le vocabulaire du reste de
    // l'app (« Gérer les échelles dans Conception → Échelles de performance »),
    // et il exige les DEUX moitiés : la section et l'onglet. Une seule des deux
    // laisserait repasser un chemin à moitié faux.
    expect(r.texte, 'la SECTION doit être nommée').toMatch(/Conception/i);
    expect(r.texte, 'et l\'ONGLET aussi — « Conception » seul ne suffit pas à trouver')
        .toMatch(/Échelles de performance/i);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§4-2 · TÉMOIN — avec une échelle choisie, les critères apparaissent et le message disparaît', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const r = await choisirLaGrille(page, { echelles: [ECHELLE], echelleId: ECHELLE.id });

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    // Sans ce témoin, les deux tests ci-dessus passeraient tout aussi bien sur
    // un écran qui affiche le message EN PERMANENCE — un vert qui n'exclut rien.
    expect(r.nbSelectsNiveaux, 'les deux critères doivent être rendus').toBe(2);
    expect(r.texte, 'le message d\'attente ne doit plus être là').not.toMatch(/Choisis maintenant une échelle/i);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
