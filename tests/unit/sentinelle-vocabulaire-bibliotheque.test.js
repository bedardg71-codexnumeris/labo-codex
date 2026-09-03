import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — 3 SEPTEMBRE 2026 · « BIBLIOTHÈQUE PARTAGÉE » A QUITTÉ LE VOCABULAIRE.
//
// Décision de Grégoire, ses mots : « Les documents partagés sont des copies
// indépendantes. Ce ne sont pas des originaux. Si un collègue m'envoie une
// cartouche, que je l'utilise et que je la supprime, ça n'a aucun effet sur
// l'original de mon collègue. »
//
// Le mot mentait deux fois : il suggérait un dépôt commun à plusieurs personnes
// (il n'y en a pas), et il faisait craindre de détruire l'exemplaire d'un
// collègue en supprimant sa propre copie — l'inverse de ce que fait le code.
// L'expression est remplacée par « la Bibliothèque », dans les chaînes ET dans
// les commentaires (un nom périmé s'y réinstalle tout seul).
//
// Deux exceptions, et deux seulement, dans js/changelog-data.js :
//   · l'annonce ANCIENNE des huit échelles d'exemple — lue par des utilisateurs,
//     on ne réécrit pas ce qui a été annoncé ;
//   · l'annonce du renommage lui-même, qui doit nommer l'ancien mot.
//
// ⚠ Les CLÉS DE STOCKAGE (`bibliothequeCartouches`, `CLE_BIBLIOTHEQUE_*`…) ne
// sont pas du vocabulaire : ce sont les adresses des données réelles. Cette
// sentinelle ne les regarde pas, et rien ne doit jamais les renommer.
//
// ↻ Note d'avenir : quand la Voûte existera, l'expression pourra revenir —
// elle décrira alors quelque chose de réel. Ce jour-là, cette sentinelle se
// retire ; on ne la contourne pas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const MOTIF = /biblioth[èe]que\s+partag[ée]e/i;
const EXCEPTIONS = [
    'huit échelles d’exemple',
    'appelle maintenant <strong>« la Bibliothèque »'
];

function fichiersJs(dossier) {
    const resultats = [];
    for (const entree of readdirSync(dossier)) {
        const chemin = path.join(dossier, entree);
        if (statSync(chemin).isDirectory()) { if (entree !== '_archives') resultats.push(...fichiersJs(chemin)); }
        else if (entree.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

function occurrences() {
    const cibles = [...fichiersJs(path.join(racineProjet, 'js')), path.join(racineProjet, 'index.html')];
    const trouvees = [];
    for (const f of cibles) {
        readFileSync(f, 'utf8').split('\n').forEach((ligne, i) => {
            if (MOTIF.test(ligne)) trouvees.push({ fichier: path.relative(racineProjet, f), ligne: i + 1, texte: ligne });
        });
    }
    return trouvees;
}

describe('vocabulaire · « bibliothèque partagée » ne se lit plus nulle part', () => {
    it('js/ et index.html : aucune occurrence hors des deux annonces du changelog', () => {
        const restantes = occurrences()
            .filter(o => !(o.fichier === 'js/changelog-data.js' && EXCEPTIONS.some(e => o.texte.includes(e))))
            .map(o => `${o.fichier}:${o.ligne}`);
        expect(restantes).toEqual([]);
    });

    it('témoin : le motif voit bien les deux exceptions (sinon le vert ne prouverait rien)', () => {
        const exceptions = occurrences().filter(o => o.fichier === 'js/changelog-data.js');
        expect(exceptions).toHaveLength(2);
        expect(exceptions.every(o => EXCEPTIONS.some(e => o.texte.includes(e)))).toBe(true);
    });
});
