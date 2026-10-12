import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

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

// Exceptions nommées : le nom du fichier de « Exporter les données » (#1006, ouverte
// pour les trois boutons de la bibliothèque), ou une chaîne de console.
const EXCEPTIONS = [
    // Le fichier de « Exporter les données » (#1006) ; la clôture ne le télécharge plus.
    'trimestre-${id}-archive-',
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

    it('l\'aide de la clôture ne dit plus « archiv », ni que clore libère de l\'espace', () => {
        const lignes = texteHtml(aideCloture);
        const texte = lignes.join(' ');
        expect(texte).toContain('Qu\'est-ce que clore un trimestre ?');
        // Les mots acceptés par Grégoire le 4 oct. (vrai choix 1).
        expect(texte).toContain('Clore un trimestre le fige en lecture seule, une fois terminé ; tu peux ensuite en commencer un nouveau. Clore ne libère aucun espace.');
        expect(lignes.filter((l) => /archiv/i.test(l))).toEqual([]);
    });

    it('la bibliothèque des trimestres nomme les gestes « Clore » et « Rouvrir »', () => {
        const liste = lire('js', 'trimestre-v2-liste.js');
        // Le badge « Clos » vivait dans la liste sans conteneur, retirée le 4 oct. 2026 (#1006).
        expect(liste).toContain('titreSection2 = \'Trimestres clos\';');
        // #1018 (lot 8, 11 oct. 2026) : « Clore » n'est plus offert sur le trimestre actif (il y était
        // toujours refusé) ; il reste sur le trimestre disponible, une seule fois.
        expect(liste.match(/\{ label: 'Clore', action: 'confirmerArchivage'/g)).toHaveLength(1);
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

    // Vrais choix 3 à 5 (Grégoire, 4 oct.) : les mots des Archives qui parlaient du trimestre.
    it('les Archives parlent d\'un groupe-cours et nomment Vérifier et Faire revenir', () => {
        expect(lire('js', 'registre-longitudinal.js')).toContain('pas dans l\\\'archive d\\\'un groupe-cours.\'');
        expect(lire('js', 'reserve-reglages.js')).toContain('\' · liste mise à jour le \'');
        expect(lire('js', 'reserve-reglages.js')).not.toContain('dernière maj');
        const aide = tranche(lire('js', 'accompagnement-contenu-popup.js'), '\'reglages-reserve\': {', 'voirAussi:', { longueurMin: 1000 });
        expect(aide).toContain('<em>Vérifier</em> relit une archive copie par copie ; une archive vérifiée offre <em>Faire revenir</em>.');
        expect(aide).toContain('d\'un groupe-cours archivé ?');
        expect(index).toContain('→ <em>Archiver…</em>.');
        expect(index).not.toContain('Archiver dans les archives');
    });
});

/* ------------------------------------------ le parcours « clore », exécuté */

const dbDepuisStore = (store) => ({
    get: async (c) => (c in store ? store[c] : null),
    getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
    set: async (c, v) => { store[c] = v; },
    setSync: (c, v) => { store[c] = v; },
    removeSync: (c) => { delete store[c]; }
});

describe('#1002 — clore ne télécharge plus de fichier (vrai choix 2)', () => {
    it('archiverTrimestre réussit sans fabriquer ni télécharger aucun fichier', () => {
        const store = {
            trimestres: [
                { id: 'h2026', actif: true, archive: false },
                { id: 'a2025', actif: false, archive: false, nom: 'Automne 2025' }
            ],
            a2025_productions: []
        };
        const fichiers = { blobs: 0, urls: 0, ancres: 0 };
        const win = chargerScript('js/trimestres.js', {
            db: dbDepuisStore(store),
            Blob: class { constructor() { fichiers.blobs++; } },
            URL: { createObjectURL: () => { fichiers.urls++; return 'blob:x'; }, revokeObjectURL: () => {} },
            document: {
                addEventListener: () => {}, removeEventListener: () => {},
                querySelector: () => null, querySelectorAll: () => [],
                getElementById: () => null,
                createElement: () => { fichiers.ancres++; return { click: () => {}, setAttribute: () => {}, style: {} }; },
                body: { addEventListener: () => {}, appendChild: () => {}, removeChild: () => {}, style: {},
                        classList: { add: () => {}, remove: () => {}, contains: () => false } },
                documentElement: { addEventListener: () => {} }
            }
        });

        const r = win.archiverTrimestre('a2025');

        // Le succès d'abord : un rouge doit venir du téléchargement, pas du banc.
        expect(r.success).toBe(true);
        expect(store.trimestres.find((t) => t.id === 'a2025').archive).toBe(true);
        expect(fichiers).toEqual({ blobs: 0, urls: 0, ancres: 0 });
    });

    it('la confirmation et le message de réussite ne promettent plus de fichier', () => {
        const liste = lire('js', 'trimestre-v2-liste.js');
        const confirmer = tranche(liste, 'function confirmerArchivage(id)', 'function confirmerDesarchivage(id)', { longueurMin: 400 });
        expect(confirmer).not.toMatch(/export automatique|fichier d'export|téléchargé/);
        expect(confirmer).toContain('`Trimestre "${trimestre.nom}" clos.`');
    });
});

describe('#1002 — un refus de clôture dit son motif, pas « undefined »', () => {
    it('confirmerArchivage affiche le message du refus', () => {
        const alertes = [];
        const motif = 'Clôture refusée : les cartouches de 1 grille(s) (G1) n\'ont pas encore été migrées. Recharge l\'application, puis réessaie.';
        const win = chargerScript('js/trimestre-v2-liste.js', {
            obtenirTrimestres: () => [{ id: 'a2025', nom: 'Automne 2025' }],
            archiverTrimestre: () => ({ success: false, refus: 'cartouches-non-migrees', message: motif }),
            confirm: () => true,
            alert: (m) => alertes.push(m)
        });

        win.confirmerArchivage('a2025');

        expect(alertes).toEqual(['Erreur: ' + motif]);
    });
});
