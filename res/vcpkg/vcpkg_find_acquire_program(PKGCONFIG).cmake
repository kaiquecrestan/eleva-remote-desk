# Eleva Remote Desk - Override for vcpkg_find_acquire_program(PKGCONFIG)
# Points directly to available pkg-config executables without hardcoding missing directories

if(DEFINED "ENV{PKG_CONFIG}" AND EXISTS "$ENV{PKG_CONFIG}")
    set(PKGCONFIG "$ENV{PKG_CONFIG}" CACHE INTERNAL "")
    set("${program}" "$ENV{PKG_CONFIG}" PARENT_SCOPE)
    return()
endif()

if(EXISTS "C:/ProgramData/chocolatey/bin/pkg-config.exe")
    set(PKGCONFIG "C:/ProgramData/chocolatey/bin/pkg-config.exe" CACHE INTERNAL "")
    set("${program}" "C:/ProgramData/chocolatey/bin/pkg-config.exe" PARENT_SCOPE)
    return()
endif()

if(EXISTS "C:/msys64/mingw64/bin/pkg-config.exe")
    set(PKGCONFIG "C:/msys64/mingw64/bin/pkg-config.exe" CACHE INTERNAL "")
    set("${program}" "C:/msys64/mingw64/bin/pkg-config.exe" PARENT_SCOPE)
    return()
endif()

if(EXISTS "C:/msys64/usr/bin/pkg-config.exe")
    set(PKGCONFIG "C:/msys64/usr/bin/pkg-config.exe" CACHE INTERNAL "")
    set("${program}" "C:/msys64/usr/bin/pkg-config.exe" PARENT_SCOPE)
    return()
endif()
