// =======================================================================
// LES MOTS DE « METTRE TA CLASSE EN PLACE », « NOUS FAISONS » — RÉÉCRITS LE 19 NOV. 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md (les huit bulles et la variante de la
// septième, validées par Grégoire mot pour mot le 19 nov., de 8 h 13 à 10 h 46). Ce banc relit chaque bulle de la
// consigne et la confronte au code, ligne par ligne et DANS SON GENRE :
//   · la confirmation (« C'est fait : … »), le titre et son rang, ce qui suit la phrase du lieu, l'objectif ;
//   · chaque ligne, dans l'ordre : une explication (`note`, sans marque), un geste (une flèche : la ligne se fait, par
//     ses champs ou sa condition), la consigne (en gras, `geste: true`) ; les sous-lignes d'un geste ;
//   · ce que le moteur pose lui-même (la poignée, « Pour revoir… », l'objectif atteint, la phrase de la suite, la
//     consigne des deux suites) : lu dans js/parcours-moteur.js, jamais recopié.
// Les noms du menu et des sections (« Tu es dans « Cadre », à la section « Trimestre » ») sont LUS à l'écran par le
// moteur : jugés au navigateur (tests/integration/nous-faisons-classe-2026-11-19.spec.js), comme la confirmation
// présente après une étape faite et absente après une étape sautée.
// Les bulles du 14 nov. (sentinelle confrontée à CONSIGNE-2026-11-14-essai-novice.md, lot 3) sont remplacées.
// Break-test (19 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-nous-faisons-classe.md).

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md');
const CLASSE = lire('js/parcours-classe.js');
const MOTEUR = lire('js/parcours-moteur.js');
const BULLES = tranche(CLASSE, 'var LIGNES_7 = [', 'var DEF = ');

// Le fichier, chargé hors du navigateur : ce qu'il expose aux bancs.
const fenetre = { Assistance: { enregistrer: () => {}, parcours: () => [], suivantDe: () => null } };
new Function('window', CLASSE)(fenetre);
const ETAPES = fenetre.ParcoursClasse.etapes;
const DEF = fenetre.ParcoursClasse.definition;

