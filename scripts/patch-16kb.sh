#!/bin/bash

# Script para parchear React Native y dependencias para soporte de 16 KB
# Este script modifica los archivos CMakeLists.txt de React Native

set -e

echo "🔧 Parcheando React Native para soporte de 16 KB..."
echo ""

RN_PATH="node_modules/react-native"
HERMES_PATH="node_modules/react-native/sdks/hermes"

# Función para agregar flags de 16 KB a un archivo CMakeLists.txt
patch_cmake_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "  Parcheando: $file"
        
        # Verificar si ya tiene el parche
        if grep -q "max-page-size=16384" "$file"; then
            echo "    ✓ Ya parcheado"
            return
        fi
        
        # Agregar flags de linker para 16 KB
        # Buscar set(CMAKE_CXX_FLAGS o add_link_options y agregar después
        if grep -q "CMAKE_CXX_FLAGS" "$file"; then
            sed -i.bak '/CMAKE_CXX_FLAGS/a\
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")\
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-z,max-page-size=16384")
' "$file"
            echo "    ✓ Parcheado (método 1)"
        else
            # Si no encuentra CMAKE_CXX_FLAGS, agregar al inicio del archivo después de project()
            sed -i.bak '/^project(/a\
\
# Soporte para páginas de 16 KB\
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")\
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-z,max-page-size=16384")
' "$file"
            echo "    ✓ Parcheado (método 2)"
        fi
    fi
}

# Función para parchear archivos Android.mk
patch_android_mk() {
    local file=$1
    if [ -f "$file" ]; then
        echo "  Parcheando: $file"
        
        if grep -q "max-page-size=16384" "$file"; then
            echo "    ✓ Ya parcheado"
            return
        fi
        
        # Agregar LDFLAGS
        echo "" >> "$file"
        echo "# Soporte para 16 KB" >> "$file"
        echo "LOCAL_LDFLAGS += -Wl,-z,max-page-size=16384" >> "$file"
        echo "    ✓ Parcheado"
    fi
}

echo "📦 Parcheando React Native..."
find "$RN_PATH/ReactAndroid" -name "CMakeLists.txt" -type f | while read file; do
    patch_cmake_file "$file"
done

find "$RN_PATH/ReactAndroid" -name "Android.mk" -type f | while read file; do
    patch_android_mk "$file"
done

echo ""
echo "📦 Parcheando Hermes..."
if [ -d "$HERMES_PATH" ]; then
    find "$HERMES_PATH" -name "CMakeLists.txt" -type f | while read file; do
        patch_cmake_file "$file"
    done
fi

echo ""
echo "📦 Parcheando módulos Expo..."
find "node_modules/expo-modules-core/android" -name "CMakeLists.txt" -type f 2>/dev/null | while read file; do
    patch_cmake_file "$file"
done

find "node_modules/expo-modules-core/android" -name "Android.mk" -type f 2>/dev/null | while read file; do
    patch_android_mk "$file"
done

echo ""
echo "✅ Parches aplicados correctamente"
echo ""
echo "⚠️  IMPORTANTE: Este parche es temporal y se perderá si ejecutas:"
echo "   - yarn install"
echo "   - npm install"
echo "   - Borras node_modules"
echo ""
echo "💡 Solución: Agrega este script a 'postinstall' en package.json"
echo ""
