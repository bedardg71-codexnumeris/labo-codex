/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, LOT 5 — « Couper » un morceau, et des raisons qui nomment ce qui bloque.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-5-couper.md (« Ce qu'il faut », points 1, 2, 4, 5, 6, 7).
 *
 * Ce que ce banc verrouille :
 *   C — `couper` : au milieu, au bord, dans un mot (la coupe tombe à l'espace la plus proche), un seul
 *       mot (rien ne change), texte brut, tableau (même case, à la suite), identifiants neufs, l'ancien
 *       document intact, et l'aller-retour qui ne perd rien.
 *   E — l'étiquette : la première partie garde celle du morceau coupé, la seconde n'en a pas ; la lecture se refait.
 *   A — l'annulation (`recoller`) : les deux parties recollées exactement, l'étiquette d'origine rendue.
 *   P — une grille sans niveaux dont chaque critère porte une pondération se lit en points (point 5).
 *   D — la grille fictive (d), de la forme de celle de la porte : telle quelle, refusée avec des raisons
 *       qui nomment ; coupée et étiquetée, créable en points, ses pondérations lues.
 *   R — chaque raison nommée : noms de critères, éléments observables, réponses trop longs ; les points
 *       ou la pondération qui manquent ; une Pondération sans critère ou en trop.
 *   N — aucun renvoi à une étape de l'assistant dans ce que la dissection affiche.
 *
 * C1 du verdict du 18 oct. (13 h 36) : R.g — dans un tableau, une Pondération ne se range que sous le
 * critère de sa rangée. Break-test : `ciblePonderation` rendant toujours `cible(x, id)` → R.g rouge.
 *
 * Break-tests (faits le 18 oct.) : la coupe au rang touché plutôt qu'à l'espace (`espaceProche` rendant
 * `decalage`) → C.a, C.b, C.c, C.e et C.g rouges ; l'étiquette non transmise dans `liensApresCoupe` →
 * E.a, E.b, P.a, P.b, D.b et R.f rouges ; le message de l'étape rendu tel quel par `raisonDissection`
 * → N.a rouge.
 *
 * Grilles FICTIVES (tests/unit/_helpers/grilles-fictives-dissection.js), jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import {
    GRILLE_D, CRITERES_D, SECTIONS_D, TOTAUX_D, ligneD, partiesD, GRILLE_N, NIVEAUX_N, enHtml, etiquettes, liensPar
} from './_helpers/grilles-fictives-dissection.js';

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

let D;
let A;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
    A = w.materielAssistant;
});

let compteur = 0;
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-18T12:00:00.000Z' });

const docTexte = (t) => ({ mode: 'texte', lines: t.map((x, i) => ({ id: 'm' + (i + 1), t: x })) });
const textes = (doc) => { const M = D.morceaux(doc); return M.ordre.map((id) => M.texte[id]); };
const lire = (e) => D.comprendre(e.doc, e.liens);
const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };

/** (d) collée, étiquetée comme dans le fichier fictif. */
function collerD(grille = GRILLE_D) {
    const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
    return { doc, liens: liensPar(D.morceaux(doc).ordre, etiquettes(grille)) };
}

/** Une coupe à l'espace qui suit les `n` premiers caractères du morceau de texte `t`, sa première partie étiquetée comme lui. */
function couperApres(e, t, n) {
    const id = idDe(e.doc, t);
    const r = D.couper(e.doc, id, n);
    expect(r).not.toBeNull();
    return { doc: r.doc, liens: D.liensApresCoupe(e.liens, id, r.parties), parties: r.parties };
}

/**
 * Une ligne de critère de (d) coupée en son nom, « / N », puis une case « [ ] … » par morceau ; le nom
 * garde « Critère », « / N » prend « Pondération », chaque case « Élément observable ».
 */
function couperLigne(e0, i) {
    const [nom, n] = CRITERES_D[i];
    const pond = partiesD(nom, n, i + 1)[1];
    let e = couperApres(e0, ligneD(i), nom.length);
    e = couperApres(e, D.morceaux(e.doc).texte[e.parties[1]], pond.length);
    e.liens[e.parties[0]] = 'ponderation';   // « / 10 » revient deux fois dans (d) : on suit les identifiants
    let reste = e.parties[1];
    for (;;) {
        e.liens[reste] = 'souscritere';
        const t = D.morceaux(e.doc).texte[reste];
        const k = t.indexOf(' [ ] ');
        if (k < 0) return e;
        const id = reste;
        const r = D.couper(e.doc, id, k);
        e = { doc: r.doc, liens: D.liensApresCoupe(e.liens, id, r.parties) };
        reste = r.parties[1];
    }
}

