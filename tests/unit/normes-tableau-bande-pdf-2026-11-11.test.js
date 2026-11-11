/**
 * LES NORMES DU TABLEAU DE NOTATION DANS LA BANDE DU PDF (11 nov. 2026, décision de Grégoire, 7 h 33 à 7 h 48).
 *
 * La bande « PROGRESSION · TRIMESTRE » de la page de synthèse (`renderTrimestreBar`, synthese-retroaction-rendu.js) lit la
 * norme que `construireTrimestre` tire de `TableauNotation.normeDeLEleve` (`t.forme`, `t.libelle`, `t.couleur`) :
 *   plein   → fond à la couleur du niveau ; contour → papier blanc, bordure à la couleur du niveau ;
 *   vide    → pointillé, le numéro (à saisir ou à venir) ; ✓ et ✗ en spécifications.
 * La double bordure noire des « retenues » est partie ; ▼ (production courante) et ● (obligatoire) restent.
 * La source elle-même (le profil et la bande la lisent là où le tableau la lit) : tests/integration/tableau-de-notation-1.spec.js.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const echapperHtml = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const win = {};
chargerScript('js/synthese-retroaction-rendu.js', {
    echapperHtml, formaterNotePourcentage: (n) => `${n} %`, formaterNombre: String, formaterPourcentage: (n) => `${n} %`, formaterPoints: String,
    document: { createElement: () => ({ style: {} }) }
}, win);
const { rendreSyntheseHTML } = win.syntheseRetroactionRendu;

const VERT = '#2e7d4f', JAUNE = '#d9a514';
/** Les cases de la bande, dans l'ordre : le style du carré 22 × 22 et ce qu'il porte. */
function cases(trimestre) {
    const html = rendreSyntheseHTML({ course: {}, artefact: {}, student: {}, criteria: [], scale: [{ code: 'M', color: VERT }, { code: 'D', color: JAUNE }], trimestre });
    const bande = tranche(html, 'PROGRESSION · TRIMESTRE');   // jette si la bande manque
    // Le contour porte, dedans, sa bordure à l'encre (11 nov. 2026, 9 h 08) : le contenu est alors dans ce cadre intérieur.
    return [...bande.matchAll(/<div style="box-sizing: border-box; width: 22px; height: 22px;([^"]*)">(?:<div style="([^"]*)">)?([^<]*)(?:<\/div>)?<\/div>/g)]
        .map((m) => ({ style: m[1], interieur: m[2] || null, contenu: m[3] }));
}
/** La bande seule, rendue (pour la légende). */
function bande(trimestre) {
    const html = rendreSyntheseHTML({ course: {}, artefact: {}, student: {}, criteria: [], scale: [{ code: 'M', color: VERT }, { code: 'D', color: JAUNE }], trimestre });
    return tranche(html, 'PROGRESSION · TRIMESTRE');
}
const t = (o) => Object.assign({ n: 1, status: 'done', code: null, obligatoire: false, due: null }, o);

