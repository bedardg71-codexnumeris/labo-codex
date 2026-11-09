// =======================================================================
// LE NEUVIÈME PARCOURS, « METTRE EN PLACE TA NOTATION ALTERNATIVE » — 8 NOV. 2026, NUIT
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md.
//   1. Les onze bulles sont celles que Grégoire a validées une à une (21 h 10 à 21 h 43) : chaque titre,
//      texte et geste se trouve TEL QUEL dans la consigne ; le titre, la ligne et le refus du panneau aussi.
//   2. Les trois phrases propres à une famille (ou à l'écran) sont DANS leur texte, et n'en sortent que
//      hors de leur cas : `texteDe`.
//   3. Le chemin : une seule suite de bulles, seule l'étape 3 change ; l'étape 1 sautée quand une
//      pratique alternative est appliquée ; « n sur N » compte le chemin (`cheminDe`).
//   4. La famille se lit comme le moteur la lit (`familleDe`).
//   5. Deux défauts trouvés en chemin, corrigés parce qu'ils cassaient le parcours : la copie d'un
//      modèle « Demo Labo Codex » masquée du menu (`auteurDeLaCopie`), et « N plus récentes » qui
//      s'ouvrait sur un menu vide puis s'enregistrait en « meilleurs » (`modeSelectionDuMenu`).
//   6. Les corrections du 9 nov. (9 h 50 à 9 h 58, relais de Cowork) : les phrases que Grégoire a validées ce
//      jour-là remplacent celles de la consigne. Chaque correction porte l'ancien bout (qui doit se lire tel quel
//      dans la consigne du 8) et le nouveau (exigé tel quel dans le code) ; la consigne corrigée est la référence
//      des blocs 1 et 2. Break-test (9 nov., corrections) : « deux ou trois pratiques » remis à « deux pratiques »
//      → ROUGE (blocs 1 et 6) ; rétabli → vert.
// Break-tests (9 nov.) : « 59 au plus » changé en « 59 » dans js/parcours-notation-alternative.js → ROUGE
// (bloc 1) ; `if (id === 'evaluer' && …)` retiré de `texteDe` → ROUGE (bloc 2) ; `ids.push('spe-types',
// 'spe-forfaits')` réduit à `'spe-types'` → ROUGE (bloc 3) ; la ligne `return mode === 'recents' ? …` remise
// à `return mode` → ROUGE (bloc 5) ; `return marqueDemo ? '' : clone.auteur` remis à `clone.auteur` → ROUGE.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE_DU_8 = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md');

// Validées par Grégoire le 9 nov. 2026, 9 h 50 à 9 h 58, mot pour mot (relais de Cowork).
const CORRECTIONS_9_NOV = [
    { etape: '2', avant: 'Pour régler ta pratique, ouvre-la : choisis-la dans le menu « Pratique ouverte », en haut de la page.',
        apres: 'Pour régler ta pratique, ouvre-la : choisis-la dans le menu en haut de la page, à côté de « + Nouvelle pratique ».' },
    { etape: '3, standards', avant: 'Dessous, écris combien en retenir, puis à partir de combien de productions évaluées le Suivi montre la performance de ta classe.',
        apres: "À côté, écris combien en retenir. Dessous, le minimum de productions évaluées pour que la performance d'un·e étudiant·e soit jugée fiable : sous ce nombre, son profil ne la donne pas encore." },
    { etape: '4', avant: "« Note chiffrée » montre les niveaux et les chiffres ; « Niveau de performance » ne montre que les niveaux, les chiffres restant dans l'application.",
        apres: "« Note chiffrée » ajoute les chiffres à ta rétroaction écrite et, en standards, à la note provisoire ; « Niveau de performance » n'y laisse que les niveaux, les chiffres restant dans l'application." },
    { etape: '5', avant: 'Tes évaluations déjà enregistrées gardent leur affichage ; change-le au besoin dans leur palette « Rétroaction ».',
        apres: "Tes évaluations déjà enregistrées gardent leur affichage. Pour en changer une, ouvre-la (« Actions › Consulter »), touche « Déverrouiller », choisis l'affichage dans sa palette « Rétroaction », puis « Verrouiller »." },
    { etape: '6', avant: 'Ouvre ensuite la palette « Rétroaction » : sa première ligne rappelle ton choix (« Options : … · niveau de performance »).',
        apres: 'Regarde ensuite la rétroaction : sous « Générale · Spécifique · Bilan », la ligne « Options : … » rappelle ton choix (« … · niveau de performance »).' },
    { etape: '7', avant: 'chaque critère, sans chiffre.', apres: 'chaque critère, sans note chiffrée.' },
    { etape: '7', avant: 'elle ne porte aucun chiffre.', apres: 'elle ne porte aucune note chiffrée.' },
    { etape: '8', avant: "coche « Notes finalisées » dans la fiche de ta pratique : la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir.",
        apres: "coche « Notes finalisées » dans la fiche de ta pratique : l'export les marque « final » ; en standards, la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir." },
    { etape: '8, dénotation', avant: 'puis écris la note et sa justification.', apres: 'puis écris la note et sa justification, et touche « Enregistrer le jugement ».' },
    { etape: '8', avant: 'la façon dont deux pratiques construisent la note.', apres: 'la façon dont deux ou trois pratiques construisent la note.' }
];
const CONSIGNE = CORRECTIONS_9_NOV.reduce((c, k) => c.split(k.avant).join(k.apres), CONSIGNE_DU_8);
const SOURCE_DU_PARCOURS = lire('js/parcours-notation-alternative.js');

