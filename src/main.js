const GRID_SIZE = 64;
let DIRECTION = 0;
const MOVE_DURATION = 500; // time in miliseconds of single move
const DIRS = [
    [1, 0], [0, 1], [-1, 0], [0, -1]
];
const MAP_HEIGHT = 8, MAP_WIDTH = 10;
let SCORE = 0;

const MAP = [
'+        +',
'+        +',
'+ .      +',
'+    ..  +',
'+        +',
'+        +',
'+        +',
'..........',
];
const FISH_PATHS = [
    // [0,0,0,1,1,2,1,2,3,3,2,1,2,3,3]
    [0, 0, 1, 1, 2, 2, 3, 3],
    [0, 0, 0, 1, 1, 2, 2, 2, 3, 3]
];

function updateScore(){
    document.querySelector('#score').innerText = (''+SCORE).padStart(4, '0');
}

class Sprite{
    constructor(x0, y0, klass, path) {
        this.klass = klass;
        this.path = path;
        this.x = 0;
        this.y = 0;
        this.el = document.createElement('div');
        this.el.classList.add('sprite');
        let sprite = document.createElement('div');
        sprite.classList.add(klass);
        this.el.appendChild(sprite);

        document.querySelector('#gameboard').appendChild(this.el);
        this.setPosition(x0, y0);
        this.setDirection(0);
    }

    setPosition(x, y) {
        this.x = x; this.y = y;
        this.el.style.left = ((x + 0.5)*GRID_SIZE) + 'px';
        this.el.style.top = ((y + 0.5)*GRID_SIZE) + 'px';
    }

    setDirection(dir) {
        this.direction = dir;
        let rot = dir == 2 ? 'scaleX(-1.0)' : 'rotate('+(90*dir)+'deg)';
        this.el.style.transform = 'translate(-50%, -50%) ' + rot;
    }

    setAnimationProgress(t) {
        this.el.style.left = GRID_SIZE*((1-t) * this.x + t * this.targetX+0.5) + 'px';
        this.el.style.top = GRID_SIZE*((1-t) * this.y + t * this.targetY+0.5) + 'px';
    }
};

function keypress(event) {
    console.log(event, event.key);
    if(event.key == 'ArrowRight')
        DIRECTION = 0
    if(event.key == 'ArrowDown')
        DIRECTION = 1;
    if(event.key == 'ArrowLeft')
        DIRECTION = 2;
    if(event.key == 'ArrowUp')
        DIRECTION = 3;
}

function createMap() {
    let sprites = {};

    for(let y=0;y<MAP_HEIGHT;y++)
        for(let x=0;x<MAP_WIDTH;x++){
            if(MAP[y][x] == ' ')
                continue;
            if(MAP[y][x] == '.') {
                let el = new Sprite(x, y, 'point');
                sprites[x+'_'+y] = el;
            }
        }
    return sprites;
}

function init() {
    console.log('initialize')
    window.addEventListener('keydown', keypress);
    updateScore();

    let pacfish = new Sprite(2,2, 'nemo');
    let objects = [
        pacfish,
        new Sprite(1, 1, 'fish-0', FISH_PATHS[0]),
        new Sprite(4, 2, 'fish-1', FISH_PATHS[1])
    ];
    for(let i of objects) {
        i.el.zIndex = 2;
    }
    pacfish.el.style.zIndex= 1;

    let map = createMap();

    let animationStartTimestamp = null, iteration = 0;

    let gameloop = function(timestamp) {
        if(animationStartTimestamp === null) {
            animationStartTimestamp = timestamp;

            pacfish.setDirection(DIRECTION);

            for(let obj of objects) {
                if(obj.path)
                    obj.setDirection(obj.path[iteration % obj.path.length]);
                let targetX = obj.x + DIRS[obj.direction][0];
                let targetY = obj.y + DIRS[obj.direction][1];
                if(0 <= targetX && targetX < MAP_WIDTH && 0 <= targetY && targetY < MAP_HEIGHT) {
                    obj.targetX = targetX;
                    obj.targetY = targetY;
                } else {
                    obj.targetX = obj.x;
                    obj.targetY = obj.y;
                }
                // console.log(obj, obj.targetX, obj.targetY);
            }
            iteration += 1;
        }

        let t = (timestamp - animationStartTimestamp) / MOVE_DURATION;
        if(t > 1.0) {
            for(let obj of objects) {
                obj.x = obj.targetX;
                obj.y = obj.targetY;
            }

            for(let obj of objects)
                if(obj !== pacfish && pacfish.x == obj.x && pacfish.y == obj.y) {
                    document.querySelector('#modal').innerText = 'You lose!';
                    document.querySelector('#modal').classList.remove('hide');
                    return false;
                }
            let item = map[pacfish.x+'_'+pacfish.y];
            if(item !== undefined) {
                console.log(item);
                document.querySelector('#gameboard').removeChild(item.el);
                if(item.klass == 'point') {
                    SCORE += 25;
                    updateScore();
                }
                delete map[pacfish.x+'_'+pacfish.y]
            }

            animationStartTimestamp = null;
        } else {
            for(let obj of objects)
                obj.setAnimationProgress(t);
        }
        window.requestAnimationFrame(gameloop);
    }

    window.requestAnimationFrame(gameloop)
}

function gameloop(timestamp) {

}

document.addEventListener('load', init);