/** Une constante du moteur, telle qu'il l'écrit. */
const dite = (nom) => {
    const m = new RegExp('var ' + nom + " = '((?:[^'\\\\]|\\\\.)*)';").exec(MOTEUR);
    if (!m) throw new Error('constante introuvable : ' + nom);
    return m[1].replace(/\\'/g, "'");
};

// CE QUE LA CONSIGNE ÉCRIT POUR CLAUDE CODE, PAS POUR L'ÉCRAN (le mandat de la nuit : « les parenthèses […] après une
// ligne sont des notes pour toi ») : retirées des lignes avant la comparaison, chacune relue dans la consigne.
const NOTES_POUR_CLAUDE_CODE = [
    " (ou, si aucune absence ni retard n'est noté dans son groupe à la séance qu'il vient de verrouiller, `absenceNotee` : « Tout le monde était là : un point s'écartera à la première absence. »)",
    ' (la consigne de fin que le moteur dit déjà quand la bulle offre les deux boutons, relais du 14 nov.)'
];
// La fin, que le moteur pose à la dernière bulle de tout parcours qui a son objectif.
const REVOIR = 'Pour revoir une étape, touche « 8 sur 8 ».';

/** Une bulle de la consigne, de son titre de section à la note « Nouveau… » : ce que l'écran porte, classé. */
function lireBulle(entete) {
    const bloc = tranche(CONSIGNE, entete, '\n## ');
    const b = { confirme: '', titre: '', rang: 0, lieu: '', objectif: '', poignee: '', atteint: '', lignes: [] };
    for (const brut of bloc.split('\n').slice(1)) {
        let l = brut.trim();
        if (!l) continue;
        if (/^(Nouveau|Écrite par|Boutons :)/.test(l)) break;
        NOTES_POUR_CLAUDE_CODE.forEach((n) => { l = l.replace(n, ''); });
        let m;
        if ((m = /^C'est fait : (.+?) \(en petit, au-dessus du titre\)$/.exec(l))) { b.confirme = "C'est fait : " + m[1]; continue; }
        if ((m = /^\*\*(.+)\*\* · (\d) sur 8$/.exec(l))) { b.titre = m[1]; b.rang = Number(m[2]); continue; }
        if (/^Tu es dans /.test(l)) { b.lieu = l; continue; }
        if (/^À la fin de ce parcours, /.test(l)) { b.objectif = l; continue; }
        if ((m = /^\(Puis la phrase de la poignée, posée par le moteur : « (.+) »\.?\)$/.exec(l))) { b.poignee = m[1]; continue; }
        if ((m = /^\(filet\) \*\*(.+)\*\* \(filet\)/.exec(l))) { b.atteint = m[1]; continue; }
        if (l.startsWith('· ')) { b.lignes[b.lignes.length - 1].sous.push(l.slice(2)); continue; }
        if (l.startsWith('→ ')) {
            const t = l.slice(2);
            if (t.startsWith('**')) { b.lignes.push({ genre: 'consigne', texte: t.replace(/\*\*/g, ''), sous: [] }); continue; }
            // Les trois dates de la bulle 1 sont écrites sur la ligne de leur geste : ce sont ses sous-lignes.
            const d = /^(.+ :) (.+ · .+)$/.exec(t);
            b.lignes.push(d ? { genre: 'geste', texte: d[1], sous: d[2].split(' · ') } : { genre: 'geste', texte: t, sous: [] });
            continue;
        }
        b.lignes.push({ genre: 'explication', texte: l, sous: [] });
    }
    return b;
}

/** La ligne se fait (le moteur la flèche, puis la grise) : ses champs, sa condition, ou ses sous-lignes. */
const seFait = (l) => !l.note && !!(l.fait || l.champs || (l.sous || []).some(seFait));

/** Les lignes du code, classées comme la consigne : explication (`note`), geste (se fait), consigne ; sinon, « sans genre ». */
function classer(lignes) {
    return lignes.map((l) => ({
        genre: l.note ? 'explication' : l.geste ? 'consigne' : seFait(l) ? 'geste' : 'sans genre (ni note, ni geste)',
        texte: l.texte,
        sous: (l.sous || []).map((x) => x.texte)
    }));
}

/** Ce qui suit la phrase du lieu, tel que le code doit l'écrire (`lieuSuite`), et ce que la phrase déclare. */
function suiteDuLieu(phrase) {
    const m = /^Tu es dans (?:« [^»]+ », à (la section|l'onglet) « [^»]+ »|(la section) « [^»]+ »)(.*)$/.exec(phrase);
    if (!m) throw new Error('phrase du lieu illisible : ' + phrase);
    const reste = m[3];
    const suite = reste === '.' ? '' : reste.startsWith(' :') ? reste.slice(1) : reste.startsWith('. ') ? reste.slice(2) : null;
    if (suite === null) throw new Error('suite illisible : ' + phrase);
    return { suite, lieu: !m[2], section: m[1] === 'la section' || !!m[2] };
}

const texteDe = (v) => String((typeof v === 'function' ? v() : v) || '');

const ENTETES = ['## Bulle 1 (', '## Bulle 2 (', '## Bulle 3 (', '## Bulle 4 (', '## Bulle 5 (', '## Bulle 6 (', '## Bulle 7 (', '## Bulle 8 ('];

describe('« Mettre ta classe en place », « Nous faisons » : les huit bulles du 19 nov., mot pour mot et dans leur genre', () => {
    const consigne = ENTETES.map(lireBulle);

    it('les notes pour Claude Code et la fin sont bien dans la consigne (sinon, les retirer d’ici)', () => {
        NOTES_POUR_CLAUDE_CODE.forEach((n) => expect(CONSIGNE).toContain(n));
        expect(CONSIGNE).toContain(REVOIR);
    });

    it('huit bulles, huit étapes ; les titres et leurs rangs', () => {
        expect(ETAPES).toHaveLength(8);
        expect(consigne.map((b) => b.rang)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(ETAPES.map((e) => e.titre)).toEqual(consigne.map((b) => b.titre));
    });

    it.each(consigne.map((b, i) => [b.rang, b.titre, i]))('%i sur 8, « %s » : la confirmation, le lieu, les lignes', (n, titre, i) => {
        const b = consigne[i], etape = ETAPES[i];
        // La confirmation : son texte (le moteur la pose au-dessus du titre ; présente ou non : jugé au navigateur).
        expect(etape.confirme ? etape.confirme.texte : '', 'confirmation').toBe(b.confirme);
        expect(!!etape.confirme, 'une confirmation à partir de la bulle 2').toBe(i > 0);
        // Le lieu : ce qui suit la phrase, et ce qu'elle nomme (le menu, la section).
        const lieu = suiteDuLieu(b.lieu);
        expect(texteDe(etape.lieuSuite), 'ce qui suit « Tu es dans… »').toBe(lieu.suite);
        expect(!!etape.lieu, 'la page change (« Tu es dans « X »… »)').toBe(lieu.lieu);
        expect(!!etape.nommeLaSection, 'la phrase nomme la section').toBe(lieu.section);
        if (lieu.section) expect(typeof etape.section, 'la section est déclarée').toBe('function');
        // Les lignes : chaque texte, dans son genre, dans l'ordre. La dernière bulle : sa fin est posée par le moteur ;
        // la phrase conditionnelle est lue dans sa seconde forme (personne n'était absent), la première au source.
        let attendues = b.lignes.filter((l) => !(l.genre === 'explication' && (l.texte === REVOIR || l.texte === dite('PHRASE_DE_LA_SUITE'))));
        if (i === 7) {
            attendues = attendues.map((l) => (l.texte === "Ce point à l'écart, c'est l'absence que tu viens de noter."
                ? Object.assign({}, l, { texte: "Tout le monde était là : un point s'écartera à la première absence." }) : l));
            attendues = attendues.map((l) => (l.genre === 'consigne' ? Object.assign({}, l, { texte: 'Touche « Terminer »' }) : l));
        }
        expect(classer(etape.lignes())).toEqual(attendues);
    });

    it('bulle 1 : l’objectif (sur la définition) et la phrase de la poignée (le moteur) ; bulle 8 : l’objectif atteint', () => {
        expect(DEF.objectif).toBe(consigne[0].objectif);
        expect(consigne[0].poignee).toBe(dite('PHRASE_DE_LA_POIGNEE'));
        expect(DEF.objectifAtteint).toBe(consigne[7].atteint);
        expect(consigne[7].lignes.map((l) => l.texte)).toEqual(expect.arrayContaining([REVOIR, dite('PHRASE_DE_LA_SUITE')]));
        // La consigne de la fin : « Touche « Terminer » » dans le code ; le moteur dit les deux suites quand il les offre.
        expect(consigne[7].lignes.filter((l) => l.genre === 'consigne').map((l) => l.texte)).toEqual([dite('CONSIGNE_DEUX_SUITES') + '.']);
    });

    it('bulle 8 : la phrase de l’absence, ses deux formes, dans l’ordre (une absence notée d’abord)', () => {
        expect(BULLES).toContain('note(absenceNotee() ? "Ce point à l\'écart, c\'est l\'absence que tu viens de noter."\n'
            + '                        : "Tout le monde était là : un point s\'écartera à la première absence."),');
    });

    it('la variante d’avant la première séance : la même confirmation, la phrase du lieu seule, deux explications, un geste', () => {
        const v = lireBulle('## Bulle 7, variante');
        expect(v.titre).toBe(ETAPES[6].titre);
        expect(v.confirme).toBe(ETAPES[6].confirme.texte);
        expect(suiteDuLieu(v.lieu)).toEqual({ suite: '', lieu: true, section: false });
        expect(tranche(CLASSE, "titre: 'Prendre les présences',", 'lignes:')).toContain(
            "lieuSuite: function () { return avantPremierCours ? '' : \"" + suiteDuLieu(consigne[6].lieu).suite + "\"; },");
        expect(classer(fenetre.ParcoursClasse.lignes7Avant)).toEqual(v.lignes);
    });

    it('les gestes que la page ne peut pas confirmer portent la flèche et ne se grisent jamais (quatre, nommés)', () => {
        const sans = [];
        ETAPES.forEach((e, i) => [].concat(e.lignes(), i === 6 ? fenetre.ParcoursClasse.lignes7Avant : []).forEach((l) => {
            if (l.fait && !l.champs && String(l.fait).includes('return false') && l.fait() === false) sans.push((i + 1) + ' : ' + l.texte.split(' (')[0]);
        }));
        expect(sans).toEqual([
            '5 : Choisis le nombre de séances par semaine',
            '5 : Pour chaque séance : le jour, le début et la fin',
            "7 : Choisis une séance déjà donnée, ou celle d'aujourd'hui",
            '7 : Note seulement les absences et les retards'
        ]);
    });

    it('la forme : aucune bulle ne porte de paragraphe ni de ligne de geste à part', () => {
        expect(BULLES).not.toMatch(/(?<![\w.])geste:\s*["']/);
        expect(BULLES).not.toMatch(/(?<![\w.])texte:\s*["'][^"']{260,}/);
        expect((BULLES.match(/lignes: function \(\)/g) || []).length).toBe(8);
    });

    it('les mots : « institution », « séance » ; ni produit (règle du 15 nov.), ni « établissement », « morceau », « pastille »', () => {
        const dits = ETAPES.flatMap((e) => e.lignes()).concat(fenetre.ParcoursClasse.lignes7Avant)
            .flatMap((l) => [l.texte].concat((l.sous || []).map((x) => x.texte))).join(' ');
        expect(dits).toContain('ton institution');
        expect(dits).not.toMatch(/établissement|morceau|pastille/i);
        expect(dits).not.toMatch(/premier cours|cours déjà donné|ce cours a eu lieu/);
        expect(dits).not.toMatch(/\bLéa\b|Omnivox|Excel/);
    });

    it('les étapes où la page change le déclarent : 1 (le Cadre), 7 (la saisie), 8 (le Suivi)', () => {
        expect(ETAPES.map((e) => !!e.lieu)).toEqual([true, false, false, false, false, false, true, true]);
    });

    it('étape 7, avant la première séance : « D\'accord » ; étape 8 : « Terminer », et rien d\'autre', () => {
        const chaines = (source) => [...source.matchAll(/libelle:\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => m[1] ?? m[2]);
        expect(chaines(tranche(CLASSE, 'var BOUTONS_7_AVANT', 'var ETAPES = ['))).toEqual(["D'accord"]);
        expect(chaines(tranche(CLASSE, 'var ETAPES = [', 'var DEF = '))).toEqual(['Terminer']);
    });

    it('« Plus tard » sur chaque bulle sauf la dernière', () => {
        expect(DEF.lienSortie).toBe('Plus tard');
        expect(ETAPES[7].sansSortie).toBe(true);
    });

    it('la ligne du panneau', () => {
        const ligne = "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil.";
        expect(CLASSE).toContain(ligne);
        expect(lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md')).toContain(`« ${ligne.replace(/\.$/, '')}`);
    });

    it('étape 6 : le parcours ne choisit rien à la place du novice dans les quatre listes (décision de Grégoire, 14 nov.)', () => {
        // Le banc WebKit (parcours-2-ma-classe, étape 6) mesure que les quatre listes s'ouvrent à « — Choisir — ».
        const etape6 = tranche(BULLES, "titre: 'Ton groupe-cours'", "titre: 'Prendre les présences'");
        expect(etape6).not.toMatch(/\.value\s*=|selectedIndex/);
        expect(etape6).toContain("avant: function () { return ouvrirBloc('groupe-cours'); }");
    });
});

describe('le lancement provisoire de la partie 1 est parti', () => {
    it('« Commencer » (carte enseignant de l’accueil) lance le parcours, il n’ouvre plus Cadre › Trimestre lui-même', () => {
        const accueil = tranche(lire('js/accueil.js'), 'function commencerParLeTrimestre()', '\n}\n');
        expect(accueil).toContain("p.id === 'classe'");
        expect(accueil).toContain('classe.lancer()');
        // 15 nov. 2026 : les parcours sont fermés (PARCOURS_OUVERTS, js/assistance.js). La porte ne reste pas muette :
        // le parcours d'abord, et seulement s'il n'est pas offert, Cadre › Trimestre. À resserrer quand ils rouvrent.
        expect(accueil).toMatch(/if \(classe\) \{ classe\.lancer\(\); return; \}\s*(\/\/[^\n]*\s*)*naviguerAccueilCarte\('calendrier\|calendrier-trimestre'\);/);
        expect(accueil).not.toContain('ouvrirAccordeonDeLEtape');
    });

    it('parcours-classe.js ne passe plus par commencerParLeTrimestre ; plus d’export d’ouvrirAccordeonDeLEtape', () => {
        expect(CLASSE).not.toContain('commencerParLeTrimestre()');
        expect(CLASSE).not.toMatch(/PARTIE 1 SEULEMENT|lancement provisoire/);
        expect(lire('js/trimestre-v2.js')).not.toContain('window.ouvrirAccordeonDeLEtape');
    });

    it('le parcours se repère sur la frise du Cadre, une seule source (etapesDuCadre)', () => {
        const t = lire('js/trimestre-v2.js');
        expect(t).toContain('ChaineEtapes.dessiner(barre, etapesDuCadre(),');
        expect(t).toContain('window.etapesDuCadre = etapesDuCadre;');
        expect(CLASSE).toContain('window.etapesDuCadre()');
    });
});
