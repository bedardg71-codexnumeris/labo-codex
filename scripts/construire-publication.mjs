#!/usr/bin/env node
// CONSTRUIRE LE RÉPERTOIRE DE PUBLICATION (16 octobre 2026)
//
// Netlify publiait la racine du dépôt (`publish = "."`) : tout l'arbre, documents
// de travail compris, partait en ligne à chaque déploiement, et chaque aperçu ou
// permalien en gardait une copie. Ce script copie dans `publication/` la SEULE
// liste blanche des fichiers que l'application charge ; Netlify publie ce dossier.
//
// Liste BLANCHE, pas liste noire : un document ajouté au dépôt ne sort jamais par
// défaut. Le risque inverse (un fichier de l'application oublié) est gardé par
// tests/unit/sentinelle-publication-liste-blanche.test.js, qui vérifie que tout
// ce que l'application référence existe dans le dossier construit.
//
// Aucune dépendance : Node seul (image de build de Netlify).
// Usage : node scripts/construire-publication.mjs [destination]

import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FICHIERS_RACINE = ['index.html', 'styles.css', 'version.js', 'version.json'];
export const DOSSIERS = ['js', 'css', 'icons', 'libs', 'img', 'autocollants'];

// Jamais publiés, même à l'intérieur d'un dossier de la liste blanche.
const EXCLUS = /(^|\/)(\.DS_Store|[^/]*\.md)$/i;

const racineDepot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function construire(destination, racine = racineDepot) {
    rmSync(destination, { recursive: true, force: true });
    mkdirSync(destination, { recursive: true });
    for (const f of FICHIERS_RACINE) {
        const source = path.join(racine, f);
        if (!existsSync(source)) throw new Error(`Fichier de la liste blanche absent : ${f}`);
        cpSync(source, path.join(destination, f));
    }
    for (const d of DOSSIERS) {
        const source = path.join(racine, d);
        if (!existsSync(source)) throw new Error(`Dossier de la liste blanche absent : ${d}/`);
        cpSync(source, path.join(destination, d), {
            recursive: true,
            filter: (s) => !EXCLUS.test(path.relative(racine, s).split(path.sep).join('/')),
        });
    }
    return lister(destination);
}

// Chemins relatifs (séparateur « / ») de tous les fichiers sous `dossier`.
export function lister(dossier, prefixe = '') {
    const out = [];
    for (const nom of readdirSync(dossier)) {
        const complet = path.join(dossier, nom);
        const relatif = prefixe ? `${prefixe}/${nom}` : nom;
        if (statSync(complet).isDirectory()) out.push(...lister(complet, relatif));
        else out.push(relatif);
    }
    return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const destination = path.resolve(process.argv[2] || path.join(racineDepot, 'publication'));
    const fichiers = construire(destination);
    console.warn(`Publication construite : ${fichiers.length} fichiers dans ${path.relative(process.cwd(), destination) || '.'}`);
}
