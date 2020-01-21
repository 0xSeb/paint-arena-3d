const CANVAS_WIDTH = 512;
const NUMBER_OF_CELLS = 10;
const CELL_WIDTH = CANVAS_WIDTH / NUMBER_OF_CELLS;
const PLAYGROUND_WIDTH = 200;
const PLAYER_CUBE_WIDTH = PLAYGROUND_WIDTH / NUMBER_OF_CELLS;
const MOVEMENT = { LEFT: "l", RIGHT: "r", UP: "u", DOWN: "d" }
const WORLD_AXIS_X = new THREE.Vector3(1, 0, 0);
const WORLD_AXIS_Y = new THREE.Vector3(0, 1, 0);
const PLAYGROUND_ROTATION_SPEED = 10;

let renderer, scene, camera, controls;
let playgroundRotation = {x: 0, y: 0};
let playerRotataion = {x: 0, y: 0};

function initRenderer() {
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById('cvs3D')});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.x = -200;
    camera.position.y = 200;
    camera.position.z = 500;
}

function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 200;
    controls.maxDistance = 1000;
}

function fillCell(player, material) {
    var ctx = player.canvas.getContext('2d');
    ctx.fillStyle = player.color;
    ctx.fillRect(player.position.x * CELL_WIDTH, player.position.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(player.position.x * CELL_WIDTH, player.position.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    material.forEach(mat => { mat.map.needsUpdate = true });
}

function buildPlayer(color, canvas) {
    return {
        color: color,
        canvas: canvas,
        // TODO variabiliser cette partie
        position: {x: 2, y: 2},
        movement: {
            left: MOVEMENT.LEFT,
            right: MOVEMENT.RIGHT,
            up: MOVEMENT.UP,
            down: MOVEMENT.DOWN
        }
    }
}

function buildMaterial(canvases) {
    var backFace = new THREE.CanvasTexture(canvases.D);
    backFace.center = new THREE.Vector2(0.5, 0.5);
    backFace.rotation = Math.PI;
    let material = [];
    ['F', 'E', 'A', 'C', 'B'].forEach(letter => material.push(new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvases[letter])
    })));
    material.push(new THREE.MeshBasicMaterial({map: backFace}));
    return material;
}

function drawGridOnCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    for (x = 0; x <= ctx.canvas.width; x += CELL_WIDTH) {
        for (y = 0; y <= ctx.canvas.height; y += CELL_WIDTH) {
            ctx.moveTo(x, y);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, x + CELL_WIDTH, y + CELL_WIDTH);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, x + CELL_WIDTH, y + CELL_WIDTH);
        }
    }
}

function drawGrids(canvases) {
    for (let letter in canvases) drawGridOnCanvas(canvases[letter]);
}

function buildPlayerMesh(player, number) {
    let mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(PLAYER_CUBE_WIDTH, PLAYER_CUBE_WIDTH, PLAYER_CUBE_WIDTH), 
        new THREE.MeshBasicMaterial({color: player.color})
    );
    let axes = new THREE.AxesHelper(1000);
    mesh.add(axes);
    mesh.position.z = PLAYGROUND_WIDTH/2+PLAYER_CUBE_WIDTH/2;
    mesh.position.x = -1*2*PLAYER_CUBE_WIDTH-PLAYER_CUBE_WIDTH/2;
    mesh.position.y = 2*PLAYER_CUBE_WIDTH+PLAYER_CUBE_WIDTH/2;
    mesh.geometry.translate(10,10,10);
    mesh.position.x -= 10;
    mesh.position.y -= 10;
    mesh.position.z -= 10;
    mesh.name = "player" + number;
    return mesh;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updatePlayerCoordinates(player, movement) {
    switch (movement) {
        case MOVEMENT.LEFT:
            player.position.x -= 1;
            break;
        case MOVEMENT.UP:
            player.position.y -= 1;
            break;
        case MOVEMENT.RIGHT:
            player.position.x += 1;
            break;
        case MOVEMENT.DOWN:
            player.position.y += 1;
            break;
    }
}

function leaveCanvas(player) {
    if (player.position.x < 0 || player.position.x >= NUMBER_OF_CELLS || player.position.y < 0 || player.position.y >= NUMBER_OF_CELLS)
        return true;
    return false;
}

function applyMovement(player, grid, movementMatrix, movement, axis, pgr, pyr) {
    updatePlayerCoordinates(player, movement);
    if (leaveCanvas(player)) {
        movementMatrix[player.canvas.id][movement](player);
        playgroundRotation.x += pgr[0];
        playgroundRotation.y += pgr[1];
        playerRotataion.x += pyr[0];
        playerRotataion.y += pyr[1];
    }
    fillCell(player, grid);
}

