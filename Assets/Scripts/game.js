var config = {
    type: Phaser.AUTO,
    width: 256, height: 192,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    render: {
        antialias: false
    },
    scene: {preload: preload, create: create, update: update },
};
    
var game = new Phaser.Game(config);



function preload(){
    this.load.image('sky', 'Assets/Sprites/sky.png');
    this.load.image('ground', 'Assets/Sprites/platform.png');
    this.load.image('star', 'Assets/Sprites/star.png');
    this.load.image('bomb', 'Assets/Sprites/bomb.png');
    this.load.spritesheet('perso','Assets/Sprites/perso.png',
    { frameWidth: 32, frameHeight: 48 });
}

var platforms;
var player;
var cursors;

var stars;
var score = 0;
var scoreText;

var gameOver = false;

var lastFrameTime = 0;
var deltaTime = 0;

function create (){
    // Inputs
    cursors = this.input.keyboard.createCursorKeys();

    // Background
    sky = this.add.image(128, 96, 'sky', );
    sky.setScale(0.35)

    // UI
    scoreText = this.add.text(4, 4, 'Score: 0', {fontSize:"12px", fill:"#000"});
    deltaTimeText = this.add.text(4, 32, 'Delta Time: ', {fontSize:"12px", fill:"#000"});
    fpsText = this.add.text(4, 48, 'FPS: ', {fontSize:"12px", fill:"#000"});

    // Props
    stars = this.physics.add.group({
        key: 'star', repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    // Platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Player
    player = this.physics.add.sprite(100, 450, 'perso');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('perso', {start:0,end:3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'perso', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('perso', {start:5,end:8}),
        frameRate: 10,
        repeat: -1
    });
    
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, CollectStar, null, this);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, HitBomb, null, this);
}

function update(time){
    if (gameOver){return;}

    if (cursors.left.isDown){ //si la touche gauche est appuyée
        player.setVelocityX(-160); //alors vitesse négative en X
        player.anims.play('left', true); //et animation => gauche
    }
    else if (cursors.right.isDown){ //sinon si la touche droite est appuyée
        player.setVelocityX(160); //alors vitesse positive en X
        player.anims.play('right', true); //et animation => droite
    }
    else{ // sinon
        player.setVelocityX(0); //vitesse nulle
        player.anims.play('turn'); //animation fait face caméra
    }
    if (cursors.up.isDown && player.body.touching.down){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-330); //alors vitesse verticale négative
        //(on saute)
    }

    // Stats
    deltaTime = time - lastFrameTime;
    lastFrameTime = time;
    deltaTimeText.text = `Delta Time: ${Number.parseFloat(deltaTime).toFixed(2)}ms`;
    fpsText.text = `FPS: ${Number.parseFloat(1/(deltaTime/1000)).toFixed()}`;
}

function CollectStar(player, star){
    star.disableBody(true, true); // l’étoile disparaît
    score += 10; //augmente le score de 10
    scoreText.setText(`Score: ${score}`); //met à jour l’affichage du score

    if (stars.countActive(true) === 0){// si toutes les étoiles sont prises
        // on les affiche toutes de nouveau
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        // si le perso est à gauche de l’écran, on met une bombe à droite
        // si non, on la met à gauche de l’écran
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');

        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false; //elle n’est pas soumise à la gravité
    }
}

function HitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}