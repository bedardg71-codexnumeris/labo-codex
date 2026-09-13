import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

// ═══════════════════════════════════════════════════════════════════════════
// LA BOUCLE index.html ⇄ DOSSIER js/, FERMÉE PAR SES DEUX BOUTS
//
//   1. tout script que index.html charge existe sur le disque et se compile ;
//   2. tout fichier `.js` du disque est ATTEINT par quelque chose (#657).
//
// Les deux sens vivent ici parce qu'ils partagent le même parsing de
// index.html (`scriptsCharges`) : un second fichier avec sa propre regex
// ferait deux vérités pour une seule liste.
// ═══════════════════════════════════════════════════════════════════════════
//
// ─── SENS 1 : TOUT SCRIPT CHARGÉ PAR index.html DOIT SE COMPILER ───────────
//
// 15 août 2026 — `js/changelog-data.js` était EN PRODUCTION avec un guillemet
// fermant manquant (« pour s’en passer., » au lieu de « pour s’en passer.', »).
// Le fichier ENTIER ne parsait pas, donc `genererChangelogHTML` n'existait
// pas, donc la section « Nouvelles » de l'accueil rendait le vide.
//
// ⚠ ET LA PANNE ÉTAIT MUETTE. `init-inline.js:341` garde son appel derrière un
// `typeof genererChangelogHTML === 'function'` : la fonction absente, la
// section reste simplement vide. Pas de message, pas de trace dans l'interface
// — seulement une erreur en console que personne ne lit.
//
// ⚠ LA SUITE COMPTAIT 2450 TESTS VERTS PENDANT CE TEMPS. Aucun ne chargeait ce
// fichier : une sentinelle couvre le module qu'elle exerce, et un fichier que
// personne n'exerce n'est couvert par personne. Le trou n'était donc dans
// aucune sentinelle en particulier — il était dans l'absence d'un contrôle de
// PLANCHER, valable pour tous les fichiers d'un coup.
//
// ▣ L'ORACLE EST `vm.Script`, ET CE CHOIX EST LE CŒUR DU TEST. index.html
// charge ces fichiers en `<script src>`, c'est-à-dire en SCRIPTS CLASSIQUES ;
// `vm.Script` compile exactement dans ce mode, sans EXÉCUTER (aucun effet de
// bord, pas de `window` à simuler). `node --check` a été essayé d'abord et
// ÉCARTÉ : il auto-détecte le format et rend 0 sur un fichier que le
// navigateur refuse — mesuré sur `pratiques/pratique-interface.js`, y compris
// sur une version volontairement cassée. L'oracle tamponnait n'importe quoi,
// et c'est un break-test resté VERT qui l'a dit.
//
// ▣ LE PÉRIMÈTRE DE CE SENS EST LA LISTE DE index.html, pas le dossier `js/`.
// C'est ce que l'app charge réellement, donc ce dont la panne se voit. Le
// dossier contient aussi un fichier de DOCUMENTATION jamais servi
// (`pratique-interface.js` décrit le contrat IPratique et porte un `export {}`
// au fond d'une IIFE, illégal en script comme en module) : le compiler ferait
// rougir la suite pour un fichier qui n'atteint jamais un navigateur.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

/** Les `<script src="…">` locaux de index.html, sans leur paramètre anti-cache. */
function scriptsCharges() {
    const trouves = [];
    const motif = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = motif.exec(indexHtml)) !== null) {
        const src = m[1];
        if (/^(https?:)?\/\//.test(src)) continue;   // rien d'externe (CSP : il n'y en a pas)
        trouves.push(src.split('?')[0]);
    }
    return [...new Set(trouves)];
}

const scripts = scriptsCharges();

describe('plancher — tout script chargé par index.html se compile', () => {
    it('trouve bien la liste des scripts (sinon le test ne prouve RIEN)', () => {
        // ⚠ Sans ce garde, une regex qui cesse de matcher viderait la liste et
        // les vérifications ci-dessous passeraient en n'en faisant AUCUNE :
        // `it.each([])` est vert. C'est la panne la plus probable de ce fichier,
        // et la seule qu'aucune des autres assertions ne peut voir.
        expect(scripts.length).toBeGreaterThan(100);
        expect(scripts).toContain('js/changelog-data.js');
    });

    it.each(scripts)('%s se compile comme script classique', (src) => {
        const complet = path.join(racineProjet, src);
        // Un `src` qui ne pointe sur rien est une panne au moins aussi grave
        // qu'une erreur de syntaxe : le fichier ne se charge pas du tout.
        expect(existsSync(complet), `${src} : référencé par index.html mais absent du disque`).toBe(true);
        expect(() => new vm.Script(readFileSync(complet, 'utf8'), { filename: src }))
            .not.toThrow();
    });
});

