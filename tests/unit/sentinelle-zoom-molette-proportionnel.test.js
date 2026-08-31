import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Sentinelle — LE ZOOM MOLETTE/TRACKPAD SUIT L'AMPLITUDE DU GESTE.
//
// Le fil : Grégoire signale un zoom « très saccadé » au trackpad dans la page
// annoter/évaluer (Chrome/macOS, 31 août 2026). Trois sondes en console ont
// mesuré, dans cet ordre :
//   · le pincement produit 183 événements `wheel` en ~6 s, dont 70 avec
//     `ctrlKey`, |deltaY| médian 0,80 — zéro `gesture`, zéro `touch`,
//     `visualViewport.scale` inchangé : c'est bien le chemin `wheel` ;
//   · un pincement de 834 ms emmenait le zoom de 50 % à 227 %, soit x4,5.
//
// ⚠ La première hypothèse — des re-rendus en rafale pendant le geste — a été
// RÉFUTÉE par la mesure : un seul écart supérieur à 100 ms sur tout le geste.
// Ce n'est pas le coût du rendu, c'est la LOI DU PAS.
//
// Trois défauts, un par cas ci-dessous :
//   Z1 — `facteur = e.deltaY > 0 ? 0.97 : 1.03` ignorait l'amplitude. Un pas
//        fixe par événement fait courir le zoom à la CADENCE du trackpad
//        (~60 Hz) au lieu de l'AMPLITUDE des doigts.
//   Z2 — ce même ternaire n'a que deux branches pour une grandeur qui a trois
//        états : négatif, positif, NUL. Le nul (mesuré : |deltaY| min = 0)
//        tombait dans « zoom avant » par défaut d'écriture, pas par décision.
//   Z3 — le chemin `wheel` n'avait AUCUN aperçu pendant le geste, alors que le
//        pincement Safari applique un `transform` CSS. Rien ne bougeait à
//        l'écran, puis le document sautait d'un bloc : la saccade.
//
// ⚠ Ce que cette sentinelle NE tient PAS, exprès : la valeur de
// `ZOOM_SENSIBILITE_MOLETTE`. Elle est calée sur le ressenti de Grégoire et
// doit pouvoir bouger sans casser un test. Tous les cas ci-dessous sont
// RELATIFS — ils verrouillent la loi, pas le réglage.

/* ------------------------------------------------------------------ harnais */

