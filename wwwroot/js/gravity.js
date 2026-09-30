export function startGravity(id, dotnet) {
    const canvas=document.getElementById(id);
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const keys=new Set(), touches=new Map();
    let last=performance.now(), state={x:120,y:500,finished:false,messageTimer:0};

    function resize(){
        const dpr=Math.min(devicePixelRatio||1,2);
        canvas.width=Math.max(1,Math.floor(canvas.clientWidth*dpr));
        canvas.height=Math.max(1,Math.floor(canvas.clientHeight*dpr));
        ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    new ResizeObserver(resize).observe(canvas); resize();
    addEventListener("keydown",e=>{keys.add(e.code);if(["Space","ArrowUp","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();});
    addEventListener("keyup",e=>keys.delete(e.code));
    canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});});
    canvas.addEventListener("pointermove",e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});});
    canvas.addEventListener("pointerup",e=>touches.delete(e.pointerId));
    canvas.addEventListener("pointercancel",e=>touches.delete(e.pointerId));

    function input(){
        const w=canvas.clientWidth,h=canvas.clientHeight,joy={x:105,y:h-120},jb={x:w-120,y:h-120};
        let move=(keys.has("KeyD")||keys.has("ArrowRight")?1:0)-(keys.has("KeyA")||keys.has("ArrowLeft")?1:0);
        let jump=keys.has("Space")||keys.has("KeyW")||keys.has("ArrowUp");
        for(const t of touches.values()){
            const dx=t.x-joy.x,dy=t.y-joy.y,d=Math.hypot(dx,dy);
            if(t.x<w*.45&&d<110&&d>1)move=Math.max(-1,Math.min(1,dx/62));
            if(Math.hypot(t.x-jb.x,t.y-jb.y)<58)jump=true;
        }
        return {move,jump};
    }

    function house(x,y,wall,roof){
        ctx.fillStyle=wall;ctx.fillRect(x,y,190,130);
        ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-15,y);ctx.lineTo(x+95,y-80);ctx.lineTo(x+205,y);ctx.fill();
        ctx.fillStyle="#60402f";ctx.fillRect(x+72,y+70,45,60);
        ctx.fillStyle="#87ceeb";ctx.fillRect(x+20,y+35,38,38);ctx.fillRect(x+132,y+35,38,38);
    }
    function tree(x,y){
        ctx.fillStyle="#79552f";ctx.fillRect(x-9,y,18,55);ctx.fillStyle="#4d9b50";
        for(const [dx,dy,r] of [[0,-8,30],[-22,4,22],[22,4,22]]){ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,7);ctx.fill();}
    }
    function sign(x,y,w,text){
        ctx.fillStyle="#79552f";ctx.fillRect(x+w/2-4,y,8,120);ctx.fillStyle="#f5e1a5";ctx.fillRect(x,y-45,w,48);
        ctx.fillStyle="#54351f";ctx.font="18px Arial";ctx.fillText(text,x+10,y-17);
    }

    function draw(){
        const w=canvas.clientWidth,h=canvas.clientHeight;
        ctx.clearRect(0,0,w,h);ctx.fillStyle="#91cdf5";ctx.fillRect(0,0,w,h);
        const camera=Math.max(0,Math.min(state.x-250,2160-w));
        ctx.save();ctx.translate(-camera,0);
        ctx.fillStyle="#f6d34a";ctx.beginPath();ctx.arc(1050,110,65,0,7);ctx.fill();
        ctx.fillStyle="#aabfa0";
        for(const m of [[0,620,420,360,850,620],[650,620,1150,330,1650,620],[1450,620,1820,380,2200,620]]){
            ctx.beginPath();ctx.moveTo(m[0],m[1]);ctx.lineTo(m[2],m[3]);ctx.lineTo(m[4],m[5]);ctx.fill();
        }
        house(-30,490,"#ebcd96","#964b37");house(520,490,"#dcb987","#785041");house(900,500,"#d2af7d","#7d4b37");
        for(const x of [370,760,1160,1450,1760])tree(x,560);
        ctx.fillStyle="#cdb487";ctx.fillRect(0,585,2200,35);
        const p=[[0,620,2200,100],[260,540,120,24],[430,470,120,24],[610,400,120,24],[800,330,130,24],[1000,270,150,24],[1210,360,110,24],[1370,300,120,24],[1510,240,150,24],[1690,330,150,24],[1880,270,180,24]];
        p.forEach((a,i)=>{ctx.fillStyle=i?"#697f9b":"#698269";ctx.fillRect(...a);if(i){ctx.fillStyle="#87d7f5";ctx.fillRect(a[0],a[1],a[2],5);}});
        sign(150,465,100,"MOVE  ->");sign(300,385,120,"JUMP!");sign(700,245,140,"KEEP GOING");
        ctx.fillStyle="#f5be96";ctx.beginPath();ctx.arc(536,445,16,0,7);ctx.fill();ctx.fillStyle="#3565b5";ctx.fillRect(520,461,32,40);
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(530,442,3,0,7);ctx.arc(542,442,3,0,7);ctx.fill();ctx.fillStyle="#193d86";ctx.font="18px Arial";ctx.fillText("Mira",515,410);
        ctx.fillStyle="#f5e1a5";ctx.fillRect(1840,210,210,60);ctx.fillStyle="#54351f";ctx.font="22px Arial";ctx.fillText("VILLAGE TRAIL",1860,247);
        /* Player character */
        const px=state.x, py=state.y;
        ctx.fillStyle="#f2c29f";ctx.beginPath();ctx.arc(px+17,py+11,11,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#5a3526";ctx.beginPath();ctx.arc(px+17,py+7,12,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle="#2d6cdf";ctx.fillRect(px+4,py+21,26,21);
        ctx.fillStyle="#f2c29f";ctx.fillRect(px+1,py+24,5,15);ctx.fillRect(px+28,py+24,5,15);
        ctx.fillStyle="#26364a";ctx.fillRect(px+6,py+41,9,9);ctx.fillRect(px+19,py+41,9,9);
        ctx.fillStyle="#17202a";ctx.fillRect(px+10,py+10,3,3);ctx.fillRect(px+21,py+10,3,3);
        ctx.restore();

        ctx.fillStyle="rgba(20,30,45,.86)";ctx.fillRect(0,0,w,74);ctx.fillStyle="white";ctx.font="bold 32px Arial";ctx.fillText("GRAVITY",28,43);
        ctx.font="22px Arial";ctx.fillStyle="#ddd";ctx.fillText("Village Parkour Lesson",190,43);ctx.font="18px Arial";ctx.fillStyle="white";
        ctx.fillText(state.finished?"Lesson complete! More gravity abilities coming next.":"Reach the trail sign to finish the first lesson.",520,43);
        ctx.fillStyle="rgba(25,35,50,.55)";ctx.beginPath();ctx.arc(105,h-120,64,0,7);ctx.fill();ctx.fillStyle="rgba(225,235,245,.9)";ctx.beginPath();ctx.arc(105,h-120,28,0,7);ctx.fill();
        ctx.fillStyle="white";ctx.font="15px Arial";ctx.fillText("MOVE",76,h-48);ctx.fillStyle="rgba(70,125,215,.85)";ctx.beginPath();ctx.arc(w-120,h-120,58,0,7);ctx.fill();
        ctx.fillStyle="white";ctx.font="20px Arial";ctx.fillText("JUMP",w-152,h-110);ctx.font="18px Arial";ctx.fillText("PC: A/D or arrows  •  SPACE/W = jump",w/2-220,h-40);
        if(state.messageTimer>0){ctx.fillStyle="rgba(20,30,45,.9)";ctx.fillRect(w/2-340,105,680,72);ctx.fillStyle="white";ctx.font="22px Arial";ctx.fillText("Mira: Great job! You learned the basics of parkour.",w/2-305,135);ctx.fillStyle="#ddd";ctx.font="19px Arial";ctx.fillText("Next, we'll learn what makes Gravity different.",w/2-285,161);}
    }

    async function frame(now){
        last=now; const i=input();
        state=await dotnet.invokeMethodAsync("Tick",i.move,i.jump);
        draw(); requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
