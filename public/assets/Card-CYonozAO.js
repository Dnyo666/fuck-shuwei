import{f as X,g as n,h as z,i as Y,j as Z,bC as ee,k as l,l as a,p as oe,q as s,aa as v,bR as m,a4 as re,v as te,x as F,ac as ne,A as E,ae as $,ad as de,H as ae,J as le,al as ie}from"./index-DbbuXxQc.js";const se={paddingSmall:"12px 16px 12px",paddingMedium:"19px 24px 20px",paddingLarge:"23px 32px 24px",paddingHuge:"27px 40px 28px",titleFontSizeSmall:"16px",titleFontSizeMedium:"18px",titleFontSizeLarge:"18px",titleFontSizeHuge:"18px",closeIconSize:"18px",closeSize:"22px"};function ce(o){const{primaryColor:u,borderRadius:g,lineHeight:e,fontSize:c,cardColor:b,textColor2:x,textColor1:f,dividerColor:d,fontWeightStrong:t,closeIconColor:r,closeIconColorHover:i,closeIconColorPressed:C,closeColorHover:p,closeColorPressed:S,modalColor:y,boxShadow1:k,popoverColor:w,actionColor:h}=o;return Object.assign(Object.assign({},se),{lineHeight:e,color:b,colorModal:y,colorPopover:w,colorTarget:u,colorEmbedded:h,colorEmbeddedModal:h,colorEmbeddedPopover:h,textColor:x,titleTextColor:f,borderColor:d,actionColor:h,titleFontWeight:t,closeColorHover:p,closeColorPressed:S,closeBorderRadius:g,closeIconColor:r,closeIconColorHover:i,closeIconColorPressed:C,fontSizeSmall:c,fontSizeMedium:c,fontSizeLarge:c,fontSizeHuge:c,boxShadow:k,borderRadius:g})}const be={name:"Card",common:X,self:ce},ge=n([z("card",`
 font-size: var(--n-font-size);
 line-height: var(--n-line-height);
 display: flex;
 flex-direction: column;
 width: 100%;
 box-sizing: border-box;
 position: relative;
 border-radius: var(--n-border-radius);
 background-color: var(--n-color);
 color: var(--n-text-color);
 word-break: break-word;
 transition: 
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[ee({background:"var(--n-color-modal)"}),l("hoverable",[n("&:hover","box-shadow: var(--n-box-shadow);")]),l("content-segmented",[n(">",[a("content",{paddingTop:"var(--n-padding-bottom)"})])]),l("content-soft-segmented",[n(">",[a("content",`
 margin: 0 var(--n-padding-left);
 padding: var(--n-padding-bottom) 0;
 `)])]),l("footer-segmented",[n(">",[a("footer",{paddingTop:"var(--n-padding-bottom)"})])]),l("footer-soft-segmented",[n(">",[a("footer",`
 padding: var(--n-padding-bottom) 0;
 margin: 0 var(--n-padding-left);
 `)])]),n(">",[z("card-header",`
 box-sizing: border-box;
 display: flex;
 align-items: center;
 font-size: var(--n-title-font-size);
 padding:
 var(--n-padding-top)
 var(--n-padding-left)
 var(--n-padding-bottom)
 var(--n-padding-left);
 `,[a("main",`
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 flex: 1;
 min-width: 0;
 color: var(--n-title-text-color);
 `),a("extra",`
 display: flex;
 align-items: center;
 font-size: var(--n-font-size);
 font-weight: 400;
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 `),a("close",`
 margin: 0 0 0 8px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `)]),a("action",`
 box-sizing: border-box;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 background-clip: padding-box;
 background-color: var(--n-action-color);
 `),a("content","flex: 1; min-width: 0;"),a("content, footer",`
 box-sizing: border-box;
 padding: 0 var(--n-padding-left) var(--n-padding-bottom) var(--n-padding-left);
 font-size: var(--n-font-size);
 `,[n("&:first-child",{paddingTop:"var(--n-padding-bottom)"})]),a("action",`
 background-color: var(--n-action-color);
 padding: var(--n-padding-bottom) var(--n-padding-left);
 border-bottom-left-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `)]),z("card-cover",`
 overflow: hidden;
 width: 100%;
 border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
 `,[n("img",`
 display: block;
 width: 100%;
 `)]),l("bordered",`
 border: 1px solid var(--n-border-color);
 `,[n("&:target","border-color: var(--n-color-target);")]),l("action-segmented",[n(">",[a("action",[n("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])]),l("content-segmented, content-soft-segmented",[n(">",[a("content",{transition:"border-color 0.3s var(--n-bezier)"},[n("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])]),l("footer-segmented, footer-soft-segmented",[n(">",[a("footer",{transition:"border-color 0.3s var(--n-bezier)"},[n("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])]),l("embedded",`
 background-color: var(--n-color-embedded);
 `)]),Y(z("card",`
 background: var(--n-color-modal);
 `,[l("embedded",`
 background-color: var(--n-color-embedded-modal);
 `)])),Z(z("card",`
 background: var(--n-color-popover);
 `,[l("embedded",`
 background-color: var(--n-color-embedded-popover);
 `)]))]),P={title:[String,Function],contentClass:String,contentStyle:[Object,String],headerClass:String,headerStyle:[Object,String],headerExtraClass:String,headerExtraStyle:[Object,String],footerClass:String,footerStyle:[Object,String],embedded:Boolean,segmented:{type:[Boolean,Object],default:!1},size:{type:String,default:"medium"},bordered:{type:Boolean,default:!0},closable:Boolean,hoverable:Boolean,role:String,onClose:[Function,Array],tag:{type:String,default:"div"},cover:Function,content:[String,Function],footer:Function,action:Function,headerExtra:Function,closeFocusable:Boolean},he=ie(P),fe=Object.assign(Object.assign({},F.props),P),ve=oe({name:"Card",props:fe,slots:Object,setup(o){const u=()=>{const{onClose:t}=o;t&&le(t)},{inlineThemeDisabled:g,mergedClsPrefixRef:e,mergedRtlRef:c}=te(o),b=F("Card","-card",ge,be,o,e),x=ne("Card",c,e),f=E(()=>{const{size:t}=o,{self:{color:r,colorModal:i,colorTarget:C,textColor:p,titleTextColor:S,titleFontWeight:y,borderColor:k,actionColor:w,borderRadius:h,lineHeight:R,closeIconColor:T,closeIconColorHover:B,closeIconColorPressed:O,closeColorHover:_,closeColorPressed:j,closeBorderRadius:H,closeIconSize:M,closeSize:I,boxShadow:V,colorPopover:L,colorEmbedded:N,colorEmbeddedModal:W,colorEmbeddedPopover:A,[$("padding",t)]:K,[$("fontSize",t)]:q,[$("titleFontSize",t)]:D},common:{cubicBezierEaseInOut:J}}=b.value,{top:G,left:Q,bottom:U}=de(K);return{"--n-bezier":J,"--n-border-radius":h,"--n-color":r,"--n-color-modal":i,"--n-color-popover":L,"--n-color-embedded":N,"--n-color-embedded-modal":W,"--n-color-embedded-popover":A,"--n-color-target":C,"--n-text-color":p,"--n-line-height":R,"--n-action-color":w,"--n-title-text-color":S,"--n-title-font-weight":y,"--n-close-icon-color":T,"--n-close-icon-color-hover":B,"--n-close-icon-color-pressed":O,"--n-close-color-hover":_,"--n-close-color-pressed":j,"--n-border-color":k,"--n-box-shadow":V,"--n-padding-top":G,"--n-padding-bottom":U,"--n-padding-left":Q,"--n-font-size":q,"--n-title-font-size":D,"--n-close-size":I,"--n-close-icon-size":M,"--n-close-border-radius":H}}),d=g?ae("card",E(()=>o.size[0]),f,o):void 0;return{rtlEnabled:x,mergedClsPrefix:e,mergedTheme:b,handleCloseClick:u,cssVars:g?void 0:f,themeClass:d==null?void 0:d.themeClass,onRender:d==null?void 0:d.onRender}},render(){const{segmented:o,bordered:u,hoverable:g,mergedClsPrefix:e,rtlEnabled:c,onRender:b,embedded:x,tag:f,$slots:d}=this;return b==null||b(),s(f,{class:[`${e}-card`,this.themeClass,x&&`${e}-card--embedded`,{[`${e}-card--rtl`]:c,[`${e}-card--content${typeof o!="boolean"&&o.content==="soft"?"-soft":""}-segmented`]:o===!0||o!==!1&&o.content,[`${e}-card--footer${typeof o!="boolean"&&o.footer==="soft"?"-soft":""}-segmented`]:o===!0||o!==!1&&o.footer,[`${e}-card--action-segmented`]:o===!0||o!==!1&&o.action,[`${e}-card--bordered`]:u,[`${e}-card--hoverable`]:g}],style:this.cssVars,role:this.role},v(d.cover,t=>{const r=this.cover?m([this.cover()]):t;return r&&s("div",{class:`${e}-card-cover`,role:"none"},r)}),v(d.header,t=>{const{title:r}=this,i=r?m(typeof r=="function"?[r()]:[r]):t;return i||this.closable?s("div",{class:[`${e}-card-header`,this.headerClass],style:this.headerStyle,role:"heading"},s("div",{class:`${e}-card-header__main`,role:"heading"},i),v(d["header-extra"],C=>{const p=this.headerExtra?m([this.headerExtra()]):C;return p&&s("div",{class:[`${e}-card-header__extra`,this.headerExtraClass],style:this.headerExtraStyle},p)}),this.closable&&s(re,{clsPrefix:e,class:`${e}-card-header__close`,onClick:this.handleCloseClick,focusable:this.closeFocusable,absolute:!0})):null}),v(d.default,t=>{const{content:r}=this,i=r?m(typeof r=="function"?[r()]:[r]):t;return i&&s("div",{class:[`${e}-card__content`,this.contentClass],style:this.contentStyle,role:"none"},i)}),v(d.footer,t=>{const r=this.footer?m([this.footer()]):t;return r&&s("div",{class:[`${e}-card__footer`,this.footerClass],style:this.footerStyle,role:"none"},r)}),v(d.action,t=>{const r=this.action?m([this.action()]):t;return r&&s("div",{class:`${e}-card__action`,role:"none"},r)}))}});export{ve as N,P as a,he as b,be as c};