describe('la bande du PDF suit la norme du tableau', () => {
    it('standards : plein (compte dans la note), contour (évaluée, non retenue), pointillé (à saisir, à venir)', () => {
        const [plein, contour, aSaisir, aVenir] = cases([
            t({ n: 1, code: 'M', forme: 'plein', libelle: 'M', couleur: VERT }),
            t({ n: 2, code: 'D', forme: 'contour', libelle: 'D', couleur: JAUNE }),
            t({ n: 3, status: 'done', code: null, forme: 'vide', libelle: '', couleur: null }),
            t({ n: 4, status: 'todo', forme: 'vide', libelle: '', couleur: null })
        ]);
        expect(plein.style).toContain(`background: ${VERT}`);
        expect(plein.style).toContain(`border: 1px solid ${VERT}`);
        expect(plein.contenu).toBe('M');
        expect(contour.style).toContain('background: #ffffff');
        expect(contour.style).toContain(`border: 2px solid ${JAUNE}`);
        expect(contour.style).toContain('color: #141414');
        expect(contour.contenu).toBe('D');
        for (const c of [aSaisir, aVenir]) {
            expect(c.style).toContain('background: transparent');
            expect(c.style).toMatch(/border: 1px dashed #e3e0d8/);
        }
        expect(aVenir.contenu).toBe('4');
    });

    it('spécifications : ✓ et ✗, pleins quand ils comptent', () => {
        const [ok, non] = cases([
            t({ n: 1, forme: 'plein', libelle: '✓', couleur: '#34c759' }),
            t({ n: 2, forme: 'plein', libelle: '✗', couleur: '#a02030' })
        ]);
        expect(ok.contenu).toBe('✓');
        expect(ok.style).toContain('background: #34c759');
        expect(ok.style).toContain('color: #141414');   // l'encre sur le vert clair (texteSur)
        expect(non.contenu).toBe('✗');
        expect(non.style).toContain('color: #ffffff');   // le papier sur le rouge foncé
    });

    it('la double bordure noire des « retenues » est partie ; ▼ et ● restent', () => {
        const html = rendreSyntheseHTML({ course: {}, artefact: {}, student: {}, criteria: [], scale: [], trimestre: [
            t({ n: 1, status: 'current', code: 'M', forme: 'plein', libelle: 'M', couleur: VERT, retenu: true }),
            t({ n: 2, obligatoire: true, forme: 'contour', libelle: 'D', couleur: JAUNE })] });
        expect(html).not.toContain('double');
        expect(html).toContain('&#x25BC;');
        expect(html).toContain('●');
    });

    it('la couleur d\'un niveau est celle de l\'échelle imprimée sur la page ; hors d\'elle, celle de la norme, si c\'en est une', () => {
        const [page, horsEchelle, illisible] = cases([
            t({ code: 'M', forme: 'plein', libelle: 'M', couleur: '#6aacb8' }),     // l'échelle de la page dit VERT pour M
            t({ code: 'X', forme: 'plein', libelle: 'X', couleur: '#6aacb8' }),     // X n'est pas dans l'échelle de la page
            t({ code: 'Y', forme: 'plein', libelle: 'Y', couleur: 'red;background:url(x)' })
        ]);
        expect(page.style).toContain(`background: ${VERT}`);
        expect(horsEchelle.style).toContain('background: #6aacb8');
        expect(illisible.style).toContain('background: #767169');   // MUTED : rien d'illisible n'entre dans le style
        expect(illisible.style).not.toContain('url(');
    });

    it('hors standards et spécifications (aucune forme) : la bande d\'avant, toute case évaluée pleine', () => {
        const [faite, aFaire] = cases([t({ n: 1, code: 'M' }), t({ n: 2, status: 'todo' })]);
        expect(faite.style).toContain(`background: ${VERT}`);
        expect(faite.contenu).toBe('M');
        expect(aFaire.style).toContain('dashed');
    });
});

// 11 nov. 2026, relais du Projet de 9 h 08 : la légende (mots de Grégoire, 9 h 05), l'encre du contour (le papier en gris).
describe('la légende de la bande et le contour sur papier', () => {
    const LEGENDE_STD = ['Plein : compte dans ta note', 'Contour : évaluée, non retenue', 'Pointillé : à venir'];
    const LEGENDE_SPE = ['✓ Acceptable', '✗ Non acceptable', 'Pointillé : à venir'];
    const lignes = (html) => {
        const m = /data-legende-de-la-bande=""[^>]*>(.*?)<\/div><\/div>/s.exec(html);
        return m ? [...(m[1] + '</div>').matchAll(/<div>([^<]*)<\/div>/g)].map((x) => x[1]) : null;
    };

    it('standards : la légende, mot pour mot, sous les cases', () => {
        const b = bande([t({ famille: 'STD', forme: 'plein', libelle: 'M', couleur: VERT }), t({ n: 2, status: 'todo', famille: 'STD', forme: 'vide' })]);
        expect(lignes(b)).toEqual(LEGENDE_STD);
        expect(b.indexOf('data-legende-de-la-bande')).toBeGreaterThan(b.indexOf('width: 22px'));
    });

    it('spécifications : ✓, ✗, pointillé', () => {
        expect(lignes(bande([t({ famille: 'SPE', forme: 'plein', libelle: '✓', couleur: '#34c759' })]))).toEqual(LEGENDE_SPE);
    });

    it('hors norme (aucune famille) : aucune légende, rien ne change', () => {
        expect(bande([t({ code: 'M' }), t({ n: 2, status: 'todo' })])).not.toContain('data-legende-de-la-bande');
    });

    it('le contour porte, dedans, une fine bordure à l\'encre ; le plein et le pointillé non', () => {
        const [plein, contour, vide] = cases([
            t({ famille: 'STD', forme: 'plein', libelle: 'D', couleur: JAUNE }),
            t({ n: 2, famille: 'STD', forme: 'contour', libelle: 'D', couleur: JAUNE }),
            t({ n: 3, status: 'todo', famille: 'STD', forme: 'vide' })
        ]);
        expect(contour.interieur).toContain('border: 1px solid #141414');
        expect(contour.contenu).toBe('D');
        expect(contour.style).toContain(`border: 2px solid ${JAUNE}`);
        expect(plein.interieur).toBeNull();
        expect(vide.interieur).toBeNull();
    });
});

