# Gravity

A C# 2D platformer built for the browser with Blazor WebAssembly.

## First village lesson

You begin at the character's house in a small village. Mira teaches the basic parkour controls while you travel across a simple platform route.

### Current features
- C# gameplay logic
- 2D platformer physics
- Village with multiple houses and trees
- Character's starting house
- Friendly tutorial character named Mira
- Beginner parkour route
- Respawn when falling
- Tutorial signs
- Completion banner and lesson message
- Desktop controls
- On-screen mobile joystick
- On-screen mobile jump button
- Camera that follows the player
- Browser/WebAssembly build through GitHub Pages

### Controls

**Desktop**
- A / D or Left / Right — move
- Space / W / Up — jump

**Mobile**
- Left virtual joystick — move
- Right JUMP button — jump

## Build

The project uses C#/.NET 8 and Blazor WebAssembly.

Run `dotnet restore`, then `dotnet build`, then `dotnet run`.

GitHub Actions publishes the browser version to GitHub Pages whenever `main` is updated.

## Planned next steps

1. Add real character art and animations.
2. Add dialogue when you approach Mira.
3. Add more village NPCs and buildings.
4. Add the first Gravity-specific ability.
5. Add checkpoints and multiple parkour lessons.
6. Add sound and music.