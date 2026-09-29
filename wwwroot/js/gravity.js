let raf = 0;

export function startGravity(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const keys = new Set();
    const touches = new Map();

    const state = {
        x: 120, y: 500, vx: 0, vy: 0, grounded: false,
        finished: false, messageTimer: 0, last: performance.now()
    };

    const platforms = [
        [0,620,2200,100],[260,540,120,24],[430,470,120,24],
        [610,400,120,24],[800,330,130,24],[1000,270,150,24],
        [1210,360,110,24],[1370,300,120,24],[1510,240,150,24],
        [1690,330,150,24],[1880,270,180,24]
    ];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    new ResizeObserver(resize).observe(canvas);
    resize();

    addEventListener("keydown", e => {
        keys.add(e.code);
        if (["Space","ArrowUp","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
    });
    addEventListener("keyup", e => keys.delete(e.code));

    canvas.addEventListener("pointerdown", e => {
        canvas.setPointerCapture(e.pointerId);
        touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
    });
    canvas.addEventListener("pointermove", e => {
        if (touches.has(e.pointerId)) touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
    });
    canvas.addEventListener("pointerup", e => touches.delete(e.pointerId));
    canvas.addEventListener("pointercancel", e => touches.delete(e.pointerId));

    function clamp(v,a,b) { return Math.max(a, Math.min(v,b)); }
    function overlapX(a,b) { return a.x < b[0]+b[2] && a.x+a.w > b[0]; }

    function update(dt) {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        let move = 0;
        if (keys.has("KeyA") || keys.has("ArrowLeft")) move -= 1;
        if (keys.has("KeyD") || keys.has("ArrowRight")) move += 1;

        let jump = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
        const joy = {x:105, y:h-120};
        const jumpButton = {x:w-120, y:h-120};

        for (const t of touches.values()) {
            const dx = t.x-joy.x, dy = t.y-joy.y;
            const d = Math.hypot(dx,dy);
            if (t.x < w*0.45 && d < 110 && d > 1)
                move = clamp(dx/62,-1,1);
            if (Math.hypot(t.x-jumpButton.x,t.y-jumpButton.y) < 58) jump = true;
        }

        state.vx = move * 260;
        state.vy += 1250 * dt;
        if (jump && state.grounded) {
            state.vy = -540;
            state.grounded = false;
        }

        state.x = clamp(state.x + state.vx*dt, 0, 2160-34);
        const oldBottom = state.y+50;
        state.y += state.vy*dt;
        state.grounded = false;

        const player = {x:state.x,y:state.y,w:34,h:50};
        for (const p of platforms) {
            if (state.vy >= 0 && overlapX(player,p) &&
                oldBottom <= p[1]+4 && state.y+50 >= p[1]) {
                state.y = p[1]-50;
                state.vy = 0;
                state.grounded = true;
            }
        }

        if (state.y > 800) {
            state.x=120; state.y=500; state.vx=0; state.vy=0;
        }
        if (!state.finished && state.x > 1850) {
            state.finished=true;
            state.messageTimer=6;
        }
        if (state.messageTimer > 0) state.messageTimer -= dt;
    }

    function draw() {
        const w=canvas.clientWidth, h=canvas.clientHeight;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle="#91cdf5"; ctx.fillRect(0,0,w,h);

        const cameraX = clamp(state.x-250,0,2160-w);
        ctx.save(); ctx.translate(-cameraX,0);

        ctx.fillStyle="#f6d34a"; ctx.beginPath(); ctx.arc(1050,110,65,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#aabfa0";
        [[0,620,420,360,850,620],[650,620,1150,330,1650,620],[1450,620,1820,380,2200,620]]
          .forEach(m=>{ctx.beginPath();ctx.moveTo(m[0],m[1]);ctx.lineTo(m[2],m[3]);ctx.lineTo(m[4],m[5]);ctx.fill();});

        drawHouse(-30,490,"#ebcd96","#964b37");
        drawHouse(520,490,"#dcb987","#785041");
        drawHouse(900,500,"#d2af7d","#7d4b37");

        for (const x of [370,760,1160,1450,1760]) drawTree(x,560);
        ctx.fillStyle="#cdb487"; ctx.fillRect(0,585,2200,35);

        platforms.forEach((p,i)=>{
            ctx.fillStyle=i===0?"#698269":"#697f9b";
            ctx.fillRect(...p);
            if(i>0){ctx.fillStyle="#87d7f5";ctx.fillRect(p[0],p[1],p[2],5);}
        });

        sign(150,465,100,"MOVE  ->");
        sign(300,385,120,"JUMP!");
        sign(700,245,140,"KEEP GOING");

        ctx.fillStyle="#f5be96";ctx.beginPath();ctx.arc(536,445,16,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#3565b5";ctx.fillRect(520,461,32,40);
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(530,442,3,0,7);ctx.arc(542,442,3,0,7);ctx.fill();
        ctx.fillStyle="#193d86";ctx.font="18px Arial";ctx.fillText("Mira",515,410);

        ctx.fillStyle="#f5e1a5";ctx.fillRect(1840,210,210,60);
        ctx.fillStyle="#54351f";ctx.font="22px Arial";ctx.fillText("VILLAGE TRAIL",1860,247);

        ctx.fillStyle="#4669d2";ctx.fillRect(state.x,state.y,34,50);
        ctx.fillStyle="#f5c39b";ctx.beginPath();ctx.arc(state.x+17,state.y+12,12,0,7);ctx.fill();
        ctx.fillStyle="#173b93";ctx.fillRect(state.x+7,state.y+23,20,24);

        ctx.restore();

        ctx.fillStyle="rgba(20,30,45,.86)";ctx.fillRect(0,0,w,74);
        ctx.fillStyle="white";ctx.font="bold 32px Arial";ctx.fillText("GRAVITY",28,43);
        ctx.font="22px Arial";ctx.fillStyle="#ddd";ctx.fillText("Village Parkour Lesson",190,43);
        ctx.font="18px Arial";ctx.fillStyle="white";
        ctx.fillText(state.finished?"Lesson complete! More gravity abilities coming next.":"Reach the trail sign to finish the first lesson.",520,43);

        drawControls(w,h);

        if(state.messageTimer>0){
            ctx.fillStyle="rgba(20,30,45,.9)";ctx.fillRect(w/2-340,105,680,72);
            ctx.fillStyle="white";ctx.font="22px Arial";ctx.fillText("Mira: Great job! You learned the basics of parkour.",w/2-305,135);
            ctx.fillStyle="#ddd";ctx.font="19px Arial";ctx.fillText("Next, we'll learn what makes Gravity different.",w/2-285,161);
        }
    }

    function drawHouse(x,y,wall,roof){
        ctx.fillStyle=wall;ctx.fillRect(x,y,190,130);
        ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-15,y);ctx.lineTo(x+95,y-80);ctx.lineTo(x+205,y);ctx.fill();
        ctx.fillStyle="#60402f";ctx.fillRect(x+72,y+70,45,60);
        ctx.fillStyle="#87ceeb";ctx.fillRect(x+20,y+35,38,38);ctx.fillRect(x+132,y+35,38,38);
    }
    function drawTree(x,y){
        ctx.fillStyle="#79552f";ctx.fillRect(x-9,y,18,55);
        ctx.fillStyle="#4d9b50";for(const [dx,dy,r] of [[0,-8,30],[-22,4,22],[22,4,22]]){ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,7);ctx.fill();}
    }
    function sign(x,y,w,text){
        ctx.fillStyle="#79552f";ctx.fillRect(x+w/2-4,y,8,120);
        ctx.fillStyle="#f5e1a5";ctx.fillRect(x,y-45,w,48);
        ctx.fillStyle="#54351f";ctx.font="18px Arial";ctx.fillText(text,x+10,y-17);
    }
    function drawControls(w,h){
        const j={x:105,y:h-120};
        ctx.fillStyle="rgba(25,35,50,.55)";ctx.beginPath();ctx.arc(j.x,j.y,64,0,7);ctx.fill();
        ctx.fillStyle="rgba(225,235,245,.9)";ctx.beginPath();ctx.arc(j.x,j.y,28,0,7);ctx.fill();
        ctx.fillStyle="white";ctx.font="15px Arial";ctx.fillText("MOVE",j.x-29,j.y+72);
        ctx.fillStyle="rgba(70,125,215,.85)";ctx.beginPath();ctx.arc(w-120,h-120,58,0,7);ctx.fill();
        ctx.fillStyle="white";ctx.font="20px Arial";ctx.fillText("JUMP",w-152,h-110);
        ctx.font="18px Arial";ctx.fillText("PC: A/D or arrows  •  SPACE/W = jump",w/2-220,h-40);
    }

    function frame(now){
        const dt=Math.min((now-state.last)/1000,.033); state.last=now;
        update(dt); draw(); raf=requestAnimationFrame(frame);
    }
    document.getElementById("loading")?.remove();
    raf=requestAnimationFrame(frame);
}
