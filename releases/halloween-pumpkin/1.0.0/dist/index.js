function st(e){let t=e.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i);if(!t)throw new Error("parseSvg: no <svg> root element found");let[,a,r]=t,n=a.match(/viewBox="([^"]+)"/),o=0,i=0;if(n){let p=n[1].trim().split(/[\s,]+/).map(Number);o=p[2],i=p[3]}else o=Number(a.match(/\bwidth="([\d.]+)"/)?.[1]??0),i=Number(a.match(/\bheight="([\d.]+)"/)?.[1]??0);let s=[],l=r.replace(/<defs>([\s\S]*?)<\/defs>/gi,(p,c)=>(s.push(c),"")).trim();return{width:o,height:i,defs:s.join(`
`).trim(),body:l}}function H(e,t){return e.replace(/\bid="([^"]+)"/g,(a,r)=>`id="${t}${r}"`).replace(/url\(#([^)]+)\)/g,(a,r)=>`url(#${t}${r})`).replace(/\b(xlink:href|href)="#([^"]+)"/g,(a,r,n)=>`${r}="#${t}${n}"`)}function V(e){let t=[],a=/<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g,r=0,n=-1,o;for(;o=a.exec(e);){let[,i,,s]=o;i?(r--,r===0&&t.push(e.slice(n,a.lastIndex))):s?r===0&&t.push(o[0]):(r===0&&(n=o.index),r++)}return t}function lt(e){let t=e.trim().match(/^(<g\b[^>]*>)([\s\S]*)<\/g>$/);if(!t)throw new Error("unwrapGroup: markup is not a single <g> element");return{open:t[1],children:V(t[2])}}function W(e,t,a){return e.replace(/^<([a-zA-Z][\w:-]*)/,`<$1 ${t}="${a}"`)}function U(e,t){return(e.match(/^<[^>]*>/)?.[0]??"").match(new RegExp(`\\s${t}="([^"]*)"`))?.[1]}function z(e){let t=[`translate(${O(e.x)} ${O(e.y)})`];return e.rotate&&t.push(`rotate(${O(e.rotate)})`),e.scale!==void 0&&e.scale!==1&&t.push(`scale(${O(e.scale)})`),t.join(" ")}var ot=0;function pt(e){return ot+=1,`${e}-${ot.toString(36)}-`}function O(e,t=3){let a=10**t;return Math.round(e*a)/a}var ct=`<svg width="40" height="43" viewBox="0 0 40 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_26_2341)">
<path d="M19.952 10.6778C17.6382 10.6778 15.4311 11.0337 13.384 11.6293C12.344 10.6006 9.90292 7.88638 8.45796 2.63198C6.65176 -3.93602 0.41216 10.6778 -0.08044 22.336C-0.0804417 41.5474 12.7272 42.861 19.9519 43.0252C27.1767 42.861 39.9843 41.5474 39.9843 22.336C39.4917 10.6778 33.2521 -3.93601 31.4459 2.63198C30.001 7.88638 27.5599 10.6006 26.5199 11.6293C24.4728 11.0337 22.2657 10.6778 19.952 10.6778Z" fill-rule="evenodd" clip-rule="evenodd" fill="#411558"/>
<path d="M6.46637 20.116L14.8702 24.9813C15.0814 25.1036 15.2616 25.3023 15.2348 25.5449C15.0691 27.043 11.4598 29.052 8.69803 27.6711C5.16136 25.9028 4.36082 22.571 5.25962 20.4404C5.45648 19.9738 6.02806 19.8622 6.46637 20.116Z" fill="#F56BFA"/>
<path d="M33.3741 20.116L24.9703 24.9813C24.7591 25.1036 24.5789 25.3023 24.6057 25.5449C24.7714 27.043 28.3807 29.052 31.1425 27.6711C34.6792 25.9028 35.4797 22.571 34.5809 20.4404C34.384 19.9738 33.8125 19.8622 33.3741 20.116Z" fill="#F56BFA"/>
</g>
<defs>
<clipPath id="clip0_26_2341">
<rect width="40" height="43" fill="white"/>
</clipPath>
</defs>
</svg>
`,dt=`<svg width="98" height="93" viewBox="0 0 98 93" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2315)">
<path d="M77.4367 44.6586C66.772 19.0488 47.1577 15.3307 38.6836 16.6729C27.6511 17.4999 19.4161 24.9334 16.6777 28.5468C5.14297 48.3526 27.6904 75.1419 37.5293 77.74C44.43 79.8332 68.4821 85.1003 79.6457 87.4723C78.5515 76.9384 75.0291 62.4025 73.4047 56.4513L77.4367 44.6586Z" fill="#8FAA34"/>
<path d="M16.6777 28.5468C5.14297 48.3526 27.6904 75.1419 37.5293 77.74C38.8317 78.1351 40.745 78.6432 43.0672 79.2235C40.9464 75.6628 37.9784 65.8419 43.0725 55.044L60.078 68.1047C57.3986 60.2089 55.0737 41.2021 67.2088 28.3416C56.9706 17.4068 44.8641 15.694 38.6836 16.6729C27.6511 17.4999 19.4161 24.9334 16.6777 28.5468Z" fill="url(#paint0_linear_20_2315)"/>
<path d="M38.6836 16.6729C47.1577 15.3307 66.772 19.0488 77.4367 44.6586L73.4047 56.4513C75.0291 62.4025 78.5515 76.9384 79.6457 87.4723C68.4821 85.1003 44.43 79.8332 37.5293 77.74C27.6904 75.1419 5.14297 48.3526 16.6777 28.5468C19.4161 24.9334 27.6511 17.4999 38.6836 16.6729Z" stroke-width="8" stroke="url(#paint1_linear_20_2315)"/>
<path d="M59.8781 63.9865C50.3952 51.6206 29.345 34.1594 17.8301 28.5551L26.9394 21.6998C46.4686 28.2575 58.1317 53.0229 59.8781 63.9865Z" fill="url(#paint2_linear_20_2315)"/>
</g>
<defs>
<linearGradient id="paint0_linear_20_2315" x1="59.51" y1="71.4104" x2="10.666" y2="20.3785" gradientUnits="userSpaceOnUse">
<stop stop-color="#373F2D" stop-opacity="0"/>
<stop offset="1" stop-color="#373F2D"/>
</linearGradient>
<linearGradient id="paint1_linear_20_2315" x1="24.4113" y1="32.6051" x2="72.7735" y2="99.0963" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
<linearGradient id="paint2_linear_20_2315" x1="36.5619" y1="43.8715" x2="62.1786" y2="66.6759" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
<clipPath id="clip0_20_2315">
<rect width="74" height="93" fill="white" transform="translate(0 21.4076) rotate(-16.8156)"/>
</clipPath>
</defs>
</svg>
`,ft=`<svg width="104" height="83" viewBox="0 0 104 83" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M76.2518 26.1435C50.2518 -0.256504 21.4806 3.26562 11.2518 14.6435C-5.14825 41.8435 20.7518 65.3102 35.7518 73.6435C56.5518 79.2435 82.7518 75.3102 93.2518 72.6435C89.7518 70.8102 81.8518 64.9435 78.2518 56.1435C73.1062 43.5654 69.7518 37.1435 67.7518 33.1435L76.2518 26.1435Z" fill="#8FAA34"/>
<path d="M76.2518 26.1435C50.2518 -0.256516 21.4806 3.26561 11.2518 14.6435C-5.14825 41.8435 20.7518 65.3102 35.7518 73.6435C44.4001 75.9719 66.4819 74.2569 75.4806 74.0654C60.4806 61.0654 65.9806 47.0654 62.9806 32.5654L76.2518 26.1435Z" fill="url(#paint0_linear_20_2292)"/>
<path d="M11.2518 14.6435C21.4806 3.26562 50.2518 -0.256504 76.2518 26.1435L67.7518 33.1435C69.7518 37.1435 73.1062 43.5654 78.2518 56.1435C81.8518 64.9435 89.7518 70.8102 93.2518 72.6435C82.7518 75.3102 56.5518 79.2435 35.7518 73.6435C20.7518 65.3102 -5.14825 41.8435 11.2518 14.6435Z" stroke-width="8" stroke="url(#paint1_linear_20_2292)"/>
<path d="M58.8239 57.8256C52.1911 49.5639 21.7619 28.1307 10 23.0654L16.5 11.5655C30.768 20.0905 53.5 37.5654 58.8239 57.8256Z" fill="url(#paint2_linear_20_2292)"/>
<defs>
<linearGradient id="paint0_linear_20_2292" x1="51.5216" y1="73.3891" x2="17.0439" y2="-0.894751" gradientUnits="userSpaceOnUse">
<stop stop-color="#373F2D" stop-opacity="0"/>
<stop offset="1" stop-color="#373F2D"/>
</linearGradient>
<linearGradient id="paint1_linear_20_2292" x1="30.9806" y1="62.2656" x2="92.3526" y2="94.1914" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
<linearGradient id="paint2_linear_20_2292" x1="34.6017" y1="38.8114" x2="61.2465" y2="60.4056" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
</defs>
</svg>
`,mt=`<svg width="51" height="48" viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2332)">
<path d="M37.6849 34.1743C41.82 30.1295 44.7549 29.7061 46.277 28.8932C48.7146 27.5914 46.6167 22.8357 44.7341 19.9637C29.817 -2.79257 14.1868 7.06467 9.51998 22.5311C4.85317 37.9975 11.7501 35.4764 15.221 33.3789C18.6919 31.2814 23.3405 29.2501 24.5778 36.4323C25.8601 43.8758 32.6909 39.0591 37.6849 34.1743Z" fill="#411558"/>
</g>
<defs>
<clipPath id="clip0_20_2332">
<rect width="40" height="34" fill="white" transform="translate(0 16.4738) rotate(-24.3208)"/>
</clipPath>
</defs>
</svg>
`,ut=`<svg width="206" height="154" viewBox="0 0 206 154" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2220)">
<path d="M34.7371 141.245L20.9811 123.895C47.628 132.624 99.3452 117.604 141.763 78.0466C152.741 67.8087 173.317 41.3569 174.229 18.636L185.943 36.03C180.969 64.273 159.169 88.9826 149.036 98.4329C104.169 140.274 50.4529 146.34 34.7371 141.245Z" fill="url(#paint0_linear_20_2220)"/>
<path d="M28.7466 131.685C58.2613 141.019 161.167 102.803 179.365 26.9129" stroke-width="6" stroke-linecap="round" stroke="url(#paint1_linear_20_2220)"/>
<path d="M116.834 21.1976C138.358 0.627845 162.504 8.6 171.886 15.1573L174.229 18.6361C173.317 41.357 152.741 67.8088 141.763 78.0466C99.3452 117.604 47.628 132.624 20.9811 123.895C10.6348 100.421 30.6825 81.4576 41.9997 74.9104C53.9875 35.7085 96.9713 19.6259 116.834 21.1976Z" fill="url(#paint2_linear_20_2220)"/>
<path d="M150.797 67.159L141.797 73.659C138.597 84.8591 106.131 102.326 90.2972 109.659L56.7972 123.159C51.1972 112.359 52.4639 103.992 53.7972 101.159C54.7972 104.826 57.4972 112.459 60.2972 113.659C63.0972 114.859 81.4639 111.492 90.2972 109.659C103.897 101.659 125.297 83.659 126.297 77.659C126.865 74.2519 121.797 66.159 115.797 62.159C119.363 61.4732 130.78 59.4586 141.297 62.659C147.297 61.3943 157.937 44.159 156.297 40.159C151.478 35.4542 144.796 32.2422 138.297 31.159C149.497 30.359 162.631 34.659 166.797 37.159C165.997 40.359 165.297 45.3257 163.797 47.159L150.797 67.159Z" fill="#FDEF7F"/>
<path opacity="0.6" d="M20.9812 123.895C13.6781 107.325 20.9812 85.1367 45.5 76.1367C38.5 84.1367 30.3896 103.004 35 109.637C40.1447 117.038 51.1618 119.205 58.7972 121.159C47.7972 127.159 30.2328 126.925 20.9812 123.895Z" fill="#D46424"/>
<path d="M72.7972 78.1589C77.7972 76.8798 79.7972 82.1592 92.7972 88.6591C91.2296 72.712 93.035 37.2861 112.797 23.1589C71.6635 28.1407 43.7919 63.2487 44.3179 74.4167C34.2376 81.8757 32.8939 96.2417 45.7972 94.6591C55.2787 93.4962 51.2972 83.6591 72.7972 78.1589Z" fill="#D46424"/>
<path d="M115.297 22.1595C123.654 16.1248 150.797 8.15903 171.797 24.659" stroke-width="8" stroke="#FDEF7F"/>
<path d="M51.2972 71.659C57.6662 54.7937 72.9839 32.7978 110.797 27.6591" stroke-width="8" stroke-linecap="round" stroke="url(#paint3_linear_20_2220)" stroke-opacity="0.8"/>
<path d="M27 121.637C25.2028 117.614 18 92.6367 43.5 74.6366" stroke-width="8" stroke-linecap="round" stroke="url(#paint4_linear_20_2220)" stroke-opacity="0.8"/>
<path d="M112.297 33.1591C115.297 28.6591 119.297 24.1591 122.297 21.6591L115.297 17.159C112.599 21.4766 111.51 29.7488 112.297 33.1591Z" fill="#AB4F12"/>
<path d="M38.7972 72.159C48.2972 71.159 55.2972 73.1591 58.2972 75.159C50.7972 75.659 44.2972 77.6591 39.7972 80.6591L38.7972 72.159Z" fill="#723012"/>
<path d="M174.229 18.636C166.184 8.81832 138.358 0.627742 116.834 21.1974C96.9713 19.6258 53.9876 35.7083 41.9997 74.9103C29.403 80.9395 9.99255 101.329 20.9812 123.895L37.7972 144.659C53.513 149.754 106.43 142.5 151.297 100.659C161.484 91.1591 183.324 67.402 188.297 39.1591L174.229 18.636ZM20.9812 123.895C29.599 126.718 40.839 127.057 53.5386 124.885C56.3647 124.402 59.263 123.794 62.2209 123.062C87.0699 116.911 116.116 101.964 141.763 78.0465C149.904 70.4543 163.324 53.9452 170.088 36.6535C172.445 30.628 173.994 24.5075 174.229 18.636" stroke-width="8" stroke-linecap="round" stroke="url(#paint5_linear_20_2220)"/>
<path d="M57.9019 120.416L49.4019 122.415C43.8898 107.797 50.4019 93.9154 56.1373 90.6605C52.3531 98.7185 54.3067 111.512 57.9019 120.416Z" fill="#652911"/>
<path d="M136.797 79.6591C132.297 72.1591 120.297 64.6591 112.889 62.4094C120.323 61.003 134.674 63.6764 144.297 73.6591L136.797 79.6591Z" fill="#9F4912"/>
<path d="M172.297 33.6591C166.574 27.2366 148.466 24.424 136.533 31.5545C145.335 29.5881 166.797 35.7795 167.413 42.8096L172.297 33.6591Z" fill="#BD5911"/>
</g>
<defs>
<linearGradient id="paint0_linear_20_2220" x1="168.4" y1="53.9774" x2="53.3201" y2="140.075" gradientUnits="userSpaceOnUse">
<stop stop-color="#FEC475"/>
<stop offset="0.538853" stop-color="#D59E6B"/>
<stop offset="1" stop-color="#976962"/>
</linearGradient>
<linearGradient id="paint1_linear_20_2220" x1="180.797" y1="21.6591" x2="41.2972" y2="130.159" gradientUnits="userSpaceOnUse">
<stop stop-color="#FBE0A8" stop-opacity="0"/>
<stop offset="0.507823" stop-color="#FFEABE"/>
<stop offset="1" stop-color="#FBE0A8" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint2_linear_20_2220" x1="92.778" y1="51.9382" x2="135.655" y2="82.0643" gradientUnits="userSpaceOnUse">
<stop stop-color="#FE7513"/>
<stop offset="1" stop-color="#FEA737"/>
</linearGradient>
<linearGradient id="paint3_linear_20_2220" x1="104.725" y1="27.1141" x2="48.5901" y2="72.9172" gradientUnits="userSpaceOnUse">
<stop stop-color="#FDEF7F"/>
<stop offset="1" stop-color="#D36776"/>
</linearGradient>
<linearGradient id="paint4_linear_20_2220" x1="104.725" y1="27.1142" x2="48.5901" y2="72.9173" gradientUnits="userSpaceOnUse">
<stop stop-color="#FDEF7F"/>
<stop offset="1" stop-color="#8F50B7" stop-opacity="0.7"/>
</linearGradient>
<linearGradient id="paint5_linear_20_2220" x1="170.867" y1="-2.01294" x2="22.7385" y2="134.307" gradientUnits="userSpaceOnUse">
<stop stop-color="#CF6311"/>
<stop offset="1" stop-color="#4F1D12"/>
</linearGradient>
<clipPath id="clip0_20_2220">
<rect width="206" height="154" fill="white"/>
</clipPath>
</defs>
</svg>
`,ht=`<svg width="78" height="163" viewBox="0 0 78 163" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40.4432 67.2498C40.4432 41.9944 58.6202 30.8044 70.4346 30.8044V6C20.4508 9.15694 4.84977 54.2559 5.00124 73.6485C7.72763 82.2172 25.3927 94.0201 38.6256 101.525C60.8911 114.153 55.5583 138.14 37.2635 138.14C25.4491 138.14 17.7244 131.375 21.814 118.747C7.27322 129.12 13.7399 151.161 30.4475 154.826C73.6153 164.297 85.6633 113.918 58.6202 94.394C42.2608 82.5834 40.4432 77.6225 40.4432 67.2498Z" fill="#8FAA34"/>
<path d="M37.2636 138.14C25.4492 138.14 17.0223 132.733 21.1119 120.105C10.6119 145.605 38.6257 150.105 46.6119 145.605C76.6119 130.605 62.6119 101.525 37.2636 89.605C21.1119 82.0097 16.0463 70.4383 16.1118 68.605C22.1118 30.0911 52.5042 14.0925 67.6118 8.60498C17.628 11.7619 4.84986 54.2559 5.00133 73.6485C7.72771 82.2172 25.3928 94.0201 38.6257 101.525C60.8912 114.153 55.5584 138.14 37.2636 138.14Z" fill="#BFDE58"/>
<path d="M70.4346 30.5C58.6202 30.5 40.4432 41.9944 40.4432 67.2498C40.4432 73.6485 42.1118 82.4758 58.6202 94.394C85.6633 113.918 72.2917 169.047 30.4475 154.826C13.6118 149.105 8.61179 129.105 21.814 118.747C20.1118 128.105 25.4491 138.14 37.2635 138.14C55.5583 138.14 60.8911 114.153 38.6256 101.525C25.3927 94.0201 7.72763 82.2172 5.00124 73.6485C4.84977 54.2559 20.4508 9.15694 70.4346 6" stroke-width="8" stroke="url(#paint0_linear_20_2309)"/>
<defs>
<linearGradient id="paint0_linear_20_2309" x1="29.1118" y1="7.60498" x2="36.8481" y2="45.543" gradientUnits="userSpaceOnUse">
<stop stop-color="#8B7723"/>
<stop offset="1" stop-color="#60561C"/>
</linearGradient>
</defs>
</svg>
`,gt=`<svg width="448" height="233" viewBox="0 0 448 233" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2258)">
<path d="M46.8884 30.2631C80.5346 30.2631 97.813 57.2165 84.6269 106.336L110.09 110.391C132.37 22.067 71.1894 3.94557 46.8884 5.4782V30.2631Z" fill="url(#paint0_linear_20_2258)"/>
<path d="M46.8884 29.5C80.5346 29.5 97.813 57.2165 84.6269 106.336L110.09 110.391C132.37 22.067 71.3011 3.46737 47 5" stroke-width="8" stroke="url(#paint1_linear_20_2258)"/>
<path d="M222.263 113.996C139.526 113.996 45.9296 87.9963 12.7629 68.9963C-9.63706 177.796 73.4296 199.996 117.763 197.496C150.963 221.496 201.026 224.996 222.263 224.996C243.5 224.996 293.563 221.496 326.763 197.496C371.096 199.996 454.163 177.796 431.763 68.9963C398.596 87.9963 305 113.996 222.263 113.996Z" fill-rule="evenodd" clip-rule="evenodd" fill="url(#paint2_radial_20_2258)"/>
<path d="M13.5 69.4963V50.4963C73.5 78.8963 178.167 88.9963 223 90.4963C305 96.0963 399.167 67.4963 436 52.4963L433.5 69.4963C385.9 102.296 273.333 111.83 223 112.496C126.6 112.496 43.1667 83.8297 13.5 69.4963Z" fill="url(#paint3_linear_20_2258)"/>
<path d="M18 57.4963C87 90.9963 296 125.996 430.5 57.4963" stroke-width="6" stroke-linecap="round" stroke="url(#paint4_linear_20_2258)"/>
<path opacity="0.2" d="M434.763 68.9963C351.5 133.496 230.733 129.992 147 118.496C121.41 170.581 166.393 210.737 180.5 220.996C160.1 220.996 134.333 207.33 124 200.496C93.6425 171.951 97 123.496 106.5 99.6747C105.648 99.4861 106.5 101.496 106.5 101.496L106.5 99.6747C143.334 108.006 185.549 113.996 225.263 113.996C308 113.996 401.596 87.9963 434.763 68.9963Z" fill-rule="evenodd" clip-rule="evenodd" fill="url(#paint5_linear_20_2258)"/>
<path d="M344 135.996C344.4 122.396 341.167 106.663 339.5 103.496C339.5 102.496 340 100.796 342 101.996C344 103.196 351.5 114.996 353.5 116.996C354 118.496 346 132.663 344 135.996Z" fill="#C25420"/>
<g opacity="0.5">
<path d="M121.763 197.496C154.963 221.496 205.026 224.996 226.263 224.996C247.5 224.996 297.563 221.496 330.763 197.496C332.766 194.4 334.941 190.147 337.075 185.496C341.559 175.727 345.86 164.207 348 157.996C333.5 173.996 297.5 203.496 223 202.996C163.4 202.596 117 176.496 102 156.996C103.5 163.996 105.129 171.451 111.5 181.996C114.886 187.601 117.255 193.054 121.763 197.496Z" fill="url(#paint6_linear_20_2258)"/>
<path d="M337.075 185.496C334.941 190.147 332.766 194.4 330.763 197.496C367.792 199.584 431.844 184.441 438.891 115.996C435.604 135.996 410.927 158.83 402 166.996C409.2 154.208 413 137.001 413 131.496C397.8 169.096 357.383 183.663 337.075 185.496Z" fill="url(#paint7_linear_20_2258)"/>
<path d="M16.7629 68.9963C-5.63706 177.796 77.4296 199.996 121.763 197.496C117.255 193.054 114.886 187.601 111.5 181.996C70 180.996 43 125.496 61 99.6748C66.5 101.996 96 109.996 104.5 109.996L107.5 99.6748C67.5966 90.6492 34.0097 78.8764 16.7629 68.9963Z" fill="url(#paint8_linear_20_2258)"/>
</g>
<path d="M342.5 196.496C348.5 186.996 350.5 165.996 347.5 156.996C345.9 167.396 336.5 186.33 332 194.496L342.5 196.496Z" fill="#C25420"/>
<path d="M106.378 196.496C100.378 186.996 98.3783 165.996 101.378 156.996C102.978 167.396 112.378 186.33 116.878 194.496L106.378 196.496Z" fill="#C25420"/>
<path d="M60.5 172.996C55.3 167.396 46.5 148.496 42.5 137.496C43 148.996 49.3333 170.996 52 178.496C69.6 194.096 95.3333 195.996 106 194.996C92 191.496 67 179.996 60.5 172.996Z" fill="#FD8133"/>
<path d="M22.3568 72.4963C14 92.9963 13 139.496 43 173.496" stroke-width="7" stroke="#FD8133"/>
<path d="M428.5 74.9963C434 97.9963 438.5 138.496 398 178.996" stroke-width="7" stroke="#FDEF7F"/>
<path d="M224 224.996C238 224.996 301 224.996 328.5 197.496C371.5 205.496 461.5 163.996 433.5 68.9963C377.667 103.496 197.5 144.996 14.5 71.4963" stroke-width="8" stroke="url(#paint9_linear_20_2258)"/>
<path d="M224.8 224.996C210.8 224.996 147.8 224.996 120.3 197.496C77.3 205.496 -12.7 163.996 15.3 68.9963L14 50.4963C88.3333 80.8297 284 123.996 435.5 50.4963L433.5 68.9963" stroke-width="8" stroke="url(#paint10_linear_20_2258)"/>
<path d="M347.5 156.496C344 165.496 333 189.496 322 197.996L330 201.496C341.5 189.496 347.5 166.996 347.5 156.496Z" fill="#7B3412"/>
<path d="M101 156.496C104.5 165.496 116.5 189.996 126.5 197.996L118.5 201.496C107 189.496 101 166.996 101 156.496Z" fill="#7C3412"/>
<path d="M100.279 130.18C103.607 117.359 109.747 108.234 114.995 104.452L104.601 101.899C100.883 105.168 98.2168 119.885 100.279 130.18Z" fill="#6E2C13"/>
<path d="M344.103 130.18C340.774 117.359 334.634 108.234 329.386 104.452L339.781 101.899C343.498 105.168 346.165 119.885 344.103 130.18Z" fill="#763112"/>
<path d="M42.0133 134.381C43.3165 143.95 49.2683 170.573 57.1254 180.686L48.5296 182.223C40.1472 167.87 39.5631 144.591 42.0133 134.381Z" fill="#632513"/>
<path d="M137.645 174.496C122.48 167.413 122.246 139.734 130.152 126.996L145.965 132.418C139.288 144.134 140.694 158.182 145.965 163.453C157.953 175.442 182.275 157.596 191.645 148.08C180.664 165.649 159.61 184.755 137.645 174.496Z" fill="url(#paint11_linear_20_2258)"/>
<path d="M191.645 148.08C182.275 157.596 157.953 175.442 145.965 163.453C140.694 158.182 139.288 144.134 145.965 132.418L191.645 148.08Z" fill="url(#paint12_radial_20_2258)"/>
<path d="M313 174.496C328.166 167.413 328.399 139.734 320.493 126.996L304.681 132.418C311.357 144.134 309.951 158.182 304.681 163.453C292.692 175.442 268.37 157.596 259 148.08C269.981 165.649 291.035 184.755 313 174.496Z" fill="url(#paint13_linear_20_2258)"/>
<path d="M259 148.08C268.37 157.596 292.692 175.442 304.681 163.453C309.951 158.182 311.357 144.134 304.681 132.418L259 148.08Z" fill="url(#paint14_radial_20_2258)"/>
<path d="M225.069 160.996C221.567 161.385 212.315 169.947 207.909 177.496C207.296 179.33 206.275 183.556 207.569 185.496C209.569 188.496 219.569 188.996 225.069 188.996C230.569 188.996 240.569 188.496 242.569 185.496C243.862 183.556 242.841 179.33 242.228 177.496C237.822 169.947 228.57 161.385 225.069 160.996Z" fill-rule="evenodd" clip-rule="evenodd" fill="url(#paint15_radial_20_2258)"/>
<path d="M225.069 188.996C219.569 188.996 209.569 188.496 207.569 185.496C206.275 183.556 207.296 179.33 207.91 177.496C206.653 179.65 205.791 181.721 205.569 183.496C204.423 192.66 218.069 192.996 225.069 192.996C232.069 192.996 245.714 192.66 244.569 183.496C244.347 181.721 243.484 179.65 242.228 177.496C242.841 179.33 243.862 183.556 242.569 185.496C240.569 188.496 230.569 188.996 225.069 188.996Z" fill-rule="evenodd" clip-rule="evenodd" fill="#C74F0F"/>
</g>
<defs>
<linearGradient id="paint0_linear_20_2258" x1="68" y1="32.4963" x2="107" y2="93.4963" gradientUnits="userSpaceOnUse">
<stop stop-color="#8FAA34"/>
<stop offset="1" stop-color="#394415"/>
</linearGradient>
<linearGradient id="paint1_linear_20_2258" x1="76" y1="57.9963" x2="66.4398" y2="-2.67302" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
<radialGradient id="paint2_radial_20_2258" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(225 160.496) rotate(90) scale(74 206.211)">
<stop stop-color="#FEA737"/>
<stop offset="1" stop-color="#FE7513"/>
</radialGradient>
<linearGradient id="paint3_linear_20_2258" x1="386.54" y1="72.1109" x2="281.584" y2="238.168" gradientUnits="userSpaceOnUse">
<stop stop-color="#FEC475"/>
<stop offset="0.538853" stop-color="#D59E6B"/>
<stop offset="1" stop-color="#976962"/>
</linearGradient>
<linearGradient id="paint4_linear_20_2258" x1="439.5" y1="32.4963" x2="20.5" y2="41.4962" gradientUnits="userSpaceOnUse">
<stop stop-color="#FBE0A8" stop-opacity="0"/>
<stop offset="0.400511" stop-color="#FFEABE"/>
<stop offset="1" stop-color="#FBE0A8" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint5_linear_20_2258" x1="222.5" y1="83.4963" x2="178" y2="227.996" gradientUnits="userSpaceOnUse">
<stop stop-color="#D95322"/>
<stop offset="1" stop-color="#732C12"/>
</linearGradient>
<linearGradient id="paint6_linear_20_2258" x1="210.402" y1="254.913" x2="68.5977" y2="64.5797" gradientUnits="userSpaceOnUse">
<stop stop-color="#EE661F"/>
<stop offset="1" stop-color="#BA421F"/>
</linearGradient>
<linearGradient id="paint7_linear_20_2258" x1="210.402" y1="254.913" x2="68.5977" y2="64.5797" gradientUnits="userSpaceOnUse">
<stop stop-color="#EE661F"/>
<stop offset="1" stop-color="#BA421F"/>
</linearGradient>
<linearGradient id="paint8_linear_20_2258" x1="210.402" y1="254.913" x2="68.5977" y2="64.5797" gradientUnits="userSpaceOnUse">
<stop stop-color="#EE661F"/>
<stop offset="1" stop-color="#BA421F"/>
</linearGradient>
<linearGradient id="paint9_linear_20_2258" x1="42" y1="90.9963" x2="430" y2="100.496" gradientUnits="userSpaceOnUse">
<stop stop-color="#521B14"/>
<stop offset="0.486317" stop-color="#A04A12"/>
<stop offset="1" stop-color="#4F1A11"/>
</linearGradient>
<linearGradient id="paint10_linear_20_2258" x1="414.5" y1="100.996" x2="18" y2="74.4963" gradientUnits="userSpaceOnUse">
<stop stop-color="#4F1A11"/>
<stop offset="0.465177" stop-color="#A14B12"/>
<stop offset="1" stop-color="#511A13"/>
</linearGradient>
<linearGradient id="paint11_linear_20_2258" x1="139.376" y1="141.491" x2="159.408" y2="173.31" gradientUnits="userSpaceOnUse">
<stop stop-color="#8F2E10"/>
<stop offset="1" stop-color="#FA730F"/>
</linearGradient>
<radialGradient id="paint12_radial_20_2258" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(156.506 160.378) rotate(-59.4703) scale(19.8873 25.1993)">
<stop stop-color="#5E240D"/>
<stop offset="1" stop-color="#170A12"/>
</radialGradient>
<linearGradient id="paint13_linear_20_2258" x1="311.269" y1="141.491" x2="291.237" y2="173.31" gradientUnits="userSpaceOnUse">
<stop stop-color="#8F2E10"/>
<stop offset="1" stop-color="#FA730F"/>
</linearGradient>
<radialGradient id="paint14_radial_20_2258" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(294.139 160.378) rotate(-120.53) scale(19.8873 25.1993)">
<stop stop-color="#5E240D"/>
<stop offset="1" stop-color="#170A12"/>
</radialGradient>
<radialGradient id="paint15_radial_20_2258" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(225.069 187.496) rotate(-90) scale(24 22.3128)">
<stop stop-color="#170A12"/>
<stop offset="1" stop-color="#381612"/>
</radialGradient>
<clipPath id="clip0_20_2258">
<rect width="448" height="233" fill="white"/>
</clipPath>
</defs>
</svg>
`,_t=`<svg width="51" height="48" viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2334)">
<path d="M24.803 39.9963C19.0346 40.4275 16.7775 42.3506 15.1616 42.9559C12.5738 43.9253 10.3904 39.2083 9.47874 35.8975C2.25484 9.66425 19.9815 4.44572 34.6741 11.1625C49.3667 17.8794 42.9172 21.3903 39.0493 22.6095C35.1815 23.8288 30.5852 25.9758 35.1585 31.6502C39.8983 37.5312 31.7693 39.4756 24.803 39.9963Z" fill="#411558"/>
</g>
<defs>
<clipPath id="clip0_20_2334">
<rect width="40" height="34" fill="white" transform="translate(0 16.4738) rotate(-24.3208)"/>
</clipPath>
</defs>
</svg>
`,Ct=`<svg width="95" height="85" viewBox="0 0 95 85" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_20_2321)">
<path d="M12.1106 45.9411C37.1549 46.7289 47.5057 66.1886 49.5505 75.82C51.4257 75.6549 54.7087 75.4705 58.5669 75.4415C61.446 71.2262 70.6848 61.663 77.6657 58.978C79.044 55.1059 78.6955 52.226 79.4868 50.2647C64.0926 26.6279 46.9159 10.8123 40.2518 5.85903C11.3382 12.3092 9.44367 35.268 12.1106 45.9411Z" fill="#8FAA34"/>
<path d="M12.1106 45.941C37.1549 46.7289 47.3959 67.7205 49.4407 77.3519C51.9116 77.1343 56.9364 75.3514 62.3913 75.4663C59.6636 55.4888 40.742 37.5225 29.8978 33.0637C24.0597 39.1337 17.0374 43.5996 12.1106 45.941Z" fill="url(#paint0_linear_20_2321)"/>
<path d="M79.4868 50.2647C64.0926 26.6279 46.9159 10.8123 40.2518 5.85903C41.0863 11.0187 40.3086 15.8609 38.5123 20.2914C47.5165 28.2438 68.7823 48.9239 70.932 62.839C76.5708 58.752 79.9841 59.9135 79.4868 50.2647Z" fill="url(#paint1_linear_20_2321)"/>
<path d="M40.2518 5.85903C11.3382 12.3092 9.44367 35.268 12.1106 45.9411C17.0374 43.5997 24.0597 39.1337 29.8978 33.0637C33.4571 29.3631 36.5763 25.0664 38.5123 20.2914C40.3086 15.8609 41.0863 11.0187 40.2518 5.85903Z" fill="url(#paint2_linear_20_2321)"/>
<path d="M49.5505 75.82C47.5057 66.1886 37.1549 46.7289 12.1106 45.9411C9.44367 35.268 11.3382 12.3092 40.2518 5.85903C46.9159 10.8123 64.0044 26.6907 79.3986 50.3275" stroke-width="8" stroke-linecap="round" stroke="url(#paint3_linear_20_2321)"/>
<path d="M60.3733 81.7342C53.8733 79.2342 41.6341 81.6727 39.3733 83.7342C43.5997 75.3689 53.2134 72.4974 57.3733 72.7343C61.5097 63.9793 70.5014 60.6875 73.9491 60.0625C75.2966 45.8962 88.3733 42.2343 94.3733 42.7343C81.4242 50.7343 80.5975 59.5377 80.3733 65.2342C71.0001 66.9083 63.5739 74.728 60.3733 81.7342Z" fill="#813912"/>
<path d="M35.8329 25.5C22.3329 42 12.7152 43.1002 9.33289 44L20.8148 48.7647C30.3329 43.5 35.3329 31 35.8329 25.5Z" fill="#3C3B17"/>
</g>
<defs>
<linearGradient id="paint0_linear_20_2321" x1="48.5845" y1="41.342" x2="23.095" y2="57.194" gradientUnits="userSpaceOnUse">
<stop stop-color="#373F2D" stop-opacity="0"/>
<stop offset="1" stop-color="#373F2D"/>
</linearGradient>
<linearGradient id="paint1_linear_20_2321" x1="82.3108" y1="62.7379" x2="36.3812" y2="-5.1239" gradientUnits="userSpaceOnUse">
<stop stop-color="#FDFBCD" stop-opacity="0"/>
<stop offset="1" stop-color="#FFF855"/>
</linearGradient>
<linearGradient id="paint2_linear_20_2321" x1="32.4728" y1="13.5703" x2="11.327" y2="42.9957" gradientUnits="userSpaceOnUse">
<stop stop-color="#D4D233"/>
<stop offset="1" stop-color="#D4D233" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint3_linear_20_2321" x1="34.5111" y1="52.3498" x2="42.6555" y2="5.17013" gradientUnits="userSpaceOnUse">
<stop stop-color="#383816"/>
<stop offset="1" stop-color="#8B7722"/>
</linearGradient>
<clipPath id="clip0_20_2321">
<rect width="95" height="85" fill="white"/>
</clipPath>
</defs>
</svg>
`;var L={pumpkin:gt,plant:ht,miniPumpkin:ut,tail:Ct,leaf1:dt,leaf2:ft,batHead:ct,leftWing:mt,rightWing:_t},Ht={pumpkin:"pumpkin",plant:"plant",miniPumpkin:"mini pumpkin",tail:"tail",leaf1:"leaf_1",leaf2:"leaf_2",batHead:"bat_head",leftWing:"left_wing",rightWing:"right_wing"};var h={linear:[0,0,1,1],inOut:[.42,0,.58,1],sine:[.37,0,.63,1],in:[.42,0,1,1],out:[0,0,.58,1],outSoft:[.2,.7,.4,1],inFast:[.55,0,.85,.4]};function D(e,t){let[a,r,n,o]=e;if(t<=0)return 0;if(t>=1)return 1;if(a===r&&n===o)return t;let i=3*a,s=3*(n-a)-i,l=1-i-s,p=3*r,c=3*(o-r)-p,m=1-p-c,_=g=>((l*g+s)*g+i)*g,P=g=>(3*l*g+2*s)*g+i,u=t;for(let g=0;g<8;g++){let y=_(u)-t;if(Math.abs(y)<1e-6)break;let d=P(u);if(Math.abs(d)<1e-6)break;u-=y/d}if(u<0||u>1||Math.abs(_(u)-t)>1e-4){let g=0,y=1;u=t;for(let d=0;d<30;d++)_(u)<t?g=u:y=u,u=(g+y)/2}return((m*u+c)*u+p)*u}var Y={M:2,L:2,C:6,Z:0,H:1,V:1,Q:4,S:4,T:2};function S(e){let t=e.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g)??[],a=[],r=[],n=0,o=0,i=0,s=0,l=0;for(;n<t.length;){let p=t[n++];if(!/[a-zA-Z]/.test(p))throw new Error(`parsePath: expected a command, got "${p}"`);if(p!==p.toUpperCase())throw new Error(`parsePath: relative command "${p}" not supported`);let c=Y[p];if(c===void 0)throw new Error(`parsePath: unsupported command "${p}"`);do{let m=[];for(let _=0;_<c;_++)m.push(Number(t[n++]));p==="H"?(a.push("L"),r.push(m[0],i),o=m[0]):p==="V"?(a.push("L"),r.push(o,m[0]),i=m[0]):(a.push(p),r.push(...m),p==="Z"?(o=s,i=l):(o=m[c-2],i=m[c-1],p==="M"&&(s=o,l=i)))}while(c>0&&n<t.length&&!/[a-zA-Z]/.test(t[n]))}return{commands:a,values:r}}function bt(e,t=3){let a=10**t,r="",n=0;for(let o of e.commands){r+=o;let i=Y[o];for(let s=0;s<i;s++){let l=Math.round(e.values[n++]*a)/a;r+=(s===0?"":" ")+l}}return r}function j(e,t){return e.commands.length===t.commands.length&&e.commands.every((a,r)=>a===t.commands[r])}function X(e,t,a){return{commands:e.commands,values:e.values.map((r,n)=>r+(t.values[n]-r)*a)}}function F(e,t){let a=e.values.slice(),r=0;for(let n of e.commands){if(n==="H"||n==="V")throw new Error("mapPoints: H/V not supported");let o=Y[n];for(let i=0;i<o;i+=2){let[s,l]=t(a[r+i],a[r+i+1]);a[r+i]=s,a[r+i+1]=l}r+=o}return{commands:e.commands,values:a}}var q=["x","y","rotate","scaleX","scaleY","opacity"],yt={x:0,y:0,rotate:0,scaleX:1,scaleY:1,opacity:1};function J(e,t,a){if(t<=e[0].f)return e[0].v;let r=e[e.length-1];if(t>=r.f)return r.v;let n=0;for(;e[n+1].f<=t;)n++;let o=e[n],i=e[n+1],s=(t-o.f)/(i.f-o.f);return a(o.v,i.v,D(o.ease??h.inOut,s))}var xt=(e,t,a)=>e+(t-e)*a;function vt(e){return e.map(t=>({...t,v:typeof t.v=="string"?S(t.v):t.v}))}function wt(e){let t=[],a=(r,n,o)=>{n.length<2&&t.push(`${r}: needs at least 2 keys`);for(let i=1;i<n.length;i++)n[i].f<=n[i-1].f&&t.push(`${r}: keys not in increasing order at #${i}`);n[0].f!==0&&t.push(`${r}: first key must be at frame 0`),n[n.length-1].f!==e.frames&&t.push(`${r}: last key must be at frame ${e.frames}`),o(n[0].v,n[n.length-1].v)||t.push(`${r}: first and last values differ (loop jump)`)};for(let[r,n]of Object.entries(e.parts))for(let o of q){let i=n[o];i&&a(`${r}.${o}`,i,(s,l)=>Math.abs(s-l)<1e-9)}for(let[r,n]of Object.entries(e.morphs)){a(`${r}.d`,n,(o,i)=>j(o,i)&&o.values.every((s,l)=>Math.abs(s-i.values[l])<1e-9));for(let o of n)j(n[0].v,o.v)||t.push(`${r}.d: key at frame ${o.f} has a different point count`)}return t}var $=new Set,Q=0;function Pt(e){$.forEach(t=>t(e)),Q=$.size?requestAnimationFrame(Pt):0}function Vt(e){$.add(e),Q||(Q=requestAnimationFrame(Pt))}function Wt(e){$.delete(e)}var G=class{constructor(t,a){this.timeline=a;this.parts=[];this.morphs=[];this.frame=0;this.lastNow=null;this.playing=!1;this.speed=1;this.tick=t=>{if(this.lastNow!==null){let a=(t-this.lastNow)/1e3;this.frame=(this.frame+a*this.timeline.fps*this.speed)%this.timeline.frames}this.lastNow=t,this.render(this.frame)};let r=n=>t.querySelector(`[data-part="${CSS.escape(n)}"]`);for(let[n,o]of Object.entries(a.parts)){let i=r(n);if(!i)throw new Error(`TimelinePlayer: no element with data-part="${n}"`);this.parts.push({el:i,anim:o})}for(let[n,o]of Object.entries(a.morphs)){let i=r(n);if(!(i instanceof SVGPathElement))throw new Error(`TimelinePlayer: data-part="${n}" is not a <path>`);this.morphs.push({el:i,keys:o})}this.render(0)}get isPlaying(){return this.playing}get currentFrame(){return this.frame}play(){this.playing||(this.playing=!0,this.lastNow=null,Vt(this.tick))}pause(){this.playing=!1,Wt(this.tick)}seek(t){let a=this.timeline.frames;this.frame=(t%a+a)%a,this.lastNow=null,this.render(this.frame)}destroy(){this.pause()}render(t){for(let{el:a,anim:r}of this.parts){let n={...yt};for(let s of q){let l=r[s];l&&(n[s]=J(l,t,xt))}let[o,i]=r.pivot??[0,0];a.setAttribute("transform",`translate(${v(o+n.x)} ${v(i+n.y)}) rotate(${v(n.rotate)}) scale(${v(n.scaleX,5)} ${v(n.scaleY,5)}) translate(${v(-o)} ${v(-i)})`),r.opacity&&a.setAttribute("opacity",String(v(n.opacity,4)))}for(let{el:a,keys:r}of this.morphs)a.setAttribute("d",bt(J(r,t,X),3))}},v=(e,t=3)=>Math.round(e*10**t)/10**t;function At({frames:e,period:t,phase:a=0}){if(e%t!==0)throw new Error(`wave: period ${t} does not divide ${e}`);let r=2*Math.PI/t,n=t/4,o=new Set([0,e]),i=(a%n+n)%n;for(let s=i;s<e;s+=n)o.add(Math.round(s*1e3)/1e3);return[...o].sort((s,l)=>s-l).map(s=>({f:s,s:Math.sin(r*(s-a)),ds:r*Math.cos(r*(s-a))}))}function tt(e,t,a,r,n){let o=t-e;return Math.abs(o)<1e-9?[1/3,0,2/3,1]:[1/3,a*n/o/3,2/3,1-r*n/o/3]}function w(e,t,a=0){let r=At(e);return r.map((n,o)=>{let i=r[o+1],s=a+t*n.s;return i?{f:n.f,v:s,ease:tt(n.s,i.s,n.ds,i.ds,i.f-n.f)}:{f:n.f,v:s}})}function St(e,t,a,r){let n=[];for(let i=t;i<a-1e-9;i+=r)n.push(i);n.push(a);let o=i=>(e(i+.01)-e(i-.01))/.02;return n.map((i,s)=>{let l=n[s+1],p=e(i);return l===void 0?{f:i,v:p}:{f:i,v:p,ease:tt(p,e(l),o(i),o(l),l-i)}})}function Et(e,t){let a=At(e);return a.map((r,n)=>{let o=a[n+1];return o?{f:r.f,v:t(r.s),ease:tt(r.s,o.s,r.ds,o.ds,o.f-r.f)}:{f:r.f,v:t(r.s)}})}var et=["paint0_linear_20_2258","paint1_linear_20_2258"],B={"eye-left-socket":"paint11_linear_20_2258","eye-left":"paint12_radial_20_2258","eye-right-socket":"paint13_linear_20_2258","eye-right":"paint14_radial_20_2258"};function nt(e){let t=U(e,"fill")??"",a=U(e,"stroke")??"";return(t+a).match(/url\(#([^)]+)\)/)?.[1]}function kt(e,t){let a=/<path\b[^>]*>/g,r;for(;r=a.exec(e);)if(r[0].includes(`url(#${t})`)){let n=U(r[0],"d");if(n)return n}throw new Error(`pumpkin: no path painted with ${t}`)}var Z=512,zt={cx:256,cy:256,r:218},T={leaf1:{x:369,y:419},leaf2:{x:408,y:394},pumpkin:{x:32,y:256},plant:{x:9,y:255},miniPumpkin:{x:30,y:5},tail:{x:52,y:4},bat:{head:{x:0,y:16.4738,rotate:-24.3208},leftWing:{x:-24,y:19.75},rightWing:{x:31.5,y:-5.5}},bats:[{x:397.25,y:94.5},{x:446.25,y:162.75,rotate:39}]},Yt=["leaf_2","leaf_1","pumpkin","plant","mini pumpkin","bat-1","bat-2"];var jt=[39,19],Xt=[12,31.4],rt=[{appear:[30,54],vanish:[108,132],from:[14,44],to:[-4,-12],flapPeriod:20,flapPhase:0,flapAngle:16,bob:1.8},{appear:[46,70],vanish:[124,148],from:[8,38],to:[-3,-10],flapPeriod:18,flapPhase:7,flapAngle:14,bob:1.5}],qt=[.3,.05,.55,1];function at(e,t,a,r){let n=t.appear[0],o=t.vanish[1],i=2*Math.PI/t.flapPeriod,s=d=>D(qt,Math.min(1,Math.max(0,(d-n)/(o-n)))),l=d=>t.from[0]+(t.to[0]-t.from[0])*s(d),p=d=>t.from[1]+(t.to[1]-t.from[1])*s(d)+t.bob*Math.cos(i*(d-t.flapPhase)),c=-a*Math.PI/180,m=d=>l(d)*Math.cos(c)-p(d)*Math.sin(c),_=d=>l(d)*Math.sin(c)+p(d)*Math.cos(c),P=o+6,u=r-6,g=d=>{let M=St(d,n,o,5);return M[M.length-1].ease=h.linear,[{f:0,v:d(n),ease:h.linear},...M,{f:P,v:d(o),ease:h.inOut},{f:u,v:d(n),ease:h.linear},{f:r,v:d(n)}]},y=d=>w({frames:r,period:t.flapPeriod,phase:t.flapPhase},d*t.flapAngle);return{[`bat-${e}`]:{x:g(m),y:g(_),opacity:[{f:0,v:0,ease:h.linear},{f:t.appear[0],v:0,ease:h.out},{f:t.appear[1],v:1,ease:h.linear},{f:t.vanish[0],v:1,ease:h.in},{f:t.vanish[1],v:0,ease:h.linear},{f:r,v:0}]},[`bat-${e}-left_wing`]:{pivot:jt,rotate:y(1)},[`bat-${e}-right_wing`]:{pivot:Xt,rotate:y(-1)}}}var Jt=.13;function Qt(e){let t=[0,0],a=0;for(let r of e.commands){let n=r==="C"?6:r==="Z"?0:2,o=n?[e.values[a+n-2],e.values[a+n-1]]:t;if(r==="L"){let i=o[0]-t[0],s=o[1]-t[1],l=Math.hypot(i,s),p=-s/l,c=i/l;return c<0&&(p=-p,c=-c),{a:t,n:[p,c]}}t=o,a+=n}throw new Error("eyes: dark eye has no straight brow edge")}function Mt(e,t,a=Jt){let r=S(e),n=S(t),{a:o,n:i}=Qt(n),s=(l,p)=>{let c=(l-o[0])*i[0]+(p-o[1])*i[1],m=c*a-c;return[l+i[0]*m,p+i[1]*m]};return[F(r,s),F(n,s)]}var te=[70.43,18.4],Ft=28,ee=145,ne=e=>{let t=Math.min(1,Math.max(0,e));return t*t*(3-2*t)};function Gt(e,t){let[a,r]=te,n=t*Math.PI/180;return F(e,(o,i)=>{let s=o-a,l=i-r,p=ne((Math.hypot(s,l)-Ft)/(ee-Ft)),c=n*p,m=Math.cos(c),_=Math.sin(c);return[a+s*m-l*_,r+s*_+l*m]})}var E=["plant-fill","plant-light","plant-outline"];function Tt(e){let t=[...e.matchAll(/<path\b[^>]*\sd="([^"]+)"/g)].map(a=>a[1]);if(t.length!==E.length)throw new Error(`plant: expected 3 paths, found ${t.length}`);return t.map(S)}var N=60,x=180,Dt=x/N*1e3,re=[224,229],ae=[100,118],ie=[54,77],oe=[22,25],se=[13,17],Ot={scaleY:1.026,scaleX:1.016},R=.04,I={closeStart:66,closed:78,openStart:82,open:102};function Ut(e,t){return[{f:0,v:1,ease:[.4,0,.6,1]},{f:e,v:t,ease:[.45,0,.55,1]},{f:x,v:1}]}function Lt(e,t){return[{f:0,v:e,ease:h.linear},{f:I.closeStart,v:e,ease:h.inFast},{f:I.closed,v:t,ease:h.linear},{f:I.openStart,v:t,ease:h.outSoft},{f:I.open,v:e,ease:h.linear},{f:x,v:e}]}var k={frames:x};function $t(e){let t={},a=i=>kt(e.pumpkin,B[i]);for(let i of["left","right"]){let s=a(`eye-${i}-socket`),l=a(`eye-${i}`),[p,c]=Mt(s,l),[m,_]=vt([{f:0,v:s},{f:0,v:l}]).map(P=>P.v);t[`eye-${i}-socket`]=Lt(m,p),t[`eye-${i}`]=Lt(_,c)}let r={...k,period:180,phase:30};Tt(e.plant).forEach((i,s)=>{t[E[s]]=Et(r,l=>Gt(i,3.5*l))});let n=w({...k,period:180,phase:45},R/2,1+R/2),o=w({...k,period:180,phase:45},R*.6/2,1+R*.6/2);return{fps:N,frames:x,parts:{pumpkin:{pivot:re,scaleY:Ut(66,Ot.scaleY),scaleX:Ut(78,Ot.scaleX)},miniPumpkin:{pivot:ae,scaleY:n,scaleX:o},tail:{pivot:ie,rotate:w({...k,period:180,phase:20},6)},leaf_1:{pivot:oe,rotate:w({...k,period:90,phase:0},3.5)},leaf_2:{pivot:se,rotate:w({...k,period:90,phase:15},3)},...at(1,rt[0],T.bats[0].rotate??0,x),...at(2,rt[1],T.bats[1].rotate??0,x)},morphs:t}}function Bt(e,t){let a=$t(L),r=wt(a);if(r.length)throw new Error(`Halloween Pumpkin timeline: ${r.join("; ")}`);let n=new G(e,a);return t&&n.play(),{play:()=>n.play(),pause:()=>n.pause(),get isPlaying(){return n.isPlaying},get frame(){return n.currentFrame},seek:o=>n.seek(o),get speed(){return n.speed},set speed(o){n.speed=o},destroy:()=>n.destroy()}}function Zt(e,{idPrefix:t="hp-",layout:a=T}={}){let r={};for(let f of Object.keys(e)){let C=st(e[f]),b=`${t}${f}-`;r[f]={...C,defs:H(C.defs,b),body:H(C.body,b)}}let n=Object.values(r).map(f=>f.defs).filter(Boolean),o=f=>`${t}${f}-shape`;for(let f of["batHead","leftWing","rightWing"])n.push(`<g id="${o(f)}" fill="none">${r[f].body}</g>`);let i=(f,C,b,A)=>`<g data-layer="${f}" transform="${z(b)}" fill="none"><g data-part="${C}">${A}</g></g>`,s=a.miniPumpkin,l={...a.tail,x:a.tail.x-s.x,y:a.tail.y-s.y};if(s.rotate||(s.scale??1)!==1)throw new Error("miniPumpkin placement must be translate-only (tail is nested inside it)");let p=i("tail","tail",l,r.tail.body),c=(f,C)=>{let b=a.bat,A=(it,Nt,Kt)=>i(it,`bat-${f}-${it}`,Kt,`<use href="#${o(Nt)}"/>`);return i(`bat-${f}`,`bat-${f}`,C,A("left_wing","leftWing",b.leftWing)+A("right_wing","rightWing",b.rightWing)+A("bat_head","batHead",b.head))},m=lt(r.pumpkin.body),_=f=>et.some(C=>nt(f)?.endsWith(C)),P=f=>{let C=nt(f),b=Object.entries(B).find(([,A])=>C?.endsWith(A));return b?W(f,"data-part",b[0]):f},u=m.children.filter(_),g=m.children.filter(f=>!_(f)).map(P);if(u.length!==et.length)throw new Error("pumpkin: back stem paths not found");let y=`<g data-part="pumpkin-stem">${m.open}${u.join("")}</g></g><g data-part="pumpkin">${m.open}${g.join("")}</g></g>`,d=V(r.plant.body);if(d.length!==E.length)throw new Error("plant: unexpected structure");let M=d.map((f,C)=>W(f,"data-part",E[C])).join(""),It=[i("leaf_2","leaf_2",a.leaf2,r.leaf2.body),i("leaf_1","leaf_1",a.leaf1,r.leaf1.body),`<g data-layer="pumpkin" transform="${z(a.pumpkin)}" fill="none">${y}</g>`,i("plant","plant",a.plant,M),i("mini pumpkin","miniPumpkin",a.miniPumpkin,r.miniPumpkin.body+p),c(1,a.bats[0]),c(2,a.bats[1])].join(`
`);return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${512} ${512}" fill="none" overflow="visible" data-decoration="halloween-pumpkin"><defs>${n.join(`
`)}</defs>
${It}</svg>`}var K=class{constructor(t,a={}){let{size:r="100%",visible:n=!0,autoplay:o=!0,className:i}=a,s=document.createElement("template");s.innerHTML=Rt(pt("hp")),this.element=s.content.firstElementChild,this.element.setAttribute("role","presentation"),this.element.setAttribute("aria-hidden","true"),this.element.style.display="block",this.element.style.pointerEvents="none",this.element.style.background="transparent",i&&this.element.setAttribute("class",i),this.setSize(r),this.setVisible(n),t.appendChild(this.element),this.animation=Bt(this.element,o)}setSize(t){let a=typeof t=="number"?`${t}px`:t;this.element.style.width=a,this.element.style.height=a}show(){this.setVisible(!0)}hide(){this.setVisible(!1)}setVisible(t){this.element.style.visibility=t?"visible":"hidden"}get visible(){return this.element.style.visibility!=="hidden"}play(){this.animation.play()}pause(){this.animation.pause()}get isPlaying(){return this.animation.isPlaying}get frame(){return this.animation.frame}seek(t){this.animation.seek(t)}setSpeed(t){this.animation.speed=t}destroy(){this.animation.destroy(),this.element.remove()}};function le(e,t){return new K(e,t)}function Rt(e="hp-"){return Zt(L,{idPrefix:e})}var i1={id:"halloween-pumpkin",name:"Halloween Pumpkin",version:"1.0.0",status:{web:"approved",tgs:"not-exported"},approvedOn:"2026-10-28"};export{zt as AVATAR_AREA,Z as CANVAS_SIZE,N as FPS,x as FRAME_COUNT,i1 as HALLOWEEN_PUMPKIN_META,K as HalloweenPumpkinDecoration,Yt as LAYER_ORDER,Dt as LOOP_DURATION_MS,Ht as SOURCE_FILE_NAMES,le as mountHalloweenPumpkin,Rt as renderHalloweenPumpkinSvg};
