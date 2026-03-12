import { useState } from "react";

// ─── VIRIDIS ──────────────────────────────────────────────────────────────────
function viridis(t) {
  const stops=[
    [0.00,[68,1,84]],[0.13,[70,40,122]],[0.25,[59,82,139]],
    [0.38,[44,113,142]],[0.50,[33,145,140]],[0.63,[60,187,117]],
    [0.75,[114,211,67]],[0.88,[186,225,42]],[1.00,[253,231,37]],
  ];
  t=Math.max(0,Math.min(1,t));
  let lo=stops[0],hi=stops[stops.length-1];
  for(let i=0;i<stops.length-1;i++){
    if(t>=stops[i][0]&&t<=stops[i+1][0]){lo=stops[i];hi=stops[i+1];break;}
  }
  const f=(hi[0]-lo[0])===0?0:(t-lo[0])/(hi[0]-lo[0]);
  return `rgb(${Math.round(lo[1][0]+f*(hi[1][0]-lo[1][0]))},${Math.round(lo[1][1]+f*(hi[1][1]-lo[1][1]))},${Math.round(lo[1][2]+f*(hi[1][2]-lo[1][2]))})`;
}

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T={
  cream:"#faf8f2",navy:"#1b1b2e",rule:"#cdc6b0",
  accent:"#2d4b8c",purple:"#5c3b8a",warm:"#7a5230",
  red:"#8b2020",muted:"#6a6257",
  g:"'EB Garamond',Georgia,serif",
  d:"'DM Sans',system-ui,sans-serif",
};

// ─── RDM VALUES ───────────────────────────────────────────────────────────────
const RDM8=[
  [0.000,0.816,0.227,0.674,0.481,0.704,0.816,0.816],
  [0.816,0.000,0.761,0.347,0.752,0.598,0.816,0.816],
  [0.227,0.761,0.000,0.602,0.256,0.609,0.598,0.704],
  [0.674,0.347,0.602,0.000,0.609,0.256,0.752,0.481],
  [0.481,0.752,0.256,0.609,0.000,0.602,0.347,0.674],
  [0.704,0.598,0.609,0.256,0.602,0.000,0.761,0.227],
  [0.816,0.816,0.598,0.752,0.347,0.761,0.000,0.816],
  [0.816,0.816,0.704,0.481,0.674,0.227,0.816,0.000],
];
const L8=["N80+N","N80+M","N60+N","N60+M","M60+N","M60+M","M80+N","M80+M"];
const RDM4=[[0,.20,.40,.60],[.20,0,.20,.40],[.40,.20,0,.20],[.60,.40,.20,0]];
const L4=["N80","N60","M60","M80"];
const RDM2=[[0,1],[1,0]];
const L2=["Nice","Mean"];

// ─── AnnaK ISMs ───────────────────────────────────────────────────────────────
const SA_N=10;
const SA=[0.08,0.17,0.27,0.36,0.45,0.55,0.64,0.74,0.84,0.94];
function buildAnnaK(fn){
  const raw=Array.from({length:SA_N},(_,i)=>Array.from({length:SA_N},(_,j)=>{
    if(i===j)return null;
    return fn(SA[i],SA[j]);
  }));
  let mx=0;
  raw.forEach(r=>r.forEach(v=>{if(v!==null&&v>mx)mx=v;}));
  // Plot as dissimilarity (1 - normalised ISS) so purple=similar, yellow=dissimilar
  // — identical color convention to H1 RDMs. Diagonal = 0 = purple.
  return raw.map(r=>r.map(v=>v===null?0.0:1-(v/mx)));
}
const ISM_MEAN =buildAnnaK((a,b)=>(a+b)/2);
const ISM_MIN  =buildAnnaK((a,b)=>Math.min(a,b));
const ISM_PROD =buildAnnaK((a,b)=>a*b);

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────
const Rule=()=><div style={{borderTop:`1px solid ${T.rule}`,margin:"9px 0"}}/>;

const H1=({children,color})=>(
  <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,letterSpacing:".07em",
    textTransform:"uppercase",color:color||T.accent,marginBottom:6}}>{children}</div>
);
const H2=({children,color})=>(
  <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,letterSpacing:".06em",
    textTransform:"uppercase",color:color||T.muted,marginBottom:4}}>{children}</div>
);
const Body=({children,size=11.5})=>(
  <p style={{fontFamily:T.g,fontSize:size,color:T.navy,lineHeight:1.70,margin:"0 0 7px"}}>{children}</p>
);
const Fig=({n,children})=>(
  <div style={{fontFamily:T.g,fontSize:11,fontStyle:"italic",color:T.navy,lineHeight:1.55,marginTop:8}}>
    <span style={{fontStyle:"normal",fontWeight:700}}>Figure {n}.&nbsp;</span>{children}
  </div>
);

const Mono=({children,color})=>(
  <pre style={{fontFamily:"'Courier New',monospace",fontSize:10,color:color||T.navy,
    whiteSpace:"pre",overflowX:"auto",margin:0,lineHeight:1.6}}>{children}</pre>
);

function Panel({children,idx,total}){
  return(
    <div style={{width:940,background:T.cream,border:`1.5px solid ${T.rule}`,borderRadius:4,
      padding:"28px 38px 34px",boxSizing:"border-box",marginBottom:10,position:"relative"}}>
      <div style={{position:"absolute",bottom:9,right:14,fontSize:9,fontFamily:T.d,
        color:T.rule,letterSpacing:".1em"}}>{idx}&thinsp;/&thinsp;{total}</div>
      {children}
    </div>
  );
}