function monter() {
    const inscrits = [];
    const w = chargerScript('js/parcours-notation-alternative.js', {
        normaliserIdPratique: (id) => ({ 'pan-standards': 'standards', 'pan-specifications': 'specifications' })[id] || id
    }, { Assistance: { enregistrer: (def) => inscrits.push(def) } });
    return { P: w.ParcoursNotationAlternative, inscrits };
}

const { P, inscrits } = monter();
const ORDRE = ['pratique', 'ouvrir', 'std', 'spe-types', 'spe-forfaits', 'den', 'affichage', 'appliquer', 'evaluer', 'synthese', 'plus-loin'];
const NUMERO = { pratique: '1', ouvrir: '2', std: '3, standards', 'spe-types': '3a, spécifications', 'spe-forfaits': '3b, spécifications',
    den: '3, dénotation', affichage: '4', appliquer: '5', evaluer: '6', synthese: '7', 'plus-loin': '8' };

describe('le neuvième parcours : les onze bulles et le panneau, mot pour mot', () => {
    it('onze bulles, dans l’ordre des étapes de la consigne', () => {
        expect(Object.keys(P.TEXTES)).toEqual(ORDRE);
    });

    it.each(ORDRE)('%s : le titre est celui de la consigne, à son étape', (id) => {
        expect(CONSIGNE).toContain(`Étape ${NUMERO[id]}, « ${P.TEXTES[id].titre} »`);
    });

    it.each(ORDRE)('%s : le texte est celui de la consigne', (id) => {
        expect(CONSIGNE).toContain(`Texte : « ${P.TEXTES[id].texte} »`);
    });

    it.each(ORDRE.filter((id) => P.TEXTES[id].geste))('%s : le geste est celui de la consigne', (id) => {
        expect(CONSIGNE).toContain(`Geste : « ${P.TEXTES[id].geste} »`);
    });

    it('les étapes 7 et 8 n’ont pas de geste (la consigne n’en donne pas)', () => {
        expect(P.TEXTES.synthese.geste).toBeUndefined();
        expect(P.TEXTES['plus-loin'].geste).toBeUndefined();
    });

    it('le panneau : neuvième, son titre, sa ligne, son refus', () => {
        expect(inscrits).toHaveLength(1);
        const def = inscrits[0];
        expect(def.rang).toBe(9);
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(CONSIGNE).toContain(`Sinon, le panneau dit : « ${lire('js/parcours-notation-alternative.js').match(/var MOT_REFUS = "([^"]+)"/)[1]} »`);
    });

    it('les boutons des bulles : « Continuer », « Terminer » ; le lien de sortie « Plus tard »', () => {
        const source = lire('js/parcours-notation-alternative.js');
        const libelles = [...source.matchAll(/libelle: '([^']+)'/g)].map((m) => m[1]);
        expect([...new Set(libelles)].sort()).toEqual(['Continuer', 'Terminer']);
        expect(CONSIGNE).toContain('Bouton « Terminer »');
        expect(source).toContain("lienSortie: 'Plus tard'");
    });
});

