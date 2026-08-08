import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #414 — LE PORTILLON UNIQUE D'ATTENTE DE LA DB (8 août 2026).
//
// ORIGINE. #413 (7 août) a montré qu'un écouteur `db-ready` posé après
// l'émission ne se déclenche jamais : le bloc de migrations de main.js était
// sauté EN SILENCE. L'audit des 14 autres écouteurs a trouvé bien pire qu'une
// répétition de la même course — TROIS familles de défauts, qu'aucune lecture
// d'un site isolé ne pouvait révéler :
//
//   1. LA COURSE — écouteur posé trop tard, aucun rattrapage.
//   2. LA MAUVAISE CIBLE — `document.addEventListener('db-ready', …)`, alors
//      que `db.js` émet sur `window` et l'a toujours fait. Un événement émis
//      sur `window` ne descend pas vers `document` : l'écouteur est MORT-NÉ.
//      `preferences.js` (migration V3, 16 avril 2026) et `donnees-v2.js`
//      (18 décembre 2025) n'ont donc JAMAIS tourné, sans une seule erreur.
//   3. LE MAUVAIS DRAPEAU — `db.ready` est vrai dès la fin d'`init()`, donc
//      AVANT `syncToLocalStorageCache()` : une migration qui s'y fie lit un
//      `memoryCache` non hydraté, migre des données incomplètes et pose son
//      drapeau « fait ». Et `db.isReady`, testée par deux fichiers, n'a jamais
//      existé — la garde était toujours fausse.
//
// CE QUI EST VERROUILLÉ ICI, en deux temps :
//   • le COMPORTEMENT du portillon, en exécutant sa vraie source (§1) — une
//     sentinelle qui se contenterait de constater que le code est écrit ne
//     verrait pas un rattrapage qui ne rattrape rien ;
//   • le CLIQUET (§2) — plus aucun site ne réécrit ce geste à la main. C'est
//     lui qui empêche la 10e variante, et donc la 4e famille de défauts.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');
const sourceDb = readFileSync(path.join(dossierJs, 'db.js'), 'utf8');

// --- Outillage -------------------------------------------------------------