// ─── RDM GRID ─────────────────────────────────────────────────────────────────
function RDMGrid({matrix,labels,cs=30,showVals=true}){
  const n=matrix.length;
  const lw=n>5?cs*1.0:n>3?cs*1.05:cs*1.3;
  const hdrFs=n>5?8:n>3?10:12;
  return(
    <div style={{display:"inline-block"}}>
      {/* column headers — always horizontal, never rotated */}
      <div style={{display:"flex",paddingLeft:lw}}>
        {labels.map((l,i)=>(
          <div key={i} style={{
            width:cs,flexShrink:0,
            fontSize:hdrFs,fontFamily:T.d,color:T.navy,fontWeight:700,
            textAlign:"center",paddingBottom:4,overflow:"hidden",whiteSpace:"nowrap",
          }}>{l}</div>
        ))}
      </div>
      {/* rows */}
      {matrix.map((row,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <div style={{width:lw,fontSize:hdrFs,fontFamily:T.d,color:T.navy,fontWeight:700,
            textAlign:"right",paddingRight:5,whiteSpace:"nowrap",flexShrink:0}}>{labels[i]}</div>
          {row.map((v,j)=>(
            <div key={j} style={{width:cs,height:cs,flexShrink:0,background:viridis(v),
              border:"0.5px solid rgba(255,255,255,.15)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {showVals&&v>0&&(
                <span style={{fontSize:Math.max(7,cs*.19),fontFamily:T.d,fontWeight:600,
                  color:v>.60?"rgba(0,0,0,.75)":"rgba(255,255,255,.95)"}}>
                  {v.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Colorbar({label,w=90}){
  const s=Array.from({length:20},(_,i)=>viridis(i/19)).join(",");
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
      <span style={{fontSize:10,fontFamily:T.d,color:T.navy}}>0</span>
      <div style={{width:w,height:9,background:`linear-gradient(to right,${s})`,
        border:`0.5px solid ${T.rule}`,borderRadius:2}}/>
      <span style={{fontSize:10,fontFamily:T.d,color:T.navy}}>1</span>
      {label&&<span style={{fontSize:11,fontFamily:T.g,fontStyle:"italic",color:T.navy}}>{label}</span>}
    </div>
  );
}

// ─── ISM TILE ─────────────────────────────────────────────────────────────────
function ISMTile({matrix,title,formula,note,cs=22}){
  return(
    <div style={{flex:"1 1 0",minWidth:0}}>
      <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.navy,marginBottom:4}}>{title}</div>
      <div style={{background:"#ede9dd",borderRadius:2,padding:"4px 8px",
        fontFamily:"'Courier New',monospace",fontSize:11,color:T.purple,marginBottom:10}}>{formula}</div>
      {/* matrix with axis labels outside */}
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {/* y-axis: label column + matrix */}
        <div style={{display:"flex",alignItems:"stretch"}}>
          {/* y-axis labels in dedicated column */}
          <div style={{width:46,flexShrink:0,display:"flex",flexDirection:"column",
            justifyContent:"space-between",paddingRight:8,paddingTop:2,paddingBottom:2}}>
            <span style={{fontSize:9,fontFamily:T.d,color:T.navy,writingMode:"vertical-rl",
              transform:"rotate(180deg)"}}>High SA</span>
            <span style={{fontSize:9,fontFamily:T.d,color:T.navy,writingMode:"vertical-rl",
              transform:"rotate(180deg)"}}>Low SA</span>
          </div>
          {/* matrix pixels */}
          <div>
            {matrix.map((row,i)=>(
              <div key={i} style={{display:"flex"}}>
                {row.map((v,j)=>(
                  <div key={j} style={{width:cs,height:cs,background:viridis(v),
                    border:"0.5px solid rgba(255,255,255,.18)"}}/>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* x-axis labels below matrix, offset to align with matrix (not y-label column) */}
        <div style={{display:"flex",marginLeft:46,justifyContent:"space-between",marginTop:5}}>
          <span style={{fontSize:9,fontFamily:T.d,color:T.navy}}>High SA</span>
          <span style={{fontSize:9,fontFamily:T.d,color:T.navy}}>Low SA</span>
        </div>
      </div>
      <div style={{fontFamily:T.g,fontSize:11,color:T.navy,marginTop:8,lineHeight:1.5}}>{note}</div>
    </div>
  );
}

// ─── SPAGHETTI PLOT (convergent) ──────────────────────────────────────────────
// Uses power function: rho(run) = base + (ceiling-base) * ((run-1)/3)^(1/k)
// k = 0.55 + SA*1.9  =>  all participants converge exactly at Run 4
function ModerationSchematic({W=420,H=210}){
  const pL=52,pB=32,pT=16,pR=16;
  const base=0.05,ceil=0.62;
  const nP=28;
  const saRange=Array.from({length:nP},(_,k)=>k/(nP-1));

  const xS=r=>pL+((r-1)/3)*(W-pL-pR);
  const yS=v=>pT+(H-pB-pT)*(1-(v-0)/(ceil+0.05));

  const col=sa=>{
    const r=Math.round(44+sa*142),g=Math.round(80-sa*58),b=Math.round(165-sa*138);
    return `rgb(${r},${g},${b})`;
  };
  const traj=sa=>{
    const k=0.55+sa*1.90;
    return [1,2,3,4].map(run=>{
      if(run===1)return base;
      return base+(ceil-base)*Math.pow((run-1)/3,1/k);
    });
  };

  return(
    <svg width={W} height={H} style={{overflow:"visible"}}>
      {[0,.15,.30,.45,.60].map(v=>(
        <line key={v} x1={pL} x2={W-pR} y1={yS(v)} y2={yS(v)}
          stroke={T.rule} strokeWidth={0.7} strokeDasharray="3,3"/>
      ))}
      <line x1={pL} x2={pL} y1={pT} y2={H-pB} stroke={T.navy} strokeWidth={1.2}/>
      <line x1={pL} x2={W-pR} y1={H-pB} y2={H-pB} stroke={T.navy} strokeWidth={1.2}/>
      {[0,.15,.30,.45,.60].map(v=>(
        <text key={v} x={pL-6} y={yS(v)+4} fontSize={10} fontFamily="DM Sans,sans-serif"
          fill={T.navy} textAnchor="end">{v.toFixed(2)}</text>
      ))}
      {[1,2,3,4].map(r=>(
        <text key={r} x={xS(r)} y={H-pB+15} fontSize={10} fontFamily="DM Sans,sans-serif"
          fill={T.navy} textAnchor="middle">Run {r}</text>
      ))}
      <text x={14} y={pT+(H-pB-pT)/2} fontSize={10} fontFamily="DM Sans,sans-serif"
        fill={T.navy} textAnchor="middle"
        transform={`rotate(-90,14,${pT+(H-pB-pT)/2})`}>Spearman rho</text>
      {saRange.map((sa,k)=>{
        const pts=traj(sa);
        return(
          <polyline key={k}
            points={pts.map((v,i)=>`${xS(i+1)},${yS(v)}`).join(" ")}
            fill="none" stroke={col(sa)} strokeWidth={1.4} strokeOpacity={0.6}/>
        );
      })}
    </svg>
  );
}

// =============================================================================
// PANEL 1 -- BACKGROUND
// =============================================================================
function Panel1(){
  return(
    <Panel idx={1} total={6}>
      <div style={{borderBottom:`2px solid ${T.accent}`,paddingBottom:14,marginBottom:18}}>
        <div style={{fontFamily:T.d,fontSize:28,fontWeight:700,color:T.navy,letterSpacing:"-.02em"}}>
          RSA-Learn
        </div>
      </div>

      <H1>Background</H1>
      <Rule/>

      <Body>
        Social anxiety is associated with altered neural and behavioural responses to social feedback, including greater weighting of negative peer evaluation, negativity-biased belief updating, and differences in reward- and threat-related circuitry during social evaluation (Cremers et al., 2015; Jarcho et al., 2015; Blair et al., 2016; Beltzer et al., 2019; Koban et al., 2023).
      </Body>

      <Body>
        A smaller and still developing literature suggests these differences may also extend to social learning, including neural differences in how expectations about the self and others are updated following positive and negative evaluation (Koban et al., 2023).
      </Body>

      <Body>
        Emerging work further suggests that social anxiety may be associated with differences in how social information is neurally <em>represented</em>. Higher trait social anxiety has been linked to greater person-to-person variability in neural responses to contextualised social cues (Camacho et al., 2024), and related work in loneliness has shown lower inter-subject neural similarity during social processing (Baek et al., 2023; Broom et al., 2024).
      </Body>

      <Body>
        However, this work remains limited and has not yet been used to test whether social anxiety shapes how peers and feedback are represented across repeated interactions, how those representations change as feedback is accumulated, or whether differences in social learning are supported by differences in representational structure (Kriegeskorte et al., 2008; Popal et al., 2019).
      </Body>

      <Rule/>
      <H1>Research Questions and Hypotheses</H1>

      <div style={{fontFamily:T.g,fontSize:12.5,color:T.navy,lineHeight:1.7,marginBottom:10}}>
        <div style={{marginBottom:6}}>(1) Do adolescents with higher levels of social anxiety learn about peers and their social feedback differently across repeated interactions in a complex social environment, and do these differences emerge in the structure of neural representations?</div>
        <div>(2) Do individuals with higher social anxiety represent peer feedback valence in more idiosyncratic, person-specific ways compared to those with lower social anxiety?</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:6}}>
        <div style={{background:T.accent+"0d",border:`1px solid ${T.accent}40`,borderRadius:4,padding:"13px 15px"}}>
          <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.accent,
            letterSpacing:".05em",textTransform:"uppercase",marginBottom:6}}>H1: Representational Learning</div>
          <Body size={11.5}>
            Neural representational geometry will progressively align with peer-structure model RDMs across runs. Continuous trait SA will positively predict the <em>rate</em> of this alignment: higher-SA individuals are expected to show steeper RSA trajectories while converging on a similar representational endpoint by Run 4.
          </Body>
        </div>
        <div style={{background:T.purple+"0d",border:`1px solid ${T.purple}40`,borderRadius:4,padding:"13px 15px"}}>
          <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.purple,
            letterSpacing:".05em",textTransform:"uppercase",marginBottom:6}}>H2: Idiosyncratic Representations</div>
          <Body size={11.5}>
            Higher trait SA will predict the AnnaK pattern of idiosyncratic inter-subject dissimilarity in feedback valence representations. High-SA individuals will represent feedback valence in person-specific ways, dissimilar even from each other; low-SA individuals will converge on a shared, typical structure. Tested separately for Nice and Mean feedback.
          </Body>
        </div>
      </div>
    </Panel>
  );
}

// =============================================================================
// PANEL 2 -- TASK DESIGN + ROIs
// =============================================================================
function Panel2(){
  const peers=[
    {lbl:"N80",disp:"Nice",pN:"0.80",pM:"0.20",pred:"High",col:T.accent,desc:"Predominantly kind; rarely critical"},
    {lbl:"N60",disp:"Nice",pN:"0.60",pM:"0.40",pred:"Low", col:T.accent,desc:"Slightly more kind than critical"},
    {lbl:"M60",disp:"Mean",pN:"0.40",pM:"0.60",pred:"Low", col:T.red,  desc:"Slightly more critical than kind"},
    {lbl:"M80",disp:"Mean",pN:"0.20",pM:"0.80",pred:"High",col:T.red,  desc:"Predominantly critical; rarely kind"},
  ];
  const rois=[
    {name:"vmPFC",          domain:"Reward and value",    col:T.warm,   note:"Social value coding; PE signals"},
    {name:"dACC (1)",       domain:"Salience and control",col:T.purple, note:"Conflict monitoring; PE"},
    {name:"dACC (2)",       domain:"Salience and control",col:T.purple, note:"Social-affective subregion"},
    {name:"Ant. Insula",    domain:"Emotion and threat",  col:T.red,    note:"Social feedback sensitivity"},
    {name:"Ventral striatum",domain:"Reward and value",   col:T.warm,   note:"Social reward learning"},
    {name:"Amygdala",       domain:"Emotion and threat",  col:T.red,    note:"Threat appraisal; negative signals"},
  ];
  return(
    <Panel idx={2} total={6}>
      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:32}}>
        {/* Task */}
        <div>
          <H1>Task Design</H1>
          <Rule/>
          <div style={{fontFamily:T.g,fontSize:12,color:T.navy,lineHeight:1.75,marginBottom:10}}>
            <div><strong>Sample:</strong> 33 adolescents (ages 10–15) with usable fMRI data</div>
            <div><strong>Structure:</strong> 4 runs × 8 trials/peer × 4 peers = 128 trials total (~6:30 min/run)</div>
            <div><strong>Peer reputations:</strong> not disclosed — inferred through experience</div>
          </div>
          <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"10px 14px",marginBottom:10}}>
            <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.warm,letterSpacing:".07em",textTransform:"uppercase",marginBottom:6}}>Trial Structure (per trial)</div>
            <div style={{display:"flex",gap:0}}>
              {[
                {label:"Prediction",dur:"4s",desc:"Predict: Nice or Mean?"},
                {label:"Feedback",dur:"3s",desc:"Peer delivers feedback"},
                {label:"Response",dur:"4s",desc:"\"You're Right/Wrong/Nice/Mean\""},
                {label:"ITI",dur:"0.5s",desc:"Next trial"},
              ].map((s,i)=>(
                <div key={i} style={{flex:1,borderLeft:i>0?`1px solid ${T.rule}`:undefined,paddingLeft:i>0?10:0,paddingRight:8}}>
                  <div style={{fontFamily:T.d,fontSize:9,fontWeight:700,color:T.accent,textTransform:"uppercase",letterSpacing:".05em"}}>{s.label}</div>
                  <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.navy,margin:"2px 0"}}>{s.dur}</div>
                  <div style={{fontFamily:T.g,fontSize:10.5,color:T.navy,lineHeight:1.4}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{height:6}}/>
          <H2>Peer Structure (2x2: Disposition x Predictability)</H2>
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:T.g,fontSize:11,marginTop:4}}>
            <thead>
              <tr style={{borderBottom:`1.5px solid ${T.rule}`}}>
                {["Peer","Disposition","P(Nice)","P(Mean)","Predictability","Description"].map(h=>(
                  <th key={h} style={{fontFamily:T.d,fontSize:8,fontWeight:700,color:T.muted,
                    textAlign:"left",padding:"3px 6px",textTransform:"uppercase",letterSpacing:".06em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {peers.map((p,i)=>(
                <tr key={i} style={{borderBottom:`0.5px solid ${T.rule}55`}}>
                  <td style={{padding:"5px 6px",fontFamily:T.d,fontWeight:700,color:p.col}}>{p.lbl}</td>
                  <td style={{padding:"5px 6px"}}>{p.disp}</td>
                  <td style={{padding:"5px 6px",fontWeight:600}}>{p.pN}</td>
                  <td style={{padding:"5px 6px"}}>{p.pM}</td>
                  <td style={{padding:"5px 6px"}}>{p.pred}</td>
                  <td style={{padding:"5px 6px",color:T.navy,fontSize:11}}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{fontFamily:T.g,fontSize:10.5,color:T.navy,marginTop:6,lineHeight:1.5}}>
            Note. All peers delivered both feedback types every run; labels reflect the dominant direction and its rate. True probabilities were not disclosed.
          </div>
        </div>

        {/* ROIs */}
        <div>
          <H1>Regions of Interest</H1>
          <Rule/>
          <Body>
            Six ROIs were selected a priori based on established roles in social feedback processing, reward learning, and evaluative threat response. All RSA and IS-RSA analyses are conducted within each ROI independently.
          </Body>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
            {rois.map(r=>(
              <div key={r.name} style={{background:r.col+"10",border:`1px solid ${r.col}45`,borderRadius:4,padding:"8px 10px"}}>
                <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:r.col,marginBottom:2}}>{r.name}</div>
                <div style={{fontFamily:T.g,fontSize:10,fontStyle:"italic",color:T.navy,marginBottom:3,lineHeight:1.3}}>{r.domain}</div>
                <div style={{fontFamily:T.g,fontSize:10.5,color:T.navy,lineHeight:1.4}}>{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// =============================================================================
// PANEL 3 -- H1: MODEL RDMs + M1 DERIVATION
// =============================================================================
function Panel3(){
  return(
    <Panel idx={3} total={6}>
      <H1>Model Representational Dissimilarity Matrices</H1>
      <Rule/>
      <Body>
        Four theory-driven model RDMs each encode a separable description of what the task structure predicts about peer and feedback representations. All dissimilarity values are derived directly from the task probability structure; no parameters are estimated from neural data. Models are tested in separate RSAs against the empirical brain RDM per ROI per run (Nili et al., 2014; Kriegeskorte et al., 2008).
      </Body>

      {/* Analysis structure callout */}
      <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,
        padding:"11px 16px",marginTop:4,marginBottom:6,display:"flex",gap:28,alignItems:"center"}}>
        <div style={{flex:1,borderRight:`1px solid ${T.rule}`,paddingRight:24}}>
          <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.warm,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:4}}>Neural RDM</div>
          <div style={{fontFamily:T.g,fontSize:11.5,color:T.navy,lineHeight:1.6}}>
            Per ROI, per run: pairwise dissimilarity between condition-averaged neural patterns (1 − Pearson r). One empirical RDM per participant × ROI × run.
          </div>
        </div>
        <div style={{fontSize:22,color:T.rule,flexShrink:0}}>↔</div>
        <div style={{flex:1,paddingLeft:4}}>
          <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.accent,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:4}}>Model RDMs (M1–M4)</div>
          <div style={{fontFamily:T.g,fontSize:11.5,color:T.navy,lineHeight:1.6}}>
            Theory-derived dissimilarity matrices encoding different aspects of the task's peer and feedback structure. RSA = Spearman rank correlation between neural and model RDM upper triangles.
          </div>
        </div>
        <div style={{fontSize:22,color:T.rule,flexShrink:0}}>→</div>
        <div style={{flex:1,paddingLeft:4}}>
          <div style={{fontFamily:T.d,fontSize:10,fontWeight:700,color:T.purple,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:4}}>Moderation test</div>
          <div style={{fontFamily:T.g,fontSize:11.5,color:T.navy,lineHeight:1.6}}>
            RSA coefficients entered into mixed model with run × trait SA interaction. H1 predicts b3 &gt; 0: higher SA accelerates alignment trajectory.
          </div>
        </div>
      </div>

      {/* M1 -- centred, full row */}
      <div style={{marginTop:14,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:"100%",textAlign:"center",marginBottom:10}}>
          <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:4}}>M1 · Feedback Phase</div>
          <div style={{fontFamily:T.d,fontSize:14,fontWeight:700,color:T.navy,marginBottom:2}}>Peer x Feedback</div>
          <div style={{fontFamily:T.g,fontSize:12,color:T.navy}}>8-condition</div>
        </div>
        <RDMGrid matrix={RDM8} labels={L8} cs={44}/>
        <div style={{marginTop:4,textAlign:"left"}}>
          <Colorbar label="Dissimilarity" w={8*44*0.65}/>
          <Fig n="1">Three-component model combining feedback valence, peer distributional distance, and Shannon surprise. Normalised by theoretical maximum sqrt(3). See derivation below.</Fig>
        </div>
      </div>

      {/* M2 / M3 / M4 -- horizontal row below */}
      <div style={{display:"flex",gap:28,alignItems:"flex-start",
        marginTop:20,paddingTop:16,borderTop:`1px solid ${T.rule}`}}>

        {/* M2 */}
        <div>
          <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:3}}>M2 · Feedback Phase</div>
          <div style={{fontFamily:T.d,fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>Peer Identity</div>
          <div style={{fontFamily:T.g,fontSize:12,color:T.navy,marginBottom:10}}>4-condition</div>
          <RDMGrid matrix={RDM4} labels={L4} cs={44}/>
          <Colorbar label="Dissimilarity" w={4*44*0.65}/>
          <Fig n="2">Peer dissimilarity during feedback processing, collapsed across feedback type.</Fig>
        </div>

        {/* M3 */}
        <div>
          <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.accent,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:3}}>M3 · Prediction Phase</div>
          <div style={{fontFamily:T.d,fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>Peer Identity</div>
          <div style={{fontFamily:T.g,fontSize:12,color:T.navy,marginBottom:10}}>4-condition</div>
          <RDMGrid matrix={RDM4} labels={L4} cs={44}/>
          <Colorbar label="Dissimilarity" w={4*44*0.65}/>
          <Fig n="3">Peer dissimilarity during the prediction phase, before feedback is delivered.</Fig>
        </div>

        {/* M4 */}
        <div>
          <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".07em",
            textTransform:"uppercase",marginBottom:3}}>M4 · Feedback Phase</div>
          <div style={{fontFamily:T.d,fontSize:13,fontWeight:700,color:T.navy,marginBottom:2}}>Feedback Type</div>
          <div style={{fontFamily:T.g,fontSize:12,color:T.navy,marginBottom:10}}>2-condition</div>
          <RDMGrid matrix={RDM2} labels={L2} cs={80} showVals={false}/>
          <Colorbar label="Dissimilarity" w={2*80*0.65}/>
          <Fig n="4">Binary valence model: Nice vs. Mean, collapsed across all peer identities.</Fig>
        </div>
      </div>

      {/* M1 derivation -- plain language + formulas */}
      <div style={{marginTop:22,borderTop:`1px solid ${T.rule}`,paddingTop:14}}>
        <H2 color={T.navy}>M1 Derivation -- How Each Cell Value Was Calculated</H2>
        <Body>
          M1 asks: how different are any two peer-feedback conditions from each other? Three independent dimensions distinguish conditions, each capturing a different aspect of what makes two trial types different. These are combined into a single dissimilarity value per cell using a Euclidean distance formula, normalised by the theoretical maximum sqrt(3).
        </Body>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18,marginTop:8}}>
          <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"12px 13px"}}>
            <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".06em",
              textTransform:"uppercase",marginBottom:5}}>Feedback Valence (d_v)</div>
            <Body size={10.5}>
              Did the two conditions involve the same feedback type or different types? Conditions sharing the same valence (e.g., N80+Nice and N60+Nice) are identical on this dimension. Conditions with different feedback types receive maximum dissimilarity.
            </Body>
            <div style={{background:"#e6e1d2",borderRadius:3,padding:"8px 10px",marginTop:5}}>
              <Mono color={T.navy}>d_v = 0  if same feedback type{"\n"}d_v = 1  if different feedback type</Mono>
            </div>
          </div>

          <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"12px 13px"}}>
            <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".06em",
              textTransform:"uppercase",marginBottom:5}}>Peer Distance (d_p)</div>
            <Body size={10.5}>
              How different are the two peers as social agents? Each peer is characterised by their true probability of giving Nice feedback. Peer dissimilarity is the absolute difference in these probabilities (total variation distance), normalised by the maximum possible difference (0.60).
            </Body>
            <div style={{background:"#e6e1d2",borderRadius:3,padding:"8px 10px",marginTop:5}}>
              <Mono color={T.navy}>d_p = |P(Nice)_i - P(Nice)_j| / 0.60{"\n\n"}N80 vs N60: |0.80-0.60|/0.60 = 0.33{"\n"}N80 vs M60: |0.80-0.40|/0.60 = 0.67{"\n"}N80 vs M80: |0.80-0.20|/0.60 = 1.00{"\n"}N60 vs M60: |0.60-0.40|/0.60 = 0.33{"\n"}N60 vs M80: |0.60-0.20|/0.60 = 0.67{"\n"}M60 vs M80: |0.40-0.20|/0.60 = 0.33</Mono>
            </div>
          </div>

          <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"12px 13px"}}>
            <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".06em",
              textTransform:"uppercase",marginBottom:5}}>Shannon Surprise (d_s)</div>
            <Body size={10.5}>
              How unexpected was each feedback given the peer who delivered it? Surprise = -ln P(feedback | peer). A difference in surprise between two conditions reflects how differently each one contextualises the feedback relative to accumulated peer knowledge, capturing the degree to which the brain should distinguish them.
            </Body>
            <div style={{background:"#e6e1d2",borderRadius:3,padding:"8px 10px",marginTop:5}}>
              <Mono color={T.navy}>surprise(cond) = -ln P(fb | peer){"\n"}d_s = |surprise_i - surprise_j| / max{"\n\n"}N80+N: -ln(0.80) = 0.22{"\n"}N80+M: -ln(0.20) = 1.61  (max){"\n"}N60+N: -ln(0.60) = 0.51{"\n"}N60+M: -ln(0.40) = 0.92{"\n"}M60+N: -ln(0.40) = 0.92{"\n"}M60+M: -ln(0.60) = 0.51{"\n"}M80+N: -ln(0.20) = 1.61  (max){"\n"}M80+M: -ln(0.80) = 0.22</Mono>
            </div>
          </div>
        </div>

        {/* Combined formula */}
        <div style={{background:T.accent+"0d",border:`1px solid ${T.accent}40`,borderRadius:4,
          padding:"12px 15px",marginTop:14,display:"flex",alignItems:"center",gap:20}}>
          <div style={{flex:1}}>
            <H2 color={T.accent}>Combined M1 Dissimilarity</H2>
            <Body size={11}>
              The three components are combined using a Euclidean distance, treating each as an orthogonal dimension of condition identity. Values are normalised by the theoretical maximum sqrt(3), which would require all three dimensions to be simultaneously maximal. Due to the symmetric task structure, no pair achieves this; the observed ceiling is 0.816, preserving a meaningful gradient across all cells.
            </Body>
          </div>
          <div style={{background:"#e6e1d2",borderRadius:4,padding:"12px 18px",flexShrink:0,textAlign:"center"}}>
            <Mono color={T.accent}>
              d(i,j) = sqrt(d_v^2 + d_p^2 + d_s^2){"\n\n"}normalise: d / sqrt(3)
            </Mono>
          </div>
        </div>

        {/* M2 derivation */}
        <div style={{marginTop:18,borderTop:`1px solid ${T.rule}`,paddingTop:14}}>
          <H2 color={T.navy}>M2 &amp; M3 Derivation -- Peer Identity</H2>
          <Body>
            M2 and M3 ask: how different are two peers as social agents, irrespective of what feedback they delivered? Each peer is characterised by a single parameter: the true probability of giving Nice feedback (N80 = 0.80, N60 = 0.60, M60 = 0.40, M80 = 0.20). Dissimilarity between any two peers is the absolute difference in these probabilities (total variation distance), normalised by the maximum possible difference (0.60). M2 uses neural responses from the feedback phase; M3 uses the prediction phase; otherwise the derivation is identical.
          </Body>
          <div style={{display:"flex",gap:18,alignItems:"flex-start",marginTop:8}}>
            <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"12px 13px",flex:1}}>
              <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".06em",
                textTransform:"uppercase",marginBottom:5}}>Formula</div>
              <div style={{background:"#e6e1d2",borderRadius:3,padding:"8px 10px"}}>
                <Mono color={T.navy}>d(i,j) = |P(Nice)_i - P(Nice)_j| / 0.60</Mono>
              </div>
            </div>
            <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:4,padding:"12px 13px",flex:1}}>
              <div style={{fontFamily:T.d,fontSize:11,fontWeight:700,color:T.warm,letterSpacing:".06em",
                textTransform:"uppercase",marginBottom:5}}>All pairwise values</div>
              <div style={{background:"#e6e1d2",borderRadius:3,padding:"8px 10px"}}>
                <Mono color={T.navy}>{"N80 vs N60: |0.80-0.60|/0.60 = 0.33\nN80 vs M60: |0.80-0.40|/0.60 = 0.67\nN80 vs M80: |0.80-0.20|/0.60 = 1.00\nN60 vs M60: |0.60-0.40|/0.60 = 0.33\nN60 vs M80: |0.60-0.20|/0.60 = 0.67\nM60 vs M80: |0.40-0.20|/0.60 = 0.33"}</Mono>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// =============================================================================
