/**
 * complexite.js — la mesure de la complexité de js/ (lot 24, 12 oct. 2026, « contenir »).
 *
 * POURQUOI CE MODULE EXISTE. Une simplification est reprise par la croissance si rien ne retient
 * la complexité pendant qu'on la réduit (mesuré depuis mai : `executerImportSelectif` 118 → 130,
 * les fonctions au-dessus de 30 de 80 à 91). Le banc `sentinelle-contenir-complexite` importe ce
 * module ; lancé à la main (`node tests/unit/_helpers/complexite.js`, depuis la racine ou tests/),
 * il imprime les chiffres du tableau de bord (ETAT-PROJET.md §00).
 *
 * DÉFINITION : celle de la règle `complexity` d'ESLint 8.57, comme la mesure de mai, pour garder la
 * comparaison possible. 1 par fonction, +1 par `if`, `?:`, `&&` / `||` / `??`, `for` / `for…in` /
 * `for…of`, `while` / `do…while`, `catch`, `case` avec test, affectation logique (`&&=`, `||=`,
 * `??=`). Ne comptent PAS : le chaînage optionnel, les paramètres par défaut (ESLint 9 les compte).
 * Une fonction imbriquée est mesurée à part ; elle ne pèse pas sur sa mère.
 *
 * IDENTITÉ d'une fonction : fichier + nom (déclaration, variable, propriété, méthode, affectation :
 * `window.x = function`, `obj.x = () =>`). Sans nom : « (anonyme) ».
 *
 * LIGNES DE CODE : les lignes qui portent au moins un jeton (un jeton sur plusieurs lignes, comme
 * un gabarit, les porte toutes).
 *
 * Parseur : acorn (devDependency de tests/, jamais chargé par l'application).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

/** Fichiers qui portent l'extension .js sans être du JavaScript : exclus, et nommés. */
export const NON_ANALYSABLES_ATTENDUS = ['js/pratiques/pratique-interface.js'];

/** Fichiers de données, hors de la règle de taille (mesurés quand même). */
export const FICHIERS_DE_DONNEES = ['js/changelog-data.js', 'js/pack-demo-10.js'];

const OPTIONS = { ecmaVersion: 'latest', locations: true, allowHashBang: true };

function lister(racine, dossier) {
    return readdirSync(path.join(racine, dossier), { withFileTypes: true }).flatMap((e) => {
        if (e.isDirectory()) return e.name === '_archives' ? [] : lister(racine, path.join(dossier, e.name));
        return e.name.endsWith('.js') ? [path.join(dossier, e.name).split(path.sep).join('/')] : [];
    });
}

function analyser(source) {
    try {
        return acorn.parse(source, { ...OPTIONS, sourceType: 'script' });
    } catch (e) {
        return acorn.parse(source, { ...OPTIONS, sourceType: 'module' });
    }
}

function nomDe(cle) {
    if (!cle) return null;
    if (cle.type === 'Identifier') return cle.name;
    if (cle.type === 'PrivateIdentifier') return '#' + cle.name;
    if (cle.type === 'Literal') return String(cle.value);
    if (cle.type === 'MemberExpression') return nomDe(cle.property);
    return null;
}

const EST_FONCTION = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const AFFECTATIONS_LOGIQUES = new Set(['&&=', '||=', '??=']);

