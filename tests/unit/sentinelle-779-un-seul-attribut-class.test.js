/**
 * SENTINELLE #779 / #787 — AUCUNE BALISE D'`index.html` NE PORTE DEUX ATTRIBUTS
 * `class`. PLUS UNE SEULE, JAMAIS.
 *
 * ▣ 14 sept. 2026 (#787) : la dette est ÉTEINTE. Les treize derniers cas ont été
 * fusionnés en un seul attribut, dans l'ordre (valeur du premier, puis du
 * second), sans rien retirer : le second `class` avait été écrit pour son
 * effet, et son absence à l'écran était un accident silencieux. Le cliquet
 * devient un INTERDIT : `DETTE_CONNUE` est vide et doit le rester.
 *
 * Historique, pour comprendre d'où vient l'interdit :
 *
 * `index.html` portait, sur le champ de date de la saisie des présences :
 *     <input type="date" id="date-cours" class="controle-form"
 *            class="u-flex-1" style="min-width: 0" …>
 * HTML ne retient QUE le premier attribut `class` : `u-flex-1` était perdu en
 * silence, et le champ ne prenait pas la largeur prévue dans son conteneur
 * flex. Aucun outil ne le disait — ni le navigateur, ni le linter, ni un test.
 *
 * ▣ EN LE MESURANT, ON A TROUVÉ 22 AUTRES CAS (7 sept. 2026) : boutons,
 * tableaux, alertes, trois `input` de seuils — tous perdant une classe
 * utilitaire d'espacement ou de largeur. Ils sont INSCRITS, pas corrigés :
 * chacun est un changement visuel qui se juge à l'écran, et ce lot-ci n'a
 * qu'un item. La liste ci-dessous est donc une DETTE FIGÉE, pas une cible.
 *
 * ⮕ Ce que garde l'interdit : le cas de #779 reste réparé (bloc A), et
 *   n'importe quel second `class` réapparu dans `index.html` rougit (bloc B).
 *
 * BREAK-TESTS attendus : remettre le second `class="u-flex-1"` sur le champ de
 * date → A et B rougissent ; remettre un second `class` sur n'importe quelle
 * autre balise → B rougit en nommant la signature de trop.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const HTML = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

/**
 * Les balises ouvrantes portant PLUS D'UN attribut `class`, réduites à une
 * signature stable (balise | classes gardées | classes perdues) — un numéro de
 * ligne bougerait au premier ajout ailleurs dans le fichier.
 */
function signaturesDoubleClass() {
    const sigs = [];
    for (const m of HTML.matchAll(/<[a-zA-Z][^<>]*>/g)) {
        const balise = m[0];
        const occ = [...balise.matchAll(/(?:^|\s)class\s*=\s*"([^"]*)"/g)].map((x) => x[1]);
        if (occ.length > 1) {
            sigs.push(`${/^<([a-zA-Z0-9]+)/.exec(balise)[1]}|${occ[0]}|${occ.slice(1).join('|')}`);
        }
    }
    return sigs.sort();
}

/** La dette connue au 7 septembre 2026, après la réparation de #779.
 *  ↻ 11 sept. 2026 : trois cas de moins — les trois curseurs de seuils de
 *  Labo › Outils d'observation (`input|controle-form|u-w-100`) sont devenus des
 *  champs chiffrés à un seul `class` (forme de l'écran, 1.130.0).
 *  ↻ 13 sept. 2026 : six cas de moins (19 → 13) — ils vivaient dans le bloc
 *  « ANCIEN SYSTÈME » masqué des échelles, retiré par #520 : les deux
 *  `button|…|flex-1`, `groupe-form|max-w-400-mb20`, `groupe-form|max-w-400-mb20-hidden`,
 *  `groupe-form|mt-15`, `btn-groupe|mt-20-justify-between`. Aucun rendu ne change :
 *  le bloc était caché.
 *  ↻ 14 sept. 2026 : 13 → 0 (#787), les treize fusionnés. Liste vide, et elle
 *  le reste : un cas qui revient se fusionne, il ne s'inscrit pas ici. */
const DETTE_CONNUE = [];

describe('#779 · A — le champ de date porte ses deux classes', () => {
    const balise = /<input[^<>]*id="date-cours"[^<>]*>/.exec(HTML);

    it('la balise existe', () => {
        expect(balise, '#date-cours introuvable dans index.html').not.toBeNull();
    });

    it('un seul attribut `class`, et il porte les deux classes', () => {
        const occ = [...balise[0].matchAll(/(?:^|\s)class\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
        expect(occ.length, 'deux attributs `class` : le navigateur ignore le second').toBe(1);
        expect(occ[0].split(/\s+/).sort()).toEqual(['controle-form', 'u-flex-1']);
    });
});

describe('#787 · B — aucune balise d\'index.html ne porte deux attributs `class`', () => {
    it('la liste des doubles `class` est vide', () => {
        const vues = signaturesDoubleClass();
        expect(
            vues,
            `${vues.length} balise(s) à DEUX attributs \`class\` dans index.html :\n  ` +
            vues.join('\n  ') + '\n' +
            'Le navigateur ignore le second en silence. Fusionner les deux valeurs en un\n' +
            'seul attribut (premier puis second) — ne pas inscrire le cas dans DETTE_CONNUE.'
        ).toEqual(DETTE_CONNUE);
    });
});

// #865 (lot 11, 11 oct. 2026) — la même dette dans les gabarits HTML écrits en JavaScript.
// Cinq cas au 14 sept. : `grilles.js` (u-mt-10), `productions.js` ×3 (u-mt-10),
// `profil-etudiant-sections-affichage.js` (hover-opaque, sur une balise écrite sur plusieurs
// lignes). Fusionnés (premier, puis second). L'interdit s'étend à tout le dossier js/.
// Break-test : remettre un second `class="u-mt-10"` sur un des boutons → C rougit en le nommant.
describe('#865 · C — aucun gabarit de js/ ne porte deux attributs `class`', () => {
    it('la liste est vide', () => {
        const vues = [];
        const dossier = path.join(racineProjet, 'js');
        for (const f of readdirSync(dossier, { recursive: true })) {
            if (!String(f).endsWith('.js')) continue;
            const code = readFileSync(path.join(dossier, f), 'utf8');
            for (const m of code.matchAll(/<[a-zA-Z][^<>]*>/g)) {
                const occ = [...m[0].matchAll(/(?:^|\s)class\s*=\s*"([^"]*)"/g)].map((x) => x[1]);
                if (occ.length > 1) vues.push(`${f} | ${occ.join(' | ')}`);
            }
        }
        expect(vues, 'Fusionner les deux valeurs en un seul attribut (premier puis second).').toEqual([]);
    });
});
