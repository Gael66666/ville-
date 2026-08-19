/*
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://jquery.malsup.com/pointelle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version: 2.99 (12-MAR-2011)
 * Dual licensed under the MIT and GPL licenses.
 * http://jquery.malsup.com/license.html
 * Requires: jQuery v1.3.2 or later
 */
;(function($){var ver="2.99";if($.support==undefined){$.support={opacity:!($.browser.msie)};}function debug(s){$.fn.pointelle.debug&&log(s);}function log(){window.console&&console.log&&console.log("[pointelle] "+Array.prototype.join.call(arguments," "));}$.expr[":"].paused=function(el){return el.pointellePause;};$.fn.pointelle=function(options,arg2){var o={s:this.selector,c:this.context};if(this.length===0&&options!="stop"){if(!$.isReady&&o.s){log("DOM not ready, queuing slideshow");$(function(){$(o.s,o.c).pointelle(options,arg2);});return this;}log("terminating; zero elements found by selector"+($.isReady?"":" (DOM not ready)"));return this;}return this.each(function(){var opts=handleArguments(this,options,arg2);if(opts===false){return;}opts.updateActivePagerLink=opts.updateActivePagerLink||$.fn.pointelle.updateActivePagerLink;if(this.pointelleTimeout){clearTimeout(this.pointelleTimeout);}this.pointelleTimeout=this.pointellePause=0;var $cont=$(this);var $slides=opts.slideExpr?$(opts.slideExpr,this):$cont.children();var els=$slides.get();if(els.length<2){log("terminating; too few slides: "+els.length);return;}var opts2=buildOptions($cont,$slides,els,opts,o);if(opts2===false){return;}var startTime=opts2.continuous?10:getTimeout(els[opts2.currSlide],els[opts2.nextSlide],opts2,!opts2.backwards);if(startTime){startTime+=(opts2.delay||0);if(startTime<10){startTime=10;}debug("first timeout: "+startTime);this.pointelleTimeout=setTimeout(function(){go(els,opts2,0,!opts.backwards);},startTime);}});};function handleArguments(cont,options,arg2){if(cont.pointelleStop==undefined){cont.pointelleStop=0;}if(options===undefined||options===null){options={};}if(options.constructor==String){switch(options){case"destroy":case"stop":var opts=$(cont).data("pointelle.opts");if(!opts){return false;}cont.pointelleStop++;if(cont.pointelleTimeout){clearTimeout(cont.pointelleTimeout);}cont.pointelleTimeout=0;$(cont).removeData("pointelle.opts");if(options=="destroy"){destroy(opts);}return false;case"toggle":cont.pointellePause=(cont.pointellePause===1)?0:1;checkInstantResume(cont.pointellePause,arg2,cont);return false;case"pause":cont.pointellePause=1;return false;case"resume":cont.pointellePause=0;checkInstantResume(false,arg2,cont);return false;case"prev":case"next":var opts=$(cont).data("pointelle.opts");if(!opts){log('options not found, "prev/next" ignored');return false;}$.fn.pointelle[options](opts);return false;default:options={fx:options};}return options;}else{if(options.constructor==Number){var num=options;options=$(cont).data("pointelle.opts");if(!options){log("options not found, can not advance slide");return false;}if(num<0||num>=options.elements.length){log("invalid slide index: "+num);return false;}options.nextSlide=num;if(cont.pointelleTimeout){clearTimeout(cont.pointelleTimeout);cont.pointelleTimeout=0;}if(typeof arg2=="string"){options.oneTimeFx=arg2;}go(options.elements,options,1,num>=options.currSlide);return false;}}return options;function checkInstantResume(isPaused,arg2,cont){if(!isPaused&&arg2===true){var options=$(cont).data("pointelle.opts");if(!options){log("options not found, can not resume");return false;}if(cont.pointelleTimeout){clearTimeout(cont.pointelleTimeout);cont.pointelleTimeout=0;}go(options.elements,options,1,!options.backwards);}}}function removeFilter(el,opts){if(!$.support.opacity&&opts.cleartype&&el.style.filter){try{el.style.removeAttribute("filter");}catch(smother){}}}function destroy(opts){if(opts.next){$(opts.next).unbind(opts.prevNextEvent);}if(opts.prev){$(opts.prev).unbind(opts.prevNextEvent);}if(opts.pager||opts.pagerAnchorBuilder){$.each(opts.pagerAnchors||[],function(){this.unbind().remove();});}opts.pagerAnchors=null;if(opts.destroy){opts.destroy(opts);}}function buildOptions($cont,$slides,els,options,o){var opts=$.extend({},$.fn.pointelle.defaults,options||{},$.metadata?$cont.metadata():$.meta?$cont.data():{});if(opts.autostop){opts.countdown=opts.autostopCount||els.length;}var cont=$cont[0];$cont.data("pointelle.opts",opts);opts.$cont=$cont;opts.stopCount=cont.pointelleStop;opts.elements=els;opts.before=opts.before?[opts.before]:[];opts.after=opts.after?[opts.after]:[];if(!$.support.opacity&&opts.cleartype){opts.after.push(function(){removeFilter(this,opts);});}if(opts.continuous){opts.after.push(function(){go(els,opts,0,!opts.backwards);});}saveOriginalOpts(opts);if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($slides);}if($cont.css("position")=="static"){$cont.css("position","relative");}if(opts.width){$cont.width(opts.width);}if(opts.height&&opts.height!="auto"){$cont.height(opts.height);}if(opts.startingSlide){opts.startingSlide=parseInt(opts.startingSlide);}else{if(opts.backwards){opts.startingSlide=els.length-1;}}if(opts.random){opts.randomMap=[];for(var i=0;i<els.length;i++){opts.randomMap.push(i);}opts.randomMap.sort(function(a,b){return Math.random()-0.5;});opts.randomIndex=1;opts.startingSlide=opts.randomMap[1];}else{if(opts.startingSlide>=els.length){opts.startingSlide=0;}}opts.currSlide=opts.startingSlide||0;var first=opts.startingSlide;$slides.css({position:"absolute",top:0,left:0}).hide().each(function(i){var z;if(opts.backwards){z=first?i<=first?els.length+(i-first):first-i:els.length-i;}else{z=first?i>=first?els.length-(i-first):first-i:els.length-i;}$(this).css("z-index",z);});$(els[first]).css("opacity",1).show();removeFilter(els[first],opts);if(opts.fit&&opts.width){$slides.width(opts.width);}if(opts.fit&&opts.height&&opts.height!="auto"){$slides.height(opts.height);}var reshape=opts.containerResize&&!$cont.innerHeight();if(reshape){var maxw=0,maxh=0;for(var j=0;j<els.length;j++){var $e=$(els[j]),e=$e[0],w=$e.outerWidth(),h=$e.outerHeight();if(!w){w=e.offsetWidth||e.width||$e.attr("width");}if(!h){h=e.offsetHeight||e.height||$e.attr("height");}maxw=w>maxw?w:maxw;maxh=h>maxh?h:maxh;}if(maxw>0&&maxh>0){$cont.css({width:maxw+"px",height:maxh+"px"});}}if(opts.pause){$cont.hover(function(){this.pointellePause++;},function(){this.pointellePause--;});}if(supportMultiTransitions(opts)===false){return false;}var requeue=false;options.requeueAttempts=options.requeueAttempts||0;$slides.each(function(){var $el=$(this);this.pointelleH=(opts.fit&&opts.height)?opts.height:($el.height()||this.offsetHeight||this.height||$el.attr("height")||0);this.pointelleW=(opts.fit&&opts.width)?opts.width:($el.width()||this.offsetWidth||this.width||$el.attr("width")||0);if($el.is("img")){var loadingIE=($.browser.msie&&this.pointelleW==28&&this.pointelleH==30&&!this.complete);var loadingFF=($.browser.mozilla&&this.pointelleW==34&&this.pointelleH==19&&!this.complete);var loadingOp=($.browser.opera&&((this.pointelleW==42&&this.pointelleH==19)||(this.pointelleW==37&&this.pointelleH==17))&&!this.complete);var loadingOther=(this.pointelleH==0&&this.pointelleW==0&&!this.complete);if(loadingIE||loadingFF||loadingOp||loadingOther){if(o.s&&opts.requeueOnImageNotLoaded&&++options.requeueAttempts<100){log(options.requeueAttempts," - img slide not loaded, requeuing slideshow: ",this.src,this.pointelleW,this.pointelleH);setTimeout(function(){$(o.s,o.c).pointelle(options);},opts.requeueTimeout);requeue=true;return false;}else{log("could not determine size of image: "+this.src,this.pointelleW,this.pointelleH);}}}return true;});if(requeue){return false;}opts.cssBefore=opts.cssBefore||{};opts.cssAfter=opts.cssAfter||{};opts.cssFirst=opts.cssFirst||{};opts.animIn=opts.animIn||{};opts.animOut=opts.animOut||{};$slides.not(":eq("+first+")").css(opts.cssBefore);$($slides[first]).css(opts.cssFirst);if(opts.timeout){opts.timeout=parseInt(opts.timeout);if(opts.speed.constructor==String){opts.speed=$.fx.speeds[opts.speed]||parseInt(opts.speed);}if(!opts.sync){opts.speed=opts.speed/2;}var buffer=opts.fx=="none"?0:opts.fx=="shuffle"?500:250;while((opts.timeout-opts.speed)<buffer){opts.timeout+=opts.speed;}}if(opts.easing){opts.easeIn=opts.easeOut=opts.easing;}if(!opts.speedIn){opts.speedIn=opts.speed;}if(!opts.speedOut){opts.speedOut=opts.speed;}opts.slideCount=els.length;opts.currSlide=opts.lastSlide=first;if(opts.random){if(++opts.randomIndex==els.length){opts.randomIndex=0;}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.backwards){opts.nextSlide=opts.startingSlide==0?(els.length-1):opts.startingSlide-1;}else{opts.nextSlide=opts.startingSlide>=(els.length-1)?0:opts.startingSlide+1;}}if(!opts.multiFx){var init=$.fn.pointelle.transitions[opts.fx];if($.isFunction(init)){init($cont,$slides,opts);}else{if(opts.fx!="custom"&&!opts.multiFx){log("unknown transition: "+opts.fx,"; slideshow terminating");return false;}}}var e0=$slides[first];if(opts.before.length){opts.before[0].apply(e0,[e0,e0,opts,true]);}if(opts.after.length){opts.after[0].apply(e0,[e0,e0,opts,true]);}if(opts.next){$(opts.next).bind(opts.prevNextEvent,function(){return advance(opts,1);});}if(opts.prev){$(opts.prev).bind(opts.prevNextEvent,function(){return advance(opts,0);});}if(opts.pager||opts.pagerAnchorBuilder){buildPager(els,opts);}exposeAddSlide(opts,els);return opts;}function saveOriginalOpts(opts){opts.original={before:[],after:[]};opts.original.cssBefore=$.extend({},opts.cssBefore);opts.original.cssAfter=$.extend({},opts.cssAfter);opts.original.animIn=$.extend({},opts.animIn);opts.original.animOut=$.extend({},opts.animOut);$.each(opts.before,function(){opts.original.before.push(this);});$.each(opts.after,function(){opts.original.after.push(this);});}function supportMultiTransitions(opts){var i,tx,txs=$.fn.pointelle.transitions;if(opts.fx.indexOf(",")>0){opts.multiFx=true;opts.fxs=opts.fx.replace(/\s*/g,"").split(",");for(i=0;i<opts.fxs.length;i++){var fx=opts.fxs[i];tx=txs[fx];if(!tx||!txs.hasOwnProperty(fx)||!$.isFunction(tx)){log("discarding unknown transition: ",fx);opts.fxs.splice(i,1);i--;}}if(!opts.fxs.length){log("No valid transitions named; slideshow terminating.");return false;}}else{if(opts.fx=="all"){opts.multiFx=true;opts.fxs=[];for(p in txs){tx=txs[p];if(txs.hasOwnProperty(p)&&$.isFunction(tx)){opts.fxs.push(p);}}}}if(opts.multiFx&&opts.randomizeEffects){var r1=Math.floor(Math.random()*20)+30;for(i=0;i<r1;i++){var r2=Math.floor(Math.random()*opts.fxs.length);opts.fxs.push(opts.fxs.splice(r2,1)[0]);}debug("randomized fx sequence: ",opts.fxs);}return true;}function exposeAddSlide(opts,els){opts.addSlide=function(newSlide,prepend){var $s=$(newSlide),s=$s[0];if(!opts.autostopCount){opts.countdown++;}els[prepend?"unshift":"push"](s);if(opts.els){opts.els[prepend?"unshift":"push"](s);}opts.slideCount=els.length;$s.css("position","absolute");$s[prepend?"prependTo":"appendTo"](opts.$cont);if(prepend){opts.currSlide++;opts.nextSlide++;}if(!$.support.opacity&&opts.cleartype&&!opts.cleartypeNoBg){clearTypeFix($s);}if(opts.fit&&opts.width){$s.width(opts.width);}if(opts.fit&&opts.height&&opts.height!="auto"){$s.height(opts.height);}s.pointelleH=(opts.fit&&opts.height)?opts.height:$s.height();s.pointelleW=(opts.fit&&opts.width)?opts.width:$s.width();$s.css(opts.cssBefore);if(opts.pager||opts.pagerAnchorBuilder){$.fn.pointelle.createPagerAnchor(els.length-1,s,$(opts.pager),els,opts);}if($.isFunction(opts.onAddSlide)){opts.onAddSlide($s);}else{$s.hide();}};}$.fn.pointelle.resetState=function(opts,fx){fx=fx||opts.fx;opts.before=[];opts.after=[];opts.cssBefore=$.extend({},opts.original.cssBefore);opts.cssAfter=$.extend({},opts.original.cssAfter);opts.animIn=$.extend({},opts.original.animIn);opts.animOut=$.extend({},opts.original.animOut);opts.fxFn=null;$.each(opts.original.before,function(){opts.before.push(this);});$.each(opts.original.after,function(){opts.after.push(this);});var init=$.fn.pointelle.transitions[fx];if($.isFunction(init)){init(opts.$cont,$(opts.elements),opts);}};function go(els,opts,manual,fwd){if(manual&&opts.busy&&opts.manualTrump){debug("manualTrump in go(), stopping active transition");$(els).stop(true,true);opts.busy=0;}if(opts.busy){debug("transition active, ignoring new tx request");return;}var p=opts.$cont[0],curr=els[opts.currSlide],next=els[opts.nextSlide];if(p.pointelleStop!=opts.stopCount||p.pointelleTimeout===0&&!manual){return;}if(!manual&&!p.pointellePause&&!opts.bounce&&((opts.autostop&&(--opts.countdown<=0))||(opts.nowrap&&!opts.random&&opts.nextSlide<opts.currSlide))){if(opts.end){opts.end(opts);}return;}var changed=false;if((manual||!p.pointellePause)&&(opts.nextSlide!=opts.currSlide)){changed=true;var fx=opts.fx;curr.pointelleH=curr.pointelleH||$(curr).height();curr.pointelleW=curr.pointelleW||$(curr).width();next.pointelleH=next.pointelleH||$(next).height();next.pointelleW=next.pointelleW||$(next).width();if(opts.multiFx){if(opts.lastFx==undefined||++opts.lastFx>=opts.fxs.length){opts.lastFx=0;}fx=opts.fxs[opts.lastFx];opts.currFx=fx;}if(opts.oneTimeFx){fx=opts.oneTimeFx;opts.oneTimeFx=null;}$.fn.pointelle.resetState(opts,fx);if(opts.before.length){$.each(opts.before,function(i,o){if(p.pointelleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});}var after=function(){opts.busy=0;$.each(opts.after,function(i,o){if(p.pointelleStop!=opts.stopCount){return;}o.apply(next,[curr,next,opts,fwd]);});};debug("tx firing("+fx+"); currSlide: "+opts.currSlide+"; nextSlide: "+opts.nextSlide);opts.busy=1;if(opts.fxFn){opts.fxFn(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{if($.isFunction($.fn.pointelle[opts.fx])){$.fn.pointelle[opts.fx](curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}else{$.fn.pointelle.custom(curr,next,opts,after,fwd,manual&&opts.fastOnEvent);}}}if(changed||opts.nextSlide==opts.currSlide){opts.lastSlide=opts.currSlide;if(opts.random){opts.currSlide=opts.nextSlide;if(++opts.randomIndex==els.length){opts.randomIndex=0;}opts.nextSlide=opts.randomMap[opts.randomIndex];if(opts.nextSlide==opts.currSlide){opts.nextSlide=(opts.currSlide==opts.slideCount-1)?0:opts.currSlide+1;}}else{if(opts.backwards){var roll=(opts.nextSlide-1)<0;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=1;opts.currSlide=0;}else{opts.nextSlide=roll?(els.length-1):opts.nextSlide-1;opts.currSlide=roll?0:opts.nextSlide+1;}}else{var roll=(opts.nextSlide+1)==els.length;if(roll&&opts.bounce){opts.backwards=!opts.backwards;opts.nextSlide=els.length-2;opts.currSlide=els.length-1;}else{opts.nextSlide=roll?0:opts.nextSlide+1;opts.currSlide=roll?els.length-1:opts.nextSlide-1;}}}}if(changed&&opts.pager){opts.updateActivePagerLink(opts.pager,opts.currSlide,opts.activePagerClass);}var ms=0;if(opts.timeout&&!opts.continuous){ms=getTimeout(els[opts.currSlide],els[opts.nextSlide],opts,fwd);}else{if(opts.continuous&&p.pointellePause){ms=10;}}if(ms>0){p.pointelleTimeout=setTimeout(function(){go(els,opts,0,!opts.backwards);},ms);}}$.fn.pointelle.updateActivePagerLink=function(pager,currSlide,clsName){$(pager).each(function(){$(this).children().removeClass(clsName).eq(currSlide).addClass(clsName);});};function getTimeout(curr,next,opts,fwd){if(opts.timeoutFn){var t=opts.timeoutFn.call(curr,curr,next,opts,fwd);while(opts.fx!="none"&&(t-opts.speed)<250){t+=opts.speed;}debug("calculated timeout: "+t+"; speed: "+opts.speed);if(t!==false){return t;}}return opts.timeout;}$.fn.pointelle.next=function(opts){advance(opts,1);};$.fn.pointelle.prev=function(opts){advance(opts,0);};function advance(opts,moveForward){var val=moveForward?1:-1;var els=opts.elements;var p=opts.$cont[0],timeout=p.pointelleTimeout;if(timeout){clearTimeout(timeout);p.pointelleTimeout=0;}if(opts.random&&val<0){opts.randomIndex--;if(--opts.randomIndex==-2){opts.randomIndex=els.length-2;}else{if(opts.randomIndex==-1){opts.randomIndex=els.length-1;}}opts.nextSlide=opts.randomMap[opts.randomIndex];}else{if(opts.random){opts.nextSlide=opts.randomMap[opts.randomIndex];}else{opts.nextSlide=opts.currSlide+val;if(opts.nextSlide<0){if(opts.nowrap){return false;}opts.nextSlide=els.length-1;}else{if(opts.nextSlide>=els.length){if(opts.nowrap){return false;}opts.nextSlide=0;}}}}var cb=opts.onPrevNextEvent||opts.prevNextClick;if($.isFunction(cb)){cb(val>0,opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,moveForward);return false;}function buildPager(els,opts){var $p=$(opts.pager);$.each(els,function(i,o){$.fn.pointelle.createPagerAnchor(i,o,$p,els,opts);});opts.updateActivePagerLink(opts.pager,opts.startingSlide,opts.activePagerClass);}$.fn.pointelle.createPagerAnchor=function(i,el,$p,els,opts){var a;if($.isFunction(opts.pagerAnchorBuilder)){a=opts.pagerAnchorBuilder(i,el);debug("pagerAnchorBuilder("+i+", el) returned: "+a);}else{a='<a href="#">'+(i+1)+"</a>";}if(!a){return;}var $a=$(a);if($a.parents("body").length===0){var arr=[];if($p.length>1){$p.each(function(){var $clone=$a.clone(true);$(this).append($clone);arr.push($clone[0]);});$a=$(arr);}else{$a.appendTo($p);}}opts.pagerAnchors=opts.pagerAnchors||[];opts.pagerAnchors.push($a);$a.bind(opts.pagerEvent,function(e){e.preventDefault();opts.nextSlide=i;var p=opts.$cont[0],timeout=p.pointelleTimeout;if(timeout){clearTimeout(timeout);p.pointelleTimeout=0;}var cb=opts.onPagerEvent||opts.pagerClick;if($.isFunction(cb)){cb(opts.nextSlide,els[opts.nextSlide]);}go(els,opts,1,opts.currSlide<i);});if(!/^click/.test(opts.pagerEvent)&&!opts.allowPagerClickBubble){$a.bind("click.pointelle",function(){return false;});}if(opts.pauseOnPagerHover){$a.hover(function(){opts.$cont[0].pointellePause++;},function(){opts.$cont[0].pointellePause--;});}};$.fn.pointelle.hopsFromLast=function(opts,fwd){var hops,l=opts.lastSlide,c=opts.currSlide;if(fwd){hops=c>l?c-l:opts.slideCount-l;}else{hops=c<l?l-c:l+opts.slideCount-c;}return hops;};function clearTypeFix($slides){debug("applying clearType background-color hack");function hex(s){s=parseInt(s).toString(16);return s.length<2?"0"+s:s;}function getBg(e){for(;e&&e.nodeName.toLowerCase()!="html";e=e.parentNode){var v=$.css(e,"background-color");if(v&&v.indexOf("rgb")>=0){var rgb=v.match(/\d+/g);return"#"+hex(rgb[0])+hex(rgb[1])+hex(rgb[2]);}if(v&&v!="transparent"){return v;}}return"#ffffff";}$slides.each(function(){$(this).css("background-color",getBg(this));});}$.fn.pointelle.commonReset=function(curr,next,opts,w,h,rev){$(opts.elements).not(curr).hide();if(typeof opts.cssBefore.opacity=="undefined"){opts.cssBefore.opacity=1;}opts.cssBefore.display="block";if(opts.slideResize&&w!==false&&next.pointelleW>0){opts.cssBefore.width=next.pointelleW;}if(opts.slideResize&&h!==false&&next.pointelleH>0){opts.cssBefore.height=next.pointelleH;}opts.cssAfter=opts.cssAfter||{};opts.cssAfter.display="none";$(curr).css("zIndex",opts.slideCount+(rev===true?1:0));$(next).css("zIndex",opts.slideCount+(rev===true?0:1));};$.fn.pointelle.custom=function(curr,next,opts,cb,fwd,speedOverride){var $l=$(curr),$n=$(next);var speedIn=opts.speedIn,speedOut=opts.speedOut,easeIn=opts.easeIn,easeOut=opts.easeOut;$n.css(opts.cssBefore);if(speedOverride){if(typeof speedOverride=="number"){speedIn=speedOut=speedOverride;}else{speedIn=speedOut=1;}easeIn=easeOut=null;}var fn=function(){$n.animate(opts.animIn,speedIn,easeIn,function(){cb();});};$l.animate(opts.animOut,speedOut,easeOut,function(){$l.css(opts.cssAfter);if(!opts.sync){fn();}});if(opts.sync){fn();}};$.fn.pointelle.transitions={fade:function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css("opacity",0);opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts);opts.cssBefore.opacity=0;});opts.animIn={opacity:1};opts.animOut={opacity:0};opts.cssBefore={top:0,left:0};}};$.fn.pointelle.ver=function(){return ver;};$.fn.pointelle.defaults={activePagerClass:"activeSlide",after:null,allowPagerClickBubble:false,animIn:null,animOut:null,autostop:0,autostopCount:0,backwards:false,before:null,cleartype:!$.support.opacity,cleartypeNoBg:false,containerResize:1,continuous:0,cssAfter:null,cssBefore:null,delay:0,easeIn:null,easeOut:null,easing:null,end:null,fastOnEvent:0,fit:0,fx:"fade",fxFn:null,height:"auto",manualTrump:true,next:null,nowrap:0,onPagerEvent:null,onPrevNextEvent:null,pager:null,pagerAnchorBuilder:null,pagerEvent:"click.pointelle",pause:0,pauseOnPagerHover:0,prev:null,prevNextEvent:"click.pointelle",random:0,randomizeEffects:1,requeueOnImageNotLoaded:true,requeueTimeout:250,rev:0,shuffle:null,slideExpr:null,slideResize:1,speed:1000,speedIn:null,speedOut:null,startingSlide:0,sync:1,timeout:4000,timeoutFn:null,updateActivePagerLink:null};})(jQuery);
/*
 * jQuery Cycle Plugin Transition Definitions
 * This script is a plugin for the jQuery Cycle Plugin
 * Examples and documentation at: http://malsup.com/jquery/pointelle/
 * Copyright (c) 2007-2010 M. Alsup
 * Version:	 2.73
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($){$.fn.pointelle.transitions.none=function($cont,$slides,opts){opts.fxFn=function(curr,next,opts,after){$(next).show();$(curr).hide();after();};};$.fn.pointelle.transitions.fadeout=function($cont,$slides,opts){$slides.not(":eq("+opts.currSlide+")").css({display:"block",opacity:1});opts.before.push(function(curr,next,opts,w,h,rev){$(curr).css("zIndex",opts.slideCount+(!rev===true?1:0));$(next).css("zIndex",opts.slideCount+(!rev===true?0:1));});opts.animIn.opacity=1;opts.animOut.opacity=0;opts.cssBefore.opacity=1;opts.cssBefore.display="block";opts.cssAfter.zIndex=0;};$.fn.pointelle.transitions.scrollUp=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.pointelle.commonReset);var h=$cont.height();opts.cssBefore.top=h;opts.cssBefore.left=0;opts.cssFirst.top=0;opts.animIn.top=0;opts.animOut.top=-h;};$.fn.pointelle.transitions.scrollDown=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.pointelle.commonReset);var h=$cont.height();opts.cssFirst.top=0;opts.cssBefore.top=-h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.pointelle.transitions.scrollLeft=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.pointelle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=0-w;};$.fn.pointelle.transitions.scrollRight=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push($.fn.pointelle.commonReset);var w=$cont.width();opts.cssFirst.left=0;opts.cssBefore.left=-w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.pointelle.transitions.scrollHorz=function($cont,$slides,opts){$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.pointelle.commonReset(curr,next,opts);opts.cssBefore.left=fwd?(next.pointelleW-1):(1-next.pointelleW);opts.animOut.left=fwd?-curr.pointelleW:curr.pointelleW;});opts.cssFirst.left=0;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.top=0;};$.fn.pointelle.transitions.scrollVert=function($cont,$slides,opts){$cont.css("overflow","hidden");opts.before.push(function(curr,next,opts,fwd){if(opts.rev){fwd=!fwd;}$.fn.pointelle.commonReset(curr,next,opts);opts.cssBefore.top=fwd?(1-next.pointelleH):(next.pointelleH-1);opts.animOut.top=fwd?curr.pointelleH:-curr.pointelleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.left=0;};$.fn.pointelle.transitions.slideX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.pointelle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.pointelleW;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.width="show";opts.animOut.width=0;};$.fn.pointelle.transitions.slideY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$(opts.elements).not(curr).hide();$.fn.pointelle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.pointelleH;});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animIn.height="show";opts.animOut.height=0;};$.fn.pointelle.transitions.shuffle=function($cont,$slides,opts){var i,w=$cont.css("overflow","visible").width();$slides.css({left:0,top:0});opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,true,true);});if(!opts.speedAdjusted){opts.speed=opts.speed/2;opts.speedAdjusted=true;}opts.random=0;opts.shuffle=opts.shuffle||{left:-w,top:15};opts.els=[];for(i=0;i<$slides.length;i++){opts.els.push($slides[i]);}for(i=0;i<opts.currSlide;i++){opts.els.push(opts.els.shift());}opts.fxFn=function(curr,next,opts,cb,fwd){if(opts.rev){fwd=!fwd;}var $el=fwd?$(curr):$(next);$(next).css(opts.cssBefore);var count=opts.slideCount;$el.animate(opts.shuffle,opts.speedIn,opts.easeIn,function(){var hops=$.fn.pointelle.hopsFromLast(opts,fwd);for(var k=0;k<hops;k++){fwd?opts.els.push(opts.els.shift()):opts.els.unshift(opts.els.pop());}if(fwd){for(var i=0,len=opts.els.length;i<len;i++){$(opts.els[i]).css("z-index",len-i+count);}}else{var z=$(curr).css("z-index");$el.css("z-index",parseInt(z)+1+count);}$el.animate({left:0,top:0},opts.speedOut,opts.easeOut,function(){$(fwd?this:curr).hide();if(cb){cb();}});});};$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});};$.fn.pointelle.transitions.turnUp=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=next.pointelleH;opts.animIn.height=next.pointelleH;opts.animOut.width=next.pointelleW;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.height=0;opts.animIn.top=0;opts.animOut.height=0;};$.fn.pointelle.transitions.turnDown=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,false);opts.animIn.height=next.pointelleH;opts.animOut.top=curr.pointelleH;});opts.cssFirst.top=0;opts.cssBefore.left=0;opts.cssBefore.top=0;opts.cssBefore.height=0;opts.animOut.height=0;};$.fn.pointelle.transitions.turnLeft=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=next.pointelleW;opts.animIn.width=next.pointelleW;});opts.cssBefore.top=0;opts.cssBefore.width=0;opts.animIn.left=0;opts.animOut.width=0;};$.fn.pointelle.transitions.turnRight=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,true);opts.animIn.width=next.pointelleW;opts.animOut.left=curr.pointelleW;});$.extend(opts.cssBefore,{top:0,left:0,width:0});opts.animIn.left=0;opts.animOut.width=0;};$.fn.pointelle.transitions.zoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,false,true);opts.cssBefore.top=next.pointelleH/2;opts.cssBefore.left=next.pointelleW/2;$.extend(opts.animIn,{top:0,left:0,width:next.pointelleW,height:next.pointelleH});$.extend(opts.animOut,{width:0,height:0,top:curr.pointelleH/2,left:curr.pointelleW/2});});opts.cssFirst.top=0;opts.cssFirst.left=0;opts.cssBefore.width=0;opts.cssBefore.height=0;};$.fn.pointelle.transitions.fadeZoom=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,false);opts.cssBefore.left=next.pointelleW/2;opts.cssBefore.top=next.pointelleH/2;$.extend(opts.animIn,{top:0,left:0,width:next.pointelleW,height:next.pointelleH});});opts.cssBefore.width=0;opts.cssBefore.height=0;opts.animOut.opacity=0;};$.fn.pointelle.transitions.blindX=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts);opts.animIn.width=next.pointelleW;opts.animOut.left=curr.pointelleW;});opts.cssBefore.left=w;opts.cssBefore.top=0;opts.animIn.left=0;opts.animOut.left=w;};$.fn.pointelle.transitions.blindY=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts);opts.animIn.height=next.pointelleH;opts.animOut.top=curr.pointelleH;});opts.cssBefore.top=h;opts.cssBefore.left=0;opts.animIn.top=0;opts.animOut.top=h;};$.fn.pointelle.transitions.blindZ=function($cont,$slides,opts){var h=$cont.css("overflow","hidden").height();var w=$cont.width();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts);opts.animIn.height=next.pointelleH;opts.animOut.top=curr.pointelleH;});opts.cssBefore.top=h;opts.cssBefore.left=w;opts.animIn.top=0;opts.animIn.left=0;opts.animOut.top=h;opts.animOut.left=w;};$.fn.pointelle.transitions.growX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,true);opts.cssBefore.left=this.pointelleW/2;opts.animIn.left=0;opts.animIn.width=this.pointelleW;opts.animOut.left=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.pointelle.transitions.growY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,false);opts.cssBefore.top=this.pointelleH/2;opts.animIn.top=0;opts.animIn.height=this.pointelleH;opts.animOut.top=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.pointelle.transitions.curtainX=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,false,true,true);opts.cssBefore.left=next.pointelleW/2;opts.animIn.left=0;opts.animIn.width=this.pointelleW;opts.animOut.left=curr.pointelleW/2;opts.animOut.width=0;});opts.cssBefore.top=0;opts.cssBefore.width=0;};$.fn.pointelle.transitions.curtainY=function($cont,$slides,opts){opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,false,true);opts.cssBefore.top=next.pointelleH/2;opts.animIn.top=0;opts.animIn.height=next.pointelleH;opts.animOut.top=curr.pointelleH/2;opts.animOut.height=0;});opts.cssBefore.height=0;opts.cssBefore.left=0;};$.fn.pointelle.transitions.cover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts);if(d=="right"){opts.cssBefore.left=-w;}else{if(d=="up"){opts.cssBefore.top=h;}else{if(d=="down"){opts.cssBefore.top=-h;}else{opts.cssBefore.left=w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.pointelle.transitions.uncover=function($cont,$slides,opts){var d=opts.direction||"left";var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,true,true);if(d=="right"){opts.animOut.left=w;}else{if(d=="up"){opts.animOut.top=-h;}else{if(d=="down"){opts.animOut.top=h;}else{opts.animOut.left=-w;}}}});opts.animIn.left=0;opts.animIn.top=0;opts.cssBefore.top=0;opts.cssBefore.left=0;};$.fn.pointelle.transitions.toss=function($cont,$slides,opts){var w=$cont.css("overflow","visible").width();var h=$cont.height();opts.before.push(function(curr,next,opts){$.fn.pointelle.commonReset(curr,next,opts,true,true,true);if(!opts.animOut.left&&!opts.animOut.top){$.extend(opts.animOut,{left:w*2,top:-h/2,opacity:0});}else{opts.animOut.opacity=0;}});opts.cssBefore.left=0;opts.cssBefore.top=0;opts.animIn.left=0;};$.fn.pointelle.transitions.wipe=function($cont,$slides,opts){var w=$cont.css("overflow","hidden").width();var h=$cont.height();opts.cssBefore=opts.cssBefore||{};var clip;if(opts.clip){if(/l2r/.test(opts.clip)){clip="rect(0px 0px "+h+"px 0px)";}else{if(/r2l/.test(opts.clip)){clip="rect(0px "+w+"px "+h+"px "+w+"px)";}else{if(/t2b/.test(opts.clip)){clip="rect(0px "+w+"px 0px 0px)";}else{if(/b2t/.test(opts.clip)){clip="rect("+h+"px "+w+"px "+h+"px 0px)";}else{if(/zoom/.test(opts.clip)){var top=parseInt(h/2);var left=parseInt(w/2);clip="rect("+top+"px "+left+"px "+top+"px "+left+"px)";}}}}}}opts.cssBefore.clip=opts.cssBefore.clip||clip||"rect(0px 0px 0px 0px)";var d=opts.cssBefore.clip.match(/(\d+)/g);var t=parseInt(d[0]),r=parseInt(d[1]),b=parseInt(d[2]),l=parseInt(d[3]);opts.before.push(function(curr,next,opts){if(curr==next){return;}var $curr=$(curr),$next=$(next);$.fn.pointelle.commonReset(curr,next,opts,true,true,false);opts.cssAfter.display="block";var step=1,count=parseInt((opts.speedIn/13))-1;(function f(){var tt=t?t-parseInt(step*(t/count)):0;var ll=l?l-parseInt(step*(l/count)):0;var bb=b<h?b+parseInt(step*((h-b)/count||1)):h;var rr=r<w?r+parseInt(step*((w-r)/count||1)):w;$next.css({clip:"rect("+tt+"px "+rr+"px "+bb+"px "+ll+"px)"});(step++<=count)?setTimeout(f,13):$curr.css("display","none");})();});$.extend(opts.cssBefore,{display:"block",opacity:1,top:0,left:0});opts.animIn={left:0};opts.animOut={left:0};};})(jQuery);

/* Pointelle Slider : Resposiveness & Sizes */
(function($) {
jQuery.fn.pointelleSlider=function(args){
	var defaults={
			sliderWidth		:900,
			sliderHeight		:299,
			slideWidth		:600,
			navWidth		:300,
			navImgWidth		:70,
			navImgHeight		:70,
			imgHeight		:299,
			titleFsize		:18,
			navArrowSize		:48,
			navElement		:2,
			disable_thumbs		:0,
			navpos			:0
	}
	var options=jQuery.extend({},defaults,args);
	this.pointelleSliderSize=function(){
		var wrapWidth=this.outerWidth();
		var navControl=this.find('div.pointelle-slider-control');
		var navWrapper=this.find('.pointelle_nav_wrapper');
		var pointelleSlides=this.find('.pointelle_slides');
		var pointelleSlideri=this.find('.pointelle_slideri');
		var navMeta=this.find('.pointelle-meta');
		var navItem=this.find('.pointelle-slider-nav');
		var navTitle=this.find('.pointelle-slider-nav h'+options.navElement);
		var navArrows=this.find('.pointelle_nav_arrows');
		var navNext=this.find('.pointelle_nav_next');
		var navPrev=this.find('.pointelle_nav_prev');
		// woo responsive		
		var navprice=this.find('.woonavprice');
		var starrate=this.find('.rateitnav');
		var eventaddr=this.find('.event_addr');
		var eventaddrpin=this.find('.pointelle_eventaddr');
		var eventcat=this.find('.pointelle_eventcat_wrap');
		var eventnavdate=this.find('.event_navdate');
		
		if(options.navpos == "1"){
			this.find('.pointelle_nav_wrapper').css({"left":(options.slideWidth-2)+"px"});
		}else{
			this.find('.pointelle_nav_wrapper').css({"right":(options.slideWidth-2)+"px"});
		}
		//only big image visible
		
		if(wrapWidth<(options.slideWidth+options.navImgWidth))
		{
			eventaddr.hide();
			eventaddrpin.hide();
			eventcat.hide();
			eventnavdate.hide();
			navWrapper.css({'display':'none'});
			navControl.css({'display':'none'});
			navArrows.css({'display':'none'});
			pointelleSlides.css({'max-width':options.slideWidth,'width':'100%'});
			pointelleSlideri.each(function(idx,el){
				jQuery(el).css({'max-width':options.slideWidth,'width':'100%'});
				jQuery(el).find('.pointelle_slider_thumbnail,.pointelle-excerpt').css({'max-width':options.slideWidth,'width':'100%'});
// Removed height auto 
				if(jQuery(el).find('.pointelle_eshortcode').length > 0)
					jQuery(el).find('.pointelle_eshortcode').css({'max-width':options.slideWidth,'width':'100%','height':'auto'});
				jQuery(el).find('.pointelle-excerpt p').css('display','none');
				jQuery(el).find('.pointelle-excerpt h4 a').css('font-size',options.titleFsize+'px');
			});
			navNext.css({'max-width':'22px','max-height':'22px','background-size':'22px'});navPrev.css({'max-width':'22px','max-height':'22px','background-size':'22px'});
			var middleImgWid=pointelleSlides.width();
			var sliderHeight=( ( options.sliderHeight * middleImgWid ) /  options.slideWidth );
			this.height(sliderHeight);
			/* Added For Responsiveness navigation dots */
			this.find(".pointelle-nav").show();
			this.css("margin-bottom","30px");
			/* END For Responsiveness navigation dots */
		}
		//Navigation meta hidden but navigation images & title shown
		else if(wrapWidth<(options.slideWidth+options.navWidth)){
			navprice.hide();
			starrate.hide();
			eventnavdate.hide();
			var navW = (wrapWidth-options.slideWidth);
			if(options.navWidth <= navW) {
				var navTotalW=options.navWidth;
			} else {
				var navTotalW=navW;
			}
			if(options.disable_thumbs!='1') var minNavW=options.navImgWidth;
			else var minNavW=80;
			if(navTotalW >= minNavW) {
				navWrapper.css({'display':'block','width':(navTotalW+2)});
				navControl.css({'display':'block','width':(navTotalW)});
				navArrows.css({'display':'block'});
				/* Added For Responsiveness navigation dots */
				this.find(".pointelle-nav").hide();
				this.css({"margin-bottom":"auto"});
				/* END For Responsiveness navigation dots */
			} else {
				navWrapper.css({'display':'none'});
				navControl.css({'display':'none'});
				navArrows.css({'display':'none'});
				/* Added For Responsiveness navigation dots */
				this.find(".pointelle-nav").show();
				this.css({"margin-bottom":"30px"});
				/* END For Responsiveness navigation dots */
			}

			//if(pointelleSlideri.width() <= options.slideWidth && navTotalW >= minNavW) {
				if(options.disable_thumbs!='1'){
					if(navW > options.navImgWidth+100) {
						navTitle.css({'display':'block','max-width':navW-options.navImgWidth-50,'background':'none'});
						navItem.css({'width':'auto'});
						this.find(".pointelle_nav_thumb").css({"margin-left":"0","width":options.navImgWidth+"px","height":options.navImgHeight+"px"});
						
					} else {
						navTitle.css({'display':'none'});
						navItem.css({'width':navW-30});
						var marginL=(navW/4)-20;
						this.find(".pointelle_nav_thumb").css({"margin-left":marginL,"width":"100%","max-width":options.navImgWidth+"px","height":"auto"});
					}
				} else {
					if(navW > 60) {
						navTitle.css({'display':'block','max-width':navW-30,'background':'none'});
					} else {
						navTitle.css({'display':'none'});
					}
				}
			//}
			var navControlWidth=this.find('.pointelle-slider-control').outerWidth(true);
			navMeta.css({'display':'none'});
			var slideWid=options.slideWidth;
			pointelleSlides.css({'max-width':slideWid,'width':'100%'});
			pointelleSlideri.each(function(idx,el){
				jQuery(el).css({'max-width':slideWid,'width':'100%'});
				jQuery(el).find('.pointelle_slider_thumbnail,.pointelle-excerpt').css({'max-width':slideWid,'width':'100%'});
// Removed height auto
				if(jQuery(el).find('.pointelle_eshortcode').length > 0)
					jQuery(el).find('.pointelle_eshortcode').css({'max-width':slideWid,'width':'100%','height':'auto'});
				jQuery(el).find('.pointelle-excerpt p').css('display','block');

				jQuery(el).find('.pointelle-excerpt h4 a').css('font-size',options.titleFsize+'px');
			});
			this.height(options.sliderHeight);
			navNext.css({'max-width':options.navArrowSize+'px','max-height':options.navArrowSize+'px','background-size':options.navArrowSize+'px'});navPrev.css({'max-width':options.navArrowSize+'px','max-height':options.navArrowSize+'px','background-size':options.navArrowSize+'px'});
		}
		//Original settings
		else{
			eventaddr.show();
			eventaddrpin.show();
			navprice.show();
			starrate.show();
			eventcat.show();
			eventnavdate.show();
			navWrapper.css({'display':'block','width':options.navWidth+3});
			navControl.css({'display':'block','width':options.navWidth});
			navArrows.css({'display':'block'});
			navMeta.css('display','block');
			navItem.css({'width':'auto'});
			navTitle.css({'display':'block','max-width':'none','background':'auto'});
			var navControlWidth=this.find('.pointelle-slider-control').outerWidth(true);
			var slideWid;
			//if navigation is disabled
			if(navControlWidth==null)slideWid=options.slideWidth;
			else slideWid=wrapWidth-navControlWidth;
			pointelleSlides.css({'max-width':slideWid,'width':'100%'});
			pointelleSlideri.each(function(idx,el){
				jQuery(el).css({'max-width':slideWid,'width':'100%'});
				jQuery(el).find('.pointelle_slider_thumbnail').css({'max-width':slideWid,'width':'100%','height':options.imgHeight});
				if(jQuery(el).find('.pointelle_eshortcode').length > 0)	
					jQuery(el).find('.pointelle_eshortcode').css({'max-width':slideWid,'width':'100%','height':options.imgHeight});
				jQuery(el).find('.pointelle-excerpt').css({'max-width':slideWid,'width':'100%'});
				jQuery(el).find('.pointelle-excerpt p').css('display','block');
				jQuery(el).find('.pointelle-excerpt h4 a').css('font-size',options.titleFsize+'px');
			});
			this.height(options.sliderHeight);
			navNext.css({'max-width':options.navArrowSize+'px','max-height':options.navArrowSize+'px','background-size':options.navArrowSize+'px'});navPrev.css({'max-width':options.navArrowSize+'px','max-height':options.navArrowSize+'px','background-size':options.navArrowSize+'px'});
			/* Added For Responsiveness navigation dots */
			this.find(".pointelle-nav").hide();
			this.css({"margin-bottom":"auto","max-width":options.sliderWidth});
			/* END For Responsiveness navigation dots */
		}
		return this;
	};
	this.pointelleSliderSize();
	var self=this;
	//On Window Resize
	jQuery(window).resize(function() { 
		self.pointelleSliderSize();
	});
}
})(jQuery);
function onBeforePointelle(currSlideElement,nextSlideElement) { 
	/* ----------------------------------------------------
		Code for Iframe Auto Pause when moves to next slide
	---------------------------------------------------- */
	var allIframes = jQuery(currSlideElement).find("iframe");
	if(allIframes.length > 0) {
		jQuery(allIframes).each(function(index, elm) {
			var iframeHtml, prnt;
			iframeHtml = jQuery(this)[0].outerHTML.replace(/<iframe/,"<iframe").replace("</iframe>","</iframe>");
			prnt = jQuery(elm).parent();
			jQuery(elm).remove();
			prnt.html(iframeHtml);			
		});
	}
	/* ----------------------------------------------------
	END - Code for Iframe fix
	---------------------------------------------------- */
	var isImgAnimated,imgclasses,imgAnimationName;
	var img = jQuery(nextSlideElement).find(".pointelle_slider_thumbnail").attr("class");
	if(img != undefined) {
		imgclasses = img.split(" ");
		isImgAnimated = jQuery.inArray( "pointelle-animated", imgclasses );
		if(isImgAnimated != -1) {
			imgAnimationName = "";
			for(var i=isImgAnimated+1; i < imgclasses.length; i++)
				imgAnimationName += imgclasses[i]+" ";
			jQuery(nextSlideElement).find(".pointelle_slider_thumbnail").removeClass(imgAnimationName); 
			setTimeout(function() {
				jQuery(nextSlideElement).find(".pointelle_slider_thumbnail").addClass(imgAnimationName);
			} , 1); 
		}
	}
	var isTitleAnimated,titleclasses,titleAnimationName;
	var title = jQuery(nextSlideElement).find(".slider_htitle").attr("class");
	if(title != undefined) {
		titleclasses = title.split(" ");
		isTitleAnimated = jQuery.inArray( "pointelle-animated", titleclasses );
		if(isTitleAnimated != -1) {
			titleAnimationName = "";
			for(var i=isTitleAnimated+1; i < titleclasses.length; i++)
				titleAnimationName += titleclasses[i]+" ";
			jQuery(nextSlideElement).find(".slider_htitle").removeClass(titleAnimationName); 
			setTimeout(function() {
				jQuery(nextSlideElement).find(".slider_htitle").addClass(titleAnimationName);
			} , 1); 
		}
	}
	var isContentAnimated,contentclasses,contentAnimationName;
	var content = jQuery(nextSlideElement).find(".pointelle-content").attr("class");
	if(content != undefined) {
		contentclasses = content.split(" ");
		isContentAnimated = jQuery.inArray( "pointelle-animated", contentclasses );
		if(isContentAnimated != -1) {
			contentAnimationName = "";
			for(var i=isContentAnimated+1; i < contentclasses.length; i++)
				contentAnimationName += contentclasses[i]+" ";
			jQuery(nextSlideElement).find(".pointelle-content").removeClass(contentAnimationName); 
			setTimeout(function() {
				jQuery(nextSlideElement).find(".pointelle-content").addClass(contentAnimationName);
			} , 1); 
		}
	}
}
