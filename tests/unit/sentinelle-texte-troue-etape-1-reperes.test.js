/**
 * Sentinelle — le texte troué, ÉTAPE 1 : les repères posables des quatre
 * énoncés d'un critère algorithmique (3 septembre 2026).
 *
 * Ce que ce lot change : l'enseignant·e ne TAPE plus `{erreurs}`, il pose un
 * repère d'un clic. Le 2 septembre, Grégoire a tapé `[service]` pour
 * `{service}` ; le texte avait l'air juste, et son élève aurait lu le crochet.
 *
 * Ce que cette sentinelle verrouille :
 *   A  la palette — quatre repères, deux familles, et {s} n'en est pas un ;
 *   B  le contrat zone → repères est MESURÉ sur les sites d'appel de `enonce`,
 *      dans les deux sens : rien d'offert qu'aucun appel ne remplit, rien de
 *      rempli qui ne soit pas offert. « Aucune annotation » n'offre pas
 *      {erreurs} — le cas qui a fait trancher Grégoire ;
 *   C  `insererRepere` — au curseur, à la place d'une sélection, les espaces
 *      qui évitent la soudure, {points} sans espace de tête, et le refus de
 *      tout ce qui n'est pas posable ;
 *   D  le rendu ne bouge pas — un repère posé se rend comme un jeton tapé, et
 *      les phrases d'hier sortent au caractère près. ⚠ Le témoin exigé par la
 *      consigne est la sentinelle #581, qui passe SANS modification ; celle-ci
 *      ne le redit que sur le chemin neuf ;
 *   E  le gabarit offre bien les repères, par le registre, et la note qui
 *      enseignait la syntaxe est partie.
 *
 * Break-tests joués le 3 septembre 2026 (module muté, Vitest lancé, module
 * remis — empreinte sha256 identique avant/après) :
 *   · `aucune` offre {erreurs}                 ⮕ B.b et B.d rougissent
 *   · `decompte` n'offre plus {mots}           ⮕ B.c et B.d rougissent
 *   · plus d'espace après un repère (`}`)      ⮕ C.c et C.d rougissent
 *   · {points} reçoit une espace de tête       ⮕ C.e rougit
 *   · {s} entre dans la palette                ⮕ A.a et A.b rougissent
 * Une sentinelle qui n'a jamais rougi n'a rien prouvé.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

let enonces;
beforeAll(() => {
    enonces = chargerScript('js/evaluation-enonces.js').enoncesAlgo;
});

const nu = (jeton) => jeton.slice(1, -1);

/* ============================================================ A — LA PALETTE */

describe('texte troué · A — la palette est celle du code, pas celle du cadrage', () => {
    it('A.a quatre repères : {critere}, {erreurs}, {mots}, {points}', () => {
        expect(enonces.listerReperes().map(r => r.jeton))
            .toEqual(['{critere}', '{erreurs}', '{mots}', '{points}', '{nomErreurs}', '{nomMots}']);   // ↻ étape 2a (22 oct. 2026) : les deux noms, offerts
    });

    it('A.b {s} n\'est PAS un repère — c\'est un accord qui suit {erreurs}, jamais un geste', () => {
        const jetons = enonces.listerReperes().map(r => r.jeton);
        expect(jetons).not.toContain(enonces.JETON_PLURIEL);
        // Et il ne se pose pas : la fonction le refuse et ne touche pas au texte.
        expect(enonces.insererRepere('erreur', 6, 6, '{s}')).toBeNull();
    });

    it('A.c chaque repère est un jeton que `rendre` connaît', () => {
        enonces.listerReperes().forEach(r => {
            const v = {}; v[nu(r.jeton)] = 'VALEUR';
            expect(enonces.rendre('x ' + r.jeton, v), `${r.jeton} n'est pas rendu`).toBe('x VALEUR');
        });
    });

    it('A.d deux familles, chacune peuplée, chaque repère dans l\'une des deux', () => {
        const familles = enonces.listerReperes().map(r => r.famille);
        expect(new Set(familles)).toEqual(new Set(['posee', 'remplie']));
        // Le nom du critère est écrit dans la grille ; le reste vient de la correction.
        const parJeton = Object.fromEntries(enonces.listerReperes().map(r => [r.jeton, r.famille]));
        expect(parJeton['{critere}']).toBe('posee');
        expect(parJeton['{erreurs}']).toBe('remplie');
        expect(parJeton['{mots}']).toBe('remplie');
        expect(parJeton['{points}']).toBe('remplie');
    });

    it('A.e chaque repère porte un libellé et une aide — la palette est documentée', () => {
        enonces.listerReperes().forEach(r => {
            expect(typeof r.libelle === 'string' && r.libelle.length > 0).toBe(true);
            expect(typeof r.aide === 'string' && r.aide.length > 10).toBe(true);
        });
    });
});

