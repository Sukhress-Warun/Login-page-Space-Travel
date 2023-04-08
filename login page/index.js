class particle{
    constructor(x,y,z,xv,yv,zv){
        this.x = x;
        this.y = y;
        this.z = z;
        this.xv = xv;
        this.yv = yv;
        this.zv = zv;
        this.dead = false;
    }
    
    applyFriction(coef){
        coef = 1-coef;
        this.xv *= coef;
        this.yv *= coef;
        this.zv *= coef;
    }

    toRest(){
        this.xv = 0;
        this.yv = 0;
        this.zv = 0;
    }

    applyForce(dx,dy,dz){
        this.xv += dx;
        this.yv += dy;
        this.zv += dz;
    }
    
    speed(){
        this.x += this.xv;
        this.y += this.yv;
        this.z += this.zv;
    }
    
    display(g){
        const [x,y] = transform(this.x,this.y,this.z,g);
        const [next_x,next_y] = transform(this.x+this.xv,this.y+this.yv,this.z+this.zv,g);
        let w = g.width;
        let h = g.height;
        let distance = Math.pow(Math.pow(x-next_x,2)+Math.pow(y-next_y,2),0.5);
        if (distance>=Math.pow(Math.pow(w/2,2)+Math.pow(h/2,2),0.5)){
            this.dead = true;
            return null;
        }
        g.context.strokeStyle = "white";
        g.context.lineCap = 'round';
        g.context.beginPath();
        g.context.moveTo(x,y);
        g.context.lineTo(next_x,next_y);
        g.context.closePath();
        g.context.stroke();
    }

}

class GameWindow{
    constructor(canvas,minParticles){
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.depth = this.width;
        this.particles = [];
        this.minParticles = minParticles;
        this.context = this.canvas.getContext("2d");
    }
    
    start(){
        this.particles = this.generateParticles(this.minParticles);
        this.run();
    }
    
    async run(){
        let prevOrgin_x = 0;
        let prevOrgin_y = 0;
        let currOrgin_x = 0;
        let currOrgin_y = 0;
        while(true){
            this.clear();
            
            this.context.translate(-prevOrgin_x,-prevOrgin_y);
            this.updateWidthHeightDepth();
            currOrgin_x = randomNumer(shake)-shake/2;
            currOrgin_y = randomNumer(shake)-shake/2;
            this.context.translate(currOrgin_x,currOrgin_y);
            prevOrgin_x = currOrgin_x;
            prevOrgin_y = currOrgin_y;

            let timetaken = performance.now();
            this.display();
            timetaken = performance.now()-timetaken;

            let timeToWait = (1000/framesPerSecond)-timetaken;
            await new Promise(r => setTimeout(r,(timeToWait>0)?timeToWait:0));
        }
    }
    
    display(){
        for(let i=0;i<this.particles.length;i++){
            this.particles[i].speed();
            this.particles[i].display(this);
        }
       
        let temp = []
        for(let i=0;i<this.particles.length;i++){
            if(this.particles[i].z+this.particles[i].zv>0 && !this.particles[i].dead){
                temp.push(this.particles[i]);
            }
        }
        this.particles = temp.concat(temp.length<this.minParticles? this.generateParticles(this.minParticles-temp.length) :[]);

    }
    
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    generateParticles(n){
        let temp = [];
        for(let i=0;i<n;i++){
            let obj = randomObject();
            temp.push(obj);
        }
        return temp;
    }

    updateWidthHeightDepth(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.depth = this.width;
    }

}

function transform(x,y,z,g){
    let w = g.width;
    let h = g.height;
    let d = g.depth;
    let temp_x = ((x-(w/2))/(z/d))+(w/2);
    let temp_y = ((y-(h/2))/(z/d))+(h/2);
    return [temp_x,temp_y];
}

function randomObject(){
    let speedCopy = speed.map((x) => x);
    let framesToReach = game.depth/Math.abs(speedCopy[2]);
    
    let x = randomNumer(game.width);
    x = x-speedCopy[0]*framesToReach;
    
    let y = randomNumer(game.height);
    y = y-speedCopy[1]*framesToReach;
    
    let z = randomNumer(game.width);

    let obj = new particle(x,y,z,0,0,0);
    obj.toRest();
    obj.applyForce(speedCopy[0],speedCopy[1],speedCopy[2]);
    return obj;
}

function randomNumer(n){
    let t = Math.floor(Math.random()*(n+1));
    return t;
}

async function changeSpeed(){
    let c=0;

    let username_l = -1*(document.getElementById("username").value.length)/2;
    if (username_l<-7){
        speed[2] = -7;
        c+=3;
    }
    else if(username_l<=-2 && username_l>=-7){
        speed[2] = username_l;
        c+=2;
    }
    else{
        speed[2] = -2;
        c+=1;
    }
    
    let password_l = document.getElementById("password").value.length;
    if (password_l<3){
        shake = 3;
        
        c+=1;
    }
    else if(password_l>=3 && password_l<=7){
        shake = password_l;
        
        c+=2;
    }
    else{
        shake = 7;
        
        c+=3;
    }

    if (c<=3){
        game.canvas.style.color = "rgb(255,255,255,0.5)"; 
    }
    else if (c<=5){
        game.canvas.style.color = "rgb(0,255,0,0.5)"; 
    }
    else{
        game.canvas.style.color = "rgb(255,0,0,0.5)"; 
    }
}

const game = new GameWindow(document.getElementById("main"),10000);

let speed = [0,0,-2];
let framesPerSecond = 100;
let shake = 3;

game.start();
setInterval(changeSpeed,20);