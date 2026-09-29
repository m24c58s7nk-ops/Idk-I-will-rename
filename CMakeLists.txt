cmake_minimum_required(VERSION 3.20)
project(Gravity LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

if(EMSCRIPTEN)
    set(PLATFORM Web CACHE STRING "Raylib platform" FORCE)
    set(BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
endif()

FetchContent_Declare(
    raylib
    GIT_REPOSITORY https://github.com/raysan5/raylib.git
    GIT_TAG 5.5
)
FetchContent_MakeAvailable(raylib)

add_executable(Gravity src/main.cpp)
target_link_libraries(Gravity PRIVATE raylib)

if(EMSCRIPTEN)
    set_target_properties(Gravity PROPERTIES SUFFIX ".html")
    target_link_options(Gravity PRIVATE
        "-sALLOW_MEMORY_GROWTH=1"
        "-sASYNCIFY"
        "-sMIN_WEBGL_VERSION=1"
        "-sMAX_WEBGL_VERSION=2"
    )
endif()