/** (d) coupée comme l'enseignant le ferait : chaque ligne de critère en nom, « / N » et cases ; les totaux en Total. */
function dDecoupee() {
    let e = collerD();
    CRITERES_D.forEach((c, i) => { e = couperLigne(e, i); });
    TOTAUX_D.forEach((t) => { e.liens[idDe(e.doc, t)] = 'total'; });
    return e;
}

const NOMS_ASSISTANT = ['axes', 'roles', 'nature', 'valeurs', 'classer', 'final'];
function sansRenvoiAssistant(raisons) {
    raisons.forEach((r) => {
        expect(r).not.toMatch(/l’étape|l'étape/);
        NOMS_ASSISTANT.forEach((k) => expect(r).not.toContain('« ' + A.NOMS_ETAPES[k] + ' »'));
    });
}

describe('C — couper un morceau', () => {
    it('C.a — au milieu d’un mot : la coupe tombe à l’espace la plus proche', () => {
        const doc = docTexte(['alpha beta gamma']);
        // « alpha be|ta gamma » (rang 8) : l'espace 5 est à 2, l'espace 10 à 2 aussi ; la première l'emporte.
        expect(textes(D.couper(doc, 'm1', 8).doc)).toEqual(['alpha', 'beta gamma']);
        // « alpha beta ga|mma » (rang 13) : l'espace 10 est à 2.
        expect(textes(D.couper(doc, 'm1', 13).doc)).toEqual(['alpha beta', 'gamma']);
        // Juste avant ou juste après l'espace : écart nul.
        expect(textes(D.couper(doc, 'm1', 10).doc)).toEqual(['alpha beta', 'gamma']);
        expect(textes(D.couper(doc, 'm1', 11).doc)).toEqual(['alpha beta', 'gamma']);
    });

    it('C.b — au bord : au début, la première espace ; à la fin, la dernière ; hors bornes, ramené au bord', () => {
        const doc = docTexte(['alpha beta gamma']);
        expect(textes(D.couper(doc, 'm1', 0).doc)).toEqual(['alpha', 'beta gamma']);
        expect(textes(D.couper(doc, 'm1', 16).doc)).toEqual(['alpha beta', 'gamma']);
        expect(textes(D.couper(doc, 'm1', -4).doc)).toEqual(['alpha', 'beta gamma']);
        expect(textes(D.couper(doc, 'm1', 99).doc)).toEqual(['alpha beta', 'gamma']);
    });

    it('C.c — jamais dans un mot : chaque mot de chaque partie est un mot entier de l’original, à tout rang', () => {
        const t = 'Repérage fictif / 10 [ ] le repère est relevé / n’est pas relevé';
        const mots = t.split(' ');
        for (let k = 0; k <= t.length; k++) {
            const [a, b] = textes(D.couper(docTexte([t]), 'm1', k).doc);
            expect(a.split(' ').every((m) => mots.includes(m))).toBe(true);
            expect(b.split(' ').every((m) => mots.includes(m))).toBe(true);
            expect(a.split(' ').length + b.split(' ').length).toBe(mots.length);
        }
    });

    it('C.d — un seul mot ne se coupe pas : null, et le document reste le même', () => {
        const doc = docTexte(['anticonstitutionnellement', 'deux mots']);
        const avant = JSON.stringify(doc);
        expect(D.couper(doc, 'm1', 5)).toBeNull();
        expect(D.couper(doc, 'm9', 2)).toBeNull();   // un morceau qui n'existe pas
        expect(D.couper(null, 'm1', 2)).toBeNull();
        expect(JSON.stringify(doc)).toBe(avant);
    });

    it('C.e — texte brut : les deux parties à la suite, des identifiants neufs, l’ancien document intact', () => {
        const doc = docTexte(['avant', 'un deux trois', 'après']);
        const avant = JSON.stringify(doc);
        const r = D.couper(doc, 'm2', 3);
        expect(r.doc.mode).toBe('texte');
        expect(textes(r.doc)).toEqual(['avant', 'un', 'deux trois', 'après']);
        expect(r.parties).toEqual(['m4', 'm5']);
        expect(D.morceaux(r.doc).ordre).toEqual(['m1', 'm4', 'm5', 'm3']);
        expect(JSON.stringify(doc)).toBe(avant);
        // Une seconde coupe prend encore des identifiants neufs.
        expect(D.couper(r.doc, 'm5', 4).parties).toEqual(['m6', 'm7']);
    });

    it('C.f — tableau : les deux parties dans la même case, à la même place ; fusions et autres cases intactes', () => {
        const doc = { mode: 'table', rows: [
            [{ cs: 2, rs: 1, lines: [{ id: 'm1', t: 'Titre fictif' }] }],
            [{ cs: 1, rs: 2, lines: [{ id: 'm2', t: 'Critère fictif / 10' }, { id: 'm3', t: 'suite' }] }, { cs: 1, rs: 1, lines: [{ id: 'm4', t: 'case' }] }],
            [{ cs: 1, rs: 1, lines: [{ id: 'm5', t: 'bas' }] }]
        ] };
        const r = D.couper(doc, 'm2', 14);
        const avant = D.morceaux(doc), apres = D.morceaux(r.doc);
        expect(apres.ordre).toEqual(['m1', 'm6', 'm7', 'm3', 'm4', 'm5']);
        expect([apres.texte.m6, apres.texte.m7]).toEqual(['Critère fictif', '/ 10']);
        expect(apres.pos.m6).toEqual({ ...avant.pos.m2, k: 0 });
        expect(apres.pos.m7).toEqual({ ...avant.pos.m2, k: 1 });
        expect(apres.pos.m3).toEqual({ ...avant.pos.m3, k: 2 });
        ['m1', 'm4', 'm5'].forEach((id) => expect(apres.pos[id]).toEqual(avant.pos[id]));
        expect(r.doc.rows[1][0].rs).toBe(2);
        expect(r.doc.rows[0][0].cs).toBe(2);
    });

    it('C.g — l’aller-retour : les deux parties, bout à bout avec une espace, redonnent l’original, à tout rang', () => {
        [ligneD(0), ligneD(3), 'a b', 'un  texte   aux espaces ', TOTAUX_D[0]].forEach((t0) => {
            const t = t0.replace(/\s+/g, ' ').trim();   // le texte d'un morceau, tel que lu
            for (let k = 0; k <= t.length; k++) {
                const [a, b] = textes(D.couper(docTexte([t]), 'm1', k).doc);
                expect(a + ' ' + b).toBe(t);
                expect(a).toBe(a.trim());
                expect(b).toBe(b.trim());
                expect(a && b).toBeTruthy();
            }
        });
    });
});

describe('E — l’étiquette du morceau coupé', () => {
    it('E.a — la première partie garde l’étiquette, la seconde n’en a pas ; l’original n’en porte plus', () => {
        const l = D.liensApresCoupe({ m1: 'critere', m2: 'titre' }, 'm1', ['m3', 'm4']);
        expect(l).toEqual({ m2: 'titre', m3: 'critere' });
        expect(D.liensApresCoupe({ m2: 'titre' }, 'm1', ['m3', 'm4'])).toEqual({ m2: 'titre' });
    });

    it('E.b — la lecture se refait : (d), sa première ligne coupée, le critère n’a plus que son nom', () => {
        const e = couperApres(collerD(), ligneD(0), CRITERES_D[0][0].length);
        const R = D.comprendre(e.doc, e.liens);
        expect(R.criteres[0].nom).toBe(CRITERES_D[0][0]);
        expect(R.sansEtiquette).toBe(1);   // la seconde partie, sans étiquette
    });
});

describe('A — annuler une coupe', () => {
    it('A.a — recollée exactement, l’étiquette d’origine rendue, les étiquettes des parties retirées', () => {
        const e0 = collerD();
        const id = idDe(e0.doc, ligneD(2));
        const r = D.couper(e0.doc, id, 30);
        const liens = D.liensApresCoupe(e0.liens, id, r.parties);
        liens[r.parties[0]] = 'description';   // l'enseignant change l'étiquette d'une partie
        liens[r.parties[1]] = 'souscritere';
        const pile = [{ doc: e0.doc, id, type: e0.liens[id] || null, parties: r.parties }];
        const rec = D.recoller(liens, pile.pop());
        expect(rec.doc).toBe(e0.doc);
        expect(JSON.stringify(rec.doc)).toBe(JSON.stringify(collerD().doc));
        expect(rec.liens).toEqual(e0.liens);
        expect(rec.liens[id]).toBe('critere');
    });

    it('A.b — deux coupes, annulées de la dernière à la première : le document d’origine', () => {
        const e0 = collerD();
        const pile = [];
        let e = e0;
        [[ligneD(0), 12], [ligneD(1), 40]].forEach(([t, k]) => {
            const id = idDe(e.doc, t);
            const r = D.couper(e.doc, id, k);
            pile.push({ doc: e.doc, id, type: e.liens[id] || null, parties: r.parties });
            e = { doc: r.doc, liens: D.liensApresCoupe(e.liens, id, r.parties) };
        });
        while (pile.length) e = D.recoller(e.liens, pile.pop());
        expect(e.doc).toBe(e0.doc);
        expect(e.liens).toEqual(e0.liens);
    });
});

describe('P — des pondérations sur chaque critère, sans niveaux : une grille en points', () => {
    it('P.a — sans aucun morceau « Points », la logique est « points », chaque critère noté sur sa pondération', () => {
        const R = D.comprendre(dDecoupee().doc, dDecoupee().liens);
        expect(R.nb.points).toBeUndefined();
        expect(R.avecNiveaux).toBe(false);
        expect(D.bilan(R).logique).toBe('points');
        expect(R.criteres.map((c) => c.pond)).toEqual(CRITERES_D.map((c) => c[1]));
    });

    it('P.b — deux critères sans pondération : la grille se lit en points (lot 9), et les critères en cause sont nommés, à compléter', () => {
        const e = dDecoupee();
        Object.keys(e.liens).forEach((id) => { if (D.morceaux(e.doc).texte[id] === '/ 20') delete e.liens[id]; });   // « Classement fictif » et « Justesse fictive » perdent leur pondération
        const R = D.comprendre(e.doc, e.liens);
        expect(D.bilan(R).logique).toBe('points');
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        expect(c.aCompleter).toEqual(['les points de 2 critères (« Classement fictif des images » et « Justesse fictive de la langue »)']);
        sansRenvoiAssistant(c.aCompleter);
    });

    it('P.c — avec des niveaux nommés, des pondérations seules ne font pas une grille en points', () => {
        const doc = D.docDepuisPressePapiers({ html: enHtml(GRILLE_N), texte: '' });
        const R = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, etiquettes(GRILLE_N)));
        expect(D.bilan(R).logique).toBe('niveaux');
    });
});

