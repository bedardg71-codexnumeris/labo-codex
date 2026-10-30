/**
 * SENTINELLE #790 (volet B) — LE SIGNALEMENT VIENT DU GABARIT, JAMAIS DU CODE.
 *
 * ── CE QUE CE BANC PROTÈGE ─────────────────────────────────────────────────────────────────────────
 * Deux choses décident qu'un élève est signalé, et TOUTES DEUX vivent dans le gabarit de la grille :
 *   · QUAND — une case cochée sur un palier (`leveSignalement`), jamais un `ratio <= 0,5` en dur ;
 *   · QUOI  — une phrase écrite par l'enseignant (`libelleSignalement`), jamais « français » en dur.
 * C'est le code disciplinaire que #668 a retiré de ce registre, et qu'il ne faut pas y remettre par
 * la porte du dépistage. Un enseignant de chimie coche ses paliers et écrit sa phrase.
 *
 * ── ET IL PROTÈGE L'INVERSE, QUI COMPTE AUTANT ─────────────────────────────────────────────────────
 * Aucune grille existante ne se met à signaler toute seule. Un gabarit d'avant le 8 septembre 2026 n'a
 * pas le champ, un champ absent ne lève rien, et un libellé vide ne lève rien non plus. Le premier
 * `describe` mesure ce silence ; sans lui, un défaut trop bavard passerait pour un succès.
 *
 * ── LE POINT LE PLUS FACILE À CASSER PAR INADVERTANCE ──────────────────────────────────────────────
 * Le signalement doit lire les productions DIAGNOSTIQUES. Elles sont exclues des quatre calculs
 * (`production-diagnostique.js`) ; le signalement est leur SEULE sortie. Quelqu'un qui « uniformise »
 * en appliquant le filtre des quatre portes ici viderait le lot de tout son sens — sans rien casser
 * ailleurs. Le dernier `describe` est là pour ça.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const MODULE = 'js/entites/signalement-depistage.js';
const REGISTRE = 'js/evaluation-projection.js';

/** Le registre réel — c'est lui qui décide du palier atteint. */
function registre() {
    return chargerScript(REGISTRE).projectionAlgo;
}

/**
 * #905 (lot C, 17 sept. 2026) : le module lit la règle unique `evaluationEntreDansLaNote`
 * sur `window`, à l'appel. Le banc charge la VRAIE (pratique-registre.js), pas une doublure :
 * c'est elle qui prouve, au dernier `describe`, qu'elle ne filtre pas les diagnostiques.
 */
function signalement(globaux = {}) {
    const win = chargerScript('js/pratiques/pratique-registre.js');
    return chargerScript(MODULE, globaux, win).SignalementDepistage;
}

/**
 * Un critère algorithmique calé sur l'EUF (900 mots / 30 erreurs), dont on choisit
 * les paliers qui lèvent et la phrase affichée.
 */
function critereEUF({ cochés = [], libelle = '' } = {}) {
    const P = registre();
    return {
        id: 'CR_LANGUE',
        nom: 'Maîtrise de la langue',
        type: 'algorithmique',
        modeleProjection: 'norme_externe',
        paramsProjection: {
            motsReference: 900, erreursTolerees: 30,
            nomServiceAide: '', lienServiceAide: '',
            libelleSignalement: libelle
        },
        paliersProjection: P.paliersMigration().map((p) => ({
            ...p, leveSignalement: cochés.includes(p.cle)
        }))
    };
}

/** Une copie : 20 erreurs sur 300 mots → ratio 2, donc « Échec ». 5/900 → « Excellent ». */
function evaluation({ erreurs, mots, da = '2000001', id = 'E1', productionId = 'P1' }) {
    return {
        id, etudiantDA: da, productionId, grilleId: 'G1', noteFinale: 55,
        donneesAlgorithmiques: { CR_LANGUE: { codes: [], mots, totalErreurs: erreurs } }
    };
}

