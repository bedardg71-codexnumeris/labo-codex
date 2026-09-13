/**
 * SENTINELLE #779 — LE CHAMP DE DATE DES PRÉSENCES A UN SEUL ATTRIBUT `class`,
 * ET LA DETTE DES AUTRES NE GROSSIT PLUS.
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
 * ⮕ Ce que ce cliquet garde : le cas de #779 est réparé, et la dette ne peut
 *   ni grossir ni changer de forme sans rougir. Un cas retiré rougit aussi —
 *   c'est voulu : la liste doit suivre la réparation.
 *
 * BREAK-TESTS attendus : remettre le second `class="u-flex-1"` sur le champ de
 * date → A et B rougissent (B en nommant la signature de trop).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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
 *  le bloc était caché. */
const DETTE_CONNUE = [
    'button|btn btn-principal|u-texte-09 u-w-100',
    'button|btn btn-principal|whitespace-nowrap',
    'div|alerte alerte-attention|mt-10',
    'div|alerte alerte-attention|mt-10',
    'div|alerte alerte-info|mt-15',
    'div|alerte alerte-info|mt-20',
    'div|alerte alerte-succes|mt-10',
    'div|alerte alerte-succes|mt-15',
    'div|groupe-boutons-colonne|mb-15',
    'table|tableau|mt-10',
    'table|tableau|mt-10',
    'table|tableau|mt-15',
    'table|tableau|text-09-mt10'
];

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

describe('#779 · B — la dette des doubles `class` ne bouge pas', () => {
    it('aucun cas neuf, aucun cas transformé', () => {
        const vues = signaturesDoubleClass();
        const nouvelles = vues.filter((s, i) => s !== DETTE_CONNUE[i] && !DETTE_CONNUE.includes(s));
        expect(
            vues,
            'La liste des balises à DEUX attributs `class` a changé.\n' +
            `Attendu ${DETTE_CONNUE.length}, vu ${vues.length}.\n` +
            (nouvelles.length ? 'Cas non inscrits :\n  ' + nouvelles.join('\n  ') + '\n' : '') +
            'Un cas NEUF : le second `class` est ignoré par le navigateur — fusionner les\n' +
            'deux en un seul attribut. Un cas RÉPARÉ : le retirer de DETTE_CONNUE.'
        ).toEqual(DETTE_CONNUE);
    });

    it('le champ de date n\'est plus dans la dette', () => {
        expect(signaturesDoubleClass()).not.toContain('input|controle-form|u-flex-1');
    });
});
