# GurruContexto 🎯

> **Juego web de cercanía semántica y palabras en español para jugar individualmente o con amigos.**  
> 🌐 **Juega en vivo aquí:** [https://gurrucontext.netlify.app/](https://gurrucontext.netlify.app/)

---

## 📜 Reglas del Juego

**GurruContexto** es un juego de deducción por **cercanía semántica**. El objetivo principal es descubrir la **palabra secreta del día** en la menor cantidad de intentos posibles.

### 1. ¿Cómo funciona?
- Escribe cualquier palabra válida en español.
- El juego analiza el significado y contexto semántico de tu palabra comparada con la palabra secreta y le asigna un número de posición (**Ranking**).
- **Posición #1**: Es la palabra secreta.
- **Posición #2**: Es la palabra más cercana en significado a la palabra secreta.

### 2. Código de Colores
- 🟩 **Verde (#1 - #300)**: ¡Muy cerca! La palabra está en el mismo campo semántico u orquestación de significado.
- 🟨 **Amarillo (#301 - #1500)**: Tibio. Te estás acercando a la categoría correcta.
- 🔴 **Rojo (#1501+)**: Frío / Lejano. Significado distante.

### 3. Ejemplo
Si la palabra secreta del día es `CASA`:
- `HOGAR` ➡️ Posición **#4** 🟩
- `HABITACIÓN` ➡️ Posición **#28** 🟩
- `CONSTRUCCIÓN` ➡️ Posición **#410** 🟨
- `ASTRONAUTA` ➡️ Posición **#4120** 🔴

---

## 🔒 Privacidad y Pre-cálculo sin Spoilers

- **Palabra Secreta Encriptada (SHA-256):** La palabra del día **nunca** se guarda en texto plano dentro del código ni en los archivos JSON. Esto permite que el propio creador u host pueda jugar diariamente sin saber la palabra secreta.
- **Pre-cálculo Semántico Único:** El motor pre-calcula los vectores de similitud para más de 6,000 palabras en español en 16 categorías semánticas para garantizar respuestas instantáneas (60 FPS) en dispositivos móviles sin ralentizaciones.

---

## ⚡ Herramienta de Administración y Pre-cálculo

Para evitar que cualquier jugador pueda reiniciar o alterar el pre-cálculo del día desde la interfaz gráfica, el panel de administración está **oculto** y es accesible únicamente mediante URL privada:

👉 **Acceso privado:** [https://gurrucontext.netlify.app/?admin=true](https://gurrucontext.netlify.app/?admin=true) (o agregando `#admin` al final de la URL).

---

## 📤 Compartir Resultados

Cada jugador puede compartir su puntaje diario fácilmente usando el botón de compartir. Genera un formato limpio para WhatsApp, redes o chat:

```text
GurruContexto #104 🎯
Intentos: 14 | Mejor posición: #42
🟩 4  🟨 6  🟥 4
https://gurrucontext.netlify.app/
```

---

## 🛠️ Tecnologías y Despliegue

- **Frontend:** TypeScript, Vite, Vanilla HTML5 / CSS3 (Diseño Mobile-First con tema oscuro y glassmorphic accents).
- **Seguridad:** Web Crypto API (`SHA-256`).
- **Despliegue Continuo:** Conectado automáticamente con **Netlify** vía repositorio GitHub [sefsinalas/GurruContext](https://github.com/sefsinalas/GurruContext).

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar servidor local de desarrollo
npm run dev

# Compilar para producción (pre-calcula juegos y genera dist/)
npm run build
```
