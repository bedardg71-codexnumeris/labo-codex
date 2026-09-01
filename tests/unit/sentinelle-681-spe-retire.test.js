import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle #681 — `js/spe-specifications.js` EST RETIRÉ (1er septembre 2026).
//
// 1009 lignes du 2 janvier 2026, 24 symboles exposés sur `window`, et trois
// auto-déclencheurs de fin de fichier qui l'allumaient tout seul à chaque
// chargement (`DOMContentLoaded`, un `setTimeout(100)`, `window.onload`).
// Personne ne l'appelait : il s'appelait. Il semait cinq objets signés
// « Labo Codex » dans les listes d'un nouvel enseignant — geste 2 de la ligne
// d'arrivée, celui qui doit précisément cesser de faire ça.
//
// LA MESURE QUI A AUTORISÉ LE RETRAIT, faite AVANT de couper : 786 fichiers
// balayés (js/, tests/, scripts/, index.html), commentaires retirés avant
// lecture. 23 symboles sur 24 sans aucun usage ; le 24e n'apparaissait que
// comme CHAÎNE dans un banc qui surveillait le fichier. Zéro consommateur
// vivant. Les chemins qu'un grep ne voit pas ont été instruits séparément :
// l'unique « SPE » de main.js est `GABARIT_GRILLE_CHECKLIST_SPE` (un gabarit de
// GRILLE, aucun rapport), et les trois `data-action` du module pointaient vers
// ses propres fonctions, dans du HTML qu'il générait lui-même.
//
// ⛔⛔ CE QUE CETTE SENTINELLE NE DIT PAS, ET QU'IL NE FAUT PAS LUI FAIRE DIRE.
// La pratique de notation PAR SPÉCIFICATIONS n'est pas retirée. Elle est codée
// et configurable dans le système de pratiques, comme celle par standards.
// `js/pratiques/pratique-pan-specifications.js` et l'écran
// `mat-config-pan-specifications` d'`index.html` DOIVENT rester — l'assertion D
// est là pour qu'un retrait « de cohérence » ne les emporte pas au passage.
//
// Break-test du 1er septembre, sur la source EN MÉMOIRE : remettre le fichier →
// A rougit ; remettre la balise → B rougit ; rendre le script de nettoyage
// écrivant → C rougit ; retirer la pratique → D rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (p) => readFileSync(path.join(racineProjet, p), 'utf8');

describe('#681 · le module SPE autonome est retiré, la PRATIQUE reste', () => {

    it('A · le fichier n\'existe plus, et aucun autre module ne le réintroduit', () => {
        expect(existsSync(path.join(racineProjet, 'js', 'spe-specifications.js')),
            'js/spe-specifications.js est revenu').toBe(false);
        // Ses 24 symboles ne doivent pas non plus renaître ailleurs sous le même nom.
        const fichiers = readdirSync(path.join(racineProjet, 'js')).filter(f => f.endsWith('.js'));
        const revenus = [];
        for (const f of fichiers) {
            const code = lire('js/' + f)
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
            for (const nom of ['initialiserModuleSPE', 'creerGabaritsSPE', 'evaluerProductionSPE',
                               'genererTableauBordSPE', 'creerEchelleSPESiInexistante']) {
                if (code.includes('function ' + nom) || code.includes('window.' + nom + ' =')) {
                    revenus.push(f + ' → ' + nom);
                }
            }
        }
        expect(revenus, 'un symbole du module retiré est réapparu').toEqual([]);
    });

    it('B · index.html ne charge plus le module', () => {
        expect(lire('index.html')).not.toContain('spe-specifications');
    });

    it('C · le script de nettoyage COMPTE et n\'écrit rien — c\'est ce qui l\'autorise sur le corpus réel', () => {
        const src = lire('scripts/nettoyage-681-spe.js');
        expect(src).toContain('async function nettoyage681');
        const code = src
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
        for (const ecriture of ['db.set(', 'db.setSync(', 'db.modifier(', 'db.supprimer(', 'db.removeSync(']) {
            expect(code.includes(ecriture),
                'le script ÉCRIT (' + ecriture + ') — le premier temps ne doit que compter').toBe(false);
        }
        // Les cinq objets semés y sont nommés : un script de mesure qui oublie
        // une cible rend un zéro qui ne veut rien dire.
        for (const id of ['ECHELLE_SPE_BINAIRE', 'GRILLE_SPE_GABARIT_PRISE_POSITION',
                          'GRILLE_SPE_GABARIT_PORTFOLIO', 'GRILLE_SPE_GABARIT_ORAL',
                          'PROD_SPE_GABARIT_PRISE_POSITION']) {
            expect(src, id + ' n\'est pas cherché').toContain(id);
        }
    });

    it('D · la PRATIQUE par spécifications, elle, est intacte — ce retrait ne l\'emporte pas', () => {
        expect(existsSync(path.join(racineProjet, 'js', 'pratiques', 'pratique-pan-specifications.js')),
            'la pratique PAN-Spécifications a été emportée par erreur').toBe(true);
        expect(lire('index.html'), 'l\'écran de configuration de la pratique a disparu')
            .toContain('mat-config-pan-specifications');
    });
});