// PANEL 4 -- ROIs + H1 PREDICTED PATTERN
// =============================================================================
function Panel4(){
  return(
    <Panel idx={4} total={6}>
      <H1>H1: Predicted Pattern</H1>
      <Rule/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28,marginTop:8}}>
          <div>
            <Body>
              Each line represents one participant, coloured continuously by trait SA score (blue = low, red = high). All participants are expected to reach the same level of model-brain alignment by Run 4. SA predicts the <em>rate</em> of alignment across runs, not the final representational state.
            </Body>
            <div style={{background:"#f0ece0",border:`1px solid ${T.rule}`,borderRadius:3,padding:"10px 13px",marginTop:6}}>
              <H2 color={T.navy}>Moderation Model (per model RDM, per ROI)</H2>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:10.5,color:T.navy,lineHeight:1.75}}>
                rho(run) ~ b0 + b1*run + b2*SA + b3*(run x SA) + e
              </div>
              <div style={{fontFamily:T.g,fontSize:11,color:T.accent,marginTop:4}}>
                Prediction: b3 &gt; 0 (SA accelerates representational alignment)
              </div>
              <div style={{fontFamily:T.g,fontSize:11,color:T.navy,marginTop:4,lineHeight:1.5}}>
                Note. SA is entered as a continuous variable. Both low- and high-SA participants are expected to reach comparable representational alignment by Run 4; SA moderates the trajectory shape, not the asymptote.
              </div>
            </div>
          </div>
          <div>
            <ModerationSchematic W={400} H={240}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
              <span style={{fontSize:11,fontFamily:T.d,color:T.navy}}>Low SA</span>
              <div style={{width:120,height:10,background:`linear-gradient(to right,${
                Array.from({length:12},(_,k)=>{
                  const t=k/11;
                  return `rgb(${Math.round(44+t*142)},${Math.round(80-t*58)},${Math.round(165-t*138)})`;
                }).join(",")
              })`,border:`0.5px solid ${T.rule}`,borderRadius:2}}/>
              <span style={{fontSize:11,fontFamily:T.d,color:T.navy}}>High SA</span>
            </div>
            <Fig n="5">Predicted RSA alignment trajectories. All participants converge on the same Spearman rho by Run 4. Lines are coloured by continuous trait SA score. SA predicts steepness of alignment, not endpoint.</Fig>
          </div>
      </div>
    </Panel>
  );
}