/* ============================================ B — LE CONTRAT, MESURÉ SUR LES APPELS */

describe('texte troué · B — une zone n\'offre que ce qu\'un appel remplit', () => {
    /**
     * Le geste rejouable à la main :
     *   grep -n "enoncesAlgo.enonce(" js/evaluation-calcul.js \
     *     js/evaluation-retroaction.js js/synthese-retroaction-data.js
     * puis lire, pour chaque appel, la clé et les valeurs passées.
     */
    const SITES = ['js/evaluation-calcul.js', 'js/evaluation-retroaction.js', 'js/synthese-retroaction-data.js'];

    function appelsMesures() {
        const parCle = {};
        let total = 0;
        SITES.forEach(rel => {
            const src = readFileSync(path.join(racine, rel), 'utf8');
            const re = /enoncesAlgo\.enonce\(\s*[^,]+?,\s*'([a-z]+)'\s*,\s*\{([^}]*)\}\s*\)/g;
            let m;
            while ((m = re.exec(src)) !== null) {
                total++;
                const cle = m[1];
                parCle[cle] = parCle[cle] || new Set();
                [...m[2].matchAll(/([A-Za-z_]+)\s*:/g)].forEach(x => parCle[cle].add(x[1]));
            }
        });
        return { total, parCle };
    }

    it('B.a TÉMOIN — la mesure voit les appels : au moins six, et les quatre clés', () => {
        // Sans ce témoin, une expression qui ne trouverait plus rien laisserait
        // B.b passer sur un ensemble vide.
        const { total, parCle } = appelsMesures();
        expect(total).toBeGreaterThanOrEqual(6);
        expect(Object.keys(parCle).sort()).toEqual(['aucune', 'concentre', 'decompte', 'priorite']);
        expect([...parCle.decompte].sort()).toEqual(['erreurs', 'mots', 'points']);
    });

    it('B.b rien d\'offert qu\'aucun appel ne remplit ({critere} vient toujours du registre)', () => {
        const { parCle } = appelsMesures();
        enonces.listerCles().forEach(c => {
            // ↻ étape 2a : les deux noms viennent aussi toujours du registre, comme {critere}.
            const permis = new Set(['critere', 'nomErreurs', 'nomMots', ...(parCle[c.cle] || [])]);
            enonces.reperesDeCle(c.cle).forEach(r => {
                expect(permis.has(nu(r.jeton)),
                    `« ${c.libelle} » offre ${r.jeton}, qu'aucun appel ne remplit — il vaudrait toujours vide`).toBe(true);
            });
        });
    });

    it('B.c rien de rempli par un appel qui ne soit offert', () => {
        const { parCle } = appelsMesures();
        enonces.listerCles().forEach(c => {
            const offerts = new Set(enonces.reperesDeCle(c.cle).map(r => nu(r.jeton)));
            ['critere', ...(parCle[c.cle] || [])].forEach(k => {
                expect(offerts.has(k), `« ${c.libelle} » reçoit {${k}} à l'appel et ne l'offre pas`).toBe(true);
            });
        });
    });

    it('B.d « Aucune annotation » n\'offre pas {erreurs} — le piège nommé par Grégoire', () => {
        // La zone s'affiche « quand la copie ne porte ni tampon ni erreur ».
        expect(enonces.reperesDeCle('aucune').map(r => r.jeton)).toEqual(['{critere}', '{nomErreurs}']);   // ↻ étape 2a (22 oct. 2026) : les deux noms, offerts (le nom, pas le nombre)
        // Et le décompte, lui, les offre tous : c'est là que les nombres valent.
        expect(enonces.reperesDeCle('decompte').map(r => r.jeton))
            .toEqual(['{critere}', '{erreurs}', '{nomErreurs}', '{mots}', '{nomMots}', '{points}']);   // ↻ étape 2a (22 oct. 2026) : les deux noms, offerts
    });

    it('B.e `listerCles` porte le même contrat, et une clé inconnue n\'offre rien', () => {
        enonces.listerCles().forEach(c => {
            expect(c.reperes).toEqual(enonces.reperesDeCle(c.cle).map(r => r.jeton));
        });
        expect(enonces.reperesDeCle('inconnue')).toEqual([]);
        // Ce que le gabarit reçoit est une copie : le modifier ne touche pas le registre.
        enonces.listerCles()[0].reperes.push('{s}');
        expect(enonces.listerCles()[0].reperes).not.toContain('{s}');
    });
});

