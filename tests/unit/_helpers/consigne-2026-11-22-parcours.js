// LES BULLES DES PARCOURS 6, 7 ET 8 VALIDÉES LE 22 NOV. 2026, LUES DANS LA CONSIGNE ELLE-MÊME
// (plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, sections 3 à 5). Aucun texte n'est recopié
// dans les tests : chaque bloc « Début. … Fin. » est découpé ici en bulles, selon les conventions de la consigne :
//   « BULLE n sur N · « Titre » » ouvre une bulle ; « (petit) » la ligne au-dessus du titre ; « → » un geste ; « →→ » le
//   geste principal ; « Puis : » la bulle après le geste ; « Tu es dans « X », à l'onglet « Y » … » la phrase du lieu ;
//   « À la fin de ce parcours… », « Objectif atteint : … », « Suite suggérée : … » : l'objectif, l'objectif atteint et la
//   suite, posés par le moteur ; une ligne tout entre parenthèses : une note de la consigne, pas un texte de la bulle.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
export const CONSIGNE_22_NOV_SOIR = lire('plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md');

/** Le bloc « Début. … Fin. » qui suit le repère (« 3.1 », « 3.2 », « 4.1 », « 4.2 », « 5. ») dans la consigne. */
export function blocDu(repere) {
    const i = CONSIGNE_22_NOV_SOIR.indexOf('\n' + repere + ' ');
    if (i === -1) throw new Error('consigne du 22 nov. (soir) : repère « ' + repere + ' » introuvable');
    const debut = CONSIGNE_22_NOV_SOIR.indexOf('\nDébut.\n', i);
    const fin = CONSIGNE_22_NOV_SOIR.indexOf('\nFin.\n', debut);
    if (debut === -1 || fin === -1) throw new Error(repere + ' : bloc « Début. … Fin. » introuvable');
    return CONSIGNE_22_NOV_SOIR.slice(debut + '\nDébut.\n'.length, fin);
}

/** Le texte entre l'objectif d'un repère et son bloc (« 3.1 « JE REGARDE », … Début. ») : les consignes de travail. */
export function consigneDu(repere) {
    const i = CONSIGNE_22_NOV_SOIR.indexOf('\n' + repere + ' ');
    return CONSIGNE_22_NOV_SOIR.slice(i + 1, CONSIGNE_22_NOV_SOIR.indexOf('\nDébut.\n', i));
}

const RE_TETE = /^BULLE (\d+) sur (\d+) · « (.+?) »(?: \((.+)\))?$/;
const RE_LIEU = /^(Tu es dans « [^»]+ », à l'onglet « [^»]+ ») ?(:.*|\.)$/;

/**
 * Les bulles d'un bloc : { rang, total, titre, condition, petit, petitNote, objectif, lieu: {dit, suite}, lignes: [[t, texte]],
 * puis: { etiquette, lieu, lignes }, atteint, suite, notes: [] } ; `variantes` : les blocs nommés hors bulle (« LA VARIANTE
 * SANS FICHIER »), même forme.
 */
export function bullesDu(repere) {
    const lignes = blocDu(repere).split('\n').map((l) => l.trim()).filter(Boolean);
    const bulles = [];
    let b = null, cible = null;
    const neuve = (o) => { b = Object.assign({ lignes: [], notes: [], puis: null }, o); bulles.push(b); cible = b; };
    for (const l of lignes) {
        const tete = RE_TETE.exec(l);
        if (tete) { neuve({ rang: +tete[1], total: +tete[2], titre: tete[3], condition: tete[4] || null }); continue; }
        if (/^LA VARIANTE /.test(l)) { neuve({ rang: null, variante: l }); continue; }
        if (!b) throw new Error(repere + ' : ligne hors bulle : ' + l);
        if (l.startsWith('(petit) ')) {
            const t = l.slice('(petit) '.length);
            // Une note de la consigne : la parenthèse qui FINIT la ligne (« (des erreurs) », au milieu, est du texte).
            const p = t.endsWith(')') ? t.lastIndexOf(' (') : -1;
            b.petit = p === -1 ? t : t.slice(0, p);
            if (p !== -1) b.petitNote = t.slice(p + 2, -1);
            continue;
        }
        if (/^Puis(,.*)? :$/.test(l)) { b.puis = { etiquette: l, lignes: [] }; cible = b.puis; continue; }
        if (l.startsWith('À la fin de ce parcours, ')) { b.objectif = l; continue; }
        if (l.startsWith('Objectif atteint : ')) { b.atteint = l; continue; }
        if (l.startsWith('Suite suggérée : ')) { b.suite = l; continue; }
        if (/^\(.*\)$/.test(l)) { b.notes.push(l.slice(1, -1)); continue; }
        const lieu = RE_LIEU.exec(l);
        if (lieu) { cible.lieu = { dit: lieu[1], suite: lieu[2] === '.' ? '' : lieu[2] }; continue; }
        if (l.startsWith('→→ ')) { cible.lignes.push(['c', l.slice(3)]); continue; }
        if (l.startsWith('→ ')) { cible.lignes.push(['g', l.slice(2)]); continue; }
        cible.lignes.push(['n', l]);
    }
    return bulles;
}

/**
 * Une ligne de la consigne à crochets (« au [niveau affiché] ») devient une expression : chaque crochet, un texte non
 * vide. Sans crochet, l'égalité stricte.
 */
export function correspond(attendu, lu) {
    if (!/\[[^\]]+\]/.test(attendu)) return attendu === lu;
    const re = new RegExp('^' + attendu.split(/\[[^\]]+\]/).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+)') + '$');
    return re.test(lu);
}