describe('D — la grille fictive (d)', () => {
    it('D.a — telle que collée : refusée, chaque critère trop long nommé par ses premiers mots, sans renvoi à l’assistant', () => {
        const e = collerD();
        const R = D.comprendre(e.doc, e.liens);
        const c = D.creation(R, {});
        expect(c.raisons).toContain('des noms de critères plus courts (200 caractères au plus) pour '
            + '« Repérage fictif des images / 10 [ ] le… », « Classement fictif des images / 20 [ ] le… », '
            + '« Interprétation fictive des motifs / 15 [… » et 3 autres : coupe-les avec « Couper »');
        sansRenvoiAssistant(c.raisons);
    });

    it('D.b — coupée et étiquetée : créable en points, ses pondérations lues, retrouvées dans la grille construite', () => {
        const e = dDecoupee();
        const R = D.comprendre(e.doc, e.liens);
        expect(R.sansPlace).toEqual([]);
        const c = D.creation(R, {});
        expect(c.raisons).toEqual([]);
        expect(c.enNiveaux).toBe(false);
        const o = A.construire(c.modele, ctx());
        expect(o.echelle).toBeNull();
        expect(o.grille.nom).toBe('Évaluation fictive sur les images');
        expect(o.grille.criteres.map((x) => x.ponderation)).toEqual([10, 20, 15, 25, 10, 20]);
        expect(o.grille.criteres[0].nom).toBe('Partie A : repérer – Repérage fictif des images');
        expect(o.grille.criteres[5].nom).toBe('Partie C : rédiger – Justesse fictive de la langue');
        expect(o.grille.criteres[0].sousCriteres.map((x) => x.nom)).toEqual([
            '[ ] le premier repère fictif 1 est relevé / n’est pas relevé',
            '[ ] le deuxième repère fictif 1 est expliqué / n’est pas expliqué',
            '[ ] le troisième repère fictif 1 est relié à l’ensemble / n’y est pas relié'
        ]);
        expect(o.grille.criteres.every((x) => x.type === 'analytique')).toBe(true);
        expect(D.bilan(R)).toMatchObject({ logique: 'points', somme: 100 });
    });
});

