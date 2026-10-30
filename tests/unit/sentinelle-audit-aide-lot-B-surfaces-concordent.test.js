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

    it('les barres du tableau de bord : aucun chiffre de repère, ni dessiné ni dans les bulles (bloc 6b, 15 oct. 2026)', () => {
        // #818 (10 sept.) faisait CALCULER les quatre repères (30-47,5 % … ≥ 82,5 %) au lieu de les
        // recopier. Le 15 oct., Grégoire les a retirés : « Je ne sais pas d'où viennent ces chiffres
        // […] Je préférerais ne pas les afficher, seulement les commentaires sur A et C. » Ce sont les
        // quarts de la barre (axe 30 → 100 %), rien de pédagogique. ↻ 30 oct. 2026 : les zones de couleur suivent les sources.
        const tdb = lire('js/tableau-bord-apercu.js');
        expect(tdb, 'la légende chiffrée est revenue').not.toMatch(/libelleBandeDistribution|const legendeUnique/);
        expect(tdb, 'la légende chiffrée est revenue').not.toContain('distribution-legende-commune');
        // Aucune géométrie écrite : le fond et les points lisent `zonesDeLaBarre` (contexte-qualification.js).
        expect((tdb.match(/\{\s*position:\s*(\d+),\s*couleur:/g) || []).length).toBe(0);
        expect(tdb).toContain('window.zonesDeLaBarre(type)');
        expect(HOVER, 'la bulle des quatre repères est revenue').not.toMatch(/'tdb-zones-couleur':/);
        const observer = HOVER.match(/'tdb-observer':\s*\n?\s*'((?:[^'\\]|\\.)*)'/);
        expect(observer).toBeTruthy();
        expect(observer[1], 'la bulle « Observer » donne un chiffre').not.toMatch(/\d/);
        // Elle parle avec les mots du profil, lus à leur source (contexte-qualification.js) : le premier et le dernier palier.
        const qualif = lire('js/contexte-qualification.js');
        const mots = (nom) => [...qualif.match(new RegExp(`const ${nom} = \\[([^\\]]+)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
        const [presence, remise] = [mots('MOTS_PRESENCE'), mots('MOTS_REMISE')];
        for (const mot of [presence[0], presence[presence.length - 1], remise[0], remise[remise.length - 1]]) {
            expect(observer[1], `« ${mot} » manque à la bulle`).toContain(`« ${mot} »`);
        }
    });

    it('les défauts des seuils d\'interprétation : une seule source, que preferences-v2.js lit et que la bulle ne recopie pas (30 oct. 2026)', () => {
        const prefs = lire('js/preferences-v2.js');
        for (const [id, cle] of [['v2-seuil-fragile', 'acceptable'], ['v2-seuil-acceptable', 'bon'], ['v2-seuil-bon', 'excellent']]) {
            expect(prefs, id).toMatch(new RegExp(`getElementById\\('${id}'\\)\\?\\.value\\)\\s*\\|\\|\\s*Math\\.round\\(defauts\\.interpretation\\.${cle} \\* 100\\)`));
        }
        const bulle = HOVER.match(/'depist-seuils-restaurer':\s*\n?\s*'((?:[^'\\]|\\.)*)'/);
        expect(bulle).toBeTruthy();
        expect(bulle[1]).not.toMatch(/\d/);
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
