function I(e){let t=e.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i);if(!t)throw new Error("parseSvg: no <svg> root element found");let[,n,r]=t,i=n.match(/viewBox="([^"]+)"/),o=0,a=0;if(i){let s=i[1].trim().split(/[\s,]+/).map(Number);o=s[2],a=s[3]}else o=Number(n.match(/\bwidth="([\d.]+)"/)?.[1]??0),a=Number(n.match(/\bheight="([\d.]+)"/)?.[1]??0);let l=[],c=r.replace(/<defs>([\s\S]*?)<\/defs>/gi,(s,_)=>(l.push(_),"")).trim();return{width:o,height:a,defs:l.join(`
`).trim(),body:c}}function G(e,t){return e.replace(/\bid="([^"]+)"/g,(n,r)=>`id="${t}${r}"`).replace(/url\(#([^)]+)\)/g,(n,r)=>`url(#${t}${r})`).replace(/\b(xlink:href|href)="#([^"]+)"/g,(n,r,i)=>`${r}="#${t}${i}"`)}function R(e){let t=[],n=/<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g,r=0,i=-1,o;for(;o=n.exec(e);){let[,a,,l]=o;a?(r--,r===0&&t.push(e.slice(i,n.lastIndex))):l?r===0&&t.push(o[0]):(r===0&&(i=o.index),r++)}return t}function N(e){let t=e.trim().match(/^(<g\b[^>]*>)([\s\S]*)<\/g>$/);if(!t)throw new Error("unwrapGroup: markup is not a single <g> element");return{open:t[1],children:R(t[2])}}var dt=0;function ut(e){return dt+=1,`${e}-${dt.toString(36)}-`}var ft=`<svg width="134" height="146" viewBox="0 0 134 146" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_84_717)">
<path d="M130.92 140.959L6.03042 140.959L30.9198 82.792L49.4198 71.292L49.4198 56.292L83.5985 4L130.92 140.959Z" fill="url(#paint0_linear_84_717)"/>
<path d="M29.584 82.1417L70.3612 78.1412L60.4239 100.071L29.584 82.1417Z" fill="#838F9D"/>
<path d="M31.9197 82.7917L128.92 137.292L47.4198 53.792L49.4197 70.7904L31.9197 82.7917Z" fill="#CDD4DE"/>
<path d="M29.8006 81.3605L37.9584 85.9889" stroke-width="7" stroke-linejoin="round" stroke="#747D8B"/>
<path d="M46.9198 56.292L50.4198 72.292" stroke-width="7" stroke-linejoin="round" stroke="url(#paint1_linear_84_717)"/>
<path d="M50.4197 71.2909L31.9198 81.792" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="url(#paint2_linear_84_717)"/>
<path d="M83.5985 4L129.42 140.792L46.9198 56.792L83.5985 4Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint3_linear_84_717)"/>
<path d="M6.03081 140.947L129.418 140.951L30.9196 81.7917L6.03081 140.947Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint4_linear_84_717)"/>
<path d="M62.4198 140.792L96.92 140.794" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
<path d="M99.9198 52.792L119.42 111.792" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
<path d="M37.6158 103.265L30.4675 126.139C30.4359 126.24 30.3703 126.345 30.3468 126.448C29.5521 129.937 83.67 134.718 87.4198 129.792C90.3327 125.965 50.7348 106.902 38.8735 102.624C38.347 102.434 37.7828 102.73 37.6158 103.265Z" fill="url(#paint5_linear_84_717)"/>
<path d="M67.4731 58.2086L80.3266 37.9391C80.3883 37.8418 80.4694 37.7446 80.5756 37.7C85.4045 35.6704 106.896 96.849 101.959 97.2913C97.5247 97.6887 65.2092 65.0845 67.3887 58.3808C67.4091 58.318 67.4378 58.2644 67.4731 58.2086Z" fill="url(#paint6_linear_84_717)"/>
<path d="M74.9198 37.792L68.6975 46.319" stroke-width="7" stroke-linecap="round" stroke="#F4F6F9"/>
</g>
<defs>
<linearGradient id="paint0_linear_84_717" x1="126.824" y1="132.44" x2="57.7634" y2="75.7667" gradientUnits="userSpaceOnUse">
<stop stop-color="#F1F3F5"/>
<stop offset="1" stop-color="#E7ECF1"/>
</linearGradient>
<linearGradient id="paint1_linear_84_717" x1="60.5478" y1="51.7202" x2="10.9552" y2="47.0245" gradientUnits="userSpaceOnUse">
<stop stop-color="#9CA5B2"/>
<stop offset="1" stop-color="#9FA8B5"/>
</linearGradient>
<linearGradient id="paint2_linear_84_717" x1="46.5737" y1="63.4301" x2="10.1965" y2="44.4613" gradientUnits="userSpaceOnUse">
<stop stop-color="#A1AAB7"/>
<stop offset="1" stop-color="#6E7480"/>
</linearGradient>
<linearGradient id="paint3_linear_84_717" x1="60.8427" y1="27.4473" x2="177.481" y2="73.8407" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<linearGradient id="paint4_linear_84_717" x1="48.6328" y1="90.4675" x2="147.674" y2="155.445" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<linearGradient id="paint5_linear_84_717" x1="104.448" y1="128.936" x2="50.9198" y2="92.792" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint6_linear_84_717" x1="104.448" y1="128.936" x2="50.9198" y2="92.792" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<clipPath id="clip0_84_717">
<rect width="134" height="146" fill="white"/>
</clipPath>
</defs>
</svg>
`,ht=`<svg width="177" height="155" viewBox="0 0 177 155" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_84_718)">
<path d="M170.274 24.821L84.8025 146.264L60.2731 89.699L26.2791 100.514L39.1731 52.7318L9 8.32031L170.274 24.821Z" fill="url(#paint0_linear_84_718)"/>
<path d="M26.2789 100.514L50.6942 67.6097L60.273 89.6987L26.2789 100.514Z" fill="#838F9D"/>
<path d="M50.6942 67.6099L170.274 24.8209L39.173 52.7316L26.279 100.514L50.6942 67.6099Z" fill="#CDD4DE"/>
<path d="M26.2791 100.513L60.2732 89.6977" stroke-width="7" stroke-linejoin="round" stroke="#747D8B"/>
<path d="M39.1731 52.7308L26.2791 100.513" stroke-width="7" stroke-linejoin="round" stroke="url(#paint1_linear_84_718)"/>
<path d="M53 69.5002L26.2791 100.513" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="url(#paint2_linear_84_718)"/>
<path d="M9 8.32031L170.274 24.821L39.1731 52.7318L9 8.32031Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint3_linear_84_718)"/>
<path d="M84.8025 146.263L170.274 24.8197L53 69.5L84.8025 146.263Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint4_linear_84_718)"/>
<path d="M94.793 132.069L150.287 53.2198" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
<path d="M43.3296 11.832L114.974 19.1623" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
<path d="M71.3534 74.8731L87.4125 114.549C87.6866 115.226 88.5551 115.406 89.053 114.872C104.447 98.342 144.942 53.349 142.5 46.9996C140.744 42.4338 96.5156 61.8859 71.8377 73.6017C71.3597 73.8286 71.1549 74.3827 71.3534 74.8731Z" fill="url(#paint5_linear_84_718)"/>
<path d="M58.1824 37.8449L51.2583 23.564C50.9219 22.8701 51.4558 22.0714 52.2251 22.1254C76.714 23.8442 115.689 24.1215 113.5 28.5C111.526 32.4476 77.2487 35.9082 59.2094 38.4013C58.7795 38.4607 58.3717 38.2354 58.1824 37.8449Z" fill="url(#paint6_linear_84_718)"/>
<path d="M32 21L43 37.5" stroke-width="7" stroke-linecap="round" stroke="#F4F6F9"/>
</g>
<defs>
<linearGradient id="paint0_linear_84_718" x1="141" y1="39" x2="56.5" y2="68" gradientUnits="userSpaceOnUse">
<stop stop-color="#F1F3F5"/>
<stop offset="1" stop-color="#E7ECF1"/>
</linearGradient>
<linearGradient id="paint1_linear_84_718" x1="37.5" y1="53" x2="7.45581" y2="92.7344" gradientUnits="userSpaceOnUse">
<stop stop-color="#9CA5B2"/>
<stop offset="1" stop-color="#9FA8B5"/>
</linearGradient>
<linearGradient id="paint2_linear_84_718" x1="40.1254" y1="71.0424" x2="4.87681" y2="92.0343" gradientUnits="userSpaceOnUse">
<stop stop-color="#A1AAB7"/>
<stop offset="1" stop-color="#6E7480"/>
</linearGradient>
<linearGradient id="paint3_linear_84_718" x1="17" y1="40" x2="117.742" y2="-34.885" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<linearGradient id="paint4_linear_84_718" x1="64.2142" y1="83.4913" x2="171.528" y2="33.3412" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<linearGradient id="paint5_linear_84_718" x1="144" y1="45" x2="82.5" y2="85.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint6_linear_84_718" x1="144" y1="45" x2="82.5" y2="85.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<clipPath id="clip0_84_718">
<rect width="177" height="155" fill="white"/>
</clipPath>
</defs>
</svg>
`,mt=`<svg width="114" height="152" viewBox="0 0 114 152" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_84_719)">
<path d="M45.2335 67.4941L107.62 58.2413L32.761 47.9451L6.66174 6L107.62 58.2413L96.4955 145.647L45.2335 67.4941Z" fill="url(#paint0_linear_84_719)"/>
<path d="M44.9775 66.5006L15.5021 94.4978L56.7336 87.494L44.9775 66.5006Z" fill="#838F9D"/>
<path d="M50.3827 63.3007L15.5022 94.4977L32.7611 47.9447L107.62 58.2409L50.3827 63.3007Z" fill="#CDD4DE"/>
<path d="M15.502 94.4984L56.7335 85.9941" stroke-width="7" stroke-linejoin="round" stroke="#737D8B"/>
<path d="M87.2335 111.994C82.4902 111.994 61.7335 77.9944 64.2335 75.4941C69.7335 72.4941 93.2335 69.4941 95.7335 71.4941C98.549 73.7465 90.7335 111.994 87.2335 111.994Z" fill="url(#paint1_linear_84_719)"/>
<path d="M37.2335 39.9941C34.7335 38.9941 28.7335 27.4941 30.2335 26.4941C34.2335 26.4941 70.7335 44.9941 66.7335 45.4941C62.7335 45.9941 38.9074 40.6637 37.2335 39.9941Z" fill="url(#paint2_linear_84_719)"/>
<path d="M15.502 94.4983L32.7609 47.9452" stroke-width="7" stroke-linejoin="round" stroke="url(#paint3_linear_84_719)"/>
<path d="M15.5021 94.4983L44.2335 67.9943" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="url(#paint4_linear_84_719)"/>
<path d="M32.761 47.9451L6.66174 6L107.62 58.2413L32.761 47.9451Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint5_linear_84_719)"/>
<path d="M27.1915 38.9941L12.5692 15.4941" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
<path d="M44.7336 67.4942L107.62 58.2419L94.7335 145.994L44.7336 67.4942Z" stroke-width="7" stroke-linejoin="round" stroke="url(#paint6_linear_84_719)"/>
<path d="M83.2686 127.994L56.8356 86.4941" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke="white" stroke-opacity="0.2"/>
</g>
<defs>
<linearGradient id="paint0_linear_84_719" x1="76.7335" y1="75.4941" x2="107.734" y2="57.9941" gradientUnits="userSpaceOnUse">
<stop stop-color="#F2F3F7"/>
<stop offset="1" stop-color="#E5EAEE"/>
</linearGradient>
<linearGradient id="paint1_linear_84_719" x1="47.7335" y1="75.9941" x2="78.2335" y2="59.9941" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint2_linear_84_719" x1="47.7335" y1="75.9941" x2="78.2335" y2="59.9941" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint3_linear_84_719" x1="31.2335" y1="46.4941" x2="20.0102" y2="45.1673" gradientUnits="userSpaceOnUse">
<stop stop-color="#BCC3CC"/>
<stop offset="1" stop-color="#9FA8B5"/>
</linearGradient>
<linearGradient id="paint4_linear_84_719" x1="42.2335" y1="70.9941" x2="13.2335" y2="96.9941" gradientUnits="userSpaceOnUse">
<stop stop-color="#BFC5CE"/>
<stop offset="1" stop-color="#9CA6B3"/>
</linearGradient>
<linearGradient id="paint5_linear_84_719" x1="104.734" y1="56.4941" x2="27.3204" y2="77.97" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<linearGradient id="paint6_linear_84_719" x1="106.734" y1="57.9941" x2="57.563" y2="94.9443" gradientUnits="userSpaceOnUse">
<stop stop-color="#99A3B0"/>
<stop offset="1" stop-color="#C2C8D1"/>
</linearGradient>
<clipPath id="clip0_84_719">
<rect width="114" height="152" fill="white"/>
</clipPath>
</defs>
</svg>
`;var A={paper_plane_1:ft,paper_plane_2:ht,paper_plane_3:mt},vt={paper_plane_1:"drawing 1 \u2014 the plane at the start, small and far away",paper_plane_2:"drawing 2 \u2014 the plane close to the viewer, big, in front of the photo",paper_plane_3:"drawing 3 \u2014 the plane flying away, getting small and vanishing"};var U={colour:"white",opacity:.2},g=[{file:"paper_plane_2",corners:{N:[170.274,24.821],AT:[9,8.32031],AI:[39.1731,52.7318],BT:[84.8025,146.264],BI:[53,69.5],K:[26.2791,100.514],J1:[60.2731,89.699],J2:[50.6942,67.6097],KS:[60.2732,89.6977],J3:[53,69.5002]},faceGradient:{from:[141,39],to:[56.5,68],stops:["#F1F3F5","#E7ECF1"]},outlineAGradient:{from:[17,40],to:[117.742,-34.885],stops:["#99A3B0","#C2C8D1"]},outlineBGradient:{from:[64.2142,83.4913],to:[171.528,33.3412],stops:["#99A3B0","#C2C8D1"]},keelAGradient:{from:[37.5,53],to:[7.45581,92.7344],stops:["#9CA5B2","#9FA8B5"]},keelBGradient:{from:[40.1254,71.0424],to:[4.87681,92.0343],stops:["#A1AAB7","#6E7480"]},keelLineColour:"#747D8B",outlineWidth:7,highlights:[{wing:"B",line:{from:[94.793,132.069],to:[150.287,53.2198],width:7,...U}},{wing:"A",line:{from:[43.3296,11.832],to:[114.974,19.1623],width:7,...U}},{wing:"B",index:10},{wing:"A",index:11},{wing:"A",index:12}]},{file:"paper_plane_3",corners:{N:[107.62,58.2413],AT:[6.66174,6],AI:[32.761,47.9451],BT:[96.4955,145.647],BI:[45.2335,67.4941],K:[15.5021,94.4978],J1:[56.7336,87.494],J2:[50.3827,63.3007],KS:[56.7335,85.9941],J3:[44.2335,67.9943]},faceGradient:{from:[76.7335,75.4941],to:[107.734,57.9941],stops:["#F2F3F7","#E5EAEE"]},outlineAGradient:{from:[104.734,56.4941],to:[27.3204,77.97],stops:["#99A3B0","#C2C8D1"]},outlineBGradient:{from:[106.734,57.9941],to:[57.563,94.9443],stops:["#99A3B0","#C2C8D1"]},keelAGradient:{from:[31.2335,46.4941],to:[20.0102,45.1673],stops:["#BCC3CC","#9FA8B5"]},keelBGradient:{from:[42.2335,70.9941],to:[13.2335,96.9941],stops:["#BFC5CE","#9CA6B3"]},keelLineColour:"#737D8B",outlineWidth:7,highlights:[{wing:"B",index:4},{wing:"A",index:5},{wing:"A",line:{from:[27.1915,38.9941],to:[12.5692,15.4941],width:7,...U}},{wing:"B",line:{from:[83.2686,127.994],to:[56.8356,86.4941],width:7,...U}}]}],Q=["N","AT","AI","BT","BI"];function v(e){let t=0,n=0;for(let r of Q)t+=e.corners[r][0],n+=e.corners[r][1];return[t/Q.length,n/Q.length]}var tt=(e,t,n)=>e+(t-e)*n,b=(e,t,n)=>[tt(e[0],t[0],n),tt(e[1],t[1],n)];function j(e,t,n){let r=parseInt(e.slice(1),16),i=parseInt(t.slice(1),16),o=(l,c)=>l>>c&255,a=l=>Math.round(tt(o(r,l),o(i,l),n));return`#${(a(16)<<16|a(8)<<8|a(0)).toString(16).padStart(6,"0").toUpperCase()}`}function D(e,t){let[[n,r],[i,o],[a,l]]=e,[[c,s],[_,h],[d,p]]=t,u=(i-n)*(l-r)-(a-n)*(o-r),m=((_-c)*(l-r)-(d-c)*(o-r))/u,w=((d-c)*(i-n)-(_-c)*(a-n))/u,k=((h-s)*(l-r)-(p-s)*(o-r))/u,P=((p-s)*(i-n)-(h-s)*(a-n))/u;return[m,k,w,P,c-m*n-w*r,s-k*n-P*r]}var Bt=/-?\d*\.?\d+(?:e-?\d+)?/gi;function It(e){if(/[^MLZml\d\s.,eE-]/.test(e))return null;let t=/Z\s*$/i.test(e),n=(e.match(Bt)??[]).map(Number),r=[];for(let i=0;i+1<n.length;i+=2)r.push([n[i],n[i+1]]);return{points:r,closed:t}}function yt(e){let{body:t}=I(e);return R(N(t.trim()).children.join("")).map(n=>{let r=n.match(/\sd="([^"]+)"/)?.[1]??"",i=It(r);return{markup:n,points:i?.points??null,closed:i?.closed??!1}})}function bt(e){let{defs:t}=I(e);return[...t.matchAll(/<linearGradient\b([^>]*)>([\s\S]*?)<\/linearGradient>/g)].map(n=>{let r=o=>Number(n[1].match(new RegExp(`\\s${o}="([^"]+)"`))[1]),i=[...n[2].matchAll(/<stop\b([^>]*)\/?>/g)].map(o=>({offset:o[1].match(/offset="([^"]+)"/)?.[1]??"0",colour:o[1].match(/stop-color="([^"]+)"/)?.[1]??"black",opacity:o[1].match(/stop-opacity="([^"]+)"/)?.[1]??null}));return{id:n[1].match(/\sid="([^"]+)"/)[1],from:[r("x1"),r("y1")],to:[r("x2"),r("y2")],stops:i}})}var C={elements:yt(A.paper_plane_1),gradients:bt(A.paper_plane_1)},x={elements:yt(A.paper_plane_2),gradients:bt(A.paper_plane_2)},V=C.elements[0].points,B={N:V[0],BT:V[1],AI:V[4],AT:V[5],BI:C.elements[7].points[2]},Z={N:g[0].corners.N,BT:g[0].corners.BT,AI:g[0].corners.AI,AT:g[0].corners.AT,BI:g[0].corners.BI},Gt=e=>[e.reduce((t,n)=>t+n[0],0)/e.length,e.reduce((t,n)=>t+n[1],0)/e.length],$=Gt(Object.values(B)),E=v(g[0]),M=([e,t],n)=>[e*Math.cos(n)-t*Math.sin(n),e*Math.sin(n)+t*Math.cos(n)],O=(()=>{let e=0,t=0;for(let n of Object.keys(B)){let[r,i]=[B[n][0]-$[0],B[n][1]-$[1]],[o,a]=[Z[n][0]-E[0],Z[n][1]-E[1]];e+=r*a-i*o,t+=r*o+i*a}return Math.atan2(e,t)})();function y(e,t,n){let r=M([e[0]-$[0],e[1]-$[1]],O),i=[t[0]-E[0],t[1]-E[1]];return M(b(r,i,n),-(1-n)*O)}function Mt(){let e=C.elements[0].points,t=x.elements[0].points,n=g[0].corners.BI,[r,i]=[n[0]-t[1][0],n[1]-t[1][1]],o=((t[2][0]-t[1][0])*r+(t[2][1]-t[1][1])*i)/(r*r+i*i),a=b(e[1],e[2],o);return{first:[e[0],e[1],a,e[2],e[3],e[4],e[5],e[6]],second:[t[0],t[1],t[2],t[3],t[3],t[4],t[5],t[6]]}}var Ot=new Set([5]),T=Object.fromEntries(C.elements.flatMap((e,t)=>{let n=x.elements[t];return!e.points||!n.points?[]:t===0?[[t,Mt()]]:[[t,{first:Ot.has(t)?[...e.points].reverse():e.points,second:n.points}]]})),Tt=x.elements[0].points[3],Rt=C.elements[0].points[3],Ft=x.elements[1].points[2],Nt=.4,gt=(e,t)=>Math.hypot(e[0]-t[0],e[1]-t[1])<.01;function et(e,t,n,r=-1,i=-1){if(r===0&&i===K)return wt(n);let o=d=>M([d[0]-$[0],d[1]-$[1]],O),a=Math.min(1,n/Nt),l=1-a*a*(3-2*a);if(gt(t,Ft)){let d=wt(n),p=o(e),u=o(T[0].first[K]),m=M([(p[0]-u[0])*l,(p[1]-u[1])*l],-(1-n)*O);return[d[0]+m[0],d[1]+m[1]]}if(!gt(t,Tt))return y(e,t,n);let c=o(e),s=o(Rt),_=[t[0]-E[0],t[1]-E[1]],h=b(s,_,n);if(r===0&&i===Ut){let d=o(B.BI),p=b(d,[g[0].corners.BI[0]-E[0],g[0].corners.BI[1]-E[1]],n),u=[p[0]*l+h[0]*(1-l)+(c[0]-d[0])*l,p[1]*l+h[1]*(1-l)+(c[1]-d[1])*l];return M(u,-(1-n)*O)}return M([h[0]+(c[0]-s[0])*l,h[1]+(c[1]-s[1])*l],-(1-n)*O)}var K=2,Ut=3,_t=(()=>{let e=x.elements[0].points,t=g[0].corners.BI,[n,r]=[t[0]-e[1][0],t[1]-e[1][1]];return((e[2][0]-e[1][0])*n+(e[2][1]-e[1][1])*r)/(n*n+r*r)})();function wt(e){let{first:t,second:n}=T[0],r=y(t[1],n[1],e),i=y(t[3],g[0].corners.BI,e),o=b(r,i,_t),a=y(t[K],n[K],1),l=y(t[1],n[1],1),c=y(t[3],g[0].corners.BI,1),s=b(l,c,_t);return[o[0]+(a[0]-s[0])*e,o[1]+(a[1]-s[1])*e]}function xt(e){let{first:t,second:n}=T[0],r=y(t[1],n[1],e),i=y(t[3],g[0].corners.BI,e),o=Math.hypot(i[0]-r[0],i[1]-r[1]),a=[(i[0]-r[0])/o,(i[1]-r[1])/o],l=[-a[1],a[0]],c=et(t[3],n[3],e);(c[0]-r[0])*l[0]+(c[1]-r[1])*l[1]<0&&(l=[-l[0],-l[1]]);let s=1e3;return[[r[0]-a[0]*s,r[1]-a[1]*s],[r[0]+a[0]*s,r[1]+a[1]*s],[r[0]+a[0]*s+l[0]*s,r[1]+a[1]*s+l[1]*s],[r[0]-a[0]*s+l[0]*s,r[1]-a[1]*s+l[1]*s]]}var nt=[{index:10,wing:"B"},{index:11,wing:"A"}];function At(e,t,n){let[r,i]=t==="A"?["AT","AI"]:["BT","BI"],o=e===1?B:Z,a=l=>y(B[l],Z[l],n);return D([o[r],o.N,o[i]],[a(r),a("N"),a(i)])}var rt=512,jt={cx:256,cy:256,r:218},Dt=["plane"];var H=[[0,52,200,.36],[.15,72,262,.45],[.46,262,298,1.15],[.74,436,182,.5],[.86,456,132,.38],[.94,300,70,.36]],St=[[.15,.42,0,1],[.5,.74,1,2],[.92,.93,2,0]],kt={fade:{fadeIn:.15,fadeOutStart:.74,fadeOutEnd:.88},bank:{degrees:-7,at:.46,width:.14},wind:{wobble:1.45,wobbleWaves:3},size:1.1},Vt=Math.PI*2,ot=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};function it(e,t,n){let r=e.length,i=n-Math.floor(n),o=r-1;for(let L=0;L<r;L++)e[L][0]<=i&&(o=L);let a=L=>{let Lt=Math.floor(L/r),ct=e[(L%r+r)%r];return[ct[0]+Lt,ct[t]]},[l,c]=a(o-1),[s,_]=a(o),[h,d]=a(o+1),[p,u]=a(o+2),m=(i-s)/(h-s),w=(d-c)/(h-l)*(h-s),k=(u-_)/(p-s)*(h-s),P=m*m,F=P*m;return(2*F-3*P+1)*_+(F-2*P+m)*w+(-2*F+3*P)*d+(F-P)*k}function Pt(e){return[it(H,1,e),it(H,2,e)]}function Et(e){let t=e-Math.floor(e),n={viewA:0,viewB:0,blend:0};for(let[r,i,o,a]of St){if(t<r)return n;if(t<=i)return{viewA:o,viewB:a,blend:ot(r,i,t)};n={viewA:a,viewB:a,blend:0}}return n}function st(e){let t=e-Math.floor(e),[n,r]=Pt(t),{fade:i,bank:o,wind:a,size:l}=kt,c=(t-o.at+1.5)%1-.5,s=Math.exp(-((c/o.width)**2));return{x:n,y:r,scale:it(H,3,t)*l,rotate:o.degrees*s+a.wobble*Math.sin(Vt*a.wobbleWaves*t+.6),opacity:ot(0,i.fadeIn,t)*(1-ot(i.fadeOutStart,i.fadeOutEnd,t)),...Et(t)}}var f=e=>Math.round(e*1e3)/1e3,at=e=>{let t=Math.min(1,Math.max(0,e));return t*t*(3-2*t)},S=e=>e.map(([t,n])=>`${f(t)},${f(n)}`).join(" "),Zt=["paper_plane_1","paper_plane_2","paper_plane_3"],Kt=[$,v(g[0]),v(g[1])],J={face:"faceGradient",outlineA:"outlineAGradient",outlineB:"outlineBGradient",keelA:"keelAGradient",keelB:"keelBGradient"},lt=g.flatMap((e,t)=>e.highlights.map((n,r)=>({view:t+1,hi:r,wing:n.wing}))),Ht=Object.keys(T).map(Number),Wt=[1,3],Jt=3,W=.1;function z(e=0){return pt(st(e))}function $t(e,t,n,r){let i=g[t-1],o=g[n-1],a=v(i),l=v(o),c=(d,p)=>[p[0]-d[0],p[1]-d[1]],s={};for(let d of Object.keys(i.corners))s[d]=b(c(a,i.corners[d]),c(l,o.corners[d]),r);let _=String(f(i.outlineWidth+(o.outlineWidth-i.outlineWidth)*r));Object.assign(e,{"wing-a":{points:S([s.AT,s.N,s.AI])},"wing-b":{points:S([s.BT,s.N,s.BI])},keel:{points:S([s.K,s.J2,s.J1])},fold:{points:S([s.J2,s.N,s.AI,s.K])},"keel-line":{points:S([s.K,s.KS]),"stroke-width":_,stroke:j(i.keelLineColour,o.keelLineColour,r)},"keel-a":{points:S([s.AI,s.K]),"stroke-width":_},"keel-b":{points:S([s.J3,s.K]),"stroke-width":_},"outline-a":{points:S([s.AT,s.N,s.AI]),"stroke-width":_},"outline-b":{points:S([s.BT,s.N,s.BI]),"stroke-width":_}});for(let d of Object.keys(J)){let p=i[J[d]],u=o[J[d]],m=b(c(a,p.from),c(l,u.from),r),w=b(c(a,p.to),c(l,u.to),r);e[`grad-${d}`]={x1:String(f(m[0])),y1:String(f(m[1])),x2:String(f(w[0])),y2:String(f(w[1]))},e[`grad-${d}-0`]={"stop-color":j(p.stops[0],u.stops[0],r)},e[`grad-${d}-1`]={"stop-color":j(p.stops[1],u.stops[1],r)}}let h=d=>(t===d?1-r:0)+(n===d?r:0);for(let d of lt){let p=g[d.view-1],[u,m]=d.wing==="A"?["AT","AI"]:["BT","BI"],w=D([p.corners[u],p.corners.N,p.corners[m]],[s[u],s.N,s[m]]);e[`hl-${d.view}-${d.hi}`]={transform:`matrix(${w.map(f).join(" ")})`,opacity:String(f(h(d.view)))}}}function zt(e,t){for(let n of Ht){let{first:r,second:i}=T[n],a=r.map((l,c)=>et(l,i[c],t,n,c)).map(([l,c],s)=>`${s?"L":"M"}${f(l)} ${f(c)}`).join("")+(x.elements[n].closed?"Z":"");e[`f-e${n}`]={d:a}}e[`f-e${Jt}`].opacity=String(f(at((t-.5)/.45))),e["f-clip"]={d:xt(t).map(([n,r],i)=>`${i?"L":"M"}${f(n)} ${f(r)}`).join("")+"Z"},x.gradients.forEach((n,r)=>{let i=C.gradients[r],o=y(i.from,n.from,t),a=y(i.to,n.to,t);e[`f-g${r}`]={x1:String(f(o[0])),y1:String(f(o[1])),x2:String(f(a[0])),y2:String(f(a[1]))}});for(let n of nt)for(let r of[1,2]){let i=At(r,n.wing,t);e[`f-hl-${r}-${n.index}`]={transform:`matrix(${i.map(f).join(" ")})`,opacity:String(f(r===1?1-t:t))}}}function pt(e){let t=e.blend,n=e.viewA!==e.viewB&&t>0&&t<1,r=t>=1?e.viewB:e.viewA,i=Math.min(e.viewA,e.viewB),o=Math.max(e.viewA,e.viewB),a=n&&o-i===1,l=a&&i===0,c=l?1:a?Math.min(at(t/W),at((1-t)/W)):0,s=p=>n?a?l?"0":p===e.viewA&&t<W||p===e.viewB&&t>1-W?"1":"0":p===(t<.5?e.viewA:e.viewB)?"1":"0":r===p?"1":"0",_=l,h=a&&i===1,d={plane:{transform:`translate(${f(e.x)} ${f(e.y)}) rotate(${f(e.rotate)}) scale(${f(e.scale)})`,opacity:String(f(e.opacity))},"orig-0":{opacity:s(0)},"orig-1":{opacity:s(1)},"orig-2":{opacity:s(2)},first:{opacity:String(f(_?c:0))},morph:{opacity:String(f(h?c:0))}};return zt(d,_?e.viewA===0?t:1-t:1),h?$t(d,e.viewA,e.viewB,t):$t(d,1,1,0),d}function qt(e,t,n,r){let i=t.highlights[n];if(i.line){let{from:l,to:c,width:s,colour:_,opacity:h}=i.line;return`<path d="M${l[0]} ${l[1]}L${c[0]} ${c[1]}" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round" stroke="${_}" stroke-opacity="${h}"/>`}let o=I(e[t.file]).body.trim(),a=R(N(o).children.join(""));return G(a[i.index],r)}function q(e,{idPrefix:t="pp-",progress:n=0,state:r}={}){let i=r?pt(r):z(n),o=p=>`data-part="${p}" `+Object.entries(i[p]).map(([u,m])=>`${u}="${m}"`).join(" "),a=p=>`${t}v${p}-`,l=[],c=[];Zt.forEach((p,u)=>{let m=I(e[p]);l.push(G(m.defs,a(u)));let[w,k]=Kt[u];c.push(`<g ${o(`orig-${u}`)}><g transform="translate(${f(-w)} ${f(-k)})" fill="none">${G(m.body,a(u))}</g></g>`)}),x.gradients.forEach((p,u)=>{let m=p.stops.map(w=>`<stop offset="${w.offset}" stop-color="${w.colour}"${w.opacity===null?"":` stop-opacity="${w.opacity}"`}/>`).join("");l.push(`<linearGradient id="${t}f-g${u}" gradientUnits="userSpaceOnUse" ${o(`f-g${u}`)}>${m}</linearGradient>`)});let s=p=>x.gradients.reduce((u,m,w)=>u.split(`url(#${m.id})`).join(`url(#${t}f-g${w})`),p);l.push(`<clipPath id="${t}f-clip"><path ${o("f-clip")}/></clipPath>`);let _=x.elements.map((p,u)=>{if(nt.find(k=>k.index===u))return`<g ${o(`f-hl-1-${u}`)}>${G(C.elements[u].markup,a(0))}</g><g ${o(`f-hl-2-${u}`)}>${G(p.markup,a(1))}</g>`;let w=Wt.includes(u)?` clip-path="url(#${t}f-clip)"`:"";return s(p.markup.replace(/\sd="[^"]*"/,"")).replace(/^<path\b/,`<path ${o(`f-e${u}`)}${w}`)}).join("");for(let p of Object.keys(J))l.push(`<linearGradient id="${t}${p}" gradientUnits="userSpaceOnUse" ${o(`grad-${p}`)}><stop ${o(`grad-${p}-0`)}/><stop offset="1" ${o(`grad-${p}-1`)}/></linearGradient>`);let h=p=>`url(#${t}${p})`,d=lt.map(p=>`<g ${o(`hl-${p.view}-${p.hi}`)}>${qt(e,g[p.view-1],p.hi,a(p.view))}</g>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${512} ${512}" fill="none" overflow="visible" data-decoration="paper-plane-orbit"><defs>${l.join("")}</defs><g data-layer="plane"><g ${o("plane")}>`+c.join("")+`<g ${o("first")}>${_}</g><g ${o("morph")}><polygon ${o("wing-a")} fill="${h("face")}"/><polygon ${o("wing-b")} fill="${h("face")}"/><polygon ${o("keel")} fill="#838F9D"/><polygon ${o("fold")} fill="#CDD4DE"/><polyline ${o("keel-line")} stroke-linejoin="round"/><polyline ${o("keel-a")} stroke="${h("keelA")}" stroke-linejoin="round"/><polyline ${o("keel-b")} stroke="${h("keelB")}" stroke-linecap="round" stroke-linejoin="round"/><polygon ${o("outline-a")} stroke="${h("outlineA")}" stroke-linejoin="round"/><polygon ${o("outline-b")} stroke="${h("outlineB")}" stroke-linejoin="round"/>`+d+"</g></g></g></svg>"}var Ct=3e3,Yt=60,Y=180,X=class{constructor(t,n={}){this.playing=!1;this.destroyed=!1;this.phase=0;this.lastTime=null;this.rafId=0;this.parts=new Map;this.tick=t=>{this.playing&&(this.lastTime!==null&&(this.phase=(this.phase+(t-this.lastTime)*this.speed/Ct)%1),this.lastTime=t,this.render(),this.rafId=requestAnimationFrame(this.tick))};let{size:r="100%",visible:i=!0,autoplay:o=!0,className:a,speed:l=1}=n;this.speed=l;let c=document.createElement("template");c.innerHTML=q(A,{idPrefix:ut("pp")}),this.element=c.content.firstElementChild,this.element.setAttribute("role","presentation"),this.element.setAttribute("aria-hidden","true"),this.element.style.display="block",this.element.style.pointerEvents="none",this.element.style.background="transparent",a&&this.element.setAttribute("class",a),this.element.querySelectorAll("[data-part]").forEach(s=>this.parts.set(s.getAttribute("data-part"),s)),this.setSize(r),this.setVisible(i),t.appendChild(this.element),o&&this.play()}setSize(t){let n=typeof t=="number"?`${t}px`:t;this.element.style.width=n,this.element.style.height=n}show(){this.setVisible(!0)}hide(){this.setVisible(!1)}setVisible(t){this.element.style.visibility=t?"visible":"hidden"}play(){this.playing||this.destroyed||(this.playing=!0,this.lastTime=null,this.rafId=requestAnimationFrame(this.tick))}pause(){this.playing=!1,cancelAnimationFrame(this.rafId)}get isPlaying(){return this.playing}setSpeed(t){this.speed=t}seek(t){let n=t/Y;this.phase=(n%1+1)%1,this.render()}get frame(){return Math.floor(this.phase*Y)%Y}get progress(){return this.phase}destroy(){this.pause(),this.destroyed=!0,this.element.remove()}render(){let t=z(this.phase);for(let[n,r]of Object.entries(t)){let i=this.parts.get(n);if(i)for(let[o,a]of Object.entries(r))i.setAttribute(o,a)}}};function Xt(e,t){return new X(e,t)}function Qt(e="pp-",t=0){return q(A,{idPrefix:e,progress:t})}var be={id:"paper-plane-orbit",name:"Paper Plane Orbit",version:"1.0.0",status:{web:"approved (2026-10-30)",tgs:"not-exported"}};export{vt as ASSET_ROLES,A as ASSET_SOURCES,jt as AVATAR_AREA,rt as CANVAS_SIZE,Yt as FPS,Y as FRAME_COUNT,lt as HIGHLIGHT_SLOTS,Dt as LAYER_ORDER,Ct as LOOP_DURATION_MS,kt as MOTION,be as PAPER_PLANE_ORBIT_META,H as PATH_KEYS,X as PaperPlaneOrbitDecoration,g as VIEWS,St as VIEW_SEGMENTS,q as buildPaperPlaneOrbitSvg,Xt as mountPaperPlaneOrbit,Pt as pathPoint,z as planeFrame,pt as planeFrameFromState,st as planeState,Qt as renderPaperPlaneOrbitSvg,Et as viewBlend};
