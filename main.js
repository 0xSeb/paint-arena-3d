var camera, scene, renderer, playgroundMesh, material, controls, rotationAxis, playerMesh, cubesGroup;
const WORLD_AXIS_X = new THREE.Vector3(1, 0, 0);
const WORL_AXIS_Y = new THREE.Vector3(0, 1, 0);
const CANVAS_WIDTH = 512;
const NUMBER_OF_CELLS = 10;
const CUBE_ROTATION_SPEED = 10;
const CELL_WIDTH = CANVAS_WIDTH / NUMBER_OF_CELLS;
const CUBE_WIDTH = 200;
const PLAYER_CUBE_WIDTH = CUBE_WIDTH / NUMBER_OF_CELLS;
const CVS_A = document.getElementById('cvsA');
const CVS_B = document.getElementById('cvsB');
const CVS_C = document.getElementById('cvsC');
const CVS_D = document.getElementById('cvsD');
const CVS_E = document.getElementById('cvsE');
const CVS_F = document.getElementById('cvsF');

var rotationValueX = 0;
var rotationValueY = 0;
var rotationValuePlayerX = 0;
var rotationValuePlayerY = 0;
var player1 = buildPlayer('orange', CVS_B);
var player2 = buildPlayer('red', CVS_A);
var player3 = buildPlayer('blue', CVS_D);
var player4 = buildPlayer('green', CVS_C);
var player5 = buildPlayer('black', CVS_E);
var movement_matrix = {
    cvsA:
        {
            "l": (p) => {
                p.canvas = CVS_E;
                p.position.x = p.position.y;
                p.position.y = 0;
                rotateMovementAntiClockwise(p);
            },
            "u": (p) => {
                p.canvas = CVS_D;
                p.position.y = NUMBER_OF_CELLS - 1;

            },
            "r": (p) => {
                p.canvas = CVS_F;
                p.position.x = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.y = 0;
                rotateMovementClockwise(p);
            },
            "d": (p) => {
                p.canvas = CVS_B;
                p.position.y = 0;
                // TODO VARIABILISER LES 0 pi:2 ETC PARCE QUE CA DEPEND DE LA FACE DE DEPART DU JOUEUR

            },

        },
    cvsB:
        {
            "l": (p) => {
                p.canvas = CVS_E;
                p.position.x = NUMBER_OF_CELLS - 1;
            },
            "u": (p) => {
                p.canvas = CVS_A;
                p.position.y = NUMBER_OF_CELLS - 1;
            },
            "r": (p) => {
                p.canvas = CVS_F;
                p.position.x = 0;
            },
            "d": (p) => {
                p.canvas = CVS_C;
                p.position.y = 0;
            },
        },
    cvsC:
        {
            "l": (p) => {
                p.canvas = CVS_E;
                p.position.x = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.y = NUMBER_OF_CELLS - 1;
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = CVS_B;
                p.position.y = NUMBER_OF_CELLS - 1;
            },
            "r": (p) => {
                p.canvas = CVS_F;
                p.position.x = p.position.y;
                p.position.y = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
            },
            "d": (p) => {
                p.canvas = CVS_D;
                p.position.y = 0;
            },

        },
    cvsD:
        {
            "l": (p) => {
                p.canvas = CVS_E;
                p.position.x = 0;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = CVS_C;
                p.position.y = NUMBER_OF_CELLS - 1;

            },
            "r": (p) => {
                p.canvas = CVS_F;
                p.position.x = NUMBER_OF_CELLS - 1;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "d": (p) => {
                p.canvas = CVS_A;
                p.position.y = 0;
            },
        },
    cvsE:
        {
            "l": (p) => {
                p.canvas = CVS_D;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.x = 0;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = CVS_A;
                p.position.y = p.position.x;
                p.position.x = 0;
                rotateMovementClockwise(p);
            },
            "r": (p) => {
                p.canvas = CVS_B;
                p.position.x = 0;
            },
            "d": (p) => {
                p.canvas = CVS_C;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.x;
                p.position.x = 0;
                rotateMovementAntiClockwise(p);

            },
        },
    cvsF:
        {
            "l": (p) => {
                p.canvas = CVS_B;
                p.position.x = NUMBER_OF_CELLS - 1;
            },
            "u": (p) => {
                p.canvas = CVS_A;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.x;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
            },
            "r": (p) => {
                p.canvas = CVS_D;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
                rotateMovementAntiClockwise(p);
            },
            "d": (p) => {
                p.canvas = CVS_C;
                p.position.y = p.position.x;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementClockwise(p);
            },
        }
};


function startGame() {
    init();

    fillCellColor(player1);
    fillCellColor(player2);
    fillCellColor(player3);
    fillCellColor(player4);
    fillCellColor(player5);

    animate();
}

function rotateMovementClockwise(p) {
    var u = p.movement.up;
    var r = p.movement.right;
    var d = p.movement.down;
    var l = p.movement.left;
    p.movement.up = r;
    p.movement.right = d;
    p.movement.down = l;
    p.movement.left = u;
}

function rotateMovementAntiClockwise(p) {
    var u = p.movement.up;
    var r = p.movement.right;
    var d = p.movement.down;
    var l = p.movement.left;
    p.movement.up = l;
    p.movement.right = u;
    p.movement.down = r;
    p.movement.left = d;
}

function fillCellColor(player) {
    var ctx = player.canvas.getContext('2d');
    ctx.fillStyle = player.color;
    ctx.fillRect(player.position.x * CELL_WIDTH, player.position.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(player.position.x * CELL_WIDTH, player.position.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);


    material.forEach(mat => {
        mat.map.needsUpdate = true;
    });

}

function buildPlayer(color, canvas) {
    return {
        color: color,
        canvas: canvas,
        // TODO variabiliser cette partie
        position: {
            x: 2,
            y: 2,
        },
        movement: {
            left: "l",
            right: "r",
            up: "u",
            down: "d"
        }
    }
}

function buildCubePlayer(player) {
    var geometryPlayground = new THREE.BoxBufferGeometry(PLAYER_CUBE_WIDTH, PLAYER_CUBE_WIDTH, PLAYER_CUBE_WIDTH);
    var material = new THREE.MeshBasicMaterial({color: player.color});
    var mesh = new THREE.Mesh(geometryPlayground, material);
    mesh.position.z = CUBE_WIDTH/2+PLAYER_CUBE_WIDTH/2;
    mesh.position.x = -1*2*PLAYER_CUBE_WIDTH-PLAYER_CUBE_WIDTH/2;
    mesh.position.y = 2*PLAYER_CUBE_WIDTH+PLAYER_CUBE_WIDTH/2;
    mesh.geometry.translate(10,10,10);
    mesh.position.x -= 10;
    mesh.position.y -= 10;
    mesh.position.z -= 10;
    var axes = new THREE.AxesHelper(1000);
    mesh.add(axes);
    return mesh;
}

function moveCubePlayer(player, keycode) {

    switch (keycode) {
        case 37:
        case 81:
            // LEFT
            player.position.x -= PLAYER_CUBE_WIDTH;

            break;
        case 38:
        case 90:
            // UP
            player.position.y += PLAYER_CUBE_WIDTH;
            break;
        case 39:
        case 68:
            // RIGHT
            player.position.x += PLAYER_CUBE_WIDTH;
            break;
        case 40:
        case 83:
            // DOWN
            player.position.y -= PLAYER_CUBE_WIDTH;

            break;
        default:
            return;
    }
}

function drawGridOnCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    var cellWidth = CANVAS_WIDTH / NUMBER_OF_CELLS;

    for (x = 0; x <= ctx.canvas.width; x += cellWidth) {
        for (y = 0; y <= ctx.canvas.height; y += cellWidth) {
            ctx.moveTo(x, y);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, x + cellWidth, y + cellWidth);

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, x + cellWidth, y + cellWidth);
        }
    }
}

