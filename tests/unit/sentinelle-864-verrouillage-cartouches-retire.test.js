/**
 * SENTINELLE #864 — LE VERROUILLAGE DES CARTOUCHES EST RETIRÉ, ET NE REVIENT PAS
 * EN SILENCE.
 *
 * Le 14 sept. 2026, la porte terrain de #787 a montré que rien dans
 * l'application ne pouvait verrouiller une cartouche : le seul bouton qui
 * appelait la bascule vivait dans deux fonctions sans appelant. Grégoire a
 * tranché : le verrouillage sort (« je n'ai jamais senti que j'avais besoin de
 * verrouiller une cartouche »). Ont été retirés : les deux fonctions mortes, la
 * bascule, leurs exports, le bandeau « Cartouche verrouillée » et son bouton,
 * la garde de suppression et l'icône de cadenas de la banque.
 *
 * ⮕ CE QUI RESTE, ET C'EST VOULU : le champ `verrouille` des cartouches. Il est
 *   déclaré dans les schémas d'échange (`js/partage-schemas.js`,
 *   `js/import-export.js`) — un fichier déjà exporté doit rester lisible — et
 *   il est encore ÉCRIT à `false` à la création et à la duplication, pour la
 *   forme de ce qui s'exporte. Écrire est permis ; LIRE ne l'est plus : un champ
 *   que plus rien ne lit est inerte, et c'est ce que ce fichier garde.
 *
 * LES DEUX INTERDITS :
 *   A. aucun des six symboles retirés ne réapparaît dans le code livré ;
 *   B. aucun ACCÈS à `.verrouille` sur une cartouche : dans tout `js/cartouches.js`
 *      (le module des cartouches), et, ailleurs dans `js/`, sur un receveur dont
 *      le nom commence par `cart` (`cartouche.verrouille`, `cart.verrouille`,
 *      `cartouches[i].verrouille`…).
 *
 * ⚠ CE QUE B NE PEUT PAS VOIR : un module autre que `cartouches.js` qui lirait le
 *   champ sur une variable nommée autrement (`c.verrouille`, `item.verrouille`).
 *   `js/` porte d'autres `verrouille` légitimes, sur d'autres objets — critères
 *   de grille (`grilles.js`), évaluations (`productions.js`,
 *   `liste-evaluations.js`), présences (`saisie-presences.js`) : les interdire
 *   tous rendrait la sentinelle fausse. Mesuré le 14 sept. 2026 : aucun module
 *   hors `cartouches.js` ne lit le champ d'une cartouche.
 *
 * BREAK-TEST attendu : remettre `if (cartouche.verrouille) …` dans
 * `supprimerCartoucheConfirm` → B rougit en nommant la ligne.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const FICHIERS_JS = readdirSync(path.join(racine, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => 'js/' + f);

const SYMBOLES_RETIRES = [
    'afficherListeCartouches',
    'afficherToutesLesGrillesEtCartouches',
    'basculerVerrouillageCartouche',
    'alerteVerrouillage',
    'btnDeverrouillerCartouche',
    'verrouIcone'
];

// Un accès, lecture ou écriture : `.verrouille` ou `['verrouille']`.
// `verrouille: false` (un littéral d'objet) n'est PAS un accès, et reste permis.
const ACCES = /\.verrouille\b|\[\s*['"]verrouille['"]\s*\]/;
const ACCES_SUR_CARTOUCHE = /\bcart\w*(?:\[[^\]]*\])?\s*\.verrouille\b/i;

/** Les lignes de code (commentaires de ligne et de bloc écartés) qui répondent au motif. */
function lignesFautives(fichier, motif) {
    const trouvees = [];
    let dansBloc = false;
    lire(fichier).split('\n').forEach((ligne, i) => {
        let code = ligne;
        if (dansBloc) {
            const fin = code.indexOf('*/');
            if (fin === -1) return;
            code = code.slice(fin + 2);
            dansBloc = false;
        }
        const t = code.trim();
        if (t.startsWith('//') || t.startsWith('*')) return;
        if (t.startsWith('/*')) {
            if (!t.includes('*/')) dansBloc = true;
            return;
        }
        if (motif.test(code)) trouvees.push(`${fichier}:${i + 1}: ${ligne.trim()}`);
    });
    return trouvees;
}

describe('#864 · A — les symboles du verrouillage des cartouches ne reviennent pas', () => {
    it('aucun des six, ni dans js/, ni dans index.html, ni dans styles.css', () => {
        const sites = [];
        for (const f of [...FICHIERS_JS, 'index.html', 'styles.css']) {
            const src = lire(f);
            for (const s of SYMBOLES_RETIRES) if (src.includes(s)) sites.push(`${f} : ${s}`);
        }
        expect(sites, 'symbole retiré par #864 réapparu :\n  ' + sites.join('\n  ')).toEqual([]);
    });
});

describe('#864 · B — plus aucun accès au champ `verrouille` d\'une cartouche', () => {
    it('js/cartouches.js : aucun accès à `.verrouille`', () => {
        const vues = lignesFautives('js/cartouches.js', ACCES);
        expect(
            vues,
            'Le champ `verrouille` des cartouches est inerte depuis #864 : plus rien ne doit le lire.\n  ' +
            vues.join('\n  ')
        ).toEqual([]);
    });

    it('ailleurs dans js/ : aucun `.verrouille` sur un receveur nommé cart…', () => {
        const vues = FICHIERS_JS
            .filter((f) => f !== 'js/cartouches.js')
            .flatMap((f) => lignesFautives(f, ACCES_SUR_CARTOUCHE));
        expect(vues, 'lecteur du champ `verrouille` d\'une cartouche :\n  ' + vues.join('\n  ')).toEqual([]);
    });

    it('témoin : le champ reste ÉCRIT à false à la création, et déclaré dans les schémas', () => {
        // Sans ce témoin, un retrait trop large (le champ entier) passerait A et B.
        expect((lire('js/cartouches.js').match(/verrouille:\s*false/g) || []).length).toBeGreaterThanOrEqual(3);
        expect(lire('js/partage-schemas.js')).toMatch(/verrouille:\s*\{\s*type:/);
        expect(lire('js/import-export.js')).toMatch(/verrouille:\s*\{\s*type:/);
    });
});
