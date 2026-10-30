// Simulation de la double discordance (Fuchs et Fuchs) : niveau ET pente nettement sous le groupe, à chaque date.
// Sort des effectifs seulement ; les valeurs par élève restent dans le navigateur jetable. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';
const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    window.__H = {};
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    return { gcs: db.getSync(cle('groupesCours'),[]).map(g=>g.id), grille:(obtenirGrilleReferenceDepistage()||{}).nom||null };
  }, {grilleNom: plan.grilleNom});
  const lignes = [];
  for (const cut of plan.coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    lignes.push(await page.evaluate(async ({cut, gcs}) => {
      const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
      const q1=a=>{const s=[...a].sort((x,y)=>x-y);const p=(s.length-1)*.25,i=Math.floor(p);return s[i]+(p-i)*((s[i+1]??s[i])-s[i]);};
      const st=a=>{const n=a.length,m=a.reduce((x,y)=>x+y,0)/n;return{n,m,sd:n>1?Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(n-1)):0};};
      const pente=pts=>{const x=pts.map(p=>p[0]),y=pts.map(p=>p[1]);const mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length;const d=x.reduce((a,v)=>a+(v-mx)**2,0);if(d===0)return null;return x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0)/d;};
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map(); let sansEcheance=0;
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const prods=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],prods);
        const evaluables=obtenirIdsProductionsEvaluables(prods); const gid=obtenirIdContexteActif(db.getSync('infoCours',null));
        const ech=pid=>{const p=prods.find(x=>x.id===pid);if(!p)return null;const e=obtenirEcheanceEffective(p,gid);return(e&&e.date)||p.dateEcheance||null;};
        for(const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))){
          if(acc.has(e.da))continue;
          const r=determinerNiveauRaiPedagogique(e.da);
          const cop=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).map(c=>({note:window.noteRetenueParLeCalcul(c),d:(c.dateEvaluation||'').slice(0,10),ech:ech(c.productionId)})).filter(c=>typeof c.note==='number');
          cop.forEach(c=>{if(!c.ech){sansEcheance++;c.ech=c.d;}});
          const n=cop.length, niveau=n?cop.reduce((a,c)=>a+c.note,0)/n:null;
          const pts=cop.map(c=>[Date.parse(c.ech+'T12:00:00Z')/(7*864e5),c.note]);
          const rang=[...cop].sort((a,b)=>a.ech<b.ech?-1:a.ech>b.ech?1:0).map((c,i)=>[i,c.note]);
          acc.set(e.da,{gc,niv:r.niveau,n,niveau,pente:n>=3?pente(pts):null,penteR:n>=3?pente(rang):null,cop});
        }
      }
      const res=[...acc.entries()].map(([da,v])=>Object.assign({da},v));
      const marquer=(L,cleP,sortieCle,mode)=>{const lv=L.filter(r=>r.n>0).map(r=>r.niveau),sl=L.filter(r=>r[cleP]!==null).map(r=>r[cleP]);if(sl.length<5||lv.length<5){return;}
        if(mode==='et'){const a=st(lv),b=st(sl);L.forEach(r=>{if(r[cleP]!==null&&r.niveau<a.m-a.sd&&r[cleP]<b.m-b.sd)r[sortieCle]=true;});}
        else{const a=q1(lv),b=q1(sl);L.forEach(r=>{if(r[cleP]!==null&&r.niveau<=a&&r[cleP]<=b)r[sortieCle]=true;});}};
      for(const gc of gcs){const L=res.filter(r=>r.gc===gc);marquer(L,'pente','dd','et');marquer(L,'pente','ddQ','q');marquer(L,'penteR','ddR','et');
        const lv=L.filter(r=>r.n>0).map(r=>r.niveau);if(lv.length>=5){const a=st(lv);L.forEach(r=>{if(r.n>0&&r.niveau<a.m-a.sd)r.niveauBas=true;});}}
      marquer(res,'pente','ddPool','et');
      const copiesTot=res.reduce((a,r)=>a+r.n,0);
      const calc=res.filter(r=>r.pente!==null); const corr=(()=>{if(calc.length<5)return null;const x=calc.map(r=>r.niveau),y=calc.map(r=>r.pente),A=st(x),B=st(y);if(!A.sd||!B.sd)return null;return x.reduce((t,v,i)=>t+(v-A.m)*(y[i]-B.m),0)/((x.length-1)*A.sd*B.sd);})();
      let penteBasse=0;for(const gc of gcs){const L=res.filter(r=>r.gc===gc&&r.pente!==null).map(r=>r.pente);if(L.length>=5){const B=st(L);penteBasse+=L.filter(v=>v<B.m-B.sd).length;}}
      window.__H[cut]=res;
      const dd=res.filter(r=>r.dd);
      return{cut,effectif:res.length,copiesMed:med(res.map(r=>r.n)),copiesTot,nonCalc:res.filter(r=>r.pente===null).length,sansCopie:res.filter(r=>r.n===0).length,
        dd:dd.length,ddQ:res.filter(r=>r.ddQ).length,ddR:res.filter(r=>r.ddR).length,ddPool:res.filter(r=>r.ddPool).length,n1:res.filter(r=>r.niv===1).length,n2:res.filter(r=>r.niv===2).length,n3:res.filter(r=>r.niv===3).length,ddN1:dd.filter(r=>r.niv===1).length,ddN2:dd.filter(r=>r.niv===2).length,ddN3:dd.filter(r=>r.niv===3).length,niveauBas:res.filter(r=>r.niveauBas).length,sansEcheance,corr:corr===null?null:Math.round(corr*100)/100,penteBasse};
    },{cut,gcs:info.gcs}));
  }
  const synth=await page.evaluate(({coupes,gcs})=>{
    const H=window.__H; const q1=a=>{const s=[...a].sort((x,y)=>x-y);const p=(s.length-1)*.25,i=Math.floor(p);return s[i]+(p-i)*((s[i+1]??s[i])-s[i]);};
    const finale=H[coupes[coupes.length-1]];
    const dates=coupes.filter((c,i)=>H[c].reduce((a,r)=>a+r.n,0)!==(i?H[coupes[i-1]].reduce((a,r)=>a+r.n,0):0));
    const trans=(cleF,lst)=>lst.map((c,i)=>{if(!i)return null;const p=new Set(H[lst[i-1]].filter(cleF).map(r=>r.da)),m=new Set(H[c].filter(cleF).map(r=>r.da));return{cut:c,avant:p.size,restent:[...m].filter(d=>p.has(d)).length,entrent:[...m].filter(d=>!p.has(d)).length,sortent:[...p].filter(d=>!m.has(d)).length};}).filter(Boolean);
    const FD=r=>r.dd,FQ=r=>r.ddQ,F3=r=>r.niv===3,F23=r=>r.niv>=2;
    const stab=(F)=>{const T=trans(F,dates);const av=T.reduce((a,t)=>a+t.avant,0),re=T.reduce((a,t)=>a+t.restent,0);const vus=new Map();dates.forEach(c=>H[c].filter(F).forEach(r=>vus.set(r.da,(vus.get(r.da)||0)+1)));return{av,re,distincts:vus.size,uneSeule:[...vus.values()].filter(v=>v===1).length,trois:[...vus.values()].filter(v=>v>=3).length};};
    const semaine=trans(FD,coupes);
    const issue=(c)=>{const res=H[c];let lignes={};const bas=new Set(),basApres=new Set();let popFin=0,popApres=0;const sansApres=new Set();
      for(const gc of gcs){const L=finale.filter(r=>r.gc===gc&&r.n>0);popFin+=L.length;if(L.length>=4){const q=q1(L.map(r=>r.niveau));L.filter(r=>r.niveau<=q).forEach(r=>bas.add(r.da));}
        const A=finale.filter(r=>r.gc===gc).map(r=>{const ap=r.cop.filter(x=>x.d>c);return{da:r.da,m:ap.length?ap.reduce((a,x)=>a+x.note,0)/ap.length:null};});
        const B=A.filter(x=>x.m!==null);popApres+=B.length;if(B.length>=4){const q=q1(B.map(x=>x.m));B.filter(x=>x.m<=q).forEach(x=>basApres.add(x.da));}A.filter(x=>x.m===null).forEach(x=>sansApres.add(x.da));}
      const P={dd:r=>r.dd,ddQ:r=>r.ddQ,niveauBas:r=>r.niveauBas,n3:r=>r.niv===3,n23:r=>r.niv>=2};
      for(const k in P){const S=res.filter(P[k]).map(r=>r.da);const NS=res.filter(r=>!P[k](r)).map(r=>r.da);lignes[k]={n:S.length,basFin:S.filter(d=>bas.has(d)).length,basApres:S.filter(d=>basApres.has(d)).length,nonN:NS.length,nonBasFin:NS.filter(d=>bas.has(d)).length,nonBasApres:NS.filter(d=>basApres.has(d)).length,sansApres:S.filter(d=>sansApres.has(d)).length};}
      return{cut:c,popFin,popApres,bas:bas.size,basApres:basApres.size,sansApres:sansApres.size,lignes};};
    const au=(F,lim)=>{const lst=dates.filter(c=>c<=lim);const s=new Set();lst.forEach(c=>H[c].filter(F).forEach(r=>s.add(r.da)));return s;};
    const auMoins=(lim)=>{const lst=dates.filter(c=>c<=lim);const r0=issue(lim);const bas=new Set(),basAp=new Set();
      for(const gc of gcs){const L=finale.filter(r=>r.gc===gc&&r.n>0);if(L.length>=4){const q=q1(L.map(r=>r.niveau));L.filter(r=>r.niveau<=q).forEach(r=>bas.add(r.da));}
        const B=finale.filter(r=>r.gc===gc).map(r=>{const ap=r.cop.filter(x=>x.d>lim);return{da:r.da,m:ap.length?ap.reduce((a,x)=>a+x.note,0)/ap.length:null};}).filter(x=>x.m!==null);if(B.length>=4){const q=q1(B.map(x=>x.m));B.filter(x=>x.m<=q).forEach(x=>basAp.add(x.da));}}
      const P={dd:r=>r.dd,ddQ:r=>r.ddQ,niveauBas:r=>r.niveauBas,n3:r=>r.niv===3};const out={};
      for(const k in P){const S=new Set();lst.forEach(c=>H[c].filter(P[k]).forEach(r=>S.add(r.da)));const a=[...S];out[k]={n:a.length,basFin:a.filter(d=>bas.has(d)).length,basApres:a.filter(d=>basAp.has(d)).length};}
      return{lim,bas:bas.size,basApres:basAp.size,pop:finale.length,lignes:out};};
    const med=a=>{const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
    const finMed=med(finale.map(r=>r.n)); const mi=dates.find(c=>med(H[c].map(r=>r.n))>=finMed/2); const avantFin=dates[Math.max(0,dates.length-3)];
    return{dates,mi,avantFin,finMed,semaine,stab:{dd:stab(FD),ddQ:stab(FQ),n3:stab(F3),n23:stab(F23)},issues:dates.map(issue),auMoinsMi:auMoins(mi),auMoinsAvantFin:auMoins(avantFin)};
  },{coupes:plan.coupes,gcs:info.gcs});
  sortie[plan.t]={info,lignes,synth}; nbErr+=erreurs(); await b.close();
  console.log('==',plan.t,info.grille,'groupes',info.gcs.length);
  console.log('témoin dernière ligne N1-2-3',lignes.at(-1).n1,lignes.at(-1).n2,lignes.at(-1).n3);
  console.log('corr',lignes.filter(l=>l.corr!==null).map(l=>l.cut.slice(5)+':'+l.corr+'/pb'+l.penteBasse+'/nb'+l.niveauBas).join(' '));console.log('mi',synth.mi,'avantFin',synth.avantFin,JSON.stringify(synth.auMoinsMi),JSON.stringify(synth.auMoinsAvantFin));console.log('stab',JSON.stringify(synth.stab)); console.log('dates',synth.dates.join(' '));
}
ecrireAgregat('double-discordance.json', sortie); console.log('erreurs',nbErr);
