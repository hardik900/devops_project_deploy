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

                sshagent(['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ec2-user@54.90.53.57 << 'EOF'

                    echo "Stopping containers"
                    docker compose -f /home/ec2-user/docker-compose.yml down

                    echo "Pulling latest images"
                    docker compose -f /home/ec2-user/docker-compose.yml pull

                    echo "Starting containers"
                    docker compose -f /home/ec2-user/docker-compose.yml up -d

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