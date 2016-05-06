/**
 * Created by chenjianhui on 16/3/17.
 * url:加载页面的地址,可以是静态页面地址,或者是后台action请求
 * params向后台传送的参数
 * callback 回调方法
 * sign,异步标志,异步标识标示如果在加载页面过程中进行了触发.将异步标识的cancle置为false,就会不再append数据,如果异步标示为空,则方法内部自行创造一个无法进行设置的标识
 *  AsynSignal = function () {
    }

 AsynSignal.prototype = {
        canceled: false,
        cancel: function () {
            this.canceled = true;
        }
    }
 *
 */
;(function($){
    $.fn.AjaxUpdate = function( url, params, callback ,sign) {
        if ( typeof url !== "string" && _load ) {
            return _load.apply( this, arguments );
        }

        var selector, response, type,_sign,
            self = this,
            off = url.indexOf(" ");

        if ( off >= 0 ) {
            selector = url.slice( off, url.length );
            url = url.slice( 0, off );
        }
        if(!$.isFunction( callback )){
            _sign = callback;
        }

        if(!_sign){
            //如果异步标示为空
            var AsynSignal = function(){};

            AsynSignal.prototype = {
                canceled: false,
                cancel: function () {
                    this.canceled = true;
                }
            }
           _sign = new AsynSignal();
        }

        // If it's a function
        if ( $.isFunction( params ) ) {

            // We assume that it's the callback
            callback = params;
            params = undefined;

            // Otherwise, build a param string
        } else if ( params && typeof params === "object" ) {
            type = "POST";
        }


        // If we have elements to modify, make the request
        if ( self.length > 0 ) {
            $.ajax({
                url: url,

                // if "type" variable is undefined, then "GET" method will be used
                type: type,
                dataType: "html",
                data: params,
                cache:false
            }).done(function( responseText ) {
                if(_sign.canceled) {
//					_sign.canceled = false;
                    return;
                }
                // Save response for use in complete callback
                response = arguments;

                ////页面的script
                //var scriptMap = $("script");
                //
                //var reg = /<script(?:\s+[^>]*)?>(.*?)<\/script\s*>/ig;
                //var scripts = responseText.match(reg);
                //console.log("script:"+scripts.length);
                //
                //for(var x = 0 ; x < scripts.length;x++ ){
                //	var now_load = scripts[x];
                //	for(var y=0;y< scriptMap.length ;y++ ){
                //		var already_load = scriptMap[y].src;
                //		if(already_load.src != "" && now_load != "" && now_load.indexOf(already_load.substr(already_load.lastIndexOf("/")*1+1)) >= 0){
                //			responseText = responseText.replace(now_load,"");
                //			console.log("loaded");
                //			break;
                //		}
                //	}
                //}

                self.html( selector ?

                    // If a selector was specified, locate the right elements in a dummy div
                    // Exclude scripts to avoid IE 'Permission Denied' errors
                    $("<div>").append( $.parseHTML( responseText ) ).find( selector ) :

                    // Otherwise use the full result
                    responseText );

            }).complete(!_sign.canceled && callback && function( jqXHR, status ) {
                self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
            });
        }
        return this;
    };
})(jQuery)