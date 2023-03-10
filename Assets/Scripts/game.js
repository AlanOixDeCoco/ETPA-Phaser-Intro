var config = {
    type: Phaser.AUTO,
    width: 480, height: 320,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 981 }, // 9,81 m.s-2 sur Terre
            debug: false
        }
    },
    render: {
        antialias: false
    },
    scene: {preload: preload, create: create, update: update },
};
    
var game = new Phaser.Game(config);



function preload(){
    // Sprites
    this.load.image('sky', 'Assets/Sprites/sky.png');
    this.load.image('ground', 'Assets/Sprites/platform.png');
    this.load.image('star', 'Assets/Sprites/star.png');
    this.load.image('bomb', 'Assets/Sprites/bomb.png');
    this.load.spritesheet('perso','Assets/Sprites/perso.png', { frameWidth: 32, frameHeight: 48 });

    // Bitmap Fonts
    this.load.bitmapFont('CursedScript', 'Assets/Fonts/CursedScript.png', 'Assets/Fonts/CursedScript.fnt');
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
    titleText = this.add.bitmapText(10, 0, 'CursedScript', 'Game Title', 36).setTint(0x000000);
    scoreText = this.add.bitmapText(10, 36, 'CursedScript', 'Score: 0', 24).setTint(0xFFFF00);
    deltaTimeText = this.add.bitmapText(10, 60, 'CursedScript', 'Delta Time: ', 12).setTint(0xFFFFFF);
    fpsText = this.add.bitmapText(10, 72, 'CursedScript', 'FPS: ', 12).setTint(0xFFFFFF);

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

    if (cursors.left.isDown){ //si la touche gauche est appuy??e
        player.setVelocityX(-160); //alors vitesse n??gative en X
        player.anims.play('left', true); //et animation => gauche
    }
    else if (cursors.right.isDown){ //sinon si la touche droite est appuy??e
        player.setVelocityX(160); //alors vitesse positive en X
        player.anims.play('right', true); //et animation => droite
    }
    else{ // sinon
        player.setVelocityX(0); //vitesse nulle
        player.anims.play('turn'); //animation fait face cam??ra
    }
    if (cursors.up.isDown && player.body.touching.down){
        //si touche haut appuy??e ET que le perso touche le sol
        player.setVelocityY(-330); //alors vitesse verticale n??gative
        //(on saute)
    }

    // Stats
    deltaTime = time - lastFrameTime;
    lastFrameTime = time;
    deltaTimeText.setText(`Delta Time: ${Number.parseFloat(deltaTime).toFixed(2)}ms`);
    fpsText.setText(`FPS: ${Number.parseFloat(1/(deltaTime/1000)).toFixed()}`);
}

function CollectStar(player, star){
    star.disableBody(true, true); // l?????toile dispara??t
    score += 10; //augmente le score de 10
    scoreText.setText(`Score: ${score}`); //met ?? jour l???affichage du score

    if (stars.countActive(true) === 0){// si toutes les ??toiles sont prises
        // on les affiche toutes de nouveau
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        // si le perso est ?? gauche de l?????cran, on met une bombe ?? droite
        // si non, on la met ?? gauche de l?????cran
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');

        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false; //elle n???est pas soumise ?? la gravit??
    }
}

function HitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}