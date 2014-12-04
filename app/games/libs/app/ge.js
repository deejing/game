(function ( win, doc, global, undefined ) {

    "use strict";

    var Ge = Class.extend({
        version : 1.0,
        map     : null,
        init : function () {
            console.log( 'init game version: ' + this.version );
        },
        getVersion : function () {
            return this.version;
        },
        getTileSourceMap : function ( width, height, tilewidth, tileheight )
        {
            var src = [];

            for ( var y = 0; y < Math.floor( height / tileheight ); y++ )
            {
                for ( var x = 0; x < Math.floor( width / tilewidth ); x++ )
                {
                    src[ src.length ] = { x : x*tilewidth, y : y*tileheight };
                }
            }
            return src;
        }
    });

    global.Ge = Ge;

})( window, document, this );
