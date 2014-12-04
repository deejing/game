/* */
var b2d = {
    b2Vec2 :            Box2D.Common.Math.b2Vec2,
    b2BodyDef :         Box2D.Dynamics.b2BodyDef,
    b2Body :            Box2D.Dynamics.b2Body,
    b2FixtureDef :      Box2D.Dynamics.b2FixtureDef,
    b2Fixture :         Box2D.Dynamics.b2Fixture,
    b2World :           Box2D.Dynamics.b2World,
    b2PolygonShape :    Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape :     Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw :       Box2D.Dynamics.b2DebugDraw
},
SCALE = 60,
stage, world;



(function ( global, cjs, undefined ) {

    function Ball ( src, rad, x, y ) {
        this.view = new cjs.Bitmap( src );
        this.view.regX = this.view.regY = rad;

        var fixDef = new b2d.b2FixtureDef();
        fixDef.density = 5.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.8;

        var bodyDef = new b2d.b2BodyDef();
        bodyDef.type = b2d.b2Body.b2_dynamicBody;
        bodyDef.position.x = x / SCALE;
        bodyDef.position.y = y;

        fixDef.shape = new b2d.b2CircleShape( rad / SCALE);

        this.view.body = world.CreateBody( bodyDef );
        this.view.body.CreateFixture( fixDef );

        this.view.onTick = tick;
    }

    function tick ( e ) {
        this.x = this.body.GetPosition().x * SCALE;
        this.y = this.body.GetPosition().y * SCALE;
        this.rotation = this.body.GetAngle() * (180/Math.PI);
    }

    global.Ball = Ball;
})( this, createjs);


(function( $, doc, cjs, Box2D, global, undefined ) {

    function setRandom( min, max ) {
        return (Math.random() * (max - min)) + min;
    }

    function init() {

        stage = new cjs.Stage( document.getElementById('test-panel') );

        setupPhysics();

        stage.onMouseDown = function () {

            var deejing = new Ball( 'games/gfx/_test/deejing.png', 30, this.mouseX, 0 );

            stage.addChild( deejing.view );
        }

        cjs.Ticker.addListener( this );
        cjs.Ticker.setFPS( 60 );
        cjs.Ticker.useRAF =  true ;
    }

    function setupPhysics() {
        world = new b2d.b2World( new b2d.b2Vec2(0, 50), true); // gravity

        // ground
        var fixDef = new b2d.b2FixtureDef();
        fixDef.density = 1;
        fixDef.friction = 0.5;

        var bodyDef = new b2d.b2BodyDef();
        bodyDef.type = b2d.b2Body.b2_staticBody;
        bodyDef.position.x = 400 / SCALE;
        bodyDef.position.y = 480 / SCALE;

        fixDef.shape = new b2d.b2PolygonShape();
        fixDef.shape.SetAsBox( 400 / SCALE,  20 / SCALE );

        world.CreateBody( bodyDef ).CreateFixture( fixDef );

        // debug draw
        var debDraw = new b2d.b2DebugDraw();
        debDraw.SetSprite( stage.canvas.getContext('2d') );
        debDraw.SetDrawScale( SCALE );
        debDraw.SetFlags( b2d.b2DebugDraw.e_shapeBit | b2d.b2DebugDraw.e_jointBit );
        world.SetDebugDraw( debDraw );
    }

    function tick() {
        stage.update();
        //world.DrawDebugData();
        world.Step( 1/60, 10, 10);
        world.ClearForces();
    }


    $(doc).ready(function() {
        if($('#test-panel').length > 0) {
            init();
            global.tick = tick;
        }
    });

})( jQuery, document, createjs, Box2D, this );
