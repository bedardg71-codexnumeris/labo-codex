import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

// SENTINELLE (30 octobre 2026) — « NOTE PROVISOIRE » EST RÉSERVÉE AUX PRATIQUES ALTERNATIVES.
//
// Principe validé par Grégoire : ailleurs, « note du cours à ce jour », ou « note du cours » quand
// on dit qu'elle s'affiche ou non. Ce banc lit les mots à l'écran (les chaînes et les gabarits de
// js/, le HTML de index.html, sans les commentaires) et refuse « note provisoire », sauf les
// exceptions NOMMÉES ci-dessous. Une exception qui ne se trouve plus rougit aussi : la liste suit
// le code, elle ne garde pas de place à ce qui est parti.
//
// Hors de ce banc, délibérément : les commentaires du code ; les noms internes (`noteProvisoire`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const NOTE_PROVISOIRE = /\bnotes?(?:\s|&nbsp;)+provisoires?\b/gi;

// Les anciens mots qui opposent « provisoire » à « finale » sont HORS DU LOT et restent ouverts à
// Grégoire (RELAIS.md, 30 oct.) : quand il en décide, leur ligne part d'ici.
const ANCIENS_MOTS = 'oppose « provisoire » à « finale », ouvert au RELAIS du 30 oct.';

const EXCEPTIONS = [
    { fichier: 'index.html', contient: '(en pratique alternative de notation, la note provisoire)', nb: 1, motif: 'pratique alternative, le mot que le principe garde' },
    { fichier: 'js/changelog-data.js', contient: 'en tête de sa rétroaction et sa note provisoire', nb: 1, motif: 'Nouvelles déjà publiées' },
    { fichier: 'js/changelog-data.js', contient: 'Le bloc «&nbsp;Note provisoire&nbsp;» y garde', nb: 1, motif: 'Nouvelles déjà publiées' },
    { fichier: 'js/profil-etudiant-sections-affichage.js', contient: 'Note provisoire de session', nb: 3, motif: ANCIENS_MOTS },
    { fichier: 'index.html', contient: 'Active le titre « Note finale » sur les PDFs de rétroaction (au lieu de « Note provisoire »)', nb: 1, motif: ANCIENS_MOTS },
    { fichier: 'js/accompagnement-contenu-terme.js', contient: '« Note finale » au lieu de « Note provisoire »', nb: 1, motif: ANCIENS_MOTS },
    { fichier: 'js/synthese-retroaction-rendu.js', contient: 'Note provisoire', nb: 3, motif: ANCIENS_MOTS },
];

function fichiersJs(dossier) {
    return readdirSync(dossier, { withFileTypes: true }).flatMap(e => {
        const chemin = path.join(dossier, e.name);
        if (e.isDirectory()) return fichiersJs(chemin);
        return e.name.endsWith('.js') ? [chemin] : [];
    });
}

// Les textes qu'un fichier .js peut mettre à l'écran : ses chaînes et les morceaux de ses gabarits.
function textesDuJs(source) {
    const textes = [];
    const jetons = acorn.tokenizer(source, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true });
    for (const jeton of jetons) {
        if ((jeton.type.label === 'string' || jeton.type.label === 'template') && typeof jeton.value === 'string') {
            textes.push(jeton.value);
        }
    }
    return textes;
}

function textesDuHtml(source) {
    return source.replace(/<!--[\s\S]*?-->/g, '').split('\n');
}

// Rend les occurrences trouvées : { fichier, texte, nb } par texte qui en porte.
function occurrences(fichier, textes) {
    return textes.flatMap(texte => {
        const nb = (texte.match(NOTE_PROVISOIRE) || []).length;
        return nb > 0 ? [{ fichier, texte, nb }] : [];
    });
}

function toutesLesOccurrences() {
    const js = fichiersJs(path.join(racine, 'js')).flatMap(chemin =>
        occurrences(path.relative(racine, chemin).split(path.sep).join('/'), textesDuJs(readFileSync(chemin, 'utf8'))));
    return [...js, ...occurrences('index.html', textesDuHtml(readFileSync(path.join(racine, 'index.html'), 'utf8')))];
}

describe('« note provisoire » : réservée aux pratiques alternatives', () => {
    const trouvees = toutesLesOccurrences();

    it('aucune occurrence à l\'écran hors des exceptions nommées', () => {
        const horsListe = trouvees.filter(o => !EXCEPTIONS.some(e => e.fichier === o.fichier && o.texte.includes(e.contient)));
        expect(horsListe.map(o => `${o.fichier} : ${o.texte.trim().slice(0, 160)}`)).toEqual([]);
    });

    it.each(EXCEPTIONS)('l\'exception $fichier, « $contient », existe encore, $nb fois', ({ fichier, contient, nb }) => {
        const vues = trouvees.filter(o => o.fichier === fichier && o.texte.includes(contient));
        expect(vues.reduce((somme, o) => somme + o.nb, 0)).toBe(nb);
    });

    it('le détecteur voit le mot sous toutes ses formes, et pas dans un commentaire', () => {
        const source = [
            '// note provisoire dans un commentaire',
            '/* Note provisoire dans un bloc */',
            'const a = \'Sa note provisoire\';',
            'const b = "Les notes provisoires";',
            'const c = `La Note&nbsp;provisoire ${a}`;',
            'const d = \'La note\\u00a0provisoire\';',
            'const noteProvisoire = true;',
        ].join('\n');
        expect(occurrences('témoin.js', textesDuJs(source)).length).toBe(4);
        expect(occurrences('témoin.html', textesDuHtml('<!-- note provisoire -->\n<p>Note provisoire</p>')).length).toBe(1);
    });
});

describe('Les mots qui la remplacent, aux surfaces du niveau RàI', () => {
    const lire = f => readFileSync(path.join(racine, f), 'utf8');

    it.each([
        ['js/profil-etudiant-calculs.js', 'Note du cours à ce jour sous le seuil minimal de réussite, avec une difficulté sur un critère de fondation.'],
        ['js/profil-etudiant-calculs.js', 'il fixe le niveau jusqu\\\'à ce que la note du cours s\\\'affiche.'],
        ['js/profil-etudiant-calculs.js', 'La note du cours ne s\\\'affiche pas encore : le niveau l\\\'attend.'],
        ['js/atelier-algo.js', 'Jusqu’à ce que la note du cours s’affiche. Ensuite,'],
        ['js/tableau-bord-apercu.js', 'La moyenne ${nom}, pour la note du cours à ce jour ('],
        ['js/tableau-bord-apercu.js', 'en attente de sa note du cours.'],
        ['js/accompagnement-contenu-hover.js', 'd’après la note du cours à ce jour, devant le seuil'],
        ['js/accompagnement-contenu-popup.js', 'Niveau 1 (vert) — Note du cours à ce jour au seuil'],
        ['js/accompagnement-contenu-terme.js', 'Tant que la note du cours ne s’affiche pas, un signalement diagnostique'],
        ['js/guides-pedagogiques.js', 'Quand la moyenne du groupe, pour la note du cours à ce jour, est sous ce seuil'],
    ])('%s : « %s »', (fichier, mots) => {
        expect(lire(fichier)).toContain(mots);
    });
});