// Retire commentaires de ligne et de bloc. Indispensable ici : ce chantier a
// DOCUMENTÉ les défauts qu'il corrige (« la garde était `db.isReady` »), donc
// un scan naïf trouverait les motifs interdits dans les commentaires qui
// expliquent pourquoi ils sont interdits.
function sansCommentaires(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function fichiersJsCharges() {
    const resultat = [];
    (function parcourir(dossier) {
        for (const entree of readdirSync(dossier)) {
            const complet = path.join(dossier, entree);
            if (statSync(complet).isDirectory()) {
                // `_archives/` n'est chargé par aucune balise <script> d'index.html
                // (vérifié au chantier #414) : son contenu ne s'exécute jamais.
                if (entree !== '_archives') parcourir(complet);
            } else if (entree.endsWith('.js')) {
                resultat.push(complet);
            }
        }
    })(dossierJs);
    return resultat;
}

// Source réelle de `auDbPret`, isolée du reste de db.js. Les assertions doivent
// porter sur ELLE : db.js contient aussi l'ÉMETTEUR (`window.dbReady = true`,
// `dispatchEvent`), de quoi satisfaire par accident une recherche naïve.
const sourceAuDbPret = (() => {
    const debut = sourceDb.indexOf('function auDbPret(');
    const fin = sourceDb.indexOf('window.auDbPret = auDbPret', debut);
    if (debut === -1 || fin <= debut) {
        throw new Error('auDbPret introuvable ou non exporté dans js/db.js');
    }
    return sourceDb.slice(debut, fin);
})();

// Instancie le VRAI code du portillon dans un window de laboratoire. C'est ce
// qui rend cette sentinelle comportementale : on n'observe pas que le code est
// écrit, on le fait tourner.
function instancierPortillon(fenetre) {
    return new Function('window', `${sourceAuDbPret}\nreturn auDbPret;`)(fenetre);
}

function fenetreDeLaboratoire({ dbReady = false } = {}) {
    const ecouteurs = new Map();
    return {
        dbReady,
        addEventListener(type, fn) {
            if (!ecouteurs.has(type)) ecouteurs.set(type, []);
            ecouteurs.get(type).push(fn);
        },
        removeEventListener(type, fn) {
            const liste = ecouteurs.get(type) || [];
            const i = liste.indexOf(fn);
            if (i > -1) liste.splice(i, 1);
        },
        // Rejoue ce que fait `syncToLocalStorageCache()` : le drapeau PUIS
        // l'événement. L'ordre compte — c'est de son inversion que naîtrait
        // une fenêtre où un rattrapage lirait des données non hydratées.
        emettreDbReady() {
            this.dbReady = true;
            [...(ecouteurs.get('db-ready') || [])].forEach((fn) => fn({ detail: {} }));
        },
        nbEcouteurs(type) {
            return (ecouteurs.get(type) || []).length;
        }
    };
}

// --- §1 · COMPORTEMENT DU PORTILLON ---------------------------------------

describe('#414 · le portillon auDbPret — comportement', () => {
    it('DB pas encore prête : le rappel attend, puis part à l’émission', () => {
        const fenetre = fenetreDeLaboratoire();
        const auDbPret = instancierPortillon(fenetre);
        const appels = [];

        auDbPret(() => appels.push('x'));
        expect(appels, 'exécuté avant que la DB soit prête').toHaveLength(0);

        fenetre.emettreDbReady();
        expect(appels).toHaveLength(1);
    });

    it('⭐ DB DÉJÀ prête : le rappel part quand même — c’est tout le sujet de #413', () => {
        // Le cas qui a sauté toutes les migrations du boot : l'événement était
        // passé, l'écouteur arrivait après, et plus rien ne se produisait.
        const fenetre = fenetreDeLaboratoire({ dbReady: true });
        const auDbPret = instancierPortillon(fenetre);
        const appels = [];

        auDbPret(() => appels.push('x'));

        expect(appels, 'le rattrapage n’a pas eu lieu : la course de #413 est rouverte').toHaveLength(1);
    });

    it('rattrapage + réémission : le rappel ne part QU’UNE fois (défaut once)', () => {
        // Une migration rejouée n'est pas censée nuire (drapeaux d'idempotence),
        // mais compter sur cette idempotence serait un pari, pas une garantie.
        const fenetre = fenetreDeLaboratoire({ dbReady: true });
        const auDbPret = instancierPortillon(fenetre);
        const appels = [];

        auDbPret(() => appels.push('x'));
        fenetre.emettreDbReady();

        expect(appels).toHaveLength(1);
        expect(fenetre.nbEcouteurs('db-ready'), 'l’écouteur one-shot n’a pas été retiré').toBe(0);
    });

    it('once:false : rejoué à chaque db-ready — c’est le cas de l’import', () => {
        // `db-ready` est réémis après un import. Ce qui doit se relire (grilles
        // importées, mode démo, caches) s'abonne avec once:false.
        const fenetre = fenetreDeLaboratoire();
        const auDbPret = instancierPortillon(fenetre);
        const appels = [];

        auDbPret(() => appels.push('x'), { once: false });
        fenetre.emettreDbReady();
        fenetre.emettreDbReady();

        expect(appels).toHaveLength(2);
    });

    it('once:false ET DB déjà prête : rattrapage immédiat SANS perdre l’abonnement', () => {
        // Le piège du portillon : rattraper puis oublier de rester abonné.
        // C'est exactement ce que fait main.js — le rattrapage ne doit pas
        // coûter les réémissions futures.
        const fenetre = fenetreDeLaboratoire({ dbReady: true });
        const auDbPret = instancierPortillon(fenetre);
        const appels = [];

        auDbPret(() => appels.push('x'), { once: false });
        expect(appels, 'pas de rattrapage').toHaveLength(1);

        fenetre.emettreDbReady();
        expect(appels, 'l’abonnement a été perdu au rattrapage').toHaveLength(2);
    });

    it('un rappel absent ou non-fonction ne fait pas tomber le boot', () => {
        const fenetre = fenetreDeLaboratoire({ dbReady: true });
        const auDbPret = instancierPortillon(fenetre);

        expect(() => auDbPret(undefined)).not.toThrow();
        expect(() => auDbPret('pas une fonction')).not.toThrow();
    });

    it('l’abonnement est posé AVANT le rattrapage', () => {
        // Ordre non négociable : rattraper d'abord puis s'abonner laisserait
        // filer un db-ready émis entre les deux — la course, réintroduite dans
        // le portillon même qui doit la fermer.
        const posAbonnement = sourceAuDbPret.indexOf("window.addEventListener('db-ready', executer)");
        const posRattrapage = sourceAuDbPret.search(/if\s*\(\s*window\.dbReady\s*\)/);
        expect(posAbonnement).toBeGreaterThan(-1);
        expect(posRattrapage).toBeGreaterThan(posAbonnement);
    });

    it('le portillon lit window.dbReady — ni db.ready, ni db.isReady', () => {
        const code = sansCommentaires(sourceAuDbPret);
        expect(code).toMatch(/window\.dbReady/);
        // `db.ready` est vrai trop tôt (avant la synchro), `db.isReady` n'existe pas.
        expect(code).not.toMatch(/db\.ready\b/);
        expect(code).not.toMatch(/db\.isReady\b/);
    });
});

// --- §2 · LE CLIQUET -------------------------------------------------------

describe('#414 · cliquet — un seul endroit sait attendre la DB', () => {
    const fichiers = fichiersJsCharges();

    it('l’inventaire des fichiers scannés n’est pas vide', () => {
        // Sans ce garde-fou, une erreur de chemin rendrait TOUS les tests de
        // cette section verts en ne scannant rien.
        expect(fichiers.length).toBeGreaterThan(50);
    });

    it('aucun écouteur `db-ready` brut hors du portillon', () => {
        const coupables = fichiers
            .filter((f) => path.basename(f) !== 'db.js')
            .filter((f) => /addEventListener\(\s*['"]db-ready['"]/.test(sansCommentaires(readFileSync(f, 'utf8'))))
            .map((f) => path.relative(racineProjet, f));

        expect(
            coupables,
            `Ces fichiers attendent db-ready à la main au lieu de window.auDbPret() : ${coupables.join(', ')}. ` +
            'C\'est la 10e variante que #414 a précisément supprimée — chaque réécriture rouvre les trois familles de défauts.'
        ).toEqual([]);
    });

    it('personne n’écoute db-ready sur `document` — l’événement est émis sur `window`', () => {
        // Défaut mort-né, jamais une régression : db.js n'a jamais émis sur
        // `document`. Deux fichiers l'ont pourtant fait pendant des mois.
        const coupables = fichiers
            .filter((f) => /document\.addEventListener\(\s*['"]db-ready['"]/.test(sansCommentaires(readFileSync(f, 'utf8'))))
            .map((f) => path.relative(racineProjet, f));

        expect(coupables, `Écouteurs mort-nés (cible document) : ${coupables.join(', ')}`).toEqual([]);
    });

    it('plus aucune garde `db.isReady` — la propriété n’existe pas', () => {
        // Toujours `undefined`, donc garde toujours fausse : le code protégé
        // ne s'exécutait jamais, et la branche `else` passait pour le cas normal.
        expect(sansCommentaires(sourceDb)).not.toMatch(/\bisReady\b/);

        const coupables = fichiers
            .filter((f) => /\bdb\.isReady\b/.test(sansCommentaires(readFileSync(f, 'utf8'))))
            .map((f) => path.relative(racineProjet, f));

        expect(coupables, `Gardes toujours fausses : ${coupables.join(', ')}`).toEqual([]);
    });

    it('`db.ready` ne garde plus aucune ÉCRITURE — il est vrai avant la synchro', () => {
        // `db.ready` reste légitime pour « init() a-t-il tourné ? » avant un
        // `await db.get()` (lecture qui retombe sur IndexedDB, donc autoritaire).
        // Ce qu'il ne peut PAS garder, c'est une écriture conditionnée à une
        // lecture de memoryCache : sur le créneau init()→synchro, le cache est
        // vide et l'écriture écrase des données réelles par des défauts.
        // C'était le cas de `raccourcisAnnotation` dans travaux-outils.js.
        const coupables = [];
        for (const fichier of fichiers) {
            if (path.basename(fichier) === 'db.js') continue;
            const code = sansCommentaires(readFileSync(fichier, 'utf8'));
            const motif = /if\s*\(\s*db\.ready\s*\)\s*\{([\s\S]{0,300}?)\}/g;
            for (const trouve of code.matchAll(motif)) {
                if (/db\.(set|setSync|remove|removeSync)\s*\(/.test(trouve[1])) {
                    coupables.push(path.relative(racineProjet, fichier));
                }
            }
        }
        expect(
            [...new Set(coupables)],
            'Écriture gardée par db.ready : le drapeau est vrai avant syncToLocalStorageCache(), ' +
            'donc la garde ne protège pas de ce qu’elle prétend protéger. Utiliser window.dbReady.'
        ).toEqual([]);
    });

    it('les migrations du boot passent bien par le portillon', () => {
        // Les trois migrations que l'audit a trouvées mal branchées. Si l'une
        // se redétache du portillon, elle redevient silencieusement morte.
        const attendus = [
            ['preferences.js', 'migrerPreferencesV3'],
            ['travaux-outils.js', 'migrerIdsActionsRLO'],
            ['actions-rlo.js', 'migrerActionsRLOEvaluations']
        ];
        for (const [fichier, fonction] of attendus) {
            const code = readFileSync(path.join(dossierJs, fichier), 'utf8');
            expect(
                code,
                `${fichier} : ${fonction} n’est plus confiée à window.auDbPret`
            ).toMatch(new RegExp(`window\\.auDbPret\\(\\s*${fonction}`));
        }
    });
});
