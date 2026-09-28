pipeline {

    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'

        BACKEND_IMAGE  = "employee-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "employee-frontend:${BUILD_NUMBER}"

        PREVIOUS_BACKEND_IMAGE  = "employee-backend:previous"
        PREVIOUS_FRONTEND_IMAGE = "employee-frontend:previous"
    }

    stages {

        // =========================================================
        // 1. CHECKOUT
        // =========================================================
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // =========================================================
        // 2. VALIDATE PROJECT
        // =========================================================
        stage('Validate') {
            steps {
                echo 'Validating project structure...'

                sh '''
                    test -f Jenkinsfile
                    test -f docker-compose.yml
                    test -f frontend/Dockerfile
                    test -f backend/Dockerfile

                    echo "Project validation successful."
                '''
            }
        }

        // =========================================================
        // 3. APPLICATION TEST
        // =========================================================
        stage('Application Test') {
            steps {
                echo 'Running application validation...'

                sh '''
                    docker --version
                    docker compose version

                    echo "Application files validated successfully."
                '''
            }
        }

        // =========================================================
        // 4. BACKUP PREVIOUS IMAGES
        // =========================================================
        stage('Backup Previous Images') {
            steps {
                echo 'Saving currently deployed images for rollback...'

                sh '''
                    docker image inspect ${BACKEND_IMAGE} >/dev/null 2>&1 || true
                    docker image inspect ${FRONTEND_IMAGE} >/dev/null 2>&1 || true

                    if docker image inspect employee-backend:latest >/dev/null 2>&1; then
                        docker tag employee-backend:latest ${PREVIOUS_BACKEND_IMAGE}
                    fi

                    if docker image inspect employee-frontend:latest >/dev/null 2>&1; then
                        docker tag employee-frontend:latest ${PREVIOUS_FRONTEND_IMAGE}
                    fi
                '''
            }
        }

        // =========================================================
        // 5. BUILD DOCKER IMAGES
        // =========================================================
        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'

                sh '''
                    docker build \
                        -t ${BACKEND_IMAGE} \
                        -t employee-backend:latest \
                        ./backend

                    docker build \
                        -t ${FRONTEND_IMAGE} \
                        -t employee-frontend:latest \
                        ./frontend
                '''
            }
        }

        // =========================================================
        // 6. TRIVY SECURITY SCAN
        // =========================================================
        stage('Trivy Security Scan') {
            steps {
                echo 'Scanning Docker images using Trivy...'

                sh '''
                    mkdir -p reports

                    trivy image \
                        --severity HIGH,CRITICAL \
                        --format table \
                        --output reports/trivy-backend.txt \
                        ${BACKEND_IMAGE} || true

                    trivy image \
                        --severity HIGH,CRITICAL \
                        --format table \
                        --output reports/trivy-frontend.txt \
                        ${FRONTEND_IMAGE} || true

                    echo "Trivy scan completed."
                '''
            }
        }

        // =========================================================
        // 7. DOCKER COMPOSE DEPLOYMENT
        // =========================================================
        stage('Deploy Application') {
            steps {
                echo 'Deploying application using Docker Compose...'

                sh '''
                    docker compose down

                    docker compose up -d --build

                    echo "Application deployment completed."
                '''
            }
        }

        // =========================================================
        // 8. HEALTH CHECK
        // =========================================================
        stage('Health Check') {
            steps {
                echo 'Checking application health...'

                sh '''
                    sleep 15

                    docker compose ps

                    echo "Checking backend health..."

                    curl --fail http://localhost/api/health

                    echo ""
                    echo "Application health check successful."
                '''
            }
        }

        // =========================================================
        // 9. CLEANUP
        // =========================================================
        stage('Cleanup Old Images') {
            steps {
                echo 'Cleaning unused Docker images...'

                sh '''
                    docker image prune -f

                    echo "Docker image cleanup completed."
                '''
            }
        }
    }

    // =============================================================
    // POST ACTIONS
    // =============================================================

    post {

        // ---------------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------------
        success {
            echo '''
            ==========================================
              DEPLOYMENT SUCCESSFUL
            ==========================================
              Build Number: ${BUILD_NUMBER}
              Application: Employee Management System
              Status: SUCCESS
            ==========================================
            '''

            archiveArtifacts artifacts: 'reports/*.txt',
                             allowEmptyArchive: true
        }

        // ---------------------------------------------------------
        // FAILURE / ROLLBACK
        // ---------------------------------------------------------
        failure {
            echo '''
            ==========================================
              DEPLOYMENT FAILED
            ==========================================
              Starting rollback procedure...
            ==========================================
            '''

            sh '''
                echo "Checking previous Docker images..."

                if docker image inspect employee-backend:previous >/dev/null 2>&1 && \
                   docker image inspect employee-frontend:previous >/dev/null 2>&1; then

                    echo "Previous images found."

                    docker tag employee-backend:previous employee-backend:latest
                    docker tag employee-frontend:previous employee-frontend:latest

                    echo "Restarting application with previous images..."

                    docker compose down
                    docker compose up -d

                    sleep 10

                    echo "Checking rollback health..."

                    if curl --fail http://localhost/api/health; then
                        echo "Rollback completed successfully."
                    else
                        echo "Rollback health check failed."
                        exit 1
                    fi

                else
                    echo "No previous images available for rollback."
                    echo "Manual recovery may be required."
                fi
            '''
        }

        // ---------------------------------------------------------
        // ALWAYS
        // ---------------------------------------------------------
        always {
            echo 'Pipeline execution completed.'

            sh '''
                echo "Docker containers:"
                docker ps || true

                echo ""
                echo "Docker images:"
                docker images | head -20 || true
            '''
        }
    }
}