// =============================================================================
// PANEL 5 -- H2: IS-RSA
// =============================================================================
function Panel5(){
  return(
    <Panel idx={5} total={6}>
      <H1>H2: Idiosyncratic Feedback Valence Representations</H1>
      <Rule/>

      <Body>
        Per participant and ROI, a 2-condition neural RDM contrasting Nice versus Mean feedback is reduced to a single dissimilarity value. Pairwise inter-subject dissimilarity is computed across all dyads, forming a matrix ordered by continuous trait SA, then regressed against three Anna Karenina geometric models (Finn and Scheinost, 2020) via partial Mantel test. High-SA individuals are predicted to represent feedback valence in more idiosyncratic, person-specific ways (dissimilar even from each other), while low-SA individuals converge on a shared, typical representational structure.
      </Body>

      <div style={{marginTop:14}}>
        <H2 color={T.navy}>Anna Karenina Model Matrices (Finn and Scheinost, 2020)</H2>
        <div style={{fontFamily:T.g,fontSize:11,color:T.navy,marginBottom:14,lineHeight:1.5}}>
          Each matrix shows predicted pairwise representational dissimilarity (ISD = 1 − ISS), with participants ordered high to low SA on both axes. Purple = similar; yellow = dissimilar. Same convention as Panel 3.
        </div>
        <div style={{display:"flex",gap:28,alignItems:"flex-start"}}>
          <ISMTile
            matrix={ISM_MEAN}
            title="SA Gradient"
            formula="ISD(i,j) = 1 − mean(SA_i, SA_j)"
            note="Idiosyncrasy scales smoothly: the high-SA corner (top-left) is darkest, reflecting a graded representational cluster among high-SA individuals."
            cs={24}
          />
          <ISMTile
            matrix={ISM_MIN}
            title="High-SA Threshold"
            formula="ISD(i,j) = 1 − min(SA_i, SA_j)"
            note="Idiosyncrasy is threshold-gated: the purple cluster appears only when both members of a dyad have high SA."
            cs={24}
          />
          <ISMTile
            matrix={ISM_PROD}
            title="Joint SA Product"
            formula="ISD(i,j) = 1 − SA_i × SA_j"
            note="Idiosyncrasy concentrates multiplicatively in the high-SA corner and falls off steeply when either member of the dyad has lower SA."
            cs={24}
          />
        </div>
        <Colorbar label="Dissimilarity" w={200}/>
        <div style={{fontFamily:T.g,fontSize:11,color:T.navy,lineHeight:1.65,marginTop:10}}>
          Note. Each cell is predicted pairwise representational dissimilarity. Participants ordered high to low SA along both axes. The purple cluster in the top-left (High SA × High SA dyads) is the predicted idiosyncrasy signature: high-SA individuals share a distinctive representational structure with each other, setting them apart from the heterogeneous low-SA group.
        </div>
        <Fig n="6">
          Predicted inter-subject representational dissimilarity matrices under three Anna Karenina geometric models (Finn and Scheinost, 2020). Participants ordered high SA (top/left) to low SA (bottom/right). Purple = similar; yellow = dissimilar. All three matrices entered simultaneously as regressors against the empirical matrix via partial Mantel test.
        </Fig>
      </div>
    </Panel>
  );
}

