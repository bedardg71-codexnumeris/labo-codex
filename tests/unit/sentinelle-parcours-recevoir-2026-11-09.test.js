// =======================================================================
// LE QUATRIÈME PARCOURS : LES MOTS DE « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS », « NOUS FAISONS »
// RÉÉCRITS LE 19 NOV. 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-recevoir.md (les bulles validées par Grégoire, 11 h 17 à
// 11 h 44, mot pour mot). Ce banc lit le RELAIS de la consigne, où chaque ligne porte son genre ([C] confirmation, [L]
// suite de la phrase du lieu, [E] explication, [G] geste ; le dernier [G] est la consigne), et le confronte au code chargé
// hors du navigateur, bulle par bulle, dans les deux voies et dans les deux formes des bulles 4 et 6 sans fichier :
//   · chaque texte, dans son genre et dans l'ordre ; un geste « (ne se grise pas) » ne se grise jamais ;
//   · la confirmation, la phrase du lieu ; l'objectif et l'objectif atteint (la définition) ;
//   · les boutons, « Plus tard », le centre de la dernière bulle.
// Les noms du menu (« Tu es dans « Évaluation », à l'onglet « Préparer » ») sont LUS par le moteur ; la confirmation
// présente ou absente, la flèche, le crochet : jugés au navigateur (tests/integration/nous-faisons-recevoir-2026-11-19.spec.js).
// Les textes du 8 nov. (et leurs corrections du 9 nov.) sont remplacés.
// Break-test (19 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-nous-faisons-recevoir.md).

import { describe, it, expect } from 'vitest';
import { suiteEcrite, sectionDeLaConsigne } from './_helpers/fin-des-parcours-2026-11-20.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
// Le panneau (titre, ligne, refus) : inchangé depuis la consigne du 8 nov.
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md');
const NOUVELLE = lire('plans de travail/CONSIGNE-2026-11-19-nous-faisons-recevoir.md');
const RELAIS = tranche(NOUVELLE, 'Bulle 1, « Leurs productions »', '3. « Je regarde », bulle 6');
const MOTEUR = lire('js/parcours-moteur.js');

/** Le texte entre guillemets d'une ligne du relais : le premier « » fermant où les guillemets s'équilibrent. */
function cite(ligne) {
    const debut = ligne.indexOf('« ');
    for (let k = ligne.indexOf(' »', debut); k !== -1; k = ligne.indexOf(' »', k + 1)) {
        const t = ligne.slice(debut + 2, k);
        if ((t.match(/«/g) || []).length === (t.match(/»/g) || []).length) return { texte: t, reste: ligne.slice(k + 2) };
    }
    throw new Error('citation illisible : ' + ligne);
}

/** Les bulles du relais : par titre, leurs formes, chaque ligne dans son genre. */
function bullesDuRelais() {
    const bulles = [];
    let b = null, forme = null;
    for (const brut of RELAIS.split('\n')) {
        const l = brut.trim();
        let m;
        if ((m = /^Bulle (\d), « ([^»]+) »(?:, voie « ([^»]+) »)?/.exec(l))) {
            b = { n: Number(m[1]), titre: m[2], voie: m[3] || 'les deux', confirme: '', lieuSuite: '', formes: [[]] };
            forme = b.formes[0];
            bulles.push(b);
            continue;
        }
        if (!b) continue;
        if (/^Seconde forme/.test(l)) { forme = []; b.formes.push(forme); continue; }
        if ((m = /^\[(C|L|E|G)\](, après la consigne :)? « /.exec(l))) {
            const { texte, reste } = cite(l);
            if (m[1] === 'C') { b.confirme = texte; continue; }
            if (m[1] === 'L') { b.lieuSuite = texte; continue; }
            // « …critère », suivi hors du gras de « (la note se calcule à mesure) » : une seule consigne.
            const suivi = /^, suivi hors du gras de « (\([^)]*\)) »/.exec(reste);
            forme.push({ genre: m[1], texte: suivi ? texte + ' ' + suivi[1] : texte, jamaisGrise: /^ \(ne se grise pas\)/.test(reste) });
        }
    }
    // Le dernier geste de chaque forme est sa consigne.
    bulles.forEach((x) => x.formes.forEach((f) => {
        for (let k = f.length - 1; k >= 0; k--) if (f[k].genre === 'G') { f[k].genre = 'C'; break; }
    }));
    return bulles;
}

/** Les lignes du code, dans le genre que le moteur leur donne : explication, geste (il se fait), consigne. */
const seFait = (l) => !l.note && !!(l.fait || l.champs || (l.sous || []).some(seFait));
const classer = (lignes) => lignes.map((l) => ({
    genre: l.note ? 'E' : l.geste ? 'C' : seFait(l) ? 'G' : 'sans genre',
    texte: l.texte,
    jamaisGrise: !!(l.fait && !l.champs && String(l.fait).includes('return false'))
}));

