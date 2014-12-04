(function ( $, win, doc, global, undefined ) {

    var stage, panel, offset, map, data, info, fpsInfo = 'FPS', manifest = [], fpsCount = 0,
        jsonSrc = 'games/fields/map-01.json', mousedown = false, loaded = 0,
        gameWidth = 980, gameHeight = 700;

    var player, endX, endY,
        playerX = 0, playerY = 0,
        playerSpeed = 160,
        lastX = 0,
        lastY = 0,
        key_frame = 'stand_down',
        scale = 1,
        viewX   = 0,
        viewY   = 0,
        mapGrid = [], //
        mouse,
        mouseX,
        mouseY,
        pointer,
        ezStar, acceptTile = [0], buffer, overlayer_buffer,

        sprite, mouseSprite;

    // add sprite to manifest
    manifest = [
        { src : 'games/gfx/02.png', id : 'player' },
        { src : 'games/gfx/mouse.png', id: 'mouse'}
    ];

    function init()
    {
        panel = $('<canvas/>');

        var width = gameWidth,
            height = gameHeight;

        initFps();
        info = $('.fps');

        panel.attr({
            'id': 'panel',
            'width': width,
            'height': height
        }).prependTo($('#canvas-panel-astar'));

        stage   = new createjs.Stage(panel[0]);
        offset  = new createjs.Point();

        // aStar
        ezStar  = new EasyStar.js( acceptTile, onFindPath);

        // dragg map
        /*panel
        .on("mousedown", startDrag)
        .on("mouseup", function(e) {
            mousedown = false;
        });*/

        $('#canvas-panel-astar').css({
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

    function preloader() {
        var loader;
        loader              = new createjs.PreloadJS();
        loader.useXHR       = false;
        loader.onFileLoad   = onFileLoad;
        loader.onComplete   = onComplete;
        loader.loadManifest(manifest);
    }

    function onFileLoad() {
        loaded++;
    }

    function onComplete() {
        if ( loaded === manifest.length ) {
            // map initialisieren
            map = new Map(data);

            map.onReady(function () {

                var layer1 = this.layers[0].canvasContainer,
                    layer2 = this.layers[1].canvasContainer,
                    layer3 = this.layers[2].canvasContainer,
                    collision = this.collision;

                playerX = 12;
                playerY = 10;

                // cache map data
                this.updateCache();
                this.cacheMap();

                // init sprite
                setSprite();

                // init collisions
                setCollition();

                // init player
                setPlayer();
                setBuffer();

                // init mouse
                setMouse();
                setMousePointer();

                _onClick();
                _mouseMove();

                // add layer to stage
                stage.addChild( layer1, layer2, buffer, layer3, overlayer_buffer );

                createjs.Ticker.addListener( win );
                createjs.Ticker.useRAF = true;
                createjs.Ticker.setFPS( 100 );

                $('#panel').fadeIn(500);
            });
        }
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
            if ( e.offsetX !== undefined ) {
                x = e.offsetX - offset.x;
                y = e.offsetY - offset.y;
            }
            else {
                x = (e.pageX- $(this).offset().left) - offset.x;
                y = (e.pageY- $(this).offset().top) - offset.y;
            }

            x = Math.round(x);
            y = Math.round(y);

            viewX = x;
            viewY = y;

            //set map position
            map.updateMap(x, y);

            buffer.x = x;
            buffer.y = y;

        }
    }

    /**
     * sprite
     */
    function setSprite() {
        sprite = new createjs.SpriteSheet({
            'images' : ['games/gfx/02.png'],
            'frames' : {
                'regX' : 0,
                'regY' : 0,
                'width' : 32,
                'height' : 48,
                'count' : 48
            },
            'animations' : {
                'up' : [12, 15, 'up', 4],
                'stand_up' : [12],
                'down' : [0, 3, 'down', 4],
                'stand_down' : [0],
                'left' : [4, 7, 'left', 4],
                'stand_left' : [4],
                'right' : [8, 11, 'right', 4],
                'stand_right' : [8]
            }
        });

        mouseSprite = new createjs.SpriteSheet({
            'images' : ['games/gfx/mouse.png'],
            'frames' : {
                'regX' : 0,
                'regY' : 0,
                'width' : 32,
                'height' : 32,
                'count' : 4
            },
            'animations' : {
                'mouse' : [0,1,'mouse', 10],
                'pointer' : [2,3,'pointer', 10]
            }
        });
    };


    /**
     * Player
     */
    function setPlayer() {
        player = new createjs.BitmapAnimation(sprite);
        player.x = (playerX*map.tile.width);
        player.y = ((playerY*map.tile.height)-32);
        player.scaleX = player.scaleY = scale;
        player.gotoAndPlay( key_frame );
    }

    function setBuffer() {
        buffer = new createjs.Container();
        overlayer_buffer = new createjs.Container();
        buffer.addChild( player )
        buffer.localToGlobal (-150, -150);
        overlayer_buffer.localToGlobal (-150, -150);
    }

    /**
     *
     */
    function setMouse() {
        mouse = new createjs.BitmapAnimation(mouseSprite);
        mouse.x = mouseX;
        mouse.y = mouseY;
    }

    function setMousePointer() {
        pointer = new createjs.BitmapAnimation(mouseSprite);
    }

    /**
     * aStar
     */

    function movePlayerTo( path ) {
        if (path.length === 0) {
            var idle = key_frame;
            switch ( key_frame ) {
                case 'left':
                    idle = 'stand_left';
                break;
                case 'right':
                    idle = 'stand_right';
                break;
                case 'up':
                    idle = 'stand_up';
                break;
                case 'down':
                    idle = 'stand_down';
                break;
            }
            player.gotoAndPlay( idle );
            buffer.removeChild( pointer );
            return;
        }

        playerX = path[0].x;
        playerY = path[0].y;

        var x = (playerX*map.tile.width),
            y = ((playerY*map.tile.height)-16);

        createjs.Tween.get( player ).to({
                x: x,
                y: y
            },
            playerSpeed,
            createjs.Ease.easeNone
        ).call(function() {
            lastX = playerX;
            lastY = playerY;
            path.shift();
            movePlayerTo( path );
        });

        if( playerX === lastX && playerY < lastY ) {
            key_frame = 'up';
        }
        else if ( playerX === lastX && playerY > lastY ) {
            key_frame = 'down';
        }
        if( playerY === lastY && playerX < lastX ) {
            key_frame = 'left';
        }
        else if ( playerY === lastY && playerX > lastX ) {
            key_frame = 'right';
        }

        player.gotoAndPlay( key_frame );
    }

    function setCollition() {
        ezStar.setGrid( map.collision );
    }

    function calculatePath() {
        ezStar.calculate();
        setTimeout(calculatePath, 1000);
    }

    function onFindPath( path ) {

        // console.log( 'path', path );

        if( path === null ) {
            buffer.removeChild( pointer );
        }
        else {
            createjs.Tween.removeTweens( player );
            movePlayerTo( path );
        }
    }

    function findPath() {
        ezStar.setPath( playerX, playerY, endX, endY );
        calculatePath();
    }

    function _onClick() {
        panel.on('click', function ( e ) {
            endX = Math.ceil( (e.offsetX) / (map.tile.width)) -1;
            endY = Math.ceil( (e.offsetY) / (map.tile.height)) -1;

            pointer.x = endX*map.tile.width;
            pointer.y = endY*map.tile.height;
            pointer.gotoAndPlay( 'pointer' );

            buffer.addChild( pointer );
            findPath();
        });
    };

    function _mouseMove() {
        var enter = false;
        panel.on({
            'mouseenter' : function() {
                if( enter === false ) {
                    mouse.gotoAndPlay( 'mouse' );
                    overlayer_buffer.addChild(mouse);
                    enter = true;
                }
            },
            'mouseleave' : function () {
                overlayer_buffer.removeChild( mouse )
                enter = false;
            },
            'mousemove' : function ( e ) {
                var x = Math.ceil( (e.offsetX) / (map.tile.width)) -1,
                    y = Math.ceil( (e.offsetY) / (map.tile.height)) -1;
                x *= map.tile.width;
                y *= map.tile.height;
                mouseX = x;
                mouseY = y;
                mouse.x = mouseX;
                mouse.y = mouseY;
            }
        });
    }

    $(doc).ready(function() {
        if($('#canvas-panel-astar').length > 0) {
            init();
            global.tick = tick;
        }
    });

})( jQuery, window, document, this );
