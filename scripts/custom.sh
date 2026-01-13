#!/bin/bash

# Validar que se pasó un argumento
if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar el ambiente (default o nlinea)"
    echo "Uso: ./scripts/custom.sh [default|nlinea]"
    exit 1
fi

# Validar que el directorio del ambiente existe
if [ ! -d "./scripts/$1" ]; then
    echo "❌ Error: El directorio ./scripts/$1 no existe"
    exit 1
fi

echo "🔧 Configurando ambiente: $1"

# Copiar archivos de configuración
echo "📄 Copiando archivos de configuración..."
cp ./scripts/$1/config/agent/default.ts ./src/config/agent.ts || echo "⚠️  Config file not found"
cp ./scripts/$1/config/extra/default.ts ./src/config/extra.ts || echo "⚠️  Extra file not found"
cp ./scripts/$1/config/styles.ts ./src/config/styles.ts || echo "⚠️  Styles file not found"

# Actualizar app.json
echo "📱 Actualizando app.json..."
config_file="./scripts/$1/config/app/default.txt"
file="./app.json"

# Verificar que existe el archivo de configuración
if [ ! -f "$config_file" ]; then
    echo "⚠️  Archivo de configuración no encontrado: $config_file"
else
    # Verificar que jq está instalado
    if ! command -v jq &> /dev/null; then
        echo "❌ Error: jq no está instalado. Instálalo con: brew install jq"
        exit 1
    fi

    name=$(grep "name=" "$config_file" | cut -d'=' -f2)
    identifier=$(grep "identifier=" "$config_file" | cut -d'=' -f2)
    splashColor=$(grep "splashColor=" "$config_file" | cut -d'=' -f2)
    
    # Si no se especifica color, usar blanco por defecto
    if [ -z "$splashColor" ]; then
        splashColor="#f3f6f9"
    fi

    jq --arg name "$name" '.expo.name = $name' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq --arg identifier "$identifier" '.expo.ios.bundleIdentifier = $identifier' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq --arg identifier "$identifier" '.expo.android.package = $identifier' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq --arg color "$splashColor" '.expo.splash.backgroundColor = $color' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq '.expo.splash.resizeMode = "cover"' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq --arg color "$splashColor" '.expo.android.splash.backgroundColor = $color' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq '.expo.android.splash.resizeMode = "cover"' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    jq --arg color "$splashColor" '.expo.android.adaptiveIcon.backgroundColor = $color' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    echo "✅ app.json actualizado"
fi

# Copiar assets
echo "🎨 Copiando assets..."
cp ./scripts/$1/assets/icon.png ./src/assets/icon.png || echo "⚠️  Icon file not found"
cp ./scripts/$1/assets/splash.png ./src/assets/splash.png || echo "⚠️  Splash file not found"
cp ./scripts/$1/assets/logo.png ./src/assets/logo.png || echo "⚠️  Logo file not found"
cp ./scripts/$1/assets/small-logo.png ./src/assets/small-logo.png || echo "⚠️  Small logo file not found"
cp ./scripts/$1/assets/adaptive-icon.png ./src/assets/adaptive-icon.png || echo "⚠️  Adaptive icon file not found"
cp ./scripts/$1/assets/animations/loading.mp4 ./src/assets/animations/loading.mp4 || echo "⚠️  loading.mp4 not found"
cp ./scripts/$1/assets/icons/ZkSyncIcon.js ./src/assets/icons/ZkSyncIcon.js || echo "⚠️  ZkSyncIcon.js not found"

# Copiar carpetas de assets
rm -rf ./src/assets/introduction 2>/dev/null
cp -r ./scripts/$1/assets/introduction ./src/assets 2>/dev/null || echo "⚠️  Introduction folder not found"

rm -rf ./src/assets/steps 2>/dev/null
cp -r ./scripts/$1/assets/steps ./src/assets 2>/dev/null || echo "⚠️  Steps folder not found"

echo "✅ Assets copiados"

# Prebuild expo
echo "⚙️  Prebuilding expo..."

# Limpieza segura de artefactos Android generados para forzar regeneración
echo "🧹 Limpiando artefactos Android generados (android/app/build, android/build, android/app/build/generated)..."
if [ -d "android/app/build" ] || [ -d "android/build" ] || [ -d "android/app/build/generated" ]; then
    rm -rf android/app/build android/build android/app/build/generated 2>/dev/null || true
    echo "✅ Artefactos Android eliminados"
else
    echo "ℹ️  No se encontraron artefactos Android a limpiar"
fi

expo prebuild --no-install


echo "✅ Configuración completada para ambiente: $1"

# --- Splash iOS automático ---
IOS_SRC="./scripts/$1/assets/splash-ios.png"
IOS_ASSETS="./src/assets/splash-ios.png"
IOS_DST="./ios/Sovra/Images.xcassets/splash-ios.imageset/splash-ios.png"
STORYBOARD="./ios/Sovra/SplashScreen.storyboard"

# 1. Copiar splash-ios.png a src/assets/
if [ -f "$IOS_SRC" ]; then
    cp "$IOS_SRC" "$IOS_ASSETS"
    echo "✅ splash-ios.png copiado a src/assets/"
else
    echo "⚠️  No se encontró splash-ios.png para iOS en $IOS_SRC"
fi

# 2. Copiar splash-ios.png a Images.xcassets
if [ -f "$IOS_ASSETS" ]; then
    mkdir -p "$(dirname "$IOS_DST")"
    cp "$IOS_ASSETS" "$IOS_DST"
    echo "✅ splash-ios.png copiado a Images.xcassets"
else
    echo "⚠️  No se encontró splash-ios.png en src/assets/ para copiar a Images.xcassets"
fi

# 3. Modificar storyboard solo si existe splash-ios.png en Images.xcassets
if [ -f "$IOS_DST" ] && [ -f "$STORYBOARD" ]; then
    sed -i '' 's/image="[^"]*"/image="splash-ios"/g' "$STORYBOARD"
    echo "✅ SplashScreen.storyboard actualizado para usar splash-ios"
elif [ ! -f "$IOS_DST" ]; then
    echo "⚠️  No se copió splash-ios.png a Images.xcassets, no se modifica storyboard"
elif [ ! -f "$STORYBOARD" ]; then
    echo "⚠️  No se encontró SplashScreen.storyboard en $STORYBOARD"
fi

# echo "Adding uri scheme"
# npx uri-scheme add didcomm
