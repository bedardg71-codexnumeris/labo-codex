// =======================================================================
// LE SEPTIÈME PARCOURS, « LIRE TA CLASSE ET INTERVENIR » — 22 NOVEMBRE 2026 : LES MOTS, DANS LES DEUX SENS
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 3. Les textes entre « Début » et « Fin »
// sont validés par Grégoire le 22 nov. 2026, mot pour mot. Ce banc lit la consigne (`_helpers/consigne-2026-11-22-
// parcours.js`) et le VRAI js/parcours-lire-ta-classe.js, chargé dans un bac à sable, et exige, bulle par bulle, les
// mêmes titres, confirmations, phrases du lieu, explications, gestes et gestes principaux, dans le même ordre : ce que la
// consigne dit et que le code ne dit pas rougit, ce que le code dit et que la consigne ne dit pas aussi.
//   · « Je regarde » : huit bulles ; les deux lignes à crochets de la bulle 4, remplies d'après l'écran (mesure M4).
//   · « Nous faisons » : neuf bulles ; la bulle 5 « seulement si aucune grille n'est désignée » ; la bulle 6 et sa variante.
//   · L'objectif et l'objectif atteint des deux temps ; le plan que « Remplir » écrit (bulle 6), mot pour mot.
//   · Les refus du panneau restent ceux du code (8 et 9 nov.) ; le refus du modèle est PROPOSÉ (rapport du lot).
// Break-test (22 nov.) : au rapport du lot (plans de travail/RAPPORT-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md).
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { bullesDu, correspond, CONSIGNE_22_NOV_SOIR, retoucheDeLaSuite, texteDeLaSuite } from './_helpers/consigne-2026-11-22-parcours.js';

function charger() {
    const enregistres = [];
    const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer: (d) => enregistres.push(d) } };
    chargerScript('js/parcours-lire-ta-classe.js', { db: { getSync: (k, d) => d }, cle: (k) => k }, win);
    return { P: win.ParcoursLireTaClasse, def: enregistres[0] };
}

const { P, def } = charger();
const TEMPS = [['3.1', 'modele', 'Je regarde', 8], ['3.2', 'pratique', 'Nous faisons', 9]];

/**
 * LA SUITE DU 22 NOV. (15 h ; plans de travail/CONSIGNE-2026-11-22-parcours-6-7-8-suite.md, 1.1 à 1.6) : six phrases du
 * « Je regarde » retouchées, lues dans la nouvelle consigne et appliquées aux bulles de la précédente. Chaque retouche
 * doit trouver sa ligne (sinon l'une des deux consignes a bougé).
 */
