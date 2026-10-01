export function startGravity(id, dotnet) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const keys = new Set();
    const touches = new Map();
    let state = { x: 120, y: 500, finished: false, messageTimer: 0 };

    function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    new ResizeObserver(resize).observe(canvas);
    resize();

    addEventListener("keydown", e => {
        keys.add(e.code);
        if (["Space", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    });
    addEventListener("keyup", e => keys.delete(e.code));

    canvas.addEventListener("pointerdown", e => {
        canvas.setPointerCapture(e.pointerId);
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("pointermove", e => {
        if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("pointerup", e => touches.delete(e.pointerId));
    canvas.addEventListener("pointercancel", e => touches.delete(e.pointerId));

    function input() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        const joy = { x: 105, y: h - 120 }, jb = { x: w - 120, y: h - 120 };
        let move = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
                   (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
        let jump = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");

        for (const t of touches.values()) {
            const dx = t.x - joy.x, dy = t.y - joy.y, d = Math.hypot(dx, dy);
            if (t.x < w * .45 && d < 110 && d > 1)
                move = Math.max(-1, Math.min(1, dx / 62));
            if (Math.hypot(t.x - jb.x, t.y - jb.y) < 58) jump = true;
        }
        return { move, jump };
    }

    function roundedRect(x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function cloud(x, y, s, a) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        for (const [dx, dy, r] of [[0,0,25],[28,-13,34],[63,0,24]]) {
            ctx.beginPath();
            ctx.arc(x + dx*s, y + dy*s, r*s, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }

    function mountain(points, color, snow) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i=1;i<points.length;i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fill();
        if (snow) {
            ctx.fillStyle = snow;
            ctx.beginPath();
            const peak = points[Math.floor(points.length / 2)];
            ctx.moveTo(peak[0], peak[1]);
            ctx.lineTo(peak[0] - 75, peak[1] + 75);
            ctx.lineTo(peak[0] + 75, peak[1] + 75);
            ctx.closePath();
            ctx.fill();
        }
    }

    function house(x, y, wall, roof) {
        ctx.fillStyle = "rgba(25,25,20,.24)";
        ctx.beginPath();
        ctx.ellipse(x+95,y+134,118,15,0,0,Math.PI*2); ctx.fill();

        const wg = ctx.createLinearGradient(x,y,x,y+130);
        wg.addColorStop(0,wall); wg.addColorStop(1,"#94775a");
        ctx.fillStyle=wg; roundedRect(x,y,190,130,5); ctx.fill();

        ctx.strokeStyle="rgba(65,45,30,.18)"; ctx.lineWidth=2;
        for(let yy=y+12;yy<y+130;yy+=15){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+187,yy);ctx.stroke();}

        const rg=ctx.createLinearGradient(x,y-84,x,y+5);
        rg.addColorStop(0,"#b86d4f");rg.addColorStop(.55,roof);rg.addColorStop(1,"#58342a");
        ctx.fillStyle=rg;
        ctx.beginPath();ctx.moveTo(x-20,y+3);ctx.lineTo(x+95,y-84);ctx.lineTo(x+210,y+3);ctx.closePath();ctx.fill();

        ctx.strokeStyle="rgba(45,25,20,.35)";ctx.lineWidth=2;
        for(let i=0;i<8;i++){let yy=y-63+i*9,half=28+i*12;ctx.beginPath();ctx.moveTo(x+95-half,yy);ctx.lineTo(x+95+half,yy);ctx.stroke();}

        const dg=ctx.createLinearGradient(x+72,y+70,x+117,y+130);
        dg.addColorStop(0,"#80533a");dg.addColorStop(1,"#3d2922");
        ctx.fillStyle=dg;ctx.fillRect(x+72,y+70,45,60);
        ctx.fillStyle="#d7b36b";ctx.beginPath();ctx.arc(x+108,y+101,3,0,Math.PI*2);ctx.fill();

        for(const wx of [x+20,x+132]){
            const g=ctx.createLinearGradient(wx,y+35,wx+38,y+73);
            g.addColorStop(0,"#e2f7ff");g.addColorStop(.5,"#75b9d3");g.addColorStop(1,"#315e79");
            ctx.fillStyle=g;ctx.fillRect(wx,y+35,38,38);
            ctx.strokeStyle="#5a4235";ctx.lineWidth=4;ctx.strokeRect(wx,y+35,38,38);
            ctx.beginPath();ctx.moveTo(wx+19,y+35);ctx.lineTo(wx+19,y+73);ctx.moveTo(wx,y+54);ctx.lineTo(wx+38,y+54);ctx.stroke();
        }

        ctx.fillStyle="#6c4638";ctx.fillRect(x+142,y-48,20,45);
        ctx.fillStyle="rgba(245,245,245,.42)";
        for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x+152+i*5,y-57-i*18,8+i*2,0,Math.PI*2);ctx.fill();}
    }

    function tree(x,y,s=1) {
        ctx.fillStyle="rgba(30,40,20,.24)";
        ctx.beginPath();ctx.ellipse(x,y+5,42*s,10*s,0,0,Math.PI*2);ctx.fill();

        const tg=ctx.createLinearGradient(x-10*s,y-60*s,x+10*s,y);
        tg.addColorStop(0,"#8b633e");tg.addColorStop(.5,"#60432d");tg.addColorStop(1,"#39291f");
        ctx.fillStyle=tg;ctx.fillRect(x-9*s,y-60*s,18*s,65*s);

        ctx.strokeStyle="#503724";ctx.lineWidth=8*s;
        ctx.beginPath();ctx.moveTo(x,y-45*s);ctx.lineTo(x-24*s,y-75*s);ctx.moveTo(x+1*s,y-35*s);ctx.lineTo(x+25*s,y-65*s);ctx.stroke();

        for(const [dx,dy,r] of [[0,-85,35],[-27,-68,25],[27,-67,27],[-7,-112,27],[18,-94,25],[-25,-96,24]]){
            const g=ctx.createRadialGradient(x+dx*s-r*.35,y+dy*s-r*.35,2,x+dx*s,y+dy*s,r*s);
            g.addColorStop(0,"#7fb56a");g.addColorStop(.6,"#397844");g.addColorStop(1,"#205334");
            ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2);ctx.fill();
        }
    }

    function sign(x,y,w,text) {
        ctx.fillStyle="rgba(30,25,20,.22)";
        ctx.beginPath();ctx.ellipse(x+w/2,y+7,w*.55,8,0,0,Math.PI*2);ctx.fill();
        const pg=ctx.createLinearGradient(x+w/2-5,y,x+w/2+5,y+120);
        pg.addColorStop(0,"#9a7048");pg.addColorStop(1,"#493222");
        ctx.fillStyle=pg;ctx.fillRect(x+w/2-5,y,10,120);
        const bg=ctx.createLinearGradient(x,y-45,x,y+3);
        bg.addColorStop(0,"#f2dca7");bg.addColorStop(1,"#b98b52");
        ctx.fillStyle=bg;roundedRect(x,y-45,w,48,5);ctx.fill();
        ctx.strokeStyle="#65452c";ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle="#4d3625";ctx.font="bold 17px Arial";ctx.fillText(text,x+10,y-16);
    }

    function player(px,py) {
        ctx.fillStyle="rgba(20,25,30,.28)";
        ctx.beginPath();ctx.ellipse(px+17,py+52,18,5,0,0,Math.PI*2);ctx.fill();

        const pg=ctx.createLinearGradient(px+6,py+39,px+28,py+51);
        pg.addColorStop(0,"#425d78");pg.addColorStop(1,"#1d2d3d");
        ctx.fillStyle=pg;roundedRect(px+6,py+39,9,12,2);ctx.fill();
        roundedRect(px+19,py+39,9,12,2);ctx.fill();

        ctx.fillStyle="#20252b";
        roundedRect(px+4,py+48,12,5,2);ctx.fill();
        roundedRect(px+18,py+48,12,5,2);ctx.fill();

        const sg=ctx.createLinearGradient(px+4,py+20,px+30,py+43);
        sg.addColorStop(0,"#4e8ff1");sg.addColorStop(.55,"#2865bf");sg.addColorStop(1,"#173b77");
        ctx.fillStyle=sg;roundedRect(px+4,py+20,26,22,5);ctx.fill();

        ctx.fillStyle="#d89d78";
        roundedRect(px,py+24,6,17,3);ctx.fill();
        roundedRect(px+28,py+24,6,17,3);ctx.fill();
        ctx.fillRect(px+13,py+17,8,7);

        const skin=ctx.createRadialGradient(px+12,py+3,2,px+17,py+11,15);
        skin.addColorStop(0,"#f6c7a2");skin.addColorStop(1,"#bd765b");
        ctx.fillStyle=skin;ctx.beginPath();ctx.arc(px+17,py+11,12,0,Math.PI*2);ctx.fill();

        ctx.fillStyle="#39271f";ctx.beginPath();ctx.arc(px+17,py+7,12,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(px+5,py+6,5,7);
        ctx.fillStyle="#17202a";ctx.beginPath();ctx.arc(px+13,py+11,1.8,0,Math.PI*2);ctx.arc(px+21,py+11,1.8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgba(255,255,255,.65)";ctx.beginPath();ctx.arc(px+13.5,py+10.5,.7,0,Math.PI*2);ctx.arc(px+21.5,py+10.5,.7,0,Math.PI*2);ctx.fill();
    }

    function draw() {
        const w=canvas.clientWidth,h=canvas.clientHeight;
        const sky=ctx.createLinearGradient(0,0,0,h);
        sky.addColorStop(0,"#4d9ed6");sky.addColorStop(.45,"#a9d8ef");sky.addColorStop(1,"#e6d7b9");
        ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

        const camera=Math.max(0,Math.min(state.x-250,2160-w));
        ctx.save();ctx.translate(-camera,0);

        const glow=ctx.createRadialGradient(1050,110,10,1050,110,160);
        glow.addColorStop(0,"rgba(255,248,190,.95)");glow.addColorStop(.35,"rgba(255,230,130,.35)");glow.addColorStop(1,"rgba(255,220,120,0)");
        ctx.fillStyle=glow;ctx.fillRect(850,-80,400,380);
        ctx.fillStyle="#fff2a9";ctx.beginPath();ctx.arc(1050,110,52,0,Math.PI*2);ctx.fill();

        cloud(250,120,1,.72);cloud(750,170,.75,.6);cloud(1500,105,.9,.7);cloud(1880,170,.7,.58);

        mountain([[0,620],[420,300],[850,620]],"#78939a","#a9b8b3");
        mountain([[650,620],[1150,250],[1650,620]],"#667f88","#a1afb0");
        mountain([[1450,620],[1820,320],[2200,620]],"#72888c","#aab5ae");
        ctx.fillStyle="rgba(225,235,225,.16)";ctx.fillRect(0,260,2200,330);

        const ground=ctx.createLinearGradient(0,585,0,620);
        ground.addColorStop(0,"#b89a70");ground.addColorStop(1,"#786248");
        ctx.fillStyle=ground;ctx.fillRect(0,585,2200,35);
        ctx.strokeStyle="rgba(48,85,45,.32)";ctx.lineWidth=1;
        for(let gx=0;gx<2200;gx+=24){ctx.beginPath();ctx.moveTo(gx,584);ctx.lineTo(gx+4,577);ctx.moveTo(gx+9,585);ctx.lineTo(gx+13,579);ctx.stroke();}

        house(-30,490,"#e5c58e","#884735");
        house(520,490,"#c9ad80","#69483b");
        house(900,500,"#c5a16e","#754332");

        for(const [x,s] of [[370,.9],[760,1.05],[1160,.8],[1450,1.1],[1760,.95]]) tree(x,560,s);

        const platforms=[[0,620,2200,100],[260,540,120,24],[430,470,120,24],[610,400,120,24],[800,330,130,24],[1000,270,150,24],[1210,360,110,24],[1370,300,120,24],[1510,240,150,24],[1690,330,150,24],[1880,270,180,24]];
        platforms.forEach((a,i)=>{
            if(!i)return;
            ctx.fillStyle="rgba(20,35,45,.25)";roundedRect(a[0]+3,a[1]+5,a[2],a[3],5);ctx.fill();
            const stone=ctx.createLinearGradient(a[0],a[1],a[0],a[1]+a[3]);
            stone.addColorStop(0,"#8799a7");stone.addColorStop(.45,"#657887");stone.addColorStop(1,"#3e4d5a");
            ctx.fillStyle=stone;roundedRect(a[0],a[1],a[2],a[3],5);ctx.fill();
            ctx.fillStyle="#8fdb9c";roundedRect(a[0],a[1],a[2],5,2);ctx.fill();
            ctx.strokeStyle="rgba(255,255,255,.16)";ctx.lineWidth=1;
            for(let tx=a[0]+12;tx<a[0]+a[2];tx+=28){ctx.beginPath();ctx.moveTo(tx,a[1]+7);ctx.lineTo(tx+7,a[1]+a[3]-4);ctx.stroke();}
        });

        sign(150,465,100,"MOVE  →");sign(300,385,120,"JUMP!");sign(700,245,140,"KEEP GOING");

        ctx.fillStyle="rgba(20,25,30,.22)";ctx.beginPath();ctx.ellipse(536,502,20,5,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#e1aa85";ctx.beginPath();ctx.arc(536,445,16,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#39271f";ctx.beginPath();ctx.arc(536,441,16,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle="#356fc8";roundedRect(520,461,32,40,5);ctx.fill();
        ctx.fillStyle="#17202a";ctx.beginPath();ctx.arc(530,444,2,0,Math.PI*2);ctx.arc(542,444,2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#193d86";ctx.font="bold 18px Arial";ctx.fillText("Mira",515,410);

        ctx.fillStyle="rgba(35,25,15,.25)";ctx.fillRect(1840,270,210,8);
        const finish=ctx.createLinearGradient(1840,210,1840,270);
        finish.addColorStop(0,"#f5dfaa");finish.addColorStop(1,"#b88a51");
        ctx.fillStyle=finish;roundedRect(1840,210,210,60,6);ctx.fill();
        ctx.strokeStyle="#60432b";ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle="#54351f";ctx.font="bold 22px Arial";ctx.fillText("VILLAGE TRAIL",1860,247);

        player(state.x,state.y);
        ctx.restore();

        const panel=ctx.createLinearGradient(0,0,0,74);
        panel.addColorStop(0,"rgba(15,24,35,.94)");panel.addColorStop(1,"rgba(15,24,35,.76)");
        ctx.fillStyle=panel;ctx.fillRect(0,0,w,74);
        ctx.fillStyle="white";ctx.font="bold 32px Arial";ctx.fillText("GRAVITY",28,43);
        ctx.font="22px Arial";ctx.fillStyle="#d8e5ee";ctx.fillText("Village Parkour Lesson",190,43);
        ctx.font="18px Arial";ctx.fillStyle="white";
        ctx.fillText(state.finished?"Lesson complete! More gravity abilities coming next.":"Reach the trail sign to finish the first lesson.",520,43);

        ctx.fillStyle="rgba(15,25,35,.48)";ctx.beginPath();ctx.arc(105,h-120,64,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgba(235,245,250,.9)";ctx.beginPath();ctx.arc(105,h-120,28,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="white";ctx.font="15px Arial";ctx.fillText("MOVE",76,h-48);

        const jg=ctx.createRadialGradient(w-135,h-135,8,w-120,h-120,58);
        jg.addColorStop(0,"rgba(105,160,235,.95)");jg.addColorStop(1,"rgba(45,90,160,.85)");
        ctx.fillStyle=jg;ctx.beginPath();ctx.arc(w-120,h-120,58,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="white";ctx.font="bold 20px Arial";ctx.fillText("JUMP",w-152,h-110);
        ctx.font="18px Arial";ctx.fillText("PC: A/D or arrows  •  SPACE/W = jump",w/2-220,h-40);

        if(state.messageTimer>0){
            const box=ctx.createLinearGradient(0,105,0,177);
            box.addColorStop(0,"rgba(20,30,45,.96)");box.addColorStop(1,"rgba(20,30,45,.82)");
            ctx.fillStyle=box;roundedRect(w/2-340,105,680,72,10);ctx.fill();
            ctx.strokeStyle="rgba(255,255,255,.2)";ctx.stroke();
            ctx.fillStyle="white";ctx.font="22px Arial";ctx.fillText("Mira: Great job! You learned the basics of parkour.",w/2-305,135);
            ctx.fillStyle="#d8e0e8";ctx.font="19px Arial";ctx.fillText("Next, we'll learn what makes Gravity different.",w/2-285,161);
        }
    }

    let tickInFlight = false;
    let tickError = null;

    async function updateGameState() {
        if (tickInFlight) return;
        tickInFlight = true;

        try {
            const i = input();
            state = await dotnet.invokeMethodAsync("Tick", i.move, i.jump);
            tickError = null;
        } catch (err) {
            tickError = err;
            console.error("Gravity Tick failed:", err);
        } finally {
            tickInFlight = false;
        }
    }

    function frame() {
        // Always render first so a C# interop problem cannot leave a blank/blue screen.
        draw();

        if (tickError) {
            const w = canvas.clientWidth;
            ctx.fillStyle = "rgba(120,25,25,.92)";
            roundedRect(w / 2 - 260, 88, 520, 58, 8);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "bold 16px Arial";
            ctx.fillText("Game update connection error — rendering is still running.", w / 2 - 235, 123);
        }

        updateGameState();
        requestAnimationFrame(frame);
    }

    // Draw immediately, before the first C# call.
    draw();
    requestAnimationFrame(frame);
}
