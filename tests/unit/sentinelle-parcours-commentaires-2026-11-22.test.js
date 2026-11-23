// =======================================================================
// LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » — 22 NOVEMBRE 2026 : LES MOTS, DANS LES DEUX SENS
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 4.2. Ce banc lit la consigne
// (`_helpers/consigne-2026-11-22-parcours.js`) et le VRAI js/parcours-commentaires.js, chargé dans un bac à sable, et exige,
// bulle par bulle, les mêmes titres, confirmations, phrases du lieu, explications, gestes et gestes principaux, dans le
// même ordre : ce que la consigne dit et que le code ne dit pas rougit, et l'inverse.
//   · « Nous faisons » : dix bulles sur le chemin complet (grille, compte, codes, note, cas et lecture en une bulle à deux
//     formes, production, productions, poser, rétroaction, suite) ; la variante sans fichier remplace les bulles 8 et 9.
//   · L'objectif et l'objectif atteint ; la phrase sous « Continuer » de la bulle 3, celle du code.
//   · « Je regarde » (§ 4.1 ; la suite du 22 nov., 15 h, point 6) : huit bulles ; « [nombre] » de la bulle 7 devient 300,
//     comme la suite le cite ; ce que « Remplir » pose, lu dans la consigne ; le refus PROPOSÉ, dans le moule de 1.7.
// Break-test (22 nov.) : au rapport du lot.
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { bullesDu, consigneDu, citations, ligneDeLaSuite, texteDeLaSuite, retouchesDeLaRelease, appliquerRetouches } from './_helpers/consigne-2026-11-22-parcours.js';

function charger() {
    const enregistres = [];
    const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer: (d) => enregistres.push(d) } };
    chargerScript('js/parcours-commentaires.js', { db: { getSync: (k, d) => d }, cle: (k) => k, obtenirPreference: () => null }, win);
    return { P: win.ParcoursCommentaires, def: enregistres[0] };
}

const { P, def } = charger();
const CHEMIN = ['grille', 'compte', 'codes', 'note', 'casLit', 'production', 'productions', 'poser', 'retro', 'loin'];

// L'insécable devant « % » (la règle des nombres à la française, sentinelle-1137) : une espace pour la consigne, aucun mot
// ne change (bulle 4 du « Je regarde » : « 20 % »).
const plat = (lignes) => lignes.map(([t, x]) => [t, x.replace(/\u00a0%/g, ' %')]);
const vuDuCode = (b, premiere) => ({
    titre: b.titre, petit: premiere ? null : (b.confirme || null), lieuSuite: b.lieuSuite === undefined ? null : b.lieuSuite,
    lignes: plat(b.lignes), puis: b.puis ? plat(b.puis.lignes) : null
});
const vuDeLaConsigne = (c, premiere) => ({
    titre: c.titre, petit: premiere ? null : (c.petit || null), lieuSuite: c.lieu ? c.lieu.suite : null,
    lignes: c.lignes, puis: c.puis ? c.puis.lignes : null
});

