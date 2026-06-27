import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// Dette d'intégrité #130/#306 (27 juin 2026) — champ canonique d'un groupe-cours.
//
// CONSTAT : deux chemins de création écrivaient deux noms de champ pour le même
// concept. Le chemin VIVANT (`sauvegarderGroupeCoursV2`) écrit `groupeNum`, et le
// `nom` est généré depuis le MÊME champ de formulaire → `groupeNum` est cohérent
// avec `nom`. L'ancien champ `groupe` n'est plus écrit que par du code archivé
// (`js/_archives/`) ; il a pu réapparaître périmé — voire INVERSÉ entre deux
// groupes (cas 601-101-MQ H26 : groupe="00008" sur l'enregistrement nommé
// "…-00002") — via reconstruction ou import de codex ancien. Comme une majorité
// de lectures faisaient `gc.groupe || gc.groupeNum`, le legacy périmé GAGNAIT et
// les deux groupes s'affichaient/filtraient croisés (famille #130).
//
// CONVENTION ÉTABLIE : `groupeNum` fait foi. La migration purge `groupe` ; les
// lectures vivantes sans fallback (ou hot-paths) résolvent groupeNum d'abord.
//
// Break-tests (cf. SKILL_verification_adverse) : réintroduire le bug fait ROUGIR.

let GroupeCoursEntite;

beforeAll(() => {
    const win = chargerScript('js/entites/groupe-cours.js');
    GroupeCoursEntite = win.GroupeCoursEntite;
});

describe('normaliserCanonique · règle de normalisation (comportemental)', () => {

    it('retire le `groupe` legacy divergent et conserve groupeNum (cas 601-101-MQ H26)', () => {
        const liste = [
            { id: 'GC_1768051147936', nom: 'H2026-601-101-MQ-00002 (Lun-AM / Mer-PM)', groupeNum: '00002', groupe: '00008' },
            { id: 'GC_1774389463057', nom: 'H2026-601-101-MQ-00008 (Mar-AM / Jeu-PM)', groupeNum: '00008', groupe: '00002' }
        ];
        const res = GroupeCoursEntite.normaliserCanonique(liste);

        expect(res.modifie).toBe(true);
        // Les deux divergences legacy ≠ canonique sont tracées (audit).
        expect(res.divergences).toHaveLength(2);
        // `groupe` retiré ; `groupeNum` (cohérent avec `nom`) intact et NON inversé.
        expect(Object.prototype.hasOwnProperty.call(liste[0], 'groupe')).toBe(false);
        expect(liste[0].groupeNum).toBe('00002');
        expect(Object.prototype.hasOwnProperty.call(liste[1], 'groupe')).toBe(false);
        expect(liste[1].groupeNum).toBe('00008');
    });

    it('promeut `groupe` vers groupeNum quand le canonique est absent, puis le retire', () => {
        // Très ancien enregistrement (chemin Entité archivé) : que `groupe`.
        const liste = [{ id: 'GC_legacy', nom: 'A2024-601-101-MQ-00001', groupe: '00001' }];
        const res = GroupeCoursEntite.normaliserCanonique(liste);

        expect(res.modifie).toBe(true);
        expect(res.divergences).toHaveLength(0); // promotion, pas divergence
        expect(liste[0].groupeNum).toBe('00001');
        expect(Object.prototype.hasOwnProperty.call(liste[0], 'groupe')).toBe(false);
    });

    it('n’écrase JAMAIS un groupeNum présent et est idempotente', () => {
        const liste = [{ id: 'GC_ok', nom: 'H2026-…-00002', groupeNum: '00002', groupe: '00002' }];
        const r1 = GroupeCoursEntite.normaliserCanonique(liste);
        expect(r1.modifie).toBe(true);           // a retiré `groupe`
        expect(r1.divergences).toHaveLength(0);  // groupe == groupeNum → pas de divergence
        expect(liste[0].groupeNum).toBe('00002');
        expect(Object.prototype.hasOwnProperty.call(liste[0], 'groupe')).toBe(false);

        // 2e passage : plus de champ `groupe` → rien à faire.
        const r2 = GroupeCoursEntite.normaliserCanonique(liste);
        expect(r2.modifie).toBe(false);
        expect(liste[0].groupeNum).toBe('00002');
    });

    it('laisse intact un enregistrement déjà canonique (groupeNum seul)', () => {
        const liste = [{ id: 'GC_pur', nom: 'H2026-…-00003', groupeNum: '00003' }];
        const res = GroupeCoursEntite.normaliserCanonique(liste);
        expect(res.modifie).toBe(false);
        expect(res.divergences).toHaveLength(0);
        expect(liste[0].groupeNum).toBe('00003');
    });

    it('tolère une entrée non-tableau ou vide sans planter', () => {
        expect(GroupeCoursEntite.normaliserCanonique(null).modifie).toBe(false);
        expect(GroupeCoursEntite.normaliserCanonique([]).modifie).toBe(false);
    });
});

describe('convention canonique groupeNum · lectures verrouillées (ratchet structurel)', () => {

    it('la migration de purge existe dans main.js et appelle normaliserCanonique', () => {
        const main = lire('js/main.js');
        expect(main.includes('GroupeCoursEntite.normaliserCanonique')).toBe(true);
        expect(main.includes('purge groupe legacy')).toBe(true);
    });

    it('synchroniserInfoCours lit groupeNum d’abord (plus de `gcComplet.groupe` nu)', () => {
        const ent = lire('js/entites/groupe-cours.js');
        expect(ent.includes('gcComplet.groupeNum || gcComplet.groupe')).toBe(true);
        // Les anciennes lectures nues ont disparu.
        expect(ent.includes("groupe: gcComplet.groupe || ''")).toBe(false);
        expect(ent.includes('groupe: gcComplet.groupe\n')).toBe(false);
    });

    it('le hot-path #130 (modes.js obtenirContexteCoursActif) résout groupeNum d’abord', () => {
        const modes = lire('js/modes.js');
        expect(modes.includes('gc.groupeNum || gc.groupe || null')).toBe(true);
        expect(modes.includes('gc.groupe || gc.groupeNum || null')).toBe(false);
    });

    it('orchestre + contexte écrivent les caches en résolvant groupeNum d’abord', () => {
        const orch = lire('js/trimestre-v2-orchestre.js');
        const ctx = lire('js/contexte.js');
        // Plus aucune lecture legacy-first dans l'orchestrateur d'en-tête.
        expect(orch.includes('gc.groupe || gc.groupeNum')).toBe(false);
        expect(orch.includes('gc.groupeNum || gc.groupe')).toBe(true);
        expect(ctx.includes('gcSelectionne.groupeNum || gcSelectionne.groupe')).toBe(true);
    });
});
