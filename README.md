# Sovra Wallet

Document and digital identity holder for citizens.

## Prerequisitos

Asegúrate de tener instaladas las siguientes versiones (o superiores):

- **Yarn**: 1.22.22
- **Node.js**: v20.19.4
- **npm**: 10.8.2
- **Java**: OpenJDK 17.0.16
- **Xcode**: 16.4 (solo macOS, para desarrollo iOS)
- **Expo CLI**: 54.0.16

### Instalación de herramientas

#### Node.js y npm
Puedes instalar Node.js y npm desde [nodejs.org](https://nodejs.org/).

#### Yarn
Instala Yarn globalmente:
```sh
npm install -g yarn
```

#### Java (OpenJDK)
En macOS puedes instalar OpenJDK usando Homebrew:
```sh
brew install openjdk@17
```
En Windows/Linux puedes descargarlo desde [Adoptium](https://adoptium.net/).

#### Xcode
Descarga Xcode desde la App Store (solo macOS).

#### Expo CLI
Instala Expo CLI globalmente:
```sh
npm install -g expo-cli
```

## Instalación del proyecto

1. Descomprime el archivo ZIP que te proporcionaron y abre la carpeta en tu editor.

2. Instala las dependencias:
```sh
yarn install
```

3. Aplica los parches:
```sh
yarn postinstall
```

4. Inicia el proyecto:
```sh
yarn start
```

5. Para correr en Android/iOS:
```sh
yarn android
# o
yarn ios
```

6. Para generar builds de Android:

- **APK debug:**
  ```sh
  yarn apk:debug
  ```
- **APK release:**
  ```sh
  yarn apk:release
  ```
- **AAB (Android App Bundle):**
  ```sh
  yarn aab
  ```
