import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const cfg = readFileSync(path.join(racine, 'js/config.js'), 'utf8');

// SENTINELLE — lot A de l'audit de conformité de l'Aide (10 sept. 2026).
// L'Aide nommait des onglets, des chemins et des boutons qui n'existaient plus
// sous ce nom. Six écarts mesurés, tous corrigés :
//   · « Réglages → Captures de progression »  → c'est un <h4> DANS Réglages › Données
//   · « Évaluations → » (8×)                  → l'onglet s'appelle « Évaluation »
//   · « Générer le calendrier complet »       → le bouton s'appelle « Régénérer »
//   · « Exporter mes données »                → « Exporter le Codex »
//   · « Activer RàI et détection des patterns » → « Appliquer une adaptation… »
//   · « Reconstruire les snapshots historiques » → « Recalculer les captures »
//
// Le banc CALCULE les deux côtés au lieu de recopier une liste : c'est ce qui
// fait qu'un onglet renommé demain rougit ici plutôt que de dériver en silence.

const DEB = html.indexOf('id="section-aide"');
const FIN = html.indexOf('fin section-aide');
if (DEB === -1 || FIN === -1) throw new Error('bornes de la section Aide introuvables');

const AIDE = html.slice(DEB, FIN);
const AIDE_TXT = AIDE.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const INTERFACE = (html.slice(0, DEB) + html.slice(FIN)).replace(/\s+/g, ' ');

