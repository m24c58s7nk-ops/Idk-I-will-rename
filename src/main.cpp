#include "raylib.h"
#ifdef PLATFORM_WEB
#include <emscripten/emscripten.h>
#endif
#include <algorithm>
#include <cmath>
#include <vector>

struct Platform { Rectangle r; };
struct Player {
    Vector2 pos{120, 500};
    Vector2 vel{0, 0};
    Vector2 size{34, 50};
    bool grounded = false;
};

static Player player;
static Camera2D camera{};
static std::vector<Platform> platforms;
static const Vector2 spawn{120, 500};
static bool finishedTutorial = false;
static float messageTimer = 0.0f;

static float ClampFloat(float v, float lo, float hi) {
    return std::max(lo, std::min(v, hi));
}

static bool OverlapX(const Rectangle& a, const Rectangle& b) {
    return a.x < b.x + b.width && a.x + a.width > b.x;
}

static void DrawHouse(Vector2 p, Color wall, Color roof) {
    DrawRectangle((int)p.x, (int)p.y, 190, 130, wall);
    DrawTriangle({p.x - 15, p.y}, {p.x + 95, p.y - 80}, {p.x + 205, p.y}, roof);
    DrawRectangle((int)p.x + 72, (int)p.y + 70, 45, 60, DARKBROWN);
    DrawRectangle((int)p.x + 20, (int)p.y + 35, 38, 38, SKYBLUE);
    DrawRectangle((int)p.x + 132, (int)p.y + 35, 38, 38, SKYBLUE);
}

static void DrawTree(Vector2 p) {
    DrawRectangle((int)p.x - 9, (int)p.y, 18, 55, BROWN);
    DrawCircle((int)p.x, (int)p.y - 8, 30, GREEN);
    DrawCircle((int)p.x - 22, (int)p.y + 4, 22, GREEN);
    DrawCircle((int)p.x + 22, (int)p.y + 4, 22, GREEN);
}

static void DrawWorld() {
    DrawCircle(1050, 110, 65, YELLOW);
    DrawCircle(220, 150, 35, WHITE);
    DrawCircle(270, 150, 48, WHITE);
    DrawCircle(320, 150, 35, WHITE);

    DrawTriangle({0, 620}, {420, 360}, {850, 620}, {170, 190, 150, 255});
    DrawTriangle({650, 620}, {1150, 330}, {1650, 620}, {155, 180, 145, 255});
    DrawTriangle({1450, 620}, {1820, 380}, {2200, 620}, {165, 190, 155, 255});

    DrawHouse({-30, 490}, {235, 205, 150, 255}, {150, 75, 55, 255});
    DrawHouse({520, 490}, {220, 185, 135, 255}, {120, 80, 65, 255});
    DrawHouse({900, 500}, {210, 175, 125, 255}, {125, 75, 55, 255});

    for (int x : {370, 760, 1160, 1450, 1760}) DrawTree({(float)x, 560});
    DrawRectangle(0, 585, 2200, 35, {205, 180, 135, 255});

    for (size_t i = 1; i < platforms.size(); ++i) {
        DrawRectangleRec(platforms[i].r, {105, 130, 155, 255});
        DrawRectangle((int)platforms[i].r.x, (int)platforms[i].r.y,
                      (int)platforms[i].r.width, 5, SKYBLUE);
    }
    DrawRectangleRec(platforms[0].r, {105, 130, 105, 255});

    DrawRectangle(195, 510, 8, 75, BROWN);
    DrawRectangle(150, 465, 100, 48, {245, 225, 165, 255});
    DrawText("MOVE  ->", 160, 477, 18, DARKBROWN);

    DrawRectangle(350, 430, 8, 60, BROWN);
    DrawRectangle(300, 385, 120, 48, {245, 225, 165, 255});
    DrawText("JUMP!", 325, 397, 20, DARKBROWN);

    DrawRectangle(760, 290, 8, 45, BROWN);
    DrawRectangle(700, 245, 140, 48, {245, 225, 165, 255});
    DrawText("KEEP GOING", 713, 257, 17, DARKBROWN);

    Vector2 npc{520, 445};
    DrawCircle((int)npc.x + 16, (int)npc.y, 16, {245, 190, 150, 255});
    DrawRectangle((int)npc.x, (int)npc.y + 16, 32, 40, BLUE);
    DrawCircle((int)npc.x + 10, (int)npc.y - 3, 3, BLACK);
    DrawCircle((int)npc.x + 22, (int)npc.y - 3, 3, BLACK);
    DrawText("Mira", (int)npc.x - 5, (int)npc.y - 35, 18, DARKBLUE);

    DrawRectangle(1840, 210, 210, 60, {245, 225, 165, 255});
    DrawText("VILLAGE TRAIL", 1860, 230, 22, DARKBROWN);
    DrawRectangle(1850, 270, 10, 350, BROWN);
    DrawRectangle(2035, 270, 10, 350, BROWN);

    DrawRectangle((int)player.pos.x, (int)player.pos.y, (int)player.size.x,
                  (int)player.size.y, {70, 105, 210, 255});
    DrawCircle((int)player.pos.x + 17, (int)player.pos.y + 12, 12, {245, 195, 155, 255});
    DrawRectangle((int)player.pos.x + 7, (int)player.pos.y + 23, 20, 24, DARKBLUE);
}

