import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// SENTINELLE #508 — LE BANDEAU INFORME, IL NE BLOQUE PAS.
//
// ⚠ LE NOM DE CE FICHIER DIT SON ORIGINE, PAS SON SUJET. L'invariant est né avec
// l'avis daté de #508 ; il ne lui appartient pas. Le 31 août 2026, #639 a retiré
// cet avis, et ce fichier a rougi sur « bandeau non affiché » — il tirait son
// bandeau de `TRANSITIONS[0]`, qui n'était plus le même et n'était plus ciblé sur
// l'accueil. Il a donc été RELOGÉ sur un JALON de parcours (Suivi, seed démo).
// ⮕ La leçon, et c'est elle qu'il faut retenir : l'invariant vaut pour TOUT
// bandeau `.transition-bandeau`, pas pour un avis. Le rattacher à une entrée
// précise du tableau était la fragilité, pas le retrait de cette entrée.
//
// CE QUI EST ARRIVÉ, ET QU'AUCUN TEST NE VOYAIT. Le bandeau est posé
// en `position: fixed` au BAS de l'écran, centré sur 600 px, `z-index: 950`. Il
// recouvre donc la zone de travail — et, tant qu'il captait les clics, tout ce
// qui se trouvait dessous était INATTEIGNABLE : un nœud de carte mentale, un
// bouton, n'importe quoi.
//
// Le symptôme est apparu le 28 août 2026 sur une spec qui ne parle pas du tout
// de bandeaux : `planif-alignement › un bloc glissé près d'un autre COLLE`. Le
// `mouse.down()` du glisser atterrissait sur le bandeau, le bloc ne bougeait pas
// d'un pixel, et le test lisait « aimantation » là où il n'y avait qu'un clic
// avalé. Mesuré en worktrees jetables : verte à `fbeffdad`, rouge à `f41c6118`
// (#508), verte de nouveau une fois l'avis éteint.
//
// ⮕ CE QUE CE FICHIER VERROUILLE, et que la spec d'alignement ne dit PAS : elle
// rougirait aussi pour dix autres raisons (aimantation, drag, guides). Ici, on
// prouve l'invariant lui-même — les clics traversent le bandeau, SAUF sur ses
// éléments interactifs.
//
// Correctif tenu : `pointer-events: none` sur `.transition-bandeau`, `auto` sur
// `.transition-bandeau-fermer` (`styles.css`). Retirer l'un ou l'autre fait
// rougir ce fichier — vérifié par break-test.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
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
}

test('#508 — les clics traversent le bandeau, sauf sur son bouton', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Afficher un bandeau, puis poser un TÉMOIN juste dessous : un élément qui
    // occupe la même zone, avec un z-index inférieur. C'est le rôle que tenait,
    // sans le savoir, le nœud de carte mentale de `planif-alignement`.
    const mesures = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        if (!window.transitions || typeof window.transitions.fermerBandeau !== 'function') {
            return { erreur: 'window.transitions absent' };
        }
        const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

        // Seed démo : groupe-cours actif + évaluations enregistrées → les
        // conditions des jalons sont remplies, et le Suivi en montre un.
        await window.activerModeDemo();
        ['transition_num_crois_vue', 'transition_crois_obs_vue', 'transition_obs_comp_vue']
            .forEach((p) => window.definirPreference(p + '_demo', false));

        window.transitions.fermerBandeau();
        window.afficherSection('suivi');
        await attendre(900);

        const bandeau = document.getElementById('transition-bandeau');
        if (!bandeau) return { erreur: 'bandeau non affiché' };
        const r = bandeau.getBoundingClientRect();

        const temoin = document.createElement('div');
        temoin.id = 'temoin-sous-bandeau';
        temoin.style.cssText = 'position:fixed; z-index:940; background:transparent;'
            + `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px;`;
        temoin.dataset.clics = '0';
        temoin.addEventListener('click', () => {
            temoin.dataset.clics = String(Number(temoin.dataset.clics) + 1);
        });
        document.body.appendChild(temoin);

        // Le point de test : le CENTRE du bandeau, là où il n'y a que du fond.
        const cx = Math.round(r.left + r.width / 2);
        const cy = Math.round(r.top + r.height / 2);
        const sousLeCentre = document.elementFromPoint(cx, cy);

        // Et le bouton de fermeture, qui DOIT rester atteignable.
        const btn = bandeau.querySelector('.transition-bandeau-fermer');
        const rb = btn.getBoundingClientRect();
        const surLeBouton = document.elementFromPoint(
            Math.round(rb.left + rb.width / 2),
            Math.round(rb.top + rb.height / 2)
        );

        return {
            centre: { x: cx, y: cy },
            bouton: { x: Math.round(rb.left + rb.width / 2), y: Math.round(rb.top + rb.height / 2) },
            idSousLeCentre: sousLeCentre ? sousLeCentre.id : null,
            centreEstDansLeBandeau: !!(sousLeCentre && bandeau.contains(sousLeCentre)),
            boutonEstLeBouton: surLeBouton === btn || btn.contains(surLeBouton)
        };
    });

    expect(mesures.erreur, 'montage : ' + JSON.stringify(mesures)).toBeUndefined();

    // 1. Au centre du bandeau, c'est le TÉMOIN qu'on touche — pas le bandeau.
    //    C'est l'invariant : le bandeau ne s'interpose pas.
    expect(mesures.centreEstDansLeBandeau,
        'le bandeau capte encore les clics en son centre — tout ce qui est dessous '
        + 'est inatteignable (diagnostic : ' + JSON.stringify(mesures) + ')'
    ).toBe(false);
    expect(mesures.idSousLeCentre).toBe('temoin-sous-bandeau');

    // 2. Le bouton de fermeture, LUI, reste atteignable — sinon le bandeau serait
    //    informatif et infermable.
    expect(mesures.boutonEstLeBouton,
        'le bouton de fermeture n\'est plus atteignable : `pointer-events: auto` a sauté'
    ).toBe(true);

    // 3. Preuve par un VRAI clic, pas seulement par elementFromPoint : le témoin
    //    reçoit l'événement à travers le bandeau.
    await page.mouse.click(mesures.centre.x, mesures.centre.y);
    const clicsRecus = await page.evaluate(
        () => Number(document.getElementById('temoin-sous-bandeau').dataset.clics));
    expect(clicsRecus, 'un clic au centre du bandeau n\'a pas atteint l\'élément dessous').toBe(1);

    // 4. Et le clic sur le bouton ferme bien le bandeau.
    await page.mouse.click(mesures.bouton.x, mesures.bouton.y);
    await page.waitForTimeout(600);
    const restant = await page.evaluate(() => !!document.getElementById('transition-bandeau'));
    expect(restant, 'le bouton ne ferme plus le bandeau').toBe(false);

    expect(erreurs, 'erreurs console/page : ' + erreurs.join(' | ')).toEqual([]);
});
