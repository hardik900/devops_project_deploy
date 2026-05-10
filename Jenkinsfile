pipeline {
    agent any
    environment{
        DOCKERHUB_USERNAME = 'hardik795'
        FRONTEND_IMAGE = 'hardik795/frontend'
        BACKEND_IMAGE = 'hardik795/backend'
    } 
    stages{

        stage('Checkout Code'){
            steps{
                echo 'Cloning Repository'
                checkout scm
            }
        }

        stage('Build Frontend Image'){
            steps{
                echo 'Building Frontend Docker image'
                dir('frontend'){
                    sh 'docker build -t $FRONTEND_IMAGE:latest .'
                }
            }
        }

        stage('Build Backend Image'){
            steps{
                echo 'Building Backend Docker image'
                dir('Backend'){
                    sh 'docker build -t $BACKEND_IMAGE:latest .'
                }
            }
        }

        stage('Push to Docker Hub'){
            steps{
                echo 'Pushing image to docker hub'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD',
                )]){
                    sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                    sh 'docker push $FRONTEND_IMAGE:latest'
                    sh 'docker push $BACKEND_IMAGE:latest'
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Deploying application'
                sh '''
                    echo "Deploying application"
                    docker-compose down || true
                    docker-compose pull
                    docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo 'pipeline completed successfully'
        }
        failure {
            echo 'pipeline failed. Check logs above'
        }
    }
}