// =============================================================================
// PANEL 6 -- REFERENCES
// =============================================================================
function Panel6(){
  const refs=[
    "Baek, E. C., Hyon, R., Lopez, K., Du, M., Porter, M. A., & Parkinson, C. (2023). Lonely individuals process the world in idiosyncratic ways. Psychological Science, 34(6), 683-695.",
    "Beltzer, M. L., Adams, S., Beling, P. A., & Teachman, B. A. (2019). Social anxiety and dynamic social reinforcement learning in a volatile environment. Clinical Psychological Science, 7(6), 1372-1388.",
    "Blair, K. S., Otero, M., Teng, C., Geraci, M., Lewis, E., Hollon, N., Blair, R. J. R., Ernst, M., Grillon, C., & Pine, D. S. (2016). Learning from other people's fear: Amygdala-based social reference learning in social anxiety disorder. Psychological Medicine, 46(14), 2943-2953.",
    "Broom, T. W., Iyer, S., Courtney, A. L., & Meyer, M. L. (2024). Loneliness corresponds with neural representations and language use that deviate from shared cultural perceptions. Communications Psychology, 2, 40.",
    "Camacho, M. C., Balser, D., Furtado, E. J., Rogers, C. E., Schwarzlose, R. F., Sylvester, C. M., & Barch, D. M. (2024). Higher intersubject variability in neural response to narrative social stimuli among youth with higher social anxiety. Journal of the American Academy of Child and Adolescent Psychiatry, 63(5), 549-560.",
    "Cremers, H. R., Veer, I. M., Spinhoven, P., Rombouts, S. A. R. B., & Roelofs, K. (2015). Neural sensitivity to social reward and punishment anticipation in social anxiety disorder. Frontiers in Behavioral Neuroscience, 8, 439.",
    "Finn, E. S., & Scheinost, D. (2020). Idiosynchrony: From shared to individual neural processing of movie viewing. NeuroImage, 225, 117483.",
    "Jarcho, J. M., Romer, A. L., Shechner, T., Galvan, A., Guyer, A. E., Leibenluft, E., Pine, D. S., & Nelson, E. E. (2015). Forgetting the best when predicting the worst: Preliminary observations on neural circuit function in adolescent social anxiety. Developmental Cognitive Neuroscience, 13, 21-31.",
    "Koban, L., Andrews-Hanna, J. R., Ives, L., Wager, T. D., & Arch, J. J. (2023). Brain mediators of biased social learning of self-perception in social anxiety disorder. Translational Psychiatry, 13, 292.",
    "Kriegeskorte, N., Mur, M., & Bandettini, P. A. (2008). Representational similarity analysis: Connecting the branches of systems neuroscience. Frontiers in Systems Neuroscience, 2, 4.",
    "Nili, H., Wingfield, C., Walther, A., Su, L., Marslen-Wilson, W., & Kriegeskorte, N. (2014). A toolbox for representational similarity analysis. PLOS Computational Biology, 10(4), e1003553.",
    "Popal, H., Wang, Y., & Olson, I. R. (2019). A guide to representational similarity analysis for social neuroscience. Social Cognitive and Affective Neuroscience, 14(11), 1243-1253.",
  ];
  return(
    <Panel idx={6} total={6}>
      <H1>References</H1>
      <Rule/>
      <div style={{columns:2,columnGap:34}}>
        {refs.map((r,i)=>(
          <p key={i} style={{fontFamily:T.g,fontSize:10.5,color:T.navy,lineHeight:1.70,
            margin:"0 0 6px",breakInside:"avoid"}}>{r}</p>
        ))}
      </div>
    </Panel>
  );
}

// =============================================================================
// ROOT
// =============================================================================
export default function RSALearnPoster(){
  return(
    <div style={{background:"#e4e0d4",minHeight:"100vh",padding:"20px 0",
      display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
        sub,sup{font-size:.75em;}
      `}</style>
      <Panel1/>
      <Panel2/>
      <Panel3/>
      <Panel4/>
      <Panel5/>
      <Panel6/>
    </div>
  );
}
