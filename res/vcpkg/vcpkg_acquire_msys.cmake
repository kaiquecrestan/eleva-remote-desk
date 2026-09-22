# Eleva Remote Desk - Override for vcpkg_acquire_msys
# Uses pre-installed host MSYS2 (C:/msys64) on Windows runners to bypass broken/unmaintained MSYS2 mirrors.

function(vcpkg_acquire_msys out_msys_root)
    cmake_parse_arguments(PARSE_ARGV 1 "arg" "NO_DEFAULT_PACKAGES" "" "PACKAGES;DIRECT_PACKAGES")
    message(STATUS "Using host system MSYS2 root at C:/msys64")
    set("${out_msys_root}" "C:/msys64" PARENT_SCOPE)
endfunction()
