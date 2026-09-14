import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #863 — LE BANDEAU « CARTOUCHE VERROUILLÉE » S'AFFICHE QUAND LA
// CARTOUCHE EST VERROUILLÉE.
//
// POURQUOI CETTE SPEC EXISTE. `#alerteVerrouillage` portait `hidden-my15-warning`,
// une classe du bloc <style> d'index.html qui contenait `display: none`. Le code
// (`chargerCartouchePourModif`) l'affichait en retirant `u-hide` — une classe que
// l'élément ne portait pas. Le retrait ne faisait rien : le bandeau et son bouton
// « Déverrouiller » ne s'affichaient JAMAIS. Une cartouche verrouillée s'ouvrait
// en lecture seule sans rien dire. Trouvé par Grégoire le 14 sept. 2026, à la
// porte terrain de #787.
//
// Vitest ne peut pas le voir : c'est une affaire de CSS, qui n'existe que dans un
// navigateur, contre le vrai index.html. D'où une spec, et une lecture du style
// CALCULÉ de l'élément lui-même (pas de ses ancêtres : la sous-section Cartouches
// n'est pas ouverte, et ce n'est pas le sujet).
//
// LES QUATRE CAS, ET CE QUE CHACUN VERROUILLE :
//   0. au démarrage, avant toute cartouche ouverte → masqué. C'est `u-hide` sur
//      la balise qui le porte depuis que `.hidden-my15-warning` ne masque plus ;
//   1. verrouillée → le bandeau et son bouton sont affichés (le défaut) ;
//   2. témoin : modifiable → le bandeau reste masqué. Sans lui, un bandeau
//      toujours affiché passerait le cas 1 ;
//   3. aller-retour : après une verrouillée, une modifiable le remasque.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

test('#863 · le bandeau de verrouillage suit l\'état de la cartouche ouverte', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        const attendre = (ms) => new Promise((res) => setTimeout(res, ms));
        const grille = { id: 'GR_863', nom: 'Grille du banc 863',
            criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }], dansBibliotheque: true };
        const cart = (id, verrouille) => ({
            id, nom: id, grilleId: 'GR_863', verrouille,
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrise' }],
            commentaires: { C1_M: 'Commentaire.' },
            dansBibliotheque: true
        });

        db.setSync('trimestres', [
            { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: true, archive: false }
        ]);
        db.setSync('trimestreActif', 'h2026');
        window.trimestreActif = 'h2026';
        db.setSync('h2026_grillesTemplates', [grille]);   // security-ok: objet `grille` littéral construit plus haut dans ce spec, aucune entrée externe.
        db.setSync(cleSource('cartouches_GR_863', 'h2026'), [cart('CART_MODIFIABLE', false), cart('CART_VERROUILLEE', true)]);   // security-ok: cartouches littérales du spec, clé calculée par `cleSource`, la fonction de routage de production.

        const affichage = (id) => {
            const el = document.getElementById(id);
            return el ? getComputedStyle(el).display : 'ABSENT';
        };

        // Avant toute cartouche ouverte : c'est la balise seule qui décide.
        const initial = affichage('alerteVerrouillage');

        await chargerCartouchePourModif('CART_MODIFIABLE', 'GR_863');
        await attendre(300);
        const modifiable = affichage('alerteVerrouillage');

        await chargerCartouchePourModif('CART_VERROUILLEE', 'GR_863');
        await attendre(300);
        const verrouillee = affichage('alerteVerrouillage');
        // Le style calculé d'un bouton ne vaut pas `none` quand son PARENT est
        // masqué : on remonte du bouton jusqu'au bandeau, le premier maillon
        // masqué est la réponse.
        let bouton = 'ABSENT';
        for (let el = document.getElementById('btnDeverrouillerCartouche'); el; el = el.parentElement) {
            if (getComputedStyle(el).display === 'none') { bouton = `masqué par ${el.id || el.className}`; break; }
            if (el.id === 'alerteVerrouillage') { bouton = 'affiché'; break; }
        }

        await chargerCartouchePourModif('CART_MODIFIABLE', 'GR_863');
        await attendre(300);
        const retour = affichage('alerteVerrouillage');

        return { initial, modifiable, verrouillee, bouton, retour };
    });

    console.log('BANDEAU 863 →', JSON.stringify(r));

    expect(r.verrouillee, 'cartouche verrouillée : le bandeau doit s\'afficher').not.toBe('none');
    expect(r.verrouillee).not.toBe('ABSENT');
    expect(r.bouton, 'cartouche verrouillée : le bouton « Déverrouiller » doit s\'afficher').toBe('affiché');
    expect(r.initial, 'avant toute cartouche ouverte, le bandeau est masqué (u-hide sur la balise)').toBe('none');
    expect(r.modifiable, 'témoin — cartouche modifiable : le bandeau reste masqué').toBe('none');
    expect(r.retour, 'après une verrouillée, une modifiable remasque le bandeau').toBe('none');
    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});
