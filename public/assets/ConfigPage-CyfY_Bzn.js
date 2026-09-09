import{g as et,h as F,i as n,j as tt,k as ot,l as m,m as L,n as be,p as at,q as nt,r as v,B as rt,V as lt,s as it,t as st,v as ne,T as dt,x as ct,y as ke,z as C,A as ut,C as w,D as ht,E as ft,F as ge,G as ae,H as vt,I as pe,J as mt,K,L as X,M as Y,O as bt,c as gt,o as Ce,a as R,b as S,w as $,u as x,N as pt,d as xt,P as wt,e as yt,f as kt}from"./index-BOH-m4M-.js";import{N as Ct,a as Rt,b as xe}from"./Grid-ByqGcdu5.js";import{N as St}from"./Switch-BtBMRilH.js";import"./get-slot-Bk_rJcZu.js";const zt={railHeight:"4px",railWidthVertical:"4px",handleSize:"18px",dotHeight:"8px",dotWidth:"8px",dotBorderRadius:"4px"};function Tt(a){const l="rgba(0, 0, 0, .85)",b="0 2px 8px 0 rgba(0, 0, 0, 0.12)",{railColor:u,primaryColor:i,baseColor:d,cardColor:B,modalColor:z,popoverColor:W,borderRadius:G,fontSize:N,opacityDisabled:_}=a;return Object.assign(Object.assign({},zt),{fontSize:N,markFontSize:N,railColor:u,railColorHover:u,fillColor:i,fillColorHover:i,opacityDisabled:_,handleColor:"#FFF",dotColor:B,dotColorModal:z,dotColorPopover:W,handleBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowHover:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowActive:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",handleBoxShadowFocus:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",indicatorColor:l,indicatorBoxShadow:b,indicatorTextColor:d,indicatorBorderRadius:G,dotBorder:`2px solid ${u}`,dotBorderActive:`2px solid ${i}`,dotBoxShadow:""})}const Vt={common:et,self:Tt},Bt=F([n("slider",`
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
 `),F("&:hover",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[L("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),m("active",[n("slider-rail",{backgroundColor:"var(--n-rail-color-hover)"},[L("fill",{backgroundColor:"var(--n-fill-color-hover)"})]),n("slider-handle",{boxShadow:"var(--n-handle-box-shadow-hover)"})]),n("slider-marks",`
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
 `,[F("&:hover",`
 box-shadow: var(--n-handle-box-shadow-hover);
 `)]),F("&:focus",[n("slider-handle",`
 box-shadow: var(--n-handle-box-shadow-focus);
 `,[F("&:hover",`
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
 `),be()]),tt(n("slider",[n("slider-dot","background-color: var(--n-dot-color-modal);")])),ot(n("slider",[n("slider-dot","background-color: var(--n-dot-color-popover);")]))]);function we(a){return window.TouchEvent&&a instanceof window.TouchEvent}function ye(){const a=new Map,l=b=>u=>{a.set(b,u)};return at(()=>{a.clear()}),[a,l]}const Dt=0,Mt=Object.assign(Object.assign({},ke.props),{to:ne.propTo,defaultValue:{type:[Number,Array],default:0},marks:Object,disabled:{type:Boolean,default:void 0},formatTooltip:Function,keyboard:{type:Boolean,default:!0},min:{type:Number,default:0},max:{type:Number,default:100},step:{type:[Number,String],default:1},range:Boolean,value:[Number,Array],placement:String,showTooltip:{type:Boolean,default:void 0},tooltip:{type:Boolean,default:!0},vertical:Boolean,reverse:Boolean,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onDragstart:[Function],onDragend:[Function]}),$t=nt({name:"Slider",props:Mt,slots:Object,setup(a){const{mergedClsPrefixRef:l,namespaceRef:b,inlineThemeDisabled:u}=ct(a),i=ke("Slider","-slider",Bt,Vt,a,l),d=C(null),[B,z]=ye(),[W,G]=ye(),N=C(new Set),_=ut(a),{mergedDisabledRef:H}=_,re=w(()=>{const{step:e}=a;if(Number(e)<=0||e==="mark")return 0;const t=e.toString();let o=0;return t.includes(".")&&(o=t.length-t.indexOf(".")-1),o}),q=C(a.defaultValue),Re=ht(a,"value"),J=ft(Re,q),g=w(()=>{const{value:e}=J;return(a.range?e:[e]).map(he)}),le=w(()=>g.value.length>2),Se=w(()=>a.placement===void 0?a.vertical?"right":"top":a.placement),ie=w(()=>{const{marks:e}=a;return e?Object.keys(e).map(Number.parseFloat):null}),p=C(-1),se=C(-1),T=C(-1),V=C(!1),I=C(!1),Q=w(()=>{const{vertical:e,reverse:t}=a;return e?t?"top":"bottom":t?"right":"left"}),ze=w(()=>{if(le.value)return;const e=g.value,t=A(a.range?Math.min(...e):a.min),o=A(a.range?Math.max(...e):e[0]),{value:r}=Q;return a.vertical?{[r]:`${t}%`,height:`${o-t}%`}:{[r]:`${t}%`,width:`${o-t}%`}}),Te=w(()=>{const e=[],{marks:t}=a;if(t){const o=g.value.slice();o.sort((f,h)=>f-h);const{value:r}=Q,{value:s}=le,{range:c}=a,y=s?()=>!1:f=>c?f>=o[0]&&f<=o[o.length-1]:f<=o[0];for(const f of Object.keys(t)){const h=Number(f);e.push({active:y(h),key:h,label:t[f],style:{[r]:`${A(h)}%`}})}}return e});function Ve(e,t){const o=A(e),{value:r}=Q;return{[r]:`${o}%`,zIndex:t===p.value?1:0}}function de(e){return a.showTooltip||T.value===e||p.value===e&&V.value}function Be(e){return V.value?!(p.value===e&&se.value===e):!0}function De(e){var t;~e&&(p.value=e,(t=B.get(e))===null||t===void 0||t.focus())}function Me(){W.forEach((e,t)=>{de(t)&&e.syncPosition()})}function ce(e){const{"onUpdate:value":t,onUpdateValue:o}=a,{nTriggerFormInput:r,nTriggerFormChange:s}=_;o&&K(o,e),t&&K(t,e),q.value=e,r(),s()}function ue(e){const{range:t}=a;if(t){if(Array.isArray(e)){const{value:o}=g;e.join()!==o.join()&&ce(e)}}else Array.isArray(e)||g.value[0]!==e&&ce(e)}function Z(e,t){if(a.range){const o=g.value.slice();o.splice(t,1,e),ue(o)}else ue(e)}function ee(e,t,o){const r=o!==void 0;o||(o=e-t>0?1:-1);const s=ie.value||[],{step:c}=a;if(c==="mark"){const h=E(e,s.concat(t),r?o:void 0);return h?h.value:t}if(c<=0)return t;const{value:y}=re;let f;if(r){const h=Number((t/c).toFixed(y)),k=Math.floor(h),te=h>k?k:k-1,oe=h<k?k:k+1;f=E(t,[Number((te*c).toFixed(y)),Number((oe*c).toFixed(y)),...s],o)}else{const h=Fe(e);f=E(e,[...s,h])}return f?he(f.value):t}function he(e){return Math.min(a.max,Math.max(a.min,e))}function A(e){const{max:t,min:o}=a;return(e-o)/(t-o)*100}function $e(e){const{max:t,min:o}=a;return o+(t-o)*e}function Fe(e){const{step:t,min:o}=a;if(Number(t)<=0||t==="mark")return e;const r=Math.round((e-o)/t)*t+o;return Number(r.toFixed(re.value))}function E(e,t=ie.value,o){if(!(t!=null&&t.length))return null;let r=null,s=-1;for(;++s<t.length;){const c=t[s]-e,y=Math.abs(c);(o===void 0||c*o>0)&&(r===null||y<r.distance)&&(r={index:s,distance:y,value:t[s]})}return r}function fe(e){const t=d.value;if(!t)return;const o=we(e)?e.touches[0]:e,r=t.getBoundingClientRect();let s;return a.vertical?s=(r.bottom-o.clientY)/r.height:s=(o.clientX-r.left)/r.width,a.reverse&&(s=1-s),$e(s)}function Ne(e){if(H.value||!a.keyboard)return;const{vertical:t,reverse:o}=a;switch(e.key){case"ArrowUp":e.preventDefault(),P(t&&o?-1:1);break;case"ArrowRight":e.preventDefault(),P(!t&&o?-1:1);break;case"ArrowDown":e.preventDefault(),P(t&&o?1:-1);break;case"ArrowLeft":e.preventDefault(),P(!t&&o?1:-1);break}}function P(e){const t=p.value;if(t===-1)return;const{step:o}=a,r=g.value[t],s=Number(o)<=0||o==="mark"?r:r+o*e;Z(ee(s,r,e>0?1:-1),t)}function _e(e){var t,o;if(H.value||!we(e)&&e.button!==Dt)return;const r=fe(e);if(r===void 0)return;const s=g.value.slice(),c=a.range?(o=(t=E(r,s))===null||t===void 0?void 0:t.index)!==null&&o!==void 0?o:-1:0;c!==-1&&(e.preventDefault(),De(c),He(),Z(ee(r,g.value[c]),c))}function He(){V.value||(V.value=!0,a.onDragstart&&K(a.onDragstart),X("touchend",document,O),X("mouseup",document,O),X("touchmove",document,U),X("mousemove",document,U))}function j(){V.value&&(V.value=!1,a.onDragend&&K(a.onDragend),Y("touchend",document,O),Y("mouseup",document,O),Y("touchmove",document,U),Y("mousemove",document,U))}function U(e){const{value:t}=p;if(!V.value||t===-1){j();return}const o=fe(e);o!==void 0&&Z(ee(o,g.value[t]),t)}function O(){j()}function Ie(e){p.value=e,H.value||(T.value=e)}function Ae(e){p.value===e&&(p.value=-1,j()),T.value===e&&(T.value=-1)}function Ee(e){T.value=e}function Pe(e){T.value===e&&(T.value=-1)}ge(p,(e,t)=>void ae(()=>se.value=t)),ge(J,()=>{if(a.marks){if(I.value)return;I.value=!0,ae(()=>{I.value=!1})}ae(Me)}),vt(()=>{j()});const ve=w(()=>{const{self:{markFontSize:e,railColor:t,railColorHover:o,fillColor:r,fillColorHover:s,handleColor:c,opacityDisabled:y,dotColor:f,dotColorModal:h,handleBoxShadow:k,handleBoxShadowHover:te,handleBoxShadowActive:oe,handleBoxShadowFocus:je,dotBorder:Ue,dotBoxShadow:Oe,railHeight:Le,railWidthVertical:Ke,handleSize:Xe,dotHeight:Ye,dotWidth:We,dotBorderRadius:Ge,fontSize:qe,dotBorderActive:Je,dotColorPopover:Qe},common:{cubicBezierEaseInOut:Ze}}=i.value;return{"--n-bezier":Ze,"--n-dot-border":Ue,"--n-dot-border-active":Je,"--n-dot-border-radius":Ge,"--n-dot-box-shadow":Oe,"--n-dot-color":f,"--n-dot-color-modal":h,"--n-dot-color-popover":Qe,"--n-dot-height":Ye,"--n-dot-width":We,"--n-fill-color":r,"--n-fill-color-hover":s,"--n-font-size":qe,"--n-handle-box-shadow":k,"--n-handle-box-shadow-active":oe,"--n-handle-box-shadow-focus":je,"--n-handle-box-shadow-hover":te,"--n-handle-color":c,"--n-handle-size":Xe,"--n-opacity-disabled":y,"--n-rail-color":t,"--n-rail-color-hover":o,"--n-rail-height":Le,"--n-rail-width-vertical":Ke,"--n-mark-font-size":e}}),D=u?pe("slider",void 0,ve,a):void 0,me=w(()=>{const{self:{fontSize:e,indicatorColor:t,indicatorBoxShadow:o,indicatorTextColor:r,indicatorBorderRadius:s}}=i.value;return{"--n-font-size":e,"--n-indicator-border-radius":s,"--n-indicator-box-shadow":o,"--n-indicator-color":t,"--n-indicator-text-color":r}}),M=u?pe("slider-indicator",void 0,me,a):void 0;return{mergedClsPrefix:l,namespace:b,uncontrolledValue:q,mergedValue:J,mergedDisabled:H,mergedPlacement:Se,isMounted:mt(),adjustedTo:ne(a),dotTransitionDisabled:I,markInfos:Te,isShowTooltip:de,shouldKeepTooltipTransition:Be,handleRailRef:d,setHandleRefs:z,setFollowerRefs:G,fillStyle:ze,getHandleStyle:Ve,activeIndex:p,arrifiedValues:g,followerEnabledIndexSet:N,handleRailMouseDown:_e,handleHandleFocus:Ie,handleHandleBlur:Ae,handleHandleMouseEnter:Ee,handleHandleMouseLeave:Pe,handleRailKeyDown:Ne,indicatorCssVars:u?void 0:me,indicatorThemeClass:M==null?void 0:M.themeClass,indicatorOnRender:M==null?void 0:M.onRender,cssVars:u?void 0:ve,themeClass:D==null?void 0:D.themeClass,onRender:D==null?void 0:D.onRender}},render(){var a;const{mergedClsPrefix:l,themeClass:b,formatTooltip:u}=this;return(a=this.onRender)===null||a===void 0||a.call(this),v("div",{class:[`${l}-slider`,b,{[`${l}-slider--disabled`]:this.mergedDisabled,[`${l}-slider--active`]:this.activeIndex!==-1,[`${l}-slider--with-mark`]:this.marks,[`${l}-slider--vertical`]:this.vertical,[`${l}-slider--reverse`]:this.reverse}],style:this.cssVars,onKeydown:this.handleRailKeyDown,onMousedown:this.handleRailMouseDown,onTouchstart:this.handleRailMouseDown},v("div",{class:`${l}-slider-rail`},v("div",{class:`${l}-slider-rail__fill`,style:this.fillStyle}),this.marks?v("div",{class:[`${l}-slider-dots`,this.dotTransitionDisabled&&`${l}-slider-dots--transition-disabled`]},this.markInfos.map(i=>v("div",{key:i.key,class:[`${l}-slider-dot`,{[`${l}-slider-dot--active`]:i.active}],style:i.style}))):null,v("div",{ref:"handleRailRef",class:`${l}-slider-handles`},this.arrifiedValues.map((i,d)=>{const B=this.isShowTooltip(d);return v(rt,null,{default:()=>[v(lt,null,{default:()=>v("div",{ref:this.setHandleRefs(d),class:`${l}-slider-handle-wrapper`,tabindex:this.mergedDisabled?-1:0,role:"slider","aria-valuenow":i,"aria-valuemin":this.min,"aria-valuemax":this.max,"aria-orientation":this.vertical?"vertical":"horizontal","aria-disabled":this.disabled,style:this.getHandleStyle(i,d),onFocus:()=>{this.handleHandleFocus(d)},onBlur:()=>{this.handleHandleBlur(d)},onMouseenter:()=>{this.handleHandleMouseEnter(d)},onMouseleave:()=>{this.handleHandleMouseLeave(d)}},it(this.$slots.thumb,()=>[v("div",{class:`${l}-slider-handle`})]))}),this.tooltip&&v(st,{ref:this.setFollowerRefs(d),show:B,to:this.adjustedTo,enabled:this.showTooltip&&!this.range||this.followerEnabledIndexSet.has(d),teleportDisabled:this.adjustedTo===ne.tdkey,placement:this.mergedPlacement,containerClass:this.namespace},{default:()=>v(dt,{name:"fade-in-scale-up-transition",appear:this.isMounted,css:this.shouldKeepTooltipTransition(d),onEnter:()=>{this.followerEnabledIndexSet.add(d)},onAfterLeave:()=>{this.followerEnabledIndexSet.delete(d)}},{default:()=>{var z;return B?((z=this.indicatorOnRender)===null||z===void 0||z.call(this),v("div",{class:[`${l}-slider-handle-indicator`,this.indicatorThemeClass,`${l}-slider-handle-indicator--${this.mergedPlacement}`],style:this.indicatorCssVars},typeof u=="function"?u(i):i)):null}})})]})})),this.marks?v("div",{class:`${l}-slider-marks`},this.markInfos.map(i=>v("div",{key:i.key,class:`${l}-slider-mark`,style:i.style},typeof i.label=="function"?i.label():i.label))):null))}}),Ft={class:"space-y-5"},Nt={class:"w-full space-y-3"},_t={class:"flex flex-wrap items-center gap-4"},Ht={class:"w-full flex flex-wrap items-center justify-between gap-3"},It={__name:"ConfigView",setup(a){const l=bt(),b=w({get:()=>Number(l.settings.delay||0),set:u=>{l.settings.delay=Number(u)}});return(u,i)=>(Ce(),gt("div",Ft,[i[4]||(i[4]=R("div",null,[R("div",{class:"text-xl font-semibold tracking-wide"},"设置"),R("div",{class:"mt-1 text-sm text-slate-600"},"这些选项对所有学生会话生效。教务地址在会话里单独管理。")],-1)),S(x(yt),null,{default:$(()=>[S(x(Ct),{model:x(l).settings,"label-placement":"top",size:"large"},{default:$(()=>[S(x(Rt),{cols:12,"x-gap":16,"y-gap":14},{default:$(()=>[S(x(xe),{span:12,label:"选课 / 退课提交间隔（ms）"},{default:$(()=>[R("div",Nt,[R("div",_t,[S(x($t),{value:b.value,"onUpdate:value":i[0]||(i[0]=d=>b.value=d),min:0,max:2e3,step:100,class:"flex-1"},null,8,["value"]),S(x(pt),{bordered:!1,type:"info"},{default:$(()=>[xt(wt(b.value)+"ms",1)]),_:1})]),i[2]||(i[2]=R("div",{class:"text-sm text-slate-600"},"只作用在抢课提交之后。退课、拉课表、刷新轮次不再等待。",-1))])]),_:1}),S(x(xe),{span:12,label:"TLS 证书"},{default:$(()=>[R("div",Ht,[i[3]||(i[3]=R("div",{class:"text-sm text-slate-700"},"校园自签证书无法校验时再打开",-1)),S(x(St),{value:x(l).settings.insecureTls,"onUpdate:value":i[1]||(i[1]=d=>x(l).settings.insecureTls=d)},null,8,["value"])])]),_:1})]),_:1})]),_:1},8,["model"])]),_:1})]))}},Ut={__name:"ConfigPage",setup(a){return(l,b)=>(Ce(),kt(It))}};export{Ut as default};
