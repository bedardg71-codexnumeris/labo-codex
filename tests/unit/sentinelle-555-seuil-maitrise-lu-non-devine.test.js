import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #555 lot 2 (28 août 2026) — le seuil de maîtrise se LIT sur l'échelle.
//
// CE QUI ÉTAIT LÀ. `_detecterSeuilMaitrise` appliquait une convention écrite en
// commentaire : « avant-dernier niveau = maîtrise, son min/100 = seuil, repli
// 0.75 ». Sur l'échelle de Grégoire (I, D, M, E) l'avant-dernier EST M : la
// convention tombait juste PAR COÏNCIDENCE, et c'est pour cela que personne ne
// l'avait vue. Sur une échelle à trois paliers l'avant-dernier est celui du
// MILIEU ; sur une échelle portant un « 0 » de jugement suspendu le compte se
// décale ; sur une échelle ordonnée autrement elle désigne n'importe quoi.
//
// Le lot 1 a doté l'échelle de `seuilMaitrise`, un CODE de niveau posé par
// l'utilisateur. Ce lot le branche.
//
// DÉCISION DE GRÉGOIRE (28 août) : quand le repère n'est PAS posé, la matrice
// CALCULE ET LE DIT — elle ne devine pas en silence (ce qui a produit le défaut)
// et elle ne se retire pas non plus chez les expérimentateurs qui n'ont pas
// encore posé leurs repères. D'où {valeur, deduite, raison}.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. rétablir la convention seule (ignorer `echelle.seuilMaitrise`) → cas 1 et
//      surtout le cas 2 rougissent — c'est le cas 2 qui prouve le branchement,
//      car son repère et son avant-dernier niveau DIFFÈRENT.
//   2. remettre `(niveau.min || 75)` à la place de `min != null` → cas 3 rougit.
//   3. rendre `deduite: false` en dur → les cas 4 à 7 rougissent.
//   4. retomber silencieusement sur la convention quand le code est introuvable
//      → cas 5 rougit (la raison, pas la valeur).

const win = chargerScript('js/consolidation.js', {});
const detecter = win._detecterSeuilMaitrise;

// Une échelle où le repère et « l'avant-dernier niveau » DIVERGENT : c'est le
// seul montage qui distingue une lecture d'une devinette. Saisie dans le
// désordre, pour que le tri par `min` compte vraiment.
const ECHELLE_DIVERGENTE = {
    seuilMaitrise: 'B',
    niveaux: [
        { code: 'C', min: 80, max: 100 },
        { code: 'A', min: 0, max: 39 },
        { code: 'D', min: 40, max: 59 },   // avant-dernier une fois trié : C (80)
        { code: 'B', min: 60, max: 79 }
    ]
};