/* ============================================================ C — LA POSE */

describe('texte troué · C — `insererRepere` pose au curseur, sans souder', () => {
    it('C.a au curseur, et le curseur se retrouve après le repère', () => {
        const r = enonces.insererRepere('Ta production contient ', 23, 23, '{erreurs}');
        expect(r.texte).toBe('Ta production contient {erreurs}');
        expect(r.curseur).toBe(r.texte.length);
    });

    it('C.b une sélection est remplacée par le repère', () => {
        const t = 'Concentre-toi sur la qualité du français';
        const r = enonces.insererRepere(t, t.indexOf('la qualité'), t.length, '{critere}');
        expect(r.texte).toBe('Concentre-toi sur {critere}');
    });

    it('C.c collé à un mot, le repère prend une espace avant — le curseur d\'iPad se pose en fin de mot', () => {
        const r = enonces.insererRepere('Ta production contient', 22, 22, '{erreurs}');
        expect(r.texte).toBe('Ta production contient {erreurs}');
        // Après une ponctuation qui ferme aussi.
        expect(enonces.insererRepere('Attention :', 11, 11, '{critere}').texte).toBe('Attention : {critere}');
        // Mais pas après une espace, une ouvrante ni une apostrophe.
        expect(enonces.insererRepere('sur ', 4, 4, '{critere}').texte).toBe('sur {critere}');
        expect(enonces.insererRepere('(', 1, 1, '{mots}').texte).toBe('({mots}');
        expect(enonces.insererRepere('l\'', 2, 2, '{critere}').texte).toBe('l\'{critere}');
        expect(enonces.insererRepere('« ', 2, 2, '{critere}').texte).toBe('« {critere}');
        // Et après un autre repère — le cas attrapé par WebKit le 3 septembre :
        // « Concentre-toi sur {critere} » + {critere} rendait « {critere}{critere} ».
        expect(enonces.insererRepere('sur {critere}', 13, 13, '{critere}').texte).toBe('sur {critere} {critere}');
    });

    it('C.d suivi d\'un mot, le repère prend une espace après — et le curseur la suit', () => {
        const t = 'contient erreurs';
        const r = enonces.insererRepere(t, 9, 9, '{erreurs}');
        expect(r.texte).toBe('contient {erreurs} erreurs');
        expect(r.curseur).toBe('contient {erreurs} '.length);
        // Suivi d'une ponctuation : rien d'ajouté.
        expect(enonces.insererRepere('sur .', 4, 4, '{critere}').texte).toBe('sur {critere}.');
        // Suivi d'un autre repère : une espace, sinon « 5003 » chez l'élève.
        const r2 = enonces.insererRepere('contient {erreurs}', 9, 9, '{mots}');
        expect(r2.texte).toBe('contient {mots} {erreurs}');
        expect(enonces.rendre(r2.texte, { mots: 500, erreurs: 3 })).toBe('contient 500 3');
        // Mais pas devant {points}, qui porte son espace de tête.
        expect(enonces.insererRepere('erreur{s}{points} pour', 9, 9, '{mots}').texte).toBe('erreur{s} {mots}{points} pour');
    });

    it('C.e {points} ne reçoit JAMAIS d\'espace avant — il porte la sienne', () => {
        const r = enonces.insererRepere('erreurs pour', 7, 7, '{points}');
        expect(r.texte).toBe('erreurs{points} pour');
        // Rendu : une seule espace quand la mention est là, aucune quand elle est vide.
        expect(enonces.rendre(r.texte, { points: ' (3.5 points)' })).toBe('erreurs (3.5 points) pour');
        expect(enonces.rendre(r.texte, { points: '' })).toBe('erreurs pour');
        // Après {points}, un mot qui suit directement reçoit quand même son espace
        // (à une frontière : un repère ne se pose plus DANS un mot, voir C.h).
        expect(enonces.insererRepere('erreurs (pour', 9, 9, '{points}').texte).toBe('erreurs ({points} pour');
    });

    it('C.f une position absente ou hors bornes vaut la fin ; une sélection à l\'envers est remise à l\'endroit', () => {
        expect(enonces.insererRepere('abc', undefined, undefined, '{mots}').texte).toBe('abc {mots}');
        expect(enonces.insererRepere('abc', 99, 99, '{mots}').texte).toBe('abc {mots}');
        expect(enonces.insererRepere('abc', -4, -4, '{mots}').texte).toBe('{mots} abc');
        expect(enonces.insererRepere('abc def', 7, 4, '{mots}').texte).toBe('abc {mots}');
        expect(enonces.insererRepere(null, 0, 0, '{mots}').texte).toBe('{mots}');
    });

    it('C.h un repère ne coupe JAMAIS un mot — essai iPad du 3 sept. : « fran {critere} çais »', () => {
        const t = 'Concentre-toi sur la qualité du français';
        // fran|çais : 4 lettres de chaque côté ⮕ la fin, on pose après ce qu'on vient de lire.
        expect(enonces.insererRepere(t, 36, 36, '{critere}').texte).toBe('Concentre-toi sur la qualité du français {critere}');
        // fr|ançais : le début est plus proche.
        expect(enonces.insererRepere(t, 34, 34, '{critere}').texte).toBe('Concentre-toi sur la qualité du {critere} français');
        // franç|ais : la fin est plus proche.
        expect(enonces.insererRepere(t, 37, 37, '{critere}').texte).toBe('Concentre-toi sur la qualité du français {critere}');
        // L'apostrophe et le trait d'union tiennent le mot.
        expect(enonces.insererRepere("aujourd'hui déjà", 8, 8, '{critere}').texte).toBe("aujourd'hui {critere} déjà");
        expect(enonces.insererRepere('Concentre-toi sur', 10, 10, '{critere}').texte).toBe('Concentre-toi {critere} sur');
        // À une frontière, rien ne bouge ; le curseur suit le repère.
        const r = enonces.insererRepere('sur la qualité', 3, 3, '{critere}');
        expect(r.texte).toBe('sur {critere} la qualité');
        // Le curseur suit le repère ; l'espace qui suit était déjà là, elle n'est pas insérée.
        expect(r.curseur).toBe('sur {critere}'.length);
    });

    it('C.i un curseur dans un repère déjà posé le laisse entier — le neuf se pose après', () => {
        expect(enonces.insererRepere('Ta production contient {erreurs} erreur', 27, 27, '{mots}').texte)
            .toBe('Ta production contient {erreurs} {mots} erreur');
        expect(enonces.insererRepere('{critere} est', 1, 1, '{mots}').texte).toBe('{critere} {mots} est');
        expect(enonces.insererRepere('{critere} est', 8, 8, '{mots}').texte).toBe('{critere} {mots} est');
        // Une sélection, elle, est voulue : elle n'est pas déplacée.
        expect(enonces.insererRepere('français', 2, 6, '{critere}').texte).toBe('fr {critere} is');
    });

    it('C.g tout ce qui n\'est pas posable est refusé, et le texte n\'est pas touché', () => {
        expect(enonces.insererRepere('abc', 1, 1, '{service}')).toBeNull();
        expect(enonces.insererRepere('abc', 1, 1, 'erreurs')).toBeNull();
        expect(enonces.insererRepere('abc', 1, 1, '')).toBeNull();
        expect(enonces.insererRepere('abc', 1, 1, undefined)).toBeNull();
    });
});

