/**
 * SENTINELLE #658 — PLUS AUCUN CONTENEUR DE COMPATIBILITÉ SOUS L'ÉDITEUR
 * D'ÉCHELLES, ET RIEN DANS `js/echelles.js` NE REND DANS UN ÉLÉMENT ABSENT.
 *
 * Jusqu'au 13 sept. 2026, index.html portait sous l'éditeur d'échelles un bloc
 * `u-hide` « Conteneurs cachés pour compatibilité » : huit `<div>` vides. Chacun
 * de ces identifiants n'existait qu'une fois dans le document, dans ce bloc :
 * aucun éditeur vivant derrière. Mais `js/echelles.js` y rendait encore, à chaque
 * entrée dans la section, et `initialiserModuleEchelles` se servait de
 * `#typeEchelle` comme garde. Du travail fait pour personne.
 *
 * VERDICT DES HUIT, mesuré avant de couper — aucun ne faisait rien d'observable :
 *   vueEchellesNiveaux     la vue de toutes les échelles et ses boutons Modifier /
 *                          Dupliquer / Supprimer : rendue, jamais affichée
 *   selectEchelleTemplate  des <option> écrites dans un <div> ; son .value lu = undefined
 *   nomEchelleContainer    classList.remove('u-hide') sous un parent qui reste u-hide
 *   typeEchelle            garde d'initialiserModuleEchelles, et un .value posé sur un <div>
 *   seuilReussite          un .value posé sur un <div>
 *   champAutreEchelle      aucun lecteur
 *   tableauNiveaux         l'ancien tableau de niveaux et ses sept gestes : invisible
 *   apercuEchelle          l'ancien aperçu : invisible
 *
 * PARTIS AVEC EUX : afficherToutesLesEchellesNiveaux, ajouterNiveauAEchelle,
 * chargerEchellesTemplates, chargerEchelleTemplate, chargerConfigurationEchelle,
 * afficherTableauNiveaux, afficherApercuEchelle, modifierNiveau et son handler,
 * ajouterNiveau, supprimerNiveau, deplacerNiveauHaut/Bas, basculerVerrouillageNiveau,
 * reinitialiserNiveauxDefaut, paletteCouleurs — et les clés nues `niveauxEchelle`
 * et `configEchelle`, qui n'avaient pas d'autre usage. La sentinelle
 * `sentinelle-522-lot2a-niveaux-echelle-serialises` part avec son sujet : les six
 * fonctions dont elle éprouvait la sérialisation n'existent plus.
 *
 * ⚠ TARIR N'EST PAS RÉPARER : les deux clés déjà écrites chez les gens restent. Plus
 * rien ne les lit, elles sont inertes. Les effacer serait un geste sur les données,
 * et ce geste revient à Grégoire (fiche #659).
 *
 * BREAK-TESTS attendus : un des huit `<div>` reposé → A rougit ; un
 * `getElementById('tableauNiveaux')` reposé dans echelles.js → B rougit ; un
 * `db.get('niveauxEchelle')` reposé → C rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, position } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const HTML = readFileSync(path.join(racine, 'index.html'), 'utf8');
const ECHELLES = readFileSync(path.join(racine, 'js/echelles.js'), 'utf8');

function fichiersJs(dossier) {
    return readdirSync(dossier).flatMap((nom) => {
        const p = path.join(dossier, nom);
        if (statSync(p).isDirectory()) return fichiersJs(p);
        return nom.endsWith('.js') ? [p] : [];
    });
}
const JS = fichiersJs(path.join(racine, 'js')).map((p) => ({ rel: path.relative(racine, p), src: readFileSync(p, 'utf8') }));

const HUIT = ['vueEchellesNiveaux', 'selectEchelleTemplate', 'nomEchelleContainer', 'typeEchelle',
              'seuilReussite', 'champAutreEchelle', 'tableauNiveaux', 'apercuEchelle'];

describe('#658 · A — index.html ne porte plus les huit conteneurs', () => {
    it('aucun des huit identifiants n\'existe dans le document', () => {
        // Règle 10 : c'est bien le document de l'éditeur qu'on lit — ses conteneurs vivants y sont.
        expect(HTML).toContain('id="tableauNiveauxEchelle"');
        expect(HTML).toContain('id="apercuEchelleNiveaux"');
        const presents = HUIT.filter((id) => HTML.includes('id="' + id + '"'));
        expect(presents, 'conteneur de compatibilité revenu').toEqual([]);
    });

    it('rien de caché ne suit la fin de l\'éditeur, jusqu\'à la fin de la sous-section', () => {
        // tranche() jette si l'un des deux marqueurs disparaît : pas de tranche vide où « rien » passerait.
        const queue = tranche(HTML, '<!-- Fin conteneurEditionEchelle -->', '<!--fin sous-section echelle-performance-->');
        expect(queue).not.toContain('u-hide');
        expect(queue).not.toContain('Conteneurs cachés pour compatibilité');
    });
});

describe('#658 · B — echelles.js ne rend dans aucun élément absent du document', () => {
    it('chaque getElementById littéral vise un id d\'index.html, ou un id forgé par le code', () => {
        const idsHtml = new Set([...HTML.matchAll(/\sid\s*=\s*"([^"$]+)"/g)].map((m) => m[1]));
        // Un id forgé par le code : écrit en `id="…"` dans un gabarit, ou passé comme `modalId`
        // à BibliothequeUI, qui pose l'attribut. Calculé, pas listé : une liste s'use.
        const forges = new Set();
        for (const { src } of JS) {
            for (const m of src.matchAll(/id=\\?"([A-Za-z][\w-]*)\\?"/g)) forges.add(m[1]);
            for (const m of src.matchAll(/modalId:\s*'([\w-]+)'/g)) forges.add(m[1]);
            // #1155 (25 oct. 2026) — RÉANCRÉ : la fenêtre en deux colonnes pose aussi les ids que le
            // module lui passe en configuration (le sélecteur et l'aperçu de l'import d'un autre
            // trimestre, le champ de fichier du menu « Importer ou exporter ▾ »).
            for (const m of src.matchAll(/(?:selectId|apercuId|idListe):\s*'([\w-]+)'/g)) forges.add(m[1]);
            for (const m of src.matchAll(/champsFichier:\s*\[\{\s*id:\s*'([\w-]+)'/g)) forges.add(m[1]);
        }
        const lus = [...ECHELLES.matchAll(/getElementById\(\s*'([^'$]+)'\s*\)/g)].map((m) => m[1]);
        // Règle 10 : le motif trouve bien les lectures du module.
        expect(lus.length, 'getElementById littéraux dans echelles.js').toBeGreaterThan(15);
        const absents = [...new Set(lus.filter((id) => !idsHtml.has(id) && !forges.has(id)))];
        expect(absents, 'echelles.js lit un élément que personne ne pose').toEqual([]);
    });
});

describe('#658 · C — les clés nues `niveauxEchelle` et `configEchelle` n\'ont plus d\'accès', () => {
    it('aucun fichier de js/ ne les lit ni ne les écrit', () => {
        const acces = /(?:db\.\w+|localStorage\.\w+)\(\s*['"](niveauxEchelle|configEchelle)['"]/g;
        // Règle 10 : on a bien lu js/, et le même motif trouve les accès d'une clé vivante.
        expect(JS.length, 'fichiers de js/ lus').toBeGreaterThan(150);
        const vivante = JS.reduce((n, f) => n + (f.src.match(/db\.\w+\(\s*'modeApplication'/g) || []).length, 0);
        expect(vivante, 'le motif trouve les accès d\'une clé vivante').toBeGreaterThan(0);
        const trouves = JS.flatMap(({ rel, src }) => [...src.matchAll(acces)].map((m) => rel + ' : ' + m[0]));
        expect(trouves).toEqual([]);
    });
});

describe('#658 · D — les fonctions de l\'ancien éditeur sont parties', () => {
    const PARTIES = ['afficherToutesLesEchellesNiveaux', 'ajouterNiveauAEchelle', 'chargerEchellesTemplates',
        'chargerEchelleTemplate', 'chargerConfigurationEchelle', 'afficherTableauNiveaux', 'afficherApercuEchelle',
        'modifierNiveau', 'modifierNiveauHandler', 'ajouterNiveau', 'supprimerNiveau', 'deplacerNiveauHaut',
        'deplacerNiveauBas', 'basculerVerrouillageNiveau', 'reinitialiserNiveauxDefaut'];

    it('ni définition, ni export sur window', () => {
        // Règle 10 : l'éditeur vivant, lui, est là — position() jette sinon.
        position(ECHELLES, 'function afficherNiveauxEchelle(');
        const restes = PARTIES.filter((f) => new RegExp('function\\s+' + f + '\\s*\\(|window\\.' + f + '\\s*=').test(ECHELLES));
        expect(restes).toEqual([]);
    });
});