function updatePlayerCoordinates(player, movement) {
    switch (movement) {
        case "l":
            player.position.x -= 1;
            break;
        case "u":
            player.position.y -= 1;
            break;
        case "r":
            player.position.x += 1;
            break;
        case "d":
            player.position.y += 1;
            break;
    }
}

function movePlayer(player, keycode) {
    var movement = "";
    // TODO VERIFIER COLISIONS PLAYER
    switch (keycode) {
        case 37:
        case 81:
            // LEFT
            movement = player.movement.left;
            updatePlayerCoordinates(player, movement);
            if (leaveCanvas(player)) {
                movement_matrix[player.canvas.id][movement](player);
                rotationAxis = WORL_AXIS_Y;
                rotationValueY += 90;
                rotationValuePlayerY += 90;
            }

            fillCellColor(player);
            break;
        case 38:
        case 90:
            // UP
            movement = player.movement.up;
            updatePlayerCoordinates(player, movement);
            if (leaveCanvas(player)) {
                movement_matrix[player.canvas.id][movement](player);
                rotationAxis = WORLD_AXIS_X;
                rotationValueX += 90;
                rotationValuePlayerX += 90;


            }

            fillCellColor(player);
            break;
        case 39:
        case 68:
            // RIGHT
            movement = player.movement.right;
            updatePlayerCoordinates(player, movement);
            if (leaveCanvas(player)) {
                movement_matrix[player.canvas.id][movement](player);
                rotationAxis = WORL_AXIS_Y;
                rotationValueY -= 90;
                rotationValuePlayerY -= 90;
            }

            fillCellColor(player);
            break;
        case 40:
        case 83:
            // DOWN
            movement = player.movement.down;
            updatePlayerCoordinates(player, movement);
            if (leaveCanvas(player)) {
                movement_matrix[player.canvas.id][movement](player);
                rotationAxis = WORLD_AXIS_X;
                rotationValueX -= 90;
                rotationValuePlayerX -= 90;

            }

            fillCellColor(player);
            break;
        default:
            return;
    }


}

