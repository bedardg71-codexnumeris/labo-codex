// Le modèle sans plancher pour les niveaux individuels (lot 2, question 1, demande de Grégoire du 30 oct. 2026) :
// niveau 3 à plus d'un écart-type sous la moyenne du groupe-cours, niveau 2 entre un demi et un écart-type, niveau 1
// le reste. Pour les niveaux 2 et 3, être aussi sous le repère de maîtrise de l'échelle, quand elle en a un. Quand la
// moyenne du groupe est sous la note de passage, un signal pour le niveau universel. « Non-participation » reste la
// règle du code (5 sept. 2026). À côté : le modèle en place et la proposition (a) de `comparaison-au-groupe.mjs`.
// Exige un commit qui porte `reperesPerformance`. Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import assert from 'node:assert/strict';
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';

const MIN_GROUPE = 5;
// Sensibilité seulement, pour A2025 et H2026 : le repère de maîtrise que l'échelle d'A2026 pose.
const REPERE_A2026 = 75;

const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    window.__H = {};
    // Le modèle, en un seul endroit. `a` : moyenne et écart-type du groupe, null sous le minimum d'élèves.
    window.__classer = (x, a, repere) => { if (!a) return 1; if (repere !== null && x >= repere) return 1; if (x < a.m - a.sd) return 3; if (x < a.m - a.sd / 2) return 2; return 1; };
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    const c=window.__classer, m70={m:70,sd:10}, m90={m:90,sd:10};
    return { gcs: db.getSync(cle('groupesCours'),[]).map(g=>g.id), grille:(obtenirGrilleReferenceDepistage()||{}).nom||null,
      temoin:[c(59.9,m70,null),c(60,m70,null),c(64.9,m70,null),c(65,m70,null),c(70,m90,null),c(74.9,m90,75),c(75,m90,75),c(80,m90,null),c(80,m90,75),c(10,null,null)] };
  }, {grilleNom: plan.grilleNom});
  // Le témoin passe par la fonction du navigateur, celle qui classe vraiment : bornes strictes, condition, groupe trop petit.
  assert.deepEqual(info.temoin, [3,2,2,1,3,3,1,2,1,1]);
  const lignes = [];
  for (const cut of plan.coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    lignes.push(await page.evaluate(async ({cut, gcs, MIN_GROUPE, REPERE_A2026}) => {
      const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
      const st=a=>{const n=a.length,m=a.reduce((x,y)=>x+y,0)/n;return{n,m,sd:n>1?Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(n-1)):0};};
      const r1=x=>x===null?null:Math.round(x*10)/10;
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map(), reperes=new Map();
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const rp=reperesPerformance(); reperes.set(gc,{maitrise:rp.maitrise,suffisance:rp.suffisance,raison:rp.raison});
        const prods=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],prods);
        const evaluables=obtenirIdsProductionsEvaluables(prods);
        for(const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))){
          if(acc.has(e.da))continue;
          const i=calculerTousLesIndices(e.da); const r=determinerNiveauRaiPedagogique(e.da);
          const cop=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).map(c=>window.noteRetenueParLeCalcul(c)).filter(v=>typeof v==='number');
          acc.set(e.da,{gc,A:i.A,C:i.C,nivActuel:r.niveau,np:r.pattern==='Non-participation',n:cop.length,niveau:cop.length?cop.reduce((a,v)=>a+v,0)/cop.length:null});
        }
      }
      const res=[...acc.entries()].map(([da,v])=>Object.assign({da},v));
      const passage=window.NOTE_DE_PASSAGE*100, classer=window.__classer;
      const groupes=gcs.map((gc,i)=>{
        const L=res.filter(r=>r.gc===gc&&r.n>0), lv=L.map(r=>r.niveau), a=lv.length>=MIN_GROUPE?st(lv):null, rp=reperes.get(gc);
        // Sans repère, le test « sous la maîtrise » n'existe pas : même lecture que `bornesDepistage`. La condition se lève.
        L.forEach(r=>{ r.nivS=classer(r.niveau,a,null); r.nivC=classer(r.niveau,a,rp.maitrise); r.niv75=classer(r.niveau,a,rp.maitrise??REPERE_A2026); r.nivP=classer(r.niveau,a,rp.maitrise??passage);
          r.nivA=r.niveau<passage?3:(a&&r.niveau<a.m-a.sd)?2:1; r.signalGroupe=!!a&&a.m<passage; });
        return {groupe:i+1,n:lv.length,moy:a?r1(a.m):null,moinsUn:a?r1(a.m-a.sd):null,moinsDemi:a?r1(a.m-a.sd/2):null,maitrise:rp.maitrise,suffisance:rp.suffisance,raison:rp.raison,signal:!!a&&a.m<passage,petit:lv.length>0&&lv.length<MIN_GROUPE,moyPetit:!a&&lv.length?r1(lv.reduce((x,y)=>x+y,0)/lv.length):null};
      });
      // « Non-participation » garde sa règle : le verdict vient du code, jamais du calcul au groupe. Sans copie sinon : en attente.
      res.filter(r=>r.n===0).forEach(r=>{r.nivA=0;r.nivS=r.nivC=r.niv75=r.nivP=0;});
      res.filter(r=>r.np).forEach(r=>{r.nivS=r.nivC=r.niv75=r.nivP=3;});
      window.__H[cut]=res;
      const c=k=>[0,1,2,3].map(v=>res.filter(r=>r[k]===v).length);
      const avecCopie=res.filter(r=>r.n>0);
      return {cut,effectif:res.length,copiesMed:med(res.map(r=>r.n)),copiesTot:res.reduce((a,r)=>a+r.n,0),
        act:c('nivActuel'),modA:c('nivA'),sans:c('nivS'),avec:c('nivC'),v75:c('niv75'),vP:c('nivP'),
        np:res.filter(r=>r.np).length,npAvecCopie:res.filter(r=>r.np&&r.n>0).length,
        moyGroupe:avecCopie.length?r1(avecCopie.reduce((a,r)=>a+r.niveau,0)/avecCopie.length):null,groupes,
        retiresCondition:res.filter(r=>r.nivS>=2&&r.nivC===1).length,
        sousPassageN1:avecCopie.filter(r=>r.nivC===1&&r.niveau<passage).length,sousPassageN1Signal:avecCopie.filter(r=>r.nivC===1&&r.niveau<passage&&r.signalGroupe).length,
        sousPassageTotal:avecCopie.filter(r=>r.niveau<passage).length,signalesAuDessus:avecCopie.filter(r=>r.nivC>=2&&r.niveau>=passage).length};
    },{cut,gcs:info.gcs,MIN_GROUPE,REPERE_A2026}));
  }
  const synth=await page.evaluate(({coupes,gcs,debut,fin})=>{
    const H=window.__H; const q1=a=>{const s=[...a].sort((x,y)=>x-y);const p=(s.length-1)*.25,i=Math.floor(p);return s[i]+(p-i)*((s[i+1]??s[i])-s[i]);};
    const mi=new Date((Date.parse(debut)+Date.parse(fin))/2).toISOString().slice(0,10);
    const finale=H[coupes[coupes.length-1]];
    const avantMi=coupes.filter(c=>c<=mi), dernier=avantMi[avantMi.length-1];
    const ever=(F,lst)=>{const s=new Set();lst.forEach(c=>H[c].filter(F).forEach(r=>s.add(r.da)));return s;};
    const bas=new Set();for(const gc of gcs){const L=finale.filter(r=>r.gc===gc&&r.n>0);if(L.length>=4){const q=q1(L.map(r=>r.niveau));L.filter(r=>r.niveau<=q).forEach(r=>bas.add(r.da));}}
    const M={act:'nivActuel',modA:'nivA',sans:'nivS',avec:'nivC',v75:'niv75',vP:'nivP'};
    const repere=(k)=>{const S23=ever(r=>r[k]>=2,avantMi),S3=ever(r=>r[k]===3,avantMi);return{s23:S23.size,s3:S3.size,bas23:[...S23].filter(d=>bas.has(d)).length,bas3:[...S3].filter(d=>bas.has(d)).length,auMi23:H[dernier].filter(r=>r[k]>=2).length,auMi3:H[dernier].filter(r=>r[k]===3).length};};
    const avMi={mi,date:dernier,pop:finale.length,basTotal:bas.size,npAvant:ever(r=>r.np,avantMi).size,npSeule:[...ever(r=>r.np,avantMi)].filter(d=>!avantMi.some(c=>{const r=H[c].find(x=>x.da===d);return r&&r.n>0&&r.nivC>=2;})).length,modA_np:ever(r=>r.nivA>=2||r.np,avantMi).size};
    for(const k in M) avMi[k]=repere(M[k]);
    const dates=coupes.filter((c,i)=>H[c].reduce((a,r)=>a+r.n,0)!==(i?H[coupes[i-1]].reduce((a,r)=>a+r.n,0):0));
    const FM=(F)=>{let av=0,re=0;dates.forEach((c,i)=>{if(!i)return;const p=new Set(H[dates[i-1]].filter(F).map(r=>r.da));H[c].filter(F).forEach(r=>{if(p.has(r.da))re++;});av+=p.size;});const vus=new Map();dates.forEach(c=>H[c].filter(F).forEach(r=>vus.set(r.da,(vus.get(r.da)||0)+1)));return{av,re,distincts:vus.size,uneSeule:[...vus.values()].filter(v=>v===1).length};};
    const stab={};for(const k in M){stab[k+'23']=FM(r=>r[M[k]]>=2);stab[k+'3']=FM(r=>r[M[k]]===3);}
    // Ce que retirer le plancher peut laisser passer, sur tout le trimestre.
    const passage=window.NOTE_DE_PASSAGE*100;
    const vusSous=ever(r=>r.n>0&&r.nivC===1&&r.niveau<passage,dates);
    const sansSignal=ever(r=>r.n>0&&r.nivC===1&&r.niveau<passage&&!r.signalGroupe,dates);
    const palier=window.SEUILS_PAR_DEFAUT.interpretation.acceptable*100;
    const S=ever(r=>r.nivC>=2,avantMi); const manques=[...bas].filter(d=>!S.has(d));
    const parC=(p)=>manques.filter(d=>avantMi.filter(c=>{const r=H[c].find(x=>x.da===d);return r&&r.n>0&&r.C!==null&&r.C<p;}).length>=1).length;
    const toutSignales=ever(r=>r.nivC>=2,dates);
    return{avMi,stab,dates,angles:{sousPassageN1Distincts:vusSous.size,sousPassageN1SansSignal:sansSignal.size},quartBas:{total:bas.size,manquesAvantMi:manques.length,parCAvantMi:parC(palier),jamaisSignales:[...bas].filter(d=>!toutSignales.has(d)).length,palier}};
  },{coupes:plan.coupes,gcs:info.gcs,debut:plan.debut,fin:plan.fin});
  sortie[plan.t]={info,lignes,synth}; nbErr+=erreurs(); await b.close();
  console.log('==',plan.t,info.grille,'groupes',info.gcs.length);
  lignes.filter(l=>l.copiesTot>0).forEach(l=>console.log(l.cut,'cop',l.copiesMed,'| en place',l.act.slice(1).join('-'),'| (a)',l.modA.slice(1).join('-'),'| sans',l.sans.slice(1).join('-'),'| avec',l.avec.slice(1).join('-'),'| att',l.avec[0],'np',l.np,'| retirés',l.retiresCondition,'| <60 N1',l.sousPassageN1,'dont signal',l.sousPassageN1Signal,'| signalés ≥60',l.signalesAuDessus,'|',l.groupes.map(g=>`G${g.groupe} n${g.n} m${g.moy} -1:${g.moinsUn} -½:${g.moinsDemi} mt${g.maitrise}${g.signal?' SIGNAL':''}`).join(' ; ')));
  console.log(JSON.stringify(synth));
}
ecrireAgregat('niveaux-sans-plancher.json', sortie); console.log('erreurs',nbErr);