const grilles = (critere) => [{ id: 'G1', nom: 'Grille', criteres: [critere] }];

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 volet B · LE SILENCE PAR DÉFAUT — aucune grille existante ne se met à signaler', () => {
    it('un gabarit SANS le champ ne lève rien, même sur une copie en échec franc', () => {
        // Le cas de toutes les grilles de Grégoire au matin du 8 septembre : elles n'ont pas
        // le champ. Si ce cas rougissait, le lot changerait ses écrans sans qu'il ait rien coché.
        const S = signalement();
        const c = critereEUF();
        c.paliersProjection.forEach((p) => { delete p.leveSignalement; });
        expect(S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300 })],
            grilles: grilles(c), registre: registre()
        })).toEqual([]);
    });

    it('un palier COCHÉ mais SANS PHRASE ne lève rien — une pastille muette ne se lit pas', () => {
        const S = signalement();
        expect(S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300 })],
            grilles: grilles(critereEUF({ cochés: ['echec'], libelle: '   ' })),
            registre: registre()
        })).toEqual([]);
    });

    it('une PHRASE sans palier coché ne lève rien non plus : les deux vont ensemble', () => {
        const S = signalement();
        expect(S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300 })],
            grilles: grilles(critereEUF({ cochés: [], libelle: 'Aide recommandée' })),
            registre: registre()
        })).toEqual([]);
    });

    it('sans mots saisis, le registre ne conclut pas — donc aucun signalement deviné', () => {
        const S = signalement();
        expect(S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 12, mots: 0 })],
            grilles: grilles(critereEUF({ cochés: ['echec', 'risque'], libelle: 'Aide recommandée' })),
            registre: registre()
        })).toEqual([]);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 volet B · CE QUE LE GABARIT DIT, LE SIGNALEMENT LE FAIT', () => {
    it('palier « Échec » coché + une copie en échec → un signalement, avec LA PHRASE DU GABARIT', () => {
        const S = signalement();
        const r = S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300 })],
            grilles: grilles(critereEUF({ cochés: ['echec'], libelle: 'Aide en français recommandée' })),
            registre: registre()
        });
        expect(r).toHaveLength(1);
        expect(r[0].libelle).toBe('Aide en français recommandée');
        expect(r[0].palierCle).toBe('echec');
        expect(r[0].critereNom).toBe('Maîtrise de la langue');
    });

    it('⚠ RIEN DE DISCIPLINAIRE — la même mécanique rend la phrase d\'un prof de chimie', () => {
        // C'est l'exigence de Grégoire, dans ses mots : « ce pourrait être une autre matière
        // qui est diagnostiquée ». Si un jour « français » se retrouve écrit dans le code, ce
        // cas rougit, parce que la phrase rendue ne serait plus celle du gabarit.
        const S = signalement();
        const r = S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300 })],
            grilles: grilles(critereEUF({ cochés: ['echec'], libelle: 'Reprise du module 2 à prévoir' })),
            registre: registre()
        });
        expect(r[0].libelle).toBe('Reprise du module 2 à prévoir');
    });

    it('« RISQUÉ » SE COCHE SÉPARÉMENT — et c\'est le palier qui a fait débat', () => {
        // Décision de Grégoire (7 sept.) : le drapeau se lève dès « Risqué », pas à « Échec »,
        // parce que le palier « Risqué » recommande DÉJÀ l'aide dans le texte que l'élève lit.
        // Ici, seul « Échec » est coché : une copie « Risquée » ne lève donc rien.
        const S = signalement();
        const risquee = evaluation({ erreurs: 25, mots: 900 });   // ratio 0,83 → « Risqué »
        const ctx = (cochés) => ({
            evaluations: [risquee],
            grilles: grilles(critereEUF({ cochés, libelle: 'Aide recommandée' })),
            registre: registre()
        });
        expect(S.pourEleve('2000001', ctx(['echec']))).toEqual([]);
        expect(S.pourEleve('2000001', ctx(['echec', 'risque']))).toHaveLength(1);
    });

    it('une copie EXCELLENTE ne lève rien, même quand deux paliers sont cochés', () => {
        const S = signalement();
        expect(S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 5, mots: 900 })],   // ratio 0,17 → « Excellent »
            grilles: grilles(critereEUF({ cochés: ['echec', 'risque'], libelle: 'Aide recommandée' })),
            registre: registre()
        })).toEqual([]);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 volet B · LES RÈGLES DE LECTURE', () => {
    const CTX = () => ({
        grilles: grilles(critereEUF({ cochés: ['echec'], libelle: 'Aide recommandée' })),
        registre: registre()
    });

    it('une copie REMPLACÉE ne signale plus — reprise archivée ou doublon réconcilié (#360)', () => {
        const S = signalement();
        const remplacee = { ...evaluation({ erreurs: 20, mots: 300 }), remplaceeParId: 'E2' };
        expect(S.pourEleve('2000001', { ...CTX(), evaluations: [remplacee] })).toEqual([]);
    });

    it('la copie d\'un AUTRE élève ne signale pas celui-ci', () => {
        const S = signalement();
        const autre = evaluation({ erreurs: 20, mots: 300, da: '2000002' });
        expect(S.pourEleve('2000001', { ...CTX(), evaluations: [autre] })).toEqual([]);
    });

    it('DÉDOUBLONNÉ PAR PHRASE : deux copies en échec ne font pas lire deux fois la même chose', () => {
        const S = signalement();
        const r = S.pourEleve('2000001', {
            ...CTX(),
            evaluations: [
                evaluation({ erreurs: 20, mots: 300, id: 'E1', productionId: 'P1' }),
                evaluation({ erreurs: 40, mots: 300, id: 'E2', productionId: 'P2' })
            ]
        });
        expect(r).toHaveLength(1);
        // La plus récente gagne : c'est elle qui dit l'état actuel de l'élève.
        expect(r[0].evaluationId).toBe('E2');
    });

    it('une grille INTROUVABLE ne fait pas planter, et ne devine aucun signalement', () => {
        const S = signalement();
        const orpheline = { ...evaluation({ erreurs: 20, mots: 300 }), grilleId: 'G_DISPARUE' };
        expect(S.pourEleve('2000001', { ...CTX(), evaluations: [orpheline] })).toEqual([]);
    });

    it('le bilan de GROUPE compte des ÉLÈVES, pas des signalements', () => {
        // Ce que Grégoire regarde avant d'écrire : trois élèves ou dix-sept, sur une capacité
        // d'accueil limitée. Un élève qui porte DEUX phrases reste UN élève à contacter.
        //
        // ⚠ CE CAS A ÉTÉ REFAIT APRÈS LE BREAK-TEST DU 8 SEPT. Sa première version donnait
        // deux copies au même élève, mais la même phrase : le dédoublonnage les ramenait à
        // une, et `total += s.length` valait alors exactement `total++`. Le cas restait vert
        // quelle que soit la mutation — il ne mesurait rien. Il faut DEUX phrases distinctes
        // pour que les deux façons de compter divergent.
        const S = signalement();
        const P = registre();
        const critereA = critereEUF({ cochés: ['echec'], libelle: 'Aide recommandée' });
        const critereB = {
            ...critereEUF({ cochés: ['echec'], libelle: 'Rencontre individuelle à prévoir' }),
            id: 'CR_AUTRE', nom: 'Structure du texte'
        };
        const grilleDeux = [{ id: 'G1', nom: 'Grille', criteres: [critereA, critereB] }];
        const copieDeuxCriteres = (da, id) => ({
            id, etudiantDA: da, productionId: 'P1', grilleId: 'G1', noteFinale: 55,
            donneesAlgorithmiques: {
                CR_LANGUE: { codes: [], mots: 300, totalErreurs: 20 },
                CR_AUTRE: { codes: [], mots: 300, totalErreurs: 20 }
            }
        });
        const bilan = S.pourGroupe(
            [{ da: '2000001' }, { da: '2000002' }, { da: '2000003' }],
            {
                grilles: grilleDeux, registre: P,
                evaluations: [
                    copieDeuxCriteres('2000001', 'E1'),          // DEUX phrases, un seul élève
                    evaluation({ erreurs: 20, mots: 300, da: '2000002', id: 'E2' }),
                    evaluation({ erreurs: 2, mots: 900, da: '2000003', id: 'E3' })
                ]
            }
        );
        // Deux ÉLÈVES signalés — et non trois signalements.
        expect(bilan.total).toBe(2);
        expect(Object.keys(bilan.parEleve).sort()).toEqual(['2000001', '2000002']);
        expect(bilan.parEleve['2000001']).toHaveLength(2);   // lui en porte bien deux
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
describe('#790 volet B · ⛔ LA PRODUCTION DIAGNOSTIQUE DOIT ÊTRE LUE ICI', () => {
    it('une copie de production DIAGNOSTIQUE lève bien un signalement — c\'est sa SEULE sortie', () => {
        // ⚠ LE CAS QUI SE CASSERAIT SANS BRUIT. La production diagnostique est exclue des quatre
        // calculs ; quelqu'un qui « uniformise » en appliquant ce filtre ici aussi viderait le lot
        // de tout son sens, et aucune autre sentinelle ne le dirait. Le texte que Grégoire fait
        // écrire en première semaine ne compte nulle part — sauf ici.
        //
        // Relecture croisée du lot 31 par Cowork (17 sept. 2026, mutation N1) : ce cas donnait une copie de `P_DIAG`
        // sans qu'AUCUNE production soit marquée diagnostique — un filtre réel n'y trouvait rien à retirer, et seule la
        // garde textuelle d'en dessous tenait. `P_DIAG` porte maintenant `diagnostique: true`, et elle est visible par
        // les DEUX chemins qu'un filtre emprunterait : le `db` du banc (sous `cle('productions')`) et le contexte.
        const PRODUCTIONS = [{ id: 'P_DIAG', titre: 'Texte diagnostique', type: 'travail', diagnostique: true }, { id: 'P1', titre: 'Analyse 1', type: 'travail' }];
        const lectures = [];
        const db = { getSync: (k, d) => { lectures.push(k); return k === 'test_productions' ? JSON.parse(JSON.stringify(PRODUCTIONS)) : (d !== undefined ? d : null); } };
        const cle = (k) => 'test_' + k;
        const S = signalement({ db, cle, obtenirDonneesSelonMode: (k) => db.getSync(cle(k), []) });
        const r = S.pourEleve('2000001', {
            evaluations: [evaluation({ erreurs: 20, mots: 300, productionId: 'P_DIAG' })],
            grilles: grilles(critereEUF({ cochés: ['echec'], libelle: 'Aide en français recommandée' })),
            productions: PRODUCTIONS,
            registre: registre()
        });
        expect(r).toHaveLength(1);
        expect(r[0].productionId).toBe('P_DIAG');
        // Le banc rend bien la production marquée à qui la demande (sinon la preuve ci-dessus serait de nouveau vide).
        expect(db.getSync(cle('productions')).find(p => p.id === 'P_DIAG').diagnostique).toBe(true);
    });

    it('le module de signalement n\'importe PAS le filtre des quatre portes', () => {
        // Garde statique, en plus du cas ci-dessus : le jour où quelqu'un ajoute
        // `ProductionDiagnostique.filtrer…` dans ce fichier, ce test le dit tout de suite.
        const contenu = readFileSync(path.join(RACINE, MODULE), 'utf8');
        // Le mot apparaît dans le commentaire d'entête, qui EXPLIQUE pourquoi il ne faut
        // pas filtrer ici. C'est le CODE qu'on garde : on retire les lignes de commentaire.
        const codeSeul = contenu.split('\n').filter((l) => {
            const t = l.trim();
            return !(t.startsWith('*') || t.startsWith('//') || t.startsWith('/*'));
        }).join('\n');
        expect(codeSeul).not.toContain('ProductionDiagnostique');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 30 oct. 2026 : les copies du codex portent `erreurs` (la saisie du nombre) ; le signalement ne lisait que `totalErreurs`,
// que seul le mode des codes écrit. Une telle copie comptait 0 : « sans erreur », jamais de signalement.
// Break-test : l'ancienne lecture (`saisie.totalErreurs`) rend 3 rouges, les trois premiers ci-dessous.
describe('#790 · le compte d\'erreurs, sous les deux noms qu\'il porte', () => {
    const copieSaisie = (donnees) => ({ id: 'E1', etudiantDA: '2000001', productionId: 'P1', grilleId: 'G1', noteFinale: 55,
        donneesAlgorithmiques: { CR_LANGUE: donnees } });
    const lire = (donnees, critere = critereEUF({ cochés: ['echec'], libelle: 'Aide recommandée' })) =>
        signalement().pourEleve('2000001', { evaluations: [copieSaisie(donnees)], grilles: grilles(critere), registre: registre() });

    it('une copie saisie (`erreurs`, la forme du stock) lève le signalement de son palier', () => {
        const r = lire({ erreurs: 20, mots: 300, niveau: 'I', noteCalculee: 40, pourcentage: 40, retroaction: '' });
        expect(r).toHaveLength(1);
        expect(r[0]).toMatchObject({ palierCle: 'echec', libelle: 'Aide recommandée' });
    });

    it('elle porte le niveau que le palier fixe', () => {
        const c = critereEUF({ cochés: ['echec'], libelle: 'Aide recommandée' });
        c.paliersProjection.find((p) => p.cle === 'echec').niveauSignalement = 3;
        expect(lire({ erreurs: 20, mots: 300 }, c)[0].niveauFixe).toBe(3);
    });

    it('`erreurs` l\'emporte sur un `totalErreurs` resté d\'un autre mode', () => {
        expect(lire({ erreurs: 20, totalErreurs: 0, mots: 300 })).toHaveLength(1);
    });

    it('le mode des codes (`totalErreurs`) lève toujours', () => {
        expect(lire({ codes: [], totalErreurs: 20, mots: 300 })).toHaveLength(1);
    });

    it('une copie saisie sous le palier coché ne lève rien', () => {
        expect(lire({ erreurs: 1, mots: 900 })).toEqual([]);
    });

    it('la saisie écrit bien `erreurs` : si le nom change, cette lecture doit suivre', () => {
        const calcul = readFileSync(path.join(RACINE, 'js', 'evaluation-calcul.js'), 'utf8');
        expect(calcul).toMatch(/donneesAlgorithmiques\[critereId\] = \{\s*erreurs: erreurs,\s*mots: mots,/);
    });
});

