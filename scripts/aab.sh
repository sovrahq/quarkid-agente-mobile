#!/bin/bash


# Script interactivo para compilar AAB y seleccionar versionCode y keystore
# Uso: yarn aab

GRADLE_FILE="./android/app/build.gradle"

# Preguntar por el versionCode
CURRENT_CODE=$(grep versionCode $GRADLE_FILE | head -1 | awk '{print $2}')
if [[ -z "$CURRENT_CODE" ]]; then
  echo "❌ No se encontró versionCode en $GRADLE_FILE"
  exit 1
fi
echo "El versionCode actual es: $CURRENT_CODE"
read -p "¿Qué versionCode quieres usar? (actual: $CURRENT_CODE): " NEW_CODE
if [[ -z "$NEW_CODE" ]]; then
  echo "❌ Debes ingresar un versionCode"
  exit 1
fi
if ! [[ "$NEW_CODE" =~ ^[0-9]+$ ]]; then
  echo "❌ El versionCode debe ser un número entero"
  exit 1
fi
if [[ "$NEW_CODE" == "$CURRENT_CODE" ]]; then
  echo "ℹ️ El versionCode no ha cambiado."
else
  sed -i '' "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/" $GRADLE_FILE
  echo "✅ versionCode actualizado: $CURRENT_CODE → $NEW_CODE"
fi

# Buscar keystores disponibles en la carpeta raíz 'keystores' (.keystore y .jks)
KEYSTORE_DIR="./keystores"
echo "Buscando keystores (.keystore y .jks) en $KEYSTORE_DIR..."
KEYSTORES=( )
while IFS= read -r file; do
  KEYSTORES+=("$file")
done < <(find "$KEYSTORE_DIR" -maxdepth 1 \( -name "*.keystore" -o -name "*.jks" \) -type f)
if [[ ${#KEYSTORES[@]} -eq 0 ]]; then
  echo "❌ No se encontraron archivos .keystore ni .jks en $KEYSTORE_DIR"
  exit 1
fi
echo "Keystores disponibles:"
for i in "${!KEYSTORES[@]}"; do
  echo "$((i+1)). ${KEYSTORES[$i]}"
done
read -p "Selecciona el número del keystore a usar: " KEYSTORE_INDEX
if ! [[ "$KEYSTORE_INDEX" =~ ^[0-9]+$ ]] || (( KEYSTORE_INDEX < 1 || KEYSTORE_INDEX > ${#KEYSTORES[@]} )); then
  echo "❌ Selección inválida"
  exit 1
fi
SELECTED_KEYSTORE="${KEYSTORES[$((KEYSTORE_INDEX-1))]}"
echo "🔑 Usando keystore: $SELECTED_KEYSTORE"

# Preguntar por contraseñas
read -s -p "Store password: " STORE_PASSWORD
echo
read -s -p "Key password (si no sabes, usa la misma que el store): " KEY_PASSWORD
echo

# Obtener alias automáticamente del keystore y mostrar todos los encontrados (soporte español)
echo "Buscando alias en el keystore seleccionado..."
keytool -list -keystore "$SELECTED_KEYSTORE" -storepass "$STORE_PASSWORD" 2>/dev/null | grep -E 'Alias name:|, PrivateKeyEntry'
KEY_ALIAS=$(keytool -list -keystore "$SELECTED_KEYSTORE" -storepass "$STORE_PASSWORD" 2>/dev/null | grep -E 'Alias name:|, PrivateKeyEntry' | head -n1 | awk -F',' '{print $1}' | sed 's/^ *//')
if [[ -z "$KEY_ALIAS" ]]; then
  echo "❌ No se pudo obtener el alias del keystore. Verifica la contraseña."
  exit 1
fi
echo "🔑 Alias que se usará: $KEY_ALIAS"

# Actualizar android/gradle.properties con los valores de signing
GRADLE_PROPERTIES_FILE="android/gradle.properties"
sed -i '' \
  -e "/^RELEASE_KEYSTORE_PATH=/d" \
  -e "/^RELEASE_KEYSTORE_PASSWORD=/d" \
  -e "/^RELEASE_KEY_ALIAS=/d" \
  -e "/^RELEASE_KEY_PASSWORD=/d" \
  "$GRADLE_PROPERTIES_FILE"
echo "RELEASE_KEYSTORE_PATH=$(realpath "$SELECTED_KEYSTORE")" >> "$GRADLE_PROPERTIES_FILE"
echo "RELEASE_KEYSTORE_PASSWORD=$STORE_PASSWORD" >> "$GRADLE_PROPERTIES_FILE"
echo "RELEASE_KEY_ALIAS=$KEY_ALIAS" >> "$GRADLE_PROPERTIES_FILE"
echo "RELEASE_KEY_PASSWORD=$KEY_PASSWORD" >> "$GRADLE_PROPERTIES_FILE"

# Ejecuta el build normal usando los datos ingresados
cd android && ./gradlew bundleRelease