describe('les phrases propres à une famille : dans leur texte, retirées hors de leur cas', () => {
    it('chacune est une phrase de la consigne, dans la bulle qui la porte', () => {
        expect(P.TEXTES.std.texte).toContain(P.PHRASES.listeQuiComptent);
        expect(P.TEXTES.evaluer.texte).toContain(P.PHRASES.specificationsEvaluer);
        expect(P.TEXTES['plus-loin'].texte).toContain(P.PHRASES.denotationJugement);
        expect(CONSIGNE).toContain(`La phrase « ${P.PHRASES.listeQuiComptent} » ne paraît que si cette liste est à l'écran`);
        expect(CONSIGNE).toContain(`La phrase « ${P.PHRASES.specificationsEvaluer} » ne paraît qu'en spécifications`);
        expect(CONSIGNE).toContain(`La phrase « ${P.PHRASES.denotationJugement} » ne paraît qu'en dénotation`);
    });

    it('étape 3, standards : la phrase de la liste paraît avec la liste, et seulement avec elle', () => {
        expect(P.texteDe('std', { famille: 'standards', listeQuiComptent: true })).toBe(P.TEXTES.std.texte);
        const sans = P.texteDe('std', { famille: 'standards', listeQuiComptent: false });
        expect(sans).not.toContain('Productions qui comptent dans la note');
        expect(sans).toContain('À côté, écris combien en retenir');   // la phrase validée le 9 nov. (avant : « Dessous, écris combien en retenir »)
        expect(sans).not.toMatch(/ {2}/);
    });

    it.each([['standards', false], ['specifications', true], ['denotation', false]])(
        'étape 6, %s : la phrase des spécifications paraît : %s', (famille, paraît) => {
            expect(P.texteDe('evaluer', { famille }).includes(P.PHRASES.specificationsEvaluer)).toBe(paraît);
            expect(P.texteDe('evaluer', { famille })).not.toMatch(/ {2}/);
        });

    it.each([['standards', false], ['specifications', false], ['denotation', true]])(
        'étape 8, %s : la phrase de la dénotation paraît : %s', (famille, paraît) => {
            expect(P.texteDe('plus-loin', { famille }).includes(P.PHRASES.denotationJugement)).toBe(paraît);
        });

    it('les autres bulles sont communes : leur texte ne dépend pas de la famille', () => {
        ['pratique', 'ouvrir', 'affichage', 'appliquer', 'synthese'].forEach((id) => {
            ['standards', 'specifications', 'denotation'].forEach((famille) => {
                expect(P.texteDe(id, { famille })).toBe(P.TEXTES[id].texte);
            });
        });
    });
});

describe('le chemin : seule l’étape 3 change ; « n sur N » compte le chemin de la famille', () => {
    const FIN = ['affichage', 'appliquer', 'evaluer', 'synthese', 'plus-loin'];

    it('standards : 1, 2, 3, 4 à 8 — huit étapes', () => {
        expect(P.cheminDe({ famille: 'standards' })).toEqual(['pratique', 'ouvrir', 'std', ...FIN]);
    });

    it('spécifications : 1, 2, 3a, 3b, 4 à 8 — neuf étapes', () => {
        expect(P.cheminDe({ famille: 'specifications' })).toEqual(['pratique', 'ouvrir', 'spe-types', 'spe-forfaits', ...FIN]);
    });

    it('dénotation : 1, 2, 3, 4 à 8 — huit étapes', () => {
        expect(P.cheminDe({ famille: 'denotation' })).toEqual(['pratique', 'ouvrir', 'den', ...FIN]);
    });

    it('l’étape 1 sautée ne compte pas : sept étapes en standards, huit en spécifications', () => {
        expect(P.cheminDe({ sauteEtape1: true, famille: 'standards' })).toHaveLength(7);
        expect(P.cheminDe({ sauteEtape1: true, famille: 'specifications' })[0]).toBe('ouvrir');
        expect(P.cheminDe({ sauteEtape1: true, famille: 'specifications' })).toHaveLength(8);
    });

    it('avant l’étape 2, la famille prévue (la pratique créée, ou celle du groupe-cours) ; sinon les standards', () => {
        expect(P.cheminDe({})).toHaveLength(8);
        expect(P.cheminDe({ famillePrevue: 'specifications' })).toHaveLength(9);
        // La pratique ouverte à l'étape 2 l'emporte sur la prévision.
        expect(P.cheminDe({ famillePrevue: 'specifications', famille: 'denotation' })).toContain('den');
    });
});

describe('la famille se lit comme le moteur la lit : `type`, puis `configuration.type`, puis le badge', () => {
    it.each([
        [{ type: 'standards', configuration: {} }, 'standards'],
        // Le `type` de la racine l'emporte sur `configuration.type` (l'ordre du moteur, `_typeFamille`).
        [{ type: 'standards', configuration: { type: 'denotation' } }, 'standards'],
        [{ type: 'pan-standards' }, 'standards'],
        [{ configuration: { type: 'denotation' } }, 'denotation'],
        [{ pratiques: ['SPE'], configuration: {} }, 'specifications'],
        [{ type: 'sommative' }, 'sommative'],
        [null, null]
    ])('%j → %s', (pratique, attendu) => {
        expect(P.familleDe(pratique)).toBe(attendu);
    });
});

