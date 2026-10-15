import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const HOVER = lire('js/accompagnement-contenu-hover.js');
const POPUP = lire('js/accompagnement-contenu-popup.js');
const TERME = lire('js/accompagnement-contenu-terme.js');

// SENTINELLE — lot B de l'audit de conformité de l'Aide (10 sept. 2026).
//
// L'Aide vit sur QUATRE surfaces : la section Aide d'index.html, les popups, les
// infobulles et le glossaire. Les lots précédents n'avaient corrigé que la
// première ; les catalogues portaient encore leurs propres écarts.
//
// Ce banc verrouille ce que les infobulles CHIFFRENT, en lisant chaque valeur à
// sa source. Une infobulle qui chiffre sans source est le vrai risque : le popup
// et le glossaire, eux, nomment les zones sans les chiffrer, et ne peuvent donc
// pas mentir sur un seuil.

describe('Infobulles — les chiffres qu\'elles donnent sont ceux du code', () => {

    it('les zones de couleur du tableau de bord sont celles que l\'écran affiche', () => {
        // #818 (10 sept. 2026) — CE BANC SE COMPARAIT À LUI-MÊME. Il extrayait les
        // bornes des littéraux du rendu et vérifiait que l'infobulle les recopiait :
        // deux copies d'un même arrondi fait à la main, qu'il déclarait concordantes.
        // Or l'écran annonçait 50 et 80 là où les arrêts du dégradé tombent à 47,5 et
        // 82,5. Les libellés se CALCULENT désormais ; ce banc recalcule la même chose
        // depuis les DONNÉES lues à la source (les arrêts, les bornes de l'axe) et
        // confronte l'infobulle à ce résultat, pas au rendu.
        //
        // ⚠ Ces bornes ne classent rien : la barre est un dégradé continu et la
        // couleur d'un point est interpolée. Elles situent des changements de teinte.
        const tdb = lire('js/tableau-bord-apercu.js');

        const borneAxe = (nom) => {
            const m = tdb.match(new RegExp(`const ${nom} = ([0-9.]+);`));
            expect(m, `${nom} a disparu de tableau-bord-apercu.js`).toBeTruthy();
            return parseFloat(m[1]);
        };
        const axeMin = borneAxe('ECHELLE_DISTRIBUTION_MIN');
        const axeMax = borneAxe('ECHELLE_DISTRIBUTION_MAX');

        const positions = [...tdb.matchAll(/\{\s*position:\s*(\d+),\s*couleur:/g)].map((m) => parseInt(m[1], 10));
        expect(positions.length, 'ARRETS_DEGRADE ne porte plus quatre arrêts').toBe(4);

        // La même conversion que le module : position sur la barre → score.
        const pct = (pos) => String(Math.round((axeMin + (pos / 100) * (axeMax - axeMin)) * 1000) / 10).replace('.', ',');
        const attendus = positions.map((pos, i) =>
            i < positions.length - 1 ? `${pct(pos)}-${pct(positions[i + 1])}%` : `≥ ${pct(pos)}%`
        );

        // #821 (15 oct. 2026) : aucun mot sur le dégradé. L'écran DÉRIVE ses plages :
        // chaque bande appelle le calculateur, dans l'ordre.
        [0, 1, 2, 3].forEach((i) => {
            expect(tdb, `la plage ${i} recopie un libellé au lieu de le calculer`).toContain(`\${libelleBandeDistribution(${i})}`);
        });

        const bulle = HOVER.match(/'tdb-zones-couleur':\s*\n?\s*'((?:[^'\\]|\\.)*)'/);
        expect(bulle).toBeTruthy();
        for (const mot of ['Fragile', 'Modéré', 'Favorable']) {
            expect(bulle[1], `« ${mot} » est revenu dans l'infobulle des zones`).not.toContain(mot);
        }
        attendus.forEach((attendu, i) => {
            // les bornes calculées, avec l'espace fine de l'infobulle
            expect(
                bulle[1].replace(/\s%/g, '%'),
                `l'infobulle ne porte pas la borne calculée de la plage ${i} (attendu ${attendu})`
            ).toContain(attendu);
        });

        // Ces zones ne sont PAS configurables : l'infobulle ne doit pas le prétendre.
        expect(tdb).not.toContain('obtenirSeuil');
        expect(bulle[1]).not.toMatch(/configurable/i);
    });

    it('les défauts des seuils d\'interprétation sont ceux de preferences-v2.js', () => {
        const prefs = lire('js/preferences-v2.js');
        const defauts = ['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon'].map(id => {
            const m = prefs.match(new RegExp(`getElementById\\('${id}'\\)\\?\\.value\\)\\s*\\|\\|\\s*(\\d+)`));
            expect(m).toBeTruthy();
            return m[1];
        });
        const bulle = HOVER.match(/'depist-seuils-restaurer':\s*\n?\s*'((?:[^'\\]|\\.)*)'/);
        expect(bulle).toBeTruthy();
        expect(bulle[1]).toContain(defauts.join(' / ') + ' %');
    });
});

