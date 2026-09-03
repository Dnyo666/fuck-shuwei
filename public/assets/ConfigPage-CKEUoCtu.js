import{f as eo,g as $,h as n,i as oo,j as to,k as m,l as L,m as be,n as ao,p as no,q as v,B as ro,V as lo,r as io,s as so,t as ne,T as co,v as uo,x as ke,y as C,z as ho,A as w,C as fo,D as vo,E as ge,F as ae,G as mo,H as pe,I as bo,J as K,K as X,L as Y,M as go,c as po,o as Ce,a as M,b as R,w as N,u as x,N as xo,d as wo,O as yo,e as ko}from"./index-D91z7nmc.js";import{N as Co,a as Ro,b as xe}from"./Grid-pcz-TyFS.js";import{N as So}from"./Switch-Dl7uitC1.js";import{N as zo}from"./Card-N2wGHLEM.js";import"./is-browser-DqcmxZSF.js";import"./get-slot-Bk_rJcZu.js";const To={railHeight:"4px",railWidthVertical:"4px",handleSize:"18px",dotHeight:"8px",dotWidth:"8px",dotBorderRadius:"4px"};function Vo(a){const l="rgba(0, 0, 0, .85)",b="0 2px 8px 0 rgba(0, 0, 0, 0.12)",{railColor:u,primaryColor:i,baseColor:d,cardColor:V,modalColor:S,popoverColor:W,borderRadius:G,fontSize:F,opacityDisabled:_}=a;return Object.assign(Object.assign({},To),{fontSize:F,markFontSize:F,railColor:u,railColorHover:u,fillColor:i,fillColorHover:i,opacityDisabled:_,handleColor:"#FFF",dotColor:V,dotColorModal:S,dotColorPopover:W,handleBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowHover:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowActive:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowFocus:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",indicatorColor:l,indicatorBoxShadow:b,indicatorTextColor:d,indicatorBorderRadius:G,dotBorder:`2px solid ${u}`,dotBorderActive:`2px solid ${i}`,dotBoxShadow:""})}const Bo={common:eo,self:Vo},Do=$([n("slider",`
 display: block;
 padding: calc((var(--n-handle-size) - var(--n-rail-height)) / 2) 0;
 position: relative;
 z-index: 0;
 width: 100%;
 cursor: pointer;
 user-select: none;
 -webkit-user-select: none;
 `,[m("reverse",[n("slider-handles",[n("slider-handle-wrapper",`
 transform: translate(50%, -50%);
 `)]),n("slider-dots",[n("slider-dot",`
 transform: translateX(50%, -50%);
 `)]),m("vertical",[n("slider-handles",[n("slider-handle-wrapper",`
 transform: translate(-50%, -50%);
 `)]),n("slider-marks",[n("slider-mark",`
 transform: translateY(calc(-50% + var(--n-dot-height) / 2));
 `)]),n("slider-dots",[n("slider-dot",`
 transform: translateX(-50%) translateY(0);
 `)])])]),m("vertical",`
 box-sizing: content-box;
 padding: 0 calc((var(--n-handle-size) - var(--n-rail-height)) / 2);
 width: var(--n-rail-width-vertical);
 height: 100%;
 `,[n("slider-handles",`
 top: calc(var(--n-handle-size) / 2);
 right: 0;
 bottom: calc(var(--n-handle-size) / 2);
 left: 0;
 `,[n("slider-handle-wrapper",`
 top: unset;
 left: 50%;
 transform: translate(-50%, 50%);
 `)]),n("slider-rail",`
 height: 100%;
 `,[L("fill",`
 top: unset;
 right: 0;
 bottom: unset;
 left: 0;
 `)]),m("with-mark",`
 width: var(--n-rail-width-vertical);
 margin: 0 32px 0 8px;
 `),n("slider-marks",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 22px;
 font-size: var(--n-mark-font-size);
 `,[n("slider-mark",`
 transform: translateY(50%);
 white-space: nowrap;
 `)]),n("slider-dots",`
 top: calc(var(--n-handle-size) / 2);
 right: unset;
 bottom: calc(var(--n-handle-size) / 2);
 left: 50%;
 `,[n("slider-dot",`
 transform: translateX(-50%) translateY(50%);
 `)])]),m("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `,[n("slider-handle",`
 cursor: not-allowed;
 `)]),m("with-mark",`
 width: 100%;
 margin: 8px 0 32px 0;
 `),$("&:hover",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[L("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),m("active",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[L("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),n("slider-marks",`
 position: absolute;
 top: 18px;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[n("slider-mark",`
 position: absolute;
 transform: translateX(-50%);
 white-space: nowrap;
 `)]),n("slider-rail",`
 width: 100%;
 position: relative;
 height: var(--n-rail-height);
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 border-radius: calc(var(--n-rail-height) / 2);
 `,[L("fill",`
 position: absolute;
 top: 0;
 bottom: 0;
 border-radius: calc(var(--n-rail-height) / 2);
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-fill-color);
 `)]),n("slider-handles",`
 position: absolute;
 top: 0;
 right: calc(var(--n-handle-size) / 2);
 bottom: 0;
 left: calc(var(--n-handle-size) / 2);
 `,[n("slider-handle-wrapper",`
 outline: none;
 position: absolute;
 top: 50%;
 transform: translate(-50%, -50%);
 cursor: pointer;
 display: flex;
 `,[n("slider-handle",`
 height: var(--n-handle-size);
 width: var(--n-handle-size);
 border-radius: 50%;
 overflow: hidden;
 transition: box-shadow .2s var(--n-bezier), background-color .3s var(--n-bezier);
 background-color: var(--n-handle-color);
 box-shadow: var(--n-handle-box-shadow);
 `,[$("&:hover",`
 box-shadow: var(--n-handle-box-shadow-hover);
 `)]),$("&:focus",[n("slider-handle",`
 box-shadow: var(--n-handle-box-shadow-focus);
 `,[$("&:hover",`
 box-shadow: var(--n-handle-box-shadow-active);
 `)])])])]),n("slider-dots",`
 position: absolute;
 top: 50%;
 left: calc(var(--n-handle-size) / 2);
 right: calc(var(--n-handle-size) / 2);
 `,[m("transition-disabled",[n("slider-dot","transition: none;")]),n("slider-dot",`
 transition:
 border-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 transform: translate(-50%, -50%);
 height: var(--n-dot-height);
 width: var(--n-dot-width);
 border-radius: var(--n-dot-border-radius);
 overflow: hidden;
 box-sizing: border-box;
 border: var(--n-dot-border);
 background-color: var(--n-dot-color);
 `,[m("active","border: var(--n-dot-border-active);")])])]),n("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[be()]),n("slider-handle-indicator",`
 font-size: var(--n-font-size);
 padding: 6px 10px;
 border-radius: var(--n-indicator-border-radius);
 color: var(--n-indicator-text-color);
 background-color: var(--n-indicator-color);
 box-shadow: var(--n-indicator-box-shadow);
 `,[m("top",`
 margin-bottom: 12px;
 `),m("right",`
 margin-left: 12px;
 `),m("bottom",`
 margin-top: 12px;
 `),m("left",`
 margin-right: 12px;
 `),be()]),oo(n("slider",[n("slider-dot","background-color: var(--n-dot-color-modal);")])),to(n("slider",[n("slider-dot","background-color: var(--n-dot-color-popover);")]))]);function we(a){return window.TouchEvent&&a instanceof window.TouchEvent}function ye(){const a=new Map,l=b=>u=>{a.set(b,u)};return ao(()=>{a.clear()}),[a,l]}const Mo=0,No=Object.assign(Object.assign({},ke.props),{to:ne.propTo,defaultValue:{type:[Number,Array],default:0},marks:Object,disabled:{type:Boolean,default:void 0},formatTooltip:Function,keyboard:{type:Boolean,default:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:[Number,String],default:1},range:Boolean,value:[Number,Array],placement:String,showTooltip:{type:Boolean,default:void 0},tooltip:{type:Boolean,default:!0},vertical:Boolean,reverse:Boolean,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onDragstart:[Function],onDragend:[Function]}),$o=no({name:"Slider",props:No,slots:Object,setup(a){const{mergedClsPrefixRef:l,namespaceRef:b,inlineThemeDisabled:u}=uo(a),i=ke("Slider","-slider",Do,Bo,a,l),d=C(null),[V,S]=ye(),[W,G]=ye(),F=C(new Set),_=ho(a),{mergedDisabledRef:H}=_,re=w(()=>{const{step:e}=a;if(Number(e)<=0||e==="mark")return 0;const o=e.toString();let t=0;return o.includes(".")&&(t=o.length-o.indexOf(".")-1),t}),q=C(a.defaultValue),Re=fo(a,"value"),J=vo(Re,q),g=w(()=>{const{value:e}=J;return(a.range?e:[e]).map(he)}),le=w(()=>g.value.length>2),Se=w(()=>a.placement===void 0?a.vertical?"right":"top":a.placement),ie=w(()=>{const{marks:e}=a;return e?Object.keys(e).map(Number.parseFloat):null}),p=C(-1),se=C(-1),z=C(-1),T=C(!1),I=C(!1),Q=w(()=>{const{vertical:e,reverse:o}=a;return e?o?"top":"bottom":o?"right":"left"}),ze=w(()=>{if(le.value)return;const e=g.value,o=A(a.range?Math.min(...e):a.min),t=A(a.range?Math.max(...e):e[0]),{value:r}=Q;return a.vertical?{[r]:`${o}%`,height:`${t-o}%`}:{[r]:`${o}%`,width:`${t-o}%`}}),Te=w(()=>{const e=[],{marks:o}=a;if(o){const t=g.value.slice();t.sort((f,h)=>f-h);const{value:r}=Q,{value:s}=le,{range:c}=a,y=s?()=>!1:f=>c?f>=t[0]&&f<=t[t.length-1]:f<=t[0];for(const f of Object.keys(o)){const h=Number(f);e.push({active:y(h),key:h,label:o[f],style:{[r]:`${A(h)}%`}})}}return e});function Ve(e,o){const t=A(e),{value:r}=Q;return{[r]:`${t}%`,zIndex:o===p.value?1:0}}function de(e){return a.showTooltip||z.value===e||p.value===e&&T.value}function Be(e){return T.value?!(p.value===e&&se.value===e):!0}function De(e){var o;~e&&(p.value=e,(o=V.get(e))===null||o===void 0||o.focus())}function Me(){W.forEach((e,o)=>{de(o)&&e.syncPosition()})}function ce(e){const{"onUpdate:value":o,onUpdateValue:t}=a,{nTriggerFormInput:r,nTriggerFormChange:s}=_;t&&K(t,e),o&&K(o,e),q.value=e,r(),s()}function ue(e){const{range:o}=a;if(o){if(Array.isArray(e)){const{value:t}=g;e.join()!==t.join()&&ce(e)}}else Array.isArray(e)||g.value[0]!==e&&ce(e)}function Z(e,o){if(a.range){const t=g.value.slice();t.splice(o,1,e),ue(t)}else ue(e)}function ee(e,o,t){const r=t!==void 0;t||(t=e-o>0?1:-1);const s=ie.value||[],{step:c}=a;if(c==="mark"){const h=E(e,s.concat(o),r?t:void 0);return h?h.value:o}if(c<=0)return o;const{value:y}=re;let f;if(r){const h=Number((o/c).toFixed(y)),k=Math.floor(h),oe=h>k?k:k-1,te=h<k?k:k+1;f=E(o,[Number((oe*c).toFixed(y)),Number((te*c).toFixed(y)),...s],t)}else{const h=$e(e);f=E(e,[...s,h])}return f?he(f.value):o}function he(e){return Math.min(a.max,Math.max(a.min,e))}function A(e){const{max:o,min:t}=a;return(e-t)/(o-t)*100}function Ne(e){const{max:o,min:t}=a;return t+(o-t)*e}function $e(e){const{step:o,min:t}=a;if(Number(o)<=0||o==="mark")return e;const r=Math.round((e-t)/o)*o+t;return Number(r.toFixed(re.value))}function E(e,o=ie.value,t){if(!(o!=null&&o.length))return null;let r=null,s=-1;for(;++s<o.length;){const c=o[s]-e,y=Math.abs(c);(t===void 0||c*t>0)&&(r===null||y<r.distance)&&(r={index:s,distance:y,value:o[s]})}return r}function fe(e){const o=d.value;if(!o)return;const t=we(e)?e.touches[0]:e,r=o.getBoundingClientRect();let s;return a.vertical?s=(r.bottom-t.clientY)/r.height:s=(t.clientX-r.left)/r.width,a.reverse&&(s=1-s),Ne(s)}function Fe(e){if(H.value||!a.keyboard)return;const{vertical:o,reverse:t}=a;switch(e.key){case"ArrowUp":e.preventDefault(),P(o&&t?-1:1);break;case"ArrowRight":e.preventDefault(),P(!o&&t?-1:1);break;case"ArrowDown":e.preventDefault(),P(o&&t?1:-1);break;case"ArrowLeft":e.preventDefault(),P(!o&&t?1:-1);break}}function P(e){const o=p.value;if(o===-1)return;const{step:t}=a,r=g.value[o],s=Number(t)<=0||t==="mark"?r:r+t*e;Z(ee(s,r,e>0?1:-1),o)}function _e(e){var o,t;if(H.value||!we(e)&&e.button!==Mo)return;const r=fe(e);if(r===void 0)return;const s=g.value.slice(),c=a.range?(t=(o=E(r,s))===null||o===void 0?void 0:o.index)!==null&&t!==void 0?t:-1:0;c!==-1&&(e.preventDefault(),De(c),He(),Z(ee(r,g.value[c]),c))}function He(){T.value||(T.value=!0,a.onDragstart&&K(a.onDragstart),X("touchend",document,O),X("mouseup",document,O),X("touchmove",document,U),X("mousemove",document,U))}function j(){T.value&&(T.value=!1,a.onDragend&&K(a.onDragend),Y("touchend",document,O),Y("mouseup",document,O),Y("touchmove",document,U),Y("mousemove",document,U))}function U(e){const{value:o}=p;if(!T.value||o===-1){j();return}const t=fe(e);t!==void 0&&Z(ee(t,g.value[o]),o)}function O(){j()}function Ie(e){p.value=e,H.value||(z.value=e)}function Ae(e){p.value===e&&(p.value=-1,j()),z.value===e&&(z.value=-1)}function Ee(e){z.value=e}function Pe(e){z.value===e&&(z.value=-1)}ge(p,(e,o)=>void ae(()=>se.value=o)),ge(J,()=>{if(a.marks){if(I.value)return;I.value=!0,ae(()=>{I.value=!1})}ae(Me)}),mo(()=>{j()});const ve=w(()=>{const{self:{markFontSize:e,railColor:o,railColorHover:t,fillColor:r,fillColorHover:s,handleColor:c,opacityDisabled:y,dotColor:f,dotColorModal:h,handleBoxShadow:k,handleBoxShadowHover:oe,handleBoxShadowActive:te,handleBoxShadowFocus:je,dotBorder:Ue,dotBoxShadow:Oe,railHeight:Le,railWidthVertical:Ke,handleSize:Xe,dotHeight:Ye,dotWidth:We,dotBorderRadius:Ge,fontSize:qe,dotBorderActive:Je,dotColorPopover:Qe},common:{cubicBezierEaseInOut:Ze}}=i.value;return{"--n-bezier":Ze,"--n-dot-border":Ue,"--n-dot-border-active":Je,"--n-dot-border-radius":Ge,"--n-dot-box-shadow":Oe,"--n-dot-color":f,"--n-dot-color-modal":h,"--n-dot-color-popover":Qe,"--n-dot-height":Ye,"--n-dot-width":We,"--n-fill-color":r,"--n-fill-color-hover":s,"--n-font-size":qe,"--n-handle-box-shadow":k,"--n-handle-box-shadow-active":te,"--n-handle-box-shadow-focus":je,"--n-handle-box-shadow-hover":oe,"--n-handle-color":c,"--n-handle-size":Xe,"--n-opacity-disabled":y,"--n-rail-color":o,"--n-rail-color-hover":t,"--n-rail-height":Le,"--n-rail-width-vertical":Ke,"--n-mark-font-size":e}}),B=u?pe("slider",void 0,ve,a):void 0,me=w(()=>{const{self:{fontSize:e,indicatorColor:o,indicatorBoxShadow:t,indicatorTextColor:r,indicatorBorderRadius:s}}=i.value;return{"--n-font-size":e,"--n-indicator-border-radius":s,"--n-indicator-box-shadow":t,"--n-indicator-color":o,"--n-indicator-text-color":r}}),D=u?pe("slider-indicator",void 0,me,a):void 0;return{mergedClsPrefix:l,namespace:b,uncontrolledValue:q,mergedValue:J,mergedDisabled:H,mergedPlacement:Se,isMounted:bo(),adjustedTo:ne(a),dotTransitionDisabled:I,markInfos:Te,isShowTooltip:de,shouldKeepTooltipTransition:Be,handleRailRef:d,setHandleRefs:S,setFollowerRefs:G,fillStyle:ze,getHandleStyle:Ve,activeIndex:p,arrifiedValues:g,followerEnabledIndexSet:F,handleRailMouseDown:_e,handleHandleFocus:Ie,handleHandleBlur:Ae,handleHandleMouseEnter:Ee,handleHandleMouseLeave:Pe,handleRailKeyDown:Fe,indicatorCssVars:u?void 0:me,indicatorThemeClass:D==null?void 0:D.themeClass,indicatorOnRender:D==null?void 0:D.onRender,cssVars:u?void 0:ve,themeClass:B==null?void 0:B.themeClass,onRender:B==null?void 0:B.onRender}},render(){var a;const{mergedClsPrefix:l,themeClass:b,formatTooltip:u}=this;return(a=this.onRender)===null||a===void 0||a.call(this),v("div",{class:[`${l}-slider`,b,{[`${l}-slider--disabled`]:this.mergedDisabled,[`${l}-slider--active`]:this.activeIndex!==-1,[`${l}-slider--with-mark`]:this.marks,[`${l}-slider--vertical`]:this.vertical,[`${l}-slider--reverse`]:this.reverse}],style:this.cssVars,onKeydown:this.handleRailKeyDown,onMousedown:this.handleRailMouseDown,onTouchstart:this.handleRailMouseDown},v("div",{class:`${l}-slider-rail`},v("div",{class:`${l}-slider-rail__fill`,style:this.fillStyle}),this.marks?v("div",{class:[`${l}-slider-dots`,this.dotTransitionDisabled&&`${l}-slider-dots--transition-disabled`]},this.markInfos.map(i=>v("div",{key:i.key,class:[`${l}-slider-dot`,{[`${l}-slider-dot--active`]:i.active}],style:i.style}))):null,v("div",{ref:"handleRailRef",class:`${l}-slider-handles`},this.arrifiedValues.map((i,d)=>{const V=this.isShowTooltip(d);return v(ro,null,{default:()=>[v(lo,null,{default:()=>v("div",{ref:this.setHandleRefs(d),class:`${l}-slider-handle-wrapper`,tabindex:this.mergedDisabled?-1:0,role:"slider","aria-valuenow":i,"aria-valuemin":this.min,"aria-valuemax":this.max,"aria-orientation":this.vertical?"vertical":"horizontal","aria-disabled":this.disabled,style:this.getHandleStyle(i,d),onFocus:()=>{this.handleHandleFocus(d)},onBlur:()=>{this.handleHandleBlur(d)},onMouseenter:()=>{this.handleHandleMouseEnter(d)},onMouseleave:()=>{this.handleHandleMouseLeave(d)}},io(this.$slots.thumb,()=>[v("div",{class:`${l}-slider-handle`})]))}),this.tooltip&&v(so,{ref:this.setFollowerRefs(d),show:V,to:this.adjustedTo,enabled:this.showTooltip&&!this.range||this.followerEnabledIndexSet.has(d),teleportDisabled:this.adjustedTo===ne.tdkey,placement:this.mergedPlacement,containerClass:this.namespace},{default:()=>v(co,{name:"fade-in-scale-up-transition",appear:this.isMounted,css:this.shouldKeepTooltipTransition(d),onEnter:()=>{this.followerEnabledIndexSet.add(d)},onAfterLeave:()=>{this.followerEnabledIndexSet.delete(d)}},{default:()=>{var S;return V?((S=this.indicatorOnRender)===null||S===void 0||S.call(this),v("div",{class:[`${l}-slider-handle-indicator`,this.indicatorThemeClass,`${l}-slider-handle-indicator--${this.mergedPlacement}`],style:this.indicatorCssVars},typeof u=="function"?u(i):i)):null}})})]})})),this.marks?v("div",{class:`${l}-slider-marks`},this.markInfos.map(i=>v("div",{key:i.key,class:`${l}-slider-mark`,style:i.style},typeof i.label=="function"?i.label():i.label))):null))}}),Fo={class:"space-y-5"},_o={class:"w-full flex flex-wrap items-center gap-4"},Ho={class:"w-full flex flex-wrap items-center justify-between gap-3"},Io={__name:"ConfigView",setup(a){const l=go(),b=w({get:()=>Number(l.settings.delay||0),set:u=>{l.settings.delay=Number(u)}});return(u,i)=>(Ce(),po("div",Fo,[i[3]||(i[3]=M("div",null,[M("div",{class:"text-xl font-semibold tracking-wide"},"设置"),M("div",{class:"mt-1 text-sm text-slate-600"},"这些选项对所有学生会话生效。教务地址在会话里单独管理。")],-1)),R(x(zo),null,{default:N(()=>[R(x(Co),{model:x(l).settings,"label-placement":"top",size:"large"},{default:N(()=>[R(x(Ro),{cols:12,"x-gap":16,"y-gap":14},{default:N(()=>[R(x(xe),{span:12,label:"请求延迟（ms）"},{default:N(()=>[M("div",_o,[R(x($o),{value:b.value,"onUpdate:value":i[0]||(i[0]=d=>b.value=d),min:0,max:2e3,step:100,class:"flex-1"},null,8,["value"]),R(x(xo),{bordered:!1,type:"info"},{default:N(()=>[wo(yo(b.value)+"ms",1)]),_:1})])]),_:1}),R(x(xe),{span:12,label:"TLS 证书"},{default:N(()=>[M("div",Ho,[i[2]||(i[2]=M("div",{class:"text-sm text-slate-700"},"校园自签证书无法校验时再打开",-1)),R(x(So),{value:x(l).settings.insecureTls,"onUpdate:value":i[1]||(i[1]=d=>x(l).settings.insecureTls=d)},null,8,["value"])])]),_:1})]),_:1})]),_:1},8,["model"])]),_:1})]))}},Lo={__name:"ConfigPage",setup(a){return(l,b)=>(Ce(),ko(Io))}};export{Lo as default};