function fabriquerConteneur() {
    const handlers = {};
    const wrapper = {
        style: {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
    };
    return {
        _handlers: handlers,
        _wrapper: wrapper,
        addEventListener: (type, fn) => { (handlers[type] = handlers[type] || []).push(fn); },
        removeEventListener: () => {},
        querySelector: (sel) => (sel === '.travaux-canvas-wrapper' ? wrapper : null),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        scrollLeft: 0, scrollTop: 0, clientWidth: 800, clientHeight: 600
    };
}

async function monterVisionneuse() {
    const fauxWindow = {
        addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {},
        scrollX: 0, scrollY: 0
    };
    const w = chargerScript('js/travaux-visionneuse.js', {
        requestAnimationFrame: () => {},
        getComputedStyle: () => ({ marginLeft: '0px', marginTop: '0px' })
    }, fauxWindow);

    const v = w.travauxVisionneuse;
    // Poser `fichierActuel` sans ouvrir de vrai document : un typeMIME qui
    // n'est ni PDF ni image traverse `ouvrirDepuisBlob` sans rien décoder.
    // C'est le seul chemin public qui arme la garde `if (!fichierActuel)`.
    await v.ouvrirDepuisBlob(null, { id: 'test', typeMIME: 'application/octet-stream', nomFichier: 't' });

    const conteneur = fabriquerConteneur();
    v.configurerGestesZoom(conteneur);
    const surMolette = conteneur._handlers.wheel[0];
    return { v, conteneur, surMolette };
}

/**
 * Source de la visionneuse, commentaires RETIRÉS. Sans ce filtrage, une
 * assertion d'absence se déclenche sur le commentaire qui EXPLIQUE le défaut
 * — et une assertion de présence peut être satisfaite par une note qui cite
 * le code sans que le code existe.
 */
function lireSourceSansCommentaires() {
    const chemin = path.join(racineProjet, 'js', 'travaux-visionneuse.js');
    return readFileSync(chemin, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function evenementMolette(deltaY) {
    return {
        deltaY, ctrlKey: true, metaKey: false,
        clientX: 400, clientY: 300,
        preventDefault: () => {}
    };
}

/** Ratio d'aperçu réellement posé sur le wrapper, ou null si aucun. */
function ratioApercu(conteneur) {
    const t = conteneur._wrapper.style.transform;
    if (!t) return null;
    const m = /scale\(([-0-9.e]+)\)/.exec(t);
    return m ? parseFloat(m[1]) : null;
}

function pincer(surMolette, deltaY, nombre) {
    for (let i = 0; i < nombre; i++) surMolette(evenementMolette(deltaY));
}

/* -------------------------------------------------------------------- cas */

describe('Zoom molette/trackpad — la loi du pas', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('Z1 — le facteur suit l\'AMPLITUDE du geste, pas le nombre d\'événements', async () => {
        const doux = await monterVisionneuse();
        pincer(doux.surMolette, -0.8, 30);
        const ratioDoux = ratioApercu(doux.conteneur);

        const franc = await monterVisionneuse();
        pincer(franc.surMolette, -3.2, 30);
        const ratioFranc = ratioApercu(franc.conteneur);

        // Le témoin : à NOMBRE D'ÉVÉNEMENTS ÉGAL, une amplitude quatre fois
        // plus grande doit zoomer nettement plus. Un pas fixe rendrait les
        // deux ratios identiques — c'est la mutation que ce cas tue.
        expect(ratioDoux).toBeGreaterThan(1);
        expect(ratioFranc).toBeGreaterThan(ratioDoux * 1.5);
    });

    it('Z2 — un deltaY NUL ne zoome pas', async () => {
        const { surMolette, conteneur, v } = await monterVisionneuse();
        const zoomAvant = v.getZoomActuel();

        pincer(surMolette, 0, 30);

        // Ni aperçu posé, ni zoom modifié. L'ancien ternaire versait ces
        // trente événements dans la branche « zoom avant » : le zoom
        // avançait de 2,4x sur un geste rigoureusement immobile.
        expect(ratioApercu(conteneur)).toBeNull();
        expect(v.getZoomActuel()).toBe(zoomAvant);
    });

    it('Z3 — l\'aperçu bouge PENDANT le geste, sans toucher le zoom rendu', async () => {
        const { surMolette, conteneur, v } = await monterVisionneuse();
        const zoomRendu = v.getZoomActuel();

        pincer(surMolette, -0.8, 10);

        // L'aperçu existe déjà (c'est lui qui supprime la saccade)...
        expect(ratioApercu(conteneur)).toBeGreaterThan(1);
        // ...et `zoomActuel` n'a PAS bougé : le canvas rendu lui correspond
        // toujours, la réconciliation appartient à la finalisation seule.
        expect(v.getZoomActuel()).toBe(zoomRendu);
    });

    it('Z4 — un cran de molette de souris reste borné', async () => {
        const { surMolette, conteneur } = await monterVisionneuse();

        // Une molette de souris envoie des deltaY de l'ordre de 100 ; sans
        // plafond, un seul cran multiplierait le zoom par douze.
        surMolette(evenementMolette(-100));

        expect(ratioApercu(conteneur)).toBeLessThanOrEqual(1.25);
        expect(ratioApercu(conteneur)).toBeGreaterThan(1);
    });

    it('Z6 — le recalage MESURE la position du canvas, il ne la deduit pas des marges', () => {
        // Ce cas est STATIQUE, et c'est assume : le recalage dépend du layout
        // réel (`getBoundingClientRect`), que le bac à sable de Vitest ne
        // calcule pas. Ce qu'il tient est la RÈGLE D'ÉCRITURE, pas l'effet.
        //
        // MESURE du 31 août 2026 qui a fondé la règle : le conteneur porte
        // `justify-content: center`, et le centrage absorbe une part de la marge
        // de départ — part qui dépend de la TAILLE DU CONTENU, donc qui change à
        // chaque zoom. Le code déduisait l'origine du canvas de `margin-left`
        // (810 px) alors que le canvas commençait à 222 : 588 px d'erreur en X,
        // croissante avec l'ampleur du zoom. Une correction de mai (99.30) avait
        // déjà vu que la marge ne scale pas ; elle n'avait pas vu que la marge
        // n'est pas l'origine. Sans ce cas, la même conclusion peut se reprendre.
        const source = lireSourceSansCommentaires();

        // La déduction par les marges ne doit pas revenir.
        expect(source).not.toMatch(/getMarginWrapper/);
        expect(source).not.toMatch(/marginLeft/);
        expect(source).not.toMatch(/marginTop/);

        // Et la mesure doit rester : l'origine du canvas se lit sur le canvas.
        expect(source).toMatch(/canvasDocument\.getBoundingClientRect\(\)/);
    });

    it('Z5 — les bornes tiennent quelle que soit la durée du geste', async () => {
        const avant = await monterVisionneuse();
        pincer(avant.surMolette, -5, 200);
        expect(ratioApercu(avant.conteneur)).toBeLessThanOrEqual(4.0);

        const arriere = await monterVisionneuse();
        pincer(arriere.surMolette, 5, 200);
        expect(ratioApercu(arriere.conteneur)).toBeGreaterThanOrEqual(0.25);
    });
});
