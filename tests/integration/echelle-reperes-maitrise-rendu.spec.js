import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #555 · LE BLOC « REPÈRES DE MAÎTRISE » SE REND DANS LE VRAI `index.html`.
//
// ⮕ ÉCRITE EN SPEC, PAS EN PORTE TERRAIN — règle 1 du skill `portes-terrain` :
// une porte n'existe que si aucune machine ne peut répondre. Ici une machine le
// peut, et c'est la leçon de la nuit du 27-28 août : Vitest tourne dans `node`
// et NE VOIT PAS le rendu. Le banc unitaire de #555 prouve les refus ; seul
// WebKit prouve que les deux listes existent à l'écran, dans le bon ordre, sous
// les niveaux — et que l'aperçu dit la zone de chaque niveau.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#555 · l\'éditeur d\'échelle rend les deux repères, et l\'aperçu dit la zone', async ({ page }) => {
    const erreurs = [];
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

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherNiveauxEchelle !== 'function'
            || typeof window.ordonnerNiveauxParPlage !== 'function') {
            return { erreur: 'pré-requis absents' };
        }

        // Une échelle SANS aucune lettre d'IDME, saisie dans le désordre : c'est
        // le seul montage qui distingue l'ordre des plages de l'ordre de saisie.
        const echelle = {
            id: 'ECH_SPEC_555',
            nom: 'Cotation W-X-Y-Z',
            seuilSuffisance: 'X',
            seuilMaitrise: 'Y',
            niveaux: [
                { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
                { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
                { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
                { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
            ]
        };

        window.afficherNiveauxEchelle(echelle);

        const editeur = document.getElementById('tableauNiveauxEchelle');

        // ⚠ TROIS ANCÊTRES SONT MASQUÉS tant que l'écran n'est pas ouvert par la
        // navigation — mesuré, pas supposé. Et `conteneurEditionEchelle` l'est
        // par la CLASSE `u-hide`, qui porte un `!important` : un `style.display`
        // inline ne l'écrase pas. Première version de cette spec écrite ainsi,
        // et c'est la garde anti-silence ci-dessous qui l'a dit — sans elle,
        // toutes les largeurs auraient valu 0 et le test serait passé au vert
        // sans rien mesurer.
        ['conteneurEditionEchelle', 'conception-echelle-performance', 'section-conception']
            .forEach((id) => {
                const n = document.getElementById(id);
                if (!n) return;
                n.classList.remove('u-hide');
                n.style.display = 'block';
            });

        const largeur = (el) => (el ? Math.round(el.getBoundingClientRect().width) : 0);
        const lignes = (el) => {
            if (!el) return 0;
            const hauteurLigne = parseFloat(getComputedStyle(el).lineHeight) || 16;
            return Math.round(el.getBoundingClientRect().height / hauteurLigne);
        };
        const labelDe = (select) => select.closest('.groupe-form').querySelector('label');
        const selectSOLO = editeur.querySelector('select[data-champ="niveauSOLO"]');
        const apercu = document.getElementById('apercuEchelleNiveaux');
        const selects = [...editeur.querySelectorAll('select[data-champ^="seuil"]')];

        return {
            titrePresent: editeur.textContent.includes('Repères de maîtrise'),
            champs: selects.map((s) => s.dataset.champ),
            // Les options de chaque liste, dans l'ordre où WebKit les rend.
            options: selects.map((s) => [...s.options].map((o) => o.value)),
            // Ce que chaque liste a de sélectionné : les repères enregistrés.
            selection: selects.map((s) => s.value),
            // Le bloc vient APRÈS les niveaux, jamais avant : on désigne des
            // niveaux qui doivent déjà exister.
            reperesApresNiveaux: editeur.innerHTML.indexOf('Repères de maîtrise')
                > editeur.innerHTML.indexOf('data-champ="valeurCalcul"'),
            apercu: apercu ? apercu.textContent.replace(/\s+/g, ' ').trim() : '',

            // Mise en page, signalée sur capture par Grégoire le 28 août : la
            // grille des niveaux déclarait SEPT colonnes pour HUIT champs, et le
            // bloc des repères réutilisait cette grille. Les listes tombaient
            // dans une colonne de 56-64 px, donc coupées, et leurs libellés
            // s'empilaient mot par mot.
            largeurSOLO: largeur(selectSOLO),
            lignesLabelSOLO: lignes(labelDe(selectSOLO)),
            largeursReperes: selects.map(largeur),
            lignesLabelsReperes: selects.map((s) => lignes(labelDe(s))),
            largeurConteneur: largeur(editeur)
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.titrePresent).toBe(true);
    expect(resultat.champs).toEqual(['seuilSuffisance', 'seuilMaitrise']);

    // L'ordre des PLAGES (W < X < Y < Z), pas celui de la saisie (Y, W, Z, X).
    expect(resultat.options[0]).toEqual(['', 'W', 'X', 'Y', 'Z']);
    expect(resultat.options[1]).toEqual(['', 'W', 'X', 'Y', 'Z']);
    expect(resultat.selection).toEqual(['X', 'Y']);
    expect(resultat.reperesApresNiveaux).toBe(true);

    // L'aperçu nomme la zone de chaque niveau — sans quoi le choix reste un
    // formulaire dont on ne voit jamais l'effet.
    expect(resultat.apercu).toContain('à travailler');   // W, sous la suffisance
    expect(resultat.apercu).toContain('suffisant');      // X, entre les deux
    expect(resultat.apercu).toContain('maîtrisé');       // Y et Z, au-dessus

    // ── MISE EN PAGE ────────────────────────────────────────────────────────
    // Garde anti-silence : sans conteneur mesurable, tout ce qui suit vaudrait 0
    // et passerait. C'est le cas exact qui rendrait ces assertions décoratives.
    expect(resultat.largeurConteneur).toBeGreaterThan(600);

    // Le seuil n'est pas choisi au hasard : la colonne de repli qui causait le
    // défaut faisait 56 à 64 px. Exiger le double, c'est prouver que la liste
    // n'est plus dans cette colonne — sans figer une largeur exacte, qui
    // rougirait au premier ajustement de la grille.
    expect(resultat.largeurSOLO).toBeGreaterThan(128);
    resultat.largeursReperes.forEach((l) => expect(l).toBeGreaterThan(128));

    // Et les libellés ne s'empilent plus mot par mot : « Suffisant à partir de »
    // tient sur une ligne, « Niveau SOLO atteint (facultatif) » sur deux au plus
    // (il en occupait quatre).
    resultat.lignesLabelsReperes.forEach((n) => expect(n).toBeLessThanOrEqual(1));
    expect(resultat.lignesLabelSOLO).toBeLessThanOrEqual(2);

    expect(erreurs).toEqual([]);
});

// ── LA DISPOSITION À HUIT COLONNES ──────────────────────────────────────────
//
// ⚠ CE SECOND CAS N'EST PAS UN DOUBLON. Le viewport par défaut de la suite est
// 1280 px, où la règle `@media (max-width: 1280px)` s'applique : le test
// ci-dessus n'éprouve donc QUE la disposition de repli, où le champ SOLO prend
// toute la largeur. La correction principale — une huitième colonne pour un
// huitième champ — ne vit qu'au-dessus de 1280 px, c'est-à-dire sur l'écran de
// Grégoire, celui de la capture. Sans ce cas, elle ne serait verrouillée par
// rien.
test('#555 · en fenêtre large, les huit champs d\'un niveau tiennent sur UNE rangée', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        ['conteneurEditionEchelle', 'conception-echelle-performance', 'section-conception']
            .forEach((id) => {
                const n = document.getElementById(id);
                if (!n) return;
                n.classList.remove('u-hide');
                n.style.display = 'block';
            });

        window.afficherNiveauxEchelle({
            id: 'ECH_SPEC_555_LARGE', nom: 'Deux niveaux',
            seuilSuffisance: 'I', seuilMaitrise: 'M',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 64, valeurCalcul: 32, couleur: '#111111' },
                { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79, couleur: '#222222' }
            ]
        });

        const editeur = document.getElementById('tableauNiveauxEchelle');
        const grille = editeur.querySelector('.echelle-niveau-grille');
        const champs = [...grille.querySelectorAll(':scope > .groupe-form')];
        // ⚠ LE BORD BAS, PAS LE BORD HAUT. La grille est en `align-items: end` :
        // sur une même rangée, un champ dont le libellé tient sur deux lignes
        // commence PLUS HAUT que ses voisins. Compter les bords hauts distincts
        // rendait 6 pour une rangée unique — première version de ce test.
        const bas = (el) => Math.round(el.getBoundingClientRect().bottom);
        const solo = editeur.querySelector('select[data-champ="niveauSOLO"]');

        return {
            nbChamps: champs.length,
            // Une seule rangée : tous les champs partagent le même bord BAS.
            rangees: [...new Set(champs.map(bas))].length,
            largeurSOLO: Math.round(solo.getBoundingClientRect().width),
            // Aucun débordement, ni dans la grille ni dans la page — c'est la
            // règle du dépôt depuis #118/#283.
            grilleDeborde: grille.scrollWidth > Math.ceil(grille.getBoundingClientRect().width),
            pageDeborde: document.documentElement.scrollWidth > window.innerWidth
        };
    });

    expect(resultat.nbChamps).toBe(8);
    expect(resultat.rangees).toBe(1);
    expect(resultat.largeurSOLO).toBeGreaterThan(128);
    expect(resultat.grilleDeborde).toBe(false);
    expect(resultat.pageDeborde).toBe(false);
});