/* ============================================================ D — LE RENDU NE BOUGE PAS */

describe('texte troué · D — un repère posé se rend comme un jeton tapé', () => {
    it('D.a le texte composé au clic et le texte tapé à la main rendent la même phrase', () => {
        const tape = 'Ta production contient {erreurs} erreur{s} pour {mots} mots.';
        let pose = 'Ta production contient';
        let r = enonces.insererRepere(pose, pose.length, pose.length, '{erreurs}');
        pose = r.texte + ' erreur{s} pour';
        r = enonces.insererRepere(pose, pose.length, pose.length, '{mots}');
        pose = r.texte + ' mots.';
        expect(pose).toBe(tape);
        const critere = { id: 'CR', nom: 'Précision des calculs', type: 'algorithmique', enonces: { decompte: pose } };
        expect(enonces.enonce(critere, 'decompte', { erreurs: 3, mots: 500 }))
            .toBe('Ta production contient 3 erreurs pour 500 mots.');
    });

    it('D.b les phrases d\'hier sortent au caractère près — un critère non réglé ne voit rien', () => {
        const fr = { id: 'CR_FR', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' };
        expect(enonces.enonce(fr, 'decompte', { erreurs: 12, mots: 500 }))
            .toBe('Ta rédaction contient 12 erreurs de français pour 500 mots.');
        expect(enonces.enonce(fr, 'aucune', {})).toBe('Aucun tampon ni erreur de français annotés.');
    });

    it('D.c le format enregistré ne change pas : `enonces` reste {cle: texte}, texte libre', () => {
        const c = { id: 'CR', nom: 'Précision des calculs', type: 'algorithmique' };
        enonces.appliquerAuCritere(c, 'generique', { priorite: 'Le calcul {critere} d\'abord' });
        expect(c.enonces).toEqual({ priorite: 'Le calcul {critere} d\'abord' });
        expect(Object.keys(c).sort()).toEqual(['enonces', 'id', 'modeleEnonces', 'nom', 'type']);
    });
});

/* ============================================================ E — LE GABARIT */

describe('texte troué · E — le gabarit offre les repères par le registre', () => {
    const grilles = () => readFileSync(path.join(racine, 'js/grilles.js'), 'utf8');

    it('E.a les boutons viennent de `reperesDeCle`, et le clic est un `data-action` sans paramètre', () => {
        const src = grilles();
        expect(src).toMatch(/enoncesAlgo\.reperesDeCle\(/);
        // « retire les accolades » (Grégoire, essai iPad) : le badge montre le mot nu ;
        // le jeton posé, lui, garde ses accolades (data-jeton).
        expect(src).toMatch(/data-jeton="\$\{esc\(r\.jeton\)\}"/);
        expect(src).toMatch(/>\$\{esc\(r\.jeton\.slice\(1, -1\)\)\}<\/button>/);
        expect(src).toMatch(/data-action="insererRepereEnonce"/);
        expect(src).toMatch(/window\.insererRepereEnonce = insererRepereEnonce/);
    });

    it('E.b la note qui ENSEIGNAIT la syntaxe est partie ; ce qui reste invisible est toujours dit', () => {
        const src = grilles();
        expect(src).not.toMatch(/là où le nom de ce critère doit apparaître/);
        expect(src).toMatch(/Un repère que la phrase n'a pas à remplir disparaît proprement/);
        expect(src).toMatch(/Une zone laissée VIDE fait taire l'énoncé/);
    });

    it('E.c le clic ne prend pas le focus — sinon le premier repère posé après une frappe se perd', () => {
        // `pointerdown` annulé sur le bouton : la zone garde son focus et son
        // curseur, et le `change` qui re-rend le gabarit ne part pas avant le clic.
        const src = grilles();
        expect(src).toMatch(/\['pointerdown', 'mousedown'\]/);
        expect(src).toMatch(/closest\('\[data-action="insererRepereEnonce"\]'\)\) e\.preventDefault\(\)/);
    });

    it('E.d index.html charge le registre AVANT grilles.js, et les jetons de cache du lot ont bougé', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html.indexOf('js/evaluation-enonces.js')).toBeLessThan(html.indexOf('js/grilles.js'));
        // Le garde anti-cache ne surveille que main.js : un fichier corrigé sans
        // bump arrive périmé dans Safari, sans signal. Les trois du lot :
        { const j = jetonAuMoins(html, 'js/evaluation-enonces.js', '20260903a'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260903c'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260903c'); expect(j.ok, j.message).toBe(true); }
    });
});
