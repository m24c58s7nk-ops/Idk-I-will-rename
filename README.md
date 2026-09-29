# Gravity

A C++ 2D platformer prototype built with **Raylib**.

## First village lesson

You begin at the character's house in a small village. Mira teaches the basic parkour controls while you travel across a simple platform route.

### Current features
- 2D platformer physics
- Village with multiple houses and trees
- Character's starting house
- Friendly tutorial character named Mira
- Beginner parkour route
- Checkpoint-style respawn when falling
- Tutorial signs
- Completion banner and lesson message
- Desktop controls
- On-screen mobile joystick
- On-screen mobile jump button
- Camera that follows the player

### Controls

**Desktop**
- A / D or Left / Right — move
- Space / W / Up — jump

**Mobile**
- Left virtual joystick — move
- Right JUMP button — jump

## Build

The project uses C++17 and CMake. Raylib is downloaded automatically by CMake.

```bash
cmake -S . -B build
cmake --build build
./build/Gravity
```

## Planned next steps

1. Add real character art and animations.
2. Add dialogue when you approach Mira.
3. Add more village NPCs and buildings.
4. Add the first Gravity-specific ability.
5. Add checkpoints and multiple parkour lessons.
6. Add sound and music.
7. Prepare a browser/mobile build so the game can be tested without a desktop window.