describe('deux défauts qui cassaient le parcours, corrigés à la source', () => {
    it('« N plus récentes » s’ouvre sur « derniers » (le menu n’a pas « recents ») ; les autres modes restent', () => {
        const src = lire('js/pratiques-gestion.js');
        const modeSelectionDuMenu = new Function(tranche(src, 'function modeSelectionDuMenu', '\n}') + '\n}\nreturn modeSelectionDuMenu;')();
        expect(modeSelectionDuMenu({ methodeSelection: 'recents' })).toBe('derniers');
        expect(modeSelectionDuMenu({ methodeSelection: 'meilleurs' })).toBe('meilleurs');
        expect(modeSelectionDuMenu({ methodeSelection: 'derniers' })).toBe('derniers');
        expect(modeSelectionDuMenu(undefined)).toBe('meilleurs');
        // Le menu de la fiche offre bien `derniers`, et le modèle écrit bien `recents`.
        expect(lire('index.html')).toContain('<option value="derniers"></option>');
        expect(lire('js/pratiques-bibliotheque.js')).toContain("methodeSelection: 'recents'");
        expect(src).toContain('let modeSelection = modeSelectionDuMenu(config.portfolio);');
    });

    it('la copie d’un modèle « Demo Labo Codex » sans auteur au récapitulatif perd ce marqueur de la démo', () => {
        const src = lire('js/wizard-pratique-v2.js');
        const BibliothequeUI = { estItemDemo: (i) => !!i && (i.isDemo === true || i.auteur === 'Demo Labo Codex') };
        const auteurDeLaCopie = new Function('window', 'BibliothequeUI',
            tranche(src, 'function auteurDeLaCopie', '\n}') + '\n}\nreturn auteurDeLaCopie;')({ BibliothequeUI }, BibliothequeUI);
        expect(auteurDeLaCopie({ auteur: 'Demo Labo Codex' }, '')).toBe('');
        expect(auteurDeLaCopie({ auteur: 'Demo Labo Codex' }, 'Ada Lovelace')).toBe('Ada Lovelace');
        expect(auteurDeLaCopie({ auteur: 'Gabarit Labo Codex' }, '')).toBe('Gabarit Labo Codex');
        expect(src).toContain("clone.auteur = auteurDeLaCopie(clone, `${r.prenom || ''} ${r.nomAuteur || ''}`.trim());");
        // Le marqueur est bien là, sur trois modèles : sans ce correctif, leur copie serait masquée hors démo.
        expect((lire('js/pratiques-bibliotheque.js').match(/auteur: 'Demo Labo Codex'/g) || []).length).toBe(3);
    });
});

describe('ce que le parcours touche hors de son fichier : le strict nécessaire, nommé', () => {
    it('« Dossier PDF » annonce son fichier après chacun des deux téléchargements', () => {
        const src = lire('js/travaux-export-pdf.js');
        expect((src.match(/annoncerDossierLivre\(da, productionId\);/g) || []).length).toBe(2);
        expect(src).toContain("new CustomEvent('dossierPdfLivre'");
    });

    it('le commentaire de TYPE_BADGES ne dit plus la création d’une dénotation reportée', () => {
        const bloc = tranche(lire('js/wizard-pratique-v2.js'), 'const TYPE_BADGES = {', '};');
        expect(bloc).not.toContain('pas de carte Q1 pour DEN');
        expect(bloc).toContain('« Note finale posée, pas calculée »');
    });

    it('la préférence du parcours est déclarée (sans elle, chaque lecture avertit en console)', () => {
        expect(lire('js/preferences.js')).toContain('parcoursNotationAlternative: {},');
    });
});

describe('les corrections du 9 nov. : chaque ancien bout était dans la consigne, chaque phrase validée est dans le code', () => {
    it.each(CORRECTIONS_9_NOV.map((k) => [k.etape, k]))('étape %s', (etape, k) => {
        expect(CONSIGNE_DU_8, 'l’ancien bout se lit dans la consigne du 8').toContain(k.avant);
        expect(SOURCE_DU_PARCOURS, 'la phrase validée le 9 est posée').toContain(k.apres);
        expect(SOURCE_DU_PARCOURS.split(k.apres).join(''), 'l’ancien bout n’est plus posé').not.toContain(k.avant);
    });
});
