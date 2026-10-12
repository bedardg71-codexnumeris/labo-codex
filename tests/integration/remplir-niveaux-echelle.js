import { expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// Remplir le code et le nom des niveaux proposés par « Créer l'échelle » (11 oct. 2026).
//
// `creerNouvelleEchelle` propose quatre niveaux aux codes et noms VIDES ; depuis #574 (lot 9),
// l'enregistrement refuse un niveau incomplet. Un banc qui crée une échelle en ne donnant
// qu'un nom ne crée donc plus rien. Ce geste remplit les champs de la fiche, comme
// l'utilisateur : valeur posée, puis l'évènement `change` que le dispatcher écoute.
// Codes et noms fictifs. Partagé par les specs 967 et lot E1.
// ═══════════════════════════════════════════════════════════════════════════════════════════
export async function remplirNiveauxProposes(page) {
    const lu = await page.evaluate(() => {
        const n = (window._niveauxNouvelleEchelle || []).length;
        for (let i = 0; i < n; i++) {
            for (const [champ, valeur] of [['code', 'F' + (i + 1)], ['nom', 'Niveau fictif ' + (i + 1)]]) {
                const el = document.querySelector(`[data-on-change="modifierNiveauTempHandler"][data-niveau-index="${i}"][data-champ="${champ}"]`);
                if (!el) return { n, manquant: champ + ' ' + i };
                el.value = valeur;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        return { n, niveaux: (window._niveauxNouvelleEchelle || []).map(x => [x.code, x.nom]) };
    });
    expect(lu.manquant, 'champ du niveau introuvable').toBeUndefined();
    expect(lu.n, 'des niveaux sont proposés').toBeGreaterThan(0);
    expect(lu.niveaux.every(([c, nom]) => c && nom), 'code et nom posés par le geste de la fiche').toBe(true);
}