describe('#555 lot 2 · le seuil de maîtrise se lit sur l\'échelle', () => {

    it('1. le repère posé est lu, et le résultat ne se dit pas déduit', () => {
        const r = detecter({
            seuilMaitrise: 'M',
            niveaux: [
                { code: 'I', min: 0, max: 59 },
                { code: 'D', min: 60, max: 74 },
                { code: 'M', min: 75, max: 84 },
                { code: 'E', min: 85, max: 100 }
            ]
        });
        expect(r.valeur).toBe(0.75);
        expect(r.deduite, 'un repère lu ne doit pas être annoncé comme déduit').toBe(false);
        expect(r.raison).toBeNull();
    });

    it('2. LE CAS QUI PROUVE LE BRANCHEMENT · repère ≠ avant-dernier niveau', () => {
        // Repère « B » (min 60) ; l'avant-dernier niveau trié est « C » (min 80).
        // L'ancienne convention rendait 0,80 — la lecture rend 0,60.
        const r = detecter(ECHELLE_DIVERGENTE);
        expect(r.valeur, 'la convention « avant-dernier » a repris le dessus').toBe(0.60);
        expect(r.deduite).toBe(false);
    });

    it('3. un niveau repère dont le min vaut 0 rend 0, pas 0,75', () => {
        // Le piège de l'ancien code : `(niveau.min || 75)` remplaçait un 0
        // légitime par 75. Un « 0 » est un cran d'échelle, pas une absence.
        const r = detecter({
            seuilMaitrise: 'Z',
            niveaux: [
                { code: 'Z', min: 0, max: 49 },
                { code: 'Y', min: 50, max: 100 }
            ]
        });
        expect(r.valeur).toBe(0);
        expect(r.deduite).toBe(false);
    });

    it('4. sans repère posé, la convention sert ENCORE mais se dit déduite', () => {
        const r = detecter({
            niveaux: [
                { code: 'I', min: 0, max: 59 },
                { code: 'D', min: 60, max: 74 },
                { code: 'M', min: 75, max: 84 },
                { code: 'E', min: 85, max: 100 }
            ]
        });
        expect(r.valeur, 'la fonction ne doit pas être retirée aux échelles sans repère').toBe(0.75);
        expect(r.deduite).toBe(true);
        expect(r.raison).toBe('repere-non-pose');
    });

    it('5. un repère qui ne correspond à aucun niveau se dit introuvable', () => {
        // Niveau renommé ou supprimé depuis que le repère a été posé : c'est une
        // incohérence de données, pas une absence de repère. Les deux ne doivent
        // pas se confondre dans le message rendu à l'écran.
        const r = detecter({
            seuilMaitrise: 'DISPARU',
            niveaux: [
                { code: 'A', min: 0, max: 49 },
                { code: 'B', min: 50, max: 79 },
                { code: 'C', min: 80, max: 100 }
            ]
        });
        expect(r.deduite).toBe(true);
        expect(r.raison).toBe('repere-introuvable');
        expect(r.valeur, 'le repli reste la convention, pour ne pas vider l\'écran').toBe(0.50);
    });

    it('6. un repère sans borne inférieure se dit tel quel', () => {
        const r = detecter({
            seuilMaitrise: 'B',
            niveaux: [
                { code: 'A', min: 0, max: 49 },
                { code: 'B', max: 100 }
            ]
        });
        expect(r.deduite).toBe(true);
        expect(r.raison).toBe('repere-sans-min');
    });

    it('7. une échelle non résolue se dit non résolue', () => {
        for (const cas of [null, undefined, {}, { niveaux: [] }, { niveaux: [{ code: 'A', min: 0 }] }]) {
            const r = detecter(cas);
            expect(r.deduite, `échelle ${JSON.stringify(cas)} : devrait être déduite`).toBe(true);
            expect(r.raison).toBe('echelle-non-resolue');
            expect(typeof r.valeur, 'une valeur numérique reste due : un seuil null rendrait toute comparaison `>=` vraie').toBe('number');
        }
    });

    it('7bis. une échelle de PRATIQUE se distingue d\'une échelle introuvable', () => {
        // Une évaluation faite sous une pratique configurable porte
        // `echelleId = 'pratique-<id>'`. Cette échelle est synthétisée à la volée
        // (`evaluation-chargement.js:253`), n'existe pas dans `echellesTemplates`,
        // et `_detecterEchelle` rend donc null — comme pour une échelle vraiment
        // perdue. Mais l'utilisateur ne peut PAS y poser de repère : lui dire
        // « échelle non retrouvée » lui ferait chercher une case qui n'existe pas.
        const r = detecter(null, 'pratique-abc123');
        expect(r.deduite).toBe(true);
        expect(r.raison, 'une échelle de pratique n\'est pas une échelle introuvable').toBe('echelle-de-pratique');

        // Et l'inverse tient : un id ordinaire non résolu reste « non résolue ».
        expect(detecter(null, 'ECH_1767389426695').raison).toBe('echelle-non-resolue');
        expect(detecter(null).raison, 'sans id, on ne peut rien affirmer de plus').toBe('echelle-non-resolue');
    });

    it('8. le code du repère est comparé sans tenir compte de la casse', () => {
        const r = detecter({
            seuilMaitrise: 'm',
            niveaux: [
                { code: 'I', min: 0, max: 74 },
                { code: 'M', min: 75, max: 100 }
            ]
        });
        expect(r.deduite, 'une casse différente ne doit pas faire perdre le repère').toBe(false);
        expect(r.valeur).toBe(0.75);
    });

    it('9. le retour porte toujours les trois champs, quel que soit le chemin', () => {
        // Un consommateur lit `.deduite` sans savoir par où le calcul est passé :
        // un chemin qui rendrait un nombre nu le casserait en silence.
        const cas = [
            ECHELLE_DIVERGENTE,
            { niveaux: [{ code: 'A', min: 0 }, { code: 'B', min: 50 }] },
            { seuilMaitrise: 'X', niveaux: [{ code: 'A', min: 0 }, { code: 'B', min: 50 }] },
            null
        ];
        for (const c of cas) {
            const r = detecter(c);
            expect(r, `retour non-objet pour ${JSON.stringify(c)}`).toBeTypeOf('object');
            expect(Object.keys(r).sort()).toEqual(['deduite', 'raison', 'valeur']);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// LA RÉSERVE ARRIVE-T-ELLE À L'ÉCRAN ?
//
// Une fonction peut rendre `deduite: true` sans que personne ne l'affiche : le
// 28 août au matin, un module entier a été rebranché sans qu'une seule
// sentinelle s'en aperçoive, parce que les bancs couvraient l'ordre et le
// nommage, jamais les zones. Ces cas-ci couvrent le CÂBLAGE jusqu'au HTML.
//
// Break-tests : retirer `reserve` de la concaténation du bloc → cas 10 rougit ;
// afficher la réserve inconditionnellement → cas 11 rougit ; rendre un libellé
// unique quelle que soit la raison → cas 12 rougit.
// ─────────────────────────────────────────────────────────────────────────────

function monterBloc(consolidation) {
    const win = chargerScript('js/profil-etudiant-diagnostics.js', {
        echapperHtml: (s) => String(s == null ? '' : s),
        calculerConsolidationIndividuelle: () => consolidation
    });
    return win.genererBlocConsolidation('DA_TEST');
}

const RESUME_MINIMAL = { 'Structure': { type: 'consolide', artefactNom: 'P1' } };

describe('#555 lot 2 · la réserve se rend à l\'écran', () => {

    it('10. seuil déduit → le bloc porte la mention', () => {
        const html = monterBloc({
            resume: RESUME_MINIMAL,
            seuilMaitriseDeduit: true,
            seuilMaitriseRaison: 'repere-non-pose'
        });
        expect(html).toContain('Seuil de maîtrise déduit');
        expect(html, 'la mention doit nommer la cause, pas rester générique').toContain('aucun repère');
    });

    it('11. seuil lu → AUCUNE mention, et le bloc n\'est pas vide pour autant', () => {
        const html = monterBloc({
            resume: RESUME_MINIMAL,
            seuilMaitriseDeduit: false,
            seuilMaitriseRaison: null
        });
        // L'ordre compte : un `not.toContain` est satisfait par une chaîne vide.
        // On prouve d'abord que le bloc a bien été rendu.
        expect(html, 'le bloc doit exister avant qu\'on affirme ce qu\'il ne contient pas').toContain('Consolidation :');
        expect(html).toContain('Structure');
        expect(html, 'une mention de réserve sur un seuil pourtant lu').not.toContain('Seuil de maîtrise déduit');
    });

    it('13. le libellé d\'une échelle de pratique ne réclame pas un geste impossible', () => {
        const html = monterBloc({
            resume: RESUME_MINIMAL,
            seuilMaitriseDeduit: true,
            seuilMaitriseRaison: 'echelle-de-pratique'
        });
        expect(html).toContain('Seuil de maîtrise déduit');
        expect(html).toContain('échelle de la pratique');
        // Le mot « retrouvée » appartient au cas d'une échelle vraiment perdue :
        // il enverrait l'utilisateur chercher une échelle qui n'a jamais existé.
        expect(html, 'le libellé confond échelle de pratique et échelle perdue').not.toContain('retrouvée');
    });

    it('12. chaque raison a son propre libellé', () => {
        const vus = new Set();
        for (const raison of ['repere-non-pose', 'repere-introuvable', 'repere-sans-min', 'echelle-non-resolue', 'echelle-de-pratique']) {
            const html = monterBloc({
                resume: RESUME_MINIMAL,
                seuilMaitriseDeduit: true,
                seuilMaitriseRaison: raison
            });
            const mention = html.slice(html.indexOf('Seuil de maîtrise déduit'));
            expect(mention.length, `aucune mention rendue pour ${raison}`).toBeGreaterThan(0);
            expect(vus.has(mention), `deux raisons rendent le MÊME texte : ${raison}`).toBe(false);
            vus.add(mention);
        }
        expect(vus.size).toBe(5);
    });
});