describe('Aide — les chemins de navigation qu\'elle cite existent', () => {

    it('chaque « Onglet → Sous-section » cité correspond à la structure réelle', () => {
        // 1er niveau : les libellés de la barre de navigation
        const niveau1 = {};
        for (const m of html.matchAll(
            /data-onglet="([a-z-]+)"[^>]*>\s*(?:<[^>]*>\s*)*<span class="nav-label">([^<]+)<\/span>/g)) {
            niveau1[decodeEntites(m[2].trim())] = m[1];
        }
        niveau1['Réglages'] = 'reglages';
        niveau1['Aide'] = 'aide';
        expect(Object.keys(niveau1).length).toBeGreaterThanOrEqual(6);

        // 2e niveau : configurationsOnglets de config.js
        const bloc = cfg.slice(cfg.indexOf('const configurationsOnglets'));
        const corps = bloc.slice(0, bloc.indexOf('\n};'));
        const sousSections = {};
        for (const m of corps.matchAll(/'([a-z-]+)':\s*\[([\s\S]*?)\]/g)) {
            sousSections[m[1]] = [...m[2].matchAll(/label:\s*["']([^"']+)["']/g)].map(x => x[1]);
        }

        // Les chemins cités par l'Aide, hors « Codex → … » (menu, pas onglet).
        const fautifs = [];
        for (const m of AIDE_TXT.matchAll(
            /([A-ZÉÈÀ][\wéèêàçûôî'’]{2,14})\s*→\s*([A-ZÉÈÀ][\wéèêàçûôî'’·]+(?:\s+[a-zéèêàç'’·A-ZÉ][\wéèêàçûôî'’·]*){0,3})/g)) {
            const [, onglet, sous] = m;
            if (onglet === 'Codex') continue;          // menu du Codex, pas la nav
            if (!(onglet in niveau1)) continue;         // pas un onglet : hors sujet
            const labels = sousSections[niveau1[onglet]] || [];
            if (!labels.some(l => sous === l || sous.startsWith(l) || l.startsWith(sous))) {
                fautifs.push(`${onglet} → ${sous}`);
            }
        }
        expect(fautifs).toEqual([]);
    });

    it('l\'Aide nomme l\'onglet « Évaluation », comme la barre de navigation', () => {
        const nav = html.match(/data-onglet="evaluations"[\s\S]{0,200}?nav-label">([^<]+)</);
        expect(nav).toBeTruthy();
        expect(decodeEntites(nav[1])).toBe('Évaluation');
        expect(AIDE_TXT).not.toMatch(/Évaluations\s*→/);
    });
});

describe('Aide — les boutons qu\'elle dit de cliquer existent', () => {
    // Chaque libellé cité à l'impératif doit se retrouver TEL QUEL dans
    // l'interface (index.html hors Aide).
    // ↻ #1152, lot 1 (audit de l'Aide du 24 oct. 2026, lot-6-reference.md, constat 2) : « Régénérer » sort de cette
    // liste. Le banc le trouvait dans l'interface grâce au bouton de la RÉTROACTION, alors que l'Aide l'envoie au
    // CALENDRIER : un faux vert. Le test qui suit dit ce qui est.
    const boutons = [
        'Mettre à jour le codex',       // lot I bis (D9) : remplace le bouton de l'ancien fichier de secours, retiré
        'Recalculer les captures',
        "Appliquer une adaptation du modèle de la Réponse à l'intervention",
    ];

    for (const libelle of boutons) {
        it(`« ${libelle} » existe dans l'interface`, () => {
            expect(INTERFACE).toContain(libelle);
            expect(AIDE_TXT).toContain(libelle);
        });
    }

    it('« Régénérer » : le seul bouton de ce nom refait la rétroaction ; l\'Aide ne l\'envoie plus au calendrier', () => {
        const boutonsRegenerer = [...INTERFACE.matchAll(/<button\b[^>]*>\s*Régénérer\s*<\/button>/g)].map((m) => m[0]);
        expect(boutonsRegenerer).toHaveLength(1);
        expect(boutonsRegenerer[0]).toContain('data-action="regenererRetroactionAvecFeedback"');
        // Aucune autre surface de l'interface ne nomme « Régénérer le calendrier ».
        expect(INTERFACE).not.toContain('Régénérer le calendrier');
        // ↻ #1152, lot 2d (28 oct. 2026) : les deux mentions fausses, dans `problemes` et `faq`, sont réécrites (audit du
        // 24 oct., lot-6-reference.md, `problemes` : « deux des quatre solutions renvoient à un bouton qui n'existe pas » ;
        // verdict final de `faq` ; consigne CONSIGNE-LOT-2026-10-28-aide-lot-2d-labo-codex-reference.md, §2, entrées 11
        // et 12) : le calendrier se construit à partir des trois dates du Cadre. Le compte tombe à 0 ; une mention qui
        // reviendrait rougit ici.
        const entrees = [...AIDE.matchAll(/id="accordeon-aide-([a-z0-9-]+)"/g)].map((m) => m[1]);
        const parEntree = entrees.map((id, k) => {
            const debut = AIDE.indexOf(`id="accordeon-aide-${id}"`);
            const fin = k + 1 < entrees.length ? AIDE.indexOf(`id="accordeon-aide-${entrees[k + 1]}"`) : AIDE.length;
            return [id, (AIDE.slice(debut, fin).match(/Régénérer/g) || []).length];
        }).filter(([, n]) => n > 0);
        expect(Object.fromEntries(parEntree)).toEqual({});
    });

    it('les libellés périmés ont disparu de l\'Aide', () => {
        for (const perime of ['Générer le calendrier complet', 'Exporter mes données', 'Exporter le Codex',
                              'Faire une copie de secours',   // lot I bis (D9) : le bouton est retiré
                              'Reconstruire les snapshots historiques',
                              'Activer RàI et détection des patterns']) {
            expect(AIDE_TXT).not.toContain(perime);
        }
    });
});

describe('Aide — elle ne décrit pas de fonctionnalité retirée', () => {

    it('Primo ne revient pas : retiré du code le 21 avril 2026 (cfee0157)', () => {
        // ~5700 lignes de primo-* supprimées. L'Aide a continué de décrire un
        // assistant conversationnel pendant cinq mois : 19 mentions, dont une
        // carte de 78 lignes détaillant « les 4 modules de Primo ».
        // Le texte rendu ne doit plus le nommer ; les commentaires de code, qui
        // documentent ce retrait, ne comptent pas.
        const rendu = AIDE.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ');
        expect(rendu).not.toMatch(/Primo/);
    });

    it('la carte de prise en main nomme les trois outils qui existent VRAIMENT', () => {
        const i = AIDE.indexOf('accordeon-aide-prise-en-main');
        expect(i).toBeGreaterThan(-1);
        const carte = AIDE.slice(i, AIDE.indexOf('accordeon-aide-', i + 30));

        // « Données démo » et « Assistance » sont les libellés que génère accueil.js.
        const accueil = readFileSync(path.join(racine, 'js/accueil.js'), 'utf8');
        for (const libelle of ['Données démo', 'Assistance']) {
            const echappe = JSON.stringify(libelle).slice(1, -1)
                .replace(/é/g, '\\u00e9').replace(/É/g, '\\u00c9');
            expect(accueil.includes(libelle) || accueil.includes(echappe)).toBe(true);
            expect(carte).toContain(libelle);
        }
        // La visite guidée est le bouton data-param="tour-guide" de l'en-tête.
        expect(INTERFACE).toContain('data-param="tour-guide"');
        expect(carte).toContain('Visite guidée');
    });
});

describe('Aide — les chiffres qu\'elle cite sont ceux du code', () => {

    // Le pack de démo est la source : les nombres sont COMPTÉS ici, jamais
    // recopiés. Ajouter un artefact au pack rougit ce banc.
    function packDemo() {
        const src = readFileSync(path.join(racine, 'js/pack-demo-10.js'), 'utf8');
        const bloc = (cle, ouvre, ferme) => {
            const i = src.indexOf(`"${cle}": ${ouvre}`) + `"${cle}": `.length;
            let prof = 0, j = i, dansChaine = false;
            for (; j < src.length; j++) {
                const c = src[j];
                if (c === '"' && src[j - 1] !== '\\') dansChaine = !dansChaine;
                else if (!dansChaine) {
                    if (c === ouvre) prof++;
                    else if (c === ferme && --prof === 0) return JSON.parse(src.slice(i, j + 1));
                }
            }
            throw new Error(`bloc « ${cle} » illisible dans pack-demo-10.js`);
        };
        return {
            productions: bloc('productions', '[', ']'),
            grilles:     bloc('grillesTemplates', '[', ']'),
            echelles:    bloc('echellesTemplates', '[', ']'),
            presences:   bloc('presences', '{', '}'),
            // DA UNIQUES : chaque élève apparaît dans les présences, les
            // évaluations et le groupe — compter les occurrences donnerait 627.
            etudiants:   new Set(src.match(/DEMO\d{3}/g) || []).size,
        };
    }

    // L'Aide mêle texte brut et entités (« 10 &eacute;tudiant·es ») : on décode
    // avant de comparer, sinon le banc rougit sur la forme et non sur le fond.
    const AIDE_DECODEE = AIDE_TXT
        .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à')
        .replace(/&ccedil;/g, 'ç').replace(/&Eacute;/g, 'É').replace(/&middot;/g, '·');

    it('le décompte des données de démonstration correspond au pack', () => {
        const pack = packDemo();
        const artefacts = pack.productions.filter(p => p.type === 'artefact-portfolio').length;
        const dates = Object.keys(pack.presences).length;

        // ⚠ Ancré sur LA phrase du décompte, pas sur le nombre seul : « 9 artefacts »
        // apparaît aussi dans l'exemple de l'indice C (« Étudiant avec 9 artefacts »),
        // et un toContain() large passait donc même quand le décompte était faux.
        const portfolios = pack.productions.filter(p => p.type === 'portfolio').length;
        expect(AIDE_DECODEE).toContain(
            `${pack.productions.length} productions (${portfolios} portfolio, ${artefacts} artefacts`);
        expect(AIDE_DECODEE).toContain(`${dates} dates`);
        expect(AIDE_DECODEE).toContain(`${pack.grilles.length} grilles de critères`);
        expect(AIDE_DECODEE).toContain(`${pack.echelles.length} échelles de performance`);
        expect(AIDE_DECODEE).toMatch(new RegExp(`${pack.etudiants}\\s+étudiant`));
    });

    it('le seuil de défi annoncé est celui d\'interpretation-config.js', () => {
        const cfgInterp = readFileSync(path.join(racine, 'js/interpretation-config.js'), 'utf8');
        const m = cfgInterp.match(/defiSpecifique:\s*([0-9.]+)/);
        expect(m).toBeTruthy();
        const pct = Math.round(parseFloat(m[1]) * 100);
        expect(AIDE_DECODEE).toContain(`(${pct} % par défaut)`);   // #1137 : « 70&nbsp;% » dans index.html ; AIDE_TXT ramène &nbsp; à une espace
    });
});

function decodeEntites(s) {
    return s.replace(/&Eacute;/g, 'É').replace(/&eacute;/g, 'é')
            .replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è');
}