// ---------------------------------------------------------------------------------------------------------------
// LA SUITE (consigne du 22 nov., 15 h : plans de travail/CONSIGNE-2026-11-22-parcours-6-7-8-suite.md). Ses textes
// retouchent des bulles de la précédente ; on les lit ici, dans la consigne elle-même, guillemets emboîtés compris.
// ---------------------------------------------------------------------------------------------------------------
export const CONSIGNE_SUITE = lire('plans de travail/CONSIGNE-2026-11-22-parcours-6-7-8-suite.md');

/** La ligne d'un repère de la suite (« 1.1 », « 3.2 »…). */
export function ligneDeLaSuite(repere) {
    const i = CONSIGNE_SUITE.indexOf('\n' + repere + ' ');
    if (i === -1) throw new Error('consigne de la suite : repère « ' + repere + ' » introuvable');
    return CONSIGNE_SUITE.slice(i + 1, CONSIGNE_SUITE.indexOf('\n', i + 1));
}

/** Les citations de premier niveau d'un texte (« … »), dans l'ordre, guillemets emboîtés gardés dedans. */
export function citations(texte) {
    const out = [];
    let n = 0, debut = -1;
    for (let k = 0; k < texte.length; k++) {
        if (texte[k] === '«') { if (n === 0) debut = k; n++; }
        else if (texte[k] === '»') { n--; if (n === 0) out.push(texte.slice(debut + 1, k).trim()); }
    }
    return out;
}

/** « X » devient : « Y » — la première citation avant « devient : », la première après. */
export function retoucheDeLaSuite(repere) {
    const l = ligneDeLaSuite(repere);
    const pivot = l.indexOf(' devient : «');
    if (pivot === -1) throw new Error(repere + ' : pas de « devient : »');
    const avant = citations(l.slice(0, pivot)), apres = citations(l.slice(pivot));
    return { avant: avant[avant.length - 1], apres: apres[0] };
}

/** La dernière citation d'un repère de la suite (le texte validé d'une ligne qui en remplace une autre). */
export function texteDeLaSuite(repere) {
    const c = citations(ligneDeLaSuite(repere));
    return c[c.length - 1];
}

// ---------------------------------------------------------------------------------------------------------------
// LA RELEASE (consigne du 22 nov., 20 h 36 à 20 h 56 : plans de travail/CONSIGNE-2026-11-22-release-publication.md, point 1).
// Trois retouches de bulles déjà validées, lues ici, dans la consigne elle-même.
// ---------------------------------------------------------------------------------------------------------------
export const CONSIGNE_RELEASE = lire('plans de travail/CONSIGNE-2026-11-22-release-publication.md');

/** La ligne d'une retouche de la release (« a », « b », « c »). */
function ligneDeLaRelease(lettre) {
    const i = CONSIGNE_RELEASE.indexOf('\n' + lettre + ') ');
    if (i === -1) throw new Error('consigne de la release : retouche « ' + lettre + ' » introuvable');
    return CONSIGNE_RELEASE.slice(i + 1, CONSIGNE_RELEASE.indexOf('\n', i + 1));
}

/**
 * Les trois retouches : { avant, apres }, des morceaux de ligne.
 *   a · « retire la phrase « P » ; le paragraphe devient « Y ». » : avant = Y + ' ' + P, après = Y ;
 *   b, c · « X » devient « Y ».
 */
export function retouchesDeLaRelease() {
    const a = ligneDeLaRelease('a');
    const iRetire = a.indexOf('retire la phrase «'), iDevient = a.indexOf('le paragraphe devient «');
    if (iRetire === -1 || iDevient === -1) throw new Error('retouche a : la consigne a changé de forme');
    const phrase = citations(a.slice(iRetire, iDevient))[0], reste = citations(a.slice(iDevient))[0];
    const devient = (lettre) => {
        const l = ligneDeLaRelease(lettre);
        const pivot = l.indexOf(' devient «');
        if (pivot === -1) throw new Error('retouche ' + lettre + ' : pas de « devient »');
        const avant = citations(l.slice(0, pivot)), apres = citations(l.slice(pivot));
        return { avant: avant[avant.length - 1], apres: apres[0] };
    };
    return { a: { avant: reste + ' ' + phrase, apres: reste, phrase }, b: devient('b'), c: devient('c') };
}

/** Applique des retouches (des morceaux de ligne) aux bulles d'une consigne ; chacune doit trouver sa ligne, une fois. */
export function appliquerRetouches(bulles, retouches) {
    const faites = retouches.map(() => 0);
    const poser = (lignes) => lignes.map(([t, x]) => {
        let y = x;
        retouches.forEach((r, k) => { if (y.includes(r.avant)) { y = y.replace(r.avant, r.apres); faites[k]++; } });
        return [t, y];
    });
    const out = bulles.map((b) => Object.assign({}, b, { lignes: poser(b.lignes), puis: b.puis ? Object.assign({}, b.puis, { lignes: poser(b.puis.lignes) }) : null }));
    return { bulles: out, faites };
}