function movePlayer(player, keycode, grid, movementMatrix) {
    // TODO VERIFIER COLISIONS PLAYER
    let playerMesh = scene.getObjectByName("player1");
    let m = player.movement;
    switch (keycode) {
        case 37:
        case 81:
            applyMovement(player, grid, movementMatrix, m.left, WORLD_AXIS_Y, [0,90], [0,90])
            playerMesh.position.x -= PLAYER_CUBE_WIDTH;
            break;
        case 38:
        case 90:
            applyMovement(player, grid, movementMatrix, m.up, WORLD_AXIS_X, [90,0], [90,0])
            playerMesh.position.y += PLAYER_CUBE_WIDTH;
            break;
        case 39:
        case 68:
            applyMovement(player, grid, movementMatrix, m.right, WORLD_AXIS_Y, [0,-90], [0,-90])
            playerMesh.position.x += PLAYER_CUBE_WIDTH;
            break;
        case 40:
        case 83:
            applyMovement(player, grid, movementMatrix, m.down, WORLD_AXIS_X, [-90,0], [-90,0])
            playerMesh.position.y -= PLAYER_CUBE_WIDTH;
            break;
    }
}

function handleUserInputs(player1, player2, grid, movementMatrix) {
    document.onkeydown = function (event) {
        // PLAYER 1 joue avec zqsd
        if ([90, 81, 83, 68].includes(event.keyCode)) {
            movePlayer(player1, event.keyCode, grid, movementMatrix);
        }
        // PLAYER 2 joue avec les flèches
        if ([37, 38, 39, 40].includes(event.keyCode)) {
            movePlayer(player2, event.keyCode, grid, movementMatrix);
        }
    };
    window.addEventListener('resize', onWindowResize, false);
}

function getRotationAxis(rotation) {
    return rotation.x == 0 ? WORLD_AXIS_Y : WORLD_AXIS_X;
}

function applyRotation(pr, rotationValue, direction) {
    let cubesGroup = scene.getObjectByName("cubesGroup");
    let playerMesh = scene.getObjectByName("player1");
    cubesGroup.attach(playerMesh);
    cubesGroup.rotateOnWorldAxis(getRotationAxis(pr), THREE.Math.degToRad(PLAYGROUND_ROTATION_SPEED * direction));
    scene.attach(playerMesh);
    return rotationValue - PLAYGROUND_ROTATION_SPEED * direction;
}

function rotatePlayground(rotation) {
    let result = {x: 0, y: 0};
    for (let axis in result)
        if (rotation[axis] !== 0) {
            if (rotation[axis] > 0) result[axis] = applyRotation(rotation, rotation[axis], 1);
            else if (rotation[axis] < 0) result[axis] = applyRotation(rotation, rotation[axis], -1);
        }
    return result;
}

function rotatePlayer(rotation) {
    let result = {x: 0, y: 0};
    let rotationAxis = getRotationAxis(rotation)
    let cubesGroup = scene.getObjectByName("cubesGroup");
    let playerMesh = scene.getObjectByName("player1");
    for (let axis in result)
        if (rotation[axis] !== 0) {
            if (rotationAxis == WORLD_AXIS_X) {
                if (rotation[axis] > 0) {
                    playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-1));
                    result[axis] = rotation[axis] - 1;
                } else if (rotation[axis] < 0) {
                    playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(+1));
                    result[axis] = rotation[axis] + 1;
                }
            } else if (rotationAxis == WORLD_AXIS_Y) {
                if (rotation[axis] > 0) {
                    playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(-1));
                    result[axis] = rotation[axis] - 1;
                } else if (rotation[axis] < 0) {
                    playerMesh.rotateOnWorldAxis(rotationAxis, THREE.Math.degToRad(+1));
                    result[axis] = rotation[axis] + 1;
                }
            }
        }
    return result;
}

function animate() {
    controls.update();
    playgroundRotation = rotatePlayground(playgroundRotation);
    playerRotataion = rotatePlayer(playerRotataion);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function startGame() {
    initRenderer();
    initScene();
    initCamera();
    initControls();

    const canvases = {};
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
        canvases[letter] = document.getElementById('cvs' + letter);
    });

    let player1 = buildPlayer('orange', canvases.B);
    let player1Mesh = buildPlayerMesh(player1, 1);
    let player2 = buildPlayer('red', canvases.A);
    let player2Mesh = buildPlayerMesh(player2, 2);

    let playgroundMaterial = buildMaterial(canvases);

    let cubesGroup = new THREE.Group();
    cubesGroup.name = "cubesGroup";

    let playgroundMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(PLAYGROUND_WIDTH, PLAYGROUND_WIDTH, PLAYGROUND_WIDTH), playgroundMaterial);
    playgroundMaterial.name = "playgroundMesh";
    let axes = new THREE.AxesHelper(250);
    playgroundMesh.add(axes);

    cubesGroup.add(playgroundMesh);
    scene.add(cubesGroup);
    scene.add(player1Mesh);

    camera.lookAt(playgroundMesh.position);

    drawGrids(canvases);
    fillCell(player1, playgroundMaterial);
    fillCell(player2, playgroundMaterial);

    let movementMatrix = buildMovementMatrix(canvases);
    handleUserInputs(player1, player2, playgroundMaterial, movementMatrix);
    animate();
}

