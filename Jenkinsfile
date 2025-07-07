pipeline {
    agent any
    
    environment {
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        IMAGE_NAME = 'backend-nest-test-cmc'
        DOCKER_REGISTRY = "us-west1-docker.pkg.dev"
        DOCKER_REPO = "lab-agibiz/docker-repository"
        DOCKER_IMAGE_PREFIX = "${DOCKER_REGISTRY}/${DOCKER_REPO}"
        REGISTRY_CREDENTIALS = "gcp-registry"
        KUBE_NAMESPACE = "lab-cmc"  // Asegúrate que coincida con tu namespace
        KUBE_CONFIG_CREDENTIALS = "gcp-kubeconfig"
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        
        stage('Instalación de dependencias') {
            steps {
                sh 'npm ci'  // Mejor usar 'npm ci' para builds consistentes
            }
        }
        
        stage('Correr Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Construir con el nombre completo desde el inicio
                    docker.build("${DOCKER_IMAGE_PREFIX}/${IMAGE_NAME}:${env.BUILD_NUMBER}")
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", REGISTRY_CREDENTIALS) {
                        // Simplificar el proceso de tagging y push
                        docker.image("${DOCKER_IMAGE_PREFIX}/${IMAGE_NAME}:${env.BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_PREFIX}/${IMAGE_NAME}:${env.BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }
        
        stage('Actualización de Kubernetes') {
            agent {
                docker {
                    image 'alpine/k8s:1.30.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: KUBE_CONFIG_CREDENTIALS]) {
                    script {
                        // Comando más robusto para actualizar la imagen
                        sh """
                            kubectl -n ${KUBE_NAMESPACE} set image deployment/backend-nest-cmc \
                            backend-nest-cmc=${DOCKER_IMAGE_PREFIX}/${IMAGE_NAME}:${env.BUILD_NUMBER} \
                            --record
                            
                            kubectl -n ${KUBE_NAMESPACE} rollout status deployment/backend-nest-cmc
                            
                            # Verificación adicional
                            kubectl -n ${KUBE_NAMESPACE} get pods
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline ejecutado exitosamente!'
            echo "Imagen desplegada: ${DOCKER_IMAGE_PREFIX}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
        }
        failure {
            echo 'Pipeline falló! Revisar logs para detalles.'
        }
    }
}