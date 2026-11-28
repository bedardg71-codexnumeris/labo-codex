/**
 * CRÉER UN COURS À PARTIR D'UN DEVIS RANGÉ (lot du 28 nov. 2026, demande de Grégoire, 8 h 06 à 8 h 16).
 *
 * Ce que ce banc verrouille, sur les devis réels de tests/fixtures/devis/ :
 *   P — CE QU'UN DEVIS PROPOSE : le numéro, l'énoncé, les éléments ; chaque pondération « n-n-n » du texte est un
 *       choix ; les heures seulement quand le devis donne un nombre seul ; la discipline n'est JAMAIS une proposition,
 *       seulement un repère.
 *   C — RIEN D'OFFICE : un choix neuf n'a rien de confirmé, rien à écrire, et le cours n'en « vient » pas encore.
 *   E — LES ÉLÉMENTS : gardés et reformulés dans l'ordre du devis, puis les ajoutés, un par ligne ; les retirés et les
 *       sans-réponse ne s'écrivent pas. Son lecteur (planification-export.js) les découpe comme avant.
 *   D — LE CHAMP `devisCode` : un code, posé à la création seulement ; l'enregistrement d'une fiche existante ne peut
 *       ni l'effacer ni le changer ; le module ne fait que LIRE la réserve.
 *
 * Le parcours à l'écran : tests/integration/cours-depuis-un-devis.spec.js.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

let D, C;
const range = (code) => D.ranger([], D.pourReserve(D.lire(lire('tests/fixtures/devis/' + code + '.txt'))), { idNeuf: 'DEVIS_' + code, maintenant: '2026-11-28T15:00:00.000Z' })[0];
beforeAll(() => {
    D = chargerScript('js/devis-lecture.js').devisLecture;
    C = chargerScript('js/cours-devis.js', { document: { getElementById: () => null }, echapperHtml: (v) => String(v) }).coursDevis;
});

describe('P — ce qu’un devis propose', () => {
    it('4EF0 : deux pondérations, chacune un choix ; pas d’heures ; la discipline en repère seulement', () => {
        const p = C.propositions(range('4EF0'));
        expect(p.numero).toBe('4EF0');
        expect(p.enonce).toBe('Analyser des textes littéraires.');
        expect(p.ponderations).toEqual(['2-2-3', '1-3-3']);
        expect(p.heures).toBe('');
        expect(p.elements).toHaveLength(6);
        expect(p.reperes).toEqual({ discipline: 'Français, langue d’enseignement et littérature', heures: '', ponderation: '' });
        expect(p).not.toHaveProperty('discipline');
        expect(JSON.stringify(p)).not.toMatch(/Formulation juste/);   // aucun critère de performance
    });

    it('000Z : « Périodes d’enseignement : 45 » est un nombre sans ambiguïté ; 01FB ne propose ni pondération, ni heures, ni repère', () => {
        expect(C.propositions(range('000Z')).heures).toBe('45');
        const p = C.propositions(range('01FB'));
        expect([p.ponderations, p.heures, p.reperes]).toEqual([[], '', { discipline: '', heures: '', ponderation: '' }]);
        expect(p.elements).toEqual(['Solfier à première vue un matériau musical.', 'Reproduire par écrit un matériau musical entendu.']);
    });

    it('des heures ou une pondération que le devis n’écrit pas nettement restent des repères, jamais des propositions', () => {
        const p = C.propositions({ code: 'X1', enonce: 'É', elements: [], activites: { heures: '45 à 60 périodes', ponderation: 'voir le programme', discipline: 'Philosophie' } });
        expect([p.heures, p.ponderations]).toEqual(['', []]);
        expect(p.reperes).toEqual({ discipline: 'Philosophie', heures: '45 à 60 périodes', ponderation: 'voir le programme' });
        expect(C.propositions({ activites: { ponderation: '2 - 2 - 3, 2-2-3' } }).ponderations).toEqual(['2-2-3']);
        expect(C.propositions(null).elements).toEqual([]);
    });
});

describe('C — rien n’est accepté d’office', () => {
    it('un choix neuf : tout est « à confirmer », rien à écrire, le cours n’en vient pas', () => {
        const e = C.etatNeuf(C.propositions(range('4EF0')));
        expect(Object.keys(e.reponses)).toEqual(['numero', 'enonce', 'ponderation']);   // pas d'heures : le devis n'en donne pas
        expect(Object.values(e.reponses).every((r) => r.etat === 'attente')).toBe(true);
        expect(e.elements.every((x) => x.etat === 'attente')).toBe(true);
        expect(C.sansReponse(e)).toBe(9);
        expect(C.composerElements(e)).toBe('');
        expect(C.aPuise(e)).toBe(false);
    });

    it('« Autre » et « Retirer » sont des réponses, mais le cours ne vient du devis que par une confirmation ou un élément gardé', () => {
        const e = C.etatNeuf(C.propositions(range('01FB')));
        e.reponses.numero = { etat: 'autre' };
        e.reponses.enonce = { etat: 'autre' };
        e.elements.forEach((x) => { x.etat = 'retire'; });
        expect(C.sansReponse(e)).toBe(0);
        expect(C.aPuise(e)).toBe(false);
        e.reponses.numero = { etat: 'confirme', valeur: '01FB' };
        expect(C.aPuise(e)).toBe(true);
    });
});

describe('E — les éléments', () => {
    it('gardés et reformulés dans l’ordre du devis, puis les ajoutés ; un par ligne ; son lecteur les découpe comme avant', () => {
        const e = C.etatNeuf(C.propositions(range('4EF0')));
        e.elements[0].etat = 'garde';
        e.elements[1].etat = 'reformule'; e.elements[1].valeur = '  Repérer des thèmes,\n reformulé ';
        e.elements[2].etat = 'retire';
        e.elements[4].etat = 'garde';
        e.ajoutes.push({ valeur: 'Un élément ajouté' }, { valeur: '   ' });
        const texte = C.composerElements(e);
        // Le découpage de planification-export.js, mot pour mot.
        expect(String(texte || '').split('\n').map((l) => l.trim()).filter(Boolean)).toEqual([
            'Reconnaître le propos du texte.', 'Repérer des thèmes, reformulé',
            'Rédiger une analyse littéraire, un commentaire composé ou une explication de textes.', 'Un élément ajouté'
        ]);
        expect(C.sansReponse(e)).toBe(3 + 2);   // trois propositions de tête, deux éléments sans réponse
    });

    it('un élément reformulé vidé ne laisse pas de ligne vide', () => {
        const e = C.etatNeuf(C.propositions(range('01FB')));
        e.elements[0].etat = 'reformule'; e.elements[0].valeur = '';
        e.elements[1].etat = 'garde';
        expect(C.composerElements(e)).toBe('Reproduire par écrit un matériau musical entendu.');
    });
});

describe('D — le champ devisCode, et ce que le module s’interdit', () => {
    const entite = lire('js/entites/cours-entite.js');
    const formulaire = lire('js/trimestre-v2-cours.js');
    const module = lire('js/cours-devis.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    it('l’entité cours : `devisCode` est modifiable, et n’est posé à la création que s’il est donné', () => {
        expect(tranche(entite, 'const champsModifiables = [', '];')).toMatch(/'devisCode'/);
        const w = chargerScript('js/entites/cours-entite.js', { db: { get: async () => [], set: async () => {} }, genererIdUnique: () => 'COURS_X', trouverDoublonNaturel: () => null, cleNaturelleCours: () => '' });
        return (async () => {
            const sans = await w.CoursEntite.creer({ codeCours: '601-101-MQ', nomCours: 'Fictif' }, { doublonAssume: true });
            const avec = await w.CoursEntite.creer({ codeCours: '601-102-MQ', nomCours: 'Fictif', devisCode: ' 4EF0 ' }, { doublonAssume: true });
            expect(sans).not.toHaveProperty('devisCode');
            expect(avec.devisCode).toBe('4EF0');
            expect(JSON.stringify(avec)).not.toMatch(/criteres|contexte/);   // un code, jamais une copie du devis
        })();
    });

    it('une fiche existante ne lit pas le champ : l’enregistrement champ par champ ne peut ni l’effacer ni le changer', () => {
        const f = tranche(formulaire, 'function _avecLeDevisRetenu(d) {', '\n}');
        expect(f).toMatch(/coursEnEditionV2 \? '' : _coursDevis\(\)\.codeRetenu\(\)/);
        expect(f).toMatch(/if \(code\) d\.devisCode = code;/);
        expect(tranche(formulaire, 'function _lireChampsInfosCoursDOM() {', '\n}')).not.toMatch(/devisCode/);
    });

    it('le module ne fait que LIRE : aucune écriture en base, aucun handler inline, aucun console.log', () => {
        expect(module).not.toMatch(/db\.(set|setSync|modifier|remove|removeSync)\(|modifierEtAnnoncer|ecrireEtAnnoncer|CoursEntite/);
        expect(module).not.toMatch(/devisMinisteriels/);   // la réserve passe par materielDevis.reserveCourante (celle de la démo quand on y est)
        expect(module).toMatch(/window\.materielDevis\.reserveCourante\(\)/);
        expect(module).not.toMatch(/\son(click|change|input)\s*=/);
        expect(module).not.toMatch(/console\.log/);
    });

    it('« Autre » ne pose aucune valeur ; seul « Confirmer » appelle `poser`', () => {
        expect(tranche(module, 'autre: function (nom) {', '\n        },')).not.toMatch(/poser\(|\.value\s*=/);
        expect(module.match(/poser\(nom, valeur\);/g)).toHaveLength(1);
        expect(tranche(module, 'confirmer: function (nom, i) {', '\n        },')).toMatch(/poser\(nom, valeur\)/);
    });
});