static void DrawUI() {
    const int w = GetScreenWidth();
    const int h = GetScreenHeight();
    const Vector2 joystickBase{105, (float)h - 120};
    const float joystickRadius = 62.0f;
    const Vector2 jumpCenter{(float)w - 120, (float)h - 120};
    const float jumpRadius = 58.0f;

    DrawRectangle(0, 0, w, 74, {20, 30, 45, 220});
    DrawText("GRAVITY", 28, 18, 32, WHITE);
    DrawText("Village Parkour Lesson", 190, 25, 22, LIGHTGRAY);

    if (!finishedTutorial)
        DrawText("Reach the trail sign to finish the first lesson.", 520, 28, 18, WHITE);
    else
        DrawText("Lesson complete! More gravity abilities coming next.", 500, 28, 18, GREEN);

    Vector2 knob = joystickBase;
    for (int i = 0; i < GetTouchPointCount(); ++i) {
        Vector2 t = GetTouchPosition(i);
        if (t.x < w * 0.42f) {
            float dx = t.x - joystickBase.x;
            float dy = t.y - joystickBase.y;
            float d = std::sqrt(dx * dx + dy * dy);
            if (d < joystickRadius * 1.7f) {
                float clamped = std::min(d, joystickRadius);
                if (d > 0.01f)
                    knob = {joystickBase.x + dx / d * clamped,
                            joystickBase.y + dy / d * clamped};
            }
        }
    }

    DrawCircleV(joystickBase, joystickRadius + 2, {25, 35, 50, 110});
    DrawCircleV(joystickBase, joystickRadius, {60, 75, 95, 170});
    DrawCircleV(knob, 28, {225, 235, 245, 230});
    DrawText("MOVE", (int)joystickBase.x - 29, (int)joystickBase.y + 72, 15, WHITE);

    DrawCircleV(jumpCenter, jumpRadius + 2, {25, 35, 50, 110});
    DrawCircleV(jumpCenter, jumpRadius, {70, 125, 215, 210});
    DrawText("JUMP", (int)jumpCenter.x - 32, (int)jumpCenter.y - 10, 20, WHITE);

    DrawText("PC: A/D or arrows  •  SPACE/W = jump", w / 2 - 220, h - 40, 18, WHITE);

    if (messageTimer > 0) {
        DrawRectangle(w / 2 - 340, 105, 680, 72, {20, 30, 45, 230});
        DrawText("Mira: Great job! You learned the basics of parkour.",
                 w / 2 - 305, 125, 22, WHITE);
        DrawText("Next, we'll learn what makes Gravity different.",
                 w / 2 - 285, 151, 19, LIGHTGRAY);
    }
}