function leaveCanvas(player) {
    if (player.position.x < 0 || player.position.x >= NUMBER_OF_CELLS || player.position.y < 0 || player.position.y >= NUMBER_OF_CELLS) {
        return true;
    }
    return false;
}

function drawGrid() {
    drawGridOnCanvas(CVS_A);
    drawGridOnCanvas(CVS_B);
    drawGridOnCanvas(CVS_C);
    drawGridOnCanvas(CVS_D);
    drawGridOnCanvas(CVS_E);
    drawGridOnCanvas(CVS_F);
}

function init() {
    document.onkeydown = function (event) {
        // PLAYER 2 joue avec les flèches
        if ([37, 38, 39, 40].includes(event.keyCode)) {
            movePlayer(player2, event.keyCode);
        }
        // PLAYER 1 joue avec zqsd
        if ([90, 81, 83, 68].includes(event.keyCode)) {
            movePlayer(player1, event.keyCode);
            moveCubePlayer(playerMesh, event.keyCode);

        }

    };

    drawGrid();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.x = -200;
    camera.position.y = 200;
    camera.position.z = 500;

    scene = new THREE.Scene();
    var backFace = new THREE.CanvasTexture(CVS_D);
    backFace.center = new THREE.Vector2(0.5, 0.5);
    backFace.rotation = Math.PI;

    material = [
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(CVS_F)
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(CVS_E)
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(CVS_A)
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(CVS_C)
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(CVS_B)
        }),
        new THREE.MeshBasicMaterial({
            map: backFace
        })

    ];


    cubesGroup = new THREE.Group();
    playgroundMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(CUBE_WIDTH, CUBE_WIDTH, CUBE_WIDTH), material);
    var axes = new THREE.AxesHelper(250);
    playgroundMesh.add(axes);
    playerMesh = buildCubePlayer(player1);
    cubesGroup.add(playgroundMesh);
  //  cubesGroup.add(playerMesh);
    scene.add(cubesGroup);
    scene.add(playerMesh);


    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById('cvs3D')});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.lookAt(playgroundMesh.position);

    window.addEventListener('resize', onWindowResize, false);

    // Création du contrôleur
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 200;
    controls.maxDistance = 1000;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateCube(rotationValue) {
    if (rotationValue !== 0) {
        if (rotationValue > 0) {
            cubesGroup.attach(playerMesh);
            cubesGroup.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(CUBE_ROTATION_SPEED));
            scene.attach(playerMesh);
                return rotationValue - CUBE_ROTATION_SPEED;
        } else if (rotationValue < 0) {
            cubesGroup.attach(playerMesh);
            cubesGroup.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-CUBE_ROTATION_SPEED));
            scene.attach(playerMesh);
            return rotationValue + CUBE_ROTATION_SPEED;
        }
    }
    return 0;
}

function rotatePlayerCube(rotationValue){
    if (rotationValue !== 0) {
        if (rotationAxis == WORLD_AXIS_X) {
            if (rotationValue > 0) {
                playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-1));
                return rotationValue - 1;
            }else if (rotationValue < 0){
                playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(+1));
                return rotationValue + 1;
            }
        }else if (rotationAxis == WORL_AXIS_Y) {
            if (rotationValue > 0) {
                playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-1));
                return rotationValue - 1;
            }else if (rotationValue < 0){
                playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(+1));
                return rotationValue + 1;
            }
        }
    }

  /*  if (rotationValue !== 0) {
        if (rotationValue > 0) {
            console.log("HERE");
            cubesGroup.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(CUBE_ROTATION_SPEED));
            return rotationValue - CUBE_ROTATION_SPEED;
        } else if (rotationValue < 0) {
            cubesGroup.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-CUBE_ROTATION_SPEED));
            return rotationValue + CUBE_ROTATION_SPEED;
        }
    }*/
    return 0;
}

function animate() {
    controls.update();
    rotationValueX = rotateCube(rotationValueX);
    rotationValueY = rotateCube(rotationValueY);
    rotationValuePlayerX = rotatePlayerCube(rotationValuePlayerX);
    rotationValuePlayerY = rotatePlayerCube(rotationValuePlayerY);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

startGame();