describe('§ 4.2 · « Nous faisons », bulle par bulle', () => {
    const consigne = bullesDu('4.2');
    const bulles = consigne.filter((b) => b.rang);
    const variante = consigne.find((b) => b.variante);

    it('dix bulles sur le chemin complet, et la variante sans fichier ; le chemin du code dans le même ordre', () => {
        expect(bulles.map((b) => [b.rang, b.total])).toEqual(Array.from({ length: 10 }, (_, i) => [i + 1, 10]));
        expect(variante.variante).toBe('LA VARIANTE SANS FICHIER (remplace les bulles 8 et 9)');
        expect(P.ordre.filter((k) => k !== 'retroSans')).toEqual(CHEMIN);
    });

    it.each(CHEMIN.map((k, i) => [i + 1, k]))('bulle %i (%s) : mêmes mots, même ordre, dans les deux sens', (n, cle) => {
        expect(vuDuCode(P.textes[cle], n === 1)).toEqual(vuDeLaConsigne(bulles[n - 1], n === 1));
    });

    it('la variante sans fichier : mêmes mots, même ordre ; son titre, que la consigne ne nomme pas, est celui de la bulle 9 (SUPPOSÉ)', () => {
        const { titre, ...code } = vuDuCode(P.textes.retroSans, false);
        const { titre: aucun, ...attendu } = vuDeLaConsigne(variante, false);
        expect(aucun).toBeUndefined();
        expect(code).toEqual(attendu);
        expect(titre).toBe(bulles[8].titre);
    });

    it('les bulles 6 et 7, sautées dans les cas du code ; la bulle 3, la phrase sous « Continuer » ; l\'entrée, l\'objectif et l\'objectif atteint', () => {
        expect(bulles[5].condition).toBe('sautée si la grille est déjà celle d\'une production');
        expect(bulles[6].condition).toBe('sautée si des productions sont déjà reçues pour elle');
        expect(bulles[2].notes).toEqual([`Sous « Continuer », tant qu'il n'y a aucun code : « ${P.attentes.codes} »`]);
        expect(bulles[0].petit).toBe(`Parcours 8 · ${def.titre} · Nous faisons`);
        expect([bulles[0].objectif, bulles[9].atteint]).toEqual([P.objectifs.pratique, P.objectifs.pratiqueAtteint]);
        expect([P.definition.objectif, P.definition.objectifAtteint]).toEqual([P.objectifs.pratique, P.objectifs.pratiqueAtteint]);
        expect(bulles[9].suite).toBe('Suite suggérée : le parcours 9 (son nom lu dans le panneau). Boutons : « Voir le parcours 9 », « Terminer ».');
    });
});

// ---------------------------------------------------------------------------------------------------------------
// « JE REGARDE » (§ 4.1, et la suite, point 6)
// ---------------------------------------------------------------------------------------------------------------

/** La ligne de la bulle 7 que la suite cite en entier (« → Écris le nombre de mots : 300 (…) »). */
const LIGNE_DES_MOTS = citations(ligneDeLaSuite('6.')).find((c) => c.startsWith('→ Écris le nombre de mots'));

/** Les bulles de § 4.1, « [nombre] » remplacé par la ligne que cite la suite ; elle doit y trouver sa place une fois. */
function bullesDuModele() {
    let faites = 0;
    const poser = (lignes) => lignes.map(([t, x]) => {
        if (!/\[nombre\]/.test(x)) return [t, x];
        faites++;
        expect('→ ' + x.replace('[nombre]', '300')).toBe(LIGNE_DES_MOTS);
        return [t, LIGNE_DES_MOTS.slice(2)];
    });
    const out = bullesDu('4.1').map((b) => Object.assign({}, b, { lignes: poser(b.lignes), puis: b.puis ? Object.assign({}, b.puis, { lignes: poser(b.puis.lignes) }) : null }));
    expect(faites, 'la ligne « [nombre] » de la bulle 7').toBe(1);
    // LA RELEASE (22 nov. 2026, 20 h 52 ; CONSIGNE-2026-11-22-release-publication.md, 1b et 1c) : deux phrases ajustées à
    // ce que l'écran montre (la production sur « Deux-Rives » ; « Ta rédaction contient… »). Lues dans la consigne de la
    // release, appliquées aux bulles 6 et 5 ; chacune doit y trouver sa ligne, une fois.
    // Break-tests (23 nov. 2026) : « Artefact 1 » remis dans la bulle 6 du code → bulle 6 rouge ; « Ta production
    // contient… » remis dans la bulle 5 → bulle 5 rouge.
    const R = retouchesDeLaRelease();
    const r = appliquerRetouches(out, [R.b, R.c]);
    expect(r.faites, 'les retouches 1b et 1c de la release ont trouvé leur ligne').toEqual([1, 1]);
    return r.bulles;
}

