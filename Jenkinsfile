pipeline {
    agent any
    
    environment {
        PROJECT_ID = 'your-project-id'
        IMAGE_NAME = 'backend-nest-test-cmc'
        REGISTRY = "gcr.io/${PROJECT_ID}/${IMAGE_NAME}"
        KUBE_CONFIG = credentials('k8s-config') // Ensure you have this credential set up in Jenkins
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${REGISTRY}:${env.BUILD_NUMBER}")
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://gcr.io', 'gcp-credentials') { // Ensure you have GCP credentials set up in Jenkins
                        docker.image("${REGISTRY}:${env.BUILD_NUMBER}").push()
                        docker.image("${REGISTRY}:${env.BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Update the deployment with the new image
                    sh """
                        kubectl set image deployment/backend-nest-test-cmc backend-nest-test-cmc=${REGISTRY}:${env.BUILD_NUMBER} --record
                        kubectl rollout status deployment/backend-nest-test-cmc
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}