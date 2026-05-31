pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'hardik795'
        FRONTEND_IMAGE = 'hardik795/frontend'
        BACKEND_IMAGE = 'hardik795/backend'
        EC2_HOST = '54.90.53.57'
        EC2_USER = 'ec2-user'
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Cloning repository'
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo 'Building frontend docker image'

                dir('frontend') {
                    sh '''
                        docker build \
                        -t $FRONTEND_IMAGE:latest .
                    '''
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo 'Building backend docker image'

                dir('Backend') {
                    sh '''
                        docker build \
                        -t $BACKEND_IMAGE:latest .
                    '''
                }
            }
        }

        stage('Push Images to DockerHub') {
            steps {
                echo 'Pushing images to DockerHub'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {

                    sh '''
                        echo $PASSWORD | docker login \
                        -u $USERNAME \
                        --password-stdin

                        docker push $FRONTEND_IMAGE:latest

                        docker push $BACKEND_IMAGE:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying application to EC2'

                sshagent(credentials: ['ec2-ssh-key']) {

                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                        $EC2_USER@$EC2_HOST << EOF

                        cd /home/ec2-user/app

                        echo "Stopping containers"
                        docker compose down || true

                        echo "Pulling latest images"
                        docker compose pull

                        echo "Starting containers"
                        docker compose up -d

                        echo "Cleaning old images"
                        docker image prune -af

                        docker ps

                        EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
        }

        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}