/** Mesure un source : [{ nom, ligne, cyc }] pour chaque fonction. */
export function mesurerSource(source) {
    const ast = analyser(source);
    const fonctions = [];
    // Parcours avec le parent, pour nommer une fonction par ce qui la reçoit.
    const visiter = (noeud, parent, pile) => {
        if (!noeud || typeof noeud.type !== 'string') return;
        let courante = pile;
        if (EST_FONCTION.has(noeud.type)) {
            let nom = noeud.id ? noeud.id.name : null;
            if (!nom && parent) {
                if (parent.type === 'VariableDeclarator') nom = nomDe(parent.id);
                else if (parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') nom = nomDe(parent.key);
                else if (parent.type === 'AssignmentExpression') nom = nomDe(parent.left);
            }
            const f = { nom: nom || '(anonyme)', ligne: noeud.loc.start.line, cyc: 1 };
            fonctions.push(f);
            courante = f;
        } else if (courante) {
            switch (noeud.type) {
                case 'IfStatement': case 'ConditionalExpression': case 'LogicalExpression':
                case 'ForStatement': case 'ForInStatement': case 'ForOfStatement':
                case 'WhileStatement': case 'DoWhileStatement': case 'CatchClause':
                    courante.cyc++; break;
                case 'SwitchCase': if (noeud.test) courante.cyc++; break;
                case 'AssignmentExpression': if (AFFECTATIONS_LOGIQUES.has(noeud.operator)) courante.cyc++; break;
                default: break;
            }
        }
        for (const cle of Object.keys(noeud)) {
            if (cle === 'loc' || cle === 'start' || cle === 'end') continue;
            const v = noeud[cle];
            if (Array.isArray(v)) { for (const x of v) if (x && typeof x.type === 'string') visiter(x, noeud, courante); }
            else if (v && typeof v.type === 'string') visiter(v, noeud, courante);
        }
    };
    visiter(ast, null, null);
    return fonctions;
}

/** Lignes qui portent au moins un jeton. */
export function lignesDeCode(source) {
    const lignes = new Set();
    for (const t of acorn.tokenizer(source, { ...OPTIONS, sourceType: 'script', onComment: () => {} })) {
        for (let l = t.loc.start.line; l <= t.loc.end.line; l++) lignes.add(l);
    }
    return lignes.size;
}

/**
 * Mesure tout js/ (hors `js/_archives/`).
 * @returns {{ fichiers: number, fonctions: Array<{fichier, nom, ligne, cyc}>, lignes: Object<string, number>,
 *             nonAnalysables: string[] }}
 */
export function mesurerDepot(racine) {
    const fonctions = [], lignes = {}, nonAnalysables = [];
    let fichiers = 0;
    for (const f of lister(racine, 'js').sort()) {
        const source = readFileSync(path.join(racine, f), 'utf8');
        let mesure;
        try {
            mesure = mesurerSource(source);
            lignes[f] = lignesDeCode(source);
        } catch (e) {
            nonAnalysables.push(f);
            continue;
        }
        fichiers++;
        for (const x of mesure) fonctions.push({ fichier: f, ...x });
    }
    return { fichiers, fonctions, lignes, nonAnalysables };
}

/** Les chiffres du tableau de bord. */
export function resumer(m) {
    const au15 = m.fonctions.filter((f) => f.cyc > 15);
    const gros = Object.entries(m.lignes).filter(([, n]) => n > 1000).sort((a, b) => b[1] - a[1]);
    return {
        fichiers: m.fichiers,
        fonctions: m.fonctions.length,
        auDessusDe15: au15.length,
        auDessusDe30: m.fonctions.filter((f) => f.cyc > 30).length,
        maximum: m.fonctions.reduce((a, f) => Math.max(a, f.cyc), 0),
        sommeAuDessusDe15: au15.reduce((a, f) => a + f.cyc, 0),
        lignesDeCode: Object.values(m.lignes).reduce((a, n) => a + n, 0),
        grosFichiers: gros
    };
}

/**
 * Les fonctions au-dessus de 30, par fichier : { fichier: { nom: cyc } }, et pour les anonymes
 * (ou un nom porté deux fois dans le même fichier) une liste triée sous « (anonyme) » / le nom.
 */
export function figer(m, seuil = 30) {
    const sortie = {};
    for (const f of m.fonctions.filter((x) => x.cyc > seuil)) {
        const parFichier = sortie[f.fichier] || (sortie[f.fichier] = {});
        (parFichier[f.nom] || (parFichier[f.nom] = [])).push(f.cyc);
    }
    for (const parFichier of Object.values(sortie)) {
        for (const nom of Object.keys(parFichier)) {
            const v = parFichier[nom].sort((a, b) => b - a);
            parFichier[nom] = v.length === 1 ? v[0] : v;
        }
    }
    return sortie;
}

// Lancé à la main : imprime le tableau de bord.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const ici = path.dirname(fileURLToPath(import.meta.url));
    const racine = path.resolve(ici, '..', '..', '..');
    const debut = Date.now();
    const m = mesurerDepot(racine);
    const r = resumer(m);
    const lignes = [
        `Complexité de js/ (définition ESLint 8.57) — ${r.fichiers} fichiers, ${r.fonctions} fonctions, ${Date.now() - debut} ms`,
        `  au-dessus de 15 : ${r.auDessusDe15} (somme des complexités : ${r.sommeAuDessusDe15})`,
        `  au-dessus de 30 : ${r.auDessusDe30} · maximum : ${r.maximum}`,
        `  lignes de code : ${r.lignesDeCode} · fichiers au-dessus de 1 000 : ${r.grosFichiers.length}`,
        ...r.grosFichiers.map(([f, n]) => `    ${n}  ${f}${FICHIERS_DE_DONNEES.includes(f) ? '  (données)' : ''}`),
        `  non analysables : ${m.nonAnalysables.join(', ') || 'aucun'}`
    ];
    process.stdout.write(lignes.join('\n') + '\n');
    if (process.argv.includes('--figer')) process.stdout.write(JSON.stringify(figer(m), null, 1) + '\n');
}
