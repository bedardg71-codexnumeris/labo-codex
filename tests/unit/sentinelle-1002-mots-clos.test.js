import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #1002 (4 octobre 2026) — L'ÉTAT GELÉ D'UN TRIMESTRE SE DIT « CLOS ».
//
// Vocabulaire arrêté par Grégoire le 30 sept. : « clos » = l'état gelé d'un
// trimestre terminé, en lecture seule ; « archivé » = déposé hors du navigateur
// et vérifié (les Archives). Le lot A5 a remplacé le mot sur toutes les surfaces
// qui disent l'état gelé. Ce banc lit les textes que l'usager lit sur ces
// surfaces et refuse « archiv », sauf les exceptions NOMMÉES ci-dessous.
//
// Hors de ce banc, délibérément (consigne de Cowork, 4 oct., point 2) : les textes
// du dépôt aux archives (ils gardent leur mot), « Exporter et archiver » de
// Travaux, l'évaluation « archivée » après un jeton, les noms internes
// (`archiverTrimestre`, `trimestre.archive`, `mode-archive`…) et les Nouvelles
// déjà publiées (`changelog-data.js`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

// Les surfaces de l'état gelé : la bibliothèque des trimestres, le cycle de vie,
// les gardes d'import et de remplacement d'échelle sur un trimestre clos.
const SURFACES_JS = [
    'trimestre-v2-liste.js',
    'trimestres.js',
    'cartouches.js',
    'grilles.js',
    'pratiques-gestion.js',
    'donnees-v2.js',
    'echelles.js',
];

// Exceptions nommées : chacune est un texte en attente d'une décision de Grégoire
// (les « vrais choix » du lot), ou une chaîne de console que l'usager ne lit pas.
const EXCEPTIONS = [
    // Vrai choix : le nom du fichier téléchargé à la clôture (#1006).
    'trimestre-${id}-archive-',
    // Vrai choix : l'aide de la clôture, qui dit que clore « libère l'espace ».
    'L\'archivage permet de',
    // Console seulement (suite d'un console.error de `archiverTrimestre`).
    'Archiver maintenant produirait un snapshot',
];

// Chaînes littérales d'un source JS, commentaires retirés.
function chainesJs(source) {
    const chaines = [];
    let i = 0;
    while (i < source.length) {
        if (source.startsWith('/*', i)) {
            const f = source.indexOf('*/', i + 2);
            i = f < 0 ? source.length : f + 2;
        } else if (source.startsWith('//', i)) {
            const f = source.indexOf('\n', i);
            i = f < 0 ? source.length : f;
        } else if ('\'"`'.includes(source[i])) {
            const q = source[i];
            let j = i + 1;
            while (j < source.length && source[j] !== q) {
                if (source[j] === '\\') j++;
                else if (q !== '`' && source[j] === '\n') break;
                j++;
            }
            chaines.push(source.slice(i + 1, j));
            i = j + 1;
        } else {
            i++;
        }
    }
    return chaines;
}

// Ce que l'usager lit d'une chaîne : les attributs techniques retirés (classes,
// identifiants, data-*, styles) ; « title » reste, il s'affiche en infobulle.
const sansAttributsTechniques = (s) => s.replace(/\s(?:class|id|style|name|type|for|value|data-[\w-]+)="[^"]*"/g, '');

// Une chaîne est lue par l'usager si elle porte une espace ou un accent, ou si
// elle commence par une majuscule (« Archiver »). Les identifiants
// (`confirmerArchivage`, 'mode-archive') n'ont rien de cela ; les messages de
// console commencent par « [Module] ».
const estLue = (s) => (/[\sÀ-ÖØ-Þà-öø-ÿ]/.test(s) || /^[A-Z]/.test(s)) && !/^\s*\[\w+\]/.test(s);

const estException = (s) => EXCEPTIONS.some((e) => s.includes(e));

function textesArchivJs(fichier) {
    return chainesJs(lire('js', fichier))
        .map(sansAttributsTechniques)
        .filter((s) => /archiv/i.test(s) && estLue(s) && !estException(s));
}

// Texte visible d'un fragment HTML : commentaires, balises et attributs retirés.
const texteHtml = (html) => html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean);

const index = lire('index.html');
const bandeau = tranche(index, '<div id="bandeau-archive"', '<label', { longueurMin: 200 });
const aideCloture = tranche(index, '<div class="carte accordeon" id="accordeon-aide-archivage">', '<!-- Carte:', { longueurMin: 1500 });

describe('#1002 — l\'état gelé d\'un trimestre se dit « clos »', () => {
    it.each(SURFACES_JS)('%s : aucun texte lu ne dit « archiv » (hors exceptions nommées)', (fichier) => {
        expect(textesArchivJs(fichier)).toEqual([]);
    });

    it('le bandeau de lecture seule dit « Trimestre clos »', () => {
        const lignes = texteHtml(bandeau);
        expect(lignes.join(' ')).toContain('Trimestre clos');
        expect(lignes.filter((l) => /archiv/i.test(l))).toEqual([]);
    });

    it('l\'aide de la clôture ne dit « archiv » que dans la phrase en attente de Grégoire', () => {
        const lignes = texteHtml(aideCloture);
        expect(lignes.join(' ')).toContain('Qu\'est-ce que clore un trimestre ?');
        expect(lignes.filter((l) => /archiv/i.test(l) && !estException(l))).toEqual([]);
    });

    it('la bibliothèque des trimestres nomme les gestes « Clore » et « Rouvrir »', () => {
        const liste = lire('js', 'trimestre-v2-liste.js');
        expect(liste).toContain('<span class="badge-trimestre archive">Clos</span>');
        expect(liste).toContain('titreSection2 = \'Trimestres clos\';');
        expect(liste.match(/\{ label: 'Clore', action: 'confirmerArchivage'/g)).toHaveLength(2);
        expect(liste).toContain('{ label: \'Rouvrir\', action: \'desarchiverTrimestre\'');
    });

    it('nulle part un texte lu ne dit « désarchiver » (hors Nouvelles publiées)', () => {
        const fichiers = readdirSync(path.join(racine, 'js'))
            .filter((f) => f.endsWith('.js') && f !== 'changelog-data.js');
        const fautifs = [];
        for (const f of fichiers) {
            for (const s of chainesJs(lire('js', f)).map(sansAttributsTechniques)) {
                if (/d[ée]sarchiv/i.test(s) && estLue(s)) fautifs.push(f + ' : ' + s.trim().slice(0, 80));
            }
        }
        for (const l of texteHtml(index)) {
            if (/d[ée]sarchiv/i.test(l)) fautifs.push('index.html : ' + l.slice(0, 80));
        }
        expect(fautifs).toEqual([]);
    });
});