function rotateMovementClockwise(p) {
    let u = p.movement.up;
    let r = p.movement.right;
    let d = p.movement.down;
    let l = p.movement.left;
    p.movement.up = r;
    p.movement.right = d;
    p.movement.down = l;
    p.movement.left = u;
}

function rotateMovementAntiClockwise(p) {
    let u = p.movement.up;
    let r = p.movement.right;
    let d = p.movement.down;
    let l = p.movement.left;
    p.movement.up = l;
    p.movement.right = u;
    p.movement.down = r;
    p.movement.left = d;
}

function buildMovementMatrix(canvases) {
    return {
        cvsA: {
            "l": (p) => {
                p.canvas = canvases.E;
                p.position.x = p.position.y;
                p.position.y = 0;
                rotateMovementAntiClockwise(p);
            },
            "u": (p) => {
                p.canvas = canvases.D;
                p.position.y = NUMBER_OF_CELLS - 1;
            },
            "r": (p) => {
                p.canvas = canvases.F;
                p.position.x = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.y = 0;
                rotateMovementClockwise(p);
            },
            "d": (p) => {
                p.canvas = canvases.B;
                p.position.y = 0;
                // TODO VARIABILISER LES 0 pi:2 ETC PARCE QUE CA DEPEND DE LA FACE DE DEPART DU JOUEUR
            }
        },
        cvsB: {
            "l": (p) => {
                p.canvas = canvases.E;
                p.position.x = NUMBER_OF_CELLS - 1;
            },
            "u": (p) => {
                p.canvas = canvases.A;
                p.position.y = NUMBER_OF_CELLS - 1;
            },
            "r": (p) => {
                p.canvas = canvases.F;
                p.position.x = 0;
            },
            "d": (p) => {
                p.canvas = canvases.C;
                p.position.y = 0;
            }
        },
        cvsC: {
            "l": (p) => {
                p.canvas = canvases.E;
                p.position.x = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.y = NUMBER_OF_CELLS - 1;
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = canvases.B;
                p.position.y = NUMBER_OF_CELLS - 1;
            },
            "r": (p) => {
                p.canvas = canvases.F;
                p.position.x = p.position.y;
                p.position.y = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
            },
            "d": (p) => {
                p.canvas = canvases.D;
                p.position.y = 0;
            }
        },
        cvsD: {
            "l": (p) => {
                p.canvas = canvases.E;
                p.position.x = 0;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = canvases.C;
                p.position.y = NUMBER_OF_CELLS - 1;

            },
            "r": (p) => {
                p.canvas = canvases.F;
                p.position.x = NUMBER_OF_CELLS - 1;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "d": (p) => {
                p.canvas = canvases.A;
                p.position.y = 0;
            }
        },
        cvsE: {
            "l": (p) => {
                p.canvas = canvases.D;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.x = 0;
                rotateMovementClockwise(p);
                rotateMovementClockwise(p);
            },
            "u": (p) => {
                p.canvas = canvases.A;
                p.position.y = p.position.x;
                p.position.x = 0;
                rotateMovementClockwise(p);
            },
            "r": (p) => {
                p.canvas = canvases.B;
                p.position.x = 0;
            },
            "d": (p) => {
                p.canvas = canvases.C;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.x;
                p.position.x = 0;
                rotateMovementAntiClockwise(p);
            }
        },
        cvsF: {
            "l": (p) => {
                p.canvas = canvases.B;
                p.position.x = NUMBER_OF_CELLS - 1;
            },
            "u": (p) => {
                p.canvas = canvases.A;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.x;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
            },
            "r": (p) => {
                p.canvas = canvases.D;
                p.position.y = NUMBER_OF_CELLS - 1 - p.position.y;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementAntiClockwise(p);
                rotateMovementAntiClockwise(p);
            },
            "d": (p) => {
                p.canvas = canvases.C;
                p.position.y = p.position.x;
                p.position.x = NUMBER_OF_CELLS - 1;
                rotateMovementClockwise(p);
            },
        }
    };
}

startGame();