describe('§ 4.1 · « Je regarde », bulle par bulle', () => {
    const consigne = bullesDuModele();

    it('huit bulles, numérotées « n sur 8 », de part et d\'autre', () => {
        expect(consigne.map((b) => [b.rang, b.total])).toEqual(Array.from({ length: 8 }, (_, i) => [i + 1, 8]));
        expect(P.textesModele.bulles).toHaveLength(8);
        expect(P.etapesModele).toHaveLength(8);
        expect(def.totalModele).toBe(8);
    });

    it.each(Array.from({ length: 8 }, (_, k) => [k + 1]))('bulle %i : mêmes mots, même ordre, dans les deux sens', (n) => {
        expect(vuDuCode(P.textesModele.bulles[n - 1], n === 1)).toEqual(vuDeLaConsigne(consigne[n - 1], n === 1));
    });

    it('l\'entrée, l\'objectif, l\'objectif atteint et la suite ; les titres des étapes', () => {
        const premiere = consigne[0], derniere = consigne[7];
        expect(premiere.petit).toBe(`Parcours 8 · ${def.titre} · Je regarde`);
        expect([premiere.objectif, derniere.atteint]).toEqual([P.textesModele.objectif, P.textesModele.objectifAtteint]);
        expect([P.definitionModele.objectif, P.definitionModele.objectifAtteint]).toEqual([P.textesModele.objectif, P.textesModele.objectifAtteint]);
        expect(derniere.suite).toBe('Suite suggérée : le parcours 9 (son nom lu dans le panneau, comme pour les autres). Boutons : « Le refaire avec ma classe », « Voir le parcours 9 », « Terminer ».');
        expect(P.etapesModele.map((e) => e.titre)).toEqual(consigne.map((b) => b.titre));
    });

    it('ce que « Remplir » pose, lu dans la consigne : le nom, les quatre formes, les pondérations, la limite, les niveaux ; 300 mots', () => {
        const c = consigneDu('4.1'), m = P.materielModele;
        expect(c).toContain(`ajoute un cinquième critère, « ${m.critere} », à la « ${m.grille} »`);
        expect(c).toContain(`à la bulle 1, le nom « ${m.critere} »`);
        expect(c).toContain('à la bulle 2, ' + m.noms.map((x) => `« ${x[2]} »`).join(', ').replace(/, (« mots »)$/, ', $1'));
        const p = m.ponderations;
        expect(c).toContain(`la pondération ${p['Français écrit']} % pour « Français écrit » et les quatre autres ramenés à Structure ${p.Structure}, Rigueur ${p.Rigueur}, Plausibilité ${p['Plausibilité']}, Nuance ${p.Nuance}`);
        expect(c).toContain(`la limite de ${m.limite.erreursTolerees} erreurs pour ${m.limite.motsReference} mots`);
        const n = m.niveaux;
        expect(c).toContain(`les quatre niveaux d'Antilope Vaillante : Structure ${n.Structure}, Rigueur ${n.Rigueur}, Plausibilité ${n['Plausibilité']}, Nuance ${n.Nuance}`);
        expect(LIGNE_DES_MOTS).toContain(`: ${m.mots} (`);
        // « Refaire » rend aux quatre critères leurs pondérations d'avant, celles de la grille de l'exemple (parcours 3).
        expect(Object.values(m.avant).reduce((a, b) => a + b, 0)).toBe(100);
        expect(Object.values(p).reduce((a, b) => a + b, 0)).toBe(100);
    });

    it('le refus PROPOSÉ : le moule de 1.7, la production d\'Antilope Vaillante ; il renvoie au modèle de « Recevoir »', () => {
        expect(P.texteRefusModele).toBe(texteDeLaSuite('1.7').replace('la production de Tapir Doux', 'la production d\'Antilope Vaillante'));
        expect(P.texteRefusModele).not.toBe(texteDeLaSuite('1.7'));
        expect(def.prealable(P.texteRefusModele)).toBe('recevoir');
        expect(def.prealable('autre')).toBe('evaluer');
        expect(typeof def.lancerModele).toBe('function');
        expect(typeof def.defaireModele).toBe('function');
    });
});
