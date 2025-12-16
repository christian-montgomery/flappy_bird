let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("road", "assets/road.png");
    this.load.image("column", "assets/column.png");
    this.load.spritesheet("bird", "assets/bird.png", {
        frameWidth: 64,
        frameHeight: 96,
    });
}

let bird;
let hasLanded = false;
let hasBumped = false;
let cursors;
let pipes;
let isGameStarted = false;
let messageToPlayer;
let score = 0;
let scoreText;
let gameOverMessage;
let isGameOver = false;

function create() {
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);

    const roads = this.physics.add.staticGroup();
    const road = roads.create(400, 568, "road").setScale(2).refreshBody();

    bird = this.physics.add.sprite(50, 50, "bird").setScale(2);
    bird.setVelocityY(-350);
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();

    this.physics.add.collider(bird, road, () => {
        hasLanded = true;
    });
    this.physics.add.collider(bird, pipes, () => {
        hasBumped = true;
    });

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "32px",
        fill: "#fff"
    });

    messageToPlayer = this.add.text(
        0,
        0,
        `Press space bar to start`,
        {
            fontFamily: `"Comic Sans MS", Times, serif`,
            fontSize: "20px",
            color: "white",
            backgroundColor: "black",
        }
    );

    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);

    this.time.addEvent({
        delay: 1500,
        callback: spawnPipes,
        callbackScope: this,
        loop: true,
    });

    this.input.keyboard.on("keydown-SPACE", () => {
        if (!hasLanded && !hasBumped) {
            isGameStarted = true;
            bird.setVelocityY(-250);
        }
    });

    this.input.keyboard.on("keydown-ENTER", () => {
        if (isGameOver) {
            restartGame.call(this);
        }
    });

}

function update() {
    if (!isGameStarted || hasLanded || hasBumped) {
        bird.setVelocityX(0);
    }

    bird.x = 200;

    pipes.getChildren().forEach((pipe) => {
        if (pipe.x < -50) {
            pipe.destroy();
        }

        if (!hasLanded && !hasBumped &&
            pipe.isBottom &&
            !pipe.scored &&
            pipe.x < bird.x) {
            score += 1;
            scoreText.setText(`Score: ${score}`);
            pipe.scored = true;
        }
    });

    if (bird.body.velocity.y > 400) {
        bird.setAngle(90);
        bird.setVelocityY(400);
    } else {
        bird.setAngle(-20);
    }

    if ((hasLanded || hasBumped) && !isGameOver) {
        isGameOver = true;
        this.physics.pause();
        bird.setTint(0xff0000);
        gameOverMessage = this.add.text(
            0, 
            0,
            `Game Over! Final Score: ${score}\nPress Enter to Restart`,
        {
            fontFamily: `"Comic Sans MS", Times, serif`,
            fontSize: "40px",
            color: "white",
            backgroundColor: "black",
        });

        Phaser.Display.Align.In.Center(gameOverMessage, this.add.zone(400, 300, 800, 600));

        isGameStarted = false;
    }

    if (isGameStarted) {
        messageToPlayer.setVisible(false);
    }
}

function spawnPipes() {
    const gap = 160;
    const centerY = Phaser.Math.Between(200, 400);

    const topPipe = pipes.create(800, centerY - gap/4, "column")
        .setOrigin(0.5, 1)
        .setImmovable(true)
        .setScale(2);

    const bottomPipe = pipes.create(800, centerY + gap/4, "column")
        .setOrigin(0.5, 0)
        .setImmovable(true)
        .setScale(2);

    topPipe.body.allowGravity = false;
    bottomPipe.body.allowGravity = false;

    topPipe.setVelocityX(-200);
    bottomPipe.setVelocityX(-200);

    bottomPipe.scored = false;
    bottomPipe.isBottom = true;
}

function restartGame() {
    hasLanded = false;
    hasBumped = false;
    isGameOver = false;
    score = 0;
    scoreText.setText(`Score: 0`);
    bird.clearTint();
    bird.setPosition(50, 50);
    bird.setVelocityY(-350);
    pipes.clear(true, true);
    this.physics.resume();
    gameOverMessage.destroy();
}