describe('R — des raisons qui nomment', () => {
    it('R.a — un seul nom trop long : « coupe-le » ; trois : tous nommés, sans « autres »', () => {
        const un = D.creation(lire(couperTout(collerD(), [1, 2, 3, 4, 5])), {});
        expect(un.raisons).toContain('des noms de critères plus courts (200 caractères au plus) pour « Repérage fictif des images / 10 [ ] le… » : coupe-le avec « Couper »');
        const trois = D.creation(lire(couperTout(collerD(), [3, 4, 5])), {});
        expect(trois.raisons).toContain('des noms de critères plus courts (200 caractères au plus) pour '
            + '« Repérage fictif des images / 10 [ ] le… », « Classement fictif des images / 20 [ ] le… » et '
            + '« Interprétation fictive des motifs / 15 [… » : coupe-les avec « Couper »');
    });

    it('R.b — un élément observable trop long : nommé par ses premiers mots', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère fictif', 'critere'], ['/ 10', 'ponderation'], [ligneD(1), 'souscritere']] }]];
        const c = D.creation(lire(collerD(grille)), {});
        expect(c.raisons).toEqual(['des éléments observables plus courts (200 caractères au plus) pour « Classement fictif des images / 20 [ ] le… » : coupe-le avec « Couper »']);
    });

    it('R.c — une réponse trop longue (plus de 5 000 caractères) : nommée', () => {
        const longue = 'Une réponse fictive très développée ' + 'mot '.repeat(1300);
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère fictif', 'critere']] }],
            [{ l: [[longue.trim(), 'descripteur']] }, { l: [['3', 'points']] }]];
        const c = D.creation(lire(collerD(grille)), {});
        expect(c.raisons).toEqual(['des réponses plus courtes (5 000 caractères au plus) pour « Une réponse fictive très développée mot… » : coupe-le avec « Couper »']);
    });

    it('R.d — une case de niveau trop longue (grille en niveaux) : nommée, sans le mot « case »', () => {
        const longue = 'Attente fictive longuement décrite ' + 'mot '.repeat(1300);
        const grille = GRILLE_N.map((row, r) => (r === 2 ? [row[0], { l: [[longue.trim(), 'descripteur']] }, ...row.slice(2)] : row));
        const doc = D.docDepuisPressePapiers({ html: enHtml(grille), texte: '' });
        const R = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, etiquettes(grille)));
        const valeurs = {};
        D.clesNiveaux(R).forEach((k, i) => { valeurs[k] = { min: String(i * 34), max: String(i * 34 + 33), note: String(i * 34 + 20) }; });
        const c = D.creation(R, {}, undefined, { valeurs });
        expect(c.enNiveaux).toBe(true);
        expect(c.raisons).toEqual(['des réponses plus courtes (5 000 caractères au plus) pour « Attente fictive longuement décrite mot… » : coupe-le avec « Couper »']);
        expect(NIVEAUX_N.length).toBe(3);
    });

    it('R.e — une Pondération sans critère : la raison dit qu’une ligne de total prend « Total » (tableau : « dans sa rangée »)', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [[SECTIONS_D[0], 'section']] }], [{ l: [[TOTAUX_D[0], 'ponderation']] }]];
        expect(lire(collerD(grille)).sansPlace).toEqual([{ t: TOTAUX_D[0], type: 'ponderation', raison: 'aucun critère dans sa rangée ; une ligne de total prend l’étiquette « Total »' }]);
        // Dans un texte brut, l'ordre fait foi : « avant lui ».
        const doc = D.docDepuisPressePapiers({ texte: ['Titre fictif', TOTAUX_D[0]].join('\n') });
        const R = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, ['titre', 'ponderation']));
        expect(R.sansPlace).toEqual([{ t: TOTAUX_D[0], type: 'ponderation', raison: 'aucun critère avant lui ; une ligne de total prend l’étiquette « Total »' }]);
    });

    it('R.f — une seconde Pondération pour un même critère : sans place, plus en silence (même rangée ; texte brut)', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère fictif', 'critere'], ['/ 10', 'ponderation'], ['/ 70', 'ponderation']] }]];
        const R = lire(collerD(grille));
        expect(R.criteres[0].pond).toBe(10);
        expect(R.sansPlace).toEqual([{ t: '/ 70', type: 'ponderation', raison: 'son critère a déjà une pondération (10) ; une ligne de total prend l’étiquette « Total »' }]);
        const doc = D.docDepuisPressePapiers({ texte: ['Critère fictif', '/ 25', TOTAUX_D[0]].join('\n') });
        const T = D.comprendre(doc, liensPar(D.morceaux(doc).ordre, ['critere', 'ponderation', 'ponderation']));
        expect(T.criteres[0].pond).toBe(25);
        expect(T.sansPlace.map((x) => x.raison)).toEqual(['son critère a déjà une pondération (25) ; une ligne de total prend l’étiquette « Total »']);
    });

    it('R.g — C1 : une ligne Critère sans pondération, une Pondération sur la rangée de total : sans place, le critère intact', () => {
        // (d) telle que collée (critères sur leur ligne entière), une Pondération sur chaque total : la forme de ce midi.
        const R = lire(collerD());
        expect(R.criteres.map((c) => c.pond)).toEqual([null, null, null, null, null, null]);
        expect(R.sansPlace).toEqual(TOTAUX_D.map((t) => ({ t, type: 'ponderation', raison: 'aucun critère dans sa rangée ; une ligne de total prend l’étiquette « Total »' })));
        // Coupée, ses totaux encore en Pondération : chaque critère garde la sienne, les totaux restent sans place.
        const e = dDecoupee();
        TOTAUX_D.forEach((t) => { e.liens[idDe(e.doc, t)] = 'ponderation'; });
        const C = lire(e);
        expect(C.criteres.map((c) => c.pond)).toEqual([10, 20, 15, 25, 10, 20]);
        expect(C.sansPlace.map((x) => x.t)).toEqual(TOTAUX_D);
        // Une Pondération dans une rangée fusionnée avec celle du critère se range sous lui.
        const fusion = { mode: 'table', rows: [
            [{ cs: 1, rs: 2, lines: [{ id: 'm1', t: 'Critère fictif' }] }, { cs: 1, rs: 1, lines: [{ id: 'm2', t: 'Réponse fictive' }] }],
            [{ cs: 1, rs: 1, lines: [{ id: 'm3', t: '/ 15' }] }]
        ] };
        const F = D.comprendre(fusion, { m1: 'critere', m3: 'ponderation' });
        expect(F.criteres[0].pond).toBe(15);
        expect(F.sansPlace).toEqual([]);
    });
});

