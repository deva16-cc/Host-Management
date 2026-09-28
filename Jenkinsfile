pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'employee-management'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    test -f docker-compose.yml
                    test -f frontend/Dockerfile
                    test -f backend/Dockerfile
                    test -f Jenkinsfile
                    echo "Required project files are present"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Application') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 15
                    curl --fail http://localhost/api/health
                    curl --fail http://localhost/api/employees
                '''
            }
        }

        stage('Show Status') {
            steps {
                sh 'docker-compose ps'
            }
        }
    }

    post {
        always {
            sh 'docker compose logs --tail=100 || true'
        }
    }
}
