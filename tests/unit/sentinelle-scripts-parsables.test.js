import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// ═══════════════════════════════════════════════════════════════════════════
// TOUT SCRIPT CHARGÉ PAR index.html DOIT SE COMPILER
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
// ▣ LE PÉRIMÈTRE EST LA LISTE DE index.html, pas le dossier `js/`. C'est ce que
// l'app charge réellement, donc ce dont la panne se voit. Le dossier contient
// aussi des fichiers de DOCUMENTATION jamais servis (`pratique-interface.js`
// décrit le contrat IPratique et porte un `export {}` au fond d'une IIFE,
// illégal en script comme en module) : les vérifier ferait rougir la suite
// pour un fichier qui n'atteint jamais un navigateur.
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
