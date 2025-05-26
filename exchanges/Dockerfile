# Usa una imagen oficial de Node
FROM node:20-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia archivos del proyecto
COPY package*.json ./
COPY index.js ./

# Instala dependencias
RUN npm install --production

# Expone el puerto (debe coincidir con el del `app.listen`)
EXPOSE 3000

# Comando por defecto para ejecutar la app
CMD ["node", "index.js"]