/* */
var Ge = Ge || {};
(function ( win, doc, Ge, createjs, global, undefined ) {

    "use strict";

    var Map = Ge.extend({
        mapData     : null,
        width       : 0,
        height      : 0,
        tile        : { width: 0, height: 0 },
        map         : { width: 0, height: 0 },
        ready       : false,
        container   : null,
        collision   : [],
        layers      : [],
        totalTile   : 0,
        resourceMap : [],
        tileResource : [],
        init : function ( mapData )
        {
            this.mapData = mapData;
            this.tile = {
                width   : this.mapData.tilewidth,
                height  : this.mapData.tileheight
            };

            this.map = {
                width   : this.mapData.width,
                height  : this.mapData.height,
            };
            this.width = ( this.mapData.width * this.mapData.tilewidth);
            this.height = ( this.mapData.height * this.mapData.tileheight);
            this.tileResource = this.mapData.tilesets;

            this.container = new createjs.Container();
            this.getTileResourceMap();

            this.setLayerData();
            this.getTotalTile();

            this.setTiles();

        },
        getTileResourceMap : function ()
        {
            this.resourceMap = _.map(this.tileResource, function( data ) {
                return data.firstgid;
            });

            var $this = this;

            this.tileResource = _.map(this.tileResource, function( data ) {
                data.tilesource = $this.getTileSourceMap( data.imagewidth, data.imageheight, $this.tile.width, $this.tile.height);
                return data;
            });
        },
        getTileResource : function ( id )
        {
            var map     = this.resourceMap,
                value   = null;

            for(var i = 0; i < map.length; i++)
            {
                var gid = map[i],
                    min = gid,
                    max = ( map[i+1] !== undefined ) ? map[i+1] : 9999999;

                if (min <= id && id+1 <= max )
                {
                    value = i;
                    break;
                }
            }
            return value;
        },
        getTileResourceData : function ( index )
        {
            return this.tileResource[index];
        },
        setLayerData : function ()
        {
            this.layers = [];
            if( this.mapData.layers !== undefined )
            {
                for( var i = 0; i < this.mapData.layers.length; i++ )
                {
                    var layer = this.mapData.layers[i];

                    if ( layer.data !== undefined )
                    {
                        layer.dataGrid = this.getMapGridArray( layer.data );

                        if( layer.name === 'collision' )
                        {
                            this.collision = layer.dataGrid;
                        }
                        else
                        {
                            this.layers[  this.layers.length ] = layer;
                        }
                    }
                }
            }
        },
        getMapGridArray : function ( data )
        {
            var i = 0, mapGrid = [];

            for( var y = 0; y < this.map.height; y++ )
            {
                mapGrid[ y ] = [];
                for( var x = 0; x < this.map.width; x++ )
                {
                    mapGrid[ y ][ mapGrid[ y ].length ] = data[i];
                    i++;
                }
            }

            return mapGrid;
        },
        getTotalTile : function ()
        {
            this.totalTile = (this.map.width * this.map.height) * this.layers.length;
        },
        setTiles : function ()
        {
            var count = 0, tileResource, tileSource;

            for ( var z = 0; z < this.layers.length; z++)
            {

                var mX = 0,
                    mY = 0,
                    wide = 0,
                    layer = this.layers[ z ],
                    tmpId = -1,
                    container = new createjs.Container(), firstgid;

                for( var y = 0; y < this.map.height; y ++)
                {
                    for( var x = 0; x < this.map.width; x ++)
                    {
                        var gid     = layer.dataGrid[y][x],
                            gridID  = gid-1;

                        if( gridID > -1 )
                        {
                            var rGid    = this.getTileResource(gid);

                            if ( rGid !== tmpId ) {
                                tmpId           = rGid;

                                tileResource    = this.getTileResourceData(rGid);
                                firstgid        = tileResource.firstgid;
                                tileSource      = tileResource.tilesource;
                            }

                            var tileIndex = ((gid-firstgid));

                            if ( tileSource[tileIndex] != undefined )
                            {
                                var img = new createjs.Bitmap( tileResource.image );

                                img.sourceRect = {
                                    x       : tileSource[tileIndex].x,
                                    y       : tileSource[tileIndex].y,
                                    width   : this.tile.width,
                                    height  : this.tile.height
                                };

                                img.x = x*this.tile.width;
                                img.y = y*this.tile.height;
                                container.addChild( img );
                            }
                        }
                        count++;
                    }
                }
                this.layers[ z ].canvasContainer = container;
            }
            if( count === this.totalTile )
            {
                this.ready = true;
            }
        },
        cacheMap : function ()
        {
            for (var i = 0; i < this.layers.length; i++ )
            {
                var layer = this.layers[i].canvasContainer;
                layer.cache( 0, 0, this.width, this.height );
            }
        },
        updateCache : function ()
        {
            for (var i = 0; i < this.layers.length; i++ )
            {
                var layer = this.layers[i].canvasContainer;
                layer.cache( 0, 0, this.width, this.height );
                layer.updateCache();
            }
        },
        updateMap : function (x, y)
        {
            for (var i = 0; i < this.layers.length; i++ )
            {
                var layer = this.layers[i].canvasContainer;

                layer.x = x;
                layer.y = y;
            }
        },

        onReady : function ( callback ) {
            var $this = this;
            var mapTimer = setInterval(function() {
                if( $this.ready === true )
                {
                    callback.call($this);
                    clearInterval( mapTimer );
                }
            }, 100);
        }
    });

    global.Map = Map;

})( window, document, Ge, createjs, this );
