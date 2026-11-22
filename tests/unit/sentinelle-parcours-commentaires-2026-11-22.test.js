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
// Break-test (22 nov.) : au rapport du lot.
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { bullesDu } from './_helpers/consigne-2026-11-22-parcours.js';

function charger() {
    const enregistres = [];
    const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer: (d) => enregistres.push(d) } };
    chargerScript('js/parcours-commentaires.js', { db: { getSync: (k, d) => d }, cle: (k) => k, obtenirPreference: () => null }, win);
    return { P: win.ParcoursCommentaires, def: enregistres[0] };
}

const { P, def } = charger();
const CHEMIN = ['grille', 'compte', 'codes', 'note', 'casLit', 'production', 'productions', 'poser', 'retro', 'loin'];

const vuDuCode = (b, premiere) => ({
    titre: b.titre, petit: premiere ? null : (b.confirme || null), lieuSuite: b.lieuSuite === undefined ? null : b.lieuSuite,
    lignes: b.lignes, puis: b.puis ? b.puis.lignes : null
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
