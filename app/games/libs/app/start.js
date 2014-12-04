;(function ($, doc, win, global, undefined) {
    'use strict';

    var stage, offset, map, data, info, fpsInfo = 'FPS', manifest = [], fpsCount = 0,
        jsonSrc = 'games/fields/map-01.json', mousedown = false, loaded = 0,
        gameWidth = 980, gameHeight = 700;

    function onFileLoad() {
        loaded++;
        console.log('load');
    }

    function onComplete() {
        if ( loaded === manifest.length )
        {
            // map initialisieren
            map = new Map(data);

            map.onReady(function () {

                var layer1 = this.layers[0].canvasContainer,
                    layer2 = this.layers[1].canvasContainer,
                    layer3 = this.layers[2].canvasContainer;

                // cache map data
                this.updateCache();
                this.cacheMap();


                stage.addChild( layer1, layer2, layer3 );

                createjs.Ticker.addListener( win );
                createjs.Ticker.useRAF = true;
                createjs.Ticker.setFPS( 100 );

                $('#panel').fadeIn(500);
            });
        }
    }

    function preloader() {
        var loader;
        loader              = new createjs.PreloadJS();
        loader.useXHR       = false;
        loader.onFileLoad   = onFileLoad;
        loader.onComplete   = onComplete;
        loader.loadManifest(manifest);
    }

    function init() {
       var panel = $('<canvas/>'),
            width = gameWidth,
            height = gameHeight;

        initFps();
        info = $('.fps');

        panel.attr({
            'id': 'panel',
            'width': width,
            'height': height
        }).prependTo($('#canvas-panel'));

        stage   = new createjs.Stage(panel[0]);
        offset  = new createjs.Point();

        // dragg map
        panel.on("mousedown", startDrag)
            .on("mouseup", function(e) {
                mousedown = false;
            });

        $('#canvas-panel').css({
            "width" : gameWidth,
            "height" : gameHeight
        });

        loadManifest();
    }

    function loadManifest() {
        // hier wird die Bilder aus test-map.json in createjs Manifest hinzugefuegt
        $.getJSON(jsonSrc, function (d) {
            data = d;
            _(d.tilesets).each(function( tile, i ) {
                manifest[ manifest.length ] = { src : tile.image, id : tile.name };
            });
            preloader();
        });
    }

    function initFps() {
        setInterval( function() {
            fpsInfo = 'FPS: '+(fpsCount / 2 );
            fpsCount = 0;
        }, 2000);
    };

    // game loop
    function tick( e ) {
        info.html( fpsInfo );
        fpsCount++;
        stage.update();
    }

    // dragg Map
    function startDrag( e ) {
        var layer1 = map.layers[0].canvasContainer;

        offset.x    = (stage.mouseX - layer1.x);
        offset.y    = (stage.mouseY - layer1.y);
        mousedown   = true;

        $(this).on("mousemove", onDrag);
    }

    function onDrag( e ) {
        if (mousedown === true ) {
            var x, y;
            if ( e.offsetX !== undefined )
            {
                x = e.offsetX - offset.x;
                y = e.offsetY - offset.y;
            }
            else {
                x = (e.pageX- $(this).offset().left) - offset.x;
                y = (e.pageY- $(this).offset().top) - offset.y;
            }

            x = Math.round(x);
            y = Math.round(y);

            //set map position
            map.updateMap(x, y);
        }
    }

    $(doc).ready(function() {

        if($('[data-content="test-content"]').length <= 0) {
            // test load map
            $('#maps').on('change', function(e) {
                $('#panel').fadeOut(200);
                manifest = [];
                loaded = 0;
                map = null;

                var currentMap = $(this).val();

                jsonSrc = 'games/fields/'+currentMap;

                stage.removeAllChildren();

                loadManifest();
            });

            init();
            global.tick = tick;
        }
    });

})(jQuery, document, window, this);
