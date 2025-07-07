pipeline {
    agent any
    
    environment {
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        dockerImagePrefix = "us-west1-docker.pkg.dev/lab-agibiz/docker-repository"
        registry = "https://us-west1-docker.pkg.dev"
        registryCredentials = "gcp-registry"
        KUBE_NAMESPACE = "lab-cmc"
    }
    
    stages {
        stage ("Inicio ultima tarea") {
            steps {
                sh 'echo "comenzado mi pipeline"'
            }
        }
        
        stage ("proceso de build y test") {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            stages {
                stage("instalacion de dependencias"){
                    steps {
                        sh 'npm ci'
                    }
                }
                stage("ejecucion de pruebas"){
                    steps {
                        sh 'npm run test:cov'
                    }
                }
                stage("construccion de la aplicacion"){
                    steps {
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage ("build y push de imagen docker"){
            steps {
                script {
                    docker.withRegistry("${registry}", registryCredentials ){
                        sh "docker build -t backend-nest-test-cmc ."
                        sh "docker tag backend-nest-test-cmc ${dockerImagePrefix}/backend-nest-test-cmc"
                        sh "docker tag backend-nest-test-cmc ${dockerImagePrefix}/backend-nest-test-cmc:${BUILD_NUMBER}"
                        sh "docker push ${dockerImagePrefix}/backend-nest-test-cmc"
                        sh "docker push ${dockerImagePrefix}/backend-nest-test-cmc:${BUILD_NUMBER}"
                    }
                }
            }
        }
        
        stage ("aplicar configuracion kubernetes"){
            agent {
                docker {
                    image 'alpine/k8s:1.30.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'gcp-kubeconfig']){
                    // Aplicar el archivo de configuración primero
                    sh """
                        kubectl apply -f kubernetes.yaml
                        kubectl rollout status deployment/backend-nest-test-cmc -n ${KUBE_NAMESPACE}
                    """
                }
            }
        }
        
        stage ("actualizacion de imagen en kubernetes"){
            agent {
                docker {
                    image 'alpine/k8s:1.30.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'gcp-kubeconfig']){
                    sh """
                        kubectl -n ${KUBE_NAMESPACE} set image deployments/backend-nest-test-cmc \
                        backend-nest-test-cmc=${dockerImagePrefix}/backend-nest-test-cmc:${BUILD_NUMBER} --record
                        
                        kubectl -n ${KUBE_NAMESPACE} rollout status deployment/backend-nest-test-cmc
                    """
                }
            }
        }
    }
}