/**
 * Le parcours, chargé hors du navigateur. `ouvert` : les éléments que le moteur verrait à l'écran (la fenêtre des tampons,
 * l'écran d'évaluation), pour lire la seconde forme d'une bulle.
 */
function charger(productions, ouvert = []) {
    const enregistres = [];
    const element = (id) => ({ id, classList: { contains: () => false, toggle() {} }, querySelector: () => null, getBoundingClientRect: () => ({}) });
    const win = {
        Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: (e) => !!(e && ouvert.includes(e.id)), premierVisible: () => null, actif: () => false, etapeCourante: () => null },
        addEventListener() {}
    };
    const document = { getElementById: (id) => (ouvert.includes(id) ? element(id) : null), querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: { classList: { toggle() {} } } };
    const globaux = { document };
    if (productions) {
        // Un groupe-cours actif et les productions données : la condition ne lit que celles du cours actif.
        globaux.db = { getSync: (k, d) => (k === 'groupeCoursActif' ? { id: 'GC_fictif' } : d) };
        globaux.obtenirDonneesSelonMode = (k) => (k === 'productions' ? productions : []);
    }
    chargerScript('js/parcours-recevoir.js', globaux, win);
    return { def: enregistres[0], api: win.ParcoursRecevoir };
}

/** Une constante du moteur, telle qu'il l'écrit. */
const dite = (nom) => new RegExp('var ' + nom + " = '((?:[^'\\\\]|\\\\.)*)';").exec(MOTEUR)[1].replace(/\\'/g, "'");

describe('« Recevoir les productions, rendre tes rétroactions », « Nous faisons » : les bulles du 19 nov., mot pour mot et dans leur genre', () => {
    const { def, api } = charger();
    const F = api.voies().fichiers, S = api.voies()['sans-fichier'];
    const relais = bullesDuRelais();
    const bulle = (n, voie) => relais.find((b) => b.n === n && (b.voie === 'les deux' || b.voie === voie || !voie) && b.formes[0].length);

    it('le relais : neuf bulles, la 6 dans ses deux voies, la 7 sans fichier décrite par celle avec fichiers', () => {
        expect(relais.map((b) => b.n + (b.voie === 'les deux' ? '' : ' ' + b.voie))).toEqual(
            ['1', '2', '3', '4', '5', '6 fichiers', '6 sans-fichier', '7 fichiers', '7 sans-fichier', '8', '9']);
        expect(relais.find((b) => b.n === 7 && b.voie === 'sans-fichier').formes).toEqual([[]]);   // décrite, pas listée
        expect(RELAIS).toContain("Bulle 7, « Ta rétroaction », voie « sans-fichier » (2 sur 4) : les mêmes lignes, sauf la première, qui devient « La section « Rétroaction » montre ce que ton étudiant·e lira dans sa synthèse : », et sans la ligne « Spécifique »");
    });

    it('le panneau : le titre, la ligne, neuf étapes avec fichiers, quatre sans ; les titres des bulles', () => {
        expect(def.titre).toBe('Recevoir les productions, rendre tes rétroactions');
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(F).toHaveLength(9);
        expect(S).toHaveLength(4);
        expect(def.total).toBe(9);   // la voie retenue : avec fichiers, tant qu'aucune n'est choisie
        const titre = (n) => relais.find((b) => b.n === n).titre;
        expect(F.map((e) => e.titre)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map(titre));
        expect(S.map((e) => e.titre)).toEqual([6, 7, 8, 9].map(titre));
    });

    // [voie, rang dans la voie, n° de la bulle, les éléments ouverts qui donnent chaque forme]
    const CAS = [
        ['fichiers', 0, 1, [[]]], ['fichiers', 1, 2, [[]]], ['fichiers', 2, 3, [[]]],
        ['fichiers', 3, 4, [[], ['modal-retro-observations']]], ['fichiers', 4, 5, [[]]], ['fichiers', 5, 6, [[]]],
        ['fichiers', 7, 8, [[]]], ['fichiers', 8, 9, [[]]],
        ['sans-fichier', 0, 6, [[], ['evaluations-contenu-evaluation']]]
    ];
    it.each(CAS)('voie %s, bulle %i (n° %i) : la confirmation, le lieu, chaque forme ligne par ligne', (voie, i, n, formes) => {
        const b = bulle(n, voie);
        // E3 (20 nov. 2026, essai de Grégoire sur l'iPad ; consigne du 20 nov.) : là où la bulle parle du « Stylo », dans les
        // deux temps, une explication de plus. Elle suit la ligne du « Stylo » du relais du 19 nov.
        const STYLO = "L'outil « Stylo » sera raffiné dans une mise à jour ultérieure.";
        const k = b.formes[0].findIndex((l) => l.texte.startsWith('Garde le « Stylo »'));
        if (k !== -1 && !b.formes[0].some((l) => l.texte === STYLO)) {
            expect(sectionDeLaConsigne('E3.')).toContain('dans les deux temps : ajoute l\'explication « ' + STYLO + ' »');
            b.formes[0].splice(k + 1, 0, Object.assign({}, b.formes[0][k], { texte: STYLO }));
        }
        const etapeDe = (ouvert) => charger(null, ouvert).api.voies()[voie][i];
        const etape = etapeDe([]);
        expect(etape.confirme ? etape.confirme.texte : '', 'confirmation').toBe(b.confirme);
        expect(String(etape.lieuSuite || ''), 'ce qui suit « Tu es dans… »').toBe(b.lieuSuite);
        expect(!!etape.lieu, 'la page change').toBe(!!b.lieuSuite);
        expect(formes).toHaveLength(b.formes.length);
        formes.forEach((ouvert, k) => {
            const e = etapeDe(ouvert);
            // La bulle 9 : le relais ne liste pas sa consigne, la fin du moteur (jugée plus bas).
            const lignes = n === 9 ? e.lignes().filter((l) => !l.geste) : e.lignes();
            expect(classer(lignes), 'forme ' + (k + 1)).toEqual(b.formes[k]);
            if (b.formes.length > 1) expect(!!e.secondeForme(), 'forme ' + (k + 1) + ' : la seconde ?').toBe(k === 1);
        });
    });

    it('bulle 7, les deux voies : la palette ou la section, « Spécifique » avec des fichiers seulement ; la première ligne montre son titre', () => {
        const avec = bulle(7, 'fichiers').formes[0];
        const sans = [{ ...avec[0], texte: 'La section « Rétroaction » montre ce que ton étudiant·e lira dans sa synthèse :' }]
            .concat(avec.slice(1).filter((l) => !l.texte.startsWith('« Spécifique »')));
        expect(classer(F[6].lignes())).toEqual(avec);
        expect(classer(S[1].lignes())).toEqual(sans);
        expect(typeof F[6].lignes()[0].montre).toBe('function');
        expect(typeof S[1].lignes()[0].montre).toBe('function');
        expect(F[6].confirme.texte).toBe(bulle(7, 'fichiers').confirme);
        expect(S[1].confirme.texte).toBe(bulle(7, 'fichiers').confirme);
        // Deux flèches, au plus : le titre que montre la première ligne, et « Verrouiller » (le contour).
        expect(F[6].nommeLeContour).toBe(false);
        expect(S[1].nommeLeContour).toBe(false);
    });

    it('les étapes 8 et 9 sont les mêmes sur les deux voies', () => {
        expect(S[2]).toBe(F[7]);
        expect(S[3]).toBe(F[8]);
    });

    it('l’objectif (la voie avec des fichiers, sa bulle 1) et l’objectif atteint (les deux voies), relus dans la consigne', () => {
        const OBJECTIF = "À la fin de ce parcours, tu seras en mesure de recevoir les productions de ton groupe et de rendre à chacun·e sa rétroaction en PDF.";
        const ATTEINT = "Objectif atteint : tu es en mesure de recevoir les productions de ton groupe et de rendre à chacun·e sa rétroaction en PDF.";
        expect(NOUVELLE).toContain('« ' + OBJECTIF + ' » et « ' + ATTEINT + ' »');
        const src = lire('js/parcours-recevoir.js');
        expect(src).toContain("objectifAtteint: 'Objectif atteint : tu es en mesure ' + EN_MESURE + '.'");
        expect(src).toContain("if (v === 'fichiers') def.objectif = 'À la fin de ce parcours, tu seras en mesure ' + EN_MESURE + '.';");
        expect('À la fin de ce parcours, tu seras en mesure ' + /var EN_MESURE = '([^']+)'/.exec(src)[1] + '.').toBe(OBJECTIF);
    });

    it('la fin : « Terminer », que le moteur change en « Parcours suivant », ou « Terminer » quand il offre les deux', () => {
        expect(F[8].lignes().filter((l) => l.geste).map((l) => l.texte)).toEqual(['Touche « Terminer »']);
        // Le relais du 19 nov. écrit la consigne avec « Parcours suivant » ; depuis le 20 nov. (A3), le moteur dit
        // « Voir le parcours N » d'après le panneau (`suiteEcrite`).
        expect(NOUVELLE).toContain('la consigne « Touche « Parcours suivant », ou « Terminer ». »');
        expect(suiteEcrite(5, 'Monter ton cours').consigne).toBe('Touche « Voir le parcours 5 », ou « Terminer »');
    });

    it('« Rien à importer » à la bulle 1 ; « Terminer » à la dernière, sans « Plus tard » ; la 9 au centre', () => {
        expect(F[0].boutons.map((b) => b.libelle)).toEqual(['Rien à importer']);
        expect(F[8].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(F[8].sansSortie).toBe(true);
        expect(F[8].centre).toBe(true);
        expect(F.slice(0, 8).every((e) => !e.sansSortie)).toBe(true);
    });

    it('aucun nom de produit hors de ceux que la page porte (« Export Léa », « Exporter pour Léa », « Pour Léa »)', () => {
        const dits = F.concat(S).flatMap((e) => e.lignes()).map((l) => l.texte).join(' ')
            .replace(/« Export Léa »|« Exporter pour Léa »|Pour Léa, fais-en/g, '');
        expect(dits).not.toMatch(/\bLéa\b|Omnivox|Excel/);
    });

    it('la phrase du refus est celle que Grégoire a validée (8 nov., 14 h 30)', () => {
        const m = CONSIGNE.match(/le panneau dit : « (Commence par .*?) » \(texte validé par Grégoire, 14 h 30\)/);
        expect(m).not.toBeNull();
        // Sans groupe-cours actif (le banc n'en a pas), le refus est dit.
        expect(api.refus()).toBe(m[1]);
    });
});

// La question 7 (Cowork, 9 nov.) : la condition exige une production qui nomme sa grille, son échelle ET sa cartouche.
// Le banc de bout en bout ne départage que la grille (à la sortie du troisième parcours, la production n'a ni échelle ni
// cartouche) : relecture neuve du 9 nov. Ici, chacune des trois manque à son tour.
describe('« Recevoir les productions, rendre tes rétroactions » : la condition de la question 7', () => {
    const REFUS = charger().api.refus();
    const P = { id: 'PROD_un', grilleId: 'G_un', echelleId: 'ECH_un', cartoucheId: 'CART_un' };
    it.each(['grilleId', 'echelleId', 'cartoucheId'])('sans %s, le refus', (champ) => {
        const p = { ...P };
        delete p[champ];
        expect(charger([p]).api.refus()).toBe(REFUS);
    });
    it('grille, échelle et cartouche : le parcours se lance', () => {
        expect(charger([P]).api.refus()).toBeNull();
    });
});

// La garde des trois passages de l'étape 6 (relecture neuve du 9 nov.) : son compte repart de zéro à l'entrée de l'étape.
// Sans cela, « Refaire » sans recharger la page laissait avancer l'étape dès la première sonde, sur l'état transitoire
// que la garde doit filtrer. Ici, tout est déjà attribué : il faut trois sondes, à chaque entrée.
// Break-test (9 nov.) : `reprendre()` retiré de l'`avant` des deux étapes 6 → ROUGE ; rétabli.
describe('« Recevoir les productions, rendre tes rétroactions » : la garde de l’étape 6 repart de zéro à chaque entrée', () => {
    function sonde(voieChoisie) {
        const enregistres = [];
        const visible = { offsetParent: {} };
        const win = {
            Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'en-cours', etape: 5 }) },
            ParcoursMoteur: { visible: () => true, actif: () => true, etapeCourante: () => 5 },
            addEventListener() {},
            evaluationEnCours: { grilleId: 'G_un', etudiantDA: '2390002', productionId: 'PROD_un', criteres: { CR_un: 'S' } },
            travauxVisionneuse: { getFichierActuel: () => ({ id: 'F_un', etudiantDA: '2390002', productionId: 'PROD_un' }) },
            travauxUI: { getModeCourant: () => 'evaluer' }
        };
        const document = {
            getElementById: () => visible, querySelector: () => visible,
            querySelectorAll: (sel) => (sel.includes('listeCriteresGrille1') ? [{ value: 'S' }] : []),
            addEventListener() {}, body: { classList: { toggle() {} } }
        };
        chargerScript('js/parcours-recevoir.js', {
            document,
            db: { getSync: (k, d) => (k === 'grillesTemplates' ? [{ id: 'G_un', criteres: [{ id: 'CR_un' }] }] : d) },
            cle: (k) => k,
            obtenirPreference: () => ({ voie: voieChoisie }),
            naviguerVers() {}
        }, win);
        const v = win.ParcoursRecevoir.voies();
        return voieChoisie === 'fichiers' ? v.fichiers[5] : v['sans-fichier'][0];
    }

    it.each(['fichiers', 'sans-fichier'])('voie %s : trois sondes à la première entrée, trois de nouveau à la suivante', async (voieChoisie) => {
        const etape6 = sonde(voieChoisie);
        await etape6.avant();
        expect([etape6.atteint(), etape6.atteint(), etape6.atteint()]).toEqual([false, false, true]);
        await etape6.avant();   // la rentrée dans l'étape (« Refaire », sans recharger la page)
        expect([etape6.atteint(), etape6.atteint(), etape6.atteint()]).toEqual([false, false, true]);
    });
});