/** (d), ses lignes de critère dont le rang est dans `rangs` coupées et étiquetées ; les autres, telles quelles. */
function couperTout(e0, rangs) {
    let e = e0;
    rangs.forEach((i) => { e = couperLigne(e, i); });
    return e;
}

describe('N — aucun renvoi à l’assistant', () => {
    it('N.a — des Points sans nombre, aucun critère pondéré : le message de l’étape est remplacé par celui de la dissection', () => {
        const grille = [[{ l: [['Titre fictif', 'titre']] }], [{ l: [['Critère fictif', 'critere']] }],
            [{ l: [['Réponse fictive', 'descripteur']] }, { l: [['beaucoup', 'points']] }]];
        const R = lire(collerD(grille));
        expect(D.bilan(R).logique).toBe('points');
        const c = D.creation(R, {});
        // Lot 9 : à compléter, sans bloquer ; ici, c'est le morceau « beaucoup », sans place, qui bloque.
        expect(c.aCompleter).toContain('les points de chaque critère : surligne le poids de chaque critère avec l’étiquette « Pondération », ou ce que vaut chaque réponse avec l’étiquette « Points »');
        expect(c.raisons).toContain('une place pour le morceau étiqueté listé plus bas');
        sansRenvoiAssistant(c.raisons.concat(c.aCompleter));
        // L'assistant, lui, garde son message.
        expect(A.calculs(c.modele, {}).manquants.some((t) => t.includes('« ' + A.NOMS_ETAPES.roles + ' »'))).toBe(true);
    });

    it('N.b — sans aucune logique, le message n’est pas répété : « des points ou des niveaux » l’a déjà dit', () => {
        const c = D.creation(lire(collerD()), {});
        expect(c.raisons.filter((r) => r.startsWith('les points de chaque critère'))).toEqual([]);
        expect(c.raisons.some((r) => r.startsWith('des points ou des niveaux'))).toBe(true);
    });

    it('N.c — sur toutes les grilles fictives de ce banc, aucune raison ne nomme une étape de l’assistant', () => {
        [collerD(), dDecoupee(), couperTout(collerD(), [0, 2])].forEach((e) => sansRenvoiAssistant(D.creation(D.comprendre(e.doc, e.liens), {}).raisons));
    });
});