const LIGNE_DU_NIVEAU = 'Elle situe Tapir Doux au [niveau affiché] : [la phrase que la carte affiche].';
const LIGNE_DU_DEFI = '« Défi principal : [le critère affiché] ». Le défi, c\'est le critère de la grille où ses résultats sont les plus bas.';
function retouchees(bulles) {
    const remplacements = ['1.1', '1.2', '1.5', '1.6'].map((r) => [r, retoucheDeLaSuite(r)])
        .concat([['1.3', { avant: LIGNE_DU_NIVEAU, apres: texteDeLaSuite('1.3') }], ['1.4', { avant: LIGNE_DU_DEFI, apres: texteDeLaSuite('1.4') }]]);
    const faites = new Set();
    const poser = (lignes) => lignes.map(([t, x]) => {
        const r = remplacements.find(([, v]) => v.avant === x);
        if (!r) return [t, x];
        faites.add(r[0]);
        return [t, r[1].apres];
    });
    const out = bulles.map((b) => Object.assign({}, b, { lignes: poser(b.lignes), puis: b.puis ? Object.assign({}, b.puis, { lignes: poser(b.puis.lignes) }) : null }));
    expect([...faites].sort(), 'chaque retouche de la suite a trouvé sa ligne').toEqual(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6']);
    return out;
}

/** Ce que le code dit d'une bulle, dans la forme de la consigne. */
function vuDuCode(b, k) {
    return {
        titre: b.titre,
        petit: k === 0 ? null : (b.confirme || null),
        lieuSuite: b.lieuSuite === undefined ? null : b.lieuSuite,
        lignes: b.lignes,
        puis: b.puis ? { lieuSuite: b.puis.lieuSuite === undefined ? null : b.puis.lieuSuite, lignes: b.puis.lignes } : null
    };
}

/** Ce que la consigne dit d'une bulle. La phrase du lieu : « Tu es dans « X », à l'onglet « Y » » vient du moteur. */
function vuDeLaConsigne(c) {
    return {
        titre: c.titre,
        petit: c.rang === 1 ? null : (c.petit || null),
        lieuSuite: c.lieu ? c.lieu.suite : null,
        lignes: c.lignes,
        puis: c.puis ? { lieuSuite: c.puis.lieu ? c.puis.lieu.suite : null, lignes: c.puis.lignes } : null
    };
}

describe.each(TEMPS)('§ %s · « %s » (%s), bulle par bulle', (repere, cle, nom, total) => {
    const consigne = repere === '3.1' ? retouchees(bullesDu(repere)) : bullesDu(repere);
    const code = P.textes[cle];

    it(`${total} bulles, numérotées « n sur ${total} », de part et d'autre`, () => {
        expect(consigne.map((b) => [b.rang, b.total])).toEqual(Array.from({ length: total }, (_, i) => [i + 1, total]));
        expect(code).toHaveLength(total);
    });

    it.each(Array.from({ length: total }, (_, k) => [k + 1]))('bulle %i : mêmes mots, même ordre, dans les deux sens', (n) => {
        const c = vuDeLaConsigne(consigne[n - 1]);
        const v = vuDuCode(code[n - 1], n - 1);
        expect(v.titre).toBe(c.titre);
        expect(v.petit).toBe(c.petit);
        expect(v.lieuSuite).toBe(c.lieuSuite);
        expect(v.lignes.map((l) => l[0])).toEqual(c.lignes.map((l) => l[0]));
        c.lignes.forEach((l, i) => expect(correspond(l[1], v.lignes[i][1]), `ligne ${i + 1} : « ${v.lignes[i][1]} »`).toBe(true));
        expect(!!v.puis).toBe(!!c.puis);
        if (c.puis) {
            expect(v.puis.lieuSuite).toBe(c.puis.lieuSuite);
            expect(v.puis.lignes).toEqual(c.puis.lignes);
        }
    });

    it('la première bulle dit l\'entrée du parcours (posée par le moteur) et son objectif ; la dernière, l\'objectif atteint et la suite', () => {
        const premiere = consigne[0], derniere = consigne[total - 1];
        expect(premiere.petit).toBe(`Parcours 7 · ${def.titre} · ${nom}`);
        expect(premiere.objectif).toBe(P.objectifs[cle]);
        expect(derniere.atteint).toBe(P.objectifs[cle + 'Atteint']);
        expect(derniere.suite).toMatch(/^Suite suggérée : le parcours 8, « Automatiser tes commentaires »\. Boutons : /);
        const definition = cle === 'modele' ? P.definitionModele : P.definition;
        expect([definition.objectif, definition.objectifAtteint]).toEqual([P.objectifs[cle], P.objectifs[cle + 'Atteint']]);
        expect(definition.etapes).toHaveLength(total);
        expect(definition.etapes.map((e) => e.titre)).toEqual(consigne.map((b) => b.titre));
    });
});

describe('les cas particuliers de la consigne', () => {
    it('« Je regarde », bulle 4 : les deux lignes de la suite (1.3, 1.4) citent ce que l\'écran affiche (M4), relu au banc (1.8)', () => {
        const lignes = P.textes.modele[3].lignes.map((l) => l[1]);
        expect(lignes).toContain(texteDeLaSuite('1.3'));
        expect(lignes).toContain(texteDeLaSuite('1.4'));
        expect(texteDeLaSuite('1.3')).toContain(`« ${P.ecranM4.niveau} »`);
        expect(texteDeLaSuite('1.4')).toContain(`« Défi principal : ${P.ecranM4.defi} »`);
    });

    it('« Nous faisons », bulle 5 : seulement sans grille de dépistage ; la bulle 6, après elle, sa confirmation et son lieu', () => {
        const b = bullesDu('3.2');
        expect(b[4].condition).toBe('seulement si aucune grille n\'est désignée');
        expect(b[5].petitNote).toBe('Après la bulle 5, à la place : « C\'est fait : ta grille de dépistage est choisie. », suivie de la phrase du lieu « Tu es revenu·e dans « Suivi », à l\'onglet « Profils ». »');
        const v = P.textes.pratique[5].apresLaGrille;
        expect(b[5].petitNote).toContain(`« ${v.confirme} »`);
        expect(b[5].petitNote).toContain(`« ${v.lieuVerbe} « Suivi », à l'onglet « Profils ». »`);
    });

    it('« Nous faisons », bulle 2 : l\'avis quand la personne n\'a aucune donnée, inchangé (validé le 9 nov.)', () => {
        const note = bullesDu('3.2')[1].notes.join(' ');
        expect(note).toContain(`« ${P.refus9nov.sansDonnee} »`);
    });

    it('le plan que « Remplir » écrit (bulle 6 de « Je regarde ») : mot pour mot, chaque étape sur sa propre ligne', () => {
        const plan = P.plan;
        const consigne = consigneDuPlan();
        expect(consigne).toContain(`Titre : « ${plan.titre} »`);
        expect(consigne).toContain(`Objectif visé : « ${plan.objectif} »`);
        expect(consigne).toMatch(/Niveau 3\. Tapir Doux seul\. Durée : une période\. Critère ciblé : Rigueur seulement\./);
        expect([plan.niveau, plan.duree, plan.critere]).toEqual(['3', '1', 'Rigueur']);
        const description = plan.description.split('\n');
        expect(description).toHaveLength(6);
        expect(consigne).toContain('Description, chaque ligne numérotée sur sa propre ligne : « ' + description.join(' ') + ' »');
    });

    it('les refus : ceux du panneau sont ceux du code (8 et 9 nov.) ; celui du modèle, celui de la suite (1.7), mot pour mot', () => {
        expect(P.refus.sansPresences).toBe("Commence par « Mettre ta classe en place » : tes présences donnent le premier signal.");
        expect(P.refus9nov.demo).toBe('Ce parcours se joue sur ta propre classe : quitte la démonstration pour le commencer.');
        expect(P.texteRefusModele).toBe(texteDeLaSuite('1.7'));
        expect(def.prealable(P.texteRefusModele)).toBe('recevoir');
        expect(def.totalModele).toBe(8);
        expect(def.total).toBe(9);
        expect(typeof def.defaireModele).toBe('function');
    });
});

/** La ligne de la consigne qui dit ce que « Remplir » écrit dans la fiche (le plan de Grégoire, 15 nov.). */
function consigneDuPlan() {
    const i = CONSIGNE_22_NOV_SOIR.indexOf('CE QUE « REMPLIR » ÉCRIT DANS LA FICHE (bulle 6)');
    return CONSIGNE_22_NOV_SOIR.slice(i, CONSIGNE_22_NOV_SOIR.indexOf('\n', i));
}
