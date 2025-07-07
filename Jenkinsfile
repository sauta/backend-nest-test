pipeline {
    agent any
    // escenarios -> escenario -> pasos
    environment{
        NPM_CONFIG_CACHE= "${WORKSPACE}/.npm"
        dockerImagePrefix = "us-west1-docker.pkg.dev/lab-agibiz/docker-repository"
        registry = "https://us-west1-docker.pkg.dev"
        registryCredentials = "gcp-registry"
    }
    stages{
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
                        sh "docker build -t backend-nest-cmc ."
                        sh "docker tag backend-nest-cmc ${dockerImagePrefix}/backend-nest-cmc"
                        sh "docker tag backend-nest-cmc ${dockerImagePrefix}/backend-nest-cmc:${BUILD_NUMBER}"
                        sh "docker push ${dockerImagePrefix}/backend-nest-cmc"
                        sh "docker push ${dockerImagePrefix}/backend-nest-cmc:${BUILD_NUMBER}"
                    }
                }
            }
        }
        stage ("actualizacion de kubernetes"){
            agent {
                docker {
                    image 'alpine/k8s:1.30.2'
                    reuseNode true
                }
            }
            steps {
                withKubeConfig([credentialsId: 'gcp-kubeconfig']){
                    sh "kubectl -n lab-cmd set image deployments/backend-nest-cmd backend-nest-cmd=${dockerImagePrefix}/backend-nest-cmd:${BUILD_NUMBER}"
                }
            }
        }
    }
}