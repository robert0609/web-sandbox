import e from"@babel/runtime-corejs3/core-js-stable/instance/for-each";import n from"@babel/runtime-corejs3/core-js-stable/instance/concat";import t from"@babel/runtime-corejs3/core-js-stable/instance/splice";import o from"@babel/runtime-corejs3/core-js-stable/instance/index-of";import r from"@babel/runtime-corejs3/helpers/toConsumableArray";import a from"@babel/runtime-corejs3/core-js-stable/map";import c from"@babel/runtime-corejs3/core-js-stable/object/create";function l(c){var l=c.addEventListener,i=c.removeEventListener,s=new a,u=function(e,r,a){var l,u=s.get(e);(u&&u.length&&-1!==o(u).call(u,r)&&t(u).call(u,o(u).call(u,r),1),"development"===process.env.NODE_ENV)&&console.warn(n(l="Call removeEventListener. eventName: ".concat(e,"; eventHandler: ")).call(l,r.toString()));return i.call(c,e,r,a)};return{hookAddEventListener:function(e,t,o){var a,i,u=s.get(e)||[];(s.set(e,n(a=[]).call(a,r(u),[t])),"development"===process.env.NODE_ENV)&&console.warn(n(i="Call addEventListener. eventName: ".concat(e,"; eventHandler: ")).call(i,t.toString()));return l.call(c,e,t,o)},hookRemoveEventListener:u,reset:function(){e(s).call(s,(function(n,t){var o;return e(o=r(n)).call(o,(function(e){return u(t,e)}))}))}}}function i(t){var o,r=new a,l=new a,i=new a,s=t,u=c(null);return{sandbox:new Proxy(u,{get:function(e,n){if(o){var t=o(s,n);if(void 0!==t)return t}return s[n]},set:function(e,o,a){if(l.has(o)?l.set(o,a):i.has(o)?i.set(o,a):Object.prototype.hasOwnProperty.call(s,o)?(r.set(o,s[o]),i.set(o,a)):l.set(o,a),s[o]=a,"development"===process.env.NODE_ENV){var c,u,v,d="";t instanceof Window?d="window":t instanceof Document?d="document":t instanceof HTMLElement&&(d=t.tagName),console.warn(n(c=n(u=n(v="Set ".concat(d,".")).call(v,o.toString()," to ")).call(u,a.toString(),"! Original value is ")).call(c,r.get(o)))}return!0},has:function(e,n){return n in s}}),reset:function(){e(l).call(l,(function(e,n){delete s[n]})),e(i).call(i,(function(e,n){s[n]=r.get(n)})),l.clear(),i.clear(),r.clear()},setGetProperty:function(e){o=e}}}var s={create:function(t){var o,r,a,c,s,u=i(window),v=i(window.document),d=i(window.document.body),m=(o=window,r=o.setInterval,a=o.setTimeout,c=[],s=[],{hookSetInterval:function(e,t){for(var o,a=arguments.length,c=new Array(a>2?a-2:0),l=2;l<a;l++)c[l-2]=arguments[l];var i=r.apply(void 0,n(o=[e,t]).call(o,c));return s.push(i),"development"===process.env.NODE_ENV&&console.warn("Call setInterval. intervalId: ".concat(i)),i},hookSetTimeout:function(e,t){for(var o,r=arguments.length,l=new Array(r>2?r-2:0),i=2;i<r;i++)l[i-2]=arguments[i];var s=a.apply(void 0,n(o=[e,t]).call(o,l));return c.push(s),"development"===process.env.NODE_ENV&&console.warn("Call setTimeout. timerId: ".concat(s)),s},reset:function(){e(c).call(c,(function(e){o.clearTimeout(e),"development"===process.env.NODE_ENV&&console.warn("ClearTimeout. timerId: ".concat(e))})),e(s).call(s,(function(e){o.clearInterval(e),"development"===process.env.NODE_ENV&&console.warn("ClearInterval. intervalId: ".concat(e))}))}}),f=l(window),p=l(window.document),w=l(window.document.body);return u.setGetProperty((function(e,n){return"top"===n||"window"===n||"self"===n?u.sandbox:"document"===n?v.sandbox:"setInterval"===n?m.hookSetInterval:"setTimeout"===n?m.hookSetTimeout:"addEventListener"===n?f.hookAddEventListener:"removeEventListener"===n?f.hookRemoveEventListener:void 0})),v.setGetProperty((function(e,n){return"body"===n?d.sandbox:"addEventListener"===n?p.hookAddEventListener:"removeEventListener"===n?p.hookRemoveEventListener:void 0})),d.setGetProperty((function(e,n){return"addEventListener"===n?w.hookAddEventListener:"removeEventListener"===n?w.hookRemoveEventListener:void 0})),{mount:function(){return new Function("window","document","setInterval","setTimeout","return ".concat(t)).call(u.sandbox,u.sandbox,v.sandbox,m.hookSetInterval,m.hookSetTimeout)},unmount:function(){var n;e(n=[u,v,d,m,f,p,w]).call(n,(function(e){e.reset()}))}}}};export default s;
