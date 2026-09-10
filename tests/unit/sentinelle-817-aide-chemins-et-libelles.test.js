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
    const boutons = [
        'Régénérer',
        'Exporter le Codex',
        'Recalculer les captures',
        "Appliquer une adaptation du modèle de la Réponse à l'intervention",
    ];

    for (const libelle of boutons) {
        it(`« ${libelle} » existe dans l'interface`, () => {
            expect(INTERFACE).toContain(libelle);
            expect(AIDE_TXT).toContain(libelle);
        });
    }

    it('les libellés périmés ont disparu de l\'Aide', () => {
        for (const perime of ['Générer le calendrier complet', 'Exporter mes données',
                              'Reconstruire les snapshots historiques',
                              'Activer RàI et détection des patterns']) {
            expect(AIDE_TXT).not.toContain(perime);
        }
    });
});

function decodeEntites(s) {
    return s.replace(/&Eacute;/g, 'É').replace(/&eacute;/g, 'é')
            .replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è');
}
