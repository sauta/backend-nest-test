pipeline {
    agent any
    
    environment {
        NPM_CONFIG_CACHE= "${WORKSPACE}/.npm"
        dockerImagePrefix = "us-west1-docker.pkg.dev/lab-agibiz/docker-repository"
        registry = "https://us-west1-docker.pkg.dev"
        registryCredentials = "gcp-registry"
    }
    
    stages {
        stage('Instalacion de depencencias') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Correr Tests') {
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
                    docker.build("${registry}:${env.BUILD_NUMBER}")
                }
            }
        }
        
        stage('Push Docker Images') {
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
                    sh "kubectl -n lab-cmd set image deployments/backend-nest-cmc backend-nest-cmc=${dockerImagePrefix}/backend-nest-cmc:${BUILD_NUMBER}"
                }
            }
        }
    }
}