describe('Les catalogues ne contredisent pas ce que la section Aide a corrigé', () => {

    it('aucun catalogue ne réduit le portfolio aux « N meilleurs »', () => {
        // #803 : « N meilleurs » est UNE modalité de sélection, pas la règle des PAN.
        // Corrigé dans index.html ; l'infobulle cn-prod-type le disait encore.
        const bulle = HOVER.match(/'cn-prod-type':\s*\n?\s*'((?:[^'\\]|\\.)*)'/);
        expect(bulle).toBeTruthy();
        expect(bulle[1]).not.toMatch(/N meilleurs/);
    });

    it('aucun catalogue ne mentionne Primo, retiré le 21 avril 2026', () => {
        for (const [nom, src] of [['popup', POPUP], ['hover', HOVER], ['terme', TERME]]) {
            expect(src, `catalogue ${nom}`).not.toMatch(/Primo/);
        }
    });

    it('les chemins de navigation des catalogues existent', () => {
        const html = lire('index.html');
        const cfg = lire('js/config.js');
        const niveau1 = {};
        for (const m of html.matchAll(
            /data-onglet="([a-z-]+)"[^>]*>\s*(?:<[^>]*>\s*)*<span class="nav-label">([^<]+)<\/span>/g)) {
            niveau1[m[2].replace('&Eacute;', 'É').replace('&eacute;', 'é').trim()] = m[1];
        }
        niveau1['Réglages'] = 'reglages';
        const bloc = cfg.slice(cfg.indexOf('const configurationsOnglets'));
        const corps = bloc.slice(0, bloc.indexOf('\n};'));
        const sous = {};
        for (const m of corps.matchAll(/'([a-z-]+)':\s*\[([\s\S]*?)\]/g)) {
            sous[m[1]] = [...m[2].matchAll(/label:\s*["']([^"']+)["']/g)].map(x => x[1]);
        }

        const fautifs = [];
        for (const src of [POPUP, HOVER, TERME]) {
            for (const m of src.matchAll(
                /([A-ZÉÈÀ][\wéèêàçûôî'’]{2,14})\s*[→›]\s*([A-ZÉÈÀ][\wéèêàçûôî'’·]+(?:\s+[a-zéèêàç'’·A-ZÉ][\wéèêàçûôî'’·]*){0,3})/g)) {
                const [, onglet, sec] = m;
                if (onglet === 'Codex' || !(onglet in niveau1)) continue;
                const labels = sous[niveau1[onglet]] || [];
                if (!labels.some(l => sec === l || sec.startsWith(l) || l.startsWith(sec))) {
                    fautifs.push(`${onglet} → ${sec}`);
                }
            }
        }
        expect([...new Set(fautifs)]).toEqual([]);
    });
});