static void GameFrame() {
    float dt = std::min(GetFrameTime(), 0.033f);
    const int w = GetScreenWidth();
    const int h = GetScreenHeight();

    float move = 0.0f;
    if (IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT)) move -= 1.0f;
    if (IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT)) move += 1.0f;
    bool jumpPressed = IsKeyPressed(KEY_SPACE) || IsKeyPressed(KEY_W) || IsKeyPressed(KEY_UP);

    const Vector2 joystickBase{105, (float)h - 120};
    const float joystickRadius = 62.0f;
    const Vector2 jumpCenter{(float)w - 120, (float)h - 120};
    const float jumpRadius = 58.0f;

    for (int i = 0; i < GetTouchPointCount(); ++i) {
        Vector2 t = GetTouchPosition(i);
        float jumpDx = t.x - jumpCenter.x;
        float jumpDy = t.y - jumpCenter.y;
        if (std::sqrt(jumpDx * jumpDx + jumpDy * jumpDy) < jumpRadius) jumpPressed = true;

        float dx = t.x - joystickBase.x;
        float d = std::sqrt(dx * dx + (t.y - joystickBase.y) * (t.y - joystickBase.y));
        if (t.x < w * 0.42f && d < joystickRadius * 1.7f && d > 0.01f)
            move = ClampFloat(dx / joystickRadius, -1.0f, 1.0f);
    }

    player.vel.x = move * 260.0f;
    player.vel.y += 1250.0f * dt;

    if (jumpPressed && player.grounded) {
        player.vel.y = -540.0f;
        player.grounded = false;
    }

    player.pos.x = ClampFloat(player.pos.x + player.vel.x * dt, 0, 2160 - player.size.x);

    float oldBottom = player.pos.y + player.size.y;
    player.pos.y += player.vel.y * dt;
    player.grounded = false;

    Rectangle playerRect{player.pos.x, player.pos.y, player.size.x, player.size.y};
    for (const auto& p : platforms) {
        if (player.vel.y >= 0 &&
            OverlapX(playerRect, p.r) &&
            oldBottom <= p.r.y + 4 &&
            player.pos.y + player.size.y >= p.r.y) {
            player.pos.y = p.r.y - player.size.y;
            player.vel.y = 0;
            player.grounded = true;
        }
    }

    if (player.pos.y > 800) {
        player.pos = spawn;
        player.vel = {0, 0};
    }

    if (!finishedTutorial && player.pos.x > 1850) {
        finishedTutorial = true;
        messageTimer = 6.0f;
    }
    if (messageTimer > 0) messageTimer -= dt;

    camera.target = {player.pos.x + 170, 360};
    camera.offset = {(float)w / 2.0f, (float)h / 2.0f};

    BeginDrawing();
    ClearBackground({145, 205, 245, 255});
    BeginMode2D(camera);
    DrawWorld();
    EndMode2D();
    DrawUI();
    EndDrawing();
}

int main() {
    const int screenW = 1280;
    const int screenH = 720;
    InitWindow(screenW, screenH, "Gravity - Village Parkour");
    SetTargetFPS(60);

    camera.zoom = 1.0f;
    platforms = {
        {{0, 620, 2200, 100}},
        {{260, 540, 120, 24}},
        {{430, 470, 120, 24}},
        {{610, 400, 120, 24}},
        {{800, 330, 130, 24}},
        {{1000, 270, 150, 24}},
        {{1210, 360, 110, 24}},
        {{1370, 300, 120, 24}},
        {{1510, 240, 150, 24}},
        {{1690, 330, 150, 24}},
        {{1880, 270, 180, 24}}
    };

#ifdef PLATFORM_WEB
    emscripten_set_main_loop(GameFrame, 0, 1);
#else
    while (!WindowShouldClose()) GameFrame();
    CloseWindow();
#endif

    return 0;
}
