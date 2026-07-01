# Step 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Step 2: Build the Spring Boot Backend with Frontend Assets embedded
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src

# Copy the frontend build output into the Spring Boot static resources folder
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/

RUN mvn clean package -DskipTests

# Step 3: Package the runner image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Environment variables
ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