// ─── SENS 2 : TOUT FICHIER js/ DU DISQUE EST ATTEINT PAR QUELQUE CHOSE (#657) ─
//
// Un fichier `js/` neuf sans balise `<script>` produit un `window.X` undefined
// au premier usage réel, et RIEN ne l'attrape en amont : un banc qui monte le
// module par `chargerScript` le lit directement sur le disque, donc il reste
// vert. Le vert du banc n'atteste pas que l'application charge le module.
//
// ▣ « ATTEINT » = NOMMÉ, et ça se mesure — pas de liste de tolérance par nom
// de fichier (elle se périme le jour où on l'allonge pour faire passer un
// vrai oubli). Un fichier est atteint si son chemin est :
//   · dans un `<script src>` d'index.html (la liste du sens 1), OU
//   · un littéral de chaîne du CODE d'un autre fichier `js/`, seul ou suivi de
//     son `?v=` — c'est ce qui attrape `new Worker('js/heic-worker.js?v=…')`
//     (heic-decodeur.js) et `script.src = 'js/pack-demo-10.js?v=…'`
//     (demo-namespace.js) sans les nommer ici.
//
// ⚠ LES COMMENTAIRES NE COMPTENT PAS, et c'est pourquoi les littéraux sont
// lus après un passage par esbuild (un vrai parseur, déjà là par vitest →
// vite) plutôt qu'à la regex sur le source brut. Ce code cite des chemins
// entre accents graves dans ses commentaires : mesuré le 13 sept. 2026,
// `js/_archives/entites-ui.js` y est « nommé » deux fois
// (trimestre-v2-etudiants.js, entites/groupe-cours.js) sans être chargé par
// personne. Une regex sur le brut aurait tamponné un oubli parce qu'un
// commentaire en parle.
//
// ▣ HORS PÉRIMÈTRE, PAR DOSSIER : `js/_archives/` — du code retiré, conservé
// pour mémoire, qu'aucune page ne doit charger.
//
// ▣ UNE SEULE EXCEPTION NOMMÉE, et elle doit le rester (garde plus bas) :
// `js/pratiques/pratique-interface.js`, documentation du contrat IPratique,
// jamais servie — son `export {}` est illégal en script classique (voir le
// sens 1). Si un deuxième fichier réclame une exception, ne l'ajoute pas :
// c'est la règle d'« atteint » qui est trop étroite, ou c'est un vrai défaut.

const DOSSIER_HORS_PERIMETRE = 'js/_archives/';
const EXCEPTION_DOCUMENTATION = 'js/pratiques/pratique-interface.js';

/** Tous les `.js` sous `js/`, en chemins « js/… » à barres obliques, hors archives. */
function fichiersDuDisque() {
    return readdirSync(path.join(racineProjet, 'js'), { recursive: true })
        .map((f) => 'js/' + f.split(path.sep).join('/'))
        .filter((f) => f.endsWith('.js'))
        .filter((f) => !f.startsWith(DOSSIER_HORS_PERIMETRE));
}

const fichiers = fichiersDuDisque();
const estExclu = (f) => f === EXCEPTION_DOCUMENTATION;
const exclus = fichiers.filter(estExclu);
const aVerifier = fichiers.filter((f) => !estExclu(f));

/**
 * Chemin nommé → fichiers `js/` dont le CODE le cite en littéral. L'exception
 * n'est pas une source : elle n'est jamais exécutée, ses chaînes ne chargent rien.
 */
function nommesDansLeCode() {
    const nommesPar = new Map();
    // Littéral entre ", ' ou ` sur une ligne. Sur la sortie d'esbuild il n'y a
    // plus de commentaire pour ouvrir un faux littéral sur une apostrophe.
    const motif = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
    for (const source of aVerifier) {
        const code = transformSync(readFileSync(path.join(racineProjet, source), 'utf8'), { loader: 'js' }).code;
        let m;
        while ((m = motif.exec(code)) !== null) {
            const chemin = m[2].split('?')[0];
            if (!chemin.endsWith('.js')) continue;
            if (!nommesPar.has(chemin)) nommesPar.set(chemin, new Set());
            nommesPar.get(chemin).add(source);
        }
    }
    return nommesPar;
}

const nommesPar = nommesDansLeCode();

/** Un fichier qui se nomme lui-même ne s'est pas chargé pour autant. */
const estAtteint = (f) =>
    scripts.includes(f) || [...(nommesPar.get(f) ?? [])].some((source) => source !== f);

describe('plancher — tout fichier js/ du disque est atteint par quelque chose (#657)', () => {
    it('trouve bien les fichiers du disque (sinon le test ne prouve RIEN)', () => {
        // ⚠ Jumeau du garde du sens 1 : un mauvais chemin, une mauvaise
        // extension ou un `readdir` non récursif videraient la liste, et
        // `it.each([])` est vert. `js/config.js` sert de témoin parce qu'il est
        // en zone protégée (CLAUDE.md) : il ne bougera pas avec un chantier.
        expect(fichiers.length).toBeGreaterThan(150);
        expect(fichiers).toContain('js/config.js');
    });

    it("l'exception unique ne couvre qu'un fichier, et il est encore inatteint", () => {
        // Élargir l'exception (à un dossier, à un motif) laisserait passer un
        // vrai oubli à côté d'elle. Et une exception devenue inutile — le
        // fichier chargé un jour, ou supprimé — doit partir, pas rester là
        // à excuser le prochain.
        expect(exclus).toEqual([EXCEPTION_DOCUMENTATION]);
        expect(estAtteint(EXCEPTION_DOCUMENTATION)).toBe(false);
    });

    it.each(aVerifier)('%s est atteint', (f) => {
        expect(
            estAtteint(f),
            `${f} : sur le disque mais chargé par rien — ni <script src> dans index.html, `
            + 'ni littéral de chaîne dans le code d\'un autre fichier js/',
        ).toBe(true);
